# OKT Logistics — SEO V13

Datum: 1 oktober 2026. Basis: de complete lokale GitHub/Vercel V12-versie. Dit pakket is niet gepubliceerd; de live website is niet aangepast.

## Uitgevoerd

- Permanente redirects voor contact-us, about-us, services, portfolio, home, nl en het aangetroffen oude transport-adres, met en zonder afsluitende slash. Bestaande diepvriestransport- en levensmiddelen-transport-redirects behouden. /en gaat nu naar de werkende /en/. Onbekende adressen blijven terecht 404 en worden niet allemaal naar Home gestuurd.
- Redirects en cache-instellingen in vercel.json én de Build Output-configuratie. Dit project gebruikt een eigen Node/Vercel-adapter; alleen vercel.json wijzigen zou onvoldoende robuust zijn.
- De homepagefoto krijgt eager laden, high fetchpriority, async decoding, een afgestemde preload en 640/960/1280/1920-bronnen. Foto's behouden hun verhouding. Alle afbeeldingen krijgen intrinsieke afmetingen. Eerste inhoudsfoto eager; volgende foto's lazy. Het logo wordt direct geladen.
- Langdurige cache voor assets, CSS en JS. Contenthashes in de asset-URL's voorkomen dat gewijzigde bestanden een jaar oud blijven. CSS en JS hebben eveneens hun bestaande contenthash-versies.
- Zes aangeleverde foto's als WebP geleverd. Geen AI-bewerking, filters of uitsneden toegepast. Geen vergroting boven de bronresolutie voor deze nieuwe foto's. De oudere homepagefoto heeft wel zijn bestaande 1920px-bron. Geen nieuwe claims over certificatie of temperatuurregistratie.
- Per bestaande dienst-/landenpagina een echte aanvullende truckfoto en een inactieve tweede fotoplaats in de bron. Geen kapotte placeholder-afbeeldingen op de website. Brabant heeft ook een aanvullende foto. Een generieke truckfoto wordt niet als foto uit België of Frankrijk omschreven.
- Tien Engelse pagina's: /en/, /en/services/, /en/refrigerated-transport/, /en/frozen-transport/, /en/international-refrigerated-transport/, /en/refrigerated-transport-germany/, /en/refrigerated-transport-belgium/, /en/refrigerated-transport-france/, /en/about-us/, /en/contact/.
- Engelse B2B-teksten, eigen metadata, canonicals, lang, sociale afbeeldingsbeschrijvingen, og:locale, taalwisselaar en wederzijdse hreflang voor de tien vertaalparen. De overige Nederlandse pagina's hebben geen fictieve Engelse tegenhanger: hun EN-knop opent de Engelse homepage. Geen onjuiste hreflang naar een niet-gelijkwaardige pagina.
- Brabant-pagina met 702 woorden over Oss, Nijmegen, Den Bosch, productcondities en routeplanning. In navigatie, footer en sitemap opgenomen.
- Organization uitgebreid met LocalBusiness en de opgegeven LinkedIn-link. Openingstijden op uw bevestiging ingesteld op 24 uur per dag, alle zeven dagen, zichtbaar en in structured data.
- Informatieve titels/H1's voor de Duitsland- en Frankrijk-uitlegartikelen, met contextuele dienstlinks. Homepage teruggebracht naar zeven H2's. Bestaande kopopmaak behouden via CSS-klassen.
- FAQPage uitsluitend uit zichtbare vraag/antwoordblokken. BreadcrumbList en zichtbare kruimelpaden op subpagina's. Article blijft gekoppeld aan de werkelijke CMS-datumvelden.
- Apple-touch-icon 180px, PNG-favicon, 192/512px-iconen en webmanifest. Alle 40 indexeerbare pagina's staan in de sitemap met lastmod; de 3 bestaande verborgen/conceptpagina's blijven erbuiten.
- 43 inhoudspagina's in totaal. De bestaande CSP, formulierbeveiliging, privacy-instellingen, bedrijfsgegevens en robots-regels behouden.

## Nog door u aan te leveren

1. [IN TE VULLEN: exacte breedte- en lengtegraad van Honsdijk 1, 5364 NL Escharen]. De externe adresdienst kon tijdens deze uitvoering niet worden bereikt. `content/site.json` bevat `geo: null`; vul pas na controle een object met numerieke `latitude` en `longitude` in. Dan neemt de build dit automatisch op.
2. [IN TE VULLEN: URL Google Bedrijfsprofiel]. Voeg de bevestigde openbare profiel-URL toe aan `sameAs` in `content/site.json`. LinkedIn staat er al in.
3. [IN TE VULLEN: oorspronkelijke publicatiedatum van elk kennisbankartikel]. De datum van eerste publicatie is niet af te leiden uit deze bestanden. `datePublished` is daarom niet verzonnen. Vul per artikel in `content/*.json` een bevestigde datum `YYYY-MM-DD` in; de bestaande build zet die automatisch in Article. `dateModified` en sitemap-lastmod zijn 2026-10-01 voor de nu aangepaste uitvoer. Een nieuwe publicatiedatum gebruiken voor oude artikelen zou misleidend zijn.
4. Optioneel: echte laadlocatiefoto's uit België, Frankrijk en Brabant, en foto's van palletladingen voor groupage/food. De gereserveerde tweede fotoplaatsen zijn HTML-commentaren en veroorzaken geen foutmeldingen. De zes nieuwe foto's staan al in `public/assets/okt-*-v13-*`.

De bronfoto's tonen soms namen van andere bedrijven op gebouwen of trailers. Dat is geen bewijs van een klantenrelatie; die relatie wordt nergens geclaimd. De foto met Waddinxveen wordt ook zo beschreven.

## Technische indeling en publiceren

De publieke URL's hebben een afsluitende slash. De bestaande architectuur bewaart de gegenereerde HTML intern als losse bestanden; de Node-adapter vertaalt die naar schone URL's. Engelse bestanden zoals `en--contact.html` worden via `/en/contact/` bediend. De Engelse tekstbron staat in `tools/english.mjs`; de Nederlandse bron blijft in `content/*.json`. Bewerk gegenereerde HTML niet als enige bron, want een volgende build overschrijft dat.

Pak de ZIP uit en zet de volledige inhoud, inclusief alle mappen, in de GitHub-repository. Upload niet alleen de losse bestanden bovenaan. Laat Vercel de bestaande buildopdracht `npm test && npm run build:vercel` uitvoeren. De build moet Node 22 gebruiken volgens package.json. Lokale controles zijn uitgevoerd met de beschikbare Node 24.19-runtime; Vercel/Node 22 moet na publicatie opnieuw bevestigen dat de build slaagt.

De Engelse contactpagina biedt direct e-mail- en telefooncontact. De bestaande Nederlandse aanvraagformulieren blijven behouden. Online verzending blijft afhankelijk van de bestaande Vercel-omgevingsvariabelen; dit pakket activeert geen maildienst en verandert geen geheimen.

## Controlelijst na publicatie

- [ ] Vercel-build geslaagd; nieuwste productieversie openen op het eigen domein.
- [ ] Test /contact-us en /contact-us/, /about-us, /services, /portfolio, /home, /nl, /transport en de bestaande legacy-adressen. Verwacht één permanente redirect naar de juiste pagina; test ook met `?source=test`.
- [ ] Test /en → /en/; controleer alle tien Engelse pagina's en NL/EN-teruglinks. Onbekende adressen moeten 404 blijven.
- [ ] Open de homepage op desktop en mobiel. Controleer het menu, de foto, directe contactknoppen en het bestaande offerteformulier.
- [ ] Controleer PageSpeed Insights (mobiel) voor Home, koeltransport, Brabant en /en/. Controleer vooral LCP, CLS en de gebruikte afbeeldingsvariant. Er is geen nieuwe PageSpeed-score gemeten voor deze nog niet gepubliceerde versie.
- [ ] Test Home, een dienstpagina, een FAQ-pagina en een artikel in Google Rich Results Test. Controleer ook Schema Markup Validator voor typen die Google niet als rich result ondersteunt. Geldige FAQPage-markup garandeert geen FAQ-weergave in Google.
- [ ] Controleer CSP en dat er geen consolefouten zijn; geen versoepeling van de beveiligingsheader nodig.
- [ ] Open /sitemap.xml en /robots.txt op het eigen domein; dien de sitemap opnieuw in Google Search Console in.
- [ ] Gebruik URL-inspectie voor belangrijke nieuwe bestemmingspagina's en vraag waar nodig indexering aan. Inspecteer oude adressen op de correcte redirect. Vraag geen verwijdering aan voor oude URL's die juist moeten doorverwijzen.
- [ ] Volg de indexeringsrapporten na nieuwe crawls. Oude rapportcijfers verdwijnen niet direct en indexering is niet gegarandeerd.

## Controles vóór oplevering

15 automatische tests geslaagd: metadata, JSON-LD JSON-syntaxis, zichtbare FAQ-koppeling, hreflang, sitemap, afbeeldingsbestanden/afmetingen, interne links/ankers, redirects, Engelse routes, cacheheaders, bestaande formulierbeveiliging, CSP en Vercel-functiepakket. Desktopweergave van NL/EN bekeken en mobiele EN/Brabant-weergave gecontroleerd. Dit is geen claim dat alle externe Google-validaties al zijn uitgevoerd.

## Bronnen voor implementatie en nacontrole

- Google meertalige websites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Vercel Build Output: https://vercel.com/docs/build-output-api/configuration
- PageSpeed: https://pagespeed.web.dev/
- Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org/

Zie `GEWIJZIGDE-BESTANDEN.md` voor het volledige overzicht. De ZIP bevat de volledige inhoud van alle projectbestanden, niet alleen patches of fragmenten.
