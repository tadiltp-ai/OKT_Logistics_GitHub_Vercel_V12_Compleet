import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {build,root} from '../tools/build.mjs';
import {englishPages} from '../tools/english.mjs';
import {createApp} from '../server.mjs';
build();
const pub=path.join(root,'public');
const read=f=>fs.readFileSync(path.join(pub,f),'utf8');
test('every English page has reciprocal alternates, its own metadata, valid local links and dimensions',()=>{
 for(const p of englishPages){
  const html=read(p.route.slice(1,-1).replaceAll('/','--')+'.html');
  assert.match(html,/<html lang="en">/);assert.ok(html.includes('content="en_GB"'));
  assert.ok(html.includes(`rel="canonical" href="https://www.oktlogisticholland.com${p.route}"`));
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  for(const lang of ['nl','en','x-default']){const tag=html.match(new RegExp('<link rel="alternate" hreflang="'+lang+'"[^>]+>'))?.[0];assert.ok(tag);assert.ok(read(p.nl+'.html').includes(tag));}
  for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(/^[a-z]+:/.test(m[1]))continue;
   const u=new URL(m[1],'https://local/');let file=u.pathname.slice(1);if(!file)file='index.html';else if(file.endsWith('/'))file=file.slice(0,-1).replaceAll('/','--')+'.html';
   assert.ok(fs.existsSync(path.join(pub,file)),p.route+' '+m[1]);
  }
 }
});
test('images, headings, structured data and sitemap are consistent',()=>{
 const home=read('index.html');const count=(home.match(/<h2[ >]/g)||[]).length;assert.ok(count>=6&&count<=8,'home H2: '+count);
 assert.match(home,/<link rel="preload" as="image"[^>]*homepage-lineage/);
 const hero=home.match(/<img[^>]*homepage-lineage[^>]*>/)[0];assert.match(hero,/loading="eager"/);assert.match(hero,/fetchpriority="high"/);assert.match(hero,/960w/);
 const files=fs.readdirSync(pub).filter(f=>f.endsWith('.html'));
 for(const f of files){const html=read(f);for(const m of html.matchAll(/<img\b[^>]*>/g)){assert.match(m[0],/width="\d+"/);assert.match(m[0],/height="\d+"/);assert.match(m[0],/loading="(?:lazy|eager)"/);}
  for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))for(const s of JSON.parse(m[1])){
   assert.ok(s['@context']==='https://schema.org');
   if(s['@type']==='FAQPage'){assert.equal(s.mainEntity.length,(html.match(/<summary/g)||[]).length);for(const q of s.mainEntity)assert.ok(q.name&&q.acceptedAnswer.text);}
  }
 }
 const xml=read('sitemap.xml');assert.equal((xml.match(/<loc>/g)||[]).length,(xml.match(/<lastmod>/g)||[]).length);
});
test('old routes, nested English routes, cache policy and original CSP work through the server',async()=>{
 const app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+app.address().port;
 try{
  const redirects=JSON.parse(fs.readFileSync(path.join(root,'content/redirects.json'),'utf8'));
  for(const [from,to] of Object.entries(redirects))for(const suffix of ['', '/']){const res=await fetch(origin+from.replace(/\/$/,'')+suffix+'?source=old',{redirect:'manual'});assert.equal(res.status,301);assert.equal(res.headers.get('location'),to+'?source=old');}
  const en=await fetch(origin+'/en',{redirect:'manual'});assert.equal(en.headers.get('location'),'/en/');
  for(const p of englishPages)assert.equal((await fetch(origin+p.route)).status,200);
  const page=await fetch(origin+'/');assert.ok(page.headers.get('content-security-policy').includes("base-uri 'self'"));assert.equal(((await page.text()).match(/<base /g)||[]).length,1);
  const css=await fetch(origin+'/style.css');assert.equal(css.headers.get('cache-control'),'public, max-age=31536000, immutable');
  assert.equal((await fetch(origin+'/not-an-old-route/')).status,404);
 }finally{await new Promise(r=>app.close(r));}
});
