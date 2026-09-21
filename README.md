# OKT Logistics — GitHub en Vercel

Dit project is voorbereid voor GitHub en Vercel met Node.js 22. Dezelfde bronbestanden blijven lokaal bruikbaar. Er zijn geen externe npm-afhankelijkheden.

## Publiceren
1. Maak een private GitHub-repository en upload de uitgepakte inhoud van deze map. `package.json` en `vercel.json` moeten bovenaan staan. Upload niet alleen de ZIP of alleen `public`.
2. Importeer die repository in Vercel via Add New → Project.
3. Framework: Other. Root Directory: de map met package.json. Laat Build Command uit vercel.json gebruiken. Laat Output Directory leeg: de build maakt zelf `.vercel/output`.
4. Deploy. Zonder mailinstellingen werkt de site met de bestaande e-mailvoorbereiding en aanvraagdownload.
5. Controleer homepage, diensten, landen, contact, een oud .html-adres en een niet-bestaand adres op de echte Vercel-URL.
6. Voeg het eigen domein toe onder Settings → Domains. Gebruik de DNS-waarden die Vercel voor dit project toont. Laat het niet-voorkeursdomein naar het voorkeursdomein verwijzen. Wijzig geen e-mailrecords.

Voorkeursdomein in de inhoud: https://www.oktlogisticholland.com. Bij een andere definitieve domeinkeuze eerst content/site.json en PUBLIC_ORIGIN aanpassen. Vercel-previewdeployments krijgen noindex. Een production-deployment wordt indexeerbaar; verbind daarom het juiste domein voordat de website als definitieve versie wordt aangekondigd.

## Formulier rechtstreeks laten verzenden
Stel alleen in Vercel Environment Variables in, nooit in GitHub:
- RESEND_API_KEY: sleutel van uw maildienst.
- MAIL_FROM: afzender op een geverifieerd domein.
- PUBLIC_ORIGIN: exact het definitieve HTTPS-adres.
- FORM_TOKEN_SECRET: een willekeurig gegenereerde geheime waarde van minimaal 32 tekens; dezelfde waarde voor alle productie-instanties.
- PRIVACY_READY=true: pas na het afronden van privacy.json, het wijzigen van type draft naar page en bevestigen van de verwerkersafspraken.
- GA4_ID: optioneel; bezoekerskeuze blijft leidend.

De lokale aanvraaglimiet is per serverinstantie. Configureer voor openbare online formulierverzending ook een centrale Vercel Firewall-limiet voor POST /api/quote; de lokale limiet is geen gedeelde serverless teller. Test daadwerkelijk ontvangst en foutafhandeling na activering. Tot dat moment is de e-mailvoorbereiding de werkende terugvaloptie.

## Beheer en updates
Het beheer blijft lokaal via Start-beheer.cmd. Na wijzigingen de bronbestanden naar GitHub pushen; Vercel bouwt opnieuw. Er is geen openbaar beheerpaneel. Back-ups, .env-bestanden en gegenereerde Vercel-uitvoer zijn uitgesloten van Git.

## Architectuur en controles
`npm test` voert de controles uit. `npm run build:vercel` maakt Vercel Build Output API v3-uitvoer: afbeeldingen en statische bestanden via CDN, overige aanvragen via de bestaande Node-handler. Er wordt tijdens een aanvraag niets naar schijf geschreven en de website wordt dan niet opnieuw opgebouwd. 301-doorverwijzingen, queryparameters, beveiligingsheaders, echte 404-responses en afgeschermde bronbestanden blijven behouden.

GitHub Actions controleert pushes en pull requests. De Vercel-build voert ook de tests uit voordat de uitvoer wordt gemaakt.

Lokaal geslaagd: 12 tests inclusief de gebundelde Vercel-handler. Nog niet op een echt Vercel-account gedeployd: daarvoor is inloggen vereist. HTTPS, DNS en echte mailaflevering kunnen pas daar worden geverifieerd.

Documentatie: https://vercel.com/docs/build-output-api
