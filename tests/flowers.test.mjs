import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {build,root} from '../tools/build.mjs';
build();
test('flower service has genuine responsive photograph, visible FAQs, and discoverable translated pages',()=>{
 const routes=JSON.parse(fs.readFileSync(path.join(root,'tools/language-routes.json'),'utf8'));
 for(const lang of ['nl','de','en']){
  const route=routes[lang].bloementransport,file=route.slice(1,-1).replaceAll('/','--')+'.html',h=fs.readFileSync(path.join(root,'public',file),'utf8');
  assert.ok(h.includes('okt-bloementransport-v1-3840.webp'));assert.match(h,/fetchpriority="high"/);
  const graph=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(graph.some(s=>s['@type']==='Service'&&s.url.endsWith(route)));
  assert.equal(graph.find(s=>s['@type']==='FAQPage').mainEntity.length,5);
  assert.ok(graph.some(s=>s['@type']==='BreadcrumbList'));
  const serviceRoute=routes[lang].diensten;const service=fs.readFileSync(path.join(root,'public',serviceRoute.slice(1,-1).replaceAll('/','--')+'.html'),'utf8');assert.ok(service.includes('href="'+route+'"'));
 }
 const dims=JSON.parse(fs.readFileSync(path.join(root,'tools/image-dimensions.json'),'utf8'));assert.deepEqual(dims['assets/okt-bloementransport-v1-3840.webp'],[3840,1683]);
});
