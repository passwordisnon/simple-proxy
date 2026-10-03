/* =====================================================================
   CYBORG-LABOR · wiredkit.js
   Candy-Mech-Bausteine für die 3D-Welt: durchsichtiges Bonbon-Plastik
   über sichtbaren Zahnrädern, Chrom mit Schrauben, Gel-Knöpfe,
   LCD-Anzeigen, Sticker. Dazu die neu gebauten Dorfplatz-Möbel
   (Bank, Laterne, Pager-Briefkasten, Wegweiser, LCD-Anschlagbrett).
   ===================================================================== */
const WK=(()=>{
  /* Bauhelfer aus furniture.js (FU) */
  const B=(...a)=>FU.B(...a),C=(...a)=>FU.C(...a),S=(...a)=>FU.S(...a),decal=(...a)=>FU.decal(...a),signTex=(...a)=>FU.signTex(...a),finish=(...a)=>FU.finish(...a);
  /* Bonbon-Farben: je Planet ein eigenes Paar, damit jedes Dorf anders schimmert */
  const CANDY={bondi:'#2fb5d9',grape:'#9b6ae0',tangerine:'#ff9a45',lime:'#7fd34a',strawberry:'#ff6fa5',lemon:'#ffd23f'};
  const PAIRS=[['bondi','tangerine'],['grape','lime'],['strawberry','bondi'],['tangerine','grape'],['lime','strawberry'],['lemon','grape']];
  function pal(){const id=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.id)||'kompost';const p=PAIRS[hashNum(id)%PAIRS.length];return{a:CANDY[p[0]],b:CANDY[p[1]]}}
  const candy=(m,col,op)=>m.c(col,{opacity:op??.5,gloss:1.3,rim:1.3,rimColor:'#ffffff'});
  const solid=(m,col)=>m.gloss(col);
  /* Zahnrad (flach, mit Zähnen); dreht sich, wenn es in ticks steht */
  function gear(g,m,r,p,rot,col){const gr=grp(g,p,rot);const mat=m.gloss(col||'#d6dce8');P(gr,G.cy(r*.78,r*.78,r*.22),mat,[0,0,0],[PI/2,0,0]);
    const n=Math.max(6,Math.round(r*28));for(let i=0;i<n;i++){const a=i/n*TAU;P(gr,G.bx(r*.24,r*.3,r*.2),mat,[Math.cos(a)*r*.84,Math.sin(a)*r*.84,0],[0,0,a])}
    P(gr,G.cy(r*.22,r*.22,r*.3),m.chrome(),[0,0,0],[PI/2,0,0]);return gr}
  /* Schraube: Chrom-Knopf mit Schlitz */
  function screw(g,m,p,rot,s){s=s||.035;const sc=grp(g,p,rot);P(sc,G.hs(s),m.chrome(),[0,0,0],[PI/2,0,0]);B(sc,s*1.6,s*.3,s*.3,0,m.c(PAL.slate),[0,0,s*.75],[0,0,.6]);return sc}
  function screws4(g,m,w,h,p,rot,s){const f=grp(g,p,rot);for(const x of[-1,1])for(const y of[-1,1])screw(f,m,[x*w/2,y*h/2,0],null,s);return f}
  /* LCD-Anzeige mit Pixelschrift */
  function lcdTex(key,lines,o){o=o||{};const w=o.w||256,h=o.h||128;return ctex('wk-lcd-'+key,w,h,(x)=>{x.fillStyle=o.bg||'#c9f27a';x.fillRect(0,0,w,h);
    x.fillStyle=o.fg||'#1d2b0b';const L=[].concat(lines);const fs=Math.floor(h/(L.length+.6)*.78);x.font=fs+'px DotGothic16, "MS Gothic", monospace';x.textAlign='center';x.textBaseline='middle';
    L.forEach((t,i)=>x.fillText(String(t),w/2,h*(i+.75)/(L.length+.5)));x.fillStyle='rgba(0,0,0,.07)';for(let i=0;i<w;i+=4)x.fillRect(i,0,1,h);for(let j=0;j<h;j+=4)x.fillRect(0,j,w,1)})}
  function lcd(g,m,key,lines,w,h,p,rot,o){const f=grp(g,p,rot);B(f,w+.06,h+.06,.05,.02,m.chrome(),[0,0,-.02]);decal(f,m,lcdTex(key,lines,o),'wk-lcd-'+key,w,h,[0,0,.012],null,true);return f}
  /* Sticker: abgerundete Plakette mit Text, leicht schief */
  function stickerTex(key,text,bg,fg){return ctex('wk-st-'+key,256,96,(x,w,h)=>{x.fillStyle='#ffffff';x.beginPath();x.roundRect?x.roundRect(2,2,w-4,h-4,44):x.rect(2,2,w-4,h-4);x.fill();
    x.fillStyle=bg;x.beginPath();x.roundRect?x.roundRect(9,9,w-18,h-18,38):x.rect(9,9,w-18,h-18);x.fill();x.fillStyle=fg||'#2b2340';x.font='800 40px "M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+2)})}
  function sticker(g,m,key,text,bg,w,p,rot,fg){return decal(g,m,stickerTex(key,text,bg,fg),'wk-st-'+key,w,w*.375,p,rot)}
  /* Gel-Knopf: glänzende Halbkugel */
  function gel(g,m,col,r,p,rot){const b=grp(g,p,rot);P(b,G.hs(r),m.gloss(col),[0,0,0],[PI/2,0,0]);P(b,G.s(r*.3),m.c('#ffffff',{opacity:.7}),[-r*.3,r*.35,r*.55]);return b}
  /* Bonbon-Schale: durchsichtiger Kasten, innen Zahnräder; gibt die Zahnräder zurück (zum Drehen) */
  function shell(g,m,w,h,d,p,col){const f=grp(g,p);const gs=[];const r=Math.min(w,h)*.28;
    gs.push(gear(f,m,r,[-w*.18,-h*.08,0],null,'#e6ecf5'));gs.push(gear(f,m,r*.62,[w*.2,h*.16,0],null,'#c9cfdb'));
    const sh=B(f,w,h,d,Math.min(w,h,d)*.3,candy(m,col,.42),[0,0,0]);sh.userData.noMerge=true;return{f,gears:gs}}
  /* ---------- Dorfplatz-Möbel neu ---------- */
  function bench(m){const g=new THREE.Group();const{a,b}=pal();const ch=m.chrome();const ticks=[],keep=[];
    both(x=>{const s=grp(g,[x*.72,0,0]);B(s,.1,.46,.5,.04,ch,[0,.23,0]);/* Bullauge mit Zahnrad in der Armlehne */const arm=grp(s,[0,.72,-.02]);B(arm,.14,.5,.56,.06,candy(m,b,.45),[0,0,0]);
      const gr=gear(arm,m,.16,[0,0,0],[0,PI/2,0]);keep.push(gr);ticks.push(t=>{gr.rotation.x=t*(x>0?.8:-.8)});screws4(arm,m,.36,.36,[x*.075,0,0],[0,x*PI/2,0],.022)});
    for(let i=0;i<3;i++)B(g,1.5,.07,.16,.035,candy(m,i%2?a:b,.62),[0,.47,-.17+i*.17]);
    for(let i=0;i<2;i++)B(g,1.5,.15,.06,.03,candy(m,i?a:b,.62),[0,.72+i*.2,-.28-i*.02],[-.12,0,0]);
    sticker(g,m,'bank',"ベンチ",'#ffd23f',.34,[.45,.93,-.24],[-.12,0,.08]);
    g.userData.seat=[0,.5,.02];g.userData.keep=keep;return finish(g,[0,0,.8],.8,'bench',ticks)}
  function lamp(m){const g=new THREE.Group();const{a}=pal();const ch=m.chrome();const ticks=[];
    P(g,G.la([[0,0],[.28,0],[.28,.08],[.16,.18],[.1,.42],[0,.42]]),ch,[0,0,0]);C(g,.055,.065,2.3,ch,[0,1.55,0]);
    /* LCD-Uhr am Mast */lcd(g,m,'lampclock',['23:59'],.34,.16,[0,1.25,.07]);
    /* Kapsel-Leuchte: zweiteiliges Kapselspielzeug, unten durchsichtig, Licht innen */
    const cap=grp(g,[0,2.82,0]);P(cap,G.hs(.3),m.gloss(a),[0,0,0]);P(cap,G.hs(.3),m.c('#ffffff',{opacity:.38,gloss:1.4,rim:1.4}),[0,0,0],[PI,0,0]);S(cap,.15,m.glow('#FFF1B8',2.2),[0,-.06,0]);P(cap,G.to(.3,.02),ch,[0,0,0],[PI/2,0,0]);
    gel(cap,m,'#ff6fa5',.06,[0,.3,0],[-PI/2,0,0]);
    g.userData.light={p:[0,2.72,0],c:'#FFE3A0',i:1.4};return finish(g,[0,0,.6],.3,'lamp',ticks)}
  function mailbox(m){const g=new THREE.Group();const{a,b}=pal();const ch=m.chrome();
    C(g,.05,.06,.9,ch,[0,.45,0]);C(g,.18,.22,.08,ch,[0,.04,0]);
    /* Pager-Briefkasten: Ei-Gehäuse mit Bildschirm, Antenne und Knöpfen */
    const box=grp(g,[0,1.12,0]);const egg=P(box,G.s(.3),candy(m,a,.55),[0,0,0],null,[1,1.15,.85]);egg.userData.noMerge=true;gear(box,m,.13,[0,-.02,-.02],null,'#e6ecf5');
    lcd(box,m,'mail',['POST'],.24,.12,[0,.06,.26]);[['#ff6fa5',-.08],['#ffd23f',0],['#7fd34a',.08]].forEach(([c,x])=>gel(box,m,c,.03,[x,-.12,.25]));
    const ant=grp(box,[.14,.28,0]);C(ant,.012,.012,.36,ch,[0,.18,0]);S(ant,.035,m.glow(b,2),[0,.37,0]);
    const fl=grp(box,[-.3,.0,0]);B(fl,.03,.3,.04,.01,m.c('#ff6fa5'),[0,.15,0]);B(fl,.03,.12,.16,.02,m.c('#ff6fa5'),[0,.26,.08]);g.userData.flag=fl;
    return finish(g,[0,0,.7],.3,'mailbox')}
  function signpost(m,text){const g=new THREE.Group();const ch=m.chrome();const lines=String(text||'Willkommen!').split(/\||\n/).slice(0,3);const{a,b}=pal();const cols=[a,b,'#ffd23f'];
    C(g,.06,.07,2.2,ch,[0,1.1,0]);gel(g,m,'#ff6fa5',.09,[0,2.22,0],[-PI/2,0,0]);
    lines.forEach((t,i)=>{const dir=i%2?-1:1;const ar=grp(g,[0,1.85-i*.42,0],[0,(i-1)*.25,0]);const w=1.3,h=.34;
      const sh=shp([[-.08*dir,-h/2],[w*dir-.18*dir,-h/2],[w*dir,0],[w*dir-.18*dir,h/2],[-.08*dir,h/2]]);P(ar,G.puff(sh,.06,.02),candy(m,cols[i%3],.75),[0,0,.02]);
      decal(ar,m,signTex('wsp'+t,t,{bg:'#ffffff',fg:'#2b2340',border:false,w:384,h:96}),'wsp'+t,.98,.24,[dir*.52,0,.075]);screw(ar,m,[dir*.02,0,.09],null,.025)});
    return finish(g,[0,0,.8],.3,'sign')}
  function board(m){const g=new THREE.Group();const ch=m.chrome();const{a,b}=pal();const ticks=[],keep=[];
    both(x=>{C(g,.06,.07,2.1,ch,[x*.88,1.05,0]);gel(g,m,x<0?'#ff6fa5':'#ffd23f',.08,[x*.88,2.12,0],[-PI/2,0,0])});
    /* Rückwand: Bonbon-Plastik mit Zahnrädern; vorn ein grosser LCD mit Meldungen und Zettel */
    const sh=shell(g,m,1.86,1.16,.12,[0,1.36,-.04],a);sh.gears.forEach((gr,i)=>{keep.push(gr);ticks.push(t=>{gr.rotation.z=t*(i?-.9:.6)})});
    B(g,1.7,.98,.04,.02,ch,[0,1.36,.04]);lcd(g,m,'board',['KOKON-NETZ','31.12.1999  23:59'],1.1,.36,[0,1.62,.07],null,{w:512,h:160});
    [[-.52,1.18,'#fff3a8',.1],[0,1.16,'#d6f1fa',-.08],[.52,1.2,'#ffe1ee',.05]].forEach(([x,y,c,r])=>{const n=grp(g,[x,y,.08],[0,0,r]);B(n,.36,.34,.01,0,m.c(c),[0,0,0]);for(let k=0;k<3;k++)B(n,.24,.025,.01,0,m.c(PAL.slate),[0,.08-k*.07,.008]);screw(n,m,[0,.15,.012],null,.02)});
    screws4(g,m,1.62,.9,[0,1.36,.07],null,.03);sticker(g,m,'board',"けいじばん",b,.42,[.62,1.95,.08],[0,0,-.08],'#ffffff');
    const rf=grp(g,[0,2.08,0]);both(s=>P(rf,G.bx(1.12,.07,.46,.03),candy(m,b,.7),[s*.5,.08,0],[0,0,-s*.28]));
    g.userData.keep=keep;return finish(g,[0,0,.9],.95,'board',ticks)}
  /* ---------- Gebäude im WIRED-Look: LCD über der Tür, Zahnrad-Bullauge, Schrauben, Sticker ---------- */
  const KIND_JP={shop:'ショップ',laden:'ショップ',bar:'バー',rathaus:'まちやくば',praxis:'クリニック',mode:'ブティック',casino:'ゲーム',museum:'ミュージアム',post:'ポスト',garage:'ガレージ',pflanzen:'はなや',tiere:'ペット',lager:'そうこ',residence:'おうち',house:'わがや',rocket:'ロケット',cafe:'カフェ',bank:'ぎんこう'};
  function dress(obj,pl,m){try{if(!obj||obj.userData.wired)return;obj.userData.wired=true;
    /* frei stehendes Kokon-Terminal neben der Tür: steht auf dem Boden, schwebt nie */
    const{a,b}=pal();const r=srand(hashNum((pl&&pl.id)||'x'));const door=obj.userData.door||[0,0,2];const side=r()<.5?-1:1;const jp=KIND_JP[pl&&pl.build]||'ココン';
    const t=grp(obj,[door[0]+side*1.6,0,door[2]+.5],[0,-side*.3,0]);const ch=m.chrome();
    C(t,.16,.2,.08,ch,[0,.04,0]);C(t,.045,.05,1.25,ch,[0,.66,0]);
    const head=grp(t,[0,1.42,0]);B(head,.5,.42,.16,.07,candy(m,a,.6),[0,0,0]);gear(head,m,.12,[-.12,-.06,-.02],null,'#e6ecf5');lcd(head,m,'term',['23:59'],.36,.16,[0,.06,.085]);
    gel(head,m,'#ff6fa5',.035,[.14,-.14,.08]);gel(head,m,'#ffd23f',.035,[.04,-.14,.08]);screws4(head,m,.42,.34,[0,0,.085],null,.018);
    sticker(t,m,'bld-'+jp,jp,b,.46,[0,1.78,.03],[0,0,side*.1],'#ffffff')}catch(e){console.warn('WIRED-Gebäude',e)}}
  /* ---------- Wartungsluke im Boden: ab Akt III der Weg in die Tunnel ---------- */
  function hatch(m){const g=new THREE.Group();const ch=m.chrome();const{a}=pal();P(g,G.cy(.95,1.0,.12),ch,[0,.04,0]);P(g,G.cy(.78,.78,.06),m.c('#0b1530'),[0,.1,0]);
    const lid=grp(g,[0,.14,0]);P(lid,G.cy(.74,.74,.06),candy(m,a,.7),[0,0,0]);gear(lid,m,.42,[0,.04,0],[-PI/2,0,0],'#e6ecf5');P(lid,G.bx(.5,.06,.1,.03),ch,[0,.06,0]);
    for(let i=0;i<8;i++){const an=i/8*TAU;screw(g,m,[Math.cos(an)*.87,.11,Math.sin(an)*.87],[-PI/2,0,0],.035)}
    const lamp=S(g,.07,m.glow('#ff5c7a',2),[.95,.14,0]);const ticks=[t=>{lamp.visible=Math.sin(t*3)>0}];lcd(g,m,'hatch',['WARTUNG'],.5,.18,[0,.32,-.95],[-.5,0,0]);
    g.userData.keep=[lamp];return finish(g,[0,0,1.3],1.1,'hatch',ticks)}
  /* ---------- Kokon-95/97-Fundstücke in den Ruinen ---------- */
  function relics(g,m,seed){const r=srand(seed||7);const ch=m.chrome();const n=2+Math.floor(r()*2);for(let i=0;i<n;i++){const an=r()*TAU,d=1.6+r()*1.6;const p=[Math.cos(an)*d,0,Math.sin(an)*d];const k=Math.floor(r()*3);const o=grp(g,p,[0,r()*TAU,(r()-.5)*.5]);
    if(k===0){/* halb versunkener Röhrenmonitor */B(o,.8,.62,.7,.1,m.c('#d8d2c4'),[0,.18,0],[-.25,0,0]);P(o,G.pl(.58,.42),m.flat('#2b2a38'),[0,.24,.36],[-.25,0,0]);P(o,G.pl(.2,.04),m.glow('#7fd34a',1.4),[.15,.12,.37],[-.25,0,0])}
    else if(k===1){/* Diskette, gross wie eine Steinplatte */B(o,.9,.06,.95,.02,m.gloss(['#2fb5d9','#9b6ae0','#ff9a45'][Math.floor(r()*3)]),[0,.03,0],[0,0,.08]);B(o,.5,.07,.32,.01,ch,[0,.035,.28]);B(o,.6,.065,.34,.01,m.c('#fffdf7'),[0,.035,-.2])}
    else{/* Kabelbündel mit Stecker */const pts=range(6,t=>[t*1.4-.7,.06+Math.sin(t*PI)*.18,Math.sin(t*5)*.25]);P(o,G.tu(pts,.04,.04,16),m.c('#3b3450'));B(o,.16,.1,.12,.02,ch,[.75,.08,0])}}}
  /* alte Bauteile ersetzen: der Dorfplatz ruft sie über window[...] auf */
  function install(){window.buildBench=bench;window.buildStreetLamp=lamp;window.buildMailbox=mailbox;window.buildSignpost=signpost;window.buildNoticeBoard=board}
  install();
  /* Bausatz-Teile ersetzen: alte Eisenlaterne und Holzbank aus dem Stadt-Bausatz werden Candy-Mech (gleicher Platzbedarf) */
  let KM=null;const SWAP={'town/lantern':lamp,'town/stall-bench':bench};
  function hookKit(){if(typeof KIT==='undefined'||KIT._wk)return;KIT._wk=true;const orig=KIT.mesh.bind(KIT);
    KIT.mesh=function(pack,name,...rest){const f=SWAP[pack+'/'+name];if(!f)return orig(pack,name,...rest);try{KM=KM||makeMats({skin:'plastik',color:0});const inner=f(KM);const b=KIT.bounds(pack,name);
      const box=new THREE.Box3().setFromObject(inner);const iw=box.max.x-box.min.x,id=box.max.z-box.min.z,ih=Math.max(.01,box.max.y-box.min.y);const kw=b[3]-b[0],kd=b[5]-b[2],kh=b[4]-b[1];
      if(name==='lantern')inner.scale.setScalar(Math.max(.3,kh)/ih);else{/* Bank: Länge an die längere Seite des Bausatz-Teils, gleiche Ausrichtung */const kz=kd>kw;if(kz)inner.rotation.y=PI/2;inner.scale.setScalar(Math.max(kw,kd)/Math.max(.01,Math.max(iw,id)))}const outer=new THREE.Group();outer.add(inner);outer.userData=Object.assign({},inner.userData);return outer}catch(e){console.warn('WIRED-Tausch',name,e);return orig(pack,name,...rest)}}}
  if(typeof KIT!=='undefined')hookKit();else addEventListener('DOMContentLoaded',hookKit);
  return{dress,hatch,relics,CANDY,pal,candy,solid,gear,screw,screws4,lcd,lcdTex,sticker,gel,shell,bench,lamp,mailbox,signpost,board}})();
