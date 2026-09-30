/* =====================================================================
   CYBORG-LABOR · lab.js
   Das Labor: Körper, Teile, Funktions-Karten, Entlassen in die Welt.
   ===================================================================== */
let HIGH=!matchMedia('(pointer:coarse)').matches;{const q=LS.get('cyborg-labor-grafik',null);if(q)HIGH=q==='hoch'}
function makeRenderer(canvas){const r=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.NoToneMapping;
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;return r}
function makeComposer(r,scene,cam){const rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:4});const c=new THREE.EffectComposer(r,rt);c.addPass(new THREE.RenderPass(scene,cam));
  /* Schutz vor Flackern: einzelne NaN/Inf-Pixel (additive Partikel, Glühen) würde der Bloom über den ganzen Bildschirm verschmieren – vorher säubern und begrenzen */
  c.addPass(new THREE.ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);\n#if __VERSION__>=300\nif(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);\n#endif\nc.rgb=clamp(c.rgb,0.,6.);c.a=clamp(c.a,0.,1.);gl_FragColor=c;}'}));
  const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(256,256),.5,.5,1.0);c.addPass(bloom);c.addPass(new THREE.ShaderPass(THREE.CopyShader));c.bloom=bloom;return c}
function skyTex(a,b,key){return ctex('sky'+a+b+(key||''),64,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(.62,b);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,w,h)})}
function sizeView(R,cam,comp,elx){const w=elx.clientWidth,h=elx.clientHeight;if(!w||!h)return;const pr=Math.min(HIGH?2:1.25,devicePixelRatio);R.setPixelRatio(pr);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(comp){comp.setPixelRatio(pr);comp.setSize(w,h)}}

/* ---------- Zustand ---------- */
let S=DEFAULT();{const d=LS.get('cyborg-labor-entwurf-v2',null);if(d&&d.parts)S=sanitize(d)}
let draftT=0;function saveDraft(){clearTimeout(draftT);draftT=setTimeout(()=>LS.set('cyborg-labor-entwurf-v2',S),400)}
let WORLD=(LS.get('cyborg-labor-welt-v1',[])||[]).map(sanitize).filter(x=>x.id);
let showExamples=LS.get('cyborg-labor-beispiele','an')!=='aus';
const saveWorld=()=>LS.set('cyborg-labor-welt-v1',WORLD.map(slim));
const allCreatures=()=>(showExamples?EXAMPLES.map(sanitize):[]).concat(WORLD);

const LAB=(()=>{
  const canvas=$('labCanvas');const R=makeRenderer(canvas);const scene=new THREE.Scene();scene.background=skyTex('#a9dcff','#fff1dc','lab');
  const cam=new THREE.PerspectiveCamera(30,1,.1,200);const comp=makeComposer(R,scene,cam);
  const L=cozyLights(scene,{hemi:.5,sunI:1.0});L.sun.castShadow=true;L.sun.shadow.mapSize.set(2048,2048);Object.assign(L.sun.shadow.camera,{left:-4,right:4,top:6,bottom:-2,near:1,far:25});L.sun.shadow.bias=-.0005;L.sun.shadow.normalBias=.03;L.sun.shadow.radius=4;
  /* Insel-Podest */
  const M0=makeMats({skin:'haut',color:0});const island=new THREE.Group();scene.add(island);QF=1;
  /* Diorama: gemalte Rasenscheibe, Erdschichten an der Seite, echter Grasteppich (GRASS) mit Lichtung für die Füsse, Kiesel */
  const turf=ctex('lab-turf',512,512,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'#A8D67A');g.addColorStop(.45,'#93C86A');g.addColorStop(.85,'#7AB35C');g.addColorStop(1,'#5E9A4C');x.fillStyle=g;x.fillRect(0,0,w,h);
    const r=srand(11);for(let i=0;i<2600;i++){const a=r()*TAU,d=Math.sqrt(r())*w/2;x.fillStyle=r()<.5?'rgba(60,110,50,.16)':'rgba(220,245,170,.14)';x.beginPath();x.ellipse(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,1.5+r()*3,1+r()*2,r()*PI,0,TAU);x.fill()}
    x.fillStyle='rgba(150,120,80,.22)';for(let i=0;i<5;i++){const a=r()*TAU,d=w*.1*r();x.beginPath();x.ellipse(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,w*.12,w*.09,r()*PI,0,TAU);x.fill()}});
  const soil=ctex('lab-soil',512,128,(x,w,h)=>{const bands=[['#8A5A3C',.0],['#A36B45',.18],['#7A4C34',.42],['#9B6444',.6],['#6E4430',.82]];for(const[c,y]of bands){x.fillStyle=c;x.beginPath();x.moveTo(0,y*h);for(let i=0;i<=32;i++)x.lineTo(i*w/32,y*h+Math.sin(i*1.7+y*9)*4);x.lineTo(w,h);x.lineTo(0,h);x.fill()}
    const r=srand(5);for(let i=0;i<160;i++){x.fillStyle=r()<.5?'rgba(255,230,190,.25)':'rgba(40,20,10,.25)';x.beginPath();x.ellipse(r()*w,h*.15+r()*h*.85,2+r()*6,1.5+r()*3,0,0,TAU);x.fill()}
    x.fillStyle='#6FAE58';x.beginPath();x.moveTo(0,0);for(let i=0;i<=64;i++)x.lineTo(i*w/64,6+(i%2?9:3)+Math.sin(i)*2);x.lineTo(w,0);x.fill()});
  soil.wrapS=THREE.RepeatWrapping;soil.repeat.set(3,1);
  P(island,G.cy(2.7,2.1,.8),cozy({map:soil,color:'#ffffff',rim:.08}),[0,-.42,0]);P(island,G.cy(2.72,2.72,.1),cozy({map:turf,color:'#ffffff',rim:.15}),[0,-.05,0]).receiveShadow=true;
  if(typeof GRASS!=='undefined'){const Mg=48,pos=[],nor=[],col=[],pat=[],mat=[],H=[];const tc=new THREE.Color();for(let j=0;j<Mg;j++)for(let i=0;i<Mg;i++){const x=(i/(Mg-1)-.5)*5.4,z=(j/(Mg-1)-.5)*5.4,d=Math.hypot(x,z);
      pos.push(x,0,z);nor.push(0,1,0);tc.set(d<1.4?'#9ACC6E':d<2.2?'#8AC064':'#6FA856');col.push(tc.r,tc.g,tc.b);const ok=d<2.6&&d>1.05?1:0;pat.push(ok,0,0,0);mat.push(0,0,0,0);H.push(1)}
    const gm=GRASS.forTile(Mg,pos,nor,col,pat,mat,H,0,77,3);if(gm){gm.position.y=.0;gm.updateMatrix();island.add(gm)}}
  {const r=srand(9);for(let i=0;i<9;i++){const a=r()*TAU,d=1.2+r()*1.2;P(island,G.s(.06+r()*.08),M0.c(['#CFC6B8','#B8AFA2','#E2DACB'][i%3]),[Math.cos(a)*d,.0,Math.sin(a)*d],[r(),r(),r()],[1,.6,1.2])}}
  const rr=srand(4);range(18,(t,i)=>{const a=i/18*TAU+rr()*.2;P(island,G.s(.18+rr()*.12),M0.c(i%3?'#7CC46A':'#6DB35A'),[Math.cos(a)*2.66,-.02,Math.sin(a)*2.66],null,[1,.55,1])});
  range(7,(t,i)=>{const a=i*.9+1;const f=grp(island,[Math.cos(a)*2.2,0,Math.sin(a)*2.2]);bt(f,[0,0,0],[0,.22,0],.018,M0.c('#5E9B4A'));P(f,G.s(.07),M0.c(['#FF8FB8','#FFE27A','#FFFDF7','#C6A9FF'][i%4]),[0,.25,0],null,[1,.6,1]);P(f,G.s(.03),M0.c('#FFB27A'),[0,.28,0])});
  addOutlines(island);island.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=false}});
  /* Wolken */
  const clouds=[];for(let i=0;i<5;i++){const c=new THREE.Group();range(4,(t,j)=>P(c,G.s(.8+j%2*.3),M0.c('#ffffff',{rim:.6}),[(t-.5)*2.4,Math.sin(j*2)*.2,0],null,[1,.8,.8]));c.position.set(-14+i*7,6+i%2*2.5,-16-i%3*4);scene.add(c);clouds.push(c)}
  const pivot=new THREE.Group();scene.add(pivot);let cre=null;let rotY=.6,tilt=.16,zoom=1,autoSpin=true,lastI=0,camY=1,camD=8,act=0;
  function rebuild(){if(cre){pivot.remove(cre);disposeTree(cre)}cre=buildCreature(S,{q:HIGH?1:.6,noShadow:!HIGH});pivot.add(cre);
    const b=cre.userData.box;const h=Math.max(1.5,b.max.y),wd=Math.max(b.max.x-b.min.x,b.max.z-b.min.z);camY=h*.48;camD=Math.max(h,wd*.9)*1.8+2.4}
  {let down=null;canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';SND.init()});
   canvas.addEventListener('pointermove',e=>{if(!down)return;rotY+=(e.clientX-down.x)*.01;tilt=Math.max(-.05,Math.min(.8,tilt+(e.clientY-down.y)*.005));down={x:e.clientX,y:e.clientY};autoSpin=false;lastI=performance.now()});
   const up=()=>{down=null;canvas.style.cursor='grab'};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
   canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.55,Math.min(1.6,zoom+e.deltaY*.001));lastI=performance.now()},{passive:false})}
  /* Fähigkeiten-Vorführung */
  const demo={i:0,t:1.5,props:[]};const abilEl=$('labAbil');
  function demoReset(){demo.i=0;demo.t=1.2;demo.props.forEach(x=>{scene.remove(x.g);disposeTree(x.g)});demo.props=[];renderAbil(null)}
  function renderAbil(cur){const mv=moveFor(S);const abs=abilitiesFor(S);abilEl.replaceChildren();
    if(cur){const n=el('div','now');n.append(el('b',null,cur.n+'. '),document.createTextNode(cur.d));abilEl.append(n)}
    const ch=el('div','chips');ch.append(el('span','mv','Bewegung: '+MOVE[mv.m].n+(mv.swim&&!MOVE[mv.m].water?', schwimmt':'')));abs.forEach(a=>{if(ABIL[a])ch.append(el('span',null,ABIL[a].n))});abilEl.append(ch)}
  function demoStep(dt){demo.t-=dt;for(let i=demo.props.length-1;i>=0;i--){const x=demo.props[i];x.age+=dt;const s=Math.min(1,x.age/1.1)*(x.age>5.5?Math.max(0,1-(x.age-5.5)*2):1);const bounce=1+Math.sin(Math.min(1,x.age/1.1)*PI)*.18;x.g.scale.setScalar(Math.max(.001,s*bounce*(x.fit||1)));if(x.age>6){scene.remove(x.g);disposeTree(x.g);demo.props.splice(i,1)}}
    if(demo.t>0)return;const abs=abilitiesFor(S).filter(a=>ABIL[a].act||ABIL[a].passive);demo.t=3.8;if(!abs.length){renderAbil(null);return}const a=abs[demo.i%abs.length];demo.i++;const A=ABIL[a];renderAbil(A);act=1;
    const np=A.lab&&NATURE[A.lab];if(np){const g=new THREE.Group();QF=.8;try{np.b(g,M0,{word:pick(WORDS),color:pick(['#FF8FB8','#FFE27A','#7FDCE6'])},srand(demo.i))}catch(e){}QF=1;addOutlines(g);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});
const bb=new THREE.Box3().setFromObject(g);const hh=Math.max(.2,bb.max.y-bb.min.y,(bb.max.x-bb.min.x)*.8);const fit=Math.min(1.2,1.5/hh);const side=demo.i%2?1:-1;g.position.set(side*(1.7+Math.random()*.4),np.decal?.03:0,-.3+Math.random()*.6);g.scale.setScalar(.001);scene.add(g);demo.props.push({g,age:0,fit});SND.play('pickup',{vol:.35,rate:1.2})}}
  function frame(dt,t){if(!cre)return;if(!autoSpin&&performance.now()-lastI>4000)autoSpin=true;if(autoSpin&&!REDUCE)rotY+=dt*.3;pivot.rotation.y=rotY;
    demoStep(dt);act=Math.max(0,act-dt*.8);const a=act>0?Math.sin(Math.min(1,act)*PI):0;
    const mv=MOVE[moveFor(S).m];let y=0;if(mv.alt)y=mv.alt*1.2+Math.sin(t*1.5)*.15;if(mv.hop)y+=Math.abs(Math.sin(t*4))*mv.hop*1.2;cre.position.y=y;
    cre.userData.tick(t,!!(mv.hop||mv.sp>1.2),a);clouds.forEach((c,i)=>{c.position.x+=dt*.25;if(c.position.x>20)c.position.x=-20});
    const dd=camD*zoom;cam.position.set(0,camY+Math.sin(tilt)*dd,Math.cos(tilt)*dd);cam.lookAt(0,camY*.95,0);if(typeof GRASS!=='undefined')GRASS.U.uT.value=t;
    if(typeof LOOK!=='undefined'&&LOOK.enabled)LOOK.render(R,scene,cam,{fogAmt:0,ao:HIGH?.7:.55,ink:.8,tilt:0,bloom:HIGH,bloomStr:.22,vig:.45,shadowTint:'#C4BCFF',lightTint:'#FFF1DC',sat:1.03});else if(HIGH)comp.render();else R.render(scene,cam)}
  function resize(){sizeView(R,cam,comp,$('labStage'))}
  function quality(){R.shadowMap.enabled=HIGH;resize();rebuild()}
  return{rebuild,frame,resize,demoReset,renderAbil,quality,R,get act(){return act},set act(v){act=v}};
})();

/* ---------- Panel ---------- */
let activeSlot='kopf',kindFilter='alle',search='';
function chip(kind){return el('span','chip k-'+kind,KIND[kind])}
function renderBody(){
  $('inName').value=S.name;$('inGroup').value=S.group;$('inSize').value=S.body.size;$('inStatement').value=S.statement;
  const sh=$('shapeBtns');sh.replaceChildren();TORSOS.forEach(t=>{const b=el('button',null,t.n);b.type='button';b.setAttribute('aria-pressed',S.body.shape===t.id);b.onclick=()=>{S.body.shape=t.id;changed(true)};sh.append(b)});
  const sb=$('segBtns');sb.replaceChildren();[1,2,3].forEach(n=>{const b=el('button',null,String(n));b.type='button';b.setAttribute('aria-pressed',S.body.seg===n);b.onclick=()=>{S.body.seg=n;changed(true)};sb.append(b)});
  const st=$('skinTiles');st.replaceChildren();SKINS.forEach(k=>{const b=el('button','skin');b.type='button';b.setAttribute('aria-pressed',S.body.skin===k.id);const i=el('i');i.style.background=COLORABLE.includes(k.id)&&k.id===S.body.skin?SKIN_COLORS[S.body.color]:k.sw;b.append(i,document.createTextNode(k.n));b.title=KIND[k.k];b.onclick=()=>{S.body.skin=k.id;changed(true)};st.append(b)});
  const colable=COLORABLE.includes(S.body.skin);$('colorWrap').hidden=!colable;$('patWrap').hidden=!colable;$('col2Wrap').hidden=!colable||S.body.pattern==='keine';
  const sw=$('swatches');sw.replaceChildren();SKIN_COLORS.forEach((c,i)=>{const b=el('button');b.type='button';b.style.background=c;b.setAttribute('aria-label','Hauptfarbe '+(i+1));b.setAttribute('aria-pressed',S.body.color===i);b.onclick=()=>{S.body.color=i;changed(true)};sw.append(b)});
  const sw2=$('swatches2');sw2.replaceChildren();SKIN_COLORS.forEach((c,i)=>{const b=el('button');b.type='button';b.style.background=c;b.setAttribute('aria-label','Musterfarbe '+(i+1));b.setAttribute('aria-pressed',S.body.color2===i);b.onclick=()=>{S.body.color2=i;changed(true)};sw2.append(b)});
  const pb=$('patBtns');pb.replaceChildren();PATTERNS.forEach(t=>{const b=el('button',null,t.n);b.type='button';b.setAttribute('aria-pressed',S.body.pattern===t.id);b.onclick=()=>{S.body.pattern=t.id;changed(true)};pb.append(b)});
}
function renderParts(){
  const tabs=$('slotTabs');tabs.replaceChildren();
  SLOTS.forEach(sl=>{const b=el('button',null,sl.label+(sl.multi?` (${S.parts.extras.length}/${MAXX})`:'')+' · '+PARTS[sl.key].length);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',activeSlot===sl.key);b.onclick=()=>{activeSlot=sl.key;SND.play('select',{vol:.5});renderParts()};tabs.append(b)});
  /* Farbe des gewählten Teils (Original oder eine Palettenfarbe) */{const lbl=SLOTS.find(x=>x.key===activeSlot);$('partColLbl').textContent='Farbe: '+(lbl?lbl.label:'Teil')+(activeSlot==='extras'?' (alle Extras)':'');const ps=$('partSwatches');ps.replaceChildren();S.tint=S.tint||{};const cur=S.tint[activeSlot];
    const o=el('button','orig');o.type='button';o.title='Originalfarben';o.setAttribute('aria-label','Originalfarben');o.setAttribute('aria-pressed',cur==null);o.onclick=()=>{delete S.tint[activeSlot];changed(true);renderParts()};ps.append(o);
    SKIN_COLORS.forEach((c,i)=>{const b=el('button');b.type='button';b.style.background=c;b.setAttribute('aria-label','Teilfarbe '+(i+1));b.setAttribute('aria-pressed',cur===i);b.onclick=()=>{S.tint[activeSlot]=i;SND.play('select',{vol:.4});changed(true);renderParts()};ps.append(b)})}
  const kf=$('kindFilters');kf.replaceChildren();['alle','org','tier','masch','pflanze','ding'].forEach(k=>{const b=el('button',null,k==='alle'?'alle':KIND[k]);b.type='button';b.setAttribute('aria-pressed',kindFilter===k);b.onclick=()=>{kindFilter=k;renderParts()};kf.append(b)});
  const t=$('partTiles');t.replaceChildren();const q=search.trim().toLowerCase();
  const abText=p=>[p.ab&&ABIL[p.ab]?ABIL[p.ab].n:'',p.mv?MOVE[p.mv].n:''].join(' ');const list=PARTS[activeSlot].filter(p=>(kindFilter==='alle'||p.k===kindFilter||(p.k==='none'))&&(!q||(p.n+' '+abText(p)).toLowerCase().includes(q)));
  if(!list.length){t.append(el('p','empty','Kein Teil gefunden. Anderer Suchbegriff?'));return}
  list.forEach(p=>{const b=el('button','tile');b.type='button';const on=activeSlot==='extras'?S.parts.extras.includes(p.id):S.parts[activeSlot]===p.id;b.setAttribute('aria-pressed',on);
    b.append(UI.partThumb(activeSlot,p.id),el('span','t',p.n),chip(p.k));const lines=[];if(p.mv&&p.mv!=='walk')lines.push(MOVE[p.mv].n);if(p.ab&&ABIL[p.ab])lines.push(ABIL[p.ab].n);if(FLYPARTS.arme.includes(p.id)&&activeSlot==='arme')lines.unshift('fliegt');if(FLYPARTS.extras.includes(p.id)&&activeSlot==='extras')lines.unshift('fliegt');if(lines.length)b.append(el('span','ab','↳ '+lines.join(' · ')));
    b.onclick=()=>{if(activeSlot==='extras'){const ex=S.parts.extras;if(ex.includes(p.id))S.parts.extras=ex.filter(x=>x!==p.id);else if(ex.length<MAXX)ex.push(p.id);else{UI.toast(`Maximal ${MAXX} Extras`);SND.play('error',{vol:.5});return}}else S.parts[activeSlot]=p.id;SND.play('pickup',{vol:.5,jitter:.2});changed(true,true)};
    t.append(b)});
}
function renderCards(){
  const box=$('cards');box.replaceChildren();
  for(const a of activeKeys(S)){const inf=S.info[a.key]||(S.info[a.key]={name:'',func:'',forWhom:'',boundary:'',maker:'',other:false});
    const c=el('div','pcard');c.dataset.key=a.key;const h=el('div','head');h.append(el('b',null,a.label),chip(a.kind));c.append(h);const abId=abOfKey(S,a.key);if(abId)c.append(el('p','abl','In der Welt: '+ABIL[abId].n+'. '+ABIL[abId].d));if(a.key==='beine'){const mv=moveFor(S);c.append(el('p','abl','Bewegung: '+MOVE[mv.m].n+(mv.src!=='Beine'?` (wegen ${mv.src})`:'')))}
    const mk=(field,label,ph,ta)=>{const l=el('label','f',label);const i=el(ta?'textarea':'input');if(!ta)i.type='text';i.id='f-'+a.key+'-'+field;i.maxLength=field==='func'?200:120;i.placeholder=ph;i.value=inf[field]||'';if(ta)i.rows=2;
      i.addEventListener('input',()=>{inf[field]=i.value;afterInfo()});l.append(i);return l};
    c.append(mk('name','Name des Teils','z. B. Kiemen-Filter'));c.append(mk('func','Funktion (frei erfunden)','Was kann es? z. B. atmet Abgase und macht daraus Blumenduft',true));
    const r2=el('div','row');r2.append(mk('forWhom','Für wen gebaut?','z. B. für Bienen'),mk('maker','Wer baut es, woraus?','z. B. Fabrik in Shenzhen, Kobalt'));c.append(r2);
    const bl=el('label','f','Welche Grenze verwischt es?');const sel=el('select');sel.id='f-'+a.key+'-boundary';sel.append(new Option('– wählen –',''));BOUNDARIES.forEach(b=>sel.append(new Option(b,b)));sel.value=inf.boundary||'';sel.onchange=()=>{inf.boundary=sel.value;afterInfo()};bl.append(sel);c.append(bl);
    const ck=el('label','check');const cb=el('input');cb.type='checkbox';cb.id='f-'+a.key+'-other';cb.checked=!!inf.other;cb.onchange=()=>{inf.other=cb.checked;afterInfo()};ck.append(cb,document.createTextNode('Dient einer anderen Art'));c.append(ck);
    if((inf.func||'').trim().length>=3)c.classList.add('done');box.append(c)}
}
function afterInfo(){document.querySelectorAll('.pcard').forEach(c=>{const i=S.info[c.dataset.key];c.classList.toggle('done',!!i&&(i.func||'').trim().length>=3)});renderChecklist();saveDraft()}
function checks(){const keys=activeKeys(S).map(a=>a.key);const filled=keys.filter(k=>(S.info[k]?.func||'').trim().length>=3);
  return[{ok:S.name.trim().length>0,t:'Der Cyborg hat einen Namen'},{ok:filled.length>=4,t:`Mindestens vier Teile mit Funktion (${Math.min(filled.length,4)}/4)`},
   {ok:keys.some(k=>S.info[k]?.other&&(S.info[k]?.func||'').trim().length>=3),t:'Ein Teil mit Funktion dient einer anderen Art'},{ok:S.statement.trim().length>=10,t:'Der Verantwortungssatz ist geschrieben'}]}
function renderChecklist(){const ul=$('checklist');ul.replaceChildren();const c=checks();c.forEach(x=>ul.append(el('li',x.ok?'ok':'',x.t)));$('btnRelease').disabled=!c.every(x=>x.ok);
  $('plateName').textContent=S.name.trim()||'Namenloser Cyborg';$('plateGroup').textContent=S.group.trim()}
function changed(rebuild,keepScroll){LAB.demoReset();const sc=$('panel').scrollTop;renderBody();renderParts();renderCards();renderChecklist();if(rebuild)LAB.rebuild();saveDraft();if(keepScroll)$('panel').scrollTop=sc;if(window.GAME&&GAME.onAvatarChanged)GAME.onAvatarChanged()}
$('inName').addEventListener('input',e=>{S.name=e.target.value;renderChecklist();saveDraft()});
$('inGroup').addEventListener('input',e=>{S.group=e.target.value;renderChecklist();saveDraft()});
$('inSize').addEventListener('input',e=>{S.body.size=+e.target.value;LAB.rebuild();saveDraft()});
$('inStatement').addEventListener('input',e=>{S.statement=e.target.value;renderChecklist();saveDraft()});
$('inSearch').addEventListener('input',e=>{search=e.target.value;renderParts()});
$('btnRandom').onclick=()=>{for(const s of ['kopf','augen','arme','beine'])S.parts[s]=pick(PARTS[s].filter(p=>p.k!=='none')).id;SND.play('whoosh',{vol:.6});
  S.parts.extras=[...PARTS.extras].sort(()=>Math.random()-.5).slice(0,1+Math.floor(Math.random()*3)).map(p=>p.id);S.body.skin=pick(SKINS).id;S.body.shape=pick(TORSOS).id;S.body.seg=1+Math.floor(Math.random()*3);S.body.color=Math.floor(Math.random()*SKIN_COLORS.length);S.body.color2=Math.floor(Math.random()*SKIN_COLORS.length);S.body.pattern=pick(PATTERNS).id;changed(true)};
UI.armed($('btnReset'),'Wirklich löschen?',()=>{S=DEFAULT();changed(true)});
$('btnRelease').onclick=()=>{const d=sanitize(JSON.parse(JSON.stringify(S)));d.id=rid();d.createdAt=Date.now();delete d.example;WORLD.push(d);saveWorld();SND.jingle('j_release');
  const w=UI.win(`${d.name} lebt jetzt`,{size:'narrow'});w.body.append(el('p',null,'Euer Cyborg wohnt ab jetzt auf dem Kompost-Planeten. Damit er in die gemeinsame Welt am Beamer kommt, kopiert den Code und schickt ihn an den Beamer-Laptop (Miro-Board oder Klassenchat).'));
  const code=el('div','code',encode(d));w.body.append(code);w.foot.append(btn('Code kopieren','primary',()=>UI.copy(code.textContent,'Code kopieren',code)),btn('Zur Welt',null,()=>{w.close();MAIN.setTab('world')}));
  if(window.GAME)GAME.syncVillagers()};
