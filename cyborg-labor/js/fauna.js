/* =====================================================================
   CYBORG-LABOR · fauna.js
   Tiere auf jedem Planeten (keine Cyborgs!): gemütlicher Tier-Baukasten,
   eigene Arten je Planet, Verhalten (grasen, schlafen, fliehen, schwimmen,
   fliegen, tanzen) und Begegnungen: streicheln, füttern, Fangen spielen,
   mitnehmen, Namen geben, Tierlexikon. Donna Haraway: „companion species“ –
   wir werden immer *mit* anderen Arten.
   ===================================================================== */
const FAUNA=(()=>{
  const {eye,orient,crystal,crysMat,spiralShell,flatLeaf,leafShape,shade,IT,itMeta,settle}=NH;
  const M=makeMats({skin:'haut',color:0});
  const V=THREE.Vector3;

  /* ================= Tier-Baukasten =================
     Einheiten: Körper ~1 hoch, Blick nach +z. a = Aussehen. */
  /* Bausatz-Tiere (z. B. Urzeit-Dinos von Quaternius): festes Modell, Bewegung durch Wiegen, Nicken und Hüpfen */
  function kitAnimal(a){const g=new THREE.Group();const piv=new THREE.Group();g.add(piv);const[pack,name]=a.kit;const b=KIT.bounds(pack,name);
    const put=()=>{const b2=KIT.bounds(pack,name);const mm=KIT.mesh(pack,name,a.pal||KIT.ORIG);if(!mm||!b2)return false;const h=b2[4]-b2[1];const k=(a.h||1)/h;mm.scale.setScalar(k);mm.position.set(-(b2[0]+b2[3])/2*k,-b2[1]*k,-(b2[2]+b2[5])/2*k);piv.add(mm);if(typeof addOutlines==='function')addOutlines(mm);return true};
    /* Bausatz noch nicht geladen (z. B. Dinos ausserhalb der Urzeit): kurz einen Platzhalter zeigen, laden und dann das echte Modell einsetzen */
    if(!put()){const ph=P(piv,G.s(.4),M.c(a.col||'#8FD06B'),[0,.4,0]);KIT.load(pack).then(()=>{if(put())piv.remove(ph)}).catch(()=>{})}
    g.userData.R={legs:[],ears:[],eyes:[],wings:[],fins:[],tail:null,head:null,body:piv,by:0,gills:[]};
    g.userData.tick=(t,moving,act,mode)=>{const sp=a.gaitSpeed||7;if(mode==='sleep'){piv.rotation.set(0,0,.08);piv.scale.set(1,.92+Math.sin(t*1.5)*.02,1);piv.position.y=0;return}
      piv.scale.set(1,1,1);if(moving){piv.position.y=Math.abs(Math.sin(t*sp))*.06*(a.h||1);piv.rotation.z=Math.sin(t*sp)*.07;piv.rotation.x=Math.sin(t*sp*2)*.025}
      else{piv.position.y=mode==='happy'?Math.abs(Math.sin(t*8))*.12:0;piv.rotation.z=Math.sin(t*1.2)*.02;piv.rotation.x=(mode==='eat'?.18+Math.sin(t*6)*.06:Math.sin(t*.9)*.03)}};
    return g}
  function buildAnimal(a,m){if(a.kit)return kitAnimal(a);const g=new THREE.Group();const R={legs:[],ears:[],eyes:[],wings:[],fins:[],tail:null,head:null,body:null,gills:[]};
    const col=a.col,bel=a.belly||shade(col,1.25),dark=shade(col,.62);const cm=m.c(col,{rim:.55,rimColor:a.rimCol||'#fff6ec'}),bm=m.c(bel,{rim:.4}),dm=m.c(a.dark||dark);
    const [rx,ry,rz]=a.body||[.42,.36,.5];const by=a.by??(a.legs&&a.legs.n?(a.legs.len||.2)+ry*.8:ry*.9);
    const body=grp(g,[0,by,0]);R.body=body;R.by=by;
    P(body,G.s(1),cm,[0,0,0],null,[rx,ry,rz]);
    if(a.bellyOn!==false)P(body,G.s(1),bm,[0,-ry*.22,rz*.18],null,[rx*.82,ry*.72,rz*.84]);
    /* Muster */
    if(a.spots)range(a.spots.n||5,(t,i)=>{const th=.6+((i*.37)%1)*1.3,ph=i*2.1;const n=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];const s=P(body,G.s(.1*(a.spots.s||1)),m.c(a.spots.col),[n[0]*rx*.97,n[1]*ry*.97,n[2]*rz*.97],null,[1,1,.35]);orient(s,n);s.userData.noOutline=true});
    if(a.stripes)range(a.stripes.n||4,(t,i)=>{const z=-rz*.55+t*rz*1.1;P(body,G.to(1,.06,PI),m.c(a.stripes.col),[0,0,z],[0,PI/2,0],[rx*.99*Math.sqrt(1-(z/rz)**2),ry*.99*Math.sqrt(1-(z/rz)**2),1]).userData.noOutline=true});
    /* Kopf */
    const hr=a.head?.r??.3;const hp=a.head?.p||[0,by+ry*.55,rz*.78];const head=grp(g,hp);R.head=head;R.hp=hp.slice();
    const hc=a.head?.col?m.c(a.head.col,{rim:.55}):cm;P(head,G.s(hr),hc,[0,0,0],null,a.head?.sc||[1,.94,.96]);
    const face=a.head?.face??hr*.9;
    /* Schnauze */
    const sn=a.snout||{type:'dot'};const snm=m.c(sn.col||bel,{rim:.4});
    if(sn.type==='muzzle'){P(head,G.s(hr*.46),snm,[0,-hr*.22,face*.86],null,[1.15,.8,sn.len||.9]);P(head,G.s(hr*.12),m.c(sn.nose||PAL.ink,{gloss:1}),[0,-hr*.08,face*.86+hr*.4*(sn.len||.9)],null,[1.3,.9,.8])}
    else if(sn.type==='long'){P(head,G.ca(hr*.26,hr*.5),snm,[0,-hr*.18,face*.9],[PI/2,0,0]);P(head,G.s(hr*.13),m.c(sn.nose||PAL.ink,{gloss:1}),[0,-hr*.12,face*.9+hr*.55])}
    else if(sn.type==='beak'){const bk=m.c(sn.col||'#FFB23E',{gloss:.6});P(head,G.co(hr*.26,hr*(sn.len||.55)),bk,[0,-hr*.1,face*.94+hr*(sn.len||.55)*.4],[PI/2,0,0],[1.2,1,.7])}
    else if(sn.type==='bill'){const bk=m.c(sn.col||'#FFB23E',{gloss:.6});P(head,G.s(hr*.38),bk,[0,-hr*.18,face*.95],null,[1.25,.35,1.1])}
    else if(sn.type==='wide'){P(head,G.s(hr*.08),m.c(PAL.ink),[-hr*.12,-hr*.05,face*.98]);P(head,G.s(hr*.08),m.c(PAL.ink),[hr*.12,-hr*.05,face*.98])}
    else if(sn.type!=='none')P(head,G.s(hr*.1),m.c(sn.nose||'#FF8FA3',{gloss:1}),[0,-hr*.1,face*1.02],null,[1.3,1,.8]);
    /* Augen */
    const er=(a.eyes?.r??.075)*hr/.3,ex=(a.eyes?.x??.42)*hr,ey=(a.eyes?.y??.16)*hr;const ez=Math.sqrt(Math.max(0,hr*hr-ex*ex-ey*ey))*.92;
    both(s=>{const e=grp(head,[s*ex,ey,ez]);P(e,G.s(er),m.eye(),[0,0,0],null,[.9,1.05,.6]);const h=P(e,G.s(er*.36),m.flat('#ffffff'),[er*.3,er*.38,er*.4]);h.userData.noOutline=true;R.eyes.push(e)});
    if(a.cheeks!==false)both(s=>{const c=P(head,G.s(hr*.14),m.cheek(),[s*hr*.56,-hr*.2,ez*.85],[0,s*.6,0],[1.2,.7,.3]);c.castShadow=false});
    if(a.brows)both(s=>P(head,G.ca(hr*.035,hr*.12),m.c(a.brows),[s*ex,ey+er*1.9,ez*.95],[0,0,s*1.2+PI/2]));
    /* Ohren */
    const ea=a.ears;if(ea&&ea.type!=='none'){const ecol=m.c(ea.col||col,{rim:.55}),ein=m.c(ea.inner||'#FFB8C8');
      both(s=>{const pv=grp(head,[s*hr*(ea.x??.55),hr*(ea.y??.7),ea.z??0],[0,0,-s*(ea.tilt??.35)]);R.ears.push({g:pv,s,base:-s*(ea.tilt??.35)});const L=ea.len||.4;
        if(ea.type==='round'){P(pv,G.s(hr*.3),ecol,[0,hr*.12,0],null,[1,1,.45]);P(pv,G.s(hr*.18),ein,[0,hr*.12,hr*.07],null,[1,1,.3])}
        else if(ea.type==='pointy'){P(pv,G.co(hr*.28*(ea.w||1),hr*L*1.6,4),ecol,[0,hr*L*.8,0],[0,PI/4,0],[1,1,.5]);P(pv,G.co(hr*.16*(ea.w||1),hr*L*1.1,4),ein,[0,hr*L*.7,hr*.06],[0,PI/4,0],[1,1,.3])}
        else if(ea.type==='long'){P(pv,G.ca(hr*.16*(ea.w||1),hr*L*2),ecol,[0,hr*L*1.1,0],null,[1,1,.55]);P(pv,G.ca(hr*.09*(ea.w||1),hr*L*1.7),ein,[0,hr*L*1.1,hr*.05],null,[1,1,.3])}
        else if(ea.type==='floppy'){const f=grp(pv,[0,0,0],[0,0,s*1.9]);P(f,G.ca(hr*.15,hr*L*1.3),ecol,[0,hr*L*.7,0],null,[1,1,.5])}
        else if(ea.type==='nub'){P(pv,G.s(hr*.14),ecol,[0,hr*.05,0])}})}
    /* Hörner / Geweih / Fühler */
    if(a.antlers){const am=m.c(a.antlers,{rim:.4});both(s=>{const b=[s*hr*.35,hr*.75,0];const t=[s*hr*.9,hr*2,-hr*.2];bt(head,b,t,hr*.06,am,hr*.04);bt(head,[s*hr*.6,hr*1.35,-hr*.1],[s*hr*.35,hr*1.8,hr*.25],hr*.045,am,hr*.03);bt(head,[s*hr*.78,hr*1.7,-hr*.15],[s*hr*1.25,hr*2.05,-hr*.05],hr*.04,am,hr*.03);P(head,G.s(hr*.05),am,t)})}
    if(a.horns){const am=m.c(a.horns,{gloss:.5});both(s=>{const q=grp(head,[s*hr*.45,hr*.6,-hr*.1],[0,0,-s*.5]);P(q,G.co(hr*.12,hr*.45),am,[0,hr*.2,0])})}
    if(a.feelers){const fm=m.c(dark);both(s=>{bt(head,[s*hr*.25,hr*.8,hr*.2],[s*hr*.5,hr*1.6,hr*.5],hr*.035,fm,hr*.025);P(head,G.s(hr*.1),a.glowTips?m.glow(a.glowTips,2):fm,[s*hr*.5,hr*1.62,hr*.5])})}
    if(a.gills){both(s=>{for(let i=0;i<3;i++){const q=grp(head,[s*hr*.8,hr*(.3-i*.28),-hr*.1],[0,0,-s*(1.1-i*.35)]);R.gills.push({g:q,s,i});P(q,G.ca(hr*.07,hr*.45),m.c(a.gills,{rim:.8}),[0,hr*.3,0]);range(3,(t,j)=>P(q,G.s(hr*.08),m.c(shade(a.gills,1.15)),[s*hr*.08,hr*(.12+j*.18),0]))}})}
    if(a.cap){const cp=m.c(a.cap,{gloss:.7,rim:.5});P(head,G.hs(hr*1.35),cp,[0,hr*.35,0],null,[1,.8,1]);P(head,G.cy(hr*1.3,hr*1.2,hr*.12),m.c(shade(a.cap,1.5)),[0,hr*.36,0]);
      range(5,(t,i)=>{const an=i*1.3,rr=hr*(.4+(i%2)*.5);const d=P(head,G.s(hr*.16),m.c('#FFFBF0'),[Math.cos(an)*rr,hr*.35+Math.sqrt(Math.max(0,1.82-(rr/hr)**2))*hr*.78,Math.sin(an)*rr],null,[1,.45,1]);d.lookAt(d.position.clone().multiplyScalar(3));d.userData.noOutline=true})}
    if(a.tuft)P(head,G.s(hr*.3),m.c(a.tuft,{rim:.8}),[0,hr*.85,hr*.15],null,[1,.8,1]);
    if(a.scarf){const sm=m.c(a.scarf,{rim:.5});P(g,G.to(hr*.72,hr*.18),sm,[hp[0],hp[1]-hr*.72,hp[2]-hr*.05],[PI/2+.2,0,0]);P(g,G.bx(hr*.3,hr*.7,hr*.1,hr*.05),sm,[hr*.35,hp[1]-hr*1.1,hp[2]+hr*.35],[0.2,0,.2]);range(3,(t,i)=>P(g,G.bx(hr*.31,hr*.06,hr*.11,.01),m.c('#FFFDF7'),[hr*.35,hp[1]-hr*(.9+i*.18),hp[2]+hr*.36],[0.2,0,.2]))}
    /* Beine */
    const L=a.legs;if(L&&L.n){const lm=m.c(L.col||col,{rim:.45}),fm=m.c(L.foot||dark);const lr=L.r||.09,ll=L.len||.2;
      const pos=L.n===4?[[rx*.55,rz*.5],[-rx*.55,rz*.5],[rx*.55,-rz*.5],[-rx*.55,-rz*.5]]:L.n===2?[[rx*.42,0],[-rx*.42,0]]:range(L.n,(t,i)=>[(i%2?1:-1)*rx*.85,(t-.5)*rz*1.2]);
      pos.forEach(([x,z],i)=>{const pv=grp(g,[x,ll+lr*.5,z]);R.legs.push({g:pv,ph:(i===0||i===3)?0:PI,side:x>0?1:-1});
        if(L.type==='crab'){bt(pv,[0,0,0],[Math.sign(x)*.25,-ll*.2,0],lr*.6,lm,lr*.5);bt(pv,[Math.sign(x)*.25,-ll*.2,0],[Math.sign(x)*.32,-ll-lr*.3,0],lr*.5,lm,lr*.35)}
        else{P(pv,G.ca(lr,Math.max(.01,ll-lr)),lm,[0,-ll*.5+lr*.2,0]);P(pv,G.s(lr*1.15),fm,[0,-ll+lr*.2,lr*.3],null,[1,.65,1.35])}})}
    /* Flossen (Robbe, Schildkröte, Pinguin-Flügel) */
    if(a.flippers){const fm=m.c(a.flippers.col||dark,{rim:.5});both(s=>{const pv=grp(g,[s*rx*.8,by-ry*.15,rz*.25],[0,0,s*(a.flippers.up??.5)]);R.fins.push({g:pv,s});P(pv,G.s(1),fm,[s*.16,0,0],null,[.2*(a.flippers.s||1),.06,.12*(a.flippers.s||1)])});
      if(a.flippers.back)both(s=>{const pv=grp(g,[s*rx*.5,by-ry*.4,-rz*.9]);R.fins.push({g:pv,s,back:true});P(pv,G.s(1),fm,[s*.06,0,-.1],null,[.14,.05,.18])})}
    /* Flügel (Vögel, Falter) */
    if(a.wings){const wm=m.c(a.wings.col||shade(col,.85),{rim:.6});both(s=>{const pv=grp(g,[s*rx*.85,by+ry*.2,-rz*.05]);R.wings.push({g:pv,s});
      if(a.wings.type==='falter'){const w=P(pv,G.puff(sshp([[0,0],[.3,.35],[.7,.4],[.8,.05],[.55,-.35],[.2,-.3]]),.03,.012),wm,[0,0,0],[PI/2,0,0],[s*(a.wings.s||1),a.wings.s||1,1]);if(a.wings.glow)P(pv,G.s(.07),m.glow(a.wings.glow,2),[s*.5*(a.wings.s||1),.02,0])}
      else P(pv,G.s(1),wm,[s*-.04,0,-.1],[.25,s*.15,0],[.06,ry*.5,rz*.62])})}
    /* Schwanz */
    const T=a.tail;if(T&&T.type!=='none'){const tp=grp(g,[0,by+(T.y??ry*.15),-rz*.95]);R.tail=tp;const tm=m.c(T.col||col,{rim:.6});
      if(T.type==='puff')P(tp,G.s(T.r||.14),tm,[0,0,-.04]);
      else if(T.type==='long'){P(tp,G.tu([[0,0,0],[0,.12*(T.curl??1),-.25*(T.len||1)],[0,.3*(T.curl??1),-.42*(T.len||1)]],T.r||.05,(T.r||.05)*.5),tm);if(T.tip)P(tp,G.s((T.r||.05)*1.4),m.c(T.tip),[0,.3*(T.curl??1),-.42*(T.len||1)])}
      else if(T.type==='bushy'){P(tp,G.s(1),tm,[0,.12,-.22*(T.len||1)],[.6,0,0],[.14,.14,.3*(T.len||1)]);P(tp,G.s(.12),m.c(T.tip||'#FFFDF7'),[0,.24,-.42*(T.len||1)])}
      else if(T.type==='fan'){range(5,(t,i)=>P(tp,G.s(1),tm,[0,.02,-.05],[-(t-.5)*1.2+.3,0,0],[.04,.12,.16]))}
      else if(T.type==='flat'){P(tp,G.s(1),tm,[0,-.02,-.08],null,[.18,.04,.14])}
      else if(T.type==='lizard'){P(tp,G.tu([[0,0,0],[.05,-.05,-.3],[-.05,-.08,-.6],[.1,-.08,-.8]],T.r||.07,.01),tm)}
      else if(T.type==='magnet'){P(tp,G.tu([[0,0,0],[0,.15,-.2],[0,.3,-.28]],.03),tm);const mg=grp(tp,[0,.34,-.3]);P(mg,G.to(.07,.028,PI),m.c('#F0556E',{gloss:1}),[0,0,0],[0,0,PI]);both(s=>P(mg,G.cy(.028,.028,.04),m.c('#E8EEF5',{gloss:1}),[s*.07,.01,0]))}}
    /* Rücken-Extras */
    const X=a.extra||{};
    if(X.wool){const wm=m.c(X.wool,{rim:.9,rimColor:'#ffffff'});range(18,(t,i)=>{const th=.35+((i*.61)%1)*1.35,ph=i*2.4;P(body,G.s(.19+((i*.37)%1)*.07),wm,[Math.sin(th)*Math.cos(ph)*rx*.92,Math.cos(th)*ry*.9,Math.sin(th)*Math.sin(ph)*rz*.92])});P(head,G.s(hr*.42),wm,[0,hr*.72,-hr*.1],null,[1.2,.7,1])}
    if(X.spikes){const sm=m.c(X.spikes,{rim:.4});range(26,(t,i)=>{const th=.25+((i*.53)%1)*1.1,ph=i*2.4;if(Math.sin(th)*Math.sin(ph)>.7)return;const n=new V(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)-.25).normalize();
      const s=P(body,G.co(.07,.3,5),sm,[n.x*rx*.9,n.y*ry*.9,n.z*rz*.9]);s.quaternion.setFromUnitVectors(new V(0,1,0),n)})}
    if(X.shell){const sm=m.c(X.shell,{gloss:.8,rim:.5});P(body,G.hs(1),sm,[0,ry*.05,0],null,[rx*1.12,ry*1.35,rz*1.1]);const pm=m.c(X.plate||shade(X.shell,1.2),{gloss:.8});
      [[0,1,0],[.55,.75,.3],[-.55,.75,.3],[.55,.75,-.3],[-.55,.75,-.3],[0,.8,.55],[0,.8,-.55]].forEach(n=>{const v=new V(...n).normalize();const p=P(body,G.cy(.16,.16,.04,),pm,[v.x*rx*1.1,ry*.05+v.y*ry*1.33,v.z*rz*1.08]);p.quaternion.setFromUnitVectors(new V(0,1,0),v)});
      P(body,G.cy(rx*1.15,rx*1.15,.06),m.c(shade(X.shell,.8)),[0,ry*.05,0],null,[1,1,rz/rx])}
    if(X.crystals){range(5,(t,i)=>{const d=[(t-.5)*.5,1,-.2+((i*.37)%1)*.4];crystal(body,m,[(t-.5)*rx*.9,ry*.85,((i*.37)%1-.5)*rz],d,.07+((i*.3)%1)*.04,.35+((i*.53)%1)*.2,X.crystals)})}
    if(X.snailShell){spiralShell(body,m,X.snailShell,.78,[0,ry*.55,-rz*.25],[0,PI/2,0]);if(X.glow)range(3,(t,i)=>P(body,G.s(.045),m.glow(X.glow,2),[(i-1)*.08,ry*1.1+.12-Math.abs(i-1)*.05,-rz*.25]))}
    if(a.stalkEyes){const sm=m.c(shade(col,.85));both(s=>{bt(body,[s*rx*.3,ry*.6,rz*.7],[s*rx*.38,ry*1.7,rz*.8],.025,sm,.02);const e=grp(body,[s*rx*.38,ry*1.8,rz*.82]);P(e,G.s(.075),m.c('#FFFDF7'),[0,0,0]);P(e,G.s(.05),m.eye(),[0,0,.045]);P(e,G.s(.018),m.flat('#ffffff'),[.015,.02,.09]).userData.noOutline=true;R.eyes.push(e)});
      P(body,G.to(.05,.012,PI),m.c(PAL.ink),[0,ry*.15,rz*.97],[0,0,PI])}
    if(X.hump){const hm=m.c(col,{rim:.55});(X.hump===2?[-.18,.18]:[0]).forEach(z=>P(body,G.s(.3),hm,[0,ry*.75,z*rz*1.4],null,[1,1.1,1.1]))}
    if(X.mane){const mm=m.c(X.mane);range(6,(t,i)=>P(g,G.s(.08),mm,[0,hp[1]+hr*.4-t*.5,hp[2]-hr*.5-t*.35]))}
    if(X.claws){const cm2=m.c(X.claws,{gloss:.8});both(s=>{const q=grp(g,[s*rx*1.05,by+ry*.1,rz*.7]);R.fins.push({g:q,s,claw:true});P(q,G.s(.14),cm2,[s*.08,0,.12],null,[1,.75,1.2]);P(q,G.s(.08),cm2,[s*.14,.02,.26],null,[.8,.6,1.2])})}
    if(X.glowSpots){range(6,(t,i)=>{const th=.4+((i*.61)%1),ph=i*2.4;P(body,G.s(.045),m.glow(X.glowSpots,2),[Math.sin(th)*Math.cos(ph)*rx*.98,Math.cos(th)*ry*.98,Math.sin(th)*Math.sin(ph)*rz*.98])})}
    if(X.pouch)P(body,G.s(.13),m.c(X.pouch),[rx*.8,-ry*.1,0],null,[.6,1,1]);
    /* ------ Animation ------ */
    const legSw=a.gait==='hop'?0:.55,hop=a.gait==='hop',waddle=a.gait==='waddle',slither=a.gait==='slither';
    g.userData.R=R;g.userData.tick=(t,moving,act,mode)=>{const mv=moving?1:0;const sleep=mode==='sleep',happy=mode==='happy',eat=mode==='eat';
      const sp=a.gait==='fast'?12:9;
      for(const l of R.legs)l.g.rotation.x=mv*Math.sin(t*sp+l.ph)*legSw*(L&&L.type==='crab'?0:1);
      if(L&&L.type==='crab')for(const l of R.legs)l.g.rotation.z=mv*Math.sin(t*sp*1.3+l.ph)*.3;
      let bob=mv?Math.abs(Math.sin(t*sp))*.04:Math.sin(t*2)*.008;if(hop&&mv)bob=Math.abs(Math.sin(t*6))*.28;if(happy)bob=Math.abs(Math.sin(t*9))*.2;if(sleep)bob=-(R.by*.25)+Math.sin(t*1.5)*.01;
      body.position.y=R.by+bob;head.position.set(R.hp[0],R.hp[1]+bob+(sleep?-.08:0)+(eat?-.18:0),R.hp[2]+(eat?.05:0));
      body.rotation.z=waddle&&mv?Math.sin(t*sp*.6)*.14:0;g.rotation.z=0;
      head.rotation.x=eat?.55+Math.sin(t*8)*.08:sleep?.35:(mv?0:Math.sin(t*.7)*.08);head.rotation.y=!mv&&!sleep&&!eat?Math.sin(t*.5)*.35:0;head.rotation.z=happy?Math.sin(t*9)*.15:0;
      for(const e of R.ears)e.g.rotation.z=e.base+Math.sin(t*3+e.s)*.08+(happy?Math.sin(t*14)*.2*e.s:0)+(sleep?-e.s*.25:0);
      const blink=sleep||(t%3.7)<.12;for(const e of R.eyes)e.scale.y=blink?.12:1;
      if(R.tail)R.tail.rotation.y=Math.sin(t*(happy?16:3))*(happy?.5:.18);
      for(const w of R.wings){const fly=act>.5;const rest=a.wings.type==='falter'?.55:0;w.g.rotation.z=w.s*(rest+(fly?Math.sin(t*(a.wings.type==='falter'?14:18))*.8:(happy?Math.sin(t*12)*.3:Math.sin(t*1.5)*.05)))}
      for(const f of R.fins){if(f.claw){f.g.rotation.x=happy?Math.sin(t*10)*.4:Math.sin(t*2)*.1;continue}f.g.rotation.x=mv?Math.sin(t*6+(f.back?PI:0))*.4:0;if(happy&&!f.back)f.g.rotation.z=f.s*(.5+Math.sin(t*12)*.4)}
      for(const q of R.gills)q.g.rotation.x=Math.sin(t*3+q.i)*.15;
      if(slither)body.scale.set(1,1,1+(mv?Math.sin(t*6)*.08:0))};
    return g}

  /* ================= Neue Sammelsachen von Tieren ================= */
  IT('wolle',itMeta('Wollknäuel','kompost','tier',160),(g,m)=>{P(g,G.s(.22),m.c('#FFF6EA',{rim:.9}),[0,.22,0]);range(4,(t,i)=>P(g,G.to(.2,.018),m.c('#F2E2CC'),[0,.22,0],[i*.8,i*.5,0]));P(g,G.tu([[.2,.1,0],[.35,.02,.1],[.5,.02,-.05]],.018),m.c('#F2E2CC'))});
  IT('kleeblatt_vier',itMeta('Vierblättriges Kleeblatt','kompost','tier',500),(g,m)=>{const lm=m.c('#5FBF55',{rim:.6});for(let i=0;i<4;i++)P(g,G.heart(.12,.03),lm,[Math.cos(i*PI/2)*.1,.05,Math.sin(i*PI/2)*.1],[-PI/2,0,-i*PI/2+PI/2]);bt(g,[0,.03,0],[.05,.02,-.25],.012,lm)});
  IT('fellbueschel',itMeta('Fellbüschel','frost','tier',140),(g,m)=>{range(6,(t,i)=>P(g,G.s(.1),m.c(i%2?'#FFFFFF':'#EEF2FA',{rim:.9}),[Math.cos(i)*.1,.1+(i%3)*.04,Math.sin(i)*.1]))});
  IT('glitzerschleim',itMeta('Glitzerschleim-Glas','pilz','tier',220),(g,m)=>{P(g,G.cy(.14,.14,.3),m.glass('#E8FFF6'),[0,.15,0]);P(g,G.cy(.12,.12,.2),m.glow('#7FFFD4',1.4),[0,.11,0]);P(g,G.cy(.15,.15,.06),m.c('#C98C5A'),[0,.32,0])});
  IT('sandfeder',itMeta('Wüsten-Feder','wueste','tier',180),(g,m)=>{P(g,flatLeaf(leafShape(.5,.1),.015,.1),m.c('#E8A870',{rim:.6}),[0,.03,0]);bt(g,[-.05,.03,0],[.5,.03,0],.008,m.c('#8A5A44'))});

  /* ================= Arten ================= */
  const FOODS=['apfel','birne','kirsche','pfirsich','orange','beeren','kokosnuss','kaktusfrucht','champignon','morchel','unkraut','fliegenpilz_item','leuchtspore','blatt_herbst','kiefernzapfen','schneeball'];
  const S={
    /* --- Kompost --- */
    schaf:{n:'Schaf',planet:'kompost',biomes:['wiese','blumenfeld','kirschhain'],count:5,herd:true,size:1.05,speed:.9,voice:['mäh','mähäh','bäh'],pitch:260,likes:['unkraut','apfel','blatt_herbst'],product:'wolle',
      names:['Wolli','Flocke','Lotte','Knäuel','Mimi','Bruno'],fact:'Schafe erkennen die Gesichter von bis zu 50 anderen Schafen – und merken sie sich jahrelang.',
      a:{col:'#FFF6EA',belly:'#FFFDF7',body:[.45,.38,.55],head:{r:.27,col:'#5B4A5E',p:[0,.78,.55]},snout:{type:'muzzle',col:'#6E5C70',nose:'#2E2A3E',len:.7},ears:{type:'floppy',col:'#5B4A5E',len:.45,y:.3,x:.8},legs:{n:4,len:.26,r:.07,col:'#5B4A5E',foot:'#3B3450'},tail:{type:'puff',col:'#FFF6EA',r:.12},extra:{wool:'#FFF8EC'},cheeks:true}},
    igel:{n:'Igel',planet:'kompost',biomes:['wald','herbstwald','wiese'],count:3,size:.62,speed:.8,night:true,shy:true,voice:['fff','schnuff','hmpf'],pitch:330,likes:['apfel','beeren','champignon'],product:'apfel',
      names:['Stachelinchen','Pieks','Hubert','Kugel','Nuss'],fact:'Ein Igel hat etwa 6000 bis 8000 Stacheln – das sind umgebaute Haare. Im Winter hält er Winterschlaf.',
      a:{col:'#C9A07A',belly:'#F2DCC2',body:[.4,.3,.48],head:{r:.24,col:'#E8CFB0',p:[0,.36,.46]},snout:{type:'long',col:'#E8CFB0',nose:'#2E2A3E'},ears:{type:'round',col:'#E8CFB0',x:.6,y:.55},legs:{n:4,len:.12,r:.06,col:'#8A6A52',foot:'#6E5040'},tail:{type:'none'},extra:{spikes:'#7A5A44'}}},
    ente:{n:'Ente',planet:'kompost',water:true,count:4,herd:true,size:.62,speed:.7,voice:['quak','quak quak','wäk'],pitch:420,likes:['unkraut','beeren','kiefernzapfen'],product:'feder',
      names:['Quaki','Schnatterine','Paddel','Erpel Erich','Tröpfchen'],fact:'Enten haben wasserdichte Federn: Sie fetten sie mit einem Öl aus einer Drüse am Schwanz ein.',
      a:{col:'#FFE9A8',belly:'#FFF6D8',body:[.36,.3,.48],by:.32,head:{r:.24,p:[0,.72,.36]},snout:{type:'bill',col:'#FFA23E'},ears:{type:'none'},legs:{n:0},tail:{type:'fan',col:'#FFE9A8'},wings:{col:'#F7D98A'},tuft:'#FFE9A8'}},
    hase:{n:'Hase',planet:'kompost',biomes:['wiese','blumenfeld','kirschhain','wald'],count:4,size:.62,speed:1.8,gait:'hop',shy:true,voice:['mümmel','schnupp','hopp'],pitch:380,likes:['unkraut','apfel','beeren'],product:'kleeblatt_vier',productChance:.25,
      names:['Hoppel','Mümmel','Löffel','Karottine','Flitz'],fact:'Feldhasen können bis zu 70 km/h schnell rennen und blitzschnell Haken schlagen.',
      a:{col:'#D9B08A',belly:'#FFF1E0',body:[.34,.32,.42],head:{r:.27,p:[0,.62,.34]},snout:{type:'dot',nose:'#FF8FA3'},ears:{type:'long',len:.6,x:.35,y:.75,tilt:.12,inner:'#FFC2D0'},legs:{n:4,len:.12,r:.07,foot:'#FFF1E0'},tail:{type:'puff',col:'#FFFDF7',r:.12},gait:'hop'}},
    frosch:{n:'Frosch',planet:'kompost',biomes:['sumpf'],nearWater:true,count:3,size:.5,speed:1.3,gait:'hop',voice:['quaak','rib-bit','quark'],pitch:200,likes:['beeren','unkraut'],product:'kleeblatt_vier',
      names:['Quirin','Froschkönig','Hüpfer','Moosi','Grünling'],fact:'Frösche trinken nicht mit dem Maul – sie nehmen Wasser über die Haut auf.',
      a:{col:'#7FCB5A',belly:'#E8F7B8',body:[.4,.26,.38],head:{r:.3,p:[0,.42,.24],sc:[1.2,.8,1]},snout:{type:'wide'},eyes:{r:.1,x:.5,y:.55},ears:{type:'none'},legs:{n:4,len:.1,r:.08,foot:'#6CB84A'},tail:{type:'none'},spots:{col:'#5FA548',n:5},gait:'hop'}},
    /* --- Schrott-Mond --- */
    rostkrabbe:{n:'Rostkrabbe',planet:'schrott',biomes:['schrottebene','kristallfeld'],count:5,size:.62,speed:1.1,voice:['klack','klick klack','zzt'],pitch:300,likes:['schraube','kabelrest','kiesel'],product:'schraube',
      names:['Scherbi','Klacker','Rusty','Bolzen','Mutter Mira'],fact:'Einsiedlerkrebse ziehen in grössere Schneckenhäuser um – manchmal stellen sie sich dafür in einer Warteschlange nach Grösse auf!',
      a:{col:'#E0876A',belly:'#FFD2B8',body:[.46,.24,.36],by:.3,head:{r:.001,p:[0,.3,.3]},cheeks:false,snout:{type:'none'},eyes:{r:0},ears:{type:'none'},stalkEyes:true,legs:{n:6,len:.2,r:.05,type:'crab',col:'#C96A52'},tail:{type:'none'},extra:{claws:'#F0906E'},spots:{col:'#B8704E',n:4}}},
    magnetmaus:{n:'Magnetmaus',planet:'schrott',biomes:['schrottebene','gluehwald'],count:4,size:.5,speed:1.6,gait:'fast',shy:true,voice:['piep','fiep','pieps'],pitch:600,likes:['schraube','champignon','beeren'],product:'kabelrest',
      names:['Pieps','Volta','Ampère','Funki','Kupfernase'],fact:'Manche Tiere – Brieftauben, Meeresschildkröten – spüren das Magnetfeld der Erde und finden damit ihren Weg.',
      a:{col:'#B8B4D8',belly:'#EEEAFF',body:[.3,.26,.4],head:{r:.25,p:[0,.44,.34]},snout:{type:'dot',nose:'#FF8FB8'},ears:{type:'round',x:.62,y:.62,inner:'#FFC2D8'},legs:{n:4,len:.09,r:.05,foot:'#8E89B8'},tail:{type:'magnet',col:'#FFB8D0'}}},
    kristallkroete:{n:'Kristall-Schildkröte',planet:'schrott',biomes:['kristallfeld','gluehwald'],count:3,size:.9,speed:.35,voice:['hmmm','brumm','mhm'],pitch:150,likes:['beeren','champignon','unkraut'],product:'seeglas',
      names:['Opa Quarz','Amethysta','Geode','Sachte','Glimmer'],fact:'Schildkröten gibt es seit über 200 Millionen Jahren. Ihr Panzer ist mit der Wirbelsäule verwachsen – ausziehen geht nicht.',
      a:{col:'#9FD6A8',belly:'#E8F7D8',body:[.48,.24,.56],by:.3,head:{r:.2,p:[0,.34,.66]},snout:{type:'dot',nose:'#5E8A68'},ears:{type:'none'},legs:{n:4,len:.14,r:.08,foot:'#7FB888'},tail:{type:'puff',r:.06},extra:{shell:'#8E6BD1',plate:'#B79BF0',crystals:'#D6B8FF'}}},
    funkenfalter:{n:'Funkenfalter',planet:'schrott',biomes:['gluehwald','schrottebene','kristallfeld'],fly:true,count:5,size:.5,speed:1.2,night:false,voice:['sssirr','flirr'],pitch:700,likes:['leuchtspore','beeren'],product:'leuchtspore',
      names:['Funki','Glimm','Zünder','Blitzchen','Lumi'],fact:'Motten orientieren sich nachts am Mond. Lampen verwirren sie – deshalb umkreisen sie das Licht.',
      a:{col:'#5B4A7E',belly:'#8E7AB8',body:[.12,.12,.3],by:.2,head:{r:.14,p:[0,.24,.3]},snout:{type:'none'},ears:{type:'none'},feelers:true,glowTips:'#FFE27A',legs:{n:0},tail:{type:'none'},wings:{type:'falter',col:'#FFB45A',s:1.1,glow:'#FFE27A'}}},
    /* --- Korallen-Welt --- */
    krabbe:{n:'Krabbe',planet:'korallen',biomes:['riffstrand','felsinsel','strand','palmenhain'],shore:true,count:6,size:.55,speed:1.1,voice:['klick','zwick','schnipp'],pitch:340,likes:['muschel','kokosnuss','seeglas'],product:'muschel',
      names:['Zwicki','Scherenschnitt','Karla','Seitwärts-Sepp','Perle'],fact:'Krabben laufen seitwärts, weil ihre Beingelenke seitlich am schnellsten beugen.',
      a:{col:'#FF7E6B',belly:'#FFD2C2',body:[.44,.22,.34],by:.28,head:{r:.001,p:[0,.3,.3]},cheeks:false,snout:{type:'none'},eyes:{r:0},ears:{type:'none'},stalkEyes:true,legs:{n:6,len:.2,r:.05,type:'crab',col:'#F0655A'},tail:{type:'none'},extra:{claws:'#FF8E7A'}}},
    meereskroete:{n:'Meeresschildkröte',planet:'korallen',water:true,count:3,size:1.1,speed:.6,voice:['blubb','mmh'],pitch:170,likes:['seeglas','muschel','kokosnuss'],product:'seeglas',
      names:['Welle','Kapitän Kalle','Lagune','Perlmutt','Ruhig'],fact:'Meeresschildkröten kehren zum Eierlegen an den Strand zurück, an dem sie selbst geschlüpft sind – nach bis zu 30 Jahren!',
      a:{col:'#8ED0A0',belly:'#E8F7D8',body:[.5,.2,.58],by:.18,head:{r:.2,p:[0,.2,.72]},snout:{type:'dot',nose:'#5E9A70'},ears:{type:'none'},legs:{n:0},flippers:{col:'#7FC090',s:1.4,up:.1,back:true},tail:{type:'none'},extra:{shell:'#6FA870',plate:'#A8D890'}}},
    moewe:{n:'Möwe',planet:'korallen',biomes:['strand','riffstrand','felsinsel'],fly:true,count:4,size:.62,speed:1.4,voice:['kiäh','kreisch','ha-ha'],pitch:520,likes:['muschel','kokosnuss','kiefernzapfen'],product:'feder',
      names:['Kiki','Pommes','Segler','Wolke','Frau Flügel'],fact:'Möwen können Salzwasser trinken: Eine Drüse über den Augen filtert das Salz heraus.',
      a:{col:'#FFFDF7',belly:'#FFFFFF',body:[.3,.28,.44],head:{r:.22,p:[0,.62,.34]},snout:{type:'beak',col:'#FFC23E',len:.5},ears:{type:'none'},legs:{n:2,len:.16,r:.035,col:'#FFB23E',foot:'#FFB23E'},tail:{type:'fan',col:'#C8D0E0'},wings:{col:'#C8D0E0'}}},
    robbe:{n:'Robbe',planet:'korallen',water:true,shore:true,count:3,size:1,speed:.7,gait:'slither',voice:['ouh ouh','örk','bloop'],pitch:230,likes:['muschel','seeglas'],product:'seeglas',
      names:['Rolli','Pummel','Flosse','Ahoi','Lulu'],fact:'Seehunde können bis zu 30 Minuten tauchen und dabei ihren Herzschlag stark verlangsamen.',
      a:{col:'#A8B4C8',belly:'#E4EAF2',body:[.4,.3,.62],by:.28,head:{r:.28,p:[0,.62,.52]},snout:{type:'muzzle',col:'#D8E0EA',len:.6},ears:{type:'none'},legs:{n:0},flippers:{col:'#8E9AB0',s:1.1,up:.3,back:true},tail:{type:'none'},spots:{col:'#8E9AB0',n:6,s:.7},brows:'#8E9AB0',gait:'slither'}},
    /* --- Frost-Stern --- */
    pinguin:{n:'Pinguin',planet:'frost',biomes:['eisufer','schneefeld','polarhuegel'],shore:true,count:6,herd:true,size:.75,speed:.7,gait:'waddle',voice:['tröt','quiek','watschel'],pitch:360,likes:['eiskristall','schneeball','muschel'],product:'eiskristall',
      names:['Frackl','Pingu','Schlitter','Emil','Frosti','Kaiserin Kiki'],fact:'Kaiserpinguine kuscheln sich im Winter zu Tausenden zusammen und wechseln sich am warmen Platz in der Mitte ab.',
      a:{col:'#3B3F5E',belly:'#FFFDF7',body:[.34,.46,.34],by:.52,head:{r:.26,p:[0,1.0,.06]},snout:{type:'beak',col:'#FFB23E',len:.4},ears:{type:'none'},legs:{n:2,len:.1,r:.06,col:'#FFB23E',foot:'#FFB23E'},flippers:{col:'#3B3F5E',s:.9,up:.25},tail:{type:'flat',col:'#3B3F5E'},scarf:'#F0556E',gait:'waddle'}},
    eisfuchs:{n:'Polarfuchs',planet:'frost',biomes:['schneefeld','polarhuegel','tannenwald'],count:3,size:.7,speed:1.5,gait:'fast',shy:true,voice:['kjäk','wuff','hihi'],pitch:450,likes:['beeren','kiefernzapfen','apfel'],product:'fellbueschel',
      names:['Flocke','Schneeweiss','Fuchsia','Polaris','Winni'],fact:'Der Polarfuchs wechselt die Fellfarbe: im Winter schneeweiss, im Sommer braungrau.',
      a:{col:'#FBFDFF',belly:'#FFFFFF',body:[.34,.28,.5],head:{r:.25,p:[0,.62,.5]},snout:{type:'long',col:'#FFFFFF',nose:'#2E2A3E'},ears:{type:'pointy',len:.4,x:.55,y:.62,inner:'#D8E4F8'},legs:{n:4,len:.2,r:.055,foot:'#E4ECFA'},tail:{type:'bushy',col:'#FBFDFF',len:1.3,tip:'#E4ECFA'}}},
    schneehase:{n:'Schneehase',planet:'frost',biomes:['schneefeld','polarhuegel'],count:4,size:.6,speed:1.8,gait:'hop',shy:true,voice:['mümmel','hopp'],pitch:400,likes:['kiefernzapfen','beeren','unkraut'],product:'fellbueschel',
      names:['Puderzucker','Hopsi','Wattebausch','Schneeschuh','Firn'],fact:'Schneehasen haben grosse, behaarte Pfoten – wie eingebaute Schneeschuhe.',
      a:{col:'#FFFFFF',belly:'#FFFFFF',body:[.34,.32,.42],head:{r:.27,p:[0,.62,.34]},snout:{type:'dot',nose:'#FF8FA3'},ears:{type:'long',len:.5,x:.35,y:.75,tilt:.18,col:'#FFFFFF',inner:'#E8EEFA'},legs:{n:4,len:.12,r:.08,foot:'#FFFFFF'},tail:{type:'puff',col:'#FFFFFF',r:.12},gait:'hop'}},
    rentier:{n:'Rentier',planet:'frost',biomes:['tannenwald','schneefeld'],count:3,herd:true,size:1.35,speed:.9,voice:['grunz','schnaub','hmmh'],pitch:190,likes:['kiefernzapfen','unkraut','beeren'],product:'kiefernzapfen',
      names:['Rudi','Ronja','Blitzen','Moosi','Tundra'],fact:'Bei Rentieren tragen auch die Weibchen ein Geweih. Es fällt jedes Jahr ab und wächst neu.',
      a:{col:'#A07A5A',belly:'#F2E2CC',body:[.36,.3,.56],head:{r:.24,p:[0,.95,.6]},snout:{type:'muzzle',col:'#C9A07A',nose:'#E8505B',len:1},ears:{type:'pointy',len:.3,x:.7,y:.4,tilt:.9},antlers:'#E8D2A8',legs:{n:4,len:.42,r:.06,foot:'#5B4A3E'},tail:{type:'puff',col:'#FFFDF7',r:.09},extra:{mane:'#F2E2CC'}}},
    seehund:{n:'Sattelrobbe',planet:'frost',water:true,shore:true,count:2,size:.9,speed:.6,gait:'slither',voice:['örk','ouh'],pitch:250,likes:['eiskristall','muschel'],product:'seeglas',
      names:['Knautschi','Eisbein','Plumps','Bärbel'],fact:'Robbenbabys der Sattelrobbe sind schneeweiss – so sind sie auf dem Eis gut getarnt.',
      a:{col:'#FFFFFF',belly:'#F4F8FF',body:[.4,.3,.6],by:.28,head:{r:.28,p:[0,.62,.5]},snout:{type:'muzzle',col:'#F4F8FF',len:.6},eyes:{r:.1},ears:{type:'none'},legs:{n:0},flippers:{col:'#E4ECFA',s:1.1,up:.3,back:true},tail:{type:'none'},gait:'slither'}},
    /* --- Dünen-Planet --- */
    kamel:{n:'Kamel',planet:'wueste',biomes:['duenen','kakteenfeld','oase'],count:3,herd:true,size:1.6,speed:.7,voice:['blöök','hrrm','gnarf'],pitch:170,likes:['kaktusfrucht','unkraut','kokosnuss'],product:'kaktusfrucht',
      names:['Karawane','Hubert Höcker','Dattel','Sahara','Oase Olli'],fact:'Im Höcker speichert das Kamel Fett, nicht Wasser. Trinken kann es aber über 100 Liter auf einmal.',
      a:{col:'#E0B07A',belly:'#F4D8B0',body:[.34,.3,.56],head:{r:.2,p:[0,1.25,.75]},snout:{type:'muzzle',col:'#F4D8B0',len:1.1},ears:{type:'round',x:.7,y:.5},legs:{n:4,len:.5,r:.06,foot:'#C9965E'},tail:{type:'long',len:.7,curl:-.6,tip:'#8A5A44'},extra:{hump:2,mane:'#C9965E'},brows:'#8A5A44'}},
    fennek:{n:'Fennek',planet:'wueste',biomes:['duenen','canyon'],count:3,size:.6,speed:1.7,gait:'fast',shy:true,night:true,voice:['wiff','kiek','hihi'],pitch:480,likes:['kaktusfrucht','beeren'],product:'wuestenrose',
      names:['Lauscher','Sandy','Fenni','Mondohr','Düne'],fact:'Der Fennek hat riesige Ohren: Sie geben Wärme ab und hören Beutetiere sogar unter dem Sand.',
      a:{col:'#F2CFA0',belly:'#FFF1DC',body:[.3,.26,.44],head:{r:.24,p:[0,.55,.42]},snout:{type:'long',col:'#FFF1DC',nose:'#2E2A3E'},ears:{type:'pointy',len:.95,w:1.5,x:.55,y:.6,tilt:.45,inner:'#FFD2B8'},legs:{n:4,len:.18,r:.05,foot:'#E8B888'},tail:{type:'bushy',len:1.1,tip:'#8A5A44'}}},
    erdmaennchen:{n:'Erdmännchen',planet:'wueste',biomes:['kakteenfeld','duenen','canyon'],count:5,herd:true,size:.62,speed:1.3,gait:'fast',voice:['tschirp','piep piep','wach!'],pitch:540,likes:['kaktusfrucht','beeren','champignon'],product:'wuestenrose',
      names:['Wache Willi','Buddel','Sandra','Späher','Timo'],fact:'Erdmännchen stellen Wachen auf: Eines passt auf und warnt die Gruppe mit verschiedenen Rufen für Adler oder Schlangen.',
      a:{col:'#D8B088',belly:'#F4E2C8',body:[.24,.42,.26],by:.5,head:{r:.21,p:[0,1.0,.1]},snout:{type:'long',col:'#E8C8A0',nose:'#3B3450'},ears:{type:'nub',x:.7,y:.3},eyes:{r:.085},legs:{n:2,len:.1,r:.06,foot:'#B8906A'},flippers:{col:'#D8B088',s:.6,up:.8},tail:{type:'long',len:.8,curl:.2,tip:'#3B3450'},stripes:{col:'#B8906A',n:3}}},
    springmaus:{n:'Wüstenspringmaus',planet:'wueste',biomes:['duenen','oase','kakteenfeld'],count:4,size:.45,speed:2,gait:'hop',shy:true,night:true,voice:['piep','hüpf'],pitch:650,likes:['kaktusfrucht','unkraut'],product:'sandfeder',
      names:['Känguruh-Kurt','Hopser','Mini','Sprungfeder','Dattelchen'],fact:'Wüstenspringmäuse hüpfen auf zwei langen Hinterbeinen – wie kleine Kängurus – bis zu drei Meter weit.',
      a:{col:'#F2D2A8',belly:'#FFF6E8',body:[.26,.26,.3],head:{r:.26,p:[0,.55,.2]},snout:{type:'dot',nose:'#FF8FA3'},ears:{type:'long',len:.5,x:.45,y:.7,w:1.2,inner:'#FFD2C2'},eyes:{r:.1},legs:{n:2,len:.22,r:.05,foot:'#FFF6E8'},tail:{type:'long',len:1.4,curl:.4,r:.025,tip:'#3B3450'},gait:'hop'}},
    echse:{n:'Dornteufel',planet:'wueste',biomes:['canyon','duenen'],count:3,size:.6,speed:1.2,voice:['zisch','tss'],pitch:300,likes:['kaktusfrucht','beeren'],product:'wuestenrose',
      names:['Dorni','Stachelbeere','Rinne','Tautropfen'],fact:'Der Dornteufel sammelt Tau mit seiner Haut und leitet ihn durch feine Rillen bis zum Maul.',
      a:{col:'#E89A5A',belly:'#F4C890',body:[.3,.16,.46],by:.22,head:{r:.19,p:[0,.3,.5],sc:[1,.8,1.2]},snout:{type:'dot',nose:'#B86A3A'},ears:{type:'none'},legs:{n:4,len:.12,r:.05,foot:'#C97A48'},tail:{type:'lizard',r:.06},extra:{spikes:'#C96A3A'},spots:{col:'#B85A3A',n:5}}},
    /* --- Sporen-Mond --- */
    leuchtschnecke:{n:'Leuchtschnecke',planet:'pilz',biomes:['pilzwald','sporensumpf','moorwiese'],count:5,size:.6,speed:.25,gait:'slither',voice:['schlürf','mmm'],pitch:260,likes:['champignon','leuchtspore','fliegenpilz_item'],product:'glitzerschleim',
      names:['Glibber','Schleimi','Lampion','Sachte Susi','Fühli'],fact:'Manche Pilze, Schnecken und Tiefseetiere leuchten selbst – das nennt man Biolumineszenz.',
      a:{col:'#8FE8C8',belly:'#C8FFE8',body:[.22,.16,.55],by:.14,head:{r:.19,p:[0,.3,.46]},snout:{type:'none'},ears:{type:'none'},feelers:true,glowTips:'#7FFFD4',legs:{n:0},tail:{type:'none'},extra:{snailShell:'#C6A9FF',glow:'#7FFFD4'},gait:'slither'}},
    moorfrosch:{n:'Moorfrosch',planet:'pilz',biomes:['sporensumpf','moorwiese'],nearWater:true,count:4,size:.5,speed:1.3,gait:'hop',voice:['quaak','blubb'],pitch:220,likes:['leuchtspore','champignon'],product:'leuchtspore',
      names:['Himmelblau','Quabbel','Moorle','Sporling','Blubbi'],fact:'Moorfrösche färben sich in der Paarungszeit für ein paar Tage himmelblau!',
      a:{col:'#7FB8F0',belly:'#E0F0FF',body:[.4,.26,.38],head:{r:.3,p:[0,.42,.24],sc:[1.2,.8,1]},snout:{type:'wide'},eyes:{r:.1,x:.5,y:.55},ears:{type:'none'},legs:{n:4,len:.1,r:.08,foot:'#6AA0E0'},tail:{type:'none'},spots:{col:'#5A88D0',n:5},gait:'hop'}},
    pilzling:{n:'Pilzling',planet:'pilz',biomes:['pilzwald','moorwiese'],count:5,herd:true,size:.6,speed:.9,gait:'waddle',voice:['pöff','sporli','hihi'],pitch:480,likes:['champignon','morchel','leuchtspore'],product:'champignon',
      names:['Hutzel','Lamelle','Sporinchen','Fliegi','Morchelmax'],fact:'Pilze sind weder Pflanzen noch Tiere – sie bilden ein eigenes Reich. Unter der Erde verbindet ihr Geflecht ganze Wälder.',
      a:{col:'#FFF1DA',belly:'#FFFBF0',body:[.24,.28,.22],by:.36,head:{r:.26,p:[0,.78,0]},snout:{type:'dot',nose:'#FF8FA3'},ears:{type:'none'},cap:'#E8505B',legs:{n:2,len:.1,r:.07,foot:'#F2E2C8'},flippers:{col:'#FFF1DA',s:.5,up:.9},tail:{type:'none'},gait:'waddle'}},
    axolotl:{n:'Axolotl',planet:'pilz',water:true,count:3,size:.6,speed:.8,voice:['blubb','hihi','blob'],pitch:500,likes:['champignon','leuchtspore'],product:'leuchtspore',
      names:['Axel','Lotti','Kiemchen','Rosa','Nachwachs-Nele'],fact:'Axolotl können verlorene Beine – sogar Teile von Herz und Gehirn – einfach nachwachsen lassen.',
      a:{col:'#FFB8D8',belly:'#FFE0EE',body:[.24,.18,.5],by:.16,head:{r:.26,p:[0,.24,.5],sc:[1.25,.85,1]},snout:{type:'wide'},ears:{type:'none'},gills:'#FF6FA8',legs:{n:4,len:.08,r:.045},tail:{type:'lizard',r:.07},gait:'slither'}},
    maulwurf:{n:'Maulwurf',planet:'pilz',biomes:['moorwiese','pilzwald'],count:3,size:.6,speed:.8,voice:['buddel','schnüff','hm?'],pitch:230,likes:['champignon','morchel','unkraut'],product:'kiesel',
      names:['Buddelbert','Grabowski','Samtpfote','Tunnel-Toni'],fact:'Ein Maulwurf gräbt bis zu 20 Meter Tunnel an einem einzigen Tag.',
      a:{col:'#5B4A6E',belly:'#7A688E',body:[.36,.28,.44],head:{r:.24,p:[0,.36,.42]},snout:{type:'long',col:'#FF9EB8',nose:'#FF6F98'},eyes:{r:.045},ears:{type:'none'},legs:{n:0},flippers:{col:'#FFB8C8',s:.8,up:.1},tail:{type:'puff',r:.06},extra:{}}}
  };

  /* ================= Welt-Instanzen ================= */
  let animals=[],companion=null,game=null,M_=M;const V_=()=>GAME.G;
  const st=()=>{if(!SAVE.animals)SAVE.animals={};if(!SAVE.faunaSeen)SAVE.faunaSeen={};return SAVE.animals};
  const isNight=()=>{const h=GAMETIME.hour();return h<6||h>=20};
  function nameOf(a){return(st()[a.id]&&st()[a.id].name)||a.dn}
  function frOf(a){return(st()[a.id]&&st()[a.id].fr)||0}
  function rec(a){const s=st();return s[a.id]||(s[a.id]={fr:0})}
  function okAt(sp,p){const G_=V_();const h=G_.hAt(p);if(sp.water)return h<G_.sea-.25&&h>G_.sea-1.4;if(sp.fly)return h>G_.sea+.1;
    if(h<G_.sea+.08)return false;if(sp.shore&&h<G_.sea+.6)return true;if(sp.nearWater&&h<G_.sea+.7)return true;const b=G_.biomeAt(p,h);return!sp.biomes||sp.biomes.includes(b)}
  function findSpot(sp,r,near,rad){for(let i=0;i<260;i++){let p;if(near){const t=GAME.tangentTo(near,new V().randomDirection());p=near.clone().applyAxisAngle(new V().crossVectors(near,t).normalize(),r()*rad/V_().R)}else p=V_().stream&&GAME.randAround?GAME.randAround(r,130):new V(r()*2-1,r()*2-1,r()*2-1).normalize();
      if(!isFinite(p.x))continue;if(GAME.nearPlace&&GAME.nearPlace(p,1.1))continue;if(!okAt(sp,p))continue;if(!sp.water&&!sp.fly&&GAME.obstAround(p,1).some(o=>o.p.angleTo(p)*V_().R<o.r+.3))continue;return p}return null}
  function clear(){for(const a of animals){a.g.parent&&a.g.parent.remove(a.g);a.shadow.parent&&a.shadow.parent.remove(a.shadow);disposeTree(a.g);a.lbl.remove()}animals=[];companion=null;game=null}
  const shadowMat=()=>new THREE.MeshBasicMaterial({map:ctex('blob',128,128,(x,w,h)=>{const gr=x.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(60,40,90,.35)');gr.addColorStop(1,'rgba(60,40,90,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)}),transparent:true,depthWrite:false});
  function spawn(pid){clear();const r=srand(hashStr('fauna'+pid).length*977+7);let idx=0;
    for(const[key,sp]of Object.entries(S)){if(sp.planet!==pid)continue;let leader=null;
      for(let i=0;i<sp.count;i++){const p=sp.herd&&leader?findSpot(sp,r,leader,5)||findSpot(sp,r):findSpot(sp,r);if(!p)continue;if(!leader)leader=p;
        mk(key,sp,p,pid+'-'+key+'-'+i,sp.names[(i+idx)%sp.names.length],r())}idx++}
    /* Haustier aus der Tierhandlung: kommt auf jeden Planeten mit */
    if(SAVE.pet&&S[SAVE.pet.key]&&GAME.me){const sp=S[SAVE.pet.key];const t=GAME.tangentTo(GAME.me.p,new V(1,0,0));const p=GAME.me.p.clone().addScaledVector(t,1.5/V_().R).normalize();const a=mk(SAVE.pet.key,Object.assign({},sp,{shy:false,water:false,biomes:null}),p,'pet-'+SAVE.pet.key,SAVE.pet.name,.5);a.isPet=true;companion=a}}
  function mk(key,sp,p,id,dn,ph){const g=new THREE.Group();QF=HIGH?.5:.34;const inner=buildAnimal(sp.a,M_);QF=1;addOutlines(inner);try{mergeCreature(inner,[])}catch(e){}inner.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=false}});
    inner.scale.setScalar(sp.size*.62);g.add(inner);V_().scene.add(g);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(.45*sp.size,16),shadowMat());V_().scene.add(shadow);
    const lbl=el('div','lbl animal');lbl.style.display='none';$('labels').append(lbl);
    const a={id,key,sp,g,inner,shadow,lbl,p:p.clone(),home:p.clone(),dir:GAME.tangentTo(p,new V().randomDirection()),speed:0,goal:null,idle:1+ph*4,mode:'',modeT:0,phase:ph*10,dn,fly:!!sp.fly,alt:0,flee:0,talking:false,heart:0};
    lbl.textContent=nameOf(a);animals.push(a);return a}
  /* Bewegung auf der Kugel */
  function move(a,spd,dt){const G_=V_();const ang=spd*dt/G_.R;const ax=new V().crossVectors(a.p,a.dir).normalize();if(!isFinite(ax.x))return false;const np=a.p.clone().applyAxisAngle(ax,ang).normalize();
    if(!okAt(a.sp,np)&&!(a.mode==='follow'&&!a.sp.water))return false;
    if(!a.sp.water&&!a.fly){for(const o of GAME.obstAround(np,1.5)){if(o.p.angleTo(np)*G_.R<o.r+.25*a.sp.size)return false}}
    a.dir.applyAxisAngle(ax,ang);a.dir.copy(GAME.tangentTo(np,a.dir));a.p.copy(np);return true}
  function steer(a,target,dt,k){const want=GAME.tangentTo(a.p,target.clone().sub(a.p));if(isFinite(want.x)){a.dir.lerp(want,Math.min(1,dt*(k||4))).normalize();a.dir.copy(GAME.tangentTo(a.p,a.dir))}}
  function step(dt,t){const me=GAME.me;if(!me||!animals.length)return;const G_=V_();const night=isNight();const meRun=me.speed>5;const dancing=me.dance>0||me.emote==='tanzen';
    for(const a of animals){const d=a.p.angleTo(me.p)*G_.R;a.modeT=Math.max(0,a.modeT-dt);a.heart=Math.max(0,a.heart-dt);
      const far=d>(HIGH?38:28);a.g.visible=!far;a.shadow.visible=!far&&!a.fly;if(far&&a!==companion)continue;
      let spd=0,target=null,mode=a.modeT>0?a.mode:'';
      if(a.talking){spd=0;mode=a.mode==='happy'&&a.modeT>0?'happy':'';steer(a,me.p,dt,6)}
      else if(game&&game.a===a){/* Fangen: weglaufen, Haken schlagen */const away=a.p.clone().sub(me.p);const want=GAME.tangentTo(a.p,away).applyAxisAngle(a.p,Math.sin(t*2.3+a.phase)*.9);a.dir.lerp(want,Math.min(1,dt*3)).normalize();a.dir.copy(GAME.tangentTo(a.p,a.dir));
        spd=Math.max(2.6,a.sp.speed*2.4)*(d<3?1.25:.9);if(!move(a,spd,dt)){a.dir.applyAxisAngle(a.p,1.6+Math.random())}}
      else if(a===companion){if(d>2.2){target=me.p;spd=Math.min(me.speed>0?me.speed*1.05:3,Math.max(2,d*1.3))}if(d>30){const t2=GAME.tangentTo(me.p,new V().randomDirection());a.p.copy(me.p).addScaledVector(t2,1.5/G_.R).normalize()}if(dancing)mode='happy'}
      else{
        const sleepy=!a.sp.fly&&(a.sp.night?!night:night)&&!a.sp.water;
        if(dancing&&d<7){mode='happy';spd=0;steer(a,me.p,dt,3)}
        else if(a.sp.shy&&frOf(a)<3&&meRun&&d<4.5){a.flee=2.5}
        if(a.flee>0){a.flee-=dt;const away=GAME.tangentTo(a.p,a.p.clone().sub(me.p));if(isFinite(away.x))a.dir.lerp(away,Math.min(1,dt*6)).normalize();spd=a.sp.speed*3.2;if(!move(a,spd,dt))a.dir.applyAxisAngle(a.p,1.5);spd=spd}
        else if(mode!=='happy'){
          if(sleepy&&a.mode!=='sleep'&&Math.random()<dt*.2){a.mode='sleep';a.modeT=40+Math.random()*40}
          if(a.mode==='sleep'&&a.modeT>0){mode='sleep';if(d<1.4&&meRun){a.modeT=0;a.flee=a.sp.shy?1.5:0}}
          else{if(a.goal){target=a.goal;if(a.p.angleTo(target)*G_.R<.5){a.goal=null;target=null;a.idle=2+Math.random()*5;if(Math.random()<.5){a.mode=a.fly?'':'eat';a.modeT=2+Math.random()*3}}}
            else{a.idle-=dt;if(a.idle<=0){const h=a.sp.herd?animals.find(x=>x.key===a.key)||a:a;const base=h===a?a.home:h.p;a.goal=findSpot(a.sp,Math.random,base,a.fly?8:5)||null;a.idle=3}}
            spd=target?a.sp.speed*(a.fly?1.6:1):0}}}
      if(target&&spd>0){steer(a,target,dt);if(!move(a,spd,dt)){a.dir.applyAxisAngle(a.p,1.2+Math.random());if(a!==companion)a.goal=null}}
      a.speed=spd;pose(a,dt,t,mode);if(a.heart<=0&&a.hearted){a.hearted=false}}
    /* Fangen-Spiel */
    if(game){game.t-=dt;const d=game.a.p.angleTo(me.p)*G_.R;if(d<1.1){const a=game.a;game=null;win(a)}else if(game.t<=0){const a=game.a;game=null;GAME.say&&0;UI.toast(nameOf(a)+' war zu schnell! Versuch es nochmal.');say(a,'hihi!')}else if(Math.floor(game.t)!==game.last){game.last=Math.floor(game.t);$('actionPrompt')&&0;UI.toast('Fang '+nameOf(game.a)+'! Noch '+game.last+' s',900)}}
    labels()}
  function pose(a,dt,t,mode){const G_=V_();const h=G_.hAt(a.p);let base=a.sp.water?G_.sea-.12*a.sp.size:Math.max(h,a.fly?h:h);
    if(a.fly){const flying=a.speed>0||a.goal;a.alt+=((flying?1.4+Math.sin(t*1.3+a.phase)*.35:0)-a.alt)*Math.min(1,dt*2);base=Math.max(h,G_.sea)+a.alt}
    a.g.position.copy(a.p).multiplyScalar(G_.R+base);a.g.up.copy(a.p);a.g.lookAt(a.g.position.clone().add(a.dir));
    if(a.sp.water)a.g.position.addScaledVector(a.p,Math.sin(t*1.8+a.phase)*.04);
    a.shadow.position.copy(a.p).multiplyScalar(G_.R+Math.max(h,G_.sea)+.03);a.shadow.quaternion.setFromUnitVectors(new V(0,0,1),a.p);
    const near=a.p.angleTo(GAME.me.p)*G_.R<14;if(near||((t*10|0)%3===0))a.inner.userData.tick(t+a.phase,a.speed>.05,a.fly&&a.alt>.3?1:0,mode)}
  function say(a,txt,sec){a.bub=a.bub||(()=>{const b=el('div','bubble');b.hidden=true;$('labels').append(b);return b})();a.bub.textContent=txt;a.bub.hidden=false;a.sayT=sec||2.2}
  const tV=new V();function labels(){const cam=GAME.cam,canvas=$('world').querySelector('canvas')||document.querySelector('#world canvas');if(!canvas)return;const w=canvas.clientWidth,h=canvas.clientHeight;const me=GAME.me;
    for(const a of animals){const near=a.g.visible&&me&&a.p.angleTo(me.p)*V_().R<9;if(a.sayT>0){a.sayT-=1/60;if(a.sayT<=0&&a.bub)a.bub.hidden=true}
      if(!near){a.lbl.style.display='none';if(a.bub)a.bub.style.display='none';continue}tV.copy(a.g.position).addScaledVector(a.p,.9*a.sp.size+.35).project(cam);if(tV.z>1){a.lbl.style.display='none';continue}
      const x=(tV.x*.5+.5)*w,y=(-tV.y*.5+.5)*h;a.lbl.style.display='';a.lbl.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;a.lbl.textContent=nameOf(a)+(frOf(a)>0?' '+'♥'.repeat(Math.min(5,Math.ceil(frOf(a)/2))):'');
      if(a.bub){a.bub.style.display='';a.bub.style.transform=`translate(${x}px,${y-22}px) translate(-50%,-100%)`}}}
  /* ================= Begegnung ================= */
  function targets(){const me=GAME.me;if(!me)return[];const out=[];for(const a of animals){if(!a.g.visible||a.fly&&a.alt>1)continue;const d=a.p.angleTo(me.p)*V_().R;if(d<3)out.push({kind:'animal',p:a.p,r:1.6+a.sp.size*.5,label:nameOf(a)+' ('+a.sp.n+')',prio:-.4,act:()=>meet(a)})}return out}
  function tagCol(a){const c=new THREE.Color(a.sp.a.col);const h={};c.getHSL(h);c.setHSL(h.h,Math.min(.75,h.s),Math.min(h.l,.5));return'#'+c.getHexString()}
  function voice(a){return{pitch:a.sp.pitch,speed:1.15,kind:''}}
  function sound(a){const v=pick(a.sp.voice);SND.voice&&SND.voice(v,{pitch:a.sp.pitch,speed:1.2});return v}
  function heartsLine(a){const f=frOf(a);return'♥'.repeat(Math.min(5,Math.ceil(f/2)))+'♡'.repeat(Math.max(0,5-Math.ceil(f/2)))}
  async function meet(a){if(a.talking)return;const me=GAME.me;a.talking=true;a.goal=null;a.flee=0;if(a.mode==='sleep'&&a.modeT>0){a.mode='';a.modeT=0;say(a,'…gähn?')}
    me.dir.copy(GAME.tangentTo(me.p,a.p.clone().sub(me.p)));SAVE.faunaSeen[a.key]=true;const first=!rec(a).met;rec(a).met=true;persist();
    const v=sound(a);const moodL=a.sp.shy&&frOf(a)<2?`*${a.sp.n} beäugt dich vorsichtig*`:frOf(a)>=6?`*${a.sp.n} freut sich riesig, dich zu sehen!*`:`*${a.sp.n} schaut dich neugierig an*`;
    const lines=[`${v}! ${moodL}`];if(first)lines.push(`Neu im Tierlexikon: ${a.sp.n}! ${a.sp.fact}`);lines.push('Freundschaft: '+heartsLine(a));
    const isComp=companion===a;const choices=['Streicheln','Füttern','Fangen spielen',isComp?'Hier bleiben':'Mitkommen?','Namen geben','Tschüss'];
    SND.duck(3,.5);const ch=await UI.talk(nameOf(a)+' · '+a.sp.n,lines,{voice:voice(a),color:tagCol(a),choices});
    if(ch===0)await pet(a);else if(ch===1)await feed(a);else if(ch===2)startGame(a);else if(ch===3){if(isComp){companion=null;a.home.copy(a.p);UI.toast(nameOf(a)+' bleibt hier. Tschüss!');a.mode='';}else if(a.sp.water){UI.toast(nameOf(a)+' kann nicht an Land mitkommen – aber winkt dir zu!')}else if(frOf(a)<2&&a.sp.shy){UI.toast(nameOf(a)+' kennt dich noch zu wenig. Streicheln und Füttern hilft!')}else{companion=a;UI.toast(nameOf(a)+' kommt jetzt mit dir mit!');SND.jingle('j_success');GAME.W.fx(a.p,'herz',6)}}
    else if(ch===4)nameIt(a);
    a.talking=false}
  function bump(a,n){const r=rec(a);r.fr=Math.min(10,(r.fr||0)+n);persist()}
  function happy(a,sec){a.mode='happy';a.modeT=sec||2.2;a.heart=sec||2.2;GAME.W.fx(a.p,'herz',6)}
  async function giveProduct(a,chance){if(Math.random()>(chance??(a.sp.productChance||.45)))return;const id=a.sp.product;const it=ITEMS.find(i=>i.id===id);if(!it)return;
    if(bagAdd('item',id)){SND.play('pickup');await UI.talk(nameOf(a),[`${sound(a)}! *${nameOf(a)} schenkt dir etwas*`,`(Du bekommst: ${it.n})`],{voice:voice(a)})}}
  async function pet(a){const r=rec(a);const day=Math.floor(Date.now()/864e5);SND.play('cloth',{vol:.6});happy(a,2.6);sound(a);GAME.me.act=1;
    if(r.pet!==day){r.pet=day;bump(a,1);UI.toast(nameOf(a)+' mag das! Freundschaft +1');if(frOf(a)>=3)await giveProduct(a,.35)}else UI.toast(nameOf(a)+' kuschelt sich an dich.');SAVE.stats.pets=(SAVE.stats.pets||0)+1;persist()}
  async function feed(a){const foods=SAVE.bag.filter(x=>x.kind==='item'&&(FOODS.includes(x.id)||a.sp.likes.includes(x.id)));
    if(!foods.length){await UI.talk(nameOf(a),[`${sound(a)}? *schnuppert an deiner Tasche*`,`Du hast nichts, was ${a.sp.n==='Kamel'?'einem Kamel':a.sp.n+'s'} schmeckt. Lieblingsessen: ${a.sp.likes.map(id=>itemName('item',id)).join(', ')}.`],{voice:voice(a)});return}
    const w=UI.win('Was gibst du '+nameOf(a)+'?',{size:'narrow'});const gr=el('div','grid');
    await new Promise(res=>{foods.forEach(it=>{const c=el('button','card');c.type='button';const fav=a.sp.likes.includes(it.id);c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)+(fav?' ★':'')),el('span','sub','×'+it.n));
      c.onclick=async()=>{w.close();bagTake('item',it.id,1);a.mode='eat';a.modeT=2.2;SND.play('soft',{vol:.8});await new Promise(r=>setTimeout(r,1200));
        if(fav){happy(a,3);bump(a,2);SND.jingle('j_success');await UI.talk(nameOf(a),[`${sound(a)}!! *${nameOf(a)} liebt ${itemName('item',it.id)}!*`,'Freundschaft +2'],{voice:voice(a)});await giveProduct(a)}
        else{happy(a,1.5);bump(a,1);await UI.talk(nameOf(a),[`${sound(a)}. *mampf mampf*`,'Freundschaft +1'],{voice:voice(a)});await giveProduct(a,.2)}res()};gr.append(c)});
      w.body.append(el('p','sub','★ = Lieblingsessen'),gr);const iv=setInterval(()=>{if(w.closed){clearInterval(iv);setTimeout(res,50)}},250)})}
  function startGame(a){if(a.sp.water){UI.toast(nameOf(a)+' spielt lieber Wasserspritzen! *platsch*');happy(a,2);GAME.W.fx(a.p,'blase',10);bump(a,1);return}
    game={a,t:20,last:21};sound(a);say(a,'Fang mich!',2);UI.toast('Fangen! Lauf mit Shift hinter '+nameOf(a)+' her!')}
  async function win(a){happy(a,3);bump(a,2);SND.jingle('j_success');const amt=15+frOf(a)*4;money(amt);SAVE.stats.tag=(SAVE.stats.tag||0)+1;persist();
    await UI.talk(nameOf(a),[`${sound(a)}! *${nameOf(a)} lacht und rollt sich im Gras*`,`Gefangen! Freundschaft +2 und ${amt} Taler.`],{voice:voice(a)})}
  function nameIt(a){const w=UI.win('Wie soll '+a.sp.n+' heissen?',{size:'narrow'});const inp=el('input');inp.maxLength=18;inp.value=nameOf(a);inp.style.cssText='width:100%;font:inherit;padding:10px;border-radius:12px;border:2px solid var(--line,#e6d8b8)';
    w.body.append(el('p',null,'Gib dem Tier einen Namen. Er bleibt gespeichert.'),inp);const ok=btn('Speichern','primary',()=>{const v=sanitizeName(inp.value);if(v){rec(a).name=v;persist();UI.toast(a.sp.n+' heisst jetzt '+v+'!');happy(a,2)}w.close()});w.foot.append(ok);setTimeout(()=>inp.focus(),50)}
  function sanitizeName(s){return String(s||'').replace(/[<>]/g,'').trim().slice(0,18)}
  /* ================= Tierlexikon ================= */
  function lexikon(){const w=UI.win('Tierlexikon',{size:'wide'});const seen=SAVE.faunaSeen||{};const all=Object.entries(S);const n=all.filter(([k])=>seen[k]).length;
    w.body.append(el('p',null,`Du hast ${n} von ${all.length} Tierarten getroffen. Donna Haraway nennt Tiere, mit denen wir zusammenleben, „companion species“ – Gefährt:innen. Wir werden nicht allein, sondern immer mit anderen.`));
    for(const pid of Object.keys(PLANETS)){const list=all.filter(([,s])=>s.planet===pid);if(!list.length)continue;w.body.append(el('h3',null,PLANETS[pid].n));const gr=el('div','grid');
      for(const[k,s]of list){const c=el('div','card');const img=animalThumb(k);if(seen[k]){c.append(img,el('b',null,s.n),el('span','sub',s.fact))}else{img.classList.add('silhouette');c.classList.add('unknown');c.append(img,el('b',null,'Unbekannt'),el('span','sub',(s.night?'Nachts':'Tagsüber')+' · '+((BIOMES[(s.biomes||[])[0]]||{}).n||'irgendwo')))}gr.append(c)}w.body.append(gr)}}
  function animalThumb(k){const s=S[k];return UI.objThumb('tier-'+k,(g,m)=>{const a=buildAnimal(s.a,m);a.userData.tick(1.3,false,0,'');g.add(a)})}
  function onPlanet(pid){try{spawn(pid)}catch(e){console.warn('Fauna',e)}}
  function list(){return animals}
  return{S,buildAnimal,spawn,onPlanet,step,targets,lexikon,list,animalThumb,get companion(){return companion},clear}
})();
