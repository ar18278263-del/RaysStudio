(()=>{"use strict";
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer={x:innerWidth/2,y:innerHeight/2,px:innerWidth/2,py:innerHeight/2};
const cursor={x:pointer.x,y:pointer.y};
const ready=fn=>document.readyState==="loading"?addEventListener("DOMContentLoaded",fn):fn();
ready(()=>{
 boot();clock();canvas();nav();pageTransitions();smooth();split();reveal();signal();services();contactForm();activeNav();spotlights();codeEditor();visualSystems();systemMap();
});
function boot(){const b=$("#boot");if(!b)return;b.setAttribute("aria-hidden","true");requestAnimationFrame(()=>{b.style.opacity="0";b.style.pointerEvents="none";setTimeout(()=>b.remove(),260)});}
function clock(){const els=$$(".clock");if(!els.length)return;const f=()=>{const d=new Date(),h=d.getHours(),ampm=h>=12?"PM":"AM",hh=h%12||12,v=`${String(hh).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")} ${ampm}`;els.forEach(e=>e.textContent=v)};f();setInterval(f,1000)}
function cursorFX(){if(matchMedia("(pointer:coarse)").matches)return;addEventListener("pointermove",e=>{pointer.x=e.clientX;pointer.y=e.clientY;$$(".pointer-readout").forEach(x=>x.textContent=`PX ${String(Math.round(e.clientX)).padStart(3,"0")} / PY ${String(Math.round(e.clientY)).padStart(3,"0")}`)});const ball=$(".cursor-ball"),lab=$(".cursor-label");$$("[data-cursor]").forEach(el=>{el.addEventListener("mouseenter",()=>{document.body.classList.add("cursor-hover");if(lab)lab.textContent=el.dataset.cursor||"VIEW"});el.addEventListener("mouseleave",()=>document.body.classList.remove("cursor-hover"))});const loop=()=>{cursor.x+=(pointer.x-cursor.x)*.22;cursor.y+=(pointer.y-cursor.y)*.22;if(ball)ball.style.transform=`translate3d(${cursor.x}px,${cursor.y}px,0) translate(-50%,-50%)`;if(lab)lab.style.transform=`translate3d(${cursor.x+15}px,${cursor.y+15}px,0)`;requestAnimationFrame(loop)};loop()}
function pageTransitions(){
 const overlay=document.createElement("div");
 overlay.className="ray-transition";
 overlay.innerHTML='<div class="ray-warp"><i></i><i></i><i></i><i></i></div><span>RAY/STUDIO</span><small>SWITCHING ENVIRONMENT</small>';
 document.body.appendChild(overlay);
 if(reduce)return;
 const isLocalPage=href=>href&&!href.startsWith("#")&&!href.startsWith("mailto:")&&!href.startsWith("tel:")&&!href.startsWith("javascript:")&&!href.startsWith("http");
 const leave=(url,route)=>{
   if(overlay.classList.contains("out"))return;
   window.dispatchEvent(new CustomEvent("ray:route-leave",{detail:{url,route}}));
   document.documentElement.dataset.transitioning="1";
   overlay.classList.add("out");
   setTimeout(()=>location.href=url,520);
 };
 window.RayTransition={go:leave};
 $$("a[href]").forEach(a=>{
   const href=a.getAttribute("href");
   if(!isLocalPage(href)||a.target==="_blank"||a.hasAttribute("download"))return;
   a.addEventListener("click",e=>{
     if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
     const url=new URL(href,location.href);
     if(url.origin!==location.origin)return;
     e.preventDefault();
     const route=(a.dataset.route||a.dataset.system||a.dataset.cursorType||a.textContent||"route").trim().toLowerCase();
     leave(url.href,route);
   });
 });
}
function createRayCore(){
 if(window.RayCore)return window.RayCore;
 const listeners=new Map();
 const state={route:document.body.dataset.route||"unknown",pointer:{x:innerWidth/2,y:innerHeight/2,vx:0,vy:0,speed:0},cursor:"normal",motion:reduce?"reduced":"full"};
 const on=(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);return()=>listeners.get(name)?.delete(fn)};
 const emit=(name,detail={})=>{listeners.get(name)?.forEach(fn=>{try{fn(detail)}catch(e){}});window.dispatchEvent(new CustomEvent("ray:"+name,{detail}))};
 const setRoute=route=>{state.route=route;emit("route", {route})};
 const setCursor=(mode,label,element)=>{state.cursor=mode||"normal";emit("cursor",{mode:state.cursor,label:label||"",element})};
 const setPointer=p=>{state.pointer=Object.assign(state.pointer,p);emit("pointer",state.pointer)};
 window.RayCore={state,on,emit,setRoute,setCursor,setPointer};
 return window.RayCore;
}

function nav(){
 const t=$("#menu-toggle"),n=$("#main-nav");
 if(!t||!n)return;
 const setOpen=open=>{
   n.classList.toggle("open",open);
   t.classList.toggle("open",open);
   t.setAttribute("aria-expanded",String(open));
   document.body.classList.toggle("nav-open",open);
   n.setAttribute("aria-hidden",String(!open));
 };
 setOpen(false);
 t.addEventListener("click",e=>{e.preventDefault();setOpen(!n.classList.contains("open"));});
 $$("#main-nav a").forEach(a=>a.addEventListener("click",()=>setOpen(false)));
 addEventListener("keydown",e=>{if(e.key==="Escape")setOpen(false)});
 addEventListener("resize",()=>{if(innerWidth>900)setOpen(false)},{passive:true});
}
function smooth(){if(reduce||!window.Lenis)return;const l=new Lenis({duration:1.1,lerp:.09});if(window.gsap){l.on("scroll",ScrollTrigger.update);gsap.ticker.add(t=>l.raf(t*1000));gsap.ticker.lagSmoothing(0)}else{const f=t=>{l.raf(t);requestAnimationFrame(f)};requestAnimationFrame(f)}}
function tilt(){if(matchMedia("(pointer:coarse)").matches)return;$$(".tilt").forEach(el=>el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect(),x=e.clientX/r.width-r.left/r.width-.5,y=e.clientY/r.height-r.top/r.height-.5;el.style.transform=`perspective(1000px) rotateX(${-y*4}deg) rotateY(${x*5}deg)`}));$$(".tilt").forEach(el=>el.addEventListener("pointerleave",()=>el.style.transform=""))}
function split(){if(reduce||!window.SplitType||!window.gsap)return;$$(".split").forEach(el=>{try{const s=new SplitType(el,{types:"lines,words,chars"});gsap.from(s.chars,{yPercent:110,opacity:0,stagger:.012,duration:.7,ease:"power3.out",delay:.35})}catch(e){}})}
function reveal(){if(reduce||!window.gsap||!window.ScrollTrigger)return;gsap.registerPlugin(ScrollTrigger);$$(".section-pad,.page-hero,.project-hero,.lab-hero").forEach(el=>gsap.fromTo(el,{opacity:.35,y:25},{opacity:1,y:0,duration:.8,scrollTrigger:{trigger:el,start:"top 88%",once:true}}))}
function signal(){const cards=$$(".signal-card"),state=$("#signal-state"),label=$(".signal-state b"),bar=$(".signal-progress i");if(!cards.length)return;const set=c=>{cards.forEach(x=>x.classList.remove("active"));c.classList.add("active");state&&(state.textContent=c.dataset.signal);label&&(label.textContent=c.dataset.state);bar&&(bar.style.height=(Number(c.dataset.signal)/4*100)+"%")};const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)set(e.target)}),{rootMargin:"-35% 0px -45% 0px",threshold:.1});cards.forEach(c=>{obs.observe(c);c.addEventListener("mouseenter",()=>set(c))})}
function services(){const tabs=$$(".service-tab"),code=$("#service-code"),title=$("#service-title"),desc=$("#service-description"),del=$("#service-deliverables");if(!tabs.length)return;const data={strategy:["SERVICE // STRATEGY","FIND THE SIGNAL","Positioning, architecture and a clear interaction model before pixels start moving.","Research / Sitemap / Direction / Prototype"],design:["SERVICE // DESIGN","MAKE IT OBVIOUS","Art direction, interface systems and visual language built around hierarchy rather than decoration.","Visual system / UI / Components / Prototypes"],motion:["SERVICE // MOTION","MAKE IT MOVE","Kinetic typography, transitions and interaction physics that give the interface a pulse.","Motion language / GSAP / Transitions / Interaction"],build:["SERVICE // BUILD","MAKE IT<br>REAL","Responsive front-end engineering with performance, accessibility and weird little details intact.","React / HTML / CSS / JS / Optimization"]};tabs.forEach(t=>t.addEventListener("click",()=>{tabs.forEach(x=>x.classList.remove("active"));t.classList.add("active");const d=data[t.dataset.service];code.textContent=d[0];title.innerHTML=d[1];desc.textContent=d[2];del.textContent=d[3]}))}
function codeEditor(){
 const root=$("#ray-editor"),input=$("#code-input"),gutter=$("#editor-gutter");
 if(!root||!input||!gutter)return;

 const files={
  "main.js":`const signal = {
  state: "LIVE",
  pointer: { x: 0, y: 0 },

  tick() {
    requestAnimationFrame(() => this.tick());
  }
};

signal.tick();`,
  "style.css":`.terminal {
  position: relative;
  overflow: hidden;
  border: 1px solid #222;
  border-radius: 12px;
}

.terminal:hover {
  border-color: #333;
}`,
  "index.html":`<section class="system">
  <span class="eyebrow">RAY / STUDIO</span>
  <h2>BUILD THE UNKNOWN.</h2>
</section>`
 };
 const language={"main.js":"JAVASCRIPT","style.css":"CSS","index.html":"HTML"};
 const tabs=$$(".editor-tab",root),status=$("#editor-status"),position=$("#editor-position"),lang=$("#editor-language"),message=$("#editor-message"),command=$("#editor-command"),run=$("#editor-run"),suggestions=$("#editor-suggestions",root);
 let current="main.js",suggestionIndex=0;

 const completionSets={
  "main.js":["const","let","var","function","return","if","else","for","while","class","new","async","await","import","export","requestAnimationFrame","addEventListener","removeEventListener","querySelector","querySelectorAll","classList","style","transform","opacity","pointermove","pointerenter","pointerleave","console.log","Math","window","document"],
  "style.css":["display","position","absolute","relative","fixed","grid","flex","grid-template-columns","grid-template-rows","gap","padding","margin","width","height","max-width","border","border-radius","background","color","transform","transition","opacity","overflow","z-index","pointer-events","@media","::before","::after"],
  "index.html":["section","main","header","nav","div","span","h1","h2","h3","p","a","button","canvas","textarea","class","id","aria-label","data-cursor","href","src","alt","role"]
 };

 const storageKey=file=>`ray-editor:${file}`;
 const getStored=file=>{try{return localStorage.getItem(storageKey(file))}catch(e){return null}};
 const setStored=(file,value)=>{try{localStorage.setItem(storageKey(file),value)}catch(e){}};
 const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

 const setStatus=text=>{
  if(status)status.textContent=text;
  if(message)message.textContent=`${text} / LOCAL BUFFER`;
 };
 const renderGutter=()=>{
  const count=Math.max(1,input.value.split("\n").length);
  gutter.textContent=Array.from({length:count},(_,i)=>String(i+1).padStart(2,"0")).join("\n");
  gutter.scrollTop=input.scrollTop;
 };
 const updatePosition=()=>{
  const before=input.value.slice(0,input.selectionStart);
  const lines=before.split("\n");
  position.textContent=`Ln ${lines.length}, Col ${lines[lines.length-1].length+1}`;
  renderGutter();
 };
 const hideSuggestions=()=>{suggestions.hidden=true;suggestions.innerHTML="";suggestionIndex=0};
 const currentToken=()=>{
  const before=input.value.slice(0,input.selectionStart);
  const match=before.match(/[A-Za-z_$][\w$-]*$/);
  return {query:match?match[0]:"",start:match?input.selectionStart-match[0].length:input.selectionStart};
 };
 const complete=value=>{
  const {start}=currentToken();
  const end=input.selectionStart;
  input.setRangeText(value,start,end,"end");
  hideSuggestions();
  input.dispatchEvent(new Event("input",{bubbles:true}));
  input.focus();
 };
 const renderSuggestions=()=>{
  const {query}=currentToken();
  const list=completionSets[current].filter(x=>!query||x.toLowerCase().startsWith(query.toLowerCase())).slice(0,8);
  if(!list.length){hideSuggestions();return}
  suggestionIndex=Math.min(suggestionIndex,list.length-1);
  suggestions.innerHTML=list.map((x,i)=>`<button type="button" class="editor-suggestion${i===suggestionIndex?" active":""}" data-value="${escapeHtml(x)}" role="option" aria-selected="${i===suggestionIndex}">${escapeHtml(x)}</button>`).join("");
  suggestions.hidden=false;
  $$(".editor-suggestion",suggestions).forEach((button,i)=>{
   button.addEventListener("mouseenter",()=>{suggestionIndex=i;renderSuggestions()});
   button.addEventListener("mousedown",e=>{e.preventDefault();complete(button.dataset.value)});
  });
 };
 const save=()=>{setStored(current,input.value);files[current]=input.value;setStatus("SAVED");setTimeout(()=>setStatus("READY"),700)};
 const load=file=>{
  current=file;
  const stored=getStored(file);
  input.value=stored!==null?stored:files[file];
  input.parentElement.dataset.file=file;
  tabs.forEach(t=>t.classList.toggle("active",t.dataset.file===file));
  lang.textContent=language[file];
  command.textContent=`edit ${file}`;
  hideSuggestions();
  updatePosition();
  setStatus("READY");
  requestAnimationFrame(()=>input.focus({preventScroll:true}));
 };
 const execute=()=>{
  save();
  setStatus("RUNNING");
  if(current==="main.js"){
   try{new Function(input.value);setStatus("BUILD OK")}catch(error){setStatus(`ERROR / ${String(error.message).slice(0,44)}`)}
  }else if(current==="style.css"){
   try{new CSSStyleSheet().replaceSync(input.value);setStatus("CSS OK")}catch(error){setStatus(`ERROR / ${String(error.message).slice(0,44)}`)}
  }else{
   try{new DOMParser().parseFromString(input.value,"text/html");setStatus("HTML OK")}catch(error){setStatus("HTML CHECK")}
  }
  setTimeout(()=>setStatus("READY"),1600);
 };

 // The pointer effect is part of the terminal background itself.
 // It never creates a layer over the editor, so the textarea always receives input.
 if(!matchMedia("(pointer:coarse)").matches){
  const move=e=>{const r=root.getBoundingClientRect();root.style.setProperty("--editor-x",`${e.clientX-r.left}px`);root.style.setProperty("--editor-y",`${e.clientY-r.top}px`);root.classList.add("editor-pointer-active")};
  const leave=()=>root.classList.remove("editor-pointer-active");
  root.addEventListener("pointermove",move,{passive:true});
  root.addEventListener("pointerleave",leave,{passive:true});
 }

 tabs.forEach(tab=>tab.addEventListener("click",()=>{if(tab.dataset.file!==current){save();load(tab.dataset.file)}}));
 input.addEventListener("input",()=>{files[current]=input.value;updatePosition();setStatus("EDITING");renderSuggestions()});
 input.addEventListener("click",updatePosition);
 input.addEventListener("keyup",updatePosition);
 input.addEventListener("select",updatePosition);
 input.addEventListener("scroll",renderGutter,{passive:true});
 input.addEventListener("blur",()=>setTimeout(hideSuggestions,120));
 input.addEventListener("keydown",e=>{
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.key.toLowerCase()==="s"){e.preventDefault();save();return}
  if(mod&&e.key.toLowerCase()==="enter"){e.preventDefault();execute();return}
  if(mod&&e.key.toLowerCase()===" "){e.preventDefault();suggestionIndex=0;renderSuggestions();return}
  if(e.key==="Escape"){hideSuggestions();return}
  if(!suggestions.hidden&&e.key==="ArrowDown"){e.preventDefault();suggestionIndex++;renderSuggestions();return}
  if(!suggestions.hidden&&e.key==="ArrowUp"){e.preventDefault();suggestionIndex--;if(suggestionIndex<0)suggestionIndex=0;renderSuggestions();return}
  if(!suggestions.hidden&&e.key==="Enter"&&suggestions.querySelector(".editor-suggestion.active")){e.preventDefault();complete(suggestions.querySelector(".editor-suggestion.active").dataset.value);return}
  if(e.key==="Tab"){
   e.preventDefault();
   const a=input.selectionStart,b=input.selectionEnd;
   input.setRangeText("  ",a,b,"end");
   input.dispatchEvent(new Event("input",{bubbles:true}));
   return;
  }
  if(e.key==="Enter"){
   const start=input.selectionStart;
   const line=input.value.slice(0,start).split("\n").pop();
   const indent=(line.match(/^\s*/)||[""])[0];
   const extra=/[\{\[\(]\s*$/.test(line)?"  ":"";
   if(extra||indent){
    e.preventDefault();
    const insertion=`\n${indent}${extra}`;
    input.setRangeText(insertion,start,input.selectionEnd,"end");
    input.dispatchEvent(new Event("input",{bubbles:true}));
   }
  }
  if(mod&&e.key==="/"){
   e.preventDefault();
   const a=input.selectionStart,b=input.selectionEnd;
   const selected=input.value.slice(a,b);
   const lines=selected.split("\n");
   const prefix=current==="main.js"?"// ":current==="style.css"?"/* ":"<!-- ";
   const suffix=current==="main.js"?"":current==="style.css"?" */":" -->";
   input.setRangeText(lines.map((line,i)=>prefix+line+(suffix&&i===lines.length-1?suffix:"")).join("\n"),a,b,"end");
   input.dispatchEvent(new Event("input",{bubbles:true}));
  }
 });
 run?.addEventListener("click",execute);
 load(current);
}

function visualSystems(){
 if(typeof document==="undefined")return;
 const hosts=$$(".archive-art,.tile-art,.project-screen");
 if(!hosts.length)return;
 const projectName=el=>{if(el.classList.contains("project-screen")){const hero=$(".project-hero");const cls=hero&&[...hero.classList].find(c=>c.startsWith("project-"));return cls?cls.replace("project-",""):"nova"}return ["nova","echo","zero","void","pulse","axis","luma"].find(x=>el.classList.contains(x))||"nova"};
 hosts.forEach(host=>{
  if(host.querySelector("canvas.visual-system"))return;
  host.classList.add("visualized","local-interaction");
  const canvas=document.createElement("canvas");canvas.className="visual-system";canvas.setAttribute("aria-hidden","true");host.prepend(canvas);
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const name=projectName(host),seed=name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);let w=0,h=0,d=1,raf=0;
  const points=Array.from({length:24},(_,i)=>({a:(i/24)*Math.PI*2,r:70+(i%6)*28,s:.0002+(i%4)*.00008}));
  const resize=()=>{const r=host.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(d,0,0,d,0,0)};
  resize();addEventListener("resize",resize,{passive:true});
  const label=name.toUpperCase();
  const draw=t=>{
   ctx.clearRect(0,0,w,h);const mx=parseFloat(getComputedStyle(host).getPropertyValue("--mx"))||50,my=parseFloat(getComputedStyle(host).getPropertyValue("--my"))||50;
   const px=w*mx/100,py=h*my/100,cx=w/2,cy=h/2;
   const grad=ctx.createRadialGradient(px,py,0,px,py,Math.max(w,h)*.65);grad.addColorStop(0,"rgba(255,255,255,.075)");grad.addColorStop(.45,"rgba(255,255,255,.02)");grad.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
   ctx.strokeStyle="rgba(255,255,255,.055)";ctx.lineWidth=1;
   const angle=(seed%17)*.04+Math.sin(t*.0002)*.03;ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);for(let x=-w;x<w;x+=44){ctx.beginPath();ctx.moveTo(x,-h);ctx.lineTo(x,h);ctx.stroke()}for(let y=-h;y<h;y+=44){ctx.beginPath();ctx.moveTo(-w,y);ctx.lineTo(w,y);ctx.stroke()}ctx.restore();
   const rx=Math.min(w,h)*.34,ry=Math.min(w,h)*.24;ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(t*.0003+seed)*.18);ctx.strokeStyle="rgba(255,255,255,.28)";ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.restore();
   for(let i=0;i<points.length;i++){const p=points[i],a=p.a+t*p.s,rad=rx*.35+p.r;const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad*.62;ctx.fillStyle="rgba(255,255,255,.22)";ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fill()}
   ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`700 ${Math.min(w*.17,96)}px var(--display, Arial)`;ctx.fillStyle="rgba(255,255,255,.95)";ctx.fillText(label,cx,cy);ctx.restore();
   raf=requestAnimationFrame(draw);
  };raf=requestAnimationFrame(draw);
  host.addEventListener("pointerleave",()=>cancelAnimationFrame(raf),{once:false});
 });
}
function performanceManager(){
 const canvases=$$("canvas");
 if(!canvases.length)return;
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{
   e.target.dataset.inView=e.isIntersecting?"1":"0";
 }),{rootMargin:"120px 0px",threshold:0});
 canvases.forEach(c=>io.observe(c));
 addEventListener("visibilitychange",()=>{
   document.documentElement.dataset.hidden=document.hidden?"1":"0";
   window.dispatchEvent(new CustomEvent("ray:visibility",{detail:{hidden:document.hidden}}));
 });
}
function microInteractions(){
 if(reduce)return;
 const glitchTargets=$$("h1,h2,h3,.display-title,.section-title,[data-glitch]");
 glitchTargets.forEach(el=>{
   if(!el.dataset.rayGlitch)el.dataset.rayGlitch=el.textContent.replace(/\s+/g," ").trim();
 });
 $$(".magnetic").forEach(el=>{
   if(el.matches(".cursor-ball,.cursor-label"))return;
   let raf=0;
   el.addEventListener("pointermove",e=>{
     const r=el.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/r.width,y=(e.clientY-(r.top+r.height/2))/r.height;
     cancelAnimationFrame(raf);
     raf=requestAnimationFrame(()=>el.style.setProperty("--mag-x",`${x*4}px`));
     el.style.setProperty("--mag-y",`${y*4}px`);
   },{passive:true});
   el.addEventListener("pointerleave",()=>{
     cancelAnimationFrame(raf);el.style.removeProperty("--mag-x");el.style.removeProperty("--mag-y");
   },{passive:true});
 });
}
function systemMap(){
 const root=$("#system-map");if(!root)return;
 const status=$("#system-map-status"),route=$("#system-map-route"),nodes=$$(".map-node",root);
 const set=name=>{
   nodes.forEach(n=>n.classList.toggle("active",n.dataset.system===name));
   if(status)status.textContent=`NETWORK / ${name.toUpperCase()}`;
   if(route)route.textContent=`${name.toUpperCase()} / ROUTE ACTIVE`;
   window.RayCore?.setRoute(name);
 };
 nodes.forEach(n=>{
   n.addEventListener("mouseenter",()=>set(n.dataset.system));
   n.addEventListener("focus",()=>set(n.dataset.system));
   n.addEventListener("mouseleave",()=>set(document.body.dataset.route||"observatory"));
 });
}

function contactForm(){const f=$("#contact-form"),bar=$("#form-progress"),status=$("#form-status");if(!f)return;f.addEventListener("input",()=>{const fields=[...f.querySelectorAll("input,select,textarea")],done=fields.filter(x=>x.value.trim()).length;bar.style.width=(done/fields.length*100)+"%"});f.addEventListener("submit",e=>{e.preventDefault();status.textContent="TRANSMISSION QUEUED / DEMO COMPLETE — CONNECT A BACKEND TO SEND FOR REAL.";f.reset();bar.style.width="0%";const b=f.querySelector(".submit-signal span");b.textContent="SIGNAL RECEIVED";setTimeout(()=>b.textContent="TRANSMIT BRIEF",2600)})}
function activeNav(){
 const current=new URL(location.href);
 $$("#main-nav .nav-link").forEach(a=>{
  a.classList.remove("active");
  a.removeAttribute("aria-current");
  const target=new URL(a.getAttribute("href"),location.href);
  const same=target.pathname.replace(/\/$/,"")===current.pathname.replace(/\/$/,"");
  if(same){a.classList.add("active");a.setAttribute("aria-current","page");}
 });
}
function canvas(){const c=$("#system-canvas");if(!c)return;const x=c.getContext("2d"),d=Math.min(devicePixelRatio||1,2);let w,h,pts=[];const resize=()=>{w=innerWidth;h=innerHeight;c.width=w*d;c.height=h*d;x.setTransform(d,0,0,d,0,0);pts=Array.from({length:Math.min(120,Math.floor(w*h/14000))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.16,vy:(Math.random()-.5)*.16,r:Math.random()+.2}))};resize();addEventListener("resize",resize);const draw=()=>{x.clearRect(0,0,w,h);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;const dx=pointer.x-p.x,dy=pointer.y-p.y,dist=Math.hypot(dx,dy);if(dist<170){p.x+=dx/dist*.18;p.y+=dy/dist*.18}x.fillStyle="rgba(255,255,255,.22)";x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()}for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,dist=Math.hypot(dx,dy);if(dist<120){x.strokeStyle=`rgba(255,255,255,${(1-dist/120)*.055})`;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}requestAnimationFrame(draw)};draw();if(window.THREE)three();}
function three(){const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100),c=document.createElement("canvas"),r=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true});c.style.position="fixed";c.style.inset="0";c.style.zIndex="-4";c.style.pointerEvents="none";c.style.opacity=".12";document.body.appendChild(c);r.setPixelRatio(Math.min(devicePixelRatio,1.5));const g=new THREE.Group();scene.add(g);g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.8,2),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.35})));cam.position.z=7;const resize=()=>{r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};resize();addEventListener("resize",resize);const loop=t=>{g.rotation.x=t*.00002+(pointer.y/innerHeight-.5)*.15;g.rotation.y=t*.00003+(pointer.x/innerWidth-.5)*.2;r.render(scene,cam);requestAnimationFrame(loop)};requestAnimationFrame(loop)}
})();
function spotlights(){if(matchMedia("(pointer:coarse)").matches)return;const els=$$(".local-interaction,.spotlight,.archive-art,.tile-art,.lab-visual,.game-screen,.physics-box").filter(el=>el.id!=="ray-editor");els.forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");el.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%");});el.addEventListener("pointerleave",()=>{el.style.setProperty("--mx","50%");el.style.setProperty("--my","50%");});})}