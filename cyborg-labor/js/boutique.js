/* =====================================================================
   CYBORG-LABOR · boutique.js
   Die Boutique: Kleiderstangen mit echten Kleidungsstücken, Hutständer,
   Schaufensterpuppen im Planeten-Look, Umkleide mit Vorhang, Kasse aus dem
   Kenney Mini-Market-Bausatz (CC0) und Monsieur Boulon, ein feiner
   französischer Roboter mit Schnurrbart, Baskenmütze, Monokel und Fliege.
   Kaufen: Kollektion (je Planet andere Mode + Pariser Klassiker).
   Tragen: Kleiderschrank (auch im Cy-Phone), jedes Teil in jeder Farbe.
   ===================================================================== */
const BOUTIQUE=(()=>{
  const NM='Monsieur Boulon';const VOICE={pitch:230,kind:'robot',speed:1.05};const COL='#D8708E';
  const FR=['Bonjour, mon ami!','Oh là là, quelle élégance!','Magnifique!','Très chic!','Voilà!','Formidable!','C’est parfait!','Merci beaucoup!'];
  const fr=()=>FR[Math.floor(Math.random()*FR.length)];
  /* niedlicher Retro-Fernseher-Roboter: Antennen, grosse Kulleraugen auf dem Bildschirm, Schnurrbart, Baskenmütze, Ringelshirt, Fliege, Monokel */
  const boulon=()=>({name:NM,body:{seg:1,size:1,skin:'plastik',color:15,shape:'ei',pattern:'bauch',color2:16},parts:{kopf:'roehre',augen:'kulleraugen',arme:'mensch',beine:'mensch',extras:[]},
    clothes:{hat:'baskenmuetze',top:'ringelshirt',neck:'fliege',face:'schnurrbart',col:{hat:12,top:13,neck:12,face:3},more:[['face','monokel']]}});
  const pid=()=>(GAME.G&&GAME.G.id)||'kompost';
  /* ---------- Bausatz-Teile ---------- */
  function kput(sc,pk,nm,x,y,z,ry,s,pal){if(typeof KIT==='undefined'||!KIT.has(pk,nm))return null;const b=KIT.bounds(pk,nm);const m=KIT.mesh(pk,nm,pal||KIT.ORIG);const g=new THREE.Group();
    m.scale.setScalar(s);m.position.set(-(b[0]+b[3])/2*s,-b[1]*s,-(b[2]+b[5])/2*s);g.add(m);g.position.set(x,y,z);g.rotation.y=ry||0;sc.add(g);return g}
  const PAL={sand:'#F4E4D6',sandD:'#E8D2C0',wood:'#C99466',woodL:'#E0B48A',wood2:'#A87A5A',wall:'#FFF4EA',trim:'#FFFFFF',light:'#E88CB0',roof:'#E88CB0',roof2:'#D8708E',metal:'#C9A45A',metalD:'#9A7A3E',glass:'#DDF4FF',plant:'#6FBF7A',plantD:'#4E9A5E',stone:'#E8D8CC',dark:'#5A4A5E',roofB:'#8FB8E8',snow:'#FFFFFF'};
  /* ---------- Handgebaute Möbel ---------- */
  /* T-Shirt-Silhouette auf Bügel */
  function garment(M,col,kind){const g=new THREE.Group();const sh=new THREE.Shape();if(kind==='kleid'){sh.moveTo(-.12,0);sh.lineTo(.12,0);sh.lineTo(.2,-.1);sh.lineTo(.13,-.14);sh.lineTo(.26,-.62);sh.lineTo(-.26,-.62);sh.lineTo(-.13,-.14);sh.lineTo(-.2,-.1);sh.lineTo(-.12,0)}
    else{sh.moveTo(-.12,0);sh.lineTo(.12,0);sh.lineTo(.3,-.12);sh.lineTo(.24,-.22);sh.lineTo(.17,-.17);sh.lineTo(.18,-.52);sh.lineTo(-.18,-.52);sh.lineTo(-.17,-.17);sh.lineTo(-.24,-.22);sh.lineTo(-.3,-.12);sh.lineTo(-.12,0)}
    P(g,G.puff(sh,.03,.015),M.c(col),[0,-.08,0]);P(g,G.to(.05,.008,PI),M.chrome(),[0,.0,0],[0,0,0]);P(g,G.cy(.006,.006,.2),M.chrome(),[0,-.06,0],[0,0,PI/2]);return g}
  function rack(M,cols,r){const g=new THREE.Group();const st=M.chrome();for(const s of[-1,1]){P(g,G.cy(.025,.025,1.6),st,[s*.9,.8,0]);P(g,G.cy(.18,.2,.04),st,[s*.9,.02,0])}P(g,G.cy(.022,.022,1.9),st,[0,1.58,0],[0,0,PI/2]);
    cols.forEach((c,i)=>{const gm=garment(M,c,r()<.35?'kleid':'shirt');gm.position.set(-.72+i*(1.44/(cols.length-1)),1.58,0);gm.rotation.y=PI/2+(r()-.5)*.2;g.add(gm)});addOutlines(g);return g}
  /* Hutständer mit echtem Hut aus dem Katalog */
  function hatStand(M,it,col){const g=new THREE.Group();P(g,G.cy(.16,.2,.05),M.c('#E8D2C0'),[0,.025,0]);P(g,G.cy(.025,.025,1.1),M.c('#C9A45A'),[0,.58,0]);P(g,G.s(.2),M.c('#FFF6EE'),[0,1.2,0],null,[1,1.1,1]);
    const H={cy:1.2,r:.2,top:1.42,front:.19,faceY:1.2,sideX:.2};const q=new THREE.Group();try{it.b(q,M,H,col)}catch(e){}g.add(q);addOutlines(g);return g}
  /* Stapel gefalteter Pullis */
  function folded(M,cols){const g=new THREE.Group();cols.forEach((c,i)=>P(g,G.bx(.34,.07,.26,.03),M.c(c),[0,.035+i*.075,0],[0,(i%2)*.1,0]));addOutlines(g);return g}
  /* Schaufensterpuppe: echte Figur in Porzellanweiss, trägt ein Planeten-Outfit */
  function mannequin(M,clothes,shape){const d=sanitize({name:'Puppe',body:{seg:1,size:.95,skin:'keramik',color:16,shape,pattern:'keine',color2:16},parts:{kopf:'ei',augen:PARTS.augen.find(p=>p.k==='none')?PARTS.augen.find(p=>p.k==='none').id:'zwei',arme:'mensch',beine:'mensch',extras:[]},clothes});
    const g=new THREE.Group();let c=null;try{c=buildCreature(d,{q:HIGH?.55:.4,noShadow:!HIGH,blob:false,merge:true});c.scale.setScalar(CS);g.add(c)}catch(e){console.warn('Puppe',e)}
    P(g,G.cy(.42,.46,.12,),M.c('#F4E4D6'),[0,.06,0]);P(g,G.cy(.44,.44,.03),M.c('#C9A45A'),[0,.125,0]);if(c)c.position.y=.14;return g}
  /* ---------- Raum ---------- */
  function build(sc){const W=12,D=9,H=3.6;INTERIOR.makeRoom(sc,W,D,H,'boutique','fliesen',{trim:'#E8A0B8',curtain:'#F2B8CC',frame:'#FFFFFF',mat:'#D8708E'});const A=INTERIOR.actions,C=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});const r=srand(hashStr('btq'+pid()).length*97+3);
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.26;o.color.set('#FFF2EA')}});
    const cat=CLOTHES.forPlanet(pid());const tops=cat.filter(x=>x.slot==='top'),hats=cat.filter(x=>x.slot==='hat');const pcols=[...new Set(cat.map(x=>x.col))];
    /* Kleiderstangen links und rechts */
    for(const[x,z,ry]of[[-4.2,-2.2,PI/2],[-4.2,1.2,PI/2],[4.1,1.4,-PI/2]]){const g=rack(M,[0,1,2,3,4,5].map(i=>pcols[(i+Math.floor(r()*9))%pcols.length]||SKIN_COLORS[i*3%18]),r);g.position.set(x,0,z);g.rotation.y=ry;sc.add(g);C.push({x0:x-.4,x1:x+.4,z0:z-1.05,z1:z+1.05});A.push({x:x+(x<0?1:-1),z,r:1.4,label:'Kollektion ansehen',act:()=>shop()})}
    /* Hutständer vorn am Schaufenster */
    /* Hut-Ecke rechts vorn (nicht im Eingang) */const HP=[[2.2,2.1],[3.1,2.7],[2.2,3.4],[3.1,3.95]];hats.slice(0,4).forEach((it,i)=>{const[x,z]=HP[i];const g=hatStand(M,it,it.col);g.position.set(x,0,z);g.rotation.y=-.6;sc.add(g);C.push({x0:x-.22,x1:x+.22,z0:z-.22,z1:z+.22})});A.push({x:1.5,z:2.8,r:1.5,label:'Hüte anschauen',act:()=>shop('hat')});
    /* Schaufensterpuppen im Planeten-Look */
    const shapes=['ei','birne','glocke'];for(let i=0;i<3;i++){const m=mannequin(M,CLOTHES.random(srand(i*31+pid().length),pid()),shapes[i]);m.position.set(-1.9+i*1.9,0,-3.1);m.rotation.y=(i-1)*-.25;sc.add(m);C.push({x0:-2.35+i*1.9,x1:-1.45+i*1.9,z0:-3.55,z1:-2.65})}
    /* Regal mit gefalteten Pullis, Sofa, Pflanzen, Teppich, Lampen (Kenney-Möbel) */
    const sh=kput(sc,'furn','bookcaseOpen',5.45,0,-2.3,-PI/2,2.4,PAL);C.push({x0:5,x1:5.9,z0:-3,z1:-1.6});for(let k=0;k<3;k++){const f=folded(M,[0,1,2].map(j=>pcols[(k*3+j)%pcols.length]||'#F28CB0'));f.position.set(5.35,.28+k*.66,-2.3);f.rotation.y=PI/2;sc.add(f)}
    kput(sc,'furn','loungeDesignSofa',-5.3,0,3.2,PI/2,2.2,PAL);C.push({x0:-5.9,x1:-4.7,z0:2,z1:4.3});kput(sc,'furn','rugRound',0,0,.6,0,2.6,PAL);
    /* Mitte: runde Bühne mit einer Puppe in der neuesten Kollektion (dreht sich langsam) */{const pg=grp(sc,[0,0,.6]);P(pg,G.cy(.85,.95,.3,28),M.c('#FFF4F8'),[0,.15,0]);P(pg,G.cy(.95,.95,.05,28),M.c('#C9A45A',{gloss:1}),[0,.31,0]);
      const m=mannequin(M,CLOTHES.random(srand(97+pid().length),pid()),'ei');m.position.y=.33;pg.add(m);sc.userData.podium=pg;C.push({x0:-.95,x1:.95,z0:-.35,z1:1.55});A.push({x:0,z:2.1,r:1.2,label:'Kollektion ansehen',act:()=>shop()})}
    kput(sc,'furn','pottedPlant',4.6,0,3.95,0,1.9);kput(sc,'furn','pottedPlant',-5.5,0,-3.9,0,1.9);kput(sc,'furn','coatRackStanding',5.4,0,.1,0,2.4,PAL);C.push({x0:5.1,x1:5.7,z0:-.2,z1:.4});
    /* Kasse (Kenney Mini Market) mit Monsieur Boulon dahinter */
    kput(sc,'market','cash-register',3.2,0,-3.3,PI,1.9,PAL);C.push({x0:2.3,x1:4.1,z0:-4,z1:-2.5});kput(sc,'market','shopping-basket',2.3,1.12,-3.2,.4,1.4,PAL);
    let bo=null;try{bo=buildCreature(boulon(),{q:HIGH?.65:.45,noShadow:!HIGH,blob:false,merge:true});bo.scale.setScalar(CS);bo.position.set(3.4,0,-4.05);sc.add(bo);sc.userData.boulon=bo}catch(e){console.warn('Boulon',e)}
    A.push({x:3.2,z:-2.1,r:1.5,label:'Mit '+NM+' sprechen',act:()=>talk()});
    /* Umkleide mit Vorhang + grosser Spiegel */
    if(typeof CLINIC!=='undefined'){const c1=CLINIC.curtain(M,1.8,H,.15,false,'#F2B8CC','#C9A45A');c1.position.set(-3.1,0,3.35);c1.rotation.y=PI/2;sc.add(c1);const c2=CLINIC.curtain(M,1.6,H,.55,true,'#F2B8CC','#C9A45A');c2.position.set(-2.2,0,2.55);sc.add(c2)}
    C.push({x0:-4,x1:-2.2,z0:3.3,z1:3.5});A.push({x:-3,z:2.6,r:1.3,label:'Umkleide: Kleidung anziehen',act:()=>wardrobe()});
    const mir=new THREE.Group();P(mir,G.bx(1.1,2.1,.1,.06),M.c('#C9A45A'),[0,0,0]);const gl=P(mir,G.bx(.92,1.9,.02,.02),new THREE.MeshBasicMaterial({color:'#EAF6FF',toneMapped:false}),[0,0,.06]);gl.userData.noOutline=true;addOutlines(mir);const mz=INTERIOR.wallSlot?INTERIOR.wallSlot('right',2.4,1.1):2.4;mir.position.set(5.93,1.35,mz);mir.rotation.y=-PI/2;sc.add(mir);
    A.push({x:5.1,z:mz,r:1.2,label:'In den Spiegel schauen',act:()=>wardrobe()});
    INTERIOR.lamp(sc,'kron',0,H-.05,-.4,{H,col:'#FFF0DA',i:.85,d:10});INTERIOR.lamp(sc,'wand',-5.9,2.2,-.4,{ry:PI/2,col:'#FFE0C8'});INTERIOR.lamp(sc,'wand',5.9,2.2,-.8,{ry:-PI/2,col:'#FFE0C8'});
    /* Schild über der Kasse */const t=ctex('btq-schild-'+pid(),512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#D8708E';x.font='italic bold 58px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText(((TOWN.NAMES[pid()]||{}).mode)||'Boutique',w/2,h/2)});
    const sg=P(sc,G.pl(3.6,.9),new THREE.MeshBasicMaterial({map:t,transparent:true}),[3.2,2.85,-D/2+.04]);sg.userData.noOutline=true;
    return{W,D,camD:14}}
  /* ---------- Gespräch ---------- */
  async function talk(){const lines=[fr()+' Willkommen in meiner Boutique!','Hier gibt es Mode für jeden Körper – und die neueste Kollektion von '+((PLANETS[pid()]||{}).n||'hier')+'.'];
    const ch=await UI.talk(NM,lines,{voice:VOICE,color:COL,choices:['Kollektion ansehen','Umziehen','Au revoir!']});if(ch===0)shop();else if(ch===1)wardrobe();else await UI.talk(NM,['À bientôt, mon ami! Bleib schick!'],{voice:VOICE,color:COL})}
  /* ---------- Vorschaubild: deine Figur trägt das Teil ---------- */
  const thumbs=new Map();
  function preview(slot,id,colI){const k=slot+id+colI;if(thumbs.has(k))return thumbs.get(k);let url='';try{const base=GAME.avatarData?GAME.avatarData():DEFAULT();const d=JSON.parse(JSON.stringify(base));d.clothes={col:{}};d.clothes[slot]=id;if(colI!=null)d.clothes.col[slot]=colI;
      const g=new THREE.Group();g.add(buildCreature(sanitize(d),{q:.5,noShadow:true,blob:false}));addOutlines(g);url=renderThumbGroup(g,new THREE.Vector3(.35,.25,1));disposeTree(g)}catch(e){console.warn('Vorschau',e)}thumbs.set(k,url);return url}
  function img(url){const i=new Image();i.src=url;i.className='btq-img';i.alt='';return i}
  /* ---------- Kaufen ---------- */
  function shop(onlySlot){const w=UI.win(((TOWN.NAMES[pid()]||{}).mode)||'Boutique',{size:'wide'});const owned=()=>SAVE.wardrobe=SAVE.wardrobe||[];const cat=CLOTHES.forPlanet(pid());let slot=onlySlot||'hat';
    const tabs=el('div','seg');const grid=el('div','grid btq-grid');w.body.append(el('p','sub',NM+': «'+fr()+' Alles frisch aus Paris – und passend für '+((PLANETS[pid()]||{}).n||'deinen Planeten')+'.»'),tabs,grid);
    const draw=()=>{tabs.replaceChildren();for(const S of CLOTHES.SLOTS){const b=el('button',null,S.n);b.type='button';b.setAttribute('aria-pressed',slot===S.id);b.onclick=()=>{slot=S.id;draw()};tabs.append(b)}
      grid.replaceChildren();const list=cat.filter(x=>x.slot===slot);if(!list.length){grid.append(el('p','empty','Diese Saison nichts in dieser Abteilung.'));return}
      for(const it of list){const has=owned().some(o=>o.slot===it.slot&&o.id===it.id);const price=Math.round(it.price*(CLOTHES.PARIS.includes(it.id)&&!(CLOTHES.PLANET[pid()]||[]).includes(it.id)?1.4:1));
        const c=el('button','card');c.type='button';c.append(img(preview(it.slot,it.id,null)),el('b',null,it.n),el('span','sub',has?'im Schrank':fmt(price)+' Taler'+(CLOTHES.PARIS.includes(it.id)?' · Paris':'')));
        c.onclick=async()=>{if(has){w.close();wardrobe(it.slot);return}if(SAVE.money<price){SND.play('error');UI.toast('Dafür fehlen dir noch Taler.');return}
          money(-price);owned().push({slot:it.slot,id:it.id});SAVE.wear=SAVE.wear||{col:{}};SAVE.wear[it.slot]=it.id;persist();SND.jingle('j_success');GAME.onAvatarChanged();UI.toast(it.n+' gekauft und angezogen! '+fr());draw()};grid.append(c)}};draw()}
  /* ---------- Kleiderschrank: anziehen, ausziehen, umfärben ---------- */
  function wardrobe(first){const w=UI.win('Kleiderschrank',{size:'wide'});const own=SAVE.wardrobe=SAVE.wardrobe||[];const wear=SAVE.wear=SAVE.wear||{col:{}};wear.col=wear.col||{};let slot=first||'hat';
    const tabs=el('div','seg'),grid=el('div','grid btq-grid'),sw=el('div','swatches');w.body.append(tabs,grid,el('b',null,'Farbe'),sw);
    const apply=()=>{persist();GAME.onAvatarChanged();SND.play('soft')};
    const draw=()=>{tabs.replaceChildren();for(const S of CLOTHES.SLOTS){const b=el('button',null,S.n);b.type='button';b.setAttribute('aria-pressed',slot===S.id);b.onclick=()=>{slot=S.id;draw()};tabs.append(b)}
      grid.replaceChildren();const none=el('button','card');none.type='button';none.setAttribute('aria-pressed',!wear[slot]);none.append(el('b',null,'Nichts'),el('span','sub','ausziehen'));none.onclick=()=>{delete wear[slot];apply();draw()};grid.append(none);
      const mine=own.filter(o=>o.slot===slot);if(!mine.length)grid.append(el('p','empty','Noch nichts gekauft. Schau in der Boutique vorbei!'));
      for(const o of mine){const it=CLOTHES.find(o.slot,o.id);if(!it)continue;const c=el('button','card');c.type='button';c.setAttribute('aria-pressed',wear[slot]===o.id);c.append(img(preview(slot,o.id,wear.col[slot])),el('b',null,it.n));c.onclick=()=>{wear[slot]=o.id;apply();draw()};grid.append(c)}
      sw.replaceChildren();const orig=el('button','orig');orig.type='button';orig.title='Originalfarbe';orig.setAttribute('aria-pressed',wear.col[slot]==null);orig.onclick=()=>{delete wear.col[slot];apply();draw()};sw.append(orig);
      SKIN_COLORS.forEach((c,i)=>{const b=el('button');b.type='button';b.style.background=c;b.setAttribute('aria-label','Farbe '+(i+1));b.setAttribute('aria-pressed',wear.col[slot]===i);b.onclick=()=>{wear.col[slot]=i;apply();draw()};sw.append(b)})};draw()}
  INTERIOR.kinds.boutique={bg:'#F6E6EE',music:'shop',build,frame(dt,t){const pd=INTERIOR.scene&&INTERIOR.scene.userData.podium;if(pd)pd.rotation.y+=dt*.3;const b=INTERIOR.scene&&INTERIOR.scene.userData.boulon;if(b){b.userData.tick&&b.userData.tick(t,false,UI.typing?1:0);b.rotation.y=Math.sin(t*.6)*.2;const es=b.userData.eyes||[];const ph=(t+.7)%3.7;const k=ph<.14?1-Math.sin(ph/.14*PI)*.92:1;for(const q of es)q.scale.y=k}}};
  return{shop,wardrobe,talk}
})();
