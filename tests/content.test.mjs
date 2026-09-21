import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root} from '../tools/build.mjs';
const pub=path.join(root,'public'),content=path.join(root,'content');
const names=fs.readdirSync(content).filter(n=>n.endsWith('.json')&&!['site.json','redirects.json'].includes(n));
const pages=names.map(n=>({slug:n.slice(0,-5),...JSON.parse(fs.readFileSync(path.join(content,n),'utf8'))}));
test('all pages have unique metadata, valid schema and no excluded claims',()=>{
 const titles=new Set(),descriptions=new Set();
 for(const p of pages){
  assert.ok(p.title&&p.description,p.slug);assert.ok(!titles.has(p.title),'duplicate title: '+p.slug);titles.add(p.title);assert.ok(!descriptions.has(p.description),'duplicate description: '+p.slug);descriptions.add(p.description);
  const s=fs.readFileSync(path.join(pub,p.slug+'.html'),'utf8');
  assert.equal((s.match(/<h1[\s>]/g)||[]).length,1,p.slug);
  assert.match(s,/rel="canonical"/);assert.match(s,/rel="icon"/);assert.match(s,/property="og:image"/);
  for(const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert.ok(Array.isArray(JSON.parse(m[1])));
  assert.doesNotMatch(p.main,/certific|temperatuurregistratie|registratie|rapportage|meetgegevens|website-opbouw/i,p.slug);
 }
 assert.equal(pages.filter(p=>p.type==='article').length,10);
});
test('all local links, anchors and responsive images exist; commercial pages within two clicks',()=>{
 const graph=new Map();
 for(const p of pages){
  const s=fs.readFileSync(path.join(pub,p.slug+'.html'),'utf8'),targets=[];
  for(const m of s.matchAll(/(?:href|src)="([^"]*)"/g)){
   const ref=m[1].replace(/&amp;/g,'&');if(/^(?:[a-z]+:|\/\/)/i.test(ref))continue;
   const u=new URL(ref,'http://local/'+p.slug+'.html'),filename=decodeURIComponent(u.pathname.slice(1)),target=path.join(pub,filename);
   assert.ok(fs.existsSync(target),`${p.slug}: ${ref}`);
   if(filename.endsWith('.html')){targets.push(filename.slice(0,-5));if(u.hash){const t=fs.readFileSync(target,'utf8');assert.ok(t.includes(`id="${u.hash.slice(1)}"`),`${p.slug}: ${ref}`);}}
  }
  for(const m of s.matchAll(/srcset="([^"]*)"/g))for(const variant of m[1].split(','))assert.ok(fs.existsSync(path.join(pub,variant.trim().split(' ')[0])));
  graph.set(p.slug,targets);
 }
 const distances=new Map([['index',0]]),queue=['index'];
 while(queue.length){const current=queue.shift();for(const next of graph.get(current)||[])if(!distances.has(next)){distances.set(next,distances.get(current)+1);queue.push(next);}}
 for(const p of pages)if(!['hidden','draft'].includes(p.type))assert.ok(distances.get(p.slug)<=2,`${p.slug} is more than two clicks away`);
});
