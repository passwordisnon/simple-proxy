/* =====================================================================
   CYBORG-LABOR · perf.js · Grafik passt sich dem Rechner an
   Misst in der Welt alle paar Sekunden die Bildrate.
   - Grafik nie von Hand gewählt und unter 40 Bildern pro Sekunde auf
     «hoch»: automatisch auf «schnell» (einmal, mit kurzer Meldung).
   - Auch auf «schnell» noch unter 28: Auflösung schrittweise bis 60 %
     senken; bei Luft wieder hoch. Wird je Rechner gespeichert.
   Die Knöpfe «Grafik hoch/schnell» bleiben die Hand-Einstellung.
   ===================================================================== */
const PERF=(()=>{
  const KS='cyborg-labor-scale',KQ='cyborg-labor-grafik';
  let scale=1;try{const v=parseFloat(localStorage.getItem(KS));if(v>=.6&&v<=1)scale=v}catch(e){}
  let frames=0,acc=0,warm=6,lastT=performance.now(),cool=0;
  const userChose=()=>{try{return localStorage.getItem(KQ)!==null}catch(e){return true}};
  const save=()=>{try{localStorage.setItem(KS,String(scale))}catch(e){}};
  function relayout(){try{if(typeof GAME!=='undefined'&&GAME.resize)GAME.resize();if(typeof INTERIOR!=='undefined'&&INTERIOR.resize)INTERIOR.resize()}catch(e){}}
  function toFast(){HIGH=false;try{localStorage.setItem(KQ,JSON.stringify('schnell'))}catch(e){}
    const qb=document.getElementById('btnQual');if(qb){qb.setAttribute('aria-pressed',false);const lb=qb.querySelector('.lb');if(lb)lb.textContent=' Grafik schnell'}
    try{LAB.quality()}catch(e){}try{GAME.quality()}catch(e){}
    if(typeof UI!=='undefined')UI.toast('Die Grafik läuft jetzt auf «schnell», damit das Spiel flüssig bleibt. Oben rechts kannst du es ändern.',4200)}
  /* jede Bild-Runde aus der Hauptschleife */
  function frame(active){const now=performance.now(),gap=now-lastT;lastT=now;
    /* Tab im Hintergrund, Ladepause oder nicht in der Welt: nicht messen */
    if(!active||document.hidden||gap>2000){frames=0;acc=0;warm=Math.max(warm,3);return}
    if(warm>0){warm-=gap/1000;return}
    frames++;acc+=gap;if(acc<4000)return;
    const fps=frames*1000/acc;frames=0;acc=0;
    if(cool>0){cool--;return}
    if(HIGH&&fps<40&&!userChose()){toFast();warm=8;cool=1;return}
    if(!HIGH&&fps<28&&scale>.6){scale=Math.max(.6,+(scale-.15).toFixed(2));save();relayout();cool=1;return}
    if(fps>55&&scale<1){scale=Math.min(1,+(scale+.1).toFixed(2));save();relayout();cool=2}}
  try{if(typeof I18N!=='undefined'&&I18N.extend)I18N.extend('en',{'Die Grafik läuft jetzt auf «schnell», damit das Spiel flüssig bleibt. Oben rechts kannst du es ändern.':'Graphics are now set to “fast” so the game stays smooth. You can change this at the top right.'})}catch(e){}
  return{frame,debug:()=>({frames,acc:Math.round(acc),warm:+warm.toFixed(1),cool}),get scale(){return scale},set scale(v){scale=Math.max(.6,Math.min(1,v));save();relayout()}};
})();
