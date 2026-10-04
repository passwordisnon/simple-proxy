/* =====================================================================
   CYBORG-LABOR · zoo.js
   Tierpark (im Gebäude der Tierhandlung): Aquarien mit allen gefangenen
   Fischarten, Terrarien mit allen Insekten, Gehege je Planet mit allen
   getroffenen Tieren – insgesamt über 130 Arten. Tierpfleger Pfötchen
   verkauft weiterhin Haustier-Zubehör und belohnt Meilensteine.
   ===================================================================== */
const ZOO=(()=>{
  const B=(g,w,h,d,rad,mat,p,r,sc)=>P(g,G.bx(w,h,d,rad),mat,p,r,sc),C=(g,rt,rb,h,mat,p,r,sc)=>P(g,G.cy(rt,rb,h),mat,p,r,sc),S=(g,r,mat,p,sc)=>P(g,G.s(r),mat,p,null,sc);
  const Wd=(m,c)=>window.HOUSEKIT?HOUSEKIT.Wd(m,c):m.c(c);
  const NM='Tierpfleger Pfötchen';const VOICE={pitch:190,kind:'',speed:1.1};
  const keeper=()=>({name:NM,body:{seg:1,size:1,skin:'fell',color:5,shape:'birne',pattern:'bauch',color2:16},parts:{kopf:'hirsch',augen:'kulleraugen',arme:'mensch',beine:'mensch',extras:[]},
    clothes:{hat:'strohhut',top:'latzhose',col:{hat:4,top:9}}});
  const MIL=[[20,500],[50,1000],[80,2000],[110,4000],[133,8000]];
  const fishIds=()=>FISH.filter(f=>SAVE.caught.fish[f.id]).map(f=>f.id);
  const bugIds=()=>BUGS.filter(b=>SAVE.caught.bugs[b.id]).map(b=>b.id);
  const animalIds=()=>Object.keys(FAUNA.S).filter(k=>(SAVE.faunaSeen||{})[k]);
  const counts=()=>({f:fishIds().length,b:bugIds().length,a:animalIds().length,F:FISH.length,Bn:BUGS.length,A:Object.keys(FAUNA.S).length});
  const total=()=>{const c=counts();return{have:c.f+c.b+c.a,all:c.F+c.Bn+c.A}};
  /* Modell auf eine Zielgrösse bringen und auf den Boden setzen */
  function fit(g,size){const bb=new THREE.Box3().setFromObject(g);const s=size/Math.max(.01,bb.max.x-bb.min.x,bb.max.y-bb.min.y,bb.max.z-bb.min.z);g.scale.multiplyScalar(s);const b2=new THREE.Box3().setFromObject(g);g.position.y-=b2.min.y;return g}
  function model(def,m,size){const q=new THREE.Group();try{def.b(q,m,def.opt||{},srand(3))}catch(e){}const w=new THREE.Group();w.add(q);fit(w,size);const o=new THREE.Group();o.add(w);return o}

  function build(sc){const W=20,D=14,H=4.4;INTERIOR.makeRoom(sc,W,D,H,'holzpaneel','gras',{trim:'#8A5A44',windows:false});const A=INTERIOR.actions,Cl=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.85;o.color.set('#FFF6E6')}});const oldQ=QF;QF=.55;const anim={fish:[],bugs:[],animals:[]};
    const sign=(txt,x,y,z,ry)=>{const t=ctex('zoo-'+txt,320,80,(c,w,h)=>{c.fillStyle='#FFFDF7';c.beginPath();c.roundRect(4,4,w-8,h-8,20);c.fill();c.strokeStyle='#8A5A44';c.lineWidth=6;c.stroke();c.fillStyle='#5B4A3E';c.font='bold 38px "Nunito","Trebuchet MS",sans-serif';c.textAlign='center';c.fillText(txt,w/2,54)});
      const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.55),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.position.set(x,y,z);m.rotation.y=ry||0;m.userData.noOutline=true;sc.add(m)};
    /* ---- Aquarien an der Rückwand ---- */const fl=fishIds();const TW=5.2,TH=2.1,TD=1.3,tz=-D/2+.8;
    for(let t=0;t<3;t++){const tx=-6.2+t*6.2;const tg=grp(sc,[tx,0,tz]);{const L=new THREE.PointLight('#BFEFFF',.7,4.5,2);L.position.set(0,2.6,.3);tg.add(L)}B(tg,TW+.3,.7,TD+.3,.05,Wd(M,'#8A5A44'),[0,.35,0]);B(tg,TW,TH,TD,.02,M.glass('#9AD8F2'),[0,.7+TH/2,0]);
      const wat=new THREE.Mesh(new THREE.BoxGeometry(TW-.1,TH-.25,TD-.1),new THREE.MeshBasicMaterial({color:'#8FD8F8',transparent:true,opacity:.22,depthWrite:false}));wat.position.set(0,.7+(TH-.25)/2,0);wat.userData.noOutline=true;tg.add(wat);
      B(tg,TW-.1,.14,TD-.1,.02,M.c('#F2DDB0'),[0,.77,0]);for(let k=0;k<5;k++){const x=-TW/2+.5+k*1.05;const h=.4+((k*7+t)%3)*.25;bt(tg,[x,.8,-.3],[x+.08,.8+h,-.35],.04,M.c('#5FB070'));S(tg,.1,M.c(['#FF8FB1','#FFB27A','#C6A9FF'][k%3]),[x+.1,.8+h*.4,-.2])}
      for(const s of[-1,1])B(tg,.08,TH+.1,TD+.1,.02,Wd(M,'#8A5A44'),[s*TW/2,.7+TH/2,0]);B(tg,TW+.2,.12,TD+.2,.03,Wd(M,'#8A5A44'),[0,.76+TH,0]);Cl.push({x0:tx-TW/2-.2,x1:tx+TW/2+.2,z0:tz-TD/2-.2,z1:tz+TD/2+.3});
      const mine=fl.filter((_,i)=>i%3===t);mine.forEach((id,i)=>{const f=FISH.find(q=>q.id===id);const g=model(f,M,.42);const lane=i%4,row=Math.floor(i/4);g.position.set(0,.98+lane*.42+(row%2)*.18,-.35+((row*.37)%.7));tg.add(g);anim.fish.push({g,x0:-TW/2+.5,x1:TW/2-.5,ph:i*1.7+t,sp:.35+((i*13)%7)*.06,y:g.position.y})});
      if(!mine.length){const e=ctex('zoo-leer',256,64,(c,w,h)=>{c.fillStyle='rgba(255,255,255,.75)';c.font='bold 26px "Nunito","Trebuchet MS",sans-serif';c.textAlign='center';c.fillText('Noch leer – geh angeln!',w/2,40)});const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshBasicMaterial({map:e,transparent:true}));m.position.set(0,1.7,TD/2+.02);m.userData.noOutline=true;tg.add(m)}}
    sign('Aquarium · '+fl.length+'/'+FISH.length,0,3.6,tz+.2);
    /* ---- Terrarien an der linken Wand ---- */const bl=bugIds();const tx0=-W/2+.75;for(let r=0;r<2;r++)for(let c=0;c<5;c++){const i=r*5+c;const z=-3.6+c*1.7,y=.9+r*1.25;const tg=grp(sc,[tx0,y,z]);B(tg,1.1,.08,1.5,.02,Wd(M,'#8A5A44'),[0,-.04,0]);B(tg,1.0,1.0,1.4,.02,M.glass('#E6FAF0'),[0,.5,0]);B(tg,.96,.1,1.36,.02,M.c('#8A6A4A'),[0,.05,0]);
      bt(tg,[-.2,.1,.3],[.1,.55,.2],.03,M.c('#6B4A38'));S(tg,.12,M.c('#6FBF7A'),[.3,.18,-.4]);
      bl.slice(i*5,i*5+5).forEach((id,k)=>{const b=BUGS.find(q=>q.id===id);const g=model(b,M,.24);g.position.set((k%2?.18:-.18),.12+(k>2?.35:0),-.5+k*.25);g.rotation.y=k*1.3;tg.add(g);anim.bugs.push({g,ph:k+i,y:g.position.y})})}
    B(sc,.3,2.8,9,.04,Wd(M,'#8A5A44'),[-W/2+.18,1.4,0]);Cl.push({x0:-W/2,x1:-W/2+1.4,z0:-4.5,z1:4.5});sign('Terrarium · '+bl.length+'/'+BUGS.length,-W/2+.08,3.3,0,PI/2);
    /* ---- Mitte: Bänke zum Schauen (die Tiere leben draussen im Tierpark) ---- */for(const x of[-3,3])for(const z of[-1.2,1.8]){const b=grp(sc,[x,0,z]);B(b,2.2,.1,.6,.04,Wd(M,'#C98C5A'),[0,.5,0]);for(const s2 of[-1,1])B(b,.12,.5,.5,.03,Wd(M,'#8A5A44'),[s2*.9,.25,0]);addOutlines(b);Cl.push({x0:x-1.2,x1:x+1.2,z0:z-.4,z1:z+.4})}
    {const pl2=grp(sc,[0,0,.3]);P(pl2,G.cy(.9,1,.5),M.c('#D98A5E'),[0,.25,0]);P(pl2,G.blob(1.1,.15,4,5),M.c('#6FBF7A'),[0,1,0],null,[1,.8,1]);addOutlines(pl2);Cl.push({x0:-1,x1:1,z0:-.7,z1:1.3})}
    /* ---- Tierhandlung und Pfleger vorne links ---- */const k=grp(sc,[-6.2,0,4.6]);B(k,2.4,1.0,.8,.06,Wd(M,'#C98C5A'),[0,.5,0]);B(k,2.5,.08,.9,.03,M.c('#FFFDF7'),[0,1.04,0]);for(let i=0;i<3;i++)C(k,.12,.1,.2,M.c(['#FF8FB1','#7FC8F0','#FFD85A'][i]),[-.7+i*.5,1.18,0]);addOutlines(k);Cl.push({x0:-7.5,x1:-4.9,z0:4.1,z1:5.1});
    try{const kp=buildCreature(keeper(),{q:HIGH?.6:.42,noShadow:!HIGH,blob:false,merge:true});kp.scale.setScalar(CS);kp.position.set(-6.2,0,3.9);sc.add(kp);sc.userData.keeper=kp}catch(e){console.warn('Pfleger',e)}
    A.push({x:-4.4,z:5.6,r:1.1,label:'Zoo-Führer (Arten und Belohnungen)',act:guide});
    INTERIOR.lamp(sc,'steh',W/2-.7,0,5.6,{col:'#FFE0A8',i:.9,d:7});INTERIOR.lamp(sc,'steh',-W/2+.7,0,5.6,{col:'#FFE0A8',i:.9,d:7});
    for(const x of[W/2-1.2,W/2-1.2])for(const z of[-4.5,4.2]){const tr=grp(sc,[x,0,z]);C(tr,.14,.18,1.4,Wd(M,'#8A5A44'),[0,.7,0]);P(tr,G.blob(.8,.12,4,z|0),M.c('#6FBF7A'),[0,1.8,0],null,[1,.85,1]);addOutlines(tr);Cl.push({x0:x-.4,x1:x+.4,z0:z-.4,z1:z+.4})}
    QF=oldQ;sc.userData.zoo=anim;return{W,D,camD:15}}
  function frame(dt,t){const sc=INTERIOR.scene;if(!sc)return;const u=sc.userData.zoo;if(!u)return;
    for(const f of u.fish){const s=Math.sin(t*f.sp+f.ph);const x=f.x0+(f.x1-f.x0)*(s*.5+.5);f.g.position.x=x;f.g.position.y=f.y+Math.sin(t*1.3+f.ph)*.06;f.g.rotation.y=Math.cos(t*f.sp+f.ph)>0?0:PI;f.g.rotation.z=Math.sin(t*6+f.ph)*.08}
    for(const b of u.bugs){b.g.position.y=b.y+Math.abs(Math.sin(t*2+b.ph))*.03;b.g.rotation.y+=dt*.3*Math.sin(t*.5+b.ph)}
    for(const a of u.animals){const k=t*.35+a.ph;const nx=a.cx*.4+Math.sin(k)*a.r*.8,nz=a.cz*.4+Math.sin(k*1.7)*a.r*.6;const dx=nx-a.o.position.x,dz=nz-a.o.position.z;const mv=Math.hypot(dx,dz)>.002;
      a.o.position.x=nx;a.o.position.z=nz;if(mv)a.o.rotation.y=Math.atan2(dx,dz);const an=a.g.children[0];if(an&&an.userData.tick)an.userData.tick(t+a.ph,mv,0,'')}
    const kp=sc.userData.keeper;if(kp&&kp.userData.tick)kp.userData.tick(t,false,UI.typing?.4:0)}

  /* ================= Tierpark draussen: offene Wiese mit Biom-Sektoren ================= */
  let park=null;
  function buildPark(pl){const GG=GAME.G,R=GG.R,M=makeMats({skin:'haut',color:0});const c=pl.dir.clone();const pole=GG.places[0].dir;const F=parkFrame(c,pole);const rad=pl.r*R;
    const at=(u,v)=>parkDir(c,F,R,u,v);const surf=(d,off)=>GAME.onSurf(d,off||0);
    const orient=(g,d,fwd)=>{g.position.copy(surf(d));g.up.copy(d);const f=fwd.clone().addScaledVector(d,-fwd.dot(d)).normalize();g.lookAt(g.position.clone().add(f))};
    const root=new THREE.Group();GG.scene.add(root);park={scene:GG.scene,root,animals:[],c,F,rad,pl};
    /* Zaun: Pfosten + zwei Latten, weltfest auf dem Boden; Eingang zum Dorf hin offen */
    const fz=new THREE.Group();const wood=M.c('#C98C5A'),dark=M.c('#8A5A44');const n=Math.round(TAU*rad/2.3);let prev=null;
    for(let i=0;i<=n;i++){const a=i/n*TAU;const inGate=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<3.2/rad;const d=at(Math.cos(a)*rad,Math.sin(a)*rad);const b=surf(d,-.05);const top=b.clone().addScaledVector(d,1.15);
      if(inGate){prev=null;continue}bt(fz,[b.x,b.y,b.z],[top.x,top.y,top.z],.09,dark);P(fz,G_s(.12),dark,[top.x,top.y,top.z]);GAME.addObst(d,.35);
      if(prev){for(const hh of[.45,.9]){const p0=prev.b.clone().addScaledVector(prev.d,hh),p1=b.clone().addScaledVector(d,hh);bt(fz,[p0.x,p0.y,p0.z],[p1.x,p1.y,p1.z],.055,wood)}
        const mid=prev.d.clone().add(d).normalize();GAME.addObst(mid,.35)}prev={b,d}}
    addOutlines(fz);fz.traverse(o=>{if(o.isMesh)o.castShadow=HIGH});try{mergeGroup(fz)}catch(e){}root.add(fz);
    /* Eingangstor mit Schild */const gate=new THREE.Group();for(const sgn of[-1,1]){P(gate,G.bx(.7,2.8,.7,.12),M.c('#E8DCC8'),[sgn*3,1.4,0]);P(gate,G.bx(.9,.25,.9,.08),M.c('#CDBFA8'),[sgn*3,2.9,0]);P(gate,G.s(.28),M.c('#6FBF7A'),[sgn*3,3.2,0])}
    P(gate,G.bx(6.9,.35,.45,.1),Wd(M,'#8A5A44'),[0,2.7,0]);const st=ctex('park-sign',512,128,(x,w,h)=>{x.fillStyle='#FFFDF7';x.beginPath();x.roundRect(6,6,w-12,h-12,30);x.fill();x.strokeStyle='#6FBF7A';x.lineWidth=10;x.stroke();x.fillStyle='#4E7A3A';x.font='bold 70px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText('Tierpark',w/2,92)});
    for(const zz of[.24,-.24]){const sm=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.85),new THREE.MeshBasicMaterial({map:st,transparent:true}));sm.position.set(0,3.35,zz);if(zz<0)sm.rotation.y=PI;sm.userData.noOutline=true;gate.add(sm)}
    P(gate,G.bx(3.6,1.05,.12,.06),Wd(M,'#8A5A44'),[0,3.35,0]);addOutlines(gate);orient(gate,at(rad,0),F.toV);root.add(gate);GAME.addObst(at(rad,3),.6);GAME.addObst(at(rad,-3),.6);
    /* Laternen und Bänke am Weg */const lamp=typeof buildStreetLamp==='function'?buildStreetLamp:window.buildStreetLamp,bench=typeof buildBench==='function'?buildBench:window.buildBench;
    for(let u=rad*.35;u<rad-2;u+=6.5)for(const sg of[-1,1]){if(lamp&&((u/6.5|0)+(sg>0?1:0))%2===0){const l=lamp(M);addOutlines(l);orient(l,at(u,sg*2.4),F.toV);root.add(l);GAME.addObst(at(u,sg*2.4),.3)}else if(bench){const b=bench(M);addOutlines(b);orient(b,at(u,sg*2.7),F.side.clone().multiplyScalar(-sg));root.add(b);GAME.addObst(at(u,sg*2.7),.6)}}
    /* Schilder je Sektor */const sd=SAVE.faunaSeen||{};PARK.planets.forEach((pid,i)=>{const[cu,cv,a,r0]=PARK.center(i,rad);const d=at(Math.cos(a)*(r0+1.3),Math.sin(a)*(r0+1.3));const have=Object.keys(FAUNA.S).filter(k=>FAUNA.S[k].planet===pid&&sd[k]).length,all=Object.keys(FAUNA.S).filter(k=>FAUNA.S[k].planet===pid).length;
      const g=new THREE.Group();P(g,G.cy(.07,.08,1.4),Wd(M,'#8A5A44'),[0,.7,0]);const t=ctex('park-sek-'+pid+have,320,110,(x,w,h)=>{x.fillStyle='#FFFDF7';x.beginPath();x.roundRect(4,4,w-8,h-8,18);x.fill();x.strokeStyle='#8A5A44';x.lineWidth=6;x.stroke();x.fillStyle='#5B4A3E';x.textAlign='center';x.font='bold 34px "Nunito","Trebuchet MS",sans-serif';x.fillText(PLANETS[pid].n,w/2,48);x.font='26px "Nunito","Trebuchet MS",sans-serif';x.fillText(have+' von '+all+' Arten',w/2,86)});
      for(const zz of[.05,-.05]){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.52),new THREE.MeshBasicMaterial({map:t}));m.position.set(0,1.45,zz);if(zz<0)m.rotation.y=PI;m.userData.noOutline=true;g.add(m)}P(g,G.bx(1.6,.6,.08,.03),Wd(M,'#8A5A44'),[0,1.45,0]);
      addOutlines(g);const out=at(Math.cos(a),Math.sin(a)).sub(c);orient(g,d,c.clone().sub(d).add(out.multiplyScalar(0)));root.add(g);GAME.addObst(d,.3)});
    /* Aquarium-Pavillon in der Mitte (Fische und Insekten) */const pav=new THREE.Group();P(pav,G.cy(3.1,3.3,.3),M.c('#E8DCC8'),[0,.15,0]);for(let i=0;i<8;i++){const a=i/8*TAU;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.3)continue;P(pav,G.cy(.13,.15,2.6),M.c('#FFFDF7'),[Math.sin(a)*2.7,1.6,Math.cos(a)*2.7])}
    P(pav,G.hs(3.0),M.c('#CFEFFA',{opacity:.38}),[0,2.8,0]);for(let i=0;i<8;i++)P(pav,G.to(3.0,.06,PI/2),M.c('#FFFDF7'),[0,2.85,0],[0,i/8*TAU,0]);P(pav,G.to(3.0,.12),M.c('#FFFDF7'),[0,2.85,0],[PI/2,0,0]);P(pav,G.s(.25),M.c('#FFD85A',{gloss:1}),[0,5.9,0]);
    const tank=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,1.8,24),new THREE.MeshLambertMaterial({color:'#6FC4E8',transparent:true,opacity:.5}));tank.position.y=1.2;tank.userData.noOutline=true;pav.add(tank);
    for(let i=0;i<6;i++){const f=new THREE.Group();P(f,G.s(.18),M.c(['#FF9E6E','#FFD85A','#FF8FB1'][i%3]),[0,0,0],null,[1.4,.8,.6]);P(f,G.co(.12,.2),M.c(['#FF9E6E','#FFD85A','#FF8FB1'][i%3]),[-.3,0,0],[0,0,PI/2]);f.position.set(Math.sin(i)*.9,.8+i*.18,Math.cos(i)*.9);f.userData.fish=i;pav.add(f)}
    addOutlines(pav);orient(pav,c,F.toV);root.add(pav);GAME.addObst(c,3.1);park.pav=pav;
    GG.inter.push({kind:'parkhaus',p:at(3.9,0),r:1.6,label:'Aquarium-Pavillon betreten',act:enter});GG.inter.push({kind:'parkguide',p:at(rad-3.5,0),r:1.8,label:'Tierpark-Führer (Arten und Belohnungen)',act:guide});
    /* Tiere: jede getroffene Art streift in ihrem Planeten-Sektor umher (Wassertiere im Sektor-Teich) */
    for(const[k,sp]of Object.entries(FAUNA.S)){if(!sd[k])continue;const i=PARK.planets.indexOf(sp.planet);if(i<0)continue;const n2=sp.herd?2:1;for(let j=0;j<n2;j++){const g=new THREE.Group();const inner=FAUNA.buildAnimal(sp.a,M);inner.scale.setScalar((sp.size||1)*.62);g.add(inner);addOutlines(g);root.add(g);
      const A={k,sp,g,inner,i,water:!!sp.water&&PARK.pondOf(sp.planet),d:new THREE.Vector3(),tgt:null,idle:Math.random()*3,hop:0,ph:Math.random()*9};pick(A,true);A.d.copy(A.tgt);park.animals.push(A);
      GG.inter.push({kind:'parkpet',p:A.d,r:1.5,label:'Streicheln: '+sp.n,act:()=>{A.hop=.7;A.idle=2.5;SND.play('cloth',{vol:.6});GAME.W.fx(A.d,'herz',6);SAVE.stats.pets=(SAVE.stats.pets||0)+1;persist()}})}}}
  const G_s=r=>G.s(r);
  function pick(A,first){if(A.water){const[cu,cv]=PARK.center(A.i,park.rad);const q=Math.random()*TAU,rr=Math.random()*1.4;A.tgt=parkDir(park.c,park.F,GAME.G.R,cu+Math.cos(q)*rr,cv+Math.sin(q)*rr);return}
    const[u,v]=PARK.rand(A.i,park.rad);A.tgt=parkDir(park.c,park.F,GAME.G.R,u,v)}
  function parkTick(dt,t){if(!park||park.scene!==GAME.G.scene||GAME.mode!=='outdoor')return;const G=GAME.G,me=GAME.me;if(!me)return;if(GAME.angle(me.p,park.c)*G.R>park.rad+45)return;
    if(park.pav)park.pav.children.forEach(o=>{if(o.userData.fish!=null){const i=o.userData.fish;const a=t*.5+i;o.position.x=Math.sin(a)*.9;o.position.z=Math.cos(a)*.9;o.rotation.y=a+PI/2}});
    for(const A of park.animals){A.idle-=dt;A.hop=Math.max(0,A.hop-dt);let mv=false;
      if(A.idle<=0){const dist=GAME.angle(A.d,A.tgt)*G.R;if(dist<.4){A.idle=1.5+Math.random()*5;pick(A)}else{const sp=(A.sp.speed||.8)*.9*dt;const f=GAME.tangentTo(A.d,A.tgt.clone().sub(A.d));if(isFinite(f.x)){const ax=new THREE.Vector3().crossVectors(A.d,f).normalize();A.d.applyAxisAngle(ax,Math.min(sp,dist)/G.R).normalize();A.fwd=f;mv=true}}}
      const h=A.water?G.sea-.12:G.hAt(A.d);A.g.position.copy(A.d).multiplyScalar(G.R+h+(A.hop>0?Math.sin(A.hop/.7*PI)*.5:0));A.g.up.copy(A.d);if(A.fwd)A.g.lookAt(A.g.position.clone().add(A.fwd));
      if(A.inner.userData.tick)A.inner.userData.tick(t+A.ph,mv,0,A.hop>0?'happy':'')}}
  function guide(){const c=counts(),T=total();const Z=SAVE.zoo=SAVE.zoo||{got:[]};const w=UI.win('Zoo-Führer · '+T.have+'/'+T.all+' Arten',{size:'wide'});
    w.body.append(el('p',null,'Fische '+c.f+'/'+c.F+' · Insekten '+c.b+'/'+c.Bn+' · Tiere '+c.a+'/'+c.A+'. Jede neue Art zieht automatisch in den Tierpark ein: Fische und Insekten, sobald du sie einmal gefangen hast, Tiere, sobald du sie getroffen hast.'));
    const gr=el('div','grid');for(const[n,r]of MIL){const done=Z.got.includes(n),ok=T.have>=Math.min(n,T.all);const cd=el('div','card');cd.append(el('b',null,n+' Arten'),el('span','sub',fmt(r)+' Taler'),el('span','sub',done?'abgeholt':ok?'bereit!':'noch '+(Math.min(n,T.all)-T.have)));
      if(ok&&!done){const b=btn('Abholen','primary',()=>{Z.got.push(n);money(r);persist();SND.jingle('j_success');UI.talk(NM,['Wunderbar! '+n+' Arten im Tierpark!','Hier, '+fmt(r)+' Taler für deine Mühe.'],{voice:VOICE});w.close()});cd.append(b)}gr.append(cd)}w.body.append(gr)}
  function enter(){INTERIOR.enter('zoo');const Z=SAVE.zoo=SAVE.zoo||{got:[]};if(!Z.hi){Z.hi=1;persist();setTimeout(()=>UI.talk(NM,['Willkommen im Tierpark!','Hier im Pavillon wohnen alle Fische und Insekten, die du gefangen hast.','Die Tiere, die du triffst, streifen draussen im Park durch ihre eigenen Landschaften.'],{voice:VOICE}),900)}}
  if(typeof INTERIOR!=='undefined')INTERIOR.kinds.zoo={bg:'#DDEFD8',music:'fishing',build,frame};
  return{enter,counts,total,buildPark,parkTick}
})();
