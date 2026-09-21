# SEO-controle en verbeteringen

Gecontroleerd op 21 september 2026, op basis van de vijf aangeleverde onderwerpen. De websitebestanden zijn aangepast; er is geen nieuwe livewebsite gepubliceerd.

## 1. Canonicals en redirects

Elke pagina krijgt een absolute canonical uit `content/site.json` en de paginanaam. Bijvoorbeeld:

```html
<link rel="canonical" href="https://www.oktlogisticholland.com/vriestransport/">
```

De server verwijst nu `/diepvriestransport.html`, `/diepvriestransport` en `/diepvriestransport/` rechtstreeks met HTTP 301 naar `/vriestransport/`. Queryparameters blijven behouden. Redirectketens worden samengevoegd; lussen en externe doelen worden geweigerd. De build controleert of het einddoel bestaat en of een redirect geen bestaande inhoudspagina overschrijft. De bestaande HTML-doorverwijspagina's blijven beschikbaar voor lokale bestandsweergave. Echte HTTP 301-responses vereisen de meegeleverde server of gelijkwaardige hostingregels.

Het domein in site.json moet bij livegang overeenkomen met het definitieve hoofddomein. HTTPS en de voorkeursvariant met/zonder www moeten op de hosting worden ingesteld. De echte oude Wix-URL-lijst blijft een aanleverpunt.

## 2. Metadata en koppen

Unieke titels en descriptions worden al uit de JSON-inhoud opgebouwd. Canonical, Open Graph en Twitter-kaarten gebruiken dezelfde pagina en afbeelding. Toegevoegd: og:site_name en expliciete Twitter-titel, omschrijving, afbeelding en alt-tekst. Alle 32 inhoudspagina's hebben één H1; gebruik H2 voor hoofdonderwerpen en H3 voor onderdelen daarvan. Alt-teksten beschrijven wat op de afbeelding zichtbaar is, zonder opeenstapeling van zoekwoorden.

## 3. Afbeeldingen

De bestaande WebP-varianten op 640, 1280, 1920 en 3840 pixels blijven via srcset beschikbaar. De sizes-instellingen zijn aangepast aan volle breedte bij landenfoto's en smallere kolommen bij andere foto's. Hoofdfoto's in de hero laden direct met hoge prioriteit; beelden verderop laden uitgesteld. Breedte en hoogte blijven vastgelegd. De homepagefoto blijft volledig zichtbaar in zijn eigen verhouding.

Een picture-element is niet nodig wanneer dezelfde foto uitsluitend in verschillende breedtes wordt aangeboden; srcset en sizes verzorgen die keuze. Schrijfbeeld en inhoud zijn niet gewijzigd voor vermeende SEO-voordelen. Werkelijke Core Web Vitals moeten na publicatie worden gemeten; er is geen snelheidsscore of rankingwinst vastgesteld.

## 4. Gestructureerde gegevens

Organization is behouden voor OKT Logistics BV. AutomotiveBusiness is bedoeld voor autoverkoop, reparatie en onderdelen en past hier niet. Toegevoegd: wettelijke naam, btw-nummer, contactpunt, WebSite op de homepage en een OfferCatalog met de bestaande diensten. Dienstpagina's hebben Service met een vaste @id en een verwijzing naar het bedrijf. Artikelen en broodkruimels behouden hun bestaande gegevens. Er zijn geen reviews, certificaten, openingstijden of profielen verzonnen.

## 5. Sitemap en robots

Elke build leest alle pagina-JSON's en maakt de sitemap opnieuw. Een nieuwe inhoudspagina komt dus na bouwen automatisch in de sitemap. Privacyconcept, bedankt- en 404-pagina blijven uitgesloten; deze hebben noindex. Robots.txt verwijst naar de sitemap en blokkeert de API, niet de CSS of afbeeldingen. Er worden geen fictieve lastmod-datums toegevoegd.

Gebruik `npm run build` na handmatige inhoudswijzigingen; het lokale beheer doet dit na opslaan. `npm test` voert de controles achtereenvolgens uit, zodat gelijktijdige builds elkaar niet verstoren.

## Controlebewijs

Acht automatische tests geslaagd: inhoud/metadata, links/afbeeldingen, redirectketens en lussen, sitemap/canonical/social-consistentie, serverroutes, configuratie en formulierverwerking met nagebootste maildienst. De afzonderlijke controle vond nul fouten bij 32 pagina's en 1.318 lokale verwijzingen. Er is geen echte mail verstuurd en geen externe Google-validatie of live performance-audit uitgevoerd.

## Bronnen

- Google: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google: https://developers.google.com/search/docs/appearance/google-images
- Web.dev: https://web.dev/learn/design/responsive-images
- Schema.org: https://schema.org/Service en https://schema.org/AutomotiveBusiness
