/* =====================================================================
   CYBORG-LABOR · diary.js · Tagebuch der früheren Schläfer:innen
   Vor dir haben schon andere in Kokon geschlafen: die Gruppen von
   Kokon 95 und Kokon 97. Ihre Spuren liegen in den Ruinen.
   · Unter jedem ersten Wortstein eines Planeten steht eine Tagebuchzeile.
   · Neben der ersten Ruine liegt eine zerbrochene Schlafkapsel.
   · Im Cy-Phone (App «Tagebuch») und im Glitch-Kern liest man alles.
   ===================================================================== */
const DIARY=(()=>{
  /* [Kokon-Jahrgang, Tag, Zeile] je Planet */
  const LINES={
    kompost:[95,2,'Heute habe ich mit einem Wurm geredet. Er hat nicht geantwortet, aber er hat genickt. Glaube ich.'],
    schrott:[95,5,'Auf dem Schrott-Mond repariert jemand jeden Tag denselben Toaster. Ich habe ihm geholfen. Morgen ist er wieder kaputt.'],
    korallen:[95,9,'Die Korallen leuchten nachts. Ich habe ihnen ein Lied vorgesummt, und sie haben zurückgeblinkt.'],
    frost:[95,14,'Im Schnee sieht man jede Spur. Meine sind die einzigen, die nicht vom Wind verweht werden.'],
    wueste:[95,20,'In der Oase habe ich Wasser getrunken, das nach Erdbeere schmeckt. Niemand hier wundert sich darüber.'],
    pilz:[95,27,'Unter dem Sporen-Mond sind alle Pilze verbunden. Wenn einer lacht, kichern alle anderen mit.'],
    urzeit:[95,33,'Ein Dino hat mich angeschaut, als würde er mich kennen. Vielleicht habe ich ihn als Kind gemalt.'],
    dschungel:[95,41,'Die Tempel hier sind keine Ruinen. Es sind alte Server. Unter dem Moos blinkt noch ein Licht.'],
    metro:[95,48,'In der Metro-Stadt hört man um 23:59 alle Uhren gleichzeitig ticken. Dann ist es kurz ganz still.'],
    klang:[95,55,'Die Harfenbäume spielen eine Melodie, die ich aus dem Radio kenne. Aus welchem Jahr? Ich weiss es nicht mehr.'],
    bibliothek:[95,61,'In der Bibliothek gibt es ein Buch über mich. Die letzte Seite ist leer.'],
    riesengarten:[95,70,'Hier bin ich so klein wie ein Marienkäfer. Komisch: Ich fühle mich trotzdem nicht klein.'],
    wolkenarchipel:[95,78,'Von den Wolkeninseln aus sieht man, dass die Sterne Muster bilden. Es sind Zahlen. 2-3-5-9.'],
    uhrwerk:[95,90,'Die Wächter des Uhrwerk-Monds bewegen sich nur, wenn man sie aufzieht. So wie wir, denke ich manchmal.'],
    pluesch:[95,99,'Ich habe ein Kuscheltier gefunden, das aussieht wie meins von früher. Ich habe es dagelassen. Es wartet auf jemand anderen.'],
    bernstein:[95,104,'Im Bernstein steckt eine Kassette. Darauf steht mein Name. Ich traue mich nicht, sie anzuhören.'],
    dinofabrik:[95,108,'Die Fabrik stellt Dinos her, die niemand kauft. Das Fliessband hört trotzdem nie auf. Wie ein Herzschlag.'],
    neonarkade:[95,111,'Auf der Highscore-Tafel steht ganz oben NEM. Wer ist NEM? Vielleicht NEMURI selbst.'],
    kaufhaus:[97,1,'Kokon 97, Tag 1. Ich habe das Tagebuch von Kokon 95 gefunden. Jemand war schon hier. Ich bin nicht allein.'],
    funkturm:[97,7,'Der Funkturm empfängt eine Nachricht, immer dieselbe: «Seid freundlich zueinander. Wir kommen bald.»'],
    magnetbahn:[97,12,'Die Magnetbahn fährt im Kreis. Ich bin drei Runden mitgefahren und habe dabei einen ganzen Tag verschlafen.'],
    rechenzentrum:[97,18,'Im Rechenzentrum ist eine Datei namens SCHLAEFER.TXT. Darin stehen viele Namen. Meiner steht ganz unten.'],
    tiefsee:[97,24,'Ganz unten in der Tiefsee ist es nicht dunkel. Dort leuchten alle selbst. Ich möchte das auch lernen.'],
    wetterwerk:[97,33,'Ich habe an der Wettermaschine Regen gemacht. Alle haben sich gefreut. Regen ist hier ein Geschenk.'],
    origami:[97,39,'Ich habe meinen 999. Kranich gefaltet. Den tausendsten hebe ich auf, bis ich weiss, was ich mir wünsche.'],
    nachtmarkt:[97,44,'Auf dem Nachtmarkt kann man alles tauschen, nur keine Zeit. Die Händlerin sagt, die gehört allen.'],
    bauklotz:[97,50,'Ich habe eine Burg gebaut. Sie ist umgefallen. Wir haben sie zusammen nochmal gebaut, und sie war schöner.'],
    schoner:[97,57,'Der Planet schläft. Wenn ich ganz leise bin, höre ich ihn träumen. Er träumt von uns.'],
    honigwabe:[97,61,'Eine Biene hat mir den Weg getanzt. Ich bin gefolgt und habe eine Wiese gefunden, die auf keiner Karte steht.'],
    keim:[97,64,'Im Samen-Tresor schlafen Samen für später. Ich glaube, wir sind auch so etwas. Samen für später.'],
    kassette:[97,66,'Seite A ist 23:59, Seite B ist 00:00. Noch hat niemand die Kassette umgedreht.'],
    gluehwurm:[97,68,'Auf dem Glühwurm-Mond ist es immer dunkel, aber ich habe keine Angst. Die Glühwürmchen kennen den Weg.'],
    drachen:[97,70,'Ich habe einen Drachen steigen lassen und die Schnur losgelassen. Er ist nicht gefallen. Er ist weitergeflogen.'],
    pixelmond:[97,72,'Alle neun Felder leuchten. Für einen Moment war die Welt ganz scharf. Dann wurde sie wieder weich.']};
  const S=()=>SAVE.diary=SAVE.diary||{};
  const label=pid=>{const l=LINES[pid];return`Tagebuch · Kokon ${l[0]} · Tag ${l[1]}`};
  const ids=()=>Object.keys(LINES).filter(id=>PLANETS[id]);
  const count=()=>ids().filter(id=>S()[id]).length;
  /* beim ersten Wortstein eines Planeten: Tagebuchzeile freilegen */
  async function found(pid){if(!LINES[pid]||S()[pid])return;S()[pid]=1;persist();SND.play('pep',{vol:.6});
    await UI.talk(label(pid),['Unter den Zeichen ist etwas Kleineres eingeritzt, in gewöhnlicher Schrift:',`«${LINES[pid][2]}»`],{voice:{pitch:200,speed:.9,kind:'sanft'},color:'#5a4a7a'});
    UI.toast('Tagebuchseite gefunden: '+count()+' von '+ids().length+'.',2600)}
  /* zerbrochene Schlafkapsel aus Kokon 95/97 neben der ersten Ruine */
  function pod(m,year){const g=new THREE.Group();const shell=m.c('#e8ecf8',{gloss:1});const dark=m.c('#5a5a68');
    P(g,G.ca(.55,1.3),shell,[0,.5,0],[PI/2,0,.08]);P(g,G.ca(.47,1.1),m.glass('#a8c8e0'),[.1,.86,.15],[PI/2+.5,.2,.1]);
    for(let i=0;i<4;i++)P(g,G.bx(.15+i*.05,.04,.12,.01),m.glass('#c8e0f0'),[-.8+i*.4,.03,.6-i*.2],[0,i,0]);
    P(g,G.bx(.5,.06,.18,.02),dark,[0,.6,-.58]);const t=ctex('pod-'+year,128,32,(x,w,h)=>{x.fillStyle='#2a2a30';x.fillRect(0,0,w,h);x.fillStyle='#ffd23f';x.font='bold 18px monospace';x.textAlign='center';x.fillText('KOKON '+year,w/2,23)});
    const sg=P(g,new THREE.PlaneGeometry(.48,.13),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),[0,.6,-.67]);sg.rotation.y=PI;sg.userData.noOutline=true;
    for(let i=0;i<3;i++)P(g,G.s(.18),m.c('#5aae4a',{gloss:.3}),[-.5+i*.5,.12,-.45],null,[1.2,.5,1]);return g}
  /* Tagebuch lesen (App und Glitch-Kern) */
  function app(){SND.play('book_open',{vol:.6});const w=UI.win('Tagebuch der Schläfer:innen',{size:'wide'});const n=count(),N=ids().length;
    w.body.append(el('p',null,`Unter den Wortsteinen der Ruinen stehen Zeilen von Kokon 95 und Kokon 97. Gefunden: ${n} von ${N}.`));
    const list=el('div');list.style.cssText='display:flex;flex-direction:column;gap:8px';
    for(const id of ids().sort((a,b)=>LINES[a][0]-LINES[b][0]||LINES[a][1]-LINES[b][1])){const got=S()[id];const c=el('div','card');c.style.cssText='text-align:left;padding:10px 14px';
      c.append(el('b',null,label(id)),el('span','sub',' '+PLANETS[id].n));c.append(el('p',null,got?`«${LINES[id][2]}»`:'… (Wortstein auf diesem Planeten lesen)'));if(!got)c.style.opacity=.55;list.append(c)}
    w.body.append(list)}
  /* Wortstein lesen: danach die Tagebuchzeile dieses Planeten */
  if(typeof LANG!=='undefined'){const orig=LANG.stone;LANG.stone=async function(pid,st){const was=st&&st.used;await orig.apply(this,arguments);if(!was)await found(pid)}}
  return{LINES,found,pod,app,count,total:()=>ids().length,label}
})();
