/* =====================================================================
   CYBORG-LABOR · stations.js
   Sieben Kokon-Wartungsstationen im All, eine je Planeten-Gruppe.
   Andocken (E) führt in eine begehbare Wartungshalle im Toonami-Stil:
   dunkles Chrom, Neonstreifen, Sternenfenster. In jeder Halle:
   · Gastgeber:in der Station mit eigener Geschichte
   · Stations-Laden mit Möbeln, die es nur hier gibt
   · Wartung: drei Störungs-Paneele reparieren (Belohnung + Logbuch)
   · Logbuch: ein Tagebuch-Eintrag früherer Schläfer:innen (Kokon 95/97)
   · Renn-Terminal: führt hinaus zum Rennen um die Station
   Wer alle sieben Logbuch-Einträge gelesen hat, kennt die Koordinaten
   des Glitch-Kerns (siehe glitchkern.js).
   ===================================================================== */
const STATIONS=(()=>{
  const V=THREE.Vector3;
  /* Gruppe, Gastgeber:in, Aussehen, Begrüssung, Logbuch-Eintrag, Laden */
  const DATA={
    nova:{grp:'Heimat',planets:['kompost','schrott','pilz'],host:'Wartungsleiterin Sola',look:[{skin:'plastik',color:1,shape:'kapselspiel'},{kopf:'kapselkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:['pager']}],
      hello:['Willkommen auf Station Nova! Wir warten die Heimat-Gruppe: Kompost, Schrott-Mond, Sporen-Mond.','Drei Paneele melden Störungen. Wenn du sie neu steckst, lese ich dir unser Logbuch vor.'],
      log:['Logbuch · Kokon 95 · Tag 1','Ich bin auf einem Kompost-Planeten aufgewacht. Alle sind nett zu mir. Die Uhr zeigt 23:59.','Morgen zeigt sie wieder 23:59. Ich schreibe das auf, damit ich es nicht vergesse.'],
      shop:['st_sternfenster','st_neonleiste','st_nova_kapsel']},
    aurora:{grp:'Urzeit',planets:['urzeit','dinofabrik','bauklotz','pluesch','bernstein'],host:'Dr. Ammo Nit',look:[{skin:'bonbon',color:3,shape:'ei'},{kopf:'eikopf',augen:'monokel',arme:'mensch',beine:'mensch',extras:['laterne']}],
      hello:['Station Aurora! Von hier aus sieht man das Urzeit-Tal, die Dino-Fabrik und den Bernstein-Mond.','Die Paneele hier stammen noch aus der Zeit von Kokon 95. Sie flackern gern.'],
      log:['Logbuch · Kokon 95 · Tag 40','Die Dinos sind aus Plastik, aber sie atmen. Ich habe es genau gesehen.','Jemand hat «1999» unter ihre Füsse geschrieben. Wer baut eine Welt und unterschreibt sie?'],
      shop:['st_sternfenster','st_neonleiste','st_aurora_ei']},
    komet:{grp:'Metro',planets:['metro','kaufhaus','magnetbahn','nachtmarkt'],host:'Schaffnerin Komet',look:[{skin:'plastik',color:3,shape:'kapselspiel'},{kopf:'crtkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:['pager']}],
      hello:['Station Komet, nächster Halt: Metro-Stadt, Kaufhaus 1999, Magnetbahn-Ring, Nachtmarkt.','Bitte nicht hinauslehnen. Und bitte die drei Störungen beheben, ich komme heute nicht dazu.'],
      log:['Logbuch · Kokon 95 · Tag 112','Die Rolltreppen fahren, auch wenn niemand drauf steht. Ich habe ein Muster gefunden:','Alle Uhren stehen kurz vor Mitternacht. Nicht kaputt. Angehalten. Als würde die Welt den Atem anhalten.'],
      shop:['st_sternfenster','st_neonleiste','st_komet_fahrplan']},
    farn:{grp:'Dschungel',planets:['dschungel','tiefsee','korallen','riesengarten','honigwabe'],host:'Rankenpflegerin Liana',look:[{skin:'pluesch',color:7,shape:'birne'},{kopf:'vogel',augen:'kuller',arme:'fluegel',beine:'huhn',extras:['blume']}],
      hello:['Station Farn. Hier oben wachsen sogar Ranken – sie mögen die warme Luft aus den Lüftern.','Drei Paneele sind zugewuchert. Sei sanft mit den Pflanzen, ja?'],
      log:['Logbuch · Kokon 97 · Tag 3','Die Ranken wachsen über die Server, nicht gegen sie. Vielleicht schützen sie etwas.','Ich habe ein Blatt gezeichnet. Die Adern sehen aus wie Leiterbahnen. Oder umgekehrt.'],
      shop:['st_sternfenster','st_neonleiste','st_farn_terrarium']},
    zephyr:{grp:'Himmel',planets:['wolkenarchipel','wetterwerk','frost','wueste','origami'],host:'Windwart Bodo',look:[{skin:'fell',color:2,shape:'birne'},{kopf:'eule',augen:'kuller',arme:'fluegel',beine:'huhn',extras:[]}],
      hello:['Station Zephyr! Wir schauen auf Wolken, Wetter, Frost, Wüste und Papier.','Bei Sonnenwind flackern unsere Paneele. Drei sind gerade aus.'],
      log:['Logbuch · Kokon 97 · Tag 30','Von hier oben sieht man einen roten Punkt hinter der Sonne. Er flackert, wenn ich hinschaue.','Die anderen sehen ihn nicht. Oder sie sagen es nicht.'],
      shop:['st_sternfenster','st_neonleiste','st_zephyr_windrad']},
    pendel:{grp:'Uhrwerk',planets:['klang','bibliothek','uhrwerk'],host:'Uhrmacherin Unruh',look:[{skin:'plastik',color:5,shape:'kapselspiel'},{kopf:'kapselkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:[]}],
      hello:['Station Pendel. Tick, tack. Wir ölen die Uhren von Klang-Planet, Bibliothek und Uhrwerk-Mond.','Drei Zahnräder in den Paneelen sind verrutscht. Steck sie wieder ein, dann tickt alles.'],
      log:['Logbuch · Kokon 97 · Tag 61','Ich habe die stehenden Uhren gezählt und auf einer Karte verbunden. Es sind sieben Gruppen.','Sieben Gruppen, sieben Räume. Jeder Raum eine Erinnerung. Irgendwo ist der Kern.'],
      shop:['st_sternfenster','st_neonleiste','st_pendel_uhr']},
    pixel:{grp:'Bildschirm',planets:['schoner','neonarkade','funkturm','rechenzentrum'],host:'Pixelinde',look:[{skin:'glas',color:1,shape:'kapselspiel'},{kopf:'crtkopf',augen:'lcdaugen',arme:'mensch',beine:'mensch',extras:['kopfhoerer']}],
      hello:['Station Pixel. Hier laufen die Signale von Schoner-Planet, Neon-Arkade, Funkturm und Rechenzentrum zusammen.','Drei Paneele zeigen nur Rauschen. Steck die Kabel neu, dann sehen wir wieder klar.'],
      log:['Logbuch · Kokon 97 · letzter Eintrag','Der grosse Bildschirm zeigt Koordinaten hinter der Sonne. Wenn du das liest: Flieg zum Glitch-Kern.','Wir warten dort. Nicht aus Angst – aus Neugier. Bring alle sieben Erinnerungen mit.'],
      shop:['st_sternfenster','st_neonleiste','st_pixel_monitor']}};
  const S=()=>SAVE.stations=SAVE.stations||{};
  const st=id=>S()[id]=S()[id]||{fixed:[],log:false};
  const logsRead=()=>Object.keys(DATA).filter(id=>S()[id]&&S()[id].log).length;
  let cur=null,M=null,anim=[];

  /* ---------- Möbel aus den Stationen ---------- */
  const gl=(m,c)=>m.c(c,{gloss:1.3,rim:1,rimColor:'#ffffff'});
  furn('st_sternfenster',{n:'Sternenfenster',cat:'deko',price:2400,planet:'station',size:[2,1],h:2,b:(g,m)=>{P(g,G.cy(.95,.95,.18,32),m.c('#2a2e48',{gloss:.9}),[0,1.1,0],[PI/2,0,0]);
    const t=ctex('st-sterne',128,128,(x,w,h)=>{const gr=x.createRadialGradient(w*.5,h*.5,4,w*.5,h*.5,w*.7);gr.addColorStop(0,'#3a2a7a');gr.addColorStop(1,'#0a0a2a');x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle='#ffffff';for(let i=0;i<60;i++)x.fillRect((i*53)%w,(i*29)%h,i%7?1:2,i%7?1:2)});
    P(g,new THREE.CircleGeometry(.8,32),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),[0,1.1,.1]);P(g,G.to(.86,.06),m.steel(),[0,1.1,.1]);P(g,G.bx(1.2,.12,.3,.05),m.steel(),[0,.08,0])}});
  furn('st_neonleiste',{n:'Neon-Leiste',cat:'licht',price:900,planet:'station',size:[1,1],h:.3,b:(g,m)=>{P(g,G.bx(.9,.08,.12,.04),m.c('#2a2e48'),[0,.04,0]);P(g,G.bx(.8,.05,.05,.02),m.glow('#ff6fd8',1.8),[0,.1,0]);g.userData.light={p:[0,.2,0],c:'#ff6fd8',i:.5}}});
  furn('st_nova_kapsel',{n:'Kälteschlaf-Kapsel (Modell)',cat:'deko',price:3800,planet:'station',size:[1,2],h:1.4,b:(g,m)=>{P(g,G.ca(.42,1.1),m.c('#e8ecf8',{gloss:1.2}),[0,.55,0],[PI/2,0,0]);P(g,G.ca(.36,.9),m.glass('#a8e8ff'),[0,.62,0],[PI/2,0,0]);P(g,G.bx(.5,.06,.06,.02),m.glow('#7fd34a',1.6),[0,.2,.75])}});
  furn('st_aurora_ei',{n:'Dino-Ei im Glas',cat:'deko',price:2600,planet:'station',size:[1,1],h:.9,b:(g,m)=>{P(g,G.cy(.3,.34,.1,20),m.steel(),[0,.05,0]);P(g,G.s(.2),m.c('#f2e2c0'),[0,.32,0],null,[1,1.3,1]);P(g,G.cy(.28,.28,.6,20,1,true),m.glass('#ffe0b0'),[0,.4,0]);P(g,G.s(.04),m.c('#8a6a3a'),[.08,.38,.15])}});
  furn('st_komet_fahrplan',{n:'Fahrplan-Tafel',cat:'deko',price:1900,planet:'station',size:[1,1],h:1.6,b:(g,m)=>{const t=ctex('st-fahrplan',128,96,(x,w,h)=>{x.fillStyle='#10122a';x.fillRect(0,0,w,h);x.fillStyle='#ffd23f';x.font='bold 13px monospace';['METRO   23:59','KAUFHAUS 23:59','RING    23:59','MARKT   23:59'].forEach((s,i)=>x.fillText(s,8,22+i*20))});
    bt(g,[0,0,0],[0,1.1,0],.04,m.steel());P(g,G.bx(.9,.66,.06,.02),m.c('#2a2e48'),[0,1.25,0]);P(g,new THREE.PlaneGeometry(.82,.6),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),[0,1.25,.035])}});
  furn('st_farn_terrarium',{n:'Stations-Terrarium',cat:'pflanze',price:2100,planet:'station',size:[1,1],h:1,b:(g,m)=>{P(g,G.bx(.7,.08,.5,.03),m.steel(),[0,.04,0]);P(g,G.bx(.66,.5,.46,.02),m.glass('#c8ffd8'),[0,.33,0]);for(let i=0;i<4;i++)P(g,G.co(.08,.35,6),m.c('#5aae4a'),[-.2+i*.13,.25,(i%2-.5)*.15],[0,0,(i-1.5)*.2])}});
  furn('st_zephyr_windrad',{n:'Sonnenwind-Rad',cat:'deko',price:1700,planet:'station',size:[1,1],h:1.5,b:(g,m)=>{bt(g,[0,0,0],[0,1.1,0],.04,m.steel());const r=grp(g,[0,1.15,.06]);for(let i=0;i<4;i++){const a=i*PI/2;P(r,G.bx(.09,.42,.02,.02),gl(m,i%2?'#ffffff':'#c8b8ff'),[Math.sin(a)*.22,Math.cos(a)*.22,0],[0,0,-a])}P(r,G.s(.05),m.steel());g.userData.tick=t=>{r.rotation.z=t*1.5}}});
  furn('st_pendel_uhr',{n:'Stations-Pendeluhr',cat:'deko',price:3200,planet:'station',size:[1,1],h:1.9,b:(g,m)=>{P(g,G.bx(.5,1.8,.3,.05),m.c('#8a5a34'),[0,.9,0]);P(g,G.cy(.2,.2,.04,24),m.c('#fffdf7'),[0,1.5,.16],[PI/2,0,0]);const pd=grp(g,[0,1.2,.17]);bt(pd,[0,0,0],[0,-.55,0],.012,m.gold());P(pd,G.cy(.08,.08,.02,16),m.gold(),[0,-.6,0],[PI/2,0,0]);g.userData.tick=t=>{pd.rotation.z=Math.sin(t*2.6)*.25}}});
  furn('st_pixel_monitor',{n:'Signal-Monitor',cat:'technik',price:2300,planet:'station',size:[1,1],h:1,b:(g,m)=>{P(g,G.bx(.7,.55,.5,.06),m.c('#2a2e48'),[0,.45,0]);const cv=document.createElement('canvas');cv.width=96;cv.height=72;const x=cv.getContext('2d');const tx=new THREE.CanvasTexture(cv);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(.56,.42),new THREE.MeshBasicMaterial({map:tx,toneMapped:false}));s.position.set(0,.46,.255);s.userData.noOutline=true;g.add(s);
    g.userData.tick=t=>{x.fillStyle='#0a0a2a';x.fillRect(0,0,96,72);x.strokeStyle='#45e0ff';x.lineWidth=2;x.beginPath();for(let i=0;i<96;i++){const y=36+Math.sin(i*.2+t*4)*14*Math.sin(t*.7);i?x.lineTo(i,y):x.moveTo(i,y)}x.stroke();tx.needsUpdate=true}}});

  /* ---------- Texturen ---------- */
  function starTex(){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');const gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#1a1450');gr.addColorStop(1,'#5a3a9a');x.fillStyle=gr;x.fillRect(0,0,512,128);
    for(let i=0;i<380;i++){const a=Math.random();x.fillStyle=a<.1?'#ffd8f0':a<.2?'#bfe8ff':'#ffffff';x.globalAlpha=.4+Math.random()*.6;const s=Math.random()<.08?2:1;x.fillRect(Math.random()*512,Math.random()*128,s,s)}x.globalAlpha=1;
    const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t}
  function gridTex(col){return ctex('st-grid-'+col,256,256,(x,w,h)=>{x.fillStyle='#14162e';x.fillRect(0,0,w,h);x.strokeStyle='#2a2e58';x.lineWidth=3;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*w/4,0);x.lineTo(i*w/4,h);x.stroke();x.beginPath();x.moveTo(0,i*h/4);x.lineTo(w,i*h/4);x.stroke()}
    x.fillStyle=col;x.globalAlpha=.35;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++)x.fillRect(i*w/4-3,j*h/4-3,6,6);x.globalAlpha=1})}
  function panelTex(ok,col){return ctex('st-panel-'+(ok?'ok':'err')+col,128,96,(x,w,h)=>{x.fillStyle='#0a0c20';x.fillRect(0,0,w,h);x.strokeStyle=ok?'#7fd34a':'#ff4a5a';x.lineWidth=4;x.strokeRect(4,4,w-8,h-8);x.fillStyle=ok?'#7fd34a':'#ff4a5a';x.font='bold 22px monospace';x.textAlign='center';x.fillText(ok?'OK':'FEHLER',w/2,h/2+2);x.font='bold 11px monospace';x.fillStyle=col;x.fillText('KOKON-WARTUNG',w/2,h-14)})}

  /* ---------- Wartungshalle ---------- */
  function build(sc){const id=cur.st.id,d=DATA[id],col=cur.st.col;M=makeMats({skin:'haut',color:0});anim=[];const W=14,D=10,H=4.2;const A=INTERIOR.actions,C=INTERIOR.colliders;
    const dark=M.c('#2a2e48',{gloss:.9}),chrome=M.steel(),neon=M.glow(col,1.9),pink=M.glow('#ff6fd8',1.6);
    /* Boden mit Leuchtraster, Decke, Wände */const fl=new THREE.Mesh(new THREE.BoxGeometry(W,.2,D),cozy({map:(()=>{const t=gridTex(col).clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(W/2,D/2);return t})(),color:'#ffffff',rim:.05}));fl.position.y=-.1;fl.receiveShadow=true;sc.add(fl);
    P(sc,G.bx(W+.4,H,.3,.05),dark,[0,H/2,-D/2-.15]);both(s=>P(sc,G.bx(.3,H,D,.05),dark,[s*(W/2+.15),H/2,0]));
    /* Sternenband: langes Fenster an der Rückwand, die Sterne ziehen vorbei */const stt=starTex();const win=new THREE.Mesh(new THREE.PlaneGeometry(W-2,1.5),new THREE.MeshBasicMaterial({map:stt,toneMapped:false}));win.position.set(0,2.3,-D/2+.02);win.userData.noOutline=true;sc.add(win);anim.push((dt,t)=>{stt.offset.x+=dt*.02});
    P(sc,G.bx(W-1.8,.14,.2,.05),chrome,[0,3.1,-D/2+.08]);P(sc,G.bx(W-1.8,.14,.2,.05),chrome,[0,1.5,-D/2+.08]);for(let i=-3;i<=3;i++)P(sc,G.bx(.12,1.6,.22,.04),chrome,[i*(W-2)/6,2.3,-D/2+.08]);
    /* Rippenbögen quer durch die Halle mit Neonstreifen (Toonami-Gang) */for(let k=0;k<3;k++){const z=-D/2+1.2+k*2.6;both(s=>{P(sc,G.bx(.4,H,.4,.08),chrome,[s*(W/2-.2),H/2,z]);P(sc,G.bx(.08,H-.6,.08,.02),k%2?pink:neon,[s*(W/2-.42),H/2,z])});}
    /* Leuchtstreifen im Boden, die zur Schleuse laufen */for(let i=0;i<8;i++){const m=M.glow(col,1.2);const q=P(sc,G.bx(.5,.02,.18,.01),m,[0,.012,D/2-.6-i*.9]);anim.push((dt,t)=>{q.material.emissiveIntensity=.4+Math.max(0,Math.sin(t*4-i*.7))*1.4})}
    /* Schleuse vorne */P(sc,G.bx(2.2,.04,1,.02),M.c('#ffd23f'),[0,.02,D/2-.5]);for(let i=0;i<5;i++)P(sc,G.bx(.2,.045,1,.01),M.c('#2a2e48'),[-.9+i*.45,.025,D/2-.5],[0,.6,0]);
    /* Gastgeber:in hinten in der Mitte */const host=BUILDINGS.npc?BUILDINGS.npc(sc,{name:d.host,body:Object.assign({seg:2,size:1.05,pattern:'bauch',color2:16},d.look[0]),parts:d.look[1]},0,-D/2+1.1,0):null;sc.userData.host=host;
    P(sc,G.bx(3,.5,.8,.1),dark,[0,.25,-D/2+2.1]);P(sc,G.bx(3.1,.06,.9,.03),neon,[0,.52,-D/2+2.1]);C.push({x0:-1.6,x1:1.6,z0:-D/2+1.6,z1:-D/2+2.6});
    A.push({x:0,z:-D/2+3,r:1.5,label:'Mit '+d.host+' reden',act:talk});
    /* Laden rechts */const shop=grp(sc,[W/2-1.6,0,-.6]);P(shop,G.bx(1.6,1,2.4,.1),dark,[0,.5,0]);P(shop,G.bx(1.7,.06,2.5,.03),M.glow('#ff6fd8',.8),[0,1.02,0]);for(let i=0;i<3;i++){const it=d.shop[i];const ff=typeof findFurn==='function'&&findFurn(it);if(ff&&INTERIOR.furnModel){const o=INTERIOR.furnModel(it);o.scale.setScalar(.5);o.position.set(0,1.05,-.8+i*.8);shop.add(o)}}
    C.push({x0:W/2-2.4,x1:W/2-.8,z0:-1.8,z1:.6});A.push({x:W/2-2.8,z:-.6,r:1.5,label:'Stations-Laden',act:shopWin});
    /* Renn-Terminal links */const term=grp(sc,[-W/2+1.4,0,-.6]);P(term,G.bx(1,1.3,.8,.1),dark,[0,.65,0]);const tt=ctex('st-race-'+id,128,96,(x,w,h)=>{x.fillStyle='#0a0c20';x.fillRect(0,0,w,h);x.strokeStyle=col;x.lineWidth=3;x.beginPath();x.ellipse(w/2,h/2,40,26,0,0,TAU);x.stroke();x.fillStyle='#ffd23f';x.font='bold 14px monospace';x.textAlign='center';x.fillText('RENNEN',w/2,h/2+5)});
    P(term,new THREE.PlaneGeometry(.9,.68),new THREE.MeshBasicMaterial({map:tt,toneMapped:false}),[0,1.25,.41]).rotation.x=-.3;C.push({x0:-W/2+.8,x1:-W/2+2,z0:-1.1,z1:-.1});A.push({x:-W/2+1.4,z:.5,r:1.3,label:'Renn-Terminal',act:race});
    /* Logbuch-Konsole links hinten */const lg=grp(sc,[-W/2+1.4,0,-D/2+2]);P(lg,G.cy(.4,.5,1,16),dark,[0,.5,0]);const holo=P(lg,G.cy(.35,.05,.6,16,1,true),M.glow(col,1),[0,1.35,0]);holo.material.transparent=true;holo.material.opacity=.5;const page=P(lg,G.bx(.4,.5,.02,.01),M.glow('#ffffff',1.2),[0,1.4,0]);anim.push((dt,t)=>{page.rotation.y=t;page.position.y=1.4+Math.sin(t*2)*.05});
    C.push({x0:-W/2+.9,x1:-W/2+1.9,z0:-D/2+1.5,z1:-D/2+2.5});A.push({x:-W/2+1.4,z:-D/2+3,r:1.3,label:'Logbuch lesen',act:logbook});
    /* drei Störungs-Paneele an den Wänden */const s=st(id);const spots=[[-W/2+.2,1.6,PI/2],[W/2-.2,2.9,-PI/2],[-W/2+.2,3.4,PI/2]];spots.forEach(([x,z,ry],i)=>{const g=grp(sc,[x,0,z],[0,ry,0]);P(g,G.bx(1,1.4,.14,.04),chrome,[0,1.3,0]);const ok=s.fixed.includes(i);
      const scr=P(g,new THREE.PlaneGeometry(.8,.6),new THREE.MeshBasicMaterial({map:panelTex(ok,col),toneMapped:false}),[0,1.45,.08]);scr.userData.noOutline=true;const lamp=P(g,G.s(.07),M.glow(ok?'#7fd34a':'#ff4a5a',2),[0,.95,.1]);
      if(!ok)anim.push((dt,t)=>{if(!s.fixed.includes(i))lamp.visible=Math.sin(t*8+i)>0});A.push({x:x+(x<0?.9:-.9),z,r:1.2,label:ok?`Paneel ${i+1} (läuft)`:`Paneel ${i+1} reparieren`,act:()=>fix(i,scr,lamp)})});
    /* Licht: kühles Grundlicht, farbige Neonlichter */const amb=new THREE.HemisphereLight('#d8e0ff','#3a2a5a',1.1);sc.add(amb);for(const[x,z,c,i]of[[-4,-2,col,1.4],[4,-2,'#ff6fd8',1.2],[0,2,col,1.2],[0,-3.2,'#ffffff',2.2]]){const L=new THREE.PointLight(c,i,11,2);L.position.set(x,3.2,z);sc.add(L)}
    addOutlines(sc);return{W,D,camD:13,camH:9}}
  function frame(dt,t){for(const f of anim)f(dt,t);const h=INTERIOR.scene&&INTERIOR.scene.userData.host;if(h&&h.userData.tick)h.userData.tick(t,false,0)}
  const voice=()=>({pitch:260,speed:1,kind:'hall'});
  async function talk(){const d=DATA[cur.st.id];const s=st(cur.st.id);const done=s.fixed.length>=3;
    const ch=await UI.talk(d.host,done?[pick(['Danke nochmal für die Reparatur! Alles läuft.','Die Paneele leuchten grün. So mag ich das.','Schön, dass du wieder andockst.'])]:d.hello,{voice:voice(),color:cur.st.col,choices:['Was ist das hier?','Stations-Laden','Logbuch','Tschüss']});
    if(ch===0)await UI.talk(d.host,[`Eine Kokon-Wartungsstation. Von hier aus werden die Planeten der Gruppe «${d.grp}» gewartet.`,'Es gibt sieben Stationen im ganzen System. In jeder liegt ein Logbuch-Eintrag von früheren Schläfer:innen.',logsRead()>=7?'Du hast alle sieben gelesen. Die Koordinaten des Glitch-Kerns sind jetzt auf deiner Karte.':`Du hast ${logsRead()} von 7 gelesen.`],{voice:voice()});
    else if(ch===1)shopWin();else if(ch===2)logbook()}
  function shopWin(){const d=DATA[cur.st.id];const w=UI.win(`${cur.st.n} · Laden`,{size:'wide'});w.body.append(el('p',null,'Möbel, die es nur in den Wartungsstationen gibt. Zu Hause mit F aufstellen.'));const gr=el('div','grid');
    for(const id of d.shop){const f=findFurn(id);if(!f)continue;const c=el('button','card');c.type='button';c.append(itemThumb('furn',id),el('span',null,f.n),el('span','sub',fmt(f.price)+' Taler'));
      c.onclick=()=>{if(SAVE.money<f.price){SND.play('error');UI.toast('Zu wenig Taler.');return}if(!bagAdd('furn',id)){UI.toast('Tasche voll.');return}money(-f.price);SND.play('j_buy');UI.toast(f.n+' gekauft! Zu Hause mit F aufstellen.')};gr.append(c)}w.body.append(gr)}
  async function fix(i,scr,lamp){const id=cur.st.id,s=st(id);if(s.fixed.includes(i)){UI.toast('Dieses Paneel läuft schon.');return}
    s.fixed.push(i);persist();scr.material.map=panelTex(true,cur.st.col);scr.material.needsUpdate=true;lamp.visible=true;lamp.material=M.glow('#7fd34a',2);SND.play('click');setTimeout(()=>SND.play('powerup',{vol:.6}),250);
    if(s.fixed.length<3){UI.toast('Paneel repariert! Noch '+(3-s.fixed.length)+'.');return}
    money(250);SND.jingle('j_success');const d=DATA[id];await UI.talk(d.host,['Alle drei Paneele leuchten grün! Danke dir.','Hier sind 250 Taler. Und das Logbuch ist jetzt freigeschaltet – lies es an der Konsole links hinten.'],{voice:voice(),color:cur.st.col})}
  async function logbook(){const id=cur.st.id,s=st(id),d=DATA[id];if(s.fixed.length<3){UI.toast('Das Logbuch startet erst, wenn alle drei Paneele repariert sind.');SND.play('error');return}
    const first=!s.log;s.log=true;persist();SND.play('pep');await UI.talk(d.log[0],d.log.slice(1),{voice:{pitch:200,speed:.9,kind:'sanft'},color:'#3a2a7a'});
    if(first){const n=logsRead();UI.toast(`Logbuch-Eintrag ${n} von 7 gelesen.`,2600);if(n>=7){SAVE.glitchKnown=true;persist();setTimeout(()=>UI.talk('Logbuch',['Alle sieben Einträge zusammen ergeben Koordinaten: hinter der Sonne, ganz am Rand der Karte.','Der Glitch-Kern ist jetzt auf deiner Weltraumkarte zu sehen.'],{voice:{pitch:180,kind:'sanft'},color:'#c8102e'}),600)}}}
  function race(){const s=cur;INTERIOR.exit();setTimeout(()=>RACE.openLobby(s),900)}
  /* ---------- Andocken ---------- */
  function dock(s){cur=s;SND.play('metal',{vol:.5});SPACE.pause();INTERIOR.enter('station')}
  INTERIOR.kinds.station={bg:'#14162e',music:'museum',build,frame,toSpace:()=>SPACE.resume()};
  return{dock,DATA,logsRead,state:st,get current(){return cur}}
})();
