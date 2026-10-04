/* =====================================================================
   CYBORG-LABOR · rocket.js
   ROCKET: Rakete aus Teilen (Spitze, Rumpf, Flossen, Triebwerk, Fenster,
           Extra) + Farben/Muster, Garage mit Live-Vorschau.
   SPACE:  Selbst fliegen! Beim Start zoomt die Kamera ins Sonnensystem,
           man steuert zwischen kreisenden Planeten (mit Ringen, Asteroiden-
           gürtel, Sternenstaub) und landet, wo man will.
   REPAIR: Auf neuen Planeten geht die Landung schief: Teile (Motor, Kolben …)
           liegen verstreut und müssen gefunden werden, bevor es weitergeht.
   ===================================================================== */
const ROCKET=(()=>{
  const V=THREE.Vector3;
  const PARTS_R={
    nose:{n:'Spitze',opts:[['klassik','Klassisch',0],['kuppel','Glaskuppel',600],['nadel','Nadel',400],['stern','Sternspitze',900],['pilz','Pilzhut',700],['kristall','Kristall',1200]]},
    body:{n:'Rumpf',opts:[['schlank','Schlank',0],['bauchig','Bauchig',500],['kapsel','Kapsel',700],['tonne','Nieten-Tonne',800],['ringe','Ringsegmente',1000],['ufo','Untertasse',1500]]},
    fins:{n:'Flossen',opts:[['drei','Drei Flossen',0],['delta','Delta-Flügel',600],['fluegel','Grosse Flügel',900],['ring','Ringflosse',800],['tentakel','Tentakel',1100],['keine','Keine',0]]},
    engine:{n:'Triebwerk',opts:[['einfach','Einfach',0],['dreifach','Dreifach-Düse',900],['ionen','Ionen-Ring',1400],['turbo','Turbo',1200],['bio','Bio-Blätter',800]]},
    win:{n:'Fenster',opts:[['bullauge','Bullauge',0],['doppelt','Doppelt',300],['visier','Visier',500],['kuppel','Aussichtskuppel',800]]},
    extra:{n:'Extra',opts:[['keins','Nichts',0],['antenne','Antenne',200],['solar','Solarflügel',600],['fahne','Fahne',250],['lichter','Lichterkette',400],['auspuff','Seitenraketen',900]]}};
  const COLS=['#FFFDF7','#F0556E','#FF9E45','#FFE27A','#7CC46A','#56C6B6','#6AA8F0','#8E6BD1','#FF8FB8','#3B3450','#C98C5A','#AEB9C8'];
  const PATS=[['keins','Einfarbig'],['streifen','Streifen'],['punkte','Punkte'],['karo','Karo'],['flammen','Flammen']];
  function spec(){const d={nose:'klassik',body:'schlank',fins:'drei',engine:'einfach',win:'bullauge',extra:'keins',col:'#FFFDF7',acc:'#F0556E',pat:'streifen'};return Object.assign(d,SAVE.rocket||{})}
  function owned(cat,id){const o=PARTS_R[cat].opts.find(x=>x[0]===id);return!o||o[2]===0||(SAVE.rocketOwned||[]).includes(cat+':'+id)}
  function stats(s){s=s||spec();const sp={einfach:1,dreifach:1.25,ionen:1.4,turbo:1.55,bio:1.15}[s.engine]||1;const hd={drei:1,delta:1.2,fluegel:1.35,ring:1.15,tentakel:1.25,keine:.85}[s.fins]||1;const ar={schlank:1,bauchig:1.2,kapsel:1.1,tonne:1.35,ringe:1.2,ufo:1.5}[s.body]||1;return{speed:sp,handling:hd,armor:ar}}
  function patTex(s){return ctex('rk-pat-'+s.pat+s.col+s.acc,256,256,(x,w,h)=>{x.fillStyle=s.col;x.fillRect(0,0,w,h);x.fillStyle=s.acc;
    if(s.pat==='streifen'){for(let i=0;i<4;i++)x.fillRect(0,i*64+40,w,14)}else if(s.pat==='punkte'){for(let i=0;i<6;i++)for(let j=0;j<4;j++){x.beginPath();x.arc(i*43+(j%2)*21+10,j*64+32,11,0,TAU);x.fill()}}
    else if(s.pat==='karo'){for(let i=0;i<8;i++)for(let j=0;j<8;j++)if((i+j)%2)x.fillRect(i*32,j*32,32,32)}else if(s.pat==='flammen'){x.beginPath();x.moveTo(0,h);for(let i=0;i<=8;i++){x.quadraticCurveTo(i*32+8,h*.55-(i%2)*30,i*32+16,h*.78);x.quadraticCurveTo(i*32+24,h*.6,(i+1)*32,h*.8)}x.lineTo(w,h);x.fill()}})}
  /* ---------- Bauen (Boden der Düse bei y=0, Höhe ~4) ---------- */
  function build(s,m){s=s||spec();const g=new THREE.Group();const col=m.c(s.col,{gloss:.8,rim:.5}),acc=m.c(s.acc,{gloss:.9,rim:.5});const pm=s.pat!=='keins'?m.tex('rkp-'+s.pat+s.col+s.acc,patTex(s),{gloss:.8}):col;
    let top=3,rad=.8,wy=2.05;const L=pts=>G.la(pts);
    switch(s.body){case 'bauchig':P(g,L([[0,.35],[.7,.4],[1,1.2],[1,2.1],[.75,2.9],[0,3]]),pm);rad=1;top=2.95;break;
      case 'kapsel':P(g,G.ca(.8,1.8),pm,[0,1.7,0]);rad=.8;top=2.9;break;
      case 'tonne':P(g,G.cy(.85,.85,2.4),pm,[0,1.55,0]);for(let i=0;i<4;i++)P(g,G.to(.86,.05),m.steel(),[0,.5+i*.7,0],[PI/2,0,0]);for(let i=0;i<10;i++){const a=i/10*TAU;P(g,G.s(.05),m.steel(),[Math.sin(a)*.86,1.55,Math.cos(a)*.86])}rad=.85;top=2.75;break;
      case 'ringe':for(let i=0;i<4;i++)P(g,G.cy(.72-i*.06,.78-i*.06,.62),i%2?pm:col,[0,.66+i*.64,0]);for(let i=0;i<4;i++)P(g,G.to(.78-i*.06,.05),acc,[0,.36+i*.64,0],[PI/2,0,0]);rad=.72;top=2.9;break;
      case 'ufo':P(g,G.s(1.5),pm,[0,1.2,0],null,[1,.35,1]);P(g,G.to(1.5,.08),acc,[0,1.2,0],[PI/2,0,0]);P(g,G.cy(.6,.9,.6),col,[0,.8,0]);rad=.7;top=1.6;wy=1.25;break;
      default:P(g,L([[0,.35],[.62,.4],[.78,1.0],[.8,2.0],[.7,2.8],[0,2.9]]),pm)}
    /* Spitze */switch(s.nose){case 'kuppel':P(g,G.hs(rad*.9),m.glass('#cfefff'),[0,top-.05,0]);P(g,G.to(rad*.9,.05),acc,[0,top-.05,0],[PI/2,0,0]);break;
      case 'nadel':P(g,G.co(rad*.7,1.8,20),acc,[0,top+.85,0]);P(g,G.s(.06),m.gold(),[0,top+1.8,0]);break;
      case 'stern':P(g,G.co(rad*.8,.9,20),acc,[0,top+.4,0]);P(g,G.star(.35,.16,5,.12),m.gloss('#FFE27A'),[0,top+1.1,0]);break;
      case 'pilz':P(g,G.cy(rad*.5,rad*.7,.3),m.c('#FFF1DA'),[0,top+.1,0]);P(g,G.hs(rad*1.3),m.c('#E8505B',{gloss:.7}),[0,top+.22,0],null,[1,.7,1]);for(let i=0;i<6;i++){const a=i*1.1;P(g,G.s(.1),m.c('#FFFBF0'),[Math.cos(a)*rad*.9,top+.52,Math.sin(a)*rad*.9],null,[1,.4,1])}break;
      case 'kristall':P(g,NH.crysGeo(rad*.7,1.6),m.crystal('#C6A9FF'),[0,top+.05,0]);break;
      default:P(g,L([[0,top-.1],[rad*.78,top-.05],[rad*.55,top+.45],[rad*.25,top+.85],[0,top+1]]),acc);P(g,G.s(.11),m.gloss('#FFE27A'),[0,top+1.02,0])}
    /* Fenster */const fz=s.body==='ufo'?1.25:rad*.97;const winAt=(y,x,r)=>{const q=grp(g,[x||0,y,0]);P(q,G.to(r,.06),m.chrome(),[0,0,fz]);P(q,G.cy(r*.92,r*.92,.05),m.glass('#bfe6ff'),[0,0,fz-.02],[PI/2,0,0]);P(q,G.s(r*.3),m.flat('#ffffff'),[-r*.35,r*.35,fz+.02],null,[1,1,.3]).userData.noOutline=true};
    if(s.win==='doppelt'){winAt(wy+.25,0,.2);winAt(wy-.3,0,.2)}else if(s.win==='visier'){const q=grp(g,[0,wy,0]);P(q,G.cy(fz*1.01,fz*1.01,.35,true),m.glass('#9fe0ff'),[0,0,0],null,[1,1,1]).material.side=THREE.DoubleSide}
    else if(s.win==='kuppel'){P(g,G.hs(.45),m.glass('#cfefff'),[0,wy-.1,fz-.1],[PI/2,0,0])}else winAt(wy,0,.26);
    /* Flossen */const fm=acc;const ny=s.body==='ufo'?.6:.9;
    if(s.fins==='drei'||s.fins==='delta'){const n=s.fins==='drei'?3:4;for(let i=0;i<n;i++){const a=i/n*TAU;const f=grp(g,[Math.sin(a)*rad*.85,ny,Math.cos(a)*rad*.85],[0,a+PI/2,0]);P(f,G.puff(sshp(s.fins==='drei'?[[0,-.6],[.55,-.85],[.55,-.35],[0,.6]]:[[0,-.7],[.8,-.8],[.2,.5],[0,.7]]),.1,.04),fm,[0,0,0])}}
    else if(s.fins==='fluegel'){both(sd=>{const f=grp(g,[sd*rad*.8,1.2,0],[0,sd>0?0:PI,0]);P(f,G.puff(sshp([[0,-.6],[1.5,-.9],[1.6,-.5],[.2,.8]]),.1,.04),fm,[0,0,0],[PI/2,0,0])})}
    else if(s.fins==='ring'){P(g,G.to(rad*1.35,.1),fm,[0,.8,0],[PI/2,0,0]);for(let i=0;i<4;i++){const a=i/4*TAU;P(g,G.bx(.08,.5,rad*.6,.03),fm,[Math.sin(a)*rad*1.05,.8,Math.cos(a)*rad*1.05],[0,a,0])}}
    else if(s.fins==='tentakel'){for(let i=0;i<5;i++){const a=i/5*TAU;const c=Math.cos(a),sn=Math.sin(a);P(g,G.tu([[sn*rad*.7,.8,c*rad*.7],[sn*rad*1.3,.4,c*rad*1.3],[sn*rad*1.2,-.1,c*rad*1.2],[sn*rad*1.5,-.3,c*rad*1.5]],.12,.04),fm)}}
    /* Triebwerk */const eng=grp(g,[0,0,0]);g.userData.flames=[];const flame=(x,z,r)=>{const f=P(eng,G.co(r*.9,r*3,12),m.glow('#FFB45A',1.6),[x,-r*1.4,z],[PI,0,0]);f.castShadow=false;f.userData.noOutline=true;f.visible=false;g.userData.flames.push(f)};
    if(s.engine==='dreifach'){for(let i=0;i<3;i++){const a=i/3*TAU;const x=Math.sin(a)*.4,z=Math.cos(a)*.4;P(eng,G.la([[0,0],[.22,0],[.3,.36],[0,.4]]),m.steel(),[x,0,z]);flame(x,z,.2)}}
    else if(s.engine==='ionen'){P(eng,G.to(.45,.1),m.glow('#7FDCE6',1.4),[0,.25,0],[PI/2,0,0]);P(eng,G.la([[0,0],[.4,0],[.5,.4],[0,.45]]),m.steel(),[0,0,0]);flame(0,0,.35)}
    else if(s.engine==='turbo'){P(eng,G.la([[0,-.15],[.55,-.15],[.6,.4],[0,.45]]),m.copper(),[0,0,0]);for(let i=0;i<6;i++)P(eng,G.bx(.05,.4,.1,.02),m.steel(),[Math.sin(i)*.58,.15,Math.cos(i)*.58],[0,i,0]);flame(0,0,.45)}
    else if(s.engine==='bio'){P(eng,G.la([[0,0],[.3,0],[.42,.36],[0,.4]]),m.c('#8A5A44'),[0,0,0]);for(let i=0;i<5;i++){const a=i/5*TAU;const q=grp(eng,[Math.sin(a)*.35,.1,Math.cos(a)*.35],[0,a,0]);P(q,NH.flatLeaf(NH.leafShape(.5,.18),.03,.3),m.c('#7CC46A',{rim:.6}),[0,0,0],[0,0,-.6])}flame(0,0,.28)}
    else{P(eng,G.la([[0,0],[.3,0],[.42,.36],[0,.4]]),m.steel(),[0,0,0]);flame(0,0,.3)}
    /* Extra */const topY=top+(s.nose==='nadel'?1.8:s.nose==='kuppel'?.8:1.05);
    if(s.extra==='antenne'){bt(g,[0,topY,0],[0,topY+.7,0],.02,m.steel());P(g,G.s(.08),m.glow('#F0556E',2),[0,topY+.72,0])}
    else if(s.extra==='solar'){both(sd=>{bt(g,[sd*rad*.8,2.2,0],[sd*(rad+.6),2.2,0],.03,m.steel());P(g,G.bx(.9,.04,.5,.01),m.c('#3B5EA8',{gloss:1}),[sd*(rad+1.05),2.2,0])})}
    else if(s.extra==='fahne'){const f=grp(g,[rad*.7,top-.3,0]);bt(f,[0,0,0],[0,.9,0],.02,m.steel());P(f,G.puff(sshp([[0,0],[.55,-.12],[0,-.3]]),.02,.01),acc,[0,.88,0],[0,0,0]);g.userData.flag=f}
    else if(s.extra==='lichter'){for(let i=0;i<10;i++){const a=i/10*TAU;P(g,G.s(.06),m.glow(['#FFE27A','#FF8FB8','#7FDCE6'][i%3],2),[Math.sin(a)*(rad+.05),1.6+Math.sin(a*2)*.1,Math.cos(a)*(rad+.05)])}}
    else if(s.extra==='auspuff'){both(sd=>{P(g,G.ca(.18,.8),acc,[sd*(rad+.2),1,0]);P(g,G.co(.18,.3,12),col,[sd*(rad+.2),1.65,0])})}
    g.userData.h=topY+.2;return g}
  /* Raketen-Station mit aktueller Rakete bestücken */
  function dress(rk,M){if(!rk)return;while(rk.children.length){const c=rk.children[0];rk.remove(c);disposeTree(c)}QF=HIGH?.7:.45;const g=build(spec(),M||makeMats({skin:'haut',color:0}));QF=1;addOutlines(g);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});rk.add(g);rk.userData.model=g;if(REPAIR.broken())REPAIR.crashPose(rk)}
  /* ---------- Garage: Anpassen mit Live-Vorschau ---------- */
  function customize(){const w=UI.win('Raketen-Garage',{size:'wide',onClose:()=>{cancelAnimationFrame(raf);rr.dispose();const pl=GAME.G.places.find(p=>p.build==='rocket');if(pl&&pl.obj)dress(pl.obj.children[0]&&pl.obj.children[0].userData.rocket)}});
    let cur=Object.assign({},spec());const row=el('div','garage');const left=el('div','gprev');const cv=document.createElement('canvas');cv.width=320;cv.height=380;cv.style.cssText='width:100%;max-width:320px;aspect-ratio:320/380;border-radius:18px;background:linear-gradient(#2B2F66,#6A5A9E)';left.append(cv);
    const st=el('div','gstats');left.append(st);const right=el('div','gopts');row.append(left,right);w.body.append(row);
    const rr=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});rr.outputEncoding=THREE.sRGBEncoding;rr.setPixelRatio(Math.min(2,devicePixelRatio));rr.setSize(320,380,false);const sc=new THREE.Scene();cozyLights(sc);const cam=new THREE.PerspectiveCamera(32,320/380,.1,100);const M=makeMats({skin:'haut',color:0});
    let model=null;const rebuild=()=>{if(model){sc.remove(model);disposeTree(model)}QF=.8;model=build(cur,M);QF=1;addOutlines(model);sc.add(model);const h=model.userData.h||4;cam.position.set(0,h*.55,h*1.55);cam.lookAt(0,h*.45,0);
      const s=stats(cur);st.replaceChildren(...[['Tempo',s.speed/1.55],['Wendigkeit',s.handling/1.35],['Panzerung',s.armor/1.5]].map(([n,v])=>{const r2=el('div','need');r2.append(el('span',null,n));const b=el('div','nbar');const i=el('i');i.style.width=Math.round(v*100)+'%';i.style.background='#8C6FE0';b.append(i);r2.append(b);return r2}))};
    let raf=0;const t0=performance.now();const spin=()=>{raf=requestAnimationFrame(spin);if(model)model.rotation.y=(performance.now()-t0)/1400;rr.render(sc,cam)};spin();
    const draw=()=>{right.replaceChildren();for(const[cat,P_]of Object.entries(PARTS_R)){right.append(el('h3',null,P_.n));const gr=el('div','chips');for(const[id,n,price]of P_.opts){const own=owned(cat,id);const b=btn(n+(own?'':' · '+fmt(price)+' T'),'small'+(cur[cat]===id?' primary':''),()=>{
        if(!owned(cat,id)){if(SAVE.money<price){SND.play('error');UI.toast('Zu wenig Taler.');return}money(-price);(SAVE.rocketOwned=SAVE.rocketOwned||[]).push(cat+':'+id);SND.play('j_buy')}cur[cat]=id;rebuild();draw()});gr.append(b)}right.append(gr)}
      for(const[key,lab]of[['col','Farbe'],['acc','Akzent']]){right.append(el('h3',null,lab));const gr=el('div','chips');for(const c of COLS){const b=el('button','swatch');b.type='button';b.style.background=c;b.setAttribute('aria-pressed',cur[key]===c);b.onclick=()=>{cur[key]=c;rebuild();draw()};gr.append(b)}right.append(gr)}
      right.append(el('h3',null,'Muster'));const pg=el('div','chips');for(const[id,n]of PATS){pg.append(btn(n,'small'+(cur.pat===id?' primary':''),()=>{cur.pat=id;rebuild();draw()}))}right.append(pg)};
    draw();rebuild();w.foot.append(btn('Speichern','primary',()=>{SAVE.rocket=cur;persist();SND.jingle('j_success');UI.toast('Deine Rakete ist fertig!');w.close()}),btn('Abbrechen',null,()=>w.close()))}
  return{build,dress,customize,spec,stats,PARTS_R}
})();

/* =================== Crash & Reparatur =================== */
const REPAIR=(()=>{
  const V=THREE.Vector3;const M=makeMats({skin:'haut',color:0});
  const PARTS=[['motor','Motor'],['kolben','Kolben'],['zuendkerze','Zündkerze'],['treibstoffzelle','Treibstoffzelle'],['navichip','Navi-Chip'],['hitzeschild','Hitzeschild'],['duese','Düse']];
  let objs=[];let hud=null;
  const broken=()=>SAVE.rocketBroken&&SAVE.rocketBroken.pid===GAME.G.id&&SAVE.rocketBroken.parts.some(p=>!p.found)||SAVE.rocketBroken&&SAVE.rocketBroken.pid===GAME.G.id&&!SAVE.rocketBroken.fixed;
  function model(id){const g=new THREE.Group();QF=.6;
    if(id==='motor'){P(g,G.bx(.7,.5,.5,.08),M.c('#AEB9C8',{gloss:.8}),[0,.3,0]);for(let i=0;i<4;i++)P(g,G.bx(.72,.04,.52,.01),M.steel(),[0,.15+i*.1,0]);P(g,G.cy(.12,.12,.2),M.c('#F0556E'),[0,.62,0])}
    else if(id==='kolben'){P(g,G.cy(.18,.18,.35),M.chrome(),[0,.45,0]);bt(g,[0,.3,0],[.15,0,0],.05,M.steel());P(g,G.to(.08,.03),M.steel(),[.15,.02,0],[PI/2,0,0])}
    else if(id==='zuendkerze'){P(g,G.cy(.08,.08,.35),M.c('#FFFDF7'),[0,.35,0]);P(g,G.cy(.1,.1,.12,),M.steel(),[0,.12,0]);P(g,G.s(.05),M.glow('#7FDCE6',2),[0,.56,0])}
    else if(id==='treibstoffzelle'){P(g,G.ca(.18,.35),M.glass('#b8ffb0'),[0,.4,0]);P(g,G.ca(.12,.3),M.glow('#6BFF7A',1.3),[0,.4,0])}
    else if(id==='navichip'){P(g,G.bx(.5,.06,.5,.02),M.c('#3F7F4F'),[0,.04,0]);P(g,G.bx(.22,.08,.22,.02),M.c('#3B3450'),[0,.11,0]);for(let i=0;i<5;i++)P(g,G.bx(.02,.03,.12,0),M.gold(),[-.2+i*.1,.07,.25])}
    else if(id==='hitzeschild'){P(g,G.cy(.4,.45,.08),M.c('#C8703E',{gloss:.4}),[0,.05,0]);P(g,G.to(.4,.04),M.steel(),[0,.1,0],[PI/2,0,0])}
    else{P(g,G.la([[0,0],[.3,0],[.42,.36],[0,.4]]),M.steel(),[0,0,0])}
    /* Leuchtsäule, weit sichtbar */const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.35,14,12,1,true),new THREE.MeshBasicMaterial({color:'#FFE27A',transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));beam.position.y=7;beam.userData.noOutline=true;g.add(beam);
    QF=1;addOutlines(g);return g}
  function crash(){const G_=GAME.G;const pl=G_.places.find(p=>p.build==='rocket');if(!pl)return;const r=Math.random;const n=4;const list=[...PARTS].sort(()=>r()-.5).slice(0,n);const parts=[];
    for(const[id,name]of list){let p=null;for(let i=0;i<200&&!p;i++){const q=GAME.randLand(r,G_.sea+.3);if(!q)continue;const d=q.angleTo(pl.dir)*G_.R;if(d>18&&d<Math.min(75,G_.R*1.6)&&!GAME.nearPlace(q,1.2))p=q}if(p)parts.push({id,name,p:[p.x,p.y,p.z],found:false})}
    SAVE.rocketBroken={pid:G_.id,parts,fixed:false};persist();spawn();const rk=pl.obj&&pl.obj.children[0]&&pl.obj.children[0].userData.rocket;if(rk)crashPose(rk);
    SND.play('error');GAME.W.fx(pl.dir,'rauch',20);setTimeout(()=>UI.talk('Bordcomputer',['Oh nein – Bruchlandung! Bei der Landung sind Teile abgefallen.','Gesucht: '+parts.map(p=>p.name).join(', ')+'.','Folge den leuchtenden Säulen. Erst wenn alles repariert ist, kannst du wieder starten.'],{voice:{pitch:260,kind:'robot'},color:'#56C6B6'}),1200)}
  function crashPose(rk){const m=rk.userData.model;if(!m)return;m.rotation.z=1.15;m.position.set(1.2,.2,0);rk.userData.smoke=true}
  function spawn(){clear();const B=SAVE.rocketBroken;if(!B||B.pid!==GAME.G.id)return;for(const pt of B.parts){if(pt.found)continue;const g=model(pt.id);const p=new V(...pt.p);GAME.placeObj(g,p,Math.random()*6,0);GAME.scene.add(g);objs.push({pt,g,p})}hudShow()}
  function clear(){for(const o of objs){o.g.parent&&o.g.parent.remove(o.g);disposeTree(o.g)}objs=[];if(hud){hud.remove();hud=null}}
  function targets(){return objs.filter(o=>!o.pt.found).map(o=>({kind:'rpart',p:o.p,r:1.8,label:o.pt.name+' aufheben',prio:-.5,act:()=>take(o)}))}
  function take(o){o.pt.found=true;persist();o.g.parent&&o.g.parent.remove(o.g);objs=objs.filter(x=>x!==o);SND.jingle('j_success');GAME.W.fx(o.p,'stern',10);const B=SAVE.rocketBroken;const left=B.parts.filter(p=>!p.found).length;
    UI.toast(o.pt.name+' gefunden!'+(left?` Noch ${left} Teile.`:' Alle Teile da – zurück zur Rakete und reparieren!'),3200);hudShow()}
  function repairAt(){const B=SAVE.rocketBroken;if(!B)return false;const left=B.parts.filter(p=>!p.found);if(left.length){UI.talk('Bordcomputer',['Die Rakete ist noch kaputt.','Es fehlen: '+left.map(p=>p.name).join(', ')+'. Folge den Lichtsäulen!'],{voice:{pitch:260,kind:'robot'},color:'#56C6B6'});return true}
    SND.play('metal');setTimeout(()=>SND.play('metal'),400);setTimeout(()=>SND.play('powerup'),900);const pl=GAME.G.places.find(p=>p.build==='rocket');GAME.W.fx(pl.dir,'funke',16);B.fixed=true;SAVE.rocketBroken=null;SAVE.stats.repairs=(SAVE.stats.repairs||0)+1;persist();hudShow();
    const rk=pl&&pl.obj&&pl.obj.children[0]&&pl.obj.children[0].userData.rocket;if(rk){ROCKET.dress(rk)}UI.toast('Rakete repariert! Bereit zum Start.',3000);money(200);return true}
  function hudShow(){if(hud){hud.remove();hud=null}const B=SAVE.rocketBroken;if(!B||B.pid!==GAME.G.id)return;const n=B.parts.filter(p=>p.found).length;hud=el('div','rhud');hud.innerHTML=ICON('wrench')+`<b>Raketenteile ${n}/${B.parts.length}</b><span class="arrow">${ICON('rocket')}</span>`;$('world').append(hud)}
  const tv=new V();function frame(dt,t){if(!objs.length&&!hud)return;for(const o of objs){const b=o.g.children.find(c=>c.geometry&&c.geometry.type==='CylinderGeometry'&&c.material.transparent);if(b)b.material.opacity=.2+.12*Math.sin(t*3)}
    if(hud){const me=GAME.me;if(!me)return;let best=null,bd=1e9;for(const o of objs){const d=o.p.angleTo(me.p);if(d<bd){bd=d;best=o}}const ar=hud.querySelector('.arrow');
      if(!best){const pl=GAME.G.places.find(p=>p.build==='rocket');if(pl)best={p:pl.dir};}
      if(best&&ar){const to=GAME.tangentTo(me.p,best.p.clone().sub(me.p));/* echte Blickrichtung (inkl. Drehen mit Q/C) */const f=GAME.camFwd?GAME.camFwd():GAME.camF;const r=new V().crossVectors(f,me.p);const ang=Math.atan2(to.dot(r),to.dot(f));ar.style.transform=`rotate(${ang}rad)`}}
    const pl=GAME.G.places.find(p=>p.build==='rocket');const rk=pl&&pl.obj&&pl.obj.children[0]&&pl.obj.children[0].userData.rocket;if(rk&&rk.userData.smoke&&SAVE.rocketBroken&&Math.random()<dt*3)GAME.W.fx(pl.dir,'rauch',1,pl.obj.localToWorld(new V(1.5,1.2,0)))}
  function onPlanet(pid){clear();if(SAVE.rocketBroken&&SAVE.rocketBroken.pid===pid)spawn()}
  return{crash,spawn,targets,repairAt,frame,onPlanet,broken:()=>!!(SAVE.rocketBroken&&SAVE.rocketBroken.pid===GAME.G.id),crashPose}
})();

/* =================== Flug durchs Sonnensystem =================== */
const SPACE=(()=>{
  const V=THREE.Vector3;let sc=null,cam=null,ship=null,sun=null,planets=[],belt=null,dust=[],on=false,vel=new V(),yaw=0,t0=0,intro=0,near=null,from=null,landLock=0,view='chase',station=null,glitch=false;const keys={};
  addEventListener('keydown',e=>{if(!on)return;const k=e.key.toLowerCase();if(k==='m'&&!keys.m)toggleView();keys[k]=true});addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
  const M=()=>makeMats({skin:'haut',color:0});
  let comp=null,fx=null,camLight=null,trail=null,streak=null,moons=[];
  function build(){sc=new THREE.Scene();sc.background=new THREE.Color('#151234');cam=new THREE.PerspectiveCamera(55,1,.1,3000);const m=M();
    sc.add(new THREE.HemisphereLight('#8C8CFF','#3A1E4E',.32));const pl=new THREE.PointLight('#FFF1D6',1.55,0,0);sc.add(pl);
    camLight=new THREE.DirectionalLight('#D8D0FF',.35);sc.add(camLight,camLight.target);
    fx={sky:SPACEFX.sky(),stars:SPACEFX.stars(3200)};sc.add(fx.sky,fx.stars);
    sun=SPACEFX.sun();sc.add(sun);
    planets=[];moons=[];let si=1;for(const[pid,d]of Object.entries(PLANETS)){if(d.mine&&!SAVE.myPlanet)continue;const par=d.moonOf&&PLANETS[d.moonOf]?d.moonOf:null;const[dist,ph]=par?PLANETS[par].orbit:d.orbit;const r=par?1.1+d.size*1.8:2.4+d.size*2.6;const g=SPACEFX.planet(pid,r,si*3.7);si++;
      g.userData.body.rotation.z=.2;let ring=null;if(d.ring||['schrott','pilz','wueste'].includes(pid)){ring=SPACEFX.ring(pid,r);g.add(ring)}
      const lbl=el('div','lbl planetlbl');lbl.textContent=d.n;$('labels').append(lbl);lbl.style.display='none';
      if(!par)sc.add(SPACEFX.orbit(dist,SPACEFX.pal(pid).atmo));sc.add(g);
      const pd={pid,g,r,dist,ph,lbl,ring,sp:.02/Math.sqrt(dist/26),par,ma:hashNum(pid)%628/100,msp:.09};planets.push(pd);
      /* Monde */const nm=d.moons??{kompost:1,schrott:2,korallen:1,frost:1,wueste:2,pilz:1}[pid]??0;for(let i=0;i<nm;i++){const mo=SPACEFX.moon(.45+Math.random()*.4,['#D8D2E8','#C9B8A6','#B8C8E0','#E8D8C8'][(si+i)%4]);sc.add(mo);moons.push({o:mo,p:pd,d:r*(2.9+i*1.1)+(ring?r*.9:0),s:.5+Math.random()*.4,a:Math.random()*TAU,tilt:(Math.random()-.5)*.5})}}
    belt=SPACEFX.asteroids(HIGH?420:260,59,67);sc.add(belt);belt.userData.rocks.forEach(r=>{});
    /* Sternenstaub zum Einsammeln */dust=[];const dc=['#FFE27A','#7FDCE6','#FF8FB8'];for(let i=0;i<40+planets.length*3;i++){const a=Math.random()*TAU,rr=18+Math.random()*(LIM()-30);const s=SPACEFX.dustStar(dc[i%3]);s.position.set(Math.cos(a)*rr,0,Math.sin(a)*rr);s.userData.ph=Math.random()*6;sc.add(s);dust.push(s)}
    RACE.build(sc,belt);
    trail=SPACEFX.trail(sc,70);streak=SPACEFX.streaks(60);sc.add(streak);
    /* Schiff */ship=new THREE.Group();QF=.8;const rk=ROCKET.build(ROCKET.spec(),m);QF=1;addOutlines(rk);rk.rotation.x=-PI/2;rk.position.z=0;rk.scale.setScalar(.7);ship.add(rk);ship.userData.rk=rk;
    const eg=new THREE.Sprite(new THREE.SpriteMaterial({map:ctex('sunglow2',8,8,()=>{}),color:'#FFB070',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));eg.position.set(0,0,-1.25);eg.scale.setScalar(2.2);ship.add(eg);ship.userData.eg=eg;sc.add(ship);
    if(HIGH){comp=makeComposer(GAME.R,sc,cam);comp.bloom.strength=.5;comp.bloom.radius=.55;comp.bloom.threshold=.96}}
  const LIM=()=>Math.max(130,...planets.map(p=>p.dist+18));
  function posOf(p,t){if(p.par){const q=planets.find(x=>x.pid===p.par);if(q){const c=posOf(q,t);const md=q.r*2.2+p.r+4;const a=p.ma+t*p.msp;return c.add(new V(Math.cos(a)*md,0,Math.sin(a)*md))}}const a=p.ph+t*p.sp;return new V(Math.cos(a)*p.dist,0,Math.sin(a)*p.dist)}
  function enter(fromPid){if(!sc)build();else{ship.remove(ship.userData.rk);QF=.8;const rk=ROCKET.build(ROCKET.spec(),M());QF=1;addOutlines(rk);rk.rotation.x=-PI/2;rk.scale.setScalar(.7);ship.add(rk);ship.userData.rk=rk}
    from=fromPid;t0=performance.now()/1000;const p=planets.find(x=>x.pid===fromPid)||planets[0];const pp=posOf(p,0);const out=pp.clone().normalize();ship.position.copy(pp).addScaledVector(out,p.r+7);const tg=new V(-out.z,0,out.x);const dir=tg.clone().multiplyScalar(.75).addScaledVector(out,-.65).normalize();yaw=Math.atan2(dir.x,dir.z);vel.copy(dir).multiplyScalar(5);landLock=2.5;intro=1;on=true;GAME.mode='space';SND.music('museum');
    UI.talkAbort&&UI.talkAbort();document.body.classList.add('inspace');for(const q of planets)q.lbl.style.display='';hudOn(true);resize()}
  function toggleView(){view=view==='chase'?'map':'chase';SND.play('pep',{vol:.3});if(hud)hud.querySelector('.vw').textContent=view==='chase'?'Karte (M)':'Cockpit (M)'}
  function exit(){on=false;if(typeof GLITCHKERN!=='undefined')GLITCHKERN.hideLabel();RACE.quit();RACE.leaveRoom();document.body.classList.remove('inspace');for(const q of planets)q.lbl.style.display='none';hudOn(false);$('prompt').hidden=true}
  let hud=null;function hudOn(v){if(hud){hud.remove();hud=null}if(!v)return;hud=el('div','spacehud');hud.innerHTML='<b>Weltraum</b><span>'+(document.body.classList.contains('coarse')?'Joystick: lenken & Schub':'W Schub · A/D lenken · S bremsen · Shift Turbo · E landen')+'</span><span class="sp"></span>';const vb=el('button','vw','Karte (M)');vb.type='button';vb.onclick=e=>{e.stopPropagation();toggleView()};hud.append(vb);$('world').append(hud)}
  function resize(){if(!cam)return;sizeView(GAME.R,cam,comp,$('world'))}
  function frame(dt,t){if(!on)return;const tt=performance.now()/1000-t0;const st=ROCKET.stats();const J=GAME._joy&&GAME._joy();
    let turn=(keys['a']||keys['arrowleft']?1:0)-(keys['d']||keys['arrowright']?1:0),thr=(keys['w']||keys['arrowup']?1:0)-(keys['s']||keys['arrowdown']?.6:0);if(J&&Math.hypot(J.x,J.y)>.1){turn=-J.x;thr=Math.max(0,J.y)}
    yaw+=turn*dt*2.4*st.handling;const fwd=new V(Math.sin(yaw),0,Math.cos(yaw));const boost=keys['shift']?1.7:1;vel.addScaledVector(fwd,thr*dt*22*st.speed*boost);vel.multiplyScalar(Math.pow(.55,dt));if(RACE.locked())vel.set(0,0,0);const mx=26*st.speed*boost;if(vel.length()>mx)vel.setLength(mx);
    ship.position.addScaledVector(vel,dt);if(ship.position.length()<12){ship.position.setLength(12);vel.multiplyScalar(-.4);UI.toast('Zu heiss! Weg von der Sonne!')}if(ship.position.length()>LIM()){ship.position.setLength(LIM());vel.multiplyScalar(-.3)}
    ship.rotation.y=yaw;ship.userData.rk.rotation.z=-turn*.35;for(const f of ship.userData.rk.userData.flames||[]){f.visible=thr>0;f.scale.set(1,.7+Math.random()*.6*(boost>1?1.6:1),1)}
    /* Asteroiden */const sp=ship.position;for(const r of belt.userData.rocks){if(r.p.distanceTo(sp)<r.s*.8+.8){const n=sp.clone().sub(r.p).setY(0).normalize();sp.addScaledVector(n,.4);vel.reflect(n).multiplyScalar(.5/st.armor);SND.play('metal',{vol:.5});break}}
    for(const d of dust){if(!d.visible)continue;const dd=d.userData;dd.gem.rotation.y+=dt*2;dd.gem.position.y=Math.sin(t*1.6+d.userData.ph)*.25;dd.s.scale.setScalar(2.2+Math.sin(t*3+d.userData.ph)*.5);dd.s.material.rotation=t*.4+d.userData.ph;if(d.position.distanceTo(sp)<1.6){d.visible=false;money(4);SND.play('pickup',{vol:.6});setTimeout(()=>{d.visible=true;const a=Math.random()*TAU,rr=18+Math.random()*(LIM()-30);d.position.set(Math.cos(a)*rr,0,Math.sin(a)*rr)},30000)}}
    /* Sonne, Himmel, Monde */sun.userData.tick(t);fx.sky.material.uniforms.uT.value=t;fx.sky.position.copy(cam.position);fx.stars.position.copy(cam.position);fx.stars.material.uniforms.uT.value=t;
    for(const mo of moons){mo.a+=dt*mo.s*.4;const c=mo.p.g.position;mo.o.position.set(c.x+Math.cos(mo.a)*mo.d,c.y+Math.sin(mo.a)*mo.d*mo.tilt,c.z+Math.sin(mo.a)*mo.d);mo.o.rotation.y+=dt*.3}
    /* Antriebsspur */if(thr>0){const back=ship.localToWorld(new V(0,0,-1.3));const side=new V(Math.cos(yaw),0,-Math.sin(yaw));for(let i=0;i<(boost>1?3:2);i++)trail.emit(back.clone().addScaledVector(side,(Math.random()-.5)*.3),fwd.clone().multiplyScalar(-4-Math.random()*3).add(vel.clone().multiplyScalar(.6)),boost>1?'#FF9AD6':'#FFC27A',.8+Math.random()*.5)}trail.step(dt);streak.userData.step(ship,vel);
    const eg=ship.userData.eg;eg.material.opacity=thr>0?.9:.25;eg.scale.setScalar((thr>0?2.2:1.2)*(1+Math.random()*.15));
    camLight.position.copy(cam.position);camLight.target.position.copy(ship.position);
    /* Planeten kreisen */near=null;let nd=1e9;for(const p of planets){const pp=posOf(p,tt);p.g.position.copy(pp);p.g.userData.body.rotation.y+=dt*.12;if(p.g.userData.cl)p.g.userData.cl.rotation.y+=dt*.16;const U=p.g.userData.U;U.uT.value=t;U.uSun.value.set(0,0,0);p.g.userData.at.uniforms.uC.value.copy(pp);if(p.ring){const rm=p.ring.userData.m.uniforms;rm.uC.value.copy(pp)}const d=pp.distanceTo(sp)-p.r;if(d<nd){nd=d;near=p}}
    RACE.frame(dt,t,ship,vel,cam);station=RACE.active?null:RACE.nearStation(sp);glitch=typeof GLITCHKERN!=='undefined'&&!RACE.active&&GLITCHKERN.space(sc,sp,t,cam);
    landLock=Math.max(0,landLock-dt);const pr=$('prompt');if(glitch){pr.hidden=false;pr.innerHTML='';pr.append(el('kbd',null,'E'),document.createTextNode('Andocken: Glitch-Kern'));$('hbA').textContent='Andocken';near=null;station=null}else if(station&&!(near&&nd<4)){pr.hidden=false;pr.innerHTML='';pr.append(el('kbd',null,'E'),document.createTextNode('Andocken: '+station.st.n));$('hbA').textContent='Andocken';near=null}else if(near&&nd<4&&landLock<=0&&!RACE.active){pr.hidden=false;pr.innerHTML='';pr.append(el('kbd',null,'E'),document.createTextNode('Landen auf '+PLANETS[near.pid].n));$('hbA').textContent='Landen'}else{pr.hidden=true;$('hbA').textContent='Schub';if(nd>=4)near=null}
    /* Kamera: Verfolger hinter dem Schiff oder Übersichtskarte */intro=Math.max(0,intro-dt*.5);const vl=vel.length();let cp,look;
    if(view==='chase'){cp=sp.clone().addScaledVector(fwd,-(8+vl*.12)).add(new V(0,4.6+vl*.05+intro*14,0));look=sp.clone().addScaledVector(fwd,7).add(new V(0,.2,0))}
    else{cp=sp.clone().addScaledVector(fwd,-14).add(new V(0,55,0));look=sp.clone().addScaledVector(fwd,4)}
    cam.position.lerp(cp,Math.min(1,dt*(view==='chase'?4:2.5)));cam.lookAt(look);cam.fov+=((view==='chase'?60+vl*.4:50)-cam.fov)*Math.min(1,dt*3);cam.updateProjectionMatrix();
    const w=$('world').clientWidth,h=$('world').clientHeight;for(const p of planets){const v=p.g.position.clone().add(new V(0,p.r+1.4,0)).project(cam);p.lbl.style.left=((v.x+1)/2*w)+'px';p.lbl.style.top=((1-v.y)/2*h)+'px';const dl=p.g.position.distanceTo(ship.position);p.lbl.style.display=v.z<1&&(view==='map'||dl<70)?'':'none';p.lbl.style.opacity=view==='map'?1:Math.max(.35,1-dl/80)}
    RACE.labels(cam,view,ship);if(hud)hud.querySelector('.sp').textContent=Math.round(vel.length()*12)+' km/s';
    if(comp&&HIGH)comp.render();else GAME.R.render(sc,cam)}
  function action(){if(glitch){GLITCHKERN.dock();return}if(station&&!RACE.active){if(typeof STATIONS!=='undefined')STATIONS.dock(station);else RACE.openLobby(station);return}if(near&&landLock<=0&&!RACE.active){const pid=near.pid;exit();GAME.landOn(pid)}}
  function place(p,y){ship.position.copy(p);yaw=y;vel.set(0,0,0);ship.rotation.y=y}
  /* Andocken an einer Raumstation: Cockpit anhalten, nach dem Besuch weiterfliegen */
  function pause(){on=false;document.body.classList.remove('inspace');for(const q of planets)q.lbl.style.display='none';RACE.hideLabels&&RACE.hideLabels();hudOn(false);$('prompt').hidden=true}
  function resume(){on=true;GAME.mode='space';document.body.classList.add('inspace');for(const q of planets)q.lbl.style.display='';hudOn(true);vel.set(0,0,0);landLock=1.5;SND.music('museum');resize()}
  return{enter,frame,action,resize,place,pause,resume,yaw:()=>yaw,ship:()=>ship,get on(){return on},_dbg:()=>({sc,cam,ship,planets,fx,sun})}
})();
