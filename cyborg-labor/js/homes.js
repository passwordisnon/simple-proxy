/* =====================================================================
   CYBORG-LABOR · homes.js
   Bewohner:innen und ihre Häuser: Jede Figur hat ein eigenes Haus im Stil
   ihres Planeten (Iglu-Kuppel, Lehmhütte, Pilzhaus, Blechturm, Muschelhaus …),
   mit Namensschild, Vorgarten, Weg zum Dorfplatz und Klingel.
   Eigene Figuren: Man spielt eine davon, alle anderen leben als KI weiter.
   ===================================================================== */
const HOMES=(()=>{
  const THEME={
    kompost:{skins:['fell','pluesch','haut','holz','moos','keramik'],heads:['axolotl','katze','frosch','hirsch','eule','mensch','bluete','schnecke','vogel','kohl','pilzhut','moosball'],names:['Moosi','Kompott','Humus-Hanna','Wurmi','Kleeblatt','Beete','Radieschen','Sonni','Blümchen','Laubi'],house:{shapes:['huette','spitz','rund'],walls:['holz','stein','moos'],wallCols:['#FFE3B8','#E8B784','#D9D2E3','#C8E8B0'],roofCols:['#F0556E','#8E6BD1','#E0876A','#6AA8F0'],win:['eckig','rund']},deco:['blumenbusch','busch','sonnenblume','lavendel'],fence:true},
    schrott:{skins:['chrom','rost','patina','plastik','gold'],heads:['monitor','roehre','kamerakopf','router','toaster','mikrowelle','lautsprecher','ampel','birne'],names:['Blechbert','Zahnrad-Zora','Volta','Bit','Mutter Mona','Spule'],
      house:{shapes:['turm','kuppel'],walls:['blech'],wallCols:['#B4CBE0','#C8C0E8','#A8D8D0'],roofCols:['#F7B84B','#FF8FB8','#56C6B6'],win:['bullauge']},deco:['schrotthaufen','antennenbaum','kristallfels']},
    korallen:{skins:['koralle','schuppen','schleim','glas'],heads:['fisch','kugelfisch','oktopus','qualle','koralle','axolotl','hai','taucherhelm','seerose'],names:['Perla','Kiemen-Kim','Riffi','Muschelmax','Lagune Lu','Tang'],
      house:{shapes:['rund','kuppel','huette'],walls:['lehm','holz'],wallCols:['#FFE3C8','#BFF0EC','#FFD2DA'],roofCols:['#FF8E7A','#4FD6E0','#F7B84B'],win:['rund','bullauge']},deco:['muschel_deko','kokospalme_klein','treibholz']},
    frost:{skins:['fell','pluesch','glas','marmor'],heads:['eule','wolke','kristall','raumhelm','zapfen','katze','hirsch','mensch'],names:['Flöckchen','Eisbert','Polara','Frostine','Iglu-Ingo','Nordlicht'],
      house:{shapes:['kuppel','spitz'],walls:['stein'],wallCols:['#F4F8FF','#E4ECFA','#DDEBFF'],roofCols:['#FFFFFF','#8FD0F0','#B7B4FF'],win:['rund']},deco:['schneehaufen','schneemann','schneetanne','schneebusch'],chimney:true},
    wueste:{skins:['haut','holz','keramik','gold','schuppen'],heads:['kaktus','chamaeleon','statue','mond','globus','uhr','teekanne','vogel'],names:['Dattel-Dora','Sandro','Oase','Mirage','Kaktus-Karl','Düne'],
      house:{shapes:['huette','kuppel'],walls:['lehm'],wallCols:['#F2D1A8','#EBB78A','#F7E0BC'],roofCols:['#D46A4C','#E0876A','#56C6B6'],win:['rund']},deco:['feigenkaktus','saguaro','wuestenstein','wuestenblume']},
    pilz:{skins:['myzel','moos','schleim','kompost'],heads:['pilzhut','schnecke','moosball','bluete','kohl','gehirnglas','qualle','frosch'],names:['Sporella','Lamellix','Moosi','Glimmer','Hutzel','Myko'],
      house:{shapes:['pilz','rund'],walls:['moos','lehm'],wallCols:['#F6EEDC','#DCC8F0','#C8F0D8'],roofCols:['#E8505B','#8E6BD1','#FF8FB8'],win:['rund']},deco:['leuchtpilzgruppe','pilzgruppe','sporenblume']}};
  /* ---------- einheimische Bewohner:innen ---------- */
  const natCache={};
  /* mindestens 20 Bewohner:innen je Planet (auf Kompost zusammen mit den eigenen Figuren) */const SYL=['Bi','Lu','Mo','Pi','Ra','Fi','Nu','Ko','Za','Wi','Ti','Mel','Pom','Zu','Fla','Kri'];const SYL2=['ppel','mmel','xi','nja','bo','lo','schka','ri','mo','dle','ffi','ks'];
  function natives(pid,need){const key=pid+':'+(need??20);if(natCache[key])return natCache[key];const T=THEME[pid];const r=srand(hashStr('nat'+pid).length*131+pid.length);const pk=a=>a[Math.floor(r()*a.length)];const out=[];
    const N=need??20;const used=new Set();for(let i=0;i<N;i++){const legs=PARTS.beine.filter(p=>!['kabel','wurzeln','stamm','pilzstiel','blumentopf'].includes(p.id));
      let nm=i<T.names.length?T.names[i]:pk(SYL)+pk(SYL2);while(used.has(nm))nm=pk(SYL)+pk(SYL2)+(used.size>60?i:'');used.add(nm);const d=sanitize({clothes:typeof CLOTHES!=='undefined'?CLOTHES.random(r,pid):null,name:nm,group:PLANETS[pid].n,body:{seg:1,size:.9+r()*.3,skin:pk(T.skins),color:Math.floor(r()*SKIN_COLORS.length),shape:pk(TORSOS).id,pattern:pk(PATTERNS).id,color2:Math.floor(r()*SKIN_COLORS.length)},
        parts:{kopf:pk(T.heads),augen:pk(PARTS.augen.filter(p=>p.k!=='none')).id,arme:pk(PARTS.arme).id,beine:pk(legs).id,extras:[pk(PARTS.extras).id]}});d.id='nat-'+pid+'-'+i;d.native=true;out.push(d)}
    return natCache[key]=out}
  function activeId(){return SAVE.activeChar||null}
  function residents(pid){if(pid==='kompost'){const own=allCreatures().filter(d=>d.id!==activeId());return own.concat(natives(pid,Math.max(0,20-own.length)))}return natives(pid,20)}
  /* ---------- Bauplätze: vor dem Gelände-Aufbau wählen, damit der Boden flach wird ---------- */
  function spots(pid,fns0){const list=residents(pid);const r=srand(hashStr('home'+pid).length*977+3);const out=[];const R=fns0.R;const taken=fns0.places.map(p=>p.dir);
    const c0=fns0.places[0].dir,maxA=Math.min(1.25,(list.length>12?96:72)/R);const t0=new THREE.Vector3().crossVectors(c0,Math.abs(c0.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize();
    /* Bauplatz direkt im Umkreis des Dorfs ziehen (auch auf riesigen Planeten wohnen alle nah beisammen) */const inCap=()=>{const a=Math.acos(1-r()*(1-Math.cos(maxA))),ph=r()*TAU;return c0.clone().applyAxisAngle(t0,a).applyAxisAngle(c0,ph).normalize()};
    for(const d of list){let best=null;for(let i=0;i<220&&!best;i++){const p=inCap();const h=fns0.hAt(p);if(h<fns0.sea+.5)continue;
        if(taken.some(q=>q.angleTo(p)*R<(out.length<3?17.5:16.5)))continue;if(fns0.places.some(q=>q.park&&q.dir.angleTo(p)<q.r*1.6+9/R))continue;let flat=true;const t1=new THREE.Vector3().crossVectors(p,new THREE.Vector3(0,0,1)).normalize(),t2=new THREE.Vector3().crossVectors(p,t1);
        for(const dd of[t1,t2,t1.clone().negate(),t2.clone().negate()]){const q=p.clone().addScaledVector(dd,6.5/R).normalize();if(Math.abs(fns0.hAt(q)-h)>1.3||fns0.hAt(q)<fns0.sea+.2)flat=false}if(!flat)continue;best=p}
      if(!best)continue;taken.push(best);const h=fns0.hAt(best);const step=PLANETS[pid].step;const hh=Math.max(fns0.sea+.5,Math.round((h-fns0.sea)/step)*step+fns0.sea);
      const lat=Math.asin(best.y)*180/PI,lon=Math.atan2(best.z,best.x)*180/PI;out.push({id:'home-'+d.id,n:'Haus von '+(d.name||'Namenlos'),dir:best,lat,lon,r:7.8/R,h:hh,build:'residence',who:d.id,whoName:d.name||'Namenlos',style:styleFor(pid,d)})}
    return out}
  function styleFor(pid,d){const T=THEME[pid].house;const r=srand(parseInt(hashStr(d.id||d.name).slice(0,5),36));const pk=a=>a[Math.floor(r()*a.length)];
    return{shape:pk(T.shapes),wall:pk(T.walls),wallCol:pk(T.wallCols),roofCol:pk(T.roofCols),doorCol:pk(['#7FB2E0','#F0556E','#FFD85A','#8A5A44','#56C6B6','#C6A9FF']),win:pk(T.win),chimney:!!THEME[pid].chimney||r()<.4,fence:!!THEME[pid].fence&&r()<.6,size:1,flag:false}}
  /* ---------- Haus bauen (inkl. Namensschild, Briefkasten, Deko) ---------- */
  /* Einzigartiges Haus: Bauform aus dem Architektur-Generator (Planet + Samen), dazu Namensschild und Hobby-Ecke */
  function build(pl,M){const g=new THREE.Group();const seed=ARCH.hashNum(pl.who+GAME.G.id);
    /* Neue Häuser aus Bausätzen (einzigartig je Bewohner, sauber geprüft); Front zeigt zum Dorfplatz (+z) */
    if(typeof HAUS!=='undefined'&&HAUS.ready){const U=2.0;const res=HAUS.build(GAME.G.id,seed,{sagR:(GAME.G.R+(pl.h||0))/U});const w=new THREE.Group();w.rotation.y=PI;w.scale.setScalar(U);w.add(res.g);g.add(w);
      const rot=(x,z)=>[-x*U,-z*U];const[dx,dz]=rot(res.door[0],res.door[1]);Object.assign(g.userData,{door:[dx,0,dz],doorExact:true,obstR:.3,r:res.bodyR*U,colliders:res.colliders.map(c=>[...rot(c[0],c[1]),c[2]*U]),style:res.style});
      if(res.gate){g.userData.gate={pivot:res.gate.pivot,w:.84};g.userData.keep=[res.gate.pivot]}
      if(res.yard){const Y=res.yard;const a=rot(Y.x0,Y.z0),b=rot(Y.x1,Y.z1);g.userData.yard={x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1]),gin:rot(...Y.gin),gout:rot(...Y.gout)}}
      if(res.sign){try{const[sx,sz]=rot(res.sign[0],res.sign[1]);const sg=grp(g,[sx,0,sz]);bt(sg,[0,0,0],[0,.9,0],.05,M.c('#A0704C'));P(sg,G.bx(1.05,.36,.08,.05),M.c('#FFFBF0'),[0,1.0,0]);
        const tx=ctex('nameplate-'+pl.who,256,90,(x,w2,hh)=>{x.fillStyle='#FFFBF0';x.fillRect(0,0,w2,hh);x.fillStyle='#5B4A3E';x.font='bold 34px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(pl.whoName.slice(0,14),w2/2,hh/2+2)});
        const lt=typeof LANG!=='undefined'?LANG.signTex(GAME.G.id,'np-'+pl.who,pl.whoName,{h:.33}):null;P(sg,G.pl(.98,.32),lt?new THREE.MeshBasicMaterial({map:lt}):M.tex('np-'+pl.who,tx),[0,1.0,.045]);g.userData.signPos=[sx,sz];g.userData.signText='Haus von '+pl.whoName+'. Willkommen, Freund!'}catch(e){}}
      return g}
    const res=ARCH.forHouse(GAME.G.id,seed);g.add(res.g);const[dx,dz]=res.door;Object.assign(g.userData,{door:[dx,0,dz],r:res.r,tick:res.g.userData.tick});
    try{const sg=grp(g,[dx+(dx>0?-1.5:1.5),0,dz-.3]);bt(sg,[0,0,0],[0,.9,0],.05,M.c('#A0704C'));P(sg,G.bx(1.05,.36,.08,.05),M.c('#FFFBF0'),[0,1.0,0]);
      const tx=ctex('nameplate-'+pl.who,256,90,(x,w,hh)=>{x.fillStyle='#FFFBF0';x.fillRect(0,0,w,hh);x.fillStyle='#5B4A3E';x.font='bold 34px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(pl.whoName.slice(0,14),w/2,hh/2+2)});
      P(sg,G.pl(.98,.32),M.tex('np-'+pl.who,tx),[0,1.0,.045])}catch(e){}
    /* Hobby-Ecke seitlich vor dem Haus */try{const d=GAME.ents.get(pl.who);const hobby=(d&&d.life&&d.life.hobby)||['natur','fitness','spiel','bildung','musik','kunst','angeln'][seed%7];hobbyProp(g,M,hobby,dx+(dx>0?1.9:-1.9)*-1,dz-.6)}catch(e){}
    const deco=THEME[GAME.G.id].deco;const r=srand(seed%9973);const t=deco[Math.floor(r()*deco.length)];if(NATURE[t]){const n=GAME.makeNature(t,{},3);n.position.set(-res.r*.9,0,-res.r*.5);n.scale.setScalar(.85);g.add(n)}
    return g}
  function hobbyProp(g,M,h,x,z){const q=grp(g,[x,0,z]);
    if(h==='natur'){B(q,1.3,.3,.8,.04,Wd(M,'#C98C5A'),[0,.15,0]);B(q,1.2,.06,.7,.02,M.c('#8A5E42'),[0,.3,0]);for(let i=0;i<5;i++){S(q,.1,M.c(i%2?'#7CC46A':'#F0556E'),[-.45+i*.22,.4,(i%2)*.15-.07])}}
    else if(h==='fitness'){bt(q,[-.5,.55,0],[.5,.55,0],.03,M.steel());for(const x2 of[-.45,.45])C(q,.2,.2,.08,M.c('#3B3450'),[x2,.55,0],[0,0,PI/2]);B(q,1.1,.08,.4,.03,M.c('#F0556E'),[0,.3,.4])}
    else if(h==='spiel'){for(const x2 of[-.7,.7]){bt(q,[x2,0,-.4],[x2,1.6,0],.04,M.c('#F7B84B'));bt(q,[x2,0,.4],[x2,1.6,0],.04,M.c('#F7B84B'))}bt(q,[-.7,1.6,0],[.7,1.6,0],.05,M.c('#F7B84B'));for(const x2 of[-.15,.15])bt(q,[x2,1.6,0],[x2,.5,0],.01,M.c('#8A5A44'));B(q,.45,.05,.2,.02,M.c('#56C6B6'),[0,.48,0])}
    else if(h==='bildung'){for(let i=0;i<3;i++){const a=i/3*TAU;bt(q,[Math.sin(a)*.35,0,Math.cos(a)*.35],[0,.9,0],.025,M.c('#8A5A44'))}const t=grp(q,[0,.95,0],[0,0,-.6]);C(t,.08,.11,.9,M.c('#F7F3E8',{gloss:.6}),[0,.3,0]);P(t,G.to(.09,.02),M.gold(),[0,.75,0],[PI/2,0,0])}
    else if(h==='musik'){B(q,.6,.5,.5,.05,Wd(M,'#8A5A44'),[0,.25,0]);const hn=grp(q,[0,.5,0],[-.4,0,0]);bt(hn,[0,0,0],[0,.3,.1],.03,M.gold());P(hn,G.co(.3,.5,16,),M.gold(),[0,.55,.25],[-1.2,0,0])}
    else if(h==='kunst'){for(const x2 of[-1,1])bt(q,[x2*.3,0,0],[x2*.12,1.4,-.1],.03,Wd(M,PAL.wood));B(q,.6,.5,.04,.02,M.c('#FFFBF0'),[0,1,-.02],[-.12,0,0]);S(q,.06,M.c('#56C6B6'),[0,1.05,.02])}
    else{const b=grp(q,[0,0,0],[0,.4,0]);P(b,G.hs(1),M.c('#6AA8F0',{gloss:.5}),[0,.25,0],[PI,0,0],[.9,.35,.4]);bt(b,[.2,.3,0],[.6,1.6,0],.02,M.c('#8A5A44'))}}
  /* ---------- Klingeln ---------- */
  async function knock(pl){const e=GAME.ents.get(pl.who);SND.play('pep',{vol:.8});setTimeout(()=>SND.play('pep',{vol:.8,rate:1.2}),260);
    if(!e){UI.toast('Niemand zu Hause.');return}
    if(e.inHome){if(e.sleeping&&(GAMETIME.hour()>=22||GAMETIME.hour()<6)){await UI.talk(pl.whoName,['*schnarch* … zzz … (Durch die Tür hörst du leises Schnarchen. Komm lieber morgen wieder.)'],{voice:GAME.voiceFor(e.d)});return}
      e.inHome=false;e.sleeping=false;if(e.life){e.life.act=null}e.p.copy(pl.doorP);GAME.say(e,'icon:wave',2,true);await new Promise(r=>setTimeout(r,500));await LIFE.interact(e);return}
    const d=e.p.angleTo(pl.doorP)*GAME.G.R;UI.toast(pl.whoName+' ist nicht zu Hause'+(e.life?' – '+pl.whoName+' '+LIFE.status(e)+(d<60?' (ca. '+Math.round(d)+' m entfernt)':''):'')+'.',3600)}
  /* ---------- Eigene Figuren wechseln ---------- */
  function charsApp(){const w=UI.win('Meine Figuren',{size:'wide'});w.body.append(el('p',null,'Du spielst immer eine Figur. Alle anderen, die du im Labor in die Welt geschickt hast, leben als KI weiter: Sie haben Bedürfnisse, Hobbys, ein eigenes Haus und einen eigenen Tagesablauf. Du kannst jederzeit wechseln.'));
    const gr=el('div','grid');const cur=activeId();
    const card=(d,label,isCur,on)=>{const c=el('div','card');const im=UI.creatureThumb(d);c.append(im,el('b',null,d.name||'Namenlos'),el('span','sub',isCur?'Du spielst diese Figur':label));const b=btn(isCur?'Aktiv':'Spielen',isCur?'small':'small primary',isCur?null:on);b.disabled=isCur;c.append(b);gr.append(c)};
    card(sanitize(JSON.parse(JSON.stringify(S))),'Labor-Entwurf',!cur,()=>{switchTo(null);w.close()});
    for(const d of WORLD){const e=GAME.ents.get(d.id);card(d,e&&e.life?'KI: '+LIFE.status(e):'lebt als KI',cur===d.id,()=>{switchTo(d.id);w.close()})}
    if(!WORLD.length)w.body.append(el('div','note','Noch keine weiteren Figuren. Baue im Labor eine neue und schicke sie in die Welt – dann kannst du hier zu ihr wechseln.'));w.body.append(gr)}
  function switchTo(id){const me=GAME.me;const oldId=activeId();SAVE.activeChar=id;persist();const pos=me?me.p.clone():null;
    GAME.onAvatarChanged();GAME.syncVillagers();if(oldId&&pos){const e=GAME.ents.get(oldId);if(e){e.p.copy(pos).applyAxisAngle(GAME.tangentTo(pos,new THREE.Vector3(1,0,0)),1.4/GAME.G.R).normalize();GAME.say(e,'Tschüss! Ich mach dann mal mein Ding.',3)}}
    if(id&&me){const e2=GAME.ents.get(id);if(e2)GAME.dropEnt(id)}UI.toast('Du spielst jetzt '+(id?(WORLD.find(d=>d.id===id)||{}).name:'deinen Labor-Entwurf')+'.');SND.jingle('j_success')}
  function avatar(){const id=activeId();if(!id)return null;const d=WORLD.find(x=>x.id===id);return d?JSON.parse(JSON.stringify(d)):null}
  return{THEME,natives,residents,spots,build,knock,charsApp,switchTo,avatar,activeId}
})();
