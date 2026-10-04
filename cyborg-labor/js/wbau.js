/* =====================================================================
   CYBORG-LABOR · wbau.js
   WIRED-Architektur "Kokon 99": NEMURI baut die Dörfer der alten Planeten
   aus Spielzeug von 1999 nach. Ersetzt die Fachwerk-, Stein- und
   Holzhäuser von Kompost, Schrott, Korallen, Frost, Wüste und Pilz.
   Vier Grundformen, alle aus glänzendem Bonbon-Plastik mit Chrom:
     kapsel  – abgerundeter Block mit halbrundem Gel-Dach
     ei      – Ei-Haus mit Bauchband und Bullaugen
     stapel  – gestapelte Spielzeugklötze in zwei, drei Farben
     kuppel  – Kuppel auf rundem Sockel mit Fensterring
   Jedes Haus: runde Bullaugen-Fenster, Gel-Tür mit Knopf, LCD-Namensschild
   über der Tür, Antenne oder Schüssel. Planeten-Eigenheiten: Schnee auf
   Frost, Sandsockel in der Wüste, Stelzen bei den Korallen, Sporenpunkte
   auf Pilz, Nieten und Rohre auf Schrott.
   Tür zeigt nach −z (Vorgabe von HAUS.FAMX).
   ===================================================================== */
(function(){
  if(typeof HAUS==='undefined')return;
  const V=THREE.Vector3;
  const CAND=['#2fb5d9','#9b6ae0','#ff9a45','#7fd34a','#ff6fa5','#ffd23f'];
  const WALL=['#fbf7f0','#f2f8ff','#fff1f6','#f3fbea','#f7f2ff'];
  const PLANET={kompost:{acc:['#7fd34a','#ff6fa5','#ffd23f','#ff9a45']},schrott:{acc:['#9b6ae0','#2fb5d9','#8e94b0'],rivets:1},korallen:{acc:['#ff6fa5','#2fb5d9','#ff9a45'],stilts:1},
    frost:{acc:['#2fb5d9','#9b6ae0','#ff6fa5'],snow:1},urzeit:{acc:['#ff9a45','#7fd34a','#ffd23f']},dschungel:{acc:['#7fd34a','#2fb5d9','#9b6ae0'],vines:1},metro:{acc:['#2fb5d9','#ff6fa5','#9b6ae0']},neonarkade:{acc:['#ff6fd8','#45e0ff','#9b6ae0','#ffd23f']},magnetbahn:{acc:['#ff4a5a','#2fb5d9','#9b6ae0','#ffd23f']},funkturm:{acc:['#ff4a5a','#2fb5d9','#ffd23f','#7fd34a']},kaufhaus:{acc:['#ff6fa5','#2fb5d9','#9b6ae0','#ffd23f']},dinofabrik:{acc:['#7fd34a','#ff9a45','#2fb5d9','#ffd23f','#ff6fa5']},bernstein:{acc:['#ffb43a','#ff9a2a','#ffd27a','#e8862a']},pluesch:{acc:['#ff8fb8','#8fd0ff','#ffd27a','#b89af0','#9ee08a']},wueste:{acc:['#ff9a45','#ffd23f','#2fb5d9'],sand:1},pilz:{acc:['#9b6ae0','#ff6fa5','#7fd34a'],spots:1}};
  let MM=null;const mats=()=>MM||(MM=makeMats({skin:'plastik',color:0}));
  const gel=(M,c)=>M.c(c,{gloss:1.35,rim:1.15,rimColor:'#ffffff'});
  const pl=(M,c)=>M.c(c,{gloss:.9,rim:.8,rimColor:'#ffffff'});
  const ch=M=>M.chrome?M.chrome():M.c('#e6ecf5',{gloss:1.4});
  const add=(g,geo,mat,p,r,s)=>P(g,geo,mat,p,r,s);
  /* LCD-Namensschild */
  function lcd(g,M,txt,w,p){const t=ctex('wb-lcd-'+txt,192,64,(x,W,H)=>{x.fillStyle='#c9f27a';x.fillRect(0,0,W,H);x.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<H;i+=4)x.fillRect(0,i,W,1);
      x.fillStyle='#1d2b0b';x.font='bold 30px "VT323","Courier New",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,W/2,H/2+2)});
    const f=grp(g,p);add(f,G.bx(w+.08,w*.36+.08,.06,.02),ch(M),[0,0,-.01]);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.33),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));m.position.z=-.045;m.rotation.y=PI;m.userData.noOutline=true;f.add(m);return f}
  /* rundes Bullauge in einer Wand; n = Blickrichtung (x,z) */
  function port(g,M,p,r,n){const q=grp(g,p,[0,Math.atan2(n[0],n[1]),0]);add(q,G.to(r,r*.2),ch(M),[0,0,0]);const gl=add(q,G.circ(r*.92),M.c('#8fe3ff',{gloss:1.5,rim:1,rimColor:'#ffffff'}),[0,0,-.01]);
    const hl=add(q,G.circ(r*.28),M.flat('#ffffff'),[r*.35,r*.35,.02]);hl.userData.noOutline=true;return q}
  /* Gel-Tür mit Knopf, Front bei z */
  function door(g,M,x,z,col,h){const q=grp(g,[x,0,z],[0,PI,0]);const w=.78,hh=h||1.36;add(q,G.bx(w+.16,hh+.1,.08,.06),ch(M),[0,(hh+.1)/2,-.02]);add(q,G.bx(w,hh,.1,.08),gel(M,col),[0,hh/2,.01]);
    add(q,G.s(.07),M.c('#ffd23f',{gloss:1.5,rim:1}),[w*.32,hh*.48,.08]);add(q,G.bx(w*.6,.06,.04,.02),M.c('#ffffff',{gloss:1}),[0,hh*.78,.07]);return q}
  function antenna(g,M,y,r){const q=grp(g,[0,y,0]);add(q,G.cy(.03,.04,.9),ch(M),[0,.45,0]);if(r()<.5){add(q,G.s(.11),M.glow('#ff6fa5',1.6),[0,.95,0])}else{const d=grp(q,[0,.8,0],[-.7,r()*6,0]);add(d,G.hs(.32),pl(M,'#f2f4f8'),[0,0,0],[PI,0,0],[1,.35,1]);add(d,G.cy(.02,.02,.3),ch(M),[0,.12,0])}}
  function rivets(g,M,y,R,n){for(let i=0;i<n;i++){const a=i/n*TAU;add(g,G.s(.05),ch(M),[Math.cos(a)*R,y,Math.sin(a)*R])}}
  function spots(g,M,cy,R,k,col,r){for(let i=0;i<k;i++){const th=.3+r()*1.1,ph=r()*TAU;const n=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));const s=add(g,G.circ(.12+r()*.12),M.c(col,{gloss:1}),[n.x*R*1.005,cy+n.y*R*1.005,n.z*R*1.005]);s.lookAt(n.x*R*3,cy+n.y*R*3,n.z*R*3)}}

  /* ---------- Grundformen ---------- */
  function kapsel(g,M,o){const{w,d,h,wall,acc,r}=o;add(g,G.bx(w,h,d,.32),pl(M,wall),[0,h/2,0]);
    const rg=new THREE.CylinderGeometry(d/2+.08,d/2+.08,w+.2,28,1,false,0,PI);rg.rotateZ(PI/2);add(g,rg,gel(M,acc),[0,h,0]);
    for(const sx of[-1,1])add(g,G.to(d/2+.08,.07,PI),ch(M),[sx*(w/2+.1),h,0],[0,PI/2,0]);add(g,G.bx(w+.14,.12,d+.14,.05),ch(M),[0,.06,0]);
    const nW=Math.max(1,Math.round(w/1.3));for(let i=0;i<nW;i++){const x=(i-(nW-1)/2)*(w/nW);if(Math.abs(x)<.6&&nW%2)continue;port(g,M,[x,h*.6,-d/2-.01],.26,[0,-1])}
    for(const sx of[-1,1])port(g,M,[sx*(w/2+.01),h*.6,0],.26,[sx,0]);return{top:h+d/2+.08,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,h+d/2,d/2))],hw:w/2,hd:d/2}}
  function ei(g,M,o){const{h,wall,acc,r}=o;const R=o.w*.55;const pts=[[0,0]];const t0=.24;const y0=(1-Math.cos(t0*PI))/2*h*1.5;for(let i=0;i<=16;i++){const t=t0+(1-t0)*i/16;const a=t*PI;const rr=Math.sin(a)*R*(1-.18*t);pts.push([Math.max(.001,rr),(1-Math.cos(a))/2*h*1.5-y0])}
    add(g,G.la(pts,28),pl(M,wall),[0,0,0]);const rAt=y=>{for(let i=1;i<pts.length;i++)if(pts[i][1]>=y)return pts[i][0];return R};add(g,G.to(rAt(h*.55),.16),gel(M,acc),[0,h*.55,0],[PI/2,0,0]);add(g,G.cy(R*.92,R*.98,.14),ch(M),[0,.07,0]);
    for(let i=0;i<5;i++){const a=PI/2+(i-2)*.75;if(i===2)continue;port(g,M,[Math.cos(a)*rAt(h*.85)*.99,h*.85,-Math.sin(a)*rAt(h*.85)*.99],.22,[Math.cos(a),-Math.sin(a)])}
    add(g,G.s(.22),gel(M,acc),[0,h*1.5-y0+.08,0]);return{top:h*1.5-y0+.3,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,h*1.4-y0,R))],hw:R,hd:rAt(.7)-.06}}
  function stapel(g,M,o){const{w,d,h,wall,acc,r}=o;const c2=o.acc2;const h1=h*.62,h2=h*.52;add(g,G.bx(w,h1,d,.22),pl(M,wall),[0,h1/2,0]);
    const sx=(r()-.5)*.5,w2=w*.72,d2=d*.8;add(g,G.bx(w2,h2,d2,.22),gel(M,acc),[sx,h1+h2/2,(r()-.5)*.3]);
    /* Noppen wie bei Bauklötzen */for(let i=0;i<2;i++)for(let j=0;j<2;j++)add(g,G.cy(.22,.22,.16),gel(M,c2),[sx+(i-.5)*w2*.5,h1+h2+.08,(j-.5)*d2*.5]);
    add(g,G.bx(w+.1,.1,d+.1,.04),ch(M),[0,h1,0]);for(const x of[-w*.3,w*.3])port(g,M,[x,h1*.55,-d/2-.01],.25,[0,-1]);port(g,M,[sx,h1+h2*.5,-d2/2-.01],.24,[0,-1]);
    return{top:h1+h2+.16,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,h1+h2,d/2))],hw:w/2,hd:d/2}}
  function kuppel(g,M,o){const{h,wall,acc,r}=o;const R=o.w*.55;add(g,G.cy(R,R*1.04,h*.55),pl(M,wall),[0,h*.275,0]);add(g,G.hs(R*1.02),gel(M,acc),[0,h*.55,0]);
    add(g,G.to(R*1.02,.08),ch(M),[0,h*.55,0],[PI/2,0,0]);add(g,G.to(R*1.04,.08),ch(M),[0,.06,0],[PI/2,0,0]);
    for(let i=0;i<6;i++){const a=i/6*TAU+PI/6;if(Math.abs(Math.sin(a)+1)<.3)continue;port(g,M,[Math.cos(a)*R*1.0,h*.32,Math.sin(a)*R*1.0],.2,[Math.cos(a),Math.sin(a)])}
    for(let i=0;i<5;i++){const a=i/5*TAU;const q=add(g,G.s(.18),M.c('#8fe3ff',{gloss:1.5,rim:1}),[Math.cos(a)*R*.72,h*.55+R*.62,Math.sin(a)*R*.72],null,[1,.5,1])}
    return{top:h*.55+R,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,h*.55+R*.8,R))],hw:R,hd:R}}
  /* ---------- Spielzeug-Urzeit ---------- */
  function dinoei(g,M,o){const res=ei(g,M,o);const R=o.w*.55;const n=14;for(let i=0;i<n;i++){const a=i/n*TAU;const y=o.h*.62+(i%2?.12:0);add(g,G.cy(0,.11,.22),gel(M,'#fffdf7'),[Math.cos(a)*R*.95,y,Math.sin(a)*R*.95],[i%2?PI:0,0,0])}
    for(let i=0;i<8;i++){const a=i*2.4,y=.4+(i%4)*.45;add(g,G.circ(.16),M.c(o.acc2,{gloss:1}),[Math.cos(a)*R*.93,y,Math.sin(a)*R*.93],[0,-a+PI/2,0])}return res}
  function vulkan(g,M,o){const{h}=o;const R=o.w*.62,H=h*1.3;add(g,G.la([[0,0],[R,0],[R*.92,H*.15],[R*.55,H*.75],[R*.34,H],[0,H]],28),pl(M,'#c98a5a'),[0,0,0]);add(g,G.cy(R*.34,R*.34,.06),M.glow('#ff9a45',1.6),[0,H+.01,0]);
    for(let i=0;i<5;i++){const a=i/5*TAU+.3;const r0=R*.34,r1=R*.62;add(g,G.tu([[Math.cos(a)*r0,H,Math.sin(a)*r0],[Math.cos(a)*(r0+r1)/2,H*.72,Math.sin(a)*(r0+r1)/2],[Math.cos(a+.1)*r1,H*.45-(i%2)*.2,Math.sin(a+.1)*r1]],.09,.07),gel(M,i%2?'#ff9a45':'#ff6fa5'))}
    for(const x of[-.75,.75])port(g,M,[x,h*.5,-R*.84],.24,[0,-1]);return{top:H,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,H*.8,R))],hw:R,hd:R*.84}}
  function knochen(g,M,o){const{h}=o;const R=o.w*.58;add(g,G.hs(R),pl(M,'#ffe3b8'),[0,0,0]);const bone=M.c('#fffdf7',{gloss:.9,rim:.9,rimColor:'#ffffff'});
    for(let i=0;i<4;i++){const a=i/4*PI+PI/8;const pts=[];for(let k=0;k<=10;k++){const t=k/10*PI;pts.push([Math.cos(t)*R*1.08*Math.cos(a),Math.sin(t)*R*1.15,Math.cos(t)*R*1.08*Math.sin(a)])}add(g,G.tu(pts,.11,.11,24),bone);
      for(const e of[pts[0],pts[10]])for(const s of[-1,1])add(g,G.s(.15),bone,[e[0]+s*.1*Math.sin(a),.12,e[2]-s*.1*Math.cos(a)])}
    port(g,M,[.8,R*.55,-R*.78],.24,[.3,-1]);return{top:R*1.2,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,R,R))],hw:R,hd:R*.95}}
  /* ---------- Überwucherter Kokon-95-Server ---------- */
  const ledRows=(g,M,x0,x1,y0,y1,z,cols)=>{for(let y=y0;y<=y1;y+=.22)for(let x=x0;x<=x1;x+=.16)add(g,G.bx(.07,.05,.02,.01),M.glow(cols[Math.floor((x*7+y*11)*10)%cols.length],1.5),[x,y,z])};
  function serverturm(g,M,o){const w=o.w*.72,d=o.d*.8,H=o.h*1.55;add(g,G.bx(w,H,d,.12),pl(M,'#3b3450'),[0,H/2,0]);add(g,G.bx(w+.1,.12,d+.1,.05),ch(M),[0,H,0]);add(g,G.bx(w+.1,.12,d+.1,.05),ch(M),[0,.06,0]);
    ledRows(g,M,-w/2+.2,w/2-.2,1.7,H-.3,-d/2-.012,['#7fd34a','#ffd23f','#2fb5d9']);for(let i=0;i<4;i++)add(g,G.bx(w*.8,.03,.02,.01),ch(M),[0,1.6+i*.5,-d/2-.012]);
    return{top:H,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function crt(g,M,o){const w=o.w*1.05,d=o.d*1.05,H=o.h*1.55;add(g,G.bx(w,H,d,.3),pl(M,'#e8e1d0'),[0,H/2,0]);add(g,G.bx(w*.7,H*.5,d*.5,.2),pl(M,'#d8d0bc'),[0,H*.45,d*.55]);
    const t=ctex('wb-crt',256,192,(x,W,Hh)=>{x.fillStyle='#10200a';x.fillRect(0,0,W,Hh);x.fillStyle='#7fd34a';x.font='bold 30px "VT323","Courier New",monospace';x.fillText('KOKON 95',18,48);x.fillText('C:\\> HALLO_',18,96);x.fillText('23:59',18,144);x.fillStyle='rgba(127,211,74,.12)';for(let i=0;i<Hh;i+=4)x.fillRect(0,i,W,2)});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(w*.66,H*.36),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));s.position.set(0,H*.74,-d/2-.012);s.rotation.y=PI;s.userData.noOutline=true;g.add(s);
    add(g,G.bx(w*.72,H*.4,.05,.06),ch(M),[0,H*.74,-d/2+.01]);for(const x of[w*.32,w*.4])add(g,G.cy(.06,.06,.06),gel(M,x>w*.35?'#ff6fa5':'#7fd34a'),[x,H*.22,-d/2-.02],[PI/2,0,0]);
    return{top:H,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d*.85))],hw:w/2,hd:d/2}}
  function modem(g,M,o){const w=o.w*1.15,d=o.d,H=o.h*.95;add(g,G.bx(w,H,d,.25),pl(M,'#d8d2e8'),[0,H/2,0]);add(g,G.bx(w*.92,.16,d*.92,.06),pl(M,o.acc),[0,H+.06,0]);
    ledRows(g,M,-w/2+.25,w/2-.25,H*.62,H*.62,-d/2-.012,['#7fd34a','#ff6fa5','#ffd23f']);for(const x of[-w*.35,w*.35])for(const z of[-d*.25,d*.25]){add(g,G.cy(.03,.03,.9),ch(M),[x,H+.55,z]);add(g,G.s(.07),gel(M,'#ff6fa5'),[x,H+1.0,z])}
    for(const x of[-w*.25,w*.25])port(g,M,[x,H*.4,-d/2-.01],.2,[0,-1]);return{top:H+1,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  /* Ranken und Kabel, die über das Dach hängen */
  function ranken(g,M,res,r){const R=Math.max(res.hw,res.hd);for(let i=0;i<5;i++){const a=r()*TAU;const x=Math.cos(a)*R*.85,z=Math.sin(a)*R*.85;const top=res.top-.1;const pts=[[x*.3,top+.05,z*.3],[x,top,z],[x*1.08,top*.6,z*1.08],[x*1.04,top*.25+r()*.4,z*1.04]];
      add(g,G.tu(pts,.05,.04,16),gel(M,i%2?'#3fae55':'#2fb5d9'));for(let k=0;k<3;k++){const p=pts[1+k];add(g,G.s(.13),gel(M,'#7fd34a'),[p[0],p[1],p[2]],null,[1.4,.6,1])}}
    add(g,G.s(Math.min(R,1.2)*.7),gel(M,'#7fd34a'),[0,res.top+.15,0],null,[1.3,.45,1.1])}
  /* ---------- Y2K-Metro ---------- */
  function kapselturm(g,M,o){const H=o.h*2.2;add(g,G.cy(.18,.22,H),ch(M),[0,H/2,0]);const pods=[];const n=3;for(let i=0;i<n;i++){const y=.0+i*H/n*.95;const w=(o.w*.95)-i*.25,d=(o.d*.95)-i*.2,hh=H/n*.78;
      add(g,G.bx(w,hh,d,.45),gel(M,[o.acc,o.acc2,'#fffdf7'][i%3]),[0,y+hh/2,0]);add(g,G.bx(w+.08,.08,d+.08,.04),ch(M),[0,y+.04,0]);for(const x of[-w*.28,w*.28])port(g,M,[x,y+hh*.55,-d/2-.01],.2,[0,-1])}
    return{top:H+.2,walls:[new THREE.Box3(new V(-o.w*.48,0,-o.d*.48),new V(o.w*.48,H,o.d*.48))],hw:o.w*.48,hd:o.d*.48}}
  function blob(g,M,o){const R=o.w*.62;add(g,G.cy(R*.7,R*.8,.4),ch(M),[0,.2,0]);add(g,G.s(R),gel(M,o.acc),[0,R*.72+.2,0],null,[1,.78,1]);add(g,G.to(R*1.0,.07),ch(M),[0,R*.72+.2,0],[PI/2,0,0]);
    for(let i=0;i<5;i++){const a=i/5*TAU+PI/5;if(Math.abs(a-PI*1.5)<.5)continue;port(g,M,[Math.cos(a)*R*.97,R*.95,Math.sin(a)*R*.97],.22,[Math.cos(a),Math.sin(a)])}
    return{top:R*1.6+.2,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,R*1.4,R))],hw:R,hd:R*.8}}
  function slab(g,M,o){const w=o.w*.85,d=o.d*.55,H=o.h*1.9;add(g,G.bx(w,H,d,.35),pl(M,'#fbfbfd'),[0,H/2,0]);add(g,G.bx(w*.7,H*.32,.05,.1),M.c('#8fe3ff',{gloss:1.5,rim:1,rimColor:'#ffffff'}),[0,H*.72,-d/2-.01]);
    add(g,G.cy(w*.24,w*.24,.05),pl(M,'#d8dce6'),[0,H*.36,-d/2-.01],[PI/2,0,0]);add(g,G.cy(w*.08,w*.08,.06),pl(M,'#fbfbfd'),[0,H*.36,-d/2-.02],[PI/2,0,0]);
    return{top:H,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  /* ---------- Neon-Arkade ---------- */
  const glowTex=(key,txt,fg,bg)=>ctex('wb-nt-'+key,256,64,(x,w,h)=>{x.fillStyle=bg||'#1b1035';x.fillRect(0,0,w,h);x.font='900 40px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor=fg;x.shadowBlur=14;x.fillStyle=fg;x.fillText(txt,w/2,h/2+2)});
  function automat(g,M,o){const w=o.w*.85,d=o.d*.9,H=o.h*1.65;add(g,G.bx(w,H,d,.14),pl(M,o.acc),[0,H/2,0]);add(g,G.bx(w*.9,H*.9,.06,.05),pl(M,'#2b2340'),[0,H*.48,-d/2+.01]);
    const mq=new THREE.Mesh(new THREE.PlaneGeometry(w*.86,.42),new THREE.MeshBasicMaterial({map:glowTex('mq','ARKADE','#ff6fd8'),toneMapped:false}));mq.position.set(0,H-.32,-d/2-.02);mq.rotation.y=PI;mq.userData.noOutline=true;g.add(mq);
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(w*.6,.62),new THREE.MeshBasicMaterial({map:glowTex('sc','1UP 23:59','#7fd34a','#0b1530'),toneMapped:false}));sc.position.set(0,H-1.02,-d/2-.02);sc.rotation.y=PI;sc.userData.noOutline=true;g.add(sc);
    add(g,G.bx(w*.88,.18,.5,.05),pl(M,'#3b3450'),[0,H-1.62,-d/2-.18],[-.35,0,0]);add(g,G.cy(.025,.025,.2),ch(M),[-w*.25,H-1.48,-d/2-.24]);add(g,G.s(.07),gel(M,'#ff3b6b'),[-w*.25,H-1.36,-d/2-.24]);
    for(let i=0;i<3;i++)add(g,G.cy(.05,.05,.04),gel(M,['#ffd23f','#2fb5d9','#7fd34a'][i]),[w*.05+i*.13,H-1.54,-d/2-.27],[-.35,0,0]);
    for(const x of[-w/2-.01,w/2+.01])add(g,G.bx(.03,H*.92,.06,.01),M.glow('#45e0ff',1.6),[x,H*.48,-d/2+.06]);
    return{top:H,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function handheld(g,M,o){const w=o.w*.95,d=o.d*.55,H=o.h*1.6;add(g,G.bx(w,H,d,.4),pl(M,'#e8e2d4'),[0,H/2,0]);add(g,G.bx(w*.78,H*.34,.05,.12),pl(M,'#8b93a6'),[0,H*.72,-d/2-.01]);
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(w*.58,H*.26),new THREE.MeshBasicMaterial({map:glowTex('gb','KOKON','#1d2b0b','#9bbc0f'),toneMapped:false}));sc.position.set(0,H*.72,-d/2-.04);sc.rotation.y=PI;sc.userData.noOutline=true;g.add(sc);
    const dp=grp(g,[-w*.3,H*.46,-d/2-.03]);add(dp,G.bx(.42,.13,.08,.03),pl(M,'#3b3450'),[0,0,0]);add(dp,G.bx(.13,.42,.08,.03),pl(M,'#3b3450'),[0,0,0]);
    for(const[x,y]of[[w*.24,H*.48],[w*.36,H*.53]])add(g,G.cy(.11,.11,.08),gel(M,'#c22c46'),[x,y,-d/2-.03],[PI/2,0,0]);
    return{top:H,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  /* ---------- Plüsch-Planet: Häuser aus Stoff, mit Naht, Knopfaugen und Reissverschluss ---------- */
  const fluff=(M,c)=>M.c(c,{gloss:.12,rim:1.1,rimColor:'#ffffff'});
  const stitch=(g,M,pts,col)=>{for(let i=0;i<pts.length-1;i+=2){const a=new V(...pts[i]),b=new V(...pts[i+1]);const m=add(g,G.bx(.05,.05,a.distanceTo(b)*.7,.02),M.c(col||'#fffdf7'),[(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2]);m.lookAt(b.x,b.y,b.z);m.userData.noOutline=true}};
  const button=(g,M,p,r,col,n)=>{const q=grp(g,p,[0,Math.atan2(n[0],n[1]),0]);add(q,G.cy(r,r,.07),M.c(col,{gloss:1.2,rim:.8}),[0,0,0],[PI/2,0,0]);for(const[x,y]of[[-1,-1],[1,-1],[-1,1],[1,1]])add(q,G.cy(r*.12,r*.12,.08),M.c('#fffdf7'),[x*r*.28,y*r*.28,-.01],[PI/2,0,0]);return q};
  function teddy(g,M,o){const R=o.w*.6;const col=A_PL(o.r);add(g,G.s(R),fluff(M,col),[0,R*.86,0],null,[1,.9,.95]);add(g,G.s(R*.6),fluff(M,'#fff3e6'),[0,R*.62,-R*.45],null,[1,1.05,.6]);
    for(const s of[-1,1]){add(g,G.s(R*.32),fluff(M,col),[s*R*.7,R*1.55,0]);add(g,G.s(R*.18),fluff(M,o.acc),[s*R*.7,R*1.55,-R*.18],null,[1,1,.5])}
    for(const s of[-1,1])button(g,M,[s*R*.34,R*1.42,-R*.74],.17,'#2b2340',[0,-1]);add(g,G.s(.18),M.c('#3b3450',{gloss:1}),[0,R*1.24,-R*.86],null,[1.3,.8,.8]);
    const seam=[];for(let k=0;k<=24;k++){const t=k/24*PI;seam.push([Math.cos(t)*R*1.01,R*.86+Math.sin(t)*R*.91,0])}stitch(g,M,seam);
    for(const s of[-1,1])add(g,G.s(R*.3),fluff(M,col),[s*R*.62,.22,-R*.55],null,[1,.6,1.2]);
    return{top:R*1.9,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,R*1.6,R))],hw:R,hd:R*.8}}
  function kissen(g,M,o){const w=o.w*1.05,d=o.d,H=o.h*1.1;const cc=A_PL(o.r);add(g,G.bx(w,H,d,.6),fluff(M,cc),[0,H/2,0]);
    add(g,G.bx(w*.92,.5,d*.9,.24),fluff(M,o.acc),[0,H+.12,0]);for(const x of[-w*.28,w*.28])for(const y of[H*.3,H*.72])button(g,M,[x,y,-d/2-.02],.13,o.acc2,[0,-1]);
    for(const sx of[-1,1])for(const sz of[-1,1]){add(g,G.cy(.02,.02,.3),ch(M),[sx*(w/2-.12),H+.42,sz*(d/2-.12)]);add(g,G.s(.15),fluff(M,o.acc2),[sx*(w/2-.12),H+.6,sz*(d/2-.12)])}
    stitch(g,M,range(25,t=>[(t-.5)*w*.9,H-.05,-d/2-.03]));port(g,M,[0,H*.62,-d/2-.02],.24,[0,-1]);
    return{top:H+.6,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function knaeuel(g,M,o){const R=o.w*.62;add(g,G.s(R),fluff(M,o.acc),[0,R*.9,0]);const yc=M.c(o.acc2,{gloss:.2,rim:.9,rimColor:'#ffffff'});
    for(let i=0;i<7;i++){const a=i/7*PI;const pts=[];for(let k=0;k<=20;k++){const t=k/20*TAU;const v=new V(Math.cos(t),Math.sin(t),0).applyAxisAngle(new V(0,1,0),a).applyAxisAngle(new V(1,0,0),.5+i*.3);pts.push([v.x*R*1.01,R*.9+v.y*R*1.01,v.z*R*1.01])}add(g,G.tu(pts,.05,.05,40),i%2?yc:fluff(M,o.acc))}
    const tail=[[R*.7,R*.3,-R*.6],[R*1.2,.15,-R*.9],[R*1.7,.06,-R*.5],[R*2.0,.06,-R*1.1]];add(g,G.tu(tail,.07,.07,16),yc);add(g,G.cy(.04,.05,R*2.2),ch(M),[-R*.5,R*1.4,0],[0,0,.7]);add(g,G.cy(.04,.05,R*2.2),ch(M),[-R*.3,R*1.45,.2],[.3,0,.9]);
    for(const a of[-.6,.6])port(g,M,[Math.sin(a)*R*.98,R*1.0,-Math.cos(a)*R*.98],.22,[Math.sin(a),-Math.cos(a)]);
    return{top:R*1.9,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,R*1.7,R))],hw:R,hd:R*.85}}
  const A_PL=r=>['#c98a5a','#f2b8d0','#a8d8f0','#f2e0a8','#c8b0f0'][Math.floor(r()*5)];
  /* ---------- Bernstein-Mond: Harztropfen, Ammoniten und Harz-Baumstümpfe ---------- */
  const amber=(M,c)=>M.c(c||'#ffb43a',{gloss:1.5,rim:1.3,rimColor:'#fff2c0'});
  function blatt(g,M,p,s,rot){const q=grp(g,p,rot);const sh=new THREE.Shape();sh.moveTo(0,-.5);sh.quadraticCurveTo(.35,-.1,0,.5);sh.quadraticCurveTo(-.35,-.1,0,-.5);
    const m=add(q,new THREE.ShapeGeometry(sh,10),M.c('#8a4a12',{opacity:.55}),[0,0,0],null,[s,s,s]);m.userData.noOutline=true;add(q,G.bx(.015*s,.9*s,.01,0),M.c('#6a3410',{opacity:.6}),[0,0,.005]).userData.noOutline=true;return q}
  function tropfen(g,M,o){const R=o.w*.58,yc=R*.95,H=R*2.9;const pts=[[0,0]];for(let k=0;k<=26;k++){const y=k/26*H;const r=y<yc?Math.sqrt(Math.max(0,R*R-(y-yc)*(y-yc))):R*Math.pow(1-(y-yc)/(H-yc),1.25);pts.push([Math.max(.001,r),y])}
    add(g,G.la(pts,28),amber(M,o.acc),[0,0,0]);add(g,G.to(R*.98,.1),ch(M),[0,.12,0],[PI/2,0,0]);
    blatt(g,M,[R*.3,R*1.2,-R*.93],R*.9,[0,PI,.4]);for(const a of[-.75,.75])port(g,M,[Math.sin(a)*R*.97,R*.85,-Math.cos(a)*R*.97],.22,[Math.sin(a),-Math.cos(a)]);
    for(let i=0;i<4;i++){const a=i*1.7;add(g,G.s(.07+i*.02),M.c('#fff2c0',{opacity:.7,gloss:1.4}),[Math.cos(a)*R*.94,R*(.4+i*.25),Math.sin(a)*R*.94])}
    return{top:R*2.85,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,R*1.8,R))],hw:R,hd:R*.95}}
  function ammonit(g,M,o){const R=o.w*.62;const rr=t=>R*.68*Math.exp(-(1-t)*1.7);const tR=rr(1)*.45;const sh=grp(g,[0,R+.05,0]);const n=60;const pts=[];
    for(let i=0;i<=n;i++){const t=i/n;const a=-t*TAU*2.1+PI*.5;pts.push([Math.cos(a)*rr(t),Math.sin(a)*rr(t),0])}
    const shell=pl(M,'#f2dcc0');add(sh,G.tu(pts,rr(0)*.45,tR,90),shell);add(sh,G.cy(rr(1)*.62,rr(1)*.62,tR*1.1,32),pl(M,'#ead2b0'),[0,0,0],[PI/2,0,0]);
    for(let i=8;i<=n;i+=4){const t=i/n;const a=-t*TAU*2.1+PI*.5;const tub=rr(t)*.45;const q=grp(sh,[Math.cos(a)*rr(t),Math.sin(a)*rr(t),0],[0,0,a]);add(q,G.to(tub*1.02,tub*.12,TAU),i%8?pl(M,'#d8b890'):amber(M,o.acc),[0,0,0],[PI/2,0,0])}
    add(sh,G.s(tR*.5),amber(M,o.acc),[0,0,-tR*.15],null,[1,1,.6]);{const a=-TAU*2.1+PI*.5;const q=grp(sh,[Math.cos(a)*rr(1),Math.sin(a)*rr(1),0],[0,0,a]);add(q,G.cy(tR*.92,tR*.92,.12,24),amber(M,o.acc),[0,0,0])}
    add(g,G.bx(R*1.5,.24,tR*2.2,.08),ch(M),[0,.12,0]);port(g,M,[-R*.55,R*1.35,-tR*.92],.2,[0,-1]);
    return{top:R*2+.1,walls:[new THREE.Box3(new V(-R,0,-tR),new V(R,R*2,tR))],hw:R,hd:tR}}
  function harzstumpf(g,M,o){const R=o.w*.55,H=o.h*1.2;add(g,G.cy(R*.92,R*1.08,H,24),pl(M,'#b8875a'),[0,H/2,0]);add(g,G.cy(R*.92,R*.92,.1,24),pl(M,'#f2d6a8'),[0,H+.03,0]);
    for(let k=1;k<4;k++)add(g,G.to(R*.92*k/4,.025,TAU,24),pl(M,'#c89868'),[0,H+.09,0],[PI/2,0,0]);
    for(let i=0;i<6;i++){const a=i/6*TAU+.3;if(Math.abs(a-PI*1.5)<.45)continue;const L=.5+o.r()*.6;add(g,G.tu([[Math.cos(a)*R*.95,H+.05,Math.sin(a)*R*.95],[Math.cos(a)*R*1.0,H-L*.5,Math.sin(a)*R*1.0],[Math.cos(a)*R*1.0,H-L,Math.sin(a)*R*1.0]],.09,.06,10),amber(M,o.acc));add(g,G.s(.11),amber(M,o.acc),[Math.cos(a)*R*1.0,H-L,Math.sin(a)*R*1.0],null,[1,1.3,1])}
    for(let i=0;i<4;i++){const a=i/4*TAU+.8;add(g,G.tu([[Math.cos(a)*R,.3,Math.sin(a)*R],[Math.cos(a)*R*1.4,.15,Math.sin(a)*R*1.4],[Math.cos(a)*R*1.7,.05,Math.sin(a)*R*1.7]],.18,.06,10),pl(M,'#a8774a'))}
    add(g,G.s(R*.5),amber(M,'#ffd27a'),[0,H+.25,0],null,[1,.4,1]);for(const a of[-.8,.8])port(g,M,[Math.sin(a)*R*1.0,H*.55,-Math.cos(a)*R*1.0],.22,[Math.sin(a),-Math.cos(a)]);
    return{top:H+.5,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,H,R))],hw:R*1.02,hd:R*1.02}}
  /* ---------- Dino-Spielzeugfabrik: Fabrikhalle, Spielzeugkiste, Dino-Haus ---------- */
  function fabrik(g,M,o){const w=o.w*1.15,d=o.d*1.05,H=o.h*.95;add(g,G.bx(w,H,d,.18),pl(M,o.wall),[0,H/2,0]);const n=3;
    for(let i=0;i<n;i++){const x=-w/2+w/n*(i+.5);const q=grp(g,[x,H,0]);const sh=new THREE.Shape();sh.moveTo(-w/n/2,0);sh.lineTo(w/n/2,0);sh.lineTo(w/n/2,.75);sh.closePath();
      const geo=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);add(q,geo,gel(M,i%2?o.acc:o.acc2),[0,0,0]);add(q,G.bx(.05,.62,d*.9,.01),M.c('#8fe3ff',{gloss:1.5,rim:1}),[w/n/2-.03,.36,0])}
    const cx=w*.3;add(g,G.cy(.26,.32,H+1.3,16),pl(M,'#ff6fa5'),[cx,(H+1.3)/2,d*.25]);for(let k=0;k<3;k++)add(g,G.to(.3,.05),ch(M),[cx,.6+k*.9,d*.25],[PI/2,0,0]);
    for(let k=0;k<3;k++)add(g,G.s(.22+k*.08),M.c('#ffffff',{gloss:1,rim:1}),[cx+k*.15,H+1.55+k*.35,d*.25-k*.05]);
    add(g,G.bx(w*.9,.3,.1,.05),pl(M,'#3b3450'),[0,H*.82,-d/2-.03]);for(let i=0;i<5;i++)add(g,G.cy(.11,.11,.06,10),gel(M,CAND[i]),[-w*.36+i*w*.18,H*.82,-d/2-.1],[PI/2,0,0]);
    for(const x of[-w*.33,w*.33])port(g,M,[x,H*.45,-d/2-.01],.24,[0,-1]);
    return{top:H+.8,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function spielkiste(g,M,o){const w=o.w*1.0,d=o.d*.95,H=o.h*1.05;add(g,G.bx(w,H,d,.12),gel(M,o.acc),[0,H/2,0]);
    for(const y of[.2,H-.2])add(g,G.bx(w+.06,.12,d+.06,.04),ch(M),[0,y,0]);
    const L=['A','B','C'][Math.floor(o.r()*3)];const t=ctex('wb-kiste-'+L,128,128,(x,w2,h)=>{x.fillStyle='#fffdf7';x.beginPath();x.arc(w2/2,h/2,56,0,TAU);x.fill();x.fillStyle='#3b3450';x.font='900 80px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(L,w2/2,h/2+4)});
    for(const sx of[-1,1]){const m=new THREE.Mesh(new THREE.CircleGeometry(.45,24),new THREE.MeshBasicMaterial({map:t}));m.position.set(sx*(w/2+.01),H*.55,0);m.rotation.y=sx*PI/2;m.userData.noOutline=true;g.add(m)}
    const lid=grp(g,[0,H,d/2],[.6,0,0]);add(lid,G.bx(w+.1,.16,d+.1,.06),gel(M,o.acc2),[0,.08,-d/2]);
    const dh=grp(g,[-w*.15,H+.1,0]);add(dh,G.cy(.28,.34,.8,14),gel(M,'#7fd34a'),[0,.3,0]);add(dh,G.s(.42),gel(M,'#7fd34a'),[0,.85,-.1],null,[1,.9,1.2]);
    for(const s of[-1,1]){add(dh,G.s(.08),M.c('#ffffff'),[s*.2,1.0,-.38]);add(dh,G.s(.04),M.c('#2b2340'),[s*.2,1.0,-.44])}for(let i=0;i<4;i++)add(dh,G.co(.08,.2,4),gel(M,'#ffd23f'),[0,.55+i*.2,.28-i*.06],[-.5,0,0]);
    return{top:H+1.4,noAnt:1,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function dinohaus(g,M,o){const R=o.w*.55,H=o.h*.95;const col=o.acc;const body=add(g,G.s(R),gel(M,col),[0,H*.62+.3,0],null,[1.15,.8,1]);
    for(const sx of[-1,1])for(const sz of[-1,1])add(g,G.cy(.3,.36,H*.62,12),gel(M,col),[sx*R*.6,H*.31,sz*R*.45]);
    const neck=[[R*.8,H*.85,0],[R*1.3,H*1.4,0],[R*1.45,H*2.0,0]];add(g,G.tu(neck,.3,.22,16),gel(M,col));add(g,G.s(.42),gel(M,col),[R*1.55,H*2.1,0],null,[1.4,.85,.9]);
    for(const s of[-1,1]){add(g,G.s(.09),M.c('#ffffff'),[R*1.7,H*2.2,s*.28]);add(g,G.s(.045),M.c('#2b2340'),[R*1.75,H*2.22,s*.33])}
    add(g,G.tu([[-R*.9,H*.7,0],[-R*1.5,H*.45,0],[-R*2.0,H*.2,.2]],.3,.06,16),gel(M,col));
    for(let i=0;i<5;i++)add(g,G.s(.2),gel(M,o.acc2),[-R*.6+i*R*.3,H*.62+.3+R*.78,0],null,[.6,1,.4]);
    for(let i=0;i<4;i++){const a=i*1.6;add(g,G.circ(.18),M.c(o.acc2,{gloss:1}),[Math.cos(a)*R*.5,H*.62+.3+Math.sin(a)*R*.3,-R*.99],[0,PI,0])}
    port(g,M,[R*.5,H*.75+.3,-R*.95],.22,[0,-1]);
    return{top:H*2.3,noAnt:1,walls:[new THREE.Box3(new V(-R*1.15,0,-R),new V(R*1.15,H*1.2,R))],hw:R*1.15,hd:R*.98}}
  /* ---------- Kaufhaus 1999: Kaufhaus mit Glasaufzug, Schaufenster-Laden, Riesen-Einkaufstüte ---------- */
  const glas=M=>M.c('#8fe3ff',{gloss:1.5,rim:1,rimColor:'#ffffff'});
  function kaufhaus(g,M,o){const w=o.w*1.1,d=o.d,F=3,fh=o.h*.62;for(let i=0;i<F;i++){const y=i*fh;add(g,G.bx(w-i*.12,fh,d-i*.1,.1),pl(M,o.wall),[0,y+fh/2,0]);add(g,G.bx(w-i*.12+.08,.14,d-i*.1+.08,.04),gel(M,i%2?o.acc:o.acc2),[0,y+fh,0]);
      if(i>0)add(g,G.bx(w*.86-i*.12,fh*.5,.05,.04),glas(M),[0,y+fh*.5,-(d-i*.1)/2-.01])}
    const ex=w/2+.32;add(g,G.bx(.6,F*fh+.4,.6,.08),M.c('#d8f6ff',{opacity:.45,gloss:1.5,rim:1.2}),[ex,(F*fh+.4)/2,-d*.2]).userData.noMerge=true;for(const y of[0,F*fh+.4])add(g,G.bx(.66,.08,.66,.03),ch(M),[ex,y,-d*.2]);add(g,G.bx(.5,.5,.5,.06),gel(M,o.acc),[ex,fh*1.3,-d*.2]);
    const t=ctex('wb-kh',256,64,(x,W,H)=>{x.fillStyle='#ff6fa5';x.fillRect(0,0,W,H);x.fillStyle='#ffffff';x.font='900 34px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('KAUFHAUS',W/2,H/2+2)});
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(w*.7,.45),new THREE.MeshBasicMaterial({map:t}));sg.position.set(0,F*fh-.35,-(d-.24)/2-.03);sg.rotation.y=PI;sg.userData.noOutline=true;g.add(sg);
    for(const x of[-w*.3,w*.3])port(g,M,[x,fh*.55,-d/2-.01],.22,[0,-1]);
    return{top:F*fh+.2,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2+.62,F*fh,d/2))],hw:w/2,hd:d/2}}
  function markise(g,M,y,w,z,c1,c2){const t=ctex('wb-mk-'+c1+c2,128,32,(x,W,H)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?c1:c2;x.fillRect(i*W/8,0,W/8,H)}});
    add(g,G.bx(w,.08,.8,.03),M.c('#ffffff',{map:t,gloss:.6,rim:.6}),[0,y,z-.36],[-.4,0,0]);const n=8;for(let i=0;i<n;i++)add(g,G.cy(w/n/2,w/n/2,.05,12,1,false,0,PI),pl(M,i%2?c1:c2),[-w/2+w/n*(i+.5),y-.16,z-.73],[0,0,0],[1,1,1]).rotation.set(PI/2,0,PI)}
  function schaufenster(g,M,o){const w=o.w*1.05,d=o.d,H=o.h*1.1;add(g,G.bx(w,H,d,.14),pl(M,o.wall),[0,H/2,0]);add(g,G.bx(w+.1,.24,d+.1,.06),gel(M,o.acc),[0,H+.1,0]);
    for(const sx of[-1,1]){const x=sx*w*.3,cw=w*.3,ch_=H*.5,z0=-d/2;add(g,G.bx(cw+.08,.1,.5,.03),ch(M),[x,H*.14,z0-.24]);add(g,G.bx(cw+.08,.08,.5,.03),ch(M),[x,H*.14+ch_,z0-.24]);
      const gl_=add(g,G.bx(cw,ch_,.04,.02),M.c('#cff4ff',{opacity:.3,gloss:1.5,rim:1}),[x,H*.14+ch_/2,z0-.48]);gl_.userData.noMerge=true;gl_.userData.noOutline=true;
      for(let i=0;i<3;i++){const hh=.2+i*.1;add(g,G.bx(.18,hh,.18,.04),gel(M,CAND[(i+(sx>0?3:0))%6]),[x+(i-1)*cw*.3,H*.14+.05+hh/2,z0-.24])}}
    markise(g,M,H*.84,w,-d/2,o.acc,'#ffffff');
    return{top:H+.2,walls:[new THREE.Box3(new V(-w/2,0,-d/2-.5),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function tuete(g,M,o){const w=o.w*.95,d=o.d*.7,H=o.h*1.45;add(g,G.bx(w,H,d,.06),pl(M,o.acc),[0,H/2,0]);add(g,G.bx(w+.02,.3,d+.02,.03),pl(M,'#ffffff'),[0,H-.15,0]);
    for(const z of[-d*.3,d*.3])add(g,G.to(w*.22,.06,PI),pl(M,'#3b3450'),[0,H,z],[0,0,0]);
    const t=ctex('wb-tuete',128,128,(x,W,Hh)=>{x.fillStyle='#ffffff';x.beginPath();x.arc(W/2,Hh/2,54,0,TAU);x.fill();x.strokeStyle='#ff6fa5';x.lineWidth=10;x.beginPath();x.arc(W/2,Hh/2,40,0,TAU*.85);x.stroke();x.fillStyle='#3b3450';x.font='900 30px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('99',W/2,Hh/2+2)});
    for(const sx of[-1,1]){const m=new THREE.Mesh(new THREE.CircleGeometry(.5,24),new THREE.MeshBasicMaterial({map:t}));m.position.set(sx*(w/2+.01),H*.55,0);m.rotation.y=sx*PI/2;m.userData.noOutline=true;g.add(m)}
    for(let k=0;k<5;k++)add(g,G.bx(.06,.3+((k*7)%3)*.1,.06,.01),pl(M,'#fffdf7'),[-w/2+.15+k*.08,.4,-d/2-.01],[0,0,(k-2)*.1]).userData.noOutline=true;
    port(g,M,[w*.25,H*.6,-d/2-.01],.22,[0,-1]);
    return{top:H+w*.22,noAnt:1,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  /* ---------- Funkturm-Planet: Mast-Häuschen, Transistorradio, Schüssel-Haus ---------- */
  function gitter(g,M,x,z,H,w,col){const c=pl(M,col);for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1]]){add(g,G.cy(.04,.05,H,6),c,[x+sx*w/2,H/2,z+sz*w/2],[sz*.04,0,-sx*.04])}
    const n=Math.floor(H/.6);for(let i=1;i<=n;i++){const y=i*H/(n+1);for(const[a,b]of[[0,1],[1,0]])for(const s2 of[-1,1])add(g,G.cy(.022,.022,w,4),c,[x+(a?s2*w/2:0),y,z+(b?s2*w/2:0)],a?[PI/2,0,0]:[0,0,PI/2])}}
  function mast(g,M,o){const w=o.w*.9,d=o.d*.85,H=o.h*.9;add(g,G.bx(w,H,d,.2),pl(M,o.wall),[0,H/2,0]);add(g,G.bx(w+.1,.16,d+.1,.06),gel(M,o.acc),[0,H,0]);
    const mx=w*.18,mh=o.h*2.3;gitter(g,M,mx,d*.1,mh,.7,'#e6ecf5');for(let i=0;i<5;i++)add(g,G.cy(.4,.4,.12,8),pl(M,i%2?'#ffffff':'#ff4a5a'),[mx,H+.3+i*(mh-H)/5,d*.1]);
    add(g,G.cy(.03,.03,1.2),ch(M),[mx,H+mh-H+.7,d*.1]);const lamp=add(g,G.s(.14),M.glow('#ff4a5a',2),[mx,H+mh-H+1.35,d*.1]);lamp.userData.noOutline=true;
    for(const sx of[-1,1]){const dq=grp(g,[mx+sx*.42,H+(mh-H)*.6,d*.1],[0,sx*PI/2,0]);add(dq,G.hs(.3),pl(M,'#f2f4f8'),[0,0,0],[PI/2,0,0],[1,1,.35])}
    for(const x of[-w*.25,w*.25])port(g,M,[x,H*.55,-d/2-.01],.22,[0,-1]);
    return{top:H+(mh-H)+1.4,noAnt:1,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function transistor(g,M,o){const w=o.w*1.15,d=o.d*.75,H=o.h*1.15;add(g,G.bx(w,H,d,.35),gel(M,o.acc),[0,H/2,0]);
    const gr=grp(g,[-w*.22,H*.5,-d/2-.02]);add(gr,G.cy(H*.3,H*.3,.06,24),pl(M,'#e6ecf5'),[0,0,0],[PI/2,0,0]);for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)if(i*i+j*j<10)add(gr,G.s(.035),pl(M,'#3b3450'),[i*H*.075,j*H*.075,-.04]);
    const sk=ctex('wb-skala',256,64,(x,W,Hh)=>{x.fillStyle='#fff2c0';x.fillRect(0,0,W,Hh);x.fillStyle='#3b3450';x.font='bold 18px monospace';['88','92','96','100','104','108'].forEach((t,i)=>x.fillText(t,10+i*42,24));for(let i=0;i<50;i++)x.fillRect(8+i*5,36,1,i%5?8:14);x.fillStyle='#ff4a5a';x.fillRect(150,30,3,30)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(w*.4,H*.16),new THREE.MeshBasicMaterial({map:sk}));sm.position.set(w*.22,H*.75,-d/2-.03);sm.rotation.y=PI;sm.userData.noOutline=true;g.add(sm);
    for(const x of[w*.12,w*.32])add(g,G.cy(.16,.16,.12,16),pl(M,'#e6ecf5'),[x,H*.45,-d/2-.06],[PI/2,0,0]);
    add(g,G.to(w*.3,.06,PI),ch(M),[0,H,0]);add(g,G.cy(.035,.025,o.h*1.6),ch(M),[w*.38,H+o.h*.75,0],[0,0,-.35]);add(g,G.s(.07),ch(M),[w*.38+Math.sin(.35)*o.h*.8,H+o.h*1.52,0]);
    return{top:H+o.h*1.5,noAnt:1,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H,d/2))],hw:w/2,hd:d/2}}
  function schuesselhaus(g,M,o){const R=o.w*.5,H=o.h*.95;add(g,G.cy(R,R*1.05,H,20),pl(M,o.wall),[0,H/2,0]);add(g,G.to(R*1.02,.07),ch(M),[0,H,0],[PI/2,0,0]);
    const dq=grp(g,[0,H+.45,0],[.6,0,0]);add(dq,G.hs(R*.95),pl(M,'#f2f4f8'),[0,0,0],[PI,0,0],[1,.38,1]);add(dq,G.cy(.04,.04,R*.95),ch(M),[0,R*.45,0]);add(dq,G.s(.12),gel(M,o.acc),[0,R*.95,0]);
    add(g,G.cy(.18,.22,.4,10),ch(M),[0,H+.15,0]);for(let i=0;i<5;i++){const a=i/5*TAU+PI/5;if(Math.abs(a-PI*1.5)<.5)continue;port(g,M,[Math.cos(a)*R*1.0,H*.55,Math.sin(a)*R*1.0],.2,[Math.cos(a),Math.sin(a)])}
    return{top:H+R*1.1,noAnt:1,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,H,R))],hw:R,hd:R}}
  /* ---------- Magnetbahn-Ring: Bahnhof, Wagen-Haus, Spulen-Haus mit Hufeisenmagnet ---------- */
  function bahnhof(g,M,o){const w=o.w*1.2,d=o.d,H=o.h*.75;add(g,G.bx(w,H,d,.14),pl(M,o.wall),[0,H/2,0]);
    const rf=new THREE.CylinderGeometry(d/2+.15,d/2+.15,w+.3,24,1,true,0,PI);rf.rotateZ(PI/2);const r1=add(g,rf,M.c('#bfefff',{opacity:.5,gloss:1.5,rim:1.2,side:THREE.DoubleSide}),[0,H,0]);r1.userData.noMerge=true;
    for(let i=0;i<5;i++){const x=-w/2-.1+i*(w+.2)/4;add(g,G.to(d/2+.15,.05,PI),pl(M,o.acc),[x,H,0],[0,PI/2,0])}add(g,G.bx(w+.3,.08,.1,.03),pl(M,o.acc),[0,H+d/2+.15,0]);
    const clk=ctex('wb-bhuhr',128,128,(x,W,Hh)=>{x.fillStyle='#fffdf7';x.beginPath();x.arc(W/2,Hh/2,58,0,TAU);x.fill();x.strokeStyle='#3b3450';x.lineWidth=6;x.stroke();x.lineCap='round';x.beginPath();x.moveTo(W/2,Hh/2);x.lineTo(W/2,20);x.moveTo(W/2,Hh/2);x.lineTo(W/2+26,Hh/2+8);x.stroke();x.fillStyle='#ff4a5a';x.beginPath();x.arc(W/2+20,30,7,0,TAU);x.fill()});
    const c=new THREE.Mesh(new THREE.CircleGeometry(.32,24),new THREE.MeshBasicMaterial({map:clk}));c.position.set(w*.3,H*.7,-d/2-.03);c.rotation.y=PI;c.userData.noOutline=true;g.add(c);
    port(g,M,[-w*.3,H*.55,-d/2-.01],.22,[0,-1]);return{top:H+d/2+.2,noAnt:1,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w/2,H+d/2,d/2))],hw:w/2,hd:d/2}}
  function wagenhaus(g,M,o){const w=o.w*1.35,d=o.d*.8,H=o.h*.85,y0=.5;for(const x of[-w*.3,w*.3])add(g,G.bx(.5,y0,d*.6,.06),ch(M),[x,y0/2,0]);
    add(g,G.bx(w*.8,H,d,.45),pl(M,'#fbfbfd'),[0,y0+H/2,0]);const nose=add(g,G.s(d/2),pl(M,'#fbfbfd'),[w*.4,y0+H/2,0],null,[2.2,H/d,1]);
    add(g,G.bx(w*.82,.16,d+.02,.05),pl(M,o.acc),[0,y0+H*.35,0]);add(g,G.s(d*.32),M.c('#3b4a6a',{gloss:1.5,rim:1}),[w*.62,y0+H*.68,0],null,[1.4,.55,1.35]);
    for(let i=0;i<3;i++)add(g,G.bx(.5,.36,.04,.1),M.c('#8fe3ff',{gloss:1.5,rim:1,rimColor:'#ffffff'}),[-w*.3+i*.62,y0+H*.68,-d/2-.01]);
    add(g,G.bx(w*.9,.1,.5,.03),ch(M),[0,.05,-d/2-.4]);for(const x of[-.3,.3])add(g,G.bx(.4,.12,.4,.03),ch(M),[x+w*.1,y0*.5,-d/2-.2]);
    return{top:y0+H+.1,noAnt:1,walls:[new THREE.Box3(new V(-w/2,0,-d/2),new V(w*.6,y0+H,d/2))],hw:w/2,hd:d/2}}
  function spulenhaus(g,M,o){const R=o.w*.45,H=o.h*1.1;add(g,G.cy(R,R,H,20),pl(M,o.wall),[0,H/2,0]);for(let i=0;i<9;i++)add(g,G.to(R+.03,.05),M.c('#c87a3a',{gloss:1.4,rim:1}),[0,H*.25+i*H*.075,0],[PI/2,0,0]);
    const mg=grp(g,[0,H,0]);const arc=new THREE.TorusGeometry(R*.75,.28,12,24,PI);add(mg,arc,gel(M,'#ff4a5a'),[0,.9,0]);for(const s of[-1,1]){add(mg,G.cy(.28,.28,.9,12),gel(M,'#ff4a5a'),[s*R*.75,.45,0]);add(mg,G.cy(.29,.29,.3,12),ch(M),[s*R*.75,.1,0])}
    for(const a of[-.7,.7])port(g,M,[Math.sin(a)*R,H*.15+.5,-Math.cos(a)*R],.2,[Math.sin(a),-Math.cos(a)]);
    return{top:H+R*.75+1.2,noAnt:1,walls:[new THREE.Box3(new V(-R,0,-R),new V(R,H,R))],hw:R,hd:R}}
  const SHAPES={kapsel,ei,stapel,kuppel,dinoei,vulkan,knochen,serverturm,crt,modem,kapselturm,blob,slab,automat,handheld,teddy,kissen,knaeuel,tropfen,ammonit,harzstumpf,fabrik,spielkiste,dinohaus,kaufhaus,schaufenster,tuete,mast,transistor,schuesselhaus,bahnhof,wagenhaus,spulenhaus};

  /* ---------- Familie für HAUS.FAMX ---------- */
  function kokon(pid,r,plan,A){const M=mats();const P_=PLANET[pid]||PLANET.kompost;const g=new THREE.Group();const big=plan.big?1.4:1;
    const kind=plan.style&&SHAPES[plan.style]?plan.style:A.pick(r,['kapsel','ei','stapel','kuppel']);
    const acc=A.pick(r,P_.acc),acc2=A.pick(r,CAND.filter(c=>c!==acc)),wall=A.pick(r,WALL);
    const o={w:(2.4+r()*.8)*big,d:(2.0+r()*.5)*big,h:(1.9+r()*.5)*(plan.big?1.25:1),wall,acc,acc2,r};
    const body=new THREE.Group();g.add(body);const lift=P_.stilts?.55:0;body.position.y=lift;
    const res=SHAPES[kind](body,M,o);
    /* Planeten-Eigenheiten */
    if(P_.stilts){for(const x of[-res.hw*.7,res.hw*.7])for(const z of[-res.hd*.6,res.hd*.6])add(g,G.cy(.07,.09,lift+.1),ch(M),[x,lift/2,z]);add(g,G.bx(1.0,.1,.9,.04),pl(M,'#fff3e0'),[0,.05,-res.hd-.45])}
    if(P_.sand)add(g,G.cy(Math.max(res.hw,res.hd)+.25,Math.max(res.hw,res.hd)+.35,.3),M.c('#f2cf98',{gloss:.4,rim:.5}),[0,.15,0]);
    if(P_.snow)add(body,G.s(Math.max(res.hw,res.hd)*.75),M.c('#fbfdff',{rim:.9,rimColor:'#dfefff'}),[0,res.top-.12,0],null,[1,.22,.9]);
    if(P_.rivets)rivets(body,M,.35,Math.max(res.hw,res.hd)+.02,10);
    if(P_.spots)spots(body,M,res.top*.55,Math.max(res.hw,res.hd)*.98,7,'#fff6ff',r);
    if(P_.vines)ranken(body,M,res,r);
    const dz=-res.hd-.02;door(body,M,0,dz,acc2,kind==='ei'?1.2:1.36);
    const nm=(plan.civic?String(plan.civic).toUpperCase():A.pick(r,['KOKON','NEMURI','23:59','1999','HALLO']));lcd(body,M,nm.slice(0,8),.7,[0,kind==='ei'?1.5:1.62,dz-.03]);
    if(!res.noAnt)antenna(body,M,res.top-.05,r);
    addOutlines(g);g.traverse(x=>{if(x.isMesh){x.castShadow=true;x.receiveShadow=true}});
    const walls=res.walls.map(b=>b.clone().translate(new V(0,lift,0)));
    return{g,R:Math.max(res.hw,res.hd)+.6,top:res.top+lift+.9,door:[0,dz],walls,style:'kokon-'+kind}}
  HAUS.FAMX.kokon=kokon;
  /* Bauplan der sechs alten Planeten: nur noch Kokon-Häuser (in je eigenen Formen) */
  const S=['kapsel','ei','stapel','kuppel'];
  const PL={kompost:['kapsel','stapel','ei','kuppel'],schrott:['stapel','kapsel','kuppel'],korallen:['kuppel','ei','kapsel'],frost:['kuppel','kapsel','ei'],wueste:['kuppel','stapel','ei'],pilz:['ei','kuppel','stapel'],pluesch:['teddy','kissen','knaeuel'],bernstein:['tropfen','ammonit','harzstumpf'],dinofabrik:['fabrik','spielkiste','dinohaus'],kaufhaus:['kaufhaus','schaufenster','tuete'],funkturm:['mast','transistor','schuesselhaus'],magnetbahn:['bahnhof','wagenhaus','spulenhaus']};
  for(const pid in PL)HAUS.PLAN[pid]=PL[pid].map(s=>({fam:'kokon',style:s,fence:pid==='schrott'||pid==='wueste'?null:undefined}));
  /* ---------- Garten im Spielzeug-Look: ersetzt Holzzaun, Hecke, Fass, Kiste, Karren, Holzstapel, Topf, Trittsteine, Bäume und Blumen der Bausätze.
     WK.swap passt jedes Modell auf die Grundfläche des alten Teils ein, Platzierung und Kollision bleiben gleich. ---------- */
  if(typeof WK!=='undefined'&&WK.swap){const CA=WK.CANDY;const pk=(r,a)=>a[Math.floor(r()*a.length)%a.length];let n=0;const rr=()=>srand(1000+(n++));
    const zaun=m=>{const g=new THREE.Group();const r=rr();const c1=pk(r,[CA.strawberry,CA.bondi,CA.grape,CA.lime]),c2=pk(r,[CA.lemon,CA.tangerine,'#ffffff']);
      for(const x of[-.5,.5]){add(g,G.cy(.035,.04,.55),ch(m),[x,.275,0]);add(g,G.s(.07),gel(m,c2),[x,.58,0])}
      for(const[y,c]of[[.2,c1],[.42,c1]])add(g,G.cy(.035,.035,1),gel(m,c),[0,y,0],[0,0,PI/2]);return g};
    const hecke=m=>{const g=new THREE.Group();add(g,G.bx(1,.62,.5,.22),gel(m,'#7fd34a'),[0,.31,0]);const hl=add(g,G.s(.07),m.flat('#ffffff'),[-.25,.55,.22],null,[1.6,.6,.4]);hl.userData.noOutline=true;return g};
    const fass=m=>{const g=new THREE.Group();const r=rr();const c=pk(r,[CA.strawberry,CA.bondi,CA.grape,CA.lemon,CA.lime]);add(g,G.hs(.28),gel(m,c),[0,.28,0],[PI,0,0]);add(g,G.hs(.28),m.c('#ffffff',{opacity:.55,gloss:1.4,rim:1.3}),[0,.28,0]);add(g,G.to(.28,.025),ch(m),[0,.28,0],[PI/2,0,0]);add(g,G.s(.12),gel(m,pk(r,[CA.tangerine,CA.lime])),[0,.34,0]);return g};
    const kiste=m=>{const g=new THREE.Group();const r=rr();const c=pk(r,[CA.bondi,CA.strawberry,CA.lemon,CA.lime,CA.grape]);add(g,G.bx(.6,.6,.6,.08),pl(m,c),[0,.3,0]);
      const L=pk(r,['A','B','C','K','O']);const t=ctex('wb-blk-'+L,128,128,(x,w,h)=>{x.fillStyle='#fffdf7';x.beginPath();x.roundRect?x.roundRect(8,8,w-16,h-16,22):x.rect(8,8,w-16,h-16);x.fill();x.fillStyle='#3b3450';x.font='900 84px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(L,w/2,h/2+4)});
      for(const[p,ry]of[[[0,.3,.302],0],[[.302,.3,0],PI/2],[[0,.3,-.302],PI],[[-.302,.3,0],-PI/2]]){const q=new THREE.Mesh(new THREE.PlaneGeometry(.44,.44),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));q.position.set(...p);q.rotation.y=ry;q.userData.noOutline=true;g.add(q)}return g};
    const topf=m=>{const g=new THREE.Group();const r=rr();add(g,G.cy(.3,.22,.42),pl(m,pk(r,[CA.strawberry,CA.bondi,CA.tangerine,CA.grape])),[0,.21,0]);add(g,G.to(.3,.04),ch(m),[0,.42,0],[PI/2,0,0]);add(g,G.s(.26),gel(m,'#7fd34a'),[0,.6,0]);add(g,G.s(.08),gel(m,CA.lemon),[.12,.78,.12]);return g};
    const karren=m=>{const g=new THREE.Group();const r=rr();add(g,G.bx(1.2,.4,.7,.12),pl(m,pk(r,[CA.strawberry,CA.bondi,CA.lime])),[0,.42,0]);for(const x of[-.4,.4])for(const z of[-.36,.36]){add(g,G.to(.14,.05),ch(m),[x,.16,z]);add(g,G.cy(.08,.08,.06),gel(m,CA.lemon),[x,.16,z],[PI/2,0,0])}
      add(g,G.cy(.025,.025,.7),ch(m),[.85,.55,0],[0,0,1.1]);add(g,G.s(.07),gel(m,CA.tangerine),[1.15,.72,0]);return g};
    const stifte=m=>{const g=new THREE.Group();const cols=[CA.strawberry,CA.bondi,CA.lemon,CA.lime,CA.grape,CA.tangerine];let k=0;for(const[y,xs]of[[.11,[-.36,-.12,.12,.36]],[.31,[-.24,0,.24]],[.51,[-.12,.12]]])for(const x of xs){const c=cols[k++%6];
      const q=grp(g,[0,y,x],[0,0,PI/2]);add(q,G.cy(.1,.1,.9),pl(m,c),[0,0,0]);add(q,G.cy(.0,.1,.18),m.c('#fbe7c8'),[0,.54,0]);add(q,G.cy(.0,.035,.07),pl(m,c),[0,.6,0])}return g};
    const stein=m=>{const g=new THREE.Group();add(g,G.cy(.42,.44,.06),pl(m,pk(rr(),['#ffd2e6','#d8f8ff','#e9ddff','#fff3b8','#dff7c8'])),[0,.03,0]);return g};
    const latte=m=>{const g=new THREE.Group();add(g,G.bx(1,.05,.5,.02),pl(m,pk(rr(),['#ffd2e6','#d8f8ff','#e9ddff','#fff3b8'])),[0,.025,0]);return g};
    const beet=m=>{const g=new THREE.Group();add(g,G.bx(1.2,.22,.5,.08),pl(m,CA.tangerine),[0,.11,0]);add(g,G.bx(1.1,.04,.42,.02),m.c('#6e4a3a'),[0,.22,0]);return g};
    const natur=(type,opt)=>m=>{const g=new THREE.Group();try{NATURE[type].b(g,m,opt||{},rr())}catch(e){console.warn('Garten',type,e)}return g};
    const L='long';
    WK.swap('town/fence',zaun,L);WK.swap('town/hedge',hecke,L);WK.swap('town/hedge-large',hecke,L);WK.swap('pirate/barrel',fass);WK.swap('pirate/crate',kiste);WK.swap('nature/pot_large',topf);
    WK.swap('town/cart',karren,L);WK.swap('nature/log_stack',stifte,L);WK.swap('nature/log_stackLarge',stifte,L);WK.swap('nature/path_stone',stein);WK.swap('town/planks-half',latte,L);WK.swap('nature/crops_dirtRow',beet,L);
    WK.swap('town/tree',natur('baum'));WK.swap('town/tree-high-round',natur('eiche'));WK.swap('town/tree-crooked',natur('baum'));WK.swap('nature/plant_bushLarge',natur('busch'));WK.swap('nature/plant_bushDetailed',natur('busch',{beeren:false}));
    for(const f of['flower_redA','flower_redB','flower_yellowA','flower_yellowB','flower_purpleA','flower_purpleB'])WK.swap('nature/'+f,natur('blume'))}
  /* ---------- Bau-Familien der späteren Planeten (Urzeit, Dschungel, Metro, Riesengarten, Bücher, Uhrwerk, Klang …) in Bonbon-Plastik:
     gleiche Formen, aber glänzend, kräftiger, mit weissem Rand. Texturen, Glas, Leuchten und sehr dunkle Teile bleiben. ---------- */
  const CC=new Map();function candyMat(m){const c=m.color;if(!c)return m;const h={};c.getHSL(h);if(h.l<.22||h.l>.94)return m;const k=c.getHexString();if(CC.has(k))return CC.get(k);
    const o=c.clone();o.setHSL(h.h,Math.min(.85,h.s*1.18+.05),Math.max(.4,Math.min(.72,h.l*1.05)));const n=mats().c('#'+o.getHexString(),{gloss:1,rim:.85,rimColor:'#ffffff'});CC.set(k,n);return n}
  function candyize(g){g.traverse(o=>{if(!o.isMesh||o.userData.hull)return;const m=o.material;if(!m||Array.isArray(m)||!m.isMeshToonMaterial||m.map||m.vertexColors||m.transparent||m.userData.glow||m.userData.leaf||m.userData.noBake)return;o.material=candyMat(m)})}
  const PL2={urzeit:['dinoei','vulkan','knochen'],dschungel:['serverturm','crt','modem'],metro:['kapselturm','blob','slab']};
  function wrapFams(){for(const pid in PL2)HAUS.PLAN[pid]=PL2[pid].map(st=>({fam:'kokon',style:st}));for(const k of Object.keys(HAUS.FAMX)){const f=HAUS.FAMX[k];if(k==='kokon'||f._wired)continue;const w=(...a)=>{const r=f(...a);try{candyize(r.g)}catch(e){console.warn('WIRED-Familie',k,e)}return r};w._wired=true;HAUS.FAMX[k]=w}}
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',wrapFams);else setTimeout(wrapFams,0);
  window.WBAU={kokon,SHAPES,candyize,wrapFams};
})();
