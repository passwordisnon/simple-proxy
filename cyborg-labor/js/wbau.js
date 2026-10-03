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
    frost:{acc:['#2fb5d9','#9b6ae0','#ff6fa5'],snow:1},wueste:{acc:['#ff9a45','#ffd23f','#2fb5d9'],sand:1},pilz:{acc:['#9b6ae0','#ff6fa5','#7fd34a'],spots:1}};
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
  const SHAPES={kapsel,ei,stapel,kuppel};

  /* ---------- Familie für HAUS.FAMX ---------- */
  function kokon(pid,r,plan,A){const M=mats();const P_=PLANET[pid]||PLANET.kompost;const g=new THREE.Group();const big=plan.big?1.4:1;
    const kind=plan.style&&SHAPES[plan.style]?plan.style:A.pick(r,Object.keys(SHAPES));
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
    const dz=-res.hd-.02;door(body,M,0,dz,acc2,kind==='ei'?1.2:1.36);
    const nm=(plan.civic?String(plan.civic).toUpperCase():A.pick(r,['KOKON','NEMURI','23:59','1999','HALLO']));lcd(body,M,nm.slice(0,8),.7,[0,kind==='ei'?1.5:1.62,dz-.03]);
    antenna(body,M,res.top-.05,r);
    addOutlines(g);g.traverse(x=>{if(x.isMesh){x.castShadow=true;x.receiveShadow=true}});
    const walls=res.walls.map(b=>b.clone().translate(new V(0,lift,0)));
    return{g,R:Math.max(res.hw,res.hd)+.6,top:res.top+lift+.9,door:[0,dz],walls,style:'kokon-'+kind}}
  HAUS.FAMX.kokon=kokon;
  /* Bauplan der sechs alten Planeten: nur noch Kokon-Häuser (in je eigenen Formen) */
  const S=['kapsel','ei','stapel','kuppel'];
  const PL={kompost:['kapsel','stapel','ei','kuppel'],schrott:['stapel','kapsel','kuppel'],korallen:['kuppel','ei','kapsel'],frost:['kuppel','kapsel','ei'],wueste:['kuppel','stapel','ei'],pilz:['ei','kuppel','stapel']};
  for(const pid in PL)HAUS.PLAN[pid]=PL[pid].map(s=>({fam:'kokon',style:s,fence:pid==='schrott'||pid==='wueste'?null:undefined}));
  window.WBAU={kokon,SHAPES};
})();
