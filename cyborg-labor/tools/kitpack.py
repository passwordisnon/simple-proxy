#!/usr/bin/env python3
"""Packs selected CC0 kit models (Kenney GLB, KayKit glTF) into compact JSON for Cyborg-Labor.

Every vertex gets the colour it shows in the source (material colour x texture at its UV).
Colours are clustered into a small palette per piece and each palette entry is tagged with a
role (wall, roof, wood, stone, glass, metal, plant, accent, dark) so the game can recolour
pieces with planet palettes while keeping the original light/dark detail.

usage: kitpack.py <out.json> <kitdir> <piece> [<piece> ...]   (piece = file name without extension)
"""
import json, struct, sys, os, math, colorsys, base64, io
from PIL import Image

def load_gltf(path):
    if path.endswith('.glb'):
        b = open(path, 'rb').read()
        off = 12; js = None; binc = None
        while off < len(b):
            ln, typ = struct.unpack('<II', b[off:off+8]); chunk = b[off+8:off+8+ln]
            if typ == 0x4E4F534A: js = json.loads(chunk)
            elif typ == 0x004E4942: binc = chunk
            off += 8 + ln
        bufs = [binc]
    else:
        js = json.load(open(path)); bufs = []
        for bf in js['buffers']:
            uri = bf['uri']
            if uri.startswith('data:'): bufs.append(base64.b64decode(uri.split(',', 1)[1]))
            else: bufs.append(open(os.path.join(os.path.dirname(path), uri), 'rb').read())
    return js, bufs

CT = {5120: 'b', 5121: 'B', 5122: 'h', 5123: 'H', 5125: 'I', 5126: 'f'}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

def accessor(js, bufs, i):
    a = js['accessors'][i]; bv = js['bufferViews'][a['bufferView']]
    buf = bufs[bv.get('buffer', 0)]; n = NC[a['type']]; fmt = CT[a['componentType']]
    size = struct.calcsize(fmt); stride = bv.get('byteStride') or size * n
    base = bv.get('byteOffset', 0) + a.get('byteOffset', 0); out = []
    norm = a.get('normalized', False)
    for k in range(a['count']):
        o = base + k * stride
        v = struct.unpack('<' + fmt * n, buf[o:o + size * n])
        if norm and fmt in 'BH': v = tuple(x / (255 if fmt == 'B' else 65535) for x in v)
        out.append(v)
    return out

def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return (aw*bx + ax*bw + ay*bz - az*by, aw*by - ax*bz + ay*bw + az*bx, aw*bz + ax*by - ay*bx + az*bw, aw*bw - ax*bx - ay*by - az*bz)

def mat_from_node(n):
    if 'matrix' in n:
        m = n['matrix']; return [[m[0], m[4], m[8], m[12]], [m[1], m[5], m[9], m[13]], [m[2], m[6], m[10], m[14]], [0, 0, 0, 1]]
    t = n.get('translation', [0, 0, 0]); r = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1])
    x, y, z, w = r
    R = [[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]]
    return [[R[0][0]*s[0], R[0][1]*s[1], R[0][2]*s[2], t[0]], [R[1][0]*s[0], R[1][1]*s[1], R[1][2]*s[2], t[1]], [R[2][0]*s[0], R[2][1]*s[1], R[2][2]*s[2], t[2]], [0, 0, 0, 1]]

def mm(a, b): return [[sum(a[i][k]*b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
def ap(m, p): return tuple(m[i][0]*p[0] + m[i][1]*p[1] + m[i][2]*p[2] + m[i][3] for i in range(3))

TEXC = {}
def texture(js, bufs, path, ti):
    key = (path, ti)
    if key in TEXC: return TEXC[key]
    tex = js['textures'][ti]; img = js['images'][tex['source']]
    if 'uri' in img:
        p = os.path.join(os.path.dirname(path), img['uri'])
        if not os.path.exists(p):  # Kenney GLB -> Textures/colormap.png
            p = os.path.join(os.path.dirname(path), 'Textures', os.path.basename(img['uri']))
        im = Image.open(p).convert('RGB')
    else:
        bv = js['bufferViews'][img['bufferView']]; data = bufs[bv.get('buffer', 0)][bv.get('byteOffset', 0):bv.get('byteOffset', 0)+bv['byteLength']]
        im = Image.open(io.BytesIO(data)).convert('RGB')
    TEXC[key] = im; return im

def srgb(c): return c  # colours are kept in sRGB 0..1

def lin2srgb(x): return 12.92*x if x <= .0031308 else 1.055*x**(1/2.4) - .055

def role_of(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r, g, b); hd = h * 360
    if l < .16: return 'dark'
    if s < .14:
        return 'wall' if l > .72 else ('stone' if l > .38 else 'metal')
    if 170 <= hd <= 215 and l > .55: return 'glass'
    if 18 <= hd <= 45 and s < .75 and l < .62: return 'wood'
    if 75 <= hd <= 165: return 'plant'
    if l > .68 and s < .55: return 'wall'
    if (hd < 18 or hd > 330) or (200 <= hd <= 290): return 'roof'
    if 45 < hd < 75: return 'accent'
    return 'wood' if l < .5 else 'wall'

def piece(path):
    js, bufs = load_gltf(path)
    scene = js['scenes'][js.get('scene', 0)]
    P = []; C = []; I = []
    def walk(ni, M):
        n = js['nodes'][ni]; M2 = mm(M, mat_from_node(n))
        if 'mesh' in n:
            for prim in js['meshes'][n['mesh']]['primitives']:
                pos = accessor(js, bufs, prim['attributes']['POSITION'])
                uv = accessor(js, bufs, prim['attributes']['TEXCOORD_0']) if 'TEXCOORD_0' in prim['attributes'] else None
                col = accessor(js, bufs, prim['attributes']['COLOR_0']) if 'COLOR_0' in prim['attributes'] else None
                mat = js['materials'][prim['material']] if 'material' in prim else {}
                pbr = mat.get('pbrMetallicRoughness', {}); bc = pbr.get('baseColorFactor', [1, 1, 1, 1])
                im = texture(js, bufs, path, pbr['baseColorTexture']['index']) if 'baseColorTexture' in pbr else None
                base = len(P)
                for k, p in enumerate(pos):
                    P.append(ap(M2, p))
                    r, g, b = lin2srgb(bc[0]), lin2srgb(bc[1]), lin2srgb(bc[2])
                    if im is not None and uv is not None:
                        u, v = uv[k]; W, H = im.size
                        px = im.getpixel((min(W-1, max(0, int((u % 1.0) * W))), min(H-1, max(0, int((v % 1.0) * H)))))
                        r, g, b = r*px[0]/255, g*px[1]/255, b*px[2]/255
                    if col is not None:
                        c = col[k]; r, g, b = r*lin2srgb(c[0]), g*lin2srgb(c[1]), b*lin2srgb(c[2])
                    C.append((r, g, b))
                if 'indices' in prim: idx = [i[0] for i in accessor(js, bufs, prim['indices'])]
                else: idx = list(range(len(pos)))
                # negative determinant flips winding
                det = M2[0][0]*(M2[1][1]*M2[2][2]-M2[1][2]*M2[2][1]) - M2[0][1]*(M2[1][0]*M2[2][2]-M2[1][2]*M2[2][0]) + M2[0][2]*(M2[1][0]*M2[2][1]-M2[1][1]*M2[2][0])
                for t in range(0, len(idx), 3):
                    a, b2, c = idx[t], idx[t+1], idx[t+2]
                    I.extend((base+a, base+c, base+b2) if det < 0 else (base+a, base+b2, base+c))
        for ch in n.get('children', []): walk(ch, M2)
    I4 = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
    for ni in scene['nodes']: walk(ni, I4)
    return P, C, I

def piece_obj(path):
    """Wavefront OBJ + MTL (Quaternius): Farbe je Material aus Kd."""
    mats = {}; cur = None
    mtl = os.path.splitext(path)[0] + '.mtl'
    if os.path.exists(mtl):
        for ln in open(mtl, errors='ignore'):
            t = ln.split()
            if not t: continue
            if t[0] == 'newmtl': cur = ' '.join(t[1:]); mats[cur] = (.8, .8, .8)
            elif t[0] == 'Kd' and cur:
                c = tuple(lin2srgb(float(x)) for x in t[1:4])
                # graue Platzhalter für Textur-Materialien: Farbe aus dem Namen
                low = cur.lower(); hint = next((v for k, v in (('leaf', (.42, .72, .36)), ('green', (.48, .76, .4)), ('grass', (.5, .78, .4)), ('moss', (.45, .7, .38))) if k in low), None)
                if hint and max(c) - min(c) < .05: c = hint
                mats[cur] = c
    V = []; P = []; C = []; I = []; col = (.8, .8, .8)
    for ln in open(path, errors='ignore'):
        t = ln.split()
        if not t: continue
        if t[0] == 'v': V.append(tuple(float(x) for x in t[1:4]))
        elif t[0] == 'usemtl': col = mats.get(' '.join(t[1:]), (.8, .8, .8))
        elif t[0] == 'f':
            ids = [int(x.split('/')[0]) for x in t[1:]]
            ids = [i - 1 if i > 0 else len(V) + i for i in ids]
            base = len(P)
            for i in ids: P.append(V[i]); C.append(col)
            for k in range(1, len(ids) - 1): I.extend((base, base + k, base + k + 1))
    return P, C, I

def pack(P, C, I):
    # palette: quantise colours, then tag roles
    pal = []; pidx = []; look = {}
    for (r, g, b) in C:
        key = (round(r*40), round(g*40), round(b*40))
        if key not in look:
            look[key] = len(pal); pal.append((r, g, b))
        pidx.append(look[key])
    mn = [min(p[i] for p in P) for i in range(3)]; mx = [max(p[i] for p in P) for i in range(3)]
    q = 1000  # millimetre precision
    return {
        'b': [round(v, 3) for v in mn + mx],
        'p': [int(round(v*q)) for p in P for v in p],
        'i': I,
        'c': pidx,
        'pal': [['#%02x%02x%02x' % tuple(int(max(0, min(1, x))*255) for x in col), role_of(*col)] for col in pal]}

def main():
    out, kit = sys.argv[1], sys.argv[2]; names = sys.argv[3:]
    res = {}
    for n in names:
        path = None
        for root, _, files in os.walk(kit):
            for f in files:
                if os.path.splitext(f)[0] == n and f.endswith(('.glb', '.gltf', '.obj')):
                    path = os.path.join(root, f); break
            if path: break
        if not path: print('missing', n, file=sys.stderr); continue
        res[n] = pack(*(piece_obj(path) if path.endswith('.obj') else piece(path)))
    json.dump(res, open(out, 'w'), separators=(',', ':'))
    print(out, len(res), 'pieces', os.path.getsize(out)//1024, 'KB')

if __name__ == '__main__': main()
