/* =====================================================================
   CYBORG-LABOR · planetkit.js
   Ein neuer Planet ist eine Datei in js/planets/. PLANETKIT.add(id, spec)
   verteilt die Angaben an alle Systeme: Gelände, Biome, Dorf-Gebäude,
   Bürgermeister:in, Bewohner:innen, Sprache, Wetter, Kleidung, Höhlen,
   Terraforming-Landschaften. Fische, Insekten, Fundstücke, Tiere, Möbel
   und Natur-Modelle registriert die Planeten-Datei selbst (F, B, REL,
   IT, N, FAUNA.S, furn). Tierpark, Lexikon, Weltraum, Autopilot und
   Museum lesen alle Planeten automatisch.
   ===================================================================== */
const PLANETKIT=(()=>{
  const list=[];
  function add(id,o){
    PLANETS[id]=Object.assign({base:'kompost'},o.def);PLACES[id]=o.places||[{id:'platz',n:'Dorfplatz',lat:90,lon:0,r:.18,h:.8,build:'plaza'}];
    if(o.biomes)Object.assign(BIOMES,o.biomes);if(o.rock)NH.ROCK[id]=o.rock;
    const set=(T,v)=>{if(T&&v!==undefined)T[id]=v};
    set(TOWN.NAMES,o.names);set(TOWN.STY,o.sty);
    if(typeof BUILDINGS!=='undefined'){set(BUILDINGS.WALL,o.wall);set(BUILDINGS.FLOOR,o.floor);set(BUILDINGS.MAYORS,o.mayor);set(BUILDINGS.LORE,o.lore)}
    if(typeof CAVES!=='undefined')set(CAVES.ROCK,o.caveRock);
    if(typeof CLOTHES!=='undefined'){if(o.clothes)for(const c of o.clothes)if(!CLOTHES.LIST.some(x=>x.id===c.id))CLOTHES.LIST.push(c);set(CLOTHES.PLANET,o.wear)}
    if(typeof HAUS!=='undefined'&&o.haus){set(HAUS.THEMES,o.haus.theme);set(HAUS.PROPS,o.haus.props);set(HAUS.GARDEN,o.haus.garden);set(HAUS.PLAN,o.haus.plan);Object.assign(HAUS.FAMX,o.haus.fams||{})}
    if(typeof HOMES!=='undefined')set(HOMES.THEME,o.residents);
    if(typeof LANG!=='undefined'){set(LANG.STYLE,o.lang);set(LANG.RSTONE,o.ruinStone)}
    if(typeof MYPLANET!=='undefined')set(MYPLANET.BIO,o.terraform);
    if(typeof WEATHER!=='undefined')set(WEATHER.PLAN,o.weather);
    list.push(id)}
  return{add,list}
})();
