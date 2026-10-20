import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root} from '../tools/build.mjs';

const read=slug=>fs.readFileSync(path.join(root,'public',slug+'.html'),'utf8');

test('Germany service landing page has one focused canonical and indexable content',()=>{
  const site=JSON.parse(fs.readFileSync(path.join(root,'content/site.json'),'utf8'));
  const html=read('koeltransport-duitsland');
  const canonical=site.domain+'/koeltransport-duitsland/';
  assert.ok(html.includes('rel="canonical" href="'+canonical+'"'));
  assert.equal([...html.matchAll(/<h1\b/gi)].length,1);
  assert.match(html,/<h1[^>]*>Koeltransport naar Duitsland vanuit Nederland<\/h1>/);
  assert.match(html,/Essen/);
  assert.match(html,/Hückelhoven/);
  assert.match(html,/Hannover/);
  assert.ok(!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html));
  const sitemap=fs.readFileSync(path.join(root,'public/sitemap.xml'),'utf8');
  assert.ok(sitemap.includes('<loc>'+canonical+'</loc>'));
});

test('Germany landing page is accessible through relevant internal links',()=>{
  for(const slug of ['index','koeltransport','internationaal-koeltransport','groupage-koeltransport']){
    const html=read(slug);
    assert.match(html,/href="\/koeltransport-duitsland\/"/,'Missing Germany link from '+slug);
  }
});

test('Germany service page maintains customer contact path',()=>{
  const html=read('koeltransport-duitsland');
  assert.match(html,/href="\/contact\/"/);
  assert.match(html,/data-quote-form/);
});
