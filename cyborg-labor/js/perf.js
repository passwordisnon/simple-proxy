/* =====================================================================
   CYBORG-LABOR · perf.js · Grafik passt sich dem Rechner an
   1. Vor allem anderen (dieses Skript läuft vor dem Aufbau der 3D-Welt):
      ein kurzer, unsichtbarer Grafik-Test (gut eine halbe Sekunde).
      Er misst, wie schnell der Grafikchip ein Testbild mit vielen
      Dreiecken und Bildpunkt-Rechnungen zeichnet, und schaut auf
      Prozessorkerne, Arbeitsspeicher und Software-Grafik. Daraus wird
      eine Stufe: «hoch», «schnell» oder «sparsam» (für alte Laptops).
      Der Test läuft einmal je Rechner und Grafikchip.
   2. Während des Spiels: Bildrate messen. Zu langsam → eine Stufe
      runter bzw. Auflösung schrittweise senken; bei Luft wieder hoch.
   Hat jemand die Grafik selbst gewählt, gilt immer diese Wahl.
   Stufe «sparsam»: nur leichte Nachbearbeitung (Farbstimmung und
   Konturen, ohne Umgebungsverdeckung und Leuchten), keine Kantenglättung, geringere Auflösung, kein Gras,
   weniger Streuobjekte und kürzere Sichtweite, keine Lampenlichter.
   ===================================================================== */
const PERF=(()=>{
  const KS='cyborg-labor-scale',KQ='cyborg-labor-grafik',KB='cyborg-labor-bench',BV=2;
  const TIERS=['hoch','schnell','spar'];
  const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
  const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  let scale=1;try{const v=parseFloat(localStorage.getItem(KS));if(v>=.5&&v<=1)scale=v}catch(e){}
  let frames=0,acc=0,warm=6,lastT=performance.now(),cool=0,slow=0;
  const userChose=()=>{try{return localStorage.getItem(KQ)!==null&&localStorage.getItem('cyborg-labor-grafik-auto')!=='1'}catch(e){return true}};
  const save=()=>{try{localStorage.setItem(KS,String(scale))}catch(e){}};
  /* ---------- 1. Grafik-Test ---------- */
  function bench(){const t0=performance.now();const out={v:BV,ok:true,gpu:'',ms:0,soft:false,cores:navigator.hardwareConcurrency||0,mem:navigator.deviceMemory||0,touch:matchMedia('(pointer:coarse)').matches};
    let gl=null,c=null;
    try{c=document.createElement('canvas');c.width=640;c.height=400;gl=c.getContext('webgl',{antialias:false,depth:true,powerPreference:'high-performance'})}catch(e){}
    if(!gl){out.ok=false;return out}
    try{const d=gl.getExtension('WEBGL_debug_renderer_info');out.gpu=String(d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||'')}catch(e){}
    out.soft=/swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(out.gpu);
    try{const c2=document.createElement('canvas');const g2=c2.getContext('webgl',{failIfMajorPerformanceCaveat:true});if(!g2)out.soft=true;else{const lc=g2.getExtension('WEBGL_lose_context');lc&&lc.loseContext()}}catch(e){}
    try{
      const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s};
      const vs=sh(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,fract(p.x*7.3+p.y*3.1)*.5,1.);}');
      /* ungefähr so viel Rechnen je Bildpunkt wie Toon-Licht plus Nachbearbeitung */
      const fs=sh(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;uniform float t;void main(){vec3 c=vec3(0.);vec2 q=v*3.;for(int i=0;i<28;i++){q=vec2(q.x*q.x-q.y*q.y,2.*q.x*q.y)*.5+v+t*.01;c+=vec3(sin(q.x),cos(q.y),sin(q.x+q.y))*.04;}gl_FragColor=vec4(fract(c),1.);}');
      const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');gl.useProgram(pr);
      /* Gitter mit ~90 000 Dreiecken über das ganze Bild */
      const N=212,pts=new Float32Array(N*N*12);let k=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const a=x/N*2-1,b=y/N*2-1,e=2/N;for(const[u,w]of[[a,b],[a+e,b],[a,b+e],[a+e,b],[a+e,b+e],[a,b+e]]){pts[k++]=u;pts[k++]=w}}
      const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,pts,gl.STATIC_DRAW);const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      const ut=gl.getUniformLocation(pr,'t');gl.enable(gl.DEPTH_TEST);gl.viewport(0,0,640,400);const px=new Uint8Array(4);
      const frame=i=>{gl.uniform1f(ut,i);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,N*N*6);gl.drawArrays(gl.TRIANGLES,0,N*N*6);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px)};
      frame(0);frame(1);/* aufwärmen (Shader kompilieren) */
      const ts=[];for(let i=0;i<14;i++){const a=performance.now();frame(i+2);ts.push(performance.now()-a);if(performance.now()-t0>1500)break}
      ts.sort((x,y)=>x-y);out.ms=+ts[Math.floor(ts.length/2)].toFixed(2);
    }catch(e){out.ms=99;out.err=String(e.message||e)}
    try{const lc=gl.getExtension('WEBGL_lose_context');lc&&lc.loseContext()}catch(e){}
    out.took=Math.round(performance.now()-t0);return out}
  function tierFor(b){if(!b||!b.ok)return'spar';if(b.soft)return'spar';
    let t=b.ms<=4.5?'hoch':b.ms<=14?'schnell':'spar';
    /* wenige Kerne oder wenig Speicher: höchstens «schnell»; Telefone und Tablets ebenso */
    if(t==='hoch'&&((b.cores&&b.cores<=4)||(b.mem&&b.mem<=4)||b.touch))t='schnell';
    if(t==='schnell'&&b.cores&&b.cores<=2&&b.ms>8)t='spar';return t}
  /* Messung: einmal je Rechner/Grafikchip, dann gespeichert */
  let B=lsGet(KB);
  const gpuNow=(()=>{try{const c=document.createElement('canvas');const g=c.getContext('webgl');if(!g)return'';const d=g.getExtension('WEBGL_debug_renderer_info');const s=String(d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)||'');const lc=g.getExtension('WEBGL_lose_context');lc&&lc.loseContext();return s}catch(e){return''}})();
  let fresh=false;if(!B||B.v!==BV||B.gpu!==gpuNow){B=bench();B.tier=tierFor(B);lsSet(KB,B);fresh=true}
  /* gewählte Stufe: eigene Wahl vor Messung */
  let tier=B.tier||'schnell';{const q=lsGet(KQ);if(q&&TIERS.includes(q)&&userChose())tier=q}
  if(fresh&&!userChose()){lsSet(KQ,tier);try{localStorage.setItem('cyborg-labor-grafik-auto','1')}catch(e){}if(tier==='spar'&&scale>.75){scale=.75;save()}}
  function relayout(){try{if(typeof GAME!=='undefined'&&GAME.resize)GAME.resize();if(typeof INTERIOR!=='undefined'&&INTERIOR.resize)INTERIOR.resize();if(typeof LAB!=='undefined'&&LAB.resize)LAB.resize()}catch(e){}}
  const LABEL={hoch:' Grafik hoch',schnell:' Grafik schnell',spar:' Grafik sparsam'};
  /* Stufe setzen: by='user' (Knopf) oder 'auto' (Messung/Bildrate) */
  function setTier(t,by){if(!TIERS.includes(t))return;tier=t;HIGH=t==='hoch';lsSet(KQ,t);try{localStorage.setItem('cyborg-labor-grafik-auto',by==='user'?'0':'1')}catch(e){}
    if(t==='spar'&&scale>.75){scale=.75;save()}if(t==='hoch'&&scale<1){scale=1;save()}
    updBtn();try{LAB.quality()}catch(e){}try{if(typeof MAIN==='undefined'||MAIN.worldReady!==false)GAME.quality()}catch(e){}relayout()}
  function updBtn(){const qb=document.getElementById('btnQual');if(!qb)return;qb.setAttribute('aria-pressed',tier==='hoch');const lb=qb.querySelector('.lb');if(lb)lb.textContent=LABEL[tier]}
  function auto(){try{localStorage.removeItem(KB);localStorage.setItem('cyborg-labor-grafik-auto','1')}catch(e){}B=bench();B.tier=tierFor(B);lsSet(KB,B);setTier(B.tier,'auto');return B}
  const T=x=>typeof I18N!=='undefined'?I18N.t(x):x;
  function toast(msg){if(typeof UI!=='undefined')UI.toast(T(msg),4600)}
  /* ---------- 2. Während des Spiels ---------- */
  function frame(active){const now=performance.now(),gap=now-lastT;lastT=now;
    if(!active||document.hidden||gap>2000){frames=0;acc=0;warm=Math.max(warm,3);return}
    if(warm>0){warm-=gap/1000;return}
    frames++;acc+=gap;if(acc<4000)return;
    const fps=frames*1000/acc;frames=0;acc=0;
    if(cool>0){cool--;return}
    const auto_=!userChose();
    if(tier==='hoch'&&fps<40&&auto_){setTier('schnell','auto');toast('Die Grafik läuft jetzt auf «schnell», damit das Spiel flüssig bleibt. Oben rechts kannst du es ändern.');warm=8;cool=1;return}
    if(tier!=='hoch'&&fps<28&&scale>.6){scale=Math.max(.6,+(scale-.15).toFixed(2));save();relayout();cool=1;return}
    if(tier==='schnell'&&fps<20&&auto_){slow++;if(slow>=2){slow=0;setTier('spar','auto');toast('Dein Computer hat viel zu tun. Die Grafik läuft jetzt sparsam, damit das Spiel flüssig bleibt.');warm=8;cool=1}return}
    slow=0;if(fps>55&&scale<1&&tier!=='spar'){scale=Math.min(1,+(scale+.1).toFixed(2));save();relayout();cool=2}}
  /* erster Start: kurz sagen, was eingestellt wurde */
  if(fresh&&!userChose())setTimeout(()=>toast(tier==='hoch'?'Grafik an deinen Computer angepasst: hoch.':tier==='schnell'?'Grafik an deinen Computer angepasst: schnell.':'Grafik an deinen Computer angepasst: sparsam. So läuft das Spiel auch auf älteren Computern.'),4000);
  try{if(typeof I18N!=='undefined'&&I18N.extend)I18N.extend('en',{'Die Grafik läuft jetzt auf «schnell», damit das Spiel flüssig bleibt. Oben rechts kannst du es ändern.':'Graphics are now set to “fast” so the game stays smooth. You can change this at the top right.',
    'Dein Computer hat viel zu tun. Die Grafik läuft jetzt sparsam, damit das Spiel flüssig bleibt.':'Your computer is very busy. Graphics are now set to “economy” so the game stays smooth.',
    'Grafik an deinen Computer angepasst: hoch.':'Graphics adjusted to your computer: high.','Grafik an deinen Computer angepasst: schnell.':'Graphics adjusted to your computer: fast.',
    'Grafik an deinen Computer angepasst: sparsam. So läuft das Spiel auch auf älteren Computern.':'Graphics adjusted to your computer: economy. This way the game runs on older computers too.',
    ' Grafik sparsam':' Graphics economy','Grafik sparsam':'Graphics economy','Grafik automatisch einstellen':'Set graphics automatically','Grafik neu gemessen:':'Graphics measured again:','hoch':'high','schnell':'fast','sparsam':'economy'})}catch(e){}
  return{frame,setTier,auto,updBtn,get tier(){return tier},get bench(){return B},get spar(){return tier==='spar'},TIERS,LABEL,
    debug:()=>({frames,acc:Math.round(acc),warm:+warm.toFixed(1),cool,tier,B}),get scale(){return scale},set scale(v){scale=Math.max(.5,Math.min(1,v));save();relayout()}};
})();
