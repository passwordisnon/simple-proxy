/* =================== Weltraum-Optik: gemalter Himmel, Toon-Planeten, Sonne, Ringe, Asteroiden =================== */
const SPACEFX=(()=>{
  const V=THREE.Vector3;const lin=c=>new THREE.Color(c).convertSRGBToLinear();
  /* kleine 3D-Rauschfunktion für alle Shader */
  const NOISE=`
    float h31(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
      return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}`;
  const ENC='\n#include <encodings_fragment>\n';

  /* ---------- Palette je Planet (von Hand abgestimmt) ---------- */
  const PAL={
    kompost:{deep:'#3A92D0',water:'#5CC6E8',shore:'#F4E3A6',land:'#8FD36B',land2:'#56A95A',high:'#C9A36B',cap:'#FFFFFF',atmo:'#9FD8FF',cloud:.55,sea:.47,capA:.8,freq:2.2},
    schrott:{deep:'#2E8F8A',water:'#6FE3C8',shore:'#D8D0EC',land:'#A99BC6',land2:'#7D6EA6',high:'#5C4F7E',cap:'#EDE6FF',atmo:'#C4B2F2',cloud:.35,sea:.38,capA:.9,freq:3.0,craters:1},
    korallen:{deep:'#2A9AD0',water:'#4FD6E0',shore:'#FFF0C4',land:'#F7DCA2',land2:'#7ED67A',high:'#FF9FA8',cap:'#FFFFFF',atmo:'#8FE3FF',cloud:.6,sea:.53,capA:.95,freq:2.6},
    frost:{deep:'#4A86C8',water:'#8FD0F0',shore:'#F4F8FF',land:'#D8E6FA',land2:'#B4CCEE',high:'#8FB0E0',cap:'#F4F8FF',atmo:'#CFE0FF',cloud:.5,sea:.42,capA:.55,freq:2.4},
    wueste:{deep:'#2E8EAE',water:'#5FD0D8',shore:'#FFE3B0',land:'#F7CB90',land2:'#E8A870',high:'#C9784E',cap:'#FFF3E0',atmo:'#FFD6A8',cloud:.3,sea:.3,capA:.92,freq:2.0,dunes:1},
    pilz:{deep:'#3A8E9A',water:'#7FDCC8',shore:'#E6D4F6',land:'#9482C4',land2:'#C08ED2',high:'#F4B8D8',cap:'#FDE8F6',atmo:'#F4B8D8',cloud:.35,sea:.42,capA:.9,freq:2.8}};
  const pal=pid=>PLANETS[pid]&&PLANETS[pid].space||PT(PAL,pid);

  /* ---------- Gemalter Himmel: Farbverlauf + Nebel ---------- */
  function sky(){const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uT:{value:0},cTop:{value:lin('#3A2F86')},cMid:{value:lin('#5B4AA8')},cBot:{value:lin('#243066')},n1:{value:lin('#E07AB8')},n2:{value:lin('#5FD0D8')},n3:{value:lin('#9A7AE8')},n4:{value:lin('#FFB38A')}},
      vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w*.9999;}',
      fragmentShader:NOISE+`uniform float uT;uniform vec3 cTop,cMid,cBot,n1,n2,n3,n4;varying vec3 vD;
        void main(){vec3 d=normalize(vD);float y=d.y;vec3 c=mix(cBot,cMid,smoothstep(-.6,.05,y));c=mix(c,cTop,smoothstep(.05,.8,y));
          /* Milchstrassen-Band */float band=exp(-pow(y*3.2+sin(d.x*2.3+d.z)*.45,2.));
          float a=fbm(d*2.4+vec3(0.,0.,uT*.003));float b=fbm(d*4.1+vec3(5.,1.,2.));float e=fbm(d*1.3+vec3(9.,3.,1.));float w=fbm(d*8.+a*2.);
          c=mix(c,n3,smoothstep(.45,.75,e)*.45);
          c=mix(c,n1,smoothstep(.42,.78,a)*band*.55);
          c=mix(c,n2,smoothstep(.5,.82,b)*(.25+.75*band)*.4);
          c=mix(c,n4,smoothstep(.62,.9,a*b*1.7)*band*.35);
          c+=vec3(1.,.95,1.)*band*smoothstep(.55,.9,w)*.08;
          c*=.92+.08*smoothstep(.3,.7,w);
          gl_FragColor=vec4(c,1.);${ENC}}`});
    const s=new THREE.Mesh(new THREE.SphereGeometry(1400,64,32),m);s.frustumCulled=false;s.renderOrder=-10;return s}

  /* ---------- Sterne: runde, funkelnde Punkte in verschiedenen Grössen ---------- */
  function stars(n){const g=new THREE.BufferGeometry();const p=[],s=[],c=[],ph=[];const cols=['#FFF6E0','#FFE3B0','#CFE6FF','#FFD0E8','#FFFFFF'];
    for(let i=0;i<n;i++){const v=new V().randomDirection().multiplyScalar(900+Math.random()*300);p.push(v.x,v.y,v.z);const big=Math.random()<.06;s.push(big?3.2+Math.random()*2.5:1+Math.random()*1.8);const cc=new THREE.Color(cols[i%cols.length]);c.push(cc.r,cc.g,cc.b);ph.push(Math.random()*6.28)}
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('sz',new THREE.Float32BufferAttribute(s,1));g.setAttribute('col',new THREE.Float32BufferAttribute(c,3));g.setAttribute('ph',new THREE.Float32BufferAttribute(ph,1));
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uPR:{value:Math.min(2,devicePixelRatio)}},
      vertexShader:'attribute float sz,ph;attribute vec3 col;uniform float uT,uPR;varying vec3 vC;varying float vA;void main(){vC=col;vA=.55+.45*sin(uT*(1.3+ph*.4)+ph*7.);gl_PointSize=sz*uPR*(sz>3.?1.:.9+.25*vA);vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_Position.z=gl_Position.w*.9998;}',
      fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;float r=length(q);float core=smoothstep(.5,.0,r);float cross=max(smoothstep(.07,0.,abs(q.x))*smoothstep(.5,.1,abs(q.y)),smoothstep(.07,0.,abs(q.y))*smoothstep(.5,.1,abs(q.x)));
        float a=(core*core+cross*.6)*vA;if(a<.01)discard;gl_FragColor=vec4(vC*a,a);${ENC}}`});
    const pts=new THREE.Points(g,m);pts.frustumCulled=false;return pts}

  /* ---------- Sonne: brodelnde Oberfläche, Kontur, Korona ---------- */
  function sun(){const g=new THREE.Group();
    const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0},c1:{value:lin('#FFF6C8')},c2:{value:lin('#FFC65A')},c3:{value:lin('#FF9E4A')}},
      vertexShader:'varying vec3 vP,vN,vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
      fragmentShader:NOISE+`uniform float uT;uniform vec3 c1,c2,c3;varying vec3 vP,vN,vV;void main(){float f=fbm(normalize(vP)*3.+vec3(uT*.08,uT*.05,-uT*.06));float g=fbm(normalize(vP)*7.-vec3(uT*.1));
        float k=smoothstep(.25,.75,f*.8+g*.2);float nv=clamp(dot(vN,vV),0.,1.);vec3 c=mix(c3,c2,.55+.45*smoothstep(.25,.6,k));c=mix(c,c1,clamp(smoothstep(.55,.85,k)*.5+pow(nv,2.)*.7,0.,1.));c=mix(c3,c,smoothstep(.0,.3,nv));
        gl_FragColor=vec4(c*1.3,1.);${ENC}}`,toneMapped:false});
    const core=new THREE.Mesh(new THREE.SphereGeometry(8,64,32),m);g.add(core);
    const hull=new THREE.Mesh(new THREE.SphereGeometry(8.35,48,24),new THREE.MeshBasicMaterial({color:'#FF7A3A',side:THREE.BackSide,toneMapped:false}));g.add(hull);
    const glowT=ctex('sunglow2',256,256,(x,w,h)=>{const gr=x.createRadialGradient(128,128,20,128,128,128);gr.addColorStop(0,'rgba(255,236,170,.95)');gr.addColorStop(.3,'rgba(255,196,110,.45)');gr.addColorStop(.6,'rgba(255,140,120,.14)');gr.addColorStop(1,'rgba(200,110,200,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)});
    const rayT=ctex('sunrays',256,256,(x,w,h)=>{x.translate(128,128);for(let i=0;i<14;i++){x.rotate(TAU/14);const gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(255,230,160,.55)');gr.addColorStop(1,'rgba(255,200,140,0)');x.fillStyle=gr;x.beginPath();x.moveTo(-7-(i%2)*4,0);x.lineTo(7+(i%2)*4,0);x.lineTo(0,90+(i%3)*14);x.closePath();x.fill()}});
    const mk=(t,s,o)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:o,toneMapped:false}));sp.scale.setScalar(s);g.add(sp);return sp};
    const glow=mk(glowT,56,1),rays=mk(rayT,44,.7),rays2=mk(rayT,36,.5);
    g.userData.tick=(t)=>{m.uniforms.uT.value=t;rays.material.rotation=t*.05;rays2.material.rotation=-t*.08+.3;const p=1+Math.sin(t*1.3)*.03;glow.scale.setScalar(56*p);rays.scale.setScalar(44*(1+Math.sin(t*.9)*.05))};
    return g}

  /* ---------- Toon-Planet: Kontinente, Meere, Polkappen, Terminator, Atmosphäre ---------- */
  function planet(pid,r,seed){const P=pal(pid);const g=new THREE.Group();const U={uSun:{value:new V()},uT:{value:0},uSeed:{value:seed},
      deep:{value:lin(P.deep)},water:{value:lin(P.water)},shore:{value:lin(P.shore)},land:{value:lin(P.land)},land2:{value:lin(P.land2)},high:{value:lin(P.high)},cap:{value:lin(P.cap)},atmo:{value:lin(P.atmo)},night:{value:lin('#2B2458')},warm:{value:lin('#FF9E7A')},
      uSea:{value:P.sea},uCap:{value:P.capA},uFreq:{value:P.freq},uCr:{value:P.craters?1:0},uDu:{value:P.dunes?1:0}};
    const surf=new THREE.ShaderMaterial({uniforms:U,
      vertexShader:'varying vec3 vP,vN,vW;void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:NOISE+`uniform vec3 uSun,deep,water,shore,land,land2,high,cap,atmo,night,warm;uniform float uSeed,uSea,uCap,uFreq,uCr,uDu,uT;varying vec3 vP,vN,vW;
        float fb4(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.07+vec3(3.1,1.7,5.3);a*=.5;}return s/.9375;}
        void main(){vec3 d=normalize(vP);vec3 q=d*uFreq*.75+uSeed;vec3 wq=q+vec3(fb4(q*1.3),fb4(q*1.3+4.),0.)*.55;float h=fb4(wq);
          float E=.012;vec3 c;float lat=abs(d.y);
          float wet=smoothstep(uSea+E,uSea-E,h);
          vec3 sea=mix(deep,water,smoothstep(uSea-.28,uSea-.1,h)*.7+.3);sea=mix(sea,mix(water,shore,.35),smoothstep(uSea-.035,uSea-.015,h));
          float k=clamp((h-uSea)/(1.-uSea),0.,1.);float f=fb4(q*2.6+9.);
          vec3 ld=mix(land,land2,smoothstep(.5-E*3.,.5+E*3.,f));ld=mix(ld,high,smoothstep(.55,.57,k));ld=mix(shore,ld,smoothstep(.015,.03,k));
          if(uDu>.5){float du=sin(dot(d,vec3(22.,4.,13.))+f*7.);ld=mix(ld,ld*.9,smoothstep(.2,.35,du)*.6);}
          if(uCr>.5){float cr=fb4(q*3.+7.);float ring=smoothstep(.6,.62,cr)*smoothstep(.7,.68,cr);ld=mix(ld,shore,ring*.6);ld=mix(ld,ld*.82,smoothstep(.68,.7,cr));}
          c=mix(ld,sea,wet);
          float capE=uCap+(fb4(q*1.6+3.)-.5)*.34;c=mix(c,cap,smoothstep(capE-E,capE+E,lat));
          vec3 N=normalize(vN);vec3 L=normalize(uSun-vW);float nl=dot(N,L);
          /* Toon: drei weiche Stufen, lavendelfarbene Nachtseite, warmer Terminator */
          float lit=mix(.62,.86,smoothstep(-.16,-.08,nl));lit=mix(lit,1.,smoothstep(.12,.2,nl));
          vec3 col=c*lit;col=mix(col,col*mix(vec3(1.),night*3.2,.6),smoothstep(-.1,-.4,nl)*.6);col+=warm*.16*smoothstep(-.14,-.02,nl)*smoothstep(.2,.04,nl);
          vec3 Vw=normalize(cameraPosition-vW);float fr=pow(1.-clamp(dot(N,Vw),0.,1.),3.);col+=atmo*fr*.5*smoothstep(-.4,.3,nl);
          vec3 H=normalize(L+Vw);col+=vec3(1.)*smoothstep(.972,.982,dot(N,H))*.4*wet;
          gl_FragColor=vec4(col,1.);${ENC}}`});
    const body=new THREE.Mesh(new THREE.SphereGeometry(r,72,40),surf);g.add(body);
    /* Wolken */let cl=null;if(P.cloud>0){const cm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uSun:U.uSun,uT:U.uT,uSeed:U.uSeed,uAmt:{value:P.cloud},night:U.night},
        vertexShader:'varying vec3 vP,vN,vW;void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
        fragmentShader:NOISE+`uniform vec3 uSun,night;uniform float uT,uSeed,uAmt;varying vec3 vP,vN,vW;void main(){vec3 d=normalize(vP);float n=fbm(d*2.4+vec3(uT*.02,0.,uSeed*2.)+fbm(d*3.)*.5);
          float a=smoothstep(.63-.05*uAmt,.7-.05*uAmt,n)*.82;if(a<.02)discard;float nl=dot(normalize(vN),normalize(uSun-vW));float lit=mix(.55,1.,smoothstep(-.1,.1,nl));
          vec3 c=mix(night*2.6,vec3(.97,.96,1.),lit);c=mix(c*.88,c,smoothstep(.66,.76,n));c=mix(c,c*.86,smoothstep(.7,.8,n)*0.);gl_FragColor=vec4(c,a*.92);${ENC}}`});
      cl=new THREE.Mesh(new THREE.SphereGeometry(r*1.03,56,28),cm);g.add(cl)}
    /* Kontur + Atmosphäre */const ol=new THREE.Mesh(new THREE.SphereGeometry(r*1.022,48,24),new THREE.MeshBasicMaterial({color:new THREE.Color(P.deep).multiplyScalar(.35),side:THREE.BackSide}));g.add(ol);
    const am=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,uniforms:{uSun:U.uSun,atmo:U.atmo,uC:{value:new V()},uR:{value:r}},
      vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`uniform vec3 uSun,atmo,uC;uniform float uR;varying vec3 vW;void main(){vec3 rd=normalize(vW-cameraPosition);vec3 oc=uC-cameraPosition;float dd=length(cross(rd,oc))/uR;
        float a=(1.-smoothstep(1.0,1.19,dd))*smoothstep(.9,1.0,dd);vec3 P=cameraPosition+rd*dot(oc,rd);float s=.3+.7*smoothstep(-.5,.6,dot(normalize(P-uC),normalize(uSun-uC)));a*=s*.85;
        gl_FragColor=vec4(atmo*a,a);${ENC}}`});
    const at=new THREE.Mesh(new THREE.SphereGeometry(r*1.2,48,24),am);g.add(at);
    g.userData.U=U;g.userData.cl=cl;g.userData.at=am;g.userData.body=body;return g}

  /* ---------- Ring mit Bändern und Planetenschatten ---------- */
  function ring(pid,r){const P=pal(pid);const cols={schrott:['#C9D2E6','#8D8AAE','#E8ECF6'],pilz:['#D6BCFF','#9C7FD6','#FFD6F0'],wueste:['#F2D6A6','#C9975E','#FFF0D0']}[pid]||['#ddd','#aaa','#fff'];
    const r0=r*1.45,r1=r*2.35;const geo=new THREE.RingGeometry(r0,r1,128,4);
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uSun:{value:new V()},uC:{value:new V()},uR:{value:r},r0:{value:r0},r1:{value:r1},a:{value:lin(cols[0])},b:{value:lin(cols[1])},c:{value:lin(cols[2])}},
      vertexShader:'varying vec3 vL,vW;void main(){vL=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`uniform vec3 uSun,uC,a,b,c;uniform float uR,r0,r1;varying vec3 vL,vW;
        float hh(float x){return fract(sin(x*127.1)*43758.5453);}
        void main(){float t=(length(vL.xy)-r0)/(r1-r0);float bi=floor(t*22.);float n=hh(bi+3.);float gap=step(.18,n)*smoothstep(0.,.06,t)*smoothstep(1.,.9,t);if(abs(t-.62)<.03)gap=0.;
          vec3 col=mix(a,b,step(.55,n));col=mix(col,c,step(.85,n));float al=gap*(.55+.4*hh(bi+11.));
          vec3 L=normalize(uSun-vW);vec3 oc=vW-uC;float bb=dot(oc,L);float cc=dot(oc,oc)-uR*uR;float disc=bb*bb-cc;float sh=(disc>0.&&bb<0.)?1.:0.;col*=mix(1.,.35,sh);
          if(al<.02)discard;gl_FragColor=vec4(col,al);${ENC}}`});
    const mesh=new THREE.Mesh(geo,m);mesh.rotation.x=-PI/2+.62;mesh.rotation.y=.25;mesh.userData.m=m;return mesh}

  /* ---------- Asteroiden: bucklige Steine mit Kontur, verschiedene Farben ---------- */
  function asteroids(n,rmin,rmax){const base=new THREE.IcosahedronGeometry(.6,1);const pos=base.attributes.position;const tmp=new V();
    for(let i=0;i<pos.count;i++){tmp.fromBufferAttribute(pos,i);const k=1+.28*Math.sin(tmp.x*5.1+tmp.y*3.3)*Math.cos(tmp.z*4.7-tmp.x*2.)+.12*Math.sin(tmp.y*11.);tmp.multiplyScalar(k);pos.setXYZ(i,tmp.x,tmp.y,tmp.z)}
    base.deleteAttribute('normal');base.deleteAttribute('uv');const geo=THREE.BufferGeometryUtils?THREE.BufferGeometryUtils.mergeVertices(base):base;geo.computeVertexNormals();
    const mat=cozy({color:'#ffffff',rim:.5,rimColor:'#C8B8FF'});const im=new THREE.InstancedMesh(geo,mat,n);
    const hull=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:'#2A2246',side:THREE.BackSide}),n);
    const cols=['#A89BC2','#9C8E86','#B8A88E','#8E86A8','#C2B2D8','#8C9AB0','#B09080'];const mm=new THREE.Matrix4(),mh=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();const rocks=[];
    for(let i=0;i<n;i++){const a=Math.random()*TAU,rr=rmin+Math.random()*(rmax-rmin);const p=new V(Math.cos(a)*rr,(Math.random()-.5)*1.8,Math.sin(a)*rr);const s=.45+Math.pow(Math.random(),2.2)*1.9;
      q.setFromEuler(e.set(Math.random()*3,Math.random()*3,Math.random()*3));const sc=new V(s,s*(.7+Math.random()*.3),s*(.8+Math.random()*.3));mm.compose(p,q,sc);im.setMatrixAt(i,mm);mh.compose(p,q,sc.clone().multiplyScalar(1.07));hull.setMatrixAt(i,mh);
      const c=new THREE.Color(cols[i%cols.length]).offsetHSL(0,0,(Math.random()-.5)*.08);im.setColorAt(i,c);rocks.push({p,s,q:q.clone(),sc,spin:(Math.random()-.5)*.6})}
    const g=new THREE.Group();g.add(hull,im);g.userData={rocks,im,hull};return g}

  /* ---------- Sternenstaub: funkelnde Sterne mit Schein ---------- */
  const starT=()=>ctex('dustStar',128,128,(x,w,h)=>{const gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.25,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-PI/2,rr=i%2?9:30;x.lineTo(64+Math.cos(a)*rr,64+Math.sin(a)*rr)}x.closePath();x.fill()});
  function dustStar(col){const g=new THREE.Group();const s=new THREE.Sprite(new THREE.SpriteMaterial({map:starT(),color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));s.scale.setScalar(2.4);g.add(s);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.34,0),cozy({color:col,rim:.9,rimColor:'#ffffff',emissive:new THREE.Color(col).multiplyScalar(.45)}));g.add(gem);g.userData={s,gem};return g}

  /* ---------- Antriebsspur: weiche Wölkchen ---------- */
  const puffT=()=>ctex('puff',64,64,(x,w,h)=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,w,h)});
  function trail(sc,n){const list=[];for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffT(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));s.visible=false;sc.add(s);list.push({s,life:0,v:new V()})}let k=0;
    return{emit(p,v,col,size){const o=list[k++%n];o.s.visible=true;o.s.position.copy(p);o.v.copy(v);o.life=1;o.size=size;o.s.material.color.set(col)},
      step(dt){for(const o of list){if(!o.s.visible)continue;o.life-=dt*1.6;if(o.life<=0){o.s.visible=false;continue}o.s.position.addScaledVector(o.v,dt);const l=o.life;o.s.scale.setScalar(o.size*(1.6-l));o.s.material.opacity=l*l*.8;o.s.material.color.lerp(new THREE.Color('#B06CFF'),dt*1.5)}}}}

  /* ---------- Geschwindigkeits-Streifen rund ums Schiff ---------- */
  function streaks(n){const g=new THREE.BufferGeometry();const p=new Float32Array(n*6);g.setAttribute('position',new THREE.BufferAttribute(p,3));const seeds=[];for(let i=0;i<n;i++)seeds.push(new V((Math.random()-.5)*60,(Math.random()-.5)*14+2,(Math.random()-.5)*60));
    const m=new THREE.LineBasicMaterial({color:'#E6DCFF',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const ls=new THREE.LineSegments(g,m);ls.frustumCulled=false;
    ls.userData.step=(ship,vel)=>{const sp=vel.length();m.opacity=Math.min(.32,Math.max(0,(sp-8)/40));const dir=vel.clone().multiplyScalar(-.05*Math.min(1,sp/20));
      for(let i=0;i<n;i++){const s=seeds[i];/* relativ zum Schiff umbrechen */for(const ax of ['x','z']){let d=s[ax]-ship.position[ax];if(d>30)s[ax]-=60;if(d<-30)s[ax]+=60}p.set([s.x,s.y,s.z,s.x+dir.x*(1+i%3),s.y,s.z+dir.z*(1+i%3)],i*6)}g.attributes.position.needsUpdate=true};return ls}

  /* ---------- Gepunktete Umlaufbahn ---------- */
  function orbit(r,col){const pts=[];for(let i=0;i<=256;i++){const a=i/256*TAU;pts.push(new V(Math.cos(a)*r,0,Math.sin(a)*r))}const g=new THREE.BufferGeometry().setFromPoints(pts);const l=new THREE.Line(g,new THREE.LineDashedMaterial({color:col||'#BFB4FF',dashSize:1.1,gapSize:1.5,transparent:true,opacity:.35,depthWrite:false}));l.computeLineDistances();return l}

  /* ---------- kleiner Mond ---------- */
  function moon(r,col){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,18),cozy({color:col,rim:.6,rimColor:'#E6DCFF'}));g.add(m);
    for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.CircleGeometry(r*(.14+Math.random()*.16),16),cozy({color:new THREE.Color(col).multiplyScalar(.82)}));const d=new V().randomDirection();c.position.copy(d.clone().multiplyScalar(r*1.002));c.lookAt(d.multiplyScalar(r*2));g.add(c)}
    addOutlines(g);return g}

  return{sky,stars,sun,planet,ring,asteroids,dustStar,trail,streaks,orbit,moon,pal}
})();
