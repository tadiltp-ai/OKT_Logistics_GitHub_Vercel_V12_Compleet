import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {englishPages} from './english.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const serial=o=>JSON.stringify(o).replace(/</g,'\\u003c');
const nlRoute=slug=>slug==='index'?'/':`/${slug}/`;
export function finishSeo(root,pages,site){
 const pub=path.join(root,'public'),dimensions=JSON.parse(fs.readFileSync(path.join(root,'tools/image-dimensions.json'),'utf8'));
 const entityGraph=(schemas,p,route,lang)=>{
  const org=schemas.find(s=>[].concat(s['@type']).includes('Organization'));
  org.identifier={'@type':'PropertyValue',propertyID:'KvK',value:site.kvk};
  const website={'@context':'https://schema.org','@type':'WebSite','@id':site.domain+'/#website',url:site.domain+'/',name:site.name,inLanguage:['nl-NL','en-GB'],publisher:{'@id':org['@id']}};
  const existing=schemas.find(s=>s['@type']==='WebSite');if(existing)Object.assign(existing,website);else schemas.push(website);
  const pageType=['over-ons','/en/about-us/'].includes(p.slug||route)?'AboutPage':['contact','/en/contact/'].includes(p.slug||route)?'ContactPage':'WebPage';
  schemas.push({'@context':'https://schema.org','@type':pageType,'@id':site.domain+route+'#webpage',url:site.domain+route,name:p.title,description:p.description,inLanguage:lang==='en'?'en-GB':'nl-NL',isPartOf:{'@id':website['@id']},about:{'@id':org['@id']},publisher:{'@id':org['@id']}});
  for(const service of schemas.filter(s=>s['@type']==='Service')){service['@id']=site.domain+route+'#service';service.url=site.domain+route;service.provider={'@id':org['@id']};}
  return schemas;
 };
 const pairFor=slug=>englishPages.find(p=>p.nl===slug);
 const alternate=(slug,xml=false)=>{const p=pairFor(slug);if(!p)return '';return [['nl',nlRoute(slug)],['en',p.route],['x-default',nlRoute(slug)]].map(([lang,route])=>xml?`<xhtml:link rel="alternate" hreflang="${lang}" href="${site.domain}${route}"/>`:`<link rel="alternate" hreflang="${lang}" href="${site.domain}${route}">`).join('');};
 const images=html=>{let index=0;return html.replace(/<img\b[^>]*>/g,tag=>{
  const src=tag.match(/\bsrc="([^"]+)"/)?.[1];let dim=dimensions[src?.split('?')[0]];
  if(!dim&&src?.endsWith('.svg')){const svg=fs.readFileSync(path.join(pub,src),'utf8');const box=svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);if(box)dim=box.slice(2);}
  if(!dim)throw Error('Image dimensions missing: '+src);
  const logo=src.includes('logo-');const eager=logo?!tag.includes('loading="lazy"'):index++===0;
  tag=tag.replace(/\s(?:width|height|loading|fetchpriority|decoding)="[^"]*"/g,'');
  if(logo)tag=tag.replace(/alt="[^"]*"/,`alt="${eager?'OKT Logistics – home':'OKT Logistics'}"`);
  return tag.replace(/>$/,` width="${dim[0]}" height="${dim[1]}" loading="${eager?'eager':'lazy'}" decoding="async"${eager&&!logo?' fetchpriority="high"':''}>`);
 });};
 const assets=html=>html.replace(/((?:src|href|srcset)="|, )(assets\/[^" ,]+)(?=[" ,])/g,(_,pre,ref)=>{
  if(ref.includes('?'))return pre+ref;const f=path.join(pub,ref);if(!fs.existsSync(f))throw Error('Missing asset '+ref);
  return pre+ref+'?v='+crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0,12);
 });
 const links=html=>html.replace(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g,(_,slug,hash)=>`href="${nlRoute(slug)}${hash||''}"`);
 const icons='<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta name="theme-color" content="#243e85">';
 function schemaUpdate(html,p,route,lang){
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,raw)=>{
   const schemas=JSON.parse(raw);const org=schemas.find(s=>s['@type']==='Organization'||Array.isArray(s['@type'])&&s['@type'].includes('Organization'));
   org['@type']=['Organization','LocalBusiness'];org.sameAs=site.sameAs||[];
   if(site.geo&&Number.isFinite(site.geo.latitude)&&Number.isFinite(site.geo.longitude))org.geo={'@type':'GeoCoordinates',...site.geo};
   if(Array.isArray(site.openingHoursSpecification)&&site.openingHoursSpecification.length)org.openingHoursSpecification=site.openingHoursSpecification;
   const faq=[...html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map(m=>({'@type':'Question',name:plain(m[1]),acceptedAnswer:{'@type':'Answer',text:plain(m[2])}}));
   if(faq.length)schemas.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq});
   if(route!=='/'&&!schemas.some(s=>s['@type']==='BreadcrumbList'))schemas.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:site.domain+(lang==='en'?'/en/':'/')},{'@type':'ListItem',position:2,name:p.title.split('|')[0].trim(),item:site.domain+route}]});
   return `<script type="application/ld+json">${serial(entityGraph(schemas,p,route,lang))}</script>`;
  });
 }
 for(const p of pages){
  const file=path.join(pub,p.slug+'.html');let html=fs.readFileSync(file,'utf8');
  html=links(html).replace('<head>','<head><base href="/">'+icons+alternate(p.slug));
  html=html.replace('<a class="btn btn-blue" href="/contact/">Offerte aanvragen</a>','<a href="/koeltransport-brabant/">Brabant</a><a class="btn btn-blue" href="/contact/">Offerte aanvragen</a>');
  const pair=pairFor(p.slug);
  html=html.replace('</nav></div></header>',`<span class="language-switch" aria-label="Taal"><a href="${nlRoute(p.slug)}" lang="nl" aria-current="true">NL</a><a href="${pair?.route||'/en/'}" lang="en">EN</a></span></nav></div></header>`);
  html=html.replace('<a href="/koeltransport/">Koeltransport</a>','<a href="/koeltransport/">Koeltransport</a><a href="/koeltransport-brabant/">Koeltransport Brabant</a>');
  html=html.replace(/<footer[\s\S]*?<\/footer>/,f=>f.replace(/<h2>/g,'<h3 class="heading-as-h2">').replace(/<\/h2>/g,'</h3>')).replace('<h2 id="cookie-heading">','<h3 class="heading-as-h2" id="cookie-heading">').replace('Uw privacykeuze</h2>','Uw privacykeuze</h3>');
  if(p.slug!=='index'&&!html.includes('class="breadcrumbs"'))html=html.replace(/(<main[^>]*>)/,`$1<div class="container"><nav class="breadcrumbs" aria-label="Broodkruimel"><a href="/">Home</a> / <span aria-current="page">${esc(p.title.split('|')[0])}</span></nav></div>`);
  if(p.slug==='index')html=html.replace(/<img[^>]*src="assets\/homepage-lineage-1920.webp"[^>]*>/,tag=>tag.replace(/srcset="[^"]*"/,'srcset="'+[640,960,1280,1920].map(w=>`assets/homepage-lineage-${w}.webp ${w}w`).join(', ')+'"'));
  html=html.replace('</footer>','<p class="container">Openingstijden: 24 uur per dag, 7 dagen per week.</p></footer>');
  html=images(html);html=schemaUpdate(html,p,nlRoute(p.slug),'nl');
  html=assets(html);
  if(p.slug==='index'){
   const hero=html.match(/<img[^>]*src="([^"]*homepage-lineage[^\"]*)"[^>]*>/)?.[0];
   if(hero){const attr=n=>hero.match(new RegExp('\\b'+n+'="([^"]*)"'))?.[1];html=html.replace('</head>',`<link rel="preload" as="image" href="${attr('src')}" imagesrcset="${attr('srcset')}" imagesizes="${attr('sizes')}" fetchpriority="high"></head>`);}
  }
  // A base URL otherwise turns local fragments into links to the homepage.
  html=html.replace(/href="#([^"]+)"/g,(_,hash)=>`href="${nlRoute(p.slug)}#${hash}"`);
  fs.writeFileSync(file,html);
 }
 for(const p of englishPages){
  let source=fs.readFileSync(path.join(pub,p.nl+'.html'),'utf8');
  const src=source.match(/<main\b[\s\S]*?<\/main>/)?.[0].match(/<img[^>]*src="([^"]+)"/)?.[1]||'assets/homepage-lineage-1920.webp';
  const bare=src.split('?')[0];const dim=dimensions[bare];
  const photoDescriptions={'over-ons-vriezer':'Worker in protective clothing beside a wrapped pallet in a freezer room','okt-wuppertal':'OKT Logistics refrigerated truck at a loading dock in Wuppertal, Germany','okt-zijaanzicht':'Side view of an OKT Logistics refrigerated truck','okt-koelcentrum':'OKT Logistics truck parked outside a cold storage facility','okt-distributiecentrum':'OKT Logistics truck at a distribution centre','okt-truck':'OKT Logistics truck at a logistics site','homepage-lineage':'OKT Logistics refrigerated truck outside a distribution centre'};
  const photoAlt=Object.entries(photoDescriptions).find(([key])=>bare.includes(key))?.[1]||'Front and side view of an OKT Logistics truck with refrigerated trailer';
  const family=bare.replace(/-\d+\.webp$/,'');const variants=Object.keys(dimensions).filter(f=>f.replace(/-\d+\.webp$/,'')===family&&dimensions[f][0]<=1920).sort((a,b)=>dimensions[a][0]-dimensions[b][0]);
  const photo=`<img src="${bare}" ${variants.length>1?`srcset="${variants.map(f=>f+' '+dimensions[f][0]+'w').join(', ')}" sizes="(max-width: 980px) calc(100vw - 32px), 570px"`:''} width="${dim[0]}" height="${dim[1]}" alt="${photoAlt}" decoding="async" fetchpriority="high">`;
  const routes=englishPages.filter(x=>['diensten','over-ons','contact'].includes(x.nl));
  const header=`<a class="skip-link" href="${p.route}#main">Skip to content</a><div class="topbar"><div class="container"><span>Netherlands · Germany · Belgium · France</span><a href="tel:+31412250014">+31 412 250 014</a></div></div><header class="header"><div class="container nav"><a class="brand" href="/en/"><img src="${site.logo}" width="44" height="44" alt="OKT Logistics – home"><span><span class="name">OKT Logistics</span><span class="sub">Refrigerated &amp; frozen transport</span></span></a><button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false">Menu</button><nav class="navlinks" id="main-nav" aria-label="Main navigation">${routes.map(x=>`<a href="${x.route}">${x.nl==='diensten'?'Services':x.nl==='over-ons'?'About us':'Contact'}</a>`).join('')}<span class="language-switch" aria-label="Language"><a href="${nlRoute(p.nl)}" lang="nl">NL</a><a href="${p.route}" lang="en" aria-current="true">EN</a></span><a class="btn btn-blue" href="/en/contact/">Request a quote</a></nav></div></header>`;
  const crumbs=p.nl==='index'?'':`<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/en/">Home</a> / <span aria-current="page">${esc(p.title.split('|')[0])}</span></nav>`;
  const main=`<main id="main" tabindex="-1"><section class="hero page-hero"><div class="container">${crumbs}<div class="hero-grid"><div><div class="kicker">OKT Logistics BV</div><h1>${esc(p.h1)}</h1><p class="hero-copy">${esc(p.intro)}</p><a class="btn btn-primary" href="/en/contact/">Contact operations</a></div><div class="page-photo-card${p.nl==='diensten'?' services-photo':p.nl==='internationaal-koeltransport'?' services-photo international-photo':''}">${photo}</div></div></div></section>${p.sections.map(([h,t],i)=>`<section class="section ${i%2?'section-alt':''}"><div class="container"><h2>${esc(h)}</h2><p class="lead">${esc(t)}</p></div></section>`).join('')}<section class="section"><div class="container"><h2>Useful transport services</h2><div class="related-links">${p.links.map(([r,t])=>`<a href="/en/${r}/">${esc(t)} →</a>`).join('')}</div></div></section><section class="cta-band"><div class="container"><h2>Send us your transport requirements</h2><p>An enquiry is not a confirmed booking. Operations will assess your route, product requirements and available capacity.</p><a class="btn btn-primary" href="mailto:operations@okttrans.nl">Email operations</a> <a class="btn btn-outline" href="tel:+31412250014">Call +31 412 250 014</a></div></section></main>`;
  const footer=`<footer class="footer"><div class="container"><div class="footer-grid"><div><strong>OKT Logistics BV</strong><p>Honsdijk 1<br>5364 NL Escharen<br>The Netherlands</p></div><div><h3>Transport services</h3><div class="footer-links">${englishPages.filter(x=>!['index','over-ons','contact'].includes(x.nl)).map(x=>`<a href="${x.route}">${esc(x.title.split('|')[0])}</a>`).join('')}</div></div><div><h3>Company</h3><p>Chamber of Commerce: ${site.kvk}<br>VAT: ${site.vat}</p><a href="/privacy/">Privacy information (Dutch)</a><br><a href="/algemene-voorwaarden/">Terms and conditions (Dutch)</a><br><a href="/cookies/">Cookie information (Dutch)</a><br><button type="button" data-cookie-open>Cookie preferences</button></div><div><h3>Contact</h3><p>Open 24 hours a day, 7 days a week.</p><a href="mailto:${site.email}">${site.email}</a><p><a href="tel:+31412250014">+31 412 250 014</a></p></div></div></div></footer>`;
  let head=source.slice(0,source.indexOf('<body>')).replace('lang="nl"','lang="en"').replace(/<title>.*?<\/title>/,`<title>${esc(p.title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(p.description)}">`).replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${site.domain+p.route}">`).replace(/(<meta property="og:locale" content=")[^"]*/,'$1en_GB').replace(/(<meta property="og:url" content=")[^"]*/,'$1'+site.domain+p.route).replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g,'$1'+esc(p.title)).replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]*/g,'$1'+esc(p.description)).replace(/<link rel="preload"[^>]*>/g,'');
  head=head.replace(/(<meta (?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]*/g,'$1'+photoAlt);
  const org=JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])[0];
  const schemas=[org,{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:site.domain+'/en/'},...(p.nl==='index'?[]:[{'@type':'ListItem',position:2,name:p.h1,item:site.domain+p.route}])]}];
  if(['koeltransport','vriestransport','internationaal-koeltransport','koeltransport-duitsland','koeltransport-belgie','koeltransport-frankrijk'].includes(p.nl))schemas.push({'@context':'https://schema.org','@type':'Service',name:p.h1,description:p.description,url:site.domain+p.route,provider:{'@id':site.domain+'/#organization'}});
  head=head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${serial(entityGraph(schemas,p,p.route,'en'))}</script>`);
  const dialog='<dialog id="cookie-dialog" aria-labelledby="cookie-heading"><h2 id="cookie-heading">Your privacy preferences</h2><p>We store your choice. Analytics load only when configured and with your consent.</p><div class="form-actions"><button type="button" class="btn btn-secondary" data-cookie="essential">Essential only</button><button type="button" class="btn btn-blue" data-cookie="analytics">Allow analytics</button><button type="button" class="btn btn-secondary" data-cookie-close>Close</button></div></dialog>';
  const html=assets(images(head+'<body>'+header+main+footer+dialog+'</body></html>'));
  const slug=p.route.slice(1,-1).replaceAll('/','--');fs.writeFileSync(path.join(pub,slug+'.html'),html);
 }
 const entries=[...pages.filter(p=>!['hidden','draft'].includes(p.type)).map(p=>({route:nlRoute(p.slug),slug:p.slug,lastmod:p.lastModified})),...englishPages.map(p=>({route:p.route,slug:p.nl,lastmod:'2026-10-01'}))];
 fs.writeFileSync(path.join(pub,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+entries.map(p=>`<url><loc>${site.domain+p.route}</loc><lastmod>${p.lastmod}</lastmod>${alternate(p.slug,true)}</url>`).join('\n')+'\n</urlset>');
 return pages.length+englishPages.length;
}
