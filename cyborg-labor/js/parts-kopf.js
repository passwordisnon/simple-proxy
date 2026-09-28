/* =====================================================================
   KÖPFE · Cozy-Spielzeug-Stil
   Jeder Kopf baut um (0,hy,0) mit Radius ~hr (Chibi: gross & rund) und
   gibt {top, front, faceY, sideX} zurück:
     front = z der Gesichtsfläche auf Augenhöhe bei x≈±0.38·hr
     faceY = Augenhöhe · top = Oberkante, auf der Hüte sitzen (bei Hörnern,
     Antennen usw. die Schädeldecke dazwischen) · sideX = halbe Kopfbreite.
   Organische Köpfe bekommen Mund/Wangen, aber keine Augen (Augen-Slot).
   ===================================================================== */
(function(){
const K=(id,n,k,b)=>def('kopf',id,n,k,b);
const EX=.38;                                  // Augen-Abstand (Anteil von hr)

/* ---------- Mathe & Flächen ---------- */
const ez=(A,B,D,x,y)=>D*Math.sqrt(Math.max(0,1-(x*x)/(A*A)-(y*y)/(B*B)));
const es=(cx,cy,cz,A,B,D)=>(x,y)=>cz+ez(A,B,D,x-cx,y-cy);           // Vorderfläche eines Ellipsoids
const mx=(...f)=>(x,y)=>Math.max(...f.map(s=>s(x,y)));
const ell=(g,mat,x,y,z,A,B,D,rot)=>P(g,G.s(1),mat,[x,y,z],rot,[A,B,D]);
/* Punkt auf Ellipsoid in Richtung d (+Normale) */
function onE(cx,cy,cz,A,B,D,d,off){const v=new V3(d[0],d[1],d[2]).normalize();const k=1/Math.sqrt((v.x/A)**2+(v.y/B)**2+(v.z/D)**2);v.multiplyScalar(k);
  const n=new V3(v.x/(A*A),v.y/(B*B),v.z/(D*D)).normalize();return{p:new V3(cx+v.x+n.x*(off||0),cy+v.y+n.y*(off||0),cz+v.z+n.z*(off||0)),n}}
const face2=(o,n)=>{o.lookAt(o.position.x+n.x,o.position.y+n.y,o.position.z+n.z);return o};
/* Kopf-Kennwerte früh setzen, damit mouth()/cheeks() beim Bau funktionieren */
function face(c,o){const H=Object.assign({cy:c.hy,r:c.hr,top:c.hy+c.hr,front:c.hr*.93,faceY:c.hy,sideX:c.hr},o);c.H=H;return H}
/* Mund/Wangen exakt auf eine gewölbte Fläche surf(x,y)->z setzen */
function mouthOn(g,c,surf,kind,o){o=o||{};const H=c.H;const y=o.y??H.faceY-H.r*.42,w=H.r*(o.w??.16);
  const z=surf(0,kind==='smile'?y-w*.7:y)+H.r*(kind==='open'?.01:.014);mouth(g,c,kind,{y,w:o.w,z:z/H.front})}
function cheeksOn(g,c,surf,o){o=o||{};const H=c.H;const y=o.y??H.faceY-H.r*.28,sp=o.sp??.62;cheeks(g,c,{y,sp,z:(surf(sp*H.r,y)+H.r*.006)/H.front})}
/* Linie (Mund, Naht) auf der Fläche */
function lineOn(g,mat,surf,xy,rad,lift){const pts=xy.map(([x,y])=>[x,y,surf(x,y)+(lift??rad*.35)]);P(g,G.tu(pts,rad,rad),mat);P(g,G.s(rad),mat,pts[0]);P(g,G.s(rad),mat,pts[pts.length-1])}
function smileLine(g,c,surf,y,w,bend,rad){const xy=range(11,t=>{const u=t*2-1;return[u*w,y+bend*u*u]});lineOn(g,c.m.c(PAL.ink),surf,xy,rad||c.hr*.028)}

/* ---------- Formen ---------- */
function almond(w,h,b){const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(w,h*(b??.45),0,h);s.quadraticCurveTo(-w,h*(b??.45),0,0);return s}
function petal(w,h){const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(w*.75,h*.15,w*.65,h,0,h);s.bezierCurveTo(-w*.65,h,-w*.75,h*.15,0,0);return s}
function earShape(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.quadraticCurveTo(-w*.28,h*.72,0,h);s.quadraticCurveTo(w*.28,h*.72,w/2,0);s.quadraticCurveTo(0,-h*.14,-w/2,0);return s}
function rrShape(w,h,rad){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+rad,y);s.lineTo(x+w-rad,y);s.quadraticCurveTo(x+w,y,x+w,y+rad);s.lineTo(x+w,y+h-rad);s.quadraticCurveTo(x+w,y+h,x+w-rad,y+h);
  s.lineTo(x+rad,y+h);s.quadraticCurveTo(x,y+h,x,y+h-rad);s.lineTo(x,y+rad);s.quadraticCurveTo(x,y,x+rad,y);return s}
function rrPlane(w,h,rad){const g=new THREE.ShapeGeometry(rrShape(w,h,rad),Q(6));const uv=g.attributes.uv,p=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5);return g}
function scrMat(tex){const mm=new THREE.MeshBasicMaterial({map:tex,toneMapped:false});mm.userData.flat=true;return mm}
function gemGeo(pts,seg){const g0=G.la(pts,seg);const g=g0.toNonIndexed();g0.dispose();g.computeVertexNormals();return g}

/* ---------- Geometrien verschmelzen (viele kleine Teile = 1 Mesh) ---------- */
const _d=new THREE.Object3D();
function place(geo,p,look,sc,spin){const g2=geo.index?geo.toNonIndexed():geo;if(g2!==geo)geo.dispose();_d.position.set(p.x,p.y,p.z);_d.rotation.set(0,0,0);_d.scale.set(1,1,1);_d.quaternion.identity();
  if(look)_d.lookAt(p.x+look.x,p.y+look.y,p.z+look.z);if(spin)_d.rotateX(spin);if(sc!=null){if(typeof sc==='number')_d.scale.setScalar(sc);else _d.scale.set(sc[0],sc[1],sc[2])}
  _d.updateMatrix();g2.applyMatrix4(_d.matrix);return g2}
function merge(list){let n=0;for(const g of list)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
  for(const g of list){const k=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);if(g.attributes.normal)nor.set(g.attributes.normal.array,o*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,o*2);o+=k;g.dispose()}
  const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(pos,3));m.setAttribute('normal',new THREE.BufferAttribute(nor,3));m.setAttribute('uv',new THREE.BufferAttribute(uv,2));m.computeBoundingSphere();return m}
const lowS=(r)=>new THREE.SphereGeometry(r,Q(10),Q(7));
const ZUP=new V3(0,1,0);

/* =====================================================================
   ORGANISCH
   ===================================================================== */
K('mensch','Menschenkopf','org',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin();const A=r*1.06,B=r*.98;
  const surf=es(0,hy,0,A,B,r);const H=face(c,{top:hy+r*1.15,front:surf(EX*r,hy),faceY:hy,sideX:A});
  ell(g,sk,0,hy,0,A,B,r);
  both(x=>{P(g,G.s(r*.2),sk,[x*A*.97,hy-r*.08,-r*.04],null,[.5,.9,.72])});
  const hair=m.c(PAL.choc,{gloss:.8,rim:.55,rimColor:'#ffd9b8'});
  ell(g,hair,0,hy+r*.14,-r*.12,r*1.05,r*1.02,r*1.05);
  [[-.34,.5,.36,-.42],[.3,.55,.22,.5]].forEach(([x,y,rr,rz])=>{const yy=hy+y*r;P(g,G.s(r*rr),hair,[x*r,yy,surf(x*r,yy)-r*.1],[.45,0,rz],[1.35,.5,.62])});
  const cu=grp(g,[r*.05,hy+r*1.1,r*.05],[0,.3,0]);P(cu,G.puff(almond(r*.2,r*.34),r*.09),hair,[0,0,0],[0,0,-.55]);
  c.an(t=>{cu.rotation.z=Math.sin(t*2.6)*.12});
  P(g,G.s(r*.085),sk,[0,hy-r*.19,surf(0,hy-r*.19)-r*.02],null,[1,.85,.8]);
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('alien','Alienkopf','org',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin();
  const cy1=hy+r*.22,cy2=hy-r*.3;const surf=mx(es(0,cy1,0,r*1.1,r*1.1,r*.98),es(0,cy2,r*.1,r*.74,r*.6,r*.84));
  const fy=hy+r*.02;const H=face(c,{top:cy1+r*1.08,front:surf(EX*r,fy),faceY:fy,sideX:r*1.1});
  ell(g,sk,0,cy1,0,r*1.1,r*1.1,r*.98);ell(g,sk,0,cy2,r*.1,r*.74,r*.6,r*.84);
  both(x=>{const a=grp(g,[x*r*.42,cy1+r*.94,0],[0,0,-x*.32]);P(a,G.ca(r*.055,r*.4),sk,[0,r*.25,0]);P(a,G.s(r*.13),m.gloss(PAL.mint),[0,r*.58,0]);
    P(a,G.s(r*.045),m.flat('#ffffff'),[r*.05,r*.64,r*.09]);c.an(t=>{a.rotation.z=-x*.32+Math.sin(t*2.2+x*1.3)*.13})});
  [[-.2,.6],[0,.68],[.2,.6]].forEach(([x,y])=>{const yy=hy+y*r;P(g,G.s(r*.06),m.gloss(PAL.lilac),[x*r,yy,surf(x*r,yy)],null,[1,1,.45])});
  mouthOn(g,c,surf,'o',{w:.14});cheeksOn(g,c,surf,{sp:.56});return H});

K('schaedel','Totenschädel','org',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.c(PAL.bone,{gloss:.6,rim:.45}),dk=m.c(PAL.plum,{rim:.15});
  const cy=hy+r*.14,A=r*1.06,B=r*.94,D=r*.96;const surf=es(0,cy,0,A,B,D);
  ell(g,bm,0,cy,0,A,B,D);P(g,G.bx(r*1.0,r*.5,r*.72,r*.23),bm,[0,hy-r*.54,r*.36]);
  const fy=hy+r*.08,zf=surf(EX*r,fy);
  both(x=>P(g,G.s(r*.29),dk,[x*EX*r,fy,zf-r*.06],[0,x*.36,0],[1,1.1,.42]));
  const H=face(c,{top:cy+B,front:zf-r*.02,faceY:fy,sideX:A});
  const ny=hy-r*.22;P(g,G.heart(r*.085,r*.05),dk,[0,ny,surf(0,ny)-r*.005],[0,0,PI]);
  const jz=r*.72,jy=hy-r*.56;P(g,G.ca(r*.028,r*.5),dk,[0,jy,jz],[0,0,PI/2]);range(3,(t)=>P(g,G.ca(r*.024,r*.14),dk,[(t-.5)*r*.34,jy,jz]));
  lineOn(g,dk,surf,[[r*.32,cy+r*.86],[r*.44,cy+r*.74],[r*.36,cy+r*.62],[r*.48,cy+r*.5]],r*.022);
  const fp=onE(0,cy,0,A,B,D,[-.62,.62,.46],-r*.01);const fl=face2(grp(g,[fp.p.x,fp.p.y,fp.p.z]),fp.n);
  range(5,(t,i)=>{const a=i/5*TAU;P(fl,G.s(r*.1),m.c(PAL.pink,{gloss:.6}),[Math.cos(a)*r*.11,Math.sin(a)*r*.11,0],null,[1,1,.45])});P(fl,G.s(r*.07),m.gloss(PAL.lemon),[0,0,r*.03],null,[1,1,.6]);
  cheeksOn(g,c,surf,{sp:.64,y:fy-r*.32});return H});

K('ei','Eierkopf','ding',(g,c)=>{const{hy,hr:r,m}=c;const a=r*.96,bt=r*1.22,bb=r*.9,cy=hy+r*.02;
  const Rof=(y)=>{const v=y-cy;const sn=v>=0?Math.min(1,v/bt):Math.max(-1,v/bb);return a*Math.cos(Math.asin(sn))*(sn>0?1-.1*sn:1)};
  const surf=(x,y)=>Math.sqrt(Math.max(0,Rof(y)**2-x*x));
  P(g,G.la(range(Q(26),(t)=>{const th=-PI/2+t*PI,sn=Math.sin(th);return[Math.max(1e-4,a*Math.cos(th)*(sn>0?1-.1*sn:1)),cy+sn*(sn>0?bt:bb)]})),m.gloss(PAL.cream));
  const ky=cy+r*.74;P(g,G.tu(range(15,(t,i)=>{const f=-1.35+t*2.7,y=ky+(i%2?r*.07:-r*.05),R=Rof(y)+r*.005;return[Math.sin(f)*R,y,Math.cos(f)*R]}),r*.026,r*.026,Q(60)),m.c(PAL.choc));
  [[.8,.1,-.5,.09],[-.7,.4,-.55,.07],[.2,-.5,-.85,.08],[-.9,-.3,.2,.06],[.5,.6,-.6,.06],[-.3,.1,-.95,.1]].forEach(([x,y,z,s])=>{const q=onE(0,cy,0,a,y>0?bt:bb,a,[x,y,z],-r*.012);face2(P(g,G.s(r*s),m.c(PAL.sand),[q.p.x,q.p.y,q.p.z],null,[1,1,.3]),q.n)});
  const H=face(c,{top:cy+bt,front:surf(EX*r,hy+r*.06),faceY:hy+r*.06,sideX:a});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('mond','Mondgesicht','ding',(g,c)=>{const{hy,hr:r,m}=c;const R=r*1.02;const surf=es(0,hy,0,R,R,R);
  const H=face(c,{top:hy+R,front:surf(EX*r,hy),faceY:hy,sideX:R});
  P(g,G.s(R),m.c(PAL.butter,{gloss:.4,rim:.8,rimColor:'#ffffff'}),[0,hy,0]);
  const cm=m.c('#EDCB6E',{rim:.2}),cr=m.c('#FFF8D6',{gloss:.3});
  [[-.58,.62,.52,.19],[.62,.6,.48,.14],[.96,-.18,.2,.17],[-.93,-.34,.15,.14],[.1,.95,-.3,.16],[-.3,.3,-.9,.2],[.5,-.3,-.8,.15],[.2,-.95,.25,.12]].forEach(([x,y,z,s])=>{const q=onE(0,hy,0,R,R,R,[x,y,z],-r*.02);
    face2(P(g,G.s(r*s),cm,[q.p.x,q.p.y,q.p.z],null,[1,1,.3]),q.n);face2(P(g,G.to(r*s*.95,r*s*.2),cr,[q.p.x,q.p.y,q.p.z]),q.n)});
  const st=grp(g,[0,hy,0]);const sm=P(st,G.star(r*.2,r*.09,5,r*.09),m.gloss(PAL.lemon),[r*1.38,r*.6,0]);const st2=P(st,G.star(r*.1,r*.045,5,r*.05),m.gloss(PAL.honey),[-r*1.3,r*.9,-r*.3]);
  c.an(t=>{st.rotation.y=t*.5+2.4;sm.rotation.z=t*1.2;st2.rotation.z=-t;sm.position.y=r*(.6+Math.sin(t*1.7)*.08)});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('statue','Götterstatuen-Kopf','ding',(g,c)=>{const{hy,hr:r,m}=c;const mm=m.c('#F3F0F8',{gloss:.7,rim:.6,rimColor:'#ffffff'}),hm=m.c('#D9D5E6',{gloss:.6,rim:.5});
  const A=r,B=r*1.02,D=r*.98;const surf=es(0,hy,0,A,B,D);const H=face(c,{top:hy+r*1.18,front:surf(EX*r,hy),faceY:hy,sideX:A*1.02});
  ell(g,mm,0,hy,0,A,B,D);
  const HC=[0,hy+r*.18,-r*.12,r*1.03,r*1.0,r*1.04];ell(g,hm,...HC);
  const curl=(el,ph,s2)=>{const q=onE(...HC,[Math.sin(ph)*Math.cos(el),Math.sin(el),Math.cos(ph)*Math.cos(el)],-r*.05);return place(lowS(r*.17*s2),q.p,null,1)};
  P(g,merge([...range(7,(t)=>curl(.42+Math.abs(t-.5)*.35,-1.1+t*2.2,1)),...range(6,(t,i)=>curl(1.0,(i+.5)/6*TAU,1.05))]),hm);
  const gd=m.gold();const lv=[];both(x=>{range(6,(t,i)=>{const ph=x*(2.6-t*2.1),el=.42+t*.28;const q=onE(...HC,[Math.sin(ph)*Math.cos(el),Math.sin(el),Math.cos(ph)*Math.cos(el)],r*.01);
      const lf=face2(grp(g,[q.p.x,q.p.y,q.p.z]),q.n);P(lf,G.puff(almond(r*.18,r*.34),r*.05),m.gloss(PAL.leaf),[0,0,0],[0,0,x*(1.35+(i%2?.45:-.3))]);lv.push(q.p.toArray())})});
  P(g,G.tu(lv.slice(0,6).reverse().concat(lv.slice(6)),r*.03),gd);
  const ny=hy-r*.14;P(g,G.ca(r*.065,r*.13),mm,[0,ny,surf(0,ny)-r*.03],[-.25,0,0]);
  const bd=[[-.3,-.66,.17],[0,-.76,.2],[.3,-.66,.17],[-.14,-.84,.15],[.14,-.84,.15],[0,-.95,.13]].map(([x,y,s2])=>{const yy=hy+y*r;return place(lowS(r*s2),new V3(x*r,yy,surf(x*r,yy)-r*.08),null,1)});
  P(g,merge(bd),hm);both(x=>P(g,G.s(r*.11),hm,[x*r*.12,hy-r*.3,surf(x*r*.12,hy-r*.3)-r*.02],[0,0,x*.45],[1.3,.5,.6]));
  mouthOn(g,c,surf,'smile',{w:.1,y:hy-r*.45});cheeksOn(g,c,surf,{y:hy-r*.2});return H});

K('gehirnglas','Gehirn im Glas','org',(g,c)=>{const{hy,hr:r,m}=c;
  const jr=r*.95,j0=hy-r*.74,j1=hy+r*.8;
  P(g,G.la([[0,j0],[jr*.9,j0],[jr,j0+r*.1],[jr,j1-r*.12],[jr*.92,j1],[0,j1]]),m.glass('#E4FAFF'));
  const lid=m.gloss(PAL.mint);P(g,G.cy(r*.97,r*.97,r*.18),lid,[0,j1+r*.07,0]);P(g,G.to(r*.97,r*.045),lid,[0,j1+r*.02,0],[PI/2,0,0]);
  P(g,G.s(r*.86),lid,[0,j1+r*.16,0],null,[1,.14,1]);P(g,G.s(r*.13),m.gloss(PAL.lemon),[0,j1+r*.3,0]);
  P(g,G.cy(r*.97,r*1.0,r*.16),lid,[0,j0-r*.04,0]);P(g,G.to(r*.97,r*.045),lid,[0,j0+r*.03,0],[PI/2,0,0]);
  const hl=m.flat('#ffffff');P(g,G.ca(r*.035,r*.7),hl,[-r*.62,hy+r*.05,r*.72],[0,-.72,0]);P(g,G.ca(r*.025,r*.28),hl,[-r*.48,hy+r*.5,r*.82],[0,-.52,0]);
  P(g,G.to(jr,r*.018),m.c('#BDEFF5',{gloss:1}),[0,j1-r*.05,0],[PI/2,0,0]);
  const by=hy,bz=r*.05,A=r*.73,B=r*.6,D=r*.65;const surf=es(0,by,bz,A,B,D);
  const fy=hy+r*.04;const H=face(c,{top:j1+r*.3,front:surf(EX*r,fy),faceY:fy,sideX:r*1.02});
  const br=grp(g,[0,0,0]);P(br,G.blob(r*.66,.06,7,3),m.c('#FF8FB8',{gloss:1.1,rim:.3}),[0,by,bz],null,[1.1,.9,.98]);
  const gy=m.c(PAL.berry,{gloss:.6});
  P(br,G.tu(range(7,t=>{const q=onE(0,by,bz,A,B,D,[0,1,.9-t*1.9],-r*.01).p;return[q.x,q.y,q.z]}),r*.035,r*.03),gy);
  both(x=>range(2,(u,k)=>P(br,G.tu(range(8,t=>{const q=onE(0,by,bz,A,B,D,[x*(.55+k*.35),.75-k*.55+Math.sin(t*9+k)*.12,.5-t*1.4],-r*.01).p;return[q.x,q.y,q.z]}),r*.03,r*.024),gy)));
  both(x=>P(g,G.tu([[x*r*.3,j0,0],[x*r*.32,hy-r*.45,-r*.05],[x*r*.18,hy-r*.52,0]],r*.045),m.gloss(x<0?PAL.lemon:PAL.coral)));
  const bub=range(4,(t,i)=>P(g,G.s(r*(.05+.02*(i%2))),m.glass('#ffffff'),[Math.sin(i*2.4+1)*r*.72,hy,Math.cos(i*2.4+1)*r*.55-r*.2]));
  c.an(t=>{br.position.y=Math.sin(t*1.2)*r*.025;bub.forEach((b,i)=>{b.position.y=j0+r*.15+((t*.35+i*.27)%1)*r*1.1})});
  mouthOn(g,c,surf,'smile',{w:.13,y:hy-r*.34});cheeksOn(g,c,surf,{sp:.5,y:fy-r*.22});return H});

/* =====================================================================
   TIERISCH
   ===================================================================== */
K('axolotl','Axolotl-Kopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const A=r*1.22,B=r*.86,D=r;
  const pm=m.gloss('#FFB8D2'),lm=m.gloss('#FFD9E8'),gm=m.gloss(PAL.rose);
  const surf=mx(es(0,hy,0,A,B,D),es(0,hy-r*.3,r*.1,A*.8,B*.6,D*.88));const fy=hy+r*.08;
  const H=face(c,{top:hy+B,front:surf(EX*r,fy),faceY:fy,sideX:A});
  ell(g,pm,0,hy,0,A,B,D);ell(g,lm,0,hy-r*.3,r*.1,A*.8,B*.6,D*.88);
  const fp=[];for(let i=0;i<=12;i++){const t=i/12;fp.push([r*.14*Math.pow(Math.sin(PI*t),.7)*(1+.28*Math.sin(t*PI*7)),t*r*.6])}for(let i=12;i>=0;i--){const t=i/12;fp.push([-r*.14*Math.pow(Math.sin(PI*t),.7)*(1+.28*Math.sin(t*PI*7+1)),t*r*.6])}
  const frond=sshp(fp);
  both(x=>range(3,(u,k)=>{const base=-x*(.35+k*.55);const fg=grp(g,[x*A*.84,hy+r*(.42-k*.3),-r*.18],[0,0,base]);P(fg,G.puff(frond,r*.07),gm);
    c.an(t=>{fg.rotation.z=base+Math.sin(t*2.3+k*1.1+x)*.1*x})}));
  [[-.3,.72,-.1],[.35,.66,-.2],[0,.8,-.45]].forEach(d=>{const q=onE(0,hy,0,A,B,D,d,-r*.01);face2(P(g,G.s(r*.07),m.c(PAL.rose),[q.p.x,q.p.y,q.p.z],null,[1,1,.35]),q.n)});
  smileLine(g,c,surf,hy-r*.3,r*.5,r*.1,r*.03);cheeksOn(g,c,surf,{sp:.66});return H});

K('oktopus','Oktopusmantel','tier',(g,c)=>{const{hy,hr:r,m}=c;const pm=m.gloss('#B08BE8'),sp=m.gloss('#DCCBFF');
  const cy=hy-r*.08,cz=r*.08,A=r*.98,B=r*.84,D=r*.9;const surf=es(0,cy,cz,A,B,D);const fy=hy;
  const H=face(c,{top:hy+r*1.42,front:surf(EX*r,fy),faceY:fy,sideX:A});
  const mt=ell(g,pm,0,hy+r*.42,-r*.22,r*.92,r*1.1,r*.9,[-.22,0,0]);ell(g,pm,0,cy,cz,A,B,D);
  [[.4,.7,.2,.13],[-.5,.5,.3,.11],[.1,.4,-.8,.14],[-.2,.95,-.3,.1],[.7,.2,-.5,.1]].forEach(([x,y,z,s])=>{const q=onE(0,hy+r*.42,-r*.22,r*.92,r*1.1,r*.9,[x,y,z],-r*.012);
    face2(P(g,G.s(r*s),sp,[q.p.x,q.p.y,q.p.z],null,[1,1,.3]),q.n)});
  [1.25,2.05,2.8].forEach((a0,k)=>both(x=>{const a=a0*x;const tg=grp(g,[0,0,0]);const sn=Math.sin(a),cs=Math.cos(a);
    const pts=[[.62,-.44],[.95,-.72],[1.24,-.72],[1.36,-.52],[1.24,-.36],[1.1,-.42]].map(([rr,yy])=>[sn*rr*r,hy+yy*r,cs*rr*r]);
    P(tg,G.tu(pts,r*.16,r*.045),pm);c.an(t=>{tg.rotation.y=Math.sin(t*1.6+k*1.3+x)*.06})}));
  c.an(t=>{mt.scale.y=r*1.1*(1+Math.sin(t*1.8)*.025)});
  mouthOn(g,c,surf,'o',{w:.15});cheeksOn(g,c,surf,{sp:.6});return H});

K('frosch','Froschkopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const gm=m.gloss(PAL.grass),bm=m.gloss('#F2F7C9');
  const cy=hy-r*.05,A=r*1.22,B=r*.8;const hs=es(0,cy,0,A,B,r),cs=es(0,hy-r*.34,r*.12,r*1.05,r*.46,r*.9);const surf=mx(hs,cs);
  const bx=r*.42,by=hy+r*.6,bz=r*.26,br=r*.31;const fy=by;
  const H=face(c,{top:hy+r*.9,front:bz+ez(br,br,br,EX*r-bx,0),faceY:fy,sideX:A});
  ell(g,gm,0,cy,0,A,B,r);ell(g,bm,0,hy-r*.34,r*.12,r*1.05,r*.46,r*.9);
  both(x=>{ell(g,gm,x*bx,by,bz,br,br*.96,br)});
  [[-.5,.35,-.6],[.55,.3,-.55],[0,.5,-.85]].forEach(d=>{const q=onE(0,cy,0,A,B,r,d,-r*.01);face2(P(g,G.s(r*.1),m.c(PAL.moss),[q.p.x,q.p.y,q.p.z],null,[1,1,.3]),q.n)});
  both(x=>{const ny=hy+r*.22;P(g,G.s(r*.035),m.c(PAL.forest),[x*r*.12,ny,hs(x*r*.12,ny)],null,[1.3,1,.5])});
  smileLine(g,c,surf,hy-r*.1,r*.62,r*.12,r*.032);cheeksOn(g,c,surf,{y:hy+r*.12,sp:.72});return H});

K('fisch','Clownfisch-Kopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const A=r*.92,B=r*.95,D=r*1.05;const om=m.gloss(PAL.orange),wm=m.gloss(PAL.white),im=m.c(PAL.ink);
  const surf=es(0,hy,0,A,B,D);const fy=hy+r*.1;const H=face(c,{top:hy+B,front:surf(EX*r,fy),faceY:fy,sideX:A});
  ell(g,om,0,hy,0,A,B,D);P(g,G.to(r*.9,r*.12),wm,[0,hy,-r*.14],null,[1,1.04,.9]);
  both(x=>P(g,G.to(r*.9+r*.012,r*.026),im,[0,hy,-r*.14+x*r*.13],null,[1,1.04,.9]));
  const dor=sshp([[-.4,0],[-.3,.3],[0,.46],[.35,.36],[.52,.05],[.3,-.05]].map(([a,b])=>[a*r,b*r]));
  const df=P(g,G.puff(dor,r*.09),om,[0,hy+r*.78,-r*.18],[0,PI/2,0]);P(g,G.to(r*.12,r*.028,PI),im,[0,hy+r*1.18,-r*.25],[0,PI/2,0]);
  const fins=[];both(x=>{const f=grp(g,[x*A*.9,hy-r*.28,r*.05],[0,x*.5,-x*1.9]);P(f,G.puff(almond(r*.3,r*.42),r*.07),om);P(f,G.to(r*.08,r*.02,PI*.9),im,[0,r*.46,0],[0,0,.15]);fins.push([f,x])});
  c.an(t=>{fins.forEach(([f,x])=>{f.rotation.z=-x*(1.9+Math.sin(t*4+x)*.18)});df.rotation.z=Math.sin(t*2)*.05});
  const ly=hy-r*.34;P(g,G.to(r*.1,r*.05),m.gloss(PAL.rose),[0,ly,surf(0,ly)+r*.02]);
  const bub=range(3,(t,i)=>P(g,G.s(r*(.06+i*.02)),m.glass('#ffffff'),[r*.72,hy,r*.62]));
  c.an(t=>bub.forEach((b,i)=>{const u=(t*.45+i*.33)%1;b.position.set(r*(.7+Math.sin(u*9)*.06),hy-r*.2+u*r*1.4,r*.6)}));
  cheeksOn(g,c,surf,{sp:.6});return H});

K('hai','Haikopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const bl=m.plush('#7FAEE3'),wh=m.plush(PAL.white),nv=m.c(PAL.navy);
  const hs=es(0,hy,-r*.02,r*.96,r*.9,r*1.08),bs=es(0,hy-r*.3,r*.1,r*.8,r*.55,r*.98);const surf=mx(hs,bs);const fy=hy+r*.14;
  const H=face(c,{top:hy+r*.9,front:surf(EX*r,fy),faceY:fy,sideX:r*.96});
  ell(g,bl,0,hy,-r*.02,r*.96,r*.9,r*1.08);ell(g,wh,0,hy-r*.3,r*.1,r*.8,r*.55,r*.98);
  const fin=sshp([[-.42,0],[-.05,.1],[.3,.66],[.3,.3],[.42,0]].map(([a,b])=>[a*r,b*r]));const fm=P(g,G.puff(fin,r*.13),bl,[0,hy+r*.72,-r*.28],[0,PI/2,0]);
  both(x=>{P(g,G.puff(almond(r*.28,r*.46),r*.08),bl,[x*r*.8,hy-r*.34,-r*.05],[.3,0,-x*2.3]);
    range(3,(t,k)=>{const z=-r*(.05+k*.15),y=hy+r*.02;P(g,G.ca(r*.024,r*.18),nv,[x*(ez(r*1.08,r*.9,r*.96,z+r*.02,0)-r*.005),y,z])})});
  c.an(t=>{fm.rotation.x=Math.sin(t*1.7)*.06});
  const my=hy-r*.32;smileLine(g,c,surf,my,r*.3,r*.07,r*.028);
  both(x=>P(g,G.co(r*.045,r*.09),wh,[x*r*.12,my-r*.035,surf(x*r*.12,my)+r*.005],[PI,0,0]));
  cheeksOn(g,c,surf,{sp:.6});return H});

K('eule','Eulenkopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.plush(PAL.wood),fm=m.plush(PAL.sand),dk=m.plush(PAL.choc);
  const A=r*1.08,hs=es(0,hy,0,A,r,r);const dy=hy+r*.04,dx=r*.36,da=r*.4,db=r*.44,dd=r*.12,dz=hs(dx,dy)-r*.07;
  const surf=mx(hs,es(-dx,dy,dz,da,db,dd),es(dx,dy,dz,da,db,dd));const fy=dy;
  const H=face(c,{top:hy+r,front:surf(EX*r,fy),faceY:fy,sideX:A});
  ell(g,bm,0,hy,0,A,r,r);both(x=>ell(g,fm,x*dx,dy,dz,da,db,dd,[0,x*.3,0]));
  both(x=>{const e=grp(g,[x*r*.58,hy+r*.72,-r*.05],[0,0,-x*.5]);P(e,G.puff(earShape(r*.34,r*.5),r*.12),dk);c.an(t=>{e.rotation.z=-x*(.5+Math.sin(t*1.9+x)*.06)})});
  const bk=grp(g,[0,hy-r*.16,surf(0,hy-r*.16)],[.35,0,0]);P(bk,G.co(r*.12,r*.26),m.gloss(PAL.honey),[0,-r*.04,r*.06],[PI*.72,0,0],[1,1,.8]);
  [-.18,0,.18].forEach(x=>{const y=hy+r*(.62-Math.abs(x)*.6);P(g,G.s(r*.05),dk,[x*r,y,hs(x*r,y)],[0,0,0],[1,1.4,.4])});
  cheeksOn(g,c,surf,{sp:.64,y:fy-r*.3});return H});

K('katze','Katzenkopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin();const A=r*1.1,B=r*.95;const surf=es(0,hy,0,A,B,r);
  const H=face(c,{top:hy+r*.98,front:surf(EX*r,hy),faceY:hy,sideX:A});
  ell(g,sk,0,hy,0,A,B,r);
  both(x=>{const e=grp(g,[x*r*.56,hy+r*.6,-r*.02],[-.12,0,-x*.36]);P(e,G.puff(earShape(r*.54,r*.6),r*.14),sk);P(e,G.puff(earShape(r*.3,r*.36),r*.06),m.c(PAL.blush,{gloss:.4}),[0,r*.07,r*.09]);
    c.an(t=>{const ph=(t*.55+(x>0?.5:0))%3;e.rotation.z=-x*(.36+(ph<.3?Math.sin(ph/.3*PI)*.18:0))})});
  const ny=hy-r*.18;P(g,G.s(r*.075),m.gloss(PAL.rose),[0,ny,surf(0,ny)],null,[1.25,.8,.6]);
  mouthOn(g,c,surf,'cat',{y:hy-r*.3,w:.12});
  const wk=m.c(PAL.ink);both(x=>range(3,(t,k)=>{const y0=hy-r*.2+(k-1)*r*.05;bt(g,[x*r*.55,y0,surf(r*.55,y0)-r*.02],[x*r*1.12,y0+(k-1)*r*.13,r*.42],r*.022,wk)}));
  cheeksOn(g,c,surf,{sp:.58});return H});

K('hirsch','Rehkopf mit Geweih','tier',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin();const A=r*1.02,B=r*.98;const surf=es(0,hy,0,A,B,r);
  const H=face(c,{top:hy+B,front:surf(EX*r,hy),faceY:hy,sideX:A});
  ell(g,sk,0,hy,0,A,B,r);
  both(x=>{const e=grp(g,[x*r*.88,hy+r*.36,-r*.12],[0,x*-.3,-x*1.15]);P(e,G.puff(almond(r*.34,r*.62),r*.12),sk);P(e,G.puff(almond(r*.2,r*.42),r*.05),m.c(PAL.blush,{gloss:.4}),[0,r*.08,r*.08]);
    c.an(t=>{e.rotation.z=-x*(1.15+Math.sin(t*1.4+x)*.08)})});
  const am=m.gloss(PAL.oak);const tip=(p)=>P(g,G.s(r*.07),am,p);
  both(x=>{const b=[[x*r*.36,hy+r*.82,-r*.05],[x*r*.5,hy+r*1.22,-r*.08],[x*r*.74,hy+r*1.58,-r*.05],[x*r*.8,hy+r*1.9,0]];P(g,G.tu(b,r*.085,r*.065),am);tip(b[3]);
    const t1=[[x*r*.55,hy+r*1.3,-r*.08],[x*r*.38,hy+r*1.55,-r*.02],[x*r*.34,hy+r*1.74,.0]];P(g,G.tu(t1,r*.065,r*.058),am);tip(t1[2]);
    const t2=[[x*r*.74,hy+r*1.58,-r*.05],[x*r*.98,hy+r*1.7,-r*.05],[x*r*1.12,hy+r*1.86,0]];P(g,G.tu(t2,r*.062,r*.056),am);tip(t2[2])});
  [[-.22,.62],[.18,.7],[.02,.82],[.36,.52]].forEach(([x,y])=>{const yy=hy+y*r;P(g,G.s(r*.055),m.c(PAL.ivory),[x*r,yy,surf(x*r,yy)],null,[1,1,.35])});
  const ny=hy-r*.2;P(g,G.s(r*.08),m.gloss(PAL.choc),[0,ny,surf(0,ny)],null,[1.25,.9,.7]);
  mouthOn(g,c,surf,'smile',{y:hy-r*.38,w:.13});cheeksOn(g,c,surf);return H});

K('widder','Widderkopf mit Hörnern','tier',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin();const A=r*1.02,B=r*.98;const surf=es(0,hy,0,A,B,r);
  const H=face(c,{top:hy+r*1.1,front:surf(EX*r,hy),faceY:hy,sideX:r*1.22});
  ell(g,sk,0,hy,0,A,B,r);
  const hm=m.gloss(PAL.oak),rg=m.c(PAL.wood,{gloss:.6});
  both(x=>{const n=new V3(x*.72,0,.69).normalize(),u=new V3(0,1,0),v=new V3().crossVectors(n,u).multiplyScalar(-1);const C=new V3(x*r*.78,hy+r*.12,-r*.02);
    const at=(t)=>{const a=t*PI*1.75,R=r*(.52-.36*t);return C.clone().addScaledVector(u,Math.cos(a)*R).addScaledVector(v,Math.sin(a)*R).addScaledVector(n,t*r*.34)};
    P(g,G.tu(range(20,t=>at(t).toArray()),r*.19,r*.07),hm);P(g,G.s(r*.07),hm,at(1).toArray());
    [.16,.32,.48,.64].forEach(t=>{const p=at(t),q=at(t+.02).sub(p);const k=P(g,G.to(r*(.19-.12*t),r*.022),rg,p.toArray());k.lookAt(p.clone().add(q))})});
  const wm=m.plush(PAL.ivory);[[0,.92,.1,.22],[-.22,.85,.3,.18],[.22,.85,.3,.18],[-.12,.95,-.18,.2],[.16,.93,-.12,.19],[0,.78,.46,.15],[-.34,.72,.08,.16],[.34,.72,.08,.16]].forEach(([x,y,z,s])=>P(g,G.s(r*s),wm,[x*r,hy+y*r,z*r]));
  P(g,G.s(r*.07),m.gloss(PAL.rose),[0,hy-r*.2,surf(0,hy-r*.2)],null,[1.3,.9,.6]);
  mouthOn(g,c,surf,'smile',{y:hy-r*.38,w:.13});cheeksOn(g,c,surf);return H});

K('nashorn','Nashornkopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const gm=m.c('#BDB4DA',{gloss:.5,rim:.5}),hm=m.gloss(PAL.bone);
  const hs=es(0,hy+r*.05,0,r*.98,r*.9,r*.98),ss=es(0,hy-r*.3,r*.45,r*.62,r*.46,r*.6);const surf=mx(hs,ss);const fy=hy+r*.24;
  const H=face(c,{top:hy+r*.95,front:surf(EX*r,fy),faceY:fy,sideX:r*.98});
  ell(g,gm,0,hy+r*.05,0,r*.98,r*.9,r*.98);ell(g,gm,0,hy-r*.3,r*.45,r*.62,r*.46,r*.6);
  const horn=(pts,r1)=>{const p=pts.map(([y,z])=>[0,hy+y*r,z*r]);P(g,G.tu(p,r*r1,r*.03),hm);P(g,G.s(r*.03),hm,p[p.length-1])};
  horn([[-.08,.9],[.12,1.02],[.34,1.06],[.5,.98]],.18);horn([[.14,.68],[.3,.74],[.42,.72]],.1);
  both(x=>{const e=grp(g,[x*r*.62,hy+r*.72,-r*.1],[0,0,-x*.6]);P(e,G.puff(almond(r*.26,r*.36),r*.1),gm);P(e,G.puff(almond(r*.14,r*.24),r*.04),m.c(PAL.blush,{gloss:.4}),[0,r*.05,r*.06]);
    c.an(t=>{e.rotation.z=-x*(.6+Math.sin(t*2.1+x*2)*.1)});
    P(g,G.s(r*.05),m.c(PAL.plum),[x*r*.17,hy-r*.32,ss(x*r*.17,hy-r*.32)],[0,x*.3,0],[1,1.3,.4])});
  mouthOn(g,c,ss,'smile',{y:hy-r*.52,w:.14});cheeksOn(g,c,surf,{y:hy-r*.05,sp:.62});return H});

K('schnecke','Nacktschneckenkopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const sm=m.c('#F5CB5C',{gloss:1.3,rim:.9,rimColor:'#fffbe0'}),dk=m.c(PAL.choc,{gloss:.6});
  const cy=hy-r*.02,A=r*.96,B=r*.86,D=r*1.02;const surf=es(0,cy,0,A,B,D);const fy=hy+r*.06;
  const H=face(c,{top:cy+B,front:surf(EX*r,fy),faceY:fy,sideX:A});
  ell(g,sm,0,cy,0,A,B,D);
  both(x=>{const f=grp(g,[x*r*.3,hy+r*.66,r*.22]);P(f,G.tu([[0,-r*.05,0],[x*r*.06,r*.22,r*.05],[x*r*.14,r*.46,r*.04]],r*.08,r*.055),sm);P(f,G.s(r*.09),sm,[x*r*.14,r*.48,r*.04]);
    c.an(t=>{f.rotation.z=Math.sin(t*1.7+x)*.14*x;f.rotation.x=Math.sin(t*1.3+x*2)*.1});
    P(g,G.ca(r*.06,r*.1),sm,[x*r*.3,hy-r*.5,surf(x*r*.3,hy-r*.5)],[1.3,0,-x*.5])});
  [[.5,.6,-.4,.12],[-.45,.7,-.3,.1],[.1,.5,-.9,.13],[-.7,.2,-.55,.1],[.75,.1,-.5,.09]].forEach(([x,y,z,s])=>{const q=onE(0,cy,0,A,B,D,[x,y,z],-r*.012);face2(P(g,G.s(r*s),dk,[q.p.x,q.p.y,q.p.z],null,[1,1,.3]),q.n)});
  const dr=P(g,G.drop(r*.07,r*.1),m.c('#FFF1B8',{gloss:1.4,rim:1}),[r*.3,hy-r*.72,r*.62],[PI,0,0]);c.an(t=>{dr.scale.y=1+Math.sin(t*1.5)*.15});
  mouthOn(g,c,surf,'smile',{w:.14});cheeksOn(g,c,surf);return H});

K('qualle','Quallenschirm','tier',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.c('#FFB8E0',{gloss:1.2,rim:1.1,rimColor:'#ffffff'}),sp=m.c('#FFE3F3',{gloss:.8}),ar=m.gloss(PAL.lilac),tm=m.c(PAL.pink,{gloss:.8});
  const dR=r*1.16,dy0=-r*.18,dH=r*1.1;const Rat=(y)=>{const v=Math.min(1,Math.max(0,(y-hy-dy0)/dH));return dR*Math.cos(Math.asin(v))};
  const surf=(x,y)=>Math.sqrt(Math.max(0,Rat(y)**2-x*x));const fy=hy+r*.24;
  const H=face(c,{top:hy+dy0+dH,front:surf(EX*r,fy),faceY:fy,sideX:dR});
  const prof=[[0,-.24],[.6,-.28],[.98,-.34],[1.14,-.33],[1.19,-.25]].map(([a,b])=>[a*r,b*r]);range(Q(14),t=>{const th=t*PI/2;prof.push([Math.max(1e-4,dR*Math.cos(th)),dy0+dH*Math.sin(th)])});
  const bell=P(g,G.la(prof),bm,[0,hy,0]);
  const sc=merge(range(16,(t,i)=>{const a=i/16*TAU;return place(lowS(r*.12),new V3(Math.sin(a)*r*1.12,hy-r*.3,Math.cos(a)*r*1.12),null,[1,.8,1])}));P(g,sc,m.gloss('#FF9ED1'));
  [[.45,.8,.1,.13],[-.5,.72,.0,.11],[.05,.95,-.3,.12],[-.3,.55,-.75,.12],[.6,.5,-.6,.1]].forEach(([x,y,z,s])=>{const q=onE(0,hy+dy0,0,dR,dH,dR,[x,y,z],-r*.01);face2(P(g,G.s(r*s),sp,[q.p.x,q.p.y,q.p.z],null,[1,1,.3]),q.n)});
  const arms=range(4,(t,i)=>{const a=i/4*TAU+PI/4;const ag=grp(g,[Math.sin(a)*r*.3,hy-r*.3,Math.cos(a)*r*.3-r*.05]);
    P(ag,G.tu(range(6,u=>[Math.sin(u*7+i)*r*.07,-u*r*.62,Math.cos(u*6+i)*r*.05]),r*.1,r*.04),ar);return ag});
  const ten=range(6,(t,i)=>{const a=PI*.55+t*PI*.9;const tg=grp(g,[Math.sin(a)*r*1.05,hy-r*.32,Math.cos(a)*r*1.05]);P(tg,G.tu(range(7,u=>[Math.sin(u*8+i*2)*r*.06,-u*r*.8,0]),r*.045,r*.025),tm);return tg});
  c.an(t=>{const p=1+Math.sin(t*2.4)*.03;bell.scale.set(p,1/p,p);arms.forEach((a,i)=>{a.rotation.z=Math.sin(t*1.8+i)*.12});ten.forEach((a,i)=>{a.rotation.x=Math.sin(t*1.5+i*.7)*.15})});
  mouthOn(g,c,surf,'smile',{y:hy-r*.08,w:.14});cheeksOn(g,c,surf,{y:hy+r*.02,sp:.64});return H});

K('kaefer','Marienkäferhelm','tier',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin();const A=r*1.02,B=r*.98;const surf=es(0,hy,0,A,B,r);
  const H=face(c,{top:hy+r*1.16,front:surf(EX*r,hy),faceY:hy,sideX:A});
  ell(g,sk,0,hy,0,A,B,r);
  const cm=m.chitin(PAL.strawberry),im=m.c(PAL.ink,{gloss:.8});const ccy=hy+r*.14,ccz=-r*.12,CA=r*1.07,CB=r*1.02,CD=r*1.06;
  ell(g,cm,0,ccy,ccz,CA,CB,CD);
  P(g,G.tu(range(12,t=>{const b=1.12-t*2.9;return[0,ccy+Math.cos(b)*CB*1.005,ccz+Math.sin(b)*CD*1.005]}),r*.035,r*.035),im);
  [[.48,.72,.35,.15],[-.48,.72,.35,.15],[.8,.3,-.2,.13],[-.8,.3,-.2,.13],[.38,.55,-.75,.14],[-.38,.55,-.75,.14]].forEach(([x,y,z,s])=>{const q=onE(0,ccy,ccz,CA,CB,CD,[x,y,z],-r*.012);face2(P(g,G.s(r*s),im,[q.p.x,q.p.y,q.p.z],null,[1,1,.3]),q.n)});
  both(x=>{const a=grp(g,[x*r*.22,ccy+r*.9,r*.28],[0,0,-x*.35]);P(a,G.tu([[0,0,0],[0,r*.25,r*.06],[x*r*.08,r*.42,r*.02]],r*.03,r*.028),im);P(a,G.s(r*.07),im,[x*r*.08,r*.44,r*.02]);
    c.an(t=>{a.rotation.z=-x*(.35+Math.sin(t*2.6+x)*.1)})});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('vogel','Vogelkopf mit Schnabel','tier',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.plush('#6FB2F2'),lm=m.plush(PAL.ivory);
  const hs=es(0,hy,0,r*1.02,r*.98,r),cs=es(0,hy-r*.42,r*.3,r*.7,r*.5,r*.72);const surf=mx(hs,cs);const fy=hy+r*.1;
  const H=face(c,{top:hy+r*.98,front:surf(EX*r,fy),faceY:fy,sideX:r*1.02});
  ell(g,bm,0,hy,0,r*1.02,r*.98,r);ell(g,lm,0,hy-r*.42,r*.3,r*.7,r*.5,r*.72);
  const by=hy-r*.16,bz=surf(0,by);P(g,G.co(r*.16,r*.34),m.gloss(PAL.honey),[0,by,bz+r*.13],[PI/2,0,0],[1,1,.9]);P(g,G.co(r*.1,r*.2),m.gloss(PAL.orange),[0,by-r*.08,bz+r*.06],[PI/2+.3,0,0]);
  const cr=grp(g,[0,hy+r*.86,r*.1]);[-.45,0,.45].forEach((a,i)=>P(cr,G.puff(almond(r*.2,r*.44),r*.08),m.gloss(i===1?PAL.coral:PAL.strawberry),[a*r*.2,0,-i*r*.02],[-.2,0,-a]));
  c.an(t=>{cr.rotation.z=Math.sin(t*2.4)*.08});
  both(x=>P(g,G.puff(almond(r*.22,r*.36),r*.08),bm,[x*r*.95,hy-r*.12,-r*.15],[0,x*.5,-x*1.9]));
  cheeksOn(g,c,surf,{sp:.62});return H});

K('chamaeleon','Chamäleonkopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const cm=m.c('#7CCB63',{gloss:1,rim:.5,rimColor:'#f4ffd0'}),km=m.c('#5AB25A',{gloss:.9}),lm=m.gloss(PAL.lemon);
  const A=r*.96,B=r*.95,D=r*1.04;const surf=es(0,hy,r*.04,A,B,D);const fy=hy+r*.08;
  const H=face(c,{top:hy+r*.95,front:surf(EX*r,fy),faceY:fy,sideX:A});
  ell(g,cm,0,hy,r*.04,A,B,D);
  const cas=sshp([[-.72,-.12],[-.62,.28],[-.15,.5],[.42,.42],[.72,.02],[.3,-.16]].map(([a,b])=>[a*r,b*r]));P(g,G.puff(cas,r*.26),cm,[0,hy+r*.6,-r*.32],[0,PI/2,0]);
  range(4,(t,i)=>{const q=onE(0,hy+r*.55,-r*.3,r*.3,r*.5,r*.6,[0,.8,.3-t*1.2],0);P(g,G.s(r*.06),lm,[r*.11,q.p.y+r*.02,q.p.z],null,[.5,1,1]);P(g,G.s(r*.06),lm,[-r*.11,q.p.y+r*.02,q.p.z],null,[.5,1,1])});
  both(x=>{[[.9,-.15,.25,.14],[.95,.2,-.25,.11],[.75,-.4,-.4,.1]].forEach(([dx,dy,dz,s])=>{const q=onE(0,hy,r*.04,A,B,D,[x*dx,dy,dz],-r*.01);face2(P(g,G.s(r*s),lm,[q.p.x,q.p.y,q.p.z],null,[1.3,1,.3]),q.n)})});
  smileLine(g,c,surf,hy-r*.3,r*.52,r*.14,r*.028);
  c.an(t=>{cm.color.setHSL(.29+Math.sin(t*.35)*.07,.52,.58)});
  cheeksOn(g,c,surf,{sp:.6});return H});

K('kugelfisch','Kugelfisch','tier',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.gloss(PAL.lemon),lm=m.gloss(PAL.butter),sp=m.gloss(PAL.cream);
  const A=r*1.04,B=r*.98,D=r;const surf=mx(es(0,hy,0,A,B,D),es(0,hy-r*.36,r*.24,r*.8,r*.55,r*.8));const fy=hy+r*.06;
  const H=face(c,{top:hy+B,front:surf(EX*r,fy),faceY:fy,sideX:A});
  const b=grp(g,[0,hy,0]);ell(b,bm,0,0,0,A,B,D);ell(b,lm,0,-r*.36,r*.24,r*.8,r*.55,r*.8);
  const N=64,sg=[],dg=[];for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,rr=Math.sqrt(1-y*y),th=i*2.39996;const v=new V3(Math.cos(th)*rr,y,Math.sin(th)*rr);
    if(v.y<-.72)continue;if(v.z>.42&&v.y>-.62&&v.y<.62&&Math.abs(v.x)<.78)continue;const q=onE(0,0,0,A,B,D,[v.x,v.y,v.z],r*.08);
    const cg=new THREE.ConeGeometry(r*.075,r*.22,Q(8));const qq=new THREE.Quaternion().setFromUnitVectors(ZUP,q.n);const M4=new THREE.Matrix4().compose(q.p,qq,new V3(1,1,1));const nc=cg.toNonIndexed();cg.dispose();nc.applyMatrix4(M4);sg.push(nc);
    if(i%3===0&&v.y>.1&&v.z<.3){const d=onE(0,0,0,A,B,D,[v.x*.9+.1,v.y,v.z-.2],-r*.01);dg.push(place(lowS(r*.07),d.p,d.n,[1,1,.3]))}}
  P(b,merge(sg),sp);if(dg.length)P(b,merge(dg),m.c(PAL.honey));
  both(x=>{const f=grp(g,[x*A*.95,hy-r*.12,-r*.05],[0,x*.4,-x*1.7]);P(f,G.puff(almond(r*.24,r*.34),r*.07),m.gloss(PAL.orange));c.an(t=>{f.rotation.z=-x*(1.7+Math.sin(t*5+x)*.2)})});
  c.an(t=>{b.scale.setScalar(1+Math.sin(t*1.3)*.025)});
  const ly=hy-r*.3;P(g,G.to(r*.1,r*.05),m.gloss(PAL.rose),[0,ly,surf(0,ly)+r*.02]);
  cheeksOn(g,c,surf,{sp:.6});return H});

K('koralle','Korallenkopf','tier',(g,c)=>{const{hy,hr:r,m}=c;const cm=m.c(PAL.coral,{gloss:.6,rim:.6}),tm=m.gloss(PAL.peach);
  const A=r*1.04,B=r*.97;const surf=es(0,hy,0,A,B,r);const H=face(c,{top:hy+r*1.02,front:surf(EX*r,hy),faceY:hy,sideX:A});
  ell(g,cm,0,hy,0,A,B,r);
  const br=(pts,r1,r2)=>{const p=pts.map(([x,y,z])=>[x*r,hy+y*r,z*r]);P(g,G.tu(p,r*r1,r*r2),cm);P(g,G.s(r*r2*1.25),tm,p[p.length-1])};
  br([[-.35,.7,-.1],[-.5,1.05,-.12],[-.46,1.32,-.05]],.13,.1);br([[-.47,.98,-.12],[-.72,1.12,-.15],[-.8,1.28,-.12]],.1,.085);
  br([[.05,.8,-.25],[.02,1.15,-.3],[.1,1.42,-.25]],.14,.1);br([[.03,1.08,-.29],[.28,1.22,-.28],[.32,1.36,-.22]],.1,.085);
  br([[.45,.68,-.05],[.62,1.0,-.05],[.6,1.2,0]],.12,.1);br([[.6,.92,-.05],[.85,1.02,-.08],[.94,1.14,-.05]],.09,.08);
  const dg=[];const rnd=srand(31);for(let i=0;i<34;i++){const v=new V3(rnd()*2-1,rnd()*1.6-.6,rnd()*2-1);if(v.z>.2&&Math.abs(v.x)<.8&&v.y<.55)continue;const q=onE(0,hy,0,A,B,r,[v.x,v.y,v.z],-r*.015);dg.push(place(lowS(r*(.045+rnd()*.03)),q.p,q.n,[1,1,.5]))}
  P(g,merge(dg),tm);
  const fo=grp(g,[0,hy+r*1.05,-r*.1]);const fish=grp(fo,[r*.95,0,0]);ell(fish,m.gloss(PAL.lemon),0,0,0,r*.07,r*.11,r*.16);P(fish,G.co(r*.08,r*.12),m.gloss(PAL.orange),[0,0,-r*.2],[-PI/2,0,0],[.4,1,1]);
  c.an(t=>{fo.rotation.y=t*.9;fish.rotation.x=Math.sin(t*6)*.15});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

/* =====================================================================
   MASCHINELL
   ===================================================================== */
K('monitor','Flachbildschirm','masch',(g,c)=>{const{hy,hr:r,m}=c;const fm=m.gloss(PAL.lilac);
  const W=r*2.2,Hh=r*1.62,Dd=r*.6;P(g,G.bx(W,Hh,Dd,r*.26),fm,[0,hy,0]);
  P(g,G.bx(W*.88,Hh*.78,r*.12,r*.1),m.black(),[0,hy+r*.06,Dd/2-r*.02]);
  const tex=ctex('kopf-scr-mon',256,192,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#C9FAEA');gr.addColorStop(1,'#86DCEB');x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.22)';for(let y=0;y<h;y+=8)x.fillRect(0,y,w,3);x.fillStyle='#3E7F8C';const px=8,cx=w/2,cy=h*.8;[[-3,-1],[-2,0],[-1,0],[0,0],[1,0],[2,-1]].forEach(([a,b])=>x.fillRect(cx+a*px-px/2,cy+b*px,px,px));
    x.fillStyle='#FF9EC0';[[-6,-3],[5,-3]].forEach(([a,b])=>x.fillRect(cx+a*px-px/2,cy+b*px,px*2,px));x.fillStyle='rgba(255,255,255,.7)';x.fillRect(w*.08,h*.1,px,px*3);x.fillRect(w*.08+px*1.5,h*.1,px,px)});
  const sw=W*.82,sh=Hh*.7;P(g,rrPlane(sw,sh,r*.1),scrMat(tex),[0,hy+r*.06,Dd/2+r*.042]);const front=Dd/2+r*.045;
  P(g,G.bx(r*.6,r*.3,r*.42,r*.12),fm,[0,hy-Hh/2-r*.06,-r*.02]);
  const led=P(g,G.s(r*.04),m.glow(PAL.grass,1.5),[W*.34,hy-Hh*.42,Dd/2]);both(x=>P(g,G.s(r*.045),m.gloss(PAL.pink),[W*(x>0?.24:.29)+(x>0?0:0),hy-Hh*.42,Dd/2],null,[1,1,.5]));
  P(g,G.s(r*.05),m.black(),[0,hy+Hh*.44,Dd/2],null,[1,1,.5]);
  c.an(t=>{led.visible=(t%2)<1.6});
  return face(c,{top:hy+Hh/2,front,faceY:hy+r*.12,sideX:W/2})});

K('roehre','Röhrenfernseher','masch',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.gloss(PAL.apricot),cm=m.gloss(PAL.cream);
  const W=r*2.05,Hh=r*1.7,Dd=r*1.45,cy=hy+r*.05;P(g,G.bx(W,Hh,Dd,r*.38),bm,[0,cy,0]);
  const sy=hy+r*.14;P(g,G.bx(r*1.6,r*1.15,r*.2,r*.2),cm,[0,sy,Dd/2-r*.04]);
  const sA=r*.68,sB=r*.5,sD=r*.2,sz=Dd/2;const surf=es(0,sy,sz,sA,sB,sD);
  ell(g,m.c('#9EEBDC',{gloss:1.4,rim:.9,rimColor:'#ffffff'}),0,sy,sz,sA,sB,sD);
  P(g,G.ca(r*.03,r*.18),m.flat('#ffffff'),[-r*.42,sy+r*.26,surf(-r*.42,sy+r*.26)],[0,0,-.9]);P(g,G.s(r*.035),m.flat('#ffffff'),[-r*.26,sy+r*.36,surf(-r*.26,sy+r*.36)]);
  const ky=hy-r*.6;both(x=>{const k=P(g,G.cy(r*.1,r*.11,r*.1),m.gloss(PAL.cherry),[x*r*.3+r*.3,ky,Dd/2],[PI/2,0,0]);});
  range(3,(t,i)=>P(g,G.ca(r*.025,r*.24),m.c(PAL.choc),[-r*.52,ky+(t-.5)*r*.1,Dd/2],[0,0,PI/2]));
  const ant=grp(g,[0,cy+Hh/2,-r*.15]);P(ant,G.s(r*.14),cm,[0,0,0],null,[1,.6,1]);
  both(x=>{bt(ant,[0,r*.04,0],[x*r*.62,r*.9,-r*.1],r*.028,m.chrome());P(ant,G.s(r*.08),m.gloss(PAL.cherry),[x*r*.62,r*.9,-r*.1])});
  c.an(t=>{ant.rotation.z=Math.sin(t*1.5)*.06});
  both(x=>P(g,G.ca(r*.08,r*.12),m.c(PAL.choc),[x*r*.7,hy-r*.82,0],[PI/2,0,0]));
  return face(c,{top:cy+Hh/2,front:surf(EX*r,hy+r*.16),faceY:hy+r*.16,sideX:W/2})});

K('birne','Glühbirne','masch',(g,c)=>{const{hy,hr:r,m}=c;const gm=m.c('#FFF3B0',{gloss:1.3,rim:1.2,rimColor:'#ffffff',emissive:'#FFC94A',emissiveIntensity:.25});
  const R=r*.95,cy=hy+r*.26;const prof=[[0,hy-r*.62],[r*.42,hy-r*.62],[r*.44,hy-r*.48],[r*.52,hy-r*.42]];range(Q(16),t=>{const th=-.72+t*(PI/2+.72);prof.push([Math.max(1e-4,R*Math.cos(th)),cy+R*Math.sin(th)])});
  P(g,G.la(prof),gm);const surf=es(0,cy,0,R,R,R);const fy=hy+r*.2;
  const H=face(c,{top:cy+R,front:surf(EX*r,fy),faceY:fy,sideX:R});
  const st=m.steel();P(g,G.cy(r*.44,r*.4,r*.36),st,[0,hy-r*.7,0]);range(3,(t,i)=>P(g,G.to(r*.43,r*.045),st,[0,hy-r*.58-i*r*.12,0],[PI/2,0,0]));P(g,G.s(r*.2),m.black(),[0,hy-r*.88,0],null,[1,.6,1]);
  P(g,G.tu(range(6,t=>{const ph=2.2+t*.55;const q=onE(0,cy,0,R,R,R,[Math.cos(ph)*.75,Math.sin(ph)*.75,.62],r*.01).p;return[q.x,q.y,q.z]}),r*.05,r*.04),m.flat('#ffffff'));
  const rays=[-1.05,-.5,.5,1.05].map(a=>{const rg=grp(g,[0,cy,0],[0,0,a]);P(rg,G.ca(r*.05,r*.16),m.gloss(PAL.lemon),[0,R+r*.28,0]);return rg});
  c.an((t,w,a)=>{gm.emissiveIntensity=.22+Math.sin(t*3)*.06+(a||0)*.6;rays.forEach((rg,i)=>{const s=1+Math.sin(t*3+i)*.12+(a||0)*.5;rg.scale.set(1,s,1)})});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('kamerakopf','Kamerakopf','masch',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.gloss(PAL.coral),cm=m.gloss(PAL.cream);
  const W=r*2.1,Hh=r*1.46,Dd=r*1.24;P(g,G.bx(W,Hh,Dd,r*.34),bm,[0,hy,0]);P(g,G.bx(W*1.02,r*.36,Dd*1.02,r*.17),cm,[0,hy+Hh/2-r*.16,0]);
  const fz=Dd/2,ly=hy-r*.34;
  P(g,G.cy(r*.34,r*.36,r*.2),m.black(),[0,ly,fz+r*.06],[PI/2,0,0]);P(g,G.to(r*.3,r*.055),m.chrome(),[0,ly,fz+r*.16]);
  P(g,G.s(r*.25),m.c(PAL.navy,{gloss:1.5,rim:.8,rimColor:'#b8d8ff'}),[0,ly,fz+r*.15],null,[1,1,.5]);P(g,G.to(r*.13,r*.03),m.c(PAL.lilac),[0,ly,fz+r*.26]);
  P(g,G.s(r*.06),m.flat('#ffffff'),[r*.08,ly+r*.09,fz+r*.28]);P(g,G.s(r*.03),m.flat('#ffffff'),[-r*.08,ly-r*.08,fz+r*.27]);
  const fl=grp(g,[-r*.55,hy+Hh/2+r*.1,0]);P(fl,G.bx(r*.5,r*.28,r*.34,r*.1),cm);P(fl,G.bx(r*.4,r*.18,r*.02,r*.05),m.glow(PAL.lemon,1.2),[0,0,r*.17]);
  P(g,G.cy(r*.1,r*.1,r*.1),m.gloss(PAL.cherry),[r*.6,hy+Hh/2+r*.04,r*.1]);P(g,G.cy(r*.16,r*.16,r*.08),m.chrome(),[r*.2,hy+Hh/2+r*.03,-r*.15]);
  both(x=>P(g,G.to(r*.08,r*.03),m.chrome(),[x*W/2,hy+r*.35,0],[0,PI/2,0]));
  const rec=P(g,G.s(r*.045),m.glow('#FF4A5A',1.6),[r*.78,hy+r*.3,fz]);c.an(t=>{rec.visible=(t%1.4)<.9;fl.children[1].visible=(t%4)>.12});
  return face(c,{top:hy+Hh/2,front:fz+r*.005,faceY:hy+r*.18,sideX:W/2})});

K('schuessel','Satellitenschüssel','masch',(g,c)=>{const{hy,hr:r,m}=c;const wm=m.gloss(PAL.white),sm=m.gloss(PAL.sky);
  const cy=hy-r*.05,A=r*1.0,B=r*.9,D=r*.95;const surf=es(0,cy,0,A,B,D);const fy=hy+r*.04;
  const H=face(c,{top:cy+B,front:surf(EX*r,fy),faceY:fy,sideX:A});
  ell(g,wm,0,cy,0,A,B,D);P(g,G.to(r*.9,r*.08),sm,[0,hy-r*.45,0],[PI/2,0,0],[1,.95,1]);
  both(x=>P(g,G.cy(r*.18,r*.18,r*.12),sm,[x*r*.98,hy,0],[0,0,PI/2]));
  const dg=grp(g,[0,cy+B-r*.02,-r*.35]);P(dg,G.cy(r*.1,r*.14,r*.3),sm,[0,r*.1,0]);
  const dish=grp(dg,[0,r*.28,0],[-.3,0,-.42]);const Rm=r*.78,Dp=r*.3,th=r*.06;const pr=[[0,-th]];for(let i=1;i<=8;i++){const u=i/8;pr.push([Rm*u,Dp*u*u-th])}pr.push([Rm+th*.4,Dp]);for(let i=8;i>=0;i--){const u=i/8;pr.push([Math.max(1e-4,Rm*u),Dp*u*u])}
  P(dish,G.la(pr),m.gloss(PAL.ivory));P(dish,G.to(Rm,r*.045),sm,[0,Dp,0],[PI/2,0,0]);bt(dish,[0,0,0],[0,r*.6,0],r*.03,m.black());const tip=P(dish,G.s(r*.08),m.glow(PAL.coral,1.4),[0,r*.62,0]);
  c.an(t=>{dg.rotation.y=Math.sin(t*.5)*.6;tip.visible=(t%1.2)<.8});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('gasmaske','Gasmaske','masch',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin(),mm=m.gloss(PAL.teal),im=m.black();
  ell(g,sk,0,hy,0,r*1.02,r*.98,r);const mcy=hy,mcz=r*.16,MA=r*.98,MB=r*.92,MD=r*.84;const ms=es(0,mcy,mcz,MA,MB,MD);
  ell(g,mm,0,mcy,mcz,MA,MB,MD);const fy=hy+r*.1;const zf=Math.max(ms(EX*r,fy),ez(r*1.02,r*.98,r,EX*r,fy-hy));
  both(x=>{P(g,G.to(r*.25,r*.075),im,[x*EX*r,fy,zf+r*.01],[0,x*.32,0]);P(g,G.s(r*.24),m.glass('#D8FAFF'),[x*EX*r,fy,zf+r*.02],[0,x*.32,0],[1,1,.55])});
  const H=face(c,{top:hy+r*.98,front:zf,faceY:fy,sideX:r*1.02});
  const ly=hy-r*.42,lz=ms(0,ly);const fg=grp(g,[0,ly,lz],[.38,0,0]);P(fg,G.cy(r*.22,r*.22,r*.34),m.gloss(PAL.honey),[0,0,r*.14],[PI/2,0,0]);
  both(x=>P(fg,G.to(r*.225,r*.035),im,[0,0,r*.14+x*r*.09]));P(fg,G.cy(r*.18,r*.18,r*.04),m.gloss(PAL.cream),[0,0,r*.32],[PI/2,0,0]);
  const hg=merge([[0,0],[.08,0],[-.08,0],[0,.08],[0,-.08]].map(([a,b])=>place(lowS(r*.032),new V3(a*r,b*r,r*.34),null,[1,1,.5])));P(fg,hg,im);
  both(x=>{const vy=hy-r*.26,vx=x*r*.66;const v=P(g,G.cy(r*.12,r*.12,r*.1),m.gloss(PAL.cream),[vx,vy,ms(vx,vy)]);v.lookAt(vx*3,vy,ms(vx,vy)*1.6);v.rotateX(PI/2)});
  P(g,G.to(r*1.0,r*.06,PI),im,[0,hy+r*.12,0],[-PI/2,0,0],[1.03,1,1]);
  return H});

K('taucherhelm','Taucherhelm','masch',(g,c)=>{const{hy,hr:r,m}=c;const cu=m.copper(),br=m.gold(),sk=m.skin();
  const R=r*1.08,cy=hy+r*.02;P(g,G.s(R),cu,[0,cy,0]);
  const pa=r*.6,pb=r*.55,pd=r*.5,pz=r*.72;const surf=es(0,cy,pz,pa,pb,pd);ell(g,sk,0,cy,pz,pa,pb,pd);
  const fy=hy+r*.1;const H=face(c,{top:cy+R,front:surf(EX*r,fy),faceY:fy,sideX:R});
  const rz=Math.sqrt(R*R-(r*.62)**2);P(g,G.to(r*.62,r*.1),br,[0,cy,rz]);P(g,G.s(r*.6),m.glass('#E4F6FF'),[0,cy,rz+r*.06],null,[1,1,.52]);
  P(g,merge(range(8,(t,i)=>{const a=i/8*TAU+PI/8;return place(lowS(r*.05),new V3(Math.cos(a)*r*.78,cy+Math.sin(a)*r*.78,Math.sqrt(R*R-(r*.78)**2)+r*.02),null,1)})),br);
  both(x=>{const pg=grp(g,[x*R*.93,cy+r*.05,-r*.1],[0,x*PI/2,0]);P(pg,G.to(r*.22,r*.065),br);P(pg,G.circ(r*.2),m.glass('#CFEFFF'),[0,0,r*.01])});
  P(g,G.cy(r*.12,r*.14,r*.14),br,[0,cy+R,0]);P(g,G.s(r*.08),br,[0,cy+R+r*.1,0]);
  P(g,G.cy(r*.82,r*.95,r*.24),cu,[0,hy-r*.95,0]);P(g,G.to(r*.9,r*.07),br,[0,hy-r*.86,0],[PI/2,0,0]);
  mouthOn(g,c,surf,'smile',{y:hy-r*.24,w:.12});cheeksOn(g,c,surf,{sp:.42,y:hy-r*.1});return H});

K('raumhelm','Raumhelm','masch',(g,c)=>{const{hy,hr:r,m}=c;const wm=m.gloss(PAL.white),sk=m.skin(),am=m.gloss(PAL.coral);
  const R=r*1.1,cy=hy+r*.02;P(g,G.s(R),wm,[0,cy,0]);
  const pa=r*.7,pb=r*.58,pd=r*.46,pz=r*.72;const surf=es(0,cy,pz,pa,pb,pd);ell(g,sk,0,cy,pz,pa,pb,pd);
  const fy=hy+r*.08;const H=face(c,{top:cy+R,front:surf(EX*r,fy),faceY:fy,sideX:R*1.05});
  P(g,G.to(r*.64,r*.09),am,[0,cy,r*.84],null,[1.14,.96,1]);P(g,G.s(r*.66),m.glass('#E8F4FF'),[0,cy,r*.9],null,[1.1,.92,.5]);
  both(x=>{P(g,G.cy(r*.26,r*.26,r*.2),am,[x*R*.97,cy,0],[0,0,PI/2]);P(g,G.s(r*.08),m.glow(PAL.mint,1.4),[x*(R*.97+r*.1),cy,0])});
  const an=grp(g,[R*.97,cy+r*.18,-r*.05]);bt(an,[0,0,0],[r*.08,r*.55,0],r*.03,m.steel());const ab=P(an,G.s(r*.08),m.glow(PAL.lemon,1.4),[r*.08,r*.58,0]);
  c.an(t=>{ab.visible=(t%1.6)<1.1;an.rotation.z=Math.sin(t*2)*.08});
  const sp=onE(0,cy,0,R,R,R,[0,.72,.7],0);face2(P(g,G.star(r*.14,r*.065,5,r*.06),m.gloss(PAL.lemon),[sp.p.x,sp.p.y,sp.p.z]),sp.n);
  P(g,G.to(r*.78,r*.13),m.gloss(PAL.sky),[0,hy-r*.95,0],[PI/2,0,0]);
  mouthOn(g,c,surf,'smile',{y:hy-r*.26,w:.12});cheeksOn(g,c,surf,{sp:.44,y:hy-r*.12});return H});

K('vrbrille','VR-Brille','masch',(g,c)=>{const{hy,hr:r,m}=c;const sk=m.skin();const A=r*1.03,B=r*.98;const surf=es(0,hy,0,A,B,r);
  ell(g,sk,0,hy,0,A,B,r);const fy=hy+r*.12,vm=m.gloss(PAL.lavender),sm=m.gloss(PAL.lilac);
  P(g,G.bx(r*1.62,r*.74,r*.52,r*.24),vm,[0,fy,r*.84]);P(g,G.bx(r*1.44,r*.56,r*.08,r*.06),m.black(),[0,fy,r*1.1]);
  const tex=ctex('kopf-scr-vr',256,96,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#BFE9FF');gr.addColorStop(1,'#E2CCFF');x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<5;i++){x.beginPath();x.arc(20+i*55,h*.3+(i%2)*30,6,0,TAU);x.fill()}});
  P(g,rrPlane(r*1.34,r*.46,r*.1),scrMat(tex),[0,fy,r*1.145]);const front=r*1.15;
  P(g,G.to(r*1.0,r*.07,PI),sm,[0,fy,0],[-PI/2,0,0],[1.04,1,1]);P(g,G.to(r*.98,r*.065,PI*.62),sm,[0,hy,-r*.05],[0,PI/2,PI*.25]);
  const lg=range(3,(t,i)=>P(g,G.s(r*.035),m.glow(i===1?PAL.pink:PAL.mint,1.4),[(t-.5)*r*.3,fy+r*.37,r*.95]));
  both(x=>P(g,G.cy(r*.1,r*.1,r*.08),m.black(),[x*r*.8,fy,r*.84],[0,0,PI/2]));
  c.an(t=>{lg.forEach((l,i)=>{l.visible=Math.sin(t*3+i*2)>-.3})});
  const H=face(c,{top:hy+B,front,faceY:fy,sideX:A});
  mouthOn(g,c,surf,'smile',{y:hy-r*.5,w:.15});cheeksOn(g,c,surf,{y:hy-r*.36,sp:.6});return H});

K('lautsprecher','Lautsprecherbox','masch',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.gloss(PAL.grape),cm=m.gloss(PAL.cream);
  const W=r*1.8,Hh=r*2.0,Dd=r*1.3,cy=hy+r*.15;P(g,G.bx(W,Hh,Dd,r*.34),bm,[0,cy,0]);
  const py=hy+r*.55;P(g,G.bx(r*1.5,r*.72,r*.12,r*.14),cm,[0,py,Dd/2]);const front=Dd/2+r*.06;
  const wy=hy-r*.38,wz=Dd/2;P(g,G.to(r*.5,r*.08),m.chrome(),[0,wy,wz]);
  const cone=grp(g,[0,wy,wz]);P(cone,G.la([[r*.01,-r*.02],[r*.45,-r*.02],[r*.45,r*.02],[r*.2,-r*.08],[r*.01,-r*.09]]),m.black(),[0,0,0],[PI/2,0,0]);
  const cap=P(cone,G.s(r*.16),m.gloss(PAL.lemon),[0,0,-r*.02],null,[1,1,.55]);
  both(x=>P(g,G.s(r*.05),m.chrome(),[x*r*.7,cy+Hh/2-r*.22,Dd/2-r*.02],null,[1,1,.5]));
  const notes=range(2,(t,i)=>{const n=grp(g,[(i?-1:1)*r*1.12,hy+r*.3,r*.1]);const nm=m.gloss(i?PAL.pink:PAL.lemon);P(n,G.s(r*.1),nm,[0,0,0],[0,0,.4],[1.25,.9,.7]);P(n,G.ca(r*.025,r*.3),nm,[r*.1,r*.2,0]);
    P(n,G.puff(almond(r*.1,r*.2),r*.04),nm,[r*.1,r*.36,0],[0,0,-2.2]);return n});
  c.an((t,w,a)=>{const b=Math.max(0,Math.sin(t*9))*(1+(a||0));cone.position.z=wz+b*r*.04;cap.scale.set(1+b*.08,1+b*.08,.55);
    notes.forEach((n,i)=>{const u=(t*.4+i*.5)%1;n.position.y=hy+r*(.0+u*.9);n.rotation.z=Math.sin(t*2+i)*.2;n.scale.setScalar(Math.sin(u*PI)*.9+.1)})});
  return face(c,{top:cy+Hh/2,front,faceY:py,sideX:W/2})});

K('ventilator','Ventilator','masch',(g,c)=>{const{hy,hr:r,m}=c;const cm=m.gloss(PAL.sky),hm=m.gloss(PAL.lemon);
  P(g,G.to(r*1.0,r*.08),cm,[0,hy,0]);P(g,G.s(r*.5),cm,[0,hy,-r*.42],null,[1,1,.8]);
  P(g,G.to(r*.7,r*.025),cm,[0,hy,-r*.1]);P(g,G.to(r*.42,r*.025),cm,[0,hy,-r*.18]);
  range(8,(t,i)=>{const a=i/8*TAU;bt(g,[Math.cos(a)*r*.2,hy+Math.sin(a)*r*.2,-r*.2],[Math.cos(a)*r*.98,hy+Math.sin(a)*r*.98,0],r*.02,cm)});
  const rot=grp(g,[0,hy,r*.04]);range(4,(t,i)=>{const bl=grp(rot,[0,0,0],[0,0,i*PI/2]);P(bl,G.puff(petal(r*.62,r*.82),r*.05),m.gloss(PAL.white),[0,r*.1,0],[0,.35,0])});
  c.an((t,w,a)=>{rot.rotation.z=-t*(6+(a||0)*10)});
  const hA=r*.64,hD=r*.26,hz=r*.24;const surf=es(0,hy,hz,hA,hA,hD);ell(g,hm,0,hy,hz,hA,hA,hD);
  P(g,G.to(hA*.98,r*.04),m.c(PAL.honey),[0,hy,hz]);
  const fy=hy+r*.1;const H=face(c,{top:hy+r*1.08,front:surf(EX*r,fy),faceY:fy,sideX:r*1.08});
  mouthOn(g,c,surf,'smile',{y:hy-r*.22,w:.13});cheeksOn(g,c,surf,{sp:.48,y:hy-r*.12});return H});

K('waschmaschine','Waschmaschine','masch',(g,c)=>{const{hy,hr:r,m}=c;const wm=m.gloss(PAL.white);
  const W=r*2.0,Hh=r*2.1,Dd=r*1.6,cy=hy+r*.1;P(g,G.bx(W,Hh,Dd,r*.34),wm,[0,cy,0]);
  const py=hy+r*.66;P(g,G.bx(r*1.76,r*.62,r*.1,r*.16),m.gloss(PAL.sky),[0,py,Dd/2]);const front=Dd/2+r*.05;
  P(g,G.cy(r*.12,r*.12,r*.1),m.gloss(PAL.coral),[r*.72,py,front],[PI/2,0,0]);P(g,G.bx(r*.03,r*.1,r*.03,r*.01),m.white(),[r*.72,py+r*.05,front+r*.05]);
  const dy=hy-r*.36,dz=Dd/2;P(g,G.to(r*.52,r*.09),m.steel(),[0,dy,dz+r*.02]);
  const tex=ctex('kopf-wasser',128,128,(x,w,h)=>{x.fillStyle='#8FD3FF';x.fillRect(0,0,w,h);x.fillStyle='#BDE8FF';x.beginPath();x.moveTo(0,h*.45);for(let u=0;u<=w;u+=8)x.lineTo(u,h*.45+Math.sin(u*.12)*6);x.lineTo(w,0);x.lineTo(0,0);x.fill();
    x.fillStyle='rgba(255,255,255,.85)';[[30,80,8],[70,95,6],[95,70,9],[50,60,5]].forEach(([a,b,s])=>{x.beginPath();x.arc(a,b,s,0,TAU);x.fill()})});
  const dr=P(g,G.circ(r*.46),scrMat(tex),[0,dy,dz+r*.005]);
  const sock=grp(g,[0,dy,dz+r*.03]);P(sock,G.ca(r*.07,r*.18),m.gloss(PAL.strawberry),[r*.2,0,0],[0,0,.8]);P(sock,G.s(r*.08),m.gloss(PAL.lemon),[-r*.18,-r*.08,0],null,[1,1,.5]);
  P(g,G.s(r*.46),m.glass('#E6F7FF'),[0,dy,dz+r*.02],null,[1,1,.3]);
  c.an((t,w,a)=>{const s=t*(1.6+(a||0)*5);sock.rotation.z=-s;dr.rotation.z=-s*.5});
  both(x=>P(g,G.s(r*.05),m.gloss(x>0?PAL.mint:PAL.lemon),[-r*.55+x*r*.1,py,front],null,[1,1,.5]));
  return face(c,{top:cy+Hh/2,front,faceY:py,sideX:W/2})});

K('mikrowelle','Mikrowelle','masch',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.gloss(PAL.pink);
  const W=r*2.3,Hh=r*1.5,Dd=r*1.4;P(g,G.bx(W,Hh,Dd,r*.3),bm,[0,hy,0]);
  const wx=-r*.16,ww=r*1.48,wh=r*.98,fz=Dd/2;P(g,G.bx(ww+r*.14,wh+r*.14,r*.08,r*.1),m.gloss(PAL.ivory),[wx,hy,fz]);
  const tex=ctex('kopf-mw',256,176,(x,w,h)=>{const gr=x.createRadialGradient(w*.5,h*.55,10,w*.5,h*.5,w*.6);gr.addColorStop(0,'#FFF2B0');gr.addColorStop(.6,'#FFC766');gr.addColorStop(1,'#FF9E45');x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=6;x.beginPath();x.ellipse(w*.5,h*.86,w*.34,h*.08,0,0,TAU);x.stroke()});
  const win=scrMat(tex);P(g,rrPlane(ww,wh,r*.12),win,[wx,hy,fz+r*.042]);const front=fz+r*.045;
  const px=r*.86;P(g,G.bx(r*.36,r*.14,r*.04,r*.04),m.glow(PAL.mint,1),[px,hy+r*.46,fz]);
  P(g,merge(range(6,(t,i)=>place(lowS(r*.055),new V3(px+((i%2)-.5)*r*.18,hy+r*.2-Math.floor(i/2)*r*.17,fz),null,[1,1,.5]))),m.gloss(PAL.ivory));
  P(g,G.cy(r*.1,r*.1,r*.08),m.gloss(PAL.berry),[px,hy-r*.44,fz],[PI/2,0,0]);
  both(x=>P(g,G.s(r*.08),m.black(),[x*r*.85,hy-Hh/2,r*.3],null,[1,.6,1]));
  c.an((t,w,a)=>{win.color.setScalar(.92+Math.sin(t*3)*.08+(a||0)*.1)});
  return face(c,{top:hy+Hh/2,front,faceY:hy+r*.06,sideX:W/2})});

K('ampel','Ampel','masch',(g,c)=>{const{hy,hr:r,m}=c;const hm=m.gloss(PAL.lemon);
  const W=r*1.5,Hh=r*2.6,Dd=r*1.0,cy=hy+r*.4;P(g,G.bx(W,Hh,Dd,r*.42),hm,[0,cy,0]);const fz=Dd/2;
  const cols=[PAL.strawberry,PAL.orange,PAL.grass],dim=['#B84A5E','#C98A4A','#6B9E58'];
  const L=cols.map((col,i)=>{const y=hy+r*(1.36-i*.46);P(g,G.cy(r*.2,r*.2,r*.06),m.black(),[0,y,fz],[PI/2,0,0]);P(g,G.to(r*.2,r*.05,PI),m.black(),[0,y,fz+r*.04],[0,0,0]);
    return P(g,G.s(r*.16),m.c(dim[i],{gloss:1}),[0,y,fz+r*.03],null,[1,1,.6])});
  c.an((t,w,a)=>{const k=a>.1?2:Math.floor(t/1.6)%3;L.forEach((l,i)=>{l.material=i===k?m.glow(cols[i],1.3):m.c(dim[i],{gloss:1})})});
  const fy=hy-r*.18;
  const H=face(c,{top:cy+Hh/2,front:fz+r*.005,faceY:fy,sideX:W/2});
  const flat=()=>fz+r*.002;mouthOn(g,c,flat,'smile',{y:hy-r*.56,w:.14});cheeksOn(g,c,flat,{y:hy-r*.44,sp:.5});
  return H});

K('router','WLAN-Router','masch',(g,c)=>{const{hy,hr:r,m}=c;const wm=m.gloss(PAL.white),lm=m.gloss(PAL.lilac);
  const W=r*2.1,Hh=r*1.3,Dd=r*1.5;P(g,G.bx(W,Hh,Dd,r*.36),wm,[0,hy,0]);P(g,G.bx(W*1.02,r*.3,Dd*1.02,r*.14),lm,[0,hy+Hh/2-r*.1,0]);const fz=Dd/2;
  const ants=[-1,0,1].map((x,i)=>{const a=grp(g,[x*r*.62,hy+Hh/2,-r*.5],[0,0,-x*.28]);P(a,G.ca(r*.07,r*.7),m.gloss(PAL.ivory),[0,r*.42,0]);P(a,G.s(r*.1),m.gloss(i===1?PAL.coral:PAL.sky),[0,r*.86,0]);return a});
  const wv=grp(g,[0,hy+Hh/2+r*1.12,-r*.5]);const arcs=range(3,(t,i)=>P(wv,G.to(r*(.14+i*.13),r*.035,PI*.5),m.gloss(PAL.sky),[0,0,0],[0,0,PI*.25]));
  const leds=range(5,(t,i)=>P(g,G.s(r*.035),m.glow(i===4?PAL.orange:PAL.grass,1.4),[(t-.5)*r*.8,hy+Hh/2-r*.1,fz+r*.02]));
  c.an((t,w,a)=>{const k=Math.floor(t*3)%4;arcs.forEach((ar,i)=>{ar.visible=i<k});leds.forEach((l,i)=>{l.visible=Math.sin(t*7+i*1.9)>-.4});ants.forEach((an,i)=>{an.rotation.z=-(i-1)*.28+Math.sin(t*2+i)*.04})});
  const fy=hy+r*.04;const H=face(c,{top:hy+Hh/2,front:fz+r*.005,faceY:fy,sideX:W/2});
  const flat=()=>fz;mouthOn(g,c,flat,'smile',{y:hy-r*.36,w:.14});cheeksOn(g,c,flat,{sp:.62,y:hy-r*.24});return H});

/* =====================================================================
   OBJEKTE
   ===================================================================== */
K('toaster','Toaster','ding',(g,c)=>{const{hy,hr:r,m}=c;const bm=m.gloss(PAL.mint);
  const W=r*1.95,Hh=r*1.4,Dd=r*1.24,cy=hy-r*.05;P(g,G.bx(W,Hh,Dd,r*.5),bm,[0,cy,0]);P(g,G.bx(W*.7,r*.1,r*.06,r*.03),m.gloss(PAL.cream),[0,cy-Hh*.36,Dd/2]);
  const top=cy+Hh/2;both(x=>P(g,G.bx(r*.3,r*.1,r*.86,r*.05),m.black(),[x*r*.36,top-r*.03,0]));
  const ts=new THREE.Shape();ts.moveTo(-r*.36,0);ts.lineTo(r*.36,0);ts.lineTo(r*.36,r*.55);ts.absarc(r*.2,r*.62,r*.18,-.3,PI*.9,false);ts.absarc(-r*.2,r*.62,r*.18,PI*.1,PI+.3,false);ts.lineTo(-r*.36,0);
  const toast=[-1,1].map(x=>{const tg=grp(g,[x*r*.36,top-r*.42,0],[0,PI/2,0]);P(tg,G.puff(ts,r*.12,r*.04),m.c(PAL.oak,{gloss:.3}));P(tg,G.puff(ts,r*.13,r*.02),m.c(PAL.butter),[0,r*.04,0],null,[.82,.84,1]);return tg});
  c.an((t,w,a)=>{const u=(t%4)<.5?Math.sin((t%4)/.5*PI):0;const p=Math.max(u,a||0);toast.forEach((k,i)=>k.position.y=top-r*.42+r*.12+p*r*.35)});
  P(g,G.bx(r*.12,r*.3,r*.2,r*.05),m.black(),[W/2+r*.02,cy+r*.1,r*.1]);P(g,G.s(r*.1),m.gloss(PAL.coral),[W/2+r*.1,cy+r*.24,r*.1]);
  both(x=>both(z=>P(g,G.s(r*.08),m.black(),[x*r*.7,cy-Hh/2,z*r*.4],null,[1,.6,1])));
  const fz=Dd/2;const fy=hy+r*.08;const H=face(c,{top:top+r*.42,front:fz+r*.005,faceY:fy,sideX:W/2});
  const flat=()=>fz;mouthOn(g,c,flat,'smile',{y:hy-r*.3});cheeksOn(g,c,flat,{sp:.6,y:hy-r*.18});return H});

K('disco','Discokugel','ding',(g,c)=>{const{hy,hr:r,m}=c;const R=r*1.02;
  const tex=ctex('kopf-disco',512,256,(x,w,h)=>{const rnd=srand(17);const cols=['#E9E6F5','#C9C3E0','#FFFFFF','#D8CCFF','#BDE6FF','#FFD6EC','#A9A3C4'];const nx=32,ny=16,cw=w/nx,ch=h/ny;
    x.fillStyle='#7E7898';x.fillRect(0,0,w,h);for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){x.fillStyle=cols[Math.floor(rnd()*cols.length)];x.fillRect(i*cw+1.5,j*ch+1.5,cw-3,ch-3);if(rnd()<.12){x.fillStyle='#ffffff';x.fillRect(i*cw+3,j*ch+3,cw*.4,ch*.4)}}});
  const ball=P(g,G.s(R),m.tex('kopf-disco',tex,{gloss:1.4,rim:1,rimColor:'#ffffff'}),[0,hy,0]);const surf=es(0,hy,0,R,R,R);
  const H=face(c,{top:hy+R,front:surf(EX*r,hy),faceY:hy,sideX:R});
  P(g,G.cy(r*.16,r*.2,r*.14),m.chrome(),[0,hy+R,0]);P(g,G.to(r*.08,r*.03),m.chrome(),[0,hy+R+r*.14,0]);
  const spk=[[1.2,.6,.3],[-1.15,.3,.4],[.9,-.7,.5],[-.6,1.0,.2]].map(([x,y,z],i)=>P(g,G.star(r*.12,r*.04,4,r*.03),m.flat(i%2?'#FFF6B8':'#FFFFFF'),[x*r,hy+y*r,z*r]));
  c.an(t=>{ball.rotation.y=t*.6;spk.forEach((s,i)=>{s.scale.setScalar(.4+Math.abs(Math.sin(t*2.2+i*1.7))*.8);s.rotation.z=t*.8+i})});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('globus','Globus','ding',(g,c)=>{const{hy,hr:r,m}=c;const R=r*.98;
  const tex=ctex('kopf-globe',512,256,(x,w,h)=>{x.fillStyle='#6AA8F0';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.18)';for(let y=12;y<h;y+=26)x.fillRect(0,y,w,4);
    const rnd=srand(5);x.fillStyle='#8FD36B';x.strokeStyle='#5E9B4A';x.lineWidth=5;
    for(let i=0;i<11;i++){const cx=rnd()*w,cy=h*.22+rnd()*h*.56,s=14+rnd()*22;x.beginPath();for(let k=0;k<=14;k++){const a=k/14*TAU,rr=s*(.7+.35*Math.sin(a*3+i));x.lineTo(cx+Math.cos(a)*rr*1.4,cy+Math.sin(a)*rr*.8)}x.closePath();x.stroke();x.fill()}
    x.fillStyle='#FFFDF7';x.fillRect(0,0,w,h*.07);x.fillRect(0,h*.93,w,h*.07)});
  const gg=grp(g,[0,hy,0],[0,0,.35]);const gl=P(gg,G.s(R),m.tex('kopf-globe',tex,{gloss:1,rim:.5}),[0,0,0]);
  const surf=es(0,hy,0,R,R,R);const H=face(c,{top:hy+R*1.1,front:surf(EX*r,hy),faceY:hy,sideX:R});
  P(gg,G.to(R*1.14,r*.06,PI),m.gloss(PAL.honey),[0,0,-r*.1],[0,-.5,-PI/2]);both(y=>P(gg,G.s(r*.08),m.gloss(PAL.honey),[0,y*R*1.14,-r*.1]));
  c.an(t=>{gl.rotation.y=t*.4});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('uhr','Tick-Tack-Wecker','ding',(g,c)=>{const{hy,hr:r,m}=c;const cm=m.gloss(PAL.strawberry);
  P(g,G.cy(r,r,r*.62),cm,[0,hy,0],[PI/2,0,0]);P(g,G.to(r*.9,r*.1),m.gold(),[0,hy,r*.3]);const dz=r*.31;
  P(g,G.cy(r*.86,r*.86,r*.05),m.c(PAL.cream,{gloss:.4}),[0,hy,dz],[PI/2,0,0]);const front=dz+r*.03;
  P(g,merge(range(12,(t,i)=>{const a=i/12*TAU;const big=i%3===0;return place(lowS(r*(big?.055:.035)),new V3(Math.sin(a)*r*.7,hy+Math.cos(a)*r*.7,front),null,[1,1,.4])})),m.c(PAL.ink));
  const py=hy-r*.1;const hh=grp(g,[0,py,front+r*.01]),mh=grp(g,[0,py,front+r*.03]);P(hh,G.bx(r*.08,r*.32,r*.03,r*.02),m.c(PAL.ink),[0,r*.13,0]);P(mh,G.bx(r*.055,r*.48,r*.03,r*.02),m.c(PAL.ink),[0,r*.2,0]);
  P(g,G.s(r*.07),m.gold(),[0,py,front+r*.04],null,[1,1,.6]);
  const bells=[];both(x=>{const b=grp(g,[x*r*.58,hy+r*.9,0],[0,0,-x*.55]);P(b,G.hs(r*.3),m.gold(),[0,0,0]);P(b,G.cy(r*.3,r*.3,r*.04),m.gold(),[0,0,0]);P(b,G.s(r*.06),m.gold(),[0,r*.32,0]);bells.push([b,x])});
  P(g,G.bx(r*.12,r*.18,r*.12,r*.04),m.gold(),[0,hy+r*1.06,0]);
  c.an((t,w,a)=>{mh.rotation.z=-t*1.1;hh.rotation.z=-t*.09-1.2;const k=(a||0)>.1?1:0;bells.forEach(([b,x])=>{b.rotation.z=-x*.55+k*Math.sin(t*40)*.12})});
  both(x=>P(g,G.s(r*.12),m.gold(),[x*r*.6,hy-r*.86,0],null,[1,.7,1]));
  const flat=()=>front;const H=face(c,{top:hy+r*1.02,front,faceY:hy+r*.3,sideX:r});
  cheeksOn(g,c,flat,{sp:.52,y:hy+r*.02});return H});

K('kristall','Kristallkopf','ding',(g,c)=>{const{hy,hr:r,m}=c;const km=m.c(PAL.lilac,{gloss:1.3,rim:1,rimColor:'#ffffff'});
  const prof=[[0,-1.0],[.6,-.78],[1.05,-.25],[1.05,.45],[.7,.98],[0,1.15]];const Ry=(y)=>{const v=(y-hy)/r;for(let i=1;i<prof.length;i++){if(v<=prof[i][1]){const a=prof[i-1],b=prof[i];const u=(v-a[1])/(b[1]-a[1]);return r*(a[0]+(b[0]-a[0])*u)}}return 0};
  const s8=Math.sin(PI/8),c8=Math.cos(PI/8);const surf=(x,y)=>{const R=Ry(y),ap=R*c8;return Math.abs(x)<=R*s8?ap:(ap-Math.abs(x)*.7071)/.7071};
  P(g,gemGeo(prof.map(([a,b])=>[Math.max(1e-4,a*r),hy+b*r]),8),km,[0,0,0],[0,PI/8,0]);
  const small=(p,s,rot,col)=>P(g,gemGeo([[0,-.3],[.35,-.1],[.35,.5],[0,.85]].map(([a,b])=>[Math.max(1e-4,a*r*s),b*r*s]),6),m.c(col,{gloss:1.3,rim:1,rimColor:'#ffffff'}),p,rot);
  small([r*.55,hy+r*.75,-r*.35],1,[-.2,0,-.55],PAL.aqua);small([-r*.6,hy+r*.62,-r*.25],.8,[-.1,0,.65],PAL.pink);small([r*.05,hy+r*.9,-r*.6],.7,[-.6,0,.1],PAL.lemon);
  const fy=hy+r*.16;const H=face(c,{top:hy+r*1.15,front:surf(EX*r,fy),faceY:fy,sideX:r*1.05});
  const spk=[[1.25,.55,.3],[-1.2,.1,.4],[.7,-.8,.6]].map(([x,y,z],i)=>P(g,G.star(r*.12,r*.035,4,r*.03),m.flat('#FFFFFF'),[x*r,hy+y*r,z*r]));
  c.an(t=>{spk.forEach((s,i)=>{s.scale.setScalar(.3+Math.abs(Math.sin(t*1.8+i*2.1))*.9)})});
  mouthOn(g,c,surf,'smile',{y:hy-r*.18,w:.14});cheeksOn(g,c,surf,{sp:.5,y:hy-r*.06});return H});

K('wolke','Wolke','ding',(g,c)=>{const{hy,hr:r,m}=c;const wm=m.plush(PAL.white),sm=m.plush('#E4E2FF');
  [[0,0,.05,.92],[-.78,-.22,0,.62],[.78,-.22,0,.62],[-.42,.52,-.1,.58],[.45,.5,-.05,.55],[0,.62,-.35,.6],[0,0,-.4,.8]].forEach(([x,y,z,s])=>P(g,G.s(r*s),wm,[x*r,hy+y*r,z*r]));
  [[-.42,-.62,.05,.44],[.42,-.62,.05,.44],[0,-.66,-.2,.5]].forEach(([x,y,z,s])=>P(g,G.s(r*s),sm,[x*r,hy+y*r,z*r]));
  const rb=grp(g,[r*.95,hy-r*.05,-r*.4],[0,-.75,0]);[PAL.strawberry,PAL.lemon,PAL.sky].forEach((col,i)=>P(rb,G.to(r*(.52-i*.11),r*.055,PI),m.gloss(col),[0,0,0]));P(rb,G.s(r*.2),wm,[-r*.41,-r*.02,0]);
  const surf=es(0,hy,r*.05,r*.92,r*.92,r*.92);const fy=hy+r*.05;const H=face(c,{top:hy+r*1.2,front:surf(EX*r,fy),faceY:fy,sideX:r*1.4});
  c.an(t=>{rb.rotation.z=Math.sin(t*.8)*.04});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf,{sp:.58});return H});

K('teekanne','Teekanne','ding',(g,c)=>{const{hy,hr:r,m}=c;const pm=m.gloss(PAL.sky),lm=m.gloss(PAL.white);
  const cy=hy-r*.05,A=r*1.14,B=r*.84;const prof=[[0,cy-r*.78],[r*.46,cy-r*.78],[r*.54,cy-r*.72]];range(Q(16),t=>{const th=-1.05+t*2.15;prof.push([A*Math.cos(th),cy+B*Math.sin(th)])});prof.push([r*.46,cy+r*.72],[0,cy+r*.72]);
  P(g,G.la(prof),pm);const surf=es(0,cy,0,A,B,A);
  P(g,G.s(r*.5),lm,[0,cy+r*.68,0],null,[1,.45,1]);P(g,G.to(r*.48,r*.05),lm,[0,cy+r*.68,0],[PI/2,0,0]);P(g,G.s(r*.12),m.gloss(PAL.lemon),[0,cy+r*.98,0]);
  const sp=[[r*.95,cy-r*.2,0],[r*1.32,cy+r*.02,0],[r*1.5,cy+r*.36,0],[r*1.62,cy+r*.56,0]];P(g,G.tu(sp,r*.2,r*.1),pm);P(g,G.to(r*.1,r*.035),lm,sp[3],[PI/2,0,-.5]);
  P(g,G.to(r*.36,r*.09,PI*1.3),pm,[-r*1.2,cy+r*.05,0],[0,0,PI*.35]);
  both(z=>{const q=onE(0,cy,0,A,B,A,[.55,.25,z*.8],-r*.005);const f=face2(grp(g,[q.p.x,q.p.y,q.p.z]),q.n);if(z<0)f.position.x*=-1,f.lookAt(f.position.x*2,f.position.y,f.position.z*2);
    P(f,merge(range(5,(t,i)=>{const a=i/5*TAU;return place(lowS(r*.08),new V3(Math.cos(a)*r*.09,Math.sin(a)*r*.09,0),null,[1,1,.4])})),lm);P(f,G.s(r*.05),m.gloss(PAL.lemon),[0,0,r*.02],null,[1,1,.5])});
  const steam=range(3,(t,i)=>P(g,G.s(r*.1),m.plush(PAL.white),sp[3]));
  c.an(t=>steam.forEach((s,i)=>{const u=(t*.5+i/3)%1;s.position.set(sp[3][0]+Math.sin(u*6+i)*r*.08,sp[3][1]+r*.1+u*r*.55,sp[3][2]);s.scale.setScalar(.5+Math.sin(u*PI)*.8)}));
  const fy=hy+r*.08;const H=face(c,{top:cy+r*1.08,front:surf(EX*r,fy),faceY:fy,sideX:A});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

/* =====================================================================
   PFLANZLICH
   ===================================================================== */
K('pilzhut','Pilzkopf','pflanze',(g,c)=>{const{hy,hr:r,m}=c;
  const cy=hy-r*.2,A=r*.82,B=r*.85,D=r*.8;const surf=es(0,cy,0,A,B,D);ell(g,m.gloss(PAL.cream),0,cy,0,A,B,D);
  const capY=hy+r*.26;const cp=[[0,-.04],[.55,-.08],[1.08,-.14],[1.32,-.08],[1.4,.04],[1.33,.24],[1.14,.5],[.8,.76],[.42,.9],[0,.95]].map(([a,b])=>[Math.max(1e-4,a*r),capY+b*r]);
  P(g,G.la(cp),m.gloss(PAL.strawberry));P(g,G.cy(r*1.22,r*.5,r*.1),m.c(PAL.sand),[0,capY-r*.13,0]);
  [[0,.95,.3,.2],[.62,.55,.55,.17],[-.62,.6,.5,.16],[.95,.35,-.2,.15],[-.9,.4,-.3,.16],[.2,.7,-.8,.18],[-.35,.9,-.25,.14]].forEach(([x,y,z,s])=>{const q=onE(0,capY,0,r*1.3,r*.9,r*1.3,[x,y,z],-r*.02);face2(P(g,G.s(r*s),m.c(PAL.ivory,{gloss:.4}),[q.p.x,q.p.y,q.p.z],null,[1,1,.35]),q.n)});
  const fy=hy-r*.14;const H=face(c,{top:capY+r*.95,front:surf(EX*r,fy),faceY:fy,sideX:r*1.4});
  mouthOn(g,c,surf,'smile',{y:hy-r*.48,w:.14});cheeksOn(g,c,surf,{sp:.52,y:hy-r*.36});return H});

K('bluete','Blütenkopf','pflanze',(g,c)=>{const{hy,hr:r,m}=c;
  const cz=r*.22,A=r*.7,D=r*.4;const surf=es(0,hy,cz,A,A,D);
  ell(g,m.c(PAL.leaf,{gloss:.4}),0,hy,-r*.1,r*.6,r*.6,r*.38);
  const pg=grp(g,[0,hy,r*.02]);const p1=m.c(PAL.pink,{gloss:.6,rim:.6}),p2=m.c(PAL.blush,{gloss:.6,rim:.6});
  range(10,(t,i)=>{const a=i/10*TAU+PI/10;P(pg,G.puff(petal(r*.46,r*.62),r*.1),i%2?p1:p2,[Math.sin(a)*r*.48,Math.cos(a)*r*.48,-(i%2)*r*.07],[0,0,-a])});
  ell(g,m.gloss(PAL.honey),0,hy,cz,A,A,D);
  P(g,merge(range(18,(t,i)=>{const a=i/18*TAU;const q=onE(0,hy,cz,A,A,D,[Math.sin(a)*.92,Math.cos(a)*.92,.35],-r*.01);return place(lowS(r*.045),q.p,q.n,[1,1,.5])})),m.gloss(PAL.orange));
  both(x=>P(g,G.puff(almond(r*.34,r*.62),r*.08),m.c(PAL.leaf,{gloss:.4}),[x*r*.32,hy-r*.72,-r*.05],[0,0,-x*1.9]));
  c.an(t=>{pg.rotation.z=Math.sin(t*.6)*.06});
  const fy=hy+r*.08;const H=face(c,{top:hy+r*1.18,front:surf(EX*r,fy),faceY:fy,sideX:r*1.2});
  mouthOn(g,c,surf,'smile',{y:hy-r*.28,w:.13});cheeksOn(g,c,surf,{sp:.48,y:hy-r*.16});return H});

K('kaktus','Kaktuskopf','pflanze',(g,c)=>{const{hy,hr:r,m}=c;const km=m.c('#6CBF6A',{gloss:.5,rim:.6,rimColor:'#eaffc8'}),rm=m.c('#58A858',{gloss:.4});
  const R=r*.88,L=r*.45,cy=hy+r*.1;P(g,G.ca(R,L),km,[0,cy,0],null,[1,1,.95]);
  const rho=(y)=>{const dy=Math.max(0,Math.abs(y-cy)-L/2);return Math.sqrt(Math.max(0,R*R-dy*dy))};const surf=(x,y)=>.95*Math.sqrt(Math.max(0,rho(y)**2-x*x));
  const ribA=[.85,1.6,2.35,PI,-2.35,-1.6,-.85];const dots=[];
  ribA.forEach(a=>{const pts=range(9,t=>{const y=cy-L/2-R*.55+t*(L+R*1.4);const rr=rho(y)+r*.01;return[Math.sin(a)*rr,y,Math.cos(a)*rr*.95]});P(g,G.tu(pts,r*.035),rm);
    range(4,(t,i)=>{const y=cy-L/2-R*.3+t*(L+R*.8);const rr=rho(y)+r*.03;const p=new V3(Math.sin(a+.38)*rr,y,Math.cos(a+.38)*rr*.95);dots.push(place(lowS(r*.04),p,new V3(Math.sin(a+.38),0,Math.cos(a+.38)),[1,1,.6]));
      [-.6,.6].forEach(s=>dots.push(place(new THREE.ConeGeometry(r*.018,r*.1,Q(6)),p.clone().add(new V3(Math.sin(a+.38)*r*.03,s*r*.03,Math.cos(a+.38)*r*.03)),null,1)))})});
  P(g,merge(dots),m.c(PAL.cream));
  const ag=[[r*.78,cy-r*.15,0],[r*1.18,cy-r*.12,0],[r*1.24,cy+r*.2,0],[r*1.22,cy+r*.34,0]];P(g,G.tu(ag,r*.2,r*.18),km);P(g,G.s(r*.18),km,ag[3]);
  const fl=grp(g,[0,cy+L/2+R*.98,0]);range(5,(t,i)=>{const pg=grp(fl,[0,0,0],[0,i/5*TAU,0]);P(pg,G.puff(petal(r*.24,r*.3),r*.06),m.gloss(PAL.pink),[0,0,r*.04],[1.0,0,0])});P(fl,G.s(r*.09),m.gloss(PAL.lemon),[0,r*.05,0]);
  c.an(t=>{fl.rotation.y=Math.sin(t*.9)*.2});
  const fy=hy+r*.14;const H=face(c,{top:cy+L/2+R,front:surf(EX*r,fy),faceY:fy,sideX:R});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf,{sp:.56});return H});

K('kohl','Kohlkopf','pflanze',(g,c)=>{const{hy,hr:r,m}=c;const im=m.c('#CDEFA6',{gloss:.5,rim:.5}),vm=m.c('#AEDC84');
  const cy=hy+r*.05,A=r*.94,B=r*.92,D=r*.94;const surf=es(0,cy,0,A,B,D);ell(g,im,0,cy,0,A,B,D);
  [[.0,.55],[.5,-.3],[-.5,-.3]].forEach(([dx,dz],i)=>P(g,G.tu(range(6,t=>{const q=onE(0,cy,0,A,B,D,[dx*(1-t)+Math.sin(t*3+i)*.1,1-t*.3,dz*(1-t)+(t-.5)*.6],r*.005).p;return[q.x,q.y,q.z]}),r*.03,r*.02),vm));
  const cols=['#9ED77A',PAL.grass,PAL.leaf,'#9ED77A',PAL.leaf,PAL.grass,'#9ED77A'];
  [[.62,.9,-.42],[1.35,1.2,.12],[2.25,1.35,.38],[PI,1.4,.55],[-2.25,1.35,.38],[-1.35,1.2,.12],[-.62,.9,-.42]].forEach(([a,w,top],i)=>{const lm=m.c(cols[i],{gloss:.45,rim:.5,side:THREE.DoubleSide});
    const ht=top*r,prof=[[r*.5,cy-r*.9],[r*.88,cy-r*.66],[r*1.02,cy-r*.32],[r*1.08,(cy-r*.32+cy+ht)/2+r*.04],[r*1.24,cy+ht]];const sc=1+(i%2)*.05;
    P(g,new THREE.LatheGeometry(prof.map(([x,y])=>new THREE.Vector2(x*sc,y)),Q(18),a-w/2,w),lm);
    const rim=range(11,t=>{const ph=a-w/2+t*w,wv=Math.sin(t*PI*5)*r*.05;return[Math.sin(ph)*r*1.25*sc,cy+ht+wv,Math.cos(ph)*r*1.25*sc]});P(g,G.tu(rim,r*.04),m.c(cols[i],{gloss:.45,rim:.5}));
    const mid=a;P(g,G.tu(range(5,t=>{const pr=prof[Math.min(4,Math.round(t*4))];return[Math.sin(mid)*(pr[0]*sc+r*.012),pr[1],Math.cos(mid)*(pr[0]*sc+r*.012)]}),r*.026,r*.02),vm)});
  const fy=hy+r*.08;const H=face(c,{top:cy+B,front:surf(EX*r,fy),faceY:fy,sideX:r*1.15});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('moosball','Moosball','pflanze',(g,c)=>{const{hy,hr:r,m}=c;
  const tex=ctex('kopf-moss',256,128,(x,w,h)=>{const rnd=srand(11);x.fillStyle='#6DB85A';x.fillRect(0,0,w,h);const cols=['#86CC6A','#5AA64C','#9AD97A','#78C062'];for(let i=0;i<460;i++){x.fillStyle=cols[i%4];x.beginPath();x.arc(rnd()*w,rnd()*h,2+rnd()*5,0,TAU);x.fill()}
    x.fillStyle='#FFE27A';for(let i=0;i<10;i++){x.beginPath();x.arc(rnd()*w,rnd()*h,2,0,TAU);x.fill()}});
  const R=r*1.0;P(g,G.blob(R,.035,14,5),m.tex('kopf-moss',tex,{rim:.9,rimColor:'#e6ffc0'}),[0,hy,0]);const surf=es(0,hy,0,R*.99,R*.99,R*.99);
  const mp=onE(0,hy,0,R,R,R,[.55,.8,.1],-r*.04);const mu=face2(grp(g,[mp.p.x,mp.p.y,mp.p.z]),mp.n);mu.rotateX(PI/2);
  P(mu,G.cy(r*.07,r*.09,r*.22),m.c(PAL.cream),[0,r*.1,0]);P(mu,G.hs(r*.2),m.gloss(PAL.strawberry),[0,r*.2,0],null,[1,.8,1]);P(mu,G.s(r*.04),m.c(PAL.white),[r*.08,r*.3,r*.05]);
  const fp=onE(0,hy,0,R,R,R,[-.65,.55,.45],0);const fl=face2(grp(g,[fp.p.x,fp.p.y,fp.p.z]),fp.n);
  P(fl,merge(range(5,(t,i)=>{const a=i/5*TAU;return place(lowS(r*.08),new V3(Math.cos(a)*r*.09,Math.sin(a)*r*.09,0),null,[1,1,.45])})),m.gloss(PAL.lilac));P(fl,G.s(r*.055),m.gloss(PAL.lemon),[0,0,r*.03],null,[1,1,.6]);
  const cl=grp(g,[-r*.1,hy+R*.96,-r*.1]);P(cl,G.ca(r*.025,r*.2),m.c(PAL.forest),[0,r*.1,0]);range(3,(t,i)=>{const a=i/3*TAU;P(cl,G.heart(r*.08,r*.04),m.gloss(PAL.leaf),[Math.sin(a)*r*.07,r*.24,Math.cos(a)*r*.07],[-1.2,a,0])});
  c.an(t=>{cl.rotation.z=Math.sin(t*1.8)*.12});
  const H=face(c,{top:hy+R,front:surf(EX*r,hy),faceY:hy,sideX:R});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf);return H});

K('zapfen','Tannenzapfen','pflanze',(g,c)=>{const{hy,hr:r,m}=c;const A=r*.84,B=r*1.08;
  ell(g,m.c(PAL.sand,{gloss:.3,rim:.4}),0,hy,0,A,B,A);const surf=es(0,hy,0,A,B,A);
  const sc=[];for(let k=0;k<9;k++){const v=-.92+k*.225,y=v*B,rho=A*Math.sqrt(Math.max(0,1-v*v));const n=Math.max(5,Math.round(rho/A*12));
    for(let j=0;j<n;j++){const a=j/n*TAU+k*.35;if(Math.cos(a)>.5&&v>-.62&&v<.55)continue;const q=onE(0,hy,0,A,B,A,[Math.sin(a)*Math.sqrt(1-v*v),v,Math.cos(a)*Math.sqrt(1-v*v)],-r*.02);
      sc.push(place(lowS(r*.21),q.p,q.n,[1.05,.7,.42],-.5))}}
  P(g,merge(sc),m.c(PAL.wood,{gloss:.5,rim:.4}));
  const tp=grp(g,[0,hy+B*.95,-r*.05]);[-.6,0,.6].forEach((a,i)=>P(tp,G.puff(almond(r*.16,r*.42),r*.06),m.c(i===1?PAL.forest:PAL.moss,{gloss:.4}),[0,0,0],[0,i*.9,a]));
  c.an(t=>{tp.rotation.z=Math.sin(t*1.6)*.08});
  const fy=hy+r*.06;const H=face(c,{top:hy+B,front:surf(EX*r,fy),faceY:fy,sideX:A*1.1});
  mouthOn(g,c,surf,'smile',{w:.14});cheeksOn(g,c,surf,{sp:.5});return H});

K('baumstumpf','Baumstumpf','pflanze',(g,c)=>{const{hy,hr:r,m}=c;const bk=m.c(PAL.wood,{gloss:.25,rim:.4}),rd=m.c(PAL.choc,{gloss:.2});
  const tY=hy+r*.72;const prof=[[0,hy-r*1.0],[r*1.14,hy-r*1.0],[r*1.1,hy-r*.86],[r*1.0,hy-r*.6],[r*.97,hy],[r*.98,tY-r*.08],[r*.95,tY],[0,tY]];P(g,G.la(prof),bk);
  const Rat=(y)=>{for(let i=1;i<prof.length-1;i++){if(y<=prof[i][1]){const a=prof[i-1],b=prof[i];return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1])}}return r*.95};
  const surf=(x,y)=>Math.sqrt(Math.max(0,Rat(y)**2-x*x));
  P(g,G.cy(r*.92,r*.92,r*.05),m.c(PAL.sand,{gloss:.3}),[0,tY+r*.01,0]);[.22,.44,.66].forEach(rr=>P(g,G.to(r*rr,r*.025),m.c(PAL.oak),[0,tY+r*.04,0],[PI/2,0,0]));
  P(g,G.to(r*.94,r*.05),m.c(PAL.choc),[0,tY,0],[PI/2,0,0]);
  [.85,1.4,1.95,2.5,PI,-2.5,-1.95,-1.4,-.85].forEach((a,i)=>{const L=r*(.9+(i%3)*.2),y=hy-r*.35+(i%2)*r*.12;P(g,G.ca(r*.06,L),rd,[Math.sin(a)*(Rat(y)-r*.01),y,Math.cos(a)*(Rat(y)-r*.01)])});
  const kn=[r*.62,hy-r*.55];P(g,G.to(r*.1,r*.04),rd,[-kn[0],kn[1],surf(kn[0],kn[1])],[0,-.6,0]);
  const sp=grp(g,[r*.35,tY,-r*.2]);P(sp,G.ca(r*.03,r*.2),m.c(PAL.forest),[0,r*.12,0]);both(x=>P(sp,G.puff(almond(r*.2,r*.3),r*.06),m.gloss(PAL.leaf),[0,r*.24,0],[0,0,-x*1.0]));
  c.an(t=>{sp.rotation.z=Math.sin(t*1.5)*.1});
  const mu=grp(g,[-r*.95,hy-r*.3,r*.3],[0,0,.5]);P(mu,G.cy(r*.05,r*.06,r*.14),m.c(PAL.cream),[0,0,0]);P(mu,G.hs(r*.14),m.gloss(PAL.orange),[0,r*.06,0],null,[1,.75,1]);
  const fy=hy+r*.08;const H=face(c,{top:tY+r*.02,front:surf(EX*r,fy),faceY:fy,sideX:r*1.0});
  mouthOn(g,c,surf,'smile',{y:hy-r*.32,w:.14});cheeksOn(g,c,surf,{sp:.56,y:hy-r*.2});return H});

K('seerose','Seerosenkopf','pflanze',(g,c)=>{const{hy,hr:r,m}=c;
  const A=r*.9,B=r*.86,D=r*.88;const surf=es(0,hy,0,A,B,D);ell(g,m.c('#FFE4EE',{gloss:.5,rim:.7}),0,hy,0,A,B,D);
  const pad=new THREE.Shape();pad.moveTo(0,0);pad.absarc(0,0,r*1.32,.28,TAU-.28,false);pad.lineTo(0,0);P(g,G.puff(pad,r*.08),m.gloss(PAL.leaf),[0,hy-r*.74,0],[-PI/2,0,PI/2]);
  const p1=m.c(PAL.pink,{gloss:.6,rim:.6}),p2=m.c(PAL.blush,{gloss:.6,rim:.6});
  range(9,(t,i)=>{const a=.95+t*(TAU-1.9);const pg=grp(g,[Math.sin(a)*r*.7,hy-r*.64,Math.cos(a)*r*.7],[0,a,0]);P(pg,G.puff(almond(r*.5,r*.95,.4),r*.1),i%2?p1:p2,[0,0,0],[.62,0,0])});
  range(5,(t,i)=>{const a=PI-1.2+t*2.4;const pg=grp(g,[Math.sin(a)*r*.82,hy-r*.3,Math.cos(a)*r*.82],[0,a,0]);P(pg,G.puff(almond(r*.42,r*.9,.4),r*.08),m.c(PAL.white,{gloss:.5,rim:.6}),[0,0,0],[.28,0,0])});
  both(x=>{const a=x*.78;const pg=grp(g,[Math.sin(a)*r*.82,hy-r*.66,Math.cos(a)*r*.82],[0,a,0]);P(pg,G.puff(almond(r*.32,r*.5,.4),r*.08),p1,[0,0,0],[1.15,0,0])});
  P(g,G.s(r*.06),m.glass('#ffffff'),[r*.9,hy-r*.66,r*.45]);
  const fy=hy+r*.06;const H=face(c,{top:hy+B,front:surf(EX*r,fy),faceY:fy,sideX:r*1.3});
  mouthOn(g,c,surf,'smile');cheeksOn(g,c,surf,{sp:.56});return H});
})();
