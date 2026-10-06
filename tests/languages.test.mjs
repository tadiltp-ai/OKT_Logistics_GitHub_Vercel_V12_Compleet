import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {build,root} from '../tools/build.mjs';
import {createApp} from '../server.mjs';
build();
const routes=JSON.parse(fs.readFileSync(path.join(root,'tools/language-routes.json'),'utf8'));
test('all 66 approved translations have live metadata, reciprocal languages and matching forms',async()=>{
 const app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+app.address().port;
 try{for(const lang of ['en','de'])for(const [slug,route] of Object.entries(routes[lang])){
  const response=await fetch(origin+route);assert.equal(response.status,200,route);const h=await response.text();
  assert.ok(h.includes('<html lang="'+lang+'">'));assert.doesNotMatch(h,/127\.0\.0\.1|href="\/nl\//);
  assert.ok(h.includes('rel="canonical" href="https://www.oktlogisticholland.com'+route+'"'));
  const p=JSON.parse(fs.readFileSync(path.join(root,'content',slug+'.json'),'utf8'));
  if(!['hidden','draft'].includes(p.type))assert.doesNotMatch(h,/<meta name="robots" content="noindex/);
  for(const l of ['nl','en','de'])assert.ok(h.includes('hreflang="'+l+'" href="https://www.oktlogisticholland.com'+routes[l][slug]+'"'));
  const nl=fs.readFileSync(path.join(root,'public',slug+'.html'),'utf8');
  assert.deepEqual([...h.matchAll(/name="([^"]+)"/g)].map(m=>m[1]).filter(n=>!['robots'].includes(n)).sort(),[...nl.matchAll(/name="([^"]+)"/g)].map(m=>m[1]).filter(n=>!['robots'].includes(n)).sort());
  assert.ok(response.headers.get('content-security-policy').includes("script-src 'self'"));
 }
 for(const lang of ['de','en']){const r=await fetch(origin+'/'+lang,{redirect:'manual'});assert.equal(r.headers.get('location'),'/'+lang+'/');}
 }finally{await new Promise(r=>app.close(r));}
});
