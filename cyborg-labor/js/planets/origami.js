/* =====================================================================
   CYBORG-LABOR · planets/origami.js · Origami-Planet
   Alles ist aus Papier gefaltet: kantige Bäume in Stufen, Lotusblüten,
   Fächerpalmen, Felsen mit Knickkanten. Besonderheiten:
   · Wunschbaum: aus Buntpapier faltest du Kraniche. Jeder Kranich fliegt
     zum Wunschbaum auf dem Dorfplatz und bleibt dort hängen – der Baum
     wird mit jedem Kranich bunter. Bei 10, 50 und 100 gibt es Geschenke.
   · Papierflieger: an vier Starttürmen faltest du einen Flieger und
     segelst zum nächsten Turm.
   ===================================================================== */
(function(){
const ID='origami';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,butterfly,fin2}=NH;
const V=THREE.Vector3;
const PAP=['#FF8FA3','#FFD35C','#56C6B6','#8E6BD1','#FF9E6E','#7CC46A','#6E8EF0','#FFFFFF'];
/* flach schattiertes Papier: Facetten sichtbar lassen */
const fp=(m,c,o)=>{const mt=m.c(c,Object.assign({rim:.35},o||{}));if(mt.flatShading!==undefined){mt.flatShading=true;mt.needsUpdate=true}return mt};
function crane(g,m,col,s,pos,rot){const q=grp(g,pos||[0,0,0],rot||[0,0,0]);s=s||1;const pm=fp(m,col);P(q,G.co(.08*s,.36*s,4),pm,[0,0,0],[PI/2,PI/4,0],[1,1,.5]);
  both(k=>P(q,G.co(.2*s,.03*s,3),pm,[k*.17*s,.05*s,0],[0,0,k*PI/2],[1,1,2.6]));P(q,G.co(.025*s,.26*s,4),pm,[0,.12*s,.22*s],[-.7,PI/4,0]);P(q,G.co(.025*s,.24*s,4),pm,[0,.1*s,-.22*s],[.8,PI/4,0]);return q}

/* ================= Natur ================= */
N('faltbaum',{r:.4,h:4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,1,1.4);const col=['#7CC46A','#56C6B6','#FF8FA3','#FFD35C'][Math.floor(rnd()*4)];P(g,G.cy(.1,.14,h,4),fp(m,'#C8945A'),[0,h/2,0],[0,PI/4,0]);
  for(let i=0;i<4;i++){const r=1.3-i*.28,y=h+i*.62;P(g,G.co(r,.9,6+(i%2)*2),fp(m,i%2?col:shade(col,1.12)),[0,y+.45,0],[0,i*.4,0])}});
N('lotusblume',{r:.4,h:.6,size:'small',planet:ID},(g,m,o,rnd)=>{const col=['#FF8FA3','#FFFFFF','#FFD35C','#C6A9FF'][Math.floor(rnd()*4)];for(let k=0;k<2;k++)for(let i=0;i<6;i++){const a=i/6*TAU+k*.5;P(g,G.co(.12,.4-k*.1,4),fp(m,k?shade(col,1.1):col),[Math.cos(a)*.14,.2+k*.05,Math.sin(a)*.14],[Math.sin(a)*(.7-k*.3),0,-Math.cos(a)*(.7-k*.3)],[1,1,.4])}
  P(g,G.cy(.08,.1,.1,6),fp(m,'#FFD35C'),[0,.22,0]);P(g,G.cy(.4,.4,.02,6),fp(m,'#7CC46A'),[0,.02,0])});
N('faecherpalme',{r:.35,h:3.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.4,3.2);P(g,G.cy(.08,.14,h,5),fp(m,'#C8945A'),[0,h/2,0]);const col=['#7CC46A','#56C6B6','#8FD06B'][Math.floor(rnd()*3)];
  for(let i=0;i<5;i++){const q=grp(g,[0,h,0],[0,i/5*TAU+rnd()*.2,-.5]);for(let k=0;k<7;k++){P(q,G.bx(.14,.02,1.2,.005),fp(m,k%2?col:shade(col,.85)),[0,0,.6],[0,(k-3)*.12,0])}}});
N('papierfels',{r:.9,h:1.3,size:'big',planet:ID},(g,m,o,rnd)=>{const c=['#E8E0F0','#D8D0E8','#F0E8E0'][Math.floor(rnd()*3)];P(g,new THREE.IcosahedronGeometry(.9,0),fp(m,c),[0,.6,0],[rnd(),rnd(),rnd()],[1.1,.8,1]);P(g,new THREE.OctahedronGeometry(.45,0),fp(m,shade(c,.92)),[.7,.25,.3],[rnd(),rnd(),0])});
N('windraedchen',{r:.2,h:1.3,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.cy(.02,.02,1.1),fp(m,'#FFFFFF'),[0,.55,0]);const hub=grp(g,[0,1.1,.05]);for(let i=0;i<4;i++){const q=grp(hub,[0,0,0],[0,0,i*PI/2]);P(q,G.co(.18,.3,3),fp(m,PAP[(i+Math.floor(rnd()*8))%8]),[.12,.1,0],[0,0,-.6],[1,1,.1])}
  const sp=RR(rnd,2,4);g.userData.tick=t=>{hub.rotation.z=t*sp}});
N('papierhalm',{r:.2,h:.7,size:'tiny',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<4;i++){const a=rnd()*TAU;P(g,G.co(.04,RR(rnd,.3,.7),3),fp(m,rnd()<.5?'#8FD06B':'#7CC46A'),[Math.cos(a)*.08,.25,Math.sin(a)*.08],[Math.sin(a)*.3,0,-Math.cos(a)*.3],[1,1,.2])}});
N('kranichbaum',{r:.4,h:4.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.cy(.12,.18,3.4,5),fp(m,'#A0704C'),[0,1.7,0]);for(let i=0;i<5;i++){const a=i/5*TAU;P(g,G.cy(.04,.06,1.4,4),fp(m,'#A0704C'),[Math.cos(a)*.5,3.3,Math.sin(a)*.5],[Math.sin(a)*.8,0,-Math.cos(a)*.8])}
  for(let i=0;i<12;i++){const a=rnd()*TAU,r=.4+rnd()*1;const y=2.6+rnd()*1.2;P(g,G.cy(.004,.004,.4),m.c('#FFFFFF'),[Math.cos(a)*r,y+.2,Math.sin(a)*r]);crane(g,m,PAP[Math.floor(rnd()*7)],.7,[Math.cos(a)*r,y,Math.sin(a)*r],[0,rnd()*TAU,0])}});
Object.assign(NH.ROCK,{[ID]:['#E8E0F0','#D0C8DC','#8FD06B']});

/* ================= Biome ================= */
const BI={
  faltwald:{n:'Faltwald',g:['#A8D890','#98CC80'],cliff:'#C8B8D8',pat:'gras',grass:'#A0D488',grassD:.7,trees:[['faltbaum',4],['faecherpalme',.6]],treeD:1.5,
    deco:[['papierhalm',6],['lotusblume',1],['windraedchen',.5]],decoD:5,rocks:[['papierfels',.4]],rockD:.4,litter:[['buntpapier',1.2],['ast',.4]]},
  faltwiese:{n:'Faltwiese',g:['#F4E8EC','#ECDCE4'],cliff:'#C8B8D8',pat:'gras',grass:'#E8D8E8',grassD:.6,trees:[['kranichbaum',.4],['faltbaum',.5]],treeD:.4,
    deco:[['lotusblume',3],['windraedchen',2],['papierhalm',5]],decoD:6,rocks:[['papierfels',.3],['kiesel',1]],rockD:.4,litter:[['buntpapier',1.5],['papierstern',.3]]},
  lotusteich:{n:'Lotusufer',g:['#B8E0D0','#A8D4C0'],cliff:'#8AA8B8',pat:'moos',grass:'#B0DCC8',grassD:.5,trees:[['faecherpalme',.8]],treeD:.4,
    deco:[['lotusblume',5],['schilf',2],['papierhalm',3]],decoD:5,rocks:[['kiesel',1]],rockD:.3,litter:[['buntpapier',.6]]},
  faecherhain:{n:'Fächerhain',g:['#C8E0A0','#B8D490'],cliff:'#A89888',pat:'gras',grass:'#C0DC98',grassD:.8,trees:[['faecherpalme',3],['kranichbaum',.4]],treeD:1.2,
    deco:[['papierhalm',5],['windraedchen',1]],decoD:5,rocks:[['papierfels',.3]],rockD:.3,litter:[['buntpapier',1]]},
  knickklippen:{n:'Knickklippen',g:['#E0D8EC','#D4CCE0'],cliff:'#A898C0',pat:'staub',grass:null,grassD:0,trees:[['faltbaum',.2]],treeD:.1,deco:[['papierfels',1],['kiesel',2]],decoD:2,
    rocks:[['papierfels',1.4]],rockD:1,litter:[['papierstern',.6],['stein_klein',.6]]},
  konfettifeld:{n:'Konfettifeld',g:['#FFF0D8','#F8E4C8'],cliff:'#C8B8A0',pat:'sand',grass:'#F0E0C8',grassD:.3,trees:[['kranichbaum',.3],['windraedchen',1]],treeD:.4,
    deco:[['windraedchen',3],['lotusblume',1]],decoD:3,rocks:[['papierfels',.4]],rockD:.4,litter:[['buntpapier',2],['papierstern',.4]]}};

/* ================= Sammelsachen ================= */
IT('buntpapier',itMeta('Buntpapier','origami','material',20),(g,m)=>{for(let i=0;i<3;i++)P(g,G.bx(.4,.01,.4,0),fp(m,PAP[i*2]),[i*.03,.02+i*.012,i*.02],[0,i*.3,0])});
IT('papierstern',itMeta('Papierstern','origami','material',120),(g,m)=>{const q=grp(g,[0,.2,0]);for(let i=0;i<5;i++){const a=i/5*TAU;P(q,G.co(.06,.18,3),fp(m,'#FFD35C'),[Math.cos(a)*.1,Math.sin(a)*.1,0],[0,0,a-PI/2],[1,1,.4])}P(q,G.cy(.08,.08,.06,5),fp(m,'#FFE27A'),[0,0,0],[PI/2,0,0])});

/* ================= Fische ================= */
F('papierkoi',fishMeta('Papier-Koi','origami','teich','M','immer',1,260,'Ich hab einen Papier-Koi gefangen! Er raschelt beim Zappeln.','In Japan hängt man zum Kindertag Koi-Fahnen auf, die Koinobori. Der Koi steht für Kraft, weil er gegen den Strom schwimmt.'),
  (g,m)=>{P(g,G.co(.2,.7,4),fp(m,'#FFFFFF'),[0,0,0],[-PI/2,PI/4,0],[1,1,.6]);P(g,G.co(.19,.3,4),fp(m,'#FF6F3A'),[0,.02,.18],[-PI/2,PI/4,0],[1,1,.62]);fin2(g,fp(m,'#FF6F3A'),[[0,0],[.2,.18],[.3,0],[.2,-.18]],[0,0,-.36],1,.02);eye(g,m,[.08,.05,.28],.035,[.6,.2,.6]);eye(g,m,[-.08,.05,.28],.035,[-.6,.2,.6])});
F('faltwal',fishMeta('Falt-Wal','origami','meer','XL','immer',3,2400,'Ich hab einen Falt-Wal gefangen! Er ist aus einem einzigen riesigen Bogen gefaltet.','Beim klassischen Origami wird nur ein einziges quadratisches Blatt verwendet – ohne Schere und ohne Kleber.'),
  (g,m)=>{P(g,new THREE.OctahedronGeometry(.5,0),fp(m,'#6E8EF0'),[0,0,0],null,[.9,.6,1.5]);P(g,new THREE.OctahedronGeometry(.3,0),fp(m,'#E8F0FF'),[0,-.12,.2],null,[.8,.4,1.4]);fin2(g,fp(m,'#6E8EF0'),[[0,0],[.3,.3],[.4,0],[.3,-.3]],[0,.05,-.72],1,.03,[PI/2,PI/2,0]);eye(g,m,[.3,.05,.4],.04,[1,.2,.3]);eye(g,m,[-.3,.05,.4],.04,[-1,.2,.3])});
F('kugelfalter_fisch',fishMeta('Falt-Kugelfisch','origami','meer','M','nacht',2,520,'Ich hab einen Falt-Kugelfisch gefangen! Wenn er sich aufbläst, knistert er.','Kugelfische pumpen sich mit Wasser auf, wenn sie Angst haben. So passen sie Räubern nicht mehr ins Maul.'),
  (g,m)=>{P(g,new THREE.DodecahedronGeometry(.3,0),fp(m,'#FFD35C'),[0,0,0]);range(10,(t,i)=>{const th=Math.acos(1-2*(i+.5)/10),ph=i*2.4;const d=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));const s=P(g,G.co(.04,.12,3),fp(m,'#FF9E6E'),[d.x*.3,d.y*.3,d.z*.3]);s.quaternion.setFromUnitVectors(new V(0,1,0),d)});eye(g,m,[.12,.08,.26],.05,[.5,.3,.8]);eye(g,m,[-.12,.08,.26],.05,[-.5,.3,.8])});
F('papierboot_krebs',fishMeta('Schiffchen-Krebs','origami','teich','S','tag',1,140,'Ich hab einen Schiffchen-Krebs gefangen! Er wohnt in einem gefalteten Boot.','Einsiedlerkrebse ziehen immer wieder in grössere Schneckenhäuser um. Manchmal stehen sie Schlange und tauschen der Grösse nach.'),
  (g,m)=>{const pm=fp(m,'#FFFFFF');P(g,G.co(.26,.26,4),pm,[0,.08,0],[PI,PI/4,0],[1.6,.6,.6]);P(g,G.co(.18,.34,4),pm,[0,.24,0],[0,PI/4,0],[.4,1,1.4]);both(s=>P(g,G.s(.06),fp(m,'#FF6F3A'),[s*.3,.04,.12]));eye(g,m,[.06,.14,.24],.035,[.4,.4,.6]);eye(g,m,[-.06,.14,.24],.035,[-.4,.4,.6])});
F('faltqualle',fishMeta('Falt-Qualle','origami','meer','M','tag',2,480,'Ich hab eine Falt-Qualle gefangen! Ihre Tentakel sind Papierstreifen.','Die Qualle Turritopsis dohrnii kann sich nach der Fortpflanzung wieder in einen jungen Polypen zurückverwandeln – sie gilt deshalb als „unsterblich“.'),
  (g,m)=>{P(g,G.co(.26,.28,6),fp(m,'#C6A9FF'),[0,.08,0]);range(6,(t,i)=>{const a=i/6*TAU;P(g,G.bx(.03,.4,.005,0),fp(m,'#E8DCFF'),[Math.cos(a)*.18,-.2,Math.sin(a)*.18],[0,-a,Math.sin(i)*.2])})});

/* ================= Insekten ================= */
B('papierlibelle',bugMeta('Papierlibelle','origami','luft','tag',1,200,'Ich hab eine Papierlibelle gefangen! Sie wiegt fast nichts.','Libellenflügel sind so leicht und steif, dass Forschende sie für winzige Flugroboter nachbauen.'),
  (g,m)=>{const bm=fp(m,'#56C6B6');P(g,G.co(.04,.7,4),bm,[0,.3,-.1],[-PI/2,0,0]);P(g,G.co(.08,.12,4),bm,[0,.3,.26],[PI/2,0,0]);eye(g,m,[.05,.33,.3],.03,[.5,.3,.6]);eye(g,m,[-.05,.33,.3],.03,[-.5,.3,.6]);for(const z of[.14,.04])both(s=>P(g,G.co(.08,.5,3),fp(m,'#FFFFFF'),[s*.28,.32,z],[0,0,s*PI/2],[1,1,.1]))});
B('faltkaefer',bugMeta('Falt-Käfer','origami','boden','immer',1,120,'Ich hab einen Falt-Käfer gefangen! Er klappt seine Flügel auf wie einen Brief.','Käfer falten ihre Hinterflügel unter den harten Deckflügeln zusammen – nach einem Muster, das Origami-Künstler studieren.'),
  (g,m)=>{P(g,new THREE.OctahedronGeometry(.22,0),fp(m,'#FF8FA3'),[0,.12,0],null,[1,.5,1.3]);P(g,new THREE.OctahedronGeometry(.1,0),fp(m,'#2E2A3E'),[0,.12,.28]);eye(g,m,[.05,.16,.34],.03,[.5,.3,.6]);eye(g,m,[-.05,.16,.34],.03,[-.5,.3,.6]);legs(g,fp(m,'#2E2A3E'),[[.1,.12,.1],[0,.14,0],[-.1,.12,-.1]],.25)});
B('konfettifalter',bugMeta('Konfetti-Falter','origami','blume','tag',2,460,'Ich hab einen Konfetti-Falter gefangen! Er sieht aus wie eine kleine Party.','Schmetterlingsflügel sind mit winzigen Schuppen bedeckt. Manche Farben sind gar kein Farbstoff, sondern entstehen durch Lichtbrechung an den Schuppen.'),
  (g,m)=>butterfly(g,m,'konfettifalter','#FF8FA3','#FFD35C','#2E2A3E'));
B('scherenschnitt_spinne',bugMeta('Scherenschnitt-Spinne','origami','baum','nacht',2,520,'Ich hab eine Scherenschnitt-Spinne gefangen! Ihr Netz ist ein Muster aus Papier.','Scherenschnitt ist eine alte Kunst: Aus gefaltetem Papier schneidet man Muster, die aufgeklappt symmetrisch werden.'),
  (g,m)=>{const sm=fp(m,'#2E2A3E');P(g,new THREE.OctahedronGeometry(.14,0),sm,[0,.15,-.05]);P(g,new THREE.OctahedronGeometry(.08,0),sm,[0,.14,.12]);eye(g,m,[.04,.18,.18],.025,[.5,.3,.6]);eye(g,m,[-.04,.18,.18],.025,[-.5,.3,.6]);for(let i=0;i<4;i++)both(s=>P(g,G.tu([[s*.06,.14,.1-i*.06],[s*.2,.26,.12-i*.08],[s*.28,0,.14-i*.1]],.012,.008),sm))});
B('faltgrille',bugMeta('Falt-Grille','origami','boden','nacht',1,110,'Ich hab eine Falt-Grille gefangen! Sie zirpt wie raschelndes Papier.','Grillen-Männchen zirpen, um Weibchen anzulocken. Jede Grillenart hat ihr eigenes Lied, an dem sie sich erkennen.'),
  (g,m)=>{const bm=fp(m,'#8FD06B');P(g,G.co(.1,.4,4),bm,[0,.18,0],[PI/2,PI/4,0]);P(g,new THREE.OctahedronGeometry(.1,0),bm,[0,.2,.26]);eye(g,m,[.05,.24,.3],.03,[.5,.3,.6]);eye(g,m,[-.05,.24,.3],.03,[-.5,.3,.6]);both(s=>P(g,G.tu([[s*.08,.15,-.05],[s*.18,.4,-.18],[s*.16,.06,-.34]],.025,.02),bm))});

/* ================= Fundstücke ================= */
REL('tausend_kraniche',relMeta('Tausend-Kraniche-Girlande','origami','kunst',3,2000,'Eine Girlande aus tausend Kranichen! Wer sie faltet, dem soll ein Wunsch in Erfüllung gehen.','Senbazuru heissen die tausend Kraniche. Sie werden oft als Glücks- und Friedenswunsch verschenkt, zum Beispiel an Kranke oder Brautpaare.'),
  (g,m)=>{for(let k=0;k<3;k++){P(g,G.cy(.006,.006,1),m.c('#FFFFFF'),[(k-1)*.2,.5,0]);for(let i=0;i<5;i++)crane(g,m,PAP[(i+k*2)%7],.35,[(k-1)*.2,.1+i*.2,0],[0,i,0])}});
REL('goldpapier',relMeta('Goldenes Faltpapier','origami','schatz',2,800,'Ein Bogen echtes Goldpapier! Viel zu schön zum Falten. Oder?','Echtes Blattgold ist so dünn, dass Licht hindurchscheint: Ein Gramm Gold lässt sich zu einer Fläche von fast einem Quadratmeter schlagen.'),
  (g,m)=>{P(g,G.bx(.6,.01,.6,0),m.c('#E8C87A',{gloss:1.5,rim:.8}),[0,.03,0],[0,.3,0]);P(g,G.co(.2,.2,4),m.c('#E8C87A',{gloss:1.5}),[0,.12,0],[0,PI/4,0],[1,.3,1])});
REL('papierkrone',relMeta('Papierkrone','origami','kunst',1,360,'Eine Papierkrone! Für einen Tag König oder Königin sein.','Papierkronen aus Knallbonbons gehören in England zu jedem Weihnachtsessen – und jeder am Tisch trägt eine.'),
  (g,m)=>{const pm=fp(m,'#FFD35C');for(let i=0;i<8;i++){const a=i/8*TAU;P(g,G.co(.1,.3,3),pm,[Math.cos(a)*.3,.3,Math.sin(a)*.3],[0,-a,0],[1,1,.3])}P(g,G.cy(.32,.32,.16,8,1,true),pm,[0,.12,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  faltfuchs:{n:'Falt-Fuchs',planet:ID,biomes:['faltwald','faecherhain','faltwiese'],count:3,size:1,speed:1.2,shy:true,voice:['kek','fiep','hmpf'],pitch:360,likes:['buntpapier','beeren'],product:'buntpapier',names:['Knick','Kante','Falzi','Origa','Zipfel'],
    fact:'Der Origami-Fuchs ist eines der ersten Modelle, die Kinder in Japan lernen. Man braucht dafür nur sieben Faltschritte.',a:{col:'#FF9E6E',belly:'#FFFFFF',body:[.3,.28,.5],head:{r:.24,p:[0,.62,.5]},snout:{type:'long',col:'#FFFFFF'},ears:{type:'pointy',len:.55,inner:'#FFFFFF'},legs:{n:4,len:.2,r:.05,foot:'#E0785A'},tail:{type:'bushy',col:'#FF9E6E',len:1.2,tip:'#FFFFFF'}}},
  papierkranich:{n:'Papierkranich',planet:ID,biomes:['lotusteich','faltwiese','konfettifeld'],fly:true,count:5,herd:true,size:.8,speed:1.1,voice:['krrru','kiu','flatsch'],pitch:420,likes:['buntpapier','papierstern'],product:'buntpapier',names:['Tsuru','Wunsch','Faltflügel','Senba','Hoffnung'],
    fact:'Kraniche gelten in Japan als Symbol für ein langes Leben. Echte Kraniche tanzen zur Balz: Sie springen, verbeugen sich und werfen Grashalme.',a:{col:'#FFFFFF',belly:'#FFFFFF',body:[.26,.26,.44],head:{r:.16,p:[0,.8,.3]},snout:{type:'beak',col:'#FFFFFF',len:.8},ears:{type:'none'},legs:{n:2,len:.3,r:.02,col:'#2E2A3E'},tail:{type:'fan',col:'#FF8FA3'},wings:{col:'#FF8FA3'},tuft:'#F0443A'}},
  faltfrosch:{n:'Springfrosch',planet:ID,biomes:['lotusteich','faltwiese'],nearWater:true,count:4,size:.5,speed:1.2,gait:'hop',voice:['quak','plopp','knick'],pitch:420,likes:['papierlibelle','buntpapier'],product:'buntpapier',names:['Hüpfer','Faltfrosch','Kniffi','Quaki','Blatt'],
    fact:'Den Origami-Springfrosch kann man wirklich springen lassen: Drückt man hinten auf die Falte, schnellt er nach vorne.',a:{col:'#7CC46A',belly:'#E8F4D8',body:[.4,.26,.38],head:{r:.3,p:[0,.42,.24],sc:[1.2,.8,1]},snout:{type:'wide'},eyes:{r:.1,x:.5,y:.55},ears:{type:'none'},legs:{n:4,len:.1,r:.08,foot:'#5E9A4E'},tail:{type:'none'},gait:'hop'}},
  faltpinguin:{n:'Falt-Pinguin',planet:ID,biomes:['knickklippen','lotusteich'],count:4,herd:true,size:.6,speed:.6,voice:['kräh','pik','watschel'],pitch:340,likes:['papierkoi','buntpapier'],product:'papierstern',names:['Frack','Knicki','Pingu-Papier','Eisblatt','Falti'],
    fact:'Pinguine können nicht fliegen, aber unter Wasser „fliegen“ sie mit ihren Flügeln. Kaiserpinguine tauchen über 500 Meter tief.',a:{col:'#2E2A3E',belly:'#FFFFFF',body:[.3,.38,.3],head:{r:.22,p:[0,.78,.1]},snout:{type:'beak',col:'#FFB23E',len:.4},ears:{type:'none'},legs:{n:2,len:.06,r:.05,col:'#FFB23E'},flippers:{col:'#2E2A3E',up:.1},tail:{type:'none'}}},
  papierhase:{n:'Papierhase',planet:ID,biomes:['faltwiese','konfettifeld','faecherhain'],count:4,size:.6,speed:1.4,gait:'hop',voice:['fiep','hopp'],pitch:520,likes:['buntpapier','beeren'],product:'buntpapier',names:['Löffel','Falthopp','Papi','Mümmel','Kreppchen'],
    fact:'Hasen und Kaninchen fressen einen Teil ihres Kots ein zweites Mal. So holen sie wichtige Vitamine aus der Pflanzennahrung heraus.',a:{col:'#FFF6F0',belly:'#FFFFFF',body:[.3,.3,.38],head:{r:.24,p:[0,.55,.32]},snout:{type:'dot',nose:'#FF8FA3'},ears:{type:'long',len:.7,inner:'#FFC8D8'},legs:{n:4,len:.12,r:.07,foot:'#FFFFFF'},tail:{type:'puff',col:'#FFFFFF'},gait:'hop'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','papierschiffhut','Papierschiff-Hut',380,'#FFFFFF',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.1,0]);P(q,G.co(r*.9,r*.9,4),fp(M,col),[0,r*.35,0],[0,PI/4,0],[1.4,1,.4]);P(q,G.bx(r*1.7,r*.18,r*.5,0),fp(M,col),[0,r*.02,0])});
def('neck','kranichkette','Kranich-Kette',560,'#FF8FA3',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);P(g,G.to(r*.62,r*.012),M.c('#FFFFFF'),[0,y,0],[PI/2,0,0]);for(let i=0;i<5;i++){const a=PI*.3+i/4*PI*.4;crane(g,M,PAP[i],.25*r/.3,[Math.cos(a)*r*.64,y-r*.08,Math.sin(a)*r*.64],[0,-a,0])}});
def('top','faltkimono','Falt-Kimono',980,'#8E6BD1',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.8,r*.95,r*1,8,1,true),fp(M,col),[0,-r*.5,0]);both(s=>P(q,G.co(r*.3,r*.6,4),fp(M,'#FFFFFF'),[s*r*.2,-r*.2,r*.7],[.3,0,s*.3],[1,1,.2]));P(q,G.cy(r*.82,r*.82,r*.18,8),fp(M,'#FFD35C'),[0,-r*.55,0])});

/* ================= Bau-Familie: Falthäuser ================= */
function falthaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.45:1;const style=plan.style||A.pick(r,['schachtel','faecher','boot']);const body=new THREE.Group();g.add(body);const M=makeMats({skin:'haut',color:0});
  const W=(2.2+r()*.4)*big,D=(1.9+r()*.3)*big,Hw=(1.7+r()*.3)*big;const wc=A.pick(r,['#FFF6F0','#F4F0FF','#FFF1E0','#E8F4FF']);const rc=A.pick(r,PAP.slice(0,7));let top=Hw,doorZ=-D/2-.02;
  P(body,G.bx(W,Hw,D,.02),fp(M,wc),[0,Hw/2,0]);/* Falzlinien */for(const x of[-W/4,0,W/4])P(body,G.bx(.015,Hw,.015,0),fp(M,shade(wc,.9)),[x,Hw/2,doorZ-.005]).userData.noOutline=true;
  if(style==='schachtel'){const q=grp(body,[0,Hw,0]);both(s=>P(q,G.bx(W*.62,.04,D+.3,0),fp(M,s>0?rc:shade(rc,.85)),[s*W*.25,W*.2,0],[0,0,-s*.7]));top=Hw+W*.5}
  else if(style==='faecher'){const q=grp(body,[0,Hw,doorZ+.2]);for(let i=0;i<9;i++){const a=-PI/2+(i/8)*PI;P(q,G.bx(.26,.03,W*.7,0),fp(M,i%2?rc:shade(rc,.85)),[Math.cos(a)*W*.3,Math.sin(a)*W*.3+W*.3,D*.5],[0,0,a+PI/2],[1,1,1])}P(body,G.bx(W+.2,.1,D+.2,.02),fp(M,shade(rc,.8)),[0,Hw+.05,0]);top=Hw+W*.65}
  else{/* Papierboot als Dach */P(body,G.co(W*.72,W*.6,4),fp(M,'#FFFFFF'),[0,Hw+W*.2,0],[PI,PI/4,0],[1.5,.6,.9]);P(body,G.co(W*.4,W*.9,4),fp(M,'#FFFFFF'),[0,Hw+W*.6,0],[0,PI/4,0],[.4,1,1.2]);P(body,G.bx(.04,W*.6,.04,0),fp(M,rc),[0,Hw+W*.9,0]);P(body,G.co(.3,.4,3),fp(M,rc),[.18,Hw+W*1.1,0],[0,0,-PI/2],[1,1,.1]);top=Hw+W*1.2}
  const dr=A.archDoor(A.pick(r,PAP.slice(0,7)),'#6E5E7E');dr.position.set(0,0,doorZ);dr.rotation.y=PI;body.add(dr);
  for(const sx of[-1,1]){const w=A.roundWindow('#FFFFFF',.2,false);w.position.set(sx*W*.3,Hw*.58,doorZ-.02);w.rotation.y=PI;body.add(w)}
  /* Windrädchen am Eingang */const wp=grp(body,[W*.5+.2,0,doorZ-.2]);P(wp,G.cy(.02,.02,1.2),fp(M,'#FFFFFF'),[0,.6,0]);const hub=grp(wp,[0,1.2,-.05]);for(let i=0;i<4;i++){const q=grp(hub,[0,0,0],[0,0,i*PI/2]);P(q,G.co(.14,.24,3),fp(M,PAP[i]),[.1,.08,0],[0,0,-.6],[1,1,.1])}g.userData.tick=t=>{hub.rotation.z=t*3};
  addOutlines(body);const R0=Math.max(W,D)/2;return{g,R:R0+.8,top,door:[0,doorZ],walls:[new THREE.Box3(new V(-W/2,0,-D/2),new V(W/2,top,D/2))],style:'falthaus-'+style}}

/* ================= Möbel ================= */
furn('papierlampe_origami',{n:'Falt-Leuchte',cat:'licht',price:880,planet:ID,size:[1,1],h:1.2,b:(g,m)=>{P(g,G.cy(.18,.2,.05,6),fp(m,'#C8945A'),[0,.03,0]);P(g,G.cy(.02,.02,.6),fp(m,'#C8945A'),[0,.33,0]);P(g,new THREE.OctahedronGeometry(.3,0),m.glow('#FFF1D0',.7),[0,.9,0],null,[1,1.3,1]);g.userData.light={p:[0,.9,0],c:'#FFF1D0',i:1}}});
furn('kranichmobile',{n:'Kranich-Mobile',cat:'deko',price:1100,planet:ID,size:[1,1],h:1.8,b:(g,m)=>{P(g,G.cy(.02,.02,1.7),m.c('#C8945A'),[0,.85,0]);P(g,G.bx(1,.03,.03,0),m.c('#C8945A'),[0,1.7,0]);const hub=grp(g,[0,1.7,0]);for(let i=0;i<5;i++){const x=-.45+i*.225;P(hub,G.cy(.004,.004,.4),m.c('#FFFFFF'),[x,-.2,0]);crane(hub,m,PAP[i],.5,[x,-.45,0],[0,i,0])}g.userData.tick=t=>{hub.rotation.y=Math.sin(t*.5)*.4}}});
furn('faltparavent',{n:'Falt-Paravent',cat:'deko',price:1300,planet:ID,size:[2,1],h:1.6,b:(g,m)=>{for(let i=0;i<4;i++){const q=grp(g,[-.75+i*.5,0,0],[0,(i%2?.3:-.3),0]);P(q,G.bx(.48,1.5,.03,.01),fp(m,i%2?'#FFF6F0':'#FFE8EE'),[0,.8,0]);P(q,G.bx(.5,.04,.05,0),fp(m,'#6E4A30'),[0,1.55,0]);P(q,G.bx(.2,.2,.035,0),fp(m,PAP[i]),[0,1,0],[0,0,PI/4])}}});
furn('lotustisch',{n:'Lotus-Tisch',cat:'tisch',price:960,planet:ID,size:[1,1],h:.5,b:(g,m)=>{for(let i=0;i<8;i++){const a=i/8*TAU;P(g,G.co(.16,.5,4),fp(m,i%2?'#FF8FA3':'#FFD1DC'),[Math.cos(a)*.25,.2,Math.sin(a)*.25],[Math.sin(a)*.8,0,-Math.cos(a)*.8],[1,1,.3])}P(g,G.cy(.4,.4,.05,8),fp(m,'#FFFFFF'),[0,.48,0])}});

/* ================= Sprache: Faltlinien-Zeichen ================= */
function foldGlyph(x,s,r){x.beginPath();x.rect(-s*.3,-s*.3,s*.6,s*.6);const k=Math.floor(r()*4);if(k===0){x.moveTo(-s*.3,-s*.3);x.lineTo(s*.3,s*.3)}else if(k===1){x.moveTo(0,-s*.3);x.lineTo(0,s*.3);x.moveTo(-s*.3,0);x.lineTo(s*.3,0)}else if(k===2){x.moveTo(-s*.3,s*.3);x.lineTo(0,-s*.3);x.lineTo(s*.3,s*.3)}else{x.moveTo(-s*.3,-s*.3);x.lineTo(s*.3,s*.3);x.moveTo(s*.3,-s*.3);x.lineTo(-s*.3,s*.3)}x.stroke()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Origami-Planet',base:'kompost',R:128,R0:44,sea:-.3,music:'world',sky:['#FFD8E4','#FFF6EC'],fog:'#FFF0F0',water:'#8EC8F0',deep:'#4E8EC8',step:1.2,shop:ID,
    desc:'Alles aus gefaltetem Papier. Falte Kraniche für den Wunschbaum und segle mit Papierfliegern von Turm zu Turm.',weather:'blueten',orbit:[166,4.2],size:1,col:['#FFD8E4','#8EC8F0'],moons:1,
    park:'faltwiese',parkPond:true,phone:['#FFD8E4','#D8ECFF'],stones:['kiesel','papierstern','stein_klein'],plazaTree:'kranichbaum',path:'#F4ECF0',
    space:{deep:'#4E8EC8',water:'#8EC8F0',shore:'#FFF0D8',land:'#A8D890',land2:'#F4E8EC',high:'#E0D8EC',cap:'#FFFFFF',atmo:'#FFD8E4',cloud:.4,sea:.36,capA:.5,freq:2.6},
    mac:{oc:-.15,m:.28,isl:1},climate:{hot:'konfettifeld',wet:'lotusteich',cold:'knickklippen'},peak:'knickklippen',
    raw(q,p,{N,N2,fbm}){const h0=fbm(q,1.15,4)*2.2+.8;/* Knickkanten: Höhe in schrägen Ebenen gefaltet */const k=N2(q.x*.5,q.y*.5,q.z*.5);return h0+Math.abs(k)*1.6-Math.abs(N(q.x*.9+5,q.y*.9,q.z*.9))*.8},
    biome({T,M,h,sea,low,nearPond,p}){if(nearPond||(low&&h<sea+.6))return'lotusteich';if(h>sea+4.4)return'knickklippen';if(T>.28)return'konfettifeld';if(M>.25)return'faltwald';if(T>.05)return'faecherhain';return'faltwiese'},
    onLoad:W=>ORIGAMI.onLoad(W),tick:(dt,t,W,me)=>ORIGAMI.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Wunschbaum-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Lotusteich',lat:48,lon:120,r:.1,pond:true},{id:'teich2',n:'Schiffchen-See',lat:34,lon:230,r:.12,pond:true},{id:'see',n:'Faltmeer-Bucht',lat:-10,lon:160,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Papier-Casino',mode:'Falt-Schneiderei',praxis:'Knick-Praxis',museum:'Papier-Museum',shop:'Faltladen',studio:'Scherenschnitt-Atelier',bar:'Lampion-Bar',rathaus:'Falt-Rathaus',garage:'Papierflieger-Hangar',pflanzen:'Lotus-Gärtnerei',tiere:'Kranich-Voliere'},
  sty:{wall:'putz',walls:['#FFF6F0','#F4F0FF','#FFF1E0','#E8F4FF'],roof:'gable',roofs:PAP.slice(0,6),trim:'#FFFFFF',plinth:'#E0D8EC',door:'#8E6BD1',win:'rund',pitch:1.1},
  wall:'karo',floor:'dielen',
  mayor:['Faltmeisterin Senba',{skin:'plastik',color:0,shape:'kiste'},{kopf:'vogel',augen:'kuller',arme:'fluegel',beine:'huhn',extras:['krone']}],
  lore:['Unser Planet wurde aus einem einzigen, riesigen Blatt gefaltet. Irgendwo muss noch die erste Falte sein.','Falte einen Kranich und lass ihn fliegen – er setzt sich in den Wunschbaum. Tausend Kraniche, und ein Wunsch geht in Erfüllung.','Von den Fliegertürmen segelt man mit Papierfliegern übers Land. Nicht bei Regen, das weicht so auf.'],
  caveRock:['#E8E0F0','#D0C8DC','#8A7A9A',['#FFD8E4','#FFF0F0','#D8ECFF']],
  wear:['papierschiffhut','kranichkette','faltkimono','halstuch','blumenkette'],clothes:CL,
  haus:{theme:{roof:PAP.slice(0,6),wall:['#FFF6F0','#F4F0FF','#FFF1E0'],wood:['#C8945A','#A0704C'],stone:['#E0D8EC','#D0C8DC'],trim:['#FFFFFF'],plant:['#A8D890','#7CC46A']},
    props:[['nature','flower_redA',1.4,'d',0],['nature','plant_bushSmall',1.4,'c'],['town','lantern',1,'d',0]],
    garden:{path:'path_stone',flowers:['flower_redA','flower_purpleA'],veg:['crop_carrot']},
    plan:[{fam:'falthaus',style:'schachtel'},{fam:'falthaus',style:'faecher'},{fam:'falthaus',style:'boot'},{fam:'falthaus'}],fams:{falthaus}},
  residents:{skins:['plastik','pluesch','keramik','haut','marmor'],heads:['vogel','frosch','katze','fisch','eule','hirsch','bluete','mensch','ei'],names:['Senba','Kniffi','Falzine','Papyrus','Kante','Zipfel','Bogen','Faltina','Rautchen','Knick','Blatti','Kranichen'],
    house:{shapes:['haus','rund'],walls:['putz'],wallCols:['#FFF6F0','#F4F0FF'],roofCols:PAP.slice(0,4),win:['rund']},deco:['lotusblume','windraedchen','papierhalm'],fence:false},
  lang:{n:'Faltlinien',ink:'#8E6BD1',glow:'#FFD8E4',kind:'fold',draw:foldGlyph,syl:['ori','ka','mi','tsu','ru','se','ba','ku','no','hi','ra','ko']},ruinStone:'#E8E0F0',
  terraform:['faltwiese','faltwald','faecherhain','lotusteich'],
  weather:[['klar',3],['heiter',3],['regen',1],['nebel',1]]});

/* ================= Planeten-Besonderheiten ================= */
const ORIGAMI=(()=>{let W_=null,tree=null,hung=[],towers=[],flying=null;const M=()=>makeMats({skin:'haut',color:0});
  const S=()=>SAVE.origami=SAVE.origami||{cranes:0,gifts:[],flights:0};
  function onLoad(W){W_=W;hung=[];towers=[];flying=null;const m=M();const st=S();
    /* Wunschbaum neben dem Dorfplatz */const pl=W.places[0];const d=PLANETKIT.freeSpot(W,pl.dir,11,40,3);const g=new THREE.Group();P(g,G.cy(.3,.45,4.2,6),fp(m,'#A0704C'),[0,2.1,0]);
    const branches=[];for(let i=0;i<9;i++){const a=i/9*TAU,y=3+(i%3)*.6;const L=1.6+(i%2)*.5;const q=grp(g,[0,y,0],[0,a,.9]);P(q,G.cy(.06,.1,L,5),fp(m,'#A0704C'),[0,L/2,0]);branches.push({q,L})}
    P(g,new THREE.IcosahedronGeometry(1.8,0),fp(m,'#FFD8E4',{opacity:.35}),[0,4.8,0]);addOutlines(g);GAME.placeObj(g,d,0,0);GAME.addObst(d,1.2);tree={d,g,branches};
    for(let i=0;i<Math.min(st.cranes,160);i++)hangCrane(i,true);
    W.inter.push({kind:'wunschbaum',p:d,r:3,label:'Kranich falten (1 Buntpapier)',act:fold});
    /* vier Fliegertürme */const r=srand(8181);for(let i=0,t=0;i<4&&t<400;t++){const c=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(c.y>.9||!GAME.isLand(c)||W.hAt(c)<W.sea+1)continue;if(towers.some(x=>angle(x.d,c)*W.R<45))continue;
      const tg=new THREE.Group();P(tg,G.cy(.8,1.1,5,4),fp(m,'#FFF6F0'),[0,2.5,0],[0,PI/4,0]);P(tg,G.bx(2.4,.2,2.4,0),fp(m,PAP[i]),[0,5.1,0]);P(tg,G.co(.3,1,3),fp(m,PAP[(i+3)%7]),[.9,5.8,.9],[0,0,-PI/2],[1,1,.1]);
      for(let k=0;k<10;k++){const a=k*.9;P(tg,G.bx(.6,.08,.3,0),fp(m,'#C8945A'),[Math.cos(a)*1.2,.4+k*.46,Math.sin(a)*1.2],[0,-a,0])}addOutlines(tg);GAME.placeObj(tg,c,0,0);GAME.addObst(c,1.3);const T={i,d:c,g:tg,h:5.3};towers.push(T);
      W.inter.push({kind:'fliegerturm',p:c,r:2.4,label:'Papierflieger falten und losfliegen',act:()=>fly(T)});i++}}
  function hangCrane(i,quiet){if(!tree)return;const m=M();const b=tree.branches[i%tree.branches.length];const k=Math.floor(i/tree.branches.length);const t=.25+((k*.37)%1)*.7;
    const q=grp(b.q,[Math.sin(i)*.1,b.L*t,Math.cos(i)*.1]);P(q,G.cy(.004,.004,.3),m.c('#FFFFFF'),[0,-.15,0]);crane(q,m,PAP[i%8===7?0:i%8],.45,[0,-.35,0],[0,i,0]);hung.push(q);if(!quiet)GAME.W.fx(tree.d,'stern',8,null)}
  async function fold(){const st=S();const has=SAVE.bag.find(x=>x.kind==='item'&&x.id==='buntpapier');if(!has){await UI.talk('Wunschbaum',['Für einen Kranich brauchst du ein Buntpapier. Es liegt überall auf den Wiesen herum.',st.cranes?'Im Baum hängen schon '+st.cranes+' Kraniche.':'Noch hängt kein einziger Kranich im Baum.']);return}
    bagTake('item','buntpapier',1);st.cranes++;persist();SND.play('page');SND.play('sparkle',{rate:1.2});hangCrane(st.cranes-1);UI.toast('Kranich Nummer '+st.cranes+' fliegt in den Wunschbaum.',2400);
    const ms=[[10,'kranichmobile',300],[50,'faltparavent',800],[100,'tausend_kraniche',1500]];for(const[n,gift,cash]of ms){if(st.cranes>=n&&!st.gifts.includes(n)){st.gifts.push(n);persist();if(findFurn(gift))bagAdd('furn',gift);else bagAdd('relic',gift);money(cash);
      await UI.talk('Faltmeisterin Senba',[n+' Kraniche! Der Wunschbaum leuchtet schon ein bisschen.','Nimm das hier – und '+cash+' Taler für neues Papier.']);SND.jingle('j_success')}}}
  function fly(T){const me=GAME.me;if(!me||me.script)return;const others=towers.filter(x=>x!==T);if(!others.length)return;const to=others.sort((a,b)=>angle(T.d,a.d)-angle(T.d,b.d))[0];const st=S();
    const m=M();const pl=new THREE.Group();P(pl,G.co(.5,1.4,3),fp(m,'#FFFFFF'),[0,0,0],[PI/2,0,0],[1,1,.12]);P(pl,G.bx(.02,.2,1,0),fp(m,'#FF8FA3'),[0,-.1,0]);addOutlines(pl);me.g.add(pl);pl.position.set(0,1.9,0);flying=pl;SND.play('whoosh');
    me.script={from:me.p.clone(),to:T.d.clone(),dur:1.4,peak:0,t:0,base:0,baseTo:T.h,keepLift:true,ease:k=>k*k*(3-2*k),done:()=>{const dist=angle(T.d,to.d)*W_.R;
      me.script={from:T.d.clone(),to:to.d.clone(),dur:Math.max(4,dist/14),peak:8,t:0,base:T.h,baseTo:to.h,keepLift:true,ease:k=>k,done:()=>{me.script={from:to.d.clone(),to:to.d.clone(),dur:1,peak:0,t:0,base:to.h,baseTo:0,ease:k=>k*k,done:()=>{me.lift=0;if(flying){me.g.remove(flying);disposeTree(flying);flying=null}SND.play('soft');st.flights++;persist();if(st.flights===1)UI.toast('Gelandet! Jeder Turm fliegt zum nächsten.',2400)}}}}}}}
  function tick(dt,t,W,me){for(let i=0;i<hung.length;i++){hung[i].rotation.z=Math.sin(t*1.2+i)*.15}if(flying){flying.rotation.z=Math.sin(t*2)*.15}}
  return{onLoad,tick,towers:()=>towers,tree:()=>tree}
})();
window.ORIGAMI=ORIGAMI;
})();
