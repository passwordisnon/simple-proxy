/* =====================================================================
   CYBORG-LABOR · start.js
   Startbildschirm (Spielen / Beamer-Ansicht / Sprache) und das
   Spielmenü (Esc oder Menü-Knopf): Speichern, Zurück ins Labor,
   Beamer-Ansicht, Einstellungen, Spiel verlassen.
   ===================================================================== */
const START=(()=>{
  const t=s=>I18N.t(s);
  let menuEl=null;
  function langRow(){return I18N.picker(()=>SND.play&&SND.play('select',{vol:.5}))}
  /* ---------- Startbildschirm ---------- */
  function show(){try{SND.music('title')}catch(e){}
    /* direkt in die Beamer-Ansicht (nach "Beamer-Ansicht" im Spielmenü) */
    let pending=null;try{pending=sessionStorage.getItem('cyborg-labor-start');sessionStorage.removeItem('cyborg-labor-start')}catch(e){}
    if(pending==='beamer'){beamer();return}
    const root=el('div','wstart');root.setAttribute('role','dialog');root.setAttribute('aria-label','Cyborg-Labor WIRED');
    const sh=el('div','shell');['s1','s2','s3','s4'].forEach(c=>sh.append(el('i','cw-screw '+c)));
    const s1=el('span','cw-sticker stk a','サイボーグ・ラボ');s1.setAttribute('data-no-i18n','');
    const s2=el('span','cw-sticker pink stk b','おやすみ');s2.setAttribute('data-no-i18n','');
    const h=el('h1');h.append(document.createTextNode('Cyborg-Labor'),el('small',null,'W I R E D'));h.setAttribute('data-no-i18n','');
    const lcd=el('span','cw-lcd','31.12.1999 23:59');lcd.setAttribute('data-no-i18n','');
    const tag=el('p','tag',t('Gute Nacht. Schlaf gut.'));
    const play=el('button','btn primary big');play.type='button';play.append(t('Spielen'),el('small',null,t('Für Schüler:innen')));
    const beam=el('button','btn chrome big');beam.type='button';beam.append(t('Beamer-Ansicht'),el('small',null,t('Für die Lehrperson')));
    const row=el('div','row2');row.append(play,beam);
    const note=el('p','tag',t('Nur ansehen. Keine Figur, kein Einfluss auf das Spiel.'));note.style.fontSize='13px';
    sh.append(s1,s2,lcd,h,tag,row,note,langRow());root.append(sh);document.body.append(root);
    I18N.on(()=>{tag.textContent=t('Gute Nacht. Schlaf gut.');play.firstChild.textContent=t('Spielen');play.lastChild.textContent=t('Für Schüler:innen');beam.firstChild.textContent=t('Beamer-Ansicht');beam.lastChild.textContent=t('Für die Lehrperson');note.textContent=t('Nur ansehen. Keine Figur, kein Einfluss auf das Spiel.')});
    const close=()=>{root.remove();removeEventListener('keydown',kd,true)};
    play.onclick=()=>{SND.init();SND.play('confirm');close();MAIN.setTab('world')};
    beam.onclick=()=>{SND.init();SND.play('confirm');close();beamer()};
    const kd=e=>{if(e.key==='Enter'&&document.activeElement===document.body){e.preventDefault();play.click()}};addEventListener('keydown',kd,true);
    setTimeout(()=>play.focus(),50)}
  async function beamer(){window.__viewer=true;SOCIAL.viewer=true;document.body.classList.add('beamer-on');await MAIN.setTab('world',{viewer:true});BEAMER.start()}
  /* ---------- Spielmenü ---------- */
  function save(){try{LS.set(SAVE_KEY,SAVE);if(typeof saveWorld==='function')saveWorld()}catch(e){}}
  function menu(){if(BEAMER.on)return;if(menuEl){closeMenu();return}
    const root=el('div','wmenu');root.setAttribute('role','dialog');root.setAttribute('aria-label',t('Menü'));
    const sh=el('div','shell');['s1','s2','s3','s4'].forEach(c=>sh.append(el('i','cw-screw '+c)));const p=el('div','panel2');
    const h=el('h2');const jp=el('span','cw-sticker','メニュー');jp.setAttribute('data-no-i18n','');h.append(t('Menü'),jp);
    const B=(label,cls,key,fn)=>{const b=btn(t(label),cls,()=>{SND.play('select');fn()});if(key){const k=el('span','k',key);k.setAttribute('data-no-i18n','');b.append(k)}p.append(b);return b};
    p.append(h);
    const first=B('Weiter','primary','Esc',closeMenu);
    B('Speichern',null,null,()=>{save();UI.toast(t('Gespeichert'));SND.jingle&&SND.jingle('j_success');closeMenu()});
    B('Zurück ins Labor',null,null,()=>{save();closeMenu();MAIN.setTab('lab')});
    B('Beamer-Ansicht','sea',null,()=>{save();try{sessionStorage.setItem('cyborg-labor-start','beamer')}catch(e){}location.reload()});
    B('Einstellungen',null,null,()=>{closeMenu();MAIN.settings()});
    /* Neu anfangen: zweimal klicken (Sicherheitsabfrage), löscht den Spielstand in diesem Browser; Sprache und Einstellungen bleiben */
    {const rb=B('Neu anfangen','danger',null,()=>{});UI.armed(rb,t('Wirklich alles löschen? Nochmal klicken'),()=>{try{LS.set(SAVE_KEY,null);localStorage.removeItem('cyborg-labor-zeit')}catch(e){}SAVE=newSave();persist();location.reload()})}
    B('Spiel verlassen','danger',null,()=>{save();closeMenu();bye()});
    sh.append(p);root.append(sh);document.body.append(root);root.addEventListener('pointerdown',e=>{if(e.target===root)closeMenu()});
    const kd=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu()}};addEventListener('keydown',kd,true);
    menuEl={root,kd};SND.play('open',{vol:.6});setTimeout(()=>first.focus(),30)}
  function closeMenu(){if(!menuEl)return;removeEventListener('keydown',menuEl.kd,true);menuEl.root.remove();menuEl=null}
  function bye(){const root=el('div','wstart');const sh=el('div','shell');['s1','s2','s3','s4'].forEach(c=>sh.append(el('i','cw-screw '+c)));
    const jp=el('span','cw-sticker pink stk a','またね');jp.setAttribute('data-no-i18n','');
    sh.append(jp,el('p','bye',t('Bis bald!')),el('p','tag',t('Gespeichert')+'. '+t('Du kannst dieses Fenster jetzt schliessen.')),btn(t('Zurück zum Start'),'primary big',()=>location.reload()));root.append(sh);document.body.append(root);SND.music&&SND.music(null)}
  return{show,menu,closeMenu,get menuOpen(){return!!menuEl}};
})();
