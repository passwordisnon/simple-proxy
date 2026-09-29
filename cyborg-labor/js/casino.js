/* =====================================================================
   CYBORG-LABOR · casino.js
   Glücks-Salon in jedem Dorf: Jetons an der Kasse tauschen (1 Jeton =
   10 Taler, höchstens 50 Jetons pro Spieltag), dann Spielautomat,
   Glücksrad oder „Höher oder Tiefer“ bei Madame Jeton. Die Bank gewinnt
   auf Dauer ein kleines bisschen – wie im echten Leben.
   ===================================================================== */
const CASINO=(()=>{
  const B=(g,w,h,d,rad,mat,p,r,sc)=>P(g,G.bx(w,h,d,rad),mat,p,r,sc),C=(g,rt,rb,h,mat,p,r,sc)=>P(g,G.cy(rt,rb,h),mat,p,r,sc),S=(g,r,mat,p,sc)=>P(g,G.s(r),mat,p,null,sc);
  const Wd=(m,c)=>window.HOUSEKIT?HOUSEKIT.Wd(m,c):m.c(c);const RATE=10,DAYMAX=50;const NM='Madame Jeton';const VOICE={pitch:260,kind:'robot',speed:1.1};
  const st=()=>{const c=SAVE.casino=SAVE.casino||{chips:0,day:-1,bought:0,won:0,lost:0};const d=typeof marketDay==='function'?marketDay():0;if(c.day!==d){c.day=d;c.bought=0}return c};
  const madame=()=>({name:NM,body:{seg:1,size:1,skin:'plastik',color:9,shape:'ei',pattern:'bauch',color2:16},parts:{kopf:'monitor',augen:'kulleraugen',arme:'mensch',beine:'mensch',extras:[]},
    clothes:{hat:'zylinder',top:'weste',neck:'fliege',col:{hat:3,top:12,neck:12}}});
  const say=(lines)=>UI.talk(NM,lines,{voice:VOICE});

  /* ---------- Symbole (gezeichnet, keine Emoji) ---------- */
  const SYM=[{id:'kirsche',w:5},{id:'zitrone',w:5},{id:'pilz',w:4},{id:'zahnrad',w:3},{id:'stern',w:2},{id:'rakete',w:1}];
  const PAY3={kirsche:4,zitrone:5,pilz:8,zahnrad:10,stern:15,rakete:30};
  function drawSym(x,id,cx,cy,s){x.save();x.translate(cx,cy);x.lineJoin='round';x.lineCap='round';x.lineWidth=s*.06;x.strokeStyle='#3B3450';
    if(id==='kirsche'){x.strokeStyle='#4E8A3A';x.lineWidth=s*.07;x.beginPath();x.moveTo(-s*.18,s*.05);x.quadraticCurveTo(-s*.05,-s*.35,s*.12,-s*.38);x.moveTo(s*.2,s*.08);x.quadraticCurveTo(s*.2,-s*.2,s*.12,-s*.38);x.stroke();
      x.fillStyle='#7CC46A';x.beginPath();x.ellipse(s*.2,-s*.38,s*.14,s*.06,-.4,0,TAU);x.fill();x.strokeStyle='#3B3450';x.lineWidth=s*.05;for(const[dx,dy]of[[-s*.2,s*.18],[s*.2,s*.2]]){x.fillStyle='#E8405A';x.beginPath();x.arc(dx,dy,s*.18,0,TAU);x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(dx-s*.06,dy-s*.06,s*.05,0,TAU);x.fill()}}
    else if(id==='zitrone'){x.fillStyle='#FFD85A';x.beginPath();x.ellipse(0,0,s*.36,s*.26,-.3,0,TAU);x.fill();x.stroke();x.beginPath();x.ellipse(s*.33,-s*.12,s*.06,s*.04,-.3,0,TAU);x.fillStyle='#F2C040';x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(-s*.1,-s*.08,s*.1,s*.05,-.3,0,TAU);x.fill()}
    else if(id==='pilz'){x.fillStyle='#FFF1DC';x.beginPath();x.roundRect(-s*.12,-s*.02,s*.24,s*.36,s*.08);x.fill();x.stroke();x.fillStyle='#E8405A';x.beginPath();x.moveTo(-s*.38,s*.02);x.quadraticCurveTo(-s*.36,-s*.4,0,-s*.4);x.quadraticCurveTo(s*.36,-s*.4,s*.38,s*.02);x.closePath();x.fill();x.stroke();
      x.fillStyle='#FFFFFF';for(const[dx,dy,r]of[[-s*.18,-s*.12,.06],[s*.1,-s*.24,.07],[s*.22,-s*.06,.05]]){x.beginPath();x.arc(dx,dy,s*r,0,TAU);x.fill()}}
    else if(id==='zahnrad'){x.fillStyle='#AEB9C8';x.beginPath();const n=8;for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU;const r=i%2?s*.28:s*.36;const a2=a+TAU/(n*4);x.lineTo(Math.cos(a)*r,Math.sin(a)*r);x.lineTo(Math.cos(a2)*r,Math.sin(a2)*r)}x.closePath();x.fill();x.stroke();x.fillStyle='#5B5170';x.beginPath();x.arc(0,0,s*.1,0,TAU);x.fill()}
    else if(id==='stern'){x.fillStyle='#FFD85A';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5;const r=i%2?s*.17:s*.38;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.stroke();x.fillStyle='#3B3450';x.beginPath();x.arc(-s*.07,-s*.02,s*.03,0,TAU);x.arc(s*.07,-s*.02,s*.03,0,TAU);x.fill()}
    else if(id==='rakete'){x.rotate(.5);x.fillStyle='#E8405A';x.beginPath();x.moveTo(-s*.12,s*.18);x.lineTo(-s*.24,s*.34);x.lineTo(-s*.12,s*.3);x.moveTo(s*.12,s*.18);x.lineTo(s*.24,s*.34);x.lineTo(s*.12,s*.3);x.fill();
      x.fillStyle='#FFFDF7';x.beginPath();x.moveTo(0,-s*.42);x.quadraticCurveTo(s*.2,-s*.2,s*.13,s*.3);x.lineTo(-s*.13,s*.3);x.quadraticCurveTo(-s*.2,-s*.2,0,-s*.42);x.fill();x.stroke();x.fillStyle='#E8405A';x.beginPath();x.moveTo(0,-s*.42);x.quadraticCurveTo(s*.12,-s*.32,s*.15,-s*.2);x.lineTo(-s*.15,-s*.2);x.quadraticCurveTo(-s*.12,-s*.32,0,-s*.42);x.fill();
      x.fillStyle='#7FC8F0';x.beginPath();x.arc(0,-s*.02,s*.08,0,TAU);x.fill();x.stroke();x.fillStyle='#FFB84A';x.beginPath();x.moveTo(-s*.08,s*.32);x.lineTo(0,s*.46);x.lineTo(s*.08,s*.32);x.fill()}
    x.restore()}
  const pickSym=()=>{let t=Math.random()*20;for(const s of SYM){t-=s.w;if(t<0)return s.id}return'kirsche'};
  /* Auszahlung in Jetons bei 1 Jeton Einsatz (Rückzahlquote rund 96 %) */
  function slotPay(r){if(r[0]===r[1]&&r[1]===r[2])return PAY3[r[0]];const k=r.filter(x=>x==='kirsche').length;return k===2?2:k===1?1:0}

  /* ---------- Kasse ---------- */
  function cashier(){const c=st();const w=UI.win('Kasse · Jetons');const info=el('p');const upd=()=>{info.textContent='Du hast '+c.chips+' Jetons ('+fmt(c.chips*RATE)+' Taler). Heute noch '+(DAYMAX-c.bought)+' Jetons zu haben. 1 Jeton = '+RATE+' Taler.'};upd();w.body.append(info);
    const row=el('div','seg');for(const n of[5,10,25]){const b=el('button',null,n+' Jetons · '+fmt(n*RATE)+' T');b.type='button';b.onclick=()=>{if(c.bought+n>DAYMAX){SND.play('error');say(['Für heute ist Schluss mit Jetons, Schätzchen. Morgen wieder!']);return}
      if(SAVE.money<n*RATE){SND.play('error');UI.toast('Zu wenig Taler.');return}money(-n*RATE);c.chips+=n;c.bought+=n;persist();SND.play('j_buy');upd()};row.append(b)}w.body.append(row);
    w.foot.append(btn('Alle Jetons einlösen','primary',()=>{if(!c.chips){UI.toast('Du hast keine Jetons.');return}const t=c.chips*RATE;money(t);c.chips=0;persist();SND.play('j_success');upd();UI.toast(fmt(t)+' Taler ausgezahlt.')}))}
  function bet(n){const c=st();if(c.chips<n){SND.play('error');UI.toast('Dafür brauchst du '+n+' Jetons. Die Kasse tauscht sie dir.',2600);return false}c.chips-=n;c.lost+=n;persist();return true}
  function win(n){if(n<=0)return;const c=st();c.chips+=n;c.won+=n;persist()}

  /* ---------- Spielautomat ---------- */
  function slot(){const w=UI.win('Spielautomat',{size:'wide'});const cv=document.createElement('canvas');cv.width=480;cv.height=220;cv.style.cssText='display:block;margin:0 auto;width:min(100%,480px);border-radius:18px';
    const info=el('p',null,'Einsatz: 1 Jeton. Drei gleiche gewinnen, Kirschen zahlen immer etwas.');const tab=el('p','sub','3 Raketen 30 · 3 Sterne 15 · 3 Zahnräder 10 · 3 Pilze 8 · 3 Zitronen 5 · 3 Kirschen 4 · 2 Kirschen 2 · 1 Kirsche 1');w.body.append(cv,info,tab);
    const x=cv.getContext('2d');let reels=[pickSym(),pickSym(),pickSym()],spin=[0,0,0],busy=false,flash=0,raf=0;
    function draw(t){x.fillStyle='#3B3450';x.fillRect(0,0,480,220);const g=x.createLinearGradient(0,0,0,220);g.addColorStop(0,'#FFE9F0');g.addColorStop(1,'#FFD2E0');
      for(let i=0;i<3;i++){const X=24+i*148;x.fillStyle=g;x.beginPath();x.roundRect(X,20,136,180,18);x.fill();x.save();x.beginPath();x.roundRect(X,20,136,180,18);x.clip();
        if(spin[i]>0){const off=(t*2.2)%1;for(let k=-1;k<2;k++)drawSym(x,SYM[(Math.floor(t*9)+k+i*2+6)%6].id,X+68,110+(k+off)*120,96)}else drawSym(x,reels[i],X+68,110,110);x.restore()}
      x.strokeStyle=flash>0?'#FFE38A':'#FF8FB1';x.lineWidth=flash>0?8:5;x.beginPath();x.roundRect(6,6,468,208,22);x.stroke()}
    function loop(){const t=performance.now()/1000;flash=Math.max(0,flash-.016);draw(t);if(cv.isConnected)raf=requestAnimationFrame(loop)}loop();
    w.foot.append(btn('Hebel ziehen (1 Jeton)','primary',()=>{if(busy||!bet(1))return;busy=true;const res=[pickSym(),pickSym(),pickSym()];spin=[1,1,1];SND.play('select',{rate:.8});machine(1);
      [700,1050,1400].forEach((ms,i)=>setTimeout(()=>{spin[i]=0;reels[i]=res[i];SND.play('soft',{rate:1.2+i*.15})},ms));
      setTimeout(()=>{busy=false;const p=slotPay(res);if(p>0){win(p);flash=1.2;SND.play(p>=8?'j_success':'pickup');info.textContent=(p>=8?'Jackpot-Glück! ':'Gewonnen: ')+p+' Jeton'+(p>1?'s':'')+'. Du hast '+st().chips+'.'}else info.textContent='Leider nichts. Du hast '+st().chips+' Jetons.'},1500)}))}

  /* ---------- Glücksrad ---------- */
  const WHEEL=[0,1,2,0,1,0,4,0,1,2,0,0];/* Vielfaches des Einsatzes, Mittel 0,92 */
  const WCOL=['#FF8FB1','#FFD85A','#8FD0FF','#C6A9FF','#A6EBC3','#FFB27A'];
  function wheelTex(){return ctex('casino-rad',512,512,(x,w,h)=>{const n=WHEEL.length;for(let i=0;i<n;i++){x.fillStyle=WCOL[i%WCOL.length];x.beginPath();x.moveTo(256,256);x.arc(256,256,250,i/n*TAU-PI/2,(i+1)/n*TAU-PI/2);x.closePath();x.fill();x.strokeStyle='#FFFDF7';x.lineWidth=6;x.stroke();
      x.save();x.translate(256,256);x.rotate((i+.5)/n*TAU);x.fillStyle='#3B3450';x.font='bold 44px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText(WHEEL[i]?'x'+WHEEL[i]:'0',0,-170);x.restore()}
    x.fillStyle='#FFD85A';x.beginPath();x.arc(256,256,40,0,TAU);x.fill();x.strokeStyle='#C98A2B';x.lineWidth=8;x.stroke()})}
  function wheel(){const w=UI.win('Glücksrad',{size:'wide'});const cv=document.createElement('canvas');cv.width=cv.height=360;cv.style.cssText='display:block;margin:0 auto;width:min(100%,360px)';const info=el('p',null,'Einsatz: 2 Jetons. Das Rad zeigt, wie viel du zurückbekommst.');w.body.append(cv,info);
    const x=cv.getContext('2d');const img=wheelTex().image;let ang=0,vel=0,busy=false,target=-1;
    function draw(){x.clearRect(0,0,360,360);x.save();x.translate(180,186);x.rotate(ang);x.drawImage(img,-165,-165,330,330);x.restore();x.strokeStyle='#C98A2B';x.lineWidth=10;x.beginPath();x.arc(180,186,166,0,TAU);x.stroke();
      x.fillStyle='#E8405A';x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.moveTo(166,6);x.lineTo(194,6);x.lineTo(180,40);x.closePath();x.fill();x.stroke()}
    function loop(){if(busy){ang+=vel*.016;vel*=.985;const u=INTERIOR.scene&&INTERIOR.scene.userData.wheel;if(u)u.rotation.z=-ang;if(vel<.08){busy=false;vel=0;settle()}}draw();if(cv.isConnected)requestAnimationFrame(loop)}loop();
    function settle(){const n=WHEEL.length;const a=((-ang%TAU)+TAU)%TAU;const i=Math.floor(a/TAU*n)%n;const m=WHEEL[i];if(m>0){win(2*m);SND.play(m>=4?'j_success':'pickup');info.textContent='x'+m+'! Du bekommst '+2*m+' Jetons. Jetzt: '+st().chips+'.'}else{SND.play('soft',{rate:.7});info.textContent='Diesmal nicht. Du hast '+st().chips+' Jetons.'}}
    w.foot.append(btn('Drehen (2 Jetons)','primary',()=>{if(busy||!bet(2))return;busy=true;vel=9+Math.random()*6;SND.play('select',{rate:.9});info.textContent='Es dreht sich …'}))}

  /* ---------- Höher oder Tiefer ---------- */
  function cardDraw(x,v,X,Y,W,H,back){x.fillStyle=back?'#8E6BD1':'#FFFDF7';x.strokeStyle='#3B3450';x.lineWidth=4;x.beginPath();x.roundRect(X,Y,W,H,14);x.fill();x.stroke();
    if(back){x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=3;x.beginPath();x.roundRect(X+10,Y+10,W-20,H-20,8);x.stroke();drawSym(x,'zahnrad',X+W/2,Y+H/2,70);return}
    const lab=v===1?'A':v===11?'B':v===12?'D':v===13?'K':String(v);const col=v%2?'#E8405A':'#3B3450';x.fillStyle=col;x.font='bold 30px "Nunito","Trebuchet MS",sans-serif';x.textAlign='left';x.fillText(lab,X+10,Y+34);x.textAlign='center';x.font='bold 56px "Nunito","Trebuchet MS",sans-serif';x.fillText(lab,X+W/2,Y+H/2+20);drawSym(x,v%2?'kirsche':'zahnrad',X+W-26,Y+H-26,36)}
  function hilo(){const w=UI.win('Höher oder Tiefer',{size:'wide'});const cv=document.createElement('canvas');cv.width=440;cv.height=220;cv.style.cssText='display:block;margin:0 auto;width:min(100%,440px)';const info=el('p');w.body.append(cv,info);const x=cv.getContext('2d');
    const card=()=>1+Math.floor(Math.random()*13);let cur=0,next=0,pot=0,round=0,live=false;const MULT=1.3,MAXR=5;
    function draw(showNext){x.fillStyle='#2E6A4E';x.beginPath();x.roundRect(0,0,440,220,20);x.fill();if(cur)cardDraw(x,cur,60,24,130,172);cardDraw(x,next,250,24,130,172,!showNext)}
    const foot=w.foot;const bStart=btn('Neue Runde (2 Jetons)','primary',start),bHi=btn('Höher',null,()=>guess(1)),bLo=btn('Tiefer',null,()=>guess(-1)),bCash=btn('Einstreichen',null,cashOut);foot.append(bHi,bLo,bCash,bStart);
    const ui=()=>{bHi.disabled=bLo.disabled=!live;bCash.disabled=!live||round===0;bStart.disabled=live};
    function start(){if(!bet(2))return;cur=card();next=0;pot=2;round=0;live=true;draw(false);info.textContent='Kommt als Nächstes eine höhere oder eine tiefere Karte? Gleich verliert. Topf: '+pot+' Jetons.';SND.play('select');ui()}
    function guess(d){if(!live)return;next=card();draw(true);const ok=d>0?next>cur:next<cur;if(!ok){live=false;SND.play('soft',{rate:.6});info.textContent='Oh nein! Der Topf ist weg. Madame Jeton lächelt freundlich.';ui();return}
      round++;pot=Math.round(pot*MULT*10)/10;SND.play('pickup',{rate:1+round*.08});if(round>=MAXR){cashOut();return}info.textContent='Richtig! Topf: '+pot+' Jetons ('+round+'/'+MAXR+'). Weiter oder einstreichen?';setTimeout(()=>{cur=next;next=0;draw(false)},650);ui()}
    function cashOut(){if(!live)return;live=false;const got=Math.floor(pot);win(got);SND.play('j_success');info.textContent='Eingestrichen: '+got+' Jetons. Du hast jetzt '+st().chips+'.';ui()}
    x.fillStyle='#2E6A4E';x.fillRect(0,0,440,220);info.textContent='Einsatz: 2 Jetons. Jede richtige Ansage macht den Topf 1,3-mal grösser (höchstens 5 Runden).';ui();draw(false)}

  /* ---------- Innenraum ---------- */
  function machine(i){const u=INTERIOR.scene&&INTERIOR.scene.userData.casino;if(u)u.pull=.6}
  function slotModel(M,col){const g=new THREE.Group();B(g,.9,1.3,.7,.12,M.c(col,{gloss:.7}),[0,.65,0]);P(g,G.cy(.45,.45,.7,false),M.c(col,{gloss:.7}),[0,1.3,0],[PI/2,0,0],[1,1,1]);
    const scr=ctex('slot-scr',256,128,(x,w,h)=>{x.fillStyle='#FFE9F0';x.fillRect(0,0,w,h);['stern','kirsche','rakete'].forEach((s,i)=>drawSym(x,s,44+i*84,64,70))});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(.68,.34),new THREE.MeshBasicMaterial({map:scr}));sm.position.set(0,1.05,.352);sm.userData.noOutline=true;g.add(sm);B(g,.76,.42,.04,.03,M.c(PAL.ink),[0,1.05,.335]);
    B(g,.7,.08,.3,.03,M.c('#FFFDF7'),[0,.72,.42]);const lv=grp(g,[.5,.9,0]);bt(lv,[0,0,0],[0,.5,0],.03,M.steel());S(lv,.08,M.c('#E8405A',{gloss:1}),[0,.55,0]);
    const bulbs=[];for(let i=0;i<7;i++){const a=PI*(i/6);const b=S(g,.045,M.glow('#FFE38A',1.6),[Math.cos(a)*.42,1.3+Math.sin(a)*.42,.36]);bulbs.push(b)}g.userData.bulbs=bulbs;g.userData.lever=lv;return g}
  function build(sc){const W=12,D=9,H=3.8;INTERIOR.makeRoom(sc,W,D,H,'streifen','teppich',{trim:'#C98A2B',windows:false});const A=INTERIOR.actions,Cl=INTERIOR.colliders;const M=makeMats({skin:'haut',color:0});
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.55;o.color.set('#FFE6D8')}});
    /* Leuchtschrift */const neon=ctex('casino-neon',512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.font='bold 74px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.shadowColor='#FF6FA8';x.shadowBlur=24;x.fillStyle='#FFD2E6';x.fillText('Glücks-Salon',w/2,90)});
    const nm=new THREE.Mesh(new THREE.PlaneGeometry(4,1),new THREE.MeshBasicMaterial({map:neon,transparent:true,toneMapped:false,color:new THREE.Color(1.6,1.3,1.5)}));nm.position.set(0,3.05,-D/2+.03);nm.userData.noOutline=true;sc.add(nm);
    /* Automaten links */const cols=['#FF8FB1','#56C6B6','#FFB84A'];const machines=[];cols.forEach((c,i)=>{const m=slotModel(M,c);m.position.set(-W/2+.8,0,-2.4+i*1.7);m.rotation.y=PI/2;sc.add(m);addOutlines(m);machines.push(m);Cl.push({x0:-W/2,x1:-W/2+1.3,z0:-2.4+i*1.7-.5,z1:-2.4+i*1.7+.5});
      const stl=grp(sc,[-W/2+1.7,0,-2.4+i*1.7]);C(stl,.2,.2,.08,M.c('#E8405A',{gloss:.6}),[0,.62,0]);bt(stl,[0,0,0],[0,.6,0],.03,M.gold());C(stl,.18,.2,.04,M.gold(),[0,.02,0]);addOutlines(stl);
      A.push({x:-W/2+1.9,z:-2.4+i*1.7,r:.9,label:'Spielautomat',act:slot})});
    /* Glücksrad an der rechten Wand */const wg=grp(sc,[W/2-.25,2.1,-1],[0,-PI/2,0]);const disc=new THREE.Mesh(new THREE.CircleGeometry(1.1,48),new THREE.MeshBasicMaterial({map:wheelTex()}));disc.userData.noOutline=true;wg.add(disc);
    P(wg,G.to(1.12,.07),M.gold(),[0,0,.02]);S(wg,.12,M.gold(),[0,0,.05]);P(wg,G.co(.14,.3),M.c('#E8405A',{gloss:.8}),[0,1.28,.08],[0,0,PI]);for(let i=0;i<16;i++){const a=i/16*TAU;S(wg,.04,M.glow('#FFE38A',1.4),[Math.cos(a)*1.22,Math.sin(a)*1.22,.04])}sc.userData.wheel=disc;
    A.push({x:W/2-1.4,z:-1,r:1.2,label:'Glücksrad drehen',act:wheel});
    /* Kartentisch mit Madame Jeton */const tb=grp(sc,[1.2,0,-3]);P(tb,G.cy(1.3,1.3,.12),M.c('#2E8A5E'),[0,.82,0],null,[1,1,.6]);P(tb,G.to(1.3,.08),Wd(M,'#8A5A44'),[0,.86,0],[PI/2,0,0],[1,.6,1]);C(tb,.25,.35,.8,Wd(M,'#8A5A44'),[0,.4,0]);
    for(let i=0;i<3;i++)B(tb,.26,.02,.36,.01,M.c(i===1?'#8E6BD1':'#FFFDF7'),[-.5+i*.5,.9,.3],[0,(i-1)*.2,0]);for(let i=0;i<5;i++)C(tb,.07,.07,.03,M.c(['#E8405A','#56C6B6','#FFD85A'][i%3]),[.8,.9+i*.032,-.2]);addOutlines(tb);Cl.push({x0:-.2,x1:2.6,z0:-3.9,z1:-2.2});
    try{const md=buildCreature(madame(),{q:HIGH?.65:.45,noShadow:!HIGH,blob:false,merge:true});md.scale.setScalar(CS);md.position.set(1.2,0,-4.0);sc.add(md);sc.userData.madame=md}catch(e){console.warn('Madame',e)}
    A.push({x:1.2,z:-1.6,r:1.2,label:'Höher oder Tiefer (Madame Jeton)',act:hilo});
    /* Kasse vorne rechts */const k=grp(sc,[W/2-1.6,0,2.6]);B(k,1.6,1.0,.7,.06,Wd(M,'#8A5A44'),[0,.5,0]);B(k,1.7,.08,.8,.03,M.gold(),[0,1.04,0]);for(let i=0;i<4;i++)C(k,.08,.08,.04+i*.03,M.c(['#E8405A','#FFD85A'][i%2]),[-.5+i*.18,1.1+i*.015,0]);
    const sg=ctex('casino-kasse',256,64,(x,w,h)=>{x.fillStyle='#3B3450';x.fillRect(0,0,w,h);x.fillStyle='#FFE38A';x.font='bold 36px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText('KASSE',w/2,45)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(.9,.22),new THREE.MeshBasicMaterial({map:sg}));sm.position.set(0,.7,.36);sm.userData.noOutline=true;k.add(sm);addOutlines(k);Cl.push({x0:W/2-2.5,x1:W/2-.7,z0:2.2,z1:3});
    A.push({x:W/2-1.6,z:1.6,r:1.1,label:'Jetons tauschen',act:cashier});
    /* Lampen, Pflanzen, Samtkordel */INTERIOR.lamp(sc,'steh',-W/2+.6,0,3.4,{col:'#FFC88A',i:1,d:7});INTERIOR.lamp(sc,'steh',W/2-.6,0,-3.9,{col:'#FFC88A',i:1,d:7});
    for(const x of[-1.4,1.4]){const p=grp(sc,[x,0,3.9]);bt(p,[0,0,0],[0,.9,0],.04,M.gold());S(p,.07,M.gold(),[0,.94,0])}{const rope=new THREE.CatmullRomCurve3([new V3(-1.4,.88,3.9),new V3(0,.6,3.9),new V3(1.4,.88,3.9)]);P(sc,new THREE.TubeGeometry(rope,16,.035,6),M.c('#C8284A'))}
    sc.userData.casino={machines,pull:0};return{W,D,camD:12}}
  function frame(dt,t){const sc=INTERIOR.scene;if(!sc)return;const u=sc.userData.casino;if(u){u.pull=Math.max(0,u.pull-dt);u.machines.forEach((m,i)=>{m.userData.bulbs.forEach((b,k)=>{b.visible=((Math.floor(t*4)+k+i)%3)!==0});m.userData.lever.rotation.x=u.pull>0?Math.sin(u.pull/.6*PI)*.9:0})}
    const md=sc.userData.madame;if(md&&md.userData.tick)md.userData.tick(t,false,UI.typing?.4:0)}
  function enter(){INTERIOR.enter('casino');const c=st();setTimeout(()=>{if(!c.greeted){c.greeted=true;persist();say(['Bienvenue im Glücks-Salon, Schätzchen! Ich bin Madame Jeton.','An der Kasse tauschst du Taler in Jetons – höchstens '+DAYMAX+' pro Tag, damit es ein Spass bleibt.','Und denk dran: Die Bank gewinnt auf Dauer ein kleines bisschen.'])}},900)}
  if(typeof INTERIOR!=='undefined')INTERIOR.kinds.casino={bg:'#2A1E34',music:'museum',build,frame};
  return{enter,slotPay,WHEEL,SYM,st}
})();
