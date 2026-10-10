/* =====================================================================
   CYBORG-LABOR · abilities.js
   Bewegungsarten und Fähigkeiten der Teile. Die Fähigkeiten wirken in der Welt
   über die Welt-API W (siehe world.js): spawn, near, ahead, nearest, nearEnts, fx, say ...
   ===================================================================== */
const WORDS=['KIN','GRENZE','RAUSCHEN','AFFINITÄT','CYBORG','KOMPOST','WIR SIND SIE','NOISE','ILLEGITIM','MAKE KIN'];
const THOUGHTS=['Affinität','Wo endet meine Haut?','Kompost','Regeneration','Wer hat mich gebaut?','Grenze?','Make kin','Rauschen','Göttin? Nein danke'];
/* ---------- Bewegung ---------- */
const MOVE={
 walk:{n:'läuft',sp:1},hop:{n:'hüpft',sp:1.25,hop:.5},roll:{n:'rollt',sp:1.6,trail:'spur'},rollfast:{n:'rollt schnell',sp:2.2},fly:{n:'fliegt',sp:1.5,alt:1.3,water:true},
 swim:{n:'schwimmt und läuft',sp:1,water:true,swim:true},slither:{n:'kriecht',sp:.55,trail:'schleim'},tank:{n:'walzt',sp:.7,trail:'spur'},root:{n:'wurzelt fest, bewegt sich kaum',sp:.12},
 stomp:{n:'stampft',sp:.85,trail:'tritt'},float:{n:'schwebt',sp:.7,alt:.7,water:true},stilts:{n:'stakst, auch durchs Wasser',sp:.8,water:true}
};
const LEGMOVE={mensch:'walk',prothese:'walk',knick:'walk',hufe:'walk',huhn:'walk',frosch:'hop',spinne:'walk',insekt:'walk',tausend:'slither',oktopus:'swim',schneckenfuss:'slither',schlange:'slither',fisch:'swim',schwanz:'swim',
 kaenguru:'hop',ente:'swim',flamingo:'stilts',seepferdchen:'swim',raupe:'slither',nacktschnecke:'slither',qualle:'float',raeder:'roll',dreirad:'roll',vierrad:'roll',kette:'tank',hover:'fly',rakete:'fly',mech:'stomp',huehnermech:'stomp',
 vierbeiner:'walk',kugel:'roll',magnet:'float',kabel:'root',rollstuhl:'roll',pogo:'hop',feder:'hop',stelzen:'stilts',buerostuhl:'roll',rollschuhe:'rollfast',ski:'rollfast',einrad:'roll',huepfball:'hop',einkaufswagen:'roll',hocker:'walk',tischbeine:'walk',
 skateboard:'rollfast',wolke:'float',blumentopf:'root',wurzeln:'root',stamm:'root',pilzstiel:'root',ranken:'walk'};
const FLYPARTS={arme:['fledermaus','fluegel','morpho','motte','vogel','libelle','duesen','propeller'],extras:['jetpack','engelsfluegel']};
const SWIMPARTS={kopf:['fisch','hai','seerose','taucherhelm','raumhelm','qualle','oktopus'],arme:['flossen','flipper'],extras:['blasenhelm','rueckenflosse','aquarium']};
function moveFor(d){let m=LEGMOVE[d.parts.beine]||'walk';let src='Beine';
  if(FLYPARTS.arme.includes(d.parts.arme)){m='fly';src='Arme'}if((d.parts.extras||[]).some(x=>FLYPARTS.extras.includes(x))){m='fly';src='Extra'}
  let swim=MOVE[m].water||SWIMPARTS.kopf.includes(d.parts.kopf)||SWIMPARTS.arme.includes(d.parts.arme)||(d.parts.extras||[]).some(x=>SWIMPARTS.extras.includes(x));return{m,src,swim}}

/* ---------- Fähigkeiten ---------- */
const ABMAP={
 kopf:{axolotl:'regeneration',monitor:'werbung',roehre:'werbung',birne:'licht',kamerakopf:'ueberwachung',schuessel:'vernetzen',vrbrille:'ferngesteuert',lautsprecher:'musik',ventilator:'wind',waschmaschine:'putzen',
  mikrowelle:'toast',ampel:'ampel',router:'vernetzen',toaster:'toast',disco:'musik',uhr:'glocke',kristall:'kristall',wolke:'regen',gehirnglas:'gedanken',teekanne:'tee',pilzhut:'sporen',bluete:'bestaeuben',
  kaktus:'bestaeuben',kohl:'moos',moosball:'moos',zapfen:'tannen',baumstumpf:'pflanzen',koralle:'koralle',oktopus:'tinte',chamaeleon:'tarnung',kaefer:'kompostieren',nashorn:'rammen',widder:'rammen',hirsch:'rammen',
  statue:'goettin',schnecke:'schleim',qualle:'licht',gasmaske:'putzen',globus:'gedanken',mond:'regen',schaedel:'gedanken',ei:'gedanken',frosch:'bestaeuben',eule:'ueberwachung'},
 augen:{kamera:'ueberwachung',kuppel:'ueberwachung',visier:'ueberwachung',lidar:'ueberwachung',radar:'ueberwachung',objektiv:'selfie',webcam:'ueberwachung',emoji:'werbung',scanner:'ueberwachung',
  barcode:'ueberwachung',qr:'werbung',herz:'winken',kuller:'winken',blueten:'bestaeuben',knospen:'bestaeuben',pilzchen:'sporen',spirale:'werbung',laser:'malen',stiel:'gedanken'},
 arme:{mensch:'winken',muskel:'tragen',lang:'pfluecken',prothese:'winken',tentakel:'putzen',saugnapf:'putzen',krabbe:'sandburg',hummer:'sandburg',mantis:'maehen',insekt:'tragen',fluegel:'bestaeuben',morpho:'bestaeuben',
  motte:'licht',vogel:'nisten',koralle:'koralle',greifarm:'tragen',industrie:'bauen',bohrer:'bohren',saege:'saegen',schluessel:'reparieren',solar:'solar',kabel:'vernetzen',teleskop:'pfluecken',magnet:'magnet',
  haken:'tragen',pinzette:'pflanzen',mikro:'musik',ranken:'ranken',aeste:'pflanzen',wurzeln:'moos',blaetter:'solar',kaktus:'bestaeuben',besteck:'essen',schirm:'regen',selfie:'selfie',pinsel:'malen',stifte:'schreiben',
  schlauch:'giessen',messer:'schnitzen',zange:'tragen',schwamm:'putzen',feder:'glocke',ballon:'feiern',fledermaus:'bestaeuben',libelle:'bestaeuben',flossen:'koralle',duesen:'auspuff',propeller:'wind'},
 beine:{spinne:'netz',schneckenfuss:'schleim',nacktschnecke:'schleim',raupe:'raupe',rollstuhl:'rampe',wolke:'regen',blumentopf:'bestaeuben',wurzeln:'moos',stamm:'pflanzen',pilzstiel:'sporen',ranken:'ranken',
  huhn:'scharren',kette:'maehen',rakete:'auspuff',kabel:'vernetzen',oktopus:'tinte',hover:'wind'},
 extras:{herz:'winken',solar:'solar',pilz:'sporen',server:'daten',blume:'bestaeuben',kabel:'vernetzen',fernsteuer:'ferngesteuert',jetpack:'auspuff',akku:'akku',antennen:'vernetzen',schuessel:'vernetzen',
  schneckenhaus:'unerfassbar',panzer:'unerfassbar',stacheln:'stacheln',falter:'bestaeuben',vogelnest:'nisten',bienenstock:'bestaeuben',aquarium:'fische',biolumineszenz:'licht',korallen:'koralle',spinnennetz:'netz',
  zahnraeder:'bauen',auspuff:'auspuff',luefter:'wind',kuehlrippen:'wind',usb:'vernetzen',qr:'werbung',kopfhoerer:'musik',heiligenschein:'goettin',krone:'goettin',namensschild:'winken',glocke:'glocke',
  laterne:'licht',partyhut:'feiern',leitkegel:'kegel',kristalle:'kristall',pilzkolonie:'sporen',topfpflanze:'bestaeuben',moosflecken:'moos',efeu:'ranken',kompostbauch:'kompostieren',seerose:'bestaeuben',
  infusion:'pflegen',zahnspange:'normieren',bodycam:'ueberwachung',schrittmacher:'pflegen',hoergeraet:'lauschen',insulinpumpe:'pflegen',umhang:'feiern',blasenhelm:'fische',engelsfluegel:'goettin',tentakelbart:'tinte'}
};
const ABIL={
 pflanzen:{n:'pflanzt Bäume',d:'Setzt Setzlinge, die zu Bäumen wachsen.',cd:8,act:(e,W)=>{W.spawn('baum',W.ahead(e,.02));W.say(e,'pflanzt einen Baum')},lab:'baum'},
 tannen:{n:'pflanzt Tannen',d:'Streut Zapfen, aus denen Tannen wachsen.',cd:8,act:(e,W)=>{W.spawn('tanne',W.near(e.p,.04));W.say(e,'pflanzt eine Tanne')},lab:'tanne'},
 giessen:{n:'giesst Pflanzen',d:'Pflanzen in der Nähe wachsen grösser, auf dem Boden bleiben Pfützen.',cd:6,need:{t:['baum','tanne','blume','doppelbaum'],r:.35},alone:true,
  act:(e,W,t)=>{W.fx(e.p,'tropfen',8);W.spawn('pfuetze',W.ahead(e,.015));if(t){t.big=Math.min(1.8,(t.big||1)+.25);W.say(e,'giesst einen Baum')}else{W.spawn('blume',W.ahead(e,.02));W.say(e,'giesst, eine Blume wächst')}},lab:'pfuetze'},
 tragen:{n:'trägt Elektroschrott weg',d:'Sammelt Schrott ein und bringt ihn zum Recyclinghaufen.',cd:7,need:{t:['schrott'],r:.7},act:(e,W,t)=>{W.carry(e,t)}},
 bohren:{n:'bohrt nach Rohstoffen',d:'Findet Kristalle, hinterlässt aber Krater und Öl.',cd:9,act:(e,W)=>{const p=W.ahead(e,.02);W.spawn('krater',p);W.spawn('kristall',W.near(p,.02));W.spawn('oel',W.near(p,.03));W.fx(e.p,'staub',10);W.say(e,'bohrt ein Loch in den Planeten')},lab:'kristall'},
 saegen:{n:'sägt Bäume um',d:'Aus Bäumen werden Stümpfe.',cd:9,need:{t:['baum','tanne','doppelbaum'],r:.6},act:(e,W,t)=>{W.replace(t,'stumpf');W.fx(t.p,'blatt',10);W.say(e,'sägt einen Baum um')}},
 reparieren:{n:'baut aus Schrott Funkmasten',d:'Repariert Elektroschrott zu einem blinkenden Mast.',cd:9,need:{t:['schrott'],r:.6},act:(e,W,t)=>{W.replace(t,'mast');W.fx(t.p,'funke',8);W.say(e,'baut aus Schrott einen Funkmast')}},
 bauen:{n:'baut Hütten',d:'Stellt kleine Hütten in die Landschaft.',cd:12,act:(e,W)=>{W.spawn('huette',W.ahead(e,.03));W.fx(e.p,'funke',6);W.say(e,'baut eine Hütte')},lab:'huette'},
 magnet:{n:'zieht Schrott an',d:'Metallteile rutschen zu ihm hin.',cd:6,need:{t:['schrott','mast'],r:.8},noWalk:true,act:(e,W,t)=>{t.pullTo=e;W.fx(e.p,'funke',5);W.say(e,'zieht Metall an')}},
 vernetzen:{n:'vernetzt Cyborgs',d:'Spannt Datenleitungen zu allen in der Nähe.',cd:7,act:(e,W)=>{const o=W.nearEnts(e,.7,4);o.forEach(x=>W.link(e,x,'#43d2c6',4));W.say(e,o.length?`vernetzt sich mit ${o.length}`:'sucht Netz')}},
 winken:{n:'begrüsst andere',d:'Winkt und verteilt Herzen.',cd:6,act:(e,W)=>{const o=W.nearEnts(e,.5,1)[0];W.fx(e.p,'herz',5);if(o){W.fx(o.p,'herz',4);o.stop=Math.max(o.stop,1.5);W.say(e,'winkt '+o.d.name)}else W.say(e,'winkt ins Leere')}},
 pfluecken:{n:'pflückt Früchte',d:'Holt Früchte von Bäumen, die andere essen können.',cd:8,need:{t:['baum','doppelbaum'],r:.6},act:(e,W,t)=>{W.spawn('frucht',W.near(t.p,.015));W.spawn('frucht',W.near(t.p,.015));W.fx(t.p,'blatt',6);W.say(e,'pflückt Früchte')}},
 essen:{n:'isst Pilze und Früchte',d:'Frisst, was herumliegt.',cd:7,need:{t:['frucht','pilz','toast'],r:.7},act:(e,W,t)=>{W.remove(t);W.fx(e.p,'herz',3);W.say(e,'isst '+({frucht:'eine Frucht',pilz:'einen Pilz',toast:'Toast'}[t.type]))}},
 putzen:{n:'putzt Öl weg',d:'Entfernt Ölflecken und Schmutz.',cd:6,need:{t:['oel','schleim'],r:.8},act:(e,W,t)=>{W.remove(t);W.fx(t.p,'blase',8);W.say(e,'putzt einen Ölfleck weg')}},
 sandburg:{n:'baut Sandburgen',d:'Schaufelt Sand zu Burgen am liebsten am Ufer.',cd:10,act:(e,W)=>{W.spawn('sandburg',W.ahead(e,.02));W.say(e,'baut eine Sandburg')},lab:'sandburg'},
 maehen:{n:'mäht Blumen ab',d:'Wo er durchkommt, sind die Blumen weg.',cd:6,need:{t:['blume'],r:.5},act:(e,W,t)=>{W.remove(t);W.fx(t.p,'blatt',6);W.say(e,'mäht eine Blume ab')}},
 koralle:{n:'lässt Korallen wachsen',d:'Pflanzt Korallen, am besten nahe am Wasser.',cd:10,act:(e,W)=>{W.spawn('koralle',W.ahead(e,.02));W.say(e,'lässt eine Koralle wachsen')},lab:'koralle'},
 solar:{n:'tankt Sonne',d:'Auf der Sonnenseite doppelt so schnell.',cd:10,passive:(e,W)=>{e.spMul*=W.sunny(e.p)?1.9:.8},act:(e,W)=>{if(W.sunny(e.p)){W.fx(e.p,'funke',4);W.say(e,'tankt Sonne')}}},
 malen:{n:'malt den Boden an',d:'Hinterlässt bunte Farbflecken.',cd:4,act:(e,W)=>{W.spawn('farbe',W.ahead(e,.01));W.say(e,'malt')},lab:'farbe'},
 schreiben:{n:'schreibt auf den Boden',d:'Schreibt Wörter wie KIN oder RAUSCHEN in die Landschaft.',cd:7,act:(e,W)=>{const w=pick(WORDS);W.spawn('schrift',W.ahead(e,.02),{word:w});W.say(e,`schreibt «${w}»`)},lab:'schrift'},
 schnitzen:{n:'schnitzt Statuen',d:'Macht aus Baumstümpfen kleine Götterstatuen.',cd:10,need:{t:['stumpf'],r:.8},act:(e,W,t)=>{W.replace(t,'statue');W.fx(t.p,'staub',8);W.say(e,'schnitzt eine Göttin aus einem Stumpf')}},
 selfie:{n:'macht Selfies',d:'Blitz! Alle in der Nähe bleiben kurz stehen.',cd:8,act:(e,W)=>{W.fx(e.p,'blitz',1);const o=W.nearEnts(e,.5,5);o.forEach(x=>x.stop=Math.max(x.stop,1.2));W.say(e,o.length?`Selfie mit ${o.length}`:'Selfie allein')}},
 musik:{n:'macht Musik',d:'Alle in der Nähe fangen an zu tanzen.',cd:9,act:(e,W)=>{W.fx(e.p,'note',10);const o=W.nearEnts(e,.6,8);o.forEach(x=>x.dance=3.5);e.dance=3.5;W.say(e,o.length?`macht Musik, ${o.length===1?'1 tanzt':o.length+' tanzen'}`:'macht Musik')}},
 ranken:{n:'lässt Efeu ranken',d:'Überwuchert Bäume, Masten und Hütten mit Grün.',cd:8,need:{t:['baum','mast','huette','stumpf','statue'],r:.6},act:(e,W,t)=>{W.vine(t);W.say(e,'lässt Efeu ranken')}},
 moos:{n:'verbreitet Moos',d:'Hinterlässt Moosflecken.',cd:5,act:(e,W)=>{W.spawn('moos',W.near(e.p,.02))},lab:'moos'},
 bestaeuben:{n:'bestäubt Blumen',d:'Überall wo er war, blühen neue Blumen.',cd:6,act:(e,W)=>{W.spawn('blume',W.near(e.p,.03));W.fx(e.p,'pollen',6);W.say(e,'bestäubt, eine Blume blüht')},lab:'blume'},
 nisten:{n:'Vögel säen Bäume',d:'Die Vögel tragen Samen weit weg.',cd:12,act:(e,W)=>{W.spawn('baum',W.near(e.p,.2));W.fx(e.p,'feder',6);W.say(e,'Vögel säen einen Baum')},lab:'baum'},
 sporen:{n:'verstreut Sporen',d:'Pilze wachsen um ihn herum.',cd:6,act:(e,W)=>{W.spawn('pilz',W.near(e.p,.03));W.fx(e.p,'spore',8);W.say(e,'verstreut Sporen')},lab:'pilz'},
 kristall:{n:'lässt Kristalle wachsen',d:'Züchtet Kristalle aus dem Boden.',cd:9,act:(e,W)=>{W.spawn('kristall',W.near(e.p,.03));W.say(e,'lässt einen Kristall wachsen')},lab:'kristall'},
 regen:{n:'lässt es regnen',d:'Pflanzen in der Nähe wachsen, es bilden sich Pfützen.',cd:10,act:(e,W)=>{W.fx(e.p,'regen',24);W.spawn('pfuetze',W.near(e.p,.02));W.grow(e.p,.35,.3);W.say(e,'lässt es regnen')},lab:'pfuetze'},
 licht:{n:'leuchtet Pflanzen an',d:'Pflanzen in seinem Licht wachsen schneller.',cd:8,act:(e,W)=>{W.fx(e.p,'funke',8);W.grow(e.p,.3,.2);W.say(e,'leuchtet, Pflanzen wachsen')}},
 werbung:{n:'zeigt Werbung',d:'Alle in der Nähe bleiben stehen und schauen zu.',cd:10,act:(e,W)=>{const o=W.nearEnts(e,.6,8);o.forEach(x=>{x.stop=Math.max(x.stop,3);x.lookAt=e});W.fx(e.p,'funke',4);W.say(e,o.length?`zeigt Werbung, ${o.length===1?'1 schaut':o.length+' schauen'} zu`:'zeigt Werbung, niemand schaut')}},
 ueberwachung:{n:'überwacht andere',d:'Erfasst Cyborgs in der Nähe und markiert sie rot.',cd:8,act:(e,W)=>{const o=W.nearEnts(e,.8,5);let hit=0,hid=0;o.forEach(x=>{if(x.hidden){hid++;W.fx(x.p,'tinte',10);return}x.marked=7;hit++});W.link(e,o[0]||e,'#ff3030',1.2);
   const vs=n=>n===1?'1 versteckt sich':`${n} verstecken sich`;W.say(e,hit?`erfasst ${hit} ${hit===1?'Cyborg':'Cyborgs'}`+(hid?', '+vs(hid):''):(hid?vs(hid):'scannt, niemand da'))}},
 daten:{n:'sammelt Daten',d:'Saugt Daten von erfassten und nahen Cyborgs ab.',cd:8,act:(e,W)=>{const o=W.nearEnts(e,1,8).filter(x=>!x.hidden);o.forEach(x=>W.stream(x,e));W.say(e,o.length?`saugt Daten von ${o.length} ab`:'wartet auf Daten')}},
 regeneration:{n:'regeneriert Baumstümpfe',d:'Stümpfe wachsen nach, oft doppelt und monströs. Regeneration, nicht Wiedergeburt.',cd:9,need:{t:['stumpf'],r:1},act:(e,W,t)=>{W.replace(t,'doppelbaum');W.fx(t.p,'funke',10);W.say(e,'lässt einen Stumpf nachwachsen, doppelt')},lab:'doppelbaum'},
 normieren:{n:'normiert',d:'Biegt Doppelbäume und Statuen zurück in die Norm, wie eine Zahnspange.',cd:10,need:{t:['doppelbaum','statue'],r:1},act:(e,W,t)=>{W.replace(t,'baum');W.say(e,'biegt etwas zurück in die Norm')}},
 tarnung:{n:'tarnt sich',d:'Nimmt die Farbe des Bodens an.',cd:99,passive:(e,W)=>{W.camo(e)}},
 tinte:{n:'versprüht Tinte',d:'Kann nicht überwacht werden.',cd:99,flag:'hidden'},
 unerfassbar:{n:'ist unerfassbar',d:'Zieht sich zurück, Überwachung prallt ab.',cd:99,flag:'hidden'},
 ampel:{n:'regelt den Verkehr',d:'Bei Rot bleiben alle in der Nähe stehen.',cd:7,act:(e,W)=>{const o=W.nearEnts(e,.6,8);o.forEach(x=>x.stop=Math.max(x.stop,2.5));W.say(e,o.length?`zeigt Rot, ${o.length===1?'1 wartet':o.length+' warten'}`:'zeigt Rot')}},
 toast:{n:'verteilt Toast',d:'Legt Toast hin, andere holen ihn sich.',cd:9,act:(e,W)=>{const t=W.spawn('toast',W.ahead(e,.02));const o=W.nearEnts(e,.7,1)[0];if(o&&t)o.goal={p:t.p,then:()=>{W.remove(t);W.fx(o.p,'herz',3);W.say(o,'isst Toast')}};W.say(e,'verteilt Toast')},lab:'toast'},
 wind:{n:'macht Wind',d:'Bläst andere Cyborgs weg.',cd:7,act:(e,W)=>{const o=W.nearEnts(e,.5,6);o.forEach(x=>x.push={from:e,t:1.2});W.fx(e.p,'blatt',10);W.say(e,o.length?`bläst ${o.length} weg`:'pustet')}},
 gedanken:{n:'denkt laut',d:'Denkblasen über Haraway steigen auf.',cd:7,act:(e,W)=>{W.fx(e.p,'blase',4);W.say(e,'denkt: '+pick(THOUGHTS))}},
 goettin:{n:'wird verehrt',d:'Andere laufen hinterher. Haraway: lieber Cyborg als Göttin.',cd:12,act:(e,W)=>{const o=W.nearEnts(e,.9,6);o.forEach(x=>x.follow={e,t:6});W.fx(e.p,'funke',8);W.say(e,o.length?`${o.length===1?'1 läuft':o.length+' laufen'} hinterher`:'will verehrt werden')}},
 glocke:{n:'klingelt',d:'Alle in der Nähe springen hoch.',cd:8,act:(e,W)=>{const o=W.nearEnts(e,.6,8);o.forEach(x=>x.jump=.9);e.jump=.9;W.fx(e.p,'note',4);W.say(e,'klingelt')}},
 tee:{n:'lädt zum Tee',d:'Andere kommen vorbei und bleiben kurz.',cd:10,act:(e,W)=>{const o=W.nearEnts(e,.8,3);o.forEach(x=>{x.goal={p:e.p.clone(),then:()=>{x.stop=2;W.fx(x.p,'herz',2)}}});W.fx(e.p,'dampf',8);W.say(e,o.length?`lädt ${o.length} zum Tee ein`:'trinkt allein Tee')}},
 ferngesteuert:{n:'wird ferngesteuert',d:'Ein Mensch steuert ihn. Manchmal bricht die Verbindung ab.',cd:9,act:(e,W)=>{if(Math.random()<.5){e.stop=2.5;W.say(e,'Verbindung zum Operator verloren')}else{e.spBoost=2;W.say(e,'Operator übernimmt')}}},
 rammen:{n:'räumt Schrott weg',d:'Schiebt Schrott und Kegel zur Seite.',cd:7,need:{t:['schrott','kegel'],r:.6},act:(e,W,t)=>{t.pushDir=e.dir.clone();t.pushT=1;W.say(e,'schiebt etwas weg')}},
 kompostieren:{n:'kompostiert Schrott',d:'Frisst Elektroschrott, übrig bleibt Moos.',cd:8,need:{t:['schrott','oel'],r:.7},act:(e,W,t)=>{W.replace(t,'moos');W.fx(t.p,'spore',6);W.say(e,'kompostiert Schrott zu Moos')}},
 schleim:{n:'zieht eine Schleimspur',d:'Hinterlässt glänzende Spuren.',cd:99,trail:'schleim'},
 netz:{n:'spannt Netze',d:'Verbindet Bäume mit Spinnfäden.',cd:10,need:{t:['baum','tanne','mast'],r:.6},act:(e,W,t)=>{const t2=W.nearest(['baum','tanne','mast'],t.p,.3,t);if(t2){W.web(t,t2);W.say(e,'spannt ein Netz')}}},
 raupe:{n:'frisst Blumen',d:'Frisst sich durch die Wiese.',cd:6,need:{t:['blume'],r:.6},act:(e,W,t)=>{W.remove(t);W.fx(t.p,'blatt',4);W.say(e,'frisst eine Blume')}},
 rampe:{n:'baut Rampen',d:'Macht die Welt zugänglicher: überall Rampen.',cd:11,act:(e,W)=>{W.spawn('rampe',W.ahead(e,.025));W.say(e,'baut eine Rampe')},lab:'rampe'},
 scharren:{n:'scharrt Samen frei',d:'Beim Scharren wachsen Blumen.',cd:7,act:(e,W)=>{W.fx(e.p,'staub',6);W.spawn('blume',W.near(e.p,.02));W.say(e,'scharrt')}},
 auspuff:{n:'verpestet die Luft',d:'Lässt Öl und Rauch zurück.',cd:7,act:(e,W)=>{W.spawn('oel',W.near(e.p,.01));W.fx(e.p,'rauch',10);W.say(e,'lässt Öl zurück')},lab:'oel'},
 akku:{n:'muss laden',d:'Bleibt regelmässig stehen, bis der Akku voll ist.',cd:12,act:(e,W)=>{e.stop=3.5;W.fx(e.p,'funke',4);W.say(e,'lädt den Akku')}},
 stacheln:{n:'hält Abstand',d:'Andere gehen ihm aus dem Weg.',cd:6,act:(e,W)=>{W.nearEnts(e,.35,6).forEach(x=>x.push={from:e,t:.8})}},
 fische:{n:'lässt Fische frei',d:'Fische springen ins Wasser.',cd:10,act:(e,W)=>{W.fx(e.p,'fisch',5);W.say(e,'lässt Fische frei')}},
 kegel:{n:'stellt Leitkegel auf',d:'Sperrt Wege ab.',cd:9,act:(e,W)=>{W.spawn('kegel',W.ahead(e,.02));W.say(e,'stellt einen Leitkegel auf')},lab:'kegel'},
 feiern:{n:'feiert',d:'Konfetti, alle in der Nähe tanzen.',cd:10,act:(e,W)=>{W.fx(e.p,'konfetti',16);W.nearEnts(e,.5,6).forEach(x=>x.dance=2.5);e.dance=2.5;W.say(e,'feiert')}},
 pflegen:{n:'kümmert sich',d:'Besucht überwachte Cyborgs und hebt die Markierung auf.',cd:8,act:(e,W)=>{const o=W.nearEnts(e,1.2,8).find(x=>x.marked>0);if(o){e.goal={p:o.p,ent:o,then:()=>{o.marked=0;W.fx(o.p,'herz',5);W.say(e,'kümmert sich um '+o.d.name)}}}else{W.fx(e.p,'herz',2)}}},
 lauschen:{n:'hört Musik von weit her',d:'Tanzt schon, wenn woanders Musik läuft.',cd:99,flag:'ears'}
};
for(const slot of Object.keys(PARTS))for(const p of PARTS[slot]){p.ab=ABMAP[slot]&&ABMAP[slot][p.id];if(slot==='beine')p.mv=LEGMOVE[p.id]||'walk'}
function abilitiesFor(d){const out=[];const add=(slot,id)=>{const a=ABMAP[slot]&&ABMAP[slot][id];if(a&&!out.includes(a))out.push(a)};
  ['kopf','augen','arme','beine'].forEach(s=>add(s,d.parts[s]));(d.parts.extras||[]).forEach(x=>add('extras',x));return out}
