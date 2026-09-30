/* =====================================================================
   CYBORG-LABOR · look.js
   Bildpipeline für den fertigen Look (siehe docs/LOOK-RESEARCH.md):
   1. Szene in ein Ziel mit Tiefentextur rendern
   2. Umgebungsverdeckung aus der Tiefe (farbig: violette statt graue Schatten)
      + Tuschelinien an Silhouetten (konstante Pixelbreite, Farbe = dunkler
      Farbton des Objekts, verblasst mit der Entfernung)
   3. Farbgebung: kühle Schatten, warme Lichter, sanfter Kontrast,
      Sättigung, Vignette, Miniatur-Unschärfe oben/unten (Tierdorf-Kamera)
   4. zurückhaltender Glanz (Bloom) auf leuchtenden Dingen
   ===================================================================== */
const LOOK=(()=>{
  const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));const qScene=new THREE.Scene();qScene.add(quad);const qCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);quad.frustumCulled=false;
  /* ---------- Pass 0: Verdeckung in halber Auflösung (wird im Farbpass tiefenbewusst weichgezeichnet) ---------- */
  const AO_FS=`
precision highp float;uniform sampler2D tDepth;uniform vec2 res;uniform float near;uniform float far;uniform float aoRad;varying vec2 vUv;
float lin(float d){float z=d*2.-1.;return 2.*near*far/(far+near-z*(far-near));}
float D(vec2 uv){return lin(texture2D(tDepth,uv).x);}
void main(){float raw=texture2D(tDepth,vUv).x;if(raw>.9999){gl_FragColor=vec4(0.);return;}float d0=lin(raw);float rr=clamp(aoRad*res.y/max(d0,1.),2.,22.);
  float a0=fract(sin(dot(floor(vUv*res),vec2(12.9898,78.233)))*43758.5453)*6.2832;float ao=0.;
  for(int i=0;i<12;i++){float a=a0+float(i)*2.39996;float k=(float(i)+.5)/12.;vec2 o=vec2(cos(a),sin(a))*rr*sqrt(k)/res;float dz=d0-D(vUv+o);ao+=smoothstep(.012*d0+.06,.04*d0+.2,dz)*(1.-smoothstep(.8,2.,dz));}
  gl_FragColor=vec4(clamp(ao/12.*1.4,0.,1.),0.,0.,1.);}`;
  const aoMat=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:AO_FS,depthTest:false,depthWrite:false,uniforms:{tDepth:{value:null},res:{value:new THREE.Vector2(1,1)},near:{value:.1},far:{value:1000},aoRad:{value:.45}}});
  /* ---------- Pass 1: Verdeckung + Tusche + Farbgebung ---------- */
  const GRADE_FS=`
precision highp float;
uniform sampler2D tColor;uniform sampler2D tDepth;uniform sampler2D tAO;uniform vec2 res;uniform float near;uniform float far;uniform float time;
uniform float aoStr;uniform float aoRad;uniform vec3 aoCol;uniform float inkStr;uniform float inkPx;uniform float inkFar;
uniform vec3 shadowTint;uniform vec3 lightTint;uniform float sat;uniform float contrast;uniform float lift;uniform float fogAmt;uniform vec3 fogCol;uniform float fogNear;uniform float fogFar;
varying vec2 vUv;
float lin(float d){float z=d*2.-1.;return 2.*near*far/(far+near-z*(far-near));}
float D(vec2 uv){return lin(texture2D(tDepth,uv).x);}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec3 satur(vec3 c,float s){float l=dot(c,vec3(.299,.587,.114));return mix(vec3(l),c,s);}
void main(){
  vec3 col=texture2D(tColor,vUv).rgb;float d0=D(vUv);bool sky=texture2D(tDepth,vUv).x>.9999;
  /* --- Umgebungsverdeckung: Nachbarn deutlich näher als ich → ich liege in einer Ecke/unter etwas --- */
  float ao=0.;
  if(!sky&&aoStr>0.){vec2 hp=2./res;float wsum=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 o=vec2(float(i),float(j))*hp;float w=1./(1.+float(i*i+j*j));float dd=D(vUv+o);w*=1.-smoothstep(.02*d0,.08*d0,abs(dd-d0));ao+=texture2D(tAO,vUv+o).r*w;wsum+=w;}
    ao=ao/max(wsum,1e-4)*aoStr*(1.-smoothstep(fogNear*.6,fogFar,d0));col=mix(col,col*aoCol,ao);}
  /* --- Tusche: Silhouetten, wo Nachbarn weit hinter mir liegen --- */
  if(inkStr>0.&&!sky){vec2 px=inkPx/res;float m=0.;
    for(int i=0;i<8;i++){float a=float(i)*.7854;vec2 o=vec2(cos(a),sin(a))*px;float ds=texture2D(tDepth,vUv+o).x>.9999?far:D(vUv+o);m=max(m,ds-d0);}
    float e=smoothstep(.08*d0+.2,.16*d0+.45,m)*(1.-smoothstep(inkFar*.35,inkFar,d0));
    vec3 ink=satur(col,1.4)*vec3(.3,.26,.36);col=mix(col,ink,e*inkStr);}
  /* --- Dunst: Entfernung löst sich in die Himmelsfarbe auf (weich, nach Sichtweite) --- */
  if(!sky&&fogAmt>0.){float f=smoothstep(fogNear,fogFar,d0)*fogAmt;col=mix(col,fogCol,f);}
  /* --- Farbgebung: Split-Toning nach Helligkeit --- */
  float L=dot(col,vec3(.299,.587,.114));
  col=mix(col*shadowTint,col,smoothstep(.0,.55,L));col=mix(col,col*lightTint,smoothstep(.55,1.,L)*.6);
  col=(col-.5)*contrast+.5+lift;col=satur(col,sat);
  gl_FragColor=vec4(clamp(col,0.,1.2),1.);}`;
  /* ---------- Pass 2: Miniatur-Unschärfe + Vignette + Körnung ---------- */
  const FINAL_FS=`
precision highp float;uniform sampler2D tColor;uniform vec2 res;uniform float tilt;uniform float vig;uniform float time;uniform float grain;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 c=texture2D(tColor,vUv).rgb;
  float dy=vUv.y-.55;float b=tilt>0.?smoothstep(.3,.5,abs(dy))*tilt*(dy<0.?.35:1.):0.;
  if(b>.01){vec3 acc=c;float w=1.;for(int i=0;i<12;i++){float a=float(i)*2.39996;float k=sqrt((float(i)+.5)/12.);vec2 o=vec2(cos(a),sin(a))*k*b*5./res;acc+=texture2D(tColor,vUv+o).rgb;w+=1.;}c=acc/w;}
  vec2 q=vUv-.5;q.x*=res.x/res.y;float v=1.-smoothstep(.45,1.15,length(q))*vig;c*=mix(vec3(.86,.8,.94),vec3(1.),v);
  c+=(hash(vUv*res+fract(time))-.5)*grain;
  gl_FragColor=vec4(c,1.);}`;
  const gradeMat=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:GRADE_FS,depthTest:false,depthWrite:false,uniforms:{tColor:{value:null},tDepth:{value:null},tAO:{value:null},res:{value:new THREE.Vector2(1,1)},near:{value:.1},far:{value:1000},time:{value:0},
    aoStr:{value:.6},aoRad:{value:.45},aoCol:{value:new THREE.Color('#6E5A9E')},inkStr:{value:.9},inkPx:{value:1.5},inkFar:{value:140},
    shadowTint:{value:new THREE.Color('#C8C0FF')},lightTint:{value:new THREE.Color('#FFF1DC')},sat:{value:1.02},contrast:{value:1.02},lift:{value:.008},fogAmt:{value:.55},fogCol:{value:new THREE.Color('#dfe8ff')},fogNear:{value:60},fogFar:{value:220}}});
  const finalMat=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FINAL_FS,depthTest:false,depthWrite:false,uniforms:{tColor:{value:null},res:{value:new THREE.Vector2(1,1)},tilt:{value:1},vig:{value:.55},time:{value:0},grain:{value:.012}}});
  const P={};/* je Renderer eigene Ziele */
  function targets(R,w,h){let T=P[R.id||(R.id=Math.random())];if(T&&T.w===w&&T.h===h)return T;if(T){T.scene.dispose();T.a.dispose();T.b.dispose();T.ao.dispose()}
    const scene=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType});scene.depthTexture=new THREE.DepthTexture(w,h);scene.depthTexture.type=THREE.UnsignedIntType;
    const a=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType}),b=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType});
    const bloom=typeof THREE.UnrealBloomPass==='function'?new THREE.UnrealBloomPass(new THREE.Vector2(w/2,h/2),.28,.45,.92):null;
    const ao=new THREE.WebGLRenderTarget(Math.max(2,w>>1),Math.max(2,h>>1),{type:THREE.HalfFloatType});T=P[R.id]={w,h,scene,a,b,bloom,ao};return T}
  let enabled=true;const t0=performance.now();
  /* opts: {fog:Color, near, far, tilt, bloom} – je Szene anpassbar */
  function render(R,scene,cam,o){o=o||{};const sz=R.getDrawingBufferSize(new THREE.Vector2());const w=Math.max(4,sz.x|0),h=Math.max(4,sz.y|0);const T=targets(R,w,h);const t=(performance.now()-t0)/1000;
    R.setRenderTarget(T.scene);R.clear();R.render(scene,cam);
    const U=gradeMat.uniforms;U.tColor.value=T.scene.texture;U.tDepth.value=T.scene.depthTexture;U.res.value.set(w,h);U.near.value=cam.near;U.far.value=cam.far;U.time.value=t%10;
    if(o.fog)U.fogCol.value.copy(o.fog);U.fogNear.value=o.fogNear??60;U.fogFar.value=o.fogFar??220;U.fogAmt.value=o.fogAmt??.5;U.aoStr.value=o.ao??.6;U.inkStr.value=o.ink??.85;U.inkPx.value=Math.max(1,1.3*(w/Math.max(1,R.domElement.clientWidth||w)));
    if(o.night!=null){const n=o.night;U.shadowTint.value.set('#C8C0FF').lerp(new THREE.Color('#8FA0FF'),n);U.lightTint.value.set('#FFF1DC').lerp(new THREE.Color('#FFE2B8'),n);U.sat.value=1.02-n*.12}
    const A=aoMat.uniforms;A.tDepth.value=T.scene.depthTexture;A.res.value.set(w>>1,h>>1);A.near.value=cam.near;A.far.value=cam.far;quad.material=aoMat;R.setRenderTarget(T.ao);R.render(qScene,qCam);U.tAO.value=T.ao.texture;
    quad.material=gradeMat;R.setRenderTarget(T.a);R.render(qScene,qCam);
    if(T.bloom&&o.bloom!==false){T.bloom.strength=o.bloomStr??.28;T.bloom.renderToScreen=false;T.bloom.render(R,null,T.a,0,false)}
    const F=finalMat.uniforms;F.tColor.value=T.a.texture;F.res.value.set(w,h);F.tilt.value=o.tilt??1;F.vig.value=o.vig??.55;F.time.value=t;
    quad.material=finalMat;R.setRenderTarget(null);R.render(qScene,qCam)}
  return{render,get enabled(){return enabled},set enabled(v){enabled=!!v},gradeMat,finalMat}
})();
