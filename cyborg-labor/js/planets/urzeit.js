/* =====================================================================
   CYBORG-LABOR · planets/urzeit.js · Urzeit-Tal
   Farnwälder, Schachtelhalm-Sümpfe, Bernsteinstrände und fünf freundliche
   Vulkane. Dinos (Quaternius, CC0) grasen in Herden. Besonderheiten:
   · Dino-Nester: ein Ei mitnehmen, es schlüpft nach einer Weile, das Baby
     läuft dir überallhin nach.
   · Zeitriss: nachts öffnet sich am Vulkan ein leuchtender Riss. Wer
     hindurchgeht, erlebt kurz die Urzeit: Meteoritenschauer, Riesen-
     Brontosaurus, glühende Fossilien zum Ausgraben.
   ===================================================================== */
(function(){
const ID='urzeit';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,ROCK,RR,RP,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,spiralShell,markGlow,fishT,FT,stoneM}=NH;
const V=THREE.Vector3;
/* Vulkane (Richtungen) – weit weg vom Dorf am Nordpol */
const VOLC=[[18,40,1],[-8,160,.85],[6,262,1.1],[-42,318,.9],[-66,96,.8]].map(([la,lo,s])=>({d:dirLL(la,lo),s}));
const volcNear=p=>{let best=9;for(const v of VOLC)best=Math.min(best,angle(p,v.d)/v.s);return best};

/* ================= Natur ================= */
const FERN='#6CBF5A',FERN2='#4FA257',BARK='#8A5E42';
function frond(g,m,L,col,droop,n){const lm=m.c(col,{rim:.55,rimColor:'#eaffb0'});const pts=range(9,t=>[t*L,Math.sin(t*PI*.8)*.35*L-t*t*droop*L,0]);P(g,G.tu(pts,.03*L,.01),lm);
  range(n||8,(t,j)=>{const pp=pts[1+Math.min(7,Math.floor(t*8))];both(s=>P(g,flatLeaf(leafShape(.26*L*(1-t*.55),.07*L),.012,.2),lm,[pp[0],pp[1]+.01,0],[0,s*1.2,-.2]))})}
N('baumfarn',{r:.45,h:3.2,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3.2);const bm=m.c(BARK,{rim:.4});
  P(g,G.tu([[0,0,0],[.08,h*.5,.04],[0,h,0]],.2,.14),bm);range(9,(t,i)=>P(g,G.s(.09),m.c(shade(BARK,.8)),[Math.cos(i*2.2)*.17,t*h*.95,Math.sin(i*2.2)*.17]));
  P(g,G.s(.2),m.c('#8FD06B'),[0,h+.02,0],null,[1,.6,1]);for(let i=0;i<9;i++){const q=grp(g,[0,h,0],[0,i/9*TAU+rnd()*.3,.3]);frond(q,m,RR(rnd,1.4,1.9),i%2?FERN:FERN2,.55)}
  /* eingerollte junge Wedel */range(3,(t,i)=>{const a=i*2.1;P(g,G.to(.08,.03),m.c('#9EDB7A'),[Math.cos(a)*.18,h+.18,Math.sin(a)*.18],[PI/2,0,a])})});
N('palmfarn',{r:.5,h:1.5,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const tm=m.c('#A87A52',{rim:.4});const h=RR(rnd,.6,.9);
  P(g,G.la([[0,0],[.34,0],[.36,h*.4],[.28,h],[0,h]],Q(12)),tm);range(14,(t,i)=>P(g,G.s(.08),m.c('#8A5E42'),[Math.cos(i*1.7)*(.34-t*.08),t*h,Math.sin(i*1.7)*(.34-t*.08)],null,[1,.5,1]));
  for(let i=0;i<11;i++){const q=grp(g,[0,h,0],[0,i/11*TAU,-.35-rnd()*.2]);frond(q,m,RR(rnd,.9,1.2),'#5FB06A',.15,10)}
  P(g,G.co(.16,.4),m.c('#F2A83A',{rim:.6}),[0,h+.22,0]);range(6,(t,i)=>P(g,G.s(.05),m.c('#FFCB6A'),[Math.cos(i)*.1,h+.14+t*.2,Math.sin(i)*.1]))});
N('schachtelhalm',{r:.35,h:1.4,size:'small',planet:ID},(g,m,o,rnd)=>{const sm=m.c('#7CC46A',{rim:.6,rimColor:'#f4ffc8'}),rm=m.c('#3E6E48');
  for(let i=0;i<6;i++){const a=i*2.4+rnd(),rr=.05+rnd()*.2;const x=Math.cos(a)*rr,z=Math.sin(a)*rr,h=.8+rnd()*.7;const lean=RR(rnd,-.12,.12);
    P(g,G.tu([[x,0,z],[x+lean*.5,h*.5,z],[x+lean,h,z]],.035,.028),sm);const segs=Math.floor(h/.18);
    for(let k=1;k<segs;k++){const t=k/segs;const px=x+lean*t,py=h*t;P(g,G.to(.04,.012),rm,[px,py,z],[PI/2,0,0]);if(k>1&&k<segs-1)range(6,(u,j)=>{const b=j/6*TAU;P(g,G.cy(.006,.004,.18),sm,[px+Math.cos(b)*.09,py+.03,z+Math.sin(b)*.09],[Math.sin(b)*1.1,0,-Math.cos(b)*1.1])})}
    if(rnd()<.45)P(g,G.ca(.045,.1),m.c('#B8875A'),[x+lean,h+.07,z])}});
N('lavafels',{r:.8,h:1.1,size:'big',planet:ID},(g,m,o,rnd)=>{const sd=rnd()*9;P(g,G.blob(.85,.16,2,sd),m.c('#7A6E8A',{rim:.4}),[0,.55,0],[0,rnd()*3,0],[1.1,.75,1]);
  P(g,G.blob(.4,.14,2.4,sd+2),m.c('#6A5E7A'),[.6,.25,.3]);for(let i=0;i<5;i++){const a=rnd()*TAU,y=.3+rnd()*.6;markGlow(g,P(g,G.bx(.05,.3+rnd()*.3,.04,.02),m.glow('#FF9A4A',1.6),[Math.cos(a)*.8,y,Math.sin(a)*.8],[rnd(),a,rnd()*.6]))}});
N('knochenbogen',{r:.6,h:2.6,size:'big',planet:ID,cols:[[-1.3,0,.35],[1.3,0,.35]]},(g,m,o,rnd)=>{const bm=m.c('#F6ECD6',{rim:.6});for(let i=0;i<3;i++){const z=(i-1)*.7;both(s=>P(g,G.tu([[s*1.3,0,z],[s*1.5,1.3,z],[s*.8,2.4,z],[s*.08,2.6,z]],.1,.07),bm))}
  P(g,G.tu([[0,2.62,-1],[0,2.66,0],[0,2.62,1]],.13,.13),bm);range(4,(t,i)=>P(g,G.s(.12),bm,[0,2.68,-.9+i*.6]))});
N('dinofussspur',{r:.3,h:.03,decal:true,size:'tiny',planet:ID},(g,m,o,rnd)=>{const dm=m.c('#8E7A68');for(let k=0;k<2;k++){const q=grp(g,[k*.5-.25,.015,k*.6-.3],[0,.3,0]);P(q,G.cy(.14,.14,.02),dm,[0,0,0]);range(3,(t,i)=>P(q,G.cy(.06,.06,.02),dm,[(i-1)*.12,0,.2]))}});
N('riesenschachtelhalm',{r:.35,h:4.2,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const sm=m.c('#6FB860',{rim:.5}),rm=m.c('#3E6E48');const h=RR(rnd,3.2,4.2);P(g,G.tu([[0,0,0],[.1,h*.5,0],[0,h,0]],.16,.12),sm);
  for(let k=1;k<9;k++){const y=h*k/9;P(g,G.to(.17,.03),rm,[.02,y,0],[PI/2,0,0]);range(10,(u,j)=>{const b=j/10*TAU;P(g,G.cy(.012,.006,.6),sm,[Math.cos(b)*.35,y+.08,Math.sin(b)*.35],[Math.sin(b)*1.2,0,-Math.cos(b)*1.2])})}P(g,G.ca(.14,.3),m.c('#B8875A'),[0,h+.2,0])});
Object.assign(ROCK,{[ID]:['#B8A89A','#9A8C84','#8FD06B']});

/* ================= Biome ================= */
const BI={
  farnwald:{n:'Farnwald',g:['#7CC46A','#62AE58'],cliff:'#9A7A62',pat:'gras',grass:'#78C466',grassD:1,
    trees:[['baumfarn',4],['riesenschachtelhalm',1.5],['palmfarn',1.5]],treeD:1.6,deco:[['farn',8,{color:'#5FB06A'}],['farn',4,{color:'#8FD06B'}],['moospolster',2],['schachtelhalm',2]],decoD:7,
    rocks:[['findling',.5],['stein',1]],rockD:.4,litter:[['farnwedel',3],['ast',1]]},
  urwiese:{n:'Urwiese',g:['#B8D878','#A6CA68'],cliff:'#A88A6A',pat:'gras',grass:'#B0D270',grassD:.8,
    trees:[['palmfarn',2],['baumfarn',.6]],treeD:.3,deco:[['farn',3,{color:'#9CCB5A'}],['grasbuesche',3],['dinofussspur',1.2],['knochenbogen',.12]],decoD:4,
    rocks:[['findling',.5],['kiesel',1]],rockD:.4,litter:[['farnwedel',2],['dinofeder',.4]]},
  schachtelhalmsumpf:{n:'Schachtelhalm-Sumpf',g:['#7AB88A','#66A878'],cliff:'#7A6A58',pat:'moos',grass:'#78B888',grassD:.7,
    trees:[['riesenschachtelhalm',3],['baumfarn',1]],treeD:1.2,deco:[['schachtelhalm',8],['farn',2,{color:'#4FA257'}],['pfuetze',2],['schilf',1]],decoD:7,
    rocks:[['stein',1]],rockD:.3,litter:[['farnwedel',1]]},
  vulkanhang:{n:'Vulkanhang',g:['#A898B0','#958AA4'],cliff:'#6E627E',pat:'staub',grass:null,grassD:0,
    trees:[['palmfarn',.3]],treeD:.1,deco:[['lavafels',1],['kiesel',3],['knochenbogen',.1]],decoD:1.6,rocks:[['lavafels',1.5],['findling',.4]],rockD:.8,litter:[['lavastein',3]]},
  aschefeld:{n:'Aschefeld',g:['#C8BCD0','#B8ACC4'],cliff:'#7A6E8A',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,deco:[['kiesel',3],['lavafels',.5]],decoD:1.5,rocks:[['lavafels',1]],rockD:.6,litter:[['lavastein',2]]},
  bernsteinstrand:{n:'Bernsteinstrand',g:['#F6D8A0','#EFC98A'],cliff:'#C49366',pat:'sand',grass:null,grassD:0,trees:[['palmfarn',.6]],treeD:.2,deco:[['kiesel',2],['treibholz',.6],['dinofussspur',1]],decoD:2,
    rocks:[['stein',.6]],rockD:.2,litter:[['bernsteinbrocken',1.2],['ast',1]]}};

/* ================= Sammelsachen ================= */
IT('farnwedel',itMeta('Farnwedel','urzeit','material',20),(g,m)=>{const q=grp(g,[0,.03,0],[-PI/2+.15,0,0]);frond(q,m,.9,FERN,.1,9)});
IT('lavastein',itMeta('Lavastein','urzeit','material',60),(g,m)=>{P(g,G.blob(.26,.2,2.4,3),m.c('#6E627E',{rim:.4}),[0,.2,0],null,[1.2,.8,1]);range(4,(t,i)=>P(g,G.s(.05),m.glow('#FF9A4A',1.4),[Math.cos(i*1.6)*.22,.22+(i%2)*.08,Math.sin(i*1.6)*.22]))});
IT('bernsteinbrocken',itMeta('Bernsteinbrocken','urzeit','material',180),(g,m)=>{P(g,G.blob(.24,.15,2.2,5),m.c('#F2A83A',{gloss:1.4,rim:.9,rimColor:'#fff1b0',opacity:.9}),[0,.22,0],null,[1.1,.9,.9]);P(g,G.s(.05),m.c('#8A5E42'),[.03,.22,.05])});
IT('dinofeder',itMeta('Dinofeder','urzeit','material',140),(g,m)=>{const q=grp(g,[0,.04,0],[-PI/2+.1,0,.3]);P(q,G.tu([[0,-.35,0],[0,.35,0]],.015,.008),m.c('#F6ECD6'));P(q,flatLeaf(leafShape(.34,.13),.012,.1),m.c('#FF8FA3',{rim:.6}),[0,.05,0]);P(q,flatLeaf(leafShape(.2,.08),.014,.1),m.c('#FFD35C'),[0,.18,.005])});

/* ================= Fische ================= */
F('ammonit',fishMeta('Ammonit','urzeit','teich','M','immer',2,380,'Ich hab einen Ammoniten gefangen! Eine Schnecke mit Tentakeln und Schraubenhaus.','Ammoniten waren Verwandte der Tintenfische und lebten über 300 Millionen Jahre lang. Ihre Gehäuse waren in Kammern geteilt, die sie mit Gas füllten – wie ein U-Boot.'),
  (g,m)=>{spiralShell(g,m,'#F2C49A',1.6,[0,0,-.1],[0,PI/2,0]);range(8,(t,i)=>{const a=i/8*TAU;P(g,G.tu([[Math.cos(a)*.08,Math.sin(a)*.08,.2],[Math.cos(a)*.14,Math.sin(a)*.12-.05,.38],[Math.cos(a)*.1,Math.sin(a)*.06-.12,.5]],.022,.01),m.c('#FF9FA8'))});eye(g,m,[.12,.08,.22],.05,[1,.1,.5]);eye(g,m,[-.12,.08,.22],.05,[-1,.1,.5])});
F('quastenflosser',fishMeta('Quastenflosser','urzeit','meer','L','nacht',3,1400,'Ich hab einen Quastenflosser gefangen! Ein lebendes Fossil mit Beinchen-Flossen.','Quastenflosser galten als seit 66 Millionen Jahren ausgestorben – bis 1938 einer in einem Fischernetz vor Südafrika lag. Ihre fleischigen Flossen ähneln den ersten Beinen an Land.'),
  (g,m)=>fishT(g,m,{id:'quastenflosser',H:.24,L:.9,back:'#4E6EB0',belly:'#8FB0E0',fin:'#6E8ED0',tail:'spade',dorsal:'hi',pat:(x,w,h,r)=>FT.blobs(x,w,h,'#E8F2FF',10,5,10,r)}));
F('panzerfisch',fishMeta('Panzerfisch','urzeit','meer','XL','immer',4,3200,'Ich hab einen Panzerfisch gefangen! Trägt einen Helm, aber lächelt trotzdem.','Der Dunkleosteus war ein Panzerfisch mit knöchernen Kopfplatten statt Zähnen – so scharf wie Scheren. Er gehört zu den ersten Wirbeltieren mit Kiefer.'),
  (g,m)=>{const f=fishT(g,m,{id:'panzerfisch',H:.26,L:.95,back:'#8A96B0',belly:'#D8DEE8',tail:'moon',dorsal:'tri',mouth:'none'});const pm=m.c('#6E7A94',{gloss:.8,rim:.5});P(g,G.s(.2),pm,[0,.02,f.nz-.14],null,[1.05,1.05,1.2]);P(g,G.bx(.2,.03,.08,.01),m.c('#FFFDF7'),[0,-.1,f.nz-.02])});
F('trilobit',fishMeta('Trilobit','urzeit','teich','S','tag',1,160,'Ich hab einen Trilobiten gefangen! Sieht aus wie eine Assel, die in Rente gegangen ist.','Trilobiten krabbelten fast 300 Millionen Jahre über den Meeresboden. Ihre Augen bestanden aus Kalkkristallen – die ältesten Linsenaugen, die wir kennen.'),
  (g,m)=>{const bm=m.c('#B8A07A',{gloss:.6,rim:.5});P(g,G.s(.3),bm,[0,0,0],null,[1,.3,1.3]);for(let i=0;i<7;i++)P(g,G.to(.24-i*.02,.02,PI),m.c('#8E7A5A'),[0,.04,-.25+i*.08],[PI/2,0,0]);P(g,G.s(.18),bm,[0,.03,.3],null,[1.3,.35,.8]);eye(g,m,[.09,.08,.33],.04,[.5,.4,.5]);eye(g,m,[-.09,.08,.33],.04,[-.5,.4,.5])});
F('urhai',fishMeta('Amboss-Hai','urzeit','meer','L','tag',2,900,'Ich hab einen Amboss-Hai gefangen! Auf seiner Rückenflosse kann man Pfannkuchen abstellen.','Der Stethacanthus lebte vor 350 Millionen Jahren. Seine Rückenflosse war oben flach wie ein Bügelbrett und mit kleinen Zähnchen besetzt – wozu, rätselt die Forschung noch.'),
  (g,m)=>{const f=fishT(g,m,{id:'urhai',H:.2,L:.95,back:'#7FA0C0',belly:'#EEF4FA',tail:'fork',dorsal:'none'});const fm=m.c('#6E8EB0');const q=grp(g,[0,.2,-.02]);P(q,G.cy(.05,.07,.22),fm,[0,.1,0]);P(q,G.bx(.2,.05,.22,.02),fm,[0,.23,0]);range(5,(t,i)=>P(q,G.co(.018,.04),m.c('#FFFDF7'),[-.08+t*.16,.27,0]))});

/* ================= Insekten ================= */
B('riesenlibelle',bugMeta('Riesenlibelle','urzeit','luft','tag',3,1100,'Ich hab eine Riesenlibelle gefangen! Flügel so gross wie ein Frühstücksbrett.','Die Meganeura hatte 70 Zentimeter Flügelspannweite. Damals enthielt die Luft mehr Sauerstoff – das liess Insekten viel grösser werden als heute.'),
  (g,m)=>{const bm=m.c('#3FA8C8',{gloss:1});P(g,G.ca(.045,.9),bm,[0,.3,-.2],[PI/2,0,0]);P(g,G.s(.1),bm,[0,.3,.3]);bugFace(g,m,[0,.3,.32],.1,.6,{er:.4});const wm=m.c('#E8F8FF',{opacity:.55,rim:1});
    for(const z of[.18,.05])wingPair(g,m,wm,leafShape(.9,.16),[0,.34,z],.62,.05,.1,.02)});
B('urschabe',bugMeta('Ur-Schabe','urzeit','boden','nacht',1,90,'Ich hab eine Ur-Schabe gefangen! Die ist älter als die Dinos und hat trotzdem noch nie aufgeräumt.','Schaben gibt es seit über 300 Millionen Jahren – länger als Dinosaurier. Sie überleben fast alles, weil sie beinahe alles fressen.'),
  (g,m)=>{const bm=m.c('#A8704C',{gloss:.9});P(g,G.s(.3),bm,[0,.14,0],null,[.8,.35,1.1]);P(g,G.s(.12),m.c('#8A5A3E'),[0,.14,.32]);bugFace(g,m,[0,.15,.34],.12,.5);legs(g,bm,[[.15,.25,.1],[0,.3,0],[-.15,.28,-.12]],.14);feelers(g,bm,bm,[.04,.18,.42],.4,.25,.2)});
B('tausendfuesser',bugMeta('Riesen-Tausendfüsser','urzeit','boden','tag',2,650,'Ich hab einen Riesen-Tausendfüsser gefangen! Ich hab aufgehört, die Beine zu zählen.','Arthropleura war ein Tausendfüsser so lang wie ein Auto – das grösste Krabbeltier, das je an Land lebte. Er frass vermutlich Pflanzenreste im Wald.'),
  (g,m)=>{const bm=m.c('#8A6E58',{gloss:.6}),lm=m.c('#F2C49A');for(let i=0;i<9;i++){const z=-.5+i*.12,x=Math.sin(i*.8)*.06;P(g,G.s(.08),i%2?bm:m.c('#A0866C'),[x,.08,z],null,[1.4,.7,.8]);both(s=>P(g,G.cy(.01,.01,.12),lm,[x+s*.12,.04,z],[0,0,s*1.1]))}
    bugFace(g,m,[Math.sin(8*.8)*.06,.1,.5],.09,.5);feelers(g,bm,bm,[.03,.12,.56],.2,.1,.3)});
B('bernsteinmuecke',bugMeta('Bernsteinmücke','urzeit','luft','nacht',2,480,'Ich hab eine Bernsteinmücke gefangen! Sie glitzert, als hätte sie selbst schon mal in Honig gebadet.','In Bernstein, also versteinertem Baumharz, sind Insekten oft Millionen Jahre perfekt erhalten. Dinosaurier-DNA kann man daraus aber leider nicht holen – die zerfällt viel schneller.'),
  (g,m)=>{const bm=m.c('#F2A83A',{gloss:1.3,rim:.9});P(g,G.ca(.04,.3),bm,[0,.3,-.05],[PI/2-.3,0,0]);P(g,G.s(.06),bm,[0,.33,.14]);bugFace(g,m,[0,.33,.16],.06,.6);markGlow(g,P(g,G.s(.05),m.glow('#FFD35C',1.6),[0,.26,-.2]));
    wingPair(g,m,m.c('#FFF6D8',{opacity:.6}),leafShape(.3,.1),[0,.36,.05],.6,.3,.3,.02);legs(g,bm,[[.05,.12,.1],[0,.14,0],[-.05,.12,-.1]],.3,.008)});
B('seeskorpion',bugMeta('Seeskorpion','urzeit','wasser','immer',4,2600,'Ich hab einen Seeskorpion gefangen! Keine Sorge, der kneift nur zur Begrüssung.','Eurypteriden, die Seeskorpione, lebten vor über 400 Millionen Jahren im Wasser. Manche waren über zwei Meter lang – die grössten Gliederfüsser aller Zeiten.'),
  (g,m)=>{const bm=m.c('#C87A5A',{gloss:.8});for(let i=0;i<7;i++)P(g,G.s(.13-i*.012),bm,[0,.1,.2-i*.1],null,[1.3,.45,.8]);P(g,G.s(.14),bm,[0,.1,.33],null,[1.2,.5,.9]);bugFace(g,m,[0,.14,.38],.1,.6);
    both(s=>{P(g,G.tu([[s*.12,.08,.1],[s*.3,.06,0],[s*.4,.05,-.05]],.03,.05),bm);P(g,G.s(.06),bm,[s*.4,.05,-.05],null,[1.6,.4,1])});P(g,G.co(.03,.14),bm,[0,.12,-.55],[-PI/2,0,0])});

/* ================= Fundstücke ================= */
const bone='#F3E9D2';
REL('versteinertes_ei',relMeta('Versteinertes Ei','urzeit','fossil',2,700,'Ein versteinertes Dino-Ei! Wer da wohl drin war?','Forschende finden ganze Nester versteinerter Dino-Eier. Manche Dinos bebrüteten ihre Eier wie Vögel – ein Hinweis, dass Vögel wirklich ihre Nachfahren sind.'),
  (g,m)=>{P(g,G.s(.34),stoneM(m,'#C8B8A0'),[0,.42,0],null,[1,1.3,1]);range(12,(t,i)=>P(g,G.s(.04),stoneM(m,'#A89478'),[Math.cos(i*2.4)*.3,.2+t*.5,Math.sin(i*2.4)*.3]));P(g,G.bx(.02,.3,.02,.01),m.c('#8E7A68'),[.2,.5,.26],[0,0,.4])});
REL('fussabdruck',relMeta('Dino-Fussabdruck','urzeit','fossil',1,420,'Ein Dino-Fussabdruck in Stein! Grösse 92, mindestens.','Fährten zeigen, wie Dinos liefen: wie schnell, ob allein oder in Herden. Manche Spuren wurden in Schlamm gedrückt, der dann austrocknete und versteinerte.'),
  (g,m)=>{P(g,G.cy(.5,.55,.14),stoneM(m,'#C8B49A'),[0,.07,0]);const dm=m.c('#8E7A68');P(g,G.cy(.16,.16,.02),dm,[0,.14,-.05]);range(3,(t,i)=>P(g,G.s(.08),dm,[(i-1)*.14,.14,.16+(i===1?.04:0)],null,[1,.2,1.6]))});
REL('meteorit',relMeta('Meteoriten-Splitter','urzeit','fossil',3,1500,'Ein Splitter vom grossen Meteoriten! Er ist noch ein bisschen warm. Oder bilde ich mir das ein?','Vor 66 Millionen Jahren schlug ein etwa zehn Kilometer grosser Asteroid in Mexiko ein. Staub verdunkelte die Sonne, und die meisten Dinos starben aus – nur die Vögel nicht.'),
  (g,m)=>{P(g,G.blob(.34,.22,2.6,7),m.c('#6E6A7E',{gloss:.9,rim:.5}),[0,.3,0]);range(6,(t,i)=>P(g,G.s(.05),m.c('#C8D0E0',{gloss:1.4}),[Math.cos(i*1.3)*.3,.3+(t-.5)*.3,Math.sin(i*1.3)*.3]));markGlow(g,P(g,G.s(.07),m.glow('#FFB27A',1.2),[.12,.5,.2]))});
REL('koprolith',relMeta('Koprolith','urzeit','fossil',2,560,'Ein Koprolith! Das ist … versteinerter Dino-Kaka. Wissenschaft ist wunderschön.','Versteinerter Kot verrät, was Dinos gegessen haben: Pflanzenreste, Knochensplitter, sogar Parasiten. Forschende nennen das liebevoll Koprolithen.'),
  (g,m)=>{const sm=stoneM(m,'#A8906E');for(let i=0;i<3;i++)P(g,G.to(.24-i*.06,.1-i*.015),sm,[0,.1+i*.14,0],[PI/2,0,i]);P(g,G.co(.08,.18),sm,[0,.5,0])});
REL('flugsaurier',relMeta('Flugsaurier-Schädel','urzeit','fossil',3,1800,'Ein Flugsaurier-Schädel! Mit Kamm. Sehr elegant, sehr spitz.','Flugsaurier waren keine Dinosaurier, sondern ihre Cousins. Ihre Flügel waren Hautsegel, die an einem extrem langen vierten Finger hingen.'),
  (g,m)=>{const bm=stoneM(m,bone);P(g,G.co(.12,.9),bm,[0,.25,.3],[PI/2,0,0]);P(g,G.s(.16),bm,[0,.28,-.15],null,[1,1,1.2]);P(g,G.co(.08,.5),bm,[0,.5,-.35],[-1.9,0,0]);P(g,G.s(.05),m.c('#5E4E48'),[.1,.3,-.1])});

/* ================= Tiere: Dinos (Quaternius-Modelle, gefärbt) ================= */
const dp=(main,belly,acc)=>({byHex:{'#444a42':main,'#444a3f':main,'#555b4f':main,'#4a3f2f':main,'#44434a':main,'#4a3932':main,'#ba945e':belly,'#615846':belly,'#758276':belly,'#5b4e3b':acc,'#726759':belly,'#615048':belly,'#81826e':belly,'#858264':acc,'#873c43':'#FF8FA3'},line:'#4a3a5e'});
Object.assign(FAUNA.S,{
  rexi:{n:'T-Rex',planet:ID,biomes:['urwiese','farnwald'],count:2,size:2.2,speed:1.2,voice:['raaawr','grrmpf','rawr?'],pitch:120,likes:['farnwedel','apfel','bernsteinbrocken'],product:'dinofeder',
    names:['Rexi','Tina','Brüllchen','Knuddel-Rex','Kurzarm'],fact:'Der Tyrannosaurus hatte winzige Arme, aber einen der stärksten Bisse aller Landtiere. Forschende vermuten, dass junge T-Rex flauschige Federn hatten.',
    a:{kit:['dino','Trex'],h:1,pal:dp('#8FD06B','#FFE8B0','#6FB85A')}},
  bronti:{n:'Brontosaurus',planet:ID,biomes:['urwiese','schachtelhalmsumpf','farnwald'],count:3,herd:true,size:4.4,speed:.55,voice:['muuuuh','hmmmmm'],pitch:70,likes:['farnwedel','apfel'],product:'farnwedel',
    names:['Langhals-Lotti','Bronto','Wolke','Sanftfuss','Gipfel'],fact:'Langhals-Dinos wie der Apatosaurus waren die grössten Landtiere aller Zeiten. Sie schluckten Blätter ganz und liessen Steine im Magen das Kauen erledigen.',
    a:{kit:['dino','Apatosaurus'],h:1,pal:dp('#8EC6E8','#D8F0FF','#6FA8D0'),gaitSpeed:3}},
  parasauri:{n:'Parasaurolophus',planet:ID,biomes:['schachtelhalmsumpf','farnwald'],nearWater:true,count:3,herd:true,size:1.7,speed:1,voice:['tröööt','tuuut','dü-dü'],pitch:220,likes:['farnwedel','apfel'],product:'farnwedel',
    names:['Tröti','Posaune','Trompetchen','Hupe','Kamm'],fact:'Der Parasaurolophus hatte einen hohlen Kopfkamm. Luft, die hindurchströmte, erzeugte tiefe Töne – wie ein Blasinstrument.',
    a:{kit:['dino','Parasaurolophus'],h:1,pal:dp('#FFB27A','#FFE0C0','#F28C5A')}},
  stegi:{n:'Stegosaurus',planet:ID,biomes:['urwiese','farnwald','vulkanhang'],count:2,size:1.9,speed:.7,voice:['hmpf','brumm'],pitch:140,likes:['farnwedel','lavastein'],product:'farnwedel',
    names:['Plättchen','Stachelchen','Zacke','Gustav','Schuppi'],fact:'Die Rückenplatten des Stegosaurus waren von Blutgefässen durchzogen. Vielleicht dienten sie zum Aufwärmen, vielleicht zum Angeben – oder beides.',
    a:{kit:['dino','Stegosaurus'],h:1,pal:{byHex:{'#4a3f2f':'#C6A9FF','#5b4e3b':'#FF8FB8','#615846':'#F2E6FF'},line:'#4a3a5e'}}},
  trici:{n:'Triceratops',planet:ID,biomes:['urwiese','vulkanhang'],count:3,herd:true,size:1.8,speed:.8,voice:['schnaub','mööp'],pitch:150,likes:['farnwedel','bernsteinbrocken'],product:'farnwedel',
    names:['Drei-Horn','Nashörnchen','Krause','Tri-Tri','Hornella'],fact:'Die Nackenkrause des Triceratops war vermutlich zum Imponieren da. Sein Schnabel war scharf wie eine Heckenschere – perfekt für zähe Farne.',
    a:{kit:['dino','Triceratops'],h:1,pal:{byHex:{'#44434a':'#FFD35C','#726759':'#FFF1C8','#5b4e3b':'#F2A83A'},line:'#4a3a5e'}}},
  raptori:{n:'Velociraptor',planet:ID,biomes:['farnwald','urwiese'],count:3,herd:true,size:1,speed:1.9,shy:true,voice:['kiek','tschirp','kraa'],pitch:420,likes:['bernsteinbrocken','dinofeder'],product:'dinofeder',
    names:['Flitzi','Kralle','Federchen','Sausewind','Pieps'],fact:'Echte Velociraptoren waren nur so gross wie ein Truthahn und hatten Federn. Die riesigen „Raptoren“ aus Filmen sind stark übertrieben.',
    a:{kit:['dino','Velociraptor'],h:1,pal:{byHex:{'#4a3932':'#56C6B6','#615048':'#D8FFF4','#0e0e0e':'#2E2A3E'},line:'#4a3a5e'},gaitSpeed:11}},
  /* Babys aus Nest-Eiern: gibt es nicht wild, nur als Begleiter */
  babyrex:{n:'Baby-Rex',planet:'_baby',biomes:[],count:0,size:.9,speed:1.3,voice:['rawr!','piep','mrrp'],pitch:360,likes:['farnwedel','apfel'],product:'dinofeder',names:['Mini-Rex'],fact:'Frisch geschlüpfte Dinos waren winzig: Selbst Langhälse passten als Baby auf einen Esstisch.',a:{kit:['dino','Trex'],h:1,pal:dp('#B8E890','#FFF1C8','#8FD06B')}},
  babybronti:{n:'Baby-Bronto',planet:'_baby',biomes:[],count:0,size:1.4,speed:1,voice:['muh!','hmm'],pitch:260,likes:['farnwedel'],product:'farnwedel',names:['Mini-Bronto'],fact:'Langhals-Babys wuchsen irre schnell: Jedes Jahr kamen Hunderte Kilo dazu.',a:{kit:['dino','Apatosaurus'],h:1,pal:dp('#B8E0FF','#F0FAFF','#8EC6E8')}},
  babytrici:{n:'Baby-Triceratops',planet:'_baby',biomes:[],count:0,size:.8,speed:1.1,voice:['möp!','schnauf'],pitch:330,likes:['farnwedel'],product:'farnwedel',names:['Mini-Trici'],fact:'Junge Triceratops hatten nur kleine Hornstummel – die grossen Hörner wuchsen erst später.',a:{kit:['dino','Triceratops'],h:1,pal:{byHex:{'#44434a':'#FFE89A','#726759':'#FFF8E0','#5b4e3b':'#FFD35C'},line:'#4a3a5e'}}},
  babystegi:{n:'Baby-Stegosaurus',planet:'_baby',biomes:[],count:0,size:.8,speed:1,voice:['hmpfi','brümm'],pitch:320,likes:['farnwedel'],product:'farnwedel',names:['Mini-Stegi'],fact:'Die Rückenplatten wuchsen mit dem Tier mit und veränderten dabei ihre Form.',a:{kit:['dino','Stegosaurus'],h:1,pal:{byHex:{'#4a3f2f':'#E0D0FF','#5b4e3b':'#FFB8D8','#615846':'#FFFFFF'},line:'#4a3a5e'}}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','federschmuck','Federschmuck',680,'#FF8FA3',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.to(r*.78,r*.07),M.c('#8A5E42'),[0,0,0],[PI/2,0,0]);for(let i=0;i<5;i++){const a=(i-2)*.32;const f=grp(q,[Math.sin(a)*r*.7,r*.05,-Math.cos(a)*r*.7],[-.3,a,0]);
  P(f,flatLeaf(leafShape(r*.7,r*.22),.015,.1),M.c(i%2?col:'#FFD35C',{rim:.6}),[0,r*.35,0],[0,0,0]);P(f,G.cy(r*.02,r*.02,r*.6),M.c('#FFFDF7'),[0,r*.3,0])}});
def('neck','knochenkette','Knochenkette',520,'#F3E9D2',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.to(r*.62,r*.03),M.c('#8A5E42'),[0,0,0],[PI/2,0,0]);
  for(let i=0;i<7;i++){const a=PI*.2+i/6*PI*.6;P(q,G.ca(r*.05,r*.16),M.c(col),[Math.cos(a)*r*.64,-r*.06,Math.sin(a)*r*.64],[0,0,0])}});
def('top','fellumhang','Fell-Umhang',950,'#C99A6E',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.8,r*1.02,r*.95,Q(16),1,true),M.c(col,{rim:.5}),[0,-r*.47,0]);P(q,G.to(r*.8,r*.1),M.c('#FFF6E8',{rim:.6}),[0,-r*.02,0],[PI/2,0,0]);range(10,(t,i)=>{const a=i/10*TAU;P(q,G.co(r*.1,r*.22,5),M.c(col,{rim:.5}),[Math.cos(a)*r*1,-r*1.02,Math.sin(a)*r*1],[PI,0,0])});
  P(q,G.s(r*.12),M.c('#F2A83A',{gloss:1.2}),[0,-r*.06,r*.52])});

/* ================= Bau-Familie: Urzeit-Hütten ================= */
function urhuette(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.45:1;const style=plan.style||A.pick(r,['stein','fell','lehm']);
  const Rb=(1.05+r()*.3)*big,Hw=(1.05+r()*.2)*big;const pal=A.palette(pid,r);const body=new THREE.Group();g.add(body);
  const stoneC=A.pick(r,['#C8BCB0','#B8AEA6','#D4C6B4']),thatch=A.pick(r,['#E8C87A','#D8B868','#C8A868','#B8BE78']);
  if(style==='fell'){/* Fellzelt: Stangen, Fellbahnen, Knochen oben */const h=Hw*2.3;P(body,G.co(Rb*1.12,h,Q(10),1,true),cozy({color:A.pick(r,['#C99A6E','#D8B48E','#B88A64'])}),[0,h/2,0]);
    for(let i=0;i<10;i++){const a=i/10*TAU;P(body,G.bx(.06,h*.02,Rb*.02,.01),cozy({color:'#8A5E42'}),[Math.cos(a)*Rb*1.1,.4,Math.sin(a)*Rb*1.1])}
    for(let i=0;i<6;i++){const a=i/6*TAU;P(body,G.tu([[Math.cos(a)*Rb*.25,h*.8,Math.sin(a)*Rb*.25],[Math.cos(a)*Rb*.05,h*1.05,Math.sin(a)*Rb*.05],[Math.cos(a)*Rb*.18,h*1.18,Math.sin(a)*Rb*.18]],.045,.035),cozy({color:'#8A5E42'}))}
    for(let k=0;k<3;k++){const y=h*(.25+k*.2);P(body,G.to(Rb*1.12*(1-(y/h))+.02,.035),cozy({color:'#FFF1DA'}),[0,y,0],[PI/2,0,0])}
    /* Handabdrücke */for(let i=0;i<3;i++){const a=PI*.5+(i-1)*.7,y=h*.32+i*.08;const rr=Rb*1.12*(1-y/h)+.005;P(body,G.s(.09),cozy({color:A.pick(r,['#FF8FA3','#FFD35C','#56C6B6'])}),[Math.cos(a)*rr,y,Math.sin(a)*rr],null,[1,1,.2])}
    var top=h*1.18,doorZ=-Rb*.86}
  else{/* Steinhütte oder Lehmkuppel mit Reetdach */if(style==='stein'){P(body,G.cy(Rb*.98,Rb*1.02,Hw,Q(16)),cozy({color:shadeC(stoneC,.9)}),[0,Hw/2,0]);
      for(let row=0;row<3;row++){const n=Math.round(TAU*Rb/.42);for(let i=0;i<n;i++){const a=(i+(row%2)*.5)/n*TAU;if(Math.abs(Math.atan2(Math.cos(a),-Math.sin(a)))<.01)continue;P(body,G.blob(.22+r()*.06,.18,2,r()*9),cozy({color:shadeC(stoneC,.9+r()*.2)}),[Math.cos(a)*Rb,.18+row*Hw*.32,Math.sin(a)*Rb],null,[1.2,.8,.8])}}}
    else{P(body,G.hs(Rb*1.05),cozy({color:A.pick(r,['#E8B888','#F2C49A','#DCA87A'])}),[0,.02,0],null,[1,Hw/Rb*1.1,1]);for(let i=0;i<4;i++){const a=PI*.35+i*.5;P(body,G.to(.08,.02),cozy({color:'#FFFDF7'}),[Math.cos(a)*Rb*.95,Hw*.5,Math.sin(a)*Rb*.95],[0,-a+PI/2,0])}}
    /* Reetdach aus drei Lagen */const rr=Rb*1.38,rh=Rb*1.25+.2;for(let k=0;k<3;k++){const s=1-k*.26;P(body,G.co(rr*s,rh*s,Q(14),1,false),cozy({color:shadeC(thatch,1-k*.07)}),[0,Hw+rh*s/2+k*rh*.2-.05,0])}
    const tt=Hw+rh*.72+rh*.4;P(body,G.cy(.1,.14,.3),cozy({color:'#8A5E42'}),[0,tt,0]);
    /* Fransen am Dachrand */const nf=Math.round(TAU*rr/.18);for(let i=0;i<nf;i++){const a=i/nf*TAU;P(body,G.cy(.018,.03,.2),cozy({color:shadeC(thatch,.85)}),[Math.cos(a)*rr*.98,Hw-.05,Math.sin(a)*rr*.98])}
    var top=tt+.2,doorZ=-Rb+.02}
  /* Tür nach −z mit Stosszahn-Bogen */const dr=A.archDoor(A.pick(r,['#8A5E42','#56C6B6','#F0556E','#FFD35C']),'#6E4A3A');dr.position.set(0,0,doorZ);dr.rotation.y=PI;body.add(dr);
  both(s=>P(body,G.tu([[s*.46,0,doorZ-.12],[s*.62,.7,doorZ-.2],[s*.36,1.18,doorZ-.18],[s*.05,1.25,doorZ-.12]],.07,.03),cozy({color:bone})));
  if(style!=='fell'){const nw=1+Math.floor(r()*2);for(let i=0;i<nw;i++){const a=PI*.5+(i?1:-1)*(1.1+r()*.5);const w=A.roundWindow('#8A5E42',.17,false);w.position.set(Math.cos(a)*(Rb*.99),Hw*.6,-Math.sin(a)*(Rb*.99));w.rotation.y=Math.atan2(Math.cos(a),-Math.sin(a));body.add(w)}}
  /* Lagerfeuer-Steine oder Knochen am Eingang */if(r()<.6){const fx=Rb*.9+.5;for(let i=0;i<7;i++){const a=i/7*TAU;P(g,G.blob(.1,.2,2,i),cozy({color:'#B8AEA6'}),[fx+Math.cos(a)*.26,.06,doorZ-.3+Math.sin(a)*.26])}
    for(let i=0;i<3;i++)P(g,G.cy(.03,.04,.4),cozy({color:'#8A5E42'}),[fx+Math.cos(i*2)*.05,.14,doorZ-.3+Math.sin(i*2)*.05],[.6*Math.cos(i*2.1),0,.6*Math.sin(i*2.1)]);const fl=P(g,G.co(.1,.28),cozy({color:'#FFB24A',emissive:new THREE.Color('#FF8A3A'),emissiveIntensity:1.2}),[fx,.24,doorZ-.3]);fl.material.userData.noBake=true}
  addOutlines(body);const R0=style==='fell'?Rb*1.12:Rb;return{g,R:R0+.6,top,door:[0,doorZ],walls:[new THREE.Box3(new V(-R0,0,-R0),new V(R0,top,R0))],style:'urhuette-'+style}}
const shadeC=(c,f)=>'#'+new THREE.Color(c).multiplyScalar(f).getHexString();

/* ================= Sprache: Höhlenmalerei-Zeichen ================= */
function cave(x,s,r,R){const k=Math.floor(r()*5);x.beginPath();if(k===0){/* Tier */x.ellipse(0,0,s*.3,s*.16,0,0,TAU);x.moveTo(-s*.2,s*.12);x.lineTo(-s*.24,s*.38);x.moveTo(s*.2,s*.12);x.lineTo(s*.24,s*.38);x.moveTo(s*.28,-s*.05);x.lineTo(s*.42,-s*.3)}
  else if(k===1){/* Sonne */x.arc(0,0,s*.16,0,TAU);for(let i=0;i<6;i++){const a=i/6*TAU;x.moveTo(Math.cos(a)*s*.24,Math.sin(a)*s*.24);x.lineTo(Math.cos(a)*s*.38,Math.sin(a)*s*.38)}}
  else if(k===2){/* Hand */x.ellipse(0,s*.12,s*.16,s*.2,0,0,TAU);for(let i=0;i<4;i++){x.moveTo(-s*.12+i*.08*s,-s*.02);x.lineTo(-s*.14+i*.09*s,-s*.38)}}
  else if(k===3){/* Spirale */for(let i=0;i<=24;i++){const a=i*.5,rr=s*.02+i*s*.015;i?x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):x.moveTo(0,0)}}
  else{/* Figur */x.arc(0,-s*.28,s*.09,0,TAU);x.moveTo(0,-s*.18);x.lineTo(0,s*.12);x.moveTo(-s*.2,-s*.05);x.lineTo(s*.2,-s*.05);x.moveTo(0,s*.12);x.lineTo(-s*.15,s*.4);x.moveTo(0,s*.12);x.lineTo(s*.15,s*.4)}x.stroke()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Urzeit-Tal',base:'kompost',R:132,R0:44,sea:-.22,music:'world',sky:['#ffd9a8','#fff0da'],fog:'#f6e2c8',water:'#5CC8B8',deep:'#2E8E88',step:1.2,shop:ID,
    desc:'Farnwälder, Vulkane, Bernsteinstrände. Hier grasen Dinos, und nachts öffnet sich ein Zeitriss.',weather:'blueten',orbit:[110,.9],size:1,col:['#9CCB5A','#5CC8B8'],packs:['dino'],moons:1,
    park:'farnwald',parkPond:true,phone:['#C8E890','#FFC89A'],stones:['lavastein','bernsteinbrocken','stein_klein'],
    space:{deep:'#2E8E88',water:'#5CC8B8',shore:'#F6D8A0',land:'#8FD06B',land2:'#5FAE55',high:'#A898B0',cap:'#FFF6E8',atmo:'#FFD9A8',cloud:.5,sea:.42,capA:.7,freq:2.4},
    mac:{oc:-.12,m:.24,isl:1.1},climate:{hot:'vulkanhang',wet:'schachtelhalmsumpf',cold:'urwiese'},peak:'aschefeld',
    raw(q,p,{N,N2,N3,fbm}){let h=fbm(q,1.25,4)*2.2+.9;const rv=Math.abs(N2(q.x*1.4,q.y*1.4,q.z*1.4));h-=2.4*sstep(.05,0,rv)*sstep(-.3,.1,p.y);
      for(const v of VOLC){const d=angle(p,v.d)/v.s;if(d<.26){const t=1-d/.26;h+=10*t*t*(3-2*t);if(d<.045)h-=3.6*(1-d/.045)}}return h},
    biome({T,M,h,sea,low,nearPond,p}){if(low&&h<sea+.45&&!nearPond)return'bernsteinstrand';if(volcNear(p)<.24)return h>sea+7?'aschefeld':'vulkanhang';if(nearPond||M>.3)return'schachtelhalmsumpf';if(T>.18||M<-.25)return'urwiese';return'farnwald'},
    onLoad:G=>URZEIT.onLoad(G),tick:(dt,t,G,me)=>URZEIT.tick(dt,t,G,me)},
  places:[{id:'platz',n:'Lagerfeuer-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Farnweiher',lat:46,lon:120,r:.1,pond:true},{id:'teich2',n:'Dino-Tränke',lat:38,lon:230,r:.12,pond:true},{id:'see',n:'Urmeer-Bucht',lat:10,lon:200,r:.14,pond:true}],
  biomes:BI,
  names:{casino:'Knochen-Casino',mode:'Fell & Feder',praxis:'Kräuterhöhle',museum:'Fossilienhalle',shop:'Bernstein-Tausch',studio:'Höhlenmal-Atelier',bar:'Lagerfeuer-Jazz',rathaus:'Ältestenrat',garage:'Steinrad-Garage',pflanzen:'Farn-Gärtnerei',tiere:'Dino-Hort'},
  sty:{wall:'lehm',walls:['#F2D1A8','#E8C49A','#F6E0C0','#D8C0A0'],roof:'dome',roofs:['#D8B868','#9CCB5A','#C8A060'],trim:'#F3E9D2',plinth:'#B8AEA6',door:'#8A5E42',win:'rund',pitch:.8},
  wall:'ziegel',floor:'terrakotta',
  mayor:['Häuptlingin Rexa',{skin:'schuppen',color:5,shape:'birne'},{kopf:'chamaeleon',augen:'kuller',arme:'mini',beine:'huhn',extras:['stacheln','krone']}],
  lore:['Unser Tal ist sehr, sehr alt. Die Dinos waren zuerst hier, wir sind nur zu Besuch.','Nachts öffnet sich manchmal ein Zeitriss am Vulkan. Wer hindurchgeht, sieht, wie alles einmal war.','Ein Ei aus dem Nest darfst du mitnehmen, wenn du gut darauf aufpasst. Die Kleinen hängen dann sehr an dir.'],
  caveRock:['#C8B8A0','#A89478','#6E5E54',['#FFD9A8','#FFE8C8','#F2C49A']],
  wear:['federschmuck','knochenkette','fellumhang','strohhut','halstuch','poncho','blumenkette'],clothes:CL,
  haus:{theme:{roof:['#D8B868','#9CCB5A','#C8A060','#E8C87A'],wall:['#F2D1A8','#E8C49A','#F6E0C0'],wood:['#8A5E42','#A0704C','#B8875A'],stone:['#C8BCB0','#B8AEA6','#D4C6B4'],trim:['#F3E9D2','#FFF6E8'],plant:['#6CBF5A','#8FD06B']},
    props:[['nature','campfire_stones',1.2,'d',0],['nature','rock_largeA',1,'c'],['nature','log_stack',1.2,'s',0],['nature','plant_bushLarge',1.4,'c',0],['nature','rock_tallB',.9,'cb'],['survival','tent-canvas',.8,'b']],
    garden:{path:'path_stone',flowers:['flower_redA','flower_yellowB'],veg:['crop_pumpkin','crop_melon']},
    plan:[{fam:'urhuette',style:'stein'},{fam:'urhuette',style:'lehm'},{fam:'urhuette',style:'fell'},{fam:'urhuette'}],fams:{urhuette}},
  residents:{skins:['schuppen','fell','knochen','haut','moos'],heads:['chamaeleon','frosch','vogel','eule','schaedel','ei','mensch','axolotl','kaefer'],names:['Farni','Ammo','Bernie','Lavinia','Knochen-Kuno','Rexine','Trilo','Flora Farn','Ur-Uschi','Kiesel','Glutchen','Schachtel-Hallo'],
    house:{shapes:['rund','huette'],walls:['stein','lehm'],wallCols:['#F2D1A8','#E8C49A','#D8C0A0'],roofCols:['#D8B868','#9CCB5A'],win:['rund']},deco:['farn','palmfarn','schachtelhalm','findling'],fence:false},
  lang:{n:'Urlaut',ink:'#8A3E2E',glow:'#FFB27A',kind:'cave',draw:cave,syl:['ug','ba','ruh','ka','mo','ta','gra','u','ho','nu','ak','rrr']},ruinStone:'#C8B49A',
  terraform:['farnwald','urwiese','schachtelhalmsumpf','bernsteinstrand'],
  weather:[['klar',2],['heiter',2],['hitze',2],['regen',2],['gewitter',1],['nebel',2]]});

/* ================= Planeten-Besonderheiten ================= */
const URZEIT=(()=>{let nests=[],rift=null,riftOn=false,era=0,eraT=0,glowFos=[],meteors=[],giant=null,G_=null;const M=()=>makeMats({skin:'haut',color:0});
  const S=()=>SAVE.urzeit=SAVE.urzeit||{eggs:[],hatched:[],rifts:0,taken:{}};
  const KINDS=[['babyrex','Rex-Ei','#B8E890'],['babybronti','Bronto-Ei','#B8E0FF'],['babytrici','Triceratops-Ei','#FFE89A'],['babystegi','Stego-Ei','#E0D0FF']];
  const HATCH=6*60*1000;
  const isNight=()=>{const h=GAMETIME.hour();return h<6||h>=19};
  function surf(G,d,off){return d.clone().multiplyScalar(G.R+G.hAt(d)+(off||0))}
  function egg(m,col,s){const g=new THREE.Group();P(g,G.s(.2*s),m.c(col,{rim:.6,gloss:.6}),[0,.26*s,0],null,[1,1.3,1]);range(7,(t,i)=>P(g,G.s(.035*s),m.c(shade(col,.8)),[Math.cos(i*2.4)*.17*s,.18*s+t*.18*s,Math.sin(i*2.4)*.17*s]));return g}
  function nestModel(m,kind){const g=new THREE.Group();for(let i=0;i<3;i++)P(g,G.to(.55-i*.05,.1),m.c(['#B8875A','#A0704C','#C9A070'][i]),[0,.08+i*.05,0],[PI/2,0,i]);P(g,G.cy(.5,.5,.05),m.c('#9CCB5A'),[0,.05,0]);
    const eggs=[];for(let i=0;i<3;i++){const e=egg(m,kind[2],1);e.position.set(Math.cos(i*2.1)*.2,.1,Math.sin(i*2.1)*.2);e.rotation.z=(i-1)*.2;g.add(e);eggs.push(e)}addOutlines(g);g.userData.eggs=eggs;return g}
  function onLoad(W){G_=W;nests=[];glowFos=[];meteors=[];giant=null;rift=null;era=0;const m=M();const r=srand(4242);
    /* sechs Nester, verteilt in Farnwald und Urwiese */for(let i=0,t=0;i<6&&t<400;t++){const d=new V().randomDirection();if(d.y>.93||d.y<-.6)continue;const b=W.biomeAt(d);if(!['farnwald','urwiese','schachtelhalmsumpf'].includes(b))continue;if(!GAME.isLand(d))continue;
      const kind=KINDS[i%KINDS.length];const g=nestModel(m,kind);const id='nest'+i;GAME.placeObj(g,d,r()*6,0);nests.push({id,d,g,kind});GAME.addObst(d,.6);
      W.inter.push({kind:'nest',p:d,r:1.6,label:'Dino-Nest ansehen ('+kind[1]+')',act:()=>nestTalk(nests.find(n=>n.id===id))});i++}
    /* Zeitriss am nächsten Vulkan-Fuss */const v=VOLC.slice().sort((a,b)=>b.d.y-a.d.y)[0];const tg=GAME.tangentTo(v.d,new V(0,1,0));const rd=v.d.clone().addScaledVector(tg,.2*v.s).normalize();const W2=W;
    const rg=new THREE.Group();const ring=P(rg,G.to(1.3,.12),m.glow('#C6A9FF',1.8),[0,1.6,0]);const inner=new THREE.Mesh(new THREE.CircleGeometry(1.2,40),new THREE.MeshBasicMaterial({color:'#8E6BD1',transparent:true,opacity:.55,side:THREE.DoubleSide}));inner.position.y=1.6;rg.add(inner);
    const sparks=[];for(let i=0;i<14;i++){const s=P(rg,G.s(.05),m.glow(i%2?'#FFD35C':'#FFFFFF',2),[0,1.6,0]);sparks.push(s)}for(const sd of[-1,1])P(rg,G.blob(.5,.2,2,sd),m.c('#7A6E8A'),[sd*1.5,.3,0]);addOutlines(rg);
    GAME.placeObj(rg,rd,0,0);rift={g:rg,d:rd,ring,inner,sparks};W.inter.push({kind:'zeitriss',p:rd,r:2.4,label:'Zeitriss betreten',act:enterRift,when:()=>riftOn});
    setRift(isNight(),true);
    if(S().eggs.length&&!S()._hint){S()._hint=1;setTimeout(()=>UI.toast('Deine Dino-Eier sind warm eingepackt. Bald schlüpft etwas!',3200),2500)}}
  function setRift(on,quiet){riftOn=on;if(!rift)return;rift.g.visible=on;if(on&&!quiet)UI.toast('Am Vulkan leuchtet ein Zeitriss auf …',2800)}
  async function nestTalk(n){if(!n)return;const st=S();const today=Math.floor(Date.now()/864e5);const took=st.taken[n.id]===today;
    if(took){await UI.talk('Dino-Nest',['Hier liegen noch zwei Eier. Eins hast du heute schon mitgenommen – die anderen brauchen ihre Eltern.']);return}
    const ch=await UI.talk('Dino-Nest',['Ein warmes Nest mit drei gesprenkelten Eiern ('+n.kind[1]+'). Eine Dino-Mama schaut aus der Ferne zu.'],{choices:['Ein Ei vorsichtig mitnehmen','Nur anschauen']});
    if(ch!==0)return;if(st.eggs.length>=3){UI.toast('Du trägst schon drei Eier. Warte, bis eins schlüpft.');return}
    st.taken[n.id]=today;st.eggs.push({k:n.kind[0],n:n.kind[1],t:Date.now()});persist();const e=n.g.userData.eggs.find(x=>x.visible);if(e)e.visible=false;SND.play('pickup');
    UI.toast(n.kind[1]+' eingepackt! Es schlüpft in etwa 6 Minuten – egal, auf welchem Planeten du bist.',3600)}
  /* Schlüpfen: überall prüfen, auch unterwegs */
  let chk=0;function hatchCheck(){const st=SAVE.urzeit;if(!st||!st.eggs.length)return;const now=Date.now();const ready=st.eggs.filter(e=>now-e.t>HATCH);if(!ready.length||UI.anyOpen()||GAME.mode!=='outdoor')return;
    const e=ready[0];st.eggs.splice(st.eggs.indexOf(e),1);st.hatched.push(e.k);persist();SND.jingle('j_success');
    (async()=>{await UI.talk(e.n,['Knack … knack … KNACK!','Ein '+FAUNA.S[e.k].n+' ist geschlüpft und schaut dich mit grossen Augen an!']);
      const ch=await UI.talk(e.n,['Das Baby möchte bei dir bleiben.'],{choices:[SAVE.pet?'Mitnehmen (ersetzt dein Begleittier)':'Mitnehmen','Zum Tierpark bringen']});
      if(ch===0){SAVE.pet={key:e.k,name:FAUNA.S[e.k].names[0]};SAVE.faunaSeen=Object.assign(SAVE.faunaSeen||{},{[e.k]:1});persist();try{FAUNA.spawn(GAME.G.id)}catch(x){}UI.toast(SAVE.pet.name+' läuft dir jetzt überallhin nach. Sprich es an, um ihm einen Namen zu geben.',3400)}
      else{SAVE.faunaSeen=Object.assign(SAVE.faunaSeen||{},{[e.k]:1});persist();UI.toast('Das Baby zieht in deinen Tierpark und in den Dino-Hort.',3000)}})()}
  /* Zeitriss: kurze Urzeit-Epoche */
  function enterRift(){if(!riftOn||era>0)return;const st=S();st.rifts++;persist();SND.play('whoosh');UI.toast('Du trittst durch den Riss … 66 Millionen Jahre zurück!',3200);era=1;eraT=120;
    const m=M();const W=GAME.G;/* Riesen-Brontosaurus stapft am Horizont */{const kd=rift.d.clone();const t2=GAME.tangentTo(kd,new V(1,0,0));const d=kd.clone().addScaledVector(t2,26/W.R).normalize();const g=new THREE.Group();
      const b=KIT.bounds('dino','Apatosaurus');const mm=KIT.mesh('dino','Apatosaurus',{byHex:{'#444a3f':'#8EC6E8','#615846':'#D8F0FF'},line:'#4a3a5e'});if(mm){const k=7/(b[4]-b[1]);mm.scale.setScalar(k);mm.position.set(0,-b[1]*k,0);g.add(mm)}GAME.placeObj(g,d,1,0);giant={g,d,ph:0}}
    /* glühende Fossilien zum Ausgraben rund um den Riss */for(let i=0;i<5;i++){const t2=GAME.tangentTo(rift.d,new V().randomDirection());const d=rift.d.clone().addScaledVector(t2,(5+Math.random()*10)/W.R).normalize();
      const g=new THREE.Group();P(g,G.s(.3),m.glow('#FFD35C',1.6),[0,.1,0],null,[1.4,.3,1.4]);GAME.placeObj(g,d,0,0);const f={g,d,done:false};glowFos.push(f);
      W.inter.push({kind:'urfossil',p:d,r:1.4,label:'Glühendes Fossil ausgraben',act:()=>dig(f),when:()=>!f.done&&era>0})}}
  const G_s=r=>G.s(r);
  function dig(f){if(f.done)return;f.done=true;f.g.visible=false;const pool=RELICS.filter(x=>x.planet===ID);const rel=pick(pool);SND.play('chop');
    if(rel&&typeof bagAdd==='function'&&bagAdd('relic',rel.id)){UI.toast('Ausgegraben: '+rel.n+'!',2600)}else{money(120);UI.toast('Ein Stück Urzeit-Bernstein: 120 Taler.',2400)}}
  function endEra(){era=0;if(giant){giant.g.parent&&giant.g.parent.remove(giant.g);giant=null}for(const f of glowFos)f.g.parent&&f.g.parent.remove(f.g);glowFos=[];for(const s of meteors)s.parent&&s.parent.remove(s);meteors=[];UI.toast('Der Zeitriss schliesst sich. Du bist zurück in der Gegenwart.',3000)}
  function tick(dt,t,W,me){chk-=dt;if(chk<=0){chk=3;hatchCheck();const nt=isNight();if(nt!==riftOn)setRift(nt)}
    if(rift&&rift.g.visible){rift.ring.rotation.z+=dt*.8;rift.inner.material.opacity=.45+Math.sin(t*2)*.12;rift.sparks.forEach((s,i)=>{const a=t*1.4+i*.45;s.position.set(Math.cos(a)*1.4,1.6+Math.sin(a*1.3)*1.3,Math.sin(a*.7)*.2)})}
    if(era>0){eraT-=dt;if(giant){giant.ph+=dt;giant.g.children[0]&&(giant.g.children[0].rotation.z=Math.sin(giant.ph*1.5)*.03)}
      /* Meteoritenschauer am Himmel */if(Math.random()<dt*3&&me){const m=M();const s=new THREE.Mesh(new THREE.SphereGeometry(.25,8,6),m.glow(Math.random()<.5?'#FFD35C':'#FF9A4A',2.2));const up=me.p.clone();const t2=GAME.tangentTo(up,new V().randomDirection());
        s.position.copy(up.clone().multiplyScalar(W.R+60)).addScaledVector(t2,40+Math.random()*30);s.userData.v=t2.clone().multiplyScalar(-38).addScaledVector(up,-14);s.userData.life=2.2;W.scene.add(s);meteors.push(s)}
      for(const s of meteors){s.position.addScaledVector(s.userData.v,dt);s.userData.life-=dt;s.visible=s.userData.life>0}meteors=meteors.filter(s=>{if(s.userData.life>0)return true;s.parent&&s.parent.remove(s);return false});
      if(eraT<=0)endEra()}}
  /* Schlüpfen auch auf anderen Planeten */setInterval(()=>{if(GAME.G&&GAME.G.id!==ID)try{hatchCheck()}catch(e){}},5000);
  return{onLoad,tick,KINDS,nests:()=>nests}
})();
window.URZEIT=URZEIT;
})();
