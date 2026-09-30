/* =====================================================================
   CYBORG-LABOR · planets/dschungel.js · Dschungel-Welt
   Grüne Bergketten, Flusstäler, Mangroven, Orchideen-Lichtungen und drei
   überwucherte Tempel (Quaternius Nature + Modular Ruins, CC0). Besonderheiten:
   · Lianen-Vorhänge versperren Pfade; du kannst sie zerschneiden, über Nacht
     wachsen sie wieder nach.
   · Schwing-Lianen: an Flüssen und Schluchten schwingst du auf die andere Seite.
   · Tempel-Rätsel: Schiebepuzzle aus Steintafeln; gelöst öffnet sich die Schatzkammer.
   ===================================================================== */
(function(){
const ID='dschungel';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,RP,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,stoneM,butterfly}=NH;
const V=THREE.Vector3;
const TEMPLES=[{id:'t0',n:'Sonnentempel',lat:30,lon:60},{id:'t1',n:'Jaguartempel',lat:18,lon:190},{id:'t2',n:'Mondtempel',lat:-24,lon:300}].map(t=>Object.assign(t,{d:dirLL(t.lat,t.lon)}));

/* ---------- Farben der Bausätze: warm, saftig, gemütlich ---------- */
const JPAL={byHex:{'#62433d':'#9C6B52','#4a613d':'#5FB86A','#3a4c30':'#3E9A5C','#a19154':'#D8C07A','#a42830':'#FF6B7A','#a45481':'#FF8FC8','#007a7c':'#3FC8C0','#7a7d87':'#A8AEC0','#61574c':'#9A8E80','#7c554e':'#B88A70','#61534e':'#9A8478','#957f77':'#C8B0A0'},line:'#3E4A3A'};
const RPAL={byHex:{'#937f54':'#C8B690','#636458':'#8FA088','#616161':'#9CA0A8','#927a50':'#C0A474','#848575':'#B0B4A0','#625139':'#8A7458','#4a3c29':'#6E5A40','#343434':'#4A4A56','#a09274':'#D0C4A0','#7ac166':'#7FD07A','#6bb75b':'#62C06A','#d1d1d1':'#EDEDED','#9f4f3d':'#D8704E','#b46726':'#F0A040'},line:'#4A4238'};
function kitN(type,pack,piece,h,meta,pal,extra){N(type,Object.assign({planet:ID},meta),(g,m,o,rnd)=>{if(typeof KIT==='undefined'||!KIT.has(pack,piece)){P(g,G.s(.4),m.c('#5FB86A'),[0,.4,0]);return}
  const b=KIT.bounds(pack,piece);const k=h/(b[4]-b[1])*(o.s||1)*RR(rnd,.88,1.12);const mm=KIT.mesh(pack,piece,pal||JPAL);mm.scale.setScalar(k);mm.position.y=-b[1]*k;mm.rotation.y=rnd()*TAU;g.add(mm);if(extra)extra(g,m,o,rnd,k)})}
kitN('urwaldpalme','jungle','PalmTree_1',5.5,{r:.5,h:5.5,shake:true,size:'big'});
kitN('urwaldpalme2','jungle','PalmTree_3',4.8,{r:.5,h:4.8,shake:true,size:'big'});
kitN('bogenpalme','jungle','PalmTree_2',3.6,{r:.5,h:3.6,shake:true,size:'big'});
kitN('tropenweide','jungle','Willow_2',5.2,{r:.7,h:5.2,shake:true,size:'big'},null,(g,m,o,rnd)=>{/* Luftwurzeln und Lianen */const vm=m.c('#4E9A58',{rim:.5});for(let i=0;i<5;i++){const a=rnd()*TAU,r=.8+rnd()*.8;P(g,G.tu([[Math.cos(a)*r,4,Math.sin(a)*r],[Math.cos(a)*r*1.05,2.6,Math.sin(a)*r*1.05],[Math.cos(a)*r*1.1,1.2+rnd()*.8,Math.sin(a)*r*1.1]],.035,.025),vm)}});
kitN('urwaldriese','jungle','CommonTree_3',7,{r:.8,h:7,shake:true,size:'big'},null,(g,m,o,rnd)=>{const bm=m.c('#9C6B52');for(let i=0;i<4;i++){const a=i/4*TAU+rnd();P(g,G.tu([[0,.9,0],[Math.cos(a)*.6,.35,Math.sin(a)*.6],[Math.cos(a)*1.1,0,Math.sin(a)*1.1]],.14,.08),bm)}});
kitN('dschungelbusch','jungle','Bush_1',1.3,{r:.55,h:1.3,size:'small'});
kitN('beerenbusch_d','jungle','BushBerries_1',1.3,{r:.55,h:1.3,size:'small',shake:true});
kitN('palmwedel','jungle','Plant_4',.9,{r:.5,h:.9,size:'small'});
kitN('bromelie','jungle','Plant_5',.9,{r:.4,h:.9,size:'small'});
kitN('schilfpflanze','jungle','Plant_3',1,{r:.35,h:1,size:'small'});
kitN('moosfels','jungle','Rock_Moss_3',.9,{r:.45,h:.9,size:'small'});
kitN('moosfels_gross','jungle','Rock_Moss_2',1.8,{r:.9,h:1.8,size:'big'});
kitN('moosstumpf','jungle','TreeStump_Moss',.7,{r:.5,h:.7,size:'small'});
kitN('moosstamm','jungle','WoodLog_Moss',.7,{r:.7,h:.7,size:'small'});
kitN('seerosenblatt','jungle','Lilypad',.2,{r:.5,h:.2,size:'small',water:true});
kitN('ruinensaeule','ruins','Column_Round_Short',2.2,{r:.4,h:2.2,size:'big'},RPAL);
kitN('ruinenmauer','ruins','Wall_Broken',2,{r:1,h:2,size:'big',cols:[[-.6,0,.4],[.6,0,.4]]},RPAL);
kitN('ruinentopf','ruins','Pot1',.8,{r:.35,h:.8,size:'small'},RPAL);
/* Monstera-Blätter: grosse, gelochte Blätter an langen Stielen */
function monsteraLeaf(m,col,L){const sh=new THREE.Shape();sh.moveTo(0,0);sh.bezierCurveTo(L*.55,L*.1,L*.6,L*.75,0,L);sh.bezierCurveTo(-L*.6,L*.75,-L*.55,L*.1,0,0);
  for(let i=0;i<3;i++){const y=L*(.3+i*.2);for(const s of[-1,1]){const hp=new THREE.Path();hp.absellipse(s*L*.22,y,L*.06,L*.035,0,TAU,false,s*.6);sh.holes.push(hp)}}
  const geo=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:false,curveSegments:10});return new THREE.Mesh(geo,m.c(col,{rim:.6,rimColor:'#eaffc8'}))}
N('monstera',{r:.6,h:1.5,size:'small',planet:ID},(g,m,o,rnd)=>{const sm=m.c('#4E9A58');for(let i=0;i<7;i++){const a=i/7*TAU+rnd()*.4;const h=.6+rnd()*.7;const tip=[Math.cos(a)*.45,h,Math.sin(a)*.45];
  P(g,G.tu([[0,0,0],[Math.cos(a)*.2,h*.7,Math.sin(a)*.2],tip],.02,.015),sm);const lf=monsteraLeaf(m,i%2?'#4FAE62':'#5FC070',.55+rnd()*.25);lf.position.set(...tip);lf.rotation.set(-.9-rnd()*.4,-a+PI/2,0);g.add(lf)}});
N('bananenstaude',{r:.45,h:3,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const tm=m.c('#8FB86A');P(g,G.cy(.14,.2,2.2),tm,[0,1.1,0]);for(let i=0;i<6;i++){const a=i/6*TAU+rnd()*.3;const q=grp(g,[0,2.1,0],[0,-a,.9+rnd()*.35]);
    P(q,flatLeaf(leafShape(1.5,.34),.02,.2),m.c(i%2?'#6CC872':'#58B866',{rim:.6}),[.7,0,0],[0,0,-PI/2])}
  const bq=grp(g,[.18,1.7,0]);for(let i=0;i<8;i++){const a=i/8*TAU;const f=P(bq,G.ca(.045,.18),m.c('#FFE06A',{rim:.5}),[Math.cos(a)*.1,-(i%3)*.08,Math.sin(a)*.1],[.5,a,0]);f.name='frucht_mango'}g.userData.fruits.push(bq)});
N('orchidee',{r:.2,h:.55,size:'tiny',planet:ID},(g,m,o,rnd)=>{const col=RP(rnd,['#FF8FC8','#C8A0FF','#FFFFFF','#FFB27A']);const sm=m.c('#5FA84E');P(g,G.tu([[0,0,0],[.05,.3,0],[.12,.48,0]],.012,.008),sm);
  for(let k=0;k<3;k++){const f=grp(g,[.12-k*.05,.48-k*.08,k*.04],[.3,k,0]);for(let i=0;i<5;i++){const a=i/5*TAU;P(f,G.s(.05),m.c(col,{rim:.7}),[Math.cos(a)*.05,Math.sin(a)*.05,0],null,[1.2,.8,.3])}P(f,G.s(.025),m.c('#FFE06A'),[0,0,.02])}
  both(s=>P(g,flatLeaf(leafShape(.25,.08),.012,.1),m.c('#4E9A58'),[s*.05,.02,0],[0,s*.8,-.3]))});
N('mangrove',{r:.7,h:3.2,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const bm=m.c('#9C7A5E',{rim:.4});for(let i=0;i<7;i++){const a=i/7*TAU+rnd()*.3;P(g,G.tu([[0,1.3,0],[Math.cos(a)*.5,.9,Math.sin(a)*.5],[Math.cos(a)*.9,.3,Math.sin(a)*.9],[Math.cos(a)*1,-.2,Math.sin(a)*1]],.06,.045),bm)}
  P(g,G.tu([[0,1.2,0],[.1,2.1,0],[0,2.6,0]],.13,.1),bm);[[0,2.9,0,.9],[.6,2.6,.2,.6],[-.55,2.7,-.1,.65],[.1,3.3,-.2,.6]].forEach(([x,y,z,r],i)=>NH.cloud(g,m,i%2?'#5FB86A':'#4EA85E',x,y,z,r,rnd()*9))});
/* Lianen-Vorhang (für die Nachwachs-Mechanik, auch als Deko) */
function vineCurtain(g,m,w,h,rnd){const vm=m.c('#4E9A58',{rim:.5}),lm=m.c('#6CC872',{rim:.6});P(g,G.tu([[-w/2,h,0],[0,h+.2,0],[w/2,h,0]],.07,.07),m.c('#8A6A4E'));
  for(let i=0;i<9;i++){const x=-w/2+(i+.5)/9*w;const hh=h*(.55+rnd()*.45);const pts=[[x,h,0],[x+RR(rnd,-.08,.08),h-hh*.5,RR(rnd,-.05,.05)],[x+RR(rnd,-.1,.1),h-hh,0]];P(g,G.tu(pts,.03,.02),vm);
    for(let k=0;k<4;k++){const y=h-hh*(k+.5)/4;P(g,flatLeaf(leafShape(.2,.08),.01,.1),lm,[x+.03,y,.02],[0,rnd()*6,rnd()-.5])}}}
N('lianen',{r:.3,h:3,size:'small',planet:ID},(g,m,o,rnd)=>vineCurtain(g,m,1.2,2.6,rnd));
NH.ROCK[ID]=['#B8C4A8','#98A890','#5FB86A'];

/* ---------- Biome ---------- */
const BI={
  regenwald:{n:'Regenwald',g:['#5FB06A','#4EA05E'],cliff:'#8A7258',pat:'gras',grass:'#58B068',grassD:1,trees:[['urwaldriese',1.2],['urwaldpalme',2],['urwaldpalme2',1.5],['tropenweide',1.2],['bananenstaude',1.4]],treeD:2.2,
    deco:[['monstera',5],['palmwedel',4],['bromelie',2],['farn',5,{color:'#3E9A5C'}],['dschungelbusch',2],['moosstamm',.6],['orchidee',1.5]],decoD:8,rocks:[['moosfels',1],['moosfels_gross',.3]],rockD:.4,litter:[['liane',1.5],['mango',1],['kakaobohne',.6]]},
  lianenwald:{n:'Lianenwald',g:['#4EA05E','#3E9055'],cliff:'#7A6448',pat:'moos',grass:'#4E9A58',grassD:.8,trees:[['tropenweide',3],['urwaldriese',1.5]],treeD:2,
    deco:[['lianen',2],['monstera',3],['farn',4,{color:'#3E9A5C'}],['moosstumpf',1],['bromelie',1.5]],decoD:6,rocks:[['moosfels',1]],rockD:.3,litter:[['liane',2.5]]},
  mangroven:{n:'Mangroven',g:['#7AB88A','#68A878'],cliff:'#7A6A58',pat:'moos',grass:'#78B888',grassD:.6,trees:[['mangrove',3],['bogenpalme',1]],treeD:1.4,
    deco:[['schilfpflanze',4],['seerosenblatt',1],['pfuetze',2],['palmwedel',1]],decoD:5,rocks:[['moosfels',.6]],rockD:.2,litter:[['liane',1]]},
  orchideenlichtung:{n:'Orchideen-Lichtung',g:['#8FD07A','#7CC46A'],cliff:'#9A7A5A',pat:'gras',grass:'#86CC72',grassD:1,trees:[['bananenstaude',1],['bogenpalme',.6]],treeD:.35,
    deco:[['orchidee',8],['bromelie',3],['beerenbusch_d',1],['palmwedel',2],['blume',2]],decoD:7,rocks:[['moosfels',.5]],rockD:.2,litter:[['orchideenbluete',2],['mango',1]]},
  tempelhof:{n:'Tempelhof',g:['#A8B890','#98A880'],cliff:'#8A8270',pat:'moos',grass:'#8FB47A',grassD:.5,trees:[['urwaldpalme2',.6]],treeD:.25,
    deco:[['ruinensaeule',.8],['ruinenmauer',.5],['ruinentopf',1],['farn',3,{color:'#4E9A58'}],['lianen',.5]],decoD:2.5,rocks:[['moosfels',1]],rockD:.5,litter:[['tempelmuenze',.3],['liane',1]]},
  wasserfallklippen:{n:'Wasserfall-Klippen',g:['#8FA890','#7C9880'],cliff:'#6E7A70',pat:'moos',grass:'#7FA888',grassD:.4,trees:[['bogenpalme',.5]],treeD:.2,
    deco:[['moosfels',2],['farn',2,{color:'#4E9A58'}],['bromelie',1]],decoD:2,rocks:[['moosfels_gross',1]],rockD:.6,litter:[['liane',.5]]}};

/* ---------- Sammelsachen ---------- */
IT('liane',itMeta('Liane','dschungel','material',25),(g,m)=>{const vm=m.c('#4E9A58',{rim:.5});P(g,G.tu([[-.3,.05,-.2],[0,.08,.1],[.3,.05,-.1],[.2,.06,.25]],.04,.03),vm);range(4,(t,i)=>P(g,flatLeaf(leafShape(.18,.07),.01,.1),m.c('#6CC872'),[-.25+t*.5,.1,0],[-PI/2,i,0]))});
IT('mango',itMeta('Mango','dschungel','frucht',90),(g,m)=>{P(g,G.s(.22),m.c('#FFB43A',{gloss:.6,rim:.5}),[0,.22,0],null,[1,1.25,.9]);P(g,G.s(.1),m.c('#FF7E5A'),[.08,.32,.1],null,[1,1,.3]);P(g,G.cy(.015,.02,.08),m.c('#6E4A3A'),[0,.48,0])});
IT('kakaobohne',itMeta('Kakaofrucht','dschungel','frucht',160),(g,m)=>{P(g,G.s(.2),m.c('#E8963A',{rim:.4}),[0,.24,0],null,[.8,1.4,.8]);range(6,(t,i)=>P(g,G.cy(.012,.012,.5),m.c('#C8782E'),[Math.cos(i)*.15,.24,Math.sin(i)*.15]))});
IT('orchideenbluete',itMeta('Orchideenblüte','dschungel','blume',120),(g,m)=>{for(let i=0;i<5;i++){const a=i/5*TAU;P(g,G.s(.1),m.c('#FF8FC8',{rim:.7}),[Math.cos(a)*.1,.1,Math.sin(a)*.1],null,[1.2,.3,.8])}P(g,G.s(.05),m.c('#FFE06A'),[0,.14,0])});
IT('tempelmuenze',itMeta('Tempelmünze','dschungel','schatz',400),(g,m)=>{P(g,G.cy(.22,.22,.05),m.c('#FFD35C',{gloss:1.4,rim:.9}),[0,.05,0]);P(g,G.to(.15,.02),m.c('#E0A83A'),[0,.08,0],[PI/2,0,0]);P(g,G.s(.05),m.c('#56C6B6',{gloss:1}),[0,.09,0])});

/* ---------- Fische ---------- */
F('piranha',fishMeta('Piranha','dschungel','fluss','S','immer',1,240,'Ich hab einen Piranha gefangen! Er lächelt. Mit sehr vielen Zähnen.','Piranhas sind meist scheue Schwarmfische und fressen auch Früchte und Samen. Angriffe auf Menschen sind sehr selten.'),
  (g,m)=>{const f=fishT(g,m,{id:'piranha',H:.3,L:.62,back:'#8A96A8',belly:'#FF7E6B',tail:'fork',dorsal:'tri',mouth:'none'});range(5,(t,i)=>P(g,G.co(.018,.04),m.c('#FFFDF7'),[-.06+t*.12,-.06,f.nz-.03],[PI,0,0]))});
F('arapaima',fishMeta('Arapaima','dschungel','fluss','XL','tag',3,2400,'Ich hab einen Arapaima gefangen! Der ist länger als mein Sofa.','Der Arapaima gehört zu den grössten Süsswasserfischen der Welt und atmet Luft: Alle paar Minuten taucht er dafür auf.'),
  (g,m)=>fishT(g,m,{id:'arapaima',H:.18,L:1,back:'#5E7A6A',belly:'#E8704E',tail:'round',dorsal:'long',pat:(x,w,h,r)=>FT.bands(x,w,h,'#E8704E',[.78,.84,.9],6,.6)}));
F('buntbarsch',fishMeta('Regenbogen-Buntbarsch','dschungel','teich','S','tag',1,180,'Ich hab einen Regenbogen-Buntbarsch gefangen! Er hat sich für alle Farben gleichzeitig entschieden.','Buntbarsche kümmern sich intensiv um ihren Nachwuchs. Manche Arten tragen die Jungen bei Gefahr sogar im Maul.'),
  (g,m)=>fishT(g,m,{id:'buntbarsch',H:.3,L:.6,back:'#56C6B6',belly:'#FFD35C',tail:'fancy',dorsal:'sail',pat:(x,w,h,r)=>{FT.stripe(x,w,h,'#FF8FB1',12,.2,.8,.3);FT.stripe(x,w,h,'#8E6BD1',10,.2,.8,.4)}}));
F('zitteraal',fishMeta('Zitteraal','dschungel','fluss','L','nacht',4,3000,'Ich hab einen Zitteraal gefangen! Meine Haare stehen jetzt ab. Mehr als sonst.','Zitteraale erzeugen mit Muskelzellen bis zu 600 Volt. Sie nutzen schwache Stromstösse auch zum Orientieren im trüben Wasser.'),
  (g,m)=>{const bm=m.c('#5E6A8A',{gloss:.8});const pts=range(10,t=>[Math.sin(t*6)*.06,0,-.6+t*1.2]);P(g,G.tu(pts,.1,.04),bm);P(g,G.s(.11),bm,[0,0,.62]);eye(g,m,[.06,.04,.68],.03,[1,.2,.5]);eye(g,m,[-.06,.04,.68],.03,[-1,.2,.5]);
    range(6,(t,i)=>markGlow(g,P(g,G.s(.03),m.glow('#FFE95A',1.8),[pts[i+2][0],.06,pts[i+2][2]])))});
F('diskusfisch',fishMeta('Diskusfisch','dschungel','teich','M','immer',2,700,'Ich hab einen Diskusfisch gefangen! Rund wie eine Schallplatte, aber leiser.','Diskusfische füttern ihre Jungen mit einem Hautsekret – eine Art Fisch-Milch, die die Eltern abwechselnd anbieten.'),
  (g,m)=>fishT(g,m,{id:'diskus',H:.46,L:.56,W:.4,back:'#FF9E6E',belly:'#FFD8A8',tail:'round',dorsal:'long',pat:(x,w,h,r)=>FT.bands(x,w,h,'#5AA8D8',[.2,.35,.5,.65,.8],5,.2)}));

/* ---------- Insekten ---------- */
B('morphofalter',bugMeta('Morphofalter','dschungel','luft','tag',2,800,'Ich hab einen Morphofalter gefangen! So blau, dass der Himmel neidisch wird.','Das Blau des Morphofalters ist keine Farbe, sondern Licht, das an winzigen Strukturen der Flügelschuppen gebrochen wird.'),
  (g,m)=>{if(butterfly)butterfly(g,m,'#3F8EF0','#8FD0FF',1.1);else{P(g,G.ca(.04,.3),m.c('#3B3450'),[0,.3,0],[PI/2,0,0]);wingPair(g,m,m.c('#3F8EF0',{gloss:1.2,rim:1}),leafShape(.45,.3),[0,.32,0],.8,.4,.2,.02)}});
B('herkuleskaefer',bugMeta('Herkuleskäfer','dschungel','baum','nacht',4,3500,'Ich hab einen Herkuleskäfer gefangen! Der trägt ein Horn wie einen Hut.','Der Herkuleskäfer kann ein Vielfaches seines Körpergewichts heben. Die Männchen ringen mit ihren Hörnern um Weibchen.'),
  (g,m)=>{const bm=m.c('#2E2A3E',{gloss:1.2}),sm=m.c('#D8C07A',{gloss:1.3,rim:.6});P(g,G.s(.26),sm,[0,.2,-.1],null,[.9,.6,1.2]);P(g,G.s(.16),bm,[0,.22,.22]);P(g,G.tu([[0,.3,.22],[0,.42,.45],[0,.34,.65]],.035,.02),bm);P(g,G.tu([[0,.18,.32],[0,.2,.5],[0,.28,.58]],.025,.015),bm);bugFace(g,m,[0,.2,.32],.1,.6);legs(g,bm,[[.15,.28,.1],[0,.3,0],[-.15,.28,-.1]],.16)});
B('blattschneider',bugMeta('Blattschneiderameise','dschungel','boden','tag',1,120,'Ich hab eine Blattschneiderameise gefangen! Sie trägt ein Blatt wie einen Sonnenschirm.','Blattschneiderameisen fressen die Blätter nicht selbst: Sie züchten damit einen Pilz in ihrem Bau – echte Gärtnerinnen.'),
  (g,m)=>{const bm=m.c('#B8583A',{gloss:.8});P(g,G.s(.1),bm,[0,.12,-.14]);P(g,G.s(.07),bm,[0,.12,0]);P(g,G.s(.09),bm,[0,.14,.14]);bugFace(g,m,[0,.15,.16],.08,.5);legs(g,bm,[[.1,.15,.1],[0,.16,0],[-.1,.15,-.1]],.1);P(g,flatLeaf(leafShape(.4,.25),.012,.1),m.c('#6CC872',{rim:.6}),[0,.4,.1],[-.3,0,0])});
B('stabschrecke',bugMeta('Stabheuschrecke','dschungel','baum','immer',2,600,'Ich hab eine Stabheuschrecke gefangen! Oder einen Ast. Ich bin mir nicht ganz sicher.','Stabheuschrecken tarnen sich als Zweige und schaukeln sogar im Wind mit, damit Feinde sie für Pflanzen halten.'),
  (g,m)=>{const bm=m.c('#8A7A4E');P(g,G.tu([[0,.12,-.5],[0,.13,0],[0,.14,.45]],.025,.02),bm);bugFace(g,m,[0,.15,.46],.045,.6);legs(g,bm,[[.12,.4,.2],[0,.45,0],[-.12,.4,-.2]],.12,.01);feelers(g,bm,bm,[.01,.15,.5],.4,.1,.1)});
B('laternentraeger',bugMeta('Laternenträger','dschungel','baum','nacht',3,1600,'Ich hab einen Laternenträger gefangen! Er hat seine eigene Lampe dabei, sehr praktisch.','Laternenträger heissen so, weil man früher dachte, ihr langer Kopffortsatz leuchte. Tut er nicht – aber er sieht fantastisch aus.'),
  (g,m)=>{const bm=m.c('#8FB86A');P(g,G.s(.14),bm,[0,.18,0],null,[.9,.6,1.3]);P(g,G.tu([[0,.2,.16],[0,.3,.4],[0,.34,.55]],.06,.035),m.c('#FF8FB1',{rim:.6}));markGlow(g,P(g,G.s(.06),m.glow('#FFE06A',1.5),[0,.35,.56]));
    wingPair(g,m,m.c('#FFB27A',{rim:.6}),leafShape(.35,.18),[0,.22,-.05],.6,.2,.4,.02);bugFace(g,m,[0,.2,.18],.07,.6)});

/* ---------- Fundstücke ---------- */
REL('jadefrosch',relMeta('Jade-Frosch','dschungel','kunst',2,900,'Ein kleiner Frosch aus Jade! Er glänzt, als wäre er gerade aus dem Regen gehüpft.','Jade war in vielen alten Kulturen Mittelamerikas wertvoller als Gold. Man verband den grünen Stein mit Wasser, Pflanzen und Leben.'),
  (g,m)=>{const jm=m.c('#5FC89A',{gloss:1.3,rim:.8});P(g,G.s(.3),jm,[0,.25,0],null,[1.2,.8,1]);P(g,G.s(.2),jm,[0,.42,.18]);eye(g,m,[.1,.52,.24],.05,[1,.3,.5]);eye(g,m,[-.1,.52,.24],.05,[-1,.3,.5]);both(s=>P(g,G.s(.1),jm,[s*.25,.08,.15],null,[1,.5,1.3]))});
REL('steinkopf',relMeta('Steinkopf','dschungel','kunst',3,1600,'Ein Steinkopf mit einem sehr entspannten Gesichtsausdruck.','Die Olmeken meisselten riesige Steinköpfe mit bis zu drei Metern Höhe. Vermutlich stellen sie ihre Herrscher dar.'),
  (g,m)=>{const sm=stoneM(m,'#B8B09A');P(g,G.s(.4),sm,[0,.4,0],null,[1,1.1,.95]);P(g,G.bx(.7,.18,.6,.08),sm,[0,.72,0]);both(s=>{P(g,G.bx(.12,.05,.02,.01),m.c('#6E6A5A'),[s*.14,.46,.38]);P(g,G.s(.08),sm,[s*.38,.4,.05])});P(g,G.bx(.2,.05,.02,.01),m.c('#6E6A5A'),[0,.24,.39])});
REL('federkrone',relMeta('Federkrone','dschungel','kunst',4,2800,'Eine uralte Federkrone! Die Farben sind noch erstaunlich frisch.','Federn tropischer Vögel waren kostbare Handelsware. Grüne Quetzalfedern durften bei den Azteken nur Adlige tragen.'),
  (g,m)=>{P(g,G.to(.3,.06),m.c('#FFD35C',{gloss:1.2}),[0,.1,0],[PI/2,0,0]);for(let i=0;i<9;i++){const a=(i-4)*.2;const q=grp(g,[Math.sin(a)*.3,.12,-Math.cos(a)*.3],[-.2,a,0]);P(q,flatLeaf(leafShape(.6,.15),.012,.1),m.c(['#3FC8A0','#56C6B6','#FF6B7A','#FFD35C'][i%4],{rim:.6}),[0,.3,0])}});
REL('kalenderstein',relMeta('Kalenderstein','dschungel','kunst',3,1900,'Ein runder Stein voller Zeichen. Heute ist ein guter Tag, steht da. Glaube ich.','Viele alte Kulturen hatten mehrere Kalender gleichzeitig: einen für die Jahreszeiten, einen für Rituale. Sie liefen ineinander wie Zahnräder.'),
  (g,m)=>{const sm=stoneM(m,'#C8B690');P(g,G.cy(.5,.5,.12),sm,[0,.5,0],[PI/2,0,0]);for(let k=1;k<4;k++)P(g,G.to(k*.12,.015),m.c('#8A7458'),[0,.5,.065]);range(12,(t,i)=>{const a=i/12*TAU;P(g,G.bx(.04,.04,.02,.01),m.c('#8A7458'),[Math.cos(a)*.42,.5+Math.sin(a)*.42,.065])})});

/* ---------- Tiere ---------- */
Object.assign(FAUNA.S,{
  tukan:{n:'Tukan',planet:ID,biomes:['regenwald','orchideenlichtung','lianenwald'],fly:true,count:4,size:.6,speed:1.3,voice:['krrk','tock-tock','kiu'],pitch:420,likes:['mango','beeren'],product:'mango',names:['Schnabelino','Tuki','Rio','Papaya','Kiwi'],fact:'Der riesige Tukan-Schnabel ist leicht und hohl. Er hilft auch beim Abkühlen: Über ihn gibt der Vogel Wärme ab.',
    a:{col:'#2E2A3E',belly:'#FFF1C8',body:[.28,.3,.4],head:{r:.22,p:[0,.62,.3]},snout:{type:'beak',col:'#FF9E3A',len:1.4},ears:{type:'none'},legs:{n:2,len:.14,r:.035,col:'#56C6B6',foot:'#56C6B6'},tail:{type:'fan',col:'#2E2A3E'},wings:{col:'#2E2A3E'}}},
  faultier:{n:'Faultier',planet:ID,biomes:['lianenwald','regenwald'],count:3,size:.9,speed:.2,voice:['hmmmm','ahhh','mh?'],pitch:180,likes:['orchideenbluete','mango'],product:'liane',names:['Schlummi','Langsam-Lotte','Döschen','Siesta','Gemach'],fact:'Faultiere bewegen sich so langsam, dass in ihrem Fell Algen wachsen – eine grüne Tarnung, gratis dazu.',
    a:{col:'#B89A7A',belly:'#E8D8C0',body:[.36,.32,.4],head:{r:.26,col:'#E8D8C0',p:[0,.72,.32]},snout:{type:'dot',nose:'#4A3A2E'},eyes:{r:.07},ears:{type:'none'},legs:{n:4,len:.26,r:.07,col:'#A88A6A',foot:'#6E5A48'},tail:{type:'nub'},spots:{col:'#8A6A4E',n:3,s:1.6}}},
  jaguar:{n:'Jaguar',planet:ID,biomes:['regenwald','tempelhof'],count:2,size:1.3,speed:1.5,shy:true,night:true,voice:['mrrau','prrr','hmpf'],pitch:220,likes:['mango','kakaobohne'],product:'tempelmuenze',names:['Jaguara','Pünktchen','Samtpfote','Balam','Nachtfell'],fact:'Jaguare schwimmen gern und jagen sogar im Wasser. Ihr Name kommt vermutlich von einem Wort für „der mit einem Sprung tötet".',
    a:{col:'#F2B45A',belly:'#FFF1DC',body:[.36,.3,.6],head:{r:.27,p:[0,.62,.58]},snout:{type:'muzzle',col:'#FFF1DC',nose:'#E07A7A'},ears:{type:'round',x:.55,y:.62},legs:{n:4,len:.22,r:.07,foot:'#E8A04A'},tail:{type:'long',len:.9,curl:.4,tip:'#2E2A3E'},spots:{col:'#8A5A2E',n:14,s:.9}}},
  pfeilgiftfrosch:{n:'Pfeilgiftfrosch',planet:ID,biomes:['regenwald','mangroven'],nearWater:true,count:4,size:.4,speed:1.3,gait:'hop',voice:['piep','tsirp'],pitch:640,likes:['orchideenbluete'],product:'orchideenbluete',names:['Blau','Klecks','Tropfen','Beere','Neon'],fact:'Pfeilgiftfrösche warnen mit knalligen Farben: Achtung, giftig! In Gefangenschaft verlieren viele ihr Gift, weil es aus ihrer Nahrung stammt.',
    a:{col:'#3F8EF0',belly:'#2E2A3E',body:[.4,.26,.38],head:{r:.3,p:[0,.42,.24],sc:[1.2,.8,1]},snout:{type:'wide'},eyes:{r:.1,x:.5,y:.55},ears:{type:'none'},legs:{n:4,len:.1,r:.08,foot:'#2E2A3E'},tail:{type:'none'},spots:{col:'#2E2A3E',n:7},gait:'hop'}},
  capybara:{n:'Capybara',planet:ID,biomes:['mangroven','orchideenlichtung'],nearWater:true,count:4,herd:true,size:1.1,speed:.6,voice:['wiek','hmpf','quiek'],pitch:260,likes:['mango','unkraut'],product:'kakaobohne',names:['Kapi','Gelassen-Gustav','Chillo','Badewanne','Wasserschwein'],fact:'Capybaras sind die grössten Nagetiere der Welt – und so entspannt, dass sich Vögel, Affen und sogar Kaimane neben sie setzen.',
    a:{col:'#B8866A',belly:'#C89A7E',body:[.4,.34,.56],head:{r:.26,p:[0,.62,.52],sc:[.9,1,1.3]},snout:{type:'muzzle',col:'#A8765A',nose:'#4A3A2E',len:.9},ears:{type:'round',x:.5,y:.6},eyes:{r:.06},legs:{n:4,len:.14,r:.08,foot:'#8A5E48'},tail:{type:'none'}}},
  ara:{n:'Hellroter Ara',planet:ID,biomes:['regenwald','orchideenlichtung','tempelhof'],fly:true,count:4,size:.65,speed:1.4,voice:['kraaa','hallo!','ara-ra'],pitch:460,likes:['mango','kakaobohne'],product:'orchideenbluete',names:['Rubin','Lolli','Kapitän','Plappi','Sunny'],fact:'Aras fressen Lehm von Flussufern. Vermutlich neutralisiert er Giftstoffe aus unreifen Früchten und Samen.',
    a:{col:'#F0404E',belly:'#FF6B6B',body:[.26,.28,.4],head:{r:.22,p:[0,.62,.3]},snout:{type:'beak',col:'#FFF1DC',len:.55},ears:{type:'none'},legs:{n:2,len:.12,r:.035,col:'#6E6A7A',foot:'#6E6A7A'},tail:{type:'long',len:1,col:'#3F8EF0',tip:'#FFD35C'},wings:{col:'#3F8EF0'}}},
  bruellaffe:{n:'Brüllaffe',planet:ID,biomes:['lianenwald','regenwald'],count:3,herd:true,size:.8,speed:1.3,voice:['UUUH','hu-hu','waaah'],pitch:160,likes:['mango','kakaobohne','beeren'],product:'liane',names:['Lautstark','Tenor','Bananenbert','Echo','Hopsi'],fact:'Brüllaffen sind die lautesten Landtiere Amerikas: Ihr Ruf ist bis zu fünf Kilometer weit zu hören.',
    a:{col:'#8A5E48',belly:'#B8866A',body:[.3,.32,.36],head:{r:.25,col:'#6E4A3A',p:[0,.7,.25]},snout:{type:'muzzle',col:'#E8C0A0',nose:'#4A3A2E',len:.6},ears:{type:'round',x:.75,y:.3},legs:{n:4,len:.3,r:.06,foot:'#6E4A3A'},tail:{type:'long',len:1.2,curl:1.2}}}});

/* ---------- Kleidung ---------- */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','tropenhut','Tropenhelm',720,'#E8D8B0',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.92),M.c(col,{rim:.5}),[0,0,0],null,[1,.8,1]);P(q,G.cy(r*1.35,r*1.35,r*.05),M.c(col),[0,0,0]);P(q,G.to(r*.9,r*.06),M.c('#8A6A4E'),[0,r*.08,0],[PI/2,0,0])});
def('neck','blumenlei','Orchideen-Kette',480,'#FF8FC8',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);for(let i=0;i<12;i++){const a=i/12*TAU;const f=grp(q,[Math.cos(a)*r*.62,-r*.05,Math.sin(a)*r*.62]);for(let k=0;k<4;k++){const b=k/4*TAU;P(f,G.s(r*.07),M.c(i%2?col:'#FFFFFF'),[Math.cos(b)*r*.06,0,Math.sin(b)*r*.06],null,[1,.5,1])}}});
def('top','blatthemd','Blätter-Hemd',860,'#5FB86A',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y-r*.5,0]);for(let i=0;i<10;i++){const a=i/10*TAU;P(q,flatLeaf(leafShape(r*.9,r*.4),.012,.2),M.c(i%2?col:'#4EA85E',{rim:.5}),[Math.cos(a)*r*.75,-r*.2,Math.sin(a)*r*.75],[0,-a+PI/2,.25])}});

/* ---------- Bau-Familie: Pfahlhäuser mit Blätterdach ---------- */
const shadeC=(c,f)=>'#'+new THREE.Color(c).multiplyScalar(f).getHexString();
function pfahlhaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.4:1;const style=plan.style||A.pick(r,['blatt','bambus','baum']);const body=new THREE.Group();g.add(body);
  const W=(1.7+r()*.4)*big,D=(1.5+r()*.3)*big,Hs=(.9+r()*.3)*big,Hw=(1.15+r()*.2)*big;const wood=A.pick(r,['#A0704C','#B8875A','#8A5E42']),bamboo='#D8C07A',leaf=A.pick(r,['#5FB86A','#4EA85E','#6CC872']);
  /* Pfähle und Plattform */for(const[x,z]of[[-1,-1],[1,-1],[-1,1],[1,1]])P(body,G.cy(.08,.1,Hs+.02),cozy({color:shadeC(wood,.85)}),[x*(W/2-.12),Hs/2,z*(D/2-.12)]);
  P(body,G.bx(W+.5,.14,D+.5,.04),cozy({color:wood}),[0,Hs+.07,0]);for(let i=0;i<Math.round((W+.5)/.22);i++)P(body,G.bx(.02,.02,D+.5,.005),cozy({color:shadeC(wood,.75)}),[-W/2-.25+i*.22,Hs+.145,0]);
  /* Wände */const wc=style==='bambus'?bamboo:style==='baum'?'#C8A070':A.pick(r,['#F2DDB0','#E8D0A0']);const wall=P(body,G.bx(W,Hw,D,.06),cozy({color:wc}),[0,Hs+.14+Hw/2,0]);
  if(style==='bambus')for(let i=0;i<Math.round(W/.12);i++)for(const z of[-1,1])P(body,G.cy(.05,.05,Hw),cozy({color:shadeC(bamboo,.9+(i%2)*.12)}),[-W/2+.06+i*.12,Hs+.14+Hw/2,z*(D/2+.02)]);
  /* Blätterdach: Lagen grosser Blätter */const top=Hs+.14+Hw;const rw=W+.9,rd=D+.9;for(let k=0;k<4;k++){const y=top+k*.22;const s=1-k*.2;for(let i=0;i<10;i++){const a=i/10*TAU;const lf=P(body,flatLeaf(leafShape(rw*.5*s,rd*.28*s),.02,.35),cozy({color:shadeC(leaf,1-k*.06+(i%2)*.05)}),[Math.cos(a)*rw*.22*s,y,Math.sin(a)*rd*.22*s],[.55,-a+PI/2,0])}}
  P(body,G.co(W*.3,.5),cozy({color:shadeC(leaf,.85)}),[0,top+1,0]);
  /* Tür nach −z, Leiter, Geländer */const doorZ=-D/2-.02;const dr=A.archDoor(A.pick(r,['#56C6B6','#FF8FB1','#FFD35C','#8A5E42']),shadeC(wood,.7));dr.position.set(0,Hs+.14,doorZ);dr.rotation.y=PI;body.add(dr);
  for(const s of[-1,1])P(body,G.cy(.035,.035,Hs+.5),cozy({color:shadeC(wood,.8)}),[s*.3,(Hs+.2)/2,doorZ-.55],[.35,0,0]);for(let i=0;i<5;i++)P(body,G.cy(.025,.025,.62),cozy({color:wood}),[0,.15+i*Hs/5,doorZ-.5-i*.06],[0,0,PI/2]);
  for(const s of[-1,1])for(let i=0;i<4;i++)P(body,G.cy(.025,.025,.5),cozy({color:shadeC(wood,.8)}),[s*(W/2+.2),Hs+.4,-D/2+i*D/3],[0,0,0]);
  if(style==='baum'){/* Baum wächst durch das Dach */P(body,G.cy(.28,.36,top+1.6),cozy({color:'#8A6A4E'}),[W*.22,(top+1.6)/2,D*.1]);NH.cloud(body,makeMats({skin:'haut',color:0}),'#5FB86A',W*.22,top+2,D*.1,1.2,r()*9)}
  const win=A.roundWindow('#8A6A4E',.16,false);win.position.set(W/2+.01,Hs+.14+Hw*.6,0);win.rotation.y=PI/2;body.add(win);
  addOutlines(body);const R0=Math.max(W,D)/2+.3;return{g,R:R0+.8,top:top+1.2,door:[0,doorZ-.6],walls:[new THREE.Box3(new V(-W/2-.25,0,-D/2-.25),new V(W/2+.25,top+1,D/2+.25))],style:'pfahlhaus-'+style}}

/* ---------- Sprache: Ranken-Zeichen ---------- */
function vineGlyph(x,s,r,R){x.beginPath();let px=-s*.35,py=s*.35;x.moveTo(px,py);for(let i=0;i<3;i++){const nx=px+s*.25,ny=py-s*.25+R()*.3;x.quadraticCurveTo(px+R(),py-s*.3,nx,ny);px=nx;py=ny}x.stroke();
  for(let i=0;i<2+Math.floor(r()*2);i++){const cx=R()*.7,cy=R()*.7;x.beginPath();x.ellipse(cx,cy,s*.1,s*.05,r()*3,0,TAU);x.fill()}if(r()<.5){x.beginPath();x.arc(R()*.5,-s*.3,s*.08,0,TAU);x.stroke()}}

/* ---------- Planet ---------- */
PLANETKIT.add(ID,{
  def:{n:'Dschungel-Welt',base:'kompost',R:140,R0:46,sea:-.2,music:'world',sky:['#9ee0d0','#f4ffe0'],fog:'#d8f0d8',water:'#4FC8B0',deep:'#2A8E88',step:1.35,shop:ID,
    desc:'Grüne Berge, Flusstäler, Mangroven und drei überwucherte Tempel. Hier schwingt man an Lianen.',weather:'blueten',orbit:[117,2.2],size:1.05,col:['#5FB86A','#4FC8B0'],packs:['jungle','ruins'],moons:2,
    park:'regenwald',parkPond:true,phone:['#A8E8B8','#FFE08A'],stones:['tempelmuenze','stein_klein','kiesel'],
    space:{deep:'#2A8E88',water:'#4FC8B0',shore:'#E8E0A8',land:'#5FB86A',land2:'#3E9A5C',high:'#8FA890',cap:'#F4FFF0',atmo:'#A8F0D8',cloud:.7,sea:.4,capA:.6,freq:2.8},
    mac:{oc:-.15,m:.12,isl:1},climate:{wet:'mangroven',hot:'orchideenlichtung',cold:'lianenwald'},peak:'wasserfallklippen',terr:1,
    raw(q,p,{N,N2,N3,fbm}){let h=fbm(q,1.3,5)*2.4+1.1;const rv=Math.abs(N2(q.x*1.2,q.y*1.2,q.z*1.2));h-=3.2*sstep(.07,0,rv)*sstep(-.4,.2,p.y);
      const ridge=1-Math.abs(N3(q.x*.9,q.y*.9,q.z*.9));h+=Math.pow(ridge,4)*3.2*sstep(.975,.9,p.y);return h},
    biome({T,M,h,sea,low,nearPond,p}){for(const t of TEMPLES)if(angle(p,t.d)<.07)return'tempelhof';if(low||nearPond)return'mangroven';if(M>.25)return'lianenwald';if(T>.25&&M<0)return'orchideenlichtung';return'regenwald'},
    onLoad:G=>DSCHUNGEL.onLoad(G),tick:(dt,t,G,me)=>DSCHUNGEL.tick(dt,t,G,me)},
  places:[{id:'platz',n:'Lianen-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Seerosen-Lagune',lat:45,lon:110,r:.11,pond:true},{id:'teich2',n:'Kaiman-Tümpel',lat:40,lon:240,r:.09,pond:true},{id:'see',n:'Wasserfall-Becken',lat:5,lon:130,r:.13,pond:true}]
    .concat(TEMPLES.map(t=>({id:'tempel-'+t.id,n:t.n,lat:t.lat,lon:t.lon,r:.045,h:1.3}))),
  biomes:BI,
  names:{casino:'Jaguar-Casino',mode:'Liane & Seide',praxis:'Heilpflanzen-Hütte',museum:'Tempel-Museum',shop:'Mango-Markt',studio:'Farbstudio Ara',bar:'Regenwald-Jazz',rathaus:'Baumkronen-Rathaus',garage:'Floss-Werft',pflanzen:'Orchideen-Gärtnerei',tiere:'Faultier-Station'},
  sty:{wall:'holz',walls:['#F2DDB0','#E8D0A0','#D8C07A','#C8E0B0'],roof:'gable',roofs:['#5FB86A','#4EA85E','#8FB86A'],trim:'#FFF6DC',plinth:'#8A7258',door:'#56C6B6',win:'rund',pitch:.9},
  wall:'holzpaneel',floor:'dielen',
  mayor:['Bürgermeister Tuko Tukan',{skin:'fell',color:17,shape:'birne'},{kopf:'vogel',augen:'kuller',arme:'fluegel',beine:'huhn',extras:['blume']}],
  lore:['Der Dschungel gehört allen, die in ihm wohnen – auch den Lianen. Über Nacht holen sie sich die Wege zurück.','In den drei Tempeln liegen alte Schiebe-Rätsel. Wer sie löst, findet die Schatzkammer.','An den Flüssen hängen starke Lianen. Halt dich gut fest und schwing!'],
  caveRock:['#A8B89A','#889A80','#4E5E48',['#A8F0D8','#C8FFE8','#8FE0C8']],
  wear:['tropenhut','blumenlei','blatthemd','strohhut','halstuch','poncho'],clothes:CL,
  haus:{theme:{roof:['#5FB86A','#4EA85E','#8FB86A'],wall:['#F2DDB0','#E8D0A0','#D8C07A'],wood:['#A0704C','#B8875A','#8A5E42'],stone:['#B8C4A8','#A8B498'],trim:['#FFF6DC','#F4FFF0'],plant:['#5FB86A','#6CC872']},
    props:[['nature','plant_bushLarge',1.5,'c',0],['nature','log_stack',1.2,'s',0],['nature','pot_large',1.3,'d',0],['nature','plant_bushDetailed',1.3,'cb'],['survival','barrel',.9,'d']],
    garden:{path:'planks',flowers:['flower_redA','flower_purpleA','flower_redB'],veg:['crop_melon']},
    plan:[{fam:'pfahlhaus',style:'blatt'},{fam:'pfahlhaus',style:'bambus'},{fam:'pfahlhaus',style:'baum'},{fam:'pfahlhaus'}],fams:{pfahlhaus}},
  residents:{skins:['fell','moos','schuppen','holz','pluesch'],heads:['vogel','frosch','chamaeleon','katze','axolotl','bluete','eule','kaefer','mensch'],names:['Mango','Liana','Kakao-Kai','Orchi','Jade','Tuki','Regenwald-Rita','Moosbert','Papaya','Brülli','Kolibri','Samba'],
    house:{shapes:['huette','spitz'],walls:['holz'],wallCols:['#F2DDB0','#D8C07A'],roofCols:['#5FB86A','#8FB86A'],win:['rund']},deco:['monstera','palmwedel','orchidee','bromelie'],fence:false},
  lang:{n:'Rankisch',ink:'#2E6E48',glow:'#8FF0B8',kind:'vine',draw:vineGlyph,syl:['ma','ku','li','ya','to','ri','xa','na','pu','ek','la','oo']},ruinStone:'#C8B690',
  terraform:['regenwald','orchideenlichtung','mangroven','lianenwald'],
  weather:[['regen',3],['gewitter',2],['nebel',2],['heiter',2],['klar',1]]});

/* ================= Besonderheiten ================= */
const DSCHUNGEL=(()=>{let vines=[],swings=[],temples=[],swingVine=null,lastH=null;const M=()=>makeMats({skin:'haut',color:0});
  const S=()=>SAVE.dsch=SAVE.dsch||{nights:0,cut:{},solved:{},swings:0};
  const isNight=()=>{const h=GAMETIME.hour();return h<6||h>=19};
  function onLoad(W){vines=[];swings=[];temples=[];swingVine=null;const m=M();const r=srand(777);
    /* Lianen-Vorhänge quer über Wege im Wald */for(let i=0,t=0;i<14&&t<500;t++){const d=new V().randomDirection();if(d.y>.95)continue;const b=W.biomeAt(d);if(!['regenwald','lianenwald'].includes(b)||!GAME.isLand(d))continue;
      const g=new THREE.Group();vineCurtain(g,m,2.2,2.8,r);addOutlines(g);GAME.placeObj(g,d,r()*6,0);const v={id:'v'+i,d,g,ob:GAME.addObst(d,1.1)};vines.push(v);
      W.inter.push({kind:'liane',p:d,r:1.8,label:'Lianen zerschneiden',act:()=>cut(v),when:()=>g.visible});i++}
    applyVines();
    /* Schwing-Lianen: Paare über Wasser (Fluss/Teich) */for(let t=0;t<900&&swings.length<8;t++){const a=new V().randomDirection();if(a.y>.95||!GAME.isLand(a))continue;const dir=GAME.tangentTo(a,new V().randomDirection());
      const b=a.clone().applyAxisAngle(new V().crossVectors(a,dir).normalize(),11/W.R).normalize();if(!GAME.isLand(b))continue;const mid=a.clone().add(b).normalize();if(W.hAt(mid)>W.sea-.3)continue;
      if(swings.some(s=>angle(s.a,a)*W.R<25))continue;const s={a,b,mid};swings.push(s);
      for(const[p,q]of[[a,b],[b,a]]){const pole=new THREE.Group();P(pole,G.cy(.12,.16,4.2),m.c('#8A6A4E'),[0,2.1,0]);NH.cloud(pole,m,'#4EA85E',0,4.4,0,1,r()*9);P(pole,G.tu([[0,4,0],[.3,2.6,.1],[.2,1.3,0]],.04,.03),m.c('#4E9A58'));addOutlines(pole);GAME.placeObj(pole,p,0,0);
        W.inter.push({kind:'schwingliane',p,r:1.6,label:'An der Liane rüberschwingen',act:()=>swing(p,q)})}}
    /* Tempel */for(const t of TEMPLES){const pl=W.places.find(x=>x.id==='tempel-'+t.id);if(!pl)continue;const g=buildTemple(m,t);GAME.placeObj(g,pl.dir,0,0);temples.push({t,g,dir:pl.dir});GAME.addObst(pl.dir,1.4);
      W.inter.push({kind:'tempel',p:pl.dir,r:3.6,label:'Tempel-Rätsel ansehen ('+t.n+')',act:()=>puzzle(t,g)})}}
  function buildTemple(m,t){const g=new THREE.Group();const add=(piece,x,z,ry,s)=>{if(!KIT.has('ruins',piece))return;const mm=KIT.mesh('ruins',piece,RPAL);mm.position.set(x,0,z);mm.rotation.y=ry||0;if(s)mm.scale.setScalar(s);g.add(mm)};
    for(let i=0;i<8;i++){const a=i/8*TAU;if(i===0)continue;add(i%2?'Wall_Overgrown':'Window_Bars_Overgrown',Math.sin(a)*4,Math.cos(a)*4,a)}add('Arch_Round',0,4,0);
    for(let i=0;i<4;i++){const a=i/4*TAU+PI/4;add('Column_Round',Math.sin(a)*2.6,Math.cos(a)*2.6,0,.8)}add(t.id==='t1'?'Statue_Fox':'Statue_Stag',0,-2.2,0,.7);add('Stairs',0,3,PI,.8);add('Chest_Gold',0,-1,0,.8);
    add('Torch',-1.2,3.6,0);add('Torch',1.2,3.6,0);const fl=P(g,G.cy(3.8,3.9,.12),m.c('#B8B09A'),[0,.03,0]);fl.receiveShadow=true;
    const tab=new THREE.Group();P(tab,G.bx(1.2,1.2,.2,.05),stoneM(m,'#C8B690'),[0,.9,0]);for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i+j<4)P(tab,G.bx(.34,.34,.06,.03),m.c('#D8C890'),[-.38+i*.38,1.28-j*.38,.12]);tab.position.set(0,0,1.2);g.add(tab);g.userData.tab=tab;return g}
  function cut(v){const st=S();st.cut[v.id]=st.nights;persist();SND.play('chop');GAME.W.fx(v.d,'blatt',14);v.g.visible=false;if(v.ob)v.ob.r=0;if(bagAdd('item','liane'))UI.toast('Liane eingesteckt. Über Nacht wächst der Vorhang nach.',2800)}
  function applyVines(){const st=S();for(const v of vines){const gone=st.cut[v.id]!=null&&st.cut[v.id]>=st.nights;v.g.visible=!gone;if(v.ob)v.ob.r=gone?0:1.1;if(!gone&&v._grow==null)v._grow=0}}
  function swing(from,to){const me=GAME.me;if(!me||me.script)return;const st=S();st.swings++;persist();SND.play('whoosh');const m=M();
    const line=new THREE.Mesh(G.cy(.035,.035,1),m.c('#4E9A58'));GAME.G.scene.add(line);swingVine={line,from,to};
    me.script={from:from.clone(),to:to.clone(),dur:1.7,peak:3.4,t:0,ease:k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,done:()=>{GAME.G.scene.remove(line);swingVine=null;SND.play('soft');GAME.W.fx(to,'blatt',8);if(st.swings===1)UI.toast('Juhu! Du bist an der Liane geschwungen.',2400)}}}
  /* Schiebe-Rätsel 3×3 mit einem Tempelbild */
  function puzzle(t,g){const st=S();if(st.solved[t.id]){UI.talk(t.n,['Die Schatzkammer steht offen. Das Rätsel hast du schon gelöst.']);return}
    const w=UI.win(t.n+' · Schiebe-Rätsel',{size:'narrow'});const pic=ctex('tempelbild-'+t.id,300,300,(x,W,H)=>{const bg=x.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#F2E2B0');bg.addColorStop(1,'#C8A870');x.fillStyle=bg;x.fillRect(0,0,W,H);
      x.strokeStyle='#6E5A40';x.lineWidth=10;x.lineCap='round';x.fillStyle='#3FC8A0';if(t.id==='t0'){x.beginPath();x.arc(150,150,60,0,TAU);x.fillStyle='#FFD35C';x.fill();x.stroke();for(let i=0;i<12;i++){const a=i/12*TAU;x.beginPath();x.moveTo(150+Math.cos(a)*80,150+Math.sin(a)*80);x.lineTo(150+Math.cos(a)*125,150+Math.sin(a)*125);x.stroke()}}
      else if(t.id==='t1'){x.fillStyle='#F2B45A';x.beginPath();x.ellipse(150,160,95,80,0,0,TAU);x.fill();x.stroke();x.fillStyle='#8A5A2E';for(let i=0;i<9;i++){x.beginPath();x.arc(90+(i%3)*60,120+Math.floor(i/3)*40,10,0,TAU);x.fill()}x.fillStyle='#2E2A3E';x.beginPath();x.arc(120,140,12,0,TAU);x.arc(180,140,12,0,TAU);x.fill()}
      else{x.fillStyle='#C8D8FF';x.beginPath();x.arc(150,150,95,0,TAU);x.fill();x.stroke();x.fillStyle='#C8A870';x.beginPath();x.arc(185,125,85,0,TAU);x.fill();for(let i=0;i<5;i++){x.fillStyle='#FFFFFF';x.beginPath();x.arc(60+i*45,250-(i%2)*25,6,0,TAU);x.fill()}}});
    const img=pic.image;let tiles=[0,1,2,3,4,5,6,7,8];/* mischen durch gültige Züge (immer lösbar) */let empty=8;for(let k=0;k<80;k++){const nb=[empty-3,empty+3,empty%3?empty-1:-1,empty%3<2?empty+1:-1].filter(x=>x>=0&&x<9);const s2=nb[Math.floor(Math.random()*nb.length)];[tiles[empty],tiles[s2]]=[tiles[s2],tiles[empty]];empty=s2}
    const grid=el('div');grid.style.cssText='display:grid;grid-template-columns:repeat(3,96px);gap:6px;justify-content:center;padding:10px;background:linear-gradient(180deg,#B8A474,#8A7458);border-radius:18px;box-shadow:inset 0 3px 0 rgba(255,255,255,.3),inset 0 -4px 0 rgba(0,0,0,.2)';
    const moves=el('p','sub','Schiebe die Steinplatten, bis das Bild stimmt.');let n=0;
    function render(){grid.replaceChildren();tiles.forEach((tv,i)=>{const b=el('button');b.type='button';b.style.cssText='width:96px;height:96px;border:0;border-radius:12px;padding:0;transition:transform var(--spring-dur) var(--spring);box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 3px 0 rgba(0,0,0,.25)';
      if(tv===8){b.style.background='rgba(60,40,20,.35)';b.style.boxShadow='inset 0 3px 8px rgba(0,0,0,.35)'}else{b.style.backgroundImage='url('+img.toDataURL()+')';b.style.backgroundSize='300px 300px';b.style.backgroundPosition=(-(tv%3)*100-2)+'px '+(-Math.floor(tv/3)*100-2)+'px'}
      b.onclick=()=>{const e=tiles.indexOf(8);const ok=(Math.abs(e-i)===3)||(Math.abs(e-i)===1&&Math.floor(e/3)===Math.floor(i/3));if(!ok){MOTION.pop(b);SND.play('error',{vol:.4});return}[tiles[e],tiles[i]]=[tiles[i],tiles[e]];n++;SND.play('place',{rate:.8+Math.random()*.2});moves.textContent=n+' Züge';render();
        if(tiles.every((x,k)=>x===k)){st.solved[t.id]=true;persist();SND.jingle('j_success');setTimeout(()=>{w.close();reward(t,g)},500)}};grid.append(b)})}
    render();w.body.append(el('p',null,'Eine Steintafel mit verschobenen Platten. Das Bild zeigt den '+t.n+'.'),grid,moves)}
  function reward(t,g){const pool=RELICS.filter(x=>x.planet===ID);const rel=pool[TEMPLES.indexOf(t)%pool.length];money(600);
    if(g.userData.tab)g.userData.tab.visible=false;GAME.W.fx(GAME.me.p,'stern',20);if(rel&&bagAdd('relic',rel.id))UI.talk(t.n,['Die Tafel versinkt, und die Schatzkammer öffnet sich!','Du findest: '+rel.n+' und 600 Taler.']);else UI.talk(t.n,['Die Schatzkammer öffnet sich! 600 Taler.'])}
  function tick(dt,t,W,me){const h=GAMETIME.hour();if(lastH!=null&&lastH<6&&h>=6){S().nights++;persist();applyVines();UI.toast('Über Nacht sind die Lianen nachgewachsen.',2600)}lastH=h;
    for(const v of vines){if(v.g.visible&&v._grow!=null&&v._grow<1){v._grow=Math.min(1,v._grow+dt*.7);v.g.scale.set(1,v._grow,1)}const k=Math.sin(t*1.2+v.d.x*9)*.03;v.g.children.forEach(c=>{if(c.isMesh)c.rotation.z=k})}
    if(swingVine&&me){const top=swingVine.from.clone().add(swingVine.to).normalize().multiplyScalar(W.R+W.hAt(swingVine.from)+9);const hand=me.g.position.clone().addScaledVector(me.p,1.3);const L=top.distanceTo(hand);
      swingVine.line.position.copy(top).add(hand).multiplyScalar(.5);swingVine.line.scale.set(1,L,1);swingVine.line.quaternion.setFromUnitVectors(new V(0,1,0),top.clone().sub(hand).normalize())}}
  return{onLoad,tick}
})();
window.DSCHUNGEL=DSCHUNGEL;
})();
