/* =====================================================================
   CYBORG-LABOR · data.js
   Beispiel-Cyborgs, Prüfung/Codes, Spielstand, Planeten, Dialoge.
   ===================================================================== */
const SLOTS=[{key:'kopf',label:'Kopf'},{key:'augen',label:'Augen'},{key:'arme',label:'Arme'},{key:'beine',label:'Beine'},{key:'extras',label:'Extras',multi:4}];
const BOUNDARIES=['Mensch / Tier','Organismus / Maschine','physisch / nichtphysisch','Natur / Kultur','öffentlich / privat','männlich / weiblich','Selbst / Andere','Geist / Körper'];
const MAXX=4;
const EXAMPLES=[
 {id:'bsp-kevin',example:true,name:'Kompost-Kevin',group:'Beispiel',createdAt:1,body:{seg:2,size:1.05,skin:'chrom',color:0,shape:'kiste'},
  parts:{kopf:'monitor',augen:'emoji',arme:'industrie',beine:'kette',extras:['fernsteuer','server','pilz']},
  info:{kopf:{name:'Fernseh-Gesicht',func:'Zeigt das Gesicht der Person, die ihn gerade fernsteuert.',forWhom:'Haushalte mit Abo',boundary:'öffentlich / privat',maker:'Operator:innen in einem Büro auf einem anderen Kontinent'},
   arme:{name:'Spülmaschinen-Arm',func:'Räumt in fünf Minuten drei Teller ein.',forWhom:'Leute ohne Zeit',boundary:'Organismus / Maschine',maker:'Fabrik plus unsichtbare Handarbeit'},
   'x-fernsteuer':{name:'Blaue Ohren',func:'Leuchten, wenn ein Mensch drinsteckt.',forWhom:'Die Besitzer:innen, als Warnung',boundary:'Organismus / Maschine',maker:'Operator:innen'},
   'x-pilz':{name:'Kühlkörper-Pilz',func:'Wohnt im warmen Server und frisst Staub.',forWhom:'Den Pilz',boundary:'Natur / Kultur',maker:'Wächst von selbst',other:true}},
  statement:'Unsere Grenze war öffentlich / privat. Wir sind für sie verantwortlich, weil wir den Fremden selbst in die Küche bestellt haben.'},
 {id:'bsp-monarch',example:true,name:'Monarch-Mia',group:'Beispiel',createdAt:2,body:{seg:2,size:.95,skin:'pluesch',color:8,shape:'ei',pattern:'punkte',color2:16},
  parts:{kopf:'bluete',augen:'kuller',arme:'fluegel',beine:'flamingo',extras:['falter','herz']},
  info:{arme:{name:'UV-Flügel',func:'Leuchten ultraviolett, damit Falter den Weg zu Futterpflanzen finden.',forWhom:'Monarchfalter',boundary:'Mensch / Tier',maker:'Gezüchtet aus Falterschuppen',other:true},
   kopf:{name:'Nektarkopf',func:'Liefert Nektar auf Wanderungen.',forWhom:'Falter und Bienen',boundary:'Natur / Kultur',maker:'Gemeinschaftsgarten',other:true},
   'x-herz':{name:'Glasherz',func:'Alle sehen, wann sie Angst hat.',forWhom:'Die anderen in der Gruppe',boundary:'physisch / nichtphysisch',maker:'Glasbläserei'},
   haut:{name:'Pflaster-Haut',func:'Wächst nach, wo sie verletzt wurde, manchmal doppelt.',forWhom:'Sie selbst',boundary:'Organismus / Maschine',maker:'Stammzellen-Labor'}},
  statement:'Unsere Grenze war Mensch / Tier. Wir sind für sie verantwortlich, weil wir sie gewählt haben und nicht geerbt.'},
 {id:'bsp-seismo',example:true,name:'Seismo-Salamander',group:'Beispiel',createdAt:3,body:{seg:3,size:1.0,skin:'fell',color:15,shape:'kapsel',pattern:'bauch',color2:16},
  parts:{kopf:'axolotl',augen:'facetten',arme:'tentakel',beine:'schwanz',extras:['solar','biolumineszenz']},
  info:{kopf:{name:'Kiemenkopf',func:'Atmet unter Wasser und riecht Erdbeben.',forWhom:'Alle, die nahe am Meer wohnen',boundary:'Mensch / Tier',maker:'Nachgewachsen nach einer Verletzung'},
   beine:{name:'Seismo-Schwanz',func:'Spürt jedes Beben ab Stärke 1 und tanzt dann.',forWhom:'Die Erde als Choreografin',boundary:'physisch / nichtphysisch',maker:'Eigenbau'},
   'x-solar':{name:'Sonnenrücken',func:'Lädt tagsüber und wärmt nachts Frösche.',forWhom:'Frösche',boundary:'Natur / Kultur',maker:'Siliziumzelle aus einer Fabrik in Asien',other:true},
   haut:{name:'Moospelz',func:'Filtert Feinstaub aus der Luft.',forWhom:'Die Stadt',boundary:'Natur / Kultur',maker:'Wächst selbst'}},
  statement:'Unsere Grenze war physisch / nichtphysisch. Wir sind für sie verantwortlich, weil wir Beben spüren wollen, die wir nicht verursacht haben.'},
 {id:'bsp-rolli',example:true,name:'Rolli Rakete',group:'Beispiel',createdAt:4,body:{seg:1,size:1.1,skin:'schuppen',color:13,shape:'kugel',pattern:'tiger',color2:11},
  parts:{kopf:'raumhelm',augen:'visier',arme:'prothese',beine:'rollstuhl',extras:['jetpack','hoergeraet','antennen']},
  info:{beine:{name:'Geländerollstuhl',func:'Fährt Treppen hoch und macht Rampen überflüssig.',forWhom:'Alle, die nicht laufen wollen oder können',boundary:'Organismus / Maschine',maker:'Selbsthilfe-Werkstatt'},
   arme:{name:'Greifhand',func:'Fühlt Wärme und warnt vor heissen Tassen.',forWhom:'Rolli selbst',boundary:'Organismus / Maschine',maker:'Orthopädie-Technik, Carbon'},
   'x-hoergeraet':{name:'Dolmetsch-Ohren',func:'Übersetzt Vogelrufe in Untertitel.',forWhom:'Vögel und Rolli',boundary:'Mensch / Tier',maker:'Open-Source-Community',other:true},
   'x-jetpack':{name:'Notfall-Düse',func:'Für den Fall, dass der Lift wieder kaputt ist.',forWhom:'Rolli',boundary:'physisch / nichtphysisch',maker:'Bastelkeller'}},
  statement:'Unsere Grenze war Organismus / Maschine. Wir sind für sie verantwortlich, weil wir entscheiden, ob Technik hilft oder normiert.'}
];

/* ---------- Cyborg-Daten ---------- */
const DEFAULT=()=>({v:2,name:'',group:'',body:{seg:2,size:1,skin:'fell',color:9,shape:'ei',pattern:'bauch',color2:16},parts:{kopf:'axolotl',augen:'zwei',arme:'greifarm',beine:'knick',extras:['herz']},info:{},statement:''});
const str=(x,n)=>(typeof x==='string'?x:'').replace(/[\u0000-\u001f​-‏‪-‮]/g,'').slice(0,n);
function sanitize(d){
  const o=DEFAULT();if(!d||typeof d!=='object')return o;
  o.name=str(d.name,40);o.group=str(d.group,40);o.statement=str(d.statement,400);
  if(d.id)o.id=str(d.id,24).replace(/[^A-Za-z0-9_-]/g,'');
  o.createdAt=typeof d.createdAt==='number'?d.createdAt:Date.now();if(d.example)o.example=true;
  const b=d.body||{};o.body.seg=1;/* nur noch ein Rumpf aus einem Guss */o.body.size=Math.min(1.3,Math.max(.8,+b.size||1));
  o.body.skin=SKINS.some(s=>s.id===b.skin)?b.skin:'haut';o.body.color=Number.isInteger(b.color)&&b.color>=0&&b.color<SKIN_COLORS.length?b.color:0;
  o.body.shape=TORSOS.some(t=>t.id===b.shape)?b.shape:'ei';o.body.pattern=PATTERNS.some(t=>t.id===b.pattern)?b.pattern:'keine';o.body.color2=Number.isInteger(b.color2)&&b.color2>=0&&b.color2<SKIN_COLORS.length?b.color2:16;
  const p=d.parts||{};for(const s of ['kopf','augen','arme','beine'])o.parts[s]=findPart(s,p[s])?p[s]:o.parts[s];
  o.clothes=typeof CLOTHES!=='undefined'?CLOTHES.sanitize(d.clothes):null;if(!o.clothes)delete o.clothes;
  o.tint={};{const t=d.tint||{};for(const k of TINT_SLOTS)if(Number.isInteger(t[k])&&t[k]>=0&&t[k]<SKIN_COLORS.length)o.tint[k]=t[k]}
  o.parts.extras=Array.isArray(p.extras)?[...new Set(p.extras.filter(x=>findPart('extras',x)))].slice(0,MAXX):[];
  o.info={};const inf=d.info||{};
  for(const k of Object.keys(inf).slice(0,14)){if(!/^(kopf|augen|arme|beine|haut|x-[a-z]+)$/.test(k))continue;const v=inf[k]||{};
    o.info[k]={name:str(v.name,40),func:str(v.func,200),forWhom:str(v.forWhom,80),boundary:BOUNDARIES.includes(v.boundary)?v.boundary:'',maker:str(v.maker,120),other:!!v.other}}
  return o;
}
function abOfKey(d,k){if(k==='haut')return null;if(k.startsWith('x-'))return ABMAP.extras[k.slice(2)]||null;return ABMAP[k]?ABMAP[k][d.parts[k]]||null:null}
function activeKeys(d){const out=[];const p=d.parts;
  for(const s of ['kopf','augen','arme','beine']){const part=findPart(s,p[s]);if(part&&part.k!=='none')out.push({key:s,label:part.n,kind:part.k})}
  for(const x of p.extras||[]){const part=findPart('extras',x);if(part)out.push({key:'x-'+x,label:part.n,kind:part.k})}
  const sk=SKINS.find(k=>k.id===d.body.skin)||SKINS[0];out.push({key:'haut',label:'Haut: '+sk.n,kind:sk.k});return out}

/* ---------- Codes ---------- */
function toB64(s){const b=new TextEncoder().encode(s);let bin='';b.forEach(x=>bin+=String.fromCharCode(x));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function fromB64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))}
function slim(d){const o={v:2,id:d.id,name:d.name,group:d.group,createdAt:d.createdAt,body:d.body,parts:d.parts,statement:d.statement,info:{}};for(const a of activeKeys(d)){const i=d.info[a.key];if(i&&(i.func||i.name||i.forWhom||i.maker||i.boundary||i.other))o.info[a.key]=i}return o}
/* ganz knapp: nur Aussehen (für Online-Präsenz) */
function looks(d){return{b:[d.body.seg,+d.body.size.toFixed(2),d.body.skin,d.body.color,d.body.shape,d.body.pattern||'keine',d.body.color2??16],p:[d.parts.kopf,d.parts.augen,d.parts.arme,d.parts.beine,...(d.parts.extras||[])],...(d.tint&&Object.keys(d.tint).length?{t:TINT_SLOTS.map(k=>d.tint[k]??-1)}:{}),...(d.clothes?{cl:d.clothes}:{})}}
function fromLooks(l,name){try{const[seg,size,skin,color,shape,pattern,color2]=l.b;const[kopf,augen,arme,beine,...extras]=l.p;const tint={};if(Array.isArray(l.t))TINT_SLOTS.forEach((k,i)=>{if(l.t[i]>=0)tint[k]=l.t[i]});return sanitize({name,body:{seg,size,skin,color,shape,pattern,color2},parts:{kopf,augen,arme,beine,extras},tint,clothes:l.cl})}catch(e){return null}}
const encode=d=>'CYB2.'+toB64(JSON.stringify(slim(d)));
const rid=()=>Math.random().toString(36).slice(2,10);
function decodeAll(text){const out=[];const re=/CYB[12]\.([A-Za-z0-9_-]+)/g;let m;while((m=re.exec(text))){try{const d=sanitize(JSON.parse(fromB64(m[1])));if(!d.id)d.id=rid();out.push(d)}catch(e){}}return out}
/* Kunst-Codes: 32×32 Pixel, 16 Farben */
function encodeArt(a){return 'ART1.'+toB64(JSON.stringify({n:a.name,by:a.by||'',pal:a.pal,px:a.px}))}
function decodeArt(text){const out=[];const re=/ART1\.([A-Za-z0-9_-]+)/g;let m;while((m=re.exec(text))){try{const o=JSON.parse(fromB64(m[1]));const a=sanitizeArt({name:o.n,by:o.by,pal:o.pal,px:o.px});if(a)out.push(a)}catch(e){}}return out}
function sanitizeArt(a){if(!a||typeof a.px!=='string'||a.px.length!==1024||!/^[0-9a-f]+$/.test(a.px))return null;if(!Array.isArray(a.pal)||a.pal.length!==16)return null;
  const pal=a.pal.map(c=>/^#[0-9a-fA-F]{6}$/.test(c)?c:'#ffffff');return{id:a.id||('art-'+hashStr(a.px+pal.join(''))),name:str(a.name,32)||'Ohne Titel',by:str(a.by,32),pal,px:a.px,at:a.at||Date.now()}}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}

/* ---------- Speicher ---------- */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const SAVE_KEY='cyborg-labor-spiel-v3';
function newSave(){return{v:3,pid:'p'+rid()+rid(),nick:'',money:800,bag:[],tools:{angel:true,netz:true,schaufel:true},
  caught:{fish:{},bugs:{},relics:{}},donated:{fish:[],bugs:[],relics:[],art:[]},designs:[],
  house:{built:true,style:{shape:'spitz',wall:'holz',wallCol:'#FFE3B8',roofCol:'#F0556E',doorCol:'#7FB2E0',win:'rund',chimney:true,fence:true,size:1,flag:true},
    room:{wall:'streifen',floor:'dielen',items:[{id:'holzbett',x:-3,z:-2,rot:0},{id:'stehlampe',x:3,z:-2.5,rot:0},{id:'teppich_rund',x:0,z:0,rot:0},{id:'haraway_poster',x:0,z:0,rot:0}]}},
  friends:[],friendship:{},seen:{},stats:{fish:0,bugs:0,relics:0,shakes:0,dances:0,talks:0},day:0,planet:'kompost',avatar:null,lastPos:null}}
let SAVE=Object.assign(newSave(),LS.get(SAVE_KEY,{}));if(!SAVE.caught)SAVE.caught={fish:{},bugs:{},relics:{}};
let saveT=0;function persist(){if(window.__viewer)return;/* Beamer-Ansicht speichert nichts */clearTimeout(saveT);saveT=setTimeout(()=>{saveT=0;LS.set(SAVE_KEY,SAVE)},500)}
/* beim Schliessen/Neuladen sofort speichern (sonst gehen die letzten Sekunden verloren) */
addEventListener('pagehide',()=>{if(saveT){clearTimeout(saveT);saveT=0;LS.set(SAVE_KEY,SAVE)}});
function bagAdd(kind,id,n){n=n||1;if(bagCount()>=40)return false;const e=SAVE.bag.find(x=>x.kind===kind&&x.id===id);if(e)e.n+=n;else SAVE.bag.push({kind,id,n});persist();return true}
function bagTake(kind,id,n){n=n||1;const e=SAVE.bag.find(x=>x.kind===kind&&x.id===id);if(!e||e.n<n)return false;e.n-=n;if(e.n<=0)SAVE.bag.splice(SAVE.bag.indexOf(e),1);persist();return true}
function bagCount(){return SAVE.bag.reduce((a,x)=>a+x.n,0)}
function money(delta){SAVE.money=Math.max(0,SAVE.money+delta);persist();UI&&UI.hud&&UI.hud()}

/* ---------- Dialoge der Bewohner:innen ---------- */
const TALK={
  hello:['Oh, hallo {p}!','Na, {p}? Schön dich zu sehen!','Hey {p}! Ich hab dich schon von weitem erkannt.','{p}! Genau dich wollte ich treffen.','Grüezi {p}!'],
  part:['Weisst du, was mein Teil «{part}» kann? {func}','Mein {part} ist gebaut für {whom}. Ziemlich praktisch, oder?','Manchmal frag ich mich: Ist mein {part} noch Werkzeug oder schon ich?','{func} Das mach ich mit meinem {part}.'],
  boundary:['Meine Grenze war {b}. Ich verwische sie jeden Tag ein bisschen mehr.','Hast du auch eine Grenze gewählt? Meine war {b}.'],
  small:['Heute ist perfektes Angelwetter!','Ich hab gehört, im Museum gibt es neue Bilder.','Hast du schon den Kiosk besucht? Da gibt es neue Möbel.','Wenn du Bäume schüttelst, fällt manchmal Obst runter. Und manchmal Wespen.',
    'Ich sammle Muscheln am Strand. Die klingen wie das Meer.','Mein Akku ist halb voll. Oder halb leer?','Kompost ist einfach Zukunft, die noch verdaut wird.','Wusstest du, dass Moos Feinstaub frisst?',
    'Ich übe gerade einen neuen Tanz. Willst du sehen?','Die Rakete fliegt zum Schrott-Mond. Da gibt es glühende Pilze!','Make kin, not babies. Hat mal jemand gesagt.','Ich hab eine Wurzel gefunden, die aussieht wie ein USB-Stecker.'],
  gift:['Oh! Für mich? Danke dir von ganzem Herzen!','Wow, genau so was hab ich gesucht!','Das stell ich mir ins Regal. Danke!'],
  giveback:['Hier, nimm das als Dankeschön!','Ich hab da noch was für dich.'],
  bye:['Bis bald!','Mach\'s gut, {p}!','Tschüss, ich geh noch ein bisschen kompostieren.']
};
const BOT_NAMES=['Lena_07','Kiemenkönig','mo.dem','Pilz-Paul','xX_Moosi_Xx','Nova','Tentakel-Tina','Schraubi','Flauschmaschine','Jo','Kabelsalat','Mira*','Sonnenzelle','ByteBiene','Luca_K','Axolotl-Anna','Roboterfreundin','Qwertz'];
const BOT_CHAT={
  hello:['hallo zusammen!','hiii','moin','na, alle am angeln?','hey leute'],
  fish:['hab grad nen {f} gefangen lol','wo gibts den {f}?','der {f} ist so selten omg','angeln ist mein leben'],
  general:['wer kommt tanzen auf den dorfplatz?','mein haus hat jetzt ne pilzlampe','kiosk hat heute neue tapeten','hat jemand noch kirschen?','museum ist voll schön geworden',
    'schrott-mond ist nachts so hübsch','ich bau mir nen cyborg mit 4 flügeln','kompost > alles','wer will tauschen?','die rakete ist mega','gleich pause, bis später','ich hab ne floppy-disk ausgegraben xD'],
  react:['haha','cool!','nice','ja voll','stimmt','omg ja','lol','krass','hihi']
};
