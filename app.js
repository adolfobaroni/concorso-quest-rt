(()=>{'use strict';
const nativeFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{
  const url=typeof input==='string'?input:input.url;
  if(url.endsWith('data/questions-scritta.json')){
    const [baseRes,histRes]=await Promise.all([
      nativeFetch(input,init),
      nativeFetch('data/questions-storiche.json',{...init,cache:'no-cache'})
    ]);
    if(!baseRes.ok)return baseRes;
    const base=await baseRes.json();
    const hist=histRes.ok?await histRes.json():[];
    return new Response(JSON.stringify([...base,...hist]),{
      status:200,
      headers:{'Content-Type':'application/json; charset=utf-8'}
    });
  }
  return nativeFetch(input,init);
};
const s=document.createElement('script');
s.src='./app-v2.js';
s.defer=true;
document.head.appendChild(s);
})();
