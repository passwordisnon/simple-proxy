/* =====================================================================
   CYBORG-LABOR · activities.js
   Angeln, Insekten fangen, Graben, Bäume schütteln, Sammeln, Emotes,
   Tanzparty, Tasche, Sammel-Lexikon.
   ===================================================================== */
/* ---------- Gegenstände ---------- */
const findIn=(arr,id)=>arr.find(x=>x.id===id);
function itemDef(kind,id){return kind==='fish'?findIn(FISH,id):kind==='bug'?findIn(BUGS,id):kind==='relic'?findIn(RELICS,id):kind==='item'?findIn(ITEMS,id):kind==='furn'?findFurn(id):kind==='wall'?findIn(WALLPAPERS,id):kind==='floor'?findIn(FLOORS,id):kind==='design'?SAVE.designs.find(d=>d.id===id):kind==='plant'&&typeof SEEDS!=='undefined'?findIn(SEEDS,id):null}
function itemName(kind,id){const d=itemDef(kind,id);return d?(d.n||d.name||id):id}
/* Wirtschaft: Verkaufen bringt weniger, und dieselbe Sache mehrmals am selben Tag verkaufen senkt den Preis (Markt ist gesättigt) */
function marketDay(){return Math.floor((GAMETIME.hour()+(SAVE.dayN||0)*24)/24)}
function saturation(id){const M=SAVE.market=SAVE.market||{};const e=M[id];if(!e)return 0;const days=Math.max(0,((Date.now()-e.t)/60000)/24);/* 1 Spieltag = 24 echte Minuten */return Math.max(0,e.n-days*4)}
function noteSold(id,n){const M=SAVE.market=SAVE.market||{};const s0=saturation(id);M[id]={n:s0+n,t:Date.now()}}
function itemPrice(kind,id){const d=itemDef(kind,id);if(!d)return 4;let p;if(kind==='furn'||kind==='wall'||kind==='floor')p=(d.price||100)/5;else p=(d.price||50)*.45;return Math.max(1,Math.round(p/(1+saturation(id)*.12)))}
function itemThumb(kind,id){const d=itemDef(kind,id);if(!d){return el('div','ph')}
  if(kind==='wall'||kind==='floor'){const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');try{d.draw(x,96,96)}catch(e){}const img=new Image();img.src=c.toDataURL();img.alt='';img.style.borderRadius='12px';return img}
  if(kind==='design'){return designImg(d)}
  return UI.objThumb(kind+':'+id,(g,m)=>d.b(g,m,d.opt||{},srand(3)),kind==='fish'?new V3(1,.35,.25):kind==='bug'?new V3(.4,1,.6):undefined)}
function designImg(d,size){const c=document.createElement('canvas');c.width=c.height=size||64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const s=c.width/32;for(let i=0;i<1024;i++){const k=parseInt(d.px[i],16);if(k===0&&d.pal[0]==='#ffffff'&&false)continue;x.fillStyle=d.pal[k];x.fillRect((i%32)*s,Math.floor(i/32)*s,s,s)}const img=new Image();img.src=c.toDataURL();img.alt=d.name||'';img.style.imageRendering='pixelated';return img}

/* ---------- Emotes ---------- */
const EMOTES={
  winken:{i:'wave',n:'Winken',pose:(e,t)=>{e.act=Math.max(e.act,.7)}},
  tanzen:{i:'dance',n:'Tanzen',start:e=>{e.dance=6}},
  freude:{i:'party',n:'Freude',start:e=>{e.jump=.9;GAME.W.fx(e.p,'konfetti',14)}},
  herz:{i:'heart',n:'Herz',start:e=>GAME.W.fx(e.p,'herz',8)},
  lachen:{i:'laugh',n:'Lachen',pose:(e,t)=>{e.g.rotateZ(Math.sin(t*14)*.06)}},
  staunen:{i:'exclaim',n:'Staunen',start:e=>{e.jump=.6}},
  schlafen:{i:'zzz',n:'Schlafen',pose:(e,t)=>{e.g.rotateZ(.25)}},
  denken:{i:'think',n:'Nachdenken',start:e=>GAME.say(e,pick(THOUGHTS)+' …',3)},
  verbeugen:{i:'bow',n:'Verbeugen',pose:(e,t)=>{e.g.rotateX(.45)}},
  traurig:{i:'sad',n:'Traurig',pose:(e,t)=>{e.g.rotateX(.18)}},
  drehen:{i:'spiral',n:'Pirouette',pose:(e,t)=>{e.g.rotateY(t*9)}},
  wuetend:{i:'angry',n:'Wütend',pose:(e,t)=>{e.g.rotateZ(Math.sin(t*30)*.04)}},
  idee:{i:'bulb',n:'Idee!',start:e=>{e.jump=.5;GAME.W.fx(e.p,'funke',8)}},
  kompost:{i:'leaf',n:'Kompostieren',start:e=>GAME.W.fx(e.p,'blatt',12)},
  /* Gefühls-Animationen für Gespräche */
  umarmen:{i:'heart',n:'Umarmen',hidden:1,start:e=>GAME.W.fx(e.p,'herz',10),pose:(e,t)=>{e.g.rotateX(.3);e.act=1;e.g.scale.multiplyScalar(1+Math.sin(t*6)*.02)}},
  kichern:{i:'laugh',n:'Kichern',hidden:1,pose:(e,t)=>{e.g.rotateZ(Math.sin(t*22)*.1);e.g.position.addScaledVector(e.p,Math.abs(Math.sin(t*16))*.08)}},
  frech:{i:'star',n:'Frech',hidden:1,pose:(e,t)=>{e.g.rotateZ(.2+Math.sin(t*9)*.08);e.g.rotateY(Math.sin(t*4)*.3)}},
  singen:{i:'note',n:'Singen',hidden:1,start:e=>GAME.W.fx(e.p,'note',8),pose:(e,t)=>{e.g.rotateZ(Math.sin(t*3)*.14);e.g.position.addScaledVector(e.p,Math.abs(Math.sin(t*3))*.05)}},
  verlegen:{i:'smile',n:'Verlegen',hidden:1,pose:(e,t)=>{e.g.rotateX(.16);e.g.rotateY(Math.sin(t*2.4)*.35)}},
  nicken:{i:'chat',n:'Nicken',hidden:1,pose:(e,t)=>{e.g.rotateX(Math.max(0,Math.sin(t*7))*.14)}},
  schmollen:{i:'sad',n:'Schmollen',hidden:1,pose:(e,t)=>{e.g.rotateY(.9);e.g.rotateX(.12)}}
};
function doEmote(e,id,silent){const E=EMOTES[id];if(!E||!e)return;e.emote=id;e.emoteT=3.2;GAME.say(e,'icon:'+E.i,2.6,true);E.start&&E.start(e);
  if(e===GAME.me){SOCIAL.emote&&SOCIAL.emote(id);if(!silent)SND.play(id==='tanzen'||id==='freude'?'j_success':'pep',{vol:.5});
    /* Bewohner:innen in der Nähe reagieren */
    for(const o of GAME.ents.values()){if(o===e||o.kind==='peer'||o.inside!==e.inside)continue;if(e.inside||GAME.angle(o.p,e.p)*GAME.G.R<6){setTimeout(()=>{const r=id==='tanzen'?'tanzen':id==='winken'?'winken':id==='herz'?'herz':id==='traurig'?'herz':pick(['freude','winken','lachen']);doEmote(o,r,true);o.lookAt=e;o.stop=Math.max(o.stop,3)},300+Math.random()*700)}}}}

const ACT=(()=>{
  let busyState=null;const busy=()=>!!busyState;
  let pickups=[],bugs=[],digs=[];let respawnT=0;
  const M=makeMats({skin:'haut',color:0});
  const nightNow=()=>{const h=GAMETIME.hour();return h<6||h>=19};
  function weighted(list){const w=list.map(x=>Math.pow(6-(x.rarity||2),2));let s=w.reduce((a,b)=>a+b,0);let r=Math.random()*s;for(let i=0;i<list.length;i++){r-=w[i];if(r<=0)return list[i]}return list[0]}
  const GG=()=>GAME.G;
  /* ---------- Sammelobjekte in der Welt ---------- */
  function clearWorldStuff(){for(const x of[...pickups,...bugs,...digs]){if(x.g&&x.g.parent)x.g.parent.remove(x.g);if(x.g)disposeTree(x.g)}pickups=[];bugs=[];digs=[]}
  function onPlanet(pid){clearWorldStuff();respawnT=0;spawnShells(8);spawnDigs(6);spawnBugs(12);setTimeout(()=>spawnLitter(18),500)}
  function mkObj(build,scale){const g=new THREE.Group();QF=.6;try{build(g)}catch(e){P(g,G.s(.3),M.c('#FFE27A'),[0,.3,0])}QF=1;addOutlines(g);mergeGroup(g);g.scale.setScalar(scale||1);g.traverse(o=>{if(o.isMesh)o.castShadow=HIGH});GAME.scene.add(g);return g}
  function spawnShells(n){const shells=ITEMS.filter(i=>['muschel','jakobsmuschel','schneckenhaus','sanddollar','koralle_stueck','seeglas'].includes(i.id));if(!shells.length)return;
    for(let i=0;i<n;i++){const p=beachSpot();if(!p)continue;const it=pick(shells);const g=mkObj(gg=>it.b(gg,M,{},srand(i)),.45);GAME.placeObj(g,p,Math.random()*TAU,-.02);pickups.push({kind:'item',id:it.id,p,g,label:it.n+' aufheben'})}}
  function beachSpot(){for(let i=0;i<120;i++){const p=GG().stream&&GAME.randAround?GAME.randAround(Math.random,80):new V3().randomDirection();const h=GG().hAt(p);if(h>GG().sea+.04&&h<GG().sea+.4&&!GAME.nearPlace(p,1))return p}return null}
  function spawnDigs(n){for(let i=0;i<n;i++){const p=GAME.randLand(Math.random,GG().sea+.5);if(!p||GAME.nearPlace(p))continue;const g=mkObj(gg=>{const m=M.c('#8A5E42');both(s=>P(gg,G.bx(.55,.04,.12,.04),m,[0,.02,0],[0,s*PI/4,0]));P(gg,G.s(.08),m,[.28,.03,.1],null,[1,.3,1])},1);GAME.placeObj(g,p,Math.random()*TAU,0);digs.push({p,g})}}
  function bugPool(){const pid=GG().id;const nt=nightNow();return BUGS.filter(b=>(b.planet===pid||b.planet==='alle')&&(!b.time||b.time==='immer'||(b.time==='nacht')===nt))}
  function spawnBugs(n){const pool=bugPool();if(!pool.length)return;const me=GAME.me;for(let i=0;i<n;i++){const b=weighted(pool);let p=null,anchor=null;
      if(b.where==='baum'&&GG().trees.length){const near=GG().trees.filter(t=>GAME.me&&GAME.angle(t.p,GAME.me.p)*GG().R<30);const tr=pick(near.length?near:GG().trees);anchor=tr;/* seitlich an den Stamm, nicht in die Luft */const side=GAME.tangentTo(tr.p,new V3().randomDirection());p=tr.p.clone().addScaledVector(side,.3*(tr.inst?tr.inst.scale:1)/GG().R).normalize()}else if(b.where==='wasser'){p=beachSpot()}else{const base=me?me.p:new V3(0,1,0);p=GAME.W.near(base,1.4+Math.random()*2.4)}
      if(!p)continue;const g=mkObj(gg=>b.b(gg,M,{},srand(i+2)),.32);const bug={def:b,p:p.clone(),home:p.clone(),g,anchor,ph:Math.random()*9,fly:['luft','blume','wasser'].includes(b.where),flee:0,alive:true};
      GAME.placeObj(g,p,Math.random()*TAU,bug.fly?1.1:.05);bugs.push(bug)}}
  function targets(){const out=[];for(const x of pickups)out.push({kind:'pick',p:x.p,r:1.3,label:x.label,ref:x});for(const d of digs)out.push({kind:'dig',p:d.p,r:1.5,label:'Graben',act:()=>dig(d)});
    for(const b of bugs)if(b.alive)out.push({kind:'bug',p:b.p,r:2,label:'Netz schwingen',act:()=>swingNet(b)});
    for(const o of out)if(o.kind==='pick')o.act=()=>pickUp(o.ref);return out}
  /* ---------- Aufheben ---------- */
  function pickUp(x){if(!bagAdd(x.kind,x.id)){UI.toast('Die Tasche ist voll. Verkauf etwas im Laden.');SND.play('error');return}if(x.litter)SAVE.stats.litter=(SAVE.stats.litter||0)+1;SND.play('pickup');GAME.me.act=1;
    GAME.W.fx(x.p,'stern',5);x.g.parent&&x.g.parent.remove(x.g);disposeTree(x.g);pickups.splice(pickups.indexOf(x),1);UI.toast(itemName(x.kind,x.id)+' eingesteckt')}
  /* ---------- Baum schütteln ---------- */
  function shake(tr){if(tr.shaking)return;tr.shaking=true;setTimeout(()=>tr.shaking=false,900);SCATTER.shake(tr.inst);SND.play('cloth',{vol:.8});SAVE.stats.shakes++;GAME.me.act=1;
    setTimeout(()=>{const top=GAME.onSurf(tr.p,2.2);if(tr.hasFruit&&tr.fruit){tr.hasFruit=false;SCATTER.setFruit(tr.inst,false);tr.regrow=Date.now()+4*60*1000;
        const it=findIn(ITEMS,tr.fruit);const n=tr.fruit==='beeren'?2:3;for(let i=0;i<n;i++){const p=GAME.W.near(tr.p,.05+Math.random()*.05);const g=mkObj(gg=>it?it.b(gg,M,{},srand(i)):P(gg,G.s(.3),M.c('#F0556E'),[0,.3,0]),.55);GAME.placeObj(g,p,0,-.02);const x={kind:'item',id:tr.fruit,p,g,label:(it?it.n:tr.fruit)+' aufheben'};pickups.push(x);g.userData.drop=0}
        SND.play('soft',{vol:.8});GAME.W.fx(tr.p,'blatt',10,top)}
      else{const r=Math.random();GAME.W.fx(tr.p,'blatt',8,top);
        if(r<.035){SND.play('coins');const amt=pick([20,30,50]);money(amt);UI.toast(`${amt} Taler sind aus dem Baum gefallen!`)}
        else if(r<.32){const id=pick(['ast','ast','blatt_herbst','kiefernzapfen'].filter(x=>findIn(ITEMS,x)));const it=findIn(ITEMS,id);if(it){const p=GAME.W.near(tr.p,.05);const g=mkObj(gg=>it.b(gg,M,{},srand(1)),.55);GAME.placeObj(g,p,0,-.02);pickups.push({kind:'item',id,p,g,label:it.n+' aufheben'});g.userData.drop=0}}
        else if(r<.45){const pool=bugPool().filter(b=>b.where==='baum');if(pool.length){const b=weighted(pool);const p=GAME.W.near(tr.p,.04);const g=mkObj(gg=>b.b(gg,M,{},srand(1)),.32);GAME.placeObj(g,p,0,.05);bugs.push({def:b,p,home:p.clone(),g,ph:0,fly:false,flee:0,alive:true});UI.toast('Da ist etwas runtergefallen!')}}}},500)}
  /* ---------- Stein hauen (Tierdorf: Schaufel auf Felsen) ---------- */
  function hitRock(rk){const day=Math.floor(Date.now()/864e5);if(rk.day!==day){rk.day=day;rk.hits=0}const me=GAME.me;me.act=1;SND.play('metal',{vol:.8});GAME.W.fx(rk.p,'staub',8,GAME.onSurf(rk.p,1));
    if(rk.hits>=3){UI.toast('Aus diesem Stein kommt heute nichts mehr.');return}rk.hits++;const pid=GG().id;
    const pool={frost:['eiskristall','stein_klein','kiesel'],wueste:['wuestenrose','stein_klein','kiesel'],schrott:['schraube','kabelrest','stein_klein'],pilz:['leuchtspore','stein_klein','kiesel']}[pid]||['stein_klein','kiesel','stein_klein'];
    const id=pick(pool.filter(x=>findIn(ITEMS,x)));if(Math.random()<.08){money(25);SND.play('coins');UI.toast('25 Taler sprangen aus dem Stein!');return}
    const it=findIn(ITEMS,id);if(!it)return;const p=GAME.W.near(rk.p,.06);const g=mkObj(gg=>it.b(gg,M,{},srand(rk.hits)),.5);GAME.placeObj(g,p,0,-.02);pickups.push({kind:'item',id,p,g,label:it.n+' aufheben'});g.userData.drop=0}
  /* ---------- Sammelsachen je Biom (Äste, Steine, Unkraut, Pilze ...) ---------- */
  function spawnLitter(n){const me=GAME.me;if(!me)return;for(let i=0;i<n;i++){const p=GAME.W.near(me.p,1+Math.random()*5);const h=GG().hAt(p);if(h<GG().sea+.1)continue;const B=BIOMES[GG().biomeAt(p,h)];if(!B||!B.litter)continue;
      let s=0;B.litter.forEach(x=>s+=x[1]);let t=Math.random()*s;let id=B.litter[0][0];for(const x of B.litter){t-=x[1];if(t<=0){id=x[0];break}}const it=findIn(ITEMS,id);if(!it)continue;
      const wp=p.clone().multiplyScalar(GG().R+h);if(!SCATTER.occFree(wp,.3))continue;const g=mkObj(gg=>it.b(gg,M,{},srand(i+3)),.5);GAME.placeObj(g,p,Math.random()*TAU,-.02);pickups.push({kind:'item',id,p,g,label:it.n+' aufheben',litter:true})}}
  /* ---------- Graben ---------- */
  function dig(d){busyState='dig';const me=GAME.me;me.act=1;SND.play('chop');GAME.W.fx(d.p,'staub',10);
    setTimeout(()=>{SND.play('chop');GAME.W.fx(d.p,'staub',10)},450);
    setTimeout(async()=>{d.g.parent&&d.g.parent.remove(d.g);digs.splice(digs.indexOf(d),1);const pid=GG().id;const pool=RELICS.filter(r=>r.planet===pid||r.planet==='alle');const rel=pool.length?weighted(pool):null;busyState=null;
      if(!rel){money(35);UI.toast('Nur ein paar Taler vergraben: 35');return}
      if(!bagAdd('relic',rel.id)){UI.toast('Tasche voll!');return}const first=!SAVE.caught.relics[rel.id];SAVE.caught.relics[rel.id]=(SAVE.caught.relics[rel.id]||0)+1;SAVE.stats.relics++;persist();
      await showCatch('relic',rel,first)},1000)}
  /* ---------- Insektennetz ---------- */
  function swingNet(b){if(!b.alive)return;const me=GAME.me;busyState='net';me.act=1;SND.play('whoosh',{vol:.8});
    const d=GAME.angle(me.p,b.p)*GG().R;const scared=b.flee>0;const ok=d<2.1&&!scared&&Math.random()<(b.def.rarity>=4?.7:.92);
    setTimeout(async()=>{busyState=null;if(!ok){b.flee=3;SND.play('j_fail',{vol:.6});UI.toast(scared?'Zu hektisch, es ist weggeflogen.':'Knapp daneben!');return}
      b.alive=false;b.g.parent&&b.g.parent.remove(b.g);bugs.splice(bugs.indexOf(b),1);if(!bagAdd('bug',b.def.id)){UI.toast('Tasche voll!');return}
      const first=!SAVE.caught.bugs[b.def.id];SAVE.caught.bugs[b.def.id]=(SAVE.caught.bugs[b.def.id]||0)+1;SAVE.stats.bugs++;persist();await showCatch('bug',b.def,first)},380)}
  /* ---------- Angeln ---------- */
  let fishing=null;
  function waterAhead(me){if(!me||busyState)return null;for(const dist of[2.2,3.2,4.2]){const q=me.p.clone().applyAxisAngle(new V3().crossVectors(me.p,me.dir).normalize(),dist/GG().R).normalize();if(GG().hAt(q)<GG().sea-.2&&GG().hAt(me.p)>GG().sea-.15)return q}return null}
  function fishPool(p){const pid=GG().id;const nt=nightNow();const pond=GG().places.some(pl=>pl.pond&&GAME.angle(p,pl.dir)<pl.r*1.5);
    let pool=FISH.filter(f=>(f.planet===pid||f.planet==='alle')&&(!f.time||f.time==='immer'||(f.time==='nacht')===nt));const wh=pool.filter(f=>pond?['teich','fluss','kuehlwasser'].includes(f.where):f.where==='meer');return wh.length?wh:pool}
  function fish(p){const me=GAME.me;if(busyState)return;busyState='fish';SND.play('whoosh',{vol:.7});me.dir.copy(GAME.tangentTo(me.p,p.clone().sub(me.p)));
    const sc=GAME.scene;const rod=new THREE.Group();QF=.6;bt(rod,[0,0,0],[0,0,1.6],.03,M.c('#C98C5A'));P(rod,G.s(.05),M.c('#F0556E'),[0,0,1.6]);QF=1;sc.add(rod);
    const bob=new THREE.Group();P(bob,G.s(.12),M.c('#F0556E',{gloss:1}),[0,0,0]);P(bob,G.hs(.121),M.c('#FFFDF7',{gloss:1}),[0,0,0]);sc.add(bob);addOutlines(bob);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),new THREE.LineBasicMaterial({color:'#FFFDF7'}));sc.add(line);
    const pool=fishPool(p);const f=pool.length?weighted(pool):null;
    const shadowSize={S:.45,M:.7,L:1.0,XL:1.5}[f?f.size:'M']||.7;
    const sh=new THREE.Mesh(new THREE.CircleGeometry(.5,20),new THREE.MeshBasicMaterial({color:'#1d4a66',transparent:true,opacity:.45,depthWrite:false}));sh.scale.set(shadowSize*.55,shadowSize,1);sc.add(sh);
    const start=GAME.W.near(p,.08);fishing={p:p.clone(),rod,bob,line,sh,f,t:0,phase:'cast',shP:start.clone(),nib:0,nibT:1.5+Math.random()*2,biteT:0,dipT:0,castT:0};SAVE.stats.fish++;}
  function stepFishing(dt,t){const F=fishing;if(!F)return;const me=GAME.me;F.t+=dt;const sea=GG().R+GG().sea;
    const tip=me.g.position.clone().addScaledVector(me.p,1.35).addScaledVector(me.dir,.4);F.rod.position.copy(me.g.position).addScaledVector(me.p,.9).addScaledVector(me.dir,.1);F.rod.up.copy(me.p);F.rod.lookAt(tip.clone().addScaledVector(me.dir,2).addScaledVector(me.p,1.2));
    const tipW=F.rod.localToWorld(new V3(0,0,1.6));
    let bobPos=F.p.clone().multiplyScalar(sea+.04);if(F.phase==='cast'){F.castT+=dt*2.2;const u=Math.min(1,F.castT);bobPos=tipW.clone().lerp(bobPos,u).addScaledVector(me.p,Math.sin(u*PI)*1.5);if(u>=1){F.phase='wait';SND.play('plop',{vol:.8});GAME.W.fx(F.p,'wasser',6,bobPos.clone())}}
    F.dipT=Math.max(0,F.dipT-dt);if(F.phase==='bite')bobPos.addScaledVector(F.p,-.25);else bobPos.addScaledVector(F.p,-F.dipT*.35+Math.sin(t*2)*.02);
    F.bob.position.copy(bobPos);F.bob.quaternion.setFromUnitVectors(UPV,F.p);F.line.geometry.setFromPoints([tipW,bobPos.clone().addScaledVector(F.p,.1)]);
    /* Fischschatten nähert sich */
    if(F.f&&F.phase!=='cast'){const to=F.p.clone().sub(F.shP);if(F.phase==='wait'&&to.length()>.0035)F.shP.addScaledVector(to.normalize(),dt*.0016*(F.t>1.2?1:0)+.00001).normalize();
      F.sh.position.copy(F.shP).multiplyScalar(sea-.12);F.sh.quaternion.setFromUnitVectors(new V3(0,0,1),F.shP);F.sh.lookAt(F.sh.position.clone().add(F.shP));F.sh.up.copy(F.shP);
      if(F.phase==='wait'&&to.length()<.006){F.nibT-=dt;if(F.nibT<=0){if(F.nib<1+Math.floor(Math.random()*3)){F.nib++;F.dipT=.35;F.nibT=.9+Math.random()*1.4;SND.play('plop',{vol:.35,rate:1.4})}
        else{F.phase='bite';F.biteT=.95;SND.play('bite',{vol:.9});GAME.say(me,'icon:exclaim',1,true);GAME.W.fx(F.p,'wasser',10,bobPos.clone())}}}}
    if(F.phase==='bite'){F.biteT-=dt;if(F.biteT<=0){endFish(false,'Er ist entkommen …')}}
    if(!F.f&&F.t>6)endFish(false,'Hier beisst heute nichts.')}
  function reelIn(){const F=fishing;if(!F)return;if(F.phase==='bite'){endFish(true)}else if(F.phase==='wait'&&F.nib>0){endFish(false,'Zu früh gezogen, der Fisch ist weg.')}else endFish(false,null)}
  async function endFish(ok,msg){const F=fishing;fishing=null;const sc=GAME.scene;[F.rod,F.bob,F.line,F.sh].forEach(o=>{sc.remove(o);disposeTree(o)});SND.play('reel',{vol:.8});
    if(!ok){busyState=null;if(msg){UI.toast(msg);SND.play('j_fail',{vol:.5})}return}
    const f=F.f;if(!bagAdd('fish',f.id)){busyState=null;UI.toast('Tasche voll! Der Fisch schwimmt zurück.');return}const first=!SAVE.caught.fish[f.id];SAVE.caught.fish[f.id]=(SAVE.caught.fish[f.id]||0)+1;persist();
    GAME.W.fx(F.p,'wasser',16,F.p.clone().multiplyScalar(GG().R+GG().sea+.3));busyState='show';await showCatch('fish',f,first);busyState=null}
  /* ---------- Fang-Anzeige ---------- */
  async function showCatch(kind,def,first){const big=def.rarity>=4||def.size==='XL';SND.jingle(big?'j_catch_big':'j_catch');const me=GAME.me;me.jump=.9;
    const wrap=el('div','catch');const img=itemThumb(kind,def.id);wrap.append(img);document.body.append(wrap);UI.pumpThumbs();
    const nick=SAVE.nick||S.name||'Ich';const text=def.text||`Ich hab ${def.n} gefunden!`;
    await UI.talk(nick,[text+(first?'  (Neu im Lexikon!)':'')],{voice:GAME.voiceFor(avatarLike()),color:'var(--leaf)'});wrap.remove();
    if(first&&GAME.W)GAME.W.fx(me.p,'stern',10);SOCIAL.brag&&SOCIAL.brag(kind,def)}
  const avatarLike=()=>({id:SAVE.pid,name:SAVE.nick,body:S.body,parts:S.parts,info:{}});
  /* ---------- Tanzparty ---------- */
  let party=0;function partyStart(){if(party>0){doEmote(GAME.me,'tanzen');return}party=24;SND.music('shop');UI.toast('Tanzparty! Alle in der Nähe tanzen mit.');SAVE.stats.dances++;doEmote(GAME.me,'tanzen',true);
    for(const o of GAME.ents.values()){if(o.kind!=='peer'&&GAME.angle(o.p,GAME.me.p)*GG().R<16){o.goal={p:GAME.W.near(GAME.me.p,.25),then:()=>{o.dance=14}}}}}
  function frame(dt,t){stepFishing(dt,t);
    if(party>0){party-=dt;if(Math.random()<dt*3)GAME.W.fx(GAME.me.p,pick(['konfetti','note']),3);if(GAME.me.dance<=0&&GAME.me.speed<.1)GAME.me.dance=2;if(party<=0)SND.music(GG().def.music)}
    /* Insekten bewegen */const me=GAME.me;
    for(const b of bugs){if(!b.alive)continue;b.ph+=dt;const run=me&&me.speed>5&&GAME.angle(me.p,b.p)*GG().R<4;if(run&&b.flee<=0&&(b.def.rarity||2)>=2){b.flee=4;GAME.W.fx(b.p,'staub',3)}
      if(b.flee>0){b.flee-=dt;const away=GAME.tangentTo(b.p,b.p.clone().sub(me.p));if(isFinite(away.x))b.p.applyAxisAngle(new V3().crossVectors(b.p,away).normalize(),dt*3/GG().R).normalize();if(b.flee<=0&&GAME.angle(b.p,me.p)*GG().R>18){b.p.copy(GAME.W.near(me.p,2))}}
      else if(b.fly){const wob=new V3(Math.sin(b.ph*1.3),Math.sin(b.ph*1.7)*.5,Math.cos(b.ph*1.1));b.p.copy(b.home.clone().add(GAME.tangentTo(b.home,wob).multiplyScalar(.04))).normalize()}
      if(b.flee>0&&b.anchor)b.anchor=null;
      if(b.anchor){/* klettert am Stamm: Bauch zum Stamm, Kopf nach oben */const out=GAME.tangentTo(b.p,b.p.clone().sub(b.anchor.p));b.g.position.copy(GAME.onSurf(b.p,.75+Math.sin(b.ph*.8)*.12));const zx=b.p,yx=out,xx=new V3().crossVectors(yx,zx);b.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,yx,zx))}
      else GAME.placeObj(b.g,b.p,b.ph*(b.fly?1.5:.3),b.fly?1.1+Math.sin(b.ph*3)*.25:.06);b.g.visible=!me||GAME.angle(b.p,me.p)*GG().R<30}
    /* gefallenes Obst hüpft kurz */for(const x of pickups){if(x.g.userData.drop!=null&&x.g.userData.drop<1){x.g.userData.drop+=dt*2.5;const u=x.g.userData.drop;x.g.position.copy(GAME.onSurf(x.p,Math.max(0,(1-u)*2.2*Math.abs(Math.cos(u*PI*1.5)))-.02))}}
    /* Nachwachsen */respawnT-=dt;if(respawnT<=0){respawnT=45;if(bugs.length<8)spawnBugs(3);if(pickups.filter(p=>['muschel','jakobsmuschel','schneckenhaus','sanddollar','koralle_stueck','seeglas'].includes(p.id)).length<4)spawnShells(3);if(digs.length<3)spawnDigs(2);if(pickups.filter(p=>p.litter).length<14)spawnLitter(6);
      for(const tr of GG().trees){if(!tr.hasFruit&&tr.regrow&&Date.now()>tr.regrow&&tr.inst.pr.hasFruit){tr.hasFruit=true;SCATTER.setFruit(tr.inst,true)}}}}
  /* Aktion während Angeln = Einholen */
  const origBusy=busy;
  /* ---------- Tasche ---------- */
  function bag(){const w=UI.win(`Tasche · ${bagCount()}/40`,{size:'narrow'});const gr=el('div','grid');
    if(!SAVE.bag.length)w.body.append(el('p','empty','Noch leer. Angle, fang Insekten, grab X-Stellen aus oder schüttle Bäume!'));
    SAVE.bag.forEach(it=>{const c=el('button','card');c.type='button';c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)),el('span','sub',`×${it.n} · ${fmt(itemPrice(it.kind,it.id))} T`));
      c.onclick=()=>itemMenu(it,w);gr.append(c)});w.body.append(gr);
    w.foot.append(el('span','sub',`${fmt(SAVE.money)} Taler`),btn('Schliessen',null,()=>w.close()))}
  function itemMenu(it,w){const d=itemDef(it.kind,it.id);const box=UI.win(itemName(it.kind,it.id),{size:'narrow'});const top=el('div','row');const img=itemThumb(it.kind,it.id);img.style.cssText='width:120px;height:120px;flex:none;border-radius:16px;background:var(--seaL)';
    const info=el('div');if(d&&d.fact)info.append(el('p',null,d.fact));info.append(el('p','sub',`Verkaufswert ${fmt(itemPrice(it.kind,it.id))} Taler · du hast ${it.n}`));top.append(img,info);box.body.append(top);
    if(it.kind==='plant')box.foot.append(btn('Hier einpflanzen','primary',()=>{box.close();w.close();BUILDINGS.plantHere(it.id)}));
    if(it.kind==='furn')box.foot.append(btn('Im Haus aufstellen','primary',()=>{box.close();w.close();UI.toast('Geh nach Hause und drück F für den Einrichten-Modus.')}));
    box.foot.append(btn('Fallen lassen','danger',()=>{bagTake(it.kind,it.id,1);box.close();w.close();bag()}),btn('Zurück',null,()=>box.close()))}
  /* ---------- Emote-Menü ---------- */
  function emoteMenu(){const w=UI.win('Emotes',{size:'narrow',foot:false});const g=el('div','emotes');for(const[id,E]of Object.entries(EMOTES)){const b=el('button');b.type='button';b.append(iconEl(E.i),el('span',null,E.n));b.onclick=()=>{w.close();doEmote(GAME.me,id)};g.append(b)}w.body.append(g)}
  /* ---------- Lexikon ---------- */
  function lexikon(tab){tab=tab||'fish';const w=UI.win('Sammel-Lexikon',{size:'wide'});const tabs=el('div','ptabs');const body=el('div');w.body.append(tabs,body);
    const T=[['fish','Fische',FISH,'fish'],['bug','Insekten',BUGS,'bugs'],['relic','Fundstücke',RELICS,'relics']];
    function show(k){tabs.replaceChildren(...T.map(([id,n])=>{const b=el('button',null,n);b.type='button';b.setAttribute('aria-selected',id===k);b.onclick=()=>show(id);return b}));
      const[,n,arr,key]=T.find(x=>x[0]===k);const got=arr.filter(x=>SAVE.caught[key][x.id]).length;body.replaceChildren(el('p','sub',`${got} von ${arr.length} entdeckt · Planeten: Kompost, Schrott-Mond, Korallen-Welt`));
      const gr=el('div','grid');arr.forEach(x=>{const has=SAVE.caught[key][x.id];const c=el('button','card'+(has?'':' off'));c.type='button';c.append(has?itemThumb(k,x.id):el('div','ph'),el('span',null,has?x.n:'???'),el('span','sub',(PLANETS[x.planet]||{n:'überall'}).n+(x.where?' · '+x.where:'')));
        if(SAVE.donated[key].includes(x.id))c.append(el('span','badge g','Museum'));
        c.onclick=()=>{if(!has)return;const b=UI.win(x.n,{size:'narrow'});const img=itemThumb(k,x.id);img.style.cssText='width:150px;height:150px;border-radius:16px;background:var(--seaL);align-self:center';b.body.append(img,el('p',null,x.fact||''),el('p','sub',`Gefangen: ${has}× · Wert ${fmt(x.price)} Taler`+(x.size?` · Grösse ${x.size}`:'')+(x.time&&x.time!=='immer'?` · nur ${x.time==='nacht'?'nachts':'tagsüber'}`:'')))};gr.append(c)});body.append(gr)}
    show(tab)}
  return{targets,waterAhead,fish,shake,hitRock,spawnLitter,busy:()=>!!busyState,frame,onPlanet,bag,emoteMenu,lexikon,party:partyStart,reelIn,get fishing(){return fishing},showCatch};
})();
/* Aktionstaste beim Angeln holt ein */
addEventListener('keydown',e=>{if(ACT.fishing&&(e.key==='e'||e.key==='E'||e.key===' '||e.key==='Enter')){e.preventDefault();e.stopImmediatePropagation();ACT.reelIn()}},true);
$('hbA').addEventListener('click',e=>{if(ACT.fishing){e.stopImmediatePropagation();ACT.reelIn()}},true);
$('worldCanvas').addEventListener('pointerup',e=>{if(ACT.fishing){ACT.reelIn()}},true);
