/* =====================================================================
   CYBORG-LABOR · i18n.js
   Mehrsprachigkeit. Das Spiel ist auf Deutsch geschrieben; dieses Modul
   übersetzt Texte live im DOM (Textknoten, placeholder, title, aria-label)
   und bietet I18N.t() für neuen Code. Japanische Zeichen bleiben als
   Sticker-Schmuck in jeder Sprache stehen.
   ===================================================================== */
const I18N=(()=>{
  /* nur Deutsch (Original) und Englisch (handübersetztes Sprachpaket lang/en.js) */
  const LANGS=[
    {id:'de',n:'Deutsch',jp:'ドイツ語'},
    {id:'en',n:'English',jp:'英語'}];
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
    'Neu anfangen':['Start over','Recommencer','Ricomincia','はじめから'],
    'Wirklich alles löschen? Nochmal klicken':['Delete everything? Click again','Tout effacer ? Clique encore','Cancellare tutto? Clicca di nuovo','ぜんぶ消す？もう一度押してね'],
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
  let lang=(()=>{try{const s=JSON.parse(localStorage.getItem('cyborg-labor-sprache')||'null');if(s)return LANGS.some(l=>l.id===s)?s:'en'}catch(e){}const full=navigator.language||'de',n=full.slice(0,2);return LANGS.some(l=>l.id===full)?full:LANGS.some(l=>l.id===n)?n:'de'})();
  /* ---------- Sprachpakete (lang/<id>.js): handübersetzte Texte und Vorlagen mit Platzhaltern ---------- */
  const PACK={},PACKRE={},CACHE={},UPI={};
  function addPack(l,p){PACK[l]=p;delete UPI[l];const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    PACKRE[l]=Object.keys(p.t||{}).map(k=>{const fixed=k.replace(/\{\d+\}/g,'');const src='^'+k.split(/(\{\d+\})/).map(x=>/^\{\d+\}$/.test(x)?'([\\s\\S]+?)':esc(x)).join('')+'$';
      const idx=(k.match(/\{(\d+)\}/g)||[]).map(x=>+x.slice(1,-1));return{re:new RegExp(src),out:p.t[k],idx,w:fixed.length}}).sort((a,b)=>b.w-a.w);
    CACHE[l]=new Map();if(l===lang)refresh()}
  const loading={};function loadPack(l){if(PACK[l]||loading[l]||l==='de')return;loading[l]=1;const sc=document.createElement('script');sc.src='lang/'+l+'.js';sc.onerror=()=>{loading[l]=0};document.head.append(sc)}
  function fromPack(l,s){const p=PACK[l];if(!p)return null;const c=CACHE[l];if(c.has(s))return c.get(s);let r=null;
    const core=s.trim();const pre=/^([^A-Za-zÄÖÜäöüß0-9„«»“(]{1,3}\s)(.+)$/.exec(core);if(core!==s&&core){const x=fromPack(l,core);r=x==null?null:s.replace(core,x)}
    else if(pre){const x=t(pre[2]);r=x===pre[2]?null:pre[1]+x}
    else if(p.s[s]!=null)r=p.s[s];
    else{for(const T of PACKRE[l]){const m=T.re.exec(s);if(!m)continue;r=T.out.replace(/\{(\d+)\}/g,(_,n)=>{const v=m[T.idx.indexOf(+n)+1];if(v==null)return'';if(!/[A-Za-zÄÖÜäöüß]{2}/.test(v))return v;const y=fromPack(l,v);return y==null?v:y});break}}
    /* Schilder in Grossbuchstaben («PFLANZEN»): über die normal geschriebene Form nachschlagen */
    if(r==null&&/[A-ZÄÖÜ]{2}/.test(s)&&s===s.toUpperCase()){let U=UPI[l];if(!U){U=UPI[l]=new Map();for(const k in p.s)U.set(k.toUpperCase(),p.s[k]);for(const k in D)if(D[k][0])U.set(k.toUpperCase(),D[k][0])}const y=U.get(core);if(y!=null)r=s.replace(core,y.toUpperCase())}
    /* zusammengesetzte Zeilen wie «Kompost-Planet · Klar»: Teile einzeln übersetzen */
    if(r==null&&s.includes(' · ')){const parts=s.split(' · ');let hit=false;const o=parts.map(x=>{const y=x.trim()?(D[x.trim()]&&D[x.trim()][0])||fromPack(l,x):null;if(y!=null&&y!==x){hit=true;return y}return x});if(hit)r=o.join(' · ')}
    if(c.size<20000)c.set(s,r);return r}
  /* nach neuem Paket oder neuer Sprache: DOM und Schild-Texturen neu übersetzen */
  let refT=0;function refresh(){clearTimeout(refT);refT=setTimeout(()=>{if(document.body)walk(document.body);listeners.forEach(f=>{try{f(lang,'refresh')}catch(e){}})},30)}
  function t(s){if(lang==='de'||s==null||typeof s!=='string')return s;const i=IDX[lang];if(i!=null){const e=D[s];if(e&&e[i])return e[i]}{const r=fromPack(lang,s);if(r!=null)return r}if(i!=null){for(const[re,tr]of PAT){if(re.test(s))return s.replace(re,tr[i])}}return s}
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
  /* Text auf Canvas-Texturen (Schilder, Bildschirme, Etiketten) geht ebenfalls durch t(); zu lange Übersetzungen werden schmaler gesetzt */
  (function patchCanvas(){const C=self.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;if(!C||C.__i18n)return;C.__i18n=1;
    for(const fn of['fillText','strokeText']){const orig=C[fn];C[fn]=function(text,x,y,maxW){if(lang!=='de'&&typeof text==='string'&&!(this.canvas&&this.canvas.__noI18n)){const tr=t(text);
      if(tr!==text){if(maxW==null){const w0=this.measureText(text).width,w1=this.measureText(tr).width;if(w1>w0*1.15&&w0>0)maxW=w0*1.15}text=tr}}return maxW==null?orig.call(this,text,x,y):orig.call(this,text,x,y,maxW)}}})();
  if(lang!=='de')loadPack(lang);
  function start(){applyDir();walk(document.body);mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS})}
  /* set() bei einem Klick aufrufen: der Chrome-Übersetzer darf sein Sprachpaket nur nach einer Nutzer-Aktion laden */
  function set(l){if(!LANGS.some(x=>x.id===l))return;lang=l;if(CACHE[l])CACHE[l].clear();loadPack(l);try{localStorage.setItem('cyborg-labor-sprache',JSON.stringify(l))}catch(e){}applyDir();walk(document.body);listeners.forEach(f=>{try{f(l)}catch(e){}})}
  /* Sprachwahl: zwei Knöpfe, Deutsch und English */
  function picker(onPick){const box=document.createElement('div');box.className='langpick';box.setAttribute('data-no-i18n','');
    const row=document.createElement('div');row.className='langs';row.setAttribute('role','group');row.setAttribute('aria-label','Sprache / Language');
    const mark=()=>row.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.lang===lang));
    for(const L of LANGS){const b=document.createElement('button');b.type='button';b.textContent=L.n;b.lang=L.id;b.onclick=()=>{set(L.id);mark();onPick&&onPick(L.id)};row.append(b)}
    box.append(row);mark();return box}
  const listeners=[];
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  return{t,set,picker,addPack,refresh,get lang(){return lang},get packs(){return Object.keys(PACK)},LANGS,on:f=>listeners.push(f),D}})();
