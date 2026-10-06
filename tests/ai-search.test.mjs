import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root} from '../tools/build.mjs';
test('Dutch and English entity graphs connect pages, services and the same company',()=>{
 for(const file of fs.readdirSync(path.join(root,'public')).filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,'public',file),'utf8');
  if(/http-equiv="refresh"/i.test(html))continue;
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org=graph.find(x=>[].concat(x['@type']).includes('Organization'));
  const page=graph.find(x=>['WebPage','AboutPage','ContactPage'].includes(x['@type']));
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert.equal(page.url,canonical,file);assert.equal(page.about['@id'],org['@id'],file);
  assert.equal(org.identifier.value,'97914037');
  assert.deepEqual(graph.find(x=>x['@type']==='WebSite').inLanguage,['nl-NL','en-GB','de-DE']);
  for(const service of graph.filter(x=>x['@type']==='Service'))assert.equal(service.provider['@id'],org['@id']);
 }
 const robots=fs.readFileSync(path.join(root,'public/robots.txt'),'utf8');
 assert.match(robots,/User-agent: \*\nDisallow: \/api\//);
 assert.doesNotMatch(robots,/Disallow: \/\s*$/m);
});
