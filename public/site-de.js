const translatedModeLabels={"FTL / complete vracht": "FTL / Komplettladung", "Groupage / deellading": "Sammelgut / Teilladung", "Graag advies": "Bitte beraten Sie mich"};
(() => {
const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('#main-nav');
function closeMenü(){nav?.removeAttribute('data-open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.dataset.open=String(open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenü();menu.focus();}});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenü();});
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
const labels={company:'Firmenname',name:'Ansprechpartner',email:'E-mail',phone:'Telefon',pickup:'Ladeort und Land',delivery:'Entladeort und Land',loadDate:'Ladedatum',unloadDate:'Lieferdatum / Zeitfenster',temperature:'Gewünschte Temperatur',pallets:'Palettenanzahl',weight:'Gewicht (kg)',goods:'Warenart',mode:'Transportart',message:'Anmerkung'};
const getData=form=>Object.fromEntries(new FormData(form));
const body=d=>'Transportanfrage OKT Logistics\n\n'+Object.entries(labels).map(([key,label])=>label+': '+(translatedModeLabels[d[key]]||d[key]||'Nicht angegeben')).join('\n')+'\n\nBitte prüfen Sie Preis und Verfügbarkeit.';
const filePage=name=>({"404": "/de/404/", "algemene-voorwaarden": "/de/geschaeftsbedingungen/", "bedankt": "/de/danke/", "contact": "/de/kontakt/", "cookies": "/de/cookies/", "diensten": "/de/leistungen/", "europallets-koeltrailer": "/de/europaletten-kuehlauflieger/", "food-transport": "/de/lebensmitteltransport/", "ftl-of-groupage-koeltransport": "/de/ftl-oder-sammelgut/", "geconditioneerd-transport": "/de/temperaturgefuehrter-transport/", "groupage-koeltransport": "/de/gekuehltes-sammelgut/", "index": "/de/", "internationaal-koeltransport": "/de/internationaler-kuehltransport/", "internationaal-vriestransport": "/de/internationaler-tiefkuehltransport/", "kennisbank": "/de/wissen/", "koeltransport-belgie": "/de/kuehltransport-belgien/", "koeltransport-brabant": "/de/kuehltransport-brabant/", "koeltransport-duitsland-uitleg": "/de/kuehltransport-deutschland-vorbereiten/", "koeltransport-duitsland": "/de/kuehltransport-deutschland/", "koeltransport-frankrijk-rungis": "/de/kuehltransport-frankreich-rungis-vorbereiten/", "koeltransport-frankrijk": "/de/kuehltransport-frankreich/", "koeltransport-vs-vriestransport": "/de/kuehltransport-oder-tiefkuehltransport/", "koeltransport": "/de/kuehltransport/", "koudeketen-transport": "/de/kuehlkette-transport/", "kwaliteit": "/de/qualitaet/", "landen": "/de/laender/", "over-ons": "/de/ueber-uns/", "privacy": "/de/datenschutz/", "temperatuur-diepvriestransport": "/de/temperatur-tiefkuehltransport/", "transportofferte-informatie": "/de/angaben-transportangebot/", "vriestransport": "/de/tiefkuehltransport/", "wat-is-geconditioneerd-transport": "/de/was-ist-temperaturgefuehrter-transport/", "wat-is-koeltransport": "/de/was-ist-kuehltransport/"})[name];
document.querySelectorAll('[data-quote-form]').forEach(form=>{
 const status=form.querySelector('.form-status'),submit=form.querySelector('[type=submit]');
 const date=form.elements.loadDate;const now=new Date();date.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 let busy=false, requestId=crypto.randomUUID?.()||String(Date.now());
 form.querySelector('[data-download]').addEventListener('click',()=>{
  if(!form.reportValidity())return;
  const url=URL.createObjectURL(new Blob([body(getData(form))],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='OKT-transportaanvraag.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);status.textContent='Ihre Anfrage steht zum Download bereit. Es wurde nichts versendet.';
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!form.reportValidity())return;const d=getData(form);
  if(!config.emailReady){location.href='mailto:aanvraag@okttrans.nl?subject='+encodeURIComponent('Transportanfrage '+d.pickup+' → '+d.delivery)+'&body='+encodeURIComponent(body(d));status.textContent='Ihr E-Mail-Programm wurde mit Ihren Angaben geöffnet. Senden Sie die Nachricht dort selbst ab. Öffnet sich nichts? Laden Sie die Anfrage herunter und senden Sie sie an aanvraag@okttrans.nl.';return;}
  busy=true;submit.disabled=true;status.textContent='Ihre Anfrage wird versendet…';status.dataset.error='false';
  try{
   const res=await fetch('/api/quote',{method:'POST',headers:{'Content-Art':'application/json','X-Form-Token':token,'Idempotency-Key':requestId},body:JSON.stringify(d)});const result=await res.json();
   if(!res.ok)throw new Error(result.error||'Versand nicht möglich. Ihre Angaben bleiben erhalten.');
   write(sessionStorage,'okt-confirmation',JSON.stringify({reference:result.reference,time:Date.now()}));
   if(window.gtag&&read(localStorage,'okt-consent')==='analytics')window.gtag('event','generate_lead',{method:'quote_form'});
   if(storageOk)location.href=filePage('bedankt');else status.textContent='Ihre Anfrage wurde an unseren E-Mail-Leistung übermittelt. Referenz: '+result.reference+'. Dies ist noch keine Transportbestätigung.';
   requestId=crypto.randomUUID();
  }catch(err){status.textContent=err.message+' Sie können Ihre Anfrage auch herunterladen oder direkt per E-Mail senden.';status.dataset.error='true';}finally{busy=false;submit.disabled=false;}
 });
});
const confirmation=document.querySelector('[data-confirmation]');
if(confirmation){try{const value=JSON.parse(read(sessionStorage,'okt-confirmation')||'null');if(value&&Date.now()-value.time<30*60*1000)confirmation.textContent='Ihre Anfrage wurde an unseren E-Mail-Leistung übermittelt. Referenz: '+value.reference+'. Die Disposition prüft Preis und Verfügbarkeit. Dies ist noch kein bestätigter Transportauftrag.';}catch{}}
if(location.protocol!=='file:')fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(c=>{
 config=c;token=c.token||'';
 document.querySelectorAll('[data-quote-form]').forEach(form=>{if(c.emailReady){form.querySelector('[type=submit]').textContent='Transportanfrage senden';form.querySelector('.form-status').textContent='Ihre Anfrage wird direkt an die Disposition gesendet.';}});
 if(c.gaId&&!read(localStorage,'okt-consent'))dialog.showModal();analytics();
}).catch(()=>{});
document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]').forEach(a=>a.addEventListener('click',()=>{if(window.gtag&&read(localStorage,'okt-consent')==='analytics')window.gtag('event','contact_click',{method:a.href.startsWith('tel:')?'phone':'email'});}));
})();
