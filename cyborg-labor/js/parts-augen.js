/* =====================================================================
   AUGEN · Cozy-Spielzeug-Stil
   Alle Augen sitzen auf der echten Gesichtsfläche des gewählten Kopfes:
   face() tastet den bereits gebauten Kopf per Raycast ab (rund, flach,
   breit, schief …) und liefert Punkt + Normale. Fällt auf eine
   Ellipsoid-Näherung aus c.H zurück, wenn nichts getroffen wird.
   ===================================================================== */
(function(){
const A=(id,n,k,b)=>def('augen',id,n,k,b);
const ZV=new V3(0,0,1), UP=new V3(0,1,0);

/* ---------------------------------------------------------------------
   Gesichtsfläche abtasten
   --------------------------------------------------------------------- */
function face(g,c){
  const H=c.H,u=H.r,F=H.front,Y=H.faceY,SX=Math.max(H.sideX||u,u*.7);
  let root=g;while(root.parent)root=root.parent;root.updateMatrixWorld(true);
  const list=[],tmp=new V3();
  root.traverse(o=>{
    if(!o.isMesh||o.userData.hull||o.userData.furShell||o.userData.noOutline&&!o.material.userData.ghost)return;
    const m=o.material;if(!m||Array.isArray(m)||m.userData.glass||m.userData.outline)return;
    if(m.transparent&&!m.userData.ghost&&(m.opacity??1)<.6)return;
    const gm=o.geometry;if(!gm.boundingBox)gm.computeBoundingBox();const b=gm.boundingBox;o.getWorldScale(tmp);
    const dims=[(b.max.x-b.min.x)*tmp.x,(b.max.y-b.min.y)*tmp.y,(b.max.z-b.min.z)*tmp.z];
    if(dims.filter(v=>v<u*.05).length>=2)return;          // Schnurrhaare, Drähte
    list.push(o)});
  const rc=new THREE.Raycaster();
  const cast=(o,d,far)=>{rc.set(g.localToWorld(o.clone()),d.clone().transformDirection(g.matrixWorld));rc.near=0;rc.far=far;return rc.intersectObjects(list,false)};
  const ell=(x,y)=>{const a=x/SX,b=(y-Y)/(u*1.1);return F*Math.sqrt(Math.max(.08,1-a*a-b*b))};
  const memo={};
  const probe=(x,y,raw)=>{const key=x.toFixed(4)+'|'+y.toFixed(4)+(raw?'r':'');if(memo[key])return memo[key];
    let r=null;for(const h of cast(new V3(x,y,F+u*3),new V3(0,0,-1),u*6)){const p=g.worldToLocal(h.point.clone());
      if(p.z>F+u*(raw?2.5:.55))continue;if(p.z<F-u*1.15)break;r={z:p.z,obj:h.object};break}
    return memo[key]=r||{z:ell(x,y),obj:null,miss:true}};
  const zAt=(x,y,raw)=>probe(x,y,raw).z;
  const slope=(z0,zm,zp,e)=>{const l=(z0-zm)/e,r=(zp-z0)/e;const s=Math.abs(l-r)>1.6?(Math.abs(l)<Math.abs(r)?l:r):(l+r)/2;return Math.max(-2.2,Math.min(2.2,s))};
  const at=(x,y,raw)=>{const e=u*.07,p=probe(x,y,raw),z=p.z;
    const sx=slope(z,zAt(x-e,y,raw),zAt(x+e,y,raw),e),sy=slope(z,zAt(x,y-e,raw),zAt(x,y+e,raw),e);
    const mt=p.obj&&!p.obj.material.userData.ghost&&!p.obj.material.transparent?p.obj.material:null;
    return{p:new V3(x,y,z),n:new V3(-sx,-sy,1).normalize(),mat:mt,miss:!!p.miss}};
  /* Gruppe auf die Fläche setzen: lokales +z = Flächennormale (gedämpft mit k) */
  const mount=(x,y,o)=>{o=o||{};const s=at(x,y,o.raw);const k=o.k??.85;const n=new V3(s.n.x*k,s.n.y*k,1).normalize();
    const q=grp(g,[0,0,0]);q.position.copy(s.p).addScaledVector(n,(o.lift||0)*u);q.quaternion.setFromUnitVectors(ZV,n);if(o.roll)q.rotateZ(o.roll);q.userData.surf=s;q.userData.eye=true;return q};
  /* höchster Punkt des Kopfes über (x,z) */
  const top=(x,z)=>{for(const h of cast(new V3(x,H.top+u*2,z),new V3(0,-1,0),u*4)){const p=g.worldToLocal(h.point.clone());if(p.y<Y-u*.1)break;return p.y}return H.top-u*.08};
  /* Ring um den Kopf in Höhe y (Winkel von +z Richtung +x) */
  const ring=(y,a0,a1,n)=>{const pts=[],nrm=[];
    for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/(n-1);const d=new V3(Math.sin(a),0,Math.cos(a));let p=null;
      for(const h of cast(d.clone().multiplyScalar(u*4).setY(y),d.clone().negate(),u*4)){const q=g.worldToLocal(h.point.clone());const rr=Math.hypot(q.x,q.z);if(rr>u*2.3)continue;if(rr>u*.3)p=q;break}
      if(!p){const cz=Math.cos(a)>0?F:u*.95;p=new V3(Math.sin(a)*SX,y,Math.cos(a)*cz)}
      pts.push(new V3(p.x,y,p.z))}
    for(let i=0;i<n;i++){const T=pts[Math.min(n-1,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize();nrm.push(new V3().crossVectors(T,UP).normalize())}
    return{pts,nrm}};
  /* Geometrie an die Fläche anschmiegen (Masken, Brillen, Bildschirme) */
  const bend=(geo,x0,y0,z0)=>{const st=u*.1;const S=(x,y)=>{const ix=Math.floor(x/st),iy=Math.floor(y/st),fx=x/st-ix,fy=y/st-iy;
      const z=(i,j)=>zAt(i*st,j*st);return(z(ix,iy)*(1-fx)+z(ix+1,iy)*fx)*(1-fy)+(z(ix,iy+1)*(1-fx)+z(ix+1,iy+1)*fx)*fy};
    const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,pos.getZ(i)+S(x0+pos.getX(i),y0+pos.getY(i))-z0);
    pos.needsUpdate=true;geo.computeBoundingBox();geo.computeBoundingSphere();return geo};
  /* erster Treffer ohne Überspringen (Hutkrempen, Schirme) */
  const rawZ=(x,y)=>{const hs=cast(new V3(x,y,F+u*3),new V3(0,0,-1),u*6);return hs.length?g.worldToLocal(hs[0].point.clone()).z:null};
  /* höchste freie Stirnhöhe zwischen yHi und yLo (nicht von Krempe o.ä. verdeckt) */
  const OBL=new V3(0,.42,1).normalize();
  const clearY=(x,yHi,yLo)=>{for(let y=yHi;y>=yLo;y-=u*.04){const z=rawZ(x,y);if(z===null||z>F+u*.3||z<F-u*.9)continue;
      const p=new V3(x,y,z),hs=cast(p.clone().addScaledVector(OBL,u*3),OBL.clone().negate(),u*4);
      if(hs.length&&g.worldToLocal(hs[0].point.clone()).distanceTo(p)<u*.08)return y}return null};
  const frontMax=(x,y0,y1)=>{let mz=F;for(let y=y0;y<=y1;y+=u*.1){const z=rawZ(x,y);if(z!==null)mz=Math.max(mz,z)}return mz};
  /* Aufsatz oben auf dem Kopf (wenn die Stirn verdeckt ist); n = Blickrichtung */
  const topMount=(x,z,n,lift)=>{const q=grp(g,[x,top(x,z)+(lift||0)*u,z]);q.quaternion.setFromUnitVectors(ZV,n.clone().normalize());return q};
  /* freie Höhe über einem Punkt */
  const headroom=(p)=>{const hs=cast(p,new V3(0,1,0),u*2);return hs.length?hs[0].distance:u*2};
  return{u,F,Y,SX,H,at,zAt,mount,top,ring,bend,clearY,frontMax,topMount,headroom,skinOr:(x,y)=>at(x,y).mat||c.m.skin()};
}

/* ---------------------------------------------------------------------
   Geometrie-Helfer
   --------------------------------------------------------------------- */
/* Band mit abgerundetem Querschnitt entlang eines Pfades (Visier, Riemen) */
function sweep(pts,nrm,tw,th,sq){sq=sq??.55;const n=pts.length,R=Math.max(8,Q(14));const pos=[],idx=[];
  const tap=i=>{const k=Math.min(i,n-1-i);return k===0?.62:k===1?.92:1};
  for(let i=0;i<n;i++){const C=pts[i],N=nrm[i].clone().normalize();const T=pts[Math.min(n-1,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize();const B=new V3().crossVectors(T,N).normalize();const tp=tap(i);
    for(let j=0;j<R;j++){const a=j/R*TAU,cs=Math.cos(a),sn=Math.sin(a);const sx=Math.sign(cs)*Math.abs(cs)**sq,sy=Math.sign(sn)*Math.abs(sn)**sq;
      const v=C.clone().addScaledVector(N,sx*tw*tp).addScaledVector(B,sy*th*tp);pos.push(v.x,v.y,v.z)}}
  for(let i=0;i<n-1;i++)for(let j=0;j<R;j++){const a=i*R+j,b=i*R+(j+1)%R,c2=(i+1)*R+j,d=(i+1)*R+(j+1)%R;idx.push(a,b,c2,b,d,c2)}
  const cap=(i,sgn)=>{const T=pts[Math.min(n-1,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize();const v=pts[i].clone().addScaledVector(T,sgn*tw*.55);const ci=pos.length/3;pos.push(v.x,v.y,v.z);
    for(let j=0;j<R;j++){const a=i*R+j,b=i*R+(j+1)%R;if(sgn<0)idx.push(ci,b,a);else idx.push(ci,a,b)}};
  cap(0,-1);cap(n-1,1);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();return geo}
/* abgerundetes Rechteck als Shape/Path */
function rr(p,w,h,r,dx,dy){const x=-w/2+(dx||0),y=-h/2+(dy||0);r=Math.min(r,w/2-1e-4,h/2-1e-4);
  p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);p.lineTo(x+w,y+h-r);p.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  p.lineTo(x+r,y+h);p.quadraticCurveTo(x,y+h,x,y+h-r);p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);return p}
const rrShape=(w,h,r)=>rr(new THREE.Shape(),w,h,r);
function ringShape(w,h,r,t){const s=rrShape(w,h,r);s.holes.push(rr(new THREE.Path(),w-2*t,h-2*t,Math.max(.001,r-t)));return s}
/* Lathe, dessen Achse nach +z (vorn) zeigt */
const latheZ=(pts,seg)=>{const g=G.la(pts,seg);g.rotateX(PI/2);return g};
/* runder Scheiben-Körper (Knopf, Wackelauge, Linsenfassung): Achse +z */
const disc=(R,t,b)=>{b=b??t*.5;return latheZ([[0,-t/2],[R-b,-t/2],[R-b*.25,-t/2+b*.25],[R,-t/2+b],[R,t/2-b],[R-b*.25,t/2-b*.25],[R-b,t/2],[0,t/2]])};

/* ---------------------------------------------------------------------
   Augen-Texturen (equirectangular, Vorderseite bei x=64,y=64)
   --------------------------------------------------------------------- */
function eyeTex(key,o){return ctex('aug-'+key,256,128,(x,w,h)=>{const cx=64,cy=64;
  x.fillStyle=o.base||'#2A2540';x.fillRect(0,0,w,h);
  if(o.iris){const R=o.R||46;const gr=x.createRadialGradient(cx,cy+R*.35,2,cx,cy,R);gr.addColorStop(0,o.iris[0]);gr.addColorStop(.65,o.iris[1]);gr.addColorStop(1,o.iris[2]||o.iris[1]);
    x.fillStyle=gr;x.beginPath();x.arc(cx,cy,R,0,TAU);x.fill();x.lineWidth=o.rw||5;x.strokeStyle=o.ring||'rgba(42,37,64,.75)';x.stroke()}
  x.fillStyle=o.pc||'#2A2540';const p=o.pupil;
  if(p==='round'){x.beginPath();x.arc(cx,cy+(o.py||0),o.pr||20,0,TAU);x.fill()}
  else if(p==='slit'){x.beginPath();x.ellipse(cx,cy,o.pw||7,o.ph||38,0,0,TAU);x.fill()}
  else if(p==='bar'){x.beginPath();const bw=o.pw||54,bh=o.ph||15;x.moveTo(cx-bw/2+7,cy-bh/2);x.arcTo(cx+bw/2,cy-bh/2,cx+bw/2,cy+bh/2,7);x.arcTo(cx+bw/2,cy+bh/2,cx-bw/2,cy+bh/2,7);x.arcTo(cx-bw/2,cy+bh/2,cx-bw/2,cy-bh/2,7);x.arcTo(cx-bw/2,cy-bh/2,cx+bw/2,cy-bh/2,7);x.fill()}
  if(o.glow!==false){const gy=cy+(o.gy??34),gr=o.gR||40;const lg=x.createRadialGradient(cx,gy,2,cx,gy,gr);lg.addColorStop(0,o.glow||'rgba(150,128,225,.95)');lg.addColorStop(1,'rgba(150,128,225,0)');x.fillStyle=lg;x.fillRect(0,0,w,h)}
  if(o.draw)o.draw(x,cx,cy)})}
const TEX={
  sig:{},
  kuller:{iris:['#E9C8FF','#9B6BE0','#6E4A9E'],R:50,pupil:'round',pr:24,glow:'rgba(255,190,240,.7)',gy:30,gR:30},
  katze:{iris:['#FFF1A0','#B8E36A','#5E9B4A'],R:52,pupil:'slit',pw:8,ph:40,glow:'rgba(255,255,200,.55)',gy:32,gR:26},
  ziege:{iris:['#FFF0B0','#F7B84B','#D9853A'],R:52,pupil:'bar',pw:58,ph:16,glow:'rgba(255,245,200,.6)',gy:34,gR:24},
  zyklop:{iris:['#D8FFE9','#56C6B6','#2F7F6F'],R:48,pupil:'round',pr:22,glow:'rgba(210,255,240,.6)',gy:30,gR:26},
  drei:{iris:['#FFD0E4','#FF8FB8','#D94257'],R:48,pupil:'round',pr:21,glow:'rgba(255,220,235,.6)',gy:30,gR:26},
  eule:{iris:['#FFF0A0','#FFB24A','#E07A2A'],R:54,pupil:'round',pr:27,glow:'rgba(255,240,190,.55)',gy:34,gR:24},
  teal:{iris:['#CFF7FF','#56C6B6','#3A8F9F'],R:46,pupil:'round',pr:21,glow:'rgba(210,255,250,.55)',gy:30,gR:24},
  braun:{iris:['#F6D2A8','#C98C5A','#8A5A44'],R:46,pupil:'round',pr:21,glow:'rgba(255,230,200,.6)',gy:30,gR:24},
  linse:{base:'#1E2340',iris:['#8FD3FF','#4B5E9C','#2A2E55'],R:52,pupil:'round',pr:24,pc:'#141830',ring:'rgba(20,20,40,.9)',rw:7,glow:'rgba(255,150,230,.55)',gy:24,gR:22,
    draw:(x,cx,cy)=>{x.strokeStyle='rgba(143,211,255,.55)';x.lineWidth=3;x.beginPath();x.arc(cx,cy,36,0,TAU);x.stroke()}},
  facette:{base:'#B04A8A',glow:'rgba(255,170,220,.8)',gy:28,gR:40,draw:(x)=>{x.strokeStyle='rgba(110,40,90,.55)';x.lineWidth=2.2;const s=9;
    for(let j=-1;j<18;j++)for(let i=-1;i<32;i++){const px=i*s*1.5,py=j*s*1.73+(i%2)*s*.87;x.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;x.lineTo(px+Math.cos(a)*s*.95,py+Math.sin(a)*s*.95)}x.closePath();x.stroke()}}},
  spiegel:{base:'#2A2540',glow:false}
};
const eyeMat=(c,key)=>c.m.tex('aug-'+key,eyeTex(key,TEX[key]||TEX.sig),{gloss:1.35,rim:.3,rimColor:'#d7c8ff'});

/* ---------------------------------------------------------------------
   Augen-Bausteine
   --------------------------------------------------------------------- */
const hl=(par,c,x,y,z,r,sc)=>{const h=P(par,G.s(r),c.m.flat('#ffffff'),[x,y,z],null,sc||[1,1.12,.32]);h.castShadow=false;return h};
function blink(c,e,off,per,amt){per=per||4.8;amt=amt??.9;c.an(t=>{const ph=(t+off)%per,b=per-.3;const k=ph>b?Math.sin((ph-b)/.3*PI):0;e.scale.y=1-amt*k})}
/* Das Signatur-Auge: glänzendes dunkles Oval mit weissen Lichtpunkten */
function eyeBall(par,c,r,o){o=o||{};const w=o.w??.8,h=o.h??1.06,d=o.d??.56;
  const e=grp(par,[o.x||0,o.y||0,o.z??-d*r*.28]);if(o.roll)e.rotation.z=o.roll;
  const ball=P(e,G.s(r),o.mat||eyeMat(c,o.tex||'sig'),null,null,[w,h,d]);
  const sz=(px,py)=>d*r*Math.sqrt(Math.max(0,1-(px/(w*r))**2-(py/(h*r))**2));
  if(o.hl!==false){const k=Math.min(1.1,w/.8)*(o.hls||1);
    const a=[.34*w*r,.38*h*r];hl(e,c,a[0],a[1],sz(a[0],a[1])*.96,r*.27*k);
    if(o.hl2!==false){const b=[-.3*w*r,-.42*h*r];hl(e,c,b[0],b[1],sz(b[0],b[1])*.96,r*.12*k)}
    if(o.hl3){const q=[.02*w*r,.56*h*r];hl(e,c,q[0],q[1],sz(q[0],q[1])*.96,r*.08*k)}}
  if(o.blink!==false)blink(c,e,o.bo||0,o.per,o.amt);
  e.userData.ball=ball;return e}
/* Standard-Augenpaar auf der Fläche */
function pairEyes(g,c,F,o){o=o||{};const u=F.u;const out=[];both(s=>{const q=F.mount(s*u*(o.sp??.38),F.Y+(o.dy||0)*u,{k:o.k});out.push(eyeBall(q,c,u*(o.r??.2),Object.assign({},o.eye||{},{roll:(o.eye&&o.eye.roll||0)*s})))});return out}

/* =====================================================================
   ORGANISCH
   ===================================================================== */
A('zwei','Zwei Augen','org',(g,c)=>{const F=face(g,c);pairEyes(g,c,F)});

A('kuller','Riesige Kulleraugen','org',(g,c)=>{const F=face(g,c),u=F.u;
  both(s=>{const q=F.mount(s*u*.4,F.Y,{k:.8});eyeBall(q,c,u*.26,{tex:'kuller',w:.84,h:1.04,hl3:true,hls:1.05})})});

A('muede','Müde Augen','org',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const q=F.mount(s*u*.37,F.Y);const lidM=F.skinOr(s*u*.37,F.Y);const r=u*.18;
    eyeBall(q,c,r,{blink:false,z:-r*.16,w:.84,h:1.0});
    const lid=grp(q,[0,0,-r*.16]);lid.rotation.z=-s*.16;
    const lg=grp(lid,[0,0,0]);P(lg,G.hs(r),lidM,null,null,[.87,1.04,.6]);
    P(lg,G.to(r*.87,r*.085,PI),m.c(PAL.ink,{gloss:.5}),[0,0,0],[PI/2,0,0],[1,.6/.87,1]);
    both(k=>P(lg,G.s(r*.085),m.c(PAL.ink,{gloss:.5}),[k*r*.87,0,0]));
    c.an(t=>{const ph=(t*.7+.2)%5;const k=ph>4.2?Math.sin((ph-4.2)/.8*PI):0;lg.rotation.x=.55+k*.85})})});

A('wackel','Wackelaugen','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const R=u*(s<0?.2:.235);const q=F.mount(s*u*.36,F.Y+(s<0?0:u*.02),{k:.8,lift:.02});
    P(q,disc(R,R*.28),m.white(),[0,0,0]);
    const pu=P(q,G.s(R*.5),eyeMat(c,'sig'),[0,-R*.38,R*.13],null,[1,1,.3]);
    P(q,G.to(R*.93,R*.07),m.c('#EEF4FF',{gloss:1.3,rim:.8,rimColor:'#C6A9FF'}),[0,0,R*.14]);
    hl(q,c,R*.46,R*.46,R*.22,R*.1,[1,1.6,.3]);hl(q,c,R*.62,R*.18,R*.22,R*.05);
    c.an(t=>{const a=Math.sin(t*4.2+s*1.7)*1.1+Math.sin(t*9.3+s)*.25;pu.position.x=Math.sin(a)*R*.4;pu.position.y=-Math.cos(a)*R*.4})})});

A('katzen','Katzenaugen','tier',(g,c)=>{const F=face(g,c);pairEyes(g,c,F,{r:.2,sp:.38,eye:{tex:'katze',w:.9,h:.98,roll:.22,bo:.4}})});

A('ziege','Ziegenaugen','tier',(g,c)=>{const F=face(g,c);const es=pairEyes(g,c,F,{r:.19,sp:.38,eye:{tex:'ziege',w:.96,h:.9,roll:-.12,bo:.7}});
  es.forEach((e,i)=>c.an(t=>{e.userData.ball.rotation.y=Math.sin(t*.6)*.22}))});

A('knopf','Knopfaugen','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const R=u*.22,q=F.mount(s*u*.37,F.Y,{k:.8,lift:.02});const bm=m.gloss(s<0?PAL.plum:PAL.berry);
    P(q,latheZ([[0,R*.05],[R*.62,R*.02],[R*.78,R*.14],[R*.97,R*.13],[R,0],[R*.94,-R*.12],[0,-R*.12]]),bm);
    const hole=[];range(4,(t,i)=>{const a=i/4*TAU+PI/4;hole.push([Math.cos(a)*R*.26,Math.sin(a)*R*.26]);P(q,G.s(R*.09),m.c(PAL.ink),[hole[i][0],hole[i][1],R*.035],null,[1,1,.4])});
    const th=m.c(PAL.cream,{rim:.2});[[0,2],[1,3]].forEach(([a,b])=>P(q,G.ca(R*.05,R*.52),th,[0,0,R*.09],[0,0,Math.atan2(hole[b][1]-hole[a][1],hole[b][0]-hole[a][0])-PI/2]));
    hl(q,c,R*.52,R*.5,R*.13,R*.1)})});

A('leucht','Leuchtaugen','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const r=u*.19,q=F.mount(s*u*.37,F.Y,{lift:.01});
    P(q,G.s(r*1.12),m.black(),[0,0,-r*.3],null,[.9,1.08,.45]);
    const e=grp(q,[0,0,0]);P(e,G.s(r*.8),m.glow('#5FF3FF',2.2),[0,0,0],null,[.84,1.06,.36]);
    P(e,G.s(r*.3),m.glow('#E8FFFF',2),[0,r*.12,r*.2],null,[1,1.1,.3]);
    const halo=P(q,G.s(r*1.1),m.c('#8FF7FF',{opacity:.3}),[0,0,0],null,[.9,1.1,.3]);halo.userData.noOutline=true;halo.castShadow=false;
    blink(c,e,.3);c.an(t=>{const p=1+Math.sin(t*3.2)*.08;halo.scale.set(.9*p,1.1*p,.3)})})});

A('scanner','Rote Scanner-Augen','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const r=u*.19,q=F.mount(s*u*.37,F.Y,{lift:.02});
    P(q,G.s(r),m.c(PAL.slate,{gloss:.8}),[0,0,-r*.22],null,[1.05,.86,.5]);
    P(q,G.to(r*.86,r*.1),m.steel(),[0,0,r*.1],null,[1.12,.88,1]);
    P(q,G.s(r*.82),m.black(),[0,0,r*.02],null,[1.1,.84,.34]);
    const dot=P(q,G.s(r*.26),m.glow('#FF4A5E',2.6),[0,0,r*.28],null,[1,1,.4]);
    const gl=P(q,G.s(r*.4),m.c('#FF6A7A',{opacity:.35}),[0,0,r*.25],null,[1,1,.3]);gl.userData.noOutline=true;
    hl(q,c,r*.45,r*.38,r*.3,r*.1);
    c.an(t=>{const x=Math.sin(t*1.8)*r*.52;dot.position.x=x;gl.position.x=x})})});

A('drittes','Ein Riesenauge','org',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const r=u*.34;
  const q=F.mount(0,F.Y+u*.04,{k:.7});const lidM=F.skinOr(0,F.Y);
  const e=eyeBall(q,c,r,{tex:'zyklop',w:.9,h:.96,hl3:true,z:-r*.2,bo:.5});
  P(q,G.to(r*.93,r*.12),lidM,[0,0,-r*.1],null,[.97,1.02,1]);
  range(3,(t,i)=>{const a=PI/2+(t-.5)*1.1;const x0=Math.cos(a)*r*.95,y0=Math.sin(a)*r*.98;const lash=grp(q,[x0,y0,-r*.02],[0,0,a-PI/2]);
    P(lash,G.tu([[0,0,0],[0,r*.16,r*.04],[(t-.5)*r*.12,r*.26,r*.02]],r*.06,r*.025),m.black());P(lash,G.s(r*.028),m.black(),[(t-.5)*r*.12,r*.26,r*.02])})});

A('drei','Drei Augen','org',(g,c)=>{const F=face(g,c),u=F.u;pairEyes(g,c,F,{r:.17,sp:.37,dy:-.04});
  const cy=F.clearY(0,Math.min(F.Y+u*.4,F.H.top-u*.24),F.Y+u*.24),y3=cy??F.Y+u*.4;const q=cy!=null?F.mount(0,y3,{k:.9}):F.topMount(0,F.F*.3,new V3(0,.45,1),.1);
  eyeBall(q,c,u*.14,{tex:'drei',w:.8,h:1.06,bo:2.1,per:3.9,z:-u*.03});
  P(q,G.to(u*.155,u*.038),F.skinOr(0,y3),[0,0,-u*.015],null,[.8,1.05,1])});

A('augenwolke','Augenwolke','org',(g,c)=>{const F=face(g,c),u=F.u;
  const L=[[0,.04,.15,'sig'],[-.36,.02,.13,'sig'],[.37,.05,.14,'teal'],[-.18,.3,.1,'sig'],[.2,.31,.11,'sig'],[-.21,-.24,.085,'drei'],[.21,-.22,.09,'sig'],[-.52,.28,.07,'sig'],[.54,.27,.075,'braun'],[0,.46,.07,'sig'],[-.5,-.12,.06,'sig']];
  L.forEach(([x,y,r,tx],i)=>{const q=F.mount(x*u,F.Y+y*u,{k:.95});const per=3.6+(i%4)*.55;let bo=(i*1.37)%3.3;if((1.3+bo)%per>per-.45)bo+=.6;const e=eyeBall(q,c,r*u,{tex:tx,hl2:r>.09,bo,per});
    c.an(t=>{e.rotation.z=Math.sin(t*.9+i)*.12})})});

A('wimpern','Wimpernaugen','org',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const r=u*.19,q=F.mount(s*u*.37,F.Y);const e=eyeBall(q,c,r,{tex:'braun',w:.82,h:1.04,bo:.6});
    range(3,(t,i)=>{const a=PI/2-s*(.35+t*.75);const x0=Math.cos(a)*r*.8,y0=Math.sin(a)*r*1.02;const L=r*(.62-t*.12);
      const lash=grp(e,[x0,y0,r*.08],[0,0,a-PI/2]);
      P(lash,G.tu([[0,-r*.06,0],[0,L*.55,r*.03],[-s*L*.4,L*.95,0]],r*.11,r*.05),m.black());P(lash,G.s(r*.055),m.black(),[-s*L*.4,L*.95,0])})})});

A('geschlossen','Geschlossene Augen','org',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const im=m.c(PAL.ink,{gloss:.5});
  both(s=>{const R=u*.15,t=u*.05,q=F.mount(s*u*.37,F.Y-u*.02,{lift:-.01});const a=grp(q,[0,0,0]);
    const arc=PI*.74,a0=PI+(PI-arc)/2;P(a,G.to(R,t,arc),im,[0,R*.4,0],[0,0,a0]);
    both(k=>{const an=a0+(k<0?0:arc);P(a,G.s(t),im,[Math.cos(an)*R,R*.4+Math.sin(an)*R,0])});
    c.an(tt=>{const b=1+Math.sin(tt*1.4)*.05;a.scale.set(b,1/b,1)})})});

/* =====================================================================
   TIERISCH
   ===================================================================== */
A('stiel','Stielaugen','tier',(g,c)=>{const F=face(g,c),u=F.u;
  both(s=>{const bx=s*u*.3,bz=u*.12;const by=F.top(bx,bz)-u*.05;const st=grp(g,[bx,by,bz]);const sm=F.skinOr(0,F.Y);
    const tip=[s*u*.2,u*.72,u*.22];
    P(st,G.tu([[0,0,0],[s*u*.05,u*.3,u*.02],[s*u*.14,u*.56,u*.12],tip],u*.085,u*.06),sm);
    const hd=grp(st,tip);P(hd,G.s(u*.17),sm,null,null,[1,1,.95]);
    const e=eyeBall(hd,c,u*.13,{z:u*.1,bo:s>0?0:.35,w:.82,h:1.02});
    c.an(t=>{st.rotation.z=Math.sin(t*1.4+s)*.14;st.rotation.x=Math.sin(t*1.05+s*2)*.1;hd.rotation.y=Math.sin(t*.8+s)*.3})})});

A('facetten','Facettenaugen','tier',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const r=u*.29,q=F.mount(s*u*.44,F.Y+u*.05,{k:1});
    P(q,G.to(r*.86,r*.12),m.c(PAL.plum,{gloss:.6}),[0,0,-r*.1],null,[.92,1.08,1]);
    P(q,G.s(r),eyeMat(c,'facette'),[0,0,-r*.12],null,[.9,1.06,.66]);
    const sz=(px,py)=>.66*r*Math.sqrt(Math.max(0,1-(px/(.9*r))**2-(py/(1.06*r))**2))-r*.12;
    hl(q,c,r*.3,r*.4,sz(r*.3,r*.4),r*.2);hl(q,c,-r*.28,-r*.44,sz(-r*.28,-r*.44),r*.09)})});

A('spinne','Acht Spinnenaugen','tier',(g,c)=>{const F=face(g,c),u=F.u;
  const L=[[.17,0,.15],[.43,.07,.095],[.2,.29,.07],[.46,.3,.055]];
  L.forEach(([x,y,r],i)=>both(s=>{const q=F.mount(s*x*u,F.Y+y*u,{k:.95});eyeBall(q,c,r*u,{w:.95,h:.95,d:.62,hl2:i<2,bo:i*.2,per:5.4})}))});

A('fuehler','Schneckenfühler','tier',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const sm=m.c('#D9B37A',{gloss:1,rim:.8,rimColor:'#fff3d0'});
  both(s=>{const bx=s*u*.22,bz=u*.28;const f=grp(g,[bx,F.top(bx,bz)-u*.06,bz]);const tip=[s*u*.28,u*.8,u*.3];
    const stalk=grp(f,[0,0,0]);P(stalk,G.tu([[0,0,0],[s*u*.06,u*.35,u*.08],[s*u*.18,u*.62,u*.22],tip],u*.075,u*.045),sm);
    const hd=grp(stalk,tip);P(hd,G.s(u*.1),sm);eyeBall(hd,c,u*.085,{z:u*.05,w:.9,h:.95,hl2:false,bo:s>0?.1:.5});
    c.an(t=>{stalk.rotation.z=Math.sin(t*1.3+s*1.2)*.16;stalk.rotation.x=Math.sin(t*.9+s)*.12;const k=1+Math.sin(t*.8+s)*.05;stalk.scale.set(1,k,1)})})});

A('krabbe','Krabbenstiele','tier',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const cm=m.gloss(PAL.coral),jm=m.gloss(PAL.strawberry);
  both(s=>{const cy=F.clearY(s*u*.26,Math.min(F.Y+u*.3,F.H.top-u*.22),F.Y+u*.14);let q=cy==null?null:F.mount(s*u*.26,cy,{k:.5});
    if(!q||F.headroom(q.position.clone().add(new V3(0,u*.12,u*.1)))<u*.6)q=F.topMount(s*u*.24,F.F*.3,new V3(0,.35,1),-.03);P(q,G.s(u*.1),jm,[0,0,0],null,[1,1,.6]);
    const st=grp(q,[0,0,u*.02],[.25,0,-s*.25]);
    P(st,G.ca(u*.06,u*.22),cm,[0,u*.14,0]);P(st,G.to(u*.065,u*.022),jm,[0,u*.28,0],[PI/2,0,0]);
    const up=grp(st,[0,u*.3,0]);P(up,G.ca(u*.05,u*.16),cm,[0,u*.1,0]);
    const hd=grp(up,[0,u*.26,0],[-.25,s*.3,0]);P(hd,G.s(u*.12),m.white(),[0,0,0]);eyeBall(hd,c,u*.1,{z:u*.105,w:.9,h:.95,hl2:false,bo:.2});
    c.an(t=>{st.rotation.z=-s*.25+Math.sin(t*2.1+s*1.3)*.14;up.rotation.x=Math.sin(t*1.6+s)*.14})})});

A('dreh','Drehaugen','tier',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const tm=m.gloss(PAL.grass),rm=m.c(PAL.leaf,{gloss:.6});
  both(s=>{const q=F.mount(s*u*.46,F.Y+u*.04,{k:1});const t0=grp(q,[0,0,-u*.05]);
    P(t0,latheZ([[0,-u*.1],[u*.2,-u*.1],[u*.22,0],[u*.2,u*.12],[u*.14,u*.21],[u*.08,u*.25],[0,u*.26]]),tm);
    P(t0,G.to(u*.2,u*.022),rm,[0,0,u*.07]);P(t0,G.to(u*.155,u*.02),rm,[0,0,u*.16]);
    P(t0,G.to(u*.085,u*.026),m.c(PAL.honey,{gloss:.8}),[0,0,u*.24]);
    P(t0,G.s(u*.075),m.white(),[0,0,u*.235],null,[1,1,.6]);eyeBall(t0,c,u*.06,{z:u*.26,w:1,h:1,d:.6,hl2:false,blink:false});
    c.an(t=>{t0.rotation.y=Math.sin(t*(s>0?1.1:.63)+s*2)*.55;t0.rotation.x=Math.sin(t*(s>0?.7:1.3)+s)*.35})})});

A('eule','Eulenaugen','tier',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  const disk=(()=>{const p=[];const n=12;for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU;const r=i%2?1:.88;p.push([Math.cos(a)*r,Math.sin(a)*r])}return sshp(p)})();
  both(s=>{const r=u*.21,q=F.mount(s*u*.39,F.Y,{k:.9});
    P(q,G.puff(disk,u*.04,u*.02),m.plush(PAL.cream),[0,0,-u*.02],[0,0,s*.2],r*1.45);
    P(q,G.to(r*1.02,r*.1),m.c(PAL.choc,{gloss:.4}),[0,0,u*.01]);
    eyeBall(q,c,r,{tex:'eule',w:.96,h:.96,z:-r*.08,bo:.2,per:5.5})})});

A('tentakel','Tentakelbart','tier',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;pairEyes(g,c,F,{r:.17,sp:.36,dy:.1,eye:{tex:'teal'}});
  const tm=m.gloss(PAL.grape),sm=m.c(PAL.lilac,{rim:.2});
  [[-.34,.44,-1],[-.17,.54,-1],[0,.6,1],[.17,.54,1],[.34,.44,1]].forEach(([x,Lk,sd],i)=>{
    const y=F.Y-u*(.3+.06*(1-Math.abs(x)*2.5));const q=F.mount(x*u,y,{k:.6,lift:-.05});const L=u*Lk;
    const tent=grp(q,[0,0,0],[0,0,-x*1.1]);
    const pts=[[0,u*.03,-u*.03],[0,-L*.3,u*.07],[sd*L*.07,-L*.62,u*.09],[sd*L*.24,-L*.86,u*.06],[sd*L*.44,-L*.84,u*.02],[sd*L*.5,-L*.64,0]];
    P(tent,G.tu(pts,u*.078,u*.028),tm);P(tent,G.s(u*.03),tm,pts[5]);
    [[1,.034],[2,.028],[3,.022]].forEach(([j,r])=>{const p=pts[j];P(tent,G.s(u*r),sm,[p[0],p[1],p[2]+u*(.09-j*.018)],null,[1,1,.45])});
    c.an(tt=>{tent.rotation.z=-x*1.1+Math.sin(tt*1.5+i*.9)*.12;tent.rotation.x=Math.sin(tt*1.1+i*.6)*.1})})});

/* =====================================================================
   MASCHINELL
   ===================================================================== */
/* Glubsch-Linse: dunkles Glas mit Blendenring und Lichtpunkten */
function lensGlass(par,c,r,z){const e=grp(par,[0,0,z||0]);P(e,G.s(r),eyeMat(c,'linse'),null,null,[1,1,.5]);
  hl(e,c,r*.34,r*.36,r*.36,r*.2);hl(e,c,-r*.3,-r*.34,r*.37,r*.09);hl(e,c,r*.02,r*.52,r*.43,r*.06);return e}

A('kamera','Kameralinse','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const q=F.mount(0,F.Y,{k:.7,lift:-.02});
  P(q,latheZ([[0,-u*.08],[u*.38,-u*.08],[u*.4,0],[u*.39,u*.1],[u*.34,u*.14],[u*.32,u*.2],[u*.27,u*.23],[0,u*.23]]),m.gloss(PAL.mint));
  P(q,G.to(u*.3,u*.04),m.gloss(PAL.honey),[0,0,u*.2]);
  P(q,G.to(u*.36,u*.025),m.c(PAL.teal,{gloss:.6}),[0,0,u*.1]);
  const ln=lensGlass(q,c,u*.25,u*.21);
  const nub=P(q,G.bx(u*.16,u*.12,u*.1,u*.04),m.gloss(PAL.mint),[u*.3,u*.28,u*.02]);
  const rec=P(q,G.s(u*.045),m.glow('#FF4A5E',2.4),[u*.3,u*.28,u*.08]);
  c.an(t=>{rec.visible=(t%1.4)<.9;const f=1+Math.sin(t*.9)*.04;ln.scale.set(f,f,1)})});

A('objektiv','Spiegelreflex-Objektiv','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  /* links: zugekniffenes Auge wie beim Fotografieren */
  {const q=F.mount(-u*.37,F.Y,{lift:-.005});const im=m.c(PAL.ink,{gloss:.5});const R=u*.12,t=u*.045;
    P(q,G.to(R,t,PI*.7),im,[0,-R*.55,0],[0,0,PI*.15]);both(k=>{const a=k<0?PI*.85:PI*.15;P(q,G.s(t),im,[Math.cos(a)*R,-R*.55+Math.sin(a)*R,0])})}
  const q=F.mount(u*.3,F.Y,{k:.4,lift:-.02});const z=grp(q,[0,0,0]);
  P(q,latheZ([[0,-u*.05],[u*.31,-u*.05],[u*.33,u*.02],[u*.33,u*.14],[0,u*.14]]),m.black());
  P(q,G.to(u*.33,u*.035),m.c(PAL.cherry,{gloss:.8}),[0,0,u*.15]);
  P(z,latheZ([[0,u*.12],[u*.3,u*.12],[u*.31,u*.2],[u*.3,u*.36],[u*.34,u*.4],[u*.34,u*.48],[u*.3,u*.5],[0,u*.5]]),m.black());
  range(3,(t,i)=>P(z,G.to(u*.31,u*.028),m.rubber(),[0,0,u*(.22+i*.05)]));
  lensGlass(z,c,u*.26,u*.47);
  c.an(t=>{z.position.z=u*(.04+.04*Math.sin(t*.8))})});

A('webcam','Webcam','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;pairEyes(g,c,F,{r:.17,dy:-.04});
  const zf=F.F*.55,ty=F.top(0,zf);const w=grp(g,[0,ty+u*.12,zf+u*.03],[.18,0,0]);
  P(w,G.bx(u*.62,u*.24,u*.24,u*.1),m.gloss(PAL.ivory),[0,0,0]);
  P(w,G.bx(u*.3,u*.08,u*.3,u*.04),m.gloss(PAL.slate),[0,-u*.15,-u*.02]);
  P(w,G.to(u*.09,u*.025),m.c(PAL.ink,{gloss:.6}),[0,0,u*.12]);
  lensGlass(w,c,u*.085,u*.12);
  const led=P(w,G.s(u*.03),m.glow('#5CFF8A',2.4),[u*.2,u*.03,u*.12]);
  c.an(t=>{led.visible=(t%2)<1.5})});

A('kuppel','Überwachungskuppel','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;pairEyes(g,c,F,{r:.14,dy:-.08,sp:.36});
  const cy=F.clearY(0,Math.min(F.Y+u*.44,F.H.top-u*.3),F.Y+u*.26);const q=cy!=null?F.mount(0,cy,{k:1,lift:-.02}):F.topMount(0,F.F*.25,new V3(0,1,.5),.02);q.scale.setScalar(.85);
  P(q,latheZ([[0,-u*.02],[u*.28,-u*.02],[u*.31,u*.02],[u*.3,u*.07],[0,u*.07]]),m.white());
  P(q,G.to(u*.235,u*.03),m.gloss(PAL.lilac),[0,0,u*.07]);
  const cam=grp(q,[0,0,u*.07]);P(cam,G.s(u*.15),m.black(),[0,0,0],null,[1,1,.9]);
  P(cam,G.to(u*.065,u*.02),m.steel(),[0,0,u*.13]);const lens=P(cam,G.s(u*.05),m.glow('#FF4A5E',2.2),[0,0,u*.12],null,[1,1,.6]);
  P(q,G.hs(u*.22),m.glass('#6E5A8A'),[0,0,u*.07],[PI/2,0,0]);
  c.an(t=>{cam.rotation.y=Math.sin(t*.55)*.75;cam.rotation.x=.12+Math.sin(t*.35)*.12;lens.visible=(t%1.6)<1.2})});

A('visier','Laser-Visier','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const n=19;const R=F.ring(F.Y,-1.3,1.3,n);
  const pts=R.pts.map((p,i)=>p.clone().addScaledVector(R.nrm[i],u*.045));
  P(g,sweep(pts,R.nrm,u*.07,u*.17,.5),m.black());
  both(s=>{const i=s<0?1:n-2;P(g,G.s(u*.075),m.gloss(PAL.lilac),pts[i].clone().addScaledVector(R.nrm[i],u*.05).toArray())});
  const front=pts.map((p,i)=>p.clone().addScaledVector(R.nrm[i],u*.07));
  const dot=P(g,G.s(u*.07),m.glow('#FF4A5E',2.6),[0,0,0],null,[1.8,.9,.5]);
  const glow=P(g,G.s(u*.1),m.c('#FF8090',{opacity:.35}),[0,0,0],null,[2.6,1.2,.4]);glow.userData.noOutline=true;
  c.an(t=>{const k=(Math.sin(t*1.7)*.5+.5)*.72+.14;const f=k*(n-1),i=Math.min(n-2,Math.floor(f)),fr=f-i;const p=front[i].clone().lerp(front[i+1],fr);
    const nn=R.nrm[i].clone().lerp(R.nrm[i+1],fr);const yaw=Math.atan2(nn.x,nn.z);dot.position.copy(p);glow.position.copy(p);dot.rotation.y=yaw;glow.rotation.y=yaw})});

A('ledband','LED-Streifen','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const n=15;const R=F.ring(F.Y,-1.05,1.05,n);
  const pts=R.pts.map((p,i)=>p.clone().addScaledVector(R.nrm[i],u*.04));
  P(g,sweep(pts,R.nrm,u*.065,u*.14,.45),m.gloss(PAL.navy));
  const on=m.glow('#48FFB8',2.4),off=m.c('#2E6F66',{gloss:.8});
  const L=range(7,(t,i)=>{const k=2+i*((n-5)/6);const i0=Math.floor(k),fr=k-i0;const p=pts[i0].clone().lerp(pts[i0+1],fr),nn=R.nrm[i0].clone().lerp(R.nrm[i0+1],fr).normalize();
    return P(g,G.s(u*.055),off,p.addScaledVector(nn,u*.06).toArray(),null,[1,1,.55])});
  c.an(t=>{const k=Math.floor(t*7)%12;const pos=k<7?k:12-k;L.forEach((l,i)=>{const d=Math.abs(i-pos);l.material=d<1.5?on:off;const sc=d<.5?1.25:1;l.scale.set(sc,sc,.55*sc)})})});

A('fernglas','Fernglas','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const bm=m.gloss(PAL.teal),rm=m.c(PAL.honey,{gloss:.8});const ends=[];
  both(s=>{const q=F.mount(s*u*.34,F.Y,{k:.3,lift:-.03});
    P(q,latheZ([[0,-u*.02],[u*.13,-u*.02],[u*.15,u*.04],[u*.16,u*.18],[u*.2,u*.26],[u*.21,u*.46],[u*.19,u*.5],[0,u*.5]]),bm);
    P(q,G.to(u*.2,u*.035),rm,[0,0,u*.44]);P(q,G.to(u*.155,u*.03),m.rubber(),[0,0,u*.05]);
    lensGlass(q,c,u*.16,u*.47);ends.push(q)});
  g.updateMatrixWorld(true);const a=ends[0].localToWorld(new V3(u*.18,0,u*.3)),b=ends[1].localToWorld(new V3(-u*.18,0,u*.3));g.worldToLocal(a);g.worldToLocal(b);
  limbSeg(g,a.toArray(),b.toArray(),u*.06,m.steel());
  const mid=a.clone().lerp(b,.5);P(g,G.cy(u*.07,u*.07,u*.1),rm,[mid.x,mid.y+u*.08,mid.z],[0,0,PI/2])});

A('teleskop','Teleskopauge','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  {const q=F.mount(-u*.37,F.Y);eyeBall(q,c,u*.19,{bo:.3})}
  const q=F.mount(u*.34,F.Y,{k:.35,lift:-.04});const gm=m.gold(),cm=m.copper();
  P(q,latheZ([[0,-u*.02],[u*.2,-u*.02],[u*.22,u*.04],[u*.2,u*.26],[0,u*.26]]),cm);
  P(q,G.to(u*.205,u*.03),gm,[0,0,u*.24]);
  const s1=grp(q,[0,0,0]);P(s1,latheZ([[0,u*.1],[u*.16,u*.1],[u*.16,u*.36],[0,u*.36]]),gm);P(s1,G.to(u*.165,u*.028),cm,[0,0,u*.35]);
  const s2=grp(s1,[0,0,0]);P(s2,latheZ([[0,u*.2],[u*.12,u*.2],[u*.13,u*.44],[u*.155,u*.47],[u*.155,u*.52],[0,u*.52]]),cm);
  lensGlass(s2,c,u*.125,u*.51);
  c.an(t=>{const k=Math.sin(t*.7)*.5+.5;s1.position.z=u*.08*k;s2.position.z=u*.1*k})});

A('periskop','Periskop','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;pairEyes(g,c,F,{r:.16,dy:-.04});
  const ty=F.top(0,-u*.1);const pm=m.gloss(PAL.lemon),am=m.gloss(PAL.orange);const b=grp(g,[0,ty-u*.06,-u*.1]);
  P(b,G.cy(u*.2,u*.24,u*.1),am,[0,u*.02,0]);
  const rot=grp(b,[0,0,0]);P(rot,G.cy(u*.1,u*.1,u*.72),pm,[0,u*.42,0]);
  range(2,(t,i)=>P(rot,G.to(u*.11,u*.028),am,[0,u*(.3+i*.24),0],[PI/2,0,0]));
  const hd=grp(rot,[0,u*.86,0]);P(hd,G.bx(u*.3,u*.3,u*.42,u*.13),pm,[0,0,u*.06]);
  P(hd,G.to(u*.12,u*.03),am,[0,0,u*.27]);lensGlass(hd,c,u*.11,u*.26);
  c.an(t=>{rot.rotation.y=Math.sin(t*.45)*.9})});

A('radar','Radar-Auge','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;pairEyes(g,c,F,{r:.18,dy:-.03});
  const ty=F.top(0,0);const b=grp(g,[0,ty-u*.04,0]);P(b,G.cy(u*.14,u*.18,u*.08),m.gloss(PAL.lilac),[0,0,0]);
  P(b,G.cy(u*.045,u*.045,u*.32),m.steel(),[0,u*.18,0]);
  const d=grp(b,[0,u*.34,0]);const t=grp(d,[0,0,0],[-.75,0,0]);P(t,G.s(u*.07),m.gloss(PAL.lilac));
  const R=u*.36;P(t,G.la([[0,-u*.02],[R*.5,0],[R*.85,R*.18],[R,R*.42],[R*.96,R*.46],[R*.8,R*.26],[R*.45,R*.1],[0,R*.08]]),m.white(),[0,u*.02,0]);
  P(t,G.cy(u*.02,u*.02,u*.28),m.steel(),[0,u*.16,0]);P(t,G.s(u*.05),m.glow('#FF6A5E',2.2),[0,u*.31,0]);
  c.an(tt=>{d.rotation.y=tt*1.4})});

A('lidar','Lidar-Puck','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const r=u*.16,q=F.mount(s*u*.36,F.Y,{lift:.005});P(q,G.s(r*1.15),m.black(),[0,0,-r*.3],null,[1,1,.45]);
    const e=grp(q,[0,0,0]);P(e,G.s(r*.82),m.glow('#48FFD8',2.2),[0,0,0],null,[1,1,.4]);P(e,G.s(r*.22),m.flat('#ffffff'),[r*.22,r*.24,r*.2],null,[1,1,.3]);blink(c,e,.9)});
  const ty=F.top(0,0);const l=grp(g,[0,ty-u*.05,0]);
  P(l,G.cy(u*.3,u*.34,u*.1),m.gloss(PAL.slate),[0,u*.05,0]);
  const sp=grp(l,[0,u*.1,0]);P(sp,G.cy(u*.26,u*.28,u*.22),m.black(),[0,u*.11,0]);
  P(sp,G.to(u*.275,u*.035),m.glow('#48FFD8',1.8),[0,u*.12,0],[PI/2,0,0]);
  P(sp,G.bx(u*.14,u*.1,u*.06,u*.025),m.glow('#48FFD8',2.4),[0,u*.12,u*.27]);
  P(sp,G.cy(u*.2,u*.26,u*.07),m.gloss(PAL.ivory),[0,u*.255,0]);
  c.an(t=>{sp.rotation.y=t*4})});

A('antenne','Farbantenne','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;pairEyes(g,c,F,{r:.18,dy:-.04,eye:{roll:0}});
  const ty=F.top(0,-u*.15);const H0=[0,ty-u*.04,-u*.15];
  P(g,G.s(u*.09),m.gloss(PAL.lilac),H0,null,[1.2,.6,1.2]);
  const end=[0,F.Y+u*.62,Math.max(F.F+u*.42,F.frontMax(0,F.Y+u*.25,F.H.top)+u*.22)];
  const arm=grp(g,H0);const rel=p=>[p[0]-H0[0],p[1]-H0[1],p[2]-H0[2]];
  P(arm,G.tu([[0,0,0],rel([0,ty+u*.55,-u*.05]),rel([0,ty+u*.62,F.F*.6]),rel([0,end[1]+u*.2,end[2]]),rel([0,end[1]+u*.08,end[2]])],u*.035),m.steel());
  const bulb=grp(arm,rel([0,end[1]+u*.02,end[2]]));
  P(bulb,G.cy(u*.06,u*.075,u*.09),m.steel(),[0,u*.05,0]);
  const bm=m.glow('#FF9BAF',2.3);P(bulb,G.s(u*.14),bm,[0,-u*.08,0]);
  const halo=P(bulb,G.s(u*.21),m.c('#FFD7F0',{opacity:.28}),[0,-u*.08,0]);halo.userData.noOutline=true;
  c.an(t=>{bm.color.setHSL((t*.12)%1,.95,.62).multiplyScalar(1.3);arm.rotation.x=Math.sin(t*1.2)*.04;bulb.rotation.z=Math.sin(t*1.9)*.25;halo.scale.setScalar(1+Math.sin(t*3)*.1)})});

A('laser','Laserpointer','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const q=F.mount(s*u*.36,F.Y,{k:.3,lift:-.03});
    P(q,latheZ([[0,-u*.02],[u*.13,-u*.02],[u*.15,u*.04],[u*.12,u*.1],[u*.11,u*.24],[u*.13,u*.27],[u*.13,u*.31],[0,u*.31]]),m.steel());
    P(q,G.to(u*.12,u*.03),m.gloss(PAL.cherry),[0,0,u*.2]);
    P(q,G.s(u*.08),m.glow('#FF4A5E',2.6),[0,0,u*.31],null,[1,1,.5]);
    const beam=P(q,G.cy(u*.022,u*.03,u*.9),m.glow('#FF5A6A',2),[0,0,u*.76],[PI/2,0,0]);
    const gl=P(q,G.s(u*.13),m.c('#FF8090',{opacity:.3}),[0,0,u*.33],null,[1,1,.4]);gl.userData.noOutline=true;
    c.an(t=>{const on=Math.sin(t*2.6+s*.4)>-.6;beam.visible=on;gl.visible=on;beam.scale.y=on?.85+Math.sin(t*11+s)*.15:1})})});

/* Bildschirm auf der Fläche (Emoji, Barcode, QR): gebogene Platte */
function plate(g,c,F,w,h,d,mat,o){o=o||{};const u=F.u,y0=o.y??F.Y;const z0=F.zAt(0,y0);
  const geo=new THREE.RoundedBoxGeometry(w,h,d,4,Math.min(o.rad??u*.1,d/2-1e-3,h/2-1e-3));geo.translate(0,0,d/2-u*.03);
  const q=grp(g,[0,y0,z0]);const mesh=P(q,F.bend(geo,0,y0,z0),mat);return{q,z0,mesh,front:(ww,hh,mt,zOff)=>{const pg=new THREE.PlaneGeometry(ww,hh,12,4);pg.translate(0,0,d-u*.03+(zOff||u*.004));return P(q,F.bend(pg,0,y0,z0),mt)}}}
const emoTex=(i)=>ctex('aug-emo'+i,256,100,(x,w,h)=>{x.fillStyle='#232A4A';x.fillRect(0,0,w,h);
  x.strokeStyle=x.fillStyle='#7FF6E6';x.lineWidth=16;x.lineCap='round';x.lineJoin='round';const L=78,R=178,cy=50;
  x.globalAlpha=.07;for(let j=0;j<h;j+=5)x.fillRect(0,j,w,1);x.globalAlpha=1;
  const each=f=>{f(L,-1);f(R,1)};
  if(i===0)each(cx=>{x.beginPath();x.arc(cx,cy+16,28,PI*1.12,PI*1.88);x.stroke()});
  else if(i===1)each(cx=>{x.beginPath();x.ellipse(cx,cy,19,27,0,0,TAU);x.fill();x.fillStyle='#232A4A';x.beginPath();x.arc(cx+6,cy-9,6,0,TAU);x.fill();x.fillStyle='#7FF6E6'});
  else if(i===2)each((cx,s)=>{x.beginPath();x.moveTo(cx-s*18,cy-22);x.lineTo(cx+s*16,cy);x.lineTo(cx-s*18,cy+22);x.stroke()});
  else if(i===3)each(cx=>{x.beginPath();x.moveTo(cx-24,cy);x.lineTo(cx+24,cy);x.stroke()});
  else each(cx=>{x.fillStyle='#FF8FB8';const s=20;x.beginPath();x.moveTo(cx,cy+s*1.1);x.bezierCurveTo(cx-s*1.9,cy-s*.1,cx-s*.9,cy-s*1.5,cx,cy-s*.45);x.bezierCurveTo(cx+s*.9,cy-s*1.5,cx+s*1.9,cy-s*.1,cx,cy+s*1.1);x.fill()})});

A('emoji','Emoji-Bildschirm','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const w=u*1.3,h=u*.58;
  const pl=plate(g,c,F,w,h,u*.14,m.gloss(PAL.lilac),{rad:u*.12});
  const mats=range(5,(t,i)=>m.tex('aug-emo'+i,emoTex(i),{emissive:'#ffffff',emissiveMap:emoTex(i),rim:0}));
  const sc=pl.front(w*.84,h*.72,mats[0]);
  both(s=>P(pl.q,G.s(u*.035),m.gloss(PAL.grape),[s*w*.46,-h*.36,u*.14+F.zAt(s*w*.46,F.Y-h*.36)-pl.z0]));
  const seq=[0,1,0,3,0,2,4,1];c.an(t=>{sc.material=mats[seq[Math.floor(t/1.3)%seq.length]]})});

A('barcode','Barcode-Scanner','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const w=u*1.25,h=u*.42;
  const pl=plate(g,c,F,w,h,u*.16,m.gloss(PAL.honey),{rad:u*.12});
  const win=pl.front(w*.8,h*.52,m.c('#2A2540',{gloss:1}));
  const bars=ctex('aug-bars',128,32,(x,W,Hh)=>{x.fillStyle='#FFFDF7';x.fillRect(0,0,W,Hh);x.fillStyle='#3B3450';const r=srand(11);let px=6;while(px<W-6){const bw=1+Math.floor(r()*4);x.fillRect(px,4,bw*1.5,Hh-8);px+=bw*1.5+1+Math.floor(r()*3)}});
  const laser=pl.front(w*.74,u*.022,m.glow('#FF4A5E',2.6),u*.012);
  both(s=>P(pl.q,G.s(u*.04),m.glow(s<0?'#5CFF8A':'#FFE27A',2),[s*w*.43,h*.36,u*.13+F.zAt(s*w*.43,F.Y+h*.36)-pl.z0]));
  const st=P(g,G.bx(u*.4,u*.1,u*.02,u*.01),m.tex('aug-bars',bars,{rim:0}),[0,0,0]);
  const sp=F.at(0,F.Y-h*.5-u*.1);st.position.copy(sp.p).addScaledVector(sp.n,u*.012);st.quaternion.setFromUnitVectors(ZV,sp.n);st.rotation.z+=.05;
  c.an(t=>{laser.position.y=Math.sin(t*4)*h*.2})});

A('qr','QR-Code-Gesicht','masch',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const w=u*.98;
  const tex=ctex('aug-qr',210,210,(x,W,Hh)=>{x.fillStyle='#FFFDF7';x.fillRect(0,0,W,Hh);const n=21,s=W/n;const r=srand(42);x.fillStyle='#3B3450';
    const fin=(a,b)=>(a<8&&b<8)||(a>12&&b<8)||(a<8&&b>12);
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){if(fin(i,j))continue;if(r()>.52){x.beginPath();x.arc(i*s+s/2,j*s+s/2,s*.46,0,TAU);x.fill()}}
    const rq=(px,py,sz,rad)=>{x.beginPath();x.moveTo(px+rad,py);x.arcTo(px+sz,py,px+sz,py+sz,rad);x.arcTo(px+sz,py+sz,px,py+sz,rad);x.arcTo(px,py+sz,px,py,rad);x.arcTo(px,py,px+sz,py,rad);x.fill()};
    [[0,0],[14,0],[0,14]].forEach(([a,b])=>{x.fillStyle='#3B3450';rq(a*s,b*s,7*s,s*1.6);x.fillStyle='#FFFDF7';rq((a+1)*s,(b+1)*s,5*s,s*1.1);x.fillStyle=a===14?'#FF8FB8':'#56C6B6';rq((a+2)*s,(b+2)*s,3*s,s*.9)})});
  const pl=plate(g,c,F,w,w,u*.12,m.gloss(PAL.mint),{rad:u*.12,y:F.Y-u*.05});
  pl.front(w*.84,w*.84,m.tex('aug-qr',tex,{rim:0}));
  const sq=grp(pl.q,[0,0,0]);c.an(t=>{pl.q.rotation.z=Math.sin(t*1.1)*.03})});

/* =====================================================================
   OBJEKTE
   ===================================================================== */
A('sonnenbrille','Sonnenbrille','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const fm=m.gloss(PAL.strawberry),lm=m.c('#40365E',{gloss:1.4,rim:.9,rimColor:'#FF9EDB'});
  const y0=F.Y+u*.01,z0=F.zAt(0,y0);const q=grp(g,[0,y0,z0]);const lw=u*.5,lh=u*.36;
  const LS=[[-.5,.42],[.5,.46],[.52,-.05],[.3,-.5],[-.3,-.5],[-.52,-.05]];
  const lsh=(s,cx,kx,ky)=>sshp(LS.map(([a,b])=>[s*a*lw*kx+cx,b*lh*ky]));
  both(s=>{const cx=s*u*.36;const sh=lsh(s,cx,1.22,1.3);sh.holes.push(lsh(s,cx,.98,1.02));
    const fg=G.puff(sh,u*.05,u*.025);fg.translate(0,0,u*.07);P(q,F.bend(fg,0,y0,z0),fm);
    const lg=G.puff(lsh(s,cx,1.02,1.06),u*.02,u*.012);lg.translate(0,0,u*.06);P(q,F.bend(lg,0,y0,z0),lm);
    [[.18,.2,.05,.36],[.02,.08,.03,.22]].forEach(([dx,dy,ww,hh])=>{const b=P(q,G.bx(ww*u,hh*u,u*.01,u*.004),m.flat('#ffffff'),[cx+s*dx*u,dy*u,0],[0,0,-.6]);b.position.z=F.zAt(cx+s*dx*u,y0+dy*u)-z0+u*.085;b.castShadow=false});
    const R=F.ring(y0+u*.1,s*1.05,s*1.62,4);const p0=new V3(cx+s*lw*.62,u*.1,F.zAt(cx+s*lw*.62,y0+u*.1)-z0+u*.07);
    const pts=[p0.toArray(),...R.pts.slice(1).map((p,i)=>{const v=p.clone().addScaledVector(R.nrm[i+1],u*.035);return[v.x,v.y-y0,v.z-z0]})];
    P(q,G.tu(pts,u*.035,u*.03),fm)});
  const bx=u*.36-lw*.6;const bz=F.zAt(bx,y0+u*.1)-z0+u*.07;
  P(q,G.tu([[-bx,u*.1,bz],[0,u*.16,F.zAt(0,y0+u*.16)-z0+u*.09],[bx,u*.1,bz]],u*.04),fm)});

A('taucherbrille','Taucherbrille','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;pairEyes(g,c,F,{r:.17,sp:.33});
  const y0=F.Y,z0=F.zAt(0,y0);const q=grp(g,[0,y0,z0]);const W=u*1.28,Hh=u*.56;
  const MS=[[-.5,.5],[.5,.5],[.52,-.1],[.36,-.5],[.12,-.46],[0,-.3],[-.12,-.46],[-.36,-.5],[-.52,-.1]];const ms=(kx,ky,dy)=>sshp(MS.map(([a,b])=>[a*W*kx,b*Hh*ky+(dy||0)]));
  const outer=ms(1,1);outer.holes.push(ms(.8,.68,Hh*.02));const fg=G.puff(outer,u*.1,u*.04);fg.translate(0,0,u*.06);P(q,F.bend(fg,0,y0,z0),m.gloss(PAL.orange));
  const gg=new THREE.ShapeGeometry(ms(.86,.76,Hh*.02),Q(16));gg.translate(0,0,u*.15);P(q,F.bend(gg,0,y0,z0),m.glass('#CFF3FF'));
  both(s=>{const b=P(q,G.bx(u*.05,u*.2,u*.01,u*.005),m.flat('#ffffff'),[s*u*.2+u*.12,u*.06,0],[0,0,-.6]);b.position.z=F.zAt(s*u*.2+u*.12,y0+u*.06)-z0+u*.16;b.castShadow=false});
  const R=F.ring(y0+u*.04,1.02,TAU-1.02,17);P(g,sweep(R.pts.map((p,i)=>p.clone().addScaledVector(R.nrm[i],u*.03)),R.nrm,u*.035,u*.1,.5),m.gloss(PAL.teal));
  /* Schnorchel */
  const sx=-F.SX*1.02,sz=u*.1;const sn=grp(g,[sx,y0-u*.2,sz]);
  P(sn,G.tu([[u*.1,-u*.2,u*.2],[-u*.02,-u*.2,u*.1],[-u*.06,0,0],[-u*.06,u*.5,-u*.02],[-u*.04,u*.95,0]],u*.07),m.gloss(PAL.lemon));
  P(sn,G.cy(u*.085,u*.085,u*.1),m.gloss(PAL.orange),[-u*.04,u*.98,0]);P(sn,G.to(u*.08,u*.03),m.gloss(PAL.orange),[-u*.05,u*.35,-u*.01],[PI/2,0,0])});

A('monokel','Monokel','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  {const q=F.mount(-u*.37,F.Y);eyeBall(q,c,u*.17,{bo:.4});P(q,G.ca(u*.04,u*.2),m.c(PAL.choc,{gloss:.4}),[u*.02,u*.3,u*.02],[0,0,PI/2-.25])}
  const q=F.mount(u*.37,F.Y,{k:.6});eyeBall(q,c,u*.22,{bo:.4,hl3:true});
  P(q,G.to(u*.3,u*.045),m.gold(),[0,0,u*.12]);P(q,G.circ(u*.29),m.glass('#FFF6D8'),[0,0,u*.12]);
  hl(q,c,-u*.14,u*.16,u*.13,u*.03,[1,2.2,.3]);
  const a=[u*.26,-u*.2,u*.1];const pts=range(7,(t)=>[a[0]+u*(.1*t+.2*t*t),a[1]-u*(.9*t),a[2]-u*.18*t]);
  pts.forEach((p,i)=>P(q,G.s(u*.026),m.gold(),p));
  c.an(t=>{q.rotation.z=Math.sin(t*.9)*.02})});

A('lupe','Lupenauge','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  {const q=F.mount(-u*.37,F.Y);eyeBall(q,c,u*.18,{bo:.4})}
  const q=F.mount(u*.37,F.Y,{k:.5});eyeBall(q,c,u*.3,{bo:.4,hl3:true,w:.84,h:1.04});
  const lg=grp(q,[0,0,u*.3]);
  P(lg,G.to(u*.42,u*.06),m.gloss(PAL.navy),[0,0,0]);P(lg,G.circ(u*.4),m.glass('#E6F7FF'),[0,0,0]);
  hl(lg,c,-u*.2,u*.2,u*.02,u*.04,[1,2.4,.3]);
  const hd=grp(lg,[0,0,0],[0,0,-.55]);P(hd,G.cy(u*.07,u*.06,u*.12),m.gold(),[0,-u*.5,0]);P(hd,G.ca(u*.075,u*.42),m.wood(),[0,-u*.8,0]);P(hd,G.s(u*.085),m.gloss(PAL.navy),[0,-u*1.08,0]);
  c.an(t=>{lg.position.z=u*(.3+Math.sin(t*1.2)*.03);lg.rotation.z=Math.sin(t*.7)*.06})});

A('spiegel','Spiegelkugeln','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const r=u*.21,q=F.mount(s*u*.38,F.Y,{k:.9});
    P(q,G.to(r*.98,r*.13),m.gloss(PAL.lilac),[0,0,-r*.05],null,[.9,1.06,1]);
    const b=P(q,G.s(r),m.chrome(),[0,0,-r*.08],null,[.88,1.04,.72]);
    const st=P(q,G.star(r*.3,r*.1,4,r*.04),m.flat('#ffffff'),[r*.34,r*.4,r*.62]);st.castShadow=false;
    hl(q,c,-r*.3,-r*.38,r*.52,r*.08);
    c.an(t=>{const k=.75+Math.abs(Math.sin(t*1.7+s))*.4;st.scale.setScalar(k);st.rotation.z=t*.6;b.rotation.z=Math.sin(t*.5+s)*.4})})});

A('kristall','Kristallaugen','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const r=u*.2,q=F.mount(s*u*.38,F.Y,{k:.85,lift:.01});
    P(q,G.to(r*.98,r*.14),m.gold(),[0,0,0]);
    const gm=grp(q,[0,0,0]);const geo=G.la([[0,-r*.5],[r*.92,-r*.02],[r*.96,r*.04],[r*.68,r*.34],[0,r*.38]],8);geo.rotateX(PI/2);
    const fg=geo.toNonIndexed();fg.computeVertexNormals();P(gm,fg,m.c(s<0?'#8FEFFF':'#C6A9FF',{opacity:.86,rim:1.2,gloss:1.3}));P(gm,G.s(r*.4),m.glow(s<0?'#BFFBFF':'#E7D9FF',1.3),[0,0,-r*.1],null,[1,1,.5]);
    range(4,(t,i)=>{const a=i/4*TAU+PI/4;P(q,G.s(r*.12),m.gold(),[Math.cos(a)*r*.92,Math.sin(a)*r*.92,r*.12])});
    const sp=P(q,G.star(r*.36,r*.08,4,r*.03),m.flat('#ffffff'),[r*.35,r*.35,r*.42]);sp.castShadow=false;
    c.an(t=>{gm.rotation.z=t*.5+s;const k=Math.max(0,Math.sin(t*2.2+s*1.5));sp.scale.setScalar(.3+k*.9);sp.rotation.z=t})})});

A('herz','Herzaugen','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const q=F.mount(s*u*.38,F.Y,{k:.75,lift:.02});const h=grp(q,[0,0,0],[0,0,-s*.12]);const R=u*.2;
    P(h,G.heart(R,R*.42),m.gloss(PAL.strawberry),[0,0,0]);
    hl(h,c,-R*.45,R*.45,R*.38,R*.15,[1,1.4,.3]);hl(h,c,-R*.66,R*.12,R*.34,R*.06);
    c.an(t=>{const ph=(t*1.6)%1;const p=1+(ph<.15?Math.sin(ph/.15*PI)*.14:0)+(ph>.2&&ph<.32?Math.sin((ph-.2)/.12*PI)*.08:0);h.scale.set(p,p,p)})})});

A('spirale','Hypno-Spiralen','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  const tex=ctex('aug-spir',256,256,(x,w,h)=>{x.fillStyle='#FFFDF7';x.fillRect(0,0,w,h);x.strokeStyle='#8E6BD1';x.lineWidth=15;x.lineCap='round';x.beginPath();
    for(let a=.3;a<TAU*3.3;a+=.04){const r=a*6;x.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}x.stroke();x.fillStyle='#FF8FB8';x.beginPath();x.arc(w/2,h/2,9,0,TAU);x.fill()});
  const sm=m.tex('aug-spir',tex,{rim:0,emissive:'#ffffff',emissiveMap:tex,emissiveIntensity:.35});
  both(s=>{const R=u*.22,q=F.mount(s*u*.38,F.Y,{k:.85,lift:.01});
    P(q,disc(R,R*.3),m.gloss(PAL.grape),[0,0,0]);
    const d=P(q,G.circ(R*.86),sm,[0,0,R*.152]);
    hl(q,c,R*.55,R*.5,R*.17,R*.07);
    c.an(t=>{d.rotation.z=-s*t*3})})});

A('augenbinde','Augenbinde','ding',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const bm=m.plush(PAL.navy);
  const n=25,R=F.ring(F.Y,-PI*.93,PI*.93,n);const pts=R.pts.map((p,i)=>p.clone().addScaledVector(R.nrm[i],u*.035));
  P(g,sweep(pts,R.nrm,u*.05,u*.2,.4),bm);
  const k0=F.ring(F.Y,PI-.2,PI+.2,3);const kp=k0.pts[1].clone().addScaledVector(k0.nrm[1],u*.09);
  const knot=grp(g,kp.toArray(),[0,PI,0]);P(knot,G.s(u*.12),bm,null,null,[1.2,1,.8]);
  both(s=>{const tl=grp(knot,[s*u*.05,-u*.05,0],[0,0,s*.35]);const sh=sshp([[-.12,0],[.12,0],[.2,-.7],[0,-.55],[-.2,-.7]]);P(tl,G.puff(sh,u*.03,u*.015),bm,null,null,u*.7);
    c.an(t=>{tl.rotation.z=s*.35+Math.sin(t*1.8+s)*.08})});
  /* aufgestickte Schlafaugen */
  const st=m.c(PAL.lemon,{rim:.2});
  both(s=>{const a=Math.asin(Math.max(-.9,Math.min(.9,s*u*.36/F.SX)));const Rr=F.ring(F.Y,a-.01,a+.01,2);const p=Rr.pts[0].clone().addScaledVector(Rr.nrm[0],u*.085);
    const e=grp(g,p.toArray());e.quaternion.setFromUnitVectors(ZV,Rr.nrm[0]);e.scale.setScalar(1.5);
    P(e,G.to(u*.1,u*.028,PI*.8),st,[0,u*.03,0],[0,0,PI*1.1]);
    range(3,(t,i)=>{const an=PI*1.25+t*PI*.5;P(e,G.ca(u*.016,u*.05),st,[Math.cos(an)*u*.14,u*.03+Math.sin(an)*u*.14,0],[0,0,an-PI/2])})})});

/* =====================================================================
   PFLANZLICH
   ===================================================================== */
const petal=sshp([[0,-.05],[.42,.3],[.36,.8],[0,1],[-.36,.8],[-.42,.3]]);
A('blueten','Blütenaugen','pflanze',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const q=F.mount(s*u*.38,F.Y,{k:.85});const f=grp(q,[0,0,-u*.02]);const pm=m.plush(s<0?PAL.pink:PAL.blush);
    range(6,(t,i)=>{const a=i/6*TAU;P(f,G.puff(petal,u*.03,u*.015),pm,[Math.cos(a)*u*.07,Math.sin(a)*u*.07,-u*.01],[0,0,a-PI/2],u*.2)});
    P(q,G.s(u*.14),m.c(PAL.lemon,{rim:.3}),[0,0,0],null,[1,1,.4]);
    eyeBall(q,c,u*.1,{z:u*.03,w:.84,h:1.04,bo:s>0?.2:.5});
    c.an(t=>{f.rotation.z=Math.sin(t*.8+s)*.2})})});

A('knospen','Knospenaugen','pflanze',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const q=F.mount(s*u*.38,F.Y,{k:.85});const pm=m.plush(PAL.rose),sm=m.c(PAL.leaf,{rim:.5});
    range(5,(t,i)=>{const a=i/5*TAU+PI/2;P(q,G.puff(sshp([[0,0],[.4,.35],[0,1],[-.4,.35]]),u*.02,u*.01),sm,[0,0,-u*.03],[0,0,a+PI/5-PI/2],u*.3)});
    const L=range(5,(t,i)=>{const a=i/5*TAU+PI/2;const p=grp(q,[Math.cos(a)*u*.03,Math.sin(a)*u*.03,0],[0,0,a-PI/2]);P(p,G.puff(petal,u*.035,u*.016),pm,[0,0,0],null,u*.2);return p});
    P(q,G.s(u*.1),m.c(PAL.lemon,{rim:.3}),[0,0,0],null,[1,1,.5]);
    eyeBall(q,c,u*.085,{z:u*.035,w:.86,h:1.02,hl2:false,blink:false});
    c.an(t=>{const o=Math.min(1,Math.max(0,Math.sin(t*.6+s*.4)*.7+.75));L.forEach(p=>p.rotation.x=-(1-o)*1.25)})})});

A('pilzchen','Pilzaugen','pflanze',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const es=pairEyes(g,c,F,{r:.17,dy:-.05});
  both(s=>{const q=F.mount(s*u*.4,F.Y+u*.26,{k:.8});const p=grp(q,[0,0,-u*.02],[.35,0,-s*.25]);
    P(p,G.ca(u*.045,u*.1),m.c(PAL.cream,{rim:.3}),[0,u*.06,0]);
    const capG=G.la([[0,u*.1],[u*.12,u*.09],[u*.17,u*.03],[u*.18,-u*.01],[u*.14,-u*.02],[0,-u*.01]]);
    const cap=grp(p,[0,u*.15,0]);P(cap,capG,m.gloss(s<0?PAL.cherry:PAL.coral));
    range(3,(t,i)=>{const a=i/3*TAU+.4;P(cap,G.s(u*.03),m.white(),[Math.cos(a)*u*.1,u*.07,Math.sin(a)*u*.1],null,[1,.5,1])});P(cap,G.s(u*.03),m.white(),[0,u*.1,0],null,[1,.4,1]);
    c.an(t=>{p.rotation.z=-s*.25+Math.sin(t*1.3+s)*.08;cap.scale.set(1,1+Math.sin(t*2+s)*.04,1)})})});

A('tau','Tautropfen','pflanze',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;
  both(s=>{const q=F.mount(s*u*.38,F.Y,{k:.85,lift:.02});const r=u*.17;const d=grp(q,[0,-r*.2,0]);
    P(d,G.drop(r,r*1.1),m.c(PAL.aqua,{gloss:1.4,rim:1.1,rimColor:'#ffffff'}),[0,0,0],null,[1,1,.6]);
    const ey=grp(d,[0,-r*.08,r*.5]);P(ey,G.s(r*.5),eyeMat(c,'sig'),null,null,[.85,1.05,.3]);
    hl(d,c,r*.38,r*.28,r*.42,r*.18,[1,1.4,.3]);hl(d,c,-r*.2,-r*.5,r*.44,r*.07);
    blink(c,ey,s>0?.2:.4);c.an(t=>{const k=1+Math.sin(t*2+s)*.03;d.scale.set(1/k,k,1)})})});

A('blatt','Blattaugen','pflanze',(g,c)=>{const F=face(g,c),u=F.u,m=c.m;const leaf=sshp([[0,0],[.36,.22],[.42,.6],[0,1],[-.42,.6],[-.36,.22]]);
  const lm=m.c(PAL.leaf,{rim:.5,rimColor:'#eaffb0'}),vm=m.c(PAL.moss);
  both(s=>{const q=F.mount(s*u*.37,F.Y,{k:.85});const r=u*.18;eyeBall(q,c,r,{bo:s>0?.1:.3});
    [[.25,.36],[.9,.28]].forEach(([da,sz],i)=>{const a=PI/2-s*da;const l=grp(q,[Math.cos(a)*r*.55,Math.sin(a)*r*.8,-r*.1],[0,0,a-PI/2]);
      P(l,G.puff(leaf,u*.025,u*.012),i?m.c(PAL.grass,{rim:.5,rimColor:'#eaffb0'}):lm,null,null,u*sz);P(l,G.ca(u*.011,u*sz*.55),vm,[0,u*sz*.45,u*.03]);
      c.an(t=>{l.rotation.z=a-PI/2+Math.sin(t*1.3+s+i)*.1})})})});

A('keine','Keine Augen','none',(g,c)=>{});

/* ===================== WIRED: LCD-Augen ===================== */
A('lcdaugen','LCD-Augen','masch',(g,c)=>{const F=face(g,c),u=F.u;const m=c.m;
  const tex=ctex('auge-lcd',64,64,(x,w,h)=>{x.fillStyle='#c9f27a';x.fillRect(0,0,w,h);x.fillStyle='#1d2b0b';x.fillRect(w*.3,h*.25,w*.4,h*.5);x.fillStyle='#c9f27a';x.fillRect(w*.38,h*.3,w*.1,h*.1)});
  const mt=new THREE.MeshBasicMaterial({map:tex,toneMapped:false});mt.userData.flat=true;const E=[];
  both(sg=>{const q=F.mount(sg*u*.36,F.Y,{k:.7});P(q,G.bx(u*.3,u*.3,u*.05,u*.05),m.chrome(),[0,0,0]);const e=P(q,G.pl(u*.24,u*.24),mt,[0,0,u*.03]);e.userData.eye=true;E.push(e)});
  c.an(t=>{const b=(t%4)<.12?.15:1;E.forEach(e=>e.scale.y=b)})});

})();
