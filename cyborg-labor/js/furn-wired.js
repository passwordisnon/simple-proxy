/* =====================================================================
   CYBORG-LABOR · furn-wired.js
   Möbel-Linie "Kinderzimmer 1999" im Candy-Mech-Look: durchsichtiges
   Bonbon-Plastik, Chrom, Gel-Knöpfe, LCD. In allen Läden erhältlich.
   ===================================================================== */
(function(){
  const B=(...a)=>FU.B(...a),C=(...a)=>FU.C(...a),S=(...a)=>FU.S(...a);
  const CA=WK.CANDY;const cd=(m,c,o)=>WK.candy(m,c,o);
  const F=(id,o)=>furn(id,Object.assign({planet:'alle',set:'1999'},o));

  F('lavalampe',{n:'Lavalampe',cat:'licht',price:680,size:[1,1],h:1.3,b:(g,m)=>{const ch=m.chrome();
    P(g,G.la([[0,0],[.26,0],[.2,.34],[.12,.4],[0,.4]]),ch,[0,0,0]);const gl=P(g,G.la([[.12,0],[.2,.4],[.13,.78],[0,.8]]),cd(m,CA.grape,.45),[0,.38,0]);gl.userData.noMerge=true;
    P(g,G.la([[0,0],[.13,0],[.1,.14],[0,.16]]),ch,[0,1.16,0]);const bl=[];for(let i=0;i<4;i++)bl.push(S(g,.05+i*.012,m.glow(['#ff9a45','#ff6fa5','#ffd23f','#ff9a45'][i],1.6),[0,.5+i*.15,0]));
    g.userData.light={p:[0,.8,0],c:'#ff9ad0',i:.9};g.userData.tick=t=>bl.forEach((b,i)=>{b.position.y=.48+((t*.08+i*.23)%1)*.62;b.position.x=Math.sin(t*.7+i)*.05;b.scale.setScalar(1+Math.sin(t*1.3+i)*.2)})}});

  F('luftsessel',{n:'Aufblasbarer Sessel',cat:'sitz',price:950,size:[2,2],h:1.1,b:(g,m)=>{const mt=cd(m,CA.strawberry,.55);
    P(g,G.to(.62,.24),mt,[0,.24,0],[PI/2,0,0]);P(g,G.cy(.62,.62,.18),mt,[0,.18,0]);P(g,G.to(.5,.2,PI*1.2),mt,[0,.7,-.25],[0,0,-PI*.1],[1,1,.9]);
    both(x=>P(g,G.to(.24,.17),mt,[x*.56,.62,.05],[0,PI/2,0]));WK.sticker(g,m,'luft','ふわふわ',CA.lemon,.4,[.4,.5,.6],[-.3,0,.1]);g.userData.seat=[0,.42,.1]}});

  F('roehren_tv_konsole',{n:'Röhrenfernseher mit Konsole',cat:'technik',price:1600,size:[2,1],h:1.4,b:(g,m)=>{
    B(g,1.5,.5,.8,.06,m.c('#d8d2c4'),[0,.25,0]);B(g,1.1,.86,.8,.14,m.c('#e9e4d8'),[0,.93,-.05]);B(g,.9,.66,.02,.04,m.c('#2b2a38'),[0,.95,.36]);
    const sc=WK.lcdTex('tv',['PIKO','▶ START'],{bg:'#2b2340',fg:'#7fd34a',w:256,h:192});FU.decal(g,m,sc,'wk-tv',.8,.58,[0,.95,.375],null,true);
    const con=FU.B(g,.5,.12,.36,.05,cd(m,CA.grape,.65),[.4,.56,.1]);WK.gel(g,m,'#ff6fa5',.03,[.52,.63,.22],[-PI/2,0,0]);WK.gel(g,m,'#ffd23f',.03,[.44,.63,.22],[-PI/2,0,0]);
    const pad=FU.B(g,.34,.06,.18,.04,cd(m,CA.bondi,.7),[-.35,.53,.25]);C(g,.01,.01,.5,m.c('#3b3450'),[-.1,.52,.2],[0,0,PI/2])}});

  F('perlenvorhang',{n:'Perlenvorhang',cat:'wand',price:420,size:[2,1],h:2.2,wall:true,b:(g,m)=>{const z=-.45;B(g,1.8,.06,.06,.02,m.chrome(),[0,2.1,z]);const cols=[CA.bondi,CA.grape,CA.strawberry,CA.lemon,CA.lime];
    for(let i=0;i<12;i++){const x=-.82+i*.15;for(let j=0;j<12;j++)S(g,.035,cd(m,cols[(i+j)%5],.7),[x,2.0-j*.15,z+.02])}}});

  F('leuchtsterne',{n:'Leuchtsterne',cat:'wand',price:260,size:[2,1],h:1.6,wall:true,b:(g,m)=>{const r=srand(9);for(let i=0;i<9;i++){P(g,G.star(.08+r()*.07,.035,5,.015),m.glow(i%3?'#d8ff9a':'#fff3a8',1.4),[-.8+r()*1.6,.9+r()*1.2,-.47],[0,0,r()*2])}}});

  F('glastelefon',{n:'Durchsichtiges Telefon',cat:'technik',price:520,size:[1,1],h:.4,b:(g,m)=>{const sh=cd(m,CA.bondi,.42);const base=FU.B(g,.5,.16,.4,.06,sh,[0,.08,0]);base.userData.noMerge=true;
    WK.gear(g,m,.08,[-.08,.08,0],[-PI/2,0,0],'#e6ecf5');WK.gear(g,m,.05,[.1,.08,.05],[-PI/2,0,0],'#ffd23f');P(g,G.ca(.06,.4),sh,[0,.22,0],[0,0,PI/2]);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)WK.gel(g,m,'#fffdf7',.018,[-.06+i*.06,.17,.08+j*.05],[-PI/2,0,0]);C(g,.01,.01,.2,m.c('#ff6fa5'),[.27,.12,0],[PI/2,0,.3])}});

  F('ghettoblaster',{n:'Kassettenrekorder',cat:'musik',price:880,size:[2,1],h:.8,b:(g,m)=>{B(g,1.2,.55,.34,.08,m.gloss('#3b3450'),[0,.28,0]);both(x=>{C(g,.18,.18,.05,m.chrome(),[x*.36,.28,.17],[PI/2,0,0]);C(g,.13,.13,.06,m.c('#1d1a26'),[x*.36,.28,.18],[PI/2,0,0])});
    B(g,.32,.16,.02,.02,cd(m,CA.bondi,.6),[0,.34,.175]);FU.decal(g,m,WK.lcdTex('boom',['FM 87.6'],{w:192,h:64}),'wk-boom',.26,.07,[0,.2,.18],null,true);C(g,.02,.02,1,m.chrome(),[0,.62,0],[0,0,PI/2]);
    g.userData.tick=t=>{}}});

  F('sitzsack',{n:'Sitzsack',cat:'sitz',price:540,size:[1,1],h:.8,b:(g,m)=>{P(g,G.s(.45),m.gloss(CA.lime),[0,.3,0],null,[1.15,.68,1.15]);P(g,G.s(.32),m.gloss(CA.lime),[0,.52,-.18],null,[1,.8,.7]);WK.sticker(g,m,'sack','ごろり',CA.strawberry,.3,[.25,.4,.42],[-.3,0,-.1]);g.userData.seat=[0,.45,.05]}});

  F('hochbett',{n:'Hochbett',cat:'bett',price:2400,size:[2,3],h:2.4,b:(g,m)=>{const ch=m.chrome();for(const x of[-.85,.85])for(const z of[-1.35,1.35])C(g,.05,.05,2.1,ch,[x,1.05,z]);
    B(g,1.8,.14,2.8,.05,cd(m,CA.bondi,.7),[0,1.45,0]);B(g,1.6,.2,2.6,.1,m.c('#fffdf7'),[0,1.6,0]);S(g,.22,m.gloss(CA.strawberry),[0,1.75,-1.05],[1.6,.6,1]);
    for(const z of[-1.35,1.35])B(g,1.8,.06,.06,.02,ch,[0,2.05,z]);for(let i=0;i<5;i++)B(g,.4,.04,.04,.01,ch,[.65,.25+i*.28,1.45]);both(x=>C(g,.03,.03,1.5,ch,[.65+x*.2,.75,1.45]));
    B(g,1.4,.5,.6,.06,cd(m,CA.grape,.6),[-.1,.25,-.9]);g.userData.sleep=[0,1.75,0]}});

  F('bildschirm_aquarium',{n:'Aquarium mit Bildschirmschoner',cat:'deko',price:1300,size:[2,1],h:1.3,b:(g,m)=>{B(g,1.4,.5,.6,.06,m.c('#d8d2c4'),[0,.25,0]);const gl=B(g,1.3,.7,.5,.04,m.glass('#bfeaff'),[0,.86,0]);gl.userData.noMerge=true;
    B(g,1.24,.08,.44,.02,m.c('#7fd34a'),[0,.55,0]);const fs=[];for(let i=0;i<3;i++){const f=grp(g,[0,.85,0]);P(f,G.bx(.14,.09,.03,.01),m.glow(['#ff9a45','#ff6fa5','#ffd23f'][i],1.4),[0,0,0]);fs.push(f)}
    FU.decal(g,m,WK.lcdTex('aq',['><(((°>'],{w:256,h:64,bg:'#0b1530',fg:'#45e0ff'}),'wk-aq',.6,.14,[0,.38,.31],null,true);
    g.userData.tick=t=>fs.forEach((f,i)=>{f.position.x=Math.sin(t*.6+i*2)*.5;f.position.y=.75+i*.12+Math.sin(t*1.3+i)*.03;f.rotation.y=Math.cos(t*.6+i*2)>0?0:PI})}});

  F('kapselautomat',{n:'Kapselautomat (Deko)',cat:'spiel',price:1100,size:[1,1],h:1.6,b:(g,m)=>{const{a}=WK.pal();B(g,.6,.7,.6,.08,m.gloss(CA.strawberry),[0,.35,0]);const dome=P(g,G.s(.34),cd(m,'#ffffff',.3),[0,.98,0]);dome.userData.noMerge=true;
    const cols=[CA.bondi,CA.grape,CA.lemon,CA.lime,CA.tangerine];const r=srand(4);for(let i=0;i<10;i++){const q=grp(g,[(r()-.5)*.4,.78+r()*.3,(r()-.5)*.4]);P(q,G.hs(.07),m.gloss(cols[i%5]),[0,0,0]);P(q,G.hs(.07),m.c('#ffffff',{opacity:.6}),[0,0,0],[PI,0,0])}
    P(g,G.la([[0,0],[.12,0],[.1,.08],[0,.08]]),m.chrome(),[0,1.3,0]);C(g,.09,.09,.04,m.chrome(),[0,.45,.31],[PI/2,0,0]);B(g,.14,.04,.04,.01,m.chrome(),[0,.45,.34]);WK.sticker(g,m,'kapsel','ガチャ',CA.lemon,.3,[0,.62,.31],[0,0,.08])}});

  F('cd_turm',{n:'CD-Turm',cat:'lager',price:380,size:[1,1],h:1.5,b:(g,m)=>{C(g,.2,.24,.06,m.chrome(),[0,.03,0]);C(g,.03,.03,1.4,m.chrome(),[0,.7,0]);const cols=[CA.bondi,CA.grape,CA.strawberry,CA.lemon,CA.lime,CA.tangerine];
    for(let i=0;i<16;i++){const q=grp(g,[0,.15+i*.08,0],[0,i*.4,0]);B(q,.3,.012,.3,.004,m.metal('holo'),[.16,0,0]);B(q,.3,.06,.008,0,cd(m,cols[i%6],.8),[.16,.03,.15])}}});

  F('traumhelm',{n:'Kokon-Traumhelm (Ausstellung)',cat:'deko',price:3000,size:[1,1],h:1.5,b:(g,m)=>{C(g,.3,.34,.1,m.chrome(),[0,.05,0]);C(g,.05,.06,.8,m.chrome(),[0,.5,0]);
    const h=grp(g,[0,1.12,0]);P(h,G.hs(.32),cd(m,CA.bondi,.6),[0,0,0]);P(h,G.to(.32,.035),m.chrome(),[0,0,0],[PI/2,0,0]);WK.gear(h,m,.12,[0,.14,0],[-PI/2,0,0],'#e6ecf5');
    both(x=>{S(h,.06,m.glow(x<0?'#ff6fa5':'#45e0ff',1.6),[x*.3,.05,0]);C(h,.01,.01,.3,m.c('#3b3450'),[x*.3,-.18,0])});WK.lcd(g,m,'helm',['KOKON 1999'],.4,.12,[0,.25,.32],null,{w:256,h:64});WK.sticker(g,m,'helm','ゆめ',CA.strawberry,.28,[.22,1.42,.1],[0,0,-.15])}});

  F('ei_lampe',{n:'Ei-Lampe',cat:'licht',price:460,size:[1,1],h:.7,b:(g,m)=>{C(g,.16,.2,.06,m.chrome(),[0,.03,0]);P(g,G.s(.22),cd(m,CA.lemon,.55),[0,.32,0],null,[1,1.25,1]);S(g,.1,m.glow('#fff1b8',2),[0,.3,0]);WK.gel(g,m,'#ff6fa5',.025,[0,.08,.16],null);g.userData.light={p:[0,.35,0],c:'#ffe7a0',i:.9}}});

  F('sternprojektor',{n:'Sternprojektor',cat:'licht',price:720,size:[1,1],h:.6,b:(g,m)=>{C(g,.18,.22,.12,m.gloss(CA.grape),[0,.06,0]);const d=P(g,G.s(.2),cd(m,'#2b2340',.75),[0,.28,0]);d.userData.noMerge=true;
    const r=srand(3);for(let i=0;i<14;i++){const a=r()*TAU,b=r()*1.2;S(g,.015,m.glow('#fff3a8',2),[Math.cos(a)*Math.sin(b)*.2,.28+Math.cos(b)*.2,Math.sin(a)*Math.sin(b)*.2])}g.userData.light={p:[0,.35,0],c:'#b8a6ff',i:.7};g.userData.tick=t=>{d.rotation.y=t*.4}}});

  F('pager_regal',{n:'Pager-Regal',cat:'lager',price:640,size:[2,1],h:1.4,b:(g,m)=>{const sh=cd(m,CA.tangerine,.55);for(let i=0;i<3;i++)B(g,1.4,.05,.4,.02,sh,[0,.2+i*.5,0]);both(x=>B(g,.05,1.3,.4,.02,m.chrome(),[x*.7,.65,0]));
    const cols=[CA.bondi,CA.grape,CA.lime,CA.strawberry];for(let i=0;i<6;i++){const x=-.5+i*.2;const q=grp(g,[x,.28+(i%3)*.5,0]);B(q,.14,.1,.05,.02,m.gloss(cols[i%4]),[0,.05,0]);P(q,G.pl(.09,.035),m.flat('#c9f27a'),[0,.07,.027])}}});
})();
