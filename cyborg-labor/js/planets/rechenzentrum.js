/* =====================================================================
   CYBORG-LABOR · planets/rechenzentrum.js · Ranken-Rechenzentrum
   Ein riesiges Rechenzentrum, das die Natur zurückerobert hat: Kabelbäume
   mit geflochtenem Stamm, Lüfterblumen, die sich drehen, Platinen-Farne
   mit goldenen Leiterbahnen, LED-Beerenbüsche und moosige Server-Blöcke.
   Die Häuser sind zugewucherte Server-Schränke, Kühltürme mit Dampf und
   Glas-Serverhäuser voller Pflanzen.
   Besonderheit:
   · Neustart: Fünf grosse Server-Schränke sind komplett zugewachsen.
     Jede Ranke muss einzeln abgeschnitten werden. Ist der Schrank frei,
     startet er hörbar neu und seine Lichter gehen an. Sind alle fünf
     wieder online, leuchtet das Rechenzentrum, und es gibt einen
     Mini-Server fürs Zimmer. Die abgeschnittenen Ranken wachsen nicht
     nach, die Pflanzen ringsum bleiben aber stehen.
   ===================================================================== */
(function(){
const ID='rechenzentrum';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT,leafShape}=NH;
const V=THREE.Vector3;
const LED=['#7fd34a','#2fb5d9','#ffd23f','#ff6fa5'];
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1.1,rimColor:'#ffffff'});
const chr=m=>m.c('#e6ecf5',{gloss:1.4});

/* ================= Natur ================= */
N('kabelbaum',{r:.4,h:4.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.6,3.4);const cols=['#3b3450','#ff6fa5','#2fb5d9','#ffd23f'];
  for(let k=0;k<4;k++){const pts=[];for(let i=0;i<=10;i++){const t=i/10,a=t*TAU*1.2+k*PI/2;pts.push([Math.cos(a)*.1,t*h,Math.sin(a)*.1])}P(g,G.tu(pts,.07,.06,24),gl(m,cols[k]))}
  for(let i=0;i<7;i++){const a=i/7*TAU+rnd()*.4;const f=grp(g,[0,h,0],[0,-a,0]);P(f,new THREE.ShapeGeometry(leafShape(1.4,.5),8),m.dbl(i%2?'#4aa85a':'#5ab86a',{gloss:.9}),[0,0,0],[-.25-rnd()*.3,0,0])}
  P(g,G.s(.35),m.c('#4aa85a'),[0,h+.1,0],null,[1,.5,1])});
N('luefterblume',{r:.2,h:1,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.5,.85);P(g,G.cy(.025,.03,h,6),m.c('#4aa85a'),[0,h/2,0]);const q=grp(g,[0,h,.02],[PI/2-.25,0,0]);
  P(q,G.to(.2,.025),chr(m),[0,0,0],[PI/2,0,0]);const rot=grp(q,[0,0,0]);for(let i=0;i<5;i++){const a=i/5*TAU;P(rot,G.bx(.16,.012,.07,.02),gl(m,LED[Math.floor(rnd()*4)]),[Math.cos(a)*.09,0,Math.sin(a)*.09],[0,-a,.4])}P(rot,G.cy(.04,.04,.03,10),chr(m),[0,0,0]);
  const ph=rnd()*9,sp=2+rnd()*3;g.userData.tick=t=>{rot.rotation.y=t*sp+ph}});
N('platinenfarn',{r:.45,h:1.2,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const t=ctex('pcb-leaf',64,128,(x,w,h)=>{x.fillStyle='#2e8a4a';x.fillRect(0,0,w,h);x.strokeStyle='#ffd23f';x.lineWidth=2;for(let i=0;i<6;i++){x.beginPath();x.moveTo(w/2,i*20+8);x.lineTo(w/2+(i%2?14:-14),i*20+18);x.lineTo(w/2+(i%2?14:-14),i*20+26);x.stroke();x.fillStyle='#ffd23f';x.beginPath();x.arc(w/2+(i%2?14:-14),i*20+28,3,0,TAU);x.fill()}x.fillRect(w/2-1,0,2,h)});
  const n=6+Math.floor(rnd()*3);for(let i=0;i<n;i++){const a=i/n*TAU+rnd()*.3;const L=RR(rnd,.7,1.1);const f=grp(g,[0,.05,0],[0,-a,0]);P(f,new THREE.PlaneGeometry(.22,L),m.c('#ffffff',{map:t,side:THREE.DoubleSide,gloss:.8}),[0,L/2*Math.cos(.7),L/2*Math.sin(.7)],[-.7,0,0]).userData.noOutline=true}});
N('ledbeere',{r:.5,h:1,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.5,.1,3,rnd()*9),m.c('#4aa85a'),[0,.45,0],null,[1.2,.85,1]);
  for(let i=0;i<7;i++){const th=.4+rnd()*1,ph=rnd()*TAU;P(g,G.s(.07),m.glow(LED[i%4],1.6),[Math.sin(th)*Math.cos(ph)*.6,.45+Math.cos(th)*.4,Math.sin(th)*Math.sin(ph)*.5])}});
N('serverfels',{r:.7,h:1.2,size:'big',planet:ID},(g,m,o,rnd)=>{const tilt=(rnd()-.5)*.5;const q=grp(g,[0,0,0],[0,rnd()*TAU,tilt]);P(q,G.bx(.8,1.3,.7,.06),m.c('#4a4560'),[0,.45,0]);for(let k=0;k<4;k++)P(q,G.bx(.6,.06,.02,.01),m.c('#6a6580'),[0,.3+k*.22,.36]);
  P(q,G.s(.55),m.c('#5ab86a'),[0,1.1,0],null,[1,.45,.9]);P(q,G.s(.35),m.c('#4aa85a'),[.25,.6,.3],null,[.6,.8,.4])});
N('moosgras',{r:.12,h:.35,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#5ab86a');for(let i=0;i<4;i++)P(g,G.s(.07+rnd()*.04),c,[(rnd()-.5)*.25,.04,(rnd()-.5)*.25],null,[1,.6,1])});
Object.assign(NH.ROCK,{[ID]:['#4a4560','#5a5570','#5ab86a']});

/* ================= Biome ================= */
const BI={
  rankenhalle:{n:'Rankenhalle',g:['#78bc68','#6cb05c'],cliff:'#5a5570',pat:'moos',grass:'#74b864',grassD:1,trees:[['kabelbaum',2.2]],treeD:1.2,
    deco:[['platinenfarn',3],['ledbeere',2],['luefterblume',2],['moosgras',3]],decoD:6,rocks:[['serverfels',.6]],rockD:.4,litter:[['ranke_stueck',1],['luefterschraube',.6]]},
  platinenwald:{n:'Platinenwald',g:['#5aa86a','#4e9c5e'],cliff:'#4a4560',pat:'moos',grass:'#5aa86a',grassD:1,trees:[['kabelbaum',3]],treeD:1.6,
    deco:[['platinenfarn',5],['ledbeere',1.5]],decoD:5,rocks:[['serverfels',.4]],rockD:.3,litter:[['ranke_stueck',1.2],['leiterplatte',.6]]},
  lueftungsfeld:{n:'Lüftungsfeld',g:['#c8d0d8','#bcc4cc'],cliff:'#7a7e90',pat:'staub',grass:'#a8c8a0',grassD:.3,trees:[['kabelbaum',.3]],treeD:.2,
    deco:[['luefterblume',5],['moosgras',2]],decoD:3,rocks:[['serverfels',1]],rockD:.7,litter:[['luefterschraube',1.4],['leiterplatte',.8]]},
  kuehlwasserufer:{n:'Kühlwasser-Ufer',g:['#a8dcd8','#98d0cc'],cliff:'#6a8ab0',pat:'sand',grass:'#98d4c8',grassD:.5,trees:[['kabelbaum',.6]],treeD:.35,
    deco:[['platinenfarn',2],['moosgras',2]],decoD:3,rocks:[['serverfels',.3]],rockD:.3,litter:[['ranke_stueck',.8],['muschel',.5]]},
  dachantennen:{n:'Dachantennen',g:['#d8dce6','#ccd0dc'],cliff:'#8a8ea0',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['luefterblume',1]],decoD:1,rocks:[['serverfels',1.2]],rockD:.8,litter:[['leiterplatte',1]]}};

/* ================= Sammelsachen ================= */
IT('ranke_stueck',itMeta('Rankenstück','rechenzentrum','material',20),(g,m)=>{P(g,G.tu([[-.15,.03,0],[0,.06,.05],[.15,.03,0]],.025,.02,10),m.c('#4aa85a'));P(g,G.s(.06),m.c('#7fd34a'),[0,.07,.05],null,[1.3,.5,1])});
IT('luefterschraube',itMeta('Lüfterschraube','rechenzentrum','material',35),(g,m)=>{P(g,G.cy(.06,.06,.03,6),chr(m),[0,.02,0]);P(g,G.cy(.025,.025,.14,8),chr(m),[0,.09,0])});
IT('leiterplatte',itMeta('Leiterplatte','rechenzentrum','material',55),(g,m)=>{P(g,G.bx(.3,.02,.2,.01),m.c('#2e8a4a'),[0,.01,0]);for(let k=0;k<3;k++)P(g,G.bx(.06,.03,.04,.01),m.c('#3b3450'),[-.08+k*.08,.03,0]);P(g,G.bx(.25,.022,.01,0),m.c('#ffd23f'),[0,.012,.07])});

/* ================= Fische ================= */
F('glaswels',fishMeta('Glaswels','rechenzentrum','teich','S','immer',2,380,'Ich hab einen Glaswels gefangen! Man kann durch ihn hindurchsehen.','Glaswelse sind fast durchsichtig. Man sieht ihre Gräten wie bei einem Röntgenbild. So sind sie für Räuber schwer zu entdecken.'),
  (g,m)=>{P(g,G.s(.2),m.c('#e8f6ff',{opacity:.4,gloss:1.5,rim:1.2}),[0,0,0],null,[.4,.6,1.6]).userData.noMerge=true;P(g,G.cy(.008,.008,.6),m.c('#c8c0b0'),[0,0,0],[PI/2,0,0]);for(let k=0;k<8;k++)P(g,G.cy(.004,.004,.16),m.c('#c8c0b0'),[0,0,-.24+k*.06],[.4,0,0]);eye(g,m,[.04,.03,.26],.025,[.6,.3,.6]);eye(g,m,[-.04,.03,.26],.025,[-.6,.3,.6])});
F('serverguppy',fishMeta('Server-Guppy','rechenzentrum','teich','S','tag',1,140,'Ich hab einen Server-Guppy gefangen! Er lebt im warmen Kühlwasser.','Guppys legen keine Eier. Die Jungen kommen lebend und schwimmend zur Welt.'),
  (g,m)=>fishT(g,m,{id:'serverguppy',H:.14,L:.4,back:'#5a8ac8',belly:'#e8f0ff',tail:'fan',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ff6fa5';x.fillRect(0,0,w*.22,h);x.fillStyle='#ffd23f';x.fillRect(w*.78,0,w*.22,h)}}));
F('kabelkrebs',fishMeta('Kabelkrebs','rechenzentrum','meer','M','nacht',2,560,'Ich hab einen Kabelkrebs gefangen! Er hat sich in ein altes Netzwerkkabel gewickelt.','Krebse haben ihr Skelett aussen. Um zu wachsen, müssen sie es abstreifen. Das nennt man Häutung.'),
  (g,m)=>{const c=gl(m,'#ff6a4a');P(g,G.s(.2),c,[0,0,0],null,[1.2,.6,1]);for(const s of[-1,1]){P(g,G.tu([[s*.18,0,.1],[s*.3,.05,.25],[s*.25,.05,.38]],.03,.03,8),c);P(g,G.s(.08),c,[s*.25,.05,.42],null,[1,.6,1.3]);for(let k=0;k<3;k++)P(g,G.tu([[s*.18,-.02,-.08+k*.08],[s*.32,-.1,-.08+k*.08]],.015,.01,6),c)}
    P(g,G.tu([[-.25,.08,-.1],[0,.15,0],[.25,.08,-.05]],.02,.02,10),gl(m,'#2fb5d9'));eye(g,m,[.06,.1,.18],.025,[.3,.8,.5]);eye(g,m,[-.06,.1,.18],.025,[-.3,.8,.5])});

/* ================= Insekten ================= */
B('computermotte',bugMeta('Computer-Motte','rechenzentrum','luft','nacht',3,1100,'Ich hab eine Computer-Motte gefangen! Sie war im Lüftungsschacht.','1947 fand man in einem Computer an der Harvard-Universität eine echte Motte, die einen Fehler verursacht hatte. Sie wurde ins Logbuch geklebt – der erste echte «Bug».'),
  (g,m)=>butterfly(g,m,'computermotte','#c8b8a0','#8a7a60','#5a4a3a'));
B('rankenschrecke',bugMeta('Rankenschrecke','rechenzentrum','baum','tag',2,420,'Ich hab eine Rankenschrecke gefangen! Sie sieht aus wie ein Blatt.','Laubheuschrecken hören mit den Beinen: Ihre Ohren sitzen unterhalb der Knie an den Vorderbeinen.'),
  (g,m)=>{const bm=m.c('#5ab86a',{gloss:.9});P(g,G.ca(.07,.32),bm,[0,.16,0],[PI/2,0,0]);P(g,G.s(.08),bm,[0,.18,.24]);bugFace(g,m,[0,.19,.3],.07,.5);P(g,G.s(.18),m.c('#7fd34a'),[0,.24,-.02],null,[.5,.25,1.4]);for(const s of[-1,1])P(g,G.tu([[s*.06,.14,-.05],[s*.15,.3,-.12],[s*.18,.08,-.25]],.015,.01,8),bm);legs(g,bm,[[.07,.12,.1],[0,.12,.02]],.18)});
B('ledkaefer',bugMeta('LED-Käfer','rechenzentrum','boden','nacht',1,190,'Ich hab einen LED-Käfer gefangen! Sein Rücken blinkt grün.','LEDs sind kleine Lampen, die sehr wenig Strom brauchen. Die ersten leuchteten nur rot, blaue LEDs gibt es erst seit den 1990er-Jahren.'),
  (g,m)=>{P(g,G.s(.17),m.c('#3b3450',{gloss:1.3}),[0,.15,0],null,[1,.7,1.2]);P(g,G.s(.06),m.glow('#7fd34a',1.8),[0,.27,0]);bugFace(g,m,[0,.16,.23],.07,.5);legs(g,m.c('#3b3450'),[[.1,.11,.1],[0,.11,0],[-.1,.11,-.1]],.18)});

/* ================= Fundstücke ================= */
REL('lochkarte',relMeta('Lochkarte','rechenzentrum','kunst',2,800,'Eine alte Karte voller kleiner Löcher. Jede Reihe ist ein Befehl.','Früher bekamen Computer ihre Programme auf Lochkarten. Ein Loch hiess 1, kein Loch hiess 0. Für ein Programm brauchte man oft hunderte Karten.'),
  (g,m)=>{P(g,G.bx(.5,.006,.24,0),m.c('#f2e0b0'),[0,.01,0]);for(let i=0;i<10;i++)for(let j=0;j<4;j++)if((i*7+j*3)%5<2)P(g,G.bx(.02,.008,.035,0),m.c('#3b3450'),[-.2+i*.045,.012,-.07+j*.05]).userData.noOutline=true});
REL('erste_festplatte',relMeta('Erste Festplatte','rechenzentrum','schatz',3,2200,'Ein Turm aus silbernen Scheiben. Er speichert genau so viel wie ein einziges Handyfoto.','Die erste Festplatte von 1956 war so gross wie ein Kühlschrank, wog fast eine Tonne und speicherte nur 5 Megabyte.'),
  (g,m)=>{for(let k=0;k<6;k++)P(g,G.cy(.24,.24,.02,24),chr(m),[0,.05+k*.06,0]);P(g,G.cy(.03,.03,.4,10),m.c('#3b3450'),[0,.2,0]);P(g,G.bx(.04,.02,.26,.01),m.c('#ffd23f'),[.15,.2,.08],[0,.6,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  moosfaultier:{n:'Moos-Faultier',planet:ID,biomes:['rankenhalle','platinenwald'],count:3,size:.8,speed:.25,gait:'waddle',voice:['hmmm','oooh','mmh'],pitch:180,likes:['ranke_stueck','ledbeere'],product:'ranke_stueck',names:['Langsam','Moosi','Pause','Ruhe','Schlummer'],
    fact:'Im Fell von Faultieren wachsen winzige Algen. Darum sieht ihr Fell oft grünlich aus – eine perfekte Tarnung im Baum.',a:{col:'#a89878',belly:'#d8c8a8',body:[.36,.36,.42],head:{r:.24,p:[0,.62,.32]},snout:{type:'muzzle',col:'#e8dcc0',nose:'#3b3450'},ears:{type:'none'},legs:{n:4,len:.2,r:.07,foot:'#5a4a3a'},tail:{type:'nub'},spots:{col:'#7fb86a',n:6,s:.7},gait:'waddle'}},
  kabelgecko:{n:'Kabel-Gecko',planet:ID,biomes:['lueftungsfeld','rankenhalle','kuehlwasserufer'],count:4,size:.5,speed:1.6,gait:'fast',shy:true,voice:['gek-ko','tschk','zirp'],pitch:640,likes:['ledkaefer','computermotte'],product:'luefterschraube',names:['Kabeli','Klebi','Gecki','Port','Stecki'],
    fact:'Geckos können an Glasscheiben hochlaufen. Ihre Füsse haben Millionen winziger Härchen, die sich an jeder Oberfläche festhalten.',a:{col:'#7fd34a',belly:'#e8f8d0',body:[.18,.12,.36],head:{r:.15,p:[0,.2,.32]},snout:{type:'wide'},ears:{type:'none'},legs:{n:4,len:.08,r:.04,foot:'#ffd23f'},tail:{type:'lizard',col:'#7fd34a'},spots:{col:'#2fb5d9',n:5},gait:'fast'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','rankenhut','Ranken-Hut',460,'#4aa85a',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.84),M.c('#5a4a3a'),[0,0,0]);P(q,G.cy(r*1.15,r*1.15,r*.05),M.c('#5a4a3a'),[0,0,0]);for(let i=0;i<5;i++){const a=i/5*TAU;P(q,G.s(r*.18),M.c(col),[Math.cos(a)*r*.86,r*.1,Math.sin(a)*r*.86],null,[1.3,.5,1])}});
def('top','admin_hoodie','Admin-Hoodie',740,'#3b3450',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.86,r*.92,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);P(q,G.bx(r*.5,r*.18,r*.04,r*.02),M.c('#7fd34a'),[0,-r*.35,r*.86]);P(q,G.to(r*.5,r*.12,PI),M.c(col),[0,r*.05,-r*.3],[0,0,0])});

/* ================= Möbel ================= */
furn('mini_server',{n:'Mini-Server',cat:'technik',price:2400,planet:ID,size:[1,1],h:1.4,b:(g,m)=>{P(g,G.bx(.6,1.3,.6,.05),m.c('#3b3450'),[0,.65,0]);for(let i=0;i<5;i++){P(g,G.bx(.5,.16,.02,.02),m.c('#4a4560'),[0,.25+i*.22,.31]);for(let k=0;k<4;k++)P(g,G.bx(.04,.03,.02,.01),m.glow(LED[(i+k)%4],1.6),[-.15+k*.08,.25+i*.22,.33])}P(g,G.s(.28),m.c('#5ab86a'),[0,1.35,0],null,[1.1,.35,1.1]);
  P(g,G.tu([[.25,1.35,.25],[.32,1,.32],[.3,.7,.32]],.03,.02,10),m.c('#4aa85a'));g.userData.light={p:[0,.8,.4],c:'#a0ffa0',i:.4}}});
furn('tischluefter',{n:'Tisch-Lüfter',cat:'technik',price:600,planet:ID,size:[1,1],h:.7,b:(g,m)=>{P(g,G.cy(.18,.2,.06,16),chr(m),[0,.03,0]);P(g,G.cy(.03,.03,.4),chr(m),[0,.25,0]);const q=grp(g,[0,.5,0],[PI/2,0,0]);P(q,G.to(.22,.025),chr(m),[0,0,0],[PI/2,0,0]);
  const rot=grp(q,[0,0,0]);for(let i=0;i<4;i++){const a=i/4*TAU;P(rot,G.bx(.18,.012,.08,.02),gl(m,'#2fb5d9'),[Math.cos(a)*.1,0,Math.sin(a)*.1],[0,-a,.4])}g.userData.tick=t=>{rot.rotation.y=t*8}}});

/* ================= Sprache: Ranken-Binär ================= */
function binGlyph(x,s,r){x.save();x.lineWidth=s*.06;x.lineCap='round';const n=3+Math.floor(r()*3);for(let i=0;i<n;i++){const px=(i-(n-1)/2)*s*.14;if(r()<.5){x.beginPath();x.moveTo(px,-s*.22);x.lineTo(px,s*.22);x.stroke()}else{x.beginPath();x.ellipse(px,0,s*.05,s*.13,0,0,TAU);x.stroke()}}
  x.beginPath();x.moveTo(-s*.3,s*.3);x.quadraticCurveTo(0,s*.18,s*.3,s*.3);x.stroke();x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Ranken-Rechenzentrum',base:'kompost',R:120,R0:40,sea:-.3,music:'town',sky:['#8fd0c8','#e8fff0'],fog:'#d8f0e4',water:'#45c8b8',deep:'#2a7a8a',step:1.05,shop:ID,
    desc:'Ein Rechenzentrum, das die Pflanzen übernommen haben. Fünf Server-Schränke sind zugewuchert. Schneid die Ranken ab und starte sie neu.',weather:'blueten',orbit:[222,1.1],size:1,col:['#78bc68','#2fb5d9'],moons:1,
    park:'rankenhalle',parkPond:true,phone:['#e0fff0','#e0f0ff'],stones:['kiesel','luefterschraube','stein_klein'],plazaTree:'kabelbaum',path:'#c0d0cc',
    space:{deep:'#2a7a8a',water:'#45c8b8',shore:'#a8dcd8',land:'#78bc68',land2:'#5aa86a',high:'#d8dce6',cap:'#e8fff0',atmo:'#7fd3a0',cloud:.5,sea:.38,capA:.4,freq:2.8},
    mac:{oc:-.1,m:.35,isl:1},climate:{hot:'lueftungsfeld',wet:'kuehlwasserufer',cold:'dachantennen'},peak:'dachantennen',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.1,4)*2+.7;/* Serverreihen: lange gerade Rücken im Gelände */const k=Math.abs(Math.sin(q.x*6+N2(q.x,q.y,q.z)*2));h+=(k>.92?.6:0);return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'kuehlwasserufer';if(h>sea+4.3)return'dachantennen';if(T>.3)return'lueftungsfeld';if(M>.15)return'platinenwald';return'rankenhalle'},
    onLoad:W=>BOOT.onLoad(W),tick:(dt,t,W,me)=>BOOT.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Server-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Kühlbecken',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Kühlwasser-See',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Server-Spielecke',mode:'Hoodie-Laden',praxis:'Virenschutz-Praxis',museum:'Computer-Museum',shop:'Ersatzteil-Lager',studio:'Pixel-Atelier',bar:'Kühlschrank-Bar',rathaus:'Admin-Zentrale',garage:'Kabel-Garage',pflanzen:'Ranken-Gärtnerei',tiere:'Gecko-Tierladen'},
  sty:{wall:'putz',walls:['#f2fbf4','#f2f8ff','#fbf7f0'],roof:'dome',roofs:LED.slice(0,3),trim:'#e6ecf5',plinth:'#5a5570',door:'#7fd34a',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Administratorin Ranke',{skin:'plastik',color:6,shape:'kapselspiel'},{kopf:'crtkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen im Ranken-Rechenzentrum! Früher liefen hier die Server von halb NEMURI. Dann kamen die Pflanzen.','Fünf grosse Server-Schränke sind ganz zugewuchert. Wenn du die Ranken abschneidest, starten sie wieder.','Die Pflanzen mögen die warme Abluft der Server. Die Server mögen den Schatten der Pflanzen. Eigentlich passt das gut.'],
  caveRock:['#4a4560','#5a5570','#3b3450',LED.slice(0,3)],
  wear:['rankenhut','admin_hoodie','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'rackhaus'},{fam:'kokon',style:'kuehlturm'},{fam:'kokon',style:'glasserver'},{fam:'kokon',style:'rackhaus'}]},
  residents:{skins:['plastik','moos','fell','glas'],heads:['crtkopf','kapselkopf','frosch','moosball','eule','mensch','katze'],names:['Ranke','Server','Byte','Moos','Lüfti','Kabel','Admin','Ping','Cache','Root','Blatt','Boot'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#f2fbf4','#f2f8ff','#fbf7f0'],roofCols:LED.slice(0,3),win:['rund']},deco:['platinenfarn','ledbeere','luefterblume'],fence:false},
  lang:{n:'Ranken-Binär',ink:'#2e8a4a',glow:'#7fd34a',kind:'circuit',draw:binGlyph,syl:['ra','nk','bo','ot','pi','ng','ca','che','ro','ot','by','te']},ruinStone:'#5a5570',
  terraform:['rankenhalle','platinenwald','kuehlwasserufer','lueftungsfeld'],
  weather:[['klar',3],['heiter',3],['regen',2],['nebel',1]]});

/* ================= Neustart der Server-Schränke ================= */
const BOOT=(()=>{let W_=null,racks=[];const COUNT=5,VINES=4,LOHN=150;
  const S=()=>SAVE.boot=SAVE.boot||{cut:{},on:[]};
  function rackModel(m,i){const g=new THREE.Group();const w=1.6,d=1.2,H=3.4;P(g,G.bx(w,H,d,.1),m.c('#3b3450'),[0,H/2,0]);P(g,G.bx(w+.1,.14,d+.1,.05),chr(m),[0,H,0]);P(g,G.bx(w*.9,.4,.05,.03),m.c('#e6ecf5'),[0,H-.35,d/2+.01]);
    const leds=[];for(let r_=0;r_<6;r_++){P(g,G.bx(w*.86,.32,.04,.03),m.c('#4a4560'),[0,.5+r_*.42,d/2+.01]);for(let k=0;k<6;k++){const l=P(g,G.bx(.08,.06,.03,.01),m.c('#2a2838'),[-w*.35+k*.13,.5+r_*.42,d/2+.04]);l.userData.noOutline=true;leds.push(l)}}
    const vines=[];const r=srand(500+i);for(let v=0;v<VINES;v++){const q=grp(g,[0,0,0]);const x=-w*.4+v*w*.27;const pts=[[x,H+.1,0],[x+.1,H+.05,d/2+.08],[x-.1,H*.6,d/2+.12],[x+.08,H*.25,d/2+.1],[x,.05,d/2+.2]];
      P(q,G.tu(pts,.09,.07,20),m.c(v%2?'#4aa85a':'#5ab86a'));for(let k=1;k<5;k++){const p=pts[k];P(q,G.s(.2),m.c('#7fd34a'),[p[0]+.1,p[1],p[2]+.05],null,[1.3,.6,.5])}vines.push(q)}
    P(g,G.s(1),m.c('#5ab86a'),[0,H+.15,0],null,[1,.3,.8]);const scr=ctex('boot-off',128,48,(x,w2,h)=>{x.fillStyle='#10200a';x.fillRect(0,0,w2,h);x.fillStyle='#4a5a3a';x.font='bold 22px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('OFFLINE',w2/2,h/2+2)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(w*.8,.36),new THREE.MeshBasicMaterial({map:scr,toneMapped:false}));sm.position.set(0,H-.35,d/2+.04);sm.userData.noOutline=true;g.add(sm);
    addOutlines(g);g.userData={leds,vines,screen:sm,H,d};return g}
  function setOnline(rk,anim){const u=rk.g.userData;const on=ctex('boot-on',128,48,(x,w2,h)=>{x.fillStyle='#10200a';x.fillRect(0,0,w2,h);x.fillStyle='#7fd34a';x.font='bold 22px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('ONLINE',w2/2,h/2+2)});
    u.screen.material=new THREE.MeshBasicMaterial({map:on,toneMapped:false});u.leds.forEach((l,k)=>{const c=LED[k%4];const mat=rk.m.glow(c,1.6);if(anim)setTimeout(()=>{l.material=mat},k*40);else l.material=mat});rk.online=true}
  function onLoad(W){W_=W;racks=[];const m=makeMats({skin:'plastik',color:0});const st=S();const r=srand(2042);
    for(let i=0;i<COUNT;i++){let d=null;for(let t=0;t<400&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.93||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(racks.some(x=>angle(x.d,cd)*W.R<24))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;d=cd}
      if(!d)continue;const g=rackModel(m,i);GAME.placeObj(g,d,r()*TAU,0,true);const rk={i,d,g,m,online:false};const cut=st.cut[i]||0;g.userData.vines.slice(0,cut).forEach(v=>v.visible=false);if(st.on.includes(i))setOnline(rk,false);
      W.inter.push({kind:'serverschrank',p:d,r:2.4,label:'Ranke abschneiden',act:()=>snip(rk),when:()=>!rk.online});W.inter.push({kind:'serverschrank_an',p:d,r:2.4,label:'Server läuft',act:()=>UI.toast('Dieser Server läuft wieder. Die Lüfter summen zufrieden.',2200),when:()=>rk.online});racks.push(rk)}}
  function snip(rk){const st=S();const cut=st.cut[rk.i]||0;if(cut>=VINES||rk.online)return;const v=rk.g.userData.vines[cut];st.cut[rk.i]=cut+1;persist();SND.play('cloth',{rate:1.3});
    const t0=performance.now();const fall=()=>{const k=Math.min(1,(performance.now()-t0)/500);v.position.y=-k*1.2;v.scale.setScalar(1-k*.6);if(k<1)requestAnimationFrame(fall);else v.visible=false};fall();
    if(cut+1<VINES){UI.toast('Ranke ab! Noch '+(VINES-cut-1)+' an diesem Schrank.',1600);return}
    setTimeout(()=>{st.on.push(rk.i);persist();setOnline(rk,true);SND.play('powerup',{rate:.9});money(LOHN);const n=st.on.length;UI.toast('Server '+n+' von '+COUNT+' startet neu … ONLINE! Plus '+LOHN+' Taler.',3000);
      if(typeof PIKO!=='undefined'&&n===1)PIKO.want('Der Server läuft wieder! Irgendwo stehen noch vier zugewucherte Schränke.');
      if(n===COUNT&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Administratorin Ranke',['Alle fünf Server sind wieder online! Das Rechenzentrum rechnet wieder.','Die Pflanzen dürfen trotzdem bleiben. Hier ist ein Mini-Server für dein Zimmer, mit eingebautem Blumentopf.']);bagAdd('furn','mini_server');bagAdd('relic','erste_festplatte');money(300);SND.jingle('j_success')},900)}},500)}
  /* laufende Server blinken */
  function tick(dt,t){for(const rk of racks){if(!rk.online)continue;const L=rk.g.userData.leds;const f=Math.floor(t*4);L.forEach((l,j)=>l.visible=((j*7+f)%9)!==0)}}
  return{onLoad,tick,racks:()=>racks,COUNT,_snip:snip}
})();
window.BOOT=BOOT;
})();
