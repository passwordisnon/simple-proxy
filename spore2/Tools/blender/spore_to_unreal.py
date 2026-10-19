"""Batch-converts spore2-scan OBJ exports into Unreal-ready FBX files.

Runs inside Blender, without its window:

    blender -b --factory-startup -P spore_to_unreal.py -- --out OUT_DIR [options] IN_DIR...

Options:
    --out DIR          where the .fbx files go (folder layout mirrors the input, names made
                       safe for Unreal: only letters, digits, _ and -)
    --shard I/N        convert only every N-th file starting at I, so N Blender processes can
                       run side by side (the pipeline script does this)
    --origin keep      keep the model's own origin (default; parts are placed by their origin)
    --origin bottom    move the origin to the bottom centre (whole creations, buildings, ...)
    --force            convert again even when the .fbx is newer than its .obj

For every .obj: import (Spore axes, Z up), drop degenerate faces and loose vertices, join the
pieces into one mesh named after the file, apply transforms, and export FBX with its textures
embedded, so Unreal creates the materials and textures on import. Scene units are metres;
Unreal's FBX import turns 1 m into 100 cm, the same 100x scale the plugin assumes.

Each shard writes manifest-<I>-of-<N>.json into OUT_DIR: converted files (vertex, triangle,
material and texture counts) and failures with their reason. One broken file never stops the
batch.
"""

import json
import os
import re
import sys
import time
import traceback

import bpy  # first: with the standalone bpy module, bmesh only exists after bpy is imported
import bmesh


def parse_args(argv):
    args = argv[argv.index("--") + 1:] if "--" in argv else []
    opts = {"out": None, "shard": (0, 1), "origin": "keep", "force": False, "inputs": []}
    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "--out" and i + 1 < len(args):
            opts["out"] = args[i + 1]
            i += 1
        elif arg == "--shard" and i + 1 < len(args):
            index, count = args[i + 1].split("/")
            opts["shard"] = (int(index), max(1, int(count)))
            i += 1
        elif arg == "--origin" and i + 1 < len(args):
            opts["origin"] = args[i + 1]
            i += 1
        elif arg == "--force":
            opts["force"] = True
        else:
            opts["inputs"].append(arg)
        i += 1
    if not opts["out"] or not opts["inputs"] or opts["origin"] not in ("keep", "bottom"):
        sys.exit(__doc__)
    return opts


def safe(name):
    return re.sub(r"[^A-Za-z0-9_\-]", "_", name)


def output_path(in_root, obj_path, out_root):
    """<in_root>/pkg/group~/name.rw4.obj -> <out_root>/<in_root name>/pkg/group_/name.fbx"""
    rel = os.path.relpath(obj_path, in_root).split(os.sep)
    folders = [safe(os.path.basename(os.path.normpath(in_root)))] + [safe(p) for p in rel[:-1]]
    stem = rel[-1][:-len(".obj")].replace(".rw4", "").replace(".gmdl", "_gmdl")
    return os.path.join(out_root, *folders, safe(stem) + ".fbx")


def find_objs(inputs):
    found = []
    for root in inputs:
        for dirpath, _, files in os.walk(root):
            for name in files:
                if name.lower().endswith(".obj"):
                    found.append((root, os.path.join(dirpath, name)))
    found.sort(key=lambda item: item[1])
    return found


def up_to_date(obj_path, fbx_path):
    if not os.path.exists(fbx_path):
        return False
    newest = os.path.getmtime(obj_path)
    mtl = obj_path[:-len(".obj")] + ".mtl"
    if os.path.exists(mtl):
        newest = max(newest, os.path.getmtime(mtl))
    return os.path.getmtime(fbx_path) >= newest


def clean_mesh(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.dissolve_degenerate(bm, dist=1e-7, edges=bm.edges[:])
    loose = [v for v in bm.verts if not v.link_faces]
    if loose:
        bmesh.ops.delete(bm, geom=loose, context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()


def move_origin_to_bottom(obj):
    coords = [v.co for v in obj.data.vertices]
    if not coords:
        return
    min_z = min(c.z for c in coords)
    centre_x = (min(c.x for c in coords) + max(c.x for c in coords)) / 2
    centre_y = (min(c.y for c in coords) + max(c.y for c in coords)) / 2
    for v in obj.data.vertices:
        v.co.x -= centre_x
        v.co.y -= centre_y
        v.co.z -= min_z


def convert(obj_path, fbx_path, origin):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    # spore2-scan writes Spore's own axes (Z up), so import without rotating.
    bpy.ops.wm.obj_import(filepath=obj_path, forward_axis="Y", up_axis="Z")
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not meshes:
        return None, "no mesh in the OBJ"
    for obj in meshes:
        clean_mesh(obj)

    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    name = os.path.splitext(os.path.basename(fbx_path))[0]
    obj.name = name
    obj.data.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if origin == "bottom":
        move_origin_to_bottom(obj)

    triangles = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    if triangles == 0:
        return None, "no faces left after cleanup"
    textures = sorted({node.image.name for mat in obj.data.materials if mat and mat.node_tree
                       for node in mat.node_tree.nodes if node.type == "TEX_IMAGE" and node.image})

    os.makedirs(os.path.dirname(fbx_path), exist_ok=True)
    bpy.ops.export_scene.fbx(
        filepath=fbx_path,
        use_selection=False,
        object_types={"MESH"},
        apply_unit_scale=True,
        apply_scale_options="FBX_SCALE_UNITS",
        axis_forward="-Z",
        axis_up="Y",
        mesh_smooth_type="FACE",
        use_mesh_modifiers=True,
        path_mode="COPY",
        embed_textures=True,
    )
    return {
        "vertices": len(obj.data.vertices),
        "triangles": triangles,
        "materials": len([m for m in obj.data.materials if m]),
        "textures": textures,
    }, None


def main():
    opts = parse_args(sys.argv)
    index, count = opts["shard"]
    work = [item for n, item in enumerate(find_objs(opts["inputs"])) if n % count == index]
    manifest = {"converted": [], "skipped_up_to_date": 0, "failed": []}
    started = time.time()
    for n, (root, obj_path) in enumerate(work, 1):
        fbx_path = output_path(root, obj_path, opts["out"])
        if not opts["force"] and up_to_date(obj_path, fbx_path):
            manifest["skipped_up_to_date"] += 1
            continue
        t0 = time.time()
        try:
            info, error = convert(obj_path, fbx_path, opts["origin"])
        except Exception:  # keep going; record why this one failed
            info, error = None, traceback.format_exc(limit=1).strip().splitlines()[-1]
        if info:
            info.update({"source": obj_path, "fbx": fbx_path, "seconds": round(time.time() - t0, 2)})
            manifest["converted"].append(info)
        else:
            manifest["failed"].append({"source": obj_path, "error": error})
        if n % 100 == 0:
            print(f"[shard {index}/{count}] {n}/{len(work)} files", flush=True)

    manifest["seconds"] = round(time.time() - started, 1)
    os.makedirs(opts["out"], exist_ok=True)
    with open(os.path.join(opts["out"], f"manifest-{index}-of-{count}.json"), "w") as out:
        json.dump(manifest, out, indent=1)
    print(f"[shard {index}/{count}] converted {len(manifest['converted'])}, up to date "
          f"{manifest['skipped_up_to_date']}, failed {len(manifest['failed'])}", flush=True)


if __name__ == "__main__":
    main()
