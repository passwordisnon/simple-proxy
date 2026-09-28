/* =====================================================================
   CYBORG-LABOR · world.js
   Spielbare Welt: Planeten mit Terrassen, Wasser, Gras, Natur, Gebäuden.
   Spielfigur (3rd person auf der Kugel), Bewohner:innen, Öko-Fähigkeiten.
   ===================================================================== */
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CS=.55;              /* Kreatur-Massstab in der Welt (s=1 → ~1.7 hoch) */
const UPV=new V3(0,1,0);

/* ---------- Perlin-Rauschen 3D ---------- */
function perlin3(seed){const p=new Uint8Array(512);const r=srand(seed*977+13);const a=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}for(let i=0;i<512;i++)p[i]=a[i&255];
  const fade=t=>t*t*t*(t*(t*6-15)+10),lerp=(a,b,t)=>a+t*(b-a);const grad=(h,x,y,z)=>{const u=h<8?x:y,v=h<4?y:h===12||h===14?x:z;return((h&1)?-u:u)+((h&2)?-v:v)};
  return(x,y,z)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=fade(x),v=fade(y),w=fade(z);
    const A=p[X]+Y,AA=p[A]+Z,AB=p[A+1]+Z,B=p[X+1]+Y,BA=p[B]+Z,BB=p[B+1]+Z;
    return lerp(lerp(lerp(grad(p[AA]&15,x,y,z),grad(p[BA]&15,x-1,y,z),u),lerp(grad(p[AB]&15,x,y-1,z),grad(p[BB]&15,x-1,y-1,z),u),v),lerp(lerp(grad(p[AA+1]&15,x,y,z-1),grad(p[BA+1]&15,x-1,y,z-1),u),lerp(grad(p[AB+1]&15,x,y-1,z-1),grad(p[BB+1]&15,x-1,y-1,z-1),u),v),w)}}
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function dirLL(lat,lon){const la=lat*PI/180,lo=lon*PI/180;return new V3(Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)).normalize()}
const angle=(a,b)=>Math.acos(Math.max(-1,Math.min(1,a.dot(b))));
function tangentTo(p,v){return v.clone().sub(p.clone().multiplyScalar(v.dot(p))).normalize()}
function distToArc(p,a,b){const n=new V3().crossVectors(a,b).normalize();const d=Math.asin(Math.max(-1,Math.min(1,p.dot(n))));const proj=p.clone().sub(n.clone().multiplyScalar(p.dot(n))).normalize();
  const ab=angle(a,b);if(Math.abs(angle(a,proj)+angle(proj,b)-ab)<1e-3)return Math.abs(d);return Math.min(angle(p,a),angle(p,b))}

/* ---------- Orte je Planet ---------- */
const PLACES={
  kompost:[
    {id:'platz',n:'Dorfplatz',lat:90,lon:0,r:.2,h:.55,build:'plaza'},
    {id:'museum',n:'Nationalmuseum',lat:66,lon:0,r:.17,h:.55,build:'museum'},
    {id:'laden',n:'Kompost-Kiosk',lat:68,lon:74,r:.12,h:.55,build:'shop'},
    {id:'studio',n:'Farbstudio',lat:67,lon:146,r:.1,h:.55,build:'studio'},
    {id:'rakete',n:'Raketenstation',lat:66,lon:216,r:.11,h:.55,build:'rocket'},
    {id:'haus',n:'Dein Haus',lat:65,lon:290,r:.12,h:.55,build:'house'},
    {id:'teich',n:'Teich',lat:40,lon:110,r:.13,pond:true},
    {id:'teich2',n:'Seerosen-Teich',lat:38,lon:250,r:.11,pond:true}],
  schrott:[
    {id:'platz',n:'Schrott-Platz',lat:90,lon:0,r:.24,h:.45,build:'plaza'},
    {id:'laden',n:'Ersatzteil-Basar',lat:62,lon:40,r:.15,h:.45,build:'shop'},
    {id:'rakete',n:'Raketenstation',lat:62,lon:200,r:.14,h:.45,build:'rocket'},
    {id:'teich',n:'Kühlwasser-Becken',lat:35,lon:120,r:.2,pond:true},
    {id:'teich2',n:'Leuchtbecken',lat:30,lon:300,r:.16,pond:true}],
  korallen:[
    {id:'platz',n:'Strandplatz',lat:90,lon:0,r:.26,h:.55,build:'plaza'},
    {id:'laden',n:'Muschel-Laden',lat:64,lon:60,r:.15,h:.55,build:'shop'},
    {id:'rakete',n:'Raketenstation',lat:64,lon:220,r:.15,h:.55,build:'rocket'},
    {id:'insel',n:'Palmeninsel',lat:10,lon:140,r:.25,h:.4}]
};

const GAME=(()=>{
  const canvas=$('worldCanvas');const R=makeRenderer(canvas);R.shadowMap.type=THREE.PCFSoftShadowMap;
  const cam=new THREE.PerspectiveCamera(45,1,.1,900);
  let scene=null,comp=null,W0=null;              /* aktuelle Aussenszene */
  let mode='outdoor';                            /* outdoor | interior */
  const M=makeMats({skin:'haut',color:0});
  const G_={};                                   /* aktueller Planet */
  let planetId=SAVE.planet&&PLANETS[SAVE.planet]?SAVE.planet:'kompost';

  /* ================= Terrain ================= */
  function makeHeight(pid){const def=PLANETS[pid];const N=perlin3({kompost:1,schrott:2,korallen:3}[pid]);const places=PLACES[pid].map(pl=>Object.assign({dir:dirLL(pl.lat,pl.lon)},pl));
    const R=def.R;const step=pid==='korallen'?.7:.95;
    function raw(p){let h=.9*N(p.x*1.4+3,p.y*1.4,p.z*1.4)+.45*N(p.x*3.2,p.y*3.2+7,p.z*3.2)+.15*N(p.x*7,p.y*7,p.z*7+2);
      if(pid==='kompost'){h+=.35-1.9*sstep(-.02,-.55,p.y)}
      if(pid==='schrott'){h+=.25+.35*Math.abs(N(p.x*2.5,p.y*2.5,p.z*2.5))}
      if(pid==='korallen'){h=.9*N(p.x*2.2,p.y*2.2,p.z*2.2)+.3*N(p.x*5,p.y*5,p.z*5)-.35+.9*sstep(.35,.85,p.y)}
      return h*1.6}
    function hAt(p){let h=raw(p);/* Terrassen */const k=h/step;const f=k-Math.floor(k);h=(Math.floor(k)+sstep(.38,.62,f))*step;
      for(const pl of places){const d=angle(p,pl.dir);if(pl.pond){if(d<pl.r*1.3){const t=sstep(pl.r*1.3,pl.r*.55,d);h=h*(1-t)+(def.sea-.9)*t}}
        else if(d<pl.r*1.5){const t=sstep(pl.r*1.5,pl.r,d);h=h*(1-t)+(pl.h??.5)*t}}
      return h}
    return{hAt,places,R,sea:def.sea}}

  /* ================= Aufbau Aussenwelt ================= */
  function buildOutdoor(pid){
    const def=PLANETS[pid];const T=makeHeight(pid);const Rr=def.R;Object.assign(G_,{id:pid,def,hAt:T.hAt,places:T.places,R:Rr,sea:def.sea});
    const sc=new THREE.Scene();sc.background=skyTex(def.sky[0],def.sky[1],pid);sc.fog=new THREE.Fog(def.fog,Rr*1.3,Rr*3.2);
    const hemi=new THREE.HemisphereLight('#dff1ff','#f0c9a8',.52);sc.add(hemi);
    const sun=new THREE.DirectionalLight('#fff3de',1.0);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:90});sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;sc.add(sun);sc.add(sun.target);
    const fill=new THREE.DirectionalLight('#c9d8ff',.18);sc.add(fill);
    /* Planet */
    const segW=HIGH?300:200,segH=HIGH?200:130;const g=new THREE.SphereGeometry(Rr,segW,segH);const pos=g.attributes.position;const col=[];const v=new V3();
    const C=k=>new THREE.Color(def.ground[k]);const cLow=C('low'),cMid=C('mid'),cHigh=C('high'),cPeak=C('peak'),cPath=C('path'),cCliff=new THREE.Color(pid==='schrott'?'#8F7FAE':pid==='korallen'?'#D9B98A':'#B98A5E'),cDeepSand=new THREE.Color(pid==='schrott'?'#8FA8B8':'#E6C88E');
    const paths=[];const pl0=T.places.find(p=>p.id==='platz');if(pl0)for(const p of T.places)if(p!==pl0&&!p.pond&&p.build)paths.push([pl0.dir,p.dir]);G_.paths=paths;
    const hs=new Float32Array(pos.count);
    for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).normalize();const h=T.hAt(v);hs[i]=h;const p2=v.clone();v.multiplyScalar(Rr+h);pos.setXYZ(i,v.x,v.y,v.z);
      let c;if(h<def.sea-.3)c=cDeepSand.clone();else if(h<def.sea+.35)c=cLow.clone();else{const t=Math.min(1,(h-def.sea-.35)/2.2);c=cMid.clone().lerp(cHigh,t);if(h>2.4)c.lerp(cPeak,Math.min(1,(h-2.4)/1.2))}
      if(h>def.sea+.3){let pd=9;for(const[a,b]of paths)pd=Math.min(pd,distToArc(p2,a,b));if(pd<.045)c.lerp(cPath,sstep(.045,.028,pd));for(const pl of T.places)if(pl.build&&angle(p2,pl.dir)<pl.r*.8)c.lerp(cPath,.35*sstep(pl.r*.8,pl.r*.5,angle(p2,pl.dir)))}
      const n=(Math.sin(p2.x*61+p2.z*37)*Math.sin(p2.y*53))*.025;c.offsetHSL(0,0,n);col.push(c.r,c.g,c.b)}
    /* Klippen einfärben: Steigung aus Nachbarn */
    g.computeVertexNormals();const nrm=g.attributes.normal;for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).normalize();const n=new V3().fromBufferAttribute(nrm,i);const slope=1-n.dot(v);if(slope>.1&&hs[i]>def.sea-.2){const t=sstep(.1,.28,slope);col[i*3]+=(cCliff.r-col[i*3])*t;col[i*3+1]+=(cCliff.g-col[i*3+1])*t;col[i*3+2]+=(cCliff.b-col[i*3+2])*t}}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const pm=cozy({vertexColors:true,rim:.12});const planet=new THREE.Mesh(g,pm);planet.receiveShadow=true;planet.name='planet';sc.add(planet);G_.planet=planet;
    /* Wasser mit Uferschaum */
    const wg=new THREE.SphereGeometry(Rr+def.sea,HIGH?220:150,HIGH?150:100);const wp=wg.attributes.position;const dep=new Float32Array(wp.count);
    for(let i=0;i<wp.count;i++){v.fromBufferAttribute(wp,i).normalize();dep[i]=def.sea-T.hAt(v)}wg.setAttribute('depth',new THREE.BufferAttribute(dep,1));
    const wu={uT:{value:0},uShallow:{value:new THREE.Color(def.water)},uDeep:{value:new THREE.Color(def.deep)},uFoam:{value:new THREE.Color('#ffffff')}};
    const wm=new THREE.ShaderMaterial({uniforms:wu,transparent:true,vertexShader:`attribute float depth;varying float vD;varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vD=depth;vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;vN=normalMatrix*normal;gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`uniform float uT;uniform vec3 uShallow,uDeep,uFoam;varying float vD;varying vec3 vP;varying vec3 vN;varying vec3 vV;
      void main(){if(vD<-0.02)discard;float d=clamp(vD/1.6,0.,1.);vec3 c=mix(uShallow,uDeep,smoothstep(.15,.85,d));
       float w=sin(vP.x*1.3+uT*1.1)*sin(vP.z*1.1-uT*.9)+sin(vP.y*1.7+uT*.7);float band=step(.93,fract(w*.5+uT*.05));c=mix(c,vec3(1.),band*.18*(1.-d));
       float foam=1.-smoothstep(.0,.16+.05*sin(uT*2.+vP.x*3.+vP.z*2.),vD);float ring=step(.5,fract(vD*5.-uT*.45))*(1.-smoothstep(.1,.45,vD));c=mix(c,uFoam,max(foam,ring*.55));
       float fr=pow(1.-clamp(dot(normalize(vN),normalize(vV)),0.,1.),3.);c+=fr*.18;gl_FragColor=vec4(c,mix(.82,.94,d));}`});
    const water=new THREE.Mesh(wg,wm);water.renderOrder=2;sc.add(water);G_.waterU=wu;
    /* Atmosphäre */
    const atm=new THREE.Mesh(new THREE.SphereGeometry(Rr*1.35,64,40),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,uniforms:{c:{value:new THREE.Color(def.sky[0])}},
      vertexShader:'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vP=mv.xyz;gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform vec3 c;varying vec3 vN;varying vec3 vP;void main(){float f=pow(1.0-abs(dot(normalize(-vP),vN)),2.4);gl_FragColor=vec4(mix(c,vec3(1.),.5),f*.55);}'}));sc.add(atm);
    /* Sterne (nachts sichtbar) */
    {const sg=new THREE.BufferGeometry();const sp=[];const r=srand(9);for(let i=0;i<900;i++){const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize().multiplyScalar(300+r()*100);sp.push(p.x,p.y,p.z)}sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
      const st=new THREE.Points(sg,new THREE.PointsMaterial({color:'#fff6e0',size:1.6,transparent:true,opacity:0,fog:false}));sc.add(st);G_.stars=st}
    Object.assign(G_,{scene:sc,sun,hemi,fill,water,obst:[],props:[],inter:[],lights:[],grass:null,clouds:[],ticks:[]});
    buildGrass();buildPlaces();scatterNature();buildClouds();buildBall();
    comp=makeComposer(R,sc,cam);scene=sc;return sc}

  /* ---------- Hilfen Oberfläche ---------- */
  const surfR=(p,water)=>{const h=G_.hAt(p);return G_.R+(water&&h<G_.sea?G_.sea:h)};
  const onSurf=(p,off,water)=>p.clone().multiplyScalar(surfR(p,water)+(off||0));
  const isLand=p=>G_.hAt(p)>G_.sea+.05;
  function placeObj(o,p,yaw,off){o.position.copy(onSurf(p,off||0));o.quaternion.setFromUnitVectors(UPV,p);if(yaw)o.rotateY(yaw)}
  function faceTo(o,p,dirWorld){o.up.copy(p);o.lookAt(o.position.clone().add(dirWorld))}
  function randLand(r,minH,maxH,tries){for(let i=0;i<(tries||80);i++){const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize();const h=G_.hAt(p);if(h>(minH??G_.sea+.3)&&h<(maxH??99))return p}return null}
  const nearPlace=(p,pad)=>G_.places.some(pl=>angle(p,pl.dir)<pl.r*(pad||1.25))||(G_.paths||[]).some(([a,b])=>distToArc(p,a,b)<.05);

  function smartMerge(o){const keep=[...(o.userData.keep||[]),o.userData.rocket,o.userData.flag].filter(Boolean);try{if(o.userData.tick)mergeCreature(o,keep);else mergeGroup(o,keep)}catch(e){console.warn('merge',e)}}
  /* ---------- Wasserball zum Kicken ---------- */
  function buildBall(){const pl=G_.places.find(p=>p.id==='platz');if(!pl)return;const g=new THREE.Group();QF=.8;const cols=['#F0556E','#FFFDF7','#FFD85A','#FFFDF7','#56C6B6','#FFFDF7'];
    for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.42,16,12,i*TAU/6,TAU/6),M.c(cols[i],{gloss:1}));g.add(m)}P(g,G.s(.08),M.c('#FFFDF7'),[0,.42,0]);QF=1;addOutlines(g);g.traverse(o=>{if(o.isMesh)o.castShadow=HIGH});
    const p=pl.dir.clone().applyAxisAngle(new V3(0,0,1),.12).normalize();G_.scene.add(g);G_.ball={g,p,v:new V3(),spin:new THREE.Quaternion(),r:.42}}
  function stepBall(dt){const b=G_.ball;if(!b||!me)return;const d=angle(b.p,me.p)*G_.R;
    if(d<.95&&me.speed>.2){const dir=tangentTo(b.p,b.p.clone().sub(me.p));if(isFinite(dir.x)){b.v.copy(dir.multiplyScalar(me.speed*1.35+1.5));SND.play('soft',{vol:.7,rate:1.3});W.fx(b.p,'stern',3)}}
    for(const e of ents.values()){if(e===me||e.kind==='peer')continue;const de=angle(b.p,e.p)*G_.R;if(de<.8&&b.v.length()>.5){const dir=tangentTo(b.p,b.p.clone().sub(e.p));if(isFinite(dir.x)){b.v.reflect(dir).multiplyScalar(.7);if(Math.random()<.5)say(e,pick(['Hey!','Uff!','Tor!','⚽']),1.5)}}}
    const sp=b.v.length();if(sp>.01){const dir=b.v.clone().normalize();const ang=sp*dt/G_.R;const axis=new V3().crossVectors(b.p,dir).normalize();const np=b.p.clone().applyAxisAngle(axis,ang).normalize();
      let hit=false;for(const o of G_.obst){if(angle(np,o.p)*G_.R<o.r+b.r){hit=true;const n=tangentTo(np,np.clone().sub(o.p));b.v.reflect(n).multiplyScalar(.75);SND.play('soft',{vol:.4,rate:1.6});break}}
      if(!hit){b.p.copy(np);b.v.applyAxisAngle(axis,ang);b.v.copy(tangentTo(b.p,b.v).multiplyScalar(sp))}
      b.g.rotateOnWorldAxis(axis,sp*dt/b.r);const slope=G_.hAt(b.p)<G_.sea?.985:.975;b.v.multiplyScalar(Math.pow(slope,dt*60))}
    const h=G_.hAt(b.p);b.g.position.copy(b.p).multiplyScalar(G_.R+Math.max(h,G_.sea-.1)+b.r*.95)}
  /* ---------- Gras ---------- */
  const grassU={value:0};
  function buildGrass(){const def=G_.def;const N=HIGH?9000:3500;const geo=new THREE.ConeGeometry(.07,.26,4,1);geo.translate(0,.13,0);
    const mat=new THREE.MeshToonMaterial({gradientMap:TOON_RAMP});mat.onBeforeCompile=s=>{s.uniforms.uT=grassU;s.vertexShader='uniform float uT;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n float ph=instanceMatrix[3].x*.7+instanceMatrix[3].z*.5;transformed.x+=sin(uT*2.0+ph)*position.y*.35;transformed.z+=cos(uT*1.6+ph)*position.y*.2;')};
    const im=new THREE.InstancedMesh(geo,mat,N);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new V3(),pos=new V3(),col=new THREE.Color();const r=srand(5);let k=0,tries=0;
    const kor=G_.id==='korallen';const base=new THREE.Color(kor?def.ground.high:def.ground.mid),hi=new THREE.Color(kor?def.ground.peak:def.ground.high);const minH=kor?G_.sea+1.0:G_.sea+.4;const NN=G_.id==='schrott'?Math.round(N*.45):N;
    while(k<NN&&tries<N*5){tries++;const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize();const h=G_.hAt(p);if(h<minH||nearPlace(p,1))continue;
      q.setFromUnitVectors(UPV,p);q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((r()-.5)*.4,r()*TAU,(r()-.5)*.4)));const s=.7+r()*.8;sc.set(s,s*(.7+r()*.7),s);pos.copy(p).multiplyScalar(G_.R+h-.02);
      m4.compose(pos,q,sc);im.setMatrixAt(k,m4);col.copy(base).lerp(hi,r()).offsetHSL((r()-.5)*.04,.05,.04+r()*.08);im.setColorAt(k,col);k++}
    im.count=k;im.receiveShadow=true;G_.scene.add(im);G_.grass=im}
  /* ---------- Wolken ---------- */
  function buildClouds(){const cm=M.c('#ffffff',{rim:.7});for(let i=0;i<10;i++){const g=new THREE.Group();const r=srand(40+i);QF=.6;range(4+i%3,(t,j)=>P(g,G.s(.9+r()*.7),cm,[(t-.5)*3,r()*.4,(r()-.5)*1.2],null,[1,.75,.9]));QF=1;g.traverse(o=>{if(o.isMesh){o.castShadow=true}});
    const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize();const ax=new V3().crossVectors(p,new V3(r(),r(),r()).normalize()).normalize();G_.scene.add(g);G_.clouds.push({g,p,ax,sp:.008+r()*.01})}}
  function stepClouds(dt){for(const c of G_.clouds){c.p.applyAxisAngle(c.ax,c.sp*dt).normalize();c.g.position.copy(c.p).multiplyScalar(G_.R+9);c.g.quaternion.setFromUnitVectors(UPV,c.p)}}

  /* ---------- Natur verstreuen (statisch zusammengeführt) ---------- */
  const staticBatch=[];
  function bakeStatic(sc){/* führt alle statischen Meshes je Material zu einem Mesh zusammen */
    const byMat=new Map();for(const o of staticBatch){o.updateMatrixWorld(true);o.traverse(m=>{if(!m.isMesh||m.userData.hull)return;let geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();
      for(const k of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(k))geo.deleteAttribute(k);if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
      geo.clearGroups();geo.applyMatrix4(m.matrixWorld);const key=m.material.uuid;if(!byMat.has(key))byMat.set(key,{mat:m.material,list:[],hull:!m.userData.noOutline&&m.children.some(c=>c.userData.hull),hullMat:(m.children.find(c=>c.userData.hull)||{}).material});byMat.get(key).list.push(geo)})}
    for(const{mat,list,hull,hullMat}of byMat.values()){const merged=THREE.BufferGeometryUtils.mergeBufferGeometries(list,false);if(!merged)continue;const mesh=new THREE.Mesh(merged,mat);mesh.castShadow=HIGH;mesh.receiveShadow=true;sc.add(mesh);
      if(hull&&hullMat){const h=new THREE.Mesh(merged,hullMat);h.userData.hull=true;sc.add(h)}list.forEach(g=>g.dispose())}
    for(const o of staticBatch)disposeTree(o);staticBatch.length=0}
  function makeNature(type,opt,seed){const n=NATURE[type];const g=new THREE.Group();QF=HIGH?.7:.5;try{if(n)n.b(g,M,opt||{},srand(seed||1));else P(g,G.s(.3),M.c('#7CC46A'),[0,.3,0])}catch(e){console.warn('Natur',type,e)}QF=1;addOutlines(g);return g}
  function scatterNature(){const def=G_.def;const r=srand({kompost:11,schrott:22,korallen:33}[G_.id]);const fruitTypes={kompost:['apfel','kirsche','pfirsich','birne'],schrott:['birne'],korallen:['orange','kokosnuss']}[G_.id];
    for(const[type,count]of def.scatter){let n=Math.round(count*(HIGH?1:.7));for(let i=0;i<n;i++){
      const water=['seerose','schilf'].includes(type);const p=water?findPondEdge(r,type==='seerose'):randLand(r,type==='muschel_deko'||type==='treibholz'||type==='palme'?G_.sea+.05:G_.sea+.35,type==='muschel_deko'||type==='treibholz'?G_.sea+.5:99);if(!p||nearPlace(p))continue;
      const info=NATURE[type]||{};const inter=['obstbaum','palme','eiche','tanne','kristallbaum','antennenbaum'].includes(type);
      if(inter){const opt=type==='obstbaum'?{fruit:fruitTypes[i%fruitTypes.length]}:type==='palme'?{fruit:'kokosnuss'}:{};const fruitId=opt.fruit||{kristallbaum:'seeglas',antennenbaum:'schraube'}[type]||null;const g=makeNature(type,opt,i+1);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});mergeTree(g);placeObj(g,p,r()*TAU,-.05);g.scale.setScalar(.9+r()*.3);G_.scene.add(g);
        const tree={type,p,g,fruit:fruitId,hasFruit:!!(g.userData.fruits&&g.userData.fruits.length),shakeT:0,r:info.r||.6};G_.obst.push({p,r:tree.r});G_.props.push(tree);G_.inter.push({kind:'tree',ref:tree,p,r:1.6})}
      else{const g=makeNature(type,type==='blume'?{color:pick(['#FF8FB8','#FFE27A','#FFFDF7','#C6A9FF','#FF7E6B','#7FDCE6']),kind:pick(['tulpe','rose','gaensebluemchen','kosmee','lilie'])}:{},i+7);
        placeObj(g,p,r()*TAU,water&&type==='seerose'?(G_.sea-G_.hAt(p)):-.03);g.scale.setScalar(.85+r()*.35);if(water&&type==='seerose'){g.position.copy(p.clone().multiplyScalar(G_.R+G_.sea+.02))}staticBatch.push(g);if(info.cols){g.updateMatrixWorld(true);for(const[cx,cz,cr]of info.cols){const wp=g.localToWorld(new V3(cx,0,cz)).normalize();G_.obst.push({p:wp,r:cr*g.scale.x})}}else if(info.r&&info.r>.25)G_.obst.push({p,r:info.r})}}}
    bakeStatic(G_.scene)}
  /* Baum: Stamm+Krone zusammenführen, Früchte zu einem Mesh bündeln (ein-/ausblendbar) */
  function mergeTree(g){const fr=g.userData.fruits||[];if(fr.length){const holder=new THREE.Group();g.add(holder);g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();
      fr.forEach(f=>{const m=new THREE.Matrix4().multiplyMatrices(inv,f.matrixWorld);f.parent.remove(f);m.decompose(f.position,f.quaternion,f.scale);holder.add(f)});mergeGroup(holder);g.userData.fruits=[holder];mergeGroup(g,[holder])}else mergeGroup(g)}
  function findPondEdge(r,inWater){for(let i=0;i<60;i++){const p=new V3(r()*2-1,r()*2-1,r()*2-1).normalize();const h=G_.hAt(p);if(inWater?(h<G_.sea-.25&&h>G_.sea-1.2):(h>G_.sea-.1&&h<G_.sea+.25))return p}return null}

  /* ---------- Gebäude & Orte ---------- */
  function buildPlaces(){for(const pl of G_.places){if(!pl.build)continue;const g=new THREE.Group();let obj=null;
      try{
        if(pl.build==='plaza')obj=buildPlaza(pl);
        else if(pl.build==='museum'&&window.buildMuseum)obj=buildMuseum(M);
        else if(pl.build==='shop'&&window.buildShop)obj=buildShop(G_.id,M);
        else if(pl.build==='studio'&&window.buildPaintStudio)obj=buildPaintStudio(M);
        else if(pl.build==='rocket'&&window.buildRocketPad)obj=buildRocketPad(M);
        else if(pl.build==='house'&&window.buildHouse){obj=buildHouse(SAVE.house.style,M);G_.houseObj=obj}
      }catch(e){console.warn('Gebäude',pl.build,e)}
      if(!obj){obj=new THREE.Group();P(obj,G.bx(3,2.4,3,.4),M.c('#FFE3B8'),[0,1.2,0]);P(obj,G.co(2.6,1.6),M.c('#F0556E'),[0,3.2,0])}
      if(pl.build!=='plaza')addOutlines(obj);obj.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});smartMerge(obj);if(obj.userData.tick)G_.ticks.push(obj);g.add(obj);
      /* Gebäude zeigen zum Dorfplatz */
      const plaza=G_.places.find(x=>x.id==='platz');let yaw=0;placeObj(g,pl.dir,0,-.02);
      if(plaza&&pl!==plaza){const toward=tangentTo(pl.dir,plaza.dir);g.up.copy(pl.dir);g.lookAt(g.position.clone().add(toward))}
      G_.scene.add(g);pl.obj=g;const rad=(obj.userData.r||2.2);if(pl.build!=='plaza')G_.obst.push({p:pl.dir.clone(),r:rad});
      const door=obj.userData.door?new V3(...obj.userData.door):new V3(0,0,rad+.8);const dw=g.localToWorld(door.clone());const dp=dw.clone().normalize();pl.doorP=dp;
      const label={museum:'Museum betreten',shop:'Einkaufen',studio:'Malen',rocket:'Reisen',house:'Nach Hause'}[pl.build];if(label)G_.inter.push({kind:pl.build,place:pl,p:dp,r:1.5,label})}
    if(G_.id==='kompost'&&G_.houseObj){}
  }
  function buildPlaza(pl){const g=new THREE.Group();const fn=(f,...a)=>{try{return window[f]?window[f](...a):null}catch(e){console.warn(f,e);return null}};
    const add=(o,x,z,yaw,label,kind)=>{if(!o)return;addOutlines(o);o.position.set(x,0,z);o.rotation.y=yaw||0;g.add(o);if(label){const off=new V3(x,0,z+(o.userData.r||1)+.6);o.userData._lbl={label,kind,off}}};
    add(fn('buildFountain',M),0,0,0);add(fn('buildNoticeBoard',M),-3.4,-2.4,.5,'Anschlagbrett','board');add(fn('buildStage',M),3.6,-3.2,-.6,'Tanzfläche','stage');
    add(fn('buildBench',M),-3.6,2.6,2.4);add(fn('buildBench',M),3.2,3.0,-2.4);add(fn('buildStreetLamp',M),-1.8,3.6,0);add(fn('buildStreetLamp',M),2.2,-.4,0);add(fn('buildMailbox',M),-1.5,-3.8,.3,'Briefkasten','mail');
    add(fn('buildSignpost',M,G_.def.n),1.2,3.4,.2);g.children.forEach(o=>{smartMerge(o);if(o.userData.tick)G_.ticks.push(o)});
    /* Interaktionen nach dem Platzieren registrieren */
    setTimeout(()=>{g.children.forEach(o=>{const L=o.userData._lbl;if(!L)return;const wp=g.localToWorld(new V3(o.position.x,0,o.position.z+(o.userData.r||1)+.7));G_.inter.push({kind:L.kind,p:wp.normalize(),r:1.6,label:L.label});G_.obst.push({p:g.localToWorld(o.position.clone()).normalize(),r:(o.userData.r||.8)})})},0);
    return g}

  /* ================= Figuren ================= */
  const ents=new Map();const labelsEl=$('labels');
  function makeEnt(d,o){o=o||{};const g=buildCreature(d,{q:o.q||(HIGH?.6:.45),noShadow:!HIGH,blob:false,fur:HIGH&&!!o.me,merge:true});g.scale.setScalar(CS);g.userData.wid=d.id;
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(.55,20),new THREE.MeshBasicMaterial({map:ctex('blob',128,128,(x,w,h)=>{const gr=x.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(60,40,90,.35)');gr.addColorStop(1,'rgba(60,40,90,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)}),transparent:true,depthWrite:false}));
    const mv=moveFor(d);const abs=abilitiesFor(d);const cd={};abs.forEach(a=>cd[a]=2+Math.random()*(ABIL[a].cd||8)*2);
    const p=o.p||randLand(Math.random,G_.sea+.4,99)||new V3(0,1,0);const dir=tangentTo(p,new V3(Math.random()-.5,Math.random()-.5,Math.random()-.5));
    const lbl=el('div','lbl'+(o.kind==='bot'?' bot':o.kind==='peer'?' online':o.kind==='me'?' me':''));lbl.textContent=d.name||'Namenlos';if(o.tag){const tg=el('span','tag'+(o.kind==='peer'?' on':''),o.tag);lbl.append(tg)}labelsEl.append(lbl);lbl.style.display='none';
    const bub=el('div','bubble');bub.hidden=true;labelsEl.append(bub);
    const e={d,g,shadow,p:p.clone(),dir,kind:o.kind||'villager',lbl,bub,mv:mv.m,move:MOVE[mv.m],water:mv.swim||MOVE[mv.m].water,fly:!!MOVE[mv.m].alt,abs,cd,phase:Math.random()*10,act:0,stop:0,dance:0,jump:0,sayT:0,emote:null,emoteT:0,
      goal:null,idleT:Math.random()*3,height:(g.userData.height||3)*CS,marked:0,energy:.8,home:p.clone(),speed:0,step:0,hidden:abs.some(a=>ABIL[a].flag==='hidden')};
    if(scene){scene.add(g);scene.add(shadow)}ents.set(d.id,e);return e}
  function dropEnt(id){const e=ents.get(id);if(!e)return;if(e.g.parent)e.g.parent.remove(e.g);if(e.shadow.parent)e.shadow.parent.remove(e.shadow);disposeTree(e.g);e.lbl.remove();e.bub.remove();ents.delete(id)}
  function say(e,txt,sec,emote){if(!e)return;e.bub.textContent=txt;e.bub.classList.toggle('emote',!!emote);e.bub.hidden=false;e.sayT=sec||3.2}

  /* ---------- Spieler ---------- */
  let me=null;const input={x:0,y:0,run:false,joy:null};let camYaw=0,camPitch=.42,camDist=10.5,camF=new V3(1,0,0);let tapTarget=null;
  function avatarData(){const d=sanitize(JSON.parse(JSON.stringify(S)));d.id='__me';if(!d.name.trim())d.name=SAVE.nick||'Du';return d}
  function spawnMe(){if(me)dropEnt('__me');const start=SAVE.lastPos&&SAVE.lastPos.planet===G_.id?new V3(...SAVE.lastPos.p).normalize():(G_.places.find(p=>p.id==='platz')||{dir:new V3(0,1,0)}).dir.clone().applyAxisAngle(new V3(1,0,0),.13).normalize();
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
  function syncVillagers(){if(!scene)return;const want=new Map(allCreatures().map(d=>[d.id,d]));for(const[id,e]of[...ents])if(e.kind==='villager'&&!want.has(id))dropEnt(id);
    if(G_.id!=='kompost'){for(const[id,e]of[...ents])if(e.kind==='villager')dropEnt(id);updPop();return}
    const r=srand(3);for(const[id,d]of want)if(!ents.has(id)){const pl=pick(G_.places.filter(x=>x.build));const p=W.near(pl.dir,.25/K*1.2)||randLand(r);makeEnt(d,{kind:'villager',p})}updPop()}
  function updPop(){const n=[...ents.values()].filter(e=>e.kind==='villager').length;$('popCount').textContent=`${WORLD.length} eigene · ${n} wohnen hier`}

  /* ---------- Bewegung einer Figur ---------- */
  const tmpQ=new THREE.Quaternion();
  function moveEnt(e,dirWorld,speed,dt){/* dirWorld tangential, speed Einheiten/s */if(speed<=0)return false;const ang=speed*dt/G_.R;const axis=new V3().crossVectors(e.p,dirWorld).normalize();if(!isFinite(axis.x))return false;
    const np=e.p.clone().applyAxisAngle(axis,ang).normalize();const h=G_.hAt(np);
    if(h<G_.sea-.3&&!e.water&&!e.fly){return false}
    /* Hindernisse */
    for(const o of G_.obst){const d=angle(np,o.p)*G_.R;const minD=o.r+.35;if(d<minD){const away=tangentTo(o.p,np.clone().sub(o.p));if(!isFinite(away.x))continue;const pushA=(minD-d)/G_.R;np.applyAxisAngle(new V3().crossVectors(o.p,away).normalize(),pushA*1.02).normalize()}}
    if(e.kind==='me'){for(const o of ents.values()){if(o===e||o.kind==='peer')continue;const d=angle(np,o.p)*G_.R;if(d<.7){const away=tangentTo(o.p,np.clone().sub(o.p));if(isFinite(away.x))np.applyAxisAngle(new V3().crossVectors(o.p,away).normalize(),(.7-d)/G_.R).normalize()}}}
    e.dir.applyAxisAngle(axis,ang);e.p.copy(np);e.dir.copy(tangentTo(e.p,e.dir));return true}

  function stepVillager(e,dt,t){e.stop=Math.max(0,e.stop-dt);e.dance=Math.max(0,e.dance-dt);e.jump=Math.max(0,e.jump-dt);e.act=Math.max(0,e.act-dt*1.3);
    /* Fähigkeiten */
    if(e.kind==='villager'&&mode==='outdoor'&&G_.id==='kompost'){for(const a of e.abs){const A=ABIL[a];if(!A.act)continue;e.cd[a]-=dt;if(e.cd[a]>0||e.goal||e.stop>0||e.talking)continue;e.cd[a]=(A.cd||8)*(1.6+Math.random()*1.2);
      try{if(A.need){const tt=W.nearest(A.need.t,e.p,A.need.r*1.5);if(tt){e.goal={p:tt.p,prop:tt,then:()=>{if(!tt.dying){A.act(e,W,tt);e.act=1}}}}else if(A.alone){A.act(e,W,null);e.act=1}}else{A.act(e,W,null);e.act=1}}catch(err){}break}}
    if(e.talking){e.speed=0;return}
    let moving=e.stop<=0&&e.dance<=0;let target=null;
    if(e.goal){target=e.goal.ent?e.goal.ent.p:e.goal.p;if(angle(e.p,target)*G_.R<.9){const f=e.goal.then;e.goal=null;f&&f();target=null;e.stop=1+Math.random()*2}else if(e.goal.prop&&e.goal.prop.dying){e.goal=null;target=null}}
    if(!target&&moving){e.idleT-=dt;if(e.idleT<=0){e.idleT=4+Math.random()*7;if(Math.random()<.35){e.stop=2+Math.random()*4}else{const home=e.home;e.goal={p:W.near(Math.random()<.6?home:pick(G_.places.filter(x=>x.build)).dir,.5/K*1.4)}}}}
    /* Spieler begrüssen */
    if(me&&e.kind!=='peer'&&angle(e.p,me.p)*G_.R<2.6&&!e.greetT){e.greetT=18+Math.random()*20;e.stop=Math.max(e.stop,2.2);e.lookAt=me;if(Math.random()<.5)say(e,pick(['Hallo!','Hey!','Oh, hi!','💚','👋']),2.2)}
    if(e.greetT)e.greetT=Math.max(0,e.greetT-dt);
    let spd=0;if(target&&moving){const want=tangentTo(e.p,target.clone().sub(e.p));if(isFinite(want.x)){e.dir.lerp(want,Math.min(1,dt*3)).normalize();e.dir.copy(tangentTo(e.p,e.dir))}spd=1.5*e.move.sp}
    if(spd>0&&!moveEnt(e,e.dir,spd,dt)){e.dir.applyAxisAngle(e.p,1.2+Math.random());e.goal=null}
    e.speed=spd}

  /* ---------- Figur ins Bild setzen ---------- */
  function poseEnt(e,dt,t){const h=G_.hAt(e.p);let base=h;const inWater=h<G_.sea;if(inWater)base=e.fly?G_.sea:G_.sea-.25;let alt=e.move.alt?e.move.alt*CS*1.1+Math.sin(t*1.5+e.phase)*.1:0;
    const moving=e.speed>.1;if(e.move.hop&&moving)alt+=Math.abs(Math.sin(t*5+e.phase))*e.move.hop*CS*1.2;if(e.jump>0)alt+=Math.sin((1-e.jump/.9)*PI)*.9;
    e.g.position.copy(e.p).multiplyScalar(G_.R+base+alt);e.g.up.copy(e.p);
    const look=e.lookAt&&e.stop>0?e.lookAt.g.position:e.g.position.clone().add(e.dir);e.g.lookAt(look);if(e.stop<=0)e.lookAt=null;
    if(e.dance>0){e.g.rotateY(Math.sin(t*6)*.6);e.g.position.addScaledVector(e.p,Math.abs(Math.sin(t*8))*.15)}
    if(e.emote&&e.emoteT>0)EMOTES[e.emote]&&EMOTES[e.emote].pose&&EMOTES[e.emote].pose(e,t,dt);
    /* weiches Squash beim Laufen */
    const sq=moving&&!e.move.alt?1+Math.sin(t*10+e.phase)*.03:1+Math.sin(t*2+e.phase)*.012;e.g.scale.set(CS*(2-sq)*.5+CS*.5,CS*sq,CS*(2-sq)*.5+CS*.5);
    const far=me&&e!==me&&angle(e.p,me.p)*G_.R>13;if(far!==e.far){e.far=far;setOutlines(e.g,!far&&HIGH)}
    if(!far||((t*10|0)%3===0))e.g.userData.tick(t+e.phase,moving,e.act);
    e.shadow.position.copy(e.p).multiplyScalar(surfR(e.p,true)+.03);e.shadow.quaternion.setFromUnitVectors(new V3(0,0,1),e.p);const ss=Math.max(.4,1-alt*.25);e.shadow.scale.setScalar(ss);
    if(e.sayT>0){e.sayT-=dt;if(e.sayT<=0)e.bub.hidden=true}
    if(e.emoteT>0){e.emoteT-=dt;if(e.emoteT<=0)e.emote=null}}

  /* ================= Interaktion ================= */
  let promptTarget=null;
  function findTarget(){if(!me)return null;let best=null,bs=1e9;const fw=me.dir;
    const consider=(p,r,obj)=>{const d=angle(me.p,p)*G_.R;if(d>r)return;const to=tangentTo(me.p,p.clone().sub(me.p));const facing=isFinite(to.x)?to.dot(fw):1;const score=d-facing*.8+(obj.prio||0);if(score<bs){bs=score;best=obj}};
    for(const e of ents.values()){if(e===me||e.kind==='peer')continue;consider(e.p,2.4,{kind:'talk',ent:e,label:(e.kind==='bot'?'Winken: ':'Reden: ')+(e.d.name||'Namenlos'),prio:-.6})}
    for(const it of G_.inter)consider(it.p,it.r+.4,Object.assign({},it,{label:it.label||(it.kind==='tree'?(it.ref.hasFruit?'Baum schütteln':'Baum schütteln'):it.kind)}));
    for(const it of ACT.targets())consider(it.p,it.r||1.6,it);
    if(!best){const f=ACT.waterAhead(me);if(f)best={kind:'fish',label:'Angel auswerfen',p:f}}
    return best}
  function doAction(){if(!me||UI.anyOpen()||ACT.busy())return;const t=promptTarget;SND.init();
    if(!t){if(ACT.busy())return;me.emote='hop';me.jump=.9;return}
    switch(t.kind){case 'talk':talkTo(t.ent);break;case 'tree':ACT.shake(t.ref);break;case 'fish':ACT.fish(t.p);break;
      case 'shop':SHOP.open(G_.id);break;case 'museum':INTERIOR.enter('museum');break;case 'house':INTERIOR.enter('house');break;case 'studio':PAINT.open();break;case 'rocket':travelMenu();break;
      case 'board':boardMenu();break;case 'stage':ACT.party();break;case 'mail':mailMenu();break;default:if(t.act)t.act()}}
  async function talkTo(e){if(e.kind==='bot'){SOCIAL.botTalk(e);return}e.talking=true;const old=e.dir.clone();e.lookAt=me;e.stop=99;me.dir.copy(tangentTo(me.p,e.p.clone().sub(me.p)));
    const d=e.d;const nm=d.name||'Namenlos';const pn=SAVE.nick||S.name||'du';const fill=s=>s.replace('{p}',pn);const voice=voiceFor(d);SAVE.stats.talks++;
    const fr=SAVE.friendship[d.id]||0;const lines=[fill(pick(TALK.hello))];
    const infos=activeKeys(d).map(a=>({a,i:d.info[a.key]})).filter(x=>x.i&&x.i.func);if(infos.length){const x=pick(infos);lines.push(pick(TALK.part).replace('{part}',x.i.name||x.a.label).replace('{func}',x.i.func).replace('{whom}',x.i.forWhom||'alle'))}else lines.push(pick(TALK.small));
    SND.duck(4,.45);const ch=await UI.talk(nm,lines,{voice,color:'#'+new THREE.Color(SKIN_COLORS[d.body.color]||'#FF8FB1').getHexString(),choices:['Plaudern','Geschenk geben','Karte ansehen','Tschüss']});
    if(ch===0){const more=[];const bs=infos.map(x=>x.i.boundary).filter(Boolean);if(bs.length&&Math.random()<.5)more.push(pick(TALK.boundary).replace('{b}',pick(bs)));more.push(pick(TALK.small));if(d.statement&&Math.random()<.5)more.push(d.statement);
      await UI.talk(nm,more,{voice});SAVE.friendship[d.id]=Math.min(100,fr+2);say(e,'💚',1.6,true)}
    else if(ch===1){await giftTo(e,voice)}
    else if(ch===2){showCard(d)}
    else{await UI.talk(nm,[fill(pick(TALK.bye))],{voice})}
    persist();e.talking=false;e.stop=1.5;e.dir.copy(old)}
  function voiceFor(d){const h=hashStr(d.id||d.name||'x');const n=parseInt(h.slice(0,4),36);const kinds=activeKeys(d).map(a=>a.kind);const robot=kinds.filter(k=>k==='masch').length>=2;return{pitch:170+(n%9)*22,speed:.9+(n%5)*.06,kind:robot?'robot':''}}
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
  function travelMenu(){const w=UI.win('Raketenstation',{size:'narrow'});w.body.append(el('p',null,'Wohin soll die Rakete fliegen? Jeder Planet hat eigene Fische, Insekten, Funde und einen eigenen Laden.'));
    const gr=el('div','grid');for(const[id,p]of Object.entries(PLANETS)){const c=el('button','card'+(id===G_.id?' sel':''));c.type='button';const sw=el('div','ph');sw.style.background=`radial-gradient(circle at 40% 35%,#fff8 0 12%,transparent 13%),radial-gradient(circle,${p.ground.mid} 0 45%,${p.water} 46%)`;c.append(sw,el('span',null,p.n),el('span','sub',p.desc));
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
  function travel(pid){const pl=G_.places.find(p=>p.build==='rocket');const rk=pl&&pl.obj&&pl.obj.children[0]&&pl.obj.children[0].userData.rocket;
    if(rk&&me){launchT={rk,t:0,pid,base:rk.position.y};me.g.visible=false;me.shadow.visible=false;SND.play('powerup');UI.toast('3 … 2 … 1 … Start!');return}
    doTravel(pid)}
  let launchT=null;
  function stepLaunch(dt){const L=launchT;if(!L)return;L.t+=dt;L.rk.position.y=L.base+Math.max(0,L.t-.6)*Math.max(0,L.t-.6)*9;L.rk.rotation.y+=dt*2;const pl=G_.places.find(p=>p.build==='rocket');if(pl&&Math.random()<.8)W.fx(pl.dir,pick(['rauch','funke','dampf']),2,pl.obj.localToWorld(new V3(0,L.rk.position.y,0)));camDist=Math.min(22,camDist+dt*4);
    if(L.t>2.6){launchT=null;L.rk.position.y=L.base;me.g.visible=true;me.shadow.visible=true;doTravel(L.pid)}}
  function doTravel(pid){fadeOut(async()=>{SND.play('whoosh');planetId=pid;SAVE.planet=pid;persist();await loadPlanet(pid);SND.music(G_.def.music);UI.toast('Willkommen auf dem '+G_.def.n+'!')})}
  function fadeOut(fn){const f=$('fade');f.classList.add('on');setTimeout(async()=>{await fn();setTimeout(()=>f.classList.remove('on'),120)},380)}
  async function loadPlanet(pid){/* alte Szene abbauen */for(const id of[...ents.keys()])dropEnt(id);me=null;W.props.length=0;parts.length=0;
    if(scene){scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});}
    buildOutdoor(pid);spawnMe();syncVillagers();SOCIAL.onPlanet&&SOCIAL.onPlanet(pid);ACT.onPlanet&&ACT.onPlanet(pid);seedEco();resize();$('clock').querySelector('span').textContent=G_.def.n}
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
   canvas.addEventListener('wheel',e=>{e.preventDefault();if(mode==='interior'){INTERIOR.zoom(e.deltaY);return}camDist=Math.max(5,Math.min(22,camDist+e.deltaY*.01))},{passive:false})}
  const ray=new THREE.Raycaster();
  function tap(e){const r=canvas.getBoundingClientRect();const m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(m,cam);
    if(mode==='interior'){INTERIOR.tap(ray,e);return}if(!me||UI.anyOpen())return;
    const hits=ray.intersectObjects([...ents.values()].filter(x=>x!==me).map(x=>x.g),true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.wid)o=o.parent;const en=o&&ents.get(o.userData.wid);if(en){if(angle(en.p,me.p)*G_.R<3){promptTarget={kind:'talk',ent:en};doAction()}else tapTarget={p:en.p.clone(),then:()=>{promptTarget={kind:'talk',ent:en};doAction()}};return}}
    const ph=ray.intersectObject(G_.planet,false);if(ph.length){const p=ph[0].point.clone().normalize();tapTarget={p};SND.play('select',{vol:.3})}}
  /* Joystick */
  {const joy=$('joy'),knob=joy.firstElementChild;let id=null,c0=null;joy.addEventListener('pointerdown',e=>{id=e.pointerId;joy.setPointerCapture(id);const r=joy.getBoundingClientRect();c0={x:r.left+r.width/2,y:r.top+r.height/2};input.joy={x:0,y:0};mv(e);SND.init()});
   const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-c0.x,dy=e.clientY-c0.y;const L=Math.hypot(dx,dy),max=48;if(L>max){dx*=max/L;dy*=max/L}knob.style.transform=`translate(${dx}px,${dy}px)`;input.joy={x:dx/max,y:-dy/max}};
   joy.addEventListener('pointermove',mv);const end=e=>{if(e.pointerId!==id)return;id=null;input.joy=null;knob.style.transform=''};joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end)}
  $('hbA').onclick=()=>{if(mode==='interior')INTERIOR.action();else doAction()};

  /* ================= Schleife ================= */
  let stepT=0,dayT=0,ecoT=2,camSnap=true,overview=null;
  function frame(dt,t){if(!scene)return;
    if(mode==='interior'){INTERIOR.frame(dt,t);for(const e of ents.values())if(e.inside){poseInside(e,dt,t)}INTERIOR.render();labelsInterior();stepParts(dt);return}
    /* Spieler-Eingabe */
    let ix=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0),iy=(keys['w']||keys['arrowup']?1:0)-(keys['s']||keys['arrowdown']?1:0);
    if(input.joy){ix=input.joy.x;iy=input.joy.y}if(keys['q'])camYaw+=dt*1.8;if(keys['c'])camYaw-=dt*1.8;
    const busy=UI.anyOpen()||ACT.busy();if(busy){ix=0;iy=0}
    if(me){camF.copy(tangentTo(me.p,camF));if(!isFinite(camF.x))camF=tangentTo(me.p,new V3(1,0,0));if(Math.abs(camYaw)>1e-4){camF.applyAxisAngle(me.p,camYaw*.0+0);}
      const cf=camF.clone().applyAxisAngle(me.p,camYaw);const cr=new V3().crossVectors(cf,me.p).normalize();
      let mvv=cf.clone().multiplyScalar(iy).addScaledVector(cr,ix);let mag=Math.min(1,Math.hypot(ix,iy));
      if(mag<.1&&tapTarget&&!busy){const to=tangentTo(me.p,tapTarget.p.clone().sub(me.p));const dist=angle(me.p,tapTarget.p)*G_.R;if(dist<.8||!isFinite(to.x)){const f=tapTarget.then;tapTarget=null;f&&f()}else{mvv=to;mag=1}}else if(mag>.1)tapTarget=null;
      const run=keys['shift']||(input.joy&&Math.hypot(input.joy.x,input.joy.y)>.95);let spd=0;
      if(mag>.1){mvv.normalize();me.dir.lerp(mvv,Math.min(1,dt*10)).normalize();me.dir.copy(tangentTo(me.p,me.dir));spd=(run?6.8:3.8)*Math.min(1.35,Math.max(.6,me.move.sp))*mag;if(!moveEnt(me,mvv,spd,dt)){spd=0}}
      me.speed=spd;if(spd>0&&me.emote){me.emote=null;me.emoteT=0;me.dance=0}
      /* Schritte */
      if(spd>0&&!me.move.alt){stepT-=dt*spd*.55;if(stepT<=0){stepT=1;if(run&&Math.random()<.7)W.fx(me.p,'staub',2,onSurf(me.p,.15));const h=G_.hAt(me.p);if(h>G_.sea+.05)SND.play(h<G_.sea+.4?'step_grass':'step_grass',{vol:.28,jitter:.15});else SND.play('soft',{vol:.2,rate:1.4,jitter:.2})}}
      SAVE.lastPos={planet:G_.id,p:[+me.p.x.toFixed(4),+me.p.y.toFixed(4),+me.p.z.toFixed(4)]}}
    /* Figuren */
    for(const e of ents.values()){if(e===me||e.kind==='peer'){}else stepVillager(e,dt,t);if(e.kind==='peer')SOCIAL.stepPeer(e,dt)}
    const camP=cam.position.clone().normalize();for(const e of ents.values()){const vis=overview?e.p.dot(camP)>.1:e===me||(e.p.dot(camP)>.55&&angle(e.p,me?me.p:e.p)*G_.R<40);e.g.visible=vis;e.shadow.visible=vis;if(vis)poseEnt(e,dt,t)}
    stepProps(dt,t);stepParts(dt);stepClouds(dt);stepBall(dt);stepLaunch(dt);for(const o of G_.ticks){try{o.userData.tick(t,false,0)}catch(e){}}ACT.frame(dt,t);SOCIAL.frame(dt,t);grassU.value=t;G_.waterU.uT.value=t;
    ecoT-=dt;if(ecoT<=0){ecoT=1;ecoTick()}
    /* Tageszeit (echte Uhr) */
    dayT-=dt;if(dayT<=0){dayT=5;dayLight()}
    /* Kamera */
    if(overview){overview.az+=dt*.06;const d=G_.R*3.1;const want=new V3(Math.cos(overview.az)*Math.cos(.5),Math.sin(.5),Math.sin(overview.az)*Math.cos(.5)).multiplyScalar(d);cam.position.lerp(want,Math.min(1,dt*2));cam.up.set(0,1,0);cam.lookAt(0,0,0)}
    else if(me){const cf=camF.clone().applyAxisAngle(me.p,camYaw);const up=me.p;const target=me.g.position.clone().addScaledVector(up,1.1);
      const want=target.clone().addScaledVector(cf,-camDist*Math.cos(camPitch)).addScaledVector(up,camDist*Math.sin(camPitch)+.6);
      if(camSnap||cam.position.distanceTo(want)>30){cam.position.copy(want);cam.up.copy(up);camSnap=false}else{cam.position.lerp(want,Math.min(1,dt*6));cam.up.lerp(up,Math.min(1,dt*6))}cam.lookAt(target);
      /* Sonne folgt Spieler (Schatten) */const sp=me.p.clone();const sd=tangentTo(sp,new V3(.5,.2,.6)).multiplyScalar(.9).add(sp).normalize();G_.sun.position.copy(me.g.position).addScaledVector(sd,40).addScaledVector(sp,26);G_.sun.target.position.copy(me.g.position);G_.fill.position.copy(me.g.position).addScaledVector(sp,10).addScaledVector(sd,-15)
      /* Ambiente */;const nearSea=G_.hAt(me.p)<G_.sea+.9?1:0;SND.ambience('meer',nearSea*.6);SND.ambience('wind',.25)}
    /* Prompt */
    promptTarget=busy?null:findTarget();const pr=$('prompt');if(promptTarget&&!UI.anyOpen()){pr.hidden=false;pr.innerHTML='';const k=el('kbd',null,'E');pr.append(k,document.createTextNode(promptTarget.label));$('hbA').textContent=shortLabel(promptTarget)}else{pr.hidden=true;$('hbA').textContent='Hüpfen'}
    if(HIGH)comp.render();else R.render(scene,cam);labels()}
  function shortLabel(t){return{talk:'Reden',tree:'Schütteln',fish:'Angeln',shop:'Laden',museum:'Museum',house:'Haus',studio:'Malen',rocket:'Reisen',board:'Lesen',stage:'Tanzen',mail:'Post',dig:'Graben',pick:'Nehmen',bug:'Fangen'}[t.kind]||'Aktion'}
  function stepProps(dt,t){for(let i=W.props.length-1;i>=0;i--){const x=W.props[i];
      if(x.dying){x.dying+=dt*2;const s=Math.max(0,1-x.dying)*x.big;x.g.scale.setScalar(Math.max(.001,s));if(x.dying>=1){G_.scene.remove(x.g);disposeTree(x.g);W.props.splice(i,1)}continue}
      if(x.grow<1){x.grow=Math.min(1,x.grow+dt/x.growT)}const e=x.grow<1?1+Math.sin(x.grow*PI)*.25:1;const s=(x.decal?1:(.15+.85*x.grow))*x.big*e;x.g.scale.setScalar(s);
      if(x.type==='mast'){x.g.traverse(o=>{if(o.userData.blink)o.visible=Math.sin(t*4)>0})}}
    for(const tr of G_.props){if(tr.shakeT>0){tr.shakeT-=dt;tr.g.rotation.x=0;const a=Math.sin(tr.shakeT*40)*tr.shakeT*.12;tr.g.children.forEach(c=>{c.rotation.z=a;c.rotation.x=a*.5})}}}
  function stepParts(dt){for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.life-=dt;q.sp.position.addScaledVector(q.v,dt);if(q.grav)q.v.addScaledVector(q.n,q.grav*dt);q.sp.material.opacity=Math.min(1,q.life/q.max*2.2);if(q.life<=0){q.sc.remove(q.sp);q.sp.material.dispose();parts.splice(i,1)}}}
  function ecoTick(){if(G_.id!=='kompost')return;const live=W.props.filter(x=>!x.dying);const oils=live.filter(x=>x.type==='oel');
    for(let i=0;i<10;i++){const x=pick(live);if(!x)break;const REP={baum:[.03,3],blume:[.08,5],pilz:[.04,3],moos:[.02,4]}[x.type];if(REP&&x.grow>=1&&Math.random()<REP[0]&&live.filter(y=>y.type===x.type&&y.p.dot(x.p)>Math.cos(.12)).length<REP[1]&&!oils.some(o=>o.p.dot(x.p)>Math.cos(.1)))W.spawn(x.type,W.near(x.p,.12))}
    for(const o of oils)for(const x of live){if(x.p.dot(o.p)<Math.cos(.06))continue;if(['blume','pilz'].includes(x.type)&&Math.random()<.08)W.remove(x);if(x.type==='moos'&&Math.random()<.05){W.remove(o);note('Moos hat einen Ölfleck abgebaut');break}}}
  function dayLight(){const d=new Date();const h=d.getHours()+d.getMinutes()/60;const hh=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');$('clock').querySelector('b').textContent=hh;
    const night=h<6||h>=21?1:h<7.5?1-(h-6)/1.5:h>19.5?(h-19.5)/1.5:0;const dusk=(h>17.5&&h<21)||(h>5.5&&h<8)?1:0;G_.night=night;
    const def=G_.def;G_.scene.background=night>.5?skyTex('#2B2F66','#6A5A9E','n'+G_.id):dusk&&night<.5?skyTex('#9FB4F0','#FFC9A8','d'+G_.id):skyTex(def.sky[0],def.sky[1],G_.id);
    G_.sun.intensity=1-night*.6;G_.sun.color.set(dusk?'#ffd9b0':'#fff3de');G_.hemi.intensity=.52-night*.12;G_.hemi.color.set(night>.5?'#8f9cff':'#dff1ff');G_.stars.material.opacity=night;G_.scene.fog.color.set(night>.5?'#4b4a86':def.fog)}
  /* ---------- Namensschilder & Sprechblasen ---------- */
  const tV=new V3();
  function labels(){const w=canvas.clientWidth,h=canvas.clientHeight;const camN=cam.position.clone().normalize();for(const e of ents.values()){const near=overview?e.p.dot(camN)>.3:me&&(e===me||angle(e.p,me.p)*G_.R<16);const show=e.g.visible&&near;
      const top=tV.copy(e.g.position).addScaledVector(e.p,e.height+.3);top.project(cam);if(!show||top.z>1){e.lbl.style.display='none';e.bub.style.display='none';continue}
      const x=(top.x+1)/2*w,y=(1-top.y)/2*h;const nameOn=overview?e.kind!=='bot':e!==me&&(angle(e.p,me.p)*G_.R<7||e.kind!=='villager');e.lbl.style.display=nameOn?'':'none';e.lbl.style.left=x+'px';e.lbl.style.top=y+'px';
      e.bub.style.display=e.bub.hidden?'none':'';e.bub.style.left=x+'px';e.bub.style.top=(y-(nameOn?24:4))+'px'}}
  function labelsInterior(){const w=canvas.clientWidth,h=canvas.clientHeight;for(const e of ents.values()){if(!e.inside){e.lbl.style.display='none';e.bub.style.display='none';continue}const top=tV.copy(e.g.position).add(new V3(0,e.height+.3,0)).project(INTERIOR.cam);
      const x=(top.x+1)/2*w,y=(1-top.y)/2*h;e.lbl.style.display=e===me?'none':'';e.lbl.style.left=x+'px';e.lbl.style.top=y+'px';e.bub.style.display=e.bub.hidden?'none':'';e.bub.style.left=x+'px';e.bub.style.top=(y-24)+'px'}}
  function poseInside(e,dt,t){e.g.position.set(e.ix,0,e.iz);e.g.up.set(0,1,0);e.g.lookAt(e.ix+Math.sin(e.iyaw),0,e.iz+Math.cos(e.iyaw));const moving=e.speed>.1;const sq=moving?1+Math.sin(t*10)*.03:1+Math.sin(t*2)*.012;e.g.scale.set(CS,CS*sq,CS);
    if(e.dance>0){e.g.rotateY(Math.sin(t*6)*.6)}e.g.userData.tick(t+e.phase,moving,e.act);e.shadow.position.set(e.ix,.02,e.iz);e.shadow.quaternion.setFromUnitVectors(new V3(0,0,1),UPV);if(e.sayT>0){e.sayT-=dt;if(e.sayT<=0)e.bub.hidden=true}if(e.emoteT>0){e.emoteT-=dt;if(e.emoteT<=0)e.emote=null}}

  function resize(){sizeView(R,cam,comp,$('world'))}
  function quality(){R.shadowMap.enabled=HIGH;if(scene)loadPlanet(G_.id)}
  async function init(){await loadPlanet(planetId);dayLight()}
  function onAvatarChanged(){if(!me||!scene)return;const p=me.p.clone(),dir=me.dir.clone();const inside=me.inside;const ix=me.ix,iz=me.iz;dropEnt('__me');me=makeEnt(avatarData(),{kind:'me',p,q:HIGH?.9:.6,me:true});me.dir.copy(dir);if(inside){INTERIOR.adopt(me);me.ix=ix;me.iz=iz}}
  function toggleOverview(){overview=overview?null:{az:Math.atan2(cam.position.z,cam.position.x)};if(!overview)camSnap=true;UI.toast(overview?'Beamer-Übersicht: alle Cyborgs auf einen Blick. Nochmals drücken zum Beenden.':'Zurück zur Spielfigur');return!!overview}
  return{_load:loadPlanet,toggleOverview,get overview(){return!!overview},_joy:()=>input.joy,init,frame,resize,quality,travel,syncVillagers,onAvatarChanged,W,G:G_,ents,get me(){return me},get scene(){return scene},cam,R,say,makeEnt,dropEnt,moveEnt,onSurf,placeObj,angle,tangentTo,isLand,randLand,note,
    get mode(){return mode},set mode(v){mode=v},showCard,talkTo,voiceFor,fadeOut,parts,makeNature,nearPlace,get camF(){return camF},get night(){return G_.night||0}};
})();
