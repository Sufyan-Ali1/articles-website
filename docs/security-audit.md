# Security audit

Audit date: 25 October 2026. Fixes were applied locally at that time; production deployment was not verified. This shorter report keeps the original findings and limits. Package versions and test counts below are historical results, not fresh scans.

The review covered this Next.js frontend and the adjacent `Blogs_Backend` FastAPI service. Tests used local fixtures, without a production database, real uploads or live load tests. This was not a security certification or proof of an attack.

Later frontend work added a submission gateway, analytics routes and an SEO proxy. Forms now use FastAPI, not the old Netlify Forms setup.

## Findings and solutions

### SEC-01 — Old certificate bundle · Critical upstream advisory

**Issue:** The local backend environment had `certifi 2026.7.22`, although requirements already specified the corrected bundle. Production exposure and any interception were unverified.

**Solution:** Updated the local environment to `2026.10.19`. Check the installed production package too. [Advisory](https://github.com/certifi/python-certifi/security/advisories/GHSA-6q48-6c7w-9gw2).

### SEC-02 — Unsafe article HTML could pass through · Medium

**Issue:** The old blacklist allowed document elements and uncontrolled attributes/IDs. This required unsafe publishing data; no live exploit was shown. Backend sanitizing already reduced exposure.

**Solution:** Added `sanitize-html 2.18.1` with an explicit list of allowed tags, attributes and URL schemes, nesting limits and unique heading IDs. Scripts, active embeds, event handlers, forms and arbitrary styles/IDs are removed. Safe tables, code, images and sponsored links remain. Unit/browser attack tests passed.

### SEC-03 — API responses could use too much memory · Medium

**Issue:** Very large JSON or dishonest/repeated pagination from a broken upstream could cause excessive work.

**Solution:** Limit each response to 8 MiB, validate UTF-8 and field/array sizes, check page identity/totals, and stop collection reads at 1,000 pages, 100,000 records or 32 MiB total. Bad responses fail instead of becoming partial successful content. Regression tests passed.

### SEC-04 — OpenTelemetry parsing advisory · Medium

**Issue:** Backend `opentelemetry-api 1.45.0` had unbounded `tracestate` parsing. Exposure required tracing setup not directly enabled in the reviewed service.

**Solution:** Updated the adjacent backend pin and local environment to `1.45.1`. Historical scans/tests passed. Verify the deployed version. [Advisory](https://github.com/open-telemetry/opentelemetry-python/security/advisories/GHSA-xcq7-p3pf-p88h).

### SEC-05 — Old local package tools · Varying advisory severity

**Issue:** Local `pip 22.3` and `setuptools 65.5.0` had installation/download advisories requiring malicious package input. This was not a demonstrated remote website flaw.

**Solution:** Updated local tools to `pip 26.2.2` and `setuptools 84.1.0`. The Dockerfile already pinned patched pip. Verify the real production image separately. [Example advisory](https://github.com/pypa/setuptools/security/advisories/GHSA-xmj3-9gf7-h52w).

### SEC-06 — Credentialed taxonomy responses lacked no-store · Low

**Issue:** Some authenticated taxonomy reads lacked explicit cache protection. No public data leak was demonstrated; shared caches already restrict Authorization responses.

**Solution:** Updated adjacent backend middleware to replace cache rules with `no-store` whenever Authorization or Cookie is present, plus existing private routes/mutations. Five tests covered these cases and anonymous public caching.

## Other protection added

- Added CSP, production HSTS and browser restrictions; retained frame denial, MIME protection and a safe referrer policy.
- Restricted API/image URLs: reject embedded credentials, control characters, unsafe schemes and malformed hosts. API URLs require HTTPS except local loopback development.
- Disabled upstream/image redirects and private-IP/SVG optimization. Optimized remote images need explicit approved hosts; server secrets stay server-only.
- Updated Next.js `16.4.2 → 16.4.3` and React `19.3.0 → 19.3.1`. This does not mean the starting version had the referenced critical Next.js flaws.
- Required Node 22.12 or newer.

CSP allows inline startup scripts/styles for partial prerendering. It blocks inline event handlers and unapproved script hosts. It is not a strict nonce policy; changing that requires a rendering/cache review. Keep HTML sanitizing either way. External image services still receive normal image requests.

## Reviewed without a new confirmed flaw

React text escaping, script-safe JSON-LD, parameterized database queries, published-only article access, backend roles/sessions, upload checks, webhook authentication and bounded caching were reviewed. No general user-controlled server URL fetcher or frontend upload route was found.

Targeted scans found no confirmed exposed application secret. Full Git history, cloud settings, production artifacts and logs were not audited. No database-backed integration or real Cloudinary operation was completed. Browser maths checks are bypassable and do not replace server abuse controls.

## Results recorded on 25 October

| Check                                             | Historical result                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Frontend lint, types, format and production build | Passed.                                                                     |
| Unit tests                                        | 82 passed in 14 files.                                                      |
| Browser tests                                     | 128 passed, 6 intended skips; 12 further focused checks passed.             |
| npm audit / dependency tree                       | No known advisories; no invalid top-level dependencies.                     |
| Backend lint / types                              | Passed; 52 files checked by mypy.                                           |
| Backend tests                                     | 89 passed; 29 skipped because a disposable PostgreSQL database was missing. |
| Python requirement/installed-package scans        | No known advisories after local fixes.                                      |

Backend tests used Python 3.11; deployment targets Python 3.12+. A clean scan does not rule out unknown problems. Later SEO/form checks are recorded in [implementation](../IMPLEMENTATION.md).

## Remaining work

**Issue:** Local fixes do not patch running services.

**Solution:** Deploy both services, verify installed versions and repeat scans in the actual image. Use Node 22.12+ and supported Python 3.12+.

**Issue:** Production security settings and delivery remain unverified.

**Solution:** Run `npm run check:config`. Check HTTPS, exact API/image origins, secure cookies, exact credentialed CORS origins, trusted proxies, database certificate checks, response headers and webhooks. Verify actual form storage, retention, access and notifications; old Netlify Forms activation steps no longer apply.

**Issue:** Process-local rate limits reset on restart and multiply across workers.

**Solution:** Add an edge limit or shared atomic limiter when scaling. Keep payload limits and server-side validation.

**Issue:** Database, session, upload and webhook integration checks were incomplete.

**Solution:** Use a disposable PostgreSQL database ending in `_test`; run skipped tests and staging flows. Never point destructive fixtures at production.

**Issue:** Failures or growth can exceed current limits.

**Solution:** Monitor rejected/large responses, 429s, webhook failures and advisories. Split sitemap processing before size limits; do not hide failures with partial output.

**Issue:** Future scans might find an exposed credential. No leak was confirmed here.

**Solution:** If exposure is found, revoke/rotate that credential, update integrations and invalidate affected sessions. Keep secrets out of browser props, logs and Git.

References: [Next.js data security](https://nextjs.org/docs/app/guides/data-security), [CSP](https://nextjs.org/docs/app/guides/content-security-policy), [OWASP XSS guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [sanitize-html](https://github.com/apostrophecms/apostrophe/tree/main/packages/sanitize-html).
