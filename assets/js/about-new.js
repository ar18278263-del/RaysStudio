(()=>{
  const faqItems=[...document.querySelectorAll('.faq-item')];
  faqItems.forEach(item=>{const btn=item.querySelector('button');btn?.addEventListener('click',()=>{faqItems.forEach(x=>{if(x!==item){x.classList.remove('open');x.querySelector('button')?.setAttribute('aria-expanded','false')}});const open=item.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false')})});
  const field=document.querySelector('#testimonial-field');
  const cards=[...document.querySelectorAll('.testimonial-card')];
  if(field&&cards.length){
    const state={x:0,y:0,tx:0,ty:0,v:0};
    const rect=()=>field.getBoundingClientRect();
    field.addEventListener('pointermove',e=>{const r=rect();state.tx=(e.clientX-r.left-r.width/2)/r.width;state.ty=(e.clientY-r.top-r.height/2)/r.height});
    field.addEventListener('pointerleave',()=>{state.tx=0;state.ty=0});
    const base=cards.map((card,i)=>({x:Number(card.dataset.x)||0,y:Number(card.dataset.y)||0,r:parseFloat(getComputedStyle(card).getPropertyValue('--r'))||0,depth:1+i*.28}));
    const tick=()=>{
      state.x+=(state.tx-state.x)*.08;
      state.y+=(state.ty-state.y)*.08;
      state.v=Math.hypot(state.x-state.tx,state.y-state.ty)*10;
      const fr=field.getBoundingClientRect();
      cards.forEach((card,i)=>{
        const b=base[i], cr=card.getBoundingClientRect();
        const rawX=b.x+state.x*45*b.depth, rawY=b.y+state.y*32*b.depth;
        const maxX=Math.max(0,(fr.width-cr.width)/2-10), maxY=Math.max(0,(fr.height-cr.height)/2-10);
        const x=Math.max(-maxX,Math.min(maxX,rawX));
        const y=Math.max(-maxY,Math.min(maxY,rawY));
        card.style.transform=`translate3d(${x}px,${y}px,0) rotate(${b.r+state.x*2}deg)`;
      });
      const out=document.querySelector('#testimonial-velocity');
      if(out)out.textContent=state.v.toFixed(2);
      requestAnimationFrame(tick);
    };
    tick();
  }
  if(window.gsap){gsap.from('.about-signal-hero .about-hero-copy>*',{y:45,opacity:0,stagger:.08,duration:1,ease:'power3.out',delay:.2});gsap.utils.toArray('.principle-stack article,.faq-item,.testimonial-card').forEach(el=>{gsap.from(el,{y:35,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});}
})();