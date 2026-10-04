/* =====================================================================
   CYBORG-LABOR · fundus.js · alle Bausätze im Spiel
   Liest FUNDUS_DATA (generiert von tools/fundus.py) und macht daraus
   – Möbel: jedes Modell mit Namen wird ein kaufbares Möbel (Läden,
     Katalog, Haus). Der Bausatz wird erst geladen, wenn er gebraucht wird.
   – Deko: Modelle werden in die Biome ihres Planeten gestreut (Bäume,
     Felsen und kleine Dinge getrennt). Jeder Planet bekommt seinen Teil,
     damit nicht überall alles steht und die Grafikkarte entspannt bleibt.
   Englische Namen kommen über I18N.extend dazu.
   ===================================================================== */
const FUNDUS=(()=>{
  const D=typeof FUNDUS_DATA!=='undefined'?FUNDUS_DATA:{items:[],en:{}};
  const EXT=new Set(D.ext||[]);const full=pk=>EXT.has(pk)?KIT.loadExt(pk):KIT.load(pk);
  const CANDY=['#ff6fa5','#45a0ff','#ffd23f','#7fd34a','#ff9a45','#9b6ae0','#2fb5d9','#f4f0e8'];
  /* Kit-Mesh an den Boden setzen und auf Zielgrösse bringen */
  function place(g,pk,nm,k,pal,lift){const bb=KIT.bounds(pk,nm);if(!bb)return null;const m=KIT.mesh(pk,nm,pal);m.scale.setScalar(k);
    m.position.set(-(bb[0]+bb[3])/2*k,-bb[1]*k+(lift||0),-(bb[2]+bb[5])/2*k);g.add(m);return m}
  /* Originalfarben der Bausätze (schon pastellig), leicht entsättigt */
  const palOf=()=>KIT.ORIG;
  /* ---------- Möbel ---------- */
  const PACKS_OF={},furnPack={};
  for(const it of D.items){if(it.r!=='m'||it.leg)continue;const id='fx_'+it.k+'_'+it.m;if(typeof findFurn==='function'&&findFurn(id))continue;
    const bb=it.bb||[-.5,0,-.5,.5,1,.5];const sc=it.sc||1;const w=(bb[3]-bb[0])*sc,d=(bb[5]-bb[2])*sc,h=(bb[4]-bb[1])*sc;
    const lift=it.wall?1.3:0;
    furn(id,{n:it.n,cat:it.cat,price:it.p,planet:it.pl,kit:[it.k,it.m],sc,wall:!!it.wall,fundus:1,size:[Math.max(1,Math.round(w)),Math.max(1,Math.round(d))],h,
      b:(g,m,o)=>{if(KIT.has(it.k,it.m)){place(g,it.k,it.m,sc,palOf(it.k,it.o),lift);return}full(it.k).then(()=>place(g,it.k,it.m,sc,palOf(it.k,it.o),lift))}});
    furnPack[id]=it.k;(PACKS_OF[it.pl]=PACKS_OF[it.pl]||new Set()).add(it.k)}
  /* Bausätze, die auf einem Planeten für Läden und eigene Möbel nötig sind */
  function packsFor(pid){const s=new Set([...(PACKS_OF[pid]||[]),...(PACKS_OF.alle||[])]);
    try{for(const x of SAVE.bag||[])if(x.kind==='furn'&&furnPack[x.id])s.add(furnPack[x.id])}catch(e){}
    try{const hs=SAVE.homes||{};for(const h of Object.values(hs))for(const f of(h.furn||h.items||[]))if(furnPack[f.id])s.add(furnPack[f.id])}catch(e){}
    return[...s]}
  function preload(pid){return Promise.all(packsFor(pid).map(p=>full(p).catch(()=>null)))}
  /* ---------- Deko ---------- */
  const DEKO={};const KEY=it=>it.sh?'deco':it.tr?'trees':(it.rk||it.big)?'rocks':'deco';
  for(const it of D.items){if(it.r!=='d'||it.u||!it.bb)continue;const id='fx_'+it.k+'_'+it.m;const bb=it.bb;const H=Math.max(.05,bb[4]-bb[1]);const k=it.h/H;
    const r=Math.max(.15,Math.max(bb[3]-bb[0],bb[5]-bb[2])*k*.45);
    NH.N(id,{r,h:it.h,size:it.big?'big':'small',planet:it.pl,fundus:1},(g,m,o,rnd)=>{if(!KIT.has(it.k,it.m))return;
      const pal=it.t?(()=>{const c=CANDY[Math.floor(rnd()*CANDY.length)];return{byHex:new Proxy({},{get:()=>c}),tint:c,line:'#4a3a5e'}})():palOf(it.k,it.o);
      place(g,it.k,it.m,k,pal,it.sh?-it.h*.12:(it.fl||0))});
    (DEKO[it.pl]=DEKO[it.pl]||[]).push({id,it})}
  const SHORE=/strand|ufer|riff|kueste|küste|duene|düne|lagune|watt|beach/;
  const OLD={kompost:['wiese','blumenfeld','wald','kirschhain','herbstwald'],frost:['schneefeld','tannenwald','polarhuegel'],wueste:['duenen','kakteenfeld','oase'],korallen:['palmenhain','riffstrand'],pilz:['pilzwald','moorwiese','sporensumpf'],schrott:['schrottebene','kristallfeld','gluehwald']};
  /* Deko in die Biome des Planeten mischen (nur für diesen Besuch; beim nächsten Planeten wird alles wieder entfernt,
     damit geteilte Biome wie «strand» nicht auf andere Planeten abfärben). Fundus bekommt etwa ein Drittel des Gewichts. */
  let added=[];
  function undo(){for(const[L,e]of added){const i=L.indexOf(e);if(i>=0)L.splice(i,1)}added=[]}
  function inject(pid){undo();const list=DEKO[pid];if(!list||!list.length)return;const def=PLANETS[pid]||{};
    const bios=[...new Set([...(def.bio||OLD[pid]||[]),'strand','eisufer'])].filter(b=>BIOMES[b]);if(!bios.length)return;
    for(const bid of bios){const B=BIOMES[bid];const shore=SHORE.test(bid)||bid==='eisufer';for(const key of['trees','rocks','deco']){
      const mine=list.filter(x=>KEY(x.it)===key&&(x.it.sh?shore:!(bid==='strand'||bid==='eisufer')));if(!mine.length)continue;
      const L=B[key]=B[key]||[];const sum=L.reduce((a,x)=>a+x[1],0)||1;const fs=mine.reduce((a,x)=>a+x.it.w,0);const share=key==='deco'?.3:.35;
      for(const x of mine){const e=x.it.sh?[x.id,x.it.w/fs*sum*share*2,{water:true}]:[x.id,x.it.w/fs*sum*share];L.push(e);added.push([L,e])}const dk=key==='trees'?'treeD':key==='rocks'?'rockD':'decoD';if(!B[dk])B[dk]=key==='deco'?2:.3}}}
  function decoPacks(pid){return[...new Set((DEKO[pid]||[]).map(x=>x.it.k))]}
  /* vor dem Bau eines Planeten: Bausätze laden, Deko einmischen */
  async function onPlanet(pid){try{await Promise.all([preload(pid),...decoPacks(pid).map(p=>full(p).catch(()=>null))])}catch(e){console.warn('Fundus',e)}inject(pid)}
  /* englische Namen */
  try{if(typeof I18N!=='undefined'&&I18N.extend)I18N.extend('en',D.en||{})}catch(e){}
  const stats=()=>({moebel:D.items.filter(i=>i.r==='m').length,deko:D.items.filter(i=>i.r==='d').length});
  return{onPlanet,preload,packsFor,decoPacks,stats,DEKO}
})();
