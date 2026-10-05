/* =====================================================================
   CYBORG-LABOR · sw.js · Service Worker für die eigenständige Version
   Beim Installieren holt er die Seite und alle Skripte, die index.html
   einbindet (gut 4 MB). Modelle, Musik und Bibliotheken von den CDNs
   landen beim ersten Gebrauch im Speicher. Danach startet das Spiel auch
   ohne Internet; nur der Mehrspieler-Modus braucht eine Verbindung.
   Neue Versionen: zuerst aus dem Speicher spielen, im Hintergrund
   nachladen, beim nächsten Start ist die neue Version da.
   ===================================================================== */
const VERSION='cl-2026-10-05d';
const CORE='core-'+VERSION,RUN='run-'+VERSION;
const CDN=/^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
/* welche CDN-Dateien schon im Speicher liegen (synchron prüfbar, damit fehlende ganz normal geladen werden) */
const HAVE=new Set();
const fillHave=async()=>{for(const k of await caches.keys())for(const q of await (await caches.open(k)).keys())if(CDN.test(q.url))HAVE.add(q.url)};fillHave().catch(()=>{});

self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(CORE);
  const res=await fetch('index.html',{cache:'no-cache'});const html=await res.clone().text();await c.put('index.html',res);
  const files=new Set(['./','wired.css','manifest.webmanifest','lang/en.js','lang/de.json','icons/icon-192.png','icons/icon-512.png']);
  for(const m of html.matchAll(/src="(js\/[^"]+)"/g))files.add(m[1]);
  for(const m of html.matchAll(/(?:src|href)="(https:\/\/[^"]+)"/g))if(CDN.test(m[1]))files.add(m[1]);
  /* einzelne Fehler (z. B. eine Schrift) dürfen die Installation nicht verhindern */
  await Promise.all([...files].map(f=>c.add(new Request(f,{cache:'no-cache'})).catch(()=>{})));
  await fillHave().catch(()=>{});self.skipWaiting()})())});

self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CORE&&k!==RUN)await caches.delete(k);await self.clients.claim()})())});

self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const same=u.origin===self.location.origin;if(!same&&!CDN.test(r.url))return;/* Vermittler und alles andere direkt */
  if(same&&u.pathname.endsWith('/sw.js'))return;
  /* CDN-Dateien nur aus dem Speicher beantworten (beim Installieren geholt). Fehlt eine, lädt der Browser sie
     ganz normal, so kann der Service Worker das Laden nie schlechter machen als ohne ihn. */
  if(!same){if(HAVE.has(r.url))e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));return}
  e.respondWith((async()=>{
    const hit=await caches.match(r,{ignoreSearch:same});
    const inCore=same&&!!(await (await caches.open(CORE)).match(r,{ignoreSearch:true}));
    const go=()=>fetch(r).then(async res=>{if(res&&(res.ok||res.type==='opaque')){const c=await caches.open(inCore?CORE:RUN);c.put(r,res.clone()).catch(()=>{})}return res}).catch(()=>null);
    /* Code im Hintergrund auffrischen; Modelle, Musik und CDN-Dateien ändern sich nicht und bleiben im Speicher */
    const code=same&&/(\.(js|html|css|json|webmanifest)|\/)$/.test(u.pathname);
    if(hit){if(code)e.waitUntil(go());return hit}
    const res=await go();if(res)return res;
    if(r.mode==='navigate'){const idx=await caches.match('index.html');if(idx)return idx}
    return new Response('',{status:504,statusText:'offline'})})())});
