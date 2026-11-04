# Ask & Explore

A Next.js 16 / React 19 website connected to a FastAPI publishing backend. Use Node 22.12 or newer. Hosting is set up for Netlify.

## Start locally

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set the backend details in `.env.local`, then open http://localhost:3000. A missing backend shows an error message, not demo articles. Builds can run without a live backend.

The app uses TypeScript, Tailwind, Radix, React Hook Form and Zod. Fonts are stored locally. Builds use webpack. Cache Components and partial prefetching are enabled.

## Pages

| Page                                          | What it does                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `/`                                           | Shows featured, recent and popular articles, topic links and signup forms.             |
| `/articles`                                   | Lists articles with title search, filters, sorting, grid/list views and pages.         |
| `/articles/[slug]`                            | Shows the article, author, dates, image, contents, related articles and sharing tools. |
| `/categories`, `/category/[slug]`             | Show topics and their articles. Backend descriptions are used when present.            |
| `/tag/[slug]`, `/tags/[slug]`                 | Redirect to `/articles?tag=[slug]`. There are no separate tag pages.                   |
| `/search`                                     | Searches article titles. Search pages are excluded from indexing.                      |
| `/request-article`, `/contact`                | Accept topic requests and messages.                                                    |
| `/about`, `/privacy`, `/terms`, `/disclaimer` | Explain the publication, policies and disclosures.                                     |

The article sidebars have equal widths and scroll separately on desktop. Below 1200px, related articles move below the article. Below 900px, contents use an expandable panel. Bookmarks stay in the reader's browser.

Related articles must share an active tag, or share meaningful title words within an active category. Duplicates and the current article are removed. The panel can show fewer than five results.

## Settings

Set these on the website server. Keep secrets out of `NEXT_PUBLIC_*`, browser code and Git.

| Setting                      | Value needed                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `API_BASE_URL`               | Backend base URL, without `/api/v1`. Use HTTPS in production.                              |
| `API_USER`, `API_KEY`        | Match the backend credentials. The key needs at least 32 characters.                       |
| `SITE_URL`                   | `https://askandexplore.com` in production.                                                 |
| `NEXTJS_REVALIDATION_SECRET` | Separate secret of at least 32 characters; match the backend.                              |
| `ANALYTICS_INGEST_SECRET`    | Match the backend traffic secret, at least 32 characters. Leave empty to disable tracking. |
| `IMAGE_REMOTE_HOSTS`         | Optional extra exact HTTPS image hostnames, separated by commas.                           |
| `CONTACT_EMAIL`              | Optional real public email address. Leave empty to hide it.                                |

The built-in image rule allows the publication's Cloudinary account at `res.cloudinary.com/k4ncios2/image/upload/`. Other optimized image hosts must be approved explicitly.

## Backend and forms

| Data                      | Backend route under `/api/v1`                     |
| ------------------------- | ------------------------------------------------- |
| Articles and title search | `GET /articles`, `GET /articles/{slug}`           |
| Categories                | `GET /categories`, `GET /categories/{slug}`       |
| Tags                      | `GET /tags`, `GET /tags/{slug}`                   |
| Article types             | `GET /article-types`, `GET /article-types/{slug}` |
| Topic requests            | `POST /article-requests`                          |
| Contact messages          | `POST /contact-messages`                          |
| Subscriptions             | `POST /subscriptions`                             |

Successful responses use `{data}` or `{data, meta}`. Errors use `{error}`. The server adds `X-API-User` and `X-API-Key`; the browser never receives these credentials.

Filters are `search`, `category`, `tag`, `article_type`, `sort` and `page`. There are 12 articles per page. Sort values are `-published_at`, `published_at`, `-view_count` and `title`. Category filters match direct membership. Unknown fields are ignored.

Forms send requests through the website's `/api/v1/...` gateway. It allows only the three submission routes, checks the request origin, limits body size and removes browser credentials. It forwards trusted visitor-IP headers from Netlify or Vercel only. Other hosts share backend connection-IP limits until configured.

A form shows success only after the expected HTTP 202 response. Errors keep the entered text. HTTP 429 starts a retry countdown. Contact and topic forms also have a honeypot and a browser maths check. The maths check can be bypassed; backend validation and rate limits are still needed.

Forms use FastAPI, not Netlify Forms. There is no `CONTACT_FORM_ENABLED` setting. Signup capture and email delivery are separate: a saved email does not prove that an email was sent. Real production saving and delivery need an approved end-to-end check.

## SEO, images and fresh content

- Article content, metadata, image descriptions and article schema come from the backend. Article schema is safely escaped; it is not rebuilt by the frontend. Breadcrumb markup is also present.
- The homepage has WebSite markup. Metadata includes canonical URLs, social cards and real article dates.
- Search and filter pages use `noindex`. Robots allows search crawling so Google can read that rule. API routes stay blocked.
- The sitemap contains standard pages, published articles and nonempty active categories. It excludes tags, empty categories, searches, filters and private routes.
- Invalid archive pages and confirmed missing articles/categories receive 404 checks before streaming. Temporary backend errors must not be treated as deleted content.
- Approved images use responsive WebP sizes. Hero space is reserved; body images load lazily. Editorial image frames show the complete 16:9 image. Body images keep their own shape.
- Article detail is read fresh for each server request. Lists, categories and sitemap data refresh after 60 seconds and expire after 120 seconds. Search is uncached.
- Publish/update/unpublish webhooks clear affected caches and current/old article paths. Already open browser pages do not automatically remove withdrawn content. The backend has no durable webhook retry queue.

Configure the backend webhook with `NEXTJS_REVALIDATION_ENABLED=true`, `NEXTJS_REVALIDATION_URL=https://askandexplore.com/api/revalidate` and the matching secret. It sends a bearer-authenticated JSON event with `event`, `entity_id`, optional `article_id`, `slugs` and `tags`.

The webhook checks identity, events and tags, and limits its body to 16 KiB. Long slug tags use `article-slug-sha256:<digest>`. Cache tags expire immediately. Upstream JSON is limited to 8 MiB per response; collection reads stop at 1,000 pages, 100,000 records or 32 MiB total. The sitemap must be split before it exceeds 50,000 URLs. Failures do not produce a partial successful sitemap.

Reading time uses full article text at 220 words per minute. Cards omit it because summaries lack the needed data. Sponsored notices use actual `rel="sponsored"` links. Backend view counts are not unique visitors.

To rebuild brand icons, run `node scripts/generate-brand-assets.mjs`. An optional source image path also rebuilds the article fallback image.

## Deploy on Netlify

1. Use the repository's `netlify.toml`: Node 22, `npm run build`, `.next` output and `@netlify/plugin-nextjs`.
2. Add the production settings above. Rebuild after changing build settings, image hosts, public contact details or canonical settings.
3. Run `npm run check:config`. Apply any required backend migrations and configure trusted proxies and exact allowed browser origins where needed.
4. Deploy. Check articles, forms, images, metadata, sitemap, robots and publish/unpublish webhooks.
5. Check public contact and policy text against the real business practices. Preview deployments must stay `noindex`.

**Netlify default 404 after a successful build:** check the deploy log for the Next.js adapter and server functions. Remove `NETLIFY_NEXT_PLUGIN_SKIP` if set, enable the runtime, clear the build cache and redeploy. Uploading `.next` without the adapter is not enough.

## Checks

```sh
npm run check:config
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests use a separate test API on port 4100 and a production build on port 3100. Keep both ports free. Fixtures never become production content. Reports are in `playwright-report/`; failed screenshots and traces are in `test-results/`.

Local tests do not prove production delivery, Google indexing or real-user speed. See [implementation](IMPLEMENTATION.md), [SEO issues](SEO_AUDIT_REPORT.md), [owner actions](SEO_OWNER_ACTIONS.md), [security](docs/security-audit.md) and [content plan](docs/seo/content-strategy.md).
