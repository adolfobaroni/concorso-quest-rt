(()=>{'use strict';
const VERSION='2026.08.11.2',RELEASE_DATE='11/08/2026';
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
    const all=[...pre,...wr,...oral,...hist],counts={};all.forEach(q=>counts[q.topic]=(counts[q.topic]||0)+1);
    const box=document.querySelector('section[aria-label="Versione e contenuti disponibili"]');if(!box)return;
    const h=box.querySelector('h3'),pill=box.querySelector('.status-pill'),stats=box.querySelectorAll('.stat strong');
    if(h)h.textContent=`Versione ${VERSION}`;if(pill)pill.textContent=RELEASE_DATE;
    if(stats[0])stats[0].textContent=all.length;if(stats[1])stats[1].textContent=study.length;if(stats[2])stats[2].textContent=hist.length;
    if(stats[3])stats[3].textContent=(counts['Programmazione']||0)+(counts['Web e API']||0)+(counts['Database']||0)+(counts['Reti']||0)+(counts['Sistemi operativi']||0);
    let p=box.querySelector('.release-breakdown');if(!p){p=document.createElement('p');p.className='release-breakdown privacy-note';box.appendChild(p)}
    p.textContent=`Programmazione ${counts['Programmazione']||0} · Web/API ${counts['Web e API']||0} · Database ${counts['Database']||0} · Reti ${counts['Reti']||0} · Sistemi ${counts['Sistemi operativi']||0}`;
  }catch(e){console.warn('Conteggio release non disponibile',e)}
}
(async()=>{
  for(const src of ['./data/questions-programmazione-extra.js','./data/questions-webapi-extra.js','./data/questions-database-extra.js'])await loadScript(src);
  const fetchBase=window.fetch.bind(window);
  updateRelease(fetchBase);
  window.fetch=async(input,init)=>{
    const url=typeof input==='string'?input:input.url;
    if(url.endsWith('data/questions-scritta.json')){
      const [baseRes,histRes]=await Promise.all([fetchBase(input,init),fetchBase('data/questions-storiche.json',{...init,cache:'no-cache'})]);
      if(!baseRes.ok)return baseRes;const base=await baseRes.json(),hist=histRes.ok?await histRes.json():[];
      return new Response(JSON.stringify([...base,...hist]),{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});
    }
    return fetchBase(input,init);
  };
  await loadScript('./app-v2.js');
})().catch(e=>{console.error(e);document.getElementById('main')?.insertAdjacentHTML('afterbegin','<div class="panel"><strong>Errore inizializzazione banche extra.</strong></div>')});
})();
