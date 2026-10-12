/* =====================================================================
   CYBORG-LABOR · planets/schoner.js · Bildschirmschoner-Planet
   Ein Planet, der aussieht wie ein Computer, der gerade schläft:
   Rohrbäume aus leuchtenden Rohren mit Kugelgelenken, Sternfeld-Büsche,
   Mystify-Blumen aus bunten Linien, Labyrinth-Felsen und Scanlinien-Gras
   unter einem dunkelblauen Himmel. Die Häuser sind Programmfenster mit
   Titelleiste, Sanduhren und riesige Mauszeiger.
   Besonderheit:
   · Logo-Bildschirm: Auf einem riesigen Bildschirm hüpft ein Logo hin
     und her. Mit dem Knopf davor ändert man seine Richtung. Wer es genau
     in eine Ecke lenkt, bekommt Taler, beim ersten Mal ein Geschenk.
     Reines Geschick und Timing, kein Glücksspiel.
   ===================================================================== */
(function(){
const ID='schoner';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const SCR=['#45e0ff','#ff6fd8','#7fffd4','#ffd23f','#b89aff','#7fd34a'];
const gl=(m,c)=>m.c(c,{gloss:1.4,rim:1.2,rimColor:'#ffffff'});

/* ================= Natur ================= */
N('rohrbaum',{r:.4,h:4,shake:false,size:'big',planet:ID},(g,m,o,rnd)=>{const c=gl(m,SCR[Math.floor(rnd()*SCR.length)]);let p=new V(0,0,0);const dirs=[[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];let d=[0,1,0];
  for(let i=0;i<7;i++){const L=RR(rnd,.5,1.1);const e=p.clone().add(new V(...d).multiplyScalar(L));P(g,G.tu([p.toArray(),e.toArray()],.13,.13,4),c);P(g,G.s(.19),c,e.toArray());p=e;
    const opts=dirs.filter(x=>!(x[0]===-d[0]&&x[1]===-d[1]&&x[2]===-d[2]));const side=opts.filter(x=>x[1]===0);d=p.y<2.6?(i%2?[0,1,0]:opts[Math.floor(rnd()*opts.length)]):side[Math.floor(rnd()*side.length)]}});
N('sternfeldbusch',{r:.4,h:1,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.4,.08,3,rnd()*9),m.c('#1a2a5a',{gloss:.6}),[0,.38,0],null,[1.1,.85,1]);for(let i=0;i<9;i++){const th=rnd()*1.4,ph=rnd()*TAU;P(g,G.bx(.05,.05,.05,0),m.glow('#ffffff',1.6),[Math.sin(th)*Math.cos(ph)*.45,.38+Math.cos(th)*.34,Math.sin(th)*Math.sin(ph)*.42])}});
N('mystifyblume',{r:.25,h:1,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.5,.9);P(g,G.cy(.02,.02,h,6),m.c('#3a4a8a'),[0,h/2,0]);for(let k=0;k<2;k++){const c=SCR[(k*2+Math.floor(rnd()*6))%6];const pts=[];for(let i=0;i<=4;i++){const a=i/4*TAU+rnd()*.5;pts.push([Math.cos(a)*(.15+rnd()*.12),h+.1+Math.sin(a*2)*.08+k*.06,Math.sin(a)*(.15+rnd()*.12)])}pts.push(pts[0]);P(g,G.tu(pts,.012,.012,30),m.glow(c,1.5))}});
N('labyrinthfels',{r:.7,h:1.4,size:'big',planet:ID},(g,m,o,rnd)=>{const t=ctex('schoner-ziegel',64,64,(x,w,h)=>{x.fillStyle='#c84a3a';x.fillRect(0,0,w,h);x.fillStyle='#e8d8c8';for(let r=0;r<4;r++){x.fillRect(0,r*16,w,2);for(let c=0;c<2;c++)x.fillRect((c*32+(r%2)*16)%w,r*16,2,16)}});
  const mt=m.c('#ffffff',{map:t,gloss:.3});const n=2+Math.floor(rnd()*2);for(let i=0;i<n;i++){const L=RR(rnd,1,1.8);P(g,G.bx(L,1.1,.35,.02),mt,[i*.2-.2,.55,(i-.5)*.5],[0,i%2?PI/2:0,0])}});
N('scanliniengras',{r:.12,h:.3,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#3a8a8a');for(let i=0;i<4;i++)P(g,G.bx(.25,.025,.025,0),c,[(rnd()-.5)*.1,.03+i*.06,(rnd()-.5)*.15]);if(rnd()<.4)P(g,G.bx(.1,.025,.026,0),m.glow('#45e0ff',1.4),[0,.21,0])});
Object.assign(NH.ROCK,{[ID]:['#3a4a8a','#2a3a7a','#45e0ff']});

/* ================= Biome ================= */
const BI={
  rohrwald:{n:'Rohrwald',g:['#2a4a7a','#264470'],cliff:'#1a2a5a',pat:'moos',grass:'#2e5a7a',grassD:.6,trees:[['rohrbaum',2.4]],treeD:1.2,
    deco:[['mystifyblume',3],['scanliniengras',3]],decoD:5,rocks:[['labyrinthfels',.3]],rockD:.3,litter:[['pixelstaub',.8],['diskette_klein',.5]]},
  sternfeld:{n:'Sternfeld',g:['#1e2e5e','#1a2a56'],cliff:'#14204a',pat:'staub',grass:null,grassD:0,trees:[['rohrbaum',.4]],treeD:.25,
    deco:[['sternfeldbusch',4],['mystifyblume',1]],decoD:4,rocks:[['labyrinthfels',.4]],rockD:.4,litter:[['pixelstaub',1.2]]},
  mystifywiese:{n:'Mystify-Wiese',g:['#3a5a8a','#345480'],cliff:'#2a3a6a',pat:'gras',grass:'#3a6a8a',grassD:.8,trees:[['rohrbaum',.8]],treeD:.4,
    deco:[['mystifyblume',6],['scanliniengras',3]],decoD:6,rocks:[['labyrinthfels',.2]],rockD:.2,litter:[['diskette_klein',.8]]},
  aquariumufer:{n:'Aquarium-Ufer',g:['#3a7a9a','#347090'],cliff:'#2a4a7a',pat:'sand',grass:'#3a8a9a',grassD:.5,trees:[],treeD:0,
    deco:[['scanliniengras',3],['sternfeldbusch',1]],decoD:3,rocks:[['labyrinthfels',.3]],rockD:.3,litter:[['muschel',.8],['pixelstaub',.5]]},
  labyrinthgipfel:{n:'Labyrinth-Gipfel',g:['#5a5a8a','#505080'],cliff:'#3a3a6a',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['sternfeldbusch',1]],decoD:1,rocks:[['labyrinthfels',1.6]],rockD:1,litter:[['diskette_klein',1]]}};

/* ================= Sammelsachen ================= */
IT('diskette_klein',itMeta('Kleine Diskette','schoner','material',40),(g,m)=>{P(g,G.bx(.24,.02,.24,.01),m.c('#3b3450'),[0,.01,0]);P(g,G.bx(.12,.022,.08,0),m.c('#c8ccd8',{gloss:1.3}),[0,.012,-.08]);P(g,G.bx(.16,.022,.09,0),m.c('#fffdf7'),[0,.012,.06])});

/* ================= Fische ================= */
F('aquariumbarsch',fishMeta('Aquarium-Barsch','schoner','teich','M','immer',1,200,'Ich hab einen Aquarium-Barsch gefangen! Er sieht aus, als wäre er aus einem Bildschirmschoner geschwommen.','Bildschirmschoner wurden erfunden, weil sich auf alten Röhrenbildschirmen ein Bild einbrennen konnte, wenn es zu lange gleich blieb.'),
  (g,m)=>fishT(g,m,{id:'aquariumbarsch',H:.26,L:.6,back:'#ff9a45',belly:'#fff2e0',tail:'fan',dorsal:'hi',pat:(x,w,h)=>{x.fillStyle='#ffffff';for(let i=0;i<3;i++)x.fillRect(w*(.3+i*.18),0,w*.05,h)}}));
F('rohraal',fishMeta('Rohr-Aal','schoner','meer','M','nacht',2,480,'Ich hab einen Rohr-Aal gefangen! Er schwimmt nur in rechten Winkeln.','Ein rechter Winkel hat 90 Grad. Vier rechte Winkel ergeben eine ganze Drehung von 360 Grad.'),
  (g,m)=>{const c=gl(m,'#45e0ff');const pts=[[0,0,.45],[0,0,.15],[.15,0,.15],[.15,0,-.15],[0,0,-.15],[0,0,-.45]];P(g,G.tu(pts,.05,.04,24),c);for(const p of pts.slice(1,5))P(g,G.s(.07),c,p);eye(g,m,[.04,.03,.42],.022,[.6,.3,.6]);eye(g,m,[-.04,.03,.42],.022,[-.6,.3,.6])});
F('sternenbarbe',fishMeta('Sternenbarbe','schoner','teich','S','nacht',3,1100,'Ich hab eine Sternenbarbe gefangen! In ihren Schuppen spiegeln sich lauter kleine Sterne.','Das Licht mancher Sterne ist so lange unterwegs, dass der Stern vielleicht gar nicht mehr existiert, wenn das Licht bei uns ankommt.'),
  (g,m)=>fishT(g,m,{id:'sternenbarbe',H:.18,L:.5,back:'#1a2a6a',belly:'#3a4a8a',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ffffff';for(let i=0;i<20;i++)x.fillRect((i*37)%w,(i*23)%h,3,3)}}));

/* ================= Insekten ================= */
B('cursorkaefer',bugMeta('Cursor-Käfer','schoner','boden','immer',1,160,'Ich hab einen Cursor-Käfer gefangen! Er sieht aus wie ein kleiner Mauszeiger.','Die Computermaus wurde schon 1964 erfunden. Die erste war ein Holzkasten mit zwei Rädern.'),
  (g,m)=>{const sh=new THREE.Shape();sh.moveTo(0,.2);sh.lineTo(-.12,-.05);sh.lineTo(-.03,-.03);sh.lineTo(-.05,-.15);sh.lineTo(.03,-.15);sh.lineTo(.03,-.03);sh.lineTo(.12,-.05);sh.closePath();const q=P(g,new THREE.ExtrudeGeometry(sh,{depth:.06,bevelEnabled:false}),gl(m,'#fbfbfd'),[0,.12,0],[-PI/2,0,0]);legs(g,m.c('#3b3450'),[[.08,.08,.05],[0,.08,0],[-.08,.08,-.05]],.14)});
B('sanduhrmotte',bugMeta('Sanduhr-Motte','schoner','luft','nacht',2,460,'Ich hab eine Sanduhr-Motte gefangen! Auf ihren Flügeln ist eine Sanduhr. Sie lässt sich gern Zeit.','Eine Sanduhr misst die Zeit mit rieselndem Sand. Schon vor über 700 Jahren benutzten Seeleute sie auf Schiffen.'),
  (g,m)=>butterfly(g,m,'sanduhrmotte','#ffd27a','#c8a060','#3b3450'));
B('bildlaeufer',bugMeta('Bild-Läufer','schoner','boden','tag',3,880,'Ich hab einen Bild-Läufer gefangen! Er rennt von einem Bildschirmrand zum anderen.','Ein Bildschirm besteht aus Millionen kleiner Lichtpunkte in Rot, Grün und Blau. Aus diesen drei Farben mischt er alle anderen.'),
  (g,m)=>{for(let i=0;i<3;i++)P(g,G.s(.07),gl(m,['#ff4a5a','#7fd34a','#2fb5d9'][i]),[0,.12,-.1+i*.1]);bugFace(g,m,[0,.13,.16],.05,.5);legs(g,m.c('#3b3450'),[[.06,.08,.06],[0,.08,0],[-.06,.08,-.06]],.16)});

/* ================= Fundstücke ================= */
REL('erster_bildschirmschoner',relMeta('Der erste Bildschirmschoner','schoner','kunst',2,900,'Eine Diskette mit der Aufschrift «Schoner 1.0 – Sterne». Bitte nicht löschen.','Moderne Bildschirme brennen kaum noch ein. Bildschirmschoner gibt es heute vor allem, weil sie hübsch aussehen.'),
  (g,m)=>{P(g,G.bx(.3,.02,.3,.01),m.c('#2a5ac8'),[0,.01,0]);P(g,G.bx(.2,.022,.12,0),m.c('#fffdf7'),[0,.012,.07]);P(g,G.bx(.14,.022,.08,0),m.c('#c8ccd8',{gloss:1.3}),[0,.012,-.1])});
REL('standby_knopf',relMeta('Standby-Knopf','schoner','schatz',3,2000,'Ein grosser runder Knopf mit einem Strich und einem Kreis. Drückt man ihn, schläft der Planet ein.','Das Zeichen auf dem Ein-Schalter kommt von den Zahlen 1 und 0: Strich für «an», Kreis für «aus».'),
  (g,m)=>{P(g,G.cy(.18,.2,.1,24),m.c('#e6ecf5',{gloss:1.4}),[0,.05,0]);P(g,G.to(.08,.015,PI*1.6),m.glow('#7fd34a',1.5),[0,.11,0],[PI/2,0,PI*.7]);P(g,G.bx(.02,.012,.1,0),m.glow('#7fd34a',1.5),[0,.115,-.05])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  schlafkatze:{n:'Schlummer-Katze',planet:ID,biomes:['mystifywiese','rohrwald'],count:3,size:.6,speed:.6,gait:'waddle',voice:['mrrr','mau','schnurr'],pitch:480,likes:['aquariumbarsch','sternenbarbe'],product:'pixelstaub',names:['Standby','Döschen','Ruhemodus','Gähn','Pause'],
    fact:'Katzen schlafen gern auf warmen Geräten. Früher lagen sie oft auf den warmen Röhrenbildschirmen.',a:{col:'#b8b0d8',belly:'#f2f0ff',body:[.3,.26,.42],head:{r:.24,p:[0,.5,.34]},snout:{type:'muzzle',col:'#f2f0ff',nose:'#ff8ab0'},ears:{type:'pointy',len:.32},legs:{n:4,len:.12,r:.06,foot:'#f2f0ff'},tail:{type:'long',col:'#b8b0d8'},gait:'waddle'}},
  kabelhund:{n:'Kabelhund',planet:ID,biomes:['sternfeld','aquariumufer','mystifywiese'],count:3,size:.65,speed:1.3,gait:'fast',voice:['wuff','wau','bip-wuff'],pitch:340,likes:['diskette_klein','cursorkaefer'],product:'diskette_klein',names:['Stecker','USB','Bello-Bit','Reset','Rex.exe'],
    fact:'Hunde riechen etwa 10 000-mal besser als Menschen. Manche finden sogar versteckte Speicherkarten mit der Nase.',a:{col:'#e8d0a8',belly:'#fff6e0',body:[.3,.28,.46],head:{r:.24,p:[0,.55,.36]},snout:{type:'muzzle',col:'#fff6e0',nose:'#3b3450'},ears:{type:'floppy',len:.4},legs:{n:4,len:.18,r:.06,foot:'#c8a878'},tail:{type:'long',col:'#2fb5d9'},gait:'fast'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','mauszeiger_hut','Mauszeiger-Mütze',460,'#fbfbfd',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.hs(r*.82),M.c('#2a3a9a'),[0,0,0]);P(q,G.co(r*.3,r*.8,3),M.c(col,{gloss:1.3}),[0,r*.75,0],[0,0,.3],[1,1,.4])});
def('top','pyjama99','Pyjama 1999',720,'#2a3a9a',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);for(let k=0;k<6;k++){const a=k*1.1;P(q,G.star(r*.07,r*.03,5,r*.02),M.c('#ffd23f'),[Math.cos(a)*r*.87,-r*(.15+k*.12),Math.sin(a)*r*.87])}});

/* ================= Möbel ================= */
furn('schonerlampe',{n:'Rohr-Lampe',cat:'licht',price:1700,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{const c=gl(m,'#45e0ff');const pts=[[0,0,0],[0,.6,0],[.4,.6,0],[.4,1.1,0],[.1,1.1,0],[.1,1.4,0]];P(g,G.tu(pts,.06,.06,30),c);for(const p of pts.slice(1,5))P(g,G.s(.09),c,p);P(g,G.s(.14),m.glow('#bff4ff',1.6),[.1,1.5,0]);g.userData.light={p:[.1,1.5,0],c:'#bff4ff',i:.7}}});
furn('roehrenmonitor_mini',{n:'Mini-Bildschirm mit Schoner',cat:'technik',price:2200,planet:ID,size:[1,1],h:1,b:(g,m)=>{P(g,G.bx(.7,.6,.6,.08),m.c('#e8e1d0'),[0,.4,0]);const cv=document.createElement('canvas');cv.width=128;cv.height=96;const x=cv.getContext('2d');const tx=new THREE.CanvasTexture(cv);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(.5,.38),new THREE.MeshBasicMaterial({map:tx,toneMapped:false}));s.position.set(0,.42,.305);s.userData.noOutline=true;g.add(s);
  g.userData.tick=t=>{x.fillStyle='#000814';x.fillRect(0,0,128,96);x.fillStyle='#ffffff';for(let i=0;i<30;i++){const z=((i*37+t*40)%100)/100;const a=i*2.4;const r=z*70;x.fillRect(64+Math.cos(a)*r,48+Math.sin(a)*r*.7,1+z*2,1+z*2)}tx.needsUpdate=true}}});

/* ================= Sprache: Pixel-Schoner-Schrift ================= */
function schonerGlyph(x,s,r){x.save();x.lineWidth=s*.05;x.beginPath();let px=(r()-.5)*s*.4,py=(r()-.5)*s*.4;x.moveTo(px,py);for(let i=0;i<3;i++){if(i%2)py=(r()-.5)*s*.5;else px=(r()-.5)*s*.5;x.lineTo(px,py)}x.stroke();x.beginPath();x.arc(px,py,s*.05,0,TAU);x.fill();x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Bildschirmschoner-Planet',base:'kompost',R:118,R0:40,sea:-.3,music:'town',sky:['#0a1a4a','#2a4a9a'],fog:'#1a2a6a',water:'#2a6aa0',deep:'#0a1a4a',step:1.05,shop:ID,
    desc:'Ein Planet, der aussieht wie ein schlafender Computer: leuchtende Rohre, Sternfelder und Mystify-Linien. Auf dem grossen Bildschirm hüpft ein Logo.',weather:'blueten',orbit:[257,5.3],size:1,col:['#2a4a7a','#45e0ff'],moons:1,
    park:'mystifywiese',parkPond:true,phone:['#d0e0ff','#e0d0ff'],stones:['kiesel','diskette_klein','stein_klein'],plazaTree:'rohrbaum',path:'#6a7ab0',
    space:{deep:'#0a1a4a',water:'#2a6aa0',shore:'#3a7a9a',land:'#2a4a7a',land2:'#3a5a8a',high:'#5a5a8a',cap:'#45e0ff',atmo:'#2a4a9a',cloud:.2,sea:.38,capA:.3,freq:3.2},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'sternfeld',wet:'aquariumufer',cold:'labyrinthgipfel'},peak:'labyrinthgipfel',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.05,4)*2+.7;/* rechtwinklige Stufen wie in einem Labyrinth */const k=N2(q.x*.7,q.y*.7,q.z*.7);if(Math.abs(k)<.08)h+=.8;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'aquariumufer';if(h>sea+4.3)return'labyrinthgipfel';if(T>.3)return'sternfeld';if(M>.2)return'rohrwald';return'mystifywiese'},
    onLoad:W=>LOGO.onLoad(W),tick:(dt,t,W,me)=>LOGO.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Desktop-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Aquarium',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Pixelsee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Desktop-Spielecke',mode:'Pyjama-Laden',praxis:'Neustart-Praxis',museum:'Museum der Bildschirmschoner',shop:'Disketten-Laden',studio:'Pixel-Atelier',bar:'Standby-Bar',rathaus:'Systemsteuerung',garage:'Laufwerk-Garage',pflanzen:'Rohr-Gärtnerei',tiere:'Kabeltier-Laden'},
  sty:{wall:'putz',walls:['#e8ecf8','#f2f0ff','#e8f6ff'],roof:'dome',roofs:SCR.slice(0,4),trim:'#c8ccd8',plinth:'#3a4a8a',door:'#2fb5d9',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Systemverwalter Standby',{skin:'plastik',color:1,shape:'kapselspiel'},{kopf:'crtkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:['pager']}],
  lore:['Willkommen auf dem Bildschirmschoner-Planeten! Pssst, der Planet schläft gerade. Darum sieht alles so schön aus.','Auf dem grossen Bildschirm hüpft ein Logo. Wer es genau in eine Ecke lenkt, hat etwas geschafft, was fast niemand schafft.','Bewegt man die Maus, wacht der Planet auf. Aber hier gibt es keine Maus. Nur Kabelhunde.'],
  caveRock:['#3a4a8a','#2a3a7a','#1a2a5a',SCR.slice(0,3)],
  wear:['mauszeiger_hut','pyjama99','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'fensterhaus'},{fam:'kokon',style:'sanduhrhaus'},{fam:'kokon',style:'cursorhaus'},{fam:'kokon',style:'fensterhaus'}]},
  residents:{skins:['plastik','glas','bonbon','gold'],heads:['crtkopf','kapselkopf','eikopf','katze','vogel','mensch'],names:['Standby','Pixel','Cursor','Sanduhr','Desktop','Ikon','Rohr','Stern','Fenster','Klick','Bit','Schoner'],
    house:{shapes:['haus','rund'],walls:['putz'],wallCols:['#e8ecf8','#f2f0ff','#e8f6ff'],roofCols:SCR.slice(0,4),win:['rund']},deco:['mystifyblume','sternfeldbusch','rohrbaum'],fence:false},
  lang:{n:'Pixel-Schoner-Schrift',ink:'#2a6aa0',glow:'#45e0ff',kind:'circuit',draw:schonerGlyph,syl:['sch','on','er','pix','el','ro','hr','st','ern','by','te','sl']},ruinStone:'#3a4a8a',
  terraform:['mystifywiese','rohrwald','aquariumufer','sternfeld'],
  weather:[['klar',5],['nebel',1],['heiter',1]]});

/* ================= Logo-Bildschirm ================= */
const LOGO=(()=>{let W_=null,m_=null,site=null,cv=null,cx=null,tex=null,pos={x:120,y:60,vx:90,vy:60,c:0},flash=0,edgeX=0,edgeY=0;const CW=512,CH=320,LW=110,LH=56,TOL=.18;
  const S=()=>SAVE.logo=SAVE.logo||{corners:0};
  function draw(){if(!cx)return;cx.fillStyle='#000814';cx.fillRect(0,0,CW,CH);if(flash>0){cx.fillStyle='rgba(255,255,255,'+(flash*.5)+')';cx.fillRect(0,0,CW,CH)}
    const col=SCR[pos.c%SCR.length];cx.save();cx.translate(pos.x,pos.y);cx.fillStyle=col;cx.beginPath();cx.ellipse(LW/2,LH/2,LW/2,LH/2,0,0,TAU);cx.fill();cx.fillStyle='#000814';cx.font='900 26px Nunito, sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('NEMURI',LW/2,LH/2-6);cx.font='bold 16px monospace';cx.fillText('99',LW/2,LH/2+14);cx.restore();
    cx.fillStyle='#45e0ff';cx.font='bold 14px monospace';cx.fillText('ECKEN: '+S().corners,10,CH-10);tex.needsUpdate=true}
  function screenModel(m){const g=new THREE.Group();const W=8,H=5;P(g,G.bx(W+.6,H+.6,.6,.2),m.c('#e8e1d0'),[0,H/2+1.6,0]);P(g,G.bx(1.4,1.2,.8,.1),m.c('#d8d0bc'),[0,.6,0]);P(g,G.bx(3,.2,1.6,.08),m.c('#d8d0bc'),[0,.1,0]);
    cv=document.createElement('canvas');cv.width=CW;cv.height=CH;cx=cv.getContext('2d');tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;const s=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));s.position.set(0,H/2+1.6,.31);s.userData.noOutline=true;g.add(s);
    const s2=s.clone();s2.rotation.y=PI;s2.position.z=-.31;g.add(s2);
    const knopf=grp(g,[0,0,2.2]);P(knopf,G.cy(.5,.6,.9,16),m.c('#e6ecf5',{gloss:1.4}),[0,.45,0]);const btn=P(knopf,G.cy(.4,.4,.2,20),gl(m,'#ff4a5a'),[0,1,0]);
    addOutlines(g);g.userData.btn=btn;return g}
  function flip(){if(!site)return;const b=site.g.userData.btn;b.position.y=.92;setTimeout(()=>b.position.y=1,200);SND.play('click',{rate:1.3});if(Math.abs(pos.vx)*Math.random()>Math.abs(pos.vy)*.5)pos.vx*=-1;else pos.vy*=-1}
  function onLoad(W){W_=W;site=null;m_=makeMats({skin:'plastik',color:0});const r=srand(9898);const pl=GAME.G.places.find(p=>p.id==='platz');
    let d=null;for(const[lo,hi,np]of[[24,42,1.4],[20,70,1.2],[16,120,1.05]]){for(let t=0;t<800&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=pl?angle(cd,pl.dir)*W.R:99;if(a<lo||a>hi)continue;if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.4)continue;if(GAME.nearPlace&&GAME.nearPlace(cd,np))continue;d=cd}if(d)break}
    if(!d)return;const g=screenModel(m_);GAME.placeObj(g,d,r()*TAU,0,true);site={d,g};pos={x:120,y:60,vx:90,vy:60,c:0};draw();
    const fw=new V(0,0,1).applyQuaternion(g.quaternion);const kp=g.position.clone().addScaledVector(fw,2.2).normalize();W.inter.push({kind:'logoknopf',p:kp,r:1.8,label:'Knopf drücken: Logo umlenken',act:flip})}
  function tick(dt){if(!site)return;dt=Math.min(dt,.1);pos.x+=pos.vx*dt;pos.y+=pos.vy*dt;let hx=false,hy=false;
    if(pos.x<=0){pos.x=0;pos.vx=Math.abs(pos.vx);hx=true}else if(pos.x>=CW-LW){pos.x=CW-LW;pos.vx=-Math.abs(pos.vx);hx=true}
    if(pos.y<=0){pos.y=0;pos.vy=Math.abs(pos.vy);hy=true}else if(pos.y>=CH-LH){pos.y=CH-LH;pos.vy=-Math.abs(pos.vy);hy=true}
    const now=performance.now()/1000;if(hx){edgeX=now;pos.c++}if(hy){edgeY=now;pos.c++}
    if((hx||hy)&&Math.abs(edgeX-edgeY)<TOL&&edgeX>0&&edgeY>0){edgeX=edgeY=-9;corner()}flash=Math.max(0,flash-dt*2);draw()}
  function corner(){const st=S();st.corners++;persist();flash=1;money(100);SND.play('powerup',{rate:1.2});UI.toast('ECKE! Das Logo hat genau die Ecke getroffen. Plus 100 Taler.',3000);
    if(st.corners===1&&!st.done){st.done=true;persist();setTimeout(async()=>{await UI.talk('Systemverwalter Standby',['Eine echte Ecke! Darauf warten manche Leute jahrelang.','Hier ist ein Mini-Bildschirm mit Sternen-Schoner für dein Zimmer. Und der erste Bildschirmschoner überhaupt.']);bagAdd('furn','roehrenmonitor_mini');bagAdd('relic','erster_bildschirmschoner');money(300);SND.jingle('j_success')},900)}}
  return{onLoad,tick,site:()=>site,_flip:flip,_pos:()=>pos,_corner:corner}
})();
window.LOGO=LOGO;
})();
