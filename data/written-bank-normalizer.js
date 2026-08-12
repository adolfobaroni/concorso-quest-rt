(()=>{'use strict';
const bank=Array.isArray(window.CONCORSO_EXTRA_BANK)?window.CONCORSO_EXTRA_BANK:[];
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
bank.forEach(q=>{
  if(!Number.isInteger(q.difficulty)||q.difficulty<1||q.difficulty>3)q.difficulty=2;
  if(!Array.isArray(q.tags))q.tags=[];
  if(!Array.isArray(q.options)||q.options.length<2||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)return;
  const correct=q.options[q.answer],rot=hash(q.id)%q.options.length;
  q.options=q.options.slice(rot).concat(q.options.slice(0,rot));
  q.answer=q.options.indexOf(correct);
});
})();
