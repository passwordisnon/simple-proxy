/* =====================================================================
   CYBORG-LABOR · pwa.js · Eigenständige Version als App
   Ausserhalb von claude.ai meldet sich der Service Worker an (sw.js).
   So lässt sich das Spiel auf jedem PC installieren und startet danach
   auch ohne Internet. In claude.ai passiert hier nichts.
   ===================================================================== */
const PWA=(()=>{
  let prompt=null,installed=false;
  const standalone=()=>!(typeof NET!=='undefined'&&NET.inClaude())&&/^https?:$/.test(location.protocol);
  if(standalone()){
    try{const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.append(l)}catch(e){}
    if('serviceWorker' in navigator)addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(e=>console.warn('Service Worker',e))});
    addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e});
    addEventListener('appinstalled',()=>{installed=true;prompt=null});
  }
  async function install(){if(!prompt)return false;prompt.prompt();try{const r=await prompt.userChoice;installed=r&&r.outcome==='accepted'}catch(e){}prompt=null;return installed}
  return{standalone,install,get canInstall(){return!!prompt},get installed(){return installed||matchMedia('(display-mode: standalone)').matches}};
})();
