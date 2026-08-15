(()=>{
'use strict';
const coarse=matchMedia('(pointer:coarse)').matches;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ball=document.querySelector('.cursor-ball');
const label=document.querySelector('.cursor-label');

// Keep the editor loader independent of the desktop-only cursor so it also works on touch devices.
const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
const loadStyle=href=>{if(document.querySelector(`link[href="${href}"]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
const bootEditor=async()=>{
 if(!document.querySelector('#ray-editor'))return;
 loadStyle('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/codemirror.min.css');
 loadStyle('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/theme/material-darker.min.css');
 try{
  if(!window.CodeMirror)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/codemirror.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/mode/javascript/javascript.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/mode/css/css.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/mode/xml/xml.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/mode/htmlmixed/htmlmixed.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/addon/edit/closebrackets.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/addon/edit/matchbrackets.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.20/addon/selection/active-line.min.js');
  if(window.RayCodeMirrorEditor)window.RayCodeMirrorEditor();
 }catch(error){
  document.querySelector('#editor-status')?.replaceChildren(document.createTextNode('LOCAL EDITOR'));
  document.querySelector('#editor-message')?.replaceChildren(document.createTextNode('CODEMIRROR UNAVAILABLE / TEXT MODE'));
 }
};
if(document.readyState==='loading')addEventListener('DOMContentLoaded',bootEditor,{once:true});else setTimeout(bootEditor,0);

if(coarse||!ball)return;
const core=window.RayCore;
const state={x:innerWidth/2,y:innerHeight/2,tx:innerWidth/2,ty:innerHeight/2,px:innerWidth/2,py:innerHeight/2,vx:0,vy:0,speed:0,mode:'normal',label:''};
let active=null,lastTrail=0,lastMove=performance.now();
const text={link:'OPEN',project:'ENTER',observatory:'ORBIT',void:'VOID',drag:'DRAG ↔',core:'CORE',home:'OPEN',lab:'PLAY',play:'PLAY',send:'SEND',services:'OPEN',default:'OPEN'};
const modeFor=el=>{
 if(!el)return 'link';
 const explicit=(el.dataset.cursorType||el.dataset.cursor||'').toLowerCase();
 if(el.matches('.project-tile,.archive-card,.project-screen,.project-link'))return 'project';
 if(el.matches('.observatory-stage,.observatory-preview,.home-observatory'))return 'observatory';
 if(el.matches('.play-card,.play-orbit,.arcade-card'))return 'play';
 if(el.matches('[draggable="true"],.drag-surface,.physics-box'))return 'drag';
 if(explicit==='enter')return 'project';
 if(explicit==='open'||explicit==='home')return 'link';
 if(explicit==='orbit')return 'observatory';
 if(explicit==='drag')return 'drag';
 if(explicit==='play'||explicit==='lab')return 'play';
 if(explicit==='void')return 'void';
 if(explicit==='core')return 'core';
 if(explicit==='send')return 'send';
 return explicit||'link';
};
const setActive=el=>{active=el;const mode=modeFor(el),lab=text[mode]||el?.dataset.cursor||text.default;state.mode=mode;state.label=lab;document.body.dataset.cursorMode=mode;document.body.classList.add('cursor-hover');if(label)label.textContent=lab;core?.setCursor(mode,lab,el)};
const clear=el=>{if(active!==el)return;active=null;state.mode='normal';state.label='';document.body.classList.remove('cursor-hover');document.body.dataset.cursorMode='normal';if(label)label.textContent='';core?.setCursor('normal','',null)};
const bind=()=>{document.querySelectorAll('[data-cursor],[data-cursor-type],a,button,[role="button"],.project-tile,.archive-card,.project-screen,.observatory-stage,.play-card,.arcade-card,.physics-box').forEach(el=>{if(el.matches('.cursor-ball,.cursor-label')||el.dataset.rayCursorBound==='1')return;el.dataset.rayCursorBound='1';el.addEventListener('pointerenter',()=>setActive(el),{passive:true});el.addEventListener('pointerleave',()=>clear(el),{passive:true})})};
bind();
addEventListener('pointermove',e=>{const now=performance.now(),dt=Math.max(8,now-lastMove);lastMove=now;const prevX=state.tx,prevY=state.ty;state.tx=e.clientX;state.ty=e.clientY;core?.setPointer({x:e.clientX,y:e.clientY,vx:(e.clientX-prevX)/dt*16,vy:(e.clientY-prevY)/dt*16});const target=e.target?.closest?.('.local-interaction,.spotlight,.archive-art,.tile-art,.lab-visual,.game-screen,.physics-box,.project-screen,.observatory-stage,.play-card');if(target){const r=target.getBoundingClientRect();target.style.setProperty('--mx',`${((e.clientX-r.left)/Math.max(1,r.width))*100}%`);target.style.setProperty('--my',`${((e.clientY-r.top)/Math.max(1,r.height))*100}%`)}},{passive:true});
addEventListener('pointerdown',()=>document.body.classList.add('cursor-down'),{passive:true});addEventListener('pointerup',()=>document.body.classList.remove('cursor-down'),{passive:true});
function makeTrail(x,y,vx,vy){if(reduce)return;const now=performance.now();if(now-lastTrail<16||state.speed<3.2)return;lastTrail=now;const dot=document.createElement('i');dot.className='cursor-comet';const size=Math.min(9,2+state.speed*.2),angle=Math.atan2(vy,vx),stretch=Math.min(4,1+state.speed*.18);dot.style.width=`${size*stretch}px`;dot.style.height=`${Math.max(1.4,size*.42)}px`;dot.style.left=`${x}px`;dot.style.top=`${y}px`;dot.style.transform=`translate(-50%,-50%) rotate(${angle}rad)`;document.body.appendChild(dot);requestAnimationFrame(()=>dot.classList.add('fade'));setTimeout(()=>dot.remove(),460)}
const loop=()=>{state.px=state.x;state.py=state.y;state.x+=(state.tx-state.x)*.22;state.y+=(state.ty-state.y)*.22;state.vx=state.x-state.px;state.vy=state.y-state.py;state.speed=Math.hypot(state.vx,state.vy);const capped=Math.min(28,state.speed),stretch=1+Math.min(.42,capped*.021),squash=1/Math.sqrt(stretch),angle=state.speed>.05?Math.atan2(state.vy,state.vx):0;ball.style.transform=`translate3d(${state.x}px,${state.y}px,0) translate(-50%,-50%) rotate(${angle}rad) scale(${stretch},${squash})`;if(label)label.style.transform=`translate3d(${state.x+18}px,${state.y+18}px,0)`;if(state.speed>3)makeTrail(state.x,state.y,state.vx,state.vy);core?.setPointer({x:state.x,y:state.y,vx:state.vx,vy:state.vy,speed:state.speed});requestAnimationFrame(loop)};
loop();
// Remove legacy glitch markers from previous builds.
document.querySelectorAll('[data-ray-glitch]').forEach(el=>el.removeAttribute('data-ray-glitch'));
})();
