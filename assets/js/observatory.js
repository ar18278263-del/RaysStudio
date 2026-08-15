(() => {
"use strict";

const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const SYSTEMS = [
  {name:"MERCURY", href:"work.html", r:.78, radius:3.0, mass:0.12, color:1, speed:1},
  {name:"VENUS", href:"services.html", r:1.08, radius:4.0, mass:0.82, color:.82, speed:1},
  {name:"EARTH", href:"about.html", r:1.42, radius:4.5, mass:1.0, color:.95, speed:1},
  {name:"MARS", href:"lab.html", r:1.82, radius:3.7, mass:.16, color:.78, speed:1},
  {name:"JUPITER", href:"void.html", r:2.55, radius:8.0, mass:18, color:.62, speed:1},
  {name:"SATURN", href:"work.html", r:3.28, radius:7.0, mass:12, color:.55, speed:1},
  {name:"URANUS", href:"contact.html", r:3.98, radius:5.2, mass:2.6, color:.5, speed:1},
  {name:"NEPTUNE", href:"index.html", r:4.62, radius:5.0, mass:2.4, color:.46, speed:1}
];

const MODES = {
  orbit: {time: .72, gravity: 1, trail: .18, star:.32, label:"ORBIT", energy:8},
  storm: {time: 2.35, gravity: 1.05, trail: .055, star:.55, label:"STORM", energy:24},
  drift: {time: .24, gravity: .72, trail: .25, star:.22, label:"DRIFT", energy:2},
  void:  {time: .055, gravity: .48, trail: .5, star:.07, label:"VOID", energy:0}
};

function initObservatory(canvas, opts = {}) {
  if (!canvas) return null;
  const stage = canvas.parentElement;
  const interactive = opts.interactive !== false;
  const compact = !!opts.compact;
  const ctx = canvas.getContext("2d", {alpha:true});
  if (!ctx) return null;

  let width = 1, height = 1, dpr = 1, zoom = compact ? .9 : 1;
  let panX = 0, panY = 0, dragging = false, lastX = 0, lastY = 0;
  let mode = "orbit", energy = 42, running = true, lastTime = performance.now();
  let pulse = 0, selected = -1;
  const G = 1;
  const sunMass = 100;
  const bodies = [];
  const stars = Array.from({length: compact ? 90 : 180}, () => ({
    x:Math.random(), y:Math.random(), a:.15+Math.random()*.45, r:.3+Math.random()*1.1
  }));

  // Distances are intentionally stylized; velocity is initialized from the
  // circular-orbit solution v = sqrt(G*M/r), so the system is physically driven.
  SYSTEMS.forEach((p, i) => {
    const angle = i * .72 + .25;
    const r = p.r;
    const v = Math.sqrt(G * sunMass / r);
    bodies.push({
      ...p,
      x:Math.cos(angle)*r,
      y:Math.sin(angle)*r,
      vx:-Math.sin(angle)*v,
      vy: Math.cos(angle)*v,
      angle,
      trail:[]
    });
  });

  function resize(){
    const rect = (stage || canvas).getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(devicePixelRatio || 1, compact ? 1.5 : 2);
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    canvas.style.width = width+"px";
    canvas.style.height = height+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  addEventListener("resize", resize, {passive:true});

  function scale(){
    return Math.min(width,height) * (compact ? .095 : .085) * zoom;
  }
  function screen(x,y){
    const s=scale();
    return [width/2 + panX + x*s, height/2 + panY + y*s];
  }

  function clear(){
    ctx.fillStyle = mode==="void" ? "rgba(5,5,5,.72)" : `rgba(5,5,5,${MODES[mode].trail})`;
    ctx.fillRect(0,0,width,height);
  }

  function drawStars(){
    const cfg=MODES[mode];
    for(const s of stars){
      ctx.globalAlpha=s.a*cfg.star;
      ctx.fillStyle="#fff";
      ctx.beginPath();
      ctx.arc(s.x*width,s.y*height,s.r,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  function drawOrbit(r){
    const [cx,cy]=screen(0,0), rr=r*scale();
    ctx.strokeStyle = mode==="storm" ? "rgba(255,255,255,.24)" : mode==="void" ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.105)";
    ctx.lineWidth=1;
    ctx.setLineDash(mode==="storm" ? [2,6] : [1,8]);
    ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  }

  function drawSun(t){
    const [x,y]=screen(0,0);
    const breathe=1+Math.sin(t*.0014)*(mode==="storm"?.08:.025)+pulse*.18;
    const r=(compact?18:28)*breathe;
    const g=ctx.createRadialGradient(x,y,0,x,y,r*3);
    g.addColorStop(0,"rgba(255,255,255,.26)");
    g.addColorStop(.3,"rgba(255,255,255,.09)");
    g.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.45)";ctx.beginPath();ctx.arc(x,y,r*1.55,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#777";ctx.font='600 7px "IBM Plex Mono",monospace';ctx.textAlign="center";
    ctx.fillText("RAY CORE",x,y+r+16);
  }

  function drawBody(b,i,t){
    const [x,y]=screen(b.x,b.y);
    const rr=Math.max(2, b.radius*(compact?.62:1));
    if(b.name==="SATURN"){
      ctx.save();ctx.translate(x,y);ctx.rotate(-.38);
      ctx.strokeStyle="rgba(255,255,255,.34)";ctx.lineWidth=1.2;
      ctx.beginPath();ctx.ellipse(0,0,rr*2.05,rr*.65,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    if(selected===i){
      ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,rr+7,0,Math.PI*2);ctx.stroke();
    }
    ctx.globalAlpha=.35+b.color*.55;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,rr,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle="#777";ctx.font='600 6px "IBM Plex Mono",monospace';ctx.textAlign="center";
    if(!compact)ctx.fillText(b.name,x,y-rr-7);
  }

  function drawTrails(){
    for(const b of bodies){
      if(b.trail.length<2) continue;
      ctx.strokeStyle=mode==="storm"?"rgba(255,255,255,.08)":mode==="void"?"rgba(255,255,255,.025)":"rgba(255,255,255,.12)";
      ctx.lineWidth=.7;ctx.beginPath();
      b.trail.forEach((p,i)=>{const [x,y]=screen(p.x,p.y);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)});
      ctx.stroke();
    }
  }

  function physics(dt){
    const cfg=MODES[mode];
    const sub=Math.max(1,Math.ceil(dt*cfg.time*2));
    const h=dt*cfg.time/sub;
    for(let step=0;step<sub;step++){
      for(const b of bodies){
        const dx=-b.x,dy=-b.y,dist2=Math.max(.16,dx*dx+dy*dy),dist=Math.sqrt(dist2);
        const a=(G*sunMass*cfg.gravity)/dist2;
        b.vx+=(dx/dist)*a*h;
        b.vy+=(dy/dist)*a*h;
      }
      if(mode==="storm"){
        for(const b of bodies){
          b.vx += Math.sin(performance.now()*.002+b.r)*.0009*h*60;
          b.vy += Math.cos(performance.now()*.0017+b.r)*.0009*h*60;
        }
      }
      for(const b of bodies){
        b.x+=b.vx*h;b.y+=b.vy*h;
      }
    }
    for(const b of bodies){
      const maxTrail=mode==="storm"?18:mode==="void"?3:32;
      b.trail.push({x:b.x,y:b.y});if(b.trail.length>maxTrail)b.trail.shift();
    }
  }

  function render(t){
    clear();drawStars();
    bodies.forEach(b=>drawOrbit(b.r));
    drawTrails();drawSun(t);bodies.forEach(drawBody);
    pulse*=.91;
    const p=qs("#obs-particles"),en=qs("#obs-energy"),mo=qs("#obs-mode");
    if(p)p.textContent="008";
    if(en)en.textContent=String(Math.round(energy)).padStart(3,"0");
    if(mo)mo.textContent=MODES[mode].label;
    canvas.dataset.mode=mode;
  }

  function tick(now){
    const dt=Math.min(.035,(now-lastTime)/1000);lastTime=now;
    if(running){physics(dt);render(now)}
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  document.addEventListener("visibilitychange",()=>running=!document.hidden);

  function setMode(next){
    if(!MODES[next])return;
    mode=next;
    energy=Math.min(99,energy+MODES[next].energy);
    bodies.forEach(b=>{b.trail.length=0});
    stage?.setAttribute("data-mode",mode);
    canvas.setAttribute("aria-label",`Solar system simulation, ${MODES[next].label} mode`);
    qsa(".obs-mode").forEach(btn=>btn.classList.toggle("active",btn.dataset.mode===mode));
  }

  if(interactive){
    canvas.style.touchAction="none";
    canvas.addEventListener("pointerdown",e=>{
      dragging=true;lastX=e.clientX;lastY=e.clientY;
      canvas.setPointerCapture?.(e.pointerId);energy=Math.min(99,energy+3);
    });
    canvas.addEventListener("pointermove",e=>{
      if(!dragging)return;
      panX+=e.clientX-lastX;panY+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    });
    canvas.addEventListener("pointerup",e=>{dragging=false;canvas.releasePointerCapture?.(e.pointerId)});
    canvas.addEventListener("pointercancel",()=>dragging=false);
    canvas.addEventListener("wheel",e=>{
      e.preventDefault();zoom=Math.max(.55,Math.min(1.8,zoom*(1-e.deltaY*.0008)));
    },{passive:false});
    canvas.addEventListener("click",e=>{
      if(dragging)return;
      const rect=canvas.getBoundingClientRect();
      let best=-1,bestD=Infinity;
      bodies.forEach((b,i)=>{
        const [x,y]=screen(b.x,b.y),d=Math.hypot(e.clientX-rect.left-x,e.clientY-rect.top-y);
        if(d<Math.max(18,b.radius+10)&&d<bestD){best=i;bestD=d;}
      });
      if(best<0)return;
      selected=best;energy=Math.min(99,energy+10);
      const b=bodies[best];
      b.vx*=1.16;b.vy*=1.16;
      const bMode=qs("#obs-mode");if(bMode)bMode.textContent=b.name;
      pulse=1;
      if(b.href){
        const base=location.pathname.includes("/pages/")?"":"pages/";
        const target=new URL(base+b.href,location.href).href;
        window.RayCore?.setRoute(b.name.toLowerCase());
        if(window.RayTransition?.go){
          setTimeout(()=>window.RayTransition.go(target,b.name.toLowerCase()),140);
        }else{
          setTimeout(()=>location.href=target,300);
        }
      }
    });
  }

  qsa(".obs-mode").forEach(btn=>btn.addEventListener("click",()=>setMode(btn.dataset.mode)));
  qs("#obs-pulse")?.addEventListener("click",()=>{pulse=1;energy=Math.min(99,energy+18);bodies.forEach((b,i)=>{b.vx*=1+.012*(i+1);b.vy*=1+.012*(i+1)})});

  return {setMode,bodies};
}

const main=qs("#observatory-canvas");
if(main)initObservatory(main,{interactive:true});
["#home-observatory-canvas","#preview-canvas"].forEach(sel=>{const c=qs(sel);if(c)initObservatory(c,{interactive:false,compact:true})});
})();