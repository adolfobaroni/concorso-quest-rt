(()=>{'use strict';
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:(input&&input.url)||'';
  const response=await nativeFetch(input,init);
  if(!url.includes('data/questions-scritta.json')) return response;
  const base=await response.clone().json();
  const extra=Array.isArray(window.CONCORSO_EXTRA_BANK)?window.CONCORSO_EXTRA_BANK:[];
  return new Response(JSON.stringify([...base,...extra]),{
    status:response.status,
    statusText:response.statusText,
    headers:{'Content-Type':'application/json; charset=utf-8'}
  });
};
function bindOralEvaluator(){
  const arena=window.CONCORSO_ORAL_ARENA;if(!arena)return false;
  const btn=document.querySelector('[data-action="oral"]');if(btn)btn.onclick=arena.start;
  document.querySelectorAll('[data-view-target="profile"]').forEach(b=>b.addEventListener('click',()=>setTimeout(arena.refreshProfile,0)));
  arena.refreshProfile();
  const box=document.querySelector('section[aria-label="Versione e contenuti disponibili"]');
  if(box){const h=box.querySelector('h3'),pill=box.querySelector('.status-pill');if(h)h.textContent='Versione 2026.08.12.2';if(pill)pill.textContent='12/08/2026'}
  return true;
}
window.addEventListener('load',()=>{
  const s=document.createElement('script');s.src='./data/oral-evaluator.js';s.onload=()=>{
    let attempts=0;const t=setInterval(()=>{attempts++;if(bindOralEvaluator()||attempts>30)clearInterval(t)},100);
    setTimeout(bindOralEvaluator,1500);
    setTimeout(bindOralEvaluator,3500);
  };document.head.appendChild(s);
},{once:true});
})();
