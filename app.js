(()=>{'use strict';
const VERSION='2026.08.12.1',RELEASE_DATE='12/08/2026';
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
async function updateRelease(fetchBase){
  try{
    const [pre,wr,oral,hist,study]=await Promise.all([
      fetchBase('data/questions-preselettiva.json',{cache:'no-cache'}).then(r=>r.json()),
      fetchBase('data/questions-scritta.json',{cache:'no-cache'}).then(r=>r.json()),
      fetchBase('data/questions-orale.json',{cache:'no-cache'}).then(r=>r.json()),
      fetchBase('data/questions-storiche.json',{cache:'no-cache'}).then(r=>r.json()),
      fetchBase('data/study-modules.json',{cache:'no-cache'}).then(r=>r.json())
    ]);
    const oralExtra=Array.isArray(window.CONCORSO_ORAL_EXTRA_BANK)?window.CONCORSO_ORAL_EXTRA_BANK:[];
    const studyExtra=Array.isArray(window.CONCORSO_ORAL_STUDY)?window.CONCORSO_ORAL_STUDY:[];
    const all=[...pre,...wr,...oral,...oralExtra,...hist],counts={};all.forEach(q=>counts[q.topic]=(counts[q.topic]||0)+1);
    const box=document.querySelector('section[aria-label="Versione e contenuti disponibili"]');if(!box)return;
    const h=box.querySelector('h3'),pill=box.querySelector('.status-pill'),stats=box.querySelectorAll('.stat strong');
    if(h)h.textContent=`Versione ${VERSION}`;if(pill)pill.textContent=RELEASE_DATE;
    if(stats[0])stats[0].textContent=all.length;if(stats[1])stats[1].textContent=study.length+studyExtra.length;if(stats[2])stats[2].textContent=hist.length;
    if(stats[3])stats[3].textContent=(counts['Programmazione']||0)+(counts['Web e API']||0)+(counts['Database']||0)+(counts['Reti']||0)+(counts['Sistemi operativi']||0);
    let p=box.querySelector('.release-breakdown');if(!p){p=document.createElement('p');p.className='release-breakdown privacy-note';box.appendChild(p)}
    p.textContent=`Programmazione ${counts['Programmazione']||0} · Web/API ${counts['Web e API']||0} · Database ${counts['Database']||0} · Reti ${counts['Reti']||0} · Sistemi ${counts['Sistemi operativi']||0} · Sicurezza/GDPR ${counts['Sicurezza e GDPR']||0} · BC/DR ${counts['Continuità operativa']||0} · Middleware ${counts['Middleware']||0} · Dominio ${counts['Servizi di dominio']||0} · Sistemistica ${counts['Sistemistica']||0}`;
  }catch(e){console.warn('Conteggio release non disponibile',e)}
}
function oralArena(){
  const prompts=Array.isArray(window.CONCORSO_ORAL_PROMPTS)?window.CONCORSO_ORAL_PROMPTS:[];
  if(!prompts.length)return;
  const p=prompts[Math.floor(Math.random()*prompts.length)],stage=document.getElementById('gameStage');if(!stage)return;
  stage.classList.remove('hidden');let sec=180;
  const renderTime=()=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  stage.innerHTML=`<h3>🎙️ Arena orale · ${p[0]}</h3><p class="oral-prompt">${p[1]}</p><div class="oral-timer" id="oralTimer">${renderTime()}</div><p><strong>Obiettivo:</strong> risposta strutturata in 3 minuti: inquadra il problema, indica verifiche e priorità, proponi soluzione e prevenzione.</p><details><summary>Mostra criteri di autovalutazione</summary><ol>${p[2].map(x=>`<li>${String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</li>`).join('')}</ol></details><button id="oralNext" class="secondary-btn" type="button">Nuova traccia</button>`;
  const t=setInterval(()=>{sec--;const e=document.getElementById('oralTimer');if(!e)return clearInterval(t);e.textContent=renderTime();if(sec<=0){clearInterval(t);e.textContent='00:00'}},1000);
  document.getElementById('oralNext').onclick=()=>{clearInterval(t);oralArena()};
}
(async()=>{
  for(const src of [
    './data/questions-programmazione-extra.js','./data/questions-webapi-extra.js','./data/questions-database-extra.js',
    './data/questions-orale-extra.js','./data/oral-bank-normalizer.js','./data/study-orale-extra.js'
  ])await loadScript(src);
  const fetchBase=window.fetch.bind(window);
  updateRelease(fetchBase);
  window.fetch=async(input,init)=>{
    const url=typeof input==='string'?input:input.url;
    if(url.endsWith('data/questions-scritta.json')){
      const [baseRes,histRes]=await Promise.all([fetchBase(input,init),fetchBase('data/questions-storiche.json',{...init,cache:'no-cache'})]);
      if(!baseRes.ok)return baseRes;const base=await baseRes.json(),hist=histRes.ok?await histRes.json():[];
      return new Response(JSON.stringify([...base,...hist]),{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});
    }
    if(url.endsWith('data/questions-orale.json')){
      const baseRes=await fetchBase(input,init);if(!baseRes.ok)return baseRes;const base=await baseRes.json(),extra=window.CONCORSO_ORAL_EXTRA_BANK||[];
      return new Response(JSON.stringify([...base,...extra]),{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});
    }
    if(url.endsWith('data/study-modules.json')){
      const baseRes=await fetchBase(input,init);if(!baseRes.ok)return baseRes;const base=await baseRes.json(),extra=window.CONCORSO_ORAL_STUDY||[];
      return new Response(JSON.stringify([...base,...extra]),{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});
    }
    return fetchBase(input,init);
  };
  await loadScript('./app-v2.js');
  const oralBtn=document.querySelector('[data-action="oral"]');if(oralBtn)oralBtn.onclick=oralArena;
})().catch(e=>{console.error(e);document.getElementById('main')?.insertAdjacentHTML('afterbegin','<div class="panel"><strong>Errore inizializzazione banche extra.</strong></div>')});
})();
