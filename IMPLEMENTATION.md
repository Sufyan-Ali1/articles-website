# Implementation report

## Delivered

Ask & Explore now has a complete public App Router frontend in `src/`. The existing backend was inspected and left unchanged. Production code contains no demo articles, private API access, authentication tokens, or contact API.

All requested routes are implemented: home, articles directory/detail, categories directory/detail, tag detail, search, topic request, about, contact, privacy, terms, and disclaimer. Shared interfaces include editorial article cards, responsive media/fallbacks, nested category discovery, URL-based filters and pagination, mobile navigation, loading skeletons, empty/error states, and not-found handling.

The article experience includes 740px reading typography, safe HTML processing, responsive tables and code, unique heading anchors, desktop/mobile TOC, reading progress, copy/native sharing, reading-time estimation, author/dates, tags, related stories, and sponsored-link notices.

The API layer uses real `/api/v1` routes and validates `{data}`, `{data,meta}`, and `{error}` contracts. Public classifications are anonymous and active-only. Searches match published article titles. Topic suggestions use direct public POSTs, client plus backend validation, an empty honeypot, 202 feedback, 422 field handling, and 429 `Retry-After` support.

SEO includes metadata overrides, Open Graph/Twitter, canonical URLs, safely serialized backend JSON-LD and breadcrumbs, a generated brand social image, complete paginated sitemap sources, and preview/search indexing rules. Public article detail reads are uncached; listings/classifications have short explicit caches. The revalidation receiver validates bearer authentication and the actual backend event contract before immediate tag expiry and current/previous-slug plus discovery-route invalidation.

## Verification

- 36 Vitest/React Testing Library tests passed.
- 28 Playwright tests passed across Chromium desktop and mobile, including a production build, tablet screenshots, 320px overflow checks, Contact delivery/error flows with intercepted provider responses, discovery views, API outages, missing/inactive classifications, filtering/pagination, request success/validation/rate limits, unpublished article visibility, and revalidation security.
- TypeScript, ESLint, Prettier, `git diff --check`, and a separate production build without backend configuration passed.
- The production dependency audit returned zero vulnerabilities. The full audit reports the documented unpatched development-only `braces` advisory through the Next.js lint toolchain.
- Desktop, tablet, mobile, and article-reading screenshots were inspected. A small mobile headline adjustment keeps the introductory phrase together at typical phone widths.
- Local, unthrottled fixture measurements before that typography adjustment recorded LCP of 340ms desktop / 336ms mobile and CLS 0. The observed mobile interaction duration was 32ms. These are synthetic diagnostics, not production Core Web Vitals or field INP guarantees.

The test API and illustrated test stories are isolated in `tests/e2e`; they are never used by production code. Browser artifacts are available in `test-results/` and `playwright-report/` after running the suite.

## Launch dependencies and contract limitations

Production API URLs, canonical domain, and the shared webhook secret remain intentionally unconfigured. `npm run check:config` currently fails for those missing values, as expected. Configure them using `.env.example` and the README's Netlify instructions, then verify deployed connectivity, CORS, webhook delivery, approved image hosts, and HTTPS. The site has not been deployed or tested against a live production backend.

Add approved public contact details and review operator/legal information before public launch. Contact methods are omitted until configured.

Article summaries have no reading-time field, so cards omit reading time instead of fetching every body. Sponsored-link detection is based on actual HTML relationships; the backend provides no explicit affiliate flag. Backend view counts reflect API requests rather than unique visitors. Missed webhooks can briefly leave listing summaries stale, while new detail requests still enforce backend visibility. The backend has no durable webhook retry queue. Sitemap partitioning is needed before exceeding the documented 50,000-URL limit.

See `README.md` for setup, environment variables, deployment steps, caching behavior, API integration details, and repeatable checks.

## Editorial redesign

Implemented a variable Newsreader/Geist design system, original decorative SVG artwork, four article-card layouts, story-led home sections, accessible Topics dropdown, dark footer, grid/list browsing with active chips, highlighted search matches, searchable nested categories, distinctive category/tag layouts, article code copying and correction links, bespoke About and Contact pages, and anchored legal documents. Empty, error, loading and narrow mobile layouts share the same visual language.

Contact is a separately configured Netlify Forms integration. The static form definition is in `public/__forms.html`; the form remains disabled unless `CONTACT_FORM_ENABLED=true`. Registration, notification setup, and a real delivered submission require Netlify production access and remain deployment dependencies. Automated contact tests use intercepted responses and never deliver external messages. See README activation steps.
