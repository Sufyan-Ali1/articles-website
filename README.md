# Ask & Explore

An editorial public frontend for the existing FastAPI publishing service. Built with Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, locally owned shadcn/ui components with Radix primitives, Lucide, React Hook Form, and Zod. Deployment target: Netlify, Node 22.

## Run locally

```sh
npm ci
cp .env.example .env.local
# Set the API origins for your existing backend.
npm run dev
```

Open http://localhost:3000. `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` are the backend origin (or deployment prefix), **without `/api/v1`**. A disconnected backend displays recovery states; no demo articles are shipped. The production build can run without a live backend because API-dependent content loads at request time.

Geist and variable Newsreader fonts are bundled locally through `geist`, `@fontsource-variable/newsreader`, and `next/font/local`; builds never request Google Fonts. Development and build scripts use the supported webpack compiler because this workstation restricts Turbopack worker ports. Tailwind uses its standard PostCSS integration. Cache Components and partial prefetching remain enabled.

## Pages and UI

- `/`: featured editorial grid, latest stories, category discovery, popular stories, available tutorial/review/guide/comparison sections, and topic-request call to action. Empty sections are hidden.
- `/articles`: published article grid, title search, category/type/sort controls, URL state, and pagination.
- `/articles/[slug]`: fresh article reads, metadata, author and dates, featured media, 740px reading column, heading anchors/TOC, progress, sharing, tables/code, disclosures, active tags, and related stories.
- `/categories`, `/category/[slug]`, `/tag/[slug]`: active classifications, descriptions, nested navigation, and paginated direct-membership results.
- `/search`: title search of published articles, synchronized URL filters, empty results, and retryable errors.
- `/request-article`: validated private suggestions, honeypot, loading/success feedback, backend validation, and rate-limit handling.
- `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, plus not-found, error, and loading interfaces.

The design uses warm white, charcoal, royal blue, locally hosted Geist, serif display typography, responsive editorial grids, visible keyboard focus, reduced-motion support, accessible mobile dialogs, and print styles. No comments, ratings, newsletter, analytics, admin UI, or fabricated contact methods are included.

## Editorial redesign and contact delivery

The visual system includes a story-led hero, lead/standard/compact/row cards, original vector artwork, Newsreader display headlines, a dark footer, a keyboard-accessible Topics menu, and responsive reading layouts. Article browsing supports grid/list views, removable filter chips, highlighted title matches, and a searchable nested-topic directory. About has its own editorial layout; policy pages have anchored contents and short overviews. Article code blocks support clipboard copying and correction links prefill Contact safely.

Contact includes enquiry routing, correction context, validation, loading/error/success states, FAQs, and topic-request routing. It uses **Netlify Forms**, independently of FastAPI. It is disabled by default: `CONTACT_FORM_ENABLED=false`.

To activate contact delivery:

1. Deploy `public/__forms.html` with Netlify form detection enabled. Confirm the `contact` form appears in the Netlify Forms dashboard.
2. Configure notifications to an approved inbox and review the provider's retention/access settings. Keep the privacy notice accurate.
3. Enable `CONTACT_FORM_ENABLED=true`, redeploy, and send a real test message. Verify both the dashboard submission and notification arrival, including correction URL fields. Check failure feedback as well.

The static definition and AJAX submission use identical field names and POST to `/__forms.html`, following the [Netlify OpenNext forms integration](https://opennext.js.org/netlify/forms). Automated tests intercept this POST; they do not prove production inbox delivery. No contact API or backend changes are introduced. Optional `CONTACT_EMAIL` is displayed only when valid and explicitly configured.

## Backend contract

Public types and runtime Zod decoders are derived from the supplied `/Users/macbookm1pro/openapi.json`. Behavior was cross-checked against the adjacent `Blogs_Backend` source and README. No backend files were changed.

| Capability                          | Existing API                                                    |
| ----------------------------------- | --------------------------------------------------------------- |
| Published listings and title search | `GET /api/v1/articles`                                          |
| Published detail / backend JSON-LD  | `GET /api/v1/articles/{slug}`                                   |
| Active category directory/detail    | `GET /api/v1/categories`, `GET /api/v1/categories/{slug}`       |
| Active tags                         | `GET /api/v1/tags`, `GET /api/v1/tags/{slug}`                   |
| Active article types                | `GET /api/v1/article-types`, `GET /api/v1/article-types/{slug}` |
| Topic suggestions                   | `POST /api/v1/article-requests`                                 |

Success uses `{data}` or `{data, meta}`; failures use `{error}`. Classification GETs support anonymous access. Requests do not send authentication, admin-only filters, or `include_inactive`. Embedded inactive classifications are hidden from public labels/navigation.

Supported public UI query fields are `search`, `category`, `tag`, `article_type`, `sort`, and `page`. UI page size is 12. Sort choices use `-published_at`, `published_at`, `-view_count`, and `title`. Categories match **direct membership**, not descendants. GET forms reset page state when filters change. Unknown query fields are not forwarded.

The form posts directly to the public API so the backend's per-IP limits retain visitor identity. Client-side Zod validation complements the backend's authoritative validation. Name/email/description are optional. Responses return no submission ID, status, contact information, or admin notes. Do not add a Next.js proxy without separately validating the trusted-proxy/IP chain.

## Environment and Netlify deployment

| Variable                     | Purpose                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `API_BASE_URL`               | Server-side FastAPI base origin, without `/api/v1`                              |
| `NEXT_PUBLIC_API_BASE_URL`   | Public base origin for direct suggestion POSTs; never a secret                  |
| `SITE_URL`                   | Absolute HTTPS canonical production origin                                      |
| `NEXTJS_REVALIDATION_SECRET` | Independent shared bearer secret, at least 32 characters                        |
| `IMAGE_REMOTE_HOSTS`         | Comma-separated exact HTTPS image hostnames approved for optimization           |
| `CONTACT_EMAIL`              | Optional approved public contact address; omitted email renders no email method |

1. Connect this repository to Netlify. `netlify.toml` sets Node 22, `npm run build`, and `.next` output. Netlify supplies its maintained OpenNext adapter automatically; no static export or separate API service is created.
2. Set production environment variables in Netlify, including both server and build scope where appropriate. `NEXT_PUBLIC_*`, image configuration, canonical metadata, contact details, and preview indexing are build-sensitive; rebuild when changing them. Do not set secrets under `NEXT_PUBLIC_*`.
3. Run `npm run check:config` with your production variables, then deploy. Missing production settings intentionally fail this readiness check. Local builds remain possible without those settings.
4. Allow the exact production frontend origin in the existing backend's `CORS_ORIGINS`. For local work, allow `http://localhost:3000`. The existing backend exposes `Retry-After` and `X-Request-ID` for browser error handling.
5. Configure the existing backend's `NEXTJS_REVALIDATION_ENABLED=true`, `NEXTJS_REVALIDATION_URL=https://YOUR_DOMAIN/api/revalidate`, and matching `NEXTJS_REVALIDATION_SECRET`. Set these through deployment configuration; no backend source changes are needed.
6. Approve image hosts in `IMAGE_REMOTE_HOSTS`. Known HTTPS hosts use `next/image` and Netlify image optimization. Unlisted safe HTTP(S) images render directly without proxying arbitrary hosts. Use HTTPS images for an HTTPS site. Inline body images are lazy-loaded; their original dimensions are retained when provided. Root-relative body image URLs resolve against the backend origin.
7. Confirm production API connectivity, CORS preflights, submission delivery, publish/update/unpublish webhook delivery, image loading, canonical URLs, sitemap, robots, and mobile rendering.
8. Set the operator's actual public contact information and review legal pages against actual practices and jurisdiction before launch. The current copy makes no compliance certification, jurisdiction, or invented business-identity claims.

Netlify preview contexts are `noindex` and disallowed in robots. A missing/HTTP `SITE_URL` also disables indexing. See [Netlify's Next.js documentation](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

## Freshness and revalidation

Article bodies are **never persistently cached**. React's request-scoped cache shares the detail read between metadata and page rendering. A new server detail request checks the backend's published-only route, and an upstream failure never falls back to a cached body. An already open browser page does not automatically retract content. Article link prefetching is disabled because detail requests increment backend view counts.

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

Metadata includes backend overrides, canonical URLs, Open Graph, Twitter cards, and publication/update dates. Backend JSON-LD is serialized with script-safe escaping, alongside breadcrumb JSON-LD. A local generated social image provides a brand fallback. Search/filtered listing variants are `noindex`; ordinary paginated listings retain self-canonicals. The sitemap consumes every public listing page and active category/tag page, excludes search/private routes, and fails rather than reporting partial upstream failures as a successful sitemap.

The sitemap currently supports up to 50,000 URLs and 100,000 source records per collection. It explicitly fails beyond those bounds; partitioned sitemaps are required before approaching that scale.

Reading time is calculated from full article text at 220 words/minute. Summaries lack body/word-count/reading-time fields, so cards omit reading time rather than issue N+1 detail requests. There is no affiliate boolean; sponsored-link notices use actual `rel="sponsored"` markup. Editors must include accurate, contextual commercial disclosures. Raw backend view counts are not unique visitor analytics.

## Verification

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

### Dependency advisory

The npm audit reports an unpatched `braces` stack-exhaustion advisory through the **development-only** `eslint-config-next` → `fast-glob` → `micromatch` chain. Its glob input here is trusted local lint configuration. Do not downgrade Next.js/ESLint or force a breaking audit fix to hide it; revisit when upstream publishes a compatible patch. [Advisory GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Run `npm audit --omit=dev` separately to assess shipped dependencies.
