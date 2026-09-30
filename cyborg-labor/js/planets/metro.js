/* =====================================================================
   CYBORG-LABOR · planets/metro.js · Metro-Stadt (New-Donk-City-Stil)
   Art-déco-Innenstadt aus Kenney City Kit, Car Kit und Roads (CC0):
   Ringstrassen, Alleen, Wolkenkratzer, Parks und ein Hafen. Besonderheiten:
   · Taxis: an Taxiständen einsteigen und durch die Strassen fahren lassen.
   · Jazz-Festival: abends spielt eine Band auf der Bühne am Platz, du
     jammst mit den Tasten 1–8 mit und bekommst Trinkgeld.
   · Fassaden-Klettern: an Wolkenkratzern hochklettern, auf den Dächern
     warten Stadt-Medaillen und die beste Aussicht.
   ===================================================================== */
(function(){
const ID='metro';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,RP,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,stoneM}=NH;
const V=THREE.Vector3;const RP_=150;
/* Stadtplan in Polarkoordinaten um den Nordpol: Ringstrassen und vier Alleen */
const RING1=36,RING2=66,CITY=74,STREET=2.9,WALK=4.3,AVE=[0,PI/2,PI,PI*1.5].map(a=>a+PI/4);
function polar(p){const r=Math.acos(Math.max(-1,Math.min(1,p.y)))*RP_;const a=Math.atan2(p.z,p.x);return[r,a]}
function streetDist(r,a){let d=Math.min(Math.abs(r-RING1),Math.abs(r-RING2));if(r>RING1-2&&r<CITY+6)for(const b of AVE){let da=Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));d=Math.min(d,da*r)}return d}
const dirAt=(r,a)=>new V(Math.sin(r/RP_)*Math.cos(a),Math.cos(r/RP_),Math.sin(r/RP_)*Math.sin(a)).normalize();

/* ---------- Farben: New Donk City – Creme, Ziegelrot, Petrol, Gold ---------- */
const SCHEMES=[{wall:'#F4E6D0',trim:'#FFF8EC',stone:'#C8574A',roof:'#C8574A',roofB:'#B84A40',roof2:'#9E3E36',metal:'#3E5E7A',metalD:'#2E4A62',glass:'#8FD8F0',dark:'#2E2A3E',light:'#FFE08A',wood:'#8A5E48',plant:'#5FB86A'},
  {wall:'#E8D2B8',trim:'#FFF6E8',stone:'#3E7E8A',roof:'#3E7E8A',roofB:'#2E6A76',roof2:'#285E6A',metal:'#E8B04A',metalD:'#C8903A',glass:'#A8E0F4',dark:'#2E2A3E',light:'#FFE08A',wood:'#8A5E48',plant:'#5FB86A'},
  {wall:'#F2DCC0',trim:'#FFFFFF',stone:'#E8B04A',roof:'#E8B04A',roofB:'#D89A3A',roof2:'#C8883A',metal:'#5A4A7A',metalD:'#4A3A6A',glass:'#9FD0F8',dark:'#2E2A3E',light:'#FFE08A',wood:'#8A5E48',plant:'#5FB86A'},
  {wall:'#D8C8E0',trim:'#FFF6FF',stone:'#8E6BD1',roof:'#8E6BD1',roofB:'#7A5AC0',roof2:'#6A4AB0',metal:'#E8B04A',metalD:'#C8903A',glass:'#B8E8FF',dark:'#2E2A3E',light:'#FFE08A',wood:'#8A5E48',plant:'#5FB86A'},
  {wall:'#FFE4D8',trim:'#FFFFFF',stone:'#F0556E',roof:'#F0556E',roofB:'#D8465E',roof2:'#C03A52',metal:'#3E5E7A',metalD:'#2E4A62',glass:'#A8E0F4',dark:'#2E2A3E',light:'#FFE08A',wood:'#8A5E48',plant:'#5FB86A'}].map(s=>Object.assign({line:'#2E2A3E'},s));
function kitMesh(pack,piece,pal,h){if(typeof KIT==='undefined'||!KIT.has(pack,piece))return null;const b=KIT.bounds(pack,piece);const m=KIT.mesh(pack,piece,pal);const k=h/(b[4]-b[1]);m.scale.setScalar(k);m.position.y=-b[1]*k;m.userData.k=k;m.userData.b=b;return m}
/* Natur für Parks und Strassenrand */
function kitN(type,pack,piece,h,meta,pal){N(type,Object.assign({planet:ID},meta),(g,m,o,rnd)=>{const mm=kitMesh(pack,piece,pal||KIT.ORIG,h*(o.s||1)*RR(rnd,.9,1.1));if(mm){mm.rotation.y=rnd()*TAU;g.add(mm)}else P(g,G.s(.3),m.c('#5FB86A'),[0,.3,0])})}
kitN('strassenlaterne','roads','light-curved',4.4,{r:.25,h:4.4,size:'small'},SCHEMES[1]);
kitN('mülltonne','roads','dumpster',1.3,{r:.6,h:1.3,size:'small'},SCHEMES[1]);
kitN('parkbaum','town','tree',3.6,{r:.5,h:3.6,shake:true,size:'big'},KIT.ORIG);
N('hydrant',{r:.2,h:.7,size:'tiny',planet:ID},(g,m)=>{const rm=m.c('#F0556E',{gloss:.8});P(g,G.cy(.14,.16,.5),rm,[0,.25,0]);P(g,G.hs(.15),rm,[0,.5,0]);both(s=>P(g,G.cy(.06,.06,.16),rm,[s*.18,.32,0],[0,0,PI/2]));P(g,G.cy(.04,.04,.06),m.c('#FFD35C'),[0,.66,0])});
N('blumenkuebel',{r:.4,h:.9,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.cy(.4,.32,.5),m.c(RP(rnd,['#C8574A','#3E7E8A','#E8B04A'])),[0,.25,0]);for(let i=0;i<7;i++){const a=i/7*TAU;P(g,G.s(.12),m.c(RP(rnd,['#FF8FB1','#FFD35C','#FFFFFF'])),[Math.cos(a)*.22,.58,Math.sin(a)*.22])}P(g,G.s(.26),m.c('#5FB86A'),[0,.55,0],null,[1,.5,1])});
N('zeitungskiosk',{r:.8,h:2.4,size:'big',planet:ID},(g,m)=>{P(g,G.bx(1.5,1.6,1.1,.08),m.c('#3E7E8A'),[0,.8,0]);P(g,G.bx(1.8,.12,1.4,.05),m.c('#E8B04A'),[0,1.66,0]);P(g,G.bx(1.3,.5,.05,.03),m.c('#FFF8EC'),[0,1.25,.56]);for(let i=0;i<5;i++)P(g,G.bx(.22,.3,.03,.01),m.c(RP(srand(i),['#F0556E','#FFD35C','#8FD8F0','#FFFFFF'])),[-.5+i*.25,.8,.57])});
NH.ROCK[ID]=['#C8C4CC','#A8A4B0','#5FB86A'];

/* ---------- Biome ---------- */
const BI={
  strasse:{n:'Strasse',g:['#8E8A9A','#86829A'],cliff:'#6E6A7A',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,deco:[],decoD:0,rocks:[],rockD:0,litter:[['zeitung',.3]]},
  gehweg:{n:'Gehweg',g:['#D8D0C8','#CEC6BE'],cliff:'#A89E98',pat:'staub',grass:null,grassD:0,trees:[['parkbaum',.3]],treeD:.15,deco:[['hydrant',.6],['blumenkuebel',.8],['strassenlaterne',.8]],decoD:.9,rocks:[],rockD:0,litter:[['zeitung',.6],['hotdog',.15]]},
  stadtblock:{n:'Häuserblock',g:['#E4D8CC','#D8CCC0'],cliff:'#A89E98',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,deco:[['blumenkuebel',.4],['mülltonne',.3]],decoD:.4,rocks:[],rockD:0,litter:[['zeitung',.4]]},
  stadtpark:{n:'Stadtpark',g:['#8FD07A','#7CC46A'],cliff:'#9A8A7A',pat:'gras',grass:'#86CC72',grassD:1,trees:[['parkbaum',2],['eiche',1],['kirschbaum',1]],treeD:.7,deco:[['blume',4],['blumenbusch',2],['klee',2]],decoD:4,rocks:[['stein',.5]],rockD:.2,litter:[['ast',1],['beeren',.4]]},
  hafenkai:{n:'Hafenkai',g:['#C8B8A0','#B8A890'],cliff:'#8A7A6A',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,deco:[['mülltonne',.3],['kiesel',1]],decoD:.8,rocks:[['stein',.5]],rockD:.3,litter:[['ast',.5],['muschel',.3]]},
  huegelwiese:{n:'Stadtrand-Wiese',g:['#A8D878','#96C868'],cliff:'#A88A6A',pat:'gras',grass:'#9CD070',grassD:.9,trees:[['eiche',1.5],['birke',1],['busch',2]],treeD:.6,deco:[['blume',4],['grasbuesche',3],['loewenzahn',2]],decoD:5,rocks:[['findling',.4],['stein',1]],rockD:.4,litter:[['ast',1]]}};

/* ---------- Sammelsachen ---------- */
IT('zeitung',itMeta('Zeitung','metro','material',15),(g,m)=>{P(g,G.bx(.5,.04,.36,.01),m.c('#F4F0E8'),[0,.03,0],[0,.3,0]);for(let i=0;i<4;i++)P(g,G.bx(.4,.005,.03,.002),m.c('#6E6A7A'),[0,.055,-.12+i*.08],[0,.3,0]);P(g,G.bx(.2,.006,.12,.002),m.c('#F0556E'),[.08,.056,.1],[0,.3,0])});
IT('hotdog',itMeta('Hotdog','metro','essen',70),(g,m)=>{P(g,G.ca(.1,.4),m.c('#F2C48A'),[0,.1,0],[0,0,PI/2]);P(g,G.ca(.06,.46),m.c('#D8704E'),[0,.17,0],[0,0,PI/2]);P(g,G.tu([[-.2,.23,0],[-.1,.25,.02],[0,.23,-.02],[.1,.25,.02],[.2,.23,0]],.015,.015),m.c('#FFD35C'))});
IT('medaille',itMeta('Stadt-Medaille','metro','schatz',500),(g,m)=>{P(g,G.cy(.24,.24,.05),m.c('#FFD35C',{gloss:1.4,rim:.9}),[0,.26,0],[PI/2,0,0]);P(g,G.to(.18,.02),m.c('#E0A83A'),[0,.26,.03]);for(let i=0;i<5;i++){const a=i/5*TAU-PI/2;P(g,G.s(.03),m.c('#FFF8EC'),[Math.cos(a)*.1,.26+Math.sin(a)*.1,.03])}P(g,G.bx(.12,.2,.02,.01),m.c('#F0556E'),[0,.55,0])});
IT('schallplatte',itMeta('Schallplatte','metro','kunst',220),(g,m)=>{P(g,G.cy(.3,.3,.02),m.c('#2E2A3E',{gloss:1.2}),[0,.02,0]);P(g,G.cy(.1,.1,.025),m.c('#F0556E'),[0,.025,0]);for(let k=1;k<4;k++)P(g,G.to(.12+k*.05,.004),m.c('#4A4458'),[0,.032,0],[PI/2,0,0])});

/* ---------- Fische (Hafen und Parkteiche) ---------- */
F('hafenhering',fishMeta('Hafenhering','metro','meer','S','immer',1,110,'Ich hab einen Hafenhering gefangen! Er glänzt wie eine neue Münze.','Heringe leben in riesigen Schwärmen und verständigen sich angeblich mit Luftbläschen, die sie aus dem Darm entlassen. Ja, wirklich.'),
  (g,m)=>fishT(g,m,{id:'hafenhering',H:.18,L:.7,back:'#4E7AA8',belly:'#E8F0F8',tail:'fork',dorsal:'std'}));
F('zander',fishMeta('Zander','metro','meer','L','nacht',2,700,'Ich hab einen Zander gefangen! Seine Augen leuchten im Dunkeln wie Stadtlichter.','Zander sehen im Trüben besonders gut: Eine reflektierende Schicht hinter der Netzhaut verstärkt das Licht, wie bei Katzen.'),
  (g,m)=>fishT(g,m,{id:'zander',H:.18,L:.9,back:'#7A8A6A',belly:'#E8E8D8',tail:'fork',dorsal:'spiky',pat:(x,w,h,r)=>FT.bands(x,w,h,'#5A6A4A',[.3,.45,.6],6,.25)}));
F('brunnengoldfisch',fishMeta('Brunnen-Goldfisch','metro','teich','S','tag',1,160,'Ich hab einen Brunnen-Goldfisch gefangen! Der hat bestimmt schon viele Wünsche gehört.','In Stadtbrunnen landen jährlich viele Münzen. Manche Städte spenden das Geld – ein Goldfisch darin hat also einen sehr gemeinnützigen Arbeitsplatz.'),
  (g,m)=>fishT(g,m,{id:'brunnengold',H:.26,L:.55,back:'#FF9E3A',belly:'#FFE0A8',tail:'fancy',dorsal:'hi'}));
F('wels',fishMeta('Stadtwels','metro','meer','XL','nacht',3,1900,'Ich hab einen Stadtwels gefangen! Sein Schnurrbart ist gepflegter als meiner.','Welse schmecken mit dem ganzen Körper: Auf ihrer Haut sitzen Zehntausende Geschmacksknospen.'),
  (g,m)=>{const f=fishT(g,m,{id:'wels',H:.2,L:1,back:'#5A5A6A',belly:'#C8C0B8',tail:'round',dorsal:'none'});both(s=>P(g,G.tu([[s*.08,-.02,f.nz-.03],[s*.25,-.08,f.nz-.08],[s*.35,-.14,f.nz-.2]],.012,.006),m.c('#3E3E4A')))});
F('flussbarsch',fishMeta('Flussbarsch','metro','teich','M','tag',1,260,'Ich hab einen Flussbarsch gefangen! Gestreift wie ein Zebrastreifen.','Flussbarsche jagen oft im Team und treiben kleine Fische in die Enge. Ihre Rückenflosse ist stachelig – vorsichtig anfassen!'),
  (g,m)=>fishT(g,m,{id:'flussbarsch',H:.24,L:.62,back:'#7A9A5A',belly:'#F4E8C8',fin:'#FF8A5A',tail:'fork',dorsal:'spiky',pat:(x,w,h,r)=>FT.bands(x,w,h,'#3E5A2E',[.3,.42,.54,.66],7,.3)}));

/* ---------- Insekten ---------- */
B('balkonkaefer',bugMeta('Balkon-Marienkäfer','metro','blume','tag',1,120,'Ich hab einen Balkon-Marienkäfer gefangen! Er wohnt zwischen Geranien und Tomaten.','Marienkäfer fressen Blattläuse – bis zu 150 am Tag. Stadtgärtner:innen lieben sie deshalb.'),
  (g,m)=>{P(g,G.hs(.2),m.c('#F0404E',{gloss:1.2}),[0,.08,0]);P(g,G.s(.1),m.c('#2E2A3E'),[0,.1,.18]);range(6,(t,i)=>P(g,G.s(.04),m.c('#2E2A3E'),[Math.cos(i*1.1)*.12,.2,Math.sin(i*1.1)*.1]));bugFace(g,m,[0,.12,.2],.08,.6)});
B('laternenmotte',bugMeta('Laternenmotte','metro','luft','nacht',2,380,'Ich hab eine Laternenmotte gefangen! Sie wollte nur mal ins Licht.','Motten orientieren sich eigentlich am Mondlicht. Strassenlaternen verwirren sie – dunklere, warme Lampen helfen ihnen.'),
  (g,m)=>{P(g,G.ca(.05,.25),m.c('#C8B8A0'),[0,.3,0],[PI/2,0,0]);wingPair(g,m,m.c('#E8DCC8',{rim:.8}),leafShape(.35,.24),[0,.32,0],.7,.3,.3,.02);feelers(g,m.c('#8A7A6A'),m.c('#8A7A6A'),[.02,.32,.15],.2,.1,.4)});
B('parkgrille',bugMeta('Parkgrille','metro','boden','nacht',1,150,'Ich hab eine Parkgrille gefangen! Sie hat die ganze Nacht Jazz geübt.','Grillen zirpen, indem sie ihre Flügel aneinander reiben. Je wärmer es ist, desto schneller zirpen sie.'),
  (g,m)=>{const bm=m.c('#6E5A48',{gloss:.6});P(g,G.s(.14),bm,[0,.12,0],null,[.8,.6,1.4]);P(g,G.s(.09),bm,[0,.14,.2]);bugFace(g,m,[0,.15,.22],.07,.5);legs(g,bm,[[.1,.2,.1],[0,.2,0],[-.1,.3,-.1]],.12);feelers(g,bm,bm,[.02,.17,.28],.35,.2,.2)});
B('stadtbiene',bugMeta('Stadtbiene','metro','blume','tag',2,420,'Ich hab eine Stadtbiene gefangen! Sie wohnt auf dem Dach des Rathauses.','Auf vielen Stadtdächern stehen Bienenstöcke. Stadthonig ist oft besonders vielfältig, weil Städte viele verschiedene Pflanzen haben.'),
  (g,m)=>{const bm=m.c('#FFC23A',{gloss:.8});P(g,G.s(.14),bm,[0,.25,-.05],null,[.9,.9,1.2]);for(let i=0;i<3;i++)P(g,G.to(.12,.02),m.c('#2E2A3E'),[0,.25,-.1+i*.06],[0,0,0],[1,1,.5]);P(g,G.s(.09),m.c('#2E2A3E'),[0,.27,.14]);bugFace(g,m,[0,.28,.16],.07,.6);wingPair(g,m,m.c('#FFFFFF',{opacity:.6}),leafShape(.2,.1),[0,.34,0],.6,.5,.3,.015)});
B('hirschkaefer_park',bugMeta('Park-Hirschkäfer','metro','baum','nacht',4,2800,'Ich hab einen Park-Hirschkäfer gefangen! Er trägt ein Geweih, obwohl er gar kein Hirsch ist.','Hirschkäfer-Larven leben bis zu acht Jahre in totem Holz. Alte Parkbäume sind darum wichtige Kinderzimmer für sie.'),
  (g,m)=>{const bm=m.c('#6E3E2E',{gloss:1.1});P(g,G.s(.2),bm,[0,.15,-.05],null,[.9,.5,1.3]);P(g,G.s(.12),m.c('#4A2E22'),[0,.16,.2]);both(s=>P(g,G.tu([[s*.06,.17,.28],[s*.16,.2,.45],[s*.06,.22,.58]],.025,.012),bm));bugFace(g,m,[0,.17,.24],.08,.6);legs(g,bm,[[.12,.24,.12],[0,.26,0],[-.12,.24,-.12]],.14)});

/* ---------- Fundstücke ---------- */
REL('altes_ticket',relMeta('Strassenbahn-Ticket','metro','alltag',1,300,'Ein uraltes Strassenbahn-Ticket! Gültig bis … 1923. Knapp verpasst.','Die erste elektrische Strassenbahn der Welt fuhr 1881 in Berlin-Lichterfelde. Sie hatte nur eine Linie und war 2,5 Kilometer lang.'),
  (g,m)=>{P(g,G.bx(.6,.02,.3,.01),m.c('#FFE8B8'),[0,.02,0]);P(g,G.bx(.5,.005,.05,.002),m.c('#C8574A'),[0,.035,-.08]);for(let i=0;i<3;i++)P(g,G.cy(.02,.02,.03),m.c('#8A7458'),[.2-i*.06,.03,.08])});
REL('taxameter',relMeta('Messing-Taxameter','metro','technik',3,1600,'Ein Taxameter aus Messing! Er tickt noch ganz leise.','Das erste Taxameter wurde 1891 von Wilhelm Bruhn erfunden. Das Wort „Taxi" kommt genau daher.'),
  (g,m)=>{P(g,G.bx(.5,.6,.35,.06),m.c('#E8B04A',{gloss:1.2}),[0,.3,0]);P(g,G.cy(.14,.14,.04),m.c('#FFF8EC'),[0,.38,.19],[PI/2,0,0]);P(g,G.bx(.02,.12,.01,.005),m.c('#2E2A3E'),[0,.42,.21]);P(g,G.bx(.3,.1,.02,.01),m.c('#2E2A3E'),[0,.14,.18])});
REL('stadtplan',relMeta('Alter Stadtplan','metro','alltag',2,700,'Ein alter Stadtplan! Hier war der Park noch ein Sumpf.','Viele Grossstädte wuchsen auf ehemaligen Sümpfen oder Inseln. Manhattan etwa hatte früher über 50 Hügel, die abgetragen wurden.'),
  (g,m)=>{P(g,G.bx(.7,.02,.5,.01),m.c('#F4E6C8'),[0,.02,0]);for(let i=0;i<4;i++)P(g,G.bx(.6,.004,.02,.002),m.c('#B89A6A'),[0,.032,-.18+i*.12]);for(let i=0;i<5;i++)P(g,G.bx(.02,.004,.44,.002),m.c('#B89A6A'),[-.28+i*.14,.032,0]);P(g,G.s(.04),m.c('#F0556E'),[.1,.04,.05])});
REL('saxophon',relMeta('Goldenes Saxophon','metro','musik',4,3200,'Ein goldenes Saxophon! Auf dem Mundstück steht „Für die beste Band der Stadt".','Das Saxophon erfand Adolphe Sax um 1840. Er wollte ein Instrument, das so beweglich wie Holz- und so laut wie Blechbläser ist.'),
  (g,m)=>{const gm=m.c('#FFD35C',{gloss:1.4,rim:.8});P(g,G.tu([[0,.1,0],[0,.5,0],[.05,.7,0],[.15,.78,0]],.05,.03),gm);P(g,G.tu([[0,.1,0],[.1,.02,0],[.2,.1,0]],.05,.07),gm);P(g,G.co(.12,.14),gm,[.24,.14,0],[0,0,-.6]);range(5,(t,i)=>P(g,G.cy(.025,.025,.02),m.c('#FFF8EC'),[.04,.2+t*.3,.04],[PI/2,0,0]))});

/* ---------- Tiere ---------- */
Object.assign(FAUNA.S,{
  stadttaube:{n:'Stadttaube',planet:ID,biomes:['gehweg','stadtblock','stadtpark'],count:6,herd:true,size:.45,speed:1,voice:['gurr','rucku','gru-gru'],pitch:300,likes:['hotdog','beeren'],product:'zeitung',names:['Gurrli','Rucki','Frau Taube','Stefan','Brösel'],fact:'Tauben finden über hunderte Kilometer nach Hause – mit Hilfe des Magnetfelds, der Sonne und sogar von Geräuschen.',
    a:{col:'#A8B0C8',belly:'#C8D0E0',body:[.3,.3,.42],head:{r:.2,col:'#8A94B0',p:[0,.6,.3]},snout:{type:'beak',col:'#E8C0A8',len:.35},ears:{type:'none'},legs:{n:2,len:.1,r:.03,col:'#F07A7A',foot:'#F07A7A'},tail:{type:'fan',col:'#7A84A0'},wings:{col:'#98A0B8'},spots:{col:'#6FC8A0',n:2,s:1.2}}},
  waschbaer:{n:'Waschbär',planet:ID,biomes:['stadtpark','stadtblock'],count:3,size:.75,speed:1.2,night:true,shy:true,voice:['krrr','hihi','schmatz'],pitch:340,likes:['hotdog','beeren'],product:'zeitung',names:['Maske','Bandit','Wasch-Walter','Knopfauge','Ringel'],fact:'Waschbären „waschen" ihr Futter gar nicht: Sie tasten es im Wasser ab, weil ihre Pfoten nass noch empfindlicher sind.',
    a:{col:'#A8A0A8',belly:'#D8D0D0',body:[.34,.3,.42],head:{r:.25,p:[0,.55,.36]},snout:{type:'long',col:'#F4F0F0',nose:'#2E2A3E'},ears:{type:'round',x:.6,y:.62},legs:{n:4,len:.14,r:.06,foot:'#4A4458'},tail:{type:'bushy',len:.9,col:'#A8A0A8',tip:'#4A4458'},stripes:{col:'#4A4458',n:3}}},
  stadtfuchs:{n:'Stadtfuchs',planet:ID,biomes:['stadtpark','huegelwiese','hafenkai'],count:2,size:.8,speed:1.6,shy:true,night:true,voice:['wau-kek','kiek','hmpf'],pitch:380,likes:['hotdog'],product:'schallplatte',names:['Rotschopf','Flink','Mr. Fox','Laterne','Sirius'],fact:'Stadtfüchse haben sich an Menschen gewöhnt. In manchen Städten leben mehr Füchse pro Quadratkilometer als auf dem Land.',
    a:{col:'#F28A4A',belly:'#FFF1DC',body:[.3,.28,.46],head:{r:.25,p:[0,.55,.44]},snout:{type:'long',col:'#FFF1DC',nose:'#2E2A3E'},ears:{type:'pointy',len:.7,x:.55,y:.6,inner:'#2E2A3E'},legs:{n:4,len:.2,r:.05,foot:'#2E2A3E'},tail:{type:'bushy',len:1,tip:'#FFFFFF'}}},
  eichhoernchen:{n:'Eichhörnchen',planet:ID,biomes:['stadtpark','huegelwiese'],count:4,size:.45,speed:1.8,gait:'hop',voice:['tschuk','kik-kik'],pitch:560,likes:['beeren','apfel'],product:'ast',names:['Nüsschen','Flitz','Pinsel','Eichi','Hasel'],fact:'Eichhörnchen vergraben tausende Nüsse und finden nicht alle wieder – so pflanzen sie ganz nebenbei neue Bäume.',
    a:{col:'#C8704A',belly:'#FFF1DC',body:[.26,.28,.32],head:{r:.22,p:[0,.55,.26]},snout:{type:'dot',nose:'#4A3A2E'},ears:{type:'pointy',len:.5,x:.5,y:.7},legs:{n:4,len:.12,r:.05,foot:'#A85A3A'},tail:{type:'bushy',len:1.2,curl:1.4}}},
  dackel:{n:'Dackel',planet:ID,biomes:['gehweg','stadtpark'],count:2,size:.6,speed:1.1,voice:['wuff','wau!','hmpf'],pitch:360,likes:['hotdog'],product:'zeitung',names:['Würstchen','Frau Müller','Waldi','Keks','Brezel'],fact:'Dackel wurden gezüchtet, um in Dachsbaue zu kriechen – daher der Name und die kurzen Beine.',
    a:{col:'#A8603A',belly:'#C8805A',body:[.3,.24,.7],head:{r:.22,p:[0,.42,.72]},snout:{type:'muzzle',col:'#8A4A2E',nose:'#2E2A3E',len:1.1},ears:{type:'floppy',len:.8,x:.8,y:.3},legs:{n:4,len:.1,r:.06,foot:'#8A4A2E'},tail:{type:'long',len:.5,curl:.3}}}});

/* ---------- Kleidung ---------- */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','schiebermuetze','Schiebermütze',540,'#6E6A7A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.15,0],[-.1,0,0]);P(q,G.s(r*.85),M.c(col),[0,0,0],null,[1,.35,1.05]);P(q,G.s(r*.5),M.c(col),[0,-r*.04,r*.62],null,[1.2,.15,.8]);P(q,G.cy(r*.06,r*.06,r*.06),M.c(col),[0,r*.28,0])});
def('neck','fliege_gold','Goldene Fliege',620,'#E8B04A',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y-r*.05,r*.62]);both(s=>P(q,G.co(r*.16,r*.28),M.c(col,{gloss:1.2}),[s*r*.14,0,0],[0,0,s*PI/2]));P(q,G.s(r*.07),M.c(shade(col,.8)),[0,0,0])});
def('top','jazzsakko','Jazz-Sakko',1200,'#8E6BD1',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y-r*.55,0]);P(q,G.cy(r*.72,r*.95,r*1.1,true),M.c(col,{rim:.5}),[0,0,0]);both(s=>P(q,G.bx(r*.18,r*.7,r*.06,r*.02),M.c(shade(col,.8)),[s*r*.2,r*.2,r*.8],[0,s*.3,0]));for(let i=0;i<2;i++)P(q,G.s(r*.06),M.c('#E8B04A',{gloss:1}),[0,-r*.1-i*r*.25,r*.9])});

/* ---------- Bau-Familie: Stadthäuser aus dem City Kit ---------- */
const TOWNHOUSES=['building-a','building-b','building-c','building-d','building-f','building-g','building-h'];
function stadthaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.35:1;const piece=plan.civic?A.pick(r,['building-i','building-l','building-n','building-j']):A.pick(r,TOWNHOUSES);const sch=A.pick(r,SCHEMES);
  const b=KIT.bounds('metro',piece);if(!b){const mm=new THREE.Mesh(G.bx(2.4,3,2.4,.1),cozy({color:sch.wall}));mm.position.y=1.5;g.add(mm);return{g,R:2,top:3,door:[0,-1.25],walls:[new THREE.Box3(new V(-1.2,0,-1.2),new V(1.2,3,1.2))],style:'stadthaus'}}
  const W0=Math.max(b[3]-b[0],b[5]-b[2]);const k=(2.9*big)/W0;const mm=KIT.mesh('metro',piece,sch);mm.scale.setScalar(k);mm.position.set(-(b[0]+b[3])/2*k,-b[1]*k,-(b[2]+b[5])/2*k);const piv=new THREE.Group();piv.add(mm);piv.rotation.y=PI;g.add(piv);
  const hw=(b[3]-b[0])*k/2,hd=(b[5]-b[2])*k/2,top=(b[4]-b[1])*k;
  /* Markise + Tür vorne (−z) */if(KIT.has('metro','detail-awning-wide')){const aw=KIT.mesh('metro','detail-awning-wide',sch);const ab=KIT.bounds('metro','detail-awning-wide');const ak=1.4/(ab[3]-ab[0]);aw.scale.setScalar(ak);aw.position.set(0,1.05,-hd-.02-(ab[5])*ak);aw.rotation.y=PI;g.add(aw)}
  const dr=A.archDoor(A.pick(r,['#3E5E7A','#C8574A','#2E2A3E','#E8B04A']),'#FFF8EC');dr.position.set(0,0,-hd-.01);dr.rotation.y=PI;g.add(dr);
  return{g,R:Math.max(hw,hd)+.7,top,door:[0,-hd-.01],walls:[new THREE.Box3(new V(-hw,0,-hd),new V(hw,top,hd))],style:'stadthaus-'+piece}}

/* ---------- Sprache: Art-déco-Zeichen ---------- */
function decoGlyph(x,s,r,R){const k=Math.floor(r()*4);x.beginPath();if(k===0){/* Fächer */for(let i=0;i<5;i++){const a=-PI*.85+i*PI*.175;x.moveTo(0,s*.3);x.lineTo(Math.cos(a)*s*.42,s*.3+Math.sin(a)*s*.42)}}
  else if(k===1){/* Stufen */x.moveTo(-s*.35,s*.35);x.lineTo(-s*.35,s*.1);x.lineTo(-s*.12,s*.1);x.lineTo(-s*.12,-s*.15);x.lineTo(s*.12,-s*.15);x.lineTo(s*.12,-s*.38);x.moveTo(s*.12,-s*.15);x.lineTo(s*.35,-s*.15);x.lineTo(s*.35,s*.35)}
  else if(k===2){/* Sonne mit Strahlen */x.arc(0,s*.2,s*.16,PI,0);for(let i=0;i<5;i++){const a=PI+i*PI/4;x.moveTo(Math.cos(a)*s*.22,s*.2+Math.sin(a)*s*.22);x.lineTo(Math.cos(a)*s*.4,s*.2+Math.sin(a)*s*.4)}}
  else{/* Raute mit Linien */x.moveTo(0,-s*.38);x.lineTo(s*.25,0);x.lineTo(0,s*.38);x.lineTo(-s*.25,0);x.closePath();x.moveTo(-s*.4,0);x.lineTo(s*.4,0)}x.stroke()}

/* ---------- Planet ---------- */
const buehne={lat:90-16/RP_*180/PI,lon:200};
PLANETKIT.add(ID,{
  def:{n:'Metro-Stadt',base:'kompost',path:'#D6D0CC',R:RP_,R0:50,sea:-.3,music:'town',sky:['#8fc8ff','#ffe8d0'],fog:'#e8e4f4',water:'#5AB8E0',deep:'#2E78B0',step:1.1,shop:ID,
    desc:'Art-déco-Innenstadt mit Wolkenkratzern, Taxis, Hafen und einem Jazz-Festival am Abend.',weather:'blueten',orbit:[124,4.6],size:1.1,col:['#E8D2B8','#5AB8E0'],packs:['metro','cars','roads'],moons:1,ring:true,
    park:'stadtpark',parkPond:true,phone:['#FFD8A8','#B8C8FF'],stones:['stein_klein','kiesel','medaille'],terr:.55,
    space:{deep:'#2E78B0',water:'#5AB8E0',shore:'#E8DCC8',land:'#D8CCC0',land2:'#8FD07A',high:'#C8574A',cap:'#FFF8EC',atmo:'#FFD8A8',cloud:.35,sea:.4,capA:.8,freq:3.2},
    mac:{oc:-.08,m:.35,isl:.8},climate:{wet:'hafenkai'},peak:'huegelwiese',
    raw(q,p,{N,N2,N3,fbm}){const[r]=polar(p);let h=fbm(q,1.1,6)*2+1;const city=sstep(CITY+22,CITY+4,r);return h*(1-city)+.9*city},
    biome({T,M,h,sea,low,nearPond,p}){const[r,a]=polar(p);if(r<CITY+4){if(r<RING1-5)return M>.28?'stadtpark':'stadtblock';const sd=streetDist(r,a);if(sd<STREET)return'strasse';if(sd<WALK)return'gehweg';
        const blk=Math.floor(a/(PI/8))+Math.floor(r/15);return(blk%5===0)?'stadtpark':'stadtblock'}if(low&&!nearPond)return'hafenkai';return'huegelwiese'},
    onLoad:G=>METRO.onLoad(G),tick:(dt,t,G,me)=>METRO.tick(dt,t,G,me)},
  places:[{id:'platz',n:'Rathausplatz',lat:90,lon:0,r:.16,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:54,lon:300,r:.08,h:.9,build:'house'},
    {id:'teich',n:'Parkteich',lat:50,lon:120,r:.07,pond:true},{id:'see',n:'Hafenbecken',lat:18,lon:230,r:.16,pond:true},{id:'buehne',n:'Jazz-Bühne',lat:buehne.lat,lon:buehne.lon,r:.035,h:.9}],
  biomes:BI,
  names:{casino:'Grand Casino Deco',mode:'Boutique Broadway',praxis:'Stadtklinik',museum:'Stadtmuseum',shop:'Kaufhaus Kosmos',studio:'Loft-Atelier',bar:'Blue Note Bar',rathaus:'Rathaus',garage:'Taxi-Garage',pflanzen:'Dachgarten',tiere:'Tierheim Pfote'},
  sty:{wall:'ziegel',walls:['#F4E6D0','#E8D2B8','#F2DCC0','#FFE4D8'],roof:'flat',roofs:['#C8574A','#3E7E8A','#E8B04A'],trim:'#FFF8EC',plinth:'#8E8A9A',door:'#3E5E7A',win:'eckig'},
  wall:'streifen',floor:'fliesen',
  mayor:['Bürgermeisterin Pauline',{skin:'haut',color:1,shape:'birne'},{kopf:'mensch',augen:'wimpern',arme:'mensch',beine:'mensch',extras:['krone']}],
  lore:['Willkommen in der Metro-Stadt! Hier schläft niemand – und wenn doch, dann nach dem Jazz-Festival.','Wer mutig ist, klettert an den Wolkenkratzern hoch. Auf manchen Dächern liegen Stadt-Medaillen.','Unsere Taxis bringen dich überallhin. Einfach am Taxistand einsteigen!'],
  caveRock:['#B8B4C0','#98949C','#5E5A68',['#FFE08A','#FFF0C0','#F8D878']],
  wear:['schiebermuetze','fliege_gold','jazzsakko','zylinder','fliege','regenjacke'],clothes:CL,
  haus:{theme:{roof:['#C8574A','#3E7E8A','#E8B04A'],wall:['#F4E6D0','#E8D2B8','#F2DCC0'],wood:['#8A5E48'],stone:['#C8C4CC','#B8B4C0'],trim:['#FFF8EC'],plant:['#5FB86A'],metal:['#3E5E7A']},
    props:[['nature','pot_large',1.3,'d',0],['nature','plant_bushSmall',1.2,'c',0],['market','display-fruit',1,'d',PI],['nature','plant_bushDetailed',1.3,'cb']],
    garden:{path:'path_stone',flowers:['flower_redA','flower_yellowA'],veg:null},
    plan:[{fam:'stadthaus'},{fam:'stadthaus'},{fam:'stadthaus'}],fams:{stadthaus}},
  residents:{skins:['haut','plastik','chrom','fell','keramik'],heads:['mensch','katze','vogel','monitor','lautsprecher','eule','ampel','uhr','raumhelm'],names:['Pauline','Luigi','Broadway-Betty','Taxi-Toni','Jazz-Jojo','Neon','Hochhaus-Hans','Kiosk-Kim','Nora Nachtschicht','Saxo','Metro-Mia','Pendel-Paul'],
    house:{shapes:['turm','spitz'],walls:['stein'],wallCols:['#F4E6D0','#E8D2B8'],roofCols:['#C8574A','#3E7E8A'],win:['eckig']},deco:['blumenkuebel','hydrant'],fence:false},
  lang:{n:'Déco-Schrift',ink:'#2E4A62',glow:'#FFE08A',kind:'deco',draw:decoGlyph,syl:['ka','zi','ro','bo','do','ne','ja','lu','po','mi','va','xo']},ruinStone:'#D8C8B0',
  terraform:['stadtpark','huegelwiese','hafenkai'],
  weather:[['klar',3],['heiter',2],['regen',2],['nebel',1],['gewitter',1]]});

/* ================= Besonderheiten ================= */
const METRO=(()=>{let W=null,towers=[],cars=[],stands=[],taxi=null,roof=null,stage=null,jam=null,beat=0;const M=()=>makeMats({skin:'haut',color:0});
  const S=()=>SAVE.metro=SAVE.metro||{medals:{},rides:0,tips:0};
  const onSurf=(d,off)=>d.clone().multiplyScalar(W.R+W.hAt(d)+(off||0));
  function onLoad(Wld){W=Wld;towers=[];cars=[];stands=[];taxi=null;roof=null;jam=null;const m=M();const r=srand(1234);
    /* Wolkenkratzer auf den Blöcken zwischen den Ringen */const SKY=['building-skyscraper-a','building-skyscraper-b','building-skyscraper-c','building-skyscraper-d','building-skyscraper-e','building-m','building-l','building-n'];
    for(let rr=RING1+9;rr<CITY+4;rr+=10)for(let a=r()*.2;a<TAU;a+=(10+r()*4)/rr){const sd=streetDist(rr,a);if(sd<WALK+3)continue;const d=dirAt(rr+RR(r,-2,2),a);if(GAME.nearPlace&&GAME.nearPlace(d,1.3))continue;
      const piece=SKY[Math.floor(r()*SKY.length)];const sch=SCHEMES[Math.floor(r()*SCHEMES.length)];const b=KIT.bounds('metro',piece);if(!b)continue;const k=4.6+r()*1.4;const mm=KIT.mesh('metro',piece,sch);mm.scale.setScalar(k);mm.position.set(-(b[0]+b[3])/2*k,-b[1]*k,-(b[2]+b[5])/2*k);
      const g=new THREE.Group();g.add(mm);const toC=Math.atan2(-d.z,-d.x);GAME.placeObj(g,d,0,-.05);g.up.copy(d);g.lookAt(onSurf(dirAt(rr-5,a),0));W.scene.add(g);const rad=Math.max(b[3]-b[0],b[5]-b[2])*k*.55;GAME.addObst(d,rad);
      const h=(b[4]-b[1])*k;const id='tw'+towers.length;const tw={id,d,g,h,rad};towers.push(tw);
      /* Kletter-Stelle vorn + Medaille oben */const front=dirAt(rr-rad/RP_*RP_-1.2,a);W.inter.push({kind:'klettern',p:front,r:1.6,label:'Fassade hochklettern',act:()=>climb(tw,front),when:()=>!roof});
      if(r()<.45&&!S().medals[id]){const md=new THREE.Group();P(md,G_c(.4),m.c('#FFD35C',{gloss:1.4,rim:.9}),[0,0,0],[PI/2,0,0]);P(md,G.to(.3,.04),m.c('#E0A83A'),[0,0,.04]);md.userData.spin=true;tw.medal=md;GAME.placeObj(md,d,0,h+.8);W.scene.add(md)}}
    /* Strassenlaternen, Ampeln entlang Ring 1 */for(let a=0;a<TAU;a+=12/RING1){const d=dirAt(RING1+STREET+.6,a);const l=kitMesh('roads','light-curved',SCHEMES[1],4.4);if(l){const g=new THREE.Group();g.add(l);GAME.placeObj(g,d,0,0);g.up.copy(d);g.lookAt(onSurf(dirAt(RING1,a),0));addOutlines(g);W.scene.add(g)}}
    for(const b of AVE){const d=dirAt(RING1+STREET+1.4,b+.05);const t=kitMesh('roads','traffic-light',SCHEMES[1],4);if(t){const g=new THREE.Group();g.add(t);GAME.placeObj(g,d,b,0);W.scene.add(g)}}
    /* Fahrbahnmarkierungen: gestrichelte Mittellinien auf Ringen und Alleen (eine zusammengeführte Geometrie) */{const geos=[];const tmp=new THREE.Object3D();const dash=(d,d2)=>{const gg=new THREE.BoxGeometry(.18,.03,1.4);tmp.position.copy(onSurf(d,.03));tmp.up.copy(d);tmp.lookAt(onSurf(d2,.03));tmp.updateMatrix();gg.applyMatrix4(tmp.matrix);geos.push(gg)};
      for(const rr of[RING1,RING2])for(let a=0;a<TAU;a+=3/rr)dash(dirAt(rr,a),dirAt(rr,a+.2/rr));for(const b of AVE)for(let rr=RING1+4;rr<CITY+4;rr+=3)dash(dirAt(rr,b),dirAt(rr+.2,b));
      const mg=THREE.BufferGeometryUtils.mergeBufferGeometries(geos);geos.forEach(x=>x.dispose());const lines=new THREE.Mesh(mg,m.c('#FFF6DC',{rim:0}));lines.receiveShadow=true;W.scene.add(lines)}
    /* Verkehr: Autos auf beiden Ringen */const CARS=['sedan','van','suv','delivery','hatchback-sports','police','taxi','sedan-sports'];for(let i=0;i<9;i++){const outer=i>=5;const rr=(outer?RING2:RING1)+(i%2?1.3:-1.3);const car=kitMesh('cars',CARS[i%CARS.length],KIT.ORIG,2.1);if(!car)continue;const g=new THREE.Group();g.add(car);W.scene.add(g);cars.push({g,rr,a:i/5*TAU+r(),v:(i%2?1:-1)*(5+r()*2)})}
    /* Taxistände */for(let i=0;i<4;i++){const a=AVE[i]+.12;const rr=i%2?RING2-WALK:RING1+WALK;const d=dirAt(rr,a);const g=new THREE.Group();const car=kitMesh('cars','taxi',KIT.ORIG,2.1);if(car){car.rotation.y=PI/2;car.position.x=1.6;g.add(car)}
      P(g,G.cy(.05,.05,2.4),m.c('#2E2A3E'),[0,1.2,0]);P(g,G.bx(1,.5,.08,.04),m.c('#FFD35C'),[0,2.3,0]);addOutlines(g);GAME.placeObj(g,d,a,0);W.scene.add(g);const st={i,d,g,n:['Nord-Taxistand','Ost-Taxistand','Süd-Taxistand','West-Taxistand'][i]};stands.push(st);
      W.inter.push({kind:'taxi',p:d,r:2.4,label:'Taxi rufen',act:()=>taxiMenu(st)})}
    /* Jazz-Bühne */const pl=W.places.find(p=>p.id==='buehne');if(pl){stage=buildStage(m);GAME.placeObj(stage,pl.dir,0,0);stage.up.copy(pl.dir);stage.lookAt(onSurf(W.places[0].dir,0));W.scene.add(stage);GAME.addObst(pl.dir,2.4);
      W.inter.push({kind:'jazz',p:pl.dir,r:4,label:'Beim Jazz-Festival mitspielen',act:()=>startJam(pl.dir)})}}
  const G_c=r=>G.cy(r,r,.08);
  function buildStage(m){const g=new THREE.Group();P(g,G.cy(3.4,3.6,.5,false),m.c('#3E3A52'),[0,.25,0]);P(g,G.cy(3.3,3.3,.06),m.c('#8E6BD1'),[0,.52,0]);
    /* Art-déco-Muschel mit Glühbirnen */const shell=grp(g,[0,.5,-2.2]);for(let i=0;i<7;i++){const a=PI*.1+i/6*PI*.8;P(shell,G.bx(.6,3.4,.12,.05),m.c(i%2?'#E8B04A':'#F4E6D0'),[Math.cos(a)*1.6,Math.sin(a)*1.9,0],[0,0,a-PI/2])}
    const bulbs=[];for(let i=0;i<16;i++){const a=PI*.08+i/15*PI*.84;bulbs.push(P(shell,G.s(.1),m.glow('#FFE08A',1.8),[Math.cos(a)*3.1,Math.sin(a)*3.3,.1]))}g.userData.bulbs=bulbs;
    /* Instrumente */const piano=grp(g,[-1.6,.55,-.6]);P(piano,G.bx(1.4,.9,.7,.06),m.c('#2E2A3E',{gloss:1.2}),[0,.45,0]);P(piano,G.bx(1.3,.06,.2,.01),m.c('#FFFDF7'),[0,.92,.3]);
    const drums=grp(g,[1.5,.55,-.8]);P(drums,G.cy(.4,.4,.5),m.c('#F0556E',{gloss:.8}),[0,.3,0],[PI/2,0,0]);P(drums,G.cy(.25,.25,.25),m.c('#F0556E'),[.5,.6,.2]);P(drums,G.cy(.3,.3,.02),m.c('#FFD35C',{gloss:1.4}),[-.5,1.1,.1]);
    const bass=grp(g,[0,.55,-1.1]);P(bass,G.s(.4),m.c('#A8603A',{gloss:1}),[0,.6,0],null,[1,1.5,.5]);P(bass,G.cy(.04,.04,1.3),m.c('#2E2A3E'),[0,1.5,0]);
    g.userData.inst=[piano,drums,bass];addOutlines(g);return g}
  /* Taxi: Ziel wählen, Fahrt entlang der Strassen */
  async function taxiMenu(st){const opts=stands.filter(s=>s!==st).map(s=>s.n).concat(['Rathausplatz','Abbrechen']);const ch=await UI.talk('Taxi-Toni',['Hallo! Wohin darf es gehen? Fahrt 20 Taler.'],{choices:opts,voice:{pitch:180}});
    if(ch==null||ch>=opts.length-1)return;if(SAVE.money<20){UI.toast('Nicht genug Taler für die Fahrt.');return}money(-20);const S2=S();S2.rides++;persist();
    const dest=ch<stands.length-1?stands.filter(s=>s!==st)[ch].d:W.places[0].dir;ride(st.d,dest)}
  function ride(from,to){const me=GAME.me;const[r0,a0]=polar(from),[r1,a1]=polar(to);const pts=[from];const ringR=RING1+1.3;pts.push(dirAt(ringR,a0));let da=Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0));const n=Math.max(1,Math.ceil(Math.abs(da)*ringR/12));
    for(let i=1;i<=n;i++)pts.push(dirAt(ringR,a0+da*i/n));pts.push(to);const car=kitMesh('cars','taxi',KIT.ORIG,2.1);const g=new THREE.Group();if(car)g.add(car);W.scene.add(g);taxi={g};me.g.visible=false;SND.play('door_close');
    let i=0;const next=()=>{if(i>=pts.length-1){W.scene.remove(g);taxi=null;me.g.visible=true;me.lift=0;SND.play('door_open');UI.toast('Da wären wir! Danke, dass du mit Taxi-Toni gefahren bist.',2600);return}
      const a=pts[i],b=pts[i+1];i++;const dist=angle(a,b)*W.R;me.script={from:a.clone(),to:b.clone(),dur:Math.max(.4,dist/9),peak:0,t:0,done:next}};next()}
  /* Klettern */
  function climb(tw,front){const me=GAME.me;if(me.script)return;SND.play('cloth');UI.toast('Du kletterst die Fassade hoch …',2000);
    me.script={from:front.clone(),to:tw.d.clone(),dur:Math.max(1.8,tw.h/5),peak:0,t:0,base:0,baseTo:tw.h,keepLift:true,ease:k=>k,done:()=>{roof=tw;SND.play('powerup',{rate:1.2});GAME.W.fx(tw.d,'stern',12,onSurf(tw.d,tw.h+1));
      if(tw.medal&&!S().medals[tw.id]){S().medals[tw.id]=true;persist();W.scene.remove(tw.medal);tw.medal=null;money(150);if(bagAdd('item','medaille'))UI.toast('Stadt-Medaille gefunden! Plus 150 Taler. Mit E springst du wieder hinunter.',3400);else UI.toast('Stadt-Medaille! Plus 150 Taler.',2600)}
      else UI.toast('Was für eine Aussicht! Mit E springst du wieder hinunter.',3000);W.inter.push({kind:'runter',p:tw.d,r:tw.rad+3,label:'Hinunterspringen',act:jumpDown,when:()=>roof===tw})}}}
  function jumpDown(){const me=GAME.me;if(!roof||me.script)return;const tw=roof;roof=null;const out=GAME.tangentTo(tw.d,me.dir);const land=tw.d.clone().applyAxisAngle(new V().crossVectors(tw.d,out).normalize(),(tw.rad+2)/W.R).normalize();SND.play('whoosh');
    me.script={from:me.p.clone(),to:land,dur:1.3,peak:1,t:0,base:tw.h,baseTo:0,ease:k=>k*k,done:()=>{me.lift=0;SND.play('soft');GAME.W.fx(land,'staub',10)}};W.inter=W.inter.filter(i=>i.kind!=='runter')}
  /* Jazz-Festival (abends): Mitspielen mit Tasten 1–8 */
  const festival=()=>{const h=GAMETIME.hour();return h>=17||h<1};
  function startJam(at){if(!festival()){UI.talk('Plakat',['Jazz-Festival! Jeden Abend ab 17 Uhr auf dieser Bühne. Bring gute Laune mit.']);return}
    if(jam){return}if(typeof JAZZ==='undefined'){UI.toast('Die Band stimmt noch ihre Instrumente.');return}JAZZ.start();jam={at,notes:0};
    UI.toast('Die Band spielt! Mit den Tasten 1 bis 8 jammst du mit. Jeder Ton im Takt bringt Trinkgeld.',4200)}
  addEventListener('keydown',e=>{if(!jam||e.repeat)return;const n=parseInt(e.key,10);if(n>=1&&n<=8){try{JAZZ.playKey(n-1)}catch(x){}jam.notes++;if(jam.notes%8===0){money(6);const S2=S();S2.tips+=6;persist();GAME.W.fx(GAME.me.p,'note',4);MOTION&&MOTION.pop(document.getElementById('money'))}}});
  function stopJam(){if(!jam)return;try{JAZZ.stop()}catch(x){}SND.music(W.def.music);UI.toast('Danke fürs Mitspielen! Trinkgeld gesamt: '+S().tips+' Taler.',2800);jam=null}
  function tick(dt,t,G,me){
    for(const c of cars){c.a+=c.v*dt/c.rr;const d=dirAt(c.rr,c.a);const d2=dirAt(c.rr,c.a+Math.sign(c.v)*.02);GAME.placeObj(c.g,d,0,0);c.g.up.copy(d);c.g.lookAt(onSurf(d2,0))}
    for(const tw of towers)if(tw.medal){tw.medal.rotateY(dt*1.5)}
    if(taxi&&me){GAME.placeObj(taxi.g,me.p,0,0);const ah=me.p.clone().addScaledVector(me.dir,.01).normalize();taxi.g.up.copy(me.p);taxi.g.lookAt(onSurf(ah,0))}
    if(roof&&me&&!me.script){/* Dach: nicht über die Kante laufen */if(angle(me.p,roof.d)*G.R>roof.rad*.9){jumpDown()}}
    if(stage){const on=festival();stage.userData.bulbs.forEach((b,i)=>{b.visible=on;b.scale.setScalar(on?1+Math.max(0,Math.sin(t*6+i))*.3:1)});if(jam||on)stage.userData.inst.forEach((o,i)=>{o.position.y=.55+Math.abs(Math.sin(t*(jam?7:3)+i*1.3))*.08})}
    if(jam&&me&&(angle(me.p,jam.at)*G.R>14||!festival()))stopJam()}
  return{onLoad,tick,towers:()=>towers}
})();
window.METRO=METRO;
})();
