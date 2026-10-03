/* =====================================================================
   CYBORG-LABOR · casino.js
   Spielhalle in jedem Dorf (ersetzt den früheren Glücks-Salon).
   Nur Geschicklichkeit, kein Glücksspiel: Jedes Spiel kostet 10 Taler,
   wer gut spielt, bekommt Tickets. Tickets tauscht man an der Preis-Theke
   bei Tilly gegen Möbel und Plüschtiere. Tickets lassen sich nie zurück
   in Taler tauschen.
   Spiele: Stopp-Licht (Timing), Hau den Rissling (Reaktion),
   Kapsel-Memory (Gedächtnis), Greifautomat (Zielen, kein Zufall).
   ===================================================================== */
const CASINO=(()=>{
  const B=(g,w,h,d,rad,mat,p,r,sc)=>P(g,G.bx(w,h,d,rad),mat,p,r,sc),C=(g,rt,rb,h,mat,p,r,sc)=>P(g,G.cy(rt,rb,h),mat,p,r,sc),S=(g,r,mat,p,sc)=>P(g,G.s(r),mat,p,null,sc);
  const Wd=(m,c)=>window.HOUSEKIT?HOUSEKIT.Wd(m,c):m.c(c);const PRICE=10;const NM='Tilly';const VOICE={pitch:300,kind:'robot',speed:1.15};
  /* Spielstand; alte Jetons aus dem Glücks-Salon werden einmal als Taler zurückgezahlt */
  const st=()=>{if(SAVE.casino&&!SAVE.arkade){const c=SAVE.casino;SAVE.arkade={tickets:0,games:0,best:{}};if(c.chips>0){SAVE.money+=c.chips*10;SAVE.arkade.refund=c.chips*10}delete SAVE.casino;persist()}
    return SAVE.arkade=SAVE.arkade||{tickets:0,games:0,best:{}}};
  const tilly=()=>({name:NM,body:{seg:1,size:1,skin:'plastik',color:9,shape:'kapselspiel',pattern:'bauch',color2:16},parts:{kopf:'monitor',augen:'kulleraugen',arme:'mensch',beine:'mensch',extras:[]},
    clothes:{hat:'kappe',top:'weste',col:{hat:5,top:12}}});
  const say=(lines)=>UI.talk(NM,lines,{voice:VOICE});
  function pay(){if(SAVE.money<PRICE){SND.play('error');UI.toast('Ein Spiel kostet '+PRICE+' Taler.',2400);return false}money(-PRICE);const s=st();s.games++;persist();return true}
  function give(n,game,score){const s=st();n=Math.max(0,Math.round(n));s.tickets+=n;if(score!=null&&score>(s.best[game]||0))s.best[game]=score;persist();if(n>0)SND.play(n>=8?'j_success':'pickup');return n}
  const tk=()=>st().tickets;

  /* ---------- Symbole (gezeichnet, keine Emoji) ---------- */
  const SYM=['kirsche','zitrone','pilz','zahnrad','stern','rakete'];
  function drawSym(x,id,cx,cy,s){x.save();x.translate(cx,cy);x.lineJoin='round';x.lineCap='round';x.lineWidth=s*.06;x.strokeStyle='#3B3450';
    if(id==='kirsche'){x.strokeStyle='#4E8A3A';x.lineWidth=s*.07;x.beginPath();x.moveTo(-s*.18,s*.05);x.quadraticCurveTo(-s*.05,-s*.35,s*.12,-s*.38);x.moveTo(s*.2,s*.08);x.quadraticCurveTo(s*.2,-s*.2,s*.12,-s*.38);x.stroke();
      x.strokeStyle='#3B3450';x.lineWidth=s*.05;for(const[dx,dy]of[[-s*.2,s*.18],[s*.2,s*.2]]){x.fillStyle='#E8405A';x.beginPath();x.arc(dx,dy,s*.18,0,TAU);x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(dx-s*.06,dy-s*.06,s*.05,0,TAU);x.fill()}}
    else if(id==='zitrone'){x.fillStyle='#FFD85A';x.beginPath();x.ellipse(0,0,s*.36,s*.26,-.3,0,TAU);x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(-s*.1,-s*.08,s*.1,s*.05,-.3,0,TAU);x.fill()}
    else if(id==='pilz'){x.fillStyle='#FFF1DC';x.beginPath();x.roundRect(-s*.12,-s*.02,s*.24,s*.36,s*.08);x.fill();x.stroke();x.fillStyle='#E8405A';x.beginPath();x.moveTo(-s*.38,s*.02);x.quadraticCurveTo(-s*.36,-s*.4,0,-s*.4);x.quadraticCurveTo(s*.36,-s*.4,s*.38,s*.02);x.closePath();x.fill();x.stroke();
      x.fillStyle='#FFFFFF';for(const[dx,dy,r]of[[-s*.18,-s*.12,.06],[s*.1,-s*.24,.07],[s*.22,-s*.06,.05]]){x.beginPath();x.arc(dx,dy,s*r,0,TAU);x.fill()}}
    else if(id==='zahnrad'){x.fillStyle='#AEB9C8';x.beginPath();const n=8;for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU;const r=i%2?s*.28:s*.36;const a2=a+TAU/(n*4);x.lineTo(Math.cos(a)*r,Math.sin(a)*r);x.lineTo(Math.cos(a2)*r,Math.sin(a2)*r)}x.closePath();x.fill();x.stroke();x.fillStyle='#5B5170';x.beginPath();x.arc(0,0,s*.1,0,TAU);x.fill()}
    else if(id==='stern'){x.fillStyle='#FFD85A';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5;const r=i%2?s*.17:s*.38;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.stroke();x.fillStyle='#3B3450';x.beginPath();x.arc(-s*.07,-s*.02,s*.03,0,TAU);x.arc(s*.07,-s*.02,s*.03,0,TAU);x.fill()}
    else if(id==='rakete'){x.rotate(.5);x.fillStyle='#FFFDF7';x.beginPath();x.moveTo(0,-s*.42);x.quadraticCurveTo(s*.2,-s*.2,s*.13,s*.3);x.lineTo(-s*.13,s*.3);x.quadraticCurveTo(-s*.2,-s*.2,0,-s*.42);x.fill();x.stroke();
      x.fillStyle='#E8405A';x.beginPath();x.moveTo(0,-s*.42);x.quadraticCurveTo(s*.12,-s*.32,s*.15,-s*.2);x.lineTo(-s*.15,-s*.2);x.quadraticCurveTo(-s*.12,-s*.32,0,-s*.42);x.fill();x.fillStyle='#7FC8F0';x.beginPath();x.arc(0,-s*.02,s*.08,0,TAU);x.fill();x.stroke()}
    x.restore()}
  /* kleiner Rissling (weisser Würfel mit Farbversatz) und Piko-Ei für Hau den Rissling */
  function drawRiss(x,cx,cy,s){x.save();x.translate(cx,cy);x.globalAlpha=.5;x.fillStyle='#c8102e';x.beginPath();x.roundRect(-s/2-4,-s/2,s,s,s*.2);x.fill();x.fillStyle='#45e0ff';x.beginPath();x.roundRect(-s/2+4,-s/2,s,s,s*.2);x.fill();x.globalAlpha=1;
    x.fillStyle='#f7f6f4';x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.roundRect(-s/2,-s/2,s,s,s*.2);x.fill();x.stroke();x.fillStyle='#141414';x.fillRect(-s*.22,-s*.12,s*.12,s*.2);x.fillRect(s*.1,-s*.12,s*.12,s*.2);x.restore()}
  function drawEgg(x,cx,cy,s){x.save();x.translate(cx,cy);x.fillStyle='#8fd8ff';x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.ellipse(0,0,s*.42,s*.54,0,0,TAU);x.fill();x.stroke();x.fillStyle='#c9f27a';x.beginPath();x.roundRect(-s*.24,-s*.2,s*.48,s*.3,6);x.fill();x.fillStyle='#3B3450';x.fillRect(-s*.12,-s*.1,s*.06,s*.08);x.fillRect(s*.06,-s*.1,s*.06,s*.08);x.restore()}
  const canvas=(w,h)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.style.cssText='display:block;margin:0 auto;width:min(100%,'+w+'px);border-radius:18px;touch-action:manipulation';return cv};
  const head=(w,txt)=>{const p=el('p','sub');const upd=()=>{p.textContent=txt()+' · Tickets: '+tk()};upd();w.body.prepend(p);return upd};

  /* ---------- 1. Stopp-Licht: das Licht im Ring genau auf dem Stern anhalten ---------- */
  function stopLight(){const w=UI.win('Stopp-Licht',{size:'wide'});const cv=canvas(340,340);const info=el('p',null,'Drei Runden. Halte das Licht genau auf dem goldenen Stern an. Jede Runde wird schneller.');w.body.append(cv,info);
    const upd=head(w,()=>'Ein Spiel kostet '+PRICE+' Taler');const x=cv.getContext('2d');const N=24;let pos=0,speed=0,run=false,round=0,sum=0,hold=-1,flash=0;
    function draw(){x.fillStyle='#3B3450';x.fillRect(0,0,340,340);for(let i=0;i<N;i++){const a=i/N*TAU-PI/2;const X=170+Math.cos(a)*130,Y=170+Math.sin(a)*130;const on=Math.floor(pos)%N===i||hold===i;
        if(i===0)drawSym(x,'stern',X,Y,on?46:38);else{x.fillStyle=on?'#ffe38a':'#5b5170';x.beginPath();x.arc(X,Y,on?13:9,0,TAU);x.fill()}}
      x.fillStyle='#ffd2e6';x.font='bold 30px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText(run?'Runde '+round+'/3':'Bereit?',170,162);x.font='bold 22px "Nunito","Trebuchet MS",sans-serif';x.fillText(sum+' Tickets',170,196);
      if(flash>0){x.strokeStyle='rgba(255,227,138,'+flash+')';x.lineWidth=10;x.beginPath();x.arc(170,170,150,0,TAU);x.stroke()}}
    let last=performance.now();function loop(){const t=performance.now();const dt=Math.min(.05,(t-last)/1000);last=t;if(run&&hold<0)pos=(pos+speed*dt)%N;flash=Math.max(0,flash-dt);draw();if(cv.isConnected)requestAnimationFrame(loop)}loop();
    const bGo=btn('Spielen ('+PRICE+' Taler)','primary',start),bStop=btn('Stopp!',null,stop);w.foot.append(bStop,bGo);const ui=()=>{bStop.disabled=!run||hold>=0;bGo.disabled=run};ui();
    function start(){if(run||!pay())return;run=true;round=1;sum=0;pos=N/2;speed=9;hold=-1;info.textContent='Los! Drück «Stopp!», wenn das Licht auf dem Stern ist.';ui();upd();setTimeout(()=>bStop.focus(),30)}
    function stop(){if(!run||hold>=0)return;const i=Math.floor(pos)%N;hold=i;const d=Math.min(i,N-i);const pts=d===0?6:d===1?3:d===2?1:0;sum+=pts;flash=pts?1:0;SND.play(pts?'pickup':'soft',{rate:pts?1+pts*.05:.7});
      info.textContent=d===0?'Genau getroffen! +6':d===1?'Ganz knapp! +3':d===2?'Nah dran. +1':'Daneben.';ui();
      setTimeout(()=>{hold=-1;if(round>=3){run=false;const got=give(sum,'stopp',sum);info.textContent='Fertig! Du bekommst '+got+' Tickets.';ui();upd();return}round++;speed+=5;pos=(i+N/2)%N;ui();bStop.focus()},900)}}

  /* ---------- 2. Hau den Rissling: 20 Sekunden, Rissling treffen, Piko nicht ---------- */
  function whack(){const w=UI.win('Hau den Rissling',{size:'wide'});const cv=canvas(360,300);const info=el('p',null,'20 Sekunden: Tipp auf die Risslinge (oder Taste 1 bis 9). Das Ei ist Piko, das bitte nicht hauen!');w.body.append(cv,info);
    const upd=head(w,()=>'Ein Spiel kostet '+PRICE+' Taler');const x=cv.getContext('2d');let run=false,t0=0,hits=0,miss=0,holes=Array(9).fill(null),nextT=0,bonk=[];
    const hp=i=>[60+(i%3)*120,60+Math.floor(i/3)*90];
    function draw(now){x.fillStyle='#2e6a4e';x.fillRect(0,0,360,300);for(let i=0;i<9;i++){const[X,Y]=hp(i);x.fillStyle='#1d3f2f';x.beginPath();x.ellipse(X,Y+22,40,14,0,0,TAU);x.fill();const h=holes[i];
        if(h){const k=Math.min(1,(now-h.t)/120,(h.end-now)/120);x.save();x.beginPath();x.rect(X-50,Y-60,100,82);x.clip();if(h.egg)drawEgg(x,X,Y+30-k*34,56);else drawRiss(x,X,Y+30-k*34,48);x.restore()}
        x.fillStyle='rgba(255,255,255,.5)';x.font='bold 14px sans-serif';x.textAlign='center';x.fillText(String(i+1),X+44,Y+30)}
      for(const b of bonk){x.fillStyle='rgba(255,227,138,'+(1-(now-b.t)/400)+')';x.font='bold 22px sans-serif';x.fillText(b.txt,b.x,b.y-(now-b.t)/20)}bonk=bonk.filter(b=>now-b.t<400);
      const left=run?Math.max(0,20-(now-t0)/1000):20;x.fillStyle='#fffdf7';x.font='bold 20px "Nunito","Trebuchet MS",sans-serif';x.textAlign='left';x.fillText('Zeit '+left.toFixed(0)+'  ·  Treffer '+hits,12,292)}
    function loop(){const now=performance.now();if(run){const el_=(now-t0)/1000;if(el_>=20)end();else{for(let i=0;i<9;i++)if(holes[i]&&now>holes[i].end)holes[i]=null;
        if(now>nextT){const free=[...Array(9).keys()].filter(i=>!holes[i]);if(free.length){const i=free[Math.floor(Math.random()*free.length)];const life=900-el_*18;holes[i]={t:now,end:now+life,egg:Math.random()<.18}}nextT=now+520-el_*12}}}
      draw(now);if(cv.isConnected)requestAnimationFrame(loop);else run=false}loop();
    function hit(i){if(!run)return;const h=holes[i];const[X,Y]=hp(i);const now=performance.now();if(!h){miss++;return}holes[i]=null;
      if(h.egg){hits=Math.max(0,hits-1);SND.play('error');bonk.push({x:X,y:Y,t:now,txt:'Aua!'});if(typeof PIKO!=='undefined'&&Math.random()<.3)PIKO.want('He! Ich bin doch kein Rissling!')}else{hits++;SND.play('click',{rate:1+Math.random()*.3});bonk.push({x:X,y:Y,t:now,txt:'+1'})}}
    cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();const px=(e.clientX-r.left)/r.width*360,py=(e.clientY-r.top)/r.height*300;let best=-1,bd=1e9;for(let i=0;i<9;i++){const[X,Y]=hp(i);const d=Math.hypot(px-X,py-Y+10);if(d<bd){bd=d;best=i}}if(bd<60)hit(best)});
    const kd=e=>{if(!cv.isConnected){removeEventListener('keydown',kd,true);return}if(run&&/^[1-9]$/.test(e.key)){e.preventDefault();e.stopPropagation();hit(+e.key-1)}};addEventListener('keydown',kd,true);
    const bGo=btn('Spielen ('+PRICE+' Taler)','primary',start);w.foot.append(bGo);
    function start(){if(run||!pay())return;run=true;t0=performance.now();nextT=t0+400;hits=0;miss=0;holes.fill(null);bGo.disabled=true;upd()}
    function end(){run=false;holes.fill(null);const got=give(Math.min(12,Math.floor(hits/2)),'hau',hits);info.textContent=hits+' Treffer! Du bekommst '+got+' Tickets.';bGo.disabled=false;upd()}}

  /* ---------- 3. Kapsel-Memory: sechs Paare finden, je weniger Züge, desto mehr Tickets ---------- */
  function memory(){const w=UI.win('Kapsel-Memory',{size:'wide'});const info=el('p',null,'Finde die sechs Paare. Mit wenigen Zügen gibt es mehr Tickets (höchstens 14).');const grid=el('div','arkade-mem');w.body.append(info,grid);
    const upd=head(w,()=>'Ein Spiel kostet '+PRICE+' Taler');const icon={};const ic=(id,back)=>{const k=(back?'b':'')+id;if(icon[k])return icon[k];const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');
      x.fillStyle=back?'#8e6bd1':'#fffdf7';x.beginPath();x.roundRect(2,2,92,92,16);x.fill();if(back){x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=3;x.beginPath();x.roundRect(10,10,76,76,10);x.stroke();drawSym(x,'zahnrad',48,48,50)}else drawSym(x,id,48,48,72);return icon[k]=c.toDataURL()};
    let cards=[],open=[],moves=0,found=0,run=false,lock=false;
    function deal(){const ids=[...SYM,...SYM];for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}cards=ids.map(id=>({id,up:false,done:false}));open=[];moves=0;found=0;draw()}
    function draw(){grid.replaceChildren();cards.forEach((c,i)=>{const b=el('button','card');b.type='button';b.disabled=!run||c.done||c.up;const im=new Image();im.src=ic(c.id,!(c.up||c.done));im.alt=c.up||c.done?c.id:'verdeckt';b.append(im);b.onclick=()=>flip(i);grid.append(b)})}
    function flip(i){if(!run||lock)return;const c=cards[i];if(c.up||c.done)return;c.up=true;open.push(i);SND.play('select',{rate:1.2});
      if(open.length===2){moves++;const[a,b]=open;if(cards[a].id===cards[b].id){cards[a].done=cards[b].done=true;open=[];found++;SND.play('pickup');if(found===6){run=false;const got=give(Math.max(2,Math.min(14,20-moves)),'memory',Math.max(0,30-moves));info.textContent='Alle gefunden in '+moves+' Zügen! Du bekommst '+got+' Tickets.';bGo.disabled=false;upd()}}
        else{lock=true;setTimeout(()=>{cards[a].up=cards[b].up=false;open=[];lock=false;draw()},800)}}
      if(run)info.textContent='Züge: '+moves+' · Paare: '+found+'/6';draw()}
    const bGo=btn('Spielen ('+PRICE+' Taler)','primary',()=>{if(run||!pay())return;run=true;bGo.disabled=true;deal();info.textContent='Züge: 0 · Paare: 0/6';upd()});w.foot.append(bGo);deal()}

  /* ---------- 4. Greifautomat: der Greifer fährt hin und her, du lässt ihn fallen ---------- */
  const PLUSH=['k_furn_bear','k_furn_pillowBlue','k_furn_pillow','k_holiday_snowman-hat','leuchtsterne','ei_lampe'];
  function claw(){const w=UI.win('Greifautomat',{size:'wide'});const cv=canvas(360,280);const info=el('p',null,'Der Greifer fährt hin und her. Drück «Greifen», wenn er genau über einem Plüschtier ist.');w.body.append(cv,info);
    const upd=head(w,()=>'Ein Versuch kostet '+PRICE+' Taler');const x=cv.getContext('2d');const toys=[];const cols=['#ff8fb1','#8fd0ff','#ffd85a','#a6ebc3','#c6a9ff'];
    for(let i=0;i<5;i++)toys.push({x:50+i*65+(Math.random()-.5)*20,c:cols[i],got:false});let cx=40,dir=1,run=false,drop=0,cy=40,grab=null,phase='idle';
    function draw(){x.fillStyle='#fff0f6';x.fillRect(0,0,360,280);x.fillStyle='#ffd2e0';x.fillRect(0,230,360,50);
      for(const t of toys)if(!t.got&&t!==grab){x.fillStyle=t.c;x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.arc(t.x,214,22,0,TAU);x.fill();x.stroke();x.beginPath();x.arc(t.x-14,196,8,0,TAU);x.arc(t.x+14,196,8,0,TAU);x.fill();x.fillStyle='#3B3450';x.fillRect(t.x-8,210,4,5);x.fillRect(t.x+4,210,4,5)}
      x.strokeStyle='#8b93a6';x.lineWidth=4;x.beginPath();x.moveTo(0,20);x.lineTo(360,20);x.stroke();x.beginPath();x.moveTo(cx,20);x.lineTo(cx,cy);x.stroke();x.fillStyle='#c22c46';x.fillRect(cx-14,cy-6,28,12);
      x.strokeStyle='#3B3450';x.lineWidth=4;x.beginPath();x.moveTo(cx-12,cy+6);x.lineTo(cx-18,cy+24);x.moveTo(cx+12,cy+6);x.lineTo(cx+18,cy+24);x.stroke();
      if(grab){x.fillStyle=grab.c;x.beginPath();x.arc(cx,cy+40,22,0,TAU);x.fill()}x.fillStyle='#3B3450';x.fillRect(300,234,52,40);x.fillStyle='#fffdf7';x.font='bold 12px sans-serif';x.textAlign='center';x.fillText('AUSGABE',326,258)}
    let last=performance.now();function loop(){const now=performance.now();const dt=Math.min(.05,(now-last)/1000);last=now;
      if(phase==='move'){cx+=dir*150*dt;if(cx>320){cx=320;dir=-1}if(cx<30){cx=30;dir=1}}
      else if(phase==='down'){cy+=200*dt;if(cy>=176){cy=176;phase='up';const t=toys.find(t=>!t.got&&Math.abs(t.x-cx)<15);grab=t||null;SND.play(t?'pickup':'soft',{rate:t?1.1:.7})}}
      else if(phase==='up'){cy-=150*dt;if(cy<=40){cy=40;phase=grab?'home':'idle';if(!grab)done(false)}}
      else if(phase==='home'){cx+=(326-cx)*Math.min(1,dt*4);if(Math.abs(cx-326)<2){phase='idle';done(true)}}
      draw();if(cv.isConnected)requestAnimationFrame(loop)}loop();
    function done(ok){run=false;bGo.disabled=false;bGrab.disabled=true;if(!ok){info.textContent='Knapp daneben! Ziel genau auf die Mitte.';upd();return}
      grab.got=true;grab=null;const id=PLUSH.filter(i=>findFurn(i))[Math.floor(Math.random()*PLUSH.filter(i=>findFurn(i)).length)];
      if(id&&bagAdd('furn',id)){SND.jingle('j_success');info.textContent='Erwischt! '+itemName('furn',id)+' ist jetzt in deiner Tasche.'}else{give(10,'greifer');info.textContent='Erwischt! Deine Tasche ist voll, darum gibt es 10 Tickets.'}upd();
      if(toys.every(t=>t.got))toys.forEach((t,i)=>{t.got=false;t.x=50+i*65+(Math.random()-.5)*20})}
    const bGo=btn('Münze einwerfen ('+PRICE+' Taler)','primary',()=>{if(run||!pay())return;run=true;phase='move';bGo.disabled=true;bGrab.disabled=false;upd();setTimeout(()=>bGrab.focus(),30)});
    const bGrab=btn('Greifen',null,()=>{if(phase!=='move')return;phase='down';bGrab.disabled=true});bGrab.disabled=true;w.foot.append(bGrab,bGo)}

  /* ---------- Preis-Theke: Tickets gegen Preise, nie zurück in Taler ---------- */
  const PRIZES=[['k_furn_pillow',20],['k_furn_pillowBlue',20],['leuchtsterne',25],['k_furn_bear',30],['ei_lampe',40],['cd_turm',40],['sitzsack',60],['perlenvorhang',60],['lavalampe',80],['glastelefon',90],['sternprojektor',110],['kapselautomat',150]];
  function counter(){const w=UI.win('Preis-Theke',{size:'wide'});const p=el('p');const grid=el('div','grid');w.body.append(p,grid);
    const draw=()=>{p.textContent='Du hast '+tk()+' Tickets. Tickets bekommst du an den Spielen. Zurück in Taler tauschen geht nicht.';grid.replaceChildren();
      for(const[id,cost]of PRIZES){const f=findFurn(id);if(!f)continue;const c=el('button','card');c.type='button';c.append(el('b',null,f.n||id),el('span','sub',cost+' Tickets'));c.disabled=tk()<cost;
        c.onclick=()=>{const s=st();if(s.tickets<cost)return;if(!bagAdd('furn',id)){SND.play('error');UI.toast('Deine Tasche ist voll.');return}s.tickets-=cost;persist();SND.jingle('j_success');UI.toast(itemName('furn',id)+' ist jetzt in deiner Tasche.',2600);draw()};grid.append(c)}};draw()}

  /* ---------- Innenraum ---------- */
  function cabinet(M,col,title,sym){const g=new THREE.Group();const body=M.c(col,{gloss:.8});B(g,1.0,1.9,.8,.1,body,[0,.95,0]);B(g,1.04,.3,.9,.06,M.c('#fffdf7',{gloss:.6}),[0,1.95,.04]);
    const scr=ctex('arkade-'+title,256,192,(x,w,h)=>{x.fillStyle='#1d2b0b';x.fillRect(0,0,w,h);x.fillStyle='#c9f27a';x.font='bold 30px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText(title,w/2,40);drawSym(x,sym,w/2,120,96)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(.72,.54),new THREE.MeshBasicMaterial({map:scr,toneMapped:false}));sm.position.set(0,1.42,.405);sm.userData.noOutline=true;g.add(sm);
    B(g,.96,.12,.36,.04,M.c('#3b3450'),[0,1.0,.52],[-.3,0,0]);C(g,.025,.025,.16,M.c('#3b3450'),[-.22,1.12,.56]);S(g,.05,M.gloss?M.gloss('#e8405a'):M.c('#e8405a'),[-.22,1.2,.56]);
    for(let i=0;i<3;i++)S(g,.04,M.glow(['#ff6fa5','#45e0ff','#ffd23f'][i],1.6),[.06+i*.12,1.08,.6]);const bulbs=[];for(let i=0;i<5;i++)bulbs.push(S(g,.035,M.glow('#ffe38a',1.6),[-.4+i*.2,2.12,.46]));g.userData.bulbs=bulbs;return g}
  function build(sc){const W=12,D=9,H=3.8;INTERIOR.makeRoom(sc,W,D,H,'streifen','teppich',{trim:'#45e0ff',windows:false});const A=INTERIOR.actions,Cl=INTERIOR.colliders;const M=makeMats({skin:'plastik',color:0});
    sc.traverse(o=>{if(o.isHemisphereLight){o.intensity=.75;o.color.set('#F0ECFF')}});{const L=new THREE.DirectionalLight('#FFE8F4',.3);L.position.set(2,7,6);sc.add(L)}
    const neon=ctex('arkade-neon',512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.font='bold 74px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.shadowColor='#45e0ff';x.shadowBlur=24;x.fillStyle='#d8f8ff';x.fillText('Spielhalle',w/2,90)});
    const nm=new THREE.Mesh(new THREE.PlaneGeometry(4,1),new THREE.MeshBasicMaterial({map:neon,transparent:true,toneMapped:false,color:new THREE.Color(1.4,1.5,1.6)}));nm.position.set(0,3.05,-D/2+.03);nm.userData.noOutline=true;sc.add(nm);
    /* Kenney Mini Arcade (CC0): Greifautomat, Preise, Flipper, Getränkeautomat, Theke */
    const kp=(nm,x,z,ry,s)=>{if(typeof KIT==='undefined'||!KIT.has('arcade',nm))return null;const bb=KIT.bounds('arcade',nm);const m=KIT.mesh('arcade',nm,KIT.ORIG);m.scale.setScalar(s);m.position.set(-(bb[0]+bb[3])/2*s,-bb[1]*s,-(bb[2]+bb[5])/2*s);const g=grp(sc,[x,0,z],[0,ry,0]);g.add(m);return g};
    const GAMES=[['Stopp-Licht','stern','#ff8fb1',stopLight],['Hau den Rissling','zahnrad','#56c6b6',whack],['Kapsel-Memory','pilz','#c6a9ff',memory]];const cabs=[];
    GAMES.forEach(([t,sy,col,fn],i)=>{const z=-2.6+i*1.6;const q=cabinet(M,col,t,sy);q.position.set(-W/2+.6,0,z);q.rotation.y=PI/2;sc.add(q);addOutlines(q);cabs.push(q);Cl.push({x0:-W/2,x1:-W/2+1.1,z0:z-.55,z1:z+.55});A.push({x:-W/2+1.7,z,r:.8,label:t+' spielen',act:fn})});
    kp('claw-machine',-W/2+1.3,-D/2+.95,0,2.3);Cl.push({x0:-W/2,x1:-W/2+2.4,z0:-D/2,z1:-D/2+1.8});A.push({x:-W/2+1.3,z:-D/2+2.3,r:1,label:'Greifautomat',act:claw});
    kp('pinball',W/2-1.3,-D/2+1,0,2.3);kp('vending-machine',W/2-.75,-.6,-PI/2,2.3);Cl.push({x0:W/2-2.1,x1:W/2,z0:-D/2,z1:-D/2+1.9},{x0:W/2-1.4,x1:W/2,z0:-1.2,z1:0});
    /* Preis-Theke mit Tilly */const th=kp('cash-register',W/2-1.8,2.6,PI,2.1);if(!th){const k=grp(sc,[W/2-1.8,0,2.6]);B(k,2,1.0,.7,.06,Wd(M,'#8A5A44'),[0,.5,0]);addOutlines(k)}kp('prizes',W/2-1.8,3.9,PI,2.1);
    const sg=ctex('arkade-theke',256,64,(x,w,h)=>{x.fillStyle='#3B3450';x.beginPath();x.roundRect(0,0,w,h,16);x.fill();x.fillStyle='#FFE38A';x.font='bold 30px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText('PREISE',w/2,44)});
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.28),new THREE.MeshBasicMaterial({map:sg,transparent:true}));sm.position.set(W/2-1.8,.55,2.02);sm.userData.noOutline=true;sc.add(sm);Cl.push({x0:W/2-3,x1:W/2,z0:2,z1:D/2});
    try{const md=buildCreature(tilly(),{q:HIGH?.65:.45,noShadow:!HIGH,blob:false,merge:true});md.scale.setScalar(CS);md.position.set(W/2-1.8,0,3.3);md.rotation.y=PI;sc.add(md);sc.userData.madame=md}catch(e){console.warn('Tilly',e)}
    A.push({x:W/2-1.8,z:1.5,r:1.1,label:'Preis-Theke (Tickets tauschen)',act:counter});
    INTERIOR.lamp(sc,'steh',-W/2+.6,0,3.4,{col:'#C8F0FF',i:1,d:7});INTERIOR.lamp(sc,'steh',1,0,-3.9,{col:'#FFC8E8',i:1,d:7});
    sc.userData.casino={machines:cabs};return{W,D,camD:12}}
  function frame(dt,t){const sc=INTERIOR.scene;if(!sc)return;const u=sc.userData.casino;if(u)u.machines.forEach((m,i)=>(m.userData.bulbs||[]).forEach((b,k)=>{b.visible=((Math.floor(t*4)+k+i)%3)!==0}));
    const md=sc.userData.madame;if(md&&md.userData.tick)md.userData.tick(t,false,UI.typing?.4:0)}
  function enter(){INTERIOR.enter('casino');const s=st();setTimeout(()=>{if(!s.greeted){s.greeted=true;persist();
      say(['Willkommen in der Spielhalle! Ich bin Tilly.','Jedes Spiel kostet '+PRICE+' Taler. Wer geschickt spielt, bekommt Tickets.','An meiner Theke tauschst du Tickets gegen Preise. Hier gewinnt nicht das Glück, sondern die Übung!'].concat(s.refund?['Deine alten Jetons habe ich dir übrigens zurückgezahlt: '+s.refund+' Taler.']:[]))}},900)}
  if(typeof INTERIOR!=='undefined')INTERIOR.kinds.casino={bg:'#1E2238',music:'museum',build,frame};
  return{enter,SYM,st,PRIZES,_games:{stopLight,whack,memory,claw,counter}}
})();
