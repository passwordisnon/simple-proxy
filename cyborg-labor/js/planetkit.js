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
  /* Freier Platz nahe einem Ort: Land, keine Hindernisse im Umkreis rad (für Planeten-Bauten wie Klangsteine oder Lesepult) */
  function freeSpot(W,center,minD,maxD,rad){const t1=GAME.tangentTo(center,new THREE.Vector3(0,0,1)),t2=center.clone().cross(t1);const R=W.R;
    for(let d=minD;d<=maxD;d+=3)for(let k=0;k<16;k++){const a=k/16*TAU+d*.37;const c=center.clone().addScaledVector(t1,Math.cos(a)*d/R).addScaledVector(t2,Math.sin(a)*d/R).normalize();if(!GAME.isLand(c)||W.hAt(c)<W.sea+.5)continue;
      const wp=c.clone().multiplyScalar(R+W.hAt(c));const near=GAME.obstAround(c,rad+2).filter(o=>!o.wp||o.wp.distanceTo(wp)<rad+(o.r||1));if(near.length)continue;
      /* flach genug? */let ok=true;const h0=W.hAt(c);for(let j=0;j<6&&ok;j++){const b=j/6*TAU;const e=c.clone().addScaledVector(t1,Math.cos(b)*rad/R).addScaledVector(t2,Math.sin(b)*rad/R).normalize();if(Math.abs(W.hAt(e)-h0)>.8)ok=false}if(ok)return c}
    return center.clone().addScaledVector(t1,minD/R).normalize()}
  return{add,list,freeSpot}
})();
