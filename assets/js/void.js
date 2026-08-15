(() => {
  "use strict";

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /*
   * VOID FIELD ENGINE
   *
   * The hero intentionally has a dependency-free Canvas 2D renderer.
   * This is the reliable visual layer: it will render even if a remote
   * Three.js CDN is unavailable. Three.js remains available to the page
   * for the rest of the project, while VOID's star/space field uses the
   * lighter 2D approach shown in the supplied reference.
   */
  const canvas = $("#void-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const state = {
    w: 1, h: 1, dpr: 1,
    running: true,
    t: 0,
    last: performance.now(),
    energy: .34,
    gravity: 1.2,
    collapse: 0,
    pulse: 0,
    pointer: { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, cx: 0, cy: 0, pcx: 0, pcy: 0, active: false, down: false },
    stars: [],
    bursts: [],
    release: null
  };

  const count = Math.min(window.innerWidth < 700 ? 520 : 1050, 1200);
  const star = () => ({
    x: (Math.random() - .5) * 2,
    y: (Math.random() - .5) * 2,
    z: Math.random(),
    pz: Math.random(),
    size: .35 + Math.random() * 1.45,
    phase: Math.random() * Math.PI * 2,
    drift: .0002 + Math.random() * .0008,
    orbit: (Math.random() - .5) * .002,
    vx: 0, vy: 0
  });
  for (let i = 0; i < count; i++) state.stars.push(star());

  function resize() {
    const r = canvas.getBoundingClientRect();
    state.w = Math.max(1, r.width);
    state.h = Math.max(1, r.height);
    state.pointer.cx = state.w * .5;
    state.pointer.cy = state.h * .5;
    state.pointer.pcx = state.pointer.cx;
    state.pointer.pcy = state.pointer.cy;
    state.dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2);
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  function pointer(e) {
    const r = canvas.getBoundingClientRect();
    const cx = clamp(e.clientX - r.left, 0, r.width);
    const cy = clamp(e.clientY - r.top, 0, r.height);
    const x = (cx / r.width - .5) * 2;
    const y = -((cy / r.height - .5) * 2);
    state.pointer.vx = x - state.pointer.x;
    state.pointer.vy = y - state.pointer.y;
    state.pointer.px = state.pointer.x;
    state.pointer.py = state.pointer.y;
    state.pointer.pcx = state.pointer.cx;
    state.pointer.pcy = state.pointer.cy;
    state.pointer.x = x;
    state.pointer.y = y;
    state.pointer.cx = cx;
    state.pointer.cy = cy;
    state.pointer.active = true;
  }

  canvas.addEventListener("pointermove", pointer, { passive: true });
  canvas.addEventListener("pointerenter", () => state.pointer.active = true);
  canvas.addEventListener("pointerleave", () => { if (!state.pointer.down) state.pointer.active = false; });
  canvas.addEventListener("pointerdown", e => {
    pointer(e);
    canvas.setPointerCapture?.(e.pointerId);
    state.pointer.down = true;
    state.pointer.active = true;
    burst(1.25, state.pointer.x, state.pointer.y);
    document.body.dataset.cursorMode = "drag";
  });
  window.addEventListener("pointerup", () => {
    if (state.pointer.down) {
      // Holding = magnet. Releasing = stored kinetic energy is expelled
      // from the exact point where the magnet was held.
      state.release = { x: state.pointer.cx, y: state.pointer.cy, life: 1, power: 1 };
      burst(1.15, state.pointer.x, state.pointer.y);
    }
    state.pointer.down = false;
    if (document.body.dataset.cursorMode === "drag") delete document.body.dataset.cursorMode;
  });

  function burst(power = 1, x = 0, y = 0) {
    state.pulse = Math.max(state.pulse, power);
    state.energy = clamp(state.energy + .14 * power, 0, 1);
    state.bursts.push({ x, y, r: .08, life: 1, power });
  }

  function collapseField(originX = 0, originY = 0, sourceButton = null) {
    state.collapse = 1;
    state.energy = .98;
    state.pointer.active = true;
    state.pointer.cx = state.w * (.5 + originX * .5);
    state.pointer.cy = state.h * (.5 - originY * .5);
    state.pointer.x = originX;
    state.pointer.y = originY;
    burst(2.8, originX, originY);

    if (sourceButton) {
      const label = sourceButton.querySelector('span');
      if (label) {
        label.textContent = 'COLLAPSING FIELD';
        sourceButton.classList.add('is-active');
      }
    }

    setTimeout(() => {
      state.collapse = 0;
      state.release = { x: state.pointer.cx, y: state.pointer.cy, life: 1.25, power: 1.5 };
      burst(3.4, originX, originY);
      if (sourceButton) {
        const label = sourceButton.querySelector('span');
        if (label) label.textContent = 'TRIGGER COLLAPSE';
        sourceButton.classList.remove('is-active');
      }
    }, reduced ? 260 : 720);
  }

  $("#void-pulse")?.addEventListener("click", () => burst(1.45, state.pointer.x, state.pointer.y));
  $("#void-collapse")?.addEventListener("click", () => burst(2.0, state.pointer.x, state.pointer.y));
  $("#void-hero-pulse")?.addEventListener("click", (e) => {
    // Hero CTA becomes a real field event: pull the whole field into a
    // temporary singularity, then release the stored energy outward.
    collapseField(0, 0, e.currentTarget);
  });

  function drawBackground() {
    ctx.clearRect(0, 0, state.w, state.h);
    const g = ctx.createRadialGradient(state.w * .5, state.h * .5, 0, state.w * .5, state.h * .5, Math.max(state.w, state.h) * .72);
    g.addColorStop(0, "rgba(16,16,16,.42)");
    g.addColorStop(.42, "rgba(5,5,5,.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, state.w, state.h);
  }

  function drawGrid() {
    const step = Math.max(42, Math.min(64, state.w / 18));
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,.025)";
    for (let x = 0; x <= state.w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.h); ctx.stroke();
    }
    for (let y = 0; y <= state.h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.w, y); ctx.stroke();
    }
  }

  function drawCore() {
    // No opaque/black UI circles: the field itself remains visible underneath.
    // A tiny luminous point marks the system origin without becoming a visual object.
    const cx = state.w * .5, cy = state.h * .5;
    const pulse = state.pulse;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(state.w, state.h) * .09);
    glow.addColorStop(0, `rgba(255,255,255,${.12 + pulse * .10})`);
    glow.addColorStop(.2, "rgba(255,255,255,.025)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(state.w, state.h) * .09, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.beginPath(); ctx.arc(cx, cy, 1.5 + pulse * 1.8, 0, Math.PI * 2); ctx.fill();
  }

  function drawStars(dt) {
    const cx = state.w * .5;
    const cy = state.h * .5;
    const speed = (state.pointer.down ? .12 : .045) + state.energy * .035;
    const touchX = state.pointer.cx;
    const touchY = state.pointer.cy;

    for (const s of state.stars) {
      s.pz = s.z;
      if (!reduced) s.z -= dt * .00032 * speed * 60;
      s.x += s.orbit * dt * 60;
      s.y += Math.sin(state.t * .00025 + s.phase) * .000012;

      if (s.z < .02) Object.assign(s, star(), { z: 1, pz: 1 });

      const spread = state.collapse ? .34 : 1;
      let sx = cx + s.x * state.w * .43 * spread;
      let sy = cy + s.y * state.h * .46 * spread;
      let px = cx + s.x * state.w * .43 * spread;
      let py = cy + s.y * state.h * .46 * spread;

      // Local gravity well: the field reacts exactly where the pointer/touch is.
      // Near objects are pulled strongly toward the touch point; farther objects
      // receive a subtle radial bend so the whole field feels continuous.
      if (state.pointer.active) {
        const dx = touchX - sx;
        const dy = touchY - sy;
        const dist = Math.hypot(dx, dy);
        const radius = Math.min(state.w, state.h) * (state.pointer.down ? .34 : .22);
        if (dist < radius) {
          const falloff = Math.pow(1 - dist / radius, 2);
          const pull = (state.pointer.down ? .18 : .075) * falloff * (1.15 - s.z);
          sx += dx * pull;
          sy += dy * pull;
          px += (touchX - px) * pull * .42;
          py += (touchY - py) * pull * .78;
        }

        // Pointer velocity sends a local wave through nearby stars.
        const speedKick = Math.min(1.15, Math.hypot(state.pointer.vx, state.pointer.vy) * 3.2);
        if (speedKick > .02 && dist < radius * 1.15) {
          const wave = Math.pow(1 - dist / (radius * 1.15), 2) * speedKick * .9;
          sx += state.pointer.vx * state.w * .022 * wave;
          sy -= state.pointer.vy * state.h * .022 * wave;
        }
      }

      // Stored kinetic motion from the release event. It decays slowly so the
      // field feels massive rather than twitchy.
      if (s.vx || s.vy) {
        sx += s.vx * state.w * dt;
        sy += s.vy * state.h * dt;
        s.vx *= Math.pow(.045, dt);
        s.vy *= Math.pow(.045, dt);
      }

      if (state.release && state.release.life > 0) {
        const rx = state.release.x, ry = state.release.y;
        const dx = sx - rx, dy = sy - ry;
        const d = Math.hypot(dx, dy) || 1;
        const radius = Math.min(state.w, state.h) * .42;
        if (d < radius) {
          const falloff = Math.pow(1 - d / radius, 2);
          const kick = .32 * falloff * (1.25 - s.z);
          s.vx += (dx / d) * kick;
          s.vy += (dy / d) * kick;
        }
      }

      const size = s.size * (1.7 - s.z) * (state.pointer.active ? 1.08 : 1);
      const alpha = clamp(.12 + (1 - s.z) * .7, .08, .82);

      if (s.z < .78 && !reduced) {
        ctx.strokeStyle = `rgba(255,255,255,${alpha * .18})`;
        ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
      }

      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawBursts(dt) {
    for (const b of state.bursts) {
      b.r += dt * (.65 + b.power * .55);
      b.life -= dt * (.6 + b.power * .15);
      const cx = state.w * (.5 + b.x * .5);
      const cy = state.h * (.5 - b.y * .5);
      const radius = b.r * Math.min(state.w, state.h);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, b.life) * .34})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    state.bursts = state.bursts.filter(b => b.life > 0);
  }

  function frame(t) {
    if (!state.running) return;
    const dt = Math.min(.04, (t - state.last) / 1000 || .016);
    state.last = t;
    state.t = t;

    state.energy += ((state.pointer.active ? .38 : .28) - state.energy) * dt * .8;
    state.gravity = state.pointer.active ? 2.4 + state.energy * 3.8 : 1.2;
    state.pulse *= Math.pow(.035, dt);
    if (state.release) { state.release.life -= dt * .9; if (state.release.life <= 0) state.release = null; }

    drawBackground();
    drawGrid();
    drawStars(dt);
    drawBursts(dt);
    drawCore();

    updateUI();
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(entries => {
    state.running = entries[0]?.isIntersecting ?? true;
    if (state.running) {
      state.last = performance.now();
      requestAnimationFrame(frame);
    }
  }, { threshold: .01 });
  observer.observe(canvas);
  requestAnimationFrame(frame);

  /* Event Horizon: intentionally dependency-free canvas. */
  const mini = $("#void-mini-canvas");
  if (mini) {
    const mctx = mini.getContext("2d");
    let mw = 1, mh = 1, mt = 0;
    function miniSize() {
      const r = mini.getBoundingClientRect();
      const d = Math.min(devicePixelRatio || 1, 1.5);
      mw = Math.max(1, r.width); mh = Math.max(1, r.height);
      mini.width = Math.floor(mw * d); mini.height = Math.floor(mh * d);
      mctx.setTransform(d, 0, 0, d, 0, 0);
    }
    miniSize(); window.addEventListener("resize", miniSize, { passive: true });
    function loop() {
      mt += .016;
      mctx.clearRect(0, 0, mw, mh);
      mctx.fillStyle = "#030303"; mctx.fillRect(0, 0, mw, mh);
      const cx = mw / 2, cy = mh / 2;
      mctx.strokeStyle = "rgba(255,255,255,.04)";
      for (let x = 0; x < mw; x += 48) { mctx.beginPath(); mctx.moveTo(x,0); mctx.lineTo(x,mh); mctx.stroke(); }
      for (let y = 0; y < mh; y += 48) { mctx.beginPath(); mctx.moveTo(0,y); mctx.lineTo(mw,y); mctx.stroke(); }
      for (let i = 0; i < 55; i++) {
        const a = mt * (.08 + i * .0008) + i * .62;
        const rr = 25 + (i % 12) * Math.min(mw,mh) * .025;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .62;
        mctx.fillStyle = i % 8 === 0 ? "#fff" : "rgba(255,255,255,.42)";
        mctx.beginPath(); mctx.arc(x,y,i%8===0?2:1,0,Math.PI*2); mctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* BUILD PRESSURE / CLEAN PHYSICS FIELD
   * Rebuilt from scratch: five free bodies + a restrained particle field.
   * Static Matter.js walls guarantee that no ball can ever leave the canvas.
   * Pointer/touch creates local repulsion; holding keeps releasing pressure.
   */
  const matterCanvas = $("#matter-canvas");
  if (matterCanvas && window.Matter) {
    const mctx = matterCanvas.getContext("2d");
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 }, enableSleeping: false });
    const world = engine.world;
    const particles = [];
    const balls = [];
    const bursts = [];
    let walls = [];
    let mw = 1, mh = 1, md = 1;
    let lastTime = performance.now();
    const pointer = { x:0, y:0, px:0, py:0, vx:0, vy:0, active:false, down:false };
    const BALL_COUNT = 5;
    const PARTICLE_COUNT = window.innerWidth < 700 ? 34 : 62;

    function resizeMatter() {
      const r = matterCanvas.getBoundingClientRect();
      mw = Math.max(1, r.width);
      mh = Math.max(1, r.height);
      md = Math.min(window.devicePixelRatio || 1, 1.5);
      matterCanvas.width = Math.floor(mw * md);
      matterCanvas.height = Math.floor(mh * md);
      mctx.setTransform(md, 0, 0, md, 0, 0);

      // Rebuild four true collision walls whenever the canvas changes size.
      // Their thickness lives outside the visible canvas, so they never show.
      if (walls.length) Matter.World.remove(world, walls);
      const t = 40;
      walls = [
        Matter.Bodies.rectangle(mw/2, -t/2, mw + t*2, t, { isStatic:true, label:"top-wall" }),
        Matter.Bodies.rectangle(mw/2, mh + t/2, mw + t*2, t, { isStatic:true, label:"bottom-wall" }),
        Matter.Bodies.rectangle(-t/2, mh/2, t, mh + t*2, { isStatic:true, label:"left-wall" }),
        Matter.Bodies.rectangle(mw + t/2, mh/2, t, mh + t*2, { isStatic:true, label:"right-wall" })
      ];
      Matter.World.add(world, walls);

      // Keep every existing object inside the newly measured bounds after resize.
      [...particles, ...balls].forEach(b => {
        const r = b.circleRadius || 1;
        Matter.Body.setPosition(b, {
          x: clamp(b.position.x, r + 2, mw - r - 2),
          y: clamp(b.position.y, r + 2, mh - r - 2)
        });
      });
    }

    function randomPosition(radius, spread=.82) {
      return {
        x: clamp(mw/2 + (Math.random()-.5) * mw * spread, radius+8, mw-radius-8),
        y: clamp(mh/2 + (Math.random()-.5) * mh * spread, radius+8, mh-radius-8)
      };
    }

    function makeParticle(i) {
      const r = 1.1 + Math.random() * 1.35;
      const pos = randomPosition(r, .9);
      return Matter.Bodies.circle(pos.x, pos.y, r, {
        frictionAir: .028,
        restitution: .58,
        friction: 0,
        density: .0005,
        label: `field-particle-${i}`
      });
    }

    function makeBall(i) {
      const r = 12 + (i % 2) * 3;
      const pos = randomPosition(r, .72);
      return Matter.Bodies.circle(pos.x, pos.y, r, {
        frictionAir: .014,
        restitution: .88,
        friction: 0,
        density: .0011,
        label: `pressure-ball-${i}`
      });
    }

    for (let i=0;i<PARTICLE_COUNT;i++) particles.push(makeParticle(i));
    for (let i=0;i<BALL_COUNT;i++) balls.push(makeBall(i));
    Matter.World.add(world, [...particles, ...balls]);
    resizeMatter();
    window.addEventListener("resize", resizeMatter, { passive:true });

    function localPoint(e) {
      const r = matterCanvas.getBoundingClientRect();
      return {
        x: clamp(e.clientX-r.left, 0, r.width),
        y: clamp(e.clientY-r.top, 0, r.height)
      };
    }

    function pressureAt(x, y, power=1) {
      const radius = Math.min(mw,mh) * .27;
      bursts.push({ x, y, r:5, life:1, power });
      for (const body of [...particles, ...balls]) {
        const dx = body.position.x-x;
        const dy = body.position.y-y;
        const d = Math.hypot(dx,dy) || 1;
        if (d > radius) continue;
        const fall = Math.pow(1-d/radius, 2);
        // Gentle continuous pressure. Balls receive slightly more momentum.
        const strength = (body.label.startsWith("pressure-ball") ? .00072 : .00032) * power * fall;
        Matter.Body.applyForce(body, body.position, { x:dx/d*strength, y:dy/d*strength });
      }
    }

    function hitBalls(x,y,vx,vy) {
      const speed = Math.hypot(vx,vy);
      if (speed < .25) return;
      balls.forEach(ball => {
        const dx = ball.position.x-x, dy = ball.position.y-y;
        const d = Math.hypot(dx,dy) || 1;
        const hitRadius = ball.circleRadius + 14;
        if (d <= hitRadius) {
          const transfer = clamp(speed * .0028, .0008, .012);
          Matter.Body.applyForce(ball, ball.position, { x:vx*transfer, y:vy*transfer });
        }
      });
    }

    matterCanvas.addEventListener("pointermove", e => {
      const pt = localPoint(e);
      pointer.vx = pt.x-pointer.x;
      pointer.vy = pt.y-pointer.y;
      pointer.px = pointer.x; pointer.py = pointer.y;
      pointer.x = pt.x; pointer.y = pt.y; pointer.active = true;
      hitBalls(pt.x,pt.y,pointer.vx,pointer.vy);
      if (pointer.down) pressureAt(pt.x,pt.y,.34);
    }, { passive:true });

    matterCanvas.addEventListener("pointerenter", e => {
      const pt=localPoint(e); pointer.x=pt.x; pointer.y=pt.y; pointer.active=true;
    });
    matterCanvas.addEventListener("pointerleave", () => {
      if (!pointer.down) pointer.active=false;
    });
    matterCanvas.addEventListener("pointerdown", e => {
      const pt=localPoint(e);
      pointer.x=pt.x; pointer.y=pt.y; pointer.px=pt.x; pointer.py=pt.y;
      pointer.vx=0; pointer.vy=0; pointer.active=true; pointer.down=true;
      matterCanvas.setPointerCapture?.(e.pointerId);
      pressureAt(pt.x,pt.y,1.25);
      hitBalls(pt.x,pt.y,0,0);
    });
    window.addEventListener("pointerup", () => pointer.down=false);

    function resetMatter() {
      [...particles,...balls].forEach((b,i) => {
        const radius=b.circleRadius||1;
        const pos=randomPosition(radius, b.label.startsWith("pressure-ball") ? .72 : .9);
        Matter.Body.setPosition(b,pos);
        Matter.Body.setVelocity(b,{x:0,y:0});
        Matter.Body.setAngularVelocity(b,0);
        Matter.Body.setAngle(b,0);
      });
      bursts.length=0;
    }
    $("#matter-reset")?.addEventListener("click", resetMatter);

    // Keep every body mathematically inside the visible canvas even if an
    // extreme impulse manages to penetrate a wall by a tiny amount.
    function hardContain(body) {
      const r=body.circleRadius||1;
      let x=body.position.x, y=body.position.y, vx=body.velocity.x, vy=body.velocity.y;
      if (x < r) { x=r; if(vx<0) vx=-vx*.72; }
      if (x > mw-r) { x=mw-r; if(vx>0) vx=-vx*.72; }
      if (y < r) { y=r; if(vy<0) vy=-vy*.72; }
      if (y > mh-r) { y=mh-r; if(vy>0) vy=-vy*.72; }
      if (x!==body.position.x || y!==body.position.y) Matter.Body.setPosition(body,{x,y});
      if (vx!==body.velocity.x || vy!==body.velocity.y) Matter.Body.setVelocity(body,{x:vx,y:vy});
    }

    function drawBurst() {
      for(let i=bursts.length-1;i>=0;i--) {
        const b=bursts[i];
        b.r += 5.5; b.life -= .045;
        if(b.life<=0){bursts.splice(i,1);continue;}
        mctx.beginPath();
        mctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        mctx.strokeStyle=`rgba(255,255,255,${b.life*.22})`;
        mctx.lineWidth=1;
        mctx.stroke();
      }
    }

    function matterLoop(now=performance.now()) {
      const dt = clamp((now-lastTime)/16.666, .5, 1.5);
      lastTime=now;

      // Tiny ambient drift prevents the field from feeling frozen.
      particles.forEach((b,i)=>Matter.Body.applyForce(b,b.position,{
        x:Math.sin(i*2.17+now*.00025)*.000008,
        y:Math.cos(i*1.71+now*.00022)*.000008
      }));

      if(pointer.down) pressureAt(pointer.x,pointer.y,.18*dt);

      Matter.Engine.update(engine, 16.666*dt);
      [...particles,...balls].forEach(hardContain);

      mctx.clearRect(0,0,mw,mh);
      mctx.fillStyle="#030303"; mctx.fillRect(0,0,mw,mh);

      // restrained technical grid
      mctx.strokeStyle="rgba(255,255,255,.035)"; mctx.lineWidth=1;
      const grid=48;
      for(let x=0;x<=mw;x+=grid){mctx.beginPath();mctx.moveTo(x,0);mctx.lineTo(x,mh);mctx.stroke();}
      for(let y=0;y<=mh;y+=grid){mctx.beginPath();mctx.moveTo(0,y);mctx.lineTo(mw,y);mctx.stroke();}
      drawBurst();

      particles.forEach((b,i)=>{
        const speed=Math.hypot(b.velocity.x,b.velocity.y);
        mctx.fillStyle=i%8===0?"rgba(255,255,255,.78)":"rgba(255,255,255,.28)";
        mctx.beginPath();
        mctx.arc(b.position.x,b.position.y,Math.min(2.2,1.05+speed*2),0,Math.PI*2);
        mctx.fill();
      });

      balls.forEach((b,i)=>{
        const speed=Math.hypot(b.velocity.x,b.velocity.y);
        // Clean physical objects: no center marker, no orbit/ring decoration.
        mctx.beginPath();
        mctx.arc(b.position.x,b.position.y,b.circleRadius,0,Math.PI*2);
        mctx.fillStyle=`rgba(255,255,255,${.045+Math.min(.09,speed*.015)})`;
        mctx.fill();
        mctx.strokeStyle=`rgba(255,255,255,${.62+Math.min(.28,speed*.035)})`;
        mctx.lineWidth=1;
        mctx.stroke();
      });

      requestAnimationFrame(matterLoop);
    }
    requestAnimationFrame(matterLoop);

    $("#void-pulse")?.addEventListener("click",()=>{
      pressureAt(pointer.active?pointer.x:mw/2,pointer.active?pointer.y:mh/2,1.1);
    });
    $("#void-collapse")?.addEventListener("click",()=>{
      // Pressure button = one clean, stronger local release, not a central ball.
      pressureAt(pointer.active?pointer.x:mw/2,pointer.active?pointer.y:mh/2,2.0);
    });
  }

  function updateUI(){
    const particleOut=$("#void-particles"),energyOut=$("#void-energy"),gravityOut=$("#void-gravity"),fieldState=$("#void-field-state"),miniState=$("#mini-field-state"),metric=$("#metric-particles");
    if(particleOut) particleOut.textContent=String(count).padStart(4,"0");
    if(energyOut) energyOut.textContent=Math.round(state.energy*100)+"%";
    if(gravityOut) gravityOut.textContent=state.gravity.toFixed(1);
    if(fieldState) fieldState.textContent=state.collapse?"COLLAPSING":(state.pointer.active?"RESPONDING":"ACTIVE");
    if(miniState) miniState.textContent=state.pointer.active?"02 / FOLLOWING":"01 / LISTENING";
    if(metric) metric.textContent=count.toLocaleString();
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".void-reveal").forEach(el=>gsap.fromTo(el,{y:60,opacity:0},{y:0,opacity:1,duration:1,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 84%",once:true}}));
  }
})();
