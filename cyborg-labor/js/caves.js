/* =====================================================================
   CYBORG-LABOR · caves.js
   Höhlen: Felstore am Fuss von Klippen führen in Höhlen aus dem Kenney
   Modular Cave Kit (CC0), eingefärbt je Planet. Jede Höhle ist anders
   (Seed): leuchtende Kristalle in Planetenfarben, Tropfsteine,
   Leuchtpilze, ein glimmender Teich, Fossilien zum Ausgraben und
   Kristalladern zum Abbauen. Ausgegrabenes bleibt ausgegraben.
   ===================================================================== */
const CAVES=(()=>{
  /* Felsfarben je Planet: hell, mittel, dunkel + Kristallfarben */
  const ROCK={kompost:['#B8A48E','#8E7A68','#5E4E48',['#8FE8C8','#FFD27A','#C6A9FF']],schrott:['#A8A4C4','#7C7898','#4E4A68',['#6FE3C8','#FF8FB8','#7FC8FF']],
    korallen:['#F0CFB0','#D0A080','#8E6A5A',['#7FE8F0','#FF9EB8','#FFE27A']],frost:['#DCE6F4','#A8B8D0','#6E7E9A',['#9FE0FF','#E6F0FF','#C6B8FF']],
    wueste:['#E8A878','#C07850','#7E4A38',['#FFB45A','#FF7A6A','#7FE0D0']],pilz:['#A898C0','#7A6A8E','#4A3E5E',['#B8FFE8','#FF8FD8','#C6A9FF']]};
  const rockOf=pid=>ROCK[pid]||ROCK.kompost;
  function pal(pid){const[l,m,d]=rockOf(pid);return{wood:m,woodL:l,wood2:m,sand:l,sandD:m,stone:l,dark:m,wall:l,trim:l,roof:m,roof2:d,roofB:d,metal:'#9AA4B8',metalD:'#6E7890',light:'#FFD27A',plant:'#6FBF7A',plantD:'#4E9A5E',glass:'#DDF4FF',snow:l}}
  let cur=null;
  const pid=()=>(GAME.G&&GAME.G.id)||'kompost';
  /* ---------- Eingang auf dem Planeten (world.js ruft das auf) ---------- */
  function entrance(M,p){const g=new THREE.Group();const P2=pal(p);
    if(typeof KIT!=='undefined'&&KIT.has('cave','gate-rock')){const b=KIT.bounds('cave','gate-rock');const m=KIT.mesh('cave','gate-rock',P2);const s=.62;m.scale.setScalar(s);m.position.set(-(b[0]+b[3])/2*s,-b[1]*s-.05,-(b[2]+b[5])/2*s);g.add(m)}
    /* dunkles Loch mit Tiefe */const hole=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,1.6,24,1,true,0,PI),new THREE.MeshBasicMaterial({color:'#120C18',side:THREE.BackSide}));hole.rotation.set(PI/2,0,PI/2);hole.position.set(0,.95,-.35);hole.scale.set(1,1,1.25);hole.userData.noOutline=true;g.add(hole);
    const back=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:'#0C0810'}));back.position.set(0,.95,-1.1);back.scale.set(.95,1.2,1);back.userData.noOutline=true;g.add(back);
    /* Kristallschimmer im Inneren */const cc=rockOf(p)[3];for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(.1+i*.03,0),M.glow(cc[i%3],1.4));c.position.set(-.4+i*.4,.2+i*.12,-.8);c.scale.y=2;g.add(c)}
    return g}
  /* ---------- Innenraum ---------- */
  function cutGeo(g,zCut){const pos=g.attributes.position;const keep=[];
    for(let t=0;t<pos.count;t+=3){let front=true;for(let k=0;k<3;k++){if(pos.getZ(t+k)<zCut||pos.getY(t+k)<.15)front=false}if(!front)keep.push(t)}
    const out=new THREE.BufferGeometry();for(const name of Object.keys(g.attributes)){const a=g.attributes[name];const arr=new a.array.constructor(keep.length*3*a.itemSize);keep.forEach((t,i)=>{for(let k=0;k<3;k++)for(let c=0;c<a.itemSize;c++)arr[(i*3+k)*a.itemSize+c]=a.array[(t+k)*a.itemSize+c]});out.setAttribute(name,new THREE.BufferAttribute(arr,a.itemSize))}
    out.computeBoundingSphere();return out}
  /* Vorderwand entfernen, damit die Kamera hineinschaut (Hauptnetz und Umriss-Hülle getrennt) */
  function cutFront(mesh,zCut){mesh.traverse(o=>{if(o.isMesh&&o.geometry&&!o.geometry.index)o.geometry=cutGeo(o.geometry,zCut)})}
  function crystal(M,col,s){const g=new THREE.Group();const n=3+Math.floor(Math.random()*3);for(let i=0;i<n;i++){const h=(.5+Math.random()*.7)*s;const c=P(g,G.cy(0,.09*s,h,),M.glow(col,1.3),[(Math.random()-.5)*.3*s,h/2,(Math.random()-.5)*.3*s],[(Math.random()-.5)*.6,0,(Math.random()-.5)*.6]);c.geometry=new THREE.CylinderGeometry(0,.1*s,h,5)}
    P(g,G.ico(.18*s,0),M.c('#5E4E58'),[0,.05,0],null,[1.4,.5,1.2]);return g}
  function stalagmite(M,col,h){const g=new THREE.Group();P(g,G.co(.22*h,h,7),M.c(col),[0,h/2,0]);P(g,G.co(.12*h,h*.6,6),M.c(col),[.2*h,h*.3,.1*h]);return g}
  function build(sc){const C=cur||{seed:1,id:'x'};const p=pid();const r=srand(C.seed);const[lt,md,dk,cc]=rockOf(p);const M=makeMats({skin:'haut',color:0});const A=INTERIOR.actions,Cl=INTERIOR.colliders;
    const W=9.2,D=9.2;sc.background=new THREE.Color('#0C0A12');sc.fog=new THREE.Fog('#0C0A12',14,30);sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.16;o.color.set('#C8D0FF');o.groundColor.set('#2A2030')}});
    /* Raum aus dem Kit (zufällige Variante), Vorderwand weg */
    const kind=['room-large','room-large-variation'][Math.floor(r()*2)];if(typeof KIT!=='undefined'&&KIT.has('cave',kind)){const b=KIT.bounds('cave',kind);const m=KIT.mesh('cave',kind,pal(p));cutFront(m,b[5]*.62);const s=.5;const g=new THREE.Group();m.scale.setScalar(s);m.position.set(-(b[0]+b[3])/2*s,-b[1]*s,-(b[2]+b[5])/2*s);g.add(m);sc.add(g)}
    /* Boden-Fläche (für Schatten/Klick) */const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshLambertMaterial({color:dk}));fl.rotation.x=-PI/2;fl.position.y=-.01;fl.name='floor';fl.userData.noOutline=true;sc.add(fl);
    /* Kristalle mit Licht an den Wänden */const spots=[[-3.6,-3.4],[3.5,-3.2],[-3.8,.8],[3.7,1.2],[0,-3.9],[-2,-3.8],[2.2,-3.7]];const nC=4+Math.floor(r()*3);
    for(let i=0;i<nC;i++){const[x,z]=spots[i];const col=cc[Math.floor(r()*cc.length)];const g=crystal(M,col,.9+r()*.8);g.position.set(x,0,z);g.rotation.y=r()*TAU;sc.add(g);Cl.push({x0:x-.4,x1:x+.4,z0:z-.4,z1:z+.4});
      if(i<4){const L=new THREE.PointLight(col,1.1,6,2);L.position.set(x,1,z);sc.add(L)}}
    /* Tropfsteine + Leuchtpilze */for(let i=0;i<7;i++){const x=(r()-.5)*7.4,z=-3.8+r()*6;if(Math.abs(x)<1.3&&z>1)continue;const s=stalagmite(M,md,.5+r()*.9);s.position.set(x,0,z);sc.add(s);Cl.push({x0:x-.25,x1:x+.25,z0:z-.25,z1:z+.25})}
    for(let i=0;i<6;i++){const x=(r()-.5)*8,z=-3.5+r()*6.5;const g=new THREE.Group();const col=cc[i%cc.length];P(g,G.cy(.03,.04,.22),M.c('#F4ECE0'),[0,.11,0]);P(g,G.hs(.12),M.glow(col,1.2),[0,.2,0],null,[1,.7,1]);g.position.set(x,0,z);sc.add(g)}
    /* Glimmender Teich */const pond=new THREE.Mesh(new THREE.CircleGeometry(1.1,32),new THREE.MeshBasicMaterial({color:cc[0],transparent:true,opacity:.6,toneMapped:false}));pond.rotation.x=-PI/2;pond.position.set(2.2,.02,-1);pond.userData.noOutline=true;sc.add(pond);
    const rim=P(sc,G.to(1.12,.12),M.c(md),[2.2,.02,-1],[PI/2,0,0]);Cl.push({x0:1.1,x1:3.3,z0:-2.1,z1:.1});const pl=new THREE.PointLight(cc[0],.9,5,2);pl.position.set(2.2,.5,-1);sc.add(pl);sc.userData.pond=pond;
    /* Leiter und vergitterter Gang: Geheimnisse für später */if(KIT.has('cave','ladder')){const lb=KIT.bounds('cave','ladder');const l=KIT.mesh('cave','ladder',pal(p));l.scale.setScalar(.8);l.position.set(-4.2,0,-1.8);l.rotation.y=PI/2;sc.add(l)}
    /* Laterne am Eingang */INTERIOR.lamp(sc,'steh',-3.6,0,3.4,{col:'#FFC88A',i:1.2,d:7,shade:'#3E3446'});
    /* Fossilien ausgraben, Kristalladern abbauen (bleiben erledigt) */const S=SAVE.caves=SAVE.caves||{};const st=S[C.id]=S[C.id]||{dug:[],mined:[]};
    const fossPos=[[-1.8,-1.2],[1,1.8],[-2.9,2.1]].slice(0,2+Math.floor(r()*2));fossPos.forEach(([x,z],i)=>{if(st.dug.includes(i))return;const g=new THREE.Group();P(g,G.circ(.45),M.c(dk),[0,.015,0],[-PI/2,0,0]);for(let k=0;k<4;k++)P(g,G.ca(.03,.16),M.c('#F4ECE0'),[(k-1.5)*.12,.04,(k%2)*.1],[PI/2,0,k*.7]);
      g.position.set(x,0,z);sc.add(g);const a={x,z,r:1.1,label:'Fossil ausgraben',act:()=>digFossil(i,g,a)};A.push(a)});
    const vein=[[3.8,-3.6],[-3.9,-1]];vein.forEach(([x,z],i)=>{if(st.mined.includes(i))return;const col=cc[(i+1)%cc.length];const g=crystal(M,col,1.3);g.position.set(x,0,z);sc.add(g);const a={x:x+(x>0?-.9:.9),z,r:1.1,label:'Kristall abbauen',act:()=>mine(i,g,a)};A.push(a)});
    function digFossil(i,g,a){SND.play('chop');GAME.W&&0;g.parent&&g.parent.remove(g);A.splice(A.indexOf(a),1);st.dug.push(i);persist();
      const pool=RELICS.filter(x=>x.kind==='fossil');const rel=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
      if(rel&&bagAdd('relic',rel.id)){SAVE.caught.relics[rel.id]=(SAVE.caught.relics[rel.id]||0)+1;SAVE.stats.relics++;persist();SND.jingle('j_success');UI.toast('Fossil gefunden: '+rel.n+'!',2800)}else{money(20);UI.toast('Nur Gestein … und 20 Taler.')}}
    function mine(i,g,a){SND.play('chop');setTimeout(()=>SND.play('chop'),300);g.parent&&g.parent.remove(g);A.splice(A.indexOf(a),1);st.mined.push(i);persist();
      const has=typeof ITEMS!=='undefined'&&ITEMS.some(x=>x.id==='kristall');if(has&&bagAdd('item','kristall')){SND.play('pickup');UI.toast('Kristall abgebaut!')}else{money(25);UI.toast('Kristallsplitter verkauft: 25 Taler')}}
    return{W,D,camD:12.5}}
  function enter(c){cur=c;SAVE.stats.caves=(SAVE.stats.caves||0)+1;INTERIOR.enter('hoehle')}
  INTERIOR.kinds.hoehle={bg:'#0C0A12',music:'museum',build,frame(dt,t){const p=INTERIOR.scene&&INTERIOR.scene.userData.pond;if(p)p.material.opacity=.5+.12*Math.sin(t*1.4)}};
  return{entrance,enter,pal,ROCK}
})();
