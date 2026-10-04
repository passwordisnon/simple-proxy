/* =====================================================================
   CYBORG-LABOR · race.js
   Raketenrennen im Weltraum. Raumstationen kreisen zwischen den
   Planeten; dort startet man Rennen durch leuchtende Tor-Ringe (2 Runden,
   Boost-Felder). Mehrspieler über die room-Fähigkeit: jede Station hat
   einen eigenen Rennraum, alle Anwesenden fahren live gegeneinander,
   KI-Raketen füllen leere Startplätze auf.
   ===================================================================== */
const RACE=(()=>{
  const V=THREE.Vector3;const LAPS=2,GRID=4;
  const STATIONS=[
    {id:'nova',n:'Station Nova',pos:[34,0,-30],col:'#8FD0FF',track:{rx:26,rz:18,wig:4,n:10,rot:.3}},
    {id:'aurora',n:'Station Aurora',pos:[-58,0,40],col:'#FF8FB1',track:{rx:30,rz:24,wig:7,n:12,rot:1.2}},
    {id:'komet',n:'Station Komet',pos:[70,0,62],col:'#FFD85A',track:{rx:34,rz:20,wig:9,n:14,rot:2.1}},
    {id:'farn',n:'Station Farn',pos:[-30,0,128],col:'#7FD34A',track:{rx:28,rz:20,wig:6,n:11,rot:.7}},
    {id:'pixel',n:'Station Pixel',pos:[140,0,-56],col:'#45E0FF',track:{rx:30,rz:22,wig:8,n:12,rot:1.7}},
    {id:'zephyr',n:'Station Zephyr',pos:[-142,0,-84],col:'#C8B8FF',track:{rx:32,rz:22,wig:7,n:12,rot:2.6}},
    {id:'pendel',n:'Station Pendel',pos:[16,0,-172],col:'#E8B04A',track:{rx:30,rz:20,wig:8,n:12,rot:.2}}];
  let sc=null,stations=[],race=null,room=null,roomName=null,peers=new Map(),lobbyW=null,hud=null,pres={};
  const S=()=>SAVE.race=SAVE.race||{wins:0,races:0,best:{}};
  const M=()=>makeMats({skin:'haut',color:0});
  /* ---------- Stationen im Weltraum ---------- */
  function stationModel(st){const m=M();const g=new THREE.Group();const c=m.c(st.col,{gloss:.8,rim:.6});const w=m.c('#F2F4FA',{gloss:.7});
    P(g,G.to(4.2,.55),w,[0,0,0],[PI/2,0,0]);P(g,G.cy(1.3,1.3,2.4),w,[0,0,0]);P(g,G.s(1.35),c,[0,1.2,0],null,[1,.6,1]);P(g,G.s(1.35),c,[0,-1.2,0],null,[1,.6,1]);
    for(let i=0;i<4;i++){const a=i/4*TAU;bt(g,[Math.cos(a)*1.2,0,Math.sin(a)*1.2],[Math.cos(a)*3.8,0,Math.sin(a)*3.8],.18,m.steel());P(g,G.bx(1.2,.7,.9,.2),c,[Math.cos(a)*4.2,0,Math.sin(a)*4.2],[0,-a,0])}
    both(x=>{P(g,G.bx(3.2,.06,1.4,.02),m.c('#3E5A9A',{gloss:1.2}),[x*3.2,2.2,0]);bt(g,[0,1.8,0],[x*1.8,2.2,0],.08,m.steel())});
    const lights=[];for(let i=0;i<12;i++){const a=i/12*TAU;lights.push(P(g,G.s(.14),m.glow(i%2?st.col:'#FFFFFF',1.8),[Math.cos(a)*4.2,.55,Math.sin(a)*4.2]))}
    addOutlines(g);g.userData.lights=lights;return g}
  function gatePts(st){const T=st.track,c=new V(...st.pos),pts=[];for(let i=0;i<T.n;i++){const a=i/T.n*TAU+T.rot;const w=Math.sin(i*2.3)*T.wig;pts.push(new V(c.x+Math.cos(a)*(T.rx+w),0,c.z+Math.sin(a)*(T.rz+w*.6)))}return pts}
  function segD(p,a,b){const ab=b.clone().sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(ab)/ab.lengthSq()));return a.clone().addScaledVector(ab,t).distanceTo(p)}
  function clearBelt(belt,tracks){if(!belt)return;const ims=[];belt.traverse(o=>{if(o.isInstancedMesh)ims.push(o)});if(belt.isInstancedMesh)ims.push(belt);const z=new THREE.Matrix4().makeScale(0,0,0);
    belt.userData.rocks.forEach((r,i)=>{const q=new V(r.p.x,0,r.p.z);for(const g of tracks)for(let k=0;k<g.length;k++){if(segD(q,g[k],g[(k+1)%g.length])<r.s+3.2||q.distanceTo(g[0])<9){r.p.set(0,-999,0);for(const im of ims)im.setMatrixAt(i,z);return}}});for(const im of ims)im.instanceMatrix.needsUpdate=true}
  function build(scene,belt){sc=scene;stations=STATIONS.map(st=>{const g=stationModel(st);g.position.set(...st.pos);sc.add(g);
      const lbl=el('div','lbl planetlbl');lbl.textContent=st.n;lbl.style.display='none';$('labels').append(lbl);return{st,g,lbl,gates:gatePts(st)}});clearBelt(belt,stations.map(s=>s.gates.concat([s.g.position.clone()])))}
  /* ---------- Nähe und Beschriftung ---------- */
  function nearStation(p){let best=null,bd=9;for(const s of stations){const d=s.g.position.distanceTo(p);if(d<bd){bd=d;best=s}}return best}
  function labels(cam,view,ship){const w=$('world').clientWidth,h=$('world').clientHeight;for(const s of stations){const v=s.g.position.clone().add(new V(0,3.6,0)).project(cam);s.lbl.style.left=((v.x+1)/2*w)+'px';s.lbl.style.top=((1-v.y)/2*h)+'px';
      const dl=s.g.position.distanceTo(ship.position);s.lbl.style.display=v.z<1&&(view==='map'||dl<70)&&!race?'':'none';s.lbl.style.opacity=view==='map'?1:Math.max(.35,1-dl/80)}}
  function hideLabels(){for(const s of stations)s.lbl.style.display='none'}
  /* ---------- Mehrspieler: Rennraum je Station ---------- */
  async function joinRoom(s){const name='race-'+s.st.id;if(roomName===name&&room)return room;await leaveRoom();try{const R=await claude.use('room');if(!R)return null;room=await R.join(name);roomName=name;peers.clear();
      room.onPeers(ch=>{for(const p of ch.left)dropPeer(p.peer);for(const p of[...ch.joined,...ch.updated]){if(p.isMe)continue;onPeer(p)}if(lobbyW&&!lobbyW.closed)renderLobby()},()=>{});return room}catch(e){room=null;return null}}
  async function leaveRoom(){for(const k of[...peers.keys()])dropPeer(k);if(room){try{await room.leave()}catch(e){}}room=null;roomName=null}
  const clean=(s,n)=>String(s||'').replace(/[\u0000-\u001f<>]/g,'').slice(0,n);
  const hex=v=>typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v)?v:'#FFFDF7';
  function onPeer(p){const pr=p.presence||{};let q=peers.get(p.peer);if(!q){q={peer:p.peer,g:null};peers.set(p.peer,q)}q.n=clean(pr.n,24)||'Jemand';q.col=hex(pr.col);q.acc=hex(pr.acc);q.startAt=+pr.startAt||0;q.inRace=pr.r===1;
    const v=Array.isArray(pr.p)&&pr.p.length===3&&pr.p.every(Number.isFinite)?new V(pr.p[0],0,pr.p[2]):null;if(v)q.tp=v;q.yaw=Number.isFinite(pr.y)?pr.y:0;q.lap=+pr.lap||0;q.gate=+pr.gate||0;q.fin=+pr.fin||0;
    /* Startsignal übernehmen: neuester Start in den nächsten Sekunden */if(!race&&q.startAt>Date.now()-1500&&q.startAt<Date.now()+9000&&lobbyW&&!lobbyW.closed&&lobbyW.station)beginRace(lobbyW.station,q.startAt)}
  function dropPeer(k){const q=peers.get(k);if(q&&q.g){q.g.parent&&q.g.parent.remove(q.g)}peers.delete(k)}
  function send(){if(!room)return;const sp=SPACE._dbg().ship;const s=ROCKET.spec();const pr={n:clean(SAVE.nick||'Gast',24),col:s.col,acc:s.acc,startAt:pres.startAt||0,r:race?1:0};
    if(race&&sp){pr.p=[+sp.position.x.toFixed(2),0,+sp.position.z.toFixed(2)];pr.y=+SPACE.yaw().toFixed(3);pr.lap=race.me.lap;pr.gate=race.me.gate;pr.fin=race.me.fin||0}room.presence(pr).catch(()=>{})}
  /* ---------- Lobby ---------- */
  async function openLobby(s){const w=UI.win('Rennen · '+s.st.n,{size:'narrow',onClose:()=>{if(!race&&!w.starting)leaveRoom()}});lobbyW=w;w.station=s;w.body.append(el('p',null,'Verbindet mit dem Rennraum …'));await joinRoom(s);pres={startAt:0};send();renderLobby()}
  function renderLobby(){const w=lobbyW;if(!w||w.closed)return;const s=w.station;w.body.replaceChildren();const best=S().best[s.st.id];
    w.body.append(el('p',null,LAPS+' Runden durch '+s.gates.length+' Ringe rund um '+s.st.n+'. Leuchtende Pfeile geben Schub.'+(best?' Deine Bestzeit: '+best.toFixed(2)+' s.':'')));
    const list=el('div','grid');const people=[{n:(SAVE.nick||'Du')+' (du)',col:ROCKET.spec().col}].concat([...peers.values()].map(q=>({n:q.n,col:q.col})));
    for(const p of people){const c=el('div','card');const sw=el('div');sw.style.cssText='height:10px;border-radius:6px;margin:4px 0;background:'+p.col;c.append(sw,el('span',null,p.n));list.append(c)}
    const ai=Math.max(0,GRID-people.length);if(ai)list.append(el('div','card sub',ai+' KI-Rakete'+(ai>1?'n':'')+' füllen auf'));w.body.append(el('b',null,room?'Im Rennraum':'Offline: nur gegen KI'),list);
    w.foot.replaceChildren(btn('Rennen starten','primary',()=>{const at=Date.now()+5000;pres.startAt=at;send();beginRace(s,at)}))}
  /* ---------- Rennen ---------- */
  function gateMesh(st,i,n){const m=M();const g=new THREE.Group();const col=i===0?'#FFFFFF':st.col;P(g,G.to(2.6,.22),m.glow(col,1.3));P(g,G.to(2.6,.05),m.glow('#FFFFFF',1.8),[0,0,.05]);const lab=i===0?'START':String(i);
    const tx=ctex('gate-'+lab+st.id,128,64,(x,w,h)=>{x.fillStyle='rgba(0,0,0,0)';x.clearRect(0,0,w,h);x.fillStyle='#FFFFFF';x.font='bold 40px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText(lab,w/2,46)});
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));s.position.set(0,3.4,0);s.scale.set(2.4,1.2,1);g.add(s);return g}
  function boostMesh(){const m=M();const g=new THREE.Group();for(let i=0;i<3;i++)P(g,G.co(.5,.9,3),m.glow('#7FFFD4',1.6),[0,0,i*.9-.9],[PI/2,0,0]);return g}
  function beginRace(s,startAt){if(race)return;if(lobbyW&&!lobbyW.closed){lobbyW.starting=true;lobbyW.close()}lobbyW=null;hideLabels();
    const gates=s.gates;const objs=[];gates.forEach((p,i)=>{const g=gateMesh(s.st,i,gates.length);const nx=gates[(i+1)%gates.length];g.position.copy(p);g.lookAt(nx.x,0,nx.z);sc.add(g);objs.push(g)});
    const boosts=[];gates.forEach((p,i)=>{if(i%3!==1)return;const nx=gates[(i+1)%gates.length];const b=boostMesh();b.position.copy(p).lerp(nx,.5);b.lookAt(nx.x,0,nx.z);sc.add(b);boosts.push(b);objs.push(b)});
    /* Startaufstellung vor Tor 0 */const g0=gates[0],g1=gates[1];const dir=g1.clone().sub(g0).normalize();const side=new V(-dir.z,0,dir.x);const grid=i=>g0.clone().addScaledVector(dir,-5-Math.floor(i/2)*3).addScaledVector(side,(i%2?1.6:-1.6));
    SPACE.place(grid(0),Math.atan2(dir.x,dir.z));
    const nPeers=[...peers.values()].length;const nAI=Math.max(0,GRID-1-nPeers);const ai=[];const cols=['#FF9E6E','#A6EBC3','#C6A9FF','#FFD85A'];
    for(let i=0;i<nAI;i++){const sp=Object.assign(ROCKET.spec(),{col:cols[i%4],acc:'#3B3450',nose:['klassik','spitz','rund'][i%3]});QF=.6;const rk=ROCKET.build(sp,M());QF=1;addOutlines(rk);rk.rotation.x=-PI/2;rk.scale.setScalar(.7);const g=new THREE.Group();g.add(rk);g.position.copy(grid(i+1+nPeers));sc.add(g);
      ai.push({g,gate:1,lap:0,sp:19+Math.random()*4+i*.6,yaw:Math.atan2(dir.x,dir.z),fin:0,n:['Blitzi','Kometa','Nebelfuchs','Turbo-Tina'][i%4],wob:Math.random()*9})}
    race={s,gates,objs,boosts,startAt,me:{gate:1,lap:0,fin:0,boost:0},ai,t0:startAt,done:false,prevPos:null};S().races++;persist();hudOn();SND.play('select')}
  function locked(){return!!race&&Date.now()<race.startAt}
  function rocketFor(q){if(q.g)return q.g;const sp=Object.assign(ROCKET.spec(),{col:q.col,acc:q.acc});QF=.6;const rk=ROCKET.build(sp,M());QF=1;addOutlines(rk);rk.rotation.x=-PI/2;rk.scale.setScalar(.7);const g=new THREE.Group();g.add(rk);sc.add(g);
    const lbl=el('div','lbl');lbl.textContent=q.n;$('labels').append(lbl);g.userData.lbl=lbl;q.g=g;return g}
  function crossed(p0,p1,gp,next){/* Tor passiert: innerhalb des Rings und über die Torebene gesprungen */const n=next.clone().sub(gp).normalize();const a=p0.clone().sub(gp).dot(n),b=p1.clone().sub(gp).dot(n);if(!(a<0&&b>=0))return false;
    const t=a/(a-b);const hit=p0.clone().lerp(p1,t);return hit.distanceTo(gp)<3.1}
  function frame(dt,t,ship,vel,cam){if(!race)return;const R=race,G=R.gates,now=Date.now();const el_=(now-R.startAt)/1000;
    /* Countdown */if(el_<0){if(hud)hud.querySelector('.cd').textContent=Math.ceil(-el_);if(Math.ceil(-el_)!==R.lastCd){R.lastCd=Math.ceil(-el_);SND.play('pep',{rate:1.2})}vel.set(0,0,0)}else if(hud&&!R.go){R.go=true;hud.querySelector('.cd').textContent='LOS!';SND.play('powerup');setTimeout(()=>{if(hud)hud.querySelector('.cd').textContent=''},900)}
    for(const g of R.objs)g.rotation.z+=dt*.4;
    /* eigene Tore */const p1=ship.position.clone();if(R.prevPos&&el_>=0&&!R.me.fin){const gi=R.me.gate%G.length;const nx=G[(gi+1)%G.length];if(crossed(R.prevPos,p1,G[gi],nx)){SND.play('pickup',{rate:1.1+gi*.02});
        if(gi===0){R.me.lap++;if(R.me.lap>=LAPS){R.me.fin=el_;finish()}}R.me.gate++;}}R.prevPos=p1;
    /* Boost-Felder */for(const b of R.boosts){if(b.position.distanceTo(p1)<2.2&&(!R.me.boostT||now-R.me.boostT>1500)){R.me.boostT=now;vel.multiplyScalar(1.6);SND.play('powerup',{rate:1.4,vol:.6})}}
    /* KI-Raketen */if(el_>=0)for(const a of R.ai){if(a.fin)continue;const tg=G[a.gate%G.length];const to=tg.clone().sub(a.g.position);const d=to.length();const want=Math.atan2(to.x,to.z);let dy=want-a.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));a.yaw+=Math.max(-2.2*dt,Math.min(2.2*dt,dy));
      const sp=a.sp*(1+Math.sin(t*.7+a.wob)*.08);a.g.position.x+=Math.sin(a.yaw)*sp*dt;a.g.position.z+=Math.cos(a.yaw)*sp*dt;a.g.rotation.y=a.yaw;if(d<2.4){if(a.gate%G.length===0){a.lap++;if(a.lap>=LAPS)a.fin=el_}a.gate++}}
    /* Mitspielende */for(const q of peers.values()){if(!q.inRace||!q.tp)continue;const g=rocketFor(q);g.position.lerp(q.tp,Math.min(1,dt*8));g.rotation.y=q.yaw;const v=g.position.clone().add(new V(0,1.8,0)).project(cam);const lb=g.userData.lbl;lb.style.left=((v.x+1)/2*$('world').clientWidth)+'px';lb.style.top=((1-v.y)/2*$('world').clientHeight)+'px';lb.style.display=v.z<1?'':'none'}
    /* Platzierung */const prog=(lap,gate,pos,gi)=>lap*1000+gate*10-(pos?pos.distanceTo(G[gi%G.length])*.01:0);const mine=prog(R.me.lap,R.me.gate,p1,R.me.gate);
    const others=R.ai.map(a=>a.fin?1e9-a.fin:prog(a.lap,a.gate,a.g.position,a.gate)).concat([...peers.values()].filter(q=>q.inRace).map(q=>q.fin?1e9-q.fin:prog(q.lap,q.gate)));
    const rank=1+others.filter(o=>o>(R.me.fin?1e9-R.me.fin:mine)).length;R.rank=rank;
    if(hud&&el_>=0){hud.querySelector('.lap').textContent='Runde '+Math.min(LAPS,R.me.lap+1)+'/'+LAPS;hud.querySelector('.pos').textContent='Platz '+rank+'/'+(others.length+1);hud.querySelector('.tm').textContent=(R.me.fin||el_).toFixed(2)+' s';hud.querySelector('.gt').textContent='Ring '+(R.me.gate%G.length||G.length)+'/'+G.length}
    if(!R._st||now-R._st>110){R._st=now;send()}}
  function finish(){const R=race;const rank=R.rank||1;const pay=[0,150,80,40][rank]||15;money(pay);const st=S();if(rank===1)st.wins++;const b=st.best[R.s.st.id];if(!b||R.me.fin<b)st.best[R.s.st.id]=R.me.fin;persist();SND.jingle(rank===1?'j_success':'j_buy');
    setTimeout(()=>{const w=UI.win('Ziel! Platz '+rank,{size:'narrow',onClose:()=>endRace()});w.body.append(el('p',null,'Zeit: '+R.me.fin.toFixed(2)+' s'+(st.best[R.s.st.id]===R.me.fin?' – neue Bestzeit!':'')+'. Preisgeld: '+pay+' Taler.'),el('p','sub','Siege insgesamt: '+st.wins+'.'));w.foot.append(btn('Weiterfliegen','primary',()=>w.close()))},900)}
  function endRace(){if(!race)return;for(const g of race.objs){sc.remove(g)}for(const a of race.ai)sc.remove(a.g);for(const q of peers.values()){if(q.g){sc.remove(q.g);q.g.userData.lbl&&q.g.userData.lbl.remove();q.g=null}}race=null;pres.startAt=0;send();hudOn(false);leaveRoom()}
  function hudOn(v){if(hud){hud.remove();hud=null}if(v===false)return;hud=el('div','racehud');hud.innerHTML='<span class="lap"></span><span class="gt"></span><span class="pos"></span><span class="tm"></span><b class="cd"></b>';
    hud.style.cssText='position:absolute;top:64px;left:50%;transform:translateX(-50%);display:flex;gap:14px;align-items:center;padding:8px 18px;border-radius:22px;background:rgba(255,253,247,.92);color:#3B3450;font-weight:800;z-index:30;pointer-events:none';$('world').append(hud);
    const cd=hud.querySelector('.cd');cd.style.cssText='position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);font-size:72px;color:#FFE38A;text-shadow:0 4px 0 #3B3450'}
  function quit(){if(!race)return;UI.toast('Rennen abgebrochen.');endRace()}
  return{build,nearStation,labels,hideLabels,openLobby,frame,locked,get active(){return!!race},quit,leaveRoom,STATIONS}
})();
