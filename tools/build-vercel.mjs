import fs from 'node:fs';
import path from 'node:path';
import {build,root} from './build.mjs';
build();
const output=path.resolve(root,'.vercel/output');
if(output!==path.join(root,'.vercel','output'))throw Error('Unexpected output path');
fs.rmSync(output,{recursive:true,force:true});
const fn=path.join(output,'functions/site.func'),staticDir=path.join(output,'static');
fs.mkdirSync(fn,{recursive:true});fs.mkdirSync(staticDir,{recursive:true});
for(const file of ['server.mjs','package.json'])fs.copyFileSync(path.join(root,file),path.join(fn,file));
for(const folder of ['tools','content','public'])fs.mkdirSync(path.join(fn,folder),{recursive:true});
for(const file of ['build.mjs','routes.mjs'])fs.copyFileSync(path.join(root,'tools',file),path.join(fn,'tools',file));
for(const file of ['site.json','redirects.json'])fs.copyFileSync(path.join(root,'content',file),path.join(fn,'content',file));
for(const file of fs.readdirSync(path.join(root,'public'))){
 const source=path.join(root,'public',file);
 if(file==='assets'){fs.cpSync(source,path.join(staticDir,file),{recursive:true});continue;}
 if(!fs.statSync(source).isFile())continue;
 fs.copyFileSync(source,path.join(fn,'public',file));
 if(/\.(css|js|svg)$/.test(file))fs.copyFileSync(source,path.join(staticDir,file));
}
fs.writeFileSync(path.join(fn,'entry.mjs'),"import {createApp} from './server.mjs';\nconst app=createApp();\nexport default function handler(req,res){app.emit('request',req,res);}\n");
fs.writeFileSync(path.join(fn,'.vc-config.json'),JSON.stringify({runtime:'nodejs22.x',handler:'entry.mjs',launcherType:'Nodejs',shouldAddHelpers:false,maxDuration:30},null,2));
fs.writeFileSync(path.join(output,'config.json'),JSON.stringify({version:3,routes:[{src:'/(.*)',headers:{'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'},continue:true},...(process.env.VERCEL_ENV==='preview'?[{src:'/(.*)',headers:{'X-Robots-Tag':'noindex, nofollow'},continue:true}]:[]),{handle:'filesystem'},{src:'/(.*)',dest:'/site'}]},null,2));
console.log('Vercel output ready: CDN assets and Node.js request handler.');
