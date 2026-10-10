/* =====================================================================
   CYBORG-LABOR · wstory2.js · Akt III bis Finale
   Akt III «Wartung»: Nach sechs Risslingen ahnt Piko, dass die Risse aus
     Kokon selbst kommen. Die sieben Wartungsstationen im All haben
     Logbücher; jedes öffnet auch die Wartungsluken einer Planeten-Gruppe.
   Akt IV «Der Kern»: Alle sieben Logbücher gelesen – hinter der Sonne
     flackert der Glitch-Kern.
   Finale «00:00»: Im Kern darf die Uhr weiterlaufen. Danach zeigen alle
     Uhren und Schilder 00:00, jeden Abend gibt es Feuerwerk über den
     Dörfern, und die Musik zerfällt nicht mehr.
   ===================================================================== */
const WSTORY2=(()=>{
  const TITLES=['Prolog · 23:59','Akt I · Gute Nacht','Akt II · Risslinge','Akt III · Wartung','Akt IV · Der Kern','Finale · 00:00'];
  const HINT3=['Die Risse kommen nicht von draussen. Sie kommen aus Kokon selbst. Lass uns zu einer Wartungsstation im All fliegen.','Im Weltraum kreisen sieben Wartungsstationen. Fliege nah heran und drück E zum Andocken.','In jeder Station melden drei Paneele Störungen. Wer sie repariert, darf das Logbuch lesen.','Mit dem Code aus einem Logbuch öffnen sich die Wartungsluken einer ganzen Planeten-Gruppe.'];
  const HINT4=['Die Logbücher ergeben Koordinaten hinter der Sonne. Dort flackert der Glitch-Kern.','Flieg zum roten Kern hinter der Sonne und dock an. Ich komme mit, versprochen.'];
  const AFTER=['Es ist 00:00! Hörst du? Alle Uhren ticken wieder.','Heute Abend gibt es endlich Feuerwerk. Wirklich, diesmal ist es fertig!','Die Bürgermeisterin hat einen neuen Witz erzählt. Einen, den ich noch nie gehört habe!','Morgen ist ein neuer Tag. Ich weiss noch nicht, was passiert. Ist das nicht schön?'];
  const S=()=>SAVE.wired=SAVE.wired||{act:0,caught:[],seen:{},t:0};
  const logs=()=>typeof STATIONS!=='undefined'?STATIONS.logsRead():0;
  let hintT=45,fwT=3,fw=[];
  /* Nach dem Finale: 23:59 wird überall zu 00:00, der 31.12.1999 zum 1.1.2000 */
  (function patch(){const C=self.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;if(!C||C.__midnight)return;C.__midnight=1;
    for(const fn of['fillText','strokeText']){const orig=C[fn];C[fn]=function(text,...a){if(typeof text==='string'&&typeof SAVE!=='undefined'&&SAVE.finale)text=text.replace(/23:59/g,'00:00').replace(/31\.12\.1999/g,'01.01.2000');return orig.call(this,text,...a)}}})();
  function midnight(){try{if(typeof ctexRedraw==='function')ctexRedraw()}catch(e){}try{if(typeof MUSIC2!=='undefined')MUSIC2.setRiss(0)}catch(e){}
    document.querySelectorAll('.cw-lcd').forEach(e=>{e.textContent=e.textContent.replace('23:59','00:00').replace('31.12.1999','01.01.2000')})}
  /* Fortschritt der Akte */
  function advance(){const s=S();if(s.act<2)return;let changed=false;
    if(s.act===2&&s.caught.length>=6){s.act=3;changed=true;say('Sechs Risslinge … Ich glaube, die Risse kommen aus Kokon selbst. Im All gibt es Wartungsstationen. Lass uns nachsehen!')}
    if(s.act===3&&(SAVE.glitchKnown||logs()>=7)){s.act=4;changed=true;say('Alle sieben Logbücher! Hinter der Sonne flackert etwas Rotes. Der Glitch-Kern.')}
    if(s.act===4&&SAVE.finale){s.act=5;changed=true;midnight();try{SND.jingle('music/m_finale')}catch(e){}say('00:00! Die Uhr läuft wieder! Wir haben es geschafft – zusammen.')}
    if(s.act<5&&SAVE.finale){s.act=5;changed=true;midnight()}
    if(changed){persist();UI.toast(TITLES[s.act],3200)}}
  function say(t){if(typeof PIKO!=='undefined')PIKO.want(t)}
  /* Feuerwerk über dem Dorfplatz an Abenden nach dem Finale */
  function burst(){const G_=GAME.G;const pz=G_.places.find(p=>p.id==='platz');if(!pz)return;const M=makeMats({skin:'haut',color:0});
    const t1=GAME.tangentTo(pz.dir,new THREE.Vector3(0,0,1)),t2=pz.dir.clone().cross(t1);const off=(Math.random()-.5)*30,off2=(Math.random()-.5)*30;
    const d=pz.dir.clone().addScaledVector(t1,off/G_.R).addScaledVector(t2,off2/G_.R).normalize();const c=d.clone().multiplyScalar(G_.R+G_.hAt(d)+22+Math.random()*10);
    const col=['#ff6fd8','#ffd23f','#45e0ff','#7fd34a','#ff9a45','#ffffff'][Math.floor(Math.random()*6)];const mat=M.glow(col,2.4);
    for(let i=0;i<34;i++){const p=new THREE.Mesh(G.s(.22),mat);p.position.copy(c);p.userData.noOutline=true;G_.scene.add(p);const v=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(7+Math.random()*4);fw.push({p,v,l:1.8,up:d})}
    try{SND.play('pop',{vol:.35,rate:.7+Math.random()*.4})}catch(e){}}
  function tickFw(dt){for(const f of fw){if(f.l<=0)continue;f.l-=dt;f.v.addScaledVector(f.up,-dt*4);f.p.position.addScaledVector(f.v,dt);f.p.scale.setScalar(Math.max(.01,f.l/1.8));if(f.l<=0&&f.p.parent)f.p.parent.remove(f.p)}fw=fw.filter(f=>f.l>0)}
  function frame(dt){if(typeof GAME==='undefined'||!GAME.G||GAME.viewer)return;const s=S();advance();
    if(GAME.mode!=='outdoor'){return}
    if(s.act===3||s.act===4){hintT-=dt;if(hintT<=0){hintT=150+Math.random()*60;const L=s.act===3?HINT3:HINT4;say(L[(s.hint=(s.hint||0)+1)%L.length]);persist()}}
    if(s.act>=5){tickFw(dt);const h=typeof GAMETIME!=='undefined'?GAMETIME.hour():20;if((h>=19||h<4)&&!GAME.G.def.mine){fwT-=dt;if(fwT<=0){fwT=1.2+Math.random()*2.2;burst()}}
      hintT-=dt;if(hintT<=0){hintT=240+Math.random()*120;say(AFTER[(s.hint=(s.hint||0)+1)%AFTER.length]);persist()}}}
  function onPlanet(){fw.length=0}
  /* Akt-Titel im Risslinge-Buch */
  if(typeof WSTORY!=='undefined'){const app0=WSTORY.app;WSTORY.app=function(){app0();const w=document.querySelector('.win:last-of-type .wb')||[...document.querySelectorAll('.win .wb')].pop();if(w){const s=S();w.prepend(el('div','note',TITLES[Math.min(5,s.act||0)]+(s.act===3?` · Logbücher ${logs()} von 7`:'')))}}}
  setTimeout(()=>{try{if(SAVE.finale)midnight()}catch(e){}},800);
  return{frame,onPlanet,TITLES,advance}
})();
