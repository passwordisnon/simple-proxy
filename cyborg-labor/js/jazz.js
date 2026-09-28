/* =====================================================================
   CYBORG-LABOR · jazz.js
   Kleine Jazz-Band im Browser (WebAudio, alles synthetisiert):
   Swing-Schlagzeug, Walking-Bass, Klavier-Begleitung über eine ii–V–I-Folge.
   Wer mitspielt, trifft immer: Tasten 1–8 werden auf passende Töne des
   aktuellen Akkords gelegt und auf das Swing-Raster gezogen.
   ===================================================================== */
const JAZZ=(()=>{
  let ctx=null,out=null,rev=null,timer=null,playing=false;let bpm=112;let next=0,step=0;const LOOK=.14;
  const listeners=[];
  /* Akkordfolge (F-Dur): Grundton (MIDI) + Stufen */
  const Q={m7:[0,3,7,10],d7:[0,4,7,10],maj7:[0,4,7,11],m7b5:[0,3,6,10]};
  const PROG=[[55,'m7'],[48,'d7'],[53,'maj7'],[53,'maj7'],[58,'maj7'],[51,'d7'],[57,'m7'],[50,'d7'],[55,'m7'],[48,'d7'],[53,'maj7'],[50,'d7']];
  const SCALES={m7:[0,2,3,5,7,9,10],d7:[0,2,4,5,7,9,10],maj7:[0,2,4,5,7,9,11],m7b5:[0,1,3,5,6,8,10]};
  const hz=m=>440*Math.pow(2,(m-69)/12);
  function init(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();out=ctx.createGain();out.gain.value=.55;
    /* kleiner Raum-Hall */rev=ctx.createConvolver();const n=ctx.sampleRate*1.6;const b=ctx.createBuffer(2,n,ctx.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)}rev.buffer=b;
    const rg=ctx.createGain();rg.gain.value=.22;out.connect(ctx.destination);out.connect(rev);rev.connect(rg);rg.connect(ctx.destination)}
  const vol=()=>(SND.st&&SND.st.on===false)?0:((SND.st&&SND.st.music!=null?SND.st.music:1)*.9);
  let noiseB=null;function noise(){if(noiseB)return noiseB;const n=ctx.sampleRate;noiseB=ctx.createBuffer(1,n,ctx.sampleRate);const d=noiseB.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseB}
  function env(g,t,a,peak,dec,sus,rel,len){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(.0001,peak*sus),t+a+dec);g.gain.setValueAtTime(Math.max(.0001,peak*sus),t+len);g.gain.exponentialRampToValueAtTime(.0001,t+len+rel)}
  /* ---------- Klangerzeuger ---------- */
  const I={
    piano(m,t,len,v){const f=hz(m);const g=ctx.createGain();env(g,t,.005,.28*v,.35,.25,.25,Math.min(len,.6));const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200+f;lp.connect(g);g.connect(out);
      [[1,'triangle',1],[2,'sine',.35],[3,'sine',.12]].forEach(([h,w,a])=>{const o=ctx.createOscillator();o.type=w;o.frequency.value=f*h;o.detune.value=(Math.random()-.5)*6;const gg=ctx.createGain();gg.gain.value=a;o.connect(gg);gg.connect(lp);o.start(t);o.stop(t+len+.9)})},
    sax(m,t,len,v){const f=hz(m);const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.97,t);o.frequency.linearRampToValueAtTime(f,t+.05);const lf=ctx.createOscillator();lf.frequency.value=5.2;const lg=ctx.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.012,t+.25);lf.connect(lg);lg.connect(o.frequency);
      const bp=ctx.createBiquadFilter();bp.type='lowpass';bp.frequency.setValueAtTime(900,t);bp.frequency.linearRampToValueAtTime(1900+f*.5,t+.06);bp.Q.value=2;const g=ctx.createGain();env(g,t,.03,.2*v,.2,.75,.12,len);o.connect(bp);bp.connect(g);g.connect(out);o.start(t);lf.start(t);o.stop(t+len+.3);lf.stop(t+len+.3)},
    vibes(m,t,len,v){const f=hz(m);const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;const o2=ctx.createOscillator();o2.type='sine';o2.frequency.value=f*4;const g=ctx.createGain();env(g,t,.002,.3*v,1.2,.01,.2,.1);const g2=ctx.createGain();g2.gain.value=.12;
      const tr=ctx.createGain();const lf=ctx.createOscillator();lf.frequency.value=6;const lg=ctx.createGain();lg.gain.value=.35;lf.connect(lg);lg.connect(tr.gain);tr.gain.value=.65;o.connect(g);o2.connect(g2);g2.connect(g);g.connect(tr);tr.connect(out);[o,o2,lf].forEach(x=>{x.start(t);x.stop(t+1.6)})},
    bass(m,t,len,v){const f=hz(m);const o=ctx.createOscillator();o.type='triangle';o.frequency.value=f;const s=ctx.createOscillator();s.type='sine';s.frequency.value=f;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(260,t+.2);
      const g=ctx.createGain();env(g,t,.006,.42*v,.25,.45,.08,len*.85);o.connect(lp);s.connect(lp);lp.connect(g);g.connect(out);[o,s].forEach(x=>{x.start(t);x.stop(t+len+.2)})},
    synth(m,t,len,v){const f=hz(m);[0,7].forEach(d=>{const o=ctx.createOscillator();o.type='square';o.frequency.value=f;o.detune.value=d;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(3200,t);lp.frequency.exponentialRampToValueAtTime(700,t+.3);const g=ctx.createGain();env(g,t,.004,.09*v,.2,.5,.15,len);o.connect(lp);lp.connect(g);g.connect(out);o.start(t);o.stop(t+len+.3)})},
    scat(m,t,len,v){const f=hz(m);const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*1.03,t);o.frequency.exponentialRampToValueAtTime(f,t+.04);const fm=[[700,1200],[400,2000],[300,900],[600,1000]][Math.floor(Math.random()*4)];const g=ctx.createGain();env(g,t,.01,.18*v,.1,.6,.08,len*.8);
      fm.forEach(fr=>{const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=6;o.connect(bp);bp.connect(g)});g.connect(out);o.start(t);o.stop(t+len+.2)},
    /* Schlagzeug: Midi-Nummern → Klang */
    drum(k,t,v){const nb=noise();if(k==='kick'){const o=ctx.createOscillator();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);const g=ctx.createGain();env(g,t,.002,.5*v,.15,.01,.05,.05);o.connect(g);g.connect(out);o.start(t);o.stop(t+.3);return}
      const s=ctx.createBufferSource();s.buffer=nb;const f=ctx.createBiquadFilter();const g=ctx.createGain();
      if(k==='ride'){f.type='highpass';f.frequency.value=6500;env(g,t,.002,.08*v,.25,.2,.2,.05)}else if(k==='hat'){f.type='highpass';f.frequency.value=8000;env(g,t,.001,.07*v,.04,.01,.02,.02)}
      else if(k==='snare'){f.type='bandpass';f.frequency.value=1800;f.Q.value=.8;env(g,t,.002,.22*v,.12,.05,.06,.04)}else if(k==='brush'){f.type='bandpass';f.frequency.value=3000;env(g,t,.02,.05*v,.15,.3,.1,.1)}
      else if(k==='crash'){f.type='highpass';f.frequency.value=4000;env(g,t,.002,.18*v,1,.2,.4,.2)}else{f.type='bandpass';f.frequency.value=k==='tom'?220:400;f.Q.value=3;env(g,t,.002,.3*v,.2,.01,.05,.05)}
      s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+1.2)}};
  /* ---------- Band ---------- */
  const spb=()=>60/bpm;const swing=(i)=>i%2?spb()*2/3:0;/* 8tel: zweite Hälfte auf die Triole */
  const band={drums:true,bass:true,piano:true,solo:null};let bar=0,beat=0;
  function chordAt(b){return PROG[b%PROG.length]}
  function schedule(){while(next<ctx.currentTime+LOOK){const b=Math.floor(step/8),e=step%8;bar=b;beat=e/2;const t=next+(e%2?spb()/6:0);/* Swing-Verschiebung der Off-Beats */
      const[root,q]=chordAt(b);const v=vol();
      if(v>0){if(band.drums){if(e%2===0)I.drum('ride',t,v);if(e===3||e===7)I.drum('ride',t,v*.8);if(e===2||e===6)I.drum('hat',t,v);if(e===0&&b%4===0)I.drum('kick',t,v*.7);if(e%2===0&&Math.random()<.15)I.drum('snare',t,v*.35);if(e===7&&b%4===3)I.drum('snare',t,v*.6)}
        if(band.bass&&e%2===0){const qn=e/2;const[nr]=chordAt(b+1);const tones=Q[q];let m;if(qn===0)m=root-12;else if(qn===3)m=nr-12+(Math.random()<.5?1:-1);else m=root-12+tones[1+Math.floor(Math.random()*3)];I.bass(m,t,spb()*.95,v)}
        if(band.piano){const hit=(e===0&&Math.random()<.35)||(e===3&&Math.random()<.7)||(e===5&&Math.random()<.2);if(hit){const tones=Q[q];[tones[1],tones[3],tones[1]+14].forEach((d,i)=>I.piano(root+d+(i===2?-12:0),t+i*.005,spb()*(e===3?1.2:.6),v*.55))}}
        if(band.solo&&!playerRecent())soloStep(t,b,e,root,q,v)}
      listeners.forEach(f=>{try{f(b,e,t)}catch(x){}});step++;next+=spb()/2}}
  /* Automatische Improvisation (Band-Solist oder Auto-Solo) */let solo={last:65,rest:0};
  function soloStep(t,b,e,root,q,v){if(solo.rest>0){solo.rest--;return}if(Math.random()<.22){solo.rest=1+Math.floor(Math.random()*3);return}const sc=SCALES[q];
    let target=solo.last+[-2,-1,-1,1,1,2,3,-3][Math.floor(Math.random()*8)];const pc=((target-root)%12+12)%12;let best=target,bd=9;for(let d=-2;d<=2;d++){const p=((pc+d)%12+12)%12;if(sc.includes(p)&&Math.abs(d)<bd){bd=Math.abs(d);best=target+d}}
    if(e%2===0&&Math.random()<.5){const ct=Q[q];const p2=((best-root)%12+12)%12;if(!ct.includes(p2)){best+=ct.map(c=>((c-p2+18)%12)-6).sort((a,b)=>Math.abs(a)-Math.abs(b))[0]}}
    best=Math.max(58,Math.min(82,best));solo.last=best;I[band.solo](best,t,spb()*(Math.random()<.2?1:.48),v*.9)}
  let lastPlayer=0;const playerRecent=()=>ctx&&ctx.currentTime-lastPlayer<1.2;
  function start(){init();if(!ctx)return;if(ctx.state==='suspended')ctx.resume();if(playing)return;playing=true;next=ctx.currentTime+.1;step=0;timer=setInterval(schedule,25)}
  function stop(){playing=false;clearInterval(timer);timer=null}
  /* ---------- Mitspielen ---------- */
  function playKey(i,inst){if(!ctx||!playing)return null;const now=ctx.currentTime;const half=spb()/2;
    /* auf nächstes Swing-8tel ziehen, wenn nah genug */let tq=now+.01;const since=now-(next-half);const grid=(()=>{const k=Math.ceil((now-(next-half))/half);return(next-half)+k*half})();if(grid-now<.09)tq=grid+((step%2)?spb()/6:0);
    const[root,q]=chordAt(bar);const v=vol();lastPlayer=now;
    if(inst==='drums'){const map=['kick','snare','hat','ride','tom','tom2','crash','brush'];I.drum(map[i%8],tq,v);return map[i%8]}
    const sc=SCALES[q];const base=(inst==='bass'?root-12:root+(root<55?12:0));const deg=i;const oct=Math.floor(deg/sc.length);const m=base+sc[deg%sc.length]+oct*12;/* Tonleiter des aktuellen Akkords */
    I[inst](m,tq,inst==='bass'?spb()*.9:spb()*.8,v);return m}
  function chordName(){const[r,q]=chordAt(bar);const n=['C','Des','D','Es','E','F','Ges','G','As','A','B','H'][r%12];return n+({m7:'m7',d7:'7',maj7:'maj7',m7b5:'m7♭5'}[q]||'')}
  return{start,stop,playKey,band,chordName,get playing(){return playing},onBeat:f=>listeners.push(f),get bar(){return bar},INSTR:['piano','sax','vibes','bass','synth','scat','drums']}
})();
