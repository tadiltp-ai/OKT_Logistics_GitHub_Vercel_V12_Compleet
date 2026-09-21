# OKT Logistics V9 — verbeteringen en restpunten

De website is op basis van de briefing verder uitgewerkt. De goedgekeurde homepageopmaak is behouden, met gecorrigeerde teksten en de ontbrekende inhoudsblokken. Certificering en temperatuurregistratie zijn op uw verzoek volledig uit de website verwijderd. Deze onderwerpen zijn geen openstaande aanleverpunten meer.

## Wat is verbeterd

- Hoofdmenu met Diensten, Landen, Kwaliteit, Over ons, Kennisbank en Contact; werkend uitklapmenu op mobiel.
- Alle inhoudspagina’s bereikbaar, met passende links tussen diensten, landen en kennisartikelen.
- Kwaliteitspagina over planning, communicatie, productspecificatie en overdracht.
- Meer eigen inhoud per dienst en per land; tien uitgewerkte kennisartikelen.
- Homepage met brede koel-/vriespositionering, klantgerichte teksten, kwaliteit, aanvraagvoorbeelden en drie kennisartikelen.
- Vriestransport en Diepvriestransport samengebracht. Levensmiddelen transport is opgenomen onder Food transport. De oude adressen verwijzen door.
- Offerteformulier met relevante velden, verplichte-veldcontrole, laaddatum, product, temperatuur, gewicht en transportvorm.
- Werkende e-mailvoorbereiding en download van alle ingevulde aanvraaggegevens. De gebruiker verstuurt de voorbereide e-mail zelf.
- Serverkoppeling voor rechtstreekse verzending voorbereid, met validatie, honeypot, tijdcontrole, aanvraaglimiet, foutmeldingen en bevestigingspagina. Zonder configuratie wordt nooit ten onrechte een succesvolle verzending gemeld.
- Lokaal beheer voor paginatitel, meta description, hoofdkop, teksten, alt-teksten en URL-naam. Bij een URL-wijziging worden inhoudslinks aangepast en een doorverwijzing toegevoegd. Iedere opslag maakt eerst een inhoudsbackup.
- Unieke SEO-titels en descriptions, canonicals, breadcrumbs, Organization-, Service- en Article-gegevens, favicon en sociale metadata met een bestaande OKT-foto.
- Automatisch opgebouwde sitemap, nette URL’s, echte 301-doorverwijzingen en een 404-status via de meegeleverde websiteserver.
- Foto’s gecomprimeerd naar WebP, meerdere beeldformaten waar van toepassing, afmetingen vastgelegd en lagere afbeeldingen uitgesteld geladen. De homepage-HTML is teruggebracht van circa 3,94 MB naar circa 20 kB. Dit is bestandsgrootte, geen gemeten live snelheidsscore.
- Cookievoorkeur met opt-in voor optionele statistieken. Zonder ingestelde meetcode worden geen analytics geladen.
- Een complete overdracht met bronbestanden, lokale preview, beheer, tests, back-upmogelijkheid en startbestanden voor Windows.

- Algemene voorwaarden-pagina met AVC 2002, CMR-verdrag en SVA Algemene Opslagvoorwaarden, directe PDF-links bij de bron en verwijzingen in footer en offerteformulier.

## Wat nog nodig is voor livegang

| Onderdeel | Huidige status | Wat nog nodig is |
|---|---|---|
| Hosting en domein | Website werkt lokaal; niets is gepubliceerd | Hosting kiezen die de meegeleverde Node-server ondersteunt, HTTPS/reverse proxy instellen en domein koppelen. Voor Vercel is eerst aanpassing aan die hostingomgeving nodig. |
| Rechtstreeks formulier versturen | Gebouwd en lokaal getest met een nagebootste e-maildienst; er is geen echte testmail verzonden | Een verzenddienstaccount, geverifieerd afzenderdomein, geheime API-sleutel en afzender instellen. Daarna ontvangst in operations@okttrans.nl daadwerkelijk testen. |
| Privacyverklaring | Duidelijk gemarkeerde conceptpagina, niet indexeerbaar | Vaststellen welke dienstverleners worden gebruikt, doeleinden, bewaartermijnen en rechten; definitieve tekst aanleveren/beoordelen. Daarna de online verzending activeren. |
| Cookies | Cookiebediening aanwezig; analytics staan uit | Cookie-informatie afstemmen op de uiteindelijke diensten. |
| Google Search Console en GA4 | Technische voorbereiding en overdracht aanwezig | Toegang tot de juiste accounts, eigendomscontrole, sitemap indienen en de gewenste conversies instellen/testen. Een GA4-code kan na inrichting worden toegevoegd. Google Tag Manager is niet apart gekoppeld. |
| Oude Wix-adressen | Doorverwijzingen voor de twee samengevoegde onderwerpen en de huidige .html-adressen gereed | De echte oude Wix-URL’s inventariseren uit de huidige site, Wix of Search Console en per adres een passende 301 toevoegen. Er zijn geen oude URL’s gegokt. |
| Online CMS | Lokaal beheer werkt op deze computer | Voor beheer vanaf andere computers is een geauthenticeerde online CMS-oplossing of publicatiewerkwijze nodig. De lokale editor is bewust niet publiek bereikbaar. |
| Eindtest op de liveomgeving | Lokale controles uitgevoerd | Echte mailaflevering, HTTPS, domeinvarianten, oude redirects, Search Console, analytics/consent en mobiele snelheid op de gekozen hosting verifiëren. |
| Back-ups en onderhoud | Lokale inhoudsback-ups en volledig back-upscript beschikbaar | Geplande back-ups buiten de hosting, hersteltest, updates en verantwoordelijke beheerder afspreken. |

## Optionele vervolginformatie

- Officiële socialprofielen voor links in de footer en bedrijfsgegevens voor Google/LinkedIn. Er zijn geen profielen verzonnen.
- Concrete praktijkcases of klantreferenties, uitsluitend met toestemming. De homepage toont nu duidelijk gelabelde aanvraagvoorbeelden.
- Een vectorversie van het definitieve logo voor toekomstig drukwerk/ontwerp; op de website wordt het bestaande beeldmerk gebruikt.
- Specifieke regionale dekking of vaste frequenties alleen toevoegen wanneer die daadwerkelijk bevestigd zijn.
- Een beveiligde bestandsupload is niet toegevoegd. Dit was optioneel in de briefing; de aanvraag kan worden gedownload en eventuele documenten kunnen via het eigen e-mailprogramma worden meegestuurd.
- De site is volledig Nederlandstalig. Andere taalversies zijn toekomstig werk, geen half ingevulde pagina’s.

De bevestigde contactgegevens en diensten zijn overgenomen. Certificaten of temperatuurregistratie hoeven niet te worden aangeleverd: die onderwerpen zijn uitgesloten volgens uw instructie.

## Controlebewijs en grenzen

Alle 32 pagina’s zijn technisch gecontroleerd. Daaronder zitten 29 indexeerbare pagina’s, een privacyconcept, een bevestigingspagina en een 404-pagina. Daarnaast zijn er twee doorverwijspagina’s voor oude onderwerpen. De tien kennisartikelen zijn onderdeel van de 32 pagina’s.

Er zijn geen kapotte lokale verwijzingen of ontbrekende ankers gevonden. Alle indexeerbare pagina’s zijn binnen twee klikken vanaf de homepage bereikbaar. Metadata, JSON-LD, afbeeldingsverwijzingen en de verwijdering van de uitgesloten onderwerpen zijn gecontroleerd.

Het mobiele menu, verplichte formuliervelden, aanvraagdownload, cookievenster en het opslaan via het lokale beheer zijn in de browser getest. De hoofdtemplates zijn visueel bekeken. De server is getest op 301’s, 404’s, afgeschermde bronbestanden, ongeldige aanvragen en zowel succes als mislukking bij een nagebootste e-maildienst.

Dit is geen bewijs van echte e-mailaflevering, live performance, indexatie of een externe juridische beoordeling. Er is niets naar klanten of operations verstuurd en de huidige livewebsite is niet vervangen.
