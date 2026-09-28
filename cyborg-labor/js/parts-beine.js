/* ================= BEINE =================
   Kuschel-Spielzeug-Stil. B(id, name, art, h, bau): h = Beinhöhe relativ zu s.
   Hüfte bei y0 = h·s, Füsse / Räder / Unterseite stehen genau auf y = 0.
   Laufende Beine nutzen eine kleine 2-Knochen-IK: Füsse bleiben am Boden, heben beim Schritt federnd ab.
   ========================================= */
(function(){
const B=(id,n,k,h,b)=>def('beine',id,n,k,b,{h});
const SP=7;                                   // Schritt-Tempo (rad/s)
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const phs=sg=>sg>0?0:PI;
const S=(s,a)=>a.map(p=>p.map(v=>v*s));       // Punktliste skalieren

/* ---------- Geometrie-Helfer ---------- */
/* Röhre mit Radius pro Stützpunkt */
function tubeR(pts,rads,seg,rsg){
  const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0],p[1],p[2])));const n=seg||Q(44),R=rsg||Q(14),N=pts.length-1;
  const g=new THREE.TubeGeometry(cv,n,1,R,false);const pos=g.attributes.position,v=new V3();
  for(let i=0;i<=n;i++){const u=i/n,cp=cv.getPointAt(u),tt=cv.getUtoTmapping(u)*N,k=Math.min(N-1,Math.floor(tt)),f=tt-k,rr=rads[k]+(rads[k+1]-rads[k])*f;
    for(let j=0;j<=R;j++){const q=i*(R+1)+j;v.fromBufferAttribute(pos,q).sub(cp).multiplyScalar(rr).add(cp);pos.setXYZ(q,v.x,v.y,v.z)}}
  g.computeVertexNormals();g.userData.openTube=true;return g}
/* Geometrie so verschieben, dass ihre Unterkante bei y liegt; Verschiebung in userData.dy */
function groundGeo(geo,y){geo.computeBoundingBox();const dy=(y||0)-geo.boundingBox.min.y;geo.translate(0,dy,0);geo.userData.dy=dy;return geo}
/* flache Puff-Form auf den Boden legen (Form-y zeigt nach vorn +z) */
function flatGeo(shape,d,bev){const geo=G.puff(shape,d,bev);geo.rotateX(PI/2);return geo}
/* Kapsel von a nach b */
function capAB(g,a,b,r,mat){const A=new V3(a[0],a[1],a[2]),Bv=new V3(b[0],b[1],b[2]);const m=P(g,G.ca(r,Math.max(1e-3,A.distanceTo(Bv))),mat);
  m.position.copy(A).add(Bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new V3(0,1,0),Bv.clone().sub(A).normalize());return m}
/* konisches Glied mit runden Enden (2-3 Meshes) */
function taper(g,a,b,r1,r2,mat,caps){bt(g,a,b,r1,mat,r2);if(caps!==false){P(g,G.s(r1),mat,a);P(g,G.s(r2),mat,b)}}
/* Schwimmhaut-/Pfotenform: n Zehen im Fächer, vorn = +y */
function webShape(n,spread,len,notch,heel){const pts=[[-heel,-.05*len]];
  for(let i=0;i<n;i++){const a=-spread+2*spread*i/(n-1);pts.push([Math.sin(a)*len,Math.cos(a)*len]);if(i<n-1){const b=a+spread/(n-1);pts.push([Math.sin(b)*notch,Math.cos(b)*notch])}}
  pts.push([heel,-.05*len]);return sshp(pts)}
const leafShape=(L,W)=>sshp([[0,-L*.08],[W*.6,L*.28],[W*.45,L*.72],[0,L*1.08],[-W*.45,L*.72],[-W*.6,L*.28]]);
/* Streifen-Textur entlang u (Röhren-Länge) */
function bandTex(key,a,b,n,w){return ctex('bn-'+key,256,32,(x,W,H)=>{x.fillStyle=a;x.fillRect(0,0,W,H);x.fillStyle=b;const bw=(w||.4)*W/n;for(let i=0;i<n;i++)x.fillRect((i+.5)/n*W-bw/2,0,bw,H)})}
/* Wegstrecke beim Laufen aufsummieren (für Räder, Ketten) */
function roll(c,f){let lt=null,d=0;c.an((t,w,a)=>{const dt=lt==null?0:cl(t-lt,0,.1);lt=t;if(w)d+=dt;f(d,t,w,a)})}

/* ---------- Bein mit IK ----------
   o: x,y,z (Hüfte), L1,L2 (Ober-/Unterschenkel), fh (Knöchelhöhe über Boden), back (Knie nach hinten),
      ph (Phase), stride, lift, sp, toe; thigh(g,L1) shin(g,L2) foot(g) bauen in Knochen-Räumen (Knochen zeigt nach -y). */
function leg(g,c,o){
  const s=c.s,L1=o.L1,L2=o.L2,H=o.y-o.fh,dir=o.back?-1:1;
  const hip=grp(g,[o.x,o.y,o.z||0]);if(o.thigh)o.thigh(hip,L1);
  const knee=grp(hip,[0,-L1,0]);if(o.shin)o.shin(knee,L2);
  const ank=grp(knee,[0,-L2,0]);if(o.foot)o.foot(ank);
  const solve=(tz,ty,pitch)=>{let d=Math.hypot(tz,ty);d=cl(d,Math.abs(L1-L2)+1e-4,(L1+L2)*.9995);
    const base=Math.atan2(tz,-ty),a=Math.acos(cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1)),b=Math.acos(cl((L2*L2+d*d-L1*L1)/(2*L2*d),-1,1));
    const f1=base+dir*a,f2=base-dir*b;hip.rotation.x=-f1;knee.rotation.x=f1-f2;ank.rotation.x=f2+(pitch||0)};
  const st=o.stride??.12*s,lf=o.lift??.09*s,sp=o.sp||SP,ph=o.ph||0,fz=o.fz||0,toe=o.toe??.3;
  solve(fz,-H);
  c.an((t,w)=>{if(w){const p=t*sp+ph,up=Math.max(0,Math.cos(p));solve(fz+Math.sin(p)*st,-H+up*lf,-up*toe)}
    else{const q=(t*.8+ph*.4)%5.2,tap=q<.42?Math.sin(q/.42*PI)*.028*s:0;solve(fz,-H+tap,-tap*3)}});
  return{hip,knee,ank};
}

/* ---------- Füsse & Räder ---------- */
/* runder Turnschuh: Knöchel im Ursprung, Sohle bei y=-fh */
function sneaker(a,c,o){const{s,m}=c;const fh=o.fh,w=o.w||.25*s,L=o.L||.4*s,zc=o.zc??.07*s,so=.05*s,ry=fh*.68,cy=-fh+.012*s+ry;
  P(a,G.cy(1,1,so),o.sole||m.white(),[0,-fh+so/2,zc],null,[w*.58,1,L*.55]);
  P(a,G.s(1),o.mat,[0,cy,zc],null,[w/2,ry,L/2]);
  P(a,G.s(1),o.toe||m.white(),[0,-fh+.012*s+ry*.5,zc+L*.33],null,[w*.43,ry*.5,L*.19]);
  if(o.sock)P(a,G.cy(.105*s,.105*s,.15*s),o.sock,[0,.035*s,0]);
  P(a,G.to(o.sock?.112*s:w*.3,.028*s),o.cuff||o.mat,[0,cy+ry*.82,zc-L*.14],[PI/2-.12,0,0]);
  if(o.lace!==false)range(2,(t,i)=>{const dz=L*(.06+i*.14),yy=cy+ry*Math.sqrt(Math.max(0,1-(dz/(L/2))**2));P(a,G.ca(.022*s,w*.34),o.laceMat||m.white(),[0,yy+.002*s,zc+dz],[-.4-i*.4,0,PI/2])})}
/* Spielzeug-Rad (Achse = Welt-x). out = ±1 Seite der Kappe. Dreht beim Fahren. */
function wheel(par,c,p,R,w,o){o=o||{};const{s,m}=c;const out=o.out||1;
  const wh=grp(par,p,[0,PI/2,0]);const sp=grp(wh);const t=R*(o.t||.3);
  P(sp,G.to(R-t,t),o.tire||m.rubber(),null,null,[1,1,Math.max(.5,w/2/t)]);
  P(sp,G.cy(R-t*.85,R-t*.85,w*.8),o.hub||m.gloss(PAL.lemon),null,[PI/2,0,0]);
  if(o.cap!==false)P(sp,G.s((R-t)*.4),o.capMat||m.white(),[0,0,out*w*.4],null,[1,1,.5]);
  const nb=o.bolts??5,bolt=(an,z)=>P(sp,G.s(Math.max(.016*s,R*.075)),o.bolt||m.c(PAL.ink),[Math.cos(an)*(R-t)*.64,Math.sin(an)*(R-t)*.64,z],null,[1,1,.6]);
  for(let i=0;i<nb;i++){bolt(i/nb*TAU,out*w*.4);if(o.both)bolt(i/nb*TAU+.6,-out*w*.4)}
  roll(c,d=>{sp.rotation.z=d*(o.v||1.6)*s/R});return{wh,sp}}

/* =================================================================
   ORGANISCH
   ================================================================= */
B('mensch','Menschenbeine','org',.85,(g,c)=>{const{s,m,y0}=c;const fh=.13*s;
  both(sg=>leg(g,c,{x:sg*.28*s,y:y0+.06*s,L1:.42*s,L2:.39*s,fh,ph:phs(sg),
    thigh:(h,L)=>P(h,G.ca(.14*s,L),m.skin(),[0,-L/2,0]),
    shin:(k,L)=>taper(k,[0,0,0],[0,-L+.03*s,0],.125*s,.092*s,m.skin()),
    foot:a=>{sneaker(a,c,{fh,w:.27*s,L:.42*s,mat:m.gloss(PAL.coral),sock:m.white()});P(a,G.to(.108*s,.02*s),m.c(PAL.teal),[0,.13*s,0],[PI/2,0,0])}}))});
B('prothese','Beinprothesen','masch',.8,(g,c)=>{const{s,m,y0}=c;const fh=.27*s,cup=m.gloss(PAL.teal),blade=m.gloss(PAL.navy);
  both(sg=>leg(g,c,{x:sg*.28*s,y:y0+.06*s,L1:.37*s,L2:.27*s,fh,ph:phs(sg),toe:.12,stride:.11*s,
    thigh:(h,L)=>{P(h,G.ca(.13*s,L*.3),m.skin(),[0,-L*.2,0]);P(h,G.cy(.148*s,.1*s,L*.52),cup,[0,-L*.63,0]);P(h,G.to(.143*s,.03*s),m.white(),[0,-L*.37,0],[PI/2,0,0]);
      P(h,G.cy(.05*s,.05*s,.21*s),m.steel(),[0,-L,0],[0,0,PI/2])},
    shin:(k,L)=>{P(k,G.s(.08*s),m.chrome());P(k,G.cy(.042*s,.042*s,L),m.chrome(),[0,-L/2,0]);P(k,G.cy(.064*s,.058*s,.08*s),cup,[0,-.1*s,0]);P(k,G.cy(.058*s,.068*s,.07*s),cup,[0,-L+.02*s,0])},
    foot:a=>{const pts=S(s,[[0,.03,0],[0,-.05,-.075],[0,-.15,-.095],[0,-.225,-.045],[0,-.232,.06],[0,-.222,.17]]),rr=[.036,.042,.044,.04,.036,.032].map(v=>v*s);
      P(a,tubeR(pts,rr),blade,null,null,[1.8,1,1]);P(a,G.s(rr[5]),blade,pts[5],null,[1.8,1,1]);
      P(a,G.bx(.15*s,.036*s,.22*s,.016*s),m.gloss(PAL.lemon),[0,-fh+.018*s,.07*s])}}))});
/* =================================================================
   TIERISCH
   ================================================================= */
B('knick','Tierbeine mit Knickgelenk','tier',.85,(g,c)=>{const{s,m,y0}=c;const fh=.28*s,sk=m.skin(),fur=m.plush(PAL.cream),pad=m.gloss(PAL.blush);
  both(sg=>leg(g,c,{x:sg*.28*s,y:y0+.06*s,L1:.36*s,L2:.36*s,fh,back:true,ph:phs(sg),stride:.1*s,toe:.2,
    thigh:(h,L)=>P(h,G.s(.17*s),sk,[0,-L*.42,.02*s],null,[1,1.4,1.15]),
    shin:(k,L)=>{taper(k,[0,0,0],[0,-L,0],.095*s,.075*s,sk)},
    foot:a=>{capAB(a,[0,0,0],[0,-fh+.09*s,.1*s],.078*s,fur);P(a,G.s(.1*s),fur,[0,.0,0],null,[1,.8,1]);
      P(a,G.s(1),fur,[0,-fh+.08*s,.15*s],null,[.13*s,.08*s,.15*s]);
      range(3,(t,i)=>P(a,G.s(.052*s),fur,[(t-.5)*.13*s,-fh+.052*s,.27*s]));range(3,(t,i)=>P(a,G.s(.028*s),pad,[(t-.5)*.13*s,-fh+.035*s,.315*s],null,[1,.8,.55]))}}))});
B('hufe','Vier Hufe','tier',.8,(g,c)=>{const{s,m,y0}=c;const fh=.13*s,sk=m.skin(),hoof=m.gloss(PAL.choc),fluff=m.plush(PAL.cream);
  [[-1,1,0],[1,1,PI],[-1,-1,PI],[1,-1,0]].forEach(([x,z,ph])=>leg(g,c,{x:x*.25*s,z:z*.21*s,y:y0+.05*s,L1:.37*s,L2:.37*s,fh,back:z<0,ph,stride:.09*s,lift:.08*s,toe:.15,
    thigh:(h,L)=>P(h,G.s(.12*s),sk,[0,-L*.42,0],null,[1,1.7,1.1]),
    shin:(k,L)=>{P(k,G.s(.078*s),sk);capAB(k,[0,0,0],[0,-L,0],.068*s,sk)},
    foot:a=>{P(a,G.s(.1*s),fluff,[0,-.005*s,0],null,[1,.72,1]);P(a,G.cy(.088*s,.104*s,.12*s),hoof,[0,-fh+.06*s,0])}}))});

B('huhn','Hühnerbeine','tier',.8,(g,c)=>{const{s,m,y0}=c;const fh=.06*s,yl=m.gloss(PAL.honey),ring=m.c(PAL.orange),fe=m.plush(PAL.ivory);
  both(sg=>leg(g,c,{x:sg*.26*s,y:y0+.06*s,L1:.34*s,L2:.5*s,fh,back:true,ph:phs(sg),toe:.1,
    thigh:(h,L)=>{P(h,G.s(.17*s),fe,[0,-L*.35,-.02*s],null,[1,1.1,1.1]);both(k=>P(h,G.s(.1*s),fe,[k*.07*s,-L*.78,.02*s]));P(h,G.s(.09*s),fe,[0,-L*.9,-.05*s])},
    shin:(k,L)=>{capAB(k,[0,0,0],[0,-L,0],.046*s,yl);range(3,(t,i)=>P(k,G.to(.048*s,.013*s),ring,[0,-L*(.38+t*.36),0],[PI/2,0,0]))},
    foot:a=>{P(a,G.s(.054*s),yl);[-.55,0,.55].forEach(an=>capAB(a,[0,-fh+.033*s,0],[Math.sin(an)*.19*s,-fh+.033*s,Math.cos(an)*.19*s],.033*s,yl));
      capAB(a,[0,-fh+.031*s,0],[0,-fh+.031*s,-.1*s],.031*s,yl)}}))});
B('frosch','Froschbeine','tier',.45,(g,c)=>{const{s,m}=c;const gr=m.gloss(PAL.grass),spot=m.c(PAL.moss),web=m.gloss(PAL.leaf),pad=m.gloss(PAL.lemon),bel=m.c(PAL.butter);
  both(sg=>{const l=grp(g,[sg*.2*s,.36*s,-.05*s]);const X=v=>sg*v*s,Y=v=>v*s-.36*s,Z=v=>v*s+.05*s;
    P(l,G.s(1),gr,[X(.07),Y(.27),Z(-.13)],[-.4,sg*.25,0],[.16*s,.2*s,.3*s]);
    P(l,G.s(.05*s),spot,[X(.22),Y(.33),Z(-.08)],null,[.45,1,1]);P(l,G.s(.04*s),spot,[X(.21),Y(.22),Z(-.24)],null,[.45,1,1]);
    capAB(l,[X(.15),Y(.12),Z(-.36)],[X(.19),Y(.085),Z(.08)],.082*s,gr);P(l,G.s(.07*s),bel,[X(.12),Y(.1),Z(-.1)],null,[.8,.8,2.2]);
    const fo=grp(l,[X(.2),Y(0),Z(.12)],[0,sg*.3,0]);const len=.3*s;P(fo,groundGeo(flatGeo(webShape(4,.6,len,.16*s,.08*s),.024*s)),web);
    range(4,(t,i)=>{const an=-.6+1.2*t;P(fo,G.s(.045*s),pad,[Math.sin(an)*len*.86,.045*s,Math.cos(an)*len*.86])});
    c.an((t,w)=>{const u=w?Math.max(0,Math.sin(t*5.5)):0;l.position.y=.36*s+u*.12*s;l.rotation.x=-u*.25;fo.rotation.x=-u*.35})})});
B('spinne','Spinnenbeine','tier',.65,(g,c)=>{const{s,m,y0}=c;const fur=m.plush(PAL.plum),kn=m.gloss(PAL.lilac);
  both(sg=>[.8,.28,-.28,-.8].forEach((an,i)=>{const hy=y0+.12*s,l=grp(g,[sg*.26*s,hy,an*.14*s]);const dx=sg*Math.cos(an),dz=Math.sin(an),D=(r,y)=>[dx*r*s,y,dz*r*s];
    const pts=[D(0,0),D(.18,.2*s),D(.4,.3*s),D(.6,.14*s),D(.74,-hy+.14*s),D(.8,-hy+.055*s)];
    P(l,tubeR(pts,[.075,.07,.062,.052,.042,.038].map(v=>v*s)),fur);P(l,G.s(.072*s),kn,pts[2]);P(l,G.s(.055*s),kn,pts[5]);
    const gp=((i+(sg>0?1:0))%2)*PI;
    c.an((t,w)=>{if(w){const p=t*9+gp,up=Math.max(0,Math.sin(p));l.rotation.z=sg*up*.2;l.rotation.y=sg*Math.cos(p)*.12}else{l.rotation.z=0;l.rotation.y=Math.sin(t*1.2+i*1.7+sg)*.03}})}))});
B('insekt','Sechs Insektenbeine','tier',.55,(g,c)=>{const{s,m,y0}=c;const ch=m.chitin(PAL.leaf),jt=m.gloss(PAL.forest),ft=m.gloss(PAL.honey);
  both(sg=>[.7,0,-.7].forEach((an,i)=>{const hy=y0+.1*s,l=grp(g,[sg*.26*s,hy,an*.16*s]);const dx=sg*Math.cos(an),dz=Math.sin(an),D=(r,y)=>[dx*r*s,y,dz*r*s];
    const kp=D(.36,.24*s),ap=D(.58,-hy+.12*s),tp=D(.7,-hy+.04*s);
    P(l,tubeR([D(0,0),D(.2,.2*s),kp],[.065,.058,.05].map(v=>v*s)),ch);P(l,G.s(.062*s),jt,kp);
    P(l,tubeR([kp,D(.5,.1*s),ap],[.05,.044,.038].map(v=>v*s)),ch);P(l,G.s(.045*s),jt,ap);capAB(l,ap,tp,.04*s,ft);
    const gp=((i+(sg>0?1:0))%2)*PI;
    c.an((t,w)=>{if(w){const p=t*10+gp,up=Math.max(0,Math.sin(p));l.rotation.z=sg*up*.24;l.rotation.y=sg*Math.cos(p)*.15}else{l.rotation.z=0;l.rotation.y=Math.sin(t*1.4+i*2+sg)*.03}})}))});
B('tausend','Tausendfüssler','tier',.35,(g,c)=>{const{s,m}=c;const A=m.gloss(PAL.orange),Bm=m.gloss(PAL.coral),lg=m.gloss(PAL.honey),ink=m.c(PAL.ink);
  const N=8;const segs=range(N,(t,i)=>{const R=(i?.23-i*.014:.32)*s,z=i?-.14*s-i*.26*s:0,sg0=grp(g,[0,0,z]);
    P(sg0,G.s(R),i%2?Bm:A,[0,R*.72,0],null,[1.15,.72,i?1:1.05]);
    const zs=i?[0]:[.14*s,-.14*s];const legs=[];
    zs.forEach(zz=>both(sd=>{const lg0=grp(sg0,[sd*R*.9,R*.5,zz]);capAB(lg0,[0,0,0],[sd*.17*s,-R*.5+.036*s,.04*s],.036*s,lg);legs.push([lg0,sd])}));
    return{sg0,legs,i}});
  const head=segs[0].sg0;both(sd=>{capAB(head,[sd*.09*s,.3*s,.26*s],[sd*.2*s,.4*s,.44*s],.025*s,ink);P(head,G.s(.045*s),lg,[sd*.2*s,.4*s,.44*s])});
  const tail=segs[N-1].sg0;both(sd=>capAB(tail,[sd*.04*s,.1*s,-.08*s],[sd*.12*s,.22*s,-.28*s],.026*s,ink));
  c.an((t,w)=>{const sp=w?7:2,amp=(w?.08:.02)*s;segs.forEach(({sg0,legs,i})=>{sg0.position.x=Math.sin(t*sp-i*.8)*amp*(i/N);sg0.rotation.y=Math.cos(t*sp-i*.8)*(w?.12:.04)*(i/N);
    legs.forEach(([lg0,sd])=>{const p=t*12-i*1.3+sd;lg0.rotation.y=w?Math.sin(p)*.4:0;lg0.rotation.z=w?sd*Math.max(0,Math.cos(p))*.35:0})})})});
B('oktopus','Oktopusarme','tier',.55,(g,c)=>{const{s,m,y0}=c;const tm=m.gloss(PAL.coral),su=m.c(PAL.cream);
  range(8,(t,i)=>{const an=i/8*TAU+PI/8,T=grp(g,[0,y0+.05*s,0],[0,an,0]);const zz=(i%2?1:-1);const Y=v=>v*s-(y0+.05*s);
    const pts=[[.05*s,0,0],[.2*s,Y(y0/s*.62),0],[.34*s,Y(.17),.02*s*zz],[.5*s,Y(.07),.05*s*zz],[.63*s,Y(.08),.07*s*zz],[.71*s,Y(.17),.06*s*zz],[.65*s,Y(.26),.04*s*zz],[.57*s,Y(.2),.02*s*zz]];
    const rr=[.13,.12,.1,.078,.062,.048,.036,.03].map(v=>v*s);
    const geo=tubeR(pts,rr);groundGeo(geo,-(y0+.05*s));const dy=geo.userData.dy;P(T,geo,tm);
    P(T,G.s(rr[7]),tm,[pts[7][0],pts[7][1]+dy,pts[7][2]]);
    [[4,0,1],[5,-1,0],[6,0,-1]].forEach(([k,dx,dyy])=>P(T,G.s(.024*s),su,[pts[k][0]+dx*rr[k]*.85,pts[k][1]+dy+dyy*rr[k]*.85,pts[k][2]],null,[1,1,.7]));
    c.an((tt,w)=>{T.rotation.z=Math.max(0,Math.sin(tt*(w?4:1.4)+i*.9))*(w?.16:.04);T.rotation.y=an+Math.sin(tt*(w?3:1.1)+i)*(w?.12:.05)})})});

B('schneckenfuss','Schneckenfuss','tier',.18,(g,c)=>{const{s,m}=c;const ft=m.gloss(PAL.sand),rim=m.c(PAL.cream),sh=m.gloss(PAL.clay),sw=m.c(PAL.cream);
  const F=grp(g,[0,0,0]);
  const geo=tubeR(S(s,[[0,.1,.82],[0,.11,.68],[0,.12,.35],[0,.12,0],[0,.1,-.45],[0,.08,-.85],[0,.05,-1.12]]),[.04,.23,.4,.44,.38,.26,.03].map(v=>v*s));geo.scale(1,.55,1);P(F,groundGeo(geo,.035*s),ft);
  P(F,G.s(1),rim,[0,.05*s,-.12*s],null,[.48*s,.05*s,.98*s]);
  both(sd=>{capAB(F,[sd*.08*s,.14*s,.64*s],[sd*.15*s,.32*s,.82*s],.036*s,ft);P(F,G.s(.052*s),m.gloss(PAL.oak),[sd*.15*s,.32*s,.82*s])});
  const shell=grp(F,[0,.36*s,-.78*s]);P(shell,G.s(.28*s),sh,null,null,[.64,1,1]);
  both(sd=>{const sp=range(28,(t)=>{const a=t*TAU*1.8,r=.23*s*(1-t*.84);return[sd*.172*s,Math.sin(a)*r,Math.cos(a)*r]});P(shell,G.tu(sp,.034*s,.018*s),sw)});
  const trail=P(g,G.s(1),m.slime(PAL.mint),[0,.012*s,-1.35*s],null,[.3*s,.012*s,.45*s]);trail.castShadow=false;
  c.an((t,w)=>{const u=Math.sin(t*(w?6:1.5));F.scale.z=1+u*(w?.05:.012);F.scale.x=1-u*(w?.03:.006);shell.rotation.x=u*(w?.05:.02)})});
B('schlange','Schlangenschwanz','tier',.3,(g,c)=>{const{s,m}=c;const tex=bandTex('snake',PAL.teal,PAL.lemon,18,.32),sm=m.tex('bn-snake',tex,{gloss:1});
  const K=18,pts=[[0,.46*s,.02*s],[0,.36*s,.1*s]],rr=[.17*s,.17*s];
  for(let k=0;k<=K;k++){const u=k/K,a=PI*.5+u*TAU*1.2,R=(.2+.24*u)*s;pts.push([Math.cos(a)*R,(.3-.18*u)*s,Math.sin(a)*R]);rr.push((.165-.045*u)*s)}
  const geo=tubeR(pts,rr,Q(90));groundGeo(geo);const dy=geo.userData.dy;P(g,geo,sm);P(g,G.s(rr[0]),sm,[pts[0][0],pts[0][1]+dy,pts[0][2]]);
  const e=pts[pts.length-1],tail=grp(g,[e[0],e[1]+dy,e[2]]);const a0=PI*.5+TAU*1.2;const dir=[-Math.sin(a0),0,Math.cos(a0)];
  const tp=[[0,0,0],[dir[0]*.18*s,.0,dir[2]*.18*s],[dir[0]*.3*s,.1*s,dir[2]*.3*s],[dir[0]*.34*s,.22*s,dir[2]*.34*s]];
  P(tail,tubeR(tp,[.12,.09,.06,.04].map(v=>v*s)),sm);P(tail,G.s(.055*s),m.gloss(PAL.lemon),[tp[3][0],tp[3][1]+.03*s,tp[3][2]],null,[1,1.3,1]);
  c.an((t,w)=>{tail.rotation.y=Math.sin(t*(w?7:2.2))*(w?.35:.15)})});

B('fisch','Fischschwanz','tier',.4,(g,c)=>{const{s,m,y0}=c;
  const tex=ctex('bn-scales',256,128,(x,W,H)=>{x.fillStyle=PAL.teal;x.fillRect(0,0,W,H);x.strokeStyle=PAL.aqua;x.lineWidth=5;for(let j=-1;j<9;j++)for(let i=-1;i<13;i++){x.beginPath();x.arc(i*22+(j%2?11:0),j*16,11,0,PI);x.stroke()}});
  const sc=m.tex('bn-scales',tex,{gloss:.8}),fin=m.gloss(PAL.lilac);
  P(g,tubeR(S(s,[[0,y0/s+.3,.05],[0,y0/s+.08,.03],[0,.36,0],[0,.24,-.16],[0,.2,-.28]]),[.1,.29,.27,.22,.2].map(v=>v*s)),sc);P(g,G.s(.1*s),sc,[0,y0+.3*s,.05*s]);
  P(g,G.to(.27*s,.05*s),fin,[0,.4*s,0],[PI/2,0,0]);range(5,(t,i)=>{const a=-PI*.8+t*PI*.6;P(g,G.s(.045*s),m.pearl(),[Math.cos(a)*.3*s,.4*s,-Math.sin(a)*.3*s])});
  const T=grp(g,[0,.2*s,-.28*s]);const tp=S(s,[[0,0,0],[.12,-.015,-.2],[.33,.03,-.34],[.5,.16,-.4],[.6,.33,-.38]]);
  P(T,tubeR(tp,[.2,.17,.13,.1,.075].map(v=>v*s)),sc);
  const F=grp(T,tp[4],[0,-.3,-.45]);const fs=sshp(S(s,[[0,-.04],[.14,.06],[.36,.22],[.33,.33],[.14,.22],[0,.17],[-.14,.22],[-.33,.33],[-.36,.22],[-.14,.06]]));
  P(F,G.puff(fs,.04*s),fin,[0,-.03*s,0],null,[1.4,1.4,1]);
  both(sd=>{const sf=grp(g,[sd*.25*s,.3*s,-.02*s],[0,sd*.4,sd*-.5]);P(sf,G.puff(sshp(S(s,[[0,0],[.12,.03],[.2,.12],[.08,.1]])),.025*s),fin)});
  c.an((t,w)=>{const k=t*(w?5:1.6);T.rotation.y=Math.sin(k)*(w?.28:.1);T.rotation.z=Math.max(0,Math.sin(k+1))*(w?.12:.04);F.rotation.x=Math.sin(k-1)*.15})});
B('schwanz','Molchschwanz','tier',.28,(g,c)=>{const{s,m}=c;const bd=m.gloss(PAL.blush),fin=m.gloss(PAL.pink),dot=m.c(PAL.rose);
  [[-1,1,0],[1,1,PI],[-1,-1,PI],[1,-1,0]].forEach(([x,z,ph])=>{const l=grp(g,[x*.3*s,.2*s,z*.2*s]);capAB(l,[0,0,0],[x*.1*s,-.12*s,z*.03*s],.07*s,bd);
    const f=grp(l,[x*.12*s,-.2*s,z*.05*s]);P(f,G.s(1),bd,[0,.04*s,.02*s],null,[.09*s,.04*s,.1*s]);range(3,(t,i)=>P(f,G.s(.028*s),bd,[(t-.5)*.1*s,.028*s,.11*s]));
    c.an((t,w)=>{const p=t*8+ph;l.rotation.y=w?Math.sin(p)*.45:0;l.rotation.z=w?x*Math.max(0,Math.cos(p))*.3:0})});
  const T=grp(g,[0,.28*s,-.28*s]);const tp=S(s,[[0,.2,.2],[0,0,0],[0,-.08,-.25],[0,-.14,-.55],[0,-.15,-.82],[0,-.13,-1.05]]);
  P(T,tubeR(tp,[.08,.2,.15,.1,.065,.02].map(v=>v*s)),bd);P(T,G.s(.08*s),bd,tp[0]);
  const fs=sshp(S(s,[[.3,0],[.55,.13],[.85,.15],[1.1,.06],[1.2,-.02],[1.05,-.1],[.8,-.12],[.55,-.07]]));P(T,G.puff(fs,.02*s),fin,[0,-.13*s,0],[0,PI/2,0]);
  [[.4,.1,.08],[.62,.07,-.07],[.82,.05,.06]].forEach(([u,r,x])=>P(T,G.s(r*.3*s),dot,[x*s,-.1*s+ r*.8*s-.04*s,-u*s]));
  c.an((t,w)=>{T.rotation.y=Math.sin(t*(w?6:1.5))*(w?.35:.12)})});

B('kaenguru','Kängurubeine','tier',.7,(g,c)=>{const{s,m,y0}=c;const sk=m.skin(),cl2=m.c(PAL.cream);
  const legs=[];both(sg=>{const l=grp(g,[sg*.3*s,y0+.02*s,0]);const Y=v=>v*s-(y0+.02*s);
    P(l,G.s(.2*s),sk,[0,-.14*s,-.02*s],null,[.9,1.25,1.3]);
    capAB(l,[0,Y(.42),.06*s],[0,Y(.13),-.12*s],.078*s,sk);
    capAB(l,[0,Y(.075),-.13*s],[0,Y(.075),.3*s],.075*s,sk);
    range(3,(t,i)=>P(l,G.s(.03*s),cl2,[(t-.5)*.08*s,Y(.035),.37*s],null,[1,.8,1.3]));
    legs.push(l)});
  const tl=grp(g,[0,y0+.12*s,-.3*s]);const Y=v=>v*s-(y0+.12*s);
  const tg=tubeR([[0,0,0],[0,Y(y0/s-.1),-.25*s],[0,Y(.2),-.55*s],[0,Y(.08),-.8*s],[0,Y(.065),-.98*s]],[.17,.15,.11,.075,.05].map(v=>v*s));groundGeo(tg,-(y0+.12*s));P(tl,tg,sk);P(tl,G.s(.17*s),sk,[0,tg.userData.dy,0]);
  P(tl,G.s(.05*s),sk,[0,Y(.065)+tg.userData.dy,-.98*s]);
  c.an((t,w)=>{const u=w?Math.max(0,Math.sin(t*5.5)):0;legs.forEach(l=>{l.rotation.x=-u*.35;l.position.y=y0+.02*s+u*.07*s});tl.rotation.x=u*.25+(w?0:Math.max(0,Math.sin(t*1.3))*.03)})});

B('ente','Entenfüsse','tier',.38,(g,c)=>{const{s,m,y0}=c;const fh=.06*s,or=m.gloss(PAL.orange),ri=m.c(PAL.apricot);
  both(sg=>{const L=leg(g,c,{x:sg*.22*s,y:y0+.04*s,L1:.19*s,L2:.2*s,fh,ph:phs(sg),stride:.09*s,lift:.07*s,sp:8,toe:.5,
    thigh:(h,L)=>capAB(h,[0,.05*s,0],[0,-L,0],.07*s,or),
    shin:(k,L)=>capAB(k,[0,0,0],[0,-L,0],.055*s,or),
    foot:a=>{const len=.28*s,geo=groundGeo(flatGeo(webShape(3,.52,len,.16*s,.055*s),.026*s),-fh);P(a,geo,or,[0,0,.02*s]);
      range(3,(t,i)=>{const an=-.52+1.04*t;capAB(a,[0,-fh+.046*s,.03*s],[Math.sin(an)*len*.78,-fh+.046*s,.02*s+Math.cos(an)*len*.78],.018*s,ri)});P(a,G.s(.058*s),or)}});
    c.an((t,w)=>{L.hip.rotation.z=w?Math.sin(t*8)*.08:0})})});
B('flamingo','Flamingobein','tier',1.25,(g,c)=>{const{s,m,y0}=c;const fh=.058*s,pk=m.gloss(PAL.pink),kn=m.gloss(PAL.rose),fe=m.plush(PAL.pink);
  range(8,(t,i)=>{const a=i/8*TAU,f=grp(g,[Math.cos(a)*.26*s,y0+.1*s,Math.sin(a)*.26*s],[0,PI/2-a,0]);P(f,G.puff(leafShape(.2*s,.13*s),.04*s),fe,[0,0,0],[PI/2+.9,0,0])});
  leg(g,c,{x:.07*s,y:y0+.04*s,L1:.62*s,L2:.64*s,fh,back:true,stride:.07*s,lift:.1*s,sp:5,toe:.3,
    thigh:(h,L)=>{capAB(h,[0,0,0],[0,-L,0],.05*s,pk)},
    shin:(k,L)=>{P(k,G.s(.075*s),kn);capAB(k,[0,0,0],[0,-L,0],.046*s,pk)},
    foot:a=>{P(a,G.s(.055*s),kn);const len=.25*s;P(a,groundGeo(flatGeo(webShape(3,.5,len,.14*s,.05*s),.02*s),-fh),kn,[0,0,.01*s])}});
  const tk=grp(g,[-.1*s,y0+.02*s,0]);capAB(tk,[0,0,0],[0,-.32*s,.2*s],.05*s,pk);P(tk,G.s(.07*s),kn,[0,-.32*s,.2*s]);
  capAB(tk,[0,-.32*s,.2*s],[0,-.2*s,-.24*s],.045*s,pk);const tf=grp(tk,[0,-.2*s,-.24*s]);P(tf,G.s(.05*s),kn);P(tf,G.puff(webShape(3,.5,.15*s,.09*s,.03*s),.016*s),kn,[0,-.02*s,-.02*s],[PI*.6,0,0]);
  c.an((t,w)=>{tk.rotation.x=Math.sin(t*(w?5:1.2))*(w?.25:.05);tf.rotation.x=Math.sin(t*(w?5:1.2)+1)*.2})});

B('seepferdchen','Seepferdchen-Schwanz','tier',.4,(g,c)=>{const{s,m,y0}=c;const tex=bandTex('seahorse',PAL.honey,PAL.orange,18,.3),sm=m.tex('bn-seahorse',tex,{gloss:.8});
  const pts=S(s,[[0,y0/s+.3,.02],[0,y0/s+.08,-.04],[0,.34,-.3],[.02,.15,-.24],[.12,.12,.02],[.24,.11,.2]]),rr=[.07,.19,.17,.15,.13,.11];
  const Cx=.37,Cy=.28,Cz=.3;for(let k=1;k<=14;k++){const u=k/14,th=-PI/2+u*PI*1.85,R=.17-.1*u;pts.push([(Cx+Math.cos(th)*R)*s,(Cy+Math.sin(th)*R)*s,(Cz+.02*u)*s]);rr.push(.1-.065*u)}
  const geo=tubeR(pts,rr.map(v=>v*s),Q(90));groundGeo(geo);const dy=geo.userData.dy,T=grp(g,[0,0,0]);P(T,geo,sm);P(T,G.s(.07*s),sm,[pts[0][0],pts[0][1]+dy,pts[0][2]]);
  const e=pts[pts.length-1];P(T,G.s(rr[rr.length-1]*s),sm,[e[0],e[1]+dy,e[2]]);
  range(4,(t,i)=>{const q=pts[6+i*3];P(T,G.co(.03*s,.07*s),m.gloss(PAL.lemon),[q[0]+.02*s,q[1]+dy+rr[6+i*3]*s*.9,q[2]],[0,0,-.5])});
  P(g,G.puff(sshp(S(s,[[0,0],[.2,.02],[.27,.18],[.1,.12]])),.022*s),m.gloss(PAL.lemon),[0,.4*s,-.34*s],[0,-PI/2,-.2]);
  c.an((t,w)=>{T.rotation.z=Math.sin(t*(w?4:1.3))*(w?.05:.02);T.scale.x=1+Math.sin(t*(w?4:1.3))*.03})});
B('raupe','Raupenkörper','tier',.4,(g,c)=>{const{s,m}=c;const bd=m.gloss(PAL.grass),sp=m.gloss(PAL.lemon),ft=m.gloss(PAL.moss);
  const segs=range(6,(t,i)=>{const R=(i?.21-i*.018:.3)*s,z=i?-.14*s-i*.27*s:0,sg=grp(g,[0,0,z]);P(sg,G.s(R),bd,[0,R*.95,0],null,[1.1,.95,1]);
    both(sd=>{P(sg,G.s(.045*s),sp,[sd*R*1.02,R*1.02,0],null,[.5,1,1]);P(sg,G.s(.055*s),ft,[sd*R*.6,.04*s,.02*s],null,[1,.75,1])});
    return[sg,i]});
  const last=segs[5][0];P(last,G.co(.035*s,.12*s),m.gloss(PAL.orange),[0,.3*s,-.08*s],[-.5,0,0]);
  c.an((t,w)=>segs.forEach(([sg,i])=>{if(!i)return;const u=Math.max(0,Math.sin(t*(w?5:1.2)-i*.9));sg.position.y=u*(w?.08:.012)*s;sg.scale.set(1,1+u*(w?.06:.02),1)}))});

B('nacktschnecke','Nacktschnecke','tier',.18,(g,c)=>{const{s,m}=c;const bd=m.gloss(PAL.orange),mt=m.gloss(PAL.apricot),dt=m.c(PAL.terracotta);
  const F=grp(g);const geo=tubeR(S(s,[[0,.1,.78],[0,.14,.62],[0,.17,.3],[0,.19,0],[0,.16,-.38],[0,.11,-.75],[0,.07,-1.05],[0,.05,-1.2]]),[.04,.19,.31,.35,.31,.22,.1,.02].map(v=>v*s));
  geo.scale(1,.62,1);P(F,groundGeo(geo),bd);
  P(F,G.s(1),mt,[0,.2*s,-.45*s],null,[.3*s,.14*s,.36*s]);
  [[.2,.22,-.2],[-.21,.2,-.35],[.18,.16,-.7],[-.16,.14,-.85],[.08,.29,-.5]].forEach(([x,y,z])=>P(F,G.s(.035*s),dt,[x*s,y*s,z*s],null,[1,.6,1]));
  const st=[];both(sd=>{const e=grp(F,[sd*.07*s,.17*s,.62*s]);capAB(e,[0,0,0],[sd*.06*s,.24*s,.12*s],.032*s,bd);P(e,G.s(.048*s),m.eye(),[sd*.06*s,.24*s,.12*s]);
    capAB(F,[sd*.1*s,.1*s,.7*s],[sd*.16*s,.1*s,.82*s],.025*s,bd);st.push([e,sd])});
  const trail=P(g,G.s(1),m.slime(PAL.butter),[0,.012*s,-1.35*s],null,[.28*s,.012*s,.42*s]);trail.castShadow=false;
  c.an((t,w)=>{const u=Math.sin(t*(w?6:1.4));F.scale.z=1+u*(w?.05:.01);st.forEach(([e,sd])=>{e.rotation.x=Math.sin(t*1.7+sd)*.12;e.rotation.z=sd*Math.sin(t*1.1)*.1})})});

B('qualle','Quallententakel','tier',.75,(g,c)=>{const{s,m,y0}=c;const fr=m.gloss(PAL.lilac),arm=m.gloss(PAL.pink),th=m.c(PAL.lavender,{opacity:.6}),gl=m.glow(PAL.pink,1.6);
  range(9,(t,i)=>{const a=i/9*TAU;P(g,G.s(.1*s),fr,[Math.cos(a)*.42*s,y0+.1*s,Math.sin(a)*.42*s],null,[1,.7,1])});
  const sw=[];
  range(4,(t,i)=>{const a=i/4*TAU+PI/4,T=grp(g,[Math.cos(a)*.13*s,y0+.05*s,Math.sin(a)*.13*s],[0,-a,0]);const H=y0+.05*s;
    const pts=range(9,(u,k)=>[Math.sin(u*9+i)*.06*s+u*.08*s,-u*(H-.035*s),Math.cos(u*7+i)*.05*s]);const geo=tubeR(pts,range(9,(u)=>(.075-.04*u)*s));P(T,geo,arm);
    const e=pts[8];P(T,G.s(.035*s),arm,[e[0],e[1],e[2]]);sw.push([T,i])});
  range(8,(t,i)=>{const a=i/8*TAU+PI/8,T=grp(g,[Math.cos(a)*.36*s,y0+.07*s,Math.sin(a)*.36*s],[0,-a,0]);const H=y0+.07*s;
    const pts=range(7,(u,k)=>[u*.12*s+Math.sin(u*8+i)*.03*s,-u*(H-.022*s),Math.sin(u*6+i*2)*.03*s]);P(T,tubeR(pts,range(7,(u)=>(.03-.015*u)*s)),th);
    const e=pts[6];P(T,G.s(.022*s),gl,e);sw.push([T,i+4])});
  c.an((t,w)=>sw.forEach(([T,i])=>{T.rotation.x=Math.sin(t*(w?3:1.2)+i*.8)*(w?.14:.06);T.rotation.z=Math.cos(t*(w?2.6:1)+i)*(w?.12:.05)}))});

/* =================================================================
   MASCHINELL
   ================================================================= */
B('raeder','Zwei Räder','masch',.45,(g,c)=>{const{s,m}=c;const fr=m.gloss(PAL.cherry),R=.27*s;
  P(g,G.cy(.045*s,.045*s,1.0*s),m.chrome(),[0,R,0],[0,0,PI/2]);
  P(g,G.bx(.5*s,.26*s,.36*s,.1*s),fr,[0,.36*s,0]);P(g,G.star(.08*s,.04*s,5,.03*s),m.gloss(PAL.lemon),[0,.36*s,.19*s]);
  both(sg=>{wheel(g,c,[sg*.5*s,R,0],R,.17*s,{out:sg});P(g,G.to(.33*s,.04*s,PI),fr,[sg*.5*s,R,0],[0,PI/2,0],[1,1,1.6])})});

B('dreirad','Dreirad','masch',.55,(g,c)=>{const{s,m}=c;const fr=m.gloss(PAL.cherry),ch=m.chrome();
  P(g,G.bx(.56*s,.1*s,.46*s,.05*s),m.gloss(PAL.sky),[0,.5*s,-.08*s]);
  capAB(g,[0,.46*s,-.1*s],[0,.17*s,-.36*s],.05*s,fr);capAB(g,[0,.36*s,-.18*s],[0,.52*s,.44*s],.05*s,fr);
  P(g,G.cy(.035*s,.035*s,.84*s),ch,[0,.17*s,-.36*s],[0,0,PI/2]);
  both(sd=>wheel(g,c,[sd*.42*s,.17*s,-.36*s],.17*s,.11*s,{out:sd,hub:m.gloss(PAL.sky),bolts:4}));
  const fw=wheel(g,c,[0,.25*s,.52*s],.25*s,.11*s,{out:1,hub:m.gloss(PAL.lemon),both:true});
  both(sd=>capAB(g,[sd*.085*s,.55*s,.47*s],[sd*.085*s,.25*s,.52*s],.03*s,fr));P(g,G.bx(.22*s,.06*s,.1*s,.03*s),fr,[0,.56*s,.46*s]);
  capAB(g,[0,.56*s,.46*s],[0,.68*s,.42*s],.03*s,ch);capAB(g,[-.26*s,.68*s,.42*s],[.26*s,.68*s,.42*s],.028*s,ch);
  both(sd=>{P(g,G.ca(.04*s,.1*s),m.gloss(PAL.lemon),[sd*.33*s,.68*s,.42*s],[0,0,PI/2]);P(g,G.co(.03*s,.12*s),m.gloss(PAL.pink),[sd*.42*s,.66*s,.4*s],[0,0,sd*1.9])});
  both(sd=>{const cr=grp(fw.sp,[0,0,sd*.1*s]);capAB(cr,[0,0,0],[0,-.1*s,0],.025*s,ch);const pd=grp(cr,[0,-.1*s,sd*.04*s]);P(pd,G.bx(.1*s,.035*s,.06*s,.015*s),m.gloss(PAL.lemon));
    c.an(()=>{pd.rotation.z=-fw.sp.rotation.z})})});

B('vierrad','Vier Räder','masch',.45,(g,c)=>{const{s,m}=c;const bd=m.gloss(PAL.sky);
  P(g,G.bx(1.0*s,.22*s,1.2*s,.1*s),bd,[0,.3*s,0]);
  both(sd=>both(z=>wheel(g,c,[sd*.5*s,.19*s,z*.38*s],.19*s,.15*s,{out:sd,hub:m.gloss(PAL.lemon),bolts:4})));
  both(z=>P(g,G.bx(.86*s,.08*s,.1*s,.04*s),m.white(),[0,.22*s,z*.62*s]));
  both(sd=>{P(g,G.s(.055*s),m.glow(PAL.butter,2),[sd*.3*s,.33*s,.6*s]);P(g,G.to(.06*s,.018*s),m.white(),[sd*.3*s,.33*s,.6*s]);P(g,G.bx(.1*s,.05*s,.04*s,.02*s),m.gloss(PAL.cherry),[sd*.34*s,.33*s,-.6*s])});
  both(sd=>P(g,G.bx(.02*s,.05*s,.5*s,.01*s),m.white(),[sd*.505*s,.33*s,0]))});

B('kette','Panzerkette','masch',.45,(g,c)=>{const{s,m}=c;const cy=.19*s,Rl=cy-.0175*s,Rb=Rl-.012*s,Lh=.36*s;
  P(g,G.bx(.62*s,.22*s,1.0*s,.08*s),m.gloss(PAL.moss),[0,.36*s,0]);P(g,G.star(.08*s,.04*s,5,.03*s),m.gloss(PAL.lemon),[0,.38*s,.51*s]);
  const lugs=[];both(sd=>{const X=sd*.43*s;const st=new THREE.Shape();st.absarc(Lh,0,Rb,-PI/2,PI/2,false);st.absarc(-Lh,0,Rb,PI/2,PI*1.5,false);const bg=G.puff(st,.15*s,.025*s);bg.rotateY(PI/2);P(g,bg,m.rubber(),[X,cy,0]);
    [-.36,-.12,.12,.36].forEach((z,i)=>{const r=(i%3?.085:.12)*s;P(g,G.cy(r,r,.05*s),i%3?m.gloss(PAL.lemon):m.steel(),[X+sd*.105*s,cy,z*s],[0,0,PI/2]);P(g,G.s(.028*s),m.c(PAL.ink),[X+sd*.135*s,cy,z*s],null,[.6,1,1])});
    range(11,(t,i)=>lugs.push([P(g,G.bx(.205*s,.035*s,.065*s,.012*s),m.c(PAL.ink)),X,i]))});
  const per=4*Lh+TAU/2*Rl*2,place=(o,X,d)=>{d=((d%per)+per)%per;let z,y,r;
    if(d<2*Lh){z=Lh-d;y=cy-Rl;r=0}else if(d<2*Lh+PI*Rl){const a=(d-2*Lh)/Rl;z=-Lh-Rl*Math.sin(a);y=cy-Rl*Math.cos(a);r=a+PI}
    else if(d<4*Lh+PI*Rl){z=-Lh+(d-2*Lh-PI*Rl);y=cy+Rl;r=0}else{const a=(d-4*Lh-PI*Rl)/Rl;z=Lh+Rl*Math.sin(a);y=cy+Rl*Math.cos(a);r=a}
    o.position.set(X,y,z);o.rotation.x=r};
  roll(c,d=>lugs.forEach(([o,X,i])=>place(o,X,i/11*per+d*.9*s)))});

B('hover','Schwebeplatte','masch',.55,(g,c)=>{const{s,m,y0}=c;const pl=grp(g,[0,.36*s,0]);
  P(pl,G.la(S(s,[[0,-.06],[.42,-.06],[.58,-.025],[.62,.01],[.56,.05],[.3,.075],[0,.075]])),m.gloss(PAL.lavender));
  P(pl,G.to(.6*s,.025*s),m.white(),[0,.005*s,0],[PI/2,0,0]);
  const lights=range(8,(t,i)=>{const a=i/8*TAU;return P(pl,G.s(.032*s),m.glow(PAL.aqua,2),[Math.cos(a)*.5*s,-.045*s,Math.sin(a)*.5*s])});
  P(pl,G.cy(.19*s,.15*s,.08*s),m.steel(),[0,-.1*s,0]);const pad=P(pl,G.circ(.14*s),m.glow(PAL.aqua,2.5),[0,-.141*s,0],[PI/2,0,0]);
  P(pl,G.cy(.09*s,.09*s,y0-.36*s+.1*s),m.chrome(),[0,(y0-.36*s+.1*s)/2+.05*s,0]);P(pl,G.to(.12*s,.03*s),m.gloss(PAL.lemon),[0,.1*s,0],[PI/2,0,0]);
  const H0=.22*s,beam=P(g,G.cy(.14*s,.34*s,H0,true),m.dbl(PAL.aqua,{opacity:.22}),[0,H0/2,0]);beam.castShadow=false;
  const ring=P(g,G.ring(.22*s,.36*s),m.c(PAL.aqua,{opacity:.35}),[0,.004*s,0],[-PI/2,0,0]);ring.castShadow=false;
  c.an((t,w)=>{const y=.36*s+Math.sin(t*2.2)*.025*s;pl.position.y=y;const h=y-.14*s;beam.scale.y=h/H0;beam.position.y=h/2;pl.rotation.z=w?.06:Math.sin(t*1.3)*.02;pl.rotation.x=w?.08:0;
    lights.forEach((l,i)=>l.scale.setScalar(.75+.35*Math.max(0,Math.sin(t*5-i*.8))));ring.scale.setScalar(1+Math.sin(t*2.2)*.05)})});

B('rakete','Raketenantrieb','masch',.8,(g,c)=>{const{s,m,y0}=c;
  P(g,G.la(S(s,[[0,.3],[.22,.3],[.31,.4],[.35,.58],[.34,.76],[.29,.86],[0,.86]])),m.white());
  P(g,G.cy(.357*s,.357*s,.08*s),m.gloss(PAL.cherry),[0,.56*s,0]);
  P(g,G.cy(.08*s,.08*s,.04*s),m.glass(PAL.sky),[0,.7*s,.31*s],[PI/2-.1,0,0]);P(g,G.to(.08*s,.022*s),m.chrome(),[0,.7*s,.315*s],[-.1,0,0]);
  const fs=sshp(S(s,[[.24,.66],[.33,.6],[.45,.3],[.52,.07],[.5,0],[.41,0],[.31,.2]]));
  [PI/2,PI/2+TAU/3,PI/2-TAU/3].forEach(a=>{const f=grp(g,[0,0,0],[0,-a,0]);P(f,groundGeo(G.puff(fs,.04*s,.02*s)),m.gloss(PAL.cherry))});
  P(g,G.la(S(s,[[.12,.31],[.14,.28],[.2,.2],[.24,.16],[.2,.16],[.16,.2],[.1,.26],[.1,.31]])),m.steel());
  const fl=grp(g,[0,.17*s,0]);const f1=P(fl,G.co(.15*s,.16*s),m.c(PAL.orange,{opacity:.8}),[0,-.08*s,0],[PI,0,0]);const f2=P(fl,G.co(.08*s,.1*s),m.glow(PAL.lemon,2.5),[0,-.05*s,0],[PI,0,0]);
  c.an((t,w,a)=>{const k=(w?.9:.35)+a*.3+Math.sin(t*31)*.08+Math.sin(t*17)*.06;fl.scale.set(1,k,1);fl.scale.x=fl.scale.z=.85+Math.sin(t*23)*.08})});

B('mech','Mech-Beine','masch',.95,(g,c)=>{const{s,m,y0}=c;const fh=.14*s,ar=m.gloss(PAL.orange),bk=m.black();
  both(sg=>leg(g,c,{x:sg*.3*s,y:y0+.04*s,L1:.44*s,L2:.44*s,fh,ph:phs(sg),sp:5.5,lift:.12*s,toe:.15,
    thigh:(h,L)=>{P(h,G.s(.13*s),bk);P(h,G.bx(.22*s,L*.72,.24*s,.08*s),ar,[0,-L*.48,0]);P(h,G.s(.035*s),m.glow(PAL.lemon,2),[sg*.11*s,-L*.35,.08*s])},
    shin:(k,L)=>{P(k,G.s(.11*s),bk);P(k,G.s(.1*s),ar,[0,0,.07*s],null,[1,.9,.6]);P(k,G.bx(.22*s,L*.7,.26*s,.08*s),ar,[0,-L*.5,0],null,[1,1,1]);
      capAB(k,[0,-L*.25,-.14*s],[0,-L*.8,-.14*s],.035*s,m.chrome())},
    foot:a=>{P(a,G.s(.085*s),bk);P(a,G.bx(.3*s,.1*s,.44*s,.045*s),bk,[0,-fh+.05*s,.06*s]);P(a,G.bx(.32*s,.07*s,.14*s,.03*s),ar,[0,-fh+.1*s,.22*s])}}))});

B('huehnermech','Hühner-Mech','masch',.95,(g,c)=>{const{s,m,y0}=c;const fh=.07*s,wt=m.white(),ac=m.gloss(PAL.coral),bk=m.black();
  both(sg=>leg(g,c,{x:sg*.32*s,y:y0+.04*s,L1:.46*s,L2:.5*s,fh,back:true,ph:phs(sg),sp:6,lift:.12*s,toe:.1,
    thigh:(h,L)=>{P(h,G.s(.12*s),bk);P(h,G.bx(.2*s,L*.8,.22*s,.08*s),wt,[0,-L*.5,0]);P(h,G.bx(.21*s,.05*s,.23*s,.02*s),ac,[0,-L*.5,0]);P(h,G.s(.04*s),m.glow(PAL.coral,2),[sg*.1*s,-L*.2,0])},
    shin:(k,L)=>{P(k,G.s(.09*s),bk);P(k,G.bx(.14*s,L*.8,.15*s,.06*s),wt,[0,-L*.5,0]);P(k,G.bx(.15*s,.06*s,.16*s,.025*s),ac,[0,-L*.3,0])},
    foot:a=>{P(a,G.s(.07*s),bk);const y=-fh+.045*s;[-.5,0,.5].forEach(an=>{capAB(a,[0,y,0],[Math.sin(an)*.2*s,y,Math.cos(an)*.24*s],.045*s,bk);P(a,G.s(.035*s),ac,[Math.sin(an)*.24*s,-fh+.035*s,Math.cos(an)*.28*s])});
      capAB(a,[0,y,0],[0,y,-.14*s],.04*s,bk)}}))});

B('vierbeiner','Vierbeiner-Roboter','masch',.7,(g,c)=>{const{s,m,y0}=c;const fh=.06*s,ye=m.gloss(PAL.honey),bk=m.black();
  [[-1,1,0],[1,1,PI],[-1,-1,PI],[1,-1,0]].forEach(([x,z,ph])=>leg(g,c,{x:x*.3*s,z:z*.28*s,y:y0+.03*s,L1:.35*s,L2:.35*s,fh,back:z>0,ph,stride:.09*s,lift:.08*s,sp:8,toe:0,
    thigh:(h,L)=>{P(h,G.s(.1*s),bk);P(h,G.bx(.11*s,L*.9,.13*s,.05*s),ye,[0,-L*.48,0])},
    shin:(k,L)=>{P(k,G.s(.07*s),bk);capAB(k,[0,0,0],[0,-L,0],.042*s,bk)},
    foot:a=>P(a,G.s(.06*s),m.rubber())}))});

B('kugel','Rollkugel','masch',.8,(g,c)=>{const{s,m}=c;const R=.38*s;
  const tex=ctex('bn-ball',512,256,(x,W,H)=>{x.fillStyle=PAL.white;x.fillRect(0,0,W,H);x.fillStyle=PAL.orange;x.fillRect(0,H*.2,W,H*.04);x.fillRect(0,H*.76,W,H*.04);
    for(let i=0;i<4;i++){const cx=i*W/4+W/8;x.fillStyle=PAL.orange;x.beginPath();x.arc(cx,H/2,34,0,TAU);x.fill();x.fillStyle=PAL.white;x.beginPath();x.arc(cx,H/2,20,0,TAU);x.fill();x.fillStyle=PAL.slate;x.beginPath();x.arc(cx,H/2,9,0,TAU);x.fill()}});
  const bw=grp(g,[0,R,0]);const ball=P(bw,G.s(R),m.tex('bn-ball',tex,{gloss:1}),null,[0,0,PI/2]);
  P(g,G.to(.22*s,.055*s),m.chrome(),[0,.74*s,0],[PI/2,0,0]);P(g,G.cy(.2*s,.15*s,.08*s),m.gloss(PAL.orange),[0,.78*s,0]);
  both(sd=>P(g,G.s(.035*s),m.glow(PAL.aqua,2),[sd*.2*s,.75*s,.1*s]));
  roll(c,(d,t,w)=>{bw.rotation.x=d*1.6*s/R;bw.rotation.z=w?0:Math.sin(t*1.2)*.04})});

B('magnet','Magnetschwebe','masch',.75,(g,c)=>{const{s,m}=c;const rd=m.gloss(PAL.cherry),ch=m.chrome();
  P(g,G.cy(.42*s,.45*s,.11*s),m.gloss(PAL.navy),[0,.055*s,0]);P(g,G.cy(.34*s,.36*s,.035*s),ch,[0,.125*s,0]);
  range(6,(t,i)=>{const a=i/6*TAU;P(g,G.s(.03*s),m.glow(PAL.lilac,2),[Math.cos(a)*.435*s,.06*s,Math.sin(a)*.435*s])});
  const top=grp(g,[0,.58*s,0]);P(top,G.to(.25*s,.1*s,PI),rd);both(sd=>{P(top,G.cy(.1*s,.1*s,.12*s),rd,[sd*.25*s,-.06*s,0]);P(top,G.cy(.102*s,.102*s,.09*s),ch,[sd*.25*s,-.165*s,0])});
  const rings=range(3,(t,i)=>P(g,G.to((.26-i*.03)*s,.024*s),m.glow(PAL.lilac,2),[0,(.19+i*.075)*s,0],[PI/2,0,0]));
  c.an((t,w)=>{top.position.y=.58*s+Math.sin(t*2)*.015*s;rings.forEach((r,i)=>{r.position.y=(.19+i*.075)*s+Math.sin(t*3+i*1.4)*.015*s;r.scale.setScalar(1+Math.sin(t*4+i)*.08);r.rotation.z=t*(i%2?1:-1)})})});
B('kabel','Kabelbündel','masch',.65,(g,c)=>{const{s,m}=c;const cols=[PAL.cherry,PAL.lemon,PAL.sky,PAL.grass,PAL.orange,PAL.lilac];
  P(g,G.cy(.18*s,.22*s,.16*s),m.black(),[0,.6*s,0]);range(3,(t,i)=>P(g,G.s(.028*s),m.glow([PAL.grass,PAL.lemon,PAL.cherry][i],2),[(t-.5)*.16*s,.6*s,.2*s]));
  const pl=[];cols.forEach((col,i)=>{const a=i/6*TAU+PI/6,ca=Math.cos(a),sa=Math.sin(a),r=.045*s;
    const pts=[[ca*.1*s,.58*s,sa*.1*s],[ca*.28*s,.38*s,sa*.28*s],[ca*.46*s,r+.02*s,sa*.46*s],[ca*.6*s,r,sa*.6*s]];P(g,tubeR(pts,[r,r,r,r]),m.gloss(col));
    const p=grp(g,[ca*.6*s,0,sa*.6*s],[0,PI/2-a,0]);P(p,G.bx(.12*s,.1*s,.14*s,.035*s),m.white(),[0,.05*s,.06*s]);
    both(sd=>P(p,G.bx(.025*s,.035*s,.07*s,.01*s),m.chrome(),[sd*.03*s,.055*s,.15*s]));pl.push([p,i])});
  c.an((t,w)=>pl.forEach(([p,i])=>{p.position.y=w?Math.max(0,Math.sin(t*9+i*1.3))*.035*s:0}))});

B('rollstuhl','Rollstuhl','masch',.55,(g,c)=>{const{s,m}=c;const fr=m.gloss(PAL.blue),cu=m.gloss(PAL.teal),chm=m.chrome();
  P(g,G.bx(.78*s,.1*s,.6*s,.05*s),cu,[0,.5*s,0]);P(g,G.bx(.76*s,.52*s,.08*s,.04*s),cu,[0,.8*s,-.53*s]);
  both(sd=>{capAB(g,[sd*.4*s,.46*s,-.5*s],[sd*.4*s,1.08*s,-.54*s],.03*s,fr);capAB(g,[sd*.4*s,1.08*s,-.54*s],[sd*.4*s,1.08*s,-.68*s],.04*s,m.rubber());
    capAB(g,[sd*.38*s,.45*s,.28*s],[sd*.32*s,.15*s,.44*s],.03*s,fr);capAB(g,[sd*.4*s,.45*s,-.3*s],[sd*.4*s,.45*s,.3*s],.03*s,fr);
    wheel(g,c,[sd*.52*s,.34*s,-.08*s],.34*s,.09*s,{out:sd,t:.18,hub:m.gloss(PAL.sky),capMat:m.gloss(PAL.lemon),bolts:6});
    P(g,G.to(.28*s,.018*s),chm,[sd*.6*s,.34*s,-.08*s],[0,PI/2,0]);
    const cs=grp(g,[sd*.34*s,0,.4*s]);capAB(cs,[0,.16*s,0],[0,.1*s,0],.022*s,chm);wheel(cs,c,[0,.07*s,0],.07*s,.045*s,{out:sd,bolts:0,hub:m.gloss(PAL.sky),cap:false})});
  P(g,G.bx(.46*s,.04*s,.16*s,.02*s),fr,[0,.14*s,.46*s])});

/* =================================================================
   OBJEKTE
   ================================================================= */
B('pogo','Pogostick','ding',.95,(g,c)=>{const{s,m,y0}=c;const rd=m.gloss(PAL.cherry),ye=m.gloss(PAL.lemon);
  P(g,G.cy(.055*s,.055*s,.52*s),rd,[0,.71*s,0]);capAB(g,[-.36*s,.88*s,.04*s],[.36*s,.88*s,.04*s],.03*s,m.chrome());both(sd=>P(g,G.ca(.045*s,.1*s),ye,[sd*.4*s,.88*s,.04*s],[0,0,PI/2]));
  both(sd=>{capAB(g,[0,.48*s,0],[sd*.2*s,.48*s,0],.028*s,m.chrome());P(g,G.bx(.12*s,.04*s,.13*s,.018*s),ye,[sd*.25*s,.5*s,0])});
  P(g,G.cy(.08*s,.08*s,.04*s),rd,[0,.45*s,0]);
  const Lsp=.25*s,spG=grp(g,[0,.43*s,0]);const coil=P(spG,G.tu(range(Q(70),(t)=>[Math.cos(t*TAU*6)*.075*s,-t*Lsp,Math.sin(t*TAU*6)*.075*s]),.024*s,.024*s,Q(200)),m.chrome());
  const low=grp(g,[0,0,0]);P(low,G.cy(.035*s,.035*s,.28*s),m.steel(),[0,.22*s,0]);P(low,G.cy(.08*s,.08*s,.035*s),rd,[0,.18*s,0]);P(low,G.s(.065*s),m.rubber(),[0,.052*s,0],null,[1,.8,1]);
  c.an((t,w)=>{const off=w?Math.max(0,Math.sin(t*7))*.09*s:0;low.position.y=off;spG.scale.y=(Lsp-off)/Lsp*(w?1:1+Math.sin(t*2)*.012)})});

B('feder','Sprungfeder','masch',.7,(g,c)=>{const{s,m}=c;const L=.58*s,spG=grp(g,[0,.645*s,0]);
  P(spG,G.tu(range(Q(90),(t)=>[Math.cos(t*TAU*4.5)*.25*s,-t*L,Math.sin(t*TAU*4.5)*.25*s]),.048*s,.048*s,Q(220)),m.gloss(PAL.sky));
  P(g,G.cy(.3*s,.3*s,.06*s),m.gloss(PAL.lemon),[0,.67*s,0]);
  const bot=grp(g,[0,0,0]);P(bot,G.cy(.33*s,.35*s,.07*s),m.black(),[0,.035*s,0]);P(bot,G.to(.33*s,.02*s),m.gloss(PAL.lemon),[0,.07*s,0],[PI/2,0,0]);
  c.an((t,w)=>{const off=w?Math.max(0,Math.sin(t*7))*.14*s:0;bot.position.y=off;spG.scale.y=(L-off)/L*(w?1:1+Math.sin(t*2.2)*.01)})});

B('stelzen','Stelzen','ding',1.5,(g,c)=>{const{s,m,y0}=c;const hy=y0+.05*s,fh=.1*s,pole=m.white(),str=m.gloss(PAL.cherry);
  both(sg=>{const l=grp(g,[sg*.26*s,hy,0]);P(l,G.ca(.12*s,.24*s),m.skin(),[0,-.16*s,0]);P(l,G.ca(.1*s,.22*s),m.skin(),[0,-.4*s,0]);
    const an=grp(l,[0,-.57*s,0]);sneaker(an,c,{fh,mat:m.gloss(PAL.sky),w:.2*s,L:.32*s});
    P(l,G.bx(.24*s,.07*s,.34*s,.025*s),m.wood(),[sg*.03*s,-.57*s-fh-.035*s,.05*s]);
    const px=sg*.15*s,top=-.3*s,bot=-hy+.07*s;P(l,G.cy(.06*s,.06*s,top-bot),pole,[px,(top+bot)/2,0]);P(l,G.s(.06*s),pole,[px,top,0]);
    range(6,(t,i)=>P(l,G.cy(.064*s,.064*s,.065*s),str,[px,bot+.1*s+t*(top-bot-.2*s),0]));
    P(l,G.s(.08*s),m.rubber(),[px,-hy+.064*s,0],null,[1,.8,1]);P(l,G.bx(.2*s,.06*s,.22*s,.028*s),m.gloss(PAL.lemon),[sg*.06*s,-.42*s,0]);
    c.an((t,w)=>{if(w){const p=t*4.5+phs(sg);l.rotation.x=Math.sin(p)*.16;l.position.y=hy+Math.max(0,Math.cos(p))*.06*s}else{l.rotation.x=0;l.position.y=hy;l.rotation.z=Math.sin(t*1.1)*.012}})})});

B('buerostuhl','Bürostuhl-Fuss','ding',.6,(g,c)=>{const{s,m}=c;const bk=m.black();
  P(g,G.bx(.8*s,.12*s,.74*s,.06*s),m.gloss(PAL.teal),[0,.54*s,0]);P(g,G.bx(.66*s,.05*s,.6*s,.024*s),bk,[0,.46*s,0]);
  P(g,G.cy(.035*s,.035*s,.14*s),m.chrome(),[0,.38*s,0]);P(g,G.cy(.06*s,.07*s,.2*s),bk,[0,.24*s,0]);
  const base=grp(g,[0,0,0]);P(base,G.cy(.09*s,.1*s,.07*s),bk,[0,.14*s,0]);
  const cas=range(5,(t,i)=>{const a=i/5*TAU+PI/2,ca=Math.cos(a),sa=Math.sin(a);capAB(base,[0,.14*s,0],[ca*.42*s,.1*s,sa*.42*s],.042*s,bk);
    const cs=grp(base,[ca*.42*s,0,sa*.42*s]);P(cs,G.hs(.055*s),bk,[0,.07*s,0]);return wheel(cs,c,[0,.045*s,0],.045*s,.05*s,{bolts:0,cap:false,hub:m.gloss(PAL.teal),t:.35})});
  c.an((t,w)=>{base.rotation.y=w?0:Math.sin(t*.5)*.25})});

B('rollschuhe','Rollschuhe','ding',.8,(g,c)=>{const{s,m,y0}=c;const fh=.25*s,bt2=m.gloss(PAL.pink),ye=m.gloss(PAL.lemon);
  both(sg=>leg(g,c,{x:sg*.27*s,y:y0+.06*s,L1:.33*s,L2:.3*s,fh,ph:phs(sg),stride:.15*s,lift:.03*s,sp:4.5,toe:0,
    thigh:(h,L)=>P(h,G.ca(.125*s,L),m.skin(),[0,-L/2,0]),
    shin:(k,L)=>P(k,G.ca(.108*s,L*.8),m.skin(),[0,-L*.45,0]),
    foot:a=>{P(a,G.cy(.13*s,.135*s,.2*s),bt2,[0,-.03*s,0]);P(a,G.to(.13*s,.03*s),m.white(),[0,.07*s,0],[PI/2,0,0]);
      P(a,G.s(1),bt2,[0,-fh+.2*s,.07*s],null,[.13*s,.09*s,.2*s]);P(a,G.bx(.23*s,.04*s,.38*s,.018*s),m.white(),[0,-fh+.135*s,.06*s]);
      P(a,G.bx(.14*s,.03*s,.3*s,.012*s),m.chrome(),[0,-fh+.105*s,.06*s]);P(a,G.s(.05*s),m.gloss(PAL.cherry),[0,-fh+.1*s,.28*s]);
      range(3,(t,i)=>P(a,G.ca(.018*s,.12*s),m.white(),[0,(-.1+t*.1)*s,.128*s],[0,0,PI/2]));
      both(z=>both(x=>{const wg=grp(a,[x*.085*s,-fh+.05*s,(z*.12+.06)*s]);P(wg,G.cy(.05*s,.05*s,.05*s),ye,null,[0,0,PI/2]);P(wg,G.s(.02*s),m.white(),[x*.026*s,0,0])}))}}))});

B('ski','Skier','ding',.8,(g,c)=>{const{s,m,y0}=c;const fh=.24*s,bo=m.gloss(PAL.sky),sk=m.gloss(PAL.cherry);
  const shape=sshp(S(s,[[-.46,0],[.5,0],[.62,.03],[.7,.13],[.66,.15],[.58,.07],[.48,.035],[-.46,.035]]));
  both(sg=>leg(g,c,{x:sg*.27*s,y:y0+.06*s,L1:.33*s,L2:.33*s,fh,ph:phs(sg),stride:.16*s,lift:.015*s,sp:4.5,toe:0,
    thigh:(h,L)=>P(h,G.ca(.125*s,L),m.skin(),[0,-L/2,0]),
    shin:(k,L)=>P(k,G.ca(.108*s,L*.8),m.skin(),[0,-L*.45,0]),
    foot:a=>{P(a,G.cy(.13*s,.135*s,.18*s),bo,[0,-.02*s,0]);P(a,G.bx(.22*s,.18*s,.34*s,.075*s),bo,[0,-fh+.16*s,.04*s]);
      range(2,(t,i)=>P(a,G.bx(.2*s,.035*s,.05*s,.015*s),m.gloss(PAL.lemon),[0,(.02-t*.14)*s,.12*s+t*.05*s]));
      const geo=G.puff(shape,.1*s,.014*s);geo.rotateY(-PI/2);groundGeo(geo,-fh);P(a,geo,sk,[0,0,.08*s])}}))});

B('einrad','Einrad','ding',.85,(g,c)=>{const{s,m,y0}=c;const fr=m.gloss(PAL.cherry);const W=grp(g);
  const wh=wheel(W,c,[0,.3*s,0],.3*s,.1*s,{out:1,both:true,hub:m.gloss(PAL.lemon)});
  both(sd=>capAB(W,[sd*.085*s,.3*s,0],[sd*.085*s,.58*s,0],.032*s,fr));P(W,G.bx(.22*s,.07*s,.1*s,.03*s),fr,[0,.6*s,0]);
  P(W,G.cy(.04*s,.04*s,.2*s),m.chrome(),[0,.72*s,0]);P(W,G.bx(.3*s,.08*s,.44*s,.04*s),m.black(),[0,.8*s,0]);P(W,G.bx(.08*s,.02*s,.4*s,.01*s),m.white(),[0,.842*s,0]);
  both(sd=>{const cr=grp(wh.sp,[0,0,sd*.1*s]);capAB(cr,[0,0,0],[sd*0,-.13*s*sd,0],.025*s,m.chrome());const pd=grp(cr,[0,-.13*s*sd,sd*.04*s]);P(pd,G.bx(.1*s,.035*s,.07*s,.015*s),m.gloss(PAL.lemon));c.an(()=>{pd.rotation.z=-wh.sp.rotation.z})});
  c.an((t,w)=>{W.rotation.z=Math.sin(t*(w?3:1.3))*(w?.05:.025);W.rotation.x=w?.04:0})});

B('huepfball','Hüpfbälle','ding',.6,(g,c)=>{const{s,m}=c;const R=.3*s;
  both(sg=>{const col=sg>0?PAL.orange:PAL.sky,b=grp(g,[sg*.3*s,0,0]);const ball=grp(b,[0,R,0]);P(ball,G.s(R),m.gloss(col));P(ball,G.to(R*1.0,.014*s),m.white(),null,[PI/2,0,0]);
    const hd=new V3(sg*.35,.62,.7).normalize();both(k=>{const d=new V3(hd.x+k*.18,hd.y,hd.z).normalize();const p0=d.clone().multiplyScalar(R*.85),p1=d.clone().multiplyScalar(R*1.28);
      capAB(ball,[p0.x,p0.y,p0.z],[p1.x,p1.y,p1.z],.04*s,m.gloss(col));P(ball,G.s(.048*s),m.gloss(col),[p1.x,p1.y,p1.z])});
    c.an((t,w)=>{const u=w?Math.max(0,Math.sin(t*6+(sg>0?0:PI))):Math.max(0,Math.sin(t*1.6+(sg>0?0:2)))*.2;const sy=1-u*.12,sx=1+u*.08;ball.scale.set(sx,sy,sx);ball.position.y=R*sy})})});

B('einkaufswagen','Einkaufswagen-Rollen','ding',.35,(g,c)=>{const{s,m}=c;const chm=m.chrome();
  P(g,G.bx(1.0*s,.05*s,1.0*s,.022*s),chm,[0,.31*s,0]);range(4,(t,i)=>P(g,G.bx(.9*s,.02*s,.02*s,.009*s),chm,[0,.338*s,(t-.5)*.7*s]));
  both(z=>P(g,G.bx(1.06*s,.08*s,.09*s,.04*s),m.gloss(PAL.cherry),[0,.31*s,z*.52*s]));
  both(x=>both(z=>{const cs=grp(g,[x*.38*s,0,z*.38*s]);P(cs,G.cy(.07*s,.07*s,.03*s),chm,[0,.275*s,0]);both(k=>P(cs,G.bx(.02*s,.2*s,.07*s,.009*s),chm,[k*.035*s,.17*s,0]));
    const w=wheel(cs,c,[0,.08*s,0],.08*s,.045*s,{hub:m.gloss(PAL.sky),bolts:0,cap:false,t:.3,tire:m.gloss(PAL.blue)});P(w.sp,G.bx(.03*s,.1*s,.05*s,.01*s),m.white())}))});

B('hocker','Hockerbeine','ding',.75,(g,c)=>{const{s,m}=c;const lw=m.c(PAL.oak,{gloss:.5});
  P(g,G.la(S(s,[[0,-.05],[.42,-.05],[.46,-.02],[.46,.02],[.42,.05],[0,.05]])),m.wood(),[0,.7*s,0]);
  range(3,(t,i)=>{const a=i/3*TAU+PI/2,ca=Math.cos(a),sa=Math.sin(a),l=grp(g,[ca*.26*s,.66*s,sa*.26*s]);const e=[ca*.14*s,-.624*s,sa*.14*s];
    taper(l,[0,0,0],e,.058*s,.046*s,lw,false);P(l,G.to(.054*s,.017*s),m.gloss(PAL.cherry),[e[0]*.45,e[1]*.45,e[2]*.45],[PI/2,0,0]);
    P(l,G.s(.06*s),m.gloss(PAL.cherry),[e[0],e[1]+.001*s,e[2]],null,[1,.62,1]);
    c.an((tt,w)=>{if(w){const p=tt*7+i*TAU/3;l.rotation.x=Math.sin(p)*.12;l.position.y=.66*s+Math.max(0,Math.cos(p))*.04*s+Math.abs(Math.sin(p))*.02*s}else{l.rotation.x=0;l.position.y=.66*s}})})});
B('tischbeine','Tischbeine','ding',.75,(g,c)=>{const{s,m}=c;
  const tex=ctex('bn-karo',128,128,(x,W,H)=>{x.fillStyle=PAL.white;x.fillRect(0,0,W,H);x.fillStyle='rgba(240,85,110,.55)';for(let i=0;i<8;i++){x.fillRect(i*16,0,8,H);x.fillRect(0,i*16,W,8)}});
  P(g,G.bx(1.0*s,.09*s,1.0*s,.04*s),m.tex('bn-karo',tex),[0,.705*s,0]);
  const prof=S(s,[[.001,0],[.065,0],[.065,-.05],[.045,-.09],[.06,-.17],[.04,-.28],[.034,-.44],[.05,-.52],[.034,-.58],[.001,-.6]]);
  [[-1,1,0],[1,1,PI],[-1,-1,PI],[1,-1,0]].forEach(([x,z,ph])=>{const l=grp(g,[x*.38*s,.66*s,z*.38*s]);P(l,G.la(prof),m.c(PAL.oak,{gloss:.5}));P(l,G.s(.058*s),m.gloss(PAL.cherry),[0,-.602*s,0]);
    c.an((t,w)=>{if(w){const p=t*7+ph;l.rotation.x=Math.sin(p)*.14;l.position.y=.66*s+Math.max(0,Math.cos(p))*.04*s}else{l.rotation.x=0;l.position.y=.66*s}})})});

B('skateboard','Skateboard','ding',.24,(g,c)=>{const{s,m}=c;const D=grp(g,[0,0,0]);
  const shape=sshp(S(s,[[-.58,.14],[-.7,.22],[-.77,.21],[-.68,.11],[-.52,.055],[.52,.055],[.68,.11],[.77,.21],[.7,.22],[.58,.14],[.44,.105],[-.44,.105]]));
  const geo=G.puff(shape,.5*s,.025*s);geo.rotateY(-PI/2);groundGeo(geo,.15*s);P(D,geo,m.gloss(PAL.lilac));
  P(D,G.star(.1*s,.05*s,5,.02*s),m.gloss(PAL.lemon),[.3*s,.215*s,-.2*s],[-PI/2,0,0]);
  both(z=>{P(D,G.bx(.12*s,.03*s,.14*s,.012*s),m.chrome(),[0,.14*s,z*.44*s]);P(D,G.bx(.42*s,.04*s,.07*s,.018*s),m.chrome(),[0,.1*s,z*.44*s]);
    both(x=>wheel(D,c,[x*.24*s,.068*s,z*.44*s],.068*s,.06*s,{out:x,bolts:0,cap:false,t:.45,tire:m.gloss(PAL.lemon),hub:m.white()}))});
  c.an((t,w)=>{D.rotation.z=Math.sin(t*(w?2.5:1))*(w?.05:.015)})});
B('wolke','Wolke','ding',.55,(g,c)=>{const{s,m}=c;const wm=m.plush('#F6F7FF'),lo=m.plush('#DCE4FF');const cl2=grp(g,[0,0,0]);
  [[0,.4,0,.36,1],[.4,.28,.06,.28,0],[-.41,.29,0,.29,0],[.17,.33,.33,.26,1],[-.2,.31,.31,.25,1],[.15,.35,-.32,.26,1],[-.22,.33,-.27,.26,1],[.58,.2,-.12,.2,0],[-.58,.2,-.14,.2,0],[0,.22,.18,.22,0],[.06,.24,-.14,.24,0],[.3,.36,-.02,.22,1],[-.3,.36,.06,.22,1]]
    .forEach(([x,y,z,r,top])=>P(cl2,G.s(r*s),top?wm:lo,[x*s,Math.max(y,r)*s,z*s]));
  const drops=range(5,(t,i)=>{const a=i/5*TAU+.4;const d=P(g,G.drop(.04*s,.06*s),m.gloss(PAL.sky),[Math.cos(a)*.62*s,.3*s,Math.sin(a)*.62*s],[PI,0,0]);d.visible=false;return[d,i]});
  c.an((t,w,act)=>{cl2.scale.set(1+Math.sin(t*1.6)*.02,1-Math.sin(t*1.6)*.025,1+Math.sin(t*1.6)*.02);cl2.rotation.y=Math.sin(t*.5)*.08;
    drops.forEach(([d,i])=>{d.visible=act>.02;const u=act>.02?((t*1.8+i*.27)%1):0;d.position.y=(.3-u*.24)*s})})});
B('blumentopf','Blumentopf','ding',.72,(g,c)=>{const{s,m}=c;const tc=m.c(PAL.terracotta),lf=m.gloss(PAL.leaf);const T=grp(g);
  P(T,G.la(S(s,[[0,0],[.48,0],[.52,.02],[.52,.055],[.46,.06],[0,.06]])),m.c(PAL.clay));
  P(T,G.la(S(s,[[0,.055],[.38,.055],[.41,.08],[.51,.5],[.59,.51],[.62,.54],[.62,.7],[.59,.72],[.54,.7],[.53,.67],[0,.67]])),tc);
  P(T,G.s(.53*s),m.c(PAL.choc),[0,.665*s,0],null,[1,.08,1]);P(T,G.to(.465*s,.022*s),m.c(PAL.cream),[0,.31*s,0],[PI/2,0,0],[1.01,1.01,1]);
  P(T,G.heart(.075*s,.03*s),m.gloss(PAL.pink),[0,.22*s,.465*s],[-.24,0,0]);
  const sp=[];[[.36,.3,.4],[-.38,.26,.7],[.05,-.52,.2]].forEach(([x,z,k])=>{const st=grp(T,[x*s,.67*s,z*s]);capAB(st,[0,0,0],[0,.14*s,0],.024*s,lf);
    both(sd=>P(st,G.puff(leafShape(.14*s,.1*s),.024*s),lf,[0,.14*s,0],[0,0,-sd*1.0]));sp.push([st,k])});
  c.an((t,w)=>{T.rotation.z=w?Math.sin(t*6)*.04:0;T.position.y=w?Math.abs(Math.sin(t*6))*.024*s:0;sp.forEach(([st,k])=>st.rotation.z=Math.sin(t*1.8+k*3)*.15)})});
/* =================================================================
   PFLANZLICH
   ================================================================= */
B('wurzeln','Wurzeln','pflanze',.35,(g,c)=>{const{s,m,y0}=c;const rt=m.c(PAL.wood),lf=m.gloss(PAL.leaf);
  P(g,G.hs(.46*s),m.c(PAL.choc),[0,0,0],null,[1,.42,1]);P(g,G.s(.26*s),m.c(PAL.oak),[0,.28*s,0],null,[1,.75,1]);
  const R=[];range(7,(t,i)=>{const a=i/7*TAU+.2,ca=Math.cos(a),sa=Math.sin(a),T=grp(g);const w=(i%2?1:-1)*.15;
    const pts=[[ca*.12*s,.32*s,sa*.12*s],[ca*.32*s,.22*s,sa*.32*s],[Math.cos(a+w)*.52*s,.1*s,Math.sin(a+w)*.52*s],[Math.cos(a+w*2)*.72*s,.04*s,Math.sin(a+w*2)*.72*s],[Math.cos(a+w*2.6)*.84*s,0,Math.sin(a+w*2.6)*.84*s]];
    const geo=tubeR(pts,[.095,.08,.058,.035,.016].map(v=>v*s));groundGeo(geo);P(T,geo,rt);R.push([T,i])});
  [[.2,.12,.8],[-.25,-.05,.6],[.02,-.3,.7]].forEach(([x,z,k],i)=>{const st=grp(g,[x*s,.16*s,z*s]);capAB(st,[0,0,0],[0,.1*s,0],.018*s,lf);
    both(sd=>P(st,G.puff(leafShape(.1*s,.07*s),.018*s),lf,[0,.1*s,0],[0,i,-sd*1.1]));R.push([st,i+7])});
  const mu=grp(g,[-.32*s,.1*s,.22*s]);P(mu,G.cy(.03*s,.035*s,.1*s),m.c(PAL.cream),[0,.04*s,0]);P(mu,G.hs(.07*s),m.gloss(PAL.cherry),[0,.08*s,0],null,[1,.8,1]);
  both(sd=>P(mu,G.s(.014*s),m.white(),[sd*.03*s,.125*s,.02*s]));
  c.an((t,w)=>R.forEach(([T,i])=>{if(i>=7)T.rotation.z=Math.sin(t*1.7+i)*.15;else T.scale.y=1+Math.sin(t*(w?5:1.2)+i)*(w?.06:.015)}))});

B('stamm','Baumstamm','pflanze',.65,(g,c)=>{const{s,m}=c;const bk=m.c(PAL.choc),bd=m.c(PAL.bark),lf=m.gloss(PAL.leaf);
  P(g,G.la(S(s,[[0,0],[.5,0],[.47,.06],[.42,.16],[.4,.35],[.41,.55],[.43,.64],[.42,.67],[0,.67]])),bk);
  range(7,(t,i)=>{const a=i/7*TAU+.3;capAB(g,[Math.cos(a)*.405*s,.22*s,Math.sin(a)*.405*s],[Math.cos(a)*.415*s,.56*s,Math.sin(a)*.415*s],.022*s,bd)});
  range(5,(t,i)=>{const a=i/5*TAU+.6,ca=Math.cos(a),sa=Math.sin(a);const geo=tubeR([[ca*.3*s,.3*s,sa*.3*s],[ca*.46*s,.12*s,sa*.46*s],[ca*.62*s,.05*s,sa*.62*s],[ca*.72*s,.03*s,sa*.72*s]],[.12,.1,.06,.03].map(v=>v*s));groundGeo(geo);P(g,geo,bk)});
  P(g,G.s(.14*s),m.c(PAL.moss),[.3*s,.08*s,.38*s],null,[1.2,.55,1]);
  const br=grp(g,[-.4*s,.42*s,.1*s],[0,0,.7]);capAB(br,[0,0,0],[0,.2*s,0],.04*s,bk);both(sd=>P(br,G.puff(leafShape(.14*s,.09*s),.02*s),lf,[0,.2*s,0],[0,sd*.4,-sd*.9]));
  const mu=grp(g,[.48*s,0,-.3*s]);P(mu,G.cy(.035*s,.04*s,.1*s),m.c(PAL.cream),[0,.05*s,0]);P(mu,G.hs(.085*s),m.gloss(PAL.cherry),[0,.09*s,0],null,[1,.8,1]);
  range(3,(t,i)=>{const a=i*2.1;P(mu,G.s(.016*s),m.white(),[Math.cos(a)*.045*s,.14*s,Math.sin(a)*.045*s])});
  c.an((t,w)=>{br.rotation.z=.7+Math.sin(t*1.5)*.08})});

B('pilzstiel','Pilzstiel','pflanze',.75,(g,c)=>{const{s,m}=c;const st=m.c(PAL.sand);
  P(g,G.hs(.5*s),m.c(PAL.moss),[0,0,0],null,[1,.2,1]);
  P(g,G.la(S(s,[[0,0],[.34,0],[.41,.05],[.41,.14],[.33,.26],[.28,.45],[.29,.65],[.33,.77],[0,.77]])),st);
  P(g,G.to(.31*s,.06*s),m.c(PAL.cream),[0,.53*s,0],[PI/2,0,0],[1,1,.6]);
  [[.2,.9],[.33,-.2],[.62,.5],[.4,1.9],[.55,-1.1]].forEach(([y,a])=>{const r=y<.3?.37:.29;P(g,G.s(.032*s),m.c(PAL.oak),[Math.sin(a)*r*s,y*s,Math.cos(a)*r*s],[0,a,0],[1,1,.45])});
  const bb=[];[[.46,.2,1],[-.42,.3,.8],[.2,-.46,.7]].forEach(([x,z,k],i)=>{const b=grp(g,[x*s,.02*s,z*s]);P(b,G.cy(.035*s*k,.045*s*k,.12*s*k),st,[0,.06*s*k,0]);
    P(b,G.hs(.08*s*k),m.gloss(i===1?PAL.honey:PAL.cherry),[0,.11*s*k,0],null,[1,.75,1]);range(2,(t,j)=>P(b,G.s(.016*s*k),m.white(),[(t-.5)*.06*s*k,.16*s*k,.03*s*k]));bb.push([b,i])});
  c.an((t,w)=>bb.forEach(([b,i])=>{b.rotation.z=Math.sin(t*(w?6:1.5)+i*2)*(w?.2:.06)}))});

B('ranken','Rankenfüsse','pflanze',.8,(g,c)=>{const{s,m,y0}=c;const vn=m.c(PAL.forest),v2=m.c(PAL.moss),lf=m.gloss(PAL.grass);
  both(sg=>{const hy=y0+.05*s,l=grp(g,[sg*.26*s,hy,0]);const H=hy-.07*s;
    P(l,tubeR(range(9,(u)=>[Math.sin(u*9)*.045*s,-u*H,Math.cos(u*9)*.045*s]),range(9,(u)=>(.08-.02*u)*s)),vn);
    P(l,tubeR(range(9,(u)=>[Math.sin(u*9+PI)*.05*s,-u*H*.94,Math.cos(u*9+PI)*.05*s]),range(9,(u)=>(.05-.02*u)*s)),v2);
    const lv=[];[[.25,1.2],[.5,-1.4],[.72,1.8]].forEach(([u,a],i)=>{const q=grp(l,[Math.sin(u*9)*.05*s,-u*H,Math.cos(u*9)*.05*s],[0,a*.25,0]);
      P(q,G.puff(leafShape(.22*s,.15*s),.022*s),lf,[0,0,0],[.35,0,(i%2?1:-1)*1.15]);lv.push([q,i])});
    const td=range(14,(t)=>{const a=t*TAU*1.6,r=.07*s*(1-t*.7);return[sg*(.05*s+t*.08*s),-.35*H+Math.sin(a)*r,Math.cos(a)*r+.02*s]});P(l,G.tu(td,.018*s,.012*s),v2);
    const ft=grp(l,[0,-hy,0]);P(ft,groundGeo(flatGeo(leafShape(.34*s,.2*s),.035*s)),lf,[0,0,-.06*s]);P(ft,G.s(.075*s),vn,[0,.07*s,0],null,[1,.9,1]);
    c.an((t,w)=>{if(w){const p=t*6+phs(sg);l.rotation.x=Math.sin(p)*.28;l.position.y=hy+Math.max(0,Math.cos(p))*.06*s;ft.rotation.x=-l.rotation.x}else{l.rotation.x=0;l.position.y=hy;ft.rotation.x=0}
      lv.forEach(([q,i])=>q.rotation.z=Math.sin(t*2+i*1.7)*.2)})})});
})();
