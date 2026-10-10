/* =====================================================================
   CYBORG-LABOR · net.js · Mehrspieler ohne eigenen Server
   Jeder PC spielt das Spiel selbst. Die Rechner verbinden sich direkt
   miteinander (WebRTC). Nur für das erste Kennenlernen brauchen sie
   öffentliche Vermittler (Nostr-Relays), danach gehen alle Daten direkt
   von PC zu PC. Bibliothek: Trystero (MIT), lokal in js/vendor.

   NET.room() liefert dieselbe Schnittstelle wie die room-Fähigkeit von
   claude.ai (presence, onPeers, peers, onConnection, join, leave).
   Darum laufen social.js und race.js unverändert auf beiden Wegen:
   - in claude.ai: die eingebaute room-Fähigkeit
   - überall sonst: direkte Verbindungen über das Internet

   Wer sich trifft, bestimmt der Mehrspieler-Code (Einstellungen). Gleicher
   Code = gleiche Welt. Der Code verschlüsselt auch das Kennenlernen, so
   finden Fremde ohne Code euch nicht.
   ===================================================================== */
const NET=(()=>{
  const APP='cyborg-labor-wired-1';
  const KEY='cyborg-labor-mp-code';
  const DEFAULT='offen';
  const code=()=>{try{return(localStorage.getItem(KEY)||DEFAULT).trim().toLowerCase().slice(0,40)||DEFAULT}catch(e){return DEFAULT}};
  const setCode=c=>{try{localStorage.setItem(KEY,String(c||'').trim().toLowerCase().slice(0,40)||DEFAULT)}catch(e){}};
  const inClaude=()=>typeof window.claude!=='undefined'&&window.claude&&typeof window.claude.use==='function';
  const p2pOk=()=>typeof RTCPeerConnection!=='undefined'&&typeof TRYSTERO!=='undefined';
  let mode='aus';
  /* Vermittler für das erste Kennenlernen: bekannte, lange laufende Nostr-Relays. Jeder PC fragt alle,
     so treffen sich zwei PCs auch dann, wenn einzelne Relays ausfallen. */
  const RELAYS=['wss://nos.lol','wss://relay.damus.io','wss://relay.primal.net','wss://nostr.mom','wss://nostr.oxtr.dev','wss://cdn.satellite.earth','wss://offchain.pub','wss://relay.nostr.net'];
  /* ---------- ein Raum über direkte Verbindungen ---------- */
  function p2pRoom(name){
    const roomId=code()+(name?'/'+name:'');
    const T=TRYSTERO.joinRoom({appId:APP,password:'cl:'+code(),relayConfig:{urls:RELAYS,redundancy:RELAYS.length}},roomId);
    const pres=T.makeAction('pres');
    const known=new Map();/* peerId → letzte Präsenz */
    let mine=null,peerCbs=[],connCbs=[],closed=false,sent=0,recv=0;
    const fire=ch=>{for(const f of peerCbs){try{f(ch)}catch(e){console.warn('NET',e)}}};
    const MAXB=6000;
    pres.onMessage=(data,ctx)=>{const id=ctx&&ctx.peerId;if(!id||closed)return;recv++;let p=data;if(typeof p==='string'){if(p.length>MAXB)return;try{p=JSON.parse(p)}catch(e){return}}if(!p||typeof p!=='object')return;
      const first=!known.has(id);known.set(id,p);const it={peer:id,presence:p,isMe:false,sameTab:false};fire(first?{joined:[it],updated:[],left:[]}:{joined:[],updated:[it],left:[]})};
    T.onPeerJoin=id=>{if(mine)pres.send(JSON.stringify(mine),{target:id}).catch(()=>{});for(const f of connCbs)try{f(true)}catch(e){}};
    T.onPeerLeave=id=>{if(!known.has(id))return;const p=known.get(id);known.delete(id);fire({joined:[],updated:[],left:[{peer:id,presence:p,isMe:false}]})};
    const api={
      presence(obj){mine=obj;if(closed)return Promise.resolve();let s;try{s=JSON.stringify(obj)}catch(e){return Promise.resolve()}if(s.length>MAXB)return Promise.resolve();sent++;return pres.send(s).catch(()=>{})},
      onPeers(cb){peerCbs.push(cb)},
      onConnection(cb){connCbs.push(cb);setTimeout(()=>{try{cb(true)}catch(e){}},0)},
      peers(){const out=[{peer:TRYSTERO.selfId,presence:mine,isMe:true,sameTab:true}];for(const[id,p]of known)out.push({peer:id,presence:p,isMe:false,sameTab:false});return out},
      async join(sub){return p2pRoom((name?name+'/':'')+sub)},
      async leave(){closed=true;known.clear();try{await T.leave()}catch(e){}},
      get count(){return known.size},
      debug(){let n=0;try{n=Object.keys(T.getPeers()).length}catch(e){}return{room:roomId,rtc:n,known:known.size,sent,recv}},
      emit(){},on(){}};
    return api}
  /* ---------- Einstieg ---------- */
  let main=null;
  async function room(){if(main)return main;
    if(inClaude()){try{const r=await window.claude.use('room');if(r){mode='claude';main=r;return r}}catch(e){}return null}
    if(!p2pOk()||(typeof navigator!=='undefined'&&navigator.onLine===false)){mode='aus';return null}
    try{main=p2pRoom('');mode='p2p';return main}catch(e){console.warn('NET p2p',e);mode='aus';return null}}
  /* neuer Code: alles neu verbinden (social.js holt sich den Raum neu) */
  async function reconnect(c){setCode(c);if(main&&mode==='p2p'){try{await main.leave()}catch(e){}}main=null;if(typeof SOCIAL!=='undefined'&&SOCIAL.reconnect)await SOCIAL.reconnect()}
  try{if(typeof I18N!=='undefined'&&I18N.extend)I18N.extend('en',{"Mehrspieler-Code": "Multiplayer code", "Neuer Mehrspieler-Code": "New multiplayer code", "Als App auf diesem PC installieren": "Install as an app on this PC", "Installiert. Du findest Cyborg-Labor jetzt bei deinen Apps.": "Installed. You can now find Cyborg Lab among your apps.", "Nicht installiert.": "Not installed.", "Alle mit demselben Code spielen zusammen, zum Beispiel eure Klasse. Die PCs verbinden sich direkt über das Internet. Andere Mitspielende sehen dabei die Internet-Adresse deines PCs, so wie bei Videoanrufen. Spielt darum nur mit Leuten, die ihr kennt.": "Everyone with the same code plays together, for example your class. The PCs connect directly over the internet. Other players can see your PC's internet address, just like in video calls. So only play with people you know.", "Keine Internet-Verbindung für den Mehrspieler-Modus. Die KI-Mitspielenden sind trotzdem da.": "No internet connection for multiplayer. The AI players are still here.", "Online über das Internet. Alle mit demselben Mehrspieler-Code sind in derselben Welt.": "Online over the internet. Everyone with the same multiplayer code is in the same world."})}catch(e){}
  return{room,reconnect,code,setCode,get mode(){return mode},DEFAULT,inClaude};
})();
