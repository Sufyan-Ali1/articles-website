# Ask & Explore: content audit and keyword plan

Research and implementation date: October 25, 2026. Audience: global English-speaking readers, confirmed by the owner. Existing routes, components, forms, filters, API contracts, and publishing workflows are retained.

## Research scope and limits

This audit combines a source-code review, public search-result research, and current first-party search guidance. The public article, category, and tag endpoints each returned zero records during the audit. Published article bodies, authored taxonomy descriptions, and existing article-specific SEO fields therefore could not be individually rewritten. Those records remain controlled by the publishing API; no placeholder articles or invented category pages were added.

**No keyword in this report is represented as verified high-volume or low-competition.** Search results establish that a topic has published coverage, not its monthly demand or the difficulty of earning organic rankings. No Search Console, Keyword Planner, Ahrefs, or Semrush dataset is connected. The accompanying CSV contains 48 candidate queries with empty volume/difficulty fields and an explicit unverified status. Its priorities reflect editorial fit, not measured ranking difficulty.

Google defines Keyword Planner competition as competition among advertisers, not organic SEO difficulty. Its average monthly searches depend on the selected geography, network, and period. Google Trends is normalized relative interest, not absolute search volume. These distinctions matter especially for a global audience. Sources: [Keyword Planner metrics](https://support.google.com/google-ads/answer/3022575?hl=en), [Google Trends data](https://support.google.com/trends/answer/4365533?hl=en).

## Positioning and voice

Ask & Explore helps readers understand a choice, learn a task, or solve an everyday problem. The strongest starting clusters are technology, automotive, product buying guides, practical how-to content, and home/work routines. Travel should grow only alongside genuinely published coverage.

The rewritten copy uses concrete reader tasks, familiar language, short paragraphs, and clear next steps. It avoids fabricated expertise, testing claims, subscriber counts, guaranteed results, artificial urgency, and promises of publication or personal replies. About-page principles describe the intended editorial approach; they do not certify that every historic article followed a documented review process. Newsletter copy explicitly reflects the inactive signup service.

## Page intent and keyword ownership

| Existing page              | Reader intent                                          | Primary phrase                                  | Supporting language / conversion                                                        |
| -------------------------- | ------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/`                        | Understand the publication and choose a starting point | practical guides                                | clear answers, product comparisons, technology, cars, everyday choices; browse articles |
| `/articles`                | Browse the complete library                            | articles and how-to guides                      | product comparisons, topic filters, article types; open a relevant read                 |
| `/categories`              | Find the right subject                                 | browse topics                                   | technology guides, car buying advice, everyday-life topics; open a category             |
| `/category/[slug]`         | Explore one subject                                    | actual category name + guides                   | topic-specific fallback copy; preserve the API description when provided                |
| `/tag/[slug]`              | Discover related reads                                 | actual tag name + articles                      | clearly identify the tag; preserve the API description                                  |
| `/articles/[slug]`         | Answer the article’s specific question                 | chosen by the author for that article           | honor authored title, excerpt, and SEO fields; do not impose unrelated generic keywords |
| `/about`                   | Assess purpose and editorial approach                  | about Ask & Explore                             | clear answers, editorial principles, practical coverage; explore the library            |
| `/contact`                 | Send a question, correction, or proposal               | contact Ask & Explore                           | article feedback, privacy enquiry, collaboration; send a contextual message             |
| `/request-article`         | Suggest useful future coverage                         | request an article                              | suggest a topic, product comparison, how-to guide; submit a focused question            |
| `/search`                  | Locate an existing article                             | navigational search, not an acquisition keyword | accurately states title-only search; remains `noindex`                                  |
| `/privacy`                 | Understand information practices                       | privacy policy                                  | browsing, local bookmarks, topic suggestions, Netlify contact messages                  |
| `/terms`                   | Understand website/submission conditions               | terms and conditions                            | responsible use, content rights, external links; no commercial keyword stuffing         |
| `/disclaimer`              | Understand evidence and commercial relationships       | editorial and affiliate disclosures             | review methods, sponsored links, changing information                                   |
| 404 / error / empty states | Recover from a missing page or unavailable result      | none                                            | direct explanation and a useful recovery link                                           |

Each page has a distinct title and description in `src/lib/content/site-copy.ts`. The layout adds the brand once through its title template. Heading hierarchy, canonical URLs, indexability rules, sitemap behavior, internal links, and existing navigation are preserved. Category/tag fallback descriptions are shared between the visible hero and metadata so they do not contradict each other. Meta-keyword tags and artificial word-count targets were not added.

## Observed topic opportunities

1. **Laptop selection by task.** Research surfaced manufacturer guidance for choosing a PC and laptop components, as well as substantial coverage of generic laptop buying and work-from-home terms. Narrow a guide around the reader’s actual software, calls, desk setup, and portability needs. A broad “best laptops” roundup requires strong comparative evidence and current product knowledge; it is not assumed to be an easy keyword. First-party research starts: [Microsoft laptop buying guide](https://www.microsoft.com/en-us/windows/laptop-buying-guide), [Lenovo laptop buying guide](https://www.lenovo.com/gb/en/laptop-buying-guide/).
2. **Device tasks and backup decisions.** Apple’s own material serves the broad backup query. A useful independent article must add a focused decision aid, prerequisites, troubleshooting context, or a clearly differentiated comparison; duplicating the support instructions provides little additional value. Research: [Apple backup methods](https://support.apple.com/en-us/118426), [Apple iCloud backup](https://support.apple.com/en-us/108366).
3. **Hybrid and electric ownership.** Separate hybrid, plug-in hybrid, and fully electric questions. Build focused explainers around charging access, driving patterns, running-cost inputs, and ownership tradeoffs. Manufacturer and government coverage indicates established competition; a narrow question remains a hypothesis until metrics are checked. Research: [Alternative Fuels Data Center vehicle overview](https://afdc.energy.gov/vehicles/electric), [plug-in hybrids](https://afdc.energy.gov/vehicles/electric-basics-phev), [Volkswagen comparison](https://www.volkswagen.co.uk/en/electric-and-hybrid/benefits-and-costs/discover-electric/electric-and-hybrid-differences-explained.html).
4. **Buying guides for a specific use case.** Air-fryer size and counter space produce more specific questions than “best air fryer.” A guide should explain the variables and demonstrate actual dimensions and meal examples rather than declare one universal capacity. First-party research: [Haier’s air-fryer sizing discussion](https://www.haierindia.com/blog/air-fryer/choosing-the-right-air-fryer-size-for-you/). This source is a manufacturer’s perspective, not independent testing.
5. **Home/work routines.** Public results showed dedicated publishers covering small-space and budget office setups. The useful angle is a concrete constraint—room dimensions, equipment already owned, storage, or working pattern—not a generic list copied from competing pages. Specific questions in the CSV are editorial expansions from that seed, not independently measured keyword opportunities.

The observed results also included multiple retailers and publishers for Lenovo-versus-HP searches. Brand-only comparisons need particular care: compare matched configurations and explain meaningful model differences. Do not assume every model from one brand shares the same strengths or weaknesses. No keyword difficulty is inferred merely from the number of search results.

## Three article briefs to validate next

### How to Choose a Laptop for Working From Home

- Primary candidate: `how to choose a laptop for working from home`.
- Intent: compare requirements before purchasing.
- Useful opening: identify required work software, calls, displays, portability, and budget before comparing specifications.
- Outline: software/OS compatibility; busiest workload; memory and storage; display/camera/ports; desk and monitor setup; total cost; a comparison checklist.
- Distinctive value: a requirements worksheet and matched configuration comparison. Add observed testing only if it was performed and documented.
- Sources: current manufacturer requirements and application documentation. Date specifications and prices; identify currency and market.

### Hybrid, Plug-In Hybrid, or Electric: What Fits Your Driving?

- Primary candidate: `hybrid vs electric cars`; focused secondary candidate: `hybrid vs electric for short journeys`.
- Intent: understand ownership suitability, not obtain a universal “winner.”
- Outline: distinguish the three drivetrains; describe charging access; compare driving patterns; show transparent cost inputs; explain maintenance and model-specific limits.
- Distinctive value: a scenario worksheet with clearly labeled assumptions. Never present one country’s energy prices, taxes, or incentives as globally applicable.
- Sources: manufacturer documentation, the AFDC overview, and relevant local energy/transport sources. Recheck time-sensitive incentives before publication.

### What Size Air Fryer Do You Need for Two People?

- Primary candidate: `what size air fryer for two people`.
- Intent: choose an appropriate capacity and footprint.
- Outline: meal size and cooking style; usable basket dimensions; cooking in batches; counter space and manufacturer clearance; cleaning; buying checklist.
- Distinctive value: actual basket measurements and photographed meal examples, if available. Do not imply hands-on testing without evidence.
- Sources: manufacturer specifications and instructions for the models compared; disclose affiliate relationships when applicable.

These are briefs, not published articles, and their proposed titles must not imply a completed test or a current-year product review that has not happened.

## Validation and measurement

Before approving a target as high-volume or low-competition, export date-stamped keyword metrics with language, country, device, period, and data-provider fields. Use Search Console queries/impressions for existing pages; use keyword-demand estimates for new ideas; review organic competitors separately from advertising competition. Keep regional datasets separate instead of adding incompatible global estimates.

Map each accepted query to one main page. Review intent, the evidence available, and whether an existing article should be improved before creating another. Track organic impressions, clicks, click-through rate, and reader actions after publication. Compare matching time periods and annotate publishing changes. Rankings, traffic, and rich results are not guaranteed.

Once API content is available, complete an article-by-article audit of title, excerpt, introduction, headings, sources, image alt text, internal links, commercial disclosure, and conclusion. Draft edits in the publishing workflow; preserve existing URLs unless a deliberate redirect plan is approved. Do not overwrite authored metadata or taxonomy descriptions through a generic frontend template.

## Search guidance used

- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: influencing title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: controlling snippets](https://developers.google.com/search/docs/appearance/snippet)

The implementation follows the principle of useful, accurate page content. Keywords support that purpose; they do not replace evidence or create an editorial reason to publish unrelated topics.
