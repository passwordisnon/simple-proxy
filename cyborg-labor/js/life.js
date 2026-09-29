/* =====================================================================
   CYBORG-LABOR · life.js
   „Leben“ der KI-Figuren – angelehnt an Die Sims 4 und Animal Crossing:
   · Bedürfnisse (Hunger, Energie, Kontakte, Spass, Hygiene, Komfort)
   · Charakterzüge, Hobby, Persönlichkeit, Spruch („catchphrase“)
   · Emotionen aus Bedürfnissen + Stimmungen (Moodlets) → Haltung, Tempo,
     Stimme, Stimmungs-Raute über dem Kopf
   · Autonomie: Nutzen-KI wählt Tätigkeiten (essen, schlafen, plaudern,
     tanzen, angeln, malen, joggen, lesen, waschen, gärtnern …) nach Tageszeit
   · Beziehungen untereinander und zur Spielfigur, Tagebuch („Was hast du heute gemacht?“)
   · Soziales Menü wie in Sims: Freundlich, Lustig, Frech, Zusammen, Bitten
   ===================================================================== */
const LIFE=(()=>{
  const V=THREE.Vector3;
  const NEEDS={hunger:{n:'Hunger',i:'food',dec:.22},energy:{n:'Energie',i:'bed',dec:.1},social:{n:'Kontakte',i:'chat',dec:.26},fun:{n:'Spass',i:'party',dec:.3},hygiene:{n:'Hygiene',i:'shower',dec:.12},comfort:{n:'Komfort',i:'relax',dec:.16}};
  const TRAITS={
    froehlich:{n:'fröhlich',d:'Ist oft gut drauf.',mood:{froh:1}},
    kreativ:{n:'kreativ',d:'Liebt Malen und Musik.',likes:['malen','singen']},
    sportlich:{n:'sportlich',d:'Joggt und tanzt gern.',likes:['joggen','ball','tanzen'],dec:{energy:.8}},
    neugierig:{n:'neugierig',d:'Liest, forscht, fragt alles.',likes:['lesen','insekten','museum']},
    gesellig:{n:'gesellig',d:'Braucht viele Kontakte.',likes:['plaudern','besuch'],dec:{social:1.5}},
    einzelgaenger:{n:'Einzelgänger:in',d:'Mag Ruhe und wenig Gerede.',likes:['angeln','lesen'],dec:{social:.5}},
    verspielt:{n:'verspielt',d:'Macht aus allem ein Spiel.',likes:['ball','fangen','tanzen'],dec:{fun:1.4}},
    feinschmecker:{n:'Feinschmecker:in',d:'Denkt viel ans Essen.',likes:['essen','picknick'],dec:{hunger:1.4}},
    naturliebend:{n:'naturliebend',d:'Gärtnert und sammelt draussen.',likes:['gaertnern','insekten','spazieren']},
    ordentlich:{n:'ordentlich',d:'Hält alles sauber.',likes:['waschen','aufraeumen'],dec:{hygiene:1.5}},
    hitzkopf:{n:'Hitzkopf',d:'Wird schnell wütend, beruhigt sich aber auch schnell.',mood:{wuetend:.6}},
    musikalisch:{n:'musikalisch',d:'Singt und tanzt, wo es geht.',likes:['singen','tanzen']},
    gemuetlich:{n:'gemütlich',d:'Schläft gern und viel.',likes:['nickerchen','schlafen'],dec:{energy:1.4}},
    tollpatschig:{n:'tollpatschig',d:'Stolpert und lacht darüber.',likes:['ball']}};
  const HOBBIES={natur:{n:'Natur',acts:['gaertnern','insekten','spazieren']},fitness:{n:'Fitness',acts:['joggen','ball']},spiel:{n:'Spielen',acts:['ball','fangen']},bildung:{n:'Lernen',acts:['lesen','museum']},musik:{n:'Musik',acts:['singen','tanzen']},kunst:{n:'Kunst',acts:['malen']},angeln:{n:'Angeln',acts:['angeln']}};
  const PERS={
    fröhlich:{n:'fröhlich-quirlig',hi:['Hiii!','Oh, du bist es! Juhu!','Heute ist ein Glitzertag!']},
    sportlich:{n:'sportlich',hi:['Yo! Schon trainiert heute?','Hey! Kurz Liegestütze?']},
    gemuetlich:{n:'gemütlich',hi:['Oh… hallo… *gähn*','Hast du Snacks?']},
    grummelig:{n:'grummelig',hi:['Hmpf. Was gibt\'s?','Na gut. Hallo.']},
    normal:{n:'freundlich',hi:['Hallo! Schön, dich zu sehen.','Guten Tag! Alles gut bei dir?']},
    schick:{n:'eitel-schick',hi:['Oh, hallo! Sieht mein Kopf heute gut aus?','Hey du, stylisch wie immer!']},
    schwesterlich:{n:'fürsorglich',hi:['Na, hast du genug gegessen?','Hey! Pass gut auf dich auf, ja?']}};
  const EMO={
    froh:{n:'fröhlich',col:'#6BCB5A',i:'smile',spd:1.1,bounce:.1,voice:1},
    energie:{n:'energiegeladen',col:'#FFB23E',i:'sparkle',spd:1.3,bounce:.14,voice:1},
    verspielt:{n:'verspielt',col:'#FF8FB8',i:'party',spd:1.2,bounce:.16,voice:1},
    inspiriert:{n:'inspiriert',col:'#56C6B6',i:'bulb',spd:1,bounce:.05,voice:1},
    konzentriert:{n:'konzentriert',col:'#6AA8F0',i:'book',spd:.95,bounce:0,voice:0},
    stolz:{n:'selbstbewusst',col:'#F7B84B',i:'star',spd:1.05,bounce:.05,chest:-.1,voice:1},
    ausgeglichen:{n:'ausgeglichen',col:'#9ED872',i:'relax',spd:1,bounce:.03,voice:0},
    gelangweilt:{n:'gelangweilt',col:'#B8B0C8',i:'think',spd:.75,bounce:0,slump:.1,voice:-1},
    traurig:{n:'traurig',col:'#7F9CD8',i:'sad',spd:.6,bounce:0,slump:.25,voice:-1},
    wuetend:{n:'wütend',col:'#E8505B',i:'angry',spd:1.2,bounce:0,shake:.05,voice:-1},
    angespannt:{n:'angespannt',col:'#E88A5A',i:'exclaim',spd:1.1,bounce:0,shake:.02,voice:-1},
    muede:{n:'müde',col:'#9A8BC0',i:'zzz',spd:.55,bounce:0,slump:.2,voice:-1},
    peinlich:{n:'peinlich berührt',col:'#FF9EAA',i:'sad',spd:.8,bounce:0,slump:.18,voice:-1}};
  const TOPICS=['fish','leaf','note','palette','ball','book','rocket','food','heart','laugh','globe','paw','star','house'];
  const TOPIC_TXT={fish:'Fische',leaf:'Pflanzen',note:'Musik',palette:'Kunst',ball:'Sport',book:'Bücher',rocket:'Raumfahrt',food:'Essen',heart:'Freundschaft',laugh:'Witze',globe:'andere Planeten',paw:'Tiere',star:'Träume',house:'Einrichtung'};
  const JOKES=['Warum können Roboter nie lügen? Weil sie sonst einen Kurzschluss im Gewissen kriegen!','Was macht ein Pilz auf einer Party? Er ist ein Champignon – äh, Champion!','Wie nennt man einen Cyborg im Garten? Einen Rasen-Mäher mit Gefühl.','Treffen sich zwei Magnete. Sagt der eine: „Was soll ich heute bloss anziehen?“','Warum war das Schaf so entspannt? Es hatte alles im Wollgriff.'];
  const COMPL=['Deine Teile passen richtig gut zusammen!','Du bist echt eine gute Nachbarin – ein guter Nachbar!','Du riechst heute gar nicht nach Öl!','Deine Stimme klingt wie ein kleines Glockenspiel.','Du hast die schönsten Augen auf dem ganzen Planeten.'];
  const CATCH=['blubb','zack','piep','schnurr','knack','summ','hui','dingdong','flausch','zisch','boing','tüdel','kling','knusper','wusch'];
  const V_=()=>GAME.G;const R=()=>GAME.G.R;
  const nearU=(p,dist)=>{for(let i=0;i<10;i++){const t=GAME.tangentTo(p,new V().randomDirection());const q=p.clone().addScaledVector(t,dist*(.4+Math.random()*.6)/R()).normalize();if(GAME.isLand(q)&&!(GAME.nearPlace&&GAME.nearPlace(q,.95)))return q}return p.clone()};
  const dU=(a,b)=>a.angleTo(b)*R();
  const hour=()=>GAMETIME.hour();
  /* ---------- Persönlichkeit aus der Figur ableiten (stabil je id) ---------- */
  function seedOf(d){return (parseInt(hashStr(String(d.id||d.name||'x')).slice(0,6),36)%2000000000)+1}
  function makeLife(e){const d=e.d;const r=srand(seedOf(d));const tk=Object.keys(TRAITS);const t1=tk[Math.floor(r()*tk.length)];let t2=tk[Math.floor(r()*tk.length)];if(t2===t1)t2=tk[(tk.indexOf(t1)+5)%tk.length];
    const hk=Object.keys(HOBBIES);const hobby=hk[Math.floor(r()*hk.length)];const pk=t1==='hitzkopf'||t2==='hitzkopf'?'grummelig':t1==='sportlich'?'sportlich':t1==='gemuetlich'?'gemuetlich':t1==='froehlich'?'fröhlich':['normal','schick','schwesterlich'][Math.floor(r()*3)];
    const needs={};for(const k in NEEDS)needs[k]=45+r()*50;const saved=SAVE.life&&SAVE.life[d.id];
    const L={traits:[t1,t2],hobby,pers:pk,catch:CATCH[Math.floor(r()*CATCH.length)],needs,moodlets:[],emo:'ausgeglichen',emoT:0,act:null,log:saved&&saved.log||[],rel:{},want:saved&&saved.want||null,busyT:0,thinkT:1+r()*3,iconT:4+r()*6,birthday:saved&&saved.bd||(1+Math.floor(r()*28))+'.'+(1+Math.floor(r()*12))+'.'};
    e.life=L;return L}
  function save(e){SAVE.life=SAVE.life||{};SAVE.life[e.d.id]={log:e.life.log.slice(-8),want:e.life.want,bd:e.life.birthday};persist()}
  const has=(L,t)=>L.traits.includes(t);
  function relP(e){return SAVE.friendship[e.d.id]||0}/* 0..100 zur Spielfigur */
  function addRel(e,n){if(n>0&&e.d.native&&typeof LANG!=='undefined')n*=LANG.bonus(GAME.G.id);SAVE.friendship[e.d.id]=Math.max(-50,Math.min(100,(SAVE.friendship[e.d.id]||0)+n));persist()}
  function relLabel(v){return v<-20?'Streit':v<5?'Bekannte':v<25?'Freundlich':v<50?'Befreundet':v<80?'Gute Freundschaft':'Beste Freundschaft'}
  function moodlet(e,emo,w,sec,why){const L=e.life;L.moodlets=L.moodlets.filter(m=>m.why!==why);L.moodlets.push({emo,w,t:sec,why})}
  function logDay(e,txt){const L=e.life;L.log.push(GAMETIME.str()+' '+txt);if(L.log.length>12)L.log.shift();save(e)}
  /* ---------- Emotion bestimmen ---------- */
  function evalEmo(e){const L=e.life;const N=L.needs;const sc={};const add=(k,v)=>sc[k]=(sc[k]||0)+v;
    add('ausgeglichen',1);if(N.energy<22)add('muede',3-N.energy/11);if(N.hunger<20)add(has(L,'hitzkopf')?'wuetend':'angespannt',2.5-N.hunger/10);if(N.social<20)add('traurig',2.2-N.social/12);if(N.fun<20)add('gelangweilt',2.2-N.fun/12);if(N.hygiene<15)add('peinlich',1.6);
    const avg=(N.hunger+N.energy+N.social+N.fun+N.hygiene+N.comfort)/6;if(avg>70)add('froh',1.4);for(const t of L.traits){const m=TRAITS[t].mood;if(m)for(const k in m)add(k,m[k])}
    for(const m of L.moodlets)add(m.emo,m.w);let best='ausgeglichen',bv=-1;for(const k in sc)if(sc[k]>bv){bv=sc[k];best=k}
    if(best!==L.emo){L.emo=best;L.emoT=0;if(e.g.visible&&Math.random()<.7)GAME.say(e,'icon:'+EMO[best].i,1.8,true)}}
  /* ---------- Tätigkeiten (Werbung wie bei Sims) ---------- */
  const place=id=>V_().places.find(p=>p.build===id||p.id===id);
  const A={
    essen:{n:'isst etwas',i:'food',ad:{hunger:65},dur:6,where:e=>{const tr=V_().trees.filter(t=>t.hasFruit).sort((a,b)=>a.p.angleTo(e.p)-b.p.angleTo(e.p))[0];return tr?nearU(tr.p,1.2):null},
      start:e=>{e.act=1},tick:(e,t)=>{e.act=.6+Math.sin(t*9)*.3},end:e=>logDay(e,'hat Obst gegessen')},
    picknick:{n:'macht Picknick',i:'food',ad:{hunger:40,comfort:25,social:10},dur:9,where:e=>place('plaza')?nearU(place('plaza').dir,5):null,end:e=>logDay(e,'hat auf dem Platz gepicknickt')},
    schlafen:{n:'schläft',i:'zzz',ad:{energy:90,comfort:20},dur:24,night:2.5,where:e=>e.homeP?e.homeP.clone():nearU(e.home||e.p,3),start:e=>{e.sleeping=true;if(e.homeP&&dU(e.p,e.homeP)<3){e.inHome=true;GAME.W.fx(e.p,'staub',3)}},end:e=>{e.sleeping=false;e.inHome=false;moodlet(e,'energie',1.2,90,'ausgeschlafen');logDay(e,'hat ausgeschlafen')}},
    zuhause:{n:'ist zu Hause',i:'house',ad:{comfort:60,energy:15,hygiene:30},dur:14,where:e=>e.homeP?e.homeP.clone():null,start:e=>{if(e.homeP&&dU(e.p,e.homeP)<3)e.inHome=true},end:e=>{e.inHome=false;logDay(e,'war zu Hause und hat aufgeräumt')}},
    nickerchen:{n:'macht ein Nickerchen',i:'zzz',ad:{energy:35,comfort:30},dur:10,where:e=>place('plaza')?nearU(place('plaza').dir,4):null,start:e=>{e.sleeping=true},end:e=>{e.sleeping=false;logDay(e,'hat ein Nickerchen gemacht')}},
    plaudern:{n:'plaudert',i:'chat',ad:{social:60,fun:10},dur:9,social:true},
    tanzen:{n:'tanzt',i:'dance',ad:{fun:55,energy:-10,social:10},dur:8,evening:1.5,where:e=>{const s=place('plaza');return s?nearU(s.dir,4):null},start:e=>{e.dance=8},tick:(e,t)=>{if(Math.random()<.02)GAME.W.fx(e.p,'note',2)},end:e=>{moodlet(e,'verspielt',1,60,'getanzt');logDay(e,'hat getanzt')}},
    ball:{n:'spielt Ball',i:'ball',ad:{fun:50,energy:-12},dur:10,where:e=>V_().ball?V_().ball.p.clone():null,tick:(e,t)=>{const b=V_().ball;if(b&&Math.random()<.03){e.goal={p:b.p.clone()}}},end:e=>{moodlet(e,'verspielt',1.2,60,'Ball gespielt');logDay(e,'hat Ball gespielt')}},
    angeln:{n:'angelt',i:'rod',ad:{fun:35,comfort:15},dur:14,where:e=>shore(e.p),start:e=>GAME.say(e,'icon:rod',3,true),end:e=>{if(Math.random()<.5){const f=pick(FISH.filter(x=>x.planet===V_().id));if(f){GAME.say(e,'icon:fish',2,true);logDay(e,'hat eine(n) '+f.n+' geangelt');if(e.kind==='bot')SOCIAL.addMsg('all',e.d.name,pick(BOT_CHAT.fish).replace('{f}',f.n),'bot');moodlet(e,'stolz',1.2,60,'Fang')}}else logDay(e,'hat geangelt (nichts gefangen)')}},
    insekten:{n:'sucht Insekten',i:'leaf',ad:{fun:30},dur:9,where:e=>nearU(e.p,8),tick:(e,t)=>{if(Math.random()<.01)e.jump=.6},end:e=>logDay(e,'hat Insekten beobachtet')},
    malen:{n:'malt',i:'palette',ad:{fun:40},dur:12,where:e=>{const s=place('studio');return s&&s.doorP?nearU(s.doorP,1.5):null},end:e=>{moodlet(e,'inspiriert',1.6,90,'gemalt');logDay(e,'hat ein Bild gemalt')}},
    lesen:{n:'liest am Anschlagbrett',i:'book',ad:{fun:20,comfort:10},dur:8,where:e=>{const b=V_().inter.find(x=>x.kind==='board');return b?b.p.clone():null},end:e=>{moodlet(e,'konzentriert',1.2,60,'gelesen');logDay(e,'hat die Neuigkeiten gelesen')}},
    museum:{n:'besucht das Museum',i:'globe',ad:{fun:30},dur:8,where:e=>{const s=place('museum');return s&&s.doorP?s.doorP.clone():null},end:e=>{moodlet(e,'inspiriert',1,60,'Museum');logDay(e,'war im Museum')}},
    waschen:{n:'wäscht sich',i:'shower',ad:{hygiene:75},dur:6,where:e=>shore(e.p)||(place('plaza')?nearU(place('plaza').dir,2):null),tick:(e,t)=>{if(Math.random()<.08)GAME.W.fx(e.p,'tropfen',2)},end:e=>logDay(e,'hat sich gewaschen')},
    joggen:{n:'joggt',i:'dance',ad:{fun:25,energy:-18,hygiene:-15},dur:12,fast:1.9,where:e=>nearU(e.p,14),tick:(e,t)=>{if(!e.goal)e.goal={p:nearU(e.p,10)}},end:e=>{moodlet(e,'energie',1.3,60,'gejoggt');logDay(e,'ist gejoggt')}},
    spazieren:{n:'spaziert',i:'leaf',ad:{fun:12,comfort:8},dur:10,where:e=>nearU(e.home||e.p,10),end:e=>{}},
    gaertnern:{n:'gärtnert',i:'leaf',ad:{fun:30,hygiene:-8},dur:8,where:e=>nearU(e.home||e.p,5),end:e=>{try{if(V_().id==='kompost'&&GAME.W.spawn){const pr=GAME.W.spawn('blume',e.p.clone());if(pr)pr.grow=.2}}catch(x){}logDay(e,'hat eine Blume gepflanzt');moodlet(e,'froh',1,60,'gegärtnert')}},
    singen:{n:'singt',i:'note',ad:{fun:35,social:5},dur:7,where:e=>nearU(e.p,2),start:e=>{SND.voice&&e.g.visible&&dU(e.p,GAME.me.p)<14&&SND.voice('la la laa lalala',Object.assign({},GAME.voiceFor(e.d),{vol:.6}))},tick:(e,t)=>{if(Math.random()<.05)GAME.W.fx(e.p,'note',1)},end:e=>logDay(e,'hat ein Lied gesungen')},
    besuch:{n:'besucht dich',i:'wave',ad:{social:45},dur:5,where:e=>{const me=GAME.me;return me&&!me.inside&&dU(e.p,me.p)<35?nearU(me.p,2):null},end:e=>{const me=GAME.me;if(me&&dU(e.p,me.p)<4){e.lookAt=me;e.stop=3;GAME.say(e,pick(PERS[e.life.pers].hi),3);if(!e.life.want&&Math.random()<.5)makeWant(e)}}},
    bar:{n:'ist in der Jazz-Bar',i:'note',ad:{social:55,fun:45},dur:40,evening:2.4,where:e=>{const s=place('bar');return s&&s.doorP?s.doorP.clone():null},start:e=>{e.inBar=true},end:e=>{e.inBar=false;logDay(e,'war in der Jazz-Bar');moodlet(e,'froh',1.2,90,'Abend in der Bar')}},
    fangen:{n:'spielt Fangen',i:'party',ad:{fun:45,energy:-10,social:20},dur:9,social:true,game:true}};
  function shore(p){for(let i=0;i<24;i++){const q=nearU(p,4+Math.random()*10);const h=V_().hAt(q);if(h>V_().sea&&h<V_().sea+.25)return q}return null}
  function curve(v){return Math.pow(Math.max(0,(100-v))/100,2)*2+.05}
  function score(e,k,a){const L=e.life;let s=0;for(const n in a.ad){const gain=a.ad[n];if(gain>0)s+=curve(L.needs[n])*Math.min(gain,100-L.needs[n])/20;else s+=gain/200}
    for(const t of L.traits){if((TRAITS[t].likes||[]).includes(k))s*=1.5}if(HOBBIES[L.hobby].acts.includes(k))s*=1.4;const h=hour();
    if(a.night){const night=h>=21.5||h<6.5;s*=night?a.night:(k==='schlafen'?.15:1)}if(a.evening&&h>=17&&h<23)s*=a.evening;if(L.last===k)s*=.4;return s*(.75+Math.random()*.5)}
  /* ---------- Denken: nächste Tätigkeit wählen ---------- */
  function think(e,dt,t){const L=e.life||makeLife(e);if(L.act)return true;L.thinkT-=dt;if(L.thinkT>0)return true;L.thinkT=.8+Math.random()*1.5;
    let best=null,bs=0;for(const k in A){const s=score(e,k,A[k]);if(s>bs){bs=s;best=k}}if(!best)return false;
    const a=A[best];if(a.social){const o=partner(e);if(!o)return false;startSocial(e,o,best);return true}
    const p=a.where?a.where(e):null;if(!p)return false;L.act={k:best,a,t:a.dur,started:false};L.last=best;e.goal={p,then:()=>begin(e)};return true}
  function begin(e){const L=e.life;if(!L.act)return;L.act.started=true;e.stop=L.act.a.dur;L.act.t=L.act.a.dur;L.act.a.start&&L.act.a.start(e)}
  function finish(e){const L=e.life;const a=L.act;if(!a)return;for(const n in a.a.ad)L.needs[n]=Math.max(0,Math.min(100,L.needs[n]+a.a.ad[n]));a.a.end&&a.a.end(e);L.act=null;e.stop=.5;e.dance=0;e.sleeping=false;e.inHome=false;e.inBar=false}
  function partner(e){let best=null,bd=28;for(const o of GAME.ents.values()){if(o===e||!o.life||o.kind==='peer'||o.kind==='me'||o.talking||o.life.act||o.inside||o.inHome||o.inBar)continue;const d=dU(e.p,o.p);if(d<bd){bd=d;best=o}}return best}
  function startSocial(e,o,k){const mid=e.p.clone().add(o.p).normalize();const a=A[k];
    const pa=nearU(mid,.9),pb=nearU(mid,.9);e.life.act={k,a,t:a.dur+6,started:false,with:o};o.life.act={k,a,t:a.dur+6,started:false,with:e};e.life.last=k;
    e.goal={p:pa,then:()=>meet(e,o,k)};o.goal={p:pb,then:()=>meet(o,e,k)}}
  function meet(e,o,k){const L=e.life;if(!L.act)return;L.act.started=true;L.act.t=L.act.a.dur;e.stop=L.act.a.dur;e.lookAt=o;
    if(!(o.life.act&&o.life.act.started))return;/* beide da → Gespräch */conversation(e,o,k)}
  function relOf(e,o){const r=e.life.rel;return r[o.d.id]||0}
  function addRelKI(e,o,n){e.life.rel[o.d.id]=Math.max(-50,Math.min(100,relOf(e,o)+n));o.life.rel[e.d.id]=Math.max(-50,Math.min(100,relOf(o,e)+n))}
  function conversation(e,o,k){let i=0;const steps=k==='fangen'?0:5;const clash=(e.life.emo==='wuetend'||o.life.emo==='wuetend')&&Math.random()<.5;
    if(k==='fangen'){e.stop=0;o.stop=0;const run=o;run.life.flee=6;e.goal={ent:run,p:run.p};setTimeout(()=>{doEmote(e,'freude',true);doEmote(o,'lachen',true);addRelKI(e,o,6);end2()},6000);return}
    const iv=setInterval(()=>{if(!e.life.act||!o.life.act){clearInterval(iv);return}const sp=i%2?o:e;const ls=i%2?e:o;
      const topic=pick(TOPICS);GAME.say(sp,'icon:'+topic,1.7,true);if(sp.g.visible&&dU(sp.p,GAME.me.p)<12)SND.voice&&SND.voice(pick(['blabla bla','hmm ja ja','oh wirklich?','haha na klar','weisst du was']),Object.assign({},GAME.voiceFor(sp.d),{mood:EMO[sp.life.emo].voice,vol:.5}));
      if(clash&&i===2){doEmote(sp,'wuetend',true);setTimeout(()=>doEmote(ls,'traurig',true),600);addRelKI(e,o,-10);moodlet(ls,'traurig',1.2,60,'Streit mit '+sp.d.name)}
      else if(i===3){const good=Math.random()<.75;if(good){doEmote(ls,pick(['lachen','herz','freude']),true);addRelKI(e,o,5);moodlet(e,'froh',1,60,'gutes Gespräch');moodlet(o,'froh',1,60,'gutes Gespräch')}else{doEmote(ls,'denken',true)}}
      if(++i>steps){clearInterval(iv);end2()}},1500);
    function end2(){logDay(e,(clash?'hat sich mit ':'hat mit ')+o.d.name+(clash?' gestritten':' geplaudert'));logDay(o,(clash?'hat sich mit ':'hat mit ')+e.d.name+(clash?' gestritten':' geplaudert'));finish(e);finish(o);e.lookAt=null;o.lookAt=null}}
  /* ---------- Wünsche / Bitten (Animal Crossing) ---------- */
  function makeWant(e){const L=e.life;const pool={natur:['blume_item','kiesel','ast'],fitness:['apfel','kokosnuss'],spiel:['muschel','kiefernzapfen'],bildung:['schneckenhaus','seeglas'],musik:['muschel','feder'],kunst:['blatt_herbst','feder','seeglas'],angeln:['apfel','beeren']}[L.hobby]||['apfel'];
    const cand=pool.concat(['apfel','beeren','champignon','muschel','kiesel']).filter(id=>ITEMS.some(i=>i.id===id));const id=pick(cand);L.want={id,since:Date.now()};save(e);return L.want}
  /* ---------- Schritt je Frame ---------- */
  function tick(e,dt,t){const L=e.life||makeLife(e);const dec=dt*(V_()&&GAME.mode==='outdoor'?1:.3);
    if(!L.ok){L.traits=L.traits.map((t,i)=>TRAITS[t]?t:['froehlich','neugierig'][i%2]);if(!HOBBIES[L.hobby])L.hobby=Object.keys(HOBBIES)[0];L.ok=1}
    for(const k in NEEDS){let m=1;for(const tr of L.traits){const d=(TRAITS[tr]||{}).dec;if(d&&d[k])m*=d[k]}if(L.act&&L.act.started&&L.act.a.ad[k]>0)continue;L.needs[k]=Math.max(0,L.needs[k]-NEEDS[k].dec*m*dec*(e.sleeping?.2:1))}
    for(const m of L.moodlets)m.t-=dt;L.moodlets=L.moodlets.filter(m=>m.t>0);L.emoT+=dt;
    L.evalT=(L.evalT||0)-dt;if(L.evalT<=0){L.evalT=2;evalEmo(e)}
    if(L.act){if(L.act.started){L.act.t-=dt;L.act.a.tick&&L.act.a.tick(e,t);if(L.act.t<=0)finish(e)}else{L.act.wait=(L.act.wait||0)+dt;if(L.act.wait>40){L.act=null;e.goal=null}}}
    if(L.flee>0){L.flee-=dt;const me=GAME.me;const ch=[...GAME.ents.values()].find(o=>o.goal&&o.goal.ent===e);if(ch){const away=GAME.tangentTo(e.p,e.p.clone().sub(ch.p));e.goal={p:e.p.clone().addScaledVector(away,2/R()).normalize()}}}
    /* Sprechblasen mit Gedanken ab und zu */
    L.iconT-=dt;if(L.iconT<=0){L.iconT=8+Math.random()*10;if(e.g.visible&&!L.act&&!e.talking){const low=Object.entries(L.needs).sort((a,b)=>a[1]-b[1])[0];GAME.say(e,'icon:'+(low[1]<35?NEEDS[low[0]].i:EMO[L.emo].i),1.8,true)}}
    /* Wunsch entsteht manchmal */if(!L.want&&Math.random()<dt/400)makeWant(e)}
  /* Haltung, Tempo nach Emotion (poseEnt ruft das nach lookAt auf) */
  function pose(e,t){const L=e.life;if(!L)return;const E=EMO[L.emo]||EMO.ausgeglichen;const moving=e.speed>.1;
    if(e.sleeping){e.g.rotateZ(.3);e.g.position.addScaledVector(e.p,-.15);if(Math.random()<.01)GAME.W.fx(e.p,'funke',1);return}
    if(E.slump)e.g.rotateX(E.slump*(moving?.6:1));if(E.chest)e.g.rotateX(E.chest);if(E.shake)e.g.rotateZ(Math.sin(t*40)*E.shake);
    if(E.bounce&&moving)e.g.position.addScaledVector(e.p,Math.abs(Math.sin(t*8+e.phase))*E.bounce);
    if(L.emo==='wuetend'&&Math.random()<.01)GAME.W.fx(e.p,'dampf',3);if(L.emo==='inspiriert'&&Math.random()<.02)GAME.W.fx(e.p,'funke',2)}
  function speedMul(e){const L=e.life;if(!L)return 1;let m=(EMO[L.emo]||EMO.ausgeglichen).spd;if(L.act&&L.act.a.fast)m*=L.act.a.fast;if(L.flee>0)m*=2;return m}
  function status(e){const L=e.life;if(!L)return'';return L.act?L.act.a.n:(e.goal?'ist unterwegs':'schaut sich um')}
  /* ================= Soziales Menü mit der Spielfigur ================= */
  function bar(v,col){const b=el('div','nbar');const i=el('i');i.style.width=Math.max(2,Math.min(100,v))+'%';i.style.background=col||(v<25?'#E8505B':v<55?'#F7B84B':'#6BCB5A');b.append(i);return b}
  async function interact(e){const me=GAME.me;const L=e.life||makeLife(e);e.talking=true;const old=e.dir.clone();e.lookAt=me;e.stop=99;me.dir.copy(GAME.tangentTo(me.p,e.p.clone().sub(me.p)));
    if(L.act&&!L.act.with){L.act=null}const voice=()=>Object.assign({},GAME.voiceFor(e.d),{mood:EMO[L.emo].voice});const nm=e.d.name||'Namenlos';SAVE.stats.talks++;
    const col='#'+new THREE.Color(SKIN_COLORS[e.d.body.color]||'#8C6FE0').getHexString();
    const first=[pick(PERS[L.pers].hi)+' '+L.catch+'!'];if(L.emo!=='ausgeglichen')first.push(`(${nm} ist gerade ${EMO[L.emo].n}.)`);
    const LG=e.d.native&&typeof LANG!=='undefined'&&LANG.has(GAME.G.id);if(LG){first[0]=LANG.garble(GAME.G.id,first[0],true);const f=LANG.frac(GAME.G.id);first.push(f<.15?`(Du verstehst kaum etwas. An Wortsteinen und Schildern lernst du ${LANG.STYLE[GAME.G.id].n}.)`:f<.5?'(Du verstehst schon einiges – '+nm+' freut sich, dass du es versuchst.)':'('+nm+' strahlt: Du sprichst fast fliessend '+LANG.STYLE[GAME.G.id].n+'!)');
      if(Math.random()<.3){const w=LANG.learn(GAME.G.id);if(w)first.push(nm+' bringt dir ein Wort bei: <b class="lw">'+LANG.alien(GAME.G.id,w)+'</b> = '+w+'.')}}
    await UI.talk(nm,first,{voice:voice(),color:col,html:LG});
    let open=true;while(open&&!UI.anyOpen()){const choice=await menu(e);if(!choice){open=false;break}const res=await choice(e,voice,nm,col);if(res==='end')open=false}
    persist();e.talking=false;e.stop=1.5;e.lookAt=null;e.dir.copy(old)}
  function menu(e){return new Promise(res=>{const L=e.life;const nm=e.d.name||'Namenlos';const w=UI.win(nm,{size:'narrow',onClose:()=>res(null)});
    const head=el('div','lifehead');const img=UI.creatureThumb(e.d);img.className='lifeimg';const info=el('div');const emo=EMO[L.emo];
    const mood=el('div','mood');mood.innerHTML=`<span class="dia" style="background:${emo.col}"></span>`+ICON(emo.i)+' <b>'+emo.n+'</b>';const why=L.moodlets.slice(-1)[0];
    info.append(mood,el('div','sub',(why?'weil: '+why.why+' · ':'')+'Tut gerade: '+status(e)),el('div','sub','Charakter: '+L.traits.map(t=>TRAITS[t].n).join(', ')+' · Hobby: '+HOBBIES[L.hobby].n+' · Geburtstag: '+L.birthday));
    const rv=relP(e);const rl=el('div','rel');rl.append(el('span',null,'Beziehung: '+relLabel(rv)),bar(rv+50>0?(rv+50)/1.5:0,rv<0?'#E8505B':'#6BCB5A'));info.append(rl);head.append(img,info);w.body.append(head);
    const nd=el('div','needs');for(const k in NEEDS){const r=el('div','need');const lb=el('span');lb.innerHTML=ICON(NEEDS[k].i)+' '+NEEDS[k].n;r.append(lb,bar(L.needs[k]));nd.append(r)}w.body.append(nd);
    if(L.want){const it=ITEMS.find(i=>i.id===L.want.id);if(it)w.body.append(el('div','note',`${nm} wünscht sich: ${it.n}. Schenk es, um eine Belohnung zu bekommen!`))}
    const cats=[['Freundlich','heart',[['Plaudern',chat],['Kompliment machen',compliment],['Über '+HOBBIES[L.hobby].n+' reden',hobbyTalk],['Nach dem Tag fragen',askDay],['Tratschen',gossip],['Umarmen',hug,25]]],
      ['Lustig','laugh',[['Witz erzählen',joke],['Grimasse schneiden',face],['Kitzeln',tickle,35]]],
      ['Frech','angry',[['Necken',tease],['Beleidigen',insult]]],
      ['Zusammen','people',[['Zusammen tanzen',danceTogether],['Fangen spielen',tag],['Mitkommen?',follow,15],['Zusammen singen',singTogether]]],
      ['Mehr','star',[['Geschenk geben',gift],['Hast du einen Wunsch?',askWant],['Karte ansehen',card],...(e.kind==='bot'&&!SAVE.friends.some(f=>f.pid===e.d.id)?[['Freund:in werden',befriend]]:[]),['Tschüss',bye]]]];
    for(const[cn,ic,list]of cats){const box=el('div','scat');const h=el('div','scat-h');h.innerHTML=ICON(ic)+' '+cn;box.append(h);const g=el('div','scat-b');
      for(const[label,fn,need]of list){const b=btn(label,'small');if(need&&relP(e)<need){b.disabled=true;b.title='Erst ab mehr Freundschaft'}b.onclick=()=>{res(fn);w.close()};g.append(b)}box.append(g);w.body.append(box)}
    w.foot.append(btn('Fertig',null,()=>{w.close()}))})}
  const talk=(e,voice,nm,col,lines,o)=>{const L=e.d.native&&typeof LANG!=='undefined'&&LANG.has(GAME.G.id);return UI.talk(nm,L?lines.map(l=>LANG.garble(GAME.G.id,l,true)):lines,Object.assign({voice:voice(),color:col,html:L},o||{}))};
  function react(e,good,big){const d=big?(good?6:-8):(good?3:-4);addRel(e,d);UI.toast((d>0?'+':'')+d+' Beziehung');if(good){doEmote(e,pick(['freude','lachen','herz']),true);moodlet(e,'froh',1,60,'nett von '+(SAVE.nick||'dir'))}else{doEmote(e,pick(['wuetend','traurig']),true);moodlet(e,good===false?'wuetend':'traurig',1.2,60,'Ärger mit '+(SAVE.nick||'dir'))}}
  const mod=e=>{const L=e.life;let m=0;if(['froh','verspielt','energie'].includes(L.emo))m+=.15;if(['wuetend','muede','traurig'].includes(L.emo))m-=.2;m+=relP(e)/300;return m};
  async function chat(e,voice,nm,col){doEmote(GAME.me,'winken',true);const tp=pick(TOPICS);const ok=Math.random()<.7+mod(e);e.life.needs.social=Math.min(100,e.life.needs.social+25);
    await talk(e,voice,nm,col,[`Weisst du, was ich an ${TOPIC_TXT[tp]} mag? `+pick(TALK.small),ok?'Hihi, mit dir kann man gut reden!':'Hmm… ich bin gerade nicht so in Plauderlaune.']);react(e,ok)}
  async function compliment(e,voice,nm,col){const ok=Math.random()<.75+mod(e)+(e.life.pers==='schick'?.2:0);await talk(e,voice,nm,col,['Du sagst: „'+pick(COMPL)+'“',ok?'Oh! Danke, das ist lieb von dir!':'…das klang ein bisschen komisch, aber okay.']);react(e,ok);if(ok)moodlet(e,'stolz',1.4,90,'Kompliment')}
  async function hobbyTalk(e,voice,nm,col){const H=HOBBIES[e.life.hobby];await talk(e,voice,nm,col,[`${H.n}? Mein Lieblingsthema! Am liebsten ${pick(H.acts.map(k=>A[k].n.replace(/^\w+ /,'')))}.`,'Wir sollten das mal zusammen machen!']);react(e,true,true)}
  async function askDay(e,voice,nm,col){const log=e.life.log.slice(-4);await talk(e,voice,nm,col,log.length?['Heute? Also…',...log.map(x=>x.replace(/^(\d\d:\d\d) /,'Um $1 ')+'.'),'Und du so?']:['Ich bin gerade erst aufgewacht. Noch nichts passiert!']);react(e,true)}
  async function gossip(e,voice,nm,col){const others=[...GAME.ents.values()].filter(o=>o!==e&&o.life&&o.kind!=='me');if(!others.length){await talk(e,voice,nm,col,['Hier ist ja niemand, über den man reden könnte!']);return}const o=pick(others);
    const r=relOf(e,o);await talk(e,voice,nm,col,[`Hast du ${o.d.name} gesehen? ${o.d.name} ist gerade ${EMO[o.life.emo].n} und ${status(o)}.`,r>10?`Wir verstehen uns richtig gut!`:r<-5?`Wir hatten neulich Streit… hmpf.`:`Ich kenne ${o.d.name} noch nicht so gut.`]);react(e,Math.random()<.6+mod(e))}
  async function hug(e,voice,nm,col){GAME.me.act=1;e.act=1;GAME.W.fx(e.p,'herz',10);await talk(e,voice,nm,col,['*drückt dich ganz fest*','Das tat gut!']);react(e,true,true)}
  async function joke(e,voice,nm,col){const j=pick(JOKES);const ok=Math.random()<.6+mod(e)+(has(e.life,'verspielt')?.2:0);await talk(e,voice,nm,col,['Du erzählst: '+j,ok?'HAHAHA! Der ist gut!':'…den kannte ich schon.']);react(e,ok);if(ok){doEmote(e,'lachen',true);e.life.needs.fun=Math.min(100,e.life.needs.fun+25)}else{moodlet(GAME.me.life?GAME.me:e,'peinlich',.5,20,'Witz')}}
  async function face(e,voice,nm,col){doEmote(GAME.me,'drehen');const ok=Math.random()<.65+mod(e);await talk(e,voice,nm,col,[ok?'Pfff… hahaha! Was war DAS denn?':'Ähm. Alles okay bei dir?']);react(e,ok)}
  async function tickle(e,voice,nm,col){e.jump=.8;await talk(e,voice,nm,col,['Hihihi! Hör auf! Hahaha!']);react(e,true,true);e.life.needs.fun=Math.min(100,e.life.needs.fun+30)}
  async function tease(e,voice,nm,col){const ok=has(e.life,'verspielt')&&Math.random()<.5;await talk(e,voice,nm,col,[ok?'Na warte, dich krieg ich!':'Hey! Das fand ich jetzt nicht witzig.']);react(e,ok?true:false)}
  async function insult(e,voice,nm,col){await talk(e,voice,nm,col,[has(e.life,'hitzkopf')?'WAS?! Das sag ich allen!':'…das tut weh. Warum sagst du sowas?']);react(e,false,true);logDay(e,'wurde von '+(SAVE.nick||'jemandem')+' beleidigt');return'end'}
  async function danceTogether(e,voice,nm,col){e.dance=8;GAME.me.dance=8;SND.music('shop');setTimeout(()=>SND.music(V_().def.music),9000);moodlet(e,'verspielt',1.4,90,'mit dir getanzt');addRel(e,5);logDay(e,'hat mit '+(SAVE.nick||'dir')+' getanzt');UI.toast('Ihr tanzt zusammen! +5 Beziehung');return'end'}
  async function singTogether(e,voice,nm,col){SND.voice&&SND.voice('la la la laa lalaa',voice());GAME.W.fx(e.p,'note',8);await talk(e,voice,nm,col,['La-la-laaa! Du hast eine schöne Stimme!']);react(e,true)}
  async function tag(e,voice,nm,col){e.life.flee=0;const me=GAME.me;UI.toast('Fangen! Lauf mit Shift hinter '+nm+' her (20 s)');e.talking=false;e.stop=0;const t0=Date.now();
    e.life.flee=20;const chase={ent:e};const iv=setInterval(()=>{if(dU(e.p,me.p)<1.3){clearInterval(iv);e.life.flee=0;doEmote(e,'lachen',true);addRel(e,6);money(40);SND.jingle('j_success');UI.toast('Gefangen! +6 Beziehung, 40 Taler');logDay(e,'hat mit '+(SAVE.nick||'dir')+' Fangen gespielt')}
      else if(Date.now()-t0>20000){clearInterval(iv);e.life.flee=0;doEmote(e,'freude',true);UI.toast(nm+' war zu schnell!')}else{const away=GAME.tangentTo(e.p,e.p.clone().sub(me.p));e.goal={p:e.p.clone().addScaledVector(away,3/R()).normalize()}}},250);return'end'}
  async function follow(e,voice,nm,col){e.follow=60;await talk(e,voice,nm,col,['Klar, ich komme mit! Wohin gehen wir?']);return'end'}
  async function gift(e,voice,nm,col){const want=e.life.want;const giftable=SAVE.bag.filter(x=>x.kind==='item'||x.kind==='fish'||x.kind==='bug'||x.kind==='furn');if(!giftable.length){await talk(e,voice,nm,col,['Du hast ja gar nichts in der Tasche. Macht nichts!']);return}
    await new Promise(res=>{const w=UI.win('Was schenkst du '+nm+'?',{size:'narrow',onClose:res});const gr=el('div','grid');giftable.forEach(it=>{const c=el('button','card');c.type='button';c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)+(want&&want.id===it.id?' (Wunsch!)':'')),el('span','sub','×'+it.n));
      c.onclick=async()=>{w.close();bagTake(it.kind,it.id,1);SND.jingle('j_success');GAME.W.fx(e.p,'herz',8);
        if(want&&want.id===it.id){e.life.want=null;save(e);addRel(e,15);const amt=300+Math.floor(Math.random()*4)*100;money(amt);await talk(e,voice,nm,col,['WAS?! Genau das habe ich mir gewünscht!','Hier, als Dankeschön: '+amt+' Taler!']);moodlet(e,'froh',2,180,'Wunsch erfüllt');logDay(e,'hat von '+(SAVE.nick||'dir')+' ein Wunschgeschenk bekommen')}
        else{addRel(e,6);await talk(e,voice,nm,col,[pick(TALK.gift)]);if(Math.random()<.35){const f=pick(FURN.filter(f=>f.planet===V_().id||f.planet==='alle'));if(f&&bagAdd('furn',f.id))await talk(e,voice,nm,col,[pick(TALK.giveback),`(Du bekommst: ${f.n})`])}}res()};gr.append(c)});w.body.append(gr)})}
  async function askWant(e,voice,nm,col){const w=e.life.want||makeWant(e);const it=ITEMS.find(i=>i.id===w.id);await talk(e,voice,nm,col,it?[`Ehrlich gesagt… ich hätte so gern ${it.n}.`,'Wenn du so etwas findest, bring es mir! Ich belohne dich auch.']:['Mir fehlt gerade nichts!'])}
  async function befriend(e,voice,nm,col){SAVE.friends.push({pid:e.d.id,nick:nm,bot:true});persist();SND.play('j_success');doEmote(e,'herz',true);addRel(e,10);SOCIAL.addMsg('fr','System',`${nm} (KI) ist jetzt in deiner Freundesliste.`,'sys');await talk(e,voice,nm,col,['Juhu! Freund:innen! '+e.life.catch+'!'])}
  async function card(e){GAME.showCard(e.d);return'end'}
  async function bye(e,voice,nm,col){await talk(e,voice,nm,col,[pick(TALK.bye).replace('{p}',SAVE.nick||'du')+' '+e.life.catch+'!']);return'end'}
  /* Folgen nach „Mitkommen?“ */
  function stepFollow(e,dt){if(!e.follow)return false;e.follow-=dt;const me=GAME.me;if(e.follow<=0||!me){e.follow=0;GAME.say(e,'Tschüss!',2);return false}const d=dU(e.p,me.p);if(d>2.2)e.goal={p:me.p.clone()};else{e.goal=null}if(me.dance>0)e.dance=Math.max(e.dance,1);return true}
  return{NEEDS,TRAITS,EMO,A,makeLife,think,tick,pose,speedMul,interact,status,stepFollow,get emoOf(){return e=>e.life&&EMO[e.life.emo]}};
})();
