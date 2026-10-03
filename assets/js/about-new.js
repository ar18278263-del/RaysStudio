(()=>{
  const faqItems=[...document.querySelectorAll('.faq-item')];
  faqItems.forEach(item=>{const btn=item.querySelector('button');btn?.addEventListener('click',()=>{faqItems.forEach(x=>{if(x!==item){x.classList.remove('open');x.querySelector('button')?.setAttribute('aria-expanded','false')}});const open=item.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false')})});
  if(window.gsap){gsap.from('.about-signal-hero .about-hero-copy>*',{y:45,opacity:0,stagger:.08,duration:1,ease:'power3.out',delay:.2});gsap.utils.toArray('.principle-stack article,.faq-item').forEach(el=>{gsap.from(el,{y:35,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});}
})();