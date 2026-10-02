/* =====================================================================
   CYBORG-LABOR · beamer.js
   Beamer-Ansicht für die Lehrperson: nur ansehen, keine eigene Figur,
   kein Einfluss auf das Spiel, nicht Teil der Geschichte.
   Klassenliste, Pfeile zum Wechseln, Kamera folgt der gewählten Figur
   live und wechselt bei Bedarf den Planeten, Steckbrief daneben.
   Tasten: Pfeil links/rechts, Bild auf/ab (Präsentations-Clicker),
   Leertaste = nächste, A = automatisch weiter, Esc = beenden.
   ===================================================================== */
const BEAMER=(()=>{
  const t=s=>I18N.t(s);
  let on=false,idx=0,list=[],ui=null,auto=false,autoT=0,loading=false,refreshT=0,lastKey='';
  const AUTO_S=20;
  /* Einträge: echte Mitspielende (live) und eingeschleuste Cyborgs (aus Codes) */
  function entries(){const out=[];
    for(const p of SOCIAL.peers()){const d=fromLooks(p.lk||{},p.sb.cy||p.nick)||sanitize(Object.assign(DEFAULT(),{name:p.nick}));d.name=p.sb.cy||p.nick;d.group=p.sb.g||'';d.statement=p.sb.s||'';out.push({key:'peer:'+p.pid,live:true,nick:p.nick,d,pl:p.pl,inside:p.inside,peer:p})}
    for(const d of WORLD){if(d.example)continue;out.push({key:'code:'+d.id,live:false,nick:d.name,d,pl:'kompost'})}
    return out}
  function cur(){return list[idx]||null}
  function target(){const e=cur();if(!e)return null;if(e.live){const ent=e.peer&&e.peer.ent;if(ent)return ent;const fresh=SOCIAL.peers().find(p=>p.pid===e.peer.pid);if(fresh){e.peer=fresh;if(fresh.ent)return fresh.ent;if(fresh.p)return{p:fresh.p,dir:null}}return null}
    return GAME.ents.get(e.d.id)||null}
  const loadable=pl=>PLANETS[pl]&&!PLANETS[pl].mine;
  async function go(i){if(!list.length){render();return}idx=(i+list.length)%list.length;autoT=AUTO_S;const e=cur();render();SND.play('select',{vol:.5});
    if(e&&loadable(e.pl)&&GAME.G.id!==e.pl&&!loading){loading=true;ui.note.textContent=t('Der Planet wird gebaut …');try{await new Promise(r=>GAME.fadeOut?GAME.fadeOut(async()=>{await GAME._load(e.pl);r()}):GAME._load(e.pl).then(r))}catch(err){console.warn('Beamer-Planet',err)}loading=false;SOCIAL.refresh&&SOCIAL.refresh();GAME.setViewer(target,10,.78);render()}}
  /* ---------- Oberfläche ---------- */
  function build(){const root=el('div','beamer');root.setAttribute('data-beamer','');
    const top=el('div','bm-top');const plate=el('span','cw-plate',t('BEAMER // NUR ANSICHT'));const lcd=el('span','cw-lcd bm-clock','');const live=el('span','bm-live');
    const autoB=btn(t('Automatisch weiter'),'small chrome',()=>{auto=!auto;autoT=AUTO_S;autoB.setAttribute('aria-pressed',auto)});autoB.setAttribute('aria-pressed','false');
    const exit=btn(t('Beamer beenden'),'small danger',stop);top.append(plate,lcd,live,el('span','grow'),autoB,exit);
    const prev=el('button','bm-arrow prev');prev.type='button';prev.setAttribute('aria-label',t('Vorherige:r'));prev.innerHTML='<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';prev.onclick=()=>go(idx-1);
    const next=el('button','bm-arrow next');next.type='button';next.setAttribute('aria-label',t('Nächste:r'));next.innerHTML='<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';next.onclick=()=>go(idx+1);
    const card=el('aside','bm-card');const roster=el('div','bm-roster');roster.setAttribute('role','listbox');roster.setAttribute('aria-label',t('Klassenliste'));
    const note=el('p','bm-note');const empty=el('div','bm-empty');
    root.append(top,prev,next,card,roster,note,empty);$('world').append(root);
    return{root,lcd,live,card,roster,note,empty,prev,next}}
  function partName(slot,id){const p=findPart(slot,id);return p?p.n:id}
  function render(){if(!ui)return;const e=cur();ui.empty.hidden=!!list.length;ui.empty.textContent=t('Noch niemand online. Codes einschleusen oder warten, bis die Klasse spielt.');
    ui.prev.hidden=ui.next.hidden=list.length<2;
    /* Klassenliste */const key=list.map(x=>x.key+(x.pl||'')).join('|')+'#'+idx;if(key!==lastKey){lastKey=key;ui.roster.replaceChildren(...list.map((x,i)=>{const b=el('button','bm-chip');b.type='button';b.setAttribute('role','option');b.setAttribute('aria-current',i===idx);b.setAttribute('aria-selected',i===idx);
      const av=el('span','av');av.textContent=(x.d.name||'?').slice(0,1).toUpperCase();b.append(av,el('span','nm',x.d.name||x.nick),el('span','pl',x.live?(PLANETS[x.pl]?PLANETS[x.pl].n:''):t('Aus Code')));if(x.live)b.classList.add('live');b.onclick=()=>go(i);return b}));
      const sel=ui.roster.children[idx];if(sel)sel.scrollIntoView({block:'nearest',inline:'center'})}
    ui.live.textContent=list.filter(x=>x.live).length+' '+t('Live');
    /* Steckbrief */ui.card.replaceChildren();if(!e){ui.card.hidden=true;return}ui.card.hidden=false;const d=e.d;
    const head=el('div','bm-head');head.append(UI.creatureThumb(d),el('div',null));head.lastChild.append(el('h2',null,d.name||e.nick),el('p','sub',[d.group,e.live?e.nick:''].filter(Boolean).join(' · ')));
    ui.card.append(el('span','cw-plate',t('Steckbrief')),head);
    const sec=(title,body)=>{if(!body)return;const s=el('section');s.append(el('h3',null,title),body);ui.card.append(s)};
    sec(t('Planet'),el('p',null,(PLANETS[e.pl]?PLANETS[e.pl].n:(e.pl||'?'))+(e.inside?' · '+e.inside:'')));
    const ul=el('ul','bm-parts');[['kopf',d.parts.kopf],['augen',d.parts.augen],['arme',d.parts.arme],['beine',d.parts.beine],...(d.parts.extras||[]).map(x=>['extras',x])].forEach(([s,id])=>ul.append(el('li',null,partName(s,id))));sec(t('Teile'),ul);
    const abs=abilitiesFor(d).map(a=>ABIL[a]&&ABIL[a].n).filter(Boolean);if(abs.length){const ab=el('ul','bm-abs');abs.forEach(n=>ab.append(el('li',null,n)));sec(t('Fähigkeiten'),ab)}
    if(d.statement)sec(t('Aussage'),el('blockquote',null,d.statement));
    ui.note.textContent=e.live&&!loadable(e.pl)?(PLANETS[e.pl]?'':e.nick+': '+(e.pl||'')):''}
  function refresh(){const keep=cur()&&cur().key;list=entries();const j=list.findIndex(x=>x.key===keep);idx=j>=0?j:Math.min(idx,Math.max(0,list.length-1));render()}
  /* ---------- Schleife ---------- */
  function frame(dt){if(!on)return;refreshT-=dt;if(refreshT<=0){refreshT=1.5;refresh();if(ui)ui.lcd.textContent=GAMETIME.str()}
    if(auto&&list.length>1&&!loading){autoT-=dt;if(autoT<=0)go(idx+1)}}
  const kd=e=>{if(!on)return;if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;const k=e.key;
    if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();e.stopPropagation();go(idx-1)}
    else if(k==='ArrowRight'||k==='PageDown'||k===' '){e.preventDefault();e.stopPropagation();go(idx+1)}
    else if(k==='a'||k==='A'){e.stopPropagation();auto=!auto;autoT=AUTO_S;ui.root.querySelector('[aria-pressed]').setAttribute('aria-pressed',auto)}
    else if(k==='Escape'){e.preventDefault();e.stopPropagation();stop()}
    else if(['w','s','d','e','i','r','t','Tab','Enter','ArrowUp','ArrowDown'].includes(k)){e.stopPropagation();e.preventDefault()}};
  function start(){if(on)return;on=true;document.body.classList.add('beamer-on');ui=build();list=entries();idx=0;GAME.setViewer(target,10,.78);addEventListener('keydown',kd,true);render();if(list.length)go(0);
    setInterval(()=>frame(.25),250)}
  function stop(){/* Beamer verlassen: Seite neu laden, zurück zum Start (nichts wurde gespeichert) */try{sessionStorage.removeItem('cyborg-labor-start')}catch(e){}location.reload()}
  return{start,stop,get on(){return on}};
})();
