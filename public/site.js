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
const labels={company:'Bedrijfsnaam',name:'Contactpersoon',email:'E-mail',phone:'Telefoon',pickup:'Laadplaats en land',delivery:'Losplaats en land',loadDate:'Laaddatum',unloadDate:'Losdatum / tijdvenster',temperature:'Gewenste temperatuur',pallets:'Aantal pallets',weight:'Gewicht (kg)',goods:'Type goederen',mode:'Transportvorm',message:'Opmerking'};
const getData=form=>Object.fromEntries(new FormData(form));
const body=d=>'Transportaanvraag OKT Logistics\n\n'+Object.entries(labels).map(([key,label])=>label+': '+(d[key]||'Niet opgegeven')).join('\n')+'\n\nGraag uw beoordeling van prijs en beschikbaarheid.';
const filePage=name=>location.protocol==='file:'?name+'.html':'/'+(name==='index'?'':name+'/');
document.querySelectorAll('[data-quote-form]').forEach(form=>{
 const status=form.querySelector('.form-status'),submit=form.querySelector('[type=submit]');
 const date=form.elements.loadDate;const now=new Date();date.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 let busy=false, requestId=crypto.randomUUID?.()||String(Date.now());
 form.querySelector('[data-download]').addEventListener('click',()=>{
  if(!form.reportValidity())return;
  const url=URL.createObjectURL(new Blob([body(getData(form))],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='OKT-transportaanvraag.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);status.textContent='Uw aanvraagbestand is klaargezet om te downloaden. Er is niets verzonden.';
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!form.reportValidity())return;const d=getData(form);
  if(!config.emailReady){location.href='mailto:operations@okttrans.nl?subject='+encodeURIComponent('Transportaanvraag '+d.pickup+' → '+d.delivery)+'&body='+encodeURIComponent(body(d));status.textContent='Uw e-mailprogramma is geopend met de ingevulde gegevens. Verstuur de e-mail daar zelf. Opent er niets? Download de aanvraag en mail deze naar operations@okttrans.nl.';return;}
  busy=true;submit.disabled=true;status.textContent='Uw aanvraag wordt verstuurd…';status.dataset.error='false';
  try{
   const res=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json','X-Form-Token':token,'Idempotency-Key':requestId},body:JSON.stringify(d)});const result=await res.json();
   if(!res.ok)throw new Error(result.error||'Verzenden lukt niet. Uw gegevens blijven staan.');
   write(sessionStorage,'okt-confirmation',JSON.stringify({reference:result.reference,time:Date.now()}));
   if(window.gtag&&read(localStorage,'okt-consent')==='analytics')window.gtag('event','generate_lead',{method:'quote_form'});
   if(storageOk)location.href=filePage('bedankt');else status.textContent='Uw aanvraag is aangeboden aan onze e-maildienst. Referentie: '+result.reference+'. Dit is nog geen transportbevestiging.';
   requestId=crypto.randomUUID();
  }catch(err){status.textContent=err.message+' U kunt ook uw aanvraag downloaden of rechtstreeks mailen.';status.dataset.error='true';}finally{busy=false;submit.disabled=false;}
 });
});
const confirmation=document.querySelector('[data-confirmation]');
if(confirmation){try{const value=JSON.parse(read(sessionStorage,'okt-confirmation')||'null');if(value&&Date.now()-value.time<30*60*1000)confirmation.textContent='Uw aanvraag is aangeboden aan onze e-maildienst. Referentie: '+value.reference+'. Operations beoordeelt prijs en beschikbaarheid. Dit is nog geen bevestigde transportopdracht.';}catch{}}
if(location.protocol!=='file:')fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(c=>{
 config=c;token=c.token||'';
 document.querySelectorAll('[data-quote-form]').forEach(form=>{if(c.emailReady){form.querySelector('[type=submit]').textContent='Transportaanvraag versturen';form.querySelector('.form-status').textContent='Uw aanvraag wordt rechtstreeks naar operations verstuurd.';}});
 if(c.gaId&&!read(localStorage,'okt-consent'))dialog.showModal();analytics();
}).catch(()=>{});
document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]').forEach(a=>a.addEventListener('click',()=>{if(window.gtag&&read(localStorage,'okt-consent')==='analytics')window.gtag('event','contact_click',{method:a.href.startsWith('tel:')?'phone':'email'});}));
})();
