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
  function buildClinic(sc){const W=10,D=8,H=3.4;INTERIOR.makeRoom(sc,W,D,H,'karo','fliesen',{trim:'#8FB8D0',curtain:'#9ED8E8',frame:'#FFFFFF'});const A=INTERIOR.actions,C=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});
    const put=(pk,nm,x,z,ry,sc2)=>{if(typeof KIT==='undefined'||!KIT.has(pk,nm))return null;const bb=KIT.bounds(pk,nm);const m=KIT.mesh(pk,nm,pk==='furn'||pk==='food'||pk==='nature'?KIT.ORIG:undefined);const s=sc2||1.8;m.scale.setScalar(s);
      m.position.set(x-(bb[0]+bb[3])/2*s*Math.cos(ry||0),-bb[1]*s,z-(bb[2]+bb[5])/2*s);m.rotation.y=ry||0;sc.add(m);return m};
    /* Krankenbett, Monitor, Schrank, Pflanzen, Lampe, Waschbecken, Teppich */
    put('furn','bedSingle',-3.2,-2.2,0);C.push({x0:-4.4,x1:-2.2,z0:-3.9,z1:-.2});
    put('station','computer-system',-1.4,-3.4,0,1.5);C.push({x0:-2.1,x1:-.7,z0:-3.9,z1:-2.9});
    put('furn','bathroomCabinet',3.9,-3.5,0);put('furn','bathroomSink',2.4,-3.6,0);C.push({x0:1.6,x1:4.6,z0:-3.9,z1:-3});
    put('furn','pottedPlant',4.3,2.9,0);put('furn','pottedPlant',-4.3,2.9,0);put('furn','lampRoundFloor',-4.3,-.2,0);put('furn','rugRound',0,.6,0,2.2);
    put('furn','chairCushion',1.8,-.6,-PI/2);put('furn','desk',3.2,-.6,-PI/2);C.push({x0:2.5,x1:4.2,z0:-1.6,z1:.4});
    INTERIOR.lamp(sc,'pendel',0,H-.05,0,{c:'#FFF6E0',i:1.3});INTERIOR.lamp(sc,'wand',-4.9,2,-2.2,{c:'#E8F6FF'});
    /* Spiegel an der Wand = Labor */const mir=new THREE.Group();P(mir,G.bx(1.1,1.7,.08,.05),M.c('#C8A06E'),[0,0,0]);const gl=P(mir,G.bx(.92,1.52,.02,.02),new THREE.MeshBasicMaterial({color:'#CFEFFF',toneMapped:false}),[0,0,.05]);mir.position.set(4.95,1.5,1.4);mir.rotation.y=-PI/2;sc.add(mir);
    A.push({x:4.1,z:1.4,r:1.3,label:'In den Spiegel schauen (Labor)',act:()=>mirror()});
    /* Dr. Bolzen */let doc=null;try{doc=buildCreature(doctor(),{q:HIGH?.6:.42,noShadow:!HIGH,blob:false,merge:true});doc.scale.setScalar(CS);doc.position.set(-1.3,0,-1.2);doc.rotation.y=.5;sc.add(doc)}catch(e){console.warn('Doktor',e)}
    C.push({x0:-1.8,x1:-.8,z0:-1.7,z1:-.7});A.push({x:-.6,z:-.4,r:1.4,label:'Mit '+DOC+' sprechen',act:()=>talk()});
    return{W,D,camD:Math.max(W,D)*1.05+2.5,doc}}
  INTERIOR.kinds.klinik={bg:'#DDEEF6',music:'home',build:buildClinic};
  /* ---------- Spiegel: Labor als «Operation» ---------- */
  function mirror(){UI.talk(DOC,['Der Spiegel zeigt dein neues Ich.','Wenn dir etwas nicht gefällt: Im Labor können wir Teile austauschen. Nur eine kleine Operation!'],{voice:DV,color:DC}).then(()=>{MAIN.setTab('lab');UI.toast('Labor = Operationssaal. Mit «Welt» kommst du zurück in die Praxis.',4200)})}
  /* ---------- Gespräch beim späteren Besuch ---------- */
  async function talk(){if(!SAVE.story||!SAVE.story.intro){await intro(true);return}const ch=SAVE.story.chapter||1;const sh=(SAVE.story.shards||[]).length;
    const lines=['Na, wie fühlt sich dein Körper an? Alles noch dran?',sh?`Du hast schon ${sh} Erinnerungs-Splitter gefunden. Sie leuchten in Ruinen und Höhlen auf anderen Planeten.`:'Man sagt, auf anderen Planeten liegen leuchtende Erinnerungs-Splitter. Vielleicht finden wir so heraus, wer du warst …'];
    const r=await UI.talk(DOC,lines,{voice:DV,color:DC,choices:['Ich will eine Operation (Labor)','Was ist mit mir passiert?','Tschüss!']});
    if(r===0)mirror();else if(r===1)await UI.talk(DOC,[...memoryLines(),'Mehr weiss ich auch nicht. Die Splitter werden es zeigen.'],{voice:DV,color:DC})}
  /* ---------- Erinnerungs-Splitter (Hauptgeschichte) ---------- */
  const MEM=['Ein Labor voller Licht. Jemand sagt: «Sie ist bereit.»','Eine Rakete, die in einen grünen Planeten stürzt.','Ein Wortstein – du konntest ihn schon einmal lesen …','Eine Gruppe Kinder, die Teile an einen Körper schrauben. Sie lachen.','Ein Satz auf einer Tafel: «Unsere Grenze war …»','Die Stimme von Professorin Pixel: «Wir müssen sie verstecken.»','Ein eigener Planet, ganz leer, der auf dich wartet.'];
  function memoryLines(){const sh=(SAVE.story&&SAVE.story.shards)||[];if(!sh.length)return['Du hattest einen Unfall mit deiner Rakete. Wir haben dich wieder zusammengesetzt – mit ein paar neuen Teilen.'];return sh.map(i=>'Erinnerung: '+MEM[i%MEM.length])}
  function shard(id){const S=SAVE.story=SAVE.story||{};S.shards=S.shards||[];if(S.shards.includes(id))return false;S.shards.push(id);S.chapter=Math.max(S.chapter||1,1+Math.floor(S.shards.length/2));persist();
    UI.talk('Erinnerung',['Ein warmes Licht durchströmt dich …',MEM[(S.shards.length-1)%MEM.length],'('+S.shards.length+' von '+MEM.length+' Erinnerungs-Splittern)'],{color:'#C8A0FF',voice:{kind:'hall',pitch:200}});SND.jingle('j_success');return true}
  /* ---------- Einstieg beim ersten Start ---------- */
  async function intro(inside){const S=SAVE.story=SAVE.story||{};if(!inside){await new Promise(res=>{INTERIOR.enter('klinik');setTimeout(res,1200)})}
    const me=GAME.me;if(me){me.ix=-2.6;me.iz=-.4;me.iyaw=-.6}
    await UI.talk(DOC,['…','Ah – du bist wach! Nicht erschrecken, du bist in meiner Praxis.','Die Operation war ein voller Erfolg. Ein paar neue Teile, ein paar alte … du bist jetzt ein echter Cyborg.'],{voice:DV,color:DC});
    const r=await UI.talk(DOC,['Kannst du dich an irgendetwas erinnern?'],{voice:DV,color:DC,choices:['Ähm … nein?','Wo bin ich hier?','Wer sind Sie?']});
    await UI.talk(DOC,[r===2?'Ich bin Dr. Bolzen, Arzt und Mechaniker. Beides, ja.':r===1?'Auf dem Kompost-Planeten. Ein freundliches Dörfchen, du wirst sehen.':'Keine Sorge. Gedächtnislücken sind nach so einem Eingriff ganz normal.','Man hat dich bewusstlos neben einer abgestürzten Rakete gefunden.','Weisst du wenigstens noch deinen Namen?'],{voice:DV,color:DC});
    const nm=await askName();await UI.talk(DOC,[nm+'! Schöner Name. Den schreib ich gleich in deine Akte.','Schau ruhig in den Spiegel dort drüben – wenn dir ein Teil nicht gefällt, tauschen wir es aus.','Und dann: Raus mit dir an die frische Luft! Professorin Pixel wartet draussen und zeigt dir alles.'],{voice:DV,color:DC});
    S.intro=true;S.chapter=1;persist();UI.toast('Tipp: Geh durch die Tür unten, um die Praxis zu verlassen.',4200)}
  function askName(){return new Promise(res=>{const w=UI.win('Wie heisst du?',{size:'narrow',dismiss:false});w.body.append(el('p',null,'Dein Name steht über deinem Cyborg und im Chat.'));
    const i=el('input');i.type='text';i.id='nickIn';i.maxLength=24;i.value=SAVE.nick||S.name||'';i.placeholder='z. B. Moos-Mo';w.body.append(i);
    const go=()=>{SAVE.nick=i.value.trim().slice(0,24)||'Gast';persist();w.close();GAME.onAvatarChanged();SND.jingle('j_success');res(SAVE.nick)};i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')go()});w.foot.append(btn('Das bin ich','primary',go));setTimeout(()=>i.focus(),50)})}
  const needsIntro=()=>!(SAVE.story&&SAVE.story.intro)&&!SAVE.tutDone;
  return{intro,needsIntro,shard,memoryLines,talk,MEM}
})();
