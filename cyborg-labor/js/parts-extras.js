/* ================= EXTRAS =================
   Spielzeug-Accessoires im Cozy-Stil. Jedes Extra hat eine eigene Zone, damit bis zu 4 gleichzeitig passen:
   Kopf oben ....... krone · partyhut · leitkegel · vogelnest · topfpflanze · heiligenschein (schwebt) · blume (seitlich)
   Kopf Seiten ..... hoergeraet · kopfhoerer · fernsteuer      Gesicht: zahnspange · tentakelbart      ganzer Kopf: blasenhelm
   Brust Mitte ..... herz · luefter        Brust rechts (+x): schrittmacher · namensschild      Brust links: bodycam · zahnraeder
   Bauch ........... aquarium · kompostbauch      Hüfte rechts: insulinpumpe · usb · qr      Hüfte links: korallen · spinnennetz
   Rücken .......... jetpack · server · akku · panzer · schneckenhaus · rueckenflosse · stacheln · kuehlrippen · umhang ·
                     engelsfluegel · bienenstock · antennen · auspuff · kabel · solar (hinter dem Kopf)
   Schultern ....... falter (rechts) · seerose (links) · schuessel (hinten rechts) · laterne (Stab links) · kristalle (hinten links)
   Überzug ......... efeu · moosflecken · biolumineszenz · pilz (Flanke) · pilzkolonie (untere Flanken)
*/
(function(){
const X=(id,n,k,b)=>def('extras',id,n,k,b);
const UP=new V3(0,1,0);

/* ---------- Rumpf-Oberfläche (folgt allen Rumpfformen) ---------- */
const tabF=tab=>u=>{if(u<=tab[0][0]||u>=tab[tab.length-1][0])return 0;for(let i=0;i<tab.length-1;i++){const[a,ra]=tab[i],[b,rb]=tab[i+1];if(u<=b)return ra+(rb-ra)*(u-a)/Math.max(1e-6,b-a)}return 0};
const ellF=k=>u=>{const a=u/k;return a*a<1?Math.sqrt(1-a*a):0};
const capF=(r,h,sy)=>u=>{const a=Math.max(0,Math.abs(u/sy)-h)/r;return a<1?r*Math.sqrt(1-a*a):0};
const SHAPE={
  ei:{f:ellF(1.1),z:.94,e:2}, kugel:{f:ellF(1),z:1,e:2}, kapsel:{f:capF(.85,.25,1),z:.92,e:2},
  birne:{f:tabF([[-1,.1],[-.95,.72],[-.6,1.02],[-.1,1.02],[.45,.78],[.82,.56],[1,.3],[1.04,.05]]),z:1,e:2},
  kiste:{f:u=>{const a=Math.abs(u);return a<.45?.9:a<.95?.4+Math.sqrt(Math.max(0,.25-(a-.45)*(a-.45))):0},z:.89,e:4},
  dose:{f:tabF([[-1.001,.1],[-1,.78],[-.86,.92],[-.6,.95],[.6,.95],[.86,.92],[1,.78],[1.001,.1]]),z:1,e:2},
  bohne:{f:capF(.9,.175,1.02),z:.9,e:2},
  glocke:{f:tabF([[-1,.1],[-.95,1.05],[-.7,1.1],[-.2,.9],[.4,.72],[.8,.6],[1.02,.35],[1.06,.05]]),z:1,e:2}
};
const shapeOf=c=>SHAPE[c.body&&c.body.shape]||SHAPE.ei;
/* halbe Rumpfbreite auf Höhe y */
function surfR(c,y){const f=shapeOf(c).f;let R=0;for(let i=0;i<c.n;i++)R=Math.max(R,c.rs[i]*f((y-c.ys[i])/c.rs[i]));return R}
function sp(c,y,v){const R=surfR(c,y);if(R<1e-4)return new V3(0,y,0);const S=shapeOf(c),e=S.e;const sv=Math.abs(Math.sin(v)),cv=Math.abs(Math.cos(v));
  const t=1/Math.pow(Math.pow(sv/R,e)+Math.pow(cv/(R*S.z),e),1/e);return new V3(Math.sin(v)*t,y,Math.cos(v)*t)}
/* Punkt + Normale auf der Rumpfoberfläche. v: Winkel (0 = vorne, PI/2 = rechts +x, PI = hinten) */
function surf(c,y,v,off){const p=sp(c,y,v),a=sp(c,y,v+.02).sub(sp(c,y,v-.02)),b=sp(c,y+.02,v).sub(sp(c,y-.02,v));const n=new V3().crossVectors(a,b);
  if(n.lengthSq()<1e-10)n.set(Math.sin(v),0,Math.cos(v));n.normalize();return{p:p.addScaledVector(n,off||0),n}}
function basisQ(z,up){z=z.clone().normalize();const x=new V3().crossVectors(up||UP,z);if(x.lengthSq()<1e-6)x.set(1,0,0);x.normalize();const y=new V3().crossVectors(z,x);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z))}
/* Gruppe auf der Haut: lokal +z = nach aussen, +y ≈ oben. flat 0..1 macht die Normale waagrechter (für Schilder, Kästen) */
function mount(g,c,y,v,off,o){o=o||{};const{p,n}=surf(c,y,v,off);if(o.flat){n.y*=1-o.flat;n.normalize()}if(o.lift){n.y+=o.lift;n.normalize()}const M=grp(g,[p.x,p.y,p.z]);M.quaternion.copy(basisQ(n));M.userData.n=n;return M}
const toL=(M,v)=>{M.updateWorldMatrix(true,false);return M.worldToLocal(v.clone())};
const toW=(M,v)=>{M.updateWorldMatrix(true,false);return M.localToWorld(v.clone())};
function topAt(c,x){x=Math.abs(x);for(let y=c.topY+.05;y>c.ys[0];y-=.004)if(surfR(c,y)>=x)return y;return c.ys[0]}
/* Sitzplatz auf der Schulter (sg = +1 rechts / -1 links) */
function shoulder(c,sg){const x=c.shX*.86,xs=c.rs[c.n-1]*.82,yc=c.ys[c.n-1]+.2*c.rs[c.n-1],rr=.16*c.s,dx=x-xs;const y2=Math.abs(dx)<rr?yc+Math.sqrt(rr*rr-dx*dx):-1;
  return new V3(sg*x,Math.max(topAt(c,x),y2),0)}
function body(c){const n=c.n,ys=c.ys,rs=c.rs;const chest=n>1?ys[n-1]+rs[n-1]*.02:ys[0]+rs[0]*.32,belly=n>1?ys[0]-rs[0]*.08:ys[0]-rs[0]*.3;
  return{chest,belly,mid:(chest+belly)/2,rT:rs[n-1],r0:rs[0],top:c.topY}}
const arr=p=>p.isVector3?[p.x,p.y,p.z]:p;
const tu=(pts,r1,r2,seg)=>G.tu(pts.map(arr),r1,r2,seg);
/* Rohr mit frei wählbarem Radiusverlauf rf(t) */
function vtube(pts,rf,seg,rseg){const cu=new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p.clone():new V3(p[0],p[1],p[2])));const n=seg||Q(48),rs=rseg||Q(14);
  const g=new THREE.TubeGeometry(cu,n,1,rs,false);const pos=g.attributes.position;const v=new V3();
  for(let i=0;i<=n;i++){const cp=cu.getPointAt(i/n),rr=rf(i/n);for(let j=0;j<=rs;j++){const k=i*(rs+1)+j;v.fromBufferAttribute(pos,k).sub(cp).multiplyScalar(rr).add(cp);pos.setXYZ(k,v.x,v.y,v.z)}}
  g.computeVertexNormals();g.userData.openTube=true;return g}
const la=(pts,sc,seg,ph,pl)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0]*sc,p[1]*sc)),seg||Q(32),ph||0,pl||TAU);
/* Aufkleber, der sich an die Rumpfrundung schmiegt */
function decal(g,c,y,v,w,h,off,mat){const R=Math.max(.08,surfR(c,y));const geo=new THREE.PlaneGeometry(w,h,12,12);const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const px=pos.getX(i),py=pos.getY(i);const p=surf(c,y+py,v+px/R,off).p;pos.setXYZ(i,p.x,p.y,p.z)}
  geo.computeVertexNormals();const d=P(g,geo,mat);d.userData.noOutline=true;d.castShadow=false;return d}
/* Rucksack-Gurte über beide Schultern */
function straps(g,c,mat,buckle){const s=c.s,L=body(c);both(sg=>{const xs=c.shX*.55;const yT=topAt(c,xs);
  const pts=[surf(c,L.mid,PI-sg*.45,.028*s).p,surf(c,L.chest,PI-sg*.4,.03*s).p,new V3(sg*xs,yT+.032*s,-.03*s),surf(c,L.chest+.05*L.rT,sg*.4,.03*s).p,surf(c,L.chest-.3*L.rT,sg*.46,.03*s).p];
  P(g,tu(pts,.03*s),mat);const B=mount(g,c,L.chest-.12*L.rT,sg*.43,.035*s,{flat:.5});P(B,G.bx(.09*s,.07*s,.035*s,.015*s),buckle||c.m.gold())})}
/* Mini-Gesicht (Kulleraugen + Lächeln + Wangen) auf lokaler +z-Fläche */
function face(g,c,x,y,z,r,o){o=o||{};both(sg=>cuteEye(g,c,x+sg*r,y,z,r*.5,{blink:o.blink!==false}));
  P(g,G.to(r*.42,r*.13,PI*.75),c.m.c(PAL.ink),[x,y-r*.72,z+.001],[0,0,PI+PI*.125]);
  if(o.cheeks!==false)both(sg=>{const ch=P(g,G.s(r*.3),c.m.cheek(),[x+sg*r*1.6,y-r*.5,z-.002],null,[1.25,.75,.3]);ch.userData.noOutline=true;ch.castShadow=false})}
const leafShape=(w,h)=>sshp([[0,0],[w*.55,h*.18],[w*.5,h*.62],[0,h],[-w*.5,h*.62],[-w*.55,h*.18]]);
const petalShape=(w,h)=>sshp([[0,0],[w*.5,h*.3],[w*.35,h*.85],[0,h],[-w*.35,h*.85],[-w*.5,h*.3]]);
const bump=(t,c0,w)=>Math.exp(-Math.pow((t-c0)/w,2));

/* ---------- Canvas-Texturen ---------- */
const TX={
  ecg:()=>ctex('ex-ecg',128,80,(x,w,h)=>{x.fillStyle=PAL.mint;x.fillRect(0,0,w,h);x.strokeStyle=PAL.ink;x.lineWidth=8;x.lineJoin='round';x.lineCap='round';x.beginPath();x.moveTo(10,46);x.lineTo(36,46);x.lineTo(46,26);x.lineTo(58,66);x.lineTo(72,12);x.lineTo(84,46);x.lineTo(118,46);x.stroke()}),
  pump:()=>ctex('ex-pump',128,96,(x,w,h)=>{x.fillStyle=PAL.navy;x.fillRect(0,0,w,h);x.fillStyle=PAL.mint;x.font='bold 54px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('12',w*.4,h*.55);
    x.fillStyle=PAL.sky;x.beginPath();x.moveTo(w*.82,h*.22);x.quadraticCurveTo(w*.95,h*.55,w*.82,h*.72);x.quadraticCurveTo(w*.69,h*.55,w*.82,h*.22);x.fill()}),
  water:()=>ctex('ex-water',128,128,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#C9F4FF');gr.addColorStop(1,'#56B8E6');x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.28)';[[20,34],[60,26],[96,36]].forEach(([a,b])=>{x.beginPath();x.moveTo(a,0);x.lineTo(a+b*.5,0);x.lineTo(a+b*.2+18,h);x.lineTo(a-10,h);x.fill()})}),
  compost:()=>ctex('ex-compost',128,128,(x,w,h)=>{x.fillStyle='#8A5E42';x.fillRect(0,0,w,h);const r=srand(77);const cols=['#6F4A34','#A8784F','#7CC46A','#E8C27A','#5B3A28'];
    for(let i=0;i<110;i++){x.fillStyle=cols[i%5];x.beginPath();x.ellipse(r()*w,r()*h,3+r()*6,2+r()*3,r()*3,0,TAU);x.fill()}}),
  solar:()=>ctex('ex-solar',128,128,(x,w,h)=>{x.fillStyle='#34427E';x.fillRect(0,0,w,h);x.fillStyle='#5D74C8';for(let i=0;i<3;i++)for(let j=0;j<3;j++)x.fillRect(5+i*41,5+j*41,36,36);
    x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.moveTo(0,46);x.lineTo(46,0);x.lineTo(70,0);x.lineTo(0,70);x.fill()}),
  party:()=>ctex('ex-party',128,128,(x,w,h)=>{x.fillStyle=PAL.pink;x.fillRect(0,0,w,h);x.fillStyle=PAL.lemon;for(let i=-5;i<5;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32+15,0);x.lineTo(i*32+15+h,h);x.lineTo(i*32+h,h);x.fill()}
    x.fillStyle='#FFFFFF';for(let j=0;j<4;j++)for(let i=0;i<4;i++){x.beginPath();x.arc(i*32+8+(j%2)*16,j*32+22,4.5,0,TAU);x.fill()}}),
  spike:()=>ctex('ex-spike',8,64,(x,w,h)=>{x.fillStyle=PAL.coral;x.fillRect(0,0,w,h);x.fillStyle=PAL.butter;x.fillRect(0,0,w,h*.3)}),
  shell:()=>ctex('ex-shell',256,8,(x,w,h)=>{x.fillStyle=PAL.apricot;x.fillRect(0,0,w,h);x.fillStyle='#FFD2A6';for(let i=0;i<16;i++)x.fillRect(i*w/16,0,w/16*.3,h)}),
  badge:()=>ctex('ex-badge',256,170,(x,w,h)=>{x.clearRect(0,0,w,h);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#FFFFFF';x.font='bold 40px sans-serif';x.fillText('HALLO!',w/2,33);
    x.fillStyle=PAL.ink;x.font='italic bold 46px sans-serif';x.fillText('Cyborg',w/2-14,114);x.fillStyle=PAL.strawberry;const hx=w-30,hy=112,s=13;x.beginPath();x.moveTo(hx,hy+s);x.bezierCurveTo(hx-s*1.7,hy,hx-s*.7,hy-s*1.2,hx,hy-s*.35);x.bezierCurveTo(hx+s*.7,hy-s*1.2,hx+s*1.7,hy,hx,hy+s);x.fill()}),
  qr:()=>ctex('ex-qr',210,210,(x,w,h)=>{const q=10,r=srand(4242);x.clearRect(0,0,w,h);
    const rr=(X,Y,W,H,R)=>{x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath();x.fill()};
    const fz=(i,j)=>(i<8&&j<8)||(i>12&&j<8)||(i<8&&j>12)||(i>=8&&i<=12&&j>=8&&j<=12);
    x.fillStyle=PAL.ink;for(let i=0;i<21;i++)for(let j=0;j<21;j++){if(fz(i,j))continue;if(r()>.52)rr(i*q+1,j*q+1,q-2,q-2,3)}
    [[0,0],[14,0],[0,14]].forEach(([a,b])=>{x.fillStyle=PAL.ink;rr(a*q,b*q,7*q,7*q,16);x.globalCompositeOperation='destination-out';rr(a*q+q,b*q+q,5*q,5*q,11);x.globalCompositeOperation='source-over';rr(a*q+2*q,b*q+2*q,3*q,3*q,8)});
    x.fillStyle=PAL.strawberry;const hx=105,hy=108,s=17;x.beginPath();x.moveTo(hx,hy+s);x.bezierCurveTo(hx-s*1.7,hy,hx-s*.7,hy-s*1.2,hx,hy-s*.35);x.bezierCurveTo(hx+s*.7,hy-s*1.2,hx+s*1.7,hy,hx,hy+s);x.fill()})
};
/* Tiere & Kleinkram */
function bee(g,c,s){const m=c.m;const b=grp(g,[0,0,0]);P(b,G.s(.042*s),m.gloss(PAL.lemon),[0,0,0],null,[.9,.9,1.25]);P(b,G.to(.039*s,.012*s),m.c(PAL.ink),[0,0,-.008*s],null,[.95,.95,1]);
  both(x=>P(b,G.s(.011*s),m.eye(),[x*.018*s,.012*s,.045*s]));const W=[];both(x=>{const w=grp(b,[x*.02*s,.035*s,-.005*s]);P(w,G.s(.03*s),m.c('#F4FBFF',{rim:.9}),[x*.022*s,.012*s,0],null,[1.1,.35,.7]);W.push([w,x])});
  return{g:b,W}}

/* ============================== ORGANISCH / MEDIZIN ============================== */
X('herz','Pumpherz im Glas','org',(g,c)=>{const m=c.m,s=c.s*1.45,L=body(c);const M=mount(g,c,L.chest-.1*s,0,0,{flat:.8});
  const J=grp(M,[0,0,.17*s]);const gl=m.glass('#E6FBFF');
  P(J,la([[0,-.12],[.12,-.12],[.15,-.09],[.155,.05],[.13,.095],[.118,.12],[0,.12]],s),gl);
  P(J,la([[0,-.112],[.11,-.112],[.142,-.083],[.146,.02],[0,.02]],s),m.c(PAL.pink,{opacity:.45}));P(J,G.to(.146*s,.008*s),m.flat('#ffffff'),[0,.02*s,0],[PI/2,0,0]);
  const gl1=P(J,G.ca(.012*s,.12*s),m.flat('#ffffff'),[-.1*s,.0,.1*s],[0,0,.08]);const gl2=P(J,G.s(.012*s),m.flat('#ffffff'),[-.1*s,.1*s,.1*s]);[gl1,gl2].forEach(k=>k.userData.noOutline=true);
  P(J,G.cy(.132*s,.132*s,.055*s),m.gold(),[0,.145*s,0]);P(J,G.to(.132*s,.016*s),m.gold(),[0,.122*s,0],[PI/2,0,0]);P(J,G.s(.035*s),m.gold(),[0,.18*s,0],null,[1,.6,1]);
  both(x=>{bt(J,[x*.14*s,-.05*s,-.02*s],[x*.16*s,-.05*s,-.19*s],.022*s,m.gold())});
  P(J,G.to(.152*s,.02*s),m.gold(),[0,-.05*s,0],[PI/2,0,0]);
  const H=grp(J,[0,-.03*s,0]);P(H,G.heart(.075*s,.05*s),m.gloss(PAL.strawberry));P(H,G.s(.018*s),m.flat('#ffffff'),[-.035*s,.035*s,.048*s],null,[1,.7,.4]);
  /* Adern vom Deckel zurück in die Brust */
  [[-1,PAL.strawberry],[1,PAL.blue]].forEach(([x,col])=>{const e=toL(M,surf(c,L.chest+.14*s,x*.22,-.02*s).p);const a=[x*.045*s,.18*s,.17*s];
    P(M,tu([a,[x*.06*s,.24*s,.15*s],[x*.08*s,Math.max(.25*s,e.y+.02*s),(e.z+.15*s)/2],e],.022*s),m.gloss(col));P(M,G.s(.03*s),m.gold(),a,null,[1,.6,1])});
  const bub=range(3,(t,i)=>P(J,G.s(.013*s),m.flat('#ffffff'),[(t-.5)*.14*s,0,.07*s]));
  c.an((t,w,a)=>{const ph=(t*(1.1+a*1.6))%1;const beat=bump(ph,.12,.06)*.22+bump(ph,.34,.06)*.13;H.scale.set(1+beat,1+beat*1.15,1+beat);
    bub.forEach((b,i)=>{const u=(t*.35+i*.33)%1;b.position.y=(-.1+u*.12)*s;b.scale.setScalar(Math.sin(u*PI))})})});

X('schrittmacher','Herzschrittmacher','masch',(g,c)=>{const m=c.m,s=c.s*1.5,L=body(c);const M=mount(g,c,L.chest+.14*L.rT,.58,0,{flat:.5});
  P(M,G.s(.13*s),m.gloss(PAL.white),[0,0,.015*s],null,[1.2,.95,.45]);
  P(M,G.bx(.15*s,.095*s,.03*s,.014*s),m.gloss(PAL.mint),[0,.012*s,.063*s]);P(M,G.pl(.13*s,.075*s),m.tex('ex-ecg',TX.ecg()),[0,.012*s,.0785*s]);
  const led=P(M,G.s(.02*s),m.glow(PAL.strawberry,2),[.085*s,-.06*s,.05*s]);
  const hh=grp(M,[-.07*s,-.065*s,.055*s]);P(hh,G.heart(.022*s,.014*s),m.gloss(PAL.strawberry));
  both(x=>P(M,G.s(.014*s),m.chrome(),[x*.12*s,.02*s,.035*s]));
  const e=toL(M,surf(c,L.chest-.02*s,.05,-.01*s).p);P(M,tu([[-.13*s,-.01*s,.02*s],[-.2*s,-.06*s,.03*s],[(e.x-.2*s)/2,e.y+.02*s,.04*s],e],.017*s),m.gloss(PAL.lilac));
  c.an((t,w,a)=>{const ph=(t*(1.1+a*1.6))%1;const b=bump(ph,.12,.07)*.35+bump(ph,.34,.07)*.2;hh.scale.setScalar(1+b);led.visible=ph<.3})});

X('hoergeraet','Hörgeräte','masch',(g,c)=>{const m=c.m,s=c.s*1.35,H=c.H;const sx=Math.min(H.sideX||H.r,H.r*1.1);const waves=[];
  both(sg=>{const E=grp(g,[sg*sx*.97,H.cy+.03*s,-.03*s]);const bm=m.gloss(PAL.lilac);
    const pts=[[sg*.04*s,.03*s,.06*s],[sg*.065*s,.13*s,-.01*s],[sg*.07*s,.1*s,-.11*s],[sg*.055*s,-.03*s,-.15*s]];
    P(E,tu(pts,.046*s,.036*s),bm);P(E,G.s(.046*s),bm,pts[0]);P(E,G.s(.036*s),bm,pts[3]);
    P(E,G.s(.024*s),m.gloss(PAL.butter),[sg*.11*s,.1*s,-.08*s],null,[.6,1,1]);P(E,G.s(.014*s),m.glow(PAL.mint,2),[sg*.1*s,.14*s,-.02*s]);
    P(E,G.s(.052*s),m.gloss(PAL.pink),[sg*.035*s,-.035*s,.1*s],null,[.75,1,1]);
    P(E,tu([pts[0],[sg*.075*s,.02*s,.11*s],[sg*.05*s,-.02*s,.11*s]],.014*s),m.c('#EAF6FF',{rim:.8}));
    range(2,(t,i)=>{const w=P(E,G.to((.07+i*.055)*s,.016*s,PI*.5),m.gloss(PAL.sky),[sg*.13*s,.02*s,0],[0,0,sg>0?-PI*.25:PI*.75]);waves.push([w,i])})});
  c.an(t=>waves.forEach(([w,i])=>{const u=(t*.7+i*.5)%1;w.scale.setScalar(.75+u*.5);w.visible=u<.85}))});

X('insulinpumpe','Insulinpumpe','masch',(g,c)=>{const m=c.m,s=c.s*1.4,L=body(c);const M=mount(g,c,L.belly+.02*s,.86,0,{flat:.9});
  P(M,G.bx(.15*s,.21*s,.075*s,.035*s),m.gloss(PAL.sky),[0,0,.04*s]);
  P(M,G.bx(.115*s,.085*s,.02*s,.012*s),m.gloss(PAL.navy),[0,.04*s,.08*s]);P(M,G.pl(.1*s,.072*s),m.tex('ex-pump',TX.pump()),[0,.04*s,.0905*s]);
  both(x=>P(M,G.s(.022*s),m.gloss(x>0?PAL.white:PAL.coral),[x*.035*s,-.05*s,.078*s],null,[1,1,.5]));
  P(M,G.bx(.05*s,.09*s,.03*s,.012*s),m.gloss(PAL.navy),[0,.06*s,-.002*s]);
  const P2=mount(g,c,L.belly-.1*s,-.22,0,{flat:.3});P(P2,G.s(.065*s),m.gloss(PAL.white),[0,0,.005*s],null,[1,1,.35]);P(P2,G.s(.026*s),m.gloss(PAL.pink),[0,0,.025*s],null,[1,1,.5]);
  const a=toW(M,new V3(0,-.11*s,.04*s)),b=toW(P2,new V3(0,-.02*s,.02*s));const mid=surf(c,Math.min(a.y,b.y)-.1*s,.35,.07*s).p;
  P(g,tu([a,a.clone().add(new V3(-.01*s,-.07*s,.02*s)),mid,b.clone().add(new V3(.02*s,-.04*s,.03*s)),b],.015*s),m.c('#EAF6FF',{rim:.8}))});

X('infusion','Infusionsständer','masch',(g,c)=>{const m=c.m,s=c.s*1.15,L=body(c);const px=.8*s,pz=-.42*s,hT=c.topY+.5*s;
  const St=grp(g,[px,0,pz]);const lm=m.gloss(PAL.lilac);
  bt(St,[0,.08*s,0],[0,hT,0],.026*s,m.chrome());P(St,G.s(.065*s),lm,[0,.1*s,0],null,[1,.75,1]);P(St,G.s(.042*s),lm,[0,hT*.55,0],null,[1,.7,1]);
  range(4,(t,i)=>{const a=i*PI/2+PI/4,e=[Math.cos(a)*.22*s,.045*s,Math.sin(a)*.22*s];bt(St,[0,.09*s,0],e,.024*s,lm);P(St,G.s(.042*s),m.black(),[e[0],.042*s,e[2]])});
  bt(St,[-.16*s,hT,0],[.1*s,hT,0],.02*s,m.chrome());P(St,G.s(.034*s),lm,[0,hT+.02*s,0]);P(St,G.s(.028*s),m.chrome(),[.1*s,hT,0]);
  const Bg=grp(St,[-.14*s,hT,0]);P(Bg,G.to(.025*s,.01*s),m.chrome(),[0,-.02*s,0]);
  const bag=grp(Bg,[0,-.27*s,0]);bag.scale.setScalar(1.5);P(bag,G.puff(sshp([[-.1*s,-.14*s],[.1*s,-.14*s],[.11*s,.1*s],[0,.16*s],[-.11*s,.1*s]]),.05*s),m.c('#D6F2FF',{gloss:.9,rim:.7}));
  P(bag,G.heart(.035*s,.014*s),m.gloss(PAL.strawberry),[0,.01*s,.05*s]);P(bag,G.bx(.14*s,.03*s,.02*s,.01*s),m.gloss(PAL.sky),[0,-.08*s,.045*s]);
  P(Bg,G.ca(.03*s,.06*s),m.c('#F4FBFF',{rim:.8}),[0,-.54*s,0]);const drop=P(Bg,G.s(.015*s),m.gloss(PAL.sky),[0,-.54*s,0]);
  const a=toW(Bg,new V3(0,-.59*s,0)),e=surf(c,L.chest-.1*s,2.1,0).p;
  P(g,tu([a,a.clone().add(new V3(0,-.2*s,0)),new V3((a.x+e.x)/2,Math.min(a.y,e.y)-.18*s,(a.z+e.z)/2),e],.013*s),m.c('#EAF6FF',{rim:.8}));
  c.an((t,w)=>{Bg.rotation.z=Math.sin(t*1.3)*(w?.08:.035);const u=(t*.9)%1;drop.position.y=(-.52-u*.05)*s;drop.scale.setScalar(u<.9?1:0)})});

X('zahnspange','Zahnspange','masch',(g,c)=>{const m=c.m,s=c.s*1.45,H=c.H;const y=H.faceY-H.r*.42,z=H.front*.9,Rm=H.r*.55;
  const A=grp(g,[0,y,z-Rm]);const cols=[PAL.pink,PAL.sky,PAL.mint,PAL.lemon];
  range(4,(t,i)=>{const a=(t-.5)*.78;const B=grp(A,[Math.sin(a)*Rm,0,Math.cos(a)*Rm],[0,a,0]);
    P(B,G.bx(.075*s,.085*s,.05*s,.022*s),m.white(),[0,.01*s,-.005*s]);P(B,G.bx(.042*s,.038*s,.022*s,.009*s),m.chrome(),[0,0,.025*s]);
    P(B,G.to(.021*s,.009*s),m.gloss(cols[i]),[0,0,.036*s])});
  const W=grp(A,[0,0,0],[0,-(PI/2-.56),0]);P(W,G.to(Rm+.035*s,.011*s,1.12),m.chrome(),[0,0,0],[PI/2,0,0]);
  both(x=>{const a=x*.56;P(A,G.s(.02*s),m.chrome(),[Math.sin(a)*(Rm+.035*s),0,Math.cos(a)*(Rm+.035*s)])})});

X('bodycam','Bodycam','masch',(g,c)=>{const m=c.m,s=c.s*1.7,L=body(c);const M=mount(g,c,L.chest+.1*L.rT,-.52,0,{flat:.7});
  P(M,G.bx(.17*s,.22*s,.09*s,.04*s),m.gloss(PAL.navy),[0,0,.045*s]);P(M,G.bx(.06*s,.09*s,.03*s,.012*s),m.chrome(),[0,.1*s,.005*s]);
  P(M,G.to(.058*s,.018*s),m.gloss(PAL.lavender),[0,.025*s,.093*s]);P(M,G.s(.056*s),m.eye(),[0,.025*s,.09*s],null,[1,1,.6]);
  P(M,G.s(.016*s),m.flat('#ffffff'),[.02*s,.045*s,.122*s]);P(M,G.s(.008*s),m.flat('#ffffff'),[-.018*s,.008*s,.122*s]);
  P(M,G.bx(.11*s,.03*s,.012*s,.006*s),m.gloss(PAL.lemon),[0,-.07*s,.092*s]);
  const led=P(M,G.s(.017*s),m.glow(PAL.strawberry,2.2),[.055*s,.085*s,.09*s]);c.an(t=>{led.visible=(t*1.2)%1<.55})});

/* ============================== TIERISCH ============================== */
X('schneckenhaus','Schneckenhaus','tier',(g,c)=>{const{s,m}=c,L=body(c);const M=mount(g,c,L.chest-.02*s,PI,0,{flat:1});
  const Sh=grp(M,[0,0,0],[0,-.35,0]);Sh.scale.set(1.45,1,1);const N=72,R0=.38*s,rt0=.21*s,k=2.2,turns=2.35;const C=[0,.16*s,R0+rt0-.07*s];const pts=[];
  for(let i=0;i<=N;i++){const t=i/N,e=Math.exp(-k*t),a=PI+t*TAU*turns;pts.push([-.12*s*t,C[1]+R0*e*Math.sin(a),C[2]+R0*e*Math.cos(a)])}
  const rf=t=>rt0*Math.exp(-k*t)+.014*s;
  P(Sh,vtube(pts,rf,Q(100),Q(18)),m.tex('ex-shell',TX.shell(),{gloss:.9,rim:.4}));
  P(Sh,G.s(rt0*1.02),m.gloss(PAL.apricot),pts[0]);P(Sh,G.to(rt0*.92,.034*s),m.gloss(PAL.cream),[pts[0][0],pts[0][1]+rt0*.4,pts[0][2]],[PI/2,0,0]);
  both(sx=>P(Sh,vtube(pts.slice(4).map((p,i)=>[p[0]+sx*rf((i+4)/N)*.93,p[1],p[2]]),t=>(.022-.01*t)*s,Q(90),Q(8)),m.gloss(PAL.terracotta)));
  P(Sh,G.s(rf(1)*1.5),m.gloss(PAL.terracotta),pts[N]);
  c.an((t,w)=>{Sh.rotation.z=Math.sin(t*(w?5:1.2))*(w?.04:.015)})});

X('panzer','Schildkrötenpanzer','tier',(g,c)=>{const{s,m}=c,L=body(c);const M=mount(g,c,L.mid,PI,-.07*s,{flat:1});
  const R=Math.max(L.r0,L.rT)*1.14,a=R,b=R*1.18,cz=R*.62;
  P(M,G.hs(R),m.gloss(PAL.moss),[0,0,0],[PI/2,0,0],[1,cz/R,b/R]);
  P(M,G.to(R*1.0,.065*s),m.gloss(PAL.honey),[0,0,.015*s],null,[1,b/R,1]);
  const hex=r=>shp(range(6,(t,i)=>{const q=i/6*TAU+PI/6;return[Math.cos(q)*r,Math.sin(q)*r]}));
  const put=(ph,th,r,col)=>{const p=new V3(a*Math.sin(ph)*Math.cos(th),b*Math.sin(ph)*Math.sin(th),cz*Math.cos(ph));const n=new V3(p.x/(a*a),p.y/(b*b),p.z/(cz*cz)).normalize();
    const h=P(M,G.puff(hex(r),.025*s),m.gloss(col),[p.x+n.x*.012*s,p.y+n.y*.012*s,p.z+n.z*.012*s]);h.quaternion.copy(basisQ(n))};
  put(0,0,R*.27,PAL.grass);range(6,(t,i)=>put(.92,i/6*TAU+PI/2,R*.22,PAL.grass));range(10,(t,i)=>put(1.36,i/10*TAU,R*.12,PAL.leaf))});

X('stacheln','Rückenstacheln','tier',(g,c)=>{const m=c.m,s=c.s*1.6,L=body(c);const mat=m.tex('ex-spike',TX.spike(),{gloss:.8});const S=[];
  const spike=(y,v,h,ph)=>{const{p,n}=surf(c,y,v,-.012*s);const d=n.clone().multiplyScalar(.7).add(new V3(0,1,0)).normalize();const r=h*.42;
    const k=P(g,la([[0,0],[1,0],[.96,.22],[.74,.5],[.42,.78],[.16,.95],[0,1]].map(q=>[q[0]*r/h,q[1]]),h,Q(16)),mat,[p.x,p.y,p.z]);k.quaternion.setFromUnitVectors(UP,d);S.push([k,ph])};
  const y0=L.belly-.25*L.r0,y1=c.topY-.06*c.s;
  range(5,(t,i)=>spike(y0+(y1-y0)*t,PI,(.19+.12*Math.sin(t*PI))*s,i*.7));
  both(sg=>range(3,(t,i)=>spike(y0+.12*s+(y1-y0-.24*s)*t,PI+sg*.6,(.12+.05*Math.sin(t*PI))*s,i*.7+1)));
  c.an((t,w,a)=>S.forEach(([k,ph])=>{const q=1+a*.35+Math.sin(t*2.4-ph)*.04;k.scale.set(1,q,1)}))});

X('rueckenflosse','Rückenflosse','tier',(g,c)=>{const m=c.m,s=c.s*1.6,L=body(c);const M=mount(g,c,L.mid+.08*c.s,PI,-.05*s,{flat:1});const F=grp(M,[0,0,0]);
  const fin=sshp([[0,-.42],[.03,-.1],[.12,.2],[.3,.45],[.6,.68],[.66,.7],[.58,.56],[.44,.34],[.34,.08],[.26,-.2],[.16,-.4]].map(p=>[p[0]*s,p[1]*s]));
  const R=grp(F,[0,0,0],[0,-PI/2,0]);P(R,G.puff(fin,.07*s),m.gloss(PAL.teal));
  const rays=[[[.08,-.1],[.52,.56]],[[.12,-.2],[.42,.3]],[[.13,-.3],[.3,.02]]];
  rays.forEach(([p0,p1])=>{const dx=p1[0]-p0[0],dy=p1[1]-p0[1],len=Math.hypot(dx,dy)*s;both(z=>P(R,G.ca(.022*s,len*.8),m.gloss(PAL.aqua),[(p0[0]+p1[0])/2*s,(p0[1]+p1[1])/2*s,z*.066*s],[0,0,Math.atan2(-dx,dy)],[1,1,.45]))});
  c.an((t,w,a)=>{F.rotation.y=-.45+Math.sin(t*(w?4:2))*(.08+(w?.12:0)+a*.15)})});

X('falter','Falter auf der Schulter','tier',(g,c)=>{const m=c.m,s=c.s*1.6;const S=shoulder(c,1);const B=grp(g,[S.x-.03*s,S.y+.05*s,S.z+.02*s],[0,.55,0]);const bm=m.gloss(PAL.plum);
  P(B,G.ca(.034*s,.12*s),bm,[0,0,0],[PI/2,0,0]);P(B,G.s(.052*s),bm,[0,.012*s,.1*s]);
  both(x=>cuteEye(B,c,x*.022*s,.022*s,.142*s,.013*s));
  both(x=>{P(B,tu([[x*.015*s,.05*s,.11*s],[x*.04*s,.12*s,.15*s],[x*.07*s,.15*s,.12*s]],.012*s),bm);P(B,G.s(.024*s),m.gloss(PAL.lemon),[x*.07*s,.15*s,.12*s])});
  const k=1.3*s;const fore=sshp([[0,.02],[.06,.1],[.17,.16],[.24,.12],[.2,.03],[.1,-.02]].map(p=>[p[0]*k,p[1]*k])),hind=sshp([[0,-.01],[.12,-.03],[.16,-.1],[.1,-.17],[.03,-.1]].map(p=>[p[0]*k,p[1]*k]));
  const wings=[];both(sg=>{const W=grp(B,[sg*.02*s,.012*s,-.01*s]);const I=grp(W,[0,0,0],[PI/2,0,0],null);I.scale.set(sg,1,1);
    P(I,G.puff(fore,.018*s),m.gloss(PAL.orange));P(I,G.puff(hind,.018*s),m.gloss(PAL.coral));
    [[.17,.11,.03],[.1,.07,.022],[.1,-.1,.026]].forEach(([x,y,r])=>both(z=>P(I,G.s(r*s),m.gloss(PAL.butter),[x*k,y*k,z*.018*s],null,[1,1,.3])));wings.push([W,sg])});
  c.an((t,w,a)=>{const f=.62+.42*Math.sin(t*(2+a*4))*(.6+.4*Math.sin(t*.37));wings.forEach(([W,sg])=>W.rotation.z=sg*f);B.position.y=S.y+.05*s+Math.abs(Math.sin(t*1.5))*.01*s})});

X('vogelnest','Vogelnest','tier',(g,c)=>{const m=c.m,s=c.s*1.3,H=c.H;const N=grp(g,[0,H.top-.05*s,0]);
  const tw=[PAL.bark,PAL.wood,PAL.oak];range(3,(t,i)=>P(N,G.to((.16+i*.028)*s,.052*s),m.c(tw[i],{rim:.4}),[0,(.02+i*.045)*s,0],[PI/2+Math.sin(i*2.3)*.1,0,Math.cos(i*1.7)*.08]));
  P(N,G.s(.17*s),m.c(PAL.choc),[0,.06*s,0],null,[1,.35,1]);
  range(5,(t,i)=>{const a=i/5*TAU+.4;P(N,G.ca(.016*s,.12*s),m.c(PAL.bark),[Math.sin(a)*.2*s,(.07+(i%2)*.04)*s,Math.cos(a)*.2*s],[Math.cos(a)*.9,0,-Math.sin(a)*.9+.6])});
  const K=grp(N,[0,.14*s,.01*s]);P(K,G.s(.1*s),m.plush(PAL.lemon),[0,0,0],null,[1,.95,.95]);
  face(K,c,0,.015*s,.09*s,.034*s);
  const beak=grp(K,[0,-.015*s,.095*s]);P(beak,G.co(.024*s,.045*s),m.gloss(PAL.orange),[0,0,.018*s],[PI/2,0,0]);
  both(x=>P(K,G.s(.04*s),m.plush(PAL.butter),[x*.09*s,-.02*s,0],[0,0,x*.5],[.45,1,.8]));
  range(3,(t,i)=>P(K,G.ca(.014*s,.04*s),m.plush(PAL.lemon),[(t-.5)*.03*s,.105*s,-.01*s],[0,0,(t-.5)*1]));
  P(N,G.s(.055*s),m.gloss(PAL.sky),[.12*s,.1*s,-.07*s],[.3,0,-.3],[1,1.3,1]);P(N,G.s(.05*s),m.gloss(PAL.mint),[-.12*s,.1*s,-.07*s],[.3,0,.3],[1,1.3,1]);
  c.an((t,w,a)=>{const u=Math.sin(t*2.6);K.position.y=(.14+.012*Math.max(0,u))*s;K.rotation.z=Math.sin(t*1.3)*.12;beak.scale.set(1,1+Math.max(0,Math.sin(t*9))*.4*(Math.sin(t*.8)>.3?1:0),1)})});

X('bienenstock','Bienenstock','tier',(g,c)=>{const m=c.m,s=c.s*1.5,L=body(c);const M=mount(g,c,L.chest+.12*L.rT,PI-.5,0,{flat:1});
  const Hv=grp(M,[0,.02*s,.2*s]);
  P(Hv,G.s(.17*s),m.gloss(PAL.honey),[0,.01*s,0],null,[1,1.1,1]);
  range(5,(t,i)=>{const R=(.19-Math.pow(t,1.6)*.1)*s;P(Hv,G.to(R,.045*s),m.gloss(i%2?PAL.honey:PAL.lemon),[0,(-.14+t*.28)*s,0],[PI/2,0,0])});
  P(Hv,G.s(.075*s),m.gloss(PAL.lemon),[0,.17*s,0],null,[1,.8,1]);P(Hv,G.cy(.2*s,.2*s,.035*s),m.gloss(PAL.oak),[0,-.19*s,0]);
  P(Hv,G.s(.05*s),m.c(PAL.choc),[-.17*s,-.12*s,0],[0,0,0],[.35,.75,1]);P(Hv,G.drop(.035*s,.02*s),m.gloss(PAL.orange),[-.12*s,-.2*s,.1*s],[PI,0,0]);
  const bees=range(3,(t,i)=>bee(g,c,c.s*1.2));const cen=toW(Hv,new V3(0,0,0));
  c.an((t,w,a)=>bees.forEach(({g:b,W},i)=>{const sp=.8+i*.22,an=t*sp+[1.2,3.4,5.3][i];const R=(.34+i*.07)*s;
    b.position.set(cen.x+Math.sin(an)*R,cen.y+(i-1)*.12*s+Math.sin(t*2.3+i)*.05*s,cen.z+Math.cos(an)*R);b.rotation.y=an+PI/2;
    W.forEach(([w,x])=>w.rotation.z=x*(.3+Math.sin(t*38+i)*.5))}))});

X('aquarium','Aquariumbauch','tier',(g,c)=>{const m=c.m,s=c.s*1.4,L=body(c);const M=mount(g,c,L.belly+.03*s,0,0,{flat:.85});const R=.23*s;
  const bd=P(M,G.circ(R),m.tex('ex-water',TX.water()),[0,0,.012*s]);
  P(M,G.to(R,.045*s),m.gloss(PAL.blue),[0,0,.025*s]);range(8,(t,i)=>{const a=i/8*TAU+PI/8;P(M,G.s(.016*s),m.gold(),[Math.cos(a)*R,Math.sin(a)*R,.066*s])});
  P(M,G.hs(R*.98),m.glass('#E2F9FF'),[0,0,.02*s],[PI/2,0,0],[1,.55,1]);
  P(M,G.s(.14*s),m.gloss(PAL.sand),[.03*s,-.21*s,.03*s],null,[1.25,.55,.35]);P(M,G.s(.03*s),m.gloss(PAL.coral),[.1*s,-.15*s,.05*s]);
  const weeds=[[-.1,PAL.leaf],[-.05,PAL.grass]].map(([x,col],i)=>{const W=grp(M,[x*s,-.18*s,.035*s]);P(W,tu([[0,0,0],[-.02*s,.09*s,.01*s],[.01*s,.18*s,.01*s]],.024*s,.013*s),m.gloss(col));P(W,G.s(.014*s),m.gloss(col),[.01*s,.18*s,.01*s]);return W});
  const fish=[[PAL.orange,1],[PAL.pink,-1]].map(([col],i)=>{const f=grp(M,[0,0,.07*s]);const I=grp(f,[0,0,0]);P(I,G.s(.045*s),m.gloss(col),[0,0,0],null,[1.35,1,.7]);
    P(I,G.puff(sshp([[0,0],[-.06*s,.045*s],[-.05*s,0],[-.06*s,-.045*s]]),.014*s),m.gloss(col),[-.05*s,0,0]);P(I,G.s(.012*s),m.eye(),[.034*s,.012*s,.025*s]);return[f,I]});
  const bub=range(3,(t,i)=>P(M,G.s(.013*s),m.flat('#ffffff'),[(t-.5)*.12*s,0,.08*s]));
  c.an((t,w)=>{fish.forEach(([f,I],i)=>{const a=t*(.7+i*.25)+i*2.4;f.position.set(Math.sin(a)*.1*s,(-.03+.05*i)*s+Math.sin(a*2)*.02*s,(.07+Math.cos(a)*.01)*s);I.scale.x=Math.cos(a)>0?1:-1;I.rotation.z=Math.sin(t*6+i)*.08});
    weeds.forEach((W,i)=>W.rotation.z=Math.sin(t*1.4+i)*.15);bub.forEach((b,i)=>{const u=(t*.4+i*.33)%1;b.position.y=(-.12+u*.26)*s;b.scale.setScalar(Math.sin(u*PI))})})});

X('biolumineszenz','Biolumineszenz','tier',(g,c)=>{const{s,m}=c,L=body(c);const cols=['#7FF6FF','#C2A8FF'];const dots=[];
  const dot=(y,v,r,ci)=>{const M=mount(g,c,y,v,.004*s);P(M,G.s(r),m.glow(cols[ci],1.8),[0,0,0],null,[1,1,.35]);const h=P(M,G.s(r*1.9),m.c(cols[ci],{opacity:.3}),[0,0,-.004*s],null,[1,1,.2]);h.userData.noOutline=true;dots.push([M,y])};
  const y0=L.belly-.3*L.r0,y1=L.chest+.3*L.rT;
  both(sg=>range(5,(t,i)=>dot(y0+(y1-y0)*t,sg*(1.0+.14*Math.sin(t*3.2)),(.06-.016*Math.abs(t-.5))*s,i%2)));
  range(5,(t,i)=>dot(L.chest+.32*L.rT-Math.sin(t*PI)*.14*s,(t-.5)*1.3,.042*s,(i+1)%2));
  range(3,(t,i)=>dot(L.belly+.05*s+t*.2*s,PI+(t-.5)*.5,.05*s,i%2));
  c.an((t,w,a)=>dots.forEach(([M,y],i)=>{const q=.75+.4*Math.max(0,Math.sin(t*2.2-y*7+i*.3))+a*.4;M.scale.setScalar(q)}))});

X('korallen','Korallenbewuchs','tier',(g,c)=>{const m=c.m,s=c.s*1.6,L=body(c);const sway=[];
  const reef=(y,v,sc)=>{const M=mount(g,c,y,v,-.02*s,{flat:.6});const k=s*sc;
    P(M,G.blob(.1*k,.2,5,3),m.c(PAL.lavender,{rim:.5}),[0,0,0],null,[1.25,1,.45]);
    const B=grp(M,[.02*k,.03*k,.03*k]);const cm=m.gloss(PAL.coral);
    const br=(a,b,r1,r2)=>{P(B,tu([a,[(a[0]+b[0])/2+.01*k,(a[1]+b[1])/2,(a[2]+b[2])/2+.01*k],b],r1,r2),cm);P(B,G.s(r2*1.15),cm,b)};
    br([0,0,0],[.02*k,.26*k,.1*k],.04*k,.028*k);br([.02*k,.12*k,.05*k],[.12*k,.21*k,.08*k],.03*k,.024*k);br([.01*k,.08*k,.04*k],[-.08*k,.18*k,.07*k],.028*k,.022*k);
    sway.push(B);
    P(M,G.blob(.065*k,.2,11,5),m.gloss(PAL.pink),[-.09*k,-.04*k,.05*k],null,[1,1,.8]);
    range(2,(t,i)=>{P(M,G.cy(.028*k,.022*k,.08*k),m.gloss(PAL.lemon),[(.1+t*.05)*k,(-.06-t*.03)*k,.07*k],[.9,0,-.3]);});
    P(M,G.star(.05*k,.022*k,5,.018*k),m.gloss(PAL.orange),[-.02*k,-.1*k,.07*k],[0,0,.3]);return M};
  reef(L.belly+.04*c.s,-1.05,1);reef(L.chest+.15*L.rT,-1.45,.62);
  c.an(t=>sway.forEach((B,i)=>{B.rotation.z=Math.sin(t*1.3+i)*.08;B.rotation.x=Math.sin(t*1.1+i*2)*.05}))});

X('spinnennetz','Spinnennetz','tier',(g,c)=>{const m=c.m,s=c.s*1.4,L=body(c);const M=mount(g,c,L.belly-.02*s,.66,.03*s,{flat:.85});const wm=m.c('#FBF8FF',{rim:.9});const Wr=.2*s,nS=7;
  const ang=i=>i/nS*TAU+.25;range(nS,(t,i)=>{const a=ang(i);bt(M,[0,0,0],[Math.cos(a)*Wr,Math.sin(a)*Wr,-.01*s],.012*s,wm)});
  [.06,.11,.16].forEach((rr,k)=>{const pts=[];for(let j=0;j<nS;j++){const a=ang(j),a2=a+PI/nS;pts.push(new V3(Math.cos(a)*rr*s,Math.sin(a)*rr*s,-.003*s*k));pts.push(new V3(Math.cos(a2)*rr*s*.84,Math.sin(a2)*rr*s*.84,-.003*s*k))}
    P(M,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),Q(70),.011*s,Q(6),true),wm)});
  P(M,G.s(.024*s),wm,[0,0,.004*s]);
  const Sp=grp(M,[Math.cos(ang(5))*.16*s*.9,Math.sin(ang(5))*.16*s*.9,.02*s]);const th=P(Sp,G.cy(.011*s,.011*s,1),wm,[0,0,0]);th.geometry.translate(0,-.5,0);
  const Bd=grp(Sp,[0,-.14*s,0]);const pm=m.gloss(PAL.plum);P(Bd,G.s(.065*s),pm,[0,0,0],null,[1,.92,.95]);P(Bd,G.s(.04*s),pm,[0,.065*s,-.015*s]);
  face(Bd,c,0,.004*s,.06*s,.026*s);
  both(sg=>range(4,(t,i)=>{const z=(.035-t*.07)*s;P(Bd,tu([[sg*.045*s,0,z],[sg*.1*s,.04*s,z*1.4],[sg*.14*s,-.035*s,z*1.6]],.016*s,.012*s),pm)}));
  c.an((t,w,a)=>{const L2=(.13+.03*Math.sin(t*1.6))*s;Bd.position.y=-L2;th.scale.y=L2;Bd.rotation.y=Math.sin(t*.7)*.3;Bd.rotation.z=Math.sin(t*1.6+1)*.05})});

X('tentakelbart','Tentakelbart','tier',(g,c)=>{const m=c.m,s=c.s*1.45,H=c.H;const y=H.faceY-H.r*.52,z=H.front*.82;const tm=m.gloss('#A77BD9'),sm=m.gloss(PAL.pink);
  P(g,G.s(H.r*.26),tm,[0,y+.015*s,z-.035*s],null,[1.3,.42,.55]);const segs=[];
  range(5,(t,i)=>{const x=(t-.5)*H.r*.78;const R=grp(g,[x,y,z+.015*s-Math.abs(t-.5)*.1*s],[-.35,0,-(t-.5)*.9]);let par=R;const f=1-Math.abs(t-.5)*.45;
    const Ls=[.085,.08,.075,.065,.055].map(v=>v*s*f),Rs=[.048,.042,.035,.028,.021].map(v=>v*s);
    Ls.forEach((len,k)=>{const S=grp(par,[0,k?-Ls[k-1]:0,0]);P(S,G.ca(Rs[k],len),tm,[0,-len/2,0]);if(k===1||k===2)P(S,G.s(.016*s),sm,[0,-len*.5,Rs[k]*.85],null,[1,1,.5]);segs.push([S,i,k]);par=S})});
  c.an((t,w,a)=>segs.forEach(([S,i,k])=>{S.rotation.x=-(k*k*.07)+Math.sin(t*2.1-k*.8+i*1.3)*.16*(1+a);S.rotation.z=Math.sin(t*1.6-k*.6+i*2.1)*.12}))});

/* ============================== MASCHINELL ============================== */
X('solar','Solarpanel','masch',(g,c)=>{const m=c.m,s=c.s*1.2,L=body(c),H=c.H;
  const M=mount(g,c,L.chest+.05*s,PI,0,{flat:1});P(M,G.bx(.22*s,.26*s,.06*s,.025*s),m.gloss(PAL.white),[0,0,.02*s]);
  const Pc=new V3(0,H.cy+H.r*.5,-(H.r+.32*s));const a=toW(M,new V3(0,.05*s,.05*s));
  P(g,tu([a,a.clone().add(new V3(0,.1*s,-.1*s)),new V3(0,(a.y+Pc.y)/2,Pc.z+.02*s),new V3(0,Pc.y-.06*s,Pc.z)],.032*s),m.chrome());
  P(g,G.s(.055*s),m.gloss(PAL.lemon),[0,Pc.y-.04*s,Pc.z]);
  const PG=grp(g,[Pc.x,Pc.y,Pc.z]);const I=grp(PG,[0,.02*s,0]);
  P(I,G.bx(1.12*s,.05*s,.64*s,.024*s),m.gloss(PAL.white));const tm=m.tex('ex-solar',TX.solar(),{gloss:1});
  range(3,(t,i)=>both(z=>P(I,G.bx(.33*s,.03*s,.27*s,.015*s),tm,[(t-.5)*.7*s,.025*s,z*.145*s])));
  P(I,G.star(.045*s,.022*s,5,.014*s),m.gloss(PAL.lemon),[.52*s,.035*s,.28*s],[-PI/2,0,0]);
  c.an((t,w,a)=>{PG.rotation.x=.55+Math.sin(t*.5)*.06-a*.2;PG.rotation.z=Math.sin(t*.33)*.08})});

X('server','Server-Rucksack','masch',(g,c)=>{const m=c.m,s=c.s*1.3,L=body(c);const M=mount(g,c,L.mid+.06*s,PI,-.02*s,{flat:1});
  const W=.62*s,Hh=Math.min(.8*s,Math.max(.62*s,(L.chest-L.belly)*.95)),D=.3*s;
  P(M,G.bx(W,Hh,D,.07*s),m.gloss(PAL.navy),[0,0,D/2]);const leds=[];
  range(3,(t,i)=>{const y=(.5-t)*Hh*.58;P(M,G.bx(W*.84,Hh*.2,.04*s,.028*s),m.gloss(PAL.lavender),[0,y,D+.004*s]);
    P(M,G.bx(W*.36,.026*s,.02*s,.01*s),m.c(PAL.ink),[-W*.12,y,D+.026*s]);
    [[PAL.mint,.2],[PAL.lemon,.3]].forEach(([col,x],j)=>leds.push([P(M,G.s(.022*s),m.glow(col,2),[W*x,y,D+.026*s]),i*1.7+j*2.9]))});
  both(sg=>range(3,(t,i)=>P(M,G.ca(.018*s,.13*s),m.c(PAL.ink),[sg*(W/2+.001*s),(t-.5)*Hh*.4,D*.55],[PI/2,0,0])));
  P(M,G.to(.1*s,.024*s,PI),m.gloss(PAL.lavender),[0,Hh/2-.01*s,D*.55]);
  bt(M,[-W*.32,Hh/2-.02*s,D*.35],[-W*.38,Hh/2+.26*s,D*.35],.015*s,m.chrome());const tip=P(M,G.s(.036*s),m.glow(PAL.strawberry,2),[-W*.38,Hh/2+.26*s,D*.35]);
  straps(g,c,m.gloss(PAL.lavender),m.chrome());
  c.an((t,w,a)=>{leds.forEach(([l,ph])=>l.visible=Math.sin(t*(5+a*8)+ph)>-.35);tip.scale.setScalar(.8+.3*Math.max(0,Math.sin(t*3)))})});

X('kabel','Ladekabel','masch',(g,c)=>{const m=c.m,s=c.s*1.4,L=body(c);const Pt=mount(g,c,L.belly,PI-.35,0,{flat:.6});
  P(Pt,G.cy(.07*s,.08*s,.04*s),m.gloss(PAL.white),[0,0,.01*s],[PI/2,0,0]);P(Pt,G.to(.058*s,.016*s),m.gloss(PAL.lemon),[0,0,.035*s]);
  const A=toW(Pt,new V3(0,0,.04*s)),n=Pt.userData.n.clone().setY(0).normalize();const Pp=new V3(.62*s,.07*s,-.78*s);
  const Cq=A.clone().addScaledVector(n,.45*s).add(new V3(.1*s,-.25*s,0));
  const bez=t=>{const u=1-t;return A.clone().multiplyScalar(u*u).add(Cq.clone().multiplyScalar(2*u*t)).add(Pp.clone().multiplyScalar(t*t))};
  const pts=[];const N=90;for(let i=0;i<=N;i++){const t=i/N,p=bez(t),T=bez(Math.min(1,t+.01)).sub(bez(Math.max(0,t-.01))).normalize();const N1=new V3().crossVectors(T,UP).normalize(),N2=new V3().crossVectors(T,N1);
    const env=Math.sin(Math.min(1,Math.max(0,(t-.22)/.5))*PI),ph=t*TAU*7;p.addScaledVector(N1,Math.cos(ph)*.055*s*env).addScaledVector(N2,Math.sin(ph)*.055*s*env);pts.push(p)}
  P(g,tu(pts,.026*s,.026*s,Q(220)),m.gloss(PAL.teal));
  const dir=bez(1).sub(bez(.95)).setY(0).normalize();const Pl=grp(g,[Pp.x,Pp.y,Pp.z]);Pl.quaternion.copy(basisQ(dir));
  P(Pl,G.bx(.14*s,.11*s,.18*s,.04*s),m.gloss(PAL.white),[0,0,.08*s]);P(Pl,G.cy(.03*s,.04*s,.05*s),m.gloss(PAL.teal),[0,0,-.015*s],[PI/2,0,0]);
  both(x=>P(Pl,G.bx(.02*s,.045*s,.08*s,.006*s),m.chrome(),[x*.035*s,0,.2*s]));
  const bolt=P(Pl,G.puff(shp([[.012,.07],[-.035,-.004],[-.004,-.004],[-.014,-.07],[.035,.012],[.004,.012]].map(p=>[p[0]*s,p[1]*s])),.012*s),m.glow(PAL.lemon,1.8),[0,.058*s,.08*s],[-PI/2,0,0]);
  c.an((t,w,a)=>{bolt.scale.setScalar(.85+.25*Math.max(0,Math.sin(t*2.5))+a*.3)})});

X('fernsteuer','Funk-Ohren (Fernsteuerung)','masch',(g,c)=>{const m=c.m,s=c.s*1.3,H=c.H;const sx=Math.min(H.sideX||H.r,H.r*1.15);const rings=[];
  both(sg=>{const E=grp(g,[sg*(sx-.01*s),H.cy+.02*s,.06*s]);E.quaternion.setFromUnitVectors(UP,new V3(sg,0,.55).normalize());
    P(E,la([[0,-.035],[.14,-.035],[.165,-.012],[.165,.022],[.14,.048],[0,.055]],s),m.gloss(PAL.blue),[0,.035*s,0]);
    rings.push(P(E,G.to(.115*s,.018*s),m.glow(PAL.sky,2),[0,.085*s,0],[PI/2,0,0]));P(E,G.s(.06*s),m.gloss(PAL.lemon),[0,.088*s,0],null,[1,.5,1])});
  const a=[sx+.1*s,H.cy+.1*s,-.02*s],b=[sx+.2*s,H.cy+.5*s,-.06*s];P(g,G.s(.04*s),m.gloss(PAL.blue),a);bt(g,a,b,.016*s,m.chrome());const tip=P(g,G.s(.042*s),m.glow(PAL.strawberry,2),b);
  const arcs=range(2,(t,i)=>P(g,G.to((.07+i*.05)*s,.014*s,PI*.5),m.gloss(PAL.sky),[b[0],b[1]+.02*s,b[2]],[0,0,PI*.25]));
  c.an((t,w,a)=>{const q=1+.12*Math.sin(t*3);rings.forEach(r=>r.scale.setScalar(q));tip.visible=(t*1.5)%1<.6;arcs.forEach((r,i)=>{const u=(t*.9+i*.5)%1;r.scale.setScalar(.7+u*.5);r.visible=u<.8})})});

X('jetpack','Jetpack','masch',(g,c)=>{const m=c.m,s=c.s*1.5,L=body(c);const M=mount(g,c,L.chest+.02*s,PI,-.02*s,{flat:1});const tr=.13*s,tl=.3*s;
  P(M,G.bx(.24*s,.46*s,.1*s,.04*s),m.gloss(PAL.lemon),[0,0,.06*s]);const flames=[];
  both(sg=>{const T=grp(M,[sg*.17*s,.02*s,.19*s]);const rm=m.gloss(PAL.strawberry);
    P(T,G.ca(tr,tl),rm);P(T,G.to(tr*1.01,.024*s),m.gloss(PAL.white),[0,.07*s,0],[PI/2,0,0]);P(T,G.to(tr*1.01,.024*s),m.gloss(PAL.white),[0,-.04*s,0],[PI/2,0,0]);
    P(T,G.s(tr*.8),m.gloss(PAL.lemon),[0,tl/2+tr*.5,0],null,[1,.8,1]);
    P(T,G.puff(sshp([[0,0],[.1,-.05],[.12,-.18],[.02,-.14]].map(p=>[p[0]*s,p[1]*s])),.025*s),m.gloss(PAL.lemon),[sg*tr*.85,-.02*s,0],null,[sg,1,1]);
    P(T,la([[0,0],[.075,0],[.085,-.04],[.105,-.09],[.09,-.1],[0,-.08]],s),m.chrome(),[0,-tl/2-tr*.8,0]);
    const F=grp(T,[0,-tl/2-tr*.8-.07*s,0]);P(F,la([[0,0],[.075,-.01],[.085,-.06],[.06,-.16],[.028,-.26],[0,-.32]],s,Q(18)),m.glow('#FF9A3C',1.6));
    P(F,la([[0,0],[.045,-.01],[.05,-.05],[.034,-.11],[0,-.19]],s,Q(18)),m.glow('#FFF1A8',1.8),[0,-.005*s,0]);flames.push([F,sg])});
  straps(g,c,m.gloss(PAL.navy));
  c.an((t,w,a)=>flames.forEach(([F,sg])=>{const f=Math.sin(t*23+sg)*.5+Math.sin(t*37+sg*2)*.5;const k=.8+(w?.2:0)+a*.8;F.scale.set(1+f*.06,k*(1+f*.15),1+f*.06)}))});

X('akku','Akku-Rucksack','masch',(g,c)=>{const m=c.m,s=c.s*1.45,L=body(c);const M=mount(g,c,L.mid+.08*s,PI,-.02*s,{flat:1});const W=.44*s,Hh=.62*s,D=.26*s;
  P(M,G.bx(W,Hh,D,.08*s),m.gloss(PAL.teal),[0,0,D/2]);P(M,G.cy(.08*s,.08*s,.07*s),m.gloss(PAL.lemon),[0,Hh/2+.02*s,D/2]);P(M,G.s(.08*s),m.gloss(PAL.lemon),[0,Hh/2+.05*s,D/2],null,[1,.3,1]);
  P(M,G.bx(W*.66,Hh*.74,.03*s,.035*s),m.gloss(PAL.navy),[0,-.02*s,D+.004*s]);
  const bars=range(4,(t,i)=>P(M,G.bx(W*.5,Hh*.13,.02*s,.018*s),m.glow(i<1?PAL.coral:i<2?PAL.lemon:PAL.mint,1.7),[0,-.02*s+(-.3+t*.6)*Hh*.74*.9,D+.022*s]));
  const bs=shp([[.03,.12],[-.06,-.01],[-.005,-.01],[-.03,-.12],[.065,.025],[.01,.025]].map(p=>[p[0]*s*1.1,p[1]*s*1.1]));
  const bolts=[];both(sg=>bolts.push(P(M,G.puff(bs,.03*s),m.gloss(PAL.lemon),[sg*(W/2+.01*s),0,D/2],[0,sg*PI/2,0])));
  P(M,G.bx(.07*s,.02*s,.02*s,.008*s),m.gloss(PAL.white),[-.12*s,Hh/2-.05*s,D+.004*s]);P(M,G.bx(.02*s,.07*s,.02*s,.008*s),m.gloss(PAL.white),[-.12*s,Hh/2-.05*s,D+.004*s]);
  straps(g,c,m.gloss(PAL.navy));
  c.an((t,w,a)=>{const lv=1+Math.floor(((t*.7)+1.2)%4);bars.forEach((b,i)=>b.visible=i<lv);bolts.forEach(b=>b.scale.setScalar(1+a*.25+Math.max(0,Math.sin(t*3))*.05))})});

X('antennen','Antennenwald','masch',(g,c)=>{const m=c.m,s=c.s*1.3,L=body(c),H=c.H;const my=L.chest+.1*L.rT;const M=mount(g,c,my,PI,0,{flat:1});
  P(M,G.bx(.5*s,.14*s,.12*s,.05*s),m.gloss(PAL.lavender),[0,0,.05*s]);const hT=Math.max(.7*s,H.top-my+.12*s);const A=[];
  [[-.2,.72,.5,PAL.strawberry,1],[-.07,1,.14,PAL.lemon,0],[.07,.9,-.16,PAL.mint,1],[.2,.64,-.5,PAL.sky,0]].forEach(([x,h,lean,col,gl],i)=>{
    const R=grp(M,[x*s,.06*s,.08*s],[0,0,lean]);const coil=[];for(let k=0;k<=40;k++){const a=k/40*TAU*4;coil.push([Math.cos(a)*.03*s,k/40*.12*s,Math.sin(a)*.03*s])}
    P(R,tu(coil,.012*s,.012*s,Q(80)),m.chrome());bt(R,[0,.12*s,0],[0,h*hT,0],.016*s,m.chrome());
    P(R,G.s(.048*s),gl?m.glow(col,1.8):m.gloss(col),[0,h*hT,0]);if(!gl)P(R,G.to(.03*s,.012*s),m.gloss(PAL.white),[0,h*hT-.05*s,0],[PI/2,0,0]);A.push([R,lean,i])});
  c.an((t,w,a)=>A.forEach(([R,lean,i])=>{R.rotation.z=lean+Math.sin(t*(2.4+i*.3)+i)*(.05+(w?.05:0)+a*.1);R.rotation.x=Math.sin(t*2+i*1.7)*.05}))});

X('schuessel','Satellitenschüssel','masch',(g,c)=>{const m=c.m,s=c.s*1.4,L=body(c);const M=mount(g,c,L.chest+.15*L.rT,PI-.62,0,{flat:1});
  P(M,G.bx(.15*s,.18*s,.06*s,.025*s),m.gloss(PAL.navy),[0,0,.02*s]);const tp=new V3(0,.62*s,.2*s);
  P(M,tu([[0,.05*s,.05*s],[0,.3*s,.12*s],[0,.55*s,.19*s],tp],.03*s),m.chrome());
  const j=toW(M,tp);const D=grp(g,[j.x,j.y,j.z]);P(D,G.s(.05*s),m.gloss(PAL.navy));
  const Dd=grp(D,[0,.02*s,0],[1.05,0,0]);P(Dd,la([[0,0],[.08,.012],[.16,.045],[.23,.1],[.25,.125],[.237,.133],[.21,.108],[.14,.063],[.07,.038],[0,.03]],s),m.gloss(PAL.white));
  P(Dd,G.to(.244*s,.02*s),m.gloss(PAL.coral),[0,.126*s,0],[PI/2,0,0]);P(Dd,G.to(.13*s,.016*s),m.gloss(PAL.sky),[0,.07*s,0],[PI/2,0,0]);P(Dd,G.s(.05*s),m.gloss(PAL.sky),[0,.035*s,0],null,[1,.4,1]);range(3,(t,i)=>{const a=i/3*TAU;bt(Dd,[Math.cos(a)*.2*s,.105*s,Math.sin(a)*.2*s],[0,.22*s,0],.012*s,m.chrome())});const lnb=P(Dd,G.s(.036*s),m.glow(PAL.mint,1.8),[0,.23*s,0]);
  const arcs=range(2,(t,i)=>P(Dd,G.to((.06+i*.05)*s,.013*s,PI*.5),m.gloss(PAL.sky),[0,.27*s,0],[0,0,PI*.25]));
  c.an((t,w,a)=>{D.rotation.y=.35+Math.sin(t*.4)*.5;lnb.visible=(t*1.2)%1<.7;arcs.forEach((r,i)=>{const u=(t*.8+i*.5)%1;r.scale.setScalar(.7+u*.6);r.visible=u<.8})})});

X('zahnraeder','Zahnräder','masch',(g,c)=>{const m=c.m,s=c.s*1.45,L=body(c);const M=mount(g,c,L.chest-.02*s,-.46,0,{flat:.8});
  P(M,G.cy(.2*s,.2*s,.035*s),m.gloss(PAL.navy),[-.03*s,0,.005*s],[PI/2,0,0]);range(6,(t,i)=>{const a=i/6*TAU;P(M,G.s(.014*s),m.chrome(),[-.03*s+Math.cos(a)*.175*s,Math.sin(a)*.175*s,.024*s])});
  const R1=.12*s,R2=.08*s,R3=.065*s,td=.032*s;const gear=(R,n,mat,x,y)=>{const G0=grp(M,[x,y,.045*s]);P(G0,G.puff(gearShape(R,n,td),.03*s,.01*s),mat);P(G0,G.s(R*.36),m.gloss(PAL.coral),[0,0,.012*s],null,[1,1,.55]);return G0};
  const c1=[-.05*s,.035*s],d12=R1+R2-td*.55,d13=R1+R3-td*.55;
  const g1=gear(R1,11,m.gold(),c1[0],c1[1]),g2=gear(R2,7,m.gloss(PAL.teal),c1[0]+Math.cos(-.65)*d12,c1[1]+Math.sin(-.65)*d12),g3=gear(R3,6,m.copper(),c1[0]+Math.cos(3.75)*d13,c1[1]+Math.sin(3.75)*d13);
  g2.position.z=g3.position.z=.058*s;
  c.an((t,w,a)=>{const sp=.7+a*2.5;g1.rotation.z=t*sp;g2.rotation.z=-t*sp*R1/R2+.2;g3.rotation.z=-t*sp*R1/R3+.3})});

X('auspuff','Auspuffrohre','masch',(g,c)=>{const m=c.m,s=c.s*1.4,L=body(c);const puffs=[];
  both(sg=>{const{p,n}=surf(c,L.belly+.08*s,PI-sg*.42,-.03*s);const nh=n.clone().setY(0).normalize();const A=p,B=p.clone().addScaledVector(nh,.14*s);
    const C=new V3(B.x+sg*.04*s,L.chest+.1*s,B.z-.06*s),D=new V3(B.x+sg*.07*s,c.topY+.14*s,B.z-.1*s),E=new V3(D.x+sg*.03*s,D.y+.14*s,D.z-.08*s);
    const cu=new THREE.CatmullRomCurve3([A,B,C,D,E]);P(g,tu([A,B,C,D,E],.055*s),m.chrome());
    const fl=mount(g,c,L.belly+.08*s,PI-sg*.42,-.01*s);P(fl,G.to(.07*s,.024*s),m.gloss(PAL.navy),[0,0,0]);
    [.42,.62].forEach(u=>{const r=P(g,G.to(.062*s,.02*s),m.gloss(PAL.coral),arr(cu.getPointAt(u)));r.quaternion.copy(basisQ(cu.getTangentAt(u)))});
    const T=cu.getTangentAt(1);const tip=grp(g,arr(E));tip.quaternion.setFromUnitVectors(UP,T);
    P(tip,la([[0,-.03],[.058,-.03],[.07,.02],[.088,.07],[.074,.078],[.055,.03],[0,.02]],s),m.chrome());P(tip,G.circ(.056*s),m.c(PAL.ink),[0,.05*s,0],[-PI/2,0,0]);
    range(3,(t,i)=>{const b=P(g,G.blob(.095*s,.14,3,i+2),m.plush('#E2DBF6'),arr(E));puffs.push([b,E.clone().addScaledVector(T,.06*s),i,sg])})});
  c.an((t,w,a)=>puffs.forEach(([b,o,i,sg])=>{const u=(t*(.45+a*.6)+i/3+(sg>0?0:.17))%1;b.position.set(o.x+Math.sin(u*6+i)*.04*s+sg*u*.08*s,o.y+u*.6*s,o.z-u*.1*s);b.scale.setScalar(Math.sin(Math.min(1,u*1.3)*PI)*(.6+u*.9)+.001)}))});

X('kuehlrippen','Kühlrippen','masch',(g,c)=>{const m=c.m,s=c.s*1.3,L=body(c);const y0=L.belly-.12*L.r0,y1=L.chest+.28*L.rT;const fins=[];
  range(7,(t,i)=>{const y=y0+(y1-y0)*t;const R=surfR(c,y);const bz=sp(c,y,PI).z;const f=P(g,G.bx(R*2*.94+.16*s,.045*s,.3*s,.02*s),m.gloss(i%2?PAL.aqua:PAL.sky),[0,y,bz-.08*s]);fins.push([f,i])});
  const mz=sp(c,(y0+y1)/2,PI).z;P(g,G.bx(.18*s,y1-y0+.12*s,.14*s,.06*s),m.gloss(PAL.navy),[0,(y0+y1)/2,mz-.22*s]);
  const leds=range(3,(t,i)=>P(g,G.s(.024*s),m.glow(PAL.orange,1.8),[0,y0+(y1-y0)*(.2+t*.6),mz-.295*s],null,[1,1,.5]));
  c.an((t,w,a)=>{leds.forEach((l,i)=>l.scale.setScalar(.8+.35*Math.max(0,Math.sin(t*2.5-i))+a*.4));fins.forEach(([f,i])=>f.scale.x=1+Math.sin(t*2-i*.7)*.015)})});

X('luefter','Lüfter','masch',(g,c)=>{const m=c.m,s=c.s*1.45,L=body(c);const M=mount(g,c,L.chest-.12*c.s,0,0,{flat:.85});
  P(M,G.bx(.34*s,.34*s,.08*s,.07*s),m.gloss(PAL.white),[0,0,.03*s]);P(M,G.cy(.14*s,.14*s,.03*s),m.gloss(PAL.navy),[0,0,.06*s],[PI/2,0,0]);
  P(M,G.to(.145*s,.012*s),m.glow(PAL.aqua,1.6),[0,0,.075*s]);
  const F=grp(M,[0,0,.082*s]);const bl=sshp([[0,-.02],[.05,.03],[.12,.05],[.135,-.005],[.07,-.035]].map(p=>[p[0]*s,p[1]*s]));
  range(5,(t,i)=>{const B=grp(F,[0,0,0],[0,0,i/5*TAU]);P(B,G.puff(bl,.01*s,.006*s),m.gloss(PAL.lilac),[.015*s,0,0],[.35,0,0])});
  P(F,G.s(.048*s),m.gloss(PAL.coral),[0,0,.012*s],null,[1,1,.6]);P(M,G.to(.155*s,.013*s),m.chrome(),[0,0,.1*s]);
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([x,y])=>P(M,G.s(.018*s),m.chrome(),[x*.125*s,y*.125*s,.07*s]));
  c.an((t,w,a)=>{F.rotation.z=-t*(5+a*14)})});

X('usb','USB-Anschlüsse','masch',(g,c)=>{const m=c.m,s=c.s*1.45,L=body(c);const M=mount(g,c,L.mid-.02*s,1.0,0,{flat:.9});
  P(M,G.bx(.17*s,.34*s,.05*s,.045*s),m.gloss(PAL.lavender),[0,0,.012*s]);
  range(3,(t,i)=>{const y=(.1-t*.2)*s;P(M,G.bx(.115*s,.058*s,.03*s,.012*s),m.chrome(),[0,y,.04*s]);if(i)P(M,G.bx(.085*s,.03*s,.02*s,.007*s),m.c(PAL.ink),[0,y,.051*s])});
  const S=grp(M,[0,.1*s,.05*s]);P(S,G.bx(.09*s,.045*s,.04*s,.008*s),m.chrome(),[0,0,.01*s]);P(S,G.bx(.125*s,.07*s,.17*s,.032*s),m.gloss(PAL.coral),[0,0,.11*s]);
  const led=P(S,G.s(.015*s),m.glow(PAL.lemon,2),[0,.036*s,.14*s]);P(S,G.to(.025*s,.01*s),m.gloss(PAL.lemon),[0,0,.215*s],[0,PI/2,0]);
  c.an((t,w,a)=>{led.visible=Math.sin(t*(4+a*10))>-.2})});

X('qr','QR-Code-Tattoo','masch',(g,c)=>{const m=c.m,s=c.s*1.5,L=body(c);const y=L.belly+.04*c.s,v=-.4,w=.27*s;
  decal(g,c,y,v,w,w,.004*c.s,m.tex('ex-qr',TX.qr(),{transparent:true,rim:.1}));
  const M=mount(g,c,y,v,.012*c.s);const scan=P(M,G.ca(.008*s,w*.95),m.glow(PAL.mint,1.8),[0,0,0],[0,0,PI/2]);
  c.an((t,w2,a)=>{const u=(t*.45)%1.8;scan.visible=u<1;scan.position.y=(u-.5)*w*.95})});

X('kopfhoerer','Kopfhörer','masch',(g,c)=>{const m=c.m,s=c.s*1.15,H=c.H;const sx=H.sideX||H.r,cy=H.cy+.02*s;const topB=Math.min(H.top+.04*s,H.cy+H.r*1.3);
  const bm=m.gloss(PAL.strawberry),cm=m.plush(PAL.cream),bw=sx+.08*s;
  P(g,tu(range(19,t=>{const a=t*PI;return[Math.cos(a)*bw,cy+.1*s+Math.sin(a)*(topB-cy-.1*s+.03*s),0]}),.042*s),bm);
  P(g,G.ca(.052*s,.26*s),cm,[0,topB+.0*s,0],[0,0,PI/2],[1,1,.9]);
  both(sg=>{const C=grp(g,[sg*(sx+.07*s),cy,0],[0,0,-sg*PI/2]);
    P(C,la([[0,-.06],[.13,-.06],[.155,-.03],[.16,.02],[.14,.06],[0,.07]],s),bm);P(C,G.to(.112*s,.042*s),cm,[0,-.07*s,0],[PI/2,0,0]);
    P(C,G.cy(.08*s,.08*s,.02*s),m.gloss(PAL.white),[0,.07*s,0]);P(C,G.star(.05*s,.024*s,5,.016*s),m.gloss(PAL.lemon),[0,.085*s,0],[-PI/2,0,0])});
  const notes=range(2,(t,i)=>{const N=grp(g,[0,0,0]);const nm=m.gloss(PAL.grape);P(N,G.s(.036*s),nm,[0,0,0],[0,0,.4],[1.25,.9,.7]);bt(N,[.035*s,.005*s,0],[.035*s,.12*s,0],.012*s,nm);P(N,G.ca(.014*s,.04*s),nm,[.055*s,.105*s,0],[0,0,1]);return N});
  c.an((t,w,a)=>notes.forEach((N,i)=>{const u=(t*.4+i*.5)%1;N.position.set((i?-1:1)*(sx+.24*s+u*.08*s),cy+.05*s+u*.35*s,.04*s);N.rotation.z=Math.sin(t*3+i)*.2;N.scale.setScalar(Math.sin(u*PI)+.001)}))});

/* ============================== OBJEKTE ============================== */
X('heiligenschein','Heiligenschein','ding',(g,c)=>{const m=c.m,s=c.s*1.3,H=c.H;const y0=H.top+.17*s;const Hg=grp(g,[0,y0,0]);const T=grp(Hg,[0,0,0],[PI/2-.5,0,0]);
  P(T,G.to(.24*s,.045*s),m.c(PAL.lemon,{emissive:'#9A6A00',gloss:1.2,rim:.6}));const aura=P(T,G.to(.24*s,.085*s),m.c(PAL.butter,{opacity:.28}));aura.userData.noOutline=true;
  const sp=range(3,(t,i)=>P(Hg,G.star(.045*s,.018*s,4,.014*s),m.c(PAL.butter,{emissive:'#9A6A00',gloss:1})));
  c.an((t,w,a)=>{Hg.position.y=y0+Math.sin(t*1.8)*.025*s;Hg.rotation.y=t*.5;sp.forEach((k,i)=>{const q=t*.9+i*TAU/3;k.position.set(Math.cos(q)*.3*s,Math.sin(t*2+i)*.04*s+.03*s,Math.sin(q)*.3*s);k.rotation.y=-t*.5-q;k.scale.setScalar(.6+.5*Math.max(0,Math.sin(t*3+i*2)))})})});

X('krone','Krone','ding',(g,c)=>{const m=c.m,s=c.s*1.3,H=c.H;const R=.2*s,h=.12*s;const K=grp(g,[0,H.top-.05*s,0],[.06,0,.12]);
  P(K,la([[R*.92,0],[R*1.04,0],[R*1.1,h],[R*.98,h],[R*.92,0]],1),m.gold());P(K,G.to(R*1.03,.036*s),m.plush(PAL.white),[0,.01*s,0],[PI/2,0,0]);
  P(K,G.s(R*.94),m.plush(PAL.cherry),[0,h*.5,0],null,[1,.62,1]);P(K,G.s(.035*s),m.gold(),[0,h*.5+R*.6,0]);
  const cols=[PAL.cherry,PAL.blue,PAL.mint,PAL.blue,PAL.mint];
  range(5,(t,i)=>{const a=i/5*TAU;const x=Math.sin(a),z=Math.cos(a);P(K,G.co(.056*s,.14*s),m.gold(),[x*R*1.03,h+.06*s,z*R*1.03],[z*.18,0,-x*.18]);
    P(K,G.s(.032*s),m.pearl(),[x*R*1.09,h+.14*s,z*R*1.09]);P(K,G.s(.034*s),m.gloss(cols[i]),[x*R*1.1,h*.52,z*R*1.1],[0,a,0],[1,1,.5])})});

X('namensschild','Namensschild','ding',(g,c)=>{const m=c.m,s=c.s*1.5,L=body(c);const M=mount(g,c,L.chest+.06*L.rT,.52,0,{flat:.75});const B=grp(M,[0,0,.022*s],[0,0,-.08]);
  P(B,G.bx(.3*s,.2*s,.035*s,.03*s),m.gloss(PAL.white));P(B,G.bx(.3*s,.078*s,.04*s,.03*s),m.gloss(PAL.strawberry),[0,.061*s,.003*s]);
  P(B,G.pl(.28*s,.187*s),m.tex('ex-badge',TX.badge(),{transparent:true,rim:0}),[0,0,.0245*s]);
  P(B,G.ca(.012*s,.1*s),m.chrome(),[0,.105*s,-.004*s],[0,0,PI/2]);P(B,G.s(.018*s),m.gloss(PAL.lemon),[.07*s,.105*s,-.004*s])});

X('glocke','Kuhglocke','ding',(g,c)=>{const m=c.m,s=c.s*1.6,L=body(c);const sz=shapeOf(c).z;const y=c.topY-.1*s;const R=surfR(c,y)+.03*s;
  P(g,G.to(R,.045*s),m.gloss(PAL.strawberry),[0,y,0],[PI/2,0,0],[1,sz,1]);P(g,G.bx(.07*s,.08*s,.05*s,.015*s),m.gold(),[R*.72,y,-R*sz*.68],[0,PI*.75,0]);
  const bz=R*sz+.02*s;const Bp=grp(g,[0,y-.03*s,bz]);const need=sp(c,y-.3*s,0).z+.11*s;const tilt=-Math.max(0,Math.atan2(need-bz,.27*s));
  P(Bp,G.to(.026*s,.012*s),m.gold(),[0,-.015*s,0]);const I=grp(Bp,[0,0,0]);
  P(I,la([[0,.12],[.05,.115],[.068,.08],[.074,0],[.088,-.07],[.1,-.1],[.09,-.112],[0,-.09]],s),m.gloss(PAL.honey),[0,-.16*s,0]);
  P(I,G.to(.095*s,.018*s),m.gloss(PAL.orange),[0,-.262*s,0],[PI/2,0,0]);P(I,G.s(.036*s),m.c(PAL.choc),[0,-.28*s,0]);
  P(I,G.s(.018*s),m.flat('#ffffff'),[-.03*s,-.13*s,.07*s],null,[.6,1.4,.4]);
  c.an((t,w,a)=>{Bp.rotation.x=tilt+Math.sin(t*(w?8:2.2))*.04;Bp.rotation.z=Math.sin(t*(w?7:2.4))*(w?.3:.09)+a*Math.sin(t*14)*.3})});

X('laterne','Laterne','ding',(g,c)=>{const m=c.m,s=c.s*1.3,L=body(c);const A=surf(c,L.mid,PI+.55,-.02*s).p;const tip=new V3(-.86*s,c.topY+.5*s,.18*s);
  P(g,tu([A,new V3(A.x-.08*s,L.chest+.1*s,A.z-.12*s),new V3(-.62*s,c.topY+.45*s,-.3*s),new V3(-.84*s,c.topY+.62*s,-.02*s),tip],.028*s),m.wood());
  P(g,G.s(.04*s),m.gloss(PAL.cherry),arr(tip));const Lp=grp(g,arr(tip));bt(Lp,[0,0,0],[0,-.1*s,0],.012*s,m.c(PAL.ink));
  const Lb=grp(Lp,[0,-.29*s,0]);Lb.scale.setScalar(1.35);const lm=m.c(PAL.orange,{emissive:'#C44A00',rim:.9});P(Lb,G.s(.135*s),lm,[0,0,0],null,[1,.85,1]);
  both(y=>P(Lb,G.to(.121*s,.012*s),m.gloss(PAL.honey),[0,y*.05*s,0],[PI/2,0,0]));
  P(Lb,G.cy(.06*s,.075*s,.04*s),m.gloss(PAL.cherry),[0,.118*s,0]);P(Lb,G.cy(.075*s,.06*s,.04*s),m.gloss(PAL.cherry),[0,-.118*s,0]);P(Lb,G.ca(.018*s,.07*s),m.gloss(PAL.cherry),[0,-.19*s,0]);
  face(Lb,c,0,.0,.128*s,.034*s,{cheeks:true});const aura=P(Lb,G.s(.2*s),m.c(PAL.butter,{opacity:.16}));aura.userData.noOutline=true;
  c.an((t,w,a)=>{Lp.rotation.z=Math.sin(t*1.8)*(w?.22:.07);Lp.rotation.x=Math.sin(t*1.3)*.05})});

X('partyhut','Partyhut','ding',(g,c)=>{const m=c.m,s=c.s*1.4,H=c.H;const Hh=grp(g,[H.r*.12,H.top-.04*s,0],[.05,0,-.24]);
  const side=range(9,(t)=>[.16-.145*t,.02+.34*t]);P(Hh,la([[0,0],[.165,0],...side,[0,.37]],s),m.tex('ex-party',TX.party(),{gloss:.7}));
  P(Hh,G.to(.165*s,.034*s),m.plush(PAL.mint),[0,.015*s,0],[PI/2,0,0]);const pom=P(Hh,G.blob(.062*s,.18,8,2),m.plush(PAL.lemon),[0,.39*s,0]);
  c.an((t,w,a)=>{pom.scale.setScalar(1+Math.sin(t*3)*.05);Hh.rotation.z=-.24+Math.sin(t*1.4)*.03})});

X('leitkegel','Leitkegel','ding',(g,c)=>{const m=c.m,s=c.s*1.35,H=c.H;const K=grp(g,[0,H.top-.03*s,0],[.05,0,.12]);const om=m.gloss(PAL.orange);
  P(K,G.bx(.42*s,.055*s,.42*s,.022*s),m.gloss('#F07F2A'),[0,.027*s,0]);
  P(K,la([[0,0],[.17,0],[.165,.03],[.06,.44],[.04,.47],[0,.475]],s),om,[0,.05*s,0]);
  [[.17,.118],[.3,.082]].forEach(([y,r])=>P(K,G.to(r*s,.022*s),m.gloss(PAL.white),[0,(.05+y)*s,0],[PI/2,0,0]))});

X('umhang','Umhang','ding',(g,c)=>{const{s,m}=c,L=body(c);const S=shapeOf(c);const yT=c.topY-.07*s,yB=Math.max(.1*s,c.y0*.35);const N=14;
  const prof=[];let rmax=0;for(let j=0;j<=N;j++){const y=yT-(yT-yB)*j/N;rmax=Math.max(rmax,surfR(c,y));prof.push([rmax*(S.e>2?1.13:1.03)+.05*s+Math.pow(j/N,1.3)*.14*s,y])}
  const th=.03*s,ph0=PI/2-.14,pl=PI+.28;
  const outerP=prof.slice().reverse().map(p=>new THREE.Vector2(p[0],p[1])),innerP=prof.map(p=>new THREE.Vector2(p[0]-th,p[1]));
  const go=new THREE.LatheGeometry(outerP,Q(30),ph0,pl),gi=new THREE.LatheGeometry(innerP,Q(30),ph0,pl);
  P(g,go,m.c(PAL.cherry,{rim:.55}));const lin=P(g,gi,m.c(PAL.lemon,{side:THREE.BackSide}));lin.userData.noOutline=true;
  const ring=(y,r,n)=>range(n,(t)=>{const a=ph0+pl*t;return[Math.sin(a)*r,y,Math.cos(a)*r]});
  const hem=P(g,tu(ring(prof[N][1],prof[N][0]-th/2,40),.024*s,.024*s,Q(80)),m.gloss(PAL.honey));
  const edges=[0,1].map(k=>{const a=ph0+pl*k;return P(g,tu(prof.map(p=>[Math.sin(a)*(p[0]-th/2),p[1],Math.cos(a)*(p[0]-th/2)]),.022*s),m.gloss(PAL.honey))});
  const col=P(g,tu(ring(yT+.01*s,prof[0][0]-th/2,30),.032*s,.032*s,Q(60)),m.gloss(PAL.honey));
  const cf=sp(c,yT-.02*s,0);const cr=Math.max(.08*s,prof[0][0]);
  P(g,tu([[cr*.98,yT,.02*s],[cr*.5,yT-.05*s,cf.z*.95+.03*s],[0,yT-.07*s,cf.z+.04*s],[-cr*.5,yT-.05*s,cf.z*.95+.03*s],[-cr*.98,yT,.02*s]],.014*s),m.gold());
  P(g,G.s(.04*s),m.gold(),[0,yT-.07*s,cf.z+.045*s],null,[1,1,.6]);
  const geos=[go,gi,hem.geometry,edges[0].geometry,edges[1].geometry];const base=geos.map(q=>q.attributes.position.array.slice());
  c.an((t,w,a)=>{geos.forEach((q,gi2)=>{const p=q.attributes.position,b=base[gi2];for(let i=0;i<p.count;i++){const x=b[i*3],y=b[i*3+1],z=b[i*3+2];const k=Math.pow(Math.max(0,(yT-y)/(yT-yB)),1.4);
      const ang=Math.atan2(x,z);const back=.55+.45*Math.max(0,-Math.cos(ang));const d=k*back*((w?.09:.02)*s+a*.12*s+Math.sin(t*(w?4.5:1.6)+ang*2.5+y*3)*(w?.035:.014)*s);
      const rl=Math.hypot(x,z)||1;p.setXYZ(i,x+x/rl*d,y+k*d*.15,z+z/rl*d)}p.needsUpdate=true;q.computeVertexNormals()})})});

X('blasenhelm','Blasenhelm','ding',(g,c)=>{const{s,m}=c,H=c.H;const sx=Math.max(H.sideX||H.r,H.r),topC=Math.min(H.top,H.cy+H.r*1.45),bot=H.cy-H.r*.95;
  const rx=sx*1.16+.03*s,ry=(topC-bot)/2*1.14+.04*s,rz=Math.max(H.r,H.front)*1.2+.03*s,cy=(topC+bot)/2+.02*s;
  P(g,G.s(1),m.glass('#C4EAFF'),[0,cy,0],null,[rx,ry,rz]);
  const glint=(d,sc)=>{d=new V3(...d).normalize();const p=new V3(d.x*rx,cy+d.y*ry,d.z*rz);const k=P(g,G.s(.05*s),m.flat('#ffffff'),[p.x,p.y,p.z],null,sc);k.quaternion.copy(basisQ(new V3(d.x/rx,d.y/ry,d.z/rz)));k.userData.noOutline=true};
  glint([-.45,.5,.75],[1.6,.55,.15]);glint([-.62,.2,.76],[.35,.35,.1]);glint([.5,-.3,.8],[.6,.25,.1]);
  const yc=cy-ry*.8,rc=Math.sqrt(1-.64);P(g,G.to(1,.065*s/Math.max(rx,rz)),m.gloss(PAL.white),[0,yc,0],[PI/2,0,0],[rx*rc,rz*rc,Math.max(rx,rz)]);
  range(8,(t,i)=>{const a=i/8*TAU;P(g,G.s(.018*s),m.chrome(),[Math.sin(a)*(rx*rc+.05*s),yc,Math.cos(a)*(rz*rc+.05*s)])});
  P(g,G.ca(.06*s,.16*s),m.gloss(PAL.teal),[0,yc-.05*s,-rz*rc-.08*s]);P(g,G.s(.035*s),m.chrome(),[0,yc+.08*s,-rz*rc-.08*s]);
  const bub=range(3,(t,i)=>P(g,G.s(.022*s),m.glass('#ffffff'),[(t-.5)*rx*.9,cy,rz*.55]));
  c.an((t,w,a)=>bub.forEach((b,i)=>{const u=(t*.3+i*.33)%1;b.position.y=bot+u*(topC-bot);b.scale.setScalar(Math.sin(u*PI)+.001)}))});

X('engelsfluegel','Engelsflügelchen','ding',(g,c)=>{const m=c.m,s=c.s*1.8,L=body(c);const M=mount(g,c,L.chest+.08*L.rT,PI,-.02*s,{flat:1});const k=1.25*s;
  const wing=sshp([[0,0],[.1,.2],[.26,.36],[.44,.42],[.52,.33],[.46,.2],[.5,.1],[.4,.02],[.42,-.07],[.3,-.1],[.28,-.19],[.14,-.16],[.03,-.08]].map(p=>[p[0]*k,p[1]*k]));
  const inner=sshp([[.05,.03],[.14,.18],[.26,.28],[.37,.3],[.39,.21],[.3,.1],[.31,.0],[.19,-.05],[.09,-.03]].map(p=>[p[0]*k,p[1]*k]));const W=[];
  both(sg=>{const w=grp(M,[sg*.08*c.s,.02*s,.07*c.s]);const I=grp(w,[0,0,0]);I.scale.set(sg,1,1);P(I,G.puff(wing,.045*s),m.plush('#FFF5FA'));
    both(z=>P(I,G.puff(inner,.02*s),m.plush('#FFD0E2'),[0,0,z*.035*s]));W.push([w,sg])});
  c.an((t,w,a)=>{const sp=a>0?7:w?4.5:2.2,amp=a>0?.5:w?.25:.12;W.forEach(([q,sg])=>{q.rotation.y=sg*(.35+Math.sin(t*sp)*amp);q.rotation.z=sg*(Math.sin(t*sp)*amp*.35)})})});

X('kristalle','Kristallwucherung','ding',(g,c)=>{const m=c.m,s=c.s*1.7,L=body(c);const cols=[PAL.lilac,PAL.aqua,'#FFB8DE'];const tw=[];
  const crys=(M,r,h,col,rot)=>{const k=grp(M,[0,0,0],rot);P(k,new THREE.LatheGeometry([[0,-.02*s],[r,0],[r,h],[0,h+r*1.5]].map(p=>new THREE.Vector2(p[0],p[1])),6),m.c(col,{gloss:1.3,rim:1}));return k};
  const cluster=(y,v,sc,n,seed)=>{const M=mount(g,c,y,v,-.02*s,{lift:1.1});const r=srand(seed);P(M,G.blob(.08*s*sc,.2,5,seed),m.c(PAL.lavender,{rim:.5}),[0,0,0],null,[1.2,1,.5]);
    range(n,(t,i)=>{const a=i/n*TAU+r(),tl=i?.35+r()*.35:0;const h=(i?.18+r()*.14:.36)*s*sc;crys(M,(i?.045:.07)*s*sc,h,cols[i%3],[Math.cos(a)*tl+PI/2*.0,0,Math.sin(a)*tl]).rotation.x+=PI/2})};
  cluster(L.chest+.3*L.rT,-1.75,1,6,11);cluster(L.chest-.3*L.rT,PI+.9,.7,4,5);
  range(2,(t,i)=>{const M=mount(g,c,i?L.chest+.45*L.rT:L.chest+.1*L.rT,i?PI+.95:-1.3,.25*s);tw.push(P(M,G.star(.04*s,.012*s,4,.01*s),m.flat('#ffffff')))});
  c.an(t=>tw.forEach((k,i)=>{k.scale.setScalar(Math.max(0,Math.sin(t*2+i*2.2))+.001);k.rotation.z=t}))});

/* ============================== PFLANZLICH ============================== */
X('pilz','Pilz-Symbiont','pflanze',(g,c)=>{const m=c.m,s=c.s*1.5,L=body(c);const M=mount(g,c,L.mid-.04*c.s,1.9,-.03*c.s,{flat:.6});const P0=grp(M,[0,0,.02*s],[.5,0,0]);
  P(P0,la([[0,-.02],[.09,-.02],[.085,.08],[.072,.18],[.066,.25],[0,.25]],s),m.c(PAL.cream,{rim:.5}));
  const Cp=grp(P0,[0,.24*s,0]);P(Cp,la([[0,-.02],[.16,-.03],[.24,-.02],[.26,.02],[.22,.1],[.13,.17],[0,.19]],s),m.gloss(PAL.strawberry));
  P(Cp,la([[0,-.03],[.22,-.028],[0,.01]],s),m.c(PAL.bone),[0,-.005*s,0]);
  [[0,0],[.7,.62],[2.1,.6],[3.4,.62],[4.6,.6],[1.4,.32],[3.9,.3],[5.4,.34]].forEach(([a,u])=>{const r=u*.24*s,y=(.19-u*u*.17)*s;const d=new V3(Math.cos(a)*u,.8,Math.sin(a)*u).normalize();
    const k=P(Cp,G.s(.036*s),m.gloss(PAL.white),[Math.cos(a)*r,y+.004*s,Math.sin(a)*r],null,[1,1,.4]);k.quaternion.copy(basisQ(d))});
  const Fg=grp(P0,[-.078*s,.1*s,0],[0,-PI/2,0]);face(Fg,c,0,0,0,.028*s);
  const B=grp(M,[-.13*c.s,-.1*c.s,.03*c.s],[.7,0,.3]);P(B,la([[0,-.01],[.035,-.01],[.03,.08],[0,.08]],s),m.c(PAL.cream));const bc=grp(B,[0,.075*s,0]);
  P(bc,la([[0,-.01],[.08,-.012],[.085,.01],[.06,.05],[0,.065]],s),m.gloss(PAL.strawberry));P(bc,G.s(.016*s),m.gloss(PAL.white),[0,.064*s,0],null,[1,.4,1]);
  const spores=range(4,(t,i)=>P(g,G.s(.018*s),m.glow('#FFF3C4',1.4),[0,0,0]));const top=toW(Cp,new V3(0,.2*s,0));
  c.an((t,w,a)=>{Cp.scale.set(1+Math.sin(t*2)*.03,1-Math.sin(t*2)*.04,1+Math.sin(t*2)*.03);P0.rotation.z=Math.sin(t*1.2)*.06;
    spores.forEach((k,i)=>{const u=(t*(.25+a*.5)+i/4)%1;k.position.set(top.x+Math.sin(u*5+i*2)*.12*s,top.y+u*.45*s,top.z+Math.cos(u*4+i)*.1*s);k.scale.setScalar(Math.sin(u*PI)*(.6+a)+.001)})})});

X('pilzkolonie','Pilzkolonie','pflanze',(g,c)=>{const m=c.m,s=c.s*1.8,L=body(c);const r=srand(23);const caps=[PAL.choc,PAL.oak,PAL.lilac,PAL.honey,PAL.terracotta];const bob=[];
  const mush=(y,v,sc,col,i)=>{const M=mount(g,c,y,v,-.02*s,{flat:.55});const T=grp(M,[0,0,0],[-.25+r()*.2,0,(r()-.5)*.5]);const h=(.1+r()*.08)*s*sc;
    P(T,G.cy(.025*s*sc,.035*s*sc,h),m.c(PAL.cream,{rim:.5}),[0,h/2,.02*s]);const cp=grp(T,[0,h,.02*s]);P(cp,la([[0,-.01],[.07,-.015],[.08,.01],[.06,.045],[0,.06]],s*sc),m.gloss(col));
    if(i%2===0)P(cp,G.s(.016*s*sc),m.gloss(PAL.white),[.03*s*sc,.045*s*sc,.02*s*sc],null,[1,.5,1]);bob.push([cp,i])};
  const shelf=(y,v,sc,col)=>{const M=mount(g,c,y,v,-.03*s,{flat:1});P(M,G.s(.12*s*sc),m.gloss(col),[0,0,.05*s*sc],null,[1.15,.32,.9]);P(M,G.to(.1*s*sc,.02*s*sc),m.c(PAL.cream),[0,-.012*s*sc,.06*s*sc],[PI/2,0,0],[1.1,.8,1])};
  const cs=c.s;shelf(L.belly-.02*cs,1.55,1,PAL.oak);shelf(L.belly+.16*cs,1.72,.8,PAL.honey);shelf(L.belly-.2*cs,1.75,.65,PAL.choc);
  const pts=[[-.1,2.3],[-.14,2.6],[-.02,2.8],[-.16,3.1],[-.06,3.45],[-.12,3.8],[-.2,2.05]];pts.forEach(([dy,v],i)=>mush(L.belly+dy*cs,v,.8+r()*.5,caps[i%caps.length],i));
  const mt=mount(g,c,L.belly-.12*cs,2.9,-.03*s,{flat:.6});P(mt,G.blob(.14*s,.25,6,4),m.c(PAL.moss),[0,0,0],null,[1.5,.6,.4]);
  c.an(t=>bob.forEach(([cp,i])=>{const q=Math.sin(t*1.8+i*1.3)*.04;cp.scale.set(1+q,1-q,1+q)}))});

X('blume','Kopfblume','pflanze',(g,c)=>{const m=c.m,s=c.s*1.3,H=c.H;const bx=-H.r*.3,by=H.cy+(H.top-H.cy)*.93-.03*s;const S=grp(g,[bx,by,-.05*s],[0,0,.32]);
  P(S,tu([[0,-.02*s,0],[.03*s,.12*s,0],[0,.26*s,.02*s]],.026*s,.022*s),m.gloss(PAL.leaf));
  both(x=>{const Lf=grp(S,[0,.09*s,0],[0,x*.4,x*-.9]);P(Lf,G.puff(leafShape(.09*s,.15*s),.02*s),m.gloss(PAL.grass),[0,.01*s,0])});
  const F=grp(S,[0,.28*s,.03*s],[-.25,0,0]);const pm=[m.gloss(PAL.pink),m.gloss(PAL.blush)];
  range(8,(t,i)=>{const a=i/8*TAU;const Pt=grp(F,[0,0,0],[0,0,a]);P(Pt,G.puff(petalShape(.1*s,.13*s),.022*s),pm[i%2],[0,.045*s,-.01*s])});
  P(F,G.s(.065*s),m.gloss(PAL.lemon),[0,0,.012*s],null,[1,1,.55]);face(F,c,0,.006*s,.048*s,.024*s);
  c.an((t,w,a)=>{S.rotation.z=.32+Math.sin(t*1.3)*.08;F.rotation.y=Math.sin(t*.9)*.15})});

X('topfpflanze','Topfpflanze auf dem Kopf','pflanze',(g,c)=>{const m=c.m,s=c.s*1.4,H=c.H;const T=grp(g,[0,H.top-.04*s,0]);
  P(T,la([[0,0],[.14,0],[.155,.02],[.18,.18],[.205,.19],[.21,.24],[.19,.25],[.175,.22],[0,.22]],s),m.gloss(PAL.terracotta));
  P(T,G.cy(.172*s,.172*s,.02*s),m.c(PAL.choc),[0,.225*s,0]);face(T,c,0,.1*s,.175*s,.03*s);
  const lv=[];range(6,(t,i)=>{const a=i/6*TAU+.3;const Lf=grp(T,[Math.sin(a)*.03*s,.23*s,Math.cos(a)*.03*s],[0,a,0]);const tilt=grp(Lf,[0,0,0],[.55+(i%2)*.2,0,0]);
    P(tilt,G.ca(.013*s,.1*s),m.c(PAL.forest),[0,.05*s,0]);P(tilt,G.puff(G_leaf(i),.024*s),m.gloss(i%2?PAL.leaf:PAL.grass),[0,.09*s,0],[-.3,0,0]);lv.push([tilt,i])});
  const Sp=grp(T,[0,.23*s,0]);bt(Sp,[0,0,0],[0,.16*s,0],.015*s,m.c(PAL.forest));both(x=>P(Sp,G.puff(leafShape(.05*s,.07*s),.014*s),m.gloss(PAL.mint),[0,.15*s,0],[0,x*PI/2,x*-.9]));
  function G_leaf(i){const k=i%2?1:.85;return leafShape(.13*s*k,.22*s*k)}
  c.an((t,w,a)=>{lv.forEach(([L2,i])=>L2.rotation.x=.55+(i%2)*.2+Math.sin(t*1.5+i)*.06);Sp.rotation.z=Math.sin(t*2)*.1})});

X('moosflecken','Moosflecken','pflanze',(g,c)=>{const m=c.m,s=c.s*1.6,L=body(c);const r=srand(9);
  const spots=[[L.belly-.05*s,.55,1],[L.chest+.2*L.rT,-.55,.85],[L.mid,1.45,.9],[L.belly-.15*s,-1.25,.8],[L.chest+.1*s,2.5,1],[L.mid-.05*s,PI+.3,.95],[L.chest+.35*L.rT,.95,.6],[L.belly+.05*s,-2.3,.8]];
  spots.forEach(([y,v,sc],i)=>{const M=mount(g,c,y,v,-.012*s);P(M,G.blob(.1*s*sc,.22,6,i+1),m.c(i%2?PAL.moss:'#6DAE55',{rim:.6,rimColor:'#eaffb0'}),[0,0,0],null,[1.2,1,.38]);
    range(2,(t,j)=>P(M,G.s(.04*s*sc),m.c(PAL.grass,{rim:.6}),[(r()-.5)*.14*s*sc,(r()-.5)*.1*s*sc,.03*s*sc],null,[1,1,.6]));
    if(i%2===0)P(M,G.s(.018*s),m.gloss(i%4?PAL.lemon:PAL.white),[(r()-.5)*.08*s,(r()-.5)*.06*s,.05*s*sc]);
    if(i===0||i===4){P(M,G.ca(.01*s,.05*s),m.c(PAL.forest),[0,.06*s,.04*s]);P(M,G.s(.018*s),m.gloss(PAL.pink),[0,.1*s,.04*s])}})});

X('efeu','Efeu','pflanze',(g,c)=>{const m=c.m,s=c.s,L=body(c);const y0=L.belly-.32*L.r0,y1=L.chest+.35*L.rT;const path=t=>{const y=y0+(y1-y0)*t,v=-1.9+t*(PI+.8+1.9);return surf(c,y,v,.02*s)};
  const pts=range(40,t=>path(t).p);P(g,tu(pts,.024*s,.018*s,Q(90)),m.gloss('#5E9B4A'));
  const leaves=[];range(17,(t,i)=>{const u=.03+t*.94,{p,n}=path(u);const side=i%2?1:-1;const M=grp(g,[p.x,p.y,p.z]);M.quaternion.copy(basisQ(n));
    const Lf=grp(M,[0,0,.012*s],[0,0,side*1.1+PI]);Lf.rotation.x=-.35;P(Lf,G.heart((.085+.015*Math.sin(i*1.7))*s,.022*s),m.gloss(i%3?PAL.leaf:PAL.moss),[0,-.08*s,0]);leaves.push([Lf,side,i])});
  const e=path(1);const cu=[];for(let k=0;k<=16;k++){const a=k/16*TAU*1.2,r=(.06-k*.003)*s;cu.push(e.p.clone().add(new V3(Math.cos(a)*r*.8,.05*s+Math.sin(a)*r,0)))}P(g,tu(cu,.016*s,.012*s),m.gloss('#5E9B4A'));
  c.an((t,w,a)=>leaves.forEach(([Lf,side,i])=>{Lf.rotation.z=side*1.1+PI+Math.sin(t*1.5+i)*.1;Lf.rotation.x=-.35+Math.sin(t*1.9+i*2)*.08}))});

X('kompostbauch','Kompost-Bauch','pflanze',(g,c)=>{const m=c.m,s=c.s*1.4,L=body(c);const M=mount(g,c,L.belly+.03*s,0,0,{flat:.85});const R=.23*s;
  P(M,G.circ(R),m.tex('ex-compost',TX.compost()),[0,0,.012*s]);P(M,G.to(R,.048*s),m.wood(),[0,0,.025*s]);
  range(6,(t,i)=>{const a=i/6*TAU+PI/6;P(M,G.s(.017*s),m.copper(),[Math.cos(a)*R,Math.sin(a)*R,.068*s])});
  P(M,G.hs(R*.98),m.glass('#FFF4E0'),[0,0,.02*s],[PI/2,0,0],[1,.5,1]);
  const worms=range(2,(t,i)=>{const W=grp(M,[0,0,.05*s]);const I=grp(W,[0,0,0]);const wm=m.gloss(PAL.rose);
    P(I,tu([[-.06*s,0,0],[-.02*s,.025*s,0],[.02*s,-.01*s,0],[.06*s,.015*s,0]],.022*s,.018*s),wm);P(I,G.s(.022*s),wm,[-.06*s,0,0]);P(I,G.s(.018*s),wm,[.06*s,.015*s,0]);
    both(x=>P(I,G.s(.006*s),m.eye(),[-.068*s,.008*s,x*.012*s+.018*s]));return[W,I]});
  P(M,G.puff(leafShape(.06*s,.09*s),.012*s),m.gloss(PAL.leaf),[.1*s,-.12*s,.05*s],[0,0,-.6]);P(M,G.s(.035*s),m.gloss(PAL.cherry),[-.1*s,-.14*s,.05*s],null,[1,1.1,.8]);P(M,G.s(.012*s),m.c(PAL.bark),[-.1*s,-.1*s,.05*s]);
  const Sp=grp(M,[.05*s,R+.02*s,.04*s]);P(Sp,G.ca(.013*s,.08*s),m.c(PAL.forest),[0,.04*s,0]);both(x=>P(Sp,G.puff(leafShape(.05*s,.07*s),.014*s),m.gloss(PAL.grass),[0,.09*s,0],[0,x*.3,x*-1.1]));
  c.an((t,w,a)=>{worms.forEach(([W,I],i)=>{const q=t*.35+i*PI;W.position.set(Math.cos(q)*.08*s,Math.sin(q*1.3)*.07*s,.05*s);I.rotation.z=Math.sin(t*2+i)*.35;I.scale.x=Math.sin(q)>0?-1:1});Sp.rotation.z=Math.sin(t*1.7)*.12})});

X('seerose','Seerosen-Schulter','pflanze',(g,c)=>{const m=c.m,s=c.s*1.7;const S=shoulder(c,-1);const T=grp(g,[S.x+.02*s,S.y+.015*s,S.z],[0,0,.18]);
  const pad=new THREE.Shape();pad.absarc(0,0,.16*s,.35,TAU-.05,false);pad.lineTo(0,0);P(T,G.puff(pad,.025*s),m.gloss(PAL.leaf),[0,0,0],[-PI/2,0,0]);
  const F=grp(T,[.01*s,.035*s,.02*s]);
  range(8,(t,i)=>{const a=i/8*TAU;const Pt=grp(F,[0,0,0],[-.5,a,0],null);Pt.rotation.order='YXZ';P(Pt,G.s(.07*s),m.gloss(i%2?PAL.pink:PAL.blush),[0,0,.075*s],null,[.5,.2,1.05])});
  range(6,(t,i)=>{const a=i/6*TAU+.3;const Pt=grp(F,[0,.015*s,0],[-1.0,a,0]);Pt.rotation.order='YXZ';P(Pt,G.s(.055*s),m.gloss('#FFF0F5'),[0,0,.05*s],null,[.5,.22,1])});
  P(F,G.s(.035*s),m.gloss(PAL.lemon),[0,.04*s,0],null,[1,.7,1]);range(5,(t,i)=>{const a=i/5*TAU;P(F,G.s(.013*s),m.gloss(PAL.honey),[Math.cos(a)*.03*s,.065*s,Math.sin(a)*.03*s])});
  P(T,G.drop(.026*s,.02*s),m.glass('#E8FBFF'),[-.11*s,.03*s,.07*s]);
  const Bd=grp(T,[.09*s,.02*s,-.1*s]);P(Bd,G.drop(.04*s,.05*s),m.gloss(PAL.pink),[0,.04*s,0]);
  c.an((t,w,a)=>{T.position.y=S.y+.015*s+Math.sin(t*1.6)*.008*s;F.rotation.y=Math.sin(t*.6)*.2;const q=1+Math.sin(t*2)*.03;F.scale.set(q,1/q,q)})});

/* ===================== WIRED: Candy-Mech-Extras ===================== */
const WC={bondi:'#2fb5d9',grape:'#9b6ae0',tangerine:'#ff9a45',lime:'#7fd34a',strawberry:'#ff6fa5',lemon:'#ffd23f'};const wcandy=(m,col,op)=>m.c(col,{opacity:op??.55,gloss:1.3,rim:1.3,rimColor:'#ffffff'});
X('aufzieh','Aufziehschlüssel','masch',(g,c)=>{const m=c.m,s=c.s*1.2,L=body(c);const M=mount(g,c,L.chest-.05*s,PI,0,{flat:1});const k=grp(M,[0,0,.02*s]);
  P(k,G.cy(.03*s,.03*s,.16*s),m.chrome(),[0,0,.08*s],[PI/2,0,0]);const wing=grp(k,[0,0,.17*s]);both(x=>P(wing,G.s(.09*s),m.gloss(WC.lemon),[x*.09*s,0,0],null,[1,.7,.25]));P(wing,G.cy(.04*s,.04*s,.04*s),m.chrome(),[0,0,0],[PI/2,0,0]);
  c.an((t,w)=>{wing.rotation.z=t*(w?3:.8)})});
X('kapselrucksack','Kapsel-Rucksack','masch',(g,c)=>{const m=c.m,s=c.s*1.1,L=body(c);const M=mount(g,c,(L.chest+L.belly)/2,PI,.06*c.s,{flat:1});
  P(M,G.s(.24*s),m.gloss(WC.tangerine),[0,0,.14*s],null,[1,1.15,.7]);P(M,G.s(.25*s),wcandy(m,'#ffffff',.35),[0,0,.15*s],null,[1,1.15,.72]);const gr=grp(M,[0,.02*s,.18*s]);
  P(gr,G.cy(.11*s,.11*s,.03*s),m.gloss('#e6ecf5'),[0,0,0],[PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(gr,G.bx(.035*s,.035*s,.03*s),m.gloss('#e6ecf5'),[Math.cos(a)*.12*s,Math.sin(a)*.12*s,0],[0,0,a])}
  c.an(t=>{gr.rotation.z=t*1.3})});
X('pager','Pager am Gürtel','masch',(g,c)=>{const m=c.m,s=c.s,L=body(c);const M=mount(g,c,L.belly+.05*s,.9,0,{flat:1});P(M,G.bx(.2*s,.13*s,.06*s,.03*s),m.gloss(WC.grape),[0,0,.03*s]);
  P(M,G.pl(.13*s,.05*s),m.flat('#c9f27a'),[0,.02*s,.062*s]);const led=P(M,G.s(.015*s),m.glow(WC.strawberry,2),[.07*s,-.035*s,.06*s]);c.an(t=>{led.visible=(t%2)<1})});
X('sticker','Sticker-Sammlung','ding',(g,c)=>{const m=c.m,s=c.s*1.8,L=body(c);[[ -.5,.15,WC.lemon,'star'],[.45,.05,WC.strawberry,'heart'],[.05,-.2,WC.bondi,'dot']].forEach(([v,dy,col,k],i)=>{const M=mount(g,c,(L.chest+L.belly)/2+dy*s,v,.004*s,{flat:.6});
  if(k==='star')P(M,G.star(.07*s,.03*s,5,.01*s),m.gloss(col),[0,0,.005*s]);else if(k==='heart')P(M,G.heart(.06*s,.01*s),m.gloss(col),[0,0,.005*s]);else P(M,G.cy(.06*s,.06*s,.01*s),m.gloss(col),[0,0,.005*s],[PI/2,0,0])})});

})();
