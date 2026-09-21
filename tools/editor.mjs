import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {build,root} from './build.mjs';
const token=crypto.randomBytes(32).toString('hex'),port=Number(process.env.EDITOR_PORT||8932),origin=`http://127.0.0.1:${port}`;
const dir=path.join(root,'content'),allowed=name=>/^[a-z0-9][a-z0-9-]*$/.test(name)&&!['site','redirects','api','assets','admin','editor','public','content','tools','tests'].includes(name);
function list(){return fs.readdirSync(dir).filter(x=>x.endsWith('.json')&&!['site.json','redirects.json'].includes(x)).map(x=>({slug:x.slice(0,-5),...JSON.parse(fs.readFileSync(path.join(dir,x),'utf8'))}));}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Frame-Options','DENY');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json;charset=utf-8'});res.end(JSON.stringify(value));};
 if(req.headers.host!==`127.0.0.1:${port}`)return json(403,{error:'Gebruik het lokale beheeradres.'});
 if(req.method==='GET'&&req.url==='/'){res.setHeader('Content-Type','text/html;charset=utf-8');return res.end(fs.readFileSync(path.join(root,'tools/editor.html'),'utf8').replace('__TOKEN__',token));}
 if(req.method==='GET'&&req.url==='/api/pages')return json(200,list());
 if(req.method!=='POST'||req.url!=='/api/save')return json(404,{error:'Niet gevonden.'});
 if(req.headers.origin!==origin||req.headers['x-editor-token']!==token)return json(403,{error:'Ongeldige beheersessie.'});
 let raw='';try{for await(const chunk of req){raw+=chunk;if(raw.length>300000)return json(413,{error:'Pagina te groot.'});}}catch{return json(400,{error:'Opslaan afgebroken.'});}
 let d;try{d=JSON.parse(raw)}catch{return json(400,{error:'Ongeldige gegevens.'});}
 if(!d||!allowed(d.slug||'')||!allowed(d.oldSlug||'')||!['page','service','article','draft','hidden'].includes(d.type)||typeof d.title!=='string'||typeof d.description!=='string'||typeof d.main!=='string')return json(400,{error:'Ongeldige pagina.'});
 if(!d.title.trim()||d.title.length>180||!d.description.trim()||d.description.length>500)return json(400,{error:'Vul een titel (max. 180) en beschrijving (max. 500) in.'});
 if(!/^<main[\s>]/.test(d.main)||!/<\/main>$/.test(d.main.trim())||(d.main.match(/<h1[\s>]/g)||[]).length!==1||/<(?:script|iframe|object|embed|base|meta|link)\b/i.test(d.main)||/\son\w+\s*=|javascript:|srcdoc\s*=/i.test(d.main))return json(400,{error:'De inhoud moet één main-blok en één H1 bevatten, zonder scripts of ingesloten toepassingen.'});
 const old=path.join(dir,d.oldSlug+'.json'),target=path.join(dir,d.slug+'.json');
 if(!fs.existsSync(old))return json(404,{error:'Pagina niet gevonden.'});
 if(d.oldSlug==='index'&&d.slug!=='index')return json(400,{error:'De homepage behoudt de naam index.'});
 if(old!==target&&fs.existsSync(target))return json(409,{error:'Deze URL-naam bestaat al.'});
 try{
  const backup=path.join(root,'backups',new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex'));
  fs.mkdirSync(backup,{recursive:true});fs.cpSync(dir,path.join(backup,'content'),{recursive:true});
  const previous=JSON.parse(fs.readFileSync(old,'utf8'));
  const page={...previous,title:d.title.trim(),description:d.description.trim(),main:d.main,type:d.type};
  if(old!==target||['title','description','main','type'].some(key=>page[key]!==previous[key]))page.lastModified=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Amsterdam'});
  fs.writeFileSync(target,JSON.stringify(page,null,2));
  if(old!==target){
   for(const p of list()){const full=path.join(dir,p.slug+'.json');const value=JSON.parse(fs.readFileSync(full,'utf8'));value.main=value.main.replace(new RegExp('(href=["\\\'])'+d.oldSlug+'\\.html(?=[#"\\\'])','g'),'$1'+d.slug+'.html');fs.writeFileSync(full,JSON.stringify(value,null,2));}
   const rpath=path.join(dir,'redirects.json'),r=JSON.parse(fs.readFileSync(rpath,'utf8'));
   for(const key of Object.keys(r))if(r[key]===`/${d.oldSlug}/`)r[key]=`/${d.slug}/`;
   r[`/${d.oldSlug}/`]=`/${d.slug}/`;fs.writeFileSync(rpath,JSON.stringify(r,null,2));fs.unlinkSync(old);
  }
  build();return json(200,{ok:true,slug:d.slug,message:'Opgeslagen en website bijgewerkt. Herstart de websiteserver na een URL-wijziging.'});
 }catch{return json(500,{error:'Opslaan is niet afgerond. Controleer de backup voordat u doorgaat.'});}
});
server.listen(port,'127.0.0.1',()=>console.log(`Lokaal tekstbeheer: ${origin}`));
