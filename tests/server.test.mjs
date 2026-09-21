import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {build} from '../tools/build.mjs';
build();
const valid={company:'Testbedrijf',name:'Testpersoon',email:'test@example.com',phone:'',pickup:'Utrecht NL',delivery:'Essen DE',loadDate:'2099-01-01',unloadDate:'',temperature:'Volgens productspecificatie',pallets:'10',weight:'2000',goods:'Gekoelde goederen',mode:'FTL / complete vracht',message:'Lokale geautomatiseerde test',website:''};
async function app(options,fn){let clock=Date.now();const server=createApp({...options,now:()=>clock});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;try{await fn({base,advance:n=>clock+=n});}finally{await new Promise(r=>server.close(r));}}
async function prepare(base,advance){const c=await fetch(base+'/api/config').then(r=>r.json());advance(3000);return {'Content-Type':'application/json','X-Form-Token':c.token,'Idempotency-Key':'local-test-123456',Origin:base};}
test('clean URLs, redirects, anchors, 404 and private files',()=>app({env:{}},async({base})=>{
const home=await fetch(base+'/');assert.equal(home.status,200);const html=await home.text();assert.match(html,/href="\/diensten\/"/);assert.match(html,/href="\/#werkwijze"/);
for(const [from,to] of [['/index.html','/'],['/index','/'],['/diepvriestransport.html','/vriestransport/'],['/diepvriestransport','/vriestransport/'],['/levensmiddelen-transport.html?bron=test','/food-transport/?bron=test'],['/koeltransport.html','/koeltransport/'],['/diepvriestransport/','/vriestransport/'],['/levensmiddelen-transport/','/food-transport/']]){const r=await fetch(base+from,{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),to);}
for(const p of ['/missing/','/content/site.json','/.env','/server.mjs','/tools/editor.html','/assets/%2e%2e%5c%2e%2e%5c.env'])assert.ok([400,404].includes((await fetch(base+p)).status));
assert.equal((await fetch(base+'/kwaliteit/')).status,200);
}));
test('unconfigured form never claims success',()=>app({env:{},mailFetch:()=>{throw Error('Unexpected external call')}},async({base,advance})=>{
const config=await fetch(base+'/api/config').then(r=>r.json());assert.equal(config.emailReady,false);
const headers=await prepare(base,advance);const r=await fetch(base+'/api/quote',{method:'POST',headers,body:JSON.stringify(valid)});assert.equal(r.status,503);
}));
test('server validation, origin and bot checks',()=>app({env:{RESEND_API_KEY:'mock',MAIL_FROM:'sender@example.com',PRIVACY_READY:'true'}},async({base,advance})=>{
const headers=await prepare(base,advance);
for(const [change,status] of [[{company:''},400],[{email:'a\nb@example.com'},400],[{loadDate:'2020-02-30'},400],[{pallets:'-1'},400],[{website:'bot'},400]]){const r=await fetch(base+'/api/quote',{method:'POST',headers,body:JSON.stringify({...valid,...change})});assert.equal(r.status,status);}
assert.equal((await fetch(base+'/api/quote',{method:'POST',headers:{...headers,Origin:'https://other.example'},body:JSON.stringify(valid)})).status,403);
}));
test('mail provider accepted and rejected paths with local mock only',async()=>{
let sent;
await app({env:{RESEND_API_KEY:'mock',MAIL_FROM:'sender@example.com',PRIVACY_READY:'true'},mailFetch:async(url,opts)=>{sent={url,...opts};return new Response(JSON.stringify({id:'local-mock-reference'}),{status:200});}},async({base,advance})=>{
const headers=await prepare(base,advance);const r=await fetch(base+'/api/quote',{method:'POST',headers,body:JSON.stringify(valid)});assert.equal(r.status,200);assert.equal((await r.json()).reference,'local-mock-reference');const payload=JSON.parse(sent.body);assert.deepEqual(payload.to,['operations@okttrans.nl']);assert.equal(payload.reply_to,valid.email);assert.match(payload.text,/2099-01-01/);assert.equal(sent.headers['Idempotency-Key'],'okt-local-test-123456');});
await app({env:{RESEND_API_KEY:'mock',MAIL_FROM:'sender@example.com',PRIVACY_READY:'true'},mailFetch:async()=>new Response('{}',{status:500})},async({base,advance})=>{const headers=await prepare(base,advance);assert.equal((await fetch(base+'/api/quote',{method:'POST',headers,body:JSON.stringify(valid)})).status,502);});
});

test('compression negotiation preserves content and HEAD headers',()=>app({env:{}},async({base})=>{
 const plain=await fetch(base+'/',{headers:{'Accept-Encoding':'identity'}});const text=await plain.text();
 const zipped=await fetch(base+'/',{headers:{'Accept-Encoding':'gzip'}});assert.equal(zipped.headers.get('content-encoding'),'gzip');assert.equal(zipped.headers.get('vary'),'Accept-Encoding');assert.equal(await zipped.text(),text);
 const head=await fetch(base+'/',{method:'HEAD',headers:{'Accept-Encoding':'gzip'}});assert.equal(head.headers.get('content-length'),zipped.headers.get('content-length'));assert.equal(await head.text(),'');
 const excluded=await fetch(base+'/',{headers:{'Accept-Encoding':'gzip;q=0, *;q=1'}});assert.equal(excluded.headers.get('content-encoding'),null);
 assert.ok(Number(zipped.headers.get('content-length'))<Number(plain.headers.get('content-length')));
}));

test('Vercel requires persistent form configuration and previews discourage indexing',()=>app({env:{VERCEL:'1',VERCEL_ENV:'preview',RESEND_API_KEY:'mock',MAIL_FROM:'mock@example.com',PRIVACY_READY:'true'}},async({base})=>{
 const r=await fetch(base+'/api/config');assert.equal((await r.json()).emailReady,false);assert.equal(r.headers.get('x-robots-tag'),'noindex, nofollow');
}));
