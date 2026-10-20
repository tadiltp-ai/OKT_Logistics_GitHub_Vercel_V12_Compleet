# AI-search readiness: OKT Logistics (20 October 2026)

Status: research and non-production checklist. **No content, redirect, robots rule, metadata, or deployment changes are authorized by this file.**

## Current evidence
- V12 source contains a crawlable `public/robots.txt` with `User-agent: *` and `Disallow: /api/`, plus sitemap reference. This normally allows public-page crawling for Googlebot, OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot, subject to production firewall/CDN behavior.
- Build pipeline emits canonical, structured-data and multilingual routes; `tests/seo.test.mjs` already checks sitemap and canonical URLs.
- Vercel preview deployments use `X-Robots-Tag: noindex, nofollow`. **Keep this protection**.
- Live homepage was readable on 2026-10-20. Live `/robots.txt` and `/sitemap.xml` were not reliably readable in the research tool. **Do not assume an HTTP error** without independent checks.
- The production Vercel project-to-repository link still needs explicit verification.
- Lead form supports API-based submission only when environment variables and privacy settings are configured; verify in production before claiming every submission is tracked.

## Verification checklist (read-only until approved)
1. Confirm Vercel production domain is connected to this V12 repo and main branch.
2. Request `GET /robots.txt`, `GET /sitemap.xml`, and sample service pages; record status, content type, canonical, indexability and headers. Verify responses from both browsers and external bots without bypassing security.
3. Verify production CDN/WAF is not blocking Googlebot, OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot. Review verified logs rather than relying solely on user-agent strings.
4. Check sitemap's public URLs are indexable 200 responses, canonical URLs match, and old Wix copy-of URLs 301/308 directly to relevant destinations (not loops/chains).
5. Validate schema properties against visible facts. Do not invent awards, reviews, fleet size, certifications, service hours or locations.
6. Verify GA4 measures successful quote submissions (not just form opens, failed sends or mailto clicks). Never expose environment secrets or user leads in issue trackers.
7. Review top landing pages and Search Console queries before any editorial changes. Prioritize refrigerated/frozen transport and NL↔DE/BE/FR journeys supported by actual services.
8. Document English/German hreflang reciprocity and actual translated quality.

## Cross-platform policy
- Google/Gemini: follow Google Search Essentials and its guidance for AI search. No special AI-only markup is required; Google does not use llms.txt for Search ranking.
- ChatGPT: permit OAI-SearchBot for search discovery if desired. GPTBot (training) is a separate policy decision, not a prerequisite for search.
- Claude: distinguish Claude-SearchBot/Claude-User (search and user retrieval) from ClaudeBot (training).
- Perplexity: check its current crawler documentation and CDN access; don't blindly add directives.
- Provide original, verifiable operational expertise in customer-readable content. Avoid mass-produced near-duplicate city pages, unsubstantiated superlatives or paid/fabricated mentions.
- Visibility/citations are never guaranteed on any engine.

## Safety gate
Only technical tests and audit notes are in scope of this branch. Changes to service copy, metadata, structured business facts, sitemap entries, redirects, crawl directives, or production require a separate proposal and explicit owner approval. Run `npm test` and inspect the Vercel preview before merging.

Official source references:
- https://developers.google.com/search/docs/essentials
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots
- https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
