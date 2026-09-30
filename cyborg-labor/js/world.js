/* =====================================================================
   CYBORG-LABOR · world.js
   Spielbare Welt: Planeten mit Terrassen, Wasser, Gras, Natur, Gebäuden.
   Spielfigur (3rd person auf der Kugel), Bewohner:innen, Öko-Fähigkeiten.
   ===================================================================== */
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CS=.4;              /* Kreatur-Massstab in der Welt (s=1 → ~1.7 hoch) */
const UPV=new V3(0,1,0);

const GAME=(()=>{
  const canvas=$('worldCanvas');const R=makeRenderer(canvas);R.shadowMap.type=THREE.PCFSoftShadowMap;
  const cam=new THREE.PerspectiveCamera(45,1,.1,900);
  let scene=null,comp=null,W0=null;              /* aktuelle Aussenszene */
  let mode='outdoor';                            /* outdoor | interior */
  const M=makeMats({skin:'haut',color:0});
  const G_={};                                   /* aktueller Planet */
  let planetId=SAVE.planet&&PLANETS[SAVE.planet]?SAVE.planet:'kompost';

  /* ================= Aufbau Aussenwelt ================= */
  function buildOutdoor(pid){
    const def=PLANETS[pid];let homeSpots=[];try{homeSpots=HOMES.spots(pid,makePlanetFns(pid))}catch(e){console.warn('Häuser',e)}const fns=makePlanetFns(pid,homeSpots);const Rr=def.R;Object.assign(G_,{id:pid,def,hAt:fns.hAt,biomeAt:fns.biomeAt,places:fns.places,R:Rr,sea:def.sea,paths:fns.roads,roadDist:fns.roadDist,fns});
    const sc=new THREE.Scene();sc.background=skyTex(def.sky[0],def.sky[1],pid);sc.fog=new THREE.Fog(def.fog,Math.min(Rr*.7,62),Math.min(Rr*1.9,175));
    const hemi=new THREE.HemisphereLight('#dff1ff','#f0c9a8',.52);sc.add(hemi);
    const sun=new THREE.DirectionalLight('#fff3de',1.0);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:110});sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;sc.add(sun);sc.add(sun.target);
    const fill=new THREE.DirectionalLight('#c9d8ff',.18);sc.add(fill);
    const detail=Math.round(Rr*(HIGH?3.4:2.3));
    /* Gelände: LOD-Kacheln (feine Kacheln am Spieler, grobe in der Ferne); beim Aufbau zählt die exakte Höhenfunktion */
    if(typeof PLANETLOD!=='undefined'){const gm=groundMaterial(fns);const W0=buildWaterMesh(fns,1);W0.mesh.geometry.dispose();G_.water=null;G_.waterU=W0.U;
      PLANETLOD.create(fns,gm,sc,{vattr:terrainVattr(fns),fine:HIGH?.32:.55,water:W0.mesh.material});const pz=(fns.places.find(p=>p.build==='plaza')||{dir:UPV}).dir;PLANETLOD.update(pz.clone().multiplyScalar(Rr+12),0,true);
      G_.planet=PLANETLOD.S.group;G_.groundU=gm.userData.U;G_.hAt=fns.hAt;G_.lod=true}
    else{const planet=buildTerrainMesh(fns,detail);sc.add(planet);G_.planet=planet;G_.hAt=makeSurface(planet,fns);G_.groundU=planet.material.userData.U;G_.lod=false}
    G_.hExact=G_.hAt;
    /* LOD: Wasser entsteht mit den Kacheln (gleiches Material), sonst eine Wasserkugel */
    if(!G_.lod){const W_=buildWaterMesh(fns,Math.min(140,Math.round(detail*.5)));sc.add(W_.mesh);G_.water=W_.mesh;G_.waterU=W_.U}
    /* Atmosphäre */
    const atm=new THREE.Mesh(new THREE.SphereGeometry(Rr*1.35,64,40),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{c:{value:new THREE.Color(def.sky[0])}},
      vertexShader:'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vP=mv.xyz;gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform vec3 c;varying vec3 vN;varying vec3 vP;void main(){float f=pow(1.0-abs(dot(normalize(-vP),vN)),2.4);gl_FragColor=vec4(mix(c,vec3(1.),.5),f*.55);}'}));sc.add(atm);
    {const sg=new THREE.BufferGeometry();const sp=[];const r=srand(9);for(let i=0;i<1200;i++){const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize().multiplyScalar(400+r()*100);sp.push(p.x,p.y,p.z)}sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
      const st=new THREE.Points(sg,new THREE.PointsMaterial({color:'#fff6e0',size:1.8,transparent:true,opacity:0,fog:false}));sc.add(st);G_.stars=st}
    Object.assign(G_,{scene:sc,sun,hemi,fill,inter:[],yards:[],gates:[],lights:[],clouds:[],ticks:[],trees:[],rocks:[]});
    /* grosse Planeten: Natur wird in Chunks um den Spieler gestreamt */G_.stream=G_.lod&&(Rr>70||!!window.FORCE_STREAM);
    SCATTER.reset(sc,Rr,M,G_.stream?{fill:fillChunk,unload:unloadChunkRefs}:null);
    buildPlaces();buildStones();try{buildDocks()}catch(e){console.warn('Stege',e)}try{buildCaves()}catch(e){console.warn('Höhlen',e)}scatterWorld();buildGrass();
    if(G_.stream){const lp=SAVE.lastPos&&SAVE.lastPos.planet===pid?new V3(...SAVE.lastPos.p).normalize():(fns.places.find(p=>p.build==='plaza')||{dir:UPV}).dir;SCATTER.stream(lp,0,true)}buildClouds();buildBall();if(typeof WEATHER!=='undefined')WEATHER.build(G_);else buildWeather();SCATTER.finalize();
    /* nach dem Aufbau: Höhe exakt aus der sichtbaren Kachel (Figuren stehen genau auf dem Boden) */if(G_.lod){const fh=fns.hAt;G_.hAt=p=>{const h=PLANETLOD.height(p);return h==null?fh(p):h}}
    cam.far=Rr*6+500;cam.updateProjectionMatrix();
    comp=makeComposer(R,sc,cam);scene=sc;return sc}

  /* ---------- Hilfen Oberfläche ---------- */
  const surfR=(p,water)=>{const h=G_.hAt(p);return G_.R+(water&&h<G_.sea?G_.sea:h)};
  const onSurf=(p,off,water)=>p.clone().multiplyScalar(surfR(p,water)+(off||0));
  const isLand=p=>G_.hAt(p)>G_.sea+.05;
  function placeObj(o,p,yaw,off){o.position.copy(onSurf(p,off||0));o.quaternion.setFromUnitVectors(UPV,p);if(yaw)o.rotateY(yaw)}
  function faceTo(o,p,dirWorld){o.up.copy(p);o.lookAt(o.position.clone().add(dirWorld))}
  /* Zufallspunkt im Umkreis (grosse Planeten: Dinge erscheinen dort, wo gespielt wird, nicht verstreut über den ganzen Planeten) */
  function randAround(r,rad,center){const c=center||(me?me.p:((G_.places||[]).find(p=>p.id==='platz')||{dir:UPV}).dir);const t=tangentTo(c,new V3(r()-.5,r()-.5,r()-.5));if(!isFinite(t.x))return c.clone();const ang=Math.sqrt(r())*rad/G_.R;return c.clone().applyAxisAngle(new V3().crossVectors(c,t).normalize(),ang).normalize()}
  function randLand(r,minH,maxH,tries,rad){for(let i=0;i<(tries||80);i++){const p=G_.stream?randAround(r,rad||90):new V3(r()*2-1,r()*2-1,r()*2-1).normalize();const h=G_.hAt(p);if(h>(minH??G_.sea+.3)&&h<(maxH??99))return p}return null}
  const nearPlace=(p,pad)=>G_.places.some(pl=>angle(p,pl.dir)<pl.r*(pl.park?.24:(pad||1.25)))||(G_.paths||[]).some(([a,b])=>distToArc(p,a,b)<.05);

  function smartMerge(o){const keep=[...(o.userData.keep||[]),o.userData.rocket,o.userData.flag].filter(Boolean);try{if(o.userData.tick)mergeCreature(o,keep);else mergeGroup(o,keep)}catch(e){console.warn('merge',e)}}
  /* ---------- Wasserball zum Kicken ---------- */
  function buildBall(){const pl=G_.places.find(p=>p.id==='platz');if(!pl)return;const g=new THREE.Group();QF=.8;const cols=['#F0556E','#FFFDF7','#FFD85A','#FFFDF7','#56C6B6','#FFFDF7'];
    for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.42,16,12,i*TAU/6,TAU/6),M.c(cols[i],{gloss:1}));g.add(m)}P(g,G.s(.08),M.c('#FFFDF7'),[0,.42,0]);QF=1;addOutlines(g);g.traverse(o=>{if(o.isMesh)o.castShadow=HIGH});
    const p=pl.dir.clone().applyAxisAngle(new V3(0,0,1),.12).normalize();G_.scene.add(g);G_.ball={g,p,v:new V3(),spin:new THREE.Quaternion(),r:.42}}
  function stepBall(dt){const b=G_.ball;if(!b||!me)return;const d=angle(b.p,me.p)*G_.R;
    if(d<.95&&me.speed>.2){const dir=tangentTo(b.p,b.p.clone().sub(me.p));if(isFinite(dir.x)){b.v.copy(dir.multiplyScalar(me.speed*1.35+1.5));SND.play('soft',{vol:.7,rate:1.3});W.fx(b.p,'stern',3)}}
    for(const e of ents.values()){if(e===me||e.kind==='peer')continue;const de=angle(b.p,e.p)*G_.R;if(de<.8&&b.v.length()>.5){const dir=tangentTo(b.p,b.p.clone().sub(e.p));if(isFinite(dir.x)){b.v.reflect(dir).multiplyScalar(.7);if(Math.random()<.5)say(e,pick(['Hey!','Uff!','Tor!','Hoppla!']),1.5)}}}
    const sp=b.v.length();if(sp>.01){const dir=b.v.clone().normalize();const ang=sp*dt/G_.R;const axis=new V3().crossVectors(b.p,dir).normalize();const np=b.p.clone().applyAxisAngle(axis,ang).normalize();
      let hit=false;for(const o of obstAround(np,3)){if(angle(np,o.p)*G_.R<o.r+b.r){hit=true;const n=tangentTo(np,np.clone().sub(o.p));b.v.reflect(n).multiplyScalar(.75);SND.play('soft',{vol:.4,rate:1.6});break}}
      if(!hit){b.p.copy(np);b.v.applyAxisAngle(axis,ang);b.v.copy(tangentTo(b.p,b.v).multiplyScalar(sp))}
      b.g.rotateOnWorldAxis(axis,sp*dt/b.r);const slope=G_.hAt(b.p)<G_.sea?.985:.975;b.v.multiplyScalar(Math.pow(slope,dt*60))}
    const h=G_.hAt(b.p);b.g.position.copy(b.p).multiplyScalar(G_.R+Math.max(h,G_.sea-.1)+b.r*.95)}
  /* ---------- Gras: flauschige Büschel, je Chunk instanziert ---------- */
  const grassU={value:0};let tuftGeo=null,tuftMat=null;
  /* Gras für einen Chunk: ein InstancedMesh (Streaming) */
  function grassFor(r,N,sample){tuftGeo=tuftGeo||tuftGeometry();tuftMat=tuftMat||grassMaterial(grassU);const list=[];const col=new THREE.Color();
    for(let i=0;i<N;i++){const p=sample();if(!p)continue;const h=hEx(p);if(h<G_.sea+.15)continue;const b=BIOMES[G_.biomeAt(p,h)];if(!b.grass||r()>b.grassD)continue;if(G_.roadDist(p)<.02||nearPlace(p,.85))continue;
      if(Math.abs(hEx(p.clone().applyAxisAngle(UPV,.004))-h)>.25)continue;col.set(b.grass).offsetHSL((r()-.5)*.03,(r()-.5)*.08,(r()-.5)*.08);list.push({p,h,s:.75+r()*.7,yaw:r()*TAU,c:col.clone()})}
    if(!list.length)return null;const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),q2=new THREE.Quaternion(),sv=new V3();const im=new THREE.InstancedMesh(tuftGeo,tuftMat,list.length);im.frustumCulled=false;im.receiveShadow=true;
    list.forEach((t,i)=>{q.setFromUnitVectors(UPV,t.p);q2.setFromAxisAngle(UPV,t.yaw);q.multiply(q2);sv.set(t.s,t.s*(.8+t.s*.3),t.s);m4.compose(t.p.clone().multiplyScalar(G_.R+t.h-.02),q,sv);im.setMatrixAt(i,m4);im.setColorAt(i,t.c)});im.userData.small=true;return im}
  function buildGrass(){if(SCATTER.streaming)return;tuftGeo=tuftGeo||tuftGeometry();tuftMat=tuftMat||grassMaterial(grassU);const r=srand(5);const area=4*PI*G_.R*G_.R;const N=Math.round(area*(HIGH?.55:.22));
    const per=new Map();const col=new THREE.Color(),tmp=new THREE.Color();
    for(let i=0;i<N;i++){const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize();const h=G_.hAt(p);if(h<G_.sea+.15)continue;const b=BIOMES[G_.biomeAt(p,h)];if(!b.grass||r()>b.grassD)continue;if(G_.roadDist(p)<.02||nearPlace(p,.85))continue;
      if(Math.abs(G_.hAt(p.clone().applyAxisAngle(UPV,.004))-h)>.25)continue;
      const c=SCATTER.chunkOf(p);let a=per.get(c);if(!a)per.set(c,a=[]);col.set(b.grass).offsetHSL((r()-.5)*.03,(r()-.5)*.08,(r()-.5)*.08);a.push({p,s:.75+r()*.7,yaw:r()*TAU,c:col.clone()})}
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),q2=new THREE.Quaternion(),sv=new V3();
    for(const[c,list]of per){const im=new THREE.InstancedMesh(tuftGeo,tuftMat,list.length);im.frustumCulled=false;im.receiveShadow=true;
      list.forEach((t,i)=>{q.setFromUnitVectors(UPV,t.p);q2.setFromAxisAngle(UPV,t.yaw);q.multiply(q2);sv.set(t.s,t.s*(.8+t.s*.3),t.s);m4.compose(t.p.clone().multiplyScalar(G_.R+G_.hAt(t.p)-.02),q,sv);im.setMatrixAt(i,m4);im.setColorAt(i,t.c)});
      G_.scene.add(im);SCATTER.chunks[c].meshes.push(im)}}
  /* ---------- Wolken ---------- */
  function buildClouds(){const cm=cozy({color:'#ffffff',rim:.8,rimColor:'#ffffff'});cm.userData.noBake=true;const NC=HIGH?26:16;for(let i=0;i<NC;i++){const g=new THREE.Group();const r=srand(40+i);QF=.6;const np=5+Math.floor(r()*5),w=2.5+r()*3;range(np,(t,j)=>{const x=(t-.5)*w,rr=.8+r()*.9*(1-Math.abs(t-.5));P(g,G.s(rr),cm,[x,r()*.5+rr*.3,(r()-.5)*1.4],null,[1,.72,.95])});P(g,G.s(1),cm,[0,-.1,0],null,[w*.55,.35,.9]);QF=1;g.traverse(o=>{if(o.isMesh){o.castShadow=true}});mergeGroup(g);
    const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize();const ax=new V3().crossVectors(p,new V3(r(),r(),r()).normalize()).normalize();G_.scene.add(g);g.scale.setScalar(.8+r()*.7);G_.clouds.push({g,p,ax,sp:.006+r()*.012,i,h:7+r()*6})}}
  function stepClouds(dt){const lim=G_.stream&&me?Math.cos(120/G_.R):-2;for(const c of G_.clouds){c.p.applyAxisAngle(c.ax,c.sp*dt).normalize();
      /* grosse Planeten: Wolken ziehen mit dem Spieler mit (weit entfernte tauchen vorn wieder auf) */if(c.p.dot(me?me.p:c.p)<lim){c.p.copy(randAround(Math.random,110,me.p));c.sp=.03+Math.random()*.03}c.g.position.copy(c.p).multiplyScalar(G_.R+(c.h||9));c.g.quaternion.setFromUnitVectors(UPV,c.p)}}

  /* ---------- Natur verstreuen: Biome, ohne Überschneidungen ---------- */
  function makeNature(type,opt,seed){const n=NATURE[type];const g=new THREE.Group();QF=HIGH?.7:.5;try{if(n)n.b(g,M,Object.assign({planet:G_.def&&G_.def.mine?'kompost':G_.id},opt||{}),srand(seed||1));else P(g,G.s(.3),M.c('#7CC46A'),[0,.3,0])}catch(e){console.warn('Natur',type,e)}QF=1;addOutlines(g);if(!g.userData.tick)mergeGroup(g,g.userData.fruits);return g}
  function addObst(p,r,ref){return SCATTER.obstAdd(p.clone().normalize().multiplyScalar(G_.R+(G_.hExact||G_.hAt)(p)),r,ref)}
  function obstAround(p,rad){return SCATTER.obstNear(p.clone().multiplyScalar(G_.R+G_.hAt(p)),rad||3)}
  function flatAt(p,rad){const hf=G_.hExact||G_.hAt;const h=hf(p);const t1=tangentTo(p,new V3(1,0,0)),t2=new V3().crossVectors(p,t1);const a=rad/G_.R;let m=0;
    for(const d of[t1,t2,t1.clone().negate(),t2.clone().negate()]){const q=p.clone().addScaledVector(d,a).normalize();m=Math.max(m,Math.abs(hf(q)-h))}return m}
  const SIZE={big:1,mid:.55,small:.25,tiny:.08};
  const PASSES=[['trees','treeD',2.4,.7,true,1.6],['rocks','rockD',1.5,.35,true,1.8],['deco','decoD',10,.06,false,2.6]];
  const pickW=(list,r)=>{let s=0;for(const x of list)s+=x[1];let t=r()*s;for(const x of list){t-=x[1];if(t<=0)return x}return list[0]};
  const hEx=p=>(G_.hExact||G_.hAt)(p);
  /* eine Stelle prüfen und ggf. bepflanzen (gemeinsam für einmaliges Verstreuen und Chunk-Streaming) */
  function scatterPoint(pass,p,r){const[key,dk,maxD,pad,solid]=pass;const h=hEx(p);const bid=G_.biomeAt(p,h);const B=BIOMES[bid];const list=B[key];if(!list||!list.length)return;if(r()>(B[dk]||0)/maxD)return;
    const[type,,opt]=pickW(list,r);const info=NATURE[type]||{};const water=opt&&opt.water;
    if(!water&&h<G_.sea+.12)return;if(water&&(h>G_.sea-.1||h<G_.sea-1.2))return;
    const rad=Math.max(.12,info.r||(key==='deco'?.15:.4));if(nearPlace(p,1.05))return;if(G_.roadDist(p)<(solid?.034:.022))return;
    const fl=flatAt(p,Math.max(.4,rad));if(fl>(key==='deco'?.3:.24))return;
    const wp=p.clone().multiplyScalar(G_.R+h);if(!SCATTER.occFree(wp,rad+pad))return;
    const sc=.85+r()*.35;const inst=SCATTER.add(type,opt||null,p,{yaw:r()*TAU,scale:sc,variant:Math.floor(r()*3),off:water?0:-.03-fl*.9});if(water)inst.water=true;
    SCATTER.occAdd(wp,rad*sc+(solid?.15:0));
    if(solid&&info.r){if(info.cols){for(const[cx,cz,cr]of info.cols){const lp=new V3(cx,0,cz).applyAxisAngle(UPV,inst.yaw).multiplyScalar(sc);const t1=tangentTo(p,new V3(0,0,1));const t2=new V3().crossVectors(p,t1);const pp=p.clone().addScaledVector(t1,lp.z/G_.R).addScaledVector(t2,lp.x/G_.R).normalize();addObst(pp,cr*sc)}}
      else{const shake=info.shake||(inst.pr.hasFruit&&key==='trees');const ref=shake?{kind:'tree',inst,p,fruit:fruitIdFor(type,opt,inst),hasFruit:inst.pr.hasFruit,regrow:0}:(key==='rocks'&&info.r>.6?{kind:'rock',inst,p,hits:0}:null);
        addObst(p,info.r*sc,ref);if(ref&&ref.kind==='tree')G_.trees.push(ref);if(ref&&ref.kind==='rock')G_.rocks.push(ref)}}}
  function scatterWorld(){if(SCATTER.streaming)return;const r=srand({kompost:11,schrott:22,korallen:33,frost:44,wueste:55,pilz:66}[G_.id]);const area=4*PI*G_.R*G_.R;const q=HIGH?1:.6;
    for(const pass of PASSES){const n=Math.round(area/100*pass[2]*q*pass[5]);for(let i=0;i<n;i++)scatterPoint(pass,new V3(r()*2-1,r()*2-1,r()*2-1).normalize(),r)}}
  /* Streaming: einen Chunk füllen (immer gleich dank eigenem Zufalls-Seed) */
  function fillChunk(ci,ch){const r=srand(({kompost:11,schrott:22,korallen:33,frost:44,wueste:55,pilz:66}[G_.id]||hashStr(G_.id).length)*100003+ci*7919+1);const area=4*PI*G_.R*G_.R/SCATTER.K;const q=HIGH?1:.6;const os=SCATTER.oversample();
    for(const pass of PASSES){const n=Math.round(area/100*pass[2]*q*pass[5]*os);for(let i=0;i<n;i++){const p=SCATTER.randIn(ci,r);if(p)scatterPoint(pass,p,r)}}
    const g=grassFor(r,Math.round(area*(HIGH?.55:.22)*os),()=>SCATTER.randIn(ci,r));if(g){G_.scene.add(g);ch.meshes.push(g)}}
  function unloadChunkRefs(ch){G_.trees=G_.trees.filter(t=>t.inst.chunk!==ch.i);G_.rocks=G_.rocks.filter(t=>t.inst.chunk!==ch.i)}
  function fruitIdFor(type,opt,inst){if(opt&&opt.fruit)return opt.fruit;const ids=inst.pr.fruitIds||[];const f=ids.find(x=>x&&x.startsWith('frucht_'));const k=f?f.slice(7):null;
    const map={beere:'beeren',kristall:'seeglas',led:'schraube',kokosnuss:'kokosnuss',apfel:'apfel',birne:'birne',kirsche:'kirsche',pfirsich:'pfirsich',orange:'orange',kaktusfrucht:'kaktusfrucht',zapfen:'kiefernzapfen'};return map[k]||(ITEMS.some(i=>i.id===k)?k:null)}
  /* ---------- Wetter: Schnee, Sporen, Sand, Blüten, Funken, Blasen ---------- */
  function buildWeather(){const kind=G_.def.weather;const n=HIGH?700:300;const g=new THREE.BufferGeometry();const pos=new Float32Array(n*3);const r=srand(3);for(let i=0;i<n*3;i++)pos[i]=(r()-.5)*40;g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const col={schnee:'#ffffff',sporen:'#B8FFE8',sand:'#F2CFA0',blueten:'#FFB8D8',funken:'#FFE27A',blasen:'#E8FAFF'}[kind]||'#fff';
    const tex=ctex('wp-'+kind,32,32,(x,w,h)=>{const gr=x.createRadialGradient(16,16,1,16,16,15);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)});
    const m=new THREE.PointsMaterial({color:col,size:kind==='schnee'?.22:kind==='sand'?.12:.16,map:tex,transparent:true,depthWrite:false,opacity:.85,blending:kind==='sporen'||kind==='funken'?THREE.AdditiveBlending:THREE.NormalBlending});
    const pts=new THREE.Points(g,m);pts.frustumCulled=false;G_.scene.add(pts);G_.weather={pts,kind,n}}
  function stepWeather(dt,t){const W_=G_.weather;if(!W_||!me)return;const up=me.p;const a=W_.pts.geometry.attributes.position;const base=me.g.position;const k=W_.kind;
    const fall=k==='schnee'?-1.2:k==='blueten'?-.6:k==='sand'?-.2:k==='blasen'?.8:k==='funken'?.6:.25;const side=k==='sand'?4:k==='blueten'?1:.4;
    for(let i=0;i<W_.n;i++){let x=a.getX(i),y=a.getY(i),z=a.getZ(i);y+=fall*dt;x+=Math.sin(t*.7+i)*side*dt;z+=Math.cos(t*.5+i*1.3)*side*.5*dt;
      if(y<-4)y+=16;if(y>12)y-=16;if(x>20)x-=40;if(x<-20)x+=40;if(z>20)z-=40;if(z<-20)z+=40;a.setXYZ(i,x,y,z)}a.needsUpdate=true;
    W_.pts.position.copy(base);W_.pts.quaternion.setFromUnitVectors(UPV,up)}
  /* ---------- Gebäude & Orte ---------- */
  /* Wortsteine (fremde Ruinen): bringen je ein Wort der Planetensprache bei */
  function buildStones(){if(typeof LANG==='undefined'||!LANG.has(G_.id))return;const r=srand(hashStr('stones'+G_.id).length*313+7);const seen=SAVE.stones||{};let n=0;
    for(let i=0;i<400&&n<(G_.stream?12:7);i++){const p=randLand(r,G_.sea+.4,99,80,G_.R*1.4);if(!p||nearPlace(p,2.2))continue;if(G_.places.some(pl=>pl.dir.angleTo(p)*G_.R<14))continue;{const h0=G_.hAt(p),t1=tangentTo(p,new V3(1,0,0)),t2=new V3().crossVectors(p,t1);let bad=false;for(let k=0;k<8&&!bad;k++){const a2=k/8*TAU;const q=p.clone().addScaledVector(t1,Math.cos(a2)*5.5/G_.R).addScaledVector(t2,Math.sin(a2)*5.5/G_.R).normalize();if(Math.abs(G_.hAt(q)-h0)>.45)bad=true}if(bad)continue}const id=G_.id+'-st'+n;
      const g=LANG.stoneModel(G_.id,M);addOutlines(g);let ru=null;try{ru=LANG.ruin(G_.id,ARCH.hashNum(id),G_.R);g.add(ru.g)}catch(e){console.warn('Ruine',e)}placeObj(g,p,r()*TAU,-.05);G_.scene.add(g);G_.ticks.push(g);addObst(p,.8);g.updateMatrixWorld(true);if(ru){/* jedes Ruinenteil auf den Boden darunter setzen */const h0=G_.hAt(p);for(const ch of ru.g.children){const d=ch.getWorldPosition(new V3()).normalize();ch.position.y+=G_.hAt(d)-h0}g.updateMatrixWorld(true);for(const c of ru.cols){addObst(g.localToWorld(new V3(c[0],0,c[1])).normalize(),c[2])}}const st={id,used:!!seen[id]};
      G_.inter.push({kind:'stone',p,r:2,label:'Wortstein lesen',act:()=>LANG.stone(G_.id,st)});if(n===0&&typeof STORY!=='undefined'){const si=Object.keys(PLANETS).indexOf(G_.id);const got=(SAVE.story&&SAVE.story.shards||[]).includes(si);if(!got){const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.28,0),M.glow('#C8A0FF',2.2));cr.position.set(1.4,1.2,1.4);g.add(cr);const t0=g.userData.tick;g.userData.tick=t=>{t0&&t0(t);cr.rotation.y=t*1.5;cr.position.y=1.2+Math.sin(t*2)*.12};
        const sp=g.localToWorld(new V3(1.4,0,1.4)).normalize();const it={kind:'shard',p:sp,r:1.6,label:'Leuchtenden Splitter berühren',act:()=>{if(STORY.shard(si)){cr.visible=false;G_.inter.splice(G_.inter.indexOf(it),1)}}};G_.inter.push(it)}}G_.places.push({id,n:'Ruine',dir:p.clone(),r:6.5/G_.R});n++}}
  /* ---------- Boote: Stege am Ufer, Ruderboot für Inseln und Meere ---------- */
  function makeBoat(){const g=new THREE.Group();QF=HIGH?.8:.55;const hull=M.c('#D8674E',{gloss:.4}),wood=M.c('#C99466'),dark=M.c('#8A5A40');
    /* Rumpf: gerundet, vorn spitz, weisser Streifen */const sh=new THREE.Shape();sh.moveTo(0,1.15);sh.quadraticCurveTo(.52,.7,.5,0);sh.lineTo(.46,-.8);sh.quadraticCurveTo(.44,-1.02,0,-1.04);sh.quadraticCurveTo(-.44,-1.02,-.46,-.8);sh.lineTo(-.5,0);sh.quadraticCurveTo(-.52,.7,0,1.15);
    const hg=G.puff(sh,.34,.1);hg.rotateX(PI/2);P(g,hg,hull,[0,.12,0],null,[1,1,1]);P(g,G.puff(sh,.06,.02).rotateX(PI/2),M.c('#FFF6E6'),[0,.25,0],null,[1.02,1,1.02]);
    const inner=new THREE.Shape();inner.moveTo(0,.9);inner.quadraticCurveTo(.38,.5,.36,0);inner.lineTo(.33,-.72);inner.quadraticCurveTo(.3,-.86,0,-.87);inner.quadraticCurveTo(-.3,-.86,-.33,-.72);inner.lineTo(-.36,0);inner.quadraticCurveTo(-.38,.5,0,.9);
    P(g,G.ex(inner,.04,.01).rotateX(PI/2),wood,[0,.27,0]);for(let i=0;i<5;i++)P(g,G.bx(.02,.012,1.5,0),dark,[-.24+i*.12,.315,-.05]);
    P(g,G.bx(.74,.06,.24,.03),wood,[0,.38,.05]);P(g,G.bx(.6,.06,.2,.03),wood,[0,.38,-.62]);
    /* Ruder */const oars=[];for(const s of[-1,1]){const o=new THREE.Group();o.position.set(s*.5,.42,.05);P(o,G.cy(.022,.022,1.3),wood,[s*.45,0,0],[0,0,PI/2]);P(o,G.bx(.34,.02,.14,.01),wood,[s*1.05,0,0]);g.add(o);oars.push(o)}
    /* Laterne am Bug */P(g,G.cy(.015,.015,.4),dark,[0,.55,.85]);P(g,G.s(.07),M.glow('#FFD27A',1.6),[0,.78,.85]);P(g,G.cy(.07,.09,.05),dark,[0,.84,.85]);
    QF=1;addOutlines(g);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});g.userData.oars=oars;return g}
  function moorBoat(b,p,dir){b.p.copy(p);b.dir.copy(dir);b.moving=false;if(!b.it){b.it={kind:'boat',p:b.p,r:1.7,label:'Ins Boot steigen',act:()=>board(b)};G_.inter.push(b.it)}}
  function board(b){if(!me||me.boat)return;me.boat=b;me.p.copy(b.p);me.dir.copy(tangentTo(me.p,b.dir));const i=G_.inter.indexOf(b.it);if(i>=0)G_.inter.splice(i,1);b.it=null;SND.play('soft',{vol:.6,rate:.8});UI.toast('Rudern: einfach losfahren. Am Ufer steigst du von selbst aus.',3200)}
  function leaveBoat(e,land){const b=e.boat;e.boat=null;moorBoat(b,e.p.clone(),e.dir.clone());e.p.copy(land);SND.play('step_grass',{vol:.4})}
  function buildDocks(){G_.boats=[];const r=srand(hashStr('dock'+G_.id).length*131+5);const out=[];const hx=G_.hExact||G_.hAt;
    for(let i=0;i<500&&out.length<(G_.stream?4:2);i++){const p=randLand(r,G_.sea+.08,G_.sea+.7,1,G_.stream?140:G_.R*1.5);if(!p||nearPlace(p,1.3))continue;if(out.some(q=>angle(q,p)*G_.R<25))continue;
      /* Richtung zum Wasser: tiefes Wasser 2–3 Einheiten entfernt */let best=null;for(let k=0;k<12;k++){const a=k/12*TAU;const t1=tangentTo(p,new V3(Math.cos(a),.3,Math.sin(a)));if(!isFinite(t1.x))continue;const q=p.clone().addScaledVector(t1,2.6/G_.R).normalize();if(hx(q)<G_.sea-.7){best=t1;break}}
      if(!best)continue;out.push(p);
      /* Steg */const g=new THREE.Group();const wood=M.c('#B8845A'),dk=M.c('#8A5A40');for(let k=0;k<6;k++)P(g,G.bx(1.1,.08,.36,.03),k%2?wood:M.c('#C99466'),[0,.28,.2+k*.42]);for(const s of[-1,1])for(let k=0;k<3;k++)P(g,G.cy(.07,.08,1.4),dk,[s*.5,-.2,.25+k*1.05]);
      P(g,G.to(.08,.025),M.c('#E8D8B8'),[.5,.52,2.3],[PI/2,0,0]);addOutlines(g);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});mergeGroup(g);
      placeObj(g,p,0,-.05);faceTo(g,p,best);G_.scene.add(g);
      const bp=p.clone().addScaledVector(best,3.1/G_.R).normalize();const bg=makeBoat();G_.scene.add(bg);const b={g:bg,p:bp.clone(),dir:tangentTo(bp,best.clone().applyAxisAngle(bp,PI/2)),it:null};moorBoat(b,bp,b.dir);G_.boats.push(b)}}
  function poseBoats(dt,t){for(const b of G_.boats||[]){const riding=me&&me.boat===b;const p=riding?me.p:b.p,dir=riding?me.dir:b.dir;const bob=Math.sin(t*1.6+b.p.x*9)*.05;
      b.g.position.copy(p).multiplyScalar(G_.R+G_.sea-.08+bob);b.g.up.copy(p);b.g.lookAt(b.g.position.clone().add(dir));b.g.rotateZ(Math.sin(t*1.2+b.p.z*7)*.04);
      const rowing=riding&&me.speed>.1;for(const[i,o]of b.g.userData.oars.entries()){const s=i?1:-1;o.rotation.y=rowing?Math.sin(t*5)*.6*s:.15*s;o.rotation.z=rowing?(Math.cos(t*5)*.18-.12)*s:-.2*s}}}
  /* ---------- Höhlen: Felstore am Fuss von Hängen ---------- */
  /* ---------- Höhlen: Eingänge nur in echten Felswänden (hohe, steile Hänge über die ganze Breite) ---------- */
  function buildCaves(){if(typeof CAVES==='undefined')return;const r=srand(hashStr('cave'+G_.id).length*211+9);const hx=G_.hExact||G_.hAt;const out=[];
    const at=(p,dir,side,f,l)=>{const q=p.clone().addScaledVector(dir,f/G_.R).addScaledVector(side,l/G_.R).normalize();return hx(q)};
    for(let i=0;i<9000&&out.length<(G_.stream?5:3);i++){const p=randLand(r,G_.sea+.4,99,1,G_.stream?300:G_.R*1.5);if(!p||nearPlace(p,1.6))continue;if(out.some(q=>angle(q,p)*G_.R<28))continue;if(flatAt(p,.9)>.45)continue;
      const h=hx(p);let back=null,bd=0;for(let k=0;k<16;k++){const a=k/16*TAU;const t1=tangentTo(p,new V3(Math.cos(a),.17,Math.sin(a)));if(!isFinite(t1.x))continue;const d=at(p,t1,t1,3.2,0)-h;if(d>bd){bd=d;back=t1}}
      if(!back||bd<1.9)continue;const side=new V3().crossVectors(p,back).normalize();
      /* Wand über die ganze Breite: links und rechts ebenfalls hoch; vorn frei und eben */
      const wl=at(p,back,side,3.2,-1.3)-h,wr=at(p,back,side,3.2,1.3)-h;if(Math.min(wl,wr)<1.5)continue;
      const front=back.clone().negate();{const hf=at(p,front,side,2,0);if(Math.abs(hf-h)>.6||hf<G_.sea+.2)continue}
      const rise=Math.min(bd,wl,wr);out.push(p);const id=G_.id+'-hoehle'+out.length;
      /* Eingang in den Hang schieben; Höhe an die Wand anpassen (Oberkante trifft die Hangkante) */const pos=p.clone().addScaledVector(back,1.1/G_.R).normalize();const k=Math.max(.62,Math.min(1.15,(rise+.35)/3.2));
      const B=BIOMES[G_.biomeAt(pos,hx(pos))]||{};const g=CAVES.entrance(M,G_.id,{rock:B.cliff,grass:B.grass||(B.g&&B.g[0])});g.scale.setScalar(k);placeObj(g,p.clone().addScaledVector(back,.9/G_.R).normalize(),0,-.18);faceTo(g,g.position.clone().normalize(),front);
      g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});G_.scene.add(g);
      for(const s2 of[-1,1])addObst(pos.clone().addScaledVector(side,s2*1.3*k/G_.R).normalize(),.55*k);addObst(pos.clone().addScaledVector(back,1/G_.R).normalize(),1);
      const seed=hashStr(id).length*7919+out.length*131+G_.id.length;G_.inter.push({kind:'cave',p:p.clone().addScaledVector(front,.7/G_.R).normalize(),r:1.7,label:'Höhle betreten',act:()=>CAVES.enter({seed,id})});
      G_.places.push({id,n:'Höhle',dir:p.clone(),r:3.6/G_.R})}}
  function buildPlaces(){for(const pl of G_.places){if(!pl.build)continue;if(pl.build==='zoopark'){try{ZOO.buildPark(pl)}catch(e){console.warn('Tierpark',e)}continue}const g=new THREE.Group();let obj=null;
      QF=HIGH?.7:.42;try{
        if(pl.build==='plaza')obj=buildPlaza(pl);
        else if(TOWN.kinds.includes(pl.build))obj=TOWN.build(pl.build,G_.id,M);
        else if(pl.build==='rocket'&&window.buildRocketPad){obj=buildRocketPad(M);try{ROCKET.dress(obj.userData.rocket,M)}catch(e){console.warn('Rakete',e)}}
        else if(pl.build==='house'&&window.buildHouse){const vis=G_.def.mine&&MYPLANET.visiting;obj=buildHouse(vis?(vis.mp.house||SAVE.house.style):SAVE.house.style,M);if(!vis)G_.houseObj=obj;else obj.userData.visitHouse=vis.nick}
        else if(pl.build==='residence')obj=HOMES.build(pl,M);
      }catch(e){console.warn('Gebäude',pl.build,e)}QF=1;
      if(!obj){obj=new THREE.Group();P(obj,G.bx(3,2.4,3,.4),M.c('#FFE3B8'),[0,1.2,0]);P(obj,G.co(2.6,1.6),M.c('#F0556E'),[0,3.2,0])}
      if(pl.build!=='plaza')addOutlines(obj);obj.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});smartMerge(obj);if(obj.userData.tick)G_.ticks.push(obj);g.add(obj);
      /* Gebäude zeigen zum Dorfplatz */
      const plaza=G_.places.find(x=>x.id==='platz');let yaw=0;{/* Gebäude so tief setzen, dass auch der Rand auf dem gekrümmten Boden aufliegt */const rr=(obj.userData.r||2.2);const t1=tangentTo(pl.dir,new V3(1,0,0)),t2=new V3().crossVectors(pl.dir,t1);const hc=G_.R+G_.hAt(pl.dir);let lo=0;
        for(let k=0;k<8;k++){const a=k/8*TAU;const q=pl.dir.clone().addScaledVector(t1,Math.cos(a)*rr/G_.R).addScaledVector(t2,Math.sin(a)*rr/G_.R).normalize();lo=Math.max(lo,hc-(G_.R+G_.hAt(q))*q.dot(pl.dir))}
        placeObj(g,pl.dir,0,pl.build==='plaza'?-.02:-.02-Math.min(.6,lo))}
      if(plaza&&pl!==plaza){const toward=tangentTo(pl.dir,plaza.dir);g.up.copy(pl.dir);g.lookAt(g.position.clone().add(toward))}
      G_.scene.add(g);pl.obj=g;const rad=(obj.userData.r||2.2);if(pl.build!=='plaza')addObst(pl.dir,obj.userData.obstR??rad);
      g.updateMatrixWorld(true);if(pl.build==='plaza'){settleKids(obj);registerPlaza(obj)}
      for(const c of(obj.userData.colliders||[])){const wp=g.localToWorld(new V3(c[0],0,c[1]));addObst(wp.normalize(),c[2])}
      registerAddons(g,obj);
      if(obj.userData.yard){const Y=obj.userData.yard;const wl=(x,z)=>obj.localToWorld(new V3(x,0,z)).normalize();obj.updateMatrixWorld(true);const y={obj,Y,c:pl.dir.clone(),gin:wl(...Y.gin),gout:wl(...Y.gout)};G_.yards.push(y);
        const gd=obj.userData.gate;if(gd){const pv=gd.pivot;pv.updateMatrixWorld(true);const a=pv.localToWorld(new V3(0,0,0)),b=pv.localToWorld(new V3(gd.w,0,0));
          const gate={pv,a:a.normalize(),b:b.normalize(),c:a.clone().add(b).normalize(),open:0,want:0,byKI:false,idle:0};y.gate=gate;G_.gates.push(gate);
          gate.it={kind:'gate',p:gate.c,r:1.1,label:'Gartentor öffnen',act:()=>{gate.want=gate.want>.5?0:1;gate.byKI=false;SND.play('soft',{vol:.5,rate:gate.want?1.25:.9})}};G_.inter.push(gate.it)}}
      /* Türpunkt: vor der Tür, aber sicher ausserhalb der Kollision, damit man ihn erreicht */
      const door=obj.userData.door?new V3(...obj.userData.door):new V3(0,0,rad+.8);door.y=0;const dl=Math.hypot(door.x,door.z)||1;const need=obj.userData.doorExact?0:rad+.9;if(dl<need){door.x*=need/dl;door.z*=need/dl;if(!door.x&&!door.z)door.z=need}
      const dw=g.localToWorld(door.clone());const dp=dw.clone().normalize();pl.doorP=dp;obj.traverse(o=>{if(o.isMesh)o.userData.place=pl})
      const label={museum:'Museum betreten',shop:'Laden betreten',studio:'Malen',rocket:'Reisen',house:'Nach Hause'}[pl.build];if(label)G_.inter.push({kind:pl.build,place:pl,p:dp,r:2.2,label});
      const nm=obj.userData.name||'';const ext={praxis:['Praxis betreten',()=>INTERIOR.enter('klinik')],mode:['Boutique betreten',()=>INTERIOR.enter('boutique')],casino:['Glücks-Salon betreten',()=>CASINO.enter()],bar:['Jazz-Bar betreten',()=>BUILDINGS.enter('bar')],rathaus:['Rathaus betreten',()=>BUILDINGS.enter('rathaus')],garage:['Raketen-Garage',()=>BUILDINGS.garage()],pflanzen:['Gärtnerei',()=>BUILDINGS.plants()],tiere:['Tierhandlung',()=>BUILDINGS.pets()]}[pl.build];
      if(ext)G_.inter.push({kind:pl.build,place:pl,p:dp,r:2.2,label:ext[0]+(nm?' · '+nm:''),act:ext[1]});
      if(pl.build==='residence')G_.inter.push({kind:'home',place:pl,p:dp,r:2,label:'Bei '+pl.whoName+' klingeln',act:()=>HOMES.knock(pl)})
      if(obj.userData.signPos&&typeof LANG!=='undefined'){const sp=g.localToWorld(new V3(obj.userData.signPos[0],0,obj.userData.signPos[1]+.5)).normalize();const txt=obj.userData.signText;G_.inter.push({kind:'sign',place:pl,p:sp,r:1.3,label:'Schild lesen',act:()=>LANG.read(G_.id,txt)})}}
    if(G_.id==='kompost'&&G_.houseObj){}
  }
  /* Kinder einer flachen Gruppe einzeln auf die gekrümmte Oberfläche setzen (sonst schweben sie am Rand) */
  function settleKids(g){g.updateMatrixWorld(true);const inv=new THREE.Quaternion();g.getWorldQuaternion(inv).invert();
    for(const o of g.children){const w=g.localToWorld(o.position.clone());const d=w.clone().normalize();const t=g.worldToLocal(d.clone().multiplyScalar(G_.R+G_.hAt(d)-.02));o.position.copy(t);
      const upL=d.clone().applyQuaternion(inv);const yaw=o.rotation.y;o.quaternion.setFromUnitVectors(UPV,upL);o.rotateY(yaw)}g.updateMatrixWorld(true)}
  function registerPlaza(g){g.updateMatrixWorld(true);g.children.forEach(o=>{const L=o.userData._lbl;const c=g.localToWorld(o.position.clone()).normalize();addObst(c,(o.userData.r||.8));if(!L)return;
      const wp=g.localToWorld(new V3(o.position.x,0,o.position.z).add(new V3(0,0,(o.userData.r||1)+.9).applyAxisAngle(UPV,o.rotation.y))).normalize();G_.inter.push({kind:L.kind,p:wp,r:2.2,label:L.label});o.traverse(m=>{if(m.isMesh)m.userData.place={build:L.kind,doorP:wp}})})}
  function buildPlaza(pl){const g=new THREE.Group();const fn=(f,...a)=>{try{return window[f]?window[f](...a):null}catch(e){console.warn(f,e);return null}};
    const add=(o,x,z,yaw,label,kind)=>{if(!o)return;addOutlines(o);o.position.set(x,0,z);o.rotation.y=yaw||0;g.add(o);if(label){const off=new V3(x,0,z+(o.userData.r||1)+.6);o.userData._lbl={label,kind,off}}};
    add(fn('buildFountain',M),0,0,0);add(fn('buildNoticeBoard',M),-3.4,-2.4,.5,'Anschlagbrett','board');
    add(fn('buildBench',M),-3.6,2.6,2.4);add(fn('buildBench',M),3.2,3.0,-2.4);add(fn('buildStreetLamp',M),-1.8,3.6,0);add(fn('buildStreetLamp',M),2.2,-.4,0);add(fn('buildMailbox',M),-1.5,-3.8,.3,'Briefkasten','mail');
    add(fn('buildSignpost',M,G_.def.n),1.2,3.4,.2);g.children.forEach(o=>{smartMerge(o);if(o.userData.tick)G_.ticks.push(o)});
    return g}

  /* ================= Figuren ================= */
  const ents=new Map();const labelsEl=$('labels');
  function makeEnt(d,o){o=o||{};const g=buildCreature(d,{q:o.q||(HIGH?.5:.32),noShadow:!HIGH,blob:false,fur:HIGH&&!!o.me,merge:true});g.scale.setScalar(CS);g.userData.wid=d.id;
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(.55,20),new THREE.MeshBasicMaterial({map:ctex('blob',128,128,(x,w,h)=>{const gr=x.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(60,40,90,.35)');gr.addColorStop(1,'rgba(60,40,90,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)}),transparent:true,depthWrite:false}));
    const mv=moveFor(d);const abs=abilitiesFor(d);const cd={};abs.forEach(a=>cd[a]=2+Math.random()*(ABIL[a].cd||8)*2);
    const p=o.p||randLand(Math.random,G_.sea+.4,99)||new V3(0,1,0);const dir=tangentTo(p,new V3(Math.random()-.5,Math.random()-.5,Math.random()-.5));
    const lbl=el('div','lbl'+(o.kind==='bot'?' bot':o.kind==='peer'?' online':o.kind==='me'?' me':''));lbl.textContent=d.name||'Namenlos';if(o.tag){const tg=el('span','tag'+(o.kind==='peer'?' on':''),o.tag);lbl.append(tg)}labelsEl.append(lbl);lbl.style.display='none';
    const bub=el('div','bubble');bub.hidden=true;labelsEl.append(bub);
    const e={d,g,shadow,p:p.clone(),dir,kind:o.kind||'villager',lbl,bub,mv:mv.m,move:MOVE[mv.m],water:mv.swim||MOVE[mv.m].water,fly:!!MOVE[mv.m].alt,abs,cd,phase:Math.random()*10,act:0,stop:0,dance:0,jump:0,sayT:0,emote:null,emoteT:0,
      goal:null,idleT:Math.random()*3,height:(g.userData.height||3)*CS,marked:0,energy:.8,home:p.clone(),speed:0,step:0,hidden:abs.some(a=>ABIL[a].flag==='hidden')};
    if(scene){scene.add(g);scene.add(shadow)}ents.set(d.id,e);return e}
  function dropEnt(id){const e=ents.get(id);if(!e)return;if(e.g.parent)e.g.parent.remove(e.g);if(e.shadow.parent)e.shadow.parent.remove(e.shadow);disposeTree(e.g);e.lbl.remove();e.bub.remove();ents.delete(id)}
  function say(e,txt,sec,emote){if(!e)return;txt=String(txt);if(e.d&&e.d.native&&typeof LANG!=='undefined'&&!txt.startsWith('icon:'))txt=LANG.garble(G_.id,txt);if(txt.startsWith('icon:')){e.bub.innerHTML=ICON(txt.slice(5));emote=true}else e.bub.textContent=txt;e.bub.classList.toggle('emote',!!emote);e.bub.hidden=false;e.sayT=sec||3.2}

  /* ---------- Spieler ---------- */
  let me=null;const input={x:0,y:0,run:false,joy:null};let camYaw=0,camPitch=.42,camDist=8.5,camF=new V3(1,0,0);let tapTarget=null;
  function avatarData(){const own=HOMES.avatar();const d=sanitize(Object.assign(JSON.parse(JSON.stringify(own||S)),SAVE.wear?{clothes:SAVE.wear}:{}));d.id='__me';if(!d.name.trim())d.name=SAVE.nick||'Du';return d}
  function spawnMe(){if(me)dropEnt('__me');const start=SAVE.lastPos&&SAVE.lastPos.planet===G_.id?new V3(...SAVE.lastPos.p).normalize():(G_.places.find(p=>p.id==='platz')||{dir:new V3(0,1,0)}).dir.clone().applyAxisAngle(new V3(1,0,0),6/G_.R).normalize();
    me=makeEnt(avatarData(),{kind:'me',p:start,q:HIGH?.9:.6,me:true});me.lbl.textContent=me.d.name;camSnap=true;camF=tangentTo(me.p,new V3(0,0,-1));if(camF.lengthSq()<.5)camF=tangentTo(me.p,new V3(1,0,0))}

  /* ================= Welt-API für Fähigkeiten (W) ================= */
  const K=.55;/* Winkel-Skala alter Fähigkeiten → neue Planetengrösse */
  const W={props:[],log:[]};
  W.near=(p,d)=>{for(let i=0;i<8;i++){const r=tangentTo(p,new V3().randomDirection());const q=p.clone().addScaledVector(r,d*K*(.35+Math.random()*.65)).normalize();if(isLand(q)&&!nearPlace(q,.9))return q}return p.clone()};
  W.ahead=(e,d)=>{const q=e.p.clone().addScaledVector(e.dir,d*K).normalize();return isLand(q)?q:e.p.clone()};
  const WATEROK=['koralle','pfuetze','oel','schleim','spur','tritt'];
  const LIMIT={baum:40,tanne:30,blume:60,pilz:40,schrott:30,kristall:30,koralle:20,stumpf:30,huette:12,mast:12,sandburg:12,statue:12,frucht:30,toast:10,kegel:16,rampe:12,doppelbaum:20,moos:50,pfuetze:30,oel:30,farbe:50,krater:16,schleim:50,spur:60,tritt:60,schrift:16,haufen:2};
  W.spawn=(type,p,opt)=>{const def=NATURE[type];if(!p||!scene||mode!=='outdoor')return null;if(!WATEROK.includes(type)&&!isLand(p))return null;
    const same=W.props.filter(x=>x.type===type&&!x.dying);if(same.length>=(LIMIT[type]||40))W.remove(same[0]);
    const g=makeNature(type,Object.assign({color:pick(['#FF8FB8','#FFE27A','#7FDCE6','#C6A9FF','#FF7E6B'])},opt||{}),Math.floor(Math.random()*999));g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH&&!(def&&def.decal);o.receiveShadow=true}});
    placeObj(g,p,Math.random()*TAU,-.02);g.scale.setScalar(.01);G_.scene.add(g);const pr={type,p:p.clone(),g,grow:0,growT:(def&&def.grow)||1.5,big:1,dying:0,decal:!!(def&&def.decal)};W.props.push(pr);return pr};
  W.remove=pr=>{if(pr&&!pr.dying)pr.dying=.001};
  W.replace=(pr,type)=>{const np=W.spawn(type,pr.p);W.remove(pr);return np};
  W.nearest=(types,p,maxA,excl)=>{let best=null,bd=1-Math.cos(maxA*K);for(const x of W.props){if(x.dying||x.carried||x===excl||!types.includes(x.type))continue;const d=1-x.p.dot(p);if(d<bd){bd=d;best=x}}return best};
  W.nearEnts=(e,maxA,n)=>{const out=[];const c=Math.cos(maxA*K);for(const o of ents.values()){if(o===e)continue;const d=o.p.dot(e.p);if(d>c)out.push([d,o])}return out.sort((a,b)=>b[0]-a[0]).slice(0,n||99).map(x=>x[1])};
  W.grow=(p,maxA,amt)=>{const c=Math.cos(maxA*K);for(const x of W.props){if(['baum','tanne','doppelbaum','blume','pilz','koralle'].includes(x.type)&&x.p.dot(p)>c)x.big=Math.min(1.6,x.big+amt)}};
  W.sunny=p=>G_.sun?p.dot(G_.sun.position.clone().normalize())>0.0:true;
  W.camo=()=>{};
  W.vine=t=>{if((t.vines||0)>=2)return;t.vines=(t.vines||0)+1;QF=.5;const k=t.vines;P(t.g,G.tu(range(12,(u)=>[Math.cos(u*TAU*2+k)*.18,u*1.1,Math.sin(u*TAU*2+k)*.18]),.03,.018),M.c('#5E9B4A'));range(4,(u,i)=>P(t.g,G.s(.08),M.c('#7CC46A'),[Math.cos(i*2+k)*.2,.25+u*.8,Math.sin(i*2+k)*.2],null,[1,.5,1.4]));QF=1};
  W.web=()=>{};W.link=()=>{};W.stream=()=>{};
  W.carry=(e,t)=>{W.remove(t);W.fx(e.p,'funke',5);W.say(e,'bringt Elektroschrott zum Recycling')};
  const FXK={herz:['#FF6F91','h'],note:['#FFC83D','n'],funke:['#FFF3A0','s'],tropfen:['#6AD0FF','d'],regen:['#8FD8FF','d'],blatt:['#6AB04A','o'],staub:['#C9A27A','o'],blase:['#DFF4FF','r'],pollen:['#FFD23A','o'],spore:['#F2EAD8','o'],
    feder:['#FFFFFF','o'],rauch:['#9A9AA8','o'],konfetti:['#FF3A6A','q'],tinte:['#403858','o'],dampf:['#FFFFFF','o'],fisch:['#FF8A2A','f'],blitz:['#FFFFFF','s'],daten:['#43D2C6','q'],stern:['#FFE27A','s'],wasser:['#FFFFFF','o']};
  const glyph={};function gtex(k){if(glyph[k])return glyph[k];glyph[k]=ctex('g-'+k,64,64,(x,w,h)=>{x.fillStyle='#fff';x.strokeStyle='#fff';x.lineWidth=6;x.beginPath();
    if(k==='h'){x.moveTo(32,54);x.bezierCurveTo(-4,30,14,2,32,20);x.bezierCurveTo(50,2,68,30,32,54);x.fill()}else if(k==='n'){x.font='bold 50px sans-serif';x.textAlign='center';x.fillText('♪',32,50)}
    else if(k==='s'){for(let i=0;i<10;i++){const a=i/10*TAU-PI/2,r=i%2?12:30;x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r)}x.fill()}else if(k==='d'){x.moveTo(32,6);x.quadraticCurveTo(56,40,32,58);x.quadraticCurveTo(8,40,32,6);x.fill()}
    else if(k==='r'){x.arc(32,32,22,0,TAU);x.stroke()}else if(k==='q'){x.fillRect(18,18,28,28)}else if(k==='f'){x.ellipse(28,32,20,11,0,0,TAU);x.fill();x.beginPath();x.moveTo(44,32);x.lineTo(60,20);x.lineTo(60,44);x.fill()}
    else{const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.6,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}});return glyph[k]}
  const parts=[];
  W.fx=(p,kind,n,at)=>{const sc=mode==='outdoor'?scene:INTERIOR.scene;if(!sc)return;const k=FXK[kind]||FXK.funke;const up=mode==='outdoor'?p.clone().normalize():UPV.clone();
    for(let i=0;i<(n||6);i++){if(parts.length>400)break;const col=kind==='konfetti'?pick(['#FF3A6A','#FFD23A','#43D2C6','#B8A6FF','#7CC46A']):k[0];
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:gtex(k[1]),color:col,transparent:true,depthWrite:false}));const base=at?at.clone():(mode==='outdoor'?onSurf(p,kind==='regen'?4:1.1,true):p.clone().add(new V3(0,1.1,0)));
      const t=tangentTo(up,new V3().randomDirection());sp.position.copy(base).addScaledVector(t,.2+Math.random()*.35);const sz=kind==='blitz'?2.4:['tinte','rauch','dampf'].includes(kind)?.5:.28;sp.scale.setScalar(sz);sc.add(sp);
      const upv=kind==='regen'||kind==='tropfen'||kind==='wasser'?-1.2:kind==='tinte'?.1:1;parts.push({sp,sc,v:up.clone().multiplyScalar(upv*(.8+Math.random()*.8)).addScaledVector(t,.6),life:kind==='blitz'?.25:1.3+Math.random()*.8,max:1.8,n:up,grav:kind==='wasser'?-6:kind==='konfetti'?-1:0})}};
  const tickerEl=$('ticker');
  W.say=(e,txt)=>{if(e===me)return;if(e.kind==='villager'&&Math.random()<.6)say(e,txt,2.6);if(e.p.dot(me?me.p:e.p)>Math.cos(.35))note(`${e.d.name||'Namenlos'} ${txt}`)};
  W.note=note;function note(txt){const d=el('div',null,txt);tickerEl.prepend(d);while(tickerEl.children.length>4)tickerEl.lastChild.remove();setTimeout(()=>d.remove(),7000)}

  /* ================= Bewohner:innen ================= */
  function syncVillagers(){if(!scene)return;const want=new Map(HOMES.residents(G_.id).map(d=>[d.id,d]));for(const[id,e]of[...ents])if(e.kind==='villager'&&!want.has(id))dropEnt(id);
    const r=srand(3);for(const[id,d]of want)if(!ents.has(id)){const home=G_.places.find(x=>x.who===id);const pl=home||pick(G_.places.filter(x=>x.build));const p=home&&home.doorP?home.doorP.clone():W.near(pl.dir,.25/K*1.2)||randLand(r);
      const e=makeEnt(d,{kind:'villager',p});if(home){e.home=home.doorP.clone();e.homeP=home.doorP.clone();e.homePl=home}}updPop()}
  function updPop(){const n=[...ents.values()].filter(e=>e.kind==='villager').length;$('popCount').textContent=`${WORLD.length} eigene · ${n} wohnen hier`}

  /* ---------- Bewegung einer Figur ---------- */
  const tmpQ=new THREE.Quaternion();
  function moveEnt(e,dirWorld,speed,dt){/* dirWorld tangential, speed Einheiten/s */if(speed<=0)return false;const ang=speed*dt/G_.R;const axis=new V3().crossVectors(e.p,dirWorld).normalize();if(!isFinite(axis.x))return false;
    const np=e.p.clone().applyAxisAngle(axis,ang).normalize();const h=G_.hAt(np);
    if(e.boat){if(h>G_.sea+.1){leaveBoat(e,np);return true}}/* im Boot: ans Ufer fahren = aussteigen */
    else if(h<G_.sea-.3&&!e.water&&!e.fly){return false}
    /* Hindernisse (geschlossenes Gartentor wie eine Wand) */
    if(G_.gates.length&&gateBlocks(np)&&!gateBlocks(e.p))return false;
    for(const o of obstAround(np,3)){const d=angle(np,o.p)*G_.R;const minD=o.r+.35;if(d<minD){const away=tangentTo(o.p,np.clone().sub(o.p));if(!isFinite(away.x))continue;const pushA=(minD-d)/G_.R;np.applyAxisAngle(new V3().crossVectors(o.p,away).normalize(),pushA*1.02).normalize()}}
    if(e.kind==='me'){for(const o of ents.values()){if(o===e||o.kind==='peer')continue;const d=angle(np,o.p)*G_.R;if(d<.7){const away=tangentTo(o.p,np.clone().sub(o.p));if(isFinite(away.x))np.applyAxisAngle(new V3().crossVectors(o.p,away).normalize(),(.7-d)/G_.R).normalize()}}}
    e.dir.applyAxisAngle(axis,ang);e.p.copy(np);e.dir.copy(tangentTo(e.p,e.dir));return true}

  /* Anbauten am eigenen Haus: Türen als Interaktion (beim Umbau neu registriert) */
  function registerAddons(g,obj){G_.inter=G_.inter.filter(it=>!(it.kind==='addon'&&it.host===g));const ds=obj.userData.addonDoors||[];if(!ds.length)return;g.updateMatrixWorld(true);
    for(const d of ds){const p=g.localToWorld(new V3(d.x,0,d.z)).normalize();const D=ADDONS.def(d.id);G_.inter.push({kind:'addon',host:g,p,r:1.4,label:D.n+' betreten',act:()=>INTERIOR.enter(d.id)})}}
  /* Gartentore: schwenken weich auf/zu; von der KI geöffnete Tore schliesst sie hinter sich wieder */
  function stepGates(dt){for(const g of G_.gates){const d=g.want-g.open;if(Math.abs(d)>.001){g.open+=Math.sign(d)*Math.min(Math.abs(d),dt*2.2);const k=g.open*g.open*(3-2*g.open);g.pv.rotation.y=-k*1.5}
      if(g.it)g.it.label=g.want>.5?'Gartentor schliessen':'Gartentor öffnen';
      if(g.byKI&&g.want>.5){let near=false;for(const e of ents.values()){if(e.kind==='peer')continue;if(angle(e.p,g.c)*G_.R<1.6){near=true;break}}g.idle=near?0:g.idle+dt;if(g.idle>1.2){g.want=0;g.byKI=false;SND.play('soft',{vol:.35,rate:.9})}}}}
  /* geschlossenes Tor als Strecke: Abstand der Figur zur Torlinie (auf der Kugel näherungsweise gerade) */
  const _ga=new V3(),_gb=new V3();function gateBlocks(p){for(const g of G_.gates){if(g.open>.6)continue;if(angle(p,g.c)*G_.R>2)continue;_ga.copy(g.b).sub(g.a);const t=Math.max(0,Math.min(1,_gb.copy(p).sub(g.a).dot(_ga)/_ga.lengthSq()));const d=_gb.copy(g.a).addScaledVector(_ga,t).distanceTo(p)*G_.R;if(d<.38)return g}return null}
  /* Vorgärten mit Hecke/Zaun: liegt Ziel auf der anderen Seite, erst zum Durchgang (innen/aussen) laufen */
  const _yv=new V3();function inYard(y,p){_yv.copy(p).multiplyScalar(G_.R+G_.hAt(p));y.obj.worldToLocal(_yv);const Y=y.Y;return _yv.x>Y.x0&&_yv.x<Y.x1&&_yv.z>Y.z0&&_yv.z<Y.z1}
  function viaYard(e,target){if(e.via&&e.via.to===target){const w=e.via.pts[0];if(angle(e.p,w)*G_.R<.45){e.via.pts.shift();if(!e.via.pts.length){e.via=null;return target}}return e.via.pts[0]}
    e.via=null;for(const y of G_.yards){if(angle(e.p,y.c)*G_.R>14&&angle(target,y.c)*G_.R>14)continue;const a=inYard(y,e.p),b=inYard(y,target);if(a===b)continue;
      e.via={to:target,y,pts:a?[y.gin,y.gout]:[y.gout,y.gin]};return e.via.pts[0]}return target}
  /* KI am Tor: aufmachen und kurz warten, bis es offen ist */
  function gateWait(e){const g=e.via&&e.via.y&&e.via.y.gate;if(!g||angle(e.p,g.c)*G_.R>1.35)return false;if(g.want<.5){g.want=1;g.byKI=true;g.idle=0;e.act=.6;if(angle(e.p,me?me.p:e.p)*G_.R<14)SND.play('soft',{vol:.35,rate:1.2})}return g.open<.75}
  function stepVillager(e,dt,t){e.stop=Math.max(0,e.stop-dt);e.dance=Math.max(0,e.dance-dt);e.jump=Math.max(0,e.jump-dt);e.act=Math.max(0,e.act-dt*1.3);
    /* Fähigkeiten */
    if(e.kind==='villager'&&mode==='outdoor'&&G_.id==='kompost'){for(const a of e.abs){const A=ABIL[a];if(!A.act)continue;e.cd[a]-=dt;if(e.cd[a]>0||e.goal||e.stop>0||e.talking)continue;e.cd[a]=(A.cd||8)*(1.6+Math.random()*1.2);
      try{if(A.need){const tt=W.nearest(A.need.t,e.p,A.need.r*1.5);if(tt){e.goal={p:tt.p,prop:tt,then:()=>{if(!tt.dying){A.act(e,W,tt);e.act=1}}}}else if(A.alone){A.act(e,W,null);e.act=1}}else{A.act(e,W,null);e.act=1}}catch(err){}break}}
    const lifeOn=(e.kind==='villager'||e.kind==='bot')&&mode==='outdoor';if(lifeOn)LIFE.tick(e,dt,t);
    if(e.talking){e.speed=0;return}
    const following=lifeOn&&LIFE.stepFollow(e,dt);
    let moving=e.stop<=0&&e.dance<=0;let target=null;
    if(e.goal){target=e.goal.ent?e.goal.ent.p:e.goal.p;if(angle(e.p,target)*G_.R<(following?2:.9)){const f=e.goal.then;e.goal=null;f&&f();target=null;if(!e.stop&&!following)e.stop=.4+Math.random()}else if(e.goal.prop&&e.goal.prop.dying){e.goal=null;target=null}}
    if(!target&&moving&&!following&&lifeOn&&LIFE.think(e,dt,t)){}
    else if(!target&&moving&&!following){e.idleT-=dt;if(e.idleT<=0){e.idleT=4+Math.random()*7;if(Math.random()<.35){e.stop=2+Math.random()*4}else{const home=e.home;e.goal={p:W.near(Math.random()<.6?home:pick(G_.places.filter(x=>x.build)).dir,.5/K*1.4)}}}}
    /* Spieler begrüssen */
    if(me&&e.kind!=='peer'&&angle(e.p,me.p)*G_.R<2.6&&!e.greetT){e.greetT=18+Math.random()*20;e.stop=Math.max(e.stop,2.2);e.lookAt=me;if(Math.random()<.5)say(e,pick(['Hallo!','Hey!','Oh, hi!','icon:heart','icon:wave']),2.2)}
    if(e.greetT)e.greetT=Math.max(0,e.greetT-dt);
    if(target)target=viaYard(e,target);
    if(target&&gateWait(e))moving=false;
    let spd=0;if(target&&moving){const want=tangentTo(e.p,target.clone().sub(e.p));if(isFinite(want.x)){e.dir.lerp(want,Math.min(1,dt*3)).normalize();e.dir.copy(tangentTo(e.p,e.dir))}spd=1.5*e.move.sp*(lifeOn?LIFE.speedMul(e):1)*(following&&me?Math.max(1,me.speed/3):1)}
    /* festgelaufen (an Deko/Hecke hängen geblieben): kurz seitlich ausweichen */
    if(e.side>0){e.side-=dt;if(spd>0){e.dir.applyAxisAngle(e.p,e.sideA);e.dir.copy(tangentTo(e.p,e.dir))}}
    const p0=spd>0?e.p.clone():null;
    if(spd>0&&!moveEnt(e,e.dir,spd,dt)){e.dir.applyAxisAngle(e.p,1.2+Math.random());e.goal=null;e.via=null}
    else if(p0&&e.side<=0){const got=angle(p0,e.p)*G_.R;e.stuckT=got<spd*dt*.25?(e.stuckT||0)+dt:Math.max(0,(e.stuckT||0)-dt*2);if(e.stuckT>.7){e.stuckT=0;e.side=.55;e.sideA=(Math.random()<.5?1:-1)*1.25}}
    e.speed=spd}

  /* ---------- Figur ins Bild setzen ---------- */
  /* Blinzeln: alle paar Sekunden kurz die Augen zu (manchmal doppelt) */
  function blink(e,t){const es=e.g.userData.eyes;if(!es||!es.length)return;if(e.blinkAt==null)e.blinkAt=t+1+Math.random()*4;let k=1;const d=t-e.blinkAt;
    if(d>0){if(d<.14)k=1-Math.sin(d/.14*PI)*.92;else{e.blinkAt=t+(Math.random()<.15?.25:2.2+Math.random()*4.5)}}
    if(e.sleeping)k=.08;for(const q of es)q.scale.y=k}
  /* Mund: bewegt sich beim Sprechen (Sprechblase oder Dialog) im Silbenrhythmus */
  function animMouth(e,t){blink(e,t);const ms=e.g.userData.mouths||[];const talking=(e.talking&&UI.typing)||(e.sayT>0&&!e.bub.classList.contains('emote'))||(e===me&&e.chatT>0);
    const k=talking?Math.max(0,Math.sin(t*15+e.phase))*.8+Math.max(0,Math.sin(t*23+e.phase*2))*.3:0;if(!ms.length){/* Köpfe ohne Mund (Schnabel, Bildschirm, Lautsprecher): sanftes Wippen im Sprechrhythmus */e.g.scale.y*=1+k*.035;e.g.scale.x*=1-k*.015;return}
    for(const q of ms){const u=q.userData;if(u.mode==='hinge'){q.rotation.x=u.r0+k*u.amp;continue}if(u.mode==='pulse'){q.scale.setScalar(u.s0*(1+k*u.amp));continue}if(u.smile){if(u.open){u.open.visible=k>.08;u.open.scale.y=Math.max(.1,k)}continue}
      /* nach unten öffnen (nicht in die Nase wachsen) */q.scale.set(1+k*.12,1+k*.9,1);if(u.y0!=null)q.position.y=u.y0-k*.9*(u.w||0)*.55;if(u.open)u.open.visible=k>.25}}
  function poseEnt(e,dt,t){const h=G_.hAt(e.p);let base=h;const inWater=h<G_.sea;if(e.boat)base=G_.sea+.1+Math.sin(t*1.6)*.05;else if(inWater)base=e.fly?G_.sea:G_.sea-.25;let alt=e.move.alt?e.move.alt*CS*1.1+Math.sin(t*1.5+e.phase)*.1:0;
    const moving=e.speed>.1;if(e.move.hop&&moving)alt+=Math.abs(Math.sin(t*5+e.phase))*e.move.hop*CS*1.2;if(e.jump>0)alt+=Math.sin((1-e.jump/.9)*PI)*(e.hop>0?1.9:.9);
    e.g.position.copy(e.p).multiplyScalar(G_.R+base+alt);e.g.up.copy(e.p);
    const look=e.lookAt&&e.stop>0?e.lookAt.g.position:e.g.position.clone().add(e.dir);e.g.lookAt(look);if(e.stop<=0)e.lookAt=null;
    if(e.dance>0){e.g.rotateY(Math.sin(t*6)*.6);e.g.position.addScaledVector(e.p,Math.abs(Math.sin(t*8))*.15)}
    /* Klettern: steiler Hang voraus -> nach vorn lehnen, Arme greifen abwechselnd nach oben, ruckweises Hochziehen */
    {let want=0;if(moving&&!e.boat&&!inWater&&!e.move.alt&&!e.fly){const q=e.p.clone().addScaledVector(e.dir,.7/G_.R).normalize();const gr=(G_.hAt(q)-h)/.7;if(gr>.6)want=Math.min(1,(gr-.6)*2.2)}
      e.climb=(e.climb||0)+(want-(e.climb||0))*Math.min(1,dt*(want>(e.climb||0)?7:3));
      if(e.climb>.04){const c=e.climb,ph=t*7+e.phase;e.g.rotateX(.4*c);e.g.rotateZ(Math.sin(ph)*.08*c);e.g.position.addScaledVector(e.p,Math.abs(Math.sin(ph))*.1*c);e.act=Math.max(e.act,c*(.6+.4*Math.sin(ph*2)))}}
    if(e.emote&&e.emoteT>0)EMOTES[e.emote]&&EMOTES[e.emote].pose&&EMOTES[e.emote].pose(e,t,dt);
    else if(e.life&&mode==='outdoor')LIFE.pose(e,t);
    /* weiches Squash beim Laufen */
    const sq=moving&&!e.move.alt?1+Math.sin(t*10+e.phase)*.03:1+Math.sin(t*2+e.phase)*.012;e.g.scale.set(CS*(2-sq)*.5+CS*.5,CS*sq,CS*(2-sq)*.5+CS*.5);animMouth(e,t);
    const dist=me&&e!==me?angle(e.p,me.p)*G_.R:0;const far=dist>13;if(far!==e.far){e.far=far;setOutlines(e.g,!far&&HIGH)}
    const hide=e.inHome||e.inBar||!overview&&dist>(HIGH?40:30);e.g.visible=!hide;e.shadow.visible=!hide;
    if(!hide&&!far||!hide&&((t*10|0)%3===0))e.g.userData.tick(t+e.phase,moving,e.act);
    e.shadow.position.copy(e.p).multiplyScalar(surfR(e.p,true)+.03);e.shadow.quaternion.setFromUnitVectors(new V3(0,0,1),e.p);const ss=Math.max(.4,1-alt*.25);e.shadow.scale.setScalar(ss);
    if(e.sayT>0){e.sayT-=dt;if(e.sayT<=0)e.bub.hidden=true}
    if(e.emoteT>0){e.emoteT-=dt;if(e.emoteT<=0)e.emote=null}}

  /* ================= Interaktion ================= */
  let promptTarget=null;
  function findTarget(){if(!me)return null;let best=null,bs=1e9;const fw=me.dir;
    const consider=(p,r,obj)=>{const d=angle(me.p,p)*G_.R;if(d>r)return;const to=tangentTo(me.p,p.clone().sub(me.p));const facing=isFinite(to.x)?to.dot(fw):1;const score=d-facing*.8+(obj.prio||0);if(score<bs){bs=score;best=obj}};
    for(const e of ents.values()){if(e===me||e.kind==='peer'||e.inHome||e.inBar)continue;consider(e.p,2.4,{kind:'talk',ent:e,label:(e.kind==='bot'?'Winken: ':'Reden: ')+(e.d.name||'Namenlos'),prio:-.6})}
    for(const it of G_.inter)consider(it.p,it.r+.4,Object.assign({},it,{label:it.label||it.kind}));
    for(const o of obstAround(me.p,4)){if(!o.ref)continue;if(o.ref.kind==='tree')consider(o.p,o.r+1.5,{kind:'tree',ref:o.ref,label:o.ref.hasFruit?'Baum schütteln (Früchte!)':'Baum schütteln'});else if(o.ref.kind==='rock')consider(o.p,o.r+1.4,{kind:'rock',ref:o.ref,label:'Mit der Schaufel auf den Stein hauen'})}
    for(const it of ACT.targets())consider(it.p,it.r||1.6,it);
    if((typeof FAUNA!=='undefined'))for(const it of FAUNA.targets())consider(it.p,it.r,it);
    for(const it of REPAIR.targets())consider(it.p,it.r,it);
    if(!best){const f=ACT.waterAhead(me);if(f)best={kind:'fish',label:'Angel auswerfen',p:f}}
    return best}
  function doAction(){if(mode==='space'){if(!UI.anyOpen())SPACE.action();return}if(launchT)return;if(!me||UI.anyOpen()||ACT.busy())return;const t=promptTarget;SND.init();
    if(!t){if(ACT.busy())return;me.emote='hop';me.jump=.9;return}
    switch(t.kind){case 'talk':talkTo(t.ent);break;case 'tree':ACT.shake(t.ref);break;case 'rock':ACT.hitRock(t.ref);break;case 'fish':ACT.fish(t.p);break;
      case 'shop':BUILDINGS.enter('shop');break;case 'museum':INTERIOR.enter('museum');break;case 'house':if(G_.def.mine&&MYPLANET.visiting){UI.toast('Das Haus von '+MYPLANET.visiting.nick+' ist abgeschlossen. Klopf doch mal im Chat an!',2800);break}INTERIOR.enter('house');break;case 'studio':PAINT.open();break;case 'rocket':travelMenu();break;
      case 'board':boardMenu();break;case 'stage':ACT.party();break;case 'mail':mailMenu();break;default:if(t.act)t.act()}}
  async function talkTo(e){if(e.kind==='bot'||e.kind==='villager'){await LIFE.interact(e);return}e.talking=true;const old=e.dir.clone();e.lookAt=me;e.stop=99;me.dir.copy(tangentTo(me.p,e.p.clone().sub(me.p)));
    const d=e.d;const nm=d.name||'Namenlos';const pn=SAVE.nick||S.name||'du';const fill=s=>s.replace('{p}',pn);const voice=voiceFor(d);SAVE.stats.talks++;
    const fr=SAVE.friendship[d.id]||0;const lines=[fill(pick(TALK.hello))];
    const infos=activeKeys(d).map(a=>({a,i:d.info[a.key]})).filter(x=>x.i&&x.i.func);if(infos.length){const x=pick(infos);lines.push(pick(TALK.part).replace('{part}',x.i.name||x.a.label).replace('{func}',x.i.func).replace('{whom}',x.i.forWhom||'alle'))}else lines.push(pick(TALK.small));
    SND.duck(4,.45);const ch=await UI.talk(nm,lines,{voice,color:'#'+new THREE.Color(SKIN_COLORS[d.body.color]||'#FF8FB1').getHexString(),choices:['Plaudern','Geschenk geben','Karte ansehen','Tschüss']});
    if(ch===0){const more=[];const bs=infos.map(x=>x.i.boundary).filter(Boolean);if(bs.length&&Math.random()<.5)more.push(pick(TALK.boundary).replace('{b}',pick(bs)));more.push(pick(TALK.small));if(d.statement&&Math.random()<.5)more.push(d.statement);
      await UI.talk(nm,more,{voice});SAVE.friendship[d.id]=Math.min(100,fr+2);say(e,'icon:heart',1.6,true)}
    else if(ch===1){await giftTo(e,voice)}
    else if(ch===2){showCard(d)}
    else{await UI.talk(nm,[fill(pick(TALK.bye))],{voice})}
    persist();e.talking=false;e.stop=1.5;e.dir.copy(old)}
  /* Stimme passend zum Kopf (wie Animal-Crossing-Gebrabbel): Klangfarbe, Tonhöhe, Tempo; Körpergrösse senkt die Stimme */
  const HEADVOICE={mensch:['sanft',230,1],alien:['hall',300,1.1],schaedel:['knarz',150,.9],ei:['pieps',340,1.1],mond:['hall',190,.85],statue:['tief',120,.8],gehirnglas:['blubb',260,1],axolotl:['quiek',380,1.1],oktopus:['blubb',220,.95],frosch:['knarz',170,1],fisch:['blubb',330,1.15],hai:['tief',140,.95],
    eule:['hall',260,.9],katze:['quiek',400,1.1],hirsch:['sanft',210,.95],widder:['tief',150,.9],nashorn:['tief',120,.85],schnecke:['blubb',200,.75],qualle:['hall',360,.9],kaefer:['summ',320,1.2],vogel:['pieps',480,1.25],chamaeleon:['knarz',240,1],kugelfisch:['blubb',300,1.1],koralle:['hall',270,.95],
    monitor:['robot',240,1.1],roehre:['robot',180,1],birne:['pieps',420,1.15],kamerakopf:['robot',300,1.2],schuessel:['robot',210,1],gasmaske:['knarz',160,.9],taucherhelm:['blubb',180,.9],raumhelm:['hall',230,1],vrbrille:['robot',330,1.2],lautsprecher:['tief',140,1],ventilator:['summ',260,1.3],
    waschmaschine:['blubb',170,1],mikrowelle:['robot',280,1.1],ampel:['pieps',360,1],router:['robot',380,1.3],toaster:['knarz',220,1.05],disco:['hall',320,1.15],globus:['sanft',250,1],uhr:['pieps',400,1.3],kristall:['hall',420,.95],wolke:['sanft',330,.8],teekanne:['pieps',300,.95],
    pilzhut:['quiek',350,1],bluete:['sanft',360,1.05],kaktus:['knarz',230,1],kohl:['tief',180,.95],moosball:['blubb',210,.85],zapfen:['knarz',260,1.05],baumstumpf:['tief',130,.8],seerose:['sanft',340,.95]};
  function voiceFor(d){const h=hashStr(d.id||d.name||'x');const n=parseInt(h.slice(0,4),36);const hv=HEADVOICE[d.parts&&d.parts.kopf]||['sanft',220,1];const sz=(d.body&&d.body.size)||1;
    return{pitch:hv[1]*(1+((n%7)-3)*.04)/Math.sqrt(sz),speed:hv[2]*(.94+(n%5)*.03),kind:hv[0]}}
  async function giftTo(e,voice){const giftable=SAVE.bag.filter(x=>x.kind!=='furn'||true);if(!giftable.length){await UI.talk(e.d.name,['Du hast ja gar nichts in der Tasche. Macht nichts!'],{voice});return}
    const w=UI.win('Was verschenkst du?',{size:'narrow'});const gr=el('div','grid');giftable.forEach(it=>{const c=el('button','card');c.type='button';c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)),el('span','sub','×'+it.n));
      c.onclick=async()=>{w.close();bagTake(it.kind,it.id,1);SND.jingle('j_success');SAVE.friendship[e.d.id]=Math.min(100,(SAVE.friendship[e.d.id]||0)+8);W.fx(e.p,'herz',8);
        await UI.talk(e.d.name,[pick(TALK.gift)],{voice});if(Math.random()<.4){const f=pick(FURN.filter(f=>f.planet==='kompost'||f.planet==='alle'));if(f&&bagAdd('furn',f.id)){await UI.talk(e.d.name,[pick(TALK.giveback),`(Du bekommst: ${f.n})`],{voice});SND.play('j_buy')}}};gr.append(c)});w.body.append(gr);
    await new Promise(r=>{const iv=setInterval(()=>{if(w.closed&&$('talk').hidden){clearInterval(iv);r()}},200)})}
  function showCard(d){const w=UI.win(d.name||'Namenloser Cyborg',{size:'narrow'});const top=el('div','row');const img=UI.creatureThumb(d);img.style.cssText='width:140px;height:140px;flex:none;background:var(--seaL);border-radius:18px';
    const info=el('div');info.append(el('div','sub',d.group||''));const mv=moveFor(d);info.append(el('p',null,'Bewegung: '+MOVE[mv.m].n));info.append(el('p',null,'Kann: '+(abilitiesFor(d).map(a=>ABIL[a].n).join(', ')||'nichts Besonderes')));top.append(img,info);w.body.append(top);
    for(const a of activeKeys(d)){const i=d.info[a.key];if(!i||(!i.func&&!i.name))continue;const box=el('div','pcard');box.append(el('b',null,(i.name||a.label)+(i.name?` (${a.label})`:'')),el('span',null,i.func||''));
      const meta=[i.forWhom&&('Für: '+i.forWhom),i.boundary&&('Grenze: '+i.boundary),i.maker&&('Gebaut von: '+i.maker),i.other&&'dient einer anderen Art'].filter(Boolean).join(' · ');if(meta)box.append(el('span','sub',meta));w.body.append(box)}
    if(d.statement)w.body.append(el('div','note',d.statement));
    if(!d.example&&WORLD.some(x=>x.id===d.id)){const rm=btn('Aus der Welt entfernen','danger');UI.armed(rm,'Sicher entfernen?',()=>{WORLD=WORLD.filter(x=>x.id!==d.id);saveWorld();syncVillagers();w.close();UI.toast('Aus der Welt entfernt')});w.foot.append(rm)}
    w.foot.append(btn('Schliessen',null,()=>w.close()))}

  /* ---------- Menüs an Orten ---------- */
  function travelMenu(){if(REPAIR.broken()){REPAIR.repairAt();return}const w=UI.win('Raketenstation',{size:'narrow'});
    w.body.append(el('p',null,'Steig ein und flieg selbst durchs Sonnensystem – oder nimm den Autopiloten. Achtung: Auf neuen Planeten gibt es oft eine Bruchlandung!'));
    w.foot.append(btn('Selbst fliegen','primary',()=>{w.close();travel('__space')}),btn('Rakete anpassen',null,()=>{w.close();ROCKET.customize()}));
    w.body.append(el('h3',null,'Autopilot'));const gr=el('div','grid');for(const[id,p]of Object.entries(PLANETS)){if(p.mine&&!SAVE.myPlanet)continue;const c=el('button','card'+(id===G_.id?' sel':''));c.type='button';const sw=el('div','ph');sw.style.background=`radial-gradient(circle at 40% 35%,#fff8 0 12%,transparent 13%),radial-gradient(circle,${p.col[0]} 0 45%,${p.col[1]} 46%)`;c.append(sw,el('span',null,p.n),el('span','sub',p.desc+((SAVE.visited||{})[id]?'':' · noch nie besucht')));
      c.onclick=()=>{w.close();if(id!==G_.id)travel(id);else UI.toast('Du bist schon hier.')};gr.append(c)}w.body.append(gr)}
  function boardMenu(){const w=UI.win('Anschlagbrett',{size:'narrow'});const n=allCreatures().length;
    w.body.append(el('p',null,`Auf dem Kompost-Planeten wohnen ${n} Cyborgs${showExamples?` (davon ${EXAMPLES.length} Beispiele)`:''}.`));
    const eco=ecoHealth();w.body.append(el('div','note',`Öko-Zustand: ${eco>.85?'blüht':eco>.65?'stabil':eco>.45?'belastet':'kippt'} · Bäume ${cnt(['baum','tanne','doppelbaum'])} · Blumen ${cnt(['blume'])} · Öl ${cnt(['oel'])} · Schrott ${cnt(['schrott'])}`));
    w.body.append(el('p','sub','Für die Lehrperson: Codes der Gruppen einschleusen oder die Welt sichern.'));
    w.foot.append(btn('Codes einschleusen','primary',()=>{w.close();MAIN.importCodes()}),btn('Welt sichern',null,()=>{w.close();MAIN.exportWorld()}),btn(showExamples?'Beispiele ausblenden':'Beispiele zeigen',null,()=>{showExamples=!showExamples;LS.set('cyborg-labor-beispiele',showExamples?'an':'aus');syncVillagers();w.close()}))}
  function mailMenu(){const w=UI.win('Briefkasten',{size:'narrow'});const letters=[{from:'Kuratorin Uhu',t:'Liebe:r Bewohner:in, das Nationalmuseum sucht Fische, Insekten, Fundstücke und Kunst! Jede Spende hilft, die Grenzen zwischen Natur und Kultur neu zu sortieren.'},
      {from:'Kompost-Kiosk',t:'Neu im Sortiment: Möbel für jeden Geschmack. Und wir kaufen alles, was ihr fangt!'},{from:'Donna H.',t:'Wir sind alle Chimären, theoretisierte und fabrizierte Hybride aus Maschine und Organismus. Macht was Schönes draus.'}];
    letters.forEach(l=>{const b=el('div','pcard');b.append(el('b',null,'Von: '+l.from),el('span',null,l.t));w.body.append(b)});SND.play('page')}

  /* ---------- Reisen ---------- */
  function travel(pid){if(launchT)return;const pl=G_.places.find(p=>p.build==='rocket');const rk=pl&&pl.obj&&pl.obj.children[0]&&pl.obj.children[0].userData.rocket;
    if(rk&&me){tapTarget=null;launchT={rk,pl,t:0,ph:0,pid,base:rk.position.y,from:me.p.clone(),busy:true};SND.play('door');return}
    if(pid==='__space')fadeOut(()=>SPACE.enter(G_.id));else doTravel(pid)}
  let launchT=null;
  /* Einsteigen → Countdown → Start: Figur läuft zur Rakete, steigt ein, Kamera folgt dem Start */
  function stepLaunch(dt){const L=launchT;if(!L)return;L.t+=dt;const pl=L.pl;
    try{if(L.ph===0){/* zur Luke laufen */const k=Math.min(1,L.t/1.4);const q=L.from.clone().lerp(pl.dir,k).normalize();me.p.copy(q);const to=tangentTo(me.p,pl.dir.clone().sub(me.p));if(isFinite(to.x)&&to.lengthSq()>1e-8)me.dir.copy(to.normalize());me.speed=3.5;
        if(k>.75){const s=Math.max(.01,1-(k-.75)/.25);me.g.scale.multiplyScalar(s)}
        if(k>=1){L.ph=1;L.t=0;me.g.visible=false;me.shadow.visible=false;me.speed=0;SND.play('powerup');UI.toast('3 … 2 … 1 … Start!',2200)}return}
      L.rk.position.y=L.base+Math.max(0,L.t-.9)*Math.max(0,L.t-.9)*7;L.rk.rotation.y+=dt*(L.t>.9?2.5:.4);if(L.t<.9)L.rk.position.x=(Math.random()-.5)*.06;
      if(Math.random()<.85)W.fx(pl.dir,pick(['rauch','funke','dampf']),2,pl.obj.localToWorld(new V3(0,Math.max(.3,L.rk.position.y-.6),0)));
      camDist=Math.min(22,camDist+dt*5);camPitch=Math.max(camPitch-dt*.15,.12);
      if(L.t>3){launchT=null;L.rk.position.set(0,L.base,0);me.g.visible=true;me.shadow.visible=true;me.p.copy(L.from);if(L.pid==='__space')fadeOut(()=>SPACE.enter(G_.id));else doTravel(L.pid)}}
    catch(err){console.warn('Start',err);launchT=null;me.g.visible=true;me.shadow.visible=true;if(L.pid==='__space')fadeOut(()=>SPACE.enter(G_.id));else doTravel(L.pid)}}
  function doTravel(pid){fadeOut(async()=>{SND.play('whoosh');await arrive(pid)})}
  function landOn(pid){fadeOut(async()=>{mode='outdoor';SND.play('whoosh');await arrive(pid)})}
  /* Ankunft: neben der Raketenstation; auf neuen Planeten (und manchmal sonst) gibt es eine Bruchlandung */
  async function arrive(pid){if(typeof MYPLANET!=='undefined')MYPLANET.onArrive(pid);planetId=pid;SAVE.planet=pid;const tp=townPlaces(pid).find(p=>p.id==='rakete');if(tp){const d=dirLL(tp.lat-4.5*46/PLANETS[pid].R,tp.lon);SAVE.lastPos={planet:pid,p:[d.x,d.y,d.z]}}
    const first=!(SAVE.visited||{})[pid];SAVE.visited=Object.assign(SAVE.visited||{},{[pid]:true});persist();await loadPlanet(pid);SND.music(G_.def.music);UI.toast('Willkommen auf dem '+G_.def.n+'!');
    if(!PLANETS[pid].mine&&!SAVE.rocketShield&&!SAVE.rocketBroken&&(first&&pid!=='kompost'||Math.random()<.2))setTimeout(()=>REPAIR.crash(),900)}
  function fadeOut(fn){const f=$('fade');f.classList.add('on');setTimeout(async()=>{await fn();setTimeout(()=>f.classList.remove('on'),120)},380)}
  async function loadPlanet(pid){try{if(typeof HAUS!=='undefined'&&!HAUS.ready)await HAUS.load()}catch(e){console.warn('Bausätze',e)}/* alte Szene abbauen */for(const id of[...ents.keys()])dropEnt(id);me=null;W.props.length=0;parts.length=0;
    if(scene){scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});}
    buildOutdoor(pid);spawnMe();syncVillagers();SOCIAL.onPlanet&&SOCIAL.onPlanet(pid);ACT.onPlanet&&ACT.onPlanet(pid);try{BUILDINGS.onPlanet(pid)}catch(e){console.warn('Pflanzen',e)}(typeof FAUNA!=='undefined')&&FAUNA.onPlanet(pid);try{REPAIR.onPlanet(pid)}catch(e){console.warn(e)}seedEco();resize();$('clock').querySelector('span').textContent=G_.def.n}
  function seedEco(){if(G_.id!=='kompost')return;const r=srand(77);const SEED={schrott:10,pilz:10,kristall:4,stumpf:5,oel:2};for(const[t,n]of Object.entries(SEED))for(let i=0;i<n;i++){const p=randLand(r,G_.sea+.4);if(!p||nearPlace(p))continue;const pr=W.spawn(t,p);if(pr){pr.grow=1;pr.g.scale.setScalar(1)}}}
  const cnt=types=>W.props.filter(x=>!x.dying&&types.includes(x.type)).length;
  function ecoHealth(){const plants=cnt(['baum','tanne','doppelbaum'])+cnt(['blume'])*.5+cnt(['pilz'])*.4+cnt(['moos'])*.3+20;const dirt=cnt(['oel'])*3+cnt(['schrott'])*1.2+cnt(['krater'])*2;return Math.max(0,Math.min(1.2,plants/(plants+dirt*2.2+1)*1.25))}

  /* ================= Eingabe ================= */
  const keys={};
  addEventListener('keydown',e=>{if(MAIN.tab!=='world')return;if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;const k=e.key.toLowerCase();
    if(k==='escape'){if(!UI.closeTop()&&INTERIOR.deco)INTERIOR.toggleDeco();return}
    if(UI.anyOpen())return;keys[k]=true;
    if(k==='e'||k===' '||k==='enter'){e.preventDefault();if(mode==='interior')INTERIOR.action();else doAction()}
    else if(k==='r'){ACT.emoteMenu()}else if(k==='i'){ACT.bag()}else if(k==='t'){e.preventDefault();SOCIAL.toggleChat(true)}else if(k==='tab'){e.preventDefault();MAIN.phone()}
    else if(k==='f'&&mode==='interior'&&INTERIOR.kind==='house'){INTERIOR.toggleDeco()}});
  addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
  /* Maus/Touch: Ziehen dreht Kamera, Tippen läuft hin */
  {let drag=null,moved=0;canvas.addEventListener('pointerdown',e=>{SND.init();if(input.joy&&e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};moved=0;canvas.setPointerCapture(e.pointerId)});
   canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;if(mode==='interior'){INTERIOR.pointer&&INTERIOR.pointer(e,'move');if(!INTERIOR.deco)INTERIOR.rotate(dx);return}camYaw-=dx*.006;camPitch=Math.max(.12,Math.min(1.15,camPitch+dy*.004))});
   canvas.addEventListener('pointerup',e=>{if(!drag)return;const wasTap=moved<8;drag=null;if(wasTap)tap(e)});
   canvas.addEventListener('wheel',e=>{e.preventDefault();if(mode==='interior'){INTERIOR.zoom(e.deltaY);return}camDist=Math.max(3.5,Math.min(22,camDist+e.deltaY*.01))},{passive:false})}
  const ray=new THREE.Raycaster();
  function tap(e){const r=canvas.getBoundingClientRect();const m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(m,cam);
    if(mode==='interior'){INTERIOR.tap(ray,e);return}if(!me||UI.anyOpen())return;
    const hits=ray.intersectObjects([...ents.values()].filter(x=>x!==me).map(x=>x.g),true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.wid)o=o.parent;const en=o&&ents.get(o.userData.wid);if(en){if(angle(en.p,me.p)*G_.R<3){promptTarget={kind:'talk',ent:en};doAction()}else tapTarget={p:en.p.clone(),then:()=>{promptTarget={kind:'talk',ent:en};doAction()}};return}}
    const bh=ray.intersectObjects(G_.places.filter(p=>p.obj).map(p=>p.obj),true).find(h=>h.object.userData.place);
    if(bh){const pl=bh.object.userData.place;const it=G_.inter.find(i=>i.place===pl||(pl.doorP&&i.p===pl.doorP));if(it){tapTarget={p:it.p.clone(),then:()=>{promptTarget=it;doAction()}};SND.play('select',{vol:.3});return}}
    const ph=G_.lod?ray.intersectObjects(G_.planet.children.filter(m=>m.visible),false):ray.intersectObject(G_.planet,false);if(ph.length){const p=ph[0].point.clone().normalize();tapTarget={p};SND.play('select',{vol:.3})}}
  /* Joystick */
  {const joy=$('joy'),knob=joy.firstElementChild;let id=null,c0=null;joy.addEventListener('pointerdown',e=>{id=e.pointerId;joy.setPointerCapture(id);const r=joy.getBoundingClientRect();c0={x:r.left+r.width/2,y:r.top+r.height/2};input.joy={x:0,y:0};mv(e);SND.init()});
   const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-c0.x,dy=e.clientY-c0.y;const L=Math.hypot(dx,dy),max=48;if(L>max){dx*=max/L;dy*=max/L}knob.style.transform=`translate(${dx}px,${dy}px)`;input.joy={x:dx/max,y:-dy/max}};
   joy.addEventListener('pointermove',mv);const end=e=>{if(e.pointerId!==id)return;id=null;input.joy=null;knob.style.transform=''};joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end)}
  $('hbA').onclick=()=>{if(mode==='interior')INTERIOR.action();else doAction()};

  /* ================= Schleife ================= */
  let stepT=0,dayT=0,ecoT=2,camSnap=true,overview=null;
  function frame(dt,t){if(!scene)return;OCC.on.value=0;if(mode==='space'){SPACE.frame(dt,t);return}
    if(mode==='interior'){INTERIOR.frame(dt,t);for(const e of ents.values())if(e.inside){poseInside(e,dt,t)}INTERIOR.render();labelsInterior();stepParts(dt);return}
    /* Spieler-Eingabe */
    let ix=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0),iy=(keys['w']||keys['arrowup']?1:0)-(keys['s']||keys['arrowdown']?1:0);
    if(input.joy){ix=input.joy.x;iy=input.joy.y}if(keys['q'])camYaw+=dt*1.8;if(keys['c'])camYaw-=dt*1.8;
    const busy=UI.anyOpen()||ACT.busy()||!!launchT;if(busy){ix=0;iy=0}
    if(me){camF.copy(tangentTo(me.p,camF));if(!isFinite(camF.x))camF=tangentTo(me.p,new V3(1,0,0));if(Math.abs(camYaw)>1e-4){camF.applyAxisAngle(me.p,camYaw*.0+0);}
      const cf=camF.clone().applyAxisAngle(me.p,camYaw);const cr=new V3().crossVectors(cf,me.p).normalize();
      let mvv=cf.clone().multiplyScalar(iy).addScaledVector(cr,ix);let mag=Math.min(1,Math.hypot(ix,iy));
      if(mag<.1&&tapTarget&&!busy){const to=tangentTo(me.p,tapTarget.p.clone().sub(me.p));const dist=angle(me.p,tapTarget.p)*G_.R;if(dist<.8||!isFinite(to.x)){const f=tapTarget.then;tapTarget=null;f&&f()}else{mvv=to;mag=1}}else if(mag>.1)tapTarget=null;
      const run=keys['shift']||(input.joy&&Math.hypot(input.joy.x,input.joy.y)>.95);let spd=0;
      if(mag>.1){mvv.normalize();me.dir.lerp(mvv,Math.min(1,dt*10)).normalize();me.dir.copy(tangentTo(me.p,me.dir));spd=(me.boat?(run?7.5:5.2):(run?6.8:3.8)*Math.min(1.35,Math.max(.6,me.move.sp)))*mag*(me.boost>0?1.45:1)*(1-.45*(me.climb||0));if(!moveEnt(me,mvv,spd,dt)){spd=0}}
      me.speed=spd;if(spd>0&&me.emote){me.emote=null;me.emoteT=0;me.dance=0}
      /* Schritte */
      if(spd>0&&!me.move.alt){stepT-=dt*spd*.55;if(stepT<=0){stepT=1;if(run&&Math.random()<.7)W.fx(me.p,'staub',2,onSurf(me.p,.15));const h=G_.hAt(me.p);if(h>G_.sea+.05)SND.play(h<G_.sea+.4?'step_grass':'step_grass',{vol:.28,jitter:.15});else SND.play('soft',{vol:.2,rate:1.4,jitter:.2})}}
      SAVE.lastPos={planet:G_.id,p:[+me.p.x.toFixed(4),+me.p.y.toFixed(4),+me.p.z.toFixed(4)]}}
    /* Figuren */
    for(const e of ents.values()){try{if(e===me||e.kind==='peer'){}else stepVillager(e,dt,t);if(e.kind==='peer')SOCIAL.stepPeer(e,dt)}catch(err){if(!e.errLogged){e.errLogged=1;console.warn('Figur',e.d&&e.d.id,err)}}}
    const camP=cam.position.clone().normalize();for(const e of ents.values()){const vis=overview?e.p.dot(camP)>.1:e===me||(e.p.dot(camP)>.55&&angle(e.p,me?me.p:e.p)*G_.R<40);e.g.visible=vis;e.shadow.visible=vis;if(vis)poseEnt(e,dt,t)}
    stepProps(dt,t);stepParts(dt);stepClouds(dt);SCATTER.step(dt);if(typeof WEATHER!=='undefined')WEATHER.frame(dt,t,G_,me);else stepWeather(dt,t);if(G_.groundU)G_.groundU.uT.value=t;SCATTER.update(overview?cam.position.clone().normalize():(me?me.p:UPV),t,HIGH);stepBall(dt);stepLaunch(dt);poseBoats(dt,t);stepGates(dt);if(typeof JOBS!=='undefined')JOBS.tick(dt);if(typeof ZOO!=='undefined')ZOO.parkTick(dt,t);for(const o of G_.ticks){try{o.userData.tick(t,false,0)}catch(e){}}
    if(me){if(me.boost>0)me.boost-=dt;if(me.hop>0)me.hop-=dt;if(me.glitter>0){me.glitter-=dt;if(Math.random()<dt*6)W.fx(me.p,'funke',1,me.g.position.clone().addScaledVector(me.p,.8+Math.random()*.6))}}
    if(me&&!overview){OCC.a.value.copy(cam.position);OCC.b.value.copy(me.g.position).addScaledVector(me.p,.9);OCC.on.value=1}else OCC.on.value=0;ACT.frame(dt,t);REPAIR.frame(dt,t);if((typeof FAUNA!=='undefined'))try{FAUNA.step(dt,t)}catch(e){console.warn('Fauna',e)}SOCIAL.frame(dt,t);grassU.value=t;G_.waterU.uT.value=t;
    ecoT-=dt;if(ecoT<=0){ecoT=1;ecoTick()}grassU.value=t;
    /* Tageszeit (echte Uhr) */
    dayT-=dt;if(dayT<=0){dayT=1;dayLight()}
    /* Kamera */
    if(overview){overview.az+=dt*.06;const d=G_.R*3.1;const want=new V3(Math.cos(overview.az)*Math.cos(.5),Math.sin(.5),Math.sin(overview.az)*Math.cos(.5)).multiplyScalar(d);cam.position.lerp(want,Math.min(1,dt*2));cam.up.set(0,1,0);cam.lookAt(0,0,0)}
    else if(me){const cf=camF.clone().applyAxisAngle(me.p,camYaw);const up=me.p;const target=me.g.position.clone().addScaledVector(up,1.1);
      const want0=target.clone().addScaledVector(cf,-camDist*Math.cos(camPitch)).addScaledVector(up,camDist*Math.sin(camPitch)+.6);const want=camCollide(target,want0,dt);const blocked=want.distanceTo(want0)>.2;
      if(camSnap||cam.position.distanceTo(want)>30){cam.position.copy(want);cam.up.copy(up);camSnap=false}else{cam.position.lerp(want,Math.min(1,dt*(blocked?18:6)));cam.up.lerp(up,Math.min(1,dt*6))}cam.lookAt(target);
      /* Sonne folgt Spieler, steht aber je nach Tageszeit tief im Osten, hoch am Mittag, tief im Westen (lange Schatten am Morgen/Abend) */const sp=me.p.clone();const east=tangentTo(sp,new V3(.5,.2,.6));const north=new V3().crossVectors(sp,east).normalize();const el=G_.sunEl??.9,az=G_.sunAz??1.2;const sd=east.clone().multiplyScalar(Math.cos(az)*Math.cos(el)).addScaledVector(north,Math.sin(az)*Math.cos(el)*.35).addScaledVector(sp,Math.sin(el)).normalize();G_.sun.position.copy(me.g.position).addScaledVector(sd,60);G_.sun.target.position.copy(me.g.position);G_.fill.position.copy(me.g.position).addScaledVector(sp,10).addScaledVector(sd,-15)
      /* Ambiente */;const nearSea=G_.hAt(me.p)<G_.sea+.9?1:0;SND.ambience('meer',nearSea*.6);SND.ambience('wind',.25)}
    /* Prompt */
    promptTarget=busy||document.querySelector('.bubmenu')?null:findTarget();const pr=$('prompt');if(promptTarget&&!UI.anyOpen()){pr.hidden=false;pr.innerHTML='';const k=el('kbd',null,'E');pr.append(k,document.createTextNode(promptTarget.label));$('hbA').textContent=shortLabel(promptTarget)}else{pr.hidden=true;$('hbA').textContent='Hüpfen'}
    if(G_.lod)PLANETLOD.update(cam.position,HIGH?4:2.5);if(G_.stream)SCATTER.stream(overview?cam.position.clone().normalize():(me?me.p:UPV),HIGH?5:3);
    if(HIGH)comp.render();else R.render(scene,cam);labels()}
  /* Kamera-Kollision: Strahl vom Kopf zur Wunschposition gegen nahe Gebäude; Kamera rückt vor die Wand (schnell rein, langsam wieder raus) und bleibt über dem Boden */
  const _rc=new THREE.Raycaster();let camClip=99;
  function camCollide(target,want,dt){const dir=want.clone().sub(target);const L=dir.length();if(L<.01)return want;dir.divideScalar(L);const objs=[];
    for(const pl of G_.places){if(pl.obj&&me&&angle(pl.dir,me.p)*G_.R<(pl.build==='plaza'?40:28))objs.push(pl.obj)}
    let d=L;if(objs.length){_rc.set(target,dir);_rc.camera=cam;_rc.far=L+.4;const hits=_rc.intersectObjects(objs,true);for(const h of hits){const o=h.object;if(o.userData.hull||!o.visible||o.userData.noCam)continue;d=Math.max(1.1,h.distance-.4);break}}
    camClip=d>=L-.01?L:d<camClip?d:camClip+(d-camClip)*Math.min(1,dt*1.8);if(camClip>L)camClip=L;
    const out=target.clone().addScaledVector(dir,Math.min(L,camClip));const cd=out.clone().normalize();const minR=G_.R+G_.hAt(cd)+.45;if(out.length()<minR)out.setLength(minR);return out}
  function shortLabel(t){return{talk:'Reden',tree:'Schütteln',fish:'Angeln',shop:'Laden',museum:'Museum',house:'Haus',studio:'Malen',rocket:'Reisen',board:'Lesen',stage:'Tanzen',home:'Klingeln',animal:'Tier',mail:'Post',dig:'Graben',pick:'Nehmen',bug:'Fangen'}[t.kind]||'Aktion'}
  function stepProps(dt,t){for(let i=W.props.length-1;i>=0;i--){const x=W.props[i];
      if(x.dying){x.dying+=dt*2;const s=Math.max(0,1-x.dying)*x.big;x.g.scale.setScalar(Math.max(.001,s));if(x.dying>=1){G_.scene.remove(x.g);disposeTree(x.g);W.props.splice(i,1)}continue}
      if(x.grow<1){x.grow=Math.min(1,x.grow+dt/x.growT)}const e=x.grow<1?1+Math.sin(x.grow*PI)*.25:1;const s=(x.decal?1:(.15+.85*x.grow))*x.big*e;x.g.scale.setScalar(s);
      if(x.type==='mast'){x.g.traverse(o=>{if(o.userData.blink)o.visible=Math.sin(t*4)>0})}}}
  function stepParts(dt){for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.life-=dt;q.sp.position.addScaledVector(q.v,dt);if(q.grav)q.v.addScaledVector(q.n,q.grav*dt);q.sp.material.opacity=Math.min(1,q.life/q.max*2.2);if(q.life<=0){q.sc.remove(q.sp);q.sp.material.dispose();parts.splice(i,1)}}}
  function ecoTick(){if(G_.id!=='kompost')return;const live=W.props.filter(x=>!x.dying);const oils=live.filter(x=>x.type==='oel');
    for(let i=0;i<10;i++){const x=pick(live);if(!x)break;const REP={baum:[.03,3],blume:[.08,5],pilz:[.04,3],moos:[.02,4]}[x.type];if(REP&&x.grow>=1&&Math.random()<REP[0]&&live.filter(y=>y.type===x.type&&y.p.dot(x.p)>Math.cos(.12)).length<REP[1]&&!oils.some(o=>o.p.dot(x.p)>Math.cos(.1)))W.spawn(x.type,W.near(x.p,.12))}
    for(const o of oils)for(const x of live){if(x.p.dot(o.p)<Math.cos(.06))continue;if(['blume','pilz'].includes(x.type)&&Math.random()<.08)W.remove(x);if(x.type==='moos'&&Math.random()<.05){W.remove(o);note('Moos hat einen Ölfleck abgebaut');break}}}
  /* ---------- Tageslauf: fliessende Übergänge (Dämmerung, Morgenrot, Mittag, goldene Stunde, Abendrot, Nacht) ---------- */
  const DAYKEYS=[/* Stunde, Himmel oben, Horizont, Sonnenfarbe, Sonne, Umgebungslicht, Himmelslicht, Nebel */
    [0,'#141A44','#2E3470','#8FA0FF',.22,'#7A88E8',.32,'#2E3266'],[4.6,'#1B2150','#3A3A78','#8FA0FF',.22,'#7A88E8',.32,'#343872'],
    [5.6,'#3B3E86','#C98AA8','#FFA88A',.3,'#B8A0E0',.36,'#8A7AAE'],[6.4,'#6E86D8','#FFB892','#FFB58A',.55,'#F0C8D8',.42,'#E8B8A8'],
    [7.6,null,'#FFE3C2','#FFE2B8',.85,'#E6F0FF',.5,null],[12,null,null,'#FFF6E2',1,'#DFF1FF',.52,null],[16.8,null,null,'#FFEFD2',.96,'#E4EEFF',.52,null],
    [18.4,'#7C8EE0','#FFC08A','#FFB070',.7,'#F2D0C8',.46,'#F0C8A8'],[19.4,'#5A5AB0','#FF9A7A','#FF9070',.45,'#D8A8D0',.4,'#B890B8'],
    [20.4,'#2E3278','#9A6AA8','#A08AE0',.28,'#9A90E0',.34,'#4E4A88'],[21.3,'#171D4A','#343A78','#8FA0FF',.22,'#7A88E8',.32,'#2E3266'],[24,'#141A44','#2E3470','#8FA0FF',.22,'#7A88E8',.32,'#2E3266']];
  const _ca=new THREE.Color(),_cb=new THREE.Color();
  function dayLight(){const h=GAMETIME.hour();const hh=GAMETIME.str();$('clock').querySelector('b').textContent=hh;const def=G_.def;
    let i=0;while(i<DAYKEYS.length-2&&DAYKEYS[i+1][0]<=h)i++;const A=DAYKEYS[i],B=DAYKEYS[i+1];const t=Math.max(0,Math.min(1,(h-A[0])/(B[0]-A[0])));const s=t*t*(3-2*t);
    const col=(k,dflt)=>{_ca.set(A[k]||dflt);_cb.set(B[k]||dflt);return _ca.clone().lerp(_cb,s)};const num=k=>A[k]+(B[k]-A[k])*s;
    const top=col(1,def.sky[0]),hor=col(2,def.sky[1]);
    const night=h<5.6||h>=20.6?1:h<7?1-(h-5.6)/1.4:h>19.2?(h-19.2)/1.4:0;G_.night=Math.max(0,Math.min(1,night));
    /* Sonnenbahn: Aufgang ~6 Uhr im Osten, Mittag hoch, Untergang ~20 Uhr im Westen; nachts Mondlicht von der Gegenseite */
    const day=(h-6)/14;G_.sunEl=day>=0&&day<=1?Math.sin(day*PI)*1.25+.08:.55;G_.sunAz=day>=0&&day<=1?day*PI:((h+24-20)%24)/10*PI;G_.isNight=!(day>=0&&day<=1);
    /* Himmel: Verlauf + leuchtender Horizont bei Morgen-/Abendrot */
    if(!G_.skyCv){G_.skyCv=document.createElement('canvas');G_.skyCv.width=16;G_.skyCv.height=256;G_.skyT=new THREE.CanvasTexture(G_.skyCv);G_.skyT.encoding=THREE.sRGBEncoding}
    {const x=G_.skyCv.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#'+top.getHexString());g.addColorStop(.62,'#'+hor.getHexString());g.addColorStop(1,'#'+hor.clone().lerp(new THREE.Color('#ffffff'),.12).getHexString());x.fillStyle=g;x.fillRect(0,0,16,256);G_.skyT.needsUpdate=true}
    G_.scene.background=G_.skyT;
    G_.sunBase=num(4);G_.sun.color.copy(col(3,'#fff3de'));G_.hemiBase=num(6);G_.hemi.color.copy(col(5,'#dff1ff'));G_.stars.material.opacity=G_.night;G_.fogBase=col(7,def.fog);
    if(typeof WEATHER==='undefined'){G_.sun.intensity=G_.sunBase;G_.hemi.intensity=G_.hemiBase;G_.scene.fog.color.copy(G_.fogBase)}}
  /* ---------- Namensschilder & Sprechblasen ---------- */
  const tV=new V3();
  function labels(){const w=canvas.clientWidth,h=canvas.clientHeight;const camN=cam.position.clone().normalize();for(const e of ents.values()){const near=overview?e.p.dot(camN)>.3:me&&(e===me||angle(e.p,me.p)*G_.R<16);const show=e.g.visible&&near;
      const top=tV.copy(e.g.position).addScaledVector(e.p,e.height+.3);top.project(cam);if(!show||top.z>1){e.lbl.style.display='none';e.bub.style.display='none';continue}
      const x=(top.x+1)/2*w,y=(1-top.y)/2*h;const nameOn=overview?e.kind!=='bot':e!==me&&(angle(e.p,me.p)*G_.R<7||e.kind!=='villager');e.lbl.style.display=nameOn?'':'none';if(nameOn&&e.life){if(!e.dia){e.dia=el('span','dia');e.lbl.prepend(e.dia)}e.dia.style.background=LIFE.EMO[e.life.emo].col}e.lbl.style.left=x+'px';e.lbl.style.top=y+'px';
      e.bub.style.display=e.bub.hidden?'none':'';e.bub.style.left=x+'px';e.bub.style.top=(y-(nameOn?24:4))+'px'}}
  function labelsInterior(){const w=canvas.clientWidth,h=canvas.clientHeight;for(const e of ents.values()){if(!e.inside){e.lbl.style.display='none';e.bub.style.display='none';continue}const top=tV.copy(e.g.position).add(new V3(0,e.height+.3,0)).project(INTERIOR.cam);
      const x=(top.x+1)/2*w,y=(1-top.y)/2*h;e.lbl.style.display=e===me?'none':'';e.lbl.style.left=x+'px';e.lbl.style.top=y+'px';e.bub.style.display=e.bub.hidden?'none':'';e.bub.style.left=x+'px';e.bub.style.top=(y-24)+'px'}}
  function poseInside(e,dt,t){e.g.position.set(e.ix,0,e.iz);e.g.up.set(0,1,0);e.g.lookAt(e.ix+Math.sin(e.iyaw),0,e.iz+Math.cos(e.iyaw));const moving=e.speed>.1;const sq=moving?1+Math.sin(t*10)*.03:1+Math.sin(t*2)*.012;e.g.scale.set(CS,CS*sq,CS);animMouth(e,t);
    if(e.dance>0){e.g.rotateY(Math.sin(t*6)*.6)}e.g.userData.tick(t+e.phase,moving,e.act);e.shadow.position.set(e.ix,.02,e.iz);e.shadow.quaternion.setFromUnitVectors(new V3(0,0,1),UPV);if(e.sayT>0){e.sayT-=dt;if(e.sayT<=0)e.bub.hidden=true}if(e.emoteT>0){e.emoteT-=dt;if(e.emoteT<=0)e.emote=null}}

  function resize(){sizeView(R,cam,comp,$('world'));if(mode==='space')SPACE.resize()}
  function quality(){R.shadowMap.enabled=HIGH;if(scene)loadPlanet(G_.id)}
  async function init(){await loadPlanet(planetId);dayLight()}
  function onAvatarChanged(){if(!me||!scene)return;const p=me.p.clone(),dir=me.dir.clone();const inside=me.inside;const ix=me.ix,iz=me.iz;dropEnt('__me');me=makeEnt(avatarData(),{kind:'me',p,q:HIGH?.9:.6,me:true});me.dir.copy(dir);if(inside){INTERIOR.adopt(me);me.ix=ix;me.iz=iz}}
  let ovBtn=null;const ovKey=e=>{if(e.key==='Escape'&&overview){e.stopPropagation();toggleOverview()}};
  function toggleOverview(){overview=overview?null:{az:Math.atan2(cam.position.z,cam.position.x)};if(!overview)camSnap=true;
    /* gut sichtbarer Ausgang: Knopf oben in der Mitte + Esc */if(overview){ovBtn=btn('Übersicht beenden (Esc)','primary',()=>toggleOverview());ovBtn.classList.add('ovexit');$('world').append(ovBtn);addEventListener('keydown',ovKey,true)}else{if(ovBtn){ovBtn.remove();ovBtn=null}removeEventListener('keydown',ovKey,true)}UI.toast(overview?'Beamer-Übersicht: alle Cyborgs auf einen Blick. Nochmals drücken zum Beenden.':'Zurück zur Spielfigur');return!!overview}
  return{registerAddons,_stepV:stepVillager,_stepGates:stepGates,_aim:(tgt,dist,pitch)=>{if(!me)return;camF.copy(tangentTo(me.p,tgt.clone().sub(me.p)));camYaw=0;if(dist)camDist=dist;if(pitch!=null)camPitch=pitch},addObst,obstAround,_load:loadPlanet,toggleOverview,get overview(){return!!overview},_joy:()=>input.joy,init,frame,resize,quality,travel,landOn,syncVillagers,onAvatarChanged,W,G:G_,ents,get me(){return me},get scene(){return scene},cam,R,say,makeEnt,dropEnt,moveEnt,onSurf,placeObj,angle,tangentTo,isLand,avatarData,randLand,randAround,note,
    get mode(){return mode},set mode(v){mode=v},showCard,talkTo,voiceFor,fadeOut,parts,makeNature,nearPlace,get camF(){return camF},camSide:(a)=>{camYaw=a},camFwd:()=>me?camF.clone().applyAxisAngle(me.p,camYaw):camF.clone(),get night(){return G_.night||0}};
})();
