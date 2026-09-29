/* =====================================================================
   CYBORG-LABOR · kitfurn.js
   Viele neue Möbel aus CC0-Bausätzen (Kenney Furniture, Food, Holiday,
   Nature, Pirate, Space Station, Survival), je Planet thematisch:
   Frost = Winterstube, Wüste = Tonkrüge & Kakteen, Pilz = Waldhütte,
   Schrott = Raumstation, Korallen = Piratenkajüte, alle = Wohnung.
   Registriert sich im normalen Möbelkatalog (FURN) – Läden, Haus-Deko
   und Katalog funktionieren damit automatisch.
   ===================================================================== */
(function(){
  /* [Bausatz, Teil, Name, Kategorie, Preis, Planet, Massstab, Wand?] */
  const L=[
    ['furn','bedDouble','Doppelbett','bett',1800,'alle',1.8],['furn','bedSingle','Einzelbett','bett',1100,'alle',1.8],['furn','bedBunk','Etagenbett','bett',1500,'alle',1.8],
    ['furn','loungeSofa','Sofa','sitz',1300,'alle',1.8],['furn','loungeSofaCorner','Ecksofa','sitz',1700,'alle',1.8],['furn','loungeSofaLong','Langes Sofa','sitz',1600,'alle',1.8],
    ['furn','loungeChair','Sessel','sitz',800,'alle',1.8],['furn','loungeDesignChair','Designsessel','sitz',950,'alle',1.8],['furn','loungeChairRelax','Relaxsessel','sitz',900,'alle',1.8],
    ['furn','chairCushion','Polsterstuhl','sitz',350,'alle',1.8],['furn','chairRounded','Rundstuhl','sitz',380,'alle',1.8],['furn','chairModernCushion','Modern-Stuhl','sitz',420,'alle',1.8],['furn','benchCushion','Polsterbank','sitz',600,'alle',1.8],
    ['furn','stoolBar','Barhocker','sitz',250,'alle',1.8],['furn','chairDesk','Bürostuhl','sitz',450,'alle',1.8],
    ['furn','tableRound','Runder Tisch','tisch',700,'alle',1.8],['furn','table','Esstisch','tisch',800,'alle',1.8],['furn','tableCloth','Tisch mit Decke','tisch',850,'alle',1.8],['furn','tableCoffee','Couchtisch','tisch',500,'alle',1.8],
    ['furn','tableCoffeeGlass','Glastisch','tisch',650,'alle',1.8],['furn','desk','Schreibtisch','tisch',900,'alle',1.8],['furn','deskCorner','Eck-Schreibtisch','tisch',1000,'alle',1.8],['furn','sideTableDrawers','Nachttisch','lager',400,'alle',1.8],
    ['furn','bookcaseOpen','Bücherregal','lager',700,'alle',1.8],['furn','bookcaseClosedWide','Breiter Schrank','lager',1100,'alle',1.8],['furn','bookcaseClosedDoors','Kleiderschrank','lager',950,'alle',1.8],
    ['furn','cabinetTelevision','TV-Schrank','lager',650,'alle',1.8],['furn','coatRackStanding','Garderobe','lager',300,'alle',1.8],['furn','cardboardBoxOpen','Umzugskarton','lager',80,'alle',1.8],['furn','trashcan','Mülleimer','lager',120,'alle',1.8],
    ['furn','televisionModern','Flachbild-TV','technik',1500,'alle',1.8],['furn','televisionVintage','Röhrenfernseher','technik',900,'alle',1.8],['furn','laptop','Laptop','technik',1200,'alle',1.8],['furn','computerScreen','Monitor','technik',700,'alle',1.8],
    ['furn','radio','Radio','musik',500,'alle',1.8],['furn','speaker','Standlautsprecher','musik',800,'alle',1.8],
    ['furn','lampRoundFloor','Stehlampe rund','licht',450,'alle',1.8],['furn','lampSquareFloor','Stehlampe eckig','licht',450,'alle',1.8],['furn','lampRoundTable','Tischlampe','licht',250,'alle',1.8],['furn','lampSquareTable','Nachttischlampe','licht',250,'alle',1.8],
    ['furn','pottedPlant','Topfpflanze','pflanze',300,'alle',1.8],['furn','plantSmall1','Zimmerpflanze','pflanze',150,'alle',1.8],['furn','plantSmall2','Sukkulente','pflanze',150,'alle',1.8],['furn','plantSmall3','Grünlilie','pflanze',150,'alle',1.8],
    ['furn','rugRound','Runder Teppich','teppich',400,'alle',1.8],['furn','rugRectangle','Langer Teppich','teppich',450,'alle',1.8],['furn','rugRounded','Ovaler Teppich','teppich',420,'alle',1.8],['furn','rugDoormat','Fussmatte','teppich',60,'alle',1.8],
    ['furn','kitchenFridge','Kühlschrank','kueche',1200,'alle',1.8],['furn','kitchenStove','Herd','kueche',1000,'alle',1.8],['furn','kitchenSink','Spüle','kueche',800,'alle',1.8],['furn','kitchenCabinet','Küchenschrank','kueche',600,'alle',1.8],
    ['furn','kitchenCoffeeMachine','Kaffeemaschine','kueche',400,'alle',1.8],['furn','kitchenMicrowave','Mikrowelle','kueche',350,'alle',1.8],['furn','toaster','Toaster','kueche',150,'alle',1.8],['furn','kitchenBlender','Mixer','kueche',180,'alle',1.8],
    ['furn','bathtub','Badewanne','bad',1400,'alle',1.8],['furn','shower','Dusche','bad',1200,'alle',1.8],['furn','toilet','Toilette','bad',600,'alle',1.8],['furn','bathroomSink','Waschbecken','bad',500,'alle',1.8],['furn','washer','Waschmaschine','bad',900,'alle',1.8],
    ['furn','bear','Teddybär','deko',200,'alle',1.8],['furn','books','Bücherstapel','deko',90,'alle',1.8],['furn','pillowBlue','Kissen','deko',60,'alle',1.8],['furn','lampWall','Wandleuchte','licht',300,'alle',1.8,1],['furn','bathroomMirror','Spiegel','wand',350,'alle',1.8,1],
    ['food','cake-birthday','Geburtstagstorte','deko',300,'alle',1.2],['food','cupcake','Cupcake','deko',80,'alle',1.2],['food','pie','Apfelkuchen','deko',150,'alle',1.2],['food','bread','Brotlaib','deko',60,'alle',1.2],['food','pizza','Pizza','deko',120,'alle',1.2],
    ['food','watermelon','Wassermelone','deko',90,'alle',1.2],['food','pineapple','Ananas','deko',90,'alle',1.2],['food','ice-cream','Eisbecher','deko',90,'alle',1.2],['food','cocktail','Cocktail','deko',80,'alle',1.2],['food','mug','Tasse','deko',40,'alle',1.2],
    /* Mehr Wohnung (alle Planeten) */
    ['furn','bathroomCabinet','Badschrank','bad',450,'alle',1.8,1],['furn','bathroomCabinetDrawer','Bad-Kommode','bad',500,'alle',1.8],['furn','bathroomSinkSquare','Eckiges Waschbecken','bad',600,'alle',1.8],['furn','showerRound','Runddusche','bad',1300,'alle',1.8],['furn','toiletSquare','Design-Toilette','bad',700,'alle',1.8],
    ['furn','washerDryerStacked','Waschturm','bad',1200,'alle',1.8],['furn','dryer','Trockner','bad',800,'alle',1.8],
    ['furn','bench','Holzbank','sitz',450,'alle',1.8],['furn','benchCushionLow','Sitzbank niedrig','sitz',500,'alle',1.8],['furn','chair','Holzstuhl','sitz',250,'alle',1.8],['furn','chairModernFrameCushion','Rahmenstuhl','sitz',480,'alle',1.8],['furn','stoolBarSquare','Eckiger Hocker','sitz',260,'alle',1.8],
    ['furn','loungeDesignSofa','Designsofa','sitz',1900,'alle',1.8],['furn','loungeDesignSofaCorner','Design-Ecksofa','sitz',2300,'alle',1.8],['furn','loungeSofaOttoman','Fusshocker','sitz',400,'alle',1.8],
    ['furn','sideTable','Beistelltisch','tisch',300,'alle',1.8],['furn','tableCoffeeSquare','Eckiger Couchtisch','tisch',520,'alle',1.8],['furn','tableCoffeeGlassSquare','Glas-Couchtisch','tisch',680,'alle',1.8],['furn','tableCross','Kreuztisch','tisch',750,'alle',1.8],['furn','tableCrossCloth','Festtafel','tisch',900,'alle',1.8],['furn','tableGlass','Glas-Esstisch','tisch',950,'alle',1.8],
    ['furn','bookcaseClosed','Vitrinenschrank','lager',800,'alle',1.8],['furn','bookcaseOpenLow','Lowboard-Regal','lager',550,'alle',1.8],['furn','cabinetBed','Bettkasten','lager',350,'alle',1.8],['furn','cabinetBedDrawer','Schubladenkasten','lager',380,'alle',1.8],['furn','cabinetBedDrawerTable','Nachtkommode','lager',420,'alle',1.8],
    ['furn','cabinetTelevisionDoors','TV-Schrank','lager',700,'alle',1.8],['furn','cardboardBoxClosed','Umzugskarton','lager',40,'alle',1.8],['furn','coatRack','Garderobe','lager',300,'alle',1.8],
    ['furn','kitchenBar','Küchentheke','kueche',900,'alle',1.8],['furn','kitchenBarEnd','Theken-Ende','kueche',600,'alle',1.8],['furn','kitchenCabinetDrawer','Küchen-Schubladen','kueche',650,'alle',1.8],['furn','kitchenCabinetCornerRound','Runde Küchenecke','kueche',700,'alle',1.8],['furn','kitchenCabinetCornerInner','Küchen-Innenecke','kueche',700,'alle',1.8],
    ['furn','kitchenCabinetUpper','Hängeschrank','kueche',450,'alle',1.8,1],['furn','kitchenCabinetUpperDouble','Doppel-Hängeschrank','kueche',650,'alle',1.8,1],['furn','kitchenCabinetUpperLow','Flacher Hängeschrank','kueche',400,'alle',1.8,1],
    ['furn','kitchenFridgeLarge','Grosser Kühlschrank','kueche',1500,'alle',1.8],['furn','kitchenFridgeSmall','Mini-Kühlschrank','kueche',700,'alle',1.8],['furn','kitchenFridgeBuiltIn','Einbau-Kühlschrank','kueche',1300,'alle',1.8],['furn','kitchenStoveElectric','Ceranherd','kueche',1100,'alle',1.8],
    ['furn','hoodModern','Dunstabzug','kueche',500,'alle',1.8,1],['furn','ceilingFan','Deckenventilator','licht',600,'alle',1.8],['furn','lampSquareCeiling','Eckige Deckenlampe','licht',380,'alle',1.8],
    ['furn','computerKeyboard','Tastatur','technik',120,'alle',1.8],['furn','computerMouse','Maus','technik',60,'alle',1.8],['furn','speakerSmall','Kleiner Lautsprecher','musik',300,'alle',1.8],['furn','televisionAntenna','Röhrenfernseher','technik',650,'alle',1.8],
    ['furn','pillow','Sofakissen','deko',60,'alle',1.8],['furn','pillowLong','Langes Kissen','deko',80,'alle',1.8],['furn','pillowBlueLong','Blaues Nackenkissen','deko',80,'alle',1.8],['furn','rugSquare','Quadrat-Teppich','teppich',350,'alle',1.8],
    ['food','cake','Torte','deko',220,'alle',1.2],['food','donut-sprinkles','Streusel-Donut','deko',50,'alle',1.2],['food','croissant','Croissant','deko',40,'alle',1.2],['food','loaf-round','Rundes Brot','deko',50,'alle',1.2],['food','cup-coffee','Kaffeetasse','deko',40,'alle',1.2],
    ['food','glass-wine','Weinglas','deko',50,'alle',1.2],['food','bowl-soup','Suppenschüssel','deko',70,'alle',1.2],['food','pancakes','Pfannkuchen-Stapel','deko',80,'alle',1.2],['food','cookie-chocolate','Schoko-Keks','deko',30,'alle',1.2],['food','lollypop','Lolli','deko',30,'alle',1.2],
    ['food','apple','Apfel','deko',20,'alle',1.2],['food','banana','Banane','deko',20,'alle',1.2],['food','cherries','Kirschen','deko',25,'alle',1.2],['food','orange','Orange','deko',20,'alle',1.2],['food','lemon','Zitrone','deko',20,'alle',1.2],
    ['resto','table_round_A_decorated','Bistrotisch gedeckt','tisch',900,'alle',.6],['resto','table_round_A_small_decorated','Kleiner Bistrotisch','tisch',650,'alle',.6],['resto','chair_A','Bistrostuhl','sitz',300,'alle',.6],['resto','chair_B','Café-Stuhl','sitz',320,'alle',.6],['resto','chair_stool','Café-Hocker','sitz',220,'alle',.6],
    ['resto','kitchencounter_straight_decorated','Arbeitsplatte mit Zubehör','kueche',900,'alle',.6],['resto','kitchencabinet','Vorratsschrank','kueche',700,'alle',.6],['resto','fridge_A_decorated','Retro-Kühlschrank','kueche',1400,'alle',.66],['resto','dishrack_plates','Tellerständer','kueche',150,'alle',.6],
    ['resto','shelf_papertowel_decorated','Küchenrollen-Halter','kueche',90,'alle',.6],['resto','pot_A_stew','Eintopf','deko',120,'alle',.6],['resto','jar_A_large','Vorratsglas gross','deko',90,'alle',.6],['resto','jar_B_medium','Gewürzglas','deko',60,'alle',.6],['resto','jar_C_small','Keksdose','deko',60,'alle',.6],['resto','menu','Speisekarte','deko',40,'alle',.6],
    ['market','display-fruit','Obstkorb-Ständer','kueche',500,'alle',1.6],['market','display-bread','Brotkorb-Ständer','kueche',500,'alle',1.6],['market','shelf-boxes','Kistenregal','lager',650,'alle',1.9],['market','shopping-basket','Einkaufskorb','deko',120,'alle',1.3],
    /* Frost: noch mehr Winterstube */
    ['holiday','present-a-round','Rundes Geschenk','deko',120,'frost',.9],['holiday','present-b-cube','Geschenkwürfel','deko',120,'frost',.9],['holiday','sock-red-cane','Kaminsocke','wand',150,'frost',.8,1],['holiday','sock-green','Grüne Socke','wand',150,'frost',.8,1],
    ['holiday','lantern-hanging','Hängelaterne','licht',400,'frost',.8],['holiday','lights-colored','Lichterkette','licht',300,'frost',.8,1],['holiday','snowman','Kleiner Schneemann','deko',400,'frost',.6],['holiday','sled-long','Langer Schlitten','deko',650,'frost',.8],
    ['holiday','hanukkah-menorah-candles','Leuchter','licht',500,'frost',.8],['holiday','gingerbread-woman','Lebkuchenfrau','deko',120,'frost',.9],['holiday','train-wagon','Spielzeugwaggon','spiel',400,'frost',.6],['holiday','tree-snow-a','Verschneites Bäumchen','pflanze',700,'frost',.6],
    /* Frost: Winterstube */
    ['holiday','tree-decorated','Geschmückter Baum','pflanze',1400,'frost',.75],['holiday','snowman-hat','Schneemann','deko',600,'frost',.6],['holiday','present-a-cube','Geschenk','deko',120,'frost',.9],['holiday','present-b-rectangle','Grosses Geschenk','deko',160,'frost',.9],
    ['holiday','nutcracker','Nussknacker','deko',450,'frost',.8],['holiday','reindeer','Rentier','deko',900,'frost',.6],['holiday','sled','Schlitten','deko',500,'frost',.8],['holiday','gingerbread-man','Lebkuchenmann','deko',120,'frost',.9],
    ['holiday','candy-cane-red','Zuckerstange','deko',90,'frost',.9],['holiday','lantern','Winterlaterne','licht',350,'frost',.8],['holiday','bench','Winterbank','sitz',500,'frost',.8],['holiday','wreath-decorated','Türkranz','wand',250,'frost',.8,1],
    ['holiday','trainset-rail-straight','Spielzeugbahn','spiel',300,'frost',.8],['holiday','train-locomotive','Spielzeuglok','spiel',700,'frost',.6],
    /* Wüste: Oase */
    ['nature','cactus_tall','Hoher Kaktus','pflanze',400,'wueste',1.6],['nature','cactus_short','Kugelkaktus','pflanze',300,'wueste',1.6],['nature','pot_large','Tonkrug','deko',350,'wueste',1.6],['nature','pot_small','Kleiner Krug','deko',200,'wueste',1.6],
    ['nature','tree_palmDetailedShort','Zimmerpalme','pflanze',900,'wueste',1.1],['nature','campfire_stones','Feuerschale','licht',450,'wueste',1.4],['pirate','chest','Karawanen-Truhe','lager',800,'wueste',.45],['pirate','barrel','Wasserfass','lager',350,'wueste',.4],
    ['food','coconut','Kokosnuss','deko',60,'wueste',1.2],['food','grapes','Datteltraube','deko',60,'wueste',1.2],['survival','bedroll','Schlafmatte','bett',500,'wueste',2.2],['survival','tent-canvas','Sonnensegel','deko',700,'wueste',2],
    /* Pilz: Waldhütte */
    ['nature','mushroom_redGroup','Pilzgruppe','pflanze',250,'pilz',2.4],['nature','mushroom_tanTall','Hoher Pilz','pflanze',200,'pilz',3],['nature','mushroom_redTall','Fliegenpilz','pflanze',220,'pilz',3],
    ['nature','stump_roundDetailed','Baumstumpf-Hocker','sitz',400,'pilz',1.4],['nature','stump_old','Alter Stumpf','deko',350,'pilz',1.4],['nature','log_stack','Holzstapel','lager',300,'pilz',1.4],['nature','log','Baumstamm-Bank','sitz',500,'pilz',1.2],
    ['nature','plant_bushDetailed','Moosbusch','pflanze',300,'pilz',1.5],['nature','crop_pumpkin','Kürbis','deko',150,'pilz',1.5],['nature','flower_purpleA','Sporenblume','pflanze',120,'pilz',2],['nature','lily_large','Moos-Teppich','teppich',300,'pilz',2],
    ['food','mushroom','Speisepilz','deko',50,'pilz',1.5],['food','honey','Honigtopf','deko',90,'pilz',1.2],
    /* Schrott: Raumstation */
    ['station','computer-system','Computeranlage','technik',1800,'schrott',1.6],['station','computer-wide','Breitbild-Konsole','technik',1400,'schrott',1.6],['station','chair-armrest-headrest','Kommandostuhl','sitz',900,'schrott',1.6],
    ['station','bed-single-cover','Koje','bett',1200,'schrott',1.6],['station','bed-double-cover','Doppelkoje','bett',1800,'schrott',1.6],['station','table-display-planet','Planeten-Hologramm','tisch',2200,'schrott',1.6],
    ['station','container-tall','Tank','lager',600,'schrott',1.6],['station','container-wide','Vorratstonne','lager',550,'schrott',1.6],['station','display-wall','Wandbildschirm','wand',900,'schrott',1.6,1],['station','pipe-ring-colored','Rohrsäule','deko',300,'schrott',1.6],
    ['space','machine_generator','Generator','technik',1300,'schrott',1.2],['space','rover','Rover-Modell','spiel',900,'schrott',1],['space','satelliteDish','Mini-Schüssel','technik',800,'schrott',.9],['space','barrels','Fässer','lager',400,'schrott',1],
    /* Korallen: Piratenkajüte */
    ['pirate','chest','Schatztruhe','lager',1200,'korallen',.45],['pirate','barrel','Rumfass','lager',350,'korallen',.4],['pirate','crate-bottles','Flaschenkiste','lager',400,'korallen',.4],['pirate','boat-row-small','Ruderboot','deko',1500,'korallen',.55],
    ['pirate','cannon','Kanone','deko',1100,'korallen',.4],['pirate','flag-pirate','Piratenflagge','deko',500,'korallen',.35],['nature','tree_palmShort','Zimmerpalme','pflanze',800,'korallen',1.1],['nature','lily_large','Seerosen-Teppich','teppich',300,'korallen',2],
    ['food','fish','Fischplatte','deko',120,'korallen',1.2],['food','mussel','Muschel','deko',80,'korallen',1.4],['food','sushi-salmon','Sushi','deko',100,'korallen',1.4]];
  const b=(pk,nm,sc)=>(g,m,o)=>{if(!KIT.has(pk,nm))return;const bb=KIT.bounds(pk,nm);const mesh=KIT.mesh(pk,nm,pk==='furn'||pk==='food'||pk==='nature'||pk==='resto'||pk==='market'?KIT.ORIG:undefined);mesh.scale.setScalar(sc);
    mesh.position.set(-(bb[0]+bb[3])/2*sc,-bb[1]*sc,-(bb[2]+bb[5])/2*sc);g.add(mesh)};
  const seen=new Set();
  for(const[pk,nm,n,cat,price,planet,sc,wall]of L){const id='k_'+pk+'_'+nm+(seen.has(pk+nm)?'_'+planet:'');seen.add(pk+nm);
    furn(id,{n,cat,price,planet,kit:[pk,nm],sc,wall:!!wall,size:[1,1],h:1,b:b(pk,nm,sc)})}
  /* Grösse erst nach dem Laden der Bausätze bekannt */
  window.KITFURN={fix(){for(const f of FURN){if(!f.kit)continue;const bb=KIT.bounds(f.kit[0],f.kit[1]);if(!bb)continue;const w=(bb[3]-bb[0])*f.sc,d=(bb[5]-bb[2])*f.sc,h=(bb[4]-bb[1])*f.sc;f.size=[Math.max(1,Math.round(w)),Math.max(1,Math.round(d))];f.h=h;
      if(f.wall){const inner=f.b;f.b=(g,m,o)=>{inner(g,m,o);g.children[g.children.length-1].position.y+=1.3}}}},list:L};
})();
