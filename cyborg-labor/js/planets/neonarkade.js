/* =====================================================================
   CYBORG-LABOR · planets/neonarkade.js · Neon-Arkade
   Ein Planet wie eine Spielhalle von 1999 in der Abenddämmerung: Joystick-
   Bäume, Neon-Palmen mit leuchtenden Wedeln, Münzblumen, Knopfbüsche und
   Pixel-Felsen. Die Häuser sind Spielautomaten und Handheld-Konsolen.
   Besonderheit:
   · Spielmarken-Jagd: zwölf leuchtende Spielmarken sind auf dem Planeten
     versteckt. Jede bringt 5 Tickets für die Spielhalle (Preis-Theke).
     Wer alle zwölf findet, wird Arkade-Champion und bekommt einen
     Kapselautomaten.
   Kein Glücksspiel: Tickets gibt es nur fürs Finden und Geschick.
   ===================================================================== */
(function(){
const ID='neonarkade';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,butterfly,crystal,cloud}=NH;
const V=THREE.Vector3;
const NEON=['#ff6fd8','#45e0ff','#ffd23f','#7fd34a','#9b6ae0','#ff9a45'];

/* ================= Natur ================= */
N('joystickbaum',{r:.4,h:3.6,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.4,3.4);const col=o.color||NEON[Math.floor(rnd()*NEON.length)];
  P(g,G.bx(1,.5,1,.12),m.c('#2b2340',{gloss:.8}),[0,.25,0]);for(let i=0;i<4;i++){const a=i/4*TAU+.4;P(g,G.cy(.09,.09,.06),m.c(NEON[(i+1)%6],{gloss:1.3,rim:1}),[Math.cos(a)*.34,.52,Math.sin(a)*.34])}
  P(g,G.cy(.07,.09,h),m.c('#e6ecf5',{gloss:1.4}),[0,.5+h/2,0]);P(g,G.s(.62),m.c(col,{gloss:1.4,rim:1.2,rimColor:'#ffffff'}),[0,.5+h+.35,0]);const hl=P(g,G.s(.14),m.flat('#ffffff'),[-.22,.5+h+.6,.38],null,[1.3,.6,.4]);hl.userData.noOutline=true});
N('neonpalme',{r:.35,h:4.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,3.2,4.2);const col=o.color||NEON[Math.floor(rnd()*NEON.length)];
  for(let i=0;i<7;i++)P(g,G.cy(.16-i*.012,.18-i*.012,h/7),m.c(i%2?'#3b3450':'#5b4f7a',{gloss:.9}),[Math.sin(i*.4)*.05,h/7*(i+.5),0]);
  const top=[0,h,0];P(g,G.s(.2),m.c('#e6ecf5',{gloss:1.4}),top);const gl=m.glow(col,1.7);
  for(let i=0;i<7;i++){const a=i/7*TAU+rnd()*.3;const pts=[top,[Math.cos(a)*.8,h+.45,Math.sin(a)*.8],[Math.cos(a)*1.6,h+.1,Math.sin(a)*1.6],[Math.cos(a)*1.9,h-.5,Math.sin(a)*1.9]];P(g,G.tu(pts,.06,.03,16),gl).userData.noOutline=true}
  markGlow(g,g.children[g.children.length-1])});
N('muenzblume',{r:.15,h:.9,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.5,.9);P(g,G.tu([[0,0,0],[.05,h*.5,0],[0,h,0]],.025,.02),m.c('#7fd34a',{gloss:1}));
  const c=grp(g,[0,h+.12,0]);P(c,G.cy(.16,.16,.04),m.c('#ffd23f',{gloss:1.4,rim:1,rimColor:'#ffffff'}),[0,0,0],[PI/2,0,0]);P(c,G.star(.08,.035,5,.02),m.c('#ff9a45',{gloss:1}),[0,0,.025]);const ph=rnd()*9;g.userData.tick=t=>{c.rotation.y=t*1.2+ph}});
N('knopfbusch',{r:.5,h:1,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.55,.03,2.6,rnd()*9),m.c('#5b4f7a',{gloss:1.2,rim:1,rimColor:'#ffffff'}),[0,.48,0],null,[1.2,.8,1]);
  for(let i=0;i<7;i++){const th=.5+rnd()*.9,ph=rnd()*TAU;const n=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));const b=P(g,G.hs(.11),m.c(NEON[i%6],{gloss:1.4,rim:1}),[n.x*.62,.48+n.y*.42,n.z*.52]);b.lookAt(n.x*9,.48+n.y*9,n.z*9);b.rotateX(PI/2)}});
N('pixelfels',{r:.7,h:1.2,size:'big',planet:ID},(g,m,o,rnd)=>{const cols=['#5b4f7a','#7a6aa0','#3b3450','#9b8ac0'];for(let i=0;i<9;i++){const s=RR(rnd,.3,.55);const x=(rnd()-.5)*1.1,z=(rnd()-.5)*.9;const y=s/2+(i>5?.4:0);P(g,G.bx(s,s,s,.02),m.c(cols[i%4],{gloss:.6}),[x,y,z])}
  if(rnd()<.5)P(g,G.bx(.16,.16,.16,.01),m.glow(NEON[Math.floor(rnd()*6)],1.5),[0,.95,0])});
N('pixelgras',{r:.1,h:.4,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#7fd34a',{gloss:.8});for(let i=0;i<4;i++){const x=(rnd()-.5)*.3,z=(rnd()-.5)*.3;const n=1+Math.floor(rnd()*3);for(let k=0;k<n;k++)P(g,G.bx(.07,.07,.07,0),c,[x,.035+k*.07,z])}});
N('kabelranke',{r:.3,h:1.2,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<3;i++){const a=rnd()*TAU;const pts=[[0,0,0],[Math.cos(a)*.2,.5,Math.sin(a)*.2],[Math.cos(a)*.1,.9+rnd()*.3,Math.sin(a)*.1]];P(g,G.tu(pts,.035,.025,12),m.c(NEON[i%6],{gloss:1.2}));P(g,G.bx(.08,.06,.12,.02),m.c('#e6ecf5',{gloss:1.3}),pts[2])}});
Object.assign(NH.ROCK,{[ID]:['#7a6aa0','#5b4f7a','#ff6fd8']});

/* ================= Biome ================= */
const BI={
  neonwiese:{n:'Neon-Wiese',g:['#6fc87a','#5ab86a'],cliff:'#5b4f7a',pat:'gras',grass:'#68c478',grassD:.9,trees:[['joystickbaum',1.2],['neonpalme',.8]],treeD:.5,
    deco:[['muenzblume',5],['pixelgras',4],['knopfbusch',1.2]],decoD:6,rocks:[['pixelfels',.4]],rockD:.4,litter:[['spielmarke_klein',.6],['pixelstaub',1]]},
  knopfwald:{n:'Knopfwald',g:['#5aa86a','#4e9a5e'],cliff:'#4e4370',pat:'moos',grass:'#5aa86a',grassD:1,trees:[['joystickbaum',3],['neonpalme',1]],treeD:1.6,
    deco:[['knopfbusch',3],['kabelranke',2],['muenzblume',2]],decoD:5,rocks:[['pixelfels',.5]],rockD:.3,litter:[['kabelrest',1],['pixelstaub',.6]]},
  pixelwueste:{n:'Pixel-Wüste',g:['#e8c8f0','#dcb8e8'],cliff:'#9b8ac0',pat:'sand',grass:null,grassD:0,trees:[['neonpalme',.5]],treeD:.25,
    deco:[['pixelgras',2],['kabelranke',1]],decoD:2,rocks:[['pixelfels',1.2]],rockD:.8,litter:[['pixelstaub',1.4]]},
  kabelufer:{n:'Kabel-Ufer',g:['#9ad8e0','#88ccd8'],cliff:'#5b6a90',pat:'sand',grass:'#90d0d8',grassD:.4,trees:[['neonpalme',.8]],treeD:.4,
    deco:[['kabelranke',3],['muenzblume',1]],decoD:3,rocks:[['pixelfels',.4]],rockD:.4,litter:[['kabelrest',1.2],['muschel',.6]]},
  chromklippen:{n:'Chrom-Klippen',g:['#c8c4dc','#b8b4d0'],cliff:'#7a7a9a',pat:'staub',grass:null,grassD:0,trees:[['joystickbaum',.3]],treeD:.2,
    deco:[['pixelgras',1]],decoD:1,rocks:[['pixelfels',1.4]],rockD:1,litter:[['pixelstaub',1]]}};

/* ================= Sammelsachen ================= */
IT('spielmarke_klein',itMeta('Kleine Spielmarke','neonarkade','material',40),(g,m)=>{P(g,G.cy(.14,.14,.03),m.c('#ffd23f',{gloss:1.4,rim:1}),[0,.02,0]);P(g,G.star(.07,.03,5,.01),m.c('#ff9a45'),[0,.04,0],[-PI/2,0,0])});
IT('pixelstaub',itMeta('Pixelstaub','neonarkade','material',60),(g,m)=>{range(6,(t,i)=>P(g,G.bx(.05,.05,.05,0),m.glow(NEON[i%6],1.4),[Math.cos(i*2.1)*.12,.05+t*.16,Math.sin(i*2.1)*.12]))});
IT('kabelrest',itMeta('Kabelrest','neonarkade','material',30),(g,m)=>{P(g,G.tu([[-.2,.03,0],[0,.08,.1],[.2,.03,0]],.025,.025,10),m.c('#ff6fd8',{gloss:1}));P(g,G.bx(.07,.05,.09,.02),m.c('#e6ecf5',{gloss:1.3}),[.22,.03,0])});

/* ================= Fische ================= */
F('pixelfisch',fishMeta('Pixelfisch','neonarkade','teich','S','immer',1,180,'Ich hab einen Pixelfisch gefangen! Er besteht aus lauter kleinen Quadraten.','Bildschirme bestehen aus winzigen Bildpunkten, den Pixeln. Ein alter Spielautomat hatte oft nur 256 mal 224 davon.'),
  (g,m)=>{const cols=['#45e0ff','#ff6fd8','#ffd23f'];for(let x=0;x<5;x++)for(let y=0;y<3;y++){if((x===0||x===4)&&y!==1)continue;P(g,G.bx(.14,.14,.14,0),m.c(cols[(x+y)%3],{gloss:.8}),[0,(y-1)*.14,(x-2)*.14])}
    P(g,G.bx(.04,.18,.18,0),m.c('#ff6fd8'),[0,0,-.4]);eye(g,m,[.08,.06,.25],.035,[.6,.3,.6]);eye(g,m,[-.08,.06,.25],.035,[-.6,.3,.6])});
F('neonaal',fishMeta('Neon-Aal','neonarkade','meer','M','nacht',2,620,'Ich hab einen Neon-Aal gefangen! Er leuchtet wie eine Röhre über dem Eingang.','Manche Tiefseetiere leuchten selbst. Dieses Leuchten heisst Biolumineszenz und entsteht durch eine chemische Reaktion im Körper.'),
  (g,m)=>{const pts=range(8,t=>[Math.sin(t*6)*.08,0,(t-.5)*1]);P(g,G.tu(pts,.07,.03,24),m.glow('#45e0ff',1.6));eye(g,m,[.05,.04,.48],.03,[.6,.3,.6]);eye(g,m,[-.05,.04,.48],.03,[-.6,.3,.6])});
F('bitbarsch',fishMeta('Bit-Barsch','neonarkade','teich','M','tag',2,440,'Ich hab einen Bit-Barsch gefangen! Er kennt nur zwei Zahlen: null und eins.','Computer rechnen mit nur zwei Zuständen: Strom an oder aus, 1 oder 0. Ein solcher Zustand heisst Bit.'),
  (g,m)=>fishT(g,m,{id:'bitbarsch',H:.24,L:.8,back:'#9b6ae0',belly:'#f2e8ff',tail:'fork',dorsal:'std',pat:(x,w,h,r)=>{x.fillStyle='#ffd23f';x.font='bold 18px monospace';for(let i=0;i<10;i++)x.fillText(i%3?'1':'0',(i*29)%w,20+(i*17)%(h-20))}}));

/* ================= Insekten ================= */
B('pixelkaefer',bugMeta('Pixelkäfer','neonarkade','boden','immer',1,150,'Ich hab einen Pixelkäfer gefangen! Er läuft nur in geraden Linien.','In alten Videospielen konnten sich Figuren oft nur in vier Richtungen bewegen: hoch, runter, links und rechts.'),
  (g,m)=>{P(g,G.bx(.34,.18,.42,.03),m.c('#ff6fd8',{gloss:1}),[0,.16,0]);P(g,G.bx(.2,.14,.14,.02),m.c('#3b3450'),[0,.16,.26]);bugFace(g,m,[0,.17,.33],.08,.5);legs(g,m.c('#3b3450'),[[.12,.14,.12],[0,.14,0],[-.12,.14,-.12]],.22)});
B('neonfalter',bugMeta('Neonfalter','neonarkade','luft','nacht',2,520,'Ich hab einen Neonfalter gefangen! Seine Flügel flackern wie eine Leuchtreklame.','Nachtfalter fliegen zu Lampen, weil sie sich eigentlich am Mond orientieren. Helle Lampen bringen ihren Kompass durcheinander.'),
  (g,m)=>butterfly(g,m,'neonfalter','#ff6fd8','#45e0ff','#3b3450'));
B('glitchgrille',bugMeta('Glitch-Grille','neonarkade','boden','nacht',3,980,'Ich hab eine Glitch-Grille gefangen! Manchmal ist sie kurz an zwei Orten gleichzeitig.','Grillen zirpen schneller, wenn es wärmer ist. Aus der Zahl der Zirper pro Minute kann man ungefähr die Temperatur ablesen.'),
  (g,m)=>{const bm=m.c('#7fd34a',{gloss:.9});P(g,G.ca(.09,.36),bm,[0,.18,0],[PI/2,0,0]);P(g,G.ca(.09,.36),m.c('#ff6fd8',{opacity:.45}),[.05,.19,0],[PI/2,0,0]);P(g,G.s(.1),bm,[0,.2,.26]);bugFace(g,m,[0,.2,.34],.08,.5);legs(g,bm,[[.1,.14,.1],[0,.14,0],[-.1,.14,-.1]],.24)});

/* ================= Fundstücke ================= */
REL('goldene_cartridge',relMeta('Goldenes Spielmodul','neonarkade','schatz',3,2400,'Ein goldenes Spielmodul! Darauf steht nur: «Nicht ausschalten».','Spielmodule enthielten Speicherchips mit dem Spiel. Man steckte sie in die Konsole, und das Spiel startete sofort – ganz ohne Laden.'),
  (g,m)=>{P(g,G.bx(.6,.7,.12,.04),m.c('#ffd23f',{gloss:1.4,rim:1}),[0,.35,0]);P(g,G.bx(.44,.3,.02,.01),m.c('#fffdf7'),[0,.45,.07]);for(let i=0;i<8;i++)P(g,G.bx(.04,.06,.02,0),m.c('#c98a2b'),[-.21+i*.06,.03,.05])});
REL('highscore_band',relMeta('Highscore-Band','neonarkade','kunst',2,900,'Ein altes Papierband mit Highscores. Ganz oben steht: «NEM 999999».','Früher druckten manche Spielautomaten die besten Punktzahlen aus oder speicherten nur drei Buchstaben pro Name.'),
  (g,m)=>{P(g,G.cy(.14,.14,.5),m.c('#fffdf7'),[0,.14,0],[0,0,PI/2]);P(g,G.bx(.46,.005,.6,0),m.c('#fffdf7'),[0,.01,.35]);for(let i=0;i<5;i++)P(g,G.bx(.3,.006,.03,0),m.c('#3b3450'),[0,.015,.15+i*.1]).userData.noOutline=true});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  pixelhase:{n:'Pixelhase',planet:ID,biomes:['neonwiese','knopfwald'],count:4,size:.7,speed:1.4,gait:'hop',shy:true,voice:['bip','bip-bup','pling'],pitch:640,likes:['spielmarke_klein','pixelstaub'],product:'pixelstaub',names:['Bit','Byte','Pixelchen','Hopsi','Blinki'],
    fact:'Hasen können ihre langen Ohren einzeln drehen und so Geräusche aus allen Richtungen hören, ohne den Kopf zu bewegen.',a:{col:'#f2e8ff',belly:'#ffffff',body:[.3,.28,.36],head:{r:.24,p:[0,.48,.28]},snout:{type:'muzzle',col:'#ffffff',nose:'#ff6fd8'},ears:{type:'pointy',len:.6},legs:{n:4,len:.1,r:.07,foot:'#d8c8f0'},tail:{type:'puff',col:'#ff6fd8',r:.1},spots:{col:'#45e0ff',n:4,s:.5},gait:'hop'}},
  joystickkroete:{n:'Joystick-Kröte',planet:ID,biomes:['kabelufer','neonwiese'],nearWater:true,count:3,size:.7,speed:.7,gait:'hop',voice:['bup','quiek','bupbup'],pitch:220,likes:['kabelrest','pixelkaefer'],product:'kabelrest',names:['Knöpfchen','Hebel','Arcadia','Turbo','Start'],
    fact:'Kröten haben eine trockenere, warzige Haut als Frösche und können darum weiter weg vom Wasser leben.',a:{col:'#9b6ae0',belly:'#f2e8ff',body:[.42,.26,.4],head:{r:.3,p:[0,.42,.26],sc:[1.2,.8,1]},snout:{type:'wide'},eyes:{r:.1,x:.5,y:.55},ears:{type:'none'},legs:{n:4,len:.1,r:.08,foot:'#7a4ac0'},tail:{type:'none'},spots:{col:'#ffd23f',n:6},gait:'hop'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','arkadekappe','Arkade-Kappe',480,'#ff6fd8',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.82),M.c(col,{gloss:.8}),[0,0,0]);P(q,G.cy(r*.5,r*.5,r*.05),M.c(col),[0,0,r*.6],[PI/2-.15,0,0],[1,1,.55]);P(q,G.s(r*.12),M.c('#ffd23f',{gloss:1}),[0,r*.8,0])});
def('top','neonjacke','Neon-Jacke',980,'#3b3450',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.82,r*.88,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);for(const s of[-1,1])P(q,G.bx(r*.06,r*.9,r*.04,r*.02),M.glow('#45e0ff',1.4),[s*r*.3,-r*.45,r*.84])});

/* ================= Möbel ================= */
furn('mini_automat',{n:'Mini-Spielautomat',cat:'spiel',price:1800,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{P(g,G.bx(.6,1.5,.55,.06),m.c('#ff6fd8',{gloss:1}),[0,.75,0]);P(g,G.bx(.46,.36,.02,.02),m.glow('#45e0ff',1.2),[0,1.15,.28]);P(g,G.bx(.56,.1,.25,.03),m.c('#3b3450'),[0,.85,.3],[-.35,0,0]);P(g,G.s(.05),m.c('#ff3b6b',{gloss:1.4}),[-.12,.95,.35])}});
furn('neonroehre',{n:'Neon-Röhre «1999»',cat:'licht',price:900,planet:ID,size:[1,1],h:1,wall:true,b:(g,m)=>{const gl=m.glow('#ff6fd8',1.8);const t=[[-.3,.6],[-.3,.3],[-.1,.3],[-.1,.6],[.1,.6],[.1,.3],[.3,.6],[.3,.3]];for(let i=0;i<t.length;i+=2)P(g,G.tu([[t[i][0],t[i][1],.05],[t[i+1][0],t[i+1][1],.05]],.025,.025,4),gl);g.userData.light={p:[0,.45,.2],c:'#ff9ae8',i:.8}}});

/* ================= Sprache: Pixelschrift ================= */
function pixelGlyph(x,s,r){const n=3;const c=s*.22;x.save();x.fillStyle=x.strokeStyle;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(r()<.55||(i===1&&j===1))x.fillRect((i-1.5)*c*1.1,(j-1.5)*c*1.1,c,c);x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Neon-Arkade',base:'kompost',R:120,R0:40,sea:-.3,music:'town',sky:['#5a3ab0','#ff8fd8'],fog:'#b89ae8',water:'#45e0ff',deep:'#2a5ac8',step:1.1,shop:ID,
    desc:'Spielhallen-Planet in ewiger Dämmerung: Joystick-Bäume, Neon-Palmen und Münzblumen. Finde die zwölf versteckten Spielmarken.',weather:'blueten',orbit:[173,3.0],size:1,col:['#6fc87a','#ff6fd8'],moons:1,
    park:'neonwiese',parkPond:true,phone:['#e0d0ff','#ffd0f0'],stones:['kiesel','pixelstaub','stein_klein'],plazaTree:'neonpalme',path:'#b894f0',
    space:{deep:'#2a5ac8',water:'#45e0ff',shore:'#e8c8f0',land:'#6fc87a',land2:'#5aa86a',high:'#c8c4dc',cap:'#ff8fd8',atmo:'#9b6ae0',cloud:.4,sea:.36,capA:.4,freq:3},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'pixelwueste',wet:'kabelufer',cold:'chromklippen'},peak:'chromklippen',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.1,4)*2+.7;/* Pixel-Stufen: das Gelände steigt in kleinen Blöcken an */const k=sstep(.1,.5,N2(q.x*.5,q.y*.5,q.z*.5));h=h*(1-k*.5)+Math.round(h*2)/2*k*.5;return h},
    biome({T,M,h,sea,low,nearPond,p}){if(nearPond||(low&&h<sea+.6))return'kabelufer';if(h>sea+4.4)return'chromklippen';if(T>.28)return'pixelwueste';if(M>.22)return'knopfwald';return'neonwiese'},
    onLoad:W=>NEONA.onLoad(W),tick:(dt,t,W,me)=>NEONA.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Arkade-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Pixel-Teich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Kabelsee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Mega-Spielhalle',mode:'Neon-Boutique',praxis:'Reparatur-Werkstatt',museum:'Museum der Spielautomaten',shop:'Münz-Laden',studio:'Pixel-Atelier',bar:'Chiptune-Bar',rathaus:'Highscore-Halle',garage:'Joystick-Garage',pflanzen:'Knopfblumen-Gärtnerei',tiere:'Pixel-Tierladen'},
  sty:{wall:'putz',walls:['#fbf7f0','#f2f8ff','#fff1f6'],roof:'dome',roofs:NEON.slice(0,5),trim:'#e6ecf5',plinth:'#5b4f7a',door:'#3b3450',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Bürgermeisterin Highscore',{skin:'plastik',color:9,shape:'kapselspiel'},{kopf:'crtkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:['pager']}],
  lore:['Willkommen in der Neon-Arkade! Hier wird nie ausgeschaltet. Es ist immer kurz vor Mitternacht.','Auf dem Planeten sind zwölf goldene Spielmarken versteckt. Jede bringt Tickets für die Spielhalle.','In der Mega-Spielhalle gewinnt nicht das Glück, sondern die Übung.'],
  caveRock:['#7a6aa0','#5b4f7a','#3b3450',['#ff6fd8','#45e0ff','#ffd23f']],
  wear:['arkadekappe','neonjacke','kappe','brille','halstuch'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['pirate','crate',.42,'ds',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'automat'},{fam:'kokon',style:'handheld'},{fam:'kokon',style:'blob'},{fam:'kokon',style:'automat'}]},
  residents:{skins:['plastik','bonbon','gold','fell','pluesch'],heads:['crtkopf','kapselkopf','eikopf','katze','mensch','vogel','frosch'],names:['Pixel','Turbo','Joy','Bit','Chip','Combo','Bonus','Level','Arcadia','Coin','Retro','Glitzer'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fbf7f0','#f2f8ff','#fff1f6'],roofCols:NEON.slice(0,4),win:['rund']},deco:['muenzblume','knopfbusch','joystickbaum'],fence:false},
  lang:{n:'Pixelschrift',ink:'#3b3450',glow:'#ff6fd8',kind:'circuit',draw:pixelGlyph,syl:['pi','xo','bit','ra','ko','ne','on','ar','ka','de','zo','ji']},ruinStone:'#7a6aa0',
  terraform:['neonwiese','knopfwald','kabelufer','pixelwueste'],
  weather:[['klar',4],['heiter',3],['nebel',1],['regen',1]]});

/* ================= Spielmarken-Jagd ================= */
const NEONA=(()=>{let W_=null,tokens=[];const COUNT=12,TICKETS=5;
  const S=()=>SAVE.neona=SAVE.neona||{got:[]};
  function tokenModel(m){const g=new THREE.Group();const spin=grp(g,[0,.9,0]);P(spin,G.cy(.42,.42,.08),m.c('#ffd23f',{gloss:1.4,rim:1.2,rimColor:'#ffffff'}),[0,0,0],[PI/2,0,0]);
    P(spin,G.star(.22,.1,5,.04),m.glow('#ff9a45',1.4),[0,0,.05]);P(spin,G.star(.22,.1,5,.04),m.glow('#ff9a45',1.4),[0,0,-.05],[0,PI,0]);P(g,G.cy(.5,.6,.04),m.glow('#ff6fd8',1.2),[0,.02,0]).userData.noOutline=true;
    addOutlines(g);g.userData.spin=spin;return g}
  function onLoad(W){W_=W;tokens=[];const m=makeMats({skin:'plastik',color:0});const st=S();const r=srand(7777);
    for(let i=0;i<COUNT;i++){let d=null;for(let t=0;t<400&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.93||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(tokens.some(x=>angle(x.d,cd)*W.R<22))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;d=cd}
      if(!d)continue;if(st.got.includes(i)){tokens.push({i,d,g:null});continue}const g=tokenModel(m);GAME.placeObj(g,d,0,0,true);const it={kind:'spielmarke',p:d,r:1.6,label:'Goldene Spielmarke aufheben',act:()=>pick(i)};W.inter.push(it);tokens.push({i,d,g,it})}}
  function pick(i){const st=S();if(st.got.includes(i))return;const t=tokens.find(x=>x.i===i);if(!t)return;st.got.push(i);if(t.g&&t.g.parent)t.g.parent.remove(t.g);const k=W_.inter.indexOf(t.it);if(k>=0)W_.inter.splice(k,1);t.g=null;
    let tix=0;try{const a=CASINO.st();a.tickets+=TICKETS;tix=a.tickets}catch(e){}persist();SND.play('pickup',{rate:1.3});
    const n=st.got.length;UI.toast('Spielmarke '+n+' von '+COUNT+'! +'+TICKETS+' Tickets für die Spielhalle'+(tix?' (jetzt '+tix+')':'')+'.',3200);
    if(typeof PIKO!=='undefined'&&n===1)PIKO.want('Eine goldene Spielmarke! Es gibt noch elf weitere auf dem Planeten.');
    if(n===COUNT&&!st.champion){st.champion=true;persist();setTimeout(async()=>{await UI.talk('Bürgermeisterin Highscore',['Alle zwölf Spielmarken! Du bist offiziell Arkade-Champion.','Hier, ein eigener Kapselautomat für dein Zimmer. Und dein Name steht jetzt ganz oben auf der Highscore-Tafel.']);if(typeof bagAdd==='function')bagAdd('furn','kapselautomat');money(500);SND.jingle('j_success')},900)}}
  function tick(dt,t,W,me){for(const k of tokens){if(!k.g)continue;const s=k.g.userData.spin;s.rotation.y=t*1.6+k.i;s.position.y=.9+Math.sin(t*2+k.i)*.12}}
  return{onLoad,tick,tokens:()=>tokens,COUNT}
})();
window.NEONA=NEONA;
})();
