/* =====================================================================
   CYBORG-LABOR · social.js
   Mitspielende: KI-Spieler:innen (lokal simuliert) und echte Online-Leute
   über die room-Fähigkeit (Präsenz: Position, Aussehen, Emotes, Chat, Kunst).
   Globaler Chat + Freund:innen-Chat (eigener benannter Raum je Paar).
   ===================================================================== */
const SOCIAL=(()=>{
  const chat={all:[],fr:[]};let tab='all',open=false;let room=null,connected=false,frRooms=new Map();const peersSeen=new Map();
  const myMsgs=[];let presT=0,lastPres='';const peerArt=new Map();let myArt=null;let emote={id:null,t:0};
  const clean=(s,n)=>String(s||'').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯﻿]/g,'').slice(0,n);
  /* ---------- Chat-Anzeige ---------- */
  function addMsg(ch,who,text,cls){chat[ch].push({who,text,cls});if(chat[ch].length>80)chat[ch].shift();if(open&&tab===ch)renderMsgs();else if(ch==='all'||ch==='fr')$('hbChat').classList.add('on');
    if(cls!=='sys'&&cls!=='me'){SND.play('chat',{vol:.4})}}
  function renderMsgs(){const box=$('chatMsgs');box.replaceChildren(...chat[tab].map(m=>{const d=el('div',m.cls||'');if(m.cls==='sys'){d.textContent=m.text}else{d.append(el('b',null,m.who+': '),document.createTextNode(m.text))}return d}));box.scrollTop=box.scrollHeight;
    $('chatAll').setAttribute('aria-selected',tab==='all');$('chatFr').setAttribute('aria-selected',tab==='fr');const to=$('chatTo');to.hidden=tab!=='fr';
    if(tab==='fr'){to.replaceChildren(...(SAVE.friends.length?SAVE.friends.map(f=>new Option(f.nick+(f.bot?' (KI)':''),f.pid)):[new Option('Noch keine Freund:innen','')]))}status()}
  function status(){const n=room?room.peers().filter(p=>!p.isMe).length:0;$('chatStatus').textContent=room?(connected?`${n} online`:'verbindet …'):'nur KI-Mitspielende'}
  function toggleChat(v){open=v??!open;$('chat').hidden=!open;$('hbChat').classList.remove('on');if(open){renderMsgs();setTimeout(()=>$('chatIn').focus(),30)}}
  $('hbChat').onclick=()=>toggleChat();$('chatX').onclick=()=>toggleChat(false);$('chatAll').onclick=()=>{tab='all';renderMsgs()};$('chatFr').onclick=()=>{tab='fr';renderMsgs()};
  $('chatIn').addEventListener('keydown',e=>{if(e.key==='Escape'){toggleChat(false);$('chatIn').blur()}e.stopPropagation()});
  $('chatForm').addEventListener('submit',e=>{e.preventDefault();const t=clean($('chatIn').value.trim(),140);if(!t)return;$('chatIn').value='';send(t)});
  function nick(){return clean(SAVE.nick||S.name||'Gast',24)||'Gast'}
  function send(t){const me=GAME.me;if(tab==='fr'){const to=$('chatTo').value;const f=SAVE.friends.find(x=>x.pid===to);if(!f){UI.toast('Füge zuerst jemanden als Freund:in hinzu.');return}
      addMsg('fr',nick()+' → '+f.nick,t,'me');if(f.bot){setTimeout(()=>addMsg('fr',f.nick,pick([...BOT_CHAT.react,'hab grad keine zeit, bin am angeln','schreib ich dir gleich','du bist lustig haha']),'bot'),1500+Math.random()*2500)}
      else{const r=frRooms.get(f.pid);if(r){pushMsg(r.msgs,t,to);r.room.presence({c:r.msgs,mp:MYPLANET.encode()}).catch(()=>{})}else addMsg('fr','System',`${f.nick} ist gerade nicht online oder hat dich noch nicht hinzugefügt.`,'sys')}return}
    addMsg('all',nick(),t,'me');if(me)GAME.say(me,t,4);pushMsg(myMsgs,t);presT=0;
    /* KI reagiert manchmal */if(Math.random()<.5){const b=pick(bots);if(b)setTimeout(()=>{const line=pick(BOT_CHAT.react);addMsg('all',b.d.name,line,'bot');GAME.say(b,line,3)},1200+Math.random()*2000)}}
  function pushMsg(arr,t,to){arr.push({i:rid().slice(0,6),t:Date.now(),m:t,...(to?{to}:{})});while(arr.length>3)arr.shift()}

  /* ================= KI-Mitspielende ================= */
  let bots=[];let botChatT=8;
  function randomCyborg(name,seed){const r=srand(seed);const pk=a=>a[Math.floor(r()*a.length)];const d=sanitize({name,body:{seg:1+Math.floor(r()*3),size:.9+r()*.3,skin:pk(SKINS).id,color:Math.floor(r()*SKIN_COLORS.length),shape:pk(TORSOS).id,pattern:pk(PATTERNS).id,color2:Math.floor(r()*SKIN_COLORS.length)},
      parts:{kopf:pk(PARTS.kopf.filter(p=>p.k!=='none')).id,augen:pk(PARTS.augen.filter(p=>p.k!=='none')).id,arme:pk(PARTS.arme).id,beine:pk(PARTS.beine.filter(p=>!['kabel','wurzeln','stamm','pilzstiel','blumentopf'].includes(p.id))).id,extras:[pk(PARTS.extras).id]}});d.id='bot-'+seed;return d}
  function spawnBots(pid){bots.forEach(b=>GAME.dropEnt(b.d.id));bots=[];
    if(PLANETS[pid]&&PLANETS[pid].mine){/* eigener Planet: nur befreundete KI kommt ab und zu zu Besuch */if(MYPLANET.visiting)return;const fr=SAVE.friends.filter(f=>f.bot);if(!fr.length)return;
      const come=fr.filter(()=>Math.random()<.5).slice(0,2);if(!come.length)return;const pad=(GAME.G.places.find(x=>x.build==='rocket')||GAME.G.places[0]).dir;
      come.forEach((f,i)=>{const d=randomCyborg(f.nick,hashStr(f.nick+'kompost').length*97);d.id=f.pid;const e=GAME.makeEnt(d,{kind:'bot',tag:'Besuch',p:GAME.W.near(pad,1.5+i)});e.bot={task:null,t:3+Math.random()*4};bots.push(e)});
      setTimeout(()=>{UI.toast(come.map(f=>f.nick).join(' und ')+(come.length>1?' sind':' ist')+' zu Besuch auf „'+(SAVE.myPlanet&&SAVE.myPlanet.name||'deinem Planeten')+'“!',3200);addMsg('all',come[0].nick,pick(['hey, schöner planet!!','wow, hast du das alles selbst gemacht?','ich wollt dich mal besuchen :)']),'bot')},2200);return}
    const n=pid==='kompost'?5:3;const names=[...BOT_NAMES].sort(()=>Math.random()-.5);
    for(let i=0;i<n;i++){const d=randomCyborg(names[i],hashStr(names[i]+pid).length*97+i);const e=GAME.makeEnt(d,{kind:'bot',tag:'KI',p:GAME.W.near((pick(GAME.G.places.filter(x=>x.build))||{dir:new V3(0,1,0)}).dir,1)});e.bot={task:null,t:2+Math.random()*4};bots.push(e)}
    setTimeout(()=>{const b=pick(bots);if(b)addMsg('all',b.d.name,pick(BOT_CHAT.hello),'bot')},2500)}
  function stepBots(dt){for(const e of bots){const B=e.bot;B.t-=dt;if(B.t>0||e.goal||e.life)continue;B.t=8+Math.random()*14;const r=Math.random();
      if(r<.3){const shore=findShore(e.p);if(shore){e.goal={p:shore,then:()=>{e.stop=6;GAME.say(e,'icon:rod',5,true);setTimeout(()=>{if(Math.random()<.5&&FISH.length){const f=pick(FISH.filter(x=>x.planet===GAME.G.id)||FISH);if(f){const line=pick(BOT_CHAT.fish).replace('{f}',f.n);addMsg('all',e.d.name,line,'bot');GAME.say(e,'icon:fish',2,true)}}},5000)}}}}
      else if(r<.45){const st=GAME.G.places.find(p=>p.id==='platz');if(st)e.goal={p:GAME.W.near(st.dir,.3),then:()=>{doEmote(e,pick(['tanzen','winken','freude','drehen']),true)}}}
      else if(r<.6){doEmote(e,pick(Object.keys(EMOTES)),true)}
      else{const pl=pick(GAME.G.places.filter(x=>x.build));if(pl)e.goal={p:GAME.W.near(pl.dir,.5)}}}
    botChatT-=dt;if(botChatT<=0&&bots.length){botChatT=25+Math.random()*50;const b=pick(bots);const line=pick(BOT_CHAT.general);addMsg('all',b.d.name,line,'bot');GAME.say(b,line,4)}}
  function findShore(p){for(let i=0;i<30;i++){const q=GAME.W.near(p,1.2+Math.random());const h=GAME.G.hAt(q);if(h>GAME.G.sea&&h<GAME.G.sea+.25)return q}return null}
  async function botTalk(e){const isFr=SAVE.friends.some(f=>f.pid===e.d.id);e.stop=4;e.lookAt=GAME.me;const voice=GAME.voiceFor(e.d);
    const ch=await UI.talk(e.d.name+' (KI)',[pick(['hey! was geht?','hiii :)','oh hallo!','na, auch am sammeln?']),'Ich bin eine KI-Mitspielerin. Echte Leute siehst du mit grünem Online-Schild.'],{voice,color:'#8C6FE0',choices:[isFr?'Schon befreundet':'Freund:in werden','Winken','Tschüss']});
    if(ch===0&&!isFr){SAVE.friends.push({pid:e.d.id,nick:e.d.name,bot:true});persist();SND.play('j_success');doEmote(e,'herz',true);UI.toast(e.d.name+' ist jetzt deine Freundin/dein Freund (KI).');addMsg('fr','System',`${e.d.name} (KI) ist jetzt in deiner Freundesliste.`,'sys')}
    else if(ch===1){doEmote(GAME.me,'winken');setTimeout(()=>doEmote(e,'winken',true),400)}}

  /* ================= Echte Online-Leute (room) ================= */
  async function connect(){try{if(!window.claude||!claude.use)return;room=await claude.use('room')}catch(e){room=null}
    if(!room){addMsg('all','System','Live-Chat ist in dieser Ansicht nicht verfügbar. Die KI-Mitspielenden sind trotzdem da. (Live geht für Leute aus eurer Organisation oder per E-Mail-Einladung.)','sys');status();return}
    room.onConnection(c=>{connected=c;status()},err=>{room=null;status()});
    room.onPeers(ch=>{for(const p of ch.left){dropPeer(p.peer)}for(const p of[...ch.joined,...ch.updated]){if(p.isMe&&p.sameTab)continue;onPeer(p)}status()},()=>{room=null;status()});
    addMsg('all','System','Live-Chat verbunden. Alle, die die Seite gerade offen haben, sind auf dem Planeten.','sys')}
  function onPeer(p){const pr=p.presence||{};if(!pr.pid||pr.pid===SAVE.pid)return;let s=peersSeen.get(p.peer);if(!s){s={seen:new Set(),ent:null};peersSeen.set(p.peer,s)}
    s.pid=clean(pr.pid,40);s.nick=clean(pr.n,24)||'Jemand';s.pr=pr;
    /* Chat */for(const m of Array.isArray(pr.c)?pr.c:[]){if(!m||!m.i||s.seen.has(m.i))continue;s.seen.add(m.i);if(Date.now()-(+m.t||0)>120000)continue;const txt=clean(m.m,140);if(!txt)continue;addMsg('all',s.nick,txt,'');if(s.ent)GAME.say(s.ent,txt,4)}
    /* Kunst */if(pr.art&&typeof pr.art==='object'){const a=sanitizeArt({name:clean(pr.art.n,32),by:s.nick,pal:pr.art.pal,px:pr.art.px});if(a)peerArt.set(p.peer,a)}
    /* Figur */const samePlace=pr.pl===MYPLANET.placeId()&&!pr.in&&GAME.mode==='outdoor';if(!samePlace){if(s.ent){GAME.dropEnt(s.ent.d.id);s.ent=null}return}
    const lk=JSON.stringify(pr.lk||'');if(s.ent&&s.lk!==lk){GAME.dropEnt(s.ent.d.id);s.ent=null}
    if(!s.ent){const d=fromLooks(pr.lk||{},s.nick)||randomCyborg(s.nick,7);d.id='peer-'+p.peer;d.name=s.nick;const p0=vec(pr.p);if(!p0)return;s.ent=GAME.makeEnt(d,{kind:'peer',tag:'online',p:p0});s.lk=lk;s.ent.peer=p.peer}
    const e=s.ent;const tp=vec(pr.p),td=vec(pr.d);if(tp)e.tp=tp;if(td)e.td=td;e.tsp=+pr.sp||0;if(pr.em&&pr.emT&&pr.emT!==e.lastEmT){e.lastEmT=pr.emT;if(EMOTES[pr.em])doEmote(e,pr.em,true)}
    /* Freund:innen-Raum */const fr=Array.isArray(pr.fr)?pr.fr:[];const mine=SAVE.friends.find(f=>f.pid===s.pid);if(mine&&fr.includes(SAVE.pid))joinFriend(s.pid,s.nick)}
  const vec=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite)?new V3(a[0],a[1],a[2]).normalize():null;
  function dropPeer(peer){const s=peersSeen.get(peer);if(s&&s.ent)GAME.dropEnt(s.ent.d.id);peersSeen.delete(peer);peerArt.delete(peer)}
  function stepPeer(e,dt){if(e.tp){const a=GAME.angle(e.p,e.tp);if(a>.3/GAME.G.R*40){e.p.copy(e.tp)}else if(a>1e-5){e.p.lerp(e.tp,Math.min(1,dt*8)).normalize()}}if(e.td){e.dir.lerp(e.td,Math.min(1,dt*8));e.dir.copy(GAME.tangentTo(e.p,e.dir))}e.speed=e.tsp||0}
  async function joinFriend(pid,nk){if(!room||frRooms.has(pid))return;const name='fr-'+hashStr([SAVE.pid,pid].sort().join('|'));try{const r=await room.join(name);const entry={room:r,msgs:[],seen:new Set(),nick:nk};frRooms.set(pid,entry);r.presence({c:entry.msgs,mp:MYPLANET.encode()}).catch(()=>{});
      r.onPeers(ch=>{for(const p of[...ch.joined,...ch.updated]){if(p.isMe)continue;if(p.presence&&p.presence.mp)entry.mp=MYPLANET.decode(p.presence.mp);entry.online=true;for(const m of Array.isArray(p.presence.c)?p.presence.c:[]){if(!m||!m.i||entry.seen.has(m.i))continue;entry.seen.add(m.i);if(m.to&&m.to!==SAVE.pid)continue;const t=clean(m.m,140);if(t)addMsg('fr',nk,t,'')}}});
      addMsg('fr','System',`${nk} ist online. Ihr könnt euch jetzt privat schreiben.`,'sys')}catch(e){}}
  /* Präsenz senden */
  function frame(dt,t){if(!viewer)stepBots(dt);if(!room||!connected||viewer)return;presT-=dt;if(presT>0)return;presT=.12;const me=GAME.me;if(!me)return;
    const r3=v=>[+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)];const pr={v:1,pid:SAVE.pid,n:nick(),pl:MYPLANET.placeId(),in:GAME.mode==='interior'?INTERIOR.kind:null,p:r3(me.p),d:r3(me.dir),sp:+(me.speed||0).toFixed(1),lk:looks(S),sb:{cy:clean(S.name,40),g:clean(S.group,40),s:clean(S.statement,200)},c:myMsgs,fr:SAVE.friends.filter(f=>!f.bot).map(f=>f.pid).slice(0,12),em:emote.id,emT:emote.t,art:myArt};
    const s=JSON.stringify(pr);if(s===lastPres)return;if(s.length>3900){pr.art=null}lastPres=s;room.presence(pr).catch(()=>{})}
  function emoteOut(id){emote={id,t:Date.now()};presT=0}
  function publishArt(a){myArt={n:a.name,pal:a.pal,px:a.px};presT=0}
  function onlineArt(){return[...peerArt.values()]}
  /* Beamer: Liste aller Mitspielenden mit Planet, Position und Steckbrief; der Beamer selbst sendet nichts */
  let viewer=false;
  function refresh(){for(const[peer,s]of peersSeen)if(s.pr)onPeer({peer,presence:s.pr})}
  function peers(){return[...peersSeen.values()].filter(s=>s.pr).map(s=>({pid:s.pid,nick:s.nick,pl:s.pr.pl,inside:s.pr.in,p:vec(s.pr.p),lk:s.pr.lk,sb:s.pr.sb||{},ent:s.ent}))}
  function onPlanet(pid){if(viewer){for(const[peer,s]of peersSeen){if(s.ent){GAME.dropEnt(s.ent.d.id);s.ent=null}}return}spawnBots(pid);for(const[peer,s]of peersSeen){if(s.ent){GAME.dropEnt(s.ent.d.id);s.ent=null}}}
  /* Spielerliste / Freund:innen */
  function playersWin(){const w=UI.win('Freund:innen & Mitspielende',{size:'narrow'});const add=(title)=>w.body.append(el('b',null,title));
    add('Gerade hier');const list=el('div','grid');const rows=[];for(const s of peersSeen.values())rows.push({pid:s.pid,nick:s.nick,online:true});for(const b of bots)rows.push({pid:b.d.id,nick:b.d.name,bot:true,ent:b});
    if(!rows.length)w.body.append(el('p','empty','Niemand da.'));rows.forEach(r=>{const isF=SAVE.friends.some(f=>f.pid===r.pid);const c=el('div','card');c.append(el('span',null,r.nick),el('span','sub',r.bot?'KI-Mitspieler:in':'online'));
      const b=btn(isF?'Befreundet':'Freund:in werden','small'+(isF?'':' primary'),()=>{if(isF)return;SAVE.friends.push({pid:r.pid,nick:r.nick,bot:!!r.bot});persist();SND.play('j_success');UI.toast(r.nick+' hinzugefügt'+(r.bot?'':'. Sobald ihr euch beide hinzugefügt habt, geht der private Chat.'));w.close();playersWin()});c.append(b);list.append(c)});w.body.append(list);
    add('Deine Freundesliste');if(!SAVE.friends.length)w.body.append(el('p','empty','Noch leer.'));SAVE.friends.forEach(f=>{const row=el('div','row');row.style.alignItems='center';const fr=frRooms.get(f.pid);row.append(el('span',null,f.nick+(f.bot?' (KI)':'')),...(fr&&fr.mp?[btn('Planet besuchen','small primary',()=>{w.close();MYPLANET.visit(f.pid,f.nick,fr.mp)})]:[]),btn('Entfernen','small danger',()=>{SAVE.friends=SAVE.friends.filter(x=>x!==f);persist();w.close();playersWin()}));w.body.append(row)});
    w.body.append(el('p','note','Privater Chat: Tab «Freund:innen» im Chat. Der Chat ist für alle in eurer Klasse gedacht, bitte freundlich bleiben.'))}
  function brag(kind,def){if(def.rarity>=4&&bots.length){const b=pick(bots);setTimeout(()=>{addMsg('all',b.d.name,pick(['whoa, gratuliere!','omg der ist selten!!','neid!!','nice fang!']),'bot')},1500)}}
  return{peers,refresh,set viewer(v){viewer=!!v;if(v){for(const b of bots)GAME.dropEnt(b.d.id);bots.length=0}},get viewer(){return viewer},get online(){return!!room},connect,frame,stepPeer,toggleChat,botTalk,emote:emoteOut,publishArt,onlineArt,onPlanet,playersWin,brag,addMsg,get bots(){return bots}};
})();
