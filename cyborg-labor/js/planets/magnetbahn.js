/* =====================================================================
   CYBORG-LABOR · planets/magnetbahn.js · Magnetbahn-Ring
   Um diesen Planeten läuft eine Magnetschwebebahn auf einer hohen
   Ringstrecke. Magnetbäume mit Eisenspan-Kronen, Kompassblumen, die alle
   nach Norden zeigen, Ferrotropfen und Hufeisen-Felsen. Die Häuser sind
   Bahnhöfe mit Glasdach, ausgemusterte Bahnwagen und Spulen-Häuser mit
   einem roten Hufeisenmagneten auf dem Dach.
   Besonderheit:
   · Mitfahren: Der Zug fährt ständig im Kreis. An drei Bahnhöfen kann
     man einsteigen und bis zum nächsten Bahnhof mitfahren, hoch über dem
     Planeten. Wer an allen drei Bahnhöfen ausgestiegen ist, bekommt das
     Magnetbahn-Modell für sein Zimmer.
   ===================================================================== */
(function(){
const ID='magnetbahn';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const MAG=['#ff4a5a','#2fb5d9','#9b6ae0','#ffd23f'];
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1.1,rimColor:'#ffffff'});
const chr=m=>m.c('#e6ecf5',{gloss:1.4});
function hufeisen(g,m,p,s,rot){const q=grp(g,p,rot||[0,0,0]);P(q,new THREE.TorusGeometry(.3*s,.1*s,10,18,PI),gl(m,'#ff4a5a'),[0,.45*s,0]);for(const x of[-.3,.3]){P(q,G.cy(.1*s,.1*s,.45*s,10),gl(m,'#ff4a5a'),[x*s,.225*s,0]);P(q,G.cy(.105*s,.105*s,.12*s,10),chr(m),[x*s,.04*s,0])}return q}

/* ================= Natur ================= */
N('magnetbaum',{r:.35,h:4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3);P(g,G.cy(.12,.16,h,10),m.c('#c8ccd8',{gloss:1.3}),[0,h/2,0]);
  const n=3;for(let i=0;i<n;i++){const a=i/n*TAU+rnd(),r=i?.5:0;const c=[Math.cos(a)*r,h+.5+(i?0:.3),Math.sin(a)*r];const cc=['#6a7ac8','#8a6ac8','#5a8ab8'][i%3];P(g,G.s(.5),m.c(cc,{gloss:1.4,rim:1.2,rimColor:'#ffffff'}),c);
    for(let k=0;k<14;k++){const th=Math.acos(1-2*(k+.5)/14),ph=k*2.4;const dv=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));const sp=P(g,G.co(.07,.32,6),m.c(cc,{gloss:1.5,rim:1.2,rimColor:'#ffffff'}),[c[0]+dv.x*.55,c[1]+dv.y*.55,c[2]+dv.z*.55]);sp.quaternion.setFromUnitVectors(new V(0,1,0),dv)}}});
N('kompassblume',{r:.15,h:.7,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.4,.65);P(g,G.cy(.02,.025,h,6),m.c('#7fd34a'),[0,h/2,0]);const q=grp(g,[0,h,0]);
  P(q,G.cy(.14,.14,.04,18),gl(m,'#fffdf7'),[0,0,0]);P(q,G.to(.14,.02),gl(m,MAG[Math.floor(rnd()*4)]),[0,.02,0],[PI/2,0,0]);const nd=grp(q,[0,.03,0]);P(nd,G.co(.035,.11,4),m.c('#ff4a5a'),[0,0,.055],[PI/2,0,0],[1,1,.4]);P(nd,G.co(.035,.11,4),m.c('#3b3450'),[0,0,-.055],[-PI/2,0,0],[1,1,.4]);
  const ph=rnd()*9;g.userData.tick=t=>{nd.rotation.y=Math.sin(t*1.3+ph)*.25}});
N('eisenspanbusch',{r:.45,h:.8,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<5;i++){const a=i/5*TAU+rnd();const pts=[];for(let k=0;k<=10;k++){const t=k/10*PI;pts.push([Math.cos(a)*Math.sin(t)*.45,Math.sin(t)*.55+.02,Math.sin(a)*Math.sin(t)*.45*(1-Math.cos(t)*.2)])}P(g,G.tu(pts,.025,.025,14),m.c('#5a5e70',{gloss:1.3}))}hufeisen(g,m,[0,0,0],.7)});
N('ferrotropfen',{r:.35,h:.6,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.s(.3),m.c('#4a3a7a',{gloss:1.6,rim:1.3,rimColor:'#d8c8ff'}),[0,.12,0],null,[1.2,.5,1.2]);for(let k=0;k<12;k++){const a=k*2.4,r=k%3*.08+.05;P(g,G.co(.05,.18+(k%4)*.05,6),m.c('#4a3a7a',{gloss:1.6,rim:1.3,rimColor:'#d8c8ff'}),[Math.cos(a)*r,.2,Math.sin(a)*r])}});
N('magnetfels',{r:.7,h:1.4,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.6,.1,3,rnd()*9),m.c('#8a8ea0'),[0,.25,0],null,[1.2,.55,1]);hufeisen(g,m,[0,.35,0],1.8,[0,rnd()*TAU,(rnd()-.5)*.4])});
N('schienengras',{r:.12,h:.4,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=gl(m,'#7fd34a');for(let i=0;i<4;i++){const a=rnd()*TAU,h=RR(rnd,.18,.38);P(g,G.bx(.03,h,.03,.01),c,[Math.cos(a)*.08,h/2,Math.sin(a)*.08],[0,a,(rnd()-.5)*.3])}});
Object.assign(NH.ROCK,{[ID]:['#8a8ea0','#7a7e90','#ff4a5a']});

/* ================= Biome ================= */
const BI={
  ringwiese:{n:'Ringwiese',g:['#a4dc88','#98d07c'],cliff:'#8a8ea0',pat:'gras',grass:'#9cd880',grassD:.9,trees:[['magnetbaum',1]],treeD:.45,
    deco:[['kompassblume',5],['schienengras',4],['eisenspanbusch',1]],decoD:6,rocks:[['magnetfels',.3]],rockD:.3,litter:[['eisenspan',1],['magnetstein',.4]]},
  spulenwald:{n:'Spulenwald',g:['#8cc874','#80bc68'],cliff:'#7a7e90',pat:'moos',grass:'#8cc874',grassD:1,trees:[['magnetbaum',2.8]],treeD:1.4,
    deco:[['eisenspanbusch',3],['kompassblume',2]],decoD:5,rocks:[['magnetfels',.3]],rockD:.3,litter:[['eisenspan',1.4]]},
  eisenspanfeld:{n:'Eisenspan-Feld',g:['#c8ccd8','#bcc0cc'],cliff:'#7a7e90',pat:'staub',grass:null,grassD:0,trees:[['magnetbaum',.3]],treeD:.2,
    deco:[['ferrotropfen',1.2],['schienengras',2],['kompassblume',1]],decoD:2.5,rocks:[['magnetfels',.8]],rockD:.6,litter:[['eisenspan',1.6],['magnetstein',.8]]},
  polufer:{n:'Pol-Ufer',g:['#c8e8f4','#b8dcec'],cliff:'#8aa0c0',pat:'sand',grass:'#b8e0ec',grassD:.3,trees:[],treeD:0,
    deco:[['ferrotropfen',.4],['kompassblume',1.5]],decoD:2,rocks:[['magnetfels',.4]],rockD:.3,litter:[['magnetstein',.8],['muschel',.6]]},
  polkappe:{n:'Polkappe',g:['#f4f8ff','#e8eef8'],cliff:'#b8c4d8',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['schienengras',1]],decoD:1,rocks:[['magnetfels',1]],rockD:.7,litter:[['magnetstein',1]]}};

/* ================= Sammelsachen ================= */
IT('eisenspan',itMeta('Eisenspäne','magnetbahn','material',25),(g,m)=>{for(let k=0;k<9;k++)P(g,G.bx(.015,.015,.09,0),m.c('#5a5e70',{gloss:1.3}),[Math.cos(k*2.1)*.08,.02,Math.sin(k*2.1)*.08],[0,k,0])});
IT('magnetstein',itMeta('Magnetstein','magnetbahn','material',60),(g,m)=>{P(g,G.blob(.13,.15,3,4),m.c('#3b3450',{gloss:1.2}),[0,.1,0]);for(let k=0;k<5;k++)P(g,G.bx(.012,.012,.07,0),m.c('#8a8ea0'),[Math.cos(k*1.3)*.12,.16,Math.sin(k*1.3)*.12],[.6,k,0])});

/* ================= Fische ================= */
F('magnetlachs',fishMeta('Magnet-Lachs','magnetbahn','meer','L','tag',2,700,'Ich hab einen Magnet-Lachs gefangen! Er weiss immer, wo Norden ist.','Lachse finden nach Jahren im Meer zurück in den Fluss, in dem sie geschlüpft sind. Dabei hilft ihnen das Magnetfeld der Erde.'),
  (g,m)=>fishT(g,m,{id:'magnetlachs',H:.24,L:.95,back:'#7a8aa8',belly:'#ffd8c8',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ff4a5a';x.fillRect(w*.25,h*.45,w*.5,h*.08)}}));
F('schienenaal',fishMeta('Schienen-Aal','magnetbahn','teich','M','nacht',2,480,'Ich hab einen Schienen-Aal gefangen! Er schwimmt schnurgerade wie auf Schienen.','Europäische Aale schwimmen tausende Kilometer bis in die Sargassosee zum Laichen. Wie sie den Weg finden, ist bis heute nicht ganz geklärt.'),
  (g,m)=>{const pts=[];for(let k=0;k<=8;k++)pts.push([0,0,(k/8-.5)*1.1]);P(g,G.tu(pts,.06,.03,20),gl(m,'#5a6a7a'));P(g,G.tu(pts.map(p=>[p[0],p[1]+.045,p[2]]),.015,.01,20),m.c('#ffd23f'));eye(g,m,[.04,.03,.5],.025,[.6,.3,.6]);eye(g,m,[-.04,.03,.5],.025,[-.6,.3,.6])});
F('polscholle',fishMeta('Pol-Scholle','magnetbahn','meer','M','immer',1,240,'Ich hab eine Pol-Scholle gefangen! Ihre beiden Augen sind auf einer Seite.','Junge Schollen schwimmen wie normale Fische. Beim Erwachsenwerden wandert ein Auge auf die andere Seite, und sie legen sich flach auf den Boden.'),
  (g,m)=>{P(g,G.s(.32),gl(m,'#c8a878'),[0,0,0],null,[1,.15,1.4]);for(let k=0;k<5;k++)P(g,G.s(.04),m.c('#ff8a3a'),[Math.cos(k*1.7)*.18,.045,Math.sin(k*1.7)*.28]);P(g,G.co(.1,.15,3),gl(m,'#c8a878'),[0,0,-.5],[-PI/2,0,0],[1,1,.2]);eye(g,m,[.06,.05,.3],.03,[.3,.9,.2]);eye(g,m,[-.04,.05,.26],.03,[.3,.9,.2])});

/* ================= Insekten ================= */
B('kompasskaefer',bugMeta('Kompasskäfer','magnetbahn','boden','nacht',2,460,'Ich hab einen Kompasskäfer gefangen! Er läuft immer genau geradeaus.','Mistkäfer rollen ihre Kugel nachts schnurgerade. Sie orientieren sich dabei an der Milchstrasse am Himmel.'),
  (g,m)=>{P(g,G.s(.19),m.c('#2b2340',{gloss:1.4}),[0,.16,0],null,[1,.7,1.2]);P(g,G.cy(.08,.08,.02,16),gl(m,'#fffdf7'),[0,.3,0]);P(g,G.co(.02,.07,4),m.c('#ff4a5a'),[0,.32,.02],[PI/2,0,0]);bugFace(g,m,[0,.17,.26],.07,.5);legs(g,m.c('#2b2340'),[[.1,.12,.1],[0,.12,0],[-.1,.12,-.1]],.2)});
B('magnetmotte',bugMeta('Magnetmotte','magnetbahn','luft','nacht',1,190,'Ich hab eine Magnetmotte gefangen! Sie fliegt jedes Jahr denselben Weg.','In Australien wandern Bogong-Falter jedes Jahr über 1000 Kilometer in dieselben Berghöhlen. Sie spüren dabei das Magnetfeld der Erde.'),
  (g,m)=>butterfly(g,m,'magnetmotte','#8a7a60','#5a4a3a','#3b3450'));
B('blitzlibelle',bugMeta('Blitz-Libelle','magnetbahn','luft','tag',3,900,'Ich hab eine Blitz-Libelle gefangen! Sie ist fast so schnell wie der Zug.','Libellen gehören zu den schnellsten Insekten. Manche erreichen über 50 Kilometer pro Stunde und können sogar rückwärts fliegen.'),
  (g,m)=>{const bm=gl(m,'#ff4a5a');P(g,G.ca(.035,.6),bm,[0,.22,-.1],[PI/2,0,0]);P(g,G.s(.08),bm,[0,.22,.28]);bugFace(g,m,[0,.23,.34],.06,.5);for(const s of[-1,1])for(const z of[.1,0])P(g,G.s(.26),m.c('#e8f6ff',{opacity:.5,gloss:1.4}),[s*.3,.24,z],null,[1.2,.04,.26]).userData.noOutline=true});

/* ================= Fundstücke ================= */
REL('erste_fahrkarte',relMeta('Erste Fahrkarte','magnetbahn','schatz',2,900,'Die allererste Fahrkarte der Ringbahn. Gelocht am 1. Januar 2000, 00:01 Uhr.','Magnetschwebebahnen berühren die Schiene nicht. Starke Magnete lassen den Zug ein paar Zentimeter darüber schweben.'),
  (g,m)=>{P(g,G.bx(.4,.008,.22,.01),m.c('#fff2c0'),[0,.01,0]);P(g,G.bx(.4,.009,.05,0),m.c('#ff4a5a'),[0,.012,-.06]);P(g,G.cy(.02,.02,.012,10),m.c('#3b3450'),[.12,.014,.04])});
REL('kompass_alt',relMeta('Alter Kompass','magnetbahn','kunst',3,2000,'Ein Messingkompass. Die Nadel zittert ein wenig, wenn der Zug vorbeifährt.','Eine Kompassnadel ist ein kleiner Magnet. Die Erde ist selbst ein riesiger Magnet, und die Nadel richtet sich nach ihm aus.'),
  (g,m)=>{P(g,G.cy(.22,.22,.08,24),m.c('#c8a040',{gloss:1.4}),[0,.04,0]);P(g,G.cy(.19,.19,.01,24),m.c('#fffdf7'),[0,.085,0]);P(g,G.co(.03,.14,4),m.c('#ff4a5a'),[0,.095,.06],[PI/2,0,0],[1,1,.3]);P(g,G.co(.03,.14,4),m.c('#3b3450'),[0,.095,-.06],[-PI/2,0,0],[1,1,.3])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  kompassvogel:{n:'Kompass-Rotkehlchen',planet:ID,biomes:['ringwiese','spulenwald'],count:4,size:.5,speed:1.3,gait:'hop',voice:['tilit','tsi','zirr'],pitch:880,likes:['eisenspan','kompassblume'],product:'eisenspan',names:['Nordi','Pole','Rotkehl','Kompi','Zugi'],
    fact:'Rotkehlchen können das Magnetfeld der Erde spüren. Forscher vermuten, dass sie es sogar mit den Augen «sehen».',a:{col:'#8a7a60',belly:'#ff8a4a',body:[.24,.24,.3],by:.26,head:{r:.17,p:[0,.5,.24]},snout:{type:'beak',col:'#3b3450',len:.35},ears:{type:'none'},legs:{n:2,len:.12,r:.03,foot:'#8a6a4a'},tail:{type:'fan',col:'#7a6a50'},wings:{col:'#7a6a50'}}},
  graumull:{n:'Graumull',planet:ID,biomes:['eisenspanfeld','ringwiese','polufer'],count:3,size:.55,speed:.7,gait:'waddle',shy:true,voice:['quiek','grr','pfiep'],pitch:500,likes:['magnetstein','eisenspan'],product:'magnetstein',names:['Buddel','Grauli','Tunnel','Mulli','Pol'],
    fact:'Graumulle leben unter der Erde in Afrika. Sie bauen ihre Gänge mithilfe des Magnetfelds – fast wie mit einem eingebauten Kompass.',a:{col:'#a8a0a0',belly:'#d8d0d0',body:[.3,.24,.42],head:{r:.2,p:[0,.3,.36]},snout:{type:'muzzle',col:'#ffb8c8',nose:'#ff8ab0'},eyes:{r:.03},ears:{type:'none'},legs:{n:4,len:.06,r:.06,foot:'#ffb8c8'},tail:{type:'nub'},gait:'waddle'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','zugmuetze','Zugbegleiter-Mütze',520,'#2fb5d9',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.cy(r*.82,r*.78,r*.4,Q(18)),M.c(col),[0,r*.12,0]);P(q,G.cy(r*.5,r*.5,r*.05),M.c('#3b3450'),[0,-.02,r*.55],[PI/2-.2,0,0],[1,1,.5]);P(q,G.cy(r*.84,r*.84,r*.08,Q(18)),M.c('#ffd23f',{gloss:1.2}),[0,0,0])});
def('top','magnetjacke','Magnet-Jacke',860,'#ff4a5a',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);P(q,G.cy(r*.85,r*.91,r*.45,Q(16),1,true),M.c('#e6ecf5',{gloss:1.3}),[0,-r*.67,0])});

/* ================= Möbel ================= */
furn('magnetbahn_modell',{n:'Magnetbahn-Modell',cat:'spiel',price:2600,planet:ID,size:[2,2],h:.8,b:(g,m)=>{P(g,G.cy(.9,.9,.06,32),m.c('#a4dc88'),[0,.03,0]);P(g,G.to(.7,.04,TAU),chr(m),[0,.45,0],[PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(g,G.cy(.025,.025,.42),chr(m),[Math.cos(a)*.7,.24,Math.sin(a)*.7])}
  const tr=grp(g,[0,.52,0]);for(let k=0;k<3;k++){const a=k*.28;const c=P(tr,G.ca(.06,.16),gl(m,k?'#fbfbfd':'#ff4a5a'),[Math.cos(a)*.7,0,Math.sin(a)*.7],[PI/2,0,0]);c.rotation.z=-a}g.userData.tick=t=>{tr.rotation.y=-t*.8}}});
furn('hufeisenlampe',{n:'Hufeisen-Lampe',cat:'licht',price:900,planet:ID,size:[1,1],h:1,b:(g,m)=>{hufeisen(g,m,[0,0,0],1.6);P(g,G.s(.14),m.glow('#ffe8a0',1.6),[0,.5,0]);g.userData.light={p:[0,.5,0],c:'#ffe8a0',i:.8}}});

/* ================= Sprache: Feldlinien-Schrift ================= */
function feldGlyph(x,s,r){x.save();x.lineWidth=s*.06;const n=2+Math.floor(r()*2);for(let i=0;i<n;i++){const k=(i+1)*s*.09;x.beginPath();x.ellipse(0,0,k*1.6,k,0,r()<.5?0:PI*.1,PI*(1.6+r()*.4));x.stroke()}x.fillRect(-s*.04,-s*.32,s*.08,s*.64);x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Magnetbahn-Ring',base:'kompost',R:120,R0:40,sea:-.3,music:'town',sky:['#9fc8ff','#f0f4ff'],fog:'#e8eefa',water:'#5ab8e8',deep:'#2a6ac0',step:1.05,shop:ID,
    desc:'Eine Magnetschwebebahn fährt hoch über dem Planeten im Kreis. Steig an einem der drei Bahnhöfe ein und fahr mit.',weather:'blueten',orbit:[215,3.4],size:1,col:['#a4dc88','#ff4a5a'],moons:1,
    park:'ringwiese',parkPond:true,phone:['#e8f0ff','#ffe0e4'],stones:['kiesel','magnetstein','stein_klein'],plazaTree:'magnetbaum',path:'#d4d8e4',
    space:{deep:'#2a6ac0',water:'#5ab8e8',shore:'#c8e8f4',land:'#a4dc88',land2:'#8cc874',high:'#c8ccd8',cap:'#f4f8ff',atmo:'#9fc8ff',cloud:.45,sea:.36,capA:.5,freq:2.8},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'eisenspanfeld',wet:'polufer',cold:'polkappe'},peak:'polkappe',
    raw(q,p,{N,N2,fbm}){return fbm(q,1.1,4)*1.9+.7},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'polufer';if(h>sea+4.2)return'polkappe';if(T>.3)return'eisenspanfeld';if(M>.2)return'spulenwald';return'ringwiese'},
    onLoad:W=>RING.onLoad(W),tick:(dt,t,W,me)=>RING.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Ring-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Polteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Spulensee',lat:-40,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Bahnhofs-Spielecke',mode:'Uniform-Laden',praxis:'Bahnhofs-Praxis',museum:'Eisenbahn-Museum',shop:'Kiosk',studio:'Fahrplan-Atelier',bar:'Speisewagen',rathaus:'Stellwerk',garage:'Lokschuppen',pflanzen:'Gleis-Gärtnerei',tiere:'Kompass-Tierladen'},
  sty:{wall:'putz',walls:['#fbf7f0','#f2f8ff','#f6f2ff'],roof:'dome',roofs:MAG,trim:'#e6ecf5',plinth:'#8a8ea0',door:'#2fb5d9',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Stellwerkerin Weiche',{skin:'plastik',color:3,shape:'kapselspiel'},{kopf:'kapselkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen am Magnetbahn-Ring! Der Zug schwebt seit dem 1. Januar 2000 um den Planeten und war noch nie zu spät.','An drei Bahnhöfen kannst du einsteigen. Von oben sieht man fast den halben Planeten.','Alle Kompassblumen zeigen nach Norden. Fast alle. Eine ist ein bisschen eigensinnig.'],
  caveRock:['#8a8ea0','#7a7e90','#5a5e70',MAG.slice(0,3)],
  wear:['zugmuetze','magnetjacke','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'bahnhof'},{fam:'kokon',style:'wagenhaus'},{fam:'kokon',style:'spulenhaus'},{fam:'kokon',style:'wagenhaus'}]},
  residents:{skins:['plastik','bonbon','gold','glas'],heads:['kapselkopf','crtkopf','vogel','mensch','katze','eikopf','frosch'],names:['Weiche','Gleis','Pol','Spule','Ringo','Takt','Halt','Kurve','Magni','Schwebi','Nordi','Fahrplan'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fbf7f0','#f2f8ff','#f6f2ff'],roofCols:MAG,win:['rund']},deco:['kompassblume','eisenspanbusch','magnetbaum'],fence:false},
  lang:{n:'Feldlinien-Schrift',ink:'#2a6ac0',glow:'#ff4a5a',kind:'circuit',draw:feldGlyph,syl:['ma','gne','ring','po','la','fe','ld','zu','gi','ra','no','sü']},ruinStone:'#8a8ea0',
  terraform:['ringwiese','spulenwald','polufer','eisenspanfeld'],
  weather:[['klar',4],['heiter',3],['regen',1],['nebel',1]]});

/* ================= Ringbahn ================= */
const RING=(()=>{let W_=null,A=null,U=null,Vv=null,TH=null,train=null,th=0,riding=false,inTrain=false,stations=[],m_=null,sc=null;const NS=720,IDLE=.05,FAST=.12,GAP=.045;
  const S=()=>SAVE.ring=SAVE.ring||{seen:[]};
  const dirAt=a=>U.clone().multiplyScalar(Math.cos(a)).addScaledVector(Vv,Math.sin(a)).normalize();
  const hAt=d=>(W_.hExact||W_.hAt)(d);
  const thOf=d=>{let a=Math.atan2(d.dot(Vv),d.dot(U));return a<0?a+TAU:a};
  const trackH=a=>{const f=((a%TAU)+TAU)%TAU/TAU*NS;const i=Math.floor(f),k=f-i;return TH[i%NS]*(1-k)+TH[(i+1)%NS]*k};
  function carModel(m,front){const g=new THREE.Group();const q=grp(g,[0,1.1,0]);P(q,G.ca(1,3.2),gl(m,'#eef0f8'),[0,0,0],[PI/2,0,0],[1,.9,1]);P(q,G.cy(1.01,1.01,4.6,20,1,true),gl(m,front?'#ff4a5a':'#2fb5d9'),[0,-.35,0],[PI/2,0,0],[1,.22,1]);
    for(const s of[-1,1])for(let i=0;i<4;i++)P(q,G.bx(.05,.4,.6,.08),m.c('#3b4a6a',{gloss:1.5,rim:1}),[s*.95,.2,-1.3+i*.85]);P(q,G.bx(.55,.06,3.4,.03),gl(m,front?'#ff4a5a':'#2fb5d9'),[0,.9,0]);if(front)P(q,G.s(.7),m.c('#3b4a6a',{gloss:1.5,rim:1}),[0,.3,2.3],null,[1,.55,.6]);
    P(g,G.bx(1.4,.25,4.2,.08),chr(m),[0,.15,0]);addOutlines(g);return g}
  function build(W){sc=GAME.G.scene;const m=m_;const grpT=new THREE.Group();sc.add(grpT);
    /* Höhe der Strecke: über dem höchsten Gelände in der Nähe, geglättet */const raw=[];for(let i=0;i<NS;i++){const d=dirAt(i/NS*TAU);raw.push(Math.max(hAt(d),W.sea))}
    TH=raw.map((_,i)=>{let mx=-99;for(let k=-8;k<=8;k++)mx=Math.max(mx,raw[(i+k+NS)%NS]);return mx+6.5});for(let it=0;it<3;it++)TH=TH.map((_,i)=>(TH[(i-2+NS)%NS]+TH[(i-1+NS)%NS]+TH[i]+TH[(i+1)%NS]+TH[(i+2)%NS])/5);
    const R=W.R;const pts=[];for(let i=0;i<=NS;i+=2){const a=i/NS*TAU;pts.push(dirAt(a).multiplyScalar(R+trackH(a)).toArray())}
    const rail=new THREE.Mesh(G.tu(pts,.45,.45,NS),gl(m,'#fbfbfd'));grpT.add(rail);const st=new THREE.Mesh(G.tu(pts.map(p=>{const v=new V(...p);return v.multiplyScalar((v.length()-.42)/v.length()).toArray()}),.3,.3,NS),gl(m,'#ff4a5a'));grpT.add(st);
    /* Stützen */const NP=120;const geo=new THREE.CylinderGeometry(.25,.35,1,10);const im=new THREE.InstancedMesh(geo,chr(m),NP);const q=new THREE.Quaternion(),mt=new THREE.Matrix4();
    for(let i=0;i<NP;i++){const a=i/NP*TAU;const d=dirAt(a);const hg=hAt(d),ht=trackH(a);const len=Math.max(.5,ht-hg-.4);q.setFromUnitVectors(new V(0,1,0),d);mt.compose(d.clone().multiplyScalar(R+hg+len/2),q,new V(1,len,1));im.setMatrixAt(i,mt)}
    im.instanceMatrix.needsUpdate=true;im.castShadow=true;grpT.add(im);
    /* drei Bahnhöfe, jeweils auf Land */stations=[];for(let k=0;k<3;k++){let best=null;for(let j=0;j<40&&!best;j++){for(const sgn of[1,-1]){const a=k/3*TAU+sgn*j*.02;const d=dirAt(a);if(GAME.isLand(d)&&hAt(d)>W.sea+.3&&!(GAME.nearPlace&&GAME.nearPlace(d,1.1))){best=a;break}}}if(best==null)best=k/3*TAU;
      const a=best,d=dirAt(a);const g=new THREE.Group();const ht=trackH(a),hg=hAt(d);const H=ht-hg;P(g,G.cy(1.6,1.8,.3,20),chr(m),[0,.15,0]);const sh=P(g,G.cy(1.1,1.1,H,16,1,true),m.c('#bfefff',{opacity:.35,gloss:1.5,rim:1.2,side:THREE.DoubleSide}),[0,H/2,0]);sh.userData.noMerge=true;
      for(let y=2;y<H;y+=2.2)P(g,G.to(1.12,.05),gl(m,MAG[k%4]),[0,y,0],[PI/2,0,0]);P(g,G.bx(6,.2,3,.08),gl(m,MAG[k%4]),[0,H-.6,0]);
      const sign=ctex('ring-st-'+k,256,64,(x,w,h)=>{x.fillStyle='#fbfbfd';x.fillRect(0,0,w,h);x.fillStyle='#3b3450';x.font='900 30px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('BAHNHOF '+'ABC'[k],w/2,h/2+2)});
      const sm=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.65),new THREE.MeshBasicMaterial({map:sign,side:THREE.DoubleSide}));sm.position.set(0,2.4,-1.25);sm.userData.noOutline=true;g.add(sm);addOutlines(g);GAME.placeObj(g,d,0,0,true);
      const tan=dirAt(a+.01).sub(d);g.up.copy(d);g.lookAt(g.position.clone().add(tan));
      stations.push({k,a,d});W.inter.push({kind:'bahnhof',p:d,r:2.8,label:'Bahnhof '+'ABC'[k]+': einsteigen',act:()=>board(k),when:()=>!riding})}
    train=[carModel(m,true),carModel(m,false),carModel(m,false)];train.forEach(c=>sc.add(c))}
  function onLoad(W){W_=W;riding=false;inTrain=false;m_=makeMats({skin:'plastik',color:0});A=new V(.25,1,.15).normalize();U=new V(1,0,0).sub(A.clone().multiplyScalar(A.x)).normalize();Vv=new V().crossVectors(A,U).normalize();th=0;build(W)}
  function placeTrain(){const R=W_.R;for(let i=0;i<train.length;i++){const a=th-i*GAP;const d=dirAt(a);const c=train[i];c.position.copy(d).multiplyScalar(R+trackH(a)+.25);c.up.copy(d);c.lookAt(dirAt(a+.01).multiplyScalar(R+trackH(a+.01)+.25))}}
  function board(k){const me=GAME.me;if(riding||!me||me.script)return;const s=stations[k];riding=true;th=s.a;SND.play('door_open');
    const up=trackH(s.a)-hAt(s.d);UI.toast('Aufzug zum Bahnsteig … Der Zug fährt bis Bahnhof '+'ABC'[(k+1)%3]+'.',2600);
    me.script={from:me.p.clone(),to:s.d.clone(),dur:2.4,peak:0,t:0,base:0,baseTo:up,keepLift:true,ease:t=>t*t*(3-2*t),done:()=>{inTrain=true;SND.play('whoosh');GAME._aim(dirAt(s.a+.2).multiplyScalar(W_.R),17,.62);ride(k)}}}
  function ride(k){const me=GAME.me;const a0=stations[k].a;let a1=stations[(k+1)%3].a;while(a1<=a0)a1+=TAU;const n=Math.ceil((a1-a0)/.04);let i=0;
    const seg=()=>{if(i>=n){arrive((k+1)%3);return}const ta=a0+(a1-a0)*i/n,tb=a0+(a1-a0)*(i+1)/n;i++;const da=dirAt(ta),db=dirAt(tb);
      me.script={from:da,to:db,dur:(tb-ta)/FAST,peak:0,t:0,base:trackH(ta)-hAt(da),baseTo:trackH(tb)-hAt(db),keepLift:true,ease:t=>t,done:seg}};seg()}
  function arrive(k){const me=GAME.me;const s=stations[k];th=s.a;inTrain=false;me.g.visible=true;GAME._aim(dirAt(s.a+.2).multiplyScalar(W_.R),8.5,.42);if(me.shadow)me.shadow.visible=true;SND.play('door_open');
    me.script={from:s.d.clone(),to:s.d.clone(),dur:2.2,peak:0,t:0,base:trackH(s.a)-hAt(s.d),baseTo:0,keepLift:false,ease:t=>t*t*(3-2*t),done:()=>{me.lift=0;riding=false;visit(k)}}}
  function visit(k){const st=S();UI.toast('Bahnhof '+'ABC'[k]+'. Bitte alle aussteigen!',2400);if(st.seen.includes(k))return;st.seen.push(k);persist();money(120);
    if(typeof PIKO!=='undefined'&&st.seen.length===1)PIKO.want('Was für eine Fahrt! Steig an allen drei Bahnhöfen einmal aus.');
    if(st.seen.length===3&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Stellwerkerin Weiche',['Du warst an allen drei Bahnhöfen! Das schaffen nicht viele, ohne einzuschlafen.','Hier, ein Magnetbahn-Modell. Der kleine Zug fährt ganz von allein im Kreis.']);bagAdd('furn','magnetbahn_modell');bagAdd('relic','erste_fahrkarte');money(300);SND.jingle('j_success')},900)}}
  function tick(dt,t,W,me){if(!train)return;if(inTrain&&me){th=thOf(me.p)+2*GAP;me.g.visible=false;if(me.shadow)me.shadow.visible=false}else if(!riding)th+=dt*IDLE;placeTrain()}
  return{onLoad,tick,stations:()=>stations,board,get riding(){return riding}}
})();
window.RING=RING;
})();
