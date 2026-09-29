/* =====================================================================
   CYBORG-LABOR · lang.js
   Fremde Sprachen wie in No Man's Sky: Jeder Planet (ausser dem Heimat-
   planeten) hat eine eigene Schrift und eigene Wörter. Schilder zeigen die
   Schrift; beim Lesen erscheinen bekannte Wörter übersetzt, der Rest bleibt
   Kauderwelsch. Wörter lernt man an Wortsteinen (Ruinen), im Gespräch und
   beim Lesen. Je mehr man versteht, desto freundlicher werden die
   Bewohner:innen.
   ===================================================================== */
const LANG=(()=>{
  /* Stil der Schrift je Planet: Strichart, Formen, Farben */
  const STYLE={
    schrott:{n:'Bitkantisch',ink:'#2E3A5A',glow:'#6FE3C8',kind:'circuit',syl:['zz','kt','vo','bit','ra','x','tek','lo','om','qi','ur','dex']},
    korallen:{n:'Perlmurmel',ink:'#1E5A78',glow:'#7FE6F0',kind:'wave',syl:['lu','ma','oo','ri','sha','ne','wa','pe','lo','ia','mu','se']},
    frost:{n:'Eisrunisch',ink:'#2D4A86',glow:'#BFE3FF',kind:'rune',syl:['kri','ss','ja','nor','fi','el','ska','tu','vi','un','hr','ae']},
    wueste:{n:'Sandglyphisch',ink:'#7A3E1E',glow:'#FFD27A',kind:'glyph',syl:['ka','ra','sut','ah','me','nu','tep','si','ol','za','mar','hu']},
    pilz:{n:'Sporisch',ink:'#5A2E6E',glow:'#C8A0FF',kind:'spore',syl:['mu','gl','ob','ze','fu','ng','ul','ee','po','sm','iv','ly']}};
  /* Grundwortschatz (Deutsch) – dieselben Wörter auf allen Planeten, aber mit eigener Übersetzung */
  const VOCAB=['hallo','willkommen','freund','danke','bitte','ja','nein','heute','sonne','wasser','essen','haus','laden','museum','rathaus','kunst','musik','pflanzen','tiere','rakete',
    'garage','bar','gut','schön','schlecht','müde','hunger','spielen','tanzen','fangen','fisch','käfer','stern','planet','welt','himmel','nacht','morgen','reise','geschenk',
    'kaufen','verkaufen','taler','neu','alt','gross','klein','bald','hier','dort','du','ich','wir','sein','haben','liebe','lachen','singen','malen','lesen'];
  const hs=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const has=pid=>!!STYLE[pid];
  /* fremdes Wort für ein deutsches Wort (stabil je Planet) */
  function alien(pid,w){const st=STYLE[pid];if(!st)return w;const r=srand(hs(pid+':'+w.toLowerCase())%2147483646+1);const n=1+Math.floor(r()*2)+(w.length>6?1:0);let o='';for(let i=0;i<n;i++)o+=st.syl[Math.floor(r()*st.syl.length)];if(r()<.3)o+="'"+st.syl[Math.floor(r()*st.syl.length)];return o}
  const WS=()=>{SAVE.words=SAVE.words||{};return SAVE.words};
  const known=pid=>WS()[pid]||(WS()[pid]=[]);
  const knows=(pid,w)=>!has(pid)||known(pid).includes(w.toLowerCase());
  function frac(pid){if(!has(pid))return 1;return known(pid).length/VOCAB.length}
  function learn(pid,w){if(!has(pid))return null;const k=known(pid);if(!w){const rest=VOCAB.filter(x=>!k.includes(x));if(!rest.length)return null;w=rest[Math.floor(Math.random()*rest.length)]}w=w.toLowerCase();if(k.includes(w))return null;k.push(w);persist();
    try{SND.jingle('j_success')}catch(e){}return w}
  /* Text in der Planetensprache: bekannte Wörter deutsch, unbekannte fremd (mit Schriftfarbe markiert, wenn html) */
  function garble(pid,text,html){if(!has(pid))return text;return String(text).replace(/[A-Za-zÄÖÜäöüß]+/g,m=>{const lw=m.toLowerCase();
      if(knows(pid,lw)&&VOCAB.includes(lw))return html?'<b class="lw">'+m+'</b>':m;
      /* kurze Füllwörter versteht man ab 30 % Sprachkenntnis */if(m.length<=3&&frac(pid)>.3)return m;
      const a=alien(pid,lw);const out=m[0]===m[0].toUpperCase()?a[0].toUpperCase()+a.slice(1):a;return html?'<i class="aw" style="color:'+STYLE[pid].ink+'">'+out+'</i>':out})}
  /* Freundlichkeits-Faktor: wer die Sprache spricht, wird schneller Freund:in */
  const bonus=pid=>has(pid)?.35+frac(pid)*1.25:1;

  /* ---------- Schrift zeichnen ---------- */
  function glyph(x,pid,ch,cx,cy,s){const st=STYLE[pid];const r=srand(hs(pid+ch)%2147483646+1);x.save();x.translate(cx,cy);x.lineCap='round';x.lineJoin='round';x.lineWidth=s*.13;x.strokeStyle=st.ink;x.fillStyle=st.ink;
    const R=()=>(r()-.5)*s*.8;
    if(st.kind==='circuit'){x.beginPath();let px=R(),py=-s*.4;x.moveTo(px,py);for(let i=0;i<3;i++){if(r()<.5)px=R();else py+=s*.28;x.lineTo(px,py)}x.stroke();x.beginPath();x.arc(px,py,s*.09,0,TAU);x.fill();if(r()<.6){x.beginPath();x.arc(R(),-s*.4,s*.07,0,TAU);x.fill()}}
    else if(st.kind==='wave'){x.beginPath();x.arc(0,0,s*(.25+r()*.15),r()*TAU,r()*TAU+PI*(1+r()));x.stroke();if(r()<.7){x.beginPath();x.moveTo(-s*.35,s*.3);x.quadraticCurveTo(0,s*(r()-.2),s*.35,s*.3);x.stroke()}x.beginPath();x.arc(R()*.6,-s*.35,s*.06,0,TAU);x.fill()}
    else if(st.kind==='rune'){x.beginPath();x.moveTo(0,-s*.45);x.lineTo(0,s*.45);x.stroke();for(let i=0;i<2;i++){const y=(r()-.5)*s*.7;x.beginPath();x.moveTo(0,y);x.lineTo((r()<.5?-1:1)*s*.3,y+(r()-.5)*s*.4);x.stroke()}}
    else if(st.kind==='glyph'){const k=Math.floor(r()*4);x.beginPath();if(k===0){x.ellipse(0,-s*.1,s*.2,s*.28,0,0,TAU)}else if(k===1){x.moveTo(-s*.3,s*.35);x.lineTo(0,-s*.4);x.lineTo(s*.3,s*.35)}else if(k===2){x.moveTo(-s*.3,-s*.3);x.lineTo(s*.3,-s*.3);x.moveTo(0,-s*.3);x.lineTo(0,s*.4)}else{x.arc(0,0,s*.3,PI,0)}x.stroke();x.beginPath();x.moveTo(-s*.35,s*.42);x.lineTo(s*.35,s*.42);x.stroke()}
    else{/* spore */for(let i=0;i<3;i++){x.beginPath();x.arc(R()*.8,R()*.8,s*(.07+r()*.1),0,TAU);i===0?x.stroke():x.fill()}x.beginPath();x.moveTo(R()*.6,-s*.4);x.bezierCurveTo(R(),0,R(),0,R()*.6,s*.4);x.stroke()}
    x.restore()}
  /* Schild-Textur: Planetenschrift in eigener Farbe (Kompost: normale Schrift) */
  function signTex(pid,key,text,o){o=o||{};if(!has(pid))return null;const st=STYLE[pid];return ctex('lang-'+pid+'-'+key,512,Math.round(512*(o.h||.28)),(x,w,h)=>{
      x.fillStyle=o.bg||'#FFFBF0';x.fillRect(0,0,w,h);x.strokeStyle=st.ink;x.lineWidth=h*.05;x.strokeRect(h*.06,h*.06,w-h*.12,h-h*.12);
      const words=String(text).toLowerCase().split(/[^a-zäöüß]+/).filter(Boolean);const chars=words.map(wd=>alien(pid,wd).replace(/'/g,''));const n=chars.reduce((a,c)=>a+Math.min(4,c.length)+1,0);const s=Math.min(h*.55,(w*.86)/Math.max(1,n));
      let cx=w/2-(n*s)/2+s/2;for(const c of chars){for(let i=0;i<Math.min(4,c.length);i++){glyph(x,pid,c.slice(i,i+2)+i,cx,h/2,s*.92);cx+=s}cx+=s}})}
  /* Lese-Dialog */
  async function read(pid,text,title){const html=garble(pid,text,true);const k=known(pid).length;
    await UI.talk(title||'Schild',[(has(pid)?html:text)+(has(pid)?'<span class="langnote">'+STYLE[pid].n+' · '+k+'/'+VOCAB.length+' Wörter bekannt</span>':'')],{color:has(pid)?STYLE[pid].ink:'#8A5A44',html:true,voice:{kind:'sanft',pitch:220}});
    /* Beim Lesen manchmal ein Wort aus dem Zusammenhang erschliessen */
    if(has(pid)&&Math.random()<.35){const ws=String(text).toLowerCase().split(/[^a-zäöüß]+/).filter(w=>VOCAB.includes(w)&&!knows(pid,w));if(ws.length){const w=learn(pid,ws[0]);if(w)UI.toast('Aus dem Zusammenhang erschlossen: «'+alien(pid,w)+'» = '+w,3200)}}}
  /* Wortstein: fremde Ruine, die ein neues Wort beibringt */
  async function stone(pid,st){if(!has(pid))return;if(st.used){UI.toast('Diesen Wortstein hast du schon entziffert.');return}const w=learn(pid);st.used=true;const S2=SAVE.stones=SAVE.stones||{};S2[st.id]=1;persist();
    if(!w){await UI.talk('Wortstein',['Du kennst schon alle Wörter von '+STYLE[pid].n+'!'],{color:STYLE[pid].ink});return}
    await UI.talk('Wortstein',['Die Zeichen glühen auf … Du verstehst ein neues Wort!','<b class="lw">'+alien(pid,w)+'</b> bedeutet <b>'+w+'</b>.','('+known(pid).length+'/'+VOCAB.length+' Wörter '+STYLE[pid].n+'. Je mehr du verstehst, desto freundlicher werden die Leute hier.)'],{color:STYLE[pid].ink,html:true,voice:{kind:'hall',pitch:160}})}
  /* Modell eines Wortsteins: Steinsäule mit glühender Glyphentafel */
  function stoneModel(pid,m){const st=STYLE[pid];const g=new THREE.Group();const r=srand(hs(pid)%9999+1);
    P(g,G.bx(1.3,.3,1.3,.08),m.c('#9C95AE'),[0,.15,0]);const col=P(g,G.bx(.8,2.1,.5,.1),m.c(pid==='korallen'?'#E8C8B0':pid==='frost'?'#C8D8F0':pid==='wueste'?'#E0B888':pid==='pilz'?'#A890C8':'#8C93A8'),[0,1.3,0]);col.rotation.z=(r()-.5)*.12;
    P(g,G.bx(1.05,.22,.7,.06),m.c('#7D7690'),[0,2.4,0]);
    const tx=ctex('stone-'+pid,128,256,(x,w,h)=>{x.fillStyle='rgba(0,0,0,0)';x.clearRect(0,0,w,h);for(let i=0;i<4;i++)glyph(x,pid,'st'+i,w/2,30+i*58,48)});
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(.6,1.3),new THREE.MeshBasicMaterial({map:tx,transparent:true,color:st.glow,toneMapped:false,depthWrite:false}));pl.position.set(0,1.35,.26);pl.userData.noOutline=true;g.add(pl);const pl2=pl.clone();pl2.position.z=-.26;pl2.rotation.y=PI;g.add(pl2);
    const halo=P(g,G.s(.08),m.glow(st.glow,2),[0,2.7,0]);g.userData.tick=t=>{pl.material.opacity=.6+.4*Math.sin(t*2);/* pl2 teilt das Material */halo.position.y=2.7+Math.sin(t*1.5)*.08};return g}
  return{STYLE,VOCAB,has,alien,garble,frac,learn,known,knows,bonus,signTex,read,stone,stoneModel,glyph}
})();
