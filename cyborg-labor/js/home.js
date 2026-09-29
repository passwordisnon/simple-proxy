/* =====================================================================
   CYBORG-LABOR · home.js
   Läden je Planet, Innenräume (Haus & Museum), Einrichten, Hausbau.
   ===================================================================== */
const SHOPKEEPERS={
  kompost:{n:'Tante Kompostella',d:{name:'Tante Kompostella',body:{seg:2,size:1.1,skin:'fell',color:2,shape:'birne',pattern:'bauch',color2:4},parts:{kopf:'eule',augen:'zwei',arme:'mensch',beine:'huhn',extras:['blume']}},greet:['Willkommen im Kompost-Kiosk! Alles bio, alles zirkulär.','Was darf\'s sein? Wir kaufen auch alles, was du fängst!']},
  schrott:{n:'Ferro Flicker',d:{name:'Ferro Flicker',body:{seg:2,size:1.05,skin:'rost',color:0,shape:'kiste'},parts:{kopf:'roehre',augen:'leucht',arme:'greifarm',beine:'kette',extras:['zahnraeder']}},greet:['Bzzt! Willkommen im Ersatzteil-Basar.','Hier wird nichts weggeworfen, nur umgebaut.']},
  korallen:{n:'Mira Muschel',d:{name:'Mira Muschel',body:{seg:2,size:1,skin:'koralle',color:15,shape:'ei',pattern:'punkte',color2:16},parts:{kopf:'axolotl',augen:'kuller',arme:'flossen',beine:'fisch',extras:['seerose']}},greet:['Hallöchen! Frische Möbel direkt vom Riff.','Muscheln? Fische? Ich kauf dir alles ab.']}
};
const SHOP=(()=>{
  function stock(pid){const day=Math.floor(Date.now()/864e5);const r=srand(day*7+pid.length);const furn=FURN.filter(f=>f.planet===pid||f.planet==='alle');const pickN=(arr,n)=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,n)};
    return{furn:pickN(furn,14),walls:pickN(WALLPAPERS.filter(w=>w.planet===pid||w.planet==='alle'||!w.planet),5),floors:pickN(FLOORS.filter(w=>w.planet===pid||w.planet==='alle'||!w.planet),5)}}
  async function open(pid){TUT.ev('shop');const K=SHOPKEEPERS[pid];SND.music('shop');await UI.talk(K.n,[pick(K.greet)],{voice:{pitch:210,kind:pid==='schrott'?'robot':''},color:'var(--sea)'});
    const w=UI.win(K.n+' · '+({kompost:'Kompost-Kiosk',schrott:'Ersatzteil-Basar',korallen:'Muschel-Laden'}[pid]),{size:'wide',onClose:()=>SND.music(GAME.G.def.music)});
    const tabs=el('div','ptabs');const body=el('div');w.body.append(tabs,body);const mon=el('span','pill');w.foot.append(mon,btn('Tschüss',null,()=>w.close()));
    const upd=()=>{mon.textContent=fmt(SAVE.money)+' Taler';UI.hud()};upd();const S0=stock(pid);
    function show(k){tabs.replaceChildren(...[['buy','Kaufen'],['sell','Verkaufen']].map(([id,n])=>{const b=el('button',null,n);b.type='button';b.setAttribute('aria-selected',id===k);b.onclick=()=>show(id);return b}));body.replaceChildren();
      if(k==='buy'){body.append(el('p','sub','Das Sortiment wechselt jeden Tag. Möbel landen in deiner Tasche, zu Hause drückst du F zum Einrichten.'));const gr=el('div','grid');
        const add=(kind,d)=>{const c=el('button','card');c.type='button';c.append(itemThumb(kind,d.id),el('span',null,d.n),el('span','sub',fmt(d.price)+' Taler'+(kind!=='furn'?(kind==='wall'?' · Tapete':' · Boden'):'')));
          c.onclick=()=>{if(SAVE.money<d.price){SND.play('error');UI.toast('Dafür reicht das Geld noch nicht.');return}if(!bagAdd(kind,d.id)){UI.toast('Die Tasche ist voll.');return}money(-d.price);SND.play('j_buy');upd();UI.toast(d.n+' gekauft!')};gr.append(c)};
        S0.furn.forEach(d=>add('furn',d));S0.walls.forEach(d=>add('wall',d));S0.floors.forEach(d=>add('floor',d));body.append(gr)}
      else{const sellable=SAVE.bag.filter(x=>x.kind!=='design');if(!sellable.length){body.append(el('p','empty','Du hast nichts zum Verkaufen.'));return}
        const all=btn('Alle Fische, Insekten & Fundsachen verkaufen','primary',()=>{let sum=0;for(const it of[...SAVE.bag])if(['fish','bug','item','relic'].includes(it.kind)){for(let k=0;k<it.n;k++){sum+=itemPrice(it.kind,it.id);noteSold(it.id,1)}bagTake(it.kind,it.id,it.n)}if(sum){money(sum);SND.play('coins');UI.toast(`Verkauft für ${fmt(sum)} Taler`)}upd();show('sell')});body.append(all);
        const gr=el('div','grid');sellable.forEach(it=>{const c=el('button','card');c.type='button';c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)),el('span','sub',`×${it.n} · ${fmt(itemPrice(it.kind,it.id))} T`));
          c.onclick=()=>{bagTake(it.kind,it.id,1);money(itemPrice(it.kind,it.id));noteSold(it.id,1);SND.play('coins');upd();show('sell')};gr.append(c)});body.append(gr)}}
    show('buy')}
  return{open};
})();

/* ================= Innenräume ================= */
const INTERIOR=(()=>{
  const cam=new THREE.PerspectiveCamera(38,1,.1,200);let scene=null,comp=null,kind=null,room=null,deco=false;const M=makeMats({skin:'haut',color:0});
  let camYaw=0,camZoom=1;const colliders=[];const actions=[];let decoSel=null,ghost=null,ghostRot=0,decoUI=null,hoverCell=null;
  const kinds={};
  function roomSize(){const s=SAVE.house.style.size||1;return{W:6+2*s,D:5+2*s}}
  function texFor(list,id,rep){const d=list.find(x=>x.id===id);const des=id&&id.startsWith('design:')?SAVE.designs.find(x=>'design:'+x.id===id):null;
    const t=ctex('room-'+id,256,256,(x,w,h)=>{if(des){x.imageSmoothingEnabled=false;const s=w/32;for(let i=0;i<1024;i++){x.fillStyle=des.pal[parseInt(des.px[i],16)];x.fillRect((i%32)*s,Math.floor(i/32)*s,s,s)}}else if(d){try{d.draw(x,w,h)}catch(e){x.fillStyle='#FFE3B8';x.fillRect(0,0,w,h)}}else{x.fillStyle='#FFE3B8';x.fillRect(0,0,w,h)}});
    const c=t.clone();c.needsUpdate=true;c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(rep[0],rep[1]);if(des)c.magFilter=THREE.NearestFilter;return c}
  function baseScene(bg){const sc=new THREE.Scene();sc.background=new THREE.Color(bg||'#3B3450');const L=cozyLights(sc,{hemi:.6,sunI:.75,sky:'#fff3e0',ground:'#e8d0b0'});L.sun.position.set(3,9,6);L.sun.castShadow=true;L.sun.shadow.mapSize.set(1024,1024);Object.assign(L.sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:40});L.sun.shadow.bias=-.0008;L.sun.shadow.normalBias=.03;
    /* Innenräume: fast dunkel – Licht kommt nur von Lampen (INTERIOR.lamp / Lampen-Möbel) */L.hemi.intensity=.2;L.hemi.color.set('#ffe8cc');L.hemi.groundColor.set('#3a2a3a');L.sun.intensity=.12;L.fill.intensity=.04;L.sun.castShadow=false;
    const lamp=new THREE.PointLight('#ffd9a0',0,18);lamp.position.set(0,2.6,0);sc.add(lamp);sc.userData.lamp=lamp;return sc}
  /* Lampe mit echtem Licht: typ pendel | wand | kerze | kron | steh | neon */
  function lamp(sc,type,x,y,z,o){o=o||{};const g=grp(sc,[x,y,z],[0,o.ry||0,0]);const col=o.col||'#ffcf8a';const H=o.H||3.4;const bm=M.glow(col,1.8);
    if(type==='pendel'){P(g,G.cy(.01,.01,Math.max(.1,H-y)),M.c('#2E2A3E'),[0,(H-y)/2,0]);P(g,G.hs(.32),M.c(o.shade||'#3B5E4A',{gloss:.6}),[0,.05,0],[PI,0,0],[1,.8,1]);P(g,G.s(.1),bm,[0,-.08,0])}
    else if(type==='wand'){P(g,G.bx(.12,.3,.06,.02),M.c('#8A6A3A'),[0,0,0]);bt(g,[0,0,.03],[0,.1,.25],.02,M.c('#8A6A3A'));P(g,G.co(.16,.2,12,),M.c(o.shade||'#F2E2C8'),[0,.2,.25],[PI,0,0]);P(g,G.s(.06),bm,[0,.12,.25])}
    else if(type==='kerze'){P(g,G.cy(.05,.05,.14),M.c('#FFFBF0'),[0,.07,0]);P(g,G.co(.025,.07,6),M.glow('#FFB45A',2),[0,.18,0])}
    else if(type==='kron'){P(g,G.cy(.01,.01,Math.max(.1,H-y)),M.gold(),[0,(H-y)/2,0]);P(g,G.to(.6,.04),M.gold(),[0,0,0],[PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(g,G.cy(.03,.03,.14),M.c('#FFFBF0'),[Math.sin(a)*.6,.09,Math.cos(a)*.6]);P(g,G.s(.05),bm,[Math.sin(a)*.6,.2,Math.cos(a)*.6])}P(g,G.s(.12),M.glass('#fff4d0'),[0,-.2,0])}
    else if(type==='steh'){P(g,G.cy(.18,.2,.05),M.c('#3B3450'),[0,.03,0]);P(g,G.cy(.02,.02,1.5),M.c('#3B3450'),[0,.78,0]);P(g,G.cy(.18,.3,.35,true),M.c(o.shade||'#FFE3B8'),[0,1.6,0]);P(g,G.s(.08),bm,[0,1.55,0])}
    const L=new THREE.PointLight(col,o.i??1.4,o.d??8,2);L.position.set(0,type==='steh'?1.5:type==='kerze'?.25:type==='wand'?.15:-.15,type==='wand'?.3:0);g.add(L);g.userData.light=L;return g}
  function makeRoom(sc,W,D,H,wallId,floorId,o){o=o||{};const g=new THREE.Group();sc.add(g);
    const fm=cozy({map:texFor(FLOORS,floorId,[W/2,D/2]),color:'#ffffff',rim:.05});const floor=new THREE.Mesh(new THREE.BoxGeometry(W,.2,D),fm);floor.position.y=-.1;floor.receiveShadow=true;floor.name='floor';g.add(floor);
    const wm=cozy({map:texFor(WALLPAPERS,wallId,[W/2,H/2]),color:'#ffffff',rim:.05});const wm2=cozy({map:texFor(WALLPAPERS,wallId,[D/2,H/2]),color:'#ffffff',rim:.05});
    const back=new THREE.Mesh(new THREE.BoxGeometry(W+.4,H,.2),wm);back.position.set(0,H/2,-D/2-.1);back.receiveShadow=true;g.add(back);
    both(s=>{const w=new THREE.Mesh(new THREE.BoxGeometry(.2,H,D),wm2);w.position.set(s*(W/2+.1),H/2,0);w.receiveShadow=true;g.add(w)});
    /* Sockelleiste & Rahmen */const trim=M.c(o.trim||'#C98C5A');P(g,G.bx(W+.4,.18,.08,.03),trim,[0,.09,-D/2+.02]);both(s=>P(g,G.bx(.08,.18,D,.03),trim,[s*(W/2-.02),.09,0]));P(g,G.bx(W+.6,.25,.4,.08),trim,[0,H+.1,-D/2-.1]);
    /* Fenster mit Himmel je Tageszeit, Vorhängen, Fensterbank und Lichtfleck */if(o.windows!==false)roomWindows(g,W,D,H,o);
    /* Tür (vorne unten angedeutet als Fussmatte) */P(g,G.bx(1.4,.04,.8,.02),M.c(o.mat||'#F0556E'),[0,.02,D/2-.45]);colliders.length=0;return g}
  function skyNow(){const h=GAMETIME.hour();
    if(h<5.5||h>=21)return{k:'nacht',a:'#1B1F4A',b:'#3A3F7A',spill:0};if(h<7.5)return{k:'morgen',a:'#FFB8A0',b:'#FFE3C2',spill:.18};if(h>=18.5)return{k:'abend',a:'#6E5AB8',b:'#FF9E7A',spill:.14};return{k:'tag',a:'#8FD0FF',b:'#E8F6FF',spill:.26}}
  function roomWindows(g,W,D,H,o){const S=skyNow();const arch=o.winArch??(W>10);const ww=o.winW||1.15,wh=o.winH||(arch?1.5:1.25),y0=o.winY||(H*.42);
    const sky=ctex('winsky-'+S.k+(arch?'a':'r'),128,160,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,S.a);gr.addColorStop(1,S.b);x.fillStyle=gr;x.fillRect(0,0,w,h);
      if(S.k==='nacht'){x.fillStyle='#FFF6D8';for(let i=0;i<22;i++){const r=srand(i*7+1);x.globalAlpha=.5+r()*.5;x.fillRect(r()*w,r()*h*.8,2,2)}x.globalAlpha=1;x.beginPath();x.arc(w*.7,h*.28,12,0,TAU);x.fill()}
      else{x.fillStyle='rgba(255,255,255,.85)';for(const[cx,cy,r]of[[30,50,16],[46,44,20],[62,52,14],[96,96,12],[108,90,15]]){x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill()}
        x.fillStyle='rgba(120,190,110,.9)';x.beginPath();x.moveTo(0,h);for(let i=0;i<=8;i++)x.lineTo(i*w/8,h*.82-Math.sin(i*1.3)*10);x.lineTo(w,h);x.fill()}});
    const glass=new THREE.MeshBasicMaterial({map:sky,toneMapped:false});const frameM=M.c(o.frame||o.trim||'#FFFBF0');const curt=M.c(o.curtain||'#F28C8C',{rim:.3});
    const spillM=new THREE.MeshBasicMaterial({color:S.k==='abend'?'#FFB88A':'#FFF3C8',transparent:true,opacity:S.spill,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
    const shape=new THREE.Shape();if(arch){shape.moveTo(-ww/2,0);shape.lineTo(ww/2,0);shape.lineTo(ww/2,wh-ww/2);shape.absarc(0,wh-ww/2,ww/2,0,PI,false);shape.lineTo(-ww/2,0)}else{shape.moveTo(-ww/2,0);shape.lineTo(ww/2,0);shape.lineTo(ww/2,wh);shape.lineTo(-ww/2,wh);shape.lineTo(-ww/2,0)}
    const glassGeo=new THREE.ShapeGeometry(shape,Q(16));{const uv=glassGeo.attributes.uv,pos=glassGeo.attributes.position;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+ww/2)/ww,pos.getY(i)/wh)}
    const fr=new THREE.Shape();const fw=ww+.22,fh=wh+.11;if(arch){fr.moveTo(-fw/2,-.11);fr.lineTo(fw/2,-.11);fr.lineTo(fw/2,fh-fw/2);fr.absarc(0,fh-fw/2,fw/2,0,PI,false);fr.lineTo(-fw/2,-.11)}else{fr.moveTo(-fw/2,-.11);fr.lineTo(fw/2,-.11);fr.lineTo(fw/2,fh);fr.lineTo(-fw/2,fh);fr.lineTo(-fw/2,-.11)}fr.holes.push(shape);
    const frGeo=new THREE.ExtrudeGeometry(fr,{depth:.08,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:1,curveSegments:Q(16)});
    const one=(px,pz,ry)=>{const q=grp(g,[px,y0,pz],[0,ry,0]);const gl=new THREE.Mesh(glassGeo,glass);gl.position.z=.005;q.add(gl);P(q,frGeo,frameM,[0,0,-.02]);
      P(q,G.bx(.05,wh*.92,.04,0),frameM,[0,wh*.46,.04]);P(q,G.bx(ww,.05,.04,0),frameM,[0,wh*.5,.04]);P(q,G.bx(ww+.4,.08,.24,.03),frameM,[0,-.13,.1]);
      /* Vorhänge + Stange */P(q,G.cy(.025,.025,ww+.7),M.c('#8A5A44'),[0,wh+.18,.12],[0,0,PI/2]);for(const sx of[-1,1]){const c=P(q,G.bx(.26,wh+.3,.05,.02),curt,[sx*(ww/2+.2),wh/2+.02,.14]);c.scale.x=1+.15*Math.sin(sx)}
      /* Blumentopf auf der Fensterbank */if(Math.round(px*3+pz*5)%2===0){P(q,G.cy(.09,.07,.14),M.c('#E0876A'),[ww*.28,-.02,.12]);P(q,G.s(.1),M.c('#7CC46A'),[ww*.28,.1,.12])}
      /* Lichtfleck am Boden */if(S.spill>0){const sp=new THREE.Mesh(new THREE.PlaneGeometry(ww*1.1,wh*.9),spillM);sp.rotation.x=-PI/2;sp.position.set(0,-y0+.012,wh*.55+.3);sp.userData.noOutline=true;q.add(sp)}};
    const nb=Math.max(1,Math.floor(W/4.2));for(let i=0;i<nb;i++){const x=-W/2+W*(i+.5)/nb;one(x,-D/2+.01,0)}
    const ns=Math.max(1,Math.floor(D/4.5));for(const sx of[-1,1])for(let i=0;i<ns;i++){const z=-D/2+D*(i+.5)/ns-.3;one(sx*(W/2-.01),z,-sx*PI/2)}}
  function enter(k){if(!kinds[k])return;GAME.fadeOut(()=>{kind=k;deco=false;GAME.mode='interior';const me=GAME.me;SAVE.lastPos=null;
      for(const e of GAME.ents.values()){e.g.visible=false;e.shadow.visible=false}
      scene=baseScene(kinds[k].bg);comp=makeComposer(GAME.R,scene,cam);actions.length=0;colliders.length=0;room=kinds[k].build(scene);
      adopt(me);me.ix=0;me.iz=room.D/2-1.1;me.iyaw=PI;camYaw=0;camZoom=1;SND.play('door_open');SND.music(kinds[k].music||'home');resize();$('prompt').hidden=true});}
  function adopt(me){if(me.g.parent)me.g.parent.remove(me.g);if(me.shadow.parent)me.shadow.parent.remove(me.shadow);scene.add(me.g);scene.add(me.shadow);me.g.visible=true;me.shadow.visible=true;me.inside=true}
  function exit(){GAME.fadeOut(()=>{const me=GAME.me;me.inside=false;scene.remove(me.g);scene.remove(me.shadow);if(kinds[kind].leave)kinds[kind].leave();
      disposeScene();GAME.scene.add(me.g);GAME.scene.add(me.shadow);for(const e of GAME.ents.values()){e.g.visible=true;e.shadow.visible=true}
      const pl=GAME.G.places.find(p=>p.build===kind);if(pl&&pl.doorP){me.p.copy(pl.doorP);me.dir.copy(GAME.tangentTo(me.p,me.p.clone().sub(pl.dir)))}GAME.mode='outdoor';kind=null;if(decoUI){decoUI.remove();decoUI=null}deco=false;SND.play('door_close');SND.music(GAME.G.def.music)})}
  function disposeScene(){if(!scene)return;scene.traverse(o=>{if(o.geometry&&!o.userData.keepGeo&&o!==GAME.me.g)o.geometry.dispose()});scene=null}
  /* ---------- Bewegung ---------- */
  const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true});addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
  function blocked(x,z){if(!room)return false;const r=.35;if(x<-room.W/2+r||x>room.W/2-r||z<-room.D/2+r||z>room.D/2-.3)return true;for(const c of colliders){if(x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r)return true}return false}
  function frame(dt,t){const me=GAME.me;if(!me||!room)return;const busy=UI.anyOpen();
    let ix=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0),iy=(keys['w']||keys['arrowup']?1:0)-(keys['s']||keys['arrowdown']?1:0);
    const J=GAME._joy&&GAME._joy();if(J){ix=J.x;iy=J.y}if(busy||deco&&false){ix=0;iy=0}
    if(keys['q'])camYaw=Math.min(.7,camYaw+dt);if(keys['c'])camYaw=Math.max(-.7,camYaw-dt);
    const mag=Math.min(1,Math.hypot(ix,iy));let sp=0;if(tapTo&&mag<.1){const dx=tapTo.x-me.ix,dz=tapTo.z-me.iz;const L=Math.hypot(dx,dz);if(L<.25){const f=tapTo.then;tapTo=null;f&&f()}else{ix=dx/L;iy=-dz/L}}
    if(Math.hypot(ix,iy)>.1){const c=Math.cos(camYaw),s=Math.sin(camYaw);const mx=ix*c-(-iy)*s,mz=ix*s+(-iy)*c;const L=Math.hypot(mx,mz);const run=keys['shift'];sp=(run?4.6:2.8)*Math.min(1,Math.hypot(ix,iy));
      const nx=me.ix+mx/L*sp*dt,nz=me.iz+mz/L*sp*dt;if(!blocked(nx,me.iz))me.ix=nx;if(!blocked(me.ix,nz))me.iz=nz;me.iyaw=Math.atan2(mx,mz);tapTo&&(Math.hypot(ix,iy)>.1&&!tapTo)&&0;
      if(!me.move.alt){stepT-=dt*sp*.6;if(stepT<=0){stepT=1;SND.play('step_wood',{vol:.3,jitter:.15})}}}
    me.speed=sp;if(sp>0&&me.emote){me.emote=null;me.emoteT=0;me.dance=0}
    if(me.iz>room.D/2-.45&&iy<-.1&&!deco)exit();
    /* Kamera */const dist=(room.camD||Math.max(room.W,room.D)*1.05+2)*camZoom;const tx=me.ix*.5,tz=me.iz*.3;cam.position.set(tx+Math.sin(camYaw)*dist,room.camH||dist*.78,tz+Math.cos(camYaw)*dist);cam.lookAt(tx,.6,tz-.6);
    kinds[kind].frame&&kinds[kind].frame(dt,t);if(ghost)updGhost();
    /* Prompt */const a=nearestAction();const pr=$('prompt');if(a&&!busy&&!deco){pr.hidden=false;pr.innerHTML='';pr.append(el('kbd',null,'E'),document.createTextNode(a.label));$('hbA').textContent='Aktion'}else if(!deco){pr.hidden=true;$('hbA').textContent=kind==='house'?'Einrichten':'Hüpfen'}}
  let stepT=0,tapTo=null;
  function nearestAction(){const me=GAME.me;let best=null,bd=1e9;for(const a of actions){const d=Math.hypot(a.x-me.ix,a.z-me.iz);if(d<(a.r||1.3)&&d<bd){bd=d;best=a}}if(!best&&me.iz>room.D/2-1.3)best={label:'Hinausgehen',act:exit};return best}
  function action(){if(deco){if(decoSel)placeAtHover();return}const a=nearestAction();if(a){a.act()}else if(kind==='house'){toggleDeco()}else{GAME.me.jump=.9}}
  function render(){if(!scene)return;if(HIGH)comp.render();else GAME.R.render(scene,cam)}
  function resize(){const w=$('world');const W_=w.clientWidth,H_=w.clientHeight;if(!W_)return;cam.aspect=W_/H_;cam.updateProjectionMatrix();if(comp){comp.setPixelRatio(Math.min(HIGH?2:1.25,devicePixelRatio));comp.setSize(W_,H_)}}
  /* ---------- Tippen ---------- */
  const floorPlane=new THREE.Plane(new V3(0,1,0),0);
  function tap(ray){if(!room)return;const p=new V3();if(!ray.ray.intersectPlane(floorPlane,p))return;if(deco){hoverCell=cellAt(p);if(decoSel)placeAtHover();else pickupAt(p);return}
    /* Möbel/Aktion antippen */for(const a of actions){if(Math.hypot(a.x-p.x,a.z-p.z)<.9){tapTo={x:a.x,z:a.z+(a.z<0?.9:-.9),then:()=>a.act()};return}}tapTo={x:Math.max(-room.W/2+.5,Math.min(room.W/2-.5,p.x)),z:Math.max(-room.D/2+.5,Math.min(room.D/2-.4,p.z))}}
  function pointer(e){if(!deco||!room)return;const r=$('worldCanvas').getBoundingClientRect();const m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(m,cam);const p=new V3();if(ray.ray.intersectPlane(floorPlane,p))hoverCell=cellAt(p)}
  $('worldCanvas').addEventListener('pointermove',e=>{if(GAME.mode==='interior'&&deco)pointer(e)});
  function cellAt(p){return{x:Math.round(p.x-.5)+.5,z:Math.round(p.z-.5)+.5,raw:p}}

  /* ================= Haus ================= */
  const itemsG=[];
  kinds.house={bg:'#FFE9C7',music:'home',build(sc){const{W,D}=roomSize();const H=3.2;const rm=SAVE.house.room;makeRoom(sc,W,D,H,rm.wall,rm.floor);buildItems(sc);return{W,D,camD:Math.max(W,D)*1.05+2.5}},
    frame(dt,t){for(const g of itemsG){if(g.userData.tick)try{g.userData.tick(t)}catch(e){}}},leave(){itemsG.length=0}};
  function footprint(it){const f=findFurn(it.id)||{size:[1,1]};const sz=it.id.startsWith('design:')?[1,1]:f.size||[1,1];const w=it.rot%2?sz[1]:sz[0],d=it.rot%2?sz[0]:sz[1];return{w,d}}
  function buildItems(sc){let lightsN=0;itemsG.forEach(o=>{o.parent&&o.parent.remove(o);disposeTree(o)});itemsG.length=0;colliders.length=0;actions.length=0;const{W,D}=roomSize();
    for(const it of SAVE.house.room.items){const g=furnModel(it.id);if(!g)continue;const f=findFurn(it.id);const{w,d}=footprint(it);
      if(it.id.startsWith('design:')){g.position.set(it.x,1.7,-D/2+.02);g.rotation.y=0}else if(f&&f.wall){g.position.set(it.x,0,-D/2+(f.size?f.size[1]/2:.5));g.rotation.y=0}else{g.position.set(it.x,0,it.z);g.rotation.y=-it.rot*PI/2}
      g.userData.item=it;sc.add(g);itemsG.push(g);if(g.userData.light&&lightsN<8){const L=g.userData.light;const pl=new THREE.PointLight(L.c||'#ffd9a0',(L.i||1)*1.3,9,1.6);pl.position.set(...L.p);g.add(pl);lightsN++}
      if(!(f&&f.wall)&&!it.id.startsWith('design:')&&!(f&&f.cat==='teppich'))colliders.push({x0:it.x-w/2+.08,x1:it.x+w/2-.08,z0:it.z-d/2+.08,z1:it.z+d/2-.08});
      if(f)furnAction(f,it,g)}}
  function furnModel(id){if(id.startsWith('design:')){const des=SAVE.designs.find(x=>'design:'+x.id===id);if(!des)return null;return framedPicture(des,1.1)}
    const f=findFurn(id);const g=new THREE.Group();if(!f){P(g,G.bx(.8,.8,.8,.2),M.c('#FFE3B8'),[0,.4,0]);return g}QF=HIGH?.9:.6;try{f.b(g,M,{},srand(hashStr(id).length))}catch(e){console.warn('Möbel',id,e)}QF=1;addOutlines(g);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});try{if(g.userData.tick)mergeCreature(g);else mergeGroup(g)}catch(e){}return g}
  function framedPicture(des,size){const g=new THREE.Group();const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const s=8;for(let i=0;i<1024;i++){x.fillStyle=des.pal[parseInt(des.px[i],16)];x.fillRect((i%32)*s,Math.floor(i/32)*s,s,s)}
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.magFilter=THREE.NearestFilter;P(g,G.bx(size+.18,size+.18,.08,.04),M.c('#C98C5A'),[0,0,.04]);const pic=P(g,G.pl(size,size),new THREE.MeshBasicMaterial({map:t}),[0,0,.085]);pic.userData.noOutline=true;addOutlines(g);return g}
  function furnAction(f,it,g){const pos={x:it.x,z:f.wall?-roomSize().D/2+.8:it.z};const A=(label,act)=>actions.push({x:pos.x,z:pos.z,r:1.4,label,act});
    if(f.cat==='sitz')A('Hinsetzen',()=>{const me=GAME.me;me.ix=it.x;me.iz=it.z+.05;me.iyaw=-it.rot*PI/2;doEmote(me,'schlafen',true);me.emote=null;GAME.say(me,'icon:relax',2,true);SND.play('soft')});
    else if(f.cat==='bett'){A('Schlafen',()=>{const me=GAME.me;doEmote(me,'schlafen');SND.play('cloth')});A('Bis zum Morgen schlafen',()=>{const h=GAMETIME.hour();if(h>6&&h<18){UI.toast('Es ist noch hell draussen – Nickerchen statt Nachtruhe.');return}GAME.fadeOut(()=>{GAMETIME.skip(7);UI.toast('Guten Morgen! Es ist 07:00.',2600)})})}
    else if(f.cat==='licht')A('Licht an/aus',()=>{const l=scene.userData.lamp;l.intensity=l.intensity>.1?0:.45;SND.play('toggle')});
    else if(f.cat==='musik')A('Musik hören',()=>{SND.music(pick(['world','town','museum','shop']));SND.play('toggle')});
    else if(f.cat==='technik'||f.cat==='spiel')A('Anschauen',()=>{GAME.say(GAME.me,pick(['Blink blink!','Piep!','Oh, schön.','Was das wohl kann?']),2);SND.play('pep')})}
  /* ---------- Einrichten ---------- */
  function toggleDeco(){if(kind!=='house')return;deco=!deco;SND.play(deco?'open':'close');if(deco){decoUI=el('div','deco');$('world').append(decoUI);renderDeco();UI.toast('Einrichten: Möbel wählen, auf den Boden tippen. R dreht, Esc beendet.')}else{if(decoUI){decoUI.remove();decoUI=null}clearGhost();decoSel=null;persist()}}
  function renderDeco(){if(!decoUI)return;decoUI.replaceChildren();const top=el('div','row');top.style.alignItems='center';top.style.flex='none';
    top.append(el('b',null,decoSel?('Platzieren: '+itemName(decoSel.kind,decoSel.id)):'Möbel wählen oder aufgestelltes Möbel antippen, um es einzupacken'));
    const rb=btn('Drehen','small',()=>{ghostRot=(ghostRot+1)%4;SND.play('toggle')});const done=btn('Fertig','small primary',toggleDeco);top.append(rb,done);decoUI.append(top);
    const strip=el('div','strip');const furn=SAVE.bag.filter(x=>x.kind==='furn'||x.kind==='wall'||x.kind==='floor');
    furn.forEach(it=>{const c=el('button','card'+(decoSel&&decoSel.id===it.id?' sel':''));c.type='button';c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)),el('span','sub','×'+it.n+(it.kind==='wall'?' Tapete':it.kind==='floor'?' Boden':'')));
      c.onclick=()=>{if(it.kind==='wall'||it.kind==='floor'){applySurface(it.kind,it.id);return}decoSel=decoSel&&decoSel.id===it.id?null:{kind:'furn',id:it.id};clearGhost();renderDeco()};strip.append(c)});
    SAVE.designs.forEach(d=>{const c=el('button','card'+(decoSel&&decoSel.id==='design:'+d.id?' sel':''));c.type='button';c.append(designImg(d,96),el('span',null,d.name),el('span','sub','Design'));c.onclick=()=>designMenu(d);strip.append(c)});
    if(!strip.children.length)strip.append(el('p','empty','Keine Möbel in der Tasche. Kauf welche im Laden!'));decoUI.append(strip)}
  function designMenu(d){const w=UI.win(d.name,{size:'narrow'});w.body.append(el('p',null,'Wie willst du dein Design verwenden?'));
    w.foot.append(btn('Als Bild aufhängen','primary',()=>{w.close();decoSel={kind:'design',id:'design:'+d.id};clearGhost();renderDeco()}),btn('Als Tapete',null,()=>{w.close();SAVE.house.room.wall='design:'+d.id;rebuildRoom()}),btn('Als Boden',null,()=>{w.close();SAVE.house.room.floor='design:'+d.id;rebuildRoom()}))}
  function applySurface(k,id){const rm=SAVE.house.room;const old=k==='wall'?rm.wall:rm.floor;if(k==='wall')rm.wall=id;else rm.floor=id;bagTake(k,id,1);if(old&&!old.startsWith('design:'))bagAdd(k,old);SND.play('j_success');rebuildRoom();renderDeco()}
  function rebuildRoom(){const me=GAME.me;const ix=me.ix,iz=me.iz;scene.remove(me.g);scene.remove(me.shadow);disposeScene();scene=baseScene(kinds.house.bg);comp=makeComposer(GAME.R,scene,cam);room=kinds.house.build(scene);adopt(me);me.ix=ix;me.iz=iz;resize();persist()}
  function clearGhost(){if(ghost){scene&&scene.remove(ghost);disposeTree(ghost);ghost=null}}
  function canPlace(id,x,z,rot){const{W,D}=roomSize();const f=findFurn(id);const isWall=(f&&f.wall)||id.startsWith('design:');const sz=id.startsWith('design:')?[1,1]:(f&&f.size)||[1,1];const w=rot%2?sz[1]:sz[0],d=rot%2?sz[0]:sz[1];
    if(isWall){if(x-w/2<-W/2-.01||x+w/2>W/2+.01)return false;return!SAVE.house.room.items.some(o=>{const of=findFurn(o.id);if(!((of&&of.wall)||o.id.startsWith('design:')))return false;return Math.abs(o.x-x)<(w+1)/2-.01})}
    if(x-w/2<-W/2-.01||x+w/2>W/2+.01||z-d/2<-D/2-.01||z+d/2>D/2-.9)return false;
    for(const o of SAVE.house.room.items){const of=findFurn(o.id);if(!of||of.wall||o.id.startsWith('design:'))continue;if(of.cat==='teppich'||(f&&f.cat==='teppich'))continue;const fp=footprint(o);if(Math.abs(o.x-x)<(fp.w+w)/2-.01&&Math.abs(o.z-z)<(fp.d+d)/2-.01)return false}return true}
  function snap(id,cell,rot){const f=findFurn(id);const sz=id.startsWith('design:')?[1,1]:(f&&f.size)||[1,1];const w=rot%2?sz[1]:sz[0],d=rot%2?sz[0]:sz[1];const x=(w%2?Math.round(cell.raw.x-.5)+.5:Math.round(cell.raw.x)),z=(d%2?Math.round(cell.raw.z-.5)+.5:Math.round(cell.raw.z));return{x,z}}
  function updGhost(){if(!decoSel||!hoverCell){clearGhost();return}if(!ghost){ghost=furnModel(decoSel.id);if(!ghost)return;ghost.traverse(o=>{if(o.isMesh&&!o.userData.hull){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.6;o.material.depthWrite=false}});scene.add(ghost)}
    const s=snap(decoSel.id,hoverCell,ghostRot);const f=findFurn(decoSel.id);const wall=(f&&f.wall)||decoSel.id.startsWith('design:');const ok=canPlace(decoSel.id,s.x,wall?0:s.z,ghostRot);
    if(wall){const isD=decoSel.id.startsWith('design:');ghost.position.set(s.x,isD?1.7:0,-roomSize().D/2+(isD?.02:(f&&f.size?f.size[1]/2:.5)));ghost.rotation.y=0}else{ghost.position.set(s.x,.02+Math.sin(performance.now()/180)*.03,s.z);ghost.rotation.y=-ghostRot*PI/2}
    ghost.traverse(o=>{if(o.isMesh&&!o.userData.hull&&o.material.color&&o.material.emissive)o.material.emissive.set(ok?'#1a4a10':'#6a1020')})}
  function placeAtHover(){if(!decoSel||!hoverCell)return;const s=snap(decoSel.id,hoverCell,ghostRot);const f=findFurn(decoSel.id);const wall=(f&&f.wall)||decoSel.id.startsWith('design:');
    if(!canPlace(decoSel.id,s.x,wall?0:s.z,ghostRot)){SND.play('error',{vol:.6});UI.toast('Da ist kein Platz.');return}
    if(decoSel.kind==='furn'&&!bagTake('furn',decoSel.id,1))return;SAVE.house.room.items.push({id:decoSel.id,x:s.x,z:wall?0:s.z,rot:wall?0:ghostRot});SND.play('place');GAME.W.fx(new V3(s.x,0,s.z),'stern',6,new V3(s.x,.6,s.z));
    if(decoSel.kind==='furn'&&!SAVE.bag.some(x=>x.kind==='furn'&&x.id===decoSel.id)){decoSel=null;clearGhost()}buildItems(scene);renderDeco();persist()}
  function pickupAt(p){const items=SAVE.house.room.items;let best=-1,bd=1.2;items.forEach((it,i)=>{const f=findFurn(it.id);const wall=(f&&f.wall)||it.id.startsWith('design:');const d=wall?(Math.abs(it.x-p.x)+(p.z<-roomSize().D/2+1.2?0:9)):Math.hypot(it.x-p.x,it.z-p.z);if(d<bd){bd=d;best=i}});
    if(best<0)return;const it=items[best];items.splice(best,1);if(!it.id.startsWith('design:'))bagAdd('furn',it.id);SND.play('pickup');buildItems(scene);renderDeco();persist()}
  addEventListener('keydown',e=>{if(deco&&(e.key==='r'||e.key==='R')){e.stopImmediatePropagation();ghostRot=(ghostRot+1)%4;SND.play('toggle')}},true);

  return{enter,exit,adopt,frame,render,resize,tap,action,toggleDeco,pointer,kinds,makeRoom,lamp,furnModel,framedPicture,colliders,actions,
    get deco(){return deco},get kind(){return kind},get scene(){return scene},get cam(){return cam},get room(){return room},rotate(dx){camYaw=Math.max(-.7,Math.min(.7,camYaw-dx*.004))},zoom(d){camZoom=Math.max(.6,Math.min(1.5,camZoom+d*.001))}};
})();

/* ================= Hausbau (Aussen) ================= */
function houseBuilder(){const st=SAVE.house.style;const w=UI.win('Hausbau',{size:'wide'});const wrap=el('div','paint');const prev=el('div');const ctl=el('div');ctl.style.display='flex';ctl.style.flexDirection='column';ctl.style.gap='10px';wrap.append(prev,ctl);w.body.append(wrap);
  const img=new Image();img.style.cssText='width:100%;max-width:100%;aspect-ratio:1;border-radius:18px;background:linear-gradient(#bfe6ff,#fff1dc)';prev.append(img);
  const redraw=()=>{const k='house:'+JSON.stringify(st);thumbCache.delete(k);const g=new THREE.Group();try{g.add(buildHouse(st,makeMats({skin:'haut',color:0})))}catch(e){}addOutlines(g);img.src=renderThumbGroup(g,new V3(.7,.45,1))};
  const seg=(label,key,opts)=>{const l=el('label','f',label);const s=el('div','seg');opts.forEach(([v,n])=>{const b=el('button',null,n);b.type='button';b.setAttribute('aria-pressed',st[key]===v);b.onclick=()=>{st[key]=v;[...s.children].forEach(x=>x.setAttribute('aria-pressed',x===b));SND.play('select',{vol:.5});redraw()};s.append(b)});l.append(s);ctl.append(l)};
  const cols=(label,key,list)=>{const l=el('label','f',label);const s=el('div','swatches');list.forEach(c=>{const b=el('button');b.type='button';b.style.background=c;b.setAttribute('aria-pressed',st[key]===c);b.onclick=()=>{st[key]=c;[...s.children].forEach(x=>x.setAttribute('aria-pressed',x===b));redraw()};s.append(b)});l.append(s);ctl.append(l)};
  seg('Form','shape',[['spitz','Spitzdach'],['huette','Hütte'],['rund','Rundhaus'],['pilz','Pilz'],['kuppel','Kuppel'],['turm','Turm']]);
  seg('Wände','wall',[['holz','Holz'],['stein','Stein'],['blech','Blech'],['moos','Moos'],['lehm','Lehm']]);
  cols('Wandfarbe','wallCol',['#FFE3B8','#FFFDF7','#FFC9A8','#BDE6A6','#A9C9F5','#D9B5F2','#F2D9A6','#8D89A6']);
  cols('Dachfarbe','roofCol',['#F0556E','#5B8DEF','#6FAF5C','#FF9E45','#8E6BD1','#8A5A44','#FFD85A','#56C6B6']);
  cols('Tür','doorCol',['#7FB2E0','#F0556E','#FFD85A','#6FAF5C','#8A5A44','#FFFDF7']);
  seg('Fenster','win',[['rund','Rund'],['eckig','Eckig'],['bullauge','Bullauge']]);
  seg('Kamin','chimney',[[true,'Ja'],[false,'Nein']]);seg('Zaun','fence',[[true,'Ja'],[false,'Nein']]);seg('Fahne','flag',[[true,'Ja'],[false,'Nein']]);
  const sz=el('label','f','Grösse (grösser = mehr Platz innen)');const ss=el('div','seg');[[1,'Klein'],[2,'Mittel · 5 000 T'],[3,'Gross · 12 000 T']].forEach(([v,n])=>{const b=el('button',null,n);b.type='button';b.setAttribute('aria-pressed',st.size===v);
    b.onclick=()=>{if(v>st.size){const cost=v===2?5000:12000;if(SAVE.money<cost){SND.play('error');UI.toast('Dafür brauchst du '+fmt(cost)+' Taler.');return}money(-cost);SND.play('j_buy')}st.size=v;[...ss.children].forEach(x=>x.setAttribute('aria-pressed',x===b));redraw()};ss.append(b)});sz.append(ss);ctl.append(sz);
  w.foot.append(btn('Fertig bauen','primary',()=>{persist();w.close();SND.play('build');SND.play('j_success');if(GAME.mode==='outdoor'&&GAME.G.id==='kompost'){const pl=GAME.G.places.find(p=>p.build==='house');if(pl&&pl.obj){const old=pl.obj.children[0];pl.obj.remove(old);disposeTree(old);const nh=buildHouse(st,makeMats({skin:'haut',color:0}));addOutlines(nh);nh.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});pl.obj.add(nh);GAME.W.fx(pl.dir,'konfetti',20)}}UI.toast('Dein Haus ist umgebaut!')}));
  setTimeout(redraw,30)}
