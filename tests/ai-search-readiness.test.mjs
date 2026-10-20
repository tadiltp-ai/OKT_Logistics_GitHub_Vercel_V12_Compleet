import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root} from '../tools/build.mjs';

// Regression guards for public search discoverability. These do not change
// crawler policy, and CDN/WAF behaviour still requires production verification.
test('public robots policy points at canonical sitemap and protects API',()=>{
  const robots=fs.readFileSync(path.join(root,'public/robots.txt'),'utf8');
  const site=JSON.parse(fs.readFileSync(path.join(root,'content/site.json'),'utf8'));
  assert.match(robots,/^User-agent:\s*\*\s*$/m);
  assert.match(robots,/^Disallow:\s*\/api\/\s*$/m);
  assert.ok(robots.includes('Sitemap: '+site.domain+'/sitemap.xml'));
  for(const route of ['/','/koeltransport/','/vriestransport/','/contact/']){
    assert.ok(!robots.split(/\r?\n/).some(line=>line.trim()==='Disallow: '+route),'Public SEO route should not be explicitly disallowed: '+route);
  }
});

test('SEO pages are available for search crawlers after build',()=>{
  const site=JSON.parse(fs.readFileSync(path.join(root,'content/site.json'),'utf8'));
  const sitemap=fs.readFileSync(path.join(root,'public/sitemap.xml'),'utf8');
  for(const route of ['/', '/koeltransport/', '/vriestransport/', '/contact/']){
    const slug=route==='/'?'index':route.slice(1,-1);
    const html=fs.readFileSync(path.join(root,'public',slug+'.html'),'utf8');
    assert.ok(sitemap.includes('<loc>'+site.domain+route+'</loc>'),route+' missing in sitemap');
    assert.ok(html.includes('rel="canonical" href="'+site.domain+route+'"'),route+' missing canonical');
    assert.doesNotMatch(html,/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i);
    assert.match(html,/<h1\b/i);
  }
});
