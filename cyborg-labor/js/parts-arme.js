/* =====================================================================
   ARME · Cozy-Toy-Stil
   Jede Seite wird für die RECHTE Seite gebaut (+x = aussen, -y = nach unten,
   +z = vorne) und für links per Spiegel-Gruppe (scale.x = -1) gespiegelt.
   ===================================================================== */
(function(){
const A=(id,n,k,b)=>def('arme',id,n,k,b);
const WH='#F6F4FF';
const pr=(pts,s)=>pts.map(p=>[p[0]*s,p[1]*s]);
const sm=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
/* akkumulierender Dreher (Geschwindigkeit darf sich ändern, ohne zu springen) */
const spinner=()=>{let a=0,l=null;return(t,sp)=>{const dt=l==null?t:Math.min(.1,Math.max(0,t-l));l=t;a+=dt*sp;return a}};

/* ---------- Schulter-Rig ----------
   opt (oder sg=>opt): rz Abspreizen, fx Vor/Zurück, dx/dy/dz Versatz (×s), walk/idle Schwung, lift Heben bei Aktion, out Abspreizen bei Aktion.
   build(q,sg,R,o): q ist die gespiegelte Gruppe. R.tick=(t,laeuft,aktion)=>… für eigene Bewegungen. */
function rig(g,c,opt,build){
  both(sg=>{const o=(typeof opt==='function'?opt(sg):opt)||{};const s=c.s;
    const sh=grp(g,[sg*(c.shX+(o.dx||0)*s),c.shY+(o.dy||0)*s,(o.dz||0)*s]);
    const a=grp(sh);const q=grp(a);const K=o.k??1.12;q.scale.set(sg*K,K,K);
    const R={sg,a,q,tick:null};build(q,sg,R,o);
    const ph=sg>0?0:PI,rz=o.rz??.3,fx=o.fx||0,walk=o.walk??.5,idle=o.idle??.05,lift=o.lift??1.2,out=o.out??.15;
    c.an((t,w,act)=>{
      const sw=w?Math.sin(t*6.3+ph)*walk:Math.sin(t*1.6+ph)*idle;
      const spring=Math.sin(Math.min(1,act)*PI)*.16;
      a.rotation.x=fx+sw*(1-act)-act*lift-spring;
      a.rotation.z=sg*(rz+(w?Math.abs(Math.sin(t*6.3))*.04:Math.sin(t*1.6+ph+1.2)*.03)+act*out);
      if(R.tick)R.tick(t,w,act);
    })})}

/* ---------- Flügel-Rig (Rücken) ---------- */
function backW(g,c,opt,build){
  both(sg=>{const o=opt||{};const s=c.s;
    const root=grp(g,[sg*(o.x??.1)*s,c.shY+(o.dy||0)*s,-c.rs[c.n-1]*(o.z??.78)]);
    const f=grp(root);const q=grp(f);q.scale.x=sg;const R={sg,f,q,tick:null};build(q,sg,R);
    c.an((t,w,act)=>{const sp=(o.f??3.2)*(1+act*1.4)*(w?1.3:1);const fl=Math.sin(t*sp+(o.ph||0));
      f.rotation.y=sg*((o.base??.4)+fl*(o.amp??.3)*(1+act*.5));
      f.rotation.z=sg*((o.tilt??.12)+(o.flapZ?fl*o.flapZ*(1+act*.6):0));
      if(R.tick)R.tick(t,w,act,fl)})})}

/* ---------- Oberarm + Unterarm mit Kugelgelenken ---------- */
function arm2(q,c,mat,o){o=o||{};const s=c.s;const L1=(o.L1??.24)*s,L2=(o.L2??.22)*s,r1=(o.r1??.1)*s,r2=(o.r2??.092)*s;
  P(q,G.s(r1*1.14),mat);
  P(q,G.ca(r1,L1),mat,[0,-L1/2,0]);
  const el=grp(q,[0,-L1,0],[o.bend??-.22,0,o.bendZ||0]);
  P(el,G.ca(r2,L2),mat,[0,-L2/2,0]);
  const wr=grp(el,[0,-L2,0]);
  return{el,wr,L1,L2,r1,r2}}

/* ---------- Fäustling-Hand (3 Stummelfinger + Daumen) ---------- */
function mitten(p,c,mat,r,o){o=o||{};const h=grp(p,[0,0,0],[0,o.ry??-.45,0]);
  P(h,G.s(r),mat,[0,-r*.8,0],null,[.82,1,1.05]);
  const n=o.n??3,F=[];
  for(let i=0;i<n;i++){const u=n>1?i/(n-1)-.5:0;const f=grp(h,[-r*.04,-r*1.45,u*r*1.15-r*.14],[-u*.5,0,0]);P(f,G.ca(r*.31,r*.3),mat,[0,-r*.22,0]);F.push(f)}
  const th=grp(h,[-r*.12,-r*.75,r*.74],[-1.0,0,-.25]);P(th,G.ca(r*.32,r*.3),mat,[0,-r*.22,0]);
  return{h,F,th,curl(v){F.forEach((f,i)=>f.rotation.z=-v*(1+i*.12));th.rotation.z=-.25-v*.45}}}

/* ---------- Kette aus verschachtelten Segmenten (Tentakel, Ranken) ---------- */
function chainArm(q,n,len,rad,build){const S=[];let p=q,prev=0;
  for(let i=0;i<n;i++){const t=n>1?i/(n-1):0;const L=len(t),R=rad(t);const sgp=grp(p,[0,-prev,0]);S.push(sgp);build(sgp,t,i,L,R);p=sgp;prev=L}return S}

/* ---------- bemalte Flügel: Form in Einheitskoordinaten [0..1]², Textur passt 1:1 ---------- */
function sPath(x,pts,w,h){const n=pts.length;const M=p=>[p[0]*w,(1-p[1])*h];const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const m0=M(mid(pts[n-1],pts[0]));x.moveTo(m0[0],m0[1]);
  for(let i=0;i<n;i++){const p=M(pts[i]),q=M(mid(pts[i],pts[(i+1)%n]));x.quadraticCurveTo(p[0],p[1],q[0],q[1])}x.closePath()}
function edgePts(pts,per){const n=pts.length,o=[];const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  for(let i=0;i<n;i++){const a=mid(pts[(i+n-1)%n],pts[i]),b=pts[i],d=mid(pts[i],pts[(i+1)%n]);
    for(let k=0;k<per;k++){const t=k/per,u=1-t;o.push([u*u*a[0]+2*u*t*b[0]+t*t*d[0],u*u*a[1]+2*u*t*b[1]+t*t*d[1]])}}return o}
function wingTex(key,pts,paint){return ctex('arm-'+key,256,256,(x,w,h)=>{const path=()=>{x.beginPath();sPath(x,pts,w,h)};paint(x,w,h,path)})}
function inset(p,ctr,k){return[p[0]+(ctr[0]-p[0])*k,p[1]+(ctr[1]-p[1])*k]}

/* =================== ORGANISCH =================== */
A('mensch','Menschenarme','org',(g,c)=>{const{s,m}=c;const sk=m.skin();
  rig(g,c,{rz:.5},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.26,L2:.24,r1:.105,r2:.096});const h=mitten(a.wr,c,sk,.13*s);
    R.tick=(t,w,act)=>{a.el.rotation.x=-.22-act*(.7+Math.sin(t*11)*.35);a.el.rotation.z=act*.3;h.curl(.22+Math.sin(t*1.3+sg)*.08-act*.22)}})});

A('muskel','Muskelarme','org',(g,c)=>{const{s,m}=c;const sk=m.skin(),band=m.gloss(PAL.coral),hm=m.gloss(PAL.strawberry);
  rig(g,c,{rz:.42,lift:.3,out:1.05},(q,sg,R)=>{
    P(q,G.s(.19*s),sk,[0,-.02*s,0],null,[1,.92,1]);
    P(q,G.ca(.12*s,.16*s),sk,[0,-.19*s,0]);
    const bi=P(q,G.s(.13*s),sk,[0,-.2*s,.075*s],null,[.95,1.1,.9]);
    P(bi,G.heart(.042*s,.022*s),hm,[.02*s,.01*s,.125*s],[0,.15,0]);
    const el=grp(q,[0,-.34*s,0],[-.2,0,0]);
    P(el,G.s(.108*s),sk);
    P(el,G.la(pr([[0,-.36],[.1,-.36],[.14,-.3],[.158,-.21],[.132,-.1],[.1,-.02],[0,0]],s)),sk);
    P(el,G.to(.128*s,.042*s),band,[0,-.3*s,0],[PI/2,0,0]);
    const fi=grp(el,[0,-.4*s,0]);
    P(fi,G.s(.15*s),sk,[0,-.06*s,0],null,[.92,1,1]);
    range(4,(t,i)=>P(fi,G.s(.052*s),sk,[.015*s,-.17*s,(t-.5)*.19*s]));
    P(fi,G.ca(.05*s,.06*s),sk,[-.06*s,-.1*s,.12*s],[-.6,0,.3]);
    R.tick=(t,w,act)=>{el.rotation.z=act*2.1;el.rotation.x=-.2*(1-act);const b=1+act*(.28+Math.sin(t*8)*.05);bi.scale.set(.95*b,1.1*b,.9*b)}})});

A('lang','Lange Nudelarme','org',(g,c)=>{const{s,m}=c;const sk=m.skin();const L=Math.max(.32*s,c.shY*.23);
  rig(g,c,{rz:.2,walk:.35,idle:.06,lift:1},(q,sg,R)=>{P(q,G.s(.085*s),sk);
    const S=chainArm(q,3,()=>L,()=>.064*s,(p,t,i,Ln,Rr)=>{P(p,G.ca(Rr,Ln),sk,[0,-Ln/2,0])});
    const wr=grp(S[2],[0,-L,0]);const h=mitten(wr,c,sk,.105*s);
    R.tick=(t,w,act)=>{S.forEach((p,i)=>{if(!i)return;p.rotation.x=Math.sin(t*(w?6.3:2)-i*.9+sg)*(w?.3:.13)-act*.35;p.rotation.z=.1+Math.sin(t*1.7-i*1.1+sg)*.09});h.curl(.25+act*Math.sin(t*9)*.3)}})});

A('mini','Mini-Ärmchen','tier',(g,c)=>{const{s,m}=c;const sk=m.skin(),cl=m.c(PAL.cream);const rr=c.rs[c.n-1];
  both(sg=>{const o=grp(g,[sg*rr*.48,c.shY-.2*s,rr*.86]);const q=grp(o);q.scale.set(sg*1.25,1.25,1.25);
    const up=grp(q,[0,0,0],[-1.1,0,.3]);
    P(up,G.s(.072*s),sk);P(up,G.ca(.058*s,.06*s),sk,[0,-.07*s,0]);
    const el=grp(up,[0,-.13*s,0],[1.1,0,0]);
    P(el,G.s(.056*s),sk);P(el,G.ca(.052*s,.05*s),sk,[0,-.05*s,0]);
    const hd=grp(el,[0,-.11*s,0]);P(hd,G.s(.058*s),sk,[0,-.01*s,0],null,[.95,.9,1]);
    const C=range(2,(t,i)=>{const f=grp(hd,[0,-.05*s,(t-.5)*.055*s]);P(f,G.s(.022*s),cl);P(f,G.co(.021*s,.05*s),cl,[0,-.025*s,0],[PI,0,0]);return f});
    c.an((t,w,act)=>{const f=w?9:3.2;up.rotation.x=-1.1+Math.sin(t*f+sg)*.16-act*(.5+Math.sin(t*14)*.15);el.rotation.x=1.1+Math.sin(t*f*1.3+sg)*.18-act*.4;
      C.forEach((k,i)=>k.rotation.x=(i?-1:1)*(.15+Math.max(0,Math.sin(t*5+sg))*.2+act*.3))})})});

A('prothese','Handprothese','masch',(g,c)=>{const{s,m}=c;const sk=m.skin(),wh=m.gloss(WH),ac=m.gloss(PAL.teal),jt=m.steel();
  rig(g,c,{rz:.45},(q,sg,R)=>{P(q,G.s(.114*s),sk);P(q,G.ca(.1*s,.2*s),sk,[0,-.12*s,0]);
    const el=grp(q,[0,-.27*s,0],[-.25,0,0]);
    P(el,G.cy(.122*s,.112*s,.1*s),ac,[0,-.01*s,0]);
    P(el,G.ca(.1*s,.2*s),wh,[0,-.17*s,0]);
    P(el,G.to(.1*s,.022*s),ac,[0,-.22*s,0],[PI/2,0,0]);
    P(el,G.s(.026*s),m.glow(PAL.mint,2),[.03*s,-.12*s,.095*s]);
    const wr=grp(el,[0,-.34*s,0]);P(wr,G.s(.062*s),jt);
    const hd=grp(wr,[0,-.03*s,0],[0,-.4,0]);
    P(hd,G.bx(.1*s,.15*s,.2*s,.045*s),wh,[0,-.08*s,0]);
    const F=range(3,(t,i)=>{const f=grp(hd,[0,-.16*s,(t-.5)*.125*s-.015*s]);P(f,G.s(.032*s),jt);P(f,G.ca(.029*s,.045*s),ac,[0,-.05*s,0]);
      const f2=grp(f,[0,-.095*s,0]);P(f2,G.s(.027*s),jt);P(f2,G.ca(.027*s,.02*s),wh,[0,-.035*s,0]);return[f,f2]});
    const th=grp(hd,[-.02*s,-.07*s,.1*s],[-1,0,-.35]);P(th,G.s(.03*s),jt);P(th,G.ca(.029*s,.05*s),ac,[0,-.05*s,0]);
    R.tick=(t,w,act)=>{const k=Math.max(0,Math.sin(t*1.1+sg*1.3))*.55*(1-act)+act*1.1;F.forEach(([f,f2])=>{f.rotation.z=-k*.8;f2.rotation.z=-k*1});th.rotation.z=-.35-k*.4}})});

/* =================== TIERISCH =================== */
A('tentakel','Tentakel','tier',(g,c)=>{const{s,m}=c;const tm=m.gloss(PAL.grape),su=m.c(PAL.blush);
  rig(g,c,{rz:.4,walk:.3,lift:1,idle:.04},(q,sg,R)=>{P(q,G.s(.135*s),tm);
    const S=chainArm(q,9,t=>(.105-.045*t)*s,t=>(.122-.084*t)*s,(p,t,i,L,Rr)=>{P(p,G.ca(Rr,L*.6),tm,[0,-L/2,0]);
      if(i%2===0&&i<8)P(p,G.to(Rr*.36,Rr*.14),su,[Rr*.42,-L/2,Rr*.84],[0,.46,0])});
    R.tick=(t,w,act)=>{const sp=w?4:2;S.forEach((p,i)=>{if(!i)return;const k=i/8;p.rotation.z=(.05+k*k*.62)*(1-act*.75)+Math.sin(t*sp-i*.7+sg)*.14*k;p.rotation.x=Math.sin(t*sp*.8-i*.6+sg*2)*.1-act*.08})}})});

A('saugnapf','Saugnapf-Tentakel','tier',(g,c)=>{const{s,m}=c;const tm=m.gloss(PAL.coral),cup=m.c(PAL.peach),dot=m.c(PAL.clay);
  rig(g,c,{rz:.45,fx:-.12,walk:.3,lift:1.1},(q,sg,R)=>{P(q,G.s(.145*s),tm);
    const S=chainArm(q,7,t=>(.13-.04*t)*s,t=>(.135-.065*t)*s,(p,t,i,L,Rr)=>{P(p,G.ca(Rr,L*.5),tm,[0,-L/2,0]);
      if(i>0){const sc=grp(p,[Rr*.25,-L/2,Rr*.88],[0,.28,0]);P(sc,G.to(Rr*.4,Rr*.16),cup);P(sc,G.s(Rr*.27),dot,[0,0,-Rr*.06],null,[1,1,.5])}});
    const tip=grp(S[6],[0,-.1*s,0]);
    const cp=P(tip,G.la(pr([[0,-.02],[.1,-.045],[.112,-.03],[.085,.0],[.05,.035],[0,.05]],s)),cup);
    P(tip,G.s(.042*s),dot,[0,-.028*s,0],null,[1,.35,1]);
    R.tick=(t,w,act)=>{const sp=w?4:1.8;S.forEach((p,i)=>{if(!i)return;const k=i/6;p.rotation.z=(.08+k*.28)*(1-act*.6)+Math.sin(t*sp-i*.8+sg)*.12*k;p.rotation.x=-k*.18+Math.sin(t*sp*.7-i*.5)*.08});
      const sq=1+Math.max(0,Math.sin(t*(2+act*8)))*(.12+act*.2);cp.scale.set(sq,1/sq,sq)}})});

A('krabbe','Krabbenscheren','tier',(g,c)=>{const{s,m}=c;const km=m.gloss(PAL.coral),dk=m.gloss(PAL.cherry),sp=m.c(PAL.peach);
  const fing=d=>G.tu([[0,0,0],[d*.035*s,-.09*s,0],[d*.01*s,-.17*s,0],[-d*.035*s,-.21*s,0]],.058*s,.03*s);const fL=fing(-1),fR=fing(1);
  rig(g,c,{rz:1.0,lift:.5,walk:.25,idle:.04,out:.25},(q,sg,R)=>{
    P(q,G.s(.11*s),km);P(q,G.ca(.078*s,.14*s),km,[0,-.12*s,0]);
    const el=grp(q,[0,-.25*s,0],[-.3,0,2.0]);P(el,G.s(.088*s),km);P(el,G.ca(.074*s,.08*s),km,[0,-.08*s,0]);
    const cw=grp(el,[0,-.17*s,0]);
    P(cw,G.s(.165*s),km,[0,-.13*s,0],null,[1,1.05,.8]);
    [[.09,-.06,.11],[.0,-.19,.12],[-.09,-.11,.1]].forEach(p=>P(cw,G.s(.03*s),sp,[p[0]*s,p[1]*s,p[2]*s],null,[1,1,.55]));
    const lo=grp(cw,[-.075*s,-.23*s,0],[0,0,-.1]);P(lo,G.s(.058*s),km);P(lo,fL,km);P(lo,G.s(.034*s),dk,[.035*s,-.21*s,0]);
    const up=grp(cw,[.075*s,-.23*s,0]);P(up,G.s(.058*s),km);P(up,fR,km);P(up,G.s(.034*s),dk,[-.035*s,-.21*s,0]);
    R.tick=(t,w,act)=>{const idle=.12+Math.max(0,Math.sin(t*2+sg))*.3;const snap=Math.abs(Math.sin(t*12))*.5;up.rotation.z=idle*(1-act)+snap*act;el.rotation.z=2.0+Math.sin(t*1.6+sg)*.08+act*.3}})});
A('hummer','Hummerzangen','tier',(g,c)=>{const{s,m}=c;const km=m.gloss(PAL.blue),kn=m.c(PAL.sky),tp=m.gloss(PAL.orange);
  const fing=d=>G.tu([[0,0,0],[d*.03*s,-.12*s,0],[d*.012*s,-.24*s,0],[-d*.02*s,-.29*s,0]],.052*s,.026*s);const fL=fing(-1),fR=fing(1);
  rig(g,c,{rz:.8,fx:-.35,lift:.6,walk:.25,out:.2},(q,sg,R)=>{const big=sg>0?1.3:1.08;
    P(q,G.s(.105*s),km);P(q,G.ca(.075*s,.14*s),km,[0,-.12*s,0]);
    P(q,G.to(.078*s,.02*s),kn,[0,-.08*s,0],[PI/2,0,0]);P(q,G.to(.078*s,.02*s),kn,[0,-.17*s,0],[PI/2,0,0]);
    const el=grp(q,[0,-.26*s,0],[-.25,0,1.15]);P(el,G.s(.085*s),km);P(el,G.ca(.07*s,.1*s),km,[0,-.1*s,0]);P(el,G.to(.072*s,.018*s),kn,[0,-.1*s,0],[PI/2,0,0]);
    const cw=grp(el,[0,-.2*s,0]);cw.scale.setScalar(big);
    P(cw,G.s(.13*s),km,[0,-.15*s,0],null,[1.05,1.45,.75]);
    range(3,(t,i)=>P(cw,G.s(.026*s),kn,[(-.05+t*.1)*s,-(.1+t*.12)*s,.09*s],null,[1,1,.6]));
    const lo=grp(cw,[-.065*s,-.3*s,0],[0,0,-.08]);P(lo,G.s(.052*s),km);P(lo,fL,km);P(lo,G.s(.034*s),tp,[-.02*s,-.29*s,0]);
    const up=grp(cw,[.065*s,-.3*s,0]);P(up,G.s(.052*s),km);P(up,fR,km);P(up,G.s(.034*s),tp,[.02*s,-.29*s,0]);
    R.tick=(t,w,act)=>{const k=.1+Math.max(0,Math.sin(t*1.4+sg*2))*.28;up.rotation.z=k*(1-act)+Math.abs(Math.sin(t*10))*.5*act}})});
A('mantis','Gottesanbeterin-Klingen','tier',(g,c)=>{const{s,m}=c;const gm=m.gloss(PAL.grass),dm=m.gloss(PAL.moss),spk=m.gloss(PAL.butter);
  const fem=G.puff(sshp([[.05,-.02],[.065,.12],[.055,.26],[.03,.36],[-.03,.37],[-.05,.3],[-.05,.1],[-.045,.0]].map(p=>[p[0]*s,p[1]*s])),.05*s,.02*s);
  const tib=G.puff(sshp([[.03,.02],[.035,-.2],[.06,-.28],[.13,-.31],[.1,-.35],[.02,-.34],[-.03,-.26],[-.035,-.1],[-.03,.02]].map(p=>[p[0]*s,p[1]*s])),.04*s,.016*s);
  rig(g,c,{rz:.2,fx:0,dz:.08,lift:.35,walk:.15,idle:.03,out:.3},(q,sg,R)=>{
    P(q,G.s(.095*s),gm);P(q,G.ca(.065*s,.16*s),gm,[.02*s,-.06*s,.14*s],[PI/2+.4,0,-.2]);
    const fg=grp(q,[.04*s,-.13*s,.3*s],[0,0,.45]);P(fg,G.s(.065*s),gm);P(fg,fem,gm);
    range(4,(t,i)=>P(fg,G.co(.03*s,.075*s),spk,[-.07*s,(.06+t*.24)*s,0],[0,0,PI/2]));
    const tg=grp(fg,[0,.34*s,.035*s],[0,0,-.95]);P(tg,G.s(.052*s),dm);P(tg,tib,dm);
    range(3,(t,i)=>P(tg,G.co(.026*s,.065*s),spk,[.05*s,-(.05+t*.13)*s,0],[0,0,-PI/2]));
    R.tick=(t,w,act)=>{const k=act>0?Math.abs(Math.sin(t*6)):0;tg.rotation.z=-.95+Math.sin(t*1.3+sg)*.06-act*k*1.6;fg.rotation.z=.45+Math.sin(t*1.1+sg)*.04-act*.3}})});
A('insekt','Insektenarme','tier',(g,c)=>{const{s,m}=c;const im=m.chitin(PAL.teal),jm=m.gold(),hk=m.c(PAL.ink);
  const leg=(q,sc,R,sg,ph)=>{const k=s*sc;P(q,G.s(.08*k),jm);
    P(q,G.ca(.06*k,.22*k),im,[0,-.16*k,0]);
    const kn=grp(q,[0,-.32*k,0],[0,0,-1.95]);P(kn,G.s(.064*k),jm);P(kn,G.ca(.052*k,.24*k),im,[0,-.17*k,0]);
    const an=grp(kn,[0,-.34*k,0],[0,0,.55]);P(an,G.s(.046*k),jm);P(an,G.ca(.04*k,.07*k),im,[0,-.07*k,0]);
    both(z=>P(an,G.co(.02*k,.07*k),hk,[.0,-.15*k,z*.025*k],[PI+z*.45,0,0]));
    R.tick=(t,w,act)=>{kn.rotation.z=-1.95+Math.sin(t*(w?8:2.4)+ph+sg)*.12+act*(.7+Math.sin(t*12+ph)*.2);an.rotation.z=.55+Math.sin(t*3+ph)*.1}};
  rig(g,c,{rz:1.8,walk:.25,idle:.03,lift:.4,out:-.2},(q,sg,R)=>leg(q,1,R,sg,0));
  rig(g,c,{rz:1.55,dx:.02,dy:-.32,dz:.06,walk:.25,idle:.03,lift:.3,out:-.2},(q,sg,R)=>leg(q,.8,R,sg,1.7))});

const BAT=[[0,.06],[.22,.3],[.52,.5],[.85,.64],[1.18,.62],[1.0,.36],[1.26,.16],[.95,.03],[1.06,-.3],[.72,-.13],[.64,-.46],[.4,-.2],[.14,-.32],[0,-.12]];
A('fledermaus','Fledermausflügel','tier',(g,c)=>{const{s,m}=c;const mem=m.c(PAL.grape,{rim:.55,rimColor:'#e8d8ff'}),bo=m.gloss(PAL.plum),cl=m.c(PAL.cream);const geo=G.puff(sshp(BAT),.05);
  backW(g,c,{base:.25,amp:.4,f:4.2,tilt:.24,flapZ:.1,dy:.08},(q,sg,R)=>{const w=grp(q);w.scale.setScalar(1.15*s);
    P(w,geo,mem);const z=.05;const wr=[.52,.47,z];
    P(w,G.tu([[0,.03,z],[.26,.3,z],wr],.036,.03),bo);P(w,G.s(.05),bo,wr);
    [[1.12,.58],[1.16,.16],[.98,-.24],[.6,-.38]].forEach(p=>P(w,G.tu([wr,[(wr[0]+p[0])/2,(wr[1]+p[1])/2+.03,z],[p[0],p[1],z]],.026,.016),bo));
    P(w,G.co(.035,.1),cl,[.5,.56,z],[0,0,.35]);})});

const BFLY=[[.03,.55],[.25,.9],[.6,1.0],[.97,.98],[.95,.72],[.62,.52],[.82,.32],[.7,.04],[.38,0],[.12,.14],[.02,.38]];
const MORPHO=[[.03,.55],[.2,.92],[.62,1.0],[.96,.9],[.9,.6],[.7,.5],[.93,.3],[.75,.02],[.35,0],[.1,.15],[.02,.4]];
const MOTH=[[.03,.58],[.3,.95],[1.0,1.0],[.92,.62],[.56,.5],[.72,.28],[.5,.03],[.18,.08],[.02,.35]];
function flyWing(g,c,pts,mat,sz,o){const{s}=c;const geo=G.puff(sshp(pts),.035);
  backW(g,c,Object.assign({base:.16,amp:.32,f:3.4,tilt:.24,dy:.12},o),(q,sg,R)=>{const S=sz*s;P(q,geo,mat,[-.03*S,-.5*S,0],null,S)})}
A('fluegel','Monarch-Falterflügel','tier',(g,c)=>{const{m}=c;const ctr=[.45,.55];
  const tex=wingTex('monarch',BFLY,(x,w,h,path)=>{x.fillStyle=PAL.orange;x.fillRect(0,0,w,h);
    x.save();path();x.clip();const gr=x.createRadialGradient(.05*w,.5*h,10,.05*w,.5*h,w*.9);gr.addColorStop(0,'#FFB866');gr.addColorStop(1,PAL.orange);x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.strokeStyle=PAL.ink;x.lineCap='round';x.lineWidth=8;const R0=[.03*w,.5*h];
    [[.4,.93],[.7,.95],[.9,.82],[.62,.55],[.78,.3],[.6,.08],[.32,.04],[.14,.2]].forEach(([u,v],i)=>{x.beginPath();x.moveTo(R0[0],R0[1]);x.quadraticCurveTo((u*.5+.05)*w,(1-v*.8-.08)*h,u*w,(1-v)*h);x.stroke()});
    x.fillStyle=PAL.ink;x.beginPath();x.arc(.98*w,.02*h,.3*w,0,TAU);x.fill();
    x.fillStyle=PAL.white;[[.8,.9,9],[.88,.82,8],[.92,.92,7]].forEach(([u,v,r])=>{x.beginPath();x.arc(u*w,(1-v)*h,r,0,TAU);x.fill()});
    x.fillStyle=PAL.butter;[[.7,.93,7],[.78,.8,6]].forEach(([u,v,r])=>{x.beginPath();x.arc(u*w,(1-v)*h,r,0,TAU);x.fill()});x.restore();
    path();x.lineWidth=34;x.strokeStyle=PAL.ink;x.stroke();
    x.fillStyle=PAL.white;edgePts(BFLY,3).forEach((p,i)=>{const q=inset(p,ctr,.08);x.beginPath();x.arc(q[0]*w,(1-q[1])*h,i%2?4:5.5,0,TAU);x.fill()})});
  flyWing(g,c,BFLY,m.tex('arm-monarch',tex,{gloss:.5,rim:.45}),1.3)});
A('morpho','Blaue Morpho-Flügel','tier',(g,c)=>{const{m}=c;const ctr=[.45,.55];
  const tex=wingTex('morpho',MORPHO,(x,w,h,path)=>{const gr=x.createRadialGradient(.05*w,.5*h,8,.05*w,.5*h,w*.95);gr.addColorStop(0,PAL.aqua);gr.addColorStop(.35,PAL.sky);gr.addColorStop(.72,PAL.blue);gr.addColorStop(1,PAL.navy);x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.save();path();x.clip();x.globalAlpha=.35;x.strokeStyle='#ffffff';x.lineWidth=5;x.lineCap='round';
    [[.5,.9],[.8,.8],[.75,.25],[.4,.08]].forEach(([u,v])=>{x.beginPath();x.moveTo(.1*w,.5*h);x.lineTo(u*w,(1-v)*h);x.stroke()});x.globalAlpha=1;x.restore();
    path();x.lineWidth=30;x.strokeStyle=PAL.ink;x.stroke();
    x.fillStyle=PAL.white;edgePts(MORPHO,2).forEach((p,i)=>{const q=inset(p,ctr,.075);x.beginPath();x.arc(q[0]*w,(1-q[1])*h,4.5,0,TAU);x.fill()});
    x.fillStyle=PAL.butter;[[.84,.84,7],[.72,.9,5]].forEach(([u,v,r])=>{x.beginPath();x.arc(u*w,(1-v)*h,r,0,TAU);x.fill()})});
  flyWing(g,c,MORPHO,m.tex('arm-morpho',tex,{gloss:1.3,rim:.8,rimColor:'#cfefff'}),1.3,{f:3})});
A('motte','Mottenflügel','tier',(g,c)=>{const{s,m}=c;
  const tex=wingTex('motte',MOTH,(x,w,h,path)=>{const gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,PAL.pink);gr.addColorStop(.28,PAL.blush);gr.addColorStop(.42,PAL.butter);gr.addColorStop(.72,PAL.butter);gr.addColorStop(.95,PAL.pink);x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.save();path();x.clip();x.fillStyle=PAL.lemon;x.globalAlpha=.6;x.beginPath();x.ellipse(.55*w,.4*h,.14*w,.2*h,.4,0,TAU);x.fill();x.globalAlpha=1;
    x.fillStyle=PAL.plum;x.beginPath();x.arc(.56*w,.33*h,17,0,TAU);x.fill();x.fillStyle=PAL.honey;x.beginPath();x.arc(.56*w,.33*h,11,0,TAU);x.fill();x.fillStyle=PAL.white;x.beginPath();x.arc(.54*w,.31*h,4,0,TAU);x.fill();
    x.fillStyle=PAL.pink;x.beginPath();x.arc(.45*w,.82*h,12,0,TAU);x.fill();x.restore();
    path();x.lineWidth=16;x.strokeStyle=PAL.rose;x.stroke()});
  flyWing(g,c,MOTH,m.tex('arm-motte',tex,{rim:.9,rimColor:'#ffffff'}),1.25,{f:2.6,amp:.26});
  both(sg=>P(g,G.s(.12*s),m.plush(PAL.butter),[sg*.1*s,c.shY+.12*s,-c.rs[c.n-1]*.8],null,[1,.8,.8]))});

A('vogel','Vogelflügel','tier',(g,c)=>{const{s,m}=c;const bl=m.gloss(PAL.blue),sc=m.c(PAL.sky,{rim:.6}),cw=m.c(WH,{rim:.8,rimColor:'#ffffff'});
  const pts=[[0,.1],[.2,.36],[.6,.5],[1.0,.46],[1.32,.3],[1.3,.1],[1.12,.11],[1.08,-.08],[.9,-.01],[.82,-.2],[.66,-.1],[.56,-.27],[.42,-.14],[.3,-.3],[.16,-.14],[0,-.12]];
  const wg=G.puff(sshp(pts),.07);
  backW(g,c,{base:.16,amp:.1,f:3.4,tilt:.32,flapZ:.36,dy:.05},(q,sg,R)=>{const w=grp(q);w.scale.setScalar(1.0*s);
    P(w,wg,bl,[0,0,-.05]);P(w,wg,sc,[0,.1,.02],null,[.72,.68,1]);P(w,wg,cw,[0,.18,.09],null,[.44,.42,1])})});
const DRAG=[[0,.5],[.08,.64],[.45,.72],[.88,.68],[1,.56],[.9,.42],[.5,.34],[.1,.38]];
A('libelle','Libellenflügel','tier',(g,c)=>{const{s,m}=c;
  const tex=wingTex('libelle',DRAG,(x,w,h,path)=>{x.fillStyle='#EAF8FF';x.fillRect(0,0,w,h);const r=srand(11);
    x.save();path();x.clip();const gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#CFEFFF');gr.addColorStop(1,'#F6FCFF');x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.strokeStyle=PAL.sky;x.lineWidth=2.5;for(let i=0;i<9;i++){x.beginPath();x.moveTo(0,(.36+i*.035)*h);x.bezierCurveTo(.4*w,(.33+i*.04)*h,.7*w,(.35+i*.035)*h,w,(.4+i*.025)*h);x.stroke()}
    for(let i=0;i<34;i++){const u=r()*w,v=(.3+r()*.4)*h;x.beginPath();x.moveTo(u,v-10);x.lineTo(u+r()*6-3,v+10);x.stroke()}
    x.fillStyle=PAL.lilac;x.beginPath();x.ellipse(.86*w,.34*h,16,7,-.1,0,TAU);x.fill();x.restore();
    path();x.lineWidth=9;x.strokeStyle=PAL.blue;x.stroke()});
  const wm=m.tex('arm-libelle',tex,{gloss:1.3,rim:1,rimColor:'#e6f8ff'});const geo=G.puff(sshp(DRAG),.03);
  backW(g,c,{base:.1,amp:.05,f:4,tilt:.1,z:.72,dy:.1},(q,sg,R)=>{const W=range(2,(t,i)=>{const S=(i?1.08:1.25)*s;const wg=grp(q,[0,(i?-.07:.06)*s,(i?-.03:0)*s],[0,0,i?-.3:.14]);P(wg,geo,wm,[0,-.5*S,0],null,S);return wg});
    R.tick=(t,w,act)=>{const f=24*(1+act*.5);W.forEach((wg,i)=>{wg.rotation.z=(i?-.3:.14)+Math.sin(t*f+i*PI)*(.1+act*.08)})}})});

A('flossen','Flossen','tier',(g,c)=>{const{s,m}=c;const bm=m.gloss(PAL.teal);
  const FIN=[[.34,1],[.66,1],[.82,.8],[.96,.55],[1,.28],[.88,.08],[.76,.2],[.62,.02],[.5,.15],[.38,.01],[.24,.2],[.1,.08],[.02,.33],[.16,.72]];
  const tex=ctex('arm-fin',256,256,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,PAL.teal);gr.addColorStop(.55,PAL.aqua);gr.addColorStop(1,'#D6F7F4');x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.strokeStyle=PAL.teal;x.lineCap='round';x.lineWidth=8;for(let i=0;i<=6;i++){const a=-PI/2-.72+i/6*1.44;x.beginPath();x.moveTo(.5*w,-.05*h);x.lineTo(.5*w+Math.cos(a)*.95*w,-Math.sin(a)*.95*h);x.stroke()}
    x.fillStyle='#ffffff';x.globalAlpha=.7;[[.3,.75],[.68,.62],[.5,.85]].forEach(([u,v])=>{x.beginPath();x.arc(u*w,v*h,7,0,TAU);x.fill()});x.globalAlpha=1});
  const fm=m.tex('arm-fin',tex,{gloss:1,rim:.7,rimColor:'#e0fff8'});const geo=G.puff(sshp(FIN),.06);
  rig(g,c,{rz:.7,fx:.1,walk:.3,lift:.7,out:.3},(q,sg,R)=>{P(q,G.s(.11*s),bm,null,null,[1,1,1.1]);
    const f=grp(q,[0,-.04*s,0],[.1,-.3,0]);const S=.62*s;P(f,geo,fm,[-.5*S,-1*S,0],null,S);
    R.tick=(t,w,act)=>{const sp=w?6:3;f.rotation.y=-.1+Math.sin(t*sp+sg)*(.18+act*.3);f.rotation.x=.1+Math.sin(t*sp+sg+1)*.12}})});
A('flipper','Robbenflossen','tier',(g,c)=>{const{s,m}=c;const fm=m.gloss(PAL.slate),rb=m.c(PAL.stone),nl=m.c(PAL.cream);
  const FLIP=[[.36,1],[.64,1],[.8,.75],[.95,.38],[1.0,.08],[.82,-.02],[.66,.06],[.48,-.04],[.32,.06],[.14,-.02],[0,.12],[.1,.45],[.22,.75]];
  const geo=G.puff(sshp(FLIP),.12);
  rig(g,c,{rz:.7,walk:.3,lift:.6,out:.4},(q,sg,R)=>{P(q,G.s(.12*s),fm);P(q,G.ca(.1*s,.1*s),fm,[0,-.08*s,0]);
    const f=grp(q,[0,-.16*s,0],[0,-.35,0]);const S=.5*s;const pf=grp(f,[-.5*S,-1*S,0]);pf.scale.setScalar(S);P(pf,geo,fm);
    [[.3,.8,.18,.12],[.5,.82,.46,.12],[.7,.8,.76,.12]].forEach(([x1,y1,x2,y2])=>P(pf,G.tu([[x1,y1,.1],[(x1+x2)/2,(y1+y2)/2,.115],[x2,y2,.1]],.035,.03),rb));
    [[.12,.06],[.47,.03],[.8,.05]].forEach(([x,y])=>P(pf,G.s(.05),nl,[x,y,.06],null,[1,1.2,.8]));
    R.tick=(t,w,act)=>{const clap=act*Math.abs(Math.sin(t*9));f.rotation.y=-.35-clap*.9+Math.sin(t*2+sg)*.08;f.rotation.x=Math.sin(t*(w?6.3:1.8)+sg)*.15-clap*.2}})});
A('koralle','Korallenäste','tier',(g,c)=>{const{s,m}=c;const km=m.gloss(PAL.coral),tp=m.c(PAL.blush),pp=m.c(PAL.cream);
  rig(g,c,{rz:2.3,fx:-.1,walk:.12,idle:.03,lift:.4,out:-.2},(q,sg,R)=>{P(q,G.s(.12*s),km);const k=1.3*s;
    const T=(pts,r1,r2)=>{P(q,G.tu(pts.map(p=>[p[0]*k,p[1]*k,p[2]*k]),r1*k,r2*k),km);const e=pts[pts.length-1];P(q,G.s(r2*k*1.3),tp,[e[0]*k,e[1]*k,e[2]*k])};
    T([[0,0,0],[.02,-.2,0],[-.03,-.42,.02],[.0,-.6,0]],.085,.05);
    T([[.015,-.2,0],[.12,-.29,.03],[.2,-.43,.0]],.056,.04);
    T([[-.02,-.36,.01],[-.14,-.42,.04],[-.19,-.54,.06]],.05,.036);
    T([[.1,-.27,.02],[.13,-.31,.13],[.12,-.36,.22]],.04,.03);
    T([[-.01,-.5,.01],[.09,-.56,.02],[.12,-.66,.0]],.04,.03);
    [[.07,-.1,.07],[-.07,-.3,.06],[.16,-.36,.05],[-.03,-.52,.06]].forEach(p=>P(q,G.s(.026*s),pp,[p[0]*k,p[1]*k,p[2]*k]));
    R.tick=(t,w,act)=>{q.rotation.y=Math.sin(t*1.1+sg)*.08}})});

/* =================== MASCHINELL =================== */
A('greifarm','Greifarme','masch',(g,c)=>{const{s,m}=c;const pk=m.gloss(PAL.pink),jt=m.black(),ch=m.chrome(),hub=m.gloss(PAL.lemon);
  rig(g,c,{rz:.35,lift:1},(q,sg,R)=>{P(q,G.s(.11*s),jt);P(q,G.ca(.078*s,.17*s),pk,[0,-.14*s,0]);
    const el=grp(q,[0,-.28*s,0],[-.3,0,0]);P(el,G.s(.08*s),jt);P(el,G.ca(.066*s,.14*s),pk,[0,-.12*s,0]);
    const hd=grp(el,[0,-.26*s,0]);P(hd,G.cy(.11*s,.09*s,.07*s),hub);P(hd,G.to(.1*s,.018*s),jt,[0,.035*s,0],[PI/2,0,0]);P(hd,G.s(.05*s),jt,[0,-.045*s,0]);
    const F=range(3,(t,i)=>{const r=grp(hd,[0,-.03*s,0],[0,i*TAU/3+.5,0]);const f=grp(r,[.07*s,0,0]);P(f,G.s(.032*s),ch);
      P(f,G.ca(.026*s,.1*s),ch,[.02*s,-.075*s,0],[0,0,.25]);const f2=grp(f,[.04*s,-.15*s,0],[0,0,-1]);P(f2,G.s(.028*s),ch);P(f2,G.ca(.024*s,.05*s),ch,[0,-.045*s,0]);return f});
    if(sg>0){const pz=P(hd,G.star(.06*s,.03*s,5,.035*s),m.gloss(PAL.mint),[0,-.2*s,0],[0,.4,0]);}
    R.tick=(t,w,act)=>{const o=(sg>0?.05:.35)+Math.max(0,Math.sin(t*1.2+sg))*.2*(1-act)-act*.25;F.forEach(f=>f.rotation.z=o)}})});

A('industrie','Industrieroboter','masch',(g,c)=>{const{s,m}=c;const om=m.gloss(PAL.orange),jt=m.black(),st=m.steel(),yl=m.gloss(PAL.lemon);
  const step=v=>{const k=Math.floor(v),f=v-k;return k+sm(f*1.6)};
  rig(g,c,{rz:.45,lift:.7,walk:.25},(q,sg,R)=>{
    P(q,G.cy(.13*s,.13*s,.16*s),jt,[0,0,0],[0,0,PI/2]);P(q,G.cy(.1*s,.1*s,.03*s),st,[.09*s,0,0],[0,0,PI/2]);
    const l1=grp(q);P(l1,G.bx(.17*s,.34*s,.17*s,.07*s),om,[0,-.2*s,0]);P(l1,G.bx(.178*s,.05*s,.178*s,.022*s),yl,[0,-.28*s,0]);
    P(l1,G.s(.022*s),st,[.085*s,-.12*s,0]);
    const j2=grp(l1,[0,-.38*s,0]);P(j2,G.cy(.085*s,.085*s,.2*s),jt,null,[0,0,PI/2]);both(x=>P(j2,G.cy(.06*s,.06*s,.02*s),st,[x*.1*s,0,0],[0,0,PI/2]));
    const l2=grp(j2,[0,0,0],[-.5,0,0]);P(l2,G.bx(.13*s,.28*s,.13*s,.055*s),om,[0,-.16*s,0]);
    const tl=grp(l2,[0,-.32*s,0]);P(tl,G.cy(.065*s,.065*s,.06*s),jt);P(tl,G.cy(.08*s,.08*s,.03*s),st,[0,-.045*s,0]);
    const G2=[-1,1].map(x=>{const f=grp(tl,[x*.04*s,-.06*s,0]);P(f,G.bx(.035*s,.11*s,.07*s,.015*s),jt,[0,-.05*s,0]);return f});
    R.tick=(t,w,act)=>{const a=step(t*.45+(sg>0?0:.5));l1.rotation.x=Math.sin(a*1.9)*.25;l2.rotation.x=-.5+Math.sin(a*2.3+1)*.35-act*.6;tl.rotation.y=a*1.4;
      const o=.035*s*(act>0?Math.abs(Math.sin(t*8)):.6+.4*Math.sin(a*3));G2.forEach((f,i)=>f.position.x=(i?1:-1)*(.02*s+o))}})});

A('bohrer','Bohrer','masch',(g,c)=>{const{s,m}=c;const ym=m.gloss(PAL.lemon),ik=m.black(),ch=m.chrome();
  rig(g,c,{rz:.45,lift:1.3},(q,sg,R)=>{P(q,G.s(.115*s),ik);
    P(q,G.la(pr([[0,-.46],[.1,-.46],[.13,-.41],[.142,-.22],[.125,-.06],[.085,0],[0,.02]],s)),ym);
    P(q,G.to(.138*s,.03*s),ik,[0,-.3*s,0],[PI/2,0,0]);P(q,G.to(.143*s,.03*s),ik,[0,-.2*s,0],[PI/2,0,0]);
    P(q,G.s(.03*s),m.glow(PAL.mint,2),[0,-.1*s,.13*s]);
    const ck=grp(q,[0,-.46*s,0]);P(ck,G.cy(.085*s,.06*s,.12*s),ch,[0,-.06*s,0]);P(ck,G.to(.078*s,.016*s),ik,[0,-.03*s,0],[PI/2,0,0]);
    const bit=grp(ck,[0,-.11*s,0]);P(bit,G.co(.052*s,.4*s),ch,[0,-.2*s,0],[PI,0,0]);
    P(bit,G.tu(range(70,t=>[Math.cos(t*TAU*3.5)*.058*s*(1-t*.85),-t*.38*s,Math.sin(t*TAU*3.5)*.058*s*(1-t*.85)]),.025*s,.01*s,140),m.steel());
    const sp=spinner();R.tick=(t,w,act)=>{bit.rotation.y=-sp(t,5+act*35)}})});

A('saege','Kreissäge','masch',(g,c)=>{const{s,m}=c;const bm=m.gloss(PAL.blue),gd=m.gloss(PAL.lemon),ik=m.black();
  rig(g,c,{rz:.45,lift:1.1},(q,sg,R)=>{P(q,G.s(.11*s),bm);P(q,G.ca(.09*s,.18*s),bm,[0,-.14*s,0]);
    P(q,G.bx(.22*s,.17*s,.2*s,.07*s),bm,[0,-.34*s,0]);P(q,G.s(.028*s),m.glow(PAL.lemon,2),[.02*s,-.32*s,.1*s]);
    const bl=grp(q,[0,-.64*s,0],[0,.3,0]);
    const sp=grp(bl);P(sp,G.puff(gearShape(.22*s,18,.05*s),.028*s,.009*s),m.chrome());P(sp,G.cy(.06*s,.06*s,.08*s),ik,null,[PI/2,0,0]);P(sp,G.s(.025*s),m.steel(),[0,0,.045*s]);
    P(bl,G.to(.24*s,.045*s,PI),gd,[0,0,0]);bt(bl,[0,.26*s,0],[0,.05*s,0],.035*s,ik);
    const spn=spinner();R.tick=(t,w,act)=>{sp.rotation.z=-spn(t,4+act*30)}})});

A('schluessel','Schraubenschlüssel','masch',(g,c)=>{const{s,m}=c;const sk=m.skin(),gr=m.gloss(PAL.coral),st=m.chrome();
  const R0=.12*s,ja=.045*s,al=Math.asin(ja/R0);const ws=new THREE.Shape();ws.moveTo(ja,-Math.cos(al)*R0);ws.absarc(0,0,R0,-PI/2+al,PI*1.5-al,false);ws.lineTo(-ja,.01*s);ws.lineTo(ja,.01*s);ws.closePath();
  const hg=G.puff(ws,.05*s,.014*s);
  rig(g,c,{rz:.45},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.08,r1:.1,r2:.09,bend:-.2});
    const w=grp(a.wr);P(w,G.ca(.078*s,.16*s),gr,[0,-.12*s,0]);both(y=>P(w,G.to(.08*s,.016*s),gr,[0,-(.12+y*.06)*s,0],[PI/2,0,0]));
    P(w,G.bx(.08*s,.18*s,.05*s,.022*s),st,[0,-.3*s,0]);P(w,hg,st,[0,-.48*s,0]);
    R.tick=(t,w2,act)=>{w.rotation.y=act*Math.sin(t*10)*.9+Math.sin(t*1.2+sg)*.1}})});

A('duesen','Düsen-Arme','masch',(g,c)=>{const{s,m}=c;const wh=m.gloss(WH),rd=m.gloss(PAL.coral),ik=m.black(),f1=m.glow(PAL.orange,2.2),f2=m.glow(PAL.lemon,2.6);
  const fin=G.puff(sshp([[0,0],[.1,-.03],[.13,-.17],[.02,-.13]].map(p=>[p[0]*s,p[1]*s])),.025*s,.01*s);
  rig(g,c,{rz:.42,fx:.3,lift:.55,walk:.2,out:.25},(q,sg,R)=>{P(q,G.s(.115*s),rd);
    P(q,G.la(pr([[0,-.42],[.1,-.42],[.13,-.34],[.135,-.18],[.11,-.04],[.07,.02],[0,.04]],s)),wh);
    P(q,G.to(.138*s,.028*s),rd,[0,-.26*s,0],[PI/2,0,0]);P(q,G.s(.035*s),m.glow(PAL.sky,2),[0,-.15*s,.12*s]);
    range(3,(t,i)=>{const r=grp(q,[0,-.3*s,0],[0,i*TAU/3+.6,0]);P(r,fin,rd,[.1*s,0,0])});
    P(q,G.cy(.085*s,.115*s,.1*s),ik,[0,-.47*s,0]);
    const fl=grp(q,[0,-.51*s,0]);P(fl,G.drop(.1*s,.32*s),f1,[0,-.09*s,0],[PI,0,0]);P(fl,G.drop(.06*s,.2*s),f2,[0,-.06*s,0],[PI,0,0]);
    R.tick=(t,w,act)=>{const k=1+Math.sin(t*37)*.07+Math.sin(t*23)*.06;fl.scale.set(k*(1+act*.2),k*(1+act*1.1)*(w?1.2:1),k*(1+act*.2))}})});

A('propeller','Propellerarme','masch',(g,c)=>{const{s,m}=c;const rd=m.gloss(PAL.coral),yl=m.gloss(PAL.lemon),ik=m.black(),wh=m.c(PAL.white,{opacity:.3});
  const bg=G.puff(sshp([[.03,-.07],[.2,-.115],[.38,-.095],[.45,0],[.38,.095],[.2,.115],[.03,.07]].map(p=>[p[0]*s,p[1]*s])),.035*s,.012*s);
  both(sg=>{const o=grp(g,[sg*c.shX,c.shY,0]);const a=grp(o);const q=grp(a);q.scale.x=sg;
    P(q,G.s(.1*s),ik);limbSeg(q,[0,0,0],[.28*s,.42*s,0],.055*s,rd);
    const mt=grp(q,[.3*s,.46*s,0]);P(mt,G.cy(.07*s,.08*s,.12*s),rd);P(mt,G.to(.078*s,.02*s),ik,[0,-.03*s,0],[PI/2,0,0]);
    const rot=grp(mt,[0,.08*s,0]);P(rot,G.s(.05*s),yl,null,null,[1,.75,1]);
    range(3,(t,i)=>{const b=grp(rot,[0,0,0],[0,i*TAU/3,0]);P(b,bg,yl,[0,0,0],[-PI/2+.3,0,0]);P(b,G.s(.05*s),rd,[.42*s,0,0],null,[1,.55,1.5])});
    const d=P(rot,G.circ(.44*s),wh,[0,.012*s,0],[-PI/2,0,0]);d.castShadow=false;
    const sp=spinner();
    c.an((t,w,act)=>{rot.rotation.y=sp(t,16+act*20);const ph=sg>0?0:PI;a.rotation.x=(w?Math.sin(t*6.3+ph)*.15:Math.sin(t*1.5+ph)*.04)-act*.15;a.rotation.z=sg*(Math.sin(t*2+ph)*.04-act*.15)})})});

A('solar','Solarflügel','masch',(g,c)=>{const{s,m}=c;
  const tex=ctex('arm-solar',256,176,(x,w,h)=>{x.fillStyle=PAL.navy;x.fillRect(0,0,w,h);const cw=w/4,ch=h/3;
    for(let j=0;j<3;j++)for(let i=0;i<4;i++){const gx=i*cw+5,gy=j*ch+5,ww=cw-10,hh=ch-10;const gr=x.createLinearGradient(gx,gy,gx+ww,gy+hh);gr.addColorStop(0,PAL.sky);gr.addColorStop(.45,PAL.blue);gr.addColorStop(1,'#5A7FD6');x.fillStyle=gr;
      x.beginPath();x.moveTo(gx+8,gy);x.arcTo(gx+ww,gy,gx+ww,gy+hh,8);x.arcTo(gx+ww,gy+hh,gx,gy+hh,8);x.arcTo(gx,gy+hh,gx,gy,8);x.arcTo(gx,gy,gx+ww,gy,8);x.fill();
      x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.moveTo(gx+6,gy+hh*.55);x.lineTo(gx+ww*.45,gy+4);x.lineTo(gx+ww*.62,gy+4);x.lineTo(gx+6,gy+hh*.85);x.fill()}});
  const fr=m.gloss(WH),st=m.steel(),hn=m.gloss(PAL.lemon),cell=m.tex('arm-solar',tex,{gloss:1.2,rim:.5,rimColor:'#cfe6ff'});
  backW(g,c,{base:.2,amp:.05,f:1.1,tilt:.3,z:.8},(q,sg,R)=>{P(q,G.s(.075*s),st);bt(q,[0,0,0],[.2*s,0,0],.035*s,st);
    const panel=(p)=>{P(p,G.s(.05*s),hn);P(p,G.bx(.5*s,.36*s,.05*s,.022*s),fr,[.28*s,0,0]);P(p,G.bx(.45*s,.31*s,.02*s,.008*s),cell,[.28*s,0,.021*s]);P(p,G.bx(.45*s,.31*s,.02*s,.008*s),cell,[.28*s,0,-.021*s])};
    const p1=grp(q,[.22*s,0,0]);panel(p1);const p2=grp(p1,[.54*s,0,0]);panel(p2);
    P(p2,G.s(.025*s),m.glow(PAL.mint,2),[.53*s,.16*s,.03*s]);
    R.tick=(t,w,act)=>{p1.rotation.x=Math.sin(t*.5)*.18;p2.rotation.y=-.3*(1-act)+Math.sin(t*.7)*.05;p1.rotation.z=.05+act*.2}})});

A('kabel','Kabelarme','masch',(g,c)=>{const{s,m}=c;const cols=[PAL.coral,PAL.sky,PAL.lemon],pw0=m.gloss(WH),ch=m.chrome(),ik=m.black();
  rig(g,c,{rz:.35,walk:.35,idle:.06,lift:1},(q,sg,R)=>{P(q,G.s(.1*s),ik);P(q,G.cy(.085*s,.075*s,.08*s),ik,[0,-.06*s,0]);
    const C=range(3,(t,i)=>{const cg=grp(q,[(i-1)*.042*s,-.09*s,(i===1?.03:-.02)*s]);const L=(.5+i*.07)*s;const ml=m.gloss(cols[i]),pw=i===1?pw0:ml;
      P(cg,G.tu([[0,.02*s,0],[.04*s*(i-1),-L*.35,.05*s],[-.03*s*(i-1),-L*.7,-.02*s],[0,-L,0]],.04*s),ml);
      const pl=grp(cg,[0,-L,0]);pl.scale.setScalar(1.4);
      if(i===0){P(pl,G.cy(.065*s,.07*s,.11*s),pw,[0,-.04*s,0]);P(pl,G.to(.066*s,.014*s),ml,[0,-.01*s,0],[PI/2,0,0]);both(x=>P(pl,G.cy(.016*s,.016*s,.07*s),ch,[x*.03*s,-.12*s,0]))}
      else if(i===1){P(pl,G.bx(.1*s,.12*s,.06*s,.025*s),pw,[0,-.05*s,0]);P(pl,G.bx(.075*s,.07*s,.035*s,.008*s),ch,[0,-.13*s,0])}
      else{P(pl,G.cy(.045*s,.05*s,.12*s),pw,[0,-.05*s,0]);P(pl,G.cy(.018*s,.018*s,.1*s),ch,[0,-.15*s,0]);P(pl,G.s(.021*s),ch,[0,-.2*s,0])}
      return cg});
    R.tick=(t,w,act)=>{C.forEach((cg,i)=>{cg.rotation.x=Math.sin(t*(w?6.3:1.8)+i*1.1+sg)*(w?.22:.09)-act*.25;cg.rotation.z=Math.sin(t*1.3+i*2)*.07})}})});

A('feder','Sprungfeder-Arme','masch',(g,c)=>{const{s,m}=c;const cap=m.gloss(PAL.blue),glv=m.gloss(PAL.strawberry),cf=m.gloss(WH);
  const coil=G.tu(range(100,t=>[Math.cos(t*TAU*6)*.075*s,-t*.4*s,Math.sin(t*TAU*6)*.075*s]),.026*s,.026*s,260);
  rig(g,c,{rz:.45,lift:1.2},(q,sg,R)=>{P(q,G.s(.105*s),cap);P(q,G.cy(.09*s,.095*s,.06*s),cap,[0,-.07*s,0]);
    const sp=grp(q,[0,-.1*s,0]);P(sp,coil,m.chrome());
    const gl=grp(q,[0,-.52*s,0]);P(gl,G.cy(.085*s,.09*s,.08*s),cf,[0,-.02*s,0]);P(gl,G.to(.088*s,.018*s),cf,[0,-.06*s,0],[PI/2,0,0]);
    P(gl,G.s(.15*s),glv,[0,-.2*s,.015*s],null,[.95,1.05,1.12]);P(gl,G.s(.065*s),glv,[-.06*s,-.14*s,.12*s],null,[1,1.3,1]);
    R.tick=(t,w,act)=>{const e=1+Math.sin(t*(w?6.3:2.6)+sg)*.1+act*(.9+Math.sin(t*14)*.25);sp.scale.y=e;gl.position.y=-.1*s-.4*s*e-.02*s}})});

A('teleskop','Teleskoparme','masch',(g,c)=>{const{s,m}=c;const cs=[m.gloss(PAL.navy),m.gloss(PAL.blue),m.gloss(PAL.sky)],rim=m.chrome(),gl=m.gloss(WH);
  rig(g,c,{rz:.45,lift:1.3},(q,sg,R)=>{P(q,G.s(.12*s),cs[0]);
    const T=range(3,(t,i)=>{const r=(.1-i*.018)*s;const tg=grp(q);P(tg,G.cy(r,r,.27*s),cs[i],[0,-.135*s,0]);P(tg,G.to(r,.02*s),rim,[0,-.27*s,0],[PI/2,0,0]);return tg});
    const hd=grp(q);P(hd,G.to(.07*s,.035*s),gl,[0,-.01*s,0],[PI/2,0,0]);const h=mitten(hd,c,gl,.115*s);
    R.tick=(t,w,act)=>{const e=.35+.3*(Math.sin(t*1.2+sg)+1)/2+act*.75;T.forEach((tg,i)=>tg.position.y=-i*e*.24*s);hd.position.y=-.27*s-2*e*.24*s-.02*s;h.curl(.2+act*.5)}})});

A('magnet','Magnethände','masch',(g,c)=>{const{s,m}=c;const sk=m.skin(),mg=m.gloss(PAL.cherry),st=m.chrome(),cf=m.gloss(WH),nm=m.steel();
  const nut=new THREE.TorusGeometry(.035*s,.017*s,6,6),hx=new THREE.CylinderGeometry(.035*s,.035*s,.025*s,6);
  rig(g,c,{rz:.45,lift:1.2},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.17,r1:.1,r2:.09,bend:-.3});
    const hd=grp(a.wr);P(hd,G.cy(.095*s,.1*s,.06*s),cf,[0,-.02*s,0]);
    const R0=.12*s,tb=.058*s;P(hd,G.to(R0,tb,PI),mg,[0,-.23*s,0]);
    both(x=>{P(hd,G.cy(tb,tb,.1*s),mg,[x*R0,-.28*s,0]);P(hd,G.cy(tb*1.03,tb*1.03,.07*s),st,[x*R0,-.365*s,0])});
    const B=[P(hd,nut,nm,[-.06*s,-.55*s,.02*s]),P(hd,nut,nm,[.1*s,-.6*s,-.03*s])];
    const bo=grp(hd,[.02*s,-.66*s,.05*s]);P(bo,hx,nm);P(bo,G.cy(.016*s,.016*s,.09*s),nm,[0,-.05*s,0]);B.push(bo);
    const base=B.map(b=>b.position.y);
    R.tick=(t,w,act)=>{B.forEach((b,i)=>{b.position.y=base[i]+Math.sin(t*3+i*2)*.025*s+act*.1*s;b.rotation.x=t*(1+i*.3);b.rotation.z=Math.sin(t*2+i)*.4})}})});

A('haken','Hakenhände','masch',(g,c)=>{const{s,m}=c;const sk=m.skin(),cup=m.gloss(PAL.bark),ch=m.chrome();
  rig(g,c,{rz:.45},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.14,r1:.1,r2:.09,bend:-.25});
    const hd=grp(a.wr,[0,.02*s,0]);P(hd,G.la(pr([[0,-.1],[.1,-.1],[.122,-.06],[.118,.04],[.1,.08],[0,.08]],s)),cup);
    P(hd,G.to(.118*s,.022*s),m.gold(),[0,-.06*s,0],[PI/2,0,0]);
    P(hd,G.cy(.038*s,.038*s,.14*s),ch,[0,-.16*s,0]);
    const Rh=.085*s;P(hd,G.to(Rh,.036*s,PI*1.2),ch,[Rh,-.23*s,0],[0,0,PI]);
    const ea=PI*2.2;P(hd,G.s(.045*s),ch,[Rh+Math.cos(ea)*Rh,-.23*s+Math.sin(ea)*Rh,0]);
    R.tick=(t,w,act)=>{hd.rotation.y=Math.sin(t*1.1+sg)*.25+act*Math.sin(t*8)*.6}})});

A('pinzette','Pinzettenfinger','masch',(g,c)=>{const{s,m}=c;const sk=m.skin(),gp=m.gloss(PAL.mint),ch=m.chrome(),tp=m.gloss(PAL.coral);
  rig(g,c,{rz:.45},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.14,r1:.1,r2:.09,bend:-.25});
    const hd=grp(a.wr);P(hd,G.ca(.088*s,.08*s),gp,[0,-.09*s,0]);P(hd,G.to(.089*s,.018*s),m.gloss(WH),[0,-.06*s,0],[PI/2,0,0]);
    const T=[1,-1].map(z=>{const t=grp(hd,[0,-.17*s,z*.035*s]);P(t,G.bx(.075*s,.38*s,.034*s,.016*s),ch,[0,-.19*s,0]);P(t,G.s(.04*s),tp,[0,-.38*s,-z*.008*s],null,[1.1,1,.8]);return t});
    R.tick=(t,w,act)=>{const o=act>0?.04+Math.abs(Math.sin(t*9))*.14:.08+Math.max(0,Math.sin(t*2.2+sg))*.1;T[0].rotation.x=-o;T[1].rotation.x=o}})});

A('mikro','Mikrofonarme','masch',(g,c)=>{const{s,m}=c;const ik=m.black(),pk=m.gloss(PAL.pink),hd=m.steel();
  rig(g,c,{rz:.45,fx:-.25,lift:.9,walk:.3},(q,sg,R)=>{P(q,G.s(.1*s),ik);
    const S=chainArm(q,6,()=>.075*s,()=>.048*s,(p,t,i,L,Rr)=>{P(p,G.s(Rr),ik,[0,-L/2,0],null,[1,1.3,1])});
    const h=grp(S[5],[0,-.075*s,0]);P(h,G.cy(.048*s,.064*s,.13*s),pk,[0,-.065*s,0]);P(h,G.to(.066*s,.018*s),m.gold(),[0,-.13*s,0],[PI/2,0,0]);
    P(h,G.s(.105*s),hd,[0,-.22*s,0]);P(h,G.to(.104*s,.016*s),pk,[0,-.22*s,0],[PI/2,0,0]);P(h,G.s(.022*s),m.glow(PAL.mint,2),[0,-.06*s,.058*s]);
    R.tick=(t,w,act)=>{const sp=w?5:2.4;S.forEach((p,i)=>{if(!i)return;p.rotation.x=-.3+Math.sin(t*sp-i*.5+sg)*.07-act*.1;p.rotation.z=Math.sin(t*1.3-i*.4)*.05})}})});

/* =================== PFLANZLICH =================== */
const LEAF=sshp([[0,0],[.25,.2],[.7,.16],[1,0],[.7,-.16],[.25,-.2]]);
A('ranken','Ranken','pflanze',(g,c)=>{const{s,m}=c;const vm=m.c(PAL.moss,{rim:.5,rimColor:'#eaffb0'}),lm=m.c(PAL.grass,{rim:.5,rimColor:'#eaffb0'});const lg=G.puff(LEAF,.14);
  rig(g,c,{rz:.35,walk:.3,idle:.04,lift:1},(q,sg,R)=>{P(q,G.s(.09*s),vm);
    P(q,G.star(.075*s,.042*s,5,.03*s),m.gloss(PAL.pink),[.03*s,.07*s,.06*s],[-.5,.3,0]);P(q,G.s(.026*s),m.gloss(PAL.lemon),[.03*s,.085*s,.08*s]);
    const S=chainArm(q,8,t=>(.1-.025*t)*s,t=>(.064-.034*t)*s,(p,t,i,L,Rr)=>{P(p,G.ca(Rr,L*.7),vm,[0,-L/2,0]);
      if(i===1||i===3||i===5){const d=i===3?-1:1;const lf=grp(p,[d*Rr*.6,-L*.4,.02*s],[0,d>0?-.4:.4+PI,d*.5]);P(lf,lg,lm,null,null,[.3*s,.3*s,.3*s])}});
    P(S[7],G.to(.045*s,.015*s,PI*1.6),vm,[.042*s,-.09*s,0],[0,0,PI*.6]);
    R.tick=(t,w,act)=>{const sp=w?4:1.7;S.forEach((p,i)=>{if(!i)return;const k=i/7;p.rotation.z=(.04+k*k*.5)*(1-act*.7)+Math.sin(t*sp-i*.7+sg)*.12*k;p.rotation.x=Math.sin(t*sp*.8-i*.6+sg*2)*.09-act*.08})}})});

A('aeste','Äste','pflanze',(g,c)=>{const{s,m}=c;const wd=m.wood(),l1=m.c(PAL.leaf,{rim:.5,rimColor:'#eaffb0'}),l2=m.c(PAL.grass,{rim:.5,rimColor:'#eaffb0'});
  rig(g,c,{rz:.5,walk:.25,idle:.03,lift:.9},(q,sg,R)=>{P(q,G.s(.1*s),wd);
    const T=(pts,r1,r2)=>{const pp=pts.map(p=>[p[0]*s,p[1]*s,p[2]*s]);P(q,G.tu(pp,r1*s,r2*s),wd);P(q,G.s(r2*s),wd,pp[pp.length-1])};
    T([[0,0,0],[.02,-.25,.02],[-.02,-.5,0],[.02,-.64,.02]],.085,.05);
    T([[.0,-.26,.01],[.12,-.34,.04],[.21,-.34,.08]],.05,.03);
    T([[-.01,-.44,0],[-.12,-.53,.03],[-.14,-.64,.06]],.045,.028);
    range(3,(t,i)=>P(q,G.ca(.025*s,.05*s),wd,[(.02+(t-.5)*.06)*s,-.7*s,.02*s],[0,0,(t-.5)*.8]));
    P(q,G.blob(.1*s,.12,3,2),l1,[.23*s,-.3*s,.1*s]);P(q,G.blob(.085*s,.12,3,5),l2,[-.16*s,-.66*s,.08*s]);P(q,G.blob(.075*s,.12,3,7),l2,[.06*s,.06*s,.05*s]);
    if(sg>0){const ap=grp(q,[.19*s,-.38*s,.09*s]);P(ap,G.cy(.009*s,.012*s,.06*s),m.c(PAL.bark),[0,-.02*s,0]);P(ap,G.s(.068*s),m.gloss(PAL.cherry),[0,-.1*s,0],null,[1.05,.95,1.05]);P(ap,G.puff(LEAF,.14),l1,[0,-.035*s,0],[0,0,.5],.1*s);
      R.tick=(t)=>{ap.rotation.z=Math.sin(t*2)*.15}}})});

A('wurzeln','Luftwurzeln','pflanze',(g,c)=>{const{s,m}=c;const kn=m.c(PAL.bark,{rim:.4}),rm=m.c(PAL.wood,{rim:.45,rimColor:'#ffe0c0'}),ms=m.c(PAL.moss,{rim:.5,rimColor:'#eaffb0'}),lm=m.c(PAL.grass);const lg=G.puff(LEAF,.14);
  rig(g,c,{rz:.28,walk:.3,idle:.04,lift:.9},(q,sg,R)=>{P(q,G.blob(.13*s,.1,3,sg>0?3:5),kn);P(q,G.blob(.105*s,.14,4,2),ms,[0,.07*s,0],null,[1.15,.6,1.15]);
    P(q,G.cy(.012*s,.014*s,.08*s),lm,[0,.14*s,0]);both(x=>P(q,lg,lm,[0,.17*s,0],[0,0,PI/2-x*.9],[.12*s*x,.12*s,.12*s]));
    const Ls=[.58,.72,.46,.64,.4];
    const S=Ls.map((l,i)=>{const a=i/5*TAU+.3;const sg2=grp(q,[Math.cos(a)*.065*s,-.06*s,Math.sin(a)*.065*s],[Math.sin(a)*.35,0,-Math.cos(a)*.45]);const L=l*s,d=i%2?1:-1;
      const pts=[[0,0,0],[.035*s*d,-L*.33,.02*s],[-.03*s*d,-L*.66,-.01*s],[.02*s*d,-L,.02*s]];P(sg2,G.tu(pts,.042*s,.018*s),rm);P(sg2,G.s(.02*s),rm,pts[3]);if(i%2===0){const b=[pts[1][0],pts[1][1]-.04*s,pts[1][2]];P(sg2,G.tu([b,[b[0]+.07*s*d,b[1]-.06*s,b[2]+.02*s],[b[0]+.1*s*d,b[1]-.14*s,b[2]]],.022*s,.013*s),rm)}return sg2});
    R.tick=(t,w,act)=>{S.forEach((p,i)=>{p.rotation.x=Math.sin(t*(w?5:1.5)+i*1.3+sg)*.09-act*.15;p.rotation.z=Math.sin(t*1.2+i*2.1)*.07})}})});

A('blaetter','Riesenblätter','pflanze',(g,c)=>{const{s,m}=c;const lm=m.c(PAL.leaf,{rim:.5,rimColor:'#eaffb0'}),rb=m.c(PAL.mint),st=m.c(PAL.moss);
  const half=[[.2,.05],[.42,-.05],[.5,-.2],[.3,-.28],[.54,-.38],[.52,-.56],[.3,-.6],[.44,-.76],[.22,-.95],[0,-1.04]];
  const pts=[[0,-.02],...half,...half.slice(0,-1).reverse().map(p=>[-p[0],p[1]])];const sh=sshp(pts);
  [[.17,-.45],[-.17,-.5],[.15,-.72],[-.14,-.76]].forEach(([x,y])=>{const h=new THREE.Path();h.absellipse(x,y,.06,.09,0,TAU,true,0);sh.holes.push(h)});
  const lg=G.puff(sh,.07);
  rig(g,c,{rz:.38,walk:.3,idle:.05,lift:1},(q,sg,R)=>{P(q,G.s(.075*s),st);
    P(q,G.tu([[0,0,0],[.03*s,-.12*s,.03*s],[.02*s,-.22*s,.05*s]],.035*s,.03*s),st);
    const lf=grp(q,[.02*s,-.21*s,.05*s],[.25,-.35,0]);const S=.82*s;P(lf,lg,lm,null,null,S);
    P(lf,G.tu([[0,-.02*S,.07*S],[0,-.45*S,.075*S],[0,-.9*S,.06*S]],.025*S,.012*S),rb);
    R.tick=(t,w,act)=>{lf.rotation.x=.25+Math.sin(t*(w?5:1.4)+sg)*.12-act*.4;lf.rotation.z=Math.sin(t*1.1+sg)*.08}})});

A('kaktus','Kaktusarme','pflanze',(g,c)=>{const{s,m}=c;const km=m.c(PAL.moss,{rim:.45,rimColor:'#eaffb0'}),rb=m.c(PAL.grass),sp=m.c(PAL.cream);
  both(sg=>{const o=grp(g,[sg*c.shX*.95,c.shY-.08*s,0]);const a=grp(o);const q=grp(a);q.scale.x=sg;
    P(q,G.ca(.1*s,.22*s),km,[.16*s,0,0],[0,0,PI/2]);P(q,G.ca(.1*s,.3*s),km,[.32*s,.2*s,0]);
    [-.5,0,.5].forEach(ph=>P(q,G.ca(.02*s,.3*s),rb,[.32*s+Math.sin(ph)*.098*s,.2*s,Math.cos(ph)*.098*s]));
    [-.5,.5].forEach(ph=>P(q,G.ca(.02*s,.2*s),rb,[.15*s,Math.sin(ph)*.098*s,Math.cos(ph)*.098*s],[0,0,PI/2]));
    [[.32,.38,.3],[.4,.16,.9],[.25,.08,-.6],[.12,.1,0],[.2,-.08,.3],[.4,.3,1.5]].forEach(([x,y,a2])=>{const d=[Math.sin(a2),0,Math.cos(a2)];
      const b=grp(q,[x*s+d[0]*.1*s,y*s,d[2]*.1*s],[PI/2,a2,0]);P(b,G.co(.013*s,.05*s),sp,[0,.015*s,0])});
    if(sg>0){P(q,G.star(.075*s,.038*s,6,.03*s),m.gloss(PAL.pink),[.32*s,.47*s,0],[-PI/2,0,0]);P(q,G.s(.028*s),m.gloss(PAL.lemon),[.32*s,.49*s,0])}
    c.an((t,w,act)=>{const ph=sg>0?0:PI;const j=Math.sin(t*(w?6.3:1.5)+ph);a.rotation.z=sg*(j*.05+act*(.2+Math.sin(t*9)*.1));a.rotation.x=j*.04-act*.2;q.scale.y=1+Math.sin(t*3+ph)*.015})})});

/* =================== OBJEKTE =================== */
A('besteck','Gabel und Löffel','ding',(g,c)=>{const{s,m}=c;const sk=m.skin(),ch=m.chrome();
  rig(g,c,{rz:.45,lift:1.1},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.08,r1:.1,r2:.09,bend:-.2});
    const hd=grp(a.wr);const hm=m.gloss(sg>0?PAL.pink:PAL.mint);
    P(hd,G.ca(.062*s,.2*s),hm,[0,-.12*s,0]);P(hd,G.heart(.03*s,.02*s),m.gloss(WH),[0,-.14*s,.06*s]);
    P(hd,G.cy(.026*s,.03*s,.12*s),ch,[0,-.31*s,0]);
    if(sg>0){P(hd,G.puff(sshp([[-.03,.03],[.03,.03],[.13,-.02],[.14,-.1],[-.14,-.1],[-.13,-.02]].map(p=>[p[0]*s,p[1]*s])),.03*s,.012*s),ch,[0,-.37*s,0]);
      range(4,(t,i)=>P(hd,G.ca(.026*s,.16*s),ch,[(t-.5)*.2*s,-.55*s,0]))}
    else{P(hd,G.s(.15*s),ch,[0,-.52*s,0],null,[.8,1.12,.36])}
    R.tick=(t,w,act)=>{a.el.rotation.x=-.2-act*.9;hd.rotation.z=act*Math.sin(t*8)*.25}})});

A('schirm','Regenschirm','ding',(g,c)=>{const{s,m}=c;const sk=m.skin(),ik=m.black(),wd=m.gloss(PAL.choc);
  const tex=ctex('arm-schirm',256,32,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?PAL.white:PAL.strawberry;x.fillRect(i*w/8,0,w/8+1,h)}});
  const cm=m.tex('arm-schirm',tex,{gloss:.6,rim:.5});const RZ=2.45;
  rig(g,c,sg=>sg>0?{rz:RZ,fx:-.15,lift:.12,walk:.08,idle:.02,out:0}:{rz:.45},(q,sg,R)=>{
    const a=arm2(q,c,sk,{L1:.22,L2:.2,r1:.1,r2:.092,bend:sg>0?0:-.22});const h=mitten(a.wr,c,sk,.11*s);
    if(sg<0){R.tick=(t,w,act)=>{a.el.rotation.x=-.22-act*.8;h.curl(.2)};return}
    h.curl(1.2);
    const reach=(.22+.2+.14)*s,hy=c.shY+reach*Math.cos(PI-RZ);const top=Math.max(c.H.top,c.hy+c.hr)+.28*s;const len=Math.max(.5*s,top-hy);
    const um=grp(a.wr,[0,-.14*s,0],[0,0,-RZ+.3]);
    P(um,G.cy(.022*s,.022*s,len+.1*s),ik,[0,len/2-.05*s,0]);P(um,G.to(.055*s,.024*s,PI),wd,[.055*s,-.1*s,0],[0,0,PI]);P(um,G.s(.028*s),wd,[.11*s,-.1*s,0]);
    const cn=grp(um,[0,len,0]);
    P(cn,G.la(pr([[0,.04],[.68,-.1],[.71,-.07],[.56,.1],[.32,.22],[0,.26]],s),Q(40)),cm);
    range(8,(t,i)=>{const an=i/8*TAU;P(cn,G.s(.028*s),m.gloss(WH),[Math.sin(an)*.69*s,-.09*s,Math.cos(an)*.69*s])});
    P(cn,G.cy(.018*s,.022*s,.08*s),ik,[0,.29*s,0]);P(cn,G.s(.035*s),m.gloss(PAL.strawberry),[0,.34*s,0]);
    R.tick=(t,w,act)=>{cn.rotation.y=Math.sin(t*.8)*.25+act*t*3;um.rotation.x=Math.sin(t*1.1)*.05}})});

A('selfie','Selfie-Stick','masch',(g,c)=>{const{s,m}=c;const sk=m.skin(),ik=m.black();
  const scr=ctex('arm-selfie',128,224,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,PAL.sky);gr.addColorStop(1,PAL.lilac);x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.fillStyle=PAL.butter;x.beginPath();x.arc(w/2,h*.42,40,0,TAU);x.fill();x.fillStyle=PAL.ink;[-1,1].forEach(d=>{x.beginPath();x.ellipse(w/2+d*14,h*.4,5,8,0,0,TAU);x.fill()});
    x.strokeStyle=PAL.ink;x.lineWidth=4;x.beginPath();x.arc(w/2,h*.44,14,.2*PI,.8*PI);x.stroke();
    x.fillStyle=PAL.white;x.beginPath();x.arc(w/2,h*.85,14,0,TAU);x.fill();x.fillStyle=PAL.pink;x.beginPath();x.arc(w/2,h*.85,9,0,TAU);x.fill()});
  rig(g,c,sg=>sg>0?{rz:.85,fx:-1.25,lift:.25,walk:.1,idle:.03,out:0}:{rz:.35,fx:-.3,lift:.3,walk:.15},(q,sg,R)=>{
    if(sg>0){const a=arm2(q,c,sk,{L1:.22,L2:.2,r1:.1,r2:.092,bend:-.1});const h=mitten(a.wr,c,sk,.11*s);h.curl(1.2);
      const st=grp(a.wr,[0,-.14*s,0]);P(st,G.cy(.026*s,.032*s,.72*s),ik,[0,-.36*s,0]);P(st,G.to(.032*s,.012*s),m.gloss(PAL.pink),[0,-.22*s,0],[PI/2,0,0]);
      const ph=grp(st,[0,-.78*s,0]);ph.scale.setScalar(1.3);P(ph,G.bx(.23*s,.05*s,.38*s,.04*s),m.gloss(PAL.lilac));P(ph,G.pl(.19*s,.33*s),m.tex('arm-selfie',scr,{rim:0}),[0,.026*s,0],[-PI/2,0,0]);
      P(ph,G.cy(.032*s,.032*s,.02*s),ik,[.05*s,-.028*s,.12*s]);P(ph,G.heart(.05*s,.02*s),m.gloss(PAL.pink),[-.03*s,-.03*s,-.03*s],[PI/2,PI,0]);
      R.tick=(t,w,act)=>{st.rotation.z=Math.sin(t*1.3)*.06;ph.rotation.y=Math.sin(t*.9)*.1+act*Math.sin(t*6)*.2}}
    else{const a=arm2(q,c,sk,{L1:.22,L2:.2,r1:.1,r2:.092,bend:-2.1});const hd=grp(a.wr,[0,0,0],[0,-.3,0]);
      P(hd,G.s(.1*s),sk,[0,-.08*s,0],null,[.82,1,1.05]);
      const V=[-1,1].map(d=>{const f=grp(hd,[0,-.15*s,d*.04*s],[d*-.28,0,0]);P(f,G.ca(.036*s,.13*s),sk,[0,-.1*s,0]);return f});
      P(hd,G.s(.04*s),sk,[-.03*s,-.16*s,-.08*s]);P(hd,G.ca(.034*s,.03*s),sk,[-.05*s,-.1*s,.08*s],[-.8,0,-.6]);
      R.tick=(t,w,act)=>{a.el.rotation.x=-2.1+Math.sin(t*2)*.08;hd.rotation.z=Math.sin(t*3)*.12*(1+act*2);V.forEach((f,i)=>f.rotation.x=(i?-1:1)*(.28+Math.sin(t*4)*.05))}}})});

A('ballon','Luftballon-Arme','ding',(g,c)=>{const{s,m}=c;
  rig(g,c,{rz:.55,fx:-.12,walk:.3,idle:.1,lift:1},(q,sg,R)=>{const bm=m.gloss(sg>0?PAL.pink:PAL.sky);
    P(q,G.s(.1*s),bm);const up=grp(q,[0,-.04*s,0]);P(up,G.ca(.085*s,.2*s),bm,[0,-.16*s,0]);P(up,G.s(.035*s),bm,[0,-.335*s,0],null,[1.4,.7,1.4]);
    const el=grp(up,[0,-.34*s,0],[-.45,0,0]);P(el,G.ca(.08*s,.18*s),bm,[0,-.17*s,0]);P(el,G.s(.033*s),bm,[0,-.34*s,0],null,[1.4,.7,1.4]);
    const pw=grp(el,[0,-.35*s,0]);P(pw,G.s(.1*s),bm,[0,-.08*s,0]);range(3,(t,i)=>P(pw,G.s(.04*s),bm,[.02*s,-.17*s,(t-.5)*.1*s]));
    let bb=null;
    if(sg>0){bb=grp(pw,[0,-.1*s,0]);const pts=[[0,0,0],[.14*s,.28*s,.06*s],[.24*s,.6*s,.03*s],[.3*s,.86*s,.08*s]];P(bb,G.tu(pts,.012*s),m.c(PAL.ink));
      P(bb,G.s(.17*s),m.gloss(PAL.lemon),[.31*s,1.04*s,.08*s],null,[1,1.16,1]);P(bb,G.co(.03*s,.05*s),m.gloss(PAL.lemon),[.3*s,.87*s,.08*s])}
    R.tick=(t,w,act)=>{const b=Math.sin(t*2.2+sg);el.rotation.x=-.45+b*.12-act*.5;up.scale.set(1+b*.03,1-b*.03,1+b*.03);if(bb)bb.rotation.z=Math.sin(t*1.3)*.08}})});

A('pinsel','Pinselhände','ding',(g,c)=>{const{s,m}=c;const sk=m.skin(),hd=m.gloss(PAL.oak),fe=m.gold(),br=m.c(PAL.cream);
  rig(g,c,{rz:.45,lift:1.1},(q,sg,R)=>{const pc=m.gloss(sg>0?PAL.blue:PAL.strawberry);const a=arm2(q,c,sk,{L1:.22,L2:.08,r1:.1,r2:.09,bend:-.2});
    const b=grp(a.wr);b.scale.setScalar(1.2);
    P(b,G.la(pr([[0,-.28],[.052,-.28],[.068,-.16],[.078,-.05],[.06,.02],[0,.03]],s)),hd);
    P(b,G.cy(.064*s,.056*s,.1*s),fe,[0,-.32*s,0]);P(b,G.to(.062*s,.012*s),fe,[0,-.3*s,0],[PI/2,0,0]);
    P(b,G.la(pr([[0,-.5],[.075,-.5],[.08,-.44],[.07,-.39],[.06,-.36],[0,-.36]],s)),br);
    P(b,G.la(pr([[0,-.62],[.025,-.61],[.066,-.56],[.085,-.5],[.083,-.47],[0,-.47]],s)),pc);
    const dr=P(b,G.drop(.03*s,.03*s),pc,[0,-.64*s,0],[PI,0,0]);
    R.tick=(t,w,act)=>{const u=(t*.6+(sg>0?0:.5))%1;dr.position.y=-.64*s-u*u*.45*s;dr.scale.setScalar(u<.85?Math.min(1,u*6):(1-u)/.15);b.rotation.z=act*Math.sin(t*9)*.5;b.rotation.x=act*Math.sin(t*9+1)*.2}})});

A('stifte','Bleistiftfinger','ding',(g,c)=>{const{s,m}=c;const sk=m.skin(),wd=m.c(PAL.sand);const cols=[PAL.lemon,PAL.leaf,PAL.strawberry,PAL.blue];
  const hex=new THREE.CylinderGeometry(.042*s,.042*s,.24*s,6),cone=new THREE.ConeGeometry(.042*s,.09*s,6);
  rig(g,c,{rz:.45,lift:1.1},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.17,r1:.1,r2:.09,bend:-.22});
    const hd=grp(a.wr,[0,0,0],[0,-.35,0]);P(hd,G.s(.13*s),sk,[0,-.08*s,0],null,[.82,1,1.1]);
    const F=range(4,(t,i)=>{const f=grp(hd,[0,-.15*s,(t-.5)*.2*s],[(t-.5)*-.55,0,0]);const pm=m.gloss(cols[i]);
      P(f,hex,pm,[0,-.11*s,0]);P(f,cone,wd,[0,-.275*s,0],[PI,0,0]);P(f,G.co(.017*s,.036*s),pm,[0,-.31*s,0],[PI,0,0]);return f});
    R.tick=(t,w,act)=>{F.forEach((f,i)=>f.rotation.z=Math.sin(t*(3+act*8)+i*1.3)*(.07+act*.12)-.05)}})});

A('schlauch','Gartenschlauch','ding',(g,c)=>{const{s,m}=c;const hm=m.gloss(PAL.grass),rg=m.gloss(PAL.orange),nz=m.gloss(PAL.lemon),wt=m.gloss(PAL.sky);
  const pts=[[0,0,0],[.05,-.15,.07],[.14,-.3,.03],[.08,-.43,-.09],[-.07,-.4,-.02],[-.06,-.29,.1],[.07,-.34,.15],[.1,-.53,.08],[.05,-.66,.03]].map(p=>p.map(v=>v*s));
  const hose=G.tu(pts,.05*s,.05*s,110);
  rig(g,c,{rz:.35,walk:.35,lift:1.1},(q,sg,R)=>{P(q,G.s(.1*s),rg);P(q,hose,hm);
    const e=pts[8];P(q,G.cy(.062*s,.062*s,.07*s),rg,[e[0],e[1]-.02*s,e[2]]);
    const n=grp(q,[e[0],e[1]-.06*s,e[2]]);n.scale.setScalar(1.35);P(n,G.bx(.11*s,.14*s,.09*s,.04*s),rg,[0,-.06*s,0]);P(n,G.cy(.07*s,.05*s,.08*s),nz,[0,-.16*s,0]);P(n,G.cy(.073*s,.073*s,.02*s),m.gloss(WH),[0,-.2*s,0]);
    const D=range(4,(t,i)=>P(n,G.drop(.026*s,.03*s),wt,[0,-.3*s,0],[PI,0,0]));
    R.tick=(t,w,act)=>{const sp=1.3+act*2;D.forEach((d,i)=>{const u=(t*sp+i/4)%1;const a=i*1.9;d.position.set(Math.sin(a)*.07*s*u,-.24*s-u*(.4+act*.2)*s,Math.cos(a)*.05*s*u);d.scale.setScalar(u<.1?u*10:u>.85?(1-u)/.15:1)})}})});

A('messer','Taschenmesser','ding',(g,c)=>{const{s,m}=c;const sk=m.skin(),rd=m.gloss(PAL.cherry),st=m.chrome(),wh=m.gloss(WH);
  const cr=G.puff(shp([[-.012,.036],[.012,.036],[.012,.012],[.036,.012],[.036,-.012],[.012,-.012],[.012,-.036],[-.012,-.036],[-.012,-.012],[-.036,-.012],[-.036,.012],[-.012,.012]].map(p=>[p[0]*s,p[1]*s])),.012*s,.005*s);
  const bl=G.puff(sshp([[-.02,.02],[.03,.02],[.05,-.12],[.035,-.22],[0,-.28],[-.02,-.2]].map(p=>[p[0]*s,p[1]*s])),.016*s,.006*s);
  const op=G.puff(sshp([[-.025,.02],[.025,.02],[.03,-.14],[.0,-.13],[.03,-.17],[-.028,-.18]].map(p=>[p[0]*s,p[1]*s])),.016*s,.006*s);
  const cs=G.tu(range(40,t=>[Math.cos(t*TAU*3.5)*.022*s,-.03*s-t*.15*s,Math.sin(t*TAU*3.5)*.022*s]),.013*s,.011*s,90);
  rig(g,c,{rz:.45,lift:1.1},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.1,r1:.1,r2:.09,bend:-.2});
    const k=grp(a.wr,[0,-.02*s,0],[0,-.5,0]);k.scale.setScalar(1.35);P(k,G.bx(.09*s,.32*s,.16*s,.045*s),rd,[0,-.17*s,0]);
    P(k,cr,wh,[.05*s,-.14*s,0],[0,PI/2,0]);P(k,G.s(.016*s),st,[.044*s,-.04*s,.05*s]);P(k,G.s(.016*s),st,[.044*s,-.29*s,-.05*s]);
    const T1=grp(k,[0,-.29*s,-.04*s]);P(T1,bl,st,null,[0,PI/2,0]);
    const T2=grp(k,[0,-.29*s,0]);P(T2,op,st,null,[0,PI/2,0]);
    const T3=grp(k,[0,-.29*s,.045*s]);P(T3,cs,st);P(T3,G.cy(.018*s,.018*s,.04*s),st,[0,-.01*s,0]);
    R.tick=(t,w,act)=>{const br=(Math.sin(t*.9+sg)+1)*.5;const o1=Math.min(1,.75+br*.1+act),o2=Math.min(1,.3+br*.15+act*.8),o3=Math.min(1,.55+br*.1+act);
      T1.rotation.x=PI*(1-o1)*.99;T2.rotation.x=PI*(1-o2);T3.rotation.x=-PI*(1-o3);k.rotation.x=act*Math.sin(t*7)*.25}})});

A('zange','Grillzange','ding',(g,c)=>{const{s,m}=c;const sk=m.skin(),gp=m.gloss(PAL.coral),st=m.chrome();
  rig(g,c,{rz:.45,lift:1.1},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.12,r1:.1,r2:.09,bend:-.22});
    const hd=grp(a.wr,[0,0,0],[0,-.9,0]);hd.scale.setScalar(1.25);P(hd,G.ca(.078*s,.1*s),gp,[0,-.1*s,0]);P(hd,G.to(.07*s,.02*s),st,[0,-.2*s,0],[PI/2,0,0]);
    const Z=[1,-1].map(z=>{const t=grp(hd,[0,-.2*s,z*.03*s]);P(t,G.bx(.06*s,.45*s,.028*s,.013*s),st,[0,-.22*s,0]);
      P(t,G.s(.06*s),st,[0,-.47*s,-z*.004*s],null,[1.15,1.4,.32]);range(2,(u,j)=>P(t,G.to(.035*s,.009*s),st,[0,-(.44+u*.06)*s,-z*.018*s]));return t});
    let mm=null;if(sg>0){mm=P(hd,G.ca(.058*s,.04*s),m.gloss(WH),[0,-.66*s,0],[PI/2,0,0]);P(mm,G.to(.057*s,.014*s),m.c(PAL.oak),[0,.035*s,0],[PI/2,0,0])}
    R.tick=(t,w,act)=>{const o=sg>0?.09+Math.sin(t*2)*.01:.08+Math.max(0,Math.sin(t*2.4))*.12+act*Math.abs(Math.sin(t*10))*.1;Z[0].rotation.x=-o;Z[1].rotation.x=o}})});

A('schwamm','Schwammhände','ding',(g,c)=>{const{s,m}=c;const sk=m.skin(),sp=m.c(PAL.lemon,{rim:.55}),gr=m.c(PAL.leaf),po=m.c(PAL.honey),bb=m.glass(PAL.aqua);
  rig(g,c,{rz:.45,lift:1.1},(q,sg,R)=>{const a=arm2(q,c,sk,{L1:.22,L2:.14,r1:.1,r2:.09,bend:-.22});
    const hd=grp(a.wr,[0,0,0],[0,-.35,0]);const sq=grp(hd,[0,-.02*s,0]);
    P(sq,G.bx(.24*s,.08*s,.26*s,.035*s),gr,[0,-.04*s,0]);P(sq,G.bx(.26*s,.24*s,.28*s,.075*s),sp,[0,-.2*s,0]);
    [[.13,-.14,.05,.03],[.13,-.24,-.06,.024],[.13,-.26,.08,.02],[.05,-.17,.14,.026],[-.06,-.25,.14,.022],[.0,-.32,.03,.03]].forEach(([x,y,z,r],i)=>P(sq,G.s(r*s),po,[x*s,y*s,z*s],null,i===5?[1,.4,1]:i>=3?[1,1,.4]:[.4,1,1]));
    const B=range(3,(t,i)=>P(hd,G.s((.045+i*.012)*s),bb,[0,0,0]));
    R.tick=(t,w,act)=>{const k=act*Math.abs(Math.sin(t*6))*.3;sq.scale.set(1+k*.5,1-k,1+k*.5);
      B.forEach((b,i)=>{const u=(t*.45+i/3)%1;b.position.set((.08+i*.05)*s+Math.sin(t*2+i)*.03*s,-.1*s+u*.45*s,(.1-i*.06)*s);b.scale.setScalar(Math.min(1,u*5)*(u>.9?(1-u)*10:1))})}})});

A('keine','Keine Arme','none',(g,c)=>{});

/* ===================== WIRED: Candy-Mech-Arme ===================== */
const WC={bondi:'#2fb5d9',grape:'#9b6ae0',tangerine:'#ff9a45',lime:'#7fd34a',strawberry:'#ff6fa5',lemon:'#ffd23f'};const wcandy=(m,col,op)=>m.c(col,{opacity:op??.55,gloss:1.3,rim:1.3,rimColor:'#ffffff'});
A('gelarme','Gel-Arme','masch',(g,c)=>{const{s,m}=c;const ch=m.chrome();rig(g,c,{rz:.3},(q,sg)=>{P(q,G.s(.1*s),ch);P(q,G.ca(.085*s,.2*s),wcandy(m,sg>0?WC.bondi:WC.grape,.65),[0,-.16*s,0]);
  const el=grp(q,[0,-.32*s,0],[-.25,0,0]);P(el,G.s(.08*s),ch);P(el,G.ca(.075*s,.16*s),wcandy(m,sg>0?WC.grape:WC.bondi,.65),[0,-.14*s,0]);const hd=grp(el,[0,-.3*s,0]);P(hd,G.s(.11*s),m.gloss(WC.lemon),[0,0,0],null,[1,.85,1]);P(hd,G.s(.05*s),m.gloss(WC.lemon),[.09*s,.03*s,.02*s])})});
A('federarme','Spiralfeder-Arme','masch',(g,c)=>{const{s,m}=c;const ch=m.chrome();rig(g,c,{rz:.35,walk:.7},(q,sg,R)=>{P(q,G.s(.1*s),m.gloss(WC.tangerine));const coil=[];for(let k=0;k<=60;k++){const a=k/60*TAU*7;coil.push([Math.cos(a)*.06*s,-k/60*.48*s,Math.sin(a)*.06*s])}
  const sp=P(q,G.tu(coil,.016*s,.016*s,Q(120)),ch);const hd=grp(q,[0,-.54*s,0]);P(hd,G.s(.1*s),m.gloss(WC.strawberry));P(hd,G.to(.07*s,.02*s),ch,[0,.06*s,0],[PI/2,0,0]);R.tick=(t,w)=>{const k=1+Math.sin(t*(w?8:2))*.06;sp.scale.y=k;hd.position.y=-.54*s*k}})});
A('kabelarme','Kabel-Arme mit Steckern','masch',(g,c)=>{const{s,m}=c;rig(g,c,{rz:.28,walk:.6},(q,sg)=>{const col=sg>0?WC.lime:WC.strawberry;const pts=[[0,0,0],[.04*s,-.18*s,.04*s],[-.02*s,-.36*s,0],[.02*s,-.52*s,.03*s]];P(q,G.tu(pts,.04*s,.04*s,24),m.gloss(col));P(q,G.s(.06*s),m.chrome());
  const pl=grp(q,[.02*s,-.56*s,.03*s]);P(pl,G.bx(.12*s,.12*s,.08*s,.03*s),m.c('#fffdf7'),[0,-.04*s,0]);both(x=>P(pl,G.bx(.018*s,.07*s,.018*s),m.chrome(),[x*.03*s,-.13*s,0]))})});

})();
