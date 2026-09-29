/* =====================================================================
   CYBORG-LABOR · clinic.js
   Handgebaute Praxis-Möbel im Cozy-Stil (kein freies Kit hat medizinische
   Teile): Krankenbett mit Gittern, Infusionsständer, EKG-Monitor mit
   laufender Herzkurve, Vorhang an der Deckenschiene, Medizinschrank mit
   Fläschchen, Sehtafel, Untersuchungslampe, Wasserspender, Praxis-Kreuz.
   ===================================================================== */
const CLINIC=(()=>{
  const MINT='#7FCFC0',MINTD='#4FA898',WHITE='#FBFDFD',CREAM='#FFF6EA',STEEL='#C9D3DA';
  const pk=(r,a)=>a[Math.floor(r()*a.length)];const fin=g=>{addOutlines(g);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});return g};
  const caster=(g,M,x,z)=>{P(g,G.cy(.012,.012,.07),M.chrome(),[x,.08,z]);P(g,G.to(.035,.018),M.c('#4A4A5E'),[x,.04,z],[0,PI/2,0])};
  /* Krankenbett: Kopfteil hochgestellt, Gitter, Decke, Kissen, Patientenkarte */
  function bed(M){const g=new THREE.Group();const L=2.1,Wd=1.0;
    for(const sx of[-1,1])for(const sz of[-1,1]){P(g,G.cy(.03,.03,.36),M.chrome(),[sx*.42,.26,sz*.9]);caster(g,M,sx*.42,sz*.9)}
    P(g,G.bx(Wd,.1,L-.1,.04),M.c(WHITE),[0,.48,0]);P(g,G.bx(Wd-.1,.05,L-.3,.02),M.c(STEEL),[0,.42,0]);
    /* Matratze: Fussteil flach, Kopfteil schräg */
    P(g,G.bx(.9,.16,1.3,.07),M.c('#A8DDD2'),[0,.61,.33]);const hd=grp(g,[0,.61,-.32],[.5,0,0]);P(hd,G.bx(.9,.16,.68,.07),M.c('#A8DDD2'),[0,0,-.34]);
    P(hd,G.bx(.62,.15,.34,.07),M.c('#FFFFFF',{rim:.4}),[0,.14,-.42],[-.08,0,0]);
    /* Decke mit Umschlag und Streifen */P(g,G.bx(.96,.07,1.02,.035),M.c('#F2F7FF'),[0,.71,.5]);P(g,G.bx(.97,.08,.2,.04),M.c('#FFFFFF'),[0,.73,.04]);P(g,G.bx(.975,.02,.05,.01),M.c(MINT),[0,.77,.04]);
    both(s=>P(g,G.bx(.02,.2,.9,.01),M.c('#F2F7FF'),[s*.48,.64,.52]));
    /* Kopf- und Fussteil */P(g,G.bx(Wd+.08,.78,.08,.04),M.c(WHITE),[0,.78,-L/2]);P(g,G.bx(Wd-.16,.46,.03,.02),M.c(MINT),[0,.86,-L/2+.045]);
    P(g,G.bx(Wd+.08,.5,.08,.04),M.c(WHITE),[0,.64,L/2]);P(g,G.bx(Wd-.2,.22,.03,.02),M.c(MINT),[0,.7,L/2-.045]);
    /* Patientenkarte am Fussteil */P(g,G.bx(.24,.3,.02,.01),M.c('#D8A878'),[.22,.74,L/2+.05]);P(g,G.bx(.2,.24,.005,0),M.c('#FFFFFF'),[.22,.73,L/2+.062]);for(let i=0;i<4;i++)P(g,G.bx(.14-(i%2)*.04,.012,.004,0),M.c('#8EA0B8'),[.2,.8-i*.04,L/2+.066]);P(g,G.bx(.07,.03,.03,.01),M.chrome(),[.22,.89,L/2+.055]);
    /* Seitengitter (hochgeklappt am Kopfende) */both(s=>{for(const y of[.86,.96])P(g,G.ca(.018,.72),M.chrome(),[s*.53,y,-.35],[PI/2,0,0]);for(const z of[-.7,-.35,0])P(g,G.cy(.014,.014,.14),M.chrome(),[s*.53,.9,z])});
    /* Kurbel */P(g,G.cy(.012,.012,.14),M.chrome(),[.3,.4,L/2+.05],[PI/2,0,0]);P(g,G.bx(.1,.02,.02,.008),M.chrome(),[.34,.4,L/2+.12]);
    return fin(g)}
  /* Infusionsständer: Fünffuss, Stange, Haken, Beutel mit Tropfkammer und Schlauch */
  function iv(M,tubeTo){const g=new THREE.Group();for(let i=0;i<5;i++){const a=i/5*TAU;const q=grp(g,[0,.1,0],[0,a,0]);P(q,G.ca(.02,.3),M.chrome(),[.17,0,0],[0,0,PI/2]);caster(g,M,Math.cos(a)*.34,-Math.sin(a)*.34)}
    P(g,G.cy(.035,.04,.08),M.c(WHITE),[0,.13,0]);P(g,G.cy(.016,.016,1.85),M.chrome(),[0,1.05,0]);P(g,G.s(.03),M.chrome(),[0,1.98,0]);
    both(s=>{P(g,G.ca(.01,.2),M.chrome(),[s*.1,1.93,0],[0,0,PI/2]);P(g,G.to(.025,.007,PI),M.chrome(),[s*.2,1.905,0],[0,0,PI])});
    const bag=grp(g,[.2,1.66,0]);P(bag,G.bx(.2,.3,.06,.05),M.c('#DDF4FF',{opacity:.62,gloss:1}),[0,0,0]);P(bag,G.bx(.17,.2,.04,.04),M.c('#FFF3C8',{opacity:.8}),[0,-.04,0]);P(bag,G.bx(.14,.03,.01,.005),M.c(MINT),[0,.07,.032]);
    P(bag,G.cy(.018,.018,.03),M.c(WHITE),[0,.165,0]);P(bag,G.cy(.018,.014,.08),M.c('#DDF4FF',{opacity:.6}),[0,-.2,0]);
    const t=tubeTo||[-.3,.85,-.25];P(g,G.tu([[.2,1.45,0],[.22,1.1,.02],[(.2+t[0])/2,.7,t[2]/2],[t[0],t[1],t[2]]],.008),M.c('#E8F6FF',{opacity:.8}));return fin(g)}
  /* EKG-Monitor (Wandarm): Bildschirm mit laufender Kurve */
  function monitor(M){const g=new THREE.Group();const c=document.createElement('canvas');c.width=256;c.height=160;const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;
    P(g,G.bx(.2,.2,.06,.03),M.c(STEEL),[0,0,-.03]);P(g,G.ca(.03,.3),M.c(STEEL),[0,-.02,.18],[PI/2,0,0]);
    const sc=grp(g,[0,0,.4],[-.1,0,0]);P(sc,G.bx(.64,.46,.12,.05),M.c('#E8EEF2'),[0,0,0]);P(sc,G.bx(.56,.36,.02,.01),M.c('#2E3A48'),[0,.02,.06]);
    const scr=P(sc,G.pl(.52,.325),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}),[0,.02,.072]);scr.userData.noOutline=true;
    for(let i=0;i<3;i++)P(sc,G.cy(.018,.018,.02),M.c(['#FF8A9A',MINT,'#FFD27A'][i]),[-.16+i*.07,-.19,.065],[PI/2,0,0]);P(sc,G.s(.012),M.glow('#7CFFB2',2),[.22,-.19,.07]);
    /* Kabel zum Bett */P(g,G.tu([[.1,-.2,.4],[.16,-.55,.5],[.3,-.95,.75],[.55,-1.12,1.05]],.007),M.c('#9AA8B6'));
    let last=-1,beat=0;const hist=new Float32Array(128);let head=0;
    function draw(t){const x=c.getContext('2d');const w=c.width,h=c.height;x.fillStyle='#10262C';x.fillRect(0,0,w,h);x.strokeStyle='rgba(90,200,170,.12)';x.lineWidth=1;for(let i=0;i<w;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let j=0;j<h;j+=16){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke()}
      const per=60/72;const ph=(t%per)/per;const ecg=ph<.08?Math.sin(ph/.08*PI)*.12:ph<.14?0:ph<.17?-.18:ph<.21?1:ph<.25?-.35:ph<.4?0:ph<.52?Math.sin((ph-.4)/.12*PI)*.22:0;
      hist[head]=ecg;head=(head+1)%hist.length;x.strokeStyle='#7CFFB2';x.lineWidth=3;x.shadowColor='#7CFFB2';x.shadowBlur=8;x.beginPath();for(let i=0;i<hist.length;i++){const v=hist[(head+i)%hist.length];const px=i/hist.length*w*.72+6,py=h*.48-v*h*.34;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.shadowBlur=0;
      x.fillStyle='#7CFFB2';x.font='bold 34px sans-serif';x.fillText('72',w*.78,h*.36);x.font='14px sans-serif';x.fillText('HF',w*.78,h*.12);if(ph<.3){x.beginPath();const hx=w*.93,hy=h*.1;x.arc(hx-5,hy,5,PI,0);x.arc(hx+5,hy,5,PI,0);x.lineTo(hx,hy+12);x.closePath();x.fill()}
      x.fillStyle='#7CD8FF';x.font='bold 28px sans-serif';x.fillText('98',w*.78,h*.78);x.font='14px sans-serif';x.fillText('SpO2',w*.78,h*.56);x.fillStyle='#FFD27A';x.font='13px sans-serif';x.fillText('Cyborg-Modus OK',10,h-10);tex.needsUpdate=true}
    g.userData.tick=t=>{const k=Math.floor(t*30);if(k===last)return;last=k;draw(t)};draw(0);fin(g);return g}
  /* Vorhang an Deckenschiene mit Falten */
  /* open = Anteil der Schiene ohne Stoff; Stoff liegt gerafft am Anfang (-z) bzw. mit flip am Ende */
  function curtain(M,len,H,open,flip){const g=new THREE.Group();P(g,G.bx(.07,.06,len+.1,.02),M.c(STEEL),[0,H-.06,0]);for(const e of[-1,1])P(g,G.cy(.02,.02,.14),M.c(STEEL),[0,H+.01,e*len/2]);
    const cl=len*(1-open);const n=Math.max(6,Math.round(cl*7));const hh=H-.5;const z0=(flip?1:-1)*(len/2-cl/2);
    const geo=new THREE.PlaneGeometry(cl,hh,n*8,6);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const u=pos.getX(i),v=pos.getY(i)/hh+.5;const k=.09+.03*(1-v);pos.setZ(i,Math.sin((u/cl+.5)*n*TAU)*k);pos.setX(i,u*(1+.06*(1-v)))}geo.computeVertexNormals();
    const cm=P(g,geo,M.dbl('#CFECE4',{rim:.4}),[0,hh/2+.3,z0],[0,PI/2,0]);
    const hem=new THREE.PlaneGeometry(cl,.16,n*8,1);const hp=hem.attributes.position;for(let i=0;i<hp.count;i++){const u=hp.getX(i);hp.setZ(i,Math.sin((u/cl+.5)*n*TAU)*.1);hp.setX(i,u*1.06)}hem.computeVertexNormals();P(g,hem,M.dbl(MINT),[0,.36,z0],[0,PI/2,0]);
    for(let i=0;i<=n*2;i++)P(g,G.to(.028,.007),M.chrome(),[0,H-.14,z0-cl/2+i*cl/(n*2)],[0,0,0]);return fin(g)}
  /* Medizinschrank: Glasvitrine oben, Türen unten, bunte Fläschchen */
  function cabinet(M,r){const g=new THREE.Group();const w=1.25,d=.45;P(g,G.bx(w,.9,d,.04),M.c(WHITE),[0,.47,0]);P(g,G.bx(w,1.05,d*.8,.04),M.c(WHITE),[0,1.46,-.04]);P(g,G.bx(w+.06,.06,d+.04,.03),M.c(MINT),[0,.93,0]);P(g,G.bx(w+.06,.06,d*.8+.04,.03),M.c(MINT),[0,2.0,-.04]);
    both(s=>{P(g,G.bx(w/2-.06,.78,.02,.02),M.c('#F2F8F7'),[s*w/4,.47,d/2+.005]);P(g,G.cy(.018,.018,.16),M.c(MINTD),[s*.08,.62,d/2+.03])});
    const back=P(g,G.bx(w-.08,.95,.01,0),M.c('#DDF0EC'),[0,1.46,-.04-d*.4+.02]);
    for(const y of[1.12,1.46,1.8]){P(g,G.bx(w-.1,.025,d*.7,.01),M.c('#EAF6F4'),[0,y-.13,-.04]);for(let i=0;i<5;i++){if(r()<.18)continue;const x=-w/2+.16+i*(w-.3)/4+(r()-.5)*.05;const col=pk(r,['#C88A4A','#7CB8E8','#F29AB0','#FFFFFF','#8ED8A8','#FFD27A']);const hh=.12+r()*.1;
      if(r()<.35){P(g,G.bx(.12,hh*.8,.08,.02),M.c(col),[x,y-.12+hh*.4,-.02])}else{P(g,G.cy(.035,.04,hh),M.c(col,{gloss:.8}),[x,y-.12+hh/2,-.02]);P(g,G.cy(.028,.028,.04),M.c('#FFFFFF'),[x,y-.12+hh+.02,-.02])}}}
    both(s=>{const d2=P(g,G.bx(w/2-.04,.95,.03,.02),M.c('#E4F6FF',{opacity:.28,gloss:1.2}),[s*w/4,1.46,d*.4-.02]);d2.userData.noOutline=true;P(g,G.bx(w/2-.04,.04,.035,.01),M.c(WHITE),[s*w/4,1.95,d*.4-.02]);P(g,G.bx(w/2-.04,.04,.035,.01),M.c(WHITE),[s*w/4,.97,d*.4-.02]);P(g,G.cy(.012,.012,.1),M.chrome(),[s*.05,1.46,d*.4+.01])});
    /* Kreuz oben drauf */const cr=grp(g,[0,2.2,-.04]);P(cr,G.bx(.34,.34,.06,.05),M.c(WHITE),[0,0,0]);P(cr,G.bx(.22,.07,.03,.015),M.c(MINT),[0,0,.035]);P(cr,G.bx(.07,.22,.03,.015),M.c(MINT),[0,0,.035]);return fin(g)}
  /* Praxis-Kreuz als runde Wandplakette */
  function emblem(M,s){const g=new THREE.Group();s=s||1;P(g,G.cy(.42*s,.42*s,.06,),M.c(WHITE),[0,0,0],[PI/2,0,0]);P(g,G.to(.4*s,.03*s),M.c(MINT),[0,0,.03]);const sh=new THREE.Shape();const a=.08*s,b=.24*s;
    sh.moveTo(-a,-b);sh.lineTo(a,-b);sh.lineTo(a,-a);sh.lineTo(b,-a);sh.lineTo(b,a);sh.lineTo(a,a);sh.lineTo(a,b);sh.lineTo(-a,b);sh.lineTo(-a,a);sh.lineTo(-b,a);sh.lineTo(-b,-a);sh.lineTo(-a,-a);sh.lineTo(-a,-b);
    P(g,G.ex(sh,.04,.015),M.c(MINT,{gloss:.6}),[0,0,.03]);return fin(g)}
  /* Sehtafel */
  function eyeChart(M){const g=new THREE.Group();const t=ctex('sehtafel',160,256,(x,w,h)=>{x.fillStyle='#FFFEFA';x.fillRect(0,0,w,h);x.fillStyle='#3A4658';x.textAlign='center';const rows=[['E',64],['F P',40],['T O Z',30],['L P E D',22],['P E C F D',16],['E D F C Z P',12],['F E L O P Z D',9]];let y=12;
      for(const[s,z]of rows){y+=z+8;x.font='bold '+z+'px sans-serif';x.fillText(s.split(' ').join('  '),w/2,y)}x.fillStyle=MINT;x.fillRect(0,h-10,w,10)});
    P(g,G.bx(.66,1.02,.04,.02),M.c('#DDE8EC'),[0,0,0]);const p=P(g,G.pl(.6,.96),new THREE.MeshBasicMaterial({map:t}),[0,0,.022]);p.userData.noOutline=true;return fin(g)}
  /* Untersuchungslampe mit Gelenkarm */
  function examLamp(M){const g=new THREE.Group();for(let i=0;i<5;i++){const a=i/5*TAU;const q=grp(g,[0,.08,0],[0,a,0]);P(q,G.ca(.018,.24),M.c(WHITE),[.14,0,0],[0,0,PI/2]);caster(g,M,Math.cos(a)*.28,-Math.sin(a)*.28)}
    P(g,G.cy(.018,.018,1.3),M.chrome(),[0,.75,0]);P(g,G.s(.04),M.c(MINT),[0,1.42,0]);const a1=grp(g,[0,1.42,0],[0,0,-.9]);P(a1,G.ca(.016,.5),M.c(WHITE),[0,.28,0]);const a2=grp(a1,[0,.56,0],[0,0,2.1]);P(a2,G.s(.035),M.c(MINT),[0,0,0]);P(a2,G.ca(.015,.28),M.c(WHITE),[0,.17,0]);
    const hd=grp(a2,[0,.36,0],[0,0,-.6]);P(hd,G.la([[0,.06],[.15,.02],[.17,-.05],[.16,-.07],[0,-.04]],24),M.c(WHITE),[0,0,0]);P(hd,G.cy(.13,.13,.01),M.glow('#FFF8E6',1.6),[0,-.055,0]);return fin(g)}
  /* Wasserspender */
  function cooler(M){const g=new THREE.Group();P(g,G.bx(.42,1.0,.42,.08),M.c(WHITE),[0,.5,0]);P(g,G.bx(.3,.18,.04,.03),M.c('#E4ECF0'),[0,.72,.21]);P(g,G.cy(.02,.02,.05),M.c('#7CB8E8'),[-.07,.82,.23],[PI/2,0,0]);P(g,G.cy(.02,.02,.05),M.c('#F28C8C'),[.07,.82,.23],[PI/2,0,0]);
    P(g,G.la([[0,0],[.16,0],[.18,.06],[.18,.36],[.14,.44],[.06,.48],[.05,.54],[0,.54]],24),M.c('#9FD8FF',{opacity:.55,gloss:1.2}),[0,1.0,0]);P(g,G.cy(.13,.13,.26),M.c('#BFE8FF',{opacity:.5}),[0,1.16,0]);
    P(g,G.cy(.04,.04,.1),M.c('#E4F2F8'),[.26,.9,0]);return fin(g)}
  /* Messlatte an der Wand */
  function height(M){const g=new THREE.Group();const t=ctex('messlatte',32,256,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#F7B6C8');gr.addColorStop(.5,'#FFE6A0');gr.addColorStop(1,'#A8E8D0');x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle='#5A6A7A';for(let i=0;i<32;i++){x.fillRect(0,i*8,i%4?8:16,2)}});
    const p=P(g,G.pl(.16,1.9),new THREE.MeshBasicMaterial({map:t}),[0,.95+.1,0]);p.userData.noOutline=true;P(g,G.bx(.2,1.94,.03,.01),M.c(WHITE),[0,1.05,-.02]);return fin(g)}
  return{bed,iv,monitor,curtain,cabinet,emblem,eyeChart,examLamp,cooler,height,MINT,MINTD}
})();
