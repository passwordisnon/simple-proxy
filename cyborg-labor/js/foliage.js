/* =====================================================================
   CYBORG-LABOR · foliage.js
   Blätterkronen nach folio-2025 (Bruno Simon, MIT): statt glatter Kugeln
   eine Hülle aus vielen kleinen Blatt-Karten mit Alpha-Maske. Normalen
   zeigen nach aussen (Kugel-Schattierung), die Maske dreht sich leicht im
   Wind (Rascheln ohne Vertex-Bewegung), ein dunklerer Kern füllt Lücken.
   ===================================================================== */
const FOLIAGE=(()=>{
  const U={uT:{value:0}};
  /* Blatt-Büschel als Maske: 6–7 runde Blätter, weiss auf transparent */
  let tex=null;function leafTex(){if(tex)return tex;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
    const r=srand(11);x.fillStyle='#fff';const leaf=(cx,cy,a,s)=>{x.save();x.translate(cx,cy);x.rotate(a);x.beginPath();x.moveTo(0,-s);x.bezierCurveTo(s*.75,-s*.55,s*.7,s*.5,0,s);x.bezierCurveTo(-s*.7,s*.5,-s*.75,-s*.55,0,-s);x.fill();x.restore()};
    leaf(64,64,0,30);for(let i=0;i<6;i++){const a=i/6*TAU+r()*.4;leaf(64+Math.cos(a)*30,64+Math.sin(a)*30,a+PI/2,20+r()*8)}
    tex=new THREE.CanvasTexture(c);tex.generateMipmaps=true;tex.minFilter=THREE.LinearMipmapLinearFilter;return tex}
  /* Einheits-Hülle (Radius 1): n Karten in einer Kugelschale, Normalen zur Kugel gebogen */
  const geos={};function shell(n,seed){const k=n+'|'+seed;if(geos[k])return geos[k];const r=srand(seed*977+3);const list=[];const V=THREE.Vector3;
    for(let i=0;i<n;i++){const pl=new THREE.PlaneGeometry(.62,.62);const dir=new V(r()*2-1,r()*2-1,r()*2-1);if(dir.lengthSq()<1e-3)dir.set(0,1,0);dir.normalize();if(dir.y<-.55)dir.y=-.55,dir.normalize();
      const rad=.72+.28*(1-Math.pow(r(),2));pl.rotateZ(r()*TAU);pl.lookAt(dir);pl.translate(dir.x*rad,dir.y*rad,dir.z*rad);
      const P=pl.attributes.position,Nn=pl.attributes.normal;const t=new V();for(let j=0;j<P.count;j++){t.fromBufferAttribute(P,j).normalize();Nn.setXYZ(j,t.x*.85+dir.x*.15,t.y*.85+dir.y*.15,t.z*.85+dir.z*.15)}list.push(pl)}
    const g=THREE.BufferGeometryUtils.mergeBufferGeometries(list,false);list.forEach(p=>p.dispose());geos[k]=g;return g}
  const mats={};function leafMat(col){const key=typeof col==='string'?col:'#'+new THREE.Color(col).getHexString();if(mats[key])return mats[key];
    const m=new THREE.MeshToonMaterial({color:new THREE.Color(key),gradientMap:TOON_RAMP,alphaMap:leafTex(),alphaTest:.5,side:THREE.DoubleSide});m.userData.noBake=true;m.userData.leaf=true;
    m.onBeforeCompile=s=>{s.uniforms.uT=U.uT;s.fragmentShader='uniform float uT;\n'+s.fragmentShader.replace('#include <alphamap_fragment>',
      `{float ang=sin(uT*1.8+vViewPosition.x*.35+vViewPosition.y*.2)*.22;vec2 q=vUv-.5;vec2 ru=vec2(q.x*cos(ang)-q.y*sin(ang),q.x*sin(ang)+q.y*cos(ang))+.5;diffuseColor.a*=texture2D(alphaMap,ru).g;}`)
      /* Unterseite etwas dunkler/kühler, Oberseite heller: räumliche Krone */
      .replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=gl_FrontFacing?1.:.88;')};
    m.customProgramCacheKey=()=>'leaf';mats[key]=m;return m}
  /* Krone an Position p mit Radius r: dunkler Kern + Blattkarten */
  function crown(g,m,col,x,y,z,r,seed,sc){const core=P(g,G.blob(r*.8,.06,2.4,seed),m.c(new THREE.Color(col).multiplyScalar(.82),{rim:.3}),[x,y,z],null,sc);
    const n=Math.max(14,Math.min(46,Math.round(26*r*r+10)));const q=new THREE.Mesh(shell(n,Math.floor((seed||0)*7)%5),leafMat(new THREE.Color(col).offsetHSL(0,.02,.03)));q.position.set(x,y,z);
    const s=r*1.08;if(sc)q.scale.set(s*sc[0],s*sc[1],s*sc[2]);else q.scale.setScalar(s);q.castShadow=false;q.userData.noOutline=true;g.add(q);return core}
  function frame(t){U.uT.value=t}
  return{crown,leafMat,frame,U}
})();
