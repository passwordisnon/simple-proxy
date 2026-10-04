/* =====================================================================
   CYBORG-LABOR · tunnel.js · Wartungstunnel und alter Serversaal
   Die Wartungsluke neben jedem Dorf führt hinunter in den Serversaal von
   Kokon. Den Schlüssel (Zugangscode) gibt es im Logbuch der Wartungs-
   station der Planeten-Gruppe. Unten: leere Schlafkapseln von Kokon 95
   und 97, summende Server-Schränke und ein Terminal mit der Datei
   SCHLAEFER.TXT – ganz unten steht ein neuer Name.
   ===================================================================== */
const TUNNEL=(()=>{
  let M=null,anim=[],pid=null;
  /* Gruppe (Station) eines Planeten; Monde gehören zur Gruppe ihres Hauptplaneten */
  function stationOf(id){const d=PLANETS[id];const p=d&&d.moonOf?d.moonOf:id;if(typeof STATIONS==='undefined')return null;for(const[k,v]of Object.entries(STATIONS.DATA))if(v.planets.includes(p)||v.planets.includes(id))return k;return null}
  function unlocked(id){const s=stationOf(id);return!!(s&&SAVE.stations&&SAVE.stations[s]&&SAVE.stations[s].log)}
  async function hatch(id){const s=stationOf(id);if(!unlocked(id)){SND.play('metal',{vol:.6});const n=s?(typeof RACE!=='undefined'&&RACE.STATIONS.find(x=>x.id===s)||{}).n:null;
      await UI.talk('Wartungsluke',['Verschlossen. Auf dem Deckel steht: KOKON WARTUNG · 31.12.1999 23:59',n?`Daneben ein Tastenfeld. Den Zugangscode findest du im Logbuch von ${n}.`:'Daneben ein Tastenfeld ohne Beschriftung.'],{voice:{pitch:160,kind:'hall'},color:'#3a3a48'});return}
    SND.play('metal');setTimeout(()=>SND.play('door_open'),300);pid=id;INTERIOR.enter('tunnel')}
  function podTex(label,hl){return ctex('tn-pod-'+label,128,32,(x,w,h)=>{x.fillStyle='#22222a';x.fillRect(0,0,w,h);x.fillStyle=hl?'#7fd34a':'#ffd23f';x.font='bold 15px monospace';x.textAlign='center';x.fillText(label.slice(0,14),w/2,22)})}
  function build(sc){M=makeMats({skin:'haut',color:0});anim=[];const W=16,D=9,H=4;const A=INTERIOR.actions,C=INTERIOR.colliders;
    const wall=M.c('#4a5064',{gloss:.3}),dark=M.c('#2a2e3a',{gloss:.5}),chrome=M.steel(),warn=M.c('#ffd23f');
    const ft=ctex('tn-floor',128,128,(x,w,h)=>{x.fillStyle='#3a3e4a';x.fillRect(0,0,w,h);x.fillStyle='#454a58';for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)x.fillRect(i*32,j*32,32,32);x.strokeStyle='#2a2e3a';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2)});
    const fl=new THREE.Mesh(new THREE.BoxGeometry(W,.2,D),cozy({map:(()=>{const t=ft.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(W/2,D/2);return t})(),color:'#ffffff',rim:.05}));fl.position.y=-.1;sc.add(fl);
    P(sc,G.bx(W+.4,H,.3,.05),wall,[0,H/2,-D/2-.15]);both(s=>P(sc,G.bx(.3,H,D,.05),wall,[s*(W/2+.15),H/2,0]));
    /* Rohre und Kabelbündel an der Decke */for(let i=0;i<3;i++)P(sc,G.cy(.12,.12,W,10),i===1?M.c('#c8102e'):chrome,[0,H-.4-i*.28,-D/2+.3+i*.25],[0,0,PI/2]);for(let i=0;i<6;i++)P(sc,G.to(.2,.05),chrome,[-W/2+1.5+i*2.6,H-.4,-D/2+.3],[0,PI/2,0]);
    /* Warnstreifen am Boden */for(let i=0;i<14;i++)P(sc,G.bx(.5,.02,.25,.01),i%2?warn:dark,[-W/2+.8+i*1.05,.012,D/2-.9]);
    /* Schlafkapseln entlang der Rückwand: 95, 97, 97, 99 (deine) */const nick=(SAVE.nick||'Du').slice(0,12);const pods=[['KOKON 95'],['KOKON 95'],['KOKON 97'],['KOKON 97'],['KOKON 99',1]];
    pods.forEach(([lb,me],i)=>{const x=-W/2+2+i*2.6;const g=grp(sc,[x,0,-D/2+1.1]);P(g,G.bx(1.3,.4,2.2,.1),dark,[0,.2,0]);P(g,G.ca(.55,1.1),M.c('#e8ecf8',{gloss:1}),[0,.75,0],[PI/2,0,0],[1,1,.55]);
      const lid=P(g,G.ca(.5,1),M.glass(me?'#c8ffd8':'#a8c8e0'),[0,1.15,-.3],[PI/2-.9,0,0],[1,1,.5]);const lt=P(g,new THREE.PlaneGeometry(1.1,.28),new THREE.MeshBasicMaterial({map:podTex(lb,me),toneMapped:false}),[0,.3,1.11]);lt.userData.noOutline=true;
      const led=P(g,G.s(.06),M.glow(me?'#7fd34a':'#5a5a68',1.8),[.5,.42,1.1]);if(me)anim.push((dt,t)=>{led.visible=Math.sin(t*3)>-.2});C.push({x0:x-.7,x1:x+.7,z0:-D/2,z1:-D/2+2.2});
      A.push({x,z:-D/2+2.8,r:1.1,label:me?'Deine Kapsel ansehen':'Kapsel ansehen',act:()=>pod(lb,me)})});
    /* Server-Schränke an der rechten Wand mit blinkenden Lämpchen */for(let i=0;i<3;i++){const z=-1+i*1.4;const g=grp(sc,[W/2-.6,0,z]);P(g,G.bx(.9,2.4,1.1,.05),dark,[0,1.2,0]);const leds=[];for(let k=0;k<12;k++)leds.push(P(g,G.bx(.04,.05,.05,0),M.glow(['#7fd34a','#45e0ff','#ffd23f'][k%3],1.8),[-.46,.6+(k%6)*.28,-.35+Math.floor(k/6)*.25]));
      anim.push((dt,t)=>leds.forEach((l,k)=>{l.visible=Math.sin(t*(3+k*.7)+k*2.1+i)>-.3}));C.push({x0:W/2-1.1,x1:W/2,z0:z-.6,z1:z+.6})}
    /* Terminal mit SCHLAEFER.TXT links */const tm=grp(sc,[-W/2+1.4,0,.6],[0,PI/4,0]);P(tm,G.bx(1.2,1.1,.6,.06),dark,[0,.55,0]);const cv=document.createElement('canvas');cv.width=256;cv.height=192;const cx=cv.getContext('2d');const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(1,.75),new THREE.MeshBasicMaterial({map:tx,toneMapped:false}));scr.position.set(0,1.5,.05);scr.userData.noOutline=true;tm.add(scr);P(tm,G.bx(1.1,.85,.1,.04),chrome,[0,1.5,0]);
    const lines=['> type SCHLAEFER.TXT','KOKON 95 ........ 12','KOKON 97 ........ 9','KOKON 99 ........ 1',' '+nick];anim.push((dt,t)=>{cx.fillStyle='#0a1a10';cx.fillRect(0,0,256,192);cx.fillStyle='#7fd34a';cx.font='bold 17px monospace';const n=Math.min(lines.length,Math.floor(t*1.2)%(lines.length+3));for(let i=0;i<n;i++)cx.fillText(lines[i],12,30+i*30);if(Math.sin(t*6)>0)cx.fillRect(12,30+n*30-14,10,16);tx.needsUpdate=true});
    C.push({x0:-W/2+.6,x1:-W/2+1.8,z0:0,z1:1.2});A.push({x:-W/2+2.2,z:.6,r:1.2,label:'Terminal lesen',act:terminal});
    /* Licht: kühl und gedämpft, ein grünes Statuslicht */const amb=new THREE.HemisphereLight('#d8e0f4','#3a3a4a',1.35);sc.add(amb);for(const[x,c,i]of[[-5,'#ffffff',1.2],[0,'#d8e8ff',1.3],[5,'#ffffff',1.2],[W/2-1,'#7fd34a',.8]]){const L=new THREE.PointLight(c,i,9,2);L.position.set(x,3.2,0);sc.add(L)}
    addOutlines(sc);/* erster Besuch je Gruppe: kleine Belohnung */const g=stationOf(pid);const st=SAVE.tunnel=SAVE.tunnel||{};if(g&&!st[g]){st[g]=1;persist();setTimeout(()=>{money(200);bagAdd('furn','kokon_bett');UI.toast('Im Serversaal gefunden: ein altes Kokon-Kapselbett und 200 Taler.',3200)},1800)}
    return{W,D,camD:13,camH:9}}
  function frame(dt,t){for(const f of anim)f(dt,t)}
  async function pod(lb,me){const v={pitch:190,speed:.9,kind:'sanft'};if(me){await UI.talk('Kapsel',['Auf dem Schild steht dein Name. Das Polster ist noch warm, und das Lämpchen blinkt grün.','Du hast hier geschlafen. Und gleichzeitig bist du draussen unterwegs. Beides stimmt.'],{voice:v,color:'#3a5a3a'});return}
    await UI.talk('Kapsel',[`${lb}. Leer. Im Polster liegt ein Haargummi und ein zerknitterter Zettel: «Bin draussen. Bis gleich.»`],{voice:v,color:'#3a3a48'})}
  async function terminal(){await UI.talk('SCHLAEFER.TXT',['KOKON 95: zwölf Schläfer:innen. KOKON 97: neun. KOKON 99: eine Person.','Unter der letzten Zeile blinkt der Cursor. Daneben steht dein Name.','Alle, die vor dir hier waren, haben sich draussen kennengelernt. Ihre Tagebücher liegen in den Ruinen.'],{voice:{pitch:150,kind:'hall'},color:'#1a3a1a'})}
  /* Möbel: das alte Kapselbett */
  furn('kokon_bett',{n:'Kokon-Kapselbett',cat:'bett',price:4200,planet:'station',size:[1,2],h:1.3,b:(g,m)=>{P(g,G.bx(1,.35,2,.08),m.c('#2a2e3a'),[0,.18,0]);P(g,G.ca(.42,1.2),m.c('#e8ecf8',{gloss:1}),[0,.6,0],[PI/2,0,0],[1,1,.55]);P(g,G.ca(.38,1.1),m.glass('#c8ffd8'),[0,.85,-.25],[PI/2-.8,0,0],[1,1,.5]);P(g,G.s(.05),m.glow('#7fd34a',1.8),[.42,.3,1.01])}});
  INTERIOR.kinds.tunnel={bg:'#20232c',music:'stille',build,frame};
  return{hatch,unlocked,stationOf}
})();
