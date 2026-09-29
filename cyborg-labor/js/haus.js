/* =================== HAUS: einzigartige Häuser aus Bausatz-Modulen ===================
   Ein Haus = Grundriss aus Zellen (1×1 Kenney-Einheit) + Stockwerke + Dachform + Anbauten,
   alles aus der Bewohner-ID gewürfelt. Farben: Planetenpalette mit leichter Abwandlung je Haus. */
const HAUS=(()=>{
  const V=THREE.Vector3;const PI=Math.PI;
  const ROT={px:0,pz:-PI/2,nx:PI,nz:PI/2};const DIRS=[['px',1,0],['nx',-1,0],['pz',0,1],['nz',0,-1]];
  function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
  const pick=(r,a)=>a[Math.floor(r()*a.length)];
  /* ---------- Paletten: je Planet Farbfamilien, je Haus eine Kombination ---------- */
  const THEMES={
    kompost:{roof:['#E8726E','#F29A5C','#5FB8A0','#7C9BE0','#C77DB8','#E8B85A'],wall:['#FFF1DC','#F6E3C4','#EAF1FF','#FDE6E6','#E9F6E4'],wood:['#C98158','#B8704C','#A77A5A','#D69968'],stone:['#B9B3C9','#C9BBAE','#AFB8C8'],trim:['#FFFFFF','#FFF6E8'],plant:['#6CC56F','#58B868']},
    schrott:{roof:['#6E7BC9','#8A6FB8','#5AA7A0','#C77A5A','#7A8AA0'],wall:['#D9D3EA','#E4E0EE','#CFD8E6','#EAD9CF'],wood:['#9C7A6A','#8A6E7A','#A58A70'],stone:['#8F8AA8','#9A96B0','#7E8A9C'],trim:['#EDEBF5','#D6F2EC'],plant:['#6FE3C8','#5AC8B0'],metal:['#8E94B0','#A0A6C0']},
    korallen:{roof:['#F28C8C','#FFB38A','#5FD0D8','#F7C66A','#E88CB8'],wall:['#FFF6E6','#FFEFD9','#EAFBFF','#FFF0F2'],wood:['#D9A273','#C98E62','#E0B088'],stone:['#E8D8C2','#F0E2CC','#D9CBB8'],trim:['#FFFFFF','#FFF8EC'],plant:['#6ED68A','#58C27C']},
    frost:{roof:['#F4F8FF','#EEF3FF','#F8F4FF','#6E8FD8','#D86E7A'],wall:['#F4F8FF','#EAF0FA','#FFF6EE','#E6EEF8'],wood:['#B07A5A','#9C6A4E','#C08A68'],stone:['#B8C4D8','#C4CEE0','#AAB8CC'],trim:['#FFFFFF'],plant:['#5FA88E','#4E9A82'],snow:['#F4FAFF']},
    wueste:{roof:['#E07A4E','#5FB8B0','#E8B04E','#C75A5A','#6E9AD0'],wall:['#FBE3C0','#F6D6AC','#FFEBD0','#F2D2B4'],wood:['#B8784E','#A56A44','#C98A5A'],stone:['#E0BE94','#D4AE84','#E8CCA4'],trim:['#FFF6E4','#FFFFFF'],plant:['#7CB86A','#6AA85E']},
    pilz:{roof:['#C06EC0','#E07A9A','#6EB8C0','#8E6ED8','#E0A05A'],wall:['#F2E6FA','#FBEAF2','#E6F0F8','#F6EEE0'],wood:['#9C6E88','#8A6E9C','#A87A6E'],stone:['#B8A8CC','#C4B4D4','#A89CC0'],trim:['#FFF4FF','#FFFFFF'],plant:['#7FDCC8','#8CCB8A']}};
  function palette(pid,r){const T=THEMES[pid]||THEMES.kompost;const roof=pick(r,T.roof),wall=pick(r,T.wall),wood=pick(r,T.wood),stone=pick(r,T.stone),trim=pick(r,T.trim);
    const c=h=>new THREE.Color(h);const dk=(h,k)=>'#'+c(h).multiplyScalar(k).getHexString();
    /* leichte Farbton-Abweichung je Haus, damit auch gleiche Wahl nicht identisch wirkt */const jit=h=>{const x=c(h);x.offsetHSL((r()-.5)*.03,(r()-.5)*.06,(r()-.5)*.04);return'#'+x.getHexString()};
    return{roof:jit(roof),roofB:jit(roof),roof2:jit(roof),wall:jit(wall),trim,sand:jit(wall),sandD:dk(wall,.9),wood:jit(wood),woodL:jit(wood),wood2:dk(wood,.9),stone:jit(stone),
      metal:(T.metal&&pick(r,T.metal))||dk(stone,.78),metalD:dk(stone,.6),dark:'#4a3f5e',plant:pick(r,T.plant),plantD:dk(pick(r,T.plant),.78),light:'#FFD27A',glass:'#BFE6FF',snow:(T.snow&&T.snow[0])||'#F4FAFF',line:'#4a3a5e'}}

  const DV={px:[1,0],nx:[-1,0],pz:[0,1],nz:[0,-1]};const OPP={px:'nx',nx:'px',pz:'nz',nz:'pz'};const nameOf=(dx,dz)=>dx>0?'px':dx<0?'nx':dz>0?'pz':'nz';
  /* ---------- Grundriss nach Regeln: Haupthaus + Flügel (niedriger oder am Giebel) + Turm (immer höher) ---------- */
  function footprint(r,opt){opt=opt||{};const parts=[];const occ=new Map();const key=(x,z)=>x+','+z;
    const free=(x,z,w,d)=>{for(let i=0;i<w;i++)for(let j=0;j<d;j++)if(occ.has(key(x+i,z+j)))return false;return true};
    const put=p=>{parts.push(p);for(let i=0;i<p.w;i++)for(let j=0;j<p.d;j++)occ.set(key(p.x+i,p.z+j),parts.length-1);return p};
    const dims=opt.dims||[[2,1],[3,1],[2,2],[1,2],[1,3],[2,3],[3,2],[1,1]];const[w,d]=pick(r,dims);
    const flM=Math.min(opt.maxFl||2,r()<(opt.tall??.5)?2:1);
    const M=put({x:0,z:0,w,d,fl:flM,along:w>=d?'x':'z',main:true,high:!opt.noHigh&&r()<(opt.high??.4)});
    const spanM=M.along==='x'?M.d:M.w;
    /* Flügel */
    const nW=opt.noWings?0:(r()<.35?0:r()<.7?1:2);
    for(let k=0;k<nW;k++){for(let tries=0;tries<8;tries++){const gable=r()<.55;let p=null;
      if(gable){/* am Giebelende, gleiche Höhe erlaubt, First in gleicher Richtung */const fl=Math.max(1,M.fl-(r()<.5?1:0));const len=1+(r()<.4?1:0);
        if(M.along==='x'){const side=r()<.5?-1:1;const z=M.z+Math.floor(r()*M.d);const x=side<0?M.x-len:M.x+M.w;p={x,z,w:len,d:1,fl,along:'x'}}
        else{const side=r()<.5?-1:1;if(side<0&&opt.frontFree)continue;const x=M.x+Math.floor(r()*M.w);const z=side<0?M.z-len:M.z+M.d;p={x,z,w:1,d:len,fl,along:'z'}}}
      else{/* an der Traufseite: nur wenn niedriger als das Haupthaus */if(M.fl<2)continue;const len=1+(r()<.4?1:0);
        if(M.along==='x'){const side=r()<.7?1:-1;const x=M.x+Math.floor(r()*M.w);const z=side<0?M.z-len:M.z+M.d;p={x,z,w:1,d:len,fl:M.fl-1,along:'z'}}
        else{const side=r()<.5?-1:1;const z=M.z+Math.floor(r()*M.d);const x=side<0?M.x-len:M.x+M.w;p={x,z,w:len,d:1,fl:M.fl-1,along:'x'}}}
      if(p&&free(p.x,p.z,p.w,p.d)){put(p);break}}}
    /* Turm: 1×1, höher als alles daneben */
    if(!opt.noTower&&r()<(opt.tower??.25)){for(let tries=0;tries<10;tries++){const cand=[];for(const[k2]of occ){const[x,z]=k2.split(',').map(Number);for(const[dn,dx,dz]of DIRS){if(!occ.has(key(x+dx,z+dz)))cand.push([x+dx,z+dz])}}
        const[tx,tz]=pick(r,cand);let maxN=0;for(const[dn,dx,dz]of DIRS){const pi=occ.get(key(tx+dx,tz+dz));if(pi!=null)maxN=Math.max(maxN,parts[pi].fl+(parts[pi].high?1:0))}
        if(tz<Math.min(...[...occ.keys()].map(k=>+k.split(',')[1])))continue;/* nicht vor die Front */
        put({x:tx,z:tz,w:1,d:1,fl:Math.min(5,maxN+1+(opt.towerExtra||0)),along:'x',tower:true,high:r()<.6});break}}
    return{parts,occ,M}}

  /* ---------- Familien ---------- */
  const FAM={
    town:{pack:'town',edge:'town',
      wall:(st,lvl,kind)=>{const wood=st.allWood||(lvl>0&&st.lowStone);const pre=wood?'wall-wood':'wall';return kind?pre+'-'+kind:pre},
      door:()=>'door',wins:['window-shutters','window-glass','window-round','window-small','window-stone'],decos:['detail-cross','detail-diagonal','detail-horizontal'],
      roof1:p=>p.high?'roof-high-gable':'roof-gable',roof2:p=>p.high?'roof-high':'roof',roof2win:p=>(p.high?'roof-high':'roof')+'-window',point:p=>p.high?'roof-high-point':'roof-point',
      roofH:(p,span)=>p.tower?(p.high?1:.5):span===1?(p.high?1.11:.57):(p.high?1.14:.63),pairRot:{x:[-PI/2,PI/2],z:[0,PI]},roof1off:0},
    cabin:{pack:'holiday',edge:'cabin',
      wall:(st,lvl,kind)=>kind?'cabin-'+kind:'cabin-wall',door:st=>st.porch?'overhang-door-rotate':'door-rotate',wins:['window-a','window-b','window-c','window-large'],decos:[],
      roof1:(p,st)=>st.snow?'cabin-roof-snow-point':'cabin-roof-point',roof2:(p,st)=>st.snow?'cabin-roof-snow':'cabin-roof',point:(p,st)=>st.snow?'cabin-roof-snow-point':'cabin-roof-point',
      roofH:(p,span,st)=>span===2?(st.snow?1.34:1.28):1.33,pairRot:{x:[PI/2,-PI/2],z:[PI,0]},roof1off:PI/2,chimRoof:st=>st.snow?'cabin-roof-snow-chimney':'cabin-roof-chimney'}};

  FAM.station={pack:'station',edge:'station',
    wall:(st,lvl,kind)=>kind?'wall-'+kind:(st.stripe&&lvl===0?'wall-banner':'wall'),door:st=>st.stripe?'door-banner':'door',wins:['window','window-banner','window'],decos:[],
    roof:'flat'};
  /* ---------- Hausbau mit Belegungsprüfung ---------- */
  function boxOf(m,pack,name){const b=KIT.bounds(pack,name);m.updateMatrix();const bx=new THREE.Box3();const v=new V();for(let i=0;i<8;i++){v.set(i&1?b[3]:b[0],i&2?b[4]:b[1],i&4?b[5]:b[2]).applyMatrix4(m.matrix);bx.expandByPoint(v)}return bx}
  function depth(a,b){const dx=Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x),dy=Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y),dz=Math.min(a.max.z,b.max.z)-Math.max(a.min.z,b.min.z);return Math.min(dx,dy,dz)}
  /* erlaubte Eindringtiefe zwischen Kategorien */
  const TOL={'veg|yard':.3,'chain|chain':.2,'chain|attach':.02,'chain|wall':.04,'chain|path':.09,'path|attach':.1,'attach|wall':.13,'attach|roof':.13,'chim|wall':.13,'chim|roof':.13,'tower|wall':.2,'tower|roof':.2,'yard|wall':.04,'path|yard':.09,'path|path':.6,'attach|struct':.13,'yard|struct':.02,'attach|attach':.02,'chim|chim':.3,'tower|tower':.5,'attach|chim':.02};
  const tolOf=(a,b)=>TOL[a+'|'+b]??TOL[b+'|'+a]??.004;

  function make(pid,seed,planIn){const r=rng(seed*2654435761+17);const plan=planIn||{};const F=FAM[plan.fam||'town'];
    const pal=Object.assign(palette(pid,r),plan.pal||{});
    /* Stationshäuser: helle Pastell-Paneele, farbige Streifen je Haus */if(F.edge==='station'){const w=pal.wall,t=pal.trim;pal.stone=w;pal.wall=t;pal.light=pal.roof;pal.metal='#'+new THREE.Color(w).multiplyScalar(.82).getHexString();pal.metalD='#'+new THREE.Color(w).multiplyScalar(.66).getHexString()}const stonePal=Object.assign({},pal,{wall:pal.stone,sand:pal.stone,trim:pal.stone});
    const g=new THREE.Group();const occ=[];let txn=null;const issues=[];
    const mk=(pack,name,x,y,z,ry,sc,pl)=>{if(!KIT.has(pack,name))return null;const m=KIT.mesh(pack,name,pack==='nature'?KIT.ORIG:(pl||pal));m.position.set(x,y,z);m.rotation.y=ry||0;if(sc!=null)typeof sc==='number'?m.scale.setScalar(sc):m.scale.set(sc[0],sc[1],sc[2]);return m};
    /* fest einbauen (Rohbau) */
    const put=(cat,part,pack,name,x,y,z,ry,sc,pl)=>{const m=mk(pack,name,x,y,z,ry,sc,pl);if(!m){issues.push('fehlt '+name);return null}g.add(m);const o={b:boxOf(m,pack,name),cat,part,name,m};occ.push(o);if(txn)txn.push(o);return m};
    /* nur wenn frei (Anbauten, Garten) */
    const tryPut=(cat,pack,name,x,y,z,ry,sc,pl)=>{const m=mk(pack,name,x,y,z,ry,sc,pl);if(!m)return null;const b=boxOf(m,pack,name);const c=cat;
      for(const o of occ){const t=tolOf(c,o.cat);if(depth(b,o.b)>t)return null}g.add(m);const o={b,cat:c,part:-1,name,m};occ.push(o);if(txn)txn.push(o);return m};
    const begin=()=>{txn=[]};const rollback=()=>{for(const o of txn){g.remove(o.m);occ.splice(occ.indexOf(o),1)}txn=null};const commit=()=>{txn=null};
    /* Kanten-Teile: Stadt-Bausatz hat die Aussenseite auf −x, Blockhaus auf +z (Wand liegt mittig auf der Kante) */
    const edgeT=(x,z,d)=>{const[dx,dz]=DV[d];return{x:x+.9*dx,z:z+.9*dz,ry:ROT[d]+PI}};
    const edgeC=(x,z,d)=>({x,z,ry:ROT[d]+PI/2});
    const edgeS=(x,z,d)=>{const[dx,dz]=DV[d];return{x:x+.35*dx,z:z+.35*dz,ry:{pz:0,nz:PI,px:PI/2,nx:-PI/2}[d]}};
    const edge=F.edge==='cabin'?edgeC:F.edge==='station'?edgeS:edgeT;

    const fp=footprint(r,plan.fp);const{parts}=fp;const base=plan.base||0;const cellFl=new Map();const cellPart=new Map();
    parts.forEach((p,i)=>{for(let a=0;a<p.w;a++)for(let b2=0;b2<p.d;b2++){cellFl.set((p.x+a)+','+(p.z+b2),p.fl);cellPart.set((p.x+a)+','+(p.z+b2),i)}});
    const fl=(x,z)=>cellFl.get(x+','+z)||0;const cells=[...cellFl.keys()].map(k=>k.split(',').map(Number));
    const xs=cells.map(c=>c[0]),zs=cells.map(c=>c[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
    const st={stripe:r()<.5,wreath:!!plan.snow,lowStone:r()<.55,allWood:r()<.3,snow:!!plan.snow,porch:r()<.5,winA:pick(r,F.wins),winB:pick(r,F.wins),deco:F.decos.length&&r()<.7?pick(r,F.decos):(plan.snow&&F.edge==='cabin'&&r()<.6?'wall-wreath':null),winRate:.35+r()*.3};
    /* Tür vorne (−z), bevorzugt am Haupthaus */
    const front=cells.filter(([x,z])=>!fl(x,z-1)&&!parts[cellPart.get(x+','+z)].tower);const frontM=front.filter(([x,z])=>parts[cellPart.get(x+','+z)].main);
    const door=pick(r,frontM.length?frontM:front);
    /* Balkon vorplanen: Obergeschoss-Kante zur Seite/nach hinten, Nachbarzelle frei */
    let balc=null;if(!plan.noBalcony&&F.edge!=='station'&&r()<.5){const cand=[];for(const[x,z]of cells){const p=parts[cellPart.get(x+','+z)];if(p.fl<2||p.tower)continue;for(const d of['px','nx','pz']){const[dx,dz]=DV[d];if(!cellFl.has((x+dx)+','+(z+dz)))cand.push({x,z,d,ox:x+dx,oz:z+dz})}}
      if(cand.length)balc=pick(r,cand)}
    /* --- Wände --- */
    for(const[x,z]of cells){const f=fl(x,z);const pi=cellPart.get(x+','+z);
      for(let lvl=0;lvl<f;lvl++)for(const d of['px','nx','pz','nz']){const[dx,dz]=DV[d];if(fl(x+dx,z+dz)>lvl)continue;
        let kind=null;const isBalc=balc&&lvl===1&&x===balc.x&&z===balc.z&&d===balc.d;if(lvl===0&&x===door[0]&&z===door[1]&&d==='nz')kind=F.door(st);else if(isBalc)kind=F.door(Object.assign({},st,{porch:false}));
        else{const q=r();kind=q<st.winRate?(lvl?st.winB:st.winA):(q<st.winRate+.2&&st.deco)?st.deco:null}
        let nm=F.wall(st,lvl,kind);if(!KIT.has(F.pack,nm))nm=F.wall(st,lvl,null);const e=edge(x,z,d);const wm=put('wall',pi,F.pack,nm,e.x,base+lvl,e.z,e.ry);if(isBalc)balc.wall={m:wm,alt:F.wall(st,lvl,st.winB),e,y:base+lvl,pi}}}
    /* Blockhaus-Eckbalken an allen Aussenecken */
    if(F.edge==='cabin')for(const[x,z]of cells){const f=fl(x,z);for(const[sx,sz,ry]of[[-1,1,0],[1,1,PI/2],[1,-1,PI],[-1,-1,-PI/2]]){for(let lvl=0;lvl<f;lvl++){if(fl(x+sx,z)>lvl||fl(x,z+sz)>lvl)continue;put('wall',cellPart.get(x+','+z),F.pack,'cabin-corner-logs',x,base+lvl,z,ry)}}}
    /* --- Dächer --- */
    let roofChim=false;
    if(F.roof==='flat'){parts.forEach((p,pi)=>{p.ridge=base+p.fl+.3;for(let a=0;a<p.w;a++)for(let b2=0;b2<p.d;b2++){const x=p.x+a,z=p.z+b2;if(fl(x,z)!==p.fl)continue;put('roof',pi,F.pack,'floor-panel',x,base+p.fl,z,0)}})}
    else parts.forEach((p,pi)=>{const top=base+p.fl;const along=p.along;const span=along==='x'?p.d:p.w;const len=along==='x'?p.w:p.d;
      /* Pilz-Planet: riesiger Pilzhut als Dach über quadratischen Bauteilen */
      if(plan.mushroom&&p.w===p.d){const n=p.w;const sx=(n*.5+.42)/.09,sy=sx*(n>1?.62:.8);const nm=pick(r,['mushroom_red','mushroom_tan','mushroom_red'])+'#cap';
        put('roof',pi,'nature',nm,p.x+(n-1)/2,top-.045*sy,p.z+(n-1)/2,r()*6,[sx,sy,sx]);p.ridge=top+.15*sy;return}
      if(p.tower){const nm=F.point(p,st);put('roof',pi,F.pack,nm,p.x,top,p.z,F.edge==='cabin'?PI/2:0);p.ridge=top+F.roofH(p,1,st);return}
      p.ridge=top+F.roofH(p,span,st);
      for(let i=0;i<len;i++){const cx=along==='x'?p.x+i:p.x,cz=along==='x'?p.z:p.z+i;
        if(span===1){put('roof',pi,F.pack,F.roof1(p,st),cx,top,cz,(along==='x'?0:PI/2)+F.roof1off)}
        else{const[r0,r1]=F.pairRot[along];let n0=F.roof2(p,st),n1=n0;const q=r();
          if(F.roof2win&&q<.3)n0=F.roof2win(p,st);else if(F.chimRoof&&!roofChim&&p.main&&q<.55){n1=F.chimRoof(st);roofChim=true}
          if(along==='x'){put('roof',pi,F.pack,n0,cx,top,p.z,r0);put('roof',pi,F.pack,n1,cx,top,p.z+1,r1)}else{put('roof',pi,F.pack,n0,p.x,top,cz,r0);put('roof',pi,F.pack,n1,p.x+1,top,cz,r1)}
          if(F.edge==='cabin'&&!st.snow)put('roof',pi,F.pack,'cabin-roof-top',along==='x'?cx:p.x+.5,top+1.16,along==='x'?p.z+.5:cz,along==='x'?PI/2:0)}}
      /* Blockhaus: Giebeldreiecke an beiden Enden (zwei Halbdreiecke, zur Firstlinie steigend) */
      if(F.edge==='cabin'&&span===2){for(const e of[0,1]){const d=along==='x'?(e?'px':'nx'):(e?'pz':'nz');for(const s2 of[0,1]){const x=along==='x'?(e?p.x+p.w-1:p.x):p.x+s2,z=along==='x'?p.z+s2:(e?p.z+p.d-1:p.z);
            const ry=ROT[d]+PI/2;const h=[-Math.cos(ry),Math.sin(ry)];const need=along==='x'?[0,s2?-1:1]:[s2?-1:1,0];const mir=h[0]*need[0]+h[1]*need[1]<0;
            put('wall',pi,F.pack,'cabin-wall-roof',x,top,z,ry,mir?[-1,1,1]:null)}}}});
    /* --- Stelzen --- */
    if(base>0){for(const[x,z]of cells){if(F.edge==='station')put('struct',-2,'station','floor',x,0,z,0,[1,base/.3,1]);else put('struct',-2,'pirate','structure',x,0,z,0,[.4,base/2.2,.4])}}
    /* --- Prüfung Rohbau: Dächer verschiedener Teile, schwebende Teile --- */
    for(const a of occ){if(a.cat!=='roof')continue;for(const b of occ){if(b===a||b.part===a.part||b.part<0||(b.cat!=='roof'&&b.cat!=='wall'))continue;if(depth(a.b,b.b)>.13)issues.push('Dach '+a.name+' schneidet '+b.name)}}
    return{roofChim,g,occ,put,tryPut,begin,rollback,commit,edgeT,edge,F,st,pal,stonePal,fp,parts,cells,fl,cellFl,door,balc,base,minX,maxX,minZ,maxZ,r,issues}}

  /* ---------- Wüsten-Familie: Pueblo-Terrassen aus Lehmwürfeln (Kenney Modular Buildings) ----------
     Jede Zelle hat ihre eigene Höhe, Nachbarn nie gleich hoch → jede Zelle bekommt ein sauberes Dach mit Brüstung. */
  function makePueblo(pid,seed,plan){const r=rng(seed*2654435761+99);const pal0=palette(pid,r);const pal=Object.assign({},pal0,{plant:pal0.roof,plantD:pal0.roof,roofB:pal0.roof});
    const g=new THREE.Group();const occ=[];let txn=null;const issues=[];const MP='modular',FH=.625;
    const mk=(pack,name,x,y,z,ry,sc,pl)=>{if(!KIT.has(pack,name))return null;const m=KIT.mesh(pack,name,pack==='nature'?KIT.ORIG:(pl||pal));m.position.set(x,y,z);m.rotation.y=ry||0;if(sc!=null)typeof sc==='number'?m.scale.setScalar(sc):m.scale.set(sc[0],sc[1],sc[2]);return m};
    const put=(cat,part,pack,name,x,y,z,ry,sc,pl)=>{const m=mk(pack,name,x,y,z,ry,sc,pl);if(!m){issues.push('fehlt '+name);return null}g.add(m);const o={b:boxOf(m,pack,name),cat,part,name,m};occ.push(o);if(txn)txn.push(o);return m};
    const tryPut=(cat,pack,name,x,y,z,ry,sc,pl)=>{const m=mk(pack,name,x,y,z,ry,sc,pl);if(!m)return null;m.updateMatrix();const b=boxOf(m,pack,name);for(const o of occ){if(depth(b,o.b)>tolOf(cat,o.cat))return null}g.add(m);const o={b,cat,part:-1,name,m};occ.push(o);if(txn)txn.push(o);return m};
    const begin=()=>{txn=[]};const rollback=()=>{for(const o of txn){g.remove(o.m);occ.splice(occ.indexOf(o),1)}txn=null};const commit=()=>{txn=null};
    /* Raster und Höhen */const W=plan.big?3+Math.floor(r()*2):2+Math.floor(r()*2),D=plan.big?3:2+Math.floor(r()*2);const flip=r()<.5;const cellFl=new Map();
    for(let x=0;x<W;x++)for(let z=0;z<D;z++)cellFl.set(x+','+z,1+z+((x+(flip?1:0))%2));
    /* eine Ecke weglassen für L-Formen (nie die Tür-Reihe komplett) */if(r()<.5){const cx=r()<.5?0:W-1;cellFl.delete(cx+','+(D-1))}
    const fl=(x,z)=>cellFl.get(x+','+z)||0;const cells=[...cellFl.keys()].map(k=>k.split(',').map(Number));
    const minX=0,maxX=W-1,minZ=0,maxZ=D-1;const front=cells.filter(([x,z])=>z===0);const door=pick(r,front);
    const facades={door:['building-door','building-door-window','building-door-window-narrow','building-edges-door'],win:['building-window','building-windows','building-window-awnings','building-window-sill','building-windows-round','building-windows-sills-round','building-window-wide-sill','building-window-balcony']};
    const winSet=[pick(r,facades.win),pick(r,facades.win),pick(r,facades.win)];
    const FAC={nz:PI,px:PI/2,nx:-PI/2,pz:0};/* Fassade (+z) zur Aussenseite drehen */
    cells.forEach(([x,z],ci)=>{const h=fl(x,z);for(let l=0;l<h;l++){let face=null;
        if(fl(x,z-1)<=l)face='nz';else if(fl(x-1,z)<=l)face='nx';else if(fl(x+1,z)<=l)face='px';else if(fl(x,z+1)<=l)face='pz';
        let nm='building-block';if(face){if(l===0&&x===door[0]&&z===door[1]&&face==='nz')nm=pick(r,facades.door);else nm=r()<.8?winSet[(l+x)%3]:'building-block'}
        put('wall',ci,MP,nm,x,l*FH,z,face?FAC[face]:0)}
      /* Dach mit Brüstung, vorne manchmal mit Markise */const top=h*FH;const frontExposed=fl(x,z-1)<h;
      put('roof',ci,MP,frontExposed&&r()<.3?'roof-flat-awning-a':'roof-flat-top',x,top,z,frontExposed?PI:Math.floor(r()*4)*PI/2)});
    for(const a of occ){if(a.cat!=='roof')continue;for(const b of occ){if(b===a||b.part===a.part)continue;if(depth(a.b,b.b)>.13)issues.push('Dach '+a.name+' schneidet '+b.name)}}
    const H={g,occ,put,tryPut,begin,rollback,commit,edgeT:(x,z,d)=>{const[dx,dz]=DV[d];return{x:x+.9*dx,z:z+.9*dz,ry:ROT[d]+PI}},F:{edge:'pueblo',pack:MP},st:{},pal,stonePal:pal,parts:[],cells,fl,cellFl,door,base:0,minX,maxX,minZ,maxZ,r,issues,unit:1.45,roofChim:true};
    /* Leitern: von jeder niedrigeren Terrasse zur höheren dahinter */
    for(const[x,z]of cells){const h=fl(x,z),hb=fl(x,z+1);if(!hb||hb<=h||r()<.35)continue;const y=h*FH+.1;const dh=(hb-h)*FH+.25;
      const m=tryPut('attach','plat','ladder',x+(r()-.5)*.4,y,z+.36,0,[.9,dh,1]);if(m){m.rotation.x=-.2;m.updateMatrix()}}
    /* Windturm mit Kuppel auf der höchsten Zelle */
    if(r()<.55){const hi=cells.reduce((a,c)=>fl(c[0],c[1])>fl(a[0],a[1])?c:a);const y=fl(hi[0],hi[1])*FH+.106;begin();let ok=!!tryPut('tower','castle','tower-hexagon-mid',hi[0],y,hi[1],0,.9);ok=ok&&!!tryPut('tower','castle','tower-hexagon-mid',hi[0],y+.46*.9,hi[1],0,.9);
      ok=ok&&!!tryPut('tower','castle',r()<.5?'tower-hexagon-roof':'tower-hexagon-roof-secondary',hi[0],y+.92*.9,hi[1],0,.9);if(ok){commit();H.round=true}else rollback()}
    /* Dachterrasse: Sonnenschirm oder Wassertank auf niedrigen Dächern */
    for(const[x,z]of cells){if(r()<.55)continue;const h=fl(x,z);const y=h*FH+.106;if(fl(x,z+1)>h&&r()<.6){if(tryPut('attach','pirate','structure-roof',x,y,z-.05,0,[.26,.3,.26]))continue}
      if(fl(x,z+1)<=h&&r()<.5)tryPut('attach','station','container',x,y,z,0,.75)}
    return H}

  const shadeC=(c,f)=>'#'+new THREE.Color(c).multiplyScalar(f).getHexString();
  /* ---------- Pilz-Familie: richtige Pilzhäuser (Stiel = Haus, Hut = Dach) ----------
     Eigene Formen statt Bausatz: gewölbter Stiel mit Wurzelfuss, Manschette, Hut in vier Arten
     (Fliegenpilz-Kuppel, Schirmling, Glocke, Pfifferling-Welle), Lamellen, Punkte, Leuchtsporen. */
  const MUSH={stem:['#FFF4E6','#F8EEDF','#FDEFF5','#F1F3FF','#FFF7D6'],cap:['#E8505B','#F07AA0','#9B6FD6','#F79A4B','#58C0B0','#C98E62','#6E8FE0','#E86FB0'],door:['#9C6E4E','#8A6E9C','#6E8FC0','#C07A5A','#5E9E7E'],
    kinds:['dome','dome','flat','bell','wave']};
  function vcm(geo,cols,ds,ow){/* Mesh mit Vertexfarben + eigener Konturhülle (wie Bausatzteile) */
    const n=geo.attributes.position.count;const c=new Float32Array(n*3);for(let i=0;i<n;i++){const k=cols(i);c[i*3]=k.r;c[i*3+1]=k.g;c[i*3+2]=k.b}geo.setAttribute('color',new THREE.BufferAttribute(c,3));
    if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n*2),2));const m=new THREE.Mesh(geo,vcMat(!!ds,false));m.castShadow=true;m.receiveShadow=true;m.userData.noOutline=true;
    const h=geo.clone();const hc=new Float32Array(n*3);const L=new THREE.Color('#4a3a5e');for(let i=0;i<n;i++){hc[i*3]=L.r;hc[i*3+1]=L.g;hc[i*3+2]=L.b}h.setAttribute('color',new THREE.BufferAttribute(hc,3));h.setAttribute('ow',new THREE.BufferAttribute(new Float32Array(n).fill(OUTLINE_BASE*(ow||.7)),1));
    const hull=new THREE.Mesh(h,vcHull());hull.userData.hull=true;hull.raycast=()=>{};m.add(hull);return m}
  const lerpC=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t);
  function capProfile(kind,Rc,hc){switch(kind){
      case'flat':return[[0,hc],[.14*Rc,.97*hc],[.3*Rc,.8*hc],[.6*Rc,.6*hc],[.85*Rc,.32*hc],[.98*Rc,.1*hc],[Rc,0],[.93*Rc,-.04*hc]];
      case'bell':return[[0,hc],[.18*Rc,.93*hc],[.42*Rc,.72*hc],[.66*Rc,.44*hc],[.86*Rc,.17*hc],[.99*Rc,.02*hc],[Rc,-.02*hc],[.93*Rc,-.05*hc]];
      default:return[[0,hc],[.32*Rc,.96*hc],[.6*Rc,.83*hc],[.82*Rc,.6*hc],[.96*Rc,.3*hc],[1.01*Rc,.08*hc],[.97*Rc,-.03*hc],[.9*Rc,-.06*hc]]}}
  function profAt(pr,t){/* Punkt + Normale entlang des Profils (t 0..1) */const n=pr.length-1;const f=Math.min(n-1e-6,t*n);const i=Math.floor(f),u=f-i;const a=pr[i],b=pr[i+1];const x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u;const dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;return{x,y,nx:dy/l,ny:-dx/l}}
  /* ein Pilz: Stiel + Manschette + Hut + Lamellen + Punkte; liefert Masse für Fenster/Tür */
  function mushroom(r,o){const g=new THREE.Group();const R=o.R,H=o.H,seg=Q(40);const stemC=o.stem,capC=o.cap;
    const sp=[[0,0],[R*1.14,0],[R*1.1,.08],[R*1.03,H*.18],[R*1.06,H*.45],[R*.98,H*.75],[R*.86,H*.97],[R*.82,H*1.02],[0,H*1.02]];
    const stem=new THREE.LatheGeometry(sp.map(p=>new THREE.Vector2(p[0],p[1])),seg);const wob=r()*6;
    {const pos=stem.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i);const a=Math.atan2(z,x);const k=1+.025*Math.sin(a*3+wob+y*1.3);pos.setX(i,x*k);pos.setZ(i,z*k)}stem.computeVertexNormals()}
    const base=lerpC(stemC,'#B89A7E',.35);g.add(vcm(stem,i=>{const y=stem.attributes.position.getY(i)/H;return lerpC(base,stemC,Math.min(1,y*4))},false,.8));
    const rAt=y=>{for(let i=0;i<sp.length-2;i++){const a=sp[i+1],b=sp[i+2];if(y>=a[1]&&y<=b[1]){const u=(y-a[1])/((b[1]-a[1])||1);return a[0]+(b[0]-a[0])*u}}return R};
    /* Manschette (Ring) */if(o.ring){const y=H*.84,rr=rAt(y);const ring=new THREE.LatheGeometry([[rr*.98,y+.05],[rr*1.18,y-.02],[rr*1.36,y-.14],[rr*1.3,y-.17],[rr*1.02,y-.04]].map(p=>new THREE.Vector2(p[0],p[1])),seg);g.add(vcm(ring,()=>lerpC(stemC,'#ffffff',.5),true,.5))}
    /* Hut */const Rc=o.Rc,hc=o.hc;const pr=capProfile(o.kind,Rc,hc);const capY=H*.97;
    const cap=new THREE.LatheGeometry(pr.map(p=>new THREE.Vector2(p[0],p[1])),Q(48));
    {const pos=cap.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i);const rr=Math.hypot(x,z)/Rc;const a=Math.atan2(z,x);
      if(o.kind==='wave'){const k=1+.07*Math.sin(a*7)*rr*rr;pos.setX(i,x*k);pos.setZ(i,z*k);pos.setY(i,y+.06*hc*Math.sin(a*7)*rr*rr)}}cap.computeVertexNormals()}
    const capTop=lerpC(capC,'#ffffff',.08),capRim=lerpC(capC,'#ffffff',.28),capMid=o.kind==='flat'?lerpC(capC,'#5a3a2a',.25):capC;
    const cm=vcm(cap,i=>{const pos=cap.attributes.position;const rr=Math.hypot(pos.getX(i),pos.getZ(i))/Rc;return rr<.25?lerpC(capMid,capC,rr*4):lerpC(capC,capRim,Math.max(0,(rr-.6)/.4))},true,.9);cm.position.y=capY;g.add(cm);
    /* Lamellen unten: helle Streifen vom Rand zum Stiel */const gill=new THREE.LatheGeometry([[rAt(H)*.95,.05],[Rc*.6,-.01],[Rc*.9,-.05*hc]].map(p=>new THREE.Vector2(p[0],p[1])),Q(64));
    const gA=lerpC(stemC,capC,.18),gB=lerpC(stemC,capC,.38);const gm=vcm(gill,i=>{const pos=gill.attributes.position;const a=Math.atan2(pos.getZ(i),pos.getX(i));return Math.floor((a+PI)/TAU*32)%2?gA:gB},true,.4);gm.position.y=capY;g.add(gm);
    /* Punkte */if(o.spots){const n=o.kind==='flat'?9:7+Math.floor(r()*7);for(let i=0;i<n;i++){const t=.06+r()*.42,a=r()*TAU;const q=profAt(pr,t);const sz=Rc*(.07+r()*.07);
        const d=new THREE.Mesh(G.s(1),cozy({color:o.spotC||'#FFFFFF',rim:.3}));d.scale.set(sz,sz*.32,sz*(.8+r()*.4));d.position.set(Math.cos(a)*q.x,capY+q.y+.01,Math.sin(a)*q.x);
        d.quaternion.setFromUnitVectors(new V(0,1,0),new V(Math.cos(a)*q.nx,q.ny,Math.sin(a)*q.nx).normalize());d.userData.noOutline=true;g.add(d)}}
    /* Leuchtsporen unter dem Hut */if(o.glow){for(let i=0;i<6;i++){const a=i/6*TAU+r();const rr=Rc*(.55+r()*.3);const s=new THREE.Mesh(G.s(.05),cozy({color:'#BFFFF0',emissive:new THREE.Color('#7FFFD4'),emissiveIntensity:1.6}));s.userData.noOutline=true;s.userData.noBake=true;s.material.userData.noBake=true;s.position.set(Math.cos(a)*rr,capY-.06*hc-.02,Math.sin(a)*rr);g.add(s)}}
    return{g,rAt,capY,top:capY+hc,Rc,hc,pr}}
  function archDoor(col,frame){const g=new THREE.Group();const w=.56,h=.84;const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(w/2,h-w/2);sh.absarc(0,h-w/2,w/2,0,PI,false);sh.lineTo(-w/2,0);
    const dg=new THREE.ExtrudeGeometry(sh,{depth:.06,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2,curveSegments:Q(16)});P(g,dg,cozy({color:col}),[0,0,0]);
    const fr=new THREE.Shape();const W=w+.16;fr.moveTo(-W/2,0);fr.lineTo(W/2,0);fr.lineTo(W/2,h-w/2);fr.absarc(0,h-w/2,W/2,0,PI,false);fr.lineTo(-W/2,0);fr.holes.push(sh);
    P(g,new THREE.ExtrudeGeometry(fr,{depth:.1,bevelEnabled:true,bevelThickness:.02,bevelSize:.015,bevelSegments:1,curveSegments:Q(16)}),cozy({color:frame}),[0,0,-.02]);
    for(const x of[-.14,0,.14])P(g,G.bx(.02,h*.78,.02,0),cozy({color:shadeC(col,.8)}),[x,h*.4,.085]);P(g,G.s(.035),cozy({color:'#FFD27A',gloss:.8}),[.17,.4,.1]);
    P(g,G.cy(.34,.38,.06),cozy({color:'#C9C2B8'}),[0,.03,.22]);return g}
  function roundWindow(col,r0,box){const g=new THREE.Group();P(g,G.to(r0,.045),cozy({color:col}),[0,0,.02]);P(g,G.cy(r0*.95,r0*.95,.03),cozy({color:'#BFE6FF',gloss:.8}),[0,0,0],[PI/2,0,0]);
    P(g,G.bx(r0*1.8,.025,.02,0),cozy({color:col}),[0,0,.03]);P(g,G.bx(.025,r0*1.8,.02,0),cozy({color:col}),[0,0,.03]);
    if(box){P(g,G.bx(r0*2.1,.11,.16,.02),cozy({color:shadeC(col,.85)}),[0,-r0-.08,.07]);const fl=['#FF8FB8','#FFE27A','#B98CFF','#FF6F6F'];for(let i=0;i<4;i++)P(g,G.s(.045),cozy({color:fl[i%4]}),[(i-1.5)*r0*.45,-r0-.01,.1])}return g}
  function makeMush(pid,seed,plan){const r=rng(seed*2654435761+313);const occ=[];let txn=null;const issues=[];const g=new THREE.Group();
    const stemC=pick(r,MUSH.stem),capC=pick(r,MUSH.cap),doorC=pick(r,MUSH.door),kind=pick(r,MUSH.kinds);
    const R=(plan.big?1.25:.78)+r()*.4,H=(plan.big?2.4:1.6)+r()*.8,Rc=R*(kind==='flat'?2.05:kind==='bell'?1.55:1.8)*(0.95+r()*.15),hc=kind==='flat'?Rc*.34:kind==='bell'?Rc*1.05:Rc*.62;
    const M=mushroom(r,{R,H,Rc,hc,kind,stem:stemC,cap:capC,ring:r()<.7,spots:kind!=='bell'&&kind!=='wave'||r()<.3,spotC:capC==='#C98E62'?'#FFF1DA':'#FFFFFF',glow:r()<.7});
    const body=new THREE.Group();body.add(M.g);
    /* Tür vorne (−z) */const dr=M.rAt(.4);const door=archDoor(doorC,shadeC(capC,.85));door.position.set(0,0,-dr+.03);door.rotation.y=PI;body.add(door);
    /* Laterne an Halter neben der Tür */{const lx=.52,ly=1.0;const a=Math.asin(Math.min(.95,lx/M.rAt(ly)));const zz=-Math.cos(a)*M.rAt(ly);P(body,G.bx(.04,.04,.22,0),cozy({color:'#3B3450'}),[lx,ly,zz-.1]);
      P(body,G.bx(.14,.18,.14,.03),cozy({color:'#3B3450'}),[lx,ly-.14,zz-.2]);const gl=P(body,G.s(.055),cozy({color:'#FFE9A8',emissive:new THREE.Color('#FFD27A'),emissiveIntensity:1.5}),[lx,ly-.14,zz-.2]);gl.material.userData.noBake=true}
    /* runde Fenster rundum, eins über der Tür */const nw=2+Math.floor(r()*3);const used=[];
    for(let i=0;i<nw;i++){const a=(i===0?0:(r()<.5?1:-1)*(.9+r()*1.6));const y=i===0?Math.min(H-.45,1.3):.55+r()*(H-1.0);if(i===0&&H<1.9)continue;if(used.some(u=>Math.abs(u[0]-a)<.6&&Math.abs(u[1]-y)<.5))continue;used.push([a,y]);
      const rr=M.rAt(y);const w=roundWindow(shadeC(capC,.8),.16+r()*.06,r()<.5&&y<1.4);w.position.set(Math.sin(a)*(rr-.01),y,-Math.cos(a)*(rr-.01));w.rotation.y=Math.atan2(Math.sin(a),-Math.cos(a));body.add(w)}
    /* zweites Stockwerk: kleiner Pilz wächst aus dem Hut */let topY=M.top;
    if(plan.stack!==false&&r()<.4&&kind!=='bell'){const R2=R*.42,H2=.9+r()*.4,k2=pick(r,['dome','bell','dome']);const cap2=pick(r,MUSH.cap);
      const M2=mushroom(r,{R:R2,H:H2,Rc:R2*1.9,hc:k2==='bell'?R2*2:R2*1.15,kind:k2,stem:stemC,cap:cap2,ring:false,spots:k2==='dome',glow:false});M2.g.position.y=M.capY+hc*.7;body.add(M2.g);
      const w=roundWindow(shadeC(cap2,.8),.12,false);const y2=M.capY+hc*.7+H2*.55;w.position.set(0,y2,-M2.rAt(H2*.55)+.01);w.rotation.y=PI;body.add(w);topY=M.capY+hc*.7+M2.top}
    /* Pilz-Schornstein */else if(r()<.55){const q=profAt(M.pr,.45),a=PI*.75+r()*.5;const cx=Math.cos(a)*q.x,cz=Math.sin(a)*q.x;const cy=M.capY+q.y;
      P(body,G.cy(.09,.11,.6),cozy({color:stemC}),[cx,cy+.2,cz]);P(body,G.hs(.2),cozy({color:shadeC(capC,1.1)}),[cx,cy+.48,cz],null,[1,.7,1])}
    addOutlines(body);g.add(body);
    /* kleine Pilze am Fuss */const baby=[];for(let i=0;i<3+Math.floor(r()*4);i++){const a=r()*TAU;if(Math.sin(a)<-.45)continue;/* nicht vor der Tür (−z) */const rr=M.rAt(.05)+.12;const s=(.08+r()*.1);
      const bm=mushroom(r,{R:s,H:s*2.2,Rc:s*2,hc:s*1.2,kind:'dome',stem:stemC,cap:r()<.5?capC:pick(r,MUSH.cap),ring:false,spots:r()<.5,glow:false});bm.g.position.set(Math.cos(a)*rr,0,Math.sin(a)*rr);g.add(bm.g)}
    /* Belegung */const bx=new THREE.Box3().setFromObject(M.g);const stemBox=new THREE.Box3(new V(-R*1.15,0,-R*1.15),new V(R*1.15,M.capY,R*1.15));const capBox=new THREE.Box3(new V(-Rc,M.capY-.1,-Rc),new V(Rc,topY,Rc));
    occ.push({b:stemBox,cat:'wall',part:0,name:'stiel'},{b:capBox,cat:'roof',part:0,name:'hut'});
    const doorBox=new THREE.Box3(new V(-.45,0,-dr-.5),new V(.45,1,-dr+.1));occ.push({b:doorBox,cat:'attach',part:-1,name:'tuer'});
    /* Anbau: kleiner Vorratspilz seitlich, Hut bleibt unter dem grossen Hut */
    if(r()<.45){const side=r()<.5?-1:1;const R3=.42+r()*.12,Rc3=R3*1.7,H3=Math.min(.9,M.capY-.35-R3*1.1);if(H3>.55){const d=R*1.15+Rc3+.05;const cap3=pick(r,MUSH.cap);
        const M3=mushroom(r,{R:R3,H:H3,Rc:Rc3,hc:Rc3*.6,kind:'dome',stem:stemC,cap:cap3,ring:false,spots:r()<.6,glow:false});M3.g.position.set(side*d,0,.2);const dd=archDoor(doorC,shadeC(cap3,.85));dd.scale.setScalar(.62);dd.position.set(side*d,0,.2-M3.rAt(.3)+.02);dd.rotation.y=PI;
        const annex=new THREE.Group();annex.add(M3.g,dd);addOutlines(annex);g.add(annex);occ.push({b:new THREE.Box3(new V(side*d-Rc3,0,.2-Rc3),new V(side*d+Rc3,M3.top,.2+Rc3)),cat:'wall',part:1,name:'anbau'})}}
    const put=()=>null;const tryPut=(cat,pack,name,x,y,z,ry,sc,pl)=>{if(!KIT.has(pack,name))return null;const m=KIT.mesh(pack,name,pack==='nature'?KIT.ORIG:(pl||palette(pid,r)));m.position.set(x,y,z);m.rotation.y=ry||0;if(sc!=null)typeof sc==='number'?m.scale.setScalar(sc):m.scale.set(sc[0],sc[1],sc[2]);
      const b=boxOf(m,pack,name);for(const o of occ){if(depth(b,o.b)>tolOf(cat,o.cat))return null}g.add(m);const o={b,cat,part:-1,name,m};occ.push(o);if(txn)txn.push(o);return m};
    const begin=()=>{txn=[]};const rollback=()=>{for(const o of txn){g.remove(o.m);occ.splice(occ.indexOf(o),1)}txn=null};const commit=()=>{txn=null};
    /* Raster-Zellen für den Garten */const cells=[];const cr=Math.ceil(Math.max(R*1.15,Rc*.7));for(let x=-cr;x<=cr;x++)for(let z=-cr;z<=cr;z++)if(Math.hypot(x,z)<=Math.max(R*1.15,Rc*.75))cells.push([x,z]);
    const cellFl=new Map(cells.map(c=>[c[0]+','+c[1],1]));const xs=cells.map(c=>c[0]),zs=cells.map(c=>c[1]);
    return{g,occ,put,tryPut,begin,rollback,commit,edgeT:(x,z,d)=>{const[dx,dz]=DV[d];return{x:x+.9*dx,z:z+.9*dz,ry:ROT[d]+PI}},F:{edge:'mush'},st:{},pal:palette(pid,r),parts:[],cells,fl:(x,z)=>cellFl.get(x+','+z)||0,cellFl,
      door:[0,-dr+.5],base:0,minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs),r,issues,roofChim:true,style:kind}}

  /* ---------- Anbauten mit Sinn: Balkon mit Tür + Stützen (+ Treppe), Aussenkamin, Vordach, Turm ---------- */
  function attachments(H,plan){const{put,tryPut,begin,rollback,commit,edgeT,r,pal,stonePal,base,door,balc,fl,cellFl}=H;const T='town';
    /* Rundturm-Anbau (Piraten-Bausatz) am Giebel */
    if(plan.round){const M=H.parts[0];const s=.42,R=1.58*s;const ends=M.along==='x'?['nx','px']:['pz'];
      for(const d of ends.sort(()=>r()-.5)){const[dx,dz]=DV[d];const cxm=M.x+(M.w-1)/2,czm=M.z+(M.d-1)/2;const ex=d==='px'?M.x+M.w-.5:d==='nx'?M.x-.5:cxm,ez=d==='pz'?M.z+M.d-.5:czm;
        const cx=(dx?ex+dx*(R-.12):cxm),cz=(dz?ez+dz*(R-.12):czm);begin();let y=0;const doorRy=d==='pz'?0:PI;let ok=!!tryPut('tower','pirate','tower-base-door',cx,0,cz,doorRy,s);y+=2*s;
        while(ok&&y<M.ridge+.2){ok=!!tryPut('tower','pirate',r()<.6?'tower-middle-windows':'tower-middle',cx,y,cz,Math.floor(r()*4)*PI/2,s);y+=2*s}
        if(ok){if(r()<.5)ok=!!tryPut('tower','pirate','tower-roof',cx,y,cz,0,s);else{ok=!!tryPut('tower','pirate','tower-top',cx,y,cz,0,s);ok=ok&&!!tryPut('tower',T,'roof-high-point',cx,y+.5,cz,0,[1.25,1.1,1.25])}}
        if(ok){commit();H.round=true;break}else rollback()}}
    /* Station: Technik auf dem Flachdach – Schüssel, Antenne, Kuppel, Abluftrohr */
    if(H.F.edge==='station'){const tops=H.cells.filter(([x,z])=>!H.cells.some(([x2,z2])=>x2===x&&z2===z&&false));const used=new Set();
      const onRoof=(nm,pk,sc,ry)=>{for(let t=0;t<8;t++){const[x,z]=pick(r,H.cells);const k=x+','+z;if(used.has(k))continue;const y=base+fl(x,z)+.3;const P=H.parts.find(p=>x>=p.x&&x<p.x+p.w&&z>=p.z&&z<p.z+p.d&&p.fl===fl(x,z));if(!P)continue;
          if(tryPut('attach',pk,nm,x,y,z,ry==null?Math.floor(r()*4)*PI/2:ry,sc)){used.add(k);return true}}return false};
      onRoof(pick(r,['satelliteDish','satelliteDish_detailed']),'space',1.1);if(r()<.7)onRoof('machine_wireless','space',1.2);if(r()<.5)onRoof('hangar_roundGlass','space',.28,0);if(r()<.6)onRoof(pick(r,['chimney','chimney_detailed']),'space',.8);if(r()<.5)onRoof('container','station',.8)}
    /* Öffentliche Gebäude: Fassade je Art (Säulenreihe, Markisen, Laternenkette, breites Tor …) */
    if(plan.civic&&H.F.edge!=='station'){const fr=H.cells.filter(([x,z])=>!fl(x,z-1)).sort((a,b)=>a[0]-b[0]);const K=plan.civic;
      for(const[x,z]of fr){const isDoor=x===door[0]&&z===door[1];const E=edgeT(x,z,'nz');
        if(K==='museum'){for(const ox of[-.45,.45])tryPut('attach',T,'pillar-stone',x+ox,0,z-1.05,0,[1,1.9+base,1])}
        else if(K==='shop'&&!isDoor){tryPut('attach',T,'overhang',E.x,base,E.z,E.ry)}
        else if(K==='bar'){tryPut('attach',T,'lantern',x+.45,base,z-.85,0,[.8,.8,.8])}
        else if((K==='studio'||K==='pflanzen')&&!isDoor&&Math.abs(x-door[0])===1){/* kleine, unregelmässige Gruppe neben der Tür statt einer Reihe */const side=Math.sign(x-door[0]);const n=K==='pflanzen'?3:2;
          for(let k=0;k<n;k++){const px=x+side*(-.25+k*.28)+(r()-.5)*.12,pz=z-.62-(k%2)*.32-(r()*.1);const big=k===0;if(K==='pflanzen'){if(tryPut('attach','nature',big?'pot_large':'pot_small',px,base,pz,r()*6,big?1.25:1.4))tryPut('attach','nature',pick(r,['plant_bushSmall','flower_redA','flower_yellowA','plant_flatShort']),px,base+(big?.2:.15),pz,r()*6,big?1.5:1.2)}else tryPut('attach','nature',pick(r,['flower_purpleA','flower_redB','flower_yellowB']),px,base,pz,r()*6,1.3)}}
        else if(K==='rathaus'&&!isDoor&&fl(x,z)>1){tryPut('attach',T,r()<.5?'banner-red':'banner-green',E.x,base+1,E.z,E.ry)}}
      if(K==='museum'||K==='rathaus'){const xs2=fr.map(c=>c[0]);const zz=Math.min(...fr.map(c=>c[1]));for(let x=Math.min(...xs2);x<=Math.max(...xs2);x++)tryPut('path',T,'stairs-stone-round',x,0,zz-1.62,PI/2,[1,.25,1])}}
    /* Balkon */
    if(balc){begin();const{ox,oz,d}=balc;const[dx,dz]=DV[d];const tx=-dz,tz=dx;let ok=true;const y=base+1;
      ok=ok&&tryPut('attach',T,'planks',ox,y,oz,0);
      for(const s2 of[-1,1])ok=ok&&tryPut('attach',T,'pillar-wood',ox+dx*.4+tx*.4*s2,0,oz+dz*.4+tz*.4*s2,0,[1,y,1]);
      let stairSide=0;if(ok&&r()<.55){for(const s2 of[1,-1]){const sx=ox+tx*s2,sz=oz+tz*s2;if(cellFl.has(sx+','+sz))continue;const up=nameOf(-tx*s2,-tz*s2);
          if(tryPut('attach',T,'stairs-wood',sx,0,sz,ROT[up],[1,y,1])){stairSide=s2;break}}}
      for(const e of['px','nx','pz','nz']){if(e===OPP[d])continue;const[ex,ez]=DV[e];if(stairSide&&ex===tx*stairSide&&ez===tz*stairSide)continue;const E=edgeT(ox,oz,e);ok=ok&&!!tryPut('chain',T,'fence',E.x,y+.06,E.z,E.ry)}
      if(ok)commit();else{rollback();H.balcFailed=true;/* Tür ins Nichts vermeiden: wieder ein Fenster */const W=balc.wall;if(W&&W.m){const o=H.occ.find(o=>o.m===W.m);H.g.remove(W.m);H.occ.splice(H.occ.indexOf(o),1);put('wall',W.pi,H.F.pack,KIT.has(H.F.pack,W.alt)?W.alt:H.F.wall(H.st,1,null),W.e.x,W.y,W.e.z,W.e.ry)}}}
    /* Aussenkamin am Giebel des Haupthauses, bis über den First */
    if(H.F.edge!=='station'&&!plan.noChimney&&!H.roofChim&&r()<.75){const off=H.F.edge==='cabin'?1.05:.9;const edgeK=(x,z,d)=>{const[dx,dz]=DV[d];return{x:x+off*dx,z:z+off*dz,ry:ROT[d]+PI}};const M=H.parts[0];const ends=M.along==='x'?[['nx',M.x,null],['px',M.x+M.w-1,null]]:[['pz',null,M.z+M.d-1]];
      for(const[d,ex,ez]of[...ends].sort(()=>r()-.5)){const x=ex!=null?ex:M.x+Math.floor(r()*M.w),z=ez!=null?ez:M.z+Math.floor(r()*M.d);if(fl(x+DV[d][0],z+DV[d][1]))continue;
        begin();const E=edgeK(x,z,d);let ok=!!tryPut('chim',T,'chimney-base',E.x,0,E.z,E.ry,null,stonePal);let y=1;while(ok&&y+.625<M.ridge+.35){ok=!!tryPut('chim',T,'chimney',E.x,y,E.z,E.ry,null,stonePal);y+=1}
        ok=ok&&!!tryPut('chim',T,'chimney-top',E.x,y,E.z,E.ry,null,stonePal);if(ok){commit();H.chim=true;break}else rollback()}}
    /* Vordach über der Tür (Stadt) */
    if(H.F.edge==='town'&&r()<.6){const E=edgeT(door[0],door[1],'nz');tryPut('attach',T,'overhang',E.x,base,E.z,E.ry)}
    /* Banner an einer Frontwand */
    if(H.F.edge==='town'&&r()<.4){const fr=H.cells.filter(([x,z])=>!fl(x,z-1)&&!(x===door[0]&&z===door[1]));if(fr.length){const[x,z]=pick(r,fr);const lv=fl(x,z)>1&&r()<.6?1:0;const E=edgeT(x,z,'nz');tryPut('attach',T,r()<.5?'banner-red':'banner-green',E.x,base+lv,E.z,E.ry)}}
  }

  /* ---------- Vorgarten: Weg, Laterne, Blumenbeete, Zaun mit Tor, Deko ---------- */
  /* Garten-Deko mit festem Platz: d=neben der Tür (parallel zur Wand), c=Zaun-Ecke, s=neben dem Haus, b=hinter dem Haus
     [Bausatz, Teil, Massstab, erlaubte Plätze, Drehung für "längs zur Wand"] */
  const PROPS={
    kompost:[['town','tree',1,'bs'],['town','tree-high-round',1,'bs'],['nature','plant_bushLarge',1.6,'c',0],['town','cart',1,'s',0],['town','stall-bench',1,'d',PI/2],['pirate','barrel',.33,'d',0],['nature','log_stack',1.3,'s',0],['nature','pot_large',1.4,'d',0]],
    frost:[['holiday','snowman',.6,'c',PI],['holiday','tree-snow-a',1,'cbs'],['holiday','sled',1,'ds',PI/2],['holiday','bench',.7,'d',PI],['holiday','tree-snow-b',1,'cb'],['nature','log_stackLarge',1.3,'s',0]],
    korallen:[['nature','tree_palmTall',1.7,'bs'],['nature','tree_palmBend',1.6,'bs'],['nature','plant_bushDetailed',1.6,'c',0],['pirate','barrel',.33,'ds',0],['pirate','crate',.42,'ds',0],['nature','pot_large',1.4,'d',0]],
    wueste:[['nature','cactus_tall',1.4,'cbs'],['nature','cactus_short',1.4,'cs'],['nature','pot_large',1.5,'d',0],['pirate','barrel',.33,'ds',0],['nature','tree_palmDetailedShort',1.6,'cb'],['nature','campfire_stones',1.3,'s',0]],
    pilz:[['nature','mushroom_redTall',3.2,'cbs'],['nature','mushroom_tanGroup',2.5,'cs'],['town','tree-crooked',1,'bs'],['nature','stump_roundDetailed',1.5,'s',0],['pirate','barrel',.33,'d',0],['nature','log_stack',1.3,'s',0]],
    schrott:[['station','container',1,'ds',0],['station','container-tall',1,'sb',0],['space','rover',1.6,'s',0],['space','machine_generator',1.2,'s',PI/2],['space','barrels',1,'ds',0],['space','rock_crystals',1.2,'cb'],['space','machine_barrel',1.1,'s',0]]};
  /* Gartenbeete & Wege je Planet */
  const GARDEN={kompost:{path:'path_stone',flowers:['flower_redA','flower_yellowA','flower_purpleA','flower_redB','flower_yellowB'],veg:['crop_pumpkin','crop_carrot','crop_turnip','crop_melon']},
    frost:{path:'path_stone',flowers:null,veg:null},korallen:{path:'planks',flowers:['flower_redA','flower_yellowB'],veg:null},wueste:{path:'path_stone',flowers:null,veg:['crop_melon'],pots:1},
    pilz:{path:'path_stone',flowers:['flower_purpleA','flower_purpleB','mushroom_redTall','mushroom_tanTall'],veg:['crop_pumpkin']},schrott:{path:'planks',flowers:null,veg:null}};
  /* Vorplatz-Deko der öffentlichen Gebäude (d=neben der Tür, f=Vorplatz, s=Seite, c=Ecke, b=hinten) */
  const CIVIC={
    museum:[['town','fountain-round',.9,'f',0],['castle','flag-banner-long',1.3,'c',0],['nature','statue_obelisk',1,'s',0]],
    shop:[['town','stall-red',1,'fs',0],['town','stall-green',1,'fs',0],['pirate','crate',.42,'d',0],['pirate','barrel',.33,'d',0],['town','cart',1,'fs',0]],
    bar:[['town','stall-bench',1,'df',PI/2],['town','stall-bench',1,'f',PI/2],['pirate','barrel',.33,'d',0],['town','lantern',1,'fc',0],['survival','campfire-pit',2,'f',0]],
    studio:[['nature','pot_large',1.4,'d',0],['town','stall-bench',1,'f',PI/2],['nature','flower_redA',1.3,'d',0],['nature','plant_bushDetailed',1.4,'cs',0]],
    rathaus:[['town','fountain-round',1,'f',0],['castle','flag-banner-long',1.3,'c',0],['castle','flag',1.6,'c',0],['castle','flag',1.6,'c',0],['town','pillar-stone',1,'d',0],['town','stall-bench',1,'f',PI/2]],
    garage:[['space','rover',1.6,'fs',0],['space','machine_generator',1.2,'s',PI/2],['space','barrels',1,'dc',0],['survival','workbench',1.8,'d',0]],
    pflanzen:[['nature','crops_cornStageC',1.3,'fs',0],['nature','pot_large',1.4,'d',0],['nature','flower_yellowA',1.4,'df',0],['nature','plant_bushLarge',1.5,'cs',0],['nature','crop_pumpkin',1.3,'f',0]],
    praxis:[['town','stall-bench',1,'df',PI/2],['nature','pot_large',1.3,'d',0],['nature','plant_bushDetailed',1.4,'c',0],['town','lantern',1,'c',0]],
    tiere:[['town','fence-curved',1,'f',0],['nature','log_stack',1.3,'s',0],['town','cart',1,'s',0],['pirate','barrel',.33,'d',0],['nature','stump_round',1.4,'f',0]]};
  function yard(H,pid,plan){const{tryPut,begin,rollback,commit,edgeT,r,door,base,minX,maxX,minZ,maxZ,cellFl}=H;const T='town';
    const zf=minZ-2;/* Zaunreihe */
    /* Weg von der Tür (oder Treppe) zum Tor */
    if(base>0){const ok=H.F.edge==='station'?tryPut('attach','station','stairs-small-center',door[0],0,door[1]-.7,PI,[1,base/.3,1]):tryPut('attach',T,'stairs-wood',door[0],0,door[1]-1,ROT.pz,[1,base,1]);if(!ok)H.issues.push('keine Treppe')}
    const GD=GARDEN[pid]||GARDEN.kompost;
    for(let z=door[1]-(base>0&&H.F.edge!=='station'?2:1);z>=zf;z--){if(GD.path==='path_stone')tryPut('path','nature','path_stone',door[0],0,z,PI/2,[1,1,.9]);else tryPut('path',T,'planks-half',door[0]-.25,0,z,0)}
    /* Laterne neben dem Weg */
    /* Platz für das Namensschild neben dem Weg reservieren */
    const sw=plan.civic?1.1:.3,so=plan.civic?1.7:.78;for(const sx of[so,-so]){const bx=new THREE.Box3(new V(door[0]+sx-sw,0,door[1]-2.05),new V(door[0]+sx+sw,1.6,door[1]-1.85));if(!H.occ.some(o=>depth(bx,o.b)>.004)){H.occ.push({b:bx,cat:'yard',part:-1,name:'schild'});H.sign=[door[0]+sx,door[1]-1.95];break}}
    if(!plan.noLantern)for(const s2 of[1,-1]){if(tryPut('yard',T,'lantern',door[0]+.62*s2,0,door[1]-1.05))break}
    /* Blumenbeete vor den Fenstern */
    const bed=!base?pick(r,GD.flowers?['flowers','flowers','hedge',null]:['hedge',null,GD.pots?'pots':null]):null;
    if(bed){for(let x=minX;x<=maxX;x++){const z=H.cells.filter(c=>c[0]===x).reduce((m,c)=>Math.min(m,c[1]),99);if(z===99||x===door[0])continue;
      if(bed==='hedge'){const E=edgeT(x,z-1,'pz');tryPut('yard',T,'hedge',E.x,0,E.z,E.ry)}
      else if(bed==='flowers'){for(const fx of[-.3,0,.3])tryPut('yard','nature',pick(r,GD.flowers),x+fx+(r()-.5)*.06,0,z-.72,r()*6,1.1)}
      else if(bed==='pots'){tryPut('yard','nature','pot_large',x+.25,0,z-.78,0,1.1)}}}
    /* Zaun oder Hecke mit Tor */
    const kind=plan.fence!==undefined?plan.fence:pick(r,['fence','hedge','fence','hedge-large',null]);
    if(kind&&!base){H.fenced=true;for(let x=minX-1;x<=maxX+1;x++){const E=edgeT(x,zf,'nz');if(x===door[0]){if(kind==='fence')tryPut('chain',T,'fence-gate',E.x,0,E.z,E.ry);continue}tryPut('chain',T,kind,E.x,0,E.z,E.ry)}
      for(const[sx,d]of[[minX-1,'nx'],[maxX+1,'px']])for(let z=zf;z<minZ;z++){const E=edgeT(sx,z,d);tryPut('chain',T,kind,E.x,0,E.z,E.ry)}}
    /* Gemüsebeet neben dem Haus */
    if(GD.veg&&!base&&r()<.45){for(const sx of[maxX+1.55,minX-1.55].sort(()=>r()-.5)){begin();const z0=minZ+(maxZ>minZ?.5:0);let ok=!!tryPut('yard','nature','crops_dirtRow',sx,0,z0,PI/2,[1.2,1,1]);
        if(ok)for(const dz of[-.35,0,.35])tryPut('veg','nature',pick(r,GD.veg),sx,.02,z0+dz,r()*6,1);if(ok){commit();break}else rollback()}}
    /* Deko auf festen Plätzen */
    const P=plan.civic?(CIVIC[plan.civic]||[]).concat((PROPS[pid]||PROPS.kompost).slice(0,2)):(PROPS[pid]||PROPS.kompost);const zf2=zf;const slots=[];
    for(const s2 of[-1,1])slots.push({t:'d',x:door[0]+1.2*s2,z:door[1]-1.3});
    const fenced=!!H.fenced;if(fenced)slots.push({t:'c',x:minX-.55,z:zf2+.35},{t:'c',x:maxX+.55,z:zf2+.35});else slots.push({t:'c',x:minX-1.5,z:minZ-1.3},{t:'c',x:maxX+1.5,z:minZ-1.3});
    for(let z=minZ;z<=maxZ;z++){slots.push({t:'s',x:minX-1.45,z,side:-1},{t:'s',x:maxX+1.45,z,side:1})}
    for(let x=minX;x<=maxX;x++)slots.push({t:'b',x,z:maxZ+1.5});
    const n=plan.civic?4+Math.floor(r()*2):1+Math.floor(r()*3);let placed=0;const used=new Set();
    if(plan.civic){for(let x=minX-1;x<=maxX+1;x+=2)slots.push({t:'f',x,z:minZ-2.6})}
    for(let t=0;t<40&&placed<n;t++){const pr=pick(r,P);const[pk,nm,psc,allow,rot]=pr;if(!KIT.has(pk,nm))continue;const cand=slots.filter((sl,i)=>allow.includes(sl.t)&&!used.has(i));if(!cand.length)continue;
      const sl=pick(r,cand);const ry=rot==null?Math.floor(r()*4)*PI/2:(sl.t==='s'?rot+PI/2:rot);
      if(tryPut('yard',pk,nm,sl.x,0,sl.z,ry,psc,H.pal)){used.add(slots.indexOf(sl));placed++}}
  }

  /* ---------- Endkontrolle: schwebende Teile ---------- */
  function floating(H){const out=[];for(const a of H.occ){if(a.b.min.y<.03)continue;let ok=false;
      for(const b of H.occ){if(b===a)continue;const ox=Math.min(a.b.max.x,b.b.max.x)-Math.max(a.b.min.x,b.b.min.x),oz=Math.min(a.b.max.z,b.b.max.z)-Math.max(a.b.min.z,b.b.min.z);
        if(ox>-.02&&oz>-.02&&b.b.max.y>=a.b.min.y-.07&&b.b.min.y<a.b.min.y-.01){ok=true;break}
        /* seitlich an Wand/Dach befestigt */if((a.cat==='attach'||a.cat==='chim'||a.cat==='tower')&&(b.cat==='wall'||b.cat==='roof')&&depth(a.b,b.b)>-.02){ok=true;break}}
      if(!ok)out.push(a.name+'@'+a.b.min.y.toFixed(2))}return out}

  /* ---------- Bauplan je Planet ---------- */
  const PLAN={
    kompost:[{fam:'town'},{fam:'town',fp:{tower:.6}},{fam:'town',round:1},{fam:'cabin',fp:{noHigh:1,noWings:1,noTower:1}},{fam:'town',fp:{tall:.8}}],
    schrott:[{fam:'station',base:.3,fence:null,fp:{tall:.5}},{fam:'station',base:.3,fence:null,fp:{tall:.7,tower:.5}},{fam:'station',base:.3,fence:null,noLantern:1,fp:{tall:.4}}],
    korallen:[{fam:'town',base:.99,fp:{maxFl:2,tall:.25,noTower:1,dims:[[2,1],[2,2],[1,2],[3,1],[1,1]]}},{fam:'cabin',base:.99,fp:{maxFl:1,noTower:1,noWings:1,noHigh:1,dims:[[2,1],[2,2],[1,2],[3,1]]}},{fam:'town',round:1}],
    frost:[{fam:'cabin',snow:1,fp:{noHigh:1,noWings:1,noTower:1}},{fam:'cabin',snow:1,fp:{noHigh:1,tall:.75,noWings:1,noTower:1}},{fam:'cabin',snow:1,base:.99,fp:{noHigh:1,maxFl:1,noWings:1,noTower:1,dims:[[2,1],[2,2],[1,2],[3,1]]}},{fam:'town',fp:{tall:.6}},{fam:'town',round:1}],
    wueste:[{fam:'pueblo',fence:null,noLantern:1},{fam:'pueblo',fence:null,noLantern:1},{fam:'pueblo',fence:null,noLantern:1},{fam:'pueblo',fence:null}],
    pilz:[{fam:'mush'},{fam:'mush',fence:null},{fam:'mush'},{fam:'mush',stack:false}]};
  /* Öffentliche Gebäude: grössere Grundrisse, höher, Turm für Rathaus/Museum, offener Vorplatz */
  function civic(pid,kind,opt){opt=opt||{};const plans=(PLAN[pid]||PLAN.kompost).filter(p=>!p.base||pid==='korallen'||pid==='schrott');const base=plans[hashS(kind+pid)%plans.length];const plan=Object.assign({},base,{civic:kind,fence:null,noBalcony:kind!=='bar'&&kind!=='studio'});
    if(plan.fam==='mush')Object.assign(plan,{big:1,stack:kind==='rathaus'||kind==='museum'});
    else if(plan.fam!=='pueblo')plan.fp=Object.assign({},base.fp||{},{dims:[[3,2],[3,3],[4,2],[2,3]],tall:.85,maxFl:3,noWings:false,tower:kind==='rathaus'||kind==='museum'?1:.15,towerExtra:kind==='rathaus'?1:0});
    else plan.big=1;
    return build(pid,opt.seed||hashS(pid+kind),Object.assign({},opt,{plan}))}
  const hashS=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)%1000003};
  const REJ={};function rej(plan,iss){for(const i of iss){const k=(plan.fam||'town')+': '+i.replace(/@.*/,'');REJ[k]=(REJ[k]||0)+1}}
  function build(pid,seed,opt){opt=opt||{};const plans=PLAN[pid]||PLAN.kompost;let last=null,tries=0;
    for(;tries<24;tries++){const s=seed+tries*7919;const r=rng(s+99);const plan=Object.assign({},opt.plan||plans[(opt.index!=null?opt.index:Math.floor(r()*plans.length))%plans.length]);
      const H=plan.fam==='pueblo'?makePueblo(pid,s,plan):plan.fam==='mush'?makeMush(pid,s,plan):make(pid,s,plan);if(H.issues.length){rej(plan,H.issues);last={H,plan};continue}
      if(plan.fam!=='pueblo'&&plan.fam!=='mush')attachments(H,plan);yard(H,pid,plan);const fl=plan.fam==='mush'?[]:floating(H);if(fl.length){H.issues.push(...fl.map(f=>'schwebt '+f));rej(plan,H.issues);last={H,plan};continue}
      last={H,plan};break}
    const{H,plan}=last;const bb=new THREE.Box3();for(const o of H.occ)if(['wall','roof','struct'].includes(o.cat))bb.union(o.b);const c=center(H.g,H.door,bb.isEmpty()?null:bb);const ctr=c.ctr;
    /* Krümmung des Planeten: Gartenteile am Boden folgen der Kugel (sonst schweben die Ränder) */
    const unit=H.unit||1;const sagR=opt.sagR?opt.sagR/unit:0;
    for(const o of H.occ){if(!o.m)continue;if(['yard','path','chain','veg'].includes(o.cat)||(o.cat==='attach'&&o.m.position.y<.05)){if(sagR&&o.m.position.y<1.1){const d2=o.m.position.x*o.m.position.x+o.m.position.z*o.m.position.z;o.m.position.y-=d2/(2*sagR)}}}
    /* Kollision: Hauskörper-Radius + kleine Kreise für Zaun, Bäume, Deko */
    let bodyR=0;const cols=[];for(const o of H.occ){const b=o.b;const x0=b.min.x-ctr.x,x1=b.max.x-ctr.x,z0=b.min.z-ctr.z,z1=b.max.z-ctr.z;
      if(['wall','roof','struct','tower','chim'].includes(o.cat)){for(const x of[x0,x1])for(const z of[z0,z1])bodyR=Math.max(bodyR,Math.hypot(x,z)*(o.cat==='roof'?.8:1))}
      else if(['yard','chain'].includes(o.cat)&&o.name!=='schild'&&b.max.y-b.min.y>.15){const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;if(Math.max(w,d)>1.3){const n=Math.ceil(Math.max(w,d)/.9);for(let i=0;i<n;i++){const t=(i+.5)/n;cols.push([w>d?x0+w*t:cx,w>d?cz:z0+d*t,Math.max(.22,Math.min(w,d)/2+.12)])}}else cols.push([cx,cz,Math.max(.18,Math.max(w,d)*.45)])}}
    /* Hauskörper: ein Kreis je Rasterzelle (deckt die Ecken ab), Pilze: Stielkreis */
    if(plan.fam==='mush'){const sb=H.occ.find(o=>o.name==='stiel').b;cols.push([(sb.min.x+sb.max.x)/2-ctr.x,(sb.min.z+sb.max.z)/2-ctr.z,(sb.max.x-sb.min.x)/2]);const an=H.occ.find(o=>o.name==='anbau');if(an){const b=an.b;cols.push([(b.min.x+b.max.x)/2-ctr.x,(b.min.z+b.max.z)/2-ctr.z,(b.max.x-b.min.x)*.32])}}
    else{for(const[x,z]of H.cells)cols.push([x-ctr.x,z-ctr.z,.74]);for(const o of H.occ)if(o.cat==='tower'||o.cat==='chim'||(o.cat==='struct')){const b=o.b;cols.push([(b.min.x+b.max.x)/2-ctr.x,(b.min.z+b.max.z)/2-ctr.z,Math.max(.2,Math.min(b.max.x-b.min.x,b.max.z-b.min.z)*.5)])}}
    const S=unit;const sign=H.sign?[(H.sign[0]-ctr.x)*S,(H.sign[1]-ctr.z)*S]:null;
    if(H.unit){H.g.scale.setScalar(H.unit)}return{g:H.g,unit,bodyR:bodyR*S,colliders:cols.map(c2=>[c2[0]*S,c2[1]*S,c2[2]*S]),sign,door:[c.door[0]*S,c.door[1]*S],size:c.size.clone().multiplyScalar(S),pal:H.pal,issues:H.issues,tries,style:(plan.fam||'town')+(H.style?'-'+H.style:'')+(plan.mushroom?'+pilzdach':'')+(plan.base?'+stelzen':'')+(H.round?(plan.fam==='pueblo'?'+kuppelturm':'+rundturm'):'')+(H.chim?'+kamin':'')+(H.balc&&!H.balcFailed?'+balkon':'')}}
  function center(g,door,body){const box=new THREE.Box3().setFromObject(g);const ctr=(body||box).getCenter(new V());ctr.y=0;g.children.forEach(c=>{c.position.x-=ctr.x;c.position.z-=ctr.z});return{ctr,door:[door[0]-ctr.x,door[1]-.5-ctr.z],size:box.getSize(new V())}}
  const PACKS=['town','holiday','pirate','nature','survival','station','modular','castle','plat','space','furn','food','graveyard'];let ready=false;
  function load(){return Promise.all(PACKS.map(p=>KIT.load(p))).then(()=>{ready=true;if(window.KITFURN)KITFURN.fix()})}
  return{build,civic,palette,THEMES,rng,REJ,load,PACKS,get ready(){return ready}}
})();
