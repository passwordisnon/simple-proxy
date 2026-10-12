/* =====================================================================
   CYBORG-LABOR · planets/kaufhaus.js · Kaufhaus 1999
   Ein Planet wie ein riesiges Einkaufszentrum am Silvesterabend 1999:
   Atrium-Palmen in runden Pflanzkübeln, Gummibäume, Kugelbüsche,
   Springbrunnen-Ufer, Kachelfelsen und ein Parkdeck mit gelben Linien.
   Die Häuser sind Kaufhäuser mit Glasaufzug, Läden mit Schaufenstern
   und riesige Einkaufstüten.
   Besonderheit:
   · Info-Säulen-Rallye: Sechs sprechende Info-Säulen stehen auf dem
     Planeten. Jede stellt eine Wissensfrage aus dem Jahr 1999. Für jede
     richtige Antwort gibt es einen Stempel in den Kundenpass. Wer alle
     sechs hat, bekommt die Goldene Kundenkarte und einen Mini-Brunnen.
   Kein Glücksspiel, kein Kaufdruck: Es geht ums Wissen.
   ===================================================================== */
(function(){
const ID='kaufhaus';
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT,leafShape}=NH;
const V=THREE.Vector3;
const MALL=['#ff6fa5','#2fb5d9','#9b6ae0','#ffd23f','#7fd34a'];
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1.1,rimColor:'#ffffff'});
const kuebel=(g,m,r,h,col)=>{P(g,G.cy(r,r*.85,h,20),gl(m,col),[0,h/2,0]);P(g,G.to(r,.05),m.c('#e6ecf5',{gloss:1.4}),[0,h,0],[PI/2,0,0]);P(g,G.cy(r*.92,r*.92,.04,20),m.c('#8a5a3a'),[0,h-.04,0])};

/* ================= Natur ================= */
N('atriumpalme',{r:.6,h:4.6,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.8,3.8);kuebel(g,m,.6,.55,MALL[Math.floor(rnd()*5)]);
  for(let i=0;i<8;i++)P(g,G.cy(.13-i*.006,.15-i*.006,h/8),m.c(i%2?'#c8a070':'#b8905a'),[0,.55+h/8*(i+.5),0]);const top=[0,.55+h,0];
  for(let i=0;i<7;i++){const a=i/7*TAU+rnd()*.3;const f=grp(g,top,[0,-a,0]);const w=P(f,new THREE.ShapeGeometry(leafShape(1.6,.36),8),m.dbl(i%2?'#5ab86a':'#4aa85a'),[0,0,0],[-.35,0,0]);w.userData.noOutline=false}});
N('gummibaum',{r:.4,h:2.4,shake:true,size:'big',planet:ID},(g,m,o,rnd)=>{kuebel(g,m,.38,.45,MALL[Math.floor(rnd()*5)]);P(g,G.tu([[0,.45,0],[.05,1.1,0],[0,1.9,0]],.05,.035,8),m.c('#8a6a4a'));
  for(let i=0;i<9;i++){const y=.9+i*.12,a=i*2.3;const f=grp(g,[0,y,0],[0,-a,0]);P(f,G.s(.18),m.c(i%2?'#2e7a4a':'#3a8a58',{gloss:1.3}),[.18,0,0],[0,0,.3],[1.4,.15,.8])}});
N('kugelbusch',{r:.4,h:1.4,size:'small',planet:ID},(g,m,o,rnd)=>{kuebel(g,m,.3,.4,'#fffdf7');P(g,G.cy(.03,.03,.4),m.c('#8a6a4a'),[0,.6,0]);P(g,G.s(.42),m.c('#5ab86a',{gloss:.9}),[0,1.05,0])});
N('preisblume',{r:.15,h:.8,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.4,.75);P(g,G.cy(.02,.02,h,6),m.c('#5ab86a'),[0,h/2,0]);const c=MALL[Math.floor(rnd()*5)];for(let i=0;i<5;i++){const a=i/5*TAU;P(g,G.s(.08),gl(m,c),[Math.cos(a)*.09,h+.04,Math.sin(a)*.09],null,[1,.5,1])}P(g,G.s(.05),gl(m,'#ffd23f'),[0,h+.06,0]);
  const tag=grp(g,[.06,h*.6,0],[0,0,-.4]);P(tag,G.bx(.1,.06,.01,.01),m.c('#fffdf7'),[.06,-.03,0]);P(tag,G.cy(.004,.004,.08),m.c('#3b3450'),[0,0,0],[0,0,PI/2])});
N('kachelfels',{r:.6,h:1,size:'big',planet:ID},(g,m,o,rnd)=>{const c=['#fbf7f0','#d8f6ff','#ffe0ee'][Math.floor(rnd()*3)];const n=2+Math.floor(rnd()*3);for(let i=0;i<n;i++){const s=RR(rnd,.45,.8);P(g,G.bx(s,s*.8,s,.06),gl(m,c),[(rnd()-.5)*.6,s*.4+(i>1?.4:0),(rnd()-.5)*.6],[0,rnd(),0])}
  for(let k=0;k<3;k++)P(g,G.bx(.02,.6,.02,0),m.c('#c8ccd8'),[(k-1)*.2,.3,.41]).userData.noOutline=true});
N('parkpoller',{r:.15,h:.9,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.cy(.09,.1,.8,12),gl(m,'#ffd23f'),[0,.4,0]);for(const y of[.25,.55])P(g,G.cy(.095,.105,.1,12),gl(m,'#3b3450'),[0,y,0]);P(g,G.s(.1),gl(m,'#ffd23f'),[0,.82,0])});
N('teppichgras',{r:.12,h:.25,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c(MALL[Math.floor(rnd()*5)]);for(let i=0;i<6;i++)P(g,G.cy(.015,.015,RR(rnd,.12,.24),4),c,[(rnd()-.5)*.25,.08,(rnd()-.5)*.25])});
Object.assign(NH.ROCK,{[ID]:['#fbf7f0','#d8f6ff','#ffe0ee']});

/* ================= Biome ================= */
const BI={
  atrium:{n:'Atrium',g:['#a8e09a','#98d48a'],cliff:'#d8d4e8',pat:'gras',grass:'#a0dc94',grassD:.8,trees:[['atriumpalme',1],['gummibaum',.8]],treeD:.55,
    deco:[['preisblume',5],['kugelbusch',1.2],['teppichgras',3]],decoD:6,rocks:[['kachelfels',.4]],rockD:.3,litter:[['kassenbon',1],['knopfbatterie',.5]]},
  palmenpassage:{n:'Palmen-Passage',g:['#90d088','#84c47c'],cliff:'#c8c4dc',pat:'moos',grass:'#90d088',grassD:1,trees:[['atriumpalme',2.4],['gummibaum',1.4]],treeD:1.4,
    deco:[['kugelbusch',2],['preisblume',2]],decoD:4,rocks:[['kachelfels',.3]],rockD:.3,litter:[['kassenbon',.8]]},
  parkdeck:{n:'Parkdeck',g:['#d8d8e0','#ccccd6'],cliff:'#a8a8b8',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,
    deco:[['parkpoller',2]],decoD:1.5,rocks:[['kachelfels',.6]],rockD:.5,litter:[['parkchip',1.4],['knopfbatterie',.6]]},
  brunnenufer:{n:'Brunnen-Ufer',g:['#c8ecf8','#b8e0f0'],cliff:'#98b8d8',pat:'sand',grass:'#b8e4f0',grassD:.4,trees:[['atriumpalme',.6]],treeD:.35,
    deco:[['kugelbusch',1],['preisblume',2]],decoD:3,rocks:[['kachelfels',.5]],rockD:.4,litter:[['parkchip',.8],['muschel',.4]]},
  dachgarten:{n:'Dachgarten',g:['#e8f0f8','#dce6f0'],cliff:'#b8c0d0',pat:'staub',grass:'#c8e8c0',grassD:.3,trees:[['gummibaum',.4]],treeD:.25,
    deco:[['parkpoller',1],['kugelbusch',1]],decoD:1.5,rocks:[['kachelfels',1.2]],rockD:.8,litter:[['kassenbon',1]]}};

/* ================= Sammelsachen ================= */
IT('kassenbon',itMeta('Alter Kassenbon','kaufhaus','material',20),(g,m)=>{P(g,G.bx(.16,.005,.34,0),m.c('#fffdf7'),[0,.01,0],[0,.3,0]);for(let i=0;i<4;i++)P(g,G.bx(.1,.006,.015,0),m.c('#8a8ea0'),[0,.015,-.1+i*.06],[0,.3,0]).userData.noOutline=true});
IT('parkchip',itMeta('Einkaufswagen-Chip','kaufhaus','material',30),(g,m)=>{P(g,G.cy(.11,.11,.025,20),gl(m,'#2fb5d9'),[0,.015,0]);P(g,G.to(.04,.012),m.c('#fffdf7'),[0,.03,0],[PI/2,0,0])});
IT('knopfbatterie',itMeta('Knopfbatterie','kaufhaus','material',45),(g,m)=>{P(g,G.cy(.1,.1,.04,20),m.c('#e6ecf5',{gloss:1.5}),[0,.02,0]);P(g,G.cy(.07,.07,.045,20),m.c('#c8ccd8',{gloss:1.4}),[0,.025,0])});

/* ================= Fische ================= */
F('brunnenkoi',fishMeta('Brunnen-Koi','kaufhaus','teich','M','tag',2,560,'Ich hab einen Brunnen-Koi gefangen! Er wohnt im grossen Springbrunnen im Atrium.','Koi sind gezüchtete Karpfen aus Japan. Manche werden über 50 Jahre alt.'),
  (g,m)=>fishT(g,m,{id:'brunnenkoi',H:.24,L:.85,back:'#fffdf7',belly:'#fffdf7',tail:'fan',dorsal:'std',pat:(x,w,h)=>{x.fillStyle='#ff6a3a';for(let i=0;i<4;i++){x.beginPath();x.ellipse(w*(.3+i*.12),h*(.3+(i%2)*.3),26,18,0,0,TAU);x.fill()}}}));
F('skalar',fishMeta('Skalar','kaufhaus','teich','S','nacht',1,190,'Ich hab einen Skalar gefangen! Er stammt aus dem Aquarium der Zoohandlung.','Skalare sind ganz flach wie eine Scheibe. So können sie zwischen Wasserpflanzen hindurchgleiten.'),
  (g,m)=>{const c=gl(m,'#e8e0c8');P(g,G.s(.2),c,[0,0,0],null,[.25,1,1]);P(g,G.co(.12,.4,3),c,[0,.32,-.05],null,[.15,1,1]);P(g,G.co(.12,.4,3),c,[0,-.32,-.05],[PI,0,0],[.15,1,1]);P(g,G.co(.1,.16,3),c,[0,0,-.26],[-PI/2,0,0],[.15,1,1]);
    for(let i=0;i<3;i++)P(g,G.bx(.055,.42,.04,.01),m.c('#3b3450'),[0,0,.08-i*.1]);eye(g,m,[.05,.04,.14],.025,[.6,.3,.6]);eye(g,m,[-.05,.04,.14],.025,[-.6,.3,.6])});
F('muenzgrundel',fishMeta('Brunnengrundel','kaufhaus','meer','S','immer',1,150,'Ich hab eine Brunnengrundel gefangen! Sie wohnt ganz unten am Grund.','Grundeln haben am Bauch eine Saugscheibe. Damit halten sie sich an Steinen fest, auch wenn das Wasser stark strömt.'),
  (g,m)=>fishT(g,m,{id:'muenzgrundel',H:.16,L:.55,back:'#a8a07a',belly:'#f2ecd8',tail:'round',dorsal:'std'}));

/* ================= Insekten ================= */
B('lampenmotte',bugMeta('Lampenmotte','kaufhaus','luft','nacht',1,170,'Ich hab eine Lampenmotte gefangen! Sie wollte unbedingt zur Leuchtreklame.','Motten orientieren sich nachts am Mond. Eine Lampe ist so nah, dass sie die Motten im Kreis herumführt.'),
  (g,m)=>butterfly(g,m,'lampenmotte','#e8dcc0','#c8b890','#8a7a60'));
B('glanzkaefer',bugMeta('Glanzkäfer','kaufhaus','boden','tag',2,420,'Ich hab einen Glanzkäfer gefangen! Er glänzt wie ein frisch geputztes Schaufenster.','Viele Käfer glänzen, weil ihr Panzer aus vielen dünnen Schichten besteht. Das Licht wird an jeder Schicht ein bisschen zurückgeworfen.'),
  (g,m)=>{P(g,G.s(.2),gl(m,'#2fb5d9'),[0,.17,0],null,[1,.7,1.25]);P(g,G.s(.1),m.c('#3b3450'),[0,.17,.22]);bugFace(g,m,[0,.18,.3],.07,.5);legs(g,m.c('#3b3450'),[[.1,.12,.1],[0,.12,0],[-.1,.12,-.1]],.2)});
B('palmenzikade',bugMeta('Palmen-Zikade','kaufhaus','baum','tag',3,880,'Ich hab eine Palmen-Zikade gefangen! Sie zirpt lauter als die Kaufhausmusik.','Zikaden machen ihr Geräusch mit einer Trommelhaut am Bauch. Manche sind so laut wie ein Rasenmäher.'),
  (g,m)=>{const bm=m.c('#5a8a4a',{gloss:.9});P(g,G.ca(.08,.26),bm,[0,.16,0],[PI/2,0,0]);P(g,G.s(.09),bm,[0,.17,.2]);bugFace(g,m,[0,.18,.27],.07,.5);for(const s of[-1,1])P(g,G.s(.18),m.c('#e8f6ff',{opacity:.5,gloss:1.4}),[s*.1,.24,-.02],null,[.6,.06,1.4]).userData.noOutline=true;legs(g,bm,[[.08,.12,.08],[0,.12,0],[-.08,.12,-.08]],.18)});

/* ================= Fundstücke ================= */
REL('kundenkarte_gold',relMeta('Goldene Kundenkarte','kaufhaus','schatz',3,2000,'Eine goldene Kundenkarte mit Magnetstreifen. Darauf steht: «Gültig bis 31.12.1999».','Auf dem Magnetstreifen einer Karte sind Zahlen gespeichert, ähnlich wie auf einer Musikkassette.'),
  (g,m)=>{P(g,G.bx(.56,.02,.36,.03),m.c('#ffd23f',{gloss:1.5,rim:1}),[0,.02,0]);P(g,G.bx(.56,.025,.07,0),m.c('#3b3450'),[0,.025,-.1]);P(g,G.bx(.1,.026,.08,.01),m.c('#e6ecf5',{gloss:1.4}),[-.16,.026,.06])});
REL('jahr2000_uhr',relMeta('Jahr-2000-Uhr','kaufhaus','kunst',2,900,'Eine kleine Countdown-Uhr. Sie zeigt für immer «00:00:01».','Viele Computer speicherten das Jahr nur mit zwei Ziffern. Man befürchtete, dass sie das Jahr 2000 mit 1900 verwechseln. Das nannte man das «Jahr-2000-Problem».'),
  (g,m)=>{P(g,G.bx(.5,.24,.16,.04),gl(m,'#9b6ae0'),[0,.12,0]);const t=ctex('kh-y2k',128,48,(x,w,h)=>{x.fillStyle='#10200a';x.fillRect(0,0,w,h);x.fillStyle='#ff4a5a';x.font='bold 30px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('00:00',w/2,h/2+2)});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(.4,.15),new THREE.MeshBasicMaterial({map:t}));s.position.set(0,.13,.085);g.add(s)});

/* ================= Tiere ================= */
Object.assign(FAUNA.S,{
  atriumtaube:{n:'Atrium-Taube',planet:ID,biomes:['atrium','parkdeck','dachgarten'],count:4,size:.6,speed:1,gait:'waddle',voice:['gurr','gurru','ruckedigu'],pitch:260,likes:['kassenbon','preisblume'],product:'kassenbon',names:['Gurri','Paloma','Dachi','Kurt','Taubi'],
    fact:'Tauben finden über hunderte Kilometer nach Hause. Sie nutzen dafür die Sonne, das Magnetfeld der Erde und sogar Gerüche.',a:{col:'#a8b0c8',belly:'#d8dce8',body:[.3,.28,.4],by:.3,head:{r:.18,p:[0,.62,.32]},snout:{type:'beak',col:'#3b3450',len:.4},ears:{type:'none'},legs:{n:2,len:.14,r:.04,foot:'#ff8a8a'},tail:{type:'fan',col:'#8890a8'},wings:{col:'#9098b0'},tuft:'#7fd3a0'}},
  rolltreppenkatze:{n:'Rolltreppen-Katze',planet:ID,biomes:['atrium','palmenpassage','brunnenufer'],count:3,size:.6,speed:1.2,gait:'fast',shy:true,voice:['miau','mrrp','mau'],pitch:540,likes:['brunnenkoi','skalar'],product:'knopfbatterie',names:['Rolli','Treppchen','Kasse','Bonnie','Mieze'],
    fact:'Katzen schlafen 12 bis 16 Stunden am Tag. Sie sparen so Energie für die Jagd.',a:{col:'#ffb08a',belly:'#fff2e0',body:[.28,.26,.42],head:{r:.24,p:[0,.5,.34]},snout:{type:'muzzle',col:'#fff2e0',nose:'#ff6fa5'},ears:{type:'pointy',len:.32},legs:{n:4,len:.14,r:.06,foot:'#fff2e0'},tail:{type:'long',col:'#ffb08a'},spots:{col:'#e88a5a',n:4},gait:'fast'}}});

/* ================= Kleidung ================= */
const CL=[];const def=(slot,id,n,price,col,b)=>CL.push({slot,id,n,price,col,b});
def('hat','schirmmuetze99','Verkäufer-Schirmmütze',380,'#ff6fa5',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.25,0]);P(q,G.hs(r*.82),M.c(col),[0,0,0]);P(q,G.cy(r*.5,r*.5,r*.05),M.c('#ffffff'),[0,0,r*.6],[PI/2-.15,0,0],[1,1,.55]);P(q,G.bx(r*.5,r*.18,r*.02,r*.02),M.c('#ffffff'),[0,r*.4,r*.76])});
def('top','windjacke99','Windjacke 1999',820,'#2fb5d9',(g,M,H,col)=>{const r=H.r;const y=H.neck??(H.top-r*2.05);const q=grp(g,[0,y,0]);P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col),[0,-r*.45,0]);P(q,G.cy(r*.85,r*.86,r*.25,Q(16),1,true),M.c('#9b6ae0'),[0,-r*.25,0]);P(q,G.cy(r*.86,r*.87,r*.15,Q(16),1,true),M.c('#ff6fa5'),[0,-r*.5,0])});

/* ================= Möbel ================= */
furn('minibrunnen',{n:'Atrium-Mini-Brunnen',cat:'deko',price:1900,planet:ID,size:[1,1],h:1.1,b:(g,m)=>{P(g,G.cy(.45,.5,.25,20),gl(m,'#d8f6ff'),[0,.12,0]);P(g,G.cy(.4,.4,.05,20),m.c('#45c8f0',{gloss:1.5}),[0,.24,0]);P(g,G.cy(.05,.06,.6,10),m.c('#e6ecf5',{gloss:1.4}),[0,.5,0]);P(g,G.cy(.2,.14,.08,16),gl(m,'#d8f6ff'),[0,.8,0]);P(g,G.s(.1),m.c('#bfefff',{opacity:.6,gloss:1.5}),[0,.9,0])}});
furn('rolltreppe_modell',{n:'Rolltreppen-Modell',cat:'spiel',price:1400,planet:ID,size:[2,1],h:1,b:(g,m)=>{for(let i=0;i<7;i++)P(g,G.bx(.22,.06,.5,.02),m.c('#c8ccd8',{gloss:1.2}),[-.7+i*.22,.1+i*.12,0]);for(const z of[-.28,.28])P(g,G.bx(1.7,.08,.04,.02),gl(m,'#ff6fa5'),[0,.55,z],[0,0,.5])}});

/* ================= Sprache: Strichcode-Schrift ================= */
function barcodeGlyph(x,s,r){x.save();const n=4+Math.floor(r()*4);let px=-s*.3;for(let i=0;i<n;i++){const w=s*(.02+r()*.06);x.fillRect(px,-s*.25,w,s*.5);px+=w+s*(.02+r()*.04)}x.restore()}

/* ================= Planet ================= */
PLANETKIT.add(ID,{
  def:{n:'Kaufhaus 1999',base:'kompost',R:120,R0:40,sea:-.3,music:'town',sky:['#9fd0ff','#ffe0f0'],fog:'#f0e8f8',water:'#45c8f0',deep:'#2a7ac8',step:1.05,shop:ID,
    desc:'Ein Planet wie ein riesiges Einkaufszentrum am letzten Abend von 1999: Atrium-Palmen, Springbrunnen und ein Parkdeck. Sechs Info-Säulen stellen Wissensfragen.',weather:'blueten',orbit:[201,5.6],size:1,col:['#a8e09a','#ff6fa5'],moons:1,
    park:'atrium',parkPond:true,phone:['#ffe0f0','#d8f6ff'],stones:['kiesel','parkchip','stein_klein'],plazaTree:'atriumpalme',path:'#e0d0f0',
    space:{deep:'#2a7ac8',water:'#45c8f0',shore:'#c8ecf8',land:'#a8e09a',land2:'#90d088',high:'#d8d8e0',cap:'#ffe0f0',atmo:'#ff9ad0',cloud:.4,sea:.36,capA:.4,freq:2.6},
    mac:{oc:-.12,m:.3,isl:1},climate:{hot:'parkdeck',wet:'brunnenufer',cold:'dachgarten'},peak:'dachgarten',
    raw(q,p,{N,N2,fbm}){let h=fbm(q,1.0,4)*1.9+.7;/* Stockwerke: das Gelände steigt in breiten Etagen an */const k=N2(q.x*.5,q.y*.5,q.z*.5);if(k>.05)h=h*.5+Math.round(h*.8)/.8*.5;return h},
    biome({T,M,h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'brunnenufer';if(h>sea+4.3)return'dachgarten';if(T>.3)return'parkdeck';if(M>.2)return'palmenpassage';return'atrium'},
    onLoad:W=>RALLYE.onLoad(W),tick:(dt,t,W,me)=>RALLYE.tick(dt,t,W,me)},
  places:[{id:'platz',n:'Atrium-Platz',lat:90,lon:0,r:.17,h:.9,build:'plaza'},{id:'haus',n:'Dein Haus',lat:58,lon:120,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Springbrunnen',lat:50,lon:250,r:.1,pond:true},{id:'see',n:'Wasserspiel-See',lat:-8,lon:80,r:.15,pond:true}],
  biomes:BI,
  names:{casino:'Kaufhaus-Spielecke',mode:'Mode-Etage',praxis:'Erste-Hilfe-Station',museum:'Museum der Dinge von 1999',shop:'Haushaltswaren',studio:'Fotostudio',bar:'Milchbar',rathaus:'Kundendienst',garage:'Parkhaus-Garage',pflanzen:'Gartencenter',tiere:'Zoohandlung'},
  sty:{wall:'putz',walls:['#fbf7f0','#f2f8ff','#fff1f6'],roof:'flat',roofs:MALL.slice(0,4),trim:'#e6ecf5',plinth:'#c8c4dc',door:'#2fb5d9',win:'rund',pitch:.9},
  wall:'streifen',floor:'fliesen',
  mayor:['Filialleiterin Kasse',{skin:'plastik',color:2,shape:'kapselspiel'},{kopf:'crtkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:['pager']}],
  lore:['Willkommen im Kaufhaus 1999! Heute ist der 31. Dezember, und die Rolltreppen fahren extra langsam, damit niemand hetzen muss.','Sechs Info-Säulen stehen auf dem Planeten. Sie wissen alles über das Jahr 1999 und stellen gern Fragen.','Hier muss niemand etwas kaufen. Viele kommen nur wegen der Springbrunnen und der Palmen.'],
  caveRock:['#fbf7f0','#d8f6ff','#ffe0ee',MALL.slice(0,3)],
  wear:['schirmmuetze99','windjacke99','kappe','brille'],clothes:CL,
  haus:{props:[['town','lantern',1,'d',0],['nature','pot_large',1.4,'d',0]],
    garden:{path:'path_stone',flowers:['flower_purpleA','flower_redA'],veg:null},
    plan:[{fam:'kokon',style:'kaufhaus'},{fam:'kokon',style:'schaufenster'},{fam:'kokon',style:'tuete'},{fam:'kokon',style:'schaufenster'}]},
  residents:{skins:['plastik','bonbon','glas','fell'],heads:['crtkopf','kapselkopf','mensch','katze','vogel','eikopf','frosch'],names:['Kasse','Bon','Rabatt','Etage','Lifti','Brunni','Palmi','Kundi','Tüte','Regal','Pager','Disco'],
    house:{shapes:['haus','rund'],walls:['putz'],wallCols:['#fbf7f0','#f2f8ff','#fff1f6'],roofCols:MALL.slice(0,4),win:['rund']},deco:['kugelbusch','gummibaum','preisblume'],fence:false},
  lang:{n:'Strichcode-Schrift',ink:'#3b3450',glow:'#ff6fa5',kind:'circuit',draw:barcodeGlyph,syl:['ka','uf','ho','me','lo','di','sko','pa','ra','ti','be','zu']},ruinStone:'#d8d4e8',
  terraform:['atrium','palmenpassage','brunnenufer','parkdeck'],
  weather:[['klar',4],['heiter',3],['regen',1],['nebel',1]]});

/* ================= Info-Säulen-Rallye ================= */
const QUIZ=[
  {q:'Was ist ein Strichcode auf einer Verpackung?',a:['Streifen, die ein Scanner als Zahl liest','Eine Verzierung, damit es schöner aussieht','Ein Zeichen, dass es im Angebot ist'],f:'Jeder Strichcode steht für eine Zahl. Die Kasse sucht damit im Computer den Namen und den Preis heraus.'},
  {q:'Wie viel Musik passt ungefähr auf eine Musik-CD?',a:['Etwa 74 bis 80 Minuten','Etwa 5 Minuten','Etwa 3 Tage'],f:'Eine CD fasst rund 74 bis 80 Minuten. Die Länge soll sich an einer langen Sinfonie von Beethoven orientiert haben.'},
  {q:'Was bedeutet das Zeichen @ in einer E-Mail-Adresse?',a:['«bei», also der Name bei einem Anbieter','«Achtung, wichtig!»','«antworten»'],f:'Das @ heisst auf Englisch «at», also «bei». Name@Anbieter heisst: diese Person beim Anbieter.'},
  {q:'Warum haben Rolltreppenstufen Rillen?',a:['Damit man nicht rutscht und die Stufen oben sauber einfahren','Damit sie lauter klappern','Weil Glätte zu teuer ist'],f:'Die Rillen greifen am Ende wie ein Kamm ineinander. So wird nichts eingeklemmt und man steht sicher.'},
  {q:'Wie viel passte auf eine 3,5-Zoll-Diskette?',a:['Etwa 1,44 Megabyte','Etwa 1000 Gigabyte','Gar nichts, sie war nur Deko'],f:'1,44 Megabyte reichen für ein paar Seiten Text oder ein kleines Bild. Ein heutiges Handyfoto passt oft nicht drauf.'},
  {q:'Was geschah mit dem Euro im Jahr 1999?',a:['Er wurde eingeführt, zuerst aber nur auf Konten','Es gab ihn sofort als Münzen im Portemonnaie','Er wurde abgeschafft'],f:'Ab 1999 gab es den Euro nur als Buchgeld. Scheine und Münzen kamen erst am 1. Januar 2002.'}];
const RALLYE=(()=>{let W_=null,posts=[];const COUNT=QUIZ.length,LOHN=80;
  const S=()=>SAVE.rallye=SAVE.rallye||{got:[]};const VOICE={pitch:300,speed:1.05,kind:'robot'};
  function postModel(m,i){const g=new THREE.Group();const col=MALL[i%5];P(g,G.cy(.5,.6,.2,20),m.c('#e6ecf5',{gloss:1.4}),[0,.1,0]);P(g,G.cy(.28,.32,2,16),gl(m,col),[0,1.15,0]);
    const sc=ctex('kh-info-'+i,128,128,(x,w,h)=>{x.fillStyle='#10200a';x.fillRect(0,0,w,h);x.fillStyle='#7fd34a';x.font='900 72px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('i',w/2,h/2+4);x.fillStyle='rgba(127,211,74,.15)';for(let k=0;k<h;k+=6)x.fillRect(0,k,w,2)});
    for(let k=0;k<3;k++){const a=k/3*TAU;const s=new THREE.Mesh(new THREE.PlaneGeometry(.36,.36),new THREE.MeshBasicMaterial({map:sc,toneMapped:false}));s.position.set(Math.sin(a)*.33,1.55,Math.cos(a)*.33);s.rotation.y=a;s.userData.noOutline=true;g.add(s)}
    const top=P(g,G.s(.26),gl(m,'#ffd23f'),[0,2.3,0]);const st=P(g,G.cy(.3,.3,.04,20),m.glow('#7fd34a',1.2),[0,2.18,0]);st.visible=false;st.userData.noOutline=true;addOutlines(g);g.userData.top=top;g.userData.stamp=st;return g}
  function onLoad(W){W_=W;posts=[];const m=makeMats({skin:'plastik',color:0});const st=S();const r=srand(1231);
    for(let i=0;i<COUNT;i++){let d=null;for(let t=0;t<400&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(cd.y>.93||!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(posts.some(x=>angle(x.d,cd)*W.R<24))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.2))continue;d=cd}
      if(!d)continue;const g=postModel(m,i);GAME.placeObj(g,d,r()*TAU,0,true);if(st.got.includes(i))g.userData.stamp.visible=true;
      W.inter.push({kind:'infosaeule',p:d,r:1.8,label:'Info-Säule fragen',act:()=>ask(i)});posts.push({i,d,g})}}
  async function ask(i){const st=S();const Q=QUIZ[i];const N='Info-Säule '+(i+1);
    if(st.got.includes(i)){await UI.talk(N,['Diese Frage hast du schon richtig beantwortet. Weisst du noch?',Q.f],{voice:VOICE,color:'#7fd34a'});return}
    /* Antworten mischen, damit man sich nicht die Position merkt */const ord=[0,1,2].sort(()=>Math.random()-.5);
    const c=await UI.talk(N,['Bip! Willkommen im Kaufhaus 1999. Ich habe eine Frage für deinen Kundenpass.',Q.q],{voice:VOICE,color:'#2fb5d9',choices:ord.map(k=>Q.a[k])});if(c<0)return;
    if(ord[c]===0){st.got.push(i);persist();const p=posts.find(x=>x.i===i);if(p)p.g.userData.stamp.visible=true;money(LOHN);SND.play('pickup',{rate:1.2});
      await UI.talk(N,['Richtig! Stempel Nummer '+st.got.length+' von '+COUNT+'. Plus '+LOHN+' Taler.',Q.f],{voice:VOICE,color:'#7fd34a'});
      if(typeof PIKO!=='undefined'&&st.got.length===1)PIKO.want('Ein Stempel im Kundenpass! Auf dem Planeten stehen noch fünf weitere Info-Säulen.');
      if(st.got.length===COUNT&&!st.done){st.done=true;persist();await UI.talk('Filialleiterin Kasse',['Alle sechs Stempel! Du weisst mehr über 1999 als unser ganzes Personal.','Hier ist die Goldene Kundenkarte. Und ein Mini-Brunnen für dein Zimmer, ganz ohne Kassenbon.']);bagAdd('relic','kundenkarte_gold');bagAdd('furn','minibrunnen');money(300);SND.jingle('j_success')}}
    else{SND.play('click');await UI.talk(N,['Hm, nicht ganz. Kein Problem!','Komm einfach wieder und versuch es noch einmal.'],{voice:VOICE,color:'#ff9a45'})}}
  function tick(dt,t){for(const p of posts){const tp=p.g.userData.top;tp.position.y=2.3+Math.sin(t*2+p.i)*.06;tp.rotation.y=t+p.i}}
  return{onLoad,tick,posts:()=>posts,COUNT,_ask:ask}
})();
window.RALLYE=RALLYE;
})();
