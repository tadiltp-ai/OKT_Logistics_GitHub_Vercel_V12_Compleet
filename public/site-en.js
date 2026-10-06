const translatedModeLabels={"FTL / complete vracht": "FTL / full truckload", "Groupage / deellading": "Groupage / part load", "Graag advies": "Advice requested"};
(() => {
const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('#main-nav');
function closeMenu(){nav?.removeAttribute('data-open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.dataset.open=String(open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
let config={emailReady:false,gaId:''},token='',storageOk=true;
const read=(store,key)=>{try{return store.getItem(key)}catch{return null}};
const write=(store,key,value)=>{try{store.setItem(key,value)}catch{storageOk=false}};
const dialog=document.querySelector('#cookie-dialog');
document.querySelectorAll('[data-cookie-open]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
document.querySelector('[data-cookie-close]')?.addEventListener('click',()=>dialog.close());
let analyticsLoaded=false;
function analytics(){
 if(analyticsLoaded||read(localStorage,'okt-consent')!=='analytics'||!/^G-[A-Z0-9]+$/.test(config.gaId))return;
 analyticsLoaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};
 window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('js',new Date());window.gtag('config',config.gaId,{send_page_view:true,allow_google_signals:false,allow_ad_personalization_signals:false});
 const s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.gaId);s.async=true;document.head.append(s);
}
document.querySelectorAll('[data-cookie]').forEach(b=>b.addEventListener('click',()=>{
 const consent=b.dataset.cookie;write(localStorage,'okt-consent',consent);
 if(consent==='essential'){
  if(config.gaId)window['ga-disable-'+config.gaId]=true;
  if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied'});
  for(const cookie of document.cookie.split(';')){const key=cookie.trim().split('=')[0];if(key.startsWith('_ga')){for(const domain of ['',location.hostname,'.'+location.hostname,'.'+location.hostname.replace(/^www\./,'')])document.cookie=key+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');}}
 }else {if(config.gaId)window['ga-disable-'+config.gaId]=false;analytics();}
 dialog.close();
}));
const labels={company:'Company name',name:'Contact person',email:'Email',phone:'Telephone',pickup:'Collection location and country',delivery:'Delivery location and country',loadDate:'Collection date',unloadDate:'Delivery date / time window',temperature:'Required temperature',pallets:'Pallet count',weight:'Weight (kg)',goods:'Goods type',mode:'Transport type',message:'Comments'};
const getData=form=>Object.fromEntries(new FormData(form));
const body=d=>'Transport enquiry OKT Logistics\n\n'+Object.entries(labels).map(([key,label])=>label+': '+(translatedModeLabels[d[key]]||d[key]||'Not specified')).join('\n')+'\n\nPlease assess pricing and availability.';
const filePage=name=>({"404": "/en/404/", "algemene-voorwaarden": "/en/terms-and-conditions/", "bedankt": "/en/thank-you/", "contact": "/en/contact/", "cookies": "/en/cookies/", "diensten": "/en/services/", "europallets-koeltrailer": "/en/euro-pallets-refrigerated-trailer/", "food-transport": "/en/food-transport/", "ftl-of-groupage-koeltransport": "/en/ftl-or-groupage/", "geconditioneerd-transport": "/en/temperature-controlled-transport/", "groupage-koeltransport": "/en/refrigerated-groupage/", "index": "/en/", "internationaal-koeltransport": "/en/international-refrigerated-transport/", "internationaal-vriestransport": "/en/international-frozen-transport/", "kennisbank": "/en/knowledge-centre/", "koeltransport-belgie": "/en/refrigerated-transport-belgium/", "koeltransport-brabant": "/en/refrigerated-transport-brabant/", "koeltransport-duitsland-uitleg": "/en/prepare-refrigerated-transport-germany/", "koeltransport-duitsland": "/en/refrigerated-transport-germany/", "koeltransport-frankrijk-rungis": "/en/prepare-refrigerated-transport-france-rungis/", "koeltransport-frankrijk": "/en/refrigerated-transport-france/", "koeltransport-vs-vriestransport": "/en/refrigerated-or-frozen-transport/", "koeltransport": "/en/refrigerated-transport/", "koudeketen-transport": "/en/cold-chain-transport/", "kwaliteit": "/en/quality/", "landen": "/en/countries/", "over-ons": "/en/about-us/", "privacy": "/en/privacy/", "temperatuur-diepvriestransport": "/en/frozen-transport-temperature/", "transportofferte-informatie": "/en/transport-quote-information/", "vriestransport": "/en/frozen-transport/", "wat-is-geconditioneerd-transport": "/en/what-is-temperature-controlled-transport/", "wat-is-koeltransport": "/en/what-is-refrigerated-transport/"})[name];
document.querySelectorAll('[data-quote-form]').forEach(form=>{
 const status=form.querySelector('.form-status'),submit=form.querySelector('[type=submit]');
 const date=form.elements.loadDate;const now=new Date();date.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 let busy=false, requestId=crypto.randomUUID?.()||String(Date.now());
 form.querySelector('[data-download]').addEventListener('click',()=>{
  if(!form.reportValidity())return;
  const url=URL.createObjectURL(new Blob([body(getData(form))],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='OKT-transportaanvraag.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);status.textContent='Your enquiry is ready to download. Nothing has been sent.';
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!form.reportValidity())return;const d=getData(form);
  if(!config.emailReady){location.href='mailto:aanvraag@okttrans.nl?subject='+encodeURIComponent('Transport enquiry '+d.pickup+' → '+d.delivery)+'&body='+encodeURIComponent(body(d));status.textContent='Your email application has opened with your details. Send the email there yourself. If nothing opens, download your enquiry and email it to aanvraag@okttrans.nl.';return;}
  busy=true;submit.disabled=true;status.textContent='Your enquiry is being sent…';status.dataset.error='false';
  try{
   const res=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json','X-Form-Token':token,'Idempotency-Key':requestId},body:JSON.stringify(d)});const result=await res.json();
   if(!res.ok)throw new Error(result.error||'Unable to send. Your details have been retained.');
   write(sessionStorage,'okt-confirmation',JSON.stringify({reference:result.reference,time:Date.now()}));
   if(window.gtag&&read(localStorage,'okt-consent')==='analytics')window.gtag('event','generate_lead',{method:'quote_form'});
   if(storageOk)location.href=filePage('bedankt');else status.textContent='Your enquiry has been submitted to our email service. Reference: '+result.reference+'. This is not a transport confirmation.';
   requestId=crypto.randomUUID();
  }catch(err){status.textContent=err.message+' You can also download your enquiry or email us directly.';status.dataset.error='true';}finally{busy=false;submit.disabled=false;}
 });
});
const confirmation=document.querySelector('[data-confirmation]');
if(confirmation){try{const value=JSON.parse(read(sessionStorage,'okt-confirmation')||'null');if(value&&Date.now()-value.time<30*60*1000)confirmation.textContent='Your enquiry has been submitted to our email service. Reference: '+value.reference+'. Operations will assess price and availability. This is not a confirmed transport order.';}catch{}}
if(location.protocol!=='file:')fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(c=>{
 config=c;token=c.token||'';
 document.querySelectorAll('[data-quote-form]').forEach(form=>{if(c.emailReady){form.querySelector('[type=submit]').textContent='Send transport enquiry';form.querySelector('.form-status').textContent='Your enquiry is sent directly to operations.';}});
 if(c.gaId&&!read(localStorage,'okt-consent'))dialog.showModal();analytics();
}).catch(()=>{});
document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]').forEach(a=>a.addEventListener('click',()=>{if(window.gtag&&read(localStorage,'okt-consent')==='analytics')window.gtag('event','contact_click',{method:a.href.startsWith('tel:')?'phone':'email'});}));
})();
