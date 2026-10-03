(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const TAU=Math.PI*2;
const state={energy:.72,density:.48,response:.64,adaptive:true,pulse:0};
let rebuildParticles=()=>{};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function fit(canvas){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);return[c,r.width,r.height]}

// Reactor: autonomous. It deliberately does not read pointer position.
const reactor=$('#core-reactor');
if(reactor){let ctx,w,h,particles=[];const make=()=>particles=Array.from({length:Math.round(90+state.density*180)},()=>({a:Math.random()*TAU,r:.08+Math.random()*.46,s:.4+Math.random()*1.5,v:(Math.random()>.5?1:-1)*(.0005+Math.random()*.0018),phase:Math.random()*TAU}));rebuildParticles=make;const resize=()=>{[ctx,w,h]=fit(reactor);make()};resize();addEventListener('resize',resize,{passive:true});
 const draw=t=>{ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,R=Math.min(w,h)*.43;const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.4);glow.addColorStop(0,`rgba(255,255,255,${.035+state.energy*.09+state.pulse*.12})`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 for(let i=0;i<9;i++){const rr=R*(.15+i*.095);ctx.beginPath();ctx.ellipse(cx,cy,rr,rr*.48,Math.sin(t*.0001+i)*.1,0,TAU);ctx.strokeStyle=`rgba(255,255,255,${.035+i*.008})`;ctx.stroke()}
 particles.forEach((p,i)=>{p.a+=p.v*(state.adaptive?(.6+state.response*2):.6);const rr=p.r*R*(.85+state.energy*.3)+Math.sin(t*.001+p.phase)*2;const x=cx+Math.cos(p.a)*rr,y=cy+Math.sin(p.a)*rr*.48;ctx.fillStyle=`rgba(255,255,255,${.08+p.s*.09})`;ctx.beginPath();ctx.arc(x,y,p.s,0,TAU);ctx.fill();if(i%18===0){ctx.strokeStyle='rgba(255,255,255,.035)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke()}});
 const rr=27+state.energy*35+state.pulse*16;ctx.beginPath();ctx.arc(cx,cy,rr,0,TAU);ctx.strokeStyle=`rgba(255,255,255,${.25+state.energy*.45})`;ctx.lineWidth=1.4;ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,6+state.response*9+state.pulse*3,0,TAU);ctx.fillStyle='#eee';ctx.fill();state.pulse*=.94;requestAnimationFrame(draw)};requestAnimationFrame(draw);
}

// Map renderer: route traffic lines only, no pointer input.
const map=$('#map-canvas');if(map){let ctx,w,h,hover=null;const host=map.parentElement;const nodes=$$('.map-node',host);const centerTitle=$('.map-center span',host),centerMeta=$('.map-center b',host);const fitMap=()=>{[ctx,w,h]=fit(map)};fitMap();addEventListener('resize',fitMap,{passive:true});
 nodes.forEach(node=>{node.addEventListener('pointerenter',()=>{hover=node;node.classList.add('is-linked');if(centerTitle)centerTitle.textContent=node.querySelector('b')?.textContent||'ROUTE';if(centerMeta)centerMeta.textContent=node.querySelector('small')?.textContent||'ROUTE'});node.addEventListener('pointerleave',()=>{if(hover===node)hover=null;node.classList.remove('is-linked');if(centerTitle)centerTitle.textContent='ROUTE';if(centerMeta)centerMeta.textContent='SELECT A NODE'})});
 function nodeCenter(node){const a=node.getBoundingClientRect(),b=host.getBoundingClientRect();return{x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2}}
 const points=[.11,.27,.44,.58,.77,.9];function draw(t){ctx.clearRect(0,0,w,h);const cx=w*.5,cy=h*.5;ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.035)';for(let r=80;r<Math.min(w,h)*.55;r+=55){ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke()}
 points.forEach((p,i)=>{const a=p*TAU+t*.00012*(i%2?1:-1),r=Math.min(w,h)*(.29+.055*(i%3));const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.72;ctx.strokeStyle='rgba(255,255,255,.07)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(x,y,2.5,0,TAU);ctx.fill()});
 if(hover){const q=nodeCenter(hover),g=ctx.createLinearGradient(cx,cy,q.x,q.y);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(.72,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(q.x,q.y);ctx.stroke();const pulse=4+Math.sin(t*.012)*2;ctx.beginPath();ctx.arc(q.x,q.y,pulse,0,TAU);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.stroke();}
 requestAnimationFrame(draw)}draw(0)}

// Controls + metrics.
function journal(channel,event,status='OK'){const body=$('#journal-body');if(!body)return;const row=document.createElement('div');row.className='journal-row';const time=new Date().toLocaleTimeString([], {hour12:false});row.innerHTML=`<span>${time}</span><span>${channel}</span><b>${event}</b><span class="${status==='WARN'?'warn':'ok'}">${status}</span>`;body.prepend(row);while(body.children.length>9)body.lastChild.remove()}
function logEvent(text){journal('SESSION',text,'OK')}
function bindRange(id,key){const input=$('#'+id),out=$('#'+id+'-out');input?.addEventListener('input',()=>{state[key]=+input.value/100;if(out)out.textContent=input.value+'%';if(key==='density')rebuildParticles();logEvent(id.toUpperCase()+' SET '+input.value+'%')})}
bindRange('energy','energy');bindRange('density','density');bindRange('response','response');
$('#adaptive')?.addEventListener('click',e=>{state.adaptive=!state.adaptive;e.currentTarget.classList.toggle('active',state.adaptive);e.currentTarget.setAttribute('aria-pressed',String(state.adaptive));$('#control-state').textContent=state.adaptive?'ADAPTIVE':'STATIC';$('#reactor-mode').textContent=state.adaptive?'BALANCED':'LOCKED';logEvent('ADAPTIVE BUS '+(state.adaptive?'ENABLED':'DISABLED'))});
$('#pulse')?.addEventListener('click',()=>{state.pulse=1;logEvent('MANUAL BUS PULSE');});
$('#reset')?.addEventListener('click',()=>{state.energy=.72;state.density=.48;state.response=.64;state.pulse=.15;$('#energy').value=72;$('#density').value=48;$('#response').value=64;$('#energy-out').textContent='72%';$('#density-out').textContent='48%';$('#response-out').textContent='64%';$('#control-state').textContent='ADAPTIVE';$('#reactor-mode').textContent='BALANCED';state.adaptive=true;$('#adaptive').classList.add('active');$('#adaptive').setAttribute('aria-pressed','true');rebuildParticles();logEvent('CONTROL SURFACE RESET')});

// Telemetry graph.
const telemetry=$('#telemetry');if(telemetry){let ctx,w,h,vals=Array.from({length:80},()=>.25+Math.random()*.5);const resize=()=>{[ctx,w,h]=fit(telemetry)};resize();addEventListener('resize',resize,{passive:true});function draw(){vals.push(clamp(.18+Math.random()*.32+state.energy*.28+state.response*.12,0,1));vals.shift();ctx.clearRect(0,0,w,h);for(let y=30;y<h;y+=38){ctx.strokeStyle='rgba(255,255,255,.035)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.beginPath();vals.forEach((v,i)=>{const x=i/(vals.length-1)*w,y=h-18-v*(h-45);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle='rgba(255,255,255,.72)';ctx.stroke();const peak=Math.max(...vals),avg=vals.reduce((a,b)=>a+b,0)/vals.length;$('#peak').textContent=Math.round(peak*100)+'%';$('#avg').textContent=Math.round(avg*100)+'%';$('#drift').textContent=(Math.abs(vals.at(-1)-vals[0])*.1).toFixed(2);requestAnimationFrame(draw)}draw()}

// Command shell.
const output=$('#console-output');function command(raw){const cmd=raw.trim().toUpperCase();if(!cmd)return;const add=(s)=>{const d=document.createElement('div');d.innerHTML=s;output.appendChild(d);output.scrollTop=output.scrollHeight};if(cmd==='CLEAR'){output.innerHTML='';return}add(`<span>› ${cmd}</span>`);if(cmd==='HELP')add('<b>HELP</b> / STATUS / ROUTES / PULSE / CLEAR / HELP');else if(cmd==='STATUS')add(`<b>SIMULATED</b> / ENERGY ${Math.round(state.energy*100)}% / BUS ${state.adaptive?'ADAPTIVE':'STATIC'}`);else if(cmd==='ROUTES')add('<b>ROUTES</b> / HOME ABOUT WORK LAB VOID OBSERVATORY SERVICES CONTACT');else if(cmd==='PULSE'){$('#pulse').click();add('<b>PULSE</b> / signal injected');}else add('<b>UNKNOWN</b> / use HELP');journal('CONSOLE',cmd,cmd==='HELP'||cmd==='STATUS'||cmd==='ROUTES'||cmd==='PULSE'?'OK':'WARN')}
$('#console-form')?.addEventListener('submit',e=>{e.preventDefault();const input=$('#console-input');command(input.value);input.value=''});$$('.console-shortcuts button').forEach(b=>b.addEventListener('click',()=>command(b.dataset.cmd)));

journal('SIMULATION','CONTROL SURFACE READY');journal('ROUTE MAP','8 ROUTES LINKED');
})();
