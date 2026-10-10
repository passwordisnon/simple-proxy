/* =====================================================================
   CYBORG-LABOR · myplanet.js
   Dein eigener kleiner Planet: bekommst du früh von der Bürgermeisterin.
   Er startet als Ödland; im Planeten-Labor (Handy-App) wählst du wie im
   Cyborg-Labor fertige Bausteine: Landform, drei Landschaften aus den
   besuchten Planeten, Wasserstand und Himmel. Der Planet baut sich dann neu. Bewohner:innen anderer Planeten kannst
   du einladen – sie ziehen mit eigenem Haus bei dir ein.
   ===================================================================== */
const MYPLANET=(()=>{
  const MAXG=12;
  /* Landschaften je Planet (werden freigeschaltet, sobald du den Planeten besucht hast) */
  const BIO={kompost:['wiese','blumenfeld','wald','kirschhain','herbstwald'],frost:['schneefeld','tannenwald','polarhuegel'],wueste:['duenen','kakteenfeld','oase'],korallen:['palmenhain','riffstrand'],pilz:['pilzwald','moorwiese','sporensumpf'],schrott:['schrottebene','kristallfeld','gluehwald']};
  const S=()=>SAVE.myPlanet;
  const onMine=()=>GAME.G&&GAME.G.def&&GAME.G.def.mine;
  function applyName(){if(S()&&PLANETS.heim)PLANETS.heim.n=S().name||'Mein Planet'}
  /* ---------- Freischalten (Bürgermeisterin auf dem Kompost-Planeten) ---------- */
  async function offer(who,voice){if(S())return false;
    await UI.talk(who,['Ach, bevor ich es vergesse: Der Rat hat beschlossen, dir etwas zu schenken.','Einen eigenen kleinen Planeten! Noch ist er kahl und staubig – aber du kannst ihn gestalten, wie du willst.','Dein Haus lassen wir gleich hinüberbringen – dort hast du Platz für Anbauten wie eine Sternwarte, ein Gewächshaus oder ein Labor. Und für ein eigenes Museum!','Flieg mit deiner Rakete hin. Im Planeten-Labor auf deinem Handy baust du ihn aus fertigen Bausteinen.'],{voice,color:'#B79A6E'});
    const w=UI.win('Wie soll dein Planet heissen?',{size:'narrow'});const inp=el('input');inp.maxLength=20;inp.value='Mein Planet';inp.style.cssText='width:100%;font:inherit;padding:10px;border-radius:12px;border:2px solid var(--line,#e6d8b8)';w.body.append(inp);
    await new Promise(res=>{w.foot.append(btn('Taufen','primary',()=>{const v=String(inp.value||'').replace(/[<>]/g,'').trim().slice(0,20)||'Mein Planet';SAVE.myPlanet={name:v,edits:[],paint:[],guests:[]};applyName();persist();SND.jingle('j_success');w.close();res()}));const iv=setInterval(()=>{if(w.closed){clearInterval(iv);if(!S()){SAVE.myPlanet={name:'Mein Planet',edits:[],paint:[],guests:[]};persist()}res()}},300)});
    UI.toast('„'+S().name+'“ gehört jetzt dir! Die Rakete bringt dich hin.',3600);return true}
  /* ---------- Planeten-Labor (ersetzt das Terraforming) ---------- */
  const LANDS=[['flach','Flachland','Weite, ruhige Wiesen.'],['huegel','Hügelland','Sanfte Hügel zum Spazieren.'],['terrassen','Terrassen','Hohe Stufen wie Reisfelder.'],['berge','Gebirge','Grate und Gipfel zum Klettern.'],['inseln','Inselwelt','Viele kleine Inseln im Meer.'],['krater','Kraterland','Runde Krater wie auf dem Mond.']];
  const WATER=[['wenig','Wenig Wasser'],['normal','Etwas Wasser'],['viel','Viel Wasser']];
  const SKIES={morgen:{n:'Morgenblau',sky:['#a8d8ff','#ffe6f0'],fog:'#d8ecff',weather:'blueten'},abend:{n:'Abendrot',sky:['#ffb38a','#ffe6c8'],fog:'#ffe0c8',weather:'blueten'},
    bonbon:{n:'Bonbon',sky:['#ffb8e0','#c8e8ff'],fog:'#f4dcf0',weather:'blueten'},polar:{n:'Polarlicht',sky:['#3a4a8a','#7affc8'],fog:'#b8d8e8',weather:'schnee'},
    nebel:{n:'Nebelmorgen',sky:['#d8dce8','#f4f0f8'],fog:'#e8eaf0',weather:'regen'},sterne:{n:'Sternenhimmel',sky:['#2a2a5a','#8a7aff'],fog:'#5a5a8a',weather:'blueten'}};
  const DEF={land:'huegel',main:'oedland',second:'oedland',high:'oedland',water:1,sky:'morgen'};
  const lab=()=>Object.assign({},DEF,S()&&S().lab);
  function applySky(){if(!PLANETS.heim)return;const L=lab();const k=SKIES[L.sky]||SKIES.morgen;PLANETS.heim.sky=k.sky.slice();PLANETS.heim.fog=k.fog;PLANETS.heim.weather=k.weather}
  function biomeChoices(){const vis=Object.keys(SAVE.visited||{kompost:1});const out=[['oedland','Ödland',null]];for(const pid of Object.keys(BIO)){if(!vis.includes(pid))continue;for(const b of BIO[pid])if(BIOMES[b]&&!out.some(x=>x[0]===b))out.push([b,BIOMES[b].n,pid])}return out}
  /* kleine Vorschau: Planetenscheibe mit den gewählten Farben */
  function preview(cv,L){const x=cv.getContext('2d'),W=cv.width,H=cv.height,r=W*.44;x.clearRect(0,0,W,H);const k=SKIES[L.sky]||SKIES.morgen;const sg=x.createLinearGradient(0,0,0,H);sg.addColorStop(0,k.sky[0]);sg.addColorStop(1,k.sky[1]);x.fillStyle=sg;x.fillRect(0,0,W,H);
    const col=b=>(BIOMES[b]||BIOMES.oedland).g[0];const wl=[-.35,-.05,.25][L.water]??0;const amp={flach:.25,huegel:.5,terrassen:.7,berge:.8,inseln:.9,krater:.55}[L.land]||.5;
    const img=x.getImageData(0,0,W,H);const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];const C={w:hex(PLANETS.heim.water||'#62CCEA'),a:hex(col(L.main)),b:hex(col(L.second)),c:hex(col(L.high))};
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){const dx=(i-W/2)/r,dy=(j-H/2)/r,d=dx*dx+dy*dy;if(d>1)continue;const z=Math.sqrt(1-d);
      const n=(Math.sin(dx*5.1+z*3.3)+Math.sin(dy*6.7-dx*2.1)+Math.sin((dx+dy)*9.3+z*4.4)*.5)/2.5*amp;let c=n<wl?C.w:n>wl+.45*amp+.12?C.c:(Math.sin(dx*13+dy*7)+Math.sin(dy*11-z*5))>.4?C.b:C.a;
      if(L.land==='krater'&&Math.hypot(dx-.3,dy+.2)<.18)c=C.c;const sh=.55+.45*z;const o=(j*W+i)*4;img.data[o]=c[0]*sh;img.data[o+1]=c[1]*sh;img.data[o+2]=c[2]*sh;img.data[o+3]=255}
    x.putImageData(img,0,0)}
  function app(){if(!S()){UI.toast('Die Bürgermeisterin im Rathaus hat noch etwas für dich …',3000);return}
    if(visiting){UI.toast('Du bist bei '+visiting.nick+' zu Besuch. Das Planeten-Labor gibt es nur für deinen eigenen Planeten.',3000);return}
    const L=lab();const w=UI.win('Planeten-Labor · '+S().name,{size:'wide'});
    const top=el('div');top.style.cssText='display:flex;gap:16px;flex-wrap:wrap;align-items:center';const cv=document.createElement('canvas');cv.width=cv.height=200;cv.style.cssText='width:200px;height:200px;border-radius:24px;box-shadow:var(--gel,0 4px 12px rgba(0,0,0,.2))';
    const info=el('div');info.style.cssText='flex:1;min-width:200px';info.append(el('p',null,'Wähle Bausteine für deinen Planeten, wie im Cyborg-Labor. Mit «Planet bauen» verwandelt er sich.'),el('p','sub','Neue Landschaften schaltest du frei, indem du andere Planeten besuchst.'));top.append(cv,info);w.body.append(top);
    const redraw=()=>preview(cv,L);
    const section=(title,items,key,swatch)=>{w.body.append(el('h3',null,title));const gr=el('div','tiles');gr.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px';
      const btns=[];for(const[val,n,sub]of items){const b=el('button','tile');b.type='button';b.setAttribute('aria-pressed',String(L[key]===val));if(swatch){const sw=el('div');sw.style.cssText='height:40px;border-radius:12px;background:'+swatch(val);b.append(sw)}b.append(el('span','t',n));if(sub)b.append(el('span','ab',sub));
        b.onclick=()=>{L[key]=val;btns.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));redraw();SND.play('select')};btns.push(b);gr.append(b)}w.body.append(gr)};
    const bc=biomeChoices().map(([b,n,pid])=>[b,n,pid?(PLANETS[pid]||{}).n:'']);const bsw=b=>{const B=BIOMES[b]||BIOMES.oedland;return'linear-gradient(135deg,'+B.g[0]+','+(B.g[1]||B.g[0])+')'};
    section('Landform',LANDS.map(([v,n,d])=>[v,n,d]),'land');
    section('Hauptlandschaft',bc,'main',bsw);section('Zweite Landschaft',bc,'second',bsw);section('Höhen',bc,'high',bsw);
    section('Wasser',WATER.map(([v,n],i)=>[i,n]),'water');
    section('Himmel',Object.entries(SKIES).map(([v,k])=>[v,k.n]),'sky',v=>'linear-gradient(180deg,'+SKIES[v].sky[0]+','+SKIES[v].sky[1]+')');
    w.foot.append(btn('Zufall',null,()=>{const pick=a=>a[Math.floor(Math.random()*a.length)];L.land=pick(LANDS)[0];L.main=pick(bc)[0];L.second=pick(bc)[0];L.high=pick(bc)[0];L.water=Math.floor(Math.random()*3);L.sky=pick(Object.keys(SKIES));w.close();S().lab=L;app()}),
      btn('Planet bauen','primary',()=>{S().lab=Object.assign({},L);applySky();w.close();rebuild('Dein Planet verwandelt sich …')}));
    redraw();guestList(w)}
  function guestList(w){const G=S().guests;if(!G.length)return;w.body.append(el('h3',null,'Bewohner:innen'));const gr=el('div','grid');
    for(const d of G){const c=el('div','card');c.append(el('b',null,d.name||'Namenlos'),el('span','sub','kommt von '+((PLANETS[d.from]||{}).n||'weit her')));c.append(btn('Auszug','',()=>{if(!confirm((d.name||'Namenlos')+' soll wieder ausziehen?'))return;S().guests=G.filter(x=>x!==d);persist();w.close();UI.toast((d.name||'Namenlos')+' zieht aus.')}));gr.append(c)}w.body.append(gr)}
  function rebuild(msg){persist();SND.play('build');UI.toast(msg,2200);const me=GAME.me;const p=me.p.clone();SAVE.lastPos={planet:GAME.G.id,p:[p.x,p.y,p.z]};persist();
    if(!onMine()){UI.toast('Beim nächsten Besuch sieht dein Planet so aus.',2600);return}const go=()=>GAME._load(GAME.G.id).then(()=>{SND.jingle('j_success')});if(GAME.fadeOut)GAME.fadeOut(go);else go()}
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
    const L=lab();return{n:String(M.name||'').slice(0,20),l:[L.land,L.main,L.second,L.high,L.water,L.sky],h}}
  const num=(v,lo,hi)=>typeof v==='number'&&isFinite(v)&&v>=lo&&v<=hi;
  const col=v=>typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v)?v:undefined;
  function decode(o){if(!o||typeof o!=='object')return null;const dir=a=>{const v=new THREE.Vector3(a[0],a[1],a[2]).normalize();return[v.x,v.y,v.z]};
    const hi=o.h&&typeof o.h==='object'?o.h:{};const house={shape:typeof hi.shape==='string'?hi.shape.slice(0,12):undefined,wall:typeof hi.wall==='string'?hi.wall.slice(0,12):undefined,wallCol:col(hi.wallCol),roofCol:col(hi.roofCol),doorCol:col(hi.doorCol),
      win:typeof hi.win==='string'?hi.win.slice(0,12):undefined,chimney:!!hi.chimney,fence:!!hi.fence,flag:!!hi.flag,size:num(hi.size,1,3)?Math.round(hi.size):1,addons:(Array.isArray(hi.addons)?hi.addons:[]).filter(a=>['sternwarte','gewaechshaus','labor'].includes(a))};
    const l=Array.isArray(o.l)?o.l:[];const lab={land:LANDS.some(x=>x[0]===l[0])?l[0]:'huegel',main:BLIST.includes(l[1])?l[1]:'oedland',second:BLIST.includes(l[2])?l[2]:'oedland',high:BLIST.includes(l[3])?l[3]:'oedland',water:[0,1,2].includes(l[4])?l[4]:1,sky:SKIES[l[5]]?l[5]:'morgen'};
    return{name:String(o.n||'Planet').replace(/[<>\u0000-\u001f]/g,'').slice(0,20)||'Planet',edits:[],paint:[],lab,guests:[],house}}
  function visit(pid,nick,mp){if(!mp){UI.toast(nick+' hat noch keinen eigenen Planeten.');return}visiting={pid:String(pid),nick:String(nick).slice(0,24),mp,pending:true};PLANETS.heim.n=mp.name+' (bei '+visiting.nick+')';
    /* Himmel des befreundeten Planeten */const k=SKIES[(mp.lab||{}).sky]||SKIES.morgen;PLANETS.heim.sky=k.sky.slice();PLANETS.heim.fog=k.fog;PLANETS.heim.weather=k.weather;
    UI.toast('Kurs auf „'+mp.name+'“, den Planeten von '+visiting.nick+'!',2600);GAME.travel('heim')}
  function onArrive(pid){if(visiting&&visiting.pending&&pid==='heim'){visiting.pending=false;return}visiting=null;applyName();applySky()}
  function placeId(){const id=GAME.G&&GAME.G.id;if(!id||!PLANETS[id]||!PLANETS[id].mine)return id;return id+':'+(visiting?visiting.pid:SAVE.pid)}
  applyName();applySky();
  return{offer,app,invite,applyName,applySky,onMine,BIO,encode,decode,visit,onArrive,placeId,get visiting(){return visiting}}
})();
