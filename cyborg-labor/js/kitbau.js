/* =====================================================================
   CYBORG-LABOR · kitbau.js · Bauwerke aus Bausatz-Teilen (Fundus, Stufe 2)
   Aus den Bauteilen der Bausätze entstehen ganze Bauwerke:
     block  – Würfel-Häuser (modular): Gitter aus Blöcken, Tür vorn, Fenster, Dach
     panel  – Wand-Häuser: dünne Wände auf Zellkanten, Boden, Dach, Säulen
     tower  – Türme: Sockel, Mittelteile, Spitze übereinander
     line   – Strecken: Teile hintereinander (Gleise, Fliessbänder, Gänge, Zäune)
     yard   – Baustofflager: kleine Teile ordentlich aufgereiht auf einem Platz
   Jedes Rezept hat mehrere Varianten; die Teile werden reihum gewählt,
   damit über alle Varianten jedes Teil mindestens einmal vorkommt.
   Die Bauwerke laufen danach wie Deko über FUNDUS auf die Planeten.
   ===================================================================== */
const KITBAU=(()=>{
  const used=new Set();
  /* texturierte Bausätze (Retro, Ruinen): nach Helligkeit in drei Töne – Fachwerk-Look */
  const LUM={lum:['#8a6a9a','#c48a62','#f6e6cc'],line:'#4a3a5e'};
  /* Teilewahl reihum über alle Varianten: Zähler je Teileliste; Variante v beginnt dort, wo v-1 aufgehört hat */
  let CTX=null;const pk=L=>{if(!L||!L.length)return null;const c=CTX.cnt.get(L)||0;CTX.cnt.set(L,c+1);return L[((CTX.base.get(L)||0)+c)%L.length]};
  function bb(k,n){return KIT.bounds(k,n)}
  /* Teil einsetzen: Mitte des Teils auf (x,z), Boden auf y; Drehung ry */
  function put(g,k,n,x,y,z,ry,s){if(!n||!KIT.has(k,n))return null;if(CTX.dry)return null;const b=bb(k,n);const pal=CTX.tint?(()=>{const c=CTX.tint[(CTX.ti++)%CTX.tint.length];return{byHex:new Proxy({},{get:()=>c}),tint:c,line:'#4a3a5e'}})():CTX.pal;const m=KIT.mesh(k,n,pal);s=s||1;
    const piv=new THREE.Group();m.position.set(-(b[0]+b[3])/2,-b[1],-(b[2]+b[5])/2);piv.add(m);piv.position.set(x,y,z);piv.rotation.y=ry||0;piv.scale.setScalar(s);g.add(piv);used.add(k+'/'+n);return piv}
  const dims=(k,n)=>{const b=bb(k,n);return b?{w:b[3]-b[0],h:b[4]-b[1],d:b[5]-b[2]}:{w:1,h:1,d:1}};
  /* ---------- block: Gitter aus Würfel-Modulen ---------- */
  function block(g,R,v){const k=R.kit,P=R.parts;const c=dims(k,P.win[0]);const cw=c.w,ch=c.h;
    const W=2+v%2,D=2+(v>>1)%2,L=1+(v%3);let s=0;
    for(let l=0;l<L;l++)for(let i=0;i<W;i++)for(let j=0;j<D;j++){const edgeF=j===D-1,edgeB=j===0,edgeL=i===0,edgeR=i===W-1;if(!(edgeF||edgeB||edgeL||edgeR))continue;
      const corner=(edgeL||edgeR)&&(edgeF||edgeB);const x=(i-(W-1)/2)*cw,z=(j-(D-1)/2)*cw,y=l*ch;
      /* Blickrichtung des Moduls: vorne +z; an den Seiten nach aussen drehen */
      let ry=edgeF?0:edgeB?Math.PI:edgeL?-Math.PI/2:Math.PI/2;let n;
      if(corner){n=pk(P.corner);ry=edgeF?(edgeL?0:Math.PI/2):(edgeL?-Math.PI/2:Math.PI)}
      else if(l===0&&edgeF&&i===Math.floor((W-1)/2))n=pk(P.door);
      else n=pk(l===0?P.win:(P.upper||P.win));
      put(g,k,n,x,y,z,ry)}
    /* Dach: eine Dachart je Haus */
    const rf=pk(P.roof);for(let i=0;i<W;i++)for(let j=0;j<D;j++)put(g,k,rf,(i-(W-1)/2)*cw,L*ch,(j-(D-1)/2)*cw,0);
    if(P.extra)for(let e=0;e<2;e++){const n=pk(P.extra);put(g,k,n,((e?1:-1)*(W/2-.3))*cw,(L-.5)*ch,D/2*cw+.05,0)}
    return{w:W*cw,h:(L+.6)*ch}}
  /* ---------- panel: Wände auf Zellkanten ---------- */
  function panel(g,R,v){const k=R.kit,P=R.parts;const wd=dims(k,P.wall[0]);const cell=Math.max(wd.w,wd.d);const wh=wd.h;const alongX=wd.w>=wd.d;
    const W=2+v%2,D=2+(v>>1)%2,L=P.levels?1+(v%P.levels):1;let s=0;
    const edge=(x,z,dir,n,y)=>{const ry=(dir==='x'?0:Math.PI/2)+(alongX?0:Math.PI/2);put(g,k,n,x,y,z,ry)};
    for(let l=0;l<L;l++){const y=l*wh;
      for(let i=0;i<W;i++){const x=(i-(W-1)/2)*cell;
        edge(x,D/2*cell,'x',l===0&&i===Math.floor((W-1)/2)?pk(P.door):pk(P.win&&((i+l)%2)?P.win:P.wall),y);
        edge(x,-D/2*cell,'x',pk(P.win&&(i%2)?P.win:P.wall),y)}
      for(let j=0;j<D;j++){const z=(j-(D-1)/2)*cell;edge(-W/2*cell,z,'z',pk(P.win&&(j%2)?P.win:P.wall),y);edge(W/2*cell,z,'z',pk(P.wall),y)}
      if(P.corner)for(const[a,b2]of[[-1,-1],[1,-1],[-1,1],[1,1]])put(g,k,pk(P.corner),a*W/2*cell,y,b2*D/2*cell,0)}
    const fl=pk(P.floor),rf=pk(P.roof);
    for(let i=0;i<W;i++)for(let j=0;j<D;j++){if(fl)put(g,k,fl,(i-(W-1)/2)*cell,0,(j-(D-1)/2)*cell,0);if(rf)put(g,k,rf,(i-(W-1)/2)*cell,L*wh,(j-(D-1)/2)*cell,0)}
    if(P.extra)for(let e=0;e<3;e++){const n=pk(P.extra);const d=dims(k,n);put(g,k,n,(e-1)*cell*.9,0,D/2*cell+d.d/2+.2,0)}
    return{w:Math.max(W,D)*cell,h:L*wh+cell*.5}}
  /* ---------- tower: übereinander stapeln ---------- */
  function tower(g,R,v){const k=R.kit,P=R.parts;let y=0,s=0;const n0=pk(P.base);const b0=put(g,k,n0,0,y,0,0);y+=dims(k,n0).h;
    const mids=P.mid?1+(v%3):0;for(let i=0;i<mids;i++){const n=pk(P.mid);put(g,k,n,0,y,0,(i%4)*Math.PI/2);y+=dims(k,n).h}
    if(P.top){const n=pk(P.top);put(g,k,n,0,y,0,0);y+=dims(k,n).h}
    if(P.roof){const n=pk(P.roof);put(g,k,n,0,y,0,0);y+=dims(k,n).h}
    if(P.side){for(let e=0;e<2;e++){const n=pk(P.side);const d0=dims(k,n0);put(g,k,n,(e?1:-1)*(d0.w/2+dims(k,n).w/2+.05),0,0,0)}}
    return{w:dims(k,n0).w*2,h:y}}
  /* ---------- line: hintereinander ---------- */
  function line(g,R,v){const k=R.kit,P=R.parts;let z=0,s=0;const N=P.n||5;
    for(let i=0;i<N;i++){const n=i===0&&P.end?pk(P.end):i===N-1&&P.end?pk(P.end):pk(P.seg);const d=dims(k,n);const len=Math.max(d.d,d.w);const rot=d.w>d.d?Math.PI/2:0;
      put(g,k,n,0,0,z+len/2,rot);z+=len}
    g.children.forEach(c=>c.position.z-=z/2);if(P.extra){const n=pk(P.extra);put(g,k,n,dims(k,P.seg[0]).w,0,0,0)}
    return{w:z,h:Math.max(...g.children.map(c=>1))}}
  /* ---------- yard: Baustofflager ---------- */
  function yard(g,R,v){const k=R.kit,L=R.parts.items;const per=R.parts.per||9;const items=[];for(let i=0;i<per;i++){const n=L[(v*per+i)%L.length];if(!items.includes(n))items.push(n)}
    const cols=3;let x=0,z=0,rowD=0,maxW=0;const pos=[];items.forEach((n,i)=>{const d=dims(k,n);if(i%cols===0&&i){z+=rowD+.3;x=0;rowD=0}pos.push([n,x+d.w/2,z+d.d/2]);x+=d.w+.3;rowD=Math.max(rowD,d.d);maxW=Math.max(maxW,x)});
    const W=maxW,D=z+rowD;for(const[n,px,pz]of pos)put(g,k,n,px-W/2,0,pz-D/2,0);
    return{w:Math.max(W,D),h:Math.max(...items.map(n=>dims(k,n).h))}}
  const KIND={block,panel,tower,line,yard};
  /* Bauwerk bauen (in Bausatz-Einheiten) */
  const bases=new Map();
  function baseFor(R,v){let B=bases.get(R);if(!B){B=[new Map()];bases.set(R,B)}
    while(B.length<=v){const i=B.length-1;CTX={dry:true,cnt:new Map(),base:B[i]};KIND[R.type](new THREE.Group(),R,i);const nb=new Map(B[i]);for(const[L,c]of CTX.cnt)nb.set(L,(nb.get(L)||0)+c);B.push(nb)}return B[v]}
  function build(R,v){const base=baseFor(R,v);CTX={dry:false,cnt:new Map(),base,pal:R.role?LUM:KIT.ORIG,tint:R.tint?['#ff6fa5','#45a0ff','#ffd23f','#7fd34a','#ff9a45','#9b6ae0']:null,ti:v};const g=new THREE.Group();const r=KIND[R.type](g,R,v);CTX=null;g.userData.size=r;return g}
  /* ---------- Rezepte ---------- */
  const RECIPES=typeof FUNDUS_BAU!=='undefined'?FUNDUS_BAU:[];
  /* Varianten auf Planeten verteilen (reihum über die Planeten des Rezepts) */
  const DEKO=[];for(const R of RECIPES)for(let v=0;v<R.n;v++)DEKO.push({id:'kb_'+R.id+'_'+v,planet:(R.pl||R.planets)[R.pl?v:v%R.planets.length],R});
  return{build,RECIPES,DEKO,used,KIND}
})();
