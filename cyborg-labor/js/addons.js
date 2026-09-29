/* =====================================================================
   CYBORG-LABOR · addons.js
   Anbauten fürs eigene Haus (im Hausbau kaufen, stehen neben dem Haus,
   jeweils mit eigenem Innenraum):
   · Sternwarte  – nachts durchs Teleskop Sternbilder verbinden (eins je Nacht)
   · Gewächshaus – Setzlinge aller Planeten zu Topfpflanzen heranziehen
   · Labor       – Tränke brauen aus Fisch, Insekt, Relikt oder Frucht
   ===================================================================== */
const ADDONS=(()=>{
  const B=(g,w,h,d,rad,mat,p,r,sc)=>P(g,G.bx(w,h,d,rad),mat,p,r,sc),C=(g,rt,rb,h,mat,p,r,sc)=>P(g,G.cy(rt,rb,h),mat,p,r,sc),S=(g,r,mat,p,sc)=>P(g,G.s(r),mat,p,null,sc);
  const HK=()=>window.HOUSEKIT;const wallMat=(...a)=>HK().wallMat(...a),houseDoor=(...a)=>HK().houseDoor(...a),houseWin=(...a)=>HK().houseWin(...a),Wd=(...a)=>HK().Wd(...a),darker=(...a)=>HK().darker(...a);
  const DEFS=[
    {id:'gewaechshaus',n:'Gewächshaus',price:8000,d:'Setzlinge aus allen Planeten werden hier zu Topfpflanzen.'},
    {id:'labor',n:'Labor',price:10000,d:'Brau Tränke: schneller laufen, höher springen, funkeln, Pflanzen wachsen lassen.'},
    {id:'sternwarte',n:'Sternwarte',price:14000,d:'Jede Nacht ein neues Sternbild entdecken.'}];
  const def=id=>DEFS.find(d=>d.id===id);
  const owned=()=>((SAVE.house&&SAVE.house.style&&SAVE.house.style.addons)||[]).filter(def);
  const night=()=>{const h=GAMETIME.hour();return h>=20||h<5};

  /* ================= Aussenansicht ================= */
  function sternwarte(m,st){const g=new THREE.Group();const wk=st.wall||'stein',wc=st.wallCol||'#FFE3B8',trim='#FFFDF7';const R=1.05,H=1.95;
    C(g,R+.16,R+.2,.3,m.c(PAL.stone),[0,.15,0]);P(g,G.cy(R,R,H),wallMat(m,wk,wc,TAU*R/1.3,H/1.3),[0,H/2+.2,0]);P(g,G.to(R+.03,.07),m.c(trim),[0,H+.2,0],[PI/2,0,0]);
    const dome=m.gloss('#E6EAF6');P(g,G.hs(R+.06),dome,[0,H+.2,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(g,G.to(R+.07,.022,PI/2),m.c('#C8CEE2'),[0,H+.2,0],[0,a,0])}
    /* Teleskop ragt aus der Kuppel */const el=.62,az=-.55;const tp=grp(g,[Math.sin(az)*.35,H+.62,Math.cos(az)*.35],[0,az,0]);const tube=grp(tp,[0,0,0],[-el,0,0]);
    P(tube,G.cy(.16,.2,1.4),m.gold(),[0,0,.55],[PI/2,0,0]);P(tube,G.to(.17,.035),m.c(PAL.ink),[0,0,1.25]);P(tube,G.circ(.15),m.c('#2E2A48'),[0,0,1.255]);P(tube,G.to(.21,.04),m.gold(),[0,0,.05]);
    P(g,G.circ(.34),m.c('#2E2A48'),[Math.sin(az)*(R-.02),H+.78,Math.cos(az)*(R-.02)],[-.6,az,0]);
    S(g,.1,m.gold(),[0,H+.2+R+.1,0]);P(g,G.star(.16,.07,5,.04),m.glow('#FFE38A',1.4),[0,H+.2+R+.36,0]);
    const d=houseDoor(m,st.doorCol||'#7FB2E0',trim);d.scale.setScalar(.82);d.position.set(0,.3,R-.04);g.add(d);B(g,1.05,.14,.5,.05,m.c(PAL.stone),[0,.07,R+.3]);
    const w=houseWin(m,'bullauge',trim,st.roofCol||'#F0556E',Wd(m,PAL.wood));w.scale.setScalar(.62);w.position.set(Math.sin(1.4)*R,1.45,Math.cos(1.4)*R);w.rotation.y=1.4;g.add(w);
    return{g,door:[0,R+.95],r:R+.3}}
  function gewaechshaus(m,st){const g=new THREE.Group();const W=2.7,D=2.0,H=1.45,p=.58;const fr=m.c('#FFFDF7'),gl=m.glass('#E6FAF0');
    B(g,W+.16,.22,D+.16,.06,m.c(PAL.stone),[0,.11,0]);const y0=.22;
    for(const x of[-W/2,-W/6,W/6,W/2])for(const z of[-D/2,D/2])B(g,.08,H,.08,.02,fr,[x,y0+H/2,z]);
    for(const z of[-D/2,0,D/2])both(s=>B(g,.08,H,.08,.02,fr,[s*W/2,y0+H/2,z]));
    both(s=>{B(g,W,.08,.08,.02,fr,[0,y0+H,s*D/2]);B(g,.03,H-.06,D,.01,gl,[s*W/2,y0+H/2,0])});
    B(g,W,H-.06,.03,.01,gl,[0,y0+H/2,-D/2]);both(s=>B(g,(W-.9)/2,H-.06,.03,.01,gl,[s*(W/2+.45)/2,y0+H/2,D/2]));
    /* Satteldach aus Glas, weisse Sprossen */const hw=D/2,ridge=y0+H+hw*Math.tan(p),L=hw/Math.cos(p)+.08;
    both(s=>{const cz=s*hw/2,cy=y0+H+hw/2*Math.tan(p);P(g,G.bx(W+.1,.03,L,.01),gl,[0,cy,cz],[s*p,0,0]);for(const x of[-W/2,-W/6,W/6,W/2])P(g,G.bx(.07,.07,L,.02),fr,[x,cy+.02,cz],[s*p,0,0])});
    P(g,G.cy(.06,.06,W+.14),fr,[0,ridge+.03,0],[0,0,PI/2]);both(s=>P(g,G.ex(shp([[-hw,0],[hw,0],[0,ridge-y0-H]]),.03),gl,[s*W/2-(s>0?.03:0),y0+H,0],[0,PI/2,0]));
    /* Tür + Pflanzen drinnen */both(x=>B(g,.07,H,.07,.02,fr,[x*.42,y0+H/2,D/2+.03]));B(g,.9,.07,.07,.02,fr,[0,y0+H-.04,D/2+.03]);B(g,.76,H-.1,.025,.01,m.glass('#D8F6E6'),[0,y0+H/2-.02,D/2+.04]);B(g,.76,.05,.04,.01,fr,[0,y0+H*.5,D/2+.05]);S(g,.04,m.gold(),[.3,y0+H*.48,D/2+.07]);
    const pots=[[-.9,-.5],[-.35,-.55],[.4,-.5],[.95,-.45],[-.95,.35],[.95,.3]];const leaf=['#6FBF7A','#4FA86A','#8FD07A'],fl=['#FF8FB1','#FFD85A','#C6A9FF','#FF9E6E'];
    pots.forEach(([x,z],i)=>{C(g,.14,.11,.22,m.c('#D98A5E'),[x,y0+.11,z]);P(g,G.blob(.2,.06,4,i+2),m.c(leaf[i%3]),[x,y0+.34,z],null,[1,.9,1]);if(i%2===0)S(g,.06,m.c(fl[i%4]),[x+.05,y0+.5,z+.06])});
    B(g,.3,.22,.2,.04,m.c('#7EC3E0'),[1.1,.11,D/2+.35]);/* Giesskanne */P(g,G.cy(.025,.025,.3),m.c('#7EC3E0'),[1.28,.25,D/2+.35],[0,0,-.9]);
    return{g,door:[0,D/2+.85],r:Math.max(W,D)*.55}}
  function labor(m,st){const g=new THREE.Group();const wk=st.wall||'holz',wc=st.wallCol||'#FFE3B8',trim='#FFFDF7';const W=2.2,D=2.0,H=2.0;
    B(g,W+.16,.26,D+.16,.06,m.c(PAL.stone),[0,.13,0]);B(g,W,H,D,.08,wallMat(m,wk,wc,W/1.3,H/1.3),[0,H/2+.26,0]);const top=H+.26;
    B(g,W+.24,.16,D+.24,.05,m.c(darker(st.roofCol||'#8E6BD1',.85)),[0,top+.08,0]);both(s=>B(g,W+.24,.16,.1,.03,m.c(trim),[0,top+.24,s*(D/2+.07)]));both(s=>B(g,.1,.16,D+.24,.03,m.c(trim),[s*(W/2+.07),top+.24,0]));
    /* Tesla-Spule auf dem Dach */C(g,.2,.26,.2,m.steel(),[.45,top+.26,-.3]);C(g,.07,.1,.7,m.copper(),[.45,top+.7,-.3]);for(let i=0;i<3;i++)P(g,G.to(.13-i*.02,.03),m.copper(),[.45,top+.48+i*.16,-.3],[PI/2,0,0]);
    S(g,.15,m.glow('#8FF0E6',1.6),[.45,top+1.12,-.3]);P(g,G.to(.2,.025),m.steel(),[.45,top+1.12,-.3],[PI/2,0,0]);
    /* Schornstein-Rohr mit Knick */bt(g,[-.6,top,-.4],[-.6,top+.7,-.4],.09,m.copper());bt(g,[-.6,top+.7,-.4],[-.35,top+.95,-.4],.09,m.copper());P(g,G.cy(.13,.11,.12),m.steel(),[-.3,top+.98,-.4],[0,0,-.8]);
    /* Bullauge mit grün leuchtender Flüssigkeit */const wy=1.35;P(g,G.to(.32,.07),m.copper(),[-.62,wy,D/2+.01]);P(g,G.circ(.3),m.glow('#7FEAA8',1.1),[-.62,wy,D/2+.005]);for(const[bx,by]of[[-.08,.05],[.1,-.1],[0,.14]])S(g,.04,m.c('#E8FFF0',{opacity:.7}),[-.62+bx,wy+by,D/2+.04]);
    /* Tank an der Seite */C(g,.26,.26,1.1,m.steel(),[W/2+.26,.81,.3]);P(g,G.to(.27,.03),m.copper(),[W/2+.26,.6,.3],[PI/2,0,0]);P(g,G.to(.27,.03),m.copper(),[W/2+.26,1.1,.3],[PI/2,0,0]);B(g,.06,.5,.12,.02,m.glow('#7FEAA8',1),[W/2+.52,.85,.3]);
    bt(g,[W/2,1.4,.3],[W/2+.26,1.4,.3],.05,m.copper());
    const d=houseDoor(m,st.doorCol||'#7FB2E0',trim);d.scale.setScalar(.82);d.position.set(.35,.26,D/2-.02);g.add(d);B(g,1.0,.14,.5,.05,m.c(PAL.stone),[.35,.07,D/2+.3]);
    return{g,door:[.35,D/2+.9],r:Math.max(W,D)*.6}}
  const EXT={sternwarte,gewaechshaus,labor};
  /* Plätze rund ums Haus: links, rechts, hinten rechts – Türen zeigen nach vorn */
  function attach(g,m,st,houseR){const list=(st.addons||[]).filter(def);if(!list.length)return;const R0=Math.max(houseR||2.4,g.userData.fenceR||0);
    const SPOT={sternwarte:[-(R0+2.2),-.2],gewaechshaus:[R0+2.4,-.2],labor:[R0*.55,-(R0+2.3)]};const doors=[],cols=g.userData.colliders=g.userData.colliders||[];
    for(const id of list){const b=EXT[id](m,st);const[x,z]=SPOT[id];b.g.position.set(x,0,z);g.add(b.g);doors.push({id,x:x+b.door[0],z:z+b.door[1]});cols.push([x,z,b.r])}
    g.userData.addonDoors=doors}

  /* ================= Sternwarte: Sternbilder ================= */
  const CONST=[
    {id:'schluessel',n:'Der Schraubenschlüssel',s:[[.2,.3],[.3,.42],[.42,.5],[.55,.58],[.68,.66],[.75,.6],[.8,.72],[.66,.78]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[4,7],[5,6]]},
    {id:'teekanne',n:'Die Teekanne',s:[[.3,.4],[.5,.35],[.7,.4],[.72,.6],[.5,.68],[.3,.6],[.18,.48],[.84,.5],[.5,.26]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[2,7],[1,8]]},
    {id:'axolotl',n:'Der Axolotl',s:[[.2,.5],[.35,.45],[.5,.5],[.65,.48],[.8,.55],[.27,.32],[.3,.64],[.52,.66],[.66,.64]],e:[[0,1],[1,2],[2,3],[3,4],[1,5],[1,6],[2,7],[3,8]]},
    {id:'rakete',n:'Die Rakete',s:[[.5,.18],[.44,.35],[.56,.35],[.44,.6],[.56,.6],[.36,.74],[.64,.74],[.5,.84]],e:[[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[3,7],[4,7]]},
    {id:'pilz',n:'Der Glückspilz',s:[[.28,.45],[.4,.3],[.6,.3],[.72,.45],[.44,.45],[.56,.45],[.46,.7],[.54,.7]],e:[[0,1],[1,2],[2,3],[3,5],[5,4],[4,0],[4,6],[5,7],[6,7]]},
    {id:'katze',n:'Die Katze',s:[[.3,.3],[.36,.44],[.44,.3],[.52,.44],[.6,.55],[.74,.52],[.78,.72],[.6,.72],[.86,.4]],e:[[0,1],[1,2],[2,3],[1,3],[3,4],[4,5],[5,6],[4,7],[5,8]]},
    {id:'anker',n:'Der Anker',s:[[.5,.2],[.5,.4],[.38,.4],[.62,.4],[.5,.72],[.32,.62],[.68,.62]],e:[[0,1],[1,2],[1,3],[1,4],[4,5],[4,6]]},
    {id:'zahnrad',n:'Das Zahnrad',s:[[.5,.25],[.7,.35],[.75,.55],[.62,.72],[.4,.72],[.27,.55],[.32,.35],[.5,.5]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[7,0],[7,3]]},
    {id:'gitarre',n:'Die Gitarre',s:[[.5,.15],[.5,.35],[.4,.5],[.45,.62],[.36,.76],[.64,.76],[.55,.62],[.6,.5]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,1]]},
    {id:'schnecke',n:'Die Schnecke',s:[[.2,.7],[.4,.7],[.6,.7],[.76,.66],[.82,.52],[.72,.42],[.6,.5],[.66,.58],[.3,.58],[.24,.54]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[0,9],[9,8]]},
    {id:'kristall',n:'Der Kristall',s:[[.5,.18],[.36,.4],[.64,.4],[.4,.7],[.6,.7],[.5,.82]],e:[[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[1,2],[0,5]]},
    {id:'kompass',n:'Der Kompass',s:[[.5,.2],[.8,.5],[.5,.8],[.2,.5],[.5,.5],[.62,.38],[.38,.62]],e:[[0,4],[1,4],[2,4],[3,4],[4,5],[4,6]]}];
  function observe(){const O=SAVE.obs=SAVE.obs||{found:[],night:-1};const day=SAVE.dayN||0;
    if(!night()){UI.talk('Sternwarte',['Am Tag sind die Sterne zu blass. Komm nach Sonnenuntergang wieder (ab 20 Uhr).'],{});return}
    const nightId=GAMETIME.hour()<5?day-1:day;if(O.night===nightId){UI.toast('Heute Nacht hast du schon ein Sternbild entdeckt. Morgen Nacht wartet das nächste.',3000);return}
    const todo=CONST.filter(c=>!O.found.includes(c.id));if(!todo.length){UI.toast('Du kennst schon alle Sternbilder!');return}
    const C=todo[Math.floor(Math.random()*todo.length)];const w=UI.win('Teleskop',{size:'wide'});const cv=document.createElement('canvas');const S=Math.min(560,window.innerWidth-60);cv.width=S;cv.height=S*.72;cv.style.cssText='display:block;margin:0 auto;width:min(100%,calc(56vh/0.72));border-radius:18px;cursor:crosshair;touch-action:none';
    const hint=el('p',null,'Tippe die hellen, funkelnden Sterne an. Sie verbinden sich zu einem Sternbild.');w.body.append(hint,cv);const x=cv.getContext('2d');const r=srand(C.id.length*31+day);const bg=[];for(let i=0;i<140;i++)bg.push([r(),r(),r()*1.3+.3,r()*6]);
    const pts=C.s.map(([u,v])=>[u*cv.width,v*cv.height]);const hit=new Set();let done=false,t0=performance.now(),raf=0;
    function draw(){const t=(performance.now()-t0)/1000;const gr=x.createLinearGradient(0,0,0,cv.height);gr.addColorStop(0,'#141A3E');gr.addColorStop(1,'#2A2458');x.fillStyle=gr;x.fillRect(0,0,cv.width,cv.height);
      for(const[u,v,s,ph]of bg){x.globalAlpha=.35+.3*Math.sin(t*1.3+ph);x.fillStyle='#FFF6D8';x.beginPath();x.arc(u*cv.width,v*cv.height,s,0,TAU);x.fill()}x.globalAlpha=1;
      x.strokeStyle='rgba(255,230,160,.85)';x.lineWidth=2.4;x.lineCap='round';for(const[a,b]of C.e){if(hit.has(a)&&hit.has(b)){x.beginPath();x.moveTo(...pts[a]);x.lineTo(...pts[b]);x.stroke()}}
      pts.forEach(([px,py],i)=>{const on=hit.has(i);const rr=on?5.5:3.4+Math.sin(t*4+i)*1.1;x.fillStyle=on?'#FFE38A':'#FFFFFF';x.shadowColor='#FFE9A8';x.shadowBlur=on?16:10;x.beginPath();x.arc(px,py,rr,0,TAU);x.fill()});x.shadowBlur=0;
      if(done){x.fillStyle='rgba(255,246,216,.95)';x.font='bold 22px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText(C.n,cv.width/2,cv.height-18)}
      if(cv.isConnected)raf=requestAnimationFrame(draw)}
    cv.onpointerdown=e=>{if(done)return;const b=cv.getBoundingClientRect();const px=(e.clientX-b.left)*cv.width/b.width,py=(e.clientY-b.top)*cv.height/b.height;let best=-1,bd=26*cv.width/b.width;
      pts.forEach(([qx,qy],i)=>{const d=Math.hypot(qx-px,qy-py);if(d<bd&&!hit.has(i)){bd=d;best=i}});if(best<0){SND.play('soft',{vol:.3,rate:.7});return}hit.add(best);SND.play('select',{rate:1+hit.size*.06});
      if(hit.size===pts.length){done=true;O.found.push(C.id);O.night=nightId;money(150);SAVE.stats.stars=(SAVE.stats.stars||0)+1;persist();SND.jingle('j_success');hint.textContent='Entdeckt: '+C.n+'! 150 Taler für die Sternkarte. ('+O.found.length+'/'+CONST.length+')';UI.toast('Neues Sternbild: '+C.n,2800)}};
    draw()}
  function starBook(){const O=SAVE.obs=SAVE.obs||{found:[],night:-1};const w=UI.win('Sternbilder '+O.found.length+'/'+CONST.length,{size:'wide'});const gr=el('div','grid');
    for(const C of CONST){const has=O.found.includes(C.id);const cv=document.createElement('canvas');cv.width=160;cv.height=116;const x=cv.getContext('2d');x.fillStyle='#1C2048';x.fillRect(0,0,160,116);
      if(has){x.strokeStyle='#FFE38A';x.lineWidth=1.6;for(const[a,b]of C.e){x.beginPath();x.moveTo(C.s[a][0]*160,C.s[a][1]*116);x.lineTo(C.s[b][0]*160,C.s[b][1]*116);x.stroke()}x.fillStyle='#FFF6D8';for(const[u,v]of C.s){x.beginPath();x.arc(u*160,v*116,2.6,0,TAU);x.fill()}}
      else{x.fillStyle='rgba(255,255,255,.35)';x.font='bold 40px sans-serif';x.textAlign='center';x.fillText('?',80,72)}
      const c=el('div','card');cv.style.cssText='width:100%;border-radius:10px';c.append(cv,el('span',null,has?C.n:'Unentdeckt'));gr.append(c)}w.body.append(gr)}
  function telescopeModel(M){const g=new THREE.Group();for(let i=0;i<3;i++){const a=i/3*TAU;bt(g,[0,1.1,0],[Math.sin(a)*.7,0,Math.cos(a)*.7],.045,M.gold())}S(g,.12,M.gold(),[0,1.12,0]);
    const tb=grp(g,[0,1.25,0],[-.7,0,0]);P(tb,G.cy(.22,.26,2.2),M.c('#3E4A7A',{gloss:.9}),[0,0,.3],[PI/2,0,0]);for(const z of[-.6,.4,1.3])P(tb,G.to(.25,.04),M.gold(),[0,0,z]);P(tb,G.circ(.2),M.c('#8FB8FF',{gloss:1.2}),[0,0,1.41]);
    P(tb,G.cy(.06,.06,.3),M.c(PAL.ink),[0,-.1,-.85],[PI/2,0,0]);return g}
  function buildSternwarte(sc){const W=8,D=7,H=4.2;INTERIOR.makeRoom(sc,W,D,H,'sterne','parkett',{trim:'#5A4A7A',windows:false});const A=INTERIOR.actions,Cl=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.55;o.color.set('#C8D0FF')}});
    const tel=telescopeModel(M);tel.position.set(0,0,-1.4);tel.rotation.y=PI;sc.add(tel);Cl.push({x0:-.8,x1:.8,z0:-2.2,z1:-.6});addOutlines(tel);
    /* Kuppel-Öffnung als Nachthimmel an der Rückwand */const sky=ctex('obs-sky',256,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#101640');g.addColorStop(1,'#2E2860');x.fillStyle=g;x.fillRect(0,0,w,h);const r=srand(5);for(let i=0;i<90;i++){x.globalAlpha=.4+r()*.6;x.fillStyle='#FFF6D8';x.fillRect(r()*w,r()*h,2,2)}});
    const win=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.4),new THREE.MeshBasicMaterial({map:sky}));win.position.set(0,2.6,-D/2+.02);win.userData.noOutline=true;sc.add(win);P(sc,G.to(1.2,.08,PI),M.gold(),[0,2.6+.0,-D/2+.05]);
    /* Schreibtisch mit Globus und Sternkarten-Buch */const desk=grp(sc,[-2.6,0,-2.4]);B(desk,1.6,.08,.8,.03,Wd(M,PAL.wood),[0,.78,0]);for(const[x,z]of[[-.7,-.32],[.7,-.32],[-.7,.32],[.7,.32]])B(desk,.08,.78,.08,.02,Wd(M,PAL.wood),[x,.39,z]);
    const glb=grp(desk,[.45,.82,0]);C(glb,.12,.16,.06,M.gold(),[0,.03,0]);bt(glb,[0,.05,0],[0,.22,0],.02,M.gold());S(glb,.2,M.c('#6FB8E8',{gloss:1}),[0,.42,0]);P(glb,G.to(.22,.015,PI*1.3),M.gold(),[0,.42,0],[0,PI/2,.4]);
    B(desk,.5,.08,.36,.02,M.c('#5A4A9A'),[-.3,.86,0]);B(desk,.46,.02,.32,.01,M.c('#FFF6E0'),[-.3,.91,0]);addOutlines(desk);Cl.push({x0:-3.5,x1:-1.7,z0:-2.9,z1:-1.9});
    /* Planetenmobile an der Decke */const mob=grp(sc,[2.2,H-.2,-.8]);bt(mob,[0,0,0],[0,-.5,0],.012,M.c(PAL.ink));const arm=grp(mob,[0,-.5,0]);const cols=['#FF9E6E','#8FD0FF','#C6A9FF','#FFD85A'];
    cols.forEach((c,i)=>{const a=i/4*TAU;bt(arm,[0,0,0],[Math.sin(a)*.7,0,Math.cos(a)*.7],.012,M.gold());bt(arm,[Math.sin(a)*.7,0,Math.cos(a)*.7],[Math.sin(a)*.7,-.35,Math.cos(a)*.7],.008,M.c(PAL.ink));S(arm,.14+i*.02,M.c(c,{gloss:.8}),[Math.sin(a)*.7,-.45,Math.cos(a)*.7])});
    if(true){P(arm,G.to(.24,.02),M.c('#F2D9A6'),[Math.sin(0)*.7,-.45,Math.cos(0)*.7],[PI/2.4,0,0])}addOutlines(mob);sc.userData.mobile=arm;
    INTERIOR.lamp(sc,'steh',3.2,0,-2.6,{col:'#FFC88A',i:1.1,d:7});INTERIOR.lamp(sc,'steh',-3.3,0,1.8,{col:'#FFC88A',i:.9,d:6});
    A.push({x:0,z:-.3,r:1.3,label:'Durch das Teleskop schauen',act:observe});A.push({x:-2.6,z:-1.6,r:1.1,label:'Sternbilder-Buch',act:starBook});
    return{W,D,camD:9.5}}

  /* ================= Gewächshaus ================= */
  const STAGE_MIN=4;/* echte Minuten je Wachstumsstufe (3 Stufen) */
  function potPlant(g,m,seed,sc){C(g,.26,.2,.42,m.c('#D98A5E'),[0,.21,0]);P(g,G.to(.26,.04),m.c('#E8A070'),[0,.42,0],[PI/2,0,0]);P(g,G.cy(.24,.24,.04),m.c('#6B4A38'),[0,.4,0]);
    const q=new THREE.Group();try{NATURE[seed.type].b(q,m,{planet:seed.planet},srand(3))}catch(e){}const bb=new THREE.Box3().setFromObject(q);const hgt=Math.max(.2,bb.max.y),wid=Math.max(.2,bb.max.x-bb.min.x,bb.max.z-bb.min.z);
    const s=Math.min(.9/hgt,.7/wid)*(sc||1);q.scale.setScalar(s);q.position.y=.42;g.add(q)}
  function regPots(){if(typeof SEEDS==='undefined'||typeof furn==='undefined')return;for(const s of SEEDS){const id='topf_'+s.type;if(findFurn(id))continue;
    furn(id,{n:'Topf: '+s.n,cat:'pflanze',price:s.price*6,planet:'gewaechshaus',size:[1,1],h:1.2,b:(g,m)=>potPlant(g,m,s)})}}
  const GH=()=>{const a=SAVE.gh=SAVE.gh||[];while(a.length<6)a.push(null);return a};
  const stageOf=b=>b?Math.min(3,Math.floor((Date.now()-b.t0)/60000/STAGE_MIN)):-1;
  function bedPlant(sc,M,bed,slot){const old=slot.userData.plant;if(old){slot.remove(old);disposeTree(old)}slot.userData.plant=null;if(!bed)return;const seed=SEEDS.find(s=>s.id===bed.seed);if(!seed)return;const st=stageOf(bed);
    const q=new THREE.Group();if(st<=0){for(let i=0;i<3;i++){const sp=grp(q,[(i-1)*.18,.02,0]);bt(sp,[0,0,0],[0,.14,0],.018,M.c('#6FBF7A'));P(sp,G.s(.05),M.c('#8FD07A'),[.03,.15,0],null,[1.3,.5,.8])}}
    else{const nat=new THREE.Group();try{NATURE[seed.type].b(nat,M,{planet:seed.planet},srand(3))}catch(e){}const bb=new THREE.Box3().setFromObject(nat);const hgt=Math.max(.2,bb.max.y),wid=Math.max(.2,bb.max.x-bb.min.x,bb.max.z-bb.min.z);
      const s=Math.min(1.5/hgt,1.1/wid)*[0,.4,.7,1][st];nat.scale.setScalar(s);q.add(nat)}
    if(st>=3){const sp=new THREE.Mesh(new THREE.OctahedronGeometry(.08,0),M.glow('#FFE38A',1.6));sp.position.set(.5,1.2,0);sp.userData.spark=1;q.add(sp)}
    q.position.y=.36;slot.add(q);slot.userData.plant=q;addOutlines(q)}
  function buildGH(sc){const W=9,D=7,H=3.6;INTERIOR.makeRoom(sc,W,D,H,'bluemchen','terrakotta',{trim:'#FFFFFF',winArch:true});const A=INTERIOR.actions,Cl=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.78;o.color.set('#F4FFF0')}});{const L=new THREE.DirectionalLight('#FFF4D8',.32);L.position.set(-3,8,4);sc.add(L)}
    /* Glasdach-Sprossen */const fr=M.c('#FFFFFF');for(let i=-3;i<=3;i++)B(sc,.08,.08,D,.02,fr,[i*1.3,H-.05,0]);
    /* Hängepflanzen */for(const x of[-3.4,-1.1,1.1,3.4]){const hp=grp(sc,[x,H-.1,-2.9]);bt(hp,[0,0,0],[0,-.5,0],.01,M.c(PAL.ink));C(hp,.2,.14,.22,M.c('#E8A070'),[0,-.62,0]);P(hp,G.blob(.26,.06,4,x*3|0),M.c('#5FB070'),[0,-.5,0],null,[1,.8,1]);for(let k=0;k<4;k++)bt(hp,[Math.sin(k*1.6)*.2,-.6,Math.cos(k*1.6)*.2],[Math.sin(k*1.6)*.28,-1.1-k*.08,Math.cos(k*1.6)*.28],.025,M.c('#6FBF7A'));addOutlines(hp)}
    const slots=[];const beds=[[-2.7,-1.7],[0,-1.7],[2.7,-1.7],[-2.7,.8],[0,.8],[2.7,.8]];const G6=GH();
    beds.forEach(([x,z],i)=>{const b=grp(sc,[x,0,z]);B(b,1.7,.36,1.1,.06,Wd(M,PAL.wood),[0,.18,0]);B(b,1.54,.04,.94,.02,M.c('#6B4A38'),[0,.36,0]);const tag=grp(b,[.72,0,.56]);bt(tag,[0,0,0],[0,.5,0],.02,Wd(M,PAL.wood));B(tag,.22,.14,.02,.02,M.c('#FFF6E0'),[0,.52,.01]);addOutlines(b);
      const slot=grp(b,[0,0,0]);slots.push(slot);bedPlant(sc,M,G6[i],slot);Cl.push({x0:x-.9,x1:x+.9,z0:z-.6,z1:z+.6});
      const a={x,z:z+1.05,r:1,get label(){const bd=GH()[i];const st=stageOf(bd);if(!bd)return'Setzling einpflanzen';if(st>=3)return'Ernten';const left=Math.max(1,Math.ceil(STAGE_MIN*3-(Date.now()-bd.t0)/60000));return'Wächst noch (~'+left+' Min.)'},act:()=>bedAct(i,slot,sc,M)};A.push(a)});
    sc.userData.gh={slots,M,t:0};INTERIOR.lamp(sc,'steh',-4,0,2.6,{col:'#FFE0A8',i:.8,d:6});
    /* Giesskanne und Säcke */const ck=grp(sc,[3.9,0,2.6]);P(ck,G.cy(.2,.24,.4),M.c('#7EC3E0',{gloss:.6}),[0,.2,0]);bt(ck,[.15,.2,0],[.45,.45,0],.03,M.c('#7EC3E0'));P(ck,G.to(.14,.025,PI),M.c('#5EA3C0'),[0,.42,0],[0,0,0]);addOutlines(ck);
    return{W,D,camD:10}}
  function bedAct(i,slot,sc,M){const g6=GH();const bd=g6[i];const st=stageOf(bd);
    if(!bd){const seeds=SAVE.bag.filter(x=>x.kind==='plant');if(!seeds.length){UI.toast('Du hast keine Setzlinge. Die Gärtnerei jedes Planeten verkauft welche.',3200);SND.play('error');return}
      const w=UI.win('Setzling einpflanzen');const gr=el('div','grid');for(const it of seeds){const c=el('button','card');c.type='button';c.append(itemThumb('plant',it.id),el('span',null,itemName('plant',it.id)),el('span','sub','×'+it.n));
        c.onclick=()=>{if(!bagTake('plant',it.id,1))return;g6[i]={seed:it.id,t0:Date.now()};persist();w.close();SND.play('chop');bedPlant(sc,M,g6[i],slot);UI.toast('Eingepflanzt! In etwa '+STAGE_MIN*3+' Minuten ist es erntereif.',2800)};gr.append(c)}w.body.append(gr);return}
    if(st<3){UI.toast('Braucht noch etwas Zeit. Ein Wachstums-Trank aus dem Labor hilft!',2600);return}
    const seed=SEEDS.find(s=>s.id===bd.seed);regPots();if(!seed||!bagAdd('furn','topf_'+seed.type)){UI.toast('Tasche voll!');return}g6[i]=null;SAVE.stats.harvest=(SAVE.stats.harvest||0)+1;
    let extra='';if(Math.random()<.35&&bagAdd('plant',seed.id))extra=' Dazu ein neuer Setzling!';persist();SND.play('pickup');SND.jingle('j_success');bedPlant(sc,M,null,slot);UI.toast('Geerntet: Topf: '+seed.n+'.'+extra,2800)}
  function frameGH(dt,t){const u=INTERIOR.scene&&INTERIOR.scene.userData.gh;if(!u)return;u.t-=dt;
    for(const s of u.slots){const p=s.userData.plant;if(p)p.traverse(o=>{if(o.userData.spark){o.rotation.y=t*2;o.position.y=1.2+Math.sin(t*3)*.06}})}
    if(u.t<=0){u.t=3;const g6=GH();u.slots.forEach((s,i)=>{const st=stageOf(g6[i]);if(s.userData.st!==st){s.userData.st=st;bedPlant(INTERIOR.scene,u.M,g6[i],s)}})}}

  /* ================= Labor: Tränke ================= */
  const RECIPES=[
    {id:'flink',n:'Flink-Trank',col:'#7FD8FF',need:'fish',needN:'1 Fisch',cost:40,d:'3 Minuten lang superschnell.',fx:()=>{GAME.me.boost=180;UI.toast('Deine Beine kribbeln – du bist superschnell!',2600)}},
    {id:'hopf',n:'Hüpf-Trank',col:'#A6F08A',need:'bug',needN:'1 Insekt',cost:40,d:'3 Minuten lang doppelt so hoch springen.',fx:()=>{GAME.me.hop=180;UI.toast('Du fühlst dich federleicht!',2600)}},
    {id:'funkel',n:'Funkel-Trank',col:'#FFB8E8',need:'relic',needN:'1 Relikt oder Fossil',cost:40,d:'4 Minuten lang funkelst du.',fx:()=>{GAME.me.glitter=240;UI.toast('Du funkelst wie ein Sternbild!',2600)}},
    {id:'wachs',n:'Wachstums-Trank',col:'#FFD85A',need:'frucht',needN:'1 Frucht oder Pilz',cost:40,d:'Alle Beete im Gewächshaus wachsen eine Stufe.',fx:()=>{const g6=GH();let n=0;for(const b of g6)if(b){b.t0-=STAGE_MIN*60000;n++}persist();UI.toast(n?'Die Beete im Gewächshaus wachsen ein gutes Stück!':'Der Trank wartet auf Beete mit Setzlingen … (verpufft)',2800)}}];
  const matches=(it,need)=>need==='frucht'?it.kind==='item'&&['frucht','pilz'].includes((itemDef('item',it.id)||{}).kind):it.kind===need;
  function brewWin(){const w=UI.win('Trank brauen',{size:'wide'});const gr=el('div','grid');
    for(const R of RECIPES){const have=SAVE.bag.find(it=>matches(it,R.need));const c=el('button','card');c.type='button';const sw=el('div');sw.style.cssText='width:56px;height:56px;margin:4px auto;border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 35% 30%,#fff,'+R.col+' 45%,'+darker(R.col,.7)+');box-shadow:0 0 18px '+R.col;
      c.append(sw,el('span',null,R.n),el('span','sub',R.needN+' + '+R.cost+' T'),el('span','sub',R.d));if(!have)c.style.opacity=.55;
      c.onclick=()=>{const it=SAVE.bag.find(x=>matches(x,R.need));if(!it){SND.play('error');UI.toast('Dir fehlt: '+R.needN+'.');return}if(SAVE.money<R.cost){SND.play('error');UI.toast('Zu wenig Taler.');return}
        bagTake(it.kind,it.id,1);money(-R.cost);w.close();brew(R)};gr.append(c)}w.body.append(gr)}
  function brew(R){const u=INTERIOR.scene&&INTERIOR.scene.userData.lab;SND.play('soft',{rate:.55,vol:.8});if(u){u.col.set(R.col);u.boil=2.2}setTimeout(()=>SND.play('soft',{rate:.75,vol:.8}),500);
    setTimeout(()=>{SND.jingle('j_success');SAVE.stats.potions=(SAVE.stats.potions||0)+1;persist();R.fx()},1400)}
  function flask(M,col,s){const g=new THREE.Group();P(g,G.la([[0,0],[.12,0],[.14,.08],[.14,.14],[.05,.26],[.045,.36],[0,.36]].map(([a,b])=>[a*s,b*s])),M.glass('#EAF8FF'));P(g,G.la([[0,.01],[.115,.01],[.13,.08],[.12,.13],[0,.13]].map(([a,b])=>[a*s,b*s])),M.glow(col,1.1));C(g,.05*s,.05*s,.06*s,M.c('#C8A070'),[0,.37*s,0]);return g}
  function buildLab(sc){const W=8,D=7,H=3.6;INTERIOR.makeRoom(sc,W,D,H,'holzpaneel','linoleum',{trim:'#6AA8A0'});const A=INTERIOR.actions,Cl=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.7}});
    /* Kessel mit brodelndem Trank */const k=grp(sc,[0,0,-1]);P(k,G.la([[0,.12],[.5,.14],[.72,.35],[.76,.6],[.66,.86],[.7,.9]]),M.dbl('#4A4458',{gloss:.7}));for(let i=0;i<3;i++){const a=i/3*TAU+.5;bt(k,[Math.sin(a)*.5,.2,Math.cos(a)*.5],[Math.sin(a)*.62,0,Math.cos(a)*.62],.05,M.c('#4A4458'))}
    const col=new THREE.Color('#7FEAA8');const liq=new THREE.Mesh(new THREE.CircleGeometry(.64,28),new THREE.MeshBasicMaterial({color:col,toneMapped:false}));liq.rotation.x=-PI/2;liq.position.y=.84;liq.userData.noOutline=true;k.add(liq);
    const bub=[];for(let i=0;i<7;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),new THREE.MeshBasicMaterial({color:col,toneMapped:false,transparent:true,opacity:.85}));b.userData.noOutline=true;b.userData.ph=i*.9;k.add(b);bub.push(b)}
    const light=new THREE.PointLight('#7FEAA8',.9,5,2);light.position.set(0,1.4,0);k.add(light);P(k,G.to(.7,.06),M.c('#6A6478'),[0,.9,0],[PI/2,0,0]);addOutlines(k);Cl.push({x0:-.85,x1:.85,z0:-1.85,z1:-.15});
    for(let i=0;i<5;i++){const f=grp(k,[Math.sin(i*1.3)*.3,.02,Math.cos(i*1.3)*.3+.05]);P(f,G.co(.06,.22),M.glow('#FF9E4A',1.5),[0,.1,0])}
    /* Regal mit Fläschchen */const sh=grp(sc,[-2.9,0,-3.1]);for(const y of[.9,1.6,2.3])B(sh,1.8,.06,.4,.02,Wd(M,PAL.wood),[0,y,0]);both(s=>B(sh,.06,2.5,.4,.02,Wd(M,PAL.wood),[s*.9,1.25,0]));
    const fc=['#FF8FB1','#7FD8FF','#A6F08A','#FFD85A','#C6A9FF','#FF9E6E'];let n=0;for(const y of[.93,1.63,2.33])for(let i=0;i<4;i++){const f=flask(M,fc[n++%6],1.2+((i+n)%3)*.25);f.position.set(-.62+i*.42,y,0);sh.add(f)}addOutlines(sh);Cl.push({x0:-3.9,x1:-1.9,z0:-3.5,z1:-2.7});
    /* Werkbank mit Mikroskop und Kolben */const wb=grp(sc,[2.7,0,-2.7]);B(wb,2.0,.1,.9,.03,M.c('#E8E4EE'),[0,.86,0]);both(s=>B(wb,.1,.86,.8,.02,M.c('#8E8AA6'),[s*.9,.43,0]));
    const mic=grp(wb,[-.5,.91,0]);B(mic,.34,.05,.3,.02,M.c(PAL.ink),[0,.025,0]);bt(mic,[0,.05,-.1],[0,.45,-.1],.04,M.c(PAL.ink));P(mic,G.cy(.06,.05,.36),M.white(),[0,.46,.02],[.5,0,0]);B(mic,.2,.03,.2,.01,M.steel(),[0,.18,.03]);
    const fl=flask(M,'#FF8FB1',1.6);fl.position.set(.25,.91,.05);wb.add(fl);const f2=flask(M,'#7FD8FF',1.3);f2.position.set(.6,.91,-.15);wb.add(f2);addOutlines(wb);Cl.push({x0:1.6,x1:3.8,z0:-3.2,z1:-2.2});
    /* Tafel mit Formeln */const tafel=ctex('lab-tafel',256,160,(x,w,h)=>{x.fillStyle='#2E4A44';x.fillRect(0,0,w,h);x.strokeStyle='#C8A070';x.lineWidth=8;x.strokeRect(0,0,w,h);x.fillStyle='#EAF6F0';x.font='18px "Trebuchet MS",sans-serif';
      ['Fisch + 40 T = flink','Insekt + 40 T = hüpf','Relikt + 40 T = funkel','Frucht + 40 T = wachs'].forEach((s,i)=>x.fillText(s,18,34+i*32))});
    const tb=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.36),new THREE.MeshBasicMaterial({map:tafel}));tb.position.set(2.7,2.15,-D/2+.02);tb.scale.setScalar(.82);tb.userData.noOutline=true;sc.add(tb);
    INTERIOR.lamp(sc,'steh',-3.4,0,1.8,{col:'#FFE0A8',i:.9,d:6});sc.userData.lab={liq,bub,col,light,boil:0};
    A.push({x:0,z:.1,r:1.4,label:'Trank brauen',act:brewWin});return{W,D,camD:9.5}}
  function frameLab(dt,t){const u=INTERIOR.scene&&INTERIOR.scene.userData.lab;if(!u)return;u.boil=Math.max(0,u.boil-dt);if(u.boil<=0)u.col.lerp(new THREE.Color('#7FEAA8'),dt*.5);
    u.liq.material.color.copy(u.col);u.light.color.copy(u.col);u.light.intensity=.8+Math.sin(t*5)*.15+u.boil*.6;const sp=1+u.boil*1.5;
    u.bub.forEach(b=>{const ph=(t*.6*sp+b.userData.ph)%1;b.position.set(Math.sin(b.userData.ph*3)*.38,.86+ph*(.25+u.boil*.3),Math.cos(b.userData.ph*3)*.38);b.scale.setScalar(.6+ph*.8);b.material.opacity=.85*(1-ph);b.material.color.copy(u.col)})}

  if(typeof INTERIOR!=='undefined'){INTERIOR.kinds.sternwarte={bg:'#141A3E',music:'museum',build:buildSternwarte,frame(dt,t){const m=INTERIOR.scene&&INTERIOR.scene.userData.mobile;if(m)m.rotation.y=t*.25}};
  INTERIOR.kinds.gewaechshaus={bg:'#E6F6E0',music:'home',build:buildGH,frame:frameGH};
  INTERIOR.kinds.labor={bg:'#2A3440',music:'museum',build:buildLab,frame:frameLab}}
  regPots();
  return{DEFS,def,owned,attach,observe,starBook,CONST,RECIPES,regPots}
})();
