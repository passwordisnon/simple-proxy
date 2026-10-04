/* =====================================================================
   CYBORG-LABOR · planets/nachtmarkt.js · Laternen-Nachtmarkt
   Ein Planet, auf dem immer früher Abend ist. Lampion-Bäume, Mondblumen,
   Sternbüsche, Glühgras und Laternenpilze leuchten warm. Die Häuser sind
   riesige Papierlaternen, Marktstände mit Lampion-Ketten und Mondsichel-
   Häuser.
   Besonderheit:
   · Tauschkette: Fünf Marktstände stehen um den Platz. Jede Händlerin
     möchte etwas, das man beim vorherigen Stand bekommt: Tee, Lampion,
     Seifenblasen, Glöckchen, Mondkuchen. Wer die ganze Kette schafft,
     darf den Himmelslaternen-Abend starten: Dutzende Lichter steigen vom
     Markt in den Himmel.
   ===================================================================== */
(function(){
const ID='nachtmarkt';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const LAM=['#ff4a5a','#ff9a45','#ffd23f','#ff6fa5','#b89aff'];
const gl=(m,c)=>m.c(c,{gloss:.8,rim:1.2,rimColor:'#fff2c0'});
function lampion(g,m,p,r,col){const q=grp(g,p);P(q,G.s(r),gl(m,col),[0,0,0],null,[1,1.15,1]);P(q,G.s(r*.55),m.glow('#ffe0a0',1.5),[0,0,0]).userData.noOutline=true;P(q,G.cy(r*.45,r*.45,r*.18,12),m.c('#3b3450'),[0,r*1.1,0]);P(q,G.cy(r*.45,r*.45,r*.18,12),m.c('#3b3450'),[0,-r*1.1,0]);return q}

/* ================= Natur ================= */
N('lampionbaum',{r:.4,h:4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.4,3.2);P(g,G.cy(.12,.18,h,10),m.c('#6a4a3a'),[0,h/2,0]);
  for(let i=0;i<5;i++){const a=i/5*TAU+rnd()*.4;const L=RR(rnd,.9,1.4);const e=[Math.cos(a)*L,h+.4+rnd()*.4,Math.sin(a)*L];P(g,G.tu([[0,h*.8,0],[e[0]*.5,e[1]+.1,e[2]*.5],e],.06,.03,10),m.c('#6a4a3a'));P(g,G.s(.45),m.c('#3a6a5a'),e,null,[1,.6,1]);
    P(g,G.cy(.008,.008,.4),m.c('#3b3450'),[e[0],e[1]-.3,e[2]]);lampion(g,m,[e[0],e[1]-.65,e[2]],.16,LAM[(i+Math.floor(rnd()*5))%5])}});
N('mondblume',{r:.15,h:.8,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.4,.75);P(g,G.cy(.02,.025,h,6),m.c('#4a8a6a'),[0,h/2,0]);for(let i=0;i<6;i++){const a=i/6*TAU;P(g,G.s(.08),m.c('#f8f4ff',{rim:1.3,rimColor:'#c8d8ff'}),[Math.cos(a)*.08,h+.03,Math.sin(a)*.08],null,[1,.4,1.4]).rotation.y=-a}P(g,G.s(.05),m.glow('#fff2c0',1.4),[0,h+.06,0])});
N('sternbusch',{r:.45,h:.9,shake:true,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.45,.08,3,rnd()*9),m.c('#2e5a5a'),[0,.42,0],null,[1.15,.85,1]);for(let i=0;i<5;i++){const th=.4+rnd()*1,ph=rnd()*TAU;P(g,G.star(.07,.03,5,.02),m.glow('#ffe86a',1.6),[Math.sin(th)*Math.cos(ph)*.5,.42+Math.cos(th)*.36,Math.sin(th)*Math.sin(ph)*.45])}});
N('laternenpilz',{r:.2,h:.6,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.25,.5);P(g,G.cy(.05,.07,h,10),m.c('#f2e8d8'),[0,h/2,0]);const c=LAM[Math.floor(rnd()*5)];P(g,G.hs(.2),m.c(c,{opacity:.8,gloss:1,rim:1.3}),[0,h,0]);P(g,G.s(.08),m.glow('#ffe0a0',1.4),[0,h+.04,0])});
N('gluehgras',{r:.12,h:.4,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#3a7a6a');for(let i=0;i<4;i++){const a=rnd()*TAU,h=RR(rnd,.2,.38);P(g,G.tu([[0,0,0],[Math.cos(a)*.06,h*.6,Math.sin(a)*.06],[Math.cos(a)*.1,h,Math.sin(a)*.1]],.02,.006,6),c)}if(rnd()<.5)P(g,G.s(.025),m.glow('#e8ff8a',1.8),[.1,.35,.05])});
N('mondfels',{r:.6,h:1,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.blob(.6,.12,3,rnd()*9),m.c('#c8c0e0'),[0,.35,0],null,[1.2,.65,1]);for(let k=0;k<3;k++){const a=rnd()*TAU;P(g,G.circ(.12+rnd()*.08),m.c('#a8a0c8'),[Math.cos(a)*.4,.6,Math.sin(a)*.4],[-PI/2+.4,0,a])}});
Object.assign(NH.ROCK,{[ID]:['#c8c0e0','#a8a0c8','#ff9a45']});

/* ================= Biome ================= */
const BI={
  marktgasse:{n:'Marktgasse',g:['#4a7a6a','#42705f'],cliff:'#5a5070',pat:'gras',grass:'#4a7a68',grassD:.8,trees:[['lampionbaum',1]],treeD:.5,
    deco:[['laternenpilz',3],['gluehgras',4],['mondblume',2]],decoD:6,rocks:[['mondfels',.3]],rockD:.3,litter:[['kerzenwachs',1],['sternsplitter',.3]]},
  lampionhain:{n:'Lampion-Hain',g:['#3a6a5a','#346050'],cliff:'#4a4060',pat:'moos',grass:'#3a6a5a',grassD:1,trees:[['lampionbaum',2.8]],treeD:1.4,
    deco:[['sternbusch',2],['laternenpilz',3]],decoD:5,rocks:[['mondfels',.2]],rockD:.2,litter:[['kerzenwachs',1.2]]},
  mondwiese:{n:'Mondwiese',g:['#6a8aa0','#607e94'],cliff:'#5a6080',pat:'gras',grass:'#6a8aa0',grassD:.7,trees:[['lampionbaum',.4]],treeD:.25,
    deco:[['mondblume',6],['gluehgras',3]],decoD:5,rocks:[['mondfels',.5]],rockD:.4,litter:[['sternsplitter',.6]]},
  sternenufer:{n:'Sternen-Ufer',g:['#8a90b8','#7e84ac'],cliff:'#5a6080',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['sternbusch',1.5],['laternenpilz',1]],decoD:2,rocks:[['mondfels',.4]],rockD:.4,litter:[['muschel',.8],['sternsplitter',.6]]},
  nachtgipfel:{n:'Nachtgipfel',g:['#b8b0d0','#aca4c4'],cliff:'#8a80a8',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['mondblume',1]],decoD:1,rocks:[['mondfels',1.4]],rockD:.9,litter:[['sternsplitter',1.2]]}};

/* ================= Sammelsachen ================= */
IT('kerzenwachs',itMeta('Kerzenwachs','nachtmarkt','material',25),(g,m)=>{P(g,G.blob(.1,.2,3,3),m.c('#fff6e0'),[0,.05,0],null,[1.4,.4,1.2])});
IT('sternsplitter',itMeta('Sternsplitter','nachtmarkt','material',80),(g,m)=>P(g,G.star(.1,.045,5,.03),m.glow('#ffe86a',1.5),[0,.06,0],[-PI/2,0,0]));

/* ================= Fische ================= */
F('sternkarpfen',fishMeta('Sternkarpfen','nachtmarkt','teich','M','nacht',2,520,'Ich hab einen Sternkarpfen gefangen! Auf seinem Rücken funkeln kleine Sterne.','Karpfen können über 40 Jahre alt werden. Man erkennt ihr Alter an Ringen auf den Schuppen, wie bei einem Baum.'),
  (g,m)=>fishT(g,m,{id:'sternkarpfen',H:.28,L:.8,back:'#3a4a8a',belly:'#e8e0ff',tail:'fork',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ffe86a';for(let i=0;i<10;i++){const cx=(i*41)%w,cy=10+(i*23)%(h*.4);x.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU,r=k%2?3:7;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.fill()}}}));
F('laternenaal',fishMeta('Laternen-Aal','nachtmarkt','meer','M','nacht',2,460,'Ich hab einen Laternen-Aal gefangen! Er leuchtet am Kopf wie eine kleine Laterne.','Aale können über Land kriechen, wenn das Gras nass ist. So wechseln sie manchmal von einem Teich in den nächsten.'),
  (g,m)=>{const pts=[];for(let k=0;k<=8;k++)pts.push([Math.sin(k*.8)*.05,0,(k/8-.5)*1]);P(g,G.tu(pts,.06,.03,20),m.c('#4a3a5a'));P(g,G.s(.07),m.glow('#ffb43a',1.6),[0,.06,.5]);eye(g,m,[.04,.03,.46],.022,[.6,.3,.6]);eye(g,m,[-.04,.03,.46],.022,[-.6,.3,.6])});
F('mondscheinbarsch',fishMeta('Mondscheinbarsch','nachtmarkt','teich','S','immer',1,160,'Ich hab einen Mondscheinbarsch gefangen! Er glänzt silbern wie der Mond.','Viele Fische haben silberne Schuppen. Sie spiegeln das Licht und machen den Fisch im Wasser fast unsichtbar.'),
  (g,m)=>fishT(g,m,{id:'mondscheinbarsch',H:.2,L:.55,back:'#a8b0c8',belly:'#f4f6ff',tail:'fork',dorsal:'hi'}));

/* ================= Insekten ================= */
B('laternentraeger',bugMeta('Laternenträger','nachtmarkt','baum','nacht',3,1100,'Ich hab einen Laternenträger gefangen! Sein Kopf sieht aus wie eine kleine Laterne.','Laternenträger heissen so, weil man früher glaubte, ihr langer Kopf leuchte. In Wahrheit leuchten sie gar nicht.'),
  (g,m)=>{const c=m.c('#c87a3a',{gloss:1});P(g,G.ca(.06,.24),c,[0,.15,0],[PI/2,0,0]);P(g,G.ca(.04,.22),m.c('#ff4a5a',{gloss:1.2}),[0,.2,.3],[1.2,0,0]);for(const s of[-1,1])P(g,G.s(.16),m.c('#ffd27a',{opacity:.85}),[s*.12,.2,0],null,[.9,.08,1.4]);bugFace(g,m,[0,.16,.18],.05,.5);legs(g,c,[[.06,.1,.06],[0,.1,0],[-.06,.1,-.06]],.16)});
B('mondfalter',bugMeta('Mondfalter','nachtmarkt','luft','nacht',2,520,'Ich hab einen Mondfalter gefangen! Er ist blassgrün und hat lange Schwänze an den Flügeln.','Der amerikanische Mondspinner hat als erwachsener Falter gar keinen Mund. Er lebt nur etwa eine Woche.'),
  (g,m)=>butterfly(g,m,'mondfalter','#c8f0b8','#e8ffd8','#4a6a4a'));
B('weinhaehnchen',bugMeta('Weinhähnchen','nachtmarkt','boden','nacht',1,180,'Ich hab ein Weinhähnchen gefangen! Es singt die ganze Nacht ganz leise.','Das Weinhähnchen ist eine kleine helle Grille. Ihr Gesang klingt wie ein zartes «drüüüh» und ist oft die ganze Nacht zu hören.'),
  (g,m)=>{const c=m.c('#e8e0b0',{gloss:.8});P(g,G.ca(.05,.24),c,[0,.13,0],[PI/2,0,0]);P(g,G.s(.06),c,[0,.14,.18]);bugFace(g,m,[0,.15,.23],.05,.5);for(const s of[-1,1])P(g,G.tu([[s*.02,.17,.22],[s*.12,.25,.4],[s*.18,.22,.55]],.006,.003,8),c);legs(g,c,[[.06,.09,.06],[0,.09,0],[-.06,.09,-.08]],.18)});

/* ================= Fundstücke ================= */
REL('himmelslaterne_alt',relMeta('Alte Himmelslaterne','nachtmarkt','kunst',2,900,'Eine Papierlaterne, die einmal bis zum Mond fliegen wollte.','Eine Himmelslaterne steigt, weil die warme Luft darin leichter ist als die kalte Luft draussen – wie bei einem Heissluftballon.'),
  (g,m)=>{P(g,G.cy(.18,.14,.36,12,1,true),m.c('#ff9a45',{side:THREE.DoubleSide}),[0,.2,0]);P(g,G.to(.14,.01),m.c('#3b3450'),[0,.02,0],[PI/2,0,0])});
REL('mondkuchen_form',relMeta('Mondkuchen-Form','nachtmarkt','schatz',3,2000,'Eine geschnitzte Holzform. Damit bekommt jeder Kuchen ein Muster wie ein Mond.','Viele Feste auf der Welt richten sich nach dem Mond. Ein Mondmonat dauert etwa 29,5 Tage – von Vollmond zu Vollmond.'),
  (g,m)=>{P(g,G.bx(.5,.12,.3,.03),m.c('#a87a5a'),[0,.06,0]);P(g,G.cy(.11,.11,.02,20),m.c('#8a5a3a'),[-.08,.125,0]);P(g,G.bx(.2,.08,.08,.02),m.c('#a87a5a'),[.3,.06,0])});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  laternenfuchs:{n:'Laternen-Fuchs',planet:ID,biomes:['lampionhain','marktgasse','mondwiese'],count:3,size:.65,speed:1.2,gait:'fast',shy:true,voice:['kek','wau-kek','iiik'],pitch:520,likes:['kerzenwachs','weinhaehnchen'],product:'kerzenwachs',names:['Funkel','Lampi','Rotschopf','Docht','Glimmer'],
    fact:'Füchse hören so gut, dass sie eine Maus unter dem Schnee quieken hören. Dann springen sie hoch und landen genau darauf.',a:{col:'#ff8a3a',belly:'#fff2e0',body:[.28,.26,.42],head:{r:.22,p:[0,.5,.34]},snout:{type:'long',col:'#fff2e0',nose:'#3b3450'},ears:{type:'pointy',len:.42},legs:{n:4,len:.16,r:.05,foot:'#3b3450'},tail:{type:'bushy',col:'#ff8a3a'},gait:'fast'}},
  mondhase:{n:'Mondhase',planet:ID,biomes:['mondwiese','sternenufer'],count:4,size:.6,speed:1.3,gait:'hop',shy:true,voice:['fiep','pfff','tschik'],pitch:640,likes:['mondblume','sternsplitter'],product:'sternsplitter',names:['Luna','Vollmond','Hoppel','Sichel','Krater'],
    fact:'In vielen Ländern erzählt man, man sehe auf dem Vollmond einen Hasen. Die dunklen Flecken sind in Wahrheit alte Lava-Ebenen.',a:{col:'#e8e4f8',belly:'#ffffff',body:[.28,.26,.34],head:{r:.22,p:[0,.46,.26]},snout:{type:'muzzle',col:'#ffffff',nose:'#ff9ab8'},ears:{type:'pointy',len:.65},legs:{n:4,len:.1,r:.06,foot:'#ffffff'},tail:{type:'puff',col:'#ffffff',r:.1},gait:'hop'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','lampionhut','Lampion-Hut',460,'#ff4a5a',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.s(r*.75),M.c(col,{gloss:.8}),[0,r*.25,0],null,[1,.7,1]);for(let k=0;k<4;k++)P(q,G.to(r*(.6+Math.sin((k+1)/5*PI)*.15),r*.03),M.c('#3b3450'),[0,r*(-.1+k*.17),0],[PI/2,0,0]);P(q,G.cy(r*.3,r*.3,r*.1),M.c('#3b3450'),[0,r*.75,0])});
def('top','sternenumhang','Sternen-Umhang',820,'#3a3a8a',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.7,r*1.05,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);for(let k=0;k<5;k++){const a=k*1.3;P(q,G.star(r*.08,r*.035,5,r*.02),M.glow('#ffe86a',1.4),[Math.cos(a)*r*.9,-r*(.2+k*.12),Math.sin(a)*r*.9])}});

/* ================= Möbel ================= */
furn('himmelslaterne',{n:'Himmelslaterne',cat:'licht',price:1600,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{const q=grp(g,[0,1.2,0]);P(q,G.cy(.3,.24,.6,14,1,true),m.c('#ff9a45',{opacity:.85,side:THREE.DoubleSide}),[0,0,0]);P(q,G.s(.1),m.glow('#ffe0a0',1.8),[0,-.2,0]);
  P(g,G.cy(.2,.25,.06,16),m.c('#3b3450'),[0,.03,0]);P(g,G.cy(.006,.006,.9),m.c('#3b3450'),[0,.5,0]);g.userData.tick=t=>{q.position.y=1.2+Math.sin(t*1.2)*.08};g.userData.light={p:[0,1.1,0],c:'#ffc880',i:.7}}});
furn('marktstand_mini',{n:'Mini-Marktstand',cat:'deko',price:1200,planet:ID,size:[2,1],h:1.4,b:(g,m)=>{P(g,G.bx(1.4,.7,.5,.04),m.c('#c8945a'),[0,.35,0]);for(const x of[-.65,.65])P(g,G.cy(.03,.03,1.3),m.c('#c8945a'),[x,.65,-.2]);P(g,G.bx(1.6,.05,.7,.02),m.c('#ff4a5a'),[0,1.3,-.05],[-.2,0,0]);for(let k=0;k<3;k++)lampion(g,m,[-.4+k*.4,1.05,-.25],.08,LAM[k])}});

/* ================= Sprache: Laternenschrift ================= */
function laternenGlyph(x,s,r){x.save();x.lineWidth=s*.06;x.lineCap='round';const n=1+Math.floor(r()*3);for(let i=0;i<n;i++){const cx=(i-(n-1)/2)*s*.22;x.beginPath();x.ellipse(cx,0,s*.08,s*.14,0,0,TAU);x.stroke();x.beginPath();x.moveTo(cx,-s*.14);x.lineTo(cx,-s*.26);x.stroke();if(r()<.6){x.beginPath();x.arc(cx,0,s*.03,0,TAU);x.fill()}}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Laternen-Nachtmarkt',base:'kompost',R:118,R0:40,sea:-.3,music:'town',sky:['#2a2a6a','#ff9a6a'],fog:'#5a4a7a',water:'#3a5aa0',deep:'#1a2a6a',step:1.05,shop:ID,
    desc:'Auf diesem Planeten ist immer früher Abend. Lampions leuchten in den Bäumen, und auf dem Markt wird getauscht. Am Ende steigen Himmelslaternen auf.',weather:'blueten',orbit:[243,0.4],size:1,col:['#4a7a6a','#ff9a45'],moons:2,
    park:'marktgasse',parkPond:true,phone:['#ffe0c0','#e0d0ff'],stones:['kiesel','kerzenwachs','stein_klein'],plazaTree:'lampionbaum',path:'#b89ab0',
    space:{deep:'#1a2a6a',water:'#3a5aa0',shore:'#8a90b8',land:'#4a7a6a',land2:'#3a6a5a',high:'#b8b0d0',cap:'#ffe0c0',atmo:'#ff9a6a',cloud:.3,sea:.36,capA:.3,freq:2.6},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'mondwiese',wet:'sternenufer',cold:'nachtgipfel'},peak:'nachtgipfel',
    raw(q,p,{N,N2,fbm}){return fbm(q,1.05,4)*2+.7},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'sternenufer';if(h>sea+4.3)return'nachtgipfel';if(T>.3)return'mondwiese';if(M>.2)return'lampionhain';return'marktgasse'},
    onLoad:W=>MARKT.onLoad(W),tick:(dt,t,W,me)=>MARKT.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Laternen-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Mondteich',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Sternensee',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Markt-Spielecke',mode:'Abendmode',praxis:'Nacht-Praxis',museum:'Laternen-Museum',shop:'Kerzenladen',studio:'Schattenspiel-Atelier',bar:'Teehaus',rathaus:'Marktamt',garage:'Laternenwagen-Garage',pflanzen:'Mondblumen-Gärtnerei',tiere:'Nachttier-Laden'},
  sty:{wall:'putz',walls:['#fff2e0','#f8f0ff','#fff6f0'],roof:'dome',roofs:LAM.slice(0,4),trim:'#fff2c0',plinth:'#5a5070',door:'#ff4a5a',win:'rund',pitch:.9},
  wall:'streifen',floor:'parkett',
  mayor:['Marktmeisterin Docht',{skin:'pluesch',color:2,shape:'ei'},{kopf:'katze',augen:'mensch',arme:'mensch',beine:'mensch',extras:[]}],
  lore:['Willkommen auf dem Laternen-Nachtmarkt! Hier geht die Sonne nie ganz unter. Es ist immer kurz nach sieben.','Fünf Händlerinnen tauschen gern. Fang beim Teestand an, dann führt eins zum anderen.','Wenn die ganze Tauschkette geschafft ist, steigen die Himmelslaternen auf. Das sieht man von allen Planeten aus.'],
  caveRock:['#c8c0e0','#a8a0c8','#8a80a8',LAM.slice(0,3)],
  wear:['lampionhut','sternenumhang','kappe','halstuch'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['pirate','barrel',.33,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'laternenhaus'},{fam:'kokon',style:'marktstand'},{fam:'kokon',style:'mondhaus'},{fam:'kokon',style:'laternenhaus'}]},
  residents:{skins:['pluesch','fell','bonbon','glas'],heads:['katze','eule','vogel','mensch','frosch','eikopf'],names:['Docht','Lampi','Funkel','Mondi','Glut','Kerze','Abend','Stern','Teelicht','Schimmer','Luna','Abendrot'],
    house:{shapes:['rund','haus'],walls:['putz'],wallCols:['#fff2e0','#f8f0ff','#fff6f0'],roofCols:LAM.slice(0,4),win:['rund']},deco:['laternenpilz','mondblume','lampionbaum'],fence:false},
  lang:{n:'Laternenschrift',ink:'#8a3a3a',glow:'#ff9a45',kind:'runes',draw:laternenGlyph,syl:['la','ter','ne','mo','nd','ste','rn','glu','ht','ab','end','rot']},ruinStone:'#c8c0e0',
  terraform:['marktgasse','lampionhain','mondwiese','sternenufer'],
  weather:[['klar',5],['heiter',2],['nebel',1]]});

/* ================= Tauschkette und Himmelslaternen ================= */
const STALLS=[
  {n:'Teestand Tilda',want:null,give:'tee',gN:'eine Tasse Pfefferminztee',col:'#7fd34a',hi:['Guten Abend! Hier, eine Tasse Pfefferminztee für dich, ganz umsonst.','Die Lampion-Händlerin hat bestimmt Durst. Sie steht nicht weit von hier.']},
  {n:'Lampion-Lotti',want:'tee',give:'lampion',gN:'einen roten Lampion',col:'#ff4a5a',hi:['Oh, Tee! Genau das brauche ich nach so vielen Lampions.','Dafür bekommst du einen roten Lampion. Der Seifenblasen-Stand mag es hell.']},
  {n:'Blasen-Bruno',want:'lampion',give:'blasen',gN:'einen Seifenblasen-Stab',col:'#45e0ff',hi:['Ein Lampion! Jetzt sieht man meine Seifenblasen auch im Dunkeln.','Nimm diesen Seifenblasen-Stab. Am Glöckchen-Stand freut man sich bestimmt.']},
  {n:'Glöckchen-Gisa',want:'blasen',give:'gloeckchen',gN:'ein silbernes Glöckchen',col:'#b89aff',hi:['Seifenblasen! Die schweben so schön zwischen meinen Glöckchen.','Hier ist ein silbernes Glöckchen. Der Mondkuchen-Bäcker wartet schon auf ein Signal.']},
  {n:'Mondkuchen-Mo',want:'gloeckchen',give:'mondkuchen',gN:'einen Mondkuchen',col:'#ffd23f',hi:['Ein Glöckchen! Damit läute ich den Himmelslaternen-Abend ein.','Hier ist ein Mondkuchen für dich. Und jetzt: Schau nach oben!']}];
const MARKT=(()=>{let W_=null,m_=null,stalls=[],lanterns=[],launchT=-1,center=null;
  const S=()=>SAVE.markt=SAVE.markt||{step:0,hold:null};
  function stallModel(m,i){const g=new THREE.Group();const s=STALLS[i];P(g,G.bx(2,.9,.9,.05),m.c('#c8945a'),[0,.45,0]);for(const x of[-.95,.95])for(const z of[-.4,.4])P(g,G.cy(.05,.05,2.3),m.c('#a87a5a'),[x,1.15,z]);
    const t=ctex('nm-dach-'+i,128,32,(x,w,h)=>{for(let k=0;k<8;k++){x.fillStyle=k%2?s.col:'#fff6e0';x.fillRect(k*w/8,0,w/8,h)}});P(g,G.bx(2.4,.08,1.4,.03),m.c('#ffffff',{map:t,gloss:.5}),[0,2.35,0],[.15,0,0]);
    for(let k=0;k<3;k++)lampion(g,m,[-.6+k*.6,1.95,.6],.14,LAM[(i+k)%5]);
    const sign=ctex('nm-sign-'+i,256,48,(x,w,h)=>{x.fillStyle='#3b3450';x.fillRect(0,0,w,h);x.fillStyle='#ffe0a0';x.font='900 24px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(s.n,w/2,h/2+2)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.34),new THREE.MeshBasicMaterial({map:sign,toneMapped:false}));sm.position.set(0,2.05,.62);sm.userData.noOutline=true;g.add(sm);
    for(let k=0;k<4;k++)P(g,G.s(.1),gl(m,LAM[(k+i)%5]),[-.6+k*.4,.98,0]);addOutlines(g);return g}
  function skyLantern(m){const g=new THREE.Group();P(g,G.cy(.35,.28,.7,12,1,true),m.c(LAM[Math.floor(Math.random()*5)],{opacity:.85,side:THREE.DoubleSide}),[0,0,0]).userData.noMerge=true;P(g,G.s(.14),m.glow('#ffe0a0',2),[0,-.25,0]).userData.noOutline=true;return g}
  async function talk(i){const st=S();const s=STALLS[i];
    if(st.step>i){await UI.talk(s.n,['Danke nochmal! Der Markt ist heute besonders schön.']);return}
    if(st.step<i){await UI.talk(s.n,['Guten Abend! Ich hätte gern '+({tee:'eine Tasse Tee',lampion:'einen Lampion',blasen:'Seifenblasen',gloeckchen:'ein Glöckchen'}[s.want])+'.','Frag doch erst bei den anderen Ständen nach.']);return}
    await UI.talk(s.n,s.hi);st.hold=s.give;st.step=i+1;persist();SND.play('pickup',{rate:1.1});money(60);UI.toast('Du bekommst '+s.gN+'. Plus 60 Taler.',2400);
    if(typeof PIKO!=='undefined'&&st.step===1)PIKO.want('Ein Tausch! Mal sehen, wer am Markt Tee möchte.');
    if(st.step===STALLS.length&&!st.done){st.done=true;persist();launch();setTimeout(async()=>{await UI.talk('Marktmeisterin Docht',['Die ganze Tauschkette! So einen Abend hatten wir lange nicht.','Nimm eine Himmelslaterne mit nach Hause. Sie steigt jeden Abend ein kleines bisschen.']);bagAdd('furn','himmelslaterne');bagAdd('relic','mondkuchen_form');money(300);SND.jingle('j_success')},4000)}}
  function launch(){if(!center)return;launchT=0;lanterns.forEach(l=>{l.g.visible=true;l.y=0})}
  function onLoad(W){W_=W;stalls=[];lanterns=[];launchT=-1;m_=makeMats({skin:'plastik',color:0});const pl=GAME.G.places.find(p=>p.id==='platz');center=pl?pl.dir.clone():null;const r=srand(4747);
    const used=[];for(let i=0;i<STALLS.length;i++){let d=null;for(const[lo,hi,np]of[[22,48,1.3],[18,80,1.15],[14,120,1.05]]){for(let t=0;t<500&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();const a=pl?angle(cd,pl.dir)*W.R:99;if(a<lo||a>hi)continue;if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(used.some(x=>angle(x,cd)*W.R<14))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,np))continue;d=cd}if(d)break}
      if(!d)continue;used.push(d);const g=stallModel(m_,i);GAME.placeObj(g,d,r()*TAU,0,true);W.inter.push({kind:'marktstand',p:d,r:2.4,label:'Mit '+STALLS[i].n+' sprechen',act:()=>talk(i)});stalls.push({i,d,g})}
    if(center){for(let i=0;i<40;i++){const off=new V(r()-.5,r()-.5,r()-.5).normalize();const p=center.clone().addScaledVector(off,(4+r()*26)/W.R).normalize();const g=skyLantern(m_);g.visible=false;GAME.G.scene.add(g);lanterns.push({g,p,y:0,sp:.8+r()*.9,ph:r()*TAU,delay:r()*6})}
      if(S().done){launchT=60}}}
  const _q=new THREE.Quaternion(),UP=new V(0,1,0);
  function tick(dt,t){if(launchT<0)return;launchT+=dt;for(const l of lanterns){const k=Math.max(0,launchT-l.delay);const y=Math.min(60,k*l.sp)+(launchT>60?Math.sin(t*.5+l.ph)*.8:0);if(k<=0&&launchT<60){l.g.visible=false;continue}l.g.visible=true;
      const R=W_.R+(W_.hExact||W_.hAt)(l.p)+1.5+y;const p=l.p.clone().applyAxisAngle(UP,Math.sin(t*.2+l.ph)*.004);l.g.position.copy(p).multiplyScalar(R);_q.setFromUnitVectors(UP,p);l.g.quaternion.copy(_q)}}
  return{onLoad,tick,stalls:()=>stalls,_talk:talk,_launch:launch}
})();
window.MARKT=MARKT;
})();
