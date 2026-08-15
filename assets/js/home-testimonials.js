(()=>{
const f=document.querySelector('#home-testimonial-field'),cards=[...document.querySelectorAll('.home-testimonial-card')];if(!f||!cards.length)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,base=[[-34,-28,-4],[34,-23,5],[-30,28,3],[31,28,-5]],state={x:0,y:0,tx:0,ty:0};
const draw=(sx,sy)=>{const r=f.getBoundingClientRect();cards.forEach((c,i)=>{const b=base[i],w=c.offsetWidth,h=c.offsetHeight,ux=Math.max(35,(r.width-w)/2-28),uy=Math.max(50,(r.height-h)/2-32),x=Math.max(-ux,Math.min(ux,b[0]/34*ux+sx*35*(+c.dataset.depth||1))),y=Math.max(-uy,Math.min(uy,b[1]/28*uy+sy*30*(+c.dataset.depth||1)));c.style.transform=`translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),0) rotate(${b[2]+sx*2}deg)`})};
if(reduce){draw(0,0);return}
f.addEventListener('pointermove',e=>{const r=f.getBoundingClientRect();state.tx=(e.clientX-r.left-r.width/2)/(r.width/2);state.ty=(e.clientY-r.top-r.height/2)/(r.height/2)});f.addEventListener('pointerleave',()=>{state.tx=0;state.ty=0});
const tick=()=>{state.x+=(state.tx-state.x)*.065;state.y+=(state.ty-state.y)*.065;draw(state.x,state.y);const o=document.querySelector('#home-testimonial-speed');if(o)o.textContent=(Math.hypot(state.tx-state.x,state.ty-state.y)*9).toFixed(2);requestAnimationFrame(tick)};draw(0,0);tick();addEventListener('resize',()=>draw(state.x,state.y),{passive:true});
})();