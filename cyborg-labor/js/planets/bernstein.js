/* =====================================================================
   CYBORG-LABOR · planets/bernstein.js · Bernstein-Mond
   Ein honiggoldener Mond aus altem Harz: Harzkiefern mit leuchtenden
   Tropfen, Gel-Farne, Bernstein-Säulen und versteinerte Ammoniten am
   Strand. Die Häuser sind Harztropfen, Ammoniten und Baumstümpfe.
   Besonderheit:
   · Einschluss-Sammlung: acht grosse Bernsteinblöcke liegen auf dem Mond.
     In jedem steckt etwas aus der Urzeit (eine Mücke, ein Blatt, eine
     Feder ...). Mit der Lupe holt man sich ein Bild davon als Fundstück
     für das Museum. Wer alle acht hat, bekommt die Bernstein-Lampe.
   ===================================================================== */
(function(){
const ID='bernstein';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT,leafShape}=NH;
const V=THREE.Vector3;
const AMB=['#ffb43a','#ff9a2a','#ffd27a','#e8862a'];
const am=(m,c)=>m.c(c||'#ffb43a',{gloss:1.5,rim:1.3,rimColor:'#fff2c0'});
const amG=(m,c)=>m.c(c||'#ffb43a',{gloss:1.5,rim:1.4,rimColor:'#fff2c0',opacity:.62});

/* ================= Natur ================= */
N('harzkiefer',{r:.35,h:4.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.4,3.2);
  P(g,G.cy(.15,.22,h,12),m.c('#b8875a'),[0,h/2,0]);for(let i=0;i<3;i++)P(g,G.to(.17,.035),am(m,AMB[i]),[0,.5+i*.6,0],[PI/2,0,0]);
  const tiers=[[1.25,h*.62],[1.0,h*.62+.75],[.72,h*.62+1.38],[.42,h*.62+1.9]];const cols=['#3f9a6a','#4fae78','#62c088','#79d098'];
  tiers.forEach(([r,y],i)=>{P(g,G.s(r),m.c(cols[i]),[0,y,0],null,[1,.5,1]);const n=3+i%2;for(let k=0;k<n;k++){const a=k/n*TAU+i;P(g,G.s(.09),am(m,AMB[(k+i)%4]),[Math.cos(a)*r*.92,y-r*.22,Math.sin(a)*r*.92],null,[1,1.5,1])}});
  P(g,G.s(.16),am(m,'#ffd27a'),[0,h*.62+2.2,0],null,[1,1.3,1])});
N('bernsteinfarn',{r:.4,h:1.3,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const n=6+Math.floor(rnd()*3);for(let i=0;i<n;i++){const a=i/n*TAU+rnd()*.3;const L=RR(rnd,.7,1.1);
  const f=grp(g,[0,.05,0],[0,-a,0]);const w=P(f,new THREE.ShapeGeometry(leafShape(L,.22),6),m.dbl(i%2?'#7fc85a':'#ffc85a',{gloss:1.1,rim:1}),[0,0,0],[-PI/2+.7,0,0]);w.userData.noOutline=true}});
N('tropfenbusch',{r:.5,h:1,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.5,.08,3,rnd()*9),m.c('#5aa86a'),[0,.45,0],null,[1.2,.85,1]);
  for(let i=0;i<5;i++){const th=.4+rnd()*1,ph=rnd()*TAU;P(g,G.s(.1),am(m,AMB[i%4]),[Math.sin(th)*Math.cos(ph)*.6,.45+Math.cos(th)*.4,Math.sin(th)*Math.sin(ph)*.5],null,[1,1.3,1])}});
N('harzsaeule',{r:.6,h:2.2,size:'big',planet:ID},(g,m,o,rnd)=>{const n=3+Math.floor(rnd()*3);for(let i=0;i<n;i++){const h=RR(rnd,.8,2.2),a=rnd()*TAU,d=i?RR(rnd,.2,.45):0;
  const c=P(g,G.cy(.18,.26,h,6),amG(m,AMB[i%4]),[Math.cos(a)*d,h/2,Math.sin(a)*d],[(rnd()-.5)*.3,0,(rnd()-.5)*.3]);c.userData.noMerge=true;P(g,G.co(.18,.25,6),amG(m,AMB[i%4]),[Math.cos(a)*d,h+.12,Math.sin(a)*d]).userData.noMerge=true}
  P(g,G.cy(.1,.12,.5,6),am(m,'#ff9a2a'),[0,.3,0])});
N('ammonitfels',{r:.7,h:1.2,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.7,.12,3,rnd()*9),m.c('#d8c0a0'),[0,.4,0],null,[1.2,.7,1]);
  const q=grp(g,[0,.62,.45],[-.3,0,0]);const pts=[];for(let i=0;i<=40;i++){const t=i/40;const a=-t*TAU*2;const r=.42*Math.exp(-(1-t)*1.6);pts.push([Math.cos(a)*r,Math.sin(a)*r,0])}P(q,G.tu(pts,.04,.13,50),m.c('#f2dcc0',{gloss:.6}))});
N('goldgras',{r:.12,h:.5,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#c8d86a');for(let i=0;i<5;i++){const a=rnd()*TAU,h=RR(rnd,.25,.5);P(g,G.tu([[0,0,0],[Math.cos(a)*.08,h*.6,Math.sin(a)*.08],[Math.cos(a)*.14,h,Math.sin(a)*.14]],.025,.008,6),c)}});
N('bernsteinkiesel',{r:.15,h:.2,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<3;i++)P(g,G.s(.07+rnd()*.05),am(m,AMB[i%4]),[(rnd()-.5)*.3,.05,(rnd()-.5)*.3],null,[1.2,.7,1])});
Object.assign(NH.ROCK,{[ID]:['#d8c0a0','#c8a878','#ffb43a']});

/* ================= Biome ================= */
const BI={
  harzwald:{n:'Harzwald',g:['#8cc070','#80b464'],cliff:'#b8875a',pat:'moos',grass:'#88bc6c',grassD:1,trees:[['harzkiefer',3]],treeD:1.4,
    deco:[['bernsteinfarn',3],['tropfenbusch',2],['goldgras',2]],decoD:5,rocks:[['harzsaeule',.4]],rockD:.3,litter:[['harztropfen',1],['zapfen_klein',.6]]},
  farnlichtung:{n:'Farnlichtung',g:['#a8d080','#9cc474'],cliff:'#c8a070',pat:'gras',grass:'#a0cc78',grassD:.9,trees:[['harzkiefer',.8]],treeD:.5,
    deco:[['bernsteinfarn',5],['goldgras',4],['tropfenbusch',1]],decoD:6,rocks:[['harzsaeule',.3],['ammonitfels',.2]],rockD:.3,litter:[['harztropfen',.8]]},
  bernsteinbruch:{n:'Bernsteinbruch',g:['#eed8b0','#e4cca0'],cliff:'#c8955a',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['bernsteinkiesel',3],['goldgras',1]],decoD:2,rocks:[['harzsaeule',1.6],['ammonitfels',.4]],rockD:1,litter:[['harztropfen',1.4],['bernsteinsplitter',1]]},
  fossilstrand:{n:'Fossilstrand',g:['#f2dcb0','#e8d0a4'],cliff:'#c8b090',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['bernsteinkiesel',2]],decoD:2,rocks:[['ammonitfels',1.4]],rockD:.6,litter:[['bernsteinsplitter',1],['muschel',1]]},
  goldduenen:{n:'Golddünen',g:['#f6e6b8','#f0dcaa'],cliff:'#d8a860',pat:'sand',grass:'#d8c870',grassD:.3,trees:[['harzkiefer',.2]],treeD:.15,
    deco:[['goldgras',3]],decoD:2,rocks:[['harzsaeule',.6]],rockD:.4,litter:[['bernsteinsplitter',.8]]}};

/* ================= Sammelsachen ================= */
IT('harztropfen',itMeta('Harztropfen','bernstein','material',35),(g,m)=>P(g,G.s(.12),am(m),[0,.12,0],null,[1,1.3,1]));
IT('bernsteinsplitter',itMeta('Bernsteinsplitter','bernstein','material',70),(g,m)=>{P(g,G.cy(.08,.12,.2,6),am(m,'#ff9a2a'),[0,.1,0],[.3,0,.2])});
IT('zapfen_klein',itMeta('Kleiner Zapfen','bernstein','material',20),(g,m)=>{P(g,G.s(.1),m.c('#a8774a'),[0,.12,0],null,[1,1.5,1]);for(let i=0;i<3;i++)P(g,G.to(.09-i*.02,.02),m.c('#8a5a30'),[0,.06+i*.06,0],[PI/2,0,0])});

/* ================= Fische ================= */
F('goldstoer',fishMeta('Gold-Stör','bernstein','meer','L','nacht',3,1600,'Ich hab einen Gold-Stör gefangen! Auf seinem Rücken sitzen Knochenplatten wie kleine Schilde.','Störe gibt es schon seit über 200 Millionen Jahren. Sie haben statt Schuppen Reihen von harten Knochenplatten.'),
  (g,m)=>{fishT(g,m,{id:'goldstoer',H:.24,L:1.15,back:'#a8885a',belly:'#fff2c0',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#fff2c0';for(let i=0;i<10;i++){x.beginPath();x.moveTo(i*w/10,h*.25);x.lineTo(i*w/10+8,h*.15);x.lineTo(i*w/10+16,h*.25);x.fill()}}});P(g,G.co(.05,.22,8),m.c('#a8885a'),[0,-.02,.62],[PI/2,0,0])});
F('perlboot',fishMeta('Perlboot','bernstein','meer','M','immer',2,640,'Ich hab ein Perlboot gefangen! Es wohnt in einem gestreiften Spiralhaus.','Das Perlboot ist mit den Ammoniten verwandt. Es regelt mit Gas in seinen Kammern, ob es steigt oder sinkt – wie ein U-Boot.'),
  (g,m)=>{const pts=[];for(let i=0;i<=30;i++){const t=i/30;const a=-t*TAU*1.6;const r=.26*Math.exp(-(1-t)*1.4);pts.push([0,Math.sin(a)*r+.05,Math.cos(a)*r])}P(g,G.tu(pts,.03,.13,40),m.c('#fff3e0',{gloss:.9}));
    for(let i=0;i<5;i++)P(g,G.bx(.27,.025,.06,.01),m.c('#c8703e'),[0,.05+Math.sin(i)*.15,Math.cos(i)*.15],[i,0,0]);for(let i=0;i<6;i++)P(g,G.cy(.012,.008,.2),m.c('#f2c8a0'),[(i-2.5)*.03,-.08,-.25],[PI/2+.3,0,0]);eye(g,m,[.1,0,-.15],.03,[.6,.3,-.6]);eye(g,m,[-.1,0,-.15],.03,[-.6,.3,-.6])});
F('goldbrasse',fishMeta('Goldbrasse','bernstein','teich','M','tag',1,260,'Ich hab eine Goldbrasse gefangen! Sie glänzt wie Honig.','Goldbrassen haben einen goldenen Streifen zwischen den Augen. Daher kommt ihr Name.'),
  (g,m)=>fishT(g,m,{id:'goldbrasse',H:.3,L:.7,back:'#c8a060',belly:'#fff2c0',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ffd23f';x.fillRect(w*.75,0,10,h)}}));

/* ================= Insekten ================= */
B('urlibelle',bugMeta('Urlibelle','bernstein','luft','tag',3,1200,'Ich hab eine Urlibelle gefangen! Ihre Flügel sind so breit wie meine Hand.','Vor 300 Millionen Jahren lebte die Riesenlibelle Meganeura. Ihre Flügel waren so breit wie ein ausgestreckter Arm.'),
  (g,m)=>{const bm=m.c('#2fb5d9',{gloss:1.2});P(g,G.ca(.04,.7),bm,[0,.25,-.1],[PI/2,0,0]);P(g,G.s(.09),bm,[0,.25,.32]);bugFace(g,m,[0,.26,.38],.07,.5);
    for(const s of[-1,1])for(const z of[.12,.0]){const w=P(g,G.s(.3),m.c('#d8f6ff',{opacity:.5,gloss:1.4}),[s*.34,.27,z],null,[1.2,.04,.28]);w.userData.noOutline=true}});
B('bernsteinmuecke',bugMeta('Bernsteinmücke','bernstein','luft','nacht',1,180,'Ich hab eine Bernsteinmücke gefangen! Sie summt ganz leise.','Im Bernstein findet man oft winzige Mücken. Das Harz hat sie vor Millionen Jahren eingeschlossen und bis heute erhalten.'),
  (g,m)=>{const bm=m.c('#8a5a30');P(g,G.ca(.04,.18),bm,[0,.2,0],[PI/2,0,0]);P(g,G.s(.05),bm,[0,.2,.12]);for(const s of[-1,1])P(g,G.s(.12),m.c('#fff2c0',{opacity:.5}),[s*.1,.24,0],null,[1,.05,.4]).userData.noOutline=true;legs(g,bm,[[.05,.18,.04],[0,.18,0],[-.05,.18,-.04]],.18)});
B('goldkaefer',bugMeta('Goldkäfer','bernstein','boden','immer',2,420,'Ich hab einen Goldkäfer gefangen! Er glänzt wie ein Bernstein.','Manche Käfer schimmern golden, obwohl kein Gold in ihnen ist. Winzige Schichten in ihrem Panzer werfen das Licht zurück.'),
  (g,m)=>{P(g,G.s(.2),am(m,'#ffc83a'),[0,.18,0],null,[1,.7,1.2]);P(g,G.s(.1),m.c('#5a3a1a'),[0,.17,.22]);bugFace(g,m,[0,.18,.3],.07,.5);legs(g,m.c('#5a3a1a'),[[.1,.12,.1],[0,.12,0],[-.1,.12,-.1]],.2)});

/* ================= Einschlüsse (Fundstücke) ================= */
const INC=[['muecke','Mücke im Bernstein','Eine winzige Mücke, seit Millionen Jahren im Harz.','Bernstein ist versteinertes Baumharz. Das Harz floss über kleine Tiere und hielt sie für immer fest.'],
  ['blatt','Blatt im Bernstein','Ein Blatt mit allen Adern, wie gestern gefallen.','Aus Blättern im Bernstein können Forscher erkennen, welche Bäume vor Millionen Jahren wuchsen.'],
  ['feder','Feder im Bernstein','Eine kleine flauschige Feder.','In Bernstein aus Myanmar fand man Federn von kleinen Dinosauriern. Viele Dinos hatten also Federn.'],
  ['ameise','Ameise im Bernstein','Eine Ameise, die gerade etwas trug.','Ameisen gab es schon zur Zeit der Dinosaurier. Im Bernstein sind sie besonders häufig.'],
  ['schnecke','Schneckenhaus im Bernstein','Ein Schneckenhaus, kleiner als ein Reiskorn.','Auch Landschnecken krochen über Baumrinde und blieben manchmal im Harz kleben.'],
  ['samen','Samen im Bernstein','Ein Samenkorn mit kleinen Flügeln.','Manche Samen haben Flügel und drehen sich im Wind wie ein Hubschrauber. So fliegen sie weit vom Baum weg.'],
  ['blase','Luftblase im Bernstein','Eine runde Luftblase – Luft aus der Urzeit.','Kleine Luftblasen im Bernstein enthalten Luft, die Millionen Jahre alt ist.'],
  ['dino','Spielzeug-Dino im Bernstein','Ein kleiner Plastik-Dino. Wie ist der da reingekommen?','Echte Dinosaurier sind nie im Bernstein gefunden worden, nur Teile davon. Dieser hier ist eindeutig ein Spielzeug von 1999.']];
function incModel(g,m,k){const c=m.c('#5a3a1a');if(k==='muecke'){P(g,G.ca(.02,.1),c,[0,0,0],[PI/2,0,0]);for(const s of[-1,1])P(g,G.s(.06),m.c('#fff',{opacity:.6}),[s*.05,.02,0],null,[1,.1,.4])}
  else if(k==='blatt'){P(g,new THREE.ShapeGeometry(leafShape(.3,.12),6),m.dbl('#4a6a1a'),[-.15,0,0],[0,0,0])}
  else if(k==='feder'){P(g,G.tu([[0,-.15,0],[.02,0,0],[0,.15,0]],.01,.005),m.c('#fff6e0'));for(let i=0;i<8;i++)P(g,G.bx(.12,.01,.01,0),m.c('#fff6e0'),[0,-.1+i*.03,0],[0,0,.3])}
  else if(k==='ameise'){for(let i=0;i<3;i++)P(g,G.s(.03+i*.005),c,[0,0,(i-1)*.06])}
  else if(k==='schnecke'){const pts=[];for(let i=0;i<=20;i++){const t=i/20,a=t*TAU*1.5,r=.06*t+.01;pts.push([Math.cos(a)*r,Math.sin(a)*r,0])}P(g,G.tu(pts,.01,.03,24),m.c('#c8a070'))}
  else if(k==='samen'){P(g,G.s(.04),c);P(g,G.s(.08),m.c('#c8a070',{opacity:.7}),[.08,0,0],null,[1.4,.1,.5])}
  else if(k==='blase'){P(g,G.s(.08),m.c('#fffdf7',{opacity:.5,gloss:1.4}))}
  else{P(g,G.s(.06),m.c('#7fd34a'),[0,0,0],null,[1.3,1,1]);P(g,G.s(.04),m.c('#7fd34a'),[.07,.04,0]);P(g,G.co(.03,.08,6),m.c('#7fd34a'),[-.09,0,0],[0,0,PI/2])}}
for(const[k,n,lore,fact]of INC)REL('einschluss_'+k,relMeta(n,'bernstein','schatz',2,700,lore,fact),(g,m)=>{P(g,G.cy(.22,.26,.24,6),m.c('#ffb43a',{opacity:.6,gloss:1.5,rim:1.3,rimColor:'#fff2c0'}),[0,.12,0]);const q=grp(g,[0,.12,0]);incModel(q,m,k)});
REL('urzeit_spielzeug',relMeta('Urzeit-Spielzeug','bernstein','kunst',2,900,'Ein Holzkreisel, ganz von Harz überzogen.','Kreisel gehören zu den ältesten Spielzeugen der Welt. Man fand welche, die über 5000 Jahre alt sind.'),
  (g,m)=>{P(g,G.co(.2,.3,12),am(m),[0,.2,0],[PI,0,0]);P(g,G.cy(.03,.03,.2),m.c('#a8774a'),[0,.42,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  harzhoernchen:{n:'Harzhörnchen',planet:ID,biomes:['harzwald','farnlichtung'],count:4,size:.65,speed:1.5,gait:'hop',shy:true,voice:['tschik','tschirr','tik'],pitch:720,likes:['zapfen_klein','harztropfen'],product:'zapfen_klein',names:['Zapfi','Harzi','Bernie','Flitz','Nuss'],
    fact:'Eichhörnchen vergraben im Herbst tausende Nüsse. Viele finden sie nie wieder – und aus denen wachsen neue Bäume.',a:{col:'#e8862a',belly:'#fff2c0',body:[.26,.26,.34],head:{r:.22,p:[0,.48,.26]},snout:{type:'muzzle',col:'#fff2c0',nose:'#5a3a1a'},ears:{type:'pointy',len:.4},legs:{n:4,len:.1,r:.06,foot:'#c86a1a'},tail:{type:'bushy',col:'#ffb43a'},gait:'hop'}},
  urvogel:{n:'Urvogel',planet:ID,biomes:['farnlichtung','goldduenen','fossilstrand'],count:3,size:.75,speed:1.1,gait:'waddle',voice:['krah','kruu','kik'],pitch:420,likes:['bernsteinmuecke','harztropfen'],product:'harztropfen',names:['Archie','Federchen','Krall','Urmel','Pteri'],
    fact:'Der Archaeopteryx lebte vor 150 Millionen Jahren. Er hatte Federn wie ein Vogel, aber Zähne und einen langen Schwanz wie ein Dinosaurier.',a:{col:'#5aa86a',belly:'#fff2c0',body:[.3,.3,.4],by:.32,head:{r:.2,p:[0,.7,.32]},snout:{type:'beak',col:'#ffb43a'},ears:{type:'none'},legs:{n:2,len:.22,r:.05,foot:'#e8862a'},tail:{type:'fan',col:'#2fb5d9'},wings:{col:'#2fb5d9'},tuft:'#ff9a2a'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','forscherhut','Forscher-Hut',520,'#e8d0a4',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.82),M.c(col),[0,0,0]);P(q,G.cy(r*1.25,r*1.25,r*.05),M.c(col),[0,0,0]);P(q,G.cy(r*.84,r*.84,r*.14),M.c('#a8774a'),[0,r*.08,0]);P(q,G.s(r*.1),M.c('#ffb43a',{gloss:1.4}),[r*.8,r*.08,0])});
def('top','harzweste','Harz-Weste',820,'#c8955a',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);for(const s of[-1,1])P(q,G.bx(r*.22,r*.2,r*.05,r*.03),M.c('#a8774a'),[s*r*.4,-r*.6,r*.82])});

/* ================= Möbel ================= */
furn('bernsteinlampe',{n:'Bernstein-Lampe',cat:'licht',price:2200,planet:ID,size:[1,1],h:1.3,b:(g,m)=>{P(g,G.cy(.22,.28,.12),m.c('#a8774a'),[0,.06,0]);const s=P(g,G.s(.42),m.c('#ffb43a',{opacity:.7,gloss:1.5,rim:1.3,rimColor:'#fff2c0'}),[0,.62,0],null,[1,1.25,1]);s.userData.noMerge=true;
  const q=grp(g,[0,.62,0]);incModel(q,m,'dino');q.scale.setScalar(2);g.userData.light={p:[0,.7,0],c:'#ffc870',i:.9}}});
furn('fossilregal',{n:'Fossil-Regal',cat:'deko',price:1300,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{for(let i=0;i<3;i++)P(g,G.bx(.9,.06,.35,.02),m.c('#c8955a'),[0,.3+i*.5,0]);for(const x of[-.43,.43])P(g,G.bx(.05,1.5,.35,.02),m.c('#a8774a'),[x,.75,0]);
  P(g,G.cy(.14,.14,.06,16),m.c('#f2dcc0'),[-.2,.47,0],[PI/2,0,0]);P(g,G.cy(.12,.14,.18,6),am(m),[.2,.42,0]);P(g,G.s(.1),m.c('#fff6e0'),[0,.9,0],null,[1.5,.6,1])}});

/* ================= Sprache: Harzschrift ================= */
function harzGlyph(x,s,r){x.save();x.lineWidth=s*.08;x.lineCap='round';const n=1+Math.floor(r()*2);for(let i=0;i<n;i++){x.beginPath();const cx=(r()-.5)*s*.3,cy=(r()-.5)*s*.3;for(let k=0;k<=24;k++){const t=k/24,a=t*TAU*1.3,rr=s*.04+t*s*.22;const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;k?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}
  if(r()<.6){x.beginPath();x.arc(0,s*.3,s*.06,0,TAU);x.fill()}x.restore()}

/* ================= Mond ================= */
PLANETKIT.add(ID,{
  def:{n:'Bernstein-Mond',base:'kompost',R:100,R0:36,sea:-.3,music:'town',sky:['#f2c27a','#fff0c8'],fog:'#f6e0b0',water:'#e8a040',deep:'#a8601a',step:1.0,shop:ID,
    desc:'Honiggoldener Mond aus uraltem Harz: Harzkiefern, Gel-Farne und Bernsteinsäulen. In acht Bernsteinblöcken stecken Schätze aus der Urzeit.',weather:'blueten',orbit:[187,4.4],size:.8,col:['#ffb43a','#8cc070'],moons:0,
    park:'farnlichtung',parkPond:true,phone:['#fff2c0','#ffd0a0'],stones:['kiesel','harztropfen','stein_klein'],plazaTree:'harzkiefer',path:'#e8b878',
    space:{deep:'#a8601a',water:'#e8a040',shore:'#f2dcb0',land:'#8cc070',land2:'#a8d080',high:'#e8c890',cap:'#ffe0a8',atmo:'#ffb43a',cloud:.3,sea:.34,capA:.3,freq:2.6},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'goldduenen',wet:'fossilstrand',cold:'bernsteinbruch'},peak:'bernsteinbruch',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.2,4)*2.2+.6;const k=N2(q.x*.9,q.y*.9,q.z*.9);/* Harzflüsse: weiche Rinnen */h-=Math.max(0,.15-Math.abs(k))*4;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'fossilstrand';if(h>sea+4.2)return'bernsteinbruch';if(T>.3)return'goldduenen';if(M>.2)return'harzwald';return'farnlichtung'},
    onLoad:W=>INCL.onLoad(W),tick:(dt,t,W,me)=>INCL.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Harzplatz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Honigteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Goldsee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Harz-Spielhalle',mode:'Fossil-Mode',praxis:'Harz-Praxis',museum:'Bernstein-Museum',shop:'Tropfenladen',studio:'Lupen-Atelier',bar:'Honig-Bar',rathaus:'Ammoniten-Rathaus',garage:'Harz-Garage',pflanzen:'Farn-Gärtnerei',tiere:'Urzeit-Tierladen'},
  sty:{wall:'putz',walls:['#fff6e6','#fff2dc','#fbf7f0'],roof:'dome',roofs:AMB,trim:'#fff2c0',plinth:'#a8774a',door:'#e8862a',win:'rund',pitch:.9},
  wall:'streifen',floor:'parkett',
  mayor:['Bürgermeisterin Lupe',{skin:'bonbon',color:4,shape:'ei'},{kopf:'eule',augen:'mensch',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen auf dem Bernstein-Mond! Hier fliesst das Harz so langsam, dass man es nur alle hundert Jahre sieht.','In acht grossen Bernsteinblöcken stecken Schätze aus der Urzeit. Nimm die Lupe und schau genau hin.','Alles Licht hier ist golden. Darum sehen auch die Bewohner immer ein bisschen nach Abendsonne aus.'],
  caveRock:['#d8c0a0','#c8a878','#a8774a',['#ffb43a','#ff9a2a','#ffd27a']],
  wear:['forscherhut','harzweste','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_yellowA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'tropfen'},{fam:'kokon',style:'harzstumpf'},{fam:'kokon',style:'ammonit'},{fam:'kokon',style:'tropfen'}]},
  residents:{skins:['bonbon','fell','plastik','glas'],heads:['eule','vogel','frosch','katze','mensch','kapselkopf','eikopf'],names:['Harzi','Bernie','Goldi','Lupe','Ammi','Tropfen','Fossi','Honig','Urmel','Kiefer','Sonni','Bern'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fff6e6','#fff2dc','#fbf7f0'],roofCols:AMB,win:['rund']},deco:['bernsteinfarn','tropfenbusch','harzkiefer'],fence:false},
  lang:{n:'Harzschrift',ink:'#8a4a12',glow:'#ffb43a',kind:'runes',draw:harzGlyph,syl:['har','bo','ra','ku','sen','li','am','mo','ni','te','ur','za']},ruinStone:'#c8a878',
  terraform:['farnlichtung','harzwald','fossilstrand','goldduenen'],
  weather:[['klar',4],['heiter',3],['nebel',1],['regen',1]]});

/* ================= Einschluss-Sammlung ================= */
const INCL=(()=>{let W_=null,blocks=[];const COUNT=INC.length;
  const S=()=>SAVE.incl=SAVE.incl||{got:[]};
  function blockModel(m,i){const g=new THREE.Group();const k=INC[i][0];P(g,G.blob(.55,.05,3,i*3+1),m.c('#d8c0a0'),[0,.15,0],null,[1.4,.4,1.2]);
    const col=AMB[i%4];const b=P(g,G.cy(.62,.7,1.1,7),m.c(col,{opacity:.42,gloss:1.5,rim:1.6,rimColor:'#fff2c0'}),[0,.7,0],[0,i,0]);b.userData.noMerge=true;
    const t=P(g,G.co(.62,.5,7),m.c(col,{opacity:.42,gloss:1.5,rim:1.6,rimColor:'#fff2c0'}),[0,1.5,0],[0,i,0]);t.userData.noMerge=true;
    P(g,G.to(.68,.04,TAU),m.glow('#ffe0a0',1.3),[0,.2,0],[PI/2,0,0]).userData.noOutline=true;
    const q=grp(g,[0,.85,0]);incModel(q,m,k);q.scale.setScalar(4.2);addOutlines(g);g.userData.q=q;return g}
  function onLoad(W){W_=W;blocks=[];const m=makeMats({skin:'plastik',color:0});const st=S();const r=srand(1999);
    for(let i=0;i<COUNT;i++){let d=null;for(let t=0;t<400&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.93||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(blocks.some(x=>angle(x.d,cd)*W.R<22))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;d=cd}
      if(!d)continue;const g=blockModel(m,i);GAME.placeObj(g,d,r()*TAU,0,true);const done=st.got.includes(i);const it={kind:'einschluss',p:d,r:2,label:done?'Bernsteinblock ansehen':'Mit der Lupe hineinschauen',act:()=>look(i)};W.inter.push(it);blocks.push({i,d,g,it})}}
  async function look(i){const st=S();const[k,n,lore]=INC[i];if(st.got.includes(i)){UI.toast(n+': '+lore,2600);return}
    if(!bagAdd('relic','einschluss_'+k)){UI.toast('Deine Tasche ist voll. Mach erst Platz.',2400);return}
    st.got.push(i);const t=blocks.find(x=>x.i===i);if(t)t.it.label='Bernsteinblock ansehen';persist();SND.play('pickup',{rate:.9});const c=st.got.length;
    UI.toast('Einschluss '+c+' von '+COUNT+': '+n+'. Das Bild ist jetzt in deiner Tasche, das Museum freut sich darüber.',3600);
    if(typeof PIKO!=='undefined'&&c===1)PIKO.want('Etwas steckt im Bernstein! Auf dem Mond gibt es noch sieben weitere Blöcke.');
    if(c===COUNT&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Bürgermeisterin Lupe',['Alle acht Einschlüsse! So genau hat noch niemand hingeschaut.','Hier ist die Bernstein-Lampe. Und zur Erinnerung ein kleines Stück Urzeit-Spielzeug.']);bagAdd('furn','bernsteinlampe');bagAdd('relic','urzeit_spielzeug');money(400);SND.jingle('j_success')},900)}}
  /* der Einschluss dreht sich langsam im Block */
  function tick(dt,t){for(const b of blocks){if(b.g)b.g.userData.q.rotation.y=t*.4+b.i}}
  return{onLoad,tick,blocks:()=>blocks,COUNT}
})();
window.INCL=INCL;
})();
