/* =====================================================================
   CYBORG-LABOR · glitchkern.js · Der Glitch-Kern (Finalort)
   Wer alle sieben Logbuch-Einträge der Wartungsstationen gelesen hat,
   sieht hinter der Sonne einen flackernden roten Kern. Andocken führt
   in den Riss: Farben weg, Stromleitungen, nur ein Rot. Sieben Tore,
   eines je Planeten-Gruppe, jedes eine Erinnerung der Schläfer:innen.
   Sind alle sieben Erinnerungen geweckt, öffnet sich die Mitte: Die Uhr
   darf endlich von 23:59 auf 00:00 springen. Mitternacht, Feuerwerk,
   die Farben kommen zurück.
   ===================================================================== */
const GLITCHKERN=(()=>{
  const V=THREE.Vector3;const POS=new V(-24,0,-268);const RED='#c8102e';
  const ROOMS=[
    {id:'nova',grp:'Heimat',col:'#7fd34a',obj:'herz',mem:['Erinnerung · Heimat','Ein Kompost-Haufen, warm von innen. Jemand hat einen Apfelrest hineingelegt und gesagt: «Daraus wird Erde. Und aus Erde wird alles.»','Wir sind Kompost, nicht Posthumane. Wir werden zusammen, nicht allein.']},
    {id:'aurora',grp:'Urzeit',col:'#ffb43a',obj:'dino',mem:['Erinnerung · Urzeit','Ein Plastik-Dino auf einem Fensterbrett. Ein Kind hat ihm einen Namen gegeben, und von da an war er nicht mehr nur Plastik.','Dinge werden lebendig, wenn wir uns um sie kümmern.']},
    {id:'komet',grp:'Metro',col:'#ffd23f',obj:'treppe',mem:['Erinnerung · Metro','Eine Rolltreppe, die niemand benutzt, fährt trotzdem weiter. Sie wartet auf die nächste Person.','Eine Stadt ist nicht aus Beton. Sie ist aus allen, die einander begegnen.']},
    {id:'farn',grp:'Dschungel',col:'#5aae4a',obj:'blatt',mem:['Erinnerung · Dschungel','Ranken über einem Server. Niemand hat sie weggeschnitten. Die Maschine wurde langsamer, aber kühler. Und die Ranken wurden stärker.','Pflanze und Maschine, verwoben. Keine siegt. Beide bleiben.']},
    {id:'zephyr',grp:'Himmel',col:'#8fd0ff',obj:'wolke',mem:['Erinnerung · Himmel','Ein Wetterballon steigt, bis er platzt. Unten wartet jemand auf seine Messwerte und schreibt sie sorgfältig auf.','Wer den Himmel versteht, versteht ein bisschen, wie alles zusammenhängt.']},
    {id:'pendel',grp:'Uhrwerk',col:'#e8b04a',obj:'zahnrad',mem:['Erinnerung · Uhrwerk','Alle Uhren stehen auf 23:59. Nicht kaputt. Angehalten. Die Welt hält den Atem an, weil sie nicht weiss, was nach Mitternacht kommt.','Man darf ausatmen. Was danach kommt, bauen wir gemeinsam.']},
    {id:'pixel',grp:'Bildschirm',col:'#45e0ff',obj:'schirm',mem:['Erinnerung · Bildschirm','Ein Bildschirmschoner, der seit Jahren Sterne fliegen lässt. Niemand schaut zu. Er macht trotzdem weiter, für den Fall, dass doch jemand kommt.','Du bist gekommen.']}];
  const S=()=>SAVE.glitch=SAVE.glitch||{rooms:[],done:false};
  let obj=null,lbl=null,near=false,M=null,anim=[],room=null;
  /* ---------- Im Weltraum ---------- */
  function model(){const g=new THREE.Group();const m=makeMats({skin:'haut',color:0});
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(3.2,1),new THREE.MeshBasicMaterial({color:RED,wireframe:true,toneMapped:false}));g.add(core);
    const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(2,0),m.glow(RED,2));g.add(inner);
    const ring=P(g,G.to(5,.08),new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false}),[0,0,0],[PI/2,0,0]);
    const shards=[];for(let i=0;i<14;i++){const sh=P(g,G.bx(.3+Math.random()*.6,.05,.3+Math.random()*.6,0),new THREE.MeshBasicMaterial({color:i%3?'#e8e8e8':RED,toneMapped:false}),[0,0,0]);sh.userData.a=Math.random()*TAU;sh.userData.r=4+Math.random()*3;sh.userData.y=(Math.random()-.5)*3;shards.push(sh)}
    g.userData={core,inner,ring,shards};return g}
  function space(sc,sp,t,cam){if(!SAVE.glitchKnown)return false;
    if(!obj||!obj.parent||obj.parent!==sc){obj=model();obj.position.copy(POS);sc.add(obj);if(!lbl){lbl=el('div','lbl planetlbl');lbl.textContent='Glitch-Kern';lbl.style.color=RED;$('labels').append(lbl)}}
    const u=obj.userData;u.core.rotation.y=t*.3;u.core.rotation.x=t*.17;u.inner.rotation.y=-t*.5;u.inner.visible=Math.random()>.04;u.ring.rotation.z=t*.4;
    for(const sh of u.shards){sh.position.set(Math.cos(sh.userData.a+t*.2)*sh.userData.r,sh.userData.y+Math.sin(t+sh.userData.a)*.3,Math.sin(sh.userData.a+t*.2)*sh.userData.r);sh.rotation.y=t+sh.userData.a}
    const w=$('world').clientWidth,h=$('world').clientHeight;const v=obj.position.clone().add(new V(0,5,0)).project(cam);lbl.style.left=((v.x+1)/2*w)+'px';lbl.style.top=((1-v.y)/2*h)+'px';lbl.style.display=v.z<1&&document.body.classList.contains('inspace')?'':'none';
    near=obj.position.distanceTo(sp)<9;return near}
  function hideLabel(){if(lbl)lbl.style.display='none'}
  /* ---------- Der Riss: Halle mit sieben Toren ---------- */
  function riftTex(){return ctex('gk-floor',256,256,(x,w,h)=>{x.fillStyle='#1a1a1e';x.fillRect(0,0,w,h);x.strokeStyle='#3a3a40';x.lineWidth=2;for(let i=0;i<=8;i++){x.beginPath();x.moveTo(i*w/8,0);x.lineTo(i*w/8,h);x.stroke();x.beginPath();x.moveTo(0,i*h/8);x.lineTo(w,i*h/8);x.stroke()}
    x.strokeStyle=RED;x.lineWidth=3;x.beginPath();x.moveTo(0,h*.6);for(let i=1;i<=8;i++)x.lineTo(i*w/8,h*(.6+(i%2?-.12:.1)));x.stroke()})}
  function symbol(g,m,kind,col){const c=m.glow(col,1.4);const q=grp(g,[0,0,0]);
    if(kind==='herz'){P(q,G.s(.32),c,[-.16,.1,0]);P(q,G.s(.32),c,[.16,.1,0]);P(q,G.co(.42,.6,4),c,[0,-.3,0],[PI,PI/4,0])}
    else if(kind==='dino'){P(q,G.s(.38),c,[0,0,0],null,[1.4,.8,.8]);P(q,G.s(.2),c,[.55,.35,0]);bt(q,[.3,.15,0],[.55,.35,0],.1,c);for(const x of[-.25,.25])bt(q,[x,-.1,0],[x,-.5,0],.07,c);for(let i=0;i<4;i++)P(q,G.co(.08,.2,4),c,[-.3+i*.18,.3,0])}
    else if(kind==='treppe'){for(let i=0;i<5;i++)P(q,G.bx(.6,.12,.25,.02),c,[0,-.4+i*.2,-.4+i*.2]);bt(q,[-.35,-.3,-.4],[-.35,.6,.6],.03,c);bt(q,[.35,-.3,-.4],[.35,.6,.6],.03,c)}
    else if(kind==='blatt'){P(q,G.s(.45),c,[0,0,0],null,[.6,1.2,.12]);bt(q,[0,-.55,0],[0,.5,.05],.025,m.glow('#ffffff',1))}
    else if(kind==='wolke'){for(const[x,y,r]of[[-.3,0,.3],[0,.15,.38],[.32,0,.3],[0,-.08,.3]])P(q,G.s(r),c,[x,y,0])}
    else if(kind==='zahnrad'){P(q,G.cy(.4,.4,.15,10),c,[0,0,0],[PI/2,0,0]);for(let i=0;i<10;i++){const a=i/10*TAU;P(q,G.bx(.14,.16,.15,.02),c,[Math.cos(a)*.48,Math.sin(a)*.48,0],[0,0,a])}}
    else{P(q,G.bx(.9,.6,.08,.04),c,[0,.1,0]);P(q,G.bx(.2,.25,.08,.02),c,[0,-.3,0])}
    return q}
  function build(sc){M=makeMats({skin:'haut',color:0});anim=[];const W=16,D=12,H=5;const A=INTERIOR.actions,C=INTERIOR.colliders;const st=S();
    const fl=new THREE.Mesh(new THREE.BoxGeometry(W,.2,D),cozy({map:(()=>{const t=riftTex().clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(W/4,D/4);return t})(),color:'#ffffff',rim:.05}));fl.position.y=-.1;sc.add(fl);
    const grey=M.c('#2a2a30',{gloss:.4}),pale=M.c('#cfcfd4',{gloss:.6}),red=M.glow(RED,2);
    P(sc,G.bx(W+.4,H,.3,.05),grey,[0,H/2,-D/2-.15]);both(s=>P(sc,G.bx(.3,H,D,.05),grey,[s*(W/2+.15),H/2,0]));
    /* Stromleitungen quer durch den Raum, mit Masten */for(let i=0;i<3;i++){const z=-D/2+1+i*1.2;bt(sc,[-W/2,H-.6-i*.3,z],[W/2,H-.8-i*.3,z+.6],.02,M.c('#111114'))}both(s=>{bt(sc,[s*(W/2-.6),0,-D/2+.6],[s*(W/2-.6),H-.3,-D/2+.6],.08,pale);P(sc,G.bx(1,.08,.08,.02),pale,[s*(W/2-.6),H-.6,-D/2+.6])});
    /* sieben Tore im Halbkreis */const ports=[];ROOMS.forEach((r,i)=>{const a=PI*(.12+i*.76/6);const x=-Math.cos(a)*(W/2-1.6),z=-Math.sin(a)*(D/2-1.4)+.6;const g=grp(sc,[x,0,z],[0,Math.atan2(-x,-(z-1.5))+PI,0]);const on=st.rooms.includes(r.id);
      P(g,G.bx(.25,2.6,.25,.04),pale,[-.8,1.3,0]);P(g,G.bx(.25,2.6,.25,.04),pale,[.8,1.3,0]);P(g,G.bx(1.85,.25,.25,.04),pale,[0,2.6,0]);
      const veil=P(g,new THREE.PlaneGeometry(1.4,2.4),new THREE.MeshBasicMaterial({color:on?r.col:'#5a5a60',transparent:true,opacity:on?.55:.35,toneMapped:false,side:THREE.DoubleSide}),[0,1.25,0]);veil.userData.noOutline=true;
      const sym=symbol(g,M,r.obj,on?r.col:'#8a8a90');sym.position.set(0,3.4,0);anim.push((dt,t)=>{sym.rotation.y=t*.6+i;sym.position.y=3.4+Math.sin(t*1.3+i)*.08;if(!on)veil.material.opacity=.25+Math.random()*.15});
      const tag=ctex('gk-tag-'+r.id,128,32,(x,w,h)=>{x.fillStyle='#111114';x.fillRect(0,0,w,h);x.fillStyle=on?r.col:'#aaaaaa';x.font='bold 18px monospace';x.textAlign='center';x.fillText(r.grp.toUpperCase(),w/2,22)});P(g,new THREE.PlaneGeometry(1.4,.35),new THREE.MeshBasicMaterial({map:tag,toneMapped:false}),[0,2.95,.14]);
      C.push({x0:x-.9,x1:x+.9,z0:z-.4,z1:z+.4});const fx=x*.82,fz=z+.9;A.push({x:fx,z:fz,r:1.2,label:'Tor «'+r.grp+'» betreten',act:()=>enterRoom(r,veil,sym)});ports.push({r,veil,sym})});
    /* der Kern in der Mitte */const core=grp(sc,[0,0,0]);P(core,G.cy(1.2,1.4,.4,24),pale,[0,.2,0]);const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(.9,1),new THREE.MeshBasicMaterial({color:RED,wireframe:true,toneMapped:false}));ico.position.y=1.8;core.add(ico);const heart=P(core,G.s(.5),red,[0,1.8,0]);
    anim.push((dt,t)=>{ico.rotation.y=t*.5;ico.rotation.x=t*.3;heart.scale.setScalar(1+Math.sin(t*3)*.08);heart.visible=Math.random()>.03});C.push({x0:-1.4,x1:1.4,z0:-1.4,z1:1.4});
    A.push({x:0,z:1.9,r:1.4,label:st.done?'Der Kern ruht':'Den Kern berühren',act:touchCore});
    /* Tagebuch-Pult: das ganze Tagebuch der Schläfer:innen */const desk=grp(sc,[W/2-2,0,D/2-2.4],[0,-.6,0]);P(desk,G.bx(1.2,1,.7,.06),pale,[0,.5,0]);const bk=P(desk,G.bx(.7,.06,.5,.02),M.glow('#ffffff',1.1),[0,1.05,0],[-.3,0,0]);C.push({x0:W/2-2.7,x1:W/2-1.3,z0:D/2-2.9,z1:D/2-1.9});A.push({x:W/2-2.6,z:D/2-1.5,r:1.3,label:'Tagebuch der Schläfer:innen lesen',act:()=>typeof DIARY!=='undefined'&&DIARY.app()});
    /* Uhr über allem */const clk=ctex('gk-uhr-'+(st.done?1:0),256,64,(x,w,h)=>{x.fillStyle='#111114';x.fillRect(0,0,w,h);x.fillStyle=st.done?'#7fd34a':'#ff3a4a';x.font='bold 44px monospace';x.textAlign='center';x.fillText(st.done?'00:00':'23:59',w/2,48)});P(sc,new THREE.PlaneGeometry(3.4,.85),new THREE.MeshBasicMaterial({map:clk,toneMapped:false}),[0,H-.8,-D/2+.02]);
    const amb=new THREE.HemisphereLight('#e8e8f0','#202024',st.done?1.3:.9);sc.add(amb);const L=new THREE.PointLight(RED,1.6,12,2);L.position.set(0,3,0);sc.add(L);anim.push((dt,t)=>{L.intensity=1.2+Math.sin(t*2)*.4+(Math.random()<.04?1:0)});
    for(const[x,z]of[[-5,-3],[5,-3],[0,4]]){const l=new THREE.PointLight('#ffffff',.8,10,2);l.position.set(x,4,z);sc.add(l)}
    room={ports,core};addOutlines(sc);return{W,D,camD:15,camH:11}}
  function frame(dt,t){for(const f of anim)f(dt,t)}
  async function enterRoom(r,veil,sym){const st=S();SND.play('whoosh',{vol:.5});await UI.talk(r.mem[0],r.mem.slice(1),{voice:{pitch:190,speed:.9,kind:'sanft'},color:r.col});
    if(!st.rooms.includes(r.id)){st.rooms.push(r.id);persist();veil.material.color.set(r.col);veil.material.opacity=.55;sym.traverse(o=>{if(o.isMesh)o.material=M.glow(r.col,1.4)});SND.play('powerup',{vol:.6});
      UI.toast(`Erinnerung geweckt: ${st.rooms.length} von 7.`,2400);if(st.rooms.length===7)setTimeout(()=>UI.toast('Alle sieben Erinnerungen sind wach. Berühre den Kern in der Mitte.',3600),2600)}}
  async function touchCore(){const st=S();if(st.done){await UI.talk('Kern',['Die Uhr zeigt 00:00. Die Welt atmet ruhig.','Komm wieder, wann immer du willst.'],{voice:{pitch:170,kind:'sanft'},color:'#7fd34a'});return}
    if(st.rooms.length<7){SND.play('error');await UI.talk('Kern',[`Der Kern flackert. Noch schlafen ${7-st.rooms.length} Erinnerungen hinter den Toren.`],{voice:{pitch:170,kind:'sanft'},color:RED});return}
    await UI.talk('Kern',['Sieben Erinnerungen, sieben Gruppen, ein Kokon.','Seit 1999 hält diese Welt den Atem an. Es ist 23:59, und niemand traut sich, die letzte Minute vergehen zu lassen.','Du darfst es. Nicht allein – mit allen, denen du begegnet bist.'],{voice:{pitch:170,speed:.9,kind:'sanft'},color:RED});
    const ch=await UI.talk('Kern',['Soll die Uhr weiterlaufen?'],{voice:{pitch:170,kind:'sanft'},color:RED,choices:['Ja, lass sie laufen','Noch nicht']});if(ch!==0)return;
    st.done=true;SAVE.finale=true;persist();finale()}
  function finale(){const sc=INTERIOR.scene;SND.jingle('j_success');setTimeout(()=>SND.play('powerup'),600);
    /* Feuerwerk: farbige Funken steigen auf, die Tore bekommen ihre Farben */const cols=ROOMS.map(r=>r.col).concat(['#ff6fd8','#ffffff']);const parts=[];
    for(let k=0;k<7;k++)setTimeout(()=>{const c=new V((Math.random()-.5)*10,3+Math.random()*1.5,-2+(Math.random()-.5)*4);for(let i=0;i<26;i++){const p=P(sc,G.s(.06),M.glow(pick(cols),2),c.toArray());const v=new V(Math.random()-.5,Math.random()-.3,Math.random()-.5).normalize().multiplyScalar(2+Math.random()*2);parts.push({p,v,l:1.6})}SND.play('pop',{vol:.5})},k*450);
    anim.push((dt)=>{for(const q of parts){if(q.l<=0)continue;q.l-=dt;q.v.y-=dt*1.5;q.p.position.addScaledVector(q.v,dt);q.p.scale.setScalar(Math.max(.01,q.l));if(q.l<=0)q.p.visible=false}});
    if(room)for(const pt of room.ports){pt.veil.material.color.set(pt.r.col);pt.veil.material.opacity=.6}
    setTimeout(async()=>{await UI.talk('Mitternacht',['00:00. Die Uhr ist weitergesprungen.','Draussen leuchten alle Planeten ein kleines bisschen heller. Die Bewohner:innen feiern, und die Risslinge tanzen mit.','Danke, dass du gekommen bist. Make kin – mach dir Verwandte, überall.'],{voice:{pitch:230,kind:'hall'},color:'#7fd34a'});
      if(typeof REL!=='undefined'&&typeof bagAdd==='function')bagAdd('relic','glitch_kristall');money(3000);UI.toast('Finale geschafft! Du bekommst den Glitch-Kristall und 3000 Taler.',4200)},3600)}
  /* Fundstück aus dem Finale */
  if(typeof NH!=='undefined'){const{REL,relMeta}=NH;REL('glitch_kristall',relMeta('Glitch-Kristall','kompost','schatz',3,9999,'Ein Kristall, der abwechselnd farblos und bunt ist. Er tickt leise: 00:00, 00:00, 00:00.','Ein Glitch ist ein kleiner Fehler in einem System. Manchmal zeigen Fehler, wo etwas Neues anfangen kann.'),
    (g,m)=>{P(g,new THREE.IcosahedronGeometry(.2,0),m.glow(RED,1.6),[0,.24,0]);P(g,new THREE.IcosahedronGeometry(.26,0),new THREE.MeshBasicMaterial({color:'#ffffff',wireframe:true}),[0,.24,0]);P(g,G.cy(.18,.22,.06,16),m.c('#2a2a30'),[0,.03,0])})}
  function dock(){SND.play('metal',{vol:.5});SPACE.pause();hideLabel();INTERIOR.enter('glitchkern')}
  INTERIOR.kinds.glitchkern={bg:'#141416',music:'stille',build,frame,toSpace:()=>SPACE.resume()};
  return{space,dock,hideLabel,ROOMS,POS,state:S}
})();
