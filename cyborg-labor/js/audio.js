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
    if(wantTrack)music(wantTrack)}
  function load(name){if(buf[name]||loading[name])return loading[name];if(!ctx)return null;
    loading[name]=fetch('audio/'+name+'.mp3').then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(a=>new Promise((res,rej)=>ctx.decodeAudioData(a,res,rej))).then(b=>{buf[name]=b;return b}).catch(()=>null);return loading[name]}
  function resolve(name){if(GROUPS[name])return name+Math.floor(Math.random()*GROUPS[name]);return name}
  /* play('coins',{vol,rate,pan}) */
  function play(name,o){if(!ctx||!st.on)return;o=o||{};const n=resolve(name);const b=buf[n];if(!b){load(n);return}
    const src=ctx.createBufferSource();src.buffer=b;src.playbackRate.value=(o.rate||1)*(o.jitter?1+(Math.random()-.5)*o.jitter:1);
    const g=ctx.createGain();g.gain.value=o.vol??1;let node=src;node.connect(g);
    const bus=o.bus==='ui'||(!o.bus&&UI_SOUNDS.has(name))?uiBus:o.bus==='amb'?ambBus:sfxBus;if(o.pan&&ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));g.connect(p);p.connect(bus)}else g.connect(bus);
    src.start();return src}
  function music(track){wantTrack=track;if(!ctx)return;
    /* Klang 2.0: Musik wird im Browser erzeugt (music2.js); jeder Planet hat sein eigenes Lied */
    if(typeof MUSIC2!=='undefined'&&st.gen!==false){const nm=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.id)||'';const key=track+'|'+nm;if(key===curTrack)return;curTrack=key;
      const old=curMusic;if(old){const t=ctx.currentTime;old.g.gain.cancelScheduledValues(t);old.g.gain.setValueAtTime(old.g.gain.value,t);old.g.gain.linearRampToValueAtTime(0,t+1.2);setTimeout(()=>{try{old.src.stop()}catch(e){}},1400)}curMusic=null;
      MUSIC2.play(track,track==='lab'||track==='home'||track==='museum'?track:nm||track);return}
    if(track===curTrack)return;curTrack=track;const file=MUSIC[track]||track;
    const old=curMusic;if(old){const t=ctx.currentTime;old.g.gain.cancelScheduledValues(t);old.g.gain.setValueAtTime(old.g.gain.value,t);old.g.gain.linearRampToValueAtTime(0,t+1.6);setTimeout(()=>{try{old.src.stop()}catch(e){}},1800)}
    curMusic=null;if(!track||track==='stille')return;
    Promise.resolve(load(file)).then(b=>{if(!b||curTrack!==track)return;const src=ctx.createBufferSource();src.buffer=b;src.loop=true;const g=ctx.createGain();g.gain.value=0;src.connect(g);g.connect(musicBus);src.start();
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
  return{init,play,music,jingle,duck,voice,ambience,set,get st(){return st},get ready(){return!!ctx},get ctx(){return ctx},get musicBus(){return musicBus},load};
})();
