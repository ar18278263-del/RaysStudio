(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const TAU=Math.PI*2;
const coreCanvas=$('#core-canvas');
const state={energy:.72,density:.48,response:.64,adaptive:true,t:0,pulse:0};

function resizeCanvas(canvas,host){const r=host.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);return [c,r.width,r.height]}

// CORE FIELD — deliberately uses its own internal signal coordinates. Pointer input only affects the
// field if adaptive mode is enabled; the black-hole engine on VOID is independent and has no pointer physics.
if(coreCanvas){
 const panel=coreCanvas.parentElement,ctx=coreCanvas.getContext('2d');let w=1,h=1,mx=.5,my=.5;let nodes=[];
 function build(){nodes=Array.from({length:Math.round(70+state.density*150)},(_,i)=>({a:Math.random()*TAU,r:.08+Math.random()*.44,s:.35+Math.random()*1.9,v:(Math.random()>.5?1:-1)*(.0005+Math.random()*.002),phase:Math.random()*TAU,band:i%6}))}
 function resize(){[ctx,w,h]=resizeCanvas(coreCanvas,panel);build()} resize();addEventListener('resize',resize,{passive:true});
 panel.addEventListener('pointermove',e=>{if(!state.adaptive)return;const r=panel.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height;$('#core-state').textContent='RESPONDING'},{passive:true});
 panel.addEventListener('pointerleave',()=>$('#core-state').textContent='STABLE');
 function draw(){state.t+=.01*state.response;state.pulse*=.93;ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,R=Math.min(w,h)*.4;
  const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.5);bg.addColorStop(0,`rgba(255,255,255,${.025+state.energy*.06})`);bg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  for(let ring=0;ring<8;ring++){const rr=R*(.16+ring*.105);ctx.beginPath();ctx.arc(cx,cy,rr,state.t*(.15+ring*.015),state.t*(.15+ring*.015)+Math.PI*(.7+ring*.04));ctx.strokeStyle=`rgba(255,255,255,${.035+ring*.008+state.pulse*.08})`;ctx.stroke()}
  nodes.forEach((n,i)=>{n.a+=n.v*(.7+state.response*2);const rr=n.r*R*(.72+state.energy*.5);let x=cx+Math.cos(n.a)*rr,y=cy+Math.sin(n.a)*rr*.62;if(state.adaptive){x+=(mx-.5)*R*.12*(1-n.r);y+=(my-.5)*R*.12*(1-n.r)}const alpha=.07+n.s*.075;ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.beginPath();ctx.arc(x,y,n.s,0,TAU);ctx.fill();if(i%8===0){ctx.strokeStyle='rgba(255,255,255,.035)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke()}});
  const coreR=22+state.energy*30+state.pulse*15;ctx.beginPath();ctx.arc(cx,cy,coreR,0,TAU);ctx.strokeStyle=`rgba(255,255,255,${.25+state.energy*.4})`;ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,5+state.response*9,0,TAU);ctx.fillStyle='rgba(255,255,255,.8)';ctx.fill();requestAnimationFrame(draw)}draw();
 function rebuild(){build()}
 window.RAY_CORE={pulse(){state.pulse=1;log('MANUAL PULSE FIRED')},rebuild,setAdaptive(v){state.adaptive=v}};
}

function log(msg){const box=$('#core-log');if(!box)return;const d=new Date();const row=document.createElement('div');row.innerHTML=`<b>${d.toLocaleTimeString([], {hour12:false})}</b> / ${msg}`;box.prepend(row);while(box.children.length>10)box.lastChild.remove()}
function setRange(id,key){const el=$('#'+id),out=$('#'+id+'-out');if(!el)return;el.addEventListener('input',()=>{state[key]=+el.value/100;if(out)out.textContent=el.value+'%';if(key==='density')window.RAY_CORE?.rebuild();log(id.toUpperCase()+' tuned to '+el.value+'%')})}
setRange('energy','energy');setRange('density','density');setRange('response','response');
$('#adaptive')?.addEventListener('click',e=>{state.adaptive=!state.adaptive;e.currentTarget.classList.toggle('active',state.adaptive);$('#adaptive-out').textContent=state.adaptive?'ON':'OFF';$('#field').textContent=state.adaptive?'ADAPTIVE':'STATIC';window.RAY_CORE?.setAdaptive(state.adaptive);log('ADAPTIVE FIELD '+(state.adaptive?'ENABLED':'DISABLED'))});

// Page preview engines. These are real canvases, not placeholder images.
const previewDefs={
 home:{draw(c,w,h,t){c.clearRect(0,0,w,h);const cx=w*.5,cy=h*.5;for(let i=0;i<24;i++){const a=t*.3+i*.27,r=(i%8)*12+20;c.strokeStyle=`rgba(255,255,255,${.04+i*.003})`;c.beginPath();c.arc(cx,cy,r,a,a+1.2);c.stroke()}c.font='600 10px IBM Plex Mono';c.fillStyle='#777';c.fillText('RAY/STUDIO',18,24)}},
 about:{draw(c,w,h,t){c.clearRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.13)';for(let i=0;i<8;i++){const y=30+i*25;c.beginPath();c.moveTo(18,y);c.lineTo(w-18,y);c.stroke()}c.fillStyle='#fff';c.fillRect(18,28+((Math.sin(t)+1)*8),w*.48,2);c.fillStyle='#555';c.font='7px IBM Plex Mono';c.fillText('METHOD / SYSTEM / PROCESS',18,h-18)}},
 work:{draw(c,w,h,t){c.clearRect(0,0,w,h);for(let i=0;i<5;i++){const x=18+i*(w-36)/4;const hh=40+Math.abs(Math.sin(t+i))*90;c.strokeStyle='rgba(255,255,255,.2)';c.strokeRect(x,h-hh-18,Math.max(20,(w-60)/5),hh);c.fillStyle='#fff';c.fillRect(x+5,h-hh-13,2,hh-10)} }},
 lab:{draw(c,w,h,t){c.clearRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.18)';c.beginPath();for(let x=0;x<=w;x+=2){const y=h*.5+Math.sin(x*.035+t*2)*h*.18;if(x)c.lineTo(x,y);else c.moveTo(x,y)}c.stroke();for(let i=0;i<14;i++){const x=(i/14)*w,y=h*.5+Math.sin(i+t)*h*.18;c.fillStyle='#fff';c.fillRect(x,y,2,2)}}},
 void:{draw(c,w,h,t){c.clearRect(0,0,w,h);const cx=w*.56,cy=h*.52,R=Math.min(w,h)*.34;c.strokeStyle='rgba(255,255,255,.1)';for(let i=0;i<7;i++){c.beginPath();c.ellipse(cx,cy,R-i*10,R*.25-i*2,0,0,TAU);c.stroke()}c.fillStyle='#000';c.beginPath();c.arc(cx,cy,R*.22,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.5)';c.stroke();c.fillStyle='#777';c.font='7px IBM Plex Mono';c.fillText('VOID / GRAVITY',16,18)}},
 observatory:{draw(c,w,h,t){c.clearRect(0,0,w,h);const cx=w/2,cy=h/2;c.fillStyle='#fff';c.beginPath();c.arc(cx,cy,8,0,TAU);c.fill();for(let i=0;i<5;i++){const r=28+i*22;c.strokeStyle='rgba(255,255,255,.11)';c.beginPath();c.arc(cx,cy,r,0,TAU);c.stroke();const a=t*(.2+i*.05)+i;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.55;c.fillStyle='#aaa';c.beginPath();c.arc(x,y,3+i*.4,0,TAU);c.fill()}}}
};
const previews=$$('.core-preview');
previews.forEach(card=>{const canvas=$('canvas',card);const host=canvas.parentElement;const type=card.dataset.preview;let ctx,w,h,dpr;function resize(){[ctx,w,h]=resizeCanvas(canvas,host)}resize();addEventListener('resize',resize,{passive:true});let t=Math.random()*10;function loop(){t+=.016;previewDefs[type]?.draw(ctx,w,h,t);requestAnimationFrame(loop)}loop();card.addEventListener('mouseenter',()=>{card.classList.add('is-open');const ball=$('.preview-ball',card);if(ball)ball.textContent='OPEN PAGE ↗'});card.addEventListener('mouseleave',()=>card.classList.remove('is-open'))});

// Telemetry bus
const tc=$('#telemetry-canvas');if(tc){const host=tc.parentElement;let ctx,w,h,values=Array.from({length:80},()=>.4+Math.random()*.5);function resize(){[ctx,w,h]=resizeCanvas(tc,host)}resize();addEventListener('resize',resize,{passive:true});function loop(){values.push(.2+Math.random()*.7+state.response*.35);values.shift();ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.beginPath();values.forEach((v,i)=>{const x=i/(values.length-1)*w,y=h-(v*Math.max(20,h*.7)+10);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)});ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.04)';for(let y=20;y<h;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}const rate=(state.response*8+2+Math.random()*2).toFixed(1);$('#telemetry-rate').textContent=rate+' / SEC';requestAnimationFrame(loop)}loop()}

// Command console
const output=$('#core-command-output');function command(raw){const cmd=raw.trim().toLowerCase();if(!cmd)return;const add=(text)=>{const d=document.createElement('div');d.innerHTML=text;output.appendChild(d);output.scrollTop=output.scrollHeight};if(cmd==='clear'){output.innerHTML='';return}add(`<span class="cmd-in">&gt; ${cmd}</span>`);switch(cmd){case'help':add('<b>CORE</b> commands: STATUS / MODULES / PULSE / CLEAR');break;case'status':add('<b>ONLINE</b> / FIELD '+(state.adaptive?'ADAPTIVE':'STATIC')+' / ENERGY '+Math.round(state.energy*100)+'%');break;case'modules':add('<b>LINKED</b> / HOME / ABOUT / WORK / LAB / VOID / OBSERVATORY');break;case'pulse':window.RAY_CORE?.pulse();add('<b>PULSE</b> / signal injected into core bus');break;default:add('<b>UNKNOWN</b> / type HELP for available commands')}}
$('#core-command-form')?.addEventListener('submit',e=>{e.preventDefault();const input=$('#core-command');command(input.value);input.value=''});$$('.core-command-hints button').forEach(b=>b.addEventListener('click',()=>command(b.dataset.command)));
log('CORE ONLINE');log('FIELD CALIBRATED');log('MODULE BUS CONNECTED');log('PREVIEW BUS READY');
let fpsFrames=0,last=performance.now();function fps(){fpsFrames++;const now=performance.now();if(now-last>1000){$('#fps')&&( $('#fps').textContent=fpsFrames);$('#nodes')&&($('#nodes').textContent=String(document.querySelectorAll('.core-preview').length*24+90));fpsFrames=0;last=now}requestAnimationFrame(fps)}fps();
})();
