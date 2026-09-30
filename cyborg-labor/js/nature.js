/* =====================================================================
   CYBORG-LABOR · nature.js
   Natur-Objekte der Planeten, Öko-Requisiten der Fähigkeiten und Sammelobjekte
   (Fische, Insekten, Fundstücke, Muscheln, Früchte).
   ===================================================================== */
const NATURE={};
/* nat(type,{b:(g,m,opt,rnd)=>{}, r:Kollisionsradius, h:Höhe, grow:Sekunden, decal:bool, shake:bool, ...})  — Boden y=0, Welt-Einheiten (Cyborg ~1.6 hoch) */
function nat(type,o){NATURE[type]=o}
const FISH=[],BUGS=[],RELICS=[],ITEMS=[];
/* ---------------------------------------------------------------------
   KONVENTIONEN (für die Engine)
   · NATURE[type] = {b, r, h, planet, shake?, grow?, decal?, cols?, water?}
       b(g,m,opt,rnd) baut in die Gruppe g. Boden bei y=0, Welt-Einheiten (Cyborg ≈ 1.7).
       r  = Kollisionsradius um (0,0) · h = Höhe · cols = [[x,z,r],…] mehrere Kollisionskreise (Felsbogen)
       planet = 'kompost'|'schrott'|'korallen'|'alle' (Streu-Vorschlag) · water:true = schwimmt, y=0 ist Wasseroberfläche
       shake:true = schüttelbar; g.userData.fruits = [Mesh…] (einzeln ausblendbar, name 'frucht_<art>')
       grow = Sekunden zum Heranwachsen (Öko-Requisiten) · decal:true = flacher Boden-Aufkleber bei y≈0.02
       g.userData.blink = [Mesh…]  (Mesh.userData.blink=1) → blinkende Lichter (Funkmast, Antennenbaum)
       g.userData.glow  = [Mesh…]  leuchtende Teile (nachts schön)
   · FISH/BUGS/RELICS/ITEMS: {id,n,planet,rarity,price,text,fact,b, …}
       FISH: where, size, time · Modell ≈1 lang entlang +z (Kopf +z), um (0,0,0) zentriert.
       BUGS: where, time · Modell ≈1 lang, Kopf +z, steht mit Beinen auf y=0 (Flieger schweben knapp darüber).
       RELICS: Modell ≈1 gross, Boden y=0. · ITEMS: Modell ≈0.6–1 gross, Boden y=0 (Engine skaliert für die Welt).
   --------------------------------------------------------------------- */
(function(){
/* ======================= Helfer ======================= */
const wrap=b=>(g,m,opt,rnd)=>{opt=opt||{};rnd=rnd||srand(7);g.userData.fruits=g.userData.fruits||[];return b(g,m,opt,rnd)};
const N=(type,meta,b)=>nat(type,Object.assign({},meta,{b:wrap(b)}));
const RR=(rnd,a,b)=>a+(b-a)*rnd();
const RP=(rnd,a)=>a[Math.floor(rnd()*a.length)%a.length];
const up=new V3(0,1,0);
function basis(o,X,Y,Z){o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new V3(...X).normalize(),new V3(...Y).normalize(),new V3(...Z).normalize()));return o}
function orient(o,n,from){o.quaternion.setFromUnitVectors(from||new V3(0,0,1),new V3(n[0],n[1],n[2]).normalize());return o}
/* glänzendes Knopfauge; n = Blickrichtung */
function eye(g,m,p,r,n){n=n||[0,0,1];P(g,G.s(r),m.eye(),p);const d=new V3(n[0],n[1]+.6,n[2]+.25).normalize();
  const h=P(g,G.s(r*.36),m.flat('#ffffff'),[p[0]+d.x*r*.78,p[1]+d.y*r*.78,p[2]+d.z*r*.78]);h.userData.noOutline=true;return h}
function eyes(g,m,x,y,z,r,out){both(s=>eye(g,m,[s*x,y,z],r,[s*(out??.8),0,1-(out??.8)*.5]))}
/* Geometrie verbiegen: y -= k·x² (flache Blätter hängen durch) */
function droop(geo,k,ax){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setY(i,p.getY(i)-k*x*x)}geo.computeVertexNormals();return geo}
/* flaches, gepufftes Blatt in der XZ-Ebene (Länge entlang +x) */
function flatLeaf(shape,th,k){const g=G.puff(shape,th);g.rotateX(PI/2);if(k)droop(g,k);return g}
function leafShape(L,W){const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(L*.32,W*1.15,L,0);s.quadraticCurveTo(L*.32,-W*1.15,0,0);return s}
/* Blütenform: n runde (oder spitze) Blütenblätter */
function flowerShape(n,R,ri,pointy){const s=new THREE.Shape();const pp=(r,a)=>[Math.cos(a)*r,Math.sin(a)*r];s.moveTo(...pp(ri,0));
  for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU,am=(a0+a1)/2,sp=PI/n*.95;
    if(pointy){const t=pp(R,am);s.quadraticCurveTo(...pp(R*.62,am-sp*.9),t[0],t[1]);const e=pp(ri,a1);s.quadraticCurveTo(...pp(R*.62,am+sp*.9),e[0],e[1])}
    else{const e=pp(ri,a1);s.bezierCurveTo(...pp(R*1.18,am-sp),...pp(R*1.18,am+sp),e[0],e[1])}}return s}
/* Wellenkante am unteren Rand einer Lathe (Tannen-Etagen, Pilzhüte) */
function scallop(geo,n,amp,ymax){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y<ymax){const a=Math.atan2(x,z);p.setY(i,y+Math.sin(a*n)*amp*(1-y/ymax))}}geo.computeVertexNormals();return geo}
/* Kristall-Prisma (6-seitig, Spitze oben) */
const crysGeo=(r,h)=>{const g=G.la([[0,0],[r*.8,0],[r,h*.12],[r,h*.7],[0,h]],6).toNonIndexed();g.computeVertexNormals();return g};
const crysMat=(m,c)=>m.c(c,{gloss:1.3,rim:.9,rimColor:'#ffffff'});
function crystal(g,m,base,dir,r,h,col){const o=P(g,crysGeo(r,h),crysMat(m,col),base);orient(o,dir,up);return o}
/* Stamm mit Wurzelfuss */
function trunk(g,m,h,r,col){return P(g,G.la([[0,0],[r*1.75,0],[r*1.3,h*.06],[r*1.05,h*.2],[r*.9,h*.6],[r*.78,h],[0,h]],Q(16)),m.c(col||'#9C6B48'))}
/* Laubwolke */
function cloud(g,m,col,x,y,z,r,seed,sc){if(typeof FOLIAGE!=='undefined')return FOLIAGE.crown(g,m,col,x,y,z,r,seed,sc);return P(g,G.blob(r,.06,2.4,seed),m.c(col,{rim:.55,rimColor:'#f2ffc8'}),[x,y,z],null,sc)}
/* Punkt auf Ellipsoid-Oberfläche (für Früchte/Punkte) */
function onBlob(c,rx,ry,rz,th,ph){const n=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];return{p:[c[0]+n[0]*rx,c[1]+n[1]*ry,c[2]+n[2]*rz],n}}
/* Muschel-/Linsenkörper (zwei gewölbte Schalen mit Rippen, geschlossen) — Fächer nach +y, Scharnier bei 0 */
function clamGeo(R,spread,ribs,H,Hb,ribAmp,wave){const nu=Q(44),nv=Q(14);const pos=[],idx=[],uv=[];
  [[1,H],[-1,Hb]].forEach(([sd,hh],k)=>{const b=pos.length/3;
    for(let j=0;j<=nv;j++){const v=j/nv;for(let i=0;i<=nu;i++){const u=i/nu;const th=(u-.5)*2*spread;const rib=.5+.5*Math.cos(u*ribs*TAU);
      const rho=v*R*(1+(wave||0)*rib*v);const e=Math.sqrt(Math.max(0,1-v*v))*Math.pow(Math.max(0,Math.cos((u-.5)*PI)),.45);
      const z=sd*(hh*e+(sd>0?ribAmp*rib*Math.min(1,v*2.5)*e:0));pos.push(Math.sin(th)*rho,Math.cos(th)*rho,z);uv.push(u,v)}}
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=b+j*(nu+1)+i,bb=a+1,c=a+nu+1,d=c+1;if(sd>0){idx.push(a,bb,d,a,d,c)}else{idx.push(a,d,bb,a,c,d)}}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
const shellMat=(m,col,ribs)=>m.tex('shell'+col+ribs,ctex('shell'+col+ribs,256,64,(x,w,h)=>{x.fillStyle=col;x.fillRect(0,0,w,h);x.fillStyle=shade(col,.86);for(let i=0;i<ribs;i++)x.fillRect((i+.5)/ribs*w-w/ribs*.18,0,w/ribs*.36,h);const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.35)');x.fillStyle=gr;x.fillRect(0,0,w,h)}),{gloss:.5,rim:.7,rimColor:'#fff4f0'});
/* Schneckenhaus-Spirale (Kugelkette als ein Tube) */
function spiralShell(g,m,col,s,p,rot){const q=grp(g,p,rot);const pts=range(Q(26),(t)=>{const a=t*TAU*2.2;const rr=(1-t*.85)*.34*s;return[Math.cos(a)*rr,Math.sin(a)*rr,t*.3*s]});
  const n=pts.length;range(n,(t,i)=>0);const body=P(q,G.tu(pts.slice().reverse(),.02*s,.3*s),m.c(col,{gloss:.8}));P(q,G.s(.3*s),m.c(col,{gloss:.8}),[pts[0][0],pts[0][1],pts[0][2]],null,[1,1,.8]);return q}
/* Farbe dunkler/heller */
const shade=(c,f)=>{const o=new THREE.Color(c);const h={};o.getHSL(h);o.setHSL(h.h,h.s,Math.max(0,Math.min(1,h.l*f)));return '#'+o.getHexString()};
/* Planeten-Gesteinsfarben */
const ROCK={kompost:['#C9C1CF','#B3AABD','#7CC46A'],schrott:['#A99BC2','#8D80A8','#7FE8E0'],korallen:['#EBCB9A','#D9B27C','#FF9E8A']};
/* Canvas-Textur als flacher Boden-Aufkleber */
function decalMesh(g,m,key,w,d,size,draw,o){const t=ctex('dec-'+key,size,size,draw);const mat=m.tex('dec-'+key,t,Object.assign({transparent:true,depthWrite:false,rim:0,polygonOffset:true,polygonOffsetFactor:-2},o||{}));
  const me=P(g,G.pl(w,d),mat,[0,.02,0],[-PI/2,0,0]);me.castShadow=false;me.renderOrder=1;return me}
function blobPath(x,cx,cy,r,rnd,n,j){x.beginPath();const k=n||14;for(let i=0;i<=k;i++){const a=i/k*TAU;const rr=r*(1-(j??.25)/2+rnd()*(j??.25));const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;i?x.lineTo(px,py):x.moveTo(px,py)}x.closePath()}
function smoothBlob(x,cx,cy,r,rnd,n,j){const k=n||12;const pts=range(k,(t,i)=>{const a=i/k*TAU;const rr=r*(1-(j??.3)/2+rnd()*(j??.3));return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]});
  x.beginPath();const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];const m0=mid(pts[k-1],pts[0]);x.moveTo(m0[0],m0[1]);for(let i=0;i<k;i++){const p=pts[i],mm=mid(p,pts[(i+1)%k]);x.quadraticCurveTo(p[0],p[1],mm[0],mm[1])}x.closePath()}
const markGlow=(g,o)=>{(g.userData.glow=g.userData.glow||[]).push(o);return o};
const markBlink=(g,o)=>{o.userData.blink=1;(g.userData.blink=g.userData.blink||[]).push(o);return o};

/* ======================= Früchte ======================= */
const FRUITS={apfel:'#EE4D4D',birne:'#CFE06A',kirsche:'#D9304A',pfirsich:'#FFB08A',orange:'#FF9A2E',kokosnuss:'#8A5A3C'};
/* baut eine Frucht (Durchmesser ≈ s) mit Stiel als Kind; gibt das Haupt-Mesh zurück */
function fruit(g,m,kind,p,s){let f;const stem=m.c('#8A5A44'),lf=m.c('#6CBF5A');
  switch(kind){
    case 'birne':f=P(g,G.la([[0,-.5],[.3,-.47],[.45,-.3],[.44,-.08],[.3,.12],[.2,.3],[.13,.45],[0,.5]].map(([a,b])=>[a*s,b*s]),Q(20)),m.gloss(FRUITS.birne),p);
      P(f,G.s(.2*s),m.gloss('#F2C46A'),[.12*s,-.22*s,.3*s],null,[1,1,.35]).userData.noOutline=true;break;
    case 'kirsche':f=P(g,G.s(.26*s),m.gloss(FRUITS.kirsche),p);P(f,G.s(.24*s),m.gloss(FRUITS.kirsche),[.34*s,-.1*s,.08*s]);
      P(f,G.tu([[0,.2*s,0],[.1*s,.55*s,0],[.2*s,.7*s,0]],.025*s),stem);P(f,G.tu([[.34*s,.16*s,.08*s],[.3*s,.5*s,.04*s],[.2*s,.7*s,0]],.025*s),stem);
      P(f,flatLeaf(leafShape(.34*s,.1*s),.03*s,.4),lf,[.2*s,.7*s,0],[0,-.4,.3]);f.name='frucht_kirsche';return f;
    case 'pfirsich':f=P(g,G.s(.5*s),m.tex('pfirsich',ctex('pfirsich',128,64,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);[[0,'#FFC49A'],[.12,'#FF8A7A'],[.3,'#FF8A7A'],[.5,'#FFC49A'],[1,'#FFD2A8']].forEach(([a,c])=>gr.addColorStop(a,c));x.fillStyle=gr;x.fillRect(0,0,w,h)}),{rim:.9,rimColor:'#ffffff'}),p,null,[1,.95,.95]);
      P(f,G.to(.47*s,.018*s,PI*.8),m.c('#F08A6A'),[0,0,0],[0,PI/2+.3,PI/2+.3]);break;
    case 'orange':f=P(g,G.s(.5*s),m.gloss(FRUITS.orange),p);P(f,G.s(.06*s),m.c('#7AA84A'),[0,.48*s,0]);break;
    case 'kokosnuss':f=P(g,G.s(.5*s),m.c(FRUITS.kokosnuss),p,null,[1,1.08,1]);range(3,(t,i)=>P(f,G.s(.07*s),m.c('#4A3024'),[Math.cos(i*2.1)*.12*s,.47*s,Math.sin(i*2.1)*.12*s]));f.name='frucht_kokosnuss';return f;
    default:f=P(g,G.la([[0,-.44],[.26,-.47],[.46,-.3],[.5,0],[.44,.28],[.22,.44],[.06,.36],[0,.34]].map(([a,b])=>[a*s,b*s]),Q(22)),m.gloss(FRUITS.apfel),p);
      P(f,G.s(.14*s),m.c('#FF8A8A'),[.2*s,.14*s,.33*s],null,[1,1,.4]).userData.noOutline=true;kind='apfel'}
  P(f,G.cy(.03*s,.04*s,.28*s),stem,[.02*s,.52*s,0],[0,0,-.2]);
  P(f,flatLeaf(leafShape(.34*s,.11*s),.035*s,.5),lf,[.05*s,.6*s,0],[0,-.5,.35]);
  f.name='frucht_'+kind;return f}

/* ======================= Bäume ======================= */
function oak(g,m,o,rnd,sc){sc=sc||1;const bark='#9C6B48';trunk(g,m,2.1*sc,.3*sc,bark);
  bt(g,[0,1.45*sc,0],[.75*sc,2.3*sc,.15*sc],.13*sc,m.c(bark),.08*sc);bt(g,[0,1.7*sc,0],[-.6*sc,2.5*sc,-.1*sc],.12*sc,m.c(bark),.07*sc);
  const L=o.color?[o.color,shade(o.color,1.12),shade(o.color,.9)]:['#6CB85A','#7FCB68','#5EA852'];const sd=rnd()*9;
  [[0,3.2,0,1.3,0],[.95,2.75,.25,.95,1],[-.95,2.85,-.05,1.0,2],[.15,2.65,.95,.85,1],[-.25,3.85,-.2,.85,1],[.35,2.8,-.9,.85,2]].forEach(([x,y,z,r,c],i)=>cloud(g,m,L[c],x*sc,y*sc,z*sc,r*sc,sd+i*1.7));
  // Eicheln
  if(o.eicheln!==false)range(3,(t,i)=>{const q=onBlob([0,3.1*sc,0],1.45*sc,1.1*sc,1.45*sc,1.5+i*.25,.9+i*1.1);const a=grp(g,q.p);P(a,G.s(.09*sc),m.gloss('#C98C5A'),[0,-.05*sc,0],null,[1,1.2,1]);P(a,G.hs(.1*sc),m.c('#8A6A44'),[0,-.02*sc,0])})}
function fruitTree(g,m,o,rnd,sc){sc=sc||1;const kind=o.fruit||'apfel';const bark='#A0704C';trunk(g,m,1.6*sc,.24*sc,bark);
  bt(g,[0,1.2*sc,0],[.5*sc,1.8*sc,.1*sc],.1*sc,m.c(bark),.06*sc);bt(g,[0,1.3*sc,0],[-.45*sc,1.9*sc,0],.09*sc,m.c(bark),.06*sc);
  const col=o.color||(kind==='orange'?'#4FA257':kind==='kirsche'?'#7ACB6A':kind==='pfirsich'?'#8BCB62':'#74C25E');const sd=rnd()*9;
  const C=[[0,2.5,0,1.05],[.75,2.2,.2,.75],[-.75,2.25,0,.78],[0,2.15,.7,.7]];C.forEach(([x,y,z,r],i)=>cloud(g,m,i%2?shade(col,1.1):col,x*sc,y*sc,z*sc,r*sc,sd+i*2.3));
  const n=o.count||(kind==='kirsche'?7:6);const fs=(kind==='kirsche'?.4:.36)*sc;
  for(let i=0;i<n;i++){const th=1.15+((i*.37)%1)*.7,ph=(i/n)*TAU+.4+RR(rnd,-.2,.2);const q=onBlob([0,2.35*sc,.1*sc],1.3*sc,.95*sc,1.3*sc,th,ph);
    const f=fruit(g,m,kind,[q.p[0],q.p[1]-fs*.3,q.p[2]],fs);g.userData.fruits.push(f)}}
function pine(g,m,o,rnd,sc){sc=sc||1;trunk(g,m,1.2*sc,.22*sc,'#8A5A3C');const col=o.color||'#3F9161';
  [[.85,1.45,1.6],[1.65,1.15,1.35],[2.35,.88,1.15],[2.95,.58,.95]].forEach(([y,r,h],i)=>{const geo=G.la([[0,0],[r*.82,-.02],[r,.07],[r*.96,.17],[r*.62,h*.45],[r*.26,h*.8],[0,h]].map(([a,b])=>[a*sc,b*sc]),Q(26));scallop(geo,9,.07*sc,.2*sc);P(g,geo,m.c(i%2?shade(col,1.12):col,{rim:.5,rimColor:'#e8ffd8'}),[0,y*sc,0],[0,i*.4,0])});
  if(o.zapfen!==false)range(3,(t,i)=>{const a=i*2.2+.5;P(g,G.ca(.07*sc,.08*sc),m.c('#A0704C'),[Math.cos(a)*1.05*sc,1.05*sc-(i%2)*.1,Math.sin(a)*1.05*sc])});
  P(g,G.star(.2*sc,.09*sc,5,.08*sc),m.gloss('#FFE27A'),[0,3.98*sc,0]).visible=!!o.stern}

N('eiche',{r:.45,h:4.8,shake:true,planet:'kompost'},(g,m,o,rnd)=>oak(g,m,o,rnd,o.s||1));
N('obstbaum',{r:.38,h:3.5,shake:true,planet:'kompost'},(g,m,o,rnd)=>fruitTree(g,m,o,rnd,o.s||1));
N('tanne',{r:.4,h:4.1,shake:true,grow:7,planet:'kompost'},(g,m,o,rnd)=>pine(g,m,o,rnd,o.s||1));
N('palme',{r:.35,h:4.8,shake:true,planet:'korallen'},(g,m,o,rnd)=>{const A=[0,0,0],B=[.1,2.2,0],C=[.85+RR(rnd,-.1,.1),4.2,.1];const bz=t=>A.map((a,k)=>(1-t)*(1-t)*a+2*(1-t)*t*B[k]+t*t*C[k]);
  const n=8;for(let i=0;i<n;i++){const a=bz(i/n),b=bz((i+1)/n);bt(g,a,b,.2-.06*i/n,m.c(i%2?'#B98A5E':'#C99A6A'),.25-.06*i/n)}P(g,G.s(.22),m.c('#A77A4E'),bz(0),null,[1.3,.4,1.3]);
  const col='#5DBB63';const fs=()=>{const L=2.5,W=.5,sh=new THREE.Shape();sh.moveTo(0,.07);const k=10;const w=t=>W*Math.sin(PI*Math.pow(t,.7))*(1-t*.25);for(let i=1;i<=k;i++){const t=i/k;sh.lineTo(L*t-.1,w(t)+.03);sh.lineTo(L*t,w(t)*.55)}
    for(let i=k;i>=1;i--){const t=i/k;sh.lineTo(L*t,-w(t)*.55);sh.lineTo(L*t-.1,-w(t)-.03)}sh.lineTo(0,-.07);return sh};
  const fsh=fs();range(9,(t,i)=>{P(g,flatLeaf(fsh,.06,.28),m.c(i%2?col:shade(col,1.15),{rim:.5,rimColor:'#f2ffc8'}),C,[0,i/9*TAU+.3,.62+(i%3)*.12])});
  P(g,G.s(.28),m.c('#7A9A4A'),C,null,[1,.7,1]);
  range(3,(t,i)=>{const a=i*2.1+.4;const f=fruit(g,m,'kokosnuss',[C[0]+Math.cos(a)*.28,C[1]-.3,C[2]+Math.sin(a)*.28],.44);g.userData.fruits.push(f)})});
N('baum',{r:.3,h:2.7,shake:true,grow:6,planet:'alle'},(g,m,o,rnd)=>{trunk(g,m,1.25,.17,'#A0704C');bt(g,[0,.9,0],[.35,1.3,.05],.07,m.c('#A0704C'),.05);const col=o.color||'#86CF66';const sd=rnd()*9;
  cloud(g,m,col,0,1.85,0,.78,sd);cloud(g,m,shade(col,1.1),.5,1.55,.25,.5,sd+2);cloud(g,m,shade(col,.92),-.45,1.6,-.1,.52,sd+4);
  if(o.fruit){range(4,(t,i)=>{const q=onBlob([0,1.75,0],.9,.75,.9,1.2+(i%2)*.4,i*1.6+.5);g.userData.fruits.push(fruit(g,m,o.fruit,q.p,.24))})}});
N('doppelbaum',{r:.5,h:3.8,shake:true,grow:9,planet:'alle'},(g,m,o,rnd)=>{const bark='#9A6A58',bm=m.c(bark);P(g,G.s(.5),bm,[0,0,0],null,[1.3,.5,1.2]);
  const t1=range(8,(t,i)=>[Math.sin(t*5)*.22-t*.55,t*2.4,Math.cos(t*5)*.22]),t2=range(8,(t,i)=>[-Math.sin(t*5)*.22+t*.6,t*2.3,-Math.cos(t*5)*.22]);
  P(g,G.tu(t1,.24,.12),bm);P(g,G.tu(t2,.24,.12),m.c('#8A6A7A'));
  const sd=rnd()*9;cloud(g,m,'#72C45E',-.75,2.9,0,.95,sd);cloud(g,m,'#8FD86E',-1.25,2.6,.3,.55,sd+1);
  const pk=P(g,G.blob(.85,.18,5,sd+3),m.c('#FF9EC8',{rim:.7,rimColor:'#fff0fa'}),[.8,2.85,0]);P(g,G.s(.45),m.c('#C6A9FF',{rim:.6}),[1.35,2.45,.25]);
  // Kulleraugen im Stamm (monströs-niedlich)
  eye(g,m,[-.12,1.35,.28],.1,[0,0,1]);eye(g,m,[.14,1.5,.26],.08,[0,0,1]);eye(g,m,[.35,2.0,.2],.06,[.3,0,1]);
  P(g,G.to(.07,.02,PI),m.c(PAL.ink),[0,1.18,.3],[0,0,PI]);
  range(3,(t,i)=>{const q=onBlob([-.75,2.8,0],1.,.9,1.,1.3+i*.2,i*1.9+.4);g.userData.fruits.push(fruit(g,m,'apfel',q.p,.26))});
  range(3,(t,i)=>{const q=onBlob([.8,2.8,0],.95,.95,.95,1.2+i*.25,i*1.8+1.2);const f=P(g,G.s(.12),m.glow(['#7FF7E8','#FFE27A','#FF8FB8'][i],2.2),q.p);f.name='frucht_leucht';g.userData.fruits.push(f)})});

/* ======================= Pilze ======================= */
function shroom(g,m,p,s,cap,o){o=o||{};const q=grp(g,p,o.rot);const stemM=m.c(o.stem||'#FFF1DA');
  P(q,G.la([[0,0],[.42,0],[.46,.18],[.37,.7],[.35,1.4],[.42,1.72],[0,1.72]].map(([a,b])=>[a*s*(o.thin||1),b*s*(o.tall||1)]),Q(16)),stemM);
  const top=1.72*(o.tall||1);const capM=o.capMat||m.c(cap,{gloss:.6,rim:.5});
  const geo=G.la([[0,top-.02],[.5,top],[1.12,top+.03],[1.27,top+.16],[1.22,top+.38],[.95,top+.7],[.5,top+.88],[0,top+.92]].map(([a,b])=>[a*s,b*s]),Q(28));if(o.wavy)scallop(geo,7,.05*s,(top+.2)*s);P(q,geo,capM);
  P(q,G.cy(1.1*s,1.1*s,.03*s),m.c(o.gill||'#F6DEC0'),[0,(top+.02)*s,0]);
  const dots=[];if(o.dots!==false){const n=o.nd||7;for(let i=0;i<n;i++){const th=i===0?0:.55+(i%2)*.35,ph=i*2.4;const n3=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];
    const d=P(q,G.s((i?.17:.22)*s),o.dotMat||m.c('#FFFBF0'),[n3[0]*1.18*s,(top+.18+n3[1]*.72)*s,n3[2]*1.18*s],null,[1,1,.32]);orient(d,[n3[0],n3[1]*1.4,n3[2]]);dots.push(d)}}
  return{q,dots,top:(top+.92)*s}}
N('riesenpilz',{r:.5,h:2.7,planet:'kompost'},(g,m,o,rnd)=>{const cap=o.color||RP(rnd,['#E8505B','#E8505B','#C98CF0','#F08A3C']);shroom(g,m,[0,0,0],1,cap,{});
  shroom(g,m,[.9,0,.5],.32,cap,{nd:4});P(g,G.s(.2),m.c('#7CC46A'),[-.5,0,.3],null,[1.4,.5,1.2])});
N('pilz',{r:.2,h:.55,grow:3,planet:'alle'},(g,m,o,rnd)=>{const cap=o.color||RP(rnd,['#C8783E','#E8505B','#B07A4A']);shroom(g,m,[0,0,0],.26,cap,{tall:.9,nd:5,dots:cap==='#E8505B'});shroom(g,m,[.25,0,.12],.13,cap,{nd:3,dots:cap==='#E8505B',rot:[0,0,-.2]})});
function glowShroomCluster(g,m,o,rnd,s){const col=o.color||'#7FF7E8';const cm=m.c(col,{emissive:shade(col,.7),emissiveIntensity:.5,rim:1.1,rimColor:'#ffffff',gloss:.8});const dm=m.glow('#FFFBF0',2);
  [[0,0,0,1,0],[.34*s,0,.18*s,.62,.25],[-.28*s,0,.22*s,.5,-.3],[.05*s,0,-.3*s,.45,.15]].forEach(([x,y,z,k,t],i)=>{const r=shroom(g,m,[x,y,z],.2*s*k,col,{capMat:cm,dotMat:dm,stem:'#D9CCFF',gill:'#5FC8C0',tall:1.15,nd:5,rot:[0,i,t]});markGlow(g,r.q.children[1])});
  range(5,(t,i)=>markGlow(g,P(g,G.s(.028*s),m.glow(i%2?'#7FF7E8':'#E6DCFF',2.2),[Math.cos(i*1.7)*.42*s,.2*s+i*.07*s,Math.sin(i*1.7)*.38*s])));P(g,G.blob(.3*s,.12,2,4),m.c('#8D80A8'),[0,0,0],null,[1.6,.25,1.4])}
N('glühpilz',{r:.3,h:.75,planet:'schrott'},(g,m,o,rnd)=>glowShroomCluster(g,m,o,rnd,1));
Object.defineProperty(NATURE,'gluehpilz',{get:()=>NATURE['glühpilz'],enumerable:false});

/* ======================= Schrott-Mond-Bäume ======================= */
N('kristallbaum',{r:.4,h:4.4,shake:true,planet:'schrott'},(g,m,o,rnd)=>{const cols=o.color?[o.color,shade(o.color,1.15),shade(o.color,.85)]:['#C6A9FF','#9EE6FF','#FFB8E6'];
  P(g,G.blob(.6,.12,3,2),m.c('#8D80A8'),[0,.05,0],null,[1.2,.45,1.1]);
  const tr=P(g,crysGeo(.42,2.2),crysMat(m,'#7A6AA8'),[0,0,0]);tr.rotation.y=.3;
  crystal(g,m,[0,1.2,0],[.75,1,.1],.18,1.1,'#8A7AB8');crystal(g,m,[0,1.45,0],[-.65,1,.35],.16,1.0,'#8A7AB8');crystal(g,m,[.1,.2,.1],[.6,.5,.5],.14,.6,'#9EE6FF');
  const C=[0,2.35,0];const core=P(g,G.ico(.6,1),m.glow('#E6DCFF',1.6),C);markGlow(g,core);
  for(let i=0;i<16;i++){const th=i===0?0:.35+((i*.618)%1)*1.5,ph=i*2.39+rnd()*.3;const d=[Math.sin(th)*Math.cos(ph),Math.cos(th)*.8+.15,Math.sin(th)*Math.sin(ph)];
    const L=RR(rnd,1.2,1.75)*(i===0?1.2:1);crystal(g,m,[C[0]+d[0]*.2,C[1]+d[1]*.2-.15,C[2]+d[2]*.2],d,RR(rnd,.26,.36),L,cols[i%3])}
  range(3,(t,i)=>{const ph=i*2.1+.6;const f=P(g,G.oct(.14),m.glow(['#7FF7E8','#FFB8E6','#FFE27A'][i],2),[Math.cos(ph)*1.35,1.8,Math.sin(ph)*1.25]);f.name='frucht_kristall';g.userData.fruits.push(f)})});
N('antennenbaum',{r:.4,h:4.6,shake:true,planet:'schrott'},(g,m,o,rnd)=>{const pipe=m.c('#9C93BC',{gloss:.7});
  P(g,G.bx(.8,.36,.8,.14),m.c('#7E7299',{gloss:.4}),[0,.18,0]);range(4,(t,i)=>P(g,G.s(.045),m.steel(),[Math.cos(i*PI/2+PI/4)*.33,.36,Math.sin(i*PI/2+PI/4)*.33]));
  P(g,G.cy(.16,.24,2.9),pipe,[0,1.75,0]);[.7,1.5,2.3,3.1].forEach(y=>P(g,G.to(.21-y*.02,.05),m.steel(),[0,y,0],[PI/2,0,0]));
  ['#FF7E6B','#FFE27A'].forEach((c,k)=>P(g,G.tu(range(12,(t)=>{const a=t*TAU*1.5+k*PI;const rr=.26-t*.06;return[Math.cos(a)*rr,.4+t*2.6,Math.sin(a)*rr]}),.055),m.c(c,{gloss:.8})));
  const ends=[];[[2.2,0,'#FFFBF0'],[2.6,2.2,'#FF8FB8'],[3.0,4.2,'#A6EBC3']].forEach(([y,a,c],i)=>{const d=[Math.cos(a),0,Math.sin(a)];const e=[d[0]*1.15,y+.55,d[2]*1.15];
    P(g,G.tu([[0,y,0],[d[0]*.6,y+.08,d[2]*.6],e],.1,.07),pipe);const dish=grp(g,e);orient(dish,[d[0],1.1,d[2]],up);
    P(dish,G.la([[0,0],[.5,.17],[.56,.23],[.46,.2],[0,.07]],Q(22)),m.c(c,{gloss:.9}));bt(dish,[0,.05,0],[0,.45,0],.03,m.steel());P(dish,G.s(.07),m.c('#FF7E6B',{gloss:1}),[0,.47,0]);ends.push(e)});
  bt(g,[0,3.2,0],[0,4.35,0],.045,m.steel());[3.55,3.8,4.05].forEach((y,i)=>{const w=.5-i*.13;bt(g,[-w,y,0],[w,y,0],.03,m.steel());both(x=>P(g,G.s(.05),m.c('#C6A9FF',{gloss:1}),[x*w,y,0]))});
  markBlink(g,P(g,G.s(.1),m.glow('#FF5A6A',2.4),[0,4.42,0]));
  const a=ends[0],b=ends[1];const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2-.7,(a[2]+b[2])/2];P(g,G.tu([a,mid,b],.022),m.c('#4A4458'));
  range(3,(t,i)=>{const q=[a[0]+(b[0]-a[0])*(.25+t*.5),0,a[2]+(b[2]-a[2])*(.25+t*.5)];q[1]=(a[1]+b[1])/2-.7*(1-Math.pow(2*(.25+t*.5)-1,2))-.12;const l=P(g,G.s(.08),m.glow(['#7FF7E8','#FFE27A','#B7F77F'][i],2),q);l.name='frucht_led';g.userData.fruits.push(l)})});
/* ======================= Büsche, Blumen, Gras ======================= */
function bush(g,m,col,s,rnd){const sd=rnd()*9;[[0,.5,0,.55],[.45,.38,.1,.42],[-.45,.4,0,.44],[.05,.35,.4,.38],[0,.8,-.1,.36]].forEach(([x,y,z,r],i)=>cloud(g,m,i%2?shade(col,1.1):col,x*s,y*s,z*s,r*s,sd+i*1.3))}
N('busch',{r:.55,h:1.05,shake:true,planet:'kompost'},(g,m,o,rnd)=>{bush(g,m,o.color||'#5FAE55',1,rnd);if(o.beeren!==false)range(6,(t,i)=>{const q=onBlob([0,.5,0],.72,.55,.66,1.0+(i%3)*.3,i*1.05+.3);const b=P(g,G.s(.065),m.gloss(o.beere||'#E84D6A'),q.p);b.name='frucht_beere';g.userData.fruits.push(b)})});
function blossom(g,m,col,p,s,n,dir){const f=grp(g,p);if(dir)orient(f,dir);P(f,G.puff(flowerShape(n||5,.5*s,.16*s),.08*s),m.c(col,{rim:.6,rimColor:'#ffffff'}));P(f,G.s(.15*s),m.gloss('#FFD65A'),[0,0,.08*s],null,[1,1,.6]);return f}
N('blumenbusch',{r:.5,h:1.0,shake:true,planet:'kompost'},(g,m,o,rnd)=>{const col=o.color||RP(rnd,['#FF8FB8','#FFFBF0','#C6A9FF','#FFE27A','#FF7E6B']);bush(g,m,'#5FA652',.85,rnd);
  for(let i=0;i<9;i++){const q=onBlob([0,.45,0],.66,.52,.6,.35+((i*.53)%1)*1.1,i*2.4+rnd()*.3);blossom(g,m,col,q.p,.3,5,q.n)}});
function flower(g,m,kind,col,s,rnd){const stemM=m.c('#6CBF5A');const H=.42*s;P(g,G.tu([[0,0,0],[.03*s,H*.5,0],[0,H,.02*s]],.024*s),stemM);
  both(x=>P(g,flatLeaf(leafShape(.22*s,.07*s),.025*s,.8),stemM,[0,.05*s,0],[0,x>0?.3:PI+.3,-.5]));
  const hd=grp(g,[0,H,.02*s],[.35,0,0]);
  if(kind==='tulpe'){P(hd,G.la([[0,-.02],[.09,.0],[.13,.08],[.12,.17],[.0,.2]].map(([a,b])=>[a*s,b*s]),Q(18)),m.c(col,{gloss:.5,rim:.5}));
    range(3,(t,i)=>{const a=i/3*TAU;const pt=grp(hd,[Math.cos(a)*.07*s,.03*s,Math.sin(a)*.07*s],[0,-a+PI/2,0]);P(pt,G.puff(leafShape(.23*s,.075*s),.03*s),m.c(shade(col,1.1),{rim:.5}),[0,0,0],[0,0,PI/2-.12])})}
  else if(kind==='rose'){P(hd,G.s(.12*s),m.c(col,{rim:.5}),[0,.08*s,0],null,[1,.85,1]);
    P(hd,G.tu(range(20,(t)=>{const a=t*TAU*2.3;const r=(.02+t*.1)*s;return[Math.cos(a)*r,.17*s-t*.06*s,Math.sin(a)*r]}),.022*s),m.c(shade(col,.78)));
    range(5,(t,i)=>{const a=i/5*TAU;const pt=grp(hd,[Math.cos(a)*.1*s,.05*s,Math.sin(a)*.1*s],[0,-a+PI/2,0]);P(pt,G.puff(sshp([[0,-.05],[.12,-.04],[.14,.06],[0,.08]].map(([a,b])=>[a*s,b*s])),.025*s),m.c(col),[0,0,0],[0,0,.5])});
    P(hd,G.puff(flowerShape(5,.1*s,.03*s,true),.02*s),stemM,[0,-.02*s,0],[PI/2,0,0])}
  else{const cfg={gaensebluemchen:[14,.19,.05,false,'#FFD65A'],kosmee:[8,.2,.05,false,'#FFC83A'],lilie:[6,.24,.05,true,'#FF9E45']}[kind]||[5,.18,.05,false,'#FFD65A'];
    const f=grp(hd,[0,.02*s,0],[-PI/2,0,0]);P(f,G.puff(flowerShape(cfg[0],cfg[1]*s,cfg[2]*s,cfg[3]),.035*s),m.c(col,{rim:.6,rimColor:'#ffffff'}));
    if(kind==='kosmee')P(f,G.puff(flowerShape(8,.12*s,.04*s),.03*s),m.c(shade(col,.85)),[0,0,.02*s],[0,0,.2]);
    if(kind==='lilie')range(5,(t,i)=>{const a=i/5*TAU;bt(f,[0,0,0],[Math.cos(a)*.07*s,Math.sin(a)*.07*s,.12*s],.008*s,m.c('#7CC46A'));P(f,G.s(.018*s),m.c('#C8603A'),[Math.cos(a)*.07*s,Math.sin(a)*.07*s,.12*s])});
    else P(f,G.s(.065*s),m.gloss(cfg[4]),[0,0,.03*s],null,[1,1,.55])}}
const FLOWER_COL={tulpe:['#F0556E','#FFE27A','#FF8FB8','#FF9E45'],rose:['#D94257','#FF8FB8','#FFFBF0','#FFE27A'],gaensebluemchen:['#FFFDF7'],kosmee:['#FF8FB8','#F2789A','#FFFBF0','#C6A9FF'],lilie:['#FFFBF0','#FFB27A','#FF8FB8']};
N('blume',{r:.12,h:.5,grow:2.5,planet:'alle'},(g,m,o,rnd)=>{const kind=o.kind||RP(rnd,['tulpe','rose','gaensebluemchen','kosmee','lilie']);const col=o.color||RP(rnd,FLOWER_COL[kind]||FLOWER_COL.tulpe);flower(g,m,kind,col,1,rnd)});
N('grasbuesche',{r:.2,h:.45,planet:'kompost'},(g,m,o,rnd)=>{const col=o.color||'#8FD36B';[[0,0,1],[.28,.12,.7],[-.22,.18,.6]].forEach(([x,z,s],k)=>{const n=k?5:7;for(let i=0;i<n;i++){const a=i/n*TAU+rnd();const t=.25+rnd()*.35;
  const h=(.32+rnd()*.14)*s,d=[Math.cos(a)*t,1,Math.sin(a)*t];const L=Math.hypot(...d);const b=P(g,G.co(.07*s,h),m.c(i%2?col:shade(col,.88),{rim:.5,rimColor:'#f4ffc8'}),[x+d[0]/L*h*.5,d[1]/L*h*.5,z+d[2]/L*h*.5],null,[1,1,.5]);orient(b,d,up)}})});

/* ======================= Steine ======================= */
N('stein',{r:.25,h:.3,planet:'alle'},(g,m,o,rnd)=>{const c=ROCK[o.planet||'kompost'];P(g,G.blob(.26,.1,2,rnd()*9),m.c(c[0],{gloss:.3}),[0,.14,0],[0,rnd()*3,0],[1.2,.62,1]);P(g,G.blob(.12,.1,2,rnd()*9),m.c(c[1]),[.28,.07,.1],null,[1.1,.7,1])});
N('felsen',{r:.95,h:1.6,planet:'alle'},(g,m,o,rnd)=>{const pl=o.planet||'kompost',c=ROCK[pl];const sd=rnd()*9;
  P(g,G.blob(.9,.1,2.2,sd),m.c(c[0],{gloss:.2}),[0,.6,0],null,[1.2,.9,1]);P(g,G.blob(.55,.12,2.5,sd+2),m.c(c[1]),[.85,.35,.35],null,[1,.8,1]);P(g,G.blob(.38,.12,2.5,sd+4),m.c(c[0]),[-.8,.25,.45],null,[1,.75,1]);
  if(pl==='kompost'){P(g,G.blob(.72,.12,3,sd+1),m.c('#7CC46A',{rim:.6,rimColor:'#f4ffc8'}),[-.1,1.28,-.05],null,[1.05,.3,.95]);P(g,G.blob(.3,.12,3,sd+3),m.c('#8FD36B'),[.85,.68,.35],null,[1,.35,1])}
  else if(pl==='schrott'){range(3,(t,i)=>crystal(g,m,[.4+i*.2,.9-i*.15,.4],[.5,1,.6],.1,.45-i*.08,['#9EE6FF','#C6A9FF','#FFB8E6'][i]))}
  else{range(5,(t,i)=>{const q=onBlob([0,.6,0],1.08,.81,.9,.7+i*.15,i*1.3+.2);const b=P(g,G.co(.09,.12),m.c('#FFFBF0'),q.p);orient(b,q.n,up)});P(g,G.star(.18,.08,5,.07),m.gloss('#FF8A5A'),[.2,.95,.8],[-.6,0,.4])}});
N('kristallfels',{r:.8,h:1.6,planet:'schrott'},(g,m,o,rnd)=>{const sd=rnd()*9;P(g,G.blob(.75,.12,2.4,sd),m.c('#A99BC2',{gloss:.2}),[0,.4,0],null,[1.2,.65,1]);P(g,G.blob(.4,.12,2.4,sd+3),m.c('#8D80A8'),[.7,.2,.3],null,[1,.7,1]);
  const cols=o.color?[o.color,shade(o.color,1.2)]:['#9EE6FF','#C6A9FF','#FFB8E6','#7FF7E8'];
  [[0,.6,0,[0,1,0],.22,1.1],[-.35,.5,.2,[-.5,1,.3],.17,.8],[.35,.45,.1,[.6,1,.2],.16,.75],[.1,.4,.45,[.2,.7,1],.14,.6],[-.25,.45,-.35,[-.3,1,-.6],.15,.7],[.6,.3,.5,[.4,1,.6],.1,.45]].forEach(([x,y,z,d,r,h],i)=>crystal(g,m,[x,y,z],d,r,h,cols[i%cols.length]));
  markGlow(g,P(g,G.s(.2),m.glow('#E6FFFF',1.4),[0,.55,.2]))});

/* ======================= Schrotthaufen ======================= */
N('schrotthaufen',{r:1.0,h:1.7,planet:'schrott'},(g,m,o,rnd)=>{const sd=rnd()*9;P(g,G.blob(.85,.1,2.5,sd),m.c('#9A8FAE'),[0,.12,0],null,[1.3,.6,1.1]);
  P(g,G.to(.36,.15),m.rubber(),[-.62,.62,.3],[.3,.4,.5]);P(g,G.cy(.22,.22,.1),m.steel(),[-.62,.62,.3],[PI/2+.3,.4,.5]);
  P(g,G.puff(gearShape(.42,9,.1),.12),m.c('#E0A060',{gloss:.6}),[.62,.66,.3],[-.3,-.4,.2]);
  const tv=grp(g,[.02,.95,-.1],[-.1,.3,.08]);P(tv,G.bx(.8,.62,.6,.14),m.c('#C6A9FF',{gloss:.6}));
  P(tv,G.bx(.56,.4,.05,.06),m.tex('tvface',ctex('tvface',128,96,(x,w,h)=>{x.fillStyle='#2E3A5E';x.fillRect(0,0,w,h);x.fillStyle='#7FF7E8';x.beginPath();x.arc(44,40,8,0,TAU);x.arc(84,40,8,0,TAU);x.fill();x.strokeStyle='#7FF7E8';x.lineWidth=6;x.beginPath();x.arc(64,52,18,.3,PI-.3);x.stroke()}),{emissive:'#223',gloss:1}),[0,0,.3]);
  both(s=>{bt(tv,[s*.1,.3,0],[s*.3,.62,0],.018,m.steel());P(tv,G.s(.04),m.c('#FF7E6B'),[s*.3,.62,0])});
  P(g,G.cy(.15,.15,.4),m.gloss('#F0556E'),[.85,.3,-.35],[0,0,PI/2-.2]);P(g,G.cy(.155,.155,.06),m.steel(),[1.04,.34,-.35],[0,0,PI/2-.2]);
  bt(g,[-1.0,.3,-.2],[-.25,1.05,-.55],.09,m.c('#8FD3FF',{gloss:.6}));bt(g,[.3,.25,.8],[1.0,.6,.35],.08,m.c('#FFE27A',{gloss:.6}));
  P(g,G.tu(range(16,(t)=>{const a=t*TAU*4;return[1.0+Math.cos(a)*.12,.3+t*.4,.3+Math.sin(a)*.12]}),.03),m.steel());
  P(g,G.bx(.5,.3,.36,.07),m.c('#FFFBF0',{gloss:.4}),[-.45,.4,-.6],[0,.5,.1]);P(g,G.bx(.34,.06,.24,.02),m.c('#5FAE55'),[-.2,.5,.62],[.2,.3,.1]);
  range(3,(t,i)=>markGlow(g,P(g,G.s(.05),m.glow(['#7FF7E8','#FF8FB8','#B7F77F'][i],2.2),[-.3+i*.3,.66+(i%2)*.1,.55])))});
/* ======================= Korallen & Meer ======================= */
function coralBranch(g,m,col,s,rnd,p){const cm=m.c(col,{rim:.7,rimColor:'#fff0e8'});const q=grp(g,p);
  const tips=[[0,1,0],[.5,.9,.1],[-.45,.85,.2],[.15,.8,-.5],[-.1,.75,.55]];
  tips.forEach((d,i)=>{const L=(i?.55:.75)*s;const mid=[d[0]*L*.4,L*.55,d[2]*L*.4],e=[d[0]*L,L*d[1]*1.05+.1*s,d[2]*L];P(q,G.tu([[0,0,0],mid,e],.1*s,.07*s),cm);P(q,G.s(.075*s),cm,e);
    if(i&&i<3){const e2=[e[0]+d[0]*.18*s,e[1]+.18*s,e[2]-.12*s];P(q,G.tu([mid.map((v,k)=>(v+e[k])/2),e2],.06*s,.055*s),cm);P(q,G.s(.058*s),cm,e2)}})}
function coralCluster(g,m,o,rnd,s){const pal=['#FF7E6B','#FF8FB8','#C6A9FF','#FFB27A','#7FDCE6'];const c1=o.color||RP(rnd,pal);
  P(g,G.blob(.45*s,.12,2.5,rnd()*9),m.c('#E8D2B0'),[0,.02,0],null,[1.3,.3,1.1]);
  coralBranch(g,m,c1,s,rnd,[-.1*s,.05*s,0]);
  P(g,G.blob(.26*s,.07,9,rnd()*9),m.c(c1===pal[3]?'#C6A9FF':'#FFD65A',{rim:.5}),[.42*s,.18*s,.18*s],null,[1,.8,1]);
  range(3,(t,i)=>{const x=-.42*s+i*.14*s,z=.3*s-i*.05*s,h=(.3+i*.08)*s;P(g,G.la([[0,0],[.06*s,0],[.07*s,h*.6],[.085*s,h],[.06*s,h],[.05*s,h*.4],[0,h*.4]],Q(14)),m.c('#9E7BE0',{rim:.6}),[x,.02,z],[.1*(i-1),0,.15*(1-i)])});
  coralBranch(g,m,c1===pal[1]?'#FFB27A':'#FF8FB8',s*.6,rnd,[.3*s,.03,-.3*s])}
N('koralle',{r:.5,h:1.1,grow:5,planet:'korallen'},(g,m,o,rnd)=>coralCluster(g,m,o,rnd,o.s||1));
N('seerose',{r:.45,h:.25,water:true,planet:'kompost'},(g,m,o,rnd)=>{const pad=(r)=>{const s=new THREE.Shape();s.moveTo(0,0);s.absarc(0,0,r,.25,TAU-.25,false);s.lineTo(0,0);return s};
  P(g,G.puff(pad(.42),.03),m.c('#5FAE55',{rim:.5}),[0,.015,0],[-PI/2,0,rnd()*3]);P(g,G.puff(pad(.24),.03),m.c('#74C25E'),[.55,.012,.28],[-PI/2,0,2]);
  const col=o.color||'#FF9EC8';const f=grp(g,[-.02,.05,.03]);P(f,G.puff(flowerShape(8,.28,.07,true),.05),m.c(col,{rim:.7,rimColor:'#ffffff'}),[0,0,0],[-PI/2,0,0]);
  const f2=P(f,G.puff(flowerShape(8,.2,.05,true),.05),m.c(shade(col,1.1),{rim:.7}),[0,.06,0],[-PI/2+.0,0,.4]);f2.scale.z=1.8;
  P(f,G.puff(flowerShape(6,.12,.04,true),.04),m.c(shade(col,1.2),{rim:.7}),[0,.13,0],[-PI/2,0,.2],[1,1,2]);P(f,G.s(.06),m.gloss('#FFD65A'),[0,.15,0],null,[1,.6,1])});
N('schilf',{r:.3,h:1.6,planet:'kompost'},(g,m,o,rnd)=>{const cols=['#6FAE55','#86C667','#5E9B4A'];for(let i=0;i<8;i++){const a=i*2.4+rnd(),rr=.05+rnd()*.18;const x=Math.cos(a)*rr,z=Math.sin(a)*rr;const h=1.0+rnd()*.55;const lean=RR(rnd,-.18,.18);
    const top=[x+lean,h,z+lean*.5];P(g,G.tu([[x,0,z],[x+lean*.3,h*.5,z],top],.03,.018),m.c(cols[i%3]));
    if(i%3===0){P(g,G.ca(.055,.2),m.c('#8A5A44'),[top[0],top[1]-.1,top[2]],[lean*.5,0,-lean*.8]);bt(g,[top[0],top[1]+.02,top[2]],[top[0]+lean*.2,top[1]+.14,top[2]],.012,m.c('#6FAE55'))}}
  range(4,(t,i)=>{const a=i*1.7;P(g,G.co(.05,.7),m.c('#7CC46A'),[Math.cos(a)*.15,.3,Math.sin(a)*.15],[Math.sin(a)*.3,0,-Math.cos(a)*.3],[1,1,.4])})});
N('treibholz',{r:.6,h:.35,planet:'korallen'},(g,m,o,rnd)=>{const wm=m.c('#DCCDB8',{rim:.5});const L=[[-.6,.14,0],[-.1,.17,.05],[.35,.15,-.05],[.65,.12,0]];P(g,G.tu(L,.15,.09),wm);P(g,G.s(.15),wm,L[0]);P(g,G.s(.09),wm,L[3]);
  P(g,G.tu([[-.05,.2,.05],[.1,.35,.25],[.2,.42,.35]],.05,.03),wm);P(g,G.tu([[.3,.18,-.05],[.45,.26,-.3]],.045,.03),wm);P(g,G.to(.08,.025),m.c('#C4B39C'),[-.6,.14,.02],[0,PI/2,0]);
  P(g,G.star(.13,.06,5,.06),m.gloss('#FF8A5A'),[.1,.28,.08],[-1.2,0,.3]);P(g,G.s(.05),m.c('#6CBF5A'),[.62,.24,.05],null,[1.6,.5,1])});
function stump(g,m,s,rnd){const bark='#9C6B48';P(g,G.la([[0,0],[.52,0],[.42,.08],[.36,.2],[.35,.45],[0,.45]].map(([a,b])=>[a*s,b*s]),Q(20)),m.c(bark));
  P(g,G.cy(.34*s,.34*s,.04*s),m.tex('stumpf-ringe',ctex('ringe',128,128,(x,w,h)=>{x.fillStyle='#F2D2A0';x.fillRect(0,0,w,h);x.strokeStyle='#D8A870';x.lineWidth=4;for(let r=10;r<64;r+=12){x.beginPath();x.arc(64,64,r,0,TAU);x.stroke()}x.fillStyle='#C98C5A';x.beginPath();x.arc(64,64,5,0,TAU);x.fill()})),[0,.46*s,0]);
  range(4,(t,i)=>{const a=i*PI/2+.4;P(g,G.ca(.08*s,.28*s),m.c(bark),[Math.cos(a)*.42*s,.05*s,Math.sin(a)*.42*s],[0,-a,PI/2-.25])});
  shroom(g,m,[.3*s,.12*s,.25*s],.08*s,'#E8A060',{nd:0,dots:false,rot:[.4,0,-.5]});P(g,G.s(.14*s),m.c('#7CC46A'),[-.2*s,.46*s,-.1*s],null,[1.3,.35,1])}
N('baumstumpf',{r:.4,h:.5,planet:'kompost'},(g,m,o,rnd)=>stump(g,m,1,rnd));
N('stumpf',{r:.35,h:.4,grow:2,planet:'alle'},(g,m,o,rnd)=>stump(g,m,.85,rnd));
N('muschel_deko',{r:.5,h:.75,planet:'korallen'},(g,m,o,rnd)=>{const col=o.color||'#FFB8A8';const geo=clamGeo(.62,1.15,12,.2,.08,.012,.06);
  const sh=grp(g,[0,.08,-.05],[-.55,0,0]);P(sh,geo,shellMat(m,col,12));
  P(sh,G.puff(sshp([[-.2,-.02],[.2,-.02],[.13,.13],[-.13,.13]]),.08),m.c(shade(col,.92)),[0,-.02,0]);
  P(g,G.s(.1),m.pearl(),[.3,.1,.35]);spiralShell(g,m,'#F2C49A',.32,[-.45,.1,.3],[-.3,.9,0]);P(g,G.star(.12,.05,5,.05),m.gloss('#FF8A5A'),[.5,.03,-.1],[-PI/2,0,.2]);
  P(g,G.blob(.4,.1,2,3),m.c('#F2D9A6'),[0,0,0],null,[1.8,.18,1.4])});
N('felsbogen',{r:.6,h:3.3,cols:[[-1.4,0,.8],[1.4,0,.8]],planet:'korallen'},(g,m,o,rnd)=>{const c=o.planet==='schrott'?ROCK.schrott:o.planet==='kompost'?ROCK.kompost:ROCK.korallen;const sd=rnd()*9;
  const arc=t=>{const a=PI-t*PI;return[Math.cos(a)*1.4,Math.sin(a)*2.5+.05,Math.sin(t*TAU)*.06]};
  P(g,G.tu(range(9,arc),.5,.5),m.c(c[1]));
  range(9,(t,i)=>{const p=arc(t);const r=(i===0||i===8)?.85:.62+.08*Math.sin(i*2.3);P(g,G.blob(r,.12,2.4,sd+i*1.3),m.c(i%2?c[1]:c[0],{gloss:.15}),[p[0]*(i===0||i===8?1.02:1),p[1]*(i===0||i===8?.5:1),p[2]],[0,i,0],[1,.85,1])});
  P(g,G.blob(.6,.12,3,sd+5),m.c(o.planet==='schrott'?'#7FE8E0':'#7CC46A',{rim:.6}),[0,3.08,0],null,[1.3,.32,.95]);
  range(3,(t,i)=>P(g,G.co(.08,.35),m.c('#8FD36B'),[-.2+i*.2,3.3,0],[0,0,(i-1)*.3],[1,1,.5]));
  P(g,G.blob(.28,.12,2.3,sd+4),m.c(c[1]),[-2.15,.14,.55],null,[1,.6,1]);P(g,G.blob(.2,.12,2.3,sd+6),m.c(c[0]),[2.05,.1,.7],null,[1,.6,1]);
  P(g,G.star(.18,.08,5,.07),m.gloss('#FF8A5A'),[1.35,.9,.75],[-.3,0,.4]);range(3,(t,i)=>P(g,G.co(.07,.1),m.c('#FFFBF0'),[-1.4+i*.16,.7+i*.12,.8-i*.05],[.8,0,0]))});
N('kaktus',{r:.35,h:1.9,planet:'korallen'},(g,m,o,rnd)=>{const cm=m.c('#5FB36A',{rim:.6,rimColor:'#e8ffd0'});const rib=G.la([[0,0],...range(12,(t)=>{const y=t*1.6;const r=y<1.3?.3:.3*Math.sqrt(Math.max(0,1-Math.pow((y-1.3)/.3,2)));return[Math.max(1e-3,r),y]})],Q(24));
  const p=rib.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(x,z),k=1+.07*Math.cos(a*8);p.setX(i,x*k);p.setZ(i,z*k)}rib.computeVertexNormals();P(g,rib,cm);
  both(s=>{const y=s>0?.7:.95,h=s>0?.45:.35;P(g,G.tu([[0,y,0],[s*.38,y,0],[s*.48,y+.1,0],[s*.48,y+h,0]],.13,.12),cm);P(g,G.s(.12),cm,[s*.48,y+h,0])});
  for(let i=0;i<16;i++){const a=i*2.4,y=.2+(i*.083)%1.15;P(g,G.s(.022),m.c('#FFFBF0'),[Math.sin(a)*.31,y,Math.cos(a)*.31])}
  blossom(g,m,'#FF8FB8',[.02,1.6,.05],.35,6,[0,1,.3]);P(g,G.blob(.35,.1,2,3),m.c('#E8D2B0'),[0,0,0],null,[1.3,.25,1.3])});
/* ======================= Öko-Requisiten (Fähigkeiten) ======================= */
N('kristall',{r:.3,h:.95,grow:4,planet:'alle'},(g,m,o,rnd)=>{const cols=o.color?[o.color,shade(o.color,1.2),shade(o.color,.85)]:['#C6A9FF','#9EE6FF','#FFB8E6'];
  P(g,G.blob(.3,.12,2.4,rnd()*9),m.c('#A99BC2'),[0,.06,0],null,[1.3,.4,1.1]);
  [[0,.05,0,[0,1,0],.15,.85],[.14,.05,.05,[.6,1,.2],.11,.55],[-.14,.05,.06,[-.6,1,.3],.1,.5],[.02,.05,-.12,[.1,1,-.6],.09,.45],[.05,.05,.16,[.2,.8,1],.07,.3]].forEach(([x,y,z,d,r,h],i)=>crystal(g,m,[x,y,z],d,r,h,cols[i%3]));
  markGlow(g,P(g,G.s(.07),m.glow('#F0E8FF',1.8),[0,.18,.12]))});
N('schrott',{r:.35,h:.35,grow:2,planet:'alle'},(g,m,o,rnd)=>{const pcb=grp(g,[0,.1,0],[-.12,.3,.08]);
  const tx=ctex('pcb',256,160,(x,w,h)=>{x.fillStyle='#3FA66A';x.fillRect(0,0,w,h);x.strokeStyle='#F7D27A';x.lineWidth=4;x.lineCap='round';const r=srand(11);for(let i=0;i<16;i++){x.beginPath();let px=r()*w,py=r()*h;x.moveTo(px,py);for(let k=0;k<3;k++){if(k%2)px+=(r()-.5)*120;else py+=(r()-.5)*90;x.lineTo(px,py)}x.stroke();x.fillStyle='#F7D27A';x.beginPath();x.arc(px,py,6,0,TAU);x.fill()}});
  P(pcb,G.bx(.7,.05,.48,.02),m.tex('pcb',tx,{gloss:.5}));
  P(pcb,G.bx(.2,.06,.2,.02),m.c(PAL.ink,{gloss:.6}),[-.12,.05,-.05]);range(4,(t,i)=>both(s=>P(pcb,G.bx(.03,.02,.04,.008),m.steel(),[-.12+(t-.5)*.15,.03,-.05+s*.12])));
  P(pcb,G.bx(.12,.05,.08,.02),m.c(PAL.ink),[.16,.04,.14]);
  [[.2,-.1,'#6AA8F0'],[.28,.06,'#F0556E']].forEach(([x,z,c])=>{P(pcb,G.cy(.045,.045,.13),m.gloss(c),[x,.09,z]);P(pcb,G.cy(.046,.046,.012),m.steel(),[x,.157,z])});
  P(pcb,G.ca(.025,.08),m.c('#F2D9A6'),[-.22,.05,.15],[0,0,PI/2]);range(3,(t,i)=>P(pcb,G.to(.027,.008),m.c(['#D94257','#FF9E45','#8E6BD1'][i]),[-.25+i*.03,.05,.15],[0,PI/2,0]));
  range(3,(t,i)=>markGlow(g,P(pcb,G.s(.035),m.glow(['#FF5A6A','#7FF7E8','#B7F77F'][i],2.4),[.04+i*.09,.06,-.17])));
  P(g,G.tu([[-.3,.08,-.1],[-.45,.05,.1],[-.35,.03,.3],[-.1,.02,.35]],.03),m.c('#FF7E6B',{gloss:.7}));P(g,G.bx(.08,.06,.1,.02),m.steel(),[-.1,.03,.35],[0,1.5,0])});
N('huette',{r:.9,h:1.95,grow:8,planet:'alle'},(g,m,o,rnd)=>{const wall=m.tex('planken',ctex('planken',128,128,(x,w,h)=>{x.fillStyle='#E4B27A';x.fillRect(0,0,w,h);x.fillStyle='#D39E66';for(let i=0;i<8;i++)x.fillRect(0,i*16,w,3);x.fillStyle='#C98C5A';[[20,8],[90,40],[50,88],[100,110]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,3,0,TAU);x.fill()})}));
  const roofC=o.color||'#EDB85E';P(g,G.bx(1.5,1.05,1.3,.14),wall,[0,.53,0]);P(g,G.bx(1.6,.12,1.4,.05),m.c('#A0704C'),[0,.06,0]);
  const roof=G.la([[0,0],[1.02,-.06],[1.08,.04],[.98,.16],[.55,.66],[.2,.98],[0,1.05]],Q(28));scallop(roof,12,.06,.18);P(g,roof,m.c(roofC,{rim:.6,rimColor:'#fff6d8'}),[0,1.02,0],null,[1,1,.92]);P(g,G.to(.62,.05),m.c(shade(roofC,.85)),[0,1.42,0],[PI/2,0,0],[1,.92,1]);
  P(g,G.s(.1),m.gloss('#FF8FB8'),[0,2.08,0]);P(g,G.cy(.11,.13,.45),m.c('#C98C5A'),[.45,1.6,-.25]);P(g,G.cy(.14,.14,.06),m.c('#A0704C'),[.45,1.84,-.25]);
  const door=new THREE.Shape();door.moveTo(-.22,0);door.lineTo(-.22,.45);door.absarc(0,.45,.22,PI,0,true);door.lineTo(.22,0);door.lineTo(-.22,0);
  P(g,G.puff(door,.05,.02),m.c('#8A5A3C'),[-.3,.06,.66]);P(g,G.s(.035),m.gold(),[-.17,.36,.7]);
  const win=markGlow(g,P(g,G.circ(.17),m.glow('#FFD27A',1.4),[.35,.62,.656]));P(g,G.to(.18,.04),m.c('#A0704C'),[.35,.62,.66]);bt(g,[.18,.62,.67],[.52,.62,.67],.018,m.c('#A0704C'));bt(g,[.35,.45,.67],[.35,.79,.67],.018,m.c('#A0704C'));
  P(g,G.bx(.4,.12,.14,.04),m.c('#A0704C'),[.35,.4,.72]);range(3,(t,i)=>blossom(g,m,['#FF8FB8','#FFE27A','#FFFBF0'][i],[.23+i*.12,.5,.74],.14,5,[0,1,.4]));
  P(g,G.bx(.5,.03,.32,.02),m.c('#4B5E9C',{gloss:1}),[-.25,1.45,-.35],[-.6,.4,0]);P(g,G.ca(.08,.2),m.c('#6CBF5A'),[-.72,.15,.5])});
N('mast',{r:.55,h:3.7,grow:7,planet:'alle'},(g,m,o,rnd)=>{const red=m.c('#F0556E',{gloss:.6}),wh=m.c('#FFFBF0',{gloss:.6});const H=3.2,B=.5,T=.12;const lp=(k,y)=>{const t=y/H,r=B+(T-B)*t,a=k*PI/2+PI/4;return[Math.cos(a)*r,y,Math.sin(a)*r]};
  range(4,(t,k)=>range(4,(u,j)=>bt(g,lp(k,j*H/4),lp(k,(j+1)*H/4),.075-.01*j,j%2?wh:red,.075-.01*(j+1))));
  range(3,(t,j)=>{const y1=(j+.5)*H/4+.2,y0=j*H/4+.15;range(4,(u,k)=>bt(g,lp(k,y0),lp((k+1)%4,y1),.03,m.steel()))});
  range(4,(t,k)=>P(g,G.s(.08),m.c('#8D89A6'),lp(k,.04)));
  P(g,G.cy(.28,.28,.07),m.c('#8D89A6',{gloss:.5}),[0,H*.62,0]);
  const d=grp(g,[.22,H*.72,.1]);orient(d,[1,.5,.6],up);P(d,G.la([[0,0],[.36,.13],[.4,.17],[.32,.15],[0,.05]],Q(22)),wh);bt(d,[0,.03,0],[0,.3,0],.02,m.steel());P(d,G.s(.05),red,[0,.32,0]);
  bt(g,[0,H,0],[0,H+.35,0],.04,m.steel());markBlink(g,markGlow(g,P(g,G.s(.1),m.glow('#FF4A5A',2.6),[0,H+.42,0])));
  range(2,(t,i)=>markBlink(g,P(g,G.s(.05),m.glow('#FF4A5A',2.2),lp(i*2,H*.5))))});
N('sandburg',{r:.55,h:.95,grow:5,planet:'korallen'},(g,m,o,rnd)=>{const sa=m.c('#F2D9A6',{rim:.4}),sb=m.c('#E6C68C');P(g,G.blob(.55,.08,2,3),sb,[0,.02,0],null,[1.3,.25,1.2]);
  const tower=(x,z,r,h)=>{P(g,G.la([[0,0],[r*1.1,0],[r,h*.35],[r*1.02,h*.4],[r*.95,h*.75],[r*1.04,h*.8],[r*.95,h],[0,h]],Q(20)),sa,[x,0,z]);range(5,(t,i)=>{const a=i/5*TAU;P(g,G.bx(r*.36,r*.4,r*.36,r*.1),sa,[x+Math.cos(a)*r*.78,h+r*.16,z+Math.sin(a)*r*.78],[0,-a,0])})};
  P(g,G.bx(.8,.36,.5,.08),sa,[0,.2,-.05]);range(4,(t,i)=>P(g,G.bx(.12,.1,.12,.03),sa,[-.3+i*.2,.42,.2]));
  tower(0,-.12,.2,.65);tower(-.42,.12,.14,.45);tower(.42,.12,.14,.45);
  const door=new THREE.Shape();door.moveTo(-.07,0);door.lineTo(-.07,.1);door.absarc(0,.1,.07,PI,0,true);door.lineTo(.07,0);P(g,G.puff(door,.03,.01),m.c('#C9A26A'),[0,.03,.2]);
  bt(g,[0,.72,-.12],[0,1.02,-.12],.012,m.c('#C98C5A'));P(g,G.puff(shp([[0,0],[.2,-.06],[0,-.12]]),.02,.01),m.c('#FF8FB8'),[0,1.0,-.12]);
  P(g,G.star(.07,.03,5,.03),m.gloss('#FF8A5A'),[.42,.5,.25],[-.3,0,0]);P(g,clamGeo(.07,1.1,8,.02,.01,.002,.05),shellMat(m,'#FFFBF0',8),[-.42,.3,.26],[-.2,0,0]);
  P(g,G.la([[0,0],[.13,0],[.15,.22],[.13,.22],[.12,.03],[0,.03]],Q(18)),m.gloss('#6AA8F0'),[.6,0,.35],[.3,0,1.2]);P(g,G.to(.08,.012,PI),m.gloss('#FFE27A'),[.6,.12,.35],[0,0,1.2])});
N('statue',{r:.45,h:1.45,grow:8,planet:'alle'},(g,m,o,rnd)=>{const st=m.c(o.color||'#DCD2EE',{rim:.5,gloss:.3}),dk=m.c('#BFB2D8');
  P(g,G.bx(.7,.3,.7,.1),dk,[0,.15,0]);P(g,G.bx(.6,.08,.6,.04),st,[0,.32,0]);
  P(g,G.la([[0,0],[.3,0],[.33,.1],[.28,.3],[.2,.46],[.14,.56],[0,.58]],Q(24)),st,[0,.36,0]);
  P(g,G.s(.16),st,[0,.9,0],null,[1.1,.95,.95]);P(g,G.s(.17),st,[0,1.18,0]);
  both(x=>{P(g,G.tu([[x*.14,.98,0],[x*.24,.84,.08],[x*.1,.78,.17]],.05),st);P(g,G.to(.045,.016,PI),m.c('#6E6490'),[x*.07,1.2,.15],[-.2,0,PI]);P(g,G.s(.03),m.cheek(),[x*.1,1.14,.14],null,[1.3,.8,.5])});
  P(g,G.to(.03,.012,PI),m.c('#B8475F'),[0,1.11,.16],[-.2,0,PI]);
  range(7,(t,i)=>{const a=-PI*1.05+t*PI*1.1;const b=[Math.cos(a)*.14,1.28,Math.sin(a)*.14-.02];const e=[Math.cos(a)*.3,1.08-.08*(i%2),Math.sin(a)*.26-.04];const tip=[e[0]*1.1,e[1]-.2,e[2]*1.05+.04];P(g,G.tu([b,e,tip],.07,.03),m.c(i%2?'#9E7BE0':'#B393F0',{gloss:.5}));P(g,G.s(.035),m.c('#B393F0'),tip)});
  range(5,(t,i)=>{const a=t*PI*.9-PI*.95+.1;P(g,flatLeaf(leafShape(.14,.05),.02,.5),m.c('#7CC46A'),[Math.cos(a)*.13,1.33,Math.sin(a)*.13],[0,-a,-.9])});
  const sp=grp(g,[0,.82,.2]);bt(sp,[0,-.02,0],[0,.14,0],.014,m.c('#6CBF5A'));both(x=>P(sp,flatLeaf(leafShape(.1,.04),.015,.2),m.c('#7CC46A'),[0,.14,0],[0,x>0?0:PI,-.5]));
  P(g,G.to(.14,.018),m.gold(),[0,1.03,.02],[PI/2-.3,0,0]);P(g,G.s(.035),m.glow('#7FF7E8',2),[0,.98,.14]);
  P(g,G.s(.13),m.c('#7CC46A',{rim:.6}),[.25,.35,.2],null,[1.3,.4,1]);P(g,G.s(.1),m.c('#8FD36B'),[-.28,.32,-.22],null,[1.3,.4,1])});
N('frucht',{r:.14,h:.28,grow:1,planet:'alle'},(g,m,o,rnd)=>{const f=fruit(g,m,o.fruit||'apfel',[0,.13,0],.26);g.userData.fruits.push(f)});
N('toast',{r:.16,h:.08,grow:1,planet:'alle'},(g,m,o,rnd)=>{const sh=s=>{const t=new THREE.Shape();t.moveTo(-.5*s,-.5*s);t.lineTo(.5*s,-.5*s);t.lineTo(.5*s,.25*s);t.bezierCurveTo(.75*s,.45*s,.55*s,.72*s,.3*s,.6*s);t.bezierCurveTo(.15*s,.8*s,-.15*s,.8*s,-.3*s,.6*s);t.bezierCurveTo(-.55*s,.72*s,-.75*s,.45*s,-.5*s,.25*s);t.lineTo(-.5*s,-.5*s);return t};
  const q=grp(g,[0,.035,0],[-PI/2,0,.3]);P(q,G.puff(sh(.3),.035,.012),m.c('#C98040'));P(q,G.puff(sh(.25),.04,.01),m.c('#FFE3A8',{rim:.4}),[0,.005,.005]);
  P(q,G.bx(.09,.07,.04,.015),m.c('#FFE27A',{gloss:.8}),[.02,.03,.035],[0,0,.3]);P(q,G.s(.04),m.c('#FFF1A8',{gloss:1}),[-.06,-.05,.025],null,[1.5,1,.3])});
N('kegel',{r:.22,h:.72,grow:1.5,planet:'alle'},(g,m,o,rnd)=>{const or=m.gloss('#FF8A3D'),wh=m.gloss('#FFFBF0');P(g,G.bx(.5,.07,.5,.05),m.c('#4A4458',{gloss:.4}),[0,.035,0]);
  const H=.62,rb=.2,rt=.045;const rAt=y=>rb+(rt-rb)*y/H;
  [[0,.18,or],[.18,.28,wh],[.28,.4,or],[.4,.48,wh],[.48,H,or]].forEach(([a,b,mt])=>P(g,G.cy(rAt(b),rAt(a),b-a),mt,[0,.07+(a+b)/2,0]));P(g,G.s(rt),or,[0,.07+H,0])});
N('rampe',{r:.7,h:.55,grow:4,planet:'alle'},(g,m,o,rnd)=>{const w=m.wood();const sh=new THREE.Shape();sh.moveTo(-.8,0);sh.lineTo(.7,0);sh.lineTo(.7,.4);sh.lineTo(.55,.42);sh.lineTo(-.8,.03);sh.lineTo(-.8,0);
  const rp=P(g,G.puff(sh,.9,.03),w,[0,0,0],[0,PI/2,0]);
  range(5,(t,i)=>{const x=-.6+i*.3;P(g,G.bx(.9,.02,.04,.01),m.c('#B87A4A'),[0,.06+(x+.8)/1.5*.39,x],[Math.atan2(.39,1.5),0,0])});
  both(s=>{[-.5,.1,.6].forEach((z,i)=>{const y0=.04+(z+.8)/1.5*.39;bt(g,[s*.47,y0,-z],[s*.47,y0+.42,-z],.03,m.c('#FFE27A',{gloss:.8}))});bt(g,[s*.47,.46+.06,.5],[s*.47,.46+.39+.02,-.6],.03,m.c('#FFE27A',{gloss:.8}))});
  const tx=ctex('rolli',128,128,(x,W,H)=>{x.fillStyle='#4B7BE5';x.beginPath();x.roundRect?x.roundRect(4,4,120,120,22):x.rect(4,4,120,120);x.fill();x.strokeStyle='#fff';x.fillStyle='#fff';x.lineWidth=9;x.lineCap='round';
    x.beginPath();x.arc(58,24,10,0,TAU);x.fill();x.beginPath();x.moveTo(56,40);x.lineTo(56,72);x.lineTo(84,72);x.lineTo(94,96);x.stroke();x.beginPath();x.arc(58,82,24,-.3,PI*1.1);x.stroke()});
  P(g,G.bx(.26,.26,.03,.03),m.tex('rolli',tx,{gloss:.5}),[.5,.72,-.6],[0,-.5,0]);bt(g,[.5,.0,-.62],[.5,.6,-.62],.025,m.steel())});
N('haufen',{r:.8,h:1.6,grow:5,planet:'alle'},(g,m,o,rnd)=>{P(g,G.blob(.75,.1,2.3,4),m.c('#B8A48C'),[0,.1,0],null,[1.3,.55,1.1]);
  const bottle=(p,r,c)=>{const b=P(g,G.la([[0,0],[.1,0],[.11,.02],[.11,.2],[.05,.28],[.04,.36],[.045,.38],[0,.38]],Q(16)),m.c(c,{gloss:1.1,rim:.8}),p,r);P(b,G.cy(.048,.048,.04),m.c('#FF7E6B'),[0,.38,0]);return b};
  bottle([-.35,.35,.35],[.4,0,.9],'#7CC49A');bottle([.1,.42,.4],[-.3,.5,-.6],'#8FD3FF');bottle([.5,.3,.1],[0,0,-1.3],'#A6EBC3');
  P(g,G.cy(.09,.09,.2),m.gloss('#F0556E'),[-.1,.55,.1],[.4,0,.5]);P(g,G.cy(.09,.09,.2),m.steel(),[.3,.55,-.15],[1.2,0,.2]);
  P(g,G.bx(.4,.3,.35,.05),m.c('#D8A870'),[-.45,.45,-.25],[.1,.4,.15]);P(g,G.bx(.4,.03,.3,.01),m.c('#C9955E'),[-.45,.61,-.18],[.25,.4,.15]);
  range(3,(t,i)=>P(g,G.bx(.35,.03,.26,.01),m.c(i%2?'#FFFBF0':'#E8E4F0'),[.2,.58+i*.035,.25],[.1,.3*i,0]));
  P(g,G.to(.07,.03,PI*1.2),m.c('#FFE27A'),[.05,.62,-.3],[.5,.2,0]);
  const post=[.75,0,.45];bt(g,post,[.75,1.35,.45],.04,m.c('#A0704C'));
  const tx=ctex('recycling',256,128,(x,w,h)=>{x.fillStyle='#FFFBF0';x.fillRect(0,0,w,h);x.fillStyle='#4E9F55';x.fillRect(0,0,w,10);x.fillRect(0,h-10,w,10);
    x.save();x.translate(52,64);x.strokeStyle='#4E9F55';x.fillStyle='#4E9F55';x.lineWidth=9;x.lineJoin='round';for(let k=0;k<3;k++){x.rotate(TAU/3);x.beginPath();x.moveTo(-20,22);x.lineTo(14,22);x.stroke();x.beginPath();x.moveTo(24,22);x.lineTo(10,10);x.lineTo(10,34);x.closePath();x.fill()}x.restore();
    x.fillStyle='#3B3450';x.font='bold 30px sans-serif';x.textAlign='left';x.textBaseline='middle';x.fillText('RECYCLING',92,66,156)});
  P(g,G.bx(.8,.4,.05,.05),m.tex('recycling',tx,{rim:.2}),[.75,1.2,.48],[0,-.35,0])});

/* ======================= Boden-Aufkleber (decal) ======================= */
N('moos',{r:0,h:0,decal:true,grow:3,planet:'alle'},(g,m,o,rnd)=>{decalMesh(g,m,'moos',.95,.95,256,(x,w,h)=>{const r=srand(3);x.fillStyle='#6DAE55';smoothBlob(x,128,128,100,r,11,.35);x.fill();
  for(let i=0;i<60;i++){x.fillStyle=['#86C667','#5B9A48','#A6D97E'][i%3];smoothBlob(x,128+(r()-.5)*170,128+(r()-.5)*170,8+r()*14,r,7,.4);x.fill()}
  x.globalCompositeOperation='destination-in';x.fillStyle='#000';smoothBlob(x,128,128,112,srand(3),11,.35);x.fill();x.globalCompositeOperation='source-over';
  for(let i=0;i<7;i++){const a=r()*TAU,d=r()*70;x.fillStyle=i%2?'#FFE27A':'#FFFBF0';x.beginPath();x.arc(128+Math.cos(a)*d,128+Math.sin(a)*d,5,0,TAU);x.fill()}})});
N('pfuetze',{r:0,h:0,decal:true,grow:1,planet:'alle'},(g,m,o,rnd)=>{decalMesh(g,m,'pfuetze',.85,.7,256,(x,w,h)=>{const r=srand(5);x.fillStyle='rgba(106,168,240,.9)';smoothBlob(x,128,128,112,r,10,.3);x.fill();
  x.fillStyle='rgba(143,211,255,.95)';smoothBlob(x,122,122,82,srand(5),10,.3);x.fill();x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(80,95);x.quadraticCurveTo(100,78,130,76);x.stroke();x.beginPath();x.moveTo(150,74);x.lineTo(162,76);x.stroke();
  x.lineWidth=4;x.strokeStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(150,150,26,14,0,0,TAU);x.stroke()},{gloss:1})});
N('oel',{r:0,h:0,decal:true,grow:1,planet:'alle'},(g,m,o,rnd)=>{decalMesh(g,m,'oel',.9,.8,256,(x,w,h)=>{const r=srand(9);x.fillStyle='#3B3450';smoothBlob(x,128,128,112,r,12,.35);x.fill();
  x.save();smoothBlob(x,128,128,104,srand(9),12,.35);x.clip();const cols=['#FF8FB8','#FFE27A','#7FF7E8','#8FD3FF','#C6A9FF'];x.lineWidth=9;x.globalAlpha=.75;
  for(let k=0;k<5;k++){x.strokeStyle=cols[k];x.beginPath();for(let a=0;a<=TAU+.1;a+=.2){const rr=30+k*14+Math.sin(a*3+k)*8;const px=118+Math.cos(a)*rr,py=132+Math.sin(a)*rr*.8;a?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}x.restore();
  x.globalAlpha=1;x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.ellipse(95,90,16,7,-.5,0,TAU);x.fill()},{gloss:1.2})});
N('farbe',{r:0,h:0,decal:true,grow:.5,planet:'alle'},(g,m,o,rnd)=>{const c=o.color||RP(rnd,['#FF8FB8','#FFE27A','#7FDCE6','#C6A9FF','#FF7E6B','#8FD36B']);
  decalMesh(g,m,'farbe'+c,.8,.8,256,(x,w,h)=>{const r=srand(c.length*13+c.charCodeAt(2));x.fillStyle=c;smoothBlob(x,128,128,70,r,9,.6);x.fill();
    for(let i=0;i<9;i++){const a=r()*TAU,d=78+r()*34,s=5+r()*12;x.beginPath();x.arc(128+Math.cos(a)*d,128+Math.sin(a)*d,s,0,TAU);x.fill();x.lineWidth=s*.9;x.strokeStyle=c;x.beginPath();x.moveTo(128+Math.cos(a)*50,128+Math.sin(a)*50);x.lineTo(128+Math.cos(a)*(d-s),128+Math.sin(a)*(d-s));x.stroke()}
    x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(105,105,20,9,-.6,0,TAU);x.fill()},{gloss:.8})});
N('krater',{r:.3,h:.1,decal:true,grow:.5,planet:'alle'},(g,m,o,rnd)=>{decalMesh(g,m,'krater',1.2,1.2,256,(x,w,h)=>{const r=srand(2);
  x.fillStyle='rgba(140,110,90,.55)';smoothBlob(x,128,128,120,r,12,.25);x.fill();x.fillStyle='#6E5A50';smoothBlob(x,128,128,78,r,12,.2);x.fill();
  const gr=x.createRadialGradient(122,122,4,128,128,66);gr.addColorStop(0,'#3B3040');gr.addColorStop(1,'#5A4A48');x.fillStyle=gr;smoothBlob(x,128,128,64,r,10,.15);x.fill();
  x.strokeStyle='#5A4A48';x.lineWidth=4;for(let i=0;i<7;i++){const a=r()*TAU;x.beginPath();x.moveTo(128+Math.cos(a)*80,128+Math.sin(a)*80);x.lineTo(128+Math.cos(a+.1)*104,128+Math.sin(a+.1)*104);x.lineTo(128+Math.cos(a-.05)*118,128+Math.sin(a-.05)*118);x.stroke()}});
  range(6,(t,i)=>{const a=i/6*TAU+.3;P(g,G.blob(.1,.2,2,i),m.c('#9C8070'),[Math.cos(a)*.44,.02,Math.sin(a)*.44],null,[1,.45,1])})});
N('schleim',{r:0,h:0,decal:true,grow:.5,planet:'alle'},(g,m,o,rnd)=>{const c=o.color||'#A6E36A';decalMesh(g,m,'schleim'+c,.8,.8,256,(x,w,h)=>{const r=srand(4);x.fillStyle=c;smoothBlob(x,128,128,95,r,9,.5);x.fill();
  for(let i=0;i<5;i++){const a=r()*TAU;x.beginPath();x.arc(128+Math.cos(a)*112,128+Math.sin(a)*112,6+r()*8,0,TAU);x.fill()}
  x.fillStyle=shade(c,1.2);smoothBlob(x,124,124,60,r,8,.4);x.fill();x.fillStyle='rgba(255,255,255,.85)';[[96,92,12],[150,120,7],[118,160,5]].forEach(([a,b,s])=>{x.beginPath();x.arc(a,b,s,0,TAU);x.fill()});
  x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=7;x.lineCap='round';x.beginPath();x.arc(128,128,72,3.6,4.4);x.stroke()},{gloss:1.3})});
N('spur',{r:0,h:0,decal:true,grow:.5,planet:'alle'},(g,m,o,rnd)=>{decalMesh(g,m,'spur',.55,1.4,256,(x,w,h)=>{x.fillStyle='rgba(110,80,70,.55)';both(s=>{const cx=128+s*62;for(let y=6;y<h;y+=22){x.beginPath();x.roundRect?x.roundRect(cx-22,y,44,14,6):x.rect(cx-22,y,44,14);x.fill()}});
  x.fillStyle='rgba(110,80,70,.28)';both(s=>x.fillRect(128+s*62-26,0,52,h))})});
N('tritt',{r:0,h:0,decal:true,grow:.3,planet:'alle'},(g,m,o,rnd)=>{decalMesh(g,m,'tritt',.4,.4,128,(x,w,h)=>{x.fillStyle='rgba(110,80,70,.6)';const paw=(cx,cy,s)=>{x.beginPath();x.ellipse(cx,cy+6*s,13*s,11*s,0,0,TAU);x.fill();[[-14,-10],[-5,-17],[5,-17],[14,-10]].forEach(([a,b])=>{x.beginPath();x.ellipse(cx+a*s,cy+b*s,4.5*s,5.5*s,0,0,TAU);x.fill()})};paw(44,80,1.3);paw(86,40,1.3)})});
N('schrift',{r:0,h:0,decal:true,grow:1,planet:'alle'},(g,m,o,rnd)=>{const word=String(o.word||'KIN').toUpperCase().slice(0,14);const c=o.color||'#FFFBF0';const L=Math.max(2,word.length);
  const W=512,H=128;const t=ctex('schrift-'+word+c,W,H,(x)=>{x.clearRect(0,0,W,H);x.font='900 92px "Comic Sans MS","Chalkboard SE",sans-serif';x.textAlign='center';x.textBaseline='middle';const sc=Math.min(1,480/x.measureText(word).width);
    x.save();x.translate(W/2,H/2+4);x.scale(sc,1);x.lineJoin='round';x.lineWidth=16;x.strokeStyle='rgba(59,52,80,.55)';x.strokeText(word,0,0);x.fillStyle=c;x.fillText(word,0,0);x.restore()});
  const w=Math.min(3.2,.34*L+.3);const mat=m.tex('schrift-'+word+c,t,{transparent:true,depthWrite:false,rim:0,polygonOffset:true,polygonOffsetFactor:-2});const me=P(g,G.pl(w,w/4),mat,[0,.02,0],[-PI/2,0,0]);me.castShadow=false;me.renderOrder=1});
/* ======================= FISCHE ======================= */
const F=(id,meta,b)=>FISH.push(Object.assign({id},meta,{b:wrap(b)}));
function fprof(t,o){const tp=o.tp??.55,tr=o.tr??.2;if(t<=tp){const k=t/tp;return tr+(1-tr)*Math.pow(Math.sin(k*PI/2),o.tk??1.2)}const k=(t-tp)/(1-tp);return Math.pow(Math.max(0,Math.cos(k*PI/2)),o.nose??.55)}
function fishTex(key,back,belly,draw){return ctex('fish-'+key,256,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);[[0,belly],[.19,belly],[.33,back],[.67,back],[.81,belly],[1,belly]].forEach(([p,c])=>g.addColorStop(p,c));x.fillStyle=g;x.fillRect(0,0,w,h);if(draw)draw(x,w,h,srand(key.length*7+key.charCodeAt(0)))})}
const FT={/* Textur-Pinsel: y 0=Nase … 1=Schwanz */
  bands:(x,w,h,c,ys,bh,u0)=>{x.fillStyle=c;ys.forEach(y=>{x.fillRect(w*(u0??.14),y*h-bh/2,w*(1-2*(u0??.14)),bh)})},
  stripe:(x,w,h,c,wd,y0,y1,u)=>{x.fillStyle=c;[u??.25,1-(u??.25)].forEach(uu=>x.fillRect(w*uu-wd/2,(y0??0)*h,wd,((y1??1)-(y0??0))*h))},
  spots:(x,w,h,c,n,r0,r1,rnd,ua,ub,ya,yb)=>{x.fillStyle=c;for(let i=0;i<n;i++){const u=(ua??.2)+rnd()*((ub??.5)-(ua??.2)),y=((ya??.05)+rnd()*((yb??.95)-(ya??.05)))*h,r=r0+rnd()*(r1-r0);[u,1-u].forEach(uu=>{x.beginPath();x.arc(uu*w,y,r,0,TAU);x.fill()})}},
  blobs:(x,w,h,c,n,r0,r1,rnd,ya,yb)=>{x.fillStyle=c;for(let i=0;i<n;i++){const u=.3+rnd()*.2,y=((ya??.1)+rnd()*((yb??.9)-(ya??.1)))*h,r=r0+rnd()*(r1-r0);[u,1-u].forEach(uu=>{smoothBlob(x,uu*w,y,r,rnd,8,.5);x.fill()})}}};
const TAILS={fork:[[-.02,.05],[.16,.16],[.34,.3],[.26,.02],[.34,-.3],[.16,-.16],[-.02,-.05]],round:[[-.02,.06],[.16,.2],[.3,.14],[.32,0],[.3,-.14],[.16,-.2],[-.02,-.06]],
  fancy:[[-.02,.06],[.2,.22],[.46,.3],[.36,.1],[.44,-.04],[.34,-.2],[.16,-.2],[-.02,-.06]],moon:[[-.02,.04],[.1,.1],[.3,.34],[.2,.03],[.2,-.03],[.3,-.3],[.1,-.1],[-.02,-.04]],
  spade:[[-.02,.05],[.24,.18],[.34,0],[.24,-.18],[-.02,-.05]]};
const DORSALS={std:[[0,0],[.06,.13],[.2,.1],[.3,0]],hi:[[0,0],[.04,.22],[.16,.16],[.3,0]],long:[[0,0],[.05,.1],[.3,.09],[.5,.05],[.52,0]],spiky:[[0,0],[.03,.16],[.07,.08],[.11,.17],[.15,.08],[.2,.15],[.25,.06],[.32,0]],tri:[[0,0],[.12,.26],[.2,.02],[.26,0]],sail:[[0,0],[.02,.3],[.2,.3],[.45,.1],[.5,0]]};
function fin2(g,mat,pts,p,s,th,rot){const q=grp(g,p,rot||[0,PI/2,0]);P(q,G.puff((pts.length>6?sshp:sshp)(pts.map(([a,b])=>[a*s,b*s])),th||.028),mat);return q}
function fishT(g,m,o){const L=o.L??.76,H=o.H??.2,W=o.W??.62,ts=(o.ts??1)*.85;const z0=(ts*.3-L)/2;const n=Q(22);
  const pts=[[0,0]];for(let i=0;i<=n;i++){const t=i/n;pts.push([Math.max(1e-3,fprof(t,o)*H),t*L])}
  const mat=o.mat||m.tex('fish-'+o.id,fishTex(o.id,o.back,o.belly,o.pat),{gloss:o.gloss??.9,rim:.45});
  const body=P(g,G.la(pts,Q(30)),mat,[0,0,z0],[PI/2,0,0],[W,1,1]);
  const at=t=>({z:z0+t*L,r:fprof(t,o)*H});const fm=o.finMat||m.c(o.fin||shade(o.back,1.1),{rim:.7,rimColor:'#ffffff'});
  if(o.tail!=='none')fin2(g,fm,TAILS[o.tail||'fork'],[0,o.tailY||0,z0+.03],ts,.03);
  if(o.dorsal!=='none'){const t=o.dz??.62,a=at(t);fin2(g,fm,DORSALS[o.dorsal||'std'],[0,a.r*.86,a.z],o.ds??1,.026)}
  if(o.anal!==false){const t=o.az??.3,a=at(t);fin2(g,fm,DORSALS[o.anal||'std'].map(([a,b])=>[a*.8,-b*.8]),[0,-a.r*.86,a.z],o.as??.8,.024)}
  if(o.pect!==false){const t=o.pz??.66,a=at(t);both(s=>{const q=grp(g,[s*a.r*W*.82,-a.r*.3,a.z],[0,s>0?1.1:PI-1.1,s*.35]);P(q,G.puff(leafShape(.17*(o.ps??1),.06*(o.ps??1)),.02),fm)})}
  const e=at(o.eyeT??.83);const er=o.eye??.052;both(s=>eye(g,m,[s*e.r*W*.8,e.r*(o.eyeY??.25),e.z],er,[s,.15,.45]));
  const nz=z0+L;if(o.mouth!=='none'){const mr=at(.97);P(g,G.to(.022,.008,PI),m.c(o.mouthC||'#B8475F'),[0,-mr.r*.2-.012,nz-.012],[0,0,PI])}
  return{at,z0,L,H,W,nz,body,fm}}
const fishMeta=(n,planet,where,size,time,rarity,price,text,fact)=>({n,planet,where,size,time,rarity,price,text,fact});

/* --- Kompost-Planet: Teich & Fluss --- */
F('barsch',fishMeta('Flussbarsch','kompost','fluss','M','tag',1,180,'Ich hab einen Flussbarsch gefangen! Gestreift wie ein Schlafanzug – bereit fürs Nickerchen im Eimer!',
  'Flussbarsche tragen dunkle Querstreifen und leuchtend rote Bauchflossen. Ihre stachelige Rückenflosse stellen sie auf, wenn ihnen jemand zu nahe kommt. Auf dem Kompost-Planeten stehen sie am liebsten dort, wo Weidenwurzeln ins Wasser hängen.'),
  (g,m)=>fishT(g,m,{id:'barsch',H:.22,tp:.55,back:'#8DB04E',belly:'#F6EDB0',fin:'#FF7E4B',dorsal:'spiky',dz:.72,ds:1.1,pat:(x,w,h)=>FT.bands(x,w,h,'#4F6E34',[.25,.42,.58,.74],18)}));
F('hecht',fishMeta('Hecht','kompost','fluss','L','tag',3,1200,'Ich hab einen Hecht gefangen! Er guckt, als hätte er gerade einen Witz über Karpfen gehört.',
  'Hechte lauern regungslos zwischen Wasserpflanzen und schiessen dann blitzschnell hervor. Ihr Maul erinnert an einen Entenschnabel. Sie halten Fischbestände gesund, weil sie vor allem kranke und schwache Tiere erwischen.'),
  (g,m)=>{const f=fishT(g,m,{id:'hecht',L:.86,H:.12,W:.8,tp:.5,tr:.35,nose:.9,back:'#6E9E4A',belly:'#F4F0C8',fin:'#9CB85A',dorsal:'std',dz:.24,ds:.8,az:.2,as:.7,ts:.85,eyeT:.8,eye:.045,pat:(x,w,h,r)=>FT.spots(x,w,h,'#E6E89A',26,4,8,r,.2,.46,.12,.95)});
    P(g,G.s(.07),m.tex('fish-hecht',fishTex('hecht','#6E9E4A','#F4F0C8')),[0,-.01,f.nz-.08],null,[1.1,.45,1.6])});
F('koi',fishMeta('Koi','kompost','teich','M','tag',2,800,'Ich hab einen Koi gefangen! So elegant … der hat bestimmt einen eigenen Instagram-Teich.',
  'Kois sind Zuchtformen des Karpfens und können über 50 Jahre alt werden. Jede Fleckenzeichnung ist einzigartig wie ein Fingerabdruck. Im Labor sagt man: Wer einem Koi lange zusieht, vergisst, auf sein Handy zu schauen.'),
  (g,m)=>{const f=fishT(g,m,{id:'koi',H:.2,tp:.5,back:'#FFFBF0',belly:'#FFFBF0',fin:'#FFE2D0',tail:'fancy',ts:1.15,dorsal:'long',dz:.7,ds:.9,pat:(x,w,h,r)=>{FT.blobs(x,w,h,'#FF6A3A',5,18,34,r,.1,.85);FT.blobs(x,w,h,'#3B3450',2,8,12,r,.3,.7)}});
    both(s=>P(g,G.tu([[s*.02,-.03,f.nz-.03],[s*.07,-.06,f.nz],[s*.1,-.1,f.nz-.02]],.009),m.c('#FFB08A')))});
F('goldfisch',fishMeta('Goldfisch','kompost','teich','S','immer',1,120,'Ich hab einen Goldfisch gefangen! Er hat schon vergessen, dass er gefangen wurde. Glückspilz.',
  'Goldfische stammen von chinesischen Karauschen ab und wurden vor über 1000 Jahren gezüchtet. Das Gerücht vom 3-Sekunden-Gedächtnis stimmt nicht: Sie merken sich Dinge monatelang. Bitte nie in Teiche aussetzen – dort verdrängen sie heimische Arten.'),
  (g,m)=>fishT(g,m,{id:'goldfisch',L:.58,H:.25,W:.7,tp:.5,tr:.28,back:'#FF8A2E',belly:'#FFC46A',fin:'#FFB06A',tail:'fancy',ts:1.5,dorsal:'hi',dz:.62,eye:.065,eyeT:.8}));
F('wels',fishMeta('Wels','kompost','fluss','XL','nacht',4,4000,'Ich hab einen Wels gefangen! Der Schnurrbart ist so lang, der braucht einen eigenen Friseur.',
  'Welse sind die grössten Süsswasserfische Europas und können über zwei Meter lang werden. Mit ihren Barteln schmecken und tasten sie im trüben Wasser. Sie sind nachts unterwegs und räumen den Grund auf – eine Art schwimmende Kompost-Crew.'),
  (g,m)=>{const f=fishT(g,m,{id:'wels',L:.86,H:.16,W:1.1,tp:.78,tr:.12,nose:.4,tk:.8,back:'#6E6A7E',belly:'#D8D0DE',fin:'#8D89A6',tail:'round',ts:.7,dorsal:'std',dz:.66,ds:.5,anal:'long',az:.08,as:1.1,eye:.035,eyeT:.9,eyeY:.35,mouth:'none',pat:(x,w,h,r)=>FT.spots(x,w,h,'#57536A',30,4,9,r,.25,.5)});
    P(g,G.to(.07,.015,PI),m.c('#4A4458'),[0,-.05,f.nz-.03],[PI/2,0,PI]);both(s=>{P(g,G.tu([[s*.08,.03,f.nz-.05],[s*.25,0,f.nz-.02],[s*.4,-.12,f.nz-.18]],.015,.008),m.c('#57536A'));P(g,G.tu([[s*.05,-.07,f.nz-.06],[s*.12,-.14,f.nz-.08]],.01,.006),m.c('#57536A'))})});
F('plastik_karpfen',fishMeta('Plastik-Karpfen','kompost','teich','M','immer',1,90,'Ich hab einen Plastik-Karpfen gefangen! Der hat mehr Mikroplastik als Schuppen!',
  'Dieser Karpfen ist aus einer alten Limoflasche geschlüpft – sagen jedenfalls die Kinder im Labor. Echtes Plastik zerfällt im Wasser in winzige Teilchen, die man inzwischen in fast jedem Tier findet. Das Museum zeigt ihn, damit niemand vergisst: Wir sind alle ein bisschen Plastik-Karpfen.'),
  (g,m)=>{const f=fishT(g,m,{id:'plastik_karpfen',H:.21,tp:.5,back:'#FF9EC8',belly:'#FFD6E8',fin:'#FFB8D8',gloss:1.4,tail:'round',dorsal:'long',dz:.68,ds:.8,
    pat:(x,w,h)=>{x.fillStyle='rgba(255,255,255,.7)';x.fillRect(w*.5-3,0,6,h);x.fillStyle='#FFFFFF';x.globalAlpha=.55;for(let i=0;i<3;i++)x.fillRect(0,h*(.3+i*.2),w,5);x.globalAlpha=1;
      x.fillStyle='#4E9F55';x.font='bold 40px sans-serif';x.textAlign='center';x.fillText('♻',w*.25,h*.55);x.fillText('♻',w*.75,h*.55)}});
    P(g,G.cy(.055,.055,.05),m.gloss('#6AA8F0'),[0,0,f.nz+.01],[PI/2,0,0]);P(g,G.to(.055,.01),m.gloss('#6AA8F0'),[0,0,f.nz-.01])});
F('chip_forelle',fishMeta('Chip-Forelle','kompost','fluss','M','tag',2,700,'Ich hab eine Chip-Forelle gefangen! Sie rechnet schneller, als ich zappeln kann.',
  'Regenbogenforellen brauchen kühles, sauberes Wasser mit viel Sauerstoff. Die Chip-Forelle trägt einen winzigen Sensor, der die Wasserqualität misst – Forschende nutzen echte Tiere wie Muscheln tatsächlich als lebende Messgeräte. Tier, Maschine, Umweltamt: alles in einem Fisch.'),
  (g,m)=>{const f=fishT(g,m,{id:'chip_forelle',L:.8,H:.18,tp:.5,back:'#7FA07A',belly:'#FFF4DC',fin:'#A8C498',dorsal:'std',dz:.6,pat:(x,w,h,r)=>{FT.stripe(x,w,h,'#FF8FB8',30,.05,.95);FT.spots(x,w,h,'#3B3450',30,2.5,4.5,r,.3,.5)}});
    const a=f.at(.5);P(g,G.bx(.02,.09,.12,.008),m.tex('pcb2',ctex('pcb',256,160,()=>{}),{gloss:.5}),[a.r*f.W*.95,.02,a.z],[0,0,.1]);P(g,G.bx(.02,.04,.05,.008),m.c(PAL.ink),[a.r*f.W*1.0,.02,a.z]);
    markGlow(g,P(g,G.s(.018),m.glow('#7FF7E8',2.5),[0,f.at(.8).r*.95,f.at(.8).z]))});
F('stichling',fishMeta('Moos-Stichling','kompost','teich','S','tag',1,100,'Ich hab einen Moos-Stichling gefangen! Klein, stachelig und mit eigenem Vorgarten.',
  'Stichlings-Männchen bauen im Frühling kunstvolle Nester aus Pflanzenfasern und bewachen die Eier ganz allein. Dabei färbt sich ihre Kehle leuchtend rot. Der Moos-Stichling vom Kompost-Planeten lässt sich gleich ein kleines Moospolster auf dem Rücken wachsen.'),
  (g,m)=>{const f=fishT(g,m,{id:'stichling',L:.7,H:.15,tp:.55,tr:.14,back:'#5E9A7A',belly:'#F4F0DC',fin:'#9CC4A8',dorsal:'none',dz:.4,az:.35,eye:.05,pat:(x,w,h)=>{x.fillStyle='#FF6A5A';x.fillRect(0,0,w*.22,h*.3);x.fillRect(w*.78,0,w*.22,h*.3)}});
    range(3,(t,i)=>{const a=f.at(.72-i*.14);P(g,G.co(.025,.1),m.c('#E8E0C0'),[0,a.r*.95+.04,a.z],[-.3,0,0])});P(g,G.blob(.07,.15,3,2),m.c('#7CC46A',{rim:.6}),[0,f.at(.35).r*.9,f.at(.35).z],null,[1,.5,1.4])});
F('axolotl_mod',fishMeta('Axolotl-Mod','kompost','teich','S','nacht',3,1500,'Ich hab einen Axolotl-Mod gefangen! Er lächelt, als hätte er gerade ein Update installiert.',
  'Axolotl sind Schwanzlurche, die ihr Leben lang wie Kaulquappen aussehen. Sie können Beine, Teile des Herzens und sogar des Gehirns nachwachsen lassen! In freier Wildbahn in Mexiko sind sie fast verschwunden – dieser hier hat sich eine Antenne gebastelt, um Verwandte zu finden.'),
  (g,m)=>{const pk='#FFA8C5',pm=m.c(pk,{rim:.8,rimColor:'#ffffff',gloss:.6});const f=fishT(g,m,{id:'axolotl_mod',L:.82,H:.13,W:1,tp:.75,tr:.25,nose:.35,back:pk,belly:'#FFD6E2',mat:pm,fin:'#FFC8DA',tail:'round',ts:1.1,dorsal:'long',dz:.55,ds:.7,anal:false,pect:false,eye:.04,eyeT:.9,eyeY:.4,mouth:'none'});
    P(g,G.to(.05,.009,PI*.9),m.c('#B8475F'),[0,-.03,f.nz-.02],[PI/2-.3,0,PI+.15]);
    both(s=>{range(3,(t,i)=>{const b=[s*.1,.06-i*.03,f.nz-.14];const e=[s*.22,.14-i*.07,f.nz-.22];P(g,G.tu([b,e],.018,.012),m.c('#F06A9A'));range(3,(u,j)=>P(g,G.s(.022),m.c('#FF6A9A',{rim:.8}),[b[0]+(e[0]-b[0])*(.4+j*.3),b[1]+(e[1]-b[1])*(.4+j*.3)+.015,b[2]+(e[2]-b[2])*(.4+j*.3)]))});
      [.72,.3].forEach(t=>{const a=f.at(t);P(g,G.tu([[s*a.r*.8,-a.r*.5,a.z],[s*(a.r+.08),-a.r-.04,a.z+.02],[s*(a.r+.1),-a.r-.1,a.z+.05]],.022,.018),pm)})});
    bt(g,[0,f.at(.85).r,f.at(.85).z],[.04,f.at(.85).r+.16,f.at(.85).z-.03],.01,m.steel());markGlow(g,P(g,G.s(.03),m.glow('#7FF7E8',2.5),[.04,f.at(.85).r+.18,f.at(.85).z-.03]))});
F('pilz_schleie',fishMeta('Pilz-Schleie','kompost','teich','M','nacht',3,1300,'Ich hab eine Pilz-Schleie gefangen! Auf ihrem Rücken wächst ein ganzer Wald – ein sehr kleiner Wald.',
  'Schleien leben in ruhigen, schlammigen Teichen und wurden früher „Doktorfisch“ genannt, weil ihr Schleim angeblich andere Fische heilt. Die Pilz-Schleie trägt Myzel auf der Haut und verbindet so Teich und Waldboden. Pilze sind die Internetkabel der Natur – nur viel älter.'),
  (g,m)=>{const f=fishT(g,m,{id:'pilz_schleie',H:.2,tp:.52,tr:.28,back:'#6E8E4A',belly:'#E8D27A',fin:'#6E8E4A',tail:'round',dorsal:'std',dz:.55,ds:.8,eye:.045,pat:(x,w,h,r)=>FT.spots(x,w,h,'#5A7A3A',20,4,8,r,.3,.5)});
    [[.62,.09,'#E8505B'],[.5,.06,'#F08A3C'],[.72,.05,'#E8505B']].forEach(([t,s,c],i)=>{const a=f.at(t);shroom(g,m,[(i-1)*.04,a.r*.85,a.z-.03],s,c,{nd:3,rot:[0,0,(i-1)*.3]})})});
F('stoer',fishMeta('Urzeit-Stör','kompost','fluss','XL','tag',5,12000,'Ich hab einen Urzeit-Stör gefangen! Der hat schon Dinosaurier beim Baden gesehen!',
  'Störe gibt es seit über 200 Millionen Jahren – sie sind älter als die meisten Dinosaurier. Statt Schuppen tragen sie Reihen aus Knochenplatten. Wegen Staudämmen und der Jagd nach Kaviar sind fast alle Arten bedroht; freie Flüsse sind ihr grösster Wunsch.'),
  (g,m)=>{const f=fishT(g,m,{id:'stoer',L:.84,H:.13,W:.9,tp:.6,tr:.3,nose:1.2,back:'#8D9AB8',belly:'#F3EEDC',fin:'#9FA8C4',tail:'none',dorsal:'std',dz:.25,ds:.6,az:.18,as:.6,eye:.035,eyeT:.8,eyeY:.35,mouth:'none'});
    fin2(g,f.fm,[[-.02,.04],[.18,.2],[.36,.36],[.26,.1],[.2,-.08],[.08,-.1],[-.02,-.04]],[0,.02,f.z0+.03],1,.03);
    range(8,(t,i)=>{const a=f.at(.22+t*.62);const c=P(g,G.co(.03,.05),m.c('#F3EEDC'),[0,a.r+.012,a.z]);both(s=>{const k=P(g,G.co(.022,.04),m.c('#E6E0CC'),[s*a.r*f.W*.85,a.r*.35,a.z]);k.rotation.z=-s*1.1})});
    range(4,(t,i)=>P(g,G.tu([[(t-.5)*.05,-.04,f.nz-.08],[(t-.5)*.07,-.1,f.nz-.08]],.008,.006),m.c('#C9C1CF')))});

/* --- Schrott-Mond: Kühlwasser --- */
F('kabel_aal',fishMeta('Kabel-Aal','schrott','kuehlwasser','M','immer',2,600,'Ich hab einen Kabel-Aal gefangen! Endlich weiss ich, wo das Ladekabel geblieben ist!',
  'Echte Aale wandern tausende Kilometer bis in die Sargassosee, um dort Eier zu legen – und niemand hat es je direkt beobachtet. Der Kabel-Aal wandert nur bis zur nächsten Steckdose. Er ist ein Mischwesen aus Tier und Technik, und er hasst Kabelsalat.'),
  (g,m)=>{const pts=range(Q(14),(t)=>[Math.sin(t*TAU*1.1)*.1,0,.32-t*.78]);P(g,G.tu(pts,.075,.04),m.tex('kabel',ctex('kabel',64,256,(x,w,h)=>{x.fillStyle='#6AA8F0';x.fillRect(0,0,w,h);x.fillStyle='#FFE27A';for(let i=0;i<10;i++)x.fillRect(0,i*26,w,8)}),{gloss:1}));
    const hd=grp(g,[0,0,.36]);P(hd,G.bx(.19,.16,.16,.05),m.c('#FFFBF0',{gloss:1}));both(s=>{bt(hd,[s*.03,0,.06],[s*.03,0,.13],.012,m.steel());eye(hd,m,[s*.1,.03,.01],.034,[s,.2,.5])});
    P(hd,G.to(.02,.007,PI),m.c('#B8475F'),[0,-.03,.071],[0,0,PI]);const e=pts[pts.length-1];range(3,(t,i)=>P(g,G.tu([e,[e[0]+(i-1)*.05,e[1]+(i-1)*.02,e[2]-.08]],.012,.008),m.copper()))});
F('kiemen_router',fishMeta('Kiemen-Router','schrott','kuehlwasser','M','nacht',3,1800,'Ich hab einen Kiemen-Router gefangen! Das WLAN hier unten ist jetzt übrigens voll gut.',
  'Fische filtern mit ihren Kiemen Sauerstoff aus dem Wasser – ein Router filtert Datenpakete aus dem Rauschen. Der Kiemen-Router macht beides und blinkt dabei zufrieden. Wenn nachts alle Lichter grün sind, ist das Kühlwasser sauber.'),
  (g,m)=>{P(g,G.bx(.36,.3,.62,.13),m.c('#E6DCFF',{gloss:1}),[0,0,.02]);P(g,G.bx(.37,.06,.5,.03),m.c('#8E6BD1',{gloss:.8}),[0,-.07,.02]);
    range(4,(t,i)=>markBlink(g,markGlow(g,P(g,G.s(.022),m.glow(i%2?'#7FF7E8':'#B7F77F',2.4),[.19,.05,-.12+i*.08]))));
    both(s=>{range(3,(t,i)=>P(g,G.bx(.02,.12,.018,.008),m.c('#8E6BD1'),[s*.18,.02,.2+i*.035]));bt(g,[s*.1,.14,-.1],[s*.16,.38,-.2],.014,m.c(PAL.ink));P(g,G.s(.035),m.c('#FF8FB8',{gloss:1}),[s*.16,.39,-.2]);eye(g,m,[s*.11,.05,.33],.04,[s*.3,.1,1])});
    P(g,G.to(.03,.009,PI),m.c('#B8475F'),[0,-.04,.335],[0,0,PI]);fin2(g,m.c('#C6A9FF',{rim:.7}),TAILS.fork,[0,0,-.28],1,.03)});
F('akku_barbe',fishMeta('Akku-Barbe','schrott','kuehlwasser','S','immer',1,150,'Ich hab eine Akku-Barbe gefangen! Voll aufgeladen – im Gegensatz zu mir.',
  'Barben tasten mit ihren Barteln am Grund nach Futter. Die Akku-Barbe speichert Sonnenwärme aus dem Kühlwasser in ihrem Bauch. Echte Akkus enthalten wertvolle Metalle wie Lithium und Kobalt – sie gehören nie in den Müll, sondern zum Recycling.'),
  (g,m)=>{P(g,G.cy(.13,.13,.52),m.tex('akku',ctex('akku',256,128,(x,w,h)=>{x.fillStyle='#4E9F55';x.fillRect(0,0,w,h);x.fillStyle='#3B3450';x.fillRect(0,0,w,h*.22);x.fillStyle='#B7F77F';for(let i=0;i<4;i++)x.fillRect(w*.16+i*w*.18,h*.4,w*.12,h*.34)}),{gloss:1}),[0,0,0],[PI/2,0,0]);
    P(g,G.cy(.14,.14,.05),m.steel(),[0,0,.26],[PI/2,0,0]);P(g,G.cy(.05,.05,.05),m.steel(),[0,0,.3],[PI/2,0,0]);P(g,G.cy(.135,.135,.04),m.steel(),[0,0,-.26],[PI/2,0,0]);
    both(s=>{eye(g,m,[s*.1,.05,.2],.035,[s,.2,.4]);P(g,G.tu([[s*.05,-.08,.26],[s*.1,-.14,.3],[s*.12,-.18,.26]],.01),m.c('#4A4458'))});
    fin2(g,m.c('#A6EBC3',{rim:.7}),TAILS.fork,[0,0,-.27],.9,.03);fin2(g,m.c('#A6EBC3',{rim:.7}),DORSALS.tri,[0,.12,.05],.8,.025);
    P(g,G.bx(.03,.08,.02,.008),m.c('#FFE27A'),[0,.02,.325]);P(g,G.bx(.08,.03,.02,.008),m.c('#FFE27A'),[0,.02,.325])});
F('dosen_sardine',fishMeta('Dosen-Sardine','schrott','kuehlwasser','S','tag',1,100,'Ich hab eine Dosen-Sardine gefangen! Sie wohnt in ihrer eigenen Dose. Wie praktisch – wie eng!',
  'Sardinen schwimmen in riesigen Schwärmen, die wie ein einziges Lebewesen wirken. Die Dosen-Sardine nutzt weggeworfene Blechdosen als Haus – so wie Einsiedlerkrebse leere Schneckenhäuser. Müll wird hier nicht weggeworfen, sondern bewohnt.'),
  (g,m)=>{P(g,G.bx(.36,.2,.56,.09),m.tex('dose',ctex('dose',128,128,(x,w,h)=>{x.fillStyle='#E8E4F0';x.fillRect(0,0,w,h);x.fillStyle='#F0556E';x.fillRect(0,h*.3,w,h*.4);x.fillStyle='#FFE27A';x.beginPath();x.arc(w/2,h/2,14,0,TAU);x.fill()}),{gloss:1}),[0,-.02,-.04]);
    P(g,G.to(.05,.015),m.steel(),[.14,.1,.2],[PI/2,0,0]);P(g,G.bx(.3,.02,.3,.02),m.steel(),[0,.13,-.28],[-.5,0,0]);
    const f=grp(g,[0,.02,.23]);P(f,G.s(.12),m.gloss('#9EC4E8'),[0,0,0],null,[.75,.85,1]);both(s=>eye(f,m,[s*.07,.03,.06],.035,[s,.2,.6]));P(f,G.to(.02,.007,PI),m.c('#B8475F'),[0,-.035,.115],[0,0,PI]);
    fin2(g,m.c('#9EC4E8',{rim:.7}),TAILS.fork,[0,0,-.3],.7,.03)});
F('roehren_qualle',fishMeta('Leuchtröhren-Qualle','schrott','kuehlwasser','S','nacht',3,1400,'Ich hab eine Leuchtröhren-Qualle gefangen! Sie macht das Licht an, wenn ich rede. Oder aus. Kommt drauf an.',
  'Quallen bestehen zu 95 Prozent aus Wasser und haben weder Gehirn noch Herz – und schwimmen trotzdem seit 500 Millionen Jahren durch die Meere. Die Leuchtröhren-Qualle ist aus alten Glühbirnen geschlüpft. Ihr Glühfaden brennt mit Abwärme aus dem Kühlwasser.'),
  (g,m)=>{const b=grp(g,[0,.02,.12]);orient(b,[0,.8,.6],up);P(b,G.la([[0,-.02],[.22,0],[.24,.08],[.2,.18],[.12,.25],[0,.27]],Q(24)),m.glass('#E8FFFA'));P(b,G.cy(.2,.24,.04),m.c('#C6A9FF',{gloss:1}),[0,0,0]);
    markGlow(g,P(b,G.tu(range(12,(t)=>[Math.sin(t*TAU*1.5)*.08,.06+t*.12,Math.cos(t*TAU*1.5)*.08]),.012),m.glow('#FFD27A',2.6)));markGlow(g,P(b,G.s(.1),m.glow('#FFF1A8',1.2),[0,.12,0]));
    both(s=>eye(b,m,[s*.08,.1,.2],.032,[s*.3,.3,1]));P(b,G.to(.02,.007,PI),m.c('#B8475F'),[0,.05,.215],[0,0,PI]);
    range(6,(t,i)=>{const a=i/6*TAU;const cx=Math.cos(a)*.15,cz=Math.sin(a)*.12;P(g,G.tu(range(6,(u)=>[cx+Math.sin(u*9+i)*.035,-.02-u*.42,.05+cz-u*.3+Math.cos(u*7+i)*.03]),.02,.011),m.c(['#7FF7E8','#FF8FB8','#FFE27A'][i%3],{gloss:.6}))})});
F('neonsalmler',fishMeta('Neonsalmler','schrott','kuehlwasser','S','nacht',2,500,'Ich hab einen Neonsalmler gefangen! Wer braucht schon Lichterketten?',
  'Neonsalmler stammen aus dunklen Urwaldflüssen in Südamerika. Ihr blauer Streifen spiegelt Licht so, dass sich der Schwarm im trüben Wasser wiederfindet. Auf dem Schrott-Mond fühlen sie sich im warmen, leicht leuchtenden Kühlwasser sofort zu Hause.'),
  (g,m)=>{const f=fishT(g,m,{id:'neonsalmler',L:.8,H:.15,W:.6,tp:.5,tr:.22,back:'#8D9AB8',belly:'#FFFBF0',fin:'#E6E0F0',dorsal:'std',dz:.5,eye:.06,eyeT:.84,pat:(x,w,h)=>{x.fillStyle='#F0556E';x.fillRect(0,h*.5,w*.36,h*.5);x.fillRect(w*.64,h*.5,w*.36,h*.5)}});
    both(s=>{const pts=range(6,(t)=>{const a=f.at(.25+t*.55);return[s*a.r*f.W*1.0,a.r*.2,a.z]});markGlow(g,P(g,G.tu(pts,.018),m.glow('#5AE0FF',2.2)))})});
F('luefter_kugelfisch',fishMeta('Lüfter-Kugelfisch','schrott','kuehlwasser','M','tag',2,900,'Ich hab einen Lüfter-Kugelfisch gefangen! Wenn er sich aufregt, pustet er sich einfach kühl.',
  'Kugelfische schlucken bei Gefahr blitzschnell Wasser und blasen sich zur stacheligen Kugel auf. Der Lüfter-Kugelfisch hat zusätzlich einen Ventilator auf dem Rücken, der das Kühlwasser umwälzt. Ohne ihn würde es im Rechenzentrum-Teich schnell stickig.'),
  (g,m)=>{P(g,G.s(.3),m.c('#C6A9FF',{gloss:.8,rim:.6}),[0,0,0]);P(g,G.s(.26),m.c('#F3EEFF'),[0,-.07,.04],null,[1,.8,1]);
    for(let i=0;i<16;i++){const th=.4+((i*.618)%1)*2.2,ph=i*2.4;const n=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];if(n[2]>.75)continue;const s=P(g,G.co(.03,.08),m.c('#8E6BD1'),[n[0]*.31,n[1]*.31,n[2]*.31]);orient(s,n,up)}
    both(s=>{eye(g,m,[s*.13,.08,.25],.055,[s*.3,.2,1]);P(g,G.puff(leafShape(.12,.05),.02),m.c('#E6DCFF'),[s*.28,-.02,.02],[0,s>0?-.4:PI+.4,0])});P(g,G.to(.03,.012),m.c('#B8475F'),[0,-.05,.3]);
    const fan=grp(g,[0,.3,-.02]);P(fan,G.to(.14,.03),m.c(PAL.ink,{gloss:.6}),[0,0,0],[PI/2,0,0]);range(5,(t,i)=>P(fan,G.puff(leafShape(.12,.04),.012),m.c('#7FF7E8',{gloss:.8}),[0,.02,0],[PI/2,0,i/5*TAU]));P(fan,G.s(.035),m.steel(),[0,.03,0]);
    fin2(g,m.c('#E6DCFF',{rim:.7}),TAILS.round,[0,0,-.28],.7,.03)});
F('glasfaser_angler',fishMeta('Glasfaser-Anglerfisch','schrott','kuehlwasser','L','nacht',4,5000,'Ich hab einen Glasfaser-Anglerfisch gefangen! Sein Licht hat 1000 Mbit – und seine Zähne auch.',
  'In der Tiefsee locken Anglerfische ihre Beute mit einer Leuchtangel, in der Bakterien Licht machen. Die winzigen Männchen verschmelzen mit dem Weibchen und werden ein Teil von ihr – Symbiose, wie sie im Buche steht. Der Glasfaser-Angler leuchtet mit echtem Datenlicht.'),
  (g,m)=>{const f=fishT(g,m,{id:'glasfaser_angler',L:.78,H:.28,W:.95,tp:.7,tr:.14,nose:.35,tk:.8,back:'#4B5E9C',belly:'#8D9AB8',fin:'#6A7AC0',tail:'round',ts:.8,dorsal:'none',az:.25,eye:.04,eyeT:.8,eyeY:.55,mouth:'none',pat:(x,w,h,r)=>FT.spots(x,w,h,'#6A7AC0',16,4,9,r,.3,.5)});
    P(g,G.to(.14,.03,PI),m.c('#2E2A3E'),[0,-.05,f.nz-.06],[-.3,0,PI]);range(7,(t,i)=>P(g,G.co(.018,.06),m.white(),[(t-.5)*.24,.0-.02*Math.abs(t-.5)*2,f.nz-.04-Math.abs(t-.5)*.05],[PI,0,0]));
    const top=[0,f.at(.8).r+.02,f.at(.8).z];P(g,G.tu([top,[0,top[1]+.2,top[2]+.02],[0,top[1]+.24,top[2]+.18]],.014,.01),m.c('#E8FFFA',{gloss:1}));markGlow(g,P(g,G.s(.05),m.glow('#7FF7E8',2.8),[0,top[1]+.24,top[2]+.22]))});
F('pixel_guppy',fishMeta('Pixel-Guppy','schrott','kuehlwasser','S','immer',1,200,'Ich hab einen Pixel-Guppy gefangen! In 8 Bit sieht er echt scharf aus.',
  'Guppys gehören zu den buntesten Aquarienfischen der Welt, jedes Männchen ist ein bisschen anders gemustert. Der Pixel-Guppy lebt im Kühlwasser alter Bildschirme und hat sich deren Auflösung angewöhnt. Wenn man ganz nah rangeht, sieht man die Kästchen.'),
  (g,m)=>{const c=['#6AA8F0','#FF8FB8','#FFE27A','#7FDCE6','#C6A9FF'];const V=.1;const map=[[0,0,-2,4],[0,0,-1,0],[0,0,0,0],[0,0,1,0],[0,0,2,0],[0,1,-1,0],[0,1,0,0],[0,1,1,0],[0,-1,-1,0],[0,-1,0,0],[0,-1,1,0],[0,2,0,1],[0,-2,0,3],[0,1,-3,1],[0,-1,-3,1],[0,2,-3,2],[0,-2,-3,2],[0,0,-3,4]];
    map.forEach(([x,y,z,k])=>P(g,G.bx(V*1.4,V,V,.018),m.gloss(c[k]),[x,y*V,z*V+.05]));
    both(s=>{P(g,G.bx(.02,.05,.05,.01),m.eye(),[s*.075,.03,.2]);P(g,G.bx(.02,.02,.02,.004),m.flat('#fff'),[s*.086,.045,.21])})});
F('chrom_piranha',fishMeta('Chrom-Piranha','schrott','kuehlwasser','M','tag',3,2500,'Ich hab einen Chrom-Piranha gefangen! Er beisst nur in Schrauben. Hoffentlich.',
  'Piranhas haben einen schlimmen Ruf, sind aber eher scheu – viele Arten fressen sogar Früchte und Samen, die ins Wasser fallen. Der Chrom-Piranha knabbert Rost von alten Rohren und hält so die Kühlkreisläufe frei. Ein Hausmeister mit Zähnen.'),
  (g,m)=>{const f=fishT(g,m,{id:'chrom_piranha',L:.66,H:.27,W:.6,tp:.6,tr:.2,nose:.45,mat:m.chrome(),fin:'#F0556E',dorsal:'hi',dz:.55,eye:.05,eyeT:.8,eyeY:.35,mouth:'none'});
    P(g,G.s(.2),m.gloss('#F0556E'),[0,-.1,f.at(.6).z],null,[.55,.5,1.1]);range(4,(t,i)=>P(g,G.co(.018,.045),m.white(),[(t-.5)*.08,-.05,f.nz-.03],[0,0,0]));P(g,G.to(.05,.012,PI),m.c(PAL.ink),[0,-.07,f.nz-.03],[0,0,0])});
F('rost_karausche',fishMeta('Rost-Karausche','schrott','kuehlwasser','M','immer',1,80,'Ich hab eine Rost-Karausche gefangen! Die quietscht beim Schwimmen ein bisschen.',
  'Karauschen sind echte Überlebenskünstler: Im zugefrorenen Teich ohne Sauerstoff wandeln sie Zucker in Alkohol um und überstehen so monatelang. Die Rost-Karausche übersteht auf dem Schrott-Mond sogar Ölwechsel. Ein bisschen Rost gehört für sie zum Charakter.'),
  (g,m)=>{const f=fishT(g,m,{id:'rost_karausche',H:.24,tp:.5,tr:.25,back:'#C8703E',belly:'#F2C08A',fin:'#D98A5A',tail:'fork',dorsal:'long',dz:.7,pat:(x,w,h,r)=>{FT.spots(x,w,h,'#6FC2AE',10,5,11,r,.2,.5);FT.spots(x,w,h,'#A95A30',16,3,6,r,.2,.5)}});
    range(5,(t,i)=>{const a=f.at(.3+t*.4);both(s=>P(g,G.s(.014),m.steel(),[s*a.r*f.W*.98,-.01,a.z]))})});

/* --- Korallen-Welt: Meer --- */
F('clownfisch',fishMeta('Clownfisch','korallen','meer','S','tag',1,300,'Ich hab einen Clownfisch gefangen! Er hat mir einen Witz erzählt, aber ich hab ihn nicht verstanden. Der Witz war nass.',
  'Clownfische leben zwischen den nesselnden Armen von Seeanemonen, die ihnen nichts tun – dafür putzen sie ihre Anemone und verjagen Fressfeinde. Alle Clownfische schlüpfen als Männchen; der grösste im Schwarm wird zum Weibchen. Zusammenleben ist hier ziemlich flexibel.'),
  (g,m)=>fishT(g,m,{id:'clownfisch',L:.66,H:.2,W:.6,tp:.55,tr:.3,back:'#FF8A2E',belly:'#FF9E45',fin:'#FF9E45',tail:'round',dorsal:'long',dz:.62,ds:.8,eye:.055,pat:(x,w,h)=>{[.22,.5,.8].forEach((y,i)=>{x.fillStyle='#3B3450';x.fillRect(0,y*h-16,w,32);x.fillStyle='#FFFBF0';x.fillRect(0,y*h-12,w,24)})}}));
F('doktorfisch',fishMeta('Paletten-Doktorfisch','korallen','meer','S','tag',2,600,'Ich hab einen Paletten-Doktorfisch gefangen! Hat jemand einen Termin gebraucht?',
  'Doktorfische heissen so, weil sie an der Schwanzwurzel ein scharfes „Skalpell“ tragen. Sie weiden den ganzen Tag Algen von den Korallen ab und halten das Riff so gesund. Ohne sie würden die Korallen unter einem grünen Teppich ersticken.'),
  (g,m)=>fishT(g,m,{id:'doktorfisch',L:.7,H:.25,W:.5,tp:.55,tr:.2,back:'#3F6FE0',belly:'#6AA8F0',fin:'#3F6FE0',tail:'fork',finMat:null,dorsal:'long',dz:.7,ds:.9,anal:'long',az:.08,as:.9,eye:.05,pat:(x,w,h)=>{x.strokeStyle='#26244E';x.lineWidth=18;x.lineCap='round';[.25,.75].forEach(u=>{x.beginPath();x.moveTo(w*u,h*.12);x.quadraticCurveTo(w*(u+(u<.5?.12:-.12)),h*.5,w*u,h*.85);x.stroke()});x.fillStyle='#FFE27A';x.fillRect(0,h*.92,w,h*.08)}}));
F('kugelfisch',fishMeta('Kugelfisch','korallen','meer','M','nacht',2,900,'Ich hab einen Kugelfisch gefangen! Er hat sich so aufgeregt, jetzt ist er rund wie ein Wasserball.',
  'Kugelfische blasen sich bei Gefahr mit Wasser zu einer stacheligen Kugel auf. Eine japanische Art zeichnet mit ihren Flossen riesige Kreis-Kunstwerke in den Sand, um Weibchen zu beeindrucken. Das Museum hält das für die schönste Form von Landschaftsarchitektur.'),
  (g,m)=>{P(g,G.s(.32),m.tex('fish-kugel',ctex('fish-kugel',256,128,(x,w,h)=>{x.fillStyle='#F6E6B0';x.fillRect(0,0,w,h);x.fillStyle='#FFFBF0';x.fillRect(0,h*.62,w,h*.38);x.fillStyle='#B88A5A';const r=srand(3);for(let i=0;i<40;i++){x.beginPath();x.arc(r()*w,r()*h*.6,3+r()*5,0,TAU);x.fill()}}),{gloss:.8}),[0,0,0]);
    for(let i=0;i<22;i++){const th=.3+((i*.618)%1)*2.5,ph=i*2.4;const n=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];if(n[2]>.8)continue;const s=P(g,G.co(.025,.08),m.c('#E8D8A0'),[n[0]*.32,n[1]*.32,n[2]*.32]);orient(s,n,up)}
    both(s=>{eye(g,m,[s*.14,.1,.25],.06,[s*.3,.2,1]);P(g,G.puff(leafShape(.12,.05),.02),m.c('#FFE27A'),[s*.3,-.02,.02],[0,s>0?-.4:PI+.4,0])});P(g,G.to(.03,.012),m.c('#B8475F'),[0,-.04,.315]);P(g,G.s(.03),m.cheek(),[.1,.0,.28]);P(g,G.s(.03),m.cheek(),[-.1,.0,.28]);
    fin2(g,m.c('#FFE27A',{rim:.7}),TAILS.round,[0,0,-.3],.7,.03);fin2(g,m.c('#FFE27A',{rim:.7}),DORSALS.std,[0,.3,-.05],.5,.025)});
F('seepferdchen',fishMeta('Seepferdchen','korallen','meer','S','immer',3,1500,'Ich hab ein Seepferdchen gefangen! Galoppiert hat es nicht, aber es war trotzdem sehr würdevoll.',
  'Bei Seepferdchen werden die Männchen schwanger: Sie tragen die Eier in einer Bauchtasche und bringen hunderte Babys zur Welt. Mit ihrem Greifschwanz halten sie sich an Seegras fest, damit die Strömung sie nicht wegträgt. Familie ist eben das, was man daraus macht.'),
  (g,m)=>{const c='#FFB27A',cm=m.c(c,{gloss:.7,rim:.7});const sp=range(Q(18),(t)=>{if(t<.55){const k=t/.55;return[0,.35-k*.6,.02+Math.sin(k*PI)*.1]}const k=(t-.55)/.45;const a=k*PI*1.6;const r=.1*(1-k*.6);return[0,-.25-Math.sin(a)*r,-.06+Math.cos(a)*r-.02]});
    P(g,G.tu(sp,.1,.025),cm);P(g,G.s(.1),cm,[0,.35,.02]);P(g,G.s(.08),cm,[0,.42,.02]);P(g,G.ca(.035,.12),cm,[0,.43,.14],[PI/2-.2,0,0]);P(g,G.s(.03),m.c(shade(c,.85)),[0,.45,.22]);
    range(4,(t,i)=>P(g,G.co(.025,.06),m.c(shade(c,1.1)),[0,.49-(i%2)*.03,-.02-i*.03],[-.4-i*.2,0,0]));both(s=>eye(g,m,[s*.06,.44,.07],.03,[s,.2,.4]));
    range(6,(t,i)=>{const p=sp[Math.floor(t*8)];P(g,G.to(.08-i*.004,.012),m.c(shade(c,.9)),[0,p[1],p[2]],[PI/2+.3,0,0],[1,.8,1])});
    fin2(g,m.c('#FFE2B8',{rim:.8}),[[0,0],[.06,.1],[.16,.08],[.14,-.02]],[0,.12,-.0],.9,.02);P(g,G.s(.07),m.c('#FFD6B0'),[0,.08,.12],null,[1,1.4,.8])});
F('riffhai',fishMeta('Riffhai','korallen','meer','XL','tag',4,6000,'Ich hab einen Riffhai gefangen! Keine Sorge, er ist Vegetarier. Das hat er zumindest behauptet.',
  'Haie gibt es seit über 400 Millionen Jahren – sie sind älter als die ersten Bäume! Riffhaie halten als Spitzenräuber das ganze Korallenriff im Gleichgewicht. Menschen sind für Haie viel gefährlicher als umgekehrt: Jedes Jahr werden Millionen gefangen.'),
  (g,m)=>{const f=fishT(g,m,{id:'riffhai',L:.8,H:.15,W:.9,tp:.58,tr:.16,nose:.8,back:'#7E8FB8',belly:'#FFFBF0',fin:'#7E8FB8',tail:'none',dorsal:'tri',dz:.62,ds:1.2,anal:'tri',az:.18,as:.5,pect:false,eye:.035,eyeT:.82,eyeY:.3,mouth:'none',pat:(x,w,h)=>{x.fillStyle='#6A7AA4';[.25,.75].forEach(u=>{for(let i=0;i<3;i++)x.fillRect(w*u-16+i*12,h*.22,5,h*.08)})}});
    fin2(g,f.fm,[[-.02,.04],[.1,.12],[.34,.38],[.24,.06],[.2,-.02],[.3,-.2],[.1,-.08],[-.02,-.04]],[0,.02,f.z0+.03],1,.03);
    both(s=>{const a=f.at(.62);const q=grp(g,[s*a.r*.8,-a.r*.5,a.z],[.3,s>0?.9:PI-.9,s*.5]);P(q,G.puff(sshp([[0,.04],[.22,-.02],[.26,-.08],[0,-.04]]),.025),f.fm)});
    P(g,G.to(.05,.01,PI*.8),m.c('#3B3450'),[0,-.05,f.nz-.08],[PI/2-.4,0,PI+.3])});
F('mondfisch',fishMeta('Mondfisch','korallen','meer','XL','tag',5,13000,'Ich hab einen Mondfisch gefangen! Er sieht aus wie ein Kopf, der seinen Körper vergessen hat.',
  'Mondfische sind die schwersten Knochenfische der Welt und können über zwei Tonnen wiegen. Sie fressen vor allem Quallen und legen sich zum Aufwärmen flach an die Wasseroberfläche. Ein Schwanz ist ihnen nie gewachsen – sie finden, sie brauchen keinen.'),
  (g,m)=>{const tex=m.tex('fish-mond',ctex('fish-mond',256,256,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#AEB9D8');gr.addColorStop(1,'#E8ECF6');x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.5)';const r=srand(8);for(let i=0;i<30;i++){x.beginPath();x.arc(r()*w,r()*h,3+r()*6,0,TAU);x.fill()}}),{gloss:.6,rim:.5});
    const d=P(g,G.s(.4),tex,[0,0,.05],null,[.28,1,1.05]);const fm=m.c('#9CA8CC',{rim:.7});
    fin2(g,fm,[[-.06,0],[.02,.42],[.16,.4],[.2,0]],[0,.3,.05],1,.04);fin2(g,fm,[[-.06,0],[.02,-.42],[.16,-.4],[.2,0]],[0,-.3,.05],1,.04);
    P(g,G.puff(sshp(range(9,(t,i)=>[Math.sin(t*PI)*.08+(i%2)*.03,(t-.5)*.7])),.05),fm,[0,0,-.38],[0,PI/2,0]);
    both(s=>{eye(g,m,[s*.1,.1,.32],.045,[s,.2,.5]);P(g,G.puff(leafShape(.1,.04),.02),fm,[s*.12,-.02,.2],[0,s>0?-1.8:PI+1.8,0])});P(g,G.to(.03,.012),m.c('#B8475F'),[0,-.02,.45])});
F('solar_rochen',fishMeta('Solar-Rochen','korallen','meer','L','tag',3,2800,'Ich hab einen Solar-Rochen gefangen! Tagsüber lädt er, nachts gleitet er. Ein Traum-Stundenplan.',
  'Mantarochen gehören zu den intelligentesten Fischen und erkennen sich vielleicht sogar im Spiegel. Sie filtern winziges Plankton aus dem Wasser und gleiten dabei wie Vögel. Der Solar-Rochen trägt Solarzellen auf den Flügeln und teilt seinen Strom gern mit Korallen-Cyborgs.'),
  (g,m)=>{const sh=sshp([[0,.42],[.2,.26],[.55,.02],[.5,-.06],[.18,-.2],[0,-.28],[-.18,-.2],[-.5,-.06],[-.55,.02],[-.2,.26]]);const body=P(g,G.puff(sh,.08,.04),m.c('#4B5E9C',{gloss:.6,rim:.5}),[0,0,0],[-PI/2,0,0]);
    const tx=ctex('solarzelle',128,128,(x,w,h)=>{x.fillStyle='#26336E';x.fillRect(0,0,w,h);x.strokeStyle='#8FB4F0';x.lineWidth=3;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32,h);x.stroke();x.beginPath();x.moveTo(0,i*32);x.lineTo(w,i*32);x.stroke()}});
    both(s=>{P(g,G.bx(.26,.02,.22,.01),m.tex('solarzelle',tx,{gloss:1.2}),[s*.25,.1,-.02],[0,s*.35,-s*.06]);P(g,G.ca(.03,.08),m.c('#4B5E9C'),[s*.08,0,.44],[PI/2,0,0]);eye(g,m,[s*.13,.04,.3],.035,[s,.3,.4])});
    P(g,G.s(.16),m.c('#FFFBF0'),[0,-.03,.05],null,[1.4,.3,1.6]);P(g,G.tu([[0,0,-.26],[0,.02,-.45],[0,.05,-.6]],.02,.008),m.c('#4B5E9C'));P(g,G.to(.05,.01,PI),m.c(PAL.ink),[0,-.02,.4],[PI/2,0,PI])});
F('tueten_qualle',fishMeta('Tüten-Qualle','korallen','meer','S','immer',1,50,'Ich hab eine Tüten-Qualle gefangen! … Moment. Das ist ja nur eine Plastiktüte. Ab in den Recycling-Eimer!',
  'Meeresschildkröten verwechseln treibende Plastiktüten oft mit Quallen, ihrem Lieblingsessen – und werden davon krank. Jede eingesammelte Tüte kann also ein Leben retten. Das Museum nimmt sie trotzdem auf: als Mahnmal mit Henkeln.'),
  (g,m)=>{const b=grp(g,[0,-.02,.05]);orient(b,[0,1,.35],up);const geo=G.la([[0,.36],[.1,.35],[.2,.3],[.24,.18],[.23,.04],[.2,-.08],[.21,-.1],[0,-.1]].reverse().map(([a,c])=>[a,c]).sort((p,q)=>p[1]-q[1]),Q(24));
    const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i);const a=Math.atan2(x,z);const k=1+.08*Math.sin(a*6+y*14);p.setX(i,x*k*1.1);p.setZ(i,z*k*.75)}geo.computeVertexNormals();
    P(b,geo,m.c('#F4F2FA',{gloss:.7,rim:1.1,rimColor:'#ffffff'}));P(b,G.bx(.24,.1,.02,.01),m.tex('danke',ctex('danke',128,64,(x,w,h)=>{x.fillStyle='#FFFBF0';x.fillRect(0,0,w,h);x.fillStyle='#F0556E';x.font='bold 30px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('DANKE',w/2,h/2)})),[0,.04,.18]);
    both(s=>{eye(b,m,[s*.07,.18,.165],.028,[s*.3,0,1]);P(b,G.to(.07,.018,PI*1.1),m.c('#F4F2FA',{gloss:.6}),[s*.11,-.1,0],[0,0,PI*.95])});P(b,G.to(.02,.007,PI),m.c('#B8475F'),[0,.13,.18],[0,0,PI]);
    range(4,(t,i)=>P(b,G.tu([[(t-.5)*.3,-.08,(i%2-.5)*.1],[(t-.5)*.34,-.24,(i%2-.5)*.14],[(t-.5)*.3,-.4,(i%2-.5)*.1]],.014,.008),m.c('#E6E0F0')))});
F('papageifisch',fishMeta('Papageifisch','korallen','meer','M','tag',2,1100,'Ich hab einen Papageifisch gefangen! Er hat versprochen, nicht nachzuplappern. Er hat nachgeplappert.',
  'Papageifische knabbern mit ihrem Schnabel Algen von Korallen und scheiden das zermahlene Kalkgestein als feinen weissen Sand wieder aus. Viele Traumstrände bestehen also zum Teil aus – genau. Nachts schlafen manche Arten in einem Schlafsack aus eigenem Schleim.'),
  (g,m)=>{const f=fishT(g,m,{id:'papageifisch',L:.74,H:.22,W:.62,tp:.55,tr:.22,nose:.5,back:'#3FB8A6',belly:'#A6EBC3',fin:'#FF8FB8',tail:'moon',dorsal:'long',dz:.72,ds:.9,mouth:'none',pat:(x,w,h,r)=>{x.fillStyle='#FF8FB8';for(let j=0;j<7;j++)for(let i=0;i<8;i++){x.beginPath();x.arc(i*36+(j%2)*18,j*38+20,7,0,TAU);x.fill()}x.fillStyle='#8FD3FF';x.fillRect(0,0,w,h*.12)}});
    P(g,G.s(.06),m.c('#FFFBF0',{gloss:1}),[0,-.02,f.nz-.03],null,[1.2,1,.9]);P(g,G.to(.045,.008,PI),m.c('#B8C8D8'),[0,-.02,f.nz-.005],[0,0,0])});
F('oktopus',fishMeta('Oktopus','korallen','meer','L','nacht',3,2000,'Ich hab einen Oktopus gefangen! Acht Arme – und alle wollten gleichzeitig winken.',
  'Oktopusse haben drei Herzen, blaues Blut und denken zum Teil mit ihren Armen: Zwei Drittel ihrer Nervenzellen stecken in den Tentakeln. Die Philosophin Donna Haraway nennt unsere Zeit gern „Chthuluzän“ – nach tentakeligen Wesen, die alles mit allem verknüpfen. Dieser hier findet das sehr schmeichelhaft.'),
  (g,m)=>{const c='#FF8E7A',cm=m.c(c,{gloss:.6,rim:.7});P(g,G.s(.2),cm,[0,.06,.1],[.5,0,0],[1,1.15,1.2]);both(s=>{eye(g,m,[s*.1,.07,.26],.04,[s*.3,.2,1]);P(g,G.s(.03),m.cheek(),[s*.14,.0,.25])});P(g,G.to(.025,.01),m.c('#B8475F'),[0,-.03,.29]);
    range(8,(t,i)=>{const a=i/8*TAU;const cx=Math.cos(a)*.1,cy=Math.sin(a)*.08-.04;const pts=range(7,(u)=>[cx+Math.cos(a)*u*.14+Math.sin(u*5+i)*.04,cy+Math.sin(a)*u*.1-u*.04,.02-u*.46]);P(g,G.tu(pts,.045,.015),cm);const e=pts[6];P(g,G.s(.02),cm,e)});
    range(6,(t,i)=>P(g,G.s(.025),m.c('#FFD6CC'),[Math.cos(i)*.12,.16+(i%2)*.04,.02+Math.sin(i)*.08]))});
F('makrele',fishMeta('Makrele','korallen','meer','M','immer',1,250,'Ich hab eine Makrele gefangen! Gestreift, schnell und etwas beleidigt, dass ich schneller war.',
  'Makrelen schwimmen ihr ganzes Leben lang ununterbrochen, weil sie keine Schwimmblase haben und sonst absinken würden. Ihre wellenförmigen Streifen tarnen sie im flackernden Licht unter der Wasseroberfläche. Faul sein ist für sie keine Option – schade eigentlich.'),
  (g,m)=>{const f=fishT(g,m,{id:'makrele',L:.8,H:.15,W:.7,tp:.55,tr:.12,nose:.7,back:'#3FA6A6',belly:'#EEF2F8',fin:'#6AB8C4',tail:'moon',ts:.9,dorsal:'tri',dz:.66,ds:.6,anal:'tri',az:.25,as:.4,pat:(x,w,h)=>{x.strokeStyle='#26444E';x.lineWidth=5;for(let i=0;i<14;i++){x.beginPath();const y=h*(.08+i*.063);x.moveTo(w*.3,y);x.quadraticCurveTo(w*.4,y+10,w*.5,y-6);x.quadraticCurveTo(w*.6,y+10,w*.7,y);x.stroke()}}});
    range(4,(t,i)=>{const a=f.at(.06+i*.05);P(g,G.co(.015,.035),f.fm,[0,a.r+.012,a.z]);P(g,G.co(.015,.035),f.fm,[0,-a.r-.012,a.z],[PI,0,0])})});
/* ======================= INSEKTEN & KRABBLER ======================= */
const B=(id,meta,b)=>BUGS.push(Object.assign({id},meta,{b:wrap(b)}));
const bugMeta=(n,planet,where,time,rarity,price,text,fact)=>({n,planet,where,time,rarity,price,text,fact});
function legs(g,mat,list,by,r){list.forEach(([z,sp,dz,h])=>both(s=>{const k=[s*sp*.62,by+(h??.07),z+dz*.5],f=[s*sp,.012,z+dz];P(g,G.tu([[s*.06,by,z],k,f],r||.022,(r||.022)*.75),mat);P(g,G.s((r||.022)*.9),mat,f)}))}
function feelers(g,mat,tip,base,len,spread,up_,curl){both(s=>{const b=[s*base[0],base[1],base[2]];const e=[s*(base[0]+spread),base[1]+len*(up_??.7),base[2]+len*.7];const mid=[(b[0]+e[0])/2,(b[1]+e[1])/2+len*.12,(b[2]+e[2])/2];
  P(g,G.tu([b,mid,e,...(curl?[[e[0]+s*.03,e[1]+.02,e[2]-.04]]:[])],.012),mat);if(tip)P(g,G.s(.03),tip,curl?[e[0]+s*.03,e[1]+.02,e[2]-.04]:e)})}
function bugFace(g,m,c,r,sep,o){o=o||{};both(s=>eye(g,m,[c[0]+s*r*(sep??.55),c[1]+r*(o.ey??.18),c[2]+r*.72],r*(o.er??.26),[s*.5,.1,1]));if(o.mouth!==false)P(g,G.to(r*.12,r*.04,PI),m.c('#B8475F'),[c[0],c[1]-r*.25,c[2]+r*.92],[0,0,PI]);if(o.cheek)both(s=>P(g,G.s(r*.13),m.cheek(),[c[0]+s*r*.62,c[1]-r*.12,c[2]+r*.72],null,[1,.7,.4]))}
/* Flügel: Form in Einheits-Koordinaten (x nach aussen, y nach vorn), Textur-UV = Formkoordinaten */
function wingPair(g,m,mat,shape,pos,size,raise,yaw,th){const geo=G.puff(shape,th||.04,(th||.04)*.35);both(s=>{const w=grp(g,pos,[0,s*(yaw||0),s>0?(raise||0):PI-(raise||0)]);P(w,geo,mat,[0,0,0],[PI/2,0,0],[size,size,1])})}
const WING={fore:sshp([[0,.02],[.18,.5],[.55,.95],[.98,.92],[.98,.55],[.55,.12],[.1,-.05]]),hind:sshp([[0,0],[.1,-.05],[.6,-.3],[.82,-.62],[.5,-.85],[.18,-.6],[0,-.2]]),
  drag:sshp([[0,.03],[.3,.1],[.85,.12],[1,.05],[.9,-.04],[.4,-.06],[0,-.03]]),bee:sshp([[0,0],[.25,.18],[.7,.25],[.95,.12],[.8,-.05],[.3,-.08]])};
function wingTex(key,draw,hind){const t=ctex('wing-'+key,256,256,(x,w,h)=>{x.save();x.translate(0,h);x.scale(w,-h);if(hind)x.translate(0,1);draw(x);x.restore()});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function shellDome(g,m,col,c,r,len,o){o=o||{};const sh=P(g,G.s(r),o.mat||m.c(col,{gloss:1.1,rim:.5}),c,null,[1,.72,len]);if(o.line!==false)P(g,G.bx(.016,.02,r*len*1.9,.006),m.c(shade(col,.55)),[c[0],c[1]+r*.72-.004,c[2]],[0,0,0]);return sh}

/* --- Kompost --- */
B('marienkaefer',bugMeta('Marienkäfer','kompost','blume','tag',1,100,'Ich hab einen Marienkäfer gefangen! Sieben Punkte, null Sorgen.',
  'Ein einziger Marienkäfer frisst bis zu 50 Blattläuse am Tag – ein kleiner Gärtner im Punkte-Kostüm. Die Anzahl der Punkte verrät nicht sein Alter, sondern die Art. Seine knallige Farbe warnt Vögel: Ich schmecke bitter!'),
  (g,m)=>{const k=m.c(PAL.ink,{gloss:.8});shellDome(g,m,'#F0405A',[0,.22,-.05],.3,1.2,{mat:m.tex('mk',ctex('mk',256,256,(x,w,h)=>{x.fillStyle='#F0405A';x.fillRect(0,0,w,h);x.fillStyle='#3B3450';[[64,60],[192,60],[40,130],[216,130],[80,200],[176,200],[128,20]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,20,0,TAU);x.fill()})}),{gloss:1.1,rim:.5})});
    P(g,G.bx(.016,.02,.66,.006),m.c('#7A1A2A'),[0,.436,-.05]);P(g,G.s(.15),k,[0,.18,.3],null,[1.1,.9,.9]);both(s=>P(g,G.s(.05),m.white(),[s*.08,.26,.36]));bugFace(g,m,[0,.17,.33],.13,.5,{mouth:false});
    legs(g,k,[[.18,.28,.06],[.02,.32,0],[-.14,.3,-.06]],.14);feelers(g,k,k,[.04,.24,.4],.14,.08)});
function butterfly(g,m,key,fore,hind,body,o){o=o||{};const bm=m.c(body||PAL.ink,{rim:.6});P(g,G.ca(.045,.4),bm,[0,.3,-.02],[PI/2,0,0]);P(g,G.s(.07),bm,[0,.32,.25]);bugFace(g,m,[0,.32,.25],.07,.6,{er:.34,mouth:false});
  feelers(g,bm,bm,[.02,.36,.29],.24,.1,.9);legs(g,bm,[[.12,.14,.05,.03],[.02,.16,0,.03],[-.08,.14,-.05,.03]],.27,.014);
  const fm=m.tex('bf-'+key,wingTex(key,fore),{rim:.3}),hm=m.tex('bh-'+key,wingTex(key+'h',hind,true),{rim:.3});
  wingPair(g,m,fm,WING.fore,[0,.34,.02],o.fs||.55,o.raise??.85,-.1,.025);wingPair(g,m,hm,WING.hind,[0,.33,-.02],o.hs||.5,(o.raise??.85)-.15,.1,.025)}
B('monarchfalter',bugMeta('Monarchfalter','kompost','luft','tag',3,1400,'Ich hab einen Monarchfalter gefangen! Der ist schon weiter gereist als ich jemals werde.',
  'Monarchfalter wandern jedes Jahr bis zu 4000 Kilometer von Kanada nach Mexiko – und keiner von ihnen hat den Weg je gelernt, denn die Reise dauert mehrere Generationen. Ihre Raupen fressen giftige Seidenpflanzen und werden dadurch selbst ungeniessbar. Kluges Buffet!'),
  (g,m)=>butterfly(g,m,'monarch',x=>{x.fillStyle='#FF8A2E';x.fillRect(0,0,1,1);x.strokeStyle='#3B3450';x.lineWidth=.07;x.beginPath();x.moveTo(0,0);x.lineTo(.6,.9);x.moveTo(0,0);x.lineTo(.95,.7);x.moveTo(.1,0);x.lineTo(.8,.35);x.stroke();x.lineWidth=.14;x.strokeRect(0,0,1,1);x.fillStyle='#fff';[[.85,.85],[.93,.7],[.75,.93],[.95,.55]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,.03,0,TAU);x.fill()})},
    x=>{x.fillStyle='#FF9E45';x.fillRect(0,-1,1,1);x.strokeStyle='#3B3450';x.lineWidth=.07;x.beginPath();x.moveTo(0,0);x.lineTo(.6,-.8);x.moveTo(0,0);x.lineTo(.8,-.5);x.stroke();x.lineWidth=.12;x.beginPath();x.moveTo(.1,-.05);x.lineTo(.6,-.3);x.lineTo(.82,-.62);x.lineTo(.5,-.85);x.lineTo(.18,-.6);x.stroke()}));
B('zitronenfalter',bugMeta('Zitronenfalter','kompost','luft','tag',1,160,'Ich hab einen Zitronenfalter gefangen! Sauer ist er aber gar nicht – eher sonnig.',
  'Zitronenfalter sind oft die ersten Schmetterlinge im Frühling, weil sie als erwachsene Falter draussen überwintern. Ein körpereigenes Frostschutzmittel lässt sie sogar Minusgrade überstehen. Mit bis zu einem Jahr Lebenszeit sind sie echte Falter-Senioren.'),
  (g,m)=>butterfly(g,m,'zitrone',x=>{x.fillStyle='#FFE45A';x.fillRect(0,0,1,1);x.fillStyle='#FF9E45';x.beginPath();x.arc(.5,.5,.06,0,TAU);x.fill()},x=>{x.fillStyle='#F6E870';x.fillRect(0,-1,1,1);x.fillStyle='#FF9E45';x.beginPath();x.arc(.45,-.45,.05,0,TAU);x.fill()},'#C8C070'));
B('hummel',bugMeta('Hummel','kompost','blume','tag',1,200,'Ich hab eine Hummel gefangen! So flauschig, ich will sie eigentlich nur knuddeln. Mach ich aber nicht.',
  'Hummeln können schon bei Kälte fliegen, weil sie ihre Flugmuskeln wie einen Motor warmzittern. Beim „Vibrationsbestäuben“ schütteln sie Pollen aus Blüten wie Tomaten, die andere Bienen nicht knacken. Der Mythos, dass sie eigentlich nicht fliegen können, stimmt übrigens nicht.'),
  (g,m)=>{const y='#FFD65A',k=m.plush('#4A4458');P(g,G.s(.26),m.tex('humm',ctex('humm',128,128,(x,w,h)=>{x.fillStyle='#4A4458';x.fillRect(0,0,w,h);x.fillStyle=y;x.fillRect(0,h*.2,w,h*.2);x.fillRect(0,h*.55,w,h*.15);x.fillStyle='#FFFBF0';x.fillRect(0,h*.84,w,h*.16)}),{rim:.9,rimColor:'#ffffff'}),[0,.3,-.1],[PI/2+.2,0,0],[1,1.2,.95]);
    P(g,G.s(.17),m.plush(y),[0,.34,.14]);P(g,G.s(.13),k,[0,.3,.3]);bugFace(g,m,[0,.3,.3],.13,.55,{cheek:true});feelers(g,k,k,[.04,.38,.38],.14,.08,.8,true);
    legs(g,k,[[.16,.22,.06],[.04,.25,0],[-.08,.22,-.06]],.2,.025);wingPair(g,m,m.glass('#E8F6FF'),WING.bee,[0,.48,.08],.4,.35,-.5,.02)});
B('honigbiene',bugMeta('Honigbiene','kompost','blume','tag',2,400,'Ich hab eine Honigbiene gefangen! Sie hat mir den Weg zur nächsten Blume vorgetanzt.',
  'Honigbienen erzählen sich mit einem Schwänzeltanz, in welcher Richtung und Entfernung die besten Blüten liegen. Für ein Glas Honig fliegen sie zusammen so weit wie dreimal um die Erde. Ohne Bestäuber gäbe es kaum Äpfel, Kirschen oder Kürbisse.'),
  (g,m)=>{const k=m.c('#4A4458',{rim:.6});P(g,G.s(.2),m.tex('biene',ctex('biene',128,128,(x,w,h)=>{x.fillStyle='#F7B84B';x.fillRect(0,0,w,h);x.fillStyle='#4A4458';for(let i=0;i<3;i++)x.fillRect(0,h*(.2+i*.25),w,h*.1)}),{gloss:.6,rim:.6}),[0,.3,-.15],[PI/2+.3,0,0],[.9,1.35,.9]);
    P(g,G.s(.13),m.plush('#C98C5A'),[0,.32,.08]);P(g,G.s(.11),k,[0,.3,.24]);bugFace(g,m,[0,.3,.24],.11,.55);feelers(g,k,k,[.03,.36,.32],.13,.08,.8,true);P(g,G.co(.025,.08),k,[0,.22,-.44],[-PI/2-.3,0,0]);
    legs(g,k,[[.12,.2,.06],[.03,.22,0],[-.06,.2,-.06]],.22,.018);wingPair(g,m,m.glass('#E8F6FF'),WING.bee,[0,.44,.06],.38,.4,-.55,.02)});
B('libelle',bugMeta('Libelle','kompost','wasser','tag',2,500,'Ich hab eine Libelle gefangen! Sie kann rückwärts fliegen – ich kann nicht mal rückwärts laufen.',
  'Libellen gab es schon vor den Dinosauriern, manche Urzeit-Libellen hatten fast einen Meter Flügelspannweite. Ihre vier Flügel bewegen sie unabhängig voneinander und erwischen damit fast jede Mücke, die sie jagen. Die Larven leben jahrelang unter Wasser, bevor sie schlüpfen.'),
  (g,m)=>{const bc='#3FB8C4',bm=m.gloss(bc);range(7,(t,i)=>P(g,G.s(.05-i*.003),m.gloss(i%2?bc:shade(bc,.75)),[0,.3,-.06-i*.075],null,[1,1,1.4]));P(g,G.s(.08),bm,[0,.3,.08],null,[1,1,1.3]);
    both(s=>{P(g,G.s(.07),m.gloss('#6AA8F0'),[s*.055,.33,.2]);P(g,G.s(.022),m.flat('#fff'),[s*.08,.37,.25])});P(g,G.s(.06),bm,[0,.3,.2]);
    legs(g,m.c(PAL.ink),[[.1,.14,.08,.03],[.04,.16,.04,.03],[-.02,.14,0,.03]],.25,.013);const wm=m.tex('drag',wingTex('drag',x=>{x.fillStyle='rgba(220,245,255,.75)';x.fillRect(0,-1,1,2);x.strokeStyle='rgba(120,170,220,.6)';x.lineWidth=.012;for(let i=0;i<12;i++){x.beginPath();x.moveTo(i/12,-.2);x.lineTo(i/12+.05,.2);x.stroke()}x.fillStyle='#3B3450';x.fillRect(.86,.02,.07,.06)}),{transparent:true,depthWrite:false,side:THREE.DoubleSide,rim:.8});
    wingPair(g,m,wm,WING.drag,[0,.36,.08],.62,.1,-.15,.012);wingPair(g,m,wm,WING.drag,[0,.36,.0],.58,.06,.2,.012)});
B('gluehwuermchen',bugMeta('Glühwürmchen','kompost','luft','nacht',2,600,'Ich hab ein Glühwürmchen gefangen! Endlich eine Nachttischlampe, die mit mir redet.',
  'Glühwürmchen sind eigentlich Käfer, die mit einer chemischen Reaktion kaltes Licht erzeugen – fast ohne Wärmeverlust. Männchen und Weibchen blinken sich Morse-artige Liebesbotschaften zu. Lichtverschmutzung durch Strassenlampen macht es ihnen schwer, sich zu finden.'),
  (g,m)=>{const k=m.c('#6E5A50',{rim:.5});shellDome(g,m,'#7A6A5A',[0,.24,0],.17,1.3);markGlow(g,P(g,G.s(.15),m.glow('#E8FF7A',2.6),[0,.2,-.22],null,[1,.9,1.1]));P(g,G.s(.09),m.c('#FF9EAA'),[0,.24,.22]);
    bugFace(g,m,[0,.22,.27],.09,.55);feelers(g,k,k,[.03,.28,.32],.14,.08);legs(g,k,[[.12,.2,.05],[.02,.22,0],[-.08,.2,-.05]],.16,.016);wingPair(g,m,m.glass('#FFF6D0'),WING.bee,[0,.34,.05],.3,.3,-.6,.015)});
B('hirschkaefer',bugMeta('Hirschkäfer','kompost','baum','nacht',4,5000,'Ich hab einen Hirschkäfer gefangen! Mit dem Geweih könnte er glatt Rentier bei Weihnachtsmann spielen.',
  'Hirschkäfer sind die grössten Käfer Europas. Ihre Larven leben bis zu acht Jahre in morschem Holz, bevor sie als Käfer nur wenige Wochen fliegen. Deshalb sind alte, tote Bäume so wichtig: Totholz ist Kinderzimmer.'),
  (g,m)=>{const k=m.chitin('#7A3A2A'),d=m.c('#4A2E2A',{gloss:.8});shellDome(g,m,'#8A4A32',[0,.2,-.12],.24,1.3,{mat:k});P(g,G.s(.14),d,[0,.2,.14],null,[1.2,.8,1]);P(g,G.s(.12),d,[0,.2,.28],null,[1.3,.75,.9]);bugFace(g,m,[0,.2,.3],.12,.7,{ey:.3});
    both(s=>{P(g,G.tu([[s*.08,.22,.34],[s*.2,.3,.48],[s*.12,.34,.62],[s*.02,.32,.62]],.035,.02),k);P(g,G.co(.02,.06),k,[s*.17,.35,.52],[0,0,-s*.4])});
    feelers(g,d,d,[.1,.22,.36],.12,.1,.3);legs(g,d,[[.14,.3,.08],[0,.34,0],[-.14,.32,-.08]],.14,.022)});
B('heuschrecke',bugMeta('Heuschrecke','kompost','boden','tag',1,160,'Ich hab eine Heuschrecke gefangen! Sie hat mir ein Zirp-Konzert gegeben. Standing Ovations!',
  'Heuschrecken zirpen, indem sie ihre Hinterbeine an den Flügeln reiben – wie ein Geigenbogen. Sie hören mit Ohren an den Beinen! Mit ihren kräftigen Sprungbeinen springen sie das Zwanzigfache ihrer Körperlänge weit.'),
  (g,m)=>{const gm=m.c('#86C667',{gloss:.6,rim:.6}),dm=m.c('#5E9B4A');P(g,G.ca(.1,.4),gm,[0,.2,-.05],[PI/2-.1,0,0]);P(g,G.s(.12),gm,[0,.26,.26],null,[1,1.15,1]);bugFace(g,m,[0,.26,.26],.12,.6);
    basis(P(g,G.puff(WING.drag,.02),dm,[0,.31,.12],null,[.55,1.2,1]),[0,-.1,-1],[-1,0,0],[0,1,-.1]);both(s=>{P(g,G.tu([[s*.08,.22,-.05],[s*.16,.42,-.22],[s*.14,.08,-.42],[s*.14,.02,-.3]],.035,.02),gm)});
    legs(g,dm,[[.18,.18,.08],[.08,.2,0]],.16,.02);feelers(g,dm,null,[.04,.32,.34],.4,.1,.7)});
B('schnecke',bugMeta('Weinbergschnecke','kompost','boden','immer',1,100,'Ich hab eine Schnecke gefangen! Also, eigentlich hat sie sich fangen lassen. Sie war nicht in Eile.',
  'Weinbergschnecken tragen ihr Haus ein Leben lang mit sich und können über 20 Jahre alt werden. Ihr Schleim ist so gut, dass sie damit über eine Rasierklinge kriechen können, ohne sich zu verletzen. Im Kompost zerkleinern sie welke Blätter zu neuer Erde.'),
  (g,m)=>{const bm=m.c('#E8C8A0',{gloss:1,rim:.8});P(g,G.ca(.1,.62),bm,[0,.08,.02],[PI/2,0,0],[1.2,.8,1]);P(g,G.s(.13),bm,[0,.18,.36]);both(s=>{P(g,G.tu([[s*.04,.26,.38],[s*.08,.4,.42]],.02,.016),bm);P(g,G.s(.04),m.eye(),[s*.08,.42,.43]);P(g,G.s(.014),m.flat('#fff'),[s*.09,.44,.46])});
    P(g,G.to(.03,.01,PI),m.c('#B8475F'),[0,.15,.48],[0,0,PI]);both(s=>P(g,G.s(.03),m.cheek(),[s*.09,.17,.46]));spiralShell(g,m,'#C98C5A',.62,[0,.3,-.06],[0,PI/2,0])});
B('regenwurm',bugMeta('Regenwurm','kompost','boden','immer',1,80,'Ich hab einen Regenwurm gefangen! Der heimliche Chef vom Kompost – bitte sofort zurück in die Erde!',
  'Regenwürmer fressen jeden Tag etwa ihr halbes Körpergewicht an Erde und verrotteten Pflanzen und machen daraus fruchtbaren Humus. Sie lockern den Boden, damit Wasser und Wurzeln hineinkommen. Ohne sie wäre der Kompost-Planet einfach nur ein Haufen.'),
  (g,m)=>{const wm=m.c('#FF9EAA',{gloss:.7,rim:.7});const pts=range(9,(t)=>[Math.sin(t*TAU*.9)*.12,.07+Math.max(0,t-.8)*.5,.42-t*.84]).reverse();range(9,(t,i)=>P(g,G.s(.075-Math.abs(t-.6)*.03),i===5?m.c('#F2789A'):wm,pts[i],null,[1,1,1.25]));
    const h=pts[8];bugFace(g,m,[h[0],h[1],h[2]],.075,.55,{cheek:true})});
B('assel',bugMeta('Kellerassel','kompost','stein','immer',1,90,'Ich hab eine Kellerassel gefangen! Sie hat sich sofort zu einer Kugel gerollt. Verständlich.',
  'Asseln sind keine Insekten, sondern Krebstiere – und atmen mit kiemenähnlichen Organen, weshalb sie Feuchtigkeit brauchen. Unter Steinen und Laub zersetzen sie tote Pflanzenteile. Sie sind die Müllabfuhr des Waldbodens, nur viel niedlicher.'),
  (g,m)=>{const c=m.c('#9C95B0',{gloss:.7,rim:.6});range(7,(t,i)=>P(g,G.s(.2*(1-Math.abs(t-.45)*.6)),i%2?c:m.c('#8D86A2',{gloss:.7}),[0,.12,.3-t*.62],null,[1.2,.7,.4]));P(g,G.s(.12),c,[0,.1,.36],null,[1.2,.7,.6]);bugFace(g,m,[0,.09,.38],.1,.6);
    feelers(g,m.c('#6E6A7E'),null,[.06,.12,.42],.2,.14,.3);legs(g,m.c('#6E6A7E'),[[.2,.2,.04],[.08,.22,0],[-.04,.22,0],[-.16,.2,-.04]],.08,.016);both(s=>P(g,G.co(.02,.08),c,[s*.06,.1,-.34],[-PI/2,0,0]))});
B('ameise',bugMeta('Rote Waldameise','kompost','boden','tag',1,60,'Ich hab eine Ameise gefangen! Sie hat ungefähr 300.000 Geschwister. Ich hoffe, die kommen nicht vorbei.',
  'Ameisen tragen das Zehn- bis Fünfzigfache ihres Körpergewichts und verständigen sich über Duftspuren. Ein Ameisenvolk funktioniert wie ein einziger Superorganismus – niemand ist Chef, nicht mal die Königin. Auch Pflanzen profitieren: Ameisen verbreiten viele Samen.'),
  (g,m)=>{const a=m.c('#D9604A',{gloss:.8,rim:.5}),k=m.c('#6E3A32',{gloss:.6});P(g,G.s(.16),a,[0,.2,-.2],null,[1,.9,1.25]);P(g,G.s(.08),k,[0,.2,.02],null,[1,1,1.4]);P(g,G.s(.13),a,[0,.24,.22]);bugFace(g,m,[0,.24,.22],.13,.55,{cheek:true});
    feelers(g,k,k,[.04,.33,.28],.18,.12,.7,true);legs(g,k,[[.08,.24,.1],[.02,.26,0],[-.04,.24,-.1]],.18,.018)});
B('kreuzspinne',bugMeta('Kreuzspinne','kompost','baum','nacht',2,450,'Ich hab eine Kreuzspinne gefangen! Acht Beine, acht Augen und null Interesse an mir. Puh.',
  'Kreuzspinnen spinnen jeden Tag ein neues Radnetz und fressen das alte auf, um die Seide wiederzuverwerten – Recycling-Profis! Spinnenseide ist, gemessen am Gewicht, stärker als Stahl. Ihr weisses Kreuz auf dem Rücken gab ihr den Namen.'),
  (g,m)=>{const b=m.plush('#C98C5A'),k=m.c('#8A5A44');P(g,G.s(.24),m.tex('kreuz',ctex('kreuz',128,128,(x,w,h)=>{x.fillStyle='#C98C5A';x.fillRect(0,0,w,h);x.fillStyle='#FFFBF0';x.fillRect(w*.5-24,h*.4-6,48,12);x.fillRect(w*.5-6,h*.25,12,h*.4);[[40,80],[88,80],[64,100]].forEach(([a,c])=>{x.beginPath();x.arc(a,c,6,0,TAU);x.fill()})}),{rim:.8}),[0,.3,-.18],[.3,-PI/2,0],[1,.95,1.05]);
    P(g,G.s(.14),b,[0,.24,.14]);range(4,(t,i)=>both(s=>P(g,G.s(i<2?.045:.025),m.eye(),[s*(i%2?.04:.08),.3+(i<2?0:.05),.25-(i%2)*.01])));range(2,(t,i)=>both(s=>P(g,G.s(.013),m.flat('#fff'),[s*.09,.32,.29])));
    range(4,(t,i)=>both(s=>{const z=.2-i*.09,sp=.36;P(g,G.tu([[s*.08,.24,z],[s*sp*.6,.42,z+.05-i*.04],[s*sp,.012,z+.12-i*.12]],.02,.014),k)}))});
B('tausendfuessler',bugMeta('Tausendfüssler','kompost','stein','nacht',2,350,'Ich hab einen Tausendfüssler gefangen! Ich hab nachgezählt: Es sind nicht tausend. Aber fast.',
  'Die meisten Tausendfüssler haben „nur“ 50 bis 400 Beine – erst 2021 fand man eine Art mit über 1300. Sie fressen verrottendes Laub und Holz und sind damit wichtige Kompost-Helfer. Bei Gefahr rollen sie sich zur Spirale zusammen.'),
  (g,m)=>{const c=m.c('#8E6BD1',{gloss:.8,rim:.6}),lg=m.c('#FFB27A');const pts=range(11,(t)=>[Math.sin(t*PI*1.6)*.12,.08,.4-t*.8]);pts.forEach((p,i)=>{P(g,G.s(.075),i%2?c:m.c('#A58AE0',{gloss:.8}),p,null,[1.2,.9,1]);if(i>0&&i<10&&i%2)both(s=>P(g,G.tu([[p[0]+s*.06,p[1],p[2]],[p[0]+s*.12,.012,p[2]+.02]],.013,.01),lg))});
    bugFace(g,m,pts[0],.075,.6);feelers(g,lg,null,[.03,.12,.46],.12,.1,.4)});
/* --- Korallen-Welt --- */
B('einsiedlerkrebs',bugMeta('Einsiedlerkrebs','korallen','boden','immer',2,600,'Ich hab einen Einsiedlerkrebs gefangen! Er wohnt in einem Kronkorken. Minimalismus, aber mit Stil.',
  'Einsiedlerkrebse haben einen weichen Hinterleib und leihen sich leere Schneckenhäuser als Zuhause. Wird das Haus zu klein, stellen sie sich in einer Schlange an und tauschen der Grösse nach durch – eine Wohnungsbörse am Strand. Leider ziehen manche heute in Plastikmüll ein.'),
  (g,m)=>{const cap=grp(g,[0,.24,-.12]);orient(cap,[0,.55,-1],up);P(cap,G.cy(.24,.24,.1),m.gloss('#F0556E'),[0,0,0]);range(14,(t,i)=>{const a=i/14*TAU;P(cap,G.bx(.03,.1,.035,.012),m.gloss('#D94257'),[Math.cos(a)*.245,-.005,Math.sin(a)*.245],[0,-a,0])});
    P(cap,G.cy(.18,.18,.01),m.c('#FFFBF0'),[0,.052,0]);P(cap,G.cy(.08,.08,.012),m.c('#F0556E'),[0,.056,0]);
    const c=m.c('#FF9E6B',{gloss:.6});P(g,G.s(.12),c,[0,.14,.12],null,[1.1,.8,1]);both(s=>{P(g,G.tu([[s*.04,.2,.18],[s*.06,.3,.22]],.014),c);eye(g,m,[s*.06,.32,.22],.035,[s*.3,.2,1]);P(g,G.s(.08),c,[s*.14,.12,.26],null,[1,.8,1.2]);P(g,G.s(.05),c,[s*.17,.12,.34])});
    legs(g,c,[[.08,.26,.06],[-.02,.28,-.02]],.12,.022)});
B('winkerkrabbe',bugMeta('Winkerkrabbe','korallen','boden','tag',2,500,'Ich hab eine Winkerkrabbe gefangen! Sie hat die ganze Zeit gewinkt. Ich glaube, wir sind jetzt Freunde.',
  'Männliche Winkerkrabben haben eine riesige Schere, mit der sie Weibchen zuwinken und Rivalen beeindrucken. Die Schere ist oft so schwer wie der ganze restliche Körper. Beim Fressen sieben sie winzige Algen aus dem Sand und hinterlassen kleine Sandkügelchen.'),
  (g,m)=>{const c=m.c('#6AA8F0',{gloss:.8,rim:.5}),o=m.c('#FFB27A',{gloss:.8});P(g,G.s(.2),c,[0,.18,0],null,[1.3,.6,.9]);both(s=>{P(g,G.tu([[s*.06,.26,.12],[s*.08,.38,.15]],.016),c);eye(g,m,[s*.08,.4,.15],.04,[s*.3,.2,1])});
    P(g,G.to(.03,.01,PI),m.c(PAL.ink),[0,.16,.17],[0,0,PI]);P(g,G.tu([[.2,.18,.08],[.3,.28,.15],[.34,.36,.2]],.04),o);
    const cl=grp(g,[.36,.46,.22],[0,0,-.15]);P(cl,G.s(.13),o,[0,0,0],null,[.75,1,.6]);P(cl,G.co(.07,.3),o,[-.03,.22,0],[0,0,.12],[1,1,.6]);P(cl,G.co(.05,.2),o,[.07,.17,0],[0,0,-.5],[1,1,.6]);
    P(g,G.tu([[-.2,.16,.1],[-.26,.2,.18]],.025),c);P(g,G.s(.04),c,[-.27,.21,.2]);legs(g,c,[[.02,.36,.02],[-.07,.38,-.02],[-.16,.34,-.06]],.14,.02)});
B('solar_libelle',bugMeta('Solar-Libelle','korallen','luft','tag',3,1600,'Ich hab eine Solar-Libelle gefangen! Bei Sonne summt sie doppelt so schnell. Bei Wolken schmollt sie.',
  'Libellen sind hervorragende Flieger mit vier unabhängig beweglichen Flügeln. Die Solar-Libelle der Korallen-Welt hat Solarzellen auf den Flügeln und lädt sich tagsüber über dem Meer auf. Abends hilft sie den Leuchtkorallen mit ein bisschen Strom aus.'),
  (g,m)=>{const bc='#FFB27A';range(7,(t,i)=>P(g,G.s(.05-i*.003),m.gloss(i%2?bc:'#FF8FB8'),[0,.3,-.06-i*.075],null,[1,1,1.4]));P(g,G.s(.08),m.gloss(bc),[0,.3,.08],null,[1,1,1.3]);both(s=>{P(g,G.s(.07),m.gloss('#7FDCE6'),[s*.055,.33,.2]);P(g,G.s(.022),m.flat('#fff'),[s*.08,.37,.25])});
    legs(g,m.c(PAL.ink),[[.1,.14,.08,.03],[.04,.16,.04,.03],[-.02,.14,0,.03]],.25,.013);const wm=m.tex('sol-wing',wingTex('solwing',x=>{x.fillStyle='#26336E';x.fillRect(0,-1,1,2);x.strokeStyle='#8FB4F0';x.lineWidth=.015;for(let i=0;i<14;i++){x.beginPath();x.moveTo(i/14,-1);x.lineTo(i/14,1);x.stroke()}x.beginPath();x.moveTo(0,0);x.lineTo(1,0);x.stroke()}),{gloss:1.2,rim:.5});
    wingPair(g,m,wm,WING.drag,[0,.36,.08],.62,.1,-.15,.02);wingPair(g,m,wm,WING.drag,[0,.36,.0],.58,.06,.2,.02);markGlow(g,P(g,G.s(.02),m.glow('#7FF7E8',2.5),[0,.38,.12]))});
B('morphofalter',bugMeta('Blauer Morphofalter','korallen','luft','tag',4,4000,'Ich hab einen Blauen Morphofalter gefangen! So blau – der Himmel ist ein bisschen neidisch.',
  'Das leuchtende Blau des Morphofalters ist gar keine Farbe: Winzige Schuppen-Strukturen brechen das Licht so, dass nur Blau zurückgeworfen wird. Man nennt das Strukturfarbe. Klappt er die Flügel zusammen, ist er braun und fast unsichtbar – Tarnung im Handumdrehen.'),
  (g,m)=>butterfly(g,m,'morpho',x=>{const gr=x.createLinearGradient(0,0,1,1);gr.addColorStop(0,'#2E6FE0');gr.addColorStop(.6,'#5AD0FF');gr.addColorStop(1,'#3F8FF0');x.fillStyle=gr;x.fillRect(0,0,1,1);x.strokeStyle='#26244E';x.lineWidth=.14;x.strokeRect(0,0,1,1);x.fillStyle='#fff';[[.88,.8],[.92,.62]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,.025,0,TAU);x.fill()})},
    x=>{x.fillStyle='#3F8FF0';x.fillRect(0,-1,1,1);x.strokeStyle='#26244E';x.lineWidth=.12;x.beginPath();x.moveTo(.1,-.05);x.lineTo(.6,-.3);x.lineTo(.82,-.62);x.lineTo(.5,-.85);x.lineTo(.18,-.6);x.stroke()},'#4A3A40',{fs:.62,hs:.55}));
B('meerlaeufer',bugMeta('Meeres-Wasserläufer','korallen','wasser','tag',2,550,'Ich hab einen Meeres-Wasserläufer gefangen! Er läuft übers Meer. Ich kann nicht mal übers Wasser in der Badewanne laufen.',
  'Meeres-Wasserläufer sind die einzigen Insekten, die auf dem offenen Ozean leben – tausende Kilometer vom Land entfernt. Winzige wasserabweisende Härchen lassen sie auf der Oberfläche flitzen. Ihre Eier kleben sie an Treibgut – heute leider oft an Plastikmüll.'),
  (g,m)=>{const c=m.c('#5A5A7A',{gloss:.8,rim:.6});P(g,G.ca(.06,.3),c,[0,.12,0],[PI/2,0,0]);P(g,G.s(.06),c,[0,.13,.22]);bugFace(g,m,[0,.13,.22],.06,.7,{er:.35,mouth:false});
    both(s=>{P(g,G.tu([[s*.04,.11,.1],[s*.16,.16,.22],[s*.2,.012,.32]],.014),c);P(g,G.tu([[s*.04,.11,0],[s*.3,.22,.02],[s*.5,.012,0]],.014),c);P(g,G.tu([[s*.04,.11,-.05],[s*.3,.2,-.2],[s*.46,.012,-.38]],.014),c);
      P(g,G.circ(.06),m.c('#8FD3FF',{opacity:.5}),[s*.5,.004,0],[-PI/2,0,0]);P(g,G.circ(.05),m.c('#8FD3FF',{opacity:.5}),[s*.46,.004,-.38],[-PI/2,0,0])});feelers(g,c,null,[.02,.15,.27],.12,.08,.4)});
B('gottesanbeterin',bugMeta('Gottesanbeterin','korallen','blume','tag',3,1800,'Ich hab eine Gottesanbeterin gefangen! Sie hat so höflich die Hände gefaltet, ich hab mich fast entschuldigt.',
  'Gottesanbeterinnen können ihren Kopf fast rundherum drehen und sehen sogar dreidimensional. Mit ihren Fangarmen schnappen sie in Sekundenbruchteilen zu. Viele Arten tarnen sich perfekt als Blüte oder Blatt – Blumen mit Hunger, sozusagen.'),
  (g,m)=>{const gm=m.c('#A6E36A',{gloss:.5,rim:.7}),dm=m.c('#7CC46A');P(g,G.ca(.08,.36),gm,[0,.2,-.18],[PI/2-.15,0,0]);P(g,G.ca(.045,.24),gm,[0,.32,.12],[.7,0,0]);
    const h=grp(g,[0,.46,.24]);P(h,G.la([[0,-.07],[.09,-.03],[.1,.03],[0,.07]],Q(16)),gm,[0,0,0],[PI/2,0,0],[1.3,1,1]);both(s=>{P(h,G.s(.045),m.gloss('#6AB04A'),[s*.1,.03,.0]);P(h,G.s(.014),m.flat('#fff'),[s*.11,.05,.035])});P(h,G.to(.02,.007,PI),m.c('#B8475F'),[0,-.035,.06],[0,0,PI]);
    both(s=>{P(g,G.tu([[s*.04,.34,.18],[s*.08,.26,.32],[s*.06,.4,.36]],.025,.02),gm);P(g,G.tu([[s*.06,.4,.36],[s*.05,.32,.42]],.018),dm)});feelers(g,dm,null,[.02,.5,.28],.16,.08,.6);
    legs(g,dm,[[.0,.2,.05,.05],[-.14,.22,-.05,.05]],.18,.016);basis(P(g,G.puff(WING.drag,.02),dm,[0,.3,.0],null,[.5,1.1,1]),[0,-.18,-1],[-1,0,0],[0,1,-.18])});
/* --- Schrott-Mond --- */
B('loet_kaefer',bugMeta('Löt-Käfer','schrott','schrott','tag',2,700,'Ich hab einen Löt-Käfer gefangen! Er hat mir gleich meine Taschenlampe repariert. Was für ein Schatz!',
  'Der Löt-Käfer lebt in Elektroschrott und verbindet mit seiner heissen Nasenspitze lose Kontakte wieder. Er ist das Maskottchen der Repair-Cafés auf dem Schrott-Mond. Reparieren statt Wegwerfen spart Rohstoffe, Energie und ganz viel Ärger.'),
  (g,m)=>{shellDome(g,m,'#E0905A',[0,.22,-.08],.25,1.25,{mat:m.copper()});P(g,G.s(.14),m.c('#4B5E9C',{gloss:.8}),[0,.2,.2]);bugFace(g,m,[0,.2,.22],.13,.6);
    P(g,G.cy(.03,.02,.18),m.steel(),[0,.16,.38],[PI/2,0,0]);P(g,G.co(.02,.06),m.steel(),[0,.16,.5],[PI/2,0,0]);markGlow(g,P(g,G.s(.022),m.glow('#FF8A3D',3),[0,.16,.53]));
    feelers(g,m.c('#4A4458'),m.c('#F0556E',{gloss:1}),[.05,.3,.28],.16,.1);legs(g,m.steel(),[[.14,.28,.06],[0,.32,0],[-.14,.3,-.06]],.14,.02);P(g,G.tu(range(10,(t)=>[Math.cos(t*TAU*2)*.04,.44+t*.02,-.2+t*.15]),.012),m.c('#C8C8D8',{gloss:.8}))});
B('nano_drohne',bugMeta('Nano-Drohne','schrott','luft','immer',3,1500,'Ich hab eine Nano-Drohne gefangen! Sie hat gerade ein Selfie von uns gemacht.',
  'Weil es weltweit weniger Insekten gibt, bauen Forschende tatsächlich winzige Drohnen, die Blüten bestäuben sollen. Aber keine Maschine kann eine Wiese voller Bienen, Hummeln und Schwebfliegen ersetzen. Die Nano-Drohne sieht das genauso und hilft lieber beim Zählen.'),
  (g,m)=>{P(g,G.s(.16),m.c('#F3F0FA',{gloss:1}),[0,.3,0],null,[1,.7,1.2]);P(g,G.s(.07),m.c('#2E3A5E',{gloss:1.4}),[0,.3,.16]);P(g,G.s(.025),m.flat('#fff'),[.02,.33,.22]);
    both(s=>both(t=>{const p=[s*.32,.36,t*.28];bt(g,[s*.1,.32,t*.08],p,.02,m.c('#8E6BD1'));P(g,G.cy(.03,.03,.05),m.c('#8E6BD1'),p);P(g,G.cy(.13,.13,.012),m.c('#7FF7E8',{opacity:.55}),[p[0],p[1]+.035,p[2]]);P(g,G.bx(.24,.008,.03,.004),m.c('#4A4458'),[p[0],p[1]+.035,p[2]],[0,s*t*.6,0])}));
    markBlink(g,markGlow(g,P(g,G.s(.025),m.glow('#FF5A6A',2.4),[0,.42,-.08])));both(s=>bt(g,[s*.08,.22,0],[s*.12,.02,0],.012,m.steel()))});
B('pixel_falter',bugMeta('Pixel-Falter','schrott','luft','nacht',2,800,'Ich hab einen Pixel-Falter gefangen! Er flattert mit 60 Bildern pro Sekunde.',
  'Der Pixel-Falter wohnt in alten Bildschirmen auf dem Schrott-Mond und leuchtet nachts in allen RGB-Farben. Echte Nachtfalter orientieren sich am Mond – und verwechseln leider oft Lampen damit. Deshalb schaltet man im Cyborg-Labor nachts die Aussenlichter aus.'),
  (g,m)=>{const wing=(x)=>{const c=['#FF8FB8','#7FF7E8','#FFE27A','#C6A9FF','#6AA8F0'];for(let j=0;j<8;j++)for(let i=0;i<8;i++){x.fillStyle=c[(i*3+j*2)%5];x.fillRect(i/8,j/8,1/8+.002,1/8+.002)}};
    butterfly(g,m,'pixel',wing,x=>{x.save();x.translate(0,-1);wing(x);x.restore()},'#3B3450',{fs:.52,hs:.46});markGlow(g,P(g,G.s(.03),m.glow('#7FF7E8',2.5),[0,.42,.3]))});
B('usb_assel',bugMeta('USB-Assel','schrott','schrott','immer',1,250,'Ich hab eine USB-Assel gefangen! Erst passte sie nicht rein, dann umgedreht, dann wieder nicht, dann doch.',
  'Asseln sind Krebstiere, die an Land leben und totes Material zersetzen. Die USB-Assel frisst alte Kabel und rollt sich bei Gefahr zu einem ordentlichen Knäuel. Wer sie in einen Computer steckt, bekommt 5 Gigabyte Kompost-Fotos geschenkt.'),
  (g,m)=>{const c=m.c('#C6A9FF',{gloss:.8,rim:.6});range(6,(t,i)=>P(g,G.s(.19*(1-Math.abs(t-.4)*.5)),i%2?c:m.c('#B09AE8',{gloss:.8}),[0,.12,.18-t*.55],null,[1.2,.7,.4]));
    P(g,G.bx(.16,.08,.16,.02),m.steel(),[0,.12,.32]);P(g,G.bx(.1,.03,.02,.005),m.c(PAL.ink),[0,.12,.405]);both(s=>{eye(g,m,[s*.1,.15,.24],.04,[s*.5,.2,1])});legs(g,m.c('#6E6A7E'),[[.16,.2,.04],[.04,.22,0],[-.08,.22,0],[-.2,.2,-.04]],.08,.016)});
B('kondensator_wanze',bugMeta('Kondensator-Wanze','schrott','schrott','nacht',2,500,'Ich hab eine Kondensator-Wanze gefangen! Sie steht ein bisschen unter Spannung.',
  'Wanzen erkennt man an ihrem schildförmigen Rücken und dem Saugrüssel. Die Kondensator-Wanze speichert tagsüber Ladung und gibt sie nachts in winzigen Funken ab. Anfassen kitzelt – aber nur ein bisschen.'),
  (g,m)=>{const sh=sshp([[0,.3],[.22,.12],[.2,-.15],[0,-.32],[-.2,-.15],[-.22,.12]]);P(g,G.puff(sh,.1,.04),m.c('#4B7BE5',{gloss:1}),[0,.2,-.02],[-PI/2,0,0]);P(g,G.to(.1,.018),m.steel(),[0,.27,-.04],[PI/2,0,0]);P(g,G.bx(.16,.01,.03,.004),m.c('#FFFBF0'),[0,.275,-.2]);
    P(g,G.s(.1),m.c('#3B3450',{gloss:.8}),[0,.2,.3]);bugFace(g,m,[0,.2,.3],.1,.6);both(s=>{bt(g,[s*.08,.1,-.2],[s*.1,.012,-.3],.014,m.steel());P(g,G.s(.03),m.glow('#FFE27A',2.4),[s*.08,.3,.12])});
    feelers(g,m.c('#3B3450'),m.c('#FFE27A',{gloss:1}),[.04,.26,.36],.14,.1);legs(g,m.c('#3B3450'),[[.14,.28,.06],[0,.3,0],[-.12,.28,-.06]],.14,.018)});
B('kabel_raupe',bugMeta('Kabel-Raupe','schrott','schrott','tag',1,180,'Ich hab eine Kabel-Raupe gefangen! Wenn sie sich verpuppt, wird sie bestimmt ein Verlängerungskabel.',
  'Raupen fressen ohne Pause, um genug Energie für ihre Verwandlung zu sammeln. Die Kabel-Raupe knabbert sich durch Elektroschrott und sortiert dabei Kupfer, Plastik und Gold. Aus ihrem Kokon schlüpft – das weiss noch niemand. Das Museum wartet gespannt.'),
  (g,m)=>{const cols=['#FF7E6B','#FFE27A','#7FDCE6','#A6EBC3','#C6A9FF'];const pts=range(8,(t)=>[Math.sin(t*PI*1.3)*.06,.1+Math.max(0,Math.sin(t*PI*1.8))*.08,-.35+t*.62]);pts.forEach((p,i)=>{P(g,G.s(.085),m.gloss(cols[i%5]),p);both(s=>P(g,G.cy(.02,.02,.05),m.copper(),[p[0]+s*.05,.03,p[2]]))});
    const h=[pts[7][0],pts[7][1]+.04,pts[7][2]+.1];P(g,G.bx(.2,.18,.16,.05),m.c('#FFFBF0',{gloss:1}),h);both(s=>{bt(g,[h[0]+s*.04,h[1],h[2]+.08],[h[0]+s*.04,h[1],h[2]+.16],.014,m.steel());eye(g,m,[h[0]+s*.06,h[1]+.04,h[2]+.08],.032,[s*.3,.2,1])})});
B('chip_ameise',bugMeta('Chip-Ameise','schrott','boden','tag',1,150,'Ich hab eine Chip-Ameise gefangen! Ihr Hinterteil hat mehr Rechenleistung als mein erster Computer.',
  'Ameisen lösen gemeinsam schwierige Aufgaben, etwa den kürzesten Weg zum Futter zu finden – Informatiker haben davon ganze Rechenverfahren abgeschaut. Die Chip-Ameise trägt einen echten Mikrochip auf dem Rücken. Ob sie ihn benutzt, ist unklar.'),
  (g,m)=>{const a=m.c('#3B3450',{gloss:.8,rim:.5});P(g,G.bx(.24,.1,.28,.04),m.tex('pcb',ctex('pcb',256,160,()=>{}),{gloss:.5}),[0,.2,-.2]);range(3,(t,i)=>both(s=>P(g,G.bx(.04,.02,.03,.005),m.steel(),[s*.13,.18,-.3+i*.1])));P(g,G.bx(.1,.03,.1,.01),m.c(PAL.ink),[0,.26,-.2]);
    P(g,G.s(.07),a,[0,.2,.02],null,[1,1,1.4]);P(g,G.s(.12),a,[0,.24,.2]);bugFace(g,m,[0,.24,.2],.12,.55,{cheek:true});feelers(g,a,m.glow('#7FF7E8',2.4),[.04,.32,.26],.18,.12,.7,true);legs(g,m.steel(),[[.08,.24,.1],[.02,.26,0],[-.04,.24,-.1]],.18,.018)});
B('bestaeuber_drohne',bugMeta('Bestäuber-Drohne','schrott','blume','tag',3,1300,'Ich hab eine Bestäuber-Drohne gefangen! Sie summt, aber irgendwie … elektrisch.',
  'Eine Biene besucht an einem Tag bis zu 3000 Blüten – so viel schafft keine Maschine. Die Bestäuber-Drohne vom Schrott-Mond wurde gebaut, als die Bienen dort verschwunden waren. Inzwischen pflanzt sie vor allem Blumenwiesen, damit die echten Bienen zurückkommen.'),
  (g,m)=>{P(g,G.bx(.3,.26,.44,.12),m.tex('bdr',ctex('bdr',128,128,(x,w,h)=>{x.fillStyle='#FFD65A';x.fillRect(0,0,w,h);x.fillStyle='#4A4458';for(let i=0;i<3;i++)x.fillRect(0,h*(.15+i*.3),w,h*.14)}),{gloss:1}),[0,.3,-.06]);
    P(g,G.bx(.22,.18,.14,.06),m.c('#4A4458',{gloss:1}),[0,.3,.22]);both(s=>{P(g,G.s(.05),m.glow('#7FF7E8',2.2),[s*.06,.33,.29]);bt(g,[s*.04,.4,.24],[s*.1,.52,.3],.012,m.steel());P(g,G.s(.025),m.c('#FF8FB8',{gloss:1}),[s*.1,.53,.3])});
    both(s=>{const r=grp(g,[s*.2,.46,-.05],[0,0,s*.3]);P(r,G.cy(.16,.16,.012),m.c('#E8F6FF',{opacity:.5}),[0,0,0]);P(r,G.bx(.3,.012,.04,.005),m.c('#8D89A6'),[0,.01,0],[0,.6,0]);bt(g,[s*.12,.4,-.05],[s*.2,.46,-.05],.018,m.steel())});
    P(g,G.co(.03,.08),m.steel(),[0,.26,-.32],[-PI/2,0,0]);range(2,(t,i)=>both(s=>bt(g,[s*.1,.2,-.1+i*.14],[s*.16,.012,-.12+i*.16],.013,m.steel())))});
/* ======================= FUNDSTÜCKE (Ausgraben) ======================= */
const REL=(id,meta,b)=>RELICS.push(Object.assign({id},meta,{b:(g,m,o,r)=>{wrap(b)(g,m,o,r);settle(g)}}));
const relMeta=(n,planet,kind,rarity,price,text,fact)=>({n,planet,kind,rarity,price,text,fact});
const stoneM=(m,c)=>m.c(c||'#D8C8B0',{rim:.45,gloss:.2});
REL('ammonit',relMeta('Ammonit','kompost','fossil',2,1200,'Ich hab einen Ammoniten ausgegraben! Eine Schnecke, die seit 70 Millionen Jahren Mittagsschlaf macht.',
  'Ammoniten waren Tintenfisch-Verwandte mit spiralförmigem Gehäuse und lebten über 300 Millionen Jahre in den Meeren. Mit dem Ende der Dinosaurier verschwanden auch sie. Ihre Spirale folgt fast perfekt einer mathematischen Kurve – die Natur rechnet gern mit.'),
  (g,m)=>{const q=grp(g,[0,.46,0]);P(q,G.cy(.44,.44,.2),stoneM(m,'#D2BEA0'),[0,0,0],[PI/2,0,0]);
    P(q,G.tu(range(Q(40),(t)=>{const a=t*TAU*2.6;const r=.05+t*.33;return[Math.cos(a)*r,Math.sin(a)*r,.1]}),.018,.075),stoneM(m,'#E6D6B8'));
    range(18,(t,i)=>{const a=t*TAU*.95;P(q,G.bx(.03,.12,.05,.012),stoneM(m,'#C2AE90'),[Math.cos(a)*.38,Math.sin(a)*.38,.08],[0,0,a])});P(g,G.blob(.35,.1,2,2),stoneM(m,'#C9B9A8'),[0,.05,0],null,[1.4,.25,.9])});
REL('trilobit',relMeta('Trilobit','kompost','fossil',2,1500,'Ich hab einen Trilobiten ausgegraben! Sieht aus wie eine Assel mit Kostüm. Uralt-Kostüm.',
  'Trilobiten krabbelten schon vor über 500 Millionen Jahren über den Meeresboden – lange bevor es Fische mit Kiefern gab. Sie hatten einige der ältesten Augen der Welt, mit Linsen aus Kalkstein. Ihr Körper war in drei Längsteile gegliedert, daher der Name.'),
  (g,m)=>{const st=stoneM(m,'#B8A48C');P(g,G.blob(.5,.08,2,4),stoneM(m,'#D8C8B0'),[0,.06,0],null,[1.2,.16,1.3]);
    P(g,G.s(.3),st,[0,.14,.3],null,[1.2,.35,.7]);both(s=>P(g,G.s(.05),m.c('#8A7A6A',{gloss:.8}),[s*.14,.24,.32]));
    range(8,(t,i)=>{const z=.14-i*.075,w=.34-i*.025;P(g,G.ca(.035,w*2-.07),st,[0,.16,z],[0,0,PI/2],[1,1,1.1]);P(g,G.s(.05),stoneM(m,'#A8947C'),[0,.2,z])});P(g,G.s(.06),st,[0,.15,-.48],null,[1.3,.6,1])});
REL('dino_zahn',relMeta('Dino-Zahn','kompost','fossil',3,2500,'Ich hab einen Dino-Zahn ausgegraben! Zähneputzen war damals bestimmt eine Tagesaufgabe.',
  'Fleischfressende Dinosaurier verloren ständig Zähne und bekamen einfach neue – ein Leben lang. Die kleinen Sägezähne an der Kante funktionierten wie ein Steakmesser. Heute leben die Nachfahren der Dinosaurier noch unter uns: die Vögel.'),
  (g,m)=>{const geo=G.la(range(12,(t)=>[Math.sin(Math.min(1,(1-t)*1.4)*PI/2)*.2+.001,t*.95]),Q(20));const p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setZ(i,p.getZ(i)*.65-y*y*.3);p.setX(i,p.getX(i))}geo.computeVertexNormals();
    P(g,geo,m.c('#F3E9D2',{gloss:.6,rim:.6}),[0,.12,.1]);P(g,G.la([[0,0],[.22,0],[.2,.14],[0,.16]],Q(20)),m.c('#C9A27A'),[0,0,.1],null,[1,1,.7]);range(6,(t,i)=>P(g,G.co(.018,.04),m.c('#E6D8BA'),[0,.3+t*.5,.1+.13-t*.02-(.3+t*.5)*(.3+t*.5)*.3],[PI/2,0,0]))});
REL('bernstein',relMeta('Bernstein mit Mücke','kompost','fossil',4,4500,'Ich hab Bernstein mit einer Mücke drin gefunden! Sie wartet seit 40 Millionen Jahren auf ihren Stich.',
  'Bernstein ist versteinertes Baumharz. Manchmal wurden darin Insekten, Pollen oder Federn eingeschlossen und bis heute perfekt erhalten. Dass man daraus Dinosaurier klonen kann, ist aber nur ein Film – die Erbinformation ist längst zerfallen.'),
  (g,m)=>{P(g,G.blob(.4,.1,2,3),m.c('#FFA630',{opacity:.7,gloss:1.4,rim:1}),[0,.34,0],null,[1,.85,.75]);
    const b=grp(g,[0,.36,0],[0,.5,.3]);P(b,G.ca(.03,.14),m.c('#4A3A30'),[0,0,0],[PI/2,0,0]);P(b,G.s(.04),m.c('#4A3A30'),[0,.0,.12]);both(s=>{P(b,G.puff(WING.bee,.01),m.c('#E8D8C0'),[s*.02,.04,.02],[PI/2,0,s>0?.3:PI-.3],.25);range(3,(t,i)=>bt(b,[0,0,.04-i*.05],[s*.12,-.08,.02-i*.06],.006,m.c('#4A3A30')))});
    P(g,G.blob(.2,.12,2,2),m.c('#E08A30',{gloss:1}),[.1,.3,.12],null,[1,.8,.6]).visible=false;P(g,G.blob(.3,.1,2,6),stoneM(m,'#C9B9A8'),[0,.04,0],null,[1.5,.25,1.2])});
REL('farn_fossil',relMeta('Farn-Abdruck','kompost','fossil',2,900,'Ich hab einen Farn-Abdruck ausgegraben! Ein Blatt, das sich für die Ewigkeit fotografieren liess.',
  'Farne gab es schon vor über 350 Millionen Jahren. Aus riesigen Farn- und Schachtelhalm-Wäldern entstand später Steinkohle. Wer Kohle verbrennt, verbrennt also uralte Wälder – und deren gespeichertes CO₂ landet wieder in der Luft.'),
  (g,m)=>{const tx=ctex('farn',256,256,(x,w,h)=>{x.fillStyle='#CFC0A8';x.fillRect(0,0,w,h);x.strokeStyle='#8A7A66';x.lineCap='round';x.lineWidth=6;x.beginPath();x.moveTo(60,230);x.quadraticCurveTo(120,120,200,30);x.stroke();x.lineWidth=5;
    for(let i=1;i<14;i++){const t=i/14;const px=60+140*t+(1-t)*t*40,py=230-200*t;const L=60*(1-t*.8);both(s=>{x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+s*L*.6,py-L*.1,px+s*L*.7+(s>0?10:-10),py-L*.5+(s>0?30:0));x.stroke()})}});
    P(g,G.bx(1,.18,.8,.08),stoneM(m,'#C2B29A'),[0,.09,0],[0,.2,0]);P(g,G.bx(.9,.02,.7,.01),m.tex('farn',tx,{rim:.3}),[0,.185,0],[0,.2,0])});
REL('mammut_zahn',relMeta('Mammut-Stosszahn','kompost','fossil',5,8000,'Ich hab einen Mammut-Stosszahn ausgegraben! Der war bestimmt super zum Schneeschippen.',
  'Wollhaarmammuts lebten während der Eiszeit und starben erst vor etwa 4000 Jahren endgültig aus – da gab es schon die Pyramiden! Mit ihren gebogenen Stosszähnen schoben sie Schnee beiseite, um an Gras zu kommen. Heute tauen im Permafrost immer mehr Mammut-Reste auf.'),
  (g,m)=>{const pts=range(8,(t)=>{const a=t*PI*1.05;return[-.1+Math.sin(a)*.1+t*.6,.1+Math.sin(a*.9)*.55,-Math.cos(a)*.1]});P(g,G.tu(pts,.13,.03),m.c('#F3E9D2',{gloss:.5,rim:.6}));P(g,G.s(.13),m.c('#E0CFAE'),pts[0]);
    range(4,(t,i)=>{const p=pts[1+i];P(g,G.to(.12-i*.02,.012),m.c('#D8C8A8'),p,[PI/2,.5,0])});P(g,G.blob(.3,.1,2,5),stoneM(m,'#A89880'),[-.05,.04,0],null,[1.4,.3,1])});
REL('floppy_disk',relMeta('Diskette','schrott','elektro',1,300,'Ich hab eine Diskette ausgegraben! Da passt genau ein halbes Katzenfoto drauf.',
  'Auf eine Diskette passten 1,44 Megabyte – das ist weniger als ein einziges Handyfoto heute. Trotzdem lebt sie weiter: als „Speichern“-Knopf in fast jedem Programm. Das Museum lagert darauf seine Lieblingswitze. Alle drei.'),
  (g,m)=>{const q=grp(g,[0,.45,0],[-.2,0,0]);P(q,G.bx(.9,.9,.08,.05),m.c('#6AA8F0',{gloss:1}));P(q,G.bx(.44,.26,.02,.02),m.steel(),[.06,.3,.045]);P(q,G.bx(.1,.18,.022,.01),m.c('#4B5E9C'),[.15,.3,.05]);
    P(q,G.bx(.64,.44,.02,.02),m.tex('floppy',ctex('floppy',256,176,(x,w,h)=>{x.fillStyle='#FFFBF0';x.fillRect(0,0,w,h);x.strokeStyle='#8FD3FF';x.lineWidth=3;for(let i=1;i<6;i++){x.beginPath();x.moveTo(10,i*30);x.lineTo(w-10,i*30);x.stroke()}x.fillStyle='#F0556E';x.font='bold 34px "Comic Sans MS",sans-serif';x.fillText('KOMPOST',18,52);x.fillStyle='#3B3450';x.font='26px "Comic Sans MS",sans-serif';x.fillText('rezepte_final2.txt',14,112)})),[0,-.2,.045]);
    P(q,G.bx(.07,.07,.02,.01),m.c(PAL.ink),[-.36,-.38,.045])});
REL('tamagotchi',relMeta('Taschen-Haustier','schrott','elektro',2,800,'Ich hab ein Taschen-Haustier ausgegraben! Es hat Hunger. Seit 1997.',
  'In den 90ern fütterten Kinder auf der ganzen Welt pixelige Haustiere in Ei-förmigen Geräten – und waren traurig, wenn sie „starben“. Ein frühes Beispiel dafür, wie wir mit Maschinen Beziehungen eingehen. Donna Haraway würde sagen: Auch das ist eine Art Verwandtschaft.'),
  (g,m)=>{const q=grp(g,[0,.5,0]);P(q,G.s(.42),m.c('#FF8FB8',{gloss:1}),[0,0,0],null,[1,1.1,.5]);P(q,G.s(.3),m.c('#FFFBF0'),[0,.02,.1],null,[1,1,.4]);
    P(q,G.bx(.3,.26,.02,.03),m.tex('tama',ctex('tama',64,64,(x,w,h)=>{x.fillStyle='#BFE0A8';x.fillRect(0,0,w,h);x.fillStyle='#3B3450';const px=[[3,2],[4,2],[2,3],[3,3],[4,3],[5,3],[2,4],[5,4],[3,4],[4,4],[2,5],[5,5],[3,1],[4,1]];px.forEach(([a,b])=>x.fillRect(a*6+8,b*6+12,6,6));x.fillStyle='#F0556E';x.fillRect(48,8,6,6)}),{gloss:.8,emissive:'#223322'}),[0,.06,.22]);
    range(3,(t,i)=>P(q,G.s(.045),m.gloss(['#FFE27A','#7FDCE6','#FFE27A'][i]),[(t-.5)*.24,-.2,.2+(1-Math.abs(t-.5)*2)*.01],null,[1,1,.6]));P(q,G.to(.08,.02),m.steel(),[0,.5,0],[0,PI/2,0]);P(q,G.to(.14,.018),m.c('#7FDCE6',{gloss:1}),[0,.66,0],[0,PI/2,0])});
REL('waehlscheibentelefon',relMeta('Wählscheiben-Telefon','schrott','elektro',3,1800,'Ich hab ein Wählscheiben-Telefon ausgegraben! Nummer wählen dauert so lange, man vergisst, wen man anrufen wollte.',
  'Bei Wählscheiben-Telefonen drehte man für jede Ziffer eine Scheibe herum, und sie schnurrte zurück. Das Telefon hing an einer Kabelschnur – Laufen während des Telefonierens war nur im Radius von zwei Metern möglich. Diese Geräte hielten oft 40 Jahre. Heute schaffen Handys selten fünf.'),
  (g,m)=>{const c=m.c('#56C6B6',{gloss:1});P(g,G.la([[0,0],[.42,0],[.44,.06],[.36,.3],[.28,.4],[0,.42]],Q(28)),c,[0,0,0],null,[1,1,.85]);
    const d=grp(g,[0,.27,.2],[-.75,0,0]);P(d,G.cy(.2,.2,.04),m.c('#FFFBF0',{gloss:.8}),[0,0,0]);range(10,(t,i)=>{const a=i/10*TAU*.8+.6;P(d,G.cy(.028,.028,.05),m.c('#3B3450'),[Math.cos(a)*.14,.01,Math.sin(a)*.14])});P(d,G.cy(.06,.06,.05),c,[0,.01,0]);
    const h=grp(g,[0,.5,0]);P(h,G.ca(.06,.6),c,[0,0,0],[0,0,PI/2]);both(s=>P(h,G.s(.1),c,[s*.36,-.02,0],null,[1,.7,1.1]));
    P(g,G.tu(range(Q(30),(t)=>{const a=t*TAU*7;return[.36+t*.35,.4-t*.38+Math.sin(a)*.04,Math.cos(a)*.04]}),.016),c)});
REL('nokia_stein',relMeta('Ziegel-Handy','schrott','elektro',2,700,'Ich hab ein Ziegel-Handy ausgegraben! Akku noch halb voll. Nach 25 Jahren im Boden. Respekt.',
  'Die ersten Handys waren so robust, dass man mit ihnen angeblich Nüsse knacken konnte, und der Akku hielt tagelang. Heute stecken in jedem Handy über 30 verschiedene Metalle, manche davon aus Konfliktregionen. Die beste Umweltbilanz hat ein Handy, das lange benutzt wird.'),
  (g,m)=>{const q=grp(g,[0,.5,0],[-.25,0,0]);P(q,G.bx(.44,.9,.18,.09),m.c('#4B5E9C',{gloss:.9}));P(q,G.bx(.32,.22,.02,.02),m.tex('nk',ctex('nk',64,48,(x,w,h)=>{x.fillStyle='#A6D97E';x.fillRect(0,0,w,h);x.fillStyle='#3B3450';for(let i=0;i<5;i++)x.fillRect(6+i*6,34-i*4,4,4+i*4);x.fillRect(40,10,16,3);x.fillRect(46,18,10,3)})),[0,.22,.095]);
    range(12,(t,i)=>P(q,G.bx(.08,.05,.02,.015),m.c('#E6E0F0',{gloss:.6}),[-.1+(i%3)*.1,-.04-Math.floor(i/3)*.075,.095]));P(q,G.bx(.2,.05,.02,.02),m.c('#E6E0F0',{gloss:.6}),[0,.06,.095]);P(q,G.ca(.035,.1),m.c('#3B3450'),[.14,.53,0])});
REL('gluehbirne',relMeta('Glühbirne','schrott','elektro',1,250,'Ich hab eine Glühbirne ausgegraben! Mir ist gerade ein Licht aufgegangen. Ha. Ha.',
  'Klassische Glühbirnen verwandelten nur etwa 5 Prozent ihres Stroms in Licht – der Rest wurde zu Wärme. LEDs brauchen für dasselbe Licht rund 85 Prozent weniger Energie. Diese hier leuchtet trotzdem noch: aus reiner Nostalgie.'),
  (g,m)=>{P(g,G.la([[0,.3],[.16,.32],[.28,.46],[.34,.62],[.3,.8],[.18,.92],[0,.95]],Q(28)),m.glass('#FFF6D0'));markGlow(g,P(g,G.tu(range(10,(t)=>[Math.sin(t*TAU*2)*.08,.5+t*.14,Math.cos(t*TAU*2)*.08*.3]),.012),m.glow('#FFB030',2.6)));
    bt(g,[-.06,.32,0],[-.07,.52,0],.01,m.steel());bt(g,[.06,.32,0],[.07,.52,0],.01,m.steel());markGlow(g,P(g,G.s(.2),m.glow('#FFF1A8',1),[0,.62,0]));
    range(4,(t,i)=>P(g,G.to(.14,.025),m.steel(),[0,.08+i*.055,0],[PI/2,0,0]));P(g,G.cy(.14,.14,.24),m.steel(),[0,.15,0]);P(g,G.cy(.06,.08,.06),m.c(PAL.ink),[0,.02,0])});
REL('walkman',relMeta('Walkman','schrott','elektro',3,2000,'Ich hab einen Walkman ausgegraben! Die Kassette hat Bandsalat. Ich nenne das Remix.',
  'Mit dem tragbaren Kassettenspieler konnte man 1979 zum ersten Mal Musik überall mit sich herumtragen. Wenn die Batterien schwach wurden, leierte die Musik ganz langsam. Die Kopfhörer mit den orangen Schaumpolstern sind heute Kult.'),
  (g,m)=>{P(g,G.bx(.7,.5,.22,.08),m.c('#6AA8F0',{gloss:1}),[0,.28,0]);P(g,G.bx(.5,.3,.02,.04),m.glass('#E8F6FF'),[0,.3,.115]);P(g,G.bx(.44,.24,.03,.03),m.c('#3B3450'),[0,.3,.1]);both(s=>{P(g,G.to(.05,.015),m.c('#FFFBF0'),[s*.12,.3,.12]);P(g,G.bx(.06,.04,.12,.015),m.steel(),[s*.1+.15,.55,0])});
    const hp=grp(g,[0,.1,-.05]);P(hp,G.to(.34,.025,PI),m.steel(),[0,.25,0]);both(s=>{P(hp,G.cy(.12,.12,.05),m.c('#FF8A3D',{rim:.9}),[s*.34,.25,0],[0,0,PI/2]);P(hp,G.cy(.08,.08,.06),m.c('#8D89A6'),[s*.33,.25,0],[0,0,PI/2])});
    P(g,G.tu([[.34,.35,-.05],[.5,.2,.1],[.3,.05,.25],[.3,.2,0]],.012),m.c(PAL.ink))});
REL('kassette',relMeta('Mixtape','schrott','elektro',1,200,'Ich hab ein Mixtape ausgegraben! Titel: „Songs zum Kompostieren Vol. 3“. Ich bin neugierig.',
  'Auf Musikkassetten nahm man Lieblingslieder aus dem Radio auf und verschenkte sie als „Mixtape“ – eine Liebeserklärung in 60 Minuten. Wenn das Band verknotete, spulte man es mit einem Bleistift zurück. Magnetband speichert Daten übrigens bis heute: in riesigen Archiven.'),
  (g,m)=>{const q=grp(g,[0,.36,0],[-.3,0,0]);P(q,G.bx(.9,.56,.1,.05),m.c('#FF8FB8',{gloss:1}));P(q,G.bx(.7,.3,.02,.02),m.tex('tape',ctex('tape',256,110,(x,w,h)=>{x.fillStyle='#FFFBF0';x.fillRect(0,0,w,h);x.fillStyle='#3B3450';x.font='22px "Comic Sans MS",sans-serif';x.fillText('Kompost Vol. 3 ♥',16,30);x.fillStyle='#3B3450';x.fillRect(40,50,176,46)})),[0,.04,.055]);
    both(s=>{P(q,G.cy(.07,.07,.03),m.c('#FFFBF0'),[s*.2,.04,.06],[PI/2,0,0]);range(6,(t,i)=>P(q,G.bx(.012,.03,.035,.004),m.c(PAL.ink),[s*.2+Math.cos(i)*.045,.04+Math.sin(i)*.045,.06],[0,0,i]))});P(q,G.bx(.5,.1,.02,.02),m.c('#6E6A7E'),[0,-.22,.055]);
    P(g,G.tu([[-.1,.08,.2],[.2,.05,.4],[.45,.03,.3],[.3,.02,.1],[.1,.02,.35]],.018),m.c('#6E4A3A',{gloss:.6}))});
REL('roehrenfernseher',relMeta('Röhrenfernseher','schrott','elektro',4,5000,'Ich hab einen Röhrenfernseher ausgegraben! Er zeigt immer noch das Testbild. Spannendes Programm.',
  'Röhrenfernseher schossen Elektronen auf eine leuchtende Glasfläche – und waren deshalb tief und schwer wie ein Umzugskarton voller Bücher. Im Glas steckt viel Blei, deshalb dürfen sie nie einfach auf den Müll. Auf dem Schrott-Mond dienen sie als gemütliche Höhlen für Pixel-Falter.'),
  (g,m)=>{P(g,G.bx(.9,.72,.72,.16),m.c('#E0A060',{gloss:.6}),[0,.44,0]);P(g,G.bx(.6,.46,.06,.12),m.tex('testbild',ctex('testbild',128,96,(x,w,h)=>{['#FFFBF0','#FFE27A','#7FDCE6','#A6EBC3','#FF8FB8','#F0556E','#6AA8F0'].forEach((c,i)=>{x.fillStyle=c;x.fillRect(i*w/7,0,w/7+1,h*.72)});x.fillStyle='#3B3450';x.fillRect(0,h*.72,w,h*.28);x.fillStyle='#FFFBF0';x.beginPath();x.arc(w/2,h*.36,18,0,TAU);x.fill()}),{gloss:1.2,emissive:'#222',rim:.4}),[-.08,.46,.34]);
    range(2,(t,i)=>P(g,G.cy(.04,.04,.04),m.c(PAL.ink),[.33,.6-i*.14,.36],[PI/2,0,0]));range(4,(t,i)=>P(g,G.bx(.12,.02,.02,.005),m.c('#B87A4A'),[.33,.3-i*.03,.36]));
    both(s=>{bt(g,[s*.05,.8,0],[s*.3,1.1,-.05],.012,m.steel());P(g,G.s(.03),m.steel(),[s*.3,1.1,-.05])});P(g,G.s(.07),m.c('#8D89A6'),[0,.8,0],null,[1,.6,1]);both(s=>P(g,G.bx(.1,.08,.1,.03),m.c(PAL.ink),[s*.35,.04,.25]))});
REL('computermaus',relMeta('Kugelmaus','schrott','elektro',1,150,'Ich hab eine Computermaus ausgegraben! Sie hat einen Schwanz aus Kabel. Wenigstens ist sie nicht weggelaufen.',
  'Alte Computermäuse hatten unten eine Gummikugel, die man regelmässig von Staub und Fusseln befreien musste. Die erste Maus von 1968 war aus Holz! Ihren Namen bekam sie wegen des Kabels, das wie ein Mäuseschwanz aussieht.'),
  (g,m)=>{P(g,G.s(.45),m.c('#E6E0F0',{gloss:1}),[0,.2,0],null,[.8,.55,1.2]);P(g,G.bx(.02,.06,.36,.01),m.c('#8D89A6'),[0,.44,.3],[.35,0,0]);P(g,G.bx(.5,.04,.03,.01),m.c('#8D89A6'),[0,.43,.08]);P(g,G.cy(.05,.05,.06),m.c('#B04A8A',{gloss:1}),[0,.44,.28],[PI/2,0,0]);
    P(g,G.tu([[0,.12,.5],[0,.08,.7],[.25,.05,.8],[.35,.04,.55],[.5,.03,.65]],.025),m.c('#8D89A6'));P(g,G.s(.1),m.rubber(),[0,.03,0],null,[1,.4,1])});
REL('klotz_konsole',relMeta('Klötzchen-Konsole','schrott','elektro',4,4200,'Ich hab eine Klötzchen-Konsole ausgegraben! Der Spielstand ist noch da: Level 99, fast geschafft!',
  'Die ersten tragbaren Spielkonsolen hatten grün-graue Bildschirme ohne Farben und liefen wochenlang mit vier Batterien. Man tauschte Spiele auf dem Schulhof und verband Konsolen per Kabel. Viele dieser Geräte funktionieren nach 30 Jahren noch – weil sie so einfach gebaut sind.'),
  (g,m)=>{const q=grp(g,[0,.52,0],[-.25,0,0]);P(q,G.bx(.6,.96,.16,.08),m.c('#D8D4E0',{gloss:.8}));P(q,G.bx(.46,.38,.02,.04),m.c('#6E6A7E'),[0,.2,.08]);P(q,G.bx(.32,.28,.02,.01),m.tex('gb',ctex('gb',64,56,(x,w,h)=>{x.fillStyle='#A6C47A';x.fillRect(0,0,w,h);x.fillStyle='#4E6E3A';x.fillRect(4,40,56,4);x.fillRect(10,24,8,16);x.fillRect(26,16,12,8);x.fillRect(44,28,8,12)}),{emissive:'#223311'}),[0,.2,.09]);
    P(q,G.bx(.16,.05,.03,.012),m.c(PAL.ink),[-.15,-.16,.08]);P(q,G.bx(.05,.16,.03,.012),m.c(PAL.ink),[-.15,-.16,.08]);both(s=>P(q,G.cy(.045,.045,.04),m.c('#B04A8A',{gloss:1}),[.14+s*.05,-.14+s*.04,.08],[PI/2,0,0]));
    range(2,(t,i)=>P(q,G.bx(.08,.025,.02,.01),m.c('#8D89A6'),[-.05+i*.11,-.32,.08],[0,0,-.4]))});
REL('cd',relMeta('Schimmer-CD','schrott','elektro',2,600,'Ich hab eine CD ausgegraben! Sie funkelt wie ein Regenbogen, der zu viel Kaffee getrunken hat.',
  'Auf CDs sind Daten als winzige Vertiefungen gespeichert, die ein Laser abtastet. Die Rillen brechen das Licht und machen daraus diesen Regenbogen-Schimmer – ganz ohne Farbe, wie beim Morphofalter. Leider bestehen CDs aus Polycarbonat und Alu und verrotten praktisch nie.'),
  (g,m)=>{const q=grp(g,[0,.45,0],[-.35,0,0]);P(q,G.bx(.9,.9,.08,.03),m.glass('#E8F6FF'));const d=grp(q,[0,0,0],[PI/2,0,0]);P(d,G.cy(.4,.4,.02),m.holo(),[0,0,0]);P(d,G.cy(.08,.08,.025),m.c('#E6E0F0'),[0,0,0]);P(d,G.cy(.03,.03,.03),m.c('#8D89A6'),[0,0,0]);P(q,G.bx(.9,.9,.02,.01),m.c('#4B5E9C'),[0,0,-.045])});
/* ======================= ITEMS (einfache Fundsachen) ======================= */
function settle(g){g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);if(b.isEmpty())return g;const dy=b.min.y-g.matrixWorld.elements[13];g.children.forEach(c=>c.position.y-=dy);return g}
const IT=(id,meta,b)=>ITEMS.push(Object.assign({id},meta,{b:(g,m,o,r)=>{wrap(b)(g,m,o,r);settle(g)}}));
const itMeta=(n,planet,kind,price)=>({n,planet,kind,price});
IT('muschel',itMeta('Herzmuschel','korallen','muschel',60),(g,m)=>{const q=grp(g,[0,.02,-.1],[-.55,0,0]);P(q,clamGeo(.42,1.25,10,.2,.14,.01,.035),shellMat(m,'#FFC9B8',10));P(q,G.s(.07),m.c('#E8A898'),[0,.01,0])});
IT('jakobsmuschel',itMeta('Jakobsmuschel','korallen','muschel',180),(g,m)=>{const q=grp(g,[0,.03,-.12],[-.6,0,0]);P(q,clamGeo(.5,1.2,14,.14,.06,.01,.06),shellMat(m,'#FFB27A',14));P(q,G.puff(sshp([[-.24,-.03],[.24,-.03],[.14,.14],[-.14,.14]]),.07),m.c('#F29A62'),[0,-.02,0])});
IT('schneckenhaus',itMeta('Schneckenhaus','korallen','muschel',90),(g,m)=>{spiralShell(g,m,'#F2C49A',.75,[0,.3,0],[-.3,.9,0])});
IT('sanddollar',itMeta('Sanddollar','korallen','muschel',250),(g,m)=>{const q=grp(g,[0,.3,0],[-.9,0,0]);P(q,G.cy(.42,.42,.07),m.tex('sanddollar',ctex('sanddollar',128,128,(x,w,h)=>{x.fillStyle='#EFE2C8';x.fillRect(0,0,w,h);x.fillStyle='#C9B08A';for(let i=0;i<5;i++){x.save();x.translate(64,64);x.rotate(i/5*TAU);x.beginPath();x.ellipse(0,-26,7,19,0,0,TAU);x.fill();x.restore()}x.beginPath();x.arc(64,64,5,0,TAU);x.fill();x.fillStyle='#E0D0B0';for(let i=0;i<40;i++){x.beginPath();x.arc(64+Math.cos(i)*(20+i),64+Math.sin(i*1.3)*(20+i*.8),2,0,TAU);x.fill()}}),{rim:.5}),[0,0,0]);P(q,G.to(.42,.035),m.c('#E8DAC0'),[0,0,0],[PI/2,0,0])});
IT('koralle_stueck',itMeta('Korallenstück','korallen','muschel',120),(g,m)=>{coralBranch(g,m,'#FF8FB8',.9,srand(3),[0,0,0])});
IT('seeglas',itMeta('Seeglas','korallen','muschel',200),(g,m)=>{P(g,G.blob(.3,.12,2,5),m.c('#9FE3C8',{gloss:1.2,rim:1.2,rimColor:'#ffffff'}),[0,.15,0],null,[1.3,.5,1]);P(g,G.blob(.18,.12,2,8),m.c('#8FD3FF',{gloss:1.2,rim:1.2,rimColor:'#ffffff'}),[.38,.1,.18],null,[1.2,.5,1])});
['apfel','birne','kirsche','pfirsich','orange','kokosnuss'].forEach(k=>IT(k,itMeta({apfel:'Apfel',birne:'Birne',kirsche:'Kirschen',pfirsich:'Pfirsich',orange:'Orange',kokosnuss:'Kokosnuss'}[k],k==='kokosnuss'?'korallen':'kompost','frucht',k==='kokosnuss'?250:100),(g,m)=>{const f=fruit(g,m,k,[0,.4,0],.8);g.userData.fruits.push(f)}));
IT('ast',itMeta('Ast','kompost','material',5),(g,m)=>{const w=m.c('#A0704C');P(g,G.tu([[-.5,.06,0],[-.1,.08,.03],[.5,.06,-.02]],.07,.045),w);P(g,G.s(.07),m.c('#E8C08A'),[-.5,.06,0]);P(g,G.tu([[.05,.08,.02],[.2,.2,.12],[.3,.3,.16]],.035,.02),w);P(g,flatLeaf(leafShape(.22,.08),.03,.3),m.c('#7CC46A'),[.3,.3,.16],[0,-.6,.3]);P(g,flatLeaf(leafShape(.18,.07),.03,.3),m.c('#8FD36B'),[.4,.07,-.02],[0,.8,.2])});
IT('stein_klein',itMeta('Kieselstein','alle','material',5),(g,m)=>{P(g,G.blob(.3,.1,2,4),m.c('#BDB6C8',{gloss:.4}),[0,.15,0],null,[1.3,.55,1]);P(g,G.s(.1),m.c('#D8D2E4'),[.12,.28,.08],null,[1,.3,.6])});
IT('schraube',itMeta('Schraube','schrott','material',10),(g,m)=>{const q=grp(g,[0,.14,0],[0,0,PI/2]);P(q,G.cy(.22,.22,.14,false),m.steel(),[0,.42,0]).geometry=new THREE.CylinderGeometry(.22,.22,.14,6);P(q,G.bx(.24,.03,.05,.01),m.c('#6E6A7E'),[0,.49,0]);
  P(q,G.cy(.09,.09,.62),m.steel(),[0,.04,0]);P(q,G.tu(range(Q(40),(t)=>{const a=t*TAU*7;return[Math.cos(a)*.1,-.26+t*.6,Math.sin(a)*.1]}),.02),m.steel());P(q,G.co(.09,.1),m.steel(),[0,-.31,0],[PI,0,0])});
IT('kabelrest',itMeta('Kabelrest','schrott','material',15),(g,m)=>{P(g,G.tu(range(Q(30),(t)=>{const a=t*TAU*1.6;const r=.3-t*.08;return[Math.cos(a)*r,.07+t*.08,Math.sin(a)*r]}),.055),m.c('#FF7E6B',{gloss:.8}));const e=[.22*Math.cos(TAU*1.6),.15,.22*Math.sin(TAU*1.6)];
  P(g,G.bx(.16,.12,.2,.04),m.c('#FFFBF0',{gloss:1}),[.3,.07,0]);both(s=>bt(g,[.3+s*.04,.07,.1],[.3+s*.04,.07,.2],.015,m.steel()));range(3,(t,i)=>P(g,G.tu([[e[0],e[1],e[2]],[e[0]-.05+i*.05,e[1]+.08,e[2]-.06]],.012,.008),m.copper()))});
/* Helfer für Erweiterungen (nature2.js) */
window.NH={wrap,N,RR,RP,basis,orient,eye,eyes,droop,flatLeaf,leafShape,flowerShape,scallop,crysGeo,crysMat,crystal,trunk,cloud,onBlob,clamGeo,shellMat,spiralShell,shade,ROCK,decalMesh,blobPath,smoothBlob,markGlow,markBlink,fruit,oak,fruitTree,pine,shroom,glowShroomCluster,bush,blossom,flower,FLOWER_COL,coralBranch,stump,F,fishT,fishMeta,fishTex,FT,TAILS,DORSALS,fin2,B,bugMeta,legs,feelers,bugFace,wingPair,WING,wingTex,shellDome,butterfly,REL,relMeta,stoneM,settle,IT,itMeta};
})();
