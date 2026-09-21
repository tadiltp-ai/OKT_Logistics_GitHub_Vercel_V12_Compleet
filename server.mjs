import {gzipSync} from 'node:zlib';
import http from 'node:http';
import {normalizePageRoute,prepareRedirects} from './tools/routes.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {build,root} from './tools/build.mjs';
const publicDir=path.join(root,'public');
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
export function createApp({env=process.env,mailFetch=fetch,now=Date.now}={}){
 const secret=env.FORM_TOKEN_SECRET||crypto.randomBytes(32), rates=new Map();
 const site=JSON.parse(fs.readFileSync(path.join(root,'content/site.json'),'utf8'));
 const redirects=prepareRedirects(JSON.parse(fs.readFileSync(path.join(root,'content/redirects.json'),'utf8')));
 const emailReady=!!(env.RESEND_API_KEY&&env.MAIL_FROM&&env.PRIVACY_READY==='true'&&(!env.VERCEL||(env.FORM_TOKEN_SECRET?.length>=32&&env.PUBLIC_ORIGIN)));
 const sign=time=>time+'.'+crypto.createHmac('sha256',secret).update(String(time)).digest('hex');
 function tokenValid(token){const [stamp,mac]=String(token||'').split('.');const age=now()-Number(stamp);if(!/^[a-f0-9]{64}$/.test(mac||'')||!Number.isFinite(age)||age<2000||age>7200000)return false;const expected=sign(stamp).split('.')[1];return mac.length===expected.length&&crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(expected));}
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.google-analytics.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:"};
 return http.createServer(async(req,res)=>{
  for(const [k,v] of Object.entries(headers))res.setHeader(k,v);
  if(env.VERCEL_ENV==='preview')res.setHeader('X-Robots-Tag','noindex, nofollow');
  const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  let url;try{url=new URL(req.url,'http://localhost');}catch{return json(400,{error:'Ongeldig adres.'});}
  const pathname=url.pathname;
  if(pathname==='/api/config'&&req.method==='GET')return json(200,{emailReady,gaId:/^G-[A-Z0-9]+$/.test(env.GA4_ID||'')?env.GA4_ID:'',token:sign(now())});
  if(pathname==='/api/quote'){
   if(req.method!=='POST')return json(405,{error:'Gebruik het aanvraagformulier.'});
   const allowedOrigin=env.PUBLIC_ORIGIN||(env.VERCEL?site.domain:`http://${req.headers.host}`);
   if(req.headers.origin!==allowedOrigin)return json(403,{error:'Verstuur vanaf deze website.'});
   if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Ongeldige aanvraag.'});
   const ip=req.socket.remoteAddress;const bucket=rates.get(ip)||{count:0,start:now()};
   if(now()-bucket.start>600000){bucket.count=0;bucket.start=now();}bucket.count++;rates.set(ip,bucket);
   if(rates.size>10000)for(const [k,v] of rates)if(now()-v.start>600000)rates.delete(k);
   if(bucket.count>8)return json(429,{error:'Te veel aanvragen. Probeer het over enkele minuten opnieuw.'});
   if(!tokenValid(req.headers['x-form-token']))return json(403,{error:'Ververs de pagina en probeer opnieuw. Uw aanvraag kan ook per e-mail worden verstuurd.'});
   let raw='',oversized=false;
   try{for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>20000){oversized=true;break;}}}catch{return json(400,{error:'Aanvraag niet ontvangen.'});}
   if(oversized)return json(413,{error:'De aanvraag is te lang.'});
   let d;try{d=JSON.parse(raw)}catch{return json(400,{error:'Ongeldige aanvraag.'});}
   if(!d||Array.isArray(d)||typeof d!=='object')return json(400,{error:'Ongeldige aanvraag.'});
   if(d.website)return json(400,{error:'De aanvraag kon niet worden verwerkt.'});
   const required=['company','name','email','pickup','delivery','loadDate','temperature','goods','mode'];
   if(required.some(k=>typeof d[k]!=='string'||!d[k].trim()))return json(400,{error:'Vul alle verplichte velden in.'});
   if(Object.values(d).some(v=>typeof v!=='string'||v.length>3000)||Object.entries(d).some(([k,v])=>k!=='message'&&v.length>160))return json(400,{error:'Een veld bevat te veel tekst.'});
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)||/[\r\n]/.test(d.email))return json(400,{error:'Vul een geldig e-mailadres in.'});
   const today=new Date(now()).toLocaleDateString('sv-SE',{timeZone:'Europe/Amsterdam'});
   if(!/^\d{4}-\d{2}-\d{2}$/.test(d.loadDate)||!Number.isFinite(Date.parse(d.loadDate))||new Date(d.loadDate).toISOString().slice(0,10)!==d.loadDate||d.loadDate<today)return json(400,{error:'Kies een geldige laaddatum vanaf vandaag.'});
   if(!['FTL / complete vracht','Groupage / deellading','Graag advies'].includes(d.mode))return json(400,{error:'Kies een transportvorm.'});
   for(const key of ['pallets','weight'])if(d[key]&&!/^[1-9]\d{0,6}$/.test(d[key]))return json(400,{error:'Vul een positief geheel aantal pallets en gewicht in.'});
   if(!emailReady)return json(503,{error:'Online verzending is nog niet actief. Gebruik e-mail of download uw aanvraag.'});
   const id=req.headers['idempotency-key'];if(!/^[a-zA-Z0-9-]{8,80}$/.test(id||''))return json(400,{error:'Ververs de pagina voor een nieuwe aanvraag.'});
   const labels={company:'Bedrijfsnaam',name:'Contactpersoon',email:'E-mail',phone:'Telefoon',pickup:'Laadplaats',delivery:'Losplaats',loadDate:'Laaddatum',unloadDate:'Losdatum / tijdvenster',temperature:'Temperatuur',pallets:'Pallets',weight:'Gewicht kg',goods:'Goederen',mode:'Transportvorm',message:'Opmerking'};
   const text=Object.entries(labels).map(([k,label])=>label+': '+(d[k]||'Niet opgegeven')).join('\n');
   try{
    const response=await mailFetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'okt-'+id},body:JSON.stringify({from:env.MAIL_FROM,to:[site.email],reply_to:d.email,subject:'Nieuwe transportaanvraag — OKT Logistics',text})});
    if(!response.ok)return json(502,{error:'De e-maildienst kon de aanvraag niet accepteren. Probeer opnieuw of mail rechtstreeks.'});
    const result=await response.json();if(!result.id)return json(502,{error:'Geen bevestiging van de e-maildienst ontvangen.'});
    return json(200,{reference:result.id});
   }catch{return json(502,{error:'Verzending kon niet worden bevestigd. Probeer opnieuw of neem rechtstreeks contact op.'});}
  }
  if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Niet toegestaan.'});
  let route=pathname;
  const normalized=normalizePageRoute(route);
  const destination=redirects[normalized]||normalized;
  if(destination!==route)return redirect(destination);
  function redirect(target){res.writeHead(301,{Location:target+url.search});res.end();}
  let decoded;try{decoded=decodeURIComponent(route);}catch{return json(400,{error:'Ongeldig pad.'});}
  if(decoded.includes('\\')||decoded.includes('\0'))return json(400,{error:'Ongeldig pad.'});
  const file=decoded==='/'?'index.html':decoded.endsWith('/')?decoded.slice(1,-1)+'.html':decoded.slice(1);
  const absolute=path.resolve(publicDir,file);let status=200,target=absolute;
  if(!absolute.startsWith(publicDir+path.sep)||!fs.existsSync(absolute)||!fs.statSync(absolute).isFile()){status=404;target=path.join(publicDir,'404.html');}
  const ext=path.extname(target);const mime={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'application/javascript;charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml;charset=utf-8','.txt':'text/plain;charset=utf-8'};
  let bytes=fs.readFileSync(target);
  if(ext==='.html'){
   let content=bytes.toString().replace('<head>','<head><base href="/">');
   content=content.replace(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g,(_,slug,hash)=>`href="${slug==='index'?'/':'/'+slug+'/'}${hash||''}"`);
   // Fragment-only links must remain on the current route despite the shared asset base.
   content=content.replace(/href="#([^"]+)"/g,(_,hash)=>`href="${escape(route)}#${hash}"`);
   bytes=Buffer.from(content);
  }
  const compressible=['.html','.css','.js','.svg','.xml','.txt'].includes(ext);
  if(compressible){
   res.setHeader('Vary','Accept-Encoding');
   const encodings=String(req.headers['accept-encoding']||'').toLowerCase().split(',').map(v=>v.trim().split(';'));
   const gzip=encodings.find(v=>v[0]==='gzip')||encodings.find(v=>v[0]==='*');
   const q=gzip?.slice(1).find(v=>v.trim().startsWith('q='));
   if(gzip&&(!q||Number(q.trim().slice(2))>0)){bytes=gzipSync(bytes);res.setHeader('Content-Encoding','gzip');}
  }
  res.writeHead(status,{'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600','Content-Length':bytes.length});
  res.end(req.method==='HEAD'?undefined:bytes);
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 build();const port=Number(process.env.PORT||8931);createApp().listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`OKT website: http://127.0.0.1:${port}`));
}
