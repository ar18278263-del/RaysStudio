(function(){
  const canvas = document.querySelector('.project-engine-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const mode = canvas.dataset.engine || 'echo';
  let w=0,h=0,dpr=1,t=0,mx=.5,my=.5;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = e=>{ const r=canvas.getBoundingClientRect(); mx=(e.clientX-r.left)/r.width; my=(e.clientY-r.top)/r.height; };
  canvas.addEventListener('pointermove',pointer);
  function resize(){ const r=canvas.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,2); w=Math.max(1,r.width); h=Math.max(1,r.height); canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  addEventListener('resize',resize); resize();
  const TAU=Math.PI*2;
  const noise=(i,s=1)=>{ const x=Math.sin(i*12.9898+78.233)*43758.5453; return (x-Math.floor(x))*s; };
  function base(){ ctx.fillStyle='#060606'; ctx.fillRect(0,0,w,h); const g=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.7); g.addColorStop(0,'rgba(255,255,255,.035)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h); }
  function grid(step=46,alpha=.1){ ctx.strokeStyle=`rgba(255,255,255,${alpha})`;ctx.lineWidth=1; for(let x=(w%step)/2;x<w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()} for(let y=(h%step)/2;y<h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()} }
  function echo(){
    grid(55,.055); const cy=h*(.5+(my-.5)*.08); const amp=Math.min(h*.24,90)*(1+mx*.5);
    for(let k=0;k<8;k++){ ctx.beginPath(); for(let x=0;x<=w;x+=4){ const u=x/w; const y=cy+Math.sin(u*TAU*(2+k*.28)+t*(1.3+k*.12))*amp*(.15+.1*k)+Math.sin(u*TAU*11-t*1.5)*amp*.06; if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)} ctx.strokeStyle=`rgba(255,255,255,${.04+k*.018})`;ctx.stroke(); }
    for(let r=25;r<Math.min(w,h)*.38;r+=24){ ctx.beginPath();ctx.ellipse(w*.5,h*.5,r,r*.38,0,0,TAU);ctx.strokeStyle='rgba(255,255,255,.035)';ctx.stroke(); }
  }
  function pulse(){
    grid(70,.045); const cy=h*.5; ctx.beginPath(); for(let x=0;x<=w;x+=3){ const u=x/w; let y=cy; const p=(u*9-t*.65)%1; if(p>.44&&p<.56){const q=(p-.5)*18; y-=Math.exp(-q*q)*h*.28;} y+=Math.sin(u*TAU*3+t*2)*8*(.3+mx); if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y); } ctx.strokeStyle='rgba(255,255,255,.78)';ctx.lineWidth=1.5;ctx.stroke();
    for(let i=0;i<18;i++){let x=(i/18*w+t*35)%w;ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(x,cy+Math.sin(i+t)*35,2,2)}
  }
  function axis(){
    const cx=w*(.5+(mx-.5)*.18),cy=h*(.5+(my-.5)*.12); ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.18); grid(64,.03); for(let r=45;r<Math.min(w,h)*.36;r+=30){ctx.beginPath();ctx.rect(-r,-r*.62,r*2,r*1.24);ctx.strokeStyle=`rgba(255,255,255,${.025+(r/Math.min(w,h))*.08})`;ctx.stroke()} ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(w,0);ctx.moveTo(0,-h);ctx.lineTo(0,h);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.stroke();ctx.restore();
  }
  function luma(){
    for(let i=-8;i<=8;i++){const x=w*.5+i*45+Math.sin(t*.7+i)*18;ctx.save();ctx.translate(x,h*.5);ctx.rotate(-.35+Math.sin(t+i)*.03);const g=ctx.createLinearGradient(0,-h*.5,0,h*.5);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(-1,-h*.6,2,h*1.2);ctx.restore()}
    const r=90+mx*90;ctx.beginPath();ctx.arc(w*.5,h*.5,r,0,TAU);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.stroke();ctx.beginPath();ctx.arc(w*.5,h*.5,r+12+Math.sin(t)*6,0,TAU);ctx.strokeStyle='rgba(255,255,255,.12)';ctx.stroke();
  }
  function zero(){
    grid(42,.07); const gx=Math.round(mx*10),gy=Math.round(my*10); for(let x=0;x<11;x++)for(let y=0;y<11;y++){const px=w*.15+x*w*.7/10,py=h*.18+y*h*.64/10,active=x===gx&&y===gy;ctx.fillStyle=active?'rgba(255,255,255,.9)':'rgba(255,255,255,.12)';ctx.fillRect(px-2,py-2,active?5:3,active?5:3)} ctx.strokeStyle='rgba(255,255,255,.28)';ctx.strokeRect(w*.15+gx*w*.7/10-18,h*.18+gy*h*.64/10-18,36,36);
  }
  function voidMode(){
    for(let i=0;i<90;i++){let x=(noise(i,1)*w + Math.sin(t*.15+i)*20)%w,y=(noise(i+90,1)*h+t*(8+noise(i)*18))%h;let s=1+noise(i+180)*3;ctx.fillStyle=`rgba(255,255,255,${.05+noise(i+20)*.25})`;ctx.fillRect(x,y,s,s)} ctx.save();ctx.translate(w*.5,h*.5);ctx.rotate(Math.sin(t*.12)*.04);ctx.font=`700 ${Math.min(w*.24,150)}px var(--sans)`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.strokeText('VOID',0,0);ctx.restore();
  }
  function nova(){
    for(let i=0;i<16;i++){const y=h*.18+i*h*.045;const phase=t*(.45+i*.015);const x=w*.12+((phase*90+i*55)% (w*.76));const len=40+(i%5)*30;ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x,y,len,2);ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(x+len*.55,y,2,2)} const cx=w*(.5+(mx-.5)*.2),cy=h*(.5+(my-.5)*.2);ctx.beginPath();ctx.arc(cx,cy,70+Math.sin(t)*5,0,TAU);ctx.strokeStyle='rgba(255,255,255,.28)';ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,42,0,TAU);ctx.strokeStyle='rgba(255,255,255,.1)';ctx.stroke();
  }
  function kinetic(){
    const pts=[]; for(let i=0;i<9;i++){const x=w*.12+i*w*.095,y=h*.5+Math.sin(t*1.2+i*.7)*h*.22;pts.push([x,y]);ctx.beginPath();ctx.arc(x,y,4,0,TAU);ctx.fillStyle='rgba(255,255,255,.65)';ctx.fill()} for(let i=0;i<pts.length-1;i++){ctx.beginPath();ctx.moveTo(pts[i][0],pts[i][1]);for(let x=pts[i][0];x<=pts[i+1][0];x+=4){const u=(x-pts[i][0])/(pts[i+1][0]-pts[i][0]);const y=pts[i][1]*(1-u)+pts[i+1][1]*u+Math.sin(u*Math.PI*2)*12;ctx.lineTo(x,y)}ctx.strokeStyle='rgba(255,255,255,.16)';ctx.stroke()} grid(72,.03);
  }
  function draw(){t+=reduce?.002:.016;base(); ({echo,pulse,axis,luma,zero:voidMode,nova,kinetic}[mode]||echo)(); requestAnimationFrame(draw)} draw();
})();
