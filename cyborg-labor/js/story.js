/* =====================================================================
   CYBORG-LABOR · story.js
   Die Geschichte: Du wachst in der Praxis von Dr. Bolzen auf. Die
   Operation war ein Erfolg – aber du erinnerst dich an nichts. Er fragt
   nach deinem Namen, zeigt dir den Spiegel (das Labor) und schickt dich
   hinaus auf den Kompost-Planeten, wo Professorin Pixel dich herumführt.
   Danach geht die Hauptgeschichte in Kapiteln weiter: Erinnerungs-Splitter
   auf allen Planeten verraten nach und nach, wer du warst.
   Die Praxis ist ein echtes Gebäude im Dorf: Dort kannst du jederzeit
   eine neue «Operation» (Labor) machen lassen.
   ===================================================================== */
const STORY=(()=>{
  const DOC='Dr. Bolzen';const DV={pitch:150,kind:'tief',speed:.95};const DC='#5AA8C8';
  const doctor=()=>sanitize({name:DOC,body:{seg:2,size:1.05,skin:'plastik',color:3,shape:'ei',pattern:'bauch',color2:0},parts:{kopf:'monitor',augen:'kulleraugen',arme:'greifarme',beine:'roboterbeine',extras:['stethoskop','kittel'].filter(x=>PARTS.extras.some(p=>p.id===x))}});
  /* ---------- Praxis-Innenraum ---------- */
  function buildClinic(sc){const W=11,D=8,H=3.4;INTERIOR.makeRoom(sc,W,D,H,'praxis','linoleum',{trim:CLINIC.MINT,mat:CLINIC.MINTD,curtain:'#CDEBE3',frame:'#FFFFFF'});const A=INTERIOR.actions,C=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});const r=srand(4242);const CPAL={light:'#8FD4C4',sand:'#F3EBDD',sandD:'#E4D8C6',roof2:'#8FD4C4',woodL:'#EFE3D0',wall:'#F1E8DA',roof:'#8FD4C4',glass:'#E4F3F5',plant:'#F7FCFA',wood:'#E8DCC8',metal:'#B8C4CC',dark:'#5A6470'};
    /* Praxis: hell und klar – kühles Tageslicht statt Lampen-Schummer */sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.34;o.color.set('#F4FFFD');o.groundColor.set('#C8D8D4')}else if(o.isDirectionalLight&&o.intensity<.3&&o.intensity>.1){o.intensity=.18;o.color.set('#FFFFFF')}});
    const put=(pk,nm,x,z,ry,sc2)=>{if(typeof KIT==='undefined'||!KIT.has(pk,nm))return null;const bb=KIT.bounds(pk,nm);const m=KIT.mesh(pk,nm,pk==='furn'&&!/Plant/.test(nm)?CPAL:pk==='furn'||pk==='food'||pk==='nature'?KIT.ORIG:undefined);const s=sc2||1.8;m.scale.setScalar(s);
      m.position.set(x-(bb[0]+bb[3])/2*s*Math.cos(ry||0),-bb[1]*s,z-(bb[2]+bb[5])/2*s);m.rotation.y=ry||0;sc.add(m);return m};
    const add=(g,x,y,z,ry)=>{g.position.set(x,y,z);g.rotation.y=ry||0;sc.add(g);return g};const anim=sc.userData.anim=[];
    /* Behandlungsecke: Bett, Infusion, EKG am Wandarm, Untersuchungslampe, Vorhang */
    add(CLINIC.bed(M),-3.7,0,-2.85);C.push({x0:-4.3,x1:-3.1,z0:-3.95,z1:-1.75});
    add(CLINIC.iv(M,[-.55,.82,-.2]),-2.75,0,-3.3);C.push({x0:-3.05,x1:-2.45,z0:-3.6,z1:-3});
    anim.push(add(CLINIC.monitor(M),-4.85,1.95,-3.97));
    add(CLINIC.examLamp(M),-2.5,0,-1.55,.4);C.push({x0:-2.8,x1:-2.2,z0:-1.85,z1:-1.25});
    add(CLINIC.curtain(M,2.7,H,.68),-1.85,0,-2.6);add(CLINIC.curtain(M,3.6,H,.72,true),-3.7,0,-1.25,PI/2);C.push({x0:-1.95,x1:-1.75,z0:-3.95,z1:-3.05},{x0:-5.5,x1:-4.4,z0:-1.35,z1:-1.15});
    /* Rückwand: Praxis-Kreuz, Waschbecken, Medizinschrank */
    add(CLINIC.emblem(M,1.15),.1,2.55,-3.96);put('furn','bathroomSink',1.05,-3.62,0);C.push({x0:.55,x1:1.55,z0:-3.95,z1:-3.3});
    add(CLINIC.cabinet(M,r),4.55,0,-3.72);C.push({x0:3.9,x1:5.2,z0:-3.95,z1:-3.45});
    /* Schreibtisch des Doktors mit Computer, Stuhl, Pflanze */
    put('furn','desk',2.6,-1.6,0);put('station','computer-system',2.6,-1.95,0,.9);put('furn','chairDesk',2.6,-.85,PI)||put('furn','chairCushion',2.6,-.85,PI);C.push({x0:1.8,x1:3.4,z0:-2.2,z1:-1.1});
    put('furn','pottedPlant',5.05,-2.7,0);
    /* Rechte Wand: Sehtafel, Spiegel (Labor), Wartebereich mit Stühlen und Wasserspender */
    add(CLINIC.eyeChart(M),5.47,1.75,-2.05,-PI/2);
    for(const z of[2.1,2.95])put('furn','chairCushion',4.9,z,-PI/2);C.push({x0:4.5,x1:5.4,z0:1.7,z1:3.4});put('furn','sideTableDrawers',4.95,3.75,-PI/2);
    add(CLINIC.cooler(M),-5.1,0,2.9);C.push({x0:-5.4,x1:-4.8,z0:2.6,z1:3.2});add(CLINIC.height(M),-5.47,0,1.6,PI/2);
    put('furn','pottedPlant',-5.05,-.9,0);put('furn','rugRectangle',0,1.4,0,2.2)||put('furn','rugRound',0,1.4,0,2.2);
    INTERIOR.lamp(sc,'pendel',-3.4,H-.05,-2.4,{col:'#F4FFFB',i:.85,shade:'#F4FBFA'});INTERIOR.lamp(sc,'pendel',2.6,H-.05,-1.4,{col:'#FFF6E0',i:.75,shade:CLINIC.MINT});INTERIOR.lamp(sc,'pendel',0,H-.05,1.6,{col:'#FFF6E8',i:.7,shade:'#F4FBFA'});INTERIOR.lamp(sc,'wand',5.4,2.1,2.5,{col:'#E8F6FF',ry:-PI/2});
    /* Spiegel an der Wand = Labor */const mir=new THREE.Group();P(mir,G.bx(1.1,1.7,.08,.05),M.c(CLINIC.MINT),[0,0,0]);const gl=P(mir,G.bx(.92,1.52,.02,.02),new THREE.MeshBasicMaterial({color:'#CFEFFF',toneMapped:false}),[0,0,.05]);gl.userData.noOutline=true;addOutlines(mir);mir.position.set(5.45,1.5,1.2);mir.rotation.y=-PI/2;sc.add(mir);
    A.push({x:4.6,z:1.1,r:1.2,label:'In den Spiegel schauen (Labor)',act:()=>mirror()});
    /* Dr. Bolzen */let doc=null;try{doc=buildCreature(doctor(),{q:HIGH?.6:.42,noShadow:!HIGH,blob:false,merge:true});doc.scale.setScalar(CS);doc.position.set(-1.1,0,-1.1);doc.rotation.y=-.35;sc.add(doc);sc.userData.doc=doc}catch(e){console.warn('Doktor',e)}
    C.push({x0:-1.5,x1:-.7,z0:-1.5,z1:-.7});A.push({x:-.6,z:-.3,r:1.4,label:'Mit '+DOC+' sprechen',act:()=>talk()});
    return{W,D,camD:Math.max(W,D)*1.05+2.5,doc}}
  /* Monitor-Kurve, Doktor atmet und blinzelt */
  function clinicFrame(dt,t){const S=INTERIOR.scene;if(!S)return;for(const o of S.userData.anim||[])o.userData.tick&&o.userData.tick(t);const d=S.userData.doc;if(d){d.userData.tick&&d.userData.tick(t,false,UI.typing?1:0);const es=d.userData.eyes||[];const ph=(t+1.3)%4.1;const k=ph<.14?1-Math.sin(ph/.14*PI)*.92:1;for(const q of es)q.scale.y=k}}
  INTERIOR.kinds.klinik={bg:'#DDEEF6',music:'home',build:buildClinic,frame:clinicFrame};
  /* ---------- Spiegel: Labor als «Operation» ---------- */
  function mirror(){UI.talk(DOC,['Der Spiegel zeigt dein neues Ich.','Wenn dir etwas nicht gefällt: Im Labor können wir Teile austauschen. Nur eine kleine Operation!'],{voice:DV,color:DC}).then(()=>{MAIN.setTab('lab');UI.toast('Labor = Operationssaal. Mit «Fertig» kommst du zurück zu Dr. Bolzen.',4200)})}
  /* ---------- Gespräch beim späteren Besuch ---------- */
  async function talk(){if(!SAVE.story||!SAVE.story.intro){await intro(true);return}const ch=SAVE.story.chapter||1;const sh=(SAVE.story.shards||[]).length;
    const lines=['Na, wie fühlt sich dein Körper an? Alles noch dran?',sh?`Du hast schon ${sh} Erinnerungs-Splitter gefunden. Sie leuchten in Ruinen und Höhlen auf anderen Planeten.`:'Man sagt, auf anderen Planeten liegen leuchtende Erinnerungs-Splitter. Vielleicht finden wir so heraus, wer du warst …'];
    const r=await UI.talk(DOC,lines,{voice:DV,color:DC,choices:['Ich will eine Operation (Aussehen ändern)','Andere Figur wählen','Was ist mit mir passiert?','Tschüss!']});
    if(r===0)mirror();else if(r===1){await UI.talk(DOC,['Aha, ein Körpertausch! Such dir aus, wer du heute sein willst.'],{voice:DV,color:DC});HOMES.charsApp()}else if(r===2)await UI.talk(DOC,[...memoryLines(),'Mehr weiss ich auch nicht. Die Splitter werden es zeigen.'],{voice:DV,color:DC})}
  /* ---------- Erinnerungs-Splitter (Hauptgeschichte) ---------- */
  const MEM=['Ein Labor voller Licht. Jemand sagt: «Sie ist bereit.»','Eine Rakete, die in einen grünen Planeten stürzt.','Ein Wortstein – du konntest ihn schon einmal lesen …','Eine Gruppe Kinder, die Teile an einen Körper schrauben. Sie lachen.','Ein Satz auf einer Tafel: «Unsere Grenze war …»','Die Stimme von Professorin Pixel: «Wir müssen sie verstecken.»','Ein eigener Planet, ganz leer, der auf dich wartet.'];
  function memoryLines(){const sh=(SAVE.story&&SAVE.story.shards)||[];if(!sh.length)return['Du hattest einen Unfall mit deiner Rakete. Wir haben dich wieder zusammengesetzt – mit ein paar neuen Teilen.'];return sh.map(i=>'Erinnerung: '+MEM[i%MEM.length])}
  function shard(id){const S=SAVE.story=SAVE.story||{};S.shards=S.shards||[];if(S.shards.includes(id))return false;S.shards.push(id);S.chapter=Math.max(S.chapter||1,1+Math.floor(S.shards.length/2));persist();
    UI.talk('Erinnerung',['Ein warmes Licht durchströmt dich …',MEM[(S.shards.length-1)%MEM.length],'('+S.shards.length+' von '+MEM.length+' Erinnerungs-Splittern)'],{color:'#C8A0FF',voice:{kind:'hall',pitch:200}});SND.jingle('j_success');return true}
  /* ---------- Einstieg beim ersten Start ---------- */
  async function intro(inside){const S=SAVE.story=SAVE.story||{};if(!inside){await new Promise(res=>{INTERIOR.enter('klinik');setTimeout(res,1200)})}
    const me=GAME.me;if(me){me.ix=-2.6;me.iz=-.4;me.iyaw=-.6}
    await UI.talk(DOC,['…','Ah – du bist wach! Nicht erschrecken, du bist in meiner Praxis.','Willkommen im Kokon-Netz. Schau auf die Uhr: 31.12.1999, 23:59. Gleich ist Mitternacht!','Die Operation war ein voller Erfolg. Ein paar neue Teile, ein paar alte … du bist jetzt ein echter Cyborg.'],{voice:DV,color:DC});
    const r=await UI.talk(DOC,['Kannst du dich an irgendetwas erinnern?'],{voice:DV,color:DC,choices:['Ähm … nein?','Wo bin ich hier?','Wer sind Sie?']});
    await UI.talk(DOC,[r===2?'Ich bin Dr. Bolzen, Arzt und Mechaniker. Beides, ja.':r===1?'Auf dem Kompost-Planeten. Ein freundliches Dörfchen, du wirst sehen.':'Keine Sorge. Gedächtnislücken sind nach so einem Eingriff ganz normal.','Man hat dich bewusstlos neben einer abgestürzten Rakete gefunden.','Weisst du wenigstens noch deinen Namen?'],{voice:DV,color:DC});
    const nm=await askName();await UI.talk(DOC,[nm+'! Schöner Name. Den schreib ich gleich in deine Akte.','Schau ruhig in den Spiegel dort drüben – wenn dir ein Teil nicht gefällt, tauschen wir es aus.','Und dann: Raus mit dir! Das ganze Dorf bereitet die Silvesterparty vor. Professorin Pixel zeigt dir alles.','Ach, und in deiner Tasche liegt ein kleines Ei. Pass gut darauf auf.'],{voice:DV,color:DC});
    S.intro=true;S.chapter=1;persist();UI.toast('Tipp: Geh durch die Tür unten, um die Praxis zu verlassen.',4200)}
  function askName(){return new Promise(res=>{const w=UI.win('Wie heisst du?',{size:'narrow',dismiss:false});w.body.append(el('p',null,'Dein Name steht über deinem Cyborg und im Chat.'));
    const i=el('input');i.type='text';i.id='nickIn';i.maxLength=24;i.value=SAVE.nick||S.name||'';i.placeholder='z. B. Moos-Mo';w.body.append(i);
    const go=()=>{SAVE.nick=i.value.trim().slice(0,24)||'Gast';persist();w.close();GAME.onAvatarChanged();SND.jingle('j_success');res(SAVE.nick)};i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')go()});w.foot.append(btn('Das bin ich','primary',go));setTimeout(()=>i.focus(),50)})}
  const needsIntro=()=>!(SAVE.story&&SAVE.story.intro)&&!SAVE.tutDone;
  return{intro,needsIntro,shard,memoryLines,talk,MEM}
})();
