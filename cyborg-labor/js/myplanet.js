/* =====================================================================
   CYBORG-LABOR · myplanet.js
   Dein eigener kleiner Planet: bekommst du früh von der Bürgermeisterin.
   Er startet als Ödland; mit der Terraform-App (Handy) hebst du Hügel
   und Berge, gräbst Teiche, glättest und malst Landschaften aus allen
   Planeten, die du besucht hast. Bewohner:innen anderer Planeten kannst
   du einladen – sie ziehen mit eigenem Haus bei dir ein.
   ===================================================================== */
const MYPLANET=(()=>{
  const MAXG=12;
  const TOOLS=[
    {id:'huegel',n:'Hügel',i:'leaf',c:'#8FD07A',cost:120,d:'Hebt den Boden um dich herum sanft an.',edit:{dh:2.2,r:5}},
    {id:'berg',n:'Berg',i:'rocket',c:'#A89CC8',cost:320,d:'Ein richtiger Berg zum Hochklettern.',edit:{dh:5.5,r:7.5}},
    {id:'teich',n:'Teich',i:'fish',c:'#7FC8F0',cost:150,d:'Gräbt eine Senke, die sich mit Wasser füllt.',edit:{dh:-3.2,r:4.2}},
    {id:'glatt',n:'Glätten',i:'wave',c:'#E8D8B8',cost:0,d:'Nimmt Hügel und Teiche in deiner Nähe wieder weg.'},
    {id:'biom',n:'Landschaft malen',i:'palette',c:'#FF8FB1',cost:200,d:'Verwandelt die Umgebung in eine Landschaft eines besuchten Planeten.'}];
  /* Landschaften je Planet (werden freigeschaltet, sobald du den Planeten besucht hast) */
  const BIO={kompost:['wiese','blumenfeld','wald','kirschhain','herbstwald'],frost:['schneefeld','tannenwald','polarhuegel'],wueste:['duenen','kakteenfeld','oase'],korallen:['palmenhain','riffstrand'],pilz:['pilzwald','moorwiese','sporensumpf'],schrott:['schrottebene','kristallfeld','gluehwald']};
  const S=()=>SAVE.myPlanet;
  const onMine=()=>GAME.G&&GAME.G.def&&GAME.G.def.mine;
  function applyName(){if(S()&&PLANETS.heim)PLANETS.heim.n=S().name||'Mein Planet'}
  /* ---------- Freischalten (Bürgermeisterin auf dem Kompost-Planeten) ---------- */
  async function offer(who,voice){if(S())return false;
    await UI.talk(who,['Ach, bevor ich es vergesse: Der Rat hat beschlossen, dir etwas zu schenken.','Einen eigenen kleinen Planeten! Noch ist er kahl und staubig – aber du kannst ihn gestalten, wie du willst.','Dein Haus lassen wir gleich hinüberbringen – dort hast du Platz für Anbauten wie eine Sternwarte, ein Gewächshaus oder ein Labor. Und für einen eigenen Tierpark!','Flieg mit deiner Rakete hin. Mit der Terraform-App auf deinem Handy formst du Hügel, Teiche und Landschaften.'],{voice,color:'#B79A6E'});
    const w=UI.win('Wie soll dein Planet heissen?',{size:'narrow'});const inp=el('input');inp.maxLength=20;inp.value='Mein Planet';inp.style.cssText='width:100%;font:inherit;padding:10px;border-radius:12px;border:2px solid var(--line,#e6d8b8)';w.body.append(inp);
    await new Promise(res=>{w.foot.append(btn('Taufen','primary',()=>{const v=String(inp.value||'').replace(/[<>]/g,'').trim().slice(0,20)||'Mein Planet';SAVE.myPlanet={name:v,edits:[],paint:[],guests:[]};applyName();persist();SND.jingle('j_success');w.close();res()}));const iv=setInterval(()=>{if(w.closed){clearInterval(iv);if(!S()){SAVE.myPlanet={name:'Mein Planet',edits:[],paint:[],guests:[]};persist()}res()}},300)});
    UI.toast('„'+S().name+'“ gehört jetzt dir! Die Rakete bringt dich hin.',3600);return true}
  /* ---------- App ---------- */
  function app(){if(!S()){UI.toast('Die Bürgermeisterin im Rathaus hat noch etwas für dich …',3000);return}
    if(visiting){UI.toast('Du bist bei '+visiting.nick+' zu Besuch. Terraformen geht nur auf deinem eigenen Planeten.',3000);return}
    const w=UI.win('Terraform · '+S().name,{size:'wide'});
    if(!onMine()){w.body.append(el('p',null,'Terraforming funktioniert nur auf deinem eigenen Planeten. Flieg mit der Rakete zu „'+S().name+'“.'),el('p','sub','Bewohner:innen: '+S().guests.length+' / '+MAXG+'. Lade Figuren über das Blasen-Menü ein (Mehr → Auf meinen Planeten einladen).'));guestList(w);return}
    w.body.append(el('p',null,'Stell dich an die Stelle, die du verändern willst, und wähle ein Werkzeug. Danach baut sich die Landschaft neu auf.'));const gr=el('div','grid');
    for(const T of TOOLS){const c=el('button','card');c.type='button';const i=el('b');i.innerHTML=ICON(T.i);i.style.cssText='display:grid;place-items:center;width:56px;height:56px;margin:4px auto;border-radius:18px;color:#fff;background:'+T.c;
      c.append(i,el('span',null,T.n),el('span','sub',T.cost?fmt(T.cost)+' Taler':'kostenlos'),el('span','sub',T.d));c.onclick=()=>{w.close();use(T)};gr.append(c)}w.body.append(gr);guestList(w)}
  function guestList(w){const G=S().guests;if(!G.length)return;w.body.append(el('h3',null,'Bewohner:innen'));const gr=el('div','grid');
    for(const d of G){const c=el('div','card');c.append(el('b',null,d.name||'Namenlos'),el('span','sub','kommt von '+((PLANETS[d.from]||{}).n||'weit her')));c.append(btn('Auszug','',()=>{if(!confirm((d.name||'Namenlos')+' soll wieder ausziehen?'))return;S().guests=G.filter(x=>x!==d);persist();w.close();UI.toast((d.name||'Namenlos')+' zieht aus. Beim nächsten Besuch ist das Haus weg.')}));gr.append(c)}w.body.append(gr)}
  function here(){const p=GAME.me.p;return[+p.x.toFixed(5),+p.y.toFixed(5),+p.z.toFixed(5)]}
  function pay(T){if(!T.cost)return true;if(SAVE.money<T.cost){SND.play('error');UI.toast('Dafür brauchst du '+fmt(T.cost)+' Taler.');return false}money(-T.cost);return true}
  function use(T){const d=here();const M=S();
    if(T.id!=='biom'&&T.id!=='glatt'){const V=GAME.me.p;const pl=GAME.G.places.find(q=>!q.pond&&q.build&&GAME.angle(V,q.dir)<q.r*1.6+4/GAME.G.R);if(pl){SND.play('error');UI.toast('Hier ist ein Bauplatz ('+pl.n+'). Geh ein paar Schritte weiter weg.',3000);return}}
    if(T.id==='biom'){const vis=Object.keys(SAVE.visited||{kompost:1});const w=UI.win('Landschaft malen',{size:'wide'});const gr=el('div','grid');
      for(const pid of Object.keys(BIO)){if(!vis.includes(pid))continue;for(const b of BIO[pid]){if(!BIOMES[b])continue;const B=BIOMES[b];const c=el('button','card');c.type='button';const sw=el('div');sw.style.cssText='height:44px;border-radius:12px;margin:4px;background:linear-gradient(135deg,'+B.g[0]+','+(B.g[1]||B.g[0])+')';
        c.append(sw,el('span',null,B.n),el('span','sub',PLANETS[pid].n));c.onclick=()=>{if(!pay(T))return;w.close();M.paint.push({d,r:9,b});if(M.paint.length>160)M.paint.shift();rebuild('Die Landschaft verwandelt sich …')};gr.append(c)}}
      if(!gr.children.length)w.body.append(el('p',null,'Besuch erst andere Planeten, dann kannst du ihre Landschaften hierher holen.'));w.body.append(el('p','sub','Neue Planeten schalten neue Landschaften frei.'),gr);return}
    if(T.id==='glatt'){const V=new THREE.Vector3(...d);const before=M.edits.length;M.edits=M.edits.filter(e=>new THREE.Vector3(...e.d).angleTo(V)*GAME.G.R>7);if(M.edits.length===before){UI.toast('Hier gibt es nichts zu glätten.');return}rebuild('Der Boden wird wieder glatt …');return}
    if(!pay(T))return;M.edits.push({d,r:T.edit.r,dh:T.edit.dh});if(M.edits.length>120)M.edits.shift();
    /* dich ein Stück zur Seite stellen, damit du nicht im Berg oder im Teich stehst */rebuild(T.id==='teich'?'Wasser sprudelt in die Senke …':'Der Boden hebt sich …',T.id!=='huegel')}
  function rebuild(msg,step){persist();SND.play('build');UI.toast(msg,2200);const me=GAME.me;let p=me.p.clone();if(step){const t=GAME.tangentTo(p,new THREE.Vector3(1,0,0));p.addScaledVector(t,(9)/GAME.G.R).normalize()}
    SAVE.lastPos={planet:GAME.G.id,p:[p.x,p.y,p.z]};persist();const go=()=>GAME._load(GAME.G.id).then(()=>{SND.jingle('j_success')});if(GAME.fadeOut)GAME.fadeOut(go);else go()}
  /* ---------- Einladen (aus dem Blasen-Menü) ---------- */
  async function invite(e,voice,nm,col){const M=S();if(!M)return;if(M.guests.length>=MAXG){await UI.talk(nm,['Dein Planet ist schon voll! Vielleicht später.'],{voice:voice(),color:col});return}
    if(M.guests.some(g=>g.src===e.d.id)){await UI.talk(nm,['Ich wohne doch schon bei dir! Naja, ein Teil von mir.'],{voice:voice(),color:col});return}
    const ok=Math.random()<.85;if(!ok){await UI.talk(nm,['Hmm … ich hänge noch an meinem Dorf. Frag mich ein andermal!'],{voice:voice(),color:col});return}
    const d=JSON.parse(JSON.stringify(e.d));d.src=e.d.id;d.id='gast-'+(e.d.id||nm)+'-'+Date.now().toString(36);d.from=GAME.G.id;delete d.life;M.guests.push(d);persist();SND.jingle('j_success');
    await UI.talk(nm,['Auf deinen eigenen Planeten? Wie aufregend!','Ich packe meine Sachen. Wir sehen uns bei „'+M.name+'“!'],{voice:voice(),color:col});UI.toast(nm+' zieht auf „'+M.name+'“ – mit eigenem Haus.',3200)}

  /* ================= Besuch bei Freund:innen (online) =================
     Der eigene Planet wird kompakt in den privaten Freund:innen-Raum gelegt (höchstens ~3 KB):
     Name, letzte Hügel/Teiche, gemalte Landschaften, Hausstil. Wer befreundet ist, kann hinfliegen. */
  let visiting=null;
  const BLIST=[].concat(...Object.values(BIO),['oedland']);
  const HKEYS=['shape','wall','wallCol','roofCol','doorCol','win','chimney','fence','flag','size'];
  const q=v=>Math.round(v*1000);
  function encode(){const M=S();if(!M)return null;const st=(SAVE.house&&SAVE.house.style)||{};const h={};for(const k of HKEYS)if(st[k]!=null)h[k]=st[k];if(st.addons)h.addons=st.addons.slice(0,3);
    return{n:String(M.name||'').slice(0,20),e:M.edits.slice(-50).map(e=>[q(e.d[0]),q(e.d[1]),q(e.d[2]),Math.round(e.r*10),Math.round(e.dh*10)]),p:M.paint.slice(-50).map(x=>[q(x.d[0]),q(x.d[1]),q(x.d[2]),Math.round(x.r),BLIST.indexOf(x.b)]),h}}
  const num=(v,lo,hi)=>typeof v==='number'&&isFinite(v)&&v>=lo&&v<=hi;
  const col=v=>typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v)?v:undefined;
  function decode(o){if(!o||typeof o!=='object')return null;const dir=a=>{const v=new THREE.Vector3(a[0],a[1],a[2]).normalize();return[v.x,v.y,v.z]};
    const edits=(Array.isArray(o.e)?o.e:[]).slice(0,60).filter(a=>Array.isArray(a)&&a.length===5&&a.slice(0,3).every(v=>num(v,-1000,1000))&&num(a[3],10,120)&&num(a[4],-60,60)).map(a=>({d:dir(a),r:a[3]/10,dh:a[4]/10}));
    const paint=(Array.isArray(o.p)?o.p:[]).slice(0,60).filter(a=>Array.isArray(a)&&a.length===5&&a.slice(0,3).every(v=>num(v,-1000,1000))&&num(a[3],1,20)&&num(a[4],0,BLIST.length-1)).map(a=>({d:dir(a),r:a[3],b:BLIST[a[4]]}));
    const hi=o.h&&typeof o.h==='object'?o.h:{};const house={shape:typeof hi.shape==='string'?hi.shape.slice(0,12):undefined,wall:typeof hi.wall==='string'?hi.wall.slice(0,12):undefined,wallCol:col(hi.wallCol),roofCol:col(hi.roofCol),doorCol:col(hi.doorCol),
      win:typeof hi.win==='string'?hi.win.slice(0,12):undefined,chimney:!!hi.chimney,fence:!!hi.fence,flag:!!hi.flag,size:num(hi.size,1,3)?Math.round(hi.size):1,addons:(Array.isArray(hi.addons)?hi.addons:[]).filter(a=>['sternwarte','gewaechshaus','labor'].includes(a))};
    return{name:String(o.n||'Planet').replace(/[<>\u0000-\u001f]/g,'').slice(0,20)||'Planet',edits,paint,guests:[],house}}
  function visit(pid,nick,mp){if(!mp){UI.toast(nick+' hat noch keinen eigenen Planeten.');return}visiting={pid:String(pid),nick:String(nick).slice(0,24),mp,pending:true};PLANETS.heim.n=mp.name+' (bei '+visiting.nick+')';
    UI.toast('Kurs auf „'+mp.name+'“, den Planeten von '+visiting.nick+'!',2600);GAME.travel('heim')}
  function onArrive(pid){if(visiting&&visiting.pending&&pid==='heim'){visiting.pending=false;return}visiting=null;applyName()}
  function placeId(){const id=GAME.G&&GAME.G.id;if(!id||!PLANETS[id]||!PLANETS[id].mine)return id;return id+':'+(visiting?visiting.pid:SAVE.pid)}
  applyName();
  return{offer,app,invite,applyName,onMine,TOOLS,BIO,encode,decode,visit,onArrive,placeId,get visiting(){return visiting}}
})();
