import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const decode=s=>s.replace(/<[^>]+>/g,' ').replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replace(/\s+/g,' ').trim();
const serial=s=>JSON.stringify(s).replaceAll('<','\\u003c');
// Approved full-page translations preserve the Dutch template. Edit their content in content/translations.
export function finishLanguages(root,pages,site){
 const pub=path.join(root,'public'),routes=JSON.parse(fs.readFileSync(path.join(root,'tools/language-routes.json'),'utf8'));
 const alt=(slug,xml=false)=>['nl','en','de','x-default'].map(l=>`<${xml?'xhtml:link':'link'} rel="alternate" hreflang="${l}" href="${site.domain+routes[l==='x-default'?'nl':l][slug]}"${xml?'/':''}>`).join('');
 const menu=(slug,lang)=>`<span class="language-switch" aria-label="${lang==='nl'?'Taal':lang==='de'?'Sprache':'Language'}">`+['nl','en','de'].map(l=>`<a href="${routes[l][slug]}" lang="${l}"${l===lang?' aria-current="true"':''}>${l.toUpperCase()}</a>`).join('')+'</span>';
 const version=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(pub,f))).digest('hex').slice(0,12);
 const originals={};
 for(const p of pages){
  const f=path.join(pub,p.slug+'.html');let h=fs.readFileSync(f,'utf8');
  h=h.replace(/<link rel="alternate"[^>]*>/g,'').replace('</head>',alt(p.slug)+'</head>').replace(/<span class="language-switch"[^>]*>[\s\S]*?<\/span>/,menu(p.slug,'nl'));
  h=h.replace(/operations@okttrans\.nl/gi,'aanvraag@okttrans.nl').replace('"inLanguage":["nl-NL","en-GB"]','"inLanguage":["nl-NL","en-GB","de-DE"]');
  originals[p.slug]=h;fs.writeFileSync(f,h);
 }
 for(const lang of ['en','de']){
  const data=JSON.parse(fs.readFileSync(path.join(root,'content/translations',lang+'.json'),'utf8'));
  const translate=s=>data.strings[s]||s;
  const localize=value=>{
   if(Array.isArray(value))return value.map(localize);
   if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localize(v)]));
   if(typeof value!=='string')return value;
   if(value.startsWith(site.domain)){const u=new URL(value),slug=u.pathname==='/'?'index':u.pathname.slice(1,-1);if(routes[lang][slug]&&!['#organization','#website'].includes(u.hash))return site.domain+routes[lang][slug]+u.hash;}
   return translate(value);
  };
  for(const p of pages){
   const route=routes[lang][p.slug],url=site.domain+route;let h=data.pages[p.slug];if(!h)throw Error('Missing translation: '+lang+' '+p.slug);
   h=h.replace(/<meta name="robots"[^>]*>/g,'').replace(/http:\/\/127\.0\.0\.1:8934/g,site.domain).replace(/href="\/nl\//g,'href="/');
   h=h.replace(/<span class="language-switch"[^>]*>[\s\S]*?<\/span>/,menu(p.slug,lang));
   h=h.replace(/\/site-(en|de)\.js\?v=[^"]+/g,(_,l)=>'/site-'+l+'.js?v='+version('site-'+l+'.js')).replace('href="/language-wrap.css"','href="/language-wrap.css?v='+version('language-wrap.css')+'"');
   const title=decode(h.match(/<title>(.*?)<\/title>/)[1]),description=decode(h.match(/<meta name="description" content="([^"]*)"/)[1]);
   const schema=JSON.parse(originals[p.slug].match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]).filter(s=>s['@type']!=='FAQPage').map(s=>{
    if([].concat(s['@type']).includes('Organization'))return s;
    const v=localize(s);
    if(v['@type']==='WebSite'){v.url=site.domain+'/';v.inLanguage=['nl-NL','en-GB','de-DE'];}
    else if(['WebPage','AboutPage','ContactPage','Article'].includes(v['@type'])){v.inLanguage=lang==='de'?'de-DE':'en-GB';v.description=description;if(v.name)v.name=title;}
    if(v['@type']==='Service')v.description=description;
    return v;
   });
   const questions=[...h.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map(m=>({'@type':'Question',name:decode(m[1]),acceptedAnswer:{'@type':'Answer',text:decode(m[2])}}));
   if(questions.length)schema.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:questions});
   h=h.replace('</head>',`<link rel="canonical" href="${url}">${alt(p.slug)}<link rel="manifest" href="/site.webmanifest">${['hidden','draft'].includes(p.type)?'<meta name="robots" content="noindex,follow">':''}<script type="application/ld+json">${serial(schema)}</script></head>`);
   if(/127\.0\.0\.1|href="\/nl\//.test(h))throw Error('Preview URL in '+route);
   fs.writeFileSync(path.join(pub,route.slice(1,-1).replaceAll('/','--')+'.html'),h);
  }
 }
 const entries=pages.filter(p=>!['hidden','draft'].includes(p.type)).flatMap(p=>['nl','en','de'].map(l=>`<url><loc>${site.domain+routes[l][p.slug]}</loc><lastmod>${l==='nl'?p.lastModified:'2026-10-06'}</lastmod>${alt(p.slug,true)}</url>`));
 fs.writeFileSync(path.join(pub,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+entries.join('\n')+'\n</urlset>');
 return pages.length*3;
}
