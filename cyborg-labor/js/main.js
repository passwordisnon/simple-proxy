/* =====================================================================
   CYBORG-LABOR · main.js
   Start, Tabs, Cy-Phone, Codes (Lehrperson), Einstellungen, Hauptschleife.
   ===================================================================== */
const MAIN=(()=>{
  let tab='lab';let worldReady=false;
  if(matchMedia('(pointer:coarse)').matches)document.body.classList.add('coarse');
  async function setTab(t,opt){opt=opt||{};tab=t;const w=t==='world';document.body.classList.toggle('mode-world',w);$('lab').hidden=w;$('world').hidden=!w;$('tabLab').setAttribute('aria-selected',!w);$('tabWorld').setAttribute('aria-selected',w);SND.init();
    if(w){if(!worldReady){worldReady=true;$('loading').style.opacity='1';$('loading').hidden=false;$('loading').querySelector('span').textContent='Der Planet wird gebaut …';await new Promise(r=>setTimeout(r,60));await GAME.init();SOCIAL.connect();$('loading').style.opacity='0';setTimeout(()=>$('loading').hidden=true,500);if(opt.viewer){/* Beamer: keine Geschichte, kein Tutorial, kein Name */}else if(STORY.needsIntro())STORY.intro().then(()=>{TUT.startWorld();WSTORY.hatch()});else{if(!SAVE.nick)askNick();TUT.startWorld();WSTORY.hatch()}}
      GAME.resize();INTERIOR.resize();SND.music(GAME.mode==='interior'?(INTERIOR.kind==='museum'?'museum':'home'):GAME.G.def.music)}else{LAB.resize();SND.music('lab')}}
  $('tabLab').onclick=()=>setTab('lab');$('tabWorld').onclick=()=>setTab('world');$('btnPlay').onclick=()=>{SND.play('confirm');setTab('world')};
  function askNick(){const w=UI.win('Willkommen auf dem Kompost-Planeten!',{size:'narrow',dismiss:false});w.body.append(el('p',null,'Wie sollen dich die anderen nennen? Der Name steht über deinem Cyborg und im Chat.'));
    const i=el('input');i.type='text';i.id='nickIn';i.maxLength=24;i.value=S.name||'';i.placeholder='z. B. Moos-Mo';w.body.append(i);
    const go=()=>{SAVE.nick=i.value.trim().slice(0,24)||'Gast';persist();w.close();GAME.onAvatarChanged();UI.toast('Hallo '+SAVE.nick+'!');SND.jingle('j_success')};i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')go()});w.foot.append(btn('Los geht\'s','primary',go));setTimeout(()=>i.focus(),50)}
  /* ---------- Cy-Phone ---------- */
  /* GTA-artig: das Handy gleitet unten rechts hoch, das Spiel läuft weiter; Pfeiltasten + Enter, Esc/Tab/Rücktaste steckt es weg */
  let phoneEl=null;
  /* WIRED: Ei-Gerät mit rundem LCD. Apps sitzen auf einem Drehring am Rand, Piko lebt in der Mitte,
     schaut in die Drehrichtung, blinzelt, hüpft und sagt zu jeder App etwas. Drei Gel-Knöpfe: drehen, öffnen, drehen. */
  function phone(note){if(phoneEl){phoneEl.close();return}TUT.ev('phone');const ph=el('div','phone gta egg2');ph.setAttribute('role','dialog');ph.setAttribute('aria-label','Cy-Phone');
    const pid=(GAME.G&&GAME.G.id)||'kompost';const WP={kompost:'#9FE08A',schrott:'#B9A8E8',korallen:'#7FE0F0',frost:'#CFE3FF',wueste:'#FFD39A',pilz:'#B89AE8'}[pid]||(PLANETS[pid]&&PLANETS[pid].phone&&PLANETS[pid].phone[0])||'#C9E5FF';
    const dial=el('div','eg-dial');dial.style.setProperty('--ph-tint',WP);const ring=el('div','eg-ring');const mid=el('div','eg-mid');
    const tm=el('div','eg-time',GAMETIME.str());const info=el('div','eg-info',(GAME.G&&GAME.G.def?GAME.G.def.n.split(' ')[0]:'')+' · '+fmt(SAVE.money)+' T');
    /* Piko als kleine Figur: Körper, zwei Augen, Mund, Antenne, Füsse */
    const pk=el('div','eg-pk');const body=el('span','pk-body');const eyes=el('span','pk-eyes');const eL=el('i'),eR=el('i');eyes.append(eL,eR);const mouth=el('span','pk-mouth');const ant=el('span','pk-ant');
    body.append(ant,eyes,mouth,el('span','pk-cheek l'),el('span','pk-cheek r'));pk.append(body,el('span','pk-feet'));
    const say=el('div','eg-say');say.setAttribute('aria-live','polite');const appName=el('div','eg-app');
    mid.append(tm,pk,say,appName,info);const scan=el('i','eg-scan');dial.append(ring,mid,scan);
    const list=[];const A=(ic,n,bg,fn,line)=>{const b=el('button','eg-ic');b.type='button';const i=el('b');i.innerHTML=ICON(ic);i.style.background=bg;b.append(i);b.setAttribute('aria-label',n);b.title=n;
      const k=list.length;b.onclick=()=>{if(k===cur())openSel();else turnTo(k)};ring.append(b);list.push({b,n,fn,line})};
    A('bag','Tasche','#FFD35C',()=>ACT.bag(),'Was hast du heute gesammelt?');A('book','Lexikon','#7FDCE6',()=>ACT.lexikon(),'Schlagen wir nach, was du gefunden hast?');
    A('paw','Tiere','#A6EBC3',()=>FAUNA.lexikon(),'Tiere! Mein Lieblingsthema.');A('rocket','Reisen','#FFC9A8',()=>UI.toast('Zur Rakete am Dorfrand gehen, um zu reisen.',3000),'Die Rakete wartet am Dorfrand.');
    A('star','Kleider','#F2A8C4',()=>BOUTIQUE.wardrobe(),'Etwas Neues anziehen?');A('palette','Designs','#FF8FB1',designsApp,'Malen wir zusammen?');A('house','Hausbau','#FFB27A',()=>houseBuilder(),'Dein Haus braucht bestimmt noch ein Zimmer.');
    A('coin','Jobs','#FFD35C',()=>JOBS.app(),'Ein bisschen arbeiten, ein paar Taler verdienen.');A('leaf','Terraform','#8FD07A',()=>MYPLANET.app(),'Lass uns deinen Planeten verschönern.');
    A('people','Freunde','#A6EBC3',()=>SOCIAL.playersWin(),'Wer ist gerade da?');A('chat','Chat','#8FD3FF',()=>SOCIAL.toggleChat(true),'Schreib doch jemandem!');A('wave','Emotes','#FFE27A',()=>ACT.emoteMenu(),'Tanzen? Winken? Ich mach mit!');
    A('map','Karte','#9FD86A',mapApp,'Wo sind wir eigentlich?');A('sparkle','Risslinge','#e9e7e4',()=>WSTORY.app(),'Die Risse … mir ist ein bisschen mulmig.');A('globe','Bewohner','#FFC9A8',residentsApp,'Alle Nachbarn auf einen Blick.');
    A('school','Klasse','#D9B5F2',teacherApp,'Das ist für die Lehrperson.');A('gear','Optionen','#DDD3C4',settingsApp,'Ton, Sprache, Grafik.');
    const N=list.length,STEP=360/N;let rot=0;const cur=()=>((rot%N)+N)%N;
    list.forEach((o,i)=>{o.b.style.setProperty('--a',(i*STEP)+'deg');o.b.style.animationDelay=(.25+i*.025)+'s'});
    /* Text tippt sich Buchstabe für Buchstabe; Piko "spricht" dabei */
    let typeT=0;function talk(txt,mood){clearInterval(typeT);if(typeof I18N!=='undefined')txt=I18N.t(txt);say.setAttribute('data-no-i18n','');say.textContent='';let k=0;setMood(mood||'talk');typeT=setInterval(()=>{k++;say.textContent=txt.slice(0,k);if(k%3===0)try{SND.play('click',{vol:.12,rate:2.4+Math.random()*.4})}catch(e){}if(k>=txt.length){clearInterval(typeT);setMood('ok')}},26)}
    function setMood(m){pk.dataset.m=m}
    function layout(){ring.style.setProperty('--rot',(-rot*STEP)+'deg');const c=cur();list.forEach((o,i)=>{let d=Math.abs(i-c);d=Math.min(d,N-d);o.b.style.setProperty('--s',Math.max(.5,1.25-d*.17).toFixed(2));o.b.style.opacity=d>5?.25:1;o.b.classList.toggle('sel',d===0)});appName.textContent=list[c].n}
    function turn(dir){rot+=dir;layout();pk.dataset.look=dir>0?'r':'l';clearTimeout(pk._t);pk._t=setTimeout(()=>pk.dataset.look='',420);SND.play('click',{vol:.3,rate:1.2+(cur()%5)*.08});talk(list[cur()].line)}
    function turnTo(k){let d=k-cur();if(d>N/2)d-=N;if(d<-N/2)d+=N;if(d)turn(d)}
    function openSel(){const o=list[cur()];setMood('happy');o.b.classList.add('go');SND.play('select');setTimeout(()=>{close();setTimeout(o.fn,120)},260)}
    const close=()=>{if(!phoneEl)return;removeEventListener('keydown',kd,true);clearInterval(tick);clearInterval(blink);clearInterval(typeT);ph.classList.add('down');SND.play('close',{vol:.5});const x=ph;setTimeout(()=>x.remove(),260);phoneEl=null};
    /* Gehäuse: Schlüsselring, drei Gel-Knöpfe, seitliche Wegsteck-Taste */
    const loop=el('i','ph-loop');const gb=el('div','eg-btns');
    [['eg-b1','Nach links drehen',()=>turn(-1)],['eg-b2','Öffnen',openSel],['eg-b3','Nach rechts drehen',()=>turn(1)]].forEach(([c,l,f])=>{const b=el('button',c);b.type='button';b.setAttribute('aria-label',l);b.title=l;b.onclick=f;gb.append(b)});
    const side=el('button','eg-side');side.type='button';side.setAttribute('aria-label','Wegstecken');side.title='Wegstecken (Esc)';side.onclick=close;
    ph.append(loop,dial,gb,side);$('world').append(ph);layout();SND.play('open',{vol:.6});
    dial.addEventListener('wheel',e=>{e.preventDefault();turn(e.deltaY>0?1:-1)},{passive:false});
    const greet=()=>{const h=parseInt(GAMETIME.str(),10);return h<10?'Guten Morgen! Wohin geht es heute?':h<17?'Hallo! Dreh am Ring, ich zeig dir alles.':'Schon spät … aber für dich bin ich wach.'};
    setTimeout(()=>{if(typeof note==='string'&&note){ph.classList.add('note');talk(note,'excited')}else talk(greet())},520);
    const tick=setInterval(()=>{tm.textContent=GAMETIME.str()},1000);const blink=setInterval(()=>{pk.classList.add('blink');setTimeout(()=>pk.classList.remove('blink'),140)},2600+Math.random()*1500);
    const kd=e=>{const k=e.key;if(k==='Escape'||k==='Tab'||k==='Backspace'){e.preventDefault();e.stopPropagation();close();return}
      const mv={ArrowRight:1,ArrowLeft:-1,ArrowDown:1,ArrowUp:-1}[k];if(mv!=null){e.preventDefault();e.stopPropagation();turn(mv);return}
      if(k==='Enter'||k===' '){e.preventDefault();e.stopPropagation();openSel()}};addEventListener('keydown',kd,true);
    phoneEl={close}}
  $('hbMenu').onclick=()=>START.menu();$('hbBag').onclick=()=>ACT.bag();$('hbEmote').onclick=()=>ACT.emoteMenu();
  function designsApp(){const w=UI.win('Meine Designs',{size:'narrow'});const gr=el('div','grid');SAVE.designs.forEach(d=>{const c=el('button','card');c.type='button';c.append(designImg(d,96),el('span',null,d.name));c.onclick=()=>{w.close();PAINT.open(d)};gr.append(c)});
    if(!SAVE.designs.length)w.body.append(el('p','empty','Noch keine Designs. Male dein erstes!'));w.body.append(gr);w.foot.append(btn('Neues Design','primary',()=>{w.close();PAINT.open()}))}
  /* Karte: "Nähe" zeigt die Umgebung rund um dich (Norden oben), "Planet" die ganze Nordseite. Häuser sind nur Punkte;
     beschriftet werden wichtige Orte, und nur so viele, wie ohne Überlappung Platz haben. */
  let mapZoom='nah';
  function mapApp(){const w=UI.win('Karte · '+GAME.G.def.n,{size:'narrow'});const S=420,C=S/2,RAD=200;const c=document.createElement('canvas');c.width=c.height=S;c.style.cssText='width:100%;max-width:100%;aspect-ratio:1;border-radius:50%;box-shadow:0 0 0 6px var(--chrome-mid,#cfd6e2),0 0 0 9px #fff;background:'+GAME.G.def.water;w.body.append(c);const x=c.getContext('2d');
    const G_=GAME.G,me=GAME.me;const UPW=new V3(0,1,0);const near=mapZoom==='nah';const range=near?95/G_.R:PI*.62;
    /* Projektion: Mittelpunkt ist du (Nähe) oder der Nordpol (Planet) */
    const ctr=near&&me?me.p.clone().normalize():UPW.clone();let N=near?GAME.tangentTo(ctr,UPW):new V3(0,0,-1);if(!isFinite(N.x)||N.lengthSq()<1e-6)N=GAME.tangentTo(ctr,new V3(1,0,0));N.normalize();const E=new V3().crossVectors(N,ctr).normalize();
    const toXY=q=>{const a=Math.acos(Math.max(-1,Math.min(1,ctr.dot(q))));if(a>range)return null;const t=q.clone().addScaledVector(ctr,-Math.cos(a));if(t.lengthSq()<1e-12)return[C,C];t.normalize();const k=a/range*RAD;return[C+t.dot(E)*k,C-t.dot(N)*k]};
    const img=x.createImageData(S,S);const col=new THREE.Color();const p=new V3();const dir=new V3();
    for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=(i-C)/RAD,v=(j-C)/RAD;const r=Math.hypot(u,v);if(r>1)continue;const a=r*range;dir.copy(E).multiplyScalar(u).addScaledVector(N,-v);if(dir.lengthSq()>1e-12)dir.normalize();p.copy(ctr).multiplyScalar(Math.cos(a)).addScaledVector(dir,Math.sin(a)).normalize();const h=G_.hAt(p);
      col.set(h<G_.sea?G_.def.water:(BIOMES[G_.biomeAt(p,h)]||{g:['#9ED872']}).g[0]);if(h>=G_.sea)col.offsetHSL(0,-.08,Math.min(.1,(h-G_.sea)*.025)+.04);else col.offsetHSL(0,0,.06);if(G_.roadDist(p)<(near?.004:.02)&&h>G_.sea)col.set('#FFE3EC');const k=(j*S+i)*4;img.data[k]=col.r*255;img.data[k+1]=col.g*255;img.data[k+2]=col.b*255;img.data[k+3]=255}x.putImageData(img,0,0);
    /* Orte: Häuser als Punkte, wichtige Orte mit Schild (ohne Überlappung) */
    const pts=[];for(const pl of G_.places){const q=toXY(pl.dir);if(!q)continue;const home=pl.build==='residence'||/^Haus von /.test(pl.n||'');pts.push({pl,q,home,prio:pl.build==='plaza'?0:pl.build&&!home?1:home?3:2})}
    for(const o of pts)if(o.home){x.fillStyle='#fff';x.strokeStyle='#3b3450';x.lineWidth=1.5;x.beginPath();x.arc(o.q[0],o.q[1],near?4:2.5,0,TAU);x.fill();x.stroke()}
    const rects=[];const free=(r)=>rects.every(o=>r[0]>o[2]||r[2]<o[0]||r[1]>o[3]||r[3]<o[1]);x.font='800 13px Nunito, sans-serif';x.textAlign='center';x.lineJoin='round';
    const big=pts.filter(o=>!o.home).sort((a,b)=>a.prio-b.prio);for(const o of big){const[a,b]=o.q;x.fillStyle=o.prio===0?'#ff6fa5':'#2fb5d9';x.strokeStyle='#fff';x.lineWidth=2.5;x.beginPath();x.arc(a,b,near||o.prio!==1?6:3.5,0,TAU);x.fill();x.stroke()}
    for(const o of big){const[a,b]=o.q;/* ganzer Planet: das Dorf bekommt ein Schild, nicht jedes Gebäude */if(!near&&o.prio===1)continue;
      const LBL={museum:'Museum',laden:'Laden',shop:'Laden',bar:'Jazz-Bar',studio:'Farbstudio',rathaus:'Rathaus',garage:'Garage',pflanzen:'Gärtnerei',rakete:'Rakete',rocket:'Rakete',tiere:'Tierladen',praxis:'Praxis',mode:'Boutique',casino:'Spielhalle',post:'Post',house:'Dein Haus',plaza:'Dorfplatz'};const nm=!near&&o.prio===0?'Dorf':(o.pl.n&&o.pl.n!==o.pl.id&&!/^[a-z]+$/.test(o.pl.n))?o.pl.n:(LBL[o.pl.id]||LBL[o.pl.build]||o.pl.n);o.pl._mapN=nm;const tw=x.measureText(nm).width;const r=[a-tw/2-3,b-27,a+tw/2+3,b-9];if(r[0]<6||r[2]>S-6||r[1]<6||!free(r))continue;rects.push(r);x.strokeStyle='#fff';x.lineWidth=4;x.strokeText(nm,a,b-13);x.fillStyle='#3b3450';x.fillText(nm,a,b-13)}
    /* du: roter Pfeil in Blickrichtung */if(me){const q=toXY(me.p.clone().normalize());if(q){const d=me.dir;const ang=Math.atan2(d.dot(E),d.dot(N));x.save();x.translate(q[0],q[1]);x.rotate(ang);x.fillStyle='#F0556E';x.strokeStyle='#fff';x.lineWidth=3;x.beginPath();x.moveTo(0,-11);x.lineTo(8,8);x.lineTo(0,4);x.lineTo(-8,8);x.closePath();x.stroke();x.fill();x.restore()}}
    x.fillStyle='#3b3450';x.font='800 14px Nunito, sans-serif';x.fillText('N',C,22);
    w.body.append(el('p','sub',near?'Deine Umgebung, Norden ist oben. Roter Pfeil: du. Weisse Punkte: Häuser.':'Die ganze Nordseite des Planeten von oben. Roter Pfeil: du.'));
    const sw=btn(near?'Ganzer Planet':'Nähe',null,()=>{mapZoom=near?'planet':'nah';w.close();mapApp()});w.foot.append(sw)}
  function residentsApp(){const w=UI.win('Bewohner:innen',{size:'narrow'});const gr=el('div','grid');allCreatures().forEach(d=>{const c=el('button','card');c.type='button';c.append(UI.creatureThumb(d),el('span',null,d.name||'Namenlos'),el('span','sub',d.group||''));
      const fr=SAVE.friendship[d.id]||0;if(fr)c.append(el('span','badge','♥ '+Math.ceil(fr/10)));c.onclick=()=>{w.close();const e=GAME.ents.get(d.id);const ww=GAME.showCard(d);if(e&&GAME.mode==='outdoor'&&GAME.me){GAME.me.p.copy(GAME.W.near(e.p,.05));UI.toast('Zu '+(d.name||'Namenlos')+' gebeamt')}};gr.append(c)});w.body.append(gr)}
  function teacherApp(){const w=UI.win('Klasse & Codes',{size:'narrow'});w.body.append(el('p',null,'Für die Lehrperson am Beamer: Codes der Gruppen einschleusen, damit alle Cyborgs auf einem Planeten wohnen. Die Welt wird in diesem Browser gespeichert.'));
    w.foot.append(btn(GAME.overview?'Übersicht beenden':'Beamer-Übersicht','sea',()=>{w.close();if(GAME.mode==='outdoor')GAME.toggleOverview();else UI.toast('Geh zuerst nach draussen.')}),btn('Codes einschleusen','primary',()=>{w.close();importCodes()}),btn('Welt sichern',null,()=>{w.close();exportWorld()}),btn(showExamples?'Beispiele ausblenden':'Beispiele zeigen',null,()=>{showExamples=!showExamples;LS.set('cyborg-labor-beispiele',showExamples?'an':'aus');GAME.syncVillagers();w.close()}))}
  function importCodes(){const w=UI.win('Codes einschleusen',{size:'narrow'});w.body.append(el('p',null,'Fügt hier alle Codes ein, die ihr bekommen habt. Mehrere Codes dürfen einfach untereinander stehen.'));const ta=el('textarea');ta.id='importText';ta.rows=8;ta.placeholder='CYB2.eyJ2IjoyLCJpZCI6…';w.body.append(ta);const msg=el('p','sub');w.body.append(msg);
    ta.addEventListener('keydown',e=>e.stopPropagation());
    w.foot.append(btn('Einschleusen','primary',()=>{const list=decodeAll(ta.value);if(!list.length){msg.textContent='Kein gültiger Code gefunden. Codes beginnen mit CYB2. oder CYB1.';SND.play('error');return}let added=0,dup=0;for(const d of list){if(WORLD.some(x=>x.id===d.id)){dup++;continue}WORLD.push(d);added++}saveWorld();GAME.syncVillagers();w.close();SND.jingle('j_release');UI.toast(`${added} ${added===1?'Cyborg':'Cyborgs'} eingeschleust`+(dup?`, ${dup} schon da`:''))}))}
  function exportWorld(){const w=UI.win('Welt sichern',{size:'narrow'});w.body.append(el('p',null,'Alle Cyborgs dieser Welt als Codes. Speichert den Text irgendwo, dann könnt ihr die Welt später wieder einschleusen.'));const ta=el('textarea');ta.rows=8;ta.readOnly=true;ta.id='exportText';ta.value=WORLD.map(encode).join('\n\n');w.body.append(ta);
    const clr=btn('Welt leeren','danger');UI.armed(clr,'Wirklich alle entfernen?',()=>{WORLD=[];saveWorld();GAME.syncVillagers();w.close();UI.toast('Welt geleert')});w.foot.append(btn('Alles kopieren','primary',()=>{ta.select();UI.copy(ta.value,'Alle Codes kopiert',ta)}),clr)}
  function settingsApp(){const w=UI.win('Einstellungen',{size:'narrow'});{const l=el('div','f');l.append(el('span',null,'Sprache'),I18N.picker());w.body.append(l)}const st=SND.st;const sl=(label,k)=>{const l=el('label','f',label);const i=el('input');i.type='range';i.min=0;i.max=1;i.step=.05;i.value=st[k];i.id='vol-'+k;i.oninput=()=>SND.set(k,+i.value);l.append(i);w.body.append(l)};
    sl('Musik','music');sl('Geräusche','sfx');sl('Stimmen','voice');const n=el('label','f','Dein Name');const ni=el('input');ni.type='text';ni.id='setNick';ni.maxLength=24;ni.value=SAVE.nick||'';ni.addEventListener('keydown',e=>e.stopPropagation());ni.onchange=()=>{SAVE.nick=ni.value.trim().slice(0,24)||'Gast';persist();GAME.onAvatarChanged()};n.append(ni);w.body.append(n);
    w.body.append(el('p','sub','Musik: wird im Spiel erzeugt (Klang 2.0). Geräusche: Kenney (CC0). Dein Spielstand liegt nur in diesem Browser.'));
    const rs=btn('Spielstand zurücksetzen','danger');UI.armed(rs,'Wirklich alles löschen?',()=>{LS.set(SAVE_KEY,null);SAVE=newSave();persist();location.reload()});w.foot.append(rs)}
  /* ---------- Kopfzeile ---------- */
  const sb=$('btnSound');const updSound=()=>{sb.setAttribute('aria-pressed',SND.st.on);sb.querySelector('.lb').textContent=SND.st.on?' Ton':' stumm';sb.firstChild.textContent=SND.st.on?'♪':'✕'};updSound();sb.onclick=()=>{SND.init();SND.set('on',!SND.st.on);updSound()};
  const qb=$('btnQual');const updQ=()=>{qb.setAttribute('aria-pressed',HIGH);qb.querySelector('.lb').textContent=HIGH?' Grafik hoch':' Grafik schnell'};updQ();qb.onclick=()=>{HIGH=!HIGH;LS.set('cyborg-labor-grafik',HIGH?'hoch':'schnell');updQ();LAB.quality();if(worldReady)GAME.quality()};
  new ResizeObserver(()=>LAB.resize()).observe($('labStage'));new ResizeObserver(()=>{if(tab==='world'){GAME.resize();INTERIOR.resize()}}).observe($('world'));
  document.addEventListener('pointerdown',()=>SND.init(),{once:true});document.addEventListener('keydown',()=>SND.init(),{once:true});
  /* ---------- Schleife ---------- */
  const clock=new THREE.Clock();let fpsT=0,frames=0;
  function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clock.getDelta());const t=clock.elapsedTime;UI.pumpThumbs();
    try{if(tab==='lab')LAB.frame(dt,t);else if(worldReady){GAME.frame(dt,t);if(typeof PIKO!=='undefined')PIKO.frame(dt,t);if(typeof WSTORY!=='undefined')WSTORY.frame(dt)}}catch(e){console.error(e)}
    /* automatische Qualitätsanpassung bei sehr langsamen Geräten */fpsT+=dt;frames++;if(fpsT>6){const fps=frames/fpsT;fpsT=0;frames=0;if(fps<22&&HIGH&&tab==='world'){HIGH=false;updQ();LAB.quality();GAME.quality();UI.toast('Grafik auf «schnell» gestellt, damit es flüssig läuft.')}}}
  function boot(){renderBody();renderParts();renderCards();renderChecklist();LAB.rebuild();LAB.resize();UI.hud();loop();setTimeout(()=>{$('loading').style.opacity='0';setTimeout(()=>$('loading').hidden=true,500)},250);
    /* Startbildschirm: Spielen (Schüler:innen) oder Beamer-Ansicht (Lehrperson) */START.show()}
  return{setTab,phone,map:()=>mapApp(),settings:settingsApp,importCodes,exportWorld,boot,get tab(){return tab}};
})();
MAIN.boot();
