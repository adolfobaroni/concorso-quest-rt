#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),data=path.join(root,'data');
const errors=[],warnings=[],all=[];
const allowedStages=new Set(['preselettiva','scritta','orale']);
const allowedKinds=new Set(['bando-generated','practice-generated','bando-direct','rt-history-adapted','official-source','official-source-adapted']);
const unverifiedHistorical=new Set(['pre-eng-006','hist-2025-git-002','hist-2025-uml-001','hist-2025-db-005']);
for(const f of ['questions-preselettiva.json','questions-scritta.json','questions-orale.json','questions-storiche.json']){
  try{const a=JSON.parse(fs.readFileSync(path.join(data,f),'utf8'));if(!Array.isArray(a))throw new Error('root non array');all.push(...a.map(q=>({...q,__file:f})))}catch(e){errors.push(`${f}: JSON non valido (${e.message})`)}
}
const ctx={window:{CONCORSO_EXTRA_BANK:[],CONCORSO_ORAL_EXTRA_BANK:[]}};ctx.globalThis=ctx.window;vm.createContext(ctx);
const jsBanks=['questions-reti-extra.js','questions-linux-extra.js','questions-windows-extra.js','questions-programmazione-extra.js','questions-webapi-extra.js','questions-database-extra.js','questions-pa-digitale-extra.js','questions-casi-pratici-extra.js','questions-infra-storage-extra.js','questions-project-english-ai-extra.js','questions-orale-extra.js'];
for(const f of jsBanks){try{vm.runInContext(fs.readFileSync(path.join(data,f),'utf8'),ctx,{filename:f,timeout:3000})}catch(e){errors.push(`${f}: JS non eseguibile (${e.message})`)}}
for(const q of ctx.window.CONCORSO_EXTRA_BANK)if(!Number.isInteger(q.difficulty)||q.difficulty<1||q.difficulty>3)warnings.push(`extra-written:${q.id}: difficulty sorgente mancante/non valida; normalizzata a 2`);
try{vm.runInContext(fs.readFileSync(path.join(data,'written-bank-normalizer.js'),'utf8'),ctx,{filename:'written-bank-normalizer.js',timeout:3000})}catch(e){errors.push(`written-bank-normalizer.js: JS non eseguibile (${e.message})`)}
all.push(...ctx.window.CONCORSO_EXTRA_BANK.map(q=>({...q,__file:'extra-written'})),...ctx.window.CONCORSO_ORAL_EXTRA_BANK.map(q=>({...q,__file:'extra-oral'})));
const ids=new Map(),prompts=new Map(),dist=[0,0,0,0],topics={};
for(const q of all){
  const loc=`${q.__file}:${q.id||'<senza-id>'}`;topics[q.topic]=(topics[q.topic]||0)+1;
  if(!q.id||typeof q.id!=='string')errors.push(`${loc}: id mancante`);else if(ids.has(q.id))errors.push(`${loc}: id duplicato (gia in ${ids.get(q.id)})`);else ids.set(q.id,q.__file);
  if(!allowedStages.has(q.stage))errors.push(`${loc}: stage non valido ${q.stage}`);
  for(const k of ['topic','subtopic','prompt','explanation'])if(typeof q[k]!=='string'||!q[k].trim())errors.push(`${loc}: ${k} mancante`);
  if(!Array.isArray(q.options)||q.options.length<3||q.options.length>4)errors.push(`${loc}: options deve avere 3 o 4 risposte`);else{
    if(new Set(q.options.map(x=>String(x).trim().toLowerCase())).size!==q.options.length)errors.push(`${loc}: opzioni duplicate`);
    if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)errors.push(`${loc}: answer fuori range`);else if(q.options.length===4)dist[q.answer]++;
  }
  if(!Number.isInteger(q.difficulty)||q.difficulty<1||q.difficulty>3)errors.push(`${loc}: difficulty deve essere 1..3`);
  if(!q.source||typeof q.source!=='object'||!allowedKinds.has(q.source.kind))errors.push(`${loc}: source.kind non valido o mancante (${q.source?.kind||'none'})`);
  if(q.source?.kind==='rt-history-adapted'&&(!q.source.year||!q.source.ref))errors.push(`${loc}: storico senza year/ref`);
  if(unverifiedHistorical.has(q.id)&&q.source?.kind==='rt-history-adapted')warnings.push(`${loc}: provenienza storica non verificata; runtime la declassa a quesito didattico`);
  if(!Array.isArray(q.tags)||!q.tags.length)warnings.push(`${loc}: tags assenti`);
  const p=String(q.prompt||'').trim().toLowerCase().replace(/\s+/g,' ');if(p){if(prompts.has(p))warnings.push(`${loc}: prompt duplicato a ${prompts.get(p)}`);else prompts.set(p,loc)}
}
const total4=dist.reduce((a,b)=>a+b,0),pct=total4?dist.map(n=>Math.round(n/total4*100)):[0,0,0,0];
if(total4&&Math.max(...pct)-Math.min(...pct)>25)warnings.push(`Banca runtime sbilanciata A/B/C/D: ${dist.join('/')} (${pct.join('/')}%)`);
for(const f of ['index.html','app.js','app-v2.js','sw.js','manifest.webmanifest','data/written-bank-normalizer.js'])if(!fs.existsSync(path.join(root,f)))errors.push(`File richiesto mancante: ${f}`);
if(fs.existsSync(path.join(data,'release-meta.js')))errors.push('data/release-meta.js e obsoleto: la release deve avere una sola sorgente attiva');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const f of ['data/extra-loader.js','app.js'])if(!html.includes(f))errors.push(`index.html non carica ${f}`);
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');if(!app.includes('written-bank-normalizer.js'))errors.push('app.js non carica written-bank-normalizer.js');if(!app.includes('2026.08.12.4'))errors.push('app.js non contiene la release attesa 2026.08.12.4');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');if(!sw.includes('concorso-quest-rt-v9'))errors.push('sw.js non usa cache v9');if(!sw.includes('data/written-bank-normalizer.js'))errors.push('sw.js non mette in cache written-bank-normalizer.js');
console.log(`Quality gate: ${all.length} quesiti, ${ids.size} ID univoci, ${Object.keys(topics).length} topic.`);console.log(`Risposte runtime 4-opzioni A/B/C/D: ${dist.join('/')} (${pct.join('/')}%)`);console.log('Topic:',Object.entries(topics).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}=${v}`).join(' | '));
if(warnings.length){console.warn(`WARN (${warnings.length})`);warnings.slice(0,50).forEach(x=>console.warn(' - '+x));if(warnings.length>50)console.warn(` - ... altre ${warnings.length-50}`)}
if(errors.length){console.error(`ERROR (${errors.length})`);errors.forEach(x=>{console.error(' - '+x);console.error(`::error title=Quality gate::${x.replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A')}`)});process.exit(1)}
console.log('QUALITY GATE OK');
