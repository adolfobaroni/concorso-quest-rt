(()=>{'use strict';
let runs=0;
function shuffleList(list){
  if(!list||list.dataset.optionShuffle==='1')return;
  const buttons=[...list.querySelectorAll('button[data-answer]')];
  if(buttons.length<2)return;
  list.dataset.optionShuffle='1';
  const visual=[...buttons];
  for(let i=visual.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[visual[i],visual[j]]=[visual[j],visual[i]]}
  visual.forEach((b,i)=>{b.style.order=String(i);const label=b.querySelector('strong');if(label)label.textContent=String.fromCharCode(65+i)});
  runs++;
}
function scan(root=document){root.querySelectorAll?.('.answer-list').forEach(shuffleList)}
const observer=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('.answer-list'))shuffleList(n);scan(n)})));
function start(){scan();observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.CONCORSO_OPTION_SHUFFLER={get runs(){return runs},scan};
})();
