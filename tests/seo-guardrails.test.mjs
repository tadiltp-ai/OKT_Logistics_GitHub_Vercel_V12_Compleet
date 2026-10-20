import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root} from '../tools/build.mjs';

// Guardrail: a routine deployment must never quietly hide commercial pages from Google.
// This test reads generated HTML after the normal build, without altering page content.
test('published Dutch pages retain indexability and unique canonical URLs',()=>{
  const dir=path.join(root,'content');
  const site=JSON.parse(fs.readFileSync(path.join(dir,'site.json'),'utf8'));
  const seen=new Set();
  for(const filename of fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!['site.json','redirects.json'].includes(f))){
    const slug=filename.slice(0,-5);
    const page=JSON.parse(fs.readFileSync(path.join(dir,filename),'utf8'));
    if(['hidden','draft'].includes(page.type))continue;
    const html=fs.readFileSync(path.join(root,'public',slug+'.html'),'utf8');
    const canonical=site.domain+(slug==='index'?'/':('/'+slug+'/'));
    assert.ok(html.includes('rel="canonical" href="'+canonical+'"'),slug+' canonical mismatch');
    assert.ok(!/\<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),slug+' unexpectedly noindex');
    assert.ok(!seen.has(canonical),'Duplicate canonical: '+canonical);
    seen.add(canonical);
    assert.equal((html.match(/<h1\b/gi)||[]).length,1,slug+' must have one H1');
  }
});
