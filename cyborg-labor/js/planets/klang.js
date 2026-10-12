/* =====================================================================
   CYBORG-LABOR · planets/klang.js · Klang-Planet
   Alles klingt: Harfenbäume summen im Wind, Glockenblumen läuten, wenn
   man vorbeigeht, Kristalle singen, Trommelpilze federn. Besonderheiten:
   · Klangsteine: acht farbige Steine im Kreis beim Dorf. Wer darüber
     läuft, spielt eine Tonleiter.
   · Liedtafeln: vier Tafeln auf dem Planeten zeigen je eine Melodie in
     Farben. Wer sie auf den Klangsteinen nachspielt, bekommt ein Geschenk.
     Sind alle vier gespielt, gibt es ein Konzert auf dem Dorfplatz.
   ===================================================================== */
(function(){
const ID='klang';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,butterfly,fin2,spiralShell,crystal,cloud}=NH;
const V=THREE.Vector3;
const NOTE=['#FF6F91','#FF9E6E','#FFD35C','#7CC46A','#56C6B6','#6E8EF0','#8E6BD1','#E8A0E8'];const SEMI=[0,2,4,5,7,9,11,12];const NN=['C','D','E','F','G','A','H','C\''];
const play=(i,v)=>SND.play('bell',{rate:Math.pow(2,SEMI[i]/12)*.9,vol:v??.7});

/* ================= Natur ================= */
N('harfenbaum',{r:.4,h:4.2,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const wm=m.c('#C8945A',{rim:.4,gloss:.4});const h=RR(rnd,3,4);
  /* Harfenrahmen: Säule + geschwungener Hals */P(g,G.tu([[0,0,0],[.1,h*.5,0],[0,h,0]],.14,.1),wm);P(g,G.tu([[0,h,0],[.8,h+.3,0],[1.6,h-.2,0],[1.9,h*.55,0]],.1,.08),wm);P(g,G.tu([[0,.6,0],[1,.8,0],[1.9,h*.55,0]],.08,.08),wm);
  for(let i=0;i<8;i++){const x=.2+i*.2;const top=h-.05+Math.sin(x/1.9*PI)*.3-(x>1.5?(x-1.5)*1.3:0);const bot=.62+x*.1;P(g,G.cy(.008,.008,top-bot),m.c(NOTE[i],{gloss:1}),[x,(top+bot)/2,0])}
  cloud(g,m,'#9CD27A',-.2,h+.4,0,.8,rnd()*9);cloud(g,m,'#7CC46A',.9,h+.5,.1,.6,rnd()*9)});
N('glockenblume',{r:.3,h:1.4,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const col=o.color||['#8E6BD1','#6E8EF0','#E8A0E8','#56C6B6'][Math.floor(rnd()*4)];P(g,G.tu([[0,0,0],[.1,.8,0],[.35,1.25,0]],.025,.02),m.c('#6CBF5A'));
  const bells=[];for(let i=0;i<3;i++){const q=grp(g,[.1+i*.13,1.25-i*.28,0],[0,0,.5]);P(q,G.la([[0,0],[.14,-.02],[.16,-.2],[.2,-.28],[0,-.26]],Q(12)),m.c(col,{rim:.6}),[0,0,0]);P(q,G.s(.04),m.c('#FFE3A0'),[0,-.24,0]);bells.push(q)}
  P(g,flatLeaf(leafShape(.5,.18),.02,.2),m.c('#7CC46A'),[0,.05,0],[0,1,1.2]);const ph=rnd()*9;g.userData.tick=t=>{bells.forEach((b,i)=>b.rotation.z=.5+Math.sin(t*2+ph+i)*.12)}});
N('trommelpilz',{r:.7,h:1.4,size:'big',planet:ID},(g,m,o,rnd)=>{const col=['#FF6F91','#FFD35C','#56C6B6','#FF9E6E'][Math.floor(rnd()*4)];const s=RR(rnd,.8,1.2);P(g,G.cy(.14*s,.2*s,1*s),m.c('#FFF1DC'),[0,.5*s,0]);
  const cap=grp(g,[0,1*s,0]);P(cap,G.cy(.7*s,.66*s,.3*s,Q(20)),m.c(col,{rim:.5}),[0,.15*s,0]);P(cap,G.cy(.66*s,.66*s,.02,Q(20)),m.c('#FFF6E4'),[0,.31*s,0]);for(let i=0;i<10;i++){const a=i/10*TAU;P(cap,G.tu([[Math.cos(a)*.68*s,.3*s,Math.sin(a)*.68*s],[Math.cos(a+.3)*.7*s,0,Math.sin(a+.3)*.7*s]],.012,.012),m.c('#FFFFFF'))}
  both(k=>P(g,G.cy(.02,.03,.6),m.c('#C8945A'),[k*.3*s,1.45*s,.2*s],[.4,0,k*.5]))});
N('singkristall',{r:.5,h:1.8,size:'big',planet:ID},(g,m,o,rnd)=>{const col=['#C6A9FF','#8EE8F0','#FFB8E0'][Math.floor(rnd()*3)];for(let i=0;i<5;i++){const a=rnd()*TAU,r=rnd()*.3;crystal(g,m,[Math.cos(a)*r,0,Math.sin(a)*r],[Math.cos(a)*.3,1,Math.sin(a)*.3],RR(rnd,.1,.2),RR(rnd,.6,1.6),col)}
  const gl=markGlow(g,P(g,G.s(.2),m.glow(col,1.2),[0,.5,0]));const ph=rnd()*9;g.userData.tick=t=>{const k=.6+Math.sin(t*1.5+ph)*.4;if(gl)gl.scale.setScalar(k)}});
N('orgelfels',{r:1,h:3.6,size:'big',planet:ID},(g,m,o,rnd)=>{const sm=m.c('#B8A8C8',{rim:.4}),dm=m.c('#6E5E7E');const n=6+Math.floor(rnd()*4);for(let i=0;i<n;i++){const x=(i-n/2)*.34,h=1.2+Math.sin(i/(n-1)*PI)*2.2+rnd()*.3;P(g,G.cy(.15,.16,h,Q(10)),sm,[x,h/2,0]);P(g,G.bx(.14,.1,.04,.02),dm,[x,h*.3,.15])}P(g,G.bx(n*.36,.3,.5,.08),m.c('#9A8AAE'),[-.17,.15,0])});
N('notenbusch',{r:.5,h:1.1,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const sd=rnd()*9;cloud(g,m,'#8FD06B',0,.5,0,.5,sd);cloud(g,m,'#7CC46A',.3,.4,.2,.36,sd+1);for(let i=0;i<5;i++){const a=i/5*TAU,y=.4+(i%2)*.3;const q=grp(g,[Math.cos(a)*.45,y,Math.sin(a)*.45]);P(q,G.s(.07),m.c('#2E2A3E',{gloss:1}),[0,0,0],null,[1.2,.9,.9]);P(q,G.cy(.012,.012,.2),m.c('#2E2A3E'),[.07,.1,0])}});
N('stimmgabelbaum',{r:.3,h:4,size:'big',planet:ID},(g,m,o,rnd)=>{const sm=m.c('#D8E0EC',{gloss:1.4,rim:.6});const h=RR(rnd,2.8,3.8);P(g,G.cy(.08,.12,h*.45),sm,[0,h*.22,0]);P(g,G.tu([[-.35,h,0],[-.35,h*.5,0],[0,h*.42,0],[.35,h*.5,0],[.35,h,0]],.07,.07),sm);P(g,G.s(.14),m.c('#FFD35C'),[0,h*.42,0]);P(g,G.cy(.3,.35,.1),m.c('#8A7A9A'),[0,.05,0])});
Object.assign(NH.ROCK,{[ID]:['#C8B8D8','#A898B8','#9CD27A']});

/* ================= Biome ================= */
const BI={
  harfenwald:{n:'Harfenwald',g:['#98C890','#88BC80'],cliff:'#8A7A9A',pat:'moos',grass:'#90C488',grassD:1,trees:[['harfenbaum',3],['stimmgabelbaum',.6]],treeD:1.3,
    deco:[['glockenblume',4],['farn',3,{color:'#88BC80'}],['notenbusch',1]],decoD:6,rocks:[['findling',.3]],rockD:.3,litter:[['resonanzholz',1],['ast',.6]]},
  glockenwiese:{n:'Glockenwiese',g:['#B8DCA0','#A8D090'],cliff:'#9A8AAE',pat:'gras',grass:'#B0D898',grassD:1,trees:[['harfenbaum',.6],['notenbusch',1]],treeD:.4,
    deco:[['glockenblume',8],['blume',3],['klee',2]],decoD:7,rocks:[['kiesel',1]],rockD:.3,litter:[['glockenstaub',1.2],['beeren',.5]]},
  trommelheide:{n:'Trommelheide',g:['#D8C898','#CCBC88'],cliff:'#A8906E',pat:'gras',grass:'#D0C090',grassD:.7,trees:[['trommelpilz',1.5],['stimmgabelbaum',.4]],treeD:.6,
    deco:[['grasbuesche',4],['notenbusch',1.2],['pilzgruppe',1]],decoD:4,rocks:[['kiesel',1],['findling',.3]],rockD:.4,litter:[['resonanzholz',.6]]},
  kristallklippen:{n:'Kristallklippen',g:['#C8C0E0','#B8B0D4'],cliff:'#8A7A9A',pat:'staub',grass:null,grassD:0,trees:[['singkristall',1.2]],treeD:.5,
    deco:[['kiesel',3],['singkristall',.4]],decoD:2,rocks:[['orgelfels',.3],['findling',.6]],rockD:.7,litter:[['klangkristall',1.2]]},
  orgelschlucht:{n:'Orgelschlucht',g:['#C0B0C8','#B0A0B8'],cliff:'#7A6A8A',pat:'staub',grass:'#B8B8A8',grassD:.3,trees:[['orgelfels',.8]],treeD:.4,deco:[['kiesel',3],['glockenblume',1]],decoD:2,
    rocks:[['orgelfels',.6],['findling',.8]],rockD:.9,litter:[['klangkristall',.6],['stein_klein',1]]},
  echoufer:{n:'Echo-Ufer',g:['#A8C8C0','#98BCB0'],cliff:'#6E7A88',pat:'sand',grass:'#A0C4B8',grassD:.5,trees:[['stimmgabelbaum',.4]],treeD:.2,deco:[['schilf',3],['glockenblume',1.5]],decoD:3,
    rocks:[['kiesel',1],['singkristall',.2]],rockD:.4,litter:[['muschel',1],['glockenstaub',.4]]}};

/* ================= Sammelsachen ================= */
IT('resonanzholz',itMeta('Resonanzholz','klang','material',50),(g,m)=>{P(g,G.bx(.5,.06,.16,.02),m.c('#E8B878',{rim:.4}),[0,.05,0],[0,.4,0]);for(let i=0;i<4;i++)P(g,G.bx(.5,.005,.01,0),m.c('#C8945A'),[0,.085,-.05+i*.035],[0,.4,0]).userData.noOutline=true});
IT('glockenstaub',itMeta('Glockenstaub','klang','material',80),(g,m)=>{range(7,(t,i)=>P(g,G.s(.05),m.glow(NOTE[i],1.4),[Math.cos(i*2.4)*.14,.08+t*.2,Math.sin(i*2.4)*.14]))});
IT('klangkristall',itMeta('Klangkristall','klang','material',150),(g,m)=>{crystal(g,m,[0,0,0],[0,1,0],.1,.5,'#C6A9FF');crystal(g,m,[.08,0,.04],[.4,1,0],.06,.3,'#8EE8F0')});

/* ================= Fische ================= */
F('trompetenfisch',fishMeta('Trompetenfisch','klang','meer','L','tag',2,640,'Ich hab einen Trompetenfisch gefangen! Tröt! Tröööt!','Trompetenfische haben eine lange Röhrenschnauze. Sie verstecken sich senkrecht zwischen Korallen und saugen kleine Fische blitzschnell ein.'),
  (g,m)=>{const f=fishT(g,m,{id:'trompetenfisch',H:.1,L:1,W:.5,back:'#FFD35C',belly:'#FFF6D8',tail:'round',dorsal:'std',pat:(x,w,h,r)=>FT.bands(x,w,h,'#E8A04A',[.25,.4,.55,.7],5)});P(g,G.co(.12,.2,12,1,true),m.c('#E8C87A',{gloss:1.3}),[0,0,f.nz+.1],[-PI/2,0,0])});
F('glockenqualle',fishMeta('Glockenqualle','klang','meer','M','nacht',2,520,'Ich hab eine Glockenqualle gefangen! Sie macht leise „ding“, wenn sie pulsiert.','Quallen schwimmen durch Rückstoss: Sie ziehen ihren Schirm zusammen und pressen Wasser heraus. So bewegen sie sich schon seit 500 Millionen Jahren.'),
  (g,m)=>{P(g,G.la([[0,.26],[.2,.22],[.26,.05],[.3,-.04],[0,-.02]],Q(14)),m.c('#E8A0E8',{opacity:.85,rim:1}),[0,0,0]);range(6,(t,i)=>{const a=i/6*TAU;P(g,G.tu([[Math.cos(a)*.2,-.04,Math.sin(a)*.2],[Math.cos(a)*.24,-.26,Math.sin(a)*.24],[Math.cos(a)*.18,-.46,Math.sin(a)*.18]],.015,.006),m.c('#FFC8F0'))});P(g,G.s(.05),m.glow('#FFE3A0',1.6),[0,-.08,0])});
F('bassbarsch',fishMeta('Bass-Barsch','klang','teich','L','immer',2,720,'Ich hab einen Bass-Barsch gefangen! Er brummt so tief, dass mein Bauch vibriert.','Viele Fische machen Geräusche: Umberfische trommeln mit ihrer Schwimmblase so laut, dass man sie über Wasser hört.'),
  (g,m)=>fishT(g,m,{id:'bassbarsch',H:.26,L:.9,back:'#4E6E5E',belly:'#E8F0D8',tail:'fork',dorsal:'spiky',pat:(x,w,h,r)=>FT.bands(x,w,h,'#2E4E3E',[.3,.45,.6,.75],10)}));
F('floetenaal',fishMeta('Flöten-Aal','klang','teich','M','nacht',2,480,'Ich hab einen Flöten-Aal gefangen! Er hat Löcher wie eine Blockflöte. Wo genau pustet man?','Röhrenaale leben in Kolonien im Sand und strecken nur den Kopf heraus. Bei Gefahr verschwinden alle gleichzeitig in ihren Röhren.'),
  (g,m)=>fishT(g,m,{id:'floetenaal',H:.1,L:1.05,W:.5,back:'#C8945A',belly:'#F2E0C0',tail:'none',dorsal:'long',pat:(x,w,h,r)=>{x.fillStyle='#4E3A30';for(let i=0;i<6;i++){x.beginPath();x.arc(w*.5,h*(.2+i*.1),4,0,TAU);x.fill()}}}));
F('harfenrochen',fishMeta('Harfen-Rochen','klang','meer','XL','immer',3,2600,'Ich hab einen Harfen-Rochen gefangen! Über seinen Rücken laufen Saiten.','Rochen sind flache Verwandte der Haie. Manche Arten können mit speziellen Organen elektrische Felder spüren – und sogar erzeugen.'),
  (g,m)=>{P(g,G.s(.5),m.c('#6E8EF0',{rim:.6}),[0,0,0],null,[1.3,.18,1]);both(s=>P(g,G.co(.2,.3,3),m.c('#6E8EF0'),[s*.6,0,-.05],[0,0,s*PI/2],[1,1,.15]));P(g,G.tu([[0,0,-.4],[0,.02,-.8],[0,.04,-1.1]],.03,.01),m.c('#4E6ED0'));
    for(let i=0;i<6;i++)P(g,G.cy(.006,.006,.7),m.c(NOTE[i],{gloss:1}),[-.25+i*.1,.1,0],[PI/2,0,0]);eye(g,m,[.12,.1,.34],.04,[.4,.6,.6]);eye(g,m,[-.12,.1,.34],.04,[-.4,.6,.6])});

/* ================= Insekten ================= */
B('singzikade',bugMeta('Singzikade','klang','baum','tag',1,180,'Ich hab eine Singzikade gefangen! Sie hat mir gerade ein ganzes Lied vorgesungen.','Zikaden gehören zu den lautesten Insekten. Ihr Gesang entsteht in trommelartigen Organen am Hinterleib und kann über 100 Dezibel laut sein.'),
  (g,m)=>{const bm=m.c('#6E8A5E',{gloss:.8});P(g,G.ca(.1,.3),bm,[0,.18,0],[PI/2,0,0]);P(g,G.s(.12),bm,[0,.2,.24]);bugFace(g,m,[0,.2,.32],.1,.6,{er:.4});wingPair(g,m,m.c('#E8F4FF',{opacity:.6,rim:1}),leafShape(.4,.14),[0,.28,.05],.15,.1,-.1,.02)});
B('trommelkaefer',bugMeta('Trommelkäfer','klang','boden','immer',1,140,'Ich hab einen Trommelkäfer gefangen! Er klopft den Takt mit dem Hinterteil.','Klopfkäfer klopfen mit dem Kopf gegen Holz, um sich zu verständigen. Andere Käfer zirpen, indem sie Körperteile aneinanderreiben.'),
  (g,m)=>{P(g,G.cy(.22,.22,.18,Q(16)),m.c('#FF6F91',{gloss:1}),[0,.14,0]);P(g,G.cy(.21,.21,.02,Q(16)),m.c('#FFF6E4'),[0,.24,0]);P(g,G.s(.1),m.c('#2E2A3E'),[0,.14,.22]);bugFace(g,m,[0,.15,.3],.08,.5);legs(g,m.c('#2E2A3E'),[[.12,.15,.1],[0,.17,0],[-.12,.15,-.1]],.25)});
B('floetenfalter',bugMeta('Flötenfalter','klang','luft','tag',2,480,'Ich hab einen Flötenfalter gefangen! Wenn er flattert, pfeift es leise.','Manche Nachtfalter können Ultraschall-Klicks erzeugen und damit Fledermäuse verwirren, die sie mit ihrem Echo-Ortungssystem jagen.'),
  (g,m)=>butterfly(g,m,'floetenfalter','#6E8EF0','#56C6B6','#2E2A3E'));
B('geigenschrecke',bugMeta('Geigenschrecke','klang','boden','nacht',2,420,'Ich hab eine Geigenschrecke gefangen! Ihre Beine sind Geigenbögen.','Heuschrecken und Grillen „geigen“: Sie streichen eine Reihe winziger Zähnchen am Bein über eine Kante am Flügel – wie ein Bogen über Saiten.'),
  (g,m)=>{const bm=m.c('#C8945A',{rim:.6});P(g,G.ca(.1,.45),bm,[0,.22,0],[PI/2,0,0]);P(g,G.s(.12),bm,[0,.26,.3]);bugFace(g,m,[0,.26,.4],.1,.5);both(s=>{P(g,G.tu([[s*.1,.2,-.05],[s*.22,.5,-.2],[s*.2,.08,-.4]],.03,.02),bm);P(g,G.cy(.006,.006,.5),m.c('#FFF6E4'),[s*.2,.34,-.2],[.9,0,0])});feelers(g,bm,bm,[.04,.34,.4],.5,.3,.3)});
B('brummhummel',bugMeta('Brummhummel','klang','blume','tag',3,1100,'Ich hab eine Brummhummel gefangen! Sie brummt genau auf dem Ton A.','Das Summen von Bienen und Hummeln entsteht durch die schnellen Flügelschläge. Je schneller die Flügel schlagen, desto höher der Ton.'),
  (g,m)=>{P(g,G.s(.26),m.c('#8E6BD1',{rim:.9,rimColor:'#ffe8a0'}),[0,.3,-.05],null,[1,.95,1.2]);P(g,G.to(.24,.08),m.c('#FFD35C',{rim:.8}),[0,.3,.02]);P(g,G.s(.13),m.c('#2E2A3E'),[0,.33,.26]);bugFace(g,m,[0,.33,.34],.1,.6);wingPair(g,m,m.c('#F2FAFF',{opacity:.6}),leafShape(.3,.12),[0,.5,0],.6,.3,.3,.02)});

/* ================= Fundstücke ================= */
REL('stimmgabel',relMeta('Goldene Stimmgabel','klang','schatz',2,900,'Eine goldene Stimmgabel! Sie summt ein perfektes A.','Stimmgabeln schwingen immer auf demselben Ton. Die meisten sind auf 440 Hertz gestimmt – den Ton A, nach dem sich Orchester richten.'),
  (g,m)=>{const gm=m.c('#E8C87A',{gloss:1.4,rim:.6});P(g,G.cy(.03,.03,.4),gm,[0,.2,0]);P(g,G.tu([[-.12,.8,0],[-.12,.45,0],[0,.4,0],[.12,.45,0],[.12,.8,0]],.03,.03),gm);P(g,G.s(.06),gm,[0,0,0])});
REL('alte_laute',relMeta('Alte Laute','klang','kunst',3,2100,'Eine alte Laute! Eine Saite fehlt, aber sie klingt trotzdem wunderschön.','Die Laute war im Mittelalter so beliebt wie heute die Gitarre. Ihr bauchiger Körper besteht aus vielen dünnen, gebogenen Holzspänen.'),
  (g,m)=>{const q=grp(g,[0,.15,0],[-1.3,0,.3]);P(q,G.s(.3),m.c('#C8945A',{gloss:.6}),[0,0,0],null,[1,1.3,.5]);P(q,G.bx(.1,.6,.05,.02),m.c('#6E4A30'),[0,.6,.05]);P(q,G.bx(.14,.16,.06,.02),m.c('#6E4A30'),[0,.95,.03],[-.5,0,0]);P(q,G.cy(.08,.08,.02),m.c('#4E3A30'),[0,.05,.15],[PI/2,0,0]);for(let i=0;i<4;i++)P(q,G.cy(.004,.004,.9),m.c('#F2EAD8'),[-.03+i*.02,.4,.16])});
REL('notenrolle',relMeta('Lochstreifen-Notenrolle','klang','kunst',2,760,'Eine Notenrolle für ein selbstspielendes Klavier! Die Löcher sind die Noten.','Selbstspielende Klaviere lasen Musik von Papierrollen mit Löchern. Durch jedes Loch strömte Luft und löste einen Ton aus – eine frühe Form von Programmierung.'),
  (g,m)=>{P(g,G.cy(.14,.14,.8),m.c('#F2EAD8'),[0,.14,0],[0,0,PI/2]);P(g,G.bx(.7,.005,.5,0),m.c('#F2EAD8'),[0,.01,.35]);for(let i=0;i<14;i++)P(g,G.bx(.04,.006,.02,0),m.c('#2E2A3E'),[-.3+(i*.37%1)*.6,.015,.15+(i%7)*.06]).userData.noOutline=true;both(s=>P(g,G.cy(.05,.05,.1),m.c('#8A5E42'),[s*.44,.14,0],[0,0,PI/2]))});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  nachtigall:{n:'Nachtigall',planet:ID,biomes:['harfenwald','glockenwiese'],fly:true,count:4,size:.4,speed:1.3,night:true,voice:['tüüü-lü','tschuk','fi-fi-fi'],pitch:760,likes:['beeren','glockenstaub'],product:'glockenstaub',names:['Melodie','Triller','Sopranina','Koloratur','Lied'],
    fact:'Nachtigallen singen über 200 verschiedene Strophen. Sie singen oft nachts, weil ihr Lied dann weiter trägt und weniger andere Vögel dazwischen zwitschern.',a:{col:'#B8946E',belly:'#F2E6D0',body:[.24,.24,.32],head:{r:.19,p:[0,.5,.26]},snout:{type:'beak',col:'#8A6A4E',len:.45},ears:{type:'none'},legs:{n:2,len:.1,r:.025,col:'#C89A7A'},tail:{type:'fan',col:'#A0704C'},wings:{col:'#8A6A4E'}}},
  trommelfrosch:{n:'Trommelfrosch',planet:ID,biomes:['echoufer','glockenwiese','trommelheide'],nearWater:true,count:4,size:.6,speed:1,gait:'hop',voice:['bum','quabum','bumm-bumm'],pitch:180,likes:['beeren','singzikade'],product:'resonanzholz',names:['Paukerich','Bummbumm','Basso','Kesselchen','Schlagzeugine'],
    fact:'Frösche haben Schallblasen, die wie Lautsprecher wirken. Manche Froscharten sind so laut, dass man sie kilometerweit hört.',a:{col:'#7CC46A',belly:'#F2F0C8',body:[.4,.26,.38],head:{r:.3,p:[0,.42,.24],sc:[1.2,.8,1]},snout:{type:'wide'},eyes:{r:.1,x:.5,y:.55},ears:{type:'none'},legs:{n:4,len:.1,r:.08,foot:'#5E9A4E'},tail:{type:'none'},spots:{col:'#FF6F91',n:5},gait:'hop'}},
  harfenhirsch:{n:'Harfenhirsch',planet:ID,biomes:['harfenwald','kristallklippen'],count:2,size:1.5,speed:.9,shy:true,voice:['rööö','brrr','plink'],pitch:160,likes:['klangkristall','beeren'],product:'resonanzholz',names:['Arpeggio','Lyra','Saitenspiel','Harfnix','Geweihklang'],
    fact:'Hirschgeweihe wachsen jedes Jahr neu und fallen im Winter ab. Sie gehören zum am schnellsten wachsenden Gewebe, das es bei Säugetieren gibt.',a:{col:'#C8945A',belly:'#F2E0C0',body:[.36,.34,.56],head:{r:.24,p:[0,.92,.56]},snout:{type:'muzzle',col:'#F2E0C0',nose:'#4E3A30'},ears:{type:'pointy',len:.4},legs:{n:4,len:.36,r:.06,foot:'#4E3A30'},tail:{type:'puff',col:'#FFFFFF',r:.1},antlers:'#E8C87A',spots:{col:'#FFF6E4',n:8,s:.6}}},
  glockenschnecke:{n:'Glockenschnecke',planet:ID,biomes:['glockenwiese','echoufer','harfenwald'],count:3,size:1.1,speed:.15,voice:['ding','dong','dingeling'],pitch:520,likes:['glockenstaub','beeren'],product:'glockenstaub',names:['Bimmel','Dingdong','Klingeline','Läutwerk','Glocki'],
    fact:'Schnecken haben eine Raspelzunge mit tausenden winzigen Zähnchen. Damit schaben sie Algen und Pflanzen ab – man kann es manchmal richtig hören.',a:{col:'#E8C8E8',belly:'#F8E8F8',body:[.3,.18,.52],by:.18,head:{r:.18,p:[0,.3,.5]},snout:{type:'none'},ears:{type:'none'},legs:{n:0},tail:{type:'none'},stalkEyes:true,extra:{snailShell:'#FFD35C',glow:'#FFE3A0'}}},
  bassbaer:{n:'Bass-Bär',planet:ID,biomes:['trommelheide','orgelschlucht','harfenwald'],count:2,size:1.6,speed:.6,voice:['brummm','hmmmm','bumm'],pitch:80,likes:['honig','beeren','resonanzholz'],product:'resonanzholz',names:['Kontrabass','Tuba','Brummbär','Tiefton','Bass-Berta'],
    fact:'Bären brummen, wenn sie zufrieden sind. Das tiefe Brummen ist so leise, dass man es oft eher spürt als hört.',a:{col:'#8A6A5A',belly:'#C8A890',body:[.46,.42,.56],head:{r:.3,p:[0,.8,.52]},snout:{type:'muzzle',col:'#C8A890',nose:'#2E2A3E'},ears:{type:'round',x:.62,y:.7},legs:{n:4,len:.22,r:.1,foot:'#6E4A3A'},tail:{type:'nub'},scarf:'#8E6BD1'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','notenhut','Noten-Hut',620,'#2E2A3E',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.cy(r*.9,r*.9,r*.05),M.c(col),[0,0,0]);P(q,G.cy(r*.55,r*.6,r*.5),M.c(col),[0,r*.25,0]);P(q,G.cy(r*.61,r*.61,r*.1),M.c('#FFD35C'),[0,r*.1,0]);const nq=grp(q,[r*.5,r*.4,r*.2]);P(nq,G.s(r*.12),M.c('#FFD35C'),[0,0,0],null,[1.2,.9,.9]);P(nq,G.cy(r*.02,r*.02,r*.4),M.c('#FFD35C'),[r*.1,r*.2,0])});
def('neck','fliege_noten','Konzert-Fliege',380,'#C83A3A',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y-r*.05,r*.62]);both(s=>P(q,G.co(r*.16,r*.28,3),M.c(col),[s*r*.14,0,0],[0,0,s*PI/2]));P(q,G.s(r*.06),M.c(shade(col,.8)),[0,0,r*.02])});
def('top','frack','Dirigenten-Frack',1100,'#2E2A3E',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.8,r*.86,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);P(q,G.bx(r*.4,r*.8,r*.04,r*.02),M.c('#FFFFFF'),[0,-r*.4,r*.8]);both(s=>P(q,G.bx(r*.3,r*.9,r*.04,r*.02),M.c(col),[s*r*.35,-r*1.1,-r*.6],[.25,0,s*.2]))});

/* ================= Bau-Familie: Instrumenten-Häuser ================= */
function klanghaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.45:1;const style=plan.style||A.pick(r,['trommel','grammophon','glocke']);const body=new THREE.Group();g.add(body);const C=c=>cozy({color:c});
  const R0=(1.2+r()*.25)*big;let Hw=(1.8+r()*.3)*big,top=0,doorZ=-R0*1.01;const cc=A.pick(r,NOTE);
  if(style==='trommel'){P(body,G.cy(R0,R0,Hw,Q(24)),C(cc),[0,Hw/2,0]);both(s=>P(body,G.to(R0*1.01,.08),C('#FFF6E4'),[0,s>0?Hw-.04:.04,0],[PI/2,0,0]));
    for(let i=0;i<12;i++){const a=i/12*TAU;P(body,G.cy(.025,.025,Hw*1.05),C('#E8C87A'),[Math.cos(a)*R0*1.01,Hw/2,Math.sin(a)*R0*1.01],[Math.sin(a)*.25*(i%2?1:-1),0,-Math.cos(a)*.25*(i%2?1:-1)])}
    P(body,G.cy(R0*1.02,R0*1.02,.06,Q(24)),C('#FFF6E4'),[0,Hw+.03,0]);/* Trommelstöcke als Dachschmuck */both(s=>{P(body,G.cy(.05,.06,1.6*big),C('#C8945A'),[s*.4,Hw+.5,0],[0,0,s*.6]);P(body,G.s(.13),C('#FFFFFF'),[s*1.05,Hw+.95,0])});top=Hw+1.2}
  else if(style==='grammophon'){P(body,G.bx(R0*1.7,Hw,R0*1.6,.15),C(A.pick(r,['#C8945A','#8A5E42','#E8B878'])),[0,Hw/2,0]);P(body,G.cy(R0*.9,R0*.9,.1,Q(24)),C('#2E2A3E'),[0,Hw+.05,0]);P(body,G.cy(R0*.2,R0*.2,.12),C('#E8C87A'),[0,Hw+.08,0]);
    /* Trichter */const hq=grp(body,[R0*.4,Hw+.3,.2],[0,0,-.3]);P(hq,G.cy(.08,.1,1*big),C('#E8C87A'),[0,.5*big,0]);P(hq,G.la([[.1,0],[.25,.4],[.6,.9],[1.2,1.3],[1.3,1.35],[0,1.35]].map(([a,b])=>[a*big,b*big]),Q(20)),cozy({color:cc,gloss:.8}),[0,1*big,0]);top=Hw+2.8*big;doorZ=-R0*.81}
  else{P(body,G.la([[0,0],[R0*1.1,0],[R0*1.15,.15],[R0,.4],[R0*.8,Hw*.9],[R0*.55,Hw*1.25],[0,Hw*1.32]],Q(24)),cozy({color:A.pick(r,['#E8C87A','#D8B45A','#C8D0DC']),gloss:1}),[0,0,0]);P(body,G.to(R0*1.08,.06),C(cc),[0,.3,0],[PI/2,0,0]);
    P(body,G.to(.2,.05),C('#8A6A4E'),[0,Hw*1.36,0]);const cl=grp(body,[0,Hw*.2,0]);body.userData.clap=cl;top=Hw*1.45}
  const dr=A.archDoor(A.pick(r,['#8A5E42','#2E2A3E','#C8566E']),'#4E3A30');dr.position.set(0,0,doorZ);dr.rotation.y=PI;body.add(dr);
  for(const sx of[-1,1]){const w=A.roundWindow('#FFF6E4',.18,false);w.position.set(sx*R0*.55,Math.min(1.4,Hw*.55),doorZ+(style==='glocke'?.25:.04));w.rotation.y=PI;body.add(w)}
  /* Notenlinien-Girlande */for(let i=0;i<5;i++){const a=PI*1.25+i*.14;P(body,G.s(.08),C('#2E2A3E'),[Math.cos(a)*R0*1.02,Hw*.85+Math.sin(i*1.7)*.12,Math.sin(a)*R0*1.02],null,[1.2,.9,.9])}
  addOutlines(body);const Rw=style==='grammophon'?R0*.9:R0;return{g,R:Rw+.8,top,door:[0,doorZ],walls:[new THREE.Box3(new V(-Rw,0,-Rw),new V(Rw,top,Rw))],style:'klanghaus-'+style}}

/* ================= Möbel ================= */
furn('grammophon',{n:'Grammophon',cat:'musik',price:1600,planet:ID,size:[1,1],h:1.3,b:(g,m)=>{P(g,G.bx(.5,.3,.5,.04),m.c('#8A5E42'),[0,.15,0]);P(g,G.cy(.2,.2,.02),m.c('#2E2A3E'),[0,.31,0]);P(g,G.cy(.02,.03,.4),m.c('#E8C87A'),[.18,.5,.18],[0,0,-.3]);P(g,G.la([[.03,0],[.08,.15],[.2,.3],[.36,.42],[0,.42]],Q(16)),m.c('#E8C87A',{gloss:1.3}),[.3,.7,.3],[0,0,-.6])}});
furn('harfe',{n:'Kleine Harfe',cat:'musik',price:1900,planet:ID,size:[1,1],h:1.5,b:(g,m)=>{const wm=m.c('#C8945A',{gloss:.4});P(g,G.tu([[0,0,0],[0,1.3,0]],.05,.04),wm);P(g,G.tu([[0,1.3,0],[.4,1.4,0],[.8,1.1,0],[.8,.3,0]],.04,.04),wm);P(g,G.tu([[0,.2,0],[.8,.3,0]],.04,.04),wm);for(let i=0;i<7;i++)P(g,G.cy(.004,.004,.9-i*.08),m.c(NOTE[i]),[.1+i*.1,.7,0])}});
furn('trommelhocker',{n:'Trommel-Hocker',cat:'sitz',price:720,planet:ID,size:[1,1],h:.5,b:(g,m)=>{P(g,G.cy(.3,.3,.45,Q(20)),m.c('#FF6F91'),[0,.23,0]);P(g,G.cy(.31,.31,.03,Q(20)),m.c('#FFF6E4'),[0,.46,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(g,G.cy(.01,.01,.46),m.c('#E8C87A'),[Math.cos(a)*.31,.23,Math.sin(a)*.31],[Math.sin(a)*.3*(i%2?1:-1),0,-Math.cos(a)*.3*(i%2?1:-1)])}}});
furn('kristall_klangspiel',{n:'Kristall-Klangspiel',cat:'licht',price:1400,planet:ID,size:[1,1],h:1.4,b:(g,m)=>{P(g,G.cy(.22,.26,.06),m.c('#8A7A9A'),[0,.03,0]);for(let i=0;i<5;i++){const a=i/5*TAU;crystal(g,m,[Math.cos(a)*.12,.05,Math.sin(a)*.12],[Math.cos(a)*.2,1,Math.sin(a)*.2],.05,.5+i*.12,NOTE[i+3])}P(g,G.s(.08),m.glow('#E8DCFF',1.6),[0,.4,0]);g.userData.light={p:[0,.5,0],c:'#E8DCFF',i:.9}}});

/* ================= Sprache: Notenzeichen ================= */
function noteGlyph(x,s,r){const k=Math.floor(r()*4);x.beginPath();for(let i=0;i<3;i++){x.moveTo(-s*.4,-s*.2+i*s*.2);x.lineTo(s*.4,-s*.2+i*s*.2)}x.stroke();x.beginPath();
  if(k===0){x.ellipse(-s*.1,s*.15,s*.1,s*.07,-.4,0,TAU);x.fill();x.moveTo(0,s*.12);x.lineTo(0,-s*.35)}else if(k===1){for(const dx of[-.18,.14]){x.ellipse(dx*s,s*.18,s*.08,s*.06,-.4,0,TAU)}x.fill();x.moveTo(-s*.1,s*.15);x.lineTo(-s*.1,-s*.3);x.lineTo(s*.22,-s*.36);x.lineTo(s*.22,s*.12)}
  else if(k===2){x.arc(0,0,s*.12,0,TAU);x.moveTo(s*.2,-s*.35);x.quadraticCurveTo(-s*.3,-s*.1,s*.1,s*.35)}else{x.moveTo(-s*.2,-s*.3);x.lineTo(s*.2,0);x.lineTo(-s*.2,s*.3)}x.stroke()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Klang-Planet',base:'kompost',R:130,R0:44,sea:-.3,music:'town',sky:['#C8B8FF','#FFE8F4'],fog:'#EEE4FF',water:'#8E7AD8',deep:'#4E3A98',step:1.15,shop:ID,
    desc:'Harfenbäume, Glockenblumen, singende Kristalle. Spiel auf den Klangsteinen die Melodien der Liedtafeln nach.',weather:'blueten',orbit:[159,.4],size:1,col:['#B8DCA0','#8E7AD8'],moons:2,
    park:'glockenwiese',parkPond:true,phone:['#D8CCFF','#FFD8EC'],stones:['kiesel','klangkristall','stein_klein'],plazaTree:'harfenbaum',path:'#E0D8EC',
    space:{deep:'#4E3A98',water:'#8E7AD8',shore:'#E0D8EC',land:'#B8DCA0',land2:'#98C890',high:'#C8C0E0',cap:'#FFE8F4',atmo:'#C8B8FF',cloud:.45,sea:.38,capA:.5,freq:3},
    mac:{oc:-.15,m:.28,isl:1},climate:{hot:'trommelheide',wet:'echoufer',cold:'kristallklippen'},peak:'orgelschlucht',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.2,4)*2+.8;/* Klangwellen: sanfte Sinus-Dünen, deren Wellenlänge sich über den Planeten ändert */const f=1.2+N(q.x*.2,q.y*.2,q.z*.2)*.6;h+=Math.sin((q.x+q.z)*f)*.45*sstep(-.2,.3,N2(q.x*.4,q.y*.4,q.z*.4));return h},
    biome({T,M,h,sea,low,nearPond,p}){if(nearPond||(low&&h<sea+.6))return'echoufer';if(h>sea+4.6)return'orgelschlucht';if(h>sea+3.4||T<-.3)return'kristallklippen';if(M>.25)return'harfenwald';if(T>.2)return'trommelheide';return'glockenwiese'},
    onLoad:W=>KLANG.onLoad(W),tick:(dt,t,W,me)=>KLANG.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Konzert-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Echo-Weiher',lat:48,lon:130,r:.1,pond:true},{id:'teich2',n:'Stimmsee',lat:34,lon:230,r:.12,pond:true},{id:'see',n:'Resonanzbucht',lat:-10,lon:40,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Glücksspiel-Orgel',mode:'Konzertkleider',praxis:'Stimmband-Praxis',museum:'Instrumenten-Museum',shop:'Notenladen',studio:'Klangmal-Atelier',bar:'Jazz-Keller',rathaus:'Konzerthaus',garage:'Orgelbau-Werkstatt',pflanzen:'Glockenblumen-Gärtnerei',tiere:'Singvogel-Voliere'},
  sty:{wall:'putz',walls:['#FFF1F6','#F4F0FF','#E8F4FF','#FFF6E4'],roof:'dome',roofs:NOTE.slice(0,6),trim:'#E8C87A',plinth:'#C8B8D8',door:'#8A5E42',win:'rund',pitch:.9},
  wall:'streifen',floor:'parkett',
  mayor:['Dirigentin Allegra',{skin:'pluesch',color:10,shape:'glocke'},{kopf:'lautsprecher',augen:'kuller',arme:'mensch',beine:'mensch',extras:['kopfhoerer']}],
  lore:['Auf unserem Planeten klingt alles. Wenn du still bist, hörst du die Harfenbäume im Wind.','Die Klangsteine beim Dorf spielen die Tonleiter. Probier es aus – einfach drüberlaufen!','Irgendwo stehen vier Liedtafeln mit alten Melodien. Spiel sie nach, und wir geben ein Konzert für dich.'],
  caveRock:['#C8B8D8','#A898B8','#6E5E7E',['#E8DCFF','#FFE8F4','#DCF4FF']],
  wear:['notenhut','fliege_noten','frack','zylinder','halstuch','blumenkette'],clothes:CL,
  haus:{theme:{roof:NOTE.slice(0,6),wall:['#FFF1F6','#F4F0FF','#E8F4FF'],wood:['#C8945A','#8A5E42'],stone:['#C8B8D8','#A898B8'],trim:['#E8C87A'],plant:['#98C890','#7CC46A']},
    props:[['town','lantern',1,'d',0],['nature','flower_purpleA',1.4,'d',0],['nature','plant_bushSmall',1.4,'c'],['town','stall-bench',1,'c',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_purpleB'],veg:['crop_carrot']},
    plan:[{fam:'klanghaus',style:'trommel'},{fam:'klanghaus',style:'grammophon'},{fam:'klanghaus',style:'glocke'},{fam:'klanghaus'}],fams:{klanghaus}},
  residents:{skins:['pluesch','fell','holz','gold','plastik','keramik'],heads:['lautsprecher','vogel','frosch','hirsch','katze','mensch','qualle','eule','bluete','disco'],names:['Allegra','Forte','Piano','Staccato','Largo','Viola','Tremolo','Kanon','Fuga','Rondo','Presto','Crescendo'],
    house:{shapes:['rund','haus'],walls:['putz','holz'],wallCols:['#FFF1F6','#F4F0FF','#E8F4FF'],roofCols:NOTE.slice(0,4),win:['rund']},deco:['glockenblume','notenbusch','stimmgabelbaum'],fence:false},
  lang:{n:'Notenschrift',ink:'#2E2A3E',glow:'#E8A0E8',kind:'note',draw:noteGlyph,syl:['do','re','mi','fa','so','la','ti','da','lu','ri','ba','pa']},ruinStone:'#C8B8D8',
  terraform:['glockenwiese','harfenwald','trommelheide','echoufer'],
  weather:[['klar',3],['heiter',3],['regen',2],['nebel',1],['gewitter',1]]});

/* ================= Planeten-Besonderheiten ================= */
const KLANG=(()=>{let W_=null,stones=[],tablets=[],played=[],onStone=-1,concert=0,crystalsNear=[];const M=()=>makeMats({skin:'haut',color:0});
  const SONGS=[{n:'Morgenlied',notes:[0,2,4,5,4]},{n:'Sternenwalzer',notes:[4,4,5,7,7,5]},{n:'Echo vom Berg',notes:[7,5,4,2,0]},{n:'Glockentanz',notes:[0,4,7,4,0,7]}];
  const S=()=>SAVE.klang=SAVE.klang||{songs:[],concert:false,notes:0};
  function stoneModel(m,i){const g=new THREE.Group();const q=grp(g,[0,0,0]);P(q,G.cy(.66,.74,.42,Q(18)),m.c(NOTE[i],{gloss:.8,rim:.5}),[0,.21,0]);const top=P(q,G.cy(.52,.52,.03,Q(18)),m.c(shade(NOTE[i],1.25),{gloss:1}),[0,.43,0]);top.userData.noOutline=true;
    const gl=P(q,G.s(.2),m.glow(NOTE[i],1.6),[0,.48,0],null,[1,.25,1]);gl.userData.noOutline=true;gl.visible=false;addOutlines(g);g.userData={q,gl};return g}
  function tabletModel(m,song){const g=new THREE.Group();P(g,G.bx(1.4,1.8,.25,.08),m.c('#C8B8D8',{rim:.4}),[0,.9,0]);P(g,G.bx(1.6,.25,.4,.06),m.c('#A898B8'),[0,.1,0]);
    song.notes.forEach((n,i)=>{const x=-.5+i*(1/(song.notes.length-1));P(g,G.s(.1),m.glow(NOTE[n],1.2),[x,.8+SEMI[n]*.05,.14])});for(let k=0;k<5;k++)P(g,G.bx(1.2,.012,.02,0),m.c('#6E5E7E'),[0,.7+k*.12,.13]).userData.noOutline=true;addOutlines(g);return g}
  function onLoad(W){W_=W;stones=[];tablets=[];played=[];const m=M();const st=S();
    /* acht Klangsteine im Halbkreis neben dem Dorfplatz */const pl=W.places[0];const t1=GAME.tangentTo(pl.dir,new V(0,0,1)),t2=pl.dir.clone().cross(t1);const c=PLANETKIT.freeSpot(W,pl.dir,16,44,6.5);
    for(let i=0;i<8;i++){const a=PI*.1+i/7*PI*.8;const d=c.clone().addScaledVector(t1,Math.cos(a)*-5/W.R).addScaledVector(t2,Math.sin(a)*5/W.R).normalize();const g=stoneModel(m,i);GAME.placeObj(g,d,0,-.12);stones.push({i,d,g,glow:0})}
    W.inter.push({kind:'klangsteine',p:c,r:3,label:'Klangsteine: Lied auswählen',act:chooseSong});
    /* vier Liedtafeln weit verteilt */const r=srand(4545);SONGS.forEach((sg,i)=>{let d=null;for(let t=0;t<300&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.9||!GAME.isLand(cd))continue;if(tablets.some(x=>angle(x.d,cd)*W.R<40))continue;d=cd}
      if(!d)return;const g=tabletModel(m,sg);GAME.placeObj(g,d,r()*6,0);GAME.addObst(d,.8);tablets.push({i,d,g});W.inter.push({kind:'liedtafel',p:d,r:2,label:'Liedtafel lesen: '+sg.n,act:()=>readTablet(i)})})}
  let target=null;
  async function readTablet(i){const sg=SONGS[i];const st=S();await UI.talk('Liedtafel: '+sg.n,['Eingemeisselte Noten, jede in ihrer Farbe:',sg.notes.map(n=>NN[n]).join(' – '),st.songs.includes(i)?'Dieses Lied hast du schon gespielt.':'Merk dir die Farben und spiel sie auf den Klangsteinen beim Dorf nach.']);
    sg.notes.forEach((n,k)=>setTimeout(()=>play(n,.5),k*380));if(!st.songs.includes(i)){st.known=Array.from(new Set([...(st.known||[]),i]));persist()}}
  async function chooseSong(){const st=S();const known=(st.known||[]).filter(i=>!st.songs.includes(i));if(!known.length){await UI.talk('Klangsteine',['Acht Steine, acht Töne: C D E F G A H C.','Lauf einfach darüber. Die Melodien findest du auf den Liedtafeln draussen im Land.'+(st.songs.length?' Gespielt: '+st.songs.length+' von 4.':'')]);return}
    const ch=await UI.talk('Klangsteine',['Welches Lied möchtest du spielen?'],{choices:[...known.map(i=>SONGS[i].n),'Einfach frei spielen']});if(ch<known.length){target={i:known[ch],pos:0};played=[];UI.toast('Spiel: '+SONGS[target.i].notes.map(n=>NN[n]).join(' '),5000)}else target=null}
  function hit(i){const st=S();play(i);const s=stones[i];s.glow=1;st.notes++;if(!target)return;const want=SONGS[target.i].notes[target.pos];
    if(i===want){target.pos++;if(target.pos>=SONGS[target.i].notes.length){const k=target.i;target=null;st.songs.push(k);persist();SND.jingle('j_success');
        const gifts=['grammophon','harfe','trommelhocker','kristall_klangspiel'];if(typeof bagAdd==='function')bagAdd('furn',gifts[k%4]);money(300);UI.toast('„'+SONGS[k].n+'“ fehlerfrei gespielt! Geschenk: '+findFurn(gifts[k%4]).n+' und 300 Taler.',3600);
        if(st.songs.length===4&&!st.concert){st.concert=true;persist();setTimeout(startConcert,2500)}}}
    else{target.pos=i===SONGS[target.i].notes[0]?1:0;SND.play('error',{vol:.3});UI.toast('Hoppla, falscher Ton. Nochmal von vorn!',1800)}}
  async function startConcert(){concert=40;await UI.talk('Dirigentin Allegra',['Alle vier Lieder! Das ganze Dorf hat zugehört.','Heute Abend geben wir ein Konzert – für dich!']);const seq=[0,2,4,7,4,2,0,4,7,12];for(let r=0;r<3;r++)seq.forEach((n,i)=>setTimeout(()=>SND.play('bell',{rate:Math.pow(2,n/12)*.9,vol:.5}),(r*seq.length+i)*300));
    for(const e of GAME.ents.values()){if(e!==GAME.me&&e.kind==='villager'&&typeof doEmote==='function'){try{doEmote(e,'tanzen')}catch(x){}}}if(typeof bagAdd==='function')bagAdd('relic','stimmgabel');UI.toast('Zum Dank: die Goldene Stimmgabel.',3000)}
  let ringT=0,lastP=null;function tick(dt,t,W,me){if(!me)return;/* Klangsteine: Betreten löst Ton aus */let now=-1;for(const s of stones){const d=angle(me.p,s.d)*W.R;if(d<.75)now=s.i;s.glow=Math.max(0,s.glow-dt*2);s.g.userData.gl.visible=s.glow>.02;s.g.userData.gl.scale.set(1+s.glow,.25,1+s.glow);s.g.userData.q.position.y=-s.glow*.08}
    if(now>=0&&now!==onStone)hit(now);onStone=now;
    /* Glockenblumen und Kristalle klingen leise, wenn man vorbeiläuft */ringT-=dt;const mv=lastP?angle(lastP,me.p)*W.R/Math.max(dt,1e-3):0;lastP=me.p.clone();if(ringT<=0&&mv>.8){ringT=.6;const b=W.biomeAt(me.p);if(b==='glockenwiese'&&Math.random()<.5)play(Math.floor(Math.random()*8),.18);else if(b==='kristallklippen'&&Math.random()<.4)play(4+Math.floor(Math.random()*4),.22)}
    if(concert>0)concert-=dt}
  return{onLoad,tick,SONGS,stones:()=>stones,tablets:()=>tablets}
})();
window.KLANG=KLANG;
})();
