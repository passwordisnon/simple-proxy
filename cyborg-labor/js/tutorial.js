/* =====================================================================
   CYBORG-LABOR · tutorial.js
   Geführter Einstieg beim ersten Start: Professorin Pixel (eine kleine
   Roboter-Eule) erklärt Schritt für Schritt. Eine Aufgaben-Karte zeigt
   das aktuelle Ziel; erledigte Schritte schalten den nächsten frei.
   ===================================================================== */
const TUT=(()=>{
  const touch=()=>document.body.classList.contains('coarse');
  const GUIDE='Professorin Pixel';const V={pitch:330,speed:1.1,kind:'pieps'};
  const ev={};const mark=k=>{ev[k]=(ev[k]||0)+1};
  let start={};let card=null;let busy=false;
  const STEPS=[
    {id:'name',t:'Gib dir einen Namen',hint:'Der Name steht über deinem Cyborg und im Chat.',done:()=>!!SAVE.nick},
    {id:'walk',t:'Lauf ein Stück',hint:()=>touch()?'Zieh den Joystick unten links.':'Laufen mit W A S D oder den Pfeiltasten. Mit Shift rennst du.',intro:['Hallo, ich bin Professorin Pixel! Ich zeige dir den Planeten.','Probier zuerst, ein bisschen herumzulaufen.'],
      begin:()=>{start.p=GAME.me&&GAME.me.p.clone()},done:()=>GAME.me&&start.p&&GAME.me.p.angleTo(start.p)*GAME.G.R>8},
    {id:'cam',t:'Schau dich um',hint:()=>touch()?'Wisch mit einem Finger über den Bildschirm, um die Kamera zu drehen.':'Drehe die Kamera mit Q und C oder ziehe mit der Maus.',begin:()=>{start.cf=GAME.camF&&GAME.camF.clone();start.t=Date.now()},done:()=>{const c=GAME.camF;return(c&&start.cf&&c.angleTo(start.cf)>.8)||Date.now()-start.t>12000}},
    {id:'talk',t:'Sprich mit einer Bewohnerin oder einem Bewohner',hint:()=>'Geh nah an eine Figur und drück '+(touch()?'den grünen Knopf':'E')+'. Jede Figur hat Bedürfnisse, Hobbys und Launen – wie bei den Sims.',intro:['Hier leben viele Cyborgs – und alle haben ihren eigenen Tag.','Geh zu jemandem hin und sag Hallo!'],
      begin:()=>{start.talks=SAVE.stats.talks||0},done:()=>(SAVE.stats.talks||0)>start.talks},
    {id:'pet',t:'Streichle ein Tier',hint:'Auf jedem Planeten wohnen andere Tiere. Streicheln, füttern, Fangen spielen – und sie kommen mit dir mit!',begin:()=>{start.pets=SAVE.stats.pets||0},done:()=>(SAVE.stats.pets||0)>start.pets},
    {id:'collect',t:'Sammle etwas',hint:()=>'Schüttle einen Obstbaum, heb Muscheln, Äste oder Steine auf ('+(touch()?'grüner Knopf':'E')+').',begin:()=>{start.bag=bagCount();start.sh=SAVE.stats.shakes||0},done:()=>bagCount()>start.bag||(SAVE.stats.shakes||0)>start.sh},
    {id:'phone',t:'Sag Hallo zu Piko',hint:()=>'Piko lugt im Ei am rechten Rand hervor. '+(touch()?'Tippe Piko an':'Klicke Piko an oder drücke Tab')+', um das Ei zu öffnen: Tasche, Lexikon, Tiere, Karte und mehr. Wenn das Ei wackelt, will Piko dir etwas sagen.',begin:()=>{start.ph=ev.phone||0},done:()=>(ev.phone||0)>start.ph},
    {id:'shop',t:'Besuche den Laden',hint:'Folge dem Weg vom Dorfplatz zum Laden. Dort kannst du alles verkaufen, was du findest, und Möbel kaufen.',begin:()=>{start.sh2=ev.shop||0},done:()=>(ev.shop||0)>start.sh2},
    {id:'end',t:'Geschafft!',hint:'',intro:null,final:true}];
  function cur(){return SAVE.tut??0}
  function show(){if(!card){card=el('div','tutcard');card.setAttribute('role','status');$('world').append(card)}const i=cur();const s=STEPS[i];if(!s||s.final||SAVE.tutDone){card.hidden=true;return}card.hidden=false;
    const hint=typeof s.hint==='function'?s.hint():s.hint;card.innerHTML='';const top=el('div','tut-top');const ic=el('span','tut-ic');ic.innerHTML=ICON('star');top.append(ic,el('b',null,s.t));
    const dots=el('div','tut-dots');STEPS.slice(0,-1).forEach((x,k)=>{const d=el('i');if(k<i)d.className='on';if(k===i)d.className='cur';dots.append(d)});
    const skip=el('button','tut-skip','Tutorial überspringen');skip.type='button';skip.onclick=()=>{SAVE.tutDone=true;persist();card.hidden=true};card.append(top,el('p',null,hint),dots,skip)}
  async function next(){busy=true;SAVE.tut=cur()+1;persist();const s=STEPS[cur()];SND.play('j_success');
    if(s&&s.final){await UI.talk(GUIDE,['Super gemacht! Du kennst jetzt die wichtigsten Dinge.','Hier sind 1000 Taler als Startgeld.','Tipp: Mit der Rakete kannst du andere Planeten besuchen. Und bald bekommst du sogar einen eigenen Planeten mit eigenem Haus …'],{voice:V,color:'#8C6FE0'});money(1000);SAVE.tutDone=true;persist();show();busy=false;return}
    if(s&&s.intro)await UI.talk(GUIDE,s.intro,{voice:V,color:'#8C6FE0'});else UI.toast('Gut gemacht! Nächste Aufgabe: '+s.t,2600);
    s&&s.begin&&s.begin();show();busy=false}
  function tick(){if(SAVE.tutDone||busy||!GAME.me||GAME.mode!=='outdoor'||UI.anyOpen())return;const s=STEPS[cur()];if(!s){SAVE.tutDone=true;return}if(!start.begun){start.begun=true;s.begin&&s.begin()}
    try{if(s.done())next()}catch(e){}}
  function startWorld(){if(SAVE.tutDone)return;show();setInterval(tick,700);const s=STEPS[cur()];if(s&&s.intro&&cur()<=1){const iv=setInterval(()=>{if(GAME.mode==='outdoor'&&!UI.anyOpen()){clearInterval(iv);UI.talk(GUIDE,['Da bist du ja! Dr. Bolzen hat mir schon alles erzählt.',...s.intro],{voice:V,color:'#8C6FE0'})}},800)}}
  return{startWorld,ev:mark,show,get step(){return cur()}}
})();
