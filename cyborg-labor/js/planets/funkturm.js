/* =====================================================================
   CYBORG-LABOR · planets/funkturm.js · Funkturm-Planet
   Ein Planet voller Antennen und Wellen: Drahtbäume mit Isolatoren,
   Schüsselblumen, die sich zur Sonne drehen, Lautsprecherpilze, Kabel-
   büsche und Zickzack-Wellengras. Die Häuser sind Mast-Häuschen mit
   rot-weissem Gittermast, Transistorradios und Schüssel-Häuser.
   Besonderheit:
   · Peilsuche: Fünf Funkbaken senden irgendwo auf dem Planeten, aber
     man sieht sie nicht. Ein Peilempfänger am Bildschirmrand zeigt, wie
     stark das Signal ist, und piepst schneller, je näher man kommt.
     Ganz nah taucht die Bake aus dem Boden auf. Wer alle fünf findet,
     bekommt den Weltempfänger.
   ===================================================================== */
(function(){
const ID='funkturm';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const SIG=['#ff4a5a','#2fb5d9','#ffd23f','#7fd34a','#9b6ae0'];
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1.1,rimColor:'#ffffff'});
const chr=m=>m.c('#e6ecf5',{gloss:1.4});

/* ================= Natur ================= */
N('drahtbaum',{r:.35,h:4.2,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.8,3.8);const c=m.c('#c87a3a',{gloss:1.3});
  P(g,G.cy(.1,.14,h,8),c,[0,h/2,0]);const n=3;for(let i=0;i<n;i++){const y=h*.55+i*h*.18,L=1.3-i*.3,a=rnd()*PI;const q=grp(g,[0,y,0],[0,a,0]);P(q,G.cy(.05,.05,L*2,6),c,[0,0,0],[0,0,PI/2]);
    for(const s of[-1,1]){for(let k=0;k<3;k++)P(q,G.cy(.09-k*.015,.09-k*.015,.05,10),gl(m,'#f2f4f8'),[s*L,.06+k*.06,0]);P(q,G.s(.06),gl(m,SIG[(i+(s>0?1:0))%5]),[s*L,.25,0])}}
  const wire=[];for(let k=0;k<=8;k++){const t=k/8;wire.push([-1.3+t*2.6,h*.55+.06-Math.sin(t*PI)*.35,0])}P(g,G.tu(wire,.015,.015,16),m.c('#3b3450'))});
N('schuesselblume',{r:.2,h:1,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.5,.9);P(g,G.cy(.025,.03,h,6),m.c('#7fd34a'),[0,h/2,0]);const q=grp(g,[0,h,0],[-.6,rnd()*TAU,0]);
  P(q,G.hs(.18),gl(m,SIG[Math.floor(rnd()*5)]),[0,0,0],[PI,0,0],[1,.4,1]);P(q,G.cy(.01,.01,.16),chr(m),[0,.08,0]);P(q,G.s(.03),gl(m,'#ffd23f'),[0,.16,0]);const ph=rnd()*9;g.userData.tick=t=>{q.rotation.y=Math.sin(t*.4+ph)*.8}});
N('lautsprecherpilz',{r:.3,h:.8,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.35,.6);P(g,G.cy(.08,.1,h,10),m.c('#3b3450'),[0,h/2,0]);const q=grp(g,[0,h,0]);
  P(q,G.cy(.32,.12,.14,20,1,true),gl(m,SIG[Math.floor(rnd()*5)]),[0,.07,0]);P(q,G.cy(.3,.3,.02,20),m.c('#3b3450'),[0,.13,0]);P(q,G.s(.08),chr(m),[0,.15,0],null,[1,.5,1]);const ph=rnd()*9;g.userData.tick=t=>{q.scale.y=1+Math.max(0,Math.sin(t*6+ph))*.12}});
N('kabelbusch',{r:.45,h:.9,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<6;i++){const a=rnd()*TAU;const pts=[];for(let k=0;k<=10;k++){const t=k/10;pts.push([Math.cos(a+t*4)*.35*t,t*.8,Math.sin(a+t*4)*.35*t])}P(g,G.tu(pts,.035,.03,14),gl(m,SIG[i%5]))}
  P(g,G.cy(.18,.2,.12,12),m.c('#3b3450'),[0,.06,0])});
N('isolatorfels',{r:.6,h:1.2,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.6,.1,3,rnd()*9),m.c('#b8b4c8'),[0,.28,0],null,[1.2,.6,1]);const n=1+Math.floor(rnd()*3);
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*.4;for(let k=0;k<4;k++)P(g,G.cy(.18-k*.02,.18-k*.02,.08,14),gl(m,i%2?'#a8d8f0':'#f2f4f8'),[x,.5+k*.12,0]);P(g,G.cy(.04,.04,.2),m.c('#c87a3a',{gloss:1.3}),[x,1.05,0])}});
N('wellengras',{r:.12,h:.4,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=gl(m,'#7fd34a');for(let i=0;i<3;i++){const a=rnd()*TAU;const pts=[];for(let k=0;k<=6;k++)pts.push([Math.cos(a)*.03*k+(k%2?.04:-.04)*Math.sin(a),k*.06,Math.sin(a)*.03*k+(k%2?-.04:.04)*Math.cos(a)]);P(g,G.tu(pts,.015,.008,10),c)}});
Object.assign(NH.ROCK,{[ID]:['#b8b4c8','#a8a4bc','#c87a3a']});

/* ================= Biome ================= */
const BI={
  wellenwiese:{n:'Wellenwiese',g:['#a0dc84','#94d078'],cliff:'#a8a4bc',pat:'gras',grass:'#98d47c',grassD:.9,trees:[['drahtbaum',1]],treeD:.45,
    deco:[['schuesselblume',4],['wellengras',4],['lautsprecherpilz',1.2]],decoD:6,rocks:[['isolatorfels',.4]],rockD:.3,litter:[['kupferdraht',1],['quarz',.4]]},
  drahtwald:{n:'Drahtwald',g:['#88c86c','#7cbc60'],cliff:'#9894ac',pat:'moos',grass:'#88c86c',grassD:1,trees:[['drahtbaum',3]],treeD:1.4,
    deco:[['kabelbusch',3],['lautsprecherpilz',2],['schuesselblume',1]],decoD:5,rocks:[['isolatorfels',.3]],rockD:.3,litter:[['kupferdraht',1.4]]},
  schuesselfeld:{n:'Schüsselfeld',g:['#e8e4c8','#dcd8bc'],cliff:'#b8b0a0',pat:'sand',grass:'#d8d8a8',grassD:.3,trees:[['drahtbaum',.3]],treeD:.2,
    deco:[['schuesselblume',6],['wellengras',2]],decoD:4,rocks:[['isolatorfels',.6]],rockD:.5,litter:[['quarz',1]]},
  kupferufer:{n:'Kupfer-Ufer',g:['#e8c8a8','#dcbc9c'],cliff:'#b8784a',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['kabelbusch',2]],decoD:2,rocks:[['isolatorfels',.5]],rockD:.4,litter:[['kupferdraht',1],['muschel',.6]]},
  gipfelstation:{n:'Gipfelstation',g:['#e0e4f0','#d4d8e6'],cliff:'#a8acc0',pat:'staub',grass:null,grassD:0,trees:[['drahtbaum',.4]],treeD:.25,
    deco:[['wellengras',1]],decoD:1,rocks:[['isolatorfels',1.4]],rockD:.9,litter:[['quarz',1.2]]}};

/* ================= Sammelsachen ================= */
IT('kupferdraht',itMeta('Kupferdraht','funkturm','material',30),(g,m)=>{const pts=[];for(let k=0;k<=24;k++){const a=k/24*TAU*3;pts.push([Math.cos(a)*.1,.03+k*.006,Math.sin(a)*.1])}P(g,G.tu(pts,.012,.012,40),m.c('#c87a3a',{gloss:1.3}))});
IT('quarz',itMeta('Quarzkristall','funkturm','material',55),(g,m)=>{P(g,G.cy(.06,.08,.22,6),m.c('#f2f6ff',{opacity:.7,gloss:1.5,rim:1.3}),[0,.11,0]);P(g,G.co(.06,.08,6),m.c('#f2f6ff',{opacity:.7,gloss:1.5}),[0,.26,0])});

/* ================= Fische ================= */
F('antennenwels',fishMeta('Antennenwels','funkturm','teich','M','nacht',2,520,'Ich hab einen Antennenwels gefangen! Seine Barteln sehen aus wie kleine Antennen.','Welse ertasten und schmecken mit ihren Barteln. So finden sie Futter auch im trüben Wasser.'),
  (g,m)=>{fishT(g,m,{id:'antennenwels',H:.2,L:.85,back:'#6a6a7a',belly:'#d8d4c8',tail:'round',dorsal:'std'});for(const s of[-1,1])for(const k of[0,1])P(g,G.tu([[s*.06,-.02,.42],[s*(.18+k*.06),-.06-k*.04,.5],[s*(.26+k*.08),-.1-k*.06,.46]],.012,.006,8),m.c('#3b3450'))});
F('funkhering',fishMeta('Funk-Hering','funkturm','meer','S','immer',1,140,'Ich hab einen Funk-Hering gefangen! Er schwimmt nie allein.','Heringe leben in riesigen Schwärmen. Nachts verständigen sie sich mit leisen Blubbergeräuschen aus Luftbläschen.'),
  (g,m)=>fishT(g,m,{id:'funkhering',H:.16,L:.6,back:'#4a7ab8',belly:'#e8f0f8',tail:'fork',dorsal:'std'}));
F('signalbarbe',fishMeta('Signalbarbe','funkturm','teich','S','tag',2,360,'Ich hab eine Signalbarbe gefangen! Ihre Streifen blinken wie ein Funksignal.','Viele Fische haben ein «Seitenlinienorgan». Damit spüren sie kleinste Wasserbewegungen, fast wie ein Radar.'),
  (g,m)=>fishT(g,m,{id:'signalbarbe',H:.2,L:.6,back:'#ffd23f',belly:'#fff6e0',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#3b3450';for(let i=0;i<4;i++)x.fillRect(w*(.3+i*.12),0,w*.04,h)}}));

/* ================= Insekten ================= */
B('funkgrille',bugMeta('Funkgrille','funkturm','boden','nacht',1,170,'Ich hab eine Funkgrille gefangen! Sie zirpt im Morsealphabet.','Grillen zirpen, indem sie einen Flügel mit einer Schrillleiste über eine Kante am anderen Flügel reiben.'),
  (g,m)=>{const bm=m.c('#5a4a3a',{gloss:.9});P(g,G.ca(.08,.3),bm,[0,.16,0],[PI/2,0,0]);P(g,G.s(.09),bm,[0,.18,.22]);bugFace(g,m,[0,.19,.29],.07,.5);for(const s of[-1,1])P(g,G.tu([[s*.03,.22,.28],[s*.12,.35,.45],[s*.2,.38,.6]],.008,.004,8),bm);legs(g,bm,[[.08,.12,.08],[0,.12,0],[-.08,.12,-.1]],.22)});
B('bockkaefer',bugMeta('Bockkäfer','funkturm','baum','tag',2,480,'Ich hab einen Bockkäfer gefangen! Seine Fühler sind länger als er selbst.','Bockkäfer heissen auf Englisch «Langhornkäfer». Bei manchen Arten sind die Fühler doppelt so lang wie der Körper.'),
  (g,m)=>{const bm=m.c('#2b2340',{gloss:1.1});P(g,G.s(.13),bm,[0,.15,0],null,[.9,.6,1.8]);P(g,G.s(.08),bm,[0,.16,.25]);bugFace(g,m,[0,.17,.31],.06,.5);for(const s of[-1,1])P(g,G.tu([[s*.04,.2,.3],[s*.25,.35,.4],[s*.45,.3,.2],[s*.55,.2,-.05]],.012,.006,14),m.c('#ffd23f'));legs(g,bm,[[.08,.12,.12],[0,.12,0],[-.08,.12,-.12]],.2)});
B('morsefalter',bugMeta('Morsefalter','funkturm','luft','tag',3,920,'Ich hab einen Morsefalter gefangen! Auf seinen Flügeln stehen Punkte und Striche.','Beim Morsealphabet besteht jeder Buchstabe aus kurzen und langen Signalen. «SOS» ist drei kurz, drei lang, drei kurz.'),
  (g,m)=>butterfly(g,m,'morsefalter','#ffffff','#3b3450','#3b3450'));

/* ================= Fundstücke ================= */
REL('detektorradio',relMeta('Detektor-Empfänger','funkturm','schatz',3,2100,'Ein uraltes Radio ohne Batterie. Man hört es nur mit Kopfhörern, ganz leise.','Ein Detektor-Empfänger braucht keinen Strom aus der Steckdose. Die Energie kommt allein aus den Radiowellen.'),
  (g,m)=>{P(g,G.bx(.5,.08,.36,.03),m.c('#8a5a3a'),[0,.04,0]);P(g,G.cy(.08,.08,.22,16),m.c('#c87a3a',{gloss:1.3}),[-.12,.16,0],[0,0,PI/2]);P(g,G.cy(.03,.03,.1),chr(m),[.12,.12,.05]);P(g,G.s(.05),m.c('#f2f6ff',{opacity:.7,gloss:1.5}),[.12,.18,.05])});
REL('morsebrief',relMeta('Morse-Brief','funkturm','kunst',2,800,'Ein Zettel mit Punkten und Strichen. Übersetzt heisst es: «HALLO NEMURI».','Die ersten Funksprüche über das Meer wurden 1901 gesendet – im Morsealphabet, nicht mit Stimme.'),
  (g,m)=>{P(g,G.bx(.4,.005,.5,0),m.c('#fff6e0'),[0,.01,0],[0,.2,0]);for(let i=0;i<6;i++)P(g,G.bx(i%2?.08:.03,.006,.025,0),m.c('#3b3450'),[-.12+i*.05,.015,0],[0,.2,0]).userData.noOutline=true});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  funkfledermaus:{n:'Funk-Fledermaus',planet:ID,biomes:['drahtwald','gipfelstation'],count:3,size:.55,speed:1.4,gait:'hop',shy:true,voice:['tsiep','tik-tik','zirp'],pitch:900,likes:['funkgrille','bockkaefer'],product:'quarz',names:['Echo','Sonar','Piep','Flatter','Radar'],
    fact:'Fledermäuse rufen beim Fliegen ganz hohe Töne und hören das Echo. So «sehen» sie im Dunkeln mit den Ohren.',a:{col:'#5a4a6a',belly:'#8a7a9a',body:[.24,.24,.28],head:{r:.2,p:[0,.42,.2]},snout:{type:'muzzle',col:'#8a7a9a',nose:'#ff8ab0'},ears:{type:'pointy',len:.55},legs:{n:2,len:.06,r:.04,foot:'#3b3450'},tail:{type:'none'},wings:{col:'#7a6a8a'},gait:'hop'}},
  kabelmaus:{n:'Kabelmaus',planet:ID,biomes:['wellenwiese','kupferufer','schuesselfeld'],count:4,size:.5,speed:1.5,gait:'fast',shy:true,voice:['piep','fiep','pieps'],pitch:1000,likes:['kupferdraht','schuesselblume'],product:'kupferdraht',names:['Klicker','Maus-Funk','Kabeli','Byte','Stecker'],
    fact:'Mäuse verständigen sich oft mit Tönen, die so hoch sind, dass Menschen sie gar nicht hören können.',a:{col:'#c8c4d8',belly:'#f2f0f8',body:[.2,.18,.28],head:{r:.17,p:[0,.3,.22]},snout:{type:'long',col:'#f2f0f8',nose:'#ff8ab0'},ears:{type:'round',len:.5},legs:{n:4,len:.06,r:.04,foot:'#ff8ab0'},tail:{type:'long',col:'#ff8ab0'},gait:'fast'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','funkerkappe','Funker-Kappe mit Antenne',540,'#ff4a5a',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.82),M.c(col),[0,0,0]);P(q,G.cy(r*.03,r*.03,r*1.2),M.c('#e6ecf5',{gloss:1.4}),[r*.3,r*.9,0],[0,0,-.2]);P(q,G.s(r*.1),M.c('#ffd23f',{gloss:1.3}),[r*.42,r*1.5,0])});
def('top','funkweste','Funker-Weste',780,'#7fd34a',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);P(q,G.bx(r*.35,r*.25,r*.08,r*.03),M.c('#3b3450'),[r*.3,-r*.4,r*.83]);P(q,G.cy(r*.02,r*.02,r*.3),M.c('#e6ecf5',{gloss:1.4}),[r*.42,-r*.15,r*.85])});

/* ================= Möbel ================= */
furn('weltempfaenger',{n:'Weltempfänger',cat:'technik',price:2400,planet:ID,size:[1,1],h:.9,b:(g,m)=>{P(g,G.bx(.8,.5,.3,.08),gl(m,'#ff4a5a'),[0,.25,0]);P(g,G.cy(.16,.16,.04,20),m.c('#3b3450'),[-.2,.25,.15],[PI/2,0,0]);P(g,G.bx(.3,.12,.02,.01),m.c('#fff2c0'),[.18,.33,.16]);
  for(const x of[.1,.26])P(g,G.cy(.04,.04,.05,12),chr(m),[x,.15,.16],[PI/2,0,0]);P(g,G.cy(.015,.015,.9),chr(m),[.3,.9,0],[0,0,-.3])}});
furn('morsetaste',{n:'Morsetaste',cat:'technik',price:700,planet:ID,size:[1,1],h:.4,b:(g,m)=>{P(g,G.bx(.5,.06,.3,.02),m.c('#8a5a3a'),[0,.03,0]);P(g,G.bx(.32,.03,.06,.01),m.c('#c87a3a',{gloss:1.3}),[0,.12,0],[0,0,.08]);P(g,G.cy(.05,.05,.04,14),m.c('#3b3450'),[.14,.16,0])}});

/* ================= Sprache: Wellenschrift ================= */
function wellenGlyph(x,s,r){x.save();x.lineWidth=s*.07;x.lineCap='round';const n=1+Math.floor(r()*2);for(let i=0;i<n;i++){x.beginPath();const y0=(i-(n-1)/2)*s*.25,f=2+Math.floor(r()*3),A=s*(.06+r()*.08);for(let k=0;k<=20;k++){const t=k/20;const px=-s*.3+t*s*.6,py=y0+Math.sin(t*f*PI)*A;k?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}
  if(r()<.5){x.beginPath();x.arc(0,-s*.32,s*.05,0,TAU);x.fill()}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Funkturm-Planet',base:'kompost',R:120,R0:40,sea:-.3,music:'town',sky:['#8fc8ff','#e8f6ff'],fog:'#e8f0fa',water:'#5ab8e8',deep:'#2a6ac0',step:1.05,shop:ID,
    desc:'Antennen, Drahtbäume und Schüsselblumen. Irgendwo senden fünf unsichtbare Funkbaken. Der Peilempfänger hilft beim Suchen.',weather:'blueten',orbit:[208,0.8],size:1,col:['#a0dc84','#ff4a5a'],moons:2,
    park:'wellenwiese',parkPond:true,phone:['#e8f6ff','#ffe0e0'],stones:['kiesel','quarz','stein_klein'],plazaTree:'drahtbaum',path:'#d0d4e0',
    space:{deep:'#2a6ac0',water:'#5ab8e8',shore:'#e8c8a8',land:'#a0dc84',land2:'#88c86c',high:'#e0e4f0',cap:'#ffffff',atmo:'#8fc8ff',cloud:.5,sea:.36,capA:.4,freq:3},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'schuesselfeld',wet:'kupferufer',cold:'gipfelstation'},peak:'gipfelstation',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.2,4)*2.1+.6;/* sanfte Wellen im Gelände */h+=Math.sin(q.x*9+q.z*7)*.25;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'kupferufer';if(h>sea+4.3)return'gipfelstation';if(T>.3)return'schuesselfeld';if(M>.2)return'drahtwald';return'wellenwiese'},
    onLoad:W=>PEIL.onLoad(W),tick:(dt,t,W,me)=>PEIL.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Sender-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Echoteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Wellensee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Funk-Spielecke',mode:'Funker-Kleidung',praxis:'Empfangs-Praxis',museum:'Radio-Museum',shop:'Ersatzteil-Laden',studio:'Tonstudio',bar:'Sendepause-Bar',rathaus:'Sendezentrale',garage:'Übertragungswagen-Garage',pflanzen:'Antennen-Gärtnerei',tiere:'Echo-Tierladen'},
  sty:{wall:'putz',walls:['#fbf7f0','#f2f8ff','#f6f2ff'],roof:'dome',roofs:SIG.slice(0,4),trim:'#e6ecf5',plinth:'#a8a4bc',door:'#ff4a5a',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Sendeleiter Welle',{skin:'plastik',color:1,shape:'kapselspiel'},{kopf:'crtkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:['pager']}],
  lore:['Willkommen auf dem Funkturm-Planeten! Hier ist immer Sendezeit.','Fünf Funkbaken senden irgendwo da draussen. Sieh auf deinen Peilempfänger: Je mehr Balken, desto näher bist du.','Radiowellen sind unsichtbar, aber sie fliegen mit Lichtgeschwindigkeit um den ganzen Planeten.'],
  caveRock:['#b8b4c8','#a8a4bc','#9894ac',SIG.slice(0,3)],
  wear:['funkerkappe','funkweste','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'mast'},{fam:'kokon',style:'transistor'},{fam:'kokon',style:'schuesselhaus'},{fam:'kokon',style:'transistor'}]},
  residents:{skins:['plastik','bonbon','gold','glas'],heads:['crtkopf','kapselkopf','eikopf','vogel','mensch','katze','frosch'],names:['Welle','Funki','Antenne','Rauschi','Sender','Echo','Morse','Kanal','Megahertz','Pieps','Radi','Kurz'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fbf7f0','#f2f8ff','#f6f2ff'],roofCols:SIG.slice(0,4),win:['rund']},deco:['schuesselblume','kabelbusch','drahtbaum'],fence:false},
  lang:{n:'Wellenschrift',ink:'#2a6ac0',glow:'#ff4a5a',kind:'circuit',draw:wellenGlyph,syl:['fu','nk','we','le','ra','di','o','ka','na','me','ga','her']},ruinStone:'#b8b4c8',
  terraform:['wellenwiese','drahtwald','kupferufer','schuesselfeld'],
  weather:[['klar',4],['heiter',3],['regen',1],['nebel',1]]});

/* ================= Peilsuche ================= */
const PEIL=(()=>{let W_=null,bakes=[],ui=null,last=0,beepT=0,m_=null;const COUNT=5,SHOW=7,RANGE=70,LOHN=200;
  const S=()=>SAVE.peil=SAVE.peil||{got:[]};
  function bakeModel(m,i){const g=new THREE.Group();const q=grp(g,[0,0,0]);P(q,G.cy(.5,.6,.3,16),chr(m),[0,.15,0]);P(q,G.cy(.08,.1,2.2,10),gl(m,SIG[i%5]),[0,1.4,0]);
    for(let k=0;k<3;k++)P(q,G.to(.25+k*.15,.025),m.glow(SIG[i%5],1.4),[0,2.6+k*.05,0],[PI/2,0,0]).userData.noOutline=true;P(q,G.s(.14),m.glow('#ff4a5a',2),[0,2.6,0]);addOutlines(g);g.userData.q=q;return g}
  function mkUI(){if(ui)return ui;ui=document.createElement('div');ui.className='peil-ui';ui.innerHTML='<b>PEILEMPFÄNGER</b><div class="peil-bars">'+Array.from({length:8},(_,i)=>'<i style="height:'+(25+i*10.7)+'%"></i>').join('')+'</div><span></span>';
    Object.assign(ui.style,{position:'fixed',left:'14px',top:'130px',zIndex:20,background:'#10200a',color:'#c9f27a',font:'12px "VT323","Courier New",monospace',padding:'8px 10px',borderRadius:'14px',border:'3px solid #e6ecf5',boxShadow:'0 4px 0 rgba(0,0,0,.15)',minWidth:'130px',pointerEvents:'none'});
    const st=document.createElement('style');st.textContent='.peil-bars{display:flex;gap:3px;align-items:flex-end;height:28px;margin:4px 0}.peil-bars i{flex:1;background:#2a3a1a;border-radius:2px}.peil-bars i.on{background:#c9f27a}';document.head.append(st);document.body.append(ui);return ui}
  function onLoad(W){W_=W;bakes=[];m_=makeMats({skin:'plastik',color:0});const st=S();const r=srand(1901);
    for(let i=0;i<COUNT;i++){let d=null;for(let t=0;t<400&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.9||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(bakes.some(x=>angle(x.d,cd)*W.R<30))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;d=cd}
      if(!d)continue;const g=bakeModel(m_,i);GAME.placeObj(g,d,r()*TAU,0,true);const got=st.got.includes(i);g.userData.q.position.y=got?0:-3.2;g.visible=got;bakes.push({i,d,g,up:got?1:0,it:null})}}
  function found(b){const st=S();if(st.got.includes(b.i))return;st.got.push(b.i);persist();money(LOHN);SND.play('powerup',{rate:1.1});GAME.W&&GAME.W.fx&&GAME.W.fx(b.d,'stern',14);
    UI.toast('Funkbake '+st.got.length+' von '+COUNT+' gefunden! Plus '+LOHN+' Taler.',3000);if(typeof PIKO!=='undefined'&&st.got.length===1)PIKO.want('Eine Funkbake! Der Peilempfänger sucht schon nach der nächsten.');
    if(st.got.length===COUNT&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Sendeleiter Welle',['Alle fünf Funkbaken! Jetzt ist der ganze Planet wieder auf Sendung.','Für dich: ein Weltempfänger. Mit ihm hörst du jeden Sender im Sonnensystem.']);bagAdd('furn','weltempfaenger');bagAdd('relic','detektorradio');money(300);SND.jingle('j_success')},900)}}
  function tick(dt,t,W,me){last=performance.now();const u=mkUI();u.style.display='block';const st=S();
    for(const b of bakes){if(b.up<1&&st.got.includes(b.i)){b.up=Math.min(1,b.up+dt*.8);b.g.visible=true;b.g.userData.q.position.y=-3.2*(1-b.up)}if(b.g.visible)b.g.userData.q.rotation.y=t*.5}
    if(!me||!me.p)return;let best=null,bd=1e9;for(const b of bakes){if(st.got.includes(b.i))continue;const d=angle(me.p,b.d)*W.R;if(d<bd){bd=d;best=b}}
    const bars=u.querySelectorAll('.peil-bars i');const lab=u.querySelector('span');
    if(!best){bars.forEach(x=>x.classList.add('on'));lab.textContent='Alle Baken gefunden';return}
    const k=Math.max(0,Math.min(1,1-bd/RANGE));const n=Math.round(k*8);bars.forEach((x,i)=>x.classList.toggle('on',i<n));lab.textContent=n?('Signal '+Math.round(k*100)+' %'):'Rauschen …';
    beepT-=dt;if(n>0&&beepT<=0){SND.play('click',{rate:.8+k*1.4,vol:.25});beepT=.15+(1-k)*1.6}
    if(bd<SHOW)found(best)}
  /* ausserhalb des Planeten verschwindet die Anzeige */
  setInterval(()=>{if(ui&&performance.now()-last>800)ui.style.display='none'},500);
  return{onLoad,tick,bakes:()=>bakes,COUNT}
})();
window.PEIL=PEIL;
})();
