/* =================== KIT: CC0-Bausätze (Kenney, KayKit) im Cozy-Stil ===================
   Die Teile liegen vorverarbeitet in assets/kits/<pack>.json (tools/kitpack.py).
   Jede Quellfarbe wird einer Rolle zugeordnet (Holz, Stein, Dach …) und mit einer Hauspalette neu eingefärbt;
   die Helligkeitsabstufungen des Originals bleiben erhalten. Dazu Toon-Material + Konturhülle wie überall im Spiel. */
const KIT=(()=>{
  /* Ankerfarben der Kenney-/KayKit-Farbtafeln → Rolle */
  const ANCH=[
    ['wood','#c48060'],['wood','#bf6f4c'],['wood','#b46849'],['wood','#c1734f'],['woodL','#e48b63'],['woodL','#e68e64'],
    ['wood2','#8d5541'],['wood2','#865440'],['wood2','#a27663'],
    ['sand','#ecb993'],['sand','#f4cea4'],['sand','#fadfc0'],['sand','#eec49c'],['sandD','#d89972'],['sandD','#da9c75'],['sandD','#d99b74'],
    ['stone','#8d94b2'],['stone','#989ebf'],['stone','#9096b5'],['stone','#7d84a0'],['stone','#848aa5'],
    ['wall','#b7c0e6'],['wall','#b1bce6'],['wall','#bdc6ed'],
    ['trim','#d7d7e5'],['trim','#dcdce9'],['trim','#dadae7'],['trim','#d5d5e4'],['snow','#deeef9'],
    ['metal','#767b92'],['metal','#6c7188'],['metal','#7a7f96'],['metal','#777b90'],['metalD','#5a5c6d'],['metalD','#535667'],
    ['dark','#3c3c42'],['dark','#40414b'],
    ['plant','#41a579'],['plant','#45af7d'],['plant','#4fb982'],['plantD','#268e6d'],['plantD','#258567'],
    ['roof','#4fad95'],['roofB','#7089d3'],['roofB','#585ec0'],['roofB','#6693d8'],
    ['roof2','#e65059'],['roof2','#c7495a'],['roof2','#cf4b5a'],['roof2','#ba3d46'],['roof2','#e24d41'],['roof2','#d8574a'],['roof2','#c75a5c'],
    ['light','#fea83f'],['light','#fecc5d'],['light','#fec047'],['light','#fea138'],['light','#fe9941'],['light','#fb7641'],
    /* Space-Bausatz eigene Farben */['light','#fecf7c'],['trim','#eceff4'],['wall','#d6dbe3'],['trim','#fefefe'],['metal','#8e949d'],
    ['glass','#79dbfd'],['glass','#a2c3ee'],['glass','#739edd'],['glass','#95b9e9'],['glass','#729ddc']];
  const lum=c=>.2126*c.r+.7152*c.g+.0722*c.b;
  const A=ANCH.map(([role,h])=>{const c=new THREE.Color(h);const hsl={};c.getHSL(hsl);return{role,c,hsl,L:lum(c)}});
  /* Abstand im Farbton/Sättigung/Helligkeit – Farbton zählt mehr als Helligkeit */
  function classify(hex){const c=new THREE.Color(hex);const h={};c.getHSL(h);let best=null,bd=1e9;
    for(const a of A){let dh=Math.abs(h.h-a.hsl.h);dh=Math.min(dh,1-dh);const sw=Math.min(h.s,a.hsl.s);const d=dh*dh*9*sw*4+Math.pow(h.s-a.hsl.s,2)*2.5+Math.pow(h.l-a.hsl.l,2)*1.2;if(d<bd){bd=d;best=a}}
    return{role:best.role,shade:Math.max(.62,Math.min(1.35,lum(c)/Math.max(.02,best.L)))}}

  /* Standardpalette = Originalfarben */
  const BASE={wood:'#c48060',woodL:'#e48b63',wood2:'#8d5541',sand:'#f0c49a',sandD:'#d89972',stone:'#8d94b2',wall:'#b7c0e6',trim:'#dadae7',snow:'#e6f2fb',
    metal:'#767b92',metalD:'#5a5c6d',dark:'#3c3c42',plant:'#45af7d',plantD:'#268e6d',roof:'#4fad95',roofB:'#7089d3',roof2:'#e65059',light:'#fec047',glass:'#95c9ee'};
  const packs={},loading={};
  function load(name){if(packs[name])return Promise.resolve(packs[name]);if(loading[name])return loading[name];
    return loading[name]=fetch('assets/kits/'+name+'.json').then(r=>r.json()).then(d=>{const sh=SHIFT[name];for(const k in d){unpack(d[k]);d[k].cls=d[k].pal.map(p=>classify(p[0]));
      if(sh){const P=d[k].p;for(let i=0;i<P.length;i+=3){P[i]+=sh[0]*1000;P[i+2]+=sh[2]*1000}const b=d[k].b;b[0]+=sh[0];b[3]+=sh[0];b[2]+=sh[2];b[5]+=sh[2]}}packs[name]=d;return d})}
  /* Kompaktform (tools/kitbin.py): P int16, C uint8, I uint16/uint32 als base64 */
  function b64(s,T){const b=atob(s);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new T(u.buffer)}
  function unpack(v){if(v.P){v.p=b64(v.P,Int16Array);v.c=b64(v.C,Uint8Array);v.i=Array.from(b64(v.I,v.iw===4?Uint32Array:Uint16Array));delete v.P;delete v.C;delete v.I}}
  /* Erweiterung <pack>-x.json: alle Teile, die nicht schon beim Start gebraucht werden (Fundus) */
  const extLoading={};
  function loadExt(name){if(extLoading[name])return extLoading[name];return extLoading[name]=load(name).then(()=>fetch('assets/kits/'+name+'-x.json')).then(r=>r.ok?r.json():{}).then(d=>{const sh=SHIFT[name];const P=packs[name];
    for(const k in d){unpack(d[k]);d[k].cls=d[k].pal.map(p=>classify(p[0]));if(sh){const Q=d[k].p;for(let i=0;i<Q.length;i+=3){Q[i]+=sh[0]*1000;Q[i+2]+=sh[2]*1000}const b=d[k].b;b[0]+=sh[0];b[3]+=sh[0];b[2]+=sh[2];b[5]+=sh[2]}P[k]=d[k]}return P}).catch(()=>packs[name])}
  /* Bausätze mit Ursprung in der Kachelecke auf die Mitte schieben */const SHIFT={space:[-2,0,-1.5]};
  const has=(pack,name)=>!!(packs[pack]&&packs[pack][name.split('#')[0]]);
  const geoCache=new Map();
  function palKey(pal){return Object.keys(pal).sort().map(k=>k+(typeof pal[k]==='object'?JSON.stringify(pal[k]):pal[k])).join('')}
  /* Geometrie mit Rollenfarben; flache Normalen für die Fläche, weiche Normalen für die Konturhülle */
  /* Namenszusatz '#cap': nur Dreiecke oberhalb der Stiel-Höhe (Pilzhut ohne Stiel) */
  function geo(pack,name0,pal){const[name,mod]=name0.split('#');const P0=packs[pack]&&packs[pack][name];if(!P0)return null;const key=pack+'/'+name0+'/'+palKey(pal);if(geoCache.has(key))return geoCache.get(key);
    let P=P0;if(mod==='cap'){const I=[];for(let t=0;t<P0.i.length;t+=3){const ys=[P0.i[t],P0.i[t+1],P0.i[t+2]].map(v=>P0.p[v*3+1]/1000);if(Math.max(...ys)>.03)I.push(P0.i[t],P0.i[t+1],P0.i[t+2])}P=Object.assign({},P0,{i:I})}
    const n=P.p.length/3;const pos=new Float32Array(n*3);for(let i=0;i<n*3;i++)pos[i]=P.p[i]/1000;
    /* pal==='orig': Originalfarben des Bausatzes behalten (Natur-Bausatz ist schon pastellig) */
    const cols=pal.lum?P.pal.map(p=>{const c=new THREE.Color(p[0]);const l=.2126*c.r+.7152*c.g+.0722*c.b;const t=new THREE.Color(l<.12?pal.lum[0]:l<.32?pal.lum[1]:pal.lum[2]);const sh=.85+Math.min(.3,l*.4);return[t.r*sh,t.g*sh,t.b*sh]}):pal.byHex?P.pal.map(p=>{const c=new THREE.Color(pal.byHex[p[0]]||p[0]);return[c.r,c.g,c.b]}):pal.orig?P.pal.map(p=>{const c=new THREE.Color(p[0]);c.offsetHSL(0,-.04,-.02);return[c.r,c.g,c.b]}):P.cls.map(({role,shade})=>{const c=new THREE.Color(pal[role]||BASE[role]||'#ff00ff');return[c.r*shade,c.g*shade,c.b*shade]});
    const col=new Float32Array(n*3);for(let i=0;i<n;i++){const c=cols[P.c[i]];col[i*3]=Math.min(1,c[0]);col[i*3+1]=Math.min(1,c[1]);col[i*3+2]=Math.min(1,c[2])}
    let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(P.i);
    g=g.toNonIndexed();g.computeVertexNormals();g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    /* Hülle: gleiche Punkte, geglättete Normalen, dunklere Randfarbe */
    let h=new THREE.BufferGeometry();h.setAttribute('position',new THREE.BufferAttribute(pos.slice(),3));h.setIndex(P.i);h=THREE.BufferGeometryUtils.mergeVertices(h,1e-3);h.computeVertexNormals();h=h.toNonIndexed();
    const hn=h.attributes.position.count;const hc=new Float32Array(hn*3);const ow=new Float32Array(hn).fill(OUTLINE_BASE*.7);const oc=new THREE.Color(pal.line||'#4a3a5e');for(let i=0;i<hn;i++){hc[i*3]=oc.r;hc[i*3+1]=oc.g;hc[i*3+2]=oc.b}
    h.setAttribute('color',new THREE.BufferAttribute(hc,3));h.setAttribute('ow',new THREE.BufferAttribute(ow,1));h.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(hn*2),2));
    const r={g,h,b:P.b};geoCache.set(key,r);return r}
  function mesh(pack,name,pal){const G=geo(pack,name,pal||BASE);if(!G)return null;const m=new THREE.Mesh(G.g,vcMat(true,true));m.castShadow=true;m.receiveShadow=true;
    const hull=new THREE.Mesh(G.h,vcHull());hull.userData.hull=true;hull.raycast=()=>{};m.add(hull);m.userData.kit=pack+'/'+name;return m}
  function bounds(pack,name){const P=packs[pack]&&packs[pack][name.split('#')[0]];if(!P)return null;return name.endsWith('#cap')?[P.b[0],.02,P.b[2],P.b[3],P.b[4],P.b[5]]:P.b}
  function names(pack){return packs[pack]?Object.keys(packs[pack]):[]}
  const ORIG={orig:true,line:'#4a3a5e'};
  return{load,loadExt,mesh,geo,bounds,names,has,classify,BASE,ANCH,ORIG}
})();
