/* =====================================================================
   CYBORG-LABOR · core.js
   Cozy-Toon-Stil: Geometrie-Helfer, Materialien, Outlines, Kreatur-Bau.
   Alle Teile-Dateien (parts-*.js) bauen auf diesen Helfern auf.
   ===================================================================== */
THREE.ColorManagement.legacyMode=false;
const TAU=Math.PI*2, PI=Math.PI, V3=THREE.Vector3;
let QF=1; const Q=n=>Math.max(5,Math.round(n*QF));

/* ---------- Farbpalette (gemütlich, pastellig aber satt) ---------- */
const PAL={
  cream:'#FFF4DC', ivory:'#FFFBF0', white:'#FFFDF7', peach:'#FFC9A8', apricot:'#FFB27A', blush:'#FF9EAA', pink:'#FF8FB8', rose:'#F2789A',
  coral:'#FF7E6B', strawberry:'#F0556E', cherry:'#D94257', orange:'#FF9E45', honey:'#F7B84B', lemon:'#FFE27A', butter:'#FFF1A8',
  mint:'#A6EBC3', leaf:'#7CC46A', grass:'#8FD36B', moss:'#5E9B4A', forest:'#3F7F4F', teal:'#56C6B6', aqua:'#7FDCE6', sky:'#8FD3FF',
  blue:'#6AA8F0', navy:'#4B5E9C', lilac:'#C6A9FF', lavender:'#B7B4FF', grape:'#8E6BD1', berry:'#B04A8A', plum:'#6E4A7E',
  wood:'#C98C5A', oak:'#DDAA72', bark:'#7B5236', choc:'#8A5A44', sand:'#F2D9A6', clay:'#E0876A', terracotta:'#D46A4C',
  stone:'#BDB6C8', slate:'#8D89A6', steel:'#AEB9C8', ink:'#3B3450', shadow:'#5B5170', bone:'#F3E9D2', cheek:'#FF8FA3'
};

/* ---------- Geometrie ---------- */
const G={
  s:(r)=>new THREE.SphereGeometry(r,Q(28),Q(18)),
  hs:(r)=>new THREE.SphereGeometry(r,Q(28),Q(10),0,TAU,0,PI/2),
  cy:(rt,rb,h,open)=>new THREE.CylinderGeometry(rt,rb,h,Q(24),1,!!open),
  co:(r,h)=>new THREE.ConeGeometry(r,h,Q(18)),
  bx:(w,h,d,rad)=>rad?new THREE.RoundedBoxGeometry(w,h,d,Math.max(2,Math.round(4*QF)),Math.min(rad,Math.min(w,h,d)/2-1e-3)):new THREE.BoxGeometry(w,h,d),
  to:(R,t,arc)=>new THREE.TorusGeometry(R,t,Q(12),Q(40),arc||TAU),
  ca:(r,len)=>new THREE.CapsuleGeometry(r,Math.max(1e-3,len),Q(8),Q(18)),
  la:(pts,seg)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg||Q(32)),
  pl:(w,h)=>new THREE.PlaneGeometry(w,h,1,1),
  ico:(r,d)=>new THREE.IcosahedronGeometry(r,d||0),
  oct:(r)=>new THREE.OctahedronGeometry(r,0),
  ring:(a,b)=>new THREE.RingGeometry(a,b,Q(40)),
  circ:(r)=>new THREE.CircleGeometry(r,Q(32)),
  ex:(shape,depth,bev)=>new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:!!bev,bevelThickness:bev||0,bevelSize:bev||0,bevelSegments:3,curveSegments:Q(16)}),
  /* weich extrudiert: dicke, gerundete 2D-Form (Flügel, Blätter, Flossen) */
  puff:(shape,depth,bev)=>{bev=bev??depth*.45;const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:QF<.35?1:Math.max(2,Math.round(4*QF)),curveSegments:Math.max(3,Math.round(18*QF))});g.translate(0,0,-depth/2);g.computeVertexNormals();return g},
  sh:(shape)=>new THREE.ShapeGeometry(shape,Q(16)),
  tu:(pts,r1,r2,seg)=>tube(pts,r1,r2??r1,seg),
  blob:(r,amp,f,seed)=>blob(r,amp,f,seed),
  /* Bohne / Tropfen / Herz / Stern als Volumen */
  bean:(r,len)=>new THREE.CapsuleGeometry(r,Math.max(1e-3,len),Q(8),Q(18)),
  drop:(r,h)=>new THREE.LatheGeometry(range(Q(14),(t)=>new THREE.Vector2(Math.sin(t*PI)*r*(1-t*.35)+1e-4,-Math.cos(t*PI)*r*.9+t*t*h)),Q(24)),
  heart:(s,d)=>{const h=new THREE.Shape();h.moveTo(0,-.9*s);h.bezierCurveTo(-.2*s,-.6*s,-1*s,-.2*s,-.95*s,.35*s);h.bezierCurveTo(-.9*s,.95*s,-.2*s,1.05*s,0,.5*s);h.bezierCurveTo(.2*s,1.05*s,.9*s,.95*s,.95*s,.35*s);h.bezierCurveTo(1*s,-.2*s,.2*s,-.6*s,0,-.9*s);return G.puff(h,d||s*.35)},
  star:(R,r,n,d)=>{const pts=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU+PI/2;const rr=i%2?r:R;pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}return G.puff(sshp(pts.map((p,i)=>p)),d||R*.3,(d||R*.3)*.4)}
};
function tube(pts,r1,r2,seg){
  const c=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0],p[1],p[2])));const n=seg||Q(36),rs=Q(12);
  const g=new THREE.TubeGeometry(c,n,1,rs,false);const pos=g.attributes.position;const v=new V3();
  for(let i=0;i<=n;i++){const cp=c.getPointAt(i/n);const rr=r1+(r2-r1)*(i/n);for(let j=0;j<=rs;j++){const k=i*(rs+1)+j;v.fromBufferAttribute(pos,k).sub(cp).multiplyScalar(rr).add(cp);pos.setXYZ(k,v.x,v.y,v.z)}}
  g.computeVertexNormals();g.userData.openTube=true;return g;
}
function blob(r,amp,f,seed){
  const g=new THREE.SphereGeometry(r,Q(40),Q(28));const pos=g.attributes.position;const v=new V3();seed=seed||1;
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);const n=v.clone().normalize();
    const d=Math.sin(n.x*f*1.3+seed)*Math.sin(n.y*f+seed*2.1)*Math.cos(n.z*f*.9+seed*.7)+.5*Math.sin(n.x*f*2.7-n.z*f*2.1+seed);
    v.addScaledVector(n,d*amp*r);pos.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();return g;
}
function P(g,geo,mat,p,r,sc){const m=new THREE.Mesh(geo,mat);if(p)m.position.set(p[0],p[1],p[2]);if(r)m.rotation.set(r[0]||0,r[1]||0,r[2]||0);
  if(sc!=null){if(typeof sc==='number')m.scale.setScalar(sc);else m.scale.set(sc[0],sc[1],sc[2])}m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function grp(g,p,r){const n=new THREE.Group();if(p)n.position.set(p[0],p[1],p[2]);if(r)n.rotation.set(r[0]||0,r[1]||0,r[2]||0);g.add(n);return n}
function bt(g,a,b,rad,mat,rad2){const A=new V3(...a),B=new V3(...b);const len=A.distanceTo(B)||1e-3;const geo=new THREE.CylinderGeometry(rad2??rad,rad,len,Q(14));
  const m=new THREE.Mesh(geo,mat);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new V3(0,1,0),B.clone().sub(A).normalize());m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
/* bt mit runden Enden (Knochen/Gliedmasse) */
function limbSeg(g,a,b,rad,mat,rad2){const m=bt(g,a,b,rad,mat,rad2);P(g,G.s(rad),mat,a);P(g,G.s(rad2??rad),mat,b);return m}
function chain(g,pts,r1,r2,mat){const n=pts.length;return pts.map((p,i)=>P(g,G.s(r1+(r2-r1)*i/Math.max(1,n-1)),mat,p))}
function both(f){f(-1);f(1)}
function range(n,f){const o=[];for(let i=0;i<n;i++)o.push(f(n>1?i/(n-1):0,i));return o}
function shp(pts){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);return s}
function sshp(pts){const s=new THREE.Shape();const n=pts.length;const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];const m0=mid(pts[n-1],pts[0]);s.moveTo(m0[0],m0[1]);
  for(let i=0;i<n;i++){const p=pts[i],m=mid(p,pts[(i+1)%n]);s.quadraticCurveTo(p[0],p[1],m[0],m[1])}return s}
function gearShape(R,teeth,depth){const pts=[];for(let i=0;i<teeth*4;i++){const a=i/(teeth*4)*TAU;const rr=(i%4<2)?R:R-depth;pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}const s=shp(pts);const h=new THREE.Path();h.absarc(0,0,R*.35,0,TAU,true);s.holes.push(h);return s}
const srand=(seed)=>{let sd=(seed|0)||7;return()=>{sd=(sd*16807)%2147483647;return sd/2147483647}};
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- Canvas-Texturen ---------- */
const TEXC={};
function ctex(key,w,h,draw){if(TEXC[key])return TEXC[key];const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;TEXC[key]=t;return t}

/* ---------- Toon-Shading ---------- */
const TOON_RAMP=(()=>{const d=new Uint8Array([95,95,95,255, 150,150,150,255, 215,215,215,255, 255,255,255,255]);const t=new THREE.DataTexture(d,4,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})();
const PBR_ONLY=['roughness','metalness','clearcoat','clearcoatRoughness','sheen','sheenColor','sheenRoughness','iridescence','iridescenceIOR','iridescenceThicknessRange','transmission','thickness','ior','envMapIntensity','bumpMap','bumpScale','specularIntensity','flatShading'];
/* Cozy-Material: MeshToon + weicher Randlicht-Schimmer + optionaler Glanzpunkt (Plastik, Lack, Augen) */
function cozy(o){
  o=Object.assign({},o||{});for(const k of PBR_ONLY)delete o[k];if(typeof o.emissive==='string'){}const rim=o.rim??.35, gloss=o.gloss??0, rimCol=new THREE.Color(o.rimColor||'#fff6ec');
  delete o.rim;delete o.gloss;delete o.rimColor;
  const m=new THREE.MeshToonMaterial(Object.assign({gradientMap:TOON_RAMP},o));
  m.userData.rim=rim;m.userData.gloss=gloss;
  m.onBeforeCompile=s=>{s.uniforms.uRim={value:rim};s.uniforms.uGloss={value:gloss};s.uniforms.uRimCol={value:rimCol};
    s.fragmentShader='uniform float uRim;uniform float uGloss;uniform vec3 uRimCol;\n'+s.fragmentShader.replace('#include <output_fragment>',
    `{float nv=clamp(dot(geometry.normal,geometry.viewDir),0.0,1.0);float rm=smoothstep(0.62,0.95,1.0-nv);outgoingLight+=uRimCol*rm*uRim*0.55;
     #if NUM_DIR_LIGHTS > 0
     if(uGloss>0.0){vec3 L=directionalLights[0].direction;vec3 H=normalize(L+geometry.viewDir);float sp=smoothstep(0.986,0.993,dot(geometry.normal,H));outgoingLight+=vec3(1.0)*sp*uGloss*0.6;}
     #endif
     }
     #include <output_fragment>`)};
  m.customProgramCacheKey=()=>'cozy';return m;
}
/* Matcap für Metalle & Schimmer: gemalte Kugel mit Bändern */
function matcapTex(key,stops,hi){return ctex('mc-'+key,256,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);stops.forEach(([p,c])=>g.addColorStop(p,c));x.fillStyle=g;x.fillRect(0,0,w,h);
  const r=x.createRadialGradient(w*.5,h*.5,w*.3,w*.5,h*.5,w*.5);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,'rgba(40,30,60,.35)');x.fillStyle=r;x.fillRect(0,0,w,h);
  x.fillStyle=hi||'rgba(255,255,255,.95)';x.beginPath();x.ellipse(w*.36,h*.3,w*.11,h*.07,-.6,0,TAU);x.fill();x.globalAlpha=.6;x.beginPath();x.ellipse(w*.62,h*.22,w*.035,h*.025,-.6,0,TAU);x.fill();x.globalAlpha=1})}
const MATCAPS={
  chrome:()=>matcapTex('chrome',[[0,'#ffffff'],[.38,'#cfe6ff'],[.5,'#7d8aa8'],[.56,'#c9b9a6'],[.8,'#f3efe8'],[1,'#b4b0c0']]),
  steel:()=>matcapTex('steel',[[0,'#f1f4f8'],[.45,'#bcc6d4'],[.52,'#8b93a6'],[.8,'#c9ced8'],[1,'#9aa0b0']]),
  gold:()=>matcapTex('gold',[[0,'#fff7d6'],[.35,'#ffd66b'],[.5,'#c98a2b'],[.6,'#ffcf5a'],[.85,'#fff0b8'],[1,'#d59a3a']]),
  copper:()=>matcapTex('copper',[[0,'#ffe3cf'],[.35,'#f0a070'],[.5,'#a8583a'],[.62,'#e8905e'],[.85,'#ffd0b0'],[1,'#b66a48']]),
  holo:()=>matcapTex('holo',[[0,'#fff'],[.2,'#ffc6f0'],[.4,'#b8c8ff'],[.55,'#9ff0e0'],[.75,'#fff3a8'],[1,'#ffb8d8']]),
  pearl:()=>matcapTex('pearl',[[0,'#ffffff'],[.4,'#f3eefc'],[.55,'#dcd6ee'],[.8,'#fff8f2'],[1,'#e6e0f0']])
};
function metal(kind){const m=new THREE.MeshMatcapMaterial({matcap:(MATCAPS[kind]||MATCAPS.chrome)()});m.userData.metal=kind;return m}

/* Kompatibilität: alte Teile riefen Rausch-/Bump-Texturen auf (im Toon-Stil nicht mehr genutzt) */
function bumpTex(){return null}
function noiseTex(key,base){return ctex('nz-'+key,4,4,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h)})}
/* ---------- Muster-Texturen für Häute ---------- */
const SKIN_COLORS=['#F6C4A8','#E3A07E','#B87858','#7A4E3A','#FFE0CC','#BDE6A6','#A9C9F5','#D9B5F2','#FF9E45','#56C6B6','#9C7BE0','#FFD85A','#F0556E','#5B8DEF','#6FAF5C','#FFA8C5','#FFF6E6','#4A4458'];
const COLORABLE=['haut','fell','pluesch','schuppen','plastik','keramik','koralle','schleim','latex'];
const PATTERNS=[{id:'keine',n:'Kein Muster'},{id:'bauch',n:'Heller Bauch'},{id:'streifen',n:'Streifen'},{id:'tiger',n:'Tigerstreifen'},{id:'punkte',n:'Punkte'},{id:'flecken',n:'Flecken'},{id:'verlauf',n:'Verlauf'},{id:'ringe',n:'Ringe'},{id:'herzen',n:'Herzchen'},{id:'sterne',n:'Sternchen'},{id:'karo',n:'Karo'}];
const FURSKINS={fell:.06,pluesch:.045,moos:.035};
function patternTex(pat,a,b){return ctex('pat-'+pat+a+b,512,256,(x,w,h)=>{x.fillStyle=a;x.fillRect(0,0,w,h);x.fillStyle=b;x.strokeStyle=b;const rnd=srand(pat.length*97+3);
  if(pat==='bauch'){x.save();x.beginPath();x.ellipse(w*.25,h*.62,w*.13,h*.3,0,0,TAU);x.fill();x.restore()}
  else if(pat==='streifen'){for(let i=0;i<10;i++){x.beginPath();const y0=i*h/10;x.moveTo(0,y0);for(let u=0;u<=w;u+=16)x.lineTo(u,y0+Math.sin(u*.03+i)*5);x.lineTo(w,y0+h/22);for(let u=w;u>=0;u-=16)x.lineTo(u,y0+h/22+Math.sin(u*.03+i)*5);x.fill()}}
  else if(pat==='tiger'){for(let i=0;i<26;i++){const u=rnd()*w,y=rnd()*h,len=40+rnd()*50;x.beginPath();x.moveTo(u,y-len/2);x.quadraticCurveTo(u+16+rnd()*10,y,u,y+len/2);x.quadraticCurveTo(u+7,y,u,y-len/2);x.fill()}}
  else if(pat==='punkte'){for(let j=0;j<8;j++)for(let i=0;i<16;i++){x.beginPath();x.arc(i*32+(j%2)*16+8,j*32+16,7,0,TAU);x.fill()}}
  else if(pat==='flecken'){for(let i=0;i<18;i++){const u=rnd()*w,y=rnd()*h,r=16+rnd()*24;x.beginPath();for(let k=0;k<12;k++){const a=k/12*TAU,rr=r*(.75+rnd()*.35);x.lineTo(u+Math.cos(a)*rr,y+Math.sin(a)*rr*.8)}x.closePath();x.fill()}}
  else if(pat==='verlauf'){const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,b);g.addColorStop(.55,a);g.addColorStop(1,a);x.fillStyle=g;x.fillRect(0,0,w,h)}
  else if(pat==='ringe'){for(let i=0;i<28;i++){x.lineWidth=5;x.beginPath();x.arc(rnd()*w,rnd()*h,10+rnd()*10,0,TAU);x.stroke()}}
  else if(pat==='herzen'){for(let j=0;j<6;j++)for(let i=0;i<12;i++){const u=i*43+(j%2)*21+10,y=j*43+18,s=9;x.beginPath();x.moveTo(u,y+s);x.bezierCurveTo(u-s*1.6,y,u-s*.6,y-s*1.1,u,y-s*.3);x.bezierCurveTo(u+s*.6,y-s*1.1,u+s*1.6,y,u,y+s);x.fill()}}
  else if(pat==='sterne'){for(let j=0;j<6;j++)for(let i=0;i<12;i++){const u=i*43+(j%2)*21+10,y=j*43+20;x.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU-PI/2,r=k%2?4:10;x.lineTo(u+Math.cos(a)*r,y+Math.sin(a)*r)}x.fill()}}
  else if(pat==='karo'){x.globalAlpha=.55;for(let i=0;i<16;i++){x.fillRect(i*32,0,16,h)}for(let j=0;j<8;j++){x.fillRect(0,j*32,w,16)}x.globalAlpha=1}})}
function toonTex(key,base,draw){return ctex('tt-'+key,256,256,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);draw(x,w,h,srand(key.length*31+5))})}
const SKIN_TEX={
  moos:()=>toonTex('moos','#6DAE55',(x,w,h,r)=>{for(let i=0;i<220;i++){x.fillStyle=pick(['#86C667','#5B9A48','#A6D97E']);x.beginPath();x.arc(r()*w,r()*h,3+r()*8,0,TAU);x.fill()}for(let i=0;i<14;i++){x.fillStyle='#FFE27A';x.beginPath();x.arc(r()*w,r()*h,2.5,0,TAU);x.fill()}}),
  kompost:()=>toonTex('kompost','#8A5E42',(x,w,h,r)=>{for(let i=0;i<160;i++){x.fillStyle=pick(['#6F4A34','#A8784F','#7CC46A','#E8C27A']);x.beginPath();x.ellipse(r()*w,r()*h,3+r()*7,2+r()*4,r()*3,0,TAU);x.fill()}}),
  marmor:()=>toonTex('marmor','#F6F1EA',(x,w,h,r)=>{x.strokeStyle='#D8D0DE';x.lineWidth=3;for(let i=0;i<9;i++){x.beginPath();let px=r()*w,py=0;x.moveTo(px,py);for(let k=0;k<8;k++){px+=(r()-.5)*60;py+=h/8;x.lineTo(px,py)}x.stroke()}}),
  holz:()=>toonTex('holz','#D69A62',(x,w,h,r)=>{for(let i=0;i<22;i++){x.strokeStyle=i%2?'#C1864F':'#E4AE77';x.lineWidth=4+(i%3)*2;x.beginPath();x.moveTo(0,i*12);x.bezierCurveTo(w*.3,i*12+8,w*.6,i*12-8,w,i*12+3);x.stroke()}}),
  patina:()=>toonTex('patina','#6FC2AE',(x,w,h,r)=>{for(let i=0;i<120;i++){x.fillStyle=pick(['#D08A55','#58AE9A','#9BE0CF']);x.beginPath();x.arc(r()*w,r()*h,3+r()*9,0,TAU);x.fill()}}),
  rost:()=>toonTex('rost','#C8703E',(x,w,h,r)=>{for(let i=0;i<140;i++){x.fillStyle=pick(['#A95A30','#E08A4E','#8C7A70']);x.beginPath();x.arc(r()*w,r()*h,3+r()*8,0,TAU);x.fill()}}),
  myzel:()=>toonTex('myzel','#F6EEDC',(x,w,h,r)=>{x.strokeStyle='#E4D6BA';x.lineWidth=2;for(let i=0;i<40;i++){x.beginPath();x.moveTo(r()*w,r()*h);x.quadraticCurveTo(r()*w,r()*h,r()*w,r()*h);x.stroke()}}),
  knochen:()=>toonTex('knochen','#F3E9D2',(x,w,h,r)=>{for(let i=0;i<50;i++){x.fillStyle='#E6D8BA';x.beginPath();x.arc(r()*w,r()*h,2+r()*3,0,TAU);x.fill()}})
};
const SKINS=[
 {id:'haut',n:'Haut',k:'org',sw:'#F6C4A8'},{id:'chrom',n:'Chrom',k:'masch',sw:'#DDE6F2'},{id:'gold',n:'Gold',k:'masch',sw:'#F7C75A'},{id:'plastik',n:'Glanz-Plastik',k:'masch',sw:'#FFFDF7'},
 {id:'latex',n:'Lack',k:'ding',sw:'#4A4458'},{id:'holo',n:'Holografisch',k:'masch',sw:'#D8C8FF'},{id:'moos',n:'Moos',k:'pflanze',sw:'#6DAE55'},{id:'schuppen',n:'Schuppen',k:'tier',sw:'#56C6B6'},
 {id:'kompost',n:'Kompost',k:'pflanze',sw:'#8A5E42'},{id:'marmor',n:'Marmor',k:'ding',sw:'#F6F1EA'},{id:'keramik',n:'Keramik',k:'ding',sw:'#7FB2E0'},{id:'glas',n:'Glas',k:'ding',sw:'#CFEFFF'},
 {id:'schleim',n:'Schleim',k:'tier',sw:'#A6E36A'},{id:'holz',n:'Holz',k:'pflanze',sw:'#D69A62'},{id:'knochen',n:'Knochen',k:'org',sw:'#F3E9D2'},{id:'patina',n:'Kupfer-Patina',k:'masch',sw:'#6FC2AE'},
 {id:'koralle',n:'Koralle',k:'tier',sw:'#FF8E7A'},{id:'fell',n:'Fell',k:'tier',sw:'#C99A6E'},{id:'pluesch',n:'Plüsch',k:'ding',sw:'#FFA8C5'},{id:'myzel',n:'Myzel',k:'pflanze',sw:'#F6EEDC'},{id:'rost',n:'Rost',k:'masch',sw:'#C8703E'}
];
function skinMaterial(b){
  const base=SKIN_COLORS[b.color]||SKIN_COLORS[0];const pat=b.pattern&&b.pattern!=='keine'&&COLORABLE.includes(b.skin)?patternTex(b.pattern,base,SKIN_COLORS[b.color2??16]||'#fff'):null;const col=pat?'#ffffff':base;
  const T=(o,rim,gloss)=>cozy(Object.assign(o,{rim:rim??.35,gloss:gloss??0}));
  switch(b.skin){
    case 'chrom':return metal('chrome');
    case 'gold':return metal('gold');
    case 'holo':return metal('holo');
    case 'plastik':return T({color:col,map:pat},.3,1);
    case 'latex':return T({color:pat?col:(b.color===0?'#4A4458':base),map:pat},.5,1.2);
    case 'moos':return T({color:'#ffffff',map:SKIN_TEX.moos()},.5);
    case 'schuppen':return T({color:col,map:pat||ctex('scale',256,256,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='rgba(60,50,90,.18)';x.lineWidth=4;for(let j=0;j<9;j++)for(let i=0;i<9;i++){x.beginPath();x.arc(i*32+(j%2)*16,j*30,15,0,PI);x.stroke()}})},.4,.6);
    case 'kompost':return T({color:'#ffffff',map:SKIN_TEX.kompost()},.25);
    case 'marmor':return T({color:'#ffffff',map:SKIN_TEX.marmor()},.35,.6);
    case 'keramik':return T({color:col,map:pat},.3,1);
    case 'glas':{const m=cozy({color:'#d8f3ff',transparent:true,opacity:.45,depthWrite:false,rim:1.4,gloss:1.2});m.userData.glass=true;return m}
    case 'schleim':{const m=cozy({color:col,map:pat,transparent:true,opacity:.82,rim:.9,gloss:1.3});return m}
    case 'holz':return T({color:'#ffffff',map:SKIN_TEX.holz()},.25);
    case 'knochen':return T({color:'#ffffff',map:SKIN_TEX.knochen()},.3);
    case 'patina':return T({color:'#ffffff',map:SKIN_TEX.patina()},.4,.5);
    case 'koralle':return T({color:col,map:pat},.5);
    case 'pluesch':return T({color:col,map:pat},.8);
    case 'fell':return T({color:col,map:pat},.7);
    case 'myzel':return T({color:'#ffffff',map:SKIN_TEX.myzel()},.6);
    case 'rost':return T({color:'#ffffff',map:SKIN_TEX.rost()},.3);
    default:return T({color:col,map:pat},.4);
  }
}
/* Plüsch-/Fell-Schalen (weicher Flaum) */
function strandTex(){return ctex('strands',512,256,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);const r=srand(5);for(let i=0;i<22000;i++){const v=Math.floor(r()*255);x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(r()*w,r()*h,2,2)}})}
function furShell(base,i,n,len,map){const t=i/n;const m=new THREE.MeshToonMaterial({gradientMap:TOON_RAMP,color:base.clone().multiplyScalar(.82+.28*t),map:map||null,alphaMap:strandTex(),alphaTest:.15+.8*t});
  const off=(len*t).toFixed(4);m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed += normal * '+off+';')};m.customProgramCacheKey=()=>'fur'+off;m.userData.fur=true;return m}
function addFur(g,skinMat,body,s,q){const len=(FURSKINS[body.skin]||0)*s;if(!len||q<.5)return;const n=q>.8?8:4;const base=skinMat.map?new THREE.Color('#ffffff'):skinMat.color.clone();
  const mats=range(n,(t,i)=>furShell(base,i+1,n,len,skinMat.map));const list=[];g.traverse(o=>{if(o.isMesh&&o.material===skinMat&&!o.userData.hull){o.geometry.computeBoundingSphere();if(o.geometry.boundingSphere.radius*Math.max(o.scale.x,o.scale.y)>.07)list.push(o)}});
  for(const o of list)for(const m of mats){const sh=new THREE.Mesh(o.geometry,m);sh.position.copy(o.position);sh.quaternion.copy(o.quaternion);sh.scale.copy(o.scale);sh.castShadow=false;sh.receiveShadow=true;sh.userData.furShell=true;sh.userData.noOutline=true;o.parent.add(sh)}}

/* ---------- Material-Satz für Teile ---------- */
function makeMats(body,ghost){
  const C={};const k=(key,f)=>C[key]||(C[key]=f());
  if(ghost){const gm=new THREE.MeshBasicMaterial({color:'#B9AFCF',transparent:true,opacity:.22,depthWrite:false});gm.userData.ghost=true;const f=()=>gm;return new Proxy({},{get:()=>f});}
  const T=(key,o)=>k(key,()=>cozy(o));
  const M={
    skin:()=>k('skin',()=>{const mm=skinMaterial(body);mm.userData.skin=true;return mm}),
    /* Grund-Toon: m.c(farbe,{gloss,rim,opacity,side,map,emissive}) */
    c:(color,o)=>T('c|'+color+'|'+(o?JSON.stringify(o):''),Object.assign({color},o||{},(o&&o.opacity!=null&&o.opacity<1)?{transparent:true,depthWrite:false}:{})),
    dbl:(color,o)=>T('d|'+color+'|'+(o?JSON.stringify(o):''),Object.assign({color,side:THREE.DoubleSide},o||{},(o&&o.opacity!=null&&o.opacity<1)?{transparent:true,depthWrite:false}:{})),
    toon:(color,o)=>M.c(color,o),
    gloss:(color)=>T('gl|'+color,{color,gloss:1.1,rim:.35}),
    plush:(color)=>T('pl|'+color,{color,rim:.9,rimColor:'#ffffff'}),
    metal:(kind)=>k('m-'+kind,()=>metal(kind)),
    chrome:()=>M.metal('chrome'),steel:()=>M.metal('steel'),gold:()=>M.metal('gold'),copper:()=>M.metal('copper'),holo:()=>M.metal('holo'),pearl:()=>M.metal('pearl'),
    black:()=>T('black',{color:PAL.ink,gloss:.8,rim:.5,rimColor:'#b8a6ff'}),
    white:()=>T('white',{color:PAL.white,gloss:.9,rim:.3}),
    rubber:()=>T('rubber',{color:'#4A4458',rim:.25}),
    bone:()=>T('bone',{color:PAL.bone,rim:.35}),
    wood:()=>k('wood',()=>skinMaterial({skin:'holz'})),
    leaf:(col)=>T('leaf|'+(col||''),{color:col||PAL.leaf,side:THREE.DoubleSide,rim:.5,rimColor:'#eaffb0'}),
    glass:(tint)=>k('glass|'+(tint||''),()=>{const m=cozy({color:tint||'#dff6ff',transparent:true,opacity:.32,depthWrite:false,rim:1.5,gloss:1.3});m.userData.glass=true;return m}),
    glow:(color,i)=>k('g'+color+(i||2),()=>{const m=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(Math.max(1,(i||2)*.55)),toneMapped:false});m.userData.glow=true;return m}),
    flat:(color)=>k('f'+color,()=>{const m=new THREE.MeshBasicMaterial({color,toneMapped:false});m.userData.flat=true;return m}),
    slime:(col)=>T('sl'+(col||''),{color:col||'#A6E36A',transparent:true,opacity:.82,depthWrite:true,rim:1,gloss:1.3}),
    crystal:(col)=>T('cr'+col,{color:col||PAL.lilac,flatShading:true,transparent:true,opacity:.85,rim:1.2,gloss:1.3}),
    chitin:(col)=>T('ch'+col,{color:col||PAL.grape,gloss:1.2,rim:.6,rimColor:'#c8f0ff'}),
    eye:()=>T('eye',{color:'#2E2A3E',gloss:1.4,rim:.2}),
    cheek:()=>k('cheek',()=>{const m=new THREE.MeshBasicMaterial({color:PAL.cheek,transparent:true,opacity:.55,depthWrite:false});m.userData.noOutline=true;return m}),
    tex:(key,tex,o)=>T('t'+key,Object.assign({map:tex,color:'#ffffff'},o||{}))
  };
  return M;
}

/* ---------- Gesichts-Helfer (für Köpfe & Augen) ---------- */
/* Glänzendes Kulleraugen-Oval im Tierdorf-Stil. Gibt die Gruppe zurück. */
function cuteEye(g,c,x,y,z,r,o){o=o||{};const m=c.m;const e=grp(g,[x,y,z]);
  const ball=P(e,G.s(r),o.mat||m.eye(),[0,0,0],null,[o.w||.82,o.h||1.08,.5]);
  if(o.iris){P(e,G.s(r*.55),m.c(o.iris,{gloss:1}),[0,-r*.2,r*.28],null,[.9,.9,.45])}
  if(o.hl!==false){P(e,G.s(r*.26),m.flat('#ffffff'),[r*.22,r*.36,r*.42]);P(e,G.s(r*.12),m.flat('#ffffff'),[-r*.2,-r*.3,r*.44])}
  if(o.blink!==false)c.an(t=>{const ph=(t*.9+x*2.3)%5.2;e.scale.y=ph<.13?.1:1});
  if(o.look)c.an(t=>{e.rotation.y=Math.sin(t*.7+x)*.3;e.rotation.x=Math.sin(t*.5)*.18});
  return e}
function cheeks(g,c,o){o=o||{};const H=c.H;const y=o.y??(H.faceY-H.r*.28),sp=o.sp??.62,z=H.front*(o.z??.86);
  both(x=>{const m=P(g,G.s(H.r*.15),c.m.cheek(),[x*H.r*sp,y,z],[0,x*.55,0],[1.2,.7,.25]);m.userData.noOutline=true;m.castShadow=false})}
/* Mund: 'smile' | 'open' | 'cat' | 'o' | 'beak' */
/* Sprechende Teile ohne echten Mund: Schnabel/Kiefer klappt (hinge), Lippen/Membran pumpt (pulse) */
function talkPart(o,mode,amp){o.userData.mouth=true;o.userData.mode=mode;o.userData.amp=amp;o.userData.r0=o.rotation.x;o.userData.s0=o.scale.x;return o}
function mouth(g,c,kind,o){o=o||{};const H=c.H,m=c.m;const y=o.y??(H.faceY-H.r*.42),z=o.zAbs??H.front*(o.z??.94),w=H.r*(o.w??.16);
  /* Mund als eigene Gruppe: beim Sprechen öffnet er sich (sichtbarer Innenmund, Kiefer-Wippen) */
  const q=new THREE.Group();q.position.set(o.x||0,y,z);q.userData.mouth=true;q.userData.y0=y;q.userData.w=w;g.add(q);
  if(kind==='open'){P(q,G.s(w*1.1),m.c('#B8475F'),[0,0,0],null,[1.2,.9,.35]);P(q,G.s(w*.6),m.c(PAL.pink),[0,-w*.35,w*.12],null,[1,.5,.3])}
  else if(kind==='o'){P(q,G.to(w*.55,w*.18),m.c(PAL.ink),[0,0,0])}
  else if(kind==='cat'){both(x=>P(q,G.to(w*.5,w*.13,PI),m.c(PAL.ink),[x*w*.5,0,0],[0,0,PI]))}
  else{P(q,G.to(w,w*.16,PI*.8),m.c(PAL.ink),[0,w*.3,0],[0,0,PI+PI*.1])}
  const open=P(q,G.s(w*.95),m.c('#8A3048'),[0,-w*.12,w*.05],null,[1.05,.8,.3]);const tongue=P(open,G.s(w*.55),m.c(PAL.pink),[0,-w*.38,.25],null,[1,.55,.6]);open.visible=false;open.userData.noOutline=true;tongue.userData.noOutline=true;q.userData.open=open}

/* ---------- Registry ---------- */
const KIND={org:'organisch',tier:'tierisch',masch:'maschinell',pflanze:'pflanzlich',ding:'Objekt',none:'—'};
const PARTS={kopf:[],augen:[],arme:[],beine:[],extras:[]};
function def(slot,id,n,k,b,extra){const i=PARTS[slot].findIndex(p=>p.id===id);const o=Object.assign({id,n,k,b},extra||{});if(i>=0)PARTS[slot][i]=o;else PARTS[slot].push(o)}
const findPart=(slot,id)=>PARTS[slot].find(p=>p.id===id);

/* ---------- Rumpfformen ---------- */
const TORSOS=[{id:'ei',n:'Ei'},{id:'kugel',n:'Kugel'},{id:'kapsel',n:'Kapsel'},{id:'birne',n:'Birne'},{id:'kiste',n:'Kiste'},{id:'dose',n:'Dose'},{id:'bohne',n:'Bohne'},{id:'glocke',n:'Glocke'},{id:'mochi',n:'Mochi'},{id:'tropfen',n:'Tropfen'},{id:'teddy',n:'Teddy'}];
/* Rumpf-Profile (t: -1 unten … +1 oben, r: Radius relativ zum Segment). Weiche, runde Silhouetten im Stil gemütlicher Tierfiguren. */
const TORSO_PROF={
  ei:[[-.98,0],[-.95,.46],[-.84,.8],[-.6,.97],[-.25,1.0],[.15,.93],[.5,.76],[.8,.5],[1.0,.22],[1.08,0]],
  kugel:[[-.9,0],[-.88,.52],[-.78,.84],[-.55,1.0],[-.2,1.05],[.2,1.0],[.55,.86],[.82,.58],[.97,.28],[1.02,0]],
  kapsel:[[-1,0],[-.98,.42],[-.9,.72],[-.72,.88],[-.4,.91],[.4,.89],[.72,.84],[.9,.66],[.98,.38],[1.02,0]],
  birne:[[-.95,0],[-.92,.52],[-.78,.9],[-.5,1.07],[-.15,1.03],[.2,.83],[.5,.63],[.78,.48],[.95,.3],[1.04,0]],
  dose:[[-1,0],[-1,.62],[-.98,.8],[-.93,.9],[-.86,.86],[-.8,.9],[0,.92],[.8,.9],[.86,.86],[.93,.9],[.98,.8],[1,.62],[1,0]],
  bohne:[[-1,0],[-.96,.55],[-.8,.86],[-.45,.96],[0,.9],[.45,.93],[.8,.8],[.96,.5],[1.02,0]],
  glocke:[[-1,0],[-.99,.8],[-.94,1.08],[-.82,1.1],[-.55,.94],[-.15,.76],[.3,.65],[.65,.55],[.9,.4],[1.05,0]],
  mochi:[[-.74,0],[-.72,.66],[-.62,1.04],[-.35,1.2],[0,1.16],[.35,.96],[.62,.64],[.78,.3],[.82,0]],
  tropfen:[[-1,0],[-.95,.5],[-.76,.88],[-.42,1.02],[-.02,.92],[.34,.64],[.68,.34],[.94,.12],[1.1,0]],
  teddy:[[-.96,0],[-.93,.5],[-.8,.86],[-.52,1.02],[-.15,1.0],[.25,.9],[.58,.74],[.84,.5],[1.0,.24],[1.06,0]]};
/* dichte Tabelle je Profil (Catmull-Rom geglättet) */
const TORSO_TAB={};function torsoTab(shape){if(TORSO_TAB[shape])return TORSO_TAB[shape];const pts=TORSO_PROF[shape]||TORSO_PROF.ei;const out=[];
  for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];for(let k=0;k<8;k++){const t=k/8,t2=t*t,t3=t2*t;
    const f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push([f(p0[0],p1[0],p2[0],p3[0]),Math.max(0,f(p0[1],p1[1],p2[1],p3[1]))])}}
  out.push(pts[pts.length-1]);for(let i=1;i<out.length;i++)out[i][0]=Math.max(out[i][0],out[i-1][0]+1e-4);return TORSO_TAB[shape]=out}
function torsoR(shape,t){const T=torsoTab(shape);if(t<=T[0][0]||t>=T[T.length-1][0])return 0;let lo=0,hi=T.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(T[m][0]<=t)lo=m;else hi=m}const a=T[lo],b=T[hi];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0])}
/* Ganzer Rumpf aus allen Segmenten als EIN weicher Körper (glatte Vereinigung der Profile → sanfte Taillen statt Schneemann) */
function torsoInfo(shape,ys,rs){const K=6;const lo=ys[0]+rs[0]*torsoTab(shape)[0][0],hi=ys[ys.length-1]+rs[rs.length-1]*torsoTab(shape).at(-1)[0];
  const R=y=>{let s2=0;for(let i=0;i<ys.length;i++){const r=rs[i]*torsoR(shape,(y-ys[i])/rs[i]);s2+=Math.pow(r,K)}return Math.pow(s2,1/K)};return{lo,hi,R}}
function torsoBody(g,shape,ys,rs,mat){
  if(shape==='kiste'){ys.forEach((y,i)=>{const rr=rs[i];P(g,G.bx(rr*1.8,rr*1.9,rr*1.6,rr*.55),mat,[0,y,0])});for(let i=1;i<ys.length;i++){const a=ys[i-1],b=ys[i];P(g,G.bx(Math.min(rs[i],rs[i-1])*1.5,Math.max(.01,b-a),Math.min(rs[i],rs[i-1])*1.3,Math.min(rs[i],rs[i-1])*.4),mat,[0,(a+b)/2,0])}return}
  const I=torsoInfo(shape,ys,rs);const N=Math.max(24,Math.round(56*QF+ys.length*10));const pts=[];for(let k=0;k<=N;k++){const u=k/N;const y=I.lo+(I.hi-I.lo)*(.5-.5*Math.cos(u*PI));pts.push([k===0||k===N?0:Math.max(.002,I.R(y)),y])}
  /* Naht hinten, Musterbauch vorn (gleiche UV-Lage wie früher die Kugel) */const geo=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),Q(40),-PI/2);const pos=geo.attributes.position;const mid=(I.lo+I.hi)/2,hh=(I.hi-I.lo)/2,r0=rs[0];
  for(let i=0;i<pos.count;i++){let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const t=(y-mid)/hh;
    /* etwas flacher von vorn nach hinten, kleiner Bauch vorn */z*=.9;if(z>0){const bel={teddy:.16,birne:.08,ei:.06,kugel:.05,mochi:.06,glocke:.03}[shape]||0;z+=bel*r0*Math.max(0,Math.cos(t*PI*.9-(-.35)))*Math.min(1,z/(r0*.5))}
    if(shape==='bohne'){z+=.15*r0*(1-t*t)-.05*r0}
    pos.setXYZ(i,x,y,z)}geo.computeVertexNormals();P(g,geo,mat,[0,0,0])}
/* Kleidungs-Hülle: folgt exakt der Rumpfform (inkl. Bauch), zwischen zwei Höhen, etwas grösser; flare weitet unten (Rock) */
function torsoShell(g,shape,ys,rs,mat,o){o=o||{};const grow=o.grow||1.05,add=o.add??.012;if(shape==='kiste'){const y0=o.from,y1=o.to;const rr=rs[0];const m=P(g,G.bx(rr*1.8*grow+add*2,Math.max(.02,y1-y0),rr*1.6*grow+add*2,rr*.5),mat,[0,(y0+y1)/2,0]);return m}
  const I=torsoInfo(shape,ys,rs);const y0=Math.max(I.lo,o.from),y1=Math.min(I.hi,o.to);const N=Math.max(12,Math.round(30*QF));const pts=[];
  for(let k=0;k<=N;k++){const u=k/N;const y=y0+(y1-y0)*u;let r=I.R(y)*grow+add;if(o.flare)r*=1+o.flare*Math.pow(1-u,2);pts.push([Math.max(.01,r),y])}
  const geo=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),Q(40),-PI/2);const pos=geo.attributes.position;const mid=(I.lo+I.hi)/2,hh=(I.hi-I.lo)/2,r0=rs[0];
  for(let i=0;i<pos.count;i++){let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const t=(y-mid)/hh;z*=.9;if(z>0){const bel={teddy:.16,birne:.08,ei:.06,kugel:.05,mochi:.06,glocke:.03}[shape]||0;z+=bel*r0*grow*Math.max(0,Math.cos(t*PI*.9+.35))*Math.min(1,z/(r0*.5))}if(shape==='bohne'){z+=.15*r0*(1-t*t)-.05*r0}pos.setXYZ(i,x,y,z)}
  geo.computeVertexNormals();return P(g,geo,mat,[0,0,0])}
/* alte Einzelform (für Vorschau-Symbole u. Ä.) */
function torsoMesh(g,shape,rr,y,mat){const gg=new THREE.Group();torsoBody(gg,shape,[0],[rr],mat);gg.position.y=y;g.add(gg);return gg}

/* ---------- Outlines (Inverted Hull, farbig) ---------- */
const OUTLINE_MATS={};const OUTLINE_SCALE={value:1};const OUTLINE_BASE=.0052;
/* lvl 1..4: dünne Teile bekommen dünnere Linien */
function outlineMat(col,lvl){lvl=lvl||4;const key=col.getHexString()+lvl;if(OUTLINE_MATS[key])return OUTLINE_MATS[key];
  const m=new THREE.MeshBasicMaterial({color:col,side:THREE.BackSide});m.userData.keep=true;m.userData.outline=true;const w={value:OUTLINE_BASE*[0,.3,.5,.75,1][lvl]};m.userData.ow=w.value;
  m.onBeforeCompile=s=>{s.uniforms.uW=w;s.uniforms.uS=OUTLINE_SCALE;s.vertexShader='uniform float uW;uniform float uS;\n'+s.vertexShader.replace('#include <project_vertex>',
    `#include <project_vertex>
     {
     #ifdef USE_INSTANCING
       vec3 nn=normalize(normalMatrix*(mat3(instanceMatrix)*normal));
     #else
       vec3 nn=normalize(normalMatrix*normal);
     #endif
     float d=max(0.5,-mvPosition.z);mvPosition.xyz+=nn*uW*uS*d;gl_Position=projectionMatrix*mvPosition;}`)};
  m.customProgramCacheKey=()=>'outline';OUTLINE_MATS[key]=m;return m}
const outlineMatFor=(mat,lvl)=>outlineMat(outlineColorOf(mat),lvl||4);
function outlineColorOf(mat){let c;if(mat.userData&&mat.userData.metal){c=new THREE.Color({gold:'#8a5a1a',copper:'#7a3a2a',holo:'#6a5a9a'}[mat.userData.metal]||'#5a5a78')}
  else if(mat.color){c=mat.map?new THREE.Color('#6a5a6a'):mat.color.clone()}else c=new THREE.Color('#5a4a6a');
  const hsl={};c.getHSL(hsl);const chroma=hsl.s*(1-Math.abs(2*hsl.l-1));/* fast weisse Farben: graue statt knallbunte Linie */
  return new THREE.Color().setHSL(hsl.h,Math.min(1,chroma*.9+.1),Math.max(.1,hsl.l*.38))}
function addOutlines(root,opt){opt=opt||{};const list=[];root.traverse(o=>{if(!o.isMesh||o.userData.noOutline||o.userData.hull||o.userData.furShell)return;const m=o.material;if(!m||Array.isArray(m))return;
    if(m.transparent||m.side===THREE.DoubleSide||m.userData.ghost||m.userData.glow||m.userData.flat||m.userData.glass||m.userData.outline)return;
    const t=o.geometry.type;if(t==='PlaneGeometry'||t==='ShapeGeometry'||t==='CircleGeometry'||t==='RingGeometry'||o.geometry.userData.openTube&&false)return;
    o.geometry.computeBoundingSphere();const rad=o.geometry.boundingSphere.radius*Math.max(o.scale.x,o.scale.y,o.scale.z);if(rad<(opt.min||.012))return;list.push(o)});
  for(const o of list){o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox;const sz=Math.min((bb.max.x-bb.min.x)*Math.abs(o.scale.x),(bb.max.y-bb.min.y)*Math.abs(o.scale.y),(bb.max.z-bb.min.z)*Math.abs(o.scale.z))*.5*(opt.scale||1);const lvl=sz<.035?1:sz<.07?2:sz<.13?3:4;const h=new THREE.Mesh(o.geometry,outlineMat(outlineColorOf(o.material),lvl));h.userData.hull=true;h.castShadow=false;h.receiveShadow=false;h.raycast=()=>{};o.add(h)}
  return list.length}
function setOutlines(root,on){root.traverse(o=>{if(o.userData.hull)o.visible=on})}


/* ---------- Zusammenführen (weniger Draw-Calls für statische Objekte) ----------
   Führt alle Meshes eines Objekts je Material zusammen (lokal zum Wurzelknoten), inkl. Outline-Hüllen.
   keep: Array von Meshes/Gruppen, die separat bleiben (z. B. Früchte, animierte Teile). */
/* ---------- Vertex-Farben: viele einfarbige Toon-Materialien → ein Material (weniger Draw-Calls) ---------- */
const VCM={};
/* Durchsicht: Was zwischen Kamera und Spielfigur steht, wird gerastert ausgeblendet (wie in Animal Crossing) */
const OCC={a:{value:new THREE.Vector3()},b:{value:new THREE.Vector3()},on:{value:0}};
function occInject(s){s.uniforms.uOcA=OCC.a;s.uniforms.uOcB=OCC.b;s.uniforms.uOcOn=OCC.on;
  s.vertexShader='varying vec3 vOcW;\n'+s.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
   #ifdef USE_INSTANCING
   vOcW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;
   #else
   vOcW=(modelMatrix*vec4(transformed,1.)).xyz;
   #endif`);
  s.fragmentShader='uniform vec3 uOcA;uniform vec3 uOcB;uniform float uOcOn;varying vec3 vOcW;\n'+s.fragmentShader.replace(/void main\(\) \{/,`void main() {
   if(uOcOn>.5){vec3 ab=uOcB-uOcA;float L=length(ab);float t=clamp(dot(vOcW-uOcA,ab)/(L*L),0.,1.);float d=length(vOcW-(uOcA+ab*t));
    if(t<1.-1.1/L&&d<1.7){float th=smoothstep(1.7,.7,d)*smoothstep(0.,.12,t);vec2 f=mod(floor(gl_FragCoord.xy),4.);
     float b=mod(f.x*4.+f.y*11.,16.)/16.;if(b<th*.9)discard;}}`)}
function vcMat(ds,gl){const k=(ds?'d':'')+(gl?'g':'');if(VCM[k])return VCM[k];const m=cozy({color:'#ffffff',vertexColors:true,side:ds?THREE.DoubleSide:THREE.FrontSide,rim:.4,gloss:gl?.6:0});
  const prev=m.onBeforeCompile;m.onBeforeCompile=s=>{prev(s);occInject(s)};m.customProgramCacheKey=()=>'cozyVC';return VCM[k]=m}
function vcHull(){if(VCM.h)return VCM.h;const m=new THREE.MeshBasicMaterial({color:'#ffffff',vertexColors:true,side:THREE.BackSide});m.userData.keep=true;m.userData.outline=true;
  m.onBeforeCompile=s=>{occInject(s);s.uniforms.uS=OUTLINE_SCALE;s.vertexShader='uniform float uS;attribute float ow;\n'+s.vertexShader.replace('#include <project_vertex>',
    `#include <project_vertex>
     {
     #ifdef USE_INSTANCING
       vec3 nn=normalize(normalMatrix*(mat3(instanceMatrix)*normal));
     #else
       vec3 nn=normalize(normalMatrix*normal);
     #endif
     float d=max(0.5,-mvPosition.z);mvPosition.xyz+=nn*ow*uS*d;gl_Position=projectionMatrix*mvPosition;}`)};
  m.customProgramCacheKey=()=>'outlineVC';return VCM.h=m}
function canBake(mt){return mt&&mt.isMeshToonMaterial&&!mt.map&&!mt.transparent&&!mt.vertexColors&&!mt.userData.noBake&&!(mt.emissive&&mt.emissive.getHex()&&mt.emissiveIntensity>0)}
function paintGeo(geo,c,ow){const n=geo.attributes.position.count;const a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b}geo.setAttribute('color',new THREE.BufferAttribute(a,3));
  if(ow!=null)geo.setAttribute('ow',new THREE.BufferAttribute(new Float32Array(n).fill(ow),1));return geo}
function mergeGroup(root,keep){root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();const keepSet=new Set();(keep||[]).forEach(k=>k&&k.traverse(o=>keepSet.add(o)));
  const buckets=new Map();const victims=[];const WHITE=new THREE.Color(1,1,1);
  root.traverse(o=>{if(!o.isMesh||o.userData.hull||keepSet.has(o)||o.userData.noMerge)return;const hull=o.children.find(c=>c.userData.hull);
    const mt=o.material;const pre=mt.vertexColors&&o.geometry.attributes.color&&Object.values(VCM).includes(mt);/* schon gebacken (zweites Zusammenführen) */
    const prep=(src,keepAttrs)=>{let geo=src.index?src.toNonIndexed():src.clone();for(const k of Object.keys(geo.attributes))if(!['position','normal','uv',...keepAttrs].includes(k))geo.deleteAttribute(k);
      if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));if(!geo.attributes.normal)geo.computeVertexNormals();geo.clearGroups();
      const MX=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);geo.applyMatrix4(MX);
      /* gespiegelte Teile: Dreiecksreihenfolge umdrehen, sonst kippen Aussenseite und Konturhülle */
      if(MX.determinant()<0){for(const an of Object.keys(geo.attributes)){const at=geo.attributes[an],isz=at.itemSize,arr=at.array;for(let t=0;t<at.count;t+=3){for(let c=0;c<isz;c++){const i1=(t+1)*isz+c,i2=(t+2)*isz+c,tmp=arr[i1];arr[i1]=arr[i2];arr[i2]=tmp}}at.needsUpdate=true}}
      return geo};
    const geo=prep(o.geometry,pre?['color']:[]);const bake=pre||canBake(mt);const ds=mt.side===THREE.DoubleSide,gl=mt.userData.gloss>0;
    const key=bake?'VC'+(ds?'d':'')+(gl?'g':'')+'|'+(o.castShadow?1:0):mt.uuid+'|'+(hull?hull.material.uuid:'')+'|'+(o.castShadow?1:0);
    if(!pre)paintGeo(geo,bake?mt.color:WHITE);
    if(!buckets.has(key))buckets.set(key,{mat:bake?vcMat(ds,gl):mt,vc:bake,hull:!bake&&hull&&hull.material,cast:o.castShadow,list:[],hl:[]});
    const b=buckets.get(key);b.list.push(geo);
    if(bake&&hull){let hg;if(hull.material===VCM.h&&hull.geometry.attributes.ow)hg=prep(hull.geometry,['color','ow']);else{hg=geo.clone();paintGeo(hg,hull.material.color,hull.material.userData.ow??OUTLINE_BASE*.75)}b.hl.push(hg)}victims.push(o)});
  if(victims.length<3){return root}
  for(const o of victims){o.parent&&o.parent.remove(o)}
  for(const b of buckets.values()){const merged=THREE.BufferGeometryUtils.mergeBufferGeometries(b.list,false);b.list.forEach(g=>g.dispose());if(!merged)continue;
    const m=new THREE.Mesh(merged,b.mat);m.castShadow=b.cast;m.receiveShadow=true;m.userData.merged=true;root.add(m);
    if(b.vc&&b.hl.length){const hg=THREE.BufferGeometryUtils.mergeBufferGeometries(b.hl,false);b.hl.forEach(g=>g.dispose());if(hg){const h=new THREE.Mesh(hg,vcHull());h.userData.hull=true;h.raycast=()=>{};m.add(h)}}
    else if(b.hull){const h=new THREE.Mesh(merged,b.hull);h.userData.hull=true;h.raycast=()=>{};m.add(h)}}
  /* leere Gruppen aufräumen */const empty=[];root.traverse(o=>{if(o!==root&&!o.isMesh&&o.children.length===0&&!keepSet.has(o))empty.push(o)});empty.forEach(o=>o.parent&&o.parent.remove(o));
  return root}


/* Kreatur zusammenführen: animierte Knoten erkennen (Transform/Sichtbarkeit/Geometrie/Material ändert sich).
   Statische Meshes werden in ihren nächsten animierten Vorfahren (Anker) gemergt – so bleiben Animationen intakt. */
function mergeCreature(g,extra){const objs=[];g.traverse(o=>{if(o!==g)objs.push(o)});const snap=()=>objs.map(o=>[o.position.x,o.position.y,o.position.z,o.quaternion.x,o.quaternion.y,o.quaternion.z,o.quaternion.w,o.scale.x,o.scale.y,o.scale.z,o.visible?1:0,o.material&&o.material.uuid,o.geometry&&o.geometry.attributes.position&&o.geometry.attributes.position.version].join(','));
  const T=[[.37,false,0],[1.91,true,1],[3.3,false,.5],[5.2,true,0],[7.7,false,.9],[11.1,true,.3],[.04,false,0],[4.05,true,0],[8.02,false,.2],[2.61,true,.6],[6.55,false,0]];const shots=T.map(([t,w,a])=>{g.userData.tick(t,w,a);return snap()});
  const dyn=new Set();objs.forEach((o,i)=>{if(shots.some(s=>s[i]!==shots[0][i]))dyn.add(o)});(extra||[]).forEach(o=>o&&dyn.add(o));
  /* Anker: Wurzel + animierte Nicht-Meshes; animierte Meshes bleiben einzeln */
  const anchors=[g,...[...dyn].filter(o=>!o.isMesh)];
  for(const A of anchors.reverse()){const keep=[];A.traverse(o=>{if(o===A)return;if(dyn.has(o))keep.push(o)});mergeGroup(A,keep)}
  g.userData.tick(0,false,0);return g}

/* ---------- Teile umfärben: farbige Töne eines Teils in Richtung Wunschfarbe, Schattierung bleibt; Weiss/Schwarz/Grau bleiben ---------- */
function tintHex(color,target){let c;try{c=new THREE.Color(color)}catch(e){return color}const h={},T={};c.getHSL(h);new THREE.Color(target).getHSL(T);
  if(h.s<.14||h.l>.94||h.l<.08)return color;const grey=T.s<.12;
  const s2=grey?T.s:Math.min(1,T.s*.78+h.s*.22),l2=Math.min(.92,Math.max(.1,h.l*.5+T.l*.5+(h.l-.5)*.25));return'#'+new THREE.Color().setHSL(grey?h.h:T.h,s2,l2).getHexString()}
function tintMats(M,target){if(!target)return M;const W=Object.create(M);const tc=x=>x==null?x:tintHex(x,target);
  for(const k of['c','dbl','toon','gloss','plush','leaf','glass','flat','slime','crystal','chitin'])if(M[k])W[k]=(col,...r)=>M[k](col==null?target:tc(col),...r);
  W.glow=(col,i)=>M.glow(tc(col),i);W.wood=()=>M.c(tintHex('#B8845A',target));return W}
const TINT_SLOTS=['kopf','augen','arme','beine','extras'];

/* ---------- Kreatur ---------- */
function buildCreature(d,opt){
  opt=opt||{};QF=opt.q||1;
  const g=new THREE.Group();const an=[];const only=opt.only||null;
  const realM=makeMats(d.body);const ghostM=makeMats(d.body,true);
  const s=d.body.size,r=.6*s,n=d.body.seg;
  const legP=findPart('beine',d.parts.beine)||PARTS.beine[0]||{h:1};
  const y0=(legP.h??1)*s;
  const ys=[],rs=[];for(let i=0;i<n;i++){const rr=r*(1-i*.08);rs.push(rr);ys.push(i===0?y0+rr:ys[i-1]+(rs[i-1]+rr)*.72)}
  const TI=d.body.shape==='kiste'?null:torsoInfo(d.body.shape,ys,rs);
  const topY=TI?TI.hi-rs[n-1]*.06:ys[n-1]+rs[n-1]*.95;
  const hr=.58*s;
  const shY0=ys[n-1]+.22*rs[n-1],c={s,r,n,ys,rs,y0,topY,midY:ys[Math.floor((n-1)/2)],belly:ys[0],shX:TI?Math.max(rs[n-1]*.55,TI.R(shY0)*.97):rs[n-1]*.9,shY:shY0,hipX:rs[0]*.45,R:TI?TI.R:null,tlo:TI?TI.lo:ys[0]-rs[0]*.95,thi:TI?TI.hi:ys[n-1]+rs[n-1]*.95,hr,hy:topY+hr*.82,
    an:f=>an.push(f),body:d.body,m:realM,PAL};
  const focus=new THREE.Group();g.add(focus);
  const bodyMat=only?ghostM.skin():realM.skin();
  torsoBody(g,d.body.shape,ys,rs,bodyMat);
  /* Schulteransätze sitzen genau auf der Körperoberfläche */if(!only)both(x=>P(g,G.s(.15*s),realM.skin(),[x*(c.shX-.05*s),c.shY-.02*s,0],null,[1,.9,.9]));
  if(n>0&&!only){P(g,G.cy(c.hr*.34,c.hr*.42,c.hr*.5),realM.skin(),[0,topY,0])}
  const H={cy:c.hy,r:c.hr,top:c.hy+c.hr,front:c.hr*.93,faceY:c.hy+c.hr*.02,sideX:c.hr};
  const tints={};for(const k of TINT_SLOTS){const i=d.tint&&d.tint[k];if(Number.isInteger(i)&&i>=0&&SKIN_COLORS[i])tints[k]=tintMats(realM,SKIN_COLORS[i])}
  const run=(slot,id,target)=>{const p=findPart(slot,id);if(!p)return null;c.m=(only&&only!==slot)?ghostM:(tints[slot]||realM);let res=null;try{res=p.b(target,c)}catch(e){console.warn('Teil',slot,id,e)}c.m=realM;return res};
  if(!only||only==='kopf'){const res=run('kopf',d.parts.kopf,only==='kopf'?focus:g);Object.assign(H,res||{})}
  else if(only==='augen'||only==='extras'){P(g,G.s(c.hr),ghostM.skin(),[0,c.hy,0])}
  c.H=H;
  if(!only||only==='augen')run('augen',d.parts.augen,only?focus:g);
  if(!only||only==='arme')run('arme',d.parts.arme,only?focus:g);
  if(!only||only==='beine')run('beine',d.parts.beine,only?focus:g);
  if(!only||only==='extras')for(const x of d.parts.extras||[])run('extras',x,only?focus:g);
  /* Kleidung (Hut, Oberteil, Hals, Gesicht) */if(!only&&d.clothes&&typeof CLOTHES!=='undefined'){try{CLOTHES.dress(g,c,d)}catch(e){console.warn('Kleidung',e)}}
  g.traverse(o=>{if(o.isMesh){o.castShadow=!opt.noShadow;o.receiveShadow=!opt.noShadow}});
  if(!only&&FURSKINS[d.body.skin]&&opt.fur!==false)addFur(g,realM.skin(),d.body,s,QF);
  if(opt.outline!==false)addOutlines(only?focus:g,{min:opt.outlineMin});
  if(opt.blob){const bm=new THREE.MeshBasicMaterial({map:ctex('blob',128,128,(x,w,h)=>{const gr=x.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(60,40,90,.35)');gr.addColorStop(.6,'rgba(60,40,90,.18)');gr.addColorStop(1,'rgba(60,40,90,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)}),transparent:true,depthWrite:false});const bl=P(g,G.circ(r*1.7),bm,[0,.03,0],[-PI/2,0,0]);bl.castShadow=false;bl.receiveShadow=false;bl.userData.noOutline=true}
  g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(only?focus:g);
  g.userData.height=box.max.y;g.userData.box=box;g.userData.focus=focus;
  g.userData.tick=(t,w,a)=>{for(let i=0;i<an.length;i++){try{an[i](t,w,a||0)}catch(e){an.splice(i--,1)}}};
  {const ms=[],es=[];g.traverse(o=>{if(o.userData.mouth)ms.push(o);if(o.userData.eye)es.push(o)});g.userData.mouths=ms;g.userData.eyes=es}
  if(opt.merge&&!only){try{mergeCreature(g,g.userData.mouths.concat(g.userData.mouths.map(q=>q.userData.open),g.userData.eyes))}catch(e){console.warn('merge',e)}}
  return g;
}
function disposeTree(o){o.traverse(c=>{if(c.geometry&&!c.userData.hull)c.geometry.dispose();if(c.material){(Array.isArray(c.material)?c.material:[c.material]).forEach(m=>{if(!m.userData.keep)m.dispose()})}})}

/* ---------- Bühnen-Licht (Labor, Vorschaubilder, Harness) ---------- */
function cozyLights(scene,o){o=o||{};const hemi=new THREE.HemisphereLight(o.sky||'#cfe6ff',o.ground||'#f0c9a8',o.hemi??.5);scene.add(hemi);
  const sun=new THREE.DirectionalLight(o.sun||'#fff3de',o.sunI??1.0);sun.position.set(3.5,7,5);scene.add(sun);
  const fill=new THREE.DirectionalLight('#c9d8ff',.18);fill.position.set(-5,3,-3);scene.add(fill);return{hemi,sun,fill}}

/* ---------- Spielzeit: eigener Tag-Nacht-Zyklus (1 Spielstunde = 1 echte Minute, ein Tag = 24 Minuten) ---------- */
const GAMETIME=(()=>{const SPEED=60;/* Spielsekunden pro echte Sekunde */let base=null;
  function t0(){if(base==null){let s=null;try{s=JSON.parse(localStorage.getItem('cyborg-labor-zeit')||'null')}catch(e){}base=s||{real:Date.now(),game:9*3600}}return base}
  function secs(){if(window.__hour!=null)return window.__hour*3600;const b=t0();return (b.game+(Date.now()-b.real)/1000*SPEED)%86400}
  function hour(){return secs()/3600}
  function save(){try{localStorage.setItem('cyborg-labor-zeit',JSON.stringify({real:Date.now(),game:secs()}));base=null}catch(e){}}
  function skip(toH){const b=t0();b.game=toH*3600;b.real=Date.now();save()}
  const str=()=>{const s=secs();return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor(s/60)%60).padStart(2,'0')};
  setInterval(save,15000);return{hour,str,skip,SPEED}})();
/* Planeten-Grundgerüst: jeder Planet kann in jeder Tabelle eigene Einträge haben; fehlt einer, gilt der seines Vorbild-Planeten (base), sonst Kompost */
function PB(pid){const d=typeof PLANETS!=='undefined'&&PLANETS[pid];return d&&d.base||pid}
function PT(T,pid,dflt){if(!T)return dflt;if(T[pid]!==undefined)return T[pid];const b=PB(pid);if(T[b]!==undefined)return T[b];return dflt!==undefined?dflt:T.kompost}
function hashNum(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)%1000003}
