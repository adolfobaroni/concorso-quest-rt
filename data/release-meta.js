(()=>{'use strict';
const VERSION='2026.08.11.2';
const RELEASE_DATE='11/08/2026';
async function json(path){const r=await fetch(path,{cache:'no-cache'});return r.ok?await r.json():[]}
async function update(){
  try{
    const [pre,written,oral,hist,study]=await Promise.all([
      json('data/questions-preselettiva.json'),json('data/questions-scritta.json'),json('data/questions-orale.json'),json('data/questions-storiche.json'),json('data/study-modules.json')
    ]);
    const extra=Array.isArray(window.CONCORSO_EXTRA_BANK)?window.CONCORSO_EXTRA_BANK:[];
    const all=[...pre,...written,...oral,...hist,...extra];
    const n=id=>document.getElementById(id);
    if(n('releaseVersion'))n('releaseVersion').textContent=`Versione ${VERSION}`;
    if(n('releaseDate'))n('releaseDate').textContent=RELEASE_DATE;
    if(n('releaseQuizCount'))n('releaseQuizCount').textContent=all.length;
    if(n('releaseStudyCount'))n('releaseStudyCount').textContent=study.length;
    if(n('releaseHistoryCount'))n('releaseHistoryCount').textContent=hist.length;
    if(n('releaseCoreCount')){
      const topics=new Set(['Reti','Sistemi operativi','Database','Web e API','Programmazione']);
      n('releaseCoreCount').textContent=all.filter(q=>topics.has(q.topic)).length;
    }
    const counts={}; all.forEach(q=>counts[q.topic]=(counts[q.topic]||0)+1);
    if(n('releaseBreakdown'))n('releaseBreakdown').textContent=`Programmazione ${counts['Programmazione']||0} · Web/API ${counts['Web e API']||0} · Database ${counts['Database']||0} · Reti ${counts['Reti']||0} · Sistemi ${counts['Sistemi operativi']||0}`;
  }catch(e){console.warn('Release metadata non disponibile',e)}
}
window.addEventListener('DOMContentLoaded',update,{once:true});
})();
