/* =====================================================================
   CYBORG-LABOR · habitat.js · Tiere frei statt in Kapseln
   – Grosses Aquarium: ein begehbarer Glasgang durch ein Riesenbecken.
     Jede Wasserart hat ihren eigenen Abschnitt mit passendem Boden,
     Pflanzen, Korallen und Steinen; die Fische schwimmen frei darin.
   – Insektenhäuser: je Planet ein eigener Raum mit den Biomen dieses
     Planeten (Boden, Bäume, Blumen, Steine, ein Teich). Insekten fliegen,
     krabbeln und klettern frei, die getroffenen Tiere streifen umher.
   – Fossilien-Sets: sechs Dino-Skelette aus je drei Teilen (Schädel,
     Rumpf, Schwanz). Sind alle drei gespendet, steht im Museum das ganze
     Skelett auf seiner Plattform.
   Beide Räume werden vom Museum (Spenden) und vom Tierpark-Pavillon
   (Fänge) aus betreten; die Tür vorn führt zurück in den Raum davor.
   ===================================================================== */
const HABITAT=(()=>{
  const{REL,relMeta}=NH;const EN={};const T=s=>(typeof I18N!=='undefined'&&I18N.t)?I18N.t(s):s;
  const st={src:'museum',from:'museum',pid:'kompost'};
  const list=kind=>{const ids=st.src==='zoo'?Object.keys((SAVE.caught&&SAVE.caught[kind==='fish'?'fish':'bugs'])||{}):((SAVE.donated&&SAVE.donated[kind==='fish'?'fish':'bugs'])||[]);
    const L=kind==='fish'?FISH:BUGS;const s=new Set(ids);return L.filter(x=>s.has(x.id))};
  /* Modell auf Grösse bringen, Boden auf y=0 */
  function fit(g,size){const bb=new THREE.Box3().setFromObject(g);const s=size/Math.max(.01,bb.max.x-bb.min.x,bb.max.y-bb.min.y,bb.max.z-bb.min.z);g.scale.multiplyScalar(s);const b2=new THREE.Box3().setFromObject(g);g.position.y-=b2.min.y;return g}
  function model(def,M,size){const q=new THREE.Group();QF=.55;try{def.b(q,M,def.opt||{},srand(3))}catch(e){}QF=1;addOutlines(q);try{mergeGroup(q)}catch(e){}const w=new THREE.Group();w.add(q);fit(w,size);const o=new THREE.Group();o.add(w);return o}
  function nature(type,M,size,seed){const n=NATURE[type];if(!n)return null;const g=new THREE.Group();QF=.5;try{n.b(g,M,{planet:st.pid},srand(seed||1))}catch(e){QF=1;return null}QF=1;addOutlines(g);try{mergeGroup(g)}catch(e){}const w=new THREE.Group();w.add(g);return fit(w,size)}
  function floorColor(sc,col){sc.traverse(o=>{if(o.isMesh&&o.name==='floor'){o.material=M0.c(col);o.material.needsUpdate=true}})}
  let M0=null;
  function sign(sc,txt,x,y,z,col,ry){const t=ctex('hab-'+txt+col,512,128,(c,w,h)=>{c.fillStyle=col;c.beginPath();c.roundRect?c.roundRect(4,4,w-8,h-8,40):c.rect(4,4,w-8,h-8);c.fill();c.fillStyle='#fff';c.font='bold 56px Fredoka, Nunito, sans-serif';c.textAlign='center';c.fillText(T(txt),w/2,84)});
    const m=P(sc,G.pl(2.4,.6),new THREE.MeshBasicMaterial({map:t,transparent:true}),[x,y,z],[0,ry||0,0]);m.userData.noOutline=true;return m}
  /* Hügel und Bodenflecken für mehr Gelände */
  function mound(sc,M,col,x,z,r,h){const m=P(sc,G.s(1),M.c(col),[x,0,z],null,[r,h,r*.8]);m.receiveShadow=true;return m}
  const rr=(a,b,r)=>a+(b-a)*r();

  /* ===================== Grosses Aquarium ===================== */
  const SECT=[
    {k:'riff',n:'Korallenriff',test:f=>f.where==='meer'&&f.planet!=='tiefsee'&&f.planet!=='frost',sand:'#F7DCA2',deep:'#E8C890',props:[['koralle',1.3],['leuchtkoralle',1.1],['muschelfels',.9],['tiefseegras',.8],['muschel_deko',.5]],water:'#7FDCF0'},
    {k:'tiefsee',n:'Tiefsee',test:f=>f.planet==='tiefsee',sand:'#2E4A6A',deep:'#22384F',props:[['roehrenwurm',1.4],['tiefseeschwamm',1.1],['leuchtkoralle',1.2],['tiefseegras',.9]],water:'#3A5A9A',dark:true},
    {k:'fluss',n:'Fluss',test:f=>f.where==='fluss',sand:'#C8BCA4',deep:'#A89A80',props:[['schilf',1.4],['moosfels',1],['moosfels_gross',1.3],['schilfpflanze',1]],water:'#9AD8E8'},
    {k:'teich',n:'Teich',test:f=>f.where==='teich',sand:'#8A9A5A',deep:'#6A7A48',props:[['lotusblume',.9],['schilfpflanze',1.2],['schilf',1.3],['moospolster',.6],['moosfels',.8]],water:'#9AE0C8'},
    {k:'eis',n:'Eissee',test:f=>f.where==='eissee'||(f.where==='meer'&&f.planet==='frost'),sand:'#E4EEF8',deep:'#C8D8EC',props:[['eisfels',1.3],['eiszapfenfels',1.4],['kristall',.8]],water:'#C8EEFF'},
    {k:'oase',n:'Oase',test:f=>f.where==='oase',sand:'#F0D8A0',deep:'#E0C080',props:[['oasenschilf',1.3],['palmwedel',1.1],['kiesel',.4]],water:'#9AE8E0'},
    {k:'sumpf',n:'Sumpf',test:f=>f.where==='sumpf',sand:'#5A5040',deep:'#4A4234',props:[['pilzgruppe',.8],['leuchtpilzgruppe',.8],['moospolster',.7],['moosstumpf',1]],water:'#7AB89A'},
    {k:'kuehl',n:'Kühlwasser',test:f=>f.where==='kuehlwasser',sand:'#5A6A7A',deep:'#4A5866',props:[['platinenfarn',1.2],['kristall',.9],['kristallfels',1.1]],water:'#8ACCE8'}];
  function buildAquarium(sc){const W=34,D=26,H=6;const M=M0=makeMats({skin:'haut',color:0});
    INTERIOR.makeRoom(sc,W,D,H,'holzpaneel','gras',{trim:'#2A5A7A',windows:false});floorColor(sc,'#E8D8B0');
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.8;o.color.set('#CFEFFF')}});
    const C=INTERIOR.colliders,A=INTERIOR.actions;const anim=[];sc.userData.hab={fish:anim,bugs:[],animals:[]};
    /* Glasgang in der Mitte (von vorn nach hinten, mit Querarm) */const WALK=3.2;const walk=P(sc,G.bx(WALK,.08,D,.02),M.c('#F4EEE0'),[0,.04,0]);walk.receiveShadow=true;
    /* acht Abschnitte, vier links, vier rechts */const fishAll=list('fish');const rnd=srand(77);
    const secW=(W-WALK)/2-.4,secD=D/4-.3;
    SECT.forEach((S,i)=>{const side=i<4?-1:1;const row=i%4;const cx=side*(WALK/2+.2+secW/2),cz=-D/2+.3+secD/2+row*(secD+.3)/1;const x0=cx-secW/2,x1=cx+secW/2,z0=cz-secD/2,z1=cz+secD/2;
      /* Boden des Abschnitts mit Hügeln */const base=P(sc,G.bx(secW,.12,secD,.04),M.c(S.sand),[cx,.06,cz]);base.receiveShadow=true;
      for(let k=0;k<5;k++)mound(sc,M,k%2?S.deep:S.sand,rr(x0+1,x1-1,rnd),rr(z0+.8,z1-.8,rnd),rr(.8,1.6,rnd),rr(.2,.5,rnd));
      /* Pflanzen, Korallen, Steine */for(let k=0;k<12;k++){const[t,s]=S.props[k%S.props.length];const g=nature(t,M,s*rr(.8,1.25,rnd),i*31+k);if(!g)continue;g.position.set(rr(x0+.6,x1-.6,rnd),.1,rr(z0+.5,z1-.5,rnd));g.rotation.y=rnd()*TAU;sc.add(g)}
      /* Wasser als leichter Schleier, Glas zum Gang hin */const wv=new THREE.Mesh(new THREE.BoxGeometry(secW,H-1.6,secD),new THREE.MeshBasicMaterial({color:S.water,transparent:true,opacity:S.dark?.22:.07,depthWrite:false}));wv.position.set(cx,(H-1.6)/2+.1,cz);wv.userData.noOutline=true;sc.add(wv);
      const gl=P(sc,G.bx(.06,2.4,secD,.02),M.glass?M.glass('#BFEFFF'):M.c('#BFEFFF',{opacity:.3}),[side*(WALK/2+.1),1.3,cz]);gl.userData.noOutline=true;
      C.push({x0:Math.min(x0,x1)-.05,x1:Math.max(x0,x1)+.05,z0,z1});
      sign(sc,S.n,side*(WALK/2+.16),3,cz,S.dark?'#2A4A8A':'#3A9AC8',side<0?PI/2:-PI/2);
      if(S.dark){const L=new THREE.PointLight('#7ab8ff',.9,8,2);L.position.set(cx,2.5,cz);sc.add(L)}
      /* Fische dieses Abschnitts schwimmen frei im ganzen Abschnitt */const mine=fishAll.filter(f=>SECT.find(q=>q.test(f))===S);
      mine.forEach((f,k)=>{const sz={S:.45,M:.62,L:.85,XL:1.1}[f.size]||.6;const g=model(f,M,sz);sc.add(g);
        anim.push({g,box:[x0+.6,x1-.6,.6,H-2.2,z0+.5,z1-.5],p:new THREE.Vector3(rr(x0+.6,x1-.6,rnd),rr(.8,H-2.4,rnd),rr(z0+.5,z1-.5,rnd)),t:null,sp:.5+rnd()*.6,ph:rnd()*9,def:f})});
      A.push({x:side*(WALK/2-.5),z:cz,r:1.4,label:T(S.n)+': '+mine.length+' '+T('Fische'),act:()=>showList(T(S.n),mine.map(f=>['fish',f]))})});
    sign(sc,'Grosses Aquarium',0,H-1.2,-D/2+.1,'#2A7AB8');
    for(const z of[-D/4,D/4]){const L=new THREE.PointLight('#bfefff',.8,14,2);L.position.set(0,H-1.4,z);sc.add(L)}
    return{W,D,camD:17,camH:12}}

  /* ===================== Insektenhaus je Planet ===================== */
  const OLD={kompost:['wiese','blumenfeld','wald','kirschhain','herbstwald'],frost:['schneefeld','tannenwald','polarhuegel'],wueste:['duenen','kakteenfeld','oase'],korallen:['palmenhain','riffstrand'],pilz:['pilzwald','moorwiese'],schrott:['schrottebene','kristallfeld','gluehwald']};
  function biomesOf(pid){const d=PLANETS[pid]||{};return(d.bio&&d.bio.length?d.bio:OLD[pid]||['wiese']).filter(b=>BIOMES[b]).slice(0,6)}
  function buildHabitat(sc){const W=28,D=22,H=6;const pid=st.pid;const M=M0=makeMats({skin:'haut',color:0});const def=PLANETS[pid]||{};
    INTERIOR.makeRoom(sc,W,D,H,'holzpaneel','gras',{trim:'#5A8A4A',windows:false});
    const bios=biomesOf(pid);const B0=BIOMES[bios[0]]||BIOMES.wiese;floorColor(sc,B0.g[1]||B0.g[0]);
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.9;o.color.set('#FFF6E6')}});
    const C=INTERIOR.colliders,A=INTERIOR.actions;const H_={fish:[],bugs:[],animals:[]};sc.userData.hab=H_;const rnd=srand(hashNum?hashNum('hab'+pid):11);
    /* Weg vom Eingang zur Mitte und als Ring */const path=M.c('#E8DCC8');P(sc,G.bx(2.2,.06,D/2,.02),path,[0,.03,D/4]);P(sc,G.cy(3.2,3.2,.06,32),path,[0,.03,0]);
    /* Biom-Zonen: Raster 3×2 um den Platz in der Mitte */const zones=[];const cols=3,rows=2;const zw=W/cols,zd=D/rows;
    bios.forEach((b,i)=>{const cx=-W/2+zw*(i%cols+.5),cz=-D/2+zd*(Math.floor(i/cols)+.5);zones.push({b,cx,cz,x0:cx-zw/2+.4,x1:cx+zw/2-.4,z0:cz-zd/2+.4,z1:cz+zd/2-.4})});
    const trees=[];
    zones.forEach((Z,i)=>{const Bi=BIOMES[Z.b];const pad=P(sc,G.bx(zw-.3,.1,zd-.3,.05),M.c(Bi.g[0]),[Z.cx,.05,Z.cz]);pad.receiveShadow=true;
      for(let k=0;k<4;k++)mound(sc,M,Bi.g[k%2],rr(Z.x0+1,Z.x1-1,rnd),rr(Z.z0+1,Z.z1-1,rnd),rr(.9,1.8,rnd),rr(.15,.45,rnd));
      const pick=(L,n,size,fn)=>{if(!L||!L.length)return;for(let k=0;k<n;k++){const[t]=L[k%L.length];const g=nature(t,M,size*rr(.8,1.2,rnd),i*53+k);if(!g)continue;
        let x=rr(Z.x0+.6,Z.x1-.6,rnd),z=rr(Z.z0+.6,Z.z1-.6,rnd);if(Math.hypot(x,z)<3.6||(Math.abs(x)<1.4&&z>0))continue;g.position.set(x,.08,z);g.rotation.y=rnd()*TAU;sc.add(g);fn&&fn(g,x,z)}};
      pick(Bi.trees,3,3.2,(g,x,z)=>{trees.push({x,z,h:3.2});C.push({x0:x-.35,x1:x+.35,z0:z-.35,z1:z+.35})});
      pick(Bi.deco,9,.6);pick(Bi.rocks,3,.8,(g,x,z)=>C.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3}));
      if(Z.cz<0)sign(sc,Bi.n,Z.cx,H-1.3,-D/2+.1,'#5AA05A',0);else{const sg=sign(sc,Bi.n,Z.cx,1.5,Z.z1-.2,'#5AA05A',0);sg.scale.setScalar(.6);P(sc,G.cy(.05,.05,1.3),M.c('#8A5A44'),[Z.cx,.65,Z.z1-.25])}});
    /* Teich in der Mitte für Wasser-Insekten */const pond=P(sc,G.cy(1.6,1.6,.05,28),M.c('#7FD0E8',{gloss:1.4}),[0,.08,0]);pond.userData.noOutline=true;C.push({x0:-1.5,x1:1.5,z0:-1.5,z1:1.5});
    /* Insekten dieses Planeten */const bugs=list('bug').filter(b=>b.planet===pid);
    bugs.forEach((b,k)=>{const fly=['luft','blume'].includes(b.where),water=b.where==='wasser',tree=b.where==='baum'&&trees.length;const g=model(b,M,fly?.5:.42);sc.add(g);
      const Z=zones[k%zones.length]||{x0:-W/2+1,x1:W/2-1,z0:-D/2+1,z1:D/2-1};const tr=tree?trees[k%trees.length]:null;
      const e={g,mode:fly?'fly':water?'water':tree?'tree':'ground',Z,tr,p:new THREE.Vector3(rr(Z.x0,Z.x1,rnd),0,rr(Z.z0,Z.z1,rnd)),t:null,sp:fly?1:.4,ph:rnd()*9,def:b};if(water){e.p.set(rr(-1,1,rnd),0,rr(-1,1,rnd))}H_.bugs.push(e)});
    /* getroffene Tiere dieses Planeten streifen umher */const seen=SAVE.faunaSeen||{};
    if(typeof FAUNA!=='undefined')for(const[k,sp]of Object.entries(FAUNA.S)){if(sp.planet!==pid||!seen[k]||sp.water)continue;const g=new THREE.Group();try{const a=FAUNA.buildAnimal(sp.a,M);a.scale.setScalar((sp.size||1)*.75);g.add(a);addOutlines(g);sc.add(g);
      const Z=zones[H_.animals.length%zones.length];H_.animals.push({g,inner:a,Z,p:new THREE.Vector3(rr(Z.x0,Z.x1,rnd),0,rr(Z.z0,Z.z1,rnd)),t:null,sp:(sp.speed||.8)*.6,idle:rnd()*3,ph:rnd()*9})}catch(e){}}
    sign(sc,(def.n||pid)+' · '+T('Insektenhaus'),0,H-1,-D/2+.1,'#5AA05A');
    A.push({x:0,z:D/2-2.2,r:1.5,label:T('Insekten')+': '+bugs.length,act:()=>showList(T('Insekten'),bugs.map(b=>['bug',b]))});
    if(!bugs.length){A.push({x:0,z:2.6,r:2,label:T('Noch keine Insekten von diesem Planeten'),act:()=>{}})}
    for(const z of[-D/4,D/4])for(const x of[-W/3,W/3]){const L=new THREE.PointLight('#fff2d8',.55,12,2);L.position.set(x,H-1.5,z);sc.add(L)}
    return{W,D,camD:17,camH:12}}

  /* ===================== Bewegung ===================== */
  const V=THREE.Vector3;const tmp=new V();
  function wander(e,dt,box,y0,y1){if(!e.t||e.p.distanceTo(e.t)<.3)e.t=new V(rr(box[0],box[1],Math.random),y0==null?0:rr(y0,y1,Math.random),rr(box[box.length-2],box[box.length-1],Math.random));
    tmp.copy(e.t).sub(e.p);const d=tmp.length();if(d>1e-4){tmp.multiplyScalar(Math.min(1,e.sp*dt/d));e.p.add(tmp);e.g.rotation.y=Math.atan2(e.t.x-e.p.x,e.t.z-e.p.z)}}
  function frame(dt,t){const sc=INTERIOR.scene;const H_=sc&&sc.userData.hab;if(!H_)return;
    for(const f of H_.fish){const b=f.box;wander(f,dt,[b[0],b[1],b[4],b[5]],b[2],b[3]);f.g.position.copy(f.p);f.g.position.y+=Math.sin(t*1.3+f.ph)*.05;f.g.rotation.z=Math.sin(t*6+f.ph)*.06}
    for(const e of H_.bugs){const Z=e.Z;if(e.mode==='fly'){wander(e,dt,[Z.x0,Z.x1,Z.z0,Z.z1],.8,2.6);e.g.position.copy(e.p);e.g.position.y+=Math.sin(t*5+e.ph)*.08}
      else if(e.mode==='water'){wander(e,dt,[-1.3,1.3,-1.3,1.3],null);e.g.position.set(e.p.x,.12,e.p.z)}
      else if(e.mode==='tree'){const h=1+((Math.sin(t*.3+e.ph)+1)/2)*1.6;e.g.position.set(e.tr.x+.32,h,e.tr.z);e.g.rotation.set(-PI/2,0,0)}
      else{if(Math.sin(t*.7+e.ph)>-.3)wander(e,dt,[Z.x0,Z.x1,Z.z0,Z.z1],null);e.g.position.set(e.p.x,.1,e.p.z)}}
    for(const a of H_.animals){a.idle-=dt;let mv=false;if(a.idle<=0){const before=a.p.clone();wander(a,dt,[a.Z.x0,a.Z.x1,a.Z.z0,a.Z.z1],null);mv=before.distanceTo(a.p)>1e-4;if(a.t&&a.p.distanceTo(a.t)<.35)a.idle=1.5+Math.random()*4}
      a.g.position.set(a.p.x,.08,a.p.z);if(a.inner.userData.tick)a.inner.userData.tick(t+a.ph,mv,0,'')}}

  /* Liste der Arten im Abschnitt (Namen, Bilder nur für die ersten 24) */
  function showList(title,items){const w=UI.win(title+' · '+items.length,{size:'wide'});const gr=el('div','grid');items.forEach(([k,d],i)=>{const c=el('div','card');if(i<24)c.append(itemThumb(k,d.id));c.append(el('b',null,d.n));gr.append(c)});
    if(!items.length)w.body.append(el('p','sub',T('Noch leer.')));w.body.append(gr);SND.play('page')}
  /* Planet wählen und Insektenhaus betreten */
  function pickPlanet(src,from){const w=UI.win(T('Insektenhäuser'),{size:'wide'});w.body.append(el('p','sub',T('Jeder Planet hat sein eigenes Haus. Darin leben die Insekten frei in ihren Landschaften.')));
    st.src=src;const bl=list('bug');const gr=el('div','grid');
    for(const pid of Object.keys(PLANETS)){if(PLANETS[pid].hidden)continue;const n=bl.filter(b=>b.planet===pid).length,all=BUGS.filter(b=>b.planet===pid).length;if(!all)continue;
      const b=el('button','card');b.type='button';b.append(el('b',null,PLANETS[pid].n||pid),el('span','sub',n+' / '+all));b.onclick=()=>{w.close();enterHabitat(pid,src,from)};gr.append(b)}
    w.body.append(gr)}
  function enterHabitat(pid,src,from){st.pid=pid;st.src=src;st.from=from;INTERIOR.enter('habitat')}
  function enterAquarium(src,from){st.src=src;st.from=from;INTERIOR.enter('aquarium')}
  if(typeof INTERIOR!=='undefined'){
    INTERIOR.kinds.aquarium={bg:'#9ED8F0',music:'fishing',build:buildAquarium,frame,back:()=>st.from,lightTint:'#CFF4FF',shadowTint:'#5A8AB8'};
    INTERIOR.kinds.habitat={bg:'#DDEFD8',music:'fishing',build:buildHabitat,frame,back:()=>st.from}}

  /* ===================== Fossilien-Sets ===================== */
  const BONE='#EFE6D2',BONE2='#D8CCB0';
  const DINOS=[['trex','T-Rex','T. rex','Trex','Die Zähne des T-Rex waren so lang wie Bananen. Er hatte einen der stärksten Bisse aller Landtiere.','The teeth of T. rex were as long as bananas. It had one of the strongest bites of any land animal.'],
    ['apato','Apatosaurus','Apatosaurus','Apatosaurus','Der Apatosaurus war länger als ein Bus. Sein langer Hals half ihm, Blätter hoch oben in Bäumen zu fressen.','Apatosaurus was longer than a bus. Its long neck helped it eat leaves high up in trees.'],
    ['parasauro','Parasaurolophus','Parasaurolophus','Parasaurolophus','Im hohlen Kamm des Parasaurolophus lief die Luft durch lange Röhren. So konnte er wahrscheinlich tief tröten.','Air ran through long tubes in the hollow crest of Parasaurolophus. It could probably make deep trumpeting sounds.'],
    ['stego','Stegosaurus','Stegosaurus','Stegosaurus','Der Stegosaurus war so gross wie ein Bus, aber sein Gehirn war nur etwa so gross wie eine Walnuss.','Stegosaurus was as big as a bus, but its brain was only about the size of a walnut.'],
    ['trice','Triceratops','Triceratops','Triceratops','Der Triceratops hatte drei Hörner und einen grossen Nackenschild aus Knochen.','Triceratops had three horns and a big neck frill made of bone.'],
    ['raptor','Velociraptor','Velociraptor','Velociraptor','Der Velociraptor war nur etwa so gross wie ein Truthahn und hatte Federn.','Velociraptor was only about as big as a turkey and had feathers.']];
  const PARTS=[['schaedel','Schädel','skull'],['rumpf','Rumpf','torso'],['schwanz','Schwanz','tail']];
  function boneSkull(g,m){const b=m.c(BONE,{rim:.4}),d=m.c('#3a3028');P(g,G.s(.3),b,[0,.36,0],null,[1,.8,1.4]);both(s=>P(g,G.s(.07),d,[s*.13,.42,.22]));P(g,G.bx(.34,.08,.4,.03),b,[0,.16,.1]);for(let i=0;i<5;i++)P(g,G.co(.025,.08,5),m.c('#FFFBF0'),[(i-2)*.06,.2,.32],[PI,0,0])}
  function boneTorso(g,m){const b=m.c(BONE,{rim:.4});P(g,G.ca(.06,.8),b,[0,.5,0],[0,0,PI/2]);for(let i=0;i<6;i++){const x=(i-2.5)*.14;P(g,G.to(.24-Math.abs(i-2.5)*.02,.03,PI*1.3),b,[x,.38,0],[0,PI/2,-PI*.15])}}
  function boneTail(g,m){const b=m.c(BONE,{rim:.4});for(let i=0;i<9;i++){const r=.09-i*.008;P(g,G.s(r),i%2?m.c(BONE2):b,[(i-4)*.13,.12+Math.sin(i*.4)*.08,0],null,[1.2,1,1])}}
  const BUILD={schaedel:boneSkull,rumpf:boneTorso,schwanz:boneTail};
  DINOS.forEach(([k,de,en,kit,fde,fen],di)=>PARTS.forEach(([pk,pde,pen],pi)=>{const id='fos_'+k+'_'+pk;const n=de+'-'+pde,nen=en+' '+pen;
    REL(id,relMeta(n,'urzeit','fossil',2+(pi===0?1:0),900+di*120+(pi===0?500:0),`Ein Fossil: ${n}! Zusammen mit den anderen Teilen ergibt es ein ganzes Skelett.`,fde),(g,m)=>BUILD[pk](g,m));
    const t=`Ein Fossil: ${n}! Zusammen mit den anderen Teilen ergibt es ein ganzes Skelett.`;EN[n]=nen;EN[t]=`A fossil: ${nen}! Together with the other pieces it makes a whole skeleton.`;EN[fde]=fen}));
  const SETS=DINOS.map(([k,de,en,kit])=>({k,n:de,kit,parts:PARTS.map(([pk,pde])=>({id:'fos_'+k+'_'+pk,n:pde}))}));
  /* Skelett auf einer Plattform: ganz (Knochenfarbe) oder als Umriss mit den gespendeten Teilen */
  function skeleton(set,have,M,size){const g=new THREE.Group();const done=set.parts.every(p=>have.includes(p.id));
    const put=mm=>{const b=KIT.bounds('dino',set.kit);if(!mm||!b)return;const h=Math.max(b[3]-b[0],b[4]-b[1],b[5]-b[2]);const k=size/h;mm.scale.setScalar(k);mm.position.set(-(b[0]+b[3])/2*k,-b[1]*k,-(b[2]+b[5])/2*k);g.add(mm)};
    const pal=c=>({byHex:new Proxy({},{get:()=>c}),tint:c,line:'#6a5a48'});
    const add=()=>{if(done){put(KIT.mesh('dino',set.kit,pal(BONE)))}else{const mm=KIT.mesh('dino',set.kit,pal('#c8d8e8'));if(mm){mm.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.22;o.material.depthWrite=false;o.userData.noOutline=true}});put(mm)}
        set.parts.forEach((p,i)=>{if(!have.includes(p.id))return;const r=RELICS.find(x=>x.id===p.id);if(!r)return;const q=new THREE.Group();QF=.6;try{r.b(q,M,{},srand(i))}catch(e){}QF=1;addOutlines(q);q.scale.setScalar(.9);q.position.set((i-1)*.9,0,size*.35);g.add(q)})}};
    if(typeof KIT!=='undefined'&&KIT.has&&KIT.has('dino',set.kit))add();else if(typeof KIT!=='undefined')KIT.load('dino').then(add).catch(()=>{});return{g,done}}
  try{if(typeof I18N!=='undefined'&&I18N.extend)I18N.extend('en',EN)}catch(e){}
  return{enterAquarium,enterHabitat,pickPlanet,SETS,skeleton,showList,st}
})();
