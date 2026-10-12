/* =====================================================================
   CYBORG-LABOR · kleider2.js · Kleider-Linien für die Themen-Planeten
   Sechzehn Planeten hatten nur vier oder fünf eigene Teile. Jeder bekommt
   drei neue (meist Hut, Hals- oder Gesichtsteil und ein Oberteil), passend
   zum Planeten. Gebaut wie die Planeten-Kleider: (g,M,H,col), Oberteile
   mit H.neck als Halshöhe (clothes.js streckt sie auf den Rumpf).
   ===================================================================== */
(()=>{
  if(typeof CLOTHES==='undefined')return;
  const EN={};const add=(pl,slot,id,de,en,price,col,b)=>{EN[de]=en;if(!CLOTHES.LIST.some(x=>x.id===id))CLOTHES.LIST.push({slot,id,n:de,price,col,b});const w=CLOTHES.PLANET[pl]||(CLOTHES.PLANET[pl]=[]);if(!w.includes(id))w.push(id)};
  const dk=(c,f)=>'#'+new THREE.Color(c).multiplyScalar(f).getHexString();
  const NY=H=>H.neck??(H.top-H.r*2.05);
  /* Bausteine */
  const vest=(q,M,H,col,o)=>{const r=H.r;P(q,G.cy(r*.84,r*.9,r*.9,Q(16),1,true),M.c(col,o),[0,-r*.45,0])};
  const specs=(g,M,H,col,lens,o)=>{o=o||{};const r=H.r;const y=H.faceY+r*.12,z=H.front+r*.04;for(const s of[-1,1]){const q=grp(g,[s*r*.33,y,z]);lens(q,r,s)}
    P(g,G.cy(r*.02,r*.02,r*.18),M.c(o.bridge||col),[0,y+r*.02,z],[0,0,PI/2]);for(const s of[-1,1])P(g,G.cy(r*.02,r*.02,r*.85),M.c(o.bridge||col),[s*r*.55,y,z-r*.42],[PI/2,0,0])};
  const ring=(g,M,H,col,o)=>{o=o||{};const r=H.r;const y=NY(H);P(g,G.to(r*.62,r*(o.t||.025)),M.c(col,o.mat),[0,y,0],[PI/2,0,0]);return y};
  /* Anhänger: auf der Brust (H.surf kennt die Rumpftiefe), im Laden auf dem Vorschau-Rumpf */
  const pend=(H,dy)=>{const y=NY(H)-H.r*dy;return[y,H.surf?H.surf(y):H.r*.66]};

  /* ================= Wolkenarchipel ================= */
  add('wolkenarchipel','hat','wolkenhut','Wolken-Hut','Cloud hat',540,'#FFFFFF',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.12,0]);for(let i=0;i<6;i++){const a=i/6*TAU;P(q,G.s(r*.32),M.c(col,{rim:.9,rimColor:'#dfe8ff'}),[Math.cos(a)*r*.42,r*.05,Math.sin(a)*r*.42])}P(q,G.s(r*.42),M.c(col,{rim:.9,rimColor:'#dfe8ff'}),[0,r*.25,0])});
  add('wolkenarchipel','face','regenbogenbrille','Regenbogen-Brille','Rainbow glasses',420,'#FF6F91',(g,M,H,col)=>specs(g,M,H,'#ffffff',(q,r)=>{['#FF5A5A','#FFB03A','#FFE060','#6AD85A','#4AB8FF'].forEach((c,i)=>P(q,G.to(r*(.2-i*.03),r*.018,PI),M.c(c),[0,-r*.06,0]))}));
  add('wolkenarchipel','top','federweste','Feder-Weste','Feather vest',780,'#C8E0FF',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,NY(H),0]);vest(q,M,H,col);for(let k=0;k<3;k++)for(let i=0;i<9;i++){const a=i/9*TAU+k*.35;P(q,G.s(r*.13),M.c(k%2?'#ffffff':dk(col,.92)),[Math.cos(a)*r*.89,-r*(.22+k*.25),Math.sin(a)*r*.89],[0,-a,0],[.35,1,.6])}});

  /* ================= Neon-Arkade ================= */
  add('neonarkade','hat','joystickhut','Joystick-Hut','Joystick hat',560,'#3b3450',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.2,0]);P(q,G.cy(r*.7,r*.75,r*.3,Q(16)),M.c(col),[0,0,0]);P(q,G.cy(r*.06,r*.06,r*.5),M.c('#c8c8d8',{gloss:1}),[0,r*.4,0]);P(q,G.s(r*.18),M.c('#ff3a5a',{gloss:1.2}),[0,r*.68,0]);for(const[x,c]of[[-.35,'#45e0ff'],[.35,'#ffd23f']])P(q,G.cy(r*.08,r*.08,r*.05),M.glow(c,1.4),[x*r,r*.15,r*.5],[PI/2,0,0])});
  add('neonarkade','face','pixelbrille','Pixel-Brille','Pixel glasses',380,'#1a1a24',(g,M,H,col)=>specs(g,M,H,col,(q,r)=>{for(let x=0;x<3;x++)for(let y=0;y<2;y++)P(q,G.bx(r*.12,r*.12,r*.04),M.c(col),[(x-1)*r*.12,(y-.5)*r*.12,0])}));
  add('neonarkade','neck','muenzkette','Spielmarken-Kette','Token necklace',460,'#FFD23F',(g,M,H,col)=>{const y=ring(g,M,H,'#c8c8d8');const r=H.r;const[py,pz]=pend(H,.45);P(g,G.tu([[-r*.3,y,r*.55],[0,py+r*.25,pz],[r*.3,y,r*.55]],r*.015),M.c('#c8c8d8'));P(g,G.cy(r*.28,r*.28,r*.06,Q(18)),M.c(col,{gloss:1.3}),[0,py,pz+r*.03],[PI/2,0,0]);P(g,G.star(r*.13,r*.05,5,r*.03),M.glow('#ff6fd8',1.4),[0,py,pz+r*.07])});

  /* ================= Origami ================= */
  add('origami','neck','papierkragen','Papier-Kragen','Paper collar',380,'#FFFDF4',(g,M,H,col)=>{const r=H.r;const y=NY(H);for(let i=0;i<12;i++){const a=i/12*TAU;P(g,G.co(r*.16,r*.3,3),M.c(i%2?col:'#FFC8E0'),[Math.cos(a)*r*.7,y-r*.05,Math.sin(a)*r*.7],[PI/2,0,-a+PI/2])}});
  add('origami','hat','fuchsohren','Falt-Fuchsohren','Folded fox ears',360,'#FF9A45',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*.98,r*.05,PI),M.c(col),[0,H.top-r*.95,0]);for(const s of[-1,1])P(g,G.co(r*.24,r*.5,3),M.c(col),[s*r*.45,H.top+r*.05,0],[0,0,-s*.35])});
  add('origami','top','faltweste','Falt-Weste','Folded vest',720,'#45A0FF',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,NY(H),0]);P(q,G.cy(r*.84,r*.92,r*.9,8,1,true),M.c(col),[0,-r*.45,0]);for(const s of[-1,1])P(q,G.co(r*.28,r*.55,3),M.c('#FFFDF4'),[s*r*.22,-r*.25,r*.78],[PI,0,s*.2],[1,1,.2])});

  /* ================= Plüsch ================= */
  add('pluesch','hat','baerenohren','Bären-Ohren','Bear ears',340,'#C8905A',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*.98,r*.05,PI),M.c(dk(col,.8)),[0,H.top-r*.95,0]);for(const s of[-1,1]){P(g,G.s(r*.24),M.c(col,{rim:.8}),[s*r*.62,H.top-r*.12,0]);P(g,G.s(r*.13),M.c('#F4D8B0'),[s*r*.62,H.top-r*.12,r*.12],null,[1,1,.5])}});
  add('pluesch','neck','knopfkette','Knopf-Kette','Button necklace',300,'#FF8FB8',(g,M,H,col)=>{const r=H.r;const y=NY(H);const cs=[col,'#9AB8FF','#FFD23F','#A6EBC3'];for(let i=0;i<14;i++){const a=i/14*TAU;P(g,G.cy(r*.07,r*.07,r*.03,Q(12)),M.c(cs[i%4]),[Math.cos(a)*r*.64,y-Math.max(0,Math.sin(a))*r*.12,Math.sin(a)*r*.64],[PI/2,0,0])}});
  add('pluesch','top','kuschelpulli','Kuschel-Pulli','Cuddle sweater',760,'#FFB8D0',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,NY(H),0]);vest(q,M,H,col,{rim:.9,rimColor:'#ffffff'});P(q,G.to(r*.86,r*.05),M.c('#FFFDF7',{rim:.8}),[0,-r*.02,0],[PI/2,0,0]);P(q,G.to(r*.9,r*.05),M.c('#FFFDF7',{rim:.8}),[0,-r*.88,0],[PI/2,0,0]);const h=grp(q,[0,-r*.45,r*.9]);for(const s of[-1,1])P(h,G.s(r*.1),M.c('#FF6FA5'),[s*r*.07,0,0]);P(h,G.co(r*.12,r*.14,Q(10)),M.c('#FF6FA5'),[0,-r*.09,0],[PI,0,0])});

  /* ================= Bernstein ================= */
  add('bernstein','hat','harzdiadem','Harz-Diadem','Resin tiara',820,'#FFB030',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*.98,r*.04,PI),M.c('#C8955A',{gloss:1}),[0,H.top-r*.85,0]);P(g,G.s(r*.16),M.c(col,{gloss:1.4,opacity:.9}),[0,H.top-r*.05,r*.28],null,[1,1.3,.7]);for(const s of[-1,1])P(g,G.s(r*.09),M.c(col,{gloss:1.4,opacity:.9}),[s*r*.38,H.top-r*.25,r*.18])});
  add('bernstein','neck','bernsteinkette','Bernstein-Kette','Amber necklace',640,'#FFB030',(g,M,H,col)=>{const y=ring(g,M,H,'#8A5E42',{t:.02});const r=H.r;const[py,pz]=pend(H,.45);P(g,G.tu([[-r*.3,y,r*.55],[0,py+r*.25,pz],[r*.3,y,r*.55]],r*.015),M.c('#8A5E42'));P(g,G.s(r*.24),M.c(col,{gloss:1.4,opacity:.88}),[0,py,pz+r*.08],null,[1,1.3,.7]);P(g,G.s(r*.06),M.c('#3a2a24'),[0,py,pz+r*.2])});
  add('bernstein','face','lupenbrille','Lupen-Brille','Magnifier glasses',520,'#C8955A',(g,M,H,col)=>specs(g,M,H,col,(q,r,s)=>{P(q,G.to(r*(s>0?.2:.14),r*.03),M.c(col,{gloss:1.2}),[0,0,0]);P(q,G.cy(r*(s>0?.19:.13),r*(s>0?.19:.13),r*.01,Q(16)),M.c('#e8f8ff',{opacity:.45}),[0,0,0],[PI/2,0,0])}));

  /* ================= Dino-Fabrik ================= */
  add('dinofabrik','hat','dinokapuze','Dino-Kapuze','Dino hood',720,'#7FD34A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.55,-r*.05]);P(q,G.hs(r*1.02),M.c(col),[0,0,0],null,[1,1.05,1]);for(let i=0;i<5;i++)P(q,G.co(r*.1,r*.22,4),M.c('#FFD23F'),[0,r*(1.02-i*.02)*Math.cos(i*.35),-r*1.02*Math.sin(i*.35)],[-i*.35,0,0]);for(const s of[-1,1])P(q,G.s(r*.1),M.c('#ffffff'),[s*r*.3,r*.78,r*.55])});
  add('dinofabrik','neck','zahnradkette','Zahnrad-Kette','Cog necklace',420,'#C8C8D8',(g,M,H,col)=>{const y=ring(g,M,H,'#5a6a7a');const r=H.r;const[py,pz]=pend(H,.45);P(g,G.tu([[-r*.3,y,r*.55],[0,py+r*.25,pz],[r*.3,y,r*.55]],r*.015),M.c('#5a6a7a'));const q=grp(g,[0,py,pz+r*.04]);P(q,G.cy(r*.24,r*.24,r*.08,Q(16)),M.c(col,{gloss:1.2}),[0,0,0],[PI/2,0,0]);P(q,G.cy(r*.08,r*.08,r*.09,Q(12)),M.c('#5a6a7a'),[0,0,0],[PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*TAU;P(q,G.bx(r*.1,r*.1,r*.08),M.c(col,{gloss:1.2}),[Math.cos(a)*r*.27,Math.sin(a)*r*.27,0],[0,0,a])}});
  add('dinofabrik','top','stachelpulli','Stachel-Pulli','Spiky sweater',780,'#5FB86A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,NY(H),0]);vest(q,M,H,col);for(let i=0;i<5;i++)P(q,G.co(r*.11,r*.24,4),M.c('#FFD23F'),[0,-r*(.12+i*.17),-r*.95],[-PI/2,0,0]);P(q,G.s(r*.3),M.c('#C8F0A8'),[0,-r*.5,r*.82],null,[1,1.2,.3])});

  /* ================= Kaufhaus ================= */
  add('kaufhaus','neck','krawatte','Streifen-Krawatte','Striped tie',360,'#45A0FF',(g,M,H,col)=>{const r=H.r;const y=NY(H);const q=grp(g,[0,y-r*.05,(H.surf?H.surf(y-r*.3):r*.64)+r*.02]);q.scale.setScalar(2.8);P(q,G.bx(r*.14,r*.1,r*.06,r*.02),M.c(col),[0,0,0]);for(let i=0;i<4;i++)P(q,G.bx(r*(.16+i*.02),r*.12,r*.03,r*.01),M.c(i%2?'#ffffff':col),[0,-r*(.12+i*.12),r*.02+i*r*.008],[-.12,0,0]);P(q,G.co(r*.12,r*.12,4),M.c(col),[0,-r*.62,r*.06],[PI,PI/4,0])});
  add('kaufhaus','top','verkaufsschuerze','Verkaufs-Schürze','Shop apron',560,'#FF6FA5',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,NY(H),0]);P(q,G.bx(r*.85,r*1,r*.04,r*.06),M.c(col),[0,-r*.55,r*.9]);for(const s of[-1,1])P(q,G.bx(r*.08,r*.6,r*.03,r*.01),M.c(col),[s*r*.38,-r*.15,r*.6],[-.6,0,0]);P(q,G.bx(r*.6,r*.25,r*.03,r*.03),M.c(dk(col,.85)),[0,-r*.7,r*.92]);P(q,G.bx(r*.3,r*.16,r*.02,r*.02),M.c('#ffffff'),[r*.28,-r*.25,r*.92])});
  add('kaufhaus','face','sternbrille','Stern-Brille','Star glasses',380,'#FFD23F',(g,M,H,col)=>specs(g,M,H,col,(q,r)=>P(q,G.star(r*.2,r*.1,5,r*.04),M.c(col,{gloss:1}),[0,0,0])));

  /* ================= Funkturm ================= */
  add('funkturm','hat','kopfhoerer','Kopfhörer','Headphones',620,'#E8402A',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*1.02,r*.06,PI),M.c('#3b3450'),[0,H.top-r*1,0]);for(const s of[-1,1]){P(g,G.cy(r*.24,r*.24,r*.16,Q(16)),M.c(col,{gloss:.8}),[s*r*1.02,H.cy,0],[0,0,PI/2]);P(g,G.cy(r*.18,r*.18,r*.02,Q(16)),M.c('#3b3450'),[s*r*1.11,H.cy,0],[0,0,PI/2])}});
  add('funkturm','neck','kabelschal','Kabel-Schal','Cable scarf',340,'#FFD23F',(g,M,H,col)=>{const r=H.r;const y=NY(H);for(let i=0;i<3;i++)P(g,G.to(r*(.6+i*.04),r*.035),M.c(['#E8402A',col,'#45A0FF'][i]),[0,y-i*r*.05,0],[PI/2,0,0]);const[py,pz]=pend(H,.45);P(g,G.tu([[r*.2,y-r*.05,r*.6],[r*.26,py+r*.15,pz+r*.03],[r*.2,py+r*.08,pz+r*.03]],r*.03),M.c(col));P(g,G.bx(r*.16,r*.22,r*.1,r*.03),M.c('#3b3450'),[r*.2,py,pz+r*.05]);for(const s of[-1,1])P(g,G.bx(r*.03,r*.08,r*.03),M.c('#e6ecf5',{gloss:1}),[r*.2+s*r*.04,py-r*.14,pz+r*.05])});
  add('funkturm','face','signalbrille','Signal-Brille','Signal goggles',460,'#7FD34A',(g,M,H,col)=>specs(g,M,H,'#3b3450',(q,r,s)=>{P(q,G.cy(r*.17,r*.17,r*.08,Q(16)),M.c('#3b3450'),[0,0,0],[PI/2,0,0]);P(q,G.cy(r*.13,r*.13,r*.02,Q(16)),M.glow(s>0?col:'#FF5A5A',1.2),[0,0,r*.04],[PI/2,0,0])}));

  /* ================= Magnetbahn ================= */
  add('magnetbahn','hat','schaffnermuetze','Schaffner-Mütze','Conductor cap',520,'#2A3A6A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.42,0]);P(q,G.cy(r*.98,r*.92,r*.34,Q(20)),M.c(col),[0,r*.08,0]);P(q,G.cy(r*.55,r*.55,r*.03,Q(16)),M.c('#1a1a24',{gloss:1}),[0,-r*.05,r*.75],null,[1,1,.6]);P(q,G.to(r*.94,r*.03),M.c('#FFD23F',{gloss:1.2}),[0,r*.0,0],[PI/2,0,0]);P(q,G.bx(r*.2,r*.12,r*.03,r*.01),M.c('#FF4A5A'),[0,r*.14,r*.97])});
  add('magnetbahn','neck','fahrkartenband','Fahrkarten-Band','Ticket lanyard',300,'#FF4A5A',(g,M,H,col)=>{const y=ring(g,M,H,col,{t:.03});const r=H.r;const[py,pz]=pend(H,.6);P(g,G.tu([[-r*.3,y,r*.55],[0,py+r*.25,pz],[r*.3,y,r*.55]],r*.02),M.c(col));P(g,G.bx(r*.6,r*.38,r*.04,r*.03),M.c('#FFFDF4'),[0,py,pz+r*.03]);P(g,G.bx(r*.42,r*.07,r*.01,r*.005),M.c('#2A3A6A'),[0,py+r*.06,pz+r*.06]);P(g,G.bx(r*.3,r*.05,r*.01,r*.005),M.c('#FF4A5A'),[0,py-r*.06,pz+r*.06])});
  add('magnetbahn','face','hufeisenbrille','Hufeisen-Brille','Horseshoe glasses',420,'#FF4A5A',(g,M,H,col)=>specs(g,M,H,'#c8c8d8',(q,r)=>{P(q,G.to(r*.16,r*.045,PI*1.4),M.c(col,{gloss:1}),[0,0,0],[0,0,-PI*.2]);for(const s of[-1,1])P(q,G.bx(r*.09,r*.06,r*.08),M.c('#e6ecf5',{gloss:1}),[s*r*.15,-r*.12,0])}));

  /* ================= Rechenzentrum ================= */
  add('rechenzentrum','hat','headset','Headset','Headset',560,'#3B3450',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*1.02,r*.05,PI),M.c(col),[0,H.top-r*1,0]);for(const s of[-1,1])P(g,G.cy(r*.2,r*.2,r*.12,Q(16)),M.c(col),[s*r*1.02,H.cy,0],[0,0,PI/2]);P(g,G.tu([[r*1.05,H.cy-r*.1,r*.05],[r*.9,H.cy-r*.35,r*.5],[r*.4,H.cy-r*.42,r*.85]],r*.025),M.c(col));P(g,G.s(r*.06),M.glow('#7FD34A',1.4),[r*.4,H.cy-r*.42,r*.86])});
  add('rechenzentrum','neck','ausweisband','Ausweis-Band','ID badge lanyard',280,'#45A0FF',(g,M,H,col)=>{const y=ring(g,M,H,col,{t:.03});const r=H.r;const[py,pz]=pend(H,.7);P(g,G.tu([[-r*.3,y,r*.55],[0,py+r*.32,pz],[r*.3,y,r*.55]],r*.02),M.c(col));P(g,G.bx(r*.48,r*.62,r*.04,r*.03),M.c('#FFFFFF'),[0,py,pz+r*.03]);P(g,G.bx(r*.24,r*.24,r*.01,r*.01),M.c('#9AB8FF'),[0,py+r*.1,pz+r*.06]);P(g,G.bx(r*.36,r*.05,r*.01,r*.005),M.c('#3b3450'),[0,py-r*.18,pz+r*.06])});
  add('rechenzentrum','face','datenvisier','Daten-Visier','Data visor',640,'#45E0FF',(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.12;P(g,G.cy(r*1.0,r*1.0,r*.22,Q(24),1,true,-PI*.38,PI*.76),M.c(col,{opacity:.55,gloss:1.4}),[0,y,0]);for(let i=0;i<3;i++)P(g,G.bx(r*.3,r*.02,r*.01),M.glow('#ffffff',1.3),[-r*.15+i*r*.12,y+r*.04-i*r*.05,r*1.0])});

  /* ================= Tiefsee ================= */
  add('tiefsee','hat','taucherhelm','Taucher-Glocke','Diving bell helmet',980,'#C89A40',(g,M,H,col)=>{const r=H.r;P(g,G.s(r*1.18),M.c('#C8E8FF',{opacity:.3,gloss:1.4}),[0,H.cy,0]);P(g,G.to(r*.9,r*.1),M.c(col,{gloss:1.2}),[0,H.cy-r*.85,0],[PI/2,0,0]);P(g,G.cy(r*.08,r*.08,r*.2),M.c(col,{gloss:1.2}),[0,H.cy+r*1.2,0]);for(let i=0;i<3;i++)P(g,G.s(r*.06),M.c('#ffffff',{opacity:.7}),[r*(.3+i*.12),H.cy+r*(1.3+i*.2),r*.2])});
  add('tiefsee','neck','perlmuttkette','Perlmutt-Kette','Mother-of-pearl necklace',580,'#FFF0F4',(g,M,H,col)=>{const r=H.r;const y=NY(H);for(let i=0;i<16;i++){const a=i/16*TAU;P(g,G.s(r*.06),M.c(col,{gloss:1.6}),[Math.cos(a)*r*.64,y-Math.max(0,Math.sin(a))*r*.15,Math.sin(a)*r*.64])}const[py,pz]=pend(H,.3);P(g,G.s(r*.18),M.c('#FFB8D0',{gloss:1}),[0,py,pz+r*.04],null,[1.2,1,.5])});
  add('tiefsee','top','schuppenweste','Schuppen-Weste','Scale vest',820,'#3AB8C8',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,NY(H),0]);vest(q,M,H,col,{gloss:1});for(let k=0;k<4;k++)for(let i=0;i<12;i++){const a=i/12*TAU+(k%2)*.26;P(q,G.s(r*.11),M.c(k%2?dk(col,.85):'#7AE0E8',{gloss:1.2}),[Math.cos(a)*r*.89,-r*(.15+k*.2),Math.sin(a)*r*.89],[0,-a,0],[.25,1,1])}});

  /* ================= Wetterwerk ================= */
  add('wetterwerk','hat','suedwester','Regenhut','Rain hat',420,'#FFD23F',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.3,0]);P(q,G.hs(r*.88),M.c(col,{gloss:1}),[0,0,0],null,[1,.75,1]);P(q,G.cy(r*1.15,r*1.25,r*.05,Q(20)),M.c(col,{gloss:1}),[0,-r*.02,-r*.12],[-.15,0,0])});
  add('wetterwerk','face','schneeflockenbrille','Schneeflocken-Brille','Snowflake glasses',400,'#9AD8FF',(g,M,H,col)=>specs(g,M,H,'#ffffff',(q,r)=>{for(let i=0;i<3;i++)P(q,G.bx(r*.36,r*.04,r*.03),M.c(col),[0,0,0],[0,0,i*PI/3]);P(q,G.s(r*.06),M.c('#ffffff'),[0,0,r*.02])}));
  add('wetterwerk','neck','windschal','Wind-Schal','Wind scarf',360,'#A6EBC3',(g,M,H,col)=>{const r=H.r;const y=NY(H);P(g,G.to(r*.64,r*.12),M.c(col),[0,y,0],[PI/2,0,0]);for(let i=0;i<3;i++)P(g,G.bx(r*.18,r*.5,r*.04,r*.04),M.c(i%2?'#ffffff':col),[-r*.3-i*r*.22,y-r*.15+i*r*.05,-r*.45],[0,.4,1.2+i*.1])});

  /* ================= Nachtmarkt ================= */
  add('nachtmarkt','hat','laternenhut','Laternen-Hut','Lantern hat',620,'#FF5A3A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,H.top-r*.3,0]);P(q,G.cy(r*.98,r*.98,r*.05,Q(20)),M.c('#2a2224'),[0,0,0]);P(q,G.cy(r*.7,r*.8,r*.2,Q(20)),M.c('#2a2224'),[0,r*.1,0]);P(q,G.s(r*.4),M.c(col,{opacity:.9}),[0,r*.52,0],null,[1,.9,1]);P(q,G.s(r*.15),M.glow('#ffd88a',1.6),[0,r*.52,0]);for(const y of[.22,.86])P(q,G.cy(r*.22,r*.22,r*.06,Q(12)),M.c('#2a2224'),[0,r*y,0])});
  add('nachtmarkt','neck','mondkette','Mondsichel-Kette','Crescent moon necklace',480,'#FFE88A',(g,M,H,col)=>{const y=ring(g,M,H,'#c8c8e8',{t:.018});const r=H.r;const[py,pz]=pend(H,.45);P(g,G.tu([[-r*.3,y,r*.55],[0,py+r*.25,pz],[r*.3,y,r*.55]],r*.012),M.c('#c8c8e8'));P(g,G.to(r*.2,r*.07,PI*1.3),M.c(col,{gloss:1.2}),[0,py,pz+r*.07],[0,0,PI*.85]);P(g,G.star(r*.09,r*.035,5,r*.02),M.glow(col,1.4),[r*.18,py+r*.18,pz+r*.07])});
  add('nachtmarkt','face','sternmaske','Sternen-Maske','Star mask',440,'#3A3A8A',(g,M,H,col)=>{const r=H.r;const y=H.faceY+r*.12;P(g,G.cy(r*1.0,r*1.0,r*.24,Q(24),1,true,-PI*.32,PI*.64),M.dbl(col),[0,y,0]);for(const s of[-1,1])P(g,G.star(r*.07,r*.03,5,r*.015),M.glow('#FFE86A',1.3),[s*r*.55,y+r*.08,r*.85])});

  /* ================= Bauklotz ================= */
  add('bauklotz','hat','klotzkrone','Klötzchen-Krone','Block crown',560,'#FF5A5A',(g,M,H,col)=>{const r=H.r;const cs=[col,'#45A0FF','#FFD23F','#7FD34A'];for(let i=0;i<8;i++){const a=i/8*TAU;const q=grp(g,[Math.cos(a)*r*.55,H.top-r*.26,Math.sin(a)*r*.55],[0,-a,0]);P(q,G.bx(r*.24,r*(i%2?.3:.42),r*.24,r*.03),M.c(cs[i%4]),[0,r*(i%2?.15:.21),0]);P(q,G.cy(r*.06,r*.06,r*.05,Q(10)),M.c(cs[i%4]),[0,r*(i%2?.32:.44),0])}});
  add('bauklotz','neck','steckkette','Steckperlen-Kette','Snap-bead necklace',320,'#7FD34A',(g,M,H,col)=>{const r=H.r;const y=NY(H);const cs=[col,'#FF5A5A','#45A0FF','#FFD23F'];for(let i=0;i<12;i++){const a=i/12*TAU;P(g,G.bx(r*.12,r*.12,r*.12,r*.02),M.c(cs[i%4]),[Math.cos(a)*r*.66,y-Math.max(0,Math.sin(a))*r*.1,Math.sin(a)*r*.66],[0,-a,0])}});
  add('bauklotz','face','eckbrille','Eck-Brille','Square glasses',360,'#45A0FF',(g,M,H,col)=>specs(g,M,H,col,(q,r)=>{for(const[x,y,w,h]of[[0,r*.15,.36,.06],[0,-r*.15,.36,.06],[-r*.15,0,.06,.36],[r*.15,0,.06,.36]])P(q,G.bx(r*w,r*h,r*.05),M.c(col),[x,y,0]);P(q,G.cy(r*.04,r*.04,r*.03,Q(8)),M.c('#FFD23F'),[r*.15,r*.18,r*.03],[PI/2,0,0])}));

  /* ================= Bildschirmschoner ================= */
  add('schoner','hat','blasenhut','Seifenblasen-Hut','Bubble hat',420,'#C8E8FF',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*.98,r*.04,PI),M.c('#8a8aa8'),[0,H.top-r*.95,0]);for(const[x,y,s]of[[0,.25,.32],[-.4,.1,.2],[.35,.15,.22],[.1,.6,.16]])P(g,G.s(r*s),M.c(col,{opacity:.4,gloss:1.6}),[x*r,H.top+y*r,0])});
  add('schoner','top','sternfeldumhang','Sternfeld-Umhang','Starfield cape',760,'#1A1A3A',(g,M,H,col)=>{const r=H.r;const q=grp(g,[0,NY(H),0]);P(q,G.cy(r*.75,r*1.05,r*.95,Q(16),1,true),M.c(col),[0,-r*.47,0]);for(let i=0;i<14;i++){const a=i*2.4,y=-r*(.15+(i%5)*.16);P(q,G.s(r*.03),M.glow('#ffffff',1.6),[Math.cos(a)*r*(.82+(-y/r)*.24),y,Math.sin(a)*r*(.82+(-y/r)*.24)])}});
  add('schoner','face','pfeilbrille','Pfeil-Brille','Arrow glasses',340,'#FFFFFF',(g,M,H,col)=>specs(g,M,H,'#1a1a24',(q,r,s)=>{const sh=new THREE.Shape();sh.moveTo(0,r*.18);sh.lineTo(-r*.14,-r*.06);sh.lineTo(-r*.04,-r*.04);sh.lineTo(-r*.06,-r*.18);sh.lineTo(r*.04,-r*.16);sh.lineTo(r*.04,-r*.04);sh.lineTo(r*.14,-r*.06);sh.lineTo(0,r*.18);P(q,new THREE.ExtrudeGeometry(sh,{depth:r*.04,bevelEnabled:false}),M.c(col),[0,0,0],[0,0,s*.4])}));

  /* ================= Honigwabe ================= */
  add('honigwabe','hat','bienenfuehler','Bienen-Fühler','Bee antennae',300,'#3B3450',(g,M,H,col)=>{const r=H.r;P(g,G.to(r*.98,r*.05,PI),M.c(col),[0,H.top-r*.95,0]);for(const s of[-1,1]){P(g,G.tu([[s*r*.3,H.top-r*.1,0],[s*r*.4,H.top+r*.3,r*.05],[s*r*.5,H.top+r*.5,r*.15]],r*.03),M.c(col));P(g,G.s(r*.1),M.c('#FFD23F',{gloss:1}),[s*r*.5,H.top+r*.5,r*.15])}});
  add('honigwabe','neck','wabenkette','Waben-Kette','Honeycomb necklace',420,'#FFB030',(g,M,H,col)=>{const r=H.r;const y=NY(H);for(let i=0;i<12;i++){const a=i/12*TAU;P(g,G.cy(r*.08,r*.08,r*.06,6),M.c(i%2?col:'#FFD890',{gloss:1}),[Math.cos(a)*r*.65,y-Math.max(0,Math.sin(a))*r*.12,Math.sin(a)*r*.65],[PI/2,0,0])}});
  add('honigwabe','face','wabenbrille','Waben-Brille','Honeycomb glasses',380,'#FFB030',(g,M,H,col)=>specs(g,M,H,col,(q,r)=>{P(q,G.cy(r*.19,r*.19,r*.04,6),M.c(col,{gloss:1}),[0,0,0],[PI/2,0,PI/6]);P(q,G.cy(r*.14,r*.14,r*.05,6),M.c('#FFE8A0',{opacity:.6}),[0,0,0],[PI/2,0,PI/6])}));

  try{if(typeof I18N!=='undefined'&&I18N.extend)I18N.extend('en',EN)}catch(e){}
})();
