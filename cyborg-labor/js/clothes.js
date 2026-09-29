/* =====================================================================
   CYBORG-LABOR · clothes.js
   Kleidung im Cozy-Stil: Hüte, Oberteile (folgen exakt der Rumpfform),
   Halsschmuck und Gesichts-Accessoires. Jedes Teil in jeder Palettenfarbe.
   Getragen wird über d.clothes = {hat, top, neck, face, col:{slot:farbIndex}}.
   ===================================================================== */
const CLOTHES=(()=>{
  const SLOTS=[{id:'hat',n:'Hüte'},{id:'top',n:'Oberteile'},{id:'neck',n:'Hals'},{id:'face',n:'Gesicht'}];
  const stripes=(a,b,n)=>ctex('streifen-'+a+b+n,8,64,(x,w,h)=>{for(let i=0;i<n;i++){x.fillStyle=i%2?b:a;x.fillRect(0,i*h/n,w,h/n)}});
  const dots=(a,b)=>ctex('tupfen-'+a+b,64,64,(x,w,h)=>{x.fillStyle=a;x.fillRect(0,0,w,h);x.fillStyle=b;for(const[px,py]of[[12,12],[44,20],[26,44],[56,54],[8,52]]){x.beginPath();x.arc(px,py,5,0,TAU);x.fill()}});
  const light=(c,k)=>'#'+new THREE.Color(c).lerp(new THREE.Color('#ffffff'),k).getHexString();
  const dark=(c,k)=>'#'+new THREE.Color(c).multiplyScalar(1-k).getHexString();
  /* ---------- Katalog: id, Name, Slot, Preis, Standardfarbe, Bauplan ---------- */
  const L=[];const def=(slot,id,n,price,col,b)=>L.push({slot,id,n,price,col,b});
  /* Hüte: sitzen auf H.top, Grösse nach Kopfradius */
  def('hat','baskenmuetze','Baskenmütze',420,'#D8505E',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.12,0],[-.12,0,.18]);P(q,G.s(r*.78),M.c(col),[0,r*.08,0],null,[1,.32,1]);P(q,G.to(r*.62,r*.07),M.c(dark(col,.2)),[0,0,0],[PI/2,0,0]);P(q,G.cy(r*.05,r*.03,r*.16),M.c(dark(col,.25)),[0,r*.3,0])});
  def('hat','strohhut','Strohhut',380,'#F2D08A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.18,0],[-.08,0,0]);P(q,G.cy(r*1.25,r*1.3,r*.05),M.c(col),[0,0,0]);P(q,G.la([[r*.62,0],[r*.6,r*.35],[r*.45,r*.5],[0,r*.52]]),M.c(col),[0,0,0]);P(q,G.cy(r*.63,r*.63,r*.12,true),M.c('#F28CB0'),[0,r*.1,0]);
    const f=grp(q,[r*.56,r*.14,r*.22]);for(let i=0;i<5;i++){const a=i/5*TAU;P(f,G.s(r*.07),M.c('#FFFFFF'),[Math.cos(a)*r*.07,Math.sin(a)*r*.07,0])}P(f,G.s(r*.05),M.c('#FFD35C'),[0,0,r*.03])});
  def('hat','muetze','Bommelmütze',300,'#6FC4B8',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.35,0]);P(q,G.hs(r*.9),M.c(col,{map:stripes(col,light(col,.45),6)}),[0,0,0],null,[1,.8,1]);P(q,G.to(r*.86,r*.1),M.c(light(col,.5)),[0,r*.02,0],[PI/2,0,0]);P(q,G.s(r*.22),M.plush?M.plush(light(col,.7)):M.c('#fff'),[0,r*.78,0])});
  def('hat','zylinder','Zylinder',650,'#3E3650',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.1,0],[0,0,-.1]);P(q,G.cy(r*.95,r*.95,r*.05),M.c(col),[0,0,0]);P(q,G.cy(r*.55,r*.6,r*.85),M.c(col,{gloss:.6}),[0,r*.45,0]);P(q,G.cy(r*.61,r*.61,r*.14,true),M.c('#D8505E'),[0,r*.12,0])});
  def('hat','blumenkranz','Blumenkranz',350,'#FF8FB8',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.28,0]);P(q,G.to(r*.72,r*.06),M.c('#6BB86A'),[0,0,0],[PI/2,0,0]);const cs=[col,'#FFFFFF','#FFD35C',light(col,.4)];
    for(let i=0;i<9;i++){const a=i/9*TAU;const f=grp(q,[Math.cos(a)*r*.72,r*.03,Math.sin(a)*r*.72]);for(let k=0;k<5;k++){const b=k/5*TAU;P(f,G.s(r*.07),M.c(cs[i%4]),[Math.cos(b)*r*.07,r*.02,Math.sin(b)*r*.07])}P(f,G.s(r*.05),M.c('#FFD35C'),[0,r*.05,0])}});
  def('hat','kappe','Schirmmütze',280,'#5B8DEF',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.3,0],[-.1,0,0]);P(q,G.hs(r*.86),M.c(col),[0,0,0],null,[1,.75,1]);P(q,G.cy(r*.6,r*.6,r*.04),M.c(dark(col,.15)),[0,r*.02,r*.62],null,[1,1,.7]);P(q,G.s(r*.08),M.c(light(col,.5)),[0,r*.66,0])});
  def('hat','schleife','Haarschleife',220,'#F0556E',(g,M,H,col)=>{const r=H.r;const q=grp(g,[r*.35,H.top-r*.12,r*.1],[0,0,-.3]);const sh=new THREE.Shape();sh.moveTo(0,0);sh.bezierCurveTo(r*.3,r*.3,r*.5,r*.18,r*.48,0);sh.bezierCurveTo(r*.5,-r*.18,r*.3,-r*.3,0,0);
    for(const s of[1,-1])P(q,G.puff(sh,r*.08),M.c(col),[0,0,0],[0,s>0?0:PI,0]);P(q,G.s(r*.1),M.c(dark(col,.15)),[0,0,0])});
  def('hat','krone','Krönchen',900,'#FFD35C',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.12,0],[0,0,.15]);P(q,G.cy(r*.42,r*.42,r*.16,true),M.gold?M.gold():M.c(col),[0,0,0]);for(let i=0;i<5;i++){const a=i/5*TAU;P(q,G.co(r*.08,r*.2),M.gold?M.gold():M.c(col),[Math.cos(a)*r*.4,r*.16,Math.sin(a)*r*.4]);P(q,G.s(r*.045),M.c(['#F0556E','#7FDCE6','#A6EBC3','#C6A9FF','#F0556E'][i]),[Math.cos(a)*r*.4,r*.28,Math.sin(a)*r*.4])}});
  def('hat','hexenhut','Zauberhut',520,'#9C7BE0',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.12,0],[-.05,0,.08]);P(q,G.cy(r*1.05,r*1.05,r*.05),M.c(col),[0,0,0]);const c=P(q,G.co(r*.62,r*1.4),M.c(col),[0,r*.7,0]);c.rotation.x=-.12;P(q,G.cy(r*.63,r*.63,r*.12,true),M.c('#FFD35C'),[0,r*.08,0]);P(q,G.s(r*.07),M.glow('#FFE27A',1.4),[r*.3,r*.45,r*.44])});
  /* Oberteile: Hülle nach der Rumpfform */
  const shell=(g,c,M,mat,from,to,o)=>torsoShell(g,c.body.shape,c.ys,c.rs,mat,Object.assign({from:c.tlo+(c.thi-c.tlo)*from,to:c.tlo+(c.thi-c.tlo)*to},o||{}));
  const hem=(g,c,M,col,f,grow)=>{const y=c.tlo+(c.thi-c.tlo)*f;const r=c.R?c.R(y)*(grow||1.06)+.02:c.rs[0]*1;P(g,G.to(r,.022*c.s),M.c(col),[0,y,0],[PI/2,0,0],[1,.9,1])};
  def('top','pulli','Kuschelpulli',480,'#F28CB0',(g,c,M,col)=>{shell(g,c,M,M.c(col),.24,.9);hem(g,c,M,dark(col,.12),.24);hem(g,c,M,dark(col,.12),.9,1.02)});
  def('top','ringelshirt','Ringelshirt',420,'#5B8DEF',(g,c,M,col)=>{shell(g,c,M,M.c('#ffffff',{map:stripes(col,'#FFFBF2',10)}),.3,.9)});
  def('top','tupfenkleid','Tupfenkleid',560,'#FFD35C',(g,c,M,col)=>{shell(g,c,M,M.c('#ffffff',{map:dots(col,'#FFFBF2')}),.05,.88,{flare:.35});hem(g,c,M,'#FFFBF2',.05,1.4)});
  def('top','latzhose','Latzhose',520,'#6E9AD0',(g,c,M,col)=>{shell(g,c,M,M.c(col),.08,.5);const y=c.tlo+(c.thi-c.tlo)*.62;const r=c.R?c.R(y):c.rs[0];const fz=r*.9*1.03+.01;P(g,G.bx(r*.9,(c.thi-c.tlo)*.26,.03,.02),M.c(col),[0,y,fz]);
    for(const s of[-1,1]){P(g,G.bx(.05*c.s,(c.thi-c.tlo)*.38,.03,.01),M.c(col),[s*r*.38,c.tlo+(c.thi-c.tlo)*.72,fz*.9],[-.3,0,0]);P(g,G.s(.035*c.s),M.c('#FFD35C'),[s*r*.36,y+(c.thi-c.tlo)*.12,fz+.02])}});
  def('top','regenjacke','Regenjacke',640,'#FFD35C',(g,c,M,col)=>{shell(g,c,M,M.c(col,{gloss:.8}),.12,.92,{grow:1.08});const y0=c.tlo+(c.thi-c.tlo)*.14,y1=c.tlo+(c.thi-c.tlo)*.86;const zf=(c.R?c.R((y0+y1)/2):c.rs[0])*.9*1.08+.015;
    for(let i=0;i<3;i++)P(g,G.s(.03*c.s),M.c(dark(col,.35)),[0,y0+(y1-y0)*(.25+i*.25),zf])});
  def('top','weste','Strickweste',460,'#A6EBC3',(g,c,M,col)=>{shell(g,c,M,M.c(col),.3,.86,{grow:1.07});hem(g,c,M,dark(col,.15),.3,1.08)});
  /* Hals */
  const neckY=c=>c.topY+.02*c.s,neckR=c=>c.hr*.46;
  def('neck','schal','Wollschal',260,'#F0556E',(g,c,M,col)=>{const y=neckY(c),r=neckR(c);P(g,G.to(r,r*.34),M.c(col,{map:stripes(col,light(col,.5),6)}),[0,y,0],[PI/2,0,0]);P(g,G.bx(r*.5,r*1.6,r*.22,r*.1),M.c(col),[r*.45,y-r*.9,r*.9],[.2,0,.15])});
  def('neck','fliege','Fliege',180,'#D8505E',(g,c,M,col)=>{const y=neckY(c)-.02*c.s,r=neckR(c);const z=(c.R?c.R(y)*.9:r)+.02;const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(r*.6,r*.35);sh.lineTo(r*.6,-r*.35);sh.lineTo(0,0);
    for(const s of[1,-1])P(g,G.puff(sh,r*.12),M.c(col),[0,y,z],[0,s>0?0:PI,0]);P(g,G.s(r*.14),M.c(dark(col,.2)),[0,y,z+.01])});
  def('neck','perlenkette','Perlenkette',520,'#FFF6E6',(g,c,M,col)=>{const y=neckY(c)-.06*c.s;const r=(c.R?c.R(y):neckR(c))*1.0+.03;for(let i=0;i<16;i++){const a=-PI*.05+i/15*PI*1.1;P(g,G.s(.03*c.s),M.gloss?M.gloss(col):M.c(col),[Math.cos(a)*r,y-Math.sin(a)*.05*c.s,Math.sin(a)*r*.9])}});
  def('neck','halstuch','Halstuch',240,'#6FC4B8',(g,c,M,col)=>{const y=neckY(c),r=neckR(c);P(g,G.to(r*1.02,r*.18),M.c(col,{map:dots(col,'#FFFBF2')}),[0,y,0],[PI/2,0,0]);const sh=new THREE.Shape();sh.moveTo(-r*.7,0);sh.lineTo(r*.7,0);sh.lineTo(0,-r*1.1);sh.lineTo(-r*.7,0);P(g,G.puff(sh,r*.06),M.c(col,{map:dots(col,'#FFFBF2')}),[0,y,r*.95],[.25,0,0])});
  def('neck','kleeblatt','Kleeblatt-Anstecker',160,'#6BCB5A',(g,c,M,col)=>{const y=c.shY-.05*c.s;const z=(c.R?c.R(y)*.9:c.rs[0])+.02;const q=grp(g,[c.shX*.45,y,z]);for(let i=0;i<4;i++){const a=i/4*TAU+.4;P(q,G.s(.04*c.s),M.c(col),[Math.cos(a)*.035*c.s,Math.sin(a)*.035*c.s,0],null,[1,1,.4])}});
  /* Gesicht: vor dem Gesicht (H.front) */
  def('face','brille','Runde Brille',260,'#8A5A40',(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.12,z=H.front+r*.04;for(const s of[-1,1])P(g,G.to(r*.2,r*.028),M.c(col),[s*r*.3,y,z]);P(g,G.cy(r*.02,r*.02,r*.2),M.c(col),[0,y,z],[0,0,PI/2])});
  def('face','herzbrille','Herz-Sonnenbrille',340,'#F0556E',(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.12,z=H.front+r*.05;const sh=new THREE.Shape();const k=r*.2;sh.moveTo(0,-k);sh.bezierCurveTo(k*1.4,-k*.1,k*.9,k*1.1,0,k*.45);sh.bezierCurveTo(-k*.9,k*1.1,-k*1.4,-k*.1,0,-k);
    for(const s of[-1,1]){P(g,G.puff(sh,r*.05),M.c(col),[s*r*.3,y,z]);P(g,G.puff(sh,r*.02),M.c('#3E3650',{gloss:1}),[s*r*.3,y,z+r*.03],null,[.75,.75,1])}P(g,G.cy(r*.02,r*.02,r*.2),M.c(col),[0,y+r*.04,z],[0,0,PI/2])});
  def('face','monokel','Monokel',450,'#FFD35C',(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.12,z=H.front+r*.04;P(g,G.to(r*.2,r*.03),M.gold?M.gold():M.c(col),[r*.3,y,z]);P(g,G.circ(r*.19),M.c('#DDF4FF',{opacity:.35}),[r*.3,y,z]);P(g,G.tu([[r*.48,y-r*.1,z],[r*.55,y-r*.5,z-r*.1],[r*.6,y-r*.8,z-r*.2]],r*.012),M.gold?M.gold():M.c(col))});
  def('face','schnurrbart','Schnurrbart',300,'#5A3A2A',(g,M,H,col)=>{const r=H.r;const y=H.faceY-r*.2,z=H.front+r*.03;for(const s of[-1,1])P(g,G.tu([[0,y,z],[s*r*.18,y-r*.04,z],[s*r*.32,y,z-r*.03],[s*r*.38,y+r*.1,z-r*.06],[s*r*.3,y+r*.14,z-r*.06]],r*.07,r*.02),M.c(col))});
  def('face','wangenherz','Glitzer-Wangen',150,'#FF8FB8',(g,M,H,col)=>{const r=H.r;const y=H.faceY-r*.02,z=H.front-r*.02;for(const s of[-1,1]){const q=grp(g,[s*r*.55,y,z*.92]);q.lookAt(s*r*1.5,y,z*2);for(let i=0;i<3;i++)P(q,G.oct(r*.04),M.glow(col,1.2),[(i-1)*r*.07,(i%2)*r*.05,0])}});
  /* ---- Planeten-Mode ---- */
  def('hat','pilzkappe','Pilzkappe',380,'#E8505B',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.3,0],[0,0,.12]);P(q,G.hs(r*1.05),M.c(col,{gloss:.5}),[0,0,0],null,[1,.72,1]);P(q,G.cy(r*1.02,r*.9,r*.08),M.c('#FFF4E6'),[0,-r*.02,0]);
    for(let i=0;i<7;i++){const a=i*2.4,b=.35+(i%3)*.22;P(q,G.s(r*.1),M.c('#FFFFFF'),[Math.cos(a)*Math.sin(b)*r*1.02,Math.cos(b)*r*.74,Math.sin(a)*Math.sin(b)*r*1.02],null,[1,.5,1])}});
  def('hat','ohrenschuetzer','Ohrenschützer',260,'#F28CB0',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*.98,r*.05,PI),M.c(dark(col,.3)),[0,H.cy,0],[0,PI/2,0]);for(const s of[-1,1])P(g,G.s(r*.3),M.plush?M.plush(col):M.c(col),[s*(H.sideX||r)*.98,H.cy,0],null,[.6,1,1])});
  def('face','schutzbrille','Schutzbrille',330,'#F7B84B',(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.15,z=H.front;P(g,G.to(r*.98,r*.06,PI*1.1),M.c('#4A4458'),[0,y,0],[PI/2,0,PI*-.05]);for(const s of[-1,1]){P(g,G.cy(r*.2,r*.22,r*.14),M.c(col),[s*r*.3,y,z],[PI/2,0,0]);P(g,G.circ(r*.16),M.c('#9FE0F0',{gloss:1.2}),[s*r*.3,y,z+r*.075])}});
  def('top','daunenjacke','Daunenjacke',620,'#8FD0F0',(g,c,M,col)=>{for(let i=0;i<4;i++)shell(g,c,M,M.c(i%2?col:light(col,.12),{gloss:.3}),.18+i*.18,.36+i*.18,{grow:1.1+.02*Math.sin(i*1.7)});hem(g,c,M,'#FFFFFF',.9,1.08)});
  def('top','poncho','Poncho',440,'#E0876A',(g,c,M,col)=>{shell(g,c,M,M.c('#ffffff',{map:stripes(col,'#FFE3B8',8)}),.34,.9,{grow:1.1,flare:.5})});
  def('top','umhang','Sporen-Umhang',560,'#9C7BE0',(g,c,M,col)=>{const y1=c.tlo+(c.thi-c.tlo)*.9,y0=c.tlo+(c.thi-c.tlo)*.05;const r=c.R?c.R((y0+y1)/2):c.rs[0];const sh=new THREE.Shape();sh.moveTo(-r*.55,0);sh.lineTo(r*.55,0);sh.lineTo(r*.95,-(y1-y0));sh.lineTo(-r*.95,-(y1-y0));sh.lineTo(-r*.55,0);
    P(g,G.puff(sh,.03),M.c(col),[0,y1,-r*.95],[.12,0,0]);for(let i=0;i<5;i++)P(g,G.s(.04*c.s),M.glow('#B8FFE8',1.2),[(i-2)*r*.3,y1-(y1-y0)*.55,-r*1.1]);hem(g,c,M,dark(col,.2),.9,1.04)});
  def('neck','blumenkette','Blumenkette',280,'#FF8FB8',(g,c,M,col)=>{const y=neckY(c)-.04*c.s;const r=(c.R?c.R(y):neckR(c))+.05;const cs=[col,'#FFD35C','#FFFFFF','#7FDCE6'];for(let i=0;i<14;i++){const a=i/14*TAU;const q=grp(g,[Math.cos(a)*r,y-Math.max(0,Math.sin(a))*.08*c.s,Math.sin(a)*r*.9]);for(let k=0;k<5;k++){const b=k/5*TAU;P(q,G.s(.028*c.s),M.c(cs[i%4]),[Math.cos(b)*.03*c.s,Math.sin(b)*.03*c.s,0])}}});
  /* was jeder Planet trägt (Biom-passend) – plus Pariser Klassiker überall */
  const PLANET={kompost:['blumenkranz','strohhut','schleife','kappe','pulli','latzhose','weste','kleeblatt','halstuch'],
    frost:['muetze','ohrenschuetzer','daunenjacke','pulli','schal','weste','perlenkette'],
    wueste:['strohhut','poncho','halstuch','herzbrille','kappe','ringelshirt'],
    korallen:['strohhut','blumenkette','ringelshirt','herzbrille','tupfenkleid','schleife'],
    pilz:['pilzkappe','hexenhut','umhang','wangenherz','tupfenkleid','schal'],
    schrott:['schutzbrille','kappe','latzhose','regenjacke','zylinder','kleeblatt']};
  const PARIS=['baskenmuetze','zylinder','fliege','perlenkette','monokel','schnurrbart','brille','ringelshirt','krone'];
  const byId=new Map(L.map(x=>[x.slot+':'+x.id,x]));
  const find=(slot,id)=>byId.get(slot+':'+id);
  /* ---------- Anziehen ---------- */
  function dress(g,c,d){const W=d.clothes;if(!W)return;const M=c.m;const H=c.H;const colOf=(slot,it)=>{const i=W.col&&W.col[slot];return Number.isInteger(i)&&SKIN_COLORS[i]?SKIN_COLORS[i]:it.col};
    for(const S of SLOTS){const id=W[S.id];if(!id)continue;const it=find(S.id,id);if(!it)continue;const col=colOf(S.id,it);const q=new THREE.Group();q.name='kleid-'+S.id;
      if(S.id==='hat'||S.id==='face'){if(!H||H.top==null)continue;it.b(q,M,H,col)}else it.b(q,c,M,col);g.add(q)}
    /* Zusatzteile (z. B. Schnurrbart UND Monokel) */for(const[sl,id,ci]of W.more||[]){const it=find(sl,id);if(!it)continue;const q=new THREE.Group();const col=ci!=null&&SKIN_COLORS[ci]?SKIN_COLORS[ci]:it.col;if(sl==='hat'||sl==='face')it.b(q,M,H,col);else it.b(q,c,M,col);g.add(q)}}
  function sanitizeClothes(w){if(!w||typeof w!=='object')return null;const o={col:{}};let any=false;for(const S of SLOTS){if(w[S.id]&&find(S.id,w[S.id])){o[S.id]=w[S.id];any=true}const i=w.col&&w.col[S.id];if(Number.isInteger(i)&&i>=0&&i<SKIN_COLORS.length)o.col[S.id]=i}if(Array.isArray(w.more)){o.more=w.more.filter(x=>Array.isArray(x)&&find(x[0],x[1])).slice(0,3);if(o.more.length)any=true}return any?o:null}
  /* zufälliges, aber stimmiges Outfit (Bewohner:innen) */
  function random(r,pid){const o={col:{}};const pk=a=>a[Math.floor(r()*a.length)];const pool=pid&&PLANET[pid]?L.filter(x=>PLANET[pid].includes(x.id)||(r()<.1&&PARIS.includes(x.id))):L;const of=sl=>{const l=pool.filter(x=>x.slot===sl);return l.length?pk(l).id:null};if(r()<.7)o.hat=of('hat');if(r()<.75)o.top=of('top');if(r()<.45)o.neck=of('neck');if(r()<.25)o.face=of('face');for(const k of['hat','top','neck','face'])if(!o[k])delete o[k];
    const base=Math.floor(r()*SKIN_COLORS.length);for(const s of['hat','top','neck','face'])if(r()<.5)o.col[s]=(base+Math.floor(r()*3))%SKIN_COLORS.length;return o}
  const forPlanet=pid=>L.filter(x=>(PLANET[pid]||PLANET.kompost).includes(x.id)||PARIS.includes(x.id));
  return{SLOTS,LIST:L,find,dress,sanitize:sanitizeClothes,random,forPlanet,PLANET,PARIS}
})();
