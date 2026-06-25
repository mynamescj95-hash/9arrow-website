# 9 Arrow Land Service — Website

A rugged, fast, static marketing site for **9 Arrow Land Service** (Spring Branch, TX). Built on the 9 Arrow brand guide: deep forest-green canvas, brass-gold accent, heavy slab-serif type, and real job photography. No build step — pure HTML/CSS/JS, ready for GitHub Pages.

## Pages
- `index.html` — Home (hero, services, before/after, stats, who we serve, reviews, CTA)
- `services.html` — Six service lines in detail + FAQs
- `about.html` — Story, the nine core values, gallery
- `contact.html` — Contact info + estimate request form

## Preview locally
Open `index.html` in a browser, or run a local server:
```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Put it on GitHub + GitHub Pages
From this folder (Git is already initialized with a first commit):
```bash
# 1. Create an EMPTY repo on github.com (no README), e.g. "9arrow-website".
# 2. Point this repo at it and push:
git remote add origin https://github.com/<your-username>/9arrow-website.git
git branch -M main
git push -u origin main
```
Then enable hosting:
1. On GitHub: **Settings → Pages**.
2. **Source:** Deploy from a branch. **Branch:** `main`, folder `/ (root)`. Save.
3. Your site goes live at `https://<your-username>.github.io/9arrow-website/` in ~1 minute.

## Use the real domain (www.9arrow.com)
GitHub Pages supports custom domains for free (with HTTPS):
1. In **Settings → Pages → Custom domain**, enter `www.9arrow.com` and save (this creates a `CNAME` file — `CNAME.example` shows the contents).
2. At your DNS provider, add a **CNAME** record: `www` → `<your-username>.github.io`.
3. For the apex `9arrow.com`, add the GitHub Pages A/AAAA records (see GitHub's docs) or a redirect to `www`.
4. Check **Enforce HTTPS** once the certificate is issued.

> Note: 9arrow.com currently points to HubSpot. Only change DNS when you're ready to switch hosting — until then, use the free `github.io` URL to review.

## Before launch — two quick swaps
1. **Logo:** `assets/img/logo-mark.svg` and `logo-lockup.svg` are clean recreations. Drop in the master 9 Arrow logo files (same names) when ready.
2. **Estimate form:** the form in `contact.html` posts to a placeholder. Create a free form endpoint at [formspree.io](https://formspree.io), then replace `YOUR_FORM_ID` in the form `action`. (Or wire it to HubSpot.)

## Photos
Images in `assets/img/` are pulled from the 9 Arrow Google Drive job library and web-optimized. Swap any file (keep the same name) to update a photo. Add real same-angle before/after pairs to replace `ba-before.jpg` / `ba-after.jpg`.

---
© 2026 9 Arrow Land Service. Site managed by TruAim Marketing.

---

## v2 update — full service pages, Texas SEO, tougher look, video hero

**Pages now include six dedicated service pages** (each with full copy + Texas SEO + Service schema):
`forestry-mulching.html`, `survey-line-clearing.html`, `right-of-way-clearing.html`, `roads-access.html`, `grounds-maintenance.html`, `site-work-utility.html`. `services.html` is now a hub linking to all six.

**Texas SEO** on every page: localized titles/descriptions/keywords, a "Proudly Serving Central Texas" area band (Spring Branch, Bulverde, New Braunfels, Canyon Lake, Boerne, San Antonio, San Marcos, Hill Country), `geo.*` meta, and JSON-LD (`LocalBusiness`, `Service`, `FAQPage`).

**Tougher look:** real pro-shoot photography throughout, film grain overlay, a black-and-white "We sharpen our own steel" craftsmanship band, heavier hero scrims.

**Logo:** the header now uses a faithful SVG of the real circular "9-into-arrow" lockup (`assets/img/logo-lockup.svg`, bone for the dark theme). Your master PNGs live in Drive → "Approved by John / Logos for 9 Arrow" — drop one in if you prefer the raster.

### Two drop-in slots
1. **Hero video** — the homepage hero is wired for video. Add a web-compressed MP4 at `assets/img/hero.mp4` (≈1080p, H.264, 6–10 MB, muted loop) and it plays automatically; until then it shows `hero.jpg`. Your `IMG_1279.MOV` is 93 MB — compress first, e.g.:
   `ffmpeg -i IMG_1279.MOV -t 12 -an -vf "scale=1920:-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart assets/img/hero.mp4`
2. **Owners photo** — `assets/img/owners.jpg` on the About page is a placeholder. Replace it with the John & Camille portrait (keep the filename).

## Lead-gen download gate (PDF guides)

The three guide PDFs in `assets/downloads/` are gated behind a Name + Email + Phone form
(modal pops up when a visitor clicks any "Get the free guide" button or guide cover).

To capture those leads in **HubSpot**:
1. In HubSpot go to **Marketing > Forms** and create a form with fields: First name, Last name, Email, Phone.
2. Copy your **Portal ID** and the form's **Form GUID**.
3. Open `assets/js/main.js`, find the `CONFIG` block in the download-gate section, and set:
   `HS_PORTAL_ID='1234567'` and `HS_FORM_GUID='xxxxxxxx-xxxx-...'`.

Until those IDs are set, the form still gates the download and delivers the PDF — it just
doesn't send the lead anywhere yet. (Prefer Formspree/Netlify Forms instead? Swap the
`fetch()` URL in that same block.)
