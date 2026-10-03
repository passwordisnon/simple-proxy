/* =====================================================================
   CYBORG-LABOR · i18n.js
   Mehrsprachigkeit. Das Spiel ist auf Deutsch geschrieben; dieses Modul
   übersetzt Texte live im DOM (Textknoten, placeholder, title, aria-label)
   und bietet I18N.t() für neuen Code. Japanische Zeichen bleiben als
   Sticker-Schmuck in jeder Sprache stehen.
   ===================================================================== */
const I18N=(()=>{
  const LANGS=[
    {id:'de',n:'Deutsch',jp:'ドイツ語'},
    {id:'en',n:'English',jp:'英語'},
    {id:'fr',n:'Français',jp:'フランス語'},
    {id:'it',n:'Italiano',jp:'イタリア語'},
    {id:'ja',n:'日本語',jp:'日本語',more:true}];
  /* alle weiteren Sprachen: maschinell übersetzt (Chrome-Übersetzer auf dem Gerät, sonst Claude) */
  const MORE=['sq','ar','hy','az','eu','be','bn','bs','bg','ca','zh','zh-Hant','hr','cs','da','nl','et','fi','gl','ka','el','gu','he','hi','hu','is','id','ga','kn','kk','km','ko','ku','lv','lt','lb','mk','ms','ml','mt','mr','mn','ne','no','fa','pl','pt','pa','ro','rm','ru','sr','si','sk','sl','so','es','sw','sv','tl','ta','te','th','ti','tr','uk','ur','uz','vi','cy','yo','zu'];
  const endo=id=>{try{return new Intl.DisplayNames([id],{type:'language'}).of(id)||id}catch(e){return id}};
  for(const id of MORE)LANGS.push({id,n:endo(id),more:true});
  const RTL=['ar','he','fa','ur','ku'];
  /* Wörterbuch: Deutsch → [en, fr, it, ja] */
  const D={
    /* Start & Menü */
    'Spielen':['Play','Jouer','Gioca','あそぶ'],
    'Beamer-Ansicht':['Projector view','Vue projecteur','Vista proiettore','プロジェクター'],
    'Sprache':['Language','Langue','Lingua','ことば'],
    'Weiter':['Continue','Continuer','Continua','つづける'],
    'Speichern':['Save','Sauvegarder','Salva','セーブ'],
    'Gespeichert':['Saved','Sauvegardé','Salvato','セーブしました'],
    'Zurück ins Labor':['Back to the lab','Retour au labo','Torna al laboratorio','ラボにもどる'],
    'Einstellungen':['Settings','Réglages','Impostazioni','せってい'],
    'Spiel verlassen':['Leave game','Quitter le jeu','Esci dal gioco','ゲームをやめる'],
    'Menü':['Menu','Menu','Menu','メニュー'],
    'Pause':['Pause','Pause','Pausa','ポーズ'],
    'Gute Nacht. Schlaf gut.':['Good night. Sleep well.','Bonne nuit. Dors bien.','Buona notte. Dormi bene.','おやすみ。ぐっすりね。'],
    'Für Schüler:innen':['For students','Pour les élèves','Per gli allievi','せいとむけ'],
    'Für die Lehrperson':['For the teacher','Pour l\'enseignant·e','Per l\'insegnante','せんせいむけ'],
    'Nur ansehen. Keine Figur, kein Einfluss auf das Spiel.':['View only. No character, no effect on the game.','Vue seule. Pas de personnage, aucun effet sur le jeu.','Solo visione. Nessun personaggio, nessun effetto sul gioco.','みるだけ。キャラなし、ゲームにえいきょうなし。'],
    'Bis bald!':['See you soon!','À bientôt !','A presto!','またね！'],
    'Du kannst dieses Fenster jetzt schliessen.':['You can close this window now.','Tu peux fermer cette fenêtre.','Ora puoi chiudere questa finestra.','このまどをとじてOKです。'],
    'Zurück zum Start':['Back to start','Retour au début','Torna all\'inizio','スタートにもどる'],
    /* Kopfzeile, HUD */
    'Labor':['Lab','Labo','Laboratorio','ラボ'],
    'Welt':['World','Monde','Mondo','せかい'],
    'Ton':['Sound','Son','Audio','おと'],
    'stumm':['muted','muet','muto','ミュート'],
    'Grafik hoch':['Graphics high','Graphismes hauts','Grafica alta','きれい'],
    'Grafik schnell':['Graphics fast','Graphismes rapides','Grafica veloce','はやい'],
    ' Ton':[' Sound',' Son',' Audio',' おと'],
    ' stumm':[' muted',' muet',' muto',' ミュート'],
    ' Grafik hoch':[' Graphics high',' Graphismes hauts',' Grafica alta',' きれい'],
    ' Grafik schnell':[' Graphics fast',' Graphismes rapides',' Grafica veloce',' はやい'],
    'Ton an/aus':['Sound on/off','Son on/off','Audio on/off','おと オン/オフ'],
    'Grafikqualität':['Graphics quality','Qualité graphique','Qualità grafica','グラフィック'],
    'Chat':['Chat','Chat','Chat','チャット'],
    'Cy-Phone':['Cy-Phone','Cy-Phone','Cy-Phone','サイフォン'],
    'Emotes':['Emotes','Émotes','Emote','エモート'],
    'Tasche':['Bag','Sac','Borsa','かばん'],
    'Aktion':['Action','Action','Azione','アクション'],
    'Alle':['All','Tous','Tutti','みんな'],
    'Freund:innen':['Friends','Ami·es','Amici','ともだち'],
    'Nachricht …':['Message …','Message …','Messaggio …','メッセージ …'],
    'Senden':['Send','Envoyer','Invia','おくる'],
    'Spielwelt':['Game world','Monde du jeu','Mondo di gioco','ゲームのせかい'],
    'Das Labor wärmt sich auf …':['The lab is warming up …','Le labo chauffe …','Il laboratorio si scalda …','ラボをじゅんびちゅう …'],
    'Der Planet wird gebaut …':['Building the planet …','Construction de la planète …','Costruzione del pianeta …','わくせいをつくっています …'],
    'Schliessen':['Close','Fermer','Chiudi','とじる'],
    /* Cy-Phone */
    'Lexikon':['Encyclopedia','Encyclopédie','Enciclopedia','ずかん'],
    'Tiere':['Animals','Animaux','Animali','どうぶつ'],
    'Reisen':['Travel','Voyager','Viaggiare','たび'],
    'Kleider':['Clothes','Vêtements','Vestiti','ふく'],
    'Designs':['Designs','Motifs','Disegni','デザイン'],
    'Hausbau':['House builder','Construction','Costruire casa','いえづくり'],
    'Jobs':['Jobs','Petits boulots','Lavori','しごと'],
    'Terraform':['Terraform','Terraformer','Terraformare','ちけい'],
    'Freunde':['Friends','Ami·es','Amici','ともだち'],
    'Karte':['Map','Carte','Mappa','ちず'],
    'Bewohner':['Residents','Habitant·es','Abitanti','じゅうにん'],
    'Klasse':['Class','Classe','Classe','クラス'],
    'Optionen':['Options','Options','Opzioni','オプション'],
    'Wegstecken':['Put away','Ranger','Metti via','しまう'],
    'Meine Designs':['My designs','Mes motifs','I miei disegni','わたしのデザイン'],
    'Neues Design':['New design','Nouveau motif','Nuovo disegno','あたらしいデザイン'],
    'Bewohner:innen':['Residents','Habitant·es','Abitanti','じゅうにん'],
    'Klasse & Codes':['Class & codes','Classe & codes','Classe e codici','クラスとコード'],
    'Beamer-Übersicht':['Projector overview','Vue d\'ensemble projecteur','Panoramica proiettore','プロジェクター'],
    'Übersicht beenden':['End overview','Quitter la vue','Esci dalla panoramica','もどる'],
    'Übersicht beenden (Esc)':['End overview (Esc)','Quitter la vue (Échap)','Esci (Esc)','もどる (Esc)'],
    'Codes einschleusen':['Import codes','Importer des codes','Importa codici','コードをいれる'],
    'Einschleusen':['Import','Importer','Importa','いれる'],
    'Welt sichern':['Back up world','Sauvegarder le monde','Salva il mondo','せかいをほぞん'],
    'Beispiele ausblenden':['Hide examples','Masquer les exemples','Nascondi esempi','れいをかくす'],
    'Beispiele zeigen':['Show examples','Afficher les exemples','Mostra esempi','れいをみせる'],
    'Alles kopieren':['Copy all','Tout copier','Copia tutto','ぜんぶコピー'],
    'Welt leeren':['Empty world','Vider le monde','Svuota il mondo','せかいをからに'],
    'Musik':['Music','Musique','Musica','おんがく'],
    'Geräusche':['Sounds','Bruitages','Suoni','こうかおん'],
    'Stimmen':['Voices','Voix','Voci','こえ'],
    'Dein Name':['Your name','Ton nom','Il tuo nome','なまえ'],
    'Spielstand zurücksetzen':['Reset save','Réinitialiser','Azzera salvataggio','セーブをけす'],
    'Wirklich alles löschen?':['Really delete everything?','Vraiment tout effacer ?','Cancellare davvero tutto?','ほんとうにぜんぶけす？'],
    'Los geht\'s':['Let\'s go','C\'est parti','Andiamo','いこう'],
    'Willkommen auf dem Kompost-Planeten!':['Welcome to the Compost Planet!','Bienvenue sur la planète Compost !','Benvenuti sul pianeta Compost!','コンポストわくせいへようこそ！'],
    'Wie sollen dich die anderen nennen? Der Name steht über deinem Cyborg und im Chat.':['What should the others call you? Your name appears above your cyborg and in the chat.','Comment les autres doivent-ils t\'appeler ? Ton nom s\'affiche au-dessus de ton cyborg et dans le chat.','Come ti chiameranno gli altri? Il nome appare sopra il tuo cyborg e nella chat.','みんなになんてよばれたい？なまえはサイボーグのうえとチャットにでるよ。'],
    /* Labor */
    'Körper':['Body','Corps','Corpo','からだ'],
    'Name des Cyborgs':['Cyborg name','Nom du cyborg','Nome del cyborg','サイボーグのなまえ'],
    'Gruppe':['Group','Groupe','Gruppo','グループ'],
    'Rumpfform':['Body shape','Forme du corps','Forma del corpo','からだのかたち'],
    'Grösse':['Size','Taille','Taglia','おおきさ'],
    'Haut':['Skin','Peau','Pelle','はだ'],
    'Hauptfarbe':['Main colour','Couleur principale','Colore principale','メインのいろ'],
    'Muster':['Pattern','Motif','Motivo','もよう'],
    'Musterfarbe':['Pattern colour','Couleur du motif','Colore del motivo','もようのいろ'],
    'Teile tauschen':['Swap parts','Changer les pièces','Cambia i pezzi','パーツこうかん'],
    'Farbe':['Colour','Couleur','Colore','いろ'],
    'Funktionen erfinden':['Invent functions','Inventer des fonctions','Inventa funzioni','きのうをかんがえる'],
    'In die Welt entlassen':['Release into the world','Lâcher dans le monde','Libera nel mondo','せかいへおくりだす'],
    'Zufall':['Random','Hasard','Casuale','ランダム'],
    'Neu':['New','Nouveau','Nuovo','あたらしく'],
    'Fertig – zurück zu Dr. Bolzen':['Done – back to Dr. Bolzen','Fini – retour chez Dr Bolzen','Fatto – torna dal Dr. Bolzen','できた – ボルツェンはかせのところへ'],
    'Ziehen zum Drehen · Mausrad zum Zoomen':['Drag to rotate · Scroll to zoom','Glisser pour tourner · Molette pour zoomer','Trascina per ruotare · Rotella per lo zoom','ドラッグでまわす · ホイールでズーム'],
    'Namenloser Cyborg':['Nameless cyborg','Cyborg sans nom','Cyborg senza nome','なまえのないサイボーグ'],
    '3D-Vorschau eures Cyborgs':['3D preview of your cyborg','Aperçu 3D de votre cyborg','Anteprima 3D del vostro cyborg','サイボーグの3Dプレビュー'],
    /* Beamer */
    'BEAMER // NUR ANSICHT':['PROJECTOR // VIEW ONLY','PROJECTEUR // VUE SEULE','PROIETTORE // SOLO VISIONE','プロジェクター // みるだけ'],
    'Klassenliste':['Class list','Liste de classe','Elenco classe','クラスめいぼ'],
    'Live':['Live','En direct','Live','ライブ'],
    'Automatisch weiter':['Auto advance','Défilement auto','Avanti automatico','じどうでつぎへ'],
    'Steckbrief':['Profile card','Fiche','Scheda','プロフィール'],
    'Zurück':['Back','Retour','Indietro','もどる'],
    'Vorherige:r':['Previous','Précédent·e','Precedente','まえ'],
    'Nächste:r':['Next','Suivant·e','Successivo','つぎ'],
    'Noch niemand online. Codes einschleusen oder warten, bis die Klasse spielt.':['Nobody online yet. Import codes or wait until the class is playing.','Personne en ligne. Importe des codes ou attends que la classe joue.','Ancora nessuno online. Importa codici o aspetta che la classe giochi.','まだだれもいません。コードをいれるか、クラスがあそぶのをまってね。'],
    'Fähigkeiten':['Abilities','Capacités','Abilità','のうりょく'],
    'Teile':['Parts','Pièces','Pezzi','パーツ'],
    'Aussage':['Statement','Déclaration','Dichiarazione','メッセージ'],
    'Planet':['Planet','Planète','Pianeta','わくせい'],
    'Beamer beenden':['Close projector view','Quitter le projecteur','Chiudi proiettore','プロジェクターをとじる'],
    'Weitere Sprachen':['More languages','Autres langues','Altre lingue','ほかのことば'],
    'Öffnen':['Open','Ouvrir','Apri','ひらく'],
    'Risslinge':['Glitchlings','Glitchouilles','Glitchini','リスリング'],
    'Aus Code':['From code','Depuis un code','Da codice','コードから'],
    'Klassen-Code':['Class code','Code de classe','Codice classe','クラスコード'],
  };
  const IDX={en:0,fr:1,it:2,ja:3};
  /* Muster für Texte mit Namen oder Zahlen */
  const PAT=[
    [/^Hallo (.+)!$/,['Hi $1!','Salut $1 !','Ciao $1!','こんにちは、$1！']],
    [/^Zu (.+) gebeamt$/,['Beamed to $1','Téléporté·e vers $1','Teletrasportato da $1','$1 のところへワープ']],
    [/^Karte · (.+)$/,['Map · $1','Carte · $1','Mappa · $1','ちず · $1']],
    [/^(\d+) eigene · (\d+) wohnen hier$/,['$1 own · $2 live here','$1 à toi · $2 habitent ici','$1 tuoi · $2 abitano qui','じぶん $1 · じゅうにん $2']],
  ];
  let lang=(()=>{try{const s=JSON.parse(localStorage.getItem('cyborg-labor-sprache')||'null');if(s)return s}catch(e){}const full=navigator.language||'de',n=full.slice(0,2);return LANGS.some(l=>l.id===full)?full:LANGS.some(l=>l.id===n)?n:'de'})();
  /* ---------- Maschinelle Übersetzung (für alles ohne Handübersetzung) ---------- */
  const MT={};const mtKey=l=>'cyborg-labor-mt-'+l;
  function mtLoad(l){if(MT[l])return MT[l];let m={};try{m=JSON.parse(localStorage.getItem(mtKey(l))||'{}')||{}}catch(e){}return MT[l]=m}
  let mtSaveT=0;function mtSave(l){clearTimeout(mtSaveT);mtSaveT=setTimeout(()=>{try{const m=MT[l];let js=JSON.stringify(m);if(js.length>1.5e6){const k=Object.keys(m);for(const x of k.slice(0,k.length/3))delete m[x];js=JSON.stringify(m)}localStorage.setItem(mtKey(l),js)}catch(e){}},800)}
  const queue=new Set();let flushT=0,engine=null,engineFor=null,engineName='';
  const worth=s=>s.length>1&&s.length<=400&&/[A-Za-zÄÖÜäöüß]{2}/.test(s);
  function want(s){if(!worth(s)||queue.size>400)return;queue.add(s);if(!flushT)flushT=setTimeout(flush,180)}
  async function getEngine(l){if(engineFor===l&&engine)return engine;engine=null;engineFor=l;engineName='';
    /* 1. Chrome: eingebauter Übersetzer, läuft auf dem Gerät (nichts verlässt den Computer) */
    try{if(self.Translator&&Translator.availability){const av=await Translator.availability({sourceLanguage:'de',targetLanguage:l});if(av&&av!=='unavailable'){const tr=await Translator.create({sourceLanguage:'de',targetLanguage:l});engineName='device';return engine={many:async list=>Promise.all(list.map(x=>tr.translate(x).catch(()=>null)))}}}}catch(e){}
    /* 2. Claude über die Artifact-Fähigkeit "sample" (fragt einmal um Erlaubnis) */
    try{if(window.claude&&claude.use){const sample=await claude.use('sample');if(sample){engineName='claude';const name=endo(l)+' ('+l+')';return engine={many:async list=>{const r=await sample.json('Translate each German string from a cozy, kid-friendly sci-fi life-sim game into '+name+'. Keep it short, friendly and natural for 10 to 14 year olds. Keep names, numbers, punctuation, line breaks and symbols unchanged; do not translate Japanese text. Return only a JSON array of strings with exactly '+list.length+' items, same order.\n'+JSON.stringify(list),{modelTier:'quick'});return Array.isArray(r)&&r.length===list.length?r:list.map(()=>null)}}}}}catch(e){}
    return null}
  async function flush(){flushT=0;const l=lang;if(l==='de'||!queue.size)return;const all=[...queue];queue.clear();const m=mtLoad(l);const todo=all.filter(x=>m[x]==null);if(!todo.length)return;
    const eng=await getEngine(l);if(!eng||l!==lang)return;
    for(let i=0;i<todo.length;i+=40){const part=todo.slice(i,i+40);let out=[];try{out=await eng.many(part)}catch(e){if(e&&(e.code==='not_granted'||e.code==='rate_limited')){engine=null;return}}
      part.forEach((x,j)=>{const y=out&&out[j];if(typeof y==='string'&&y.trim())m[x]=y});if(l!==lang)return}
    mtSave(l);walk(document.body)}
  function t(s){if(lang==='de'||s==null)return s;const i=IDX[lang];if(i!=null){const e=D[s];if(e&&e[i])return e[i];for(const[re,tr]of PAT){if(re.test(s))return s.replace(re,tr[i])}}
    const m=mtLoad(lang);if(m[s]!=null)return m[s];want(s);
    /* bis die Übersetzung da ist: Englisch, falls vorhanden */if(i==null){const e=D[s];if(e&&e[0])return e[0];for(const[re,tr]of PAT){if(re.test(s))return s.replace(re,tr[0])}}return s}
  /* ---------- DOM-Übersetzer ---------- */
  const ORIG=new WeakMap();const ATTRS=['placeholder','title','aria-label'];
  function trText(n){const raw=ORIG.has(n)?ORIG.get(n):n.nodeValue;const core=raw.trim();if(!core||core.length>400)return;const out=t(core);
    if(out!==core||ORIG.has(n)){if(!ORIG.has(n))ORIG.set(n,raw);const nv=raw.replace(core,out);if(n.nodeValue!==nv){WROTE.set(n,nv);n.nodeValue=nv}}}
  function trEl(e){for(const a of ATTRS){if(!e.hasAttribute||!e.hasAttribute(a))continue;const k='data-de-'+a;const raw=e.getAttribute(k)??e.getAttribute(a);const out=t(raw);if(out!==raw||e.hasAttribute(k)){if(!e.hasAttribute(k))e.setAttribute(k,raw);if(e.getAttribute(a)!==out)e.setAttribute(a,out)}}}
  function walk(root){if(root.nodeType===3){trText(root);return}if(root.nodeType!==1)return;if(root.closest&&root.closest('[data-no-i18n]'))return;trEl(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode:n=>n.nodeType===1&&(n.tagName==='SCRIPT'||n.tagName==='STYLE'||n.hasAttribute('data-no-i18n'))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while((n=w.nextNode())){if(n.nodeType===3)trText(n);else trEl(n)}}
  /* eigene Änderungen erkennen (Beobachter läuft verzögert): was wir geschrieben haben, wird übersprungen */
  const WROTE=new WeakMap();
  const mo=new MutationObserver(list=>{for(const m of list){const n=m.target;if(m.type==='characterData'){if(WROTE.get(n)===n.nodeValue)continue;ORIG.delete(n);WROTE.delete(n);trText(n)}
      else if(m.type==='attributes'){const a=m.attributeName,k='data-de-'+a;if(n.hasAttribute(k)){const cur=n.getAttribute(a);if(cur===t(n.getAttribute(k)))continue;n.removeAttribute(k)}trEl(n)}else m.addedNodes.forEach(walk)}});
  function applyDir(){document.documentElement.lang=lang;document.documentElement.toggleAttribute('data-rtl',RTL.includes(lang.split('-')[0]))}
  function start(){applyDir();walk(document.body);mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS})}
  /* set() bei einem Klick aufrufen: der Chrome-Übersetzer darf sein Sprachpaket nur nach einer Nutzer-Aktion laden */
  function set(l){if(!LANGS.some(x=>x.id===l))return;lang=l;try{localStorage.setItem('cyborg-labor-sprache',JSON.stringify(l))}catch(e){}applyDir();if(l!=='de'&&IDX[l]==null)getEngine(l).then(()=>{walk(document.body)});walk(document.body);listeners.forEach(f=>{try{f(l)}catch(e){}})}
  /* Sprachwahl: fünf schnelle Knöpfe und eine Liste mit allen weiteren Sprachen */
  function picker(onPick){const box=document.createElement('div');box.className='langpick';box.setAttribute('data-no-i18n','');
    const row=document.createElement('div');row.className='langs';row.setAttribute('role','group');row.setAttribute('aria-label','Sprache / Language / 言語');
    const sel=document.createElement('select');sel.setAttribute('aria-label','Weitere Sprachen / More languages');const o0=document.createElement('option');o0.value='';o0.textContent='+ '+(D['Weitere Sprachen']?t('Weitere Sprachen'):'Weitere Sprachen / More languages');sel.append(o0);
    for(const L of LANGS.filter(x=>x.more).sort((a,b)=>a.n.localeCompare(b.n))){const o=document.createElement('option');o.value=L.id;o.textContent=L.n;o.lang=L.id;sel.append(o)}
    const mark=()=>{row.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.lang===lang));sel.value=LANGS.find(x=>x.id===lang&&x.more)?lang:''};
    for(const L of LANGS.filter(x=>!x.more)){const b=document.createElement('button');b.type='button';b.textContent=L.n;b.lang=L.id;b.onclick=()=>{set(L.id);mark();onPick&&onPick(L.id)};row.append(b)}
    sel.onchange=()=>{if(sel.value){set(sel.value);mark();onPick&&onPick(sel.value)}};box.append(row,sel);mark();return box}
  const listeners=[];
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  return{t,set,picker,get lang(){return lang},get engine(){return engineName},LANGS,on:f=>listeners.push(f),D}})();
