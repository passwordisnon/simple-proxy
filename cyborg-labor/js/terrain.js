/* =====================================================================
   CYBORG-LABOR · terrain.js
   Sechs Planeten mit Biomen. Höhenfeld (Tierdorf-Terrassen, Flüsse, Dünen,
   Tafelberge, Krater), Biome aus Temperatur/Feuchte, Boden-Shader
   (Grasmuster, Klippen-Schichten, Sand, Schnee, Pflaster), Wasser.
   ===================================================================== */
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function dirLL(lat,lon){const la=lat*Math.PI/180,lo=lon*Math.PI/180;return new THREE.Vector3(Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)).normalize()}
const angle=(a,b)=>Math.acos(Math.max(-1,Math.min(1,a.dot(b))));
function tangentTo(p,v){return v.clone().sub(p.clone().multiplyScalar(v.dot(p))).normalize()}
function distToArc(p,a,b){const n=new THREE.Vector3().crossVectors(a,b).normalize();const d=Math.asin(Math.max(-1,Math.min(1,p.dot(n))));const proj=p.clone().sub(n.clone().multiplyScalar(p.dot(n))).normalize();
  const ab=angle(a,b);if(Math.abs(angle(a,proj)+angle(proj,b)-ab)<1e-3)return Math.abs(d);return Math.min(angle(p,a),angle(p,b))}
function perlin3(seed){const p=new Uint8Array(512);const r=srand(seed*977+13);const a=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}for(let i=0;i<512;i++)p[i]=a[i&255];
  const fade=t=>t*t*t*(t*(t*6-15)+10),lerp=(a,b,t)=>a+t*(b-a);const grad=(h,x,y,z)=>{const u=h<8?x:y,v=h<4?y:h===12||h===14?x:z;return((h&1)?-u:u)+((h&2)?-v:v)};
  return(x,y,z)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=fade(x),v=fade(y),w=fade(z);
    const A=p[X]+Y,AA=p[A]+Z,AB=p[A+1]+Z,B=p[X+1]+Y,BA=p[B]+Z,BB=p[B+1]+Z;
    return lerp(lerp(lerp(grad(p[AA]&15,x,y,z),grad(p[BA]&15,x-1,y,z),u),lerp(grad(p[AB]&15,x,y-1,z),grad(p[BB]&15,x-1,y-1,z),u),v),lerp(lerp(grad(p[AA+1]&15,x,y,z-1),grad(p[BA+1]&15,x-1,y,z-1),u),lerp(grad(p[AB+1]&15,x,y-1,z-1),grad(p[BB+1]&15,x-1,y-1,z-1),u),v),w)}}

/* ================= Biome ================= */
/* g: [tief, hoch] Bodenfarben · cliff: Klippenfarbe · pat: gras|sand|schnee|moos|staub
   grass: Grasbüschel-Farbe (null = keins) · trees/deco/rocks: [[typ, gewicht, opt?]] · *D: Dichte pro 100 m²
   litter: Sammelsachen [[itemId, gewicht]] */
const BIOMES={
  /* --- Kompost-Planet --- */
  wiese:{n:'Wiese',g:['#9ED872','#89CB62'],cliff:'#B98A5E',pat:'gras',grass:'#93D66C',grassD:1,
    trees:[['obstbaum',3],['eiche',2],['birke',1.2],['busch',2.5],['beerenstrauch',1]],treeD:.55,
    deco:[['blume',5],['klee',3],['loewenzahn',3],['grasbuesche',3],['blumenbusch',1],['unkraut',1.5]],decoD:6,
    rocks:[['stein',2],['kiesel',2],['findling',.4]],rockD:.7,litter:[['unkraut',3],['ast',1],['stein_klein',1]]},
  wald:{n:'Wald',g:['#74B85E','#62A652'],cliff:'#A67C55',pat:'gras',grass:'#6FB85A',grassD:.7,
    trees:[['eiche',4],['tanne',3],['birke',1],['baumstamm_liegend',.5]],treeD:2.4,
    deco:[['farn',5],['pilzgruppe',2],['moospolster',2],['laubhaufen',1],['baumstumpf',.7],['busch',1]],decoD:5,
    rocks:[['findling',.8],['stein',2],['kiesel',1]],rockD:.6,litter:[['ast',3],['champignon',1],['stein_klein',1],['kiefernzapfen',.6]]},
  blumenfeld:{n:'Blumenfeld',g:['#B0E27E','#9CD66E'],cliff:'#C49366',pat:'gras',grass:'#A6DE78',grassD:.8,
    trees:[['kirschbaum',1.5],['obstbaum',1]],treeD:.3,
    deco:[['blume',10],['sonnenblume',2],['lavendel',3],['hortensienbusch',1],['blumenbusch',2]],decoD:10,
    rocks:[['kiesel',1]],rockD:.2,litter:[['unkraut',1]]},
  herbstwald:{n:'Herbstwald',g:['#D6C97C','#C6B96C'],cliff:'#B07A50',pat:'gras',grass:'#C9C470',grassD:.7,
    trees:[['eiche',3,{color:'#F2A23C'}],['eiche',2,{color:'#E8705A'}],['birke',1.5,{color:'#FFD35C'}],['baumstamm_liegend',.4]],treeD:1.6,
    deco:[['laubhaufen',4],['pilzgruppe',3],['farn',1.5],['baumstumpf',1]],decoD:4,
    rocks:[['stein',2],['findling',.5]],rockD:.5,litter:[['blatt_herbst',2],['ast',2],['morchel',.5]]},
  kirschhain:{n:'Kirschhain',g:['#B8E48E','#A6D87E'],cliff:'#C49366',pat:'gras',grass:'#AEDE84',grassD:.9,
    trees:[['kirschbaum',5]],treeD:1.3,deco:[['blume',4,{color:'#FFB8D8'}],['klee',3],['grasbuesche',2]],decoD:5,
    rocks:[['kiesel',1]],rockD:.2,litter:[['unkraut',1]]},
  sumpf:{n:'Sumpf',g:['#86B26A','#76A25E'],cliff:'#8C7A58',pat:'moos',grass:'#7FAE63',grassD:.8,
    trees:[['weide',3],['baumstamm_liegend',1]],treeD:.9,deco:[['schilf',6],['moorgras',3],['moospolster',2],['pilzgruppe',1]],decoD:6,
    rocks:[['stein',1]],rockD:.3,litter:[['ast',1]]},
  strand:{n:'Strand',g:['#FFE6AE','#F6D89A'],cliff:'#D9B27C',pat:'sand',grass:null,
    trees:[['palme',1]],treeD:.12,deco:[['muschel_deko',2],['treibholz',1],['duenengras',2]],decoD:1.2,
    rocks:[['stein',1],['kiesel',2]],rockD:.6,litter:[['muschel',2],['stein_klein',1],['jakobsmuschel',.4]]},
  /* --- Schrott-Mond --- */
  schrottebene:{n:'Schrottebene',g:['#BDAFD8','#A99BC6'],cliff:'#8D7FAE',pat:'staub',grass:'#A89BC4',grassD:.3,
    trees:[['antennenbaum',2]],treeD:.25,deco:[['schrotthaufen',2],['glühpilz',1],['kiesel',2]],decoD:1.5,
    rocks:[['felsen',1],['stein',2]],rockD:.6,litter:[['schraube',3],['kabelrest',2]]},
  kristallfeld:{n:'Kristallfeld',g:['#D2C6EC','#C2B4E0'],cliff:'#9A8BC0',pat:'staub',grass:null,
    trees:[['kristallbaum',3]],treeD:.7,deco:[['kiesel',2],['glühpilz',1]],decoD:1.2,rocks:[['kristallfels',3],['felsen',.5]],rockD:1.5,litter:[['schraube',1],['stein_klein',2]]},
  gluehwald:{n:'Glühwald',g:['#8F82B4','#7F72A6'],cliff:'#6A5C90',pat:'moos',grass:'#7FDCD4',grassD:.6,
    trees:[['antennenbaum',1],['riesenpilz',1.5],['kristallbaum',1]],treeD:1,deco:[['glühpilz',6],['leuchtpilzgruppe',3]],decoD:4,
    rocks:[['stein',1]],rockD:.3,litter:[['leuchtspore',2],['kabelrest',1]]},
  /* --- Korallen-Welt --- */
  palmenhain:{n:'Palmenhain',g:['#A9E07A','#95D26A'],cliff:'#C9A070',pat:'gras',grass:'#9ED872',grassD:.8,
    trees:[['palme',4],['kokospalme_klein',2],['busch',1]],treeD:1.2,deco:[['blume',3],['hortensienbusch',1],['grasbuesche',3],['kaktus',.3]],decoD:4,
    rocks:[['stein',1]],rockD:.3,litter:[['kokosnuss',.5],['ast',1]]},
  felsinsel:{n:'Felsinsel',g:['#DCC8A2','#CDB690'],cliff:'#B8956A',pat:'sand',grass:'#B9D87A',grassD:.25,
    trees:[['kaktus',1],['busch',1]],treeD:.3,deco:[['muschel_deko',1],['duenengras',2]],decoD:1.5,rocks:[['felsen',3],['felsbogen',.25],['findling',1]],rockD:1.4,litter:[['stein_klein',2],['koralle_stueck',1]]},
  riffstrand:{n:'Riffstrand',g:['#FFE8B8','#F7DCA2'],cliff:'#E0B888',pat:'sand',grass:null,
    trees:[['kokospalme_klein',1]],treeD:.15,deco:[['koralle',2,{water:true}],['muschel_deko',2],['treibholz',1]],decoD:1.5,rocks:[['kiesel',2]],rockD:.5,litter:[['muschel',2],['sanddollar',.5],['seeglas',.5]]},
  /* --- Frost-Stern --- */
  schneefeld:{n:'Schneefeld',g:['#F6F9FF','#E8F0FF'],cliff:'#A9BCE0',pat:'schnee',grass:'#E4EEFF',grassD:.2,
    trees:[['schneetanne',1],['winterbirke',1],['schneebusch',2]],treeD:.35,deco:[['schneehaufen',2],['gefrorener_busch',1],['schneemann',.12]],decoD:1.5,
    rocks:[['eisfels',1],['stein',1,{planet:'frost'}]],rockD:.6,litter:[['schneeball',2],['eiskristall',1],['kiefernzapfen',1]]},
  tannenwald:{n:'Tannenwald',g:['#EDF3FF','#DFE8FA'],cliff:'#9CAED4',pat:'schnee',grass:null,
    trees:[['schneetanne',5],['tanne',1],['baumstamm_liegend',.4]],treeD:2,deco:[['schneebusch',2],['schneehaufen',2]],decoD:2,
    rocks:[['eisfels',.5],['findling',.5]],rockD:.4,litter:[['kiefernzapfen',3],['ast',2]]},
  eisufer:{n:'Eisufer',g:['#E2EEFF','#D2E2FA'],cliff:'#8FA8D4',pat:'schnee',grass:null,
    trees:[['winterbirke',1]],treeD:.1,deco:[['eisfels',1],['eiszapfenfels',1]],decoD:1,rocks:[['eisfels',2]],rockD:1,litter:[['eiskristall',2]]},
  polarhuegel:{n:'Polarhügel',g:['#F2F0FF','#E2DEFA'],cliff:'#A8A0D8',pat:'schnee',grass:'#E8E4FF',grassD:.2,
    trees:[['schneetanne',1],['gefrorener_busch',2]],treeD:.3,deco:[['schneehaufen',1],['eiszapfenfels',.5],['schneemann',.2]],decoD:1,rocks:[['eisfels',1]],rockD:.5,litter:[['eiskristall',1],['schneeball',1]]},
  /* --- Dünen-Planet --- */
  duenen:{n:'Dünen',g:['#FFDDAE','#F7CB90'],cliff:'#E09A6C',pat:'sand',grass:null,
    trees:[['saguaro',1],['totholz',.5]],treeD:.18,deco:[['duenengras',2],['rollbusch',1],['knochen_deko',.3],['wuestenstein',1]],decoD:1,
    rocks:[['wuestenstein',2]],rockD:.4,litter:[['wuestenrose',1],['stein_klein',2]]},
  oase:{n:'Oase',g:['#A6DC70','#92CC62'],cliff:'#C9A070',pat:'gras',grass:'#A6D86A',grassD:.9,
    trees:[['palme',3],['kokospalme_klein',1]],treeD:1,deco:[['oasenschilf',4],['blume',2],['busch',1]],decoD:4,rocks:[['stein',1]],rockD:.3,litter:[['kaktusfrucht',1],['ast',1]]},
  canyon:{n:'Canyon',g:['#EBAA7C','#DA9268'],cliff:'#C8724E',pat:'sand',grass:null,
    trees:[['saguaro',1],['feigenkaktus',1]],treeD:.25,deco:[['duenengras',1],['knochen_deko',.3],['wuestenstein',1]],decoD:1,
    rocks:[['tafelfels',1],['felsen',1],['wuestenstein',2]],rockD:.9,litter:[['stein_klein',2],['wuestenrose',.5]]},
  kakteenfeld:{n:'Kakteenfeld',g:['#F4D29A','#E6C286'],cliff:'#D8946A',pat:'sand',grass:'#D8D08A',grassD:.25,
    trees:[['saguaro',3],['feigenkaktus',3],['kaktus',2]],treeD:.8,deco:[['duenengras',2],['rollbusch',1],['blume',1,{color:'#FF8FB8'}]],decoD:2,
    rocks:[['wuestenstein',1]],rockD:.3,litter:[['kaktusfrucht',2]]},
  /* --- Sporen-Mond --- */
  pilzwald:{n:'Pilzwald',g:['#9280BC','#8070AC'],cliff:'#6A5A8C',pat:'moos',grass:'#A08ED2',grassD:.5,
    trees:[['pilzbaum',3],['riesenpilz',2]],treeD:1.3,deco:[['leuchtpilzgruppe',3],['sporenkugel',2],['pilzranke',1],['sporenblume',2]],decoD:4,
    rocks:[['schwammfels',1]],rockD:.4,litter:[['fliegenpilz_item',1],['leuchtspore',2],['morchel',1]]},
  sporensumpf:{n:'Sporensumpf',g:['#62AA9C','#529A8C'],cliff:'#4E7A78',pat:'moos',grass:'#6FC0B0',grassD:.6,
    trees:[['pilzbaum',1],['weide',1]],treeD:.6,deco:[['moorgras',4],['sporenkugel',2],['leuchtpilzgruppe',2]],decoD:4,
    rocks:[['schwammfels',1]],rockD:.5,litter:[['leuchtspore',2]]},
  moorwiese:{n:'Moorwiese',g:['#A2BC84','#90AC74'],cliff:'#7A6A58',pat:'moos',grass:'#A8C488',grassD:.9,
    trees:[['riesenpilz',1],['busch',1]],treeD:.35,deco:[['moorgras',3],['sporenblume',3],['pilzgruppe',2],['klee',1]],decoD:4,
    rocks:[['stein',1]],rockD:.3,litter:[['champignon',2],['unkraut',1]]}
};

/* ================= Planeten ================= */
const PLANETS={
  kompost:{n:'Kompost-Planet',R:138,R0:46,sea:-.25,music:'world',sky:['#9fd8ff','#ffe9c7'],fog:'#cfeaff',water:'#62CCEA',deep:'#3E9BD1',step:1.15,shop:'kompost',
    desc:'Wiesen, Wälder, Kirschhaine, Flüsse. Hier wohnt ihr.',weather:'blueten',orbit:[26,0],size:1,
    col:['#8FD36B','#62CCEA']},
  schrott:{n:'Schrott-Mond',R:108,R0:36,sea:-.15,music:'town',sky:['#b9a8e8','#ffd6c2'],fog:'#d9cdf2',water:'#6FE3C8',deep:'#3FB8A8',step:1.0,shop:'schrott',
    desc:'Kristalle, Kabelbäume, glühende Pilze.',weather:'funken',orbit:[40,1.4],size:.8,col:['#A99BC6','#6FE3C8']},
  korallen:{n:'Korallen-Welt',R:126,R0:42,sea:.05,music:'shop',sky:['#8fe3ff','#fff2c8'],fog:'#c8f2ff',water:'#4FD6E0',deep:'#2BA8D8',step:.85,shop:'korallen',
    desc:'Türkises Meer, Inseln, Palmen, Muscheln.',weather:'blasen',orbit:[54,2.6],size:.95,col:['#F7DCA2','#4FD6E0']},
  frost:{n:'Frost-Stern',R:114,R0:38,sea:-.3,music:'museum',sky:['#bcd6ff','#f4f0ff'],fog:'#e4ecff',water:'#8FD0F0',deep:'#5A9AD8',step:1.0,shop:'frost',
    desc:'Schnee, Tannen, Eisseen und Polarlicht.',weather:'schnee',orbit:[68,4.1],size:.85,col:['#EEF4FF','#8FD0F0']},
  wueste:{n:'Dünen-Planet',R:126,R0:42,sea:-.35,music:'shop',sky:['#9fd4ff','#ffe0b8'],fog:'#ffe8cc',water:'#5FD0D8',deep:'#3AA0C0',step:1.5,shop:'wueste',
    desc:'Dünen, Oasen, Canyons voller Kakteen.',weather:'sand',orbit:[82,5.2],size:.95,col:['#F7CB90','#5FD0D8']},
  pilz:{n:'Sporen-Mond',R:108,R0:36,sea:-.2,music:'home',sky:['#6e5aa8','#f4b8d8'],fog:'#b8a0d8',water:'#7FDCC8',deep:'#4A9AA0',step:.9,shop:'pilz',
    desc:'Riesenpilze, Leuchtsporen, Moorwiesen.',weather:'sporen',orbit:[96,.6],size:.8,col:['#8070AC','#7FDCC8']}
};
const PLACES={
  kompost:[
    {id:'platz',n:'Dorfplatz',lat:90,lon:0,r:.15,h:.9,build:'plaza'},
    
    
    
    
    {id:'haus',n:'Dein Haus',lat:57,lon:300,r:.09,h:.9,build:'house'},
    {id:'teich',n:'Teich',lat:48,lon:110,r:.09,pond:true},
    {id:'teich2',n:'Seerosen-Teich',lat:44,lon:250,r:.08,pond:true},
    {id:'see',n:'Waldsee',lat:20,lon:20,r:.12,pond:true}],
  schrott:[
    {id:'platz',n:'Schrott-Platz',lat:90,lon:0,r:.18,h:.7,build:'plaza'},
    
    
    {id:'teich',n:'Kühlwasser-Becken',lat:40,lon:120,r:.15,pond:true},
    {id:'teich2',n:'Leuchtbecken',lat:32,lon:300,r:.12,pond:true}],
  korallen:[
    {id:'platz',n:'Strandplatz',lat:90,lon:0,r:.18,h:.8,build:'plaza'},
    
    
    {id:'insel',n:'Palmeninsel',lat:15,lon:140,r:.2,h:.6}],
  frost:[
    {id:'platz',n:'Eisplatz',lat:90,lon:0,r:.18,h:.8,build:'plaza'},
    
    
    {id:'teich',n:'Eissee',lat:38,lon:150,r:.16,pond:true},
    {id:'teich2',n:'Polarsee',lat:25,lon:320,r:.12,pond:true}],
  wueste:[
    {id:'platz',n:'Basar-Platz',lat:90,lon:0,r:.18,h:1.0,build:'plaza'},
    
    
    {id:'teich',n:'Oase',lat:42,lon:130,r:.1,pond:true},
    {id:'teich2',n:'Palmen-Oase',lat:30,lon:300,r:.09,pond:true}],
  pilz:[
    {id:'platz',n:'Sporenplatz',lat:90,lon:0,r:.18,h:.7,build:'plaza'},
    
    
    {id:'teich',n:'Sporensee',lat:36,lon:160,r:.15,pond:true},
    {id:'teich2',n:'Moortümpel',lat:28,lon:20,r:.1,pond:true}]
};

/* Dorf-Ring: alle Gebäude dicht um den Platz, auf jedem Planeten */
const TOWN_RING=[['museum','museum'],['laden','shop'],['bar','bar'],['studio','studio'],['rathaus','rathaus'],['garage','garage'],['pflanzen','pflanzen'],['rakete','rocket'],['tiere','tiere'],['praxis','praxis'],['mode','mode']];
function townPlaces(pid){const R=PLANETS[pid].R;const pl=PLACES[pid].find(p=>p.build==='plaza');const h=pl?pl.h:.8;const d=27,lat=90-d/R*180/PI;const off={kompost:0,schrott:20,korallen:40,frost:10,wueste:30,pilz:50}[pid]||0;
  return TOWN_RING.map(([id,build],i)=>({id,n:id,lat,lon:off+i*360/TOWN_RING.length,r:(build==="rocket"?3.6:6.2)/R,h,build}))}
/* ================= Höhenfeld & Biome je Planet ================= */
function makePlanetFns(pid,extra){const def=PLANETS[pid];const seed={kompost:1,schrott:2,korallen:3,frost:4,wueste:5,pilz:6}[pid];const N=perlin3(seed),N2=perlin3(seed+40),N3=perlin3(seed+80);
  /* Ortsgrössen sind als Winkel angegeben (für den alten Radius R0): Gebäude behalten ihre echte Grösse, Seen wachsen etwas mit */
  const ks=(def.R0||def.R)/def.R;const places=PLACES[pid].map(pl=>Object.assign({dir:dirLL(pl.lat,pl.lon)},pl,{r:pl.r*(pl.build?ks:Math.min(1,ks*1.7))})).concat(townPlaces(pid).map(pl=>Object.assign({dir:dirLL(pl.lat,pl.lon)},pl))).concat(extra||[]);const R=def.R,sea=def.sea,step=def.step;
  const fbm=(p,f,o)=>N(p.x*f+o,p.y*f,p.z*f)*.6+N(p.x*f*2.1,p.y*f*2.1+o,p.z*f*2.1)*.28+N(p.x*f*4.3,p.y*f*4.3,p.z*f*4.3+o)*.12;
  const plazaDir=places[0].dir;const roads=places.filter(p=>p.build&&p!==places[0]).map(p=>[plazaDir,p.dir]);
  /* Detail-Rauschen in Welt-Einheiten (Hügel bleiben gleich gross, auch wenn der Planet wächst): q = p * R/R0 */
  const k=R/(def.R0||R);const q=new THREE.Vector3();
  /* Grossform je Planet: oc = Meeresanteil (Kontinent-Schwelle), m = Gebirgs-Schwelle, isl = Inselstärke */
  const MAC={kompost:{oc:-.1,m:.2,isl:1},schrott:{oc:-.32,m:.16,isl:.6},korallen:{oc:.14,m:.34,isl:1.5},frost:{oc:-.2,m:.1,isl:.8},wueste:{oc:-.4,m:.18,isl:.5},pilz:{oc:-.18,m:.24,isl:.9}}[pid]||{oc:-.2,m:.2,isl:1};
  const vilR=48/R;
  function raw(p){q.set(p.x*k,p.y*k,p.z*k);let h=0;
    switch(pid){
      case 'kompost':{h=fbm(q,1.3,3)*2.4+.9;/* Flüsse */const rv=Math.abs(N2(q.x*1.6,q.y*1.6,q.z*1.6));h-=2.9*sstep(.05,.0,rv)*sstep(-.3,.1,p.y);break}
      case 'schrott':{h=fbm(q,1.5,7)*2+.9;/* Krater */for(let i=0;i<7;i++){const c=dirLL(-50+i*23,i*97);const d=angle(p,c);const cr=.12+(i%3)*.05;if(d<cr*1.6){h+=(d<cr?-1.6*(1-Math.pow(d/cr,2)):.7*sstep(cr*1.6,cr,d))}}break}
      case 'korallen':{h=fbm(q,2.1,2)*2.2-.6+1.5*sstep(.35,.85,p.y)+.8*Math.max(0,N2(q.x*3,q.y*3,q.z*3));break}
      case 'frost':{h=fbm(q,1.2,5)*2.2+.9;const ridge=1-Math.abs(N2(q.x*2.2,q.y*2.2,q.z*2.2));h+=Math.pow(ridge,6)*2.4-.4;break}
      case 'wueste':{h=fbm(q,1.1,9)*1.6+.9;/* Dünen: Wellen quer zum Wind */const w=Math.sin((p.x*.8+p.z*.6)*R*.55+N2(q.x*2,q.y*2,q.z*2)*4)*.35;h+=w*sstep(.2,-.2,N3(q.x*1.5,q.y*1.5,q.z*1.5));
        /* Tafelberge */const mesa=N3(q.x*2.4,q.y*2.4,q.z*2.4);if(mesa>.28)h+=2.6*sstep(.28,.34,mesa);break}
      case 'pilz':{h=fbm(q,1.6,4)*2+.7;break}}
    /* ---- Grossform: Kontinente, Ozeane mit Inseln, Gebirge (das Dorf am Nordpol bleibt geschützt) ---- */
    const a=Math.acos(Math.max(-1,Math.min(1,p.y)));const V=sstep(vilR*1.9,vilR,a);
    const cont=N3(p.x*1.4+11,p.y*1.4,p.z*1.4)*.75+N(p.x*3.1,p.y*3.1+5,p.z*3.1)*.25;
    const oc=sstep(MAC.oc+.05,MAC.oc-.1,cont)*(1-V);
    if(oc>0){/* Inseln: einzelne Buckel im Meer, manche ragen hoch hinaus */const isl=Math.max(0,N2(q.x*.42+7,q.y*.42,q.z*.42)-.16)*15*MAC.isl;h=h*(1-oc)+oc*(sea-3.4+isl+Math.max(0,h-1)*.3)}
    const mm=sstep(MAC.m,MAC.m+.22,N2(p.x*1.9+3,p.y*1.9,p.z*1.9))*(1-oc)*(1-V);
    if(mm>0){/* Gebirge: Grate aus Rauschen, stufig durch die Terrassen → begehbar */const ridge=1-Math.abs(N3(q.x*.2,q.y*.2+9,q.z*.2));h+=mm*(2+ridge*ridge*ridge*9)}
    /* Dorfgebiet: keine trockenen Mulden zwischen den Häusern */if(V>0)h+=V*Math.max(0,sea+.95-h);
    return h}
  const terr=pid!=='frost'&&pid!=='wueste'?1:pid==='wueste'?.5:.35;
  function hAt(p){let h=raw(p);/* Terrassen im Tierdorf-Stil: flache Stufen, steile Kanten */
    if(h>sea+.25){const k=(h-sea)/step;const f=k-Math.floor(k);const t=(Math.floor(k)+sstep(.4,.6,f))*step+sea;h=h*(1-terr)+t*terr}
    for(const pl of places){const d=angle(p,pl.dir);if(pl.pond){if(d<pl.r*1.35){const t=sstep(pl.r*1.35,pl.r*.5,d);h=h*(1-t)+(sea-1.1)*t}}
      else if(d<pl.r*1.6){const t=sstep(pl.r*1.6,pl.r*1.05,d);h=h*(1-t)+(pl.h??.8)*t}}
    /* Wege sanft glätten */let rd=9;for(const[a,b]of roads)rd=Math.min(rd,distToArc(p,a,b));if(rd<.03){const t=sstep(.03,.012,rd);const hs=Math.max(sea+.3,Math.round((h-sea)/step)*step+sea);h=h*(1-t*.6)+hs*t*.6}
    return h}
  function roadDist(p){let rd=9;for(const[a,b]of roads)rd=Math.min(rd,distToArc(p,a,b));return rd}
  /* Biom aus Temperatur T, Feuchte M, Höhe h, Wassernähe */
  const PEAK={kompost:'schneefeld',schrott:'kristallfeld',korallen:'felsinsel',frost:'polarhuegel',wueste:'canyon',pilz:'moorwiese'};
  function biomeAt(p,h){if(h===undefined)h=hAt(p);if(h>sea+6.5&&PEAK[pid]&&BIOMES[PEAK[pid]])return PEAK[pid];const T=N2(p.x*1.1+5,p.y*1.1,p.z*1.1),M=N3(p.x*1.25,p.y*1.25+3,p.z*1.25);const nearPond=places.some(pl=>pl.pond&&angle(p,pl.dir)<pl.r*2.2);const low=h<sea+.55;
    switch(pid){
      case 'kompost':if(low&&h<sea+.45&&!nearPond)return'strand';if(nearPond||M>.32)return'sumpf';if(T>.28)return'kirschhain';if(T<-.3)return'herbstwald';if(M<-.18)return'wald';if(M>.1&&T>0)return'blumenfeld';return'wiese';
      case 'schrott':if(T>.15)return'kristallfeld';if(M>.2||nearPond)return'gluehwald';return'schrottebene';
      case 'korallen':if(h<sea+.7)return'riffstrand';if(h>sea+2.2||M<-.25)return'felsinsel';return'palmenhain';
      case 'frost':if(nearPond||low)return'eisufer';if(T>.2)return'polarhuegel';if(M>-.05)return'tannenwald';return'schneefeld';
      case 'wueste':if(nearPond)return'oase';if(h>sea+2.6)return'canyon';if(M>.18)return'kakteenfeld';if(T<-.25)return'canyon';return'duenen';
      case 'pilz':if(nearPond||M>.3)return'sporensumpf';if(T>.15)return'moorwiese';return'pilzwald'}}
  return{hAt,biomeAt,places,R,sea,roads,roadDist,def,pid,terr}}

/* ================= Boden-Shader ================= */
const GROUND_GLSL=`
float h31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float dots2(vec2 uv,float r){vec2 g=floor(uv);vec2 f=fract(uv)-.5;vec2 o=vec2(h21(g),h21(g+7.3))-.5;float s=.55+.6*h21(g+3.1);return smoothstep(r*s,r*s-.06,length(f-o*.45));}
float cells2(vec2 uv){vec2 g=floor(uv),f=fract(uv);float d=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 b=vec2(i,j);vec2 o=vec2(h21(g+b),h21(g+b+5.1));d=min(d,length(b+o-f));}return d;}
float tri(vec3 p,vec3 w,float s,float r){return dots2(p.yz*s,r)*w.x+dots2(p.xz*s,r)*w.y+dots2(p.xy*s,r)*w.z;}
float triC(vec3 p,vec3 w,float s){return cells2(p.yz*s)*w.x+cells2(p.xz*s)*w.y+cells2(p.xy*s)*w.z;}
`;
/* Gemalte Boden-Texturen (grau um 50 %, werden mit der Biomfarbe multipliziert); kachelbar, mit Mipmaps */
function groundTex(kind){const key='gt-'+kind;return ctex(key,512,512,(x,w,h)=>{const r=srand(kind.length*31+7);x.fillStyle='#808080';x.fillRect(0,0,w,h);
  const wrap=(f)=>{for(const dx of[-w,0,w])for(const dy of[-h,0,h]){x.save();x.translate(dx,dy);f();x.restore()}};
  /* weiche Flecken */for(let i=0;i<40;i++){const px=r()*w,py=r()*h,rad=30+r()*70,l=r()<.5;wrap(()=>{const g=x.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,l?'rgba(150,150,150,.35)':'rgba(100,100,100,.3)');g.addColorStop(1,'rgba(128,128,128,0)');x.fillStyle=g;x.fillRect(px-rad,py-rad,rad*2,rad*2)})}
  if(kind==='gras'){x.lineCap='round';for(let i=0;i<1500;i++){const px=r()*w,py=r()*h,L=7+r()*13,a=-PI/2+(r()-.5)*.9,cv=(r()-.5)*.6;const light=r()<.55;const c=light?150+r()*40:78+r()*30;
      wrap(()=>{x.strokeStyle=`rgb(${c},${c},${c})`;x.lineWidth=1.6+r()*1.8;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a+cv)*L*.5,py+Math.sin(a+cv)*L*.5,px+Math.cos(a)*L,py+Math.sin(a)*L);x.stroke()})}
    for(let i=0;i<60;i++){const px=r()*w,py=r()*h;wrap(()=>{x.fillStyle='rgba(190,190,190,.8)';for(let k=0;k<3;k++){x.beginPath();x.arc(px+Math.cos(k*2.1)*3,py+Math.sin(k*2.1)*3,2.6,0,TAU);x.fill()}})}}
  else if(kind==='sand'){for(let i=0;i<2600;i++){const px=r()*w,py=r()*h,c=r()<.5?160+r()*40:90+r()*25;x.fillStyle=`rgb(${c},${c},${c})`;x.beginPath();x.arc(px,py,.8+r()*1.6,0,TAU);x.fill()}
    x.strokeStyle='rgba(105,105,105,.35)';x.lineWidth=3;for(let j=0;j<9;j++){x.beginPath();for(let i=0;i<=32;i++){const px=i*16,py=j*58+Math.sin(i*.5+j)*8;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}}
  else if(kind==='schnee'){for(let i=0;i<50;i++){const px=r()*w,py=r()*h,rad=20+r()*40;wrap(()=>{x.fillStyle='rgba(150,150,150,.25)';x.beginPath();x.ellipse(px,py,rad,rad*.6,r()*3,0,TAU);x.fill()})}
    for(let i=0;i<600;i++){x.fillStyle='rgba(200,200,200,.9)';x.fillRect(r()*w,r()*h,1.5,1.5)}}
  else{for(let i=0;i<260;i++){const px=r()*w,py=r()*h,rad=4+r()*12,c=r()<.5?150:100;wrap(()=>{x.fillStyle=`rgba(${c},${c},${c},.7)`;x.beginPath();x.arc(px,py,rad,0,TAU);x.fill()})}}},{repeat:true})}
function groundMaterial(fns){const def=fns.def;const m=new THREE.MeshToonMaterial({gradientMap:TOON_RAMP,vertexColors:true});
  const tx=k=>{const t=groundTex(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.LinearEncoding;t.needsUpdate=true;return t};
  const U={uR:{value:fns.R},uSea:{value:fns.sea},uPath:{value:new THREE.Color(def.path||'#EBD2A0')},uT:{value:0},uStep:{value:def.step||1},uTerr:{value:fns.terr??1},tG:{value:tx('gras')},tS:{value:tx('sand')},tW:{value:tx('schnee')},tM:{value:tx('moos')}};m.userData.U=U;
  m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);
    s.vertexShader='attribute vec4 aMat;attribute vec4 aPat;attribute vec3 aCl;varying vec4 vMat;varying vec4 vPat;varying vec3 vObj;varying vec3 vNo;varying vec3 vCl;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vMat=aMat;vPat=aPat;vObj=position;vNo=normal;vCl=aCl;');
    s.fragmentShader='uniform float uR;uniform float uSea;uniform vec3 uPath;uniform float uT;uniform float uStep;uniform float uTerr;uniform sampler2D tG;uniform sampler2D tS;uniform sampler2D tW;uniform sampler2D tM;varying vec4 vMat;varying vec4 vPat;varying vec3 vObj;varying vec3 vNo;varying vec3 vCl;\n'+GROUND_GLSL+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      {vec3 n=normalize(vObj);vec3 w=pow(abs(n),vec3(4.));w/=dot(w,vec3(1.));float hh=length(vObj)-uR;vec3 c=diffuseColor.rgb;
       float fw=length(fwidth(vObj));/* Detail blendet mit Entfernung aus → kein Flimmern */float near=1.-smoothstep(.06,.35,fw);
       float big=vn(vObj*.16);float mid=vn(vObj*.7+3.);c*=.9+.2*big;
       /* Gras: Tierdorf-Kreise + gemalte Halm-Striche */ float gd=tri(vObj,w,1.35,.2);float gs=tri(vObj+11.,w,3.1,.12);c=mix(c,c*(1.+.11*gd-.07*gs),vPat.x);
       {vec2 q=(vObj.xz*w.y+vObj.yz*w.x+vObj.xy*w.z)*5.5;vec2 gi=floor(q);vec2 gf=fract(q)-.5;float r=h21(gi);vec2 o=vec2(r,h21(gi+2.7))-.5;vec2 d=gf-o*.5;
        float blade=smoothstep(.09,.0,abs(d.x+d.y*.35*(r-.5)))*smoothstep(.3,.0,abs(d.y))*step(.25,r);c=mix(c,c*vec3(1.16,1.22,1.05),blade*vPat.x*near);
        float bl2=smoothstep(.08,.0,abs(d.x*1.3-d.y*.3))*smoothstep(.22,.0,abs(d.y+.1))*step(.7,h21(gi+9.1));c=mix(c,c*vec3(.82,.88,.8),bl2*vPat.x*near);}
       /* gemalte Texturen, dreiseitig projiziert */{float sc=.32;vec2 ax=vObj.yz*sc,ay=vObj.xz*sc,az=vObj.xy*sc;
        vec3 tg=(texture2D(tG,ay).rgb*w.y+texture2D(tG,ax).rgb*w.x+texture2D(tG,az).rgb*w.z)*2.;
        vec3 ts=(texture2D(tS,ay*1.3).rgb*w.y+texture2D(tS,ax*1.3).rgb*w.x+texture2D(tS,az*1.3).rgb*w.z)*2.;
        vec3 tw=(texture2D(tW,ay).rgb*w.y+texture2D(tW,ax).rgb*w.x+texture2D(tW,az).rgb*w.z)*2.;
        vec3 tm=(texture2D(tM,ay).rgb*w.y+texture2D(tM,ax).rgb*w.x+texture2D(tM,az).rgb*w.z)*2.;
        c=mix(c,c*tg,vPat.x*.95);c=mix(c,c*ts,vPat.y*.8);c=mix(c,c*tw,vPat.z*.7);c=mix(c,c*tm,vPat.w*.85);}
       /* helle Sonnenflecken und kühle Schattenflecken (Tierdorf-Look) */{float pa=vn(vObj*.38+7.);float pb=vn(vObj*.55-3.);c=mix(c,c*vec3(1.1,1.12,.94),smoothstep(.55,.7,pa)*vPat.x*.9);c=mix(c,c*vec3(.86,.94,1.02),smoothstep(.58,.72,pb)*vPat.x*.8);
        float spk=tri(vObj+23.,w,7.,.07);c=mix(c,vec3(1.,.98,.86),spk*vPat.x*near*.35);}
       /* Sand: Sprenkel */ float sp=tri(vObj,w,6.,.1);float sp2=tri(vObj+5.,w,2.4,.14);c=mix(c,c*(1.-.09*sp+.05*sp2),vPat.y);
       /* Schnee: Glitzer */ float gl=tri(vObj+2.,w,5.,.07);c=mix(c,c+vec3(.16,.18,.22)*gl*(.6+.4*sin(uT*2.+dot(vObj,vec3(3.)))),vPat.z);c=mix(c,c*(.94+.1*mid),vPat.z);
       /* Moos/Staub: Flecken */ float bl=smoothstep(.45,.6,vn(vObj*1.1));c=mix(c,c*(.9+.14*bl),vPat.w);
       /* nasser Rand am Wasser */ c*=1.-.28*vMat.z;
       /* Pflasterweg */ float cb=triC(vObj,w,2.2);vec3 pc=uPath*(.9+.14*vn(vObj*2.))*(1.-.2*smoothstep(.72,.82,cb))*(1.+.06*(1.-smoothstep(.2,.5,cb)));c=mix(c,pc,vMat.y);
       /* Klippen pro Pixel: Terrassen-Höhenlinie → scharfe, glatte Grasskante wie in Animal Crossing */
       float slope=1.-dot(normalize(vNo),n);float lev=(hh-uSea)/uStep+(vn(vObj*1.3)-.5)*.07;float fr=fract(lev);
       float ter=step(uSea+.28,hh)*smoothstep(.05,.14,slope)*uTerr;
       float cliffT=smoothstep(.05,.1,fr)*smoothstep(.95,.9,fr)*ter;float cliff=clamp(max(cliffT,vMat.x*smoothstep(.2,.36,slope)*(1.-uTerr*.6)),0.,1.);
       float lipDark=smoothstep(.86,.9,fr)*smoothstep(.93,.9,fr)*ter;float lipLight=smoothstep(.9,.93,fr)*smoothstep(.99,.96,fr)*ter;
       float st=fract(hh*1.25+vn(vObj*.3)*.55);float band=smoothstep(.0,.05,st)*smoothstep(.36,.3,st);float crack=smoothstep(.035,.0,abs(st-.66));
       float rk=triC(vObj,w,1.1);vec3 cc=vCl*(.86+.16*band)*(.92+.14*smoothstep(.2,.7,rk))*(1.-.22*crack*near);cc*=.82+.25*smoothstep(.1,.85,fr);
       c=mix(c,cc,cliff);c*=1.-.35*lipDark;c=mix(c,c*1.12,lipLight*(1.-cliff));
       /* Gras nicht neon: etwas entsättigen und abdunkeln, damit Details sichtbar bleiben */float lum=dot(c,vec3(.3,.59,.11));c=mix(vec3(lum),c,mix(1.,.78,vPat.x*(1.-cliff)))*mix(1.,.8,vPat.x*(1.-cliff));
       diffuseColor.rgb=c;}`)};
  m.customProgramCacheKey=()=>'ground';return m}

/* ================= Gelände-Mesh ================= */
function buildTerrainMesh(fns,detail){const def=fns.def;const R=fns.R,sea=fns.sea;
  let g=new THREE.IcosahedronGeometry(1,detail);g.deleteAttribute('normal');g.deleteAttribute('uv');g=THREE.BufferGeometryUtils.mergeVertices(g);
  const pos=g.attributes.position;const n=pos.count;const col=new Float32Array(n*3),mat=new Float32Array(n*4),pat=new Float32Array(n*4),hs=new Float32Array(n);const bio=new Array(n);
  const v=new THREE.Vector3();const tmp=new THREE.Color(),tmp2=new THREE.Color();const PATI={gras:0,sand:1,schnee:2,moos:3,staub:3};
  for(let i=0;i<n;i++){v.fromBufferAttribute(pos,i).normalize();const h=fns.hAt(v);hs[i]=h;const b=fns.biomeAt(v,h);bio[i]=b;const B=BIOMES[b];
    const t=Math.max(0,Math.min(1,(h-sea)/4));tmp.set(B.g[0]).lerp(tmp2.set(B.g[1]),t);
    if(h<sea-.2)tmp.set(def.bed||'#E6D2A0').lerp(tmp2.set(B.g[0]),.25);else tmp.offsetHSL(0,-.1,-.035);
    col[i*3]=tmp.r;col[i*3+1]=tmp.g;col[i*3+2]=tmp.b;const pi=h<sea+.05?1:PATI[B.pat];pat[i*4+pi]=1;
    const rd=fns.roadDist(v);mat[i*4+1]=h>sea+.2?sstep(.026,.016,rd):0;for(const pl of fns.places)if(pl.build&&pl.build!=='residence'){const d=angle(v,pl.dir);mat[i*4+1]=Math.max(mat[i*4+1],sstep(pl.r*.95,pl.r*.7,d)*(pl.build==='plaza'?1:.8))}
    mat[i*4+2]=h>sea-.1&&h<sea+.18?sstep(sea+.18,sea+.02,h):0;
    v.multiplyScalar(R+h);pos.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();const nr=g.attributes.normal;
  /* Klippen: Neigung gegenüber radial → Klippenfarbe */
  /* Klippenfarbe separat: der Shader entscheidet pro Pixel (scharfe Terrassenkanten statt Vertex-Zickzack) */
  const cl=new Float32Array(n*3);
  for(let i=0;i<n;i++){v.fromBufferAttribute(pos,i).normalize();const nn=new THREE.Vector3().fromBufferAttribute(nr,i);const slope=1-nn.dot(v);const c=sstep(.12,.3,slope)*(hs[i]>sea-.3?1:.4);mat[i*4]=c;
    tmp.set(BIOMES[bio[i]].cliff);cl[i*3]=tmp.r;cl[i*3+1]=tmp.g;cl[i*3+2]=tmp.b;if(c>0)mat[i*4+1]*=1-c}
  g.setAttribute('aCl',new THREE.BufferAttribute(cl,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aMat',new THREE.BufferAttribute(mat,4));g.setAttribute('aPat',new THREE.BufferAttribute(pat,4));
  const mesh=new THREE.Mesh(g,groundMaterial(fns));mesh.receiveShadow=true;mesh.name='planet';return mesh}

/* Gleiche Boden-Attribute wie buildTerrainMesh, aber je Vertex für die LOD-Kacheln (planet.js) */
function terrainVattr(fns){const def=fns.def,sea=fns.sea;const tmp=new THREE.Color(),tmp2=new THREE.Color();const PATI={gras:0,sand:1,schnee:2,moos:3,staub:3};
  const builds=fns.places.filter(pl=>pl.build&&pl.build!=='residence');
  return(d,h,n,k,col,pat,mat,cl)=>{const b=fns.biomeAt(d,h);const B=BIOMES[b];const t=Math.max(0,Math.min(1,(h-sea)/4));tmp.set(B.g[0]).lerp(tmp2.set(B.g[1]),t);
    if(h<sea-.2)tmp.set(def.bed||'#E6D2A0').lerp(tmp2.set(B.g[0]),.25);else tmp.offsetHSL(0,-.1,-.035);
    col[k*3]=tmp.r;col[k*3+1]=tmp.g;col[k*3+2]=tmp.b;const pi=h<sea+.05?1:PATI[B.pat];pat[k*4]=pat[k*4+1]=pat[k*4+2]=pat[k*4+3]=0;pat[k*4+pi]=1;
    let path=0;if(h>sea+.2){const rd=fns.roadDist(d);path=sstep(.026,.016,rd)}for(const pl of builds){const dd=angle(d,pl.dir);if(dd<pl.r)path=Math.max(path,sstep(pl.r*.95,pl.r*.7,dd)*(pl.build==='plaza'?1:.8))}
    const slope=1-n.dot(d);const c=sstep(.12,.3,slope)*(h>sea-.3?1:.4);mat[k*4]=c;mat[k*4+1]=path*(1-c);mat[k*4+2]=h>sea-.1&&h<sea+.18?sstep(sea+.18,sea+.02,h):0;mat[k*4+3]=0;
    tmp.set(B.cliff);cl[k*3]=tmp.r;cl[k*3+1]=tmp.g;cl[k*3+2]=tmp.b}}
function buildWaterMesh(fns,detail){const def=fns.def;let wg=new THREE.IcosahedronGeometry(fns.R+fns.sea,detail);const wp=wg.attributes.position;const dep=new Float32Array(wp.count);const v=new THREE.Vector3();
  for(let i=0;i<wp.count;i++){v.fromBufferAttribute(wp,i).normalize();dep[i]=fns.sea-fns.hAt(v)}wg.setAttribute('depth',new THREE.BufferAttribute(dep,1));
  const wu={uT:{value:0},uShallow:{value:new THREE.Color(def.water)},uDeep:{value:new THREE.Color(def.deep)},uFoam:{value:new THREE.Color('#ffffff')},uIce:{value:fns.pid==='frost'?1:0}};
  const wm=new THREE.ShaderMaterial({uniforms:wu,transparent:true,fog:false,vertexShader:`attribute float depth;varying float vD;varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vD=depth;vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;vN=normalMatrix*normal;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uT;uniform float uIce;uniform vec3 uShallow,uDeep,uFoam;varying float vD;varying vec3 vP;varying vec3 vN;varying vec3 vV;
    float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    void main(){if(vD<-0.02)discard;float d=clamp(vD/1.8,0.,1.);vec3 c=mix(uShallow,uDeep,smoothstep(.1,.9,d));
     float w=sin(vP.x*1.1+uT*1.1)*sin(vP.z*.9-uT*.9)+sin(vP.y*1.4+uT*.7);float band=step(.93,fract(w*.5+uT*.05));c=mix(c,vec3(1.),band*.16*(1.-d)*(1.-uIce));
     float foam=1.-smoothstep(.0,.14+.05*sin(uT*2.+vP.x*3.+vP.z*2.),vD);float ring=step(.55,fract(vD*4.5-uT*.45))*(1.-smoothstep(.08,.4,vD));c=mix(c,uFoam,max(foam,ring*.5*(1.-uIce)));
     if(uIce>.5){float cr=step(.985,h3(floor(vP*2.)));c=mix(c,vec3(.95,.98,1.),.35+.2*cr);}
     float fr=pow(1.-clamp(dot(normalize(vN),normalize(vV)),0.,1.),3.);c+=fr*.16;gl_FragColor=vec4(c,mix(.8,.94,d));}`});
  const m=new THREE.Mesh(wg,wm);m.renderOrder=2;return{mesh:m,U:wu}}

/* ================= Grasbüschel (flauschig, gebogen) ================= */
function tuftGeometry(){const blades=7;const segs=4;const pos=[],tip=[],idx=[];let base=0;
  for(let b=0;b<blades;b++){const a=b/blades*TAU+(b%2)*.4;const lean=.18+(b%3)*.08;const h=.28+(b%4)*.05;const w=.045;const dx=Math.cos(a),dz=Math.sin(a);const ox=dx*.05,oz=dz*.05;
    for(let s=0;s<=segs;s++){const t=s/segs;const ww=w*(1-t*.85);const y=h*t;const off=lean*t*t;const cx=ox+dx*off,cz=oz+dz*off;const px=-dz*ww,pz=dx*ww;
      pos.push(cx+px,y,cz+pz,cx-px,y,cz-pz);tip.push(t,t)}
    for(let s=0;s<segs;s++){const i=base+s*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(segs+1)*2}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('tip',new THREE.Float32BufferAttribute(tip,1));g.setIndex(idx);g.computeVertexNormals();
  /* Normalen nach oben biegen: weiche Schattierung wie Fell */const nr=g.attributes.normal;for(let i=0;i<nr.count;i++){nr.setXYZ(i,nr.getX(i)*.35,1,nr.getZ(i)*.35)}nr.needsUpdate=true;return g}
function grassMaterial(uT){const m=new THREE.MeshToonMaterial({gradientMap:TOON_RAMP,side:THREE.DoubleSide});
  m.onBeforeCompile=s=>{s.uniforms.uT=uT;s.vertexShader='uniform float uT;attribute float tip;varying float vTip;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vTip=tip;float ph=instanceMatrix[3].x*.7+instanceMatrix[3].z*.5+instanceMatrix[3].y*.3;transformed.x+=sin(uT*1.9+ph)*tip*tip*.09;transformed.z+=cos(uT*1.5+ph)*tip*tip*.06;`);
    s.fragmentShader='varying float vTip;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=mix(.62,1.18,smoothstep(0.,1.,vTip));')};
  m.customProgramCacheKey=()=>'tuft';return m}

/* ---------- Exakte Bodenhöhe: Strahl vom Planetenkern durch das echte Dreiecksnetz.
   So stehen Bäume, Steine und Figuren genau auf dem sichtbaren Boden – nichts schwebt, nichts versinkt. ---------- */
function makeSurface(mesh,fns){const g=mesh.geometry;const pos=g.attributes.position.array,idx=g.index.array;const nv=pos.length/3,nt=idx.length/3;
  const u=new Float32Array(nv*3);for(let i=0;i<nv;i++){const x=pos[i*3],y=pos[i*3+1],z=pos[i*3+2];const l=Math.hypot(x,y,z)||1;u[i*3]=x/l;u[i*3+1]=y/l;u[i*3+2]=z/l}
  const cnt=new Uint32Array(nv+1);for(let i=0;i<idx.length;i++)cnt[idx[i]+1]++;for(let i=0;i<nv;i++)cnt[i+1]+=cnt[i];const fill=cnt.slice(0,nv);const adj=new Uint32Array(idx.length);for(let t=0;t<nt;t++)for(let k=0;k<3;k++)adj[fill[idx[t*3+k]]++]=t;
  let emin=9;for(let t=0;t<Math.min(nt,400);t++){const a=idx[t*3],b=idx[t*3+1];emin=Math.min(emin,Math.hypot(u[a*3]-u[b*3],u[a*3+1]-u[b*3+1],u[a*3+2]-u[b*3+2]))}
  const C=1/Math.max(emin*1.1,.004);const O=Math.ceil(C)+2,S=2*O+1;const key=(x,y,z)=>((x+O)*S+(y+O))*S+(z+O);const cells=new Map();
  for(let i=0;i<nv;i++){const k=key(Math.floor(u[i*3]*C),Math.floor(u[i*3+1]*C),Math.floor(u[i*3+2]*C));let a=cells.get(k);if(!a)cells.set(k,a=[]);a.push(i)}
  const cand=[];
  function ray(t,dx,dy,dz){const a=idx[t*3]*3,b=idx[t*3+1]*3,c=idx[t*3+2]*3;const e1x=pos[b]-pos[a],e1y=pos[b+1]-pos[a+1],e1z=pos[b+2]-pos[a+2],e2x=pos[c]-pos[a],e2y=pos[c+1]-pos[a+1],e2z=pos[c+2]-pos[a+2];
    const px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x;const det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-12)return -1;const inv=1/det;
    const tx=-pos[a],ty=-pos[a+1],tz=-pos[a+2];const uu=(tx*px+ty*py+tz*pz)*inv;if(uu<-1e-5||uu>1+1e-5)return -1;const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x;const vv=(dx*qx+dy*qy+dz*qz)*inv;if(vv<-1e-5||uu+vv>1+1e-5)return -1;
    return(e2x*qx+e2y*qy+e2z*qz)*inv}
  function h(p){const l=Math.hypot(p.x,p.y,p.z)||1;const dx=p.x/l,dy=p.y/l,dz=p.z/l;const cx=Math.floor(dx*C),cy=Math.floor(dy*C),cz=Math.floor(dz*C);cand.length=0;
    for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const a=cells.get(key(cx+x,cy+y,cz+z));if(a)for(const i of a)cand.push((u[i*3]-dx)**2+(u[i*3+1]-dy)**2+(u[i*3+2]-dz)**2,i)}
    /* nächste Vertices zuerst: deren Dreiecke enthalten praktisch immer den Treffer */
    for(let pass=0;pass<4&&cand.length;pass++){let bi=-1,bd=1e9;for(let j=0;j<cand.length;j+=2)if(cand[j]<bd){bd=cand[j];bi=j}if(bi<0)break;const vi=cand[bi+1];cand[bi]=1e9;
      for(let k=cnt[vi];k<cnt[vi+1];k++){const r=ray(adj[k],dx,dy,dz);if(r>0)return r-fns.R}}
    return fns.hAt(p)}
  return h}
