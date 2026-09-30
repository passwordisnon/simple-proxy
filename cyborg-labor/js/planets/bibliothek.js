/* =====================================================================
   CYBORG-LABOR · planets/bibliothek.js · Bibliotheks-Planet
   Bäume aus Bücherstapeln mit Blättern aus Papier, Tintenseen, Wiesen
   voller Papierblumen und Leselampen an jedem Weg. Besonderheiten:
   · Verlorene Geschichten: sechs Bücher haben ihre Seiten verloren. Die
     leuchtenden Seiten liegen überall verstreut. Wer ein Buch vollständig
     zum grossen Lesepult bringt, hört die Geschichte – und bekommt ein
     Geschenk vom Bibliothekar.
   · Nachts schweben leuchtende Buchstaben um die Leselampen.
   ===================================================================== */
(function(){
const ID='bibliothek';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,shade,flatLeaf,leafShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,butterfly,fin2}=NH;
const V=THREE.Vector3;
const COVERS=['#C8566E','#3E6EA8','#4E8A5E','#E8A04A','#8E6BD1','#2E6E6E','#B84E3A','#D8B45A'];const PAPER='#FFF6E4',PAPER2='#F2E6CC',INK='#2E3468';
function book(g,m,w,h,d,col,pos,rot){const q=grp(g,pos,rot);P(q,G.bx(w,h,d,Math.min(.04,h*.2)),m.c(col,{rim:.4}),[0,0,0]);P(q,G.bx(w*.94,h*.84,d*.96,.01),m.c(PAPER2),[w*.04,0,0]);P(q,G.bx(w*.06,h*1.02,d*1.02,.01),m.c(shade(col,.8)),[-w*.47,0,0]);
  P(q,G.bx(w*.02,h*.9,d*.2,0),m.c('#E8C87A',{gloss:1}),[-w*.5,0,0]);return q}

/* ================= Natur ================= */
N('buecherbaum',{r:.5,h:4.6,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{let y=0;const n=6+Math.floor(rnd()*4);for(let i=0;i<n;i++){const w=RR(rnd,.8,1.1)*(1-i*.04),h=RR(rnd,.2,.34);book(g,m,w,h,w*.72,COVERS[Math.floor(rnd()*8)],[RR(rnd,-.06,.06),y+h/2,RR(rnd,-.06,.06)],[0,rnd()*TAU,0]);y+=h}
  /* Krone: Papierblätter (Seiten) als Fächer */const lm=m.c(PAPER,{rim:.6,rimColor:'#ffffff'}),lm2=m.c('#E8F0D8',{rim:.5});for(let i=0;i<22;i++){const th=Math.acos(1-2*(i+.5)/22)*.7,ph=i*2.4;const d=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));
    const q=grp(g,[d.x*1,y+.6+d.y*.9,d.z*1]);q.quaternion.setFromUnitVectors(new V(0,0,1),d);P(q,G.bx(.5,.66,.012,.004),i%3?lm:lm2,[0,0,0]);for(let k=0;k<4;k++)P(q,G.bx(.34,.018,.014,0),m.c('#B8B0A0'),[0,.18-k*.1,.004]).userData.noOutline=true}
  P(g,G.s(.9),m.c('#F4ECD8',{rim:.5}),[0,y+.7,0],null,[1.1,.8,1.1])});
N('buecherstapel',{r:.45,h:1.2,size:'small',planet:ID},(g,m,o,rnd)=>{let y=0;const n=3+Math.floor(rnd()*4);for(let i=0;i<n;i++){const w=RR(rnd,.5,.75),h=RR(rnd,.12,.22);book(g,m,w,h,w*.7,COVERS[Math.floor(rnd()*8)],[0,y+h/2,0],[0,rnd()*.8,0]);y+=h}
  if(rnd()<.5){const q=grp(g,[0,y+.02,0],[0,rnd()*3,0]);P(q,G.bx(.4,.03,.28,.01),m.c(PAPER),[-.2,0,0],[0,0,.15]);P(q,G.bx(.4,.03,.28,.01),m.c(PAPER),[.2,0,0],[0,0,-.15])}});
N('papierblume',{r:.25,h:.7,size:'tiny',planet:ID},(g,m,o,rnd)=>{const col=['#FFF6E4','#FFD1DC','#D8E8FF','#FFF1B8'][Math.floor(rnd()*4)];P(g,G.tu([[0,0,0],[.03,.3,0],[0,.55,0]],.015,.012),m.c('#8FB87A'));
  for(let i=0;i<5;i++){const a=i/5*TAU;P(g,G.co(.09,.18,4),m.c(col,{rim:.6}),[Math.cos(a)*.08,.58,Math.sin(a)*.08],[Math.sin(a)*1.2,0,-Math.cos(a)*1.2])}P(g,G.s(.04),m.c('#E8A04A'),[0,.6,0])});
N('federkiel',{r:.3,h:3.2,size:'big',planet:ID},(g,m,o,rnd)=>{const q=grp(g,[0,0,0],[.25,rnd()*TAU,.15]);P(q,G.co(.05,.5),m.c('#2E3468',{gloss:1}),[0,.2,0],[PI,0,0]);P(q,G.cy(.04,.05,2.8),m.c('#F2EAD8'),[0,1.8,0]);
  const fm=m.c(['#FFFFFF','#FFB8C8','#B8D8FF'][Math.floor(rnd()*3)],{rim:.8});both(s=>P(q,flatLeaf(leafShape(2.4,.5),.02,.2),fm,[s*.02,2,0],[0,s*PI/2,0]));P(g,G.cy(.45,.5,.08),m.c('#1E2448'),[0,.04,0])});
N('tintenfass',{r:.8,h:1.4,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.la([[0,0],[.75,0],[.8,.1],[.8,.8],[.4,1],[.35,1.25],[0,1.25]],Q(20)),m.glass('#3E4E8E'),[0,0,0]);P(g,G.cy(.72,.72,.6),m.c(INK),[0,.45,0]);P(g,G.to(.38,.06),m.c('#E8C87A',{gloss:1}),[0,1.25,0],[PI/2,0,0])});
N('leselampe',{r:.25,h:3,size:'small',planet:ID},(g,m,o,rnd)=>{const bm=m.c('#4E8A5E',{gloss:.8});P(g,G.cy(.06,.08,2.6),m.c('#2E3A3E'),[0,1.3,0]);P(g,G.tu([[0,2.6,0],[.2,2.9,0],[.6,2.85,0]],.04,.04),m.c('#2E3A3E'));
  P(g,G.co(.32,.3,12,1,true),bm,[.62,2.72,0]);markGlow(g,P(g,G.s(.12),m.glow('#FFE3A0',2),[.62,2.6,0]));P(g,G.cy(.25,.3,.1),m.c('#2E3A3E'),[0,.05,0]);g.userData.light={p:[.62,2.5,0],c:'#FFE3A0',i:1}});
N('schriftrolle',{r:.5,h:.6,size:'small',planet:ID},(g,m,o,rnd)=>{const q=grp(g,[0,.2,0],[0,rnd()*TAU,0]);P(q,G.cy(.18,.18,.9),m.c(PAPER2,{rim:.4}),[0,0,0],[0,0,PI/2]);both(s=>P(q,G.cy(.06,.06,.12),m.c('#8A5E42'),[s*.5,0,0],[0,0,PI/2]));P(q,G.bx(.6,.01,.5,0),m.c(PAPER),[0,-.18,.3],[.1,0,0]);P(q,G.to(.19,.02),m.c('#C8566E'),[0,0,0],[0,PI/2,0])});
N('buchbogen',{r:.6,h:3.6,size:'big',planet:ID,cols:[[-1.6,0,.5],[1.6,0,.5]]},(g,m,o,rnd)=>{for(const s of[-1,1]){let y=0;for(let i=0;i<9;i++){const h=RR(rnd,.28,.4);book(g,m,.9,h,.7,COVERS[(i+(s>0?3:0))%8],[s*1.6,y+h/2,0],[0,rnd()*.4,0]);y+=h}}
  const q=grp(g,[0,3.4,0]);P(q,G.bx(4.2,.3,.9,.05),m.c(COVERS[4]),[0,0,0]);P(q,G.bx(4,.24,.84,.01),m.c(PAPER2),[0,0,.04])});
Object.assign(NH.ROCK,{[ID]:['#E8DCC4','#C8B8A0','#8FB87A']});

/* ================= Biome ================= */
const BI={
  buecherwald:{n:'Bücherwald',g:['#C8D8A8','#B8CC98'],cliff:'#A08A70',pat:'moos',grass:'#C0D4A0',grassD:.8,trees:[['buecherbaum',4],['buecherstapel',1.2]],treeD:1.6,
    deco:[['papierblume',4],['buecherstapel',1],['farn',2,{color:'#A8C890'}]],decoD:5,rocks:[['findling',.3],['schriftrolle',.4]],rockD:.4,litter:[['papierseite',1.2],['ast',.5]]},
  papierwiese:{n:'Papierwiese',g:['#F2EAD4','#E8DEC4'],cliff:'#C8B8A0',pat:'gras',grass:'#E8E4C8',grassD:.8,trees:[['buecherbaum',.8],['leselampe',.3]],treeD:.4,
    deco:[['papierblume',9],['klee',2],['federkiel',.15]],decoD:7,rocks:[['kiesel',1],['schriftrolle',.6]],rockD:.4,litter:[['papierseite',1.5],['lesezeichen',.3]]},
  tintenufer:{n:'Tintenufer',g:['#8E9AB8','#7E8AA8'],cliff:'#5E6488',pat:'moos',grass:'#98A8C0',grassD:.6,trees:[['federkiel',1],['buecherbaum',.4]],treeD:.6,
    deco:[['schilf',3],['tintenfass',.3],['papierblume',2]],decoD:4,rocks:[['stein',1],['tintenfass',.3]],rockD:.4,litter:[['tintentropfen',1.4]]},
  lesegarten:{n:'Lesegarten',g:['#B8D8A0','#A8CC90'],cliff:'#A08A70',pat:'gras',grass:'#B0D498',grassD:1,trees:[['buecherbaum',1.5],['leselampe',1],['kirschbaum',.6]],treeD:1,
    deco:[['blume',4],['papierblume',4],['buecherstapel',1.2]],decoD:6,rocks:[['kiesel',1]],rockD:.3,litter:[['papierseite',.8],['beeren',.4]]},
  schriftrollenhuegel:{n:'Schriftrollenhügel',g:['#E8D8B0','#DCCAA0'],cliff:'#B8A078',pat:'sand',grass:'#D8D0A8',grassD:.3,trees:[['buchbogen',.15],['federkiel',.4]],treeD:.3,
    deco:[['schriftrolle',3],['kiesel',2]],decoD:3,rocks:[['findling',.6],['schriftrolle',1]],rockD:.8,litter:[['papierseite',.6],['lesezeichen',.5]]},
  staubarchiv:{n:'Staubarchiv',g:['#D8C8B0','#C8B8A0'],cliff:'#9A8A78',pat:'staub',grass:null,grassD:0,trees:[['buecherstapel',1.5],['buchbogen',.2]],treeD:.6,
    deco:[['buecherstapel',2],['schriftrolle',2]],decoD:3,rocks:[['findling',.6],['tintenfass',.2]],rockD:.6,litter:[['papierseite',.8],['stein_klein',.6]]}};

/* ================= Sammelsachen ================= */
IT('papierseite',itMeta('Lose Seite','bibliothek','material',25),(g,m)=>{const q=grp(g,[0,.03,0],[-PI/2+.05,0,.3]);P(q,G.bx(.4,.52,.01,0),m.c(PAPER),[0,0,0]);for(let i=0;i<6;i++)P(q,G.bx(.28,.016,.012,0),m.c('#A8A098'),[0,.18-i*.07,.004]).userData.noOutline=true});
IT('tintentropfen',itMeta('Tintentropfen','bibliothek','material',60),(g,m)=>{P(g,G.s(.18),m.c(INK,{gloss:1.3,rim:.6}),[0,.18,0],null,[1,1.2,1]);P(g,G.co(.1,.18),m.c(INK,{gloss:1.3}),[0,.38,0])});
IT('lesezeichen',itMeta('Goldenes Lesezeichen','bibliothek','material',180),(g,m)=>{const q=grp(g,[0,.03,0],[-PI/2,0,.4]);P(q,G.bx(.14,.6,.01,0),m.c('#C8566E'),[0,0,0]);P(q,G.cy(.05,.05,.012),m.c('#E8C87A',{gloss:1.3}),[0,.2,.01],[PI/2,0,0]);P(q,G.tu([[0,-.3,0],[.05,-.42,0],[-.02,-.5,0]],.01),m.c('#E8C87A'))});

/* ================= Fische (Tintenseen) ================= */
F('tintenfisch',fishMeta('Tintenfisch','bibliothek','meer','M','immer',1,280,'Ich hab einen Tintenfisch gefangen! Er hat mir einen Klecks aufs Hemd gemacht.','Tintenfische stossen bei Gefahr eine dunkle Wolke aus. Aus Sepia-Tinte wurde früher tatsächlich Schreibtinte gemacht.'),
  (g,m)=>{const bm=m.c('#8E6BD1',{gloss:.7,rim:.6});P(g,G.s(.2),bm,[0,0,-.1],null,[1,1,1.6]);range(8,(t,i)=>{const a=i/8*TAU;P(g,G.tu([[Math.cos(a)*.08,Math.sin(a)*.08,.18],[Math.cos(a)*.12,Math.sin(a)*.1,.36],[Math.cos(a)*.08,Math.sin(a)*.06,.5]],.022,.008),bm)});eye(g,m,[.12,.08,.12],.05,[1,.2,.3]);eye(g,m,[-.12,.08,.12],.05,[-1,.2,.3])});
F('buchstabenfisch',fishMeta('Buchstabenfisch','bibliothek','meer','M','tag',2,560,'Ich hab einen Buchstabenfisch gefangen! Auf seiner Seite steht „Hallo“. Glaube ich.','Manche Fische haben Muster, die wie Schrift aussehen – etwa der Arabische Kaiserfisch, auf dessen Schwanz man Zeichen zu erkennen meinte.'),
  (g,m)=>fishT(g,m,{id:'buchstabenfisch',H:.2,L:.78,back:'#F2EAD4',belly:'#FFFFFF',tail:'fork',pat:(x,w,h,r)=>{x.fillStyle=INK;x.font='bold 22px serif';const L='ABCDEFGHKLMNRSTZ';for(let i=0;i<12;i++){const u=.28+r()*.2,y=(.12+r()*.76)*h;const c=L[Math.floor(r()*L.length)];x.fillText(c,u*w,y);x.fillText(c,(1-u)*w-12,y)}}}));
F('federkielhecht',fishMeta('Federkiel-Hecht','bibliothek','meer','L','immer',3,1400,'Ich hab einen Federkiel-Hecht gefangen! Mit seiner Nase könnte man Briefe schreiben.','Hechte lauern regungslos im Schilf und schnellen dann blitzartig vor. Ihr Maul ist voller nach hinten gebogener Zähne.'),
  (g,m)=>{const f=fishT(g,m,{id:'federkielhecht',H:.16,L:1,W:.55,back:'#4E6E5E',belly:'#E8EAD8',tail:'fork',dorsal:'tri',dz:.8,pat:(x,w,h,r)=>FT.spots(x,w,h,'#E8E0A0',20,3,5,r)});P(g,G.co(.05,.3),m.c('#2E3468',{gloss:1}),[0,0,f.nz+.1],[PI/2,0,0])});
F('papierbootfisch',fishMeta('Papierboot-Fisch','bibliothek','teich','S','tag',1,150,'Ich hab einen Papierboot-Fisch gefangen! Er ist aus einer alten Zeitung gefaltet. Ein bisschen nass.','Aus einem einzigen Blatt Papier lässt sich ohne Schere ein Boot falten. Die Kunst des Papierfaltens heisst Origami.'),
  (g,m)=>{const pm=m.c(PAPER,{rim:.6});P(g,G.co(.26,.26,4),pm,[0,.08,0],[PI,PI/4,0],[1.6,.6,.6]);P(g,G.co(.18,.34,4),pm,[0,.24,0],[0,PI/4,0],[.4,1,1.4]);eye(g,m,[.08,.1,.3],.04,[.6,.2,.6]);eye(g,m,[-.08,.1,.3],.04,[-.6,.2,.6])});
F('klecksqualle',fishMeta('Klecks-Qualle','bibliothek','teich','S','nacht',2,480,'Ich hab eine Klecks-Qualle gefangen! Sie sieht aus wie ein Tintenfleck, der tanzen gelernt hat.','Quallen bestehen zu 98 Prozent aus Wasser. Sie haben weder Gehirn noch Herz, aber ein Nervennetz im ganzen Körper.'),
  (g,m)=>{P(g,G.hs(.24),m.c('#3E4E8E',{opacity:.85,rim:1,rimColor:'#8ea8ff'}),[0,0,0]);range(5,(t,i)=>{const a=i/5*TAU;P(g,G.tu([[Math.cos(a)*.14,0,Math.sin(a)*.14],[Math.cos(a)*.18,-.2,Math.sin(a)*.18],[Math.cos(a)*.1,-.36,Math.sin(a)*.1]],.02,.008),m.c('#5E6EA8'))});markGlow(g,P(g,G.s(.07),m.glow('#8EA8FF',1.6),[0,.08,0]))});

/* ================= Insekten ================= */
B('buecherwurm',bugMeta('Bücherwurm','bibliothek','baum','immer',1,160,'Ich hab einen Bücherwurm gefangen! Er trägt eine Brille und ist gerade bei Kapitel sieben.','Echte „Bücherwürmer“ sind meist Käferlarven, die sich durch Papier und Leim fressen. Heute nennen wir so auch Menschen, die ständig lesen.'),
  (g,m)=>{const wm=m.c('#A8D08A',{rim:.6});for(let i=0;i<5;i++)P(g,G.s(.1-i*.008),wm,[0,.1,.24-i*.12]);P(g,G.s(.12),wm,[0,.14,.34]);bugFace(g,m,[0,.16,.44],.1,.5);for(const s of[-1,1])P(g,G.to(.045,.008),m.c('#8A5A40'),[s*.05,.2,.46]);P(g,G.cy(.006,.006,.03),m.c('#8A5A40'),[0,.2,.46],[0,0,PI/2])});
B('silberfischchen',bugMeta('Silberfischchen','bibliothek','boden','nacht',1,90,'Ich hab ein Silberfischchen gefangen! Es glänzt wie ein Löffel.','Silberfischchen gibt es seit über 400 Millionen Jahren. Sie mögen Feuchtigkeit und knabbern gern an Tapetenkleister und Buchrücken.'),
  (g,m)=>{const sm=m.c('#C8D0DC',{gloss:1.3,rim:.7});P(g,G.s(.18),sm,[0,.06,0],null,[.7,.3,1.6]);bugFace(g,m,[0,.08,.28],.07,.5);for(let i=0;i<3;i++)P(g,G.cy(.006,.004,.3),sm,[(i-1)*.04,.06,-.4],[PI/2-.2,0,(i-1)*.3]);feelers(g,sm,sm,[.03,.1,.3],.4,.2,.4)});
B('papierkranich_falter',bugMeta('Kranichfalter','bibliothek','luft','tag',2,520,'Ich hab einen Kranichfalter gefangen! Er ist aus einer Seite Märchen gefaltet.','In Japan sagt man: Wer tausend Papierkraniche faltet, dem wird ein Wunsch erfüllt. Kraniche gelten dort als Glücksbringer.'),
  (g,m)=>{const pm=m.c(PAPER,{rim:.8});P(g,G.co(.06,.4,4),pm,[0,.3,0],[PI/2,PI/4,0]);both(s=>P(g,G.co(.22,.02,3),pm,[s*.18,.34,0],[0,0,s*PI/2],[1,1,2.2]));P(g,G.co(.03,.22,4),pm,[0,.42,.22],[-.8,PI/4,0]);P(g,G.co(.03,.22,4),pm,[0,.4,-.22],[.9,PI/4,0])});
B('tintenkleckskaefer',bugMeta('Tintenklecks-Käfer','bibliothek','boden','tag',2,380,'Ich hab einen Tintenklecks-Käfer gefangen! Er hinterlässt überall kleine Punkte.','Manche Käfer spritzen bei Gefahr übelriechende Flüssigkeit. Der Bombardierkäfer schiesst sie sogar knallend und kochend heiss heraus.'),
  (g,m)=>{P(g,G.hs(.22),m.c(INK,{gloss:1.2}),[0,.08,0],null,[1,.9,1.2]);range(4,(t,i)=>P(g,G.s(.04),m.c('#8EA8FF'),[Math.cos(i*1.6)*.12,.24,Math.sin(i*1.6)*.14]));bugFace(g,m,[0,.12,.26],.08,.5);legs(g,m.c(INK),[[.1,.15,.1],[0,.17,0],[-.1,.15,-.1]],.25)});
B('lesezeichenfalter',bugMeta('Lesezeichen-Falter','bibliothek','blume','tag',3,1100,'Ich hab einen Lesezeichen-Falter gefangen! Er landet immer genau auf der Seite, wo man aufgehört hat.','Viele Falter haben Augenflecken auf den Flügeln. Sie erschrecken Vögel, weil sie wie die Augen eines grösseren Tieres aussehen.'),
  (g,m)=>butterfly(g,m,'lesezeichenfalter','#C8566E','#E8C87A','#2E3468'));

/* ================= Fundstücke ================= */
REL('alte_landkarte',relMeta('Alte Landkarte','bibliothek','kunst',2,1000,'Eine alte Landkarte! Die Küsten sind falsch, aber die Seeungeheuer sind wunderschön gemalt.','Auf alten Karten füllten Zeichner unbekannte Gebiete mit Seeungeheuern und Fabelwesen. Die ersten genauen Weltkarten entstanden erst im 16. Jahrhundert.'),
  (g,m)=>{const q=grp(g,[0,.05,0],[-PI/2+.08,0,0]);P(q,G.bx(.9,.64,.01,0),m.c('#E8D4A8'),[0,0,0]);P(q,G.bx(.3,.2,.012,.05),m.c('#8EB8A0'),[-.15,.05,.005]);P(q,G.bx(.2,.25,.012,.05),m.c('#8EB8A0'),[.2,-.1,.005]);both(s=>P(q,G.cy(.04,.04,.7),m.c('#8A5E42'),[s*.45,0,.02],[PI/2,0,0]))});
REL('wachssiegel',relMeta('Rotes Wachssiegel','bibliothek','schatz',1,420,'Ein Wachssiegel! Das Wappen zeigt eine Eule mit Brille.','Mit Siegeln wurden Briefe verschlossen und beglaubigt. Wer das Siegel brach, konnte das nicht verbergen.'),
  (g,m)=>{P(g,G.cy(.3,.32,.1,Q(10)),m.c('#C83A3A',{gloss:.9}),[0,.05,0]);P(g,G.cy(.2,.2,.02),m.c('#A82A2A'),[0,.11,0]);P(g,G.s(.07),m.c('#A82A2A'),[0,.12,.02],null,[1,.3,1])});
REL('goldene_feder',relMeta('Goldene Schreibfeder','bibliothek','schatz',3,1900,'Die goldene Schreibfeder des ersten Bibliothekars! Sie schreibt angeblich nur wahre Geschichten.','Vor dem Füller schrieb man mit Gänsefedern, die man mit einem kleinen Messer spitzte – dem Federmesser. Daher kommt der Name „Taschenmesser“ für kleine Klappmesser.'),
  (g,m)=>{const gm=m.c('#E8C87A',{gloss:1.4,rim:.7});const q=grp(g,[0,.1,0],[0,0,1.2]);P(q,G.cy(.02,.03,1),gm,[0,0,0]);both(s=>P(q,flatLeaf(leafShape(.8,.18),.012,.1),gm,[s*.01,.15,0],[0,s*PI/2,0]));P(q,G.co(.03,.12),m.c('#2E3468'),[0,-.55,0],[PI,0,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  brilleneule:{n:'Brilleneule',planet:ID,biomes:['buecherwald','lesegarten','staubarchiv'],fly:true,count:3,size:.8,speed:.8,night:true,voice:['huhu','schuhu','hm-hm'],pitch:260,likes:['papierseite','lesezeichen'],product:'papierseite',names:['Professor Huhu','Minerva','Seite 42','Fussnote','Brilli'],
    fact:'Eulen können ihren Kopf um 270 Grad drehen. Ihre Augen sind so gross, dass sie sich in den Augenhöhlen nicht bewegen lassen.',a:{col:'#B8946E',belly:'#F2E6CC',body:[.3,.34,.3],head:{r:.28,p:[0,.66,.12],sc:[1.1,.95,1]},snout:{type:'beak',col:'#E8A04A',len:.35},eyes:{r:.13,x:.4,y:.12},ears:{type:'pointy',len:.3,col:'#8A6A4E'},legs:{n:2,len:.08,r:.04,col:'#E8A04A'},tail:{type:'fan',col:'#8A6A4E'},wings:{col:'#8A6A4E'},brows:'#6E4A30',spots:{col:'#8A6A4E',n:6,s:.7}}},
  leseratte:{n:'Leseratte',planet:ID,biomes:['staubarchiv','buecherwald','papierwiese'],count:4,size:.6,speed:1.2,voice:['piep','quiek','hm?'],pitch:560,likes:['papierseite','kaese'],product:'papierseite',names:['Ratzi','Kapitelchen','Doktor Nager','Eselsohr','Lina Lese'],
    fact:'Ratten sind sehr schlau und können Labyrinthe lernen. Sie lachen sogar, wenn man sie kitzelt – nur so hoch, dass wir es nicht hören.',a:{col:'#A8A0B0',belly:'#E8E4F0',body:[.28,.24,.4],head:{r:.22,p:[0,.42,.38]},snout:{type:'long',col:'#FFC8D8',nose:'#FF8FA3'},ears:{type:'round',x:.55,y:.62,inner:'#FFC8D8'},legs:{n:4,len:.08,r:.05,col:'#FFC8D8',foot:'#FFC8D8'},tail:{type:'long',col:'#FFC8D8',len:1.2,curl:.3,r:.03},scarf:'#C8566E'}},
  bibliothekskatze:{n:'Bibliothekskatze',planet:ID,biomes:['lesegarten','papierwiese','buecherwald'],count:3,size:.8,speed:.9,voice:['miau','mrrp','prrr'],pitch:380,likes:['tintenfisch','buchstabenfisch'],product:'lesezeichen',names:['Tinte','Kleister','Mauzi Müller','Prosa','Einband'],
    fact:'In vielen alten Bibliotheken lebten Katzen, damit Mäuse die Bücher nicht anknabberten. Manche wurden richtig berühmt und hatten eigene Bibliotheksausweise.',a:{col:'#2E3468',belly:'#FFFFFF',body:[.3,.28,.46],head:{r:.25,p:[0,.58,.42]},snout:{type:'muzzle',col:'#FFFFFF',nose:'#FF8FA3'},ears:{type:'pointy',len:.45,inner:'#FFC8D8'},legs:{n:4,len:.18,r:.06,foot:'#FFFFFF'},tail:{type:'long',len:1,curl:.8}}},
  tintenrobbe:{n:'Tintenrobbe',planet:ID,biomes:['tintenufer'],nearWater:true,count:3,size:1.3,speed:.5,voice:['ört','uff','örk-örk'],pitch:200,likes:['tintenfisch','federkielhecht'],product:'tintentropfen',names:['Klecks','Füller','Robbi','Tusche','Seehund Siegfried'],
    fact:'Robben können ihre Nasenlöcher unter Wasser fest verschliessen. Ihre Schnurrhaare spüren sogar die Wasserwirbel, die ein Fisch beim Schwimmen hinterlässt.',a:{col:'#3E4E8E',belly:'#8EA8D8',body:[.36,.3,.6],head:{r:.26,p:[0,.5,.56]},snout:{type:'muzzle',col:'#8EA8D8',nose:'#1E2448'},ears:{type:'none'},legs:{n:0},flippers:{s:1,back:true},tail:{type:'none'},spots:{col:'#1E2448',n:6}}},
  buchfink:{n:'Buchfink',planet:ID,biomes:['lesegarten','buecherwald','papierwiese'],fly:true,count:4,herd:true,size:.4,speed:1.3,voice:['pink','fink-fink','tschilp'],pitch:640,likes:['beeren','papierseite'],product:'feder',names:['Fink','Kapitel','Pinki','Zwitscher','Blättchen'],
    fact:'Buchfinken singen in verschiedenen Gegenden unterschiedliche Dialekte. Junge Finken lernen ihr Lied, indem sie ältere Vögel nachahmen.',a:{col:'#8E8AB0',belly:'#E8A08A',body:[.24,.24,.32],head:{r:.19,col:'#6E8EB0',p:[0,.5,.26]},snout:{type:'beak',col:'#C8B8A0',len:.45},ears:{type:'none'},legs:{n:2,len:.1,r:.025,col:'#C89A7A'},tail:{type:'fan',col:'#5E5A7A'},wings:{col:'#5E5A7A'}}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','doktorhut','Doktorhut',720,'#2E3468',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.cy(r*.6,r*.66,r*.3),M.c(col),[0,r*.1,0]);P(q,G.bx(r*1.6,r*.06,r*1.6,r*.02),M.c(col),[0,r*.28,0],[0,PI/4,0]);P(q,G.s(r*.08),M.c('#E8C87A'),[0,r*.33,0]);P(q,G.tu([[0,r*.33,0],[r*.6,r*.3,r*.2],[r*.7,-r*.2,r*.25]],r*.02),M.c('#E8C87A'));P(q,G.s(r*.08),M.c('#E8C87A'),[r*.7,-r*.25,r*.25],null,[1,1.5,1])});
def('face','lesebrille','Lesebrille',380,'#C8566E',(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.1,z=H.front+r*.04;for(const s of[-1,1]){P(g,G.to(r*.18,r*.03),M.c(col),[s*r*.28,y,z],null,[1.2,.8,1]);P(g,G.circ(r*.17),M.c('#DDF4FF',{opacity:.3}),[s*r*.28,y,z+.001],null,[1.2,.8,1])}P(g,G.cy(r*.02,r*.02,r*.16),M.c(col),[0,y+r*.03,z],[0,0,PI/2])});
def('neck','buecherschal','Bücher-Schal',540,'#8E6BD1',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);P(g,G.to(r*.7,r*.16),M.c(col,{rim:.5}),[0,y,0],[PI/2,0,0]);for(let i=0;i<5;i++)P(g,G.bx(r*.34,r*.1,r*.12,r*.02),M.c(COVERS[i]),[r*.35,y-r*(.25+i*.14),r*.55],[0,.3,0])});

/* ================= Bau-Familie: Bücherhäuser ================= */
function buchhaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.45:1;const style=plan.style||A.pick(r,['stapel','regal','turm']);const body=new THREE.Group();g.add(body);const M=makeMats({skin:'haut',color:0});
  const W=(2.2+r()*.4)*big,D=(1.8+r()*.3)*big;let top=0,doorZ=-D/2-.02,Hw=0;
  if(style==='stapel'){let y=0;for(let i=0;i<4;i++){const h=(.5+r()*.2)*big;book(body,M,W*(1-i*.05),h,D*(1-i*.04),COVERS[Math.floor(r()*8)],[0,y+h/2,0],[0,(r()-.5)*.12,0]);y+=h}Hw=y;
    /* Dach: aufgeschlagenes Buch */const q=grp(body,[0,y,0]);const cc=COVERS[Math.floor(r()*8)];for(const s of[-1,1]){const p=grp(q,[0,0,0],[0,0,-s*.5]);P(p,G.bx(W*.62,.08,D*1.1,.03),M.c(cc),[s*W*.3,0,0]);P(p,G.bx(W*.58,.06,D*1.02,.01),M.c(PAPER),[s*W*.29,.06,0])}top=y+W*.3+.3;doorZ=-D/2-.02}
  else if(style==='regal'){Hw=2.2*big;P(body,G.bx(W,Hw,D,.08),M.c('#A0704C'),[0,Hw/2,0]);for(let k=0;k<3;k++){const y=.4+k*.62*big;P(body,G.bx(W*.96,.06,D*.3,.02),M.c('#8A5E42'),[0,y-.05,-D/2+.1]);let x=-W*.44;while(x<W*.44){const w=.1+r()*.08,h=(.34+r()*.18)*big;if(Math.abs(x)>.5||k>1)P(body,G.bx(w,h,.28,.01),M.c(COVERS[Math.floor(r()*8)]),[x+w/2,y+h/2,-D/2+.08]);x+=w+.01}}
    P(body,G.bx(W+.3,.2,D+.3,.06),M.c('#8A5E42'),[0,Hw+.1,0]);P(body,G.co(Math.max(W,D)*.8,1,4,1),M.c(A.pick(r,['#C8566E','#3E6EA8','#4E8A5E'])),[0,Hw+.7,0],[0,PI/4,0]);top=Hw+1.3}
  else{const R=1.2*big;Hw=2.8*big;P(body,G.cy(R,R*1.05,Hw,Q(20)),M.c(A.pick(r,['#F2EAD4','#E8DCC4'])),[0,Hw/2,0]);for(let i=0;i<5;i++)P(body,G.to(R*1.01,.05),M.c('#8A5E42'),[0,.3+i*Hw*.2,0],[PI/2,0,0]);
    /* Dach: Schriftrolle */P(body,G.cy(R*.5,R*.5,R*2.4,Q(16)),M.c(PAPER2),[0,Hw+R*.45,0],[0,0,PI/2]);both(s=>P(body,G.cy(R*.18,R*.18,.3),M.c('#8A5E42'),[s*R*1.3,Hw+R*.45,0],[0,0,PI/2]));P(body,G.to(R*.51,.05),M.c('#C8566E'),[0,Hw+R*.45,0],[0,PI/2,0]);top=Hw+R;doorZ=-R*1.02}
  const dr=A.archDoor(A.pick(r,['#8A5E42','#C8566E','#3E6EA8']),'#5E3E2E');dr.position.set(0,0,doorZ);dr.rotation.y=PI;body.add(dr);
  for(const sx of[-1,1]){const w=A.roundWindow('#8A5E42',.2,false);w.position.set(sx*(style==='turm'?.7:W*.3),Math.min(1.5,Hw*.55),doorZ-.02);w.rotation.y=PI;body.add(w)}
  /* Leselampe am Eingang */P(body,G.cy(.03,.03,1.6),M.c('#2E3A3E'),[W*.42,.8,doorZ-.3]);P(body,G.co(.16,.16,10,1,true),M.c('#4E8A5E',{gloss:.8}),[W*.42,1.6,doorZ-.3]);P(body,G.s(.07),M.glow('#FFE3A0',2),[W*.42,1.55,doorZ-.3]);
  addOutlines(body);const Rr=style==='turm'?1.2*big:Math.max(W,D)/2;return{g,R:Rr+.8,top,door:[0,doorZ],walls:[new THREE.Box3(new V(-Rr,0,-Rr),new V(Rr,top,Rr))],style:'buchhaus-'+style}}

/* ================= Möbel ================= */
furn('lesesessel',{n:'Ohrensessel',cat:'sitz',price:1300,planet:ID,size:[1,1],h:1.2,b:(g,m)=>{const cm=m.c('#4E8A5E',{rim:.4});P(g,G.bx(.8,.3,.7,.1),cm,[0,.35,0]);P(g,G.bx(.8,.8,.2,.1),cm,[0,.75,-.28]);both(s=>{P(g,G.bx(.16,.35,.7,.06),cm,[s*.4,.55,0]);P(g,G.bx(.2,.3,.2,.08),cm,[s*.36,1.05,-.25])});for(const[x,z]of[[-.32,-.28],[.32,-.28],[-.32,.28],[.32,.28]])P(g,G.cy(.03,.02,.2),m.c('#5E3E2E'),[x,.1,z])}});
furn('buecherregal_hoch',{n:'Hohes Bücherregal',cat:'lager',price:1600,planet:ID,size:[2,1],h:2,b:(g,m)=>{const wm=m.c('#8A5E42');P(g,G.bx(1.8,2,.4,.04),wm,[0,1,-.02]);for(let k=0;k<4;k++){P(g,G.bx(1.7,.04,.36,.01),m.c('#A0704C'),[0,.1+k*.48,.02]);let x=-.8;const r=srand(k*9+3);while(x<.75){const w=.07+r()*.06,h=.3+r()*.12;P(g,G.bx(w,h,.26,.01),m.c(COVERS[Math.floor(r()*8)]),[x+w/2,.12+k*.48+h/2,.04]);x+=w+.01}}}});
furn('globus',{n:'Alter Globus',cat:'deko',price:980,planet:ID,size:[1,1],h:1.1,b:(g,m)=>{P(g,G.cy(.2,.26,.06),m.c('#8A5E42'),[0,.03,0]);P(g,G.cy(.03,.03,.5),m.c('#8A5E42'),[0,.3,0]);P(g,G.s(.3),m.c('#8EB8C8',{gloss:.6}),[0,.82,0]);range(4,(t,i)=>P(g,G.s(.12),m.c('#C8B888'),[Math.cos(i*1.6)*.24,.82+Math.sin(i)*.12,Math.sin(i*1.6)*.24],null,[1,.6,.4]));P(g,G.to(.34,.015,PI),m.c('#E8C87A',{gloss:1}),[0,.82,0],[0,0,.4])}});
furn('lesepult',{n:'Lesepult',cat:'tisch',price:880,planet:ID,size:[1,1],h:1.2,b:(g,m)=>{const wm=m.c('#A0704C');P(g,G.cy(.05,.06,1),wm,[0,.5,0]);P(g,G.cy(.25,.3,.05),wm,[0,.03,0]);const q=grp(g,[0,1.05,0],[-.5,0,0]);P(q,G.bx(.6,.04,.44,.02),wm,[0,0,0]);book(q,m,.5,.06,.36,'#C8566E',[0,.05,0],[0,0,0])}});

/* ================= Sprache: Tinten-Zeichen ================= */
function inkGlyph(x,s,r){const k=Math.floor(r()*4);x.beginPath();if(k===0){x.moveTo(-s*.3,s*.3);x.bezierCurveTo(-s*.3,-s*.4,s*.3,-s*.4,s*.1,s*.1);x.lineTo(s*.3,s*.35)}
  else if(k===1){x.arc(0,-s*.1,s*.2,0,TAU);x.moveTo(0,s*.1);x.lineTo(0,s*.38);x.moveTo(-s*.15,s*.26);x.lineTo(s*.15,s*.26)}
  else if(k===2){x.moveTo(-s*.3,-s*.3);x.lineTo(s*.3,-s*.3);x.lineTo(-s*.3,s*.3);x.lineTo(s*.3,s*.3)}
  else{x.moveTo(-s*.25,s*.35);x.lineTo(0,-s*.35);x.lineTo(s*.25,s*.35);x.moveTo(-s*.15,s*.1);x.quadraticCurveTo(0,s*.2,s*.15,s*.1)}x.stroke()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Bibliotheks-Planet',base:'kompost',R:130,R0:44,sea:-.35,music:'museum',sky:['#F4D8B0','#FFF6E4'],fog:'#F6ECD8',water:'#3E4E8E',deep:'#1E2448',step:1.15,shop:ID,
    desc:'Bücherbäume, Tintenseen und Leselampen an jedem Weg. Sammle die verlorenen Seiten und bring die Geschichten zum grossen Lesepult.',weather:'blueten',orbit:[145,5.1],size:1,col:['#E8DEC4','#3E4E8E'],moons:1,
    park:'lesegarten',parkPond:true,phone:['#F2E6CC','#C8D0F0'],stones:['kiesel','tintentropfen','stein_klein'],plazaTree:'buecherbaum',path:'#E8DCC4',
    space:{deep:'#1E2448',water:'#3E4E8E',shore:'#E8D8B0',land:'#E8DEC4',land2:'#C8D8A8',high:'#C8566E',cap:'#FFF6E4',atmo:'#FFE8C8',cloud:.4,sea:.38,capA:.5,freq:2.6},
    mac:{oc:-.15,m:.3,isl:.9},climate:{hot:'staubarchiv',wet:'tintenufer',cold:'schriftrollenhuegel'},peak:'schriftrollenhuegel',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.2,4)*2.1+.8;/* Seitenrücken: sanfte parallele Falten wie gebogenes Papier */h+=Math.sin(q.x*.9+N(q.x*.3,q.y*.3,q.z*.3)*3)*.5;return h},
    biome({T,M,h,sea,low,nearPond,p}){if(nearPond||(low&&h<sea+.6))return'tintenufer';if(h>sea+4.2)return'schriftrollenhuegel';if(T>.3&&M<0)return'staubarchiv';if(M>.2)return'buecherwald';if(T>.05)return'lesegarten';return'papierwiese'},
    onLoad:W=>BIBLIOTHEK.onLoad(W),tick:(dt,t,W,me)=>BIBLIOTHEK.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Lesepult-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Tintenfass-Weiher',lat:46,lon:120,r:.1,pond:true},{id:'teich2',n:'Kleckssee',lat:36,lon:230,r:.12,pond:true},{id:'see',n:'Grosses Tintenmeer',lat:0,lon:180,r:.16,pond:true}],
  biomes:BI,
  names:{casino:'Würfel-Salon',mode:'Einband-Schneiderei',praxis:'Lese-Heilstube',museum:'Handschriften-Museum',shop:'Antiquariat',studio:'Illustrations-Atelier',bar:'Fussnoten-Café',rathaus:'Grosse Bibliothek',garage:'Buchbinderei',pflanzen:'Papierblumen-Laden',tiere:'Leseratten-Heim'},
  sty:{wall:'putz',walls:['#F2EAD4','#E8DCC4','#FFF6E4','#E8E0D0'],roof:'gable',roofs:['#C8566E','#3E6EA8','#4E8A5E','#8E6BD1'],trim:'#8A5E42',plinth:'#C8B8A0',door:'#8A5E42',win:'rund',pitch:1},
  wall:'holzpaneel',floor:'parkett',
  mayor:['Oberbibliothekar Uhu',{skin:'fell',color:2,shape:'birne'},{kopf:'eule',augen:'monokel',arme:'fluegel',beine:'huhn',extras:['laterne']}],
  lore:['Jedes Buch hier hat einmal eine Geschichte erzählt. Manche haben ihre Seiten verloren – der Wind trägt sie über den ganzen Planeten.','Bring mir ein vollständiges Buch ans grosse Lesepult, und ich lese es dir vor. Versprochen.','Nachts schweben die Buchstaben aus den Büchern und tanzen um die Lampen. Ganz leise, damit niemand aufwacht.'],
  caveRock:['#E8DCC4','#C8B8A0','#8A7A68',['#FFE8C8','#F6ECD8','#E8E0FF']],
  wear:['doktorhut','lesebrille','buecherschal','brille','monokel','halstuch'],clothes:CL,
  haus:{theme:{roof:['#C8566E','#3E6EA8','#4E8A5E'],wall:['#F2EAD4','#E8DCC4'],wood:['#8A5E42','#A0704C'],stone:['#C8B8A0','#E8DCC4'],trim:['#8A5E42'],plant:['#A8C890','#8FB87A']},
    props:[['nature','pot_large',1.2,'d',0],['town','lantern',1,'d',0],['nature','plant_bushSmall',1.4,'c'],['nature','statue_columnDamaged',1,'c',0]],
    garden:{path:'path_stone',flowers:['flower_purpleB','flower_redB'],veg:['crop_turnip']},
    plan:[{fam:'buchhaus',style:'stapel'},{fam:'buchhaus',style:'regal'},{fam:'buchhaus',style:'turm'},{fam:'buchhaus'}],fams:{buchhaus}},
  residents:{skins:['fell','pluesch','haut','holz','marmor'],heads:['eule','katze','mensch','statue','gehirnglas','schnecke','hirsch','widder','globus','uhr'],names:['Seitenreich','Prosa','Kapitelius','Fibel','Lexi','Glosse','Ex Libris','Margarete Marginal','Vers','Duden','Tilde','Kursivia'],
    house:{shapes:['rund','haus'],walls:['putz','holz'],wallCols:['#F2EAD4','#E8DCC4'],roofCols:['#C8566E','#3E6EA8'],win:['rund']},deco:['papierblume','buecherstapel','leselampe'],fence:true},
  lang:{n:'Tintenschrift',ink:INK,glow:'#8EA8FF',kind:'ink',draw:inkGlyph,syl:['ex','li','bri','ver','sa','ta','no','lu','ra','qui','de','um']},ruinStone:'#E8DCC4',
  terraform:['papierwiese','lesegarten','buecherwald','tintenufer'],
  weather:[['klar',2],['heiter',3],['regen',2],['nebel',3]]});

/* ================= Planeten-Besonderheiten ================= */
const BIBLIOTHEK=(()=>{let W_=null,pages=[],desk=null,letters=[];const M=()=>makeMats({skin:'haut',color:0});
  const BOOKS=[
    {id:'mond',n:'Der Mond, der nicht schlafen wollte',col:'#3E6EA8',story:['Es war einmal ein Mond, der jede Nacht wach bleiben musste.','Er beneidete die Sonne, die abends einfach unterging und träumte.','Da sangen ihm die Sterne ein Schlaflied. Und seitdem schläft der Mond tagsüber – ganz dünn, fast unsichtbar.']},
    {id:'schnecke',n:'Die schnellste Schnecke der Welt',col:'#4E8A5E',story:['Gerti war eine Schnecke, die unbedingt gewinnen wollte.','Beim grossen Rennen schliefen alle anderen ein, weil es so lange dauerte.','Gerti kam als Erste an. Und als Einzige. Das zählt trotzdem.']},
    {id:'wolke',n:'Wolke Wanda sucht ein Zuhause',col:'#8E6BD1',story:['Wolke Wanda zog von Planet zu Planet und fand keinen Platz.','Überall war es ihr zu heiss, zu kalt oder zu windig.','Bis sie über einem Garten stehen blieb, der Wasser brauchte. Dort regnet sie jetzt jeden Dienstag.']},
    {id:'roboter',n:'Der Roboter, der Blumen goss',col:'#E8A04A',story:['Ein alter Roboter war für nichts mehr gut, sagten alle.','Er fand eine Giesskanne und eine vertrocknete Blume.','Heute ist er der Gärtner des schönsten Parks im ganzen System. Niemand sagt mehr etwas.']},
    {id:'drache',n:'Der kleine Drache und das Streichholz',col:'#C8566E',story:['Ein kleiner Drache konnte kein Feuer spucken, nur Seifenblasen.','Die anderen Drachen lachten. Er übte und übte – nur Blasen.','Als ein Waldbrand drohte, löschten seine Blasen die Funken. Seitdem lacht niemand mehr. Alle wollen Blasen.']},
    {id:'bibliothekar',n:'Wie der Bibliothekar zu seiner Brille kam',col:'#2E6E6E',story:['Der erste Bibliothekar konnte die kleinen Buchstaben nicht lesen.','Er schliff zwei Tautropfen, bis sie ganz rund und glatt waren.','So entstand die erste Brille. Die Tautropfen sind heute noch drin – sagt er.']}];
  const S=()=>SAVE.bibliothek=SAVE.bibliothek||{got:{},read:[]};
  function pageModel(m,col){const g=new THREE.Group();const q=grp(g,[0,.7,0]);P(q,G.bx(.5,.64,.02,.01),m.c(PAPER,{rim:.8}),[0,0,0]);P(q,G.bx(.5,.08,.025,0),m.c(col),[0,.28,0]);for(let i=0;i<5;i++)P(q,G.bx(.36,.02,.026,0),m.c('#A8A098'),[0,.15-i*.08,0]).userData.noOutline=true;
    const glow=P(q,G.s(.16),m.glow('#FFE3A0',1.4),[0,0,-.05]);addOutlines(g);g.userData.q=q;g.userData.glow=glow;return g}
  function onLoad(W){W_=W;pages=[];letters=[];const m=M();const st=S();const r=srand(3131);
    /* 18 Seiten: je Buch drei, weit verteilt */BOOKS.forEach((b,bi)=>{st.got[b.id]=st.got[b.id]||[];for(let k=0;k<3;k++){if(st.got[b.id].includes(k))continue;let d=null;for(let t=0;t<200&&!d;t++){const c=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(c.y>.92||!GAME.isLand(c))continue;if(pages.some(p=>angle(p.d,c)*W.R<18))continue;d=c}
      if(!d)continue;const g=pageModel(m,b.col);GAME.placeObj(g,d,r()*6,0);const Pg={b,k,d,g};pages.push(Pg);W.inter.push({kind:'seite',p:d,r:1.4,label:'Verlorene Seite aufheben ('+b.n+')',act:()=>takePage(Pg)})}});
    /* Grosses Lesepult nahe am Dorfplatz */const pl=W.places[0];const dd=PLANETKIT.freeSpot(W,pl.dir,10,40,2.5);const g=new THREE.Group();
    P(g,G.cy(.9,1,.3),m.c('#8A5E42'),[0,.15,0]);P(g,G.cy(.12,.16,1.4),m.c('#A0704C'),[0,1,0]);const q=grp(g,[0,1.8,0],[-.45,0,0]);P(q,G.bx(1.6,.08,1.1,.03),m.c('#A0704C'),[0,0,0]);book(q,m,1.3,.14,.9,'#C8566E',[0,.1,0],[0,0,0]);
    both(s=>{P(g,G.cy(.04,.04,1.8),m.c('#2E3A3E'),[s*1.2,.9,0]);P(g,G.s(.14),m.glow('#FFE3A0',2),[s*1.2,1.85,0])});addOutlines(g);GAME.placeObj(g,dd,0,0);GAME.addObst(dd,1);desk={d:dd,g};
    W.inter.push({kind:'lesepult',p:dd,r:2.2,label:'Am grossen Lesepult vorlesen lassen',act:readDesk});
    /* nachts: leuchtende Buchstaben um den Platz */const ABC='ABCDEFGHIJKLMNOPRSTUVWZ';for(let i=0;i<26;i++){const ch=ABC[i%ABC.length];const tx=ctex('glyph-'+ch,64,64,(x,w,h)=>{x.fillStyle='#FFE8B0';x.font='bold 48px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#FFD070';x.shadowBlur=12;x.fillText(ch,w/2,h/2)});
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(.7);W.scene.add(sp);letters.push({sp,a:r()*TAU,rr:4+r()*9,h:1.5+r()*3,sp2:.1+r()*.2,ph:r()*9})}}
  function takePage(Pg){const st=S();const arr=st.got[Pg.b.id];if(arr.includes(Pg.k))return;arr.push(Pg.k);persist();Pg.g.parent&&Pg.g.parent.remove(Pg.g);pages=pages.filter(x=>x!==Pg);W_.inter=W_.inter.filter(i=>!(i.kind==='seite'&&i.p===Pg.d));
    SND.play('page');GAME.W.fx(Pg.d,'stern',8);const n=arr.length;UI.toast('Seite '+n+' von 3 aus „'+Pg.b.n+'“'+(n===3?' – das Buch ist vollständig! Bring es zum Lesepult.':'.'),3200)}
  async function readDesk(){const st=S();const ready=BOOKS.filter(b=>(st.got[b.id]||[]).length>=3&&!st.read.includes(b.id));const readN=st.read.length;
    if(!ready.length){const left=BOOKS.filter(b=>!st.read.includes(b.id)).map(b=>b.n+' ('+(st.got[b.id]||[]).length+'/3)');await UI.talk('Oberbibliothekar Uhu',[readN?'Du hast mir schon '+readN+' Geschichten gebracht. Wunderbar!':'Willkommen am grossen Lesepult!',left.length?'Mir fehlen noch Seiten von: '+left.slice(0,3).join(', ')+(left.length>3?' …':''):'Du hast alle Geschichten gefunden. Die Bibliothek ist wieder vollständig!']);return}
    const b=ready[0];const ch=await UI.talk('Oberbibliothekar Uhu',['Oh! „'+b.n+'“ ist wieder vollständig. Soll ich vorlesen?'],{choices:['Ja, bitte vorlesen','Später']});if(ch!==0)return;
    SND.music('museum');await UI.talk('„'+b.n+'“',b.story);st.read.push(b.id);persist();SND.jingle('j_museum');
    const gifts=['lesesessel','globus','lesepult','buecherregal_hoch','pusteblumen_lampe','wolkensofa'];const gift=gifts[(st.read.length-1)%gifts.length];if(typeof bagAdd==='function'&&findFurn(gift))bagAdd('furn',gift);money(200+st.read.length*100);
    UI.toast('Geschenk vom Bibliothekar: '+(findFurn(gift)?findFurn(gift).n:'ein Buch')+' und '+(200+st.read.length*100)+' Taler.',3400);if(st.read.length===BOOKS.length){UI.toast('Alle sechs Geschichten! Du bist jetzt Ehrenmitglied der Grossen Bibliothek.',4000)}}
  function tick(dt,t,W,me){for(const p of pages){p.g.userData.q.position.y=.7+Math.sin(t*1.6+p.d.x*9)*.12;p.g.userData.q.rotation.y=Math.sin(t*.7+p.d.z*7)*.5;p.g.userData.glow.scale.setScalar(.8+Math.sin(t*3+p.d.y*9)*.25)}
    const h=GAMETIME.hour();const night=h<6||h>=19.5;const pl=W.places[0];if(letters.length&&pl){const up=pl.dir;const t1=GAME.tangentTo(up,new V(1,0,0)),t2=up.clone().cross(t1);
      for(const L of letters){L.sp.visible=night;if(!night)continue;const a=L.a+t*L.sp2;const d=up.clone().addScaledVector(t1,Math.cos(a)*L.rr/W.R).addScaledVector(t2,Math.sin(a)*L.rr/W.R).normalize();L.sp.position.copy(d.multiplyScalar(W.R+W.hAt(d)+L.h+Math.sin(t+L.ph)*.4));L.sp.material.opacity=.6+Math.sin(t*2+L.ph)*.3}}}
  return{onLoad,tick,BOOKS,pages:()=>pages}
})();
window.BIBLIOTHEK=BIBLIOTHEK;
})();
