/* =====================================================================
   CYBORG-LABOR · jobs.js
   Nebenjobs (Handy-App „Jobs“): kurze Schichten als Mini-Spiele, Lohn
   nach Leistung, Ränge je Job (mehr Erfahrung = besserer Lohn).
   · Jazz-Bar: Getränke servieren     · Gärtnerei: Pflanzen giessen
   · Laden-Lager: Kisten sortieren    · Post: Briefe im Dorf austragen
   Höchstens 4 Schichten pro Spieltag – Geld bleibt etwas Besonderes.
   ===================================================================== */
const JOBS=(()=>{
  const DAYMAX=4;
  const RANKS=['Aushilfe','Kolleg:in','Profi','Meister:in','Legende'];
  const J=[
    {id:'bar',n:'Kellner:in in der Jazz-Bar',ic:'note',col:'#8E6BD1',base:30,per:8,d:'Gäste bestellen Kakao, Limo oder Tee. Tippe das richtige Getränk, bevor sie ungeduldig werden.'},
    {id:'garten',n:'Gärtner:in',ic:'leaf',col:'#6FBF7A',base:30,per:7,d:'Durstige Pflanzen lassen die Köpfe hängen. Tippe sie an, bevor sie welken.'},
    {id:'lager',n:'Lagerist:in im Laden',ic:'bag',col:'#FFB27A',base:30,per:6,d:'Kisten kommen an. Tippe das Regal in der passenden Farbe.'},
    {id:'post',n:'Postbot:in',ic:'chat',col:'#7FB2E0',base:0,per:45,d:'Bring drei Briefe zu den Häusern im Dorf. Der Pfeil oben zeigt den Weg.'}];
  const S=()=>{const s=SAVE.jobs=SAVE.jobs||{xp:{},day:-1,shifts:0,earned:0};const d=typeof marketDay==='function'?marketDay():0;if(s.day!==d){s.day=d;s.shifts=0}return s};
  const lvl=id=>Math.min(RANKS.length-1,Math.floor((S().xp[id]||0)/5));
  const mult=id=>1+lvl(id)*.12;
  function pay(job,score,extra){const s=S();const t=Math.round((job.base+job.per*score+(extra||0))*mult(job.id));if(t>0)money(t);s.xp[job.id]=(s.xp[job.id]||0)+1;s.earned+=t;SAVE.stats.shifts=(SAVE.stats.shifts||0)+1;persist();return t}

  /* ---------- App ---------- */
  function app(){const s=S();const w=UI.win('Jobs',{size:'wide'});w.body.append(el('p',null,'Heute noch '+Math.max(0,DAYMAX-s.shifts)+' von '+DAYMAX+' Schichten. Mehr Erfahrung bringt einen höheren Rang und mehr Lohn.'));const gr=el('div','grid');
    for(const job of J){const c=el('button','card');c.type='button';const i=el('b');i.innerHTML=ICON(job.ic);i.style.cssText='display:grid;place-items:center;width:56px;height:56px;margin:4px auto;border-radius:18px;color:#fff;background:'+job.col;
      const L=lvl(job.id);c.append(i,el('span',null,job.n),el('span','sub',RANKS[L]+' · Lohn x'+mult(job.id).toFixed(2)),el('span','sub',job.d));c.onclick=()=>{if(S().shifts>=DAYMAX){SND.play('error');UI.toast('Für heute hast du genug gearbeitet. Morgen gibt es neue Schichten!',3000);return}
        if(job.id==='post'&&GAME.mode!=='outdoor'){UI.toast('Die Post trägst du draussen im Dorf aus.');return}if(post){UI.toast('Du trägst gerade schon Post aus.');return}w.close();S().shifts++;persist();start(job)};gr.append(c)}w.body.append(gr)}
  function start(job){if(job.id==='post')return startPost(job);game(job,{bar,garten,lager}[job.id])}

  /* ---------- Rahmen für Mini-Spiele ---------- */
  function game(job,logic){const w=UI.win(job.n,{size:'wide'});const cv=document.createElement('canvas');cv.width=520;cv.height=320;cv.style.cssText='display:block;margin:0 auto;width:min(100%,520px);border-radius:18px;touch-action:none;cursor:pointer';
    const info=el('p',null,job.d);w.body.append(info,cv);const x=cv.getContext('2d');const DUR=40;let t=0,last=performance.now(),score=0,miss=0,over=false;const L=logic(x);
    const hit=(e)=>{const b=cv.getBoundingClientRect();return[(e.clientX-b.left)*cv.width/b.width,(e.clientY-b.top)*cv.height/b.height]};
    cv.onpointerdown=e=>{if(over)return;const r=L.tap(...hit(e),t);if(r>0){score+=r;SND.play('pickup',{rate:1+Math.min(.6,score*.02)})}else if(r<0){miss++;SND.play('soft',{rate:.6})}};
    function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!over){t+=dt;const lost=L.step(dt,t)||0;if(lost){miss+=lost;SND.play('soft',{rate:.5})}}
      x.clearRect(0,0,cv.width,cv.height);L.draw(t);x.fillStyle='rgba(59,52,80,.85)';x.beginPath();x.roundRect(10,10,150,34,12);x.fill();x.fillStyle='#FFFDF7';x.font='bold 18px "Nunito","Trebuchet MS",sans-serif';x.textAlign='left';x.fillText('Punkte '+score,22,33);
      x.fillStyle='rgba(59,52,80,.85)';x.beginPath();x.roundRect(cv.width-160,10,150,34,12);x.fill();x.fillStyle='#FFFDF7';x.fillText('Zeit '+Math.max(0,Math.ceil(DUR-t)),cv.width-146,33);
      if(!over&&t>=DUR){over=true;const got=pay(job,score);SND.jingle('j_success');info.textContent='Feierabend! '+score+' Punkte, '+miss+' Patzer. Lohn: '+fmt(got)+' Taler. Rang: '+RANKS[lvl(job.id)]+'.';UI.toast('Lohn: '+fmt(got)+' Taler',2600)}
      if(over){x.fillStyle='rgba(255,253,247,.86)';x.fillRect(0,0,cv.width,cv.height);x.fillStyle='#3B3450';x.textAlign='center';x.font='bold 30px "Nunito","Trebuchet MS",sans-serif';x.fillText('Feierabend!',cv.width/2,cv.height/2-8);x.font='18px "Nunito","Trebuchet MS",sans-serif';x.fillText(score+' Punkte',cv.width/2,cv.height/2+24)}
      if(cv.isConnected)requestAnimationFrame(loop)}
    requestAnimationFrame(loop)}
  const face=(x,cx,cy,r,col,mood)=>{x.fillStyle=col;x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.stroke();x.fillStyle='#3B3450';x.beginPath();x.arc(cx-r*.32,cy-r*.1,r*.1,0,TAU);x.arc(cx+r*.32,cy-r*.1,r*.1,0,TAU);x.fill();
    x.beginPath();x.lineWidth=2.5;if(mood>.4)x.arc(cx,cy+r*.12,r*.3,.2,PI-.2);else{x.moveTo(cx-r*.25,cy+r*.38);x.quadraticCurveTo(cx,cy+r*.18,cx+r*.25,cy+r*.38)}x.stroke();x.fillStyle='rgba(255,143,163,.5)';x.beginPath();x.arc(cx-r*.55,cy+r*.18,r*.14,0,TAU);x.arc(cx+r*.55,cy+r*.18,r*.14,0,TAU);x.fill()};

  /* ---------- Jazz-Bar ---------- */
  const DR=[{id:'kakao',c:'#8A5A44'},{id:'limo',c:'#FFD85A'},{id:'tee',c:'#8FD07A'}];
  function drink(x,id,cx,cy,s){const d=DR.find(q=>q.id===id);x.save();x.translate(cx,cy);x.strokeStyle='#3B3450';x.lineWidth=3;
    if(id==='kakao'){x.fillStyle='#FFFDF7';x.beginPath();x.roundRect(-s*.3,-s*.25,s*.55,s*.55,s*.1);x.fill();x.stroke();x.beginPath();x.arc(s*.3,s*.02,s*.14,-PI/2,PI/2);x.stroke();x.fillStyle=d.c;x.fillRect(-s*.26,-s*.2,s*.47,s*.1);x.fillStyle='#FFFDF7';x.beginPath();x.arc(-s*.1,-s*.35,s*.08,0,TAU);x.arc(s*.05,-s*.4,s*.07,0,TAU);x.fill()}
    else if(id==='limo'){x.fillStyle=d.c;x.beginPath();x.moveTo(-s*.25,-s*.3);x.lineTo(s*.25,-s*.3);x.lineTo(s*.18,s*.35);x.lineTo(-s*.18,s*.35);x.closePath();x.fill();x.stroke();x.strokeStyle='#FF8FB1';x.lineWidth=4;x.beginPath();x.moveTo(s*.05,-s*.2);x.lineTo(s*.2,-s*.55);x.stroke();x.fillStyle='#FFF';x.beginPath();x.arc(-s*.08,0,s*.05,0,TAU);x.arc(s*.06,s*.15,s*.04,0,TAU);x.fill()}
    else{x.fillStyle='#FFFDF7';x.beginPath();x.moveTo(-s*.35,-s*.1);x.quadraticCurveTo(-s*.35,s*.35,0,s*.35);x.quadraticCurveTo(s*.35,s*.35,s*.35,-s*.1);x.closePath();x.fill();x.stroke();x.fillStyle=d.c;x.beginPath();x.ellipse(0,-s*.1,s*.33,s*.07,0,0,TAU);x.fill();x.strokeStyle='#C8C0B0';x.lineWidth=2;x.beginPath();x.moveTo(-s*.1,-s*.2);x.quadraticCurveTo(-s*.2,-s*.4,-s*.05,-s*.55);x.stroke()}
    x.restore()}
  function bar(x){const G=[null,null,null,null];const cols=['#FF8FB1','#8FD0FF','#C6A9FF','#FFD85A','#A6EBC3','#FFB27A'];let next=0;const BTN=DR.map((d,i)=>({d,x:110+i*150,y:258}));
    return{step(dt,t){let lost=0;next-=dt;G.forEach((g,i)=>{if(!g)return;g.p-=dt/7;if(g.p<=0){G[i]=null;lost++}});if(next<=0){const free=G.map((g,i)=>g?-1:i).filter(i=>i>=0);if(free.length){const i=free[Math.floor(Math.random()*free.length)];G[i]={want:DR[Math.floor(Math.random()*3)].id,p:1,col:cols[Math.floor(Math.random()*cols.length)]}}next=Math.max(.8,1.7-t*.02)}return lost},
      tap(px,py){for(const b of BTN){if(Math.hypot(px-b.x,py-b.y)<55){let best=-1,bp=9;G.forEach((g,i)=>{if(g&&g.want===b.d.id&&g.p<bp){bp=g.p;best=i}});if(best<0)return-1;G[best]=null;return 1}}return 0},
      draw(){const bg=x.createLinearGradient(0,0,0,320);bg.addColorStop(0,'#3E2E5A');bg.addColorStop(1,'#6E4A6A');x.fillStyle=bg;x.fillRect(0,0,520,320);x.fillStyle='#8A5A44';x.fillRect(0,190,520,24);
        G.forEach((g,i)=>{const cx=80+i*120,cy=140;if(!g){x.fillStyle='rgba(255,255,255,.08)';x.beginPath();x.arc(cx,cy,30,0,TAU);x.fill();return}face(x,cx,cy,32,g.col,g.p);x.fillStyle='#FFFDF7';x.beginPath();x.roundRect(cx-30,cy-110,60,56,14);x.fill();x.beginPath();x.moveTo(cx-6,cy-54);x.lineTo(cx,cy-44);x.lineTo(cx+6,cy-54);x.fill();drink(x,g.want,cx,cy-82,44);
          x.fillStyle='rgba(0,0,0,.3)';x.fillRect(cx-30,cy+40,60,7);x.fillStyle=g.p>.4?'#8FD07A':'#FF8FB1';x.fillRect(cx-30,cy+40,60*g.p,7)});
        BTN.forEach(b=>{x.fillStyle='#FFF4E0';x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.arc(b.x,b.y,44,0,TAU);x.fill();x.stroke();drink(x,b.d.id,b.x,b.y,60)})}}}
  /* ---------- Gärtnerei ---------- */
  function garten(x){const P=[];for(let r=0;r<3;r++)for(let c=0;c<4;c++)P.push({x:85+c*117,y:95+r*85,s:'ok',t:1+Math.random()*4,g:0});
    return{step(dt){let lost=0;for(const p of P){p.t-=dt;p.g=Math.max(0,p.g-dt);if(p.s==='ok'&&p.t<=0){p.s='durst';p.t=3.4}else if(p.s==='durst'&&p.t<=0){p.s='welk';p.t=2.5;lost++}else if(p.s==='welk'&&p.t<=0){p.s='ok';p.t=2+Math.random()*4}}return lost},
      tap(px,py){for(const p of P){if(Math.abs(px-p.x)<50&&Math.abs(py-p.y)<40){if(p.s==='durst'){p.s='ok';p.t=2+Math.random()*4.5;p.g=.6;return 1}return p.s==='ok'?-1:0}}return 0},
      draw(){x.fillStyle='#E6F6E0';x.fillRect(0,0,520,320);for(const p of P){x.fillStyle='#D98A5E';x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.moveTo(p.x-22,p.y+8);x.lineTo(p.x+22,p.y+8);x.lineTo(p.x+16,p.y+36);x.lineTo(p.x-16,p.y+36);x.closePath();x.fill();x.stroke();
        const droop=p.s==='durst'?.7:p.s==='welk'?1.3:0;const col=p.s==='welk'?'#B8986A':'#6FBF7A';x.strokeStyle=col;x.lineWidth=5;x.beginPath();x.moveTo(p.x,p.y+8);x.quadraticCurveTo(p.x+droop*8,p.y-14,p.x+droop*20,p.y-24+droop*14);x.stroke();
        x.fillStyle=col;for(const s of[-1,1]){x.beginPath();x.ellipse(p.x+s*10+droop*6,p.y-6+droop*6,11,6,s*(.5+droop*.6),0,TAU);x.fill()}if(p.s!=='welk'){x.fillStyle=p.s==='ok'?'#FF8FB1':'#E0A0B0';x.beginPath();x.arc(p.x+droop*20,p.y-26+droop*14,8,0,TAU);x.fill()}
        if(p.s==='durst'){x.fillStyle='#7FC8F0';x.beginPath();x.moveTo(p.x+30,p.y-40);x.quadraticCurveTo(p.x+40,p.y-26,p.x+30,p.y-20);x.quadraticCurveTo(p.x+20,p.y-26,p.x+30,p.y-40);x.fill()}
        if(p.g>0){x.fillStyle='rgba(127,200,240,'+p.g+')';for(let k=0;k<5;k++){x.beginPath();x.arc(p.x-15+k*8,p.y-40+((1-p.g)*40+k*7)%30,3,0,TAU);x.fill()}}}}}}
  /* ---------- Laden-Lager ---------- */
  function lager(x){const C=[{c:'#FF8FB1',n:'rosa'},{c:'#8FD0FF',n:'blau'},{c:'#FFD85A',n:'gelb'}];let box=null,wait=0;const BIN=C.map((c,i)=>({c,x:110+i*150,y:250}));const nb=t=>{box={k:Math.floor(Math.random()*3),t:Math.max(1.3,2.6-t*.03),T:0}};
    return{step(dt,t){if(!box){wait-=dt;if(wait<=0)nb(t);return 0}box.T+=dt;if(box.T>=box.t){box=null;wait=.25;return 1}return 0},
      tap(px,py,t){if(!box)return 0;for(let i=0;i<3;i++){const b=BIN[i];if(Math.abs(px-b.x)<60&&Math.abs(py-b.y)<50){const ok=i===box.k;box=null;wait=.2;return ok?1:-1}}return 0},
      draw(){x.fillStyle='#F4ECE0';x.fillRect(0,0,520,320);x.fillStyle='#C8B8A8';x.fillRect(0,150,520,14);for(let i=0;i<14;i++){x.fillStyle='#A89888';x.fillRect(i*40,152,20,10)}
        if(box){const k=box.T/box.t;const bx=260,by=110;x.fillStyle=C[box.k].c;x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.roundRect(bx-40,by-40,80,70,10);x.fill();x.stroke();x.strokeStyle='rgba(59,52,80,.4)';x.beginPath();x.moveTo(bx-40,by-14);x.lineTo(bx+40,by-14);x.moveTo(bx,by-40);x.lineTo(bx,by-14);x.stroke();
          x.fillStyle='rgba(0,0,0,.2)';x.fillRect(bx-40,by+40,80,6);x.fillStyle=k<.7?'#8FD07A':'#FF8FB1';x.fillRect(bx-40,by+40,80*(1-k),6)}
        BIN.forEach(b=>{x.fillStyle=b.c.c;x.strokeStyle='#3B3450';x.lineWidth=3;x.beginPath();x.roundRect(b.x-58,b.y-44,116,88,12);x.fill();x.stroke();x.fillStyle='#3B3450';x.font='bold 18px "Nunito","Trebuchet MS",sans-serif';x.textAlign='center';x.fillText(b.c.n,b.x,b.y+6)})}}}

  /* ---------- Post (draussen) ---------- */
  let post=null,hud=null;
  function startPost(job){const homes=GAME.G.places.filter(p=>p.build==='residence'&&p.doorP);if(homes.length<3){UI.toast('Hier gibt es zu wenige Häuser.');S().shifts--;return}
    const pool=homes.slice().sort(()=>Math.random()-.5).slice(0,3);post={job,list:pool,i:0,t:0};SND.play('select');UI.toast('Drei Briefe in der Tasche! Folge dem Pfeil oben.',3000);
    hud=el('div','jobhud');hud.innerHTML='<b style="display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#7FB2E0"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3l7 9h-4.5v9h-5v-9H5z" fill="#FFFDF7" stroke="#3B3450" stroke-width="1.6" stroke-linejoin="round"/></svg></b><span></span>';hud.style.cssText='position:absolute;top:66px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:8px 16px;border-radius:22px;background:#FFFDF7;box-shadow:0 4px 0 rgba(59,52,80,.18);font-weight:800;color:#3B3450;z-index:30;pointer-events:none';$('world').append(hud)}
  function tick(dt){if(!post||!GAME.me||GAME.mode!=='outdoor')return;post.t+=dt;const tg=post.list[post.i];const me=GAME.me;const d=GAME.angle(me.p,tg.doorP)*GAME.G.R;
    const nm=tg.whoName||'Haus';
    if(hud){hud.lastChild.textContent='Brief '+(post.i+1)+'/3 an '+nm+' · '+Math.round(d)+' m';const fwd=GAME.camFwd&&GAME.camFwd();if(fwd){const to=GAME.tangentTo(me.p,tg.doorP.clone().sub(me.p));const side=new THREE.Vector3().crossVectors(me.p,fwd);const a=Math.atan2(to.dot(side),to.dot(fwd));hud.firstChild.style.transform='rotate('+(-a)+'rad)'}}
    if(d<2.6){post.i++;SND.play('pickup');GAME.W.fx&&GAME.W.fx(tg.doorP,'stern',6);UI.toast('Brief abgegeben!',1400);if(post.i>=3){const bonus=Math.max(0,Math.round(60-post.t/3));const got=pay(post.job,3,bonus);SND.jingle('j_success');UI.toast('Alle Briefe zugestellt! Lohn: '+fmt(got)+' Taler'+(bonus?' (mit Tempo-Bonus)':''),3200);end()}}}
  function end(){post=null;if(hud){hud.remove();hud=null}}
  return{app,tick,J,RANKS,end,get post(){return post}}
})();
