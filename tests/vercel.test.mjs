import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {pathToFileURL} from 'node:url';
import {root} from '../tools/build.mjs';
import '../tools/build-vercel.mjs';
test('Vercel artifact serves routes without building or writing at runtime',async()=>{
 const output=path.join(root,'.vercel/output');
 const fn=path.join(output,'functions/site.func');
 assert.ok(!fs.existsSync(path.join(fn,'tools/editor.mjs')));
 assert.ok(!fs.existsSync(path.join(fn,'.env')));
 assert.ok(!fs.existsSync(path.join(output,'static/content')));
 assert.ok(fs.existsSync(path.join(output,'static/assets')));
 const {default:handler}=await import(pathToFileURL(path.join(fn,'entry.mjs')));
 const server=http.createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const route of ['/','/contact/','/koeltransport-duitsland/','/sitemap.xml'])assert.equal((await fetch(base+route)).status,200);
  const redirect=await fetch(base+'/diepvriestransport.html?q=test',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'/vriestransport/?q=test');
  const config=JSON.parse(fs.readFileSync(path.join(output,'config.json'),'utf8'));
  for(const [from,to] of Object.entries(JSON.parse(fs.readFileSync(path.join(root,'content/redirects.json'),'utf8')))){
   for(const suffix of ['', '/']){
    const old=from.replace(/\/$/,'')+suffix;
    const rule=config.routes.find(r=>r.status===308&&new RegExp(r.src).test(old));
    assert.equal(rule?.headers.Location,to);
    const res=await fetch(base+old,{redirect:'manual'});assert.equal(res.status,301);assert.equal(res.headers.get('location'),to);
   }
   assert.equal((await fetch(base+to)).status,200);
  }
  for(const route of ['/unknown/','/content/site.json','/.env','/tools/editor.html'])assert.equal((await fetch(base+route)).status,404);
  assert.equal((await fetch(base+'/api/config').then(r=>r.json())).emailReady,false);
 }finally{await new Promise(r=>server.close(r));}
});
