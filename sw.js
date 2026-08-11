const CACHE='concorso-quest-rt-v5';
const CORE=[
  './','./index.html','./styles.css','./app.js','./app-v2.js','./manifest.webmanifest','./icon.svg',
  './data/questions-preselettiva.json','./data/questions-scritta.json','./data/questions-orale.json','./data/questions-storiche.json','./data/study-modules.json',
  './data/questions-reti-extra.js','./data/questions-linux-extra.js','./data/questions-windows-extra.js',
  './data/questions-programmazione-extra.js','./data/questions-webapi-extra.js','./data/questions-database-extra.js','./data/extra-loader.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
