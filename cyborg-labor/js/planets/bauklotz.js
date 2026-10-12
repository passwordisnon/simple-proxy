/* =====================================================================
   CYBORG-LABOR · planets/bauklotz.js · Bauklotz-Planet
   Ein Planet wie ein Kinderzimmer-Boden: Holzspielzeug-Bäume aus
   Steckringen, Kegelbüsche, Steckblumen, Würfelfelsen, Bogensteine und
   Noppengras. Die Häuser sind Klotzburgen, Noppenhäuser und Würfeltürme.
   Besonderheit:
   · Baustellen: Drei Bauplätze mit Bauplan (Turm, Brücke, Burg). Überall
     liegen Bauklötze herum. Jeder Klotz, den man an einer Baustelle
     abgibt, wird sichtbar an seinen Platz gesetzt. Ist ein Bauplan fertig,
     gibt es Lohn, und das Bauwerk bleibt stehen.
   ===================================================================== */
(function(){
const ID='bauklotz';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const TOY=['#ff4a5a','#2fb5d9','#ffd23f','#7fd34a','#ff9a45','#9b6ae0'];
const hz=(m,c)=>m.c(c,{gloss:.5,rim:.8,rimColor:'#fff6e0'});
const gl=(m,c)=>m.c(c,{gloss:1.2,rim:1,rimColor:'#ffffff'});

/* ================= Natur ================= */
N('klotzbaum',{r:.35,h:3.8,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,1.8,2.6);P(g,G.cy(.18,.25,.3,14),hz(m,'#c8945a'),[0,.15,0]);P(g,G.cy(.08,.08,h,10),hz(m,'#e8c898'),[0,h/2+.3,0]);
  const n=5;for(let i=0;i<n;i++){const r=.85-i*.14;P(g,G.cy(r,r,.24,20),hz(m,TOY[(i+Math.floor(rnd()*6))%6]),[0,.5+h*.45+i*.28,0])}P(g,G.s(.22),hz(m,TOY[Math.floor(rnd()*6)]),[0,.5+h*.45+n*.28+.1,0])});
N('kegelbusch',{r:.45,h:1,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<3;i++){const a=i/3*TAU+rnd(),r=i?.3:0;P(g,G.co(.25,.7-i*.1,14),hz(m,TOY[(i+Math.floor(rnd()*6))%6]),[Math.cos(a)*r,.35,Math.sin(a)*r]);P(g,G.s(.08),hz(m,'#fff6e0'),[Math.cos(a)*r,.72-i*.1+.02,Math.sin(a)*r])}});
N('steckblume',{r:.15,h:.8,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.4,.7);P(g,G.cy(.035,.035,h,8),hz(m,'#7fd34a'),[0,h/2,0]);const c=TOY[Math.floor(rnd()*6)];P(g,G.cy(.15,.15,.08,6),hz(m,c),[0,h,0]);P(g,G.s(.06),hz(m,'#fff6e0'),[0,h+.06,0])});
N('wuerfelfels',{r:.6,h:1.2,size:'big',planet:ID},(g,m,o,rnd)=>{const n=2+Math.floor(rnd()*3);for(let i=0;i<n;i++){const s=RR(rnd,.45,.75);P(g,G.bx(s,s,s,.06),hz(m,TOY[(i+Math.floor(rnd()*6))%6]),[(rnd()-.5)*.7,s/2+(i>1?.5:0),(rnd()-.5)*.6],[0,rnd(),0])}});
N('bogenstein',{r:.7,h:1,size:'big',planet:ID},(g,m,o,rnd)=>{const c=TOY[Math.floor(rnd()*6)];for(const x of[-.45,.45])P(g,G.bx(.3,.6,.4,.04),hz(m,c),[x,.3,0]);P(g,new THREE.TorusGeometry(.45,.15,8,18,PI),hz(m,TOY[(TOY.indexOf(c)+2)%6]),[0,.6,0],null,[1,1,1.3])});
N('noppengras',{r:.12,h:.25,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=gl(m,'#7fd34a');for(let i=0;i<3;i++)P(g,G.cy(.06,.06,.08,10),c,[(rnd()-.5)*.25,.04,(rnd()-.5)*.25])});
Object.assign(NH.ROCK,{[ID]:['#e8c898','#c8945a','#ff4a5a']});

/* ================= Biome ================= */
const BI={
  klotzwiese:{n:'Klotzwiese',g:['#a8dc84','#9cd078'],cliff:'#c8945a',pat:'gras',grass:'#a0d880',grassD:.9,trees:[['klotzbaum',1]],treeD:.45,
    deco:[['steckblume',5],['noppengras',4],['kegelbusch',1]],decoD:6,rocks:[['wuerfelfels',.3],['bogenstein',.2]],rockD:.3,litter:[['bauklotz',1.6],['holzperle',.5]]},
  kegelwald:{n:'Kegelwald',g:['#8cc874','#80bc68'],cliff:'#a87a5a',pat:'moos',grass:'#8cc874',grassD:1,trees:[['klotzbaum',2.6]],treeD:1.3,
    deco:[['kegelbusch',3],['steckblume',2]],decoD:5,rocks:[['wuerfelfels',.3]],rockD:.3,litter:[['bauklotz',1.2]]},
  noppenfeld:{n:'Noppenfeld',g:['#f2e0b0','#e8d4a4'],cliff:'#c8a070',pat:'sand',grass:null,grassD:0,trees:[['klotzbaum',.2]],treeD:.15,
    deco:[['noppengras',4],['steckblume',1]],decoD:3,rocks:[['wuerfelfels',.8],['bogenstein',.5]],rockD:.6,litter:[['bauklotz',2],['holzperle',.6]]},
  bauufer:{n:'Bau-Ufer',g:['#b8e4f0','#a8d8e8'],cliff:'#8aa8c0',pat:'sand',grass:'#a8dcea',grassD:.4,trees:[['klotzbaum',.5]],treeD:.3,
    deco:[['kegelbusch',1],['steckblume',1]],decoD:2,rocks:[['bogenstein',.4]],rockD:.3,litter:[['bauklotz',1],['muschel',.6]]},
  klotzgipfel:{n:'Klotzgipfel',g:['#f4ece0','#e8e0d4'],cliff:'#c8b8a0',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['noppengras',1]],decoD:1,rocks:[['wuerfelfels',1.4]],rockD:1,litter:[['bauklotz',1.2]]}};

/* ================= Sammelsachen ================= */
IT('bauklotz',itMeta('Bauklotz','bauklotz','material',15),(g,m)=>{P(g,G.bx(.2,.2,.2,.03),hz(m,TOY[Math.floor(Math.random()*6)]),[0,.1,0])});
IT('holzperle',itMeta('Holzperle','bauklotz','material',30),(g,m)=>{P(g,G.s(.08),hz(m,'#ff9a45'),[0,.08,0]);P(g,G.cy(.02,.02,.17,8),hz(m,'#5a3a1a'),[0,.08,0])});

/* ================= Fische ================= */
F('holzfisch',fishMeta('Holzfisch','bauklotz','teich','S','immer',1,140,'Ich hab einen Holzfisch gefangen! Er hat einen kleinen Magneten im Maul.','Beim Angelspiel hat jeder Holzfisch ein Stück Metall oder einen Magneten. Die Angel hat auch einen Magneten – so «beissen» die Fische an.'),
  (g,m)=>{P(g,G.s(.2),hz(m,'#ff9a45'),[0,0,0],null,[.4,.7,1.2]);P(g,G.co(.12,.18,3),hz(m,'#ff9a45'),[0,0,-.3],[-PI/2,0,0],[.3,1,1]);P(g,G.cy(.04,.04,.03,10),m.c('#c8ccd8',{gloss:1.4}),[0,0,.24],[PI/2,0,0]);eye(g,m,[.07,.05,.12],.03,[.6,.3,.6]);eye(g,m,[-.07,.05,.12],.03,[-.6,.3,.6])});
F('stapelbarsch',fishMeta('Stapelbarsch','bauklotz','teich','M','tag',2,380,'Ich hab einen Stapelbarsch gefangen! Seine Streifen sehen aus wie gestapelte Klötze.','Barsche haben stachelige Rückenflossen. Damit schützen sie sich davor, von grösseren Fischen geschluckt zu werden.'),
  (g,m)=>fishT(g,m,{id:'stapelbarsch',H:.24,L:.65,back:'#7fd34a',belly:'#fff6e0',tail:'fork',dorsal:'hi',pat:(x,w,h)=>{const c=['#ff4a5a','#2fb5d9','#ffd23f'];for(let i=0;i<5;i++){x.fillStyle=c[i%3];x.fillRect(w*(.22+i*.11),0,w*.06,h*.6)}}}));
F('klotzwels',fishMeta('Klotzwels','bauklotz','meer','L','nacht',3,1300,'Ich hab einen Klotzwels gefangen! Sein Kopf ist eckig wie ein Bauklotz.','Der grösste Süsswasserfisch Europas ist der Wels. Er kann über zwei Meter lang werden.'),
  (g,m)=>{P(g,G.bx(.3,.26,.3,.05),hz(m,'#8a6a4a'),[0,0,.35]);P(g,G.tu([[0,0,.2],[0,0,-.2],[0,.02,-.6]],.15,.06,12),hz(m,'#8a6a4a'));for(const s of[-1,1])P(g,G.tu([[s*.1,-.06,.5],[s*.3,-.12,.55]],.012,.008,6),m.c('#3b3450'));eye(g,m,[.1,.08,.5],.03,[.6,.3,.6]);eye(g,m,[-.1,.08,.5],.03,[-.6,.3,.6])});

/* ================= Insekten ================= */
B('stapelameise',bugMeta('Stapel-Ameise','bauklotz','boden','tag',1,150,'Ich hab eine Stapel-Ameise gefangen! Sie trägt einen Klotz, der grösser ist als sie.','Ameisen können ein Vielfaches ihres eigenen Körpergewichts tragen. Gemeinsam bauen sie riesige Ameisenhaufen.'),
  (g,m)=>{const c=m.c('#c84a3a',{gloss:1});for(let i=0;i<3;i++)P(g,G.s(.06+i*.01),c,[0,.1,-.1+i*.1]);bugFace(g,m,[0,.11,.15],.05,.5);P(g,G.bx(.12,.12,.12,.02),hz(m,'#2fb5d9'),[0,.26,.02]);legs(g,c,[[.05,.08,.05],[0,.08,0],[-.05,.08,-.05]],.15)});
B('kreiselkaefer',bugMeta('Kreiselkäfer','bauklotz','boden','nacht',2,440,'Ich hab einen Kreiselkäfer gefangen! Er dreht sich im Kreis, wenn er sich freut.','Taumelkäfer schwimmen auf dem Wasser in schnellen Kreisen. Ihre Augen sind geteilt: eine Hälfte sieht über, die andere unter Wasser.'),
  (g,m)=>{P(g,G.co(.18,.25,16),hz(m,'#9b6ae0'),[0,.2,0],[PI,0,0]);P(g,G.cy(.18,.18,.04,16),hz(m,'#ffd23f'),[0,.33,0]);bugFace(g,m,[0,.25,.16],.06,.5);legs(g,m.c('#3b3450'),[[.1,.15,.08],[0,.15,0],[-.1,.15,-.08]],.16)});
B('holzbock',bugMeta('Holzbock-Falter','bauklotz','luft','tag',3,880,'Ich hab einen Holzbock-Falter gefangen! Seine Flügel sehen aus wie lackiertes Holz.','Holz hat Jahresringe. An ihnen sieht man, wie alt ein Baum war: jedes Jahr kommt ein Ring dazu.'),
  (g,m)=>butterfly(g,m,'holzbock','#e8c898','#c8945a','#5a3a1a'));

/* ================= Fundstücke ================= */
REL('erster_bauklotz',relMeta('Der erste Bauklotz','bauklotz','schatz',3,2000,'Ein abgegriffener roter Holzklotz. Auf der Unterseite steht: «Hier fing alles an».','Bauklötze helfen Kindern, Formen, Grössen und Gleichgewicht zu verstehen. Schon vor über 200 Jahren gab es Holzbaukästen.'),
  (g,m)=>{P(g,G.bx(.3,.3,.3,.05),hz(m,'#ff4a5a'),[0,.15,0],[0,.3,0])});
REL('bauplan_burg',relMeta('Bauplan einer Burg','bauklotz','kunst',2,900,'Ein gezeichneter Bauplan: «Burg aus 100 Klötzen. Geht bestimmt.»','Baumeister zeichnen Pläne von oben (Grundriss) und von der Seite (Ansicht). So weiss jeder, wo welcher Stein hinkommt.'),
  (g,m)=>{P(g,G.bx(.5,.006,.36,0),m.c('#2a5ac8'),[0,.01,0]);for(let i=0;i<4;i++)P(g,G.bx(.08,.008,.08,0),m.c('#ffffff'),[-.15+i*.1,.015,i%2?.05:-.05]).userData.noOutline=true});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  nachziehente:{n:'Nachzieh-Ente',planet:ID,biomes:['klotzwiese','bauufer'],count:4,size:.55,speed:.9,gait:'waddle',voice:['quak','klack','quak-klack'],pitch:500,likes:['bauklotz','steckblume'],product:'holzperle',names:['Klacker','Rolli','Schnatter','Räderchen','Zieh'],
    fact:'Nachziehtiere aus Holz gibt es seit Hunderten von Jahren. Wenn man an der Schnur zieht, wackeln oft Flügel oder Kopf mit.',a:{col:'#ffd23f',belly:'#fff6e0',body:[.32,.28,.42],by:.32,head:{r:.22,p:[0,.66,.32]},snout:{type:'bill',col:'#ff9a45'},ears:{type:'none'},legs:{n:0},tail:{type:'fan',col:'#ffd23f'},wings:{col:'#ff9a45'}}},
  steckigel:{n:'Steck-Igel',planet:ID,biomes:['kegelwald','klotzwiese'],count:3,size:.5,speed:.6,gait:'waddle',shy:true,voice:['schnuff','pfff','tschik'],pitch:600,likes:['holzperle','stapelameise'],product:'bauklotz',names:['Stecki','Pieks','Kegel','Bunt','Nadel'],
    fact:'Ein Igel hat etwa 6000 bis 8000 Stacheln. Bei Gefahr rollt er sich zu einer stacheligen Kugel zusammen.',a:{col:'#c8945a',belly:'#f2e0c8',body:[.28,.22,.32],head:{r:.16,p:[0,.24,.3]},snout:{type:'long',col:'#f2e0c8',nose:'#3b3450'},ears:{type:'round',len:.2},legs:{n:4,len:.06,r:.05,foot:'#5a3a1a'},tail:{type:'nub'},spots:{col:'#ff4a5a',n:8,s:.5},gait:'waddle'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','klotzkrone','Klotz-Krone',460,'#ffd23f',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.15,0]);for(let k=0;k<6;k++){const a=k/6*TAU;P(q,G.bx(r*.3,r*.3,r*.3,r*.04),M.c(TOY[k],{gloss:.6}),[Math.cos(a)*r*.65,0,Math.sin(a)*r*.65],[0,-a,0])}});
def('top','baumeisterweste','Baumeister-Weste',760,'#ff9a45',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);for(const yy of[-.3,-.6])P(q,G.cy(r*.85,r*.91,r*.06,Q(16),1,true),M.c('#fff6e0',{gloss:1}),[0,r*yy,0])});

/* ================= Möbel ================= */
furn('kugelbahn',{n:'Kugelbahn',cat:'spiel',price:2200,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{P(g,G.bx(.7,.08,.7,.03),hz(m,'#e8c898'),[0,.04,0]);const pts=[];for(let k=0;k<=40;k++){const t=k/40,a=t*TAU*2.5;pts.push([Math.cos(a)*.25,1.4-t*1.25,Math.sin(a)*.25])}P(g,G.tu(pts,.035,.035,80),hz(m,'#ff4a5a'));P(g,G.cy(.03,.03,1.5,8),hz(m,'#c8945a'),[0,.75,0]);
  const ball=P(g,G.s(.06),m.c('#2fb5d9',{gloss:1.5}),[0,1.4,0]);g.userData.tick=t=>{const k=(t*.3)%1,a=k*TAU*2.5;ball.position.set(Math.cos(a)*.25,1.45-k*1.25,Math.sin(a)*.25)}}});
furn('klotzturm_mini',{n:'Klotzturm',cat:'deko',price:600,planet:ID,size:[1,1],h:1.2,b:(g,m)=>{for(let i=0;i<5;i++)P(g,G.bx(.32,.22,.32,.04),hz(m,TOY[i]),[(i%2-.5)*.04,.11+i*.22,0],[0,i*.2,0])}});

/* ================= Sprache: Klotzschrift ================= */
function klotzGlyph(x,s,r){x.save();const n=2+Math.floor(r()*3);for(let i=0;i<n;i++){const w=s*(.1+Math.floor(r()*3)*.06),h=s*.1;x.fillRect(-s*.25+r()*s*.3,-s*.25+i*s*.14,w,h)}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Bauklotz-Planet',base:'kompost',R:118,R0:40,sea:-.3,music:'town',sky:['#9fd0ff','#fff4e0'],fog:'#f2f0e8',water:'#5ab8e8',deep:'#2a6ac0',step:1.05,shop:ID,
    desc:'Ein Planet wie ein Kinderzimmer-Boden voller Holzspielzeug. Sammle Bauklötze und baue nach Bauplan einen Turm, eine Brücke und eine Burg.',weather:'blueten',orbit:[250,3.9],size:1,col:['#a8dc84','#ff4a5a'],moons:1,
    park:'klotzwiese',parkPond:true,phone:['#fff4e0','#e0f0ff'],stones:['kiesel','bauklotz','stein_klein'],plazaTree:'klotzbaum',path:'#e8d0a8',
    space:{deep:'#2a6ac0',water:'#5ab8e8',shore:'#f2e0b0',land:'#a8dc84',land2:'#8cc874',high:'#f4ece0',cap:'#ffffff',atmo:'#9fd0ff',cloud:.45,sea:.36,capA:.4,freq:2.6},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'noppenfeld',wet:'bauufer',cold:'klotzgipfel'},peak:'klotzgipfel',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.05,4)*2+.7;/* Klötzchen-Stufen */const k=N2(q.x*.5,q.y*.5,q.z*.5);if(k>0)h=h*.4+Math.round(h*1.5)/1.5*.6;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'bauufer';if(h>sea+4.4)return'klotzgipfel';if(T>.3)return'noppenfeld';if(M>.2)return'kegelwald';return'klotzwiese'},
    onLoad:W=>BAU.onLoad(W),tick:(dt,t,W,me)=>BAU.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Klötzchen-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Planschbecken',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Bausee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Spielzimmer',mode:'Kostümkiste',praxis:'Pflaster-Praxis',museum:'Spielzeug-Museum',shop:'Klotzladen',studio:'Mal-Atelier',bar:'Saftbar',rathaus:'Bauamt',garage:'Bagger-Garage',pflanzen:'Steckblumen-Gärtnerei',tiere:'Holztier-Laden'},
  sty:{wall:'putz',walls:['#fff6e0','#f2f8ff','#fff0f0'],roof:'dome',roofs:TOY.slice(0,4),trim:'#fff6e0',plinth:'#c8945a',door:'#2fb5d9',win:'rund',pitch:.9},
  wall:'streifen',floor:'parkett',
  mayor:['Baumeister Klotz',{skin:'plastik',color:2,shape:'kapselspiel'},{kopf:'kapselkopf',augen:'mensch',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen auf dem Bauklotz-Planeten! Hier ist alles aus Holz und Farbe. Und überall liegen Klötze herum.','Drei Baustellen warten auf Klötze: ein Turm, eine Brücke und eine Burg. Jeder Klotz zählt.','Wenn etwas umfällt, baut man es einfach noch einmal. Das ist hier das wichtigste Gesetz.'],
  caveRock:['#e8c898','#c8945a','#a87a5a',TOY.slice(0,3)],
  wear:['klotzkrone','baumeisterweste','kappe','latzhose'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','crate',.42,'ds',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'klotzburg'},{fam:'kokon',style:'noppenhaus'},{fam:'kokon',style:'wuerfelturm'},{fam:'kokon',style:'noppenhaus'}]},
  residents:{skins:['plastik','holz','bonbon','fell'],heads:['kapselkopf','mensch','katze','vogel','frosch','eikopf'],names:['Klotz','Stapel','Noppe','Kegel','Würfel','Bogen','Turm','Bauli','Ecke','Kante','Steckel','Klötzchen'],
    house:{shapes:['haus','rund'],walls:['putz'],wallCols:['#fff6e0','#f2f8ff','#fff0f0'],roofCols:TOY.slice(0,4),win:['rund']},deco:['steckblume','kegelbusch','klotzbaum'],fence:false},
  lang:{n:'Klotzschrift',ink:'#c84a3a',glow:'#ffd23f',kind:'runes',draw:klotzGlyph,syl:['klo','tz','ba','u','sta','pel','no','ppe','ke','gel','tu','rm']},ruinStone:'#e8c898',
  terraform:['klotzwiese','kegelwald','bauufer','noppenfeld'],
  weather:[['klar',4],['heiter',3],['regen',1]]});

/* ================= Baustellen ================= */
/* Baupläne als Liste von Klötzen: [x,y,z,b,h,t,Farbindex] */
function planTurm(){const a=[];for(let i=0;i<8;i++){const w=1.4-i*.08;a.push([((i%2)-.5)*.06,.3+i*.6,0,w,.58,w,i%6])}return a}
function planBruecke(){const a=[];for(const x of[-2.4,2.4])for(let i=0;i<3;i++)a.push([x,.3+i*.6,0,.9,.58,1,i%6]);for(let i=0;i<5;i++)a.push([-2.4+i*1.2,2.1,0,1.18,.4,1.2,(i+3)%6]);return a}
function planBurg(){const a=[];for(const x of[-1.6,1.6])for(let i=0;i<3;i++)a.push([x,.3+i*.6,0,.9,.58,.9,(i+1)%6]);for(let i=0;i<3;i++)a.push([-.8+i*.8,.3,0,.78,.58,.9,(i+2)%6]);a.push([-.8,.9,0,.78,.58,.9,4]);a.push([.8,.9,0,.78,.58,.9,5]);a.push([0,1.5,0,2.36,.58,.9,0]);for(const x of[-1.6,0,1.6])a.push([x,2.1,0,.6,.58,.6,2]);return a}
const PLANS=[{n:'Turm',f:planTurm,lohn:300},{n:'Brücke',f:planBruecke,lohn:450},{n:'Burg',f:planBurg,lohn:600}];
const BAU=(()=>{let W_=null,m_=null,sites=[];
  const S=()=>SAVE.bau=SAVE.bau||{n:[0,0,0]};
  function siteModel(m,i){const g=new THREE.Group();P(g,G.cy(3.6,3.8,.2,24),hz(m,'#e8d0a8'),[0,.1,0]);for(let k=0;k<12;k++){const a=k/12*TAU;P(g,G.bx(.5,.06,.18,.02),gl(m,k%2?'#ffd23f':'#3b3450'),[Math.cos(a)*3.7,.22,Math.sin(a)*3.7],[0,-a,0])}
    const sign=ctex('bau-sign-'+i,256,64,(x,w,h)=>{x.fillStyle='#2a5ac8';x.fillRect(0,0,w,h);x.strokeStyle='#ffffff';x.lineWidth=4;x.strokeRect(6,6,w-12,h-12);x.fillStyle='#ffffff';x.font='900 30px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('BAUPLAN: '+PLANS[i].n.toUpperCase(),w/2,h/2+2)});
    P(g,G.cy(.06,.06,1.6,8),hz(m,'#c8945a'),[2.9,.8,-2.2]);const sm=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.45),new THREE.MeshBasicMaterial({map:sign,side:THREE.DoubleSide}));sm.position.set(2.9,1.7,-2.2);sm.userData.noOutline=true;g.add(sm);
    const blocks=PLANS[i].f().map((b,k)=>{const ghost=P(g,G.bx(b[3],b[4],b[5],.05),m.c('#8fe3ff',{opacity:.22,gloss:.3}),[b[0],b[1]+.2,b[2]]);ghost.userData.noMerge=true;ghost.userData.noOutline=true;
      const real=P(g,G.bx(b[3],b[4],b[5],.06),hz(m,TOY[b[6]]),[b[0],b[1]+.2,b[2]]);real.visible=false;real.userData.noMerge=true;return{ghost,real,y:b[1]+.2}});
    addOutlines(g);return{g,blocks}}
  function show(site,count,anim){site.blocks.forEach((b,k)=>{const on=k<count;b.real.visible=on;b.ghost.visible=!on;if(on&&anim&&k===count-1){const t0=performance.now();const y=b.y;const drop=()=>{const q=Math.min(1,(performance.now()-t0)/350);b.real.position.y=y+(1-q)*(1-q)*2.5;if(q<1)requestAnimationFrame(drop)};drop()}})}
  function onLoad(W){W_=W;sites=[];m_=makeMats({skin:'plastik',color:0});const st=S();const r=srand(5151);const pl=GAME.G.places.find(p=>p.id==='platz');const used=[];
    for(let i=0;i<PLANS.length;i++){let d=null;for(const[lo,hi,np]of[[22,50,1.3],[18,90,1.15],[14,140,1.05]]){for(let t=0;t<600&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=pl?angle(cd,pl.dir)*W.R:99;if(a<lo||a>hi)continue;if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.4)continue;if(used.some(x=>angle(x,cd)*W.R<20))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,np))continue;d=cd}if(d)break}
      if(!d)continue;used.push(d);const s=siteModel(m_,i);GAME.placeObj(s.g,d,r()*TAU,0,true);const site={i,d,...s};show(site,st.n[i]||0,false);sites.push(site);
      W.inter.push({kind:'baustelle',p:d,r:4,label:'Baustelle '+PLANS[i].n+': Klotz einsetzen',act:()=>place(site)})}}
  function place(site){const st=S();const need=site.blocks.length;const n=st.n[site.i]||0;if(n>=need){UI.toast('Der '+PLANS[site.i].n+' ist fertig. Schön geworden!',2200);return}
    const have=SAVE.bag.find(x=>x.kind==='item'&&x.id==='bauklotz');if(!have){UI.toast('Du brauchst Bauklötze. Sie liegen überall auf den Wiesen. Noch '+(need-n)+' für diesen Bauplan.',3000);return}
    bagTake('item','bauklotz',1);st.n[site.i]=n+1;persist();show(site,n+1,true);SND.play('click',{rate:.7+n*.05});
    if(n+1<need){UI.toast(PLANS[site.i].n+': '+(n+1)+' von '+need+' Klötzen.',1500);return}
    money(PLANS[site.i].lohn);SND.play('powerup');UI.toast(PLANS[site.i].n+' fertig gebaut! Plus '+PLANS[site.i].lohn+' Taler.',3000);
    const done=PLANS.every((p,k)=>(st.n[k]||0)>=PLANS[k].f().length);if(done&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Baumeister Klotz',['Turm, Brücke und Burg! Du bist ab heute Ehren-Baumeisterin oder Ehren-Baumeister.','Hier ist eine Kugelbahn für dein Zimmer. Und der allererste Bauklotz für das Museum.']);bagAdd('furn','kugelbahn');bagAdd('relic','erster_bauklotz');money(300);SND.jingle('j_success')},900)}}
  function tick(dt,t){for(const s of sites)for(const b of s.blocks)if(b.ghost.visible)b.ghost.material.opacity=.15+Math.sin(t*2)*.08}
  return{onLoad,tick,sites:()=>sites,_place:place}
})();
window.BAU=BAU;
})();
