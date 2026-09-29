/* =====================================================================
   CYBORG-LABOR · planet.js
   Riesige Planeten: Würfel-Kugel mit Quadtree-Kacheln (LOD). Nahe am
   Spieler feine Kacheln (≈0,5 Einheiten), in der Ferne grobe. Kacheln
   werden im Hintergrund gebaut (Zeitbudget je Frame), Schürzen an den
   Kanten verdecken Nähte. Die Bodenhöhe für Figuren und Objekte kommt
   exakt aus dem gerade sichtbaren Dreieck – nichts schwebt, nichts sinkt.
   ===================================================================== */
const PLANETLOD=(()=>{
  const V=THREE.Vector3;const N=32;/* Quads je Kachelkante */
  const FACES=[[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]].map(f=>f.map(a=>new V(...a)));
  const Q4=Math.PI/4;
  function dirOf(f,u,v,out){const F=FACES[f];const a=Math.tan(u*Q4),b=Math.tan(v*Q4);return(out||new V()).set(F[0].x+a*F[1].x+b*F[2].x,F[0].y+a*F[1].y+b*F[2].y,F[0].z+a*F[1].z+b*F[2].z).normalize()}
  function faceUV(p){let f=0,bd=-2;for(let i=0;i<6;i++){const d=p.dot(FACES[i][0]);if(d>bd){bd=d;f=i}}const F=FACES[f];return{f,u:Math.atan(p.dot(F[1])/bd)/Q4,v:Math.atan(p.dot(F[2])/bd)/Q4}}
  let S=null;/* Zustand des aktuellen Planeten */
  function create(fns,mat,scene,o){dispose();o=o||{};const R=fns.R;const faceLen=R*Math.PI/2;let maxD=0;while(faceLen/Math.pow(2,maxD)/N>(o.fine||.55)&&maxD<9)maxD++;
    S={fns,mat,scene,R,maxD,roots:[],queue:[],building:0,vattr:o.vattr,water:o.water||null,onReady:o.onReady||null,split:o.split||2.1,group:new THREE.Group(),frame:0,pending:new Set()};S.group.name='planet';scene.add(S.group);
    for(let f=0;f<6;f++)S.roots.push(node(f,-1,-1,2,0,null));return S}
  function node(f,u0,v0,s,d,parent){const c=dirOf(f,u0+s/2,v0+s/2);return{f,u0,v0,s,d,parent,kids:null,mesh:null,H:null,P:null,ready:false,want:false,c,len:s/2*S.R*Math.PI/2,queued:false,dead:false}}
  /* ---------- Kachel bauen ---------- */
  const _d=new V(),_n=new V(),_a=new V(),_b=new V();
  function buildNode(nd){const fns=S.fns,R=S.R,sea=fns.sea;const M=N+1,G=N+3;/* mit Rand für Normalen */
    const hs=new Float32Array(G*G),ps=new Float32Array(G*G*3);const du=nd.s/N;
    for(let j=0;j<G;j++)for(let i=0;i<G;i++){const u=nd.u0+(i-1)*du,v=nd.v0+(j-1)*du;dirOf(nd.f,u,v,_d);const h=fns.hAt(_d);const k=j*G+i;hs[k]=h;ps[k*3]=_d.x*(R+h);ps[k*3+1]=_d.y*(R+h);ps[k*3+2]=_d.z*(R+h)}
    const nv=M*M,sk=4*M;/* Schürze */const tot=nv+sk;const pos=new Float32Array(tot*3),nor=new Float32Array(tot*3),col=new Float32Array(tot*3),mat=new Float32Array(tot*4),pat=new Float32Array(tot*4),cl=new Float32Array(tot*3);
    const H=new Float32Array(nv),P=new Float32Array(nv*3);
    const at=(i,j)=>(j*G+i)*3;
    for(let j=0;j<M;j++)for(let i=0;i<M;i++){const k=j*M+i,g=(j+1)*G+(i+1);const a=at(i+2,j+1),b=at(i,j+1),c=at(i+1,j+2),e=at(i+1,j);
      _a.set(ps[a]-ps[b],ps[a+1]-ps[b+1],ps[a+2]-ps[b+2]);_b.set(ps[c]-ps[e],ps[c+1]-ps[e+1],ps[c+2]-ps[e+2]);_n.crossVectors(_a,_b).normalize();
      _d.set(ps[g*3],ps[g*3+1],ps[g*3+2]);if(_n.dot(_d)<0)_n.negate();
      pos[k*3]=ps[g*3];pos[k*3+1]=ps[g*3+1];pos[k*3+2]=ps[g*3+2];nor[k*3]=_n.x;nor[k*3+1]=_n.y;nor[k*3+2]=_n.z;H[k]=hs[g];P[k*3]=pos[k*3];P[k*3+1]=pos[k*3+1];P[k*3+2]=pos[k*3+2];
      _d.normalize();S.vattr(_d,hs[g],_n,k,col,pat,mat,cl)}
    /* Schürzen: Kante nach innen gezogen, gleiche Farbe */let si=nv;const skirt=[];const dep=nd.len/N*2+1.2;
    const edge=[];for(let i=0;i<M;i++)edge.push(i);for(let j=1;j<M;j++)edge.push(j*M+M-1);for(let i=M-2;i>=0;i--)edge.push((M-1)*M+i);for(let j=M-2;j>0;j--)edge.push(j*M);
    for(const k of edge){const x=pos[k*3],y=pos[k*3+1],z=pos[k*3+2];const l=Math.hypot(x,y,z);const f=(l-dep)/l;pos[si*3]=x*f;pos[si*3+1]=y*f;pos[si*3+2]=z*f;for(let c=0;c<3;c++){nor[si*3+c]=nor[k*3+c];col[si*3+c]=col[k*3+c];cl[si*3+c]=cl[k*3+c]}for(let c=0;c<4;c++){mat[si*4+c]=mat[k*4+c];pat[si*4+c]=pat[k*4+c]}skirt.push([k,si]);si++}
    const idx=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*M+i,b=a+1,c=a+M,e=c+1;/* u×v zeigt nach aussen → gegen den Uhrzeigersinn von aussen gesehen */idx.push(a,b,c,b,e,c)}
    for(let t=0;t<skirt.length;t++){const[a,sa]=skirt[t],[b,sb]=skirt[(t+1)%skirt.length];idx.push(a,sa,b,b,sa,sb,a,b,sa,b,sb,sa)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos.subarray(0,si*3),3));g.setAttribute('normal',new THREE.BufferAttribute(nor.subarray(0,si*3),3));g.setAttribute('color',new THREE.BufferAttribute(col.subarray(0,si*3),3));
    g.setAttribute('aMat',new THREE.BufferAttribute(mat.subarray(0,si*4),4));g.setAttribute('aPat',new THREE.BufferAttribute(pat.subarray(0,si*4),4));g.setAttribute('aCl',new THREE.BufferAttribute(cl.subarray(0,si*3),3));g.setIndex(idx);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,S.mat);m.receiveShadow=true;m.matrixAutoUpdate=false;m.userData.lod=nd.d;nd.mesh=m;nd.H=H;nd.P=P;nd.ready=true;m.visible=false;S.group.add(m);
    /* Wasser je Kachel (gleiche Auflösung wie der Boden, nur wo es Wasser gibt): Tiefe je Vertex für Schaum und Farbe */
    if(S.water){let lo=1e9;for(let i=0;i<nv;i++)if(H[i]<lo)lo=H[i];if(lo<sea+.02){const wr=R+sea;const wp=new Float32Array(nv*3),wn=new Float32Array(nv*3),wd=new Float32Array(nv);
        for(let i=0;i<nv;i++){const x=P[i*3],y=P[i*3+1],z=P[i*3+2];const l=Math.hypot(x,y,z)||1;wn[i*3]=x/l;wn[i*3+1]=y/l;wn[i*3+2]=z/l;wp[i*3]=wn[i*3]*wr;wp[i*3+1]=wn[i*3+1]*wr;wp[i*3+2]=wn[i*3+2]*wr;wd[i]=sea-H[i]}
        const wi=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*M+i,b=a+1,c=a+M,e=c+1;if(wd[a]<-.4&&wd[b]<-.4&&wd[c]<-.4&&wd[e]<-.4)continue;wi.push(a,b,c,b,e,c)}
        if(wi.length){const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.BufferAttribute(wp,3));wg.setAttribute('normal',new THREE.BufferAttribute(wn,3));wg.setAttribute('depth',new THREE.BufferAttribute(wd,1));wg.setIndex(wi);wg.computeBoundingSphere();
          const w=new THREE.Mesh(wg,S.water);w.matrixAutoUpdate=false;w.renderOrder=2;w.userData.water=true;m.add(w)}}}
    if(S.onReady)try{S.onReady(nd)}catch(e){console.warn(e)}}
  function freeNode(nd){if(nd.kids){for(const k of nd.kids)freeNode(k);nd.kids=null}if(nd.mesh){S.group.remove(nd.mesh);nd.mesh.geometry.dispose();for(const c of nd.mesh.children)c.geometry&&c.geometry.dispose();nd.mesh=null}nd.ready=false;nd.dead=true;nd.H=null;nd.P=null}
  /* ---------- LOD-Auswahl ---------- */
  const _c=new V();
  function wants(nd,cam,camLen){const dist=_c.copy(nd.c).multiplyScalar(S.R).distanceTo(cam)-nd.len*.72;/* Horizont: hinter dem Horizont nicht verfeinern */
    const hor=Math.sqrt(Math.max(0,camLen*camLen-S.R*S.R))+nd.len*1.2+40;if(dist>hor)return false;return dist<nd.len*S.split&&nd.d<S.maxD}
  function enqueue(nd,pri){if(nd.ready||nd.queued)return;nd.queued=true;nd.pri=pri;S.queue.push(nd)}
  function walk(nd,cam,camLen){if(wants(nd,cam,camLen)){if(!nd.kids){const h=nd.s/2;nd.kids=[node(nd.f,nd.u0,nd.v0,h,nd.d+1,nd),node(nd.f,nd.u0+h,nd.v0,h,nd.d+1,nd),node(nd.f,nd.u0,nd.v0+h,h,nd.d+1,nd),node(nd.f,nd.u0+h,nd.v0+h,h,nd.d+1,nd)]}
        let all=true;for(const k of nd.kids){walk(k,cam,camLen);if(!k.covered)all=false}
        if(all){if(nd.mesh)nd.mesh.visible=false;nd.covered=true}else{/* Kinder noch nicht fertig: selbst zeigen, Kinder verstecken */if(nd.ready){nd.mesh.visible=true;hide(nd.kids);nd.covered=true}else{enqueue(nd,nd.d*1e6+_c.copy(nd.c).multiplyScalar(S.R).distanceTo(cam));nd.covered=false}}}
    else{if(nd.kids){/* zusammenlegen, sobald selbst bereit */if(nd.ready){for(const k of nd.kids)freeNode(k);nd.kids=null}else{for(const k of nd.kids)walk(k,cam,camLen)}}
      if(nd.ready){nd.mesh.visible=true;nd.covered=true}else{enqueue(nd,-1e9+_c.copy(nd.c).multiplyScalar(S.R).distanceTo(cam)-nd.d*1e5);nd.covered=!!nd.kids&&nd.kids.every(k=>k.covered)}}}
  function hide(list){for(const k of list){if(k.mesh)k.mesh.visible=false;if(k.kids)hide(k.kids)}}
  /* budget in ms; force: so lange bauen bis nichts mehr aussteht (Ladebildschirm) */
  function update(cam,budget,force){if(!S)return;const camLen=cam.length();
    /* nichts zu tun, solange die Kamera kaum wandert und keine Kachel aussteht */if(!force&&S.last&&S.idle&&S.last.distanceToSquared(cam)<.25)return;S.last=(S.last||new V()).copy(cam);for(let pass=0;pass<(force?40:1);pass++){S.queue.length=0;for(const r of S.roots){r.queued=false;clearQ(r)}
      for(const r of S.roots)walk(r,cam,camLen);if(!S.queue.length)break;S.queue.sort((a,b)=>a.pri-b.pri);const t0=performance.now();
      for(const nd of S.queue){if(nd.dead||nd.ready)continue;buildNode(nd);if(!force&&performance.now()-t0>budget)break}}
    S.queue.length=0;for(const r of S.roots){clearQ(r)}for(const r of S.roots)walk(r,cam,camLen);S.idle=!S.queue.length}
  function clearQ(nd){nd.queued=false;if(nd.kids)for(const k of nd.kids)clearQ(k)}
  /* ---------- Höhe exakt aus dem sichtbaren Mesh ---------- */
  const _o=new V(),_e1=new V(),_e2=new V(),_pv=new V(),_tv=new V(),_qv=new V(),_A=new V(),_B=new V(),_C=new V();
  function ray(dir,A,B,C){_e1.subVectors(B,A);_e2.subVectors(C,A);_pv.crossVectors(dir,_e2);const det=_e1.dot(_pv);if(Math.abs(det)<1e-10)return -1;const inv=1/det;_tv.copy(A).negate();const u=_tv.dot(_pv)*inv;if(u<-1e-4||u>1+1e-4)return -1;_qv.crossVectors(_tv,_e1);const v=dir.dot(_qv)*inv;if(v<-1e-4||u+v>1+1e-4)return -1;return _e2.dot(_qv)*inv}
  function height(p){if(!S)return null;const{f,u,v}=faceUV(p);let nd=S.roots[f];let best=nd.ready?nd:null;
    while(nd.kids){const h=nd.s/2;const k=nd.kids[(u>=nd.u0+h?1:0)+(v>=nd.v0+h?2:0)];if(!k)break;nd=k;if(nd.ready&&nd.mesh&&(nd.mesh.visible||!best||!best.mesh.visible))best=nd}
    if(!best)return null;const b=best;const M=N+1;const fi=Math.min(N-1,Math.max(0,Math.floor((u-b.u0)/b.s*N))),fj=Math.min(N-1,Math.max(0,Math.floor((v-b.v0)/b.s*N)));
    const P=b.P;const ia=fj*M+fi,ib=ia+1,ic=ia+M,ie=ic+1;_A.fromArray(P,ia*3);_B.fromArray(P,ib*3);_C.fromArray(P,ic*3);const dir=_o.copy(p).normalize();
    let t=ray(dir,_A,_C,_B);if(t<0){_A.fromArray(P,ib*3);_B.fromArray(P,ic*3);_C.fromArray(P,ie*3);t=ray(dir,_A,_B,_C)}
    if(t<0){/* Randfall: nächstgelegener Eckwert */return b.H[ia]}return t-S.R}
  function dispose(){if(!S)return;for(const r of S.roots)freeNode(r);S.scene.remove(S.group);S=null}
  function stats(){if(!S)return{};let n=0,vis=0,maxd=0;const w=nd=>{if(nd.ready){n++;if(nd.mesh.visible){vis++;maxd=Math.max(maxd,nd.d)}}if(nd.kids)nd.kids.forEach(w)};S.roots.forEach(w);return{tiles:n,visible:vis,maxDepth:maxd,maxD:S.maxD}}
  return{create,update,height,dispose,stats,dirOf,faceUV,get S(){return S}}
})();
