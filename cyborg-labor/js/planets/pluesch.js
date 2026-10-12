/* =====================================================================
   CYBORG-LABOR · planets/pluesch.js · Plüsch-Planet
   Ein weicher Planet aus Stoff und Wolle: Pompon-Bäume, Knopfblumen,
   Kissenfelsen und Flauschgras. Die Häuser sind Teddys, Kissen und
   riesige Wollknäuel. Alles hat Nähte und Knopfaugen.
   Besonderheit:
   · Kuscheltier-Fundbüro: zehn kleine Kuscheltiere haben sich auf dem
     Planeten verlaufen. Wer eines findet, bringt es ins Fundbüro (es
     springt von selbst in die Tasche). Für jedes gibt es einen Faden-
     Bonus; wer alle zehn heimbringt, bekommt den Riesen-Teddy.
   ===================================================================== */
(function(){
const ID='pluesch';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const SOFT=['#ff8fb8','#8fd0ff','#ffd27a','#b89af0','#9ee08a','#ffb08a'];
const fl=(m,c)=>m.c(c,{gloss:.08,rim:1.25,rimColor:'#ffffff',fabric:true});
/* Naht: kleine weisse Striche entlang einer Linie */
function naht(g,m,pts,col){for(let i=0;i<pts.length-1;i+=2){const a=new V(...pts[i]),b=new V(...pts[i+1]);const s=P(g,G.bx(.035,.035,a.distanceTo(b)*.7,.01),m.c(col||'#fffdf7'),[(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2]);s.lookAt(b.x,b.y,b.z);s.userData.noOutline=true}}
function knopf(g,m,p,r,col,rot){const q=grp(g,p,rot||[0,0,0]);P(q,G.cy(r,r,r*.35),m.c(col,{gloss:1.1,rim:.8}),[0,0,0],[PI/2,0,0]);for(const[x,y]of[[-1,-1],[1,-1],[-1,1],[1,1]])P(q,G.cy(r*.13,r*.13,r*.4),m.c('#fffdf7'),[x*r*.3,y*r*.3,.01],[PI/2,0,0]);return q}

/* ================= Natur ================= */
N('pomponbaum',{r:.35,h:3.6,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2,3);const col=o.color||SOFT[Math.floor(rnd()*SOFT.length)];
  const tr=fl(m,'#c98a5a');for(let i=0;i<5;i++)P(g,G.cy(.2-i*.015,.22-i*.015,h/5),i%2?tr:fl(m,'#e0a878'),[0,h/5*(i+.5),0]);
  const n=3+Math.floor(rnd()*2);for(let i=0;i<n;i++){const a=i/n*TAU+rnd(),r=i?.55:0;P(g,G.blob(.75-(i?.15:0),.12,4,rnd()*9),fl(m,i%2?col:SOFT[(SOFT.indexOf(col)+1)%6]),[Math.cos(a)*r,h+.5+(i?-.05:.35),Math.sin(a)*r])}
  naht(g,m,range(13,t=>[Math.sin(t*PI)*.05,.1+t*(h-.2),-.23]))});
N('wollweide',{r:.3,h:3.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3);const col=o.color||SOFT[Math.floor(rnd()*6)];
  P(g,G.tu([[0,0,0],[.1,h*.5,.05],[0,h,0]],.16,.1,12),fl(m,'#a87858'));const top=[0,h,0];
  for(let i=0;i<9;i++){const a=i/9*TAU+rnd()*.3;const pts=[top,[Math.cos(a)*.7,h+.25,Math.sin(a)*.7],[Math.cos(a)*1.1,h-.4,Math.sin(a)*1.1],[Math.cos(a)*1.2,h-1.3-rnd()*.5,Math.sin(a)*1.2]];
    P(g,G.tu(pts,.07,.05,16),fl(m,i%2?col:'#fffdf7'));P(g,G.s(.13),fl(m,col),pts[3])}});
N('knopfblume',{r:.15,h:.8,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.4,.8);P(g,G.tu([[0,0,0],[.04,h*.5,0],[0,h,0]],.03,.025),fl(m,'#7fc87a'));
  const c=SOFT[Math.floor(rnd()*6)];for(let i=0;i<6;i++){const a=i/6*TAU;P(g,G.s(.09),fl(m,c),[Math.cos(a)*.11,h+.08,Math.sin(a)*.11],null,[1,.5,1])}knopf(g,m,[0,h+.1,0],.08,'#ffd27a',[-PI/2,0,0])});
N('flauschgras',{r:.12,h:.35,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=fl(m,'#9ee08a');for(let i=0;i<4;i++)P(g,G.s(.07+rnd()*.05),c,[(rnd()-.5)*.3,.06,(rnd()-.5)*.3],null,[1,1.6,1])});
N('kissenfels',{r:.8,h:1,size:'big',planet:ID},(g,m,o,rnd)=>{const c=SOFT[Math.floor(rnd()*6)];const w=RR(rnd,1,1.5);const k=P(g,G.bx(w,.6,w*.8,.28),fl(m,c),[0,.32,0]);
  for(const sx of[-1,1])for(const sz of[-1,1])P(g,G.s(.11),fl(m,c),[sx*w/2,.48,sz*w*.4],null,[1,1.4,1]);knopf(g,m,[0,.64,0],.1,'#fffdf7',[-PI/2,0,0]);naht(g,m,range(15,t=>[(t-.5)*w*.9,.63,-w*.4-.01]))});
N('wollbusch',{r:.5,h:.9,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{const c=SOFT[Math.floor(rnd()*6)];P(g,G.s(.5),fl(m,c),[0,.42,0],null,[1.15,.82,1]);
  for(let i=0;i<4;i++){const a=rnd()*TAU;const pts=[];for(let k=0;k<=12;k++){const t=k/12*PI;pts.push([Math.cos(t)*.58*Math.cos(a),.42+Math.sin(t)*.42,Math.cos(t)*.58*Math.sin(a)])}P(g,G.tu(pts,.025,.025,20),fl(m,'#fffdf7'))}});
N('filzpilz',{r:.2,h:.7,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.3,.55);P(g,G.cy(.08,.1,h),fl(m,'#fff3e6'),[0,h/2,0]);P(g,G.hs(.26),fl(m,SOFT[Math.floor(rnd()*6)]),[0,h,0],null,[1,.7,1]);for(let i=0;i<4;i++){const a=i/4*TAU+.4;P(g,G.s(.04),m.c('#fffdf7'),[Math.cos(a)*.15,h+.13,Math.sin(a)*.15])}});
Object.assign(NH.ROCK,{[ID]:['#f2b8d0','#c8b0f0','#a8d8f0']});

/* ================= Biome ================= */
const BI={
  kuschelwiese:{n:'Kuschelwiese',g:['#a8e09a','#98d48a'],cliff:'#e0a8c8',pat:'gras',grass:'#a0dc94',grassD:.9,trees:[['pomponbaum',1.4],['wollweide',.6]],treeD:.6,
    deco:[['knopfblume',5],['flauschgras',4],['wollbusch',1.2],['filzpilz',.8]],decoD:6,rocks:[['kissenfels',.5]],rockD:.4,litter:[['flausch',1],['knopf_klein',.6]]},
  pomponwald:{n:'Pompon-Wald',g:['#90d088','#84c47c'],cliff:'#c8a0d8',pat:'moos',grass:'#90d088',grassD:1,trees:[['pomponbaum',3],['wollweide',1.4]],treeD:1.6,
    deco:[['wollbusch',3],['filzpilz',2],['knopfblume',1.5]],decoD:5,rocks:[['kissenfels',.4]],rockD:.3,litter:[['wollfaden',1],['flausch',.6]]},
  kissenhuegel:{n:'Kissenhügel',g:['#f4d0e0','#ecc4d8'],cliff:'#d8a0c0',pat:'sand',grass:'#f0c8dc',grassD:.3,trees:[['pomponbaum',.4]],treeD:.25,
    deco:[['flauschgras',2],['knopfblume',1]],decoD:2,rocks:[['kissenfels',1.6]],rockD:1,litter:[['flausch',1.2],['knopf_klein',.6]]},
  filzufer:{n:'Filz-Ufer',g:['#b8e4f0','#a8d8e8'],cliff:'#90b0d0',pat:'sand',grass:'#a8dcea',grassD:.4,trees:[['wollweide',1]],treeD:.4,
    deco:[['wollbusch',2],['filzpilz',1]],decoD:3,rocks:[['kissenfels',.4]],rockD:.4,litter:[['wollfaden',1.2],['muschel',.6]]},
  sockengipfel:{n:'Socken-Gipfel',g:['#fffaf4','#f2ece6'],cliff:'#c8c0d8',pat:'staub',grass:null,grassD:0,trees:[['pomponbaum',.2]],treeD:.15,
    deco:[['flauschgras',1]],decoD:1,rocks:[['kissenfels',1]],rockD:.8,litter:[['flausch',1]]}};

/* ================= Sammelsachen ================= */
IT('flausch',itMeta('Flausch','pluesch','material',30),(g,m)=>{P(g,G.blob(.14,.2,4,3),fl(m,'#fffdf7'),[0,.1,0])});
IT('knopf_klein',itMeta('Kleiner Knopf','pluesch','material',45),(g,m)=>knopf(g,m,[0,.03,0],.12,'#ff8fb8',[-PI/2,0,0]));
IT('wollfaden',itMeta('Wollfaden','pluesch','material',35),(g,m)=>{P(g,G.s(.1),fl(m,'#8fd0ff'),[0,.1,0]);P(g,G.tu([[.08,.08,0],[.2,.03,.05],[.32,.03,-.05]],.02,.02,10),fl(m,'#8fd0ff'))});

/* ================= Fische ================= */
F('sockenfisch',fishMeta('Sockenfisch','pluesch','teich','S','immer',1,160,'Ich hab einen Sockenfisch gefangen! Er sieht aus wie eine verlorene Socke mit Knopfaugen.','In jeder Waschmaschine verschwinden angeblich Socken. In Wahrheit rutschen sie meist zwischen Trommel und Dichtung oder bleiben im Ärmel eines Pullovers hängen.'),
  (g,m)=>{P(g,G.ca(.13,.5),fl(m,'#ffd27a'),[0,0,0],[PI/2,0,0]);P(g,G.ca(.135,.12),fl(m,'#ff8fb8'),[0,0,-.28],[PI/2,0,0]);P(g,G.s(.14),fl(m,'#ff8fb8'),[0,-.06,.3],null,[1,.8,1.2]);
    for(const s of[-1,1])knopf(g,m,[s*.1,.06,.22],.04,'#2b2340',[0,s*PI/2,0])});
F('wollwal',fishMeta('Wollwal','pluesch','meer','L','tag',2,700,'Ich hab einen Wollwal gefangen! Er ist gestrickt und ganz flauschig.','Wolle kommt meist vom Schaf. Ein Schaf gibt pro Jahr etwa vier Kilogramm Wolle – genug für mehrere Pullover.'),
  (g,m)=>{P(g,G.s(.32),fl(m,'#8fd0ff'),[0,0,0],null,[.9,.8,1.5]);P(g,G.s(.25),fl(m,'#fffdf7'),[0,-.1,.05],null,[.8,.5,1.3]);P(g,G.cy(.01,.16,.08),fl(m,'#8fd0ff'),[0,0,-.55],[PI/2,0,0],[2.2,1,.5]);
    eye(g,m,[.2,.08,.3],.04,[.6,.3,.6]);eye(g,m,[-.2,.08,.3],.04,[-.6,.3,.6]);naht(g,m,range(11,t=>[0,.26,(t-.5)*.8]))});
F('filzforelle',fishMeta('Filzforelle','pluesch','teich','M','nacht',2,480,'Ich hab eine Filzforelle gefangen! Ihre Punkte sind aufgenäht.','Filz entsteht, wenn man Wolle mit warmem Wasser und Seife reibt. Die winzigen Schuppen der Wollfasern verhaken sich dann fest ineinander.'),
  (g,m)=>fishT(g,m,{id:'filzforelle',H:.24,L:.8,back:'#b89af0',belly:'#fff3e6',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ff8fb8';for(let i=0;i<9;i++){x.beginPath();x.arc((i*37)%w,12+(i*23)%(h-24),6,0,TAU);x.fill()}}}));

/* ================= Insekten ================= */
B('pomponkaefer',bugMeta('Pompon-Käfer','pluesch','boden','immer',1,140,'Ich hab einen Pompon-Käfer gefangen! Er ist rund und weich wie ein Mützenbommel.','Viele Käfer haben harte Deckflügel. Darunter liegen die dünnen Flügel, mit denen sie wirklich fliegen.'),
  (g,m)=>{P(g,G.s(.2),fl(m,'#ff8fb8'),[0,.2,0]);P(g,G.s(.1),fl(m,'#3b3450'),[0,.2,.2]);bugFace(g,m,[0,.21,.27],.07,.5);legs(g,m.c('#3b3450'),[[.1,.14,.1],[0,.14,0],[-.1,.14,-.1]],.2)});
B('stofffalter',bugMeta('Stofffalter','pluesch','luft','tag',2,460,'Ich hab einen Stofffalter gefangen! Seine Flügel sind aus kariertem Stoff.','Schmetterlingsflügel sind mit winzigen Schuppen bedeckt. Wenn man sie berührt, bleibt bunter Staub an den Fingern.'),
  (g,m)=>butterfly(g,m,'stofffalter','#8fd0ff','#ffd27a','#3b3450'));
B('fusselmotte',bugMeta('Fusselmotte','pluesch','luft','nacht',3,900,'Ich hab eine Fusselmotte gefangen! Sie knabbert nur an Fusseln, die keiner mehr braucht.','Kleidermotten fressen nicht selbst Wolle, sondern ihre Raupen. Die erwachsenen Motten fressen gar nichts mehr.'),
  (g,m)=>butterfly(g,m,'fusselmotte','#fffdf7','#c8b0f0','#8a7aa0'));

/* ================= Fundstücke ================= */
REL('goldene_nadel',relMeta('Goldene Nähnadel','pluesch','schatz',3,2200,'Eine goldene Nähnadel! Mit ihr wurde angeblich der erste Teddy des Planeten genäht.','Nähnadeln gibt es seit über 40 000 Jahren. Die ältesten waren aus Knochen geschnitzt.'),
  (g,m)=>{P(g,G.cy(.02,.005,.9),m.c('#ffd23f',{gloss:1.5,rim:1}),[0,.04,0],[0,0,PI/2]);P(g,G.to(.04,.012),m.c('#ffd23f',{gloss:1.5}),[.42,.04,0],[0,PI/2,0]);P(g,G.tu([[.42,.04,0],[.3,.12,.1],[.1,.04,.2],[-.2,.04,.15]],.012,.012,16),fl(m,'#ff8fb8'))});
REL('erster_teddy',relMeta('Der erste Teddy','pluesch','kunst',2,1100,'Ein abgeliebter alter Teddy mit einem Flicken am Bauch.','Der Teddybär ist nach einem amerikanischen Präsidenten benannt: Theodore «Teddy» Roosevelt.'),
  (g,m)=>{const c=fl(m,'#c98a5a');P(g,G.s(.2),c,[0,.22,0],null,[1,1.15,.9]);P(g,G.s(.15),c,[0,.5,0]);for(const s of[-1,1]){P(g,G.s(.06),c,[s*.12,.62,0]);P(g,G.s(.07),c,[s*.18,.25,.05]);knopf(g,m,[s*.05,.52,.14],.025,'#2b2340')}P(g,G.bx(.1,.1,.02,.01),fl(m,'#8fd0ff'),[.04,.2,.18])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  wollschaf:{n:'Wollschaf',planet:ID,biomes:['kuschelwiese','kissenhuegel'],count:4,size:.9,speed:.8,gait:'walk',shy:false,voice:['mäh','määäh','bäh'],pitch:330,likes:['flausch','knopfblume'],product:'wollfaden',names:['Wolke','Flocke','Bommel','Knäuel','Watte'],
    fact:'Schafe erkennen die Gesichter von anderen Schafen und auch von Menschen – noch nach Jahren.',a:{col:'#fffdf7',belly:'#fffdf7',body:[.42,.36,.5],head:{r:.22,p:[0,.5,.42]},snout:{type:'muzzle',col:'#3b3450',nose:'#ff8fb8'},ears:{type:'floppy',len:.3},legs:{n:4,len:.22,r:.06,foot:'#3b3450'},tail:{type:'puff',col:'#fffdf7',r:.1},spots:{col:'#ffd0e4',n:3,s:.5},gait:'walk'}},
  knopfhase:{n:'Knopfhase',planet:ID,biomes:['pomponwald','kuschelwiese'],count:4,size:.7,speed:1.3,gait:'hop',shy:true,voice:['piep','pip','fiep'],pitch:620,likes:['knopf_klein','knopfblume'],product:'knopf_klein',names:['Knöpfchen','Flicken','Stups','Hoppel','Bommel'],
    fact:'Hasenbabys kommen mit Fell und offenen Augen zur Welt. Kaninchenbabys dagegen sind anfangs nackt und blind.',a:{col:'#f2b8d0',belly:'#fff3e6',body:[.3,.28,.36],head:{r:.24,p:[0,.48,.28]},snout:{type:'muzzle',col:'#fff3e6',nose:'#ff6fa5'},ears:{type:'pointy',len:.6},legs:{n:4,len:.1,r:.07,foot:'#fff3e6'},tail:{type:'puff',col:'#ffffff',r:.1},spots:{col:'#8fd0ff',n:3,s:.5},gait:'hop'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','bommelmuetze','Bommelmütze',420,'#ff8fb8',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.3,0]);P(q,G.hs(r*.84),M.c(col),[0,0,0]);P(q,G.cy(r*.86,r*.86,r*.22),M.c('#fffdf7'),[0,r*.05,0]);P(q,G.s(r*.28),M.c('#fffdf7'),[0,r*.92,0])});
def('top','plueschjacke','Plüsch-Jacke',880,'#b89af0',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);for(let i=0;i<3;i++)P(q,G.cy(r*.07,r*.07,r*.04),M.c('#ffd27a',{gloss:1}),[0,-r*(.15+i*.28),r*.86],[PI/2,0,0])});

/* ================= Möbel ================= */
furn('riesenteddy',{n:'Riesen-Teddy',cat:'deko',price:2400,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{const c=fl(m,'#c98a5a');P(g,G.s(.42),c,[0,.42,0],null,[1,1.05,.9]);P(g,G.s(.3),fl(m,'#fff3e6'),[0,.38,.18],null,[1,1.1,.6]);P(g,G.s(.32),c,[0,1.02,0]);
  for(const s of[-1,1]){P(g,G.s(.12),c,[s*.24,1.28,0]);P(g,G.s(.07),fl(m,'#ff8fb8'),[s*.24,1.28,.07],null,[1,1,.5]);P(g,G.s(.15),c,[s*.36,.55,.1]);P(g,G.s(.16),c,[s*.22,.1,.22],null,[1,.7,1.3]);knopf(g,m,[s*.1,1.1,.29],.04,'#2b2340')}
  P(g,G.s(.12),fl(m,'#fff3e6'),[0,.96,.26],null,[1.2,.9,.8]);P(g,G.s(.04),m.c('#3b3450',{gloss:1}),[0,.99,.36]);P(g,G.to(.08,.025),fl(m,'#ff6fa5'),[0,.78,.2],[PI/2,0,0])}});
furn('kissenberg',{n:'Kissenberg',cat:'sitz',price:950,planet:ID,size:[1,1],h:.9,b:(g,m)=>{for(let i=0;i<4;i++)P(g,G.bx(.8-i*.1,.2,.7-i*.08,.09),fl(m,SOFT[i]),[0,.1+i*.2,0],[0,i*.4,0])}});

/* ================= Sprache: Stickschrift ================= */
function stichGlyph(x,s,r){const n=2+Math.floor(r()*3);x.save();x.setLineDash([s*.09,s*.07]);x.lineWidth=s*.07;for(let i=0;i<n;i++){x.beginPath();const a=r()*TAU,b=a+1+r()*2;x.arc((r()-.5)*s*.3,(r()-.5)*s*.3,s*(.15+r()*.15),a,b);x.stroke()}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Plüsch-Planet',base:'kompost',R:118,R0:40,sea:-.3,music:'town',sky:['#a8c8ff','#ffd0e8'],fog:'#f0d8f0',water:'#8fd0ff',deep:'#5a90d8',step:1.0,shop:ID,
    desc:'Ein weicher Planet aus Stoff und Wolle: Pompon-Bäume, Knopfblumen und Kissenfelsen. Zehn Kuscheltiere haben sich verlaufen.',weather:'blueten',orbit:[180,1.2],size:1,col:['#a8e09a','#ff8fb8'],moons:1,
    park:'kuschelwiese',parkPond:true,phone:['#ffe0f0','#e0f0ff'],stones:['kiesel','flausch','stein_klein'],plazaTree:'pomponbaum',path:'#f2b8d0',
    space:{deep:'#5a90d8',water:'#8fd0ff',shore:'#f4d0e0',land:'#a8e09a',land2:'#90d088',high:'#fffaf4',cap:'#ffd0e8',atmo:'#ffb8d8',cloud:.5,sea:.36,capA:.5,freq:2.4},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'kissenhuegel',wet:'filzufer',cold:'sockengipfel'},peak:'sockengipfel',
    raw(q,p,{N,N2,fbm}){/* weiche, runde Kissenhügel */let h=fbm(q,1.0,3)*1.8+.7;const k=N2(q.x*.7,q.y*.7,q.z*.7);h+=Math.max(0,k)*1.6;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'filzufer';if(h>sea+4.6)return'sockengipfel';if(T>.3)return'kissenhuegel';if(M>.2)return'pomponwald';return'kuschelwiese'},
    onLoad:W=>FUNDB.onLoad(W),tick:(dt,t,W,me)=>FUNDB.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Kuschel-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Knopfteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Filzsee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Kuschel-Spielhalle',mode:'Strickstube',praxis:'Flickwerkstatt',museum:'Museum der Kuscheltiere',shop:'Knopfladen',studio:'Näh-Atelier',bar:'Kakao-Bar',rathaus:'Kuschel-Rathaus',garage:'Wollgarage',pflanzen:'Pompon-Gärtnerei',tiere:'Plüschtierladen'},
  sty:{wall:'putz',walls:['#fff6fa','#f2f8ff','#fffaf0'],roof:'dome',roofs:SOFT.slice(0,5),trim:'#fffdf7',plinth:'#e0a8c8',door:'#b89af0',win:'rund',pitch:.9},
  wall:'streifen',floor:'teppich',
  mayor:['Bürgermeister Flicken',{skin:'pluesch',color:3,shape:'ei'},{kopf:'katze',augen:'mensch',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen auf dem Plüsch-Planeten! Hier ist alles weich. Sogar die Felsen.','Zehn kleine Kuscheltiere haben sich verlaufen. Wer eines findet, bringt es einfach mit, das Fundbüro ist im Rathaus.','Jede Naht auf diesem Planeten wurde von Hand gestickt. Das sagt jedenfalls Bürgermeister Flicken.'],
  caveRock:['#f2b8d0','#c8b0f0','#a8d8f0',['#ff8fb8','#8fd0ff','#ffd27a']],
  wear:['bommelmuetze','plueschjacke','kappe','halstuch'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'teddy'},{fam:'kokon',style:'kissen'},{fam:'kokon',style:'knaeuel'},{fam:'kokon',style:'teddy'}]},
  residents:{skins:['pluesch','fell','bonbon','plastik'],heads:['katze','eule','frosch','vogel','mensch','kapselkopf','moosball'],names:['Bommel','Flicken','Knöpfchen','Watte','Fussel','Kuschel','Teddy','Wolle','Filzi','Socke','Nähli','Puschel'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fff6fa','#f2f8ff','#fffaf0'],roofCols:SOFT.slice(0,4),win:['rund']},deco:['knopfblume','wollbusch','pomponbaum'],fence:false},
  lang:{n:'Stickschrift',ink:'#b05a8a',glow:'#ff8fb8',kind:'runes',draw:stichGlyph,syl:['pu','schi','mo','li','fu','ka','bo','me','ni','wo','ku','te']},ruinStone:'#e0a8c8',
  terraform:['kuschelwiese','pomponwald','filzufer','kissenhuegel'],
  weather:[['klar',4],['heiter',3],['schnee',1],['nebel',1]]});

/* ================= Kuscheltier-Fundbüro ================= */
const FUNDB=(()=>{let W_=null,pets=[];const COUNT=10,REWARD=120;
  const KIND=[['Hase','#f2b8d0'],['Bär','#c98a5a'],['Ente','#ffd27a'],['Elefant','#a8d8f0'],['Katze','#b89af0'],['Frosch','#9ee08a'],['Pinguin','#3b3450'],['Fuchs','#ffb08a'],['Schaf','#fffdf7'],['Drache','#7fd3a0']];
  const S=()=>SAVE.fundb=SAVE.fundb||{got:[]};
  function petModel(m,i){const[nm,col]=KIND[i%KIND.length];const g=new THREE.Group();const b=grp(g,[0,0,0]);const c=fl(m,col);
    P(b,G.s(.26),c,[0,.28,0],null,[1,1.1,.9]);P(b,G.s(.22),c,[0,.62,0]);P(b,G.s(.14),fl(m,col==='#3b3450'?'#fffdf7':'#fff3e6'),[0,.26,.14],null,[1,1.1,.6]);
    if(nm==='Hase')for(const s of[-1,1])P(b,G.ca(.05,.22),c,[s*.08,.92,0],[0,0,s*.15]);else if(nm==='Elefant')P(b,G.tu([[0,.58,.2],[0,.45,.3],[0,.36,.28]],.05,.04,8),c);else for(const s of[-1,1])P(b,G.s(.07),c,[s*.15,.8,0]);
    for(const s of[-1,1]){knopf(b,m,[s*.08,.66,.2],.03,'#2b2340');P(b,G.s(.08),c,[s*.22,.3,.06])}P(b,G.to(.32,.02),m.glow('#ffd0e8',1.2),[0,.02,0],[PI/2,0,0]).userData.noOutline=true;
    addOutlines(g);g.userData.b=b;return g}
  function onLoad(W){W_=W;pets=[];const m=makeMats({skin:'pluesch',color:0});const st=S();const r=srand(4242);
    for(let i=0;i<COUNT;i++){let d=null;for(let t=0;t<400&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.93||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(pets.some(x=>angle(x.d,cd)*W.R<22))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;d=cd}
      if(!d)continue;if(st.got.includes(i)){pets.push({i,d,g:null});continue}const g=petModel(m,i);GAME.placeObj(g,d,r()*TAU,0,true);const it={kind:'kuscheltier',p:d,r:1.6,label:'Verlaufenes Kuscheltier mitnehmen',act:()=>pick(i)};W.inter.push(it);pets.push({i,d,g,it})}}
  function pick(i){const st=S();if(st.got.includes(i))return;const t=pets.find(x=>x.i===i);if(!t)return;st.got.push(i);if(t.g&&t.g.parent)t.g.parent.remove(t.g);const k=W_.inter.indexOf(t.it);if(k>=0)W_.inter.splice(k,1);t.g=null;
    money(REWARD);persist();SND.play('pickup',{rate:1.15});const n=st.got.length;const nm=KIND[i%KIND.length][0];
    UI.toast('Kuschel-'+nm+' gefunden! ('+n+' von '+COUNT+') Das Fundbüro gibt dir '+REWARD+' Taler Finderlohn.',3200);
    if(typeof PIKO!=='undefined'&&n===1)PIKO.want('Ein verlaufenes Kuscheltier! Neun weitere warten noch irgendwo auf dem Planeten.');
    if(n===COUNT&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Bürgermeister Flicken',['Alle zehn Kuscheltiere sind wieder zu Hause! Das ganze Fundbüro kuschelt vor Freude.','Als Dank bekommst du den Riesen-Teddy. Er passt auf dein Zimmer auf.']);if(typeof bagAdd==='function')bagAdd('furn','riesenteddy');money(400);SND.jingle('j_success')},900)}}
  /* Kuscheltiere wippen leise hin und her und hüpfen kurz, wenn man näher kommt */
  function tick(dt,t,W,me){for(const k of pets){if(!k.g)continue;const b=k.g.userData.b;b.rotation.z=Math.sin(t*1.5+k.i)*.08;const near=me&&me.p?angle(me.p,k.d)*W.R<6:false;b.position.y=near?Math.abs(Math.sin(t*6+k.i))*.25:0}}
  return{onLoad,tick,pets:()=>pets,COUNT}
})();
window.FUNDB=FUNDB;
})();
