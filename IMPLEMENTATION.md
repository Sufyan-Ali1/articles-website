# Implementation status

Updated 4 November 2026. “Fixed locally” means the code is changed here; production deployment still needs checking.

## Built

The website has article and category pages, search, filters, mobile navigation, contact and topic forms, newsletter signup, policies and error pages. Articles have safe HTML, contents links, reading progress, sharing and browser bookmarks. See [README](README.md) for setup.

## Fixed locally

**Issue:** Tag pages added many small pages to the sitemap.

**Solution:** Both tag URL formats redirect to the article filter. Tags are excluded from the sitemap.

**Issue:** Empty categories could be indexed.

**Solution:** Empty categories use `noindex` and are excluded from the sitemap.

**Issue:** Missing articles/categories and page numbers beyond the last page could return HTTP 200.

**Solution:** Early checks return 404 for confirmed missing content and invalid archive pages.

**Issue:** Large article images were served at their original size.

**Solution:** Approved publication images use responsive Next.js image sizes and WebP.

**Issue:** Related articles could be unrelated recent posts.

**Solution:** Results need shared active tags, or matching topic words within a shared active category. Fewer than five results are allowed.

**Issue:** Robots blocked search pages from showing Google their `noindex` rule.

**Solution:** Search crawling is allowed; search pages still use `noindex`.

**Issue:** The homepage had no WebSite schema.

**Solution:** Added the real site name and URL. Article schema still comes from the backend, as requested.

**Issue:** The article's right sidebar stopped being sticky and had a different width.

**Solution:** Both sidebars share a width; the right panel stays sticky and scrolls inside on desktop. Its Subscribe arrow was removed.

**Issue:** Signup copy was confusing and buttons looked disabled.

**Solution:** Signup now says “Subscribe for new articles and practical guides.” Enabled buttons have full opacity and visible hover/focus colors, including the homepage and footer.

## Checks already recorded

Earlier checks passed 114 unit tests, TypeScript and lint. Form checks passed 34 desktop/mobile browser tests using a test backend. Public form routes returned the expected 422 response for empty data. No valid production messages or subscriptions were sent.

These are earlier results, not new test runs from this document edit. Full production saving, email delivery, indexing and speed remain unverified.

## Still needs work

- Correct placeholder article schema and author details in the backend. Do not replace backend schema in the frontend.
- Add missing hero image descriptions in the CMS and replace the dead FTC citation.
- Decide whether to publish Digital Safety articles or retire the empty category. All seven category descriptions were checked in the live output and are now distinct.
- Deploy and verify the local fixes. Check Google Search Console, real-user speed, account settings and full form delivery.
- Review optional article improvements with the owner. No article content changes are authorized by the current documentation task.

See [owner actions](SEO_OWNER_ACTIONS.md) for steps and [SEO issues](SEO_AUDIT_REPORT.md) for the original issue IDs.
