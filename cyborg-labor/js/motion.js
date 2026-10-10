/* =====================================================================
   CYBORG-LABOR · motion.js
   Feder-Physik für die ganze Oberfläche: Gedämpfte Federn werden einmal
   simuliert und als CSS-linear()-Easing bereitgestellt (--spring,
   --spring-soft, --spring-snappy). So federt jedes Fenster, jeder Knopf
   und jede Karte wie in Animal Crossing – ohne Bibliothek, ohne Ruckeln.
   Dazu: Aus-Animationen für Fenster und Toasts, Druck-Quetschen für Knöpfe.
   ===================================================================== */
const MOTION=(()=>{
  /* Feder: Masse 1, Steifigkeit k, Dämpfung c; Weg von 0 nach 1 */
  function springCurve(k,c,steps){let x=0,v=0;const dt=1/120,pts=[];let t=0,settle=0;const out=[];
    while(t<3){const a=-k*(x-1)-c*v;v+=a*dt;x+=v*dt;t+=dt;out.push(x);if(Math.abs(x-1)<.002&&Math.abs(v)<.01){if(++settle>12)break}else settle=0}
    const n=steps||40;for(let i=0;i<=n;i++){const idx=Math.min(out.length-1,Math.round(i/n*(out.length-1)));pts.push(+out[idx].toFixed(4))}pts[pts.length-1]=1;
    return{css:'linear('+[0].concat(pts.slice(1)).join(',')+')',dur:Math.round(out.length*dt*1000)}}
  const S={spring:springCurve(170,14),soft:springCurve(120,16),snappy:springCurve(320,22),bouncy:springCurve(210,10)};
  const root=document.documentElement;let ok=true;try{ok=CSS.supports('transition-timing-function',S.spring.css)}catch(e){ok=false}
  for(const[k,v]of Object.entries(S)){root.style.setProperty('--'+(k==='spring'?'spring':'spring-'+k),ok?v.css:'cubic-bezier(.34,1.56,.64,1)');root.style.setProperty('--'+(k==='spring'?'spring':'spring-'+k)+'-dur',v.dur+'ms')}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  /* Element sanft verschwinden lassen, dann entfernen */
  function out(el,cls,ms,done){if(!el)return done&&done();if(reduce.matches){el.remove();return done&&done()}el.classList.add(cls||'m-out');setTimeout(()=>{el.remove();done&&done()},ms||200)}
  /* Kurzer Feder-Hüpfer (Auswahl, neue Münzen, Treffer) */
  function pop(el){if(!el||reduce.matches)return;el.classList.remove('m-pop');void el.offsetWidth;el.classList.add('m-pop')}
  /* Knöpfe: Feder-Quetschen bei Druck (auch Tasten) */
  addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button,.card,.iconbtn');if(b)pop(b)},{passive:true});
  return{S,out,pop,springCurve,get reduced(){return reduce.matches}}
})();
