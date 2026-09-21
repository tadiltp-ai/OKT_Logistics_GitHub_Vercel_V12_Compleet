import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root} from '../tools/build.mjs';
import {prepareRedirects} from '../tools/routes.mjs';
test('redirect chains flatten and invalid destinations and cycles are rejected',()=>{
 assert.deepEqual(prepareRedirects({'/oud.html':'/tussen/','/tussen/':'/nieuw/'}),{'/oud/':'/nieuw/','/tussen/':'/nieuw/'});
 for(const input of [{'/a/':'/a/'},{'/a/':'/b/','/b/':'/a/'},{'/a/':'https://other.example/'}])assert.throws(()=>prepareRedirects(input));
});
test('sitemap matches indexable content and canonical/social URLs',()=>{
 const dir=path.join(root,'content');const site=JSON.parse(fs.readFileSync(path.join(dir,'site.json'),'utf8'));
 const sitemap=fs.readFileSync(path.join(root,'public/sitemap.xml'),'utf8');const expected=[];
 for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!['site.json','redirects.json'].includes(f))){
  const p=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));const slug=file.slice(0,-5);const url=site.domain+(slug==='index'?'/':`/${slug}/`);
  const html=fs.readFileSync(path.join(root,'public',slug+'.html'),'utf8');
  assert.ok(html.includes(`rel="canonical" href="${url}"`));assert.ok(html.includes(`property="og:url" content="${url}"`));
  assert.match(html,/<meta name="twitter:image"/);
  if(!['hidden','draft'].includes(p.type))expected.push(url);
 }
 const actual=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.deepEqual(actual.sort(),expected.sort());
 assert.ok(fs.readFileSync(path.join(root,'public/robots.txt'),'utf8').includes('Sitemap: '+site.domain+'/sitemap.xml'));
});

test('editorial dates are optional and agree with Article and sitemap',()=>{
 const dir=path.join(root,'content');const sitemap=fs.readFileSync(path.join(root,'public/sitemap.xml'),'utf8');
 for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!['site.json','redirects.json'].includes(f))){
  const p=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));const html=fs.readFileSync(path.join(root,'public',file.replace('.json','.html')),'utf8');
  const schemas=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  if(p.type==='article'){const article=schemas.find(s=>s['@type']==='Article');assert.equal(article.dateModified,p.lastModified);assert.equal(article.datePublished,p.datePublished);}
  if(p.lastModified&&!['hidden','draft'].includes(p.type))assert.ok(sitemap.includes(`<lastmod>${p.lastModified}</lastmod>`));
 }
});
