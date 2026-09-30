/* =====================================================================
   CYBORG-LABOR · planets/wolkenarchipel.js · Wolkenarchipel
   Hohe Inseln über einem weichen Wolkenmeer. Windräder, Ballonblumen,
   Regenbogenhaine. Besonderheiten:
   · Wolkenhüpfer: federnde Wolkenkissen schleudern dich in hohem Bogen
     zur nächsten Insel.
   · Regenbogen: wenn ein Regen aufhört, spannt sich ein Regenbogen über
     die Inseln. An seinem Ende wartet ein Topf mit Regenbogen-Splittern.
   ===================================================================== */
(function(){
const ID='wolkenarchipel';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,butterfly,cloud,fin2}=NH;
const V=THREE.Vector3;
const RAIN=['#FF6F91','#FF9E6E','#FFD35C','#7CC46A','#56C6B6','#6E8EF0','#8E6BD1'];

/* ================= Natur ================= */
N('wolkenbaum',{r:.35,h:4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.6,3.8);P(g,G.tu([[0,0,0],[.2,h*.5,.1],[-.1,h,0]],.16,.1),m.c('#C8B8E0',{rim:.5}));
  const sd=rnd()*9;[[0,h+.5,0,1.1],[.8,h+.2,.3,.8],[-.8,h+.3,-.2,.85],[.2,h+1.1,-.2,.75],[-.3,h+.2,.8,.7]].forEach(([x,y,z,r],i)=>P(g,G.blob(r,.08,2,sd+i),m.c(i%2?'#FFFFFF':'#F4F2FF',{rim:.9,rimColor:'#dfe8ff'}),[x,y,z]));
  if(rnd()<.4)range(5,(t,i)=>P(g,G.s(.1),m.glow(RAIN[i%7],1.2),[Math.cos(i*1.3)*1.1,h+.2+Math.sin(i)*.4,Math.sin(i*1.3)*1.1]))});
N('windrad',{r:.3,h:3,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3);P(g,G.cy(.06,.1,h),m.c('#FFFFFF',{rim:.4}),[0,h/2,0]);const hub=grp(g,[0,h,.12]);g.userData.rotor=hub;P(hub,G.s(.12),m.c('#FF8FA3'),[0,0,0]);
  for(let i=0;i<4;i++){const a=i/4*TAU;const q=grp(hub,[0,0,0],[0,0,a]);P(q,G.bx(.14,.9,.03,.03),m.c(RAIN[(i*2)%7],{rim:.4}),[0,.5,0])}
  g.userData.tick=t=>{hub.rotation.z=t*2.2+rnd()};});
N('ballonblume',{r:.3,h:3.2,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const n=2+Math.floor(rnd()*3);for(let i=0;i<n;i++){const a=rnd()*TAU,h=RR(rnd,1.6,3);const x=Math.cos(a)*.3,z=Math.sin(a)*.3;
  P(g,G.tu([[0,0,0],[x*.5,h*.5,z*.5],[x,h,z]],.02,.015),m.c('#8FC86A'));const col=RAIN[Math.floor(rnd()*7)];P(g,G.s(.32),m.c(col,{gloss:1.1,rim:.7}),[x,h+.34,z],null,[1,1.15,1]);P(g,G.co(.05,.08),m.c(shade(col,.8)),[x,h+.02,z],[PI,0,0])}
  P(g,flatLeaf(leafShape(.5,.2),.02,.2),m.c('#7CC46A'),[0,.05,0],[0,.3,1.2])});
N('regenbogenbusch',{r:.6,h:1.1,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const sd=rnd()*9;for(let i=0;i<5;i++){const a=i/5*TAU;cloud(g,m,RAIN[(i+Math.floor(rnd()*7))%7],Math.cos(a)*.35,.45+(i%2)*.15,Math.sin(a)*.35,.36,sd+i)}});
N('federgras',{r:.3,h:1.2,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<6;i++){const a=rnd()*TAU,h=RR(rnd,.7,1.2);const x=Math.cos(a)*.15,z=Math.sin(a)*.15;P(g,G.tu([[0,0,0],[x,h*.6,z],[x*2.5,h,z*2.5]],.012,.006),m.c('#E8E0C8'));P(g,flatLeaf(leafShape(.3,.09),.01,.1),m.c('#FFFFFF',{rim:.9}),[x*2.5,h,z*2.5],[0,a,.8])}});
N('schwebestein',{r:.8,h:3,size:'big',planet:ID},(g,m,o,rnd)=>{const sd=rnd()*9;const q=grp(g,[0,1.8+rnd()*.8,0]);P(q,G.blob(.7,.18,2.2,sd),m.c('#B8B0D0',{rim:.5}),[0,0,0],null,[1,.7,1]);P(q,G.co(.5,.9,7),m.c('#A8A0C0'),[0,-.55,0],[PI,0,0]);P(q,G.hs(.62),m.c('#9CD27A'),[0,.28,0],null,[1,.3,1]);
  markGlow(q,P(q,G.s(.12),m.glow('#C8E8FF',1.8),[0,-.9,0]));g.userData.tick=t=>{q.position.y=2.1+Math.sin(t*.8+sd)*.25;q.rotation.y=t*.1}});
N('wolkenhaufen',{r:1,h:1.2,size:'big',planet:ID},(g,m,o,rnd)=>{const sd=rnd()*9;[[0,.5,0,.9],[.7,.35,.2,.6],[-.6,.4,-.1,.65],[.1,.9,.1,.55]].forEach(([x,y,z,r],i)=>P(g,G.blob(r,.08,2,sd+i),m.c('#FFFFFF',{rim:.9,rimColor:'#dfe8ff'}),[x,y,z]))});
Object.assign(NH.ROCK,{[ID]:['#D8D0EC','#B8B0D0','#A8D88A']});

/* ================= Biome ================= */
const BI={
  wolkenwiese:{n:'Wolkenwiese',g:['#B8E09A','#A6D48A'],cliff:'#B8B0D0',pat:'gras',grass:'#B0DC94',grassD:1,trees:[['wolkenbaum',2],['ballonblume',1.5]],treeD:.9,
    deco:[['federgras',5],['blume',4],['klee',3],['windrad',.3]],decoD:6,rocks:[['kiesel',1],['findling',.3]],rockD:.4,litter:[['wolkenwatte',1],['windfeder',.5]]},
  windklippen:{n:'Windklippen',g:['#C8D0B8','#B8C0A8'],cliff:'#A8A0C0',pat:'staub',grass:'#B8C8A0',grassD:.4,trees:[['windrad',.8],['wolkenbaum',.3]],treeD:.4,
    deco:[['federgras',6],['kiesel',3]],decoD:4,rocks:[['findling',1],['schwebestein',.15]],rockD:.8,litter:[['windfeder',1.2]]},
  regenbogenhain:{n:'Regenbogenhain',g:['#C8E8B0','#B8DCA0'],cliff:'#B8B0D0',pat:'gras',grass:'#C0E4A8',grassD:.9,trees:[['wolkenbaum',3],['regenbogenbusch',2]],treeD:1.5,
    deco:[['regenbogenbusch',3],['blume',4],['ballonblume',1]],decoD:6,rocks:[['kiesel',1]],rockD:.3,litter:[['regenbogensplitter',.25],['beeren',.6]]},
  nebelwald:{n:'Nebelwald',g:['#98C4A8','#88B898'],cliff:'#9A94B0',pat:'moos',grass:'#98C4A8',grassD:.8,trees:[['wolkenbaum',3],['tanne',1.2]],treeD:1.6,
    deco:[['farn',4,{color:'#8FC8A0'}],['moospolster',3],['wolkenhaufen',.6]],decoD:6,rocks:[['findling',.4]],rockD:.3,litter:[['wolkenwatte',.8],['ast',1]]},
  wolkenstrand:{n:'Wolkenstrand',g:['#F4F2FF','#E8E6F8'],cliff:'#C8C0E0',pat:'sand',grass:null,grassD:0,trees:[['ballonblume',.4]],treeD:.2,deco:[['wolkenhaufen',1.2],['federgras',2]],decoD:2,
    rocks:[['kiesel',.6]],rockD:.2,litter:[['wolkenwatte',2]]},
  schwebeinsel:{n:'Schwebesteinfeld',g:['#C0D8B0','#B0CCA0'],cliff:'#A8A0C0',pat:'staub',grass:'#B8D4A4',grassD:.5,trees:[['schwebestein',.6],['windrad',.4]],treeD:.4,
    deco:[['federgras',3],['kiesel',2]],decoD:3,rocks:[['schwebestein',.4],['findling',.5]],rockD:.5,litter:[['sternenstaub',.4]]}};

/* ================= Sammelsachen ================= */
IT('wolkenwatte',itMeta('Wolkenwatte','wolkenarchipel','material',35),(g,m)=>{[[0,.18,0,.18],[.12,.14,.05,.13],[-.1,.15,-.04,.14]].forEach(([x,y,z,r])=>P(g,G.s(r),m.c('#FFFFFF',{rim:.9}),[x,y,z]))});
IT('windfeder',itMeta('Windfeder','wolkenarchipel','material',55),(g,m)=>{const q=grp(g,[0,.04,0],[-PI/2+.1,0,.3]);P(q,G.tu([[0,-.3,0],[0,.3,0]],.012,.006),m.c('#FFFFFF'));P(q,flatLeaf(leafShape(.3,.11),.012,.1),m.c('#CFE4FF',{rim:.8}),[0,.05,0])});
IT('regenbogensplitter',itMeta('Regenbogen-Splitter','wolkenarchipel','material',320),(g,m)=>{for(let i=0;i<5;i++)P(g,G.bx(.07,.36,.05,.02),m.glow(RAIN[i],1.1),[(i-2)*.07,.2,0],[0,0,.1])});
IT('sternenstaub',itMeta('Sternenstaub','wolkenarchipel','material',140),(g,m)=>{range(7,(t,i)=>P(g,G.s(.05),m.glow(i%2?'#FFE27A':'#FFFFFF',1.8),[Math.cos(i*2.4)*.14,.1+t*.2,Math.sin(i*2.4)*.14]))});

/* ================= Fische (im Wolkenmeer) ================= */
F('wolkenfisch',fishMeta('Wolkenfisch','wolkenarchipel','meer','M','immer',1,240,'Ich hab einen Wolkenfisch gefangen! Er ist ganz fluffig und ein bisschen feucht.','Echte Wolken bestehen aus winzigen Wassertröpfchen oder Eiskristallen. Eine kleine Schönwetterwolke wiegt trotzdem so viel wie ein paar Elefanten.'),
  (g,m)=>fishT(g,m,{id:'wolkenfisch',H:.24,L:.8,back:'#E8ECFF',belly:'#FFFFFF',tail:'round',dorsal:'std',gloss:.3,pat:(x,w,h,r)=>FT.blobs(x,w,h,'#FFFFFF',8,10,18,r)}));
F('himmelsqualle',fishMeta('Himmelsqualle','wolkenarchipel','meer','M','nacht',2,680,'Ich hab eine Himmelsqualle gefangen! Sie leuchtet wie ein Nachtlicht.','Manche Quallen leuchten durch ein Eiweiss namens GFP. Forschende nutzen es heute, um Zellen im Mikroskop sichtbar zu machen.'),
  (g,m)=>{P(g,G.hs(.28),m.c('#C8B8FF',{opacity:.8,rim:1}),[0,.05,0]);range(6,(t,i)=>{const a=i/6*TAU;P(g,G.tu([[Math.cos(a)*.16,0,Math.sin(a)*.16],[Math.cos(a)*.2,-.2,Math.sin(a)*.2],[Math.cos(a)*.14,-.42,Math.sin(a)*.14]],.018,.008),m.c('#E8DCFF'))});markGlow(g,P(g,G.s(.1),m.glow('#E8DCFF',1.6),[0,.12,0]));eye(g,m,[.1,.14,.22],.035,[.4,.2,.8]);eye(g,m,[-.1,.14,.22],.035,[-.4,.2,.8])});
F('blitzaal',fishMeta('Blitzaal','wolkenarchipel','meer','L','immer',3,1600,'Ich hab einen Blitzaal gefangen! Meine Haare stehen jetzt senkrecht.','Zitteraale erzeugen Stromstösse von bis zu 800 Volt. Eigentlich sind sie keine Aale, sondern Verwandte der Welse.'),
  (g,m)=>{fishT(g,m,{id:'blitzaal',H:.13,L:1.1,W:.5,back:'#3E4E8E',belly:'#FFE27A',tail:'none',dorsal:'long',pat:(x,w,h,r)=>{x.strokeStyle='#FFE27A';x.lineWidth=5;x.beginPath();for(let i=0;i<8;i++)x.lineTo(w*(.3+(i%2)*.1),h*(.1+i*.11));x.stroke()}})});
F('regenbogenforelle',fishMeta('Regenbogenforelle','wolkenarchipel','teich','M','tag',2,560,'Ich hab eine Regenbogenforelle gefangen! Endlich weiss ich, wo der Regenbogen seine Farben lagert.','Regenbogenforellen haben einen rosa schimmernden Streifen an der Seite. Sie brauchen kaltes, sauerstoffreiches Wasser.'),
  (g,m)=>fishT(g,m,{id:'regenbogenforelle',H:.18,L:.85,back:'#7A9A6E',belly:'#F4F0E8',tail:'fork',pat:(x,w,h,r)=>{FT.stripe(x,w,h,'#FF8FA3',22,.1,.9,.36);FT.spots(x,w,h,'#3E4E3A',30,2,4,r)}}));
F('sternbarsch',fishMeta('Sternbarsch','wolkenarchipel','teich','S','nacht',2,420,'Ich hab einen Sternbarsch gefangen! Auf seinen Schuppen ist ein ganzes Sternbild.','Viele Fische orientieren sich nachts am Mondlicht. Manche Riff-Fische laichen nur in bestimmten Mondnächten.'),
  (g,m)=>fishT(g,m,{id:'sternbarsch',H:.2,L:.7,back:'#2E3A6E',belly:'#6E7AB0',tail:'round',dorsal:'spiky',pat:(x,w,h,r)=>FT.spots(x,w,h,'#FFE27A',16,2,4,r)}));

/* ================= Insekten ================= */
B('windlibelle',bugMeta('Windlibelle','wolkenarchipel','luft','tag',2,460,'Ich hab eine Windlibelle gefangen! Sie steht in der Luft wie ein kleiner Hubschrauber.','Libellen können mit ihren vier Flügeln unabhängig voneinander schlagen: vorwärts, rückwärts, seitwärts und in der Luft stehen.'),
  (g,m)=>{const bm=m.c('#8FD0FF',{gloss:1});P(g,G.ca(.035,.7),bm,[0,.3,-.15],[PI/2,0,0]);P(g,G.s(.08),bm,[0,.3,.24]);bugFace(g,m,[0,.3,.26],.08,.6,{er:.4});const wm=m.c('#FFFFFF',{opacity:.55,rim:1});for(const z of[.14,.04])wingPair(g,m,wm,leafShape(.6,.12),[0,.33,z],.6,.05,.1,.02)});
B('sternschnuppenkaefer',bugMeta('Sternschnuppen-Käfer','wolkenarchipel','boden','nacht',3,1200,'Ich hab einen Sternschnuppen-Käfer gefangen! Ich darf mir was wünschen, oder?','Leuchtkäfer erzeugen kaltes Licht durch eine chemische Reaktion. Fast die ganze Energie wird zu Licht – kaum etwas geht als Wärme verloren.'),
  (g,m)=>{const bm=m.c('#3E3A6E',{gloss:1});P(g,G.hs(.2),bm,[0,.08,0],null,[1,.8,1.3]);markGlow(g,P(g,G.s(.1),m.glow('#FFE27A',2.2),[0,.1,-.24]));P(g,G.tu([[0,.12,-.3],[0,.2,-.6],[0,.3,-.9]],.04,.005),m.glow('#FFF6D0',1.4));bugFace(g,m,[0,.12,.26],.08,.5);legs(g,bm,[[.1,.15,.1],[0,.17,0],[-.1,.15,-.1]],.25)});
B('nebelfalter',bugMeta('Nebelfalter','wolkenarchipel','luft','immer',1,180,'Ich hab einen Nebelfalter gefangen! Er ist fast durchsichtig.','Glasflügelfalter haben durchsichtige Flügel ohne Farbschuppen. So sind sie für Vögel kaum zu sehen.'),
  (g,m)=>butterfly(g,m,'nebelfalter','#E8ECFF','#F4F6FF','#8E8AB0'));
B('ballonspinne',bugMeta('Ballonspinne','wolkenarchipel','baum','tag',2,520,'Ich hab eine Ballonspinne gefangen! Sie reist mit einem Seidenfaden wie mit einem Fallschirm.','Junge Spinnen „ballonieren“: Sie lassen Seidenfäden in den Wind und fliegen damit manchmal hunderte Kilometer weit – sogar übers Meer.'),
  (g,m)=>{const bm=m.c('#E8A0C8',{rim:.6});P(g,G.s(.16),bm,[0,.15,-.06]);P(g,G.s(.1),bm,[0,.14,.12]);bugFace(g,m,[0,.15,.2],.07,.6);for(let i=0;i<4;i++)both(s=>P(g,G.tu([[s*.06,.14,.1-i*.06],[s*.2,.24,.12-i*.08],[s*.28,0,.14-i*.1]],.012,.008),bm));P(g,G.cy(.004,.004,.8),m.c('#FFFFFF'),[0,.55,-.06])});
B('windgrille',bugMeta('Windgrille','wolkenarchipel','boden','nacht',1,120,'Ich hab eine Windgrille gefangen! Ihr Zirpen klingt wie ein Windspiel.','Grillen hören mit Ohren an den Vorderbeinen. Am Tempo ihres Zirpens kann man sogar ungefähr die Temperatur ablesen.'),
  (g,m)=>{const bm=m.c('#B8B0D0',{rim:.6});P(g,G.ca(.1,.35),bm,[0,.18,0],[PI/2,0,0]);P(g,G.s(.12),bm,[0,.2,.26]);bugFace(g,m,[0,.2,.36],.09,.5);both(s=>P(g,G.tu([[s*.08,.15,-.05],[s*.18,.4,-.18],[s*.16,.06,-.34]],.025,.02),bm));feelers(g,bm,bm,[.04,.28,.36],.5,.3,.3)});

/* ================= Fundstücke ================= */
REL('sternschnuppe',relMeta('Gefallene Sternschnuppe','wolkenarchipel','schatz',3,1800,'Eine Sternschnuppe, die liegen geblieben ist! Sie summt leise.','Sternschnuppen sind meist sandkorngrosse Staubteilchen, die in der Atmosphäre verglühen. Die grösseren Brocken, die den Boden erreichen, heissen Meteoriten.'),
  (g,m)=>{const q=grp(g,[0,.4,0]);for(let i=0;i<5;i++){const a=i/5*TAU-PI/2;P(q,G.co(.1,.3),m.glow('#FFE27A',1.6),[Math.cos(a)*.18,Math.sin(a)*.18,0],[0,0,a-PI/2])}P(q,G.s(.14),m.glow('#FFF6D0',2),[0,0,0]);P(g,G.cy(.3,.35,.08),m.c('#B8B0D0'),[0,.04,0])});
REL('ballonkorb',relMeta('Alter Ballonkorb','wolkenarchipel','kunst',2,900,'Ein Korb von einem alten Heissluftballon! Da drin sind schon Menschen über Wolken gereist.','1783 stiegen in Paris die ersten Menschen mit einem Heissluftballon auf. Vorher hatte man ein Schaf, eine Ente und einen Hahn als Testpassagiere geschickt.'),
  (g,m)=>{const wm=m.c('#C8945A',{rim:.4});P(g,G.bx(.6,.5,.6,.06),wm,[0,.25,0]);for(let i=0;i<5;i++)P(g,G.bx(.62,.03,.62,.01),m.c('#A8744A'),[0,.06+i*.1,0]);for(let i=0;i<4;i++)P(g,G.cy(.012,.012,.6),m.c('#8A6A4A'),[(i%2-.5)*.5,.75,(Math.floor(i/2)-.5)*.5])});
REL('wetterfahne',relMeta('Goldene Wetterfahne','wolkenarchipel','kunst',2,1100,'Eine goldene Wetterfahne mit Hahn! Sie zeigt immer dahin, woher der Wind weht.','Wetterfahnen gibt es seit über 2000 Jahren. Der Hahn darauf soll früh wachsam sein und die Leute an den Tagesanbruch erinnern.'),
  (g,m)=>{const gm=m.c('#E8C87A',{gloss:1.3,rim:.6});P(g,G.cy(.03,.03,1),gm,[0,.5,0]);P(g,G.bx(.5,.02,.02,0),gm,[0,.7,0]);P(g,G.bx(.02,.02,.5,0),gm,[0,.7,0]);P(g,G.puff(new THREE.Shape([new THREE.Vector2(-.25,0),new THREE.Vector2(.1,0),new THREE.Vector2(.25,.2),new THREE.Vector2(.05,.32),new THREE.Vector2(-.1,.2)]),.02),gm,[0,1,0]);P(g,G.cy(.2,.24,.06),m.c('#8A7A6A'),[0,.03,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  wolkenschaf:{n:'Wolkenschaf',planet:ID,biomes:['wolkenwiese','regenbogenhain','windklippen'],count:5,herd:true,size:1,speed:.6,voice:['mäh','bäääh','mööh'],pitch:260,likes:['wolkenwatte','beeren'],product:'wolkenwatte',names:['Flocke','Kumulus','Watte','Schäfchen','Zirri'],
    fact:'Schafwolle wächst ein Leben lang weiter. Ohne Schur würde ein Schaf irgendwann aussehen wie eine wandelnde Wolke – so wie diese hier.',a:{col:'#F4F2FF',belly:'#FFFFFF',body:[.42,.36,.5],head:{r:.24,col:'#8E8AB0',p:[0,.62,.5]},snout:{type:'dot',nose:'#FF8FA3'},ears:{type:'floppy',col:'#8E8AB0',len:.35},legs:{n:4,len:.2,r:.06,col:'#8E8AB0',foot:'#6E6A90'},tail:{type:'puff',col:'#FFFFFF'},extra:{wool:'#FFFFFF'}}},
  himmelswal:{n:'Himmelswal',planet:ID,biomes:['wolkenstrand','wolkenwiese','schwebeinsel'],fly:true,count:2,size:5,speed:.4,voice:['wuuuuoooh','mmmmh'],pitch:60,likes:['sternenstaub','wolkenwatte'],product:'sternenstaub',names:['Nimbus','Grosser Tom','Sanfte Sina','Stratus','Mondbauch'],
    fact:'Blauwale sind die grössten Tiere, die je gelebt haben. Ihr Gesang ist so tief und laut, dass er hunderte Kilometer weit durchs Meer trägt.',a:{col:'#8EA8E8',belly:'#E8F0FF',body:[.5,.4,.9],head:{r:.36,p:[0,.62,.82],sc:[1.1,.9,1.2]},snout:{type:'wide'},eyes:{r:.05,x:.62,y:.05},ears:{type:'none'},legs:{n:0},flippers:{s:1.6,up:.2,back:false},tail:{type:'flat',col:'#7A96D8'},spots:{col:'#FFFFFF',n:6,s:.6}}},
  sturmvogel:{n:'Sturmvogel',planet:ID,biomes:['windklippen','wolkenstrand'],fly:true,count:4,herd:true,size:.7,speed:1.5,voice:['kiii','kjak','kree'],pitch:520,likes:['windfeder','wolkenfisch'],product:'windfeder',names:['Böe','Kiek','Wirbel','Luv','Lee'],
    fact:'Sturmvögel können tagelang über dem Meer segeln, ohne zu landen. Sie gleiten auf dem Aufwind der Wellen und schlagen kaum mit den Flügeln.',a:{col:'#F4F4FF',belly:'#FFFFFF',body:[.26,.26,.4],head:{r:.2,p:[0,.55,.32]},snout:{type:'beak',col:'#FFB23E',len:.8},ears:{type:'none'},legs:{n:2,len:.1,r:.03,col:'#FFB23E'},tail:{type:'fan',col:'#8E8AB0'},wings:{col:'#8E8AB0'}}},
  windhase:{n:'Windhase',planet:ID,biomes:['wolkenwiese','regenbogenhain','nebelwald'],count:4,size:.8,speed:1.6,gait:'hop',shy:true,voice:['fiep','hüpf'],pitch:480,likes:['beeren','regenbogensplitter'],product:'windfeder',names:['Brise','Hoppel','Löffel','Pusti','Wolki'],
    fact:'Hasen können über 70 km/h schnell laufen und Haken schlagen. Anders als Kaninchen kommen ihre Jungen mit Fell und offenen Augen zur Welt.',a:{col:'#E8DCFF',belly:'#FFFFFF',body:[.3,.3,.38],head:{r:.24,p:[0,.55,.32]},snout:{type:'dot',nose:'#FF8FA3'},ears:{type:'long',len:.7,inner:'#FFC8E0'},legs:{n:4,len:.12,r:.07,foot:'#FFFFFF'},tail:{type:'puff',col:'#FFFFFF'},gait:'hop'}},
  regenbogenfuchs:{n:'Regenbogenfuchs',planet:ID,biomes:['regenbogenhain','nebelwald'],count:2,size:1,speed:1.2,shy:true,night:true,voice:['kek','wau-wau','hmm'],pitch:340,likes:['regenbogensplitter','beeren'],product:'regenbogensplitter',names:['Prisma','Spektra','Glimmer','Iris','Farbklecks'],
    fact:'Rotfüchse nutzen das Magnetfeld der Erde, wenn sie auf Mäuse springen: Nach Nordosten gezielte Sprünge treffen viel öfter.',a:{col:'#FF9E6E',belly:'#FFFFFF',body:[.34,.3,.52],head:{r:.25,p:[0,.62,.5]},snout:{type:'long',col:'#FFFFFF'},ears:{type:'pointy',len:.5,inner:'#FFE0C8'},legs:{n:4,len:.2,r:.06,foot:'#6E4A5A'},tail:{type:'bushy',col:'#8E6BD1',len:1.3,tip:'#FFE27A'},stripes:{col:'#FFD35C',n:2}}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','propellermuetze','Propeller-Mütze',640,'#56C6B6',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.35,0]);P(q,G.hs(r*.92),M.c(col,{rim:.5}),[0,0,0]);for(let i=0;i<4;i++)P(q,G.hs(r*.93),M.c(i%2?'#FFD35C':'#FF6F91'),[0,0,0],[0,i*PI/2,0],[1,1,.25]);P(q,G.cy(r*.04,r*.04,r*.3),M.c('#8E8AB0'),[0,r*.95,0]);const pr=grp(q,[0,r*1.1,0]);for(let i=0;i<3;i++)P(pr,G.bx(r*.9,r*.03,r*.18,r*.02),M.c('#FF6F91'),[0,0,0],[0,i/3*TAU,0])});
def('neck','wolkenschal','Wolken-Schal',520,'#FFFFFF',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);range(8,(t,i)=>{const a=i/8*TAU;P(g,G.s(r*.28),M.c(col,{rim:.9,rimColor:'#dfe8ff'}),[Math.cos(a)*r*.7,y,Math.sin(a)*r*.7])});P(g,G.s(r*.24),M.c(col),[r*.3,y-r*.4,r*.62])});
def('top','regenbogenpulli','Regenbogen-Pulli',960,'#FF6F91',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);for(let i=0;i<5;i++)P(q,G.cy(r*(.78+i*.03),r*(.8+i*.03),r*.22,Q(18),1,true),M.c(RAIN[i],{rim:.4}),[0,-r*(.14+i*.2),0])});

/* ================= Bau-Familie: Ballon-, Windmühlen- und Wolkenhäuser ================= */
function luftschiffhaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.4:1;const style=plan.style||A.pick(r,['ballon','muehle','wolke']);const W=(1.6+r()*.4)*big,D=(1.5+r()*.3)*big,Hw=(1.6+r()*.2)*big;const body=new THREE.Group();g.add(body);
  const C=c=>cozy({color:c});const wc=A.pick(r,['#FFFFFF','#F4F0FF','#E8F4FF','#FFF1F6']);const rc=A.pick(r,RAIN);let top=Hw;const doorZ=-D/2-.02;
  /* Grundkörper: rundliches Holzhaus mit Bullaugen */P(body,G.bx(W,Hw,D,.25),C(wc),[0,Hw/2,0]);P(body,G.bx(W+.1,.14,D+.1,.05),C(shade(wc,.9)),[0,.07,0]);
  if(style==='ballon'){const bh=Hw+2.2*big;P(body,G.s(1.35*big),C(rc),[0,bh,0],null,[1,1.15,1]);for(let i=0;i<6;i++)P(body,G.s(1.36*big),C(RAIN[(i+2)%7]),[0,bh,0],[0,i/6*PI,0],[1,1.15,.12]);
    for(const[x,z]of[[-W*.4,-D*.4],[W*.4,-D*.4],[-W*.4,D*.4],[W*.4,D*.4]])P(body,G.tu([[x,Hw,z],[x*.5,bh-1.1*big,z*.5]],.02,.02),C('#8A6A4A'));P(body,G.co(.3,.4),C(shade(rc,.8)),[0,bh-1.5*big,0],[PI,0,0]);top=bh+1.6*big}
  else if(style==='muehle'){const rh=Hw+.9;P(body,G.co(Math.max(W,D)*.78,1.3,4,1),C(rc),[0,Hw+.62,0],[0,PI/4,0]);const hub=grp(body,[0,rh,doorZ-.12]);P(hub,G.s(.16),C('#8A6A4A'),[0,0,0]);for(let i=0;i<4;i++){const q=grp(hub,[0,0,0],[0,0,i*PI/2+.3]);P(q,G.bx(.06,1.8*big,.04,.02),C('#8A6A4A'),[0,.9*big,0]);P(q,G.bx(.38,1.3*big,.02,.02),C('#FFFFFF'),[.2,1.05*big,.02])}body.userData.rotor=hub;top=rh+1.9*big}
  else{/* auf einer Wolke */const sd=r()*9;for(let i=0;i<7;i++){const a=i/7*TAU;P(g,G.blob(.8,.08,2,sd+i),C('#FFFFFF'),[Math.cos(a)*W*.7,.05,Math.sin(a)*D*.7],null,[1.3,.55,1.3])}body.position.y=.35;P(body,G.hs(W*.72),C(rc),[0,Hw,0],null,[1,.7,D/W]);P(body,G.s(.14),C('#FFE27A'),[0,Hw+W*.52,0]);top=Hw+W*.6+.4}
  /* Propeller am Heck */if(style!=='muehle'){const pr=grp(body,[0,Hw*.6,D/2+.12]);for(let i=0;i<3;i++)P(pr,G.bx(.6,.08,.03,.02),C('#8E8AB0'),[0,0,0],[0,0,i/3*TAU]);body.userData.rotor=pr}
  const dr=A.archDoor(A.pick(r,['#56C6B6','#FF8FA3','#8E6BD1','#FFD35C']),'#6E6A90');dr.position.set(0,0,doorZ);dr.rotation.y=PI;body.add(dr);
  for(const sx of[-1,1]){const w=A.roundWindow('#E8C87A',.2,false);w.position.set(sx*W*.3,Hw*.62,doorZ-.02);w.rotation.y=PI;body.add(w)}
  /* Wimpelkette */for(let i=0;i<7;i++){const x=-W/2+i*W/6;P(body,G.co(.07,.14,3),C(RAIN[i%7]),[x,Hw+.05-Math.sin(i/6*PI)*.18,doorZ-.08],[PI,0,0])}
  const rot=body.userData.rotor;if(rot)g.userData.tick=t=>{rot.rotation.z=t*1.8};
  addOutlines(body);return{g,R:Math.max(W,D)*.75+.8,top,door:[0,doorZ],walls:[new THREE.Box3(new V(-W/2,0,-D/2),new V(W/2,top,D/2))],style:'luftschiff-'+style}}

/* ================= Möbel ================= */
furn('wolkensofa',{n:'Wolken-Sofa',cat:'sitz',price:1400,planet:ID,size:[2,1],h:.8,b:(g,m)=>{const wm=m.c('#FFFFFF',{rim:.9,rimColor:'#dfe8ff'});[[0,.25,0,.5,1.8],[-.75,.5,.1,.32,1],[.75,.5,.1,.32,1],[0,.55,-.28,.4,1.6]].forEach(([x,y,z,r,sx])=>P(g,G.s(r),wm,[x,y,z],null,[sx,.7,1]))}});
furn('ballonlampe',{n:'Ballon-Lampe',cat:'licht',price:980,planet:ID,size:[1,1],h:1.7,b:(g,m)=>{P(g,G.cy(.14,.18,.05),m.c('#C8945A'),[0,.03,0]);P(g,G.cy(.005,.005,1.1),m.c('#8A6A4A'),[0,.6,0]);P(g,G.s(.28),m.glow('#FFD35C',.9),[0,1.4,0],null,[1,1.15,1]);g.userData.light={p:[0,1.4,0],c:'#FFE8B0',i:1.1}}});
furn('windspiel',{n:'Windspiel',cat:'deko',price:620,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{P(g,G.cy(.02,.02,1.5),m.c('#C8B8E0'),[0,.75,0]);P(g,G.cy(.2,.2,.03),m.c('#E8C87A',{gloss:1}),[0,1.5,0]);for(let i=0;i<6;i++){const a=i/6*TAU;P(g,G.cy(.02,.02,.4-i*.03),m.c(RAIN[i],{gloss:1}),[Math.cos(a)*.16,1.25,Math.sin(a)*.16])}}});
furn('regenbogenteppich',{n:'Regenbogen-Teppich',cat:'teppich',price:1100,planet:ID,size:[2,2],h:.03,b:(g,m)=>{for(let i=0;i<7;i++)P(g,G.to(.9-i*.1,.05,PI),m.c(RAIN[i]),[0,.02,-.2],[-PI/2,0,0],[1,1,.2])}});

wallpaper('wolken',{n:'Wolkenhimmel',price:760,planet:ID,draw:(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#BFE0FF');g.addColorStop(1,'#FFE8F4');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.92)';
  for(const[cx,cy,s]of[[.2,.25,1],[.7,.18,.8],[.45,.6,1.1],[.9,.7,.9],[.05,.8,.8]])for(const[dx,dy,r]of[[0,0,.08],[.07,.01,.06],[-.06,.015,.055],[.02,-.04,.055]]){for(const ox of[-1,0,1]){x.beginPath();x.arc((cx+dx*s+ox)*w,(cy+dy*s)*h,r*s*w,0,TAU);x.fill()}}}});

/* ================= Sprache: Wind-Zeichen ================= */
function windGlyph(x,s,r){const k=Math.floor(r()*4);x.beginPath();if(k===0){for(let i=0;i<3;i++){x.moveTo(-s*.35,-s*.2+i*s*.2);x.bezierCurveTo(-s*.1,-s*.35+i*s*.2,s*.1,-s*.05+i*s*.2,s*.35,-s*.2+i*s*.2)}}
  else if(k===1){x.arc(0,0,s*.26,PI*.2,PI*1.8);x.moveTo(s*.2,0);x.arc(s*.1,0,s*.1,0,PI*1.5)}
  else if(k===2){x.arc(-s*.12,s*.05,s*.14,PI,0);x.arc(s*.12,s*.05,s*.14,PI,0);x.lineTo(s*.26,s*.18);x.lineTo(-s*.26,s*.18);x.closePath()}
  else{x.moveTo(0,-s*.36);x.lineTo(0,s*.36);x.moveTo(-s*.2,-s*.2);x.lineTo(s*.2,s*.2);x.moveTo(s*.2,-s*.2);x.lineTo(-s*.2,s*.2)}x.stroke()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Wolkenarchipel',base:'kompost',R:136,R0:44,sea:-.6,music:'world',sky:['#9ED4FF','#FFE8F4'],fog:'#EEF0FF',water:'#F6F4FF',deep:'#C8D0F0',step:1.4,shop:ID,
    desc:'Hohe Inseln über einem weichen Wolkenmeer. Hüpf auf federnden Wolkenkissen von Insel zu Insel und jag nach dem Regen den Regenbogen.',weather:'blueten',orbit:[138,1.6],size:1.05,col:['#B8E09A','#F4F2FF'],moons:2,ring:true,
    park:'wolkenwiese',parkPond:false,phone:['#CFE4FF','#FFE0F0'],stones:['kiesel','sternenstaub','findling'],plazaTree:'wolkenbaum',path:'#E8E4F4',
    space:{deep:'#C8D0F0',water:'#F6F4FF',shore:'#FFFFFF',land:'#B8E09A',land2:'#A6D48A',high:'#D8D0EC',cap:'#FFFFFF',atmo:'#FFE8F4',cloud:.8,sea:.55,capA:.3,freq:3.2},
    mac:{oc:-.35,m:.3,isl:1.6},climate:{hot:'regenbogenhain',wet:'nebelwald',cold:'windklippen'},peak:'schwebeinsel',
    raw(q,p,{N,N2,fbm}){/* Inseln: wo das Rauschen hoch ist, steigt das Land steil aus dem Wolkenmeer */const n=N(q.x*.55,q.y*.55,q.z*.55)+N2(q.x*1.3,q.y*1.3,q.z*1.3)*.35;const isl=sstep(-.05,.12,n);
      let h=-3.2+isl*(5.2+fbm(q,1.2,3)*1.6);/* Inselplateaus leicht gestuft */h+=sstep(.35,.5,n)*2;return h},
    biome({T,M,h,sea,low,nearPond,p}){if(low&&h<sea+.8)return'wolkenstrand';if(h>sea+6.4)return'schwebeinsel';if(M>.3||nearPond)return'nebelwald';if(T>.2)return'regenbogenhain';if(T<-.25||h>sea+5)return'windklippen';return'wolkenwiese'},
    onLoad:W=>WOLKEN.onLoad(W),tick:(dt,t,W,me)=>WOLKEN.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Windrosen-Platz',lat:90,lon:0,r:.17,h:1.2,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:300,r:.09,h:1.2,build:'house'},
    {id:'teich',n:'Himmelsweiher',lat:52,lon:120,r:.08,pond:true},{id:'teich2',n:'Regenschale',lat:40,lon:210,r:.09,pond:true}],
  biomes:BI,
  names:{casino:'Wolkenkuckucks-Casino',mode:'Federschneiderei',praxis:'Luftkur-Praxis',museum:'Himmelsmuseum',shop:'Ballon-Laden',studio:'Wolkenmal-Atelier',bar:'Aufwind-Bar',rathaus:'Windrosen-Rathaus',garage:'Luftschiff-Werft',pflanzen:'Ballonblumen-Gärtnerei',tiere:'Himmelszoo'},
  sty:{wall:'holz',walls:['#FFFFFF','#F4F0FF','#E8F4FF','#FFF1F6'],roof:'dome',roofs:['#FF8FA3','#56C6B6','#FFD35C','#8E6BD1'],trim:'#FFFFFF',plinth:'#D8D0EC',door:'#56C6B6',win:'rund',pitch:.9},
  wall:'wolken',floor:'dielen',
  mayor:['Kapitänin Brise',{skin:'pluesch',color:6,shape:'kugel'},{kopf:'vogel',augen:'kuller',arme:'fluegel',beine:'huhn',extras:['propeller']}],
  lore:['Unsere Inseln schweben, seit ein Riesenwal das Meer in Wolken verwandelt hat. So erzählen es die Alten.','Die Wolkenkissen federn dich zur nächsten Insel. Einfach draufspringen und festhalten!','Nach jedem Regen spannt sich ein Regenbogen. Wer schnell ist, findet an seinem Ende einen Topf voller Splitter.'],
  caveRock:['#D8D0EC','#B8B0D0','#8E8AB0',['#FFE8F4','#E8F4FF','#FFF6D8']],
  wear:['propellermuetze','wolkenschal','regenbogenpulli','halstuch','blumenkette'],clothes:CL,
  haus:{theme:{roof:['#FF8FA3','#56C6B6','#FFD35C'],wall:['#FFFFFF','#F4F0FF','#E8F4FF'],wood:['#C8945A','#E8C87A'],stone:['#D8D0EC','#B8B0D0'],trim:['#FFFFFF'],plant:['#B8E09A','#8FD06B']},
    props:[['nature','flower_purpleA',1.4,'d',0],['nature','plant_bushSmall',1.4,'c'],['town','lantern',1,'d',0],['town','banner-green',1,'c',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_yellowA'],veg:['crop_carrot']},
    plan:[{fam:'luftschiffhaus',style:'ballon'},{fam:'luftschiffhaus',style:'muehle'},{fam:'luftschiffhaus',style:'wolke'},{fam:'luftschiffhaus'}],fams:{luftschiffhaus}},
  residents:{skins:['pluesch','fell','glanz','haut','holografisch'],heads:['vogel','eule','hase','schaf','axolotl','katze','fuchs','maus'],names:['Brise','Zirrus','Nimbus','Föhn','Flocke','Stratos','Luvi','Wolkine','Pusteblum','Aura','Wirbelwind','Himmelhoch'],
    house:{shapes:['rund','huette'],walls:['holz','putz'],wallCols:['#FFFFFF','#F4F0FF','#E8F4FF'],roofCols:['#FF8FA3','#56C6B6'],win:['rund']},deco:['ballonblume','federgras','windrad'],fence:false},
  lang:{n:'Windschrift',ink:'#6E8EF0',glow:'#CFE4FF',kind:'wind',draw:windGlyph,syl:['ae','fu','shi','lo','ie','whu','sa','ou','fi','hei','la','ru']},ruinStone:'#D8D0EC',
  terraform:['wolkenwiese','regenbogenhain','nebelwald','wolkenstrand'],
  weather:[['klar',3],['heiter',3],['regen',3],['nebel',2],['gewitter',1]]});

/* ================= Planeten-Besonderheiten ================= */
const WOLKEN=(()=>{let W_=null,pads=[],bow=null,bowT=0,lastW=null,pot=null;const M=()=>makeMats({skin:'haut',color:0});
  const S=()=>SAVE.wolken=SAVE.wolken||{hops:0,bows:0,pots:0};
  function padModel(m){const g=new THREE.Group();const sd=Math.random()*9;const q=grp(g,[0,.2,0]);[[0,.3,0,.9],[.7,.22,.2,.6],[-.6,.25,-.1,.65],[.1,.22,.7,.55],[-.2,.25,-.7,.5]].forEach(([x,y,z,r],i)=>P(q,G.blob(r,.08,2,sd+i),m.c('#FFFFFF',{rim:.9,rimColor:'#dfe8ff'}),[x,y,z],null,[1,.55,1]));
    const ring=P(g,G.to(1.1,.05),m.glow('#FFE27A',1.2),[0,.12,0],[PI/2,0,0]);addOutlines(g);g.userData.q=q;g.userData.ring=ring;return g}
  function onLoad(W){W_=W;pads=[];bow=null;pot=null;lastW=WEATHER.cur;const m=M();const r=srand(5151);
    /* Wolkenkissen an Inselrändern, jeweils mit Ziel auf einer anderen Insel */const cand=[];for(let t=0;t<900&&cand.length<60;t++){const d=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(d.y>.96||!GAME.isLand(d))continue;const h=W.hAt(d);if(h<W.def.sea+1.2)continue;cand.push(d)}
    for(const d of cand){if(pads.length>=12)break;if(pads.some(p=>angle(p.d,d)*W.R<22))continue;
      /* Ziel: Land 28–60 m entfernt, dazwischen Wolkenmeer */let to=null;for(let k=0;k<30&&!to;k++){const tg=GAME.tangentTo(d,new V(r()*2-1,r()*2-1,r()*2-1));const e=d.clone().addScaledVector(tg,(28+r()*32)/W.R).normalize();if(!GAME.isLand(e)||e.y>.97)continue;const mid=d.clone().add(e).normalize();if(W.hAt(mid)<W.def.sea+.4)to=e}
      if(!to)continue;const g=padModel(m);GAME.placeObj(g,d,0,0);const P_={d,to,g};pads.push(P_);W.inter.push({kind:'wolkenkissen',p:d,r:1.8,label:'Auf das Wolkenkissen springen',act:()=>hop(P_)})}
    try{seaClouds(W)}catch(e){console.warn('Wolkenmeer',e)}}
  /* Wolkenmeer: grosse, langsam treibende Wolkenballen auf der Oberfläche */
  let seaPuffs=[];function seaClouds(W){const m=M();const r=srand(88);const mat=m.c('#FFFFFF',{rim:.9,rimColor:'#dfe8ff'});seaPuffs=[];
    for(let t=0,n=0;t<600&&n<46;t++){const d=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(GAME.isLand(d)||d.y>.9)continue;const g=new THREE.Group();const s=1.5+r()*2.5,sd=r()*9;
      [[0,0,0,1],[.8,-.1,.3,.7],[-.7,-.1,-.2,.75],[.2,.3,-.1,.6]].forEach(([x,y,z,k],i)=>P(g,G.blob(k*s,.08,2,sd+i),mat,[x*s,y*s,z*s],null,[1,.5,1]));addOutlines(g);
      const pos=d.clone().multiplyScalar(W.R+W.sea+.2);g.position.copy(pos);g.quaternion.setFromUnitVectors(new V(0,1,0),d);W.scene.add(g);seaPuffs.push({g,d,ph:r()*9});n++}}
  function hop(P_){const me=GAME.me;if(!me||me.script)return;const st=S();SND.play('powerup',{rate:1.4});P_.g.userData.q.scale.y=.5;GAME.W.fx(P_.d,'stern',8);
    const dist=angle(P_.d,P_.to)*W_.R;me.script={from:me.p.clone(),to:P_.to.clone(),dur:Math.max(2.2,dist/16),peak:Math.min(18,dist*.35),t:0,ease:k=>k,done:()=>{SND.play('soft');GAME.W.fx(P_.to,'staub',10);st.hops++;persist();
      if(st.hops===1)UI.toast('Hui! Die Wolkenkissen verbinden alle Inseln.',2600);if(st.hops===20){money(400);UI.toast('20 Wolkensprünge! Die Kapitänin zahlt dir 400 Taler Flugprämie.',3000)}}}}
  /* Regenbogen: aus sieben Bögen, Ende mit Topf */
  function makeBow(){if(bow)return;const me=GAME.me;if(!me)return;const W=W_;const m=M();let end=null;for(let k=0;k<30&&!end;k++){const tg=GAME.tangentTo(me.p,new V().randomDirection());const d=me.p.clone().addScaledVector(tg,(35+Math.random()*25)/W.R).normalize();if(GAME.isLand(d))end=d}if(!end)return;
    const g=new THREE.Group();const Rb=26;for(let i=0;i<7;i++){const mat=new THREE.MeshBasicMaterial({color:RAIN[i],transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});const t=new THREE.Mesh(new THREE.TorusGeometry(Rb-i*.9,.45,6,64,PI),mat);t.userData.noOutline=true;g.add(t)}
    GAME.placeObj(g,end,0,-2);/* Bogen so drehen, dass ein Ende am Topf steht */g.children.forEach(c=>c.position.x=Rb-3);g.rotateY(Math.random()*TAU);
    const pg=new THREE.Group();P(pg,G.cy(.5,.4,.6),m.c('#2E2A3E',{gloss:.6}),[0,.3,0]);P(pg,G.to(.5,.06),m.c('#2E2A3E'),[0,.6,0],[PI/2,0,0]);range(9,(t,i)=>P(pg,G.bx(.08,.3,.05,.02),m.glow(RAIN[i%7],1.4),[Math.cos(i*2.4)*.25,.72,Math.sin(i*2.4)*.25],[.3,i,0]));addOutlines(pg);
    const pd=g.localToWorld(new V(0,0,0)).normalize();GAME.placeObj(pg,end,0,0);pot={d:end,g:pg};W.inter.push({kind:'topf',p:end,r:1.6,label:'In den Regenbogentopf greifen',act:takePot,when:()=>!!pot});
    bow={g,life:150,age:0};UI.toast('Da! Ein Regenbogen. Wo er den Boden berührt, soll ein Topf stehen …',3200);S().bows++;persist()}
  function takePot(){if(!pot)return;const n=2+Math.floor(Math.random()*3);let got=0;for(let i=0;i<n;i++)if(typeof bagAdd==='function'&&bagAdd('item','regenbogensplitter'))got++;if(!got){UI.toast('Deine Tasche ist voll.');return}
    SND.jingle('j_success');UI.toast(got+' Regenbogen-Splitter! Sie funkeln in allen sieben Farben.',3000);S().pots++;persist();pot.g.parent&&pot.g.parent.remove(pot.g);W_.inter=W_.inter.filter(i=>i.kind!=='topf');pot=null}
  function clearBow(){if(bow){bow.g.parent&&bow.g.parent.remove(bow.g);bow=null}if(pot){pot.g.parent&&pot.g.parent.remove(pot.g);W_.inter=W_.inter.filter(i=>i.kind!=='topf');pot=null}}
  let chk=0;function tick(dt,t,W,me){for(const c of seaPuffs){c.g.rotateY(dt*.03);c.g.position.copy(c.d).multiplyScalar(W.R+W.sea+.2+Math.sin(t*.5+c.ph)*.15)}
    for(const p of pads){const q=p.g.userData.q;q.scale.y+=(1-q.scale.y)*Math.min(1,dt*4);q.position.y=.2+Math.sin(t*1.4+p.d.x*9)*.08;p.g.userData.ring.rotation.z=t*.5}
    chk-=dt;if(chk<=0){chk=2;const w=WEATHER.cur;if(lastW==='regen'&&w!=='regen'&&w!=='gewitter')makeBow();lastW=w}
    if(bow){bow.age+=dt;const a=Math.min(1,bow.age/4)*Math.min(1,(bow.life-bow.age)/6);bow.g.children.forEach(c=>c.material.opacity=Math.max(0,a*.55));if(bow.age>bow.life)clearBow()}}
  return{onLoad,tick,rainbow:makeBow,pads:()=>pads}
})();
window.WOLKEN=WOLKEN;
})();
