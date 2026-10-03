/* =====================================================================
   CYBORG-LABOR · wplanets.js
   WIRED-Umbau je Planet: eigene Candy-Mech-Requisiten, die zeigen, aus
   welchem Kindertraum NEMURI den Planeten gebaut hat.
   Urzeit = Spielzeug-Urzeit · Metro = Y2K-Stadt · Dschungel = überwucherter
   Kokon-95-Server. Dazu je ein Set für die 11 übrigen Planeten
   (Kapselbeete, Röhrenmonitore, Schneekugeln, Riesen-Wecker …). Alles steht auf flachem Boden, abseits von Wegen und
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
      WK.gear(hd,m,.14,[0,0,.04],null,'#ffd23f');both(x=>P(g,G.s(.18),m.c('#3d7a0a'),[x*.18,h*.4,0],null,[1.4,.3,.8]));return{g,r:.5}},
    /* ---- Kompost: Beet mit halb vergrabenen Kapselspielzeugen ---- */
    kapselbeet(m,r){const g=new THREE.Group();C(g,1.1,1.15,.3,m.c('#c9b8a0'),[0,.15,0]);C(g,1.0,1.0,.06,m.c('#6e4a3a'),[0,.31,0]);const cols=[CA().bondi,CA().strawberry,CA().lemon,CA().grape,CA().lime];
      for(let i=0;i<5;i++){const a=i/5*TAU+r();const q=grp(g,[Math.cos(a)*.55,.36,Math.sin(a)*.55],[r()*.6,r()*3,r()*.6]);P(q,G.hs(.24),m.gloss(cols[i]),[0,0,0]);P(q,G.hs(.24),m.c('#ffffff',{opacity:.45}),[0,0,0],[PI,0,0]);P(q,G.to(.24,.02),m.chrome(),[0,0,0],[PI/2,0,0])}
      WK.sticker(g,m,'beet','カプセル',CA().lemon,.5,[0,.3,1.12],null);return{g,r:1.2}},
    /* ---- Schrott: Stapel alter Röhrenmonitore und Konsolen ---- */
    crtstapel(m,r){const g=new THREE.Group();let y=0;for(let i=0;i<3;i++){const w=1.2-i*.18;const q=grp(g,[(r()-.5)*.2,y,0],[0,(r()-.5)*.5,0]);B(q,w,w*.82,w*.85,.1,m.c(i%2?'#d8d2c4':'#bdb6c8'),[0,w*.41,0]);P(q,G.pl(w*.72,w*.55),m.flat(['#2b2340','#1d2b0b','#0b1530'][i]),[0,w*.43,w*.43]);y+=w*.82}
      const k=B(g,.6,.12,.4,.04,WK.candy(m,CA().grape,.7),[.9,.06,.3]);WK.gel(g,m,'#ff6fa5',.04,[1.0,.14,.35],[-PI/2,0,0]);return{g,r:1}},
    /* ---- Schrott: Blech-Roboter aus einer Dose, mit Aufziehschlüssel ---- */
    roboterdose(m,r){const g=new THREE.Group();const ch=m.chrome();C(g,.55,.55,1.3,m.metal('steel'),[0,.65+.25,0]);for(const y of[.4,1.4])P(g,G.to(.56,.04),ch,[0,y,0],[PI/2,0,0]);
      both(x=>{C(g,.12,.12,.25,ch,[x*.3,.12,0]);C(g,.07,.07,.7,ch,[x*.62,1.0,0],[0,0,x*.5])});C(g,.4,.45,.5,m.metal('steel'),[0,1.8,0]);both(x=>S(g,.1,m.glow('#ffd23f',1.6),[x*.15,1.85,.42]));
      const k=grp(g,[0,.9,-.6],[PI/2,0,0]);C(k,.04,.04,.3,ch,[0,.15,0]);both(x=>P(k,G.s(.16),m.gloss(CA().lemon),[x*.15,.32,0],null,[1,.8,.25]));g.userData.tick=t=>{k.rotation.y=t*1.5};return{g,r:.8,keep:[k]}},
    /* ---- Korallen: Korallen aus Bonbon-Röhren ---- */
    kapselkoralle(m,r){const g=new THREE.Group();const col=[CA().strawberry,CA().tangerine,CA().grape][Math.floor(r()*3)];const mt=WK.candy(m,col,.6);
      const br=(p,d,l,depth)=>{const e=[p[0]+d[0]*l,p[1]+d[1]*l,p[2]+d[2]*l];P(g,G.tu([p,e],.07+depth*.03,.07+depth*.03,6),mt);P(g,G.s(.1+depth*.02),m.gloss(col),e);if(depth>0)for(let i=0;i<2;i++){const a=r()*TAU;br(e,[Math.cos(a)*.5,.9,Math.sin(a)*.5],l*.7,depth-1)}};
      br([0,0,0],[0,1,0],.8,2);WK.gear(g,m,.12,[0,.3,.1],null,'#e6ecf5');return{g,r:.8}},
    /* ---- Frost: Riesen-Schneekugel auf Zahnrad-Sockel ---- */
    schneekugel(m,r){const g=new THREE.Group();C(g,.75,.85,.5,m.gloss(CA().grape),[0,.25,0]);WK.gear(g,m,.3,[0,.25,.82],null,'#e6ecf5');const gl=P(g,G.s(.8),m.glass('#e6f6ff'),[0,1.2,0]);gl.userData.noMerge=true;
      P(g,G.cy(.45,.5,.6),m.c('#fffdf7'),[0,.75,0]);const cone=P(g,G.cy(0,.25,.6),m.c('#3d7a0a'),[0,1.05,0]);const fl=[];for(let i=0;i<12;i++)fl.push(S(g,.03,m.c('#ffffff'),[(r()-.5)*1.1,.9+r()*.8,(r()-.5)*1.1]));
      g.userData.tick=t=>fl.forEach((f,i)=>{f.position.y=.85+((t*.12+i*.083)%1)*.95});return{g,r:1,keep:fl}},
    /* ---- Frost: Eisblock mit leuchtendem LCD darin ---- */
    eislcd(m,r){const g=new THREE.Group();const ice=B(g,1.2,1.0,.9,.12,m.c('#cfefff',{opacity:.55,gloss:1.4,rim:1.3}),[0,.5,0],[0,r(),0]);ice.userData.noMerge=true;const l=WK.lcd(g,m,'eis',['23:59'],.5,.22,[0,.5,0],[0,r(),0]);return{g,r:.8}},
    /* ---- Wüste: halb vergrabene Riesen-Handheld-Konsole ---- */
    sandkonsole(m,r){const g=new THREE.Group();const q=grp(g,[0,-.2,0],[-.9,r()*3,.15]);B(q,1.6,2.4,.4,.18,m.c('#d8d2c4'),[0,1.2,0]);B(q,1.1,.9,.06,.05,m.c('#8b93a6'),[0,1.75,.2]);P(q,G.pl(.86,.7),m.flat('#9bbc0f'),[0,1.75,.24]);
      B(q,.5,.14,.08,.03,m.c('#3b3450'),[-.35,.8,.2]);B(q,.14,.5,.08,.03,m.c('#3b3450'),[-.35,.8,.2]);both(x=>S(q,.12,m.gloss('#c22c46'),[.4+x*.15,.85+x*.12,.2]));return{g,r:1.3}},
    /* ---- Wüste: Kaktus aus Gel ---- */
    gelkaktus(m,r){const g=new THREE.Group();const mt=WK.candy(m,CA().lime,.65);const h=1.6+r()*.8;P(g,G.ca(.28,h-.56),mt,[0,h/2,0]);both(x=>{const a=grp(g,[x*.28,h*.45,0]);P(a,G.ca(.14,.3),mt,[x*.2,0,0],[0,0,PI/2]);P(a,G.ca(.14,.35),mt,[x*.38,.22,0])});
      P(g,G.star(.12,.05,5,.04),m.gloss(CA().strawberry),[0,h+.04,0],[PI/2,0,0]);WK.gear(g,m,.12,[0,h*.4,0],null,'#e6ecf5');return{g,r:.6}},
    /* ---- Sporen-Mond: Pilze mit Kapselspielzeug-Hüten ---- */
    kapselpilz(m,r){const g=new THREE.Group();const col=[CA().strawberry,CA().grape,CA().bondi][Math.floor(r()*3)];const h=1+r()*1.2;C(g,.16,.22,h,m.c('#fffdf7'),[0,h/2,0]);P(g,G.hs(.6),m.gloss(col),[0,h,0]);P(g,G.hs(.6),m.c('#ffffff',{opacity:.4}),[0,h,0],[PI,0,0]);
      P(g,G.to(.6,.03),m.chrome(),[0,h,0],[PI/2,0,0]);S(g,.12,m.glow('#c6a9ff',1.8),[0,h-.2,0]);return{g,r:.7}},
    /* ---- Riesengarten: riesiger Gelstift im Boden ---- */
    riesenstift(m,r){const g=new THREE.Group();const col=[CA().strawberry,CA().bondi,CA().grape,CA().lime][Math.floor(r()*4)];const q=grp(g,[0,0,0],[(r()-.5)*.5,r()*3,(r()-.5)*.4]);
      C(q,.22,.22,3.2,WK.candy(m,col,.45),[0,1.9,0]);C(q,.08,.08,3.0,m.gloss(col),[0,1.9,0]);C(q,.24,.24,.6,m.gloss(col),[0,3.6,0]);C(q,.2,.05,.4,m.c('#3b3450'),[0,.2,0]);B(q,.06,.8,.1,.02,m.chrome(),[.25,3.3,0]);return{g,r:.5}},
    /* ---- Riesengarten: Radiergummi so gross wie ein Sofa ---- */
    radierer(m,r){const g=new THREE.Group();B(g,2.2,.8,1.2,.2,m.c('#ffb8d8',{rim:.4}),[0,.4,0]);B(g,1.2,.82,1.22,.05,m.gloss(CA().bondi),[.55,.41,0]);WK.sticker(g,m,'radi','けしごむ',CA().lemon,.6,[-.4,.55,.61],null);return{g,r:1.3}},
    /* ---- Wolkenarchipel: Bonbon-Wetterstation ---- */
    wetterstation(m,r){const g=new THREE.Group();const ch=m.chrome();C(g,.06,.08,2.4,ch,[0,1.2,0]);const top=grp(g,[0,2.4,0]);for(let i=0;i<3;i++){const a=i/3*TAU;const c=grp(top,[0,0,0],[0,a,0]);C(c,.015,.015,.5,ch,[.25,0,0],[0,0,PI/2]);P(c,G.hs(.1),m.gloss(CA().tangerine),[.5,0,0],[0,0,-PI/2])}
      g.userData.tick=t=>{top.rotation.y=t*2};B(g,.6,.5,.3,.08,WK.candy(m,CA().bondi,.6),[0,1.3,0]);WK.lcd(g,m,'wetter',['WOLKIG'],.5,.18,[0,1.34,.16]);return{g,r:.5,keep:[top]}},
    /* ---- Bibliothek: Türme aus Disketten ---- */
    diskturm(m,r){const g=new THREE.Group();const cols=[CA().bondi,CA().grape,CA().strawberry,CA().lime,CA().tangerine,'#3b3450'];let y=0;const n=6+Math.floor(r()*6);for(let i=0;i<n;i++){const q=grp(g,[0,y,0],[0,(r()-.5)*.6,0]);B(q,.9,.08,.95,.02,m.gloss(cols[i%6]),[0,.04,0]);B(q,.5,.085,.3,.01,m.chrome(),[0,.04,.3]);y+=.09}return{g,r:.7}},
    /* ---- Uhrwerk-Mond: riesiger Wecker, steht auf 23:59 ---- */
    riesenwecker(m,r){const g=new THREE.Group();C(g,.9,.9,.6,m.gloss(CA().strawberry),[0,1.1,0],[PI/2,0,0]);P(g,G.circ(.8),m.c('#fffdf7'),[0,1.1,.31]);WK.lcd(g,m,'wecker',['23:59'],.6,.24,[0,1.0,.33]);
      both(x=>{P(g,G.hs(.32),m.gloss(CA().lemon),[x*.55,1.95,0],[0,0,x*-.4]);C(g,.06,.06,.6,m.chrome(),[x*.55,.35,0],[0,0,x*.3])});const hm=grp(g,[0,2.05,0]);C(hm,.03,.03,.2,m.chrome(),[0,0,0]);
      g.userData.tick=t=>{hm.rotation.z=Math.sin(t*20)*.3*(Math.sin(t*.5)>.8?1:0)};return{g,r:1,keep:[hm]}},
    /* ---- Klang-Planet: riesiger Kassettenrekorder und Kassetten ---- */
    riesenboombox(m,r){const g=new THREE.Group();B(g,3.2,1.5,.9,.2,m.gloss('#3b3450'),[0,.75,0]);both(x=>{C(g,.48,.48,.1,m.chrome(),[x*1.0,.75,.45],[PI/2,0,0]);const sp=C(g,.36,.36,.12,m.c('#1d1a26'),[x*1.0,.75,.47],[PI/2,0,0])});
      B(g,.8,.42,.06,.04,WK.candy(m,CA().bondi,.6),[0,.9,.46]);WK.lcd(g,m,'boom2',['FM 23.59'],.5,.14,[0,.45,.47]);C(g,.05,.05,2.6,m.chrome(),[0,1.65,0],[0,0,PI/2]);return{g,r:1.8}},
    riesenkassette(m,r){const g=new THREE.Group();const q=grp(g,[0,0,0],[-1.25,r()*3,0]);const col=[CA().tangerine,CA().grape,CA().lime][Math.floor(r()*3)];B(q,2.0,.25,1.25,.08,WK.candy(m,col,.7),[0,.13,0]);
      both(x=>{C(q,.22,.22,.27,m.c('#fffdf7'),[x*.5,.13,-.1]);C(q,.08,.08,.28,m.c('#3b3450'),[x*.5,.13,-.1])});B(q,1.2,.26,.3,.03,m.c('#fffdf7'),[0,.13,.35]);return{g,r:1.1}}};

  /* je Planet: welche Requisiten wie oft */
  const PLAN={urzeit:[['bernstein',6],['dinoskelett',2],['schluessel',4]],metro:[['lcdtafel',4],['zelle',4],['automat',4]],dschungel:[['crtranke',4],['kabel',3],['gelblume',10]],
    kompost:[['kapselbeet',5],['gelblume',6],['schluessel',2]],schrott:[['crtstapel',5],['roboterdose',3],['automat',2]],korallen:[['kapselkoralle',10],['zelle',2]],
    frost:[['schneekugel',4],['eislcd',6]],wueste:[['sandkonsole',2],['gelkaktus',10],['bernstein',3]],pilz:[['kapselpilz',12],['crtranke',2]],
    riesengarten:[['riesenstift',6],['radierer',2],['gelblume',6]],wolkenarchipel:[['wetterstation',5],['gelblume',6]],bibliothek:[['diskturm',8],['crtranke',2]],
    uhrwerk:[['riesenwecker',4],['schluessel',6]],klang:[['riesenboombox',2],['riesenkassette',5],['lcdtafel',2]]};
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
