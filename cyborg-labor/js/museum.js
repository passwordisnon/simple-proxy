/* =====================================================================
   CYBORG-LABOR · museum.js
   Nationalmuseum (Aquarien, Terrarien, Fundstücke, Kunstgalerie),
   Kuratorin, Farbstudio (32×32-Pixel-Designs), Kunst-Codes.
   ===================================================================== */
const CURATOR={n:'Kuratorin Uhu',d:{name:'Kuratorin Uhu',body:{seg:2,size:1.05,skin:'fell',color:1,shape:'birne',pattern:'bauch',color2:4},parts:{kopf:'eule',augen:'monokel',arme:'mensch',beine:'huhn',extras:['namensschild']}}};
let GALLERY=LS.get('cyborg-labor-galerie',[]).map(sanitizeArt).filter(Boolean);   /* eigene ausgestellte Werke */
let FOREIGN_ART=LS.get('cyborg-labor-fremdkunst',[]).map(sanitizeArt).filter(Boolean); /* per Code/online erhalten */
const saveArt=()=>{LS.set('cyborg-labor-galerie',GALLERY);LS.set('cyborg-labor-fremdkunst',FOREIGN_ART.slice(-60))};

INTERIOR.kinds.museum={bg:'#E9E2F5',music:'museum',build(sc){const W=22,D=14,H=4.6;const M=makeMats({skin:'haut',color:0});
    INTERIOR.makeRoom(sc,W,D,H,'__museum_wall','__museum_floor',{trim:'#B79A6E'});
    /* eigene Wände/Böden (Marmor, Parkett) */
    sc.traverse(o=>{if(o.isMesh&&o.material&&o.material.map&&o.name==='floor'){o.material=cozy({map:museumTex('floor',[W/2,D/2]),color:'#fff',rim:.05})}else if(o.isMesh&&o.material&&o.material.map&&o.material.isMeshToonMaterial&&!o.material.transparent&&o.geometry.attributes.normal){/* nur Wände: Fensterglas (Himmel) und Lichtschleier behalten ihr eigenes Material */o.material=cozy({map:museumTex('wall',[W/3,H/3]),color:'#fff',rim:.05})}});
    const ex=new THREE.Group();sc.add(ex);const C=INTERIOR.colliders,A=INTERIOR.actions;const anim=[];sc.userData.anim=anim;
    const sign=(txt,x,z,col)=>{const t=ctex('sign-'+txt,512,128,(c,w,h)=>{c.fillStyle=col;c.beginPath();c.roundRect?c.roundRect(4,4,w-8,h-8,40):c.rect(4,4,w-8,h-8);c.fill();c.fillStyle='#fff';c.font='bold 64px Fredoka, Nunito, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,w/2,h/2+4)});
      const m=P(ex,G.pl(2.4,.6),new THREE.MeshBasicMaterial({map:t,transparent:true}),[x,H-.7,z]);m.userData.noOutline=true;return m};
    /* ----- Fische: Aquarien an der linken Wand ----- */
    sign('Fische',-W/2+3.4,-D/2+.12,'#56C3E8');
    const fishes=SAVE.donated.fish.map(id=>findIn(FISH,id)).filter(Boolean);const tanks=[];const tankN=Math.max(3,Math.ceil(fishes.length/3));
    for(let i=0;i<Math.min(tankN,8);i++){const tx=-W/2+1.3,tz=-D/2+1.6+i*1.55;if(tz>D/2-2.2)break;const tg=grp(ex,[tx,0,tz]);P(tg,G.bx(1.5,.7,1.35,.12),M.c('#8A5E42'),[0,.35,0]);
      const water=P(tg,G.bx(1.4,1.1,1.25,.05),M.c('#7FDCE6',{opacity:.35}),[0,1.25,0]);water.userData.noOutline=true;P(tg,G.bx(1.5,.1,1.35,.04),M.c('#8A5E42'),[0,1.85,0]);
      range(3,(t,j)=>P(tg,G.s(.12),M.c(['#7CC46A','#FF8FB8','#FFE27A'][j]),[(t-.5)*.8,.78,(j%2-.5)*.6],null,[1,.6,1]));C.push({x0:tx-.8,x1:tx+.8,z0:tz-.7,z1:tz+.7});
      const inTank=fishes.slice(i*3,i*3+3);inTank.forEach((f,k)=>{const fg=new THREE.Group();QF=.6;try{f.b(fg,M,{},srand(k))}catch(e){}QF=1;addOutlines(fg);const sz={S:.28,M:.38,L:.5,XL:.6}[f.size]||.38;fg.scale.setScalar(sz);tg.add(fg);anim.push({g:fg,cx:0,cy:1.2+k*.18,r:.35,sp:.7+k*.25,ph:k*2})});
      if(inTank.length)A.push({x:tx+1.2,z:tz,r:1.2,label:'Aquarium ansehen',act:()=>plaque('Aquarium',inTank.map(f=>['fish',f]))})}
    /* ----- Insekten: Terrarien rechts ----- */
    sign('Insekten',W/2-3.4,-D/2+.12,'#6CC05A');
    const bugs=SAVE.donated.bugs.map(id=>findIn(BUGS,id)).filter(Boolean);
    const bugSpots=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++)bugSpots.push([W/2-1.2-c*1.6,-D/2+1.6+r*2.1]);
    bugSpots.forEach(([bx,bz],i)=>{const b=bugs[i];const tg=grp(ex,[bx,0,bz]);P(tg,G.cy(.5,.55,.6),M.c('#C98C5A'),[0,.3,0]);const gl=P(tg,G.bx(.9,.9,.9,.1),M.glass(),[0,1.05,0]);gl.userData.noOutline=true;P(tg,G.s(.25),M.c('#7CC46A'),[0,.7,0],null,[1.4,.6,1.2]);C.push({x0:bx-.55,x1:bx+.55,z0:bz-.55,z1:bz+.55});
      if(b){const bg=new THREE.Group();QF=.6;try{b.b(bg,M,{},srand(i))}catch(e){}QF=1;addOutlines(bg);bg.scale.setScalar(.35);bg.position.set(0,.95,0);tg.add(bg);anim.push({g:bg,bob:true,ph:i});A.push({x:bx-.9,z:bz,r:1.1,label:b.n+' ansehen',act:()=>plaque(b.n,[['bug',b]])})}
      else{P(tg,G.s(.06),M.c('#B39C88'),[0,.8,0])}});
    /* ----- Fundstücke: Sockel in der Mitte ----- */
    const relics=SAVE.donated.relics.map(id=>findIn(RELICS,id)).filter(Boolean);
    for(let i=0;i<8;i++){const x=-3.6+(i%4)*2.4,z=1.2+Math.floor(i/4)*2.2;const pg=grp(ex,[x,0,z]);P(pg,G.cy(.42,.5,.9),M.c('#F6F1EA'),[0,.45,0]);P(pg,G.cy(.5,.5,.1),M.c('#D9CDBA'),[0,.92,0]);C.push({x0:x-.5,x1:x+.5,z0:z-.5,z1:z+.5});
      const r=relics[i];if(r){const rg=new THREE.Group();QF=.6;try{r.b(rg,M,{},srand(i))}catch(e){}QF=1;addOutlines(rg);rg.scale.setScalar(.42);rg.position.y=1.0;pg.add(rg);anim.push({g:rg,spin:true,ph:i});A.push({x,z:z+.9,r:1,label:r.n+' ansehen',act:()=>plaque(r.n,[['relic',r]])})}}
    /* ----- Kunst: Rückwand ----- */
    sign('Kunstgalerie',0,-D/2+.12,'#FF8FB1');
    const art=[...GALLERY.map(a=>Object.assign({mine:true},a)),...FOREIGN_ART,...(window.SOCIAL?SOCIAL.onlineArt():[])];const seen=new Set();const uniq=art.filter(a=>{if(seen.has(a.id))return false;seen.add(a.id);return true}).slice(0,14);
    uniq.forEach((a,i)=>{const row=i<7?0:1;const col=i%7;const x=-4.8+col*1.6,y=row?1.6:3.0,z=-D/2+.06;const f=INTERIOR.framedPicture(a,1.1);f.position.set(x,y,z);ex.add(f);
      A.push({x,z:-D/2+1,r:.9,label:`«${a.name}» ansehen`,act:()=>artPlaque(a)})});
    if(!uniq.length){const t=ctex('leer-kunst',512,128,(c,w,h)=>{c.fillStyle='#8A7160';c.font='bold 30px Nunito, sans-serif';c.textAlign='center';c.fillText('Noch keine Kunst. Malt im Farbstudio!',w/2,72)});const m=P(ex,G.pl(4,1),new THREE.MeshBasicMaterial({map:t,transparent:true}),[0,2.3,-D/2+.08]);m.userData.noOutline=true}
    /* ----- Kuratorin ----- */
    const cur=buildCreature(sanitize(CURATOR.d),{q:.8,noShadow:!HIGH});cur.scale.setScalar(CS);cur.position.set(-2.2,0,D/2-3.2);cur.rotation.y=PI*.15;ex.add(cur);P(ex,G.bx(2,1,.8,.2),M.c('#B79A6E'),[-2.2,.5,D/2-2.3]);C.push({x0:-3.3,x1:-1.1,z0:D/2-3.8,z1:D/2-1.9});anim.push({g:cur,creature:true});
    A.push({x:-2.2,z:D/2-1.5,r:1.4,label:'Mit der Kuratorin sprechen',act:curatorTalk});
    ex.traverse(o=>{if(o.isMesh&&!o.userData.hull){o.castShadow=HIGH;o.receiveShadow=true}});
    return{W,D,camD:15,camH:11}},
  frame(dt,t){const sc=INTERIOR.scene;const anim=sc&&sc.userData.anim;if(!anim)return;for(const a of anim){if(a.creature){a.g.userData.tick(t,false,0);continue}if(a.spin){a.g.rotation.y=t*.6+a.ph;continue}if(a.bob){a.g.position.y=.95+Math.sin(t*2+a.ph)*.05;continue}
    const u=t*a.sp+a.ph;a.g.position.set(Math.cos(u)*a.r,a.cy+Math.sin(u*1.7)*.08,Math.sin(u)*a.r*.6);a.g.rotation.y=-u+PI}}};
function museumTex(k,rep){const t=ctex('mus-'+k,256,256,(x,w,h)=>{if(k==='floor'){x.fillStyle='#E8D2AE';x.fillRect(0,0,w,h);for(let j=0;j<8;j++)for(let i=0;i<4;i++){x.fillStyle=(i+j)%2?'#DDC39A':'#EBD8B7';x.fillRect(i*64+(j%2)*32,j*32,64,32);x.strokeStyle='#C9AE84';x.lineWidth=2;x.strokeRect(i*64+(j%2)*32,j*32,64,32)}}
  else{x.fillStyle='#F4EEE2';x.fillRect(0,0,w,h);x.fillStyle='#EDE4D2';for(let i=0;i<4;i++)x.fillRect(i*64+28,0,8,h);x.fillStyle='#E0D2B8';x.fillRect(0,h-26,w,26)}});const c=t.clone();c.needsUpdate=true;c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(rep[0],rep[1]);return c}
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
