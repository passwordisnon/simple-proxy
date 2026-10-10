/* =====================================================================
   CYBORG-LABOR · grass.js
   Dichter Grasteppich nach dem Vorbild von folio-2025 (Bruno Simon, MIT):
   ein Dreieck je Halm, Farbe und Normale kommen vom Boden darunter, damit
   Gras und Boden nahtlos ineinander übergehen. Die Halme entstehen beim
   Bau jeder feinsten Geländekachel (planet.js) – ohne teure Höhenabfragen.
   Im Shader: zur Kamera drehen, Wind, Spieler drückt das Gras beiseite,
   Ausblenden in der Ferne (dort übernimmt die Bodentextur).
   ===================================================================== */
const GRASS=(()=>{
  const U={uT:{value:0},uPlayer:{value:new THREE.Vector3(0,-9999,0)},uFadeNear:{value:16},uFadeFar:{value:30},uWind:{value:1}};
  let mat=null;
  function material(){if(mat)return mat;
    mat=new THREE.MeshToonMaterial({gradientMap:TOON_RAMP,vertexColors:true,side:THREE.DoubleSide});mat.userData.noBake=true;
    mat.onBeforeCompile=s=>{Object.assign(s.uniforms,U);
      s.vertexShader='uniform float uT;uniform vec3 uPlayer;uniform float uFadeNear;uniform float uFadeFar;uniform float uWind;attribute vec4 aB;varying float vTip;\n'+s.vertexShader.replace('#include <begin_vertex>',`
        vec3 up=normalize(normal);vec3 base=position;
        float camD=length(cameraPosition-base);float fade=1.-smoothstep(uFadeNear,uFadeFar,camD);
        vec3 toCam=normalize(cameraPosition-base);vec3 side=cross(up,toCam);float sl=length(side);side=sl>1e-4?side/sl:vec3(1.,0.,0.);
        float tip=aB.x<.5?1.:0.;float sgn=aB.x<.5?0.:(aB.x<1.5?-1.:1.);float hgt=aB.y*fade;
        vec3 transformed=base+side*sgn*aB.w*(.35+.65*fade)+up*(hgt*tip-.02);
        /* Wind: zwei Wellen, Böen wandern über die Wiese */
        vec3 wd=vec3(1.,0.,.35);wd=normalize(wd-up*dot(up,wd)+vec3(1e-4));
        float w=sin(uT*1.7+dot(base,vec3(.23,.19,.11))+aB.z*2.)*.55+sin(uT*.9+dot(base,vec3(.05,.07,.04)))*.45;
        transformed+=wd*w*hgt*.42*tip*uWind;
        /* Spieler drückt das Gras beiseite */
        vec3 dp=base-uPlayer;float dl=length(dp);float push=(1.-smoothstep(.25,1.05,dl))*tip;vec3 away=dp-up*dot(dp,up);away=length(away)>1e-4?normalize(away):side;
        transformed+=away*push*hgt*.9-up*push*hgt*.5;
        vTip=tip;`);
      s.fragmentShader='varying float vTip;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=mix(.8,1.06,vTip);')};
    mat.customProgramCacheKey=()=>'grass-carpet';return mat}
  /* Halme für eine feinste Kachel: Gitter M×M mit pos/nor/col/pat/mat je Punkt */
  function forTile(M,pos,nor,col,pat,matA,H,sea,seed,per){const N=M-1;per=per||2;let r=(seed>>>0)||1;const rnd=()=>{r^=r<<13;r>>>=0;r^=r>>>17;r^=r<<5;r>>>=0;return r/4294967296};
    const P=[],Nn=[],C=[],B=[];
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*M+i,b=a+1,c=a+M,e=c+1;
      for(let q=0;q<per;q++){let u=rnd(),v=rnd();const w0=(1-u)*(1-v),w1=u*(1-v),w2=(1-u)*v,w3=u*v;
        const g=pat[a*4]*w0+pat[b*4]*w1+pat[c*4]*w2+pat[e*4]*w3;if(g<.55)continue;
        const cliff=matA[a*4]*w0+matA[b*4]*w1+matA[c*4]*w2+matA[e*4]*w3,path=matA[a*4+1]*w0+matA[b*4+1]*w1+matA[c*4+1]*w2+matA[e*4+1]*w3;if(cliff>.25||path>.3)continue;
        const h=H[a]*w0+H[b]*w1+H[c]*w2+H[e]*w3;if(h<sea+.2)continue;
        const x=pos[a*3]*w0+pos[b*3]*w1+pos[c*3]*w2+pos[e*3]*w3,y=pos[a*3+1]*w0+pos[b*3+1]*w1+pos[c*3+1]*w2+pos[e*3+1]*w3,z=pos[a*3+2]*w0+pos[b*3+2]*w1+pos[c*3+2]*w2+pos[e*3+2]*w3;
        const nx=nor[a*3]*w0+nor[b*3]*w1+nor[c*3]*w2+nor[e*3]*w3,ny=nor[a*3+1]*w0+nor[b*3+1]*w1+nor[c*3+1]*w2+nor[e*3+1]*w3,nz=nor[a*3+2]*w0+nor[b*3+2]*w1+nor[c*3+2]*w2+nor[e*3+2]*w3;
        const k=.93+rnd()*.14;const cr=(col[a*3]*w0+col[b*3]*w1+col[c*3]*w2+col[e*3]*w3)*k,cg=(col[a*3+1]*w0+col[b*3+1]*w1+col[c*3+1]*w2+col[e*3+1]*w3)*k,cb=(col[a*3+2]*w0+col[b*3+2]*w1+col[c*3+2]*w2+col[e*3+2]*w3)*k;
        const hh=(.16+rnd()*.2)*(1-path)*(g),wd=.04+rnd()*.03,sd=rnd();
        for(let t=0;t<3;t++){P.push(x,y,z);Nn.push(nx,ny,nz);C.push(cr,cg,cb);B.push(t,hh,sd,wd)}}}
    if(!P.length)return null;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setAttribute('aB',new THREE.Float32BufferAttribute(B,4));geo.computeBoundingSphere();geo.boundingSphere.radius+=1;
    const m=new THREE.Mesh(geo,material());m.matrixAutoUpdate=false;m.receiveShadow=true;m.castShadow=false;m.userData.grass=true;m.userData.noOutline=true;return m}
  function frame(t,player){U.uT.value=t;if(player)U.uPlayer.value.copy(player)}
  return{forTile,frame,U,material}
})();
