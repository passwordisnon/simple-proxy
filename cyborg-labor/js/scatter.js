/* =====================================================================
   CYBORG-LABOR · scatter.js
   Instanzierte Natur in Planeten-Chunks: jede Natur-Art wird einmal gebaut
   (je Material zusammengeführt) und hundertfach instanziert. Nur Chunks in
   Sichtweite werden gezeichnet. Belegungs-Raster verhindert Überschneidungen,
   Hindernis-Raster macht Kollisionen schnell.
   ===================================================================== */
const SCATTER=(()=>{
  const UP=new THREE.Vector3(0,1,0);
  let chunks=[],K=96,R=40,protos=new Map(),insts=[],M=null,scene=null,visAng=1.1,nearAng=.6;
  const grid=new Map(),CELL=3;               /* Belegung (alles) */
  const obst=new Map(),OCELL=4;              /* Hindernisse (fest) */
  const key3=(x,y,z,c)=>Math.floor(x/c)+','+Math.floor(y/c)+','+Math.floor(z/c);
  /* Streaming (grosse Planeten): Chunks werden erst in der Nähe gefüllt und in der Ferne wieder abgebaut */
  let fillFn=null,unloadFn=null,cur=null,loadAng=1,chunkAng=.3;
  function reset(sc,rad,mats,o){o=o||{};scene=sc;R=rad;M=mats;grid.clear();obst.clear();insts=[];fillFn=o.fill||null;unloadFn=o.unload||null;cur=null;
    for(const c of chunks)for(const m of c.meshes){m.parent&&m.parent.remove(m)}
    const area=rad*rad*4*PI;K=fillFn?Math.round(Math.max(24,area/(o.chunkArea||900))):Math.round(Math.max(24,Math.min(80,area/650)));chunks=[];const ga=PI*(3-Math.sqrt(5));
    for(let i=0;i<K;i++){const y=1-(i+.5)/K*2,r=Math.sqrt(1-y*y),t=ga*i;chunks.push({i,dir:new THREE.Vector3(Math.cos(t)*r,y,Math.sin(t)*r),groups:new Map(),meshes:[],vis:true,loaded:!fillFn,occ:[],obs:[],insts:[],nb:null})}
    chunkAng=Math.sqrt(4*PI/K);
    /* Nachbarn je Chunk: schnelles chunkOf beim Füllen */for(const c of chunks){c.nb=[];const lim=Math.cos(chunkAng*2.6);for(const d of chunks)if(c.dir.dot(d.dir)>lim)c.nb.push(d.i)}
    visAng=Math.min(1.5,Math.acos(R/(R+9))+chunkAng*.75+.12);nearAng=(HIGH?30:20)/R+chunkAng*.7;loadAng=Math.min(PI,(o.loadDist||(HIGH?95:70))/R+chunkAng*.7)}
  function chunkOf(p,hint){if(hint!=null&&chunks[hint]&&chunks[hint].nb){let best=hint,bd=-2;for(const i of chunks[hint].nb){const d=chunks[i].dir.dot(p);if(d>bd){bd=d;best=i}}return best}
    let best=0,bd=-2;for(let i=0;i<K;i++){const d=chunks[i].dir.dot(p);if(d>bd){bd=d;best=i}}return best}
  /* zufälliger Punkt in Chunk i (gleichmässig; Punkte ausserhalb der Voronoi-Zelle werden verworfen) */
  const _t1=new THREE.Vector3(),_t2=new THREE.Vector3();
  function randIn(i,r){const c=chunks[i].dir;const a=chunkAng*.95;const ct=1-r()*(1-Math.cos(a)),st=Math.sqrt(1-ct*ct),ph=r()*TAU;
    _t1.set(1,0,0);if(Math.abs(c.x)>.9)_t1.set(0,1,0);_t1.sub(c.clone().multiplyScalar(_t1.dot(c))).normalize();_t2.crossVectors(c,_t1);
    const p=c.clone().multiplyScalar(ct).addScaledVector(_t1,st*Math.cos(ph)).addScaledVector(_t2,st*Math.sin(ph)).normalize();return chunkOf(p,i)===i?p:null}
  /* Faktor, um den mehr Proben nötig sind (Kappe grösser als Zelle) */const oversample=()=>2*PI*(1-Math.cos(chunkAng*.95))/(4*PI/K);
  /* ---------- Belegung ---------- */
  function occAdd(wp,r){const k=key3(wp.x,wp.y,wp.z,CELL);let a=grid.get(k);if(!a)grid.set(k,a=[]);const o={wp:wp.clone(),r};a.push(o);if(cur)cur.occ.push([k,o])}
  function occFree(wp,r){const cx=Math.floor(wp.x/CELL),cy=Math.floor(wp.y/CELL),cz=Math.floor(wp.z/CELL);const rr=Math.ceil((r+2.5)/CELL);
    for(let x=cx-rr;x<=cx+rr;x++)for(let y=cy-rr;y<=cy+rr;y++)for(let z=cz-rr;z<=cz+rr;z++){const a=grid.get(x+','+y+','+z);if(!a)continue;for(const o of a){const d=o.wp.distanceTo(wp);if(d<o.r+r)return false}}return true}
  function obstAdd(wp,r,ref){const k=key3(wp.x,wp.y,wp.z,OCELL);let a=obst.get(k);if(!a)obst.set(k,a=[]);const o={wp:wp.clone(),p:wp.clone().normalize(),r,ref};a.push(o);if(cur)cur.obs.push([k,o]);return o}
  function obstNear(wp,rad){const out=[];const cx=Math.floor(wp.x/OCELL),cy=Math.floor(wp.y/OCELL),cz=Math.floor(wp.z/OCELL);const rr=Math.ceil((rad+1)/OCELL);
    for(let x=cx-rr;x<=cx+rr;x++)for(let y=cy-rr;y<=cy+rr;y++)for(let z=cz-rr;z<=cz+rr;z++){const a=obst.get(x+','+y+','+z);if(a)for(const o of a)out.push(o)}return out}
  /* ---------- Prototypen ---------- */
  function proto(type,opt,variant){const k=type+'|'+variant+'|'+(opt?JSON.stringify(opt):'');if(protos.has(k))return protos.get(k);
    const n=NATURE[type];const g=new THREE.Group();const small=n&&(n.size==='tiny'||n.size==='small'||(n.r||.15)<.35);QF=small?(HIGH?.3:.22):(HIGH?.5:.36);try{if(n)n.b(g,M,Object.assign({planet:GAME.G.id},opt||{}),srand(variant*131+7));else P(g,G.s(.3),M.c('#7CC46A'),[0,.3,0])}catch(e){console.warn('Natur',type,e)}QF=1;
    addOutlines(g);g.updateMatrixWorld(true);const fruitSet=new Set();(g.userData.fruits||[]).forEach(f=>f.traverse(o=>fruitSet.add(o)));const blinkSet=new Set();(g.userData.blink||[]).forEach(f=>blinkSet.add(f));
    /* Einfarbige Toon-Materialien werden als Vertex-Farben eingebacken: ein Material je Pflanze statt zehn → viel weniger Draw-Calls */
    const buckets=new Map();const colGeo=paintGeo;
    g.traverse(o=>{if(!o.isMesh||o.userData.hull||!o.visible)return;let geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const a of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(a))geo.deleteAttribute(a);
      if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));geo.clearGroups();geo.applyMatrix4(o.matrixWorld);
      const mt=o.material;const hull=o.children.find(c=>c.userData.hull);const fr=fruitSet.has(o),bl=blinkSet.has(o);
      const bake=canBake(mt);
      let kk;if(bake){colGeo(geo,mt.color);kk='VC'+(mt.side===THREE.DoubleSide?'d':'')+(mt.userData.gloss>0?'g':'')+'|'+(fr?1:0)+'|'+(bl?1:0)}else{colGeo(geo,new THREE.Color(1,1,1));kk=mt.uuid+'|'+(hull?hull.material.uuid:'')+'|'+(fr?1:0)+'|'+(bl?1:0)}
      if(!buckets.has(kk))buckets.set(kk,{mat:bake?vcMat(mt.side===THREE.DoubleSide,mt.userData.gloss>0):mt,vc:bake,hull:!bake&&hull&&hull.material,fruit:fr,blink:bl,list:[],hl:[],cast:!o.userData.noShadow&&!(n&&n.decal)});
      const b=buckets.get(kk);b.list.push(geo);if(bake&&hull){const hg=geo.clone();colGeo(hg,hull.material.color,hull.material.userData.ow??OUTLINE_BASE*.75);b.hl.push(hg)}});
    const parts=[];for(const b of buckets.values()){const geo=THREE.BufferGeometryUtils.mergeBufferGeometries(b.list,false);b.list.forEach(x=>x.dispose());if(!geo)continue;geo.computeBoundingSphere();
      let hull=b.hull,hullGeo=null;if(b.vc&&b.hl.length){hullGeo=THREE.BufferGeometryUtils.mergeBufferGeometries(b.hl,false);b.hl.forEach(x=>x.dispose());hull=vcHull()}
      parts.push({geo,mat:b.mat,hull,hullGeo,fruit:b.fruit,blink:b.blink,cast:b.cast})}
    const box=new THREE.Box3().setFromObject(g);const pr={parts,info:n||{},h:box.max.y,small:box.max.y<.9&&Math.max(box.max.x-box.min.x,box.max.z-box.min.z)<1.4,hasFruit:parts.some(p=>p.fruit),fruitIds:(g.userData.fruits||[]).map(f=>f.name)};protos.set(k,pr);disposeTree(g);return pr}
  /* ---------- Hinzufügen ---------- */
  const _q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_m=new THREE.Matrix4(),_s=new THREE.Vector3();
  function add(type,opt,p,o){o=o||{};const variant=o.variant??0;const pr=proto(type,opt,variant);const c=cur?cur.i:chunkOf(p);const ch=chunks[c];const pk=type+'|'+variant+'|'+(opt?JSON.stringify(opt):'');
    let grp=ch.groups.get(pk);if(!grp)ch.groups.set(pk,grp={pr,list:[]});
    const inst={type,opt,p:p.clone(),yaw:o.yaw||0,scale:o.scale||1,off:o.off||0,chunk:c,grp,idx:grp.list.length,fruit:pr.hasFruit,shake:0,alive:true,pr};grp.list.push(inst);insts.push(inst);ch.insts.push(inst);return inst}
  /* exakte Höhenfunktion (nicht die gerade sichtbare, evtl. grobe LOD-Kachel) → nichts schwebt nach dem Verfeinern */
  function matrixOf(inst,extra){const h=(GAME.G.hExact||GAME.G.hAt)(inst.p);const r=GAME.G.R+(inst.water?GAME.G.sea:h)+inst.off;_q.setFromUnitVectors(UP,inst.p);_q2.setFromAxisAngle(UP,inst.yaw);_q.multiply(_q2);if(extra)_q.multiply(extra);
    _s.setScalar(inst.alive?inst.scale:0);return _m.compose(inst.p.clone().multiplyScalar(r),_q,_s)}
  /* ---------- Aufbauen ---------- */
  function buildChunk(ch){for(const grp of ch.groups.values()){const n=grp.list.length;if(!n||grp.meshes)continue;grp.meshes=[];
      for(const part of grp.pr.parts){const im=new THREE.InstancedMesh(part.geo,part.mat,n);im.frustumCulled=false;im.castShadow=HIGH&&part.cast;im.receiveShadow=true;grp.list.forEach((it,i)=>{im.setMatrixAt(i,matrixOf(it));});im.instanceMatrix.needsUpdate=true;
        if(part.blink)im.userData.blink=true;if(part.fruit)im.userData.fruit=true;if(grp.pr.small)im.userData.small=true;scene.add(im);ch.meshes.push(im);grp.meshes.push({im,part});
        if(part.hull){const hm=new THREE.InstancedMesh(part.hullGeo||part.geo,part.hull,n);hm.frustumCulled=false;hm.userData.hull=true;if(grp.pr.small)hm.userData.small=true;hm.instanceMatrix=im.instanceMatrix;scene.add(hm);ch.meshes.push(hm);grp.meshes.push({im:hm,part,hull:true})}}}}
  function finalize(){for(const ch of chunks)if(ch.loaded)buildChunk(ch)}
  /* ---------- Streaming: Chunk füllen / abbauen ---------- */
  function loadChunk(ch){if(ch.loaded||!fillFn)return;ch.loaded=true;cur=ch;try{fillFn(ch.i,ch)}catch(e){console.warn('Chunk',ch.i,e)}cur=null;buildChunk(ch)}
  function unloadChunk(ch){if(!ch.loaded||!fillFn)return;if(unloadFn)try{unloadFn(ch)}catch(e){}
    for(const m of ch.meshes){if(m.parent)m.parent.remove(m);if(!m.userData.hull&&m.dispose)m.dispose()}ch.meshes=[];ch.groups=new Map();
    const drop=(map,list)=>{for(const[k,o]of list){const a=map.get(k);if(!a)continue;const j=a.indexOf(o);if(j>=0)a.splice(j,1);if(!a.length)map.delete(k)}};drop(grid,ch.occ);drop(obst,ch.obs);ch.occ=[];ch.obs=[];
    const dead=new Set(ch.insts);for(const it of ch.insts){it.alive=false;shaking.delete(it)}insts=insts.filter(it=>!dead.has(it));ch.insts=[];ch.loaded=false}
  /* Chunks um den Blickpunkt laden (Zeitbudget), ferne abbauen. force: alles Nötige sofort (Ladebildschirm) */
  function stream(dir,budget,force){if(!fillFn)return 0;const cl=Math.cos(loadAng),cu=Math.cos(Math.min(PI,loadAng*1.25+.05));const t0=performance.now();let n=0;
    const want=[];for(const ch of chunks){const d=ch.dir.dot(dir);if(!ch.loaded&&d>cl)want.push([d,ch]);else if(ch.loaded&&d<cu)unloadChunk(ch)}
    want.sort((a,b)=>b[0]-a[0]);for(const[,ch]of want){loadChunk(ch);n++;if(!force&&performance.now()-t0>budget)break}return want.length-n}
  function refresh(inst,extra){const m=matrixOf(inst,extra);for(const{im,part}of inst.grp.meshes){if(part.fruit&&!inst.fruit){im.setMatrixAt(inst.idx,_m.clone().scale(new THREE.Vector3(0,0,0)))}else im.setMatrixAt(inst.idx,m);im.instanceMatrix.needsUpdate=true}}
  /* Sichtbarkeit nach Blickpunkt */
  /* grosse Dinge bis zum Horizont, kleine (Blumen, Klee, Kiesel) nur in der Nähe; Umrisse nur nah */
  function update(camDir,t,outlines){const c=Math.cos(visAng),cn=Math.cos(nearAng),co=Math.cos(nearAng*.8);if(outlines===undefined)outlines=true;
    for(const ch of chunks){const d=ch.dir.dot(camDir);const v=d>c,vn=d>cn,vo=outlines&&d>co;ch.vis=v;
      for(const m of ch.meshes){const u=m.userData;let on=u.small?vn:v;if(u.hull)on=on&&vo;if(on&&u.blink&&t!==undefined)on=Math.sin(t*4)>0;m.visible=on}}}
  /* Schütteln: kurzes Wackeln der Instanz */
  const shaking=new Set();function shake(inst){inst.shake=.9;shaking.add(inst)}
  function step(dt){for(const it of shaking){it.shake-=dt;const a=Math.sin(it.shake*40)*it.shake*.1;refresh(it,new THREE.Quaternion().setFromEuler(new THREE.Euler(a*.5,0,a)));if(it.shake<=0){shaking.delete(it);refresh(it)}}}
  function setFruit(inst,on){inst.fruit=on;refresh(inst)}
  function remove(inst){inst.alive=false;refresh(inst)}
  return{reset,add,finalize,update,step,shake,setFruit,remove,occAdd,occFree,obstAdd,obstNear,proto,stream,randIn,oversample,get streaming(){return !!fillFn},get insts(){return insts},get chunks(){return chunks},get K(){return K},chunkOf};
})();
