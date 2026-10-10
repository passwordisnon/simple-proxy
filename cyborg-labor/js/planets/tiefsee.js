/* =====================================================================
   CYBORG-LABOR · planets/tiefsee.js · Leuchtquallen-Tiefsee
   Ein Planet wie der Grund eines tiefen Meeres: Röhrenwürmer mit roten
   Federkronen, Leuchtkorallen, Tiefseeschwämme, Anglerlaternen und
   Muschelfelsen. Über allem treiben leuchtende Quallen durch die Luft.
   Die Häuser sind Riesenmuscheln, Quallen-Kuppeln und gelbe U-Boote.
   Besonderheit:
   · Leuchtriff: Fünf Korallensäulen leuchten in einer Reihenfolge auf,
     jede mit eigenem Ton. Man berührt sie danach in derselben Folge.
     Vier Runden mit 3, 4, 5 und 6 Lichtern. Ein Fehler ist kein Problem:
     Die Runde wird einfach noch einmal gezeigt.
   ===================================================================== */
(function(){
const ID='tiefsee';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const GLOW=['#45e0ff','#ff6fd8','#7fffd4','#b89aff','#ffd23f'];
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1.2,rimColor:'#c8f0ff'});

/* ================= Natur ================= */
N('roehrenwurm',{r:.35,h:2.2,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const n=4+Math.floor(rnd()*4);for(let i=0;i<n;i++){const a=rnd()*TAU,r=rnd()*.35,h=RR(rnd,1,2.2);const x=Math.cos(a)*r,z=Math.sin(a)*r;
  P(g,G.cy(.07,.09,h,10),m.c('#f2ecf8',{gloss:.8}),[x,h/2,z]);const q=grp(g,[x,h,z]);for(let k=0;k<8;k++){const b=k/8*TAU;P(q,G.co(.025,.25,4),m.c('#ff3b6b',{gloss:1,rim:1}),[Math.cos(b)*.08,.12,Math.sin(b)*.08],[Math.sin(b)*.4,0,-Math.cos(b)*.4])}}});
N('leuchtkoralle',{r:.4,h:1.4,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const c=GLOW[Math.floor(rnd()*5)];const br=(p,dir,L,d)=>{const e=[p[0]+dir[0]*L,p[1]+dir[1]*L,p[2]+dir[2]*L];P(g,G.tu([p,e],.06*(1-d*.25),.045*(1-d*.25),6),gl(m,c));if(d>=2){P(g,G.s(.07),m.glow(c,1.6),e);return}for(let k=0;k<2;k++){const a=rnd()*TAU;br(e,[Math.cos(a)*.5,.8,Math.sin(a)*.5],L*.7,d+1)}};br([0,0,0],[0,1,0],.45,0)});
N('tiefseeschwamm',{r:.4,h:1.2,size:'small',planet:ID},(g,m,o,rnd)=>{const c=['#ffb08a','#ffd27a','#c8a0f0'][Math.floor(rnd()*3)];const n=2+Math.floor(rnd()*3);for(let i=0;i<n;i++){const h=RR(rnd,.5,1.2),a=rnd()*TAU,r=i?.25:0;P(g,G.cy(.16,.12,h,12,1,true),m.c(c,{side:THREE.DoubleSide}),[Math.cos(a)*r,h/2,Math.sin(a)*r]);P(g,G.to(.16,.03),m.c(c),[Math.cos(a)*r,h,Math.sin(a)*r],[PI/2,0,0])}});
N('anglerlaterne',{r:.3,h:1.4,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.8,1.3);P(g,G.tu([[0,0,0],[.1,h*.6,0],[.3,h,0],[.4,h*.85,0]],.03,.015,12),m.c('#3b3450'));P(g,G.s(.12),m.glow(GLOW[Math.floor(rnd()*5)],1.8),[.42,h*.8,0]);
  for(let i=0;i<4;i++){const a=i/4*TAU;P(g,G.s(.12),m.c('#2a3a6a'),[Math.cos(a)*.15,.06,Math.sin(a)*.15],null,[1,.5,1.6])}});
N('muschelfels',{r:.7,h:1,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.7,.12,3,rnd()*9),m.c('#4a5a8a'),[0,.35,0],null,[1.2,.6,1]);for(let i=0;i<4;i++){const a=rnd()*TAU;const q=grp(g,[Math.cos(a)*.5,.5+rnd()*.2,Math.sin(a)*.5],[rnd(),a,0]);P(q,G.hs(.14),m.c('#f8e0ec'),[0,0,0],null,[1,.4,1.2])}});
N('tiefseegras',{r:.12,h:.5,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#3a8a8a');for(let i=0;i<4;i++){const a=rnd()*TAU,h=RR(rnd,.25,.5);P(g,G.tu([[0,0,0],[Math.cos(a)*.06,h*.5,Math.sin(a)*.06],[Math.cos(a+1)*.04,h,Math.sin(a+1)*.04]],.02,.01,8),c)}});
Object.assign(NH.ROCK,{[ID]:['#4a5a8a','#3a4a7a','#45e0ff']});

/* ================= Biome ================= */
const BI={
  tiefseeboden:{n:'Tiefseeboden',g:['#3a6a8a','#346280'],cliff:'#2a3a6a',pat:'sand',grass:'#3a7a8a',grassD:.5,trees:[['roehrenwurm',.8]],treeD:.4,
    deco:[['tiefseegras',4],['anglerlaterne',2],['tiefseeschwamm',1]],decoD:5,rocks:[['muschelfels',.5]],rockD:.4,litter:[['leuchtalge',1],['perle_klein',.3]]},
  leuchtriff:{n:'Leuchtriff',g:['#2e5a7a','#285470'],cliff:'#2a3a6a',pat:'moos',grass:'#2e6a7a',grassD:.8,trees:[['roehrenwurm',1.5]],treeD:.9,
    deco:[['leuchtkoralle',5],['tiefseeschwamm',2],['anglerlaterne',1]],decoD:6,rocks:[['muschelfels',.4]],rockD:.3,litter:[['leuchtalge',1.4],['perle_klein',.4]]},
  sandgrund:{n:'Sandgrund',g:['#8aa8b8','#7e9cac'],cliff:'#5a6a8a',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['tiefseegras',2],['anglerlaterne',1]],decoD:2,rocks:[['muschelfels',1]],rockD:.6,litter:[['muschel',1.2],['perle_klein',.3]]},
  schlotfeld:{n:'Schlotfeld',g:['#4a4a6a','#40405e'],cliff:'#2a2a4a',pat:'staub',grass:null,grassD:0,trees:[['roehrenwurm',2]],treeD:.6,
    deco:[['tiefseeschwamm',1]],decoD:1.5,rocks:[['muschelfels',.8]],rockD:.6,litter:[['leuchtalge',.6]]},
  tiefgraben:{n:'Tiefgraben',g:['#22406a','#1e3a62'],cliff:'#1a2a5a',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['anglerlaterne',3],['leuchtkoralle',1]],decoD:2,rocks:[['muschelfels',.6]],rockD:.5,litter:[['leuchtalge',1]]}};

/* ================= Sammelsachen ================= */
IT('leuchtalge',itMeta('Leuchtalge','tiefsee','material',30),(g,m)=>{for(let i=0;i<5;i++)P(g,G.s(.04),m.glow(GLOW[i%3],1.5),[Math.cos(i*1.3)*.08,.04+i*.02,Math.sin(i*1.3)*.08])});
IT('perle_klein',itMeta('Kleine Perle','tiefsee','material',120),(g,m)=>P(g,G.s(.07),m.c('#fff6ff',{gloss:1.6,rim:1.4,rimColor:'#c8e8ff'}),[0,.07,0]));

/* ================= Fische ================= */
F('anglerfisch',fishMeta('Anglerfisch','tiefsee','meer','M','nacht',3,1600,'Ich hab einen Anglerfisch gefangen! Er hat eine eigene kleine Lampe auf der Stirn.','Anglerfische locken in der dunklen Tiefsee Beute mit einem Leuchtköder an. Das Licht machen winzige Bakterien.'),
  (g,m)=>{const c=m.c('#3a3a5a',{gloss:.9});P(g,G.s(.3),c,[0,0,0],null,[.9,.85,1.1]);for(let k=0;k<6;k++)P(g,G.co(.025,.1,4),m.c('#fffdf7'),[(k-2.5)*.06,-.06,.3],[PI,0,0]);P(g,G.tu([[0,.25,.1],[0,.45,.25],[0,.38,.45]],.012,.008,10),c);P(g,G.s(.06),m.glow('#7fffd4',1.8),[0,.38,.47]);
    P(g,G.co(.12,.2,3),c,[0,0,-.38],[-PI/2,0,0],[1,1,.2]);eye(g,m,[.12,.1,.2],.04,[.6,.3,.6]);eye(g,m,[-.12,.1,.2],.04,[-.6,.3,.6])});
F('laternenfisch',fishMeta('Laternenfisch','tiefsee','meer','S','nacht',1,180,'Ich hab einen Laternenfisch gefangen! An seinem Bauch leuchten kleine Punkte.','Laternenfische gehören zu den häufigsten Fischen der Welt. Nachts schwimmen sie aus der Tiefe nach oben, um zu fressen.'),
  (g,m)=>{fishT(g,m,{id:'laternenfisch',H:.16,L:.5,back:'#3a4a7a',belly:'#a8b8d8',tail:'fork',dorsal:'std'});for(let k=0;k<6;k++)P(g,G.s(.018),m.glow('#45e0ff',1.8),[.045,-.05,-.15+k*.06])});
F('beilfisch',fishMeta('Beilfisch','tiefsee','meer','S','immer',2,420,'Ich hab einen Beilfisch gefangen! Er ist silbern und dünn wie eine Münze.','Beilfische leuchten an der Unterseite genau so hell wie das Licht von oben. So sieht man ihren Schatten von unten nicht.'),
  (g,m)=>{const c=m.c('#d8e0f0',{gloss:1.5,rim:1.2});P(g,G.s(.2),c,[0,0,0],null,[.18,1,1]);P(g,G.co(.1,.18,3),c,[0,0,-.25],[-PI/2,0,0],[.2,1,1]);for(let k=0;k<5;k++)P(g,G.s(.02),m.glow('#45e0ff',1.6),[0,-.15,-.08+k*.04]);eye(g,m,[.04,.08,.12],.04,[.6,.3,.6]);eye(g,m,[-.04,.08,.12],.04,[-.6,.3,.6])});

/* ================= Insekten (Kleintiere am Grund) ================= */
B('tiefseefloh',bugMeta('Tiefsee-Flohkrebs','tiefsee','boden','immer',1,150,'Ich hab einen Flohkrebs gefangen! Er hüpft wie ein Floh.','Flohkrebse leben überall, sogar im tiefsten Graben der Erde, fast 11 Kilometer unter dem Meer.'),
  (g,m)=>{const c=m.c('#ffb8a0',{gloss:1});for(let k=0;k<5;k++)P(g,G.s(.07-k*.006),c,[0,.1+Math.sin(k*.6)*.04,-.12+k*.06]);bugFace(g,m,[0,.12,.2],.06,.5);legs(g,c,[[.06,.06,.05],[0,.06,0],[-.06,.06,-.05]],.12)});
B('glimmfalter',bugMeta('Glimmfalter','tiefsee','luft','nacht',2,480,'Ich hab einen Glimmfalter gefangen! Seine Flügel glimmen wie Leuchtalgen.','Manche Pilze und Algen leuchten im Dunkeln. Man nennt das Biolumineszenz – lebendes Licht.'),
  (g,m)=>butterfly(g,m,'glimmfalter','#7fffd4','#45e0ff','#2a3a6a'));
B('perlenkaefer',bugMeta('Perlenkäfer','tiefsee','boden','tag',3,900,'Ich hab einen Perlenkäfer gefangen! Er glänzt wie eine Perle.','Perlen entstehen, wenn ein Sandkorn in eine Muschel gerät. Die Muschel umhüllt es Schicht für Schicht mit Perlmutt.'),
  (g,m)=>{P(g,G.s(.18),m.c('#fff6ff',{gloss:1.6,rim:1.4,rimColor:'#c8e8ff'}),[0,.16,0],null,[1,.75,1.2]);bugFace(g,m,[0,.16,.24],.07,.5);legs(g,m.c('#8a7a9a'),[[.1,.1,.1],[0,.1,0],[-.1,.1,-.1]],.18)});

/* ================= Fundstücke ================= */
REL('riesenperle',relMeta('Riesenperle','tiefsee','schatz',3,2600,'Eine Perle, so gross wie eine Orange. Sie schimmert in allen Farben.','Die grösste bekannte Perle wiegt etwa 34 Kilogramm. Sie stammt aus einer Riesenmuschel.'),
  (g,m)=>{P(g,G.hs(.3),m.c('#f8e0ec'),[0,.05,0],[PI,0,0],[1,.35,1]);P(g,G.s(.2),m.c('#fff6ff',{gloss:1.6,rim:1.4,rimColor:'#c8e8ff'}),[0,.2,0])});
REL('tiefseeloot',relMeta('Altes Tiefenmessgerät','tiefsee','kunst',2,900,'Ein Messinggerät mit Zeiger. Er steht auf «sehr, sehr tief».','Je tiefer man taucht, desto stärker drückt das Wasser. In 10 Metern Tiefe ist der Druck schon doppelt so hoch wie an der Oberfläche.'),
  (g,m)=>{P(g,G.cy(.2,.2,.08,24),m.c('#c8a040',{gloss:1.4}),[0,.2,0],[PI/2,0,0]);P(g,G.cy(.17,.17,.01,24),m.c('#fffdf7'),[0,.2,.045],[PI/2,0,0]);P(g,G.bx(.02,.14,.01,0),m.c('#ff3b6b'),[.04,.22,.05],[0,0,-.6])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  dumbo:{n:'Dumbo-Krake',planet:ID,biomes:['tiefseeboden','leuchtriff','tiefgraben'],count:4,size:.6,speed:.6,gait:'hop',voice:['blub','plop','blubb'],pitch:420,likes:['leuchtalge','tiefseefloh'],product:'leuchtalge',names:['Dumbo','Flapp','Ohri','Tinti','Wabbel'],
    fact:'Dumbo-Kraken leben tiefer als fast alle anderen Kraken. Sie schwimmen mit zwei Flossen am Kopf, die wie Elefantenohren aussehen.',a:{col:'#ff9ab8',belly:'#ffd0e0',body:[.32,.36,.32],head:{r:.01,p:[0,.5,0]},snout:{type:'none'},ears:{type:'floppy',len:.55},eyes:{r:.08},legs:{n:4,len:.12,r:.07,foot:'#ff9ab8'},tail:{type:'none'},gait:'hop'}},
  seegurke:{n:'Seegurke',planet:ID,biomes:['sandgrund','tiefseeboden'],count:4,size:.6,speed:.15,gait:'slither',voice:['flup','plupp','hm'],pitch:200,likes:['leuchtalge'],product:'perle_klein',names:['Gurki','Wurstl','Langsam','Sandi','Rolli'],
    fact:'Seegurken fressen Sand und filtern daraus winzige Nahrungsreste. Hinten kommt sauberer Sand wieder heraus – sie putzen den Meeresboden.',a:{col:'#c86a8a',belly:'#e8a0b8',body:[.2,.18,.5],head:{r:.01,p:[0,.2,.4]},snout:{type:'none'},ears:{type:'none'},legs:{n:0},tail:{type:'none'},spots:{col:'#ffd0e0',n:8,s:.4},gait:'slither'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','tiefseehelm','Leucht-Stirnband',480,'#2a3a6a',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.55,0]);P(q,G.cy(r*.9,r*.9,r*.22,Q(18),1,true),M.c(col),[0,0,0]);P(q,G.tu([[0,r*.1,r*.85],[0,r*.5,r*.9],[0,r*.6,r*1.2]],r*.03,r*.02,8),M.c(col));P(q,G.s(r*.12),M.glow('#7fffd4',1.8),[0,r*.6,r*1.24])});
def('top','quallenponcho','Quallen-Poncho',820,'#b89aff',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.7,r*1.05,r*.8,Q(16),1,true),M.c(col,{opacity:.85}),[0,-r*.4,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(q,G.cy(r*.03,r*.02,r*.4),M.c(col),[Math.cos(a)*r*1,-r*1,Math.sin(a)*r*1])}});

/* ================= Möbel ================= */
furn('quallenlampe',{n:'Quallen-Lampe',cat:'licht',price:1900,planet:ID,size:[1,1],h:1.4,b:(g,m)=>{P(g,G.cy(.2,.25,.08,18),m.c('#e6ecf5',{gloss:1.4}),[0,.04,0]);const q=grp(g,[0,1,0]);P(q,G.hs(.32),m.c('#ff6fd8',{opacity:.7,gloss:1.5,rim:1.4}),[0,0,0],null,[1,.8,1]);P(q,G.s(.14),m.glow('#ff9ae8',1.6),[0,.08,0]);
  for(let i=0;i<6;i++){const a=i/6*TAU;P(q,G.tu([[Math.cos(a)*.25,0,Math.sin(a)*.25],[Math.cos(a)*.28,-.4,Math.sin(a)*.28],[Math.cos(a)*.22,-.8,Math.sin(a)*.22]],.02,.01,8),m.c('#ff6fd8',{opacity:.7}))}g.userData.tick=t=>{q.position.y=1+Math.sin(t*1.5)*.06};g.userData.light={p:[0,1,0],c:'#ff9ae8',i:.7}}});
furn('uboot_modell',{n:'U-Boot-Modell',cat:'deko',price:1300,planet:ID,size:[1,1],h:.7,b:(g,m)=>{P(g,G.ca(.18,.5),m.c('#ffd23f',{gloss:1.3}),[0,.35,0],[0,0,PI/2]);P(g,G.bx(.22,.14,.16,.04),m.c('#ffd23f',{gloss:1.3}),[0,.54,0]);P(g,G.cy(.02,.02,.2),m.c('#e6ecf5'),[0,.68,0]);P(g,G.cy(.04,.06,.2,8),m.c('#e6ecf5'),[0,.1,0])}});

/* ================= Sprache: Blasenschrift ================= */
function blasenGlyph(x,s,r){x.save();x.lineWidth=s*.05;const n=2+Math.floor(r()*4);for(let i=0;i<n;i++){x.beginPath();x.arc((r()-.5)*s*.4,(r()-.5)*s*.4,s*(.05+r()*.12),0,TAU);r()<.5?x.fill():x.stroke()}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Leuchtquallen-Tiefsee',base:'kompost',R:120,R0:40,sea:-.6,music:'town',sky:['#1a2a6a','#3a7ab0'],fog:'#2a4a7a',water:'#2a6aa0',deep:'#0a1a4a',step:1.05,shop:ID,
    desc:'Ein Planet wie der Grund eines tiefen Meeres. Leuchtquallen treiben durch die Luft, und am Leuchtriff wartet ein Licht- und Ton-Spiel.',weather:'blueten',orbit:[229,4.8],size:1,col:['#3a6a8a','#45e0ff'],moons:2,
    park:'leuchtriff',parkPond:true,phone:['#d0e8ff','#ffd0f0'],stones:['kiesel','perle_klein','stein_klein'],plazaTree:'roehrenwurm',path:'#6a8ab0',
    space:{deep:'#0a1a4a',water:'#2a6aa0',shore:'#8aa8b8',land:'#3a6a8a',land2:'#2e5a7a',high:'#4a4a6a',cap:'#45e0ff',atmo:'#2a4a9a',cloud:.2,sea:.4,capA:.3,freq:2.6},
    mac:{oc:-.1,m:.3,isl:1},climate:{hot:'sandgrund',wet:'leuchtriff',cold:'tiefgraben'},peak:'schlotfeld',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.0,4)*2+.6;/* tiefe Gräben */const k=Math.abs(N2(q.x*.8,q.y*.8,q.z*.8));if(k<.08)h-=(.08-k)*18;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond)return'leuchtriff';if(low&&h<sea+.8)return'tiefgraben';if(h>sea+4.2)return'schlotfeld';if(T>.3)return'sandgrund';if(M>.15)return'leuchtriff';return'tiefseeboden'},
    onLoad:W=>RIFF.onLoad(W),tick:(dt,t,W,me)=>RIFF.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Muschel-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Leuchtbecken',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Tiefer Graben',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Muschel-Spielecke',mode:'Perlen-Boutique',praxis:'Taucher-Praxis',museum:'Tiefsee-Museum',shop:'Muschelladen',studio:'Leucht-Atelier',bar:'Blasen-Bar',rathaus:'Riff-Rathaus',garage:'U-Boot-Garage',pflanzen:'Korallen-Gärtnerei',tiere:'Aquarium-Laden'},
  sty:{wall:'putz',walls:['#f2f8ff','#f8f0ff','#f0fbff'],roof:'dome',roofs:GLOW.slice(0,4),trim:'#e6ecf5',plinth:'#4a5a8a',door:'#45e0ff',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Bürgermeisterin Perle',{skin:'glas',color:3,shape:'ei'},{kopf:'eikopf',augen:'mensch',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen in der Leuchtquallen-Tiefsee! Hier unten ist es immer ein bisschen dämmrig. Darum leuchten alle selbst.','Am Leuchtriff stehen fünf Korallensäulen. Sie zeigen dir eine Melodie aus Licht. Spiel sie nach!','Die Quallen treiben ganz langsam. Sie haben kein Gehirn, aber sie kommen trotzdem überall hin.'],
  caveRock:['#4a5a8a','#3a4a7a','#2a3a6a',GLOW.slice(0,3)],
  wear:['tiefseehelm','quallenponcho','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'muschelhaus'},{fam:'kokon',style:'quallenhaus'},{fam:'kokon',style:'uboot'},{fam:'kokon',style:'quallenhaus'}]},
  residents:{skins:['glas','schleim','bonbon','plastik'],heads:['eikopf','kapselkopf','frosch','mensch','vogel','katze'],names:['Perle','Glimm','Qualli','Blubb','Tiefi','Riff','Muscheline','Lampe','Welle','Sonar','Koralle','Bläschen'],
    house:{shapes:['rund'],walls:['putz'],wallCols:['#f2f8ff','#f8f0ff','#f0fbff'],roofCols:GLOW.slice(0,4),win:['rund']},deco:['leuchtkoralle','anglerlaterne','tiefseeschwamm'],fence:false},
  lang:{n:'Blasenschrift',ink:'#2a6aa0',glow:'#45e0ff',kind:'runes',draw:blasenGlyph,syl:['blu','bb','qua','lle','ti','ef','pe','rl','ri','ff','gl','im']},ruinStone:'#4a5a8a',
  terraform:['tiefseeboden','leuchtriff','sandgrund'],
  weather:[['klar',4],['nebel',2],['heiter',1]]});

/* ================= Leuchtriff (Licht-Ton-Folge) und treibende Quallen ================= */
const RIFF=(()=>{let W_=null,site=null,cols=[],jellies=[],seq=[],step=0,round=0,mode='idle',busy=false,m_=null;const ROUNDS=[3,4,5,6],RATE=[.7,.85,1,1.2,1.45];
  const S=()=>SAVE.riff=SAVE.riff||{best:0};
  function colModel(m,i){const g=new THREE.Group();const c=GLOW[i];P(g,G.cy(.5,.6,.25,14),m.c('#4a5a8a'),[0,.12,0]);const h=1.6+i*.2;P(g,G.cy(.28,.38,h,12),gl(m,'#2a3a6a'),[0,h/2+.2,0]);
    const off=m.c(c,{gloss:1.3,rim:1,opacity:.55});const on=m.glow(c,2.2);const top=P(g,G.s(.42),off,[0,h+.4,0]);top.userData.noMerge=true;for(let k=0;k<3;k++)P(g,G.to(.32+k*.02,.03),gl(m,c),[0,.6+k*h*.3,0],[PI/2,0,0]);addOutlines(g);g.userData={top,off,on,h};return g}
  function jellyModel(m,c){const g=new THREE.Group();const bell=P(g,G.hs(.45),m.c(c,{opacity:.6,gloss:1.5,rim:1.6,rimColor:'#ffffff'}),[0,0,0],null,[1,.8,1]);bell.userData.noMerge=true;P(g,G.s(.18),m.glow(c,1.6),[0,.08,0]).userData.noOutline=true;
    const tent=[];for(let i=0;i<6;i++){const a=i/6*TAU;const t=P(g,G.tu([[Math.cos(a)*.35,0,Math.sin(a)*.35],[Math.cos(a)*.4,-.5,Math.sin(a)*.4],[Math.cos(a)*.3,-1.1,Math.sin(a)*.3]],.03,.01,10),m.c(c,{opacity:.6}));t.userData.noMerge=true;tent.push(t)}g.userData.bell=bell;return g}
  function flash(i,ms){const u=cols[i].g.userData;u.top.material=u.on;u.top.scale.setScalar(1.25);SND.play('click',{rate:RATE[i],vol:.6});setTimeout(()=>{u.top.material=u.off;u.top.scale.setScalar(1)},ms||420)}
  async function show(){busy=true;mode='show';await new Promise(r=>setTimeout(r,700));for(const i of seq){flash(i,450);await new Promise(r=>setTimeout(r,700))}busy=false;mode='input';step=0;UI.toast('Jetzt du: Berühre die Säulen in derselben Folge ('+seq.length+' Lichter).',2600)}
  function start(){if(busy)return;round=0;newRound();}
  function newRound(){const n=ROUNDS[round];seq=[];for(let k=0;k<n;k++)seq.push(Math.floor(Math.random()*5));UI.toast('Runde '+(round+1)+' von '+ROUNDS.length+'. Schau gut hin …',2000);show()}
  function touch(i){if(mode!=='input'||busy)return;flash(i,300);if(seq[step]!==i){mode='idle';SND.play('click',{rate:.5});UI.toast('Hoppla, das war eine andere Säule. Ich zeige dir die Runde noch einmal.',2600);setTimeout(()=>{show()},1600);return}
    step++;if(step<seq.length)return;mode='idle';money(60);SND.play('pickup',{rate:1.2});const st=S();st.best=Math.max(st.best||0,round+1);persist();round++;
    if(round<ROUNDS.length){UI.toast('Richtig! Plus 60 Taler. Gleich kommt die nächste Runde.',2200);setTimeout(newRound,2000);return}
    if(!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Bürgermeisterin Perle',['Du hast das ganze Riff-Lied gespielt! Die Quallen tanzen vor Freude.','Nimm diese Quallen-Lampe mit nach Hause. Und eine Perle aus dem tiefsten Graben.']);bagAdd('furn','quallenlampe');bagAdd('relic','riesenperle');money(300);SND.jingle('j_success')},800)}
    else UI.toast('Alle vier Runden geschafft! Das Riff leuchtet für dich.',2600)}
  function onLoad(W){W_=W;cols=[];jellies=[];mode='idle';busy=false;m_=makeMats({skin:'plastik',color:0});const r=srand(6060);const pl=GAME.G.places.find(p=>p.id==='platz');
    let d=null;for(let t=0;t<600&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=pl?angle(cd,pl.dir)*W.R:99;if(a<24||a>45)continue;if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.4)continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.4))continue;d=cd}
    if(!d)return;site=d;const ax=new V(1,0,0).cross(d).normalize();
    for(let i=0;i<5;i++){const cd=d.clone().applyAxisAngle(ax,4.2/W.R).applyAxisAngle(d,i/5*TAU).normalize();const g=colModel(m_,i);GAME.placeObj(g,cd,0,0,true);cols.push({i,d:cd,g});W.inter.push({kind:'riffsaeule',p:cd,r:1.5,label:'Säule '+(i+1)+' berühren',act:()=>touch(i),when:()=>mode==='input'})}
    const mid=new THREE.Group();P(mid,G.cy(.9,1,.3,18),m_.c('#4a5a8a'),[0,.15,0]);P(mid,G.hs(.6),m_.c('#f8e0ec'),[0,.3,0],[PI,0,0],[1,.4,1]);P(mid,G.s(.3),m_.c('#fff6ff',{gloss:1.6,rim:1.4,rimColor:'#c8e8ff'}),[0,.5,0]);addOutlines(mid);GAME.placeObj(mid,d,0,0,true);
    W.inter.push({kind:'riffstart',p:d,r:2,label:'Riff-Spiel starten',act:()=>start(),when:()=>mode==='idle'&&!busy});
    /* treibende Quallen rund um den Platz und das Riff */for(let i=0;i<18;i++){const base=(i<10&&pl?pl.dir:d).clone();const off=new V(r()-.5,r()-.5,r()-.5).normalize();const p0=base.clone().addScaledVector(off,(8+r()*28)/W.R).normalize();
      const g=jellyModel(m_,GLOW[i%5]);GAME.G.scene.add(g);jellies.push({g,p0,h:4+r()*6,ph:r()*TAU,sp:.05+r()*.08,ax:new V(r()-.5,r()-.5,r()-.5).normalize()})}}
  const _q=new THREE.Quaternion(),UP=new V(0,1,0);
  function tick(dt,t){for(const j of jellies){const p=j.p0.clone().applyAxisAngle(j.ax,Math.sin(t*j.sp+j.ph)*.06).normalize();const R=W_.R+(W_.hExact||W_.hAt)(p)+j.h+Math.sin(t*.8+j.ph)*.6;j.g.position.copy(p).multiplyScalar(R);_q.setFromUnitVectors(UP,p);j.g.quaternion.copy(_q);
      const s=1+Math.sin(t*2.2+j.ph)*.12;j.g.userData.bell.scale.set(s,.8/s,s)}
  }
  return{onLoad,tick,cols:()=>cols,site:()=>site,_start:start,_touch:touch,get mode(){return mode},get seq(){return seq}}
})();
window.RIFF=RIFF;
})();
