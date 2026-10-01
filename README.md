# 9 Arrow Land Service: 9arrow.com

Static site for 9 Arrow Land Service (Spring Branch, TX), hosted on Netlify. No build step on Netlify: the repo root is the site.

## What's here
- **57 pages** at the repo root. Every live HubSpot URL keeps its path (Netlify serves `about-us.html` at `/about-us`).
  - 12 service pages, including a new `/rock-crushing`
  - 5 "who we serve" pages, 18 city/service-area pages, `/service-areas` hub with a map
  - `/about-us`, `/our-work`, `/faq`, `/contact`, `/get-an-estimate`, ROW safety manual, legal pages
  - `/blog` plus 8 guides
- `assets/img`: every image as WebP at 480 / 960 / 1600 px (responsive `srcset`). Photos of John and Camille and the
  Our Work gallery are real, and so are the hero photos on the home, service and about pages. Some area pages
  use generated Hill Country landscapes (documentary-style, unbranded).
- `assets/og`: a share image for every page.
- Old files from the previous site (HubSpot-era docs, PDF guides, unused images) were removed; old PDF links redirect to
  the matching pages in `netlify.toml`.
- `netlify.toml`, `netlify/functions/submission-created.js`: Netlify Forms to Monday.com.
- `netlify/edge-functions/geo.js`: returns the visitor's approximate location (from their IP, via Netlify) at `/api/geo` so the
  home page's service-area card can show the closest town, or "we'll come to you" for the rest of Texas. Nothing is stored.
  To preview a match without being in Texas, add `?near=boerne` (any service-area town) or `?near=31.55,-97.15` to the home page URL.
- `sitemap.xml`, `robots.txt` (AI search crawlers allowed), `llms.txt`.
- `site-src/`: the content and generator that produced the pages.

## Estimate forms → Monday
Two Netlify forms, one flow:
- `estimate-start`: email only. It sits in the home page hero and in the pull-out panel that opens from every
  "Get an estimate" button. After the email, the visitor lands on `/get-an-estimate` with the email already filled in.
- `estimate-request`: the 4-step form on `/get-an-estimate` (work, land size, location and timing, contact).
After each verified submission, `submission-created.js` creates an item on the Monday leads board and posts every field
(including UTMs, gclid, landing page) as an update on that item. Email-only starts come in as "Email lead: ..." items,
so someone who stops after the email is still a lead. Nothing reaches Monday until the variables below are set.

Set these in Netlify > Site settings > Environment variables, then redeploy:

| Variable | Value |
|---|---|
| `MONDAY_API_TOKEN` | Monday personal API token |
| `MONDAY_BOARD_ID` | Board ID from the board URL |
| `MONDAY_GROUP_ID` | Optional: group for new leads |
| `MONDAY_START_GROUP_ID` | Optional: separate group for email-only starts |
| `MONDAY_COLUMNS` | Optional JSON map of form field to Monday column id and type (example in the function) |

Form fields: `services, acreage, property_location, timeline, client_type, name, phone, email, contact_preference, notes,
page_variant, landing_page, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid`.
`dataLayer` events for GA4 / Google Ads via GTM: `estimate_drawer_open`, `estimate_start` (email captured) and
`generate_lead` (full form sent).

## Editing content and adding blog posts
Content lives in `site-src/content`:
- `pages/<slug>.json`: one file per page (title tag, meta description, H1, answer block, sections, FAQs, links).
- `blog/<slug>.md`: Markdown with front matter (copy an existing post as the template).

Rebuild and copy the output to the repo root:
```bash
cd site-src
pip install markdown pyyaml beautifulsoup4
python3 src/build.py prod        # writes site-src/dist
cp -r dist/. ..                  # then commit and push; Netlify deploys
```
Images: `src/images.py` regenerates the WebP sizes from 2048px masters in `site-src/gen/` (masters are kept outside
the repo). `src/og.py` regenerates share images.

## Rules the content follows
- Every company fact comes from `site-src/brief/FACTS.md` (from 9arrow.com and the client's materials). No prices.
- Each page opens with a 40 to 60 word answer to its main question (for Google AI Overviews and AI answer engines).
- The one-paragraph company description in `llms.txt` and on the About page should be reused word for word on Google
  Business Profile, LinkedIn and directories.
