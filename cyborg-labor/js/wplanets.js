/* =====================================================================
   CYBORG-LABOR · wplanets.js
   WIRED-Umbau je Planet: eigene Candy-Mech-Requisiten, die zeigen, aus
   welchem Kindertraum NEMURI den Planeten gebaut hat.
   Urzeit = Spielzeug-Urzeit · Metro = Y2K-Stadt · Dschungel = überwucherter
   Kokon-95-Server. Alles steht auf flachem Boden, abseits von Wegen und
   Gebäuden (nichts schwebt).
   ===================================================================== */
const WPLAN=(()=>{
  let placed=[];
  const B=(...a)=>FU.B(...a),C=(...a)=>FU.C(...a),S=(...a)=>FU.S(...a);const CA=()=>WK.CANDY;
  /* ---------- Requisiten ---------- */
  const PROPS={
    /* Bernstein-Säule mit eingeschlossenem Insekt und Zahnrad */
    bernstein(m,r){const g=new THREE.Group();const h=1.6+r()*1.2;P(g,G.cy(.5,.62,h,false),m.c('#ff9a45',{opacity:.55,gloss:1.4,rim:1.4}),[0,h/2,0]).userData.noMerge=true;
      const bug=grp(g,[0,h*.55,0],[0,r()*6,0]);P(bug,G.s(.13),m.gloss('#3b3450'),[0,0,0],null,[1.4,.8,1]);both(x=>P(bug,G.s(.09),m.c('#d6f1fa',{opacity:.7}),[0,.08,x*.14],null,[1.2,.2,.8]));
      WK.gear(g,m,.18,[.18,h*.3,0],[0,0,0],'#ffd23f');C(g,.66,.7,.12,m.chrome(),[0,.06,0]);return{g,r:.8}},
    /* Spielzeug-Dino-Skelett aus Chrom-Knochen mit Schrauben */
    dinoskelett(m,r){const g=new THREE.Group();const bone=m.c('#f3e9d2',{rim:.5}),ch=m.chrome();const sp=[];for(let i=0;i<9;i++){const x=-1.6+i*.4,y=1.1+Math.sin(i/8*PI)*.5;sp.push([x,y,0]);P(g,G.s(.12),bone,[x,y,0])}
      for(let i=2;i<6;i++){const[x,y]=sp[i];both(z=>P(g,G.to(.32,.04,PI),bone,[x,y-.3,z*.02],[0,0,0]))}
      P(g,G.bx(.6,.36,.36,.12),bone,[2.0,1.45,0]);P(g,G.bx(.4,.12,.3,.05),bone,[2.2,1.22,0]);S(g,.05,m.c('#141414'),[2.15,1.55,.18]);
      both(z=>{for(const x of[-.7,.7]){C(g,.08,.06,1.0,bone,[x,.5,z*.25]);WK.screw(g,m,[x,1.0,z*.33],[0,z>0?0:PI,0],.04)}});C(g,.6,.7,.12,ch,[0,.06,0],null,[3.6,1,1]);WK.sticker(g,m,'dino','がおー',CA().lime,.5,[0,.4,.42],null);return{g,r:2.2}},
    /* Riesiger Aufziehschlüssel, halb im Boden */
    schluessel(m,r){const g=new THREE.Group();const col=[CA().lemon,CA().strawberry,CA().bondi][Math.floor(r()*3)];C(g,.14,.14,1.4,m.chrome(),[0,.7,0]);
      const w=grp(g,[0,1.55,0],[0,r()*3,0]);both(x=>P(w,G.s(.5),m.gloss(col),[x*.48,0,0],null,[1,.75,.22]));C(w,.18,.18,.3,m.chrome(),[0,0,0],[PI/2,0,0]);
      g.userData.tick=t=>{w.rotation.y+=.004};return{g,r:.7,keep:[w]}},
    /* LCD-Werbetafel mit Lauftext */
    lcdtafel(m,r){const g=new THREE.Group();const ch=m.chrome();both(x=>C(g,.08,.1,3.2,ch,[x*1.3,1.6,0]));B(g,3.0,1.1,.2,.08,WK.candy(m,CA().grape,.75),[0,3.1,0]);
      const c=document.createElement('canvas');c.width=512;c.height=128;const x2=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;
      const msgs=['31.12.1999  23:59  ·  SILVESTER IM KOKON-NETZ  ·  ','FEUERWERK GLEICH FERTIG  ·  BITTE WARTEN  ·  ','KOKON  ·  LERNEN IM SCHLAF!  ·  '];const msg=msgs[Math.floor(r()*msgs.length)].repeat(3);
      const draw=off=>{x2.fillStyle='#0b1530';x2.fillRect(0,0,512,128);x2.fillStyle='#45e0ff';x2.font='56px DotGothic16, monospace';x2.textBaseline='middle';x2.fillText(msg,-off,66);x2.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<512;i+=4)x2.fillRect(i,0,1,128);tex.needsUpdate=true};draw(0);
      const scr=P(g,G.pl(2.7,.82),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}),[0,3.1,.11]);scr.userData.noOutline=true;WK.screws4(g,m,2.82,.96,[0,3.1,.11],null,.04);
      let last=0;g.userData.tick=t=>{const k=Math.floor(t*8);if(k===last)return;last=k;draw((t*90)%1400)};return{g,r:1.5,keep:[scr]}},
    /* Telefonzelle aus Bonbon-Plastik mit Pager-Halter */
    zelle(m,r){const g=new THREE.Group();const ch=m.chrome();const col=[CA().bondi,CA().strawberry,CA().lime][Math.floor(r()*3)];
      for(const x of[-.55,.55])for(const z of[-.55,.55])C(g,.05,.05,2.4,ch,[x,1.2,z]);B(g,1.2,.16,1.2,.06,m.gloss(col),[0,2.48,0]);
      const sh=B(g,1.1,2.2,1.1,.06,WK.candy(m,col,.32),[0,1.15,0]);sh.userData.noMerge=true;B(g,.4,.55,.16,.05,m.c('#e9e4d8'),[0,1.45,-.42]);C(g,.04,.04,.36,m.c('#3b3450'),[.12,1.5,-.32],[0,0,PI/2]);
      WK.lcd(g,m,'zelle',['PAGER 0'],.32,.1,[0,1.8,-.33]);WK.sticker(g,m,'zelle','でんわ',CA().lemon,.5,[0,2.48,.62],null);return{g,r:.9}},
    /* Spielautomat am Strassenrand */
    automat(m,r){const g=new THREE.Group();const col=[CA().grape,CA().tangerine,CA().bondi][Math.floor(r()*3)];B(g,.9,1.8,.8,.1,m.gloss(col),[0,.9,0]);B(g,.8,.62,.08,.05,m.c('#141414'),[0,1.32,.38],[-.15,0,0]);
      const tex=WK.lcdTex('arcade',['HI 99999','INSERT COIN'],{bg:'#0b1530',fg:'#ffd23f',w:256,h:192});FU.decal(g,m,tex,'wk-arc',.7,.52,[0,1.32,.43],[-.15,0,0],true);
      B(g,.9,.12,.3,.04,m.c('#e9e4d8'),[0,.96,.48]);WK.gel(g,m,'#ff6fa5',.05,[.2,1.03,.5],null);WK.gel(g,m,'#7fd34a',.05,[.32,1.03,.48],null);C(g,.02,.02,.14,m.chrome(),[-.2,1.08,.5]);S(g,.05,m.gloss('#ff6fa5'),[-.2,1.16,.5]);return{g,r:.7}},
    /* Röhrenmonitor, von Ranken überwuchert (Kokon 95) */
    crtranke(m,r){const g=new THREE.Group();const tilt=(r()-.5)*.5;const tv=grp(g,[0,0,0],[0,0,tilt]);B(tv,1.3,1.1,1.1,.14,m.c('#d8d2c4'),[0,.55,0]);
      const tex=WK.lcdTex('crt95',['KOKON 95','SCHLAF GUT'],{bg:'#2b2340',fg:'#7fd34a',w:256,h:192});FU.decal(tv,m,tex,'wk-crt95',.95,.72,[0,.6,.56],null,true);
      const leaf=m.c('#3d7a0a',{rim:.6});for(let i=0;i<5;i++){const a=r()*TAU;const pts=range(7,t=>[Math.cos(a+t*3)*.72,t*1.2,Math.sin(a+t*3)*.62]);P(tv,G.tu(pts,.035,.035,24),leaf);for(let k=0;k<3;k++){const p=pts[2+k*2];P(tv,G.s(.1),leaf,p,null,[1.3,.4,.9])}}return{g,r:.9}},
    /* Kabel-Liane mit Stecker, hängt aus einem Baum-Bogen */
    kabel(m,r){const g=new THREE.Group();const ch=m.chrome();both(x=>C(g,.08,.1,2.6,m.c('#7a4a2a'),[x*1.1,1.3,0]));const cols=[CA().strawberry,CA().lime,CA().bondi,CA().lemon];
      for(let i=0;i<4;i++){const x=-.8+i*.55;const pts=[[x-.3,2.55,0],[x,1.4-r()*.4,0],[x+.25,2.55,0]];P(g,G.tu(pts,.035,.035,20),m.gloss(cols[i]));const pl=grp(g,[x,1.3-r()*.4,0]);B(pl,.12,.16,.1,.03,m.c('#fffdf7'),[0,0,0]);both(z=>B(pl,.02,.08,.02,0,ch,[z*.03,-.11,0]))}
      B(g,2.5,.14,.2,.06,m.c('#7a4a2a'),[0,2.6,0]);return{g,r:1.3}},
    /* Bonbon-Blume mit Zahnrad-Mitte */
    gelblume(m,r){const g=new THREE.Group();const col=[CA().strawberry,CA().grape,CA().tangerine,CA().lemon][Math.floor(r()*4)];const h=1.0+r()*.8;
      P(g,G.tu([[0,0,0],[.08,h*.5,0],[0,h,0]],.04,.04,12),m.c('#3d7a0a'));const hd=grp(g,[0,h,0],[-.4,0,0]);for(let i=0;i<6;i++){const a=i/6*TAU;P(hd,G.s(.22),WK.candy(m,col,.6),[Math.cos(a)*.26,Math.sin(a)*.26,0],null,[1,.55,.25])}
      WK.gear(hd,m,.14,[0,0,.04],null,'#ffd23f');both(x=>P(g,G.s(.18),m.c('#3d7a0a'),[x*.18,h*.4,0],null,[1.4,.3,.8]));return{g,r:.5}}};
  /* je Planet: welche Requisiten wie oft */
  const PLAN={urzeit:[['bernstein',6],['dinoskelett',2],['schluessel',4]],metro:[['lcdtafel',4],['zelle',4],['automat',4]],dschungel:[['crtranke',4],['kabel',3],['gelblume',10]]};
  /* ---------- Platzsuche: flach, an Land, weg von Wegen, Gebäuden und anderen Requisiten ---------- */
  function flatEnough(G_,p,rad){const h0=G_.hAt(p);const t1=GAME.tangentTo(p,new THREE.Vector3(1,0,0)),t2=new THREE.Vector3().crossVectors(p,t1);const a=rad/G_.R;
    for(const d of[t1,t2,t1.clone().negate(),t2.clone().negate()])if(Math.abs(G_.hAt(p.clone().addScaledVector(d,a).normalize())-h0)>.22)return false;return true}
  function onPlanet(pid){const list=PLAN[pid];if(!list||typeof GAME==='undefined')return;const G_=GAME.G;const pz=G_.places.find(x=>x.id==='platz');if(!pz)return;
    const M=makeMats({skin:'plastik',color:0});const rnd=srand(hashNum('wplan'+pid));const used=[];placed=[];let n=0;
    for(const[kind,count]of list){for(let c=0;c<count;c++){let spot=null;for(let i=0;i<260&&!spot;i++){const q=GAME.randAround(rnd,22+i*.25,pz.dir);if(!q||!GAME.isLand(q))continue;
        if(GAME.nearPlace(q,1.25))continue;if(G_.roadDist&&G_.roadDist(q)*G_.R<3.2)continue;{const bid=G_.biomeAt(q,G_.hAt(q));if(bid==='strasse'||bid==='parkweg'||bid==='strand')continue}if(used.some(u=>GAME.angle(u,q)*G_.R<6))continue;if(!flatEnough(G_,q,1.4))continue;spot=q}
      if(!spot)continue;try{const pr=PROPS[kind](M,rnd);const g=pr.g;addOutlines(g);if(pr.keep)g.userData.keep=pr.keep;g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});
        GAME.placeObj(g,spot,rnd()*TAU,-.03);G_.scene.add(g);if(g.userData.tick)G_.ticks.push(g);GAME.addObst(spot,pr.r||.8);used.push(spot);placed.push({kind,p:spot});n++}catch(e){console.warn('WIRED-Planet',kind,e)}}}
    return n}
  return{onPlanet,PROPS,PLAN,get placed(){return placed}};
})();
