/* =====================================================================
   CYBORG-LABOR · ui.js
   DOM-Helfer, Fenster, Sprechblasen-Dialog, Toasts, 3D-Vorschaubilder.
   ===================================================================== */
const $=id=>document.getElementById(id);
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function btn(text,cls,on){const b=el('button','btn'+(cls?' '+cls:''),text);b.type='button';if(on)b.onclick=on;return b}
const fmt=n=>Math.round(n).toLocaleString('de-CH');

/* ---------- Gezeichnete Symbole (keine Emoji): 24er-Raster, runde Linien ---------- */
const ICONS={
  dna:'<path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12M8 7h8M8 17h8"/>',
  bag:'<path d="M5 9h14l-1 11H6z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/>',
  book:'<path d="M4 5c3-1 6-1 8 1v14c-2-2-5-2-8-1zM20 5c-3-1-6-1-8 1v14c2-2 5-2 8-1z"/>',
  paw:'<circle cx="12" cy="15" r="4" fill="currentColor"/><circle cx="6" cy="10" r="1.8" fill="currentColor"/><circle cx="9.5" cy="6" r="1.8" fill="currentColor"/><circle cx="14.5" cy="6" r="1.8" fill="currentColor"/><circle cx="18" cy="10" r="1.8" fill="currentColor"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2H18a3 3 0 0 0 3-3c0-6-4-11-9-11z"/><circle cx="7.5" cy="11" r="1.3" fill="currentColor"/><circle cx="10" cy="7" r="1.3" fill="currentColor"/><circle cx="15" cy="7.5" r="1.3" fill="currentColor"/>',
  house:'<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',
  chat:'<path d="M4 5h16v10H10l-4 4v-4H4z"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 7 2 8 0"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>',
  map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  school:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  wave:'<path d="M7 12V6a1.5 1.5 0 0 1 3 0v5M10 11V4.5a1.5 1.5 0 0 1 3 0V11M13 11V5.5a1.5 1.5 0 0 1 3 0V13M16 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-12 0v-3a1.5 1.5 0 0 1 3 0"/>',
  dance:'<circle cx="13" cy="4" r="2"/><path d="M13 7l-2 6 4 3-1 5M11 13l-4 2M13 8l5-2M15 16l4 1"/>',
  party:'<path d="M4 20l5-13 8 8z"/><path d="M14 4l1 2M19 6l-2 1M20 11l-2-.5M11 3l.5 2"/>',
  heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" fill="currentColor"/>',
  laugh:'<circle cx="12" cy="12" r="9"/><path d="M7 13h10c-1 4-9 4-10 0z" fill="currentColor"/><path d="M7.5 9.5l2 .5M16.5 9.5l-2 .5"/>',
  exclaim:'<path d="M12 4v10"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/>',
  zzz:'<path d="M4 8h5l-5 6h5M12 4h4l-4 5h4M15 13h5l-5 6h5"/>',
  think:'<path d="M5 12a6 5 0 0 1 12-2 4 4 0 0 1 1 8H8a4 4 0 0 1-3-6z"/><circle cx="6" cy="20" r="1.2"/><circle cx="3.5" cy="22" r=".8"/>',
  bow:'<circle cx="8" cy="7" r="2.4"/><path d="M10 9l6 3v8M16 12l3-1M10 9l-1 6 3 5"/>',
  sad:'<circle cx="12" cy="12" r="9"/><path d="M8 16c1-2 7-2 8 0"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M16 12c0 1.5 1 2.5 1 3"/>',
  spiral:'<path d="M12 12a1.5 1.5 0 1 1 1.5 1.5A3 3 0 1 1 15 9a4.5 4.5 0 1 1-6 7.5A6 6 0 1 1 18 6"/>',
  leaf:'<path d="M5 19C5 9 11 5 20 4c0 9-4 15-14 15z"/><path d="M5 19l9-9"/>',
  eyes:'<ellipse cx="8" cy="12" rx="3" ry="4"/><ellipse cx="16" cy="12" rx="3" ry="4"/><circle cx="9" cy="13" r="1.3" fill="currentColor"/><circle cx="17" cy="13" r="1.3" fill="currentColor"/>',
  fish:'<path d="M3 12c3-5 10-6 14 0-4 6-11 5-14 0z"/><path d="M17 12l4-3v6z"/><circle cx="7" cy="11" r=".9" fill="currentColor"/>',
  rod:'<path d="M4 20L18 4M18 4v9"/><circle cx="18" cy="15" r="2"/>',
  ball:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/><path d="M12 3v4M21 10l-5 0M16.5 20l-2-5.5M7.5 20l2-5.5M3 10h5"/>',
  note:'<path d="M9 18V5l10-2v13"/><circle cx="7" cy="18" r="2.5" fill="currentColor"/><circle cx="17" cy="16" r="2.5" fill="currentColor"/>',
  sparkle:'<path d="M12 3l2 6 6 2-6 2-2 7-2-7-6-2 6-2z" fill="currentColor"/>',
  phone:'<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10 18h4"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  relax:'<path d="M3 17c3-3 6-3 9 0s6 3 9 0"/><path d="M7 10c1 1 3 1 4 0M13 10c1 1 3 1 4 0"/>',
  angry:'<circle cx="12" cy="12" r="9"/><path d="M7 8l3 2M17 8l-3 2M8 17c1-2 7-2 8 0"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 11c.5.5.5 1 .5 2h6c0-1 0-1.5.5-2A6 6 0 0 0 12 3z"/>',
  food:'<path d="M5 11h14a7 7 0 0 1-14 0zM4 11h16M9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
  bed:'<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',
  shower:'<path d="M4 20V8a4 4 0 0 1 8 0M9 8h6M11 12l-1 2M14 12l0 2M17 12l1 2"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>',
  coin:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 0 1 0 3h-3"/>',
  wrench:'<path d="M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 1-2-2z"/>',
  rocket:'<path d="M12 2c4 3 5 8 3 13H9C7 10 8 5 12 2z"/><circle cx="12" cy="9" r="1.8"/><path d="M9 15l-3 3 3 .5M15 15l3 3-3 .5M11 18l1 3 1-3"/>'
};
function ICON(name,cls){return`<svg class="ico ${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.sparkle}</svg>`}
function iconEl(name,cls){const s=el('span','icw');s.innerHTML=ICON(name,cls);return s}
const UI={};
/* ---------- Toast ---------- */
let toastT=0;UI.toast=function(m,ms){const t=$('toast');t.textContent=m;t.hidden=false;t.style.animation='none';void t.offsetWidth;t.style.animation='';clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,ms||2600)};

/* ---------- Fenster ---------- */
const openWins=[];
UI.win=function(title,o){o=o||{};const veil=el('div','veil');const w=el('div','win'+(o.size?' '+o.size:''));w.setAttribute('role','dialog');w.setAttribute('aria-label',title);
  const h=el('div','wh');const t=el('h3',null,title);const x=el('button','xbtn');x.innerHTML=ICON('close');x.setAttribute('aria-label','Schliessen');h.append(t,x);
  const b=el('div','wb');const f=el('div','wf');w.append(h,b);if(o.foot!==false)w.append(f);veil.append(w);document.body.append(veil);
  const api={veil,win:w,body:b,foot:f,title:t,closed:false,close(){if(api.closed)return;api.closed=true;if(typeof MOTION!=='undefined')MOTION.out(veil,'m-out',170);else veil.remove();openWins.splice(openWins.indexOf(api),1);SND.play('close',{vol:.6});o.onClose&&o.onClose()}};
  x.onclick=()=>api.close();veil.addEventListener('pointerdown',e=>{if(e.target===veil&&o.dismiss!==false)api.close()});openWins.push(api);SND.play('open',{vol:.6});
  if(o.foot===false)f.remove();return api};
UI.anyOpen=()=>openWins.length>0||!$('talk').hidden;
UI.closeTop=()=>{const w=openWins[openWins.length-1];if(w){w.close();return true}return false};

/* ---------- Dialog im Tierdorf-Stil ---------- */
/* UI.talk(name,[zeilen],{voice:{pitch,kind},choices:[..],color}) → Promise(index der Wahl oder -1) */
UI.talk=function(name,lines,o){o=o||{};return new Promise(res=>{
  const box=$('talk'),txt=$('talkText'),nm=$('talkName'),more=$('talkMore'),ch=$('talkChoices');box.hidden=false;nm.textContent=name;nm.style.background=o.color||'var(--pink)';ch.replaceChildren();
  let i=0,typing=null,full='';
  const plain=h=>o.html?h.replace(/<[^>]+>/g,''):h;
  const show=()=>{full=lines[i];txt.textContent='';more.hidden=true;let k=0;const pf=plain(full);SND.voice(pf,o.voice||{});clearInterval(typing);
    UI.typing=true;typing=setInterval(()=>{k+=2;txt.textContent=pf.slice(0,k);if(k>=pf.length){clearInterval(typing);typing=null;UI.typing=false;if(o.html)txt.innerHTML=full;done()}},28)};
  const done=()=>{if(i<lines.length-1||!o.choices){more.hidden=false;return}ch.replaceChildren(...o.choices.map((c,ci)=>{const b=el('button',null,c);b.type='button';b.onclick=e=>{e.stopPropagation();finish(ci)};return b}));ch.querySelector('button')?.focus()};
  const adv=()=>{if(typing){clearInterval(typing);typing=null;if(o.html)txt.innerHTML=full;else txt.textContent=full;done();return}if(o.choices&&i===lines.length-1)return;if(i<lines.length-1){i++;SND.play('pep',{vol:.25});show()}else finish(-1)};
  const finish=r=>{UI._talkEnd=null;UI.typing=false;box.hidden=true;box.onclick=null;document.removeEventListener('keydown',kd,true);ch.replaceChildren();res(r)};
  const kd=e=>{if(['Enter',' ','e','E'].includes(e.key)&&!ch.children.length){e.preventDefault();e.stopPropagation();adv()}else if(e.key==='Escape'){e.stopPropagation();finish(-1)}
    else if(ch.children.length&&/^[1-9]$/.test(e.key)){const b=ch.children[+e.key-1];if(b){e.stopPropagation();b.click()}}};
  box.onclick=()=>adv();document.addEventListener('keydown',kd,true);UI._talkEnd=()=>{clearInterval(typing);finish(-1)};show()})};
UI.talkAbort=()=>{if(UI._talkEnd)UI._talkEnd()};

/* ---------- Geld / HUD ---------- */
UI.hud=function(){const m=$('money');if(m)m.querySelector('span').textContent=fmt(SAVE.money)};

/* ---------- 3D-Vorschaubilder (ein Renderer für alles) ---------- */
const TH=(()=>{const c=document.createElement('canvas');const r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true,preserveDrawingBuffer:true});r.setSize(200,200,false);r.outputEncoding=THREE.sRGBEncoding;
  const sc=new THREE.Scene();cozyLights(sc);const cam=new THREE.PerspectiveCamera(30,1,.01,500);return{r,c,sc,cam}})();
const thumbCache=new Map(),thumbQ=[],thumbWant=new Set();
function renderThumbGroup(g,dirv){g.updateMatrixWorld(true);TH.sc.add(g);const box=new THREE.Box3().setFromObject(g.userData.focus&&!g.userData.focus.children.length?g:(g.userData.focus||g));if(box.isEmpty())box.setFromObject(g);
  const ctr=box.getCenter(new V3()),sz=box.getSize(new V3());const rad=Math.max(sz.x,sz.y,sz.z)*.62+.02;const dir=(dirv||new V3(.55,.35,1)).clone().normalize();
  TH.cam.position.copy(ctr).addScaledVector(dir,rad/Math.tan(15*PI/180));TH.cam.lookAt(ctr);TH.cam.near=rad*.05;TH.cam.far=rad*40;TH.cam.updateProjectionMatrix();TH.r.render(TH.sc,TH.cam);
  const url=TH.c.toDataURL('image/png');TH.sc.remove(g);disposeTree(g);return url}
/* registriert einen Bauplan unter key; gibt <img> zurück, das gefüllt wird, sobald sichtbar */
const thumbMakers=new Map();
UI.thumb=function(key,make,o){const img=new Image();img.alt='';img.dataset.tk=key;img.decoding='async';if(thumbCache.has(key)){img.src=thumbCache.get(key);return img}
  thumbMakers.set(key,{make,dir:o&&o.dir});img.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';thumbIO.observe(img);return img};
const thumbIO=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting){const k=e.target.dataset.tk;thumbIO.unobserve(e.target);if(!thumbWant.has(k)){thumbWant.add(k);thumbQ.push(k)}}}},{rootMargin:'250px'});
UI.pumpThumbs=function(){let n=0;const t0=performance.now();while(thumbQ.length&&n<3&&performance.now()-t0<24){const k=thumbQ.shift();let url='';if(thumbCache.has(k))url=thumbCache.get(k);else{const m=thumbMakers.get(k);if(m){try{const g=m.make();url=renderThumbGroup(g,m.dir)}catch(e){console.warn('thumb',k,e)}}thumbCache.set(k,url)}
  document.querySelectorAll(`img[data-tk="${CSS.escape(k)}"]`).forEach(x=>{if(url)x.src=url});n++}};
/* fertige Bauer */
const THUMB_BODY={seg:2,size:1,skin:'haut',color:0,shape:'ei'};
UI.partThumb=(slot,id)=>UI.thumb('p:'+slot+':'+id,()=>{const d={body:THUMB_BODY,parts:{kopf:'mensch',augen:'zwei',arme:'mensch',beine:'mensch',extras:[]}};if(slot==='extras')d.parts.extras=[id];else d.parts[slot]=id;
  const g=buildCreature(d,{q:.9,only:slot,noShadow:true,fur:false});g.userData.tick(1.3,false,0);return g});
UI.objThumb=(key,build,dir)=>UI.thumb(key,()=>{const g=new THREE.Group();QF=.9;const M=THUMB_MATS();build(g,M);QF=1;addOutlines(g);return g},{dir});
let _tm=null;const THUMB_MATS=()=>_tm||(_tm=makeMats({skin:'haut',color:0}));
UI.creatureThumb=(d,key)=>UI.thumb(key||('c:'+hashStr(JSON.stringify(looks(d)))),()=>{const g=buildCreature(d,{q:.8,noShadow:true});g.userData.tick(1.3,false,0);return g},{dir:new V3(.35,.2,1)});

/* ---------- Kopieren ---------- */
UI.copy=async function(t,okMsg,sel){try{await navigator.clipboard.writeText(t);UI.toast(okMsg)}catch(e){if(sel){const r=document.createRange();r.selectNodeContents(sel);const s=getSelection();s.removeAllRanges();s.addRange(r)}UI.toast('Kopieren ging nicht. Der Text ist markiert, bitte selbst kopieren.')}};
/* Zwei-Klick-Bestätigung ohne confirm() */
UI.armed=function(b,label,fn){b.onclick=()=>{if(b.dataset.arm!=='1'){b.dataset.arm='1';const old=b.textContent;b.textContent=label;setTimeout(()=>{b.dataset.arm='';b.textContent=old},3000);return}b.dataset.arm='';fn()}};
