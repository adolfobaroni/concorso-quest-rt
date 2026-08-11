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
})();
