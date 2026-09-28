/* =====================================================================
   CYBORG-LABOR · ui.js
   DOM-Helfer, Fenster, Sprechblasen-Dialog, Toasts, 3D-Vorschaubilder.
   ===================================================================== */
const $=id=>document.getElementById(id);
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function btn(text,cls,on){const b=el('button','btn'+(cls?' '+cls:''),text);b.type='button';if(on)b.onclick=on;return b}
const fmt=n=>Math.round(n).toLocaleString('de-CH');

const UI={};
/* ---------- Toast ---------- */
let toastT=0;UI.toast=function(m,ms){const t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,ms||2600)};

/* ---------- Fenster ---------- */
const openWins=[];
UI.win=function(title,o){o=o||{};const veil=el('div','veil');const w=el('div','win'+(o.size?' '+o.size:''));w.setAttribute('role','dialog');w.setAttribute('aria-label',title);
  const h=el('div','wh');const t=el('h3',null,title);const x=el('button','xbtn','✕');x.setAttribute('aria-label','Schliessen');h.append(t,x);
  const b=el('div','wb');const f=el('div','wf');w.append(h,b);if(o.foot!==false)w.append(f);veil.append(w);document.body.append(veil);
  const api={veil,win:w,body:b,foot:f,title:t,closed:false,close(){if(api.closed)return;api.closed=true;veil.remove();openWins.splice(openWins.indexOf(api),1);SND.play('close',{vol:.6});o.onClose&&o.onClose()}};
  x.onclick=()=>api.close();veil.addEventListener('pointerdown',e=>{if(e.target===veil&&o.dismiss!==false)api.close()});openWins.push(api);SND.play('open',{vol:.6});
  if(o.foot===false)f.remove();return api};
UI.anyOpen=()=>openWins.length>0||!$('talk').hidden;
UI.closeTop=()=>{const w=openWins[openWins.length-1];if(w){w.close();return true}return false};

/* ---------- Dialog im Tierdorf-Stil ---------- */
/* UI.talk(name,[zeilen],{voice:{pitch,kind},choices:[..],color}) → Promise(index der Wahl oder -1) */
UI.talk=function(name,lines,o){o=o||{};return new Promise(res=>{
  const box=$('talk'),txt=$('talkText'),nm=$('talkName'),more=$('talkMore'),ch=$('talkChoices');box.hidden=false;nm.textContent=name;nm.style.background=o.color||'var(--pink)';ch.replaceChildren();
  let i=0,typing=null,full='';
  const show=()=>{full=lines[i];txt.textContent='';more.hidden=true;let k=0;SND.voice(full,o.voice||{});clearInterval(typing);
    typing=setInterval(()=>{k+=2;txt.textContent=full.slice(0,k);if(k>=full.length){clearInterval(typing);typing=null;done()}},28)};
  const done=()=>{if(i<lines.length-1||!o.choices){more.hidden=false;return}ch.replaceChildren(...o.choices.map((c,ci)=>{const b=el('button',null,c);b.type='button';b.onclick=e=>{e.stopPropagation();finish(ci)};return b}));ch.querySelector('button')?.focus()};
  const adv=()=>{if(typing){clearInterval(typing);typing=null;txt.textContent=full;done();return}if(o.choices&&i===lines.length-1)return;if(i<lines.length-1){i++;SND.play('pep',{vol:.25});show()}else finish(-1)};
  const finish=r=>{box.hidden=true;box.onclick=null;document.removeEventListener('keydown',kd,true);ch.replaceChildren();res(r)};
  const kd=e=>{if(['Enter',' ','e','E'].includes(e.key)&&!ch.children.length){e.preventDefault();e.stopPropagation();adv()}else if(e.key==='Escape'){e.stopPropagation();finish(-1)}
    else if(ch.children.length&&/^[1-9]$/.test(e.key)){const b=ch.children[+e.key-1];if(b){e.stopPropagation();b.click()}}};
  box.onclick=()=>adv();document.addEventListener('keydown',kd,true);show()})};

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
