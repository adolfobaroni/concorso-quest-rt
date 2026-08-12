const CACHE='concorso-quest-rt-v11';
const CORE=[
  './','./index.html','./styles.css','./archive.css','./app.js','./app-v2.js','./manifest.webmanifest','./icon.svg','./data/build-info.js',
  './data/questions-preselettiva.json','./data/questions-scritta.json','./data/questions-orale.json','./data/questions-storiche.json','./data/study-modules.json','./data/exam-archive.json','./data/exam-archive.js',
  './data/questions-reti-extra.js','./data/questions-linux-extra.js','./data/questions-windows-extra.js',
  './data/questions-programmazione-extra.js','./data/questions-webapi-extra.js','./data/questions-database-extra.js',
  './data/questions-pa-digitale-extra.js','./data/questions-casi-pratici-extra.js','./data/questions-infra-storage-extra.js','./data/questions-project-english-ai-extra.js',
  './data/written-bank-normalizer.js','./data/runtime-option-shuffle.js','./data/questions-orale-extra.js','./data/oral-bank-normalizer.js','./data/study-orale-extra.js','./data/oral-evaluator.js','./data/written-lab.js','./data/extra-loader.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
