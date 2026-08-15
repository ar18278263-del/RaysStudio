(()=>{"use strict";
const $=s=>document.querySelector(s);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

function fitCanvas(c){
  const r=c.parentElement.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
  c.width=Math.max(1,Math.floor(r.width*d));c.height=Math.max(1,Math.floor(r.height*d));
  const ctx=c.getContext("2d");ctx.setTransform(d,0,0,d,0,0);return [r.width,r.height,ctx];
}

/* FIELD */
const field=$("#lab-canvas");
if(field){
  const ctx=field.getContext("2d");let w,h,px={x:0,y:0,down:false},nodes=[];
  const size=()=>{[w,h]=fitCanvas(field);nodes=Array.from({length:70},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5),vy:(Math.random()-.5)}))};
  size();addEventListener("resize",size);
  field.parentElement.addEventListener("pointermove",e=>{const r=field.getBoundingClientRect();px.x=e.clientX-r.left;px.y=e.clientY-r.top});
  field.parentElement.addEventListener("pointerdown",()=>px.down=true);field.parentElement.addEventListener("pointerup",()=>px.down=false);
  const loop=()=>{ctx.clearRect(0,0,w,h);for(const n of nodes){n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>w)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1;const dx=px.x-n.x,dy=px.y-n.y,d=Math.hypot(dx,dy)||1;if(d<180){const f=(1-d/180)*(px.down?3.2:1.8);n.x-=dx/d*f;n.y-=dy/d*f}ctx.fillStyle="#fff";ctx.globalAlpha=.35;ctx.fillRect(n.x,n.y,2,2)}ctx.globalAlpha=1;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<100){ctx.strokeStyle=`rgba(255,255,255,${(1-d/100)*.12})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}requestAnimationFrame(loop)};loop();
}

/* SIGNAL RUNNER */
const game=$("#game-canvas"),start=$("#start-game");
if(game&&start){
  const ctx=game.getContext("2d");let w,h,target={x:0,y:0,r:20},score=0,time=30,running=false,timer;
  const fit=()=>{[w,h]=fitCanvas(game)};fit();addEventListener("resize",fit);
  function spawn(){target.x=50+Math.random()*Math.max(1,w-100);target.y=50+Math.random()*Math.max(1,h-100);target.r=12+Math.random()*18}
  function draw(){ctx.clearRect(0,0,w,h);ctx.strokeStyle="rgba(255,255,255,.08)";for(let i=0;i<w;i+=45){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}for(let j=0;j<h;j+=45){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(w,j);ctx.stroke()}ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(target.x,target.y,target.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.globalAlpha=.2;ctx.beginPath();ctx.arc(target.x,target.y,target.r*2.2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
  function end(){running=false;clearInterval(timer);$("#game-message").textContent="SIGNAL LOST / "+String(score).padStart(3,"0");const best=Math.max(score,Number(localStorage.rayBest||0));localStorage.rayBest=best;$("#best").textContent=String(best).padStart(3,"0")}
  game.addEventListener("pointerdown",e=>{if(!running)return;const r=game.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(Math.hypot(x-target.x,y-target.y)<target.r+10){score++;$("#score").textContent=String(score).padStart(3,"0");spawn()}});
  start.addEventListener("click",()=>{score=0;time=30;running=true;$("#score").textContent="000";$("#game-time").textContent="30";$("#game-message").textContent="RUNNING";spawn();clearInterval(timer);timer=setInterval(()=>{time--;$("#game-time").textContent=String(time).padStart(2,"0");if(time<=0)end()},1000)});
  $("#best").textContent=String(Number(localStorage.rayBest||0)).padStart(3,"0");const loop=()=>{draw();requestAnimationFrame(loop)};loop();
}

/* PHYSICS */
const pc=$("#physics-canvas"),spawnBtn=$("#spawn");
if(pc&&window.Matter){
  const {Engine,Render,Runner,Bodies,Composite,Mouse,MouseConstraint}=Matter,engine=Engine.create(),r=Render.create({canvas:pc,engine,options:{wireframes:false,background:"#080808",width:pc.parentElement.clientWidth,height:pc.parentElement.clientHeight,pixelRatio:Math.min(devicePixelRatio||1,1.5)}}),w=r.options.width,h=r.options.height;
  Composite.add(engine.world,[Bodies.rectangle(w/2,h+30,w,60,{isStatic:true}),Bodies.rectangle(-30,h/2,60,h,{isStatic:true}),Bodies.rectangle(w+30,h/2,60,h,{isStatic:true})]);
  const mouse=Mouse.create(pc);Composite.add(engine.world,MouseConstraint.create(engine,{mouse,constraint:{stiffness:.2,render:{visible:false}}}));Render.run(r);Runner.run(Runner.create(),engine);
  spawnBtn?.addEventListener("click",()=>Composite.add(engine.world,Bodies.circle(80+Math.random()*Math.max(1,w-160),50,10+Math.random()*22,{restitution:.85,friction:.02,render:{fillStyle:"#fff",strokeStyle:"#fff",lineWidth:1}})));
  for(let i=0;i<12;i++)Composite.add(engine.world,Bodies.circle(100+Math.random()*Math.max(1,w-200),80+Math.random()*250,8+Math.random()*16,{restitution:.8,render:{fillStyle:"#fff"}}));
}

/* MINI ARCADE: REFLEX */
const reflex=$("#reflex-canvas"),reflexStart=$("#reflex-start");
if(reflex&&reflexStart){
  const ctx=reflex.getContext("2d");let w=0,h=0,x=0,y=0,r=18,active=false,score=0,spawnAt=0,raf=0;
  const resize=()=>{[w,h]=fitCanvas(reflex)};resize();addEventListener("resize",resize);
  const spawn=()=>{x=30+Math.random()*Math.max(1,w-60);y=30+Math.random()*Math.max(1,h-60);r=14+Math.random()*18;spawnAt=performance.now()};
  const draw=()=>{ctx.clearRect(0,0,w,h);ctx.strokeStyle="rgba(255,255,255,.07)";for(let i=0;i<w;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}if(active){const age=performance.now()-spawnAt,pulse=1+Math.sin(age*.012)*.08;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,r*pulse,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.3)";ctx.beginPath();ctx.arc(x,y,r*2,0,Math.PI*2);ctx.stroke()}raf=requestAnimationFrame(draw)};draw();
  reflex.addEventListener("pointerdown",e=>{if(!active)return;const q=reflex.getBoundingClientRect(),mx=e.clientX-q.left,my=e.clientY-q.top;if(Math.hypot(mx-x,my-y)<r+12){score++;$("#reflex-score").textContent=String(score).padStart(3,"0");spawn()}});
  reflexStart.addEventListener("click",()=>{score=0;active=true;$("#reflex-score").textContent="000";$("#reflex-message").textContent="HIT THE DOT";spawn();setTimeout(()=>{active=false;$("#reflex-message").textContent=`DONE / ${String(score).padStart(3,"0")}`},15000)});
}

/* MINI ARCADE: MEMORY */
const memoryGrid=$("#memory-grid"),memoryStart=$("#memory-start");
if(memoryGrid&&memoryStart){
  const cells=Array.from({length:9},(_,i)=>{const b=document.createElement("button");b.className="memory-cell";b.type="button";b.setAttribute("aria-label",`Memory tile ${i+1}`);memoryGrid.appendChild(b);return b});
  let seq=[],input=[],round=0,locked=true;
  const flash=async()=>{locked=true;$("#memory-message").textContent="WATCH";for(const n of seq){cells[n].classList.add("lit");await new Promise(r=>setTimeout(r,300));cells[n].classList.remove("lit");await new Promise(r=>setTimeout(r,130))}locked=false;$("#memory-message").textContent="REPEAT THE PATTERN"};
  const next=()=>{seq.push(Math.floor(Math.random()*9));round=seq.length;$("#memory-round").textContent=String(round).padStart(2,"0");input=[];flash()};
  cells.forEach((c,i)=>c.addEventListener("click",()=>{if(locked)return;c.classList.add("lit");setTimeout(()=>c.classList.remove("lit"),120);input.push(i);const n=input.length-1;if(input[n]!==seq[n]){locked=true;$("#memory-message").textContent="PATTERN BROKEN / PRESS START";return}if(input.length===seq.length){locked=true;if(round>=8){$("#memory-message").textContent="SYSTEM MASTERED / 08";return}setTimeout(next,350)}}));
  memoryStart.addEventListener("click",()=>{seq=[];round=0;$("#memory-round").textContent="01";$("#memory-message").textContent="LOADING";setTimeout(next,350)});
}

/* MINI ARCADE: DODGE */
const dodge=$("#dodge-canvas"),dodgeStart=$("#dodge-start");
if(dodge&&dodgeStart){
  const ctx=dodge.getContext("2d");let w=0,h=0,px=0,py=0,balls=[],active=false,score=0,last=0,raf=0;
  const resize=()=>{[w,h]=fitCanvas(dodge);px=w/2;py=h-45};resize();addEventListener("resize",resize);
  dodge.addEventListener("pointermove",e=>{const q=dodge.getBoundingClientRect();px=e.clientX-q.left;py=e.clientY-q.top});
  const reset=()=>{balls=[];score=0;last=performance.now();active=true;$("#dodge-score").textContent="000";$("#dodge-message").textContent="SURVIVE 20 SEC"};
  const loop=t=>{ctx.clearRect(0,0,w,h);ctx.strokeStyle="rgba(255,255,255,.06)";for(let i=0;i<w;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}if(active){if(t-last>380){balls.push({x:Math.random()*w,y:-20,r:5+Math.random()*9,v:1.5+Math.random()*2.2});last=t}for(const b of balls){b.y+=b.v;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();if(Math.hypot(b.x-px,b.y-py)<b.r+12){active=false;$("#dodge-message").textContent=`IMPACT / ${String(score).padStart(3,"0")}`}}balls=balls.filter(b=>b.y<h+30);score=Math.floor((t-startTime)/100);$("#dodge-score").textContent=String(Math.min(999,score)).padStart(3,"0");if(t-startTime>20000){active=false;$("#dodge-message").textContent=`CLEAR / ${String(score).padStart(3,"0")}`}}ctx.strokeStyle="#fff";ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(px,py,12,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;raf=requestAnimationFrame(loop)};
  let startTime=0;
  dodgeStart.addEventListener("click",()=>{startTime=performance.now();reset()});raf=requestAnimationFrame(loop);
}

/* MINI ARCADE: TYPE PULSE */
const typeStart=$("#type-start"),typeInput=$("#type-input"),typePrompt=$("#type-prompt");
if(typeStart&&typeInput){
  const words=["REACT","SIGNAL","MOTION","SYSTEM","VECTOR","PULSE","UNKNOWN","RHYTHM","KINETIC","ORBIT"],state={active:false,score:0};
  const next=()=>{typePrompt.textContent=words[Math.floor(Math.random()*words.length)];typeInput.value="";typeInput.disabled=false;typeInput.focus()};
  typeStart.addEventListener("click",()=>{state.active=true;state.score=0;$("#type-score").textContent="000";$("#type-message").textContent="TYPE FAST";next()});
  typeInput.addEventListener("input",()=>{if(!state.active)return;if(typeInput.value.trim().toUpperCase()===typePrompt.textContent){state.score++;$("#type-score").textContent=String(state.score).padStart(3,"0");$("#type-message").textContent="GOOD / NEXT";next()}});
  typeInput.disabled=true;
}
})();