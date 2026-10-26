# Ask & Explore

An editorial public frontend for the existing FastAPI publishing service. Built with Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, locally owned shadcn/ui components with Radix primitives, Lucide, React Hook Form, and Zod. Deployment target: Netlify, Node 22.12 or newer.

## Run locally

```sh
npm ci
cp .env.example .env.local
# Set the API origins for your existing backend.
npm run dev
```

Open http://localhost:3000. `API_BASE_URL` is the backend origin (or deployment prefix), **without `/api/v1`**. A disconnected backend displays recovery states; no demo articles are shipped. The production build can run without a live backend because API-dependent content loads at request time.

Geist and variable Newsreader fonts are bundled locally through `geist`, `@fontsource-variable/newsreader`, and `next/font/local`; builds never request Google Fonts. Development and build scripts use the supported webpack compiler because this workstation restricts Turbopack worker ports. Tailwind uses its standard PostCSS integration. Cache Components and partial prefetching remain enabled.

## Pages and UI

- `/`: Version 2 editorial introduction and image-led featured story, compact topic strip below the hero, Version 1 category cards, latest stories, editor’s picks, a blue ranked popular section, reviews/guides, and paired request/newsletter cards. Article selections prefer distinct stories across sections, with reuse when the published catalog is small. Editor’s picks use featured articles when available; otherwise the section shows explicitly labeled recommendations. Reviews/guides include comparisons and embedded active article types. Popularity uses total backend view counts. These three sections remain visible with helpful empty states when no eligible content is available. The hero sizes to its content with 36–60px vertical padding controlled by one shared spacing variable in both featured-story and text-only layouts; the topic strip follows directly below it. Compact screens use a horizontally scrollable topic strip. Newsletter forms save emails through the subscription API.
- `/articles`: image-led introduction, a sticky independently scrolling category sidebar with real article totals, title search, article-type links, sort controls, grid/list views, URL state, pagination, and a subscription signup banner. Category filters appear in the sidebar rather than below the hero; mobile uses a native expandable category panel. The archive is composed from `src/components/articles/archive/` components. Author initials and real publication dates are used without fabricated portraits or reading times. Category count requests are bounded to 24 entries; failed or unqueried counts remain unspecified.
- `/articles/[slug]`: fresh article reads, metadata, author and dates, featured media, card-based reading layout, collapsible contents and related-story sidebars, heading anchors, progress, sharing, tables/code, disclosures, and active tags. The reader shares a 1320px responsive shell with the shared site navbar, with fixed toggle buttons at its outer edges. The reference-inspired design includes serif headlines, a progress row, author actions, five thumbnail-led recommendations, and a blue newsletter card. Saving is local to the current browser; newsletter signup stores emails for future article updates. The left contents panel stays sticky with independent scrolling and automatically reveals the current section; related stories stay sticky when they fit the viewport. Related stories move below the article under 1200px; contents become an inline disclosure under 900px.
- `/categories`: an image-led category directory with a large introduction, a wide live-search field without redundant category filter buttons or a sidebar, nested category links, and published article counts. Cards use published article previews with local 16:9 topic imagery as a fallback. Preview/count requests are bounded to 24 categories; unqueried or unavailable totals remain unspecified.
- `/category/[slug]`: the same hero, filters, article cards, grid/list views, pagination, and newsletter as `/articles`, using the category name/description and a full-width article grid without a desktop or mobile category panel. The category slug is pinned by the path; search, type, sort, pagination, view, and reset links stay in that category. Results retain direct category membership semantics.
- `/tag/[slug]`: shares the category-detail archive hero, full-width cards, filters, grid/list controls, pagination, and subscription signup. The tag is pinned by the route; query filters cannot replace it, and search/sort/reset links stay in the tag. `/tags/[slug]` redirects to the canonical singular route and preserves query parameters.
- `/search`: a reference-inspired search hero with a generated transparent 16:9 illustration, title search, and live category/format shortcuts. Results reuse the full-width article archive components without a sidebar, with bordered cards, highlighted titles, sort controls, grid/list views, pagination, active filters, and clear initial/empty/unavailable states. Query, filters, sorting, and view stay in the URL. The illustration and built-in imagegen prompt are saved in `public/images/search/`.
- `/request-article`: a centered hero over a generated full-width pale-blue background with books on the left and a laptop on the right, compact four-field suggestion form, three switchable idea starters that replace their own opening phrase while retaining the written subject and protecting custom drafts, a sidebar that scrolls with the form and contains a concise three-step How It Works card and a fuller three-point writing guide, always-visible FAQs, and a compact subscription signup. Name, email, and context stay optional. Existing public API submission, validation, honeypot, success/error feedback, and Retry-After handling are preserved. Components live in `src/components/requests/`; the local 16:9 background (`hero-background.webp`) and its built-in imagegen prompt are in `public/images/request-article/`. Hero text stays in HTML, and the background remains decorative and responsive. Form and sidebar cards sit below the hero with clear spacing; the sidebar stacks naturally on mobile.
- `/privacy`: uses the same dynamic legal structure as Terms and Disclaimer: a separate viewport-height sticky contents card, an article card, and a full-width contact strip. It keeps its original hero illustration, sans-serif headings, colored section icons, policy wording, and anchors through `privacyPage` in `src/components/legal/privacy-content.tsx`. Mobile uses the shared sticky horizontal contents strip. The local 16:9 illustration and built-in imagegen prompt remain in `public/images/privacy/`.
- `/terms` and `/disclaimer`: use one dynamic reference-inspired legal layout, composed from separate hero, sticky numbered contents, article sections, and document-note components in `src/components/legal/`. The numbered contents card fills the available viewport beneath the header and remains pinned until the full-width document note below both columns approaches; its height is capped by the article. Each page supplies its own `LegalPageConfig` from a separate content file; titles, descriptions, images, section IDs/text, and footer notes are configurable. Existing legal text and anchors are preserved. An optional real `updatedAt` value displays a dated note when supplied. The Terms hero illustration and built-in imagegen prompt are saved in `public/images/legal/`.
- `/about`, `/contact`, plus not-found, error, and loading interfaces. The 404 page uses a reference-inspired two-column hero, a generated transparent 16:9 signpost/bird/puppy illustration, and four recovery links. Its components live in `src/components/errors/`; the illustration and built-in imagegen prompt are saved in `public/images/not-found/`.

The design uses warm white, charcoal, royal blue, locally hosted Geist, serif display typography, responsive editorial grids, visible keyboard focus, reduced-motion support, accessible mobile dialogs, and print styles. Newsletter forms store subscriber emails for future updates; email delivery is not active yet. No comments, ratings, public admin UI, or fabricated contact methods are included. Traffic measurement uses first-party attribution; see the backend traffic tracking guide.

## Editorial redesign and contact delivery

The homepage, article archive, article detail page, About page, category directory, category detail page, Contact page, article request page, search page, Privacy Policy page, and tag detail page use the new reference-based layouts. Terms & Conditions and Editorial & Affiliate Disclosures also use the new shared legal layout, completing the redesign of all 13 main page types. The 404 page has its own updated recovery layout. Every route shares one modern navbar, mobile menu, light footer, and uncropped 16:9 image handling. The navbar shows Home, Articles, a live Categories dropdown, and About, followed by an editable search field and the navy Request a topic action. The right-hand search icon and Enter submit nonblank trimmed queries to `/search?search=...`; focusing the input never navigates. Compact screens open the same search form in a focused popover and use shorter action labels. The global error and loading states use new white/navy/blue components in `src/components/errors/`: a recovery card with Next.js `retry()` for fresh server reads, and an accessible responsive skeleton with 16:9 placeholders and reduced-motion support; route-specific navbar variants and legacy navbar styles have been removed.

The visual system includes a story-led hero, lead/standard/compact/row cards, original vector artwork, Newsreader display headlines, a light four-column footer with Quick Links, Explore Topics, and Stay in Touch, a keyboard-accessible More menu, and responsive reading layouts. Article browsing supports grid/list views, removable filter chips, highlighted title matches, and a searchable nested-topic directory. About is composed from separate hero, introduction, topic cards, mission, editorial principles, exploration CTA, and newsletter components in `src/components/about/`, with local optimized 16:9 images in `public/images/about/` and their image-generation prompts in `prompts.json`; policy pages have anchored contents and short overviews. Article code blocks support clipboard copying and correction links prefill Contact safely.

Contact uses separate reference-inspired hero, form, contact-details, FAQ, and newsletter components in `src/components/contact/`. Local optimized 16:9 photos and their built-in imagegen prompts are in `public/images/contact/`. The message form appears on the left and the information card on the right, stacking on mobile. The Subject controls retain the existing general/correction/privacy enquiry routes. It preserves correction context, validation, disabled/loading/error/success states, and topic-request routing. Contact details use only the configured public email, and no reply-time guarantee or partnership inbox is fabricated. Contact submissions now use `POST /api/v1/contact-messages` on FastAPI. Newsletter forms across the site, including the article reader and footer, use `POST /api/v1/subscriptions`.

Forms are enabled when API_BASE_URL and server-only API_USER/API_KEY credentials are configured. There is no separate `CONTACT_FORM_ENABLED` flag or Netlify Forms integration. Apply the backend's pending combined migration when ready before deploying the connected forms, configure `CORS_ORIGINS` to allow the website, and rebuild after changing the public API URL. Configure trusted proxy IPs on the backend if a reverse proxy supplies visitor addresses.

Contact and signup store data only: no notification email, confirmation email, or automated reply is sent. Success is shown only after an HTTP 202 response with the expected backend envelope. Errors preserve input; 429 responses honor `Retry-After` and disable retries during the countdown. Contact retains its honeypot, browser math check, and correction context. The obsolete `public/__forms.html` definition has been removed. Optional `CONTACT_EMAIL` is displayed only when valid and explicitly configured.

## Backend contract

Public types and runtime Zod decoders are derived from the supplied `/Users/macbookm1pro/openapi.json`. Behavior was cross-checked against the adjacent `Blogs_Backend` source and README. The security audit also updates the adjacent backend’s OpenTelemetry dependency pin and protects credentialed responses from caching; see the audit report below.

| Capability                          | Existing API                                                    |
| ----------------------------------- | --------------------------------------------------------------- |
| Published listings and title search | `GET /api/v1/articles`                                          |
| Published detail / backend JSON-LD  | `GET /api/v1/articles/{slug}`                                   |
| Active category directory/detail    | `GET /api/v1/categories`, `GET /api/v1/categories/{slug}`       |
| Active tags                         | `GET /api/v1/tags`, `GET /api/v1/tags/{slug}`                   |
| Active article types                | `GET /api/v1/article-types`, `GET /api/v1/article-types/{slug}` |
| Topic suggestions                   | `POST /api/v1/article-requests`                                 |
| Contact messages                    | `POST /api/v1/contact-messages`                                 |
| Subscriber email storage            | `POST /api/v1/subscriptions`                                    |

Success uses `{data}` or `{data, meta}`; failures use `{error}`. The website server authenticates content GETs with X-API-User and X-API-Key. Browser requests do not include these credentials, admin-only filters, or include_inactive. Embedded inactive classifications are hidden from public labels/navigation.

Supported public UI query fields are `search`, `category`, `tag`, `article_type`, `sort`, and `page`. UI page size is 12. Sort choices use `-published_at`, `published_at`, `-view_count`, and `title`. Categories match **direct membership**, not descendants. GET forms reset page state when filters change. Unknown query fields are not forwarded.

Forms post to the website’s same-origin gateway, which authenticates to FastAPI and forwards only platform-verified visitor IPs. Client-side Zod validation complements the backend's authoritative validation. Name/email/description are optional. Responses return no submission ID, status, contact information, or admin notes. The gateway only forwards verified platform visitor-IP headers; other browser forwarding headers are ignored.

## Environment and Netlify deployment

| Variable                     | Purpose                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `API_BASE_URL`               | Server-side FastAPI base origin, without `/api/v1`                              |
| `SITE_URL`                   | Absolute HTTPS canonical production origin                                      |
| `NEXTJS_REVALIDATION_SECRET` | Independent shared bearer secret, at least 32 characters                        |
| `IMAGE_REMOTE_HOSTS`         | Comma-separated exact HTTPS image hostnames approved for optimization           |
| `CONTACT_EMAIL`              | Optional approved public contact address; omitted email renders no email method |

1. Connect this repository to Netlify. `netlify.toml` sets Node 22, `npm run build`, and `.next` output. The repository explicitly installs and enables `@netlify/plugin-nextjs` to package server-rendered routes and API functions; no static export or separate API service is created.
2. Set production environment variables in Netlify, including both server and build scope where appropriate. `NEXT_PUBLIC_*`, image configuration, canonical metadata, contact details, and preview indexing are build-sensitive; rebuild when changing them. Do not set secrets under `NEXT_PUBLIC_*`.
3. Run `npm run check:config` with your production variables, then deploy. Missing production settings intentionally fail this readiness check. Local builds remain possible without those settings.
4. Allow the exact production frontend origin in the existing backend's `CORS_ORIGINS`. For local work, allow `http://localhost:3000`. The existing backend exposes `Retry-After` and `X-Request-ID` for browser error handling.
5. Configure the existing backend's `NEXTJS_REVALIDATION_ENABLED=true`, `NEXTJS_REVALIDATION_URL=https://YOUR_DOMAIN/api/revalidate`, and matching `NEXTJS_REVALIDATION_SECRET`. Set these through deployment configuration; no backend source changes are needed.
6. Approve image hosts in `IMAGE_REMOTE_HOSTS`. Known HTTPS hosts use `next/image` and Netlify image optimization. Unlisted safe HTTP(S) images render directly without proxying arbitrary hosts. Use HTTPS images for an HTTPS site. Inline body images are lazy-loaded; their original dimensions are retained when provided. Root-relative body image URLs resolve against the backend origin.
7. Confirm production API connectivity, CORS preflights, submission delivery, publish/update/unpublish webhook delivery, image loading, canonical URLs, sitemap, robots, and mobile rendering.
8. Set the operator's actual public contact information and review legal pages against actual practices and jurisdiction before launch. The current copy makes no compliance certification, jurisdiction, or invented business-identity claims.

Netlify preview contexts are `noindex` and disallowed in robots. A missing/HTTP `SITE_URL` also disables indexing. See [Netlify's Next.js documentation](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

## Freshness and revalidation

Article bodies are **never persistently cached**. React's request-scoped cache shares the detail read between metadata and page rendering. A new server detail request checks the backend's published-only route, and an upstream failure never falls back to a cached body. An already open browser page does not automatically retract content. Article link prefetching remains disabled; browser analytics events now count visits rather than article API reads.

Published listings, taxonomy data, and sitemap source data use `use cache` with `revalidate: 60`, `expire: 120`, and explicit collection tags. Keyword searches are uncached. Listing data may remain briefly stale after missed webhook delivery; it does not determine whether an article detail is publicly accessible.

The existing backend sends bearer-authenticated JSON:

```json
{
  "event": "article.update",
  "entity_id": "00000000-0000-4000-8000-000000000001",
  "article_id": "00000000-0000-4000-8000-000000000001",
  "slugs": ["new-slug", "old-slug"],
  "tags": [
    "articles",
    "categories",
    "tags",
    "article-types",
    "article:00000000-0000-4000-8000-000000000001",
    "article:new-slug",
    "article:old-slug"
  ]
}
```

`POST /api/revalidate` uses constant-time authentication, strict identity/event/tag validation, a 16KiB streamed body limit, bounded arrays, safe slugs, and allowlisted route invalidation. Long article slugs use the backend's `article-slug-sha256:<digest>` rule. Tags expire immediately with `{expire: 0}`. Current/previous article URLs, discovery/listing routes, category/tag patterns, and sitemap caches are invalidated. Classification/author changes invalidate article route patterns too. The backend has no durable webhook queue/retry guarantee; monitor delivery operationally.

## SEO and media

Editorial image frames use 16:9 across the homepage, article listings, category previews, related stories, and article featured images. Images use `contain` and retain their complete content; hover zoom is disabled. The homepage displays its complete 16:9 feature inside a content-sized hero. Supply 1920×1080 originals or smaller 16:9 optimized files through the existing image URLs; no fixed-resolution upload is required. Inline body images retain their natural proportions. All bundled page photographs and illustrations use WebP, and Next.js image optimization explicitly targets WebP. SVG branding and PNG/ICO application icons retain their native formats for sharpness and platform compatibility. Images supplied by the external article API remain managed by that service.

The shared `Brand` component uses a clean, transparent AE vector mark and a navy/blue/teal wordmark in the header, footer, and mobile menu. The source SVG mark lives in `public/images/brand/`; unused standalone logo exports are omitted. Run `node scripts/generate-brand-assets.mjs` to regenerate the browser favicon, Apple icon, and manifest icons from `ae-mark.svg`. Passing an optional source-artwork path also regenerates the 1920×1080 WebP article fallback; Next.js creates responsive sizes on demand. Missing or failed article thumbnails use the local book-and-compass artwork; its image-generation prompt is recorded in `public/images/brand/prompts.json`.

Metadata includes backend overrides, canonical URLs, Open Graph, Twitter cards, and publication/update dates. Backend JSON-LD is serialized with script-safe escaping, alongside breadcrumb JSON-LD. A local generated social image provides a brand fallback. Search/filtered listing variants are `noindex`; ordinary paginated listings retain self-canonicals. The dynamic XML sitemap at `/sitemap.xml` consumes every API page of published articles, active categories, and active tags, alongside the nine standard site pages. It emits canonical `/articles/[slug]`, `/category/[slug]`, and `/tag/[slug]` URLs, deduplicates entries, skips unroutable slugs, and uses valid API modification dates with publication/creation-date fallbacks. Search, filter variants, redirects, and private routes are excluded. API failures propagate instead of producing a misleading partial successful sitemap. Source caches refresh after 60 seconds and expire after 120 seconds; existing publish/update/delete webhooks invalidate them immediately. Production URLs use the HTTPS `SITE_URL`, and `robots.txt` advertises `/sitemap.xml`. Local development can inspect the complete sitemap using the current loopback host and port while robots remain blocked; non-production deployment previews keep an empty sitemap.

The sitemap currently supports up to 50,000 URLs and 100,000 source records per collection. It explicitly fails beyond those bounds; partitioned sitemaps are required before approaching that scale.

Reading time is calculated from full article text at 220 words/minute. Summaries lack body/word-count/reading-time fields, so cards omit reading time rather than issue N+1 detail requests. There is no affiliate boolean; sponsored-link notices use actual `rel="sponsored"` markup. Editors must include accurate, contextual commercial disclosures. Raw backend view counts are not unique visitor analytics.

## Verification

Contact and article-request forms include a shared, browser-side addition check with two random numbers from 1–9. A correct answer is required before the existing submission request is sent. Readers can refresh the question; each delivery attempt also resets it while retaining other fields after an error. Newsletter, search, and filter forms do not use this check. Newsletter forms now save emails through the backend; they do not send email.

This is a lightweight client-side check, not server-enforced CAPTCHA protection. API contracts and Netlify form fields are unchanged; backend validation, honeypots, and rate limits remain responsible for server-side abuse handling.

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Vitest covers components, URL state, article processing, form validation/submission/rate limits, metadata helpers, response contracts, and revalidation authentication/invalidation. Async Server Components are exercised through Playwright against a **separate test-only API**, not mocked production code. The E2E suite starts that API on port 4100 and a production build on port 3100, runs Chromium desktop/mobile profiles, and checks navigation, rendering, filters, forms, SEO, public visibility, and webhook security. Keep these ports free. Test fixtures never enter application bundles or production fallback paths.

Playwright reports are in `playwright-report/`; failure traces/screenshots are in `test-results/`. Performance targets are LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Local synthetic results do not establish real-user performance on Render/Netlify; measure the deployed site with production content and network conditions.

### Security audit and content strategy

The [security audit report](docs/security-audit.md) documents the reviewed attack surfaces, applied fixes, verification, and deployment checks. Server-rendered article HTML uses an explicit allowlist sanitizer; upstream JSON reads and collection walks are bounded. The enforced CSP preserves Cache Components and partial prerendering, so inline bootstrap scripts remain allowed; it is not a strict nonce policy. API origins require HTTPS except explicit loopback development endpoints, and image optimization accepts exact configured HTTPS hosts without redirects or private-IP access. Rebuild and redeploy both services for source and dependency fixes to reach production.

The [content strategy](docs/seo/content-strategy.md) and [keyword opportunity map](docs/seo/keyword-opportunities.csv) cover the global English-speaking audience. Keyword volume and difficulty remain unverified; no rankings or search-volume guarantees are implied. API-authored article bodies and metadata remain under editorial control.

### Netlify default 404 after a successful build

A successful `next build` alone is insufficient for this server-rendered application. The deploy log must also show `@netlify/plugin-nextjs` adapter steps and server-function packaging. A log that only uploads `.next` with zero functions indicates the runtime was not applied. This repository explicitly declares the adapter in `netlify.toml` and its development dependencies.

Push the dependency lockfile and configuration changes, then clear the Netlify build cache and redeploy. Ensure the Next.js runtime is not disabled in project settings and remove `NETLIFY_NEXT_PLUGIN_SKIP` if configured. Check that the deploy log includes the adapter and that the homepage, `/about`, and `/articles` load. Backend outages should render application recovery states rather than Netlify's default 404.

The website uses API_BASE_URL on the server for backend requests. Browser forms
receive only the same-origin root path. Set matching API_USER/API_KEY in both
the website server and backend, then redeploy. Credentials are never serialized
through the forms provider.

## Authenticated backend access

Set `API_USER` and `API_KEY` (32+ characters) in the website server environment,
with identical values in the backend. All content reads, short-link resolution,
and analytics ingestion attach X-API-User and X-API-Key on the server. The existing
analytics ingest secret remains required as well. Missing credentials fail closed.

Contact, topic, and subscription forms now call same-origin `/api/v1/...` routes.
The gateway allows POST only to these three endpoints, bounds request bodies,
checks origin, strips browser auth/cookies/custom credential headers, and attaches
server credentials. It preserves safe validation errors and Retry-After responses.
It never provides a general backend proxy or exposes credentials in responses.
On Vercel it forwards the platform-owned x-vercel-forwarded-for header; on Netlify,
x-nf-client-connection-ip. Unrecognized deployments omit visitor forwarding and
share backend connection-IP limits until a trusted platform integration is added.
Backend public access and visitor headers are documented in PUBLIC_API_ACCESS.md
in the backend repo. The backend address and credentials are no longer sent to
browser forms; the forms provider supplies only the same-origin root path.
