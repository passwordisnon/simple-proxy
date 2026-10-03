/* =====================================================================
   CYBORG-LABOR · wstory.js
   WIRED-Geschichte, Prolog bis Akt II.
   Prolog "23:59": Piko schlüpft im Ei-Gerät.
   Akt I "Gute Nacht": Alle bereiten jeden Tag dieselbe Silvesterparty vor;
   Piko bemerkt kleine Merkwürdigkeiten.
   Akt II "Risslinge": In den Rissen der Welt erscheinen Glitch-Wesen.
   Wer eines fängt, sieht kurz die Riss-Ebene und eine Erinnerung an einen
   echten Morgen. Jeder Fang lässt die Musik ein wenig mehr zerfallen.
   Der Beamer gehört nicht zur Geschichte.
   ===================================================================== */
const WSTORY=(()=>{
  const RISS=[
    {id:'zwilling',n:'Zwilling',mem:'Zwei Zahnbürsten im Becher. Eine ist deine.',glitch:'Doppelter Körper'},
    {id:'bergbrecher',n:'Bergbrecher',mem:'Der Motor des Schulbusses brummt vor dem Haus.',glitch:'Berg mitten auf dem Weg'},
    {id:'schwebling',n:'Schwebling',mem:'Der Vorhang bewegt sich in der Morgenluft.',glitch:'Schwebende Dinge'},
    {id:'echo',n:'Echo',mem:'Ein Radio-Jingle: «Guten Morgen! Es ist sieben Uhr.»',glitch:'Wiederholter Satz'},
    {id:'zeichensalat',n:'Zeichensalat',mem:'Buchstaben auf einer Müslipackung, ganz nah vor deinen Augen.',glitch:'Kaputte Schrift'},
    {id:'durchgaenger',n:'Durchgänger',mem:'Schritte auf der Treppe. Jemand kommt nach oben.',glitch:'Durch Wände laufen'},
    {id:'standbild',n:'Standbild',mem:'KLACK. Der Toaster springt hoch.',glitch:'Eingefrorenes Bild'},
    {id:'rauschen',n:'Rauschen',mem:'Jemand ruft deinen Namen: «Aufstehen!»',glitch:'Bildrauschen'},
    {id:'fehldruck',n:'Fehldruck',mem:'Kakao-Duft zieht aus der Küche herauf.',glitch:'Falsche Farben'},
    {id:'knick',n:'Knick',mem:'Ein Wecker, der nicht aufhört zu klingeln.',glitch:'Geknickte Formen'},
    {id:'einbrenner',n:'Einbrenner',mem:'Sonnenlicht fällt warm auf die Bettdecke.',glitch:'Eingebranntes Bild'},
    {id:'wabenfehler',n:'Wabenfehler',mem:'Draussen bellt ein Hund im frischen Schnee.',glitch:'Falsches Muster'}];
  const S=()=>{SAVE.wired=SAVE.wired||{act:0,caught:[],seen:{},t:0};return SAVE.wired};
  const act=()=>S().act||0;
  /* ---------- Prolog: Piko schlüpft ---------- */
  async function hatch(){const s=S();if(s.act>=1)return;s.act=1;s.t=0;persist();
    await new Promise(r=>setTimeout(r,1200));
    if(typeof PIKO!=='undefined')PIKO.want('PIKO HIER! Ich bin aus dem Ei geschlüpft. Ich wohne jetzt in deinem Cy-Phone.');
    UI.toast('Ein Ei am linken Rand wackelt …',3200);persist()}
  /* ---------- Akt I: kleine Merkwürdigkeiten ---------- */
  const ODD=['Komisch: Mein Kalender blättert nicht um. Es ist immer noch der 31.12.1999.','Alle sagen, das Feuerwerk ist «fast fertig». Das haben sie gestern auch gesagt.','Hast du gehört? Die Bürgermeisterin hat denselben Witz zweimal erzählt. Wort für Wort.','Die Uhren im Dorf zeigen alle 23:59. Meine auch.','Ich habe nachgezählt: Das ist die dritte Silvesterparty, die wir vorbereiten.'];
  /* ---------- Akt II: Risslinge ---------- */
  let ent=null;
  function pickFor(pid){const s=S();const i=hashNum(pid)%RISS.length;const free=RISS.filter(r=>!s.caught.includes(r.id));if(!free.length)return null;return free.find(r=>RISS.indexOf(r)===i)||free[hashNum(pid+'x')%free.length]}
  function model(){const M=makeMats({skin:'plastik',color:0});const g=new THREE.Group();const core=new THREE.Group();g.add(core);
    P(core,G.bx(.5,.5,.5,.12),M.c('#f7f6f4',{rim:1}),[0,0,0]);[[-.11,.06],[.11,.06]].forEach(([x,y])=>P(core,G.bx(.07,.11,.02),M.flat('#141414'),[x,y,.26]));
    const red=P(g,G.bx(.5,.5,.5,.12),new THREE.MeshBasicMaterial({color:'#c8102e',transparent:true,opacity:.45,depthWrite:false}),[-.06,0,0]);
    const cyan=P(g,G.bx(.5,.5,.5,.12),new THREE.MeshBasicMaterial({color:'#45e0ff',transparent:true,opacity:.4,depthWrite:false}),[.06,0,0]);
    g.traverse(o=>{if(o.isMesh)o.userData.noOutline=true});g.userData.parts={core,red,cyan};return g}
  function spawn(){if(ent||act()<2||typeof GAME==='undefined'||!GAME.G||GAME.G.def.mine||GAME.viewer)return;const r=pickFor(GAME.G.id);if(!r)return;
    const me=GAME.me;if(!me)return;const rnd=srand(hashNum(GAME.G.id+r.id));let p=null;for(let i=0;i<300&&!p;i++){const q=GAME.randAround(rnd,18+i*.12,me.p);if(q&&GAME.isLand(q)&&!GAME.nearPlace(q,.9)&&GAME.angle(q,me.p)*GAME.G.R>7)p=q}if(!p)return;
    const g=model();GAME.placeObj(g,p,0,.9,true);GAME.G.scene.add(g);const it={kind:'riss',p,r:1.8,label:'Den Rissling vorsichtig fangen',act:()=>catchIt()};GAME.G.inter.push(it);ent={g,p,r,it,t0:performance.now()};
    if(typeof PIKO!=='undefined')PIKO.want('Da flackert etwas! Ein … Riss? Lass ihn uns vorsichtig fangen.')}
  function despawn(){if(!ent)return;ent.g.parent&&ent.g.parent.remove(ent.g);const i=GAME.G.inter.indexOf(ent.it);if(i>=0)GAME.G.inter.splice(i,1);ent=null}
  async function catchIt(){if(!ent)return;const r=ent.r;const s=S();if(!s.caught.includes(r.id))s.caught.push(r.id);persist();despawn();try{SND.play('powerup',{vol:.6})}catch(e){}
    await rissScene(r);MUSIC2&&MUSIC2.setRiss(Math.min(.6,s.caught.length/RISS.length*.6));
    if(typeof PIKO!=='undefined')PIKO.want(s.caught.length===1?'Hast du das auch gesehen? Alles war plötzlich grau … und es roch nach Frühstück.':'Rissling Nr. '+s.caught.length+'. Jeder trägt ein Stück von einem echten Morgen.')}
  /* ---------- Riss-Szene: Farben weg, Stromleitungen, Brummen, eine Erinnerung ---------- */
  function rissScene(r){return new Promise(res=>{const prev=MUSIC2&&MUSIC2.style;if(typeof MUSIC2!=='undefined')MUSIC2.play('riss','riss-'+r.id);
    const o=el('div','riss-scene');o.setAttribute('role','dialog');o.setAttribute('aria-label','Riss');
    o.innerHTML='<svg class="riss-wires" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M0 120 Q250 175 500 125 T1000 130"/><path d="M0 150 Q250 210 500 160 T1000 165"/><path d="M120 0 V600"/><path d="M880 0 V600"/><path d="M100 70 H140 M860 70 H900"/></svg><i class="tear t1"></i><i class="tear t2"></i>';
    const box=el('div','riss-box');box.append(el('p','riss-name',r.n),el('p','riss-mem','«'+r.mem+'»'),el('p','riss-ask','Riecht es hier nach Frühstück?'));const go=btn('Weiter','primary',()=>close());box.append(go);o.append(box);document.body.append(o);setTimeout(()=>go.focus(),60);
    const kd=e=>{if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();e.stopPropagation();close()}};addEventListener('keydown',kd,true);
    function close(){removeEventListener('keydown',kd,true);o.classList.add('out');setTimeout(()=>o.remove(),350);try{SND.music(GAME.mode==='interior'?'home':(GAME.G.def.music||'world'))}catch(e){}res()}})}
  /* ---------- Sammelbuch im Cy-Phone ---------- */
  function app(){const s=S();const w=UI.win('Risslinge',{size:'narrow'});w.body.append(el('p','sub',s.caught.length+' von '+RISS.length+' gefunden. Jeder Rissling trägt eine Erinnerung an einen echten Morgen.'));
    const gr=el('div','grid');for(const r of RISS){const got=s.caught.includes(r.id);const c=el('div','card'+(got?'':' off'));c.append(el('b',null,got?r.n:'???'),el('span','sub',got?'«'+r.mem+'»':r.glitch));gr.append(c)}w.body.append(gr)}
  /* ---------- Ablauf ---------- */
  let oddT=90,spawnT=6;
  function frame(dt){if(typeof GAME==='undefined'||!GAME.G||GAME.viewer||GAME.mode!=='outdoor')return;const s=S();if(s.act<1)return;s.t=(s.t||0)+dt;
    if(s.act===1){oddT-=dt;if(oddT<=0){oddT=120+Math.random()*60;const i=(s.odd||0)%ODD.length;s.odd=(s.odd||0)+1;if(typeof PIKO!=='undefined')PIKO.want(ODD[i]);persist()}
      /* nach rund 6 Spielminuten und zwei Merkwürdigkeiten beginnt Akt II */if(s.t>360&&(s.odd||0)>=2){s.act=2;persist();spawnT=4;if(typeof PIKO!=='undefined')PIKO.want('Hörst du das Summen? Irgendwo in der Welt ist ein Riss.')}}
    if(s.act>=2){if(!ent){spawnT-=dt;if(spawnT<=0){spawnT=40;spawn()}}else{const P_=ent.g.userData.parts;const t=performance.now()/1000;const fl=Math.random()<.06;ent.g.visible=!fl;
      P_.red.position.x=-.06-Math.sin(t*9)*.04;P_.cyan.position.x=.06+Math.sin(t*7)*.04;P_.core.rotation.y=Math.sin(t*2)*.4;ent.g.position.copy(GAME.onSurf(ent.p,.9+Math.sin(t*2.2)*.12))}}}
  function onPlanet(){ent=null;spawnT=6}
  /* gespeicherten Zerfall der Musik wiederherstellen */
  setTimeout(()=>{try{const s=S();if(typeof MUSIC2!=='undefined'&&s.caught.length)MUSIC2.setRiss(Math.min(.6,s.caught.length/RISS.length*.6))}catch(e){}},500);
  return{_spawn:()=>spawn(),hatch,frame,onPlanet,app,catchIt,rissScene,RISS,get act(){return act()},setAct:a=>{S().act=a;persist()}};
})();
