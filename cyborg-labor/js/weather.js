/* =====================================================================
   CYBORG-LABOR · weather.js
   Wetter, das sich ändert (wie in No Man's Sky / Animal Crossing):
   jeder Planet hat eigene Wetterlagen, die alle paar Minuten weich
   ineinander übergehen – Regen, Gewitter mit Blitzen, Nebel, Schnee-
   sturm, Sandsturm, Sporenregen, Funkenflug, Polarlicht. Dazu flauschige
   Wolkenschichten, die sich mit dem Wetter verdunkeln, und Ringe und
   Monde am Himmel.
   ===================================================================== */
const WEATHER=(()=>{
  const V=THREE.Vector3;
  /* Wetterlagen: Partikel (Art, Farbe, Grösse, Fall, Wind, Menge), Nebel, Licht, Wolkendichte/-farbe */
  const K={
    klar:{n:'Klar',p:null,fog:1,sun:1,clouds:.45,cc:'#ffffff'},
    heiter:{n:'Heiter',p:'blueten',fog:1,sun:1,clouds:.6,cc:'#ffffff'},
    regen:{n:'Regen',p:'regen',fog:.62,sun:.55,clouds:1,cc:'#9AA3BE',wet:1},
    gewitter:{n:'Gewitter',p:'regen',amt:1.4,fog:.48,sun:.35,clouds:1.2,cc:'#6E7494',wet:1,flash:1},
    nebel:{n:'Nebel',p:null,fog:.26,sun:.7,clouds:.7,cc:'#E4E4F0'},
    schnee:{n:'Schneefall',p:'schnee',fog:.6,sun:.75,clouds:.95,cc:'#E6ECF8'},
    sturm:{n:'Schneesturm',p:'schnee',amt:1.8,wind:6,fog:.3,sun:.55,clouds:1.2,cc:'#C8D0E4'},
    polar:{n:'Polarlicht',p:null,fog:1,sun:.9,clouds:.3,cc:'#ffffff',aurora:1},
    sand:{n:'Sandsturm',p:'sand',amt:2,wind:7,fog:.28,sun:.7,clouds:.6,cc:'#F2D4A8'},
    hitze:{n:'Hitze',p:null,fog:.85,sun:1.15,clouds:.15,cc:'#ffffff',haze:1},
    sporen:{n:'Sporenregen',p:'sporen',amt:1.5,fog:.55,sun:.7,clouds:.9,cc:'#C8A8E8'},
    funken:{n:'Funkenflug',p:'funken',fog:.9,sun:.95,clouds:.5,cc:'#D8D0E8'},
    saeure:{n:'Ölregen',p:'regen',fog:.5,sun:.55,clouds:1.1,cc:'#8A849E',wet:1,tint:'#9FE8C8'},
    blasen:{n:'Blasenregen',p:'blasen',amt:1.3,fog:.8,sun:.9,clouds:.7,cc:'#E8FAFF'}};
  const PLAN={kompost:[['klar',3],['heiter',2],['regen',2],['gewitter',1],['nebel',1]],schrott:[['klar',2],['funken',2],['saeure',2],['nebel',1],['gewitter',1]],
    korallen:[['klar',3],['blasen',2],['regen',2],['gewitter',1]],frost:[['klar',2],['schnee',3],['sturm',1],['polar',2],['nebel',1]],
    wueste:[['klar',2],['hitze',3],['sand',2],['regen',.5]],pilz:[['sporen',3],['nebel',2],['klar',1],['regen',1]]};
  let W=null;
  function pickNext(pid,cur){const L=PT(PLAN,pid);let tot=0;for(const[k,w]of L)if(k!==cur)tot+=w;let r=Math.random()*tot;for(const[k,w]of L){if(k===cur)continue;r-=w;if(r<=0)return k}return L[0][0]}
  /* Partikel-Stile */
  const PS={regen:{col:'#CFE2FF',size:.16,fall:-9,side:.3,tex:'streak',n:900},schnee:{col:'#ffffff',size:.2,fall:-1.3,side:.6,tex:'dot',n:900},sand:{col:'#F2CFA0',size:.12,fall:-.3,side:2,tex:'dot',n:1100},
    sporen:{col:'#B8FFE8',size:.16,fall:-.5,side:.5,tex:'dot',n:700,add:1},funken:{col:'#FFE27A',size:.13,fall:.7,side:.4,tex:'dot',n:500,add:1},blasen:{col:'#E8FAFF',size:.2,fall:.9,side:.3,tex:'ring',n:500},
    blueten:{col:'#FFB8D8',size:.16,fall:-.7,side:1,tex:'dot',n:350}};
  const tex=k=>ctex('wx-'+k,32,32,(x,w,h)=>{if(k==='streak'){const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.9)');x.fillStyle=g;x.fillRect(14,0,4,h)}
    else if(k==='ring'){x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=2.5;x.beginPath();x.arc(16,16,11,0,TAU);x.stroke();x.fillStyle='rgba(255,255,255,.9)';x.fillRect(10,9,4,4)}
    else{const g=x.createRadialGradient(16,16,1,16,16,15);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}});
  function makePts(k){const s=PS[k];const n=Math.round(s.n*(HIGH?1:.5));const g=new THREE.BufferGeometry();const pos=new Float32Array(n*3);for(let i=0;i<n*3;i++)pos[i]=(Math.random()-.5)*40;g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const m=new THREE.PointsMaterial({color:s.col,size:s.size*(s.tex==='streak'?3:1),map:tex(s.tex),transparent:true,depthWrite:false,opacity:0,blending:s.add?THREE.AdditiveBlending:THREE.NormalBlending});const p=new THREE.Points(g,m);p.frustumCulled=false;p.userData={k,s,n};return p}
  /* Polarlicht: wehende Bänder hoch am Himmel */
  function aurora(){const g=new THREE.Group();const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uA:{value:0}},
      vertexShader:'varying vec2 vU;uniform float uT;void main(){vU=uv;vec3 p=position;p.z+=sin(p.x*.25+uT*.6)*2.5+sin(p.x*.07+uT*.3)*4.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
      fragmentShader:'varying vec2 vU;uniform float uT,uA;void main(){float a=smoothstep(0.,.35,vU.y)*smoothstep(1.,.5,vU.y)*(.6+.4*sin(vU.x*40.+uT*2.));vec3 c=mix(vec3(.3,1.,.6),vec3(.7,.4,1.),vU.y);gl_FragColor=vec4(c*a*uA,a*uA*.8);}'});
    for(let i=0;i<3;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(90,14,80,1),m);mesh.position.set(0,26+i*3,-30+i*14);mesh.rotation.x=-.5;g.add(mesh)}g.userData.m=m;return g}
  /* ---------- Himmel: Ringe und Monde, vom Boden aus sichtbar ---------- */
  function skyBodies(G_){const g=new THREE.Group();const pid=G_.id;const R=G_.R;
    const ringCols=PLANETS[pid].ringCols||{schrott:['#C9D2E6','#8D8AAE'],pilz:['#D6BCFF','#9C7FD6'],wueste:['#F2D6A6','#C9975E']}[pid];
    if(ringCols){const geo=new THREE.RingGeometry(R*1.9,R*3.1,160,6);const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,uniforms:{a:{value:new THREE.Color(ringCols[0])},b:{value:new THREE.Color(ringCols[1])},r0:{value:R*1.9},r1:{value:R*3.1},uN:{value:0}},
        vertexShader:'varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:'uniform vec3 a,b;uniform float r0,r1,uN;varying vec3 vL;float hh(float x){return fract(sin(x*127.1)*43758.5453);}void main(){float t=(length(vL.xy)-r0)/(r1-r0);float bi=floor(t*26.);float n=hh(bi+3.);float al=step(.2,n)*smoothstep(0.,.05,t)*smoothstep(1.,.92,t)*(.45+.4*hh(bi+9.));if(al<.02)discard;vec3 c=mix(a,b,step(.55,n));c*=mix(1.,.55,uN);gl_FragColor=vec4(c,al*(1.-uN*.35));}'});
      const ring=new THREE.Mesh(geo,m);ring.rotation.x=PI/2+1.05;ring.rotation.y=.35;g.add(ring);g.userData.ring=m}
    /* Monde */const nm=PLANETS[pid].moons??{kompost:1,schrott:2,korallen:1,frost:2,wueste:1,pilz:2}[pid]??1;const moons=[];const cols=['#E6DDF2','#F2D8C0','#C8DCF0','#F0C8D8'];
    for(let i=0;i<nm;i++){const r=R*(.12+i*.05);const mg=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(r,32,18),cozy({color:cols[(i+pid.length)%4],rim:.9,rimColor:'#ffffff'}));mg.add(body);
      for(let k=0;k<6;k++){const d=new V().randomDirection();const c=new THREE.Mesh(new THREE.CircleGeometry(r*(.12+Math.random()*.14),14),cozy({color:new THREE.Color(cols[(i+pid.length)%4]).multiplyScalar(.85)}));c.position.copy(d.clone().multiplyScalar(r*1.004));c.lookAt(d.multiplyScalar(r*3));mg.add(c)}
      addOutlines(mg);g.add(mg);moons.push({g:mg,d:R*(3.4+i*1.4),a:i*2.3+1.2,s:.008+i*.004,tilt:1.1+i*.2})}
    g.userData.moons=moons;return g}

  /* ---------- Aufbau und Ablauf ---------- */
  function build(G_){if(W&&W.root)G_.scene.remove(W.root);const root=new THREE.Group();G_.scene.add(root);const pts={};for(const k of Object.keys(PS)){pts[k]=makePts(k);root.add(pts[k])}
    const au=aurora();root.add(au);const sky=skyBodies(G_);G_.scene.add(sky);
    const saved=(SAVE.wx||{})[G_.id];const cur=saved&&saved.until>Date.now()?saved.k:pickNext(G_.id,null);
    W={root,pts,au,sky,cur,prev:cur,blend:1,until:saved&&saved.until>Date.now()?saved.until:Date.now()+(150+Math.random()*180)*1000,flashT:0,nextFlash:4,fog0:[G_.scene.fog.near,G_.scene.fog.far],lastHud:''};hud()}
  function set(k){if(!W||!K[k])return;W.prev=W.cur;W.cur=k;W.blend=0;W.until=Date.now()+(150+Math.random()*180)*1000;SAVE.wx=SAVE.wx||{};SAVE.wx[GAME.G.id]={k,until:W.until};persist();
    UI.toast('Wetter: '+K[k].n,2200);hud()}
  function hud(){const el0=$('clock');if(!el0||!W)return;let s=el0.querySelector('.wx');if(!s){s=document.createElement('small');s.className='wx';el0.append(s)}s.textContent=' · '+K[W.cur].n}
  const lerp=(a,b,t)=>a+(b-a)*t;
  function mix(key){const a=K[W.prev],b=K[W.cur],t=W.blend;return lerp(a[key]??0,b[key]??0,t)}
  function frame(dt,t,G_,me){if(!W||!me)return;if(Date.now()>W.until)set(pickNext(G_.id,W.cur));W.blend=Math.min(1,W.blend+dt/12);
    const cur=K[W.cur],prev=K[W.prev];const base=me.g.position,up=me.p;
    for(const[k,p]of Object.entries(W.pts)){const s=p.userData.s;const want=(cur.p===k?(cur.amt||1):0)*W.blend+(prev.p===k?(prev.amt||1):0)*(1-W.blend);p.material.opacity+=(Math.min(.9,want*.85)-p.material.opacity)*Math.min(1,dt*2);p.visible=p.material.opacity>.01;if(!p.visible)continue;
      const wind=(cur.wind||0)*W.blend;const a=p.geometry.attributes.position;const n=Math.round(p.userData.n*Math.min(1,want));
      for(let i=0;i<p.userData.n;i++){let x=a.getX(i),y=a.getY(i),z=a.getZ(i);if(i>=n){a.setY(i,-99);continue}if(y<-50)y=Math.random()*16-4;y+=s.fall*dt;x+=(Math.sin(t*.7+i)*s.side+wind)*dt;z+=Math.cos(t*.5+i*1.3)*s.side*.5*dt;
        if(y<-4)y+=16;if(y>12)y-=16;if(x>20)x-=40;if(x<-20)x+=40;if(z>20)z-=40;if(z<-20)z+=40;a.setXYZ(i,x,y,z)}a.needsUpdate=true;p.position.copy(base);p.quaternion.setFromUnitVectors(UPV,up)}
    /* Nebel, Licht, Wolken */const f=GAME.overview?1:mix('fog');if(GAME.overview){G_.scene.fog.near=G_.R*6;G_.scene.fog.far=G_.R*12}else{G_.scene.fog.near=W.fog0[0]*f;G_.scene.fog.far=W.fog0[1]*(.35+.65*f)}const sunK=mix('sun');G_.sun.intensity=(G_.sunBase??1)*sunK;G_.hemi.intensity=(G_.hemiBase??.52)*(.75+.25*sunK);
    {const fb=G_.fogBase||G_.scene.fog.color;const k=(cur.tint?W.blend:0)*.55;const kp=(prev.tint?1-W.blend:0)*.55;const fc=G_.scene.fog.color.copy(fb);if(kp>0)fc.lerp(new THREE.Color(prev.tint),kp);if(k>0)fc.lerp(new THREE.Color(cur.tint),k)}
    const cc=new THREE.Color(prev.cc).lerp(new THREE.Color(cur.cc),W.blend);if(G_.clouds[0]){G_.clouds[0].g.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData.noBake&&!o.userData.hull)o.material.color.copy(cc)})}const cd=mix('clouds')/1.2;for(const c of G_.clouds)c.g.visible=c.i/G_.clouds.length<cd
    /* Blitze */if(cur.flash&&W.blend>.5){W.nextFlash-=dt;if(W.nextFlash<=0){W.flashT=.35;W.nextFlash=4+Math.random()*9;setTimeout(()=>{try{SND.play('thunder',{vol:.7})}catch(e){try{SND.play('whoosh',{vol:.6,rate:.4})}catch(e2){}}},300+Math.random()*900)}}
    if(W.flashT>0){W.flashT-=dt;const k=W.flashT>.25||(W.flashT<.15&&W.flashT>.08)?1:0;G_.hemi.intensity+=k*.7;G_.sun.intensity+=k*.3}
    /* Polarlicht nachts */const auA=(cur.aurora?W.blend:0)+(prev.aurora?1-W.blend:0);W.au.userData.m.uniforms.uA.value=auA*(G_.night||0);W.au.userData.m.uniforms.uT.value=t;W.au.position.copy(base);W.au.quaternion.setFromUnitVectors(UPV,up);W.au.visible=auA*(G_.night||0)>.02;
    /* Monde kreisen, Ring nachts dunkler */for(const m of W.sky.userData.moons){m.a+=dt*m.s;m.g.position.set(Math.cos(m.a)*m.d,Math.abs(Math.sin(m.a))*m.d*Math.sin(m.tilt)+m.d*.2,Math.sin(m.a)*m.d*Math.cos(m.tilt));m.g.rotation.y+=dt*.05}
    if(W.sky.userData.ring)W.sky.userData.ring.uniforms.uN.value=G_.night||0}
  return{K,PLAN,build,frame,set,get cur(){return W&&W.cur}}
})();
