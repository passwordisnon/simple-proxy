/* =====================================================================
   CYBORG-LABOR · audio.js
   Musik (Überblendung je Ort), Geräusche (Kenney CC0), Tier-Stimmen
   (Animalese-Synthese) und Umgebungsrauschen (Wind, Meer).
   ===================================================================== */
const SND=(()=>{
  const FILES={click:1,select:1,open:1,close:1,confirm:1,error:1,pickup:1,place:1,plop:1,bite:1,reel:1,chat:1,brush:1,toggle:1,sparkle:1,whoosh:1,talk:1,
    coins:1,coins2:1,door_open:1,door_close:1,page:1,cloth:1,chop:1,creak:1,build:1,soft:1,bell:1,glass:1,metal:1,powerup:1,pep:1,
    j_catch:1,j_catch_big:1,j_success:1,j_buy:1,j_museum:1,j_release:1,j_fail:1};
  for(let i=0;i<5;i++){FILES['step_grass'+i]=1;FILES['step_wood'+i]=1}
  const GROUPS={step_grass:5,step_wood:5};
  /* Klang-Fundus: jeder Name hat einen Pool aus Varianten (alte Dateien plus alle Kenney-Klänge in audio/sfx).
     Präfixe werden gegen SFXLIST (js/sfx-list.js) aufgelöst, so steckt jede Datei in genau einem Pool. */
  const PRE={click:['ui_click','ui2_click','ui2_mouseclick','ui2_mouserelease'],select:['ui_select','ui2_rollover'],open:['ui_open','ui_maximize'],close:['ui_close','ui_minimize','ui_back'],
    confirm:['ui_confirmation','ui_bong'],toggle:['ui_toggle','ui_switch','ui2_switch'],error:['ui_error'],page:['rpg_bookFlip','ui_scroll'],pep:['dig_pepSound'],powerup:['dig_powerUp'],
    whoosh:['dig_phaseJump'],metal:['imp_impactMetal_light','imp_impactMetal_medium','rpg_metalClick','rpg_metalLatch'],chop:['rpg_chop','imp_impactWood_light','imp_impactWood_medium'],
    coins:['rpg_handleCoins'],cloth:['rpg_cloth','rpg_clothBelt','rpg_beltHandle'],door_open:['rpg_doorOpen'],door_close:['rpg_doorClose'],door:['rpg_doorOpen'],creak:['rpg_creak'],
    glass:['ui_glass','imp_impactGlass_light'],bell:['imp_impactBell_heavy'],build:['imp_impactPlank_medium','imp_impactWood_heavy'],place:['ui_drop'],soft:['imp_impactSoft_medium'],pop:['ui_pluck','ui_tick'],
    thunder:['imp_impactPunch_heavy'],step_grass:['imp_footstep_grass'],step_wood:['imp_footstep_wood','rpg_footstep'],step_snow:['imp_footstep_snow'],step_concrete:['imp_footstep_concrete'],step_carpet:['imp_footstep_carpet'],
    hit_rock:['imp_impactMining'],hit_metal:['imp_impactMetal_heavy'],hit_glass:['imp_impactGlass_medium','imp_impactGlass_heavy'],hit_plate:['imp_impactPlate_light','imp_impactPlate_medium','imp_impactPlate_heavy'],hit_tin:['imp_impactTin_medium'],hit_wood:['imp_impactWood_heavy'],
    land:['imp_impactSoft_heavy'],kick:['imp_impactPunch_medium','imp_impactGeneric_light'],book_open:['rpg_bookOpen'],book_close:['rpg_bookClose'],book_place:['rpg_bookPlace'],knife:['rpg_knifeSlice','rpg_drawKnife'],
    pot:['rpg_metalPot'],leather:['rpg_dropLeather','rpg_handleSmallLeather'],glitch:['ui_glitch','ui_scratch','dig_zap','dig_zapTwoTone'],laser:['dig_laser'],space:['dig_spaceTrash'],
    beep:['dig_tone','dig_twoTone','dig_threeTone','dig_lowThreeTone'],rise:['dig_highUp','dig_phaserUp','dig_zapThreeToneUp'],fall:['dig_highDown','dig_lowDown','dig_phaserDown','dig_zapThreeToneDown','dig_lowRandom'],question:['ui_question']};
  const POOL={};const LIST=typeof SFXLIST!=='undefined'?SFXLIST:[];
  for(const[k,pres]of Object.entries(PRE)){const L=POOL[k]=[];if(FILES[k])L.push(k);for(let i=0;i<5;i++)if(FILES[k+i])L.push(k+i);if(k==='coins'&&FILES.coins2)L.push('coins2');
    for(const pr of pres)for(const f of LIST)if(f===pr||(f.startsWith(pr)&&/^[_\d]*$/.test(f.slice(pr.length))))L.push('sfx/'+f)}
  /* Jingles: je Planetengruppe eine Familie (Kenney Music Jingles), je Anlass eigene Nummern */
  const JFAM={kompost:'pizzicato',schrott:'pizzicato',pilz:'pizzicato',heim:'pizzicato',urzeit:'hit',dinofabrik:'hit',bauklotz:'hit',pluesch:'hit',bernstein:'hit',metro:'sax',kaufhaus:'sax',magnetbahn:'sax',nachtmarkt:'sax',
    dschungel:'steel',tiefsee:'steel',korallen:'steel',riesengarten:'steel',honigwabe:'steel',wolkenarchipel:'pizzicato',wetterwerk:'pizzicato',frost:'pizzicato',wueste:'steel',origami:'pizzicato',
    klang:'sax',bibliothek:'pizzicato',uhrwerk:'pizzicato',schoner:'8bit',neonarkade:'8bit',funkturm:'8bit',rechenzentrum:'8bit',pixelmond:'8bit',kassette:'sax',keim:'pizzicato',gluehwurm:'steel',drachen:'hit'};
  const JIDX={j_catch:[0,1,2],j_catch_big:[3,4,5],j_success:[6,7,8],j_buy:[9,10],j_fail:[11,12],j_museum:[13,14],j_release:[15,16]};
  function jingleFile(name){const ix=JIDX[name];if(!ix)return null;const id=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.id)||'kompost';const fam=JFAM[id]||'pizzicato';
    const f='jin_'+fam+'_'+String(ix[Math.floor(Math.random()*ix.length)]).padStart(2,'0');return LIST.includes(f)?'sfx/'+f:null}
  const MUSIC={world:'mus_world',lab:'mus_lab',shop:'mus_shop',home:'mus_home',museum:'mus_museum',town:'mus_town'};
  let ctx=null,master,musicBus,sfxBus,voiceBus,ambBus,uiBus;
  /* Bus-Zuordnung: Menü-Klänge laufen getrennt von Werkzeug-/Weltgeräuschen (eigener Regler, eigene Dynamik) */
  const UI_SOUNDS=new Set(['click','select','open','close','confirm','toggle','page','pep','error','soft']);const buf={};const loading={};
  let st={on:true,music:.55,sfx:.8,voice:.7};try{Object.assign(st,JSON.parse(localStorage.getItem('cyborg-labor-audio')||'{}'))}catch(e){}
  const save=()=>{try{localStorage.setItem('cyborg-labor-audio',JSON.stringify(st))}catch(e){}};
  let curMusic=null,curTrack='',wantTrack='',amb={};
  function init(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();
    master=ctx.createGain();master.gain.value=st.on?1:0;master.connect(ctx.destination);
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.connect(master);
    musicBus=ctx.createGain();musicBus.gain.value=st.music;musicBus.connect(comp);
    sfxBus=ctx.createGain();sfxBus.gain.value=st.sfx;sfxBus.connect(comp);
    voiceBus=ctx.createGain();voiceBus.gain.value=st.voice;voiceBus.connect(comp);
    ambBus=ctx.createGain();ambBus.gain.value=st.sfx*.6;ambBus.connect(comp);
    uiBus=ctx.createGain();uiBus.gain.value=st.ui??.7;const uiHp=ctx.createBiquadFilter();uiHp.type='highpass';uiHp.frequency.value=180;uiBus.connect(uiHp);uiHp.connect(master);
    ['click','select','open','close','confirm','pickup','place','step_grass0','step_grass1','step_grass2','coins','chat','talk'].forEach(load);
    if(wantTrack)music(wantTrack);
    /* Tag/Nacht: alle 20 s prüfen, ob ein anderes Stück passt (gleiches Stück läuft einfach weiter) */setInterval(()=>{if(wantTrack==='world'||wantTrack==='town')music(wantTrack)},20000)}
  /* Klang-Bündel audio/sfx.bin: einmal laden, je Klang ein Ausschnitt */
  let bundle=null;const getBundle=()=>bundle||(bundle=fetch('audio/sfx.bin').then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}));
  function load(name){if(buf[name]||loading[name])return loading[name];if(!ctx)return null;
    if(name.startsWith('sfx/')&&typeof SFXINDEX!=='undefined'){const ix=SFXINDEX[name.slice(4)];if(!ix)return null;
      return loading[name]=getBundle().then(a=>new Promise((res,rej)=>ctx.decodeAudioData(a.slice(ix[0],ix[0]+ix[1]),res,rej))).then(b=>{buf[name]=b;return b}).catch(()=>null)}
    loading[name]=fetch('audio/'+name+'.mp3').then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(a=>new Promise((res,rej)=>ctx.decodeAudioData(a,res,rej))).then(b=>{buf[name]=b;return b}).catch(()=>null);return loading[name]}
  function resolve(name){const j=jingleFile(name);if(j)return j;const P=POOL[name];if(P&&P.length)return P[Math.floor(Math.random()*P.length)];if(GROUPS[name])return name+Math.floor(Math.random()*GROUPS[name]);return name}
  /* play('coins',{vol,rate,pan}) */
  function play(name,o){if(!ctx||!st.on)return;o=o||{};const n=resolve(name);const b=buf[n];if(!b){load(n);return}
    const src=ctx.createBufferSource();src.buffer=b;src.playbackRate.value=(o.rate||1)*(o.jitter?1+(Math.random()-.5)*o.jitter:1);
    const g=ctx.createGain();g.gain.value=o.vol??1;let node=src;node.connect(g);
    const bus=o.bus==='ui'||(!o.bus&&UI_SOUNDS.has(name))?uiBus:o.bus==='amb'?ambBus:sfxBus;if(o.pan&&ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));g.connect(p);p.connect(bus)}else g.connect(bus);
    src.start();return src}
  /* Echte Musik (CC0, audio/music, Quellen in docs/LIZENZEN.md): ein Stück je Planet, Mond und Ort */
  const TRACKS=new Set(['bar','bauklotz','bernstein','bibliothek','countryside','dinofabrik','drachen','dschungel','finale','fishing','frost','funkturm','gluehwurm','heim','home','honigwabe','kassette','kaufhaus','keim','kern','klang','kompost','korallen','lab','magnetbahn','metro','mine','museum','nachtmarkt','neonarkade','oceanside','origami','pilz','pixelmond','pluesch','race','rechenzentrum','riesengarten','riss','schoner','schrott','shop','space','station','tiefsee','title','tunnel','uhrwerk','urzeit','wetterwerk','wolkenarchipel','wueste']);
  function fileFor(track){const G=typeof GAME!=='undefined'&&GAME.G;const id=G&&G.id;const ik=typeof INTERIOR!=='undefined'&&GAME.mode==='interior'?INTERIOR.kind:'';
    const k={lab:'lab',title:'title',museum:'museum',shop:'shop',space:'space',station:'station',race:'race',tunnel:'tunnel',kern:'kern',riss:'riss',mine:'mine',fishing:'fishing',home:'home',bar:'bar'}[track];
    if(k&&TRACKS.has(k))return'music/m_'+k;
    if(track==='world'||track==='town'){const h=typeof GAMETIME!=='undefined'&&GAMETIME.hour?GAMETIME.hour():12;
      /* nachts ruhigere Stücke: am Meer Wellen-Lofi, sonst Landluft */if(GAME.mode==='outdoor'&&(h>=22||h<5)&&!(G.def&&G.def.mine))return'music/m_'+(['korallen','tiefsee','wolkenarchipel','urzeit'].includes(id)?'oceanside':'countryside');
      if(id&&TRACKS.has(id))return'music/m_'+id;const mo=id&&typeof PLANETS!=='undefined'&&PLANETS[id]&&PLANETS[id].moonOf;if(mo&&TRACKS.has(mo))return'music/m_'+mo;return'music/m_kompost'}
    return MUSIC[track]||null}
  function music(track){wantTrack=track;if(!ctx)return;
    /* Erzeugte Musik (music2.js) nur noch, wenn sie in den Einstellungen gewählt ist */
    if(typeof MUSIC2!=='undefined'&&st.gen===true){const nm=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.id)||'';const key=track+'|'+nm;if(key===curTrack)return;curTrack=key;
      const old=curMusic;if(old){const t=ctx.currentTime;old.g.gain.cancelScheduledValues(t);old.g.gain.setValueAtTime(old.g.gain.value,t);old.g.gain.linearRampToValueAtTime(0,t+1.2);setTimeout(()=>{try{old.src.stop()}catch(e){}},1400)}curMusic=null;
      MUSIC2.play(track,track==='lab'||track==='home'||track==='museum'?track:nm||track);return}
    try{MUSIC2&&MUSIC2.stop()}catch(e){}
    const file=track&&track!=='stille'?fileFor(track):null;const key=file||'';if(key===curTrack)return;curTrack=key;
    const old=curMusic;if(old){const t=ctx.currentTime;old.g.gain.cancelScheduledValues(t);old.g.gain.setValueAtTime(old.g.gain.value,t);old.g.gain.linearRampToValueAtTime(0,t+1.6);setTimeout(()=>{try{old.src.stop()}catch(e){}},1800)}
    curMusic=null;if(!file)return;
    Promise.resolve(load(file)).then(b=>{if(!b||curTrack!==key)return;const src=ctx.createBufferSource();src.buffer=b;src.loop=true;const g=ctx.createGain();g.gain.value=0;src.connect(g);g.connect(musicBus);src.start();
      const t=ctx.currentTime;g.gain.linearRampToValueAtTime(1,t+2);curMusic={src,g}})}
  /* Musik kurz leiser (Jingles, Dialoge) */
  function duck(sec,level){if(!ctx||!curMusic)return;const t=ctx.currentTime;const g=curMusic.g.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(level??.25,t+.15);g.linearRampToValueAtTime(1,t+sec)}
  function jingle(name){duck(2.8,.15);play(name,{vol:.9})}
  /* ---------- Animalese: jede Silbe ein kurzer gefilterter Ton ---------- */
  const VOW='aeiouäöüy';
  const VOICES={
    sanft:{wave:'triangle'},
    robot:{wave:'square',q:6,glide:.02,formant:1.2,vol:.4},
    tief:{wave:'sawtooth',formant:.6,q:3,sub:true,vol:.45,syl:1.15},
    quiek:{wave:'sine',vib:18,vibAmt:.06,formant:1.6,glide:.3,syl:.85},
    blubb:{wave:'sine',filter:'lowpass',formant:.7,q:8,glide:.5,vib:7,vibAmt:.1,vol:.7},
    summ:{wave:'sawtooth',vib:45,vibAmt:.03,formant:1.3,q:4,vol:.35,syl:.9},
    knarz:{wave:'square',formant:.8,q:1.5,glide:.08,vol:.35,sub:true,syl:1.1},
    pieps:{wave:'sine',formant:2,glide:.35,range:18,tail:.6,syl:.8},
    hall:{wave:'triangle',formant:.9,q:1.2,glide:.1,tail:1.4,vib:5,vibAmt:.02,syl:1.2}};
  function voice(text,o){if(!ctx||!st.on)return 0;o=o||{};const base=o.pitch||220;const sp=o.speed||1;let t=ctx.currentTime+.02;const clean=String(text).toLowerCase().replace(/[^a-zäöüß ?!.,]/g,'');
    const step=.062/sp;let n=0;
    for(let i=0;i<clean.length&&n<90;i++){const ch=clean[i];if(ch===' '){t+=step*.6;continue}if('.,!?'.includes(ch)){t+=step*2.2;continue}
      if(i%2===1&&!VOW.includes(ch))continue;n++;
      /* Stimmfarbe je Kopf: robot, tief, quiek, blubb, summ, knarz, sanft, pieps, hall; Stimmung hebt/senkt die Melodie */
      const K=VOICES[o.kind]||VOICES.sanft;const mood=o.mood||0;
      const code=ch.charCodeAt(0);const semi=((code*7)%(K.range||12))-4+(VOW.includes(ch)?3:0)+(clean.endsWith('?')&&i>clean.length-5?5:0)+mood*2;const f=base*Math.pow(2,semi/12);
      const osc=ctx.createOscillator();osc.type=K.wave;const glide=K.glide??.16;osc.frequency.setValueAtTime(f*(1+glide/2),t);osc.frequency.exponentialRampToValueAtTime(f*(1-glide/2)*(mood<0?.9:1),t+step*.9);
      if(K.vib){const l=ctx.createOscillator();l.frequency.value=K.vib;const lg=ctx.createGain();lg.gain.value=f*(K.vibAmt||.04);l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+step)}
      const bp=ctx.createBiquadFilter();bp.type=K.filter||'bandpass';bp.frequency.value=(VOW.includes(ch)?900+((code*37)%900):1800)*(K.formant||1);bp.Q.value=K.q||2.2;
      const g=ctx.createGain();const vol=(K.vol||.55)*(o.vol||1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+step*(K.tail||.95));
      osc.connect(bp);bp.connect(g);g.connect(voiceBus);if(K.sub){const o2=ctx.createOscillator();o2.type='sine';o2.frequency.value=f*.5;const g2=ctx.createGain();g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(vol*.5,t+.01);g2.gain.exponentialRampToValueAtTime(.001,t+step*.9);o2.connect(g2);g2.connect(voiceBus);o2.start(t);o2.stop(t+step)}
      osc.start(t);osc.stop(t+step);t+=step*(K.syl||1)}
    return t-ctx.currentTime}
  /* ---------- Umgebung: Rauschen durch Filter ---------- */
  let noiseBuf=null;function noise(){if(noiseBuf)return noiseBuf;const n=ctx.sampleRate*3;noiseBuf=ctx.createBuffer(1,n,ctx.sampleRate);const d=noiseBuf.getChannelData(0);let b=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;b=(b*.97+w*.03);d[i]=b*6}return noiseBuf}
  function ambience(kind,level){if(!ctx)return;let a=amb[kind];if(!a){const src=ctx.createBufferSource();src.buffer=noise();src.loop=true;const f=ctx.createBiquadFilter();f.type=kind==='meer'?'lowpass':'bandpass';f.frequency.value=kind==='meer'?520:380;f.Q.value=.7;
      const g=ctx.createGain();g.gain.value=0;const lfo=ctx.createOscillator();lfo.frequency.value=kind==='meer'?.13:.07;const lg=ctx.createGain();lg.gain.value=kind==='meer'?.35:.2;lfo.connect(lg);lg.connect(g.gain);lfo.start();
      src.connect(f);f.connect(g);g.connect(ambBus);src.start();a=amb[kind]={g,level:0};}
    const t=ctx.currentTime;a.g.gain.setTargetAtTime(Math.max(0,level)*.5,t,.6)}
  function set(k,v){st[k]=v;save();if(!ctx)return;if(k==='on')master.gain.setTargetAtTime(v?1:0,ctx.currentTime,.05);if(k==='music')musicBus.gain.value=v;if(k==='sfx'){sfxBus.gain.value=v;ambBus.gain.value=v*.6}if(k==='ui'&&uiBus)uiBus.gain.value=v;if(k==='voice')voiceBus.gain.value=v}
  return{get pools(){return POOL},jingleFile,init,play,music,jingle,duck,voice,ambience,set,get track(){return curTrack},get playing(){return!!curMusic},get st(){return st},get ready(){return!!ctx},get ctx(){return ctx},get musicBus(){return musicBus},load};
})();
