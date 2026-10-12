/* =====================================================================
   CYBORG-LABOR · music2.js
   Klang 2.0: Musik wird im Browser erzeugt (Web Audio), passend zu den
   drei Ebenen. Kokon = Spielzeug-Pop (Bossa, Spielzeugklavier,
   Glockenspiel, Vibraphon, Besen-Schlagzeug). Wired = Breakbeat mit
   FM-Bass. Riss = Brummen, Röhrenpfeifen, rückwärts laufende Spieldose.
   Die Countdown-Melodie steigt immer wieder auf und erreicht nie ihren
   letzten Ton (erst im Finale). MUSIC2.riss (0..1) lässt die Musik
   zerfallen: Bandschwanken, Verstimmung, Aussetzer, Bit-Reduktion.
   ===================================================================== */
const MUSIC2=(()=>{
  let ctx=null,out=null,crush=null,noiseBuf=null,timer=null,style=null,step=0,nextT=0,seed=1,song=null,riss=0,fade=null;
  const midi=n=>440*Math.pow(2,(n-69)/12);
  function rng(s){let a=s>>>0||1;return()=>{a^=a<<13;a^=a>>>17;a^=a<<5;return(a>>>0)/4294967296}}
  function setup(){if(ctx)return true;if(!SND.ready)return false;ctx=SND.ctx;if(!ctx)return false;
    out=ctx.createGain();out.gain.value=0;
    /* Bit-Reduktion für den Zerfall */crush=ctx.createWaveShaper();setCrush(0);out.connect(crush);crush.connect(SND.musicBus);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return true}
  function setCrush(k){const n=2048,c=new Float32Array(n);const steps=k>0?Math.round(64-k*56):0;for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=steps?Math.round(x*steps)/steps:x}crush.curve=c}
  /* ---------- Instrumente ---------- */
  const wob=()=>riss>0?(Math.random()-.5)*riss*60:0;            /* Verstimmung in Cent */
  function env(g,t,a,peak,d){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+a+d)}
  function osc(type,f,t,dur,peak,a,dest,det){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;o.detune.value=(det||0)+wob();env(g,t,a||.005,peak,dur);o.connect(g);g.connect(dest||out);o.start(t);o.stop(t+(a||.005)+dur+.05);return o}
  const I={
    toy:(n,t,v)=>{const f=midi(n);osc('triangle',f,t,.5,.16*v);osc('sine',f*2,t,.25,.06*v);osc('sine',f*4.02,t,.08,.03*v)},
    glock:(n,t,v)=>{const f=midi(n);osc('sine',f,t,.9,.1*v);osc('sine',f*2.76,t,.3,.04*v)},
    vibe:(n,t,v,d)=>{const f=midi(n);const o=ctx.createOscillator(),g=ctx.createGain(),tr=ctx.createOscillator(),tg=ctx.createGain();o.type='sine';o.frequency.value=f;o.detune.value=wob();tr.frequency.value=5.5;tg.gain.value=.025*v;tr.connect(tg);tg.connect(g.gain);
      env(g,t,.01,.07*v,d||1.4);o.connect(g);g.connect(out);o.start(t);tr.start(t);o.stop(t+(d||1.4)+.1);tr.stop(t+(d||1.4)+.1)},
    bass:(n,t,v,d)=>{osc('triangle',midi(n),t,d||.35,.22*v,.01);osc('sine',midi(n)/2,t,(d||.35)*.8,.1*v,.01)},
    fmBass:(n,t,v,d)=>{const f=midi(n);const c=ctx.createOscillator(),mo=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain();c.frequency.value=f;mo.frequency.value=f*2;mg.gain.setValueAtTime(f*3,t);mg.gain.exponentialRampToValueAtTime(f*.2,t+.18);
      mo.connect(mg);mg.connect(c.frequency);c.detune.value=wob();env(g,t,.005,.2*v,d||.22);c.connect(g);g.connect(out);c.start(t);mo.start(t);c.stop(t+(d||.22)+.05);mo.stop(t+(d||.22)+.05)},
    stab:(ns,t,v)=>ns.forEach(n=>osc('sawtooth',midi(n),t,.18,.035*v,.004)),
    kick:(t,v)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);env(g,t,.002,.5*v,.22);o.connect(g);g.connect(out);o.start(t);o.stop(t+.3)},
    noise:(t,v,d,type,f,q)=>{const s=ctx.createBufferSource();s.buffer=noiseBuf;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||1;const g=ctx.createGain();env(g,t,.002,v,d);s.connect(fl);fl.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+d+.05)},
    snare:(t,v)=>{I.noise(t,.22*v,.16,'bandpass',1800,.8);osc('triangle',190,t,.08,.12*v)},
    rim:(t,v)=>I.noise(t,.12*v,.04,'bandpass',3200,4),
    hat:(t,v)=>I.noise(t,.06*v,.04,'highpass',8000),
    brush:(t,v)=>I.noise(t,.05*v,.18,'bandpass',5000,.6),
    box:(n,t,v)=>{/* Spieldose rückwärts: langsamer Einsatz, harter Schnitt */const f=midi(n);const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;o.detune.value=wob();g.gain.setValueAtTime(.0005,t);g.gain.exponentialRampToValueAtTime(.06*v,t+.9);g.gain.setValueAtTime(0,t+.92);o.connect(g);g.connect(out);o.start(t);o.stop(t+1)}};
  /* ---------- Lieder aus einem Samen ---------- */
  const CHORDS=[[0,4,7,11],[2,5,9,12],[4,7,11,14],[5,9,12,16],[7,11,14,17],[9,12,16,19],[-3,0,4,7]];/* I, ii, iii, IV, V7, vi, vi(tief) */
  const PROGS=[[0,5,1,4],[0,3,2,5],[3,4,2,5],[0,6,3,4],[1,4,0,3]];
  const SCALE=[0,2,4,5,7,9,11];
  function makeSong(name,kind){const r=rng(hashNum(name)*2654435761+7);const key=48+Math.floor(r()*7);const prog=PROGS[Math.floor(r()*PROGS.length)];
    const mel=[];for(let b=0;b<4;b++){const bar=[];for(let s=0;s<16;s++){bar.push(r()<(s%4===0?.7:s%2?.22:.45)?SCALE[Math.floor(r()*7)]+(r()<.25?12:0):null)}mel.push(bar)}
    const lead=['toy','glock','vibe'][Math.floor(r()*3)];return{key,prog,mel,lead,kind,bpm:kind==='kokon'?86+Math.floor(r()*14):kind==='calm'?66:172}}
  /* ---------- Sequenzer ---------- */
  function tick(){if(!ctx||!style)return;const spb=60/song.bpm/4;/* Sechzehntel */
    while(nextT<ctx.currentTime+.18){play16(step,nextT);step++;nextT+=spb*(style==='kokon'&&step%2?1.08:style==='kokon'?.92:1)}}
  function drop(){return riss>0&&Math.random()<riss*.25}
  function play16(s,t){const bar=Math.floor(s/16)%4,i=s%16;const S=song;const ch=CHORDS[S.prog[bar]];const k=S.key;
    if(style==='kokon'||style==='calm'){const calm=style==='calm';
      /* Bossa-Bass: Grundton und Quinte im Bossa-Rhythmus */if([0,3,8,11].includes(i)&&!drop())I.bass(k-12+(i===3||i===11?ch[2]:ch[0]),t,calm?.6:1,.3);
      /* Akkord-Stösse auf dem Vibraphon */if([2,6,10,13].includes(i)&&!calm&&!drop())ch.forEach(n=>I.vibe(k+12+n,t,.35,.5));if(i===0&&calm)ch.forEach(n=>I.vibe(k+12+n,t,.35,3.2));
      /* Melodie (ruhig: nur jede zweite Note, leiser, und jede zweite Phrase Pause) */const mn=S.mel[bar][i];const rest=calm&&(i%2===1||Math.floor(s/64)%2===1);if(mn!=null&&!rest&&!drop())I[S.lead](k+24+mn,t,calm?.45:.9);
      /* Besen und Rimshot */if(!calm){if(i%2===0&&!drop())I.brush(t,.8);if([4,12].includes(i)&&!drop())I.rim(t,1);if(i===0||i===10)I.kick(t,.5)}
      /* Countdown-Motiv: alle 4 Takte steigt es auf und bricht vor dem letzten Ton ab */
      if(Math.floor(s/64)%2===1&&bar===3&&!calm){const cd=[0,2,4,5,7];const j=[0,3,6,9,12].indexOf(i);if(j>=0)I.glock(k+36+cd[j],t,.9)}}
    else if(style==='wired'){/* Breakbeat (Amen-artig) mit FM-Bass */const KICK=[0,10,11],SN=[4,12,15],HAT=[0,2,4,6,8,10,12,14];
      if(KICK.includes(i)&&!drop())I.kick(t,1);if(SN.includes(i)&&!drop())I.snare(t,i===15?.5:1);if(HAT.includes(i))I.hat(t,i%4?0.6:1);
      if([0,3,6,10].includes(i)&&!drop())I.fmBass(k-12+ch[0]+(i===6?7:0),t,1,.2);if(i===0&&bar%2===0)I.stab(ch.map(n=>k+12+n),t,1);
      const mn=S.mel[bar][i];if(mn!=null&&i%2===0&&!drop())I.glock(k+24+mn,t,.5)}
    else if(style==='riss'){if(i===0&&bar%2===0){const n=[7,5,4,2,0][Math.floor(s/32)%5];I.box(k+36+n,t,1)}}}
  /* Riss-Grundklang: Netzbrummen und Röhrenpfeifen (läuft durchgehend) */
  let hum=null;function humOn(){if(hum)return;const g=ctx.createGain();g.gain.value=0;g.connect(out);const a=ctx.createOscillator(),b=ctx.createOscillator(),c=ctx.createOscillator();a.frequency.value=50;b.frequency.value=100;c.frequency.value=7800;
    const ga=ctx.createGain(),gb=ctx.createGain(),gc=ctx.createGain();ga.gain.value=.12;gb.gain.value=.05;gc.gain.value=.004;a.connect(ga);b.connect(gb);c.connect(gc);[ga,gb,gc].forEach(x=>x.connect(g));a.start();b.start();c.start();g.gain.linearRampToValueAtTime(1,ctx.currentTime+1.5);hum={g,o:[a,b,c]}}
  function humOff(){if(!hum)return;const h=hum;hum=null;h.g.gain.linearRampToValueAtTime(0,ctx.currentTime+.6);setTimeout(()=>h.o.forEach(o=>{try{o.stop()}catch(e){}}),800)}
  /* ---------- Steuerung ---------- */
  function styleFor(track){if(!track||track==='stille')return null;if(track==='riss')return'riss';if(track==='lab'||track==='wired')return'wired';if(track==='home'||track==='museum'||track==='world')return'calm';/* Kompost (world) bleibt ruhig: ständige Hintergrundmusik darf nicht nervös machen */return'kokon'}
  function play(track,name){if(!setup())return false;const st=styleFor(track);if(!st){stop();return true}
    const nm=(name||track)+'|'+st;if(style===st&&song&&song.name===nm)return true;
    style=st;song=makeSong(nm,st==='wired'?'wired':st==='calm'?'calm':'kokon');song.name=nm;step=0;nextT=ctx.currentTime+.1;
    out.gain.cancelScheduledValues(ctx.currentTime);out.gain.setValueAtTime(out.gain.value,ctx.currentTime);out.gain.linearRampToValueAtTime(st==='riss'?.9:st==='wired'?.45:1,ctx.currentTime+1.5);
    if(st==='riss')humOn();else humOff();if(!timer)timer=setInterval(tick,25);return true}
  function stop(){if(!ctx)return;style=null;humOff();out.gain.cancelScheduledValues(ctx.currentTime);out.gain.setValueAtTime(out.gain.value,ctx.currentTime);out.gain.linearRampToValueAtTime(0,ctx.currentTime+1);clearInterval(timer);timer=null}
  function setRiss(v){riss=Math.max(0,Math.min(1,+v||0));if(crush)setCrush(riss>.35?(riss-.35)/.65:0)}
  return{play,stop,setRiss,get riss(){return riss},get style(){return style},I}})();
