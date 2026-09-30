/* =====================================================================
   CYBORG-LABOR · ledger.js
   Fangbuch: Jeder Fang (Fisch, Insekt, Fundstück) bekommt einen eigenen,
   unveränderlichen Eintrag – Kennung, Planet, Koordinaten, Wetter, Uhrzeit,
   Grösse und die Cyborg-Bauart, mit der gefangen wurde. Einträge werden
   nur angehängt, nie überschrieben (eingefroren); das Buch zeigt Rekorde.
   ===================================================================== */
const LEDGER=(()=>{
  const MAX=800;const L=()=>SAVE.ledger=Array.isArray(SAVE.ledger)?SAVE.ledger:[];
  const BASE={S:4,M:12,L:28,XL:60};/* cm */
  function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  function uid(){try{if(crypto.randomUUID)return crypto.randomUUID()}catch(e){}return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
  function record(kind,def,p){const G=GAME.G;const base=kind==='fish'?BASE[def.size]||12:kind==='bug'?2.5+(def.rarity||1)*1.8:10;
    const size=Math.max(base*.45,+(base*(1+gauss()*.14)).toFixed(1));const lat=p?+(Math.asin(Math.max(-1,Math.min(1,p.y)))*180/Math.PI).toFixed(2):null,lon=p?+(Math.atan2(p.z,p.x)*180/Math.PI).toFixed(2):null;
    const me=GAME.me&&GAME.me.d;const prev=best(kind,def.id);
    const rec=Object.freeze({id:uid(),kind,species:def.id,planet:G&&G.id,lat,lon,weather:typeof WEATHER!=='undefined'&&WEATHER.cur||null,hour:+GAMETIME.hour().toFixed(2),ts:Date.now(),size,
      build:me?Object.freeze({skin:me.body&&me.body.skin,head:me.parts&&me.parts.kopf,legs:me.parts&&me.parts.beine}):null,record:!prev||size>prev.size});
    const list=L();list.push(rec);if(list.length>MAX)list.splice(0,list.length-MAX);return rec}
  function of(kind,id){return L().filter(r=>r.kind===kind&&r.species===id)}
  function best(kind,id){let b=null;for(const r of L())if(r.kind===kind&&r.species===id&&(!b||r.size>b.size))b=r;return b}
  function describe(r){if(!r)return'';const d=new Date(r.ts);const pl=(PLANETS[r.planet]||{}).n||r.planet;
    return r.size.toFixed(1)+' cm · '+pl+' · '+String(Math.floor(r.hour)).padStart(2,'0')+':'+String(Math.floor(r.hour%1*60)).padStart(2,'0')+(r.weather?' · '+r.weather:'')+' · '+d.toLocaleDateString('de-DE')}
  return{record,of,best,describe}
})();
