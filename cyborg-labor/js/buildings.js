/* =====================================================================
   CYBORG-LABOR · buildings.js
   Begehbare Gebäude im Dorfzentrum:
   · Laden: Regale mit dem Tagessortiment, Schrotti der Schrottroboter an
     der Kasse (verkaufen, Aufträge für Extra-Taler)
   · Jazz-Bar: Bühne mit Klavier, Schlagzeug, Bass, Saxofon, Mikrofon –
     mitspielen (immer im Takt, immer passende Töne), tanzen, Getränke
   · Rathaus: Bürgermeister:in des Planeten, Dorf-Aufträge, Dorf-Sterne
   · Gärtnerei (Setzlinge zum Einpflanzen) und Tierhandlung (Haustier)
   ===================================================================== */
/* ---------- Setzlinge (werden als Taschen-Gegenstand „plant“ geführt) ---------- */
const SEEDS=[];
(function(){const add=(id,type,n,price,planet)=>SEEDS.push({id,type,n,price,planet,b:(g,m,o,r)=>{const nat=NATURE[type];if(nat){const q=new THREE.Group();try{nat.b(q,m,{planet:planet},srand(3))}catch(e){}g.add(q);const bb=new THREE.Box3().setFromObject(q);const s=1.2/Math.max(.3,bb.max.y);q.scale.setScalar(Math.min(1,s))}}});
  [['blume','Blumen-Setzling',120,'alle'],['sonnenblume','Sonnenblume',220,'kompost'],['lavendel','Lavendel',200,'kompost'],['busch','Beeren-Busch',400,'kompost'],['obstbaum','Obstbaum',900,'kompost'],['kirschbaum','Kirschbaum',1200,'kompost'],['birke','Birke',700,'kompost'],['hortensienbusch','Hortensie',350,'kompost'],
   ['antennenbaum','Antennenbaum',800,'schrott'],['kristallbaum','Kristallbaum',1400,'schrott'],['glühpilz','Glühpilz',260,'schrott'],
   ['palme','Palme',1000,'korallen'],['kokospalme_klein','Kokos-Palme',800,'korallen'],['koralle','Korallenstock',500,'korallen'],
   ['schneetanne','Schneetanne',900,'frost'],['winterbirke','Winterbirke',800,'frost'],['schneebusch','Schneebusch',300,'frost'],
   ['saguaro','Saguaro-Kaktus',700,'wueste'],['feigenkaktus','Feigenkaktus',450,'wueste'],['wuestenblume','Wüstenblume',180,'wueste'],
   ['pilzbaum','Pilzbaum',1100,'pilz'],['leuchtpilzgruppe','Leuchtpilze',300,'pilz'],['sporenblume','Sporenblume',220,'pilz']].forEach(([t,n,p,pl])=>add('setz_'+t,t,n,p,pl))})();

const MISSIONS=(()=>{
  const ST=k=>SAVE.stats[k]||0;
  const T={
    robot:[{key:'deliver',id:'schraube',n:3,r:420,t:'Bring mir 3 Schrauben'},{key:'deliver',id:'ast',n:4,r:300,t:'Bring mir 4 Äste für mein Feuerholz-Lager'},{key:'deliver',id:'kiesel',n:5,r:260,t:'Ich sammle Kiesel. Bring mir 5!'},{key:'deliver',id:'muschel',n:3,r:360,t:'3 Muscheln für meine Deko, bitte!'},
      {key:'deliver',id:'kabelrest',n:2,r:380,t:'2 Kabelreste – für meine Stromleitung'},{key:'deliver',id:'stein_klein',n:4,r:280,t:'4 kleine Steine für mein Mosaik'},{key:'stat',stat:'sold',n:6,r:350,t:'Verkauf mir 6 Sachen'},{key:'stat',stat:'fish',n:3,r:450,t:'Fang 3 Fische'},{key:'stat',stat:'bugs',n:3,r:450,t:'Fang 3 Insekten'},{key:'stat',stat:'shakes',n:5,r:300,t:'Schüttle 5 Bäume'}],
    mayor:[{key:'stat',stat:'talks',n:4,r:500,t:'Sprich mit 4 Bewohner:innen'},{key:'stat',stat:'pets',n:3,r:500,t:'Streichle 3 Tiere'},{key:'stat',stat:'planted',n:2,r:700,t:'Pflanze 2 Setzlinge im Dorf'},{key:'stat',stat:'jam',n:24,r:600,t:'Spiel 24 Töne in der Jazz-Bar'},
      {key:'stat',stat:'dances',n:2,r:400,t:'Tanz zweimal mit anderen'},{key:'stat',stat:'donated',n:1,r:800,t:'Spende etwas ans Museum'},{key:'stat',stat:'fish',n:5,r:650,t:'Fang 5 Fische für das Dorffest'},{key:'stat',stat:'drinks',n:2,r:300,t:'Probier 2 Getränke in der Bar'},{key:'stat',stat:'litter',n:5,r:500,t:'Sammle 5 Dinge vom Boden auf (Äste, Steine, Unkraut)'}]};
  function st(){if(!SAVE.missions)SAVE.missions={active:[],rating:0,done:0};return SAVE.missions}
  function statNow(k){if(k==='donated'){const d=SAVE.donated||{};return(d.fish||[]).length+(d.bugs||[]).length+(d.relics||[]).length+(d.art||[]).length}return ST(k)}
  function prog(m){if(m.key==='deliver'){const e=SAVE.bag.find(x=>x.kind==='item'&&x.id===m.id);return Math.min(m.n,e?e.n:0)}return Math.min(m.n,statNow(m.stat)-m.base)}
  function offers(giver){const day=Math.floor(Date.now()/864e5);const r=srand(day*13+giver.length+GAME.G.id.length*7);const list=T[giver].filter(m=>m.key!=='deliver'||ITEMS.some(i=>i.id===m.id));const out=[];const used=new Set(st().active.map(a=>a.t));
    for(let i=0;i<30&&out.length<3;i++){const m=list[Math.floor(r()*list.length)];if(!out.includes(m)&&!used.has(m.t))out.push(m)}return out}
  function board(giver,who,voice){return new Promise(res=>{const S=st();const w=UI.win(giver==='robot'?'Aufträge von '+who:'Dorf-Aufträge',{size:'narrow',onClose:res});
    const mine=S.active.filter(a=>a.giver===giver);w.body.append(el('p','sub',giver==='robot'?'Schrotti zahlt gut für Hilfe. Höchstens 3 Aufträge gleichzeitig.':'Jeder erledigte Auftrag macht das Dorf schöner und bringt Dorf-Sterne.'));
    if(mine.length){w.body.append(el('h3',null,'Deine Aufträge'));for(const m of mine){const p=prog(m);const box=el('div','pcard');box.append(el('b',null,m.t),el('span','sub',`${p} / ${m.n} · Belohnung ${fmt(m.r)} Taler`));const bar=el('div','nbar');const i=el('i');i.style.width=(p/m.n*100)+'%';i.style.background='#6BCB5A';bar.append(i);box.append(bar);
      if(p>=m.n){box.append(btn('Abgeben','primary small',async()=>{if(m.key==='deliver')bagTake('item',m.id,m.n);S.active.splice(S.active.indexOf(m),1);money(m.r);S.done++;if(giver==='mayor')S.rating++;persist();SND.jingle('j_success');w.close();
        await UI.talk(who,[pick(['Wunderbar, danke!','Klasse Arbeit!','Du bist die Beste – der Beste!','Genau so!']),`Hier sind ${fmt(m.r)} Taler.`+(giver==='mayor'?' Das Dorf bekommt einen Stern dazu!':'')],{voice});res()}))}w.body.append(box)}}
    if(mine.length<3){const off=offers(giver);if(off.length){w.body.append(el('h3',null,'Neue Aufträge heute'));for(const m of off){const box=el('div','pcard');box.append(el('b',null,m.t),el('span','sub','Belohnung '+fmt(m.r)+' Taler'));
      box.append(btn('Annehmen','small',()=>{S.active.push(Object.assign({giver},m,{base:m.key==='stat'?statNow(m.stat):0}));persist();SND.play('confirm');w.close();UI.toast('Auftrag angenommen: '+m.t);res()}));w.body.append(box)}}}
    w.foot.append(btn('Schliessen',null,()=>w.close()))})}
  const stars=()=>{const r=st().rating;return r>=20?5:r>=12?4:r>=6?3:r>=2?2:1};
  return{board,stars,st}
})();

/* Museum: Licht nur aus Kronleuchtern und Vitrinen-Spots */
(function(){const mk=INTERIOR.kinds.museum;if(!mk)return;const b0=mk.build;mk.build=function(sc){const r=b0.call(this,sc);for(const x of[-7,0,7])INTERIOR.lamp(sc,'kron',x,3.8,0,{H:4.6,i:1.3,d:11,col:'#fff0d8'});for(const x of[-9,-3,3,9])INTERIOR.lamp(sc,'wand',x,2.8,-6.88,{i:.45,d:5,col:'#ffe8c8'});return r}})();
const BUILDINGS=(()=>{
  const M=makeMats({skin:'haut',color:0});const V=THREE.Vector3;
  const pid=()=>GAME.G.id;
  const WALL={kompost:'holzpaneel',schrott:'blech',korallen:'muscheln',frost:'sterne',wueste:'ziegel',pilz:'pilze'},FLOOR={kompost:'dielen',schrott:'riffelblech',korallen:'sand',frost:'fliesen',wueste:'terrakotta',pilz:'moos'};
  const ROBOT={name:'Schrotti',body:{seg:2,size:1.05,skin:'rost',color:0,shape:'kiste'},parts:{kopf:'roehre',augen:'leucht',arme:'greifarm',beine:'kette',extras:['zahnraeder']}};
  const MAYORS={kompost:['Bürgermeisterin Kompostina',{skin:'fell',color:2,shape:'birne'},{kopf:'eule',augen:'kuller',arme:'mensch',beine:'huhn',extras:['krone']}],
    schrott:['Bürgermeister Bolzmann',{skin:'chrom',color:0,shape:'kiste'},{kopf:'monitor',augen:'leucht',arme:'industrie',beine:'kette',extras:['zahnraeder']}],
    korallen:['Bürgermeisterin Perlmutt',{skin:'koralle',color:15,shape:'ei'},{kopf:'oktopus',augen:'kuller',arme:'flossen',beine:'fisch',extras:['krone']}],
    frost:['Bürgermeister Frostbart',{skin:'fell',color:16,shape:'birne'},{kopf:'wolke',augen:'zwei',arme:'mensch',beine:'mensch',extras:['krone']}],
    wueste:['Bürgermeisterin Sahra Sand',{skin:'gold',color:0,shape:'ei'},{kopf:'statue',augen:'zwei',arme:'mensch',beine:'mensch',extras:['krone']}],
    pilz:['Bürgermeister Myko Lamell',{skin:'myzel',color:0,shape:'birne'},{kopf:'pilzhut',augen:'kuller',arme:'ranken',beine:'mensch',extras:['krone']}]};
  const LORE={kompost:['Unser Planet lebt vom Kreislauf: Was verwelkt, wird Erde, und aus Erde wächst Neues.','Donna Haraway sagt: Wir sind Kompost, nicht Posthumane. Das hängt hier im Rathaus!'],
    schrott:['Früher war das hier eine Müllhalde. Heute bauen wir aus allem etwas Neues.','Reparieren ist unser Lieblingswort.'],korallen:['Die Korallen sind unsere Nachbarinnen. Wenn das Meer zu warm wird, bleichen sie aus.','Darum passen wir hier alle gemeinsam auf das Riff auf.'],
    frost:['Hier ist es kalt, aber die Herzen sind warm.','Das Polarlicht entsteht, wenn Teilchen von der Sonne auf unsere Luft treffen.'],wueste:['In der Wüste ist Wasser das Wertvollste.','Unsere Oasen teilen wir gerecht – Tiere zuerst!'],pilz:['Unter unseren Füssen verbindet ein riesiges Pilzgeflecht alles miteinander.','Man nennt es auch das „Wood Wide Web“.']};
  function npc(sc,d,x,z,yaw){const g=buildCreature(sanitize(JSON.parse(JSON.stringify(d))),{q:HIGH?.6:.42,noShadow:!HIGH,blob:false,merge:true});g.scale.setScalar(CS);g.position.set(x,0,z);g.rotation.y=yaw||0;sc.add(g);return g}
  /* ---------- gemeinsame Einrichtung ---------- */
  function pedestal(sc,m,x,z,col){const g=grp(sc,[x,0,z]);P(g,G.bx(1,.55,1,.1),m.c(col||'#FFF1DC'),[0,.275,0]);P(g,G.bx(1.1,.08,1.1,.04),m.c(shade2(col||'#FFF1DC',.85)),[0,.58,0]);return g}
  const shade2=(c,f)=>'#'+new THREE.Color(c).multiplyScalar(f).getHexString();
  function tag(sc,x,y,z,text,price,yaw){const t=ctex('tag-'+text+price,256,128,(x2,w,h)=>{x2.fillStyle='#FFFBF0';x2.fillRect(0,0,w,h);x2.strokeStyle='#E8B784';x2.lineWidth=8;x2.strokeRect(4,4,w-8,h-8);x2.fillStyle='#5B4A3E';x2.textAlign='center';x2.font='bold 26px "Trebuchet MS",sans-serif';x2.fillText(text.slice(0,18),w/2,50);x2.fillStyle='#E0876A';x2.font='bold 34px "Trebuchet MS",sans-serif';x2.fillText(fmt(price)+' T',w/2,98)});
    const p=P(sc,G.pl(.8,.4),new THREE.MeshBasicMaterial({map:t}),[x,y,z],[-.4,yaw||0,0]);p.userData.noOutline=true;return p}
  function fitModel(g,size){g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);const s=b.getSize(new V());const k=size/Math.max(s.x,s.y,s.z,.01);g.scale.setScalar(Math.min(1.2,k));return g}
  /* ================= Laden ================= */
  function stock(){const day=Math.floor(Date.now()/864e5);const r=srand(day*7+pid().length*3);const furn=FURN.filter(f=>f.planet===pid()||f.planet==='alle');const a=[...furn];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    /* Themen-Möbel zuerst */a.sort((x,y)=>(y.planet===pid())-(x.planet===pid()));return a.slice(0,10)}
  INTERIOR.kinds.shop={bg:'#3B3450',music:'shop',build(sc){const W=12,D=9,H=3.4;INTERIOR.makeRoom(sc,W,D,H,WALL[pid()]||'streifen',FLOOR[pid()]||'dielen',{trim:TOWN.STY[pid()].trim});const A=INTERIOR.actions,C=INTERIOR.colliders;const anim=[];sc.userData.anim=anim;
      const items=stock();items.forEach((f,i)=>{const side=i<5?-1:1;const k=i%5;const x=side*(W/2-1.2),z=-2.6+k*1.45;pedestal(sc,M,x,z,TOWN.STY[pid()].walls[k%4]);
        const mg=INTERIOR.furnModel(f.id);if(mg){fitModel(mg,1.05);mg.position.set(x,.62,z);mg.rotation.y=side>0?-PI/2:PI/2;sc.add(mg);anim.push(mg)}tag(sc,x-side*.62,.95,z,f.n,f.price,side>0?-PI/2:PI/2);
        C.push({x0:x-.55,x1:x+.55,z0:z-.55,z1:z+.55});A.push({x:x-side*1.2,z,r:1.1,label:f.n+' kaufen · '+fmt(f.price)+' T',act:()=>buy(f)})});
      /* Theke + Schrotti */const cz=-D/2+1.3;P(sc,G.bx(4.4,1.05,.9,.1),M.c('#C98C5A'),[0,.525,cz]);P(sc,G.bx(4.6,.1,1.05,.04),M.c('#FFF1DC'),[0,1.08,cz]);P(sc,G.bx(.5,.35,.4,.06),M.c('#F7B84B',{gloss:.6}),[1.4,1.3,cz]);P(sc,G.bx(.3,.08,.3,.02),M.c('#56C6B6'),[1.4,1.52,cz]);
      C.push({x0:-2.2,x1:2.2,z0:cz-.45,z1:cz+.45});const rb=npc(sc,ROBOT,0,-D/2+.55,0);anim.push({robot:rb});A.push({x:0,z:cz+1.1,r:1.4,label:'Mit Schrotti reden',act:robotTalk});
      /* Tapeten/Böden-Ständer */const rk=grp(sc,[W/2-1.1,0,-D/2+.8]);P(rk,G.bx(1.2,2,.12,.04),M.c('#C98C5A'),[0,1,0]);['#FF8FB8','#7FDCE6','#FFE27A','#A6EBC3'].forEach((c,i)=>P(rk,G.bx(.5,.5,.04,.02),M.c(c),[-.28+(i%2)*.56,.7+Math.floor(i/2)*.62,.08]));
      C.push({x0:W/2-1.8,x1:W/2-.4,z0:-D/2+.5,z1:-D/2+1.1});A.push({x:W/2-1.1,z:-D/2+1.9,r:1.2,label:'Tapeten & Böden ansehen',act:()=>SHOP.open(pid())});
      /* Schild an der Rückwand */const nm=(TOWN.NAMES[pid()]||{}).shop||'Laden';const st=ctex('shopsign-'+pid(),512,128,(x,w,h)=>{x.fillStyle='#FFFBF0';x.fillRect(0,0,w,h);x.fillStyle='#5B4A3E';x.font='bold 54px "Trebuchet MS",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(nm,w/2,h/2)});P(sc,G.pl(3.6,.9),new THREE.MeshBasicMaterial({map:st}),[0,2.7,-D/2+.02]).userData.noOutline=true;
      /* Pflanzen neben der Tür, frei von den Sockeln */for(const x of[-W/2+2.4,W/2-2.4]){const pg=grp(sc,[x,0,D/2-.55]);P(pg,G.cy(.3,.25,.5),M.c(PAL.terracotta),[0,.25,0]);P(pg,G.s(.45),M.c('#6DAE55',{rim:.6}),[0,.85,0],null,[1,1.2,1]);C.push({x0:x-.35,x1:x+.35,z0:D/2-1.35,z1:D/2-.65})}
      /* Licht: Hängelampen über den Regalen und an der Kasse */for(const x of[-W/2+1.2,W/2-1.2])for(const z of[-1.9,1.4])INTERIOR.lamp(sc,'pendel',x,2.4,z,{H:3.4,i:1,d:5.5,col:'#ffd9a0',shade:TOWN.STY[pid()].roofs[0]});INTERIOR.lamp(sc,'pendel',0,2.3,cz+.2,{H:3.4,i:1.2,d:6,col:'#ffe0b0',shade:'#3B3450'});INTERIOR.lamp(sc,'wand',0,2.2,D/2-.12,{ry:PI,i:.5,d:5});
      /* Kundschaft: zwei KI-Bewohner:innen stöbern */const live=[...GAME.ents.values()].filter(e=>e.life&&e.kind!=='me').slice(0,2);live.forEach((e,i)=>{const g=npc(sc,e.d,i?2:-2,1.2-i*1.5,i?-2.2:2.2);anim.push({shopper:g,base:new V(i?2:-2,0,1.2-i*1.5),ph:i*2});INTERIOR.actions.push({x:i?2:-2,z:2.2-i*1.5,r:1,label:'Reden: '+(e.d.name||''),act:()=>LIFE.interact(e)})});
      return{W,D}},
    frame(dt,t){const a=INTERIOR.scene&&INTERIOR.scene.userData.anim;if(!a)return;for(const o of a){if(o.robot){o.robot.userData.tick&&o.robot.userData.tick(t,false,Math.sin(t*2)>.7?1:0)}else if(o.shopper){const k=Math.sin(t*.4+o.ph);o.shopper.position.z=o.base.z+k*1.1;o.shopper.rotation.y=(o.base.x<0?PI/2:-PI/2)+(Math.cos(t*.4+o.ph)>0?.3:-.3);o.shopper.userData.tick&&o.shopper.userData.tick(t,Math.abs(Math.cos(t*.4+o.ph))>.3,0)}else o.rotation.y+=dt*.4}}};
  async function buy(f){const v={pitch:190,speed:1.1,kind:'robot'};const ch=await UI.talk('Schrotti',[`${f.n}? Gute Wahl! Kostet ${fmt(f.price)} Taler. Bzzt.`],{voice:v,color:'#C8703E',choices:['Kaufen','Lieber nicht']});
    if(ch!==0)return;if(SAVE.money<f.price){SND.play('error');await UI.talk('Schrotti',['Da fehlen dir noch ein paar Taler. Aufträge helfen!'],{voice:v});return}if(!bagAdd('furn',f.id)){UI.toast('Die Tasche ist voll.');return}money(-f.price);SND.play('j_buy');UI.toast(f.n+' gekauft! Zu Hause mit F aufstellen.')}
  async function robotTalk(){const v={pitch:190,speed:1.1,kind:'robot'};const ch=await UI.talk('Schrotti',[pick(['Bzzt! Willkommen! Alles hier war mal kaputt – jetzt ist es schön.','Kling-klong! Was darf es sein?','Reparieren statt wegwerfen, das ist mein Motto!'])],{voice:v,color:'#C8703E',choices:['Etwas verkaufen','Aufträge','Wie geht es dir?','Tschüss']});
    if(ch===0)sellWin();else if(ch===1)await MISSIONS.board('robot','Schrotti',v);else if(ch===2)await UI.talk('Schrotti',[pick(['Meine Zahnräder surren zufrieden.','Ein bisschen rostig, aber glücklich!','Ich habe heute drei Toaster repariert. Bester Tag!'])],{voice:v})}
  function sellWin(){const w=UI.win('Verkaufen bei Schrotti',{size:'wide'});const draw=()=>{w.body.replaceChildren();const sellable=SAVE.bag.filter(x=>x.kind!=='design');if(!sellable.length){w.body.append(el('p','empty','Du hast nichts zum Verkaufen.'));return}
      w.body.append(btn('Alle Fische, Insekten & Fundsachen verkaufen','primary',()=>{let sum=0,n=0;for(const it of[...SAVE.bag])if(['fish','bug','item','relic'].includes(it.kind)){sum+=itemPrice(it.kind,it.id)*it.n;n+=it.n;bagTake(it.kind,it.id,it.n)}if(sum){money(sum);SAVE.stats.sold=(SAVE.stats.sold||0)+n;SND.play('coins');UI.toast(`Verkauft für ${fmt(sum)} Taler`)}draw()}));
      const gr=el('div','grid');sellable.forEach(it=>{const c=el('button','card');c.type='button';c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)),el('span','sub',`×${it.n} · ${fmt(itemPrice(it.kind,it.id))} T`));
        c.onclick=()=>{bagTake(it.kind,it.id,1);money(itemPrice(it.kind,it.id));SAVE.stats.sold=(SAVE.stats.sold||0)+1;SND.play('coins');draw()};gr.append(c)});w.body.append(gr)};draw();w.foot.append(btn('Fertig',null,()=>w.close()))}
  /* ================= Jazz-Bar ================= */
  let jam=null;
  INTERIOR.kinds.bar={bg:'#1E1A33',music:'stille',build(sc){const W=14,D=11,H=3.8;const room=INTERIOR.makeRoom(sc,W,D,H,'ziegel','parkett',{trim:'#5B3A2E'});room.traverse(o=>{if(o.isMesh&&o.material&&o.material.map)o.material.color.set(o.name==='floor'?'#a08890':'#9a7a84')});const A=INTERIOR.actions,C=INTERIOR.colliders;const anim={tiles:[],band:[],guests:[]};sc.userData.bar=anim;
      /* Schummerlicht: nur Lampen, Dunst, Neon */sc.fog=new THREE.Fog('#1a1320',10,30);sc.background=new THREE.Color('#120d18');const LP=INTERIOR.lamp;
      const neon=new THREE.PointLight('#FF6FB0',1.2,9,2);neon.position.set(-2.4,2.9,-D/2+.8);sc.add(neon);anim.lights=[neon];
      for(const[x,z]of[[-5,2.2],[-3,3.4],[-5.2,-.4]])LP(sc,'pendel',x,2.2,z,{H,i:2.4,d:7,col:'#ffb870',shade:'#3B5E4A'});
      for(let i=0;i<3;i++)LP(sc,'pendel',W/2-1.2,2.4,-2.6+i*1.8,{H,i:2,d:7,col:'#ffc48a',shade:'#8A3A3A'});
      for(const[x,z,ry]of[[-W/2+.12,-2.5,PI/2],[-W/2+.12,1.5,PI/2]])LP(sc,'wand',x,2,z,{ry,i:1.3,d:6,col:'#ffb060'});
      const spot=new THREE.SpotLight('#ffd6a8',4,16,.6,.6,1.2);spot.position.set(-2.4,H-.1,.5);spot.target.position.set(-2.4,0,-D/2+1.6);sc.add(spot);sc.add(spot.target);P(sc,G.cy(.18,.25,.4),M.c('#2E2A3E'),[-2.4,H-.25,.5],[.9,0,0]);
      /* Schmuddel: Plakate, Flecken, Rohre, Kisten */const post=(k,t1,t2,c1,c2)=>ctex('poster-'+k,160,220,(x,w,h)=>{x.fillStyle=c1;x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<30;i++)x.fillRect(Math.random()*w,Math.random()*h,2,2);x.fillStyle=c2;x.beginPath();x.arc(w/2,h*.42,48,0,TAU);x.fill();x.fillStyle='#FFF4DC';x.font='bold 22px "Trebuchet MS",sans-serif';x.textAlign='center';x.fillText(t1,w/2,h*.8);x.font='14px "Trebuchet MS",sans-serif';x.fillText(t2,w/2,h*.9);x.strokeStyle='rgba(60,40,30,.4)';x.lineWidth=6;x.strokeRect(0,0,w,h)});
      [['a','SWING NIGHT','jeden Abend','#5B3A6E','#FFB45A',-4.5],['b','BLUE NOTES','Live-Band','#2E4A6E','#7FDCE6',-.4],['c','OFFENE BÜHNE','spiel mit!','#6E3A3A','#FFE27A',3.2]].forEach(([k,a,b,c1,c2,x],i)=>{const pm=new THREE.MeshLambertMaterial({map:post(k,a,b,c1,c2)});const pl=P(sc,G.pl(.9,1.25),pm,[x,1.9,-D/2+.03],[0,0,(i-1)*.05]);pl.userData.noOutline=true});
      for(let i=0;i<7;i++){const st=P(sc,G.circ(.3+Math.random()*.4),new THREE.MeshBasicMaterial({color:'#1a1010',transparent:true,opacity:.25,depthWrite:false}),[(Math.random()-.5)*W*.8,.012,(Math.random()-.3)*D*.7],[-PI/2,0,0]);st.userData.noOutline=true}
      P(sc,G.cy(.12,.12,W),M.c('#6E5A4A',{gloss:.4}),[0,H-.25,-D/2+.35],[0,0,PI/2]);P(sc,G.cy(.08,.08,D-1),M.copper(),[-W/2+.3,H-.3,0],[PI/2,0,0]);for(const z of[-3,0,3])P(sc,G.to(.14,.04),M.steel(),[-W/2+.3,H-.3,z]);
      for(let i=0;i<3;i++){const cx=-W/2+.8,cz=D/2-1.2-i*.7;P(sc,G.bx(.6,.4,.5,.04),M.c('#6E4A3A'),[cx,.2+(i===2?.4:0),cz-(i===2?.7:0)]);for(let j=0;j<4;j++)P(sc,G.cy(.05,.05,.3),M.glass(['#7FDCE6','#A6EBC3','#FFB45A','#C6A9FF'][j]),[cx-.2+j*.13,.55+(i===2?.4:0),cz-(i===2?.7:0)])}
      INTERIOR.colliders.push({x0:-W/2+.4,x1:-W/2+1.2,z0:D/2-3,z1:D/2-.8});
      /* Bühne */const sx=-2.4,sz=-D/2+1.6;P(sc,G.bx(7,.35,3,.08),M.c('#5B3A2E'),[sx,.175,sz]);P(sc,G.bx(7.1,.06,3.1,.02),M.c('#F7B84B'),[sx,.36,sz]);C.push({x0:sx-3.5,x1:sx+3.5,z0:sz-1.5,z1:sz+1.2});
      const I={};/* Klavier */{const g=grp(sc,[sx-2.6,.35,sz-.6]);P(g,G.bx(1.6,1.2,.6,.06),M.c('#2E2A3E',{gloss:1}),[0,.6,0]);P(g,G.bx(1.6,.08,.35,.02),M.c('#2E2A3E',{gloss:1}),[0,.84,.45]);const kt=ctex('keys',256,32,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#222';for(let i=0;i<28;i++){x.fillRect(i*9.14,0,1,h);if([0,1,3,4,5].includes(i%7))x.fillRect(i*9.14+6,0,5,h*.6)}});P(g,G.pl(1.5,.3),new THREE.MeshBasicMaterial({map:kt}),[0,.89,.45],[-PI/2,0,0]);B2(g,.5,.45,.35,[0,.25,1],'#8A5A44');I.piano=[sx-2.6,sz+.6]}
      /* Schlagzeug */{const g=grp(sc,[sx-.9,.35,sz-.4]);P(g,G.cy(.4,.4,.35),M.c('#F0556E',{gloss:.8}),[0,.42,0],[PI/2,0,0]);P(g,G.circ(.36),M.c('#FFFBF0'),[0,.42,.18]);P(g,G.cy(.22,.22,.15),M.c('#F0556E',{gloss:.8}),[.5,.62,.25]);P(g,G.cy(.26,.26,.02),M.gold(),[-.55,1.05,.1]);P(g,G.cy(.3,.3,.02),M.gold(),[.55,1.15,-.1]);bt(g,[-.55,0,.1],[-.55,1.05,.1],.02,M.steel());bt(g,[.55,0,-.1],[.55,1.15,-.1],.02,M.steel());I.drums=[sx-.9,sz+.6]}
      /* Kontrabass */{const g=grp(sc,[sx+.7,.35,sz-.6],[0,0,.15]);P(g,G.s(.4),M.c('#B8703E',{gloss:.8}),[0,.55,0],null,[1,1.3,.45]);P(g,G.s(.3),M.c('#B8703E',{gloss:.8}),[0,1.05,0],null,[1,1.1,.45]);bt(g,[0,1.2,0],[0,2,0],.04,M.c('#2E2A3E'));I.bass=[sx+.7,sz+.6]}
      /* Saxofon auf Ständer */{const g=grp(sc,[sx+1.9,.35,sz-.2]);bt(g,[0,0,0],[0,.5,0],.02,M.steel());P(g,G.tu([[0,.5,0],[0,1.1,0],[.1,1.25,0],[.22,1.2,0]],.05),M.gold());P(g,G.co(.13,.25,12),M.gold(),[0,.45,0],[PI,0,0]);I.sax=[sx+1.9,sz+.8]}
      /* Mikrofon */{const g=grp(sc,[sx+.3,.35,sz+1]);bt(g,[0,0,0],[0,1.4,0],.02,M.steel());P(g,G.s(.07),M.c('#3B3450'),[0,1.45,0]);P(g,G.cy(.18,.2,.03),M.steel(),[0,.02,0]);I.scat=[sx+.3,sz+1.7]}
      const IN={piano:'Klavier',drums:'Schlagzeug',bass:'Kontrabass',sax:'Saxofon',scat:'Mikrofon (Scat-Gesang)'};for(const k in I)A.push({x:I[k][0],z:I[k][1],r:1.1,label:IN[k]+' spielen',act:()=>startJam(k)});
      /* Tanzfläche */const dx=2.2,dz=.8;for(let i=0;i<4;i++)for(let j=0;j<4;j++){const m=new THREE.MeshBasicMaterial({color:'#8C6FE0',toneMapped:false});const t=P(sc,G.bx(.9,.04,.9,.02),m,[dx-1.5+i,.03,dz-1.5+j]);t.userData.noOutline=true;anim.tiles.push(t)}
      A.push({x:dx,z:dz,r:1.8,label:'Tanzen',act:()=>{const me=GAME.me;me.dance=12;SAVE.stats.dances=(SAVE.stats.dances||0)+1;persist();JAZZ.start();UI.toast('Tanz mit! Die Band spielt für dich.')}});
      /* Bar */const bx=W/2-1.1;P(sc,G.bx(1,1.1,5.5,.1),M.c('#8A5A44'),[bx,.55,-.5]);P(sc,G.bx(1.2,.08,5.7,.04),M.c('#F7B84B',{gloss:.8}),[bx,1.14,-.5]);C.push({x0:bx-.55,x1:bx+.6,z0:-3.3,z1:2.3});
      for(let i=0;i<9;i++){const c=['#FF8FB8','#7FDCE6','#FFE27A','#A6EBC3','#C6A9FF'][i%5];P(sc,G.cy(.08,.1,.35),M.glow(c,1.3),[W/2-.25,1.9+(i%3)*.5,-2.6+Math.floor(i/3)*1.2])}P(sc,G.bx(.3,1.8,4.2,.04),M.c('#5B3A2E'),[W/2-.2,2.1,-1.4]);
      for(let i=0;i<3;i++){const z=-2.3+i*1.5;P(sc,G.cy(.22,.22,.08),M.c('#F0556E'),[bx-1.1,.72,z]);P(sc,G.cy(.04,.04,.7),M.steel(),[bx-1.1,.36,z])}A.push({x:bx-1.4,z:-.8,r:1.6,label:'Getränk bestellen',act:drinks});
      const bk=npc(sc,{name:'Barkeeper',body:{seg:2,size:1,skin:'plastik',color:9,shape:'ei'},parts:{kopf:'teekanne',augen:'zwei',arme:'greifarm',beine:'mensch',extras:['kopfhoerer']}},W/2-.55,-.8,-PI/2);anim.guests.push({g:bk,bar:true});
      /* Tische */for(const[x,z]of[[-5,2.2],[-3,3.4],[-5.2,-.4]]){P(sc,G.cy(.45,.45,.06),M.c('#5B3A2E'),[x,.78,z]);P(sc,G.cy(.06,.08,.76),M.steel(),[x,.38,z]);P(sc,G.cy(.05,.05,.12),M.c('#FFFBF0'),[x,.87,z]);P(sc,G.s(.04),M.glow('#FFD27A',2),[x,.97,z]);C.push({x0:x-.5,x1:x+.5,z0:z-.5,z1:z+.5})}
      /* Gäste = echte KI-Bewohner:innen (wer gerade „in der Bar“ ist, dazu ein paar Stammgäste) – ansprechbar */
      const live=[...GAME.ents.values()].filter(e=>e.life&&e.kind!=='me'&&e.kind!=='peer');live.sort((a,b)=>(b.inBar?1:0)-(a.inBar?1:0));const spots=[{x:I.piano[0],z:I.piano[1]-.4,ry:PI,band:1},{x:I.bass[0]+.3,z:I.bass[1]-.3,ry:PI,band:1},{x:W/2-2.3,z:-2.3,ry:PI/2,sit:1},{x:W/2-2.3,z:-.8,ry:PI/2,sit:1},{x:dx-.8,z:dz+.4,ry:.5,dance:1},{x:dx+.9,z:dz-.3,ry:-.6,dance:1},{x:-4.3,z:2.9,ry:2.4,sit:1},{x:-4.6,z:-1.1,ry:.8,sit:1}];
      const guests=live.slice(0,spots.length);if(!guests.length){const res=HOMES.residents(pid());res.slice(0,4).forEach((d,i)=>guests.push({d,fake:true}))}
      guests.forEach((e,i)=>{const sp=spots[i];const g=npc(sc,e.d,sp.x,sp.z,sp.ry);if(sp.sit){g.position.y=.12}const ent=e.fake?null:e;(sp.band?anim.band:anim.guests).push({g,dance:!!sp.dance,sit:!!sp.sit,ent});
        if(ent)INTERIOR.actions.push({x:sp.x+Math.sin(sp.ry)*1.1,z:sp.z+Math.cos(sp.ry)*1.1,r:1,label:'Reden: '+(e.d.name||'Namenlos'),act:()=>LIFE.interact(ent)});INTERIOR.colliders.push({x0:sp.x-.35,x1:sp.x+.35,z0:sp.z-.35,z1:sp.z+.35})});
      /* Neon-Schild */const nt=ctex('barneon-'+pid(),512,128,(x,w,h)=>{x.fillStyle='rgba(0,0,0,0)';x.clearRect(0,0,w,h);x.shadowColor='#FF6FB0';x.shadowBlur=18;x.fillStyle='#FFE27A';x.font='bold 64px "Trebuchet MS",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText((TOWN.NAMES[pid()]||{}).bar||'Jazz',w/2,h/2)});
      const nm=new THREE.MeshBasicMaterial({map:nt,transparent:true,toneMapped:false});P(sc,G.pl(4.4,1.1),nm,[sx,3,-D/2+.03]).userData.noOutline=true;
      JAZZ.band.solo='sax';JAZZ.start();return{W,D,camD:14}},
    frame(dt,t){const a=INTERIOR.scene&&INTERIOR.scene.userData.bar;if(!a)return;const beat=(t*112/60)%1;const cols=['#8C6FE0','#FF8FB8','#7FDCE6','#FFE27A','#A6EBC3'];
      a.tiles.forEach((m,i)=>{const on=((Math.floor(t*112/60)+i*3)%5)/5;m.material.color.set(cols[(Math.floor(t*112/60*.5)+i)%5]).multiplyScalar(.45+.55*(1-beat)*(on>.4?1:.5))});
      a.lights[0].intensity=1+.25*Math.sin(t*2)+(Math.random()<.02?-.8:0);
      for(const b of a.band){b.g.userData.tick&&b.g.userData.tick(t,false,Math.abs(Math.sin(t*6))>.5?1:0);b.g.position.y=Math.abs(Math.sin(t*112/60*PI))*.04}
      for(const g of a.guests){g.g.userData.tick&&g.g.userData.tick(t,false,0);if(g.dance){g.g.rotation.y+=Math.sin(t*3)*dt*2;g.g.position.y=Math.abs(Math.sin(t*112/60*PI))*.18}}
      const me=GAME.me;if(me&&me.dance>0){me.iyaw+=dt*2}},
    leave(){JAZZ.stop();closeJam()}};
  function drinks(){const w=UI.win('Getränke',{size:'narrow'});w.body.append(el('p','sub','Alles ohne Alkohol – aber mit Wirkung!'));
    const D=[['Sternenlimo','Prickelt! Du rennst eine Weile schneller.',60,()=>{GAME.me.boost=90;UI.toast('Du fühlst dich superschnell!')}],['Kompost-Kakao','Warm und gemütlich. Alle in der Nähe mögen dich ein bisschen mehr.',80,()=>{for(const e of GAME.ents.values())if(e.life&&e!==GAME.me)SAVE.friendship[e.d.id]=Math.min(100,(SAVE.friendship[e.d.id]||0)+1);persist()}],['Glitzer-Tee','Du glitzerst eine Weile.',120,()=>{GAME.me.glitter=90}],['Polarlicht-Shake','Kühl und bunt! Du tanzt sofort los.',100,()=>{GAME.me.dance=8}]];
    const gr=el('div','grid');for(const[n,d,p,f]of D){const c=el('button','card');c.type='button';c.append(el('b',null,n),el('span','sub',d),el('span','sub',p+' Taler'));c.onclick=()=>{if(SAVE.money<p){SND.play('error');UI.toast('Zu wenig Taler.');return}money(-p);SAVE.stats.drinks=(SAVE.stats.drinks||0)+1;persist();SND.play('soft');f();w.close();GAME.say(GAME.me,'icon:sparkle',2,true)};gr.append(c)}w.body.append(gr)}
  /* ---------- Mitspielen ---------- */
  const KEYS=['1','2','3','4','5','6','7','8'],KEYS2=['a','s','d','f','g','h','j','k'];
  function hasMusicPart(){try{return abilitiesFor(GAME.me.d).includes('musik')}catch(e){return false}}
  function startJam(inst){JAZZ.start();closeJam();const box=el('div','jam');const top=el('div','jam-top');const title=el('b',null,{piano:'Klavier',drums:'Schlagzeug',bass:'Kontrabass',sax:'Saxofon',scat:'Scat-Gesang',vibes:'Vibrafon',synth:'Synthesizer'}[inst]||inst);const chord=el('span','jam-chord');top.append(title,chord);
    const keys=el('div','jam-keys');const btns=[];for(let i=0;i<8;i++){const b=el('button','jam-k');b.type='button';b.append(el('span',null,inst==='drums'?['Bass','Snare','Hi-Hat','Ride','Tom','Tom','Becken','Besen'][i]:String(i+1)),el('small',null,KEYS2[i].toUpperCase()));b.onpointerdown=e=>{e.preventDefault();hit(i)};keys.append(b);btns.push(b)}
    const row=el('div','jam-row');const bandB=btn('Band: an','small',()=>{const on=!JAZZ.band.bass;JAZZ.band.bass=JAZZ.band.drums=JAZZ.band.piano=on;bandB.textContent='Band: '+(on?'an':'aus')});row.append(bandB);
    const insts=hasMusicPart()?['piano','sax','vibes','bass','synth','scat','drums']:['piano','sax','bass','scat','drums'];const sel=el('select');insts.forEach(k=>{const o=el('option',null,{piano:'Klavier',drums:'Schlagzeug',bass:'Bass',sax:'Saxofon',scat:'Scat',vibes:'Vibrafon',synth:'Synth'}[k]);o.value=k;if(k===inst)o.selected=true;sel.append(o)});sel.onchange=()=>{jam.inst=sel.value;title.textContent=sel.options[sel.selectedIndex].text};row.append(sel);
    if(hasMusicPart()){const auto=btn('Auto-Solo (dein Musik-Teil)','small',()=>{jam.auto=!jam.auto;auto.classList.toggle('primary',jam.auto);JAZZ.band.solo=jam.auto?jam.inst==='drums'?'vibes':jam.inst:null});row.append(auto)}
    row.append(btn('Fertig','small',closeJam));box.append(top,el('p','sub','Tippe die Tasten oder drücke 1–8 / A–K. Die Töne passen immer zum Akkord und landen im Swing-Takt.'),keys,row);$('world').append(box);
    JAZZ.band.solo=null;jam={inst,box,btns,chord,n:0,auto:false,iv:setInterval(()=>{chord.textContent='Akkord: '+JAZZ.chordName()},250)};GAME.me.dance=0}
  function hit(i){if(!jam)return;const r=JAZZ.playKey(i,jam.inst);if(r==null)return;const b=jam.btns[i];b.classList.add('on');setTimeout(()=>b.classList.remove('on'),140);GAME.me.act=1;jam.n++;SAVE.stats.jam=(SAVE.stats.jam||0)+1;
    if(jam.n%16===0){const tip=10+Math.floor(Math.random()*20);money(tip);SND.play('coins',{vol:.5});UI.toast('Applaus! Trinkgeld: '+tip+' Taler');persist()}}
  function closeJam(){if(!jam)return;clearInterval(jam.iv);jam.box.remove();JAZZ.band.solo='sax';JAZZ.band.bass=JAZZ.band.drums=JAZZ.band.piano=true;jam=null;persist()}
  addEventListener('keydown',e=>{if(!jam||e.repeat)return;const k=e.key.toLowerCase();let i=KEYS.indexOf(k);if(i<0)i=KEYS2.indexOf(k);if(i>=0){e.preventDefault();e.stopPropagation();hit(i)}},true);
  /* ================= Rathaus ================= */
  INTERIOR.kinds.rathaus={bg:'#3B3450',music:'museum',build(sc){const W=12,D=9,H=3.8;INTERIOR.makeRoom(sc,W,D,H,'streifen','parkett',{trim:'#8A5A44'});const A=INTERIOR.actions,C=INTERIOR.colliders;
      const dz=-D/2+1.5;P(sc,G.bx(3.2,.95,1.1,.08),M.c('#8A5A44'),[0,.475,dz]);P(sc,G.bx(3.4,.08,1.3,.04),M.c('#F7B84B',{gloss:.6}),[0,.99,dz]);C.push({x0:-1.7,x1:1.7,z0:dz-.6,z1:dz+.6});P(sc,G.cy(.08,.1,.3),M.c('#FFFBF0'),[1,1.18,dz]);P(sc,G.s(.12),M.c('#FF8FB8'),[1,1.38,dz],null,[1,.8,1]);
      const md=MAYORS[pid()]||MAYORS.kompost;const mg=npc(sc,{name:md[0],body:Object.assign({seg:2,size:1.1,pattern:'bauch',color2:16},md[1]),parts:md[2]},0,-D/2+.6,0);sc.userData.mayor=mg;
      A.push({x:0,z:dz+1.2,r:1.5,label:'Mit '+md[0]+' reden',act:mayorTalk});
      for(const x of[-2.4,2.4]){bt(sc,[x,0,-D/2+.4],[x,2.6,-D/2+.4],.04,M.gold());P(sc,G.bx(.9,1.2,.04,.01),M.c(x<0?'#F0556E':TOWN.STY[pid()].roofs[0]),[x+.48,2.1,-D/2+.42])}
      const bd=grp(sc,[-W/2+.12,0,-.5]);P(bd,G.bx(.1,1.4,2.2,.04),M.c('#C98C5A'),[0,1.5,0]);for(let i=0;i<5;i++)P(bd,G.bx(.02,.34,.3,.01),M.c(['#FFFBF0','#FFE27A','#A6EBC3'][i%3]),[.07,1.3+(i%2)*.4,-.8+i*.4]);A.push({x:-W/2+1.1,z:-.5,r:1.3,label:'Auftrags-Brett',act:()=>MISSIONS.board('mayor',md[0],{pitch:220,kind:'sanft'})});
      const pl=grp(sc,[W/2-.12,0,-.5]);P(pl,G.bx(.1,1,1.6,.04),M.gold(),[0,1.6,0]);A.push({x:W/2-1.1,z:-.5,r:1.3,label:'Dorf-Sterne ansehen',act:rating});
      for(const x of[-3.5,3.5]){P(sc,G.bx(1.8,.45,.5,.06),M.c('#C98C5A'),[x,.4,1.8]);P(sc,G.bx(1.8,.5,.12,.06),M.c('#C98C5A'),[x,.8,2.05]);C.push({x0:x-.9,x1:x+.9,z0:1.5,z1:2.2})}
      INTERIOR.lamp(sc,'kron',0,2.9,0,{H:3.8,i:1.6,d:10,col:'#ffe2b0'});INTERIOR.lamp(sc,'wand',-2.4,2.3,-D/2+.12,{i:.5,d:4});INTERIOR.lamp(sc,'wand',2.4,2.3,-D/2+.12,{i:.5,d:4});P(sc,G.cy(.08,.12,.05),M.c('#3B3450'),[-1,1.03,dz]);INTERIOR.lamp(sc,'steh',-W/2+.8,0,2.8,{i:.7,d:5});
      const vis=[...GAME.ents.values()].find(e=>e.life&&e.kind==='villager');if(vis){const g=npc(sc,vis.d,3.5,1.85,PI);g.position.y=.12;INTERIOR.actions.push({x:3.5,z:.9,r:1,label:'Reden: '+(vis.d.name||''),act:()=>LIFE.interact(vis)})}
      P(sc,G.bx(4,.02,2.6,.01),M.c('#B8475F'),[0,.012,1]);for(const x of[-W/2+.5,W/2-.5]){P(sc,G.cy(.3,.25,.5),M.c(PAL.terracotta),[x,.25,-D/2+1]);P(sc,G.s(.5),M.c('#6DAE55',{rim:.6}),[x,.95,-D/2+1],null,[1,1.2,1])}
      return{W,D}},frame(dt,t){const m=INTERIOR.scene&&INTERIOR.scene.userData.mayor;if(m&&m.userData.tick)m.userData.tick(t,false,0)}};
  async function mayorTalk(){const md=MAYORS[pid()]||MAYORS.kompost;const v={pitch:220,speed:1,kind:'hall'};const ch=await UI.talk(md[0],[pick(['Willkommen im Rathaus! Schön, dass du hilfst.','Ah, unser neuer Stern am Himmel!','Das Dorf wächst dank dir.'])],{voice:v,color:'#B79A6E',choices:['Dorf-Aufträge','Wie steht es um das Dorf?','Erzähl mir vom Planeten','Tschüss']});
    if(ch===0)await MISSIONS.board('mayor',md[0],v);else if(ch===1)await rating();else if(ch===2)await UI.talk(md[0],LORE[pid()]||LORE.kompost,{voice:v})}
  async function rating(){const s=MISSIONS.stars();const md=MAYORS[pid()]||MAYORS.kompost;await UI.talk(md[0],[`Unser Dorf hat gerade ${s} von 5 Sternen.`,s<3?'Mehr Aufträge erledigen, Blumen pflanzen und Bewohner:innen glücklich machen – dann steigen die Sterne!':s<5?'Schon richtig schön hier! Noch ein bisschen mehr, dann sind wir berühmt.':'Fünf Sterne! Wir sind das schönste Dorf im ganzen Sonnensystem!'],{voice:{pitch:220,kind:'hall'}})}
  /* ================= Gärtnerei ================= */
  function plants(){const w=UI.win((TOWN.NAMES[pid()]||{}).pflanzen||'Gärtnerei',{size:'wide'});w.body.append(el('p',null,'Setzlinge kaufen und überall im Dorf einpflanzen (in der Tasche anklicken → „Hier einpflanzen“). Jede Pflanze macht das Dorf schöner.'));
    const gr=el('div','grid');for(const s of SEEDS.filter(s=>s.planet===pid()||s.planet==='alle')){const c=el('button','card');c.type='button';c.append(itemThumb('plant',s.id),el('span',null,s.n),el('span','sub',fmt(s.price)+' Taler'));
      c.onclick=()=>{if(SAVE.money<s.price){SND.play('error');UI.toast('Zu wenig Taler.');return}if(!bagAdd('plant',s.id)){UI.toast('Tasche voll.');return}money(-s.price);SND.play('j_buy');UI.toast(s.n+' gekauft!')};gr.append(c)}w.body.append(gr)}
  function plantHere(id){const s=SEEDS.find(x=>x.id===id);const me=GAME.me;if(!s||!me||GAME.mode!=='outdoor'){UI.toast('Draussen einpflanzen!');return}
    const p=me.p.clone().addScaledVector(me.dir,1.3/GAME.G.R).normalize();if(!GAME.isLand(p)||GAME.nearPlace(p,1)){UI.toast('Hier ist kein guter Platz zum Pflanzen.');return}
    bagTake('plant',id,1);SAVE.planted=SAVE.planted||{};(SAVE.planted[pid()]=SAVE.planted[pid()]||[]).push({t:s.type,p:[p.x,p.y,p.z]});SAVE.stats.planted=(SAVE.stats.planted||0)+1;persist();placePlant(s.type,p,true);SND.play('chop');GAME.W.fx(p,'blatt',10);UI.toast(s.n+' eingepflanzt!')}
  const planted=[];function placePlant(type,p,grow){const g=GAME.makeNature(type,{},7);g.traverse(o=>{if(o.isMesh){o.castShadow=HIGH;o.receiveShadow=true}});GAME.placeObj(g,p,Math.random()*TAU,-.03);GAME.scene.add(g);planted.push(g);const info=NATURE[type]||{};if(info.r&&info.r>.3)GAME.addObst(p,info.r*.8);
    if(grow){g.scale.setScalar(.05);let k=0;const iv=setInterval(()=>{k+=.05;g.scale.setScalar(Math.min(1,.05+k));if(k>=1)clearInterval(iv)},40)}}
  function onPlanet(id){planted.length=0;for(const x of(SAVE.planted&&SAVE.planted[id])||[])placePlant(x.t,new V(...x.p),false)}
  /* ================= Tierhandlung ================= */
  function pets(){const w=UI.win((TOWN.NAMES[pid()]||{}).tiere||'Tierhandlung',{size:'wide'});w.body.append(el('p',null,'Ein Haustier begleitet dich überall hin – auch auf andere Planeten. Du kannst nur Tiere adoptieren, die du schon einmal getroffen hast (siehe Tierlexikon).'));
    if(SAVE.pet)w.body.append(el('div','note',`Dein Haustier: ${SAVE.pet.name} (${FAUNA.S[SAVE.pet.key]?FAUNA.S[SAVE.pet.key].n:''}). Adoptierst du ein neues, zieht ${SAVE.pet.name} glücklich in die Tierhandlung zurück.`));
    const seen=SAVE.faunaSeen||{};const gr=el('div','grid');for(const[k,s]of Object.entries(FAUNA.S)){if(s.water)continue;const price=Math.round(600+s.size*900);const c=el('button','card');c.type='button';const known=!!seen[k];c.append(known?FAUNA.animalThumb(k):el('div','thumb-q','?'),el('b',null,known?s.n:'???'),el('span','sub',known?fmt(price)+' Taler':'Erst in der Natur treffen'));
      if(known)c.onclick=async()=>{if(SAVE.money<price){SND.play('error');UI.toast('Zu wenig Taler.');return}const name=await askName('Wie soll dein '+s.n+' heissen?',pick(s.names));if(!name)return;money(-price);SAVE.pet={key:k,name};persist();SND.jingle('j_success');w.close();FAUNA.onPlanet(pid());UI.toast(SAVE.pet.name+' ist jetzt dein Haustier!')};gr.append(c)}w.body.append(gr)}
  function askName(title,def){return new Promise(res=>{const w=UI.win(title,{size:'narrow',onClose:()=>res(null)});const i=el('input');i.maxLength=18;i.value=def||'';i.style.cssText='width:100%;font:inherit;padding:10px;border-radius:12px;border:2px solid #E6D8B8';i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')ok()});
    const ok=()=>{const v=String(i.value||'').replace(/[<>]/g,'').trim().slice(0,18);res(v||null);w.close()};w.body.append(i);w.foot.append(btn('Adoptieren','primary',ok));setTimeout(()=>i.focus(),50)})}
  /* ================= Raketen-Garage ================= */
  function garage(){if(typeof ROCKET!=='undefined')ROCKET.customize();else UI.toast('Die Garage wird gerade eingerichtet.')}
  function enter(k){INTERIOR.enter(k)}
  return{enter,plants,plantHere,pets,garage,onPlanet,drinks}
})();
function B2(g,w,h,d,p,col){return P(g,G.bx(w,h,d,.05),makeMats({skin:'haut',color:0}).c(col),p)}
