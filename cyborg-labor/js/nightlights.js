/* =====================================================================
   CYBORG-LABOR · nightlights.js · Lampen leuchten nachts
   Alles mit g.userData.light (Strassenlaternen, Lampen, Laternen …)
   bekommt draussen nachts:
   - einen warmen Schein am Leuchtkörper (Sprite, kostet fast nichts)
   - einen weichen Lichtkreis auf dem Boden darunter
   - die nächsten Lampen beim Spieler zusätzlich ein echtes Punktlicht,
     das Figuren, Bänke und Bäume anstrahlt (Anzahl je nach Grafikstufe)
   Am Tag ist alles ausgeblendet. Die Stärke folgt G.night (Dämmerung
   blendet weich über).
   ===================================================================== */
const NIGHTL=(()=>{
  const V3=THREE.Vector3;
  let G=null,group=null,lamps=[],lights=[],lastN=-1,scanT=0,pickT=0,maxLights=0;
  let glowTex=null,poolTex=null;
  function tex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.35,outer);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}
  function lightCount(){if(typeof PERF!=='undefined'&&PERF.tier==='spar')return 0;return(typeof HIGH!=='undefined'&&HIGH)?6:3}
  function reset(nG){if(group&&group.parent)group.parent.remove(group);for(const l of lights)if(l.parent)l.parent.remove(l);
    G=nG;lamps=[];lights=[];lastN=-1;scanT=0;pickT=0;group=new THREE.Group();group.name='nachtlichter';group.visible=false;G.scene.add(group);
    if(!glowTex){glowTex=tex('rgba(255,255,255,1)','rgba(255,240,200,.45)');poolTex=tex('rgba(255,255,255,.9)','rgba(255,255,255,.35)')}
    maxLights=lightCount();for(let i=0;i<maxLights;i++){const L=new THREE.PointLight('#FFE3A0',0,8,2);L.castShadow=false;G.scene.add(L);lights.push(L)}}
  const _w=new V3(),_s=new V3();
  function scan(){const seen=new Set(lamps.map(l=>l.o));let n=0;
    G.scene.traverse(o=>{const L=o.userData&&o.userData.light;if(!L||seen.has(o)||o===group)return;if(!o.parent)return;
      o.updateMatrixWorld(true);_w.set(L.p[0],L.p[1],L.p[2]);o.localToWorld(_w);o.getWorldScale(_s);const sc=Math.max(.2,(_s.x+_s.y+_s.z)/3);
      const col=new THREE.Color(L.c||'#FFE3A0');const up=_w.clone().normalize();
      /* Schein am Leuchtkörper */
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));sp.position.copy(_w).addScaledVector(up,.35*sc);sp.renderOrder=3;sp.scale.setScalar(2.6*sc*(.6+(L.i||1)*.4));group.add(sp);
      /* Lichtkreis am Boden: direkt unter der Lampe auf Bodenhöhe */
      const hf=G.hExact||G.hAt;let gr=null;if(hf){const h=hf(up);const r=(2.4+(L.i||1)*1.1)*sc;gr=new THREE.Mesh(new THREE.CircleGeometry(r,28),new THREE.MeshBasicMaterial({map:poolTex,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
        gr.position.copy(up).multiplyScalar(G.R+h+.06);gr.quaternion.setFromUnitVectors(new V3(0,0,1),up);gr.renderOrder=2;group.add(gr)}
      lamps.push({o,p:_w.clone(),c:col,i:L.i||1,sc,sp,gr});n++});
    return n}
  function pick(me){if(!lights.length)return;const mp=me&&me.g?me.g.position:null;if(!mp)return;
    const near=lamps.filter(l=>l.o.parent).map(l=>({l,d:l.p.distanceToSquared(mp)})).sort((a,b)=>a.d-b.d).slice(0,lights.length);
    lights.forEach((L,i)=>{const n=near[i];if(!n||n.d>40*40){L.userData.on=0;return}L.position.copy(n.l.p);L.color.copy(n.l.c);L.distance=5*n.l.sc+2.5;L.userData.on=n.l.i})}
  function tick(nG,me,dt){if(!nG||!nG.scene)return;if(nG!==G||!group||group.parent!==nG.scene)reset(nG);
    const n=Math.max(0,Math.min(1,G.night||0));
    /* neue Objekte (Gebäude, Möbel, Streuobjekte) erscheinen auch später noch */
    scanT-=dt;if(scanT<=0){scanT=n>0?3:10;scan()}
    if(n<.02){if(group.visible){group.visible=false;for(const L of lights)L.intensity=0}lastN=n;return}
    group.visible=true;pickT-=dt;if(pickT<=0){pickT=.5;pick(me)}
    if(Math.abs(n-lastN)>.01){for(const l of lamps){l.sp.material.opacity=n;if(l.gr)l.gr.material.opacity=.2*n}lastN=n}
    const fl=1+Math.sin(performance.now()/900)*.03;for(const L of lights)L.intensity=Math.min(1,(L.userData.on||0)*.55)*n*fl}
  return{tick,get count(){return lamps.length},get lights(){return lights.length},reset:()=>{G=null}};
})();
