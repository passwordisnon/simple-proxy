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
    for(let t=0;t<3;t++){const tx=-6.2+t*6.2;const tg=grp(sc,[tx,0,tz]);B(tg,TW+.3,.7,TD+.3,.05,Wd(M,'#8A5A44'),[0,.35,0]);B(tg,TW,TH,TD,.02,M.glass('#9AD8F2'),[0,.7+TH/2,0]);
      const wat=new THREE.Mesh(new THREE.BoxGeometry(TW-.1,TH-.25,TD-.1),new THREE.MeshBasicMaterial({color:'#4AA8D8',transparent:true,opacity:.28,depthWrite:false}));wat.position.set(0,.7+(TH-.25)/2,0);wat.userData.noOutline=true;tg.add(wat);
      B(tg,TW-.1,.14,TD-.1,.02,M.c('#F2DDB0'),[0,.77,0]);for(let k=0;k<5;k++){const x=-TW/2+.5+k*1.05;const h=.4+((k*7+t)%3)*.25;bt(tg,[x,.8,-.3],[x+.08,.8+h,-.35],.04,M.c('#5FB070'));S(tg,.1,M.c(['#FF8FB1','#FFB27A','#C6A9FF'][k%3]),[x+.1,.8+h*.4,-.2])}
      for(const s of[-1,1])B(tg,.08,TH+.1,TD+.1,.02,Wd(M,'#8A5A44'),[s*TW/2,.7+TH/2,0]);B(tg,TW+.2,.12,TD+.2,.03,Wd(M,'#8A5A44'),[0,.76+TH,0]);Cl.push({x0:tx-TW/2-.2,x1:tx+TW/2+.2,z0:tz-TD/2-.2,z1:tz+TD/2+.3});
      const mine=fl.filter((_,i)=>i%3===t);mine.forEach((id,i)=>{const f=FISH.find(q=>q.id===id);const g=model(f,M,.42);const lane=i%4,row=Math.floor(i/4);g.position.set(0,.98+lane*.42+(row%2)*.18,-.35+((row*.37)%.7));tg.add(g);anim.fish.push({g,x0:-TW/2+.5,x1:TW/2-.5,ph:i*1.7+t,sp:.35+((i*13)%7)*.06,y:g.position.y})});
      if(!mine.length){const e=ctex('zoo-leer',256,64,(c,w,h)=>{c.fillStyle='rgba(255,255,255,.75)';c.font='bold 26px "Nunito","Trebuchet MS",sans-serif';c.textAlign='center';c.fillText('Noch leer – geh angeln!',w/2,40)});const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshBasicMaterial({map:e,transparent:true}));m.position.set(0,1.7,TD/2+.02);m.userData.noOutline=true;tg.add(m)}}
    sign('Aquarium · '+fl.length+'/'+FISH.length,0,3.6,tz+.2);
    /* ---- Terrarien an der linken Wand ---- */const bl=bugIds();const tx0=-W/2+.75;for(let r=0;r<2;r++)for(let c=0;c<5;c++){const i=r*5+c;const z=-3.6+c*1.7,y=.9+r*1.25;const tg=grp(sc,[tx0,y,z]);B(tg,1.1,.08,1.5,.02,Wd(M,'#8A5A44'),[0,-.04,0]);B(tg,1.0,1.0,1.4,.02,M.glass('#E6FAF0'),[0,.5,0]);B(tg,.96,.1,1.36,.02,M.c('#8A6A4A'),[0,.05,0]);
      bt(tg,[-.2,.1,.3],[.1,.55,.2],.03,M.c('#6B4A38'));S(tg,.12,M.c('#6FBF7A'),[.3,.18,-.4]);
      bl.slice(i*5,i*5+5).forEach((id,k)=>{const b=BUGS.find(q=>q.id===id);const g=model(b,M,.24);g.position.set((k%2?.18:-.18),.12+(k>2?.35:0),-.5+k*.25);g.rotation.y=k*1.3;tg.add(g);anim.bugs.push({g,ph:k+i,y:g.position.y})})}
    B(sc,.3,2.8,9,.04,Wd(M,'#8A5A44'),[-W/2+.18,1.4,0]);Cl.push({x0:-W/2,x1:-W/2+1.4,z0:-4.5,z1:4.5});sign('Terrarium · '+bl.length+'/'+BUGS.length,-W/2+.08,3.3,0,PI/2);
    /* ---- Gehege je Planet ---- */const al=animalIds();const pens=Object.keys(PLANETS);const GRD={kompost:'#8FD07A',schrott:'#B8B4C8',korallen:'#F2DDB0',frost:'#EEF4FA',wueste:'#F0C890',pilz:'#C8B0E0'};
    pens.forEach((pid,i)=>{const cx=-3.2+(i%3)*3.9,cz=-1.6+Math.floor(i/3)*3.6;const pw=3.3,pd=2.9;const pg=grp(sc,[cx,0,cz]);P(pg,G.bx(pw,.04,pd,.02),M.c(GRD[pid]||'#8FD07A'),[0,.02,0]);
      const fence=Wd(M,'#C98C5A');for(const s of[-1,1]){B(pg,pw,.07,.07,.02,fence,[0,.55,s*pd/2]);B(pg,pw,.07,.07,.02,fence,[0,.3,s*pd/2]);B(pg,.07,.07,pd,.02,fence,[s*pw/2,.55,0]);B(pg,.07,.07,pd,.02,fence,[s*pw/2,.3,0])}
      for(const[x,z]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]])B(pg,.1,.7,.1,.03,fence,[x*pw/2,.35,z*pd/2]);
      Cl.push({x0:cx-pw/2-.1,x1:cx+pw/2+.1,z0:cz-pd/2-.1,z1:cz+pd/2+.1});
      const here=al.filter(k=>FAUNA.S[k].planet===pid);here.forEach((k,j)=>{const g=new THREE.Group();try{g.add(FAUNA.buildAnimal(FAUNA.S[k].a,M))}catch(e){}fit(g,.8);const o=new THREE.Group();o.add(g);o.position.set((j-(here.length-1)/2)*.6,0,(j%2?.4:-.4));pg.add(o);anim.animals.push({o,g,ph:j*2.1+i,cx:o.position.x,cz:o.position.z,r:Math.min(pw,pd)/2-.55})});
      const t=ctex('zoo-pen-'+pid+here.length,256,64,(c,w,h)=>{c.fillStyle='#FFFDF7';c.beginPath();c.roundRect(2,2,w-4,h-4,14);c.fill();c.fillStyle='#5B4A3E';c.font='bold 24px "Nunito","Trebuchet MS",sans-serif';c.textAlign='center';c.fillText(PLANETS[pid].n.split('-')[0]+' · '+here.length,w/2,40)});
      const sm=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.35),new THREE.MeshBasicMaterial({map:t}));sm.position.set(0,.85,pd/2+.05);sm.userData.noOutline=true;pg.add(sm);bt(pg,[0,0,pd/2+.03],[0,.7,pd/2+.03],.03,fence);addOutlines(pg)});
    /* ---- Tierhandlung und Pfleger vorne links ---- */const k=grp(sc,[-6.2,0,4.6]);B(k,2.4,1.0,.8,.06,Wd(M,'#C98C5A'),[0,.5,0]);B(k,2.5,.08,.9,.03,M.c('#FFFDF7'),[0,1.04,0]);for(let i=0;i<3;i++)C(k,.12,.1,.2,M.c(['#FF8FB1','#7FC8F0','#FFD85A'][i]),[-.7+i*.5,1.18,0]);addOutlines(k);Cl.push({x0:-7.5,x1:-4.9,z0:4.1,z1:5.1});
    try{const kp=buildCreature(keeper(),{q:HIGH?.6:.42,noShadow:!HIGH,blob:false,merge:true});kp.scale.setScalar(CS);kp.position.set(-6.2,0,3.9);sc.add(kp);sc.userData.keeper=kp}catch(e){console.warn('Pfleger',e)}
    A.push({x:-6.2,z:5.7,r:1.2,label:'Tierhandlung',act:()=>BUILDINGS.pets()});A.push({x:-4.4,z:5.6,r:1.1,label:'Zoo-Führer (Arten und Belohnungen)',act:guide});
    INTERIOR.lamp(sc,'steh',W/2-.7,0,5.6,{col:'#FFE0A8',i:.9,d:7});INTERIOR.lamp(sc,'steh',-W/2+.7,0,5.6,{col:'#FFE0A8',i:.9,d:7});
    for(const x of[W/2-1.2,W/2-1.2])for(const z of[-4.5,4.2]){const tr=grp(sc,[x,0,z]);C(tr,.14,.18,1.4,Wd(M,'#8A5A44'),[0,.7,0]);P(tr,G.blob(.8,.12,4,z|0),M.c('#6FBF7A'),[0,1.8,0],null,[1,.85,1]);addOutlines(tr);Cl.push({x0:x-.4,x1:x+.4,z0:z-.4,z1:z+.4})}
    QF=oldQ;sc.userData.zoo=anim;return{W,D,camD:15}}
  function frame(dt,t){const sc=INTERIOR.scene;if(!sc)return;const u=sc.userData.zoo;if(!u)return;
    for(const f of u.fish){const s=Math.sin(t*f.sp+f.ph);const x=f.x0+(f.x1-f.x0)*(s*.5+.5);f.g.position.x=x;f.g.position.y=f.y+Math.sin(t*1.3+f.ph)*.06;f.g.rotation.y=Math.cos(t*f.sp+f.ph)>0?0:PI;f.g.rotation.z=Math.sin(t*6+f.ph)*.08}
    for(const b of u.bugs){b.g.position.y=b.y+Math.abs(Math.sin(t*2+b.ph))*.03;b.g.rotation.y+=dt*.3*Math.sin(t*.5+b.ph)}
    for(const a of u.animals){const k=t*.35+a.ph;const nx=a.cx*.4+Math.sin(k)*a.r*.8,nz=a.cz*.4+Math.sin(k*1.7)*a.r*.6;const dx=nx-a.o.position.x,dz=nz-a.o.position.z;const mv=Math.hypot(dx,dz)>.002;
      a.o.position.x=nx;a.o.position.z=nz;if(mv)a.o.rotation.y=Math.atan2(dx,dz);const an=a.g.children[0];if(an&&an.userData.tick)an.userData.tick(t+a.ph,mv,0,'')}
    const kp=sc.userData.keeper;if(kp&&kp.userData.tick)kp.userData.tick(t,false,UI.typing?.4:0)}
  function guide(){const c=counts(),T=total();const Z=SAVE.zoo=SAVE.zoo||{got:[]};const w=UI.win('Zoo-Führer · '+T.have+'/'+T.all+' Arten',{size:'wide'});
    w.body.append(el('p',null,'Fische '+c.f+'/'+c.F+' · Insekten '+c.b+'/'+c.Bn+' · Tiere '+c.a+'/'+c.A+'. Jede neue Art zieht automatisch in den Tierpark ein: Fische und Insekten, sobald du sie einmal gefangen hast, Tiere, sobald du sie getroffen hast.'));
    const gr=el('div','grid');for(const[n,r]of MIL){const done=Z.got.includes(n),ok=T.have>=Math.min(n,T.all);const cd=el('div','card');cd.append(el('b',null,n+' Arten'),el('span','sub',fmt(r)+' Taler'),el('span','sub',done?'abgeholt':ok?'bereit!':'noch '+(Math.min(n,T.all)-T.have)));
      if(ok&&!done){const b=btn('Abholen','primary',()=>{Z.got.push(n);money(r);persist();SND.jingle('j_success');UI.talk(NM,['Wunderbar! '+n+' Arten im Tierpark!','Hier, '+fmt(r)+' Taler für deine Mühe.'],{voice:VOICE});w.close()});cd.append(b)}gr.append(cd)}w.body.append(gr)}
  function enter(){INTERIOR.enter('zoo');const Z=SAVE.zoo=SAVE.zoo||{got:[]};if(!Z.hi){Z.hi=1;persist();setTimeout(()=>UI.talk(NM,['Willkommen im Tierpark!','Alle Fische, Insekten und Tiere, die du findest, bekommen hier ein Zuhause.','Das Tierzubehör verkaufe ich weiterhin da drüben an der Theke.'],{voice:VOICE}),900)}}
  if(typeof INTERIOR!=='undefined')INTERIOR.kinds.zoo={bg:'#DDEFD8',music:'museum',build,frame};
  return{enter,counts,total}
})();
