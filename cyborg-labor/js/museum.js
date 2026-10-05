/* =====================================================================
   CYBORG-LABOR · museum.js
   Nationalmuseum (Aquarien, Terrarien, Fundstücke, Kunstgalerie),
   Kuratorin, Farbstudio (32×32-Pixel-Designs), Kunst-Codes.
   ===================================================================== */
const CURATOR={n:'Kuratorin Uhu',d:{name:'Kuratorin Uhu',body:{seg:2,size:1.05,skin:'fell',color:1,shape:'birne',pattern:'bauch',color2:4},parts:{kopf:'eule',augen:'monokel',arme:'mensch',beine:'huhn',extras:['namensschild']}}};
let GALLERY=LS.get('cyborg-labor-galerie',[]).map(sanitizeArt).filter(Boolean);   /* eigene ausgestellte Werke */
let FOREIGN_ART=LS.get('cyborg-labor-fremdkunst',[]).map(sanitizeArt).filter(Boolean); /* per Code/online erhalten */
const saveArt=()=>{LS.set('cyborg-labor-galerie',GALLERY);LS.set('cyborg-labor-fremdkunst',FOREIGN_ART.slice(-60))};

INTERIOR.kinds.museum={bg:'#E9E2F5',music:'museum',build(sc){const W=30,D=24,H=5.5;const M=makeMats({skin:'haut',color:0});
    INTERIOR.makeRoom(sc,W,D,H,'__museum_wall','__museum_floor',{trim:'#B79A6E'});
    /* eigene Wände/Böden (Marmor, Parkett) */
    sc.traverse(o=>{if(o.isMesh&&o.material&&o.material.map&&o.name==='floor'){o.material=cozy({map:museumTex('floor',[W/2,D/2]),color:'#fff',rim:.05})}else if(o.isMesh&&o.material&&o.material.map&&o.material.isMeshToonMaterial&&!o.material.transparent&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.height>3){o.material=cozy({map:museumTex('wall',[4,1]),color:'#fff',rim:.05})}});
    const ex=new THREE.Group();sc.add(ex);const C=INTERIOR.colliders,A=INTERIOR.actions;const anim=[];sc.userData.anim=anim;const T=x=>I18N.t?I18N.t(x):x;
    const sign=(txt,x,y,z,col,ry)=>{const t=ctex('sign-'+txt,512,128,(c,w,h)=>{c.fillStyle=col;c.beginPath();c.roundRect?c.roundRect(4,4,w-8,h-8,40):c.rect(4,4,w-8,h-8);c.fill();c.fillStyle='#fff';c.font='bold 60px Fredoka, Nunito, sans-serif';c.textAlign='center';c.fillText(T(txt),w/2,86)});
      const m=P(ex,G.pl(2.6,.65),new THREE.MeshBasicMaterial({map:t,transparent:true}),[x,y,z],[0,ry||0,0]);m.userData.noOutline=true;return m};
    const fishAll=SAVE.donated.fish.map(id=>findIn(FISH,id)).filter(Boolean),bugsAll=SAVE.donated.bugs.map(id=>findIn(BUGS,id)).filter(Boolean);
    /* ----- Durchgänge: links ins grosse Aquarium, rechts zu den Insektenhäusern ----- */
    const arch=(side,label,col,glow,act)=>{const x=side*(W/2-.15),z=-5;const g=grp(ex,[x,0,z],[0,side<0?PI/2:-PI/2,0]);for(const s of[-1,1])P(g,G.bx(.5,3.4,.5,.08),M.c('#E8DCC8'),[s*1.6,1.7,0]);
      P(g,G.to(1.6,.25,PI),M.c('#E8DCC8'),[0,3.4,0]);const pane=P(g,G.pl(2.7,3.3),new THREE.MeshBasicMaterial({color:glow,transparent:true,opacity:.75}),[0,1.65,.02]);pane.userData.noOutline=true;
      const L=new THREE.PointLight(glow,.8,6,2);L.position.set(side*-1.2,2,0);g.add(L);sign(label,x-side*.2,4.3,z,col,side<0?PI/2:-PI/2);A.push({x:x-side*1.3,z,r:1.6,label:T(label)+' '+T('betreten'),act})};
    arch(-1,'Grosses Aquarium','#2A7AB8','#7FD0F0',()=>HABITAT.enterAquarium('museum','museum'));
    arch(1,'Insektenhäuser','#4E9A4A','#B8F0A0',()=>HABITAT.pickPlanet('museum','museum'));
    /* ----- Mitte: Fossilien-Plattformen (ganzes Skelett, sobald alle Teile gespendet sind) ----- */
    const have=SAVE.donated.relics;const SETS=HABITAT.SETS;
    SETS.forEach((set,i)=>{const x=-8+(i%3)*8,z=i<3?-5:3;const pg=grp(ex,[x,0,z]);P(pg,G.cy(2,2.1,.4,32),M.c('#F2EAD8'),[0,.2,0]);P(pg,G.cy(2.1,2.1,.08,32),M.c('#B79A6E'),[0,.42,0]);
      for(let k=0;k<6;k++){const a=k/6*TAU+.5;if(Math.abs(Math.sin(a))>.8&&Math.cos(a)>0)continue;const px=Math.cos(a)*2.35,pz=Math.sin(a)*2.35;P(pg,G.cy(.06,.08,.8),M.c('#C9A24A',{gloss:1}),[px,.4,pz]);P(pg,G.s(.09),M.c('#C9A24A',{gloss:1}),[px,.82,pz])}
      const sk=HABITAT.skeleton(set,have,M,3.4);sk.g.position.y=.46;sk.g.rotation.y=-.5;pg.add(sk.g);C.push({x0:x-2.2,x1:x+2.2,z0:z-2.2,z1:z+2.2});
      const got=set.parts.filter(p=>have.includes(p.id)).length;
      if(sk.done){const L=new THREE.SpotLight('#fff4d8',1.1,9,.6,.5,1.5);L.position.set(x,H-.3,z+1);L.target.position.set(x,0,z);ex.add(L,L.target)}
      A.push({x,z:z+2.7,r:1.4,label:set.n+' · '+got+'/3',act:()=>fossilPlaque(set,have)})});
    /* Bänke zwischen den Plattformen */for(const x of[-4,4]){const b=grp(ex,[x,0,-1]);P(b,G.bx(2.2,.12,.6,.04),M.c('#C98C5A'),[0,.48,0]);for(const s of[-1,1])P(b,G.bx(.14,.48,.5,.03),M.c('#8A5A44'),[s*.9,.24,0]);C.push({x0:x-1.2,x1:x+1.2,z0:-1.4,z1:-.6})}
    /* ----- weitere Fundstücke: Sockel entlang der Seitenwände ----- */
    const relics=have.filter(id=>!id.startsWith('fos_')).map(id=>findIn(RELICS,id)).filter(Boolean);
    const spots=[];for(const side of[-1,1])for(let k=0;k<5;k++)spots.push([side*(W/2-1.4),-1+k*2.4]);
    spots.forEach(([x,z],i)=>{const r=relics[i];const pg=grp(ex,[x,0,z]);P(pg,G.cy(.42,.5,.9),M.c('#F6F1EA'),[0,.45,0]);P(pg,G.cy(.5,.5,.1),M.c('#D9CDBA'),[0,.92,0]);C.push({x0:x-.5,x1:x+.5,z0:z-.5,z1:z+.5});
      if(r){const rg=new THREE.Group();QF=.6;try{r.b(rg,M,{},srand(i))}catch(e){}QF=1;addOutlines(rg);rg.scale.setScalar(.48);rg.position.y=1.0;pg.add(rg);anim.push({g:rg,spin:true,ph:i});A.push({x:x-Math.sign(x)*1.1,z,r:1,label:r.n+' '+T('ansehen'),act:()=>plaque(r.n,[['relic',r]])})}});
    /* ----- Kunst: eine Reihe an der Rückwand ----- */
    sign('Kunstgalerie',0,H-.7,-D/2+.12,'#FF8FB1');
    const art=[...GALLERY.map(a=>Object.assign({mine:true},a)),...FOREIGN_ART,...(window.SOCIAL?SOCIAL.onlineArt():[])];const seen=new Set();const uniq=art.filter(a=>{if(seen.has(a.id))return false;seen.add(a.id);return true})
    .slice(0,13);
    /* Plätze zwischen den Fenstern (oben) und unter den Fenstern (unten) – nie über einem Fenster */const nb=Math.max(1,Math.floor(W/4.2));const wx=i=>-W/2+W*(i+.5)/nb;const slots=[];for(let i=0;i<nb-1;i++)slots.push([(wx(i)+wx(i+1))/2,2.7]);for(let i=0;i<nb;i++)slots.push([wx(i),1.15]);
    uniq.slice(0,slots.length).forEach((a,i)=>{const[x,y]=slots[i],z=-D/2+.06;const f=INTERIOR.framedPicture(a,y>2?1.6:1.2);f.position.set(x,y,z);ex.add(f);A.push({x,z:-D/2+1.2,r:1,label:`«${a.name}» ansehen`,act:()=>artPlaque(a)})});
    if(!uniq.length){const t=ctex('leer-kunst',512,128,(c,w,h)=>{c.fillStyle='#8A7160';c.font='bold 30px Nunito, sans-serif';c.textAlign='center';c.fillText(T('Noch keine Kunst. Malt im Farbstudio!'),w/2,72)});const m=P(ex,G.pl(4,1),new THREE.MeshBasicMaterial({map:t,transparent:true}),[0,2.4,-D/2+.08]);m.userData.noOutline=true}
    /* ----- Eingang: Kuratorin links, Katalog rechts ----- */
    const cur=buildCreature(sanitize(CURATOR.d),{q:.8,noShadow:!HIGH});cur.scale.setScalar(CS);cur.position.set(-8,0,D/2-3.6);cur.rotation.y=PI*.15;ex.add(cur);P(ex,G.bx(2.4,1,.8,.2),M.c('#B79A6E'),[-8,.5,D/2-2.7]);C.push({x0:-9.3,x1:-6.7,z0:D/2-4.2,z1:D/2-2.2});anim.push({g:cur,creature:true});
    A.push({x:-8,z:D/2-1.6,r:1.5,label:'Mit der Kuratorin sprechen',act:curatorTalk});
    {const k=grp(ex,[8,0,D/2-2.8]);P(k,G.bx(1.2,1.1,.5,.1),M.c('#B79A6E'),[0,.55,0]);P(k,G.bx(1.1,.7,.06,.04),M.c('#FFFDF7'),[0,1.3,.1],[-.3,0,0]);C.push({x0:7.3,x1:8.7,z0:D/2-3.2,z1:D/2-2.4});
      A.push({x:8,z:D/2-1.6,r:1.4,label:T('Katalog: alle Spenden ansehen'),act:()=>katalog(fishAll,bugsAll)})}
    for(const z of[-D/4,D/4])for(const x of[-W/3,0,W/3]){const L=new THREE.PointLight('#fff0d8',.45,12,2);L.position.set(x,H-.8,z);ex.add(L)}
    ex.traverse(o=>{if(o.isMesh&&!o.userData.hull){o.castShadow=HIGH;o.receiveShadow=true}});
    return{W,D,camD:19,camH:14}},
  frame(dt,t){const sc=INTERIOR.scene;const anim=sc&&sc.userData.anim;if(!anim)return;for(const a of anim){if(a.creature){a.g.userData.tick&&a.g.userData.tick(t,false,0);continue}if(a.spin){a.g.rotation.y=t*.6+a.ph}}}};
/* Fossil-Plattform: welche Teile da sind, und der Fakt */
function fossilPlaque(set,have){const w=UI.win(set.n,{size:'narrow'});const done=set.parts.every(p=>have.includes(p.id));
  w.body.append(el('p','sub',done?'Vollständig! Das ganze Skelett steht auf der Plattform.':'Noch nicht vollständig. Fossilien findest du beim Graben in Höhlen und auf dem Urzeit-Planeten.'));
  set.parts.forEach(p=>{const r=RELICS.find(x=>x.id===p.id);const ok=have.includes(p.id);const c=el('div','pcard');if(ok&&r)c.append(itemThumb('relic',r.id));c.append(el('b',null,(r?r.n:p.n)+(ok?'':' · fehlt')));w.body.append(c)});
  const r0=RELICS.find(x=>x.id===set.parts[0].id);if(r0&&r0.fact)w.body.append(el('p',null,r0.fact));SND.play('page')}
function museumTex(k,rep){const t=ctex('mus-'+k,256,256,(x,w,h)=>{if(k==='floor'){x.fillStyle='#E8D2AE';x.fillRect(0,0,w,h);for(let j=0;j<8;j++)for(let i=0;i<4;i++){x.fillStyle=(i+j)%2?'#DDC39A':'#EBD8B7';x.fillRect(i*64+(j%2)*32,j*32,64,32);x.strokeStyle='#C9AE84';x.lineWidth=2;x.strokeRect(i*64+(j%2)*32,j*32,64,32)}}
  else{x.fillStyle='#F4EEE2';x.fillRect(0,0,w,h);x.fillStyle='#EDE4D2';for(let i=0;i<4;i++)x.fillRect(i*64+28,0,8,h);x.fillStyle='#E0D2B8';x.fillRect(0,h-26,w,26)}});const c=t.clone();c.needsUpdate=true;c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(rep[0],rep[1]);return c}
/* Katalog: alle Spenden nach Planet, nur Namen (schnell auch bei Hunderten Arten) */
function katalog(fish,bugs){const T=x=>I18N.t?I18N.t(x):x;const w=UI.win(T('Katalog')+' · '+fish.length+' '+T('Fische')+' · '+bugs.length+' '+T('Insekten'),{size:'wide'});
  const by={};for(const[k,L]of[['f',fish],['b',bugs]])for(const d of L){const e=by[d.planet]=by[d.planet]||{f:[],b:[]};e[k].push(d.n)}
  for(const[pid,e]of Object.entries(by)){const sec=el('div','f');sec.append(el('b',null,T((PLANETS[pid]&&PLANETS[pid].n)||pid)));
    if(e.f.length)sec.append(el('p','sub',T('Fische')+': '+e.f.map(T).join(', ')));if(e.b.length)sec.append(el('p','sub',T('Insekten')+': '+e.b.map(T).join(', ')));w.body.append(sec)}
  SND.play('page')}
function plaque(title,list){const w=UI.win(title,{size:'narrow'});list.forEach(([k,d])=>{const b=el('div','pcard');const img=itemThumb(k,d.id);img.style.cssText='width:110px;height:110px;border-radius:14px;background:var(--seaL)';b.append(img,el('b',null,d.n),el('span',null,d.fact||''));w.body.append(b)});SND.play('page')}
function artPlaque(a){const w=UI.win('«'+a.name+'»',{size:'narrow'});const img=designImg(a,256);img.style.cssText='width:100%;max-width:280px;border-radius:12px;align-self:center;box-shadow:0 0 0 8px #C98C5A';w.body.append(img,el('p',null,'Von '+(a.by||'unbekannt')+(a.mine?' (dein Werk)':'')));
  const code=el('div','code',encodeArt(a));w.body.append(el('p','sub','Kunstcode zum Teilen:'),code);w.foot.append(btn('Code kopieren','primary',()=>UI.copy(code.textContent,'Kunstcode kopiert',code)));
  if(!a.mine){const b=btn('Als Design übernehmen',null,()=>{SAVE.designs.push({id:rid(),name:a.name,pal:[...a.pal],px:a.px,by:a.by});persist();UI.toast('In deine Designs übernommen')});w.foot.append(b)}}
async function curatorTalk(){const voice={pitch:150,speed:.85};const nick=SAVE.nick||S.name||'Besucher:in';
  const ch=await UI.talk(CURATOR.n,[`Huhu, ${nick}! Willkommen im Nationalmuseum.`,'Was kann ich für dich tun?'],{voice,color:'#B79A6E',choices:['Etwas spenden','Kunst ausstellen','Kunstcodes einlesen','Nichts, danke']});
  if(ch===0){const cand=SAVE.bag.filter(it=>['fish','bug','relic'].includes(it.kind)&&!SAVE.donated[{fish:'fish',bug:'bugs',relic:'relics'}[it.kind]].includes(it.id));
    if(!cand.length){await UI.talk(CURATOR.n,['Hmm, du hast nichts dabei, was wir noch nicht haben. Geh angeln, fang Insekten oder grab etwas aus!'],{voice});return}
    const w=UI.win('Spenden',{size:'narrow'});w.body.append(el('p','sub','Alles, was das Museum noch nicht hat:'));const gr=el('div','grid');cand.forEach(it=>{const c=el('button','card');c.type='button';c.append(itemThumb(it.kind,it.id),el('span',null,itemName(it.kind,it.id)));
      c.onclick=async()=>{w.close();bagTake(it.kind,it.id,1);SAVE.donated[{fish:'fish',bug:'bugs',relic:'relics'}[it.kind]].push(it.id);persist();SND.jingle('j_museum');const d=itemDef(it.kind,it.id);
        await UI.talk(CURATOR.n,[`Oh! ${d.n}! Wie wunderbar.`,d.fact||'Das stellen wir gleich aus.','Komm bald wieder, die Ausstellung wächst mit dir.'],{voice});rebuildMuseum()};gr.append(c)});w.body.append(gr)}
  else if(ch===1){if(!SAVE.designs.length){await UI.talk(CURATOR.n,['Du hast noch keine eigenen Werke. Im Farbstudio neben dem Platz kannst du malen!'],{voice});return}
    const w=UI.win('Welches Werk ausstellen?',{size:'narrow'});const gr=el('div','grid');SAVE.designs.forEach(d=>{const c=el('button','card');c.type='button';c.append(designImg(d,96),el('span',null,d.name));c.onclick=()=>{w.close();exhibit(d)};gr.append(c)});w.body.append(gr)}
  else if(ch===2){importArt()}}
function exhibit(d){const a=sanitizeArt({name:d.name,by:SAVE.nick||S.name||'',pal:d.pal,px:d.px});if(!a)return;if(!GALLERY.some(x=>x.id===a.id))GALLERY.push(a);GALLERY=GALLERY.slice(-14);saveArt();SND.jingle('j_museum');SOCIAL.publishArt&&SOCIAL.publishArt(a);
  UI.talk(CURATOR.n,[`«${a.name}» hängt jetzt in der Galerie!`,'Wer gerade online ist, sieht es auch. Und mit dem Kunstcode können es alle in ihr Museum holen.'],{voice:{pitch:150,speed:.85}}).then(()=>{if(GAME.mode==='interior'&&INTERIOR.kind==='museum')rebuildMuseum()})}
function importArt(){const w=UI.win('Kunstcodes einlesen',{size:'narrow'});w.body.append(el('p',null,'Fügt Kunstcodes ein (beginnen mit ART1.). Mehrere dürfen untereinander stehen.'));const ta=el('textarea');ta.rows=6;ta.id='artImport';w.body.append(ta);
  w.foot.append(btn('Einlesen','primary',()=>{const list=decodeArt(ta.value);if(!list.length){UI.toast('Kein gültiger Kunstcode gefunden.');return}let n=0;for(const a of list)if(!FOREIGN_ART.some(x=>x.id===a.id)){FOREIGN_ART.push(a);n++}saveArt();w.close();UI.toast(`${n} Werk${n===1?'':'e'} in die Galerie geholt`);if(GAME.mode==='interior'&&INTERIOR.kind==='museum')rebuildMuseum()}))}
function rebuildMuseum(){if(GAME.mode!=='interior'||INTERIOR.kind!=='museum')return;const me=GAME.me;const ix=me.ix,iz=me.iz;GAME.fadeOut(()=>{const sc=INTERIOR.scene;sc.remove(me.g);sc.remove(me.shadow);
  /* Szene neu: einfach erneut betreten */INTERIOR.kinds.museum._re=true});setTimeout(()=>{INTERIOR.enter('museum');setTimeout(()=>{me.ix=ix;me.iz=iz},450)},10)}

/* ================= Farbstudio ================= */
const PAINT=(()=>{const DEF_PAL=['#FFFDF7','#3B3450','#F0556E','#FF9E45','#FFE27A','#7CC46A','#3F7F4F','#56C6B6','#6AA8F0','#4B5E9C','#C6A9FF','#FF8FB8','#C98C5A','#7B5236','#BDB6C8','#FFC9A8'];
  function open(design){SND.play('open');const d=design?JSON.parse(JSON.stringify(design)):{id:rid(),name:'',pal:[...DEF_PAL],px:'0'.repeat(1024)};let px=d.px.split('');let cur=1,tool='stift',mirror=false;const undo=[];
    const w=UI.win('Farbstudio',{size:'wide'});const wrap=el('div','paint');const cv=document.createElement('canvas');cv.width=cv.height=512;cv.className='pc';const side=el('div');side.style.cssText='display:flex;flex-direction:column;gap:12px';wrap.append(cv,side);w.body.append(wrap);
    const nm=el('input');nm.type='text';nm.id='paintName';nm.maxLength=32;nm.placeholder='Titel, z. B. Kompost-Kuss';nm.value=d.name;const nl=el('label','f','Titel');nl.append(nm);side.append(nl);
    const tl=el('div','tools');const tools=[['stift','Stift'],['fuellen','Füllen'],['radierer','Radierer'],['pipette','Pipette']];const tb={};tools.forEach(([id,n])=>{const b=el('button',null,n);b.type='button';b.onclick=()=>{tool=id;upd()};tb[id]=b;tl.append(b)});
    const mb=el('button',null,'Spiegeln');mb.type='button';mb.onclick=()=>{mirror=!mirror;upd()};tl.append(mb);const ub=el('button',null,'Rückgängig');ub.type='button';ub.onclick=()=>{if(undo.length){px=undo.pop();draw()}};tl.append(ub);side.append(tl);
    const pal=el('div','pal');const pb=[];d.pal.forEach((c,i)=>{const b=el('button');b.type='button';b.style.background=c;b.setAttribute('aria-label','Farbe '+(i+1));b.onclick=()=>{if(cur===i&&i>0){ci.value=d.pal[i];ci.click()}cur=i;if(tool==='radierer')tool='stift';upd()};pb.push(b);pal.append(b)});
    const ci=el('input');ci.type='color';ci.id='paintColor';ci.style.cssText='width:100%;height:34px;border:0;background:none;padding:0';ci.oninput=()=>{d.pal[cur]=ci.value;pb[cur].style.background=ci.value;draw()};
    const pl=el('label','f','Farben (Farbe nochmals antippen zum Ändern)');pl.append(pal,ci);side.append(pl);
    const tpl=el('div','tools');[['leer','Leeren'],['gesicht','Vorlage: Gesicht'],['blume','Vorlage: Blume']].forEach(([id,n])=>{const b=el('button',null,n);b.type='button';b.onclick=()=>{undo.push([...px]);px=template(id);draw()};tpl.append(b)});side.append(tpl);
    const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
    function draw(){const s=16;for(let i=0;i<1024;i++){x.fillStyle=d.pal[parseInt(px[i],16)];x.fillRect((i%32)*s,Math.floor(i/32)*s,s,s)}x.strokeStyle='rgba(90,70,60,.12)';x.lineWidth=1;for(let i=0;i<=32;i++){x.beginPath();x.moveTo(i*s,0);x.lineTo(i*s,512);x.stroke();x.beginPath();x.moveTo(0,i*s);x.lineTo(512,i*s);x.stroke()}
      if(mirror){x.strokeStyle='rgba(240,85,110,.6)';x.lineWidth=3;x.beginPath();x.moveTo(256,0);x.lineTo(256,512);x.stroke()}}
    function upd(){pb.forEach((b,i)=>b.setAttribute('aria-pressed',i===cur));Object.entries(tb).forEach(([k,b])=>b.setAttribute('aria-pressed',k===tool));mb.setAttribute('aria-pressed',mirror);draw()}
    const setPx=(i,v)=>{px[i]=v;if(mirror){const cx=i%32,cy=Math.floor(i/32);px[cy*32+31-cx]=v}};
    function fill(i,v){const t=px[i];if(t===v)return;const st=[i];while(st.length){const k=st.pop();if(px[k]!==t)continue;px[k]=v;const cx=k%32,cy=Math.floor(k/32);if(cx>0)st.push(k-1);if(cx<31)st.push(k+1);if(cy>0)st.push(k-32);if(cy<31)st.push(k+32)}}
    let down=false;const at=e=>{const r=cv.getBoundingClientRect();const cx=Math.floor((e.clientX-r.left)/r.width*32),cy=Math.floor((e.clientY-r.top)/r.height*32);return cx<0||cy<0||cx>31||cy>31?-1:cy*32+cx};
    const paintAt=e=>{const i=at(e);if(i<0)return;const v=(tool==='radierer'?0:cur).toString(16);if(tool==='pipette'){cur=parseInt(px[i],16);tool='stift';upd();return}if(tool==='fuellen'){fill(i,v);if(mirror){const cx=i%32,cy=Math.floor(i/32);fill(cy*32+31-cx,v)}draw();SND.play('brush',{vol:.5});return}setPx(i,v);draw()};
    cv.addEventListener('pointerdown',e=>{down=true;cv.setPointerCapture(e.pointerId);undo.push([...px]);if(undo.length>40)undo.shift();paintAt(e);if(tool==='stift'||tool==='radierer')SND.play('brush',{vol:.35,jitter:.3})});
    cv.addEventListener('pointermove',e=>{if(down&&(tool==='stift'||tool==='radierer'))paintAt(e)});cv.addEventListener('pointerup',()=>down=false);cv.addEventListener('pointercancel',()=>down=false);
    const save=()=>{d.name=nm.value.trim()||'Ohne Titel';d.px=px.join('');const i=SAVE.designs.findIndex(x=>x.id===d.id);if(i>=0)SAVE.designs[i]=d;else SAVE.designs.push(d);persist();return d};
    w.foot.append(btn('Speichern','primary',()=>{save();SND.play('j_success');UI.toast('Design gespeichert')}),btn('Im Museum ausstellen','pink',()=>{const dd=save();exhibit(dd);w.close()}),
      btn('Kunstcode kopieren',null,()=>{const dd=save();UI.copy(encodeArt({name:dd.name,by:SAVE.nick||S.name,pal:dd.pal,px:dd.px}),'Kunstcode kopiert')}));
    upd()}
  function template(k){const a=Array(1024).fill('0');const set=(x,y,v)=>{if(x>=0&&y>=0&&x<32&&y<32)a[y*32+x]=v.toString(16)};
    if(k==='gesicht'){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x-15.5,y-16.5);if(d<13)set(x,y,d>11.8?1:15)}[[10,13],[20,13]].forEach(([ex,ey])=>{for(let y=-2;y<=2;y++)for(let x=-1;x<=1;x++)set(ex+x,ey+y,1);set(ex,ey-1,0)});for(let x=11;x<=20;x++)set(x,21+Math.round(Math.pow((x-15.5)/5,2)*-2+2),1);set(7,18,11);set(8,18,11);set(23,18,11);set(24,18,11)}
    else if(k==='blume'){for(let i=0;i<6;i++){const an=i/6*TAU;const cx=15.5+Math.cos(an)*6,cy=12+Math.sin(an)*6;for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(Math.hypot(x-cx,y-cy)<4.2)set(x,y,11)}for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(Math.hypot(x-15.5,y-12)<3.4)set(x,y,4);for(let y=18;y<31;y++){set(15,y,6);set(16,y,6)}for(let y=0;y<4;y++)for(let x=0;x<6;x++)if(x+y<6)set(17+x,24+y,5)}
    return a}
  return{open};
})();
