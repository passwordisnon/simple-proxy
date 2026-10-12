/* =====================================================================
   CYBORG-LABOR · planets/honigwabe.js · Honigwaben-Fabrik
   Ein goldener Planet, auf dem freundliche Spielzeug-Bienen Honig machen:
   Wabenbäume mit sechseckigen Kronen, Riesenblüten, Lavendelbüsche,
   Kleeblumen und Wachsfelsen. Die Häuser sind Waben-Häuser, Bienenkörbe
   und riesige Honiggläser.
   Besonderheit:
   · Schwänzeltanz: Im Bienenstock tanzt eine Biene. Die Richtung ihres
     Tanzes zeigt, wo eine versteckte Blütenwiese liegt, und wie lange sie
     tanzt, wie weit es ist. Ein grosser Pfeil über dem Stock zeigt die
     Richtung. Man folgt ihm, sammelt Pollen und bringt sie zurück. Vier
     Wiesen, vier Tänze. So verständigen sich echte Honigbienen.
   ===================================================================== */
(function(){
const ID='honigwabe';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT,leafShape}=NH;
const V=THREE.Vector3;
const BL=['#ff6fa5','#b89aff','#ffd23f','#ff9a45','#45e0ff','#ffffff'];
const hn=(m,c)=>m.c(c||'#ffb43a',{gloss:1.3,rim:1.2,rimColor:'#fff2c0'});
function biene(g,m,p,s,rot){const q=grp(g,p,rot||[0,0,0]);s=s||1;P(q,G.s(.2*s),hn(m,'#ffd23f'),[0,0,0],null,[1,.9,1.3]);for(const z of[-.06,.08])P(q,G.cy(.2*s,.2*s,.06*s,20),m.c('#3b3450'),[0,0,z*s],[PI/2,0,0],[1.01,1,.95]);
  P(q,G.s(.13*s),hn(m,'#ffd23f'),[0,.03*s,.28*s]);for(const x of[-1,1]){P(q,G.s(.04*s),m.c('#ffffff'),[x*.06*s,.07*s,.38*s]);P(q,G.s(.02*s),m.c('#2b2340'),[x*.06*s,.07*s,.41*s])}
  for(const x of[-1,1]){const w=P(q,G.s(.15*s),m.c('#e8f6ff',{opacity:.6,gloss:1.5}),[x*.17*s,.17*s,-.02*s],null,[1,.15,.7]);w.userData.noMerge=true;w.userData.noOutline=true}return q}
function wabeHex(g,m,p,r,col){return P(g,G.cy(r,r,r*.5,6),hn(m,col),p,[0,PI/6,0])}

/* ================= Natur ================= */
N('wabenbaum',{r:.4,h:4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3);P(g,G.cy(.14,.2,h,10),m.c('#a87a4a'),[0,h/2,0]);
  const cells=[[0,0],[1,0],[-1,0],[.5,.87],[-.5,.87],[.5,-.87],[-.5,-.87]];for(const[x,z]of cells){const yy=h+.3+(rnd()-.5)*.2;wabeHex(g,m,[x*.55,yy+(x===0&&z===0?.25:0),z*.55],.32,rnd()<.3?'#ffb43a':'#ffd27a')}});
N('riesenbluete',{r:.4,h:1.6,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,1,1.5);P(g,G.tu([[0,0,0],[.08,h*.5,0],[0,h,0]],.05,.04,10),m.c('#5ab86a'));const c=BL[Math.floor(rnd()*5)];
  for(let i=0;i<6;i++){const a=i/6*TAU;P(g,G.s(.22),m.c(c,{gloss:.7,rim:1.1,rimColor:'#ffffff'}),[Math.cos(a)*.24,h,Math.sin(a)*.24],null,[1,.3,1.5]).rotation.y=-a}P(g,G.s(.14),hn(m,'#ffd23f'),[0,h+.05,0]);
  for(let i=0;i<2;i++)P(g,new THREE.ShapeGeometry(leafShape(.4,.14),6),m.dbl('#5ab86a'),[0,h*.3+i*.2,0],[-.6,i*PI,0])});
N('lavendelbusch',{r:.4,h:1,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<9;i++){const a=rnd()*TAU,r=rnd()*.3,h=RR(rnd,.5,.9);P(g,G.cy(.015,.015,h,4),m.c('#7aa86a'),[Math.cos(a)*r,h/2,Math.sin(a)*r]);P(g,G.ca(.04,.18),m.c('#9b6ae0',{gloss:.6}),[Math.cos(a)*r,h+.08,Math.sin(a)*r])}});
N('kleeblume',{r:.12,h:.4,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<3;i++){const a=i/3*TAU;P(g,G.s(.05),m.c('#5ab86a'),[Math.cos(a)*.06,.05,Math.sin(a)*.06],null,[1,.3,1])}P(g,G.cy(.012,.012,.3,4),m.c('#5ab86a'),[0,.15,0]);P(g,G.s(.06),m.c(rnd()<.5?'#ffffff':'#ff9ab8'),[0,.32,0],null,[1,1.2,1])});
N('wachsfels',{r:.6,h:1,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.6,.1,3,rnd()*9),m.c('#f2d8a0',{gloss:.6}),[0,.32,0],null,[1.2,.6,1]);for(let i=0;i<4;i++){const a=rnd()*TAU;wabeHex(g,m,[Math.cos(a)*.35,.55+rnd()*.15,Math.sin(a)*.35],.15,'#ffc84a')}});
N('honiggras',{r:.12,h:.4,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#b8c860');for(let i=0;i<5;i++){const a=rnd()*TAU,h=RR(rnd,.2,.4);P(g,G.tu([[0,0,0],[Math.cos(a)*.06,h*.6,Math.sin(a)*.06],[Math.cos(a)*.1,h,Math.sin(a)*.1]],.018,.005,6),c)}});
Object.assign(NH.ROCK,{[ID]:['#f2d8a0','#e8c888','#ffb43a']});

/* ================= Biome ================= */
const BI={
  wabenwiese:{n:'Wabenwiese',g:['#a8d878','#9ccc6c'],cliff:'#c8a060',pat:'gras',grass:'#a4d474',grassD:.9,trees:[['wabenbaum',1]],treeD:.45,
    deco:[['kleeblume',5],['honiggras',4],['riesenbluete',1]],decoD:6,rocks:[['wachsfels',.3]],rockD:.3,litter:[['wachskruemel',1],['nektartropfen',.4]]},
  bluetenhain:{n:'Blütenhain',g:['#90cc70','#84c064'],cliff:'#a88a5a',pat:'moos',grass:'#90cc70',grassD:1,trees:[['wabenbaum',2.4]],treeD:1.2,
    deco:[['riesenbluete',3],['lavendelbusch',2],['kleeblume',2]],decoD:6,rocks:[['wachsfels',.2]],rockD:.2,litter:[['nektartropfen',1]]},
  lavendelfeld:{n:'Lavendelfeld',g:['#b8b0d8','#aca4cc'],cliff:'#8a80a8',pat:'gras',grass:'#a8a0d0',grassD:.6,trees:[['wabenbaum',.3]],treeD:.2,
    deco:[['lavendelbusch',6]],decoD:5,rocks:[['wachsfels',.3]],rockD:.3,litter:[['wachskruemel',.6]]},
  honigufer:{n:'Honig-Ufer',g:['#f2d898','#e8cc8c'],cliff:'#c8a060',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['kleeblume',2]],decoD:2,rocks:[['wachsfels',.6]],rockD:.4,litter:[['wachskruemel',1],['muschel',.5]]},
  wabengipfel:{n:'Wabengipfel',g:['#f8e8c0','#eedcb4'],cliff:'#d8b878',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['honiggras',1]],decoD:1,rocks:[['wachsfels',1.4]],rockD:.9,litter:[['wachskruemel',1.2]]}};

/* ================= Sammelsachen ================= */
IT('wachskruemel',itMeta('Wachskrümel','honigwabe','material',25),(g,m)=>{for(let i=0;i<3;i++)wabeHex(g,m,[Math.cos(i*2)*.08,.03,Math.sin(i*2)*.08],.06,'#f2d8a0')});
IT('nektartropfen',itMeta('Nektartropfen','honigwabe','material',50),(g,m)=>{P(g,G.s(.08),m.c('#ffd27a',{opacity:.8,gloss:1.5,rim:1.3}),[0,.08,0],null,[1,1.3,1])});

/* ================= Fische ================= */
F('honigbarsch',fishMeta('Honigbarsch','honigwabe','teich','M','tag',2,420,'Ich hab einen Honigbarsch gefangen! Er glänzt goldgelb wie frischer Honig.','Honig verdirbt fast nie. In alten ägyptischen Gräbern fand man Honig, der über 3000 Jahre alt und noch essbar war.'),
  (g,m)=>fishT(g,m,{id:'honigbarsch',H:.26,L:.7,back:'#e8962a',belly:'#fff2c0',tail:'fork',dorsal:'hi',pat:(x,w,h)=>{x.strokeStyle='#ffd27a';x.lineWidth=3;const r=10;for(let j=0;j<6;j++)for(let i=0;i<10;i++){const cx=i*r*1.75+(j%2)*r*.87,cy=j*r*1.5;x.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();x.stroke()}}}));
F('bluetenkarpfen',fishMeta('Blütenkarpfen','honigwabe','teich','S','immer',1,160,'Ich hab einen Blütenkarpfen gefangen! Er hat ein Blütenblatt auf der Stirn.','Manche Karpfen fressen herabfallende Blüten und Insekten von der Wasseroberfläche.'),
  (g,m)=>fishT(g,m,{id:'bluetenkarpfen',H:.2,L:.5,back:'#ff9ab8',belly:'#fff6f8',tail:'fan',dorsal:'std'}));
F('wachsforelle',fishMeta('Wachsforelle','honigwabe','meer','M','nacht',3,1200,'Ich hab eine Wachsforelle gefangen! Sie schimmert wie eine Kerze.','Bienen machen Wachs aus kleinen Drüsen am Bauch. Für ein Kilogramm Wachs brauchen sie etwa acht Kilogramm Honig.'),
  (g,m)=>fishT(g,m,{id:'wachsforelle',H:.22,L:.8,back:'#f2d8a0',belly:'#fffaf0',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#e8a050';for(let i=0;i<12;i++){x.beginPath();x.arc((i*41)%w,8+(i*17)%(h-16),4,0,TAU);x.fill()}}}));

/* ================= Insekten ================= */
B('arbeitsbiene',bugMeta('Arbeitsbiene','honigwabe','luft','tag',1,180,'Ich hab eine Arbeitsbiene gefangen! Sie hat ganz volle Pollenhöschen an den Beinen.','Für ein Glas Honig fliegen Bienen zusammen eine Strecke, die mehrmals um die ganze Erde reicht.'),
  (g,m)=>{biene(g,m,[0,.2,0],.8);P(g,G.s(.05),m.c('#ff9a45'),[.1,.1,-.02]);P(g,G.s(.05),m.c('#ff9a45'),[-.1,.1,-.02])});
B('schwebfliege',bugMeta('Schwebfliege','honigwabe','luft','tag',2,420,'Ich hab eine Schwebfliege gefangen! Sie sieht aus wie eine Biene, ist aber eine Fliege.','Schwebfliegen tun nur so, als wären sie Wespen oder Bienen. Sie können gar nicht stechen. Diese Verkleidung nennt man Mimikry.'),
  (g,m)=>{const c=m.c('#ffd23f',{gloss:1});P(g,G.ca(.06,.2),c,[0,.16,0],[PI/2,0,0]);for(const z of[-.04,.06])P(g,G.cy(.065,.065,.025,14),m.c('#3b3450'),[0,.16,z],[PI/2,0,0]);P(g,G.s(.07),m.c('#8a3a2a'),[0,.17,.17]);for(const s of[-1,1])P(g,G.s(.13),m.c('#e8f6ff',{opacity:.5}),[s*.13,.2,0],null,[1,.08,.5]).userData.noOutline=true});
B('wollschweber',bugMeta('Wollschweber','honigwabe','luft','tag',3,900,'Ich hab einen Wollschweber gefangen! Er ist flauschig wie ein Pompon und hat einen langen Rüssel.','Wollschweber stehen beim Trinken in der Luft still, wie kleine Kolibris. Ihr Rüssel ist so lang wie ihr Körper.'),
  (g,m)=>{P(g,G.s(.14),m.c('#c8945a',{gloss:.2,rim:1.3,rimColor:'#fff2c0'}),[0,.18,0]);P(g,G.cy(.008,.004,.22,6),m.c('#3b3450'),[0,.18,.22],[PI/2,0,0]);for(const s of[-1,1])P(g,G.s(.12),m.c('#3b3450',{opacity:.45}),[s*.14,.22,-.02],null,[1,.08,.6]).userData.noOutline=true});

/* ================= Fundstücke ================= */
REL('erste_honigwabe',relMeta('Die erste Honigwabe','honigwabe','schatz',3,2200,'Eine Wabe mit perfekt gleich grossen Sechsecken. Die Bienen haben sie ohne Lineal gebaut.','Sechsecke passen lückenlos aneinander und brauchen dabei am wenigsten Wachs. Darum bauen Bienen ihre Waben genau so.'),
  (g,m)=>{for(let i=0;i<7;i++){const a=i/6*TAU;const r=i===6?0:.2;wabeHex(g,m,[Math.cos(a)*r,.05,Math.sin(a)*r],.11,'#ffc84a')}});
REL('bienenwachs_siegel',relMeta('Wachssiegel','honigwabe','kunst',2,800,'Ein Siegel aus Bienenwachs mit einer kleinen Biene darauf.','Früher verschloss man Briefe mit Wachssiegeln. War das Siegel kaputt, wusste man: Jemand hat den Brief schon geöffnet.'),
  (g,m)=>{P(g,G.cy(.16,.18,.05,20),m.c('#c84a3a',{gloss:.9}),[0,.025,0]);biene(g,m,[0,.07,0],.35,[-PI/2,0,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  kolibri:{n:'Kolibri',planet:ID,biomes:['bluetenhain','wabenwiese'],count:4,size:.4,speed:1.8,gait:'hop',shy:true,voice:['tsip','tsi-tsi','zirr'],pitch:1100,likes:['nektartropfen','riesenbluete'],product:'nektartropfen',names:['Schwirr','Nektar','Flitz','Summi','Brummi'],
    fact:'Kolibris schlagen bis zu 80-mal pro Sekunde mit den Flügeln. Sie können als einzige Vögel rückwärts fliegen.',a:{col:'#2fb5d9',belly:'#7fd34a',body:[.18,.18,.24],by:.34,head:{r:.14,p:[0,.5,.2]},snout:{type:'beak',col:'#3b3450',len:1.1},ears:{type:'none'},legs:{n:2,len:.06,r:.02,foot:'#3b3450'},tail:{type:'fan',col:'#2fb5d9'},wings:{col:'#5ac8e8'},tuft:'#ff4a5a'}},
  pollenhamster:{n:'Pollen-Hamster',planet:ID,biomes:['lavendelfeld','wabenwiese','honigufer'],count:3,size:.5,speed:1,gait:'waddle',shy:true,voice:['piep','quiek','fiep'],pitch:800,likes:['wachskruemel','kleeblume'],product:'wachskruemel',names:['Backe','Pollini','Krümel','Hamsti','Puderzucker'],
    fact:'Hamster tragen Futter in ihren Backentaschen. Sie können darin fast so viel transportieren, wie ihr Kopf gross ist.',a:{col:'#f2c890',belly:'#fff6e0',body:[.3,.26,.32],head:{r:.24,p:[0,.38,.24]},snout:{type:'muzzle',col:'#fff6e0',nose:'#ff8ab0'},ears:{type:'round',len:.25},legs:{n:4,len:.05,r:.05,foot:'#ffb8c8'},tail:{type:'nub'},gait:'waddle'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','imkerhut','Imker-Hut',480,'#fffdf7',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.84),M.c(col),[0,0,0]);P(q,G.cy(r*1.3,r*1.3,r*.05),M.c(col),[0,0,0]);P(q,G.cy(r*1.25,r*1.05,r*.9,24,1,true),M.c('#3b3450',{opacity:.35,side:THREE.DoubleSide}),[0,-r*.45,0])});
def('top','bienenweste','Bienen-Weste',760,'#ffd23f',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);for(const yy of[-.25,-.6])P(q,G.cy(r*.85,r*.91,r*.14,Q(16),1,true),M.c('#3b3450'),[0,r*yy,0])});

/* ================= Möbel ================= */
furn('honigglas_lampe',{n:'Honigglas-Lampe',cat:'licht',price:1800,planet:ID,size:[1,1],h:1,b:(g,m)=>{P(g,G.cy(.25,.25,.5,20),m.c('#ffc84a',{opacity:.8,gloss:1.5,rim:1.3}),[0,.25,0]).userData.noMerge=true;P(g,G.s(.14),m.glow('#ffe0a0',1.6),[0,.25,0]);P(g,G.cy(.27,.27,.08,20),m.c('#ff4a5a'),[0,.54,0]);biene(g,m,[.1,.68,0],.5,[0,.6,0]);g.userData.light={p:[0,.3,0],c:'#ffd080',i:.8}}});
furn('wabenregal',{n:'Waben-Regal',cat:'deko',price:1400,planet:ID,size:[1,1],h:1.4,wall:true,b:(g,m)=>{const cells=[[0,.3],[.36,.3],[-.36,.3],[.18,.62],[-.18,.62],[0,.94]];for(const[x,y]of cells){P(g,G.cy(.2,.2,.3,6,1,true),hn(m,'#e8b060'),[x,y+.1,0],[PI/2,0,0])}P(g,G.s(.08),hn(m,'#ff9a2a'),[.36,.4,0])}});

/* ================= Sprache: Wabenschrift ================= */
function wabenGlyph(x,s,r){x.save();x.lineWidth=s*.05;const n=1+Math.floor(r()*3);const r0=s*.12;for(let i=0;i<n;i++){const cx=(i-(n-1)/2)*r0*1.8,cy=(i%2)*r0*.9;x.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+PI/6;x.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0)}x.closePath();r()<.4?x.fill():x.stroke()}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Honigwaben-Fabrik',base:'kompost',R:118,R0:40,sea:-.3,music:'town',sky:['#ffd890','#fff6e0'],fog:'#fff0d0',water:'#e8b040',deep:'#a8701a',step:1.05,shop:ID,
    desc:'Ein goldener Planet, auf dem Spielzeug-Bienen Honig machen. Im Bienenstock tanzt eine Biene den Weg zu versteckten Blütenwiesen.',weather:'blueten',orbit:[264,1.7],size:1,col:['#a8d878','#ffb43a'],moons:1,
    park:'bluetenhain',parkPond:true,phone:['#fff2c0','#ffe0f0'],stones:['kiesel','wachskruemel','stein_klein'],plazaTree:'wabenbaum',path:'#f2d898',
    space:{deep:'#a8701a',water:'#e8b040',shore:'#f2d898',land:'#a8d878',land2:'#90cc70',high:'#f8e8c0',cap:'#fff6e0',atmo:'#ffc84a',cloud:.4,sea:.34,capA:.4,freq:2.6},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'honigufer',wet:'bluetenhain',cold:'wabengipfel'},peak:'wabengipfel',
    raw(q,p,{N,N2,fbm}){return fbm(q,1.05,4)*2+.7},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'honigufer';if(h>sea+4.3)return'wabengipfel';if(T>.32)return'lavendelfeld';if(M>.2)return'bluetenhain';return'wabenwiese'},
    onLoad:W=>TANZ.onLoad(W),tick:(dt,t,W,me)=>TANZ.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Waben-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Honigteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Nektarsee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Bienen-Spielecke',mode:'Imker-Mode',praxis:'Stich-Praxis',museum:'Bienen-Museum',shop:'Honigladen',studio:'Wachs-Atelier',bar:'Tee-und-Honig-Bar',rathaus:'Bienenstock-Rathaus',garage:'Blütenstaub-Garage',pflanzen:'Bienenweide-Gärtnerei',tiere:'Bestäuber-Laden'},
  sty:{wall:'putz',walls:['#fff6e0','#fffaf0','#fff2e8'],roof:'dome',roofs:['#ffb43a','#e8962a','#ffd27a','#ff6fa5'],trim:'#fff2c0',plinth:'#c8a060',door:'#ff9a45',win:'rund',pitch:.9},
  wall:'streifen',floor:'parkett',
  mayor:['Königin Summsala',{skin:'pluesch',color:2,shape:'ei'},{kopf:'eikopf',augen:'mensch',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen in der Honigwaben-Fabrik! Hier summt es den ganzen Tag. Keine Sorge, unsere Bienen sind aus Plüsch und Plastik.','Im grossen Bienenstock tanzt eine Biene. Ihr Tanz zeigt dir den Weg zu einer versteckten Blütenwiese.','Echte Honigbienen erzählen sich mit dem Schwänzeltanz, wo es Futter gibt. Die Richtung zeigt der Tanz, die Entfernung seine Dauer.'],
  caveRock:['#f2d8a0','#e8c888','#c8a060',['#ffb43a','#ff6fa5','#b89aff']],
  wear:['imkerhut','bienenweste','kappe','halstuch'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_yellowA'],veg:null},
    plan:[{fam:'kokon',style:'wabenhaus'},{fam:'kokon',style:'bienenkorb'},{fam:'kokon',style:'honigglas'},{fam:'kokon',style:'wabenhaus'}]},
  residents:{skins:['pluesch','fell','bonbon','gold'],heads:['eikopf','vogel','katze','mensch','frosch','eule'],names:['Summsi','Wabe','Honig','Pollen','Nektar','Brumm','Blüte','Wachs','Imki','Klee','Lavendel','Goldi'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fff6e0','#fffaf0','#fff2e8'],roofCols:['#ffb43a','#e8962a','#ffd27a'],win:['rund']},deco:['riesenbluete','lavendelbusch','wabenbaum'],fence:false},
  lang:{n:'Wabenschrift',ink:'#a8701a',glow:'#ffb43a',kind:'runes',draw:wabenGlyph,syl:['sum','ms','wa','be','ho','nig','po','llen','ne','ktar','bl','üte']},ruinStone:'#e8c888',
  terraform:['wabenwiese','bluetenhain','lavendelfeld','honigufer'],
  weather:[['klar',4],['heiter',3],['regen',1]]});

/* ================= Schwänzeltanz ================= */
const TANZ=(()=>{let W_=null,m_=null,hive=null,meadows=[],arrow=null,dancer=null,carrying=false;const COUNT=4,REACH=6,LOHN=150;
  const S=()=>SAVE.tanz=SAVE.tanz||{done:[]};
  const cur=()=>{const st=S();return meadows.find(x=>!st.done.includes(x.i))||null};
  function hiveModel(m){const g=new THREE.Group();const n=7;for(let i=0;i<n;i++){const t=i/n;const r=2.4*Math.cos(t*PI/2*.92),y=4*Math.sin(t*PI/2);P(g,G.to(r,.32),m.c(i%2?'#e8c070':'#d8a858'),[0,y+.25,0],[PI/2,0,0])}
    P(g,G.s(2.35),m.c('#e0b464'),[0,0,0],null,[1,1.7,1]);P(g,G.cy(.7,.7,.2,20),m.c('#5a3a1a'),[0,.7,-2.2],[PI/2,0,0]);
    const board=grp(g,[0,0,-3.6]);P(board,G.cy(1.6,1.6,.2,6),hn(m,'#ffd27a'),[0,.1,0],[0,PI/6,0]);const dz=grp(board,[0,.35,0]);const b=biene(dz,m,[0,0,0],1.4);
    const sign=ctex('tanz-sign',256,64,(x,w,h)=>{x.fillStyle='#3b3450';x.fillRect(0,0,w,h);x.fillStyle='#ffd27a';x.font='900 26px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('TANZBODEN',w/2,h/2+2)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(2,.5),new THREE.MeshBasicMaterial({map:sign,side:THREE.DoubleSide}));sm.position.set(0,1.1,1.6);sm.userData.noOutline=true;board.add(sm);
    addOutlines(g);g.userData.dz=dz;g.userData.bee=b;return g}
  function meadowModel(m,i){const g=new THREE.Group();const c=BL[i%5];for(let k=0;k<9;k++){const a=k/9*TAU,r=k?1.4:0;const q=grp(g,[Math.cos(a)*r,0,Math.sin(a)*r]);const h=1+(k%3)*.25;P(q,G.cy(.04,.05,h,6),m.c('#5ab86a'),[0,h/2,0]);for(let j=0;j<6;j++){const b=j/6*TAU;P(q,G.s(.2),m.c(c,{gloss:.7,rim:1.1}),[Math.cos(b)*.22,h,Math.sin(b)*.22],null,[1,.3,1.4]).rotation.y=-b}P(q,G.s(.13),hn(m,'#ffd23f'),[0,h+.05,0])}
    const ring=P(g,G.to(2.2,.06),m.glow('#ffe86a',1.4),[0,.08,0],[PI/2,0,0]);ring.userData.noOutline=true;addOutlines(g);g.userData.ring=ring;g.visible=false;return g}
  function arrowModel(m){const g=new THREE.Group();P(g,G.bx(.5,.2,3,.08),hn(m,'#ff9a45'),[0,0,1.5]);P(g,G.co(.7,1.2,4),hn(m,'#ff9a45'),[0,0,3.6],[PI/2,0,0],[1,1,.35]);addOutlines(g);return g}
  function onLoad(W){W_=W;meadows=[];hive=null;carrying=false;m_=makeMats({skin:'plastik',color:0});const r=srand(7373);const pl=GAME.G.places.find(p=>p.id==='platz');
    let d=null;for(const[lo,hi,np]of[[24,42,1.4],[20,70,1.2],[16,120,1.05]]){for(let t=0;t<800&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=pl?angle(cd,pl.dir)*W.R:99;if(a<lo||a>hi)continue;if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.4)continue;if(GAME.nearPlace&&GAME.nearPlace(cd,np))continue;d=cd}if(d)break}
    if(!d)return;const g=hiveModel(m_);GAME.placeObj(g,d,r()*TAU,0,true);hive={d,g};W.inter.push({kind:'bienenstock',p:d,r:5.5,label:'Bienenstock: Tanz anschauen',act:()=>visit()});
    arrow=arrowModel(m_);GAME.G.scene.add(arrow);arrow.visible=false;
    const st=S();for(let i=0;i<COUNT;i++){let md=null;for(let t=0;t<600&&!md;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=angle(cd,d)*W.R;if(a<30+i*12||a>60+i*15)continue;if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(meadows.some(x=>angle(x.d,cd)*W.R<25))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;md=cd}
      if(!md)continue;const mg=meadowModel(m_,i);GAME.placeObj(mg,md,r()*TAU,0,true);if(st.done.includes(i))mg.visible=true;meadows.push({i,d:md,g:mg})}}
  function dist(a,b){return Math.round(angle(a,b)*W_.R)}
  async function visit(){const st=S();const c=cur();if(carrying){carrying=false;st.done.push(c.i);persist();money(LOHN);SND.play('pickup',{rate:1.1});
      await UI.talk('Königin Summsala',['Pollen! Danke, die Wabe wird gleich ein bisschen voller. Plus '+LOHN+' Taler.']);
      if(st.done.length>=COUNT&&!st.allDone){st.allDone=true;persist();await UI.talk('Königin Summsala',['Du hast alle vier Blütenwiesen gefunden! Du verstehst den Bienentanz besser als manche Biene.','Nimm diese Honigglas-Lampe mit. Und die erste Honigwabe für das Museum.']);bagAdd('furn','honigglas_lampe');bagAdd('relic','erste_honigwabe');money(300);SND.jingle('j_success');arrow.visible=false;return}}
    const n=cur();if(!n){UI.toast('Alle Blütenwiesen sind entdeckt. Die Bienen summen zufrieden.',2400);return}
    const km=dist(hive.d,n.d);const weit=km<45?'nicht weit':km<70?'ein gutes Stück':'ziemlich weit';
    await UI.talk('Tanzbiene',['Summ! Schau genau: Ich tanze in die Richtung, in die du gehen musst. Der grosse Pfeil zeigt sie dir auch.','Ich wackle '+(km<45?'kurz':km<70?'eine Weile':'lange')+'. Das heisst: Die Wiese ist '+weit+' weg, etwa '+km+' Schritte.']);
    if(typeof PIKO!=='undefined'&&!st.done.length)PIKO.want('Der Bienentanz zeigt die Richtung! Folge dem orangen Pfeil am Bienenstock.')}
  function tick(dt,t,W,me){if(!hive)return;const n=cur();const dz=hive.g.userData.dz;
    if(n){/* Tanzrichtung = Richtung zur Wiese, in der Tangentialebene des Stocks */const up=hive.d;const toN=n.d.clone().sub(up.clone().multiplyScalar(n.d.dot(up))).normalize();
      arrow.visible=!carrying;arrow.position.copy(up).multiplyScalar(W.R+(W.hExact||W.hAt)(up)+7.5+Math.sin(t*2)*.2);arrow.up.copy(up);arrow.lookAt(arrow.position.clone().add(toN));
      const inv=hive.g.quaternion.clone().invert();const loc=toN.clone().applyQuaternion(inv);const yaw=Math.atan2(loc.x,loc.z);dz.rotation.y=yaw;const w=Math.sin(t*14)*.25;hive.g.userData.bee.rotation.y=w;hive.g.userData.bee.position.z=Math.sin(t*2)*.6;
      if(!carrying&&me&&me.p&&angle(me.p,n.d)*W.R<REACH){carrying=true;n.g.visible=true;SND.play('powerup',{rate:1.2});UI.toast('Eine Blütenwiese! Du sammelst Pollen. Bring sie zurück zum Bienenstock.',3200)}}
    else arrow.visible=false;for(const m of meadows)if(m.g.visible)m.g.userData.ring.scale.setScalar(1+Math.sin(t*2+m.i)*.05)}
  return{onLoad,tick,hive:()=>hive,meadows:()=>meadows,_visit:visit,get carrying(){return carrying}}
})();
window.TANZ=TANZ;
})();
