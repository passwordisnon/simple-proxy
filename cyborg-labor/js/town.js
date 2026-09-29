/* =====================================================================
   CYBORG-LABOR · town.js
   Dorfzentren: ein Gebäude-Baukasten mit sechs Planeten-Stilen und acht
   Gebäudearten (Museum, Laden, Atelier, Jazz-Bar, Rathaus, Raketen-Garage,
   Gärtnerei, Tierhandlung). Alle Teile sitzen auf Flächen auf (Sockel →
   Wand → Dach) statt ineinander zu stecken. Einheiten: Welt (Figur ≈ 1.7).
   ===================================================================== */
const TOWN=(()=>{
  const {B,C,S,Wd,wallMat,roofMat,winAt,doorAt,signBoard,finish,signTex,decal,awning,crate,flagOn,scallop,shellRibs,starfish,archShape,tu,rtex}=window.FU;const {shade}=NH;
  const NAMES={
    kompost:{museum:'Nationalmuseum',shop:'Kompost-Kiosk',studio:'Farbstudio',bar:'Jazz-Keller',rathaus:'Rathaus',garage:'Raketen-Garage',pflanzen:'Gärtnerei Grünfink',tiere:'Tierstube Pfötchen'},
    schrott:{museum:'Schrott-Museum',shop:'Ersatzteil-Basar',studio:'Rost-Atelier',bar:'Blech-Blues-Bar',rathaus:'Rathaus',garage:'Turbo-Garage',pflanzen:'Kabel-Kakteen',tiere:'Robo-Tierheim'},
    korallen:{museum:'Korallen-Museum',shop:'Muschel-Laden',studio:'Riff-Atelier',bar:'Wellen-Jazz-Bar',rathaus:'Rathaus',garage:'Hafen-Garage',pflanzen:'Seetang-Gärtnerei',tiere:'Aquarium-Zoohandlung'},
    frost:{museum:'Eis-Museum',shop:'Iglu-Laden',studio:'Frost-Atelier',bar:'Polarlicht-Bar',rathaus:'Rathaus',garage:'Schlitten-Garage',pflanzen:'Wintergarten',tiere:'Pinguin-Pension'},
    wueste:{museum:'Wüsten-Museum',shop:'Oasen-Basar',studio:'Sand-Atelier',bar:'Oasen-Jazz',rathaus:'Rathaus',garage:'Karawanen-Garage',pflanzen:'Kaktus-Stube',tiere:'Karawanen-Tierhof'},
    pilz:{museum:'Sporen-Museum',shop:'Sporen-Stübchen',studio:'Pilz-Atelier',bar:'Glühwürmchen-Bar',rathaus:'Rathaus',garage:'Pilz-Garage',pflanzen:'Myzel-Gärtnerei',tiere:'Moos-Tierstube'}};
  /* ---------- Planeten-Stile ---------- */
  const STY={
    kompost:{wall:'holz',walls:['#FFE3B8','#F7D0A0','#E8F2D8','#FFD8D0'],roof:'gable',roofs:['#E0876A','#8E6BD1','#5FA652','#F0556E'],trim:'#FFF4DC',plinth:'#BDB6C8',door:'#8A5A44',win:'eckig',pitch:.7},
    schrott:{wall:'blech',walls:['#B4CBE0','#C8C0E8','#A8D8D0','#E8C8B8'],roof:'flat',roofs:['#8D89A6','#6E7A9C'],trim:'#F7B84B',plinth:'#8D89A6',door:'#56C6B6',win:'bullauge'},
    korallen:{wall:'lehm',walls:['#FFE3C8','#BFF0EC','#FFD2DA','#FFF1C8'],roof:'shell',roofs:['#FF8E7A','#4FD6E0','#FFB27A','#C6A9FF'],trim:'#FFFBF0',plinth:'#F2D9A6',door:'#56C6B6',win:'rund'},
    frost:{wall:'stein',walls:['#F4F8FF','#E4ECFA','#DDEBFF','#F0ECFF'],roof:'gable',roofs:['#6AA8F0','#8E6BD1','#56C6B6','#F0556E'],trim:'#FFFFFF',plinth:'#A9BCE0',door:'#F0556E',win:'rund',pitch:.9,snow:true},
    wueste:{wall:'lehm',walls:['#F2D1A8','#EBB78A','#F7E0BC','#F4C8A0'],roof:'flat',roofs:['#D46A4C','#C98C5A'],trim:'#FFF1DC',plinth:'#D9B27C',door:'#56C6B6',win:'rund',dome:true,parapet:'zinnen'},
    pilz:{wall:'moos',walls:['#F6EEDC','#DCC8F0','#C8F0D8','#FFE0EC'],roof:'cap',roofs:['#E8505B','#8E6BD1','#FF8FB8','#F7B84B'],trim:'#FFFBF0',plinth:'#8C7A68',door:'#8E6BD1',win:'rund',glow:'#7FFFD4'}};
  /* ---------- Grundbausteine ---------- */
  function shell(g,m,st,W,D,H,wc){const y0=.26;B(g,W+.36,y0,D+.36,.07,m.c(st.plinth),[0,y0/2,0]);
    B(g,W,H,D,.1,wallMat(m,st.wall,wc,W/1.3,H/1.3),[0,y0+H/2,0]);
    const tm=m.c(st.trim);for(const x of[-1,1])for(const z of[-1,1])B(g,.2,H,.2,.06,tm,[x*(W/2-.02),y0+H/2,z*(D/2-.02)]);
    B(g,W+.12,.16,D+.12,.05,tm,[0,y0+H-.02,0]);return y0+H}
  function roofGable(g,m,st,W,D,y,col){const ow=.3,w=W+ow*2,hR=w/2*(st.pitch||.7);const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,hR);s.closePath();
    const geo=new THREE.ExtrudeGeometry(s,{depth:D+ow*2,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:2,curveSegments:1});geo.translate(0,0,-(D+ow*2)/2);
    P(g,geo,roofMat(m,col,w/1.1,(D+ow*2)/1.1),[0,y+.06,0]);C(g,.09,.09,D+ow*2+.1,m.c(shade(col,.75)),[0,y+.06+hR+.02,0],[PI/2,0,0]);
    if(st.snow){const sm=m.c('#FFFFFF',{rim:.9,rimColor:'#dff4ff'});for(const sd of[-1,1]){const q=grp(g,[sd*w/4,y+.06+hR/2+.07,0],[0,0,-sd*Math.atan2(hR,w/2)]);B(q,Math.hypot(w/2,hR)*.62,.07,D+ow*2-.1,.035,sm,[Math.hypot(w/2,hR)*.18*sd,0,0])}
      const ic=m.c('#CFEFFF',{gloss:1.2,rim:1});for(const sd of[-1,1])for(let i=0;i<Math.round(D*1.6);i++){const z=-D/2+(i+.5)*D/Math.round(D*1.6);P(g,G.co(.045,.22+((i*37)%5)*.05,5),ic,[sd*(w/2-.06),y-.06,z],[PI,0,0])}}
    return y+.06+hR}
  function roofFlat(g,m,st,W,D,y,col){B(g,W+.3,.18,D+.3,.05,m.c(col),[0,y+.09,0]);const pm=m.c(st.trim);const yt=y+.18;
    if(st.parapet==='zinnen'){const n=Math.round(W/.55);for(let i=0;i<n;i++){const x=-W/2+(i+.5)*W/n;if(i%2)continue;for(const z of[-1,1])B(g,W/n*.9,.3,.18,.04,pm,[x,yt+.15,z*(D/2+.06)])}const nz=Math.round(D/.55);for(let i=0;i<nz;i++){if(i%2)continue;const z=-D/2+(i+.5)*D/nz;for(const x of[-1,1])B(g,.18,.3,D/nz*.9,.04,pm,[x*(W/2+.06),yt+.15,z])}}
    else{for(const z of[-1,1])B(g,W+.3,.24,.12,.04,pm,[0,yt+.12,z*(D/2+.09)]);for(const x of[-1,1])B(g,.12,.24,D+.06,.04,pm,[x*(W/2+.09),yt+.12,0])}
    return yt}
  function roofDome(g,m,st,W,D,y,col){const r=Math.min(W,D)*.42;C(g,r*1.02,r*1.02,.2,m.c(st.trim),[0,y+.1,0]);P(g,G.hs(r),m.c(col,{gloss:.5,rim:.5}),[0,y+.2,0]);S(g,.12,m.gold(),[0,y+.2+r+.05,0]);return y+.2+r}
  function roofShell(g,m,st,W,D,y,col){const r=Math.max(W,D)*.56;const rs=grp(g,[0,y,0]);C(rs,Math.max(W,D)*.56,Math.max(W,D)*.56,.12,m.c(st.trim),[0,.06,0],null,[1,1,D/W]);
    P(rs,G.hs(r),m.c(col,{gloss:.6,rim:.5}),[0,.1,0],null,[1,.62,D/W]);const rib=m.c(shade(col,.82),{gloss:.6});for(let i=0;i<8;i++){const a=i/8*TAU;const q=grp(rs,[0,.1,0],[0,-a,0]);P(q,G.to(r*.99,.05,PI/2),rib,[0,0,0],[0,0,0],[1,.62,1]).rotation.set(0,0,0)}
    S(rs,.16,m.pearl(),[0,.1+r*.62+.06,0]);return y+.1+r*.62}
  function roofCap(g,m,st,W,D,y,col){const r=Math.max(W,D)*.6;C(g,Math.min(W,D)*.42,Math.min(W,D)*.5,.4,m.c('#FFF1DA'),[0,y+.2,0]);y+=.36;P(g,G.cy(r*.98,r*.98,.08),m.c('#FFF1DA'),[0,y+.04,0]);P(g,G.hs(r),m.c(col,{gloss:.7,rim:.5}),[0,y+.04,0],null,[1,.6,1]);
    const dm=m.c('#FFFBF0');for(let i=0;i<9;i++){const th=.35+((i*.37)%1)*.8,ph=i*2.4;const n=new V3(Math.sin(th)*Math.cos(ph),Math.cos(th)*.6,Math.sin(th)*Math.sin(ph)).normalize();
      const d=P(g,G.s(r*.12),dm,[Math.sin(th)*Math.cos(ph)*r*.99,y+.04+Math.cos(th)*r*.6*.99,Math.sin(th)*Math.sin(ph)*r*.99],null,[1,.35,1]);d.quaternion.setFromUnitVectors(new V3(0,1,0),n);d.userData.noOutline=true}
    if(st.glow)for(let i=0;i<5;i++){const a=i/5*TAU;S(g,.07,m.glow(st.glow,2),[Math.cos(a)*r*.96,y-.02,Math.sin(a)*r*.96])}return y+.04+r*.6}
  function roof(g,m,st,W,D,y,col){if(st.roof==='gable')return roofGable(g,m,st,W,D,y,col);if(st.roof==='flat'){const t=roofFlat(g,m,st,W,D,y,col);return st.dome?roofDome(g,m,st,W*.8,D*.8,t,'#56C6B6'):t}
    if(st.roof==='shell')return roofShell(g,m,st,W,D,y,col);if(st.roof==='cap')return roofCap(g,m,st,W,D,y,col);return y}
  /* Front-Elemente */
  const zf=(D)=>D/2;
  function door(g,m,st,x,D,col){doorAt(g,m,col||st.door,[x,.26,zf(D)+.02]);return[x,0,zf(D)+1.1]}
  function win(g,m,st,x,y,D,type){winAt(g,m,type||st.win,[x,y,zf(D)+.03],0,st.trim)}
  function sideWin(g,m,st,W,z,y,side,type){winAt(g,m,type||st.win,[side*(W/2+.03),y,z],side*PI/2,st.trim)}
  function sign(g,m,st,pid,key,text,W,D,y,o){o=o||{};const w=Math.min(W*.8,Math.max(2.2,text.length*.2));signBoard(g,m,'tw-'+pid+'-'+key,text,w,.62,[0,y,zf(D)+.12],Object.assign({board:m.c(st.trim),bg:o.bg||'#FFFBF0',fg:o.fg||'#5B4A3E',bd:o.bd||STY[pid].roofs[0],lit:o.lit,glow:o.glow},o))}
  /* Planeten-Deko an den Ecken (steht neben der Wand, nicht darin) */
  function planetDeco(g,m,st,pid,W,D,rnd){const at=(x,z,f)=>{const q=grp(g,[x,0,z]);f(q)};const L=W/2+.55,Z=D/2+.35;
    if(pid==='kompost'){at(-L,Z,q=>{C(q,.28,.24,.62,Wd(m,PAL.wood),[0,.31,0]);for(const y of[.12,.5])P(q,G.to(.27,.025),m.c(PAL.slate),[0,y,0],[PI/2,0,0])});at(L,Z-.1,q=>{C(q,.26,.2,.4,m.c(PAL.terracotta),[0,.2,0]);S(q,.3,m.c('#6DAE55',{rim:.6}),[0,.55,0],[1,.8,1]);for(let i=0;i<5;i++)S(q,.06,m.c(['#FF8FB8','#FFE27A','#FFFBF0'][i%3]),[Math.cos(i*1.3)*.22,.66+(i%2)*.08,Math.sin(i*1.3)*.22])});
      for(const sd of[-1,1]){const x=sd*(W/2+.04);tu(g,range(6,(t)=>[x,.3+t*2.2,-D/2+.4+Math.sin(t*6)*.25]),.035,m.c('#5E9B4A'));range(6,(t,i)=>S(g,.09,m.c('#7CC46A',{rim:.6}),[x+sd*.03,.5+t*1.9,-D/2+.4+Math.sin(t*6+.5)*.3],[1,.6,1.2]))}}
    else if(pid==='schrott'){at(-L,Z,q=>{for(let i=0;i<3;i++)P(q,G.to(.26,.11),m.rubber(),[0,.11+i*.22,0],[PI/2,0,0])});at(L,Z-.2,q=>{C(q,.26,.26,.8,m.c('#F0556E',{gloss:.6}),[0,.4,0]);for(const y of[.2,.6])P(q,G.to(.265,.02),m.steel(),[0,y,0],[PI/2,0,0]);C(q,.08,.08,.06,m.steel(),[.12,.83,.08])});
      for(const sd of[-1,1]){tu(g,[[sd*(W/2+.1),.4,-D/2+.3],[sd*(W/2+.1),1.6,-D/2+.3],[sd*(W/2+.1),1.9,-D/2+.8],[sd*(W/2+.1),1.9,D/2-.6]],.07,m.copper());S(g,.12,m.steel(),[sd*(W/2+.1),1.9,-D/2+.8])}}
    else if(pid==='korallen'){at(-L,Z,q=>{range(4,(t,i)=>{bt(q,[0,0,0],[Math.cos(i*1.6)*.3,.5+(i%2)*.3,Math.sin(i*1.6)*.3],.06,m.c('#FF8E7A',{rim:.7}),.04);S(q,.07,m.c('#FFB8A8'),[Math.cos(i*1.6)*.3,.5+(i%2)*.3,Math.sin(i*1.6)*.3])})});at(L,Z,q=>{S(q,.32,m.c('#E8D8C0'),[0,.2,0],[1.2,.6,1]);starfish(q,m,[0,.42,0],.18,PAL.orange,[-PI/2,0,.3])});
      starfish(g,m,[W/2-.6,1.9,zf(D)+.06],.2,PAL.coral,[0,0,.4]);const rp=m.c('#D9B27C');tu(g,[[-W/2,.9,zf(D)+.08],[-W/4,.75,zf(D)+.12],[0,.9,zf(D)+.08]],.03,rp)}
    else if(pid==='frost'){at(-L,Z,q=>{for(let i=0;i<3;i++)C(q,.13,.13,.8,Wd(m,'#A07A5A'),[0,.13+i*.24,(i-1)*.02],[0,0,PI/2]);S(q,.35,m.c('#FFFFFF',{rim:.9}),[0,.62,0],[1.3,.35,1])});at(L,Z,q=>{C(q,.04,.05,1.2,m.c(PAL.navy),[0,.6,0]);B(q,.26,.3,.26,.06,m.c(PAL.navy),[0,1.3,0]);S(q,.09,m.glow('#FFD27A',2),[0,1.3,0]);P(q,G.co(.2,.18,4),m.c(PAL.navy),[0,1.54,0],[0,PI/4,0])})}
    else if(pid==='wueste'){at(-L,Z,q=>{C(q,.22,.28,.55,m.c(PAL.terracotta),[0,.28,0]);C(q,.16,.22,.14,m.c(PAL.terracotta),[0,.62,0]);P(q,G.to(.17,.035),m.c('#B85A3A'),[0,.69,0],[PI/2,0,0])});at(L,Z,q=>{C(q,.2,.2,.3,m.c(PAL.terracotta),[0,.15,0]);const k=m.c('#6CB84A',{rim:.6});P(q,G.ca(.12,.4),k,[0,.55,0]);bt(q,[0,.5,0],[.18,.62,0],.07,k);P(q,G.ca(.07,.18),k,[.2,.75,0])});
      awning(g,m,W*.7,.8,2.4,zf(D)+.02,'#F0556E','#FFF1DC',8)}
    else if(pid==='pilz'){at(-L,Z,q=>{for(let i=0;i<3;i++){const s=.14+i*.06;const qq=grp(q,[(i-1)*.25,0,(i%2)*.15]);C(qq,s*.35,s*.45,s*2.2,m.c('#FFF1DA'),[0,s*1.1,0]);P(qq,G.hs(s*1.1),m.c(['#E8505B','#8E6BD1','#F7B84B'][i],{gloss:.7}),[0,s*2.2,0],null,[1,.7,1])}});at(L,Z,q=>{range(4,(t,i)=>{bt(q,[0,0,0],[Math.cos(i*1.6)*.2,.6+i*.1,Math.sin(i*1.6)*.2],.02,m.c('#6DAE55'));S(q,.07,m.glow('#7FFFD4',2),[Math.cos(i*1.6)*.2,.62+i*.1,Math.sin(i*1.6)*.2])})});
      for(const sd of[-1,1])tu(g,range(6,t=>[sd*(W/2+.04),.3+t*2,D/2-.3+Math.sin(t*7)*.2]),.03,m.c('#5E9B4A'))}}
  /* ---------- Gebäude ---------- */
  function base(pid,kind,m,dims){const st=STY[pid]||STY.kompost;const r=srand(parseInt(hashStr(pid+kind).slice(0,6),36));const wc=st.walls[Math.floor(r()*st.walls.length)],rc=st.roofs[Math.floor(r()*st.roofs.length)];
    const g=new THREE.Group();const[W,D,H]=dims;const top=shell(g,m,st,W,D,H,wc);return{g,st,r,wc,rc,W,D,H,top}}
  const B_={
    museum(pid,m){const b=base(pid,'museum',m,[6.8,4.6,3.3]);const{g,st,W,D,H,top}=b;const ry=roof(g,m,st,W,D,top,b.rc);const dp=door(g,m,st,0,D);
      /* Säulen-Vorhalle */const cm=pid==='korallen'?m.c('#FFB8A8',{rim:.7}):pid==='frost'?m.c('#DDEBFF',{gloss:1,rim:1}):m.c('#F4EEE4');const px=[-2.5,-1.3,1.3,2.5];
      B(g,W+.2,.2,1.3,.05,m.c(st.plinth),[0,.36,zf(D)+.65]);B(g,W+.3,.24,1.4,.06,m.c(st.trim),[0,top-.12,zf(D)+.7]);
      for(const x of px){if(pid==='korallen'){range(5,(t,i)=>S(g,.2-(i%2)*.04,cm,[x,.62+i*(top-.9)/4,zf(D)+1.05]))}else{C(g,.16,.18,top-.72,cm,[x,.46+(top-.72)/2,zf(D)+1.05]);B(g,.44,.12,.44,.03,cm,[x,.52,zf(D)+1.05]);B(g,.44,.12,.44,.03,cm,[x,top-.3,zf(D)+1.05])}}
      if(pid==='korallen'){const sh=grp(g,[0,top+.02,zf(D)+1.1]);P(sh,G.puff(scallop(1.3,9,.4),.2,.06),m.gloss('#FFD2DA'),[0,0,0]);shellRibs(sh,m.gloss('#FFB8C8'),1.3,9,.14,0,1)}
      else{const s=new THREE.Shape();s.moveTo(-W/2-.1,0);s.lineTo(W/2+.1,0);s.lineTo(0,.9);s.closePath();P(g,new THREE.ExtrudeGeometry(s,{depth:.3,bevelEnabled:false}),m.c(st.trim),[0,top,zf(D)+.9])}
      for(const x of[-2.3,2.3])win(g,m,st,x,1.7,D,pid==='schrott'?'bullauge':'rund');sideWin(g,m,st,W,0,1.8,1);sideWin(g,m,st,W,0,1.8,-1);
      sign(g,m,st,pid,'museum',NAMES[pid].museum,W,D+2.1,top-.55,{bd:'#B79A6E'});planetDeco(g,m,st,pid,W,D,b.r);return finish(g,[0,0,zf(D)+2.2],Math.max(W,D)*.62,'museum')},
    shop(pid,m){const b=base(pid,'shop',m,[5,3.8,2.8]);const{g,st,W,D,top}=b;roof(g,m,st,W,D,top,b.rc);const dp=door(g,m,st,1.2,D);
      B(g,2.2,1.3,.14,.08,m.c(st.trim),[-1,1.35,zf(D)+.05]);B(g,1.95,1.08,.05,.03,m.glass('#dff6ff'),[-1,1.35,zf(D)+.13]);
      for(let i=0;i<3;i++)B(g,.34,.3,.3,.06,m.gloss(['#FF8FB8','#FFE27A','#7FDCE6'][i]),[-1.6+i*.6,.98,zf(D)+.02]);
      if(pid!=='wueste')awning(g,m,2.6,.8,2.25,zf(D)+.02,STY[pid].roofs[0],'#FFFBF0',8);crate(g,m,[-1.7,.26,zf(D)+.7],'#F0556E',b.r);crate(g,m,[-.9,.26,zf(D)+.75],'#FFD35C',b.r);
      sideWin(g,m,st,W,0,1.6,1);sign(g,m,st,pid,'shop',NAMES[pid].shop,W,D,top-.45);planetDeco(g,m,st,pid,W,D,b.r);return finish(g,[1.2,0,zf(D)+1.2],Math.max(W,D)*.62,'shop')},
    studio(pid,m){const b=base(pid,'studio',m,[4.2,3.6,2.8]);const{g,st,W,D,top}=b;roof(g,m,st,W,D,top,b.rc);door(g,m,st,-.9,D,'#FF8FB8');win(g,m,st,1,1.6,D);sideWin(g,m,st,W,0,1.6,1);sideWin(g,m,st,W,0,1.6,-1);
      const e=grp(g,[1.2,0,zf(D)+1]);for(const x of[-1,1])bt(e,[x*.3,0,0],[x*.12,1.5,-.1],.03,Wd(m,PAL.wood));bt(e,[0,0,-.45],[0,1.4,-.1],.03,Wd(m,PAL.wood));B(e,.7,.55,.04,.02,m.c('#FFFBF0'),[0,1.05,-.02],[-.12,0,0]);
      for(let i=0;i<4;i++)S(e,.05,m.c(['#F0556E','#56C6B6','#FFE27A','#8E6BD1'][i]),[-.2+i*.13,1.08+(i%2)*.1,.02]);
      const pal=grp(g,[-W/2+.5,top-.5,zf(D)+.1]);P(pal,G.puff(sshp([[-.4,-.25],[.4,-.3],[.5,.1],[.1,.35],[-.45,.2]]),.08,.03),Wd(m,'#E8C08A'),[0,0,0]);for(let i=0;i<4;i++)S(pal,.07,m.gloss(['#F0556E','#56C6B6','#FFE27A','#8E6BD1'][i]),[-.25+i*.15,.05+(i%2)*.08,.08],[1,1,.5]);
      sign(g,m,st,pid,'studio',NAMES[pid].studio,W,D,top-.45,{bd:'#FF8FB8'});planetDeco(g,m,st,pid,W,D,b.r);return finish(g,[-.9,0,zf(D)+1.2],Math.max(W,D)*.62,'studio')},
    bar(pid,m){const b=base(pid,'bar',m,[5.4,4,3]);const{g,st,W,D,top}=b;roof(g,m,st,W,D,top,b.rc);door(g,m,st,0,D,'#3B3450');
      for(const x of[-1.7,1.7]){B(g,1.2,1.2,.12,.06,m.c('#3B3450'),[x,1.5,zf(D)+.04]);B(g,1,1,.04,.03,m.glow('#FFB45A',1.1),[x,1.5,zf(D)+.1])}
      /* Neon: Saxophon + Noten */const ng=grp(g,[0,top-.6,zf(D)+.14]);B(ng,2.8,.7,.1,.08,m.c('#3B3450'),[0,0,0]);decal(ng,m,signTex('bar-'+pid,NAMES[pid].bar,{bg:'#3B3450',fg:'#FFE27A',bd:'#FF6FB0',glow:'#FF6FB0',w:768,h:192}),'bar-'+pid,2.6,.6,[0,0,.06],null,true);
      const sx=grp(g,[W/2-.3,1.2,zf(D)+.12]);tu(sx,[[0,0,0],[0,.8,0],[.12,1,0],[.3,.95,0]],.05,m.glow('#FFD27A',2));P(sx,G.co(.16,.3,10),m.glow('#FFD27A',2),[0,-.1,0],[PI,0,0]);
      const tk=[];const notes=range(3,(t,i)=>{const n=grp(g,[-W/2+.4+i*.35,2,zf(D)+.15]);S(n,.07,m.glow('#7FDCE6',2),[0,0,0],[1.2,1,.4]);bt(n,[.06,0,0],[.06,.28,0],.015,m.glow('#7FDCE6',2));return n});tk.push(t=>notes.forEach((n,i)=>n.position.y=2+Math.sin(t*2+i)*.1));
      /* Lichterkette */const lm=[m.glow('#FFE27A',2),m.glow('#FF8FB8',2),m.glow('#7FDCE6',2)];tu(g,range(9,t=>[-W/2+t*W,top-.15-Math.sin(t*PI)*.3,zf(D)+.35]),.012,m.c('#3B3450'));range(9,(t,i)=>S(g,.06,lm[i%3],[-W/2+t*W,top-.2-Math.sin(t*PI)*.3,zf(D)+.35]));
      const tb=grp(g,[-1.9,0,zf(D)+1.1]);C(tb,.35,.35,.05,m.c('#3B3450'),[0,.75,0]);C(tb,.05,.05,.74,m.steel(),[0,.37,0]);for(const x of[-1,1]){C(tb,.16,.16,.05,m.c('#F0556E'),[x*.55,.45,0]);C(tb,.03,.03,.45,m.steel(),[x*.55,.22,0])}C(tb,.05,.06,.16,m.glass('#ffe0c0'),[0,.86,0]);
      planetDeco(g,m,st,pid,W,D,b.r);return finish(g,[0,0,zf(D)+1.2],Math.max(W,D)*.62,'bar',tk)},
    rathaus(pid,m){const b=base(pid,'rathaus',m,[6.4,4.8,3.4]);const{g,st,W,D,top}=b;roof(g,m,st,W,D,top,b.rc);door(g,m,st,0,D,'#C98C5A');
      for(const x of[-2.2,-1.1,1.1,2.2])win(g,m,st,x,1.8,D);sideWin(g,m,st,W,0,1.8,1);sideWin(g,m,st,W,0,1.8,-1);
      for(let i=0;i<3;i++)B(g,2.2-i*.3,.14,.5,.03,m.c(st.plinth),[0,.07+i*.14,zf(D)+.95-i*.25]);
      /* Uhrturm hinter der Front, auf dem Dach stehend */const tw=grp(g,[0,top,-.4]);const ty=st.roof==='gable'?1.1:st.roof==='cap'?1.5:st.roof==='shell'?1.2:.2;B(tw,1.5,2.2+ty,1.5,.08,wallMat(m,st.wall,b.wc,1.2,1.8),[0,(2.2+ty)/2,0]);
      const ct=ctex('clockface',256,256,(x,w,h)=>{x.fillStyle='#FFFBF0';x.beginPath();x.arc(128,128,122,0,TAU);x.fill();x.fillStyle='#5B4A3E';for(let i=0;i<12;i++){const a=i/12*TAU;x.beginPath();x.arc(128+Math.cos(a)*96,128+Math.sin(a)*96,i%3?5:9,0,TAU);x.fill()}});
      const cf=grp(tw,[0,1.6+ty,.76]);P(cf,G.cy(.5,.5,.06),m.c(st.trim),[0,0,0],[PI/2,0,0]);P(cf,G.circ(.44),m.tex('clockface',ct),[0,0,.04]);const hh=P(cf,G.bx(.05,.28,.02,0),m.c(PAL.ink),[0,.1,.06]);const mh=P(cf,G.bx(.035,.38,.02,0),m.c(PAL.ink),[0,.15,.07]);
      const tt=grp(tw,[0,2.2+ty,0]);if(st.roof==='cap')P(tt,G.hs(1),m.c(b.rc,{gloss:.7}),[0,0,0],null,[1,.7,1]);else if(st.roof==='shell'||st.dome){P(tt,G.hs(.85),m.c(b.rc,{gloss:.5}),[0,0,0])}else P(tt,G.co(1.1,1.1,4),roofMat(m,b.rc,1,1),[0,.55,0],[0,PI/4,0]);
      const fl=flagOn(tt,m,[0,st.roof==='cap'?.7:1,0],'#F0556E');g.userData.keep=[cf];const tk=[t=>{const d=new Date();hh.rotation.z=-(d.getHours()%12+d.getMinutes()/60)/12*TAU;mh.rotation.z=-d.getMinutes()/60*TAU},fl];
      sign(g,m,st,pid,'rathaus','Rathaus',W,D,top-.5,{bd:'#F7B84B'});planetDeco(g,m,st,pid,W,D,b.r);return finish(g,[0,0,zf(D)+1.6],Math.max(W,D)*.62,'rathaus',tk)},
    garage(pid,m){const b=base(pid,'garage',m,[6,4.6,3.2]);const{g,st,W,D,top}=b;roof(g,m,st,W,D,top,b.rc);
      /* Rolltor */const rt=ctex('rolltor',128,256,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#e8e8e8':'#ffffff';x.fillRect(0,i*16,w,16);x.fillStyle='rgba(0,0,0,.15)';x.fillRect(0,i*16+14,w,2)}});
      B(g,3.2,2.5,.14,.06,m.c(PAL.slate),[-.8,1.51,zf(D)+.02]);P(g,G.pl(2.9,2.3),m.tex('rolltor-'+pid,rtex(rt,1,1),{color:'#F7B84B'}),[-.8,1.43,zf(D)+.1]);
      for(let i=0;i<7;i++)B(g,.36,.14,.04,.02,m.c(i%2?'#3B3450':'#FFD35C'),[-2.1+i*.43,.2,zf(D)+.14],[0,0,.5]);door(g,m,st,2.1,D,'#56C6B6');
      /* Raketen-Spitze als Schild auf dem Dach */const rk=grp(g,[-W/2-1.2,.1,zf(D)-.9],[0,0,0]);C(rk,.7,.8,.1,m.c(PAL.slate),[0,-.05,0]);rk.scale.setScalar(1.25);P(rk,G.ca(.35,.9),m.white(),[0,.7,0]);P(rk,G.co(.36,.6,16),m.c('#F0556E',{gloss:.8}),[0,1.55,0]);for(let i=0;i<3;i++){const a=i/3*TAU;const q=grp(rk,[Math.cos(a)*.32,.3,Math.sin(a)*.32],[0,-a,0]);B(q,.3,.4,.05,.02,m.c('#56C6B6'),[.12,0,0])}P(rk,G.cy(.14,.14,.05),m.glass('#bfe6ff'),[0,.9,.33],[PI/2,0,0]);
      const tl=grp(g,[W/2+.6,0,zf(D)-.2]);for(let i=0;i<3;i++)P(tl,G.to(.28,.12),m.rubber(),[0,.12+i*.24,0],[PI/2,0,0]);const tb=grp(g,[W/2+.7,0,zf(D)-1.3]);B(tb,.9,.7,.5,.05,m.c('#F0556E',{gloss:.6}),[0,.35,0]);B(tb,.9,.05,.5,.02,m.steel(),[0,.72,0]);B(tb,.25,.1,.1,.02,m.steel(),[0,.8,0]);
      sign(g,m,st,pid,'garage',NAMES[pid].garage,W,D,top-.35,{bd:'#56C6B6'});return finish(g,[-.8,0,zf(D)+1.4],Math.max(W,D)*.62,'garage')},
    pflanzen(pid,m){const b=base(pid,'pflanzen',m,[4.6,3.8,2.5]);const{g,st,W,D,top}=b;
      /* Glasdach-Gewächshaus statt normalem Dach */const gl=m.glass('#d8ffe8');const fr=m.c('#FFFBF0');const hR=1.3;const s=new THREE.Shape();s.moveTo(-W/2-.1,0);s.lineTo(W/2+.1,0);s.lineTo(0,hR);s.closePath();
      P(g,new THREE.ExtrudeGeometry(s,{depth:D+.2,bevelEnabled:false}),gl,[0,top,-(D+.2)/2]);for(let i=0;i<5;i++){const z=-D/2+i*D/4;const q=grp(g,[0,top,z]);bt(q,[-W/2-.1,0,0],[0,hR,0],.04,fr);bt(q,[W/2+.1,0,0],[0,hR,0],.04,fr)}C(g,.05,.05,D+.2,fr,[0,top+hR,0],[PI/2,0,0]);
      for(let i=0;i<3;i++){const q=grp(g,[-1.2+i*1.2,top+.3,0]);range(4,(t,j)=>S(q,.22,m.c(['#5FAE55','#7CC46A','#4F9A55'][j%3],{rim:.6}),[Math.cos(j*1.6)*.2,.1+(j%2)*.12,Math.sin(j*1.6)*.2]))}
      door(g,m,st,-1,D,'#5FA652');B(g,1.6,1.1,.12,.06,m.c(st.trim),[1,1.3,zf(D)+.05]);B(g,1.4,.9,.04,.03,m.glass('#dff6ff'),[1,1.3,zf(D)+.12]);
      for(let i=0;i<5;i++){const q=grp(g,[-W/2+.3+i*(W-.6)/4,0,zf(D)+.9]);C(q,.2,.15,.32,m.c(PAL.terracotta),[0,.16,0]);const kinds=['#FF8FB8','#FFE27A','#C6A9FF','#FF7E6B','#7FDCE6'];S(q,.22,m.c('#6DAE55',{rim:.6}),[0,.45,0],[1,.8,1]);range(3,(t,j)=>S(q,.07,m.c(kinds[(i+j)%5]),[Math.cos(j*2.1)*.15,.58,Math.sin(j*2.1)*.15]))}
      for(const x of[-1.5,1.5]){const hp=grp(g,[x,top-.05,zf(D)+.45]);bt(hp,[0,0,0],[0,-.5,0],.01,m.c('#8A5A44'));C(hp,.15,.1,.2,m.c(PAL.terracotta),[0,-.6,0]);range(5,(t,j)=>bt(hp,[0,-.5,0],[Math.cos(j*1.3)*.2,-.9-j*.05,Math.sin(j*1.3)*.2],.018,m.c('#5FAE55')))}
      sign(g,m,st,pid,'pflanzen',NAMES[pid].pflanzen,W,D,top-.35,{bd:'#5FA652'});planetDeco(g,m,st,pid,W,D,b.r);return finish(g,[-1,0,zf(D)+1.2],Math.max(W,D)*.62,'pflanzen')},
    tiere(pid,m){const b=base(pid,'tiere',m,[4.8,3.8,2.7]);const{g,st,W,D,top}=b;roof(g,m,st,W,D,top,b.rc);door(g,m,st,1.1,D,'#FFB27A');
      B(g,1.8,1.2,.12,.06,m.c(st.trim),[-1,1.35,zf(D)+.05]);B(g,1.6,1,.04,.03,m.glass('#dff6ff'),[-1,1.35,zf(D)+.12]);const bowl=grp(g,[-1,.95,zf(D)+.45]);B(bowl,1.7,.08,.5,.03,m.c(st.trim),[0,-.2,-.1]);S(bowl,.24,m.glass('#bfeaff'),[0,.05,0]);S(bowl,.06,m.gloss('#FF9E45'),[.05,.02,.08],[1.4,.8,.6]);
      /* Hundehütte */const kn=grp(g,[W/2+.9,0,zf(D)-.4],[0,-.5,0]);B(kn,.9,.7,.8,.06,Wd(m,'#E0876A'),[0,.35,0]);const s=new THREE.Shape();s.moveTo(-.55,0);s.lineTo(.55,0);s.lineTo(0,.45);s.closePath();P(kn,new THREE.ExtrudeGeometry(s,{depth:.95,bevelEnabled:false}),m.c('#8E6BD1'),[0,.7,-.475]);P(kn,G.puff(archShape(.4,.45,.2),.04),m.c('#3B3450'),[0,0,.41]);
      /* Pfoten-Schild */const pw=grp(g,[0,top+.02,zf(D)+.2]);S(pw,.32,m.c('#FFB27A',{gloss:.5}),[0,.4,0],[1,.85,.35]);range(4,(t,i)=>S(pw,.12,m.c('#FFB27A',{gloss:.5}),[(i-1.5)*.2,.78+(i%3===0?-.05:0),0],[1,1.1,.4]));
      const bone=grp(g,[-W/2-.5,.05,zf(D)+.4]);C(bone,.05,.05,.4,m.c('#FFFBF0'),[0,.05,0],[0,0,PI/2]);for(const x of[-1,1])for(const z of[-1,1])S(bone,.07,m.c('#FFFBF0'),[x*.2,.05,z*.05]);
      sign(g,m,st,pid,'tiere',NAMES[pid].tiere,W,D,top-.35,{bd:'#FFB27A'});planetDeco(g,m,st,pid,W,D,b.r);return finish(g,[1.1,0,zf(D)+1.2],Math.max(W,D)*.62,'tiere')}};
  /* Neu: Grundform aus dem Architektur-Generator (je Planet eigene Bauformen), dazu frei stehendes Schild und Vorplatz-Deko je Gebäudeart */
  function yardSign(g,m,pid,kind,text,x,z){const st=STY[pid]||STY.kompost;const q=grp(g,[x,0,z],[0,x>0?-.35:.35,0]);for(const sx of[-.75,.75])C(q,.06,.07,1.5,Wd(m,'#8A5A44'),[sx,.75,0]);
    signBoard(q,m,'ys-'+pid+'-'+kind,text,Math.min(2.6,Math.max(1.6,text.length*.13)),.6,[0,1.45,.02],{board:m.c(st.trim),bg:'#FFFBF0',fg:'#5B4A3E',bd:st.roofs[0]})}
  function yard(g,m,pid,kind,dx,dz,r,ticks){const at=(x,z,f,ry)=>{const q=grp(g,[x,0,z],[0,ry||0,0]);f(q);return q};const L=dx-2.2,Rr=dx+2.2,Z=dz-.2;
    if(kind==='museum'){at(Rr,Z,q=>{B(q,.8,.8,.8,.06,m.c('#F4EEE4'),[0,.4,0]);const d=grp(q,[0,.8,0]);for(let i=0;i<5;i++)S(d,.14-i*.015,m.c('#FFFBF0'),[i*.22-.44,.2+Math.sin(i)*.06,0]);S(d,.22,m.c('#FFFBF0'),[.7,.35,0],[1.3,1,1]);for(let i=0;i<3;i++)bt(d,[-.2+i*.22,.2,0],[-.25+i*.22,-.05,.12],.03,m.c('#FFFBF0'))});at(L,Z,q=>{for(const x of[-.3,.3]){C(q,.04,.04,2,m.steel(),[x,1,0]);B(q,.4,1,.03,.01,m.c(x<0?'#8E6BD1':'#F7B84B'),[x+.2,1.4,0])}})}
    else if(kind==='shop'){at(L,Z,q=>{crate(q,m,[0,0,0],'#F0556E',srand(1));crate(q,m,[.1,.34,0],'#FFD35C',srand(2))});at(Rr,Z,q=>{B(q,1.4,.8,.7,.06,Wd(m,'#C98C5A'),[0,.4,0]);for(let i=0;i<4;i++)S(q,.12,m.gloss(['#FF8FB8','#7CC46A','#FFE27A','#7FDCE6'][i]),[-.45+i*.3,.9,0]);awning(q,m,1.6,.6,1.6,-.2,'#F0556E','#FFFBF0',6)})}
    else if(kind==='bar'){for(const x of[L,Rr])C(g,.05,.06,2.8,m.c('#3B3450'),[x,1.4,Z+.6]);const lm=[m.glow('#FFE27A',2),m.glow('#FF8FB8',2),m.glow('#7FDCE6',2)];P(g,G.tu(range(9,t=>[L+t*(Rr-L),2.6-Math.sin(t*PI)*.4,Z+.6]),.012),m.c('#3B3450'));range(9,(t,i)=>S(g,.07,lm[i%3],[L+t*(Rr-L),2.55-Math.sin(t*PI)*.4,Z+.6]));
      at(L+.4,Z-.4,q=>{C(q,.35,.35,.05,m.c('#3B3450'),[0,.75,0]);C(q,.05,.05,.74,m.steel(),[0,.37,0]);S(q,.05,m.glow('#FFD27A',2),[0,.85,0])});const ns=at(Rr-.2,Z-.6,q=>{C(q,.05,.05,2.2,m.steel(),[0,1.1,0]);B(q,1.6,.5,.1,.06,m.c('#3B3450'),[0,2.2,0]);decal(q,m,signTex('barneon-'+pid,NAMES[pid].bar,{bg:'#3B3450',fg:'#FFE27A',bd:'#FF6FB0',glow:'#FF6FB0',w:512,h:160}),'bn-'+pid,1.5,.45,[0,2.2,.06],null,true)})}
    else if(kind==='studio'){at(Rr,Z,q=>{for(const x of[-1,1])bt(q,[x*.3,0,0],[x*.12,1.5,-.1],.03,Wd(m,PAL.wood));bt(q,[0,0,-.45],[0,1.4,-.1],.03,Wd(m,PAL.wood));B(q,.7,.55,.04,.02,m.c('#FFFBF0'),[0,1.05,-.02],[-.12,0,0]);for(let i=0;i<4;i++)S(q,.05,m.c(['#F0556E','#56C6B6','#FFE27A','#8E6BD1'][i]),[-.2+i*.13,1.08+(i%2)*.1,.02])},-.4);at(L,Z,q=>{for(let i=0;i<3;i++)C(q,.14,.14,.26,m.c(['#F0556E','#56C6B6','#FFE27A'][i],{gloss:.6}),[i*.32-.32,.13,0])})}
    else if(kind==='rathaus'){for(const[x,c]of[[L,'#F0556E'],[Rr,(STY[pid]||STY.kompost).roofs[0]]]){const f=flagOn(grp(g,[x,0,Z]),m,[0,0,0],c);g.children[g.children.length-1].scale.setScalar(2.6);ticks.push(f)}at(dx,dz+.8,q=>{for(let i=0;i<2;i++)B(q,2.2-i*.4,.14,.5,.03,m.c('#BDB6C8'),[0,.07+i*.14,-i*.3])})}
    else if(kind==='garage'){at(L-.3,Z-.4,q=>{C(q,.7,.8,.1,m.c(PAL.slate),[0,.05,0]);const rk=typeof ROCKET!=='undefined'?ROCKET.build(ROCKET.spec(),m):null;if(rk){rk.scale.setScalar(.55);rk.position.y=.1;q.add(rk)}});at(Rr,Z,q=>{for(let i=0;i<3;i++)P(q,G.to(.28,.12),m.rubber(),[0,.12+i*.24,0],[PI/2,0,0])});at(Rr+.9,Z-.6,q=>{B(q,.5,1.2,.4,.06,m.c('#F0556E',{gloss:.6}),[0,.6,0]);B(q,.3,.3,.05,.02,m.c('#FFFBF0'),[0,.9,.21]);P(q,G.tu([[.25,.6,0],[.5,.4,.2],[.45,0,.3]],.03),m.c('#3B3450'))})}
    else if(kind==='pflanzen'){for(let i=0;i<5;i++){at(dx-2.4+i*1.2,Z+.3,q=>{C(q,.22,.16,.34,m.c(PAL.terracotta),[0,.17,0]);S(q,.24,m.c('#6DAE55',{rim:.6}),[0,.5,0],[1,.8,1]);for(let j=0;j<3;j++)S(q,.07,m.c(['#FF8FB8','#FFE27A','#C6A9FF','#FF7E6B','#7FDCE6'][(i+j)%5]),[Math.cos(j*2.1)*.16,.64,Math.sin(j*2.1)*.16])})}at(Rr+.4,Z-.8,q=>{B(q,1.2,.35,.7,.04,Wd(m,'#C98C5A'),[0,.18,0]);B(q,1.1,.08,.6,.02,m.c('#8A5E42'),[0,.36,0]);for(let i=0;i<4;i++)S(q,.1,m.c('#7CC46A'),[-.4+i*.27,.45,0])})}
    else if(kind==='tiere'){at(Rr,Z-.3,q=>{B(q,.9,.7,.8,.06,Wd(m,'#E0876A'),[0,.35,0]);const s2=new THREE.Shape();s2.moveTo(-.55,0);s2.lineTo(.55,0);s2.lineTo(0,.45);s2.closePath();P(q,new THREE.ExtrudeGeometry(s2,{depth:.95,bevelEnabled:false}),m.c('#8E6BD1'),[0,.7,-.475]);P(q,G.puff(archShape(.4,.45,.2),.04),m.c('#3B3450'),[0,0,.41])},-.5);
      at(L,Z,q=>{C(q,.25,.2,.12,m.c('#6AA8F0',{gloss:.6}),[0,.06,0]);C(q,.2,.2,.02,m.c('#8A5A44'),[0,.12,0]);for(let i=0;i<8;i++){const a=i/8*TAU;if(i===2)continue;C(q,.04,.04,.6,Wd(m,'#FFFBF0'),[Math.sin(a)*1,.3,Math.cos(a)*1-.3])}})}}
  function build(kind,pid,m){if(kind==='rocket')return null;
    /* Bausatz-Gebäude (einzigartig je Planet und Art, sauber geprüft) */
    if(typeof HAUS!=='undefined'&&HAUS.ready&&kind!=='plaza'){try{const U=1.9;const res=HAUS.civic(pid,kind,{sagR:(GAME.G.R+.8)/U});const g=new THREE.Group();const w=new THREE.Group();w.rotation.y=PI;w.scale.setScalar(U);w.add(res.g);g.add(w);
      const rot=(x,z)=>[-x*U,-z*U];const[dx,dz]=rot(res.door[0],res.door[1]);const nm=(NAMES[pid]||NAMES.kompost)[kind]||kind;
      if(res.sign){const[sx,sz]=rot(res.sign[0],res.sign[1]);yardSign(g,m,pid,kind,nm,sx,sz)}
      finish(g,[dx,0,dz],res.bodyR*U,kind,[]);Object.assign(g.userData,{name:nm,doorExact:true,obstR:.3,colliders:res.colliders.map(c=>[...rot(c[0],c[1]),c[2]*U]),style:res.style});return g}catch(e){console.warn('Bausatz-Gebäude',kind,e)}}QF=Math.min(QF||1,HIGH?.7:.45);const res=ARCH.forTown(pid,kind);if(!res)return null;const g=new THREE.Group();g.add(res.g);const ticks=[];if(res.g.userData.tick){const t0=res.g.userData.tick;ticks.push(t0)}
    const[dx,dz]=res.door;yardSign(g,m,pid,kind,(NAMES[pid]||NAMES.kompost)[kind]||kind,dx+(dx>0?-2.1:2.1),dz-.1);try{yard(g,m,pid,kind,dx,dz,res.r,ticks)}catch(e){console.warn('Vorplatz',kind,e)}
    finish(g,[dx,0,dz],res.r,kind,ticks);g.userData.name=(NAMES[pid]||NAMES.kompost)[kind]||kind;return g}
  return{build,NAMES,STY,kinds:Object.keys(B_)}
})();
