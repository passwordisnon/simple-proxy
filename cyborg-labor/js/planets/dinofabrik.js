/* =====================================================================
   CYBORG-LABOR · planets/dinofabrik.js · Dino-Spielzeugfabrik
   Ein Planet, auf dem seit 1999 Plastik-Dinos gegossen werden. Bäume aus
   Spritzguss-Rahmen, an denen noch Dino-Teile hängen, Schraubenpalmen,
   Zahnradblumen, Farbkleckse und Hügel aus Kunststoff-Granulat.
   Die Häuser sind Fabrikhallen mit Sägezahndach, Spielzeugkisten und
   Dino-Häuser.
   Besonderheit:
   · Montage: Die Maschine hat sechs Teile eines Riesen-Stegosaurus über
     den Planeten verstreut. Wer die Teile findet und zur Montagestelle
     bringt, baut den Riesen-Dino Stück für Stück zusammen. Ist er fertig,
     stapft er gemütlich um seine Montagestelle.
   ===================================================================== */
(function(){
const ID='dinofabrik';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const TOY=['#7fd34a','#ff9a45','#2fb5d9','#ffd23f','#ff6fa5','#9b6ae0'];
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1.1,rimColor:'#ffffff'});

/* ---------- Stegosaurus aus Teilen (für Bäume, Fundstücke und den Riesen-Dino) ---------- */
const TEILE=[['rumpf','Rumpf'],['kopf','Kopf'],['schwanz','Schwanz'],['vorne','Vorderbeine'],['hinten','Hinterbeine'],['platten','Rückenplatten']];
function teil(g,m,k,col,col2){const c=gl(m,col),c2=gl(m,col2||'#ff9a45');
  if(k==='rumpf'){P(g,G.s(.6),c,[0,.9,0],null,[1.4,.85,.9]);P(g,G.s(.45),gl(m,'#fffdf7'),[0,.72,0],null,[1.5,.6,.9])}
  else if(k==='kopf'){P(g,G.tu([[.75,.95,0],[1.05,.8,0],[1.25,.72,0]],.26,.18,10),c);P(g,G.s(.24),c,[1.38,.72,0],null,[1.3,.8,.9]);for(const s of[-1,1]){P(g,G.s(.06),m.c('#ffffff'),[1.48,.82,s*.14]);P(g,G.s(.03),m.c('#2b2340'),[1.52,.83,s*.17])}P(g,G.to(.08,.02,PI),m.c('#2b2340'),[1.62,.66,0],[0,PI/2,PI])}
  else if(k==='schwanz'){P(g,G.tu([[-.75,.95,0],[-1.25,.8,0],[-1.7,.55,.1],[-2.0,.45,.25]],.3,.06,16),c);for(const z of[-.1,.1])P(g,G.co(.05,.3,6),c2,[-1.9,.62,.2+z],[0,0,.6])}
  else if(k==='vorne'||k==='hinten'){const x=k==='vorne'?.5:-.5;for(const z of[-.32,.32]){P(g,G.cy(.17,.2,.62,10),c,[x,.31,z]);P(g,G.cy(.22,.22,.08,10),gl(m,'#fffdf7'),[x,.04,z])}}
  else if(k==='platten'){for(let i=0;i<6;i++){const x=-.7+i*.28,h=.28+Math.sin(i/5*PI)*.22;const pl=P(g,G.co(.2,h,4),c2,[x,1.35+h/2-.05,0],[0,PI/4,0],[1,1,.35]);pl.rotation.z=(i-2.5)*.08}}}
function dino(g,m,col,col2,which){for(const[k]of TEILE)if(!which||which.includes(k))teil(g,m,k,col,col2);return g}

/* ================= Natur ================= */
N('gussbaum',{r:.4,h:4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.4,3.2);const col=o.color||TOY[Math.floor(rnd()*TOY.length)];const c=gl(m,col);
  P(g,G.cy(.09,.11,h,10),c,[0,h/2,0]);const top=grp(g,[0,h,0]);
  /* Spritzguss-Rahmen: ein Gitter mit Teilen, die an dünnen Stegen hängen */
  for(let k=0;k<2;k++){const q=grp(top,[0,k*.9,0],[0,k*PI/2,0]);const W=1.5-k*.4,H=.9;for(const x of[-W/2,W/2])P(q,G.cy(.05,.05,H,8),c,[x,H/2,0]);for(const y of[0,H])P(q,G.cy(.05,.05,W,8),c,[0,y,0],[0,0,PI/2]);P(q,G.cy(.035,.035,H,6),c,[0,H/2,0]);
    for(const[x,y]of[[-W/4,H*.3],[W/4,H*.7],[-W/4,H*.75],[W/4,H*.25]]){const pk=grp(q,[x,y,0]);P(pk,G.cy(.015,.015,.14,4),c,[x>0?-.1:.1,0,0],[0,0,PI/2]);const part=Math.floor(rnd()*4);
      if(part===0)P(pk,G.s(.13),c,[0,0,0],null,[1.3,.9,.9]);else if(part===1)P(pk,G.co(.1,.22,4),c,[0,0,0]);else if(part===2)P(pk,G.cy(.07,.08,.22,8),c,[0,0,0]);else P(pk,G.tu([[-.12,-.05,0],[0,.05,0],[.12,0,0]],.05,.02,8),c)}}});
N('schraubenpalme',{r:.35,h:4.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,3,4);const c=m.c('#e6ecf5',{gloss:1.4});
  P(g,G.cy(.12,.14,h,12),c,[0,h/2,0]);for(let i=0;i<Math.floor(h/.22);i++)P(g,G.to(.14,.03),c,[0,.2+i*.22,0],[PI/2,0,(i%2)*.15]);P(g,G.cy(.3,.3,.18,6),c,[0,h,0]);
  for(let i=0;i<6;i++){const a=i/6*TAU;const pts=[[0,h+.05,0],[Math.cos(a)*.8,h+.4,Math.sin(a)*.8],[Math.cos(a)*1.5,h-.2,Math.sin(a)*1.5]];P(g,G.tu(pts,.12,.04,12),gl(m,TOY[i%6]))}});
N('zahnradblume',{r:.15,h:.8,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.45,.8);P(g,G.cy(.02,.025,h,6),m.c('#7fd34a'),[0,h/2,0]);
  const c=gl(m,TOY[Math.floor(rnd()*6)]);const q=grp(g,[0,h,.02],[PI/2-.3,0,0]);P(q,G.cy(.14,.14,.05,16),c,[0,0,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(q,G.bx(.06,.05,.06,.01),c,[Math.cos(a)*.17,0,Math.sin(a)*.17],[0,-a,0])}P(q,G.cy(.05,.05,.07,10),gl(m,'#ffd23f'),[0,0,0]);
  const ph=rnd()*9;g.userData.tick=t=>{q.rotation.y=t*.6+ph}});
N('farbklecks',{r:.5,h:.6,size:'small',planet:ID},(g,m,o,rnd)=>{const col=TOY[Math.floor(rnd()*6)];P(g,G.blob(.5,.15,3,rnd()*9),gl(m,col),[0,.1,0],null,[1.3,.25,1.1]);for(let i=0;i<4;i++){const a=rnd()*TAU;P(g,G.s(.08+rnd()*.06),gl(m,col),[Math.cos(a)*.7,.04,Math.sin(a)*.7])}});
N('granulathaufen',{r:.7,h:.9,size:'big',planet:ID},(g,m,o,rnd)=>{const col=TOY[Math.floor(rnd()*6)];P(g,G.co(.75,.75,12),gl(m,col),[0,.37,0]);for(let i=0;i<14;i++){const a=rnd()*TAU,r=RR(rnd,.2,.8);P(g,G.s(.06),gl(m,col),[Math.cos(a)*r,.04+(.8-r)*.45,Math.sin(a)*r],null,[1,.7,1])}});
N('gussform',{r:.6,h:.9,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.bx(1.1,.5,.8,.08),m.c('#c8ccd8',{gloss:1.2}),[0,.25,0]);P(g,G.bx(1.1,.5,.8,.08),m.c('#b8bccb',{gloss:1.2}),[0,.62,-.3],[-.7,0,0]);const q=grp(g,[0,.4,.05]);q.scale.setScalar(.22);dino(q,m,TOY[Math.floor(rnd()*6)],'#ff9a45')});
N('kunststoffgras',{r:.1,h:.4,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=gl(m,'#7fd34a');for(let i=0;i<4;i++){const a=rnd()*TAU;P(g,G.bx(.05,RR(rnd,.18,.38),.02,.01),c,[Math.cos(a)*.08,.12,Math.sin(a)*.08],[0,a,(rnd()-.5)*.4])}});
Object.assign(NH.ROCK,{[ID]:['#c8ccd8','#b8bccb','#ff9a45']});

/* ================= Biome ================= */
const BI={
  fabrikwiese:{n:'Fabrikwiese',g:['#9ad86a','#8ccc5e'],cliff:'#9a9eb0',pat:'gras',grass:'#94d464',grassD:.9,trees:[['gussbaum',1.2],['schraubenpalme',.5]],treeD:.55,
    deco:[['zahnradblume',5],['kunststoffgras',4],['farbklecks',.8]],decoD:6,rocks:[['granulathaufen',.4],['gussform',.2]],rockD:.4,litter:[['granulat',1],['schraube_klein',.6]]},
  gusswald:{n:'Gusswald',g:['#84c45a','#78b84e'],cliff:'#8a8ea0',pat:'moos',grass:'#84c45a',grassD:1,trees:[['gussbaum',3],['schraubenpalme',1]],treeD:1.5,
    deco:[['zahnradblume',3],['kunststoffgras',2]],decoD:5,rocks:[['gussform',.4]],rockD:.3,litter:[['dinoteil_klein',.8],['schraube_klein',1]]},
  farbufer:{n:'Farb-Ufer',g:['#a8dcf0','#98d0e8'],cliff:'#7a8ab0',pat:'sand',grass:'#a0d8ea',grassD:.4,trees:[['schraubenpalme',.8]],treeD:.4,
    deco:[['farbklecks',3],['zahnradblume',1]],decoD:3,rocks:[['granulathaufen',.3]],rockD:.3,litter:[['granulat',1.2],['muschel',.5]]},
  granulatduenen:{n:'Granulat-Dünen',g:['#f2e6d0','#eadcc4'],cliff:'#c8b8a0',pat:'sand',grass:null,grassD:0,trees:[['schraubenpalme',.2]],treeD:.15,
    deco:[['farbklecks',1],['kunststoffgras',1]],decoD:1.5,rocks:[['granulathaufen',1.4]],rockD:1,litter:[['granulat',1.6]]},
  schlotberge:{n:'Schlotberge',g:['#d0d4e0','#c4c8d6'],cliff:'#9a9eb0',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['kunststoffgras',1]],decoD:1,rocks:[['gussform',1],['granulathaufen',.6]],rockD:.9,litter:[['schraube_klein',1]]}};

/* ================= Sammelsachen ================= */
IT('granulat',itMeta('Kunststoff-Granulat','dinofabrik','material',25),(g,m)=>{for(let i=0;i<7;i++)P(g,G.s(.04),gl(m,TOY[i%6]),[Math.cos(i*2.3)*.1,.04,Math.sin(i*2.3)*.1],null,[1,.7,1])});
IT('schraube_klein',itMeta('Kleine Schraube','dinofabrik','material',35),(g,m)=>{P(g,G.cy(.08,.08,.04,6),m.c('#e6ecf5',{gloss:1.4}),[0,.02,0]);P(g,G.cy(.03,.03,.2,8),m.c('#e6ecf5',{gloss:1.4}),[0,.14,0])});
IT('dinoteil_klein',itMeta('Kleines Dino-Teil','dinofabrik','material',60),(g,m)=>{const q=grp(g,[0,0,0]);q.scale.setScalar(.15);teil(q,m,'kopf','#7fd34a');q.position.x=-.18});

/* ================= Fische ================= */
F('badeente',fishMeta('Fabrik-Badeente','dinofabrik','teich','S','immer',1,140,'Ich hab eine Badeente geangelt! Sie quietscht, wenn man sie drückt.','1992 fielen 29 000 Plastik-Badetiere von einem Schiff in den Pazifik. Forscher verfolgten, wohin die Meeresströmungen sie trieben.'),
  (g,m)=>{P(g,G.s(.2),gl(m,'#ffd23f'),[0,0,0],null,[1,.8,1.3]);P(g,G.s(.13),gl(m,'#ffd23f'),[0,.18,.15]);P(g,G.co(.05,.12,8),gl(m,'#ff9a45'),[0,.16,.32],[PI/2,0,0],[1,1,.5]);eye(g,m,[.07,.22,.24],.03,[.6,.3,.6]);eye(g,m,[-.07,.22,.24],.03,[-.6,.3,.6])});
F('plesiodino',fishMeta('Plastik-Plesiosaurier','dinofabrik','meer','L','tag',3,1500,'Ich hab einen Plastik-Plesiosaurier gefangen! Er hat sogar eine Nummer unter dem Bauch.','Plesiosaurier waren keine Dinosaurier, sondern Meeresreptilien. Sie ruderten mit vier grossen Flossen durchs Wasser.'),
  (g,m)=>{const c=gl(m,'#2fb5d9');P(g,G.s(.26),c,[0,0,0],null,[.9,.7,1.4]);P(g,G.tu([[0,.05,.3],[0,.25,.55],[0,.35,.75]],.09,.06,10),c);P(g,G.s(.1),c,[0,.38,.82],null,[1,.8,1.3]);
    for(const s of[-1,1])for(const z of[-.15,.15])P(g,G.s(.14),c,[s*.3,-.05,z],null,[1.4,.2,.6]);eye(g,m,[.06,.42,.86],.025,[.6,.3,.6]);eye(g,m,[-.06,.42,.86],.025,[-.6,.3,.6])});
F('farbbarsch',fishMeta('Farbbarsch','dinofabrik','teich','M','nacht',2,380,'Ich hab einen Farbbarsch gefangen! Er sieht aus, als wäre er in alle Farbtöpfe gefallen.','Manche Fische können ihre Farbe ändern. Sie haben dafür besondere Zellen in der Haut, die Farbstoff verteilen oder zusammenziehen.'),
  (g,m)=>fishT(g,m,{id:'farbbarsch',H:.26,L:.7,back:'#9b6ae0',belly:'#fff6e0',tail:'fork',dorsal:'std',pat:(x,w,h)=>{const c=['#ff6fa5','#ffd23f','#7fd34a','#2fb5d9'];for(let i=0;i<4;i++){x.fillStyle=c[i];x.fillRect(w*.3+i*w*.1,0,w*.06,h)}}}));

/* ================= Insekten ================= */
B('zahnradkaefer',bugMeta('Zahnradkäfer','dinofabrik','boden','immer',1,160,'Ich hab einen Zahnradkäfer gefangen! Auf seinem Rücken dreht sich ein Zahnrad.','Zahnräder übertragen Kraft. Ein kleines Zahnrad, das ein grosses antreibt, macht die Bewegung langsamer, aber kräftiger.'),
  (g,m)=>{P(g,G.s(.18),gl(m,'#ff9a45'),[0,.16,0],null,[1,.7,1.2]);const c=m.c('#e6ecf5',{gloss:1.4});P(g,G.cy(.1,.1,.03,12),c,[0,.29,0]);for(let i=0;i<6;i++){const a=i/6*TAU;P(g,G.bx(.04,.03,.04,0),c,[Math.cos(a)*.12,.29,Math.sin(a)*.12])}bugFace(g,m,[0,.17,.22],.07,.5);legs(g,m.c('#3b3450'),[[.1,.12,.1],[0,.12,0],[-.1,.12,-.1]],.2)});
B('gummifalter',bugMeta('Gummifalter','dinofabrik','luft','tag',2,440,'Ich hab einen Gummifalter gefangen! Seine Flügel sind weich wie Radiergummi.','Naturkautschuk, aus dem früher Radiergummis gemacht wurden, ist der Saft eines Baumes. Man ritzt die Rinde an und fängt die weisse Milch auf.'),
  (g,m)=>butterfly(g,m,'gummifalter','#ff6fa5','#ffd23f','#3b3450'));
B('funkenfliege',bugMeta('Funkenfliege','dinofabrik','luft','nacht',3,860,'Ich hab eine Funkenfliege gefangen! Sie glüht wie ein kleiner Schweissfunke.','Glühwürmchen sind eigentlich Käfer. Ihr Licht ist «kalt»: Fast die ganze Energie wird zu Licht und kaum etwas zu Wärme.'),
  (g,m)=>{P(g,G.ca(.06,.2),m.c('#3b3450'),[0,.18,0],[PI/2,0,0]);P(g,G.s(.08),m.glow('#ffd23f',1.8),[0,.17,-.14]);for(const s of[-1,1])P(g,G.s(.1),m.c('#fff',{opacity:.5}),[s*.08,.24,0],null,[1,.08,.5]).userData.noOutline=true;legs(g,m.c('#3b3450'),[[.05,.15,.05],[0,.15,0],[-.05,.15,-.05]],.16)});

/* ================= Fundstücke ================= */
REL('dino_nr1',relMeta('Dino Nummer 1','dinofabrik','kunst',3,2600,'Der allererste Plastik-Dino aus der Fabrik. Unter dem Fuss steht: «1999 · Nr. 1».','Viele Plastikspielzeuge werden im Spritzguss gemacht: Heisser, flüssiger Kunststoff wird in eine Metallform gepresst und kühlt dort ab.'),
  (g,m)=>{const q=grp(g,[0,0,0]);q.scale.setScalar(.3);dino(q,m,'#ffd23f','#ff6fa5')});
REL('bauplan',relMeta('Alter Bauplan','dinofabrik','schatz',2,800,'Ein blauer Bauplan für einen Dino, der nie gebaut wurde: mit Flügeln und Rollschuhen.','Baupläne waren früher oft blau. Bei der Kopiertechnik «Blaupause» wurden weisse Linien auf blauem Papier sichtbar.'),
  (g,m)=>{P(g,G.cy(.07,.07,.6,12),m.c('#2a5ac8'),[0,.07,0],[0,0,PI/2]);P(g,G.bx(.55,.005,.4,0),m.c('#2a5ac8'),[0,.01,.25]);for(let i=0;i<4;i++)P(g,G.bx(.3,.006,.015,0),m.c('#ffffff'),[0,.015,.12+i*.07]).userData.noOutline=true});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  aufziehdino:{n:'Aufzieh-Dino',planet:ID,biomes:['fabrikwiese','gusswald'],count:4,size:.7,speed:.9,gait:'waddle',voice:['ratsch','tick-tick','rrrr'],pitch:300,likes:['schraube_klein','granulat'],product:'schraube_klein',names:['Tick','Tack','Rex','Kurbel','Spiralo'],
    fact:'Aufziehspielzeug hat eine Spiralfeder. Beim Aufziehen wird sie gespannt, und beim Loslassen treibt sie über Zahnräder die Beine an.',a:{col:'#7fd34a',belly:'#fffdf7',body:[.32,.3,.42],by:.3,head:{r:.24,p:[0,.62,.36]},snout:{type:'wide'},ears:{type:'none'},legs:{n:2,len:.2,r:.08,foot:'#ff9a45'},tail:{type:'lizard',col:'#7fd34a'},spots:{col:'#ffd23f',n:4},gait:'waddle'}},
  quietschente:{n:'Quietsch-Ente',planet:ID,biomes:['farbufer','fabrikwiese'],nearWater:true,count:3,size:.6,speed:.8,gait:'waddle',voice:['quietsch','quiek','quak'],pitch:700,likes:['granulat','badeente'],product:'granulat',names:['Quietschi','Gelbi','Ducky','Bade','Plantsch'],
    fact:'Badeenten schwimmen, weil sie hohl sind und Luft enthalten. Die Luft ist viel leichter als das Wasser, das die Ente verdrängt.',a:{col:'#ffd23f',belly:'#fff2c0',body:[.36,.3,.48],by:.32,head:{r:.24,p:[0,.72,.36]},snout:{type:'bill',col:'#ff9a45'},ears:{type:'none'},legs:{n:0},tail:{type:'fan',col:'#ffd23f'},wings:{col:'#ffc83a'}}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','fabrikhelm','Fabrik-Helm',460,'#ffd23f',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.86),M.c(col,{gloss:1.1}),[0,0,0]);P(q,G.cy(r*1.0,r*1.05,r*.06),M.c(col,{gloss:1.1}),[0,0,r*.08]);P(q,G.bx(r*.12,r*.5,r*.9,r*.04),M.c(col,{gloss:1.1}),[0,r*.6,0])});

/* ================= Möbel ================= */
furn('fliessband',{n:'Mini-Fliessband',cat:'spiel',price:1600,planet:ID,size:[2,1],h:.8,b:(g,m)=>{P(g,G.bx(1.8,.12,.5,.05),m.c('#3b3450'),[0,.6,0]);for(const x of[-.85,.85])P(g,G.cy(.08,.08,.52,12),m.c('#e6ecf5',{gloss:1.4}),[x,.6,0],[PI/2,0,0]);for(const x of[-.7,.7])for(const z of[-.2,.2])P(g,G.cy(.04,.04,.55),m.c('#e6ecf5',{gloss:1.4}),[x,.28,z]);
  for(let i=0;i<3;i++){const q=grp(g,[-.5+i*.5,.66,0]);q.scale.setScalar(.12);dino(q,m,TOY[i*2],'#ff9a45')}}});
furn('riesendino_modell',{n:'Riesen-Dino (Modell)',cat:'deko',price:2600,planet:ID,size:[2,1],h:1.4,b:(g,m)=>{const q=grp(g,[0,0,0]);q.scale.setScalar(.55);dino(q,m,'#7fd34a','#ff9a45')}});

/* ================= Sprache: Stempelschrift ================= */
function stempelGlyph(x,s,r){x.save();const n=2+Math.floor(r()*3);for(let i=0;i<n;i++){const w=s*(.1+r()*.25),h=s*(.08+r()*.12);x.fillRect((r()-.5)*s*.4-w/2,(i-n/2)*s*.16,w,h)}if(r()<.5){x.beginPath();x.arc(s*.18,-s*.18,s*.06,0,TAU);x.fill()}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Dino-Spielzeugfabrik',base:'kompost',R:118,R0:40,sea:-.3,music:'town',sky:['#8fd0ff','#fff0c8'],fog:'#e8f0f8',water:'#45c8f0',deep:'#2a7ac8',step:1.05,shop:ID,
    desc:'Hier werden seit 1999 Plastik-Dinos gegossen. Spritzguss-Bäume, Schraubenpalmen und Granulat-Dünen. Bau den Riesen-Dino zusammen.',weather:'blueten',orbit:[194,2.0],size:1,col:['#9ad86a','#ff9a45'],moons:1,
    park:'fabrikwiese',parkPond:true,phone:['#e0f6ff','#fff0c8'],stones:['kiesel','granulat','stein_klein'],plazaTree:'gussbaum',path:'#c8ccd8',
    space:{deep:'#2a7ac8',water:'#45c8f0',shore:'#f2e6d0',land:'#9ad86a',land2:'#84c45a',high:'#d0d4e0',cap:'#ffffff',atmo:'#8fd0ff',cloud:.45,sea:.36,capA:.4,freq:2.8},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'granulatduenen',wet:'farbufer',cold:'schlotberge'},peak:'schlotberge',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.1,4)*2+.7;/* flache Fabrik-Terrassen */const k=N2(q.x*.6,q.y*.6,q.z*.6);if(k>.15)h=h*.6+Math.round(h)*.4;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'farbufer';if(h>sea+4.4)return'schlotberge';if(T>.3)return'granulatduenen';if(M>.2)return'gusswald';return'fabrikwiese'},
    onLoad:W=>MONT.onLoad(W),tick:(dt,t,W,me)=>MONT.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Fabrik-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Farbteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Kühlwasser-See',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Werks-Spielhalle',mode:'Overall-Laden',praxis:'Reparatur-Praxis',museum:'Spielzeug-Museum',shop:'Werksverkauf',studio:'Lackier-Atelier',bar:'Kantine',rathaus:'Werks-Rathaus',garage:'Gabelstapler-Garage',pflanzen:'Gussbaum-Gärtnerei',tiere:'Aufzieh-Tierladen'},
  sty:{wall:'putz',walls:['#fbf7f0','#f2f8ff','#fff6e6'],roof:'dome',roofs:TOY.slice(0,5),trim:'#e6ecf5',plinth:'#9a9eb0',door:'#ff9a45',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Werksleiterin Kurbel',{skin:'plastik',color:5,shape:'kapselspiel'},{kopf:'kapselkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen in der Dino-Spielzeugfabrik! Hier läuft das Fliessband seit 1999 ohne Pause.','Die grosse Maschine hat neulich gehustet. Seitdem liegen die Teile des Riesen-Dinos überall auf dem Planeten herum.','Jeder Dino hier hat unter dem Fuss eine Nummer. Die Nummer 1 ist leider verschwunden.'],
  caveRock:['#c8ccd8','#b8bccb','#9a9eb0',TOY.slice(0,3)],
  wear:['fabrikhelm','latzhose','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['pirate','crate',.42,'ds',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_yellowA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'fabrik'},{fam:'kokon',style:'dinohaus'},{fam:'kokon',style:'spielkiste'},{fam:'kokon',style:'fabrik'}]},
  residents:{skins:['plastik','bonbon','gold','fell'],heads:['kapselkopf','crtkopf','eikopf','frosch','vogel','mensch','katze'],names:['Kurbel','Schraubi','Rex','Tick','Granulat','Spritz','Form','Lack','Nummer','Bolzen','Gussi','Zahn'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fbf7f0','#f2f8ff','#fff6e6'],roofCols:TOY.slice(0,4),win:['rund']},deco:['zahnradblume','gussbaum','farbklecks'],fence:false},
  lang:{n:'Stempelschrift',ink:'#3b3450',glow:'#ff9a45',kind:'circuit',draw:stempelGlyph,syl:['rex','to','ma','ki','tor','ba','zu','po','li','de','no','ra']},ruinStone:'#b8bccb',
  terraform:['fabrikwiese','gusswald','farbufer','granulatduenen'],
  weather:[['klar',4],['heiter',3],['regen',1],['nebel',1]]});

/* ================= Montage des Riesen-Dinos ================= */
const MONT=(()=>{let W_=null,parts=[],station=null,big=null,bigG=null;const COUNT=TEILE.length;const SC=2.4,WALK=7;
  const S=()=>SAVE.mont=SAVE.mont||{got:[],built:[]};
  function partCrate(m,i){const g=new THREE.Group();P(g,G.bx(1.1,.7,1.1,.1),gl(m,TOY[i%6]),[0,.35,0]);P(g,G.bx(1.16,.1,1.16,.04),m.c('#e6ecf5',{gloss:1.4}),[0,.72,0]);
    const q=grp(g,[0,.78,0]);q.scale.setScalar(.38);teil(q,m,TEILE[i][0],'#7fd34a','#ff9a45');q.position.x=TEILE[i][0]==='kopf'?-.4:TEILE[i][0]==='schwanz'?.55:0;
    P(g,G.to(.75,.04,TAU),m.glow('#ffd23f',1.3),[0,.03,0],[PI/2,0,0]).userData.noOutline=true;addOutlines(g);g.userData.spin=q;return g}
  function stationModel(m){const g=new THREE.Group();P(g,G.cy(3.4,3.6,.3,32),m.c('#c8ccd8',{gloss:1}),[0,.15,0]);for(let i=0;i<16;i++){const a=i/16*TAU;P(g,G.bx(.5,.05,.2,.02),gl(m,i%2?'#ffd23f':'#3b3450'),[Math.cos(a)*3.45,.31,Math.sin(a)*3.45],[0,-a,0])}
    for(const s of[-1,1]){P(g,G.cy(.1,.12,3.6,10),m.c('#e6ecf5',{gloss:1.4}),[s*3,1.8,-2.2]);}P(g,G.cy(.08,.08,6,10),m.c('#ff9a45',{gloss:1.2}),[0,3.6,-2.2],[0,0,PI/2]);P(g,G.cy(.03,.03,1.4),m.c('#3b3450'),[.5,2.9,-2.2]);P(g,G.bx(.4,.25,.4,.05),gl(m,'#ffd23f'),[.5,2.15,-2.2]);
    const sign=ctex('mont-sign',256,64,(x,w,h)=>{x.fillStyle='#ffd23f';x.fillRect(0,0,w,h);x.fillStyle='#3b3450';x.font='900 34px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('MONTAGE',w/2,h/2+2)});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshBasicMaterial({map:sign}));s.position.set(0,4.1,-2.2);s.userData.noOutline=true;g.add(s);const s2=s.clone();s2.rotation.y=PI;s2.position.z=-2.21;g.add(s2);
    addOutlines(g);return g}
  function rebuildBig(m){if(bigG&&bigG.parent)bigG.parent.remove(bigG);const st=S();bigG=new THREE.Group();const q=grp(bigG,[0,.3,0]);q.scale.setScalar(SC);dino(q,m,'#7fd34a','#ff9a45',st.built);addOutlines(bigG);
    bigG.userData.q=q;GAME.placeObj(bigG,station.d,station.yaw,0,true);return bigG}
  function findSpot(W,r,minD,maxD,avoid){const pl=GAME.G.places.find(p=>p.id==='platz');for(let t=0;t<600;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=pl?angle(cd,pl.dir)*W.R:99;if(a<minD||a>maxD)continue;
      if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.4))continue;if(avoid.some(x=>angle(x,cd)*W.R<18))continue;return cd}return null}
  function onLoad(W){W_=W;parts=[];const m=makeMats({skin:'plastik',color:0});const st=S();const r=srand(2027);
    const sd=findSpot(W,r,26,46,[])||findSpot(W,r,20,90,[]);if(!sd)return;station={d:sd,yaw:r()*TAU};const sg=stationModel(m);GAME.placeObj(sg,sd,station.yaw,0,true);
    W.inter.push({kind:'montage',p:sd,r:4.2,label:'Montagestelle: Teile einbauen',act:()=>assemble()});rebuildBig(m);station.m=m;
    const used=[sd];for(let i=0;i<COUNT;i++){const k=TEILE[i][0];let d=null;for(let t=0;t<400&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.93||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(used.some(x=>angle(x,cd)*W.R<24))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;d=cd}
      if(!d)continue;used.push(d);if(st.got.includes(k)||st.built.includes(k)){parts.push({i,k,d,g:null});continue}const g=partCrate(m,i);GAME.placeObj(g,d,r()*TAU,0,true);const it={kind:'dinoteil',p:d,r:1.8,label:'Dino-Teil aufladen: '+TEILE[i][1],act:()=>pick(i)};W.inter.push(it);parts.push({i,k,d,g,it})}}
  function pick(i){const st=S();const t=parts.find(x=>x.i===i);if(!t||!t.g)return;st.got.push(t.k);t.g.parent&&t.g.parent.remove(t.g);const j=W_.inter.indexOf(t.it);if(j>=0)W_.inter.splice(j,1);t.g=null;persist();SND.play('pickup',{rate:.8});
    const have=st.got.length+st.built.length;UI.toast(TEILE[i][1]+' aufgeladen ('+have+' von '+COUNT+'). Bring es zur Montagestelle mit dem gelben Schild.',3400);
    if(typeof PIKO!=='undefined'&&have===1)PIKO.want('Ein Teil vom Riesen-Dino! Die Montagestelle steht nicht weit vom Fabrik-Platz.')}
  async function assemble(){const st=S();if(!st.got.length){UI.toast(st.built.length===COUNT?'Der Riesen-Dino ist fertig und dreht seine Runden.':'Hier fehlen noch '+(COUNT-st.built.length)+' Teile. Sie liegen in Kisten auf dem Planeten.',2800);return}
    const n=st.got.length;st.built.push(...st.got);st.got=[];persist();rebuildBig(station.m);SND.play('click');SND.play('pickup',{rate:.7});money(150*n);
    UI.toast(n+(n>1?' Teile':' Teil')+' eingebaut. Riesen-Dino: '+st.built.length+' von '+COUNT+'. Werkslohn: '+(150*n)+' Taler.',3200);
    if(st.built.length===COUNT&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Werksleiterin Kurbel',['Er ist fertig! Der Riesen-Dino läuft zum ersten Mal seit 1999.','Damit du ihn nie vergisst: ein Modell für dein Zimmer. Und ein Mini-Fliessband dazu.']);bagAdd('furn','riesendino_modell');bagAdd('furn','fliessband');money(400);SND.jingle('j_success')},900)}}
  /* fertig: der Dino stapft im Kreis um die Montagestelle; sonst wippen die Teile in den Kisten */
  const _ax=new V();function tick(dt,t){for(const p of parts)if(p.g)p.g.userData.spin.rotation.y=t*.8+p.i;
    if(!station||!bigG)return;const st=S();if(st.built.length===COUNT){const a=t*.12;_ax.set(1,0,0).cross(station.d).normalize();const off=station.d.clone().applyAxisAngle(_ax,WALK/W_.R).applyAxisAngle(station.d,a);
      const ah=station.d.clone().applyAxisAngle(_ax,WALK/W_.R).applyAxisAngle(station.d,a+.05);GAME.placeObj(bigG,off,0,0,true);bigG.up.copy(off);bigG.lookAt(ah.multiplyScalar(bigG.position.length()));bigG.rotateY(-PI/2);const q=bigG.userData.q;q.position.y=.3+Math.abs(Math.sin(t*3))*.15;q.rotation.z=Math.sin(t*3)*.04}}
  return{onLoad,tick,parts:()=>parts,station:()=>station,COUNT,_assemble:assemble}
})();
window.MONT=MONT;
})();
