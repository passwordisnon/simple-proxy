/* =====================================================================
   CYBORG-LABOR · planets/riesengarten.js · Riesengarten
   Du bist winzig: Grashalme wie Bäume, Kleeblätter als Sonnenschirme,
   verlorene Knöpfe, Fingerhüte und Garnrollen liegen herum wie Felsen.
   Besonderheiten:
   · Pusteblumen-Flug: oben am Riesen-Löwenzahn einen Schirmchen-Samen
     greifen und weit übers Land gleiten.
   · Morgentau: zwischen 5 und 10 Uhr glitzern Tautropfen auf den
     Blättern – jeder ist ein Sammelstück (und ein kleiner Spiegel).
   ===================================================================== */
(function(){
const ID='riesengarten';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,shade,flatLeaf,leafShape,flowerShape,eye,legs,feelers,bugFace,wingPair,markGlow,fishT,FT,stoneM,spiralShell,butterfly,fin2}=NH;
const V=THREE.Vector3;
const GRN='#7CC46A',GRN2='#5FAE55',STEM='#8FC86A';

/* ================= Natur: alles riesig ================= */
N('riesenhalm',{r:.35,h:6,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const n=3+Math.floor(rnd()*3);for(let i=0;i<n;i++){const a=rnd()*TAU,r=rnd()*.4,h=RR(rnd,4.5,7.5),lean=RR(rnd,.6,1.6);const col=[GRN,GRN2,'#9CD27A'][i%3];
  const bl=new THREE.Shape();bl.moveTo(-.22,0);bl.quadraticCurveTo(-.2,h*.6,0,h);bl.quadraticCurveTo(.2,h*.6,.22,0);bl.lineTo(-.22,0);
  const q=grp(g,[Math.cos(a)*r,0,Math.sin(a)*r],[0,a,0]);const mesh=P(q,G.puff(bl,.05,.02),m.c(col,{rim:.6,rimColor:'#f4ffc8'}),[0,0,0],[0,0,0]);mesh.rotation.x=0;
  /* Biegung: Vertices nach aussen schieben */const pa=mesh.geometry.attributes.position;for(let k=0;k<pa.count;k++){const y=pa.getY(k)/h;pa.setZ(k,pa.getZ(k)+y*y*lean)}pa.needsUpdate=true;mesh.geometry.computeVertexNormals();
  P(q,G.bx(.02,h*.8,.02,0),m.c(shade(col,.8)),[0,h*.4,.03+.3*lean*.16])}});
N('riesenklee',{r:.6,h:3.2,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3.4);P(g,G.tu([[0,0,0],[.15,h*.5,0],[0,h,0]],.09,.07),m.c(STEM));const lm=m.c('#6CBF5A',{rim:.5});
  const leaves=rnd()<.12?4:3;for(let i=0;i<leaves;i++){const a=i/leaves*TAU;const q=grp(g,[0,h,0],[0,a,-.15]);const sh=new THREE.Shape();sh.moveTo(0,0);sh.bezierCurveTo(-.9,.4,-.8,1.4,0,1.1);sh.bezierCurveTo(.8,1.4,.9,.4,0,0);
    P(q,G.puff(sh,.05,.02),lm,[0,0,0],[-PI/2+.15,0,0]);P(q,G.puff(new THREE.Shape([new THREE.Vector2(0,.3),new THREE.Vector2(-.3,.7),new THREE.Vector2(0,.8),new THREE.Vector2(.3,.7)]),.01,.005),m.c('#A8DC8A'),[0,.06,-.02],[-PI/2+.15,0,0])}
  if(leaves===4)markGlow(g,P(g,G.s(.08),m.glow('#FFE27A',1.3),[0,h+.2,0]))});
N('riesenpusteblume',{r:.4,h:7.5,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,6.5,8);P(g,G.tu([[0,0,0],[.25,h*.5,.1],[0,h,0]],.13,.1),m.c('#9CD27A',{rim:.5}));
  P(g,G.s(.4),m.c('#E8DCC0'),[0,h,0]);const pm=m.c('#FFFFFF',{rim:1,rimColor:'#ffffff'});for(let i=0;i<46;i++){const th=Math.acos(1-2*(i+.5)/46),ph=i*2.39996;const d=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));
    const s=P(g,G.cy(.012,.012,1.1),m.c('#F2EEE0'),[d.x*.55,h+d.y*.55,d.z*.55]);s.quaternion.setFromUnitVectors(new V(0,1,0),d);const t=P(g,G.s(.2),pm,[d.x*1.12,h+d.y*1.12,d.z*1.12],null,[1,.35,1]);t.quaternion.setFromUnitVectors(new V(0,1,0),d)}
  range(2,(t,i)=>P(g,flatLeaf(leafShape(2.4,.5),.03,.3),m.c(GRN2,{rim:.5}),[0,.05,0],[0,i*PI+.4,1.3]))});
N('riesentulpe',{r:.4,h:5.5,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,4.2,5.6);const col=o.color||['#FF6F91','#FFD35C','#FF9E6E','#C6A9FF','#FFFFFF'][Math.floor(rnd()*5)];P(g,G.tu([[0,0,0],[.2,h*.5,0],[0,h,0]],.1,.08),m.c(STEM));
  for(let i=0;i<5;i++){const a=i/5*TAU;const q=grp(g,[0,h,0],[0,a,0]);const sh=new THREE.Shape();sh.moveTo(-.4,0);sh.bezierCurveTo(-.7,.8,-.4,1.5,0,1.7);sh.bezierCurveTo(.4,1.5,.7,.8,.4,0);sh.lineTo(-.4,0);P(q,G.puff(sh,.04,.02),m.c(i%2?col:shade(col,.92),{rim:.6}),[0,0,.36],[-.15,0,0])}
  P(g,G.s(.3),m.c('#FFF1A8'),[0,h+.35,0]);range(2,(t,i)=>P(g,flatLeaf(leafShape(2.6,.5),.03,.3),m.c(GRN,{rim:.5}),[0,.1,0],[0,i*PI+rnd(),1.1]))});
N('riesenkuerbis',{r:1.6,h:2.6,size:'big',planet:ID},(g,m,o,rnd)=>{const col=rnd()<.3?'#FFE27A':'#FF9E4A';const pm=m.c(col,{rim:.4,gloss:.3});for(let i=0;i<8;i++){const a=i/8*TAU;P(g,G.s(1),pm,[Math.cos(a)*.6,1.1,Math.sin(a)*.6],[0,-a,0],[.75,1.1,1.1])}
  P(g,G.tu([[0,2.1,0],[.1,2.5,0],[.35,2.6,.1]],.12,.08),m.c('#6E8A4A'));P(g,G.tu([[.3,2.5,0],[.9,2.9,.3],[1.4,2.4,.6],[1.2,1.8,1]],.03,.02),m.c(STEM));P(g,flatLeaf(leafShape(1.3,.6),.03,.3),m.c(GRN2),[-1.1,.2,.8],[0,.8,1.3])});
N('fingerhut',{r:.9,h:1.6,size:'big',planet:ID},(g,m,o,rnd)=>{const mm=m.c('#D8D0E0',{gloss:1.2,rim:.6});P(g,G.la([[0,0],[.95,0],[.9,1.2],[.6,1.55],[0,1.62]],Q(24)),mm,[0,0,0],[PI,0,0]);g.children[0].position.y=1.62;
  for(let r=0;r<5;r++)for(let i=0;i<18;i++){const a=i/18*TAU+r*.17,y=.3+r*.24;const rr=.93-r*.06;const d=P(g,G.s(.05),m.c('#A8A0B8'),[Math.cos(a)*rr,y,Math.sin(a)*rr],null,[1,1,.4]);d.lookAt(0,y,0);d.userData.noOutline=true}
  P(g,G.to(.95,.06),m.c('#E8C87A',{gloss:1}),[0,.04,0],[PI/2,0,0])});
N('garnrolle',{r:.9,h:1.8,size:'big',planet:ID},(g,m,o,rnd)=>{const col=o.color||['#FF6F91','#56C6B6','#FFD35C','#8E6BD1'][Math.floor(rnd()*4)];const wm=m.c('#D8B888',{rim:.4});P(g,G.cy(.95,.95,.2),wm,[0,.1,0]);P(g,G.cy(.95,.95,.2),wm,[0,1.7,0]);
  const ym=m.c(col,{rim:.5});P(g,G.cy(.72,.72,1.4,Q(24)),ym,[0,.9,0]);for(let i=0;i<12;i++)P(g,G.to(.73,.025),m.c(shade(col,.85)),[0,.3+i*.11,0],[PI/2,0,0]);
  P(g,G.tu([[.7,1.2,.2],[1.2,.5,.8],[1.8,.03,1.1],[2.8,.03,.6]],.04,.04),ym)});
N('riesenknopf',{r:1,h:.4,size:'big',decal:false,planet:ID},(g,m,o,rnd)=>{const col=o.color||['#FF6F91','#56C6B6','#FFD35C','#C6A9FF','#FF9E6E'][Math.floor(rnd()*5)];const bm=m.c(col,{gloss:1,rim:.6});
  P(g,G.cy(1.1,1.1,.3,Q(28)),bm,[0,.18,.0],[.08,0,0]);P(g,G.to(.95,.07),m.c(shade(col,1.15)),[0,.34,0],[PI/2,0,0]);for(let i=0;i<4;i++)P(g,G.cy(.14,.14,.34),m.c(shade(col,.55)),[(i%2-.5)*.5,.2,(Math.floor(i/2)-.5)*.5])});
N('tautropfen_deko',{r:.25,h:.4,size:'tiny',planet:ID},(g,m,o,rnd)=>{P(g,G.s(.22),m.glass('#E8FAFF'),[0,.2,0],null,[1,.85,1]);P(g,G.s(.06),m.flat('#ffffff'),[.07,.3,.1]).userData.noOutline=true});
N('ameisenhuegel',{r:1.2,h:1.3,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(1.3,.12,2,rnd()*9),m.c('#C8A070',{rim:.3}),[0,.3,0],null,[1,.7,1]);range(20,(t,i)=>P(g,G.cy(.02,.02,.4),m.c('#E8D4A8'),[Math.cos(i*2.4)*t*1.1,.6+Math.sin(i)*.1,Math.sin(i*2.4)*t*1.1],[rnd(),0,rnd()]));P(g,G.cy(.18,.2,.1),m.c('#5A4030'),[0,1.05,0])});
Object.assign(NH.ROCK,{[ID]:['#C8BCA8','#A89C8A','#8FC86A']});

/* ================= Biome ================= */
const BI={
  rasenwald:{n:'Rasenwald',g:['#86C86A','#6CB458'],cliff:'#9A7A5A',pat:'gras',grass:'#86C86A',grassD:1.2,trees:[['riesenhalm',6],['riesenklee',1.2],['riesenpusteblume',.25]],treeD:2.2,
    deco:[['klee',6],['grasbuesche',6],['loewenzahn',2],['tautropfen_deko',1.5]],decoD:8,rocks:[['kiesel',1],['riesenknopf',.2]],rockD:.4,litter:[['tautropfen',.4],['blatt_herbst',1]]},
  kleefeld:{n:'Kleefeld',g:['#9CD27A','#86C468'],cliff:'#9A7A5A',pat:'gras',grass:'#9CD27A',grassD:.9,trees:[['riesenklee',4],['riesenhalm',1],['riesentulpe',.4]],treeD:1.4,
    deco:[['klee',8],['blume',3],['tautropfen_deko',1]],decoD:7,rocks:[['riesenknopf',.4],['kiesel',1]],rockD:.4,litter:[['gluecksklee',.25],['beeren',.6]]},
  blumenbeet:{n:'Blumenbeet',g:['#8A6A52','#7A5E48'],cliff:'#6E5040',pat:'staub',grass:'#8FC86A',grassD:.3,trees:[['riesentulpe',4],['riesenpusteblume',.8],['sonnenblume',1]],treeD:1.4,
    deco:[['blume',6],['lavendel',2],['hortensienbusch',1]],decoD:5,rocks:[['kiesel',1],['fingerhut',.2]],rockD:.4,litter:[['pollenkugel',1.2],['beeren',.5]]},
  gemuesebeet:{n:'Gemüsebeet',g:['#9A7458','#8A6A50'],cliff:'#6E5040',pat:'staub',grass:null,grassD:0,trees:[['riesenkuerbis',1.2],['riesenhalm',.6]],treeD:.6,
    deco:[['unkraut',3],['ameisenhuegel',.3],['klee',2]],decoD:3,rocks:[['garnrolle',.25],['kiesel',1]],rockD:.5,litter:[['erbse',1.5]]},
  kiesweg:{n:'Kiesweg',g:['#D8CEB8','#C8BCA4'],cliff:'#A89C8A',pat:'sand',grass:null,grassD:0,trees:[['riesenhalm',.2]],treeD:.1,deco:[['kiesel',6],['steinchen',4]],decoD:4,
    rocks:[['riesenknopf',.6],['fingerhut',.5],['garnrolle',.5],['findling',.6]],rockD:1.1,litter:[['stecknadel',.6],['stein_klein',1]]},
  pfuetzenufer:{n:'Pfützenufer',g:['#7ABF8A','#68B078'],cliff:'#7A6A58',pat:'moos',grass:'#7ABF8A',grassD:.8,trees:[['riesenhalm',2],['schilf',1]],treeD:1,
    deco:[['schilf',4],['moospolster',2],['tautropfen_deko',2]],decoD:5,rocks:[['kiesel',1]],rockD:.3,litter:[['tautropfen',.4]]}};

/* ================= Sammelsachen ================= */
IT('tautropfen',itMeta('Tautropfen','riesengarten','material',90),(g,m)=>{P(g,G.s(.22),m.glass('#DDF6FF'),[0,.22,0],null,[1,.9,1]);P(g,G.s(.06),m.flat('#ffffff'),[.07,.3,.12]).userData.noOutline=true});
IT('pollenkugel',itMeta('Pollenkugel','riesengarten','material',45),(g,m)=>{P(g,G.s(.2),m.c('#FFD35C',{rim:.8}),[0,.2,0]);range(10,(t,i)=>P(g,G.co(.03,.08),m.c('#F2B83A'),[Math.cos(i*2.4)*.18,.2+(t-.5)*.3,Math.sin(i*2.4)*.18]))});
IT('erbse',itMeta('Riesen-Erbse','riesengarten','frucht',70),(g,m)=>{P(g,G.s(.22),m.c('#8FD06B',{gloss:.6,rim:.5}),[0,.22,0])});
IT('stecknadel',itMeta('Stecknadel','riesengarten','material',60),(g,m)=>{const q=grp(g,[0,.05,0],[0,0,PI/2-.1]);P(q,G.cy(.015,.004,.9),m.c('#D8D0E0',{gloss:1.3}),[0,0,0]);P(q,G.s(.08),m.c('#FF6F91',{gloss:1}),[0,.46,0])});
IT('gluecksklee',itMeta('Vierblättriger Klee','riesengarten','blume',400),(g,m)=>{for(let i=0;i<4;i++){const a=i/4*TAU;P(g,G.puff(new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(-.14,.1),new THREE.Vector2(-.1,.2),new THREE.Vector2(0,.16),new THREE.Vector2(.1,.2),new THREE.Vector2(.14,.1)]),.02),m.c('#6CBF5A',{rim:.6}),[0,.06,0],[-PI/2,0,a])}markGlow(g,P(g,G.s(.04),m.glow('#FFE27A',1.4),[0,.1,0]))});

/* ================= Fische (Pfützen, Regentonne, Gartenteich) ================= */
F('mueckenlarve',fishMeta('Mückenlarve','riesengarten','teich','S','immer',1,120,'Ich hab eine Mückenlarve gefangen! Hängt kopfüber und atmet durch den Po. Respekt.','Mückenlarven hängen unter der Wasseroberfläche und atmen durch ein kleines Rohr am Hinterende. Bei Gefahr zappeln sie blitzschnell nach unten.'),
  (g,m)=>{const bm=m.c('#9AA88A',{rim:.5});for(let i=0;i<6;i++)P(g,G.s(.07-i*.006),bm,[0,0,.25-i*.09]);P(g,G.s(.1),bm,[0,.02,.34]);eye(g,m,[.06,.06,.4],.03,[.6,.2,.6]);eye(g,m,[-.06,.06,.4],.03,[-.6,.2,.6]);P(g,G.cy(.015,.02,.18),bm,[0,0,-.32],[PI/2,0,0])});
F('rueckenschwimmer',fishMeta('Rückenschwimmer','riesengarten','teich','S','tag',2,380,'Ich hab einen Rückenschwimmer gefangen! Er rudert lieber auf dem Rücken. Entspannt.','Rückenschwimmer sind Wanzen, die tatsächlich auf dem Rücken schwimmen. Ihre langen Hinterbeine rudern wie Paddel.'),
  (g,m)=>{const bm=m.c('#6E8EB0',{gloss:.8});P(g,G.s(.26),bm,[0,0,0],null,[.8,.5,1.3]);bugFace(g,m,[0,.05,.32],.1,.6);both(s=>P(g,G.tu([[s*.15,0,0],[s*.45,.02,-.1],[s*.55,.02,-.35]],.025,.02),m.c('#E8C87A')))});
F('kaulquappe_riesig',fishMeta('Riesen-Kaulquappe','riesengarten','teich','M','immer',1,200,'Ich hab eine Kaulquappe gefangen! Aus meiner Sicht ist sie riesig. Aus ihrer Sicht bin ich winzig.','Kaulquappen atmen zuerst mit Kiemen. Nach einigen Wochen wachsen Beine, der Schwanz verschwindet – aus der Larve wird ein Frosch.'),
  (g,m)=>{P(g,G.s(.26),m.c('#4E5A48',{gloss:.7}),[0,0,.1],null,[1,.85,1]);fin2(g,m.c('#6E7A68',{opacity:.85}),[[0,0],[.1,.14],[.5,.08],[.6,0],[.5,-.08],[.1,-.14]],[0,0,-.12],1,.02,[0,-PI/2,0]);eye(g,m,[.12,.08,.26],.05,[.7,.2,.5]);eye(g,m,[-.12,.08,.26],.05,[-.7,.2,.5])});
F('goldelritze',fishMeta('Goldelritze','riesengarten','teich','M','tag',2,520,'Ich hab eine Goldelritze gefangen! Aus der Regentonne. Sie glitzert wie ein Ring.','Elritzen leben in klaren Bächen in grossen Schwärmen. Zur Laichzeit bekommen die Männchen einen leuchtend roten Bauch.'),
  (g,m)=>fishT(g,m,{id:'goldelritze',H:.17,L:.72,back:'#E8B84A',belly:'#FFF1C8',tail:'fork',pat:(x,w,h,r)=>FT.spots(x,w,h,'#B8862A',14,3,6,r)}));
F('gartenkoi',fishMeta('Riesen-Gartenkoi','riesengarten','meer','XL','immer',3,2400,'Ich hab einen Gartenkoi gefangen! Für mich ist das ein Wal mit Schnurrbart.','Kois sind Zuchtformen des Karpfens und können über 50 Jahre alt werden. In Japan gelten sie als Glücksbringer.'),
  (g,m)=>{fishT(g,m,{id:'gartenkoi',H:.26,L:1,back:'#FFFFFF',belly:'#FFF6EE',tail:'fancy',dorsal:'long',pat:(x,w,h,r)=>FT.blobs(x,w,h,'#FF6F3A',5,16,26,r)});both(s=>P(g,G.tu([[s*.07,-.04,.5],[s*.16,-.1,.56],[s*.2,-.16,.5]],.012,.008),m.c('#F2C49A')))});

/* ================= Insekten (für dich gross wie Hunde) ================= */
B('riesenmarienkaefer',bugMeta('Marienkäfer','riesengarten','blume','tag',1,160,'Ich hab einen Marienkäfer gefangen! Sieben Punkte. Ich hab zweimal gezählt.','Ein Marienkäfer frisst in seinem Leben tausende Blattläuse. Die Zahl der Punkte verrät übrigens nicht sein Alter, sondern seine Art.'),
  (g,m)=>{P(g,G.hs(.3),m.c('#F0443A',{gloss:1}),[0,.12,0]);range(7,(t,i)=>P(g,G.s(.06),m.c('#2E2A3E'),[Math.cos(i*2.1)*.17*(i?1:0),.34-(i?.08:0),Math.sin(i*2.1)*.17*(i?1:0)],null,[1,.5,1]));P(g,G.s(.13),m.c('#2E2A3E'),[0,.14,.28]);bugFace(g,m,[0,.15,.36],.1,.6);legs(g,m.c('#2E2A3E'),[[.12,.2,.1],[0,.24,0],[-.12,.2,-.1]],.25)});
B('hummel',bugMeta('Hummel','riesengarten','luft','tag',2,420,'Ich hab eine Hummel gefangen! Flauschig wie ein fliegender Pullover.','Hummeln können auch bei Kälte fliegen, weil sie ihre Flugmuskeln durch Zittern aufwärmen. Ihr Pelz hält die Wärme wie eine Jacke.'),
  (g,m)=>{P(g,G.s(.26),m.c('#2E2A3E',{rim:.9,rimColor:'#ffe8a0'}),[0,.3,-.05],null,[1,.95,1.2]);P(g,G.to(.24,.08),m.c('#FFD35C',{rim:.8}),[0,.3,.02],[0,0,0],[1,1,1]);P(g,G.s(.12),m.c('#FFFBF0'),[0,.3,-.3]);P(g,G.s(.13),m.c('#2E2A3E'),[0,.33,.26]);bugFace(g,m,[0,.33,.34],.1,.6);
    wingPair(g,m,m.c('#F2FAFF',{opacity:.6}),leafShape(.3,.12),[0,.5,0],.6,.3,.3,.02)});
B('grashuepfer',bugMeta('Grashüpfer','riesengarten','boden','tag',1,140,'Ich hab einen Grashüpfer gefangen! Er springt zwanzigmal so weit, wie er lang ist.','Heuschrecken zirpen, indem sie ihre Hinterbeine an den Flügeln reiben – wie ein Bogen auf einer Geige.'),
  (g,m)=>{const bm=m.c('#8FD06B',{rim:.6});P(g,G.ca(.1,.5),bm,[0,.22,0],[PI/2,0,0]);P(g,G.s(.13),bm,[0,.28,.32],null,[1,1.2,1]);bugFace(g,m,[0,.28,.42],.1,.5);both(s=>P(g,G.tu([[s*.1,.2,-.05],[s*.2,.5,-.2],[s*.18,.08,-.4]],.03,.02),bm));feelers(g,bm,bm,[.04,.36,.4],.5,.3,.3)});
B('regenwurm',bugMeta('Regenwurm','riesengarten','boden','nacht',1,110,'Ich hab einen Regenwurm gefangen! Er hat den ganzen Garten umgegraben – für mich.','Regenwürmer fressen Erde und lockern sie dabei auf. Ein Wurm kann über die Hälfte seines Gewichts am Tag verdauen.'),
  (g,m)=>{const wm=m.c('#E8958A',{gloss:.6,rim:.5});P(g,G.tu([[-.4,.08,0],[-.15,.12,.1],[.1,.08,-.05],[.35,.1,.05]],.07,.06),wm);P(g,G.to(.075,.02),m.c('#D8786E'),[-.05,.12,.07],[0,PI/2,0]);bugFace(g,m,[.38,.12,.06],.07,.5)});
B('blattlaus',bugMeta('Blattlaus','riesengarten','baum','immer',1,60,'Ich hab eine Blattlaus gefangen! Sie hat nur Saft im Kopf.','Blattläuse saugen Pflanzensaft und geben süssen Honigtau ab. Ameisen melken sie dafür wie kleine Kühe – und beschützen sie im Gegenzug.'),
  (g,m)=>{P(g,G.s(.2),m.c('#A8E08A',{rim:.7}),[0,.18,0],null,[1,.85,1.2]);bugFace(g,m,[0,.2,.22],.08,.5);legs(g,m.c('#6FA858'),[[.08,.15,.08],[0,.17,0],[-.08,.15,-.08]],.2,.01)});
B('zitronenfalter',bugMeta('Zitronenfalter','riesengarten','luft','tag',2,480,'Ich hab einen Zitronenfalter gefangen! Seine Flügel sind so gross wie mein Bett.','Zitronenfalter überwintern ohne Versteck, frei an Zweigen. Ein Frostschutzmittel in ihrem Körper verhindert, dass sie erfrieren.'),
  (g,m)=>butterfly(g,m,'zitronenfalter','#FFE85C','#F8DE4A','#6E7A4A'));

/* ================= Fundstücke: verlorene Menschen-Dinge ================= */
REL('riesenmurmel',relMeta('Glasmurmel','riesengarten','schatz',2,900,'Eine Glasmurmel! Drinnen wirbelt ein Regenbogen.','Murmeln gibt es seit der Antike. Früher wurden sie aus Ton oder Stein gemacht, heute meist aus Glas mit eingeschmolzenen Farbschlieren.'),
  (g,m)=>{P(g,G.s(.4),m.glass('#CFEFFF'),[0,.4,0]);P(g,G.tu([[-.2,.3,0],[0,.5,.1],[.2,.35,-.05]],.05,.03),m.c('#FF6F91'),[0,0,0]);P(g,G.tu([[-.1,.5,-.1],[.1,.3,.1]],.04,.03),m.c('#56C6B6'))});
REL('verlorener_schluessel',relMeta('Verlorener Schlüssel','riesengarten','schatz',3,1400,'Ein riesiger Schlüssel! Irgendwo sucht jemand ganz verzweifelt seine Haustür.','Die ältesten bekannten Schlüssel stammen aus Ägypten und waren aus Holz. Metallschlüssel wie diesen gibt es seit den Römern.'),
  (g,m)=>{const km=m.c('#E8C87A',{gloss:1.3,rim:.6});P(g,G.to(.26,.06),km,[0,.08,-.35],[PI/2,0,0]);P(g,G.bx(.08,.06,.9,.02),km,[0,.08,.2]);P(g,G.bx(.2,.06,.08,.02),km,[.1,.08,.55]);P(g,G.bx(.14,.06,.06,.02),km,[.07,.08,.42])});
REL('legostein',relMeta('Bunter Klemmbaustein','riesengarten','kunst',2,760,'Ein Baustein! Wer darauf tritt, weiss, warum wir winzigen Leute so vorsichtig sind.','Klemmbausteine halten durch Noppen, die in Röhren darunter passen. Zwei Steine mit acht Noppen lassen sich auf 24 Arten verbinden.'),
  (g,m)=>{const bm=m.c('#F0443A',{gloss:1.1,rim:.5});P(g,G.bx(.9,.4,.45,.03),bm,[0,.2,0]);for(let i=0;i<4;i++)for(let j=0;j<2;j++)P(g,G.cy(.08,.08,.08),bm,[-.33+i*.22,.44,-.11+j*.22])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  gartenschnecke:{n:'Garten-Schnecke',planet:ID,biomes:['pfuetzenufer','kleefeld','gemuesebeet'],count:4,size:1.8,speed:.15,voice:['schlrp','mmm?'],pitch:160,likes:['erbse','beeren'],product:'tautropfen',names:['Schleimi','Häuschen','Turbo','Frau Spirale','Glitsch'],
    fact:'Weinbergschnecken können über 20 Jahre alt werden. Ihr Haus wächst mit – es wird am Rand immer weiter angebaut.',a:{col:'#C8B08A',belly:'#E8D8B8',body:[.36,.2,.62],by:.2,head:{r:.2,p:[0,.35,.58]},snout:{type:'none'},ears:{type:'none'},legs:{n:0},tail:{type:'none'},stalkEyes:true,extra:{snailShell:'#C8845A'}}},
  hummelchen:{n:'Pelzhummel',planet:ID,biomes:['blumenbeet','kleefeld'],fly:true,count:4,size:1.2,speed:1,voice:['bsss','summ','brmm'],pitch:260,likes:['pollenkugel','honig'],product:'pollenkugel',names:['Flausch','Brummi','Pollina','Summsi','Bommel'],
    fact:'Hummeln summen Blüten regelrecht an: Ihr Brummen schüttelt den Pollen heraus. Das nennt man Vibrationsbestäubung.',a:{col:'#2E2A3E',belly:'#FFD35C',body:[.34,.32,.4],head:{r:.22,p:[0,.5,.34]},snout:{type:'none'},eyes:{r:.1},ears:{type:'none'},legs:{n:2,len:.1,r:.03,col:'#2E2A3E'},tail:{type:'puff',col:'#FFFBF0',r:.16},stripes:{col:'#FFD35C',n:2},wings:{type:'falter',col:'#F2FAFF',s:.6}}},
  marienkaeferchen:{n:'Glückskäfer',planet:ID,biomes:['kleefeld','rasenwald','blumenbeet'],count:4,size:1.1,speed:.6,voice:['tick','tuck'],pitch:380,likes:['gluecksklee','beeren'],product:'gluecksklee',names:['Punkti','Glücki','Sieben','Kiki','Ladybird'],
    fact:'Marienkäfer sondern bei Gefahr eine bittere gelbe Flüssigkeit aus den Beinen ab. Vögel lernen schnell: Rot mit Punkten schmeckt scheusslich.',a:{col:'#F0443A',belly:'#2E2A3E',body:[.42,.3,.46],head:{r:.22,col:'#2E2A3E',p:[0,.34,.44]},snout:{type:'none'},ears:{type:'none'},legs:{n:6,len:.12,r:.03,col:'#2E2A3E'},tail:{type:'none'},spots:{col:'#2E2A3E',n:7,s:1.3},feelers:true,bellyOn:false}},
  maulwurf:{n:'Maulwurf',planet:ID,biomes:['gemuesebeet','rasenwald'],count:2,size:2.6,speed:.5,shy:true,voice:['schnüff','mh-mh'],pitch:140,likes:['erbse','regenwurm'],product:'stein_klein',names:['Grabowski','Schaufel','Samtpfote','Maulwine','Brille'],
    fact:'Maulwürfe graben bis zu 20 Meter Gang am Tag. Sie sehen kaum etwas, aber ihre Nase und die Tasthaare an der Schnauze sind super empfindlich.',a:{col:'#4A4458',belly:'#5E5870',body:[.4,.32,.5],head:{r:.24,p:[0,.42,.46]},snout:{type:'long',col:'#FFB8C8',nose:'#FF8FA3'},eyes:{r:.03},ears:{type:'none'},legs:{n:4,len:.1,r:.08,col:'#FFB8C8',foot:'#FFB8C8'},tail:{type:'nub'}}},
  spatz:{n:'Riesenspatz',planet:ID,biomes:['kiesweg','rasenwald','kleefeld'],fly:true,count:3,herd:true,size:3.4,speed:1.2,voice:['tschilp','piep-piep','tschirp'],pitch:520,likes:['erbse','beeren'],product:'feder',names:['Pieps','Krümel','Tschilpi','Spatzl','Rudi'],
    fact:'Spatzen baden gern im Staub: Das hält Federläuse fern. Aus deiner winzigen Sicht ist so ein Spatz gross wie ein Haus – aber sehr freundlich.',a:{col:'#A8805A',belly:'#E8D8C0',body:[.3,.3,.38],head:{r:.22,p:[0,.62,.28]},snout:{type:'beak',col:'#6E5A48',len:.6},ears:{type:'none'},legs:{n:2,len:.14,r:.03,col:'#C89A7A'},tail:{type:'fan',col:'#8A6A48'},wings:{col:'#8A6A48'},spots:{col:'#6E4A30',n:6,s:.8}}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','blatthut','Blatt-Hut',420,'#6CBF5A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.05,0]);P(q,flatLeaf(leafShape(r*2.6,r*1.2),.03,.25),M.c(col,{rim:.5}),[0,0,0],[-PI/2+.15,0,0]);P(q,G.tu([[0,0,-r*1.2],[r*.1,r*.15,-r*1.5],[r*.2,r*.1,-r*1.7]],r*.04,r*.02),M.c('#8FC86A'))});
def('hat','fingerhuthelm','Fingerhut-Helm',780,'#D8D0E0',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.45,0]);P(q,G.la([[0,r*.9],[r*.72,r*.8],[r*.84,r*.1],[r*.9,0],[0,0]],Q(20)),M.c(col,{gloss:1.2,rim:.6}),[0,0,0]);for(let i=0;i<14;i++){const a=i/14*TAU;P(q,G.s(r*.05),M.c('#A8A0B8'),[Math.cos(a)*r*.8,r*.45,Math.sin(a)*r*.8],null,[1,1,.4])}});
def('top','bluetenkleid','Blüten-Kleid',880,'#FF8FB1',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);for(let i=0;i<7;i++){const a=i/7*TAU;const p=grp(q,[0,-r*.2,0],[0,a,0]);P(p,G.puff(new THREE.Shape([new THREE.Vector2(-r*.35,0),new THREE.Vector2(-r*.45,-r*1.1),new THREE.Vector2(0,-r*1.35),new THREE.Vector2(r*.45,-r*1.1),new THREE.Vector2(r*.35,0)]),r*.03),M.c(i%2?col:shade(col,1.1),{rim:.6}),[0,0,r*.72],[-.25,0,0])}});

/* ================= Bau-Familie: Blumentopf-, Teetassen- und Fingerhut-Häuser ================= */
function topfhaus(pid,r,plan,A){const g=new THREE.Group();const big=plan.big?1.4:1;const style=plan.style||A.pick(r,['topf','tasse','fingerhut']);const Rb=(1.15+r()*.25)*big,Hw=(1.5+r()*.3)*big;const body=new THREE.Group();g.add(body);
  const C=c=>cozy({color:c});let top=Hw,doorZ=-Rb*.92;
  if(style==='topf'){const tc=A.pick(r,['#E0876A','#D8784E','#E8987A']);P(body,G.la([[0,0],[Rb*.82,0],[Rb,Hw*.82],[Rb*1.12,Hw*.84],[Rb*1.12,Hw],[0,Hw]],Q(24)),C(tc));P(body,G.to(Rb*1.12,.05),C(shade(tc,.85)),[0,Hw*.84,0],[PI/2,0,0]);
    /* Dach: die Pflanze im Topf */P(body,G.cy(Rb*1.02,Rb*1.02,.1),C('#6E5040'),[0,Hw-.02,0]);const pc=A.pick(r,['#7CC46A','#8FD06B','#5FAE55']);for(let i=0;i<7;i++){const a=i/7*TAU;const q=grp(body,[0,Hw,0],[0,a,-.55]);P(q,flatLeaf(leafShape(Rb*1.3,Rb*.5),.04,.3),C(pc),[0,0,0])}
    P(body,G.tu([[0,Hw,0],[.1,Hw+Rb*1.2,0],[0,Hw+Rb*1.8,0]],.06,.05),C('#6CAF5A'));const fc=A.pick(r,['#FF6F91','#FFD35C','#FFFFFF','#C6A9FF']);range(6,(t,i)=>P(body,G.s(.2),C(fc),[Math.cos(i)*.2,Hw+Rb*1.85,Math.sin(i)*.2],null,[1,.5,1]));P(body,G.s(.15),C('#FFE27A'),[0,Hw+Rb*1.9,0]);top=Hw+Rb*2}
  else if(style==='tasse'){const tc=A.pick(r,['#FFFFFF','#FFF1E0','#E8F4FF']);const dc=A.pick(r,['#56C6B6','#FF8FA3','#8E6BD1','#F2A83A']);P(body,G.la([[0,0],[Rb*.75,0],[Rb*.8,.08],[Rb*1.02,Hw*.7],[Rb*1.08,Hw],[0,Hw]],Q(24)),C(tc));P(body,G.to(Rb*1.06,.06),C(dc),[0,Hw,0],[PI/2,0,0]);P(body,G.to(Rb*.95,.05),C(dc),[0,Hw*.35,0],[PI/2,0,0]);
    /* Henkel */P(body,G.to(Hw*.3,.14,PI),C(tc),[Rb*1.05,Hw*.55,0],[0,0,-PI/2]);/* Untertasse */P(body,G.cy(Rb*1.6,Rb*1.3,.14,Q(24)),C(tc),[0,.07,0]);P(body,G.to(Rb*1.58,.04),C(dc),[0,.14,0],[PI/2,0,0]);
    /* Dach: Tee-Kuppel mit Dampf */P(body,G.hs(Rb*1.02),C(A.pick(r,['#C8845A','#A8704C','#E8B888'])),[0,Hw-.05,0],null,[1,.35,1]);range(3,(t,i)=>P(body,G.s(.22-i*.04),C('#FFFFFF'),[Math.sin(i)*.3,Hw+Rb*.4+i*.35,Math.cos(i*2)*.2]));top=Hw+Rb*.4+1.1}
  else{const mc='#D8D0E0';P(body,G.la([[0,0],[Rb,0],[Rb*.96,Hw*.8],[Rb*.7,Hw*1.05],[0,Hw*1.12]],Q(24)),cozy({color:mc,gloss:1.1}));for(let rr=0;rr<5;rr++)for(let i=0;i<20;i++){const a=i/20*TAU+rr*.15,y=Hw*(.22+rr*.14);if(Math.abs(Math.atan2(Math.cos(a),-Math.sin(a)))<.5&&y<1.3)continue;const d=P(body,G.s(.06),C('#A8A0B8'),[Math.cos(a)*Rb*(.99-rr*.03),y,Math.sin(a)*Rb*(.99-rr*.03)],null,[1,1,.4]);d.lookAt(0,y,0);d.userData.noOutline=true}
    P(body,G.to(Rb,.07),cozy({color:'#E8C87A',gloss:1}),[0,.06,0],[PI/2,0,0]);/* Knopf-Schornstein */P(body,G.cy(.3,.3,.12),C(A.pick(r,['#FF6F91','#56C6B6','#FFD35C'])),[Rb*.3,Hw*1.14,0]);top=Hw*1.2}
  const dr=A.archDoor(A.pick(r,['#8A5E42','#56C6B6','#F0556E','#FFD35C']),'#6E4A3A');dr.position.set(0,0,doorZ);dr.rotation.y=PI;body.add(dr);
  const nw=1+Math.floor(r()*2);for(let i=0;i<nw;i++){const a=PI*.5+(i?1:-1)*(1.05+r()*.4);const w=A.roundWindow('#FFFFFF',.2,false);w.position.set(Math.cos(a)*Rb*1.0,Hw*.55,-Math.sin(a)*Rb*1.0);w.rotation.y=Math.atan2(Math.cos(a),-Math.sin(a));body.add(w)}
  /* Kleeblatt-Vordach */const cl=grp(body,[0,1.2,doorZ-.25]);for(let i=0;i<3;i++){const a=i/3*TAU+PI/2;P(cl,G.s(.26),C('#7CC46A'),[Math.cos(a)*.2,0,Math.sin(a)*.14],null,[1,.2,1])}
  addOutlines(body);return{g,R:Rb*1.15+.6,top,door:[0,doorZ],walls:[new THREE.Box3(new V(-Rb,0,-Rb),new V(Rb,top,Rb))],style:'topfhaus-'+style}}

/* ================= Möbel für den Laden ================= */
furn('fingerhut_hocker',{n:'Fingerhut-Hocker',cat:'sitz',price:680,planet:ID,size:[1,1],h:.55,b:(g,m)=>{P(g,G.la([[0,0],[.34,0],[.32,.42],[.22,.52],[0,.54]],Q(20)),m.c('#D8D0E0',{gloss:1.2}));for(let i=0;i<12;i++){const a=i/12*TAU;P(g,G.s(.03),m.c('#A8A0B8'),[Math.cos(a)*.32,.3,Math.sin(a)*.32],null,[1,1,.4])}}});
furn('knopf_tisch',{n:'Knopf-Tisch',cat:'tisch',price:950,planet:ID,size:[1,1],h:.6,b:(g,m)=>{P(g,G.cy(.48,.48,.08,Q(24)),m.c('#FF8FA3',{gloss:1}),[0,.58,0]);for(let i=0;i<4;i++)P(g,G.cy(.05,.05,.1),m.c('#C8566E'),[(i%2-.5)*.2,.6,(Math.floor(i/2)-.5)*.2]);P(g,G.cy(.06,.08,.55),m.c('#D8B888'),[0,.28,0]);P(g,G.cy(.25,.28,.04),m.c('#D8B888'),[0,.02,0])}});
furn('garnrollen_regal',{n:'Garnrollen-Regal',cat:'lager',price:1200,planet:ID,size:[2,1],h:1.3,b:(g,m)=>{const wm=m.c('#D8B888');for(let i=0;i<3;i++)P(g,G.bx(1.7,.06,.4,.02),wm,[0,.1+i*.55,0]);both(s=>P(g,G.bx(.06,1.25,.4,.02),wm,[s*.85,.63,0]));
  const cols=['#FF6F91','#56C6B6','#FFD35C','#8E6BD1','#FF9E6E','#7CC46A'];for(let k=0;k<2;k++)for(let i=0;i<4;i++){const c=cols[(i+k*3)%6];P(g,G.cy(.12,.12,.3),m.c(c),[-.6+i*.4,.3+k*.55,0]);P(g,G.cy(.15,.15,.04),wm,[-.6+i*.4,.14+k*.55,0]);P(g,G.cy(.15,.15,.04),wm,[-.6+i*.4,.46+k*.55,0])}}});
furn('pusteblumen_lampe',{n:'Pusteblumen-Lampe',cat:'licht',price:1500,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{P(g,G.tu([[0,0,0],[.05,.7,0],[0,1.3,0]],.03,.025),m.c('#8FC86A'));P(g,G.s(.08),m.c('#E8DCC0'),[0,1.3,0]);for(let i=0;i<30;i++){const th=Math.acos(1-2*(i+.5)/30),ph=i*2.4;const d=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));P(g,G.s(.04),m.glow('#FFF6D8',1.4),[d.x*.28,1.3+d.y*.28,d.z*.28])}
  P(g,G.cy(.2,.24,.06),m.c('#E0876A'),[0,.03,0]);g.userData.light={p:[0,1.3,0],c:'#FFF1D0',i:1.2}}});

/* ================= Sprache: Blatt-Zeichen ================= */
function leafGlyph(x,s,r){const k=Math.floor(r()*4);x.beginPath();if(k===0){x.moveTo(0,s*.4);x.quadraticCurveTo(-s*.3,0,0,-s*.4);x.quadraticCurveTo(s*.3,0,0,s*.4);x.moveTo(0,s*.4);x.lineTo(0,-s*.3)}
  else if(k===1){for(let i=0;i<3;i++){const a=i/3*TAU-PI/2;x.moveTo(0,0);x.arc(Math.cos(a)*s*.16,Math.sin(a)*s*.16,s*.14,0,TAU)}}
  else if(k===2){x.moveTo(-s*.3,s*.3);x.quadraticCurveTo(0,-s*.5,s*.3,s*.3);x.moveTo(-s*.15,s*.1);x.lineTo(s*.15,s*.1)}
  else{x.arc(0,0,s*.12,0,TAU);for(let i=0;i<8;i++){const a=i/8*TAU;x.moveTo(Math.cos(a)*s*.16,Math.sin(a)*s*.16);x.lineTo(Math.cos(a)*s*.36,Math.sin(a)*s*.36)}}x.stroke()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Riesengarten',base:'kompost',R:128,R0:44,sea:-.3,music:'world',sky:['#bfe6ff','#fff6dc'],fog:'#e8f4e0',water:'#7FD0E6',deep:'#3E9AB8',step:1.1,shop:ID,
    desc:'Du bist hier winzig: Grashalme wie Bäume, Knöpfe wie Felsen. Reite auf Pusteblumen-Samen und sammle Morgentau.',weather:'blueten',orbit:[131,3.8],size:1,col:['#86C86A','#FF8FB1'],moons:1,
    park:'kleefeld',parkPond:true,phone:['#B8E890','#FFD1E0'],stones:['stein_klein','riesenmurmel','kiesel'],plazaTree:'riesenpusteblume',
    space:{deep:'#3E9AB8',water:'#7FD0E6',shore:'#D8CEB8',land:'#86C86A',land2:'#6CB458',high:'#FF8FB1',cap:'#FFFFFF',atmo:'#CFF0FF',cloud:.45,sea:.35,capA:.4,freq:2.8},
    mac:{oc:-.2,m:.35,isl:.8},climate:{hot:'blumenbeet',wet:'pfuetzenufer',cold:'kleefeld'},peak:'kiesweg',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.1,4)*2+.6;/* Beet-Terrassen: flache Rechtecke, wie im Garten */const b=N2(q.x*.9,q.y*.9,q.z*.9);h+=sstep(.15,.3,b)*1.6;
      /* Kieswege: flache Rinnen */const w=Math.abs(N(q.x*.7+3,q.y*.7,q.z*.7));h-=sstep(.06,0,w)*.8;return h},
    biome({T,M,h,sea,low,nearPond,p,...o}){if(nearPond||(low&&h<sea+.5))return'pfuetzenufer';const n=Math.sin(p.x*7)*Math.cos(p.z*7);if(h>sea+3.4)return'kiesweg';if(T>.25)return'blumenbeet';if(M<-.2)return'gemuesebeet';if(n>.3||M>.25)return'kleefeld';return'rasenwald'},
    onLoad:W=>RIESENGARTEN.onLoad(W),tick:(dt,t,W,me)=>RIESENGARTEN.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Gießkannen-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Regentonne',lat:48,lon:140,r:.09,pond:true},{id:'teich2',n:'Große Pfütze',lat:34,lon:220,r:.12,pond:true},{id:'see',n:'Gartenteich',lat:6,lon:60,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Knopf-Casino',mode:'Blütenschneiderei',praxis:'Kamillen-Praxis',museum:'Fundsachen-Museum',shop:'Nähkästchen',studio:'Blütenstaub-Atelier',bar:'Tautropfen-Bar',rathaus:'Gießkannen-Rathaus',garage:'Schnecken-Garage',pflanzen:'Samen-Tütchen',tiere:'Käfer-Kita'},
  sty:{wall:'putz',walls:['#FFF1E0','#FFE3D0','#F6F0FF','#E8F8E0'],roof:'dome',roofs:['#7CC46A','#FF8FB1','#FFD35C'],trim:'#FFFFFF',plinth:'#D8CEB8',door:'#56C6B6',win:'rund',pitch:.8},
  wall:'bluemchen',floor:'dielen',
  mayor:['Bürgermeisterin Klee',{skin:'moos',color:5,shape:'ei'},{kopf:'frosch',augen:'kuller',arme:'mini',beine:'stummel',extras:['krone']}],
  lore:['Früher waren wir normal gross. Dann hat jemand am Schrumpfhebel gespielt. Aber ehrlich: So ist es viel gemütlicher.','Wenn du oben auf einer Pusteblume stehst und springst, trägt dich der Wind weit übers Land.','Am Morgen hängen Tautropfen an den Blättern. Jeder ist ein kleiner Spiegel – wir sammeln sie für die Laternen.'],
  caveRock:['#C8B8A0','#A08A70','#6E5A48',['#FFE3B8','#E8F4E0','#FFD1E0']],
  wear:['blatthut','fingerhuthelm','bluetenkleid','strohhut','halstuch','blumenkette'],clothes:CL,
  haus:{theme:{roof:['#7CC46A','#FF8FB1','#FFD35C'],wall:['#FFF1E0','#E0876A','#FFFFFF'],wood:['#D8B888','#A0704C'],stone:['#D8CEB8','#C8BCA4'],trim:['#FFFFFF'],plant:['#7CC46A','#8FD06B']},
    props:[['nature','flower_redA',1.6,'d',0],['nature','flower_yellowB',1.6,'d',0],['nature','mushroom_redGroup',1.4,'c'],['nature','plant_bushLarge',1.4,'c',0],['nature','pot_large',1.2,'d']],
    garden:{path:'path_stone',flowers:['flower_redA','flower_yellowB','flower_purpleA'],veg:['crop_pumpkin','crop_carrot']},
    plan:[{fam:'topfhaus',style:'topf'},{fam:'topfhaus',style:'tasse'},{fam:'topfhaus',style:'fingerhut'},{fam:'topfhaus'}],fams:{topfhaus}},
  residents:{skins:['moos','fell','pluesch','haut','schuppen'],heads:['frosch','kaefer','maus','hase','axolotl','schnecke','vogel','eule','igel'],names:['Krümel','Pieps','Knöpfchen','Distel','Minze','Tau','Mohnchen','Kiesel','Zwirn','Nadelinchen','Erbse','Hummelinde'],
    house:{shapes:['rund','huette'],walls:['putz','holz'],wallCols:['#FFF1E0','#FFE3D0','#E8F8E0'],roofCols:['#7CC46A','#FF8FB1'],win:['rund']},deco:['klee','loewenzahn','blume','tautropfen_deko'],fence:false},
  lang:{n:'Blattgeflüster',ink:'#4E8A3E',glow:'#C8FF9A',kind:'leaf',draw:leafGlyph,syl:['pi','mi','lu','ti','wi','ni','fli','su','bi','ki','hu','zi']},ruinStone:'#D8CEB8',
  terraform:['rasenwald','kleefeld','blumenbeet','gemuesebeet'],
  weather:[['klar',3],['heiter',3],['regen',2],['nebel',2],['gewitter',1]]});

/* ================= Planeten-Besonderheiten ================= */
const RIESENGARTEN=(()=>{let W_=null,blows=[],drops=[],seed=null,dewOn=false;const M=()=>makeMats({skin:'haut',color:0});
  const S=()=>SAVE.riesengarten=SAVE.riesengarten||{flights:0,dew:0,day:-1,got:[]};
  const morning=()=>{const h=GAMETIME.hour();return h>=5&&h<10};
  function seedModel(m){const g=new THREE.Group();P(g,G.cy(.02,.02,1.1),m.c('#F2EEE0'),[0,.55,0]);P(g,G.s(.08),m.c('#A88A6A'),[0,0,0],null,[1,1.8,1]);const pm=m.c('#FFFFFF',{rim:1});for(let i=0;i<14;i++){const a=i/14*TAU;P(g,G.cy(.006,.006,.7),m.c('#FFFFFF'),[Math.cos(a)*.34,1.2,Math.sin(a)*.34],[Math.sin(a)*1.1,0,-Math.cos(a)*1.1]);P(g,G.s(.05),pm,[Math.cos(a)*.66,1.32,Math.sin(a)*.66])}addOutlines(g);return g}
  function onLoad(W){W_=W;blows=[];drops=[];const m=M();const r=srand(1717);
    /* acht begehbare Pusteblumen mit Blätter-Treppe */for(let i=0,t=0;i<8&&t<500;t++){const d=new V().randomDirection();if(d.y>.95||d.y<-.7)continue;if(!GAME.isLand(d))continue;const b=W.biomeAt(d);if(!['rasenwald','kleefeld','blumenbeet'].includes(b))continue;
      if(blows.some(x=>angle(x.d,d)*W.R<30))continue;const g=new THREE.Group();NATURE.riesenpusteblume.b(g,m,{},srand(i+5));
      /* Treppe aus Blättern um den Stängel */for(let k=0;k<6;k++){const a=k*1.1;P(g,flatLeaf(leafShape(1.4,.6),.05,.2),m.c(k%2?GRN:GRN2,{rim:.5}),[Math.cos(a)*.7,.6+k*1.05,Math.sin(a)*.7],[-PI/2+.05,0,-a+PI/2])}
      addOutlines(g);GAME.placeObj(g,d,r()*6,0);GAME.addObst(d,.5);const B={d,g,h:7.2};blows.push(B);
      W.inter.push({kind:'pusteblume',p:d,r:2,label:'Hochklettern und Samen greifen',act:()=>fly(B)});i++}
    placeDew();}
  function placeDew(){for(const x of drops)x.g.parent&&x.g.parent.remove(x.g);drops=[];W_.inter=W_.inter.filter(i=>i.kind!=='tau');const st=S();const day=GAMETIME.day?GAMETIME.day():Math.floor(Date.now()/864e5);
    if(st.day!==day){st.day=day;st.got=[];persist()}dewOn=morning();if(!dewOn)return;const m=M();const r=srand(day*13+7);
    for(let i=0,t=0;i<14&&t<300;t++){const d=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(d.y>.97||d.y<-.7||!GAME.isLand(d))continue;const b=W_.biomeAt(d);if(!['rasenwald','kleefeld','pfuetzenufer','blumenbeet'].includes(b))continue;
      const id='t'+i;if(st.got.includes(id)){i++;continue}const g=new THREE.Group();P(g,G.s(.34),m.glass('#E8FAFF'),[0,.34,0],null,[1,.88,1]);const hl=P(g,G.s(.1),m.flat('#ffffff'),[.12,.5,.16]);hl.userData.noOutline=true;const sp=P(g,G.s(.08),m.glow('#FFFFFF',2),[0,.34,0]);addOutlines(g);
      GAME.placeObj(g,d,0,0);const D={id,d,g,sp};drops.push(D);W_.inter.push({kind:'tau',p:d,r:1.4,label:'Tautropfen einsammeln',act:()=>takeDew(D)});i++}}
  function takeDew(D){const st=S();if(st.got.includes(D.id))return;if(typeof bagAdd==='function'&&!bagAdd('item','tautropfen')){UI.toast('Deine Tasche ist voll.');return}st.got.push(D.id);st.dew++;persist();D.g.parent&&D.g.parent.remove(D.g);drops=drops.filter(x=>x!==D);W_.inter=W_.inter.filter(i=>!(i.kind==='tau'&&i.p===D.d));
    SND.play('glass',{rate:1.2+Math.random()*.3});GAME.W.fx(D.d,'stern',6);if(st.dew===1)UI.toast('Ein Tautropfen! Er spiegelt den ganzen Garten.',2600);if(st.dew%10===0){money(250);UI.toast(st.dew+' Tautropfen gesammelt. Die Laternenmacherin schickt dir 250 Taler.',3000)}}
  function fly(B){const me=GAME.me;if(!me||me.script)return;const W=GAME.G;SND.play('whoosh');
    /* Ziel: 30–55 m weiter, in Blickrichtung weg von der Blume, auf Land */let to=null;for(let k=0;k<20&&!to;k++){const tg=GAME.tangentTo(B.d,new V().randomDirection());const d=B.d.clone().addScaledVector(tg,(30+Math.random()*25)/W.R).normalize();if(GAME.isLand(d)&&d.y<.99)to=d}if(!to){UI.toast('Kein Wind gerade. Versuch es gleich nochmal.');return}
    const sm=seedModel(M());me.g.add(sm);sm.position.set(0,.9,0);seed=sm;const st=S();st.flights++;persist();
    /* 1. hochklettern */me.script={from:me.p.clone(),to:B.d.clone(),dur:1.6,peak:0,t:0,base:0,baseTo:B.h,keepLift:true,ease:k=>k*k*(3-2*k),done:()=>{SND.play('sparkle');
      /* 2. gleiten */me.script={from:B.d.clone(),to,dur:7,peak:3,t:0,base:B.h,baseTo:0,ease:k=>k,done:()=>{me.lift=0;if(seed){me.g.remove(seed);disposeTree(seed);seed=null}SND.play('soft');GAME.W.fx(to,'blatt',10);
        if(st.flights===1)UI.toast('Sanft gelandet! Pusteblumen gibt es überall im Rasenwald.',2800);if(st.flights===5){money(300);UI.toast('Fünf Pusteblumen-Flüge! Der Wind schenkt dir 300 Taler.',2800)}}}}}}
  let chk=0;function tick(dt,t,W,me){chk-=dt;if(chk<=0){chk=4;if(morning()!==dewOn)placeDew()}
    for(const D of drops){D.sp.scale.setScalar(.6+Math.sin(t*3+D.d.x*9)*.4)}
    if(seed){seed.rotation.y+=dt*.6;seed.position.y=.9+Math.sin(t*2)*.05}}
  return{onLoad,tick}
})();
window.RIESENGARTEN=RIESENGARTEN;
})();
