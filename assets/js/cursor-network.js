(()=>{
"use strict";
const coarse=matchMedia("(pointer:coarse)").matches;
const ball=document.querySelector(".cursor-ball");
const label=document.querySelector(".cursor-label");
if(coarse||!ball)return;

const core=window.RayCore;
const state={x:innerWidth/2,y:innerHeight/2,tx:innerWidth/2,ty:innerHeight/2,px:innerWidth/2,py:innerHeight/2,vx:0,vy:0,speed:0,mode:"normal",label:""};
let active=null, lastTrail=0;

const text={
 link:"OPEN", project:"ENTER", observatory:"ORBIT", void:"VOID", drag:"DRAG ↔",
 core:"CORE", home:"OPEN", lab:"PLAY", play:"PLAY", send:"SEND", services:"OPEN",
 default:"OPEN"
};
const modeFor=el=>{
 const explicit=(el?.dataset.cursorType||el?.dataset.cursor||"").toLowerCase();
 if(explicit==="enter")return "project";
 if(explicit==="open"||explicit==="home")return "link";
 if(explicit==="orbit")return "observatory";
 if(explicit==="drag")return "drag";
 if(explicit==="play"||explicit==="lab")return "play";
 if(explicit==="void")return "void";
 if(explicit==="core")return "core";
 if(explicit==="send")return "send";
 return explicit||"link";
};
const setActive=el=>{
 active=el;
 const mode=modeFor(el),lab=text[mode]||el?.dataset.cursor||text.default;
 state.mode=mode;state.label=lab;
 document.body.dataset.cursorMode=mode;
 document.body.classList.add("cursor-hover");
 if(label)label.textContent=lab;
 core?.setCursor(mode,lab,el);
};
const clear=el=>{
 if(active!==el)return;
 active=null;state.mode="normal";state.label="";
 document.body.classList.remove("cursor-hover");
 document.body.dataset.cursorMode="normal";
 if(label)label.textContent="";
 core?.setCursor("normal","",null);
};

document.querySelectorAll("[data-cursor],[data-cursor-type],a,button,[role='button']").forEach(el=>{
 if(el.matches(".cursor-ball,.cursor-label"))return;
 el.addEventListener("pointerenter",()=>setActive(el),{passive:true});
 el.addEventListener("pointerleave",()=>clear(el),{passive:true});
});

addEventListener("pointermove",e=>{
 state.tx=e.clientX;state.ty=e.clientY;
 core?.setPointer({x:e.clientX,y:e.clientY});
});
addEventListener("pointerdown",()=>document.body.classList.add("cursor-down"),{passive:true});
addEventListener("pointerup",()=>document.body.classList.remove("cursor-down"),{passive:true});

function makeTrail(x,y,vx,vy){
 const now=performance.now();
 if(now-lastTrail<18||state.speed<3)return;
 lastTrail=now;
 const dot=document.createElement("i");
 dot.className="cursor-comet";
 const size=Math.min(7,2.2+state.speed*.16);
 const angle=Math.atan2(vy,vx);
 dot.style.width=`${size}px`;dot.style.height=`${Math.max(1.5,size*.55)}px`;
 dot.style.left=`${x}px`;dot.style.top=`${y}px`;
 dot.style.transform=`translate(-50%,-50%) rotate(${angle}rad)`;
 document.body.appendChild(dot);
 requestAnimationFrame(()=>dot.classList.add("fade"));
 setTimeout(()=>dot.remove(),420);
}

const loop=()=>{
 state.px=state.x;state.py=state.y;
 state.x+=(state.tx-state.x)*.22;state.y+=(state.ty-state.y)*.22;
 state.vx=state.x-state.px;state.vy=state.y-state.py;
 state.speed=Math.hypot(state.vx,state.vy);
 const capped=Math.min(20,state.speed),stretch=1+Math.min(.30,capped*.016);
 const angle=state.speed>.05?Math.atan2(state.vy,state.vx):0;
 ball.style.transform=`translate3d(${state.x}px,${state.y}px,0) translate(-50%,-50%) rotate(${angle}rad) scale(${stretch},${1/Math.sqrt(stretch)})`;
 if(label)label.style.transform=`translate3d(${state.x+18}px,${state.y+18}px,0)`;
 if(state.speed>3)makeTrail(state.x,state.y,state.vx,state.vy);
 core?.setPointer({x:state.x,y:state.y,vx:state.vx,vy:state.vy,speed:state.speed});
 requestAnimationFrame(loop);
};
loop();
})();
