# OKT Logistics V9 gebruiken en overdragen

Dit pakket bevat de volledige bijgewerkte website, de broninhoud, lokaal tekstbeheer en de server voor nette URL’s en de voorbereide formulierkoppeling. Lees `RESTPUNTEN.md` voor de onderdelen die nog nodig zijn voordat de huidige livewebsite wordt vervangen.

## Bekijken op deze computer

1. Pak de ZIP volledig uit.
2. Open `Start-website.cmd` en laat het venster open.
3. Open http://127.0.0.1:8931 in de browser.

Op deze computer wordt de meegeleverde Codex-runtime gevonden. Op een andere computer is Node.js 22 of hoger nodig. De website heeft geen externe npm-pakketten nodig. Als de poort al in gebruik is, draait waarschijnlijk nog een eerdere preview; sluit die eerst of wijzig de poort.

Voor alleen bekijken zonder server kunt u `public/index.html` openen. De gewone paginalinks werken dan ook. De echte 301-statussen, nette URL’s en online formulierverzending vereisen de websiteserver. De e-mailvoorbereiding en aanvraagdownload zijn bedoeld als eerlijke terugvaloptie.

## Teksten zelf aanpassen

1. Open ook `Start-beheer.cmd`.
2. Open http://127.0.0.1:8932 op dezelfde computer.
3. Kies een pagina. Pas titel, omschrijving, hoofdkop, tekstblok of alt-tekst aan.
4. Klik op **Opslaan en website bijwerken**.
5. Herlaad de websitepreview om het resultaat te controleren.

Bij een gewijzigde URL-naam worden inhoudslinks bijgewerkt en wordt een redirect aangemaakt. Herstart de websiteserver na een URL-wijziging, zodat de nieuwe redirecttabel wordt geladen. De homepage behoudt de naam `index`.

De geavanceerde HTML-editor is voor grotere inhoudswijzigingen. De gedeelde navigatie, footer, formulieren, metadata en sitemap komen uit `tools/build.mjs`. Voeg nooit scripts toe in pagina-inhoud. Het tekstbeheer draait uitsluitend op het lokale adres; publiceer de editor niet als openbaar beheerpaneel. Het is geen online CMS met accounts of automatische publicatie.

## Bestanden

- `public/`: gegenereerde website, afbeeldingen en browsercode.
- `content/`: bewerkbare pagina-inhoud en bedrijfsinstellingen.
- `content/site.json`: domein en bedrijfsgegevens voor de gedeelde onderdelen.
- `content/redirects.json`: aanvullende oude adressen en hun bestemming.
- `tools/build.mjs`: gedeelde templates en automatische sitemap/metadata.
- `tools/editor.mjs` en `editor.html`: lokaal tekstbeheer.
- `server.mjs`: websiteserver met formulierendpoint en routing.
- `tests/`: herhaalbare technische controles.
- `.env.example`: lege voorbeelden van serverinstellingen; geen geheime sleutels.

Wijzig de teksten bij voorkeur via beheer of `content/`, niet rechtstreeks in de gegenereerde HTML. Anders kunnen ze bij het opnieuw opbouwen worden overschreven. Het wijzigen van bedrijfsgegevens in `site.json` werkt de gedeelde header, footer en structured data bij; controleer eventueel letterlijk genoemde gegevens in de pagina-inhoud ook.

## Voor de developer of hostingbeheerder

Met Node.js 22+:

```text
npm run build
npm test
npm start
npm run beheer
npm run backup
```

Er is geen `npm install` nodig. De website wordt bij starten opgebouwd. Gebruik een actuele ondersteunde Node-versie en zet productie achter een HTTPS reverse proxy. Laat één domeinvariant leidend zijn. Het voorkeursadres staat in `content/site.json`; stel dezelfde origin in als `PUBLIC_ORIGIN` voor de formuliercontrole.

De Node-server serveert alleen bestanden uit `public/`. Broninhoud, editor, backups en `.env` zijn niet via die server bereikbaar. Nette paden zoals `/koeltransport/` worden gekoppeld aan de gegenereerde HTML. `.html`-adressen verwijzen met 301 naar hun nette variant; onbekende adressen geven een echte 404. Bij een andere hostingaanpak moet deze routing expliciet worden overgenomen.

Er is nu een Vercel-adapter en GitHub-workflow meegeleverd. Volg README.md voor publicatie vanuit GitHub naar Vercel. De gewone lokale Node-server blijft beschikbaar.

## Formulier activeren

De browser bouwt nu een volledig ingevulde e-mail op of downloadt een tekstbestand. De bezoeker verstuurt die e-mail zelf. Er gaat geen echte mail uit dit pakket zolang de serverkoppeling niet is ingesteld.

Voor rechtstreekse verzending is een Resend-account met geverifieerd afzenderdomein voorzien. Kopieer `.env.example` naar `.env` op de server en vul `RESEND_API_KEY`, `MAIL_FROM` en `PUBLIC_ORIGIN` in. Plaats `.env` nooit in `public/` of in een openbare repository. De ontvanger komt uit `content/site.json`; de afzender van de aanvraag wordt als reply-to gebruikt. De implementatie volgt de [officiële Resend Send Email-documentatie](https://resend.com/docs/api-reference/emails/send-email).

Zet `PRIVACY_READY=true` pas nadat de definitieve privacyinformatie is vastgesteld en `content/privacy.json` is bijgewerkt. Wijzig het paginatype dan van `draft` naar `page`. Bouw opnieuw en herstart de server. Test daarna daadwerkelijk ontvangst, spammap, reply-to, foutafhandeling en herhaalde aanvragen. Een provideracceptatie is geen garantie dat een bericht in de inbox is afgeleverd.

De server heeft eigen validatie, honeypot, een ondertekend tijdelijk formuliertoken, een minimale invultijd en een limiet per verbinding/IP. Bij een reverse proxy moeten de aanvraaglimieten voor de productieomgeving worden beoordeeld; vertrouw niet automatisch iedere doorgestuurde IP-header. Een extra antispamdienst kan later worden toegevoegd als dat nodig blijkt.

Bestandsuploads zijn niet aangezet. Verwerk geen gevoelige bijlagen via een geïmproviseerde uploadroute.

## Statistieken en Search Console

`GA4_ID` is leeg en er worden standaard geen analysetags geladen. Een geldige ingestelde GA4-code wordt pas geladen wanneer de bezoeker expliciet statistieken toestaat. Afwijzen of intrekken blokkeert die statistieken; de cookiepagina biedt toegang tot de instelling.

De code heeft gebeurtenissen voor een door de server geaccepteerde aanvraag (`generate_lead`) en telefoon-/e-mailklikken (`contact_click`). Leg de uiteindelijke meetinrichting vast, controleer de consentwerking op het echte domein en stem de privacy-/cookieverklaring daarop af. Voeg niet daarnaast ongecontroleerd een tweede analytics-implementatie toe.

Search Console vereist domeintoegang voor verificatie. Dien na publicatie de automatisch gegenereerde `/sitemap.xml` in. Houd privacyconcepten en bevestigings-/foutpagina’s buiten de index. De sitemap sluit deze nu uit.

## Back-up en herstel

De editor kopieert de volledige inhoudsmap vóór iedere opslag naar `backups/`. Voor een bredere lokale kopie gebruikt u `npm run backup`. Het back-upscript kopieert website, inhoud, templates en tests; het neemt geen `.env` met sleutels mee.

Voor inhoudsherstel: stop de editor, kopieer de gewenste backup-inhoud terug naar `content/`, bouw opnieuw en controleer de website. Bewaar vóór herstel ook een kopie van de huidige versie. Voor livegang zijn geplande externe back-ups, een hersteltest en een onderhoudsafspraak nog nodig.

## Oude URL’s

Reeds aanwezig:

```text
/diepvriestransport/       → /vriestransport/
/levensmiddelen-transport/ → /food-transport/
/*.html                  → nette variant met afsluitende slash
```

De echte oude Wix-URL’s zijn nog niet bekend. Voeg alleen geverifieerde oude adressen toe. Controleer nieuwe redirects op lussen, passende inhoud en één duidelijke bestemming voordat de domeinomschakeling plaatsvindt.

## Wat niet in dit pakket is geclaimd

Geen live publicatie, echte e-mailaflevering, externe Google-koppeling, juridische goedkeuring of Google-posities. Certificering en temperatuurregistratie zijn op verzoek verwijderd. Er worden geen aantallen voertuigen, vaste lijndiensten of klantreferenties verzonnen.
