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
  /* Eine Rissling-Familie je Planet (pl), dazu «Überall» für die kleinen Monde. look: Form (sh) und Bewegung (a) */
  const RISS=[
    {id:'zwilling',n:'Zwilling',mem:'Zwei Zahnbürsten im Becher. Eine ist deine.',glitch:'Doppelter Körper',pl:'kompost',look:{sh:'twin',a:'jitter'}},
    {id:'bergbrecher',n:'Bergbrecher',mem:'Der Motor des Schulbusses brummt vor dem Haus.',glitch:'Berg mitten auf dem Weg',pl:'schrott',look:{sh:'tall',a:'pulse',c:'#c8c8d8'}},
    {id:'schwebling',n:'Schwebling',mem:'Der Vorhang bewegt sich in der Morgenluft.',glitch:'Schwebende Dinge',pl:'wolkenarchipel',look:{sh:'ball',a:'float'}},
    {id:'echo',n:'Echo',mem:'Ein Radio-Jingle: «Guten Morgen! Es ist sieben Uhr.»',glitch:'Wiederholter Satz',pl:'klang',look:{sh:'box',a:'echo'}},
    {id:'zeichensalat',n:'Zeichensalat',mem:'Buchstaben auf einer Müslipackung, ganz nah vor deinen Augen.',glitch:'Kaputte Schrift',pl:'bibliothek',look:{sh:'flat',a:'spin',c:'#fff4d0'}},
    {id:'durchgaenger',n:'Durchgänger',mem:'Schritte auf der Treppe. Jemand kommt nach oben.',glitch:'Durch Wände laufen',pl:'metro',look:{sh:'box',a:'fade'}},
    {id:'standbild',n:'Standbild',mem:'KLACK. Der Toaster springt hoch.',glitch:'Eingefrorenes Bild',pl:'schoner',look:{sh:'box',a:'freeze'}},
    {id:'rauschen',n:'Rauschen',mem:'Jemand ruft deinen Namen: «Aufstehen!»',glitch:'Bildrauschen',pl:'funkturm',look:{sh:'ball',a:'jitter',c:'#d8d8e0'}},
    {id:'fehldruck',n:'Fehldruck',mem:'Kakao-Duft zieht aus der Küche herauf.',glitch:'Falsche Farben',pl:'origami',look:{sh:'flat',a:'spin',c:'#ff8fb8'}},
    {id:'knick',n:'Knick',mem:'Ein Wecker, der nicht aufhört zu klingeln.',glitch:'Geknickte Formen',pl:'bauklotz',look:{sh:'tall',a:'tilt'}},
    {id:'einbrenner',n:'Einbrenner',mem:'Sonnenlicht fällt warm auf die Bettdecke.',glitch:'Eingebranntes Bild',pl:'neonarkade',look:{sh:'box',a:'pulse',c:'#c8ffd8'}},
    {id:'wabenfehler',n:'Wabenfehler',mem:'Draussen bellt ein Hund im frischen Schnee.',glitch:'Falsches Muster',pl:'honigwabe',look:{sh:'hex',a:'spin',c:'#ffe8a0'}},
    {id:'spiegelpfuetze',n:'Spiegelpfütze',mem:'Wasser rauscht im Badezimmer. Jemand putzt sich die Zähne.',glitch:'Gespiegelte Welt',pl:'korallen',look:{sh:'flat',a:'mirror',c:'#bfeaff'}},
    {id:'frostbild',n:'Frostbild',mem:'Eisblumen am Fenster. Du malst mit dem Finger ein Herz hinein.',glitch:'Erstarrte Bewegung',pl:'frost',look:{sh:'box',a:'freeze',c:'#dff4ff'}},
    {id:'flimmerling',n:'Flimmerling',mem:'Die Heizung knackt und wird langsam warm.',glitch:'Flimmernde Luft',pl:'wueste',look:{sh:'ball',a:'shimmer',c:'#fff0c8'}},
    {id:'sporenstau',n:'Sporenstau',mem:'Unter der Decke ist es dunkel und warm. Nur noch fünf Minuten.',glitch:'Verschwommene Ränder',pl:'pilz',look:{sh:'ball',a:'pulse',c:'#e8d8ff'}},
    {id:'ruckler',n:'Ruckler',mem:'Auf dem Nachttisch steht ein Plastik-Dino. Er schaut dich an.',glitch:'Ruckelnde Bewegung',pl:'urzeit',look:{sh:'tall',a:'stutter',c:'#e8f0c8'}},
    {id:'wucherer',n:'Wucherer',mem:'Die Zimmerpflanze am Fenster wirft einen Schatten aufs Kissen.',glitch:'Wachsende Kanten',pl:'dschungel',look:{sh:'box',a:'grow',c:'#d8ffd0'}},
    {id:'massstabler',n:'Massstabler',mem:'Dein Kuscheltier liegt auf dem Boden. Es ist in der Nacht hinausgefallen.',glitch:'Falsche Grösse',pl:'riesengarten',look:{sh:'box',a:'grow'}},
    {id:'zeitsprung',n:'Zeitsprung',mem:'Die Wanduhr im Flur tickt. Gleich zehn nach sieben.',glitch:'Springende Uhr',pl:'uhrwerk',look:{sh:'flat',a:'stutter',c:'#fff8e8'}},
    {id:'flusenfeld',n:'Flusenfeld',mem:'Die Decke riecht nach Waschmittel und ein bisschen nach dir.',glitch:'Fusselige Kanten',pl:'pluesch',look:{sh:'ball',a:'jitter',c:'#ffe0f0'}},
    {id:'einschluss',n:'Einschluss',mem:'Durchs Fenster fällt ein goldener Streifen auf den Teppich.',glitch:'Eingeschlossenes Bild',pl:'bernstein',look:{sh:'box',a:'freeze',c:'#ffd890'}},
    {id:'bauteilfehler',n:'Bauteilfehler',mem:'Unten klappert jemand mit Tellern und Löffeln.',glitch:'Fehlende Teile',pl:'dinofabrik',look:{sh:'twin',a:'fade',c:'#d8e0e8'}},
    {id:'preisfehler',n:'Preisfehler',mem:'Auf dem Küchentisch liegt ein Einkaufszettel: Milch, Brot, Bananen.',glitch:'Doppelte Schilder',pl:'kaufhaus',look:{sh:'twin',a:'echo',c:'#ffe0e8'}},
    {id:'polsprung',n:'Polsprung',mem:'Draussen fährt die Strassenbahn vorbei. Die Scheibe klirrt leise.',glitch:'Umgedrehte Schwerkraft',pl:'magnetbahn',look:{sh:'tall',a:'flip',c:'#ffd0d8'}},
    {id:'ueberlaeufer',n:'Pufferüberlauf',mem:'Der Computer im Flur summt. Jemand hat ihn über Nacht angelassen.',glitch:'Überlaufende Dinge',pl:'rechenzentrum',look:{sh:'box',a:'grow',c:'#c8ffe8'}},
    {id:'tiefenrausch',n:'Tiefenrausch',mem:'Im Wohnzimmer blubbert die Pumpe im Aquarium.',glitch:'Dunkle Ecken',pl:'tiefsee',look:{sh:'ball',a:'float',c:'#9ab8e8'}},
    {id:'windleck',n:'Windleck',mem:'Der Wind pfeift leise durch den Fensterspalt.',glitch:'Wehende Dinge',pl:'wetterwerk',look:{sh:'flat',a:'tilt',c:'#e8f8ff'}},
    {id:'nachtlicht',n:'Nachtlicht',mem:'Das Nachtlicht in der Steckdose leuchtet noch.',glitch:'Zu dunkle Farben',pl:'nachtmarkt',look:{sh:'ball',a:'pulse',c:'#b8b0e8'}},
    {id:'ueberall',n:'Überall',mem:'Eine Stimme ganz nah: «Frohes neues Jahr, Schlafmütze!»',glitch:'Alles zugleich',pl:'',look:{sh:'hex',a:'echo',c:'#ffffff'}}];
  /* Englisch für die neuen Familien */
  try{if(typeof I18N!=='undefined'&&I18N.extend)I18N.extend('en',{"Spiegelpfütze": "Mirror Puddle", "Wasser rauscht im Badezimmer. Jemand putzt sich die Zähne.": "Water is running in the bathroom. Someone is brushing their teeth.", "Gespiegelte Welt": "Mirrored world", "Frostbild": "Frost Frame", "Eisblumen am Fenster. Du malst mit dem Finger ein Herz hinein.": "Frost flowers on the window. You draw a heart in them with your finger.", "Erstarrte Bewegung": "Frozen movement", "Flimmerling": "Shimmerling", "Die Heizung knackt und wird langsam warm.": "The radiator clicks and slowly gets warm.", "Flimmernde Luft": "Shimmering air", "Sporenstau": "Spore Jam", "Unter der Decke ist es dunkel und warm. Nur noch fünf Minuten.": "Under the duvet it is dark and warm. Just five more minutes.", "Verschwommene Ränder": "Blurry edges", "Ruckler": "Stutter", "Auf dem Nachttisch steht ein Plastik-Dino. Er schaut dich an.": "A plastic dino stands on the bedside table. It is looking at you.", "Ruckelnde Bewegung": "Jerky movement", "Wucherer": "Overgrower", "Die Zimmerpflanze am Fenster wirft einen Schatten aufs Kissen.": "The houseplant by the window casts a shadow on the pillow.", "Wachsende Kanten": "Growing edges", "Massstabler": "Scaler", "Dein Kuscheltier liegt auf dem Boden. Es ist in der Nacht hinausgefallen.": "Your cuddly toy is lying on the floor. It fell out during the night.", "Falsche Grösse": "Wrong size", "Zeitsprung": "Time Skip", "Die Wanduhr im Flur tickt. Gleich zehn nach sieben.": "The clock in the hall is ticking. Almost ten past seven.", "Springende Uhr": "Jumping clock", "Flusenfeld": "Fluff Field", "Die Decke riecht nach Waschmittel und ein bisschen nach dir.": "The duvet smells of washing powder and a little bit of you.", "Fusselige Kanten": "Fuzzy edges", "Einschluss": "Inclusion", "Durchs Fenster fällt ein goldener Streifen auf den Teppich.": "A golden stripe of light falls through the window onto the carpet.", "Eingeschlossenes Bild": "Trapped picture", "Bauteilfehler": "Missing Part", "Unten klappert jemand mit Tellern und Löffeln.": "Downstairs someone is clattering plates and spoons.", "Fehlende Teile": "Missing pieces", "Preisfehler": "Price Glitch", "Auf dem Küchentisch liegt ein Einkaufszettel: Milch, Brot, Bananen.": "There is a shopping list on the kitchen table: milk, bread, bananas.", "Doppelte Schilder": "Doubled signs", "Polsprung": "Pole Flip", "Draussen fährt die Strassenbahn vorbei. Die Scheibe klirrt leise.": "Outside, the tram goes by. The window rattles softly.", "Umgedrehte Schwerkraft": "Upside-down gravity", "Pufferüberlauf": "Buffer Overflow", "Der Computer im Flur summt. Jemand hat ihn über Nacht angelassen.": "The computer in the hall is humming. Someone left it on overnight.", "Überlaufende Dinge": "Overflowing things", "Tiefenrausch": "Depth Daze", "Im Wohnzimmer blubbert die Pumpe im Aquarium.": "In the living room, the aquarium pump is bubbling.", "Dunkle Ecken": "Dark corners", "Windleck": "Wind Leak", "Der Wind pfeift leise durch den Fensterspalt.": "The wind whistles softly through the gap in the window.", "Wehende Dinge": "Blowing things", "Nachtlicht": "Night Light", "Das Nachtlicht in der Steckdose leuchtet noch.": "The night light in the socket is still glowing.", "Zu dunkle Farben": "Colours too dark", "Überall": "Everywhere", "Eine Stimme ganz nah: «Frohes neues Jahr, Schlafmütze!»": "A voice very close: «Happy New Year, sleepyhead!»", "Alles zugleich": "Everything at once", "«Wasser rauscht im Badezimmer. Jemand putzt sich die Zähne.»": "«Water is running in the bathroom. Someone is brushing their teeth.»", "«Eisblumen am Fenster. Du malst mit dem Finger ein Herz hinein.»": "«Frost flowers on the window. You draw a heart in them with your finger.»", "«Die Heizung knackt und wird langsam warm.»": "«The radiator clicks and slowly gets warm.»", "«Unter der Decke ist es dunkel und warm. Nur noch fünf Minuten.»": "«Under the duvet it is dark and warm. Just five more minutes.»", "«Auf dem Nachttisch steht ein Plastik-Dino. Er schaut dich an.»": "«A plastic dino stands on the bedside table. It is looking at you.»", "«Die Zimmerpflanze am Fenster wirft einen Schatten aufs Kissen.»": "«The houseplant by the window casts a shadow on the pillow.»", "«Dein Kuscheltier liegt auf dem Boden. Es ist in der Nacht hinausgefallen.»": "«Your cuddly toy is lying on the floor. It fell out during the night.»", "«Die Wanduhr im Flur tickt. Gleich zehn nach sieben.»": "«The clock in the hall is ticking. Almost ten past seven.»", "«Die Decke riecht nach Waschmittel und ein bisschen nach dir.»": "«The duvet smells of washing powder and a little bit of you.»", "«Durchs Fenster fällt ein goldener Streifen auf den Teppich.»": "«A golden stripe of light falls through the window onto the carpet.»", "«Unten klappert jemand mit Tellern und Löffeln.»": "«Downstairs someone is clattering plates and spoons.»", "«Auf dem Küchentisch liegt ein Einkaufszettel: Milch, Brot, Bananen.»": "«There is a shopping list on the kitchen table: milk, bread, bananas.»", "«Draussen fährt die Strassenbahn vorbei. Die Scheibe klirrt leise.»": "«Outside, the tram goes by. The window rattles softly.»", "«Der Computer im Flur summt. Jemand hat ihn über Nacht angelassen.»": "«The computer in the hall is humming. Someone left it on overnight.»", "«Im Wohnzimmer blubbert die Pumpe im Aquarium.»": "«In the living room, the aquarium pump is bubbling.»", "«Der Wind pfeift leise durch den Fensterspalt.»": "«The wind whistles softly through the gap in the window.»", "«Das Nachtlicht in der Steckdose leuchtet noch.»": "«The night light in the socket is still glowing.»", "«Eine Stimme ganz nah: «Frohes neues Jahr, Schlafmütze!»»": "«A voice very close: «Happy New Year, sleepyhead!»»"})}catch(e){}
  const S=()=>{SAVE.wired=SAVE.wired||{act:0,caught:[],seen:{},t:0};return SAVE.wired};
  const act=()=>S().act||0;
  /* ---------- Prolog: Piko schlüpft ---------- */
  async function hatch(){const s=S();if(s.act>=1)return;s.act=1;s.t=0;persist();
    await new Promise(r=>setTimeout(r,1200));
    if(typeof PIKO!=='undefined')PIKO.want('PIKO HIER! Ich bin aus dem Ei geschlüpft. Ich wohne jetzt in deinem Cy-Phone.');
    UI.toast('Ein Ei am rechten Rand wackelt …',3200);persist()}
  /* ---------- Akt I: kleine Merkwürdigkeiten ---------- */
  const ODD=['Komisch: Mein Kalender blättert nicht um. Es ist immer noch der 31.12.1999.','Alle sagen, das Feuerwerk ist «fast fertig». Das haben sie gestern auch gesagt.','Hast du gehört? Die Bürgermeisterin hat denselben Witz zweimal erzählt. Wort für Wort.','Die Uhren im Dorf zeigen alle 23:59. Meine auch.','Ich habe nachgezählt: Das ist die dritte Silvesterparty, die wir vorbereiten.'];
  /* ---------- Akt II: Risslinge ---------- */
  let ent=null;
  function pickFor(pid){const s=S();const free=RISS.filter(r=>!s.caught.includes(r.id));if(!free.length)return null;const own=free.find(r=>r.pl===pid);if(own)return own;
    /* Planeten ohne eigene Familie (kleine Monde) oder schon gefangen: zuerst «Überall», dann eine Familie, deren Planet keine eigene mehr hat */const wild=free.find(r=>!r.pl);if(wild&&!RISS.some(r=>r.pl===pid))return wild;return null}
  function body(L){const sh=L&&L.sh;return sh==='ball'?G.s(.3):sh==='tall'?G.bx(.4,.75,.4,.1):sh==='flat'?G.bx(.6,.45,.18,.06):sh==='hex'?G.cy(.32,.32,.45,6):G.bx(.5,.5,.5,.12)}
  function model(r){const L=(r&&r.look)||{};const M=makeMats({skin:'plastik',color:0});const g=new THREE.Group();const core=new THREE.Group();g.add(core);const geo=body(L);const fz=L.sh==='flat'?.1:L.sh==='ball'?.29:L.sh==='tall'?.22:L.sh==='hex'?.29:.26;
    P(core,geo,M.c(L.c||'#f7f6f4',{rim:1}),[0,0,0]);[[-.11,.06],[.11,.06]].forEach(([x,y])=>P(core,G.bx(.07,.11,.02),M.flat('#141414'),[x,y+(L.sh==='tall'?.12:0),fz]));
    if(L.sh==='twin'){const tw=new THREE.Group();tw.position.set(.55,.05,-.1);P(tw,G.bx(.5,.5,.5,.12),M.c(L.c||'#f7f6f4',{rim:1,opacity:.55}),[0,0,0]);[[-.11,.06],[.11,.06]].forEach(([x,y])=>P(tw,G.bx(.07,.11,.02),M.flat('#141414'),[x,y,.26]));core.add(tw)}
    const red=P(g,geo.clone(),new THREE.MeshBasicMaterial({color:'#c8102e',transparent:true,opacity:.45,depthWrite:false}),[-.06,0,0]);
    const cyan=P(g,geo.clone(),new THREE.MeshBasicMaterial({color:'#45e0ff',transparent:true,opacity:.4,depthWrite:false}),[.06,0,0]);
    g.traverse(o=>{if(o.isMesh)o.userData.noOutline=true});g.userData.parts={core,red,cyan};g.userData.look=L;return g}
  function spawn(){if(ent||act()<2||typeof GAME==='undefined'||!GAME.G||GAME.G.def.mine||GAME.viewer)return;const r=pickFor(GAME.G.id);if(!r)return;
    const me=GAME.me;if(!me)return;const rnd=srand(hashNum(GAME.G.id+r.id));let p=null;
    /* eigene Familie: im Rissling-Lebensraum des Planeten, sonst irgendwo in der Nähe */if(r.pl===GAME.G.id&&GAME.G.rift){p=GAME.G.rift.clone?GAME.G.rift.clone():GAME.G.rift}for(let i=0;i<300&&!p;i++){const q=GAME.randAround(rnd,18+i*.12,me.p);if(q&&GAME.isLand(q)&&!GAME.nearPlace(q,.9)&&GAME.angle(q,me.p)*GAME.G.R>7)p=q}if(!p)return;
    const g=model(r);GAME.placeObj(g,p,0,.9,true);GAME.G.scene.add(g);const it={kind:'riss',p,r:1.8,label:'Den Rissling vorsichtig fangen',act:()=>catchIt()};GAME.G.inter.push(it);ent={g,p,r,it,t0:performance.now()};
    if(typeof PIKO!=='undefined')PIKO.want('Da flackert etwas! Ein … Riss? Lass ihn uns vorsichtig fangen.')}
  function despawn(){if(!ent)return;ent.g.parent&&ent.g.parent.remove(ent.g);const i=GAME.G.inter.indexOf(ent.it);if(i>=0)GAME.G.inter.splice(i,1);ent=null}
  async function catchIt(){if(!ent)return;const r=ent.r;const s=S();if(!s.caught.includes(r.id))s.caught.push(r.id);persist();despawn();try{SND.play('powerup',{vol:.6})}catch(e){}
    await rissScene(r);MUSIC2&&MUSIC2.setRiss(Math.min(.6,s.caught.length/RISS.length*.6));
    if(typeof PIKO!=='undefined')PIKO.want(s.caught.length===1?'Hast du das auch gesehen? Alles war plötzlich grau … und es roch nach Frühstück.':'Rissling Nr. '+s.caught.length+'. Jeder trägt ein Stück von einem echten Morgen.')}
  /* ---------- Riss-Szene: Farben weg, Stromleitungen, Brummen, eine Erinnerung ---------- */
  function rissScene(r){return new Promise(res=>{SND.music('riss');SND.play('glitch',{vol:.7});
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
      P_.red.position.x=-.06-Math.sin(t*9)*.04;P_.cyan.position.x=.06+Math.sin(t*7)*.04;P_.core.rotation.y=Math.sin(t*2)*.4;let h=.9+Math.sin(t*2.2)*.12;const A=(ent.g.userData.look||{}).a,c=P_.core;c.visible=true;c.scale.setScalar(1);c.rotation.z=0;c.position.set(0,0,0);
        /* jede Familie stört die Welt auf ihre eigene Art */
        if(A==='float')h+=.5+Math.sin(t*1.3)*.3;else if(A==='jitter')c.position.set((Math.random()-.5)*.08,(Math.random()-.5)*.08,0);else if(A==='spin')c.rotation.y=t*3;else if(A==='pulse')c.scale.setScalar(1+Math.sin(t*6)*.12);
        else if(A==='freeze'){if(Math.floor(t*1.5)%3)c.rotation.y=0}else if(A==='fade')c.visible=Math.sin(t*3)>-.6;else if(A==='echo'){P_.red.position.x=-.35-Math.sin(t*3)*.15;P_.cyan.position.x=.35+Math.sin(t*3)*.15}
        else if(A==='tilt')c.rotation.z=Math.sin(t*1.7)*.5;else if(A==='grow')c.scale.setScalar(.7+((t*.4)%1)*.7);else if(A==='stutter')c.position.y=Math.floor(t*4)%2*.12;else if(A==='flip')c.rotation.z=Math.floor(t*.5)%2?PI:0;
        else if(A==='mirror')c.scale.x=Math.sin(t*2)>0?1:-1;else if(A==='shimmer')c.position.y=Math.sin(t*14)*.03;
        ent.g.position.copy(GAME.onSurf(ent.p,h))}}}
  function onPlanet(){ent=null;spawnT=6}
  /* gespeicherten Zerfall der Musik wiederherstellen */
  setTimeout(()=>{try{const s=S();if(typeof MUSIC2!=='undefined'&&s.caught.length)MUSIC2.setRiss(Math.min(.6,s.caught.length/RISS.length*.6))}catch(e){}},500);
  return{_spawn:()=>spawn(),_model:r=>model(r),hatch,frame,onPlanet,app,catchIt,rissScene,RISS,get act(){return act()},setAct:a=>{S().act=a;persist()}};
})();
