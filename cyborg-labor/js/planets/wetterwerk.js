/* =====================================================================
   CYBORG-LABOR · planets/wetterwerk.js · Wetterwerk
   Ein Planet, auf dem das Wetter gemacht wird: Wetterbäume mit halb Sonne,
   halb Wolke in der Krone, Windrad-Blumen, Regenschirm-Pilze, Blitzfelsen
   aus Kristall und Flockenbüsche. Die Häuser sind Wetterhäuschen mit
   Sonne und Wolke an der Tür, Windrad-Häuser und Radar-Kuppeln mit
   Wetterballon.
   Besonderheit:
   · Wettermaschine: Ein grosses Pult in der Nähe des Platzes. Man wählt
     das Wetter für den ganzen Planeten aus: Sonne, Regen, Schnee, Nebel
     oder Gewitter, sogar einen Regenbogen.
   · Messstationen: Fünf Stationen (Thermometer, Regenmesser, Windmesser,
     Barometer, Haar-Hygrometer) erklären, wie man Wetter misst. Wer alle
     fünf besucht hat, schaltet Polarlicht und Blasenregen frei.
   ===================================================================== */
(function(){
const ID='wetterwerk';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const WX=['#2fb5d9','#ffd23f','#ff6fa5','#9b6ae0','#7fd34a'];
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1.1,rimColor:'#ffffff'});
const chr=m=>m.c('#e6ecf5',{gloss:1.4});
const wolke=(g,m,p,s)=>{for(const[x,y,r]of[[0,0,.4],[.35,-.05,.3],[-.35,-.05,.3],[.15,.2,.28]])P(g,G.s(r*s),gl(m,'#fbfdff'),[p[0]+x*s,p[1]+y*s,p[2]])};
const sonne=(g,m,p,s)=>{P(g,G.s(.3*s),gl(m,'#ffd23f'),p);for(let k=0;k<8;k++){const a=k/8*TAU;P(g,G.co(.07*s,.18*s,4),gl(m,'#ffb43a'),[p[0]+Math.cos(a)*.42*s,p[1]+Math.sin(a)*.42*s,p[2]],[0,0,a-PI/2])}};

/* ================= Natur ================= */
N('wetterbaum',{r:.35,h:4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.4,3.2);P(g,G.cy(.13,.18,h,10),m.c('#a87a5a'),[0,h/2,0]);
  P(g,G.s(.9),gl(m,'#7fd34a'),[0,h+.5,0],null,[1,.85,1]);const k=rnd();if(k<.33)sonne(g,m,[.55,h+1.1,0],1.1);else if(k<.66)wolke(g,m,[-.4,h+1.15,0],1.2);else{P(g,G.s(.2),gl(m,'#ff6fa5'),[.5,h+.9,.3]);P(g,G.s(.2),gl(m,'#ff6fa5'),[-.4,h+.7,.4])}});
N('windradblume',{r:.15,h:.9,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.5,.85);P(g,G.cy(.02,.02,h,6),chr(m),[0,h/2,0]);const q=grp(g,[0,h,.03]);const rot=grp(q,[0,0,0]);
  for(let i=0;i<4;i++){const a=i/4*TAU;const b=P(rot,G.co(.12,.18,3),gl(m,WX[(i+Math.floor(rnd()*5))%5]),[Math.cos(a)*.1,Math.sin(a)*.1,0],[0,0,a],[1,1,.15])}P(rot,G.s(.03),chr(m),[0,0,.02]);
  const ph=rnd()*9,sp=2+rnd()*4;g.userData.tick=t=>{rot.rotation.z=t*sp+ph}});
N('regenschirmpilz',{r:.3,h:1,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.5,.9);P(g,G.tu([[0,0,0],[0,h,0],[.06,h+.05,0]],.025,.025,8),m.c('#3b3450'));P(g,G.tu([[0,0,0],[0,-.08,0],[.06,-.12,0],[.1,-.06,0]],.02,.02,8),m.c('#3b3450'));
  const c=WX[Math.floor(rnd()*5)];const q=grp(g,[0,h,0]);P(q,G.co(.4,.22,8),gl(m,c),[0,.11,0]);for(let k=0;k<8;k++){const a=(k+.5)/8*TAU;P(q,G.s(.04),gl(m,'#ffffff'),[Math.cos(a)*.38,0,Math.sin(a)*.38])}});
N('blitzfels',{r:.6,h:1.6,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.6,.1,3,rnd()*9),m.c('#8a8ea8'),[0,.25,0],null,[1.2,.5,1]);const n=2+Math.floor(rnd()*3);
  for(let i=0;i<n;i++){const q=grp(g,[(rnd()-.5)*.5,.4,(rnd()-.5)*.5],[0,rnd()*TAU,(rnd()-.5)*.4]);const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(.2,.5);sh.lineTo(.05,.5);sh.lineTo(.25,1.1);sh.lineTo(-.05,.55);sh.lineTo(.1,.55);sh.closePath();
    P(q,new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false}),m.c('#ffe86a',{gloss:1.5,rim:1.3,opacity:.85}),[0,0,-.06])}});
N('flockenbusch',{r:.45,h:.9,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.45,.08,3,rnd()*9),m.c('#bfe6ff'),[0,.42,0],null,[1.15,.85,1]);
  for(let i=0;i<5;i++){const th=.4+rnd()*1,ph=rnd()*TAU;const q=grp(g,[Math.sin(th)*Math.cos(ph)*.5,.42+Math.cos(th)*.36,Math.sin(th)*Math.sin(ph)*.45],[rnd(),rnd(),0]);for(let k=0;k<3;k++)P(q,G.bx(.2,.025,.025,0),m.c('#ffffff'),[0,0,0],[0,0,k*PI/3])}});
N('tropfengras',{r:.12,h:.4,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#7fd34a');for(let i=0;i<4;i++){const a=rnd()*TAU,h=RR(rnd,.2,.38);P(g,G.tu([[0,0,0],[Math.cos(a)*.05,h*.6,Math.sin(a)*.05],[Math.cos(a)*.1,h,Math.sin(a)*.1]],.02,.006,6),c);if(i===0)P(g,G.s(.035),m.c('#bfe6ff',{opacity:.8,gloss:1.5}),[Math.cos(a)*.1,h,Math.sin(a)*.1])}});
Object.assign(NH.ROCK,{[ID]:['#8a8ea8','#9a9eb8','#ffd23f']});

/* ================= Biome ================= */
const BI={
  windwiese:{n:'Windwiese',g:['#a0dc84','#94d078'],cliff:'#9a9eb8',pat:'gras',grass:'#98d47c',grassD:.9,trees:[['wetterbaum',1]],treeD:.45,
    deco:[['windradblume',5],['tropfengras',4],['regenschirmpilz',1]],decoD:6,rocks:[['blitzfels',.3]],rockD:.3,litter:[['regentropfen_glas',1],['wetterfeder',.6]]},
  regenhain:{n:'Regenhain',g:['#7cc070','#70b464'],cliff:'#7a8aa8',pat:'moos',grass:'#78bc6c',grassD:1,trees:[['wetterbaum',2.6]],treeD:1.3,
    deco:[['regenschirmpilz',4],['tropfengras',3]],decoD:5,rocks:[['blitzfels',.3]],rockD:.3,litter:[['regentropfen_glas',1.4]]},
  blitzfelsen:{n:'Blitzfelsen',g:['#b8bcd0','#acb0c4'],cliff:'#7a7e98',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['windradblume',1]],decoD:1,rocks:[['blitzfels',1.6]],rockD:1,litter:[['blitzsplitter',1]]},
  sonnendeck:{n:'Sonnendeck',g:['#f4e8b0','#ecdca4'],cliff:'#c8b080',pat:'sand',grass:'#e0e0a0',grassD:.3,trees:[['wetterbaum',.3]],treeD:.2,
    deco:[['windradblume',3]],decoD:2,rocks:[['blitzfels',.3]],rockD:.3,litter:[['wetterfeder',1]]},
  flockenfeld:{n:'Flockenfeld',g:['#f2f8ff','#e6eef8'],cliff:'#b8c4d8',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['flockenbusch',3]],decoD:2,rocks:[['blitzfels',.4]],rockD:.4,litter:[['regentropfen_glas',.6]]}};

/* ================= Sammelsachen ================= */
IT('regentropfen_glas',itMeta('Regentropfen aus Glas','wetterwerk','material',30),(g,m)=>{P(g,G.s(.08),m.c('#bfe6ff',{opacity:.8,gloss:1.5,rim:1.2}),[0,.08,0]);P(g,G.co(.08,.12,12),m.c('#bfe6ff',{opacity:.8,gloss:1.5}),[0,.18,0])});
IT('wetterfeder',itMeta('Wetterfeder','wetterwerk','material',25),(g,m)=>{P(g,G.cy(.006,.006,.3),m.c('#3b3450'),[0,.02,0],[0,0,PI/2]);P(g,G.s(.07),m.c('#2fb5d9'),[.05,.02,0],null,[2,.15,.6])});
IT('blitzsplitter',itMeta('Blitzsplitter','wetterwerk','material',70),(g,m)=>{P(g,G.co(.05,.2,4),m.c('#ffe86a',{gloss:1.5,rim:1.3}),[0,.1,0],[0,0,.3])});

/* ================= Fische ================= */
F('wetterfisch',fishMeta('Wetterfisch','wetterwerk','teich','M','immer',2,480,'Ich hab einen Wetterfisch gefangen! Er zappelt, bevor ein Gewitter kommt.','Der Schlammpeitzger heisst auch «Wetterfisch». Er spürt, wenn der Luftdruck vor einem Gewitter sinkt, und wird dann unruhig.'),
  (g,m)=>{const pts=[];for(let k=0;k<=8;k++)pts.push([0,0,(k/8-.5)*.8]);P(g,G.tu(pts,.07,.04,16),gl(m,'#a8885a'));P(g,G.tu(pts.map(p=>[p[0],p[1]+.03,p[2]]),.02,.015,16),m.c('#5a4a3a'));for(let k=0;k<6;k++)P(g,G.cy(.006,.004,.08),m.c('#5a4a3a'),[k%2?.03:-.03,-.03,.38+(k>>1)*.01],[.6,0,0]);eye(g,m,[.04,.03,.36],.022,[.6,.3,.6]);eye(g,m,[-.04,.03,.36],.022,[-.6,.3,.6])});
F('nebelbarsch',fishMeta('Nebelbarsch','wetterwerk','meer','M','nacht',2,420,'Ich hab einen Nebelbarsch gefangen! Er ist fast so grau wie der Morgennebel.','Nebel ist eine Wolke, die am Boden liegt. Er entsteht, wenn feuchte Luft abkühlt und sich winzige Wassertröpfchen bilden.'),
  (g,m)=>fishT(g,m,{id:'nebelbarsch',H:.24,L:.7,back:'#9aa0b8',belly:'#e8ecf4',tail:'fork',dorsal:'hi'}));
F('hagelhecht',fishMeta('Hagelhecht','wetterwerk','meer','L','tag',3,1300,'Ich hab einen Hagelhecht gefangen! Er hat weisse Punkte wie Hagelkörner.','Hagelkörner wachsen in Gewitterwolken: Aufwinde tragen sie immer wieder nach oben, und jedes Mal friert eine neue Eisschicht an.'),
  (g,m)=>fishT(g,m,{id:'hagelhecht',H:.18,L:1.0,back:'#5a8a7a',belly:'#e8f4ec',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ffffff';for(let i=0;i<14;i++){x.beginPath();x.arc((i*37)%w,8+(i*19)%(h-16),5,0,TAU);x.fill()}}}));

/* ================= Insekten ================= */
B('wasserlaeufer',bugMeta('Wasserläufer','wetterwerk','boden','tag',1,170,'Ich hab einen Wasserläufer gefangen! Er kann auf dem Wasser laufen.','Wasserläufer haben wasserabweisende Härchen an den Füssen. Die Wasseroberfläche trägt sie wie eine dünne Haut.'),
  (g,m)=>{const c=m.c('#5a4a3a');P(g,G.ca(.04,.22),c,[0,.14,0],[PI/2,0,0]);bugFace(g,m,[0,.15,.16],.05,.5);for(const s of[-1,1])for(const[z,L]of[[.08,.15],[0,.32],[-.06,.3]])P(g,G.tu([[s*.03,.14,z],[s*L*.6,.18,z+.02],[s*L,.05,z+(z>0?.08:-.1)]],.008,.006,6),c)});
B('gewitterfliege',bugMeta('Gewittertierchen','wetterwerk','luft','tag',2,380,'Ich hab ein Gewittertierchen gefangen! Es ist winzig wie ein Strich.','Gewittertierchen (Thripse) fliegen bei schwülem Wetter vor Gewittern in Schwärmen. Darum haben sie ihren Namen.'),
  (g,m)=>{const c=m.c('#3b3450');P(g,G.ca(.025,.2),c,[0,.12,0],[PI/2,0,0]);for(const s of[-1,1])P(g,G.bx(.16,.005,.03,0),m.c('#e8e0f0',{opacity:.7}),[s*.08,.14,0]).userData.noOutline=true;bugFace(g,m,[0,.12,.13],.04,.5)});
B('sonnenkaefer',bugMeta('Sonnenkäfer','wetterwerk','baum','tag',3,860,'Ich hab einen Sonnenkäfer gefangen! Er wärmt sich immer in der Sonne auf.','Käfer können ihre Körperwärme nicht selbst machen. Morgens sonnen sie sich, bevor sie losfliegen können.'),
  (g,m)=>{P(g,G.hs(.18),gl(m,'#ffd23f'),[0,.1,0]);for(let k=0;k<6;k++){const a=k/6*TAU;P(g,G.s(.035),m.c('#ff8a3a'),[Math.cos(a)*.1,.22,Math.sin(a)*.1])}P(g,G.s(.08),m.c('#3b3450'),[0,.12,.17]);bugFace(g,m,[0,.13,.22],.06,.5);legs(g,m.c('#3b3450'),[[.1,.08,.08],[0,.08,0],[-.1,.08,-.08]],.16)});

/* ================= Fundstücke ================= */
REL('wetterballon_alt',relMeta('Alter Wetterballon','wetterwerk','schatz',2,900,'Ein geplatzter Wetterballon mit kleinem Messkasten. Auf dem Zettel steht: «Bitte zurückschicken».','Wetterballons steigen bis zu 35 Kilometer hoch. Unterwegs messen sie Temperatur, Luftdruck und Wind und funken die Werte zur Erde.'),
  (g,m)=>{P(g,G.bx(.2,.14,.14,.03),gl(m,'#fbfbfd'),[0,.07,0]);P(g,G.tu([[0,.14,0],[.1,.3,.05],[.2,.18,.15]],.006,.006,8),m.c('#3b3450'));P(g,G.blob(.18,.2,3,4),gl(m,'#ff6fa5'),[.25,.1,.2],null,[1,.3,1])});
REL('schneeflocke_glas',relMeta('Schneeflocke im Glas','wetterwerk','kunst',3,2100,'Eine echte Schneeflocke, für immer in Glas eingeschlossen.','Jede Schneeflocke hat sechs Arme. Weil jede einen etwas anderen Weg durch die Wolke nimmt, sind keine zwei genau gleich.'),
  (g,m)=>{P(g,G.cy(.2,.2,.05,24),m.c('#c8ccd8',{gloss:1.3}),[0,.03,0]);P(g,G.s(.2),m.c('#e8f6ff',{opacity:.4,gloss:1.5,rim:1.3}),[0,.25,0]);for(let k=0;k<3;k++)P(g,G.bx(.2,.012,.012,0),m.c('#ffffff'),[0,.25,0],[0,0,k*PI/3])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  wetterfrosch:{n:'Wetterfrosch',planet:ID,biomes:['regenhain','windwiese'],nearWater:true,count:4,size:.5,speed:1.2,gait:'hop',voice:['quak','äpp','quäk'],pitch:520,likes:['wasserlaeufer','gewitterfliege'],product:'regentropfen_glas',names:['Laubi','Prognose','Hüpfi','Regen','Sonni'],
    fact:'Früher hielt man Laubfrösche im Glas mit einer kleinen Leiter. Kletterte der Frosch hoch, sollte gutes Wetter kommen. Er wollte aber nur Fliegen fangen.',a:{col:'#7fd34a',belly:'#f2fce0',body:[.24,.18,.26],head:{r:.2,p:[0,.3,.2],sc:[1.2,.8,1]},snout:{type:'wide'},eyes:{r:.08,x:.5,y:.6},ears:{type:'none'},legs:{n:4,len:.08,r:.06,foot:'#ffb43a'},tail:{type:'none'},gait:'hop'}},
  murmeltier:{n:'Murmeltier',planet:ID,biomes:['flockenfeld','blitzfelsen','sonnendeck'],count:3,size:.7,speed:.9,gait:'waddle',shy:true,voice:['pfiff','piiiep','pfiep'],pitch:900,likes:['wetterfeder','windradblume'],product:'wetterfeder',names:['Pfiffi','Murmel','Schlummi','Gipfel','Winter'],
    fact:'Murmeltiere halten bis zu sechs Monate Winterschlaf. Ihr Herz schlägt dann nur noch ein paar Mal pro Minute.',a:{col:'#b8885a',belly:'#e8d0a8',body:[.36,.34,.42],head:{r:.24,p:[0,.62,.3]},snout:{type:'muzzle',col:'#e8d0a8',nose:'#3b3450'},ears:{type:'round',len:.3},legs:{n:4,len:.12,r:.07,foot:'#5a4a3a'},tail:{type:'bushy',col:'#8a6a4a'},gait:'waddle'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','suedwester','Südwester',420,'#ffd23f',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.3,0]);P(q,G.hs(r*.84),M.c(col,{gloss:1.2}),[0,0,0]);P(q,G.cy(r*1.05,r*1.2,r*.05,Q(18)),M.c(col,{gloss:1.2}),[0,-r*.05,-r*.12],[-.2,0,0])});
def('top','wetterponcho','Wetter-Poncho',780,'#2fb5d9',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.75,r*1.05,r*.85,Q(16),1,true),M.c(col,{gloss:1.2}),[0,-r*.42,0]);wolke(q,M,[0,-r*.35,r*.92],r*.35)});

/* ================= Möbel ================= */
furn('wetterhaeuschen_mini',{n:'Wetterhäuschen',cat:'deko',price:1800,planet:ID,size:[1,1],h:1,wall:true,b:(g,m)=>{P(g,G.bx(.6,.5,.25,.04),m.c('#fbf7f0'),[0,.45,0]);const sh=new THREE.Shape();sh.moveTo(-.38,0);sh.lineTo(0,.3);sh.lineTo(.38,0);sh.closePath();const rg=new THREE.ExtrudeGeometry(sh,{depth:.32,bevelEnabled:false});rg.translate(0,0,-.16);P(g,rg,gl(m,'#ff6fa5'),[0,.7,0]);
  const q=grp(g,[0,0,.14]);sonne(q,m,[-.14,.42,0],.28);wolke(q,m,[.14,.42,0],.28)}});
furn('barometer',{n:'Barometer',cat:'deko',price:900,planet:ID,size:[1,1],h:1,wall:true,b:(g,m)=>{P(g,G.cy(.28,.28,.06,24),m.c('#c8a040',{gloss:1.4}),[0,.6,0],[PI/2,0,0]);P(g,G.cy(.24,.24,.01,24),m.c('#fffdf7'),[0,.6,.035],[PI/2,0,0]);const n=P(g,G.bx(.02,.2,.01,0),m.c('#3b3450'),[.03,.65,.045],[0,0,-.4])}});

/* ================= Sprache: Wetterzeichen ================= */
function wetterGlyph(x,s,r){x.save();x.lineWidth=s*.06;x.lineCap='round';const k=Math.floor(r()*4);if(k===0){x.beginPath();x.arc(0,0,s*.12,0,TAU);x.stroke();for(let i=0;i<6;i++){const a=i/6*TAU;x.beginPath();x.moveTo(Math.cos(a)*s*.18,Math.sin(a)*s*.18);x.lineTo(Math.cos(a)*s*.28,Math.sin(a)*s*.28);x.stroke()}}
  else if(k===1){x.beginPath();x.arc(-s*.1,0,s*.12,PI,0);x.arc(s*.1,0,s*.12,PI,0);x.lineTo(-s*.22,0);x.stroke();for(let i=0;i<3;i++){x.beginPath();x.moveTo(-s*.12+i*s*.12,s*.08);x.lineTo(-s*.16+i*s*.12,s*.22);x.stroke()}}
  else if(k===2){x.beginPath();x.moveTo(s*.05,-s*.28);x.lineTo(-s*.1,0);x.lineTo(s*.08,0);x.lineTo(-s*.06,s*.28);x.stroke()}else{for(let i=0;i<3;i++){x.beginPath();x.moveTo(-s*.25,-s*.15+i*s*.15);x.quadraticCurveTo(0,-s*.25+i*s*.15,s*.25,-s*.15+i*s*.15);x.stroke()}}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Wetterwerk',base:'kompost',R:120,R0:40,sea:-.3,music:'town',sky:['#8fc8ff','#fff4d8'],fog:'#e8f0fa',water:'#5ab8e8',deep:'#2a6ac0',step:1.05,shop:ID,
    desc:'Hier wird das Wetter gemacht. An der Wettermaschine bestimmst du selbst, ob es regnet, schneit oder einen Regenbogen gibt.',weather:'blueten',orbit:[236,2.6],size:1,col:['#a0dc84','#2fb5d9'],moons:1,
    park:'windwiese',parkPond:true,phone:['#e8f6ff','#fff4d8'],stones:['kiesel','regentropfen_glas','stein_klein'],plazaTree:'wetterbaum',path:'#d0dce8',
    space:{deep:'#2a6ac0',water:'#5ab8e8',shore:'#f4e8b0',land:'#a0dc84',land2:'#7cc070',high:'#b8bcd0',cap:'#f2f8ff',atmo:'#8fc8ff',cloud:.7,sea:.36,capA:.5,freq:2.8},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'sonnendeck',wet:'regenhain',cold:'flockenfeld'},peak:'blitzfelsen',
    raw(q,p,{N,N2,fbm}){return fbm(q,1.1,4)*2.1+.7},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'regenhain';if(h>sea+4.4)return'blitzfelsen';if(h>sea+3.4)return'flockenfeld';if(T>.3)return'sonnendeck';if(M>.2)return'regenhain';return'windwiese'},
    onLoad:W=>WWERK.onLoad(W),tick:(dt,t,W,me)=>WWERK.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Wetter-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Pfützenteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Regensee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Wetter-Spielecke',mode:'Regenmode',praxis:'Schnupfen-Praxis',museum:'Wetter-Museum',shop:'Schirmladen',studio:'Wolken-Atelier',bar:'Kakao-Bar',rathaus:'Wetteramt',garage:'Ballon-Garage',pflanzen:'Regen-Gärtnerei',tiere:'Wetterfrosch-Laden'},
  sty:{wall:'putz',walls:['#fbf7f0','#f2f8ff','#fff8e8'],roof:'dome',roofs:WX.slice(0,4),trim:'#e6ecf5',plinth:'#9a9eb8',door:'#2fb5d9',win:'rund',pitch:.9},
  wall:'streifen',floor:'parkett',
  mayor:['Wetterfee Isobar',{skin:'glas',color:1,shape:'ei'},{kopf:'wolke',augen:'mensch',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen im Wetterwerk! Hier wird das Wetter für das ganze Sonnensystem ausprobiert.','An der Wettermaschine darfst du selbst bestimmen, wie das Wetter wird. Bitte nicht zu viel Gewitter.','Fünf Messstationen zeigen, wie man Wetter misst. Wer alle kennt, darf sogar Polarlicht machen.'],
  caveRock:['#8a8ea8','#9a9eb8','#7a7e98',WX.slice(0,3)],
  wear:['suedwester','wetterponcho','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_yellowA'],veg:null},
    plan:[{fam:'kokon',style:'wetterhaeuschen'},{fam:'kokon',style:'windradhaus'},{fam:'kokon',style:'radarkuppel'},{fam:'kokon',style:'wetterhaeuschen'}]},
  residents:{skins:['glas','plastik','bonbon','fell'],heads:['wolke','kapselkopf','vogel','frosch','mensch','eule','katze'],names:['Isobar','Föhn','Brise','Nimbus','Cirrus','Hagel','Sonni','Tau','Schauer','Böe','Flocke','Blitz'],
    house:{shapes:['haus','rund'],walls:['putz'],wallCols:['#fbf7f0','#f2f8ff','#fff8e8'],roofCols:WX.slice(0,4),win:['rund']},deco:['windradblume','regenschirmpilz','wetterbaum'],fence:false},
  lang:{n:'Wetterzeichen',ink:'#2a6ac0',glow:'#ffd23f',kind:'runes',draw:wetterGlyph,syl:['wet','ter','wol','ke','son','ne','re','gen','flo','cke','wi','nd']},ruinStone:'#9a9eb8',
  terraform:['windwiese','regenhain','sonnendeck','flockenfeld'],
  weather:[['klar',3],['heiter',3],['regen',2],['nebel',1],['schnee',1]]});

/* ================= Wettermaschine und Messstationen ================= */
const STATIONS=[
  {n:'Thermometer',t:['Das ist ein Thermometer. In der Glasröhre steckt eine Flüssigkeit.','Wird es wärmer, dehnt sie sich aus und steigt nach oben. Wird es kälter, zieht sie sich zusammen.','Gerade zeigt es angenehme 21 Grad.']},
  {n:'Regenmesser',t:['Das ist ein Regenmesser. Er fängt den Regen in einem Trichter auf.','Man misst, wie hoch das Wasser im Becher steht. Ein Millimeter heisst: ein Liter Regen auf jedem Quadratmeter.','Heute waren es schon 4 Millimeter.']},
  {n:'Windmesser',t:['Das ist ein Schalenkreuz-Windmesser. Der Wind drückt in die kleinen Schalen und dreht das Kreuz.','Je schneller es sich dreht, desto stärker weht der Wind.','Gerade weht ein leichter Wind mit 12 Kilometern pro Stunde.']},
  {n:'Barometer',t:['Das ist ein Barometer. Es misst, wie schwer die Luft über uns drückt: den Luftdruck.','Sinkt der Luftdruck, kommt oft schlechtes Wetter. Steigt er, wird es meistens schön.','Der Zeiger steigt gerade. Das sieht gut aus!']},
  {n:'Haar-Hygrometer',t:['Das ist ein Haar-Hygrometer. Es misst, wie feucht die Luft ist.','Darin ist ein echtes Haar gespannt. Bei feuchter Luft wird es ein bisschen länger und bewegt den Zeiger.','Die Luftfeuchtigkeit liegt bei 60 Prozent.']}];
const WWERK=(()=>{let W_=null,m_=null,site=null,rainbow=null,stations=[],rbUntil=0,anemo=null;
  const S=()=>SAVE.wwerk=SAVE.wwerk||{seen:[]};
  function stationModel(m,i){const g=new THREE.Group();P(g,G.cy(.45,.5,.15,14),chr(m),[0,.08,0]);P(g,G.cy(.06,.06,1.6,8),chr(m),[0,.85,0]);const top=grp(g,[0,1.65,0]);
    if(i===0){P(top,G.cy(.08,.08,.9,12),m.c('#e8f6ff',{opacity:.6,gloss:1.5}),[0,.45,0]).userData.noMerge=true;P(top,G.cy(.04,.04,.55,8),m.c('#ff3b4a'),[0,.3,0]);P(top,G.s(.12),m.c('#ff3b4a'),[0,0,0])}
    else if(i===1){P(top,G.cy(.25,.1,.3,16,1,true),gl(m,'#2fb5d9'),[0,.3,0]);P(top,G.cy(.12,.12,.5,14),m.c('#e8f6ff',{opacity:.6,gloss:1.5}),[0,-.05,0]).userData.noMerge=true}
    else if(i===2){const r=grp(top,[0,.3,0]);for(let k=0;k<3;k++){const a=k/3*TAU;P(r,G.cy(.015,.015,.4),chr(m),[Math.cos(a)*.2,0,Math.sin(a)*.2],[0,-a,PI/2]);P(r,G.hs(.1),gl(m,'#ff6fa5'),[Math.cos(a)*.4,0,Math.sin(a)*.4],[0,-a,PI/2])}P(top,G.cy(.03,.03,.3),chr(m),[0,.15,0]);anemo=r}
    else if(i===3){P(top,G.cy(.32,.32,.1,24),m.c('#c8a040',{gloss:1.4}),[0,.3,0],[PI/2,0,0]);P(top,G.cy(.28,.28,.01,24),m.c('#fffdf7'),[0,.3,.06],[PI/2,0,0]);P(top,G.bx(.02,.22,.01,0),m.c('#3b3450'),[.03,.36,.07],[0,0,-.4])}
    else{P(top,G.bx(.5,.6,.12,.04),gl(m,'#9b6ae0'),[0,.3,0]);P(top,G.bx(.01,.5,.01,0),m.c('#5a3a1a'),[-.15,.3,.07]);P(top,G.bx(.25,.02,.01,0),m.c('#3b3450'),[.05,.35,.07],[0,0,.3])}
    const sign=ctex('ww-st-'+i,256,48,(x,w,h)=>{x.fillStyle='#fbfbfd';x.fillRect(0,0,w,h);x.fillStyle='#2a6ac0';x.font='900 24px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(STATIONS[i].n.toUpperCase(),w/2,h/2+2)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.24),new THREE.MeshBasicMaterial({map:sign,side:THREE.DoubleSide}));sm.position.set(0,1.2,.08);sm.userData.noOutline=true;g.add(sm);addOutlines(g);return g}
  function machineModel(m){const g=new THREE.Group();P(g,G.bx(3.2,1.1,1.4,.2),gl(m,'#fbfbfd'),[0,.55,0]);P(g,G.bx(3.2,.8,.2,.1),gl(m,'#2fb5d9'),[0,1.4,.6],[.3,0,0]);
    for(let i=0;i<5;i++){P(g,G.cy(.2,.2,.12,16),gl(m,WX[i]),[-1.2+i*.6,1.15,-.2]);}const scr=ctex('ww-scr',256,96,(x,w,h)=>{x.fillStyle='#10200a';x.fillRect(0,0,w,h);x.fillStyle='#c9f27a';x.font='bold 30px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('WETTER-WAHL',w/2,h/2)});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshBasicMaterial({map:scr,toneMapped:false}));s.position.set(0,1.5,.49);s.rotation.x=-.3;s.rotation.y=PI;s.userData.noOutline=true;g.add(s);
    P(g,G.cy(.1,.12,3,10),chr(m),[1.3,2.1,.5]);wolke(g,m,[1.3,3.8,.5],1.3);P(g,G.cy(.1,.12,2.4,10),chr(m),[-1.3,1.8,.5]);sonne(g,m,[-1.3,3.2,.5],1.3);addOutlines(g);return g}
  function rainbowModel(){const g=new THREE.Group();const cols=['#ff4a5a','#ff9a45','#ffd23f','#7fd34a','#2fb5d9','#9b6ae0'];cols.forEach((c,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(30-i*1.1,.55,8,64,PI),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.75,depthWrite:false}));g.add(m)});g.visible=false;return g}
  function onLoad(W){W_=W;stations=[];rainbow=null;rbUntil=0;m_=makeMats({skin:'plastik',color:0});const r=srand(3131);const pl=GAME.G.places.find(p=>p.id==='platz');const st=S();
    let d=null;for(const[lo,hi,np]of[[24,42,1.4],[20,70,1.2],[16,120,1.05]]){for(let t=0;t<800&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=pl?angle(cd,pl.dir)*W.R:99;if(a<lo||a>hi)continue;if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.4)continue;if(GAME.nearPlace&&GAME.nearPlace(cd,np))continue;d=cd}if(d)break}
    if(d){site=d;const g=machineModel(m_);GAME.placeObj(g,d,r()*TAU,0,true);W.inter.push({kind:'wettermaschine',p:d,r:3,label:'Wettermaschine bedienen',act:()=>panel()});
      rainbow=rainbowModel();GAME.G.scene.add(rainbow);const toPl=pl?pl.dir.clone().sub(d.clone().multiplyScalar(pl.dir.dot(d))).normalize():new V(1,0,0).cross(d).normalize();rainbow.position.copy(d).multiplyScalar(W.R+1).addScaledVector(toPl,-6);rainbow.up.copy(d);rainbow.lookAt(rainbow.position.clone().add(toPl))}
    const used=d?[d]:[];for(let i=0;i<STATIONS.length;i++){let p=null;for(let t=0;t<400&&!p;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.93||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(used.some(x=>angle(x,cd)*W.R<24))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;p=cd}
      if(!p)continue;used.push(p);const g=stationModel(m_,i);GAME.placeObj(g,p,r()*TAU,0,true);W.inter.push({kind:'messstation',p,r:1.8,label:'Messstation: '+STATIONS[i].n,act:()=>visit(i)});stations.push({i,p,g})}}
  async function visit(i){const st=S();const s=STATIONS[i];await UI.talk(s.n,s.t,{color:'#2a6ac0'});if(st.seen.includes(i))return;st.seen.push(i);persist();money(80);SND.play('pickup',{rate:1.1});
    UI.toast('Messstation '+st.seen.length+' von '+STATIONS.length+' besucht. Plus 80 Taler.',2600);if(typeof PIKO!=='undefined'&&st.seen.length===1)PIKO.want('Wetter messen ist gar nicht so schwer! Es gibt noch vier weitere Messstationen.');
    if(st.seen.length===STATIONS.length&&!st.done){st.done=true;persist();await UI.talk('Wetterfee Isobar',['Du kennst jetzt alle fünf Messgeräte! Damit bist du offiziell Wetter-Lehrling.','An der Wettermaschine kannst du jetzt auch Polarlicht und Blasenregen einschalten. Und hier ist ein kleines Wetterhäuschen für dein Zimmer.']);bagAdd('furn','wetterhaeuschen_mini');bagAdd('relic','schneeflocke_glas');money(300);SND.jingle('j_success')}}
  async function panel(){const st=S();const opts=[['Sonne','klar'],['Regen','regen'],['Schnee','schnee'],['Nebel','nebel'],['Gewitter','gewitter'],['Regenbogen','regenbogen']];if(st.done)opts.push(['Polarlicht','polar'],['Blasenregen','blasen']);
    const c=await UI.talk('Wettermaschine',['Bip! Welches Wetter darf es sein?'],{color:'#2fb5d9',voice:{pitch:320,kind:'robot'},choices:opts.map(o=>o[0])});if(c<0)return;const k=opts[c][1];SND.play('powerup',{rate:1});
    if(k==='regenbogen'){WEATHER.set('heiter');if(rainbow){rainbow.visible=true;rbUntil=performance.now()+180000}UI.toast('Ein Regenbogen! Er entsteht, wenn Sonnenlicht in Regentropfen in seine Farben zerlegt wird.',4200);return}
    if(rainbow)rainbow.visible=false;WEATHER.set(k);UI.toast('Das Wetter ändert sich: '+opts[c][0]+'.',2400)}
  function tick(dt,t){if(anemo)anemo.rotation.y=t*3;if(rainbow&&rainbow.visible){const k=Math.max(0,Math.min(1,(rbUntil-performance.now())/5000));rainbow.children.forEach(c=>c.material.opacity=.75*Math.min(1,k));if(performance.now()>rbUntil)rainbow.visible=false}}
  return{onLoad,tick,site:()=>site,stations:()=>stations,_panel:panel,_visit:visit,rainbow:()=>rainbow}
})();
window.WWERK=WWERK;
})();
