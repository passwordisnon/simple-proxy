/* =====================================================================
   CYBORG-LABOR · nature2.js
   Erweiterung: Natur für alle Biome (Kleinkram wie Kiesel, Äste, Unkraut,
   Farne; Schnee-, Wüsten- und Pilzwald-Pflanzen; Blütenbäume), neue
   Sammelsachen und Fische/Insekten/Fundstücke für Frost-Stern,
   Dünen-Planet und Sporen-Mond.
   ===================================================================== */
(function(){
const{N,RR,RP,orient,eye,eyes,flatLeaf,leafShape,flowerShape,scallop,crystal,trunk,cloud,onBlob,shade,ROCK,markGlow,fruit,pine,shroom,glowShroomCluster,bush,blossom,flower,stump,
  F,fishT,fishMeta,FT,B,bugMeta,legs,feelers,bugFace,wingPair,WING,wingTex,shellDome,butterfly,REL,relMeta,stoneM,IT,itMeta,spiralShell}=NH;
Object.assign(ROCK,{frost:['#DCE6F7','#C4D2EE','#FFFFFF'],wueste:['#EBC49A','#D9A87C','#E9A06A'],pilz:['#9C8CC0','#8676AE','#7FDCC8']});
const up=new THREE.Vector3(0,1,0);
const bark='#9C6B48';
/* kleiner Steinklumpen */
function pebble(g,m,col,p,r,rnd,sq){return P(g,G.blob(r,.12,2.2,rnd()*9),m.c(col,{gloss:.35,rim:.4}),p,[0,rnd()*3,0],[1.2,sq??.6,1])}
/* Grashalm-Büschel als echte Geometrie (für Unkraut, Dünengras, Moorgras) */
function blades(g,m,col,n,h,spread,rnd,o){o=o||{};const mat=m.c(col,{rim:.5,rimColor:'#f4ffd0'});for(let i=0;i<n;i++){const a=i/n*TAU+rnd()*.6;const lean=RR(rnd,.15,.4)*(o.lean??1);const hh=h*RR(rnd,.7,1.15);
  const b=[Math.cos(a)*spread*rnd(),0,Math.sin(a)*spread*rnd()];const tip=[b[0]+Math.cos(a)*lean*hh,hh,b[2]+Math.sin(a)*lean*hh];const mid=[(b[0]+tip[0])/2,hh*.55,(b[2]+tip[2])/2];
  P(g,G.tu([b,mid,tip],o.w??.03,.006),mat)}}
/* Schneehaube auf eine Etage */
function snowCap(g,m,y,r,s){P(g,G.la([[0,0],[r*.98,-.02],[r*1.02,.05],[r*.72,.14],[r*.3,.2],[0,.22]].map(([a,b])=>[a*s,b*s]),Q(24)),m.c('#FBFDFF',{rim:.8,rimColor:'#dfefff'}),[0,y,0])}

/* ================= Kleinkram für alle ================= */
N('kiesel',{r:.18,h:.12,size:'tiny',planet:'alle'},(g,m,o,rnd)=>{const c=ROCK[o.planet||'kompost']||ROCK.kompost;range(5,(t,i)=>pebble(g,m,i%2?c[0]:c[1],[RR(rnd,-.22,.22),.04,RR(rnd,-.22,.22)],RR(rnd,.05,.1),rnd))});
N('steinchen',{r:.14,h:.14,size:'tiny',planet:'alle'},(g,m,o,rnd)=>{const c=ROCK[o.planet||'kompost']||ROCK.kompost;pebble(g,m,c[0],[0,.06,0],.14,rnd,.62)});
N('findling',{r:.9,h:1.5,size:'big',planet:'alle'},(g,m,o,rnd)=>{const c=ROCK[o.planet||'kompost']||ROCK.kompost;const sd=rnd()*9;
  P(g,G.blob(.95,.13,2,sd),m.c(c[0],{gloss:.25,rim:.45}),[0,.72,0],[0,rnd()*3,.1],[1.1,.85,1]);P(g,G.blob(.42,.14,2.4,sd+3),m.c(c[1]),[.72,.3,.4],null,[1,.75,1]);
  if(o.planet==='frost')P(g,G.blob(.82,.1,2,sd+1),m.c('#FBFDFF',{rim:.8}),[-.05,1.32,0],null,[1.05,.3,.9]);
  else if(o.planet!=='wueste'&&o.planet!=='schrott'){P(g,G.blob(.6,.14,3,sd+1),m.c(o.planet==='pilz'?'#7FDCC8':'#7CC46A',{rim:.6,rimColor:'#f4ffc8'}),[-.15,1.3,.05],null,[1,.28,.9]);range(3,(t,i)=>P(g,G.s(.06),m.c('#FFE27A'),[-.4+i*.3,1.45,.3-i*.1]))}});
N('ast_boden',{r:.3,h:.12,size:'tiny',planet:'alle'},(g,m,o,rnd)=>{const w=m.c('#A0704C');P(g,G.tu([[-.55,.06,0],[-.1,.08,.04],[.5,.06,-.03]],.065,.04),w);P(g,G.s(.065),m.c('#E8C08A'),[-.55,.06,0]);P(g,G.tu([[.05,.08,.02],[.25,.1,.2],[.38,.12,.28]],.035,.02),w);
  P(g,flatLeaf(leafShape(.2,.07),.02,.3),m.c('#7CC46A'),[.38,.14,.28],[0,.6,0])});
N('laubhaufen',{r:.5,h:.35,size:'small',planet:'kompost'},(g,m,o,rnd)=>{const cols=['#F2A23C','#E8705A','#FFD35C','#C98C5A'];P(g,G.blob(.5,.15,2.4,rnd()*9),m.c('#D98A4A',{rim:.4}),[0,.1,0],null,[1.2,.4,1]);
  for(let i=0;i<12;i++){const a=rnd()*TAU,r=rnd()*.5;P(g,flatLeaf(leafShape(.2,.08),.018,.2),m.c(RP(rnd,cols)),[Math.cos(a)*r,.2+rnd()*.12,Math.sin(a)*r],[RR(rnd,-.4,.4),rnd()*6,RR(rnd,-.4,.4)])}});
N('klee',{r:.2,h:.12,size:'tiny',planet:'kompost'},(g,m,o,rnd)=>{const lm=m.c('#6CBF5A',{rim:.6,rimColor:'#eaffb0'});for(let k=0;k<5;k++){const cx=RR(rnd,-.2,.2),cz=RR(rnd,-.2,.2);const q=grp(g,[cx,.08,cz],[0,rnd()*6,0]);
    for(let j=0;j<3;j++)P(q,G.puff(sshp([[0,0],[.06,.04],[.08,.09],[.03,.1],[0,.06],[-.03,.1],[-.08,.09],[-.06,.04]]),.015),lm,[0,0,0],[-PI/2,0,j*TAU/3],1.1);bt(g,[cx,0,cz],[cx,.08,cz],.01,lm)}
  if(rnd()<.5){const f=grp(g,[.1,.14,.05]);P(f,G.s(.05),m.c('#FFFDF7'),[0,0,0]);P(f,G.s(.03),m.c('#FFB8D8'),[0,.03,0])}});
N('unkraut',{r:.18,h:.3,size:'tiny',planet:'alle'},(g,m,o,rnd)=>{const col=o.planet==='frost'?'#A8C4A0':o.planet==='wueste'?'#B8B870':o.planet==='pilz'?'#9D8BD0':'#5FAE55';blades(g,m,col,7,.3,.06,rnd,{w:.035});
  P(g,G.s(.07),m.c(shade(col,.85)),[0,.03,0],null,[1.4,.4,1.4])});
N('loewenzahn',{r:.15,h:.45,size:'tiny',planet:'kompost'},(g,m,o,rnd)=>{const st=m.c('#6CBF5A');range(4,(t,i)=>P(g,flatLeaf(leafShape(.28,.06),.016,.4),st,[0,.02,0],[0,i*1.6,0]));
  const puff=rnd()<.4;P(g,G.tu([[0,0,0],[.03,.2,0],[0,.4,.02]],.016),st);if(puff){const pm=m.c('#FFFFFF',{rim:1,rimColor:'#ffffff'});P(g,G.s(.1),pm,[0,.44,.02]);range(10,(t,i)=>{const a=i*2.4,b=.5+(i%3)*.5;P(g,G.s(.02),pm,[Math.cos(a)*Math.sin(b)*.13,.44+Math.cos(b)*.13,.02+Math.sin(a)*Math.sin(b)*.13])})}
  else{const f=grp(g,[0,.42,.02],[.4,0,0]);P(f,G.puff(flowerShape(14,.11,.03,true),.03),m.c('#FFD23A',{rim:.6}));P(f,G.s(.04),m.c('#FFB02E'),[0,0,.02])}});
N('farn',{r:.45,h:.7,size:'small',planet:'kompost'},(g,m,o,rnd)=>{const col=o.color||'#4FA257';const lm=m.c(col,{rim:.55,rimColor:'#eaffb0'});
  for(let i=0;i<7;i++){const a=i/7*TAU+rnd()*.4;const q=grp(g,[0,.02,0],[0,-a,0]);const L=RR(rnd,.55,.75);const pts=range(8,(t)=>[t*L,Math.sin(t*PI*.9)*.38*L,0]);P(q,G.tu(pts,.018,.008),lm);
    range(7,(t,j)=>{const k=1+j;const pp=pts[k];if(!pp)return;both(s=>P(q,flatLeaf(leafShape(.14*(1-t*.6),.04),.012,.2),lm,[pp[0],pp[1]+.01,0],[0,s*1.1,0]))})}});
N('moospolster',{r:.4,h:.22,size:'small',planet:'kompost'},(g,m,o,rnd)=>{const c=o.planet==='pilz'?'#7FC8B0':'#6DAE55';P(g,G.blob(.42,.12,3,rnd()*9),m.c(c,{rim:.8,rimColor:'#f4ffc8'}),[0,.08,0],null,[1.2,.42,1]);
  P(g,G.blob(.22,.12,3,rnd()*9),m.c(shade(c,1.12)),[.32,.1,.12],null,[1,.5,1]);range(5,(t,i)=>{const s=P(g,G.cy(.006,.006,.12),m.c('#C98C5A'),[RR(rnd,-.3,.3),.24,RR(rnd,-.2,.2)]);P(g,G.s(.022),m.c('#FF8FB8'),[s.position.x,.31,s.position.z])})});
N('pilzgruppe',{r:.25,h:.3,size:'tiny',planet:'kompost'},(g,m,o,rnd)=>{const caps=['#E8505B','#C98C5A','#F2E2C8','#E8A060'];range(4,(t,i)=>{const a=i*2.3+rnd(),r=.05+rnd()*.14;shroom(g,m,[Math.cos(a)*r,0,Math.sin(a)*r],RR(rnd,.06,.11),RP(rnd,caps),{nd:i%2?4:0,dots:i%2===1,rot:[0,rnd()*3,RR(rnd,-.15,.15)]})})});
N('baumstamm_liegend',{r:.55,h:.6,size:'mid',planet:'kompost',cols:[[-.7,0,.4],[0,0,.45],[.7,0,.4]]},(g,m,o,rnd)=>{const bm=m.c(o.planet==='frost'?'#8A6A58':bark);const q=grp(g,[0,.36,0],[0,0,PI/2]);
  P(q,G.cy(.34,.36,1.9),bm);both(s=>{P(q,G.cy(.3,.3,.04),m.c('#E8C08A'),[0,s*.96,0]);P(q,G.to(.18,.02),m.c('#C99A66'),[0,s*.985,0],[PI/2,0,0])});
  if(o.planet==='frost')P(g,G.blob(.4,.1,2,3),m.c('#FBFDFF',{rim:.8}),[0,.7,0],null,[2.3,.3,.8]);else{P(g,G.blob(.3,.14,3,2),m.c('#6DAE55',{rim:.7}),[.2,.68,0],null,[2,.35,.9]);shroom(g,m,[-.5,.62,.2],.07,'#E8505B',{nd:3,rot:[.5,0,0]});shroom(g,m,[-.35,.6,.26],.05,'#E8505B',{dots:false,rot:[.6,0,0]})}
  bt(g,[.3,.55,-.1],[.55,.95,-.3],.05,bm,.03)});
N('beerenstrauch',{r:.55,h:1,size:'mid',shake:true,planet:'kompost'},(g,m,o,rnd)=>{bush(g,m,'#4F9A55',.95,rnd);range(9,(t,i)=>{const q=onBlob([0,.48,0],.7,.55,.64,.9+(i%3)*.35,i*.8+.3);
  const b=grp(g,q.p);P(b,G.s(.06),m.gloss(i%3?'#5B6BD8':'#8E5AD0'),[0,0,0]);P(b,G.s(.055),m.gloss('#5B6BD8'),[.07,-.03,.02]);b.name='frucht_beere';g.userData.fruits.push(b)})});

/* ================= Kompost-Extras ================= */
N('birke',{r:.3,h:4.4,size:'big',shake:true,planet:'kompost'},(g,m,o,rnd)=>{const bm=m.tex('birke',ctex('birke',64,256,(x,w,h)=>{x.fillStyle='#FBF8F0';x.fillRect(0,0,w,h);x.fillStyle='#3B3450';for(let i=0;i<22;i++){const y=i*12+(i%3)*3;x.fillRect((i*23)%50,y,10+(i%4)*5,3)}}),{rim:.35});
  const t=P(g,G.la([[0,0],[.3,0],[.22,.1],[.17,.5],[.14,2.6],[.1,3.2],[0,3.2]],Q(14)),bm);const col=o.color||'#9ED872';const sd=rnd()*9;
  [[0,3.4,0,.85],[.55,2.9,.15,.62],[-.5,3.05,-.1,.66],[.1,2.7,.55,.55],[-.15,3.95,.1,.55]].forEach(([x,y,z,r],i)=>cloud(g,m,i%2?shade(col,1.1):col,x,y,z,r,sd+i*1.4,[1,1.2,1]))});
N('weide',{r:.4,h:4,size:'big',planet:'kompost'},(g,m,o,rnd)=>{trunk(g,m,2.2,.28,'#8A6A4A');const col=o.color||'#8CC46A';const lm=m.c(col,{rim:.5,rimColor:'#f4ffc8'});
  cloud(g,m,col,0,3.1,0,1.25,rnd()*9,[1.1,.75,1.1]);for(let i=0;i<14;i++){const a=i/14*TAU+rnd()*.3;const r=1.05+rnd()*.2;const x=Math.cos(a)*r,z=Math.sin(a)*r;const L=RR(rnd,1.3,2);
    P(g,G.tu([[x*.8,3.1,z*.8],[x*1.05,2.6,z*1.05],[x*1.1,3.1-L,z*1.1]],.07,.03),lm);P(g,G.s(.08),m.c(shade(col,1.15)),[x*1.1,3.1-L,z*1.1],null,[1,1.4,1])}});
N('kirschbaum',{r:.35,h:3.8,size:'big',shake:true,planet:'kompost'},(g,m,o,rnd)=>{trunk(g,m,1.8,.24,'#7A5044');bt(g,[0,1.3,0],[.6,2.0,.1],.1,m.c('#7A5044'),.06);bt(g,[0,1.4,0],[-.55,2.1,0],.1,m.c('#7A5044'),.06);
  const cols=['#FFC2DA','#FFB0CE','#FFD6E6'];const sd=rnd()*9;[[0,2.6,0,1.1],[.8,2.3,.2,.8],[-.8,2.35,0,.82],[0,2.25,.75,.72],[.1,3.2,-.1,.75]].forEach(([x,y,z,r],i)=>cloud(g,m,cols[i%3],x,y,z,r,sd+i*2));
  range(10,(t,i)=>{const q=onBlob([0,2.5,.1],1.35,1,1.35,.8+(i%4)*.3,i*.63);blossom(g,m,'#FFFFFF',q.p,.18,5,q.n)});
  range(3,(t,i)=>{const q=onBlob([0,2.4,.1],1.3,.95,1.3,1.35+i*.1,i*2.1+.4);const f=fruit(g,m,'kirsche',[q.p[0],q.p[1]-.1,q.p[2]],.3);g.userData.fruits.push(f)})});
N('sonnenblume',{r:.2,h:1.6,size:'small',planet:'kompost'},(g,m,o,rnd)=>{const st=m.c('#5FAE55');P(g,G.tu([[0,0,0],[.05,.8,0],[0,1.45,.05]],.05,.035),st);both(s=>P(g,flatLeaf(leafShape(.35,.14),.025,.4),st,[0,.6+s*.1,0],[0,s>0?0:PI,0]));
  const f=grp(g,[0,1.48,.08],[-.25,0,0]);P(f,G.puff(flowerShape(16,.42,.15,true),.05),m.c('#FFD23A',{rim:.5}));P(f,G.cy(.18,.2,.1),m.c('#7A4A2A'),[0,0,.05],[PI/2,0,0]);eyes(f,m,.06,.04,.11,.035,.2)});
N('lavendel',{r:.3,h:.6,size:'small',planet:'kompost'},(g,m,o,rnd)=>{const st=m.c('#8FB07A');const fm=m.c('#A98BE8',{rim:.7,rimColor:'#ffffff'});for(let i=0;i<9;i++){const a=i*2.4,r=rnd()*.2;const tip=[Math.cos(a)*(r+.08),RR(rnd,.45,.62),Math.sin(a)*(r+.08)];
  P(g,G.tu([[Math.cos(a)*r*.4,0,Math.sin(a)*r*.4],tip],.012),st);range(4,(t,j)=>P(g,G.s(.035),fm,[tip[0],tip[1]-j*.045,tip[2]]))}P(g,G.blob(.2,.1,2,3),m.c('#8FB07A'),[0,.05,0],null,[1.3,.4,1.3])});
N('hortensienbusch',{r:.55,h:1,size:'mid',planet:'kompost'},(g,m,o,rnd)=>{bush(g,m,'#5FAE55',.9,rnd);const col=o.color||RP(rnd,['#A9C4FF','#D6A8FF','#FFB0D0']);range(6,(t,i)=>{const q=onBlob([0,.5,0],.62,.5,.58,.7+(i%3)*.3,i*1.05);
  const b=grp(g,q.p);range(7,(u,j)=>P(b,G.s(.07),m.c(j%2?col:shade(col,1.1),{rim:.6}),[Math.cos(j)*.08,Math.sin(j*1.7)*.05+.04,Math.sin(j)*.08]))})});
N('kokospalme_klein',{r:.25,h:2.4,size:'mid',shake:true,planet:'korallen'},(g,m,o,rnd)=>{const tm=m.c('#B8875A');range(6,(t,i)=>P(g,G.cy(.13-t*.03,.15-t*.03,.34),tm,[t*.12,.17+i*.32,0],[0,0,-.06]));
  const lm=m.c('#5FB36A',{rim:.5,rimColor:'#eaffb0'});for(let i=0;i<6;i++){const q=grp(g,[.72,2,0],[0,i/6*TAU,0]);P(q,flatLeaf(leafShape(1,.18),.03,.5),lm,[0,0,0],[0,0,-.25])}
  range(2,(t,i)=>{const f=fruit(g,m,'kokosnuss',[.72+Math.cos(i*3)*.12,1.85,Math.sin(i*3)*.12],.22);g.userData.fruits.push(f)})});

/* ================= Frost-Stern ================= */
N('schneetanne',{r:.4,h:4,size:'big',shake:true,planet:'frost'},(g,m,o,rnd)=>{pine(g,m,{color:'#4E9A8A',zapfen:true},rnd,1);[[.3,1.45,.62],[1.0,1.22,.56],[1.62,.98,.5],[2.18,.76,.44],[2.66,.56,.4]].forEach(([y,r,h])=>snowCap(g,m,y+h*.86,r*.72,1));
  P(g,G.s(.22),m.c('#FBFDFF',{rim:.8}),[0,3.9,0],null,[1,.7,1])});
N('winterbirke',{r:.28,h:4,size:'big',planet:'frost'},(g,m,o,rnd)=>{NATURE.birke.b(g,m,{color:'#E8F0FF'},rnd);range(3,(t,i)=>P(g,G.blob(.35,.1,2,i),m.c('#FBFDFF',{rim:.9}),[(i-1)*.5,3.9-(i%2)*.4,.2],null,[1,.35,1]))});
N('schneebusch',{r:.5,h:.8,size:'small',planet:'frost'},(g,m,o,rnd)=>{bush(g,m,'#5E9A7A',.8,rnd);P(g,G.blob(.55,.1,2,rnd()*9),m.c('#FBFDFF',{rim:.9}),[0,.78,0],null,[1.1,.35,1]);range(4,(t,i)=>P(g,G.s(.05),m.gloss('#E84D6A'),[Math.cos(i*1.6)*.55,.5,Math.sin(i*1.6)*.5]))});
N('gefrorener_busch',{r:.4,h:.7,size:'small',planet:'frost'},(g,m,o,rnd)=>{const im=m.c('#CFE8FF',{gloss:1.2,rim:1,rimColor:'#ffffff'});for(let i=0;i<9;i++){const a=i*2.4,l=RR(rnd,.4,.7);const tip=[Math.cos(a)*l*.6,l,Math.sin(a)*l*.6];
  P(g,G.tu([[0,0,0],[tip[0]*.4,tip[1]*.6,tip[2]*.4],tip],.035,.012),m.c('#9A8A9A'));crystal(g,m,tip,[tip[0],1,tip[2]],.05,.18,'#DDF2FF')}P(g,G.blob(.25,.1,2,2),m.c('#FBFDFF'),[0,.05,0],null,[1.4,.35,1.4])});
N('eisfels',{r:.7,h:1.3,size:'mid',planet:'frost'},(g,m,o,rnd)=>{const cols=['#BFE4FF','#9FD0F8','#DDF2FF'];range(5,(t,i)=>{const a=i*1.3+rnd();crystal(g,m,[Math.cos(a)*.3*t,0,Math.sin(a)*.3*t],[Math.cos(a)*.35,1,Math.sin(a)*.35],RR(rnd,.2,.32),RR(rnd,.7,1.3)*(1-t*.4),cols[i%3])});
  P(g,G.blob(.55,.1,2,4),m.c('#FBFDFF',{rim:.8}),[0,.05,0],null,[1.3,.3,1.3])});
N('eiszapfenfels',{r:.7,h:1.2,size:'mid',planet:'frost'},(g,m,o,rnd)=>{const c=ROCK.frost;P(g,G.blob(.7,.12,2,rnd()*9),m.c(c[1],{gloss:.3}),[0,.55,0],null,[1.2,.8,1]);P(g,G.blob(.62,.1,2,4),m.c('#FBFDFF',{rim:.9}),[0,1.05,0],null,[1.15,.3,1]);
  range(7,(t,i)=>{const a=i/7*TAU;P(g,G.co(.06,RR(rnd,.2,.38)),m.c('#DDF2FF',{gloss:1.3,rim:1}),[Math.cos(a)*.75,.85,Math.sin(a)*.62],[PI,0,0])})});
N('schneemann',{r:.45,h:1.6,size:'mid',planet:'frost'},(g,m,o,rnd)=>{const sm=m.c('#FBFDFF',{rim:.9,rimColor:'#dfefff'});P(g,G.s(.5),sm,[0,.45,0]);P(g,G.s(.36),sm,[0,1.05,0]);P(g,G.s(.26),sm,[0,1.5,0]);
  eyes(g,m,.09,1.56,.22,.04,.4);P(g,G.co(.05,.25),m.c('#FF8A3C'),[0,1.48,.34],[PI/2,0,0]);P(g,G.to(.27,.07),m.c('#F0556E'),[0,1.28,0],[PI/2,0,0]);P(g,G.bx(.12,.34,.06,.03),m.c('#F0556E'),[.15,1.12,.25],[0,0,.3]);
  P(g,G.cy(.2,.22,.06),m.c('#3B3450'),[0,1.74,0]);P(g,G.cy(.14,.16,.24),m.c('#3B3450'),[0,1.87,0]);range(3,(t,i)=>P(g,G.s(.04),m.c('#3B3450'),[0,.95+i*.1,.35-i*.02]));
  both(s=>P(g,G.tu([[s*.3,1.1,0],[s*.6,1.3,0],[s*.75,1.45,.05]],.03,.015),m.c('#8A5A3C')));P(g,G.to(.08,.015,PI),m.c('#3B3450'),[0,1.45,.24],[0,0,PI])});
N('schneehaufen',{r:.35,h:.3,size:'small',planet:'frost'},(g,m,o,rnd)=>{const sm=m.c('#FBFDFF',{rim:.9,rimColor:'#dfefff'});P(g,G.blob(.4,.1,2,rnd()*9),sm,[0,.1,0],null,[1.3,.5,1]);P(g,G.blob(.2,.1,2,rnd()*9),sm,[.3,.1,.2],null,[1,.6,1])});
N('iglu_klein',{r:.9,h:1.1,size:'mid',planet:'frost'},(g,m,o,rnd)=>{const sm=m.c('#F4F8FF',{rim:.6});P(g,G.hs(.95),sm,[0,0,0]);P(g,G.cy(.35,.4,.5,false),sm,[0,.28,.8],[PI/2,0,0]);P(g,G.circ(.28),m.c('#3B3450'),[0,.3,1.06]);
  range(4,(t,i)=>P(g,G.to(.95*Math.cos(t*.9),.012,PI),m.c('#C8D8F0'),[0,.95*Math.sin(t*.9),0],[0,0,0],[1,1,1]))});

/* ================= Dünen-Planet ================= */
N('saguaro',{r:.35,h:3,size:'big',planet:'wueste'},(g,m,o,rnd)=>{const cm=m.c('#6CB870',{rim:.6,rimColor:'#e8ffd0'});const rib=(r,h)=>{const geo=G.la([[0,0],[r,0],[r,h-r*.8],[r*.6,h-r*.2],[0,h]],Q(22));const p=geo.attributes.position;for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i));const k=1+Math.cos(a*8)*.06;p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k)}geo.computeVertexNormals();return geo};
  P(g,rib(.34,3),cm);both(s=>{const y=RR(rnd,1,1.6);const q=grp(g,[s*.3,y,0]);P(q,G.tu([[0,0,0],[s*.45,.05,0],[s*.55,.35,0]],.2,.18),cm);P(q,rib(.18,.9),cm,[s*.55,.3,0])});
  range(3,(t,i)=>{const f=grp(g,[Math.cos(i*2)*.15,3.02,Math.sin(i*2)*.15]);P(f,G.puff(flowerShape(6,.12,.04),.03),m.c('#FFF6E0',{rim:.6}),[0,0,0],[-PI/2,0,0]);P(f,G.s(.035),m.c('#FFD23A'),[0,.02,0])})});
N('feigenkaktus',{r:.45,h:1.3,size:'mid',shake:true,planet:'wueste'},(g,m,o,rnd)=>{const cm=m.c('#78C07A',{rim:.6,rimColor:'#e8ffd0'});const pad=(p,r,s)=>{P(g,G.s(.3),cm,p,r,[s,s*1.25,s*.35]);range(5,(t,i)=>P(g,G.s(.02),m.c('#FFF6D8'),[p[0]+Math.cos(i*1.3)*.15*s,p[1]+Math.sin(i*1.7)*.2*s,p[2]+.1*s]))};
  pad([0,.35,0],[0,0,0],1);pad([.3,.8,0],[0,0,-.5],.85);pad([-.3,.82,.05],[0,0,.5],.8);pad([.05,1.2,0],[0,0,.1],.7);
  [[.3,1.2,.05],[-.35,1.2,.1],[.08,1.58,.05]].forEach(p=>{const f=grp(g,p);P(f,G.s(.07),m.gloss('#E84D8A'),[0,0,0],null,[1,1.2,1]);f.name='frucht_kaktusfrucht';g.userData.fruits.push(f)})});
N('duenengras',{r:.25,h:.5,size:'tiny',planet:'wueste'},(g,m,o,rnd)=>{blades(g,m,'#C8C470',9,.5,.06,rnd,{w:.025,lean:1.3});P(g,G.blob(.14,.1,2,3),m.c('#D8B888'),[0,.03,0],null,[1.4,.35,1.4])});
N('tafelfels',{r:1.4,h:4,size:'big',planet:'wueste'},(g,m,o,rnd)=>{const c=ROCK.wueste;const layers=['#E9A06A','#D98A5A','#F2B88A','#D07A4E'];let y=0;
  for(let i=0;i<5;i++){const h=RR(rnd,.6,.95);const r=1.35-i*.08+RR(rnd,-.05,.05);const geo=G.cy(r*.97,r,h);const p=geo.attributes.position;for(let k=0;k<p.count;k++){const a=Math.atan2(p.getZ(k),p.getX(k));const f=1+Math.sin(a*5+i)*.05+Math.sin(a*11+i*2)*.03;p.setX(k,p.getX(k)*f);p.setZ(k,p.getZ(k)*f)}geo.computeVertexNormals();
    P(g,geo,m.c(layers[i%4],{rim:.3}),[0,y+h/2,0],[0,i,0]);y+=h}P(g,G.blob(.5,.1,2,3),m.c('#8FB86A'),[.3,y+.05,.2],null,[1.2,.3,1]);P(g,G.s(.3),m.c(c[1]),[1.2,.2,.6],null,[1,.7,1])});
N('totholz',{r:.3,h:2.6,size:'mid',planet:'wueste'},(g,m,o,rnd)=>{const w=m.c('#B89A7A',{rim:.4});P(g,G.tu([[0,0,0],[.1,1,0],[-.05,1.8,.05]],.2,.1),w);
  [[[-.05,1.4,0],[-.6,2,.1],[-.8,2.5,0]],[[.05,1.1,0],[.55,1.6,-.1],[.7,2.2,-.2]],[[-.05,1.8,.05],[.2,2.3,.1],[.1,2.6,.2]]].forEach(pts=>P(g,G.tu(pts,.08,.025),w));P(g,G.blob(.3,.1,2,5),m.c('#D8B888'),[0,.04,0],null,[1.5,.3,1.3])});
N('wuestenstein',{r:.35,h:.4,size:'small',planet:'wueste'},(g,m,o,rnd)=>{const c=ROCK.wueste;pebble(g,m,c[0],[0,.17,0],.36,rnd,.55);pebble(g,m,c[1],[.32,.08,.15],.16,rnd)});
N('oasenschilf',{r:.3,h:1.3,size:'small',planet:'wueste'},(g,m,o,rnd)=>{NATURE.schilf.b(g,m,{},rnd)});
N('knochen_deko',{r:.4,h:.4,size:'small',planet:'wueste'},(g,m,o,rnd)=>{const bm=m.bone();const sk=grp(g,[0,.22,0],[0,rnd()*3,0]);P(sk,G.s(.22),bm,[0,0,0],null,[1,.85,1.15]);P(sk,G.bx(.24,.1,.2,.04),bm,[0,-.14,.12]);
  both(s=>P(sk,G.s(.07),m.c('#6A5A58'),[s*.08,.03,.18],null,[1,1,.5]));both(s=>P(sk,G.tu([[s*.15,.05,-.05],[s*.35,.2,-.1],[s*.45,.4,.05]],.05,.02),bm));
  P(g,G.tu([[.4,.05,.2],[.7,.06,.35]],.035),bm);both(s=>P(g,G.s(.05),bm,[.4+(s>0?.3:0),.06,.2+(s>0?.15:0)]))});
N('rollbusch',{r:.4,h:.7,size:'small',planet:'wueste'},(g,m,o,rnd)=>{const w=m.c('#C8A070',{rim:.4});for(let i=0;i<16;i++){const a=rnd()*TAU,b=rnd()*PI;const d=[Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)];
  P(g,G.tu([[d[0]*.1,.35+d[1]*.1,d[2]*.1],[d[0]*.25+.03,.35+d[1]*.25,d[2]*.25],[d[0]*.36,.35+d[1]*.34,d[2]*.36]],.018,.008),w)}});
N('wuestenblume',{r:.12,h:.35,size:'tiny',planet:'wueste'},(g,m,o,rnd)=>flower(g,m,'kosmee',o.color||'#FF8FB8',.8,rnd));

/* ================= Sporen-Mond ================= */
N('pilzbaum',{r:.6,h:5,size:'big',shake:true,planet:'pilz'},(g,m,o,rnd)=>{const cap=o.color||RP(rnd,['#B070E0','#7FB8F0','#E878B8']);const r=shroom(g,m,[0,0,0],1.6,cap,{tall:1.4,stem:'#E8DCF8',gill:'#7FF7E8',nd:9,
    dotMat:m.glow('#DFFFF8',1.6),wavy:true});markGlow(g,r.q.children[2]);
  range(4,(t,i)=>{const a=i*1.6;const q=grp(g,[Math.cos(a)*.62,.5+i*.35,Math.sin(a)*.62],[0,-a,0]);P(q,G.hs(.25),m.c('#FFB8E6',{rim:.6}),[0,0,0],[0,0,-PI/2],[1,.35,1])});
  range(3,(t,i)=>{const f=grp(g,[Math.cos(i*2.1)*1.6,3.6,Math.sin(i*2.1)*1.6]);P(f,G.s(.13),m.glow('#9FFFE8',1.8),[0,0,0]);f.name='frucht_leuchtspore';g.userData.fruits.push(f)})});
N('leuchtpilzgruppe',{r:.3,h:.7,size:'small',planet:'pilz'},(g,m,o,rnd)=>glowShroomCluster(g,m,{color:o.color||RP(rnd,['#7FF7E8','#FFB8F0','#C8A8FF'])},rnd,1));
N('sporenkugel',{r:.35,h:.6,size:'small',planet:'pilz'},(g,m,o,rnd)=>{const c=RP(rnd,['#F2E2C8','#E8D8F8','#D8F0E0']);P(g,G.s(.32),m.c(c,{rim:.9,rimColor:'#ffffff'}),[0,.3,0],null,[1,.9,1]);range(8,(t,i)=>{const q=onBlob([0,.3,0],.32,.29,.32,.4+(i%3)*.4,i*.8);P(g,G.s(.03),m.c(shade(c,.85)),q.p)});
  P(g,G.s(.14),m.c(c),[.35,.14,.1]);range(4,(t,i)=>markGlow(g,P(g,G.s(.025),m.glow('#FFF6D0',1.8),[RR(rnd,-.3,.3),.7+i*.12,RR(rnd,-.2,.2)])))});
N('pilzranke',{r:.3,h:1.2,size:'small',planet:'pilz'},(g,m,o,rnd)=>{const vm=m.c('#8E7AC8',{rim:.6});const pts=range(10,(t)=>[Math.sin(t*6)*.2,t*1.1,Math.cos(t*6)*.2]);P(g,G.tu(pts,.05,.02),vm);
  range(4,(t,i)=>{const p=pts[2+i*2];shroom(g,m,[p[0],p[1],p[2]],.06,'#7FF7E8',{rot:[0,i,1.2],dots:false})})});
N('moorgras',{r:.3,h:.6,size:'tiny',planet:'pilz'},(g,m,o,rnd)=>{blades(g,m,o.planet==='pilz'?'#7FB8A0':'#7FAE63',10,.6,.08,rnd,{w:.03});range(3,(t,i)=>{P(g,G.s(.05),m.c('#FFFBF0',{rim:1}),[RR(rnd,-.15,.15),.62+rnd()*.1,RR(rnd,-.15,.15)],null,[.8,1.3,.8])})});
N('sporenblume',{r:.18,h:.6,size:'tiny',planet:'pilz'},(g,m,o,rnd)=>{const col=o.color||RP(rnd,['#FFB8F0','#9FFFE8','#FFE27A']);const st=m.c('#7FA890');P(g,G.tu([[0,0,0],[.04,.3,0],[0,.55,.03]],.02),st);
  const b=markGlow(g,P(g,G.s(.1),m.glow(col,1.4),[0,.58,.03],null,[1,1.3,1]));range(5,(t,i)=>P(g,G.puff(leafShape(.14,.05),.015),m.c(shade(col,.85),{rim:.8}),[0,.5,.03],[0,i*1.25,-.7]))});
N('schwammfels',{r:.7,h:1.2,size:'mid',planet:'pilz'},(g,m,o,rnd)=>{const c=ROCK.pilz;P(g,G.blob(.7,.14,2.4,rnd()*9),m.c(c[0],{rim:.4}),[0,.55,0],null,[1.15,.85,1]);range(9,(t,i)=>{const q=onBlob([0,.55,0],.8,.6,.7,.5+(i%3)*.5,i*.9);P(g,G.s(.08),m.c('#5A4A78'),q.p,null,[1,1,.4])});
  range(3,(t,i)=>shroom(g,m,[-.4+i*.35,1.05,.1],.08,'#7FF7E8',{dots:false,rot:[0,i,0]}))});

/* ================= Neue Sammelsachen ================= */
IT('unkraut',itMeta('Unkraut','alle','material',10),(g,m)=>{blades(g,m,'#5FAE55',8,.6,.08,srand(4),{w:.05});P(g,G.blob(.14,.1,2,2),m.c('#8A5A44'),[0,.04,0],null,[1.2,.6,1.2])});
IT('kiefernzapfen',itMeta('Kiefernzapfen','frost','material',30),(g,m)=>{const zm=m.c('#A0704C',{rim:.4});P(g,G.s(.2),zm,[0,.3,0],null,[1,1.5,1]);range(18,(t,i)=>{const y=(t-.5)*.5,r=Math.sqrt(1-Math.pow(t*2-1,2)*.8)*.22,a=i*2.4;P(g,G.s(.08),zm,[Math.cos(a)*r,.3+y,Math.sin(a)*r],null,[1,.4,.8])})});
IT('eiskristall',itMeta('Eiskristall','frost','material',250),(g,m)=>{range(6,(t,i)=>{const a=i/6*TAU;const q=grp(g,[0,.45,0],[0,0,a]);P(q,G.bx(.05,.4,.05,.02),m.c('#CFEFFF',{gloss:1.3,rim:1}),[0,.2,0]);both(s=>P(q,G.bx(.035,.14,.035,.012),m.c('#CFEFFF',{gloss:1.3,rim:1}),[s*.06,.28,0],[0,0,s*.7]))})});
IT('schneeball',itMeta('Schneeball','frost','material',20),(g,m)=>{P(g,G.blob(.3,.08,2,3),m.c('#FBFDFF',{rim:.9,rimColor:'#dfefff'}),[0,.3,0])});
IT('kaktusfrucht',itMeta('Kaktusfeige','wueste','frucht',180),(g,m)=>{P(g,G.s(.3),m.gloss('#E84D8A'),[0,.35,0],null,[1,1.25,1]);range(6,(t,i)=>P(g,G.s(.025),m.c('#FFF0B8'),[Math.cos(i)*.27,.3+Math.sin(i*2)*.15,Math.sin(i)*.27]));P(g,G.cy(.08,.1,.06),m.c('#78C07A'),[0,.72,0])});
IT('wuestenrose',itMeta('Wüstenrose','wueste','material',400),(g,m)=>{range(8,(t,i)=>{const a=i*2.4;P(g,G.cy(.22,.22,.03),m.c(i%2?'#E9B28A':'#F2C8A0',{rim:.5}),[Math.cos(a)*.12,.2+(i%3)*.1,Math.sin(a)*.12],[RR(srand(i),-.8,.8),a,RR(srand(i+3),-.8,.8)])})});
IT('fliegenpilz_item',itMeta('Fliegenpilz','pilz','pilz',160),(g,m)=>{shroom(g,m,[0,0,0],.3,'#E8505B',{nd:6})});
IT('champignon',itMeta('Champignon','kompost','pilz',90),(g,m)=>{shroom(g,m,[0,0,0],.3,'#F2E2C8',{dots:false,gill:'#C9A88A'})});
IT('morchel',itMeta('Morchel','kompost','pilz',300),(g,m)=>{P(g,G.cy(.12,.14,.3),m.c('#F2E2C8'),[0,.15,0]);const cm=m.c('#A07A50',{rim:.4});P(g,G.s(.2),cm,[0,.48,0],null,[1,1.4,1]);range(14,(t,i)=>{const q=onBlob([0,.48,0],.2,.28,.2,.3+(i%4)*.55,i*1.2);P(g,G.s(.05),m.c('#6A4A30'),q.p,null,[1,1,.4])})});
IT('leuchtspore',itMeta('Leuchtspore','pilz','material',140),(g,m)=>{const s=P(g,G.s(.22),m.glow('#9FFFE8',1.6),[0,.3,0]);P(g,G.s(.3),m.c('#DFFFF8',{opacity:.35,rim:1.2}),[0,.3,0])});
IT('feder',itMeta('Feder','alle','material',40),(g,m)=>{const q=grp(g,[0,.05,0],[-PI/2,0,.3]);P(q,G.puff(leafShape(.8,.18),.02),m.c('#8FD3FF',{rim:.8}),[-.4,0,0]);bt(q,[-.45,0,0],[.45,0,0],.012,m.c('#FFFBF0'))});
IT('beeren',itMeta('Beeren','kompost','frucht',60),(g,m)=>{range(5,(t,i)=>P(g,G.s(.12),m.gloss(i%2?'#5B6BD8':'#8E5AD0'),[Math.cos(i*1.3)*.13,.12+(i===4?.15:0),Math.sin(i*1.3)*.13]))});
IT('blatt_herbst',itMeta('Herbstblatt','kompost','material',15),(g,m)=>{P(g,flatLeaf(leafShape(.7,.3),.03,.4),m.c('#F2A23C',{rim:.6}),[-.35,.05,0]);bt(g,[-.5,.05,0],[-.35,.06,0],.02,m.c('#A0704C'))});

/* ================= Fische ================= */
const pat=(fn)=>fn;
/* --- Frost-Stern: Eissee --- */
F('eisforelle',fishMeta('Eisforelle','frost','eissee','M','immer',1,200,'Ich hab eine Eisforelle gefangen! Die hat Frostschutz im Blut, ich hab nur kalte Füsse.','Manche Fische in Polarmeeren haben Frostschutz-Eiweisse im Blut, die Eiskristalle am Wachsen hindern. So bleiben sie bei Minusgraden flüssig – quasi Winterreifen von innen.'),
  (g,m)=>fishT(g,m,{id:'eisforelle',H:.2,back:'#8FB8E0',belly:'#F4F8FF',fin:'#BFD8FF',dorsal:'std',pat:(x,w,h,r)=>FT.spots(x,w,h,'#E8F4FF',22,3,6,r,.2,.45,.1,.9)}));
F('polarlachs',fishMeta('Polarlachs','frost','eissee','L','tag',2,600,'Ich hab einen Polarlachs gefangen! Rosa wie ein Sonnenuntergang auf Schnee.','Lachse wandern tausende Kilometer zurück in den Fluss, in dem sie geschlüpft sind, und finden ihn am Geruch. Ihr rosa Fleisch kommt von Krebstierchen, die sie fressen.'),
  (g,m)=>fishT(g,m,{id:'polarlachs',L:.84,H:.19,back:'#7A8AB0',belly:'#FFB8B0',fin:'#9FA8C8',dorsal:'std',pat:(x,w,h,r)=>FT.spots(x,w,h,'#4A5A80',18,2,4,r,.2,.4,.1,.6)}));
F('eisfisch',fishMeta('Eisfisch','frost','eissee','M','nacht',3,1100,'Ich hab einen Eisfisch gefangen! Durchsichtig wie ein Eiswürfel mit Gefühlen.','Echte Eisfische aus der Antarktis haben kein Hämoglobin und darum farbloses Blut. Das kalte Wasser speichert so viel Sauerstoff, dass es trotzdem reicht.'),
  (g,m)=>{fishT(g,m,{id:'eisfisch',H:.16,L:.8,mat:m.c('#DDF2FF',{opacity:.72,gloss:1.3,rim:1.2}),fin:'#EAF8FF',dorsal:'long',tail:'round'})});
F('pinguinfisch',fishMeta('Pinguin-Fisch','frost','eissee','S','immer',1,120,'Ich hab einen Pinguin-Fisch gefangen! Trägt Frack zum Schwimmen. Stilvoll.','Pinguine sind Vögel, die unter Wasser fliegen. Dieser kleine Fisch hat sich ihre Farben abgeschaut: dunkel von oben, hell von unten – so ist er von oben und unten schwer zu sehen.'),
  (g,m)=>fishT(g,m,{id:'pinguinfisch',H:.24,tp:.5,back:'#3B3450',belly:'#FFFDF7',fin:'#FFB02E',dorsal:'tri',tail:'round'}));
F('schneeflocken_barsch',fishMeta('Schneeflocken-Barsch','frost','eissee','M','tag',2,450,'Ich hab einen Schneeflocken-Barsch gefangen! Kein Muster gleicht dem anderen.','Kein Schneekristall gleicht dem anderen, weil jeder auf seinem Fall durch die Wolke andere Temperaturen erlebt. Dieser Barsch trägt das Muster als Tarnung unter dem Eis.'),
  (g,m)=>fishT(g,m,{id:'schneeflocken_barsch',H:.22,back:'#6FA8E0',belly:'#EAF4FF',fin:'#FFFFFF',dorsal:'spiky',pat:(x,w,h,r)=>FT.spots(x,w,h,'#FFFFFF',16,4,7,r,.2,.48,.1,.9)}));
F('narwal_mini',fishMeta('Mini-Narwal','frost','eissee','L','nacht',4,3200,'Ich hab einen Mini-Narwal gefangen! Das Einhorn des Meeres, nur in handlich.','Der Stosszahn des Narwals ist ein Zahn mit Millionen Nervenenden. Er spürt damit Salzgehalt und Temperatur des Wassers – eine Antenne aus Knochen.'),
  (g,m)=>{const f=fishT(g,m,{id:'narwal_mini',L:.82,H:.22,W:.8,back:'#9AA8C0',belly:'#F2F4FA',fin:'#8A98B0',dorsal:'none',tail:'moon',pat:(x,w,h,r)=>FT.spots(x,w,h,'#6A7890',30,2,5,r,.2,.48,.05,.95)});
    P(g,G.tu(range(10,(t)=>[Math.sin(t*20)*.004,0,f.nz+t*.45]),.03,.006),m.c('#FFF6E0',{gloss:1}))});
F('frostqualle',fishMeta('Frostqualle','frost','eissee','S','nacht',3,900,'Ich hab eine Frostqualle gefangen! Sie leuchtet wie eine Nachttischlampe aus Eis.','Viele Quallen leuchten selbst: Biolumineszenz. Im dunklen Polarwasser kann Licht Beute anlocken oder Feinde erschrecken.'),
  (g,m)=>{const bm=m.c('#BFD8FF',{opacity:.7,gloss:1.2,rim:1.2});const q=grp(g,[0,0,0],[-.6,0,0]);P(q,G.hs(.3),bm,[0,0,0],null,[1,.9,1]);markGlow(g,P(q,G.s(.12),m.glow('#9FE8FF',1.6),[0,.08,0]));
    range(6,(t,i)=>{const a=i/6*TAU;P(q,G.tu([[Math.cos(a)*.2,0,Math.sin(a)*.2],[Math.cos(a)*.22,-.3,Math.sin(a)*.22],[Math.cos(a)*.18,-.55,Math.sin(a)*.18]],.025,.008),bm)})});
F('eisbaer_wels',fishMeta('Eisbär-Wels','frost','eissee','XL','nacht',5,9000,'Ich hab einen Eisbär-Wels gefangen! Flauschig UND glitschig. Die Natur ist verwirrt.','Welse spüren mit ihren Barteln Geschmack – ihr ganzer Körper ist mit Geschmacksknospen bedeckt. Dieser hier hat sich zusätzlich einen Wintermantel wachsen lassen.'),
  (g,m)=>{const f=fishT(g,m,{id:'eisbaer_wels',L:.86,H:.2,W:.95,tp:.4,back:'#F2F4FA',belly:'#FFFFFF',fin:'#DDE4F0',dorsal:'std',nose:.3,mat:m.plush('#F2F4FA')});both(s=>P(g,G.tu([[s*.08,-.05,f.nz-.03],[s*.2,-.1,f.nz+.05],[s*.26,-.18,f.nz+.02]],.012,.005),m.c('#8A98B0')))});
/* --- Dünen-Planet: Oase --- */
F('oasen_karpfen',fishMeta('Oasen-Karpfen','wueste','oase','M','immer',1,180,'Ich hab einen Oasen-Karpfen gefangen! Der hat die ganze Wüste für sich allein.','In Wüstenoasen leben oft Fische, die seit Jahrtausenden isoliert sind. Manche Arten gibt es nur in einer einzigen Quelle auf der ganzen Welt.'),
  (g,m)=>fishT(g,m,{id:'oasen_karpfen',H:.24,back:'#D8A860',belly:'#FFF0C8',fin:'#E8904A',dorsal:'long',pat:(x,w,h,r)=>FT.bands(x,w,h,'#C8903A',[.3,.5,.7],6)}));
F('wuestenkaerpfling',fishMeta('Wüstenkärpfling','wueste','oase','S','tag',3,700,'Ich hab einen Wüstenkärpfling gefangen! Der überlebt Wasser, in dem man Eier kochen könnte. Fast.','Wüstenkärpflinge halten Wassertemperaturen über 40 °C und sehr salziges Wasser aus. Einige Arten leben in einer einzigen, winzigen Quelle.'),
  (g,m)=>fishT(g,m,{id:'wuestenkaerpfling',H:.2,back:'#5A8AD8',belly:'#FFE0A0',fin:'#FFB02E',dorsal:'hi',tail:'round'}));
F('sandflunder',fishMeta('Sandflunder','wueste','oase','M','immer',2,380,'Ich hab eine Sandflunder gefangen! Flach wie ein Pfannkuchen, schlau wie ein Sandkorn.','Plattfische schlüpfen symmetrisch. Während sie wachsen, wandert ein Auge auf die andere Kopfseite, und sie legen sich flach auf den Boden.'),
  (g,m)=>{fishT(g,m,{id:'sandflunder',L:.72,H:.28,W:.28,tp:.5,back:'#E0C08A',belly:'#FFF4DC',fin:'#D8B07A',dorsal:'long',anal:'long',pat:(x,w,h,r)=>FT.spots(x,w,h,'#B8905A',30,3,6,r,.2,.48,.05,.95)})});
F('kaktus_stachler',fishMeta('Kaktus-Stachler','wueste','oase','S','tag',2,420,'Ich hab einen Kaktus-Stachler gefangen! Nicht umarmen.','Stichlinge stellen bei Gefahr ihre Rückenstacheln auf. Männchen bauen Nester aus Pflanzenteilen und bewachen die Eier.'),
  (g,m)=>{const f=fishT(g,m,{id:'kaktus_stachler',H:.2,back:'#6CB870',belly:'#F2FFE0',fin:'#FF8FB8',dorsal:'spiky'});range(6,(t,i)=>P(g,G.co(.012,.06),m.c('#FFF6D8'),[0,f.at(.3+t*.4).r*.9,f.at(.3+t*.4).z]))});
F('goldener_mirage',fishMeta('Fata-Morgana-Fisch','wueste','oase','M','tag',5,8000,'Ich hab einen Fata-Morgana-Fisch gefangen! Moment … ist der echt?','Luftspiegelungen entstehen, wenn Licht durch unterschiedlich warme Luftschichten gebrochen wird. Dieser Fisch schimmert je nach Blickwinkel in allen Farben.'),
  (g,m)=>fishT(g,m,{id:'goldener_mirage',H:.22,tail:'fancy',ts:1.2,dorsal:'long',mat:m.holo(),fin:'#FFE27A'}));
F('dattel_wels',fishMeta('Dattel-Wels','wueste','oase','L','nacht',3,1300,'Ich hab einen Dattel-Wels gefangen! Süss aussehend, aber nicht zum Essen gedacht.','Viele Welse sind nachtaktiv und finden Futter mit ihren Barteln statt mit den Augen.'),
  (g,m)=>{const f=fishT(g,m,{id:'dattel_wels',L:.84,H:.19,W:.9,tp:.35,nose:.3,back:'#8A5A3C',belly:'#D8B888',fin:'#6A4430',dorsal:'std'});both(s=>P(g,G.tu([[s*.07,-.04,f.nz-.03],[s*.2,-.1,f.nz+.04]],.01,.005),m.c('#4A3024')))});
F('oasen_neon',fishMeta('Oasen-Neon','wueste','oase','S','nacht',2,300,'Ich hab einen Oasen-Neon gefangen! Eine schwimmende Leuchtreklame.','Neonfische schillern durch winzige Kristalle in der Haut, die das Licht spiegeln – es ist Struktur, keine Farbe.'),
  (g,m)=>fishT(g,m,{id:'oasen_neon',H:.16,back:'#3B3450',belly:'#FF6A7A',fin:'#FFFBF0',dorsal:'std',pat:(x,w,h,r)=>FT.stripe(x,w,h,'#5AE8FF',14,.15,.85,.3)}));
/* --- Sporen-Mond: Sumpf --- */
F('leucht_aal',fishMeta('Leucht-Aal','pilz','sumpf','L','nacht',3,1200,'Ich hab einen Leucht-Aal gefangen! Endlich Licht im Sumpf.','Einige Tiefseefische und Aale besitzen Leuchtorgane, in denen Bakterien Licht erzeugen – eine Wohngemeinschaft aus Tier und Mikrobe.'),
  (g,m)=>{fishT(g,m,{id:'leucht_aal',L:.95,H:.1,W:.9,tr:.5,nose:.7,back:'#4A3A78',belly:'#8FF7E8',fin:'#7FF7E8',dorsal:'long',tail:'none',pat:(x,w,h,r)=>FT.spots(x,w,h,'#9FFFE8',30,3,5,r,.25,.45,.05,.95)})});
F('sporen_quappe',fishMeta('Sporen-Quappe','pilz','sumpf','S','immer',1,150,'Ich hab eine Sporen-Quappe gefangen! Halb Kaulquappe, halb Pilz, ganz niedlich.','Kaulquappen atmen mit Kiemen und verwandeln sich später in Frösche mit Lungen. Diese hier wächst dabei ein kleines Pilzhütchen.'),
  (g,m)=>{const f=fishT(g,m,{id:'sporen_quappe',L:.6,H:.24,W:1,tp:.75,tr:.05,back:'#6A5A98',belly:'#C8B8F0',fin:'#8A7AC8',dorsal:'none',anal:false,pect:false,tail:'spade'});shroom(g,m,[0,f.at(.8).r*.8,f.at(.8).z],.08,'#E878B8',{nd:3})});
F('moor_karausche',fishMeta('Moor-Karausche','pilz','sumpf','M','tag',1,220,'Ich hab eine Moor-Karausche gefangen! Die liebt Schlamm mehr als ich Schokolade.','Karauschen überleben den Winter in sauerstoffarmem Wasser, indem sie Zucker ohne Sauerstoff zu Alkohol umbauen. Kein Scherz.'),
  (g,m)=>fishT(g,m,{id:'moor_karausche',H:.26,tp:.5,back:'#7A9A68',belly:'#E8E0B0',fin:'#8AA878',dorsal:'hi'}));
F('pilzwels',fishMeta('Pilz-Wels','pilz','sumpf','L','nacht',3,1400,'Ich hab einen Pilz-Wels gefangen! Er hat Pilze auf dem Rücken. Oder die Pilze haben ihn.','Pilze leben oft in Symbiose mit anderen Lebewesen. Flechten zum Beispiel sind Pilz und Alge zugleich – ein Paradebeispiel für Make Kin.'),
  (g,m)=>{const f=fishT(g,m,{id:'pilzwels',L:.84,H:.2,W:.9,tp:.35,nose:.3,back:'#5A4A70',belly:'#B8A8D0',fin:'#4A3A60',dorsal:'none'});range(3,(t,i)=>shroom(g,m,[0,f.at(.4+t*.3).r*.85,f.at(.4+t*.3).z],.06,['#FFB8F0','#7FF7E8','#FFE27A'][i],{dots:false}))});
F('glitzer_guppy',fishMeta('Glitzer-Guppy','pilz','sumpf','S','nacht',2,280,'Ich hab einen Glitzer-Guppy gefangen! Party im Sumpf.','Guppy-Männchen sind bunt, um Weibchen zu beeindrucken – aber auffällige Farben locken auch Räuber an. Ein ständiger Balanceakt.'),
  (g,m)=>fishT(g,m,{id:'glitzer_guppy',H:.18,back:'#FFB8F0',belly:'#FFF0FA',fin:'#9FFFE8',tail:'fancy',ts:1.3,dorsal:'hi'}));
F('mondfrosch_fisch',fishMeta('Mond-Grundel','pilz','sumpf','M','immer',2,480,'Ich hab eine Mond-Grundel gefangen! Sie guckt, als hätte sie Fragen.','Grundeln leben am Boden und können manchmal sogar kurze Strecken über Land hüpfen. Sie haben grosse Augen oben am Kopf.'),
  (g,m)=>{const f=fishT(g,m,{id:'mondfrosch_fisch',H:.2,W:.9,tp:.4,back:'#9A8AC0',belly:'#F2EAFA',fin:'#B8A8E0',dorsal:'std',eye:.075,eyeY:.55})});
F('sumpf_hecht',fishMeta('Sporen-Hecht','pilz','sumpf','XL','nacht',4,4200,'Ich hab einen Sporen-Hecht gefangen! Der Boss vom Sporensee.','Hechte lauern bewegungslos im Schilf und schiessen blitzschnell los. Sie sind wichtig für ein gesundes Gewässer, weil sie kranke Fische fressen.'),
  (g,m)=>fishT(g,m,{id:'sumpf_hecht',L:.9,H:.12,W:.8,tp:.5,tr:.35,nose:.9,back:'#4A7A6A',belly:'#DFF0E0',fin:'#7FDCC8',dorsal:'std',dz:.24,pat:(x,w,h,r)=>FT.spots(x,w,h,'#9FFFE8',26,3,6,r,.2,.46,.12,.95)}));
F('pilzkoi',fishMeta('Pilz-Koi','pilz','sumpf','M','tag',3,1600,'Ich hab einen Pilz-Koi gefangen! Rote Punkte wie ein Fliegenpilz. Bitte nicht essen.','Kois werden in Japan seit Jahrhunderten gezüchtet und können über 50 Jahre alt werden. Der Pilz-Koi ist die Sporen-Mond-Variante.'),
  (g,m)=>fishT(g,m,{id:'pilzkoi',H:.2,back:'#FFFBF0',belly:'#FFFBF0',fin:'#FFE2D0',tail:'fancy',ts:1.15,dorsal:'long',pat:(x,w,h,r)=>{FT.blobs(x,w,h,'#E8505B',6,14,26,r,.1,.85)}}));

/* ================= Insekten ================= */
/* --- Frost --- */
B('schneefloh',bugMeta('Schneefloh','frost','boden','tag',1,120,'Ich hab einen Schneefloh gefangen! Hüpft durch den Winter wie ein Konfetti.','Schneeflöhe sind eigentlich Springschwänze, winzige Urinsekten. Sie sind im Winter aktiv und hüpfen mit einer Sprunggabel am Hinterleib.'),
  (g,m)=>{const bm=m.c('#5A6AA8',{gloss:.8});P(g,G.ca(.15,.35),bm,[0,.2,0],[PI/2,0,0]);P(g,G.s(.15),bm,[0,.22,.3]);bugFace(g,m,[0,.22,.3],.14,.5,{mouth:false});legs(g,bm,[[.15,.2,.05],[0,.22,0],[-.15,.2,-.05]],.15);feelers(g,bm,bm,[.03,.3,.4],.18,.1)});
B('eisfalter',bugMeta('Eisfalter','frost','luft','tag',3,900,'Ich hab einen Eisfalter gefangen! Seine Flügel sehen aus wie Frost am Fenster.','Manche Falter überwintern als erwachsene Tiere und frieren dabei fast ein. Sie bilden Frostschutzmittel im Körper, ähnlich wie Autos.'),
  (g,m)=>butterfly(g,m,'eisfalter',x=>{x.fillStyle='#CFE8FF';x.fillRect(0,0,1,1);x.strokeStyle='#FFFFFF';x.lineWidth=.03;for(let i=0;i<7;i++){x.beginPath();x.moveTo(0,0);x.lineTo(1,i/6);x.stroke()}},x=>{x.fillStyle='#A8C8F0';x.fillRect(-1,-1,3,3)},'#5A6AA8'));
B('frostkaefer',bugMeta('Frostkäfer','frost','stein','nacht',2,400,'Ich hab einen Frostkäfer gefangen! Er trägt einen Panzer aus Raureif.','Viele Käfer überwintern unter Steinen oder Rinde. Sie senken ihren Stoffwechsel so weit ab, dass sie monatelang ohne Nahrung auskommen.'),
  (g,m)=>{const k=m.c('#3B4A78',{gloss:.8});shellDome(g,m,'#9FD0F8',[0,.22,-.05],.3,1.2,{mat:m.c('#BFE4FF',{gloss:1.3,rim:1})});P(g,G.s(.14),k,[0,.18,.3]);bugFace(g,m,[0,.17,.33],.13,.5,{mouth:false});legs(g,k,[[.18,.28,.06],[.02,.32,0],[-.14,.3,-.06]],.14);feelers(g,k,k,[.04,.24,.4],.14,.08)});
B('schneeeule_motte',bugMeta('Schnee-Eulenfalter','frost','luft','nacht',2,500,'Ich hab einen Schnee-Eulenfalter gefangen! Flauschig wie eine Mütze.','Eulenfalter sind nachtaktive Motten mit dichtem Haarkleid, das sie in kalten Nächten warm hält.'),
  (g,m)=>butterfly(g,m,'schneeule',x=>{x.fillStyle='#F2F0FA';x.fillRect(0,0,1,1);x.fillStyle='#B8B0D0';x.beginPath();x.arc(.55,.5,.14,0,TAU);x.fill()},x=>{x.fillStyle='#E0DCF0';x.fillRect(-1,-1,3,3)},'#DDD8F0'));
B('gletscher_spinne',bugMeta('Gletscherspinne','frost','stein','immer',3,700,'Ich hab eine Gletscherspinne gefangen! Acht Beine, alle mit Schneeschuhen.','Gletscherspinnen jagen auf Eis nach Insekten, die der Wind aus dem Tal heraufweht. Ein Buffet, das vom Himmel fällt.'),
  (g,m)=>{const k=m.c('#6A7AA8',{gloss:.6});P(g,G.s(.2),k,[0,.22,-.1],null,[1,.85,1.2]);P(g,G.s(.13),k,[0,.2,.15]);bugFace(g,m,[0,.2,.18],.12,.5,{mouth:false});legs(g,k,[[.2,.4,.12],[.08,.44,.04],[-.06,.44,-.04],[-.2,.4,-.12]],.2,.018)});
B('eiszikade',bugMeta('Eiszikade','frost','baum','tag',2,350,'Ich hab eine Eiszikade gefangen! Die zirpt in Moll.','Zikaden erzeugen ihren Gesang mit Trommelorganen am Hinterleib. Manche Arten sind so laut wie ein Rasenmäher.'),
  (g,m)=>{const k=m.c('#5A7A9A',{gloss:.8});P(g,G.ca(.13,.4),k,[0,.2,0],[PI/2,0,0]);P(g,G.s(.15),k,[0,.22,.3]);bugFace(g,m,[0,.22,.32],.14,.7,{mouth:false});wingPair(g,m,m.c('#DDF2FF',{opacity:.6,rim:1}),WING.fore,[0,.3,.1],.45,.2,-.3,.02);legs(g,k,[[.12,.2,.05],[0,.22,0],[-.12,.2,-.05]],.14)});
/* --- Wüste --- */
B('skorpion',bugMeta('Skorpion','wueste','stein','nacht',3,1200,'Ich hab einen Skorpion gefangen! Vorsichtig halten, er ist nervöser als ich.','Skorpione leuchten unter UV-Licht türkis. Niemand weiss genau warum – vielleicht als eingebautes Sonnenbrillen-System.'),
  (g,m)=>{const k=m.c('#C8904A',{gloss:.8});P(g,G.s(.22),k,[0,.18,0],null,[1,.55,1.4]);P(g,G.s(.12),k,[0,.18,.28]);bugFace(g,m,[0,.19,.32],.11,.5,{mouth:false});
    P(g,G.tu(range(8,(t)=>[0,.18+Math.sin(t*2.6)*.4,-.25-Math.sin(t*1.4)*.3+t*.2]),.06,.03),k);P(g,G.co(.03,.08),m.c('#8A5A30'),[0,.52,.12],[.9,0,0]);
    both(s=>{P(g,G.tu([[s*.12,.16,.3],[s*.25,.16,.45],[s*.22,.16,.58]],.03,.025),k);P(g,G.s(.06),k,[s*.22,.16,.6],null,[1,.7,1.3])});legs(g,k,[[.15,.32,.05],[.02,.34,0],[-.12,.3,-.05]],.13)});
B('mistkaefer',bugMeta('Mistkäfer','wueste','boden','tag',1,200,'Ich hab einen Mistkäfer gefangen! Er rollt seine Träume vor sich her.','Pillendreher orientieren sich an der Milchstrasse, um ihre Kugel geradeaus zu rollen. Sie waren im alten Ägypten heilig.'),
  (g,m)=>{const k=m.c('#3A5A8A',{gloss:1.1});shellDome(g,m,'#2A4A7A',[0,.22,-.05],.28,1.1);P(g,G.s(.14),k,[0,.18,.28]);bugFace(g,m,[0,.17,.31],.13,.5,{mouth:false});legs(g,k,[[.18,.28,.06],[.02,.32,0],[-.14,.3,-.06]],.14);P(g,G.s(.25),m.c('#8A6A48',{rim:.3}),[0,.25,.72])});
B('sandlaeufer',bugMeta('Sandläufer','wueste','boden','tag',2,350,'Ich hab einen Sandläufer gefangen! Der ist schneller als meine Ausreden.','Wüstenkäfer laufen auf langen Beinen, damit ihr Körper weit über dem heissen Sand bleibt. Manche sammeln Nebeltropfen auf dem Rücken zum Trinken.'),
  (g,m)=>{const k=m.c('#D8B070',{gloss:.6});P(g,G.s(.18),k,[0,.3,-.05],null,[1,.7,1.3]);P(g,G.s(.12),k,[0,.3,.22]);bugFace(g,m,[0,.3,.26],.11,.5,{mouth:false});legs(g,k,[[.14,.4,.12,.18],[0,.44,0,.18],[-.14,.4,-.12,.18]],.3,.018)});
B('wuestenheuschrecke',bugMeta('Wüstenheuschrecke','wueste','boden','tag',1,180,'Ich hab eine Wüstenheuschrecke gefangen! Allein ist sie ganz friedlich.','Wüstenheuschrecken ändern ihr Verhalten und sogar ihre Farbe, wenn es eng wird: Aus Einzelgängern werden riesige Schwärme.'),
  (g,m)=>{const k=m.c('#C8B85A',{rim:.5});P(g,G.ca(.1,.45),k,[0,.2,0],[PI/2,0,0]);P(g,G.s(.13),k,[0,.24,.3]);bugFace(g,m,[0,.24,.33],.12,.5,{mouth:false});both(s=>P(g,G.tu([[s*.08,.2,-.05],[s*.15,.45,-.2],[s*.14,.05,-.35]],.03,.018),k));legs(g,k,[[.15,.2,.05],[.05,.22,0]],.15);feelers(g,k,null,[.03,.3,.4],.3,.12)});
B('kamelspinne',bugMeta('Kamelspinne','wueste','boden','nacht',3,900,'Ich hab eine Kamelspinne gefangen! Keine Spinne, kein Kamel, aber sehr schnell.','Walzenspinnen sind weder echte Spinnen noch giftig. Sie jagen nachts und haben riesige Kieferzangen im Verhältnis zum Körper.'),
  (g,m)=>{const k=m.c('#D8A878',{rim:.4});P(g,G.s(.2),k,[0,.22,-.12],null,[1,.8,1.3]);P(g,G.s(.15),k,[0,.22,.16]);bugFace(g,m,[0,.22,.2],.14,.5,{mouth:false});both(s=>P(g,G.co(.05,.14),k,[s*.06,.18,.32],[PI/2,0,0]));legs(g,k,[[.2,.45,.12],[.06,.5,.04],[-.08,.5,-.04],[-.2,.45,-.12]],.2,.02)});
B('oasen_libelle',bugMeta('Oasen-Libelle','wueste','wasser','tag',2,450,'Ich hab eine Oasen-Libelle gefangen! Ein fliegender Edelstein.','Libellen fliegen seit über 300 Millionen Jahren. Sie können vorwärts, rückwärts und in der Luft stehen – kleine Hubschrauber mit Facettenaugen.'),
  (g,m)=>{NATURE.__libelle?0:0;const k=m.c('#E8904A',{gloss:1});P(g,G.ca(.05,.7),k,[0,.3,-.1],[PI/2,0,0]);P(g,G.s(.12),k,[0,.3,.35]);bugFace(g,m,[0,.3,.36],.11,.5,{mouth:false});
    const wm=m.c('#FFF6E0',{opacity:.55,rim:1});[[.15,.2],[.02,-.2]].forEach(([z,a])=>wingPair(g,m,wm,sshp([[0,-.06],[.5,-.08],[.95,0],[.5,.08],[0,.06]]),[0,.34,z],.6,0,a,.015))});
B('wuestenrosen_kaefer',bugMeta('Rosenkäfer','wueste','blume','tag',2,380,'Ich hab einen Rosenkäfer gefangen! Er glänzt wie ein Schmuckstück.','Rosenkäfer schimmern metallisch grün, weil ihr Panzer Licht bricht wie eine Seifenblase. Sie fressen Blütenpollen.'),
  (g,m)=>{const k=m.c('#3A8A5A',{gloss:1.3});shellDome(g,m,'#4AB070',[0,.22,-.05],.28,1.15,{mat:m.holo()});P(g,G.s(.13),k,[0,.18,.28]);bugFace(g,m,[0,.17,.31],.12,.5,{mouth:false});legs(g,k,[[.18,.28,.06],[.02,.32,0],[-.14,.3,-.06]],.14)});
/* --- Pilz --- */
B('sporenmotte',bugMeta('Sporenmotte','pilz','luft','nacht',2,400,'Ich hab eine Sporenmotte gefangen! Sie streut Glitzer, wo sie fliegt.','Motten orientieren sich nachts am Mond. Künstliches Licht verwirrt sie – darum kreisen sie um Lampen.'),
  (g,m)=>butterfly(g,m,'sporenmotte',x=>{x.fillStyle='#8A7AC8';x.fillRect(0,0,1,1);x.fillStyle='#9FFFE8';for(let i=0;i<9;i++){x.beginPath();x.arc(.2+(i%3)*.3,.2+Math.floor(i/3)*.3,.05,0,TAU);x.fill()}},x=>{x.fillStyle='#6A5AA8';x.fillRect(-1,-1,3,3)},'#4A3A78'));
B('pilzschnecke',bugMeta('Pilzschnecke','pilz','boden','immer',1,150,'Ich hab eine Pilzschnecke gefangen! Ihr Haus ist ein Pilz. Mietfrei.','Schnecken fressen gern Pilze und verbreiten dabei ihre Sporen. So helfen sie dem Pilz, neue Orte zu besiedeln.'),
  (g,m)=>{const bm=m.c('#C8B8E8',{gloss:1.1,rim:.8});P(g,G.ca(.1,.45),bm,[0,.1,0],[PI/2,0,0],[1,.7,1]);shroom(g,m,[0,.12,-.05],.13,'#E878B8',{nd:4});P(g,G.s(.1),bm,[0,.16,.28]);eyes(g,m,.04,.24,.34,.03,.3);
    both(s=>P(g,G.tu([[s*.03,.2,.3],[s*.06,.32,.34]],.012),bm))});
B('gluehkaefer',bugMeta('Glühkäfer','pilz','luft','nacht',2,350,'Ich hab einen Glühkäfer gefangen! Meine Taschenlampe mit Beinen.','Glühwürmchen erzeugen kaltes Licht fast ohne Wärmeverlust. Jede Art blinkt in ihrem eigenen Morsecode.'),
  (g,m)=>{const k=m.c('#4A3A78',{gloss:.8});P(g,G.ca(.1,.3),k,[0,.22,0],[PI/2,0,0]);markGlow(g,P(g,G.s(.13),m.glow('#E8FF7A',2),[0,.2,-.22]));P(g,G.s(.12),k,[0,.22,.25]);bugFace(g,m,[0,.22,.27],.11,.5,{mouth:false});wingPair(g,m,m.c('#6A5AA8',{rim:.5}),WING.fore,[0,.3,.05],.3,.3,-.2,.02)});
B('sporenwanze',bugMeta('Sporenwanze','pilz','blume','tag',1,160,'Ich hab eine Sporenwanze gefangen! Sie riecht nach Pilzsuppe.','Wanzen haben einen Saugrüssel und riechen oft stark, um Feinde abzuschrecken. Viele sind aber harmlose Pflanzensauger.'),
  (g,m)=>{const k=m.c('#7FB8A0',{gloss:.8});P(g,G.s(.24),k,[0,.2,-.05],null,[1,.5,1.1]);P(g,G.s(.1),m.c('#4A7A6A'),[0,.2,.25]);bugFace(g,m,[0,.2,.27],.1,.55,{mouth:false});range(4,(t,i)=>P(g,G.s(.04),m.c('#FFB8F0'),[(i%2-.5)*.2,.3,-.15+i*.08]));legs(g,k,[[.15,.28,.05],[0,.3,0],[-.15,.28,-.05]],.14)});
B('mondkaefer',bugMeta('Mondkäfer','pilz','baum','nacht',4,2800,'Ich hab einen Mondkäfer gefangen! Er trägt einen Halbmond auf dem Rücken.','Viele Käfer sind nachtaktiv und orientieren sich an Mond und Sternen. Der Mondkäfer vom Sporen-Mond sammelt dabei Mondlicht in seinem Panzer.'),
  (g,m)=>{const k=m.c('#2A2A4A',{gloss:1.1});shellDome(g,m,'#3A3A6A',[0,.24,-.05],.32,1.2,{line:false});markGlow(g,P(g,G.to(.12,.03,PI*1.2),m.glow('#FFF6C0',1.8),[0,.47,-.05],[PI/2,0,.3]));
    P(g,G.s(.14),k,[0,.18,.32]);bugFace(g,m,[0,.18,.35],.13,.5,{mouth:false});both(s=>P(g,G.tu([[s*.05,.24,.4],[s*.15,.42,.5],[s*.2,.5,.45]],.025,.012),k));legs(g,k,[[.18,.3,.06],[.02,.34,0],[-.14,.3,-.06]],.14)});
B('pilz_hummel',bugMeta('Pilzhummel','pilz','blume','tag',2,300,'Ich hab eine Pilzhummel gefangen! Sie summt in Lila.','Hummeln können auch bei Kälte fliegen, weil sie ihre Flugmuskeln durch Zittern aufwärmen. Sie bestäuben viele Pflanzen, die Bienen nicht schaffen.'),
  (g,m)=>{const bm=m.plush('#B89AE8');P(g,G.s(.26),bm,[0,.3,0],null,[1,.95,1.15]);P(g,G.to(.24,.05),m.c('#3B3450'),[0,.3,-.05],[0,0,0]);P(g,G.s(.13),m.c('#3B3450'),[0,.3,.3]);bugFace(g,m,[0,.3,.33],.12,.55,{mouth:false});
    wingPair(g,m,m.c('#E8F8FF',{opacity:.6,rim:1}),WING.fore,[0,.5,0],.35,.5,-.3,.02)});
B('pilzkrabbe',bugMeta('Moorkrabbe','pilz','wasser','immer',2,420,'Ich hab eine Moorkrabbe gefangen! Sie winkt mit der grossen Schere.','Winkerkrabben winken mit einer riesigen Schere, um Weibchen zu beeindrucken und Rivalen zu vertreiben. Die Schere kann halb so schwer sein wie die ganze Krabbe.'),
  (g,m)=>{const k=m.c('#7F9AD8',{gloss:1});P(g,G.s(.25),k,[0,.2,0],null,[1.3,.55,1]);eyes(g,m,.08,.36,.12,.04,.3);both(s=>bt(g,[s*.08,.25,.1],[s*.08,.34,.12],.015,k));
    P(g,G.s(.14),m.c('#FFB8F0'),[.34,.22,.2],null,[1,.8,1.2]);P(g,G.s(.07),k,[-.28,.2,.18]);legs(g,k,[[.05,.4,0],[-.05,.42,-.06],[-.15,.38,-.1]],.16)});

/* ================= Fundstücke ================= */
REL('mammut_stosszahn',relMeta('Mammut-Stosszahn','frost','fossil',3,2400,'Ich hab einen Mammut-Stosszahn ausgegraben! Der war mal Teil eines sehr haarigen Elefanten.','Wollmammuts lebten bis vor etwa 4000 Jahren auf einer Insel im Nordpolarmeer. Im Permafrost blieben manche so gut erhalten, dass man ihr Fell noch sieht.'),
  (g,m)=>{P(g,G.tu(range(12,(t)=>[Math.sin(t*2)*.35-.2,.08+Math.sin(t*2.6)*.3,t*.8-.4]),.12,.04),m.bone())});
REL('gefrorener_gameboy',relMeta('Gefrorene Spielkonsole','frost','elektro',3,1800,'Ich hab eine gefrorene Spielkonsole ausgegraben! Der Spielstand ist bestimmt noch drauf.','Frühe tragbare Konsolen liefen mit AA-Batterien stundenlang. Heute landen jedes Jahr Millionen Geräte im Elektroschrott – Reparieren lohnt sich!'),
  (g,m)=>{const q=grp(g,[0,.45,0],[-.3,0,0]);P(q,G.bx(.5,.8,.14,.08),m.c('#C8CCD8',{gloss:.6}),[0,0,0]);P(q,G.pl(.34,.3),m.c('#9AB060'),[0,.16,.071]);both(s=>P(q,G.s(.05),m.c('#8E4A7A'),[.12+s*.04,-.18+s*.04,.07]));P(q,G.bx(.14,.04,.03,.01),m.c('#3B3450'),[-.13,-.2,.07]);P(q,G.bx(.04,.14,.03,.01),m.c('#3B3450'),[-.13,-.2,.07]);P(g,G.blob(.3,.1,2,3),m.c('#DDF2FF',{opacity:.5,rim:1.2}),[0,.62,.05],null,[1.2,1.5,.6])});
REL('eiszeit_farn',relMeta('Eiszeit-Farn','frost','fossil',2,900,'Ich hab einen Eiszeit-Farn ausgegraben! Ein Blatt, das 10 000 Jahre im Kühlschrank lag.','Farne gibt es seit über 350 Millionen Jahren – lange vor den Dinosauriern. Sie vermehren sich mit Sporen statt mit Samen.'),
  (g,m)=>{P(g,G.cy(.45,.48,.14),stoneM(m,'#DCE6F7'),[0,.07,0]);const lm=stoneM(m,'#A8C0E0');const pts=range(8,(t)=>[t*.6-.3,.15,Math.sin(t*2)*.05]);P(g,G.tu(pts,.015),lm);range(6,(t,i)=>both(s=>P(g,G.bx(.14*(1-t*.5),.02,.04,.01),lm,[pts[1+i][0],.155,s*.08],[0,s*.6,0])))});
REL('sandrose_amulett',relMeta('Wüstenamulett','wueste','fossil',3,2000,'Ich hab ein altes Wüstenamulett ausgegraben! Wer das wohl verloren hat?','Karawanen trugen seit Jahrtausenden Handelswaren durch die Wüste. Viele Oasen waren wichtige Treffpunkte zwischen Kulturen.'),
  (g,m)=>{P(g,G.to(.3,.06),m.gold(),[0,.4,0]);P(g,G.s(.18),m.c('#56C6B6',{gloss:1.3}),[0,.4,0],null,[1,1,.5]);bt(g,[0,.7,0],[0,.8,0],.02,m.gold())});
REL('dino_ei',relMeta('Dinosaurier-Ei','wueste','fossil',4,3600,'Ich hab ein Dinosaurier-Ei ausgegraben! Es ist sehr still da drin.','In Wüsten wie der Gobi wurden ganze Nester versteinerter Dino-Eier gefunden. Manche Dinos brüteten ihre Eier aus wie Vögel.'),
  (g,m)=>{P(g,G.la([[0,-.5],[.3,-.45],[.36,-.1],[.3,.25],[.15,.45],[0,.5]].map(([a,b])=>[a,b]),Q(20)),stoneM(m,'#D8B888'),[0,.5,0]);range(5,(t,i)=>P(g,G.tu([[-.1+i*.05,.3+i*.08,.3],[.02+i*.05,.25+i*.08,.32]],.01),stoneM(m,'#8A6A48')))});
REL('kassette_bernstein',relMeta('Kassette in Bernstein','wueste','elektro',3,1500,'Ich hab eine Kassette in Bernstein ausgegraben! Das Mixtape der Vorzeit.','Bernstein ist versteinertes Baumharz. Darin sind manchmal Insekten erhalten, die 100 Millionen Jahre alt sind. Eine Kassette ist allerdings neu.'),
  (g,m)=>{P(g,G.blob(.5,.08,2,3),m.c('#FFB02E',{opacity:.7,gloss:1.3,rim:1}),[0,.35,0],null,[1.2,.7,.6]);P(g,G.bx(.55,.36,.08,.03),m.c('#3B3450'),[0,.35,0]);both(s=>P(g,G.cy(.06,.06,.1),m.white(),[s*.13,.35,0],[PI/2,0,0]))});
REL('pilz_fossil',relMeta('Urpilz-Fossil','pilz','fossil',3,2200,'Ich hab ein Urpilz-Fossil ausgegraben! Der älteste Pilz im Kompost der Geschichte.','Pilze waren unter den ersten Lebewesen an Land. Riesige Pilze namens Prototaxites wurden vor 400 Millionen Jahren bis zu 8 Meter hoch – höher als die Bäume damals.'),
  (g,m)=>{P(g,G.cy(.45,.5,.18),stoneM(m,'#B8A8D0'),[0,.09,0]);shroom(g,m,[0,.15,0],.22,'#A898C8',{dots:false,capMat:stoneM(m,'#A898C8'),stem:'#C8B8E0'})});
REL('sporen_modem',relMeta('Sporen-Modem','pilz','elektro',2,1100,'Ich hab ein Modem ausgegraben, auf dem Pilze wachsen! Endlich schnelles Pilznetz.','Pilze bilden unterirdische Netzwerke aus Fäden, das Myzel. Bäume tauschen darüber Nährstoffe aus – manche nennen es das Wood Wide Web.'),
  (g,m)=>{P(g,G.bx(.7,.18,.45,.05),m.c('#E8E0D0',{gloss:.5}),[0,.1,0]);range(5,(t,i)=>P(g,G.s(.025),m.glow(i%2?'#9FFFE8':'#FFB8F0',1.6),[-.2+i*.1,.12,.23]));shroom(g,m,[.2,.19,0],.07,'#7FF7E8',{dots:false});shroom(g,m,[.1,.19,.1],.05,'#FFB8F0',{dots:false})});
})();
