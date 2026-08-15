(() => {
"use strict";
const $ = s => document.querySelector(s);


/* SYSTEM BREACH — unique Play mode (not duplicated from Lab) */
const breachStart = $("#breach-start"), breachSubmit = $("#breach-submit"), breachInput = $("#breach-input");
if (breachStart && breachSubmit && breachInput) {
  const seq = $("#breach-sequence"), msg = $("#breach-message"), scoreEl = $("#breach-score");
  let answer = "", score = 0;
  function nextBreach() {
    const a = 2 + Math.floor(Math.random() * 7), b = 1 + Math.floor(Math.random() * 6), c = (a + b) % 10;
    answer = `${a}${b}${c}`; seq.textContent = `${a}  ${b}  ?`; breachInput.value = ""; breachInput.focus(); msg.textContent = "RULE: THIRD DIGIT = FIRST + SECOND, MODULO 10.";
  }
  breachStart.addEventListener("click", () => { score = 0; scoreEl.textContent = "000"; nextBreach(); });
  function checkBreach() { if (breachInput.value === answer) { score++; scoreEl.textContent = String(score).padStart(3,"0"); msg.textContent = "ACCESS GRANTED / NEXT NODE"; setTimeout(nextBreach, 350); } else { score = Math.max(0, score - 1); scoreEl.textContent = String(score).padStart(3,"0"); msg.textContent = "DENIED / TRACE THE RULE"; } }
  breachSubmit.addEventListener("click", checkBreach); breachInput.addEventListener("keydown", e => { if (e.key === "Enter") checkBreach(); });
}

/* GRAVITY — unique Play mode (not duplicated from Lab) */
const gravityCanvas = $("#gravity-canvas"), gravityReset = $("#gravity-reset");
if (gravityCanvas && gravityReset) {
  const ctx = gravityCanvas.getContext("2d"), msg = $("#gravity-message"), scoreEl = $("#gravity-score");
  let w=1,h=1,d=1,drag=false,ball={x:0,y:0,vx:0,vy:0},start={x:0,y:0},score=0,bodies=[];
  function resizeGravity(){ const r=gravityCanvas.getBoundingClientRect(); w=Math.max(1,r.width);h=Math.max(1,r.height);d=Math.min(devicePixelRatio||1,2);gravityCanvas.width=w*d;gravityCanvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);bodies=[.25,.5,.75].map((v,i)=>({x:w*v,y:h*(i%2?.68:.32),r:12+i*4}));if(!drag)ball={x:w*.12,y:h*.5,vx:0,vy:0}; }
  resizeGravity(); addEventListener("resize",resizeGravity,{passive:true});
  gravityCanvas.addEventListener("pointerdown",e=>{drag=true;start={x:e.offsetX,y:e.offsetY};ball={x:start.x,y:start.y,vx:0,vy:0};msg.textContent="RELEASE TO LAUNCH";gravityCanvas.setPointerCapture?.(e.pointerId)});
  gravityCanvas.addEventListener("pointermove",e=>{if(drag){ball.x=e.offsetX;ball.y=e.offsetY}});
  gravityCanvas.addEventListener("pointerup",e=>{if(!drag)return;drag=false;ball.vx=(start.x-e.offsetX)*.032;ball.vy=(start.y-e.offsetY)*.032;msg.textContent="NAVIGATE THE FIELD";gravityCanvas.releasePointerCapture?.(e.pointerId)});
  gravityReset.addEventListener("click",()=>{score=0;scoreEl.textContent="000";resizeGravity();msg.textContent="DRAG TO LAUNCH"});
  function gravityLoop(){
    ctx.clearRect(0,0,w,h);ctx.strokeStyle="rgba(255,255,255,.055)";
    for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()} for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    bodies.forEach(b=>{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.stroke();if(!drag){const dx=b.x-ball.x,dy=b.y-ball.y,dist2=Math.max(100,dx*dx+dy*dy),f=520/dist2;ball.vx+=dx*f*.72;ball.vy+=dy*f*.72}});
    if(!drag){ball.x+=ball.vx*.82;ball.y+=ball.vy*.82;ball.vx*=.997;ball.vy*=.997}
    if(ball.x<0||ball.x>w||ball.y<0||ball.y>h){score++;scoreEl.textContent=String(score).padStart(3,"0");ball={x:w*.12,y:h*.5,vx:0,vy:0};msg.textContent="FIELD CLEARED / LAUNCH AGAIN"}
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(ball.x,ball.y,6,0,Math.PI*2);ctx.fill();requestAnimationFrame(gravityLoop);
  }
  gravityLoop();
}

/* NEON RACING */
const raceCanvas = $("#race-canvas"), raceStart = $("#race-start");
if (raceCanvas && raceStart) {
  const ctx = raceCanvas.getContext("2d");
  let w = 1, h = 1, d = 1, running = false, raf = 0, last = 0, startAt = 0;
  let car = { x: 0, lane: 1 }, speed = 0, distance = 0;
  let obstacles = [], sparks = [];
  const keys = {};

  function resize() {
    const r = raceCanvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height); d = Math.min(devicePixelRatio || 1, 2);
    raceCanvas.width = Math.floor(w * d); raceCanvas.height = Math.floor(h * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    car.x = w * .5; car.lane = 1;
  }
  resize(); addEventListener("resize", resize, { passive: true });
  addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; if (["arrowleft","arrowright","a","d"," "].includes(e.key.toLowerCase())) e.preventDefault(); });
  addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

  function laneX(lane) { return w * (.26 + lane * .24); }
  function reset() {
    running = true; distance = 0; speed = 8; obstacles = []; sparks = []; last = performance.now(); startAt = last;
    car = { x: laneX(1), lane: 1 }; $("#race-score").textContent = "000"; $("#race-message").textContent = "STEER / SURVIVE / 30 SEC";
  }
  function spawnObstacle() {
    const lane = Math.floor(Math.random() * 3);
    obstacles.push({ lane, y: -55, w: 34 + Math.random() * 20, h: 48 + Math.random() * 24, drift: (Math.random() - .5) * .3 });
  }
  function crash() {
    running = false;
    const score = Math.floor(distance);
    $("#race-score").textContent = String(score).padStart(3, "0");
    $("#race-message").textContent = `CRASH / ${String(score).padStart(3, "0")}`;
  }
  function drawRoad(t) {
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, w, h);
    const roadL = w * .14, roadR = w * .86;
    ctx.fillStyle = "rgba(255,255,255,.035)"; ctx.fillRect(roadL, 0, roadR - roadL, h);
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(roadL, 0); ctx.lineTo(roadL, h); ctx.moveTo(roadR, 0); ctx.lineTo(roadR, h); ctx.stroke();
    const offset = (t * speed * .06) % 70;
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    for (let lane = 1; lane < 3; lane++) {
      const x = w * (.14 + lane * .24);
      for (let y = -70 + offset; y < h + 70; y += 70) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 32); ctx.stroke(); }
    }
    for (let i = 0; i < 26; i++) {
      const x = (i * 71) % Math.max(1, w), y = (i * 43 + t * .04) % h;
      ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(x, y, 1, 1);
    }
  }
  function loop(t) {
    drawRoad(t);
    if (running) {
      if (keys.arrowleft || keys.a) car.x -= 5.2;
      if (keys.arrowright || keys.d) car.x += 5.2;
      car.x = Math.max(w * .17, Math.min(w * .83, car.x));
      speed = Math.min(15, speed + .0018);
      distance += speed * .006;
      if (t - last > Math.max(330, 760 - speed * 30)) { spawnObstacle(); last = t; }
      obstacles.forEach(o => { o.y += speed; o.x = laneX(o.lane) + o.drift * (o.y + 50); });
      obstacles = obstacles.filter(o => o.y < h + 80);
      for (const o of obstacles) {
        ctx.fillStyle = "#fff"; ctx.fillRect(laneX(o.lane) - o.w / 2, o.y, o.w, o.h);
        ctx.fillStyle = "#080808"; ctx.fillRect(laneX(o.lane) - o.w * .28, o.y + 8, o.w * .56, 5);
        if (Math.abs(laneX(o.lane) - car.x) < 25 && o.y + o.h > h - 82 && o.y < h - 20) crash();
      }
      const elapsed = (t - startAt) / 1000;
      const score = Math.floor(distance);
      $("#race-score").textContent = String(Math.min(999, score)).padStart(3, "0");
      if (elapsed >= 30) { running = false; $("#race-message").textContent = `FINISH / ${String(score).padStart(3, "0")}`; }
    }
    const carY = h - 68;
    ctx.save(); ctx.translate(car.x, carY);
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(17, 19); ctx.lineTo(0, 12); ctx.lineTo(-17, 19); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#080808"; ctx.fillRect(-6, -5, 12, 15); ctx.restore();
    raf = requestAnimationFrame(loop);
  }
  raceStart.addEventListener("click", reset); requestAnimationFrame(loop);
}

/* SPACE SHOOTER */
const shooterCanvas = $("#shooter-canvas"), shooterStart = $("#shooter-start");
if (shooterCanvas && shooterStart) {
  const ctx = shooterCanvas.getContext("2d");
  let w = 1, h = 1, d = 1, running = false, raf = 0, last = 0, startAt = 0;
  let player = { x: 0, y: 0 }, bullets = [], enemies = [], score = 0, cooldown = 0;
  const keys = {};
  const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: .2 + Math.random() * .9 }));
  function resize() { const r = shooterCanvas.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); d = Math.min(devicePixelRatio || 1, 2); shooterCanvas.width = Math.floor(w*d); shooterCanvas.height = Math.floor(h*d); ctx.setTransform(d,0,0,d,0,0); player.x = w/2; player.y = h-42; }
  resize(); addEventListener("resize", resize, { passive:true });
  addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; if (["arrowleft","arrowright","arrowup","arrowdown","a","d","w","s"," "].includes(e.key.toLowerCase())) e.preventDefault(); });
  addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
  shooterCanvas.addEventListener("pointermove", e => { if (!running) return; const r = shooterCanvas.getBoundingClientRect(); player.x = e.clientX-r.left; player.y = e.clientY-r.top; });
  shooterCanvas.addEventListener("pointerdown", () => { if (running) fire(); });
  function fire() { if (cooldown > 0) return; bullets.push({ x: player.x, y: player.y-16, v: 8 }); cooldown = 110; }
  function reset() { running=true; score=0; bullets=[]; enemies=[]; cooldown=0; last=performance.now(); startAt=last; player={x:w/2,y:h-42}; $("#shooter-score").textContent="000"; $("#shooter-message").textContent="WASD / ARROWS + SPACE"; }
  function spawnEnemy() { enemies.push({ x: 25+Math.random()*(w-50), y:-20, r:9+Math.random()*8, v:1.2+Math.random()*1.7, phase:Math.random()*6.28 }); }
  function loop(t) {
    ctx.fillStyle="#030303"; ctx.fillRect(0,0,w,h);
    for(const s of stars){s.y=(s.y+s.s*.0015)%1;ctx.fillStyle=`rgba(255,255,255,${.15+s.s*.35})`;ctx.fillRect(s.x*w,s.y*h,1,1)}
    if(running){
      if(keys.arrowleft||keys.a)player.x-=4.5;if(keys.arrowright||keys.d)player.x+=4.5;if(keys.arrowup||keys.w)player.y-=4.5;if(keys.arrowdown||keys.s)player.y+=4.5;player.x=Math.max(18,Math.min(w-18,player.x));player.y=Math.max(35,Math.min(h-20,player.y));if(keys[" "])fire();
      if(t-last>520){spawnEnemy();last=t} cooldown=Math.max(0,cooldown-16);
      bullets.forEach(b=>b.y-=b.v); bullets=bullets.filter(b=>b.y>-30);
      enemies.forEach(e=>{e.y+=e.v;e.x+=Math.sin(t*.002+e.phase)*.55});
      for(const b of bullets){for(const e of enemies){if(Math.hypot(b.x-e.x,b.y-e.y)<e.r+4){e.dead=true;b.dead=true;score++;$("#shooter-score").textContent=String(score).padStart(3,"0")}}}
      enemies=enemies.filter(e=>!e.dead&&e.y<h+30);
      if(enemies.some(e=>Math.hypot(e.x-player.x,e.y-player.y)<e.r+14)){running=false;$("#shooter-message").textContent=`HULL BREACH / ${String(score).padStart(3,"0")}`}
      if((t-startAt)/1000>=30){running=false;$("#shooter-message").textContent=`SECTOR CLEAR / ${String(score).padStart(3,"0")}`}
    }
    for(const b of bullets){ctx.strokeStyle="#fff";ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x,b.y+10);ctx.stroke()}
    for(const e of enemies){ctx.strokeStyle="#fff";ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(e.x-e.r*.7,e.y);ctx.lineTo(e.x+e.r*.7,e.y);ctx.stroke()}
    ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(player.x,player.y-14);ctx.lineTo(player.x+13,player.y+11);ctx.lineTo(player.x,player.y+5);ctx.lineTo(player.x-13,player.y+11);ctx.closePath();ctx.fill();
    raf=requestAnimationFrame(loop);
  }
  shooterStart.addEventListener("click",reset); requestAnimationFrame(loop);
}

/* TYPING SPEED TEST */
const typingStart = $("#typing-start"), typingInput = $("#typing-input"), typingPrompt = $("#typing-prompt");
if (typingStart && typingInput && typingPrompt) {
  const prompts = [
    "BUILD SYSTEMS THAT RESPOND",
    "MOTION TURNS INTERFACE INTO SIGNAL",
    "MAKE THE SCREEN FEEL ALIVE",
    "DESIGN FOR CURIOSITY AND SPEED",
    "EVERY INPUT CHANGES THE SYSTEM"
  ];
  let active=false, started=0, timer=30, tick=null, words=0, chars=0;
  function nextPrompt(){typingPrompt.textContent=prompts[Math.floor(Math.random()*prompts.length)];typingInput.value="";typingInput.focus()}
  function finish(){active=false;clearInterval(tick);typingInput.disabled=true;const elapsed=Math.max(1,(Date.now()-started)/60000);const wpm=Math.round((chars/5)/elapsed);$("#typing-score").textContent=String(Math.min(999,wpm)).padStart(3,"0");$("#typing-message").textContent=`TIME / ${timer}s  •  ${wpm} WPM  •  ${words} LINES`}
  typingStart.addEventListener("click",()=>{active=true;timer=30;words=0;chars=0;started=Date.now();typingInput.disabled=false;$("#typing-score").textContent="000";$("#typing-message").textContent="TYPE THE LINE / 30 SEC";nextPrompt();clearInterval(tick);tick=setInterval(()=>{timer--;$("#typing-time").textContent=String(timer).padStart(2,"0");if(timer<=0)finish()},1000);$("#typing-time").textContent="30"});
  typingInput.addEventListener("input",()=>{if(!active)return;const value=typingInput.value.toUpperCase();const target=typingPrompt.textContent;if(value===target){chars+=target.length;words+=target.trim().split(/\s+/).length;$("#typing-message").textContent="CLEAN / NEXT LINE";nextPrompt()}else if(!target.startsWith(value)){$("#typing-message").textContent="CHECK THE SIGNAL"}});
  typingInput.addEventListener("keydown",e=>{if(e.key==="Enter")e.preventDefault()}); typingInput.disabled=true; $("#typing-time").textContent="30";
}
})();
