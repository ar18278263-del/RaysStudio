(()=>{
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* SIGNAL FIELD — native canvas instrument */
const orbitCanvas=$("#orbit-canvas");
if(orbitCanvas){
 const ctx=orbitCanvas.getContext("2d");
 let w=1,h=1,dpr=1,raf=0,last=0,pulse=0,score=0;
 const particles=Array.from({length:90},(_,i)=>({
   a:Math.random()*Math.PI*2,
   r:70+Math.random()*260,
   speed:(.08+Math.random()*.32)*(Math.random()>.5?1:-1),
   size:.7+Math.random()*1.7,
   phase:Math.random()*10
 }));
 const resize=()=>{
   const r=orbitCanvas.getBoundingClientRect();
   w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);
   orbitCanvas.width=w*dpr;orbitCanvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
 };
 addEventListener("resize",resize,{passive:true});resize();

 const draw=t=>{
   const dt=Math.min(.04,(t-last)/1000||.016);last=t;
   ctx.clearRect(0,0,w,h);
   const cx=w*.54,cy=h*.51;
   const mode=window.matchMedia("(prefers-reduced-motion: reduce)").matches?0.18:1;
   const field=(Math.sin(t*.00045)+1)*.5;
   const mx=cx,my=cy;
   ctx.strokeStyle="rgba(255,255,255,.045)";
   ctx.lineWidth=1;
   for(let i=1;i<8;i++){const rr=i*Math.min(w,h)*.065;ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.stroke()}
   particles.forEach(p=>{
     p.a+=p.speed*dt*.35*mode;
     const influence=Math.max(0,1-Math.hypot(mx-cx,my-cy)/(Math.min(w,h)*.55));
     const rr=p.r*(1+.045*Math.sin(t*.001+p.phase))+pulse*28;
     const x=cx+Math.cos(p.a)*rr, y=cy+Math.sin(p.a)*rr*.66;
     ctx.globalAlpha=.25+.45*influence;
     ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,p.size*(1+pulse*.7),0,Math.PI*2);ctx.fill();
   });
   ctx.globalAlpha=1;
   const glow=1+Math.sin(t*.002)*.08+pulse*.28;
   ctx.strokeStyle="rgba(255,255,255,.6)";ctx.beginPath();ctx.arc(cx,cy,34*glow,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(cx,cy,3.5+Math.max(0,pulse*3),0,Math.PI*2);ctx.fill();
   ctx.strokeStyle="rgba(255,255,255,.18)";ctx.beginPath();ctx.arc(cx,cy,68+pulse*45,0,Math.PI*2);ctx.stroke();
   const value=(field*37).toFixed(1);
   const fv=$("#field-value");if(fv)fv.textContent=value.padStart(4,"0");
   pulse=Math.max(0,pulse-dt*1.7);
   raf=requestAnimationFrame(draw);
 };
 raf=requestAnimationFrame(draw);
}

/* VECTOR LOCK */
const vc=$("#vector-canvas"),vs=$("#vector-start");
if(vc&&vs){
 const ctx=vc.getContext("2d");let w=0,h=0,x=0,y=0,r=18,score=0,active=false,start=0,raf=0;
 const fit=()=>{const q=vc.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);w=q.width;h=q.height;vc.width=w*d;vc.height=h*d;ctx.setTransform(d,0,0,d,0,0)};fit();addEventListener("resize",fit);
 const spawn=()=>{x=35+Math.random()*Math.max(1,w-70);y=35+Math.random()*Math.max(1,h-70);r=10+Math.random()*16};
 const end=msg=>{active=false;$("#vector-message").textContent=`${msg} / ${String(score).padStart(3,"0")}`};
 vc.addEventListener("pointerdown",e=>{if(!active)return;const q=vc.getBoundingClientRect(),mx=e.clientX-q.left,my=e.clientY-q.top;if(Math.hypot(mx-x,my-y)<r+14){score++;$("#vector-score").textContent=String(score).padStart(3,"0");spawn()}});
 vs.addEventListener("click",()=>{score=0;active=true;start=performance.now();$("#vector-score").textContent="000";$("#vector-message").textContent="LIVE";spawn()});
 const loop=t=>{ctx.clearRect(0,0,w,h);ctx.strokeStyle="rgba(255,255,255,.055)";for(let i=0;i<w;i+=36){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}for(let j=0;j<h;j+=36){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(w,j);ctx.stroke()}if(active){const pulse=1+Math.sin(t*.008)*.08;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,r*pulse,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.3)";ctx.beginPath();ctx.arc(x,y,r*2.2,0,Math.PI*2);ctx.stroke();if(t-start>30000)end("TIMEOUT")}requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
}

/* RANDOM ACCESS — keyboard sequence */
const as=$("#access-start"),ac=$("#access-code"),ai=$("#access-input");
if(as&&ac&&ai){let active=false,seq=[],index=0,score=0,timer=0;const keys=["A","S","D","F","J","K","L",";","Q","W","E","R"];
 const next=()=>{seq=Array.from({length:3+Math.min(4,Math.floor(score/4))},()=>keys[Math.floor(Math.random()*keys.length)]);index=0;ac.textContent=seq.join("  ");ai.textContent="AWAIT INPUT"};
 as.addEventListener("click",()=>{active=true;score=0;$("#access-score").textContent="000";next();clearTimeout(timer);timer=setTimeout(()=>{active=false;ai.textContent="TIMEOUT"},8000)});
 addEventListener("keydown",e=>{if(!active)return;const key=e.key.toUpperCase();if(key===seq[index]){index++;ai.textContent=`${index} / ${seq.length}`;if(index===seq.length){score++;$("#access-score").textContent=String(score).padStart(3,"0");if(window.gsap)gsap.fromTo(ac,{scale:1.08},{scale:1,duration:.25});next()}}else{active=false;ai.textContent="SEQUENCE BROKEN"}});
}

/* SIGNAL DIAL — GSAP Draggable + Tone */
const consoleEl=$("#dial-console");
if(consoleEl&&window.Draggable){
 const canvas=$("#dial-canvas"),ctx=canvas.getContext("2d"),dials=[$("#dial-a"),$("#dial-b"),$("#dial-c")],values=[42,68,24];let synth=null;
 const resize=()=>{const q=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=q.width*d;canvas.height=q.height*d;ctx.setTransform(d,0,0,d,0,0)};resize();addEventListener("resize",resize);
 const draw=()=>{const q=canvas.getBoundingClientRect(),w=q.width,h=q.height;ctx.clearRect(0,0,w,h);const f=values[0]/100,d=values[1]/100,p=values[2]/100;ctx.strokeStyle="rgba(255,255,255,.08)";for(let i=0;i<12;i++){const x=(i/11)*w;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}ctx.beginPath();for(let x=0;x<=w;x+=3){const y=h*.5+Math.sin(x*.035+performance.now()*.001*(1+f*3))*h*.22*(.25+d);x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.strokeStyle="#fff";ctx.globalAlpha=.75;ctx.stroke();ctx.globalAlpha=1;requestAnimationFrame(draw)};draw();
 const setValue=(i,v)=>{values[i]=Math.round(Math.max(0,Math.min(100,v)));$("#dial-abc".replace("abc",["a","b","c"][i])+"-value").textContent=values[i];$("#dial-state").textContent=`${Math.round((values[0]+values[1]+values[2])/3)}`;if(window.gsap)gsap.to(dials[i],{rotation:-135+values[i]*2.7,duration:.18,overwrite:true});if(synth){const freq=90+values[0]*6;synth.triggerAttackRelease(freq,Math.min(.12,.03+values[2]/800));}};
 dials.forEach((dial,i)=>{Draggable.create(dial,{type:"rotation",bounds:{minRotation:-135,maxRotation:135},onDrag(){setValue(i,(this.rotation+135)/2.7)}})});
 $("#dial-reset")?.addEventListener("click",()=>{values=[42,68,24];dials.forEach((d,i)=>gsap.to(d,{rotation:-135+values[i]*2.7,duration:.35}));values.forEach((v,i)=>$("#dial-abc".replace("abc",["a","b","c"][i])+"-value").textContent=v);$("#dial-message").textContent="RESET / READY"});
 consoleEl.addEventListener("pointerdown",async()=>{if(window.Tone&&!synth){await Tone.start();synth=new Tone.Synth({volume:-22,envelope:{attack:.01,decay:.06,sustain:.1,release:.08}}).toDestination();}if(synth)synth.triggerAttackRelease(180+values[0]*4,.08)});
}
})();

/* HOME OBSERVATORY PREVIEW */
const previewCanvas=document.querySelector('#home-observatory-canvas');
if(previewCanvas&&window.THREE){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,50),renderer=new THREE.WebGLRenderer({canvas:previewCanvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));camera.position.z=7;
 const geo=new THREE.BufferGeometry(),n=260,a=new Float32Array(n*3);for(let i=0;i<n;i++){const r=1.8+Math.random()*3,a1=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);a[i*3]=r*Math.sin(b)*Math.cos(a1);a[i*3+1]=r*Math.cos(b);a[i*3+2]=r*Math.sin(b)*Math.sin(a1)}geo.setAttribute('position',new THREE.BufferAttribute(a,3));const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:.025,transparent:true,opacity:.7}));scene.add(pts);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.8,.01,6,120),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.22}));ring.rotation.x=.8;scene.add(ring);const resize=()=>{const r=previewCanvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize);let mx=0,my=0;previewCanvas.parentElement.addEventListener('pointermove',e=>{const r=previewCanvas.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5});const loop=()=>{pts.rotation.y+=.0009;pts.rotation.x+=(my*.15-pts.rotation.x)*.02;ring.rotation.z+=.001;scene.rotation.y+=(mx*.22-scene.rotation.y)*.02;renderer.render(scene,camera);requestAnimationFrame(loop)};loop();
}
