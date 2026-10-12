/* =====================================================================
   CYBORG-LABOR · piko.js
   Piko: dein Begleiter im Ei-Gerät. Das Ei lugt am rechten Bildschirmrand
   hervor, wippt und blinzelt. Mit der Maus darüber (oder antippen) springt
   es heraus; ein Klick öffnet das Ei. Will Piko etwas, rumpelt das Ei:
   es wackelt, piepst, zeigt ein "!" und vibriert auf Handys.
   ===================================================================== */
const PIKO=(()=>{
  const FACES={ok:'◕ᴗ◕',want:'◕o◕',blink:'－ᴗ－',happy:'^ᴗ^',sleep:'－ω－'};
  let root=null,face=null,bub=null,wantQ=[],wantT=0,pulseT=0,blinkT=2.5,mood='',idleT=8;
  function build(){root=el('button','piko');root.type='button';root.setAttribute('aria-label','Piko: Ei öffnen (Tab)');root.title='Piko (Tab)';
    const egg=el('span','egg');const loop=el('span','loop');const gear=el('span','gear');const scr=el('span','scr');face=el('span','face');face.setAttribute('data-no-i18n','');scr.append(face);
    const btns=el('span','btns');btns.append(el('i'),el('i'),el('i'));const shine=el('span','shine');egg.append(loop,gear,scr,btns,shine);
    bub=el('span','bub');bub.hidden=true;root.append(egg,bub);setMood('ok');
    root.addEventListener('pointerenter',()=>{root.classList.add('out');if(wantQ.length)showBub()});root.addEventListener('pointerleave',()=>{if(document.activeElement!==root){root.classList.remove('out');bub.hidden=true}});
    root.addEventListener('focus',()=>{root.classList.add('out');if(wantQ.length)showBub()});root.addEventListener('blur',()=>{root.classList.remove('out');bub.hidden=true});
    root.onclick=open;$('world').append(root)}
  function setMood(m){if(m===mood||!face)return;mood=m;face.textContent=FACES[m]||FACES.ok}
  function showBub(){if(!bub||!wantQ.length)return;bub.textContent=wantQ[0];bub.hidden=false}
  function open(){const note=wantQ.shift()||null;wantT=wantQ.length?6:0;root.classList.toggle('want',wantT>0);bub.hidden=true;setMood('happy');setTimeout(()=>setMood('ok'),900);
    root.classList.add('hop');setTimeout(()=>root.classList.remove('hop','out'),420);setTimeout(()=>MAIN.phone(note),160)}
  /* Piko will etwas: rumpeln, piepsen, vibrieren */
  function want(text){if(!text)return;try{SND.play('question',{vol:.35})}catch(e){}if(!root&&typeof $==='function'&&$('world'))build();if(wantQ.length>4)wantQ.shift();if(!wantQ.includes(text))wantQ.push(text);wantT=8;pulseT=0;
    if(root){root.classList.add('want');if(root.classList.contains('out'))showBub()}try{SND.play('select',{vol:.45,rate:1.8})}catch(e){}try{navigator.vibrate&&navigator.vibrate([40,30,40])}catch(e){}}
  function frame(dt){if(typeof GAME==='undefined')return;const show=!GAME.viewer&&!document.body.classList.contains('inspace')&&!document.querySelector('.phone.gta')&&!document.querySelector('.wstart');
    if(!root){if(!show)return;build()}root.hidden=!show;if(!show)return;
    if(wantT>0){wantT-=dt;pulseT-=dt;if(pulseT<=0){pulseT=2.5;root.classList.remove('rumble');void root.offsetWidth;root.classList.add('rumble');try{SND.play('click',{vol:.25,rate:2})}catch(e){}}setMood('want');if(wantT<=0){root.classList.remove('want','rumble');setMood('ok')}}
    else{blinkT-=dt;if(blinkT<=0){setMood('blink');if(blinkT<-.16){blinkT=2+Math.random()*3.5;setMood('ok')}}
      /* ab und zu von selbst kurz herausschauen */idleT-=dt;if(idleT<=0){idleT=25+Math.random()*25;if(!root.matches(':hover')){root.classList.add('peekout');setTimeout(()=>root.classList.remove('peekout'),1400)}}}}
  return{frame,want,open,get wants(){return wantQ.length}};
})();
