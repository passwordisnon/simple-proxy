/* =====================================================================
   CYBORG-LABOR · planets/monde.js · Fünf kleine Monde
   Jede Planeten-Gruppe hat einen Mond. Bernstein-Mond (Urzeit) und
   Uhrwerk-Mond (Uhrwerk) sind ganze Welten; die fünf hier sind kleine
   Spezialorte mit Aussenposten (Rakete, Laden, Bar) und je einer
   eigenen Aufgabe. Sie kreisen im Weltraum um ihren Hauptplaneten.
   · Keim-Mond (Heimat, um Kompost): Saatgut-Kapseln für den Samen-Tresor
   · Kassetten-Mond (Metro, um Metro-Stadt): Lieder für den Riesen-Rekorder
   · Glühwurm-Mond (Dschungel, um Dschungel): Leuchtstümpfe anzünden
   · Drachen-Mond (Himmel, um Wolkenarchipel): Drachen steigen lassen
   · Pixel-Mond (Bildschirm, um Schoner): Licht-Rätsel auf 3×3 Feldern
   ===================================================================== */
(function(){
const{N,F,B,REL,IT,itMeta,relMeta,fishMeta,bugMeta,RR,eye,legs,bugFace,butterfly,fishT}=NH;
const V=THREE.Vector3;
const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1,rimColor:'#ffffff'});

/* ---------- gemeinsame Hilfen ---------- */
/* Orte auf dem Mond verteilen: Land, Abstand zueinander und zum Dorf */
function spots(W,n,seed,minGap,o){o=o||{};const r=srand(seed);const out=[];const pl=GAME.G.places.find(p=>p.id==='platz');
  for(let i=0;i<n;i++){let d=null;for(let t=0;t<600&&!d;t++){const cd=new V(r()*2-1,r()*2-1,r()*2-1).normalize();if(!GAME.isLand(cd)||W.hAt(cd)<W.sea+.3)continue;if(pl&&angle(cd,pl.dir)*W.R<(o.fromPlaza??14))continue;if(out.some(x=>angle(x,cd)*W.R<minGap))continue;if(GAME.nearPlace&&GAME.nearPlace(cd,1.1))continue;d=cd}if(d)out.push(d)}return{pts:out,r}}
/* Sammelaufgabe: n Dinge finden, beim Ziel abgeben */
function hunt(o){let W_=null,items=[],goal=null;const S=()=>SAVE[o.key]=SAVE[o.key]||{got:[],given:0,done:false};
  function onLoad(W){W_=W;items=[];goal=null;const st=S();const m=makeMats({skin:'plastik',color:0});const{pts,r}=spots(W,o.n+1,o.seed,o.gap||12);if(!pts.length)return;
    const gd=pts[0];const gg=o.goal(m,st);GAME.placeObj(gg,gd,r()*TAU,0,true);goal={d:gd,g:gg};W.inter.push({kind:o.key+'-ziel',p:gd,r:2.4,label:o.goalLabel,act:give});o.paint&&o.paint(gg,st);
    pts.slice(1).forEach((d,i)=>{if(st.got.includes(i)){items.push({i,d,g:null});return}const g=o.item(m,i);GAME.placeObj(g,d,r()*TAU,0,true);const it={kind:o.key,p:d,r:1.6,label:o.itemLabel,act:()=>take(i)};W.inter.push(it);items.push({i,d,g,it})})}
  function take(i){const st=S();if(st.got.includes(i))return;const t=items.find(x=>x.i===i);if(!t)return;st.got.push(i);if(t.g&&t.g.parent)t.g.parent.remove(t.g);const k=W_.inter.indexOf(t.it);if(k>=0)W_.inter.splice(k,1);t.g=null;persist();SND.play('pickup',{rate:1.1});
    UI.toast(o.gotText(st.got.length,o.n),2800)}
  async function give(){const st=S();const carry=st.got.length-st.given;if(st.done){await UI.talk(o.host,[o.doneLine],{voice:o.voice});return}
    if(carry<=0){await UI.talk(o.host,[o.needLine(o.n-st.given)],{voice:o.voice});return}
    st.given+=carry;money(60*carry);persist();SND.play('powerup',{vol:.6});o.paint&&goal&&o.paint(goal.g,st);
    if(st.given<o.n){UI.toast(o.giveText(st.given,o.n),2800);o.onGive&&o.onGive(goal,st);return}
    st.done=true;persist();o.onGive&&o.onGive(goal,st);SND.jingle('j_success');await UI.talk(o.host,o.finish,{voice:o.voice});for(const[k,id]of o.reward)bagAdd(k,id);money(500)}
  function tick(dt,t,W,me){for(const k of items){if(!k.g)continue;k.g.rotation.y+=dt*.8;k.g.position.y+=Math.sin(t*2+k.i)*.002}o.tick&&goal&&o.tick(dt,t,goal,S())}
  return{onLoad,tick,state:S}}
/* kleiner Aussenposten-Standard für alle Monde */
const moonDef=(o)=>Object.assign({base:'kompost',R:58,R0:26,sea:-.6,music:'town',step:1,moon:true,weather:'blueten',size:.45,moons:0,park:null,phone:['#e8e8f8','#f0e0ff'],stones:['kiesel','stein_klein'],mac:{oc:-.2,m:.25,isl:1}},o);
const moonPlaces=(n,pond)=>[{id:'platz',n,lat:90,lon:0,r:.2,h:.9,build:'plaza'},{id:'see',n:pond,lat:-20,lon:140,r:.16,pond:true}];
const res=(skins,heads,names,cols)=>({skins,heads,names,house:{shapes:['haus','rund'],walls:['putz'],wallCols:cols,roofCols:cols,win:['rund']},deco:[],fence:false});
const fauna=(id,o)=>{FAUNA.S[id]=Object.assign({count:2,size:.55,speed:.8,gait:'waddle',pitch:420},o)};

/* =====================================================================
   1 · KEIM-MOND (Heimat)
   ===================================================================== */
{const ID='keim';
N('keimling',{r:.2,h:.6,size:'small',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,.25,.5);P(g,G.cy(.02,.03,h,6),m.c('#7fbf4a'),[0,h/2,0]);for(const s of[-1,1])P(g,G.s(.1),m.c('#9ee08a',{gloss:.6}),[s*.08,h,0],[0,0,s*.6],[1.4,.3,.8]);P(g,G.s(.07),m.c('#a8763a'),[0,.03,0],null,[1.2,.5,1])});
N('samenturm',{r:.5,h:2.6,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,1.8,2.6);P(g,G.cy(.12,.18,h,8),m.c('#8a6a3a'),[0,h/2,0]);for(let i=0;i<5;i++){const a=i*1.3,y=h*.4+i*h*.12;P(g,G.s(.22),m.c(['#ffd27a','#c8e07a','#f2b8a0'][i%3],{gloss:.8}),[Math.cos(a)*.25,y,Math.sin(a)*.25],null,[1,1.3,1])}P(g,G.s(.3),m.c('#9ee08a',{gloss:.6}),[0,h+.1,0],null,[1,.6,1])});
N('wurmhuegel',{r:.4,h:.4,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.s(.35),m.c('#6a4a2a'),[0,0,0],null,[1,.5,1]);P(g,G.tu([[-.1,.12,0],[0,.22,.05],[.1,.14,0]],.035,.03,8),m.c('#e89aa0',{gloss:.6}))});
const BI={keimwiese:{n:'Keimwiese',g:['#8ac860','#80c058'],cliff:'#6a5a3a',pat:'gras',grass:'#8ac860',grassD:.9,trees:[['samenturm',1.4]],treeD:.6,deco:[['keimling',6],['wurmhuegel',1]],decoD:6,rocks:[],rockD:0,litter:[['samenkapsel_klein',.6]]},
  humusfeld:{n:'Humusfeld',g:['#6a4a2a','#5e4226'],cliff:'#4a3420',pat:'staub',grass:null,grassD:0,trees:[['samenturm',.4]],treeD:.2,deco:[['wurmhuegel',3],['keimling',2]],decoD:4,rocks:[],rockD:0,litter:[]},
  keimufer:{n:'Keim-Ufer',g:['#a8c870','#a0c068'],cliff:'#6a5a3a',pat:'sand',grass:'#a8c870',grassD:.4,trees:[],treeD:0,deco:[['keimling',3]],decoD:3,rocks:[],rockD:0,litter:[]}};
IT('samenkapsel_klein',itMeta('Kleine Samenkapsel','keim','material',30),(g,m)=>{P(g,G.s(.08),m.c('#ffd27a',{gloss:.8}),[0,.08,0],null,[1,1.3,1])});
F('keimgrundel',fishMeta('Keim-Grundel','keim','teich','S','immer',1,240,'Ich hab eine Keim-Grundel gefangen! Auf ihrem Rücken spriesst ein winziges Blatt.','Viele Samen können lange im Wasser treiben und keimen erst, wenn sie an Land gespült werden. So reisen Kokospalmen über ganze Meere.'),
  (g,m)=>{fishT(g,m,{id:'keimgrundel',H:.16,L:.42,back:'#7a9a5a',belly:'#e8f0d0',tail:'fan',dorsal:'std'});P(g,G.s(.05),m.c('#9ee08a'),[0,.12,0],null,[1.4,.3,.8])});
B('saatkaefer',bugMeta('Saat-Käfer','keim','boden','tag',2,380,'Ich hab einen Saat-Käfer gefangen! Er trägt ein Samenkorn wie einen Rucksack.','Manche Ameisen und Käfer tragen Samen in ihren Bau und pflanzen damit ganz nebenbei neue Pflanzen. Das nennt man Myrmekochorie.'),
  (g,m)=>{P(g,G.s(.11),gl(m,'#5a8a3a'),[0,.1,0],null,[1,.7,1.3]);P(g,G.s(.07),m.c('#ffd27a'),[0,.2,-.02]);bugFace(g,m,[0,.1,.14],.04,.5);legs(g,m.c('#3b3450'),[[.07,.07,.05],[0,.07,0],[-.07,.07,-.05]],.12)});
REL('erste_samenkapsel',relMeta('Die erste Samenkapsel','keim','natur',2,1200,'Eine Kapsel mit der Aufschrift «Kokon-Saatgut Nr. 1 · für später». Sie ist noch warm.','In echten Saatgut-Tresoren lagern Millionen Samen bei minus 18 Grad. Sie sollen die Vielfalt der Pflanzen für die Zukunft bewahren.'),
  (g,m)=>{P(g,G.ca(.1,.18),m.c('#ffd27a',{gloss:1}),[0,.2,0]);P(g,G.to(.1,.02),m.steel(),[0,.2,0],[PI/2,0,0])});
fauna('keimwurm',{n:'Keimwurm',planet:ID,biomes:['humusfeld','keimwiese'],count:3,size:.5,speed:.4,gait:'waddle',voice:['mmf','plopp'],pitch:520,likes:['samenkapsel_klein','keimling'],product:'samenkapsel_klein',names:['Humi','Krümel','Wurmine','Erdi'],
  fact:'Regenwürmer machen aus Laub und Erde fruchtbaren Humus. Auf einem Hektar Wiese können über eine Million Würmer leben.',a:{col:'#e89aa0',belly:'#f8c8c8',body:[.22,.2,.6],head:{r:.2,p:[0,.25,.38]},snout:{type:'none'},ears:{type:'none'},legs:{n:0},tail:{type:'none'},gait:'waddle'}});
furn('saatgut_regal',{n:'Saatgut-Regal',cat:'pflanze',price:2600,planet:ID,size:[2,1],h:1.6,b:(g,m)=>{P(g,G.bx(1.6,1.5,.4,.05),m.c('#c8a878'),[0,.75,0]);for(let r=0;r<3;r++)for(let i=0;i<5;i++)P(g,G.ca(.06,.1),m.c(['#ffd27a','#c8e07a','#f2b8a0','#b8d8f0'][(r+i)%4],{gloss:.9}),[-.6+i*.3,.35+r*.45,.15])}});
const KEIM=hunt({key:'keimmond',n:6,seed:5151,host:'Tresorwärterin Saatine',voice:{pitch:300,kind:'sanft'},itemLabel:'Samenkapsel aufheben',goalLabel:'Samen-Tresor',
  item:(m,i)=>{const g=new THREE.Group();P(g,G.ca(.18,.3),gl(m,['#ffd27a','#c8e07a','#f2b8a0','#b8d8f0','#ffb0d0','#d8c0ff'][i%6]),[0,.45,0]);P(g,G.to(.2,.03),m.steel(),[0,.45,0],[PI/2,0,0]);P(g,G.to(.4,.03),m.glow('#fff0a0',1.2),[0,.02,0],[PI/2,0,0]);addOutlines(g);return g},
  goal:(m)=>{const g=new THREE.Group();P(g,G.bx(4,2.6,3,.3),m.c('#d8d0c0'),[0,1.3,0]);P(g,G.bx(4.2,.3,3.2,.1),m.c('#8a9a7a'),[0,2.7,0]);P(g,G.cy(.9,.9,.3,24),m.steel(),[0,1.3,1.55],[PI/2,0,0]);P(g,G.to(.9,.08),m.c('#ffd27a'),[0,1.3,1.7]);
    const lights=[];for(let i=0;i<6;i++)lights.push(P(g,G.s(.13),m.c('#555560'),[-1.5+i*.6,2.3,1.52]));g.userData.lights=lights;for(let i=0;i<4;i++)P(g,G.s(.3),m.c('#9ee08a',{gloss:.6}),[-1.8+i*1.2,2.95,0],null,[1,.6,1]);addOutlines(g);return g},
  paint:(g,st)=>{(g.userData.lights||[]).forEach((l,i)=>{if(i<st.given)l.material=makeMats({skin:'plastik',color:0}).glow('#9ee08a',1.8)})},
  gotText:(n,N)=>'Samenkapsel gefunden! ('+n+' von '+N+')',giveText:(n,N)=>'Im Tresor: '+n+' von '+N+' Samenkapseln.',
  needLine:n=>'Im Samen-Tresor fehlen noch '+n+' Kapseln. Sie liegen überall auf dem Mond verstreut.',doneLine:'Der Tresor ist voll. Hier schläft die Zukunft – gut gekühlt.',
  finish:['Alle sechs Samenkapseln sind im Tresor! Damit kann jeder Planet neu anfangen, falls einmal etwas schiefgeht.','Nimm das Saatgut-Regal mit. Und die allererste Kapsel für dein Museum.'],reward:[['furn','saatgut_regal'],['relic','erste_samenkapsel']]});
PLANETKIT.add(ID,{def:moonDef({n:'Keim-Mond',moonOf:'kompost',sky:['#bfe6a8','#f2ffe0'],fog:'#d8f0c0',water:'#6aa0b0',deep:'#3a6a7a',shop:ID,desc:'Ein kleiner grüner Mond um den Kompost-Planeten. Im Samen-Tresor wird Saatgut für alle Planeten aufbewahrt.',orbit:[40,1],col:['#8ac860','#ffd27a'],plazaTree:'samenturm',path:'#c8a878',
    space:{deep:'#3a6a7a',water:'#6aa0b0',shore:'#a8c870',land:'#8ac860',land2:'#6a4a2a',high:'#a0c068',cap:'#f2ffe0',atmo:'#bfe6a8',cloud:.3,sea:.3,capA:.2,freq:3},climate:{hot:'humusfeld',wet:'keimufer',cold:'keimwiese'},peak:'keimwiese',
    raw(q,p,{fbm}){return fbm(q,1.3,3)*1.6+.8},biome({h,sea,low,nearPond,M}){if(nearPond||(low&&h<sea+.6))return'keimufer';if(M<-.1)return'humusfeld';return'keimwiese'},onLoad:W=>KEIM.onLoad(W),tick:(dt,t,W,me)=>KEIM.tick(dt,t,W,me)}),
  places:moonPlaces('Tresor-Platz','Keimteich'),biomes:BI,names:{shop:'Saatgut-Laden',bar:'Keimling-Bar'},
  sty:{wall:'putz',walls:['#f2f0e0','#e8f0d8'],roof:'dome',roofs:['#8ac860','#ffd27a'],trim:'#c8a878',plinth:'#6a4a2a',door:'#8ac860',win:'rund',pitch:.9},wall:'streifen',floor:'dielen',
  residents:res(['pluesch','bonbon'],['eikopf','vogel','mensch'],['Saatine','Keimi','Krume','Spross','Humi'],['#f2f0e0','#e8f0d8','#8ac860']),
  haus:{plan:[{fam:'kokon',style:'mondhaus'},{fam:'kokon',style:'wabenhaus'}]},lang:{n:'Keimschrift',ink:'#6a4a2a',glow:'#9ee08a',kind:'rune',syl:['ke','im','sa','at','gr','ün','hu','mus']},terraform:['keimwiese','humusfeld'],weather:[['klar',3],['regen',2]]});}

/* =====================================================================
   2 · KASSETTEN-MOND (Metro)
   ===================================================================== */
{const ID='kassette';const TAPE=['#ff6fd8','#ffd23f','#45e0ff','#7fd34a','#ff9a45','#b89aff'];
N('bandbaum',{r:.4,h:3,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2,3);P(g,G.cy(.1,.14,h,8),m.c('#3b3450'),[0,h/2,0]);for(let i=0;i<3;i++){const y=h*.55+i*.35;P(g,G.to(.35-i*.06,.06),m.c(TAPE[Math.floor(rnd()*6)],{gloss:1}),[0,y,0],[PI/2+rnd()*.3,0,rnd()])}P(g,G.cy(.5,.5,.12,20),m.c('#2a2a30'),[0,h+.06,0])});
N('bandsalat',{r:.35,h:.6,size:'small',planet:ID},(g,m,o,rnd)=>{const c=m.c('#5a3a2a',{gloss:1.2});for(let i=0;i<4;i++){const pts=[];for(let k=0;k<6;k++)pts.push([(rnd()-.5)*.6,.1+rnd()*.4,(rnd()-.5)*.6]);P(g,G.tu(pts,.012,.012,24),c)}});
N('spulenfels',{r:.6,h:.8,size:'big',planet:ID},(g,m,o,rnd)=>{P(g,G.cy(.55,.55,.3,20),m.c('#2a2a30',{gloss:.8}),[0,.15,0]);P(g,G.cy(.2,.2,.32,6),m.c('#fffdf7'),[0,.16,0])});
const BI={bandwiese:{n:'Bandwiese',g:['#b8a0d8','#b098d0'],cliff:'#5a4a7a',pat:'gras',grass:'#b8a0d8',grassD:.8,trees:[['bandbaum',1.4]],treeD:.6,deco:[['bandsalat',4]],decoD:4,rocks:[['spulenfels',.6]],rockD:.4,litter:[]},
  spulenfeld:{n:'Spulenfeld',g:['#5a4a7a','#544472'],cliff:'#3a2a5a',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,deco:[['bandsalat',2]],decoD:2,rocks:[['spulenfels',1.4]],rockD:1,litter:[]},
  bandufer:{n:'Band-Ufer',g:['#d0b8e8','#c8b0e0'],cliff:'#5a4a7a',pat:'sand',grass:'#d0b8e8',grassD:.4,trees:[],treeD:0,deco:[['bandsalat',1]],decoD:1,rocks:[],rockD:0,litter:[]}};
F('bandaal',fishMeta('Band-Aal','kassette','teich','M','nacht',2,520,'Ich hab einen Band-Aal gefangen! Er ist braun und glänzend wie ein Tonband.','Auf Tonbändern wird Musik als Magnetmuster gespeichert. Ein Kopf im Rekorder liest das Muster wieder als Ton.'),
  (g,m)=>{P(g,G.tu([[0,0,.4],[.08,0,.15],[-.08,0,-.1],[0,0,-.4]],.04,.03,24),m.c('#5a3a2a',{gloss:1.3}));eye(g,m,[.03,.03,.38],.02,[.6,.3,.6]);eye(g,m,[-.03,.03,.38],.02,[-.6,.3,.6])});
B('spulenkaefer',bugMeta('Spulen-Käfer','kassette','boden','immer',2,420,'Ich hab einen Spulen-Käfer gefangen! Er hat zwei Räder auf dem Rücken, die sich beim Laufen drehen.','Eine Musik-Kassette hat zwei Spulen. Beim Abspielen wickelt sich das Band von einer auf die andere.'),
  (g,m)=>{P(g,G.bx(.24,.08,.16,.03),gl(m,'#2a2a30'),[0,.1,0]);for(const x of[-.06,.06])P(g,G.cy(.04,.04,.09,10),m.c('#fffdf7'),[x,.14,0]);bugFace(g,m,[0,.1,.1],.04,.5);legs(g,m.c('#3b3450'),[[.07,.06,.04],[0,.06,0],[-.07,.06,-.04]],.12)});
REL('erstes_mixtape',relMeta('Das erste Mixtape','kassette','kunst',2,1300,'Eine Kassette mit Handschrift: «Für alle, die noch wach sind. Seite A: 23:59. Seite B: 00:00.»','Mixtapes waren selbst zusammengestellte Musik-Kassetten. Man nahm Lieder aus dem Radio auf und verschenkte sie an Freund:innen.'),
  (g,m)=>{P(g,G.bx(.4,.03,.26,.01),m.c('#ffd23f'),[0,.015,0]);for(const x of[-.09,.09])P(g,G.cy(.04,.04,.035,10),m.c('#fffdf7'),[x,.02,0])});
fauna('bandfuchs',{n:'Band-Fuchs',planet:ID,biomes:['bandwiese','spulenfeld'],count:2,size:.6,speed:1.1,gait:'fast',voice:['wiff','kjäk'],pitch:460,likes:['bandaal','spulenkaefer'],product:'bandsalat',names:['Rewind','Play','Pause','Seite B'],
  fact:'Füchse hören tiefe Töne unter dem Schnee und springen dann punktgenau darauf. Ihre Ohren sind kleine Richtmikrofone.',a:{col:'#ff9a45',belly:'#fff6e0',body:[.28,.26,.46],head:{r:.22,p:[0,.5,.34]},snout:{type:'muzzle',col:'#fff6e0',nose:'#3b3450'},ears:{type:'pointy',len:.34},legs:{n:4,len:.16,r:.05,foot:'#3b3450'},tail:{type:'bushy',col:'#ff9a45'},gait:'fast'}});
furn('riesenrekorder_mini',{n:'Kassetten-Rekorder',cat:'technik',price:2400,planet:ID,size:[1,1],h:.7,b:(g,m)=>{P(g,G.bx(.9,.5,.3,.05),m.c('#c8ccd8'),[0,.3,0]);for(const x of[-.25,.25])P(g,G.cy(.13,.13,.04,16),m.c('#3b3450'),[x,.32,.16],[PI/2,0,0]);P(g,G.bx(.3,.15,.04,.02),m.glass('#ffd0a0'),[0,.32,.16]);g.userData.tick=t=>{}}});
const NOTES=[[0,2,4,7],[7,4,2,0],[0,4,7,12],[5,4,2,0],[2,4,5,7],[12,7,4,0]];
const KASS=hunt({key:'kassettenmond',n:6,seed:6262,host:'DJ Wickel',voice:{pitch:340,kind:'quirlig'},itemLabel:'Kassette aufheben',goalLabel:'Riesen-Rekorder',
  item:(m,i)=>{const g=new THREE.Group();P(g,G.bx(.7,.06,.45,.02),gl(m,TAPE[i]),[0,.4,0],[-.5,0,0]);for(const x of[-.16,.16])P(g,G.cy(.07,.07,.07,10),m.c('#fffdf7'),[x,.42,.03],[-.5,0,0]);P(g,G.to(.4,.03),m.glow('#ffffff',1),[0,.02,0],[PI/2,0,0]);addOutlines(g);return g},
  goal:(m)=>{const g=new THREE.Group();P(g,G.bx(5,2.4,1.6,.3),m.c('#c8ccd8',{gloss:.9}),[0,1.4,0]);const sp=[];for(const x of[-1.5,1.5]){const s=P(g,G.cy(.65,.65,.1,24),m.c('#3b3450'),[x,1.5,.82],[PI/2,0,0]);P(g,G.cy(.35,.35,.12,24),m.c('#5a5a68'),[x,1.5,.84],[PI/2,0,0]);sp.push(s)}
    P(g,G.bx(1.6,.7,.1,.04),m.glass('#ffd0a0'),[0,1.5,.82]);for(let i=0;i<6;i++)P(g,G.bx(.5,.25,.3,.04),m.c('#2a2a30'),[-1.6+i*.64,.35,.6]);const lamps=[];for(let i=0;i<6;i++)lamps.push(P(g,G.s(.08),m.c('#555560'),[-1.6+i*.64,2.7,.5]));g.userData={sp,lamps};addOutlines(g);return g},
  paint:(g,st)=>{(g.userData.lamps||[]).forEach((l,i)=>{if(i<st.given)l.material=makeMats({skin:'plastik',color:0}).glow(TAPE[i],1.8)})},
  onGive:(goal,st)=>{const seq=NOTES[(st.given-1)%6];seq.forEach((n,k)=>setTimeout(()=>SND.play('pep',{rate:Math.pow(2,n/12),vol:.6}),k*220))},
  tick:(dt,t,goal,st)=>{for(const s of goal.g.userData.sp||[])s.rotation.y+=dt*(st.given?1.5:.1)},
  gotText:(n,N)=>'Kassette gefunden! ('+n+' von '+N+')',giveText:(n,N)=>'Der Rekorder spielt jetzt '+n+' von '+N+' Liedern.',
  needLine:n=>'Mir fehlen noch '+n+' Kassetten. Der Wind hat sie über den ganzen Mond geweht.',doneLine:'Hörst du? Alle sechs Lieder laufen im Kreis. Seite A, Seite B, und wieder von vorn.',
  finish:['Alle sechs Kassetten! Der Riesen-Rekorder spielt endlich das ganze Mixtape.','Hier, ein kleiner Rekorder für dein Zimmer. Und das allererste Mixtape fürs Museum.'],reward:[['furn','riesenrekorder_mini'],['relic','erstes_mixtape']]});
PLANETKIT.add(ID,{def:moonDef({n:'Kassetten-Mond',moonOf:'metro',sky:['#c8a8f0','#ffd8f0'],fog:'#e0c8f0',water:'#7a6ab0',deep:'#3a2a6a',shop:ID,desc:'Ein lila Mond um die Metro-Stadt. Bandbäume, Spulenfelsen und ein Riesen-Rekorder, dem sechs Kassetten fehlen.',orbit:[60,2],col:['#b8a0d8','#ffd23f'],plazaTree:'bandbaum',path:'#d0b8e8',
    space:{deep:'#3a2a6a',water:'#7a6ab0',shore:'#d0b8e8',land:'#b8a0d8',land2:'#5a4a7a',high:'#c8b0e0',cap:'#ffd8f0',atmo:'#c8a8f0',cloud:.2,sea:.3,capA:.2,freq:3},climate:{hot:'spulenfeld',wet:'bandufer',cold:'bandwiese'},peak:'spulenfeld',
    raw(q,p,{fbm}){return fbm(q,1.2,3)*1.8+.8},biome({h,sea,low,nearPond,T}){if(nearPond||(low&&h<sea+.6))return'bandufer';if(T>.25)return'spulenfeld';return'bandwiese'},onLoad:W=>KASS.onLoad(W),tick:(dt,t,W,me)=>KASS.tick(dt,t,W,me)}),
  places:moonPlaces('Rekorder-Platz','Bandteich'),biomes:BI,names:{shop:'Kassetten-Laden',bar:'Mixtape-Bar'},
  sty:{wall:'putz',walls:['#f0e8ff','#e8e0f8'],roof:'dome',roofs:TAPE.slice(0,4),trim:'#c8ccd8',plinth:'#3b3450',door:'#ff6fd8',win:'rund',pitch:.9},wall:'streifen',floor:'fliesen',
  residents:res(['plastik','bonbon'],['crtkopf','lautsprecher','mensch'],['Wickel','Spule','Rewind','Mixi','Seite A'],['#f0e8ff','#e8e0f8','#ff6fd8']),
  haus:{plan:[{fam:'kokon',style:'transistor'},{fam:'kokon',style:'mondhaus'}]},lang:{n:'Bandschrift',ink:'#5a3a2a',glow:'#ffd23f',kind:'circuit',syl:['ka','ss','et','te','ba','nd','sp','ul']},terraform:['bandwiese','spulenfeld'],weather:[['klar',3],['nebel',1]]});}

/* =====================================================================
   3 · GLÜHWURM-MOND (Dschungel) · immer Dämmerung
   ===================================================================== */
{const ID='gluehwurm';
N('leuchtfarn',{r:.35,h:1,size:'small',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<5;i++){const a=i/5*TAU+rnd();P(g,G.s(.32),m.c('#2a6a4a',{gloss:.4}),[Math.cos(a)*.15,.35,Math.sin(a)*.15],[Math.cos(a)*.6,0,Math.sin(a)*.6],[.25,1,.08])}P(g,G.s(.06),m.glow('#d8ff7a',1.6),[0,.7,0])});
N('glimmbaum',{r:.5,h:3,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3.2);P(g,G.cy(.14,.2,h,8),m.c('#3a2a2a'),[0,h/2,0]);P(g,G.s(.9),m.c('#1e4a3a',{gloss:.4}),[0,h+.3,0],null,[1.2,.8,1.2]);for(let i=0;i<7;i++)P(g,G.s(.05),m.glow('#d8ff7a',1.8),[(rnd()-.5)*1.6,h+(rnd()-.2)*.8,(rnd()-.5)*1.6])});
N('moosbuckel',{r:.5,h:.4,size:'small',planet:ID},(g,m,o,rnd)=>{P(g,G.s(.45),m.c('#2a5a3a',{gloss:.3}),[0,0,0],null,[1,.45,1])});
const BI={glimmwald:{n:'Glimmwald',g:['#1e3a3a','#1a3434'],cliff:'#14242a',pat:'moos',grass:'#1e4a3a',grassD:.8,trees:[['glimmbaum',2]],treeD:1,deco:[['leuchtfarn',5],['moosbuckel',2]],decoD:5,rocks:[],rockD:0,litter:[]},
  farnsenke:{n:'Farnsenke',g:['#24443a','#203e36'],cliff:'#14242a',pat:'moos',grass:'#24443a',grassD:.9,trees:[['glimmbaum',.4]],treeD:.2,deco:[['leuchtfarn',8]],decoD:7,rocks:[],rockD:0,litter:[]},
  dunkelufer:{n:'Dunkel-Ufer',g:['#2a3a4a','#263644'],cliff:'#14242a',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,deco:[['moosbuckel',2]],decoD:2,rocks:[],rockD:0,litter:[]}};
F('lichtsalmler',fishMeta('Licht-Salmler','gluehwurm','teich','S','nacht',2,460,'Ich hab einen Licht-Salmler gefangen! Er blinkt im Takt der Glühwürmchen.','Einige Fische leuchten mit Hilfe von Bakterien in kleinen Taschen unter den Augen. Sie können das Licht sogar ein- und ausschalten.'),
  (g,m)=>{fishT(g,m,{id:'lichtsalmler',H:.15,L:.38,back:'#2a4a6a',belly:'#c8e8ff',tail:'fork',dorsal:'std'});P(g,G.s(.035),m.glow('#d8ff7a',2),[.05,.03,.12])});
B('blinkkaefer',bugMeta('Blink-Käfer','gluehwurm','luft','nacht',2,520,'Ich hab einen Blink-Käfer gefangen! Er blinkt zweimal kurz, einmal lang.','Glühwürmchen blinken in Mustern. Jede Art hat ihren eigenen Rhythmus – wie ein Morsecode für Verliebte.'),
  (g,m)=>{P(g,G.s(.08),m.c('#3b3450'),[0,.12,0],null,[1,.8,1.4]);P(g,G.s(.07),m.glow('#d8ff7a',2),[0,.1,-.1]);bugFace(g,m,[0,.13,.1],.035,.5);legs(g,m.c('#3b3450'),[[.05,.08,.04],[0,.08,0],[-.05,.08,-.04]],.1)});
REL('erstes_nachtlicht',relMeta('Das erste Nachtlicht','gluehwurm','natur',2,1100,'Ein Glas mit einem schlafenden Glühwürmchen-Licht. Es leuchtet nur, wenn jemand Angst im Dunkeln hat.','Das Licht von Glühwürmchen ist «kalt»: Fast die ganze Energie wird zu Licht, kaum etwas zu Wärme.'),
  (g,m)=>{P(g,G.cy(.12,.12,.26,16),m.glass('#e8ffc0'),[0,.13,0]);P(g,G.s(.05),m.glow('#d8ff7a',2),[0,.13,0]);P(g,G.cy(.13,.13,.04,16),m.c('#8a5a34'),[0,.28,0])});
fauna('glimmfrosch',{n:'Glimm-Frosch',planet:ID,biomes:['glimmwald','farnsenke'],count:3,size:.45,speed:.9,gait:'hop',voice:['quak','glimm'],pitch:500,likes:['blinkkaefer','lichtsalmler'],product:'leuchtfarn',names:['Funzel','Glimmi','Lucy','Nachtlicht'],
  fact:'Manche Frösche leuchten unter UV-Licht grün oder blau. Forschende haben das erst 2017 entdeckt.',a:{col:'#3a8a5a',belly:'#d8ff7a',body:[.26,.2,.3],head:{r:.2,p:[0,.3,.22]},snout:{type:'none'},ears:{type:'none'},legs:{n:4,len:.1,r:.05,foot:'#d8ff7a'},tail:{type:'none'},gait:'hop'}});
furn('leuchtstumpf_lampe',{n:'Leuchtstumpf-Lampe',cat:'licht',price:2000,planet:ID,size:[1,1],h:.8,b:(g,m)=>{P(g,G.cy(.3,.36,.5,10),m.c('#5a3a2a'),[0,.25,0]);for(let i=0;i<6;i++)P(g,G.s(.05),m.glow('#d8ff7a',2),[Math.cos(i)*.15,.55+Math.sin(i*2)*.1,Math.sin(i)*.15]);g.userData.light={p:[0,.6,0],c:'#d8ff7a',i:.7}}});
const GLW=(()=>{let W_=null,swarms=[],stumps=[],M_=null;const S=()=>SAVE.gluehwurm=SAVE.gluehwurm||{glow:0,lit:[],done:false};
  function swarmModel(m){const g=new THREE.Group();const dots=[];for(let i=0;i<12;i++)dots.push(P(g,G.s(.06),m.glow('#d8ff7a',2.2),[0,1,0]));g.userData.dots=dots;return g}
  function stumpModel(m,on){const g=new THREE.Group();P(g,G.cy(.5,.65,.9,10),m.c('#4a3a2a'),[0,.45,0]);const cap=P(g,G.s(.5),on?m.glow('#d8ff7a',1.6):m.c('#2a2a2a',{gloss:.5}),[0,1,0],null,[1,.5,1]);g.userData.cap=cap;addOutlines(g);return g}
  function onLoad(W){W_=W;swarms=[];stumps=[];M_=makeMats({skin:'haut',color:0});const st=S();const{pts,r}=spots(W,10,7373,10);
    pts.slice(0,5).forEach((d,i)=>{const g=swarmModel(M_);GAME.placeObj(g,d,0,0,true);swarms.push({d,g,i,cool:0});W.inter.push({kind:'gluehwurm',p:d,r:2.2,label:'Glühwürmchen-Schwarm locken',act:()=>lure(i)})});
    pts.slice(5).forEach((d,i)=>{const on=st.lit.includes(i);const g=stumpModel(M_,on);GAME.placeObj(g,d,r()*TAU,0,true);stumps.push({d,g,i});W.inter.push({kind:'leuchtstumpf',p:d,r:2,label:on?'Leuchtstumpf (brennt)':'Leuchtstumpf anzünden',act:()=>light(i)})})}
  function lure(i){const st=S();const s=swarms[i];if(s.cool>0){UI.toast('Der Schwarm ruht sich kurz aus.');return}s.cool=40;st.glow=Math.min(5,st.glow+2);persist();SND.play('pickup',{rate:1.3});UI.toast('Glühwürmchen folgen dir! Leuchtkraft: '+st.glow+' von 5.',2600)}
  async function light(i){const st=S();if(st.lit.includes(i)){UI.toast('Dieser Stumpf leuchtet schon.');return}if(st.glow<1){SND.play('error');UI.toast('Du brauchst Glühwürmchen. Locke zuerst einen Schwarm an.');return}
    st.glow--;st.lit.push(i);persist();const t=stumps[i];t.g.userData.cap.material=M_.glow('#d8ff7a',1.6);SND.play('powerup',{vol:.6});money(60);
    if(st.lit.length<5){UI.toast('Leuchtstumpf brennt! '+st.lit.length+' von 5.',2600);return}
    if(!st.done){st.done=true;persist();SND.jingle('j_success');await UI.talk('Lichtwärterin Funzel',['Alle fünf Leuchtstümpfe brennen! Jetzt finden die Glühwürmchen nachts den Weg nach Hause.','Nimm diese Leuchtstumpf-Lampe mit. Und das erste Nachtlicht für dein Museum.'],{voice:{pitch:380,kind:'sanft'}});bagAdd('furn','leuchtstumpf_lampe');bagAdd('relic','erstes_nachtlicht');money(500)}}
  function tick(dt,t,W,me){const st=S();for(const s of swarms){s.cool=Math.max(0,s.cool-dt);s.g.userData.dots.forEach((d,k)=>{const a=t*.8+k*.52;d.position.set(Math.cos(a*1.3)*(.5+k%3*.25),1+Math.sin(a*.9+k)*.5,Math.sin(a)*(.5+k%4*.2));d.visible=Math.sin(t*5+k*1.7)>-.3})}
    if(me&&me.g&&st.glow>0){if(!me.g.userData.glw){const g=new THREE.Group();for(let i=0;i<5;i++)P(g,G.s(.05),M_.glow('#d8ff7a',2.2),[0,0,0]);me.g.add(g);me.g.userData.glw=g}const g=me.g.userData.glw;g.children.forEach((d,k)=>{d.visible=k<st.glow;const a=t*2+k*1.26;d.position.set(Math.cos(a)*.6,1.6+Math.sin(a*1.4)*.2,Math.sin(a)*.6)})}
    else if(me&&me.g&&me.g.userData.glw){me.g.remove(me.g.userData.glw);me.g.userData.glw=null}}
  return{onLoad,tick,state:S}})();
PLANETKIT.add(ID,{def:moonDef({n:'Glühwurm-Mond',moonOf:'dschungel',sky:['#1a2a4a','#3a2a5a'],fog:'#1a2a3a',water:'#1a3a4a',deep:'#0a1a2a',shop:ID,night:true,desc:'Ein Mond in ewiger Dämmerung um den Dschungel-Planeten. Locke Glühwürmchen an und zünde die fünf Leuchtstümpfe an.',orbit:[80,3],col:['#1e3a3a','#d8ff7a'],plazaTree:'glimmbaum',path:'#3a4a4a',
    space:{deep:'#0a1a2a',water:'#1a3a4a',shore:'#2a3a4a',land:'#1e3a3a',land2:'#24443a',high:'#2a4a4a',cap:'#d8ff7a',atmo:'#3a2a5a',cloud:.2,sea:.3,capA:.2,freq:3},climate:{hot:'glimmwald',wet:'dunkelufer',cold:'farnsenke'},peak:'glimmwald',
    raw(q,p,{fbm}){return fbm(q,1.4,3)*1.7+.8},biome({h,sea,low,nearPond,M}){if(nearPond||(low&&h<sea+.6))return'dunkelufer';if(M>.1)return'farnsenke';return'glimmwald'},onLoad:W=>GLW.onLoad(W),tick:(dt,t,W,me)=>GLW.tick(dt,t,W,me)}),
  places:moonPlaces('Glimm-Platz','Dunkelteich'),biomes:BI,names:{shop:'Laternen-Laden',bar:'Glühwurm-Bar'},
  sty:{wall:'putz',walls:['#2a3a4a','#3a3a5a'],roof:'dome',roofs:['#1e4a3a','#3a2a5a'],trim:'#d8ff7a',plinth:'#14242a',door:'#d8ff7a',win:'rund',pitch:.9},wall:'streifen',floor:'dielen',
  residents:res(['pluesch','glas'],['frosch','eule','eikopf'],['Funzel','Glimm','Lumi','Blink','Docht'],['#2a3a4a','#3a3a5a','#1e4a3a']),
  haus:{plan:[{fam:'kokon',style:'laternenhaus'},{fam:'kokon',style:'quallenhaus'}]},lang:{n:'Blinkschrift',ink:'#14242a',glow:'#d8ff7a',kind:'rune',syl:['gl','üh','wu','rm','bl','ink','li','cht']},terraform:['glimmwald','farnsenke'],weather:[['klar',3],['nebel',2]]});}

/* =====================================================================
   4 · DRACHEN-MOND (Himmel) · Drachen steigen lassen
   ===================================================================== */
{const ID='drachen';const KC=['#ff4a5a','#ffd23f','#45e0ff','#7fd34a','#ff6fd8'];
N('windgras',{r:.2,h:.6,size:'small',decal:false,planet:ID},(g,m,o,rnd)=>{const c=m.c('#c8e08a');for(let i=0;i<5;i++)P(g,G.co(.03,RR(rnd,.3,.6),4),c,[(rnd()-.5)*.2,.2,(rnd()-.5)*.2],[.4,0,(rnd()-.5)*.3])});
N('drachenbaum',{r:.5,h:3,size:'big',planet:ID},(g,m,o,rnd)=>{const h=RR(rnd,2.2,3);P(g,G.cy(.1,.16,h,8),m.c('#8a6a4a'),[0,h/2,0]);P(g,G.s(.8),m.c('#a8d880',{gloss:.4}),[0,h+.2,0],null,[1.3,.7,1.3]);if(rnd()<.6){const c=KC[Math.floor(rnd()*5)];P(g,G.oct(.3),m.c(c),[.5,h+.5,.3],[0,.5,.7],[1,1.4,.15])}});
N('wolkenstein',{r:.6,h:.8,size:'big',planet:ID},(g,m,o,rnd)=>{for(let i=0;i<3;i++)P(g,G.s(RR(rnd,.3,.5)),m.c('#f2f4fa',{gloss:.5}),[(i-1)*.35,.3,(rnd()-.5)*.3])});
const BI={windhuegel:{n:'Windhügel',g:['#a8d880','#a0d078'],cliff:'#7a9a5a',pat:'gras',grass:'#b8e090',grassD:1,trees:[['drachenbaum',.8]],treeD:.4,deco:[['windgras',8]],decoD:7,rocks:[['wolkenstein',.4]],rockD:.3,litter:[]},
  wolkenwiese:{n:'Wolkenwiese',g:['#d8ecf8','#d0e6f4'],cliff:'#a8c0d8',pat:'staub',grass:null,grassD:0,trees:[],treeD:0,deco:[['windgras',2]],decoD:2,rocks:[['wolkenstein',1.4]],rockD:1,litter:[]},
  windufer:{n:'Wind-Ufer',g:['#e8e0c0','#e0d8b8'],cliff:'#a8a080',pat:'sand',grass:'#d8e0a0',grassD:.4,trees:[],treeD:0,deco:[['windgras',3]],decoD:3,rocks:[],rockD:0,litter:[]}};
F('flugfisch',fishMeta('Flugfisch','drachen','meer','M','tag',2,480,'Ich hab einen Flugfisch gefangen! Er hat Flossen wie Drachenflügel.','Fliegende Fische gleiten mit ihren grossen Brustflossen bis zu 200 Meter weit über das Wasser, um Räubern zu entkommen.'),
  (g,m)=>{fishT(g,m,{id:'flugfisch',H:.16,L:.45,back:'#3a7ab0',belly:'#e8f4ff',tail:'fork',dorsal:'std'});for(const s of[-1,1])P(g,G.s(.15),m.c('#a8d8ff',{gloss:.8}),[s*.15,.03,.05],[0,0,s*.3],[1.4,.08,.7])});
B('drachenlibelle',bugMeta('Drachen-Libelle','drachen','luft','tag',2,440,'Ich hab eine Drachen-Libelle gefangen! An ihrem Schwanz flattert eine winzige Schnur.','Auf Englisch heisst die Libelle «dragonfly», also Drachenfliege. Dabei ist sie völlig harmlos und frisst Mücken.'),
  (g,m)=>{P(g,G.ca(.03,.35),gl(m,'#ff4a5a'),[0,.15,0],[PI/2,0,0]);for(const z of[.04,-.04])for(const s of[-1,1])P(g,G.s(.12),m.glass('#ffffff'),[s*.12,.17,z],[0,0,0],[1.3,.05,.35]);bugFace(g,m,[0,.15,.2],.03,.5)});
REL('erster_drachen',relMeta('Der erste Drachen','drachen','spielzeug',2,1200,'Ein kleiner Papierdrachen mit langer Schnur. Auf dem Schwanz steht: «Steig, auch wenn der Wind dreht.»','Drachen gibt es seit über 2000 Jahren. In China wurden sie früher sogar benutzt, um Nachrichten zu senden oder den Wind zu messen.'),
  (g,m)=>{P(g,G.oct(.2),m.c('#ff4a5a'),[0,.05,0],[PI/2,0,0],[1,1.5,.1]);bt(g,[0,.05,-.25],[.2,.02,-.5],.008,m.c('#3b3450'))});
fauna('windziege',{n:'Wind-Ziege',planet:ID,biomes:['windhuegel','wolkenwiese'],count:3,size:.6,speed:.9,gait:'waddle',voice:['mäh','määhh'],pitch:440,likes:['windgras','flugfisch'],product:'windgras',names:['Böe','Brise','Föhni','Wirbel'],
  fact:'Bergziegen klettern dank weicher, griffiger Hufe sogar an steilen Felswänden. Der Wind stört sie kaum.',a:{col:'#f2f0e8',belly:'#ffffff',body:[.3,.28,.46],head:{r:.22,p:[0,.55,.36]},snout:{type:'muzzle',col:'#e8d8c8',nose:'#3b3450'},ears:{type:'floppy',len:.3},legs:{n:4,len:.2,r:.05,foot:'#5a4a3a'},tail:{type:'short',col:'#f2f0e8'},gait:'waddle'}});
furn('wanddrachen',{n:'Wand-Drachen',cat:'deko',price:1500,planet:ID,size:[1,1],h:1.6,b:(g,m)=>{const k=P(g,G.oct(.4),m.c('#ffd23f'),[0,1.2,0],[0,0,0],[1,1.5,.08]);bt(g,[0,.6,0],[0,1.2,0],.01,m.c('#3b3450'));for(let i=0;i<3;i++)P(g,G.bx(.12,.06,.02,.01),m.c(KC[i]),[0,.9-i*.15,0],[0,0,.4*(i%2?1:-1)]);g.userData.tick=t=>{k.rotation.z=Math.sin(t*1.5)*.15}}});
const KITE=(()=>{let W_=null,poles=[],M_=null;const S=()=>SAVE.drachenmond=SAVE.drachenmond||{up:[],done:false};
  function kite(m,i){const g=new THREE.Group();const k=grp(g,[0,0,0]);P(k,G.oct(.6),m.c(KC[i]),[0,0,0],null,[1,1.5,.1]);for(let j=0;j<4;j++)P(k,G.bx(.2,.1,.02,.01),m.c(KC[(i+j+1)%5]),[0,-1-j*.35,0],[0,0,j%2?.5:-.5]);g.userData.k=k;return g}
  function onLoad(W){W_=W;poles=[];M_=makeMats({skin:'plastik',color:0});const st=S();const{pts,r}=spots(W,5,8484,14);
    pts.forEach((d,i)=>{const g=new THREE.Group();bt(g,[0,0,0],[0,1.6,0],.06,M_.c('#8a6a4a'));P(g,G.cy(.18,.18,.25,12),M_.c(KC[i]),[0,1.1,0]);addOutlines(g);GAME.placeObj(g,d,r()*TAU,0,true);
      const kg=kite(M_,i);kg.visible=st.up.includes(i);g.add(kg);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V(0,1.6,0),new V(0,6,3)]),new THREE.LineBasicMaterial({color:'#3b3450'}));line.visible=kg.visible;g.add(line);
      poles.push({d,g,i,kg,line});W.inter.push({kind:'drachenmast',p:d,r:2,label:st.up.includes(i)?'Drachen fliegt':'Drachen steigen lassen',act:()=>launch(i)})})}
  async function launch(i){const st=S();if(st.up.includes(i)){UI.toast('Dieser Drachen fliegt schon hoch oben.');return}const p=poles[i];st.up.push(i);persist();p.kg.visible=true;p.line.visible=true;SND.play('whoosh');money(60);
    if(st.up.length<5){UI.toast('Der Drachen steigt! '+st.up.length+' von 5 fliegen.',2600);return}
    if(!st.done){st.done=true;persist();SND.jingle('j_success');await UI.talk('Windwartin Böe',['Alle fünf Drachen fliegen! Das ist das schönste Drachenfest seit Jahren.','Hier, ein Wand-Drachen für dein Zimmer. Und der allererste Drachen fürs Museum.'],{voice:{pitch:360,kind:'quirlig'}});bagAdd('furn','wanddrachen');bagAdd('relic','erster_drachen');money(500)}}
  function tick(dt,t){for(const p of poles){if(!p.kg.visible)continue;const x=Math.sin(t*.7+p.i)*1.2,y=6+Math.sin(t*1.1+p.i*2)*.6,z=3+Math.cos(t*.5+p.i)*.6;p.kg.position.set(x,y,z);p.kg.userData.k.rotation.z=Math.sin(t*1.7+p.i)*.3;
      const a=p.line.geometry.attributes.position;a.setXYZ(1,x,y-.4,z);a.needsUpdate=true}}
  return{onLoad,tick,state:S}})();
PLANETKIT.add(ID,{def:moonDef({n:'Drachen-Mond',moonOf:'wolkenarchipel',sky:['#8fd0ff','#e8f6ff'],fog:'#d8ecf8',water:'#5aa0d0',deep:'#2a5a8a',shop:ID,desc:'Ein windiger Mond um den Wolkenarchipel. Auf fünf Hügeln warten Drachenmasten. Lass alle Drachen gleichzeitig steigen.',orbit:[100,4],col:['#a8d880','#ffd23f'],plazaTree:'drachenbaum',path:'#e8e0c0',
    space:{deep:'#2a5a8a',water:'#5aa0d0',shore:'#e8e0c0',land:'#a8d880',land2:'#d8ecf8',high:'#d0e6f4',cap:'#ffffff',atmo:'#8fd0ff',cloud:.6,sea:.3,capA:.3,freq:3},climate:{hot:'windhuegel',wet:'windufer',cold:'wolkenwiese'},peak:'wolkenwiese',
    raw(q,p,{fbm}){return fbm(q,1.1,3)*2.2+.9},biome({h,sea,low,nearPond}){if(nearPond||(low&&h<sea+.6))return'windufer';if(h>sea+3)return'wolkenwiese';return'windhuegel'},onLoad:W=>KITE.onLoad(W),tick:(dt,t,W,me)=>KITE.tick(dt,t,W,me)}),
  places:moonPlaces('Wind-Platz','Windteich'),biomes:BI,names:{shop:'Drachen-Laden',bar:'Böen-Bar'},
  sty:{wall:'putz',walls:['#ffffff','#f2f4fa'],roof:'dome',roofs:KC.slice(0,4),trim:'#8a6a4a',plinth:'#a8c0d8',door:'#45e0ff',win:'rund',pitch:.9},wall:'streifen',floor:'dielen',
  residents:res(['fell','pluesch'],['vogel','eule','mensch'],['Böe','Brise','Schnur','Wirbel','Föhn'],['#ffffff','#f2f4fa','#ffd23f']),
  haus:{plan:[{fam:'kokon',style:'windradhaus'},{fam:'kokon',style:'wetterhaeuschen'}]},lang:{n:'Windschrift',ink:'#2a5a8a',glow:'#ffffff',kind:'wave',syl:['wi','nd','dr','ach','en','sch','nur','bö']},terraform:['windhuegel','wolkenwiese'],weather:[['klar',3],['heiter',2],['wind',2]]});}

/* =====================================================================
   5 · PIXEL-MOND (Bildschirm) · Licht-Rätsel auf 3×3 Feldern
   ===================================================================== */
{const ID='pixelmond';const PC=['#45e0ff','#ff6fd8','#ffd23f','#7fd34a'];
N('voxelbaum',{r:.5,h:2.6,size:'big',planet:ID},(g,m,o,rnd)=>{const h=Math.round(RR(rnd,3,5))*.4;for(let i=0;i<h/.4;i++)P(g,G.bx(.4,.4,.4,0),m.c('#8a5a34'),[0,.2+i*.4,0]);const c=m.c(['#5aae4a','#7fd34a'][Math.floor(rnd()*2)]);for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)for(let y=0;y<2;y++)if(rnd()<.85)P(g,G.bx(.4,.4,.4,0),c,[x*.4,h+.2+y*.4,z*.4])});
N('pixelbusch',{r:.3,h:.5,size:'small',planet:ID},(g,m,o,rnd)=>{const c=m.c(PC[Math.floor(rnd()*4)]);for(let i=0;i<3;i++)P(g,G.bx(.2,.2,.2,0),c,[(i-1)*.2,.1+(i%2)*.2,0])});
N('wuerfelfels',{r:.6,h:.8,size:'big',planet:ID},(g,m,o,rnd)=>{const c=m.c('#6a6a8a');for(let i=0;i<4;i++)P(g,G.bx(.4,.4,.4,0),c,[(i%2)*.4-.2,.2+Math.floor(i/3)*.4,(i>1?.4:0)-.2])});
const BI={pixelwiese:{n:'Pixelwiese',g:['#5aae4a','#54a644'],cliff:'#3a6a3a',pat:'gras',grass:null,grassD:0,trees:[['voxelbaum',1.2]],treeD:.5,deco:[['pixelbusch',5]],decoD:4,rocks:[['wuerfelfels',.4]],rockD:.3,litter:[]},
  pixelwueste:{n:'Pixelwüste',g:['#e8c870','#e0c068'],cliff:'#a88a4a',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,deco:[['pixelbusch',1]],decoD:1,rocks:[['wuerfelfels',1.2]],rockD:.8,litter:[]},
  pixelufer:{n:'Pixel-Ufer',g:['#f2e0a0','#ead898'],cliff:'#a88a4a',pat:'sand',grass:null,grassD:0,trees:[],treeD:0,deco:[],decoD:0,rocks:[],rockD:0,litter:[]}};
F('blockfisch',fishMeta('Block-Fisch','pixelmond','teich','S','immer',1,260,'Ich hab einen Block-Fisch gefangen! Er besteht aus genau acht Würfeln.','Frühe Videospiele hatten so wenig Speicher, dass Figuren aus wenigen grossen Bildpunkten bestanden. Daraus wurde ein eigener Kunststil.'),
  (g,m)=>{const c=gl(m,'#ff9a45');for(const[x,y,z]of[[0,0,.1],[0,0,-.1],[0,.1,0],[0,-.1,0],[0,0,.3],[0,0,-.3],[0,.1,-.4],[0,-.1,-.4]])P(g,G.bx(.1,.1,.1,0),c,[x,y,z]);P(g,G.bx(.04,.04,.02,0),m.c('#3b3450'),[.05,.03,.25])});
B('pixelgrille',bugMeta('Pixel-Grille','pixelmond','boden','nacht',2,400,'Ich hab eine Pixel-Grille gefangen! Ihr Zirpen klingt wie ein Piepton aus einem alten Spiel.','Alte Spielkonsolen konnten oft nur drei oder vier Töne gleichzeitig spielen. Aus diesen Pieptönen entstand die Chiptune-Musik.'),
  (g,m)=>{const c=gl(m,'#7fd34a');P(g,G.bx(.12,.1,.24,0),c,[0,.1,0]);P(g,G.bx(.1,.1,.1,0),c,[0,.14,.14]);for(const s of[-1,1])P(g,G.bx(.04,.04,.2,0),c,[s*.08,.12,-.15],[.5,0,0])});
REL('erster_pixel',relMeta('Der erste Pixel','pixelmond','kunst',2,1150,'Ein einzelner leuchtender Würfel. Auf der Unterseite steht: «Aus mir wurde alles.»','Das Wort Pixel kommt von «picture element», also Bild-Element. Jedes Bild auf einem Bildschirm besteht aus Millionen davon.'),
  (g,m)=>{P(g,G.bx(.2,.2,.2,0),m.glow('#45e0ff',1.4),[0,.12,0])});
fauna('pixelkaninchen',{n:'Pixel-Kaninchen',planet:ID,biomes:['pixelwiese'],count:3,size:.5,speed:1,gait:'hop',voice:['bip','bup'],pitch:600,likes:['pixelbusch','blockfisch'],product:'pixelbusch',names:['8-Bit','Hoppel','Sprite','Bitti'],
  fact:'Kaninchen machen kleine Freudensprünge, wenn sie glücklich sind. Man nennt sie «Binkys».',a:{col:'#f2f0ff',belly:'#ffffff',body:[.26,.24,.36],head:{r:.2,p:[0,.45,.28]},snout:{type:'muzzle',col:'#ffffff',nose:'#ff8ab0'},ears:{type:'long',len:.42},legs:{n:4,len:.1,r:.05,foot:'#ffffff'},tail:{type:'puff',col:'#ffffff'},gait:'hop'}});
furn('pixelkachel_lampe',{n:'Pixel-Kachel-Lampe',cat:'licht',price:1800,planet:ID,size:[1,1],h:.8,b:(g,m)=>{for(let i=0;i<9;i++)P(g,G.bx(.22,.22,.22,0),m.glow(PC[i%4],1.2),[(i%3-1)*.24,.15+Math.floor(i/3)*.24,0]);g.userData.light={p:[0,.4,.2],c:'#45e0ff',i:.6}}});
/* Licht-Rätsel: Ein Feld antippen schaltet es und seine Nachbarn um. Ziel: alle neun leuchten. */
const LIGHTS=(()=>{let W_=null,tiles=[],state=[],M_=null,boardD=null;const S=()=>SAVE.pixelmond=SAVE.pixelmond||{solved:0,done:false};
  const START=[[1,0,1,0,0,0,1,0,1],[0,1,0,1,1,1,0,1,0],[1,1,0,1,0,0,0,0,1]];
  function setTile(i){const t=tiles[i];t.mesh.material=state[i]?M_.glow(PC[S().solved%4],1.5):M_.c('#2a2a40',{gloss:.6})}
  function onLoad(W){W_=W;tiles=[];M_=makeMats({skin:'plastik',color:0});const{pts,r}=spots(W,1,9595,10,{fromPlaza:12});if(!pts.length)return;boardD=pts[0];
    const g=new THREE.Group();P(g,G.bx(7.4,.2,7.4,.05),M_.c('#c8ccd8'),[0,.1,0]);GAME.placeObj(g,boardD,0,0,true);
    const t1=GAME.tangentTo(boardD,new V(0,0,1)),t2=boardD.clone().cross(t1);const st=S();state=START[st.solved%3].slice();
    for(let i=0;i<9;i++){const x=(i%3-1)*2.4,z=(Math.floor(i/3)-1)*2.4;const m=P(g,G.bx(2.1,.12,2.1,.04),M_.c('#2a2a40'),[x,.26,z]);tiles.push({mesh:m});setTile(i);
      const d=boardD.clone().addScaledVector(t1,x/W.R).addScaledVector(t2,z/W.R).normalize();const nr=i+1;W.inter.push({kind:'pixelfeld',p:d,r:1.1,label:`Feld ${nr} umschalten`,act:()=>press(i)})}
    addOutlines(g)}
  async function press(i){const x=i%3,y=Math.floor(i/3);for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||nx>2||ny<0||ny>2)continue;const k=ny*3+nx;state[k]=1-state[k];setTile(k)}SND.play('click',{rate:1+state[i]*.3});
    if(state.every(v=>v)){const st=S();st.solved++;persist();money(150);SND.play('powerup');UI.toast('Alle neun Felder leuchten! Plus 150 Taler.',2600);
      if(!st.done){st.done=true;persist();SND.jingle('j_success');await UI.talk('Pixelwartin Bitti',['Alle neun Felder leuchten! Das Rätsel ist älter als der Mond selbst.','Nimm diese Pixel-Kachel-Lampe mit. Und den ersten Pixel für dein Museum.'],{voice:{pitch:420,kind:'quirlig'}});bagAdd('furn','pixelkachel_lampe');bagAdd('relic','erster_pixel');money(400)}
      setTimeout(()=>{state=START[st.solved%3].slice();for(let k=0;k<9;k++)setTile(k);UI.toast('Ein neues Muster ist erschienen.')},4000)}}
  return{onLoad,tick:()=>{},state:S}})();
PLANETKIT.add(ID,{def:moonDef({n:'Pixel-Mond',moonOf:'schoner',sky:['#6ab0ff','#c8e8ff'],fog:'#b8d8f8',water:'#3a7ad0',deep:'#1a4a9a',shop:ID,desc:'Ein Mond aus lauter Würfeln um den Bildschirmschoner-Planeten. Auf dem Licht-Rätsel müssen alle neun Felder leuchten.',orbit:[120,5],col:['#5aae4a','#45e0ff'],plazaTree:'voxelbaum',path:'#e8c870',
    space:{deep:'#1a4a9a',water:'#3a7ad0',shore:'#f2e0a0',land:'#5aae4a',land2:'#e8c870',high:'#6a6a8a',cap:'#ffffff',atmo:'#6ab0ff',cloud:.3,sea:.3,capA:.2,freq:4},climate:{hot:'pixelwueste',wet:'pixelufer',cold:'pixelwiese'},peak:'pixelwiese',
    raw(q,p,{fbm}){/* gestufte Würfel-Landschaft */return Math.round((fbm(q,1.2,3)*1.8+.8)*2)/2},biome({h,sea,low,nearPond,T}){if(nearPond||(low&&h<sea+.6))return'pixelufer';if(T>.25)return'pixelwueste';return'pixelwiese'},onLoad:W=>LIGHTS.onLoad(W),tick:()=>{}}),
  places:moonPlaces('Pixel-Platz','Pixelteich'),biomes:BI,names:{shop:'Würfel-Laden',bar:'8-Bit-Bar'},
  sty:{wall:'putz',walls:['#ffffff','#e8f0ff'],roof:'dome',roofs:PC,trim:'#6a6a8a',plinth:'#3a3a5a',door:'#ff6fd8',win:'rund',pitch:.9},wall:'streifen',floor:'fliesen',
  residents:res(['plastik','glas'],['crtkopf','kapselkopf','katze'],['Bitti','Sprite','Pixel','Voxel','Blocki'],['#ffffff','#e8f0ff','#45e0ff']),
  haus:{plan:[{fam:'kokon',style:'wuerfelturm'},{fam:'kokon',style:'fensterhaus'}]},lang:{n:'Blockschrift',ink:'#3a3a5a',glow:'#45e0ff',kind:'circuit',syl:['pi','xe','lm','on','bl','oc','kb','it']},terraform:['pixelwiese','pixelwueste'],weather:[['klar',4],['heiter',1]]});}
})();
