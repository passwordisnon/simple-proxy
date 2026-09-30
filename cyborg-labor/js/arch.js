/* =====================================================================
   CYBORG-LABOR · arch.js
   Architektur-Generator: jeder Planet hat seine eigene Bausprache mit sechs
   Grundformen (nicht nur andere Farben!). Rezepte haben Parameter (Grösse,
   Stockwerke, Anbauten, Dachneigung, Farben), damit auch Wiederholungen
   verschieden aussehen. Front zeigt nach +z, Boden y=0.
   Jedes Rezept liefert {g, door:[x,z], r, top}; Schilder und Deko stehen
   frei davor bzw. daneben, damit nichts ineinander steckt.
   ===================================================================== */
const ARCH=(()=>{
  const {B,C,S,Wd,wallMat,roofMat,winAt,doorAt,signBoard,finish,signTex,decal,awning,crate,flagOn,scallop,shellRibs,starfish,archShape,rtex,houseWin,houseDoor,glassM}=window.FU;
  const {shade,crysGeo,spiralShell,flatLeaf,leafShape}=NH;const V=THREE.Vector3;
  const pk=(r,a)=>a[Math.floor(r()*a.length)%a.length],RR=(r,a,b)=>a+(b-a)*r();
  /* ---------- eigene Texturen ---------- */
  const T={
    thatch:()=>ctex('ar-thatch',128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let j=0;j<6;j++){for(let i=0;i<40;i++){const px=i*3.3+(j%2)*1.6,py=j*22;x.strokeStyle=`rgba(140,95,40,${.15+((i*7)%5)*.05})`;x.lineWidth=1.4;x.beginPath();x.moveTo(px,py);x.lineTo(px+1,py+24);x.stroke()}x.fillStyle='rgba(120,80,30,.25)';x.fillRect(0,j*22+19,w,3)}}),
    iglu:()=>ctex('ar-iglu',128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='rgba(120,150,200,.45)';x.lineWidth=2.5;for(let j=0;j<5;j++){x.beginPath();x.moveTo(0,j*26+2);x.lineTo(w,j*26+2);x.stroke();for(let i=0;i<4;i++){const px=i*32+(j%2)*16;x.beginPath();x.moveTo(px,j*26+2);x.lineTo(px,j*26+28);x.stroke()}}}),
    adobe:()=>ctex('ar-adobe',128,128,(x,w,h)=>{const r=srand(4);x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let i=0;i<40;i++){x.fillStyle=`rgba(${r()<.5?'190,150,110':'255,245,230'},.35)`;x.beginPath();x.ellipse(r()*w,r()*h,6+r()*14,4+r()*8,r()*3,0,TAU);x.fill()}x.strokeStyle='rgba(150,100,60,.25)';for(let i=0;i<5;i++){x.beginPath();const sx=r()*w,sy=r()*h;x.moveTo(sx,sy);x.lineTo(sx+r()*20-10,sy+r()*20);x.stroke()}}),
    rib:()=>ctex('ar-rib',128,128,(x,w,h)=>{for(let i=0;i<16;i++){const g=x.createLinearGradient(i*8,0,i*8+8,0);g.addColorStop(0,'#fff');g.addColorStop(.5,'#d8d8d8');g.addColorStop(1,'#fff');x.fillStyle=g;x.fillRect(i*8,0,8,h)}x.fillStyle='rgba(180,90,40,.25)';x.beginPath();x.arc(90,100,12,0,TAU);x.fill();x.beginPath();x.arc(30,20,7,0,TAU);x.fill()}),
    bark:()=>ctex('ar-bark',128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='rgba(90,60,40,.35)';x.lineWidth=3;for(let i=0;i<14;i++){x.beginPath();let px=i*9+3;x.moveTo(px,0);for(let y=0;y<=h;y+=16){px+=Math.sin(y*.1+i)*3;x.lineTo(px,y)}x.stroke()}}),
    felt:()=>ctex('ar-felt',128,64,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='rgba(200,80,90,.55)';for(let i=0;i<8;i++){x.beginPath();x.moveTo(i*16,40);x.lineTo(i*16+8,28);x.lineTo(i*16+16,40);x.lineTo(i*16+8,52);x.fill()}x.fillStyle='rgba(60,70,140,.5)';x.fillRect(0,20,w,4);x.fillRect(0,56,w,4)}),
    stripe:(a,b)=>ctex('ar-str-'+a+b,64,64,(x,w,h)=>{for(let i=0;i<4;i++){x.fillStyle=i%2?b:a;x.fillRect(0,i*16,w,16)}}),
    stone:()=>ctex('ar-stone',128,128,(x,w,h)=>{x.fillStyle='#d9d2cc';x.fillRect(0,0,w,h);const r=srand(9);for(let i=0;i<22;i++){const px=r()*w,py=r()*h,rw=14+r()*18,rh=10+r()*10;x.fillStyle=['#fff','#f0ece8','#e6e0da'][i%3];x.beginPath();x.ellipse(px,py,rw,rh,r(),0,TAU);x.fill();x.strokeStyle='rgba(120,110,100,.3)';x.stroke()}})};
  const tm=(m,key,tex,col,rx,ry)=>m.tex('ar-'+key+col+rx+ry,rtex(tex,rx||1,ry||rx||1),{color:col});
  /* ---------- Bausteine ---------- */
  function gable(g,m,W,D,y,pitch,mat,ow){ow=ow??.3;const w=W+ow*2,hR=w/2*pitch;const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,hR);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:D+ow*2,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:2});geo.translate(0,0,-(D+ow*2)/2);P(g,geo,mat,[0,y,0]);return hR}
  function gambrel(g,m,W,D,y,mat){const w=W+.5;const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w*.36,w*.32);s.lineTo(0,w*.48);s.lineTo(-w*.36,w*.32);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:D+.5,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:2});geo.translate(0,0,-(D+.5)/2);P(g,geo,mat,[0,y,0]);return w*.48}
  function gableEnd(g,m,W,H,z,y,mat){/* Giebeldreieck als Wand */const s=new THREE.Shape();s.moveTo(-W/2,0);s.lineTo(W/2,0);s.lineTo(0,H);s.closePath();P(g,new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:false}),mat,[0,y,z-.04])}
  function cone(g,m,r,h,y,mat,seg){P(g,G.co(r,h,seg||24),mat,[0,y+h/2,0]);return h}
  function winOn(g,m,type,trim,x,y,z,ry){winAt(g,m,type,[x,y,z],ry||0,trim)}
  function roundWin(g,m,x,y,z,ry,r,trim){const q=grp(g,[x,y,z],[0,ry||0,0]);P(q,G.to(r,.07),m.c(trim||'#FFFBF0'),[0,0,.03]);P(q,G.cy(r*.92,r*.92,.05),glassM(m),[0,0,0],[PI/2,0,0]);P(q,G.s(r*.25),m.flat('#ffffff'),[-r*.35,r*.35,.05],null,[1,1,.3]).userData.noOutline=true;return q}
  function roundDoor(g,m,col,x,z,ry,r){const q=grp(g,[x,0,z],[0,ry||0,0]);P(q,G.cy(r,r,.14),m.c(col,{gloss:.4}),[0,r*.95,0],[PI/2,0,0]);P(q,G.to(r,.08),m.c('#8A5A44'),[0,r*.95,.07]);S(q,.07,m.gold(),[r*.4,r*.95,.1]);for(let i=0;i<4;i++)P(q,G.bx(.04,r*1.7,.02,0),m.c(shade(col,.8)),[(i-1.5)*r*.4,r*.95,.075]);return q}
  function door(g,m,col,x,z,ry){const d=houseDoor(m,col,'#FFFBF0');d.position.set(x,0,z);d.rotation.y=ry||0;g.add(d);return d}
  function chimney(g,m,x,y,z,h,col){B(g,.42,h,.42,.04,m.c(col||'#C8703E'),[x,y+h/2,z]);B(g,.52,.12,.52,.03,m.c('#8D89A6'),[x,y+h+.06,z])}
  function stairs(g,m,x,z,n,dir,mat){for(let i=0;i<n;i++)B(g,1,.18,.36,.03,mat,[x,.09+i*.2,z+dir*i*.34])}
  function flowerBox(g,m,x,y,z,ry){const q=grp(g,[x,y,z],[0,ry||0,0]);B(q,.8,.18,.2,.04,Wd(m,'#C98C5A'),[0,0,.1]);for(let i=0;i<4;i++)S(q,.08,m.c(['#FF8FB8','#FFE27A','#FFFBF0','#FF7E6B'][i]),[-.28+i*.19,.14,.12])}
  function lantern(g,m,x,z,h,col){C(g,.04,.05,h,m.c('#3B3450'),[x,h/2,z]);B(g,.22,.26,.22,.05,m.c('#3B3450'),[x,h+.1,z]);S(g,.08,m.glow(col||'#FFD27A',2),[x,h+.1,z])}
  function rails(g,m,pts,h,mat){for(let i=0;i<pts.length;i++){const[a,b]=[pts[i],pts[(i+1)%pts.length]];if(!b)continue;bt(g,[a[0],h,a[1]],[b[0],h,b[1]],.03,mat);C(g,.03,.03,h,mat,[a[0],h/2+a[2]||h/2,a[1]])}}
  /* =============== Rezepte je Planet =============== */
  const REC={
  /* ---------------- Kompost: Fachwerk, Hobbit-Hügel, Mühle, Scheune, Baumhaus, Winkelhaus ---------------- */
  kompost:{
    fachwerk(m,r,o){const g=new THREE.Group();const W=o.W||RR(r,4.2,5.2),D=RR(r,3.4,4),H=RR(r,2.4,2.8),fl=o.floors||(r()<.5?2:1);const wc=pk(r,['#FFF4DC','#FFE8D0','#F2F6E4','#FFF0F0']),beam=m.c(pk(r,['#6E4A3A','#5B3A2E','#7A5236']));
      B(g,W+.3,.3,D+.3,.06,m.c('#BDB6C8'),[0,.15,0]);let y=.3;for(let f=0;f<fl;f++){const ww=W+f*.3,hh=f?H*.85:H;B(g,ww,hh,D+f*.2,.06,tm(m,'ad',T.adobe(),wc,ww/1.5,hh/1.5),[0,y+hh/2,0]);
        const cols=Math.round(ww/1.1);for(let i=0;i<=cols;i++)B(g,.14,hh,.14,.02,beam,[-ww/2+i*ww/cols,y+hh/2,(D+f*.2)/2+.02]);for(const yy of[y+.05,y+hh-.05])B(g,ww+.1,.14,.14,.02,beam,[0,yy,(D+f*.2)/2+.03]);
        for(let i=0;i<cols;i++){if(f===0&&Math.abs(-ww/2+(i+.5)*ww/cols)<.7)continue;const x0=-ww/2+i*ww/cols,x1=x0+ww/cols;if(i%2)bt(g,[x0+.07,y+.1,(D+f*.2)/2+.03],[x1-.07,y+hh-.1,(D+f*.2)/2+.03],.05,beam);else winOn(g,m,'eckig','#FFFBF0',(x0+x1)/2,y+hh*.55,(D+f*.2)/2+.03)}
        for(const sd of[-1,1]){for(let i=0;i<3;i++)B(g,.14,hh,.14,.02,beam,[sd*(ww/2+.02),y+hh/2,-D/2+i*D/2])}y+=hh}
      const hR=gable(g,m,W+(fl-1)*.3,D+(fl-1)*.2,y,RR(r,.8,1.1),roofMat(m,pk(r,['#C8703E','#8E6BD1','#5FA652','#B8475F']),W/1.1,D/1.1));
      if(r()<.7){const dx=RR(r,-.6,.6)*W*.3;const dm=grp(g,[dx,y+hR*.28,D/2+.05]);B(dm,.9,.8,.9,.05,tm(m,'ad',T.adobe(),wc,1,1),[0,.4,-.2]);gable(dm,m,.9,1,.8,.9,roofMat(m,'#8D89A6',1,1),.12);roundWin(dm,m,0,.45,.26,0,.22)}
      chimney(g,m,-W*.28,y+hR*.3,-D*.2,hR*.9,'#C8703E');door(g,m,pk(r,['#7FB2E0','#F0556E','#5FA652','#FFD85A']),0,D/2+.03);return{g,door:[0,D/2+1],r:Math.max(W,D)*.62,top:y+hR}},
    hobbit(m,r,o){const g=new THREE.Group();const R=o.W?o.W*.62:RR(r,2.8,3.4);const grass=m.c('#7CC46A',{rim:.6,rimColor:'#eaffb0'});P(g,G.hs(R),grass,[0,0,-R*.25],null,[1,.62,1]);
      const fz=R*.72;P(g,G.cy(1.25,1.25,.3),m.c('#D9D2E3'),[0,1.05,fz-.1],[PI/2,0,0]);roundDoor(g,m,pk(r,['#5FA652','#FFD85A','#7FB2E0','#F0556E']),0,fz+.06,0,.72);
      for(const sd of[-1,1])roundWin(g,m,sd*1.6,.95,fz-.45,sd*.35,.34,'#8A5A44');chimney(g,m,R*.35,R*.45,-R*.4,.9,'#8D89A6');
      for(let i=0;i<9;i++){const a=RR(r,-2.6,2.6),rr=R*RR(r,.55,.9);S(g,.09,m.c(pk(r,['#FF8FB8','#FFE27A','#FFFBF0','#C6A9FF'])),[Math.sin(a)*rr,Math.sqrt(Math.max(0,1-(rr/R)**2))*R*.62+.02,-R*.25+Math.cos(a)*rr])}
      for(let i=0;i<4;i++)P(g,G.cy(.3,.34,.08),m.c('#BDB6C8'),[RR(r,-.2,.2),.04,fz+.9+i*.7]);lantern(g,m,1.3,fz+.6,1.3);return{g,door:[0,fz+1.2],r:R*1.05,top:R*.62}},
    muehle(m,r,o){const g=new THREE.Group();const H=RR(r,4.4,5.4);P(g,G.la([[0,0],[1.7,0],[1.5,H*.5],[1.25,H],[0,H]]),tm(m,'st',T.stone(),'#FFFFFF',3,3));const cap=pk(r,['#C8703E','#8E6BD1','#5FA652']);P(g,G.co(1.55,1.6,20),roofMat(m,cap,2,1),[0,H+.8,0]);
      const hub=grp(g,[0,H-.1,1.35]);S(hub,.22,m.c('#8A5A44'),[0,0,.1]);const sails=grp(hub,[0,0,.2]);for(let i=0;i<4;i++){const q=grp(sails,[0,0,0],[0,0,i*PI/2]);B(q,.12,2.6,.08,.02,Wd(m,'#C98C5A'),[0,1.35,0]);B(q,.7,2.1,.04,.02,m.c('#FFFBF0'),[.4,1.5,0])}
      door(g,m,'#8A5A44',0,1.62);for(let i=0;i<3;i++)roundWin(g,m,0,1.9+i*1.1,Math.max(1.3,1.62-i*.12)-.02,0,.22,'#8A5A44');
      const an=grp(g,[2.2,0,.2]);B(an,1.6,1.6,1.8,.06,wallMat(m,'holz','#FFE3B8',1.3,1.3),[0,.8,0]);gable(an,m,1.6,1.8,1.6,.7,roofMat(m,cap,1.5,1.5),.15);g.userData.tick=t=>sails.rotation.z=t*.6;return{g,door:[0,2.6],r:2.9,top:H+1.6}},
    scheune(m,r,o){const g=new THREE.Group();const W=o.W||RR(r,4.6,5.6),D=RR(r,3.6,4.2),H=RR(r,2.4,2.9);const col=pk(r,['#C84A4A','#B8475F','#6AA8F0','#E0876A']);
      B(g,W,H,D,.06,wallMat(m,'holz',col,W/1.2,H/1.2),[0,H/2,0]);gableEnd(g,m,W,W*.48,D/2,H,wallMat(m,'holz',col,W/1.2,1));gambrel(g,m,W,D,H,roofMat(m,'#6E7A9C',W,D));
      const dw=2.2;for(const sd of[-1,1]){const q=grp(g,[sd*dw/4,1.1,D/2+.05]);B(q,dw/2-.05,2.1,.08,.02,m.c('#FFFBF0'),[0,0,0]);bt(q,[-dw/4+.1,-1,0.06],[dw/4-.1,1,.06],.05,m.c('#FFFBF0'));bt(q,[dw/4-.1,-1,.06],[-dw/4+.1,1,.06],.05,m.c('#FFFBF0'))}
      B(g,dw+.2,.14,.14,.02,m.c('#FFFBF0'),[0,2.2,D/2+.08]);B(g,.9,.8,.1,.04,m.c('#FFFBF0'),[0,H+W*.2,D/2+.03]);B(g,.7,.6,.12,.03,m.c('#5B3A2E'),[0,H+W*.2,D/2+.05]);
      for(let i=0;i<3;i++)P(g,G.cy(.4,.4,.7),m.c('#F2D98A'),[W/2+.6,.35+i*.02,-.8+i*.8],[0,0,PI/2]);B(g,.4,.05,1.2,.02,Wd(m,'#C98C5A'),[-W/2-.4,.9,0],[0,0,.3]);return{g,door:[0,D/2+1.1],r:Math.max(W,D)*.62,top:H+W*.48}},
    baumhaus(m,r,o){const g=new THREE.Group();const y0=RR(r,2.2,2.8);P(g,G.la([[0,0],[1.2,0],[.75,.35],[.6,y0],[.9,y0+.3],[0,y0+.35]]),tm(m,'bk',T.bark(),'#8A6A4A',2,2));
      for(let i=0;i<5;i++){const a=i/5*TAU;P(g,G.tu([[Math.sin(a)*.5,.4,Math.cos(a)*.5],[Math.sin(a)*1.1,.1,Math.cos(a)*1.1],[Math.sin(a)*1.5,-.05,Math.cos(a)*1.5]],.18,.08),tm(m,'bk',T.bark(),'#8A6A4A',1,1))}
      P(g,G.cy(2.3,2.3,.2),Wd(m,'#C98C5A'),[0,y0+.1,0]);for(let i=0;i<14;i++){const a=i/14*TAU;if(Math.abs(Math.sin(a/2))<.12)continue;C(g,.04,.04,.7,Wd(m,'#8A5A44'),[Math.sin(a)*2.2,y0+.55,Math.cos(a)*2.2])}P(g,G.to(2.2,.05,TAU),Wd(m,'#8A5A44'),[0,y0+.9,0],[PI/2,0,0]);
      const hs=grp(g,[0,y0+.2,-.4]);B(hs,2.4,1.8,2,.06,wallMat(m,'holz',pk(r,['#FFE3B8','#E8F2D8','#FFD8D0']),2,1.5),[0,.9,0]);gable(hs,m,2.4,2,1.8,.9,roofMat(m,pk(r,['#5FA652','#C8703E','#8E6BD1']),2,2),.2);door(hs,m,'#FFD85A',0,1.02);roundWin(hs,m,1.21,1.1,0,PI/2,.25);
      /* Leiter */for(let i=0;i<9;i++)B(g,.7,.06,.08,.02,Wd(m,'#8A5A44'),[1.4,.25+i*y0/9,1.5],[0,-.6,0]);for(const sd of[-.3,.3])bt(g,[1.4+sd*.8,0,1.5+sd*.55],[1.4+sd*.8,y0+.1,1.5+sd*.55],.04,Wd(m,'#8A5A44'));
      for(let i=0;i<5;i++){const a=i*1.3;S(g,.8+r()*.4,m.c(pk(r,['#6DAE55','#7CC46A','#5FA652']),{rim:.6}),[Math.sin(a)*1.6,y0+3.2+r()*.6,-.6+Math.cos(a)*1.4])}return{g,door:[1.6,2.4],r:2.6,top:y0+4}},
    winkel(m,r,o){const g=new THREE.Group();const W=o.W||RR(r,4.4,5),D=3.2,H=2.5;const wc=pk(r,['#FFE3B8','#D9D2E3','#E8F2D8']),rc=pk(r,['#C8703E','#6AA8F0','#B8475F']);
      B(g,W,H,D,.08,wallMat(m,'stein',wc,W/1.3,H/1.3),[0,H/2,0]);gable(g,m,W,D,H,.75,roofMat(m,rc,W,D));const wg=grp(g,[-W/2+1.2,0,-D/2-1.2]);B(wg,2.4,H,2.4,.08,wallMat(m,'stein',wc,2,2),[0,H/2,0]);const q=grp(wg,[0,0,0],[0,PI/2,0]);gable(q,m,2.4,2.4,H,.75,roofMat(m,rc,2,2));
      const tw=grp(g,[W/2-.2,0,D/2-.2]);C(tw,.85,.9,H+1.4,wallMat(m,'stein',wc,2,2),[0,(H+1.4)/2,0]);P(tw,G.co(1.1,1.6,20),roofMat(m,rc,2,1),[0,H+1.4+.8,0]);roundWin(tw,m,0,H+.6,.86,0,.22);
      door(g,m,'#F0556E',-.6,D/2+.03);winOn(g,m,'eckig','#FFFBF0',-1.9,1.5,D/2+.03);flowerBox(g,m,-1.9,.85,D/2+.05);return{g,door:[-.6,D/2+1.1],r:Math.max(W,D)*.7,top:H+3}}},
  /* ---------------- Schrott: Container, Wasserturm, Wellblech-Halle, Kranhaus, Robo-Kuppel, Rohrfabrik ---------------- */
  schrott:{
    container(m,r,o){const g=new THREE.Group();const n=o.floors||(r()<.5?2:3);const cols=['#F0556E','#56C6B6','#F7B84B','#6AA8F0','#8E6BD1'];let y=0;const L=4.4,Wc=2.2,Hc=2.1;
      for(let i=0;i<n;i++){const q=grp(g,[i%2?.6:-.3,y,i%2?-.3:0],[0,i%2?PI/2*.0+ (i===2?.3:0):0,0]);B(q,L,Hc,Wc,.05,tm(m,'rib',T.rib(),pk(r,cols),L/.9,1),[0,Hc/2,0]);for(const sd of[-1,1])B(q,.12,Hc,Wc+.04,.02,m.c('#3B3450'),[sd*L/2,Hc/2,0]);roundWin(q,m,-1,Hc*.55,Wc/2+.02,0,.26,'#AEB9C8');if(i){roundWin(q,m,1,Hc*.55,Wc/2+.02,0,.26,'#AEB9C8')}y+=Hc}
      door(g,m,'#AEB9C8',.9,1.12);for(let i=0;i<Math.round((n-1)*Hc/.3);i++)B(g,.8,.06,.3,.02,m.steel(),[L/2+.3,.2+i*.3,1-i*.12]);bt(g,[0,y,0],[0,y+1.2,0],.03,m.steel());S(g,.08,m.glow('#F0556E',2),[0,y+1.22,0]);return{g,door:[.9,2.2],r:2.8,top:y+1.3}},
    wasserturm(m,r,o){const g=new THREE.Group();const h=RR(r,2.6,3.2);const tc=pk(r,['#AEB9C8','#56C6B6','#F7B84B']);for(const x of[-1,1])for(const z of[-1,1]){bt(g,[x*1.2,0,z*1.2],[x*.9,h,z*.9],.08,m.steel())}bt(g,[-1.2,.8,-1.2],[1.2,.8,1.2],.04,m.steel());bt(g,[1.2,.8,-1.2],[-1.2,.8,1.2],.04,m.steel());
      P(g,G.cy(1.5,1.5,1.8),tm(m,'rib',T.rib(),tc,3,1),[0,h+.9,0]);P(g,G.hs(1.5),m.c(shade(tc,.85)),[0,h+1.8,0],null,[1,.5,1]);for(let i=0;i<3;i++)P(g,G.to(1.52,.04),m.steel(),[0,h+.2+i*.7,0],[PI/2,0,0]);
      for(let i=0;i<10;i++)B(g,.5,.04,.05,.01,m.steel(),[1.35,.3+i*(h/10),.6],[0,PI/2,0]);const bh=grp(g,[0,0,0]);B(bh,1.6,1.9,1.4,.06,wallMat(m,'blech',pk(r,['#C8C0E8','#E8C8B8']),1.3,1.5),[0,.95,0]);door(bh,m,'#F7B84B',0,.72);return{g,door:[0,1.8],r:2.2,top:h+2.6}},
    halle(m,r,o){const g=new THREE.Group();const R=o.W?o.W*.4:RR(r,1.8,2.2),L=RR(r,4.2,5);const col=pk(r,['#B4CBE0','#C8C0E8','#A8D8D0']);const geo=new THREE.CylinderGeometry(R,R,L,20,1,true,PI/2,PI);const qm=tm(m,'rib',T.rib(),col,4,1);qm.side=THREE.DoubleSide;P(g,geo,qm,[0,0,0],[PI/2,0,0]);
      const fw=new THREE.CircleGeometry(R,20,0,PI);P(g,fw,m.c(shade(col,.9)),[0,0,L/2]);P(g,fw,m.c(shade(col,.9)),[0,0,-L/2],[0,PI,0]);door(g,m,'#F0556E',0,L/2+.02);roundWin(g,m,0,R*.75,L/2+.03,0,.3,'#AEB9C8');
      for(const sd of[-1,1])for(let i=0;i<3;i++){const z=-L/2+.8+i*(L-1.6)/2;B(g,.2,.5,.6,.03,m.steel(),[sd*R*.72,R*.72,z],[0,0,-sd*.8])}C(g,.15,.15,1.3,m.steel(),[R*.5,R+.4,-L/3]);return{g,door:[0,L/2+1],r:Math.max(R,L/2)+.3,top:R+1.1}},
    kran(m,r,o){const g=new THREE.Group();const W=RR(r,3.6,4.4),D=3.2,H=RR(r,2.6,3);B(g,W,H,D,.06,wallMat(m,'blech',pk(r,['#E8C8B8','#B4CBE0','#C8C0E8']),W,H),[0,H/2,0]);B(g,W+.2,.2,D+.2,.04,m.c('#8D89A6'),[0,H+.1,0]);
      const cx=-W/2+.4,cz=-D/2+.4,ch=H+2.6;const ym=m.c('#F7B84B',{gloss:.4});for(const[dx,dz]of[[0,0],[.5,0],[0,.5],[.5,.5]])C(g,.04,.04,ch,ym,[cx+dx,ch/2,cz+dz]);for(let i=0;i<8;i++){bt(g,[cx,i*ch/8,cz],[cx+.5,(i+1)*ch/8,cz],.025,ym);bt(g,[cx,i*ch/8,cz+.5],[cx+.5,(i+1)*ch/8,cz+.5],.025,ym)}
      const arm=grp(g,[cx+.25,ch,cz+.25],[0,-.7,0]);B(arm,.3,.3,4.2,.03,ym,[0,0,1.6]);B(arm,.6,.6,.8,.05,m.c('#3B3450'),[0,0,-.6]);bt(arm,[0,0,3.4],[0,-1.4,3.4],.015,m.steel());P(arm,G.to(.12,.03,PI),m.steel(),[0,-1.5,3.4],[0,0,PI]);g.userData.tick=t=>arm.rotation.y=-.7+Math.sin(t*.2)*.4;
      door(g,m,'#56C6B6',.6,D/2+.02);winOn(g,m,'bullauge','#FFFBF0',-1,1.6,D/2+.03);return{g,door:[.6,D/2+1.1],r:Math.max(W,D)*.62,top:ch}},
    robokuppel(m,r,o){const g=new THREE.Group();const R=RR(r,2,2.5);const col=pk(r,['#AEB9C8','#C8C0E8','#A8D8D0']);C(g,R,R+.1,1.2,tm(m,'rib',T.rib(),shade(col,.9),4,1),[0,.6,0]);P(g,G.hs(R),m.c(col,{gloss:.8}),[0,1.2,0]);
      for(let i=0;i<3;i++){const y=1.2+Math.sin((i+1)/4*PI/2)*R;const rr=Math.cos((i+1)/4*PI/2)*R;for(let j=0;j<16;j++){const a=j/16*TAU;S(g,.05,m.steel(),[Math.sin(a)*rr,y,Math.cos(a)*rr])}}
      const hd=grp(g,[0,0,R+.02]);P(hd,G.cy(.75,.75,.12),m.steel(),[0,.85,0],[PI/2,0,0]);P(hd,G.cy(.62,.62,.1),m.c('#F7B84B'),[0,.85,.05],[PI/2,0,0]);S(hd,.08,m.c('#3B3450'),[.35,.85,.12]);
      for(const a of[.6,-.9])roundWin(g,m,Math.sin(a)*R*.98,1.8,Math.cos(a)*R*.98,a,.28,'#AEB9C8');bt(g,[.5,1.2+R*.9,0],[.8,1.2+R*1.5,0],.03,m.steel());S(g,.1,m.glow('#7FDCE6',2),[.8,1.2+R*1.52,0]);const pe=grp(g,[-.6,1.2+R*.85,0]);C(pe,.1,.1,.9,m.steel(),[0,.45,0]);B(pe,.15,.15,.4,.03,m.steel(),[0,.9,.15]);return{g,door:[0,R+1.1],r:R+.3,top:R+1.9}},
    rohrfabrik(m,r,o){const g=new THREE.Group();const W=RR(r,4.4,5.2),D=3.4,H=RR(r,2.4,2.8);B(g,W,H,D,.06,wallMat(m,'blech',pk(r,['#B4CBE0','#E8C8B8','#A8D8D0']),W,H),[0,H/2,0]);
      const saw=grp(g,[0,H,0]);for(let i=0;i<3;i++){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(W/3,0);s.lineTo(W/3,.9);s.closePath();P(saw,new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:false}),m.c('#8D89A6'),[-W/2+i*W/3,0,-D/2]);B(saw,.05,.8,D-.2,.01,glassM(m),[-W/2+(i+1)*W/3-.04,.42,0])}
      const st=m.tex('ar-chs',rtex(T.stripe('#FFFBF0','#F0556E'),1,3),{color:'#ffffff'});for(const[x,h]of[[W/2-.7,H+2.8],[W/2-1.6,H+2]]){C(g,.3,.36,h,st,[x,h/2,-D/2+.5]);}P(g,G.tu([[-W/2,1.2,D/2+.3],[-W/2-.6,1.2,D/2+.3],[-W/2-.6,2.8,0],[-W/2+.3,H+.4,0]],.12),m.copper());
      door(g,m,'#F7B84B',-.8,D/2+.02);winOn(g,m,'bullauge','#FFFBF0',1,1.5,D/2+.03);return{g,door:[-.8,D/2+1.1],r:Math.max(W,D)*.62,top:H+2.8}}},
  /* ---------------- Korallen: Stelzenhütte, Muschelhaus, Leuchtturm, Bootshaus, Korallenturm, Pavillon ---------------- */
  korallen:{
    stelzen(m,r,o){const g=new THREE.Group();const y0=RR(r,1,1.4),R=RR(r,1.8,2.2);const wd=Wd(m,'#C98C5A');for(let i=0;i<6;i++){const a=i/6*TAU;C(g,.1,.12,y0,wd,[Math.sin(a)*R*.9,y0/2,Math.cos(a)*R*.9])}P(g,G.cy(R+.5,R+.5,.15),wd,[0,y0,0]);
      C(g,R,R,1.9,wallMat(m,'holz',pk(r,['#BFF0EC','#FFE3C8','#FFD2DA']),3,1.5),[0,y0+1.05,0]);P(g,G.co(R+.7,1.9,24),tm(m,'th',T.thatch(),'#E8C088',3,2),[0,y0+2+.95,0]);S(g,.14,m.pearl(),[0,y0+3.95,0]);
      door(g,m,'#56C6B6',0,R-.02+0.02);g.children[g.children.length-1].position.y=y0+.08;for(const a of[1.2,-1.2])roundWin(g,m,Math.sin(a)*R,y0+1.2,Math.cos(a)*R,a,.28);
      for(let i=0;i<5;i++)B(g,1,.12,.36,.03,wd,[0,y0-.1-i*y0/5,R+.7+i*.32]);P(g,G.to(R+.45,.03),m.c('#D9B27C'),[0,y0+.6,0],[PI/2,0,0]);for(let i=0;i<12;i++){const a=i/12*TAU;if(Math.abs(a-0)<.3||Math.abs(a-TAU)<.3)continue;C(g,.03,.03,.6,wd,[Math.sin(a)*(R+.45),y0+.3,Math.cos(a)*(R+.45)])}
      starfish(g,m,[R*.7,y0+1.7,R*.72],.18,PAL.coral,[0,.8,.4]);return{g,door:[0,R+2.4],r:R+.6,top:y0+4}},
    muschel(m,r,o){const g=new THREE.Group();const s=RR(r,4.2,5);const col=pk(r,['#FFD2DA','#FFE3C8','#E8D8FF']);const shg=grp(g,[0,0,0]);shg.scale.setScalar(2.1);spiralShell(shg,m,col,s*.9,[0,s*.33*.9,-.4],[-PI/2+.15,0,0]);
      const fr=grp(g,[0,0,s*.3]);P(fr,G.puff(archShape(1.6,2.2,.8),.3,.08),m.c(shade(col,.85)),[0,0,0]);door(fr,m,'#56C6B6',0,.18);for(const sd of[-1,1])roundWin(g,m,sd*1.4,1.6,s*.2,sd*.5,.3,'#FFFBF0');for(let i=0;i<5;i++)P(g,G.cy(.3,.35,.08),m.c('#F2D9A6'),[RR(r,-.2,.2),.04,s*.3+.8+i*.65]);
      starfish(g,m,[1.1,.2,s*.3+.6],.22,PAL.orange,[-PI/2,0,.3]);return{g,door:[0,s*.3+1],r:s*.55,top:s*.66}},
    leuchtturm(m,r,o){const g=new THREE.Group();const H=RR(r,5.5,6.5);const st=m.tex('ar-lt',rtex(T.stripe('#FFFFFF','#F0556E'),1,4),{color:'#ffffff'});P(g,G.la([[0,0],[1.3,0],[1.05,H],[0,H]]),st);B(g,2.3,.2,2.3,.06,m.c('#3B3450'),[0,H+.1,0]);
      P(g,G.cy(.8,.8,1,true),m.glass('#fff4c0'),[0,H+.7,0]);S(g,.4,m.glow('#FFE27A',2),[0,H+.7,0]);P(g,G.co(.95,.8,16),m.c('#F0556E',{gloss:.6}),[0,H+1.6,0]);S(g,.12,m.c('#3B3450'),[0,H+2.05,0]);for(let i=0;i<10;i++){const a=i/10*TAU;C(g,.03,.03,.5,m.c('#3B3450'),[Math.sin(a)*1.1,H+.45,Math.cos(a)*1.1])}
      door(g,m,'#3B3450',0,1.28);for(let i=0;i<2;i++)roundWin(g,m,0,2.3+i*1.5,1.24-i*.1,0,.2);const kh=grp(g,[1.9,0,.4]);B(kh,1.8,1.7,1.8,.06,wallMat(m,'holz','#FFFBF0',1.5,1.5),[0,.85,0]);gable(kh,m,1.8,1.8,1.7,.6,roofMat(m,'#6AA8F0',1.5,1.5),.15);return{g,door:[0,2.4],r:2.9,top:H+2.2}},
    bootshaus(m,r,o){const g=new THREE.Group();const W=RR(r,4,4.8),D=3,H=2;B(g,W,H,D,.06,wallMat(m,'holz',pk(r,['#BFF0EC','#FFF1C8','#FFD2DA']),W,H),[0,H/2,0]);
      const bc=pk(r,['#F0556E','#6AA8F0','#F7B84B']);P(g,G.hs(1),m.c(bc,{gloss:.5}),[0,H,0],null,[W/2+.35,1.1,D/2+.3]);P(g,G.to(1,.06),m.c('#FFFBF0'),[0,H+.02,0],[PI/2,0,0],[W/2+.35,D/2+.3,1]);P(g,G.bx(W*.9,.14,.14,.05),m.c(shade(bc,.7)),[0,H+1.1,0]);
      door(g,m,'#6AA8F0',-.8,D/2+.02);roundWin(g,m,1,1.2,D/2+.03,0,.3);P(g,G.to(.35,.1),m.gloss('#F0556E'),[1.8,1.3,D/2+.08]);for(const sd of[-1,1])bt(g,[W/2+.3,0,sd*.6],[W/2+.9,1.6,sd*.9],.05,Wd(m,'#C98C5A'));B(g,.3,.05,1.2,.02,Wd(m,'#C98C5A'),[W/2+.6,1.6,0]);
      return{g,door:[-.8,D/2+1.1],r:Math.max(W,D)*.62,top:H+1.4}},
    korallenturm(m,r,o){const g=new THREE.Group();const cols=['#FFB8A8','#FF8E7A','#FFD2DA','#C6A9FF','#BFF0EC'];let y=0;const R0=RR(r,1.8,2.1);for(let i=0;i<3;i++){const rr=R0*(1-i*.22);const c=pk(r,cols);P(g,G.s(rr),m.c(c,{rim:.8}),[i*.15,y+rr*.8,0],null,[1,.85,1]);if(i>0)roundWin(g,m,i*.15,y+rr*.8,rr*.95,0,.25);y+=rr*1.45}
      for(let i=0;i<6;i++){const a=i*1.05;P(g,G.tu([[Math.sin(a)*.5,y-.2,Math.cos(a)*.5],[Math.sin(a)*1,y+.6,Math.cos(a)*1],[Math.sin(a)*1.2,y+1.3,Math.cos(a)*1.1]],.12,.05),m.c('#FF8E7A',{rim:.8}));S(g,.1,m.c('#FFD2DA'),[Math.sin(a)*1.2,y+1.33,Math.cos(a)*1.1])}
      door(g,m,'#56C6B6',0,R0*.92);return{g,door:[0,R0+1],r:R0+.2,top:y+1.4}},
    pavillon(m,r,o){const g=new THREE.Group();const R=RR(r,2.3,2.7);C(g,R+.3,R+.4,.3,m.c('#F2D9A6'),[0,.15,0]);C(g,R-.2,R-.2,2.2,wallMat(m,'lehm',pk(r,['#FFE3C8','#BFF0EC']),3,1.5),[0,1.4,-.3]);
      for(let i=0;i<8;i++){const a=i/8*TAU;if(Math.cos(a)>.9)continue;C(g,.14,.16,2.5,m.c('#FFFBF0'),[Math.sin(a)*R,1.55,Math.cos(a)*R])}C(g,R+.25,R+.25,.2,m.c('#FFFBF0'),[0,2.9,0]);const dc=pk(r,['#4FD6E0','#FF8E7A','#FFB27A']);P(g,G.hs(R+.2),m.c(dc,{gloss:.6}),[0,3,0],null,[1,.6,1]);
      for(let i=0;i<12;i++){const a=i/12*TAU;S(g,.14,m.pearl(),[Math.sin(a)*(R+.25),2.95,Math.cos(a)*(R+.25)])}door(g,m,'#56C6B6',0,R-.55);return{g,door:[0,R+1],r:R+.4,top:3+(R+.2)*.6}}},
  /* ---------------- Frost: Iglu, Iglu-Dorf, Blockhaus, Eispalast, Jurte, Observatorium ---------------- */
  frost:{
    iglu(m,r,o){const g=new THREE.Group();const R=RR(r,2,2.5);const im=tm(m,'ig',T.iglu(),'#F4F8FF',3,2);P(g,G.hs(R),im,[0,0,0]);const tn=new THREE.CylinderGeometry(.7,.7,1.2,16,1,true,PI/2,PI);tn.rotateX(PI/2);const tt=grp(g,[0,0,R-.1]);const tmat=im.clone();tmat.side=THREE.DoubleSide;P(tt,tn,tmat,[0,0,.6]);
      P(tt,new THREE.CircleGeometry(.62,16,0,PI),m.c('#3B4A6A'),[0,0,1.2]);roundWin(g,m,R*.7,R*.55,R*.45,1.0,.28,'#DDEBFF');S(g,.25,m.c('#FFFFFF',{rim:.9}),[R*.5,R*.85,-R*.2],[1.4,.5,1]);lantern(g,m,1.3,R+1.2,1.2);return{g,door:[0,R+1.8],r:R+.5,top:R}},
    igludorf(m,r,o){const g=new THREE.Group();const im=tm(m,'ig',T.iglu(),'#F4F8FF',3,2);const Rs=[RR(r,1.8,2.1),RR(r,1.2,1.5),RR(r,1,1.2)];const ps=[[0,0],[-2.3,-.8],[2,-1.2]];Rs.forEach((R,i)=>{P(g,G.hs(R),im,[ps[i][0],0,ps[i][1]]);if(i)roundWin(g,m,ps[i][0],R*.5,ps[i][1]+R*.85,0,.22,'#DDEBFF')});
      for(let i=1;i<3;i++){const a=new V(ps[0][0],0,ps[0][1]),b=new V(ps[i][0],0,ps[i][1]);const mid=a.clone().lerp(b,.5);const len=a.distanceTo(b);const tn=grp(g,[mid.x,0,mid.z],[0,Math.atan2(b.x-a.x,b.z-a.z),0]);P(tn,new THREE.CylinderGeometry(.6,.6,len,12,1,true,PI/2,PI),im,[0,0,0],[PI/2,0,0])}
      const tt=grp(g,[0,0,Rs[0]-.1]);const tn=new THREE.CylinderGeometry(.65,.65,1.1,16,1,true,PI/2,PI);tn.rotateX(PI/2);P(tt,tn,im,[0,0,.5]);P(tt,new THREE.CircleGeometry(.58,16,0,PI),m.c('#3B4A6A'),[0,0,1.05]);lantern(g,m,-1.4,Rs[0]+.8,1.2,'#7FDCE6');return{g,door:[0,Rs[0]+1.6],r:3.3,top:Rs[0]}},
    blockhaus(m,r,o){const g=new THREE.Group();const W=RR(r,4,4.8),D=RR(r,3.2,3.8),H=2.3;const lm=Wd(m,pk(r,['#A07A5A','#8A6A4A','#B8875A']));const nL=Math.round(H/.3);
      for(let i=0;i<nL;i++){const y=.15+i*.3;C(g,.16,.16,W+.5,lm,[0,y,D/2],[0,0,PI/2]);C(g,.16,.16,W+.5,lm,[0,y,-D/2],[0,0,PI/2]);C(g,.16,.16,D+.5,lm,[W/2,y+.15,0],[PI/2,0,0]);C(g,.16,.16,D+.5,lm,[-W/2,y+.15,0],[PI/2,0,0])}B(g,W-.1,H,D-.1,.02,lm,[0,H/2,0]);
      const hR=gable(g,m,W,D,H,1.05,roofMat(m,pk(r,['#6AA8F0','#B8475F','#5FA652']),W,D));const sm=m.c('#FFFFFF',{rim:.9});for(const sd of[-1,1]){const q=grp(g,[sd*(W/2+.3)/2,H+hR/2+.08,0],[0,0,-sd*Math.atan2(hR,(W+.6)/2)]);B(q,Math.hypot((W+.6)/2,hR)*.9,.1,D+.5,.05,sm,[0,0,0])}
      chimney(g,m,W*.25,H+hR*.4,-D*.2,hR*.9,'#8D89A6');door(g,m,'#F0556E',-.7,D/2+.18);winOn(g,m,'eckig','#FFFBF0',1.1,1.3,D/2+.2);B(g,W+.8,.12,1.3,.04,lm,[0,.06,D/2+.7]);for(const x of[-W/2-.2,W/2+.2])C(g,.08,.08,2.2,lm,[x,1.1,D/2+1.2]);gable(grp(g,[0,2.2,D/2+.9]),m,W+.8,.7,0,.2,lm,0);
      for(let i=0;i<Math.round(W*2);i++)P(g,G.co(.05,.2+(i%3)*.08,5),m.c('#CFEFFF',{gloss:1.2}),[-W/2+i*.5,H-.05,D/2+.35],[PI,0,0]);return{g,door:[-.7,D/2+1.8],r:Math.max(W,D)*.65,top:H+hR}},
    eispalast(m,r,o){const g=new THREE.Group();const W=RR(r,3.4,4),D=3;B(g,W,2.6,D,.3,m.c('#DDEBFF',{gloss:1.2,rim:1}),[0,1.3,0]);const cm=m.crystal('#BFE6FF');
      for(let i=0;i<7;i++){const x=(i-3)*W/7,z=(i%2?-1:1)*(D/2-.3),h=RR(r,1.5,3.2);P(g,crysGeo(.35,h),cm,[x,2.5,z*.6])}P(g,crysGeo(.6,4.2),cm,[0,2.4,0]);
      P(g,G.puff(archShape(1.3,2,.6),.2,.06),m.c('#FFFFFF',{rim:1}),[0,0,D/2+.02]);door(g,m,'#8FD0F0',0,D/2+.14);for(const sd of[-1,1])roundWin(g,m,sd*1.2,1.5,D/2+.02,0,.3,'#FFFFFF');return{g,door:[0,D/2+1.1],r:Math.max(W,D)*.62,top:6.5}},
    jurte(m,r,o){const g=new THREE.Group();const R=RR(r,2,2.5);C(g,R,R,1.6,tm(m,'fe',T.felt(),pk(r,['#FFF4DC','#F4E0E8','#E4ECFA']),4,1),[0,.8,0]);P(g,G.co(R+.3,1.4,28),m.c(pk(r,['#F0556E','#6AA8F0','#8E6BD1']),{rim:.5}),[0,1.6+.7,0]);
      P(g,G.to(.35,.08),m.c('#C98C5A'),[0,3.05,0],[PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*TAU;bt(g,[Math.sin(a)*(R+.3),1.6,Math.cos(a)*(R+.3)],[Math.sin(a)*.4,3,Math.cos(a)*.4],.03,Wd(m,'#C98C5A'))}P(g,G.to(R+.01,.05),m.c('#C98C5A'),[0,.4,0],[PI/2,0,0]);P(g,G.to(R+.01,.05),m.c('#C98C5A'),[0,1.5,0],[PI/2,0,0]);
      door(g,m,'#F7B84B',0,R-.05);C(g,.06,.06,.8,m.steel(),[R*.5,3,-.3]);return{g,door:[0,R+1],r:R+.4,top:3.1}},
    observatorium(m,r,o){const g=new THREE.Group();const R=RR(r,1.8,2.2);C(g,R,R+.1,2.4,wallMat(m,'stein','#E4ECFA',3,2),[0,1.2,0]);P(g,G.hs(R+.05),m.c('#AEB9C8',{gloss:.9}),[0,2.4,0]);B(g,.7,R*.9,R*2.1,.05,m.c('#3B3450'),[0,2.4+R*.45,0],[0,0,-.2]);
      const tl=grp(g,[0,2.4+R*.5,0],[0,0,-.7]);C(tl,.2,.26,2,m.c('#F7F3E8',{gloss:.6}),[0,.9,0]);P(tl,G.to(.22,.05),m.gold(),[0,1.9,0],[PI/2,0,0]);door(g,m,'#6AA8F0',0,R+.03);roundWin(g,m,R*.8,1.4,R*.6,.9,.24);
      const an=grp(g,[R+1.1,0,.2]);B(an,1.6,1.8,1.8,.06,wallMat(m,'stein','#F4F8FF',1.3,1.3),[0,.9,0]);gable(an,m,1.6,1.8,1.8,.8,roofMat(m,'#8E6BD1',1.5,1.5),.15);return{g,door:[0,R+1.1],r:R+1.4,top:2.4+R+1.5}}},
  /* ---------------- Wüste: Terrassenhaus, Zwiebelkuppel, Windturm, Zelt, Felsenhaus, Karawanserei ---------------- */
  wueste:{
    terrassen(m,r,o){const g=new THREE.Group();const n=o.floors||(r()<.5?2:3);const col=pk(r,['#F2D1A8','#EBB78A','#F7E0BC']);let y=0,W=RR(r,4.4,5),D=3.6,dx=0;const am=tm(m,'ad',T.adobe(),col,2,2);
      for(let i=0;i<n;i++){const w=W*(1-i*.25),d=D*(1-i*.2),h=2;const x=dx;B(g,w,h,d,.12,am,[x,y+h/2,-i*.4]);for(let k=0;k<Math.round(w/.8);k++)C(g,.07,.07,.4,Wd(m,'#8A5A44'),[x-w/2+.4+k*.8,y+h-.3,-i*.4+d/2+.15],[PI/2,0,0]);
        if(i){for(let s=0;s<6;s++)B(g,.12,.06,.06,0,Wd(m,'#8A5A44'),[x+w/2+.25,y-h+.3+s*.3,-i*.4+d/2-.2]);for(const sd of[-.2,.2])bt(g,[x+w/2+.25+sd,y-h,-i*.4+d/2-.2],[x+w/2+.25+sd,y+.3,-i*.4+d/2-.2],.03,Wd(m,'#8A5A44'))}
        roundWin(g,m,x-w*.25,y+1.2,-i*.4+d/2+.02,0,.22,'#D46A4C');y+=h;dx+=RR(r,-.5,.5)}
      door(g,m,'#56C6B6',.8,D/2+.02);awning(g,m,1.6,.7,2.1,D/2+.02,'#F0556E','#FFF1DC',6);C(g,.3,.25,.6,m.c(PAL.terracotta),[-W/2-.4,.3,D/2]);return{g,door:[.8,D/2+1.1],r:Math.max(W,D)*.62,top:y}},
    zwiebel(m,r,o){const g=new THREE.Group();const W=RR(r,3.6,4.2),D=3.4,H=2.6;const col=pk(r,['#F7E0BC','#FFF1DC','#F4C8A0']);B(g,W,H,D,.1,tm(m,'ad',T.adobe(),col,2,2),[0,H/2,0]);
      const dc=pk(r,['#56C6B6','#F0556E','#F7B84B','#8E6BD1']);C(g,1.2,1.2,.5,m.c(col),[0,H+.25,0]);P(g,G.la([[0,0],[1.1,0],[1.4,.6],[1.2,1.3],[.5,2],[.1,2.5],[0,2.6]]),m.c(dc,{gloss:.6}),[0,H+.5,0]);S(g,.12,m.gold(),[0,H+3.15,0]);
      for(let i=-1;i<=1;i++){P(g,G.puff(archShape(.8,1.6,.4),.1,.04),m.c('#8A5A44'),[i*1.1,0,D/2+.02])}door(g,m,'#56C6B6',0,D/2+.08);
      const mn=grp(g,[W/2+.6,0,-D/2+.6]);C(mn,.4,.45,4.2,tm(m,'ad',T.adobe(),col,1,2),[0,2.1,0]);C(mn,.55,.55,.2,m.c(col),[0,3.6,0]);P(mn,G.la([[0,0],[.4,0],[.5,.3],[.2,.8],[0,.9]]),m.c(dc,{gloss:.6}),[0,4.2,0]);return{g,door:[0,D/2+1.1],r:Math.max(W,D)*.65,top:H+3.2}},
    windturm(m,r,o){const g=new THREE.Group();const W=RR(r,3.8,4.4),D=3.4,H=2.4;const col=pk(r,['#F2D1A8','#EBB78A']);const am=tm(m,'ad',T.adobe(),col,2,2);B(g,W,H,D,.12,am,[0,H/2,0]);B(g,W+.2,.2,D+.2,.05,m.c(shade(col,.85)),[0,H+.1,0]);
      const tw=grp(g,[-W/2+.8,H,-D/2+.8]);B(tw,1.4,3.2,1.4,.1,am,[0,1.6,0]);for(const ry of[0,PI/2,PI,-PI/2]){const q=grp(tw,[0,2.6,0],[0,ry,0]);for(let i=0;i<4;i++)B(q,.9,.08,.1,.02,Wd(m,'#8A5A44'),[0,-.4+i*.25,.71])}B(tw,1.6,.2,1.6,.05,m.c(shade(col,.85)),[0,3.3,0]);
      door(g,m,'#F7B84B',.9,D/2+.02);roundWin(g,m,-.6,1.4,D/2+.03,0,.25,'#D46A4C');awning(g,m,1.4,.6,2.1,D/2+.02,'#56C6B6','#FFF1DC',6);return{g,door:[.9,D/2+1.1],r:Math.max(W,D)*.62,top:H+3.4}},
    zelt(m,r,o){const g=new THREE.Group();const W=RR(r,4.6,5.4),D=RR(r,3.6,4.2),H=2.4;const a=pk(r,['#F0556E','#56C6B6','#8E6BD1']),b='#E8B870';const geo=new THREE.BufferGeometry();
      const pts=[[-W/2,0,D/2],[W/2,0,D/2],[W/2,0,-D/2],[-W/2,0,-D/2],[-W*.3,H,0],[W*.3,H,0],[0,H*.72,D/2+.1],[0,H*.72,-D/2-.1]];const idx=[0,6,4, 6,1,5, 6,5,4, 1,2,5, 2,7,5, 7,3,4, 7,4,5, 3,0,4];const pos=[],uv=[];for(const i of idx){pos.push(...pts[i]);uv.push((pts[i][0]/W+.5)*3,pts[i][1]/H)}
      geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();const tmt=m.tex('ar-tent'+a,rtex(T.stripe(a,b),3,1),{color:'#ffffff'});const tmm=tmt.clone();tmm.side=THREE.DoubleSide;P(g,geo,tmm,[0,0,0]);
      for(const x of[-W*.3,W*.3])C(g,.06,.06,H+.3,Wd(m,'#8A5A44'),[x,(H+.3)/2,0]);for(const[x,z]of[[-W/2-.6,D/2+.4],[W/2+.6,D/2+.4],[-W/2-.6,-D/2-.4],[W/2+.6,-D/2-.4]])bt(g,[x,0,z],[Math.sign(x)*W*.3,H,0],.015,m.c('#D9B27C'));
      const em=m.c(shade(a,.7));for(const[i,j]of[[0,4],[1,5],[2,5],[3,4],[4,5],[0,6],[6,1],[2,7],[7,3],[4,6],[6,5]])bt(g,pts[i],pts[j],.045,em);B(g,1.6,.03,1.2,.01,m.c('#B8475F'),[0,.02,D/2+.9]);for(let i=0;i<3;i++)P(g,G.s(.3),m.c(pk(r,['#F0556E','#F7B84B','#8E6BD1'])),[-.8+i*.8,.18,D/2-.4],null,[1,.5,1]);return{g,door:[0,D/2+1.3],r:Math.max(W,D)*.65,top:H+.3}},
    felsen(m,r,o){const g=new THREE.Group();const R=RR(r,2.6,3.1);P(g,G.blob(R,.18,1.6,r()*9),m.c(pk(r,['#E09A6C','#D98A5E','#EBAA7C']),{rim:.4}),[0,R*.55,-.4],null,[1.2,.9,1]);
      const fr=grp(g,[0,0,R*.72]);P(fr,G.puff(archShape(1.5,2.2,.7),.4,.1),m.c('#C8724E'),[0,0,0]);door(fr,m,'#56C6B6',0,.25);for(const sd of[-1,1])roundWin(g,m,sd*1.5,1.9,R*.62,sd*.45,.28,'#C8724E');
      S(g,.5,m.c('#6CB84A',{rim:.6}),[R*.6,R*1.2,-.2],[1,.6,1]);C(g,.2,.2,.8,m.c(PAL.terracotta),[-R*.4,R*1.25,.3]);return{g,door:[0,R*.72+1.1],r:R*1.15,top:R*1.3}},
    karawanserei(m,r,o){const g=new THREE.Group();const S2=RR(r,4.6,5.4);const col=pk(r,['#F2D1A8','#F7E0BC']);const am=tm(m,'ad',T.adobe(),col,3,1);const h=2;for(const[x,z,w,d]of[[0,-S2/2,S2,.5],[-S2/2,0,.5,S2],[S2/2,0,.5,S2],[-S2*.32,S2/2,S2*.36,.5],[S2*.32,S2/2,S2*.36,.5]])B(g,w,h,d,.06,am,[x,h/2,z]);
      P(g,G.puff(archShape(1.7,2.6,.8),.6,.1),am,[0,0,S2/2-.3]);for(let i=0;i<12;i++){const a=i/12;for(const sd of[-1,1]){B(g,.3,.3,.3,.04,am,[sd*S2/2,h+.15,-S2/2+a*S2])}}
      const in_=grp(g,[0,0,-.4]);C(in_,.15,.22,2.6,Wd(m,'#B8875A'),[0,1.3,0]);for(let i=0;i<6;i++){const q=grp(in_,[0,2.6,0],[0,i,0]);P(q,flatLeaf(leafShape(1.4,.25),.03,.5),m.c('#5FB36A',{rim:.5}),[0,0,0],[0,0,-.3])}B(g,S2*.6,.9,1.4,.06,am,[0,.45,-S2/2+.9]);door(g,m,'#F0556E',0,-S2/2+1.62);
      return{g,door:[0,S2/2+.8],r:S2*.72,top:3}}},
  /* ---------------- Pilz: Pilzhaus, Doppelpilz, Baumstumpf, Glockenblume, Wurzelhöhle, Sporenturm ---------------- */
  pilz:{
    pilzhaus(m,r,o){const g=new THREE.Group();const R=RR(r,1.5,1.9),H=RR(r,2.2,2.8);P(g,G.la([[0,0],[R*1.1,0],[R,H*.4],[R*.92,H],[0,H]]),tm(m,'ad',T.adobe(),pk(r,['#FFF1DA','#F6EEDC','#FFE8F0']),3,2));const cc=pk(r,['#E8505B','#8E6BD1','#F7B84B','#FF8FB8']);
      P(g,G.hs(R*2),m.c(cc,{gloss:.7,rim:.5}),[0,H-.1,0],null,[1,.62,1]);P(g,G.cy(R*1.95,R*1.95,.1),m.c('#FFF1DA'),[0,H-.1,0]);for(let i=0;i<10;i++){const th=.3+((i*.37)%1)*.9,ph=i*2.4;const n=new V(Math.sin(th)*Math.cos(ph),Math.cos(th)*.62,Math.sin(th)*Math.sin(ph)).normalize();const d=P(g,G.s(R*.26),m.c('#FFFBF0'),[Math.sin(th)*Math.cos(ph)*R*2,H-.1+Math.cos(th)*R*1.24,Math.sin(th)*Math.sin(ph)*R*2],null,[1,.3,1]);d.quaternion.setFromUnitVectors(new V(0,1,0),n);d.userData.noOutline=true}
      door(g,m,'#8E6BD1',0,R*1.02);for(const a of[.9,-.9])roundWin(g,m,Math.sin(a)*R*.97,1.6,Math.cos(a)*R*.97,a,.24);for(let i=0;i<4;i++)S(g,.06,m.glow('#7FFFD4',2),[Math.sin(i*1.6)*R*1.9,H-.25,Math.cos(i*1.6)*R*1.9]);return{g,door:[0,R+1],r:R*2,top:H+R*1.2}},
    doppelpilz(m,r,o){const g=new THREE.Group();const mk=(x,z,R,H,cc)=>{P(g,G.la([[0,0],[R*1.1,0],[R,H*.4],[R*.92,H],[0,H]]),m.c('#FFF1DA'),[x,0,z]);P(g,G.hs(R*1.8),m.c(cc,{gloss:.7}),[x,H-.1,z],null,[1,.6,1])};
      const cA=pk(r,['#E8505B','#8E6BD1']),cB=pk(r,['#F7B84B','#FF8FB8']);mk(-1.1,0,1.2,2.4,cA);mk(1.6,-.8,.9,3.6,cB);const br=grp(g,[.25,2.2,-.4]);for(let i=0;i<8;i++)B(br,.3,.06,.5,.01,Wd(m,'#C98C5A'),[-.9+i*.26,Math.sin(i/7*PI)*-.15,0]);P(g,G.tu([[-1,2.4,-.2],[.25,2.2,-.2],[1.5,2.7,-.6]],.02),m.c('#D9B27C'));
      door(g,m,'#8E6BD1',-1.1,1.3);roundWin(g,m,1.6,2.6,.1,0,.2);return{g,door:[-1.1,2.3],r:3,top:3.6+1}},
    stumpf(m,r,o){const g=new THREE.Group();const R=RR(r,1.9,2.3),H=RR(r,2.6,3.2);const pts=[[0,0],[R*1.25,0],[R*1.05,.3],[R,H]];const geo=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),24);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y>H-.01){pos.setY(i,y+Math.sin(i*1.7)*.35)}}geo.computeVertexNormals();P(g,geo,tm(m,'bk',T.bark(),'#8A6A4A',3,2));
      P(g,G.cy(R*.98,R*.98,.1),m.c('#E8C08A'),[0,H-.1,0]);for(let i=0;i<4;i++)P(g,G.to(R*.25*(i+1),.02),m.c('#C99A66'),[0,H-.04,0],[PI/2,0,0]);for(let i=0;i<3;i++){const a=i*2+1;P(g,G.s(.5),m.c(pk(r,['#F7B84B','#FF8E7A','#FFF1DA']),{gloss:.5}),[Math.sin(a)*R,1+i*.6,Math.cos(a)*R],null,[1,.25,.8])}
      door(g,m,'#5FA652',0,R*1.03);roundWin(g,m,R*.7,1.8,R*.72,.8,.25);S(g,.6,m.c('#6DAE55',{rim:.7}),[0,H+.1,0],[1.4,.4,1.4]);return{g,door:[0,R+1],r:R*1.3,top:H+.5}},
    glocke(m,r,o){const g=new THREE.Group();const H=RR(r,4,4.8);const st=m.c('#5FA652',{rim:.5});P(g,G.tu([[-1.8,0,-.4],[-1.8,2.5,-.4],[-1.2,H,-.3],[0,H+.3,-.2],[.4,H,0]],.2,.14),st);P(g,flatLeaf(leafShape(1.4,.5),.05,.4),st,[-1.8,1.2,-.4],[0,-.5,0]);
      P(g,G.la([[0,0],[2,0],[2.1,.3],[1.6,1],[1.35,2.2],[1.1,3],[0,3.2]]),m.c(pk(r,['#C6A9FF','#8FD3FF','#FF8FB8']),{rim:.7}),[.4,H-3.2,0]);
      /* innen ein kleiner Raum auf dem Boden */C(g,1.6,1.7,2,m.c('#FFF1DA'),[.4,1,0]);door(g,m,'#8E6BD1',.4,1.62);for(let i=0;i<6;i++){const a=i/6*TAU;S(g,.07,m.glow('#FFE27A',2),[.4+Math.sin(a)*2.05,H-3.1,Math.cos(a)*2.05])}return{g,door:[.4,2.6],r:2.6,top:H+.4}},
    wurzel(m,r,o){const g=new THREE.Group();const R=RR(r,2.6,3.1);P(g,G.hs(R),m.c('#6DAE55',{rim:.7}),[0,0,-.3],null,[1,.7,1]);const rm=tm(m,'bk',T.bark(),'#7A5A44',1,1);for(let i=0;i<7;i++){const a=-1.3+i*.43;P(g,G.tu([[Math.sin(a)*R*.9,-.1,-.3+Math.cos(a)*R*.9],[Math.sin(a)*R*.7,R*.6,-.3+Math.cos(a)*R*.6],[0,R*.72,-.3]],.2,.1),rm)}
      const fr=grp(g,[0,0,R*.62]);P(fr,G.puff(archShape(1.4,1.9,.7),.25,.08),rm,[0,0,0]);door(fr,m,'#C6A9FF',0,.15);for(let i=0;i<5;i++)S(g,.08,m.glow('#7FFFD4',2),[RR(r,-2,2),RR(r,.8,1.8),R*.4+RR(r,0,.4)]);return{g,door:[0,R*.62+1],r:R*1.1,top:R*.8}},
    sporenturm(m,r,o){const g=new THREE.Group();let y=0;const cols=['#E8505B','#8E6BD1','#F7B84B','#FF8FB8','#56C6B6'];for(let i=0;i<3;i++){const R=1.5-i*.35,H=1.5-i*.2;P(g,G.cy(R*.7,R*.8,H),m.c('#FFF1DA'),[0,y+H/2,0]);P(g,G.hs(R*1.5),m.c(pk(r,cols),{gloss:.7}),[0,y+H-.05,0],null,[1,.45,1]);if(i)roundWin(g,m,0,y+H*.5,R*.72,0,.2);y+=H+R*.4}
      for(let i=0;i<14;i++){const a=i*.9,yy=.3+i*.26;B(g,.6,.08,.3,.02,Wd(m,'#C98C5A'),[Math.sin(a)*1.6,yy,Math.cos(a)*1.6],[0,a,0])}door(g,m,'#56C6B6',0,1.2);return{g,door:[0,2.4],r:2.4,top:y}}}};
  /* Zuordnung Stadtgebäude → Rezept (jede Stadt anders) */
  const TOWNMAP={kompost:{museum:['winkel',{W:5}],shop:['fachwerk',{W:5,floors:1}],bar:['scheune',{W:5.4}],studio:['muehle',{}],rathaus:['fachwerk',{W:5.2,floors:2}],garage:['scheune',{W:5}],pflanzen:['baumhaus',{}],tiere:['hobbit',{W:5}]},
    schrott:{museum:['robokuppel',{}],shop:['container',{floors:2}],bar:['halle',{W:5}],studio:['wasserturm',{}],rathaus:['kran',{}],garage:['rohrfabrik',{}],pflanzen:['halle',{W:4.4}],tiere:['container',{floors:3}]},
    korallen:{museum:['muschel',{}],shop:['bootshaus',{}],bar:['pavillon',{}],studio:['stelzen',{}],rathaus:['leuchtturm',{}],garage:['bootshaus',{}],pflanzen:['korallenturm',{}],tiere:['stelzen',{}]},
    frost:{museum:['eispalast',{}],shop:['igludorf',{}],bar:['blockhaus',{}],studio:['jurte',{}],rathaus:['observatorium',{}],garage:['blockhaus',{}],pflanzen:['iglu',{}],tiere:['jurte',{}]},
    wueste:{museum:['karawanserei',{}],shop:['zelt',{}],bar:['zwiebel',{}],studio:['felsen',{}],rathaus:['windturm',{}],garage:['terrassen',{floors:2}],pflanzen:['zelt',{}],tiere:['terrassen',{floors:3}]},
    pilz:{museum:['stumpf',{}],shop:['pilzhaus',{}],bar:['wurzel',{}],studio:['glocke',{}],rathaus:['sporenturm',{}],garage:['doppelpilz',{}],pflanzen:['glocke',{}],tiere:['pilzhaus',{}]}};
  function make(pid,recipe,seed,o){const set=PT(REC,pid);const f=set[recipe]||Object.values(set)[0];const r=srand(seed);let res;try{res=f(makeMatsCached(),r,o||{})}catch(e){console.warn('Arch',pid,recipe,e);const g=new THREE.Group();P(g,G.bx(3,2.4,3,.3),makeMatsCached().c('#FFE3B8'),[0,1.2,0]);res={g,door:[0,2.4],r:2.4,top:2.4}}return res}
  let MM=null;const makeMatsCached=()=>MM||(MM=makeMats({skin:'haut',color:0}));
  function recipes(pid){return Object.keys(PT(REC,pid))}
  function forTown(pid,kind){const e=PT(TOWNMAP,pid)[kind];if(!e)return null;return make(pid,e[0],hashNum(pid+kind),e[1])}
  function forHouse(pid,seed){const list=recipes(pid);const r=srand(seed);const rec=list[Math.floor(r()*list.length)];return Object.assign(make(pid,rec,seed+7,{}),{recipe:rec})}
  const hashNum=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)%1000003};
  return{make,forTown,forHouse,recipes,REC,TOWNMAP,hashNum,lantern,stairs}
})();
