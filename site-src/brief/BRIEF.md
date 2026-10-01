# 9 Arrow site rebuild: content brief for page writers

You are writing page content (not HTML) for the new 9arrow.com, a static site for 9 Arrow Land Service.
Output is structured JSON (pages) or Markdown with front matter (blog), written to disk. A separate build
script renders it, so never write HTML tags except the inline link syntax described below.

## Read first
- Voice: /root/.claude/skills/synced/52e1fb87-015d-48d0-ab95-1b97b2cf31f0_90477831-4693-4e63-b453-a20fdcfa4a93/9arrow-brand-guide/SKILL.md (Voice & Tone section) and its references/voice-and-content.md
- Keywords + local SEO rules: /root/.claude/skills/synced/52e1fb87-015d-48d0-ab95-1b97b2cf31f0_90477831-4693-4e63-b453-a20fdcfa4a93/9arrow-seo/SKILL.md and references/keyword-map.md, references/local-seo.md
- Facts you may use: /home/claude/9arrow-site/brief/FACTS.md. THIS IS THE ONLY SOURCE OF COMPANY CLAIMS.
- Photo keys: /home/claude/9arrow-site/brief/PHOTOS.md
- Old repo pages (for structure/ideas only; they contain inaccurate claims, do not copy facts from them unless they are also in FACTS.md): /home/claude/mynamescj95-hash/9arrow-website/*.html

## Hard rules
1. Never invent company facts: no prices, no acreage totals, no years in business, no certifications, no insurance claims,
   no guarantees, no named jobs or clients beyond FACTS.md, no equipment models beyond FACTS.md, no response-time promises.
   General, widely documented Texas land facts (county a town is in, rivers, highways, Ashe juniper biology, oak wilt
   guidance from Texas A&M Forest Service) are fine. For city pages you MAY use WebSearch to confirm local geography; keep
   only facts you are confident are true and stable.
2. Voice: plain-spoken Central Texas operator, "we" talking to "you / your land". Short declarative sentences. Specific over
   adjectives. Not hypey, not corporate. Faith is light-touch and only on About. "It does not get better." may appear once
   per page at most, and not on every page.
3. Style: no em dashes at all. No "not X, but Y" constructions. No colon-reveal sentences. No filler like "worth noting",
   "in today's world", "look no further", "nestled", "boasts", "unlock", "elevate", "seamless". Sentence case headings.
4. AEO: every page opens with an answer block: one real question the page answers, and a 40 to 60 word self-contained answer
   whose first sentence mirrors the question and names the entity ("Forestry mulching is ..."). Each section must stand
   alone if read by itself: name things explicitly, no "this"/"it" pointing at earlier sections.
   FAQ answers are 40 to 60 words, self-contained, first sentence answers directly.
5. SEO: primary keyword in title_tag (near the front), h1 (worded differently from title_tag), lede, at least one h2, and
   meta_description. title_tag <= 60 chars. meta_description <= 155 chars. One topic per page; do not target another
   page's primary keyword (see the page list below).
6. Internal links: inside any string you may link with [anchor text](slug) where slug is a page slug from the page list
   (no leading slash, no .html). Use descriptive anchors containing the destination's keyword. 2 to 5 inline links per page.
7. Length (total words across lede, answer, sections, faqs): service pages 750 to 1100, audience pages 550 to 800,
   city pages 600 to 900 with genuinely local detail (terrain, county, rivers, roads, typical properties, nearby towns),
   hub pages 350 to 600.
8. Validate your JSON with python3 (json.load) after writing each file. Count title_tag and meta_description lengths.

## Page JSON schema (write to /home/claude/9arrow-site/content/pages/<slug>.json)
{
  "slug": "forestry-mulching-and-land-clearing",
  "type": "service | audience | city | hub | company",
  "nav_label": "Forestry mulching",                      // short name used in menus and breadcrumbs
  "title_tag": "...",
  "meta_description": "...",
  "h1": "...",
  "primary_keyword": "...",
  "secondary_keywords": ["..."],
  "lede": "1 to 2 sentences under the H1, contains the primary keyword",
  "answer": {"q": "What is forestry mulching?", "a": "40 to 60 words"},
  "highlights": ["4 short proof points, each 3 to 9 words, factual"],
  "sections": [
    {"h2": "...", "paras": ["..."], "bullets": ["optional"], "photo": "optional photo key"}
  ],                                                      // 3 to 5 sections
  "process": [{"step": "Short name", "detail": "<= 22 words"}],   // optional; ONLY if the content is a real sequence
  "faqs": [{"q": "...", "a": "40 to 60 words"}],          // 3 to 5
  "related_services": ["slug"],                           // 2 to 4
  "related_areas": ["slug"],                              // 2 to 6 city slugs
  "related_posts": ["blog slug"],                         // 0 to 3
  "hero_photo": "photo key",
  "hero_alt": "descriptive alt text with keyword where natural",
  "cta_service": "one of: Forestry mulching / land clearing | Rock crushing & roads | Survey line clearing | Right-of-way clearing | Site work & utilities | Grounds maintenance | Not sure yet",
  "city": {"name": "Bulverde", "county": "Comal County", "lat": 29.74, "lng": -98.45, "nearby": ["city slugs"]}   // city pages only
}

## Page list (slug -> primary keyword). Do not target someone else's keyword.
Services:
- forestry-mulching-and-land-clearing -> forestry mulching central texas
- land-clearing -> land clearing central texas (broad: lot clearing, grubbing, full clearing, the hub for all clearing)
- cedar-removal -> cedar removal texas (Ashe juniper)
- brush-removal -> brush clearing texas (underbrush, overgrown lots, brush piles)
- ranch-pasture-clearing -> ranch land clearing texas (pasture reclamation)
- site-prep -> land clearing for building site (home sites, building pad clearing)
- precision-line-survey-clearing -> survey line clearing texas
- right-of-way-clearing -> right of way clearing texas
- roads-and-access-preparation -> access road building texas (ranch roads, driveways, culverts, drainage)
- rock-crushing -> rock crushing central texas (on-site rock crushing into road base)  [NEW page]
- site-work-light-utility-installation -> site work and utility installation (dirt work, pads, waterline trenching)
- grounds-maintenance -> grounds maintenance central texas (mowing, shredding, ROW maintenance)
- services -> hub listing all services
Audiences:
- land-developers, commercial-real-estate, ranchers, energy-utilities, solar
Company:
- about-us, our-work, contact, get-an-estimate, faq, electrical-right-of-way-row-safety-manual-texas
Cities (service-area pages):
- land-clearing-spring-branch-tx, land-clearing-bulverde-tx, land-clearing-canyon-lake-tx, land-clearing-new-braunfels-tx,
  land-clearing-boerne-tx, land-clearing-blanco-tx, land-clearing-wimberley-tx, land-clearing-kerrville-tx,
  land-clearing-san-antonio-tx, land-clearing-comal-county
- forestry-mulching-spring-branch-tx, forestry-mulching-bulverde-tx, forestry-mulching-canyon-lake-tx,
  forestry-mulching-new-braunfels-tx, forestry-mulching-san-antonio-tx, forestry-mulching-texas-hill-country
- cedar-removal-spring-branch-tx, cedar-removal-boerne-tx
- service-areas -> hub of all areas
Blog posts (existing slugs, keep them):
- blog-forestry-mulching-cost-per-acre, blog-land-clearing-cost-texas, blog-forestry-mulching-guide,
  blog-mulching-vs-traditional-land-clearing, blog-best-time-to-clear-land-texas, blog-clear-cedar-without-regrowth,
  blog-cedar-mesquite-ranch, blog-does-clearing-increase-property-value

City page rule: two pages for the same town (land clearing vs forestry mulching vs cedar removal) must have different
angles, different sections and different FAQs. Never spin one page into another by swapping the town name.
