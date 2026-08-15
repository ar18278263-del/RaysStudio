(()=>{
'use strict';
/* CORE enhancement layer. Deliberately independent of the CTA/cursor engine. */
const map=document.querySelector('.system-map');
const reactor=document.querySelector('#core-reactor');
const routeCards=[...document.querySelectorAll('.route-card')];
if(!map && !routeCards.length) return;

const routeMeta={
 home:{label:'HOME',type:'ENTRY / SIGNAL',signal:76},
 about:{label:'ABOUT',type:'METHOD / SIGNAL',signal:84},
 work:{label:'WORK',type:'CASES / SIGNAL',signal:91},
 lab:{label:'LAB',type:'EXPERIMENTS / SIGNAL',signal:88},
 void:{label:'VOID',type:'GRAVITY / PHYSICS',signal:79},
 observatory:{label:'OBSERVATORY',type:'FIELD / SIGNAL',signal:97}
};

const $=(s,r=document)=>r.querySelector(s);
const state={route:null,activity:0,connected:false};
function routeActivate(key){
 const meta=routeMeta[key]; if(!meta)return;
 state.route=key; state.connected=true; state.activity=Math.min(1,state.activity+.35);
 document.documentElement.dataset.coreRoute=key;
 const name=$('#core-route-name'),type=$('#core-route-type'),sig=$('#core-route-signal'),mini=$('#core-signal');
 if(name)name.textContent=meta.label;
 if(type)type.textContent=meta.type;
 if(sig)sig.textContent=`SIGNAL ${String(meta.signal).padStart(3,'0')}`;
 if(mini)mini.textContent=`SIGNAL ${String(meta.signal).padStart(3,'0')}`;
 map?.classList.add('network-active');
 window.dispatchEvent(new CustomEvent('ray:core-route',{detail:{key,meta}}));
}
function routeClear(){
 state.route=null;state.connected=false;
 document.documentElement.removeAttribute('data-core-route');
 map?.classList.remove('network-active');
 const name=$('#core-route-name'),type=$('#core-route-type'),sig=$('#core-route-signal'),mini=$('#core-signal');
 if(name)name.textContent='CORE';
 if(type)type.textContent='CENTRAL / SYSTEM';
 if(sig)sig.textContent='SIGNAL 084';
 if(mini)mini.textContent='SIGNAL 084';
 window.dispatchEvent(new CustomEvent('ray:core-route-clear'));
}
routeCards.forEach(card=>{
 const key=card.dataset.route;
 card.addEventListener('mouseenter',()=>routeActivate(key));
 card.addEventListener('mouseleave',routeClear);
 card.addEventListener('focusin',()=>routeActivate(key));
 card.addEventListener('focusout',e=>{if(!card.contains(e.relatedTarget))routeClear()});
});
document.querySelectorAll('.map-node').forEach(node=>{
 const href=node.getAttribute('href')||'';
 const key=href.split('/').pop().replace('.html','')||'home';
 node.addEventListener('mouseenter',()=>routeActivate(key));
 node.addEventListener('focusin',()=>routeActivate(key));
 node.addEventListener('mouseleave',routeClear);
 node.addEventListener('focusout',e=>{if(!node.contains(e.relatedTarget))routeClear()});
});

/* Give the reactor a synchronized system pulse when routes wake up,
   without ever reading or modifying the CTA/cursor. */
window.addEventListener('ray:core-route',()=>{
 const pulse=document.querySelector('#pulse');
 if(pulse) pulse.classList.add('route-pulse');
 setTimeout(()=>pulse?.classList.remove('route-pulse'),320);
});

/* Keyboard operator shortcuts. */
addEventListener('keydown',e=>{
 if(e.target.matches('input,textarea,select'))return;
 const k=e.key.toLowerCase();
 if(k==='p') document.querySelector('#pulse')?.click();
 if(k==='r') document.querySelector('#reset')?.click();
});

/* Add a compact live connection layer to the system map canvas. */
const canvas=document.querySelector('#map-canvas');
if(canvas){
 const ctx=canvas.getContext('2d');
 let dpr=1,w=0,h=0,t0=performance.now();
 const fit=()=>{
   const r=canvas.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,2);
   canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);w=r.width;h=r.height;
 };
 fit();addEventListener('resize',fit,{passive:true});
 const points={home:[.13,.21],about:[.34,.12],work:[.70,.14],lab:[.88,.30],void:[.88,.73],observatory:[.70,.88],services:[.34,.88],contact:[.12,.72]};
 function draw(t){
   ctx.clearRect(0,0,w,h);
   const cx=w*.5,cy=h*.5;
   Object.entries(points).forEach(([key,p])=>{
     const x=p[0]*w,y=p[1]*h,active=state.route===key;
     ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);
     ctx.strokeStyle=active?'rgba(255,255,255,.34)':'rgba(255,255,255,.055)';
     ctx.lineWidth=active?1.4:1;ctx.stroke();
     if(active){
       const q=(t*.00035)%1,px=cx+(x-cx)*q,py=cy+(y-cy)*q;
       ctx.beginPath();ctx.arc(px,py,2.2+Math.sin(t*.01)*.5,0,Math.PI*2);
       ctx.fillStyle='rgba(255,255,255,.9)';ctx.fill();
     }
   });
   requestAnimationFrame(draw);
 }
 requestAnimationFrame(draw);
}

/* Route cards can be opened with Enter/Space exactly like normal links. */
routeCards.forEach(card=>{
 card.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}
 });
});
})();
