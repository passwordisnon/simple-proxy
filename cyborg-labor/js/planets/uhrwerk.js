/* =====================================================================
   CYBORG-LABOR · planets/uhrwerk.js · Uhrwerk-Mond
   Ein Mond aus Messing und Kupfer: Plateaus in Zahnradform, Bäume mit
   drehenden Zahnrad-Kronen, Pendel, die im Wind schwingen. Besonderheiten:
   · Aufzieh-Wächter: sechs Uhrwerk-Figuren sind stehen geblieben. Zieh
     sie mit dem grossen Schlüssel auf – sie erwachen und laufen ihre
     Runde. Sind alle sechs wach, spielt das grosse Glockenspiel.
   · Kuckucksuhr am Dorfplatz: zu jeder vollen Stunde ruft der Kuckuck.
   ===================================================================== */
(function(){
const ID='uhrwerk';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,butterfly,fin2,spiralShell}=NH;
const V=THREE.Vector3;
const BRASS='#E0B45A',BRASS2='#C8964A',COPPER='#D08A5A',PATINA='#6EC8B0',STEEL='#B8C0CC';
/* Zahnrad-Geometrie (flach, extrudiert) */
function gearGeo(R,teeth,th,hole){const s=new THREE.Shape();const n=teeth*4;for(let i=0;i<=n;i++){const a=i/n*TAU;const k=i%4;const r=(k===1||k===2)?R:R*.84;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y)}
  if(hole){const h=new THREE.Path();h.absarc(0,0,hole,0,TAU,true);s.holes.push(h)}const g=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*.2,bevelSize:th*.2,bevelSegments:1,curveSegments:8});g.translate(0,0,-th/2);return g}
function gear(g,m,R,teeth,th,col,pos,rot){const q=grp(g,pos,rot);P(q,gearGeo(R,teeth,th,R*.25),m.c(col,{gloss:1.1,rim:.5}),[0,0,0]);for(let i=0;i<5;i++){const a=i/5*TAU;P(q,G.cy(R*.08,R*.08,th*1.1),m.c(shade(col,.8)),[Math.cos(a)*R*.55,Math.sin(a)*R*.55,0],[PI/2,0,0])}return q}

/* ================= Natur ================= */
N('zahnradbaum',{r:.35,h:4.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.8,3.8);P(g,G.cy(.12,.2,h,Q(8)),m.c(COPPER,{gloss:.8,rim:.4}),[0,h/2,0]);for(let i=0;i<4;i++)P(g,G.to(.17-i*.015,.03),m.c(BRASS2),[0,.4+i*h*.22,0],[PI/2,0,0]);
  const gs=[];[[0,h+.3,0,1,16,0],[.9,h-.2,.2,.6,10,1],[-.8,h-.1,-.3,.7,12,2],[.2,h+1,-.2,.5,9,1]].forEach(([x,y,z,R,t,c],i)=>{const q=gear(g,m,R,t,.14,[BRASS,COPPER,PATINA][c],[x,y,z],[0,rnd()*TAU,0]);gs.push({q,s:(i%2?1:-1)/R})});
  g.userData.tick=t=>{for(const x of gs)x.q.rotation.z=t*.4*x.s}});
N('federpflanze',{r:.3,h:1.6,size:'small',planet:ID},(g,m,o,rnd)=>{const n=2+Math.floor(rnd()*3);const sp=[];for(let i=0;i<n;i++){const a=rnd()*TAU,rr=rnd()*.25;const pts=[];const H=RR(rnd,.8,1.4);for(let k=0;k<=48;k++){const t=k/48;pts.push([Math.cos(t*TAU*6)*.1,t*H,Math.sin(t*TAU*6)*.1])}
  const q=grp(g,[Math.cos(a)*rr,0,Math.sin(a)*rr]);P(q,G.tu(pts,.018,.018,96),m.c(STEEL,{gloss:1.2}));P(q,G.s(.1),m.c(['#FF8FA3','#FFD35C','#56C6B6'][i%3],{gloss:1}),[0,H+.08,0]);sp.push({q,ph:rnd()*9})}
  g.userData.tick=t=>{for(const s of sp)s.q.scale.y=1+Math.sin(t*3+s.ph)*.12}});
N('pendelbaum',{r:.4,h:4,size:'big',planet:ID},(g,m,o,rnd)=>{const bm=m.c(BRASS2,{gloss:1});P(g,G.cy(.1,.14,3.6),m.c('#6E5040'),[0,1.8,0]);P(g,G.bx(1.8,.12,.12,.04),bm,[0,3.6,0]);const pv=grp(g,[0,3.55,0]);P(pv,G.cy(.02,.02,2.2),bm,[0,-1.1,0]);P(pv,G.cy(.3,.3,.08,Q(20)),m.c(BRASS,{gloss:1.3}),[0,-2.25,0],[PI/2,0,0]);
  both(s=>P(g,G.s(.12),m.c(PATINA),[s*.9,3.6,0]));const ph=rnd()*9;g.userData.tick=t=>{pv.rotation.z=Math.sin(t*1.6+ph)*.35}});
N('messingblume',{r:.25,h:.8,size:'tiny',planet:ID},(g,m,o,rnd)=>{P(g,G.cy(.012,.012,.6),m.c(STEEL),[0,.3,0]);const hd=grp(g,[0,.6,0]);const pc=rnd()<.5?BRASS:COPPER;const pet=[];for(let i=0;i<6;i++){const a=i/6*TAU;const q=grp(hd,[0,0,0],[0,a,0]);P(q,G.bx(.05,.01,.16,.005),m.c(pc,{gloss:1.3}),[0,0,.09]);pet.push(q)}
  P(hd,G.s(.05),m.glow('#FFE3A0',1.2),[0,.01,0]);const ph=rnd()*9;g.userData.tick=t=>{const o=.4+Math.sin(t*.8+ph)*.3;for(const q of pet)q.rotation.x=-o}});
N('schraubenpilz',{r:.3,h:.9,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<3;i++){const a=rnd()*TAU,r=rnd()*.2,s=RR(rnd,.5,1);const q=grp(g,[Math.cos(a)*r,0,Math.sin(a)*r]);const pts=[];for(let k=0;k<=24;k++){const t=k/24;pts.push([Math.cos(t*TAU*3)*.04*s,t*.5*s,Math.sin(t*TAU*3)*.04*s])}
  P(q,G.cy(.04*s,.04*s,.5*s),m.c(STEEL,{gloss:1}),[0,.25*s,0]);P(q,G.tu(pts,.012*s,.012*s,48),m.c('#9AA4B0'));P(q,G.cy(.16*s,.16*s,.08*s,6),m.c(STEEL,{gloss:1.2}),[0,.52*s,0]);P(q,G.bx(.2*s,.02,.03*s,0),m.c('#6E7680'),[0,.57*s,0])}});
N('grosszahnrad',{r:1.2,h:2.4,size:'big',planet:ID},(g,m,o,rnd)=>{const q=gear(g,m,1.2,18,.3,[BRASS,COPPER,PATINA][Math.floor(rnd()*3)],[0,1.1,0],[0,rnd()*TAU,.15]);P(g,G.cy(.3,.4,.3),m.c('#6E5040'),[0,.15,0]);const ph=rnd()*9;g.userData.tick=t=>{q.rotation.z=t*.15+ph}});
N('uhrsaeule',{r:.35,h:3.2,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.cy(.28,.34,2.4,Q(12)),m.c('#8A6A5A'),[0,1.2,0]);const face=grp(g,[0,2.8,0]);P(face,G.cy(.45,.45,.14,Q(24)),m.c(BRASS,{gloss:1.2}),[0,0,0],[PI/2,0,0]);P(face,G.cy(.38,.38,.15,Q(24)),m.c('#FFF6E4'),[0,0,0],[PI/2,0,0]);
  for(let i=0;i<12;i++){const a=i/12*TAU;P(face,G.bx(.02,.06,.02,0),m.c('#2E2A3E'),[Math.cos(a)*.32,Math.sin(a)*.32,.08],[0,0,a])}const hh=grp(face,[0,0,.09]),mh=grp(face,[0,0,.1]);P(hh,G.bx(.03,.18,.01,0),m.c('#2E2A3E'),[0,.09,0]);P(mh,G.bx(.02,.28,.01,0),m.c('#2E2A3E'),[0,.14,0]);
  P(g,G.co(.4,.5,8),m.c(PATINA),[0,3.5,0]);g.userData.tick=()=>{const h=typeof GAMETIME!=='undefined'?GAMETIME.hour():0;hh.rotation.z=-h/12*TAU;mh.rotation.z=-(h%1)*TAU}});
Object.assign(NH.ROCK,{[ID]:['#C8B08A','#A8906E','#E0B45A']});

/* ================= Biome ================= */
const BI={
  messingheide:{n:'Messingheide',g:['#D8C488','#CCB678'],cliff:'#A8805A',pat:'gras',grass:'#D0BC80',grassD:.9,trees:[['zahnradbaum',1.2],['pendelbaum',.4]],treeD:.6,
    deco:[['messingblume',6],['grasbuesche',4],['federpflanze',1]],decoD:6,rocks:[['kiesel',1],['grosszahnrad',.15]],rockD:.4,litter:[['zahnrad',1],['schraube',1]]},
  zahnradwald:{n:'Zahnradwald',g:['#A8C090','#98B480'],cliff:'#8A6A5A',pat:'moos',grass:'#A0BC88',grassD:.8,trees:[['zahnradbaum',4],['pendelbaum',1]],treeD:1.6,
    deco:[['schraubenpilz',3],['farn',3,{color:'#98B480'}],['messingblume',2]],decoD:5,rocks:[['grosszahnrad',.3],['findling',.3]],rockD:.5,litter:[['zahnrad',1.4],['messingfeder',.4]]},
  federwiese:{n:'Federwiese',g:['#B8D098','#A8C488'],cliff:'#A8805A',pat:'gras',grass:'#B0CC90',grassD:1,trees:[['pendelbaum',.8],['zahnradbaum',.4]],treeD:.4,
    deco:[['federpflanze',5],['blume',3],['messingblume',3]],decoD:6,rocks:[['kiesel',1]],rockD:.3,litter:[['messingfeder',1],['beeren',.4]]},
  kupferschlucht:{n:'Kupferschlucht',g:['#C8906A','#B8805A'],cliff:'#8A5A40',pat:'staub',grass:null,grassD:0,trees:[['uhrsaeule',.2]],treeD:.15,
    deco:[['schraubenpilz',2],['kiesel',3]],decoD:3,rocks:[['grosszahnrad',.5],['findling',.8]],rockD:.8,litter:[['schraube',1.2],['kupferspan',1]]},
  oelufer:{n:'Uhrenöl-Ufer',g:['#8ABCA8','#7AB098'],cliff:'#5E7A70',pat:'moos',grass:'#88B8A4',grassD:.6,trees:[['pendelbaum',.6]],treeD:.3,
    deco:[['schilf',3],['schraubenpilz',2]],decoD:3,rocks:[['stein',1]],rockD:.3,litter:[['schraube',.8]]},
  pendelhain:{n:'Pendelhain',g:['#C0C8A0','#B0BC90'],cliff:'#8A7A60',pat:'gras',grass:'#B8C498',grassD:.8,trees:[['pendelbaum',3],['uhrsaeule',.4]],treeD:1.2,
    deco:[['messingblume',4],['federpflanze',2]],decoD:5,rocks:[['kiesel',1]],rockD:.3,litter:[['messingfeder',.6],['zahnrad',.6]]}};

/* ================= Sammelsachen ================= */
IT('zahnrad',itMeta('Zahnrad','uhrwerk','material',30),(g,m)=>{gear(g,m,.22,10,.06,BRASS,[0,.06,0],[PI/2,0,0])});
IT('messingfeder',itMeta('Messing-Spiralfeder','uhrwerk','material',70),(g,m)=>{const pts=[];for(let k=0;k<=60;k++){const t=k/60;pts.push([Math.cos(t*TAU*3)*(.04+t*.16),.04,Math.sin(t*TAU*3)*(.04+t*.16)])}P(g,G.tu(pts,.014,.014,120),m.c(BRASS,{gloss:1.3}))});
IT('kupferspan',itMeta('Kupferspan','uhrwerk','material',40),(g,m)=>{const pts=[];for(let k=0;k<=30;k++){const t=k/30;pts.push([Math.cos(t*TAU*2)*.1,t*.2+.02,Math.sin(t*TAU*2)*.1+t*.1])}P(g,G.tu(pts,.02,.004,60),m.c(COPPER,{gloss:1.2}))});

/* ================= Fische ================= */
F('aufziehfisch',fishMeta('Aufziehfisch','uhrwerk','teich','S','immer',1,180,'Ich hab einen Aufziehfisch gefangen! Er zappelt, bis er abgelaufen ist.','Blechspielzeug mit Aufziehwerk war vor 100 Jahren der grosse Renner. Eine gespannte Feder treibt über kleine Zahnräder die Flossen an.'),
  (g,m)=>{fishT(g,m,{id:'aufziehfisch',H:.2,L:.7,back:'#FF8FA3',belly:'#FFE3E8',tail:'round',gloss:1.2,pat:(x,w,h,r)=>FT.bands(x,w,h,'#E0B45A',[.3,.55,.8],6)});const k=grp(g,[0,.22,-.05]);P(k,G.cy(.015,.015,.14),m.c(BRASS),[0,0,0]);P(k,G.to(.05,.015),m.c(BRASS,{gloss:1.2}),[.06,.07,0],[0,0,PI/2]);P(k,G.to(.05,.015),m.c(BRASS,{gloss:1.2}),[-.06,.07,0],[0,0,PI/2])});
F('zahnradkarpfen',fishMeta('Zahnrad-Karpfen','uhrwerk','meer','L','tag',2,720,'Ich hab einen Zahnrad-Karpfen gefangen! Seine Schuppen greifen ineinander wie ein Getriebe.','Karpfen haben Zähne – aber nicht im Maul, sondern tief im Schlund. Mit diesen Schlundzähnen zermahlen sie Muscheln und Pflanzen.'),
  (g,m)=>fishT(g,m,{id:'zahnradkarpfen',H:.26,L:.92,back:BRASS2,belly:'#F2E0B0',tail:'fork',dorsal:'long',gloss:1.2,pat:(x,w,h,r)=>{x.strokeStyle='rgba(120,80,40,.5)';x.lineWidth=2;for(let i=0;i<22;i++){const u=.25+r()*.2,y=(.12+r()*.76)*h;for(const uu of[u,1-u]){x.beginPath();x.arc(uu*w,y,6,0,TAU);x.stroke()}}}}));
F('pendelaal',fishMeta('Pendel-Aal','uhrwerk','meer','M','nacht',2,540,'Ich hab einen Pendel-Aal gefangen! Er schwingt hin und her, genau im Sekundentakt.','Europäische Aale schwimmen zum Laichen tausende Kilometer bis in die Sargassosee. Ihre Larven treiben dann jahrelang zurück nach Europa.'),
  (g,m)=>fishT(g,m,{id:'pendelaal',H:.1,L:1.1,W:.5,back:PATINA,belly:'#E8F4EE',tail:'none',dorsal:'long',pat:(x,w,h,r)=>FT.stripe(x,w,h,'#E0B45A',6,.05,.95,.4)}));
F('messingforelle',fishMeta('Messing-Forelle','uhrwerk','teich','M','tag',2,480,'Ich hab eine Messing-Forelle gefangen! Sie glänzt, als hätte jemand sie poliert.','Messing ist eine Mischung aus Kupfer und Zink. Es rostet nicht und wurde deshalb gern für Uhren, Instrumente und Schiffsteile verwendet.'),
  (g,m)=>fishT(g,m,{id:'messingforelle',H:.18,L:.8,back:BRASS,belly:'#FFF1C8',tail:'fork',gloss:1.4,pat:(x,w,h,r)=>FT.spots(x,w,h,'#A8744A',24,2,4,r)}));
F('kompassqualle',fishMeta('Kompass-Qualle','uhrwerk','meer','M','immer',3,1500,'Ich hab eine Kompass-Qualle gefangen! Ihre Nadel zeigt immer nach Norden. Oder nach Futter.','Viele Tiere spüren das Magnetfeld der Erde: Zugvögel, Meeresschildkröten, sogar manche Bakterien richten sich danach aus.'),
  (g,m)=>{P(g,G.hs(.26),m.glass('#D8F0FF'),[0,0,0]);P(g,G.cy(.24,.24,.02,Q(20)),m.c(BRASS,{gloss:1.2}),[0,0,0]);const nd=grp(g,[0,.05,0]);P(nd,G.co(.03,.18,4),m.c('#F0443A'),[0,0,.08],[PI/2,0,0]);P(nd,G.co(.03,.18,4),m.c(STEEL),[0,0,-.08],[-PI/2,0,0]);
    range(6,(t,i)=>{const a=i/6*TAU;P(g,G.tu([[Math.cos(a)*.18,0,Math.sin(a)*.18],[Math.cos(a)*.2,-.24,Math.sin(a)*.2]],.012,.006),m.c(BRASS))})});

/* ================= Insekten ================= */
B('uhrwerkkaefer',bugMeta('Uhrwerk-Käfer','uhrwerk','boden','tag',1,160,'Ich hab einen Uhrwerk-Käfer gefangen! Ich höre ihn ticken.','Manche Käfer klopfen mit dem Kopf gegen Holz, um Partner zu finden. Weil das nachts wie eine Uhr tickt, heisst einer von ihnen Totenuhr.'),
  (g,m)=>{P(g,G.hs(.24),m.c(COPPER,{gloss:1.2}),[0,.08,0],null,[1,.8,1.2]);gear(g,m,.1,8,.03,BRASS,[0,.28,-.05],[PI/2,0,0]);bugFace(g,m,[0,.12,.28],.08,.5);legs(g,m.c(STEEL),[[.1,.15,.1],[0,.17,0],[-.1,.15,-.1]],.25)});
B('zahnradspinne',bugMeta('Zahnrad-Spinne','uhrwerk','baum','nacht',2,420,'Ich hab eine Zahnrad-Spinne gefangen! Ihr Netz sieht aus wie ein Getriebe.','Spinnenseide ist, gemessen an ihrem Gewicht, fester als Stahl. Manche Spinnen fressen ihr Netz jeden Morgen und bauen es neu.'),
  (g,m)=>{const sm=m.c(STEEL,{gloss:1.2});gear(g,m,.14,8,.05,BRASS,[0,.16,-.05],[0,0,0]);P(g,G.s(.08),sm,[0,.14,.1]);bugFace(g,m,[0,.15,.16],.06,.6);for(let i=0;i<4;i++)both(s=>P(g,G.tu([[s*.06,.14,.1-i*.06],[s*.2,.26,.12-i*.08],[s*.28,0,.14-i*.1]],.012,.008),sm))});
B('messinglibelle',bugMeta('Messing-Libelle','uhrwerk','luft','tag',2,560,'Ich hab eine Messing-Libelle gefangen! Ihre Flügel surren wie ein kleines Uhrwerk.','Die Flügel von Libellen haben ein feines Adernetz, das sie leicht und trotzdem stabil macht. Ingenieure bauen danach Flugdrohnen.'),
  (g,m)=>{const bm=m.c(BRASS,{gloss:1.3});P(g,G.ca(.035,.7),bm,[0,.3,-.15],[PI/2,0,0]);P(g,G.s(.08),bm,[0,.3,.24]);bugFace(g,m,[0,.3,.26],.08,.6,{er:.4});const wm=m.c('#E8F4FF',{opacity:.5,rim:1});for(const z of[.14,.04])wingPair(g,m,wm,leafShape(.6,.12),[0,.33,z],.6,.05,.1,.02)});
B('tickgrille',bugMeta('Tick-Grille','uhrwerk','boden','nacht',1,120,'Ich hab eine Tick-Grille gefangen! Sie zirpt im Sekundentakt.','Grillen zirpen schneller, wenn es warm ist. Zählt man die Zirper in 14 Sekunden und addiert 40, bekommt man ungefähr die Temperatur in Fahrenheit.'),
  (g,m)=>{const bm=m.c('#6E5040',{gloss:.8});P(g,G.ca(.1,.35),bm,[0,.18,0],[PI/2,0,0]);P(g,G.s(.12),bm,[0,.2,.26]);bugFace(g,m,[0,.2,.36],.09,.5);both(s=>P(g,G.tu([[s*.08,.15,-.05],[s*.18,.4,-.18],[s*.16,.06,-.34]],.025,.02),m.c(BRASS)));feelers(g,bm,bm,[.04,.28,.36],.5,.3,.3)});
B('kuckucksfalter',bugMeta('Kuckucks-Falter','uhrwerk','blume','tag',3,1200,'Ich hab einen Kuckucks-Falter gefangen! Er fliegt jede Stunde einmal im Kreis.','Manche Falter haben eine innere Uhr, die an die Sonne gekoppelt ist. Monarchfalter finden damit auf ihrer tausende Kilometer langen Reise den Weg.'),
  (g,m)=>butterfly(g,m,'kuckucksfalter','#6EC8B0','#E0B45A','#6E5040'));

/* ================= Fundstücke ================= */
REL('taschenuhr',relMeta('Goldene Taschenuhr','uhrwerk','schatz',2,1200,'Eine goldene Taschenuhr! Sie ist um 3:17 Uhr stehen geblieben. Warum wohl?','Taschenuhren wurden im 16. Jahrhundert erfunden. Bahnbeamte mussten später besonders genaue tragen, damit die Züge nicht zusammenstiessen.'),
  (g,m)=>{P(g,G.cy(.3,.3,.08,Q(24)),m.c(BRASS,{gloss:1.4,rim:.6}),[0,.05,0]);P(g,G.cy(.26,.26,.085,Q(24)),m.c('#FFF6E4'),[0,.055,0]);P(g,G.to(.06,.02),m.c(BRASS,{gloss:1.3}),[0,.05,.34],[0,0,0]);P(g,G.bx(.02,.012,.14,0),m.c('#2E2A3E'),[.03,.1,.03],[0,.9,0]);P(g,G.bx(.02,.012,.2,0),m.c('#2E2A3E'),[0,.1,-.06],[0,.2,0])});
REL('sanduhr',relMeta('Mond-Sanduhr','uhrwerk','kunst',2,900,'Eine Sanduhr mit silbernem Mondsand! Er rieselt nach oben.','Sanduhren wurden auf Schiffen benutzt, um die Zeit und damit die Geschwindigkeit zu messen. Eine Wache dauerte vier Stunden – acht Sanduhren.'),
  (g,m)=>{const bm=m.c('#8A5E42');P(g,G.cy(.26,.26,.05),bm,[0,.03,0]);P(g,G.cy(.26,.26,.05),bm,[0,.83,0]);for(let i=0;i<3;i++){const a=i/3*TAU;P(g,G.cy(.02,.02,.8),bm,[Math.cos(a)*.22,.43,Math.sin(a)*.22])}P(g,G.la([[0,0],[.18,.02],[.17,.2],[.03,.38],[0,.38]],Q(12)),m.glass('#E8F4FF'),[0,.05,0]);P(g,G.la([[0,0],[.03,0],[.17,.18],[.18,.36],[0,.38]],Q(12)),m.glass('#E8F4FF'),[0,.43,0]);P(g,G.co(.14,.14),m.c('#D8E0F0'),[0,.13,0])});
REL('spieldose',relMeta('Spieldose','uhrwerk','kunst',3,1700,'Eine Spieldose! Wenn man sie öffnet, dreht sich eine winzige Tänzerin.','In Spieldosen zupft eine Walze mit kleinen Stiften an einem Stahlkamm. Jeder Zahn des Kamms ist genau auf einen Ton gestimmt.'),
  (g,m)=>{P(g,G.bx(.6,.3,.44,.04),m.c('#C8566E',{gloss:.6}),[0,.15,0]);const lid=grp(g,[0,.3,-.22],[-1.1,0,0]);P(lid,G.bx(.6,.04,.44,.03),m.c('#C8566E'),[0,0,.22]);P(g,G.cy(.03,.03,.1),m.c(BRASS),[0,.35,0]);P(g,G.s(.05),m.c('#FFD1DC'),[0,.44,0]);P(g,G.co(.06,.1),m.c('#FFD1DC'),[0,.38,0],[PI,0,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  aufziehmaus:{n:'Aufziehmaus',planet:ID,biomes:['messingheide','federwiese','kupferschlucht'],count:5,size:.5,speed:1.6,voice:['tick','piep','rrrrr'],pitch:620,likes:['zahnrad','kaese'],product:'zahnrad',names:['Tick','Tack','Rädchen','Schlüsselchen','Messi'],
    fact:'Die ersten Aufziehspielzeuge gab es schon im alten Griechenland. Der Erfinder Heron baute Figuren, die mit Wasserdampf und Gewichten liefen.',a:{col:STEEL,belly:'#E8ECF2',body:[.26,.22,.38],head:{r:.2,p:[0,.38,.34]},snout:{type:'long',col:'#E8ECF2',nose:'#FF8FA3'},ears:{type:'round',x:.55,y:.62,inner:'#FFC8D8'},legs:{n:4,len:.06,r:.05,col:'#6E7680'},tail:{type:'long',col:'#6E7680',len:.9,r:.02},extra:{}}},
  messingeule:{n:'Messing-Eule',planet:ID,biomes:['zahnradwald','pendelhain'],fly:true,count:3,size:.8,speed:.8,night:true,voice:['huu-tick','schuhu','klick'],pitch:240,likes:['messingfeder','zahnrad'],product:'messingfeder',names:['Chronos','Minute','Glöckchen','Unruh','Anker'],
    fact:'Eulen fliegen fast lautlos: Die Kanten ihrer Federn sind gezackt wie ein Kamm und brechen die Luftwirbel.',a:{col:BRASS,belly:'#F2E0B0',body:[.3,.34,.3],head:{r:.28,p:[0,.66,.12],sc:[1.1,.95,1]},snout:{type:'beak',col:'#6E5040',len:.35},eyes:{r:.13,x:.4,y:.12},ears:{type:'pointy',len:.3,col:COPPER},legs:{n:2,len:.08,r:.04,col:'#6E5040'},tail:{type:'fan',col:COPPER},wings:{col:COPPER},brows:'#6E5040'}},
  zahnradschildkroete:{n:'Zahnrad-Schildkröte',planet:ID,biomes:['oelufer','messingheide','federwiese'],count:3,size:1,speed:.25,voice:['klonk','hmm'],pitch:150,likes:['beeren','kupferspan'],product:'kupferspan',names:['Getriebe','Unruh','Oma Oktav','Rostfrei','Tempo'],
    fact:'Riesenschildkröten können über 150 Jahre alt werden. Die Schildkröte Jonathan auf St. Helena schlüpfte um 1832 – und lebt immer noch.',a:{col:'#8ABCA8',belly:'#E8F4EE',body:[.38,.26,.46],head:{r:.18,p:[0,.3,.5]},snout:{type:'dot',nose:'#2E4E48'},ears:{type:'none'},legs:{n:4,len:.12,r:.08,col:'#7AB098'},tail:{type:'nub'},extra:{shell:COPPER,plate:BRASS}}},
  kuckuck:{n:'Kuckuck',planet:ID,biomes:['pendelhain','zahnradwald','federwiese'],fly:true,count:3,size:.5,speed:1.2,voice:['kuckuck','kuck-kuck','ku?'],pitch:420,likes:['beeren','zahnrad'],product:'feder',names:['Stundenschlag','Kuckuline','Punkt Zwölf','Rufi','Viertel'],
    fact:'Kuckucke legen ihre Eier in fremde Nester. Das Kuckucksküken wird dann von ganz anderen Vogeleltern grossgezogen.',a:{col:'#8E8AA0',belly:'#F2EEE8',body:[.24,.24,.36],head:{r:.19,p:[0,.5,.28]},snout:{type:'beak',col:'#E8A04A',len:.55},ears:{type:'none'},legs:{n:2,len:.1,r:.025,col:'#E8A04A'},tail:{type:'fan',col:'#6E6A80'},wings:{col:'#6E6A80'},stripes:{col:'#6E6A80',n:3}}},
  federkaenguru:{n:'Feder-Känguru',planet:ID,biomes:['federwiese','messingheide'],count:3,size:1.1,speed:1.4,gait:'hop',voice:['boing','tschak','hupf'],pitch:300,likes:['beeren','messingfeder'],product:'messingfeder',names:['Boing','Sprungfeder','Hüpfine','Spirale','Kiki'],
    fact:'Kängurus speichern beim Springen Energie in ihren Sehnen wie in einer Feder. Je schneller sie hüpfen, desto weniger Kraft brauchen sie dafür.',a:{col:COPPER,belly:'#F2D8B8',body:[.32,.36,.36],head:{r:.22,p:[0,.78,.26]},snout:{type:'muzzle',col:'#F2D8B8',nose:'#6E4A30'},ears:{type:'long',len:.5,inner:'#F2B8A0'},legs:{n:2,len:.2,r:.08,col:COPPER,foot:'#8A5A40'},tail:{type:'long',len:1,curl:.1,r:.07},gait:'hop'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','zylinder_zahnrad','Zahnrad-Zylinder',860,'#4E3A48',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.cy(r*1.05,r*1.05,r*.06),M.c(col),[0,0,0]);P(q,G.cy(r*.62,r*.66,r*.9),M.c(col),[0,r*.45,0]);P(q,G.cy(r*.67,r*.67,r*.14),M.c(BRASS,{gloss:1}),[0,r*.12,0]);gear(q,M,r*.28,8,r*.06,BRASS,[r*.62,r*.45,0],[0,PI/2,0])});
def('face','schweisserbrille','Tüftler-Brille',520,BRASS,(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.14,z=H.front+r*.05;for(const s of[-1,1]){P(g,G.cy(r*.17,r*.17,r*.12,Q(14)),M.c(col,{gloss:1.2}),[s*r*.3,y,z],[PI/2,0,0]);P(g,G.circ(r*.13),M.c('#6EC8B0',{gloss:1,opacity:.8}),[s*r*.3,y,z+r*.065])}P(g,G.to(r*.98,r*.04),M.c('#6E5040'),[0,y,0],[PI/2,0,0])});
def('neck','kettenuhr','Uhrenkette',480,BRASS,(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);P(g,G.to(r*.62,r*.025),M.c(col,{gloss:1.2}),[0,y,0],[PI/2,0,0]);const q=grp(g,[0,y-r*.35,r*.6]);P(q,G.cy(r*.16,r*.16,r*.05,Q(18)),M.c(col,{gloss:1.3}),[0,0,0],[PI/2,0,0]);P(q,G.cy(r*.13,r*.13,r*.055,Q(18)),M.c('#FFF6E4'),[0,0,0],[PI/2,0,0])});

/* ================= Bau-Familie: Uhrenhäuser ================= */
function uhrhaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.45:1;const style=plan.style||A.pick(r,['kuckuck','turm','zahnrad']);const body=new THREE.Group();g.add(body);const M=makeMats({skin:'haut',color:0});const C=c=>cozy({color:c});
  const W=(2.2+r()*.4)*big,D=(1.9+r()*.3)*big;let Hw=(1.8+r()*.3)*big,top=0,doorZ=-D/2-.02,R0=Math.max(W,D)/2;const wc=A.pick(r,['#F2E0C0','#E8D4B0','#F6E8D0','#D8E8E0']);
  if(style==='kuckuck'){P(body,G.bx(W,Hw,D,.06),C('#8A5E42'),[0,Hw/2,0]);P(body,G.bx(W*.9,Hw*.9,.04,.01),C(wc),[0,Hw/2,doorZ+.01]);
    /* steiles Satteldach mit Schnitzereien */const rs=new THREE.Shape();rs.moveTo(-W/2-.35,0);rs.lineTo(0,W*.62);rs.lineTo(W/2+.35,0);rs.lineTo(-W/2-.35,0);const rg=new THREE.ExtrudeGeometry(rs,{depth:D+.4,bevelEnabled:false});rg.translate(0,0,-(D+.4)/2);P(body,rg,C(A.pick(r,['#6E4A30','#4E8A5E','#C8566E'])),[0,Hw,0]);
    for(let i=0;i<9;i++){const x=-W/2-.3+i*(W+.6)/8;P(body,G.co(.06,.16,5),C('#FFF6E4'),[x,Hw-.08,doorZ-.02],[PI,0,0])}
    /* Zifferblatt und Kuckucks-Türchen */const f=grp(body,[0,Hw+W*.26,doorZ-.2]);P(f,G.cy(W*.2,W*.2,.06,Q(24)),C('#FFF6E4'),[0,0,0],[PI/2,0,0]);P(f,G.to(W*.2,.035),cozy({color:BRASS,gloss:1}),[0,0,-.02]);P(f,G.bx(.03,W*.14,.02,0),C('#2E2A3E'),[0,W*.06,-.04]);P(f,G.bx(.025,W*.1,.02,0),C('#2E2A3E'),[W*.04,-.02,-.04],[0,0,1.2]);
    const cd=grp(body,[0,Hw+W*.5,doorZ-.1]);P(cd,G.bx(.3,.3,.04,.03),C('#6E4A30'),[0,0,0]);/* Gewichte (Tannenzapfen) */both(s=>{P(body,G.cy(.01,.01,.9),cozy({color:BRASS}),[s*W*.25,Hw*.25,doorZ-.08]);P(body,G.s(.1),C('#8A5E42'),[s*W*.25,Hw*.25-.48,doorZ-.08],null,[1,1.6,1])});
    const ped=P(body,G.cy(.1,.1,.02,Q(14)),cozy({color:BRASS,gloss:1}),[0,.6,doorZ-.1],[PI/2,0,0]);body.userData.ped=ped;top=Hw+W*.62}
  else if(style==='turm'){R0=1.15*big;Hw=3.2*big;P(body,G.cy(R0,R0*1.06,Hw,Q(20)),C(wc),[0,Hw/2,0]);for(let i=0;i<4;i++)P(body,G.to(R0*1.02,.05),cozy({color:BRASS2,gloss:1}),[0,.2+i*Hw*.28,0],[PI/2,0,0]);
    const f=grp(body,[0,Hw*.8,-R0*1.01]);P(f,G.cy(R0*.6,R0*.6,.08,Q(24)),C('#FFF6E4'),[0,0,0],[PI/2,0,0]);P(f,G.to(R0*.6,.05),cozy({color:BRASS,gloss:1.2}),[0,0,-.03]);for(let i=0;i<12;i++){const a=i/12*TAU;P(f,G.bx(.03,.1,.02,0),C('#2E2A3E'),[Math.cos(a)*R0*.5,Math.sin(a)*R0*.5,-.05],[0,0,a])}
    const hh=grp(f,[0,0,-.06]),mh=grp(f,[0,0,-.07]);P(hh,G.bx(.05,R0*.3,.02,0),C('#2E2A3E'),[0,R0*.15,0]);P(mh,G.bx(.04,R0*.45,.02,0),C('#2E2A3E'),[0,R0*.22,0]);body.userData.hands=[hh,mh];
    P(body,G.co(R0*1.25,1.6*big,Q(16)),C(PATINA),[0,Hw+.8*big,0]);P(body,G.s(.14),cozy({color:BRASS,gloss:1}),[0,Hw+1.7*big,0]);doorZ=-R0*1.02;top=Hw+1.8*big}
  else{R0=1.3*big;Hw=2*big;P(body,G.cy(R0,R0,Hw,Q(22)),C(wc),[0,Hw/2,0]);/* Dach: grosses liegendes Zahnrad, dreht sich langsam */const gq=gear(body,M,R0*1.25,16,.3,A.pick(r,[BRASS,COPPER,PATINA]),[0,Hw+.18,0],[PI/2,0,0]);body.userData.gear=gq;P(body,G.cy(R0*.3,R0*.3,.6),C(BRASS2),[0,Hw+.4,0]);doorZ=-R0*1.01;top=Hw+.8}
  const dr=A.archDoor(A.pick(r,['#6E4A30','#4E8A5E','#C8566E','#2E6E6E']),'#4E3A30');dr.position.set(0,0,doorZ);dr.rotation.y=PI;body.add(dr);
  if(style!=='kuckuck')for(const sx of[-1,1]){const w=A.roundWindow(BRASS2,.2,false);w.position.set(sx*R0*.55,Math.min(1.5,Hw*.5),doorZ+.12);w.rotation.y=PI;body.add(w)}
  const ud=body.userData;g.userData.tick=t=>{if(ud.ped)ud.ped.position.x=Math.sin(t*2)*.18;if(ud.gear)ud.gear.rotation.z=t*.12;if(ud.hands){const h=typeof GAMETIME!=='undefined'?GAMETIME.hour():0;ud.hands[0].rotation.z=h/12*TAU;ud.hands[1].rotation.z=(h%1)*TAU}};
  addOutlines(body);return{g,R:R0+.8,top,door:[0,doorZ],walls:[new THREE.Box3(new V(-R0,0,-R0),new V(R0,top,R0))],style:'uhrhaus-'+style}}

/* ================= Möbel ================= */
furn('standuhr',{n:'Standuhr',cat:'deko',price:1800,planet:ID,size:[1,1],h:2,b:(g,m)=>{const wm=m.c('#6E4A30');P(g,G.bx(.5,1.9,.36,.04),wm,[0,.95,0]);P(g,G.cy(.2,.2,.04,Q(20)),m.c('#FFF6E4'),[0,1.6,.19],[PI/2,0,0]);P(g,G.to(.2,.02),m.c(BRASS,{gloss:1}),[0,1.6,.2]);P(g,G.bx(.3,.9,.02,0),m.glass('#E8F4FF'),[0,.75,.19]);
  const pv=grp(g,[0,1.3,.12]);P(pv,G.cy(.01,.01,.6),m.c(BRASS),[0,-.3,0]);P(pv,G.cy(.1,.1,.02,Q(16)),m.c(BRASS,{gloss:1.3}),[0,-.62,0],[PI/2,0,0]);g.userData.tick=t=>{pv.rotation.z=Math.sin(t*2)*.25}}});
furn('zahnradtisch',{n:'Zahnrad-Tisch',cat:'tisch',price:1200,planet:ID,size:[1,1],h:.7,b:(g,m)=>{gear(g,m,.48,14,.06,BRASS,[0,.68,0],[PI/2,0,0]);P(g,G.cy(.06,.08,.65),m.c(COPPER),[0,.33,0]);P(g,G.cy(.26,.3,.05),m.c(COPPER),[0,.03,0])}});
furn('kuckucksuhr',{n:'Kuckucksuhr',cat:'wand',price:1400,planet:ID,wall:true,size:[1,1],h:1,b:(g,m)=>{P(g,G.bx(.5,.56,.2,.03),m.c('#8A5E42'),[0,1.5,0]);P(g,G.co(.44,.3,4),m.c('#4E8A5E'),[0,1.9,0],[0,PI/4,0]);P(g,G.cy(.14,.14,.03,Q(18)),m.c('#FFF6E4'),[0,1.46,.11],[PI/2,0,0]);P(g,G.bx(.12,.12,.02,.01),m.c('#6E4A30'),[0,1.7,.11]);
  both(s=>{P(g,G.cy(.006,.006,.6),m.c(BRASS),[s*.12,1,.05]);P(g,G.s(.05),m.c('#6E4A30'),[s*.12,.7,.05],null,[1,1.8,1])})}});
furn('spieldosen_lampe',{n:'Spieldosen-Lampe',cat:'licht',price:1100,planet:ID,size:[1,1],h:1.1,b:(g,m)=>{P(g,G.bx(.4,.2,.3,.03),m.c('#C8566E'),[0,.1,0]);P(g,G.cy(.02,.02,.5),m.c(BRASS),[0,.45,0]);const q=grp(g,[0,.8,0]);P(q,G.co(.26,.26,8,1,true),m.c('#FFF1C8'),[0,0,0]);P(q,G.s(.07),m.glow('#FFE3A0',1.6),[0,-.05,0]);g.userData.light={p:[0,.75,0],c:'#FFE3A0',i:1};g.userData.tick=t=>{q.rotation.y=t*.5}}});

/* ================= Sprache: Zifferblatt-Zeichen ================= */
function clockGlyph(x,s,r){x.beginPath();x.arc(0,0,s*.3,0,TAU);const a=r()*TAU,b=r()*TAU;x.moveTo(0,0);x.lineTo(Math.cos(a)*s*.16,Math.sin(a)*s*.16);x.moveTo(0,0);x.lineTo(Math.cos(b)*s*.25,Math.sin(b)*s*.25);const n=Math.floor(r()*4)+1;for(let i=0;i<n;i++){const c=i/n*TAU+r();x.moveTo(Math.cos(c)*s*.3,Math.sin(c)*s*.3);x.lineTo(Math.cos(c)*s*.4,Math.sin(c)*s*.4)}x.stroke()}

/* ================= Planet ================= */
/* Zahnrad-Plateaus: Zentren und Zähne */const PLATS=[[30,40,.2,14],[-10,130,.16,11],[12,220,.22,16],[-40,300,.18,12],[-65,60,.14,9],[48,170,.12,10]].map(([la,lo,r,t])=>({d:dirLL(la,lo),r,t}));
PLANETKIT.add(ID,{
  def:{n:'Uhrwerk-Mond',base:'kompost',R:124,R0:44,sea:-.4,music:'town',sky:['#F2C890','#FFF0D8'],fog:'#F2E4CC',water:'#4EA8A0',deep:'#2E6E6E',step:1.2,shop:ID,
    desc:'Ein Mond aus Messing und Kupfer mit Zahnrad-Plateaus und schwingenden Pendeln. Zieh die sechs Aufzieh-Wächter auf und hör das grosse Glockenspiel.',weather:'blueten',orbit:[152,2.9],moonOf:'klang',size:.9,col:['#E0B45A','#4EA8A0'],moons:0,ring:true,ringCols:['#E0B45A','#C8964A','#D08A5A'],
    park:'federwiese',parkPond:true,phone:['#F2D8A0','#B8E0D8'],stones:['kiesel','zahnrad','schraube'],plazaTree:'zahnradbaum',path:'#D8C8A8',
    space:{deep:'#2E6E6E',water:'#4EA8A0',shore:'#D8C488',land:'#D8C488',land2:'#A8C090',high:'#C8906A',cap:'#FFF1C8',atmo:'#F2C890',cloud:.35,sea:.34,capA:.4,freq:2.8},
    mac:{oc:-.15,m:.2,isl:.9},climate:{hot:'kupferschlucht',wet:'oelufer',cold:'pendelhain'},peak:'kupferschlucht',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.15,4)*1.8+.9;for(const G_ of PLATS){const a=angle(p,G_.d);if(a>G_.r*1.3)continue;
        /* Zahnkranz: Radius schwankt je nach Winkel um die Mitte */const ax=new V(0,1,0).cross(G_.d).normalize();const ay=G_.d.clone().cross(ax);const lx=p.dot(ax),ly=p.dot(ay);const th=Math.atan2(ly,lx);const tooth=Math.sin(th*G_.t)>0?1:.9;
        h+=4.2*sstep(G_.r*tooth,G_.r*tooth-.012,a);if(a<G_.r*.22)h-=1.2*sstep(G_.r*.22,G_.r*.18,a)}return h},
    biome({T,M,h,sea,low,nearPond,p}){if(nearPond||(low&&h<sea+.6))return'oelufer';if(h>sea+4.4)return'kupferschlucht';if(M>.25)return'zahnradwald';if(T<-.15)return'pendelhain';if(T>.2)return'messingheide';return'federwiese'},
    onLoad:W=>UHRWERK.onLoad(W),tick:(dt,t,W,me)=>UHRWERK.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Kuckucks-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Ölweiher',lat:52,lon:110,r:.09,pond:true},{id:'teich2',n:'Kühlbecken',lat:40,lon:250,r:.1,pond:true},{id:'see',n:'Uhrenöl-See',lat:-20,lon:180,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Roulette-Werk',mode:'Uhrmacher-Schneiderei',praxis:'Feinmechanik-Praxis',museum:'Zeitmuseum',shop:'Uhrmacherei',studio:'Gravur-Atelier',bar:'Tick-Tack-Bar',rathaus:'Glockenturm',garage:'Getriebe-Garage',pflanzen:'Messingblumen-Gärtnerei',tiere:'Aufziehtier-Stall'},
  sty:{wall:'putz',walls:['#F2E0C0','#E8D4B0','#F6E8D0','#D8E8E0'],roof:'gable',roofs:['#6E4A30','#4E8A5E','#6EC8B0','#C8566E'],trim:'#E0B45A',plinth:'#A8805A',door:'#6E4A30',win:'rund',pitch:1.1},
  wall:'holzpaneel',floor:'parkett',
  mayor:['Meisterin Unruh',{skin:'patina',color:4,shape:'glocke'},{kopf:'uhr',augen:'monokel',arme:'schluessel',beine:'raeder',extras:['zahnraeder']}],
  lore:['Früher lief auf unserem Mond alles im gleichen Takt. Dann sind die sechs Aufzieh-Wächter stehen geblieben.','Mit dem grossen Schlüssel kannst du sie wieder aufziehen. Sie laufen dann ihre alte Runde – und ticken ganz zufrieden.','Wenn alle sechs wieder wach sind, spielt das Glockenspiel im Turm. Das haben wir seit hundert Jahren nicht mehr gehört.'],
  caveRock:['#C8B08A','#A8906E','#6E5A48',['#F2D8A0','#FFE8C8','#B8E0D8']],
  wear:['zylinder_zahnrad','schweisserbrille','kettenuhr','monokel','zylinder','halstuch'],clothes:CL,
  haus:{theme:{roof:['#6E4A30','#4E8A5E','#6EC8B0'],wall:['#F2E0C0','#E8D4B0'],wood:['#6E4A30','#8A5E42'],stone:['#C8B08A','#A8906E'],trim:['#E0B45A'],plant:['#A8C090','#98B480']},
    props:[['town','lantern',1,'d',0],['nature','pot_large',1.2,'d',0],['town','cart',1,'c',0],['space','machine_generator',.8,'c',0]],
    garden:{path:'path_stone',flowers:['flower_yellowA','flower_redB'],veg:['crop_turnip']},
    plan:[{fam:'uhrhaus',style:'kuckuck'},{fam:'uhrhaus',style:'turm'},{fam:'uhrhaus',style:'zahnrad'},{fam:'uhrhaus'}],fams:{uhrhaus}},
  residents:{skins:['patina','gold','chrom','holz','rost','keramik'],heads:['uhr','mensch','eule','roehre','monitor','teekanne','globus','taucherhelm','vogel'],names:['Unruh','Tick','Tack','Minuta','Sekundus','Anker','Rädchen','Pendula','Spirale','Kronrad','Zeiger','Viertelstunde'],
    house:{shapes:['haus','rund'],walls:['putz','holz'],wallCols:['#F2E0C0','#E8D4B0'],roofCols:['#6E4A30','#4E8A5E'],win:['rund']},deco:['messingblume','federpflanze','uhrsaeule'],fence:true},
  lang:{n:'Zifferschrift',ink:'#6E4A30',glow:'#E0B45A',kind:'clock',draw:clockGlyph,syl:['tik','tak','ding','dong','kli','klo','ra','zi','mo','uh','pen','tu']},ruinStone:'#C8B08A',
  terraform:['messingheide','federwiese','zahnradwald','pendelhain'],
  weather:[['klar',3],['heiter',3],['nebel',2],['regen',1],['funken',1]]});

/* ================= Planeten-Besonderheiten ================= */
const UHRWERK=(()=>{let W_=null,guards=[],cuckoo=null,lastH=-1,chime=0;const M=()=>makeMats({skin:'haut',color:0});
  const S=()=>SAVE.uhrwerk=SAVE.uhrwerk||{wound:[],chimed:false};
  const NAMES=['Wächter Minute','Wächterin Sekunde','Wächter Stunde','Wächterin Viertel','Wächter Mitternacht','Wächterin Mittag'];
  function guardModel(m,i){const g=new THREE.Group();const col=[BRASS,COPPER,PATINA,BRASS2,STEEL,'#C8566E'][i%6];const cm=m.c(col,{gloss:1.2,rim:.5});
    const body=grp(g,[0,0,0]);P(body,G.cy(.35,.45,1.1,Q(14)),cm,[0,.95,0]);P(body,G.s(.36),cm,[0,1.75,0]);/* Gesicht: Zifferblatt */P(body,G.cy(.26,.26,.05,Q(20)),m.c('#FFF6E4'),[0,1.78,.3],[PI/2,0,0]);eye(body,m,[.09,1.84,.33],.05,[.3,0,1]);eye(body,m,[-.09,1.84,.33],.05,[-.3,0,1]);
    P(body,G.cy(.4,.4,.08),m.c(shade(col,.8)),[0,.42,0]);const legs=[];both(s=>{const l=grp(body,[s*.18,.42,0]);P(l,G.cy(.08,.08,.42),m.c(STEEL),[0,-.21,0]);P(l,G.s(.12),m.c(shade(col,.7)),[0,-.42,.05],null,[1,.6,1.4]);legs.push(l)});
    const arms=[];both(s=>{const a=grp(body,[s*.42,1.3,0],[0,0,s*.2]);P(a,G.cy(.06,.06,.5),m.c(STEEL),[0,-.25,0]);P(a,G.s(.1),cm,[0,-.52,0]);arms.push(a)});
    /* Aufziehschlüssel im Rücken */const key=grp(body,[0,1.2,-.42]);P(key,G.cy(.03,.03,.3),m.c(BRASS),[0,0,-.15],[PI/2,0,0]);both(s=>P(key,G.to(.1,.03),m.c(BRASS,{gloss:1.3}),[s*.1,0,-.32],[0,PI/2,0]));
    gear(body,m,.16,8,.04,shade(col,1.1),[0,1.1,.4],[0,0,0]);addOutlines(g);g.userData={body,legs,arms,key};return g}
  function onLoad(W){W_=W;guards=[];cuckoo=null;lastH=Math.floor(GAMETIME.hour());const m=M();const st=S();
    /* je ein Wächter auf den Zahnrad-Plateaus */PLATS.forEach((pl,i)=>{let d=pl.d.clone();if(!GAME.isLand(d)){const rr=srand(i*31+7);for(let k=0;k<400;k++){const t=GAME.tangentTo(pl.d,new V(rr()*2-1,rr()*2-1,rr()*2-1));const c=pl.d.clone().addScaledVector(t,(4+k*.3)/W.R).normalize();if(GAME.isLand(c)&&W.hAt(c)>W.sea+.6){d=c;break}}}const g=guardModel(m,i);GAME.placeObj(g,d,i,0);GAME.addObst(d,.6);const Gd={i,d,home:d.clone(),g,awake:st.wound.includes(i),ph:i*1.3,a:0};guards.push(Gd);
      W.inter.push({kind:'waechter',p:d,r:2,label:'Aufzieh-Wächter aufziehen',act:()=>wind(Gd),when:()=>!Gd.awake});W.inter.push({kind:'waechter2',p:d,r:2,label:'Mit '+NAMES[i]+' sprechen',act:()=>talkG(Gd),when:()=>Gd.awake})});
    /* Kuckucksuhr am Dorfplatz */const pl=W.places[0];const dd=PLANETKIT.freeSpot(W,pl.dir,9,40,1.5);const g=new THREE.Group();NATURE.uhrsaeule.b(g,m,{},srand(3));
    const bird=grp(g,[0,3.2,.2]);P(bird,G.s(.14),m.c('#8E8AA0'),[0,0,0]);P(bird,G.co(.04,.12),m.c('#E8A04A'),[0,0,.16],[PI/2,0,0]);eye(bird,m,[.06,.05,.1],.03,[.5,.2,.8]);eye(bird,m,[-.06,.05,.1],.03,[-.5,.2,.8]);bird.visible=false;addOutlines(g);GAME.placeObj(g,dd,0,0);GAME.addObst(dd,.5);cuckoo={g,bird,t:0,n:0};
    const tickF=g.userData.tick;if(tickF)W.ticks.push(g)}
  function wind(Gd){if(Gd.awake)return;const st=S();SND.play('creak');let turns=0;const iv=setInterval(()=>{turns++;SND.play('toggle',{rate:1+turns*.1});Gd.g.userData.key.rotation.z+=PI/2;if(turns>=4){clearInterval(iv);Gd.awake=true;st.wound.push(Gd.i);persist();SND.play('bell',{rate:1+Gd.i*.12});GAME.W.fx(Gd.d,'stern',12);
      const n=st.wound.length;UI.toast(NAMES[Gd.i]+' ist erwacht! ('+n+'/6)',2800);if(n===6&&!st.chimed)setTimeout(grandChime,2500)}},380)}
  async function talkG(Gd){const lines=[['Tick. Tack. Danke fürs Aufziehen!','Ich laufe jetzt wieder meine Runde. Hundert Jahre hab ich geschlafen.'],['Weisst du, wie spät es ist? Ich schon. Immer.'],['Die Zahnräder im Wald drehen sich nur, weil wir laufen. Glaube ich.']];await UI.talk(NAMES[Gd.i],pick(lines))}
  async function grandChime(){const st=S();st.chimed=true;persist();chime=8;const notes=[0,4,7,12,7,4,9,12];notes.forEach((n,i)=>setTimeout(()=>SND.play('bell',{rate:Math.pow(2,n/12)}),i*420));
    await UI.talk('Meisterin Unruh',['Hörst du das? Das grosse Glockenspiel!','Alle sechs Wächter laufen wieder. Der ganze Mond tickt im Takt.','Hier, nimm diese Taschenuhr als Dank. Sie geht jetzt wieder richtig.']);if(typeof bagAdd==='function')bagAdd('relic','taschenuhr');money(800);SND.jingle('j_success');UI.toast('Du erhältst die Goldene Taschenuhr und 800 Taler.',3200)}
  function tick(dt,t,W,me){for(const Gd of guards){const u=Gd.g.userData;if(!Gd.awake){u.body.rotation.z=.08;continue}u.body.rotation.z=0;Gd.a+=dt*.25;
      /* kleine Runde um das Plateau-Zentrum */const up=Gd.home;const t1=GAME.tangentTo(up,new V(1,0,0)),t2=up.clone().cross(t1);const rr=3/W.R;const d=up.clone().addScaledVector(t1,Math.cos(Gd.a)*rr).addScaledVector(t2,Math.sin(Gd.a)*rr).normalize();
      let fw=t1.clone().multiplyScalar(-Math.sin(Gd.a)).addScaledVector(t2,Math.cos(Gd.a));fw.addScaledVector(d,-fw.dot(d)).normalize();GAME.placeObj(Gd.g,d,0,0);
      const right=d.clone().cross(fw);Gd.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,d,fw));u.legs.forEach((l,k)=>l.rotation.x=Math.sin(t*6+k*PI)*.4);u.arms.forEach((a,k)=>a.rotation.x=Math.sin(t*6+k*PI+PI)*.4);u.key.rotation.z=t*1.5;Gd.d.copy(d)}
    /* Kuckuck zur vollen Stunde */const h=Math.floor(GAMETIME.hour());if(cuckoo&&h!==lastH){lastH=h;cuckoo.n=(h%12)||12;cuckoo.t=0;cuckoo.bird.visible=true}
    if(cuckoo&&cuckoo.bird.visible){cuckoo.t+=dt;const k=cuckoo.t%1;cuckoo.bird.position.z=.2+Math.sin(Math.min(1,k*2)*PI)*.4;if(k<dt*1.01&&cuckoo.n>0&&me&&angle(me.p,cuckoo.g.position.clone().normalize())*W.R<40){SND.play('pep',{rate:1.3});cuckoo.n--}if(cuckoo.n<=0&&k>.9)cuckoo.bird.visible=false}}
  return{onLoad,tick,guards:()=>guards,grandChime}
})();
window.UHRWERK=UHRWERK;
})();
