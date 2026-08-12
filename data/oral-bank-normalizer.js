(()=>{'use strict';
const bank=Array.isArray(window.CONCORSO_ORAL_EXTRA_BANK)?window.CONCORSO_ORAL_EXTRA_BANK:[];
bank.forEach((q,i)=>{
  if(!Array.isArray(q.options)||q.options.length<2)return;
  const correct=q.options[q.answer],rot=(i*3+1)%q.options.length;
  q.options=q.options.slice(rot).concat(q.options.slice(0,rot));
  q.answer=q.options.indexOf(correct);
});
})();
