/* =====================================================================
   CYBORG-LABOR · furniture.js
   Möbel-Katalog, Tapeten/Böden und Gebäude (Häuser, Läden, Museum ...).
   Einheit: 1 = eine Rasterzelle im Haus (≈ halbe Cyborg-Höhe bei s=1 ist ~1.5).
   ===================================================================== */
const FURN=[];
/* furn(id,{n,cat,price,planet,size:[w,d],h,wall,b:(g,m,opt,rnd)=>{}})
   cat: sitz|tisch|bett|licht|deko|pflanze|technik|lager|teppich|wand|musik|kueche|bad|spiel
   planet: kompost|schrott|korallen|alle   · wall:true = hängt an der Wand (Rückseite bei z=-size[1]/2)
   Modell: Grundfläche zentriert um (0,0,0), Boden y=0, Vorderseite zeigt nach +z. */
function furn(id,o){FURN.push(Object.assign({id},o))}
const findFurn=id=>FURN.find(f=>f.id===id);
/* Tapeten & Böden: kachelbare Canvas-Motive (256×256) */
const WALLPAPERS=[],FLOORS=[];
function wallpaper(id,o){WALLPAPERS.push(Object.assign({id},o))}
function floorpat(id,o){FLOORS.push(Object.assign({id},o))}
/* Gebäude-Bauer werden unten definiert:
   buildHouse(style,m) · buildShop(planet,m) · buildMuseum(m) · buildRocketPad(m) · buildNoticeBoard(m) · buildStage(m)
   · buildBench(m) · buildStreetLamp(m) · buildMailbox(m) · buildSignpost(m,text) · buildFountain(m) · buildBridge(m,len) · buildPaintStudio(m)

   Zusätzliche Konventionen (vom Spiel optional auszuwerten):
   - Wand-Möbel (wall:true) sind auf ihrer Aufhänge-Höhe modelliert (Boden des Raums = y 0), Rückseite bei z=-size[1]/2.
   - g.userData.light = {p:[x,y,z], c:'#farbe', i:stärke}  → Punktlicht für Lampen.
   - g.userData.tick  = (t)=>{}                            → sanfte Idle-Animation (Fische, Plasmakugel, Flaggen ...).
   - g.userData.seat  = [x,y,z] (Sitzpunkt) · g.userData.sleep = [x,y,z] (Liegepunkt) bei Sitz-/Bettmöbeln.
   - surfTex('wall'|'floor', id, repeat) liefert eine kachelnde THREE.Texture der Tapete/des Bodens. */

(function(){
/* ============================ Helfer ============================ */
const B=(g,w,h,d,rad,mat,p,r,sc)=>P(g,G.bx(w,h,d,rad),mat,p,r,sc);
const C=(g,rt,rb,h,mat,p,r,sc)=>P(g,G.cy(rt,rb,h),mat,p,r,sc);
const S=(g,r,mat,p,sc)=>P(g,G.s(r),mat,p,null,sc);
const Y=new V3(0,1,0);
/* Mesh entlang einer Normale ausrichten */
function orient(o,n){o.quaternion.setFromUnitVectors(Y,new V3(n[0],n[1],n[2]).normalize());return o}
function rr(x,x0,y0,w,h,r){x.beginPath();x.moveTo(x0+r,y0);x.arcTo(x0+w,y0,x0+w,y0+h,r);x.arcTo(x0+w,y0+h,x0,y0+h,r);x.arcTo(x0,y0+h,x0,y0,r);x.arcTo(x0,y0,x0+w,y0,r);x.closePath()}
const FONT='"Trebuchet MS","Verdana","DejaVu Sans",sans-serif';
/* Holzmaserung (hell, wird eingefärbt) */
const grainTex=()=>ctex('fu-grain',128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='rgba(120,80,40,.13)';x.lineWidth=3;
  for(let i=0;i<8;i++){const y=i*16+5;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(w*.3,y+5,w*.6,y-5,w,y);x.stroke()}
  x.fillStyle='rgba(120,80,40,.12)';x.beginPath();x.ellipse(40,70,6,3,0,0,TAU);x.fill()});
const Wd=(m,col)=>m.tex('grain'+col,grainTex(),{color:col});
/* Canvas-Schild mit Text (mehrzeilig über \n) */
function signTex(key,text,o){o=o||{};return ctex('fu-sign-'+key,o.w||512,o.h||128,(x,w,h)=>{
  x.fillStyle=o.bg||PAL.cream;x.fillRect(0,0,w,h);
  if(o.border!==false){x.strokeStyle=o.bd||o.fg||PAL.ink;x.lineWidth=h*.05;rr(x,h*.06,h*.06,w-h*.12,h-h*.12,h*.12);x.stroke()}
  if(o.deco)o.deco(x,w,h);
  const lines=String(text).split('\n');let fs=(o.fs||.62)*h/lines.length;x.font=`bold ${fs}px ${FONT}`;
  const mw=Math.max(...lines.map(l=>x.measureText(l).width));if(mw>w*.86){fs*=w*.86/mw;x.font=`bold ${fs}px ${FONT}`}
  x.textAlign='center';x.textBaseline='middle';x.fillStyle=o.fg||PAL.ink;
  if(o.glow){x.shadowColor=o.glow;x.shadowBlur=h*.12}
  lines.forEach((l,i)=>x.fillText(l,w/2,h/2+(i-(lines.length-1)/2)*fs*1.08+fs*.04))})}
/* leuchtendes Textur-Material (Bildschirme, Neon) */
const MB={};function glowTex(key,tex){return MB[key]||(MB[key]=(()=>{const mm=new THREE.MeshBasicMaterial({map:tex,toneMapped:false,alphaTest:.5});mm.userData.glow=true;return mm})())}
/* bemalte Fläche (Plane) */
function decal(g,m,tex,key,w,h,p,r,glow){const mt=glow?glowTex(key,tex):m.tex(key,tex,{alphaTest:.5});const o=P(g,G.pl(w,h),mt,p,r);o.castShadow=false;return o}
/* Formen */
function archShape(w,h,r){const s=new THREE.Shape();r=Math.min(r,w/2,h);s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-r);s.quadraticCurveTo(w/2,h,w/2-r,h);s.lineTo(-w/2+r,h);s.quadraticCurveTo(-w/2,h,-w/2,h-r);s.closePath();return s}
function flowerShape(R,n){const p=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU;const r=i%2?R*.42:R;p.push([Math.cos(a)*r,Math.sin(a)*r])}return sshp(p)}
const leafShape=(l,w)=>sshp([[0,0],[w*.6,l*.3],[w*.5,l*.7],[0,l],[-w*.5,l*.7],[-w*.6,l*.3]]);
const ringPts=(n,R,jit,rnd)=>range(n,(t,i)=>{const a=i/n*TAU;const r=R*(1+(rnd?(rnd()-.5)*jit:0));return[Math.cos(a)*r,Math.sin(a)*r]});
/* Gesicht (Kulleraugen, Lächeln, Bäckchen) – zeigt nach +z der Gruppe */
function face(g,m,p,s,o){o=o||{};const f=grp(g,p,[o.rx||0,o.ry||0,0]);
  both(x=>{const e=grp(f,[x*.27*s,.07*s,0]);P(e,G.s(.12*s),m.eye(),null,null,[.8,1.1,.45]);const h=P(e,G.s(.035*s),m.flat('#ffffff'),[.03*s,.05*s,.05*s]);h.castShadow=false});
  if(o.mouth!==false)P(f,G.to(.09*s,.024*s,PI*.8),m.c(o.mc||PAL.ink),[0,-.1*s,.01*s],[0,0,PI+PI*.1]);
  if(o.cheek!==false)both(x=>{const c=P(f,G.s(.07*s),m.cheek(),[x*.46*s,-.06*s,.01*s],null,[1.2,.7,.3]);c.userData.noOutline=true;c.castShadow=false});return f}
/* Blume: Stiel + Blüte + Mitte */
function flower(g,m,p,col,s,tilt){const f=grp(g,p,[tilt||0,0,(tilt||0)*.6]);s=s||1;bt(f,[0,0,0],[0,.3*s,0],.018*s,m.c(PAL.moss));
  P(f,G.puff(flowerShape(.1*s,5),.025*s),m.c(col),[0,.3*s,0],[-PI/2,0,0]);S(f,.04*s,m.c(PAL.lemon),[0,.32*s,0],[1,.6,1]);return f}
/* Blätterbusch */
function bush(g,m,p,s,col,n,rnd,up){const b=grp(g,p);n=n||6;const lm=m.c(col||PAL.leaf);
  for(let i=0;i<n;i++){const a=i/n*TAU+(rnd?rnd()*.4:0);const l=P(b,G.puff(leafShape(.42*s,.2*s),.05*s),lm,[0,0,0],[0,0,0]);l.rotation.set(0,-a+PI/2,0,'YXZ');l.rotateX(-(up??.55)-(i%2)*.25)}return b}
/* Blumentopf (Terrakotta) – gibt Oberkante zurück */
function pot(g,m,p,r,h,col){const pg=grp(g,p);P(pg,G.la([[0,0],[r*.78,0],[r*.84,.1*h],[r,h*.78],[r*1.12,h*.8],[r*1.14,h],[r*.9,h],[0,h*.96]]),m.c(col||PAL.terracotta),[0,0,0]);
  C(pg,r*.92,r*.92,.02,m.c(PAL.choc),[0,h*.93,0]);return pg}
/* Punkte auf einer (skalierten) Halbkugel */
function capDots(g,m,y0,r,sy,n,col,rnd,sz){const mt=m.c(col);for(let i=0;i<n;i++){const ph=.3+rnd()*1.0,th=i/n*TAU+rnd()*.6;const d=[Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)];
  const o=P(g,G.s(sz*(.7+rnd()*.5)),mt,[d[0]*r,y0+d[1]*r*sy,d[2]*r],null,[1,.3,1]);orient(o,[d[0]/r,d[1]/(r*sy),d[2]/r])}}
/* 4 Beine */
function legs4(g,mat,w,d,h,r,ball){for(const x of[-1,1])for(const z of[-1,1]){C(g,r,r*.8,h,mat,[x*w/2,h/2,z*d/2]);if(ball)S(g,r*1.25,ball,[x*w/2,r*.9,z*d/2])}}
/* weiche Linie (Tube) */
const tu=(g,pts,r,mat,r2)=>P(g,G.tu(pts,r,r2),mat);
/* Textur-Wiederholung: geteilte Kopie einer gecachten Canvas-Textur */
const RT={};function rtex(tex,rx,ry){const k=tex.uuid+'|'+rx+'|'+ry;if(RT[k])return RT[k];const t=tex.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.needsUpdate=true;return RT[k]=t}
/* Geometrien zusammenführen (Zäune, Netze) → ein Mesh */
function mergeInto(g,mat,parts){const BU=THREE.BufferGeometryUtils;const geos=parts.map(([geo,p,r,s])=>{const o=new THREE.Object3D();if(p)o.position.set(...p);if(r)o.rotation.set(r[0]||0,r[1]||0,r[2]||0);if(s!=null){typeof s==='number'?o.scale.setScalar(s):o.scale.set(...s)}o.updateMatrix();const q=geo.index?geo.toNonIndexed():geo.clone();q.applyMatrix4(o.matrix);if(q.hasAttribute('uv2'))q.deleteAttribute('uv2');return q});
  if(BU&&BU.mergeBufferGeometries){const mg=BU.mergeBufferGeometries(geos,false);if(mg)return P(g,mg,mat)}
  const gg=grp(g);geos.forEach(q=>P(gg,q,mat));return gg}
/* Tapeten-/Boden-Zeichenhelfer: an allen 9 Nachbarpositionen zeichnen → nahtlos */
function wrap(w,h,f){for(const dx of[-w,0,w])for(const dy of[-h,0,h])f(dx,dy)}

/* ===== gemeinsame Texturen ===== */
const quiltTex=(key,cols)=>ctex('fu-quilt-'+key,256,256,(x,w,h)=>{const n=4,s=w/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){x.fillStyle=cols[(i+j*3)%cols.length];x.fillRect(i*s,j*s,s,s);
  if((i+j)%2){x.fillStyle='rgba(255,255,255,.55)';for(let k=0;k<4;k++){x.beginPath();x.arc(i*s+s*(.25+(k%2)*.5),j*s+s*(.25+(k>>1)*.5),s*.08,0,TAU);x.fill()}}}
  x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=3;x.setLineDash([8,6]);for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*s,0);x.lineTo(i*s,h);x.stroke();x.beginPath();x.moveTo(0,i*s);x.lineTo(w,i*s);x.stroke()}});
const tileTex=(key,n,grout,shine)=>ctex('fu-tile-'+key,256,256,(x,w,h)=>{x.fillStyle=grout||'#d9cfc0';x.fillRect(0,0,w,h);const s=w/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){x.fillStyle='#ffffff';rr(x,i*s+4,j*s+4,s-8,s-8,s*.15);x.fill();
  if(shine!==false){x.fillStyle='rgba(0,0,0,.08)';rr(x,i*s+s*.18,j*s+s*.18,s*.64,s*.64,s*.2);x.fill();x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.ellipse(i*s+s*.3,j*s+s*.28,s*.1,s*.05,-.6,0,TAU);x.fill()}}});
const stripeTex=(key,a,b,n,vert)=>ctex('fu-str-'+key,128,128,(x,w,h)=>{x.fillStyle=a;x.fillRect(0,0,w,h);x.fillStyle=b;const s=w/n;for(let i=0;i<n;i+=2){if(vert)x.fillRect(i*s,0,s,h);else x.fillRect(0,i*s,w,s)}});

/* ======================================================================
   MÖBEL · Kompost-Planet & Basis
   ====================================================================== */
furn('holzbett',{n:'Holzbett',cat:'bett',price:1200,planet:'kompost',size:[1,2],h:1.1,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.oak),dk=Wd(m,PAL.wood);
  for(const [x,z,h] of[[-.43,-.9,1.0],[.43,-.9,1.0],[-.43,.9,.66],[.43,.9,.66]]){C(g,.055,.065,h,dk,[x,h/2,z]);S(g,.085,dk,[x,h+.04,z])}
  P(g,G.puff(archShape(.78,.72,.3),.05),wd,[0,.26,-.9]);P(g,G.heart(.08,.035),m.gloss(PAL.rose),[0,.74,-.85]);
  P(g,G.puff(archShape(.78,.36,.14),.05),wd,[0,.26,.9]);
  B(g,.86,.16,1.76,.05,dk,[0,.3,0]);B(g,.82,.16,1.7,.07,m.c(PAL.cream),[0,.44,0]);
  B(g,.9,.14,1.12,.06,m.tex('quilt-k',quiltTex('k',[PAL.mint,PAL.peach,PAL.butter,PAL.sky])),[0,.47,.3]);
  B(g,.92,.07,.16,.035,m.c(PAL.white),[0,.535,-.24]);
  B(g,.6,.13,.3,.065,m.plush(PAL.white),[0,.58,-.66],[-.25,0,0]);
  g.userData.sleep=[0,.6,0]}});

furn('pilzlampe',{n:'Pilzlampe',cat:'licht',price:450,planet:'kompost',size:[1,1],h:1.25,b:(g,m,o,rnd)=>{
  P(g,G.la([[0,0],[.3,0],[.32,.05],[.2,.12],[.17,.4],[.19,.75],[.16,.9],[0,.92]]),m.c(PAL.cream),[0,0,0]);
  face(g,m,[0,.46,.18],.42,{rx:-.08});
  P(g,G.circ(.36),m.glow('#FFE6A0',1.6),[0,.86,0],[PI/2,0,0]);
  P(g,G.hs(.46),m.gloss(PAL.coral),[0,.84,0],null,[1,.78,1]);P(g,G.to(.43,.05),m.gloss(PAL.coral),[0,.85,0],[PI/2,0,0]);
  capDots(g,m,.84,.46,.78,8,PAL.white,rnd,.075);
  bush(g,m,[.2,.02,.14],.35,PAL.grass,4,rnd,.9);
  g.userData.light={p:[0,.8,0],c:'#FFD99A',i:1.2}}});

furn('kompost_eimer',{n:'Kompost-Eimer',cat:'deko',price:300,planet:'kompost',size:[1,1],h:.8,b:(g,m,o,rnd)=>{
  P(g,G.la([[0,0],[.26,0],[.28,.03],[.33,.5],[.36,.52],[.36,.56],[0,.56]]),m.gloss(PAL.leaf),[0,0,0]);
  P(g,G.to(.33,.025),m.gloss(PAL.moss),[0,.3,0],[PI/2,0,0]);
  P(g,G.blob(.3,.08,5,3),m.c(PAL.choc),[0,.52,0],null,[1,.35,1]);
  const lid=grp(g,[-.3,.6,-.08],[0,0,.55]);C(lid,.37,.36,.06,m.gloss(PAL.moss),[.32,0,0]);S(lid,.06,m.gloss(PAL.lemon),[.32,.05,0],[1.4,.7,1]);
  const w=grp(g,[.08,.55,.12]);tu(w,[[0,0,0],[.02,.12,.03],[.07,.2,.06]],.045,m.c(PAL.pink),.05);S(w,.065,m.c(PAL.pink),[.08,.24,.07]);face(w,m,[.09,.25,.13],.12,{cheek:false});
  const ba=grp(g,[-.12,.6,.1],[.3,.4,0]);tu(ba,[[-.12,0,0],[0,.05,0],[.12,0,0]],.04,m.c(PAL.lemon),.03);
  P(g,G.puff(leafShape(.22,.12),.03),m.c(PAL.grass),[.15,.56,-.1],[-.9,.5,0]);
  S(g,.06,m.c(PAL.strawberry),[-.05,.6,-.14]);}});

furn('blumentopf_regal',{n:'Blumentopf-Regal',cat:'pflanze',price:800,planet:'kompost',size:[2,1],h:1.35,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.oak),dk=Wd(m,PAL.wood);
  both(x=>{bt(g,[x*.85,0,.35],[x*.85,1.1,-.25],.045,dk);bt(g,[x*.85,0,-.38],[x*.85,1.1,-.28],.045,dk)});
  const tiers=[[.3,.25],[.62,.02],[.94,-.2]];const cols=[PAL.blush,PAL.lemon,PAL.lilac,PAL.white,PAL.peach,PAL.sky];let k=0;
  tiers.forEach(([y,z],ti)=>{B(g,1.82,.05,.26,.02,wd,[0,y,z]);const n=2;
    for(let i=0;i<n;i++){const x=(i-.5)*.8+(ti%2?.12:-.05);const pc=[PAL.terracotta,PAL.sky,PAL.clay][(i+ti)%3];pot(g,m,[x,y+.025,z],.1,.17,pc);
      if((i+ti)%3===0)bush(g,m,[x,y+.19,z],.4,PAL.leaf,4,rnd,.7);
      else if((i+ti)%3===1){flower(g,m,[x-.04,y+.18,z],cols[k++%6],.9,-.15);flower(g,m,[x+.05,y+.18,z],cols[k++%6],.75,.2)}
      else{P(g,G.ca(.06,.12),m.c(PAL.moss),[x,y+.3,z]);both(s=>P(g,G.ca(.035,.05),m.c(PAL.moss),[x+s*.08,y+.3,z],[0,0,s*-.8]))}}})}});

furn('strohsessel',{n:'Strohsessel',cat:'sitz',price:650,planet:'kompost',size:[1,1],h:.95,b:(g,m,o,rnd)=>{
  const st=m.c(PAL.honey),st2=m.c(PAL.sand);
  for(const x of[-.26,.26])for(const z of[-.24,.24])C(g,.04,.035,.2,Wd(m,PAL.wood),[x,.1,z]);
  C(g,.4,.37,.2,st,[0,.3,0]);P(g,G.to(.39,.035),st2,[0,.4,0],[PI/2,0,0]);P(g,G.to(.37,.03),st2,[0,.24,0],[PI/2,0,0]);
  for(let i=0;i<4;i++){const R=.38+i*.015,a=PI*(1.12-i*.06),mt=i%2?st2:st,y=.45+i*.13,t0=-PI/2-a/2;P(g,G.to(R,.075,a),mt,[0,y,0],[PI/2,0,t0]);for(const t of[t0,t0+a])S(g,.075,mt,[Math.cos(t)*R,y,Math.sin(t)*R])}
  C(g,.33,.35,.1,m.plush(PAL.blush),[0,.44,.03]);
  P(g,G.bx(.4,.32,.12,.06),m.plush(PAL.cream),[0,.62,-.22],[-.2,0,0]);S(g,.035,m.c(PAL.rose),[0,.63,-.15]);
  g.userData.seat=[0,.5,.05]}});
furn('wurm_terrarium',{n:'Wurm-Terrarium',cat:'deko',price:900,planet:'kompost',size:[1,1],h:1.0,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.wood);
  B(g,.8,.12,.5,.04,wd,[0,.06,0]);
  B(g,.72,.28,.42,.03,m.c(PAL.choc),[0,.26,0]);B(g,.72,.1,.42,.03,m.c(PAL.bark),[0,.43,0]);B(g,.72,.07,.42,.03,m.c(PAL.moss),[0,.515,0]);
  for(const x of[-.38,.38])for(const z of[-.23,.23])C(g,.03,.03,.72,wd,[x,.48,z]);
  B(g,.8,.06,.5,.03,wd,[0,.85,0]);
  P(g,G.bx(.74,.72,.44,.02),m.glass('#e8fbff'),[0,.48,0]);
  [[-.18,.28,.22,PAL.pink],[.16,.2,.22,PAL.rose],[.02,.38,.22,PAL.blush]].forEach(([x,y,z,c],i)=>{const w=grp(g,[x,y,z]);tu(w,[[-.1,0,0],[-.03,.03,0],[.04,-.02,0],[.1,.01,0]],.03,m.c(c),.034);if(i===0)face(w,m,[.11,.02,.02],.09,{cheek:false,mouth:false})});
  const wm=grp(g,[.1,.55,.05]);tu(wm,[[0,0,0],[.01,.1,0],[.05,.17,.04]],.04,m.c(PAL.pink),.045);S(wm,.055,m.c(PAL.pink),[.06,.2,.05]);face(wm,m,[.07,.21,.1],.1,{cheek:false});
  pot(g,m,[-.22,.88,0],.08,.12,PAL.clay);bush(g,m,[-.22,1.0,0],.3,PAL.grass,5,rnd,.8);
  S(g,.05,m.gloss(PAL.strawberry),[.24,.93,0],[1,.8,1]);bt(g,[.24,.97,0],[.26,1.01,0],.01,m.c(PAL.moss))}});

furn('honigtopf_tisch',{n:'Honigtopf-Tisch',cat:'tisch',price:700,planet:'kompost',size:[1,1],h:.8,b:(g,m,o,rnd)=>{
  const hm=m.gloss(PAL.honey);
  P(g,G.la([[0,0],[.22,0],[.3,.1],[.35,.35],[.32,.55],[.24,.62],[.25,.66],[0,.66]]),m.c(PAL.oak),[0,0,0]);
  P(g,G.to(.34,.03),m.c(PAL.cream),[0,.4,0],[PI/2,0,0]);
  const lbl=ctex('fu-honig',128,64,(x,w,h)=>{x.fillStyle=PAL.cream;x.fillRect(0,0,w,h);x.fillStyle=PAL.bark;x.font=`bold 30px ${FONT}`;x.textAlign='center';x.textBaseline='middle';x.fillText('HONIG',w/2,h/2)});
  decal(g,m,lbl,'honig',.26,.13,[0,.25,.345],[-.08,0,0]);
  C(g,.46,.46,.06,hm,[0,.7,0]);P(g,G.to(.46,.035),hm,[0,.7,0],[PI/2,0,0]);
  for(let i=0;i<7;i++){const a=i/7*TAU+.3,l=.08+rnd()*.14;P(g,G.ca(.035,l),hm,[Math.cos(a)*.46,.67-l/2,Math.sin(a)*.46])}
  const dp=grp(g,[.15,.74,.05],[0,0,-.5]);C(dp,.02,.02,.4,m.c(PAL.wood),[0,.2,0]);for(let i=0;i<3;i++)C(dp,.06-i*.01,.06-i*.01,.03,m.c(PAL.wood),[0,.03+i*.045,0]);
  const b=grp(g,[-.2,.8,.15]);P(b,G.ca(.045,.06),m.c(PAL.lemon),[0,0,0],[0,0,PI/2]);P(b,G.to(.047,.013),m.c(PAL.ink),[.01,0,0],[0,PI/2,0]);both(z=>P(b,G.s(.035),m.c(PAL.white),[0,.05,z*.03],[1,.5,1.3]))}});

furn('moos_teppich',{n:'Moos-Teppich',cat:'teppich',price:500,planet:'kompost',size:[2,2],h:.12,b:(g,m,o,rnd)=>{
  P(g,G.puff(sshp(ringPts(12,.85,.2,rnd)),.03,.02),m.c(PAL.moss),[0,.025,0],[-PI/2,0,0]);
  P(g,G.puff(sshp(ringPts(10,.62,.25,rnd)),.03,.02),m.c(PAL.grass),[0,.05,0],[-PI/2,0,0]);
  for(let i=0;i<9;i++){const a=rnd()*TAU,r=.2+rnd()*.55;S(g,.07+rnd()*.06,m.c(i%2?PAL.leaf:PAL.grass),[Math.cos(a)*r,.05,Math.sin(a)*r],[1,.35,1])}
  [[.62,.4],[-.6,-.3]].forEach(([x,z],i)=>{C(g,.025,.03,.08,m.c(PAL.cream),[x,.1,z]);P(g,G.hs(.07),m.gloss(i?PAL.coral:PAL.honey),[x,.13,z],null,[1,.7,1])});
  [[-.4,.55,PAL.white],[.3,-.6,PAL.lemon],[.66,-.1,PAL.lilac]].forEach(([x,z,c])=>{P(g,G.puff(flowerShape(.07,5),.02),m.c(c),[x,.07,z],[-PI/2,0,0]);S(g,.025,m.c(PAL.honey),[x,.09,z])})}});

furn('buecherregal',{n:'Bücherregal',cat:'lager',price:900,planet:'alle',size:[2,1],h:1.95,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.wood),z0=-.22;
  B(g,1.8,1.8,.08,.03,wd,[0,.9,z0-.18]);both(x=>B(g,.1,1.84,.46,.04,wd,[x*.88,.92,z0]));
  [.06,.62,1.2,1.8].forEach(y=>B(g,1.8,.07,.46,.03,wd,[0,y,z0]));
  const bc=[PAL.strawberry,PAL.teal,PAL.honey,PAL.grape,PAL.coral,PAL.navy,PAL.mint,PAL.berry,PAL.blue,PAL.orange];let c=0;
  [.1,.66].forEach((y,row)=>{let x=-.8;while(x<.7){const w=.1+rnd()*.07,h=.34+rnd()*.14;if(row===0&&x>.25){break}
    const b=B(g,w,h,.3,.015,m.c(bc[c++%bc.length]),[x+w/2,y+h/2,z0+.02]);if(rnd()<.12){b.rotation.z=-.25;b.position.x+=.05;x+=.06}x+=w+.008}});
  pot(g,m,[.55,.1,z0],.12,.2,PAL.sky);bush(g,m,[.55,.3,z0],.45,PAL.leaf,4,rnd,.3);
  const gl=grp(g,[-.45,1.24,z0]);C(gl,.08,.1,.04,m.c(PAL.bark),[0,.02,0]);bt(gl,[0,.02,0],[0,.14,0],.015,m.gold());S(gl,.16,m.gloss(PAL.sky),[0,.2,0]);P(gl,G.blob(.1,.2,3,2),m.c(PAL.leaf),[.06,.24,.03],null,[.6,.8,.6]);
  for(let i=0;i<3;i++)B(g,.11,.36-i*.03,.3,.015,m.c(bc[(i+3)%bc.length]),[.1+i*.12,1.24+(.36-i*.03)/2,z0+.02]);
  B(g,.36,.1,.26,.03,m.c(PAL.rose),[.62,1.29,z0]);
  S(g,.09,m.plush(PAL.honey),[-.55,1.9,z0]);face(g,m,[-.55,1.9,z0+.08],.2,{cheek:false})}});

furn('kachelofen',{n:'Kachelofen',cat:'kueche',price:2400,planet:'kompost',size:[1,1],h:1.85,b:(g,m,o,rnd)=>{
  const tl=m.tex('kachel-g',rtex(tileTex('k3',3,'#e7dccb'),1,1),{color:PAL.teal}),cr=m.c(PAL.cream);
  B(g,.9,.12,.74,.04,cr,[0,.06,-.02]);B(g,.84,.8,.68,.08,tl,[0,.52,-.02]);B(g,.9,.07,.74,.03,cr,[0,.95,-.02]);
  B(g,.64,.56,.52,.08,tl,[0,1.26,-.08]);B(g,.7,.06,.58,.03,cr,[0,1.56,-.08]);P(g,G.hs(.3),tl,[0,1.58,-.08],null,[1,.55,.85]);
  C(g,.09,.09,.3,m.c(PAL.slate),[0,1.8,-.12]);C(g,.11,.11,.04,m.c(PAL.slate),[0,1.95,-.12]);
  P(g,G.puff(archShape(.4,.36,.2),.06),m.c(PAL.ink),[0,.26,.32]);
  P(g,G.puff(archShape(.3,.28,.15),.02),m.glow('#FF9A3C',1.5),[0,.28,.355]);
  P(g,G.drop(.07,.1),m.glow('#FFE27A',1.6),[0,.38,.38]);both(x=>P(g,G.drop(.05,.07),m.glow('#FFC24A',1.6),[x*.07,.35,.37]));
  both(x=>{S(g,.035,m.gold(),[x*.24,.66,.33])});
  B(g,1.0,.08,.3,.03,Wd(m,PAL.oak),[0,.5,.46]);both(x=>B(g,.08,.4,.08,.02,Wd(m,PAL.oak),[x*.42,.26,.46]));
  const cat=grp(g,[.25,.99,.12]);S(cat,.14,m.plush(PAL.apricot),[0,.08,0],[1.3,.7,1]);S(cat,.1,m.plush(PAL.apricot),[-.15,.14,.05]);both(x=>P(cat,G.co(.04,.07),m.plush(PAL.apricot),[-.15+x*.05,.25,.05]));
  const f=face(cat,m,[-.15,.14,.14],.14,{cheek:true});f.children.slice(0,2).forEach(e=>e.scale.y=.35);
  g.userData.light={p:[0,.4,.5],c:'#FFB060',i:.8}}});

furn('giesskannen_brunnen',{n:'Gießkannen-Brunnen',cat:'deko',price:1500,planet:'kompost',size:[1,1],h:1.35,b:(g,m,o,rnd)=>{
  const st=m.c(PAL.stone);
  P(g,G.la([[0,0],[.44,0],[.47,.04],[.47,.26],[.42,.3],[.38,.3],[.38,.12],[0,.12]]),st,[0,0,0]);
  C(g,.38,.38,.14,m.c(PAL.aqua,{gloss:1}),[0,.18,0]);
  bt(g,[-.28,.2,-.2],[-.28,.72,-.2],.05,m.c(PAL.slate));
  const can=grp(g,[-.16,.9,-.12],[0,0,-.55]);
  C(can,.2,.22,.32,m.gloss(PAL.sky),[0,0,0]);P(can,G.to(.21,.025),m.gloss(PAL.blue),[0,.1,0],[PI/2,0,0]);
  P(can,G.to(.13,.03,PI),m.gloss(PAL.blue),[-.05,.16,0],[0,0,.3]);
  tu(can,[[.15,-.06,0],[.3,.02,0],[.43,.13,0]],.04,m.gloss(PAL.sky),.035);
  P(can,G.cy(.07,.035,.07),m.gloss(PAL.blue),[.46,.16,0],[0,0,-.9]);C(can,.2,.2,.02,m.c(PAL.cream),[0,.17,0]);
  const wa=m.c(PAL.aqua,{opacity:.7});tu(g,[[.3,.8,-.12],[.35,.6,-.1],[.3,.38,-.05],[.2,.24,0]],.03,wa,.05);
  for(let i=0;i<5;i++)S(g,.03,m.c(PAL.white),[.18+Math.cos(i*1.3)*.08,.26,Math.sin(i*1.3)*.08]);
  P(g,G.puff(leafShape(.1,.07),.02),m.c(PAL.grass),[-.1,.26,.2],[-PI/2,0,.5]);S(g,.04,m.c(PAL.pink),[-.1,.27,.2],[1,.5,1]);
  const du=grp(g,[.12,.3,.15]);S(du,.07,m.gloss(PAL.lemon),[0,0,0],[1.2,.8,1]);S(du,.05,m.gloss(PAL.lemon),[-.04,.07,0]);P(du,G.co(.02,.04),m.c(PAL.orange),[-.09,.07,0],[0,0,PI/2]);
  g.userData.tick=t=>{wa.opacity=.6+Math.sin(t*3)*.08}}});

furn('haraway_poster',{n:'Haraway-Poster',cat:'wand',price:400,planet:'kompost',size:[1,1],h:1.9,wall:true,b:(g,m,o,rnd)=>{
  const tex=ctex('fu-haraway',256,352,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#FFB3C7');gr.addColorStop(.55,'#C6A9FF');gr.addColorStop(1,'#7FDCE6');x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<9;i++){x.beginPath();x.arc(30+i*28,60+Math.sin(i)*20,4,0,TAU);x.fill()}
    x.fillStyle='#FFF4DC';x.beginPath();x.arc(w/2,150,70,0,TAU);x.fill();
    x.save();x.beginPath();x.arc(w/2,150,70,-PI/2,PI/2);x.closePath();x.clip();x.fillStyle='#AEB9C8';x.fillRect(w/2,70,80,160);x.strokeStyle='#56C6B6';x.lineWidth=4;
    for(let i=0;i<5;i++){x.beginPath();x.moveTo(w/2,100+i*22);x.lineTo(w/2+30,100+i*22);x.lineTo(w/2+42,112+i*22);x.stroke();x.fillStyle='#56C6B6';x.beginPath();x.arc(w/2+44,114+i*22,4,0,TAU);x.fill()}x.restore();
    x.fillStyle='#3B3450';x.beginPath();x.ellipse(w/2-30,140,9,13,0,0,TAU);x.fill();x.fillStyle='#FF4FA0';x.beginPath();x.arc(w/2+30,140,12,0,TAU);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(w/2+33,136,4,0,TAU);x.fill();x.beginPath();x.arc(w/2-27,135,3.5,0,TAU);x.fill();
    x.strokeStyle='#3B3450';x.lineWidth=5;x.beginPath();x.arc(w/2,168,20,.2,PI-.2);x.stroke();
    x.strokeStyle='#7CC46A';x.lineWidth=7;x.beginPath();x.moveTo(w/2-10,80);x.quadraticCurveTo(w/2-30,40,w/2-60,50);x.stroke();x.fillStyle='#7CC46A';x.beginPath();x.ellipse(w/2-62,48,16,9,-.4,0,TAU);x.fill();
    x.fillStyle='#3B3450';x.textAlign='center';x.font=`bold 34px ${FONT}`;x.fillText('CYBORG',w/2,262);x.fillText('MANIFEST',w/2,296);
    x.font=`bold 15px ${FONT}`;x.fillStyle='#6E4A7E';x.fillText('»Lieber Cyborg als Göttin!«',w/2,322);x.font=`12px ${FONT}`;x.fillText('D. Haraway · 1985',w/2,340)});
  const z=-.5;B(g,.86,1.14,.05,.02,m.c(PAL.berry),[0,1.3,z+.025]);decal(g,m,tex,'haraway',.76,1.04,[0,1.3,z+.052]);
  [[-.36,1.8],[.36,1.8]].forEach(([x,y],i)=>S(g,.035,m.gloss(i?PAL.lemon:PAL.mint),[x,y,z+.07],[1,1,.5]))}});

furn('kuckucksuhr',{n:'Kuckucksuhr',cat:'wand',price:1100,planet:'kompost',size:[1,1],h:2.0,wall:true,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.wood),dk=Wd(m,PAL.bark),z=-.5;
  B(g,.5,.5,.2,.04,wd,[0,1.5,z+.1]);
  both(x=>B(g,.4,.05,.3,.02,dk,[x*.17,1.84,z+.12],[0,0,x*-.7]));
  P(g,G.puff(leafShape(.2,.12),.03),m.c(PAL.leaf),[-.07,1.93,z+.14],[0,0,.5]);P(g,G.puff(leafShape(.2,.12),.03),m.c(PAL.grass),[.07,1.93,z+.14],[0,0,-.5]);S(g,.05,m.c(PAL.bark),[0,1.96,z+.14],[1,1.3,1]);
  B(g,.14,.13,.04,.03,m.c(PAL.ink),[0,1.72,z+.2]);const bd=grp(g,[0,1.72,z+.24]);S(bd,.055,m.gloss(PAL.lemon),[0,0,0]);P(bd,G.co(.02,.04),m.c(PAL.orange),[0,-.01,.06],[PI/2,0,0]);face(bd,m,[0,.01,.05],.1,{mouth:false,cheek:false});
  const ft=ctex('fu-uhr',128,128,(x,w,h)=>{x.fillStyle=PAL.cream;x.beginPath();x.arc(64,64,62,0,TAU);x.fill();x.fillStyle=PAL.ink;x.font=`bold 20px ${FONT}`;x.textAlign='center';x.textBaseline='middle';
    for(let i=1;i<=12;i++){const a=i/12*TAU-PI/2;x.fillText(i%3?'•':String(i),64+Math.cos(a)*46,64+Math.sin(a)*46)}x.strokeStyle=PAL.ink;x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(64,64);x.lineTo(64,32);x.moveTo(64,64);x.lineTo(88,72);x.stroke()});
  C(g,.15,.15,.03,m.c(PAL.oak),[0,1.44,z+.21],[PI/2,0,0]);decal(g,m,ft,'uhr',.26,.26,[0,1.44,z+.227]);
  both(x=>{bt(g,[x*.1,1.25,z+.1],[x*.1,.95-(x+1)*.06,z+.1],.008,m.gold());P(g,G.la([[0,0],[.04,.02],[.05,.1],[.03,.18],[0,.2]]),m.c(PAL.choc),[x*.1,.78-(x+1)*.06,z+.1])});
  const pd=grp(g,[0,1.28,z+.06]);bt(pd,[0,0,0],[0,-.3,0],.012,m.gold());C(pd,.07,.07,.02,m.gold(),[0,-.32,0],[PI/2,0,0]);
  g.userData.tick=t=>{pd.rotation.z=Math.sin(t*2.4)*.25}}});

furn('radio',{n:'Radio',cat:'musik',price:600,planet:'alle',size:[1,1],h:.72,b:(g,m,o,rnd)=>{
  B(g,.72,.44,.34,.12,m.gloss(PAL.mint),[0,.26,0]);
  const gr=ctex('fu-grill',128,128,(x,w,h)=>{x.fillStyle=PAL.cream;x.fillRect(0,0,w,h);x.fillStyle='#d8c6a6';for(let j=0;j<8;j++)for(let i=0;i<8;i++){x.beginPath();x.arc(8+i*16,8+j*16,4.5,0,TAU);x.fill()}});
  C(g,.15,.15,.03,m.c(PAL.cream),[-.15,.26,.16],[PI/2,0,0]);decal(g,m,gr,'grill',.26,.26,[-.15,.26,.177]);
  B(g,.24,.1,.03,.02,m.c(PAL.butter),[.18,.34,.17]);B(g,.012,.07,.01,0,m.c(PAL.strawberry),[.16,.34,.188]);
  both(x=>{C(g,.045,.045,.05,m.gloss(PAL.honey),[.18+x*.07,.18,.18],[PI/2,0,0])});
  S(g,.03,m.glow('#FFE27A',2),[.29,.43,.12]);
  P(g,G.to(.2,.03,PI),m.c(PAL.bark),[0,.48,0]);both(x=>S(g,.04,m.c(PAL.bark),[x*.2,.48,0]));
  bt(g,[.28,.47,-.08],[.42,.9,-.12],.012,m.chrome());S(g,.03,m.gloss(PAL.strawberry),[.42,.9,-.12]);
  const nt=grp(g,[-.34,.6,.02]);P(nt,G.ca(.035,.001),m.c(PAL.ink),[0,0,0],null,[1,.9,.4]);bt(nt,[.03,0,0],[.04,.14,0],.012,m.c(PAL.ink));
  g.userData.tick=t=>{nt.position.y=.6+Math.abs(Math.sin(t*2))*.06;nt.rotation.z=Math.sin(t*2)*.2}}});

furn('schaukelstuhl',{n:'Schaukelstuhl',cat:'sitz',price:950,planet:'kompost',size:[1,1],h:1.2,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.wood),r=grp(g);
  both(x=>{const k=P(r,G.to(1.1,.04,.8),wd,[x*.3,1.12,0],[0,PI/2,0]);k.rotation.set(0,PI/2,0);k.rotateZ(-PI/2-.4)});
  both(x=>{C(r,.035,.035,.4,wd,[x*.3,.22,.25]);C(r,.035,.035,.95,wd,[x*.3,.5,-.24],[-.12,0,0]);S(r,.055,wd,[x*.3,.98,-.3])});
  B(r,.68,.06,.58,.03,wd,[0,.42,0]);
  for(let i=0;i<5;i++)C(r,.025,.025,.48,wd,[-.2+i*.1,.72,-.26],[-.12,0,0]);B(r,.68,.07,.07,.03,wd,[0,.97,-.3],[-.12,0,0]);
  both(x=>{B(r,.07,.05,.5,.02,wd,[x*.33,.64,0])});
  B(r,.56,.08,.5,.04,m.plush(PAL.rose),[0,.49,.02]);
  const bl=grp(r,[0,.8,-.2],[-.12,0,0]);B(bl,.6,.22,.08,.04,m.tex('quilt-s',quiltTex('s',[PAL.lemon,PAL.mint,PAL.lilac])),[0,0,.02]);
  const ya=grp(r,[.22,.56,.12]);S(ya,.08,m.plush(PAL.sky));bt(ya,[-.05,.06,0],[-.12,.16,.06],.008,m.c(PAL.oak));bt(ya,[.05,.06,0],[-.1,.17,.03],.008,m.c(PAL.oak));
  g.userData.seat=[0,.5,.05];g.userData.tick=t=>{r.rotation.x=Math.sin(t*1.2)*.05}}});

furn('esstisch',{n:'Esstisch',cat:'tisch',price:1000,planet:'alle',size:[2,1],h:.95,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.oak),dk=Wd(m,PAL.wood);
  B(g,1.8,.08,.9,.04,wd,[0,.72,0]);B(g,1.66,.1,.76,.03,dk,[0,.64,0]);
  for(const x of[-.78,.78])for(const z of[-.34,.34]){P(g,G.la([[0,0],[.06,0],[.07,.1],[.05,.2],[.07,.35],[.05,.5],[.06,.66],[0,.66]]),dk,[x,0,z])}
  B(g,.5,.012,.92,.005,m.tex('karo-r',rtex(ctex('fu-karo',64,64,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='rgba(240,85,110,.5)';x.fillRect(0,0,32,64);x.fillRect(0,0,64,32)}),3,6)),[0,.765,0]);
  pot(g,m,[0,.77,0],.07,.16,PAL.sky);flower(g,m,[-.03,.9,0],PAL.lemon,.8,-.2);flower(g,m,[.04,.9,.02],PAL.blush,.9,.15);flower(g,m,[0,.9,-.03],PAL.white,.7,.05);
  both(x=>{C(g,.14,.1,.025,m.white(),[x*.55,.77,.1]);S(g,.07,m.c(x<0?PAL.strawberry:PAL.leaf),[x*.55,.81,.1])})}});

furn('stuhl',{n:'Stuhl',cat:'sitz',price:250,planet:'alle',size:[1,1],h:.95,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.oak);
  for(const x of[-.2,.2])for(const z of[-.18,.18])C(g,.035,.03,.42,wd,[x,.21,z]);
  B(g,.5,.06,.46,.03,wd,[0,.44,0]);
  both(x=>C(g,.035,.035,.5,wd,[x*.2,.72,-.2]));
  const bs=new THREE.Shape();bs.moveTo(-.22,0);bs.lineTo(.22,0);bs.lineTo(.22,.18);bs.quadraticCurveTo(.22,.3,0,.3);bs.quadraticCurveTo(-.22,.3,-.22,.18);bs.closePath();
  const hh=new THREE.Path();const s=.055;hh.moveTo(0,.06);hh.bezierCurveTo(-s*1.6,.06+s,-s*.9,.06+s*2.6,0,.06+s*1.8);hh.bezierCurveTo(s*.9,.06+s*2.6,s*1.6,.06+s,0,.06);bs.holes.push(hh);
  P(g,G.puff(bs,.04),wd,[0,.72,-.2]);
  B(g,.42,.06,.38,.03,m.plush(PAL.mint),[0,.5,.01]);
  g.userData.seat=[0,.5,0]}});

furn('sofa',{n:'Sofa',cat:'sitz',price:1600,planet:'alle',size:[2,1],h:.9,b:(g,m,o,rnd)=>{
  const c1=m.plush(PAL.lilac),c2=m.plush(PAL.lavender);
  B(g,1.8,.28,.8,.1,c1,[0,.24,0]);B(g,1.8,.5,.26,.12,c1,[0,.6,-.27]);
  both(x=>{B(g,.26,.34,.84,.13,c1,[x*.84,.46,0]);P(g,G.ca(.13,.6),c1,[x*.84,.62,0],[PI/2,0,0])});
  both(x=>B(g,.7,.16,.58,.08,c2,[x*.36,.43,.06]));both(x=>B(g,.68,.38,.16,.08,c2,[x*.36,.66,-.14],[-.1,0,0]));
  for(const x of[-.78,.78])for(const z of[-.3,.3])P(g,G.cy(.04,.03,.1),m.c(PAL.bark),[x,.05,z]);
  const pl=grp(g,[-.5,.66,.02],[0,.3,.25]);B(pl,.3,.28,.12,.06,m.plush(PAL.butter));S(pl,.03,m.c(PAL.honey),[0,0,.07]);
  const pr=grp(g,[.52,.64,.04],[0,-.3,-.2]);P(pr,G.heart(.14,.1),m.plush(PAL.pink));
  g.userData.seat=[0,.52,.1]}});

furn('kommode',{n:'Kommode',cat:'lager',price:850,planet:'alle',size:[1,1],h:1.25,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.wood),fr=Wd(m,PAL.oak);
  B(g,.86,.86,.5,.06,wd,[0,.5,-.18]);B(g,.92,.05,.56,.025,fr,[0,.95,-.18]);
  for(let i=0;i<3;i++){B(g,.74,.22,.04,.04,fr,[0,.24+i*.25,.08]);both(x=>S(g,.035,m.gold(),[x*.18,.24+i*.25,.11]))}
  for(const x of[-.36,.36])for(const z of[-.36,0])P(g,G.cy(.04,.025,.1),m.c(PAL.bark),[x,.05,z]);
  C(g,.2,.2,.01,m.c(PAL.white),[.1,.98,-.18]);
  const lm=grp(g,[.14,.98,-.18]);P(lm,G.la([[0,0],[.07,0],[.06,.04],[.04,.12],[.05,.18],[0,.18]]),m.gloss(PAL.teal),[0,0,0]);P(lm,G.cy(.07,.12,.12),m.c(PAL.butter),[0,.23,0]);
  const fr2=grp(g,[-.22,.98,-.26],[-.2,.3,0]);B(fr2,.2,.24,.03,.01,m.c(PAL.rose),[0,.12,0]);B(fr2,.15,.18,.01,0,m.c(PAL.sky),[0,.12,.018]);S(fr2,.04,m.c(PAL.lemon),[0,.14,.025],[1,1,.3]);
  g.userData.light={p:[.14,1.2,-.18],c:'#FFE6A0',i:.5}}});

furn('stehlampe',{n:'Stehlampe',cat:'licht',price:550,planet:'alle',size:[1,1],h:1.7,b:(g,m,o,rnd)=>{
  P(g,G.la([[0,0],[.2,0],[.22,.03],[.12,.08],[0,.09]]),m.gloss(PAL.honey),[0,0,0]);
  C(g,.025,.025,1.3,m.gold(),[0,.7,0]);S(g,.045,m.gold(),[0,.7,0]);
  P(g,G.circ(.28),m.glow('#FFE6A0',1.5),[0,1.29,0],[PI/2,0,0]);S(g,.07,m.glow('#FFF2C0',2),[0,1.33,0]);
  P(g,G.la([[0,0],[.33,0],[.34,.03],[.2,.4],[.18,.42],[0,.42]]),m.c(PAL.peach),[0,1.28,0]);
  P(g,G.to(.335,.025),m.c(PAL.rose),[0,1.29,0],[PI/2,0,0]);P(g,G.to(.19,.02),m.c(PAL.rose),[0,1.69,0],[PI/2,0,0]);
  for(let i=0;i<10;i++){const a=i/10*TAU;S(g,.03,m.c(PAL.rose),[Math.cos(a)*.34,1.23,Math.sin(a)*.34])}
  bt(g,[.1,1.25,.05],[.1,1.08,.05],.006,m.c(PAL.ink));S(g,.025,m.gold(),[.1,1.07,.05]);
  g.userData.light={p:[0,1.3,0],c:'#FFD99A',i:1.3}}});

furn('teppich_rund',{n:'Teppich rund',cat:'teppich',price:400,planet:'alle',size:[2,2],h:.06,b:(g,m,o,rnd)=>{
  const cs=[PAL.coral,PAL.cream,PAL.honey,PAL.cream,PAL.teal];cs.forEach((c,i)=>C(g,.88-i*.17,.88-i*.17,.03+i*.004,m.c(c),[0,.015+i*.002,0]));
  for(let i=0;i<16;i++){const a=i/16*TAU;P(g,G.ca(.025,.05),m.c(PAL.cream),[Math.cos(a)*.93,.02,Math.sin(a)*.93],[PI/2,0,-a+PI/2])}}});

furn('kuechenzeile',{n:'Küchenzeile',cat:'kueche',price:2800,planet:'alle',size:[2,1],h:1.7,b:(g,m,o,rnd)=>{
  const cab=m.gloss(PAL.mint),top=Wd(m,PAL.oak),z0=-.1;
  B(g,1.9,.8,.66,.06,cab,[0,.44,z0]);B(g,1.94,.07,.72,.03,top,[0,.86,z0]);B(g,1.9,.06,.6,.02,m.c(PAL.ink),[0,.03,z0]);
  for(let i=0;i<4;i++){const x=-.7+i*.47;B(g,.42,.62,.04,.05,m.gloss(PAL.cream),[x,.45,z0+.33]);S(g,.035,m.gold(),[x+(i%2?-.13:.13),.6,z0+.36])}
  B(g,1.9,.62,.04,.02,m.tex('kachel-w',rtex(tileTex('k4',4,'#dde6ee'),6,2),{color:'#ffffff'}),[0,1.2,-.43]);
  P(g,G.bx(.5,.06,.4,.03),m.chrome(),[-.45,.865,z0]);B(g,.42,.02,.32,.01,m.c(PAL.aqua,{gloss:1}),[-.45,.89,z0]);
  const tp=grp(g,[-.45,.9,z0-.2]);C(tp,.03,.03,.22,m.chrome(),[0,.11,0]);tu(tp,[[0,.22,0],[0,.3,.05],[0,.28,.14],[0,.22,.16]],.025,m.chrome());both(x=>S(tp,.035,m.gloss(x<0?PAL.strawberry:PAL.blue),[x*.08,.08,0]));
  both(x=>{C(g,.1,.1,.02,m.c(PAL.ink),[.5+x*.22,.9,z0]);P(g,G.to(.07,.012),m.c(PAL.slate),[.5+x*.22,.915,z0],[PI/2,0,0])});
  const pn=grp(g,[.72,.91,z0]);P(pn,G.la([[0,0],[.12,0],[.13,.14],[0,.14]]),m.gloss(PAL.coral),[0,0,0]);C(pn,.13,.13,.02,m.gloss(PAL.coral),[0,.16,0]);S(pn,.025,m.c(PAL.ink),[0,.19,0]);both(x=>P(pn,G.to(.04,.012,PI),m.c(PAL.ink),[x*.14,.1,0],[0,0,x>0?-PI/2:PI/2]));
  B(g,1.2,.05,.24,.02,top,[.2,1.45,-.3]);[[-.2,PAL.lemon],[.05,PAL.strawberry],[.3,PAL.leaf],[.55,PAL.sky]].forEach(([x,c])=>{P(g,G.cy(.06,.06,.14),m.c(c),[x,1.55,-.3]);C(g,.065,.065,.03,m.c(PAL.oak),[x,1.635,-.3])});
  pot(g,m,[.05,.9,z0-.1],.07,.12,PAL.terracotta);bush(g,m,[.05,1.0,z0-.1],.3,PAL.leaf,5,rnd,.6)}});

furn('badewanne',{n:'Badewanne',cat:'bad',price:2200,planet:'alle',size:[2,1],h:1.05,b:(g,m,o,rnd)=>{
  const w=m.gloss('#F3F5FB');
  P(g,G.la([[0,.14],[.28,.15],[.37,.26],[.4,.55],[.39,.72],[.42,.75],[.4,.79],[.36,.77],[.35,.6],[.3,.35],[0,.33]]),w,[0,0,0],null,[2.05,1,1]);
  C(g,.355,.355,.04,m.c(PAL.aqua,{gloss:1}),[0,.66,0],null,[2.05,1,1]);
  for(const x of[-.55,.55])for(const z of[-.22,.22]){S(g,.07,m.gold(),[x,.07,z]);C(g,.03,.05,.14,m.gold(),[x,.16,z])}
  for(let i=0;i<9;i++){const x=-.5+rnd()*1.0,z=(rnd()-.5)*.35;S(g,.07+rnd()*.06,m.plush(PAL.white),[x,.7,z],[1,.8,1])}
  const du=grp(g,[.25,.72,.08],[0,-.5,0]);S(du,.09,m.gloss(PAL.lemon),[0,0,0],[1.2,.8,1]);S(du,.065,m.gloss(PAL.lemon),[.07,.09,0]);P(du,G.co(.025,.05),m.c(PAL.orange),[.14,.08,0],[0,0,-PI/2]);face(du,m,[.1,.1,.05],.1,{mouth:false});
  const tp=grp(g,[-.9,.72,0]);C(tp,.035,.035,.25,m.chrome(),[0,.12,0]);tu(tp,[[0,.25,0],[.05,.33,0],[.15,.3,0]],.028,m.chrome());both(z=>S(tp,.04,m.gloss(z<0?PAL.blue:PAL.strawberry),[0,.15,z*.1]));
  g.userData.sleep=[0,.7,0]}});
furn('kleiderschrank',{n:'Kleiderschrank',cat:'lager',price:1300,planet:'alle',size:[1,1],h:2.05,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.oak),dk=Wd(m,PAL.wood);
  B(g,.92,1.7,.56,.06,wd,[0,.95,-.18]);B(g,.98,.08,.62,.03,dk,[0,1.83,-.18]);
  P(g,G.puff(archShape(.6,.2,.3),.06),dk,[0,1.85,.04]);S(g,.05,m.gloss(PAL.rose),[0,1.97,.1]);
  both(x=>{B(g,.4,1.4,.04,.05,Wd(m,PAL.cream),[x*.21,1.0,.11]);P(g,G.heart(.05,.02),m.gloss(PAL.rose),[x*.21,1.55,.14]);C(g,.025,.025,.08,m.gold(),[x*.05,1.0,.15],[PI/2,0,0]);S(g,.035,m.gold(),[x*.05,1.0,.19])});
  B(g,.84,.2,.04,.04,wd,[0,.24,.11]);S(g,.035,m.gold(),[0,.24,.14]);
  for(const x of[-.4,.4])for(const z of[-.4,.04])P(g,G.cy(.045,.03,.1),m.c(PAL.bark),[x,.05,z]);
  const h=grp(g,[.2,1.87,-.25]);C(h,.2,.2,.03,m.c(PAL.honey),[0,0,0]);C(h,.11,.12,.13,m.c(PAL.honey),[0,.08,0]);C(h,.125,.125,.03,m.c(PAL.strawberry),[0,.04,0])}});
/* ======================================================================
   MÖBEL · Schrott-Mond (niedlicher Retro-Tech-Schrott)
   ====================================================================== */
const pixTex=(key,draw)=>ctex('fu-pix-'+key,128,128,(x,w,h)=>{x.imageSmoothingEnabled=false;draw(x,w,h)});
furn('roboter_lampe',{n:'Roboter-Lampe',cat:'licht',price:900,planet:'schrott',size:[1,1],h:1.45,b:(g,m,o,rnd)=>{
  const bd=m.gloss(PAL.sky),ac=m.gloss(PAL.honey);
  both(x=>{P(g,G.ca(.08,.1),ac,[x*.14,.08,.04],[PI/2,0,0]);C(g,.05,.05,.14,m.steel(),[x*.14,.2,0])});
  B(g,.5,.42,.36,.14,bd,[0,.47,0]);
  B(g,.26,.16,.04,.04,m.c(PAL.cream),[0,.5,.18]);[PAL.strawberry,PAL.lemon,PAL.mint].forEach((c,i)=>S(g,.028,m.glow(c,2),[(i-1)*.07,.5,.205]));
  C(g,.07,.09,.08,m.steel(),[0,.72,0]);
  B(g,.52,.38,.38,.15,m.gloss(PAL.cream),[0,.92,0]);B(g,.42,.26,.04,.08,m.black(),[0,.92,.18]);
  both(x=>{P(g,G.ca(.035,.03),m.glow('#8FF7FF',2),[x*.1,.95,.205])});P(g,G.to(.05,.014,PI*.8),m.glow('#8FF7FF',2),[0,.87,.205],[0,0,PI+PI*.1]);
  both(x=>{C(g,.07,.07,.06,ac,[x*.28,.92,0],[0,0,PI/2])});
  bt(g,[0,1.1,0],[0,1.22,0],.015,m.steel());S(g,.045,m.glow(PAL.coral,2),[0,1.25,0]);
  C(g,.05,.05,.07,ac,[-.28,.55,0],[0,0,PI/2]);limbSeg(g,[-.3,.55,0],[-.4,.4,.08],.04,bd);
  C(g,.05,.05,.07,ac,[.28,.55,0],[0,0,PI/2]);limbSeg(g,[.3,.55,0],[.42,.8,.05],.04,bd);limbSeg(g,[.42,.8,.05],[.42,1.08,.05],.035,bd);
  S(g,.06,m.glow('#FFF2C0',2),[.42,1.14,.05]);P(g,G.la([[0,0],[.18,0],[.19,.02],[.1,.18],[0,.19]]),m.c(PAL.coral),[.42,1.14,.05]);
  g.userData.light={p:[.42,1.1,.05],c:'#FFE3A0',i:1.1}}});

furn('arcade',{n:'Arcade-Automat',cat:'spiel',price:3200,planet:'schrott',size:[1,1],h:1.78,b:(g,m,o,rnd)=>{
  const prof=shp([[-.32,0],[.26,0],[.26,.78],[.4,.86],[.4,.94],[.2,.98],[.14,1.46],[.3,1.5],[.3,1.74],[-.32,1.74]]);
  P(g,G.puff(prof,.66,.04),m.gloss(PAL.grape),[0,0,0],[0,-PI/2,0]);
  both(x=>P(g,G.puff(sshp([[-.3,.3],[.2,.3],[.2,.4],[-.3,1.2]]),.02,.01),m.gloss(PAL.pink),[x*.37,0,0],[0,-PI/2,0]));
  const sc=pixTex('arc',(x,w,h)=>{x.fillStyle='#231d3b';x.fillRect(0,0,w,h);x.fillStyle='#FFE27A';for(let i=0;i<14;i++)x.fillRect(8+i*8,100,3,3);
    const inv=['0011001100','0111111110','1101111011','1111111111','0101001010','1000000001'];x.fillStyle='#A6EBC3';inv.forEach((r,j)=>[...r].forEach((c,i)=>{if(c==='1')x.fillRect(24+i*8,26+j*8,8,8)}));
    x.fillStyle='#FF8FB8';x.fillRect(56,86,16,6);x.fillRect(60,80,8,6);x.fillStyle='#fff';x.font='bold 11px monospace';x.fillText('HI 9999',6,14)});
  decal(g,m,sc,'arc',.46,.4,[0,1.22,.217],[-.124,0,0],true);
  const mq=signTex('spiel','SPIEL!',{bg:'#FF7E6B',fg:'#FFF1A8',border:false,w:256,h:96,glow:'#FFE27A'});
  decal(g,m,mq,'mq',.5,.17,[0,1.62,.345],null,true);
  const cp=grp(g,[0,.99,.3],[.2,0,0]);C(cp,.022,.022,.1,m.steel(),[-.15,.06,0]);S(cp,.05,m.gloss(PAL.strawberry),[-.15,.12,0]);
  [PAL.lemon,PAL.mint,PAL.sky].forEach((c,i)=>C(cp,.035,.035,.04,m.gloss(c),[.02+i*.09,.02,.02-i*.01*0]));
  B(g,.12,.16,.03,.02,m.c(PAL.ink),[0,.45,.3]);B(g,.03,.08,.02,0,m.glow(PAL.coral,2),[0,.46,.317]);
  S(g,.05,m.gloss(PAL.lemon),[.24,1.8,-.1],[1,.4,1]);
  g.userData.light={p:[0,1.3,.5],c:'#B8A0FF',i:.6}}});

furn('server_regal',{n:'Server-Regal',cat:'technik',price:2600,planet:'schrott',size:[1,1],h:1.95,b:(g,m,o,rnd)=>{
  B(g,.84,1.8,.64,.08,m.gloss(PAL.lavender),[0,.92,-.12]);B(g,.72,1.64,.1,.04,m.c(PAL.shadow),[0,.92,.17]);
  const led=ctex('fu-led',128,32,(x,w,h)=>{x.fillStyle='#2b2540';x.fillRect(0,0,w,h);const cs=['#6CFF9A','#FFE27A','#7FDCE6','#FF8FB8'];for(let i=0;i<10;i++){x.fillStyle=cs[(i*7)%4];x.beginPath();x.arc(8+i*12,16,4,0,TAU);x.fill()}});
  for(let i=0;i<5;i++){const y=.3+i*.3;B(g,.66,.24,.08,.04,m.gloss(i%2?PAL.slate:PAL.navy),[0,y,.2]);decal(g,m,led,'led',.36,.07,[-.1,y,.245],null,true);S(g,.035,m.gloss(i%2?PAL.lemon:PAL.coral),[.22,y,.245],[1,1,.6])}
  for(const x of[-.34,.34])for(const z of[-.36,.14])C(g,.05,.05,.04,m.rubber(),[x,.02,z]);
  tu(g,[[.42,1.4,-.1],[.55,1.0,0],[.5,.4,.1],[.62,.03,.25]],.035,m.gloss(PAL.coral));tu(g,[[.42,1.1,-.2],[.6,.8,-.2],[.58,.3,-.1],[.75,.03,0]],.03,m.gloss(PAL.lemon));
  pot(g,m,[-.18,1.84,-.1],.1,.13,PAL.coral);P(g,G.ca(.07,.12),m.c(PAL.moss),[-.18,2.03,-.1]);S(g,.03,m.c(PAL.pink),[-.18,2.13,-.1]);
  const bot=grp(g,[.18,1.84,-.1]);B(bot,.18,.14,.14,.05,m.gloss(PAL.mint),[0,.07,0]);both(x=>S(bot,.02,m.eye(),[x*.04,.09,.07],[1,1.3,.5]));bt(bot,[0,.14,0],[0,.22,0],.01,m.steel());S(bot,.025,m.glow(PAL.coral,2),[0,.23,0]);
  g.userData.tick=t=>{led.offset.x=Math.floor(t*3)%10*.1}}});

furn('zahnrad_tisch',{n:'Zahnrad-Tisch',cat:'tisch',price:1100,planet:'schrott',size:[1,1],h:.8,b:(g,m,o,rnd)=>{
  P(g,G.puff(gearShape(.48,12,.08),.05,.02),m.copper(),[0,.74,0],[-PI/2,0,0]);
  C(g,.18,.18,.06,m.gloss(PAL.teal),[0,.745,0]);S(g,.05,m.chrome(),[0,.79,0],[1,.5,1]);
  for(let i=0;i<6;i++){const a=i/6*TAU;S(g,.025,m.chrome(),[Math.cos(a)*.3,.785,Math.sin(a)*.3],[1,.6,1])}
  const hx=[];for(let i=0;i<=60;i++){const t=i/60,a=t*TAU*5;hx.push([Math.cos(a)*.1,.18+t*.5,Math.sin(a)*.1])}P(g,G.tu(hx,.025,.025,240),m.chrome());
  C(g,.05,.05,.55,m.steel(),[0,.44,0]);
  P(g,G.puff(gearShape(.3,8,.07),.08,.02),m.gloss(PAL.teal),[0,.07,0],[-PI/2,0,0]);C(g,.12,.12,.12,m.steel(),[0,.12,0]);
  const cup=grp(g,[.2,.77,.12]);C(cup,.06,.05,.1,m.gloss(PAL.lemon),[0,.05,0]);P(cup,G.to(.035,.012),m.gloss(PAL.lemon),[.07,.05,0]);C(cup,.05,.05,.01,m.c(PAL.choc),[0,.095,0])}});

furn('roehren_tv',{n:'Röhrenfernseher',cat:'technik',price:1400,planet:'schrott',size:[1,1],h:1.3,b:(g,m,o,rnd)=>{
  for(const x of[-1,1])for(const z of[-1,1])bt(g,[x*.24,0,z*.18],[x*.2,.3,z*.14],.025,m.c(PAL.bark));
  B(g,.84,.66,.62,.2,m.gloss(PAL.coral),[0,.62,-.02]);
  B(g,.56,.46,.1,.1,m.c(PAL.cream),[-.08,.62,.27]);
  const sc=ctex('fu-tv',256,200,(x,w,h)=>{const bars=['#FFF1A8','#A6EBC3','#7FDCE6','#C6A9FF','#FF8FB8','#FFB27A'];bars.forEach((c,i)=>{x.fillStyle=c;x.fillRect(i*w/6,0,w/6,h)});
    x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(w/2,h/2,62,0,TAU);x.fill();x.fillStyle='#3B3450';x.beginPath();x.ellipse(w/2-24,h/2-12,9,13,0,0,TAU);x.ellipse(w/2+24,h/2-12,9,13,0,0,TAU);x.fill();
    x.strokeStyle='#3B3450';x.lineWidth=7;x.lineCap='round';x.beginPath();x.arc(w/2,h/2+8,24,.3,PI-.3);x.stroke();x.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<h;y+=6)x.fillRect(0,y,w,2)});
  P(g,G.bx(.48,.38,.06,.06),glowTex('tv',sc),[-.08,.62,.3]);
  B(g,.16,.46,.04,.04,m.c(PAL.ink),[.3,.62,.28]);both(y=>C(g,.045,.045,.05,m.gloss(PAL.lemon),[.3,.62+y*.12,.31],[PI/2,0,0]));
  both(x=>{bt(g,[x*.05,.94,-.05],[x*.34,1.3,-.1],.012,m.chrome());S(g,.035,m.gloss(x<0?PAL.mint:PAL.lemon),[x*.34,1.3,-.1])});P(g,G.hs(.08),m.gloss(PAL.honey),[0,.94,-.05],null,[1,.6,1]);
  g.userData.light={p:[0,.6,.6],c:'#C8F0FF',i:.5}}});

furn('ersatzteil_sofa',{n:'Ersatzteil-Sofa',cat:'sitz',price:1800,planet:'schrott',size:[2,1],h:.95,b:(g,m,o,rnd)=>{
  B(g,1.6,.18,.76,.06,m.steel(),[0,.2,0]);
  const cs=[PAL.teal,PAL.coral,PAL.honey];[-1,0,1].forEach((i,k)=>{B(g,.5,.18,.62,.08,m.plush(cs[k]),[i*.52,.38,.04]);B(g,.5,.46,.16,.08,m.plush(cs[(k+1)%3]),[i*.52,.64,-.28],[-.12,0,0])});
  P(g,G.puff(sshp([[-.08,-.08],[.09,-.07],[.08,.09],[-.09,.08]]),.01,.005),m.c(PAL.lemon),[-.42,.64,-.19],[-.12,0,.3]);
  P(g,G.puff(sshp([[-.07,-.06],[.08,-.07],[.07,.07],[-.08,.06]]),.01,.005),m.c(PAL.lilac),[.63,.4,.36],[0,0,-.2]);
  both(x=>{P(g,G.to(.22,.1),m.rubber(),[x*.86,.4,0],[0,PI/2,0]);C(g,.13,.13,.12,m.chrome(),[x*.86,.4,0],[0,0,PI/2])});
  for(let i=0;i<6;i++)S(g,.025,m.chrome(),[-.7+i*.28,.24,.39]);
  for(const x of[-.7,.7])for(const z of[-.3,.3]){C(g,.06,.06,.05,m.rubber(),[x,.06,z],[0,0,PI/2]);C(g,.02,.02,.1,m.steel(),[x,.1,z])}
  g.userData.seat=[0,.5,.1]}});

furn('neon_schild',{n:'Neon-Schild',cat:'wand',price:1300,planet:'schrott',size:[2,1],h:1.9,wall:true,b:(g,m,o,rnd)=>{
  const z=-.5;B(g,1.5,.66,.06,.1,m.c(PAL.plum),[0,1.45,z+.03]);for(const x of[-.66,.66])for(const y of[1.18,1.72])S(g,.025,m.chrome(),[x,y,z+.065],[1,1,.5]);
  const hp=[];for(let i=0;i<=40;i++){const t=i/40*TAU;hp.push([-.5+.011*16*Math.pow(Math.sin(t),3),1.47+.011*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)),z+.1])}
  P(g,G.tu(hp,.02,.02,120),m.glow('#FF6FB0',2.4));
  tu(g,[[.5,1.66,z+.1],[.4,1.46,z+.1],[.52,1.46,z+.1],[.42,1.24,z+.1]],.02,m.glow('#FFE27A',2.4));
  const tx=ctex('fu-neon',256,96,(x,w,h)=>{x.clearRect(0,0,w,h);x.font=`bold 56px ${FONT}`;x.textAlign='center';x.textBaseline='middle';x.shadowColor='#7FF6FF';x.shadowBlur=12;x.strokeStyle='#bffcff';x.lineWidth=6;x.strokeText('CYBORG',w/2,h/2);x.fillStyle='#e8ffff';x.fillText('CYBORG',w/2,h/2)});
  const tm=new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false});tm.userData.glow=true;P(g,G.pl(.62,.24),tm,[.03,1.45,z+.075]);
  tu(g,[[.6,1.14,z+.05],[.64,.95,z+.06],[.5,.85,z+.06],[.4,.9,z+.05]],.014,m.rubber());
  g.userData.light={p:[0,1.45,z+.4],c:'#FF9AD0',i:.7}}});

furn('loetstation',{n:'Lötstation',cat:'technik',price:1700,planet:'schrott',size:[1,1],h:1.35,b:(g,m,o,rnd)=>{
  B(g,.94,.07,.66,.03,Wd(m,PAL.oak),[0,.74,0]);for(const x of[-.42,.42])for(const z of[-.28,.28])C(g,.03,.03,.72,m.gloss(PAL.teal),[x,.36,z]);B(g,.86,.04,.56,.02,m.gloss(PAL.teal),[0,.2,0]);
  const bx=grp(g,[-.24,.78,-.12]);B(bx,.3,.16,.22,.05,m.gloss(PAL.coral),[0,.08,0]);B(bx,.14,.07,.02,.01,m.glow('#8FF7FF',1.6),[-.04,.1,.11]);C(bx,.035,.035,.04,m.gloss(PAL.lemon),[.09,.08,.12],[PI/2,0,0]);
  const hx=[];for(let i=0;i<=30;i++){const t=i/30,a=t*TAU*3;hx.push([.02+Math.cos(a)*.05,.8+t*.16,-.05+Math.sin(a)*.05])}P(g,G.tu(hx,.012,.012,120),m.chrome());
  bt(g,[.02,.84,-.05],[.1,1.02,.02],.022,m.gloss(PAL.lemon));bt(g,[.1,1.02,.02],[.13,1.08,.05],.01,m.chrome());
  tu(g,[[-.2,.86,-.12],[-.1,.95,-.2],[.05,.95,-.1],[.03,.9,-.05]],.012,m.rubber());
  B(g,.3,.02,.2,.01,m.c(PAL.forest),[.18,.78,.12]);[[.1,.1],[.24,.15],[.18,.06]].forEach(([x,z],i)=>B(g,.06,.025,.04,.008,m.c(PAL.ink),[x,.8,z]));S(g,.02,m.glow('#FF5A7A',2),[.28,.8,.08]);
  const sp=grp(g,[-.32,.78,.18]);C(sp,.05,.05,.08,m.steel(),[0,.04,0]);P(sp,G.to(.045,.022),m.chrome(),[0,.04,0],[PI/2,0,0]);
  const arm=grp(g,[.38,.78,-.25]);C(arm,.06,.07,.03,m.gloss(PAL.lemon),[0,.015,0]);limbSeg(arm,[0,.02,0],[-.05,.38,.08],.02,m.gloss(PAL.lemon));limbSeg(arm,[-.05,.38,.08],[-.18,.45,.3],.02,m.gloss(PAL.lemon));
  P(arm,G.to(.1,.025),m.gloss(PAL.lemon),[-.2,.4,.33],[-.9,0,0]);P(arm,G.circ(.09),m.glass('#e8fbff'),[-.2,.4,.33],[-.9,0,0]);
  [[.2,.86,.15,.03],[.24,.93,.1,.04],[.19,1.0,.14,.05]].forEach(([x,y,z,r])=>{const s=S(g,r,m.c('#ffffff',{opacity:.6}),[x,y,z]);s.userData.noOutline=true})}});

furn('satelliten_sessel',{n:'Satelliten-Sessel',cat:'sitz',price:1500,planet:'schrott',size:[1,1],h:1.2,b:(g,m,o,rnd)=>{
  for(let i=0;i<3;i++){const a=i/3*TAU+PI/2;bt(g,[Math.cos(a)*.36,0,Math.sin(a)*.36],[0,.3,0],.035,m.steel());S(g,.05,m.rubber(),[Math.cos(a)*.36,.03,Math.sin(a)*.36])}
  C(g,.09,.12,.12,m.gloss(PAL.teal),[0,.3,0]);
  const d=grp(g,[0,.46,-.02],[.45,0,0]);
  P(d,G.la([[0,-.02],[.2,0],[.4,.06],[.53,.17],[.56,.21],[.52,.21],[.4,.12],[.2,.07],[0,.05]]),m.white(),[0,0,0]);
  P(d,G.to(.545,.035),m.gloss(PAL.coral),[0,.2,0],[PI/2,0,0]);
  C(d,.34,.38,.06,m.plush(PAL.lilac),[0,.1,0]);
  bt(d,[.3,.2,-.45],[.42,.55,-.5],.02,m.steel());S(d,.07,m.gloss(PAL.honey),[.42,.57,-.5]);S(d,.03,m.glow('#FF5A7A',2),[.42,.65,-.5]);
  P(d,G.ca(.08,.4),m.plush(PAL.lavender),[0,.24,-.38],[0,0,PI/2]);
  g.userData.seat=[0,.55,.1]}});

furn('batterie_hocker',{n:'Batterie-Hocker',cat:'sitz',price:350,planet:'schrott',size:[1,1],h:.5,b:(g,m,o,rnd)=>{
  C(g,.22,.22,.14,m.gloss(PAL.ink),[0,.07,0]);C(g,.225,.225,.26,m.gloss(PAL.orange),[0,.27,0]);P(g,G.to(.215,.02),m.chrome(),[0,.4,0],[PI/2,0,0]);
  C(g,.18,.2,.08,m.plush(PAL.lemon),[0,.44,0]);C(g,.06,.06,.04,m.chrome(),[0,.49,0]);
  [0,1,2].forEach(i=>B(g,.1,.035,.02,.01,m.glow('#6CFF9A',1.8),[0,.19+i*.05,.215]));
  const bo=new THREE.Shape();bo.moveTo(.02,.1);bo.lineTo(-.05,-.01);bo.lineTo(0,-.01);bo.lineTo(-.02,-.1);bo.lineTo(.05,.02);bo.lineTo(0,.02);bo.closePath();
  const bl=P(g,G.puff(bo,.02,.008),m.c(PAL.lemon),[0,.3,.22]);bl.position.set(Math.sin(.9)*.225,.3,Math.cos(.9)*.225);bl.rotation.y=.9;
  g.userData.seat=[0,.48,0]}});

furn('plasmakugel',{n:'Plasmakugel',cat:'licht',price:1200,planet:'schrott',size:[1,1],h:.85,b:(g,m,o,rnd)=>{
  P(g,G.la([[0,0],[.22,0],[.24,.04],[.2,.14],[.12,.26],[.13,.3],[0,.3]]),m.gloss(PAL.plum),[0,0,0]);
  both(x=>S(g,.025,m.glow(x<0?PAL.mint:PAL.coral,2),[x*.08,.12,.17]));
  S(g,.25,m.glass('#e6dcff'),[0,.52,0]);S(g,.06,m.glow('#FFB8F0',2.2),[0,.52,0]);
  const bolts=grp(g,[0,.52,0]);const r=srand(4);
  for(let i=0;i<6;i++){const a=i/6*TAU,e=(r()-.3)*1.2;const pts=[[0,0,0]];for(let k=1;k<=4;k++){const t=k/4;pts.push([Math.cos(a)*Math.cos(e)*.23*t+(r()-.5)*.04,Math.sin(e)*.23*t+(r()-.5)*.04,Math.sin(a)*Math.cos(e)*.23*t+(r()-.5)*.04])}
    P(bolts,G.tu(pts,.012,.008,24),m.glow(i%2?'#FF8FE0':'#B8A0FF',2.4))}
  g.userData.tick=t=>{bolts.rotation.y=t*.8;bolts.rotation.z=Math.sin(t*1.3)*.3};g.userData.light={p:[0,.52,0],c:'#E0A0FF',i:.8}}});

furn('mini_mech',{n:'Mini-Mech',cat:'deko',price:4200,planet:'schrott',size:[1,1],h:1.35,b:(g,m,o,rnd)=>{
  const a=m.gloss(PAL.honey),b=m.gloss(PAL.teal),j=m.steel();
  both(x=>{B(g,.2,.1,.3,.05,b,[x*.2,.05,.03]);limbSeg(g,[x*.2,.12,0],[x*.24,.36,-.03],.055,j);S(g,.08,a,[x*.24,.38,-.03]);limbSeg(g,[x*.24,.4,-.03],[x*.2,.58,0],.06,a)});
  P(g,G.s(.33),a,[0,.82,0],[0,0,0],[1,.9,.9]);B(g,.4,.08,.5,.04,b,[0,.62,0]);
  P(g,G.hs(.22),m.glass('#d8f4ff'),[0,.98,.05],[.5,0,0]);
  const pl=grp(g,[0,.98,.08]);S(pl,.1,m.c(PAL.mint),[0,.06,0]);face(pl,m,[0,.07,.09],.14,{});
  P(g,G.cy(.26,.27,.04),b,[0,1.0,.05],[.5,0,0]).scale.set(1,1,1);
  both(x=>{S(g,.1,b,[x*.36,.86,0]);limbSeg(g,[x*.4,.84,0],[x*.5,.64,.1],.045,j);P(g,G.to(.07,.03,PI*1.3),a,[x*.52,.56,.12],[0,x*.3,PI/2+PI*.15*x])});
  bt(g,[.15,1.1,-.12],[.22,1.35,-.18],.012,j);S(g,.035,m.glow(PAL.strawberry,2),[.22,1.36,-.18]);
  B(g,.2,.08,.02,.02,m.c(PAL.ink),[0,.72,.3],[.25,0,0]);S(g,.02,m.glow('#6CFF9A',2),[-.05,.72,.31]);S(g,.02,m.glow('#FFE27A',2),[.05,.72,.31]);
  P(g,G.star(.06,.03,5,.02),m.c(PAL.coral),[.22,.85,.25],[0,.6,0])}});

furn('kabel_teppich',{n:'Kabel-Teppich',cat:'teppich',price:600,planet:'schrott',size:[2,2],h:.1,b:(g,m,o,rnd)=>{
  C(g,.88,.88,.02,m.c(PAL.shadow),[0,.01,0]);
  const cs=[PAL.coral,PAL.lemon,PAL.teal,PAL.lilac];const turns=7,seg=cs.length;
  for(let s=0;s<seg;s++){const pts=[];for(let i=0;i<=60;i++){const t=(s+i/60)/seg,a=t*turns*TAU;const r=.06+t*.76;pts.push([Math.cos(a)*r,.05,Math.sin(a)*r])}P(g,G.tu(pts,.05,.05,220),m.gloss(cs[s]))}
  const pl=grp(g,[.9,.06,-.1],[0,.3,0]);B(pl,.12,.09,.16,.03,m.gloss(PAL.cream),[0,0,0]);both(x=>B(pl,.02,.02,.08,.005,m.chrome(),[x*.03,0,.11]))}});

furn('kuehlschrank',{n:'Kühlschrank mit Magneten',cat:'kueche',price:2000,planet:'schrott',size:[1,1],h:1.8,b:(g,m,o,rnd)=>{
  const bd=m.gloss(PAL.mint);B(g,.8,1.66,.66,.18,bd,[0,.9,-.14]);
  B(g,.74,.03,.02,.01,m.c(PAL.teal),[0,1.3,.2]);
  P(g,G.ca(.03,.3),m.chrome(),[.3,.9,.22]);P(g,G.ca(.03,.12),m.chrome(),[.3,1.44,.22]);
  for(const x of[-.3,.3])for(const z of[-.38,.1])C(g,.04,.03,.08,m.chrome(),[x,.04,z]);
  P(g,G.heart(.06,.03),m.gloss(PAL.strawberry),[-.18,1.45,.21]);P(g,G.star(.06,.03,5,.03),m.gloss(PAL.lemon),[.05,1.5,.21]);
  S(g,.045,m.gloss(PAL.sky),[-.25,1.05,.21],[1,1,.4]);S(g,.04,m.gloss(PAL.coral),[.1,.55,.21],[1,1,.4]);
  const dr=ctex('fu-kritzel',128,160,(x,w,h)=>{x.fillStyle='#FFFDF7';x.fillRect(0,0,w,h);x.lineWidth=5;x.lineCap='round';x.strokeStyle='#6AA8F0';x.strokeRect(34,40,60,56);x.beginPath();x.arc(64,24,18,0,TAU);x.stroke();
    x.strokeStyle='#F0556E';x.beginPath();x.moveTo(34,60);x.lineTo(12,44);x.moveTo(94,60);x.lineTo(118,40);x.moveTo(48,96);x.lineTo(44,140);x.moveTo(80,96);x.lineTo(86,140);x.stroke();x.fillStyle='#3B3450';x.fillRect(56,20,4,4);x.fillRect(70,20,4,4);x.fillStyle='#7CC46A';x.font=`bold 20px ${FONT}`;x.fillText('ICH!',44,78)});
  decal(g,m,dr,'kritzel',.26,.32,[-.08,.85,.205],[0,0,.08]);S(g,.035,m.gloss(PAL.grape),[-.08,1.0,.215],[1,1,.4]);
  const lt=grp(g,[.22,1.78,-.14]);B(lt,.24,.12,.16,.05,m.gloss(PAL.honey),[0,0,0]);both(x=>S(lt,.02,m.eye(),[x*.05,.02,.08],[1,1.3,.5]));P(lt,G.to(.03,.008,PI*.8),m.c(PAL.ink),[0,-.02,.085],[0,0,PI+PI*.1])}});
/* ======================================================================
   MÖBEL · Korallen-Welt (Strand & Meer)
   ====================================================================== */
const surfTexF=()=>ctex('fu-surf',64,64,(x,w,h)=>{x.fillStyle='#FFF1A8';x.fillRect(0,0,w,h);x.fillStyle='#FF7E6B';x.fillRect(0,20,w,10);x.fillStyle='#56C6B6';x.fillRect(0,38,w,6)});
function scallop(R,n,base){const p=[[-base,0],[base,0]];for(let i=0;i<=n*2;i++){const a=.15*PI+(1-i/(n*2))*.7*PI;const r=i%2?R*.9:R;p.push([Math.cos(a)*r,Math.sin(a)*r])}return sshp(p)}
function shellRibs(g,mat,R,n,z,y0,sc){for(let i=0;i<n;i++){const a=.2*PI+(i+.5)/n*.6*PI;const l=R*.82;const r=P(g,G.ca(R*.05,l*.8),mat,[Math.cos(a)*l*.5,y0+Math.sin(a)*l*.5,z],[0,0,a-PI/2],sc)}}
const starfish=(g,m,p,r,col,rot)=>P(g,G.star(r,r*.45,5,r*.35),m.gloss(col||PAL.coral),p,rot);
function fish(g,m,p,col,s){const f=grp(g,p);S(f,.1*s,m.gloss(col),[0,0,0],[1.3,1,.7]);P(f,G.puff(sshp([[0,0],[-.1,.08],[-.08,0],[-.1,-.08]]),.02),m.gloss(col),[-.1*s,0,0],null,s);
  S(f,.025*s,m.eye(),[.08*s,.03*s,.05*s]);S(f,.025*s,m.eye(),[.08*s,.03*s,-.05*s]);return f}

furn('muschelbett',{n:'Muschelbett',cat:'bett',price:2400,planet:'korallen',size:[1,2],h:1.35,b:(g,m,o,rnd)=>{
  B(g,.94,.26,1.84,.1,m.gloss(PAL.peach),[0,.17,.04]);B(g,.86,.16,1.7,.07,m.c(PAL.white),[0,.36,.06]);
  const wt=ctex('fu-wellen',128,128,(x,w,h)=>{x.fillStyle=PAL.aqua;x.fillRect(0,0,w,h);x.strokeStyle='#ffffff';x.lineWidth=6;for(let j=0;j<4;j++){x.beginPath();for(let i=0;i<=w;i+=4)x.lineTo(i,j*32+16+Math.sin(i/w*TAU*2)*7);x.stroke()}});
  B(g,.92,.13,1.1,.06,m.tex('wellen',wt),[0,.4,.34]);B(g,.94,.07,.14,.035,m.c(PAL.white),[0,.465,-.25]);
  const hb=grp(g,[0,.12,-.86],null);hb.scale.set(1,1.45,1);P(hb,G.puff(scallop(.6,7,.18),.12,.05),m.gloss(PAL.blush));shellRibs(hb,m.gloss(PAL.pink),.6,7,.07,0,1);
  S(g,.1,m.pearl(),[0,1.05,-.76]);P(g,G.ca(.14,.35),m.plush(PAL.lilac),[0,.5,-.6],[0,0,PI/2]);
  starfish(g,m,[.3,.48,.55],.1,PAL.orange,[-PI/2,0,.4]);
  g.userData.sleep=[0,.5,0]}});

furn('aquarium',{n:'Aquarium',cat:'deko',price:3400,planet:'korallen',size:[2,1],h:1.5,b:(g,m,o,rnd)=>{
  B(g,1.7,.6,.6,.06,m.gloss(PAL.navy),[0,.3,-.05]);both(x=>{B(g,.74,.44,.03,.05,m.gloss(PAL.blue),[x*.4,.3,.26]);S(g,.035,m.gold(),[x*.1,.3,.29])});
  const tk=grp(g,[0,.62,-.05]);B(tk,1.68,.06,.58,.02,m.gloss(PAL.sky),[0,.03,0]);B(tk,1.68,.06,.58,.02,m.gloss(PAL.sky),[0,.8,0]);for(const x of[-.82,.82])for(const z of[-.27,.27])B(tk,.05,.8,.05,.02,m.gloss(PAL.sky),[x,.42,z]);
  P(tk,G.bx(1.62,.72,.52,.02),m.glass('#dff6ff'),[0,.42,0]);P(tk,G.bx(1.58,.6,.48),m.c(PAL.aqua,{opacity:.35}),[0,.36,0]);
  P(tk,G.blob(.5,.08,4,2),m.c(PAL.sand),[0,.06,0],null,[1.55,.18,.46]);
  [[-.55,PAL.forest],[-.45,PAL.moss],[.5,PAL.leaf],[.62,PAL.moss]].forEach(([x,c],i)=>tu(tk,[[x,.06,-.1],[x+.05,.25,-.12],[x-.04,.45,-.1],[x+.03,.6,-.12]],.03,m.c(c),.015));
  const cs=grp(tk,[.15,.08,-.08]);C(cs,.09,.1,.2,m.c(PAL.stone),[0,.1,0]);P(cs,G.co(.1,.12),m.c(PAL.rose),[0,.26,0]);B(cs,.05,.08,.02,.02,m.c(PAL.ink),[0,.04,.1]);
  starfish(tk,m,[-.2,.12,.12],.07,PAL.coral,[-1.2,0,0]);
  const fs=[fish(tk,m,[0,0,0],PAL.orange,1),fish(tk,m,[0,0,0],PAL.lemon,.8),fish(tk,m,[0,0,0],PAL.pink,.9)];
  const bb=range(4,(t,i)=>{const b=S(tk,.025+i*.006,m.c('#ffffff',{opacity:.7}),[.55,.2+i*.12,.1]);b.userData.noOutline=true;return b});
  const pos=(t)=>fs.forEach((f,i)=>{const a=t*(.4+i*.13)+i*2.1;f.position.set(Math.sin(a)*.6,.32+i*.1+Math.sin(a*2)*.04,Math.cos(a)*.12);f.rotation.y=Math.cos(a)>0?0:PI});pos(0);
  g.userData.tick=t=>{pos(t);bb.forEach((b,i)=>{b.position.y=.15+((t*.25+i*.25)%1)*.55})}}});

furn('palme_topf',{n:'Palme im Topf',cat:'pflanze',price:1100,planet:'korallen',size:[1,1],h:2.0,b:(g,m,o,rnd)=>{
  pot(g,m,[0,0,0],.26,.42,PAL.sky);P(g,G.to(.3,.03),m.c(PAL.white),[0,.34,0],[PI/2,0,0]);
  const pts=range(6,(t)=>[Math.sin(t*1.4)*.2,.4+t*1.2,0]);pts.forEach((p,i)=>{if(i<5){const q=pts[i+1];bt(g,p,q,.075-i*.006,m.c(i%2?PAL.oak:PAL.wood),.09-i*.006);P(g,G.to(.08-i*.006,.02),m.c(PAL.bark),q,[PI/2,0,0])}});
  const top=pts[5];S(g,.09,m.c(PAL.bark),top);
  for(let i=0;i<7;i++){const a=i/7*TAU;const l=P(g,G.puff(leafShape(.8,.3),.04),m.c(i%2?PAL.leaf:PAL.grass),top);l.rotation.set(0,-a+PI/2,0,'YXZ');l.rotateX(-1.25-(i%2)*.2)}
  [[.07,-.08,.05],[-.06,-.1,.06],[0,-.1,-.08]].forEach(p=>S(g,.07,m.c(PAL.choc),[top[0]+p[0],top[1]+p[1],top[2]+p[2]]))}});

furn('surfbrett',{n:'Surfbrett',cat:'wand',price:900,planet:'korallen',size:[1,1],h:2.2,wall:true,b:(g,m,o,rnd)=>{
  const z=-.5;const bs=sshp([[0,-.95],[.2,-.7],[.26,-.1],[.2,.6],[0,.98],[-.2,.6],[-.26,-.1],[-.2,-.7]]);
  const t=rtex(surfTexF(),1,1);const mt=m.tex('surf',t,{gloss:1});
  P(g,G.puff(bs,.06,.025),mt,[0,1.2,z+.08]);
  P(g,G.puff(flowerShape(.09,5),.02),m.c(PAL.white),[.02,1.62,z+.13]);S(g,.035,m.c(PAL.lemon),[.02,1.62,z+.14]);
  both(y=>{B(g,.62,.06,.1,.03,Wd(m,PAL.oak),[0,1.2+y*.45,z+.05])})}});

furn('rettungsring',{n:'Rettungsring',cat:'wand',price:500,planet:'korallen',size:[1,1],h:1.9,wall:true,b:(g,m,o,rnd)=>{
  const z=-.5,c=[0,1.4,z+.13];for(let i=0;i<8;i++)P(g,G.to(.3,.1,TAU/8),m.gloss(i%2?'#F6F4FA':PAL.strawberry),c,[0,0,i/8*TAU]);
  for(let i=0;i<4;i++){const a=i/4*TAU+PI/4;P(g,G.to(.11,.018),m.c(PAL.sand),[c[0]+Math.cos(a)*.3,c[1]+Math.sin(a)*.3,c[2]],[0,0,a])}
  C(g,.04,.04,.12,Wd(m,PAL.wood),[0,1.8,z+.06],[PI/2,0,0]);S(g,.05,Wd(m,PAL.wood),[0,1.8,z+.12]);
  const tt=signTex('ahoi','AHOI',{bg:PAL.white,fg:PAL.navy,border:false,w:128,h:64});decal(g,m,tt,'ahoi',.2,.1,[0,1.4,z+.08])}});

furn('korallen_lampe',{n:'Korallen-Lampe',cat:'licht',price:950,planet:'korallen',size:[1,1],h:1.2,b:(g,m,o,rnd)=>{
  P(g,G.blob(.28,.12,4,3),m.c(PAL.stone),[0,.1,0],null,[1,.55,1]);
  const cm=m.gloss(PAL.coral),tips=[];
  const br=[[[0,.2,0],[.02,.5,0],[-.05,.8,.02]],[[.02,.45,0],[.2,.62,0],[.28,.9,.03]],[[.0,.35,0],[-.2,.5,.05],[-.3,.72,.08]],[[-.04,.6,0],[-.12,.85,-.05],[-.1,1.05,-.05]],[[.15,.55,0],[.12,.75,-.1],[.12,.95,-.12]]];
  br.forEach((b,i)=>{P(g,G.tu(b,.065-i*.005,.04,20),cm);tips.push(S(g,.06,m.glow(i%2?'#FFD0E0':'#FFE8B0',2),b[2]))});
  starfish(g,m,[.18,.2,.18],.07,PAL.lemon,[-.9,0,.3]);
  const sh=grp(g,[-.18,.18,.2],[.3,0,0]);P(sh,G.puff(scallop(.08,5,.03),.03,.01),m.gloss(PAL.blush));
  g.userData.light={p:[0,.9,0],c:'#FFC8B0',i:1};g.userData.tick=t=>tips.forEach((p,i)=>p.scale.setScalar(.85+.2*Math.sin(t*2+i)))}});

furn('haengematte',{n:'Hängematte',cat:'bett',price:1600,planet:'korallen',size:[2,1],h:1.3,b:(g,m,o,rnd)=>{
  const wd=Wd(m,PAL.wood);
  both(x=>{bt(g,[x*.95,0,-.25],[x*.9,1.25,0],.05,wd);bt(g,[x*.95,0,.25],[x*.9,1.25,0],.05,wd);S(g,.07,wd,[x*.9,1.26,0])});
  B(g,1.9,.05,.1,.025,wd,[0,.06,-.25]);B(g,1.9,.05,.1,.025,wd,[0,.06,.25]);
  const ys=.35,pts=range(12,(t)=>{const x=(t-.5)*1.4;return[x,(.4+(x*x)*.55)/ys,0]});
  const st=stripeTex('hm',PAL.coral,PAL.butter,8,false);
  P(g,G.tu(pts,.26,.26,48),m.tex('hm',st,{side:THREE.DoubleSide}),[0,0,0],null,[1,ys,1]);
  both(x=>{const e=[x*.7,.4+.49*.55,0];S(g,.05,m.c(PAL.sand),e);bt(g,e,[x*.9,1.2,0],.018,m.c(PAL.sand))});
  P(g,G.ca(.1,.25),m.plush(PAL.white),[-.42,.62,0],[PI/2,0,0]);
  starfish(g,m,[.2,.5,.1],.07,PAL.lemon,[-PI/2,0,0]);
  g.userData.sleep=[0,.55,0]}});

furn('strandkorb',{n:'Strandkorb',cat:'sitz',price:2600,planet:'korallen',size:[1,1],h:1.75,b:(g,m,o,rnd)=>{
  const wk=ctex('fu-weide',64,64,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='rgba(150,100,50,.18)';for(let j=0;j<4;j++)for(let i=0;i<4;i++){if((i+j)%2)x.fillRect(i*16,j*16+2,16,12);else x.fillRect(i*16+2,j*16,12,16)}});
  const wm=m.tex('weide',rtex(wk,3,3),{color:PAL.sand}),fb=m.tex('korb-str',rtex(stripeTex('sk',PAL.white,PAL.blue,8,true),1,1));
  B(g,.9,.46,.72,.06,wm,[0,.23,0]);
  both(x=>P(g,G.puff(sshp([[-.34,.4],[.34,.4],[.34,.74],[.08,.84],[.12,1.25],[.34,1.52],[.2,1.72],[-.2,1.76],[-.36,1.5]]),.07,.025),wm,[x*.43,0,0],[0,-PI/2,0]));
  B(g,.84,1.3,.08,.04,wm,[0,1.1,-.33]);B(g,.82,.08,.6,.04,wm,[0,1.72,-.06],[.12,0,0]);
  B(g,.74,1.02,.03,.02,fb,[0,1.1,-.28]);B(g,.74,.03,.5,.015,fb,[0,1.66,-.06],[.12,0,0]);
  B(g,.76,.1,.6,.05,m.plush(PAL.blue),[0,.51,.03]);P(g,G.ca(.08,.5),m.plush(PAL.white),[0,.68,-.2],[0,0,PI/2]);
  B(g,.6,.05,.2,.02,wm,[0,.2,.44]);
  S(g,.06,m.gloss(PAL.strawberry),[.43,1.6,.3]);
  g.userData.seat=[0,.55,.05]}});

furn('muscheltisch',{n:'Muscheltisch',cat:'tisch',price:1200,planet:'korallen',size:[1,1],h:.85,b:(g,m,o,rnd)=>{
  const sh=grp(g,[0,.74,-.3],[-PI/2,0,PI]);P(sh,G.puff(scallop(.62,7,.16),.05,.02),m.gloss(PAL.peach));shellRibs(sh,m.gloss(PAL.blush),.62,7,.05,0,[1,1,.7]);
  P(g,G.blob(.25,.1,4,5),m.c(PAL.stone),[0,.08,0],null,[1,.4,1]);
  const cm=m.gloss(PAL.lilac);[[[0,.1,0],[.03,.4,0],[0,.72,0]],[[.02,.3,0],[.16,.45,.05],[.18,.7,.05]],[[.0,.35,0],[-.15,.5,-.05],[-.16,.7,-.08]]].forEach((b,i)=>P(g,G.tu(b,.07-i*.015,.05,20),cm));
  S(g,.06,m.pearl(),[0,.8,-.18])}});

furn('leuchtturm',{n:'Leuchtturm-Modell',cat:'deko',price:1900,planet:'korallen',size:[1,1],h:1.45,b:(g,m,o,rnd)=>{
  P(g,G.blob(.34,.1,4,7),m.c(PAL.slate),[0,.08,0],null,[1,.45,1]);S(g,.12,m.c(PAL.stone),[.25,.12,.18]);S(g,.09,m.c(PAL.stone),[-.28,.1,.12]);
  const segs=4;for(let i=0;i<segs;i++){const y0=.18+i*.2,r0=.23-i*.025,r1=.23-(i+1)*.025;C(g,r1,r0,.2,m.gloss(i%2?PAL.white:PAL.strawberry),[0,y0+.1,0])}
  P(g,G.puff(archShape(.09,.14,.045),.03,.01),m.c(PAL.navy),[0,.2,.225]);C(g,.2,.2,.04,m.c(PAL.navy),[0,1.0,0]);
  for(let i=0;i<8;i++){const a=i/8*TAU;C(g,.012,.012,.1,m.c(PAL.navy),[Math.cos(a)*.18,1.07,Math.sin(a)*.18])}P(g,G.to(.18,.015),m.c(PAL.navy),[0,1.12,0],[PI/2,0,0]);
  C(g,.1,.1,.18,m.glass('#fff8d0'),[0,1.11,0]);const lt=S(g,.07,m.glow('#FFE27A',2.4),[0,1.11,0]);
  P(g,G.co(.15,.16),m.gloss(PAL.strawberry),[0,1.28,0]);S(g,.035,m.gold(),[0,1.37,0]);
  const bm=new THREE.MeshBasicMaterial({color:'#FFF3B0',transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide});bm.userData.glow=true;
  const beam=grp(g,[0,1.11,0]);const bc=P(beam,G.co(.12,.6),bm,[.33,0,0],[0,0,PI/2]);bc.castShadow=false;
  S(g,.04,m.plush(PAL.white),[.2,.36,.2]);
  g.userData.light={p:[0,1.11,0],c:'#FFE9A0',i:.8};g.userData.tick=t=>{beam.rotation.y=t*1.2}}});

furn('treibholz_regal',{n:'Treibholz-Regal',cat:'lager',price:1000,planet:'korallen',size:[2,1],h:1.6,b:(g,m,o,rnd)=>{
  const dw=m.c('#D9CBB4'),dw2=m.c('#C9B79A'),z0=-.25;
  tu(g,[[-.82,0,z0],[-.86,.5,z0],[-.8,1.0,z0],[-.84,1.5,z0]],.06,dw2,.045);tu(g,[[.82,0,z0],[.8,.5,z0],[.85,1.0,z0],[.81,1.5,z0]],.06,dw2,.045);
  [.35,.8,1.25].forEach((y,i)=>{const p=B(g,1.86,.07,.34,.035,i%2?dw2:dw,[0,y,z0]);p.rotation.z=(rnd()-.5)*.04;both(x=>P(g,G.to(.05,.015),m.c(PAL.sand),[x*.82,y+.02,z0],[PI/2,0,0]))});
  const bo=grp(g,[-.45,.39,z0]);C(bo,.09,.09,.24,m.glass('#d8fff0'),[0,.12,0]);C(bo,.04,.05,.08,m.glass('#d8fff0'),[0,.28,0]);C(bo,.035,.035,.05,m.c(PAL.oak),[0,.34,0]);
  B(bo,.1,.03,.04,.01,m.c(PAL.choc),[0,.06,0]);P(bo,G.puff(shp([[0,0],[.06,0],[0,.08]]),.005,.003),m.c(PAL.white),[-.01,.08,0]);
  P(g,G.puff(scallop(.1,5,.04),.03,.01),m.gloss(PAL.blush),[.1,.39,z0],[-.2,0,0]);
  P(g,G.la([[0,0],[.06,.01],[.05,.06],[.03,.12],[0,.16]]),m.gloss(PAL.peach),[.35,.39,z0],[0,0,-.3]);
  starfish(g,m,[-.1,.9,z0+.05],.09,PAL.coral,[-.3,0,.3]);
  C(g,.09,.08,.18,m.glass('#e8fbff'),[.5,.93,z0]);C(g,.085,.075,.08,m.c(PAL.sand),[.5,.88,z0]);C(g,.095,.095,.03,m.c(PAL.wood),[.5,1.04,z0]);
  P(g,G.blob(.1,.2,4,4),m.c(PAL.lilac),[-.5,.92,z0],null,[1,.5,1]);
  pot(g,m,[.2,1.29,z0],.09,.13,PAL.aqua);for(let i=0;i<5;i++){const a=i/5*TAU;P(g,G.ca(.02,.14),m.c(PAL.mint),[.2+Math.cos(a)*.04,1.49,z0+Math.sin(a)*.04],[Math.sin(a)*.5,0,-Math.cos(a)*.5])}
  const cb=grp(g,[-.45,1.29,z0]);S(cb,.1,m.gloss(PAL.strawberry),[0,.07,0],[1.3,.7,1]);both(x=>{S(cb,.04,m.gloss(PAL.strawberry),[x*.17,.1,.05]);P(cb,G.to(.04,.015,PI*1.2),m.gloss(PAL.strawberry),[x*.19,.15,.05])});
  face(cb,m,[0,.11,.09],.12,{})}});

furn('quallen_lampe',{n:'Quallen-Lampe',cat:'licht',price:1300,planet:'korallen',size:[1,1],h:1.75,b:(g,m,o,rnd)=>{
  C(g,.22,.25,.05,m.gloss(PAL.teal),[-.25,.025,0]);tu(g,[[-.25,0,0],[-.25,.9,0],[-.2,1.5,0],[0,1.72,0],[.12,1.6,0]],.03,m.gloss(PAL.teal));
  const jf=grp(g,[.12,1.28,0]);bt(jf,[0,.3,0],[0,.18,0],.008,m.c(PAL.ink));
  P(jf,G.hs(.24),m.c(PAL.lilac,{opacity:.75,rim:1.2}),[0,0,0],null,[1,.8,1]);S(jf,.12,m.glow('#FFC8F0',2),[0,.04,0]);
  P(jf,G.to(.23,.03),m.c(PAL.pink,{opacity:.8}),[0,0,0],[PI/2,0,0]);
  face(jf,m,[0,.08,.2],.25,{rx:-.3});
  const tt=[];for(let i=0;i<6;i++){const a=i/6*TAU;const x=Math.cos(a)*.13,z=Math.sin(a)*.13;const t=P(jf,G.tu([[x,0,z],[x*1.1+.02,-.12,z],[x*.9-.02,-.26,z],[x,-.4,z]],.022,.01,20),m.glow(i%2?'#E0B8FF':'#FFB8E0',1.6));tt.push(t)}
  g.userData.light={p:[.12,1.25,0],c:'#F0C0FF',i:.9};g.userData.tick=t=>{jf.position.y=1.28+Math.sin(t*1.5)*.03;jf.scale.y=1+Math.sin(t*3)*.04}}});

furn('sandburg',{n:'Sandburg-Deko',cat:'deko',price:450,planet:'korallen',size:[1,1],h:.95,b:(g,m,o,rnd)=>{
  const sd=m.c(PAL.sand),sd2=m.c('#E8C98C');
  P(g,G.blob(.42,.08,4,2),sd2,[0,.02,0],null,[1,.2,1]);
  C(g,.17,.2,.34,sd,[0,.25,-.05]);for(let i=0;i<5;i++){const a=i/5*TAU;B(g,.07,.07,.07,.02,sd,[Math.cos(a)*.15,.45,-.05+Math.sin(a)*.15])}
  both(x=>{C(g,.1,.12,.24,sd,[x*.25,.14,.08]);P(g,G.co(.12,.14),sd2,[x*.25,.33,.08])});
  P(g,G.puff(archShape(.1,.13,.05),.03,.01),m.c(PAL.choc),[0,.08,.14]);
  bt(g,[0,.42,-.05],[0,.75,-.05],.01,m.c(PAL.bark));P(g,G.puff(shp([[0,0],[.16,-.05],[0,-.1]]),.01,.005),m.c(PAL.strawberry),[0,.74,-.05]);
  P(g,G.puff(scallop(.05,4,.02),.015,.008),m.gloss(PAL.blush),[.12,.22,.12],[0,.3,0]);S(g,.02,m.pearl(),[-.1,.36,.08]);
  const bk=grp(g,[.35,0,.28],[0,0,.25]);P(bk,G.la([[0,0],[.09,0],[.12,.18],[.13,.19],[0,.17]]),m.gloss(PAL.sky),[0,0,0]);P(bk,G.to(.12,.01,PI),m.c(PAL.navy),[0,.19,0]);
  const sp=grp(g,[-.36,.03,.3],[0,.5,-.3]);bt(sp,[0,0,0],[0,.3,0],.015,m.gloss(PAL.lemon));P(sp,G.puff(sshp([[-.05,0],[.05,0],[.04,-.1],[0,-.13],[-.04,-.1]]),.015,.006),m.gloss(PAL.lemon),[0,0,0])}});

furn('fischernetz',{n:'Fischernetz',cat:'wand',price:700,planet:'korallen',size:[2,1],h:2.0,wall:true,b:(g,m,o,rnd)=>{
  const z=-.5;const nt=ctex('fu-netz',128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#E6D2A8';x.lineWidth=5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32+128,128);x.moveTo(i*32-128,0);x.lineTo(i*32,128);x.moveTo(i*32,0);x.lineTo(i*32-128,128);x.moveTo(i*32+128,0);x.lineTo(i*32,128);x.stroke()}});
  const geo=new THREE.PlaneGeometry(1.7,1.0,16,10);const pa=geo.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i);const u=x/.85;const sag=(1-u*u)*.18*(.5-y);pa.setY(i,y-sag);pa.setZ(i,Math.max(0,(.5-y))*.08*(1-u*u)+.02)}geo.computeVertexNormals();
  const mt=new THREE.MeshToonMaterial({gradientMap:TOON_RAMP,map:rtex(nt,4,2.4),alphaTest:.5,side:THREE.DoubleSide});P(g,geo,mt,[0,1.45,z+.02]);
  tu(g,[[-.9,1.95,z+.04],[0,1.93,z+.04],[.9,1.95,z+.04]],.022,m.c(PAL.sand));[-.88,0,.88].forEach(x=>S(g,.045,Wd(m,PAL.wood),[x,1.95,z+.06]));
  [[-.5,1.3,PAL.strawberry],[.45,1.2,PAL.white],[.05,1.05,PAL.orange]].forEach(([x,y,c])=>{S(g,.08,m.gloss(c),[x,y,z+.12],[1,1.2,1])});
  starfish(g,m,[-.15,1.55,z+.1],.12,PAL.coral,[0,0,.3]);P(g,G.puff(scallop(.1,5,.04),.03,.01),m.gloss(PAL.peach),[.5,1.6,z+.1]);
  fish(g,m,[.2,1.35,z+.12],PAL.teal,1.1).rotation.set(0,-PI/2,.3)}});
/* ======================================================================
   TAPETEN & BÖDEN · draw(ctx,w,h) zeichnet ein nahtlos kachelndes 256×256-Motiv
   ====================================================================== */
const circ=(x,cx,cy,r)=>{x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill()};
function flowerAt(x,cx,cy,r,col,mid){x.fillStyle=col;for(let i=0;i<5;i++){const a=i/5*TAU-PI/2;circ(x,cx+Math.cos(a)*r*.62,cy+Math.sin(a)*r*.62,r*.48)}x.fillStyle=mid||PAL.lemon;circ(x,cx,cy,r*.36)}
function starAt(x,cx,cy,R,col){x.fillStyle=col;x.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU-PI/2,r=k%2?R*.45:R;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();x.fill()}
function shellAt(x,cx,cy,s,col){x.fillStyle=col;x.beginPath();x.moveTo(cx,cy+s*.5);for(let i=0;i<=8;i++){const a=PI*1.1+i/8*PI*.8;const r=i%2?s*.9:s;x.lineTo(cx+Math.cos(a)*r,cy+s*.5+Math.sin(a)*r)}x.closePath();x.fill();
  x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=2;for(let i=1;i<4;i++){const a=PI*1.1+i/4*PI*.8;x.beginPath();x.moveTo(cx,cy+s*.5);x.lineTo(cx+Math.cos(a)*s*.8,cy+s*.5+Math.sin(a)*s*.8);x.stroke()}}
function grid(w,h,nx,ny,f){for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)f(i*w/nx,j*h/ny,i,j)}
function traces(x,w,h,col,pad,seed){const r=srand(seed);x.strokeStyle=col;x.lineWidth=5;x.lineCap='round';x.lineJoin='round';const s=32;
  for(let k=0;k<14;k++){let px=Math.floor(r()*8)*s+s/2,py=Math.floor(r()*8)*s+s/2;const pts=[[px,py]];for(let n=0;n<3;n++){const d=Math.floor(r()*4);const L=s*(1+Math.floor(r()*2));if(d===0)px+=L;else if(d===1)px-=L;else if(d===2)py+=L;else{px+=L*.5;py+=L*.5}pts.push([px,py])}
    wrap(w,h,(dx,dy)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0]+dx,p[1]+dy):x.moveTo(p[0]+dx,p[1]+dy));x.stroke();x.fillStyle=pad;[pts[0],pts[pts.length-1]].forEach(p=>{circ(x,p[0]+dx,p[1]+dy,7)});x.fillStyle=col;[pts[0],pts[pts.length-1]].forEach(p=>circ(x,p[0]+dx,p[1]+dy,3))})}}
function scatter(w,h,n,seed,f){const r=srand(seed);for(let i=0;i<n;i++){const px=r()*w,py=r()*h,a=r(),b=r();wrap(w,h,(dx,dy)=>f(px+dx,py+dy,a,b,i))}}

wallpaper('streifen',{n:'Pastellstreifen',price:300,planet:'alle',draw:(x,w,h)=>{x.fillStyle=PAL.cream;x.fillRect(0,0,w,h);for(let i=0;i<4;i++){x.fillStyle=PAL.mint;x.fillRect(i*w/4,0,w/8,h);x.fillStyle=PAL.blush;x.fillRect(i*w/4+w*.17,0,4,h)}}});
wallpaper('bluemchen',{n:'Blümchen',price:450,planet:'kompost',draw:(x,w,h)=>{x.fillStyle=PAL.butter;x.fillRect(0,0,w,h);const cs=[PAL.blush,PAL.lilac,PAL.white,PAL.sky];
  grid(w,h,4,4,(px,py,i,j)=>{const cx=px+(j%2)*w/8+w/16,cy=py+h/16;x.fillStyle=PAL.leaf;x.beginPath();x.ellipse(cx+10,cy+12,8,4,.6,0,TAU);x.fill();wrap(w,h,(dx,dy)=>flowerAt(x,cx+dx,cy+dy,13,cs[(i+j*2)%4]))})}});
wallpaper('pilze',{n:'Pilzwiese',price:600,planet:'kompost',draw:(x,w,h)=>{x.fillStyle='#CFE6B8';x.fillRect(0,0,w,h);
  grid(w,h,3,3,(px,py,i,j)=>{const cx=px+(j%2)*w/6+w/6,cy=py+h/6;wrap(w,h,(dx,dy)=>{const X=cx+dx,Yy=cy+dy;x.fillStyle=PAL.cream;x.fillRect(X-6,Yy,12,20);x.fillStyle=(i+j)%2?PAL.coral:PAL.honey;x.beginPath();x.arc(X,Yy+2,20,PI,0);x.fill();x.fillStyle='#fff';circ(x,X-8,Yy-6,3.5);circ(x,X+6,Yy-10,3);circ(x,X+10,Yy-2,2.5)})});
  x.fillStyle='rgba(94,155,74,.35)';scatter(w,h,30,11,(px,py)=>circ(x,px,py,2.5))}});
wallpaper('holzpaneel',{n:'Holzpaneel',price:500,planet:'kompost',draw:(x,w,h)=>{const cs=['#E2B07C','#D9A26D','#E8BA88','#D69A62'];for(let i=0;i<4;i++){x.fillStyle=cs[i];x.fillRect(i*w/4,0,w/4,h);x.fillStyle='rgba(123,82,54,.35)';x.fillRect(i*w/4,0,4,h);
  x.strokeStyle='rgba(123,82,54,.15)';x.lineWidth=2;for(let k=0;k<3;k++){x.beginPath();const bx=i*w/4+14+k*16;x.moveTo(bx,0);x.bezierCurveTo(bx+6,h*.3,bx-6,h*.6,bx,h);x.stroke()}}}});
wallpaper('ziegel',{n:'Ziegelwand',price:550,planet:'alle',draw:(x,w,h)=>{x.fillStyle='#EBD8C4';x.fillRect(0,0,w,h);const cs=['#E0876A','#D97B5E','#E89A7C','#D46A4C'];let k=0;
  for(let j=0;j<8;j++)for(let i=-1;i<4;i++){const bx=i*w/4+(j%2)*w/8,by=j*h/8;x.fillStyle=cs[(k++*7)%4];rr(x,bx+3,by+3,w/4-6,h/8-6,5);x.fill();x.fillStyle='rgba(255,255,255,.18)';x.fillRect(bx+8,by+6,w/4-24,4)}}});
wallpaper('tupfen',{n:'Tupfen',price:350,planet:'alle',draw:(x,w,h)=>{x.fillStyle=PAL.lilac;x.fillRect(0,0,w,h);x.fillStyle=PAL.white;grid(w,h,4,4,(px,py,i,j)=>{wrap(w,h,(dx,dy)=>circ(x,px+(j%2)*w/8+w/16+dx,py+h/8+dy,10))})}});
wallpaper('sterne',{n:'Sternennacht',price:700,planet:'alle',draw:(x,w,h)=>{x.fillStyle=PAL.navy;x.fillRect(0,0,w,h);grid(w,h,3,3,(px,py,i,j)=>wrap(w,h,(dx,dy)=>starAt(x,px+(j%2)*w/6+w/6+dx,py+h/6+dy,14,(i+j)%2?PAL.lemon:PAL.butter)));
  x.fillStyle='rgba(255,255,255,.8)';scatter(w,h,26,5,(px,py,a)=>circ(x,px,py,1.5+a*2));x.fillStyle=PAL.cream;wrap(w,h,(dx,dy)=>{circ(x,200+dx,56+dy,18);x.fillStyle=PAL.navy;circ(x,208+dx,50+dy,16);x.fillStyle=PAL.cream})}});
wallpaper('karo',{n:'Vichy-Karo',price:400,planet:'alle',draw:(x,w,h)=>{x.fillStyle='#FFFDF7';x.fillRect(0,0,w,h);x.fillStyle='rgba(240,120,154,.4)';for(let i=0;i<8;i+=2){x.fillRect(i*w/8,0,w/8,h);x.fillRect(0,i*h/8,w,h/8)}}});
wallpaper('platine',{n:'Platine',price:800,planet:'schrott',draw:(x,w,h)=>{x.fillStyle='#3E8F7A';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.06)';grid(w,h,8,8,(px,py)=>x.fillRect(px,py,31,31));traces(x,w,h,'#9BE8C8','#FFD66B',3);
  grid(w,h,2,2,(px,py,i,j)=>{const cx=px+w/4+(i-j)*20,cy=py+h/4;x.fillStyle='#2B2540';rr(x,cx-18,cy-12,36,24,4);x.fill();x.fillStyle='#C9CED8';for(let k=0;k<4;k++){x.fillRect(cx-14+k*9,cy-17,4,5);x.fillRect(cx-14+k*9,cy+12,4,5)}})}});
wallpaper('blech',{n:'Nietenblech',price:650,planet:'schrott',draw:(x,w,h)=>{grid(w,h,2,2,(px,py,i,j)=>{const g2=x.createLinearGradient(px,py,px+w/2,py+h/2);g2.addColorStop(0,(i+j)%2?'#C4CEDC':'#B6C2D2');g2.addColorStop(1,(i+j)%2?'#AEB9C8':'#A2AFC2');x.fillStyle=g2;x.fillRect(px,py,w/2,h/2);
  x.fillStyle='rgba(60,70,100,.35)';x.fillRect(px,py,w/2,3);x.fillRect(px,py,3,h/2);for(let k=0;k<4;k++){x.fillStyle='#E6EBF2';circ(x,px+12+k*34,py+12,4.5);circ(x,px+12,py+12+k*34,4.5)}});x.fillStyle='rgba(255,158,69,.35)';circ(x,190,190,14);circ(x,60,200,8)}});
wallpaper('wellen',{n:'Wellen',price:450,planet:'korallen',draw:(x,w,h)=>{x.fillStyle=PAL.sky;x.fillRect(0,0,w,h);for(let j=0;j<4;j++){x.fillStyle=j%2?PAL.aqua:'#B8E6FF';x.beginPath();x.moveTo(0,j*h/4+h/8);for(let i=0;i<=w;i+=4)x.lineTo(i,j*h/4+h/8+Math.sin(i/w*TAU*2)*10);x.lineTo(w,j*h/4+h/4+h/8);for(let i=w;i>=0;i-=4)x.lineTo(i,j*h/4+h/4+h/8+Math.sin(i/w*TAU*2)*10);x.fill()}
  x.strokeStyle='#fff';x.lineWidth=4;for(let j=0;j<4;j++){x.beginPath();for(let i=0;i<=w;i+=4)x.lineTo(i,j*h/4+h/8+Math.sin(i/w*TAU*2)*10);x.stroke()}}});
wallpaper('blasen',{n:'Blubberblasen',price:500,planet:'korallen',draw:(x,w,h)=>{const g2=x.createLinearGradient(0,0,0,h);g2.addColorStop(0,'#56C6B6');g2.addColorStop(.5,'#62CEC0');g2.addColorStop(1,'#56C6B6');x.fillStyle=g2;x.fillRect(0,0,w,h);
  scatter(w,h,22,9,(px,py,a)=>{const r=5+a*16;x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=3;x.beginPath();x.arc(px,py,r,0,TAU);x.stroke();x.fillStyle='rgba(255,255,255,.8)';circ(x,px-r*.35,py-r*.35,r*.22)})}});
wallpaper('muscheln',{n:'Muschelstrand',price:600,planet:'korallen',draw:(x,w,h)=>{x.fillStyle='#FCE9C8';x.fillRect(0,0,w,h);grid(w,h,3,3,(px,py,i,j)=>wrap(w,h,(dx,dy)=>{const cx=px+(j%2)*w/6+w/6+dx,cy=py+h/6+dy;if((i+j)%2)shellAt(x,cx,cy,18,PAL.blush);else starAt(x,cx,cy,16,PAL.coral)}));
  x.fillStyle='rgba(201,140,90,.25)';scatter(w,h,40,21,(px,py)=>circ(x,px,py,1.8))}});

floorpat('dielen',{n:'Holzdielen',price:400,planet:'alle',draw:(x,w,h)=>{const cs=['#D9A26D','#E2B07C','#CF9660','#E8BA88'];for(let j=0;j<4;j++){x.fillStyle=cs[j];x.fillRect(0,j*h/4,w,h/4);x.fillStyle='rgba(123,82,54,.4)';x.fillRect(0,j*h/4,w,3);const off=(j*97)%w;x.fillRect(off,j*h/4,3,h/4);x.fillRect((off+w/2)%w,j*h/4,3,h/4);
  x.fillStyle='rgba(123,82,54,.5)';circ(x,(off+10)%w,j*h/4+14,2.2);circ(x,(off+10)%w,j*h/4+h/4-12,2.2);x.strokeStyle='rgba(123,82,54,.14)';x.lineWidth=2;x.beginPath();x.moveTo(0,j*h/4+30);x.bezierCurveTo(w*.3,j*h/4+22,w*.6,j*h/4+40,w,j*h/4+30);x.stroke()}}});
floorpat('parkett',{n:'Parkett',price:700,planet:'alle',draw:(x,w,h)=>{const cs=['#C98C5A','#D69A62','#BF8150','#DDAA72'];grid(w,h,4,4,(px,py,i,j)=>{const s=w/4;for(let k=0;k<3;k++){x.fillStyle=cs[(i+j+k)%4];if((i+j)%2)x.fillRect(px+k*s/3,py,s/3,s);else x.fillRect(px,py+k*s/3,s,s/3);
  x.fillStyle='rgba(90,55,30,.35)';if((i+j)%2)x.fillRect(px+k*s/3,py,2,s);else x.fillRect(px,py+k*s/3,s,2)}})}});
floorpat('fliesen',{n:'Schachbrett-Fliesen',price:500,planet:'alle',draw:(x,w,h)=>{grid(w,h,4,4,(px,py,i,j)=>{x.fillStyle=(i+j)%2?PAL.blush:PAL.cream;x.fillRect(px,py,w/4,h/4);x.fillStyle='rgba(255,255,255,.5)';x.fillRect(px+6,py+6,14,4)});x.fillStyle='rgba(120,90,110,.25)';for(let i=0;i<4;i++){x.fillRect(i*w/4,0,2,h);x.fillRect(0,i*h/4,w,2)}}});
floorpat('moos',{n:'Moosboden',price:450,planet:'kompost',draw:(x,w,h)=>{x.fillStyle='#6DAE55';x.fillRect(0,0,w,h);const cs=['#86C667','#5B9A48','#A6D97E','#7CC46A'];scatter(w,h,110,2,(px,py,a,b,i)=>{x.fillStyle=cs[i%4];circ(x,px,py,5+a*9)});x.fillStyle=PAL.lemon;scatter(w,h,8,4,(px,py)=>circ(x,px,py,3));x.fillStyle=PAL.white;scatter(w,h,6,8,(px,py)=>circ(x,px,py,2.5))}});
floorpat('gras',{n:'Wiese',price:350,planet:'kompost',draw:(x,w,h)=>{x.fillStyle='#8FD36B';x.fillRect(0,0,w,h);scatter(w,h,70,6,(px,py,a,b,i)=>{x.strokeStyle=i%2?'#6FB84E':'#A9E283';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(px,py);x.lineTo(px-3,py-8-a*5);x.moveTo(px,py);x.lineTo(px+4,py-7-b*5);x.stroke()});
  scatter(w,h,5,13,(px,py,a)=>flowerAt(x,px,py,6,a>.5?PAL.white:PAL.lemon,a>.5?PAL.lemon:PAL.orange))}});
floorpat('teppich',{n:'Flauschteppich',price:600,planet:'alle',draw:(x,w,h)=>{x.fillStyle='#F4C6D2';x.fillRect(0,0,w,h);scatter(w,h,400,17,(px,py,a)=>{x.fillStyle=a>.5?'rgba(255,255,255,.28)':'rgba(200,110,140,.18)';circ(x,px,py,2+a*2)});x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;grid(w,h,2,2,(px,py)=>{x.beginPath();x.arc(px+w/4,py+h/4,40,0,TAU);x.stroke()})}});
floorpat('kopfstein',{n:'Kopfsteinpflaster',price:550,planet:'alle',draw:(x,w,h)=>{x.fillStyle='#9C95AE';x.fillRect(0,0,w,h);const cs=['#C9C2D6','#BDB6C8','#D3CCDF','#B2AAC0'];let k=0;for(let j=0;j<6;j++)for(let i=-1;i<6;i++){const cx=i*w/5+(j%2)*w/10+w/10,cy=j*h/6+h/12;x.fillStyle=cs[(k++*3)%4];x.beginPath();x.ellipse(cx,cy,w/10-4,h/12-4,0,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.ellipse(cx-6,cy-6,8,4,-.3,0,TAU);x.fill()}}});
floorpat('platine',{n:'Platinenboden',price:800,planet:'schrott',draw:(x,w,h)=>{x.fillStyle='#2F5E73';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.05)';grid(w,h,4,4,(px,py)=>x.fillRect(px+2,py+2,60,60));traces(x,w,h,'#7FDCE6','#FFB27A',8)}});
floorpat('riffelblech',{n:'Riffelblech',price:650,planet:'schrott',draw:(x,w,h)=>{x.fillStyle='#AEB9C8';x.fillRect(0,0,w,h);grid(w,h,8,8,(px,py,i,j)=>{const cx=px+16,cy=py+16;x.save();x.translate(cx,cy);x.rotate((i+j)%2?PI/4:-PI/4);x.fillStyle='#8D98AA';rr(x,-11,-3.5,22,7,3.5);x.fill();x.fillStyle='#D8DFE8';rr(x,-10,-3.5,20,3,1.5);x.fill();x.restore()})}});
floorpat('sand',{n:'Sandboden',price:300,planet:'korallen',draw:(x,w,h)=>{x.fillStyle=PAL.sand;x.fillRect(0,0,w,h);scatter(w,h,160,19,(px,py,a)=>{x.fillStyle=a>.5?'rgba(201,140,90,.28)':'rgba(255,255,255,.5)';circ(x,px,py,1.5+a*1.5)});scatter(w,h,3,23,(px,py,a)=>shellAt(x,px,py,8,a>.5?PAL.blush:PAL.peach))}});
floorpat('mosaik',{n:'Meeres-Mosaik',price:900,planet:'korallen',draw:(x,w,h)=>{x.fillStyle='#F4F1EA';x.fillRect(0,0,w,h);const cs=['#7FDCE6','#56C6B6','#8FD3FF','#6AA8F0','#A6EBC3'];const r=srand(31);
  grid(w,h,8,8,(px,py,i,j)=>{x.fillStyle=cs[Math.floor(r()*5)];rr(x,px+2,py+2,28,28,6);x.fill()});x.fillStyle=PAL.coral;wrap(w,h,(dx,dy)=>starAt(x,128+dx,128+dy,24,PAL.coral))}});
floorpat('terrakotta',{n:'Terrakotta-Kacheln',price:500,planet:'kompost',draw:(x,w,h)=>{x.fillStyle='#F3E2C8';x.fillRect(0,0,w,h);grid(w,h,4,4,(px,py,i,j)=>{x.fillStyle=(i+j)%2?'#D97B5E':'#E0876A';x.beginPath();const s=w/4,c=12;x.moveTo(px+c,py+3);x.lineTo(px+s-c,py+3);x.lineTo(px+s-3,py+c);x.lineTo(px+s-3,py+s-c);x.lineTo(px+s-c,py+s-3);x.lineTo(px+c,py+s-3);x.lineTo(px+3,py+s-c);x.lineTo(px+3,py+c);x.closePath();x.fill();
  x.fillStyle='rgba(255,255,255,.18)';x.fillRect(px+14,py+10,s-40,5)});x.fillStyle=PAL.teal;grid(w,h,4,4,(px,py)=>{x.save();x.translate(px,py);x.rotate(PI/4);x.fillRect(-8,-8,16,16);x.restore()})}});

/* kachelnde Textur einer Tapete/eines Bodens: surfTex('wall'|'floor', id, [rx, ry]) */
function surfTex(kind,id,rx,ry){const list=kind==='floor'?FLOORS:WALLPAPERS;const it=list.find(o=>o.id===id)||list[0];const base=ctex('fu-'+kind+'-'+it.id,256,256,it.draw);return rtex(base,rx||1,ry||rx||1)}
window.surfTex=surfTex;
/* ======================================================================
   GEBÄUDE · Welt-Einheiten (Cyborg ≈ 1.7 hoch), Boden y=0, Tür/Front zeigt nach +z.
   userData.door = [x,y,z] Standpunkt vor der Tür · userData.r = Kollisionsradius
   ====================================================================== */
const HOUSE_DEF={wall:{holz:'#E8B784',stein:'#D9D2E3',blech:'#B4CBE0',moos:'#96CF74',lehm:'#F2D1A8'},
  roof:{huette:'#E0876A',spitz:'#8E6BD1',rund:'#F0556E',pilz:'#FF7E6B',kuppel:'#56C6B6',turm:'#6AA8F0'},door:'#8A5A44'};
function wallTex(kind){return ctex('fu-wall-'+kind,128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);
  if(kind==='holz'){for(let j=0;j<4;j++){x.fillStyle=j%2?'#f6f6f6':'#ffffff';x.fillRect(0,j*32,w,32);x.fillStyle='rgba(90,55,30,.35)';x.fillRect(0,j*32+29,w,3);x.fillStyle='rgba(90,55,30,.12)';x.fillRect(0,j*32+14,w,2);x.fillStyle='rgba(90,55,30,.4)';x.beginPath();x.arc((j*53)%w+8,j*32+15,2,0,TAU);x.fill()}}
  else if(kind==='stein'){x.fillStyle='#c9c1b8';x.fillRect(0,0,w,h);const cs=['#ffffff','#f1f1f1','#e6e6e6'];let k=0;for(let j=0;j<4;j++)for(let i=-1;i<3;i++){x.fillStyle=cs[(k++*5)%3];rr(x,i*48+(j%2)*24+3,j*32+3,42,26,10);x.fill();x.fillStyle='rgba(255,255,255,.6)';x.fillRect(i*48+(j%2)*24+10,j*32+7,16,3)}}
  else if(kind==='blech'){for(let i=0;i<8;i++){const g2=x.createLinearGradient(i*16,0,i*16+16,0);g2.addColorStop(0,'#ffffff');g2.addColorStop(.5,'#e4e4e4');g2.addColorStop(1,'#ffffff');x.fillStyle=g2;x.fillRect(i*16,0,16,h)}x.fillStyle='rgba(60,60,90,.3)';x.fillRect(0,0,w,3);x.fillStyle='#fdfdfd';for(let i=0;i<4;i++){x.beginPath();x.arc(i*32+16,9,3.5,0,TAU);x.fill()}x.fillStyle='rgba(200,112,62,.25)';x.beginPath();x.arc(96,90,10,0,TAU);x.fill()}
  else if(kind==='moos'){const r=srand(3);for(let i=0;i<60;i++){x.fillStyle=['#e6f2e0','#ffffff','#d8ebd0','#f4fbef'][i%4];x.beginPath();const px=r()*w,py=r()*h,rad=5+r()*10;for(const dx of[-w,0,w])for(const dy of[-h,0,h]){x.moveTo(px+dx+rad,py+dy);x.arc(px+dx,py+dy,rad,0,TAU)}x.fill()}x.fillStyle='#FFF6C0';for(let i=0;i<6;i++){x.beginPath();x.arc(r()*w,r()*h,2.5,0,TAU);x.fill()}}
  else{const r=srand(9);x.fillStyle='#f3ede6';for(let i=0;i<8;i++){x.beginPath();x.ellipse(r()*w,r()*h,12+r()*14,8+r()*8,r()*3,0,TAU);x.fill()}x.strokeStyle='rgba(160,110,50,.35)';x.lineWidth=2;for(let i=0;i<24;i++){const px=r()*w,py=r()*h,a=r()*PI;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*9,py+Math.sin(a)*9);x.stroke()}}})}
const shingleTex=()=>ctex('fu-shingle',128,128,(x,w,h)=>{x.fillStyle='#e9e9e9';x.fillRect(0,0,w,h);for(let j=0;j<5;j++)for(let i=-1;i<5;i++){const cx=i*32+(j%2)*16+16,cy=j*32-6;x.fillStyle='rgba(0,0,0,.14)';x.beginPath();x.arc(cx,cy+3,17,0,PI);x.fill();x.fillStyle='#ffffff';x.beginPath();x.arc(cx,cy,16,0,PI);x.lineTo(cx-16,cy-16);x.lineTo(cx+16,cy-16);x.fill()}});
const q2=v=>Math.max(.05,Math.round(v*4)/4);
function wallMat(m,kind,col,rx,ry){rx=q2(rx);ry=q2(ry);return m.tex('hw|'+kind+'|'+col+'|'+rx+'|'+ry,rtex(wallTex(kind),rx,ry),{color:col})}
function roofMat(m,col,rx,ry){rx=q2(rx);ry=q2(ry);return m.tex('hr|'+col+'|'+rx+'|'+ry,rtex(shingleTex(),rx,ry),{color:col})}
const darker=(c,f)=>'#'+new THREE.Color(c).multiplyScalar(f||.8).getHexString();
const glassM=m=>m.gloss('#CDEBFF');
function houseWin(m,type,trim,acc,wood){const w=new THREE.Group();const tm=m.c(trim);
  if(type==='rund'){P(w,G.to(.33,.075),tm,[0,0,.02]);P(w,G.cy(.3,.3,.06),glassM(m),[0,0,0],[PI/2,0,0]);B(w,.05,.6,.04,0,tm,[0,0,.05]);B(w,.6,.05,.04,0,tm,[0,0,.05]);B(w,.06,.24,.01,0,m.c('#ffffff'),[-.13,.1,.035],[0,0,.6]);B(w,.5,.08,.2,.03,tm,[0,-.4,.06])}
  else if(type==='bullauge'){P(w,G.to(.3,.085),m.chrome(),[0,0,.03]);P(w,G.cy(.29,.29,.06),m.gloss('#A8E4F0'),[0,0,0],[PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*TAU;S(w,.028,m.steel(),[Math.cos(a)*.3,Math.sin(a)*.3,.11])}B(w,.06,.22,.01,0,m.c('#ffffff'),[-.1,.08,.035],[0,0,.6])}
  else{B(w,.74,.86,.14,.06,tm,[0,0,0]);B(w,.58,.7,.04,.02,glassM(m),[0,0,.06]);B(w,.05,.68,.04,0,tm,[0,0,.085]);B(w,.58,.05,.04,0,tm,[0,0,.085]);B(w,.07,.3,.01,0,m.c('#ffffff'),[-.15,.12,.083],[0,0,.6]);
    both(x=>{B(w,.24,.84,.06,.03,m.c(acc),[x*.5,0,.02]);S(w,.03,m.c(trim),[x*.5,0,.06])});B(w,.9,.08,.2,.03,tm,[0,-.47,.07]);
    B(w,.72,.16,.2,.05,wood,[0,-.59,.16]);[PAL.blush,PAL.lemon,PAL.white].forEach((c,i)=>S(w,.075,m.c(c),[(i-1)*.22,-.47,.18]));S(w,.1,m.c(PAL.leaf),[0,-.5,.16],[3,.6,.8])}
  return w}
function houseDoor(m,col,trim){const d=new THREE.Group();P(d,G.puff(archShape(1.02,1.78,.51),.1,.03),m.c(trim),[0,0,0]);P(d,G.puff(archShape(.8,1.62,.4),.08,.03),m.c(col),[0,0,.05]);
  both(x=>B(d,.02,1.05,.01,0,m.c(darker(col,.75)),[x*.14,.62,.1]));S(d,.055,m.gold(),[.27,.8,.12]);P(d,G.cy(.12,.12,.04),glassM(m),[0,1.28,.09],[PI/2,0,0]);P(d,G.to(.12,.025),m.c(trim),[0,1.28,.11]);return d}
function smokePuffs(g,m,x,y,z){const ps=range(3,(t,i)=>{const s=S(g,.14+i*.05,m.plush('#ffffff'),[x,y+.3+i*.35,z]);return s});return t=>ps.forEach((s,i)=>{const f=(t*.25+i/3)%1;s.position.set(x+Math.sin(f*4+i)*.12,y+.2+f*1.1,z);s.scale.setScalar(.4+f*.9)})}
function picketFence(g,m,Rf,col,gapW){const parts=[],n=Math.round(TAU*Rf/.34),ga=(gapW||1.3)/2/Rf;const pk=G.bx(.13,.62,.06,.03),tip=G.co(.065,.12,4);
  for(let i=0;i<n;i++){const t=i/n*TAU;const d=Math.atan2(Math.sin(t-PI/2),Math.cos(t-PI/2));if(Math.abs(d)<ga)continue;
    const ry=PI/2-t;parts.push([pk,[Math.cos(t)*Rf,.31,Math.sin(t)*Rf],[0,ry,0]]);parts.push([tip,[Math.cos(t)*Rf,.66,Math.sin(t)*Rf],[0,ry+PI/4,0]])}
  const cm=m.c(col||PAL.white);mergeInto(g,cm,parts);[.2,.46].forEach(y=>P(g,G.to(Rf,.03,TAU-2*ga),cm,[0,y,0],[PI/2,0,PI/2+ga]));
  both(x=>{const t=PI/2+x*ga;C(g,.07,.07,.8,cm,[Math.cos(t)*Rf,.4,Math.sin(t)*Rf]);S(g,.1,m.gloss(PAL.honey),[Math.cos(t)*Rf,.84,Math.sin(t)*Rf])})}
function flagOn(g,m,p,col){const f=grp(g,p);C(f,.03,.03,1.0,m.steel(),[0,.5,0]);S(f,.06,m.gold(),[0,1.02,0]);const fl=grp(f,[0,.92,0]);P(fl,G.puff(sshp([[0,0],[.6,-.14],[.02,-.34]]),.03,.012),m.c(col),[.02,0,0]);return t=>{fl.rotation.y=Math.sin(t*2.2)*.35;fl.scale.x=.9+Math.sin(t*3.1)*.1}}

function buildHouse(style,m){
  const st=Object.assign({shape:'huette',wall:'holz',win:'eckig',chimney:false,fence:false,size:1,flag:false},style||{});
  const shape=HOUSE_DEF.roof[st.shape]?st.shape:'huette',wk=HOUSE_DEF.wall[st.wall]?st.wall:'holz',wt=['rund','eckig','bullauge'].includes(st.win)?st.win:'eckig';
  const wallCol=st.wallCol||HOUSE_DEF.wall[wk],roofCol=st.roofCol||HOUSE_DEF.roof[shape],doorCol=st.doorCol||HOUSE_DEF.door;
  const sz=Math.max(1,Math.min(3,Math.round(+st.size||1))),k=Math.pow(1.25,sz-1);
  const g=new THREE.Group();const ticks=[];QF=QF||1;
  const W=3.2*k,H=2.15+(sz-1)*.35,trim=PAL.cream,stone=m.c(PAL.stone),wood=Wd(m,PAL.wood),acc=roofCol;
  const rDark=m.c(darker(roofCol,.78));
  let I={};/* round:bool, R, rAt(y), roofY(x,z), apex, spots, doorZ, r */
  if(shape==='huette'||shape==='spitz'){
    const bw=shape==='spitz'?W*.86:W,hw=bw/2,Hb=shape==='spitz'?H+.2:H;
    B(g,bw+.16,.3,bw+.16,.08,stone,[0,.15,0]);B(g,bw,Hb,bw,.1,wallMat(m,wk,wallCol,bw/1.3,Hb/1.3),[0,Hb/2,0]);
    if(wk==='lehm'){const bm=m.c(PAL.bark);for(const s of[-1,1]){B(g,.16,Hb,.16,.04,bm,[s*(hw-.02),Hb/2,hw-.02]);B(g,.16,Hb,.16,.04,bm,[s*(hw-.02),Hb/2,-hw+.02])}B(g,bw+.04,.14,bw+.04,.04,bm,[0,Hb-.07,0]);B(g,bw+.04,.12,bw+.04,.04,bm,[0,.36,0])}
    if(shape==='huette'){const p=.62,ov=.38,ridge=Hb+hw*Math.tan(p),L=(hw+ov)/Math.cos(p)+.08,D=bw+ov*1.4;
      both(s=>{const cx=s*(hw+ov)/2,cy=ridge-(hw+ov)/2*Math.tan(p);P(g,G.bx(L,.2,D,.07),roofMat(m,roofCol,D/.7,L/.55),[cx+s*Math.sin(p)*.1,cy+Math.cos(p)*.1,0],[0,0,-s*p])});
      both(s=>P(g,G.ex(shp([[-hw,0],[hw,0],[0,ridge-Hb]]),.12),wallMat(m,wk,wallCol,1/1.3,1/1.3),[0,Hb,s>0?hw-.12:-hw]));
      P(g,G.cy(.13,.13,D+.06),rDark,[0,ridge+.16,0],[PI/2,0,0]);
      I.roofY=(x,z)=>ridge+.2-Math.abs(x)*Math.tan(p);I.apex=[0,ridge+.25,D/2-.15];
      I.spots=[[0,-hw*.58,1.2],[0,hw*.58,1.2],[0,0,Hb+.5,'rund',.62]];if(sz>=2)I.spots.push([PI/2,0,1.2],[-PI/2,0,1.2]);if(sz>=3)I.spots.push([PI/2,hw*.5,1.2],[-PI/2,-hw*.5,1.2]);
    }else{const hb=hw+.38,R0=hb*Math.SQRT2,rh=2.0*Math.sqrt(k);
      let geo=new THREE.LatheGeometry([[0,0],[R0,0],[R0*.84,rh*.13],[R0*.5,rh*.45],[R0*.2,rh*.8],[.03,rh]].map(v=>new THREE.Vector2(v[0],v[1])),4,PI/4);geo=geo.toNonIndexed();geo.computeVertexNormals();
      P(g,geo,roofMat(m,roofCol,4*2*hb/.7,rh/.5),[0,Hb-.02,0]);S(g,.14,m.gold(),[0,Hb+rh+.05,0]);
      I.roofY=(x,z)=>{const f=Math.max(Math.abs(x),Math.abs(z))/hb;return Hb+rh*(1-f)*.75};I.apex=[0,Hb+rh+.1,0];
      I.spots=[[0,-hw*.56,1.2],[0,hw*.56,1.2]];if(sz>=2)I.spots.push([PI/2,0,1.2],[-PI/2,0,1.2]);if(sz>=3)I.spots.push([0,0,Hb+.62,'rund',.6])}
    I.box=true;I.hw=hw;I.doorZ=hw;I.r=hw*1.25;
  }else if(shape==='rund'||shape==='turm'){
    const R=shape==='turm'?W/2*.64:W/2*.92,Hb=shape==='turm'?H*1.75:H;
    C(g,R+.1,R+.12,.3,stone,[0,.15,0]);P(g,G.cy(R,R,Hb),wallMat(m,wk,wallCol,TAU*R/1.3,Hb/1.3),[0,Hb/2,0]);
    if(wk==='lehm'||wk==='holz')P(g,G.to(R+.02,.06),m.c(PAL.bark),[0,Hb-.1,0],[PI/2,0,0]);
    const Rr=R+.42,rh=(shape==='turm'?2.3:1.55)*Math.sqrt(k);
    const prof=shape==='turm'?[[0,-.05],[Rr,-.08],[Rr*.84,.12],[Rr*.5,rh*.4],[Rr*.2,rh*.78],[.03,rh]]:[[0,-.05],[Rr,-.1],[Rr*.88,.1],[Rr*.5,rh*.52],[.05,rh]];
    P(g,G.la(prof),roofMat(m,roofCol,TAU*Rr/.75,rh*1.2/.5),[0,Hb,0]);P(g,G.to(Rr*.96,.08),rDark,[0,Hb-.06,0],[PI/2,0,0]);S(g,.13,m.gold(),[0,Hb+rh+.04,0]);
    I.roofY=(x,z)=>Hb+rh*(1-Math.hypot(x,z)/Rr)*.85;I.apex=[0,Hb+rh+.1,0];I.R=R;I.rAt=()=>R;
    if(shape==='turm'){const by=H*.95;C(g,R+.4,R+.4,.14,m.c(trim),[0,by,0]);const cm=m.c('#F7F0EA'),n=16,parts=[];for(let i=0;i<n;i++){const a=i/n*TAU;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.35)continue;parts.push([G.cy(.03,.03,.4),[Math.sin(a)*(R+.33),by+.27,Math.cos(a)*(R+.33)]])}mergeInto(g,cm,parts);P(g,G.to(R+.33,.035,TAU-.7),cm,[0,by+.47,0],[PI/2,0,PI/2+.35]);
      I.spots=[[0,0,by+1.05],[PI/2,0,1.2],[-PI/2,0,1.2],[0,0,Hb-.75,'rund',.6]];if(sz>=2)I.spots.push([PI/2,0,by+1.05],[-PI/2,0,by+1.05]);if(sz>=3)I.spots.push([PI*.75,0,1.2],[-PI*.75,0,1.2]);I.r=R+.45}
    else{I.spots=[[0,-1.25,1.2],[0,1.25,1.2]];if(sz>=2)I.spots.push([PI/2,0,1.2],[-PI/2,0,1.2]);if(sz>=3)I.spots.push([PI*.72,0,1.2],[-PI*.72,0,1.2]);I.r=R+.15}
    I.doorZ=R;
  }else if(shape==='pilz'){
    const R0=W/2*.8;const prof=[[0,0],[R0*1.05,0],[R0*1.08,H*.3],[R0*1.02,H*.7],[R0*.92,H+.1],[0,H+.1]];
    P(g,G.la(prof),wallMat(m,wk,wallCol,TAU*R0/1.3,H/1.3),[0,0,0]);C(g,R0*1.08+.08,R0*1.1+.1,.26,stone,[0,.13,0]);
    const cR=W/2*1.22,sy=.72,cy=H-.05;P(g,G.hs(cR),m.gloss(roofCol),[0,cy,0],null,[1,sy,1]);P(g,G.cy(cR*.99,cR*.9,.14),m.c(PAL.cream),[0,cy-.06,0]);P(g,G.to(cR*.97,.1),m.gloss(roofCol),[0,cy,0],[PI/2,0,0]);
    capDots(g,m,cy,cR,sy,9,PAL.white,srand(12),.3);
    I.rAt=y=>{for(let i=1;i<prof.length;i++){if(y<=prof[i][1]){const a=prof[i-1],b=prof[i];return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1])}}return R0};
    I.roofY=(x,z)=>cy+cR*sy*Math.sqrt(Math.max(0,1-(Math.hypot(x,z)/cR)**2));I.apex=[0,cy+cR*sy,0];
    I.spots=[[0,-1.2,1.25],[0,1.2,1.25]];if(sz>=2)I.spots.push([PI/2,0,1.25],[-PI/2,0,1.25]);if(sz>=3)I.spots.push([PI*.72,0,1.25],[-PI*.72,0,1.25]);I.doorZ=I.rAt(.8);I.r=R0+.25;
  }else{/* kuppel */
    const R=W/2*.95,Hd=R*1.32;P(g,G.hs(R),wallMat(m,wk,wallCol,TAU*R/1.3,Hd/1.3),[0,0,0],null,[1,1.32,1]);C(g,R+.08,R+.1,.26,stone,[0,.13,0]);
    const cap=new THREE.SphereGeometry(R*1.025,Q(28),Q(8),0,TAU,0,.62);P(g,cap,m.gloss(roofCol),[0,0,0],null,[1,1.32,1]);
    P(g,G.to(R*1.025*Math.sin(.62),.07),rDark,[0,Hd*Math.cos(.62)*1.0,0],[PI/2,0,0]);P(g,G.hs(.36),m.glass('#dff6ff'),[0,Hd-.04,0]);P(g,G.to(.36,.05),m.c(trim),[0,Hd-.03,0],[PI/2,0,0]);
    const vz=R-.05;P(g,G.puff(archShape(1.4,2.05,.7),1.1,.04),wallMat(m,wk,wallCol,1/1.3,1/1.3),[0,0,vz]);P(g,G.to(.74,.1,PI),m.gloss(roofCol),[0,1.33,vz+.56]);
    I.rAt=y=>R*Math.sqrt(Math.max(0,1-(y/Hd)**2));I.tilt=true;I.roofY=(x,z)=>Hd*Math.sqrt(Math.max(0,1-(Math.hypot(x,z)/R)**2));I.apex=[0,Hd+.3,0];
    I.spots=[[.95,0,.95],[-.95,0,.95]];if(sz>=2)I.spots.push([PI/2+.3,0,.95],[-PI/2-.3,0,.95]);if(sz>=3)I.spots.push([.55,0,1.75,'rund',.55],[-.55,0,1.75,'rund',.55]);I.doorZ=vz+.6;I.r=R+.1}
  /* Fenster */
  for(const sp of I.spots){const [a,off,y,t2,sc]=sp;const w=houseWin(m,t2||wt,trim,acc,wood);if(sc)w.scale.setScalar(sc);g.add(w);
    if(I.box){const n=[Math.sin(a),Math.cos(a)],tg=[Math.cos(a),-Math.sin(a)];w.position.set(n[0]*I.hw+tg[0]*off,y,n[1]*I.hw+tg[1]*off);w.rotation.y=a}
    else{const r=I.rAt(y),aa=a+off/Math.max(.5,r);let tilt=0;if(I.tilt){tilt=Math.atan2(I.rAt(y+.05)-I.rAt(y-.05),.1)*.9}const inset=I.tilt?.04:.0;
      w.position.set(Math.sin(aa)*(r-inset),y,Math.cos(aa)*(r-inset));w.rotation.set(tilt,aa,0,'YXZ')}}
  /* Tür + Vordach + Stufe */
  const dz=I.doorZ;const d=houseDoor(m,doorCol,trim);d.position.set(0,0,dz-.02);g.add(d);
  B(g,1.3,.14,.6,.05,stone,[0,.07,dz+.32]);B(g,.8,.03,.4,.015,m.c(PAL.coral),[0,.155,dz+.34]);
  if(shape!=='kuppel'){B(g,1.4,.1,.62,.04,m.c(roofCol),[0,2.02,dz+.26],[.3,0,0]);both(x=>bt(g,[x*.55,1.7,dz+.02],[x*.55,1.95,dz+.4],.035,wood))}
  both(x=>{const b=grp(g,[x*1.0,0,dz+.3]);P(b,G.blob(.26,.08,4,3+x),m.c(PAL.leaf),[0,.2,0],null,[1,.85,1]);S(b,.05,m.c(x<0?PAL.blush:PAL.lemon),[.1,.36,.15]);S(b,.045,m.c(PAL.white),[-.1,.3,.18])});
  /* Schornstein */
  if(st.chimney){const cx=I.box?I.hw*.5:(shape==='turm'?I.R*.45:shape==='pilz'?W/2*.55:shape==='kuppel'?W/2*.4:I.R*.5),cz=-.25;const yb=I.roofY(cx,cz),yt=Math.max(yb+.75,I.roofY(0,0)*.9+.2);
    if(wk==='blech'){C(g,.13,.13,yt-yb+.4,m.steel(),[cx,(yb+yt)/2-.2,cz]);P(g,G.co(.26,.2),m.c(PAL.slate),[cx,yt+.15,cz]);C(g,.03,.03,.1,m.steel(),[cx,yt+.02,cz])}
    else{B(g,.5,yt-yb+.5,.5,.06,m.tex('brick',rtex(wallTex('stein'),1,2),{color:'#E89A7C'}),[cx,(yb+yt)/2-.25,cz]);B(g,.62,.14,.62,.05,m.c(PAL.stone),[cx,yt,cz])}
    ticks.push(smokePuffs(g,m,cx,yt,cz))}
  /* Zaun & Weg */
  if(st.fence){const Rf=Math.max(W*.8,dz+1.35);picketFence(g,m,Rf,st.fenceCol||'#F7F0EA',1.4);g.userData.fenceR=Rf;
    for(let i=0;i<3;i++){const z=dz+.8+i*(Rf-dz-.6)/3;P(g,G.cy(.26,.28,.06),stone,[(i%2-.5)*.18,.03,z],null,[1.2,1,1])}}
  /* Anbauten (Sternwarte, Gewächshaus, Labor) neben dem Haus */
  if(st.addons&&st.addons.length&&typeof ADDONS!=='undefined')try{ADDONS.attach(g,m,st,I.r)}catch(e){console.warn('Anbau',e)}
  if(st.flag)ticks.push(flagOn(g,m,I.apex,st.flagCol||(doorCol===HOUSE_DEF.door?PAL.lemon:doorCol)));
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  g.userData.door=[0,0,dz+.95];g.userData.r=I.r;g.userData.style=Object.assign({},st,{shape,wall:wk,win:wt,wallCol,roofCol,doorCol,size:sz});g.userData.kind='house';
  if(ticks.length)g.userData.tick=t=>ticks.forEach(f=>f(t));
  return g}
window.buildHouse=buildHouse;window.HOUSEKIT={wallMat,houseDoor,houseWin,Wd,darker};
/* ---------- Gebäude-Helfer ---------- */
function gableRoof(g,m,bw,bd,Hb,col,p,ov){const hw=bw/2,ridge=Hb+hw*Math.tan(p),L=(hw+ov)/Math.cos(p)+.08,D=bd+ov*1.4;
  both(s=>{const cx=s*(hw+ov)/2,cy=ridge-(hw+ov)/2*Math.tan(p);P(g,G.bx(L,.2,D,.07),roofMat(m,col,D/.7,L/.55),[cx+s*Math.sin(p)*.1,cy+Math.cos(p)*.1,0],[0,0,-s*p])});
  P(g,G.cy(.13,.13,D+.06),m.c(darker(col,.78)),[0,ridge+.16,0],[PI/2,0,0]);return ridge}
function gableFill(g,m,mat,bw,bd,Hb,p){const hw=bw/2,ridge=Hb+hw*Math.tan(p);both(s=>P(g,G.ex(shp([[-hw,0],[hw,0],[0,ridge-Hb]]),.12),mat,[0,Hb,s>0?bd/2-.12:-bd/2]))}
function signBoard(g,m,key,text,w,h,p,o){o=o||{};const s=grp(g,p,o.rot);B(s,w,h,.12,Math.min(.08,h*.3),o.board||Wd(m,PAL.wood),[0,0,0]);
  decal(s,m,o.tex||signTex(key,text,{bg:o.bg||PAL.cream,fg:o.fg||PAL.ink,bd:o.bd,w:o.tw||512,h:Math.round((o.tw||512)*h/w),glow:o.glow,border:o.border}),'sg-'+key,w-.14,h-.12,[0,0,.065],null,o.lit);return s}
function awning(g,m,w,d,y,z,a,b,n){const t=stripeTex('aw'+a+b,a,b,n||8,true);const mt=m.tex('aw'+a+b,rtex(t,1,1));const aw=grp(g,[0,y,z],[.42,0,0]);B(aw,w,.06,d,.03,mt,[0,0,d/2]);
  const k=Math.round(w/.3);for(let i=0;i<k;i++){const x=-w/2+(i+.5)*w/k;P(aw,G.cy(w/k/2,w/k/2,.05),m.c(i%2?a:b),[x,-.02,d],[PI/2,0,0],[1,1,1]).rotation.set(0,0,0)}
  for(let i=0;i<k;i++){const x=-w/2+(i+.5)*w/k;P(aw,G.hs(w/k/2),m.c(i%2?b:a),[x,-.03,d],[PI,0,0],[1,.25,.7])}return aw}
function crate(g,m,p,fruit,rnd){const c=grp(g,p);B(c,.6,.34,.44,.04,Wd(m,PAL.oak),[0,.17,0]);B(c,.62,.06,.46,.02,Wd(m,PAL.wood),[0,.25,0]);for(let i=0;i<5;i++)S(c,.09,m.gloss(fruit),[-.2+i*.1+(rnd()-.5)*.03,.38+(i%2)*.04,(rnd()-.5)*.2]);return c}
function winAt(g,m,type,p,ry,trim,acc){const w=houseWin(m,type,trim||PAL.cream,acc||PAL.coral,Wd(m,PAL.wood));w.position.set(...p);w.rotation.y=ry||0;g.add(w);return w}
function doorAt(g,m,col,p,trim){const d=houseDoor(m,col,trim||PAL.cream);d.position.set(...p);g.add(d);B(g,1.3,.14,.6,.05,m.c(PAL.stone),[p[0],.07,p[2]+.34]);return d}
function finish(g,door,r,kind,ticks){g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});g.userData.door=door;g.userData.r=r;g.userData.kind=kind;if(ticks&&ticks.length)g.userData.tick=t=>ticks.forEach(f=>f(t));return g}

/* ---------- Läden ---------- */
function buildShop(planet,m){const g=new THREE.Group();const rnd=srand(21);const ticks=[];
  if(planet==='schrott'){/* Ersatzteil-Basar: Blechhütte mit Neon & Zahnrädern */
    const bw=4.6,bd=3.6,Hb=2.7;B(g,bw+.2,.28,bd+.2,.06,m.c(PAL.slate),[0,.14,0]);
    B(g,bw,Hb,bd,.12,wallMat(m,'blech','#B8D4E6',bw/1.2,Hb/1.2),[0,Hb/2,0]);
    P(g,G.bx(bw+.7,.22,bd+.7,.08),wallMat(m,'blech','#F7B84B',bw/1.2,1),[0,Hb+.25,.1],[.1,0,0]);
    [[-1.3,.6],[1.1,-.8]].forEach(([x,z],i)=>B(g,.8,.05,.6,.02,m.c(i?PAL.coral:PAL.mint),[x,Hb+.4,z],[.1,0,.05*(i?1:-1)]));
    doorAt(g,m,'#56C6B6',[1.1,0,bd/2]);
    B(g,1.9,1.2,.16,.08,m.c(PAL.steel),[-.9,1.3,bd/2+.02]);B(g,1.7,1.0,.06,.04,glassM(m),[-.9,1.3,bd/2+.08]);B(g,2.1,.14,.5,.04,m.c(PAL.honey),[-.9,.66,bd/2+.2]);
    [[-1.5,PAL.coral],[-1.05,PAL.lemon],[-.55,PAL.mint]].forEach(([x,c],i)=>{if(i===1){S(g,.14,m.gloss(c),[x,.86,bd/2+.2]);S(g,.05,m.glow('#FFE27A',2),[x,1.0,bd/2+.2])}else B(g,.26,.24,.26,.06,m.gloss(c),[x,.85,bd/2+.2])});
    const ns=grp(g,[0,Hb+1.05,.4]);both(x=>bt(ns,[x*1.6,-.7,0],[x*1.6,.1,0],.05,m.steel()));B(ns,3.6,.9,.14,.1,m.c(PAL.plum),[0,.35,0]);
    decal(ns,m,signTex('basar','Ersatzteil-Basar',{bg:'#6E4A7E',fg:'#FFF1A8',bd:'#FF8FB8',glow:'#FF6FB0',w:768,h:192}),'basar',3.4,.78,[0,.35,.075],null,true);
    const gs=[];[[bw/2+.02,1.6,.5,.62,PAL.orange],[bw/2+.02,.9,-.6,.42,PAL.teal],[-bw/2-.02,1.5,0,.55,PAL.coral]].forEach(([x,y,z,R,c],i)=>{const gg=grp(g,[x,y,z],[0,x>0?PI/2:-PI/2,0]);P(gg,G.puff(gearShape(R,10,R*.2),.1,.03),i===0?m.copper():m.gloss(c));C(gg,R*.3,R*.3,.16,m.steel(),[0,0,0],[PI/2,0,0]);gs.push(gg)});
    ticks.push(t=>gs.forEach((q,i)=>q.children[0].rotation.z=t*(i%2?-.5:.4)));
    const tr=grp(g,[-bw/2-.2,0,bd/2+.1]);for(let i=0;i<3;i++)P(tr,G.to(.34,.15),m.rubber(),[0,.16+i*.3,0],[PI/2,0,0]);C(tr,.2,.2,.9,m.c(PAL.steel),[0,.45,0]);
    const dish=grp(g,[1.4,Hb+.35,-.9],[-.7,.5,0]);P(dish,G.la([[0,0],[.3,.02],[.55,.12],[.6,.16],[.3,.08],[0,.05]]),m.white());bt(dish,[0,0,0],[0,.5,0],.03,m.steel());S(dish,.07,m.glow(PAL.coral,2),[0,.52,0]);
    C(g,.14,.14,1.2,m.steel(),[-1.4,Hb+.8,-.8]);P(g,G.co(.26,.2),m.c(PAL.slate),[-1.4,Hb+1.5,-.8]);
    winAt(g,m,'bullauge',[bw/2,1.4,-1.1],PI/2);winAt(g,m,'bullauge',[-bw/2,1.5,1.1],-PI/2);
    tu(g,[[-1.9,Hb+.2,bd/2+.1],[-1.0,Hb-.15,bd/2+.12],[0,Hb+.1,bd/2+.1],[1.0,Hb-.2,bd/2+.12],[1.9,Hb+.2,bd/2+.1]],.03,m.rubber());
    [[-1.5,PAL.strawberry],[-.5,PAL.lemon],[.5,PAL.mint],[1.5,PAL.sky]].forEach(([x,c],i)=>S(g,.08,m.glow(c,2),[x,Hb-.12+(i%2?-.12:.04),bd/2+.14]));
    finish(g,[1.1,0,bd/2+.95],2.9,'shop',ticks);g.userData.name='Ersatzteil-Basar';return g}
  if(planet==='korallen'){/* Muschel-Laden: Strandhütte mit Muscheln */
    const bw=4.2,bd=3.4,Hb=2.5,y0=.45;
    for(const x of[-1,1])for(const z of[-1,1])C(g,.12,.14,y0+.1,Wd(m,PAL.wood),[x*(bw/2-.2),y0/2,z*(bd/2-.2)]);
    B(g,bw+.5,.14,bd+.9,.05,Wd(m,'#D9CBB4'),[0,y0,.2]);
    B(g,bw,Hb,bd,.1,wallMat(m,'holz','#8FD3FF',bw/1.3,Hb/1.3),[0,y0+Hb/2,0]);
    const hr=grp(g,[0,y0+Hb-.05,0]);const R0=(bw/2+.55)*Math.SQRT2;let geo=new THREE.LatheGeometry([[0,0],[R0,0],[R0*.8,.35],[R0*.35,1.3],[.04,1.7]].map(v=>new THREE.Vector2(v[0],v[1])),4,PI/4);geo=geo.toNonIndexed();geo.computeVertexNormals();
    P(hr,geo,m.tex('stroh',rtex(ctex('fu-stroh',64,64,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='rgba(150,100,40,.3)';x.lineWidth=2;for(let i=0;i<16;i++){x.beginPath();x.moveTo(i*4,0);x.lineTo(i*4+2,h);x.stroke()}}),10,2),{color:PAL.honey}),[0,0,0],null,[1,1,(bd/2+.55)/(bw/2+.55)]);
    for(let i=0;i<14;i++){const x=-bw/2-.4+i*(bw+.8)/13;P(hr,G.co(.1,.28),m.c(PAL.honey),[x,-.1,bd/2+.5],[PI,0,0])}
    S(hr,.14,m.pearl(),[0,1.72,0]);
    doorAt(g,m,PAL.coral,[-.9,y0,bd/2],PAL.white);B(g,1.3,.14,.5,.05,Wd(m,'#D9CBB4'),[-.9,.25,bd/2+.95]);
    const sh=grp(g,[.9,y0+1.35,bd/2+.08]);P(sh,G.puff(scallop(.9,7,.22),.18,.06),m.gloss(PAL.blush),[0,-.5,0]);shellRibs(sh,m.gloss(PAL.pink),.9,7,.12,-.5,1);S(sh,.14,m.pearl(),[0,-.3,.2]);
    signBoard(g,m,'muschel','Muschel-Laden',2.6,.62,[0,y0+Hb+.25,bd/2+.62],{board:m.c('#D9CBB4'),fg:PAL.navy,bd:PAL.teal,rot:[.12,0,0]});
    for(let i=0;i<5;i++){const x=-1.8+i*.9;if(Math.abs(x+.9)<.6)continue;const y=y0+Hb-.1;bt(g,[x,y,bd/2+.4],[x,y-.4-(i%2)*.2,bd/2+.4],.01,m.c(PAL.sand));P(g,G.puff(scallop(.1,4,.04),.03,.01),m.gloss([PAL.peach,PAL.lilac,PAL.aqua][i%3]),[x,y-.55-(i%2)*.2,bd/2+.4])}
    const sb=grp(g,[bw/2+.35,0,.6],[0,0,-.18]);P(sb,G.puff(sshp([[0,0],[.22,.3],[.26,1.0],[.18,1.6],[0,2.0],[-.18,1.6],[-.26,1.0],[-.22,.3]]),.06,.025),m.tex('surf',rtex(surfTexF(),1,1),{gloss:1}),[0,0,0],[0,PI/2,0]);
    const lb=grp(g,[-bw/2-.02,y0+1.5,.3],[0,-PI/2,0]);for(let i=0;i<8;i++)P(lb,G.to(.3,.1,TAU/8+.01),m.gloss(i%2?PAL.white:PAL.strawberry),[0,0,.1],[0,0,i/8*TAU]);
    starfish(g,m,[1.9,y0+2.1,bd/2+.08],.18,PAL.orange,[0,0,.2]);
    winAt(g,m,'rund',[bw/2,y0+1.4,-.6],PI/2,PAL.white,PAL.teal);
    const bx=grp(g,[1.6,y0,bd/2+.5]);B(bx,.7,.5,.4,.05,Wd(m,'#D9CBB4'),[0,.25,0]);[PAL.blush,PAL.peach,PAL.lilac].forEach((c,i)=>P(bx,G.puff(scallop(.1,4,.04),.03,.01),m.gloss(c),[-.2+i*.2,.55,0],[-.5,0,0]));
    finish(g,[-.9,0,bd/2+1.7],2.8,'shop',ticks);g.userData.name='Muschel-Laden';return g}
  /* Kompost-Kiosk: Holz-Gemischtwarenladen mit Markise */
  const bw=4.6,bd=3.4,Hb=2.4,p=.55;B(g,bw+.2,.28,bd+.2,.06,m.c(PAL.stone),[0,.14,0]);
  B(g,bw,Hb,bd,.1,wallMat(m,'holz','#E8B784',bw/1.3,Hb/1.3),[0,Hb/2,0]);gableFill(g,m,wallMat(m,'holz','#E8B784',1/1.3,1/1.3),bw,bd,Hb,p);
  const ridge=gableRoof(g,m,bw,bd,Hb,PAL.moss,p,.35);
  doorAt(g,m,PAL.teal,[1.35,0,bd/2]);
  B(g,2.2,1.1,.14,.06,m.c(PAL.cream),[-.8,1.45,bd/2+.02]);B(g,2.0,.9,.05,.03,glassM(m),[-.8,1.45,bd/2+.08]);B(g,.06,.9,.04,0,m.c(PAL.cream),[-.8,1.45,bd/2+.1]);
  B(g,2.4,.9,.5,.06,Wd(m,PAL.wood),[-.8,.45,bd/2+.28]);B(g,2.5,.08,.6,.03,Wd(m,PAL.oak),[-.8,.92,bd/2+.3]);
  awning(g,m,2.8,.9,2.2,bd/2+.05,PAL.mint,PAL.cream,10).position.x=-.8;
  signBoard(g,m,'kiosk','Kompost-Kiosk',2.6,.6,[0,Hb+.62,bd/2+.3],{bg:PAL.butter,fg:PAL.forest,bd:PAL.moss});
  crate(g,m,[-1.55,.95,bd/2+.3],PAL.strawberry,rnd).scale.setScalar(.8);crate(g,m,[-.8,.95,bd/2+.3],PAL.leaf,rnd).scale.setScalar(.8);crate(g,m,[-.05,.95,bd/2+.3],PAL.orange,rnd).scale.setScalar(.8);
  crate(g,m,[-2.0,0,bd/2+.9],PAL.lemon,rnd);crate(g,m,[-.3,0,bd/2+1.0],PAL.cherry,rnd).rotation.y=.3;
  const br=grp(g,[2.55,0,bd/2+.3]);P(br,G.la([[0,0],[.3,0],[.36,.3],[.3,.62],[0,.62]]),Wd(m,PAL.wood));both(y=>P(br,G.to(.34,.03),m.steel(),[0,.3+y*.2,0],[PI/2,0,0]));bush(br,m,[0,.62,0],.6,PAL.leaf,6,rnd,.4);
  pot(g,m,[.4,0,bd/2+.5],.22,.4,PAL.terracotta);flower(g,m,[.35,.38,bd/2+.5],PAL.blush,1.5,-.1);flower(g,m,[.47,.38,bd/2+.52],PAL.lemon,1.3,.2);
  winAt(g,m,'eckig',[bw/2,1.3,0],PI/2,PAL.cream,PAL.moss);winAt(g,m,'eckig',[-bw/2,1.3,0],-PI/2,PAL.cream,PAL.moss);
  const kc=grp(g,[1.2,Hb-.02,-.6]);B(kc,.5,1.1,.5,.06,m.tex('brick',rtex(wallTex('stein'),1,2),{color:'#E89A7C'}),[0,ridge-Hb-.1,0]);ticks.push(smokePuffs(g,m,1.2,ridge+.1,-.6));
  return finish(g,[1.35,0,bd/2+.95],2.9,'shop',ticks),g.userData.name='Kompost-Kiosk',g}

/* ---------- Nationalmuseum ---------- */
function buildMuseum(m){const g=new THREE.Group();const ticks=[];const st=m.c('#F4EEE4'),st2=m.c('#E6DDD0'),rf=PAL.teal;
  for(let i=0;i<3;i++)B(g,8.2-i*.25,.2,6.2-i*.2+(2-i)*.5,.06,i%2?st2:st,[0,.1+i*.2,.25+(2-i)*.25]);
  const y0=.6,bw=7,bd=4.4,Hb=3.3;B(g,bw,Hb,bd,.12,wallMat(m,'stein','#F6F0E6',bw/1.4,Hb/1.4),[0,y0+Hb/2,-.4]);
  B(g,bw+.3,.3,bd+.3,.08,st2,[0,y0+Hb+.1,-.4]);
  const pw=6.4,pz=bd/2-.4+1.1;for(let i=0;i<6;i++){const x=-pw/2+i*pw/5;const c=grp(g,[x,y0,pz]);B(c,.6,.2,.6,.05,st2,[0,.1,0]);P(c,G.la([[0,0],[.25,0],[.22,2.6],[0,2.6]]),st,[0,.2,0]);for(let k=0;k<4;k++)B(c,.03,2.5,.03,0,st2,[Math.cos(k*PI/2+PI/4)*.23,1.45,Math.sin(k*PI/2+PI/4)*.23]);B(c,.62,.22,.62,.06,st2,[0,2.9,0]);P(c,G.to(.2,.06),st2,[0,2.78,0],[PI/2,0,0])}
  const ey=y0+3.0;B(g,pw+.9,.5,1.6,.08,st,[0,ey+.25,pz-.4]);
  decal(g,m,signTex('museum','NATIONALMUSEUM',{bg:'#F4EEE4',fg:'#4B5E9C',border:false,w:1024,h:96}),'museum',pw,.4,[0,ey+.25,pz+.41]);
  const hw=(pw+.9)/2;P(g,G.ex(shp([[-hw,0],[hw,0],[0,1.35]]),1.6,.04),st,[0,ey+.5,pz-1.2]);
  P(g,G.ex(shp([[-hw+.45,.12],[hw-.45,.12],[0,1.08]]),.06),m.c(rf),[0,ey+.5,pz+.42]);
  P(g,G.puff(flowerShape(.26,6),.08),m.gold(),[0,ey+.9,pz+.5]);
  both(s=>{const L=(hw+.2)/Math.cos(.39)+.1;P(g,G.bx(L,.14,1.8,.05),m.c(rf),[s*(hw)/2,ey+.5+.68+.08,pz-.4],[0,0,-s*.39])});
  const dy=y0+Hb+.25;C(g,1.55,1.6,.5,st,[0,dy+.25,-.4]);for(let i=0;i<10;i++){const a=i/10*TAU;P(g,G.puff(archShape(.2,.3,.1),.04,.01),m.c(PAL.navy),[Math.sin(a)*1.58,dy+.1,-.4+Math.cos(a)*1.58],[0,a,0])}
  P(g,G.hs(1.5),m.gloss(rf),[0,dy+.5,-.4],null,[1,.9,1]);for(let i=0;i<8;i++){const a=i/8*TAU;const rb=P(g,G.to(1.5,.04,PI/2),m.c(darker(rf,.8)),[0,dy+.5,-.4],[0,a,0],[1,.9,1]);rb.rotation.set(0,a,0);rb.rotateX(0);rb.rotation.z=0;rb.rotateY(0)}
  C(g,.3,.35,.35,m.c(PAL.cream),[0,dy+1.85,-.4]);S(g,.18,m.gold(),[0,dy+2.12,-.4]);ticks.push(flagOn(g,m,[0,dy+2.2,-.4],PAL.strawberry));
  const dz=bd/2-.4;const dd=grp(g,[0,y0,dz]);P(dd,G.puff(archShape(2.1,2.6,1.05),.1,.03),m.c(PAL.cream),[0,0,0]);both(x=>{P(dd,G.puff(archShape(.9,2.4,.45),.08,.03),m.c(PAL.navy),[x*.47,0,.05]);S(dd,.07,m.gold(),[x*.12,1.2,.14])});
  const bn=['Fische','Fossilien'];both(x=>{const b=grp(g,[x*2.56,y0+1.0,pz+.35]);bt(b,[-.5,1.45,0],[.5,1.45,0],.035,m.gold());
    const tx=ctex('fu-banner-'+(x<0?0:1),128,256,(c,w,h)=>{c.fillStyle=x<0?'#F0556E':'#6AA8F0';c.fillRect(0,0,w,h);c.fillStyle='#FFF1A8';c.fillRect(0,8,w,6);c.fillRect(0,h-40,w,6);c.fillStyle='#FFFDF7';
      if(x<0){c.beginPath();c.ellipse(64,100,34,22,0,0,TAU);c.fill();c.beginPath();c.moveTo(94,100);c.lineTo(122,80);c.lineTo(122,120);c.fill();c.fillStyle='#3B3450';c.beginPath();c.arc(50,94,5,0,TAU);c.fill()}
      else{c.lineWidth=9;c.strokeStyle='#FFFDF7';c.lineCap='round';c.beginPath();c.moveTo(30,140);c.quadraticCurveTo(64,40,100,80);c.stroke();for(let k=0;k<5;k++){c.beginPath();c.moveTo(40+k*14,120-k*14);c.lineTo(28+k*14,106-k*14);c.stroke()}c.beginPath();c.arc(102,78,10,0,TAU);c.fill()}
      c.fillStyle='#FFFDF7';c.font=`bold 22px ${FONT}`;c.textAlign='center';c.fillText(bn[x<0?0:1],64,200)});
    P(b,G.puff(shp([[-.38,1.42],[.38,1.42],[.38,-.1],[0,.08],[-.38,-.1]]),.03,.01),m.tex('banner'+x,tx,{}),[0,0,0]).geometry.computeBoundingBox()});
  both(x=>{for(const z of[-1.4,.2])winAt(g,m,'rund',[x*bw/2,y0+1.8,z],x*PI/2,PAL.cream,PAL.navy)});
  both(x=>{const b=grp(g,[x*3.6,.6,pz+.9]);P(b,G.blob(.4,.08,4,2+x),m.c(PAL.leaf),[0,.35,0]);S(b,.07,m.c(PAL.blush),[.15,.6,.25]);S(b,.07,m.c(PAL.white),[-.2,.5,.28])});
  both(x=>{const l=grp(g,[x*2.4,.6,pz+1.6]);C(l,.12,.14,.2,m.c(PAL.navy),[0,.1,0]);C(l,.05,.05,1.6,m.c(PAL.navy),[0,.9,0]);S(l,.18,m.glow('#FFE9A0',1.6),[0,1.8,0]);P(l,G.co(.22,.2),m.c(PAL.navy),[0,2.02,0])});
  return finish(g,[0,.6,pz+1.35],4.3,'museum',ticks)}

/* ---------- Farbstudio ---------- */
function buildPaintStudio(m){const g=new THREE.Group();const ticks=[];const bw=3.6,bd=3.0,Hb=2.4;
  B(g,bw+.2,.26,bd+.2,.06,m.c(PAL.stone),[0,.13,0]);B(g,bw,Hb,bd,.12,wallMat(m,'lehm','#FFF6EA',bw/1.3,Hb/1.3),[0,Hb/2,0]);
  B(g,bw,.42,bd,.06,wallMat(m,'lehm','#FFF6EA',bw/1.3,.4),[0,Hb+.18,0]);const rf=grp(g,[0,Hb+.42,0],[-.1,0,0]);B(rf,bw+.6,.18,bd+.8,.07,roofMat(m,PAL.lilac,6,4),[0,0,0]);for(let i=0;i<3;i++){B(rf,.8,.06,1.6,.03,m.glass('#e0f6ff'),[-1.1+i*1.1,.12,-.2]);B(rf,.9,.08,1.7,.03,m.c(PAL.white),[-1.1+i*1.1,.07,-.2])}
  const splash=[[-1.2,1.7,PAL.coral],[1.3,.7,PAL.sky],[-.3,.35,PAL.lemon],[1.1,1.9,PAL.grass],[-1.5,.6,PAL.lilac]];
  splash.forEach(([x,y,c],i)=>{const b=P(g,G.puff(sshp(ringPts(9,.22,.6,srand(i+3))),.03,.015),m.gloss(c),[x,y,bd/2+.02]);S(g,.05,m.gloss(c),[x+.26,y-.2,bd/2+.03],[1,1,.3]);if(i%2)P(g,G.ca(.04,.2),m.gloss(c),[x+.05,y-.3,bd/2+.03])});
  doorAt(g,m,PAL.coral,[.5,0,bd/2]);winAt(g,m,'eckig',[-1.0,1.3,bd/2],0,PAL.white,PAL.sky);winAt(g,m,'rund',[bw/2,1.3,0],PI/2,PAL.white,PAL.sky);
  const pal=grp(g,[0,Hb+1.1,bd/2+.55]);both(x=>bt(g,[x*.6,Hb+.4,bd/2+.4],[x*.6,Hb+.8,bd/2+.5],.04,Wd(m,PAL.wood)));const ps=sshp([[-1.2,-.1],[-.9,-.45],[.3,-.5],[1.2,-.3],[1.3,.2],[.8,.5],[-.6,.5],[-1.25,.3]]);const hole=new THREE.Path();hole.absarc(.95,-.12,.12,0,TAU,true);ps.holes.push(hole);
  P(pal,G.puff(ps,.08,.03),Wd(m,PAL.oak),[0,0,0]);[[-.95,.2,PAL.strawberry],[-.6,.33,PAL.lemon],[1.0,.28,PAL.teal],[-.95,-.2,PAL.grape]].forEach(([x,y,c])=>S(pal,.1,m.gloss(c),[x,y,.07],[1,1,.4]));
  decal(pal,m,signTex('farb','Farbstudio',{bg:PAL.oak,fg:PAL.plum,border:false,w:512,h:128}),'farb',1.4,.36,[-.1,0,.075]);
  const ez=grp(g,[-1.5,0,bd/2+1.1],[0,.35,0]);const wd=Wd(m,PAL.wood);bt(ez,[-.35,0,.2],[0,1.7,-.05],.04,wd);bt(ez,[.35,0,.2],[0,1.7,-.05],.04,wd);bt(ez,[0,0,-.45],[0,1.6,-.08],.04,wd);B(ez,.9,.06,.12,.02,wd,[0,.72,.1]);
  const cv=ctex('fu-bild',128,128,(x,w,h)=>{x.fillStyle='#8FD3FF';x.fillRect(0,0,w,h);x.fillStyle='#8FD36B';x.beginPath();x.arc(40,140,70,0,TAU);x.fill();x.fillStyle='#7CC46A';x.beginPath();x.arc(110,150,60,0,TAU);x.fill();x.fillStyle='#FFE27A';x.beginPath();x.arc(96,32,16,0,TAU);x.fill();x.fillStyle='#FF7E6B';x.fillRect(30,58,20,24);x.beginPath();x.moveTo(26,60);x.lineTo(40,44);x.lineTo(54,60);x.fill()});
  B(ez,.8,.8,.05,.02,m.c(PAL.white),[0,1.15,.1],[-.12,0,0]);decal(ez,m,cv,'bild',.72,.72,[0,1.15,.13],[-.12,0,0]);
  const br=grp(g,[1.9,0,1.0],[0,0,-.3]);C(br,.07,.08,2.4,Wd(m,PAL.coral),[0,1.2,0]);C(br,.1,.1,.3,m.chrome(),[0,2.5,0]);P(br,G.drop(.15,.35),m.gloss(PAL.grape),[0,2.95,0],[PI,0,0]);
  [[-.2,PAL.coral],[.25,PAL.teal],[.0,PAL.lemon]].forEach(([x,c],i)=>{const p=grp(g,[.8+x*2,0,bd/2+.55+i*.12]);C(p,.13,.12,.24,m.c(PAL.steel),[0,.12,0]);C(p,.125,.125,.03,m.gloss(c),[0,.24,0]);P(p,G.ca(.04,.12),m.gloss(c),[.12,.2,0],[0,0,.3])});
  return finish(g,[.5,0,bd/2+.95],2.5,'studio',ticks)}

/* ---------- Raketenstart ---------- */
function buildRocketPad(m){const g=new THREE.Group();const ticks=[];const R=2.4;
  C(g,R,R+.1,.3,m.c(PAL.slate),[0,.15,0]);const hz=ctex('fu-hazard',128,32,(x,w,h)=>{x.fillStyle='#FFE27A';x.fillRect(0,0,w,h);x.fillStyle='#3B3450';for(let i=-1;i<8;i++){x.beginPath();x.moveTo(i*16,h);x.lineTo(i*16+8,h);x.lineTo(i*16+16,0);x.lineTo(i*16+8,0);x.fill()}});
  P(g,G.cy(R+.02,R+.02,.12,true),m.tex('hazard',rtex(hz,8,1)),[0,.24,0]);C(g,R-.3,R-.3,.04,m.c(PAL.stone),[0,.31,0]);
  P(g,G.to(1.1,.05),m.c(PAL.lemon),[0,.33,0],[PI/2,0,0]);const lights=[];for(let i=0;i<8;i++){const a=i/8*TAU;lights.push(S(g,.08,m.glow(i%2?PAL.coral:'#8FF7FF',2),[Math.sin(a)*(R-.15),.34,Math.cos(a)*(R-.15)]))}
  ticks.push(t=>lights.forEach((l,i)=>l.visible=((Math.floor(t*3)+i)%2)===0));
  const rk=grp(g,[0,.32,0]);const body=m.gloss(PAL.white);
  P(rk,G.la([[0,.35],[.62,.4],[.78,1.0],[.8,2.0],[.7,2.8],[.46,3.4],[0,3.46]]),body,[0,0,0]);
  P(rk,G.la([[0,2.9],[.6,2.95],[.46,3.4],[.22,3.8],[0,3.95]]),m.gloss(PAL.coral),[0,0,0]);S(rk,.12,m.gloss(PAL.lemon),[0,3.98,0]);
  P(rk,G.to(.8,.07),m.gloss(PAL.coral),[0,1.5,0],[PI/2,0,0]);P(rk,G.to(.79,.05),m.gloss(PAL.teal),[0,2.4,0],[PI/2,0,0]);
  P(rk,G.to(.26,.07),m.chrome(),[0,2.05,.78]);P(rk,G.cy(.24,.24,.06),glassM(m),[0,2.05,.76],[PI/2,0,0]);face(rk,m,[0,2.02,.8],.4,{cheek:true});
  for(let i=0;i<3;i++){const a=i/3*TAU;const f=grp(rk,[Math.sin(a)*.7,.9,Math.cos(a)*.7],[0,a+PI/2,0]);P(f,G.puff(sshp([[0,-.6],[.55,-.85],[.55,-.35],[0,.6]]),.1,.04),m.gloss(PAL.teal),[0,0,0])}
  P(rk,G.la([[0,.0],[.3,.0],[.42,.36],[0,.4]].map(p=>[p[0],p[1]])),m.steel(),[0,0,0]);
  const gt=grp(g,[-1.7,.3,-.4]);const tm=m.gloss(PAL.coral);for(const x of[-.25,.25])for(const z of[-.25,.25])C(gt,.05,.05,3.2,tm,[x,1.6,z]);for(let i=0;i<5;i++){B(gt,.6,.06,.06,.02,tm,[0,.4+i*.65,.25]);B(gt,.06,.06,.6,.02,tm,[.25,.4+i*.65,0])}
  bt(gt,[.25,2.6,0],[1.05,2.6,.25],.05,tm);B(gt,.7,.1,.7,.04,m.c(PAL.lemon),[0,3.25,0]);S(gt,.1,m.glow(PAL.coral,2),[0,3.4,0]);
  both(x=>{const s=grp(g,[x*.9,.3,R-.05]);B(s,.5,.24,.3,.08,m.c(PAL.steel),[0,.12,0])});
  const sg=signBoard(g,m,'rakete','Raketenstart',1.6,.45,[1.5,1.1,1.6],{bg:PAL.navy,fg:PAL.lemon,bd:PAL.lemon,rot:[0,-.5,0]});bt(g,[1.5,0,1.6],[1.5,.9,1.6],.05,m.steel());
  ticks.push(t=>{rk.position.y=.32+Math.max(0,Math.sin(t*1.2))*.03});g.userData.rocket=rk;
  return finish(g,[0,.3,R+.3],1.1,'rocket',ticks)}

/* ---------- Kleinbauten ---------- */
function buildNoticeBoard(m){const g=new THREE.Group();const wd=Wd(m,PAL.wood);both(x=>{C(g,.07,.08,2.1,wd,[x*.85,1.05,0]);S(g,.1,wd,[x*.85,2.1,0])});
  B(g,1.8,1.1,.1,.05,wd,[0,1.35,0]);const ck=ctex('fu-kork',64,64,(x,w,h)=>{x.fillStyle='#E0B280';x.fillRect(0,0,w,h);const r=srand(2);for(let i=0;i<60;i++){x.fillStyle=i%2?'#C99A68':'#EBC49A';x.fillRect(r()*w,r()*h,3,3)}});
  B(g,1.62,.92,.04,.02,m.tex('kork',rtex(ck,3,2)),[0,1.35,.05]);
  [[-.5,1.5,PAL.butter,.1],[.05,1.45,PAL.mint,-.08],[.52,1.55,PAL.blush,.05],[-.25,1.12,PAL.sky,-.05],[.4,1.12,PAL.white,.1]].forEach(([x,y,c,r],i)=>{const n=grp(g,[x,y,.08],[0,0,r]);B(n,.34,.4,.01,0,m.c(c),[0,0,0]);for(let k=0;k<3;k++)B(n,.22,.025,.01,0,m.c(PAL.slate),[0,.1-k*.08,.008]);S(n,.03,m.gloss([PAL.strawberry,PAL.teal,PAL.lemon][i%3]),[0,.17,.02])});
  const rf=grp(g,[0,2.05,0]);both(s=>P(rf,G.bx(1.1,.08,.5,.03),m.c(PAL.coral),[s*.5,.08,0],[0,0,-s*.3]));
  return finish(g,[0,0,.9],.95,'board')}
function buildStage(m){const g=new THREE.Group();const ticks=[];const W=4,D=3,h=.5;
  B(g,W,h,D,.1,Wd(m,PAL.wood),[0,h/2,0]);
  const df=ctex('fu-dance',128,128,(x,w,h2)=>{const cs=['#FF8FB8','#7FDCE6','#FFE27A','#C6A9FF'];for(let j=0;j<4;j++)for(let i=0;i<4;i++){x.fillStyle=cs[(i+j*2)%4];x.fillRect(i*32+2,j*32+2,28,28)}});
  const floor=P(g,G.bx(W-.3,.04,D-.4,.02),glowTex('dance',rtex(df,2,1.5)),[0,h+.02,-.05]);
  for(let i=0;i<2;i++)B(g,1.4,.25,.35,.05,m.c(PAL.oak),[0,h/2-.1-i*.12+.12,D/2+.18+i*.3]);
  const tr=m.gloss(PAL.grape);both(x=>C(g,.08,.08,3,tr,[x*1.85,h+1.5,-1.3]));B(g,3.9,.16,.16,.05,tr,[0,h+3,-1.3]);
  const cols=['#FF6FB0','#FFE27A','#7FF6FF','#B8A0FF','#8CFF9A'];const ls=[];for(let i=0;i<5;i++){const l=grp(g,[-1.4+i*.7,h+2.82,-1.2],[.5,0,0]);C(l,.1,.13,.22,m.c(PAL.ink),[0,0,0]);ls.push(P(l,G.circ(.1),m.glow(cols[i],2.4),[0,-.115,0],[PI/2,0,0]))}
  const db=grp(g,[0,h+2.4,-.9]);bt(db,[0,.6,-.4],[0,.15,0],.01,m.steel());const ball=P(db,G.ico(.24,1),m.chrome(),[0,0,0]);ball.material=m.chrome();
  ticks.push(t=>{ball.rotation.y=t*1.5;floor.material.map.offset.x=Math.floor(t*2)%2*.25});
  both(x=>{const s=grp(g,[x*(W/2+.1),0,.6]);B(s,.8,1.5,.7,.12,m.c(PAL.ink),[0,.75,0]);[1.15,.5].forEach((y,i)=>{P(s,G.to(.22-i*.05,.05),m.gloss(PAL.coral),[0,y,.36]);P(s,G.cy(.19-i*.05,.19-i*.05,.05),m.c(PAL.slate),[0,y,.35],[PI/2,0,0]);S(s,.07,m.chrome(),[0,y,.38])})});
  const st=signBoard(g,m,'buehne','Bühne',1.6,.5,[0,h+3.4,-1.3],{bg:PAL.grape,fg:PAL.lemon,bd:PAL.pink,glow:'#FFB8F0'});
  [[-1.9,PAL.lemon],[1.9,PAL.pink]].forEach(([x,c])=>P(g,G.star(.28,.12,5,.08),m.gloss(c),[x,h+3.3,-1.3]));
  g.userData.floorY=h;g.userData.stairs=[0,0,D/2+.8];return finish(g,[0,0,D/2+.9],2.3,'stage',ticks)}
function buildBench(m){const g=new THREE.Group();const wd=Wd(m,PAL.oak),ir=m.c(PAL.forest);
  both(x=>{const l=grp(g,[x*.7,0,0]);B(l,.08,.45,.5,.03,ir,[0,.22,0]);P(l,G.to(.1,.03,PI*1.5),ir,[0,.72,-.2],[0,PI/2,0]);bt(l,[0,.44,-.22],[0,.95,-.3],.035,ir);B(l,.08,.06,.5,.02,ir,[0,.44,0])});
  for(let i=0;i<3;i++)B(g,1.6,.06,.15,.03,wd,[0,.47,-.17+i*.17]);for(let i=0;i<2;i++)B(g,1.6,.14,.05,.025,wd,[0,.7+i*.2,-.27-i*.02],[-.12,0,0]);
  both(x=>S(g,.05,m.gloss(PAL.honey),[x*.7,.98,-.3]));g.userData.seat=[0,.5,.02];return finish(g,[0,0,.8],.8,'bench')}
function buildStreetLamp(m){const g=new THREE.Group();const c=m.gloss(PAL.navy);
  P(g,G.la([[0,0],[.26,0],[.26,.1],[.14,.2],[.1,.5],[0,.5]]),c,[0,0,0]);C(g,.06,.07,2.2,c,[0,1.5,0]);P(g,G.to(.09,.025),m.gold(),[0,.9,0],[PI/2,0,0]);
  P(g,G.to(.2,.03,PI),c,[.2,2.55,0],[0,0,0]);const lm=grp(g,[.4,2.52,0]);P(lm,G.la([[0,0],[.14,0],[.2,.28],[.24,.32],[0,.34]]),c,[0,.02,0],[PI,0,0]);S(lm,.13,m.glow('#FFE9A0',2),[0,-.18,0]);P(lm,G.cy(.14,.1,.2),m.glass('#fff4c0'),[0,-.16,0]);
  S(g,.08,m.gold(),[0,2.62,0]);const pt=grp(g,[-.16,1.7,0]);bt(pt,[.1,0,0],[.02,-.1,0],.01,m.steel());P(pt,G.la([[0,0],[.1,0],[.13,.14],[0,.14]]),m.c(PAL.terracotta),[0,-.26,0]);S(pt,.1,m.c(PAL.leaf),[0,-.1,0]);S(pt,.04,m.c(PAL.blush),[.05,-.04,.06]);
  g.userData.light={p:[.4,2.34,0],c:'#FFE3A0',i:1.4};return finish(g,[0,0,.6],.3,'lamp')}
function buildMailbox(m){const g=new THREE.Group();C(g,.05,.06,.9,Wd(m,PAL.wood),[0,.45,0]);C(g,.16,.2,.08,m.c(PAL.stone),[0,.04,0]);
  const b=grp(g,[0,.95,0]);B(b,.36,.3,.56,.08,m.gloss(PAL.sky),[0,.02,0]);P(b,G.cy(.18,.18,.56),m.gloss(PAL.sky),[0,.17,0],[PI/2,0,0]);
  P(b,G.puff(archShape(.34,.46,.17),.04,.015),m.gloss(PAL.cream),[0,-.12,.28]);S(b,.035,m.gold(),[0,.12,.31]);P(b,G.heart(.07,.03),m.gloss(PAL.strawberry),[.19,.08,0],[0,PI/2,0]);
  const fl=grp(b,[-.2,.05,-.1]);B(fl,.03,.35,.04,.01,m.c(PAL.strawberry),[0,.17,0]);B(fl,.03,.12,.16,.02,m.c(PAL.strawberry),[0,.3,.08]);
  const lt=grp(b,[.02,.34,.05],[0,.2,.1]);B(lt,.24,.02,.16,.005,m.c(PAL.white),[0,0,0]);g.userData.flag=fl;return finish(g,[0,0,.7],.3,'mailbox')}
function buildSignpost(m,text){const g=new THREE.Group();const lines=String(text||'Willkommen!').split(/\||\n/).slice(0,3);C(g,.07,.08,2.1,Wd(m,PAL.wood),[0,1.05,0]);S(g,.1,Wd(m,PAL.wood),[0,2.12,0]);
  const cols=[[PAL.butter,PAL.bark],[PAL.mint,PAL.forest],[PAL.blush,PAL.plum]];
  lines.forEach((t,i)=>{const dir=i%2?-1:1;const a=grp(g,[0,1.85-i*.42,0],[0,(i-1)*.25,0]);const w=1.3,h=.34;
    const sh=shp([[-.08*dir,-h/2],[w*dir-.18*dir,-h/2],[w*dir,0],[w*dir-.18*dir,h/2],[-.08*dir,h/2]]);P(a,G.puff(sh,.06,.02),Wd(m,PAL.oak),[0,0,.02]);
    decal(a,m,signTex('sp'+t,t,{bg:cols[i%3][0],fg:cols[i%3][1],border:false,w:384,h:96}),'sp'+t,.98,.24,[dir*.52,0,.075])});
  return finish(g,[0,0,.8],.3,'sign')}
/* Brunnen-Wasser: Wellenringe von den Einschlagstellen, Tiefe zur Mitte, Glitzer, Schaumrand (unbeleuchtet, eigene Uhr) */
const FOUNT={U:{uT:{value:0}},
  water(R,hits){return new THREE.ShaderMaterial({uniforms:{uT:FOUNT.U.uT,uR:{value:R},uHit:{value:hits}},transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float uT;uniform float uR;uniform float uHit;varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 q=(vUv-.5)*2.;float r=length(q);if(r>1.)discard;float d=r*uR;
        vec3 deep=vec3(.16,.52,.72),shal=vec3(.42,.84,.92);vec3 c=mix(deep,shal,smoothstep(.1,1.,r));
        float ring=sin((abs(d-uHit)*9.-uT*5.))*.5+.5;ring*=exp(-abs(d-uHit)*2.2);c+=vec3(.9,1.,1.)*pow(ring,3.)*.35;
        float ca=n(q*uR*3.+vec2(uT*.4,uT*.3))*n(q*uR*4.-vec2(uT*.3,-uT*.2));c+=vec3(.7,.95,1.)*smoothstep(.28,.5,ca)*.25;
        float foam=smoothstep(.1,.0,abs(d-uHit))*(.6+.4*n(q*uR*12.+uT*2.));c=mix(c,vec3(1.),foam*.7);
        float sp=step(.985,h(floor(q*uR*18.)+floor(uT*3.)))*.8;c+=sp;
        c=mix(c,vec3(1.),smoothstep(.93,1.,r)*.5);gl_FragColor=vec4(c,.92);}`})},
  jet(){return new THREE.ShaderMaterial({uniforms:{uT:FOUNT.U.uT},transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:`uniform float uT;varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){float fr=1.-abs(dot(vN,vV));
      float st=smoothstep(.55,1.,sin(vUv.x*38.-uT*14.+vUv.y*6.2832)*.5+.5);vec3 c=mix(vec3(.62,.9,1.),vec3(1.),st*.7+fr*.5);
      float a=(.35+fr*.5+st*.25)*smoothstep(1.,.86,vUv.x);gl_FragColor=vec4(c,a);}`})}};
function stoneTex(){return ctex('ashlar',256,128,(x,w,h)=>{x.fillStyle='#8E87A0';x.fillRect(0,0,w,h);const r=srand(3);const rows=4,bh=h/rows;
  for(let j=0;j<rows;j++){let px=-(j%2)*18;while(px<w){const bw=34+r()*26;const t=.84+r()*.12;const cc=Math.round(200*t),cb=Math.round(214*t);x.fillStyle=`rgb(${cc},${Math.round(cc*.97)},${cb})`;
    x.beginPath();x.roundRect?x.roundRect(px+2,j*bh+2,bw-4,bh-4,5):x.rect(px+2,j*bh+2,bw-4,bh-4);x.fill();
    const g=x.createLinearGradient(0,j*bh,0,j*bh+bh);g.addColorStop(0,'rgba(255,255,255,.22)');g.addColorStop(.3,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(60,40,90,.18)');x.fillStyle=g;x.fillRect(px+2,j*bh+2,bw-4,bh-4);
    for(let k=0;k<5;k++){x.fillStyle='rgba(80,60,110,.15)';x.beginPath();x.arc(px+r()*bw,j*bh+r()*bh,1+r()*2,0,TAU);x.fill()}
    if(r()<.3){x.fillStyle='rgba(120,170,90,.35)';x.beginPath();x.ellipse(px+bw*r(),j*bh+bh-4,8+r()*8,3,0,0,TAU);x.fill()}px+=bw}}})}
function buildFountain(m){const g=new THREE.Group();const ticks=[];const tx=stoneTex().clone();tx.needsUpdate=true;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(10,3.2);
  /* WIRED: Becken aus Bonbon-Plastik, Chrom-Rand, Säule als durchsichtige Röhre mit Zahnrädern */const wk=typeof WK!=='undefined';const cp=wk?WK.pal():{a:'#2fb5d9',b:'#ff9a45'};const st=wk?WK.candy(m,cp.a,.7):cozy({map:tx,color:'#ffffff',rim:.12}),st2=wk?m.chrome():m.c('#D8D0E4');const keep=[];
  P(g,G.la([[0,0],[1.45,0],[1.5,.06],[1.5,.5],[1.35,.55],[1.28,.5],[1.28,.18],[0,.18]]),st,[0,0,0]);P(g,G.to(1.4,.09),st2,[0,.52,0],[PI/2,0,0]);
  const surf=(r,y,hit)=>{const w=new THREE.Mesh(new THREE.CircleGeometry(r,48),FOUNT.water(r,hit));w.rotation.x=-PI/2;w.position.y=y;w.userData.noOutline=true;w.userData.noMerge=true;w.renderOrder=2;g.add(w);return w};
  surf(1.29,.42,.85);if(wk){const tube=C(g,.24,.3,1.1,WK.candy(m,cp.b,.38),[0,.9,0]);tube.userData.noMerge=true;for(let i=0;i<3;i++){const gr=WK.gear(g,m,.17,[0,.55+i*.3,0],[PI/2,0,i],i%2?'#e6ecf5':'#c9cfdb');keep.push(gr);ticks.push(t=>{gr.rotation.z=t*(i%2?-1.2:1)})}C(g,.03,.03,1.1,m.chrome(),[0,.9,0]);for(let i=0;i<8;i++){const a=i/8*TAU;WK.screw(g,m,[Math.cos(a)*1.47,.32,Math.sin(a)*1.47],[0,-a+PI/2,0],.04)}WK.lcd(g,m,'fount',['23:59'],.42,.2,[0,.34,1.52])}else C(g,.2,.28,1.1,st2,[0,.9,0]);P(g,G.la([[0,0],[.1,0],[.55,.12],[.6,.26],[.52,.3],[0,.2]]),st2,[0,1.4,0]);surf(.5,1.67,.12);
  C(g,.08,.12,.4,st2,[0,1.8,0]);const fish=grp(g,[0,2.05,0]);S(fish,.18,m.gloss(PAL.coral),[0,0,0],[1,1.1,.9]);P(fish,G.puff(sshp([[0,0],[-.12,.16],[.12,.16]]),.04),m.gloss(PAL.coral),[0,-.22,0],[PI,0,0]);face(fish,m,[0,.03,.16],.3,{mouth:false});P(fish,G.to(.04,.015),m.c(PAL.ink),[0,-.06,.16]);
  const jm=FOUNT.jet();const jet=pts=>{const j=P(g,G.tu(pts,.03,.035,16),jm);j.userData.noOutline=true;j.userData.noMerge=true;j.castShadow=false;return j};
  for(let i=0;i<4;i++){const a=i/4*TAU+PI/4;jet([[Math.cos(a)*.12,2.0,Math.sin(a)*.12],[Math.cos(a)*.4,2.12,Math.sin(a)*.4],[Math.cos(a)*.5,1.7,Math.sin(a)*.5]])}
  const outer=[];for(let i=0;i<6;i++){const a=i/6*TAU;jet([[Math.cos(a)*.6,1.62,Math.sin(a)*.6],[Math.cos(a)*.75,1.3,Math.sin(a)*.75],[Math.cos(a)*.85,.45,Math.sin(a)*.85]]);outer.push(a)}
  /* Spritzer: Tröpfchen auf Wurfbahnen + Aufprallringe */
  const N=72,pos=new Float32Array(N*3),seeds=[];for(let i=0;i<N;i++)seeds.push([Math.random(),Math.random(),Math.random()]);const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const dotT=ctex('fdrop',32,32,(x,w,h)=>{const gr=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(220,245,255,.7)');gr.addColorStop(1,'rgba(220,245,255,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)});
  const drops=new THREE.Points(pg,new THREE.PointsMaterial({map:dotT,size:.07,transparent:true,depthWrite:false,color:'#F2FCFF'}));drops.frustumCulled=false;drops.userData.noOutline=true;drops.userData.noMerge=true;g.add(drops);
  const ringM=new THREE.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:.6,depthWrite:false});const rings=range(6,(t,i)=>{const r=new THREE.Mesh(new THREE.RingGeometry(.06,.1,20),ringM.clone());r.rotation.x=-PI/2;r.userData.noOutline=true;r.userData.noMerge=true;g.add(r);return r});
  ticks.push(t=>{FOUNT.U.uT.value=t;for(let i=0;i<N;i++){const[a0,b0,c0]=seeds[i];const top=i<24;const f=(t*(top?.9:1.2)+a0)%1;let x,y,z;
      if(top){const a=b0*TAU;const v=.5+c0*.4;x=Math.cos(a)*(.15+f*.45*v);z=Math.sin(a)*(.15+f*.45*v);y=2.05+f*.35-f*f*.75}
      else{const a=outer[i%6]+(b0-.5)*.25;const r=.85+f*(.12+c0*.2);x=Math.cos(a)*r;z=Math.sin(a)*r;y=.44+f*(.28+c0*.2)-f*f*(.5+c0*.2)}
      pos[i*3]=x;pos[i*3+1]=Math.max(.42,y);pos[i*3+2]=z}pg.attributes.position.needsUpdate=true;
    rings.forEach((r,i)=>{const f=(t*.8+i*.37)%1,a=outer[i];r.position.set(Math.cos(a)*.86,.43,Math.sin(a)*.86);r.scale.setScalar(1+f*3.2);r.material.opacity=.55*(1-f)})});
  for(let i=0;i<5;i++){const a=i/5*TAU+.3;P(g,G.puff(flowerShape(.07,5),.02),m.c([PAL.pink,PAL.white,PAL.lemon][i%3]),[Math.cos(a)*1.0,.44,Math.sin(a)*1.0],[-PI/2,0,0]);P(g,G.circ(.14),m.c(PAL.leaf),[Math.cos(a)*1.0+.05,.435,Math.sin(a)*1.0],[-PI/2,0,0])}
  g.userData.keep=keep;const out=finish(g,[0,0,2.0],1.55,'fountain',ticks);out.traverse(o=>{if(o.userData.noMerge)o.castShadow=false});return out}
function buildBridge(m,len){len=Math.max(2,+len||4);const g=new THREE.Group();const wd=Wd(m,PAL.oak),dk=Wd(m,PAL.wood),Wb=1.6,hh=Math.min(.7,len*.12);const deck=x=>{const t=x/len+.5;return .12+hh*Math.sin(Math.max(0,Math.min(1,t))*PI)};
  const n=Math.round(len/.28),parts=[];for(let i=0;i<n;i++){const x=-len/2+(i+.5)*len/n;const y=deck(x);const s=(deck(x+.01)-deck(x-.01))/.02;parts.push([G.bx(len/n-.03,.08,Wb,.03),[x,y,0],[0,0,Math.atan(s)]])}mergeInto(g,wd,parts);
  both(z=>{const beam=range(14,(t)=>{const x=-len/2+t*len;return[x,deck(x)-.08,z*(Wb/2-.1)]});P(g,G.tu(beam,.07,.07,40),dk);
    const rail=range(14,(t)=>{const x=-len/2+t*len;return[x,deck(x)+.62,z*(Wb/2-.02)]});P(g,G.tu(rail,.05,.05,40),dk);
    const k=Math.max(3,Math.round(len/.8));for(let i=0;i<=k;i++){const x=-len/2+i*len/k;const y=deck(x);C(g,.05,.05,.62,dk,[x,y+.31,z*(Wb/2-.02)]);if(i===0||i===k)S(g,.09,m.gloss(PAL.coral),[x,y+.66,z*(Wb/2-.02)])}
    both(e=>C(g,.09,.1,.5,dk,[e*len/2,.12,z*(Wb/2-.1)]))});
  g.userData.len=len;g.userData.width=Wb;g.userData.deckY=deck;return finish(g,[-len/2-.5,0,0],0,'bridge')}
window.FU={B,C,S,Wd,wallMat,roofMat,winAt,doorAt,signBoard,finish,signTex,decal,awning,crate,flagOn,scallop,shellRibs,starfish,archShape,tu,rtex,houseWin,houseDoor,glassM};
Object.assign(window,{buildShop,buildMuseum,buildPaintStudio,buildRocketPad,buildNoticeBoard,buildStage,buildBench,buildStreetLamp,buildMailbox,buildSignpost,buildFountain,buildBridge,signTex});

/* Test-Registry für die Galerie (nicht fürs Spiel nötig) */
window.FURN_GALLERY=[
  {id:'kiosk',n:'Kompost-Kiosk',b:(g,m)=>g.add(buildShop('kompost',m))},{id:'basar',n:'Ersatzteil-Basar',b:(g,m)=>g.add(buildShop('schrott',m))},{id:'muschel',n:'Muschel-Laden',b:(g,m)=>g.add(buildShop('korallen',m))},
  {id:'museum',n:'Nationalmuseum',b:(g,m)=>g.add(buildMuseum(m))},{id:'studio',n:'Farbstudio',b:(g,m)=>g.add(buildPaintStudio(m))},{id:'rakete',n:'Raketenstart',b:(g,m)=>g.add(buildRocketPad(m))},
  {id:'brett',n:'Schwarzes Brett',b:(g,m)=>g.add(buildNoticeBoard(m))},{id:'buehne',n:'Bühne',b:(g,m)=>g.add(buildStage(m))},{id:'bank',n:'Bank',b:(g,m)=>g.add(buildBench(m))},
  {id:'laterne',n:'Laterne',b:(g,m)=>g.add(buildStreetLamp(m))},{id:'post',n:'Briefkasten',b:(g,m)=>g.add(buildMailbox(m))},{id:'schild',n:'Wegweiser',b:(g,m)=>g.add(buildSignpost(m,'Museum|Laden|Raketen'))},
  {id:'brunnen',n:'Brunnen',b:(g,m)=>g.add(buildFountain(m))},{id:'bruecke',n:'Brücke',b:(g,m)=>g.add(buildBridge(m,5))}];
})();
/* Praxis: weiss-mintfarbene Fliesen mit Zierband, heller Linoleum mit Sprenkeln */
wallpaper('praxis',{n:'Praxis-Kacheln',price:450,planet:'alle',draw:(x,w,h)=>{x.fillStyle='#F7FBFA';x.fillRect(0,0,w,h);
  x.fillStyle='#CFEDE6';x.fillRect(0,h*.58,w,h*.42);x.fillStyle='#9BD6CB';x.fillRect(0,h*.55,w,h*.035);x.fillStyle='rgba(255,255,255,.9)';x.fillRect(0,h*.585,w,h*.012);
  x.fillStyle='rgba(120,170,165,.35)';for(let i=0;i<=8;i++)x.fillRect(i*w/8-1,h*.585,2,h*.415);for(let j=0;j<5;j++)x.fillRect(0,h*.585+j*h*.415/4.5,w,2);
  x.fillStyle='rgba(150,200,195,.18)';for(let i=0;i<=8;i++)x.fillRect(i*w/8-1,0,2,h*.55);for(let j=0;j<6;j++)x.fillRect(0,j*h*.55/5.5,w,2)}});
floorpat('linoleum',{n:'Praxis-Linoleum',price:420,planet:'alle',draw:(x,w,h)=>{x.fillStyle='#DDEEEA';x.fillRect(0,0,w,h);const r=srand(77);
  for(let i=0;i<900;i++){x.fillStyle=['rgba(140,190,180,.35)','rgba(255,255,255,.6)','rgba(180,160,200,.25)'][i%3];const s=1+r()*2.5;x.fillRect(r()*w,r()*h,s,s)}
  x.fillStyle='rgba(120,170,160,.28)';for(let i=0;i<2;i++){x.fillRect(i*w/2,0,2,h);x.fillRect(0,i*h/2,w,2)}}});
/* Boutique: Creme mit zarten Rosastreifen und feinen Goldlinien */
wallpaper('boutique',{n:'Boutique-Streifen',price:520,planet:'alle',draw:(x,w,h)=>{x.fillStyle='#FFF4EC';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle='rgba(242,168,196,.45)';x.fillRect(i*w/8+w/32,0,w/16,h);x.fillStyle='rgba(201,164,90,.55)';x.fillRect(i*w/8,0,1.5,h)}
  x.fillStyle='#F2D6DE';x.fillRect(0,h*.62,w,h*.38);x.fillStyle='rgba(201,164,90,.8)';x.fillRect(0,h*.62,w,3);for(let i=0;i<6;i++){x.strokeStyle='rgba(216,112,142,.35)';x.lineWidth=2;x.strokeRect(i*w/6+6,h*.66,w/6-12,h*.3)}}});
