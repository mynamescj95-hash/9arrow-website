"""9 Arrow Land Service static site generator.

python3 src/build.py prod     -> dist/      (root-absolute clean URLs for Netlify: /rock-crushing)
python3 src/build.py preview  -> preview/   (relative .html links for the claude.ai preview)
Content lives in content/pages/*.json and content/blog/*.md. Images come from build-assets/ (see images.py).
"""
import glob, html, json, math, os, re, shutil, sys
import markdown, yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE = sys.argv[1] if len(sys.argv) > 1 else "prod"
OUT = os.path.join(ROOT, "dist" if MODE == "prod" else "preview")
SITE = "https://www.9arrow.com"
PHONE, TEL, EMAIL = "(210) 247-8410", "+12102478410", "john@9arrow.com"
TODAY = "2026-09-30"
FONTS = "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&family=Zilla+Slab:wght@500;600;700&display=swap"

PAGES = {}
for f in glob.glob(os.path.join(ROOT, "content/pages/*.json")):
    d = json.load(open(f)); PAGES[d["slug"]] = d
POSTS = {}
for f in sorted(glob.glob(os.path.join(ROOT, "content/blog/blog-*.md"))):
    raw = open(f).read()
    _, fm, body = raw.split("---", 2)
    meta = yaml.safe_load(fm); meta["body"] = body.strip(); POSTS[meta["slug"]] = meta
BLOG_INDEX = json.load(open(os.path.join(ROOT, "content/blog/_index.json")))
IMGS = json.load(open(os.path.join(ROOT, "build-assets/images.json")))
LOGO = json.load(open(os.path.join(ROOT, "src/paths.json")))
EXTRA = {"index", "blog", "privacy-policy", "terms-and-conditions", "thanks"}
ALL = set(PAGES) | set(POSTS) | EXTRA

esc = lambda s: html.escape(str(s), quote=True)

def url(slug, frag=""):
    if slug in ("", "index"):
        u = "/" if MODE == "prod" else "index.html"
    else:
        u = "/" + slug if MODE == "prod" else slug + ".html"
    return u + frag

LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
def rich(s):
    s = esc(s)
    def rep(m):
        text, t = m.group(1), m.group(2)
        k = t.strip("/").replace(".html", "")
        if k in ALL: return f'<a href="{url(k)}">{text}</a>'
        if t.startswith("http"): return f'<a href="{t}" rel="noopener">{text}</a>'
        return text
    return LINK.sub(rep, s)

# ---------------------------------------------------------------- images
PHOTO = {  # content photo keys -> image keys (generated scenes; real photos only where noted)
    "mulcher-dust": "g00", "mulcher-woods": "g03", "mulcher-sunrays": "g03", "mulcher-head": "g01", "mulcher-brush": "g04",
    "mulcher-blue": "g29", "mulcher-red-field": "g14", "red-mulcher-truck": "g14", "fleet": "g14", "crew-sharpening": "g22",
    "chainsaw": "g23", "powerline-corridor": "g08", "survey-cut": "g07", "cleared-lane": "g07", "cleared-trail": "g02",
    "cleared-hillside": "g06", "cleared-oaks": "g02", "cleared-wimberley": "g27", "cleared-pasture-trees": "g05",
    "winter-cleared": "g30", "mowed-pasture": "g12", "mowed-field": "g12", "rock-surface": "g10", "road-finished": "g09",
    "road-grade": "g09", "road-long": "g09", "road-trees": "g09", "trench": "g11", "site-pad": "g06", "demo-cleanup": "g23",
    "mulch-hand": "g13", "mulch-texture": "g13", "john-machine": "john", "owners": "owners",
    "trail-before": "trail-before", "trail-after": "trail-after",
}
FALLBACK = ["g02", "g13", "g05", "g19", "g09", "g22", "g01", "g30", "g12", "g27"]
HERO = {
    "index": "g00", "forestry-mulching-and-land-clearing": "g01", "land-clearing": "g02", "cedar-removal": "g30",
    "brush-removal": "g29", "ranch-pasture-clearing": "g14", "site-prep": "g06", "precision-line-survey-clearing": "g07",
    "right-of-way-clearing": "g08", "roads-and-access-preparation": "g09", "rock-crushing": "g10",
    "site-work-light-utility-installation": "g11", "grounds-maintenance": "g12", "services": "g00",
    "land-developers": "g15", "commercial-real-estate": "g21", "ranchers": "g05", "energy-utilities": "g17", "solar": "g16",
    "about-us": "owners", "our-work": "w-fleet", "contact": "g19", "get-an-estimate": "g06", "faq": "g13",
    "electrical-right-of-way-row-safety-manual-texas": "g08", "service-areas": "g28", "blog": "g02",
    "land-clearing-spring-branch-tx": "g18", "land-clearing-bulverde-tx": "g19", "land-clearing-canyon-lake-tx": "g20",
    "land-clearing-new-braunfels-tx": "g15", "land-clearing-boerne-tx": "g27", "land-clearing-blanco-tx": "g26",
    "land-clearing-wimberley-tx": "g24", "land-clearing-kerrville-tx": "g25", "land-clearing-san-antonio-tx": "g21",
    "land-clearing-comal-county": "g28", "forestry-mulching-spring-branch-tx": "g00", "forestry-mulching-bulverde-tx": "g02",
    "forestry-mulching-canyon-lake-tx": "g01", "forestry-mulching-new-braunfels-tx": "g14",
    "forestry-mulching-san-antonio-tx": "g04", "forestry-mulching-texas-hill-country": "g03",
    "cedar-removal-spring-branch-tx": "g03", "cedar-removal-boerne-tx": "g30",
}

def img(key, sizes="(max-width: 900px) 100vw, 50vw", eager=False, alt=None, cls=""):
    m = IMGS[key]; base = f"assets/img/{key}"
    srcset = ", ".join(f"{base}-{w}.webp {min(w, m['w'])}w" for w in m["sizes"])
    mid = m["sizes"][1] if len(m["sizes"]) > 1 else m["sizes"][0]
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    c = f' class="{cls}"' if cls else ""
    return (f'<img src="{base}-{mid}.webp" srcset="{srcset}" sizes="{sizes}" width="{m["w"]}" height="{m["h"]}" '
            f'alt="{esc(m["alt"] if alt is None else alt)}" {load} decoding="async"{c}>')

def img_src(key, w=960):
    m = IMGS[key]; ws = [s for s in m["sizes"] if s <= w] or m["sizes"][:1]
    return f"assets/img/{key}-{ws[-1]}.webp"

def hero_key(slug, page=None):
    if slug in HERO: return HERO[slug]
    if page and page.get("hero_photo") in PHOTO: return PHOTO[page["hero_photo"]]
    return "g02"

# ---------------------------------------------------------------- icons + emblem
_T = "translate(%.2f %.2f)" % (-LOGO["mark"]["cx"], -LOGO["mark"]["cy"])
G = '<path transform="%s" d="%s"/>' % (_T, LOGO["mark"]["glyph"])
RING_R = (LOGO["mark"]["rout"] + LOGO["mark"]["rin"]) / 2
RING_W = LOGO["mark"]["rout"] - LOGO["mark"]["rin"]
SPRITE = f'<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="g9" viewBox="-160 -160 320 320">{G}</symbol></svg>'
def glyph(fill="#fff", cls=""):
    return f'<svg class="{cls}" viewBox="-160 -160 320 320" aria-hidden="true" focusable="false"><use href="#g9" x="-160" y="-160" width="320" height="320" fill="{fill}"/></svg>'
def emblem(cls="mk", ring="#17320B", fill="#17320B"):
    return (f'<svg class="{cls}" viewBox="-160 -160 320 320" aria-hidden="true" focusable="false"><circle r="{RING_R:.1f}" fill="none" '
            f'stroke="{ring}" stroke-width="{RING_W:.1f}"/><use href="#g9" x="-160" y="-160" width="320" height="320" fill="{fill}"/></svg>')
I = {
    "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    "menu": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    "close": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    "chev": '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    "star": '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>',
}
STARS = '<span class="stars" aria-label="5 out of 5 stars">' + I["star"] * 5 + "</span>"
TILE_ICONS = {  # 28x28 line glyphs drawn for the estimate form
    "forestry": '<path d="M14 3l6 9h-3.5l4.5 7H7l4.5-7H8z"/><path d="M14 19v6M5 25h18"/>',
    "clearing": '<path d="M3 21h22M3 17c4-2 7-2 11 0s7 2 11 0"/><circle cx="20" cy="8" r="3"/>',
    "cedar": '<path d="M9 4l4 7h-2.5l3.5 6H4l3.5-6H5zM20 8l3.5 6H22l3 5h-10l3-5h-1.5z"/><path d="M9 17v6M20 19v4M3 25h22"/>',
    "rock": '<path d="M4 22l3-6 5-2 4 3 3-4 5 3 1 6z"/><path d="M10 9l3-3 3 2-1 3h-4z"/>',
    "roads": '<path d="M10 4L5 25M18 4l5 21M14 6v3M14 13v3M14 20v4"/>',
    "survey": '<circle cx="14" cy="14" r="8"/><path d="M14 2v6M14 20v6M2 14h6M20 14h6"/><circle cx="14" cy="14" r="1.5"/>',
    "row": '<path d="M14 3l-5 22M14 3l5 22M10 12h8M8 18h12M6 8h16"/>',
    "sitework": '<path d="M3 20h8l2-3h12M6 20v5M22 17V6M19 6h6"/><path d="M3 24h22"/>',
    "grounds": '<path d="M4 24c1-5 1-9 0-13M9 24c0-6 1-11 3-15M15 24c0-5-1-9-3-12M20 24c0-6 1-10 4-14"/><path d="M2 25h24"/>',
    "unsure": '<circle cx="14" cy="14" r="11"/><path d="M10.5 11a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3V17M14 20.5v.5"/>',
}
NEEDS = [("forestry", "Forestry mulching"), ("clearing", "Land clearing"), ("cedar", "Cedar & brush removal"),
         ("rock", "Rock crushing"), ("roads", "Roads & access"), ("survey", "Survey line clearing"),
         ("row", "Right-of-way clearing"), ("sitework", "Site work & utilities"), ("grounds", "Grounds maintenance"),
         ("unsure", "Not sure yet")]
NEED_FOR = {
    "forestry-mulching-and-land-clearing": "forestry", "land-clearing": "clearing", "cedar-removal": "cedar",
    "brush-removal": "cedar", "ranch-pasture-clearing": "clearing", "site-prep": "clearing", "rock-crushing": "rock",
    "roads-and-access-preparation": "roads", "precision-line-survey-clearing": "survey", "right-of-way-clearing": "row",
    "site-work-light-utility-installation": "sitework", "grounds-maintenance": "grounds", "energy-utilities": "row",
    "solar": "clearing", "land-developers": "clearing", "commercial-real-estate": "clearing", "ranchers": "clearing",
}
def need_for(slug):
    if slug in NEED_FOR: return NEED_FOR[slug]
    if slug.startswith("forestry-mulching"): return "forestry"
    if slug.startswith("cedar-removal"): return "cedar"
    if slug.startswith("land-clearing"): return "clearing"
    return ""
def est_url(slug=""):
    n = need_for(slug); return url("get-an-estimate", f"#need-{n}" if n else "")

# ---------------------------------------------------------------- navigation data
SERVICES = [
    ("forestry-mulching-and-land-clearing", "Forestry mulching", "Grind brush and trees in place"),
    ("land-clearing", "Land clearing", "Lots, acreage and full clearing"),
    ("cedar-removal", "Cedar removal", "Ashe juniper, oaks kept"),
    ("brush-removal", "Brush removal", "Underbrush and brush piles"),
    ("ranch-pasture-clearing", "Ranch & pasture clearing", "Take pasture back"),
    ("site-prep", "Site prep", "Home sites and building pads"),
    ("rock-crushing", "Rock crushing", "Your rock into road base"),
    ("roads-and-access-preparation", "Roads & access", "Ranch roads, drives, culverts"),
    ("precision-line-survey-clearing", "Survey line clearing", "GPS-guided, cut to your survey"),
    ("right-of-way-clearing", "Right-of-way clearing", "Power, pipeline, waterline"),
    ("site-work-light-utility-installation", "Site work & utilities", "Dirt work, pads, trenching"),
    ("grounds-maintenance", "Grounds maintenance", "Mowing, shredding, upkeep"),
]
SVC_BLURB = {s: b for s, _, b in SERVICES}
SVC_NAME = {s: n for s, n, _ in SERVICES}
AUDIENCES = [("land-developers", "Land developers"), ("commercial-real-estate", "Commercial real estate"),
             ("energy-utilities", "Energy & utilities"), ("solar", "Solar developers"), ("ranchers", "Ranchers")]
TOWNS = [  # slug suffix, name, lat, lng, label dx, dy, anchor
    ("spring-branch-tx", "Spring Branch", 29.887, -98.414, 12, -10, "start"),
    ("bulverde-tx", "Bulverde", 29.744, -98.453, -12, 4, "end"),
    ("canyon-lake-tx", "Canyon Lake", 29.875, -98.262, 12, 4, "start"),
    ("new-braunfels-tx", "New Braunfels", 29.703, -98.124, 12, 14, "start"),
    ("boerne-tx", "Boerne", 29.795, -98.732, -12, 4, "end"),
    ("blanco-tx", "Blanco", 30.098, -98.421, 12, 4, "start"),
    ("wimberley-tx", "Wimberley", 29.998, -98.099, 12, 4, "start"),
    ("kerrville-tx", "Kerrville", 30.047, -99.140, 12, 4, "start"),
    ("san-antonio-tx", "San Antonio", 29.424, -98.494, 12, 4, "start"),
]
AREA_PAGES = [("land-clearing-" + t[0], t[1]) for t in TOWNS] + [("land-clearing-comal-county", "Comal County")]

def area_label(slug):
    p = PAGES[slug]; name = p.get("city", {}).get("name", p["nav_label"])
    for pre, lab in (("land-clearing", "Land clearing"), ("forestry-mulching", "Forestry mulching"), ("cedar-removal", "Cedar removal")):
        if slug.startswith(pre):
            return f"{lab} in {name}" if "Hill Country" not in name else f"{lab} in the Hill Country"
    return p["nav_label"]

# ---------------------------------------------------------------- chrome
def header(active=""):
    def panel(pid, links, cols=2, foot=None):
        a = "".join(f'<a href="{url(s)}">{esc(n)}{f"<span>{esc(b)}</span>" if b else ""}</a>' for s, n, b in links)
        f = f'<div class="panel-foot"><a class="arrow-link" href="{url(foot[0])}">{esc(foot[1])}</a></div>' if foot else ""
        return f'<div class="panel" id="{pid}"><div class="panel-grid{" one" if cols == 1 else ""}">{a}{f}</div></div>'
    svc = panel("p-svc", SERVICES, 2, ("services", "All services"))
    aud = panel("p-aud", [(s, n, "") for s, n in AUDIENCES], 1)
    area = panel("p-area", [(s, n, "") for s, n in AREA_PAGES], 2, ("service-areas", "All service areas and map"))
    lock = '<img src="assets/logo/lockup-dark.svg" alt="9 Arrow Land Service" width="150" height="54">'
    return f"""<header class="hdr"><div class="wrap hdr-in">
<a class="hdr-logo" href="{url('')}" aria-label="9 Arrow Land Service home">{lock}</a>
<nav class="nav" aria-label="Main">
<div class="nav-item" data-drop><button class="nav-top" type="button" aria-expanded="false" aria-controls="p-svc">Services {I['chev']}</button>{svc}</div>
<div class="nav-item" data-drop><button class="nav-top" type="button" aria-expanded="false" aria-controls="p-aud">Who we serve {I['chev']}</button>{aud}</div>
<div class="nav-item" data-drop><button class="nav-top" type="button" aria-expanded="false" aria-controls="p-area">Service areas {I['chev']}</button>{area}</div>
<a class="nav-top nav-plain" href="{url('about-us')}">About</a><a class="nav-top nav-plain" href="{url('blog')}">Blog</a>
</nav>
<a class="hdr-phone" href="tel:{TEL}">{PHONE}</a>
<a class="btn btn-main hdr-cta" href="{est_url(active)}">Get an estimate</a>
<a class="call-btn" href="tel:{TEL}" aria-label="Call 9 Arrow at {PHONE}">{I['phone']}</a>
<button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="sheet" aria-label="Open menu">{I['menu']}</button>
</div></header>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Site menu" inert>
<div class="sheet-top"><img src="assets/logo/lockup-dark.svg" alt="" width="122" height="44"><button class="menu-btn sheet-x" id="sheet-close" type="button" aria-label="Close menu">{I['close']}</button></div>
<div class="sheet-body">
<details><summary>Services</summary><ul>{"".join(f'<li><a href="{url(s)}">{esc(n)}</a></li>' for s, n, _ in SERVICES)}<li><a href="{url('services')}">All services</a></li></ul></details>
<details><summary>Who we serve</summary><ul>{"".join(f'<li><a href="{url(s)}">{esc(n)}</a></li>' for s, n in AUDIENCES)}</ul></details>
<details><summary>Service areas</summary><ul>{"".join(f'<li><a href="{url(s)}">{esc(n)}</a></li>' for s, n in AREA_PAGES)}<li><a href="{url('service-areas')}">All service areas</a></li></ul></details>
<a class="solo" href="{url('our-work')}">Our work</a><a class="solo" href="{url('about-us')}">About the family</a>
<a class="solo" href="{url('blog')}">Blog &amp; guides</a><a class="solo" href="{url('faq')}">FAQ</a><a class="solo" href="{url('contact')}">Contact</a>
</div>
<div class="sheet-foot"><a class="btn btn-line" href="tel:{TEL}">{I['phone']} Call</a><a class="btn btn-main" href="{est_url(active)}">Get an estimate</a></div>
</div>"""

def footer():
    svc = "".join(f'<li><a href="{url(s)}">{esc(n)}</a></li>' for s, n, _ in SERVICES)
    areas = "".join(f'<li><a href="{url(s)}">{esc(n)}</a></li>' for s, n in AREA_PAGES)
    return f"""<footer class="ft"><div class="wrap">
<div class="ft-top">
<div class="ft-brand"><img src="assets/logo/lockup-light.svg" alt="9 Arrow Land Service" width="170" height="61" loading="lazy">
<p>Family-owned land clearing, forestry mulching and rock crushing, based in Spring Branch and serving Central Texas and the Texas Hill Country.</p>
<p class="ft-nap"><strong>9 Arrow Land Service</strong><br>Spring Branch, TX<br><a href="tel:{TEL}">{PHONE}</a><br><a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
<nav aria-label="Services"><p class="ft-h">Services</p><ul>{svc}</ul></nav>
<nav aria-label="Service areas"><p class="ft-h">Service areas</p><ul class="ft-areas">{areas}<li><a href="{url('forestry-mulching-texas-hill-country')}">Hill Country</a></li></ul>
<p class="ft-h" style="margin-top:22px">Who we serve</p><ul>{"".join(f'<li><a href="{url(s)}">{esc(n)}</a></li>' for s, n in AUDIENCES)}</ul></nav>
<nav aria-label="Company"><p class="ft-h">Company</p><ul><li><a href="{url('about-us')}">About us</a></li><li><a href="{url('our-work')}">Our work</a></li>
<li><a href="{url('blog')}">Blog &amp; guides</a></li><li><a href="{url('faq')}">FAQ</a></li><li><a href="{url('contact')}">Contact</a></li>
<li><a href="{url('get-an-estimate')}">Get an estimate</a></li><li><a href="{url('electrical-right-of-way-row-safety-manual-texas')}">ROW safety manual</a></li></ul></nav>
</div>
<div class="ft-bot"><p>&copy; 2026 9 Arrow Land Service. It does not get better.</p>
<p class="ft-social"><a href="https://www.facebook.com/9.arrowtx" rel="noopener">Facebook</a><a href="https://www.instagram.com/9.arrow/" rel="noopener">Instagram</a>
<a href="https://www.linkedin.com/company/9-arrow/" rel="noopener">LinkedIn</a><a href="{url('privacy-policy')}">Privacy</a><a href="{url('terms-and-conditions')}">Terms</a></p></div>
</div></footer>"""

def mbar(slug=""):
    return f'<div class="mbar"><a class="btn btn-line" href="tel:{TEL}">{I["phone"]} Call</a><a class="btn btn-main" href="{est_url(slug)}">Get an estimate</a></div>'

def crumbs(items):
    li = "".join(f'<li><a href="{url(s)}">{esc(n)}</a></li>' if s is not None else f'<li aria-current="page">{esc(n)}</li>' for s, n in items)
    return f'<nav class="crumbs" aria-label="Breadcrumb"><ol>{li}</ol></nav>'

# ---------------------------------------------------------------- schema
ORG_ID = SITE + "/#business"
ENTITY = ("9 Arrow Land Service is a family-owned land clearing company based in Spring Branch, Texas, founded by John and Camille "
          "Wheelock. We provide forestry mulching, rock crushing and road building, precision survey line clearing, right-of-way "
          "clearing, site work and grounds maintenance for land developers, energy and utility providers, solar developers and "
          "ranchers across Central Texas and the Texas Hill Country.")
def org():
    return {"@type": "LocalBusiness", "@id": ORG_ID, "name": "9 Arrow Land Service", "alternateName": ["9 Arrow", "Nine Arrow Land Service"],
            "description": ENTITY, "slogan": "It does not get better.", "url": SITE + "/", "telephone": TEL, "email": EMAIL,
            "logo": SITE + "/assets/logo/lockup-dark.svg", "image": SITE + "/" + img_src("g00", 1600),
            "address": {"@type": "PostalAddress", "addressLocality": "Spring Branch", "addressRegion": "TX", "addressCountry": "US"},
            "founder": [{"@type": "Person", "name": "John Wheelock"}, {"@type": "Person", "name": "Camille Wheelock"}],
            "areaServed": [{"@type": "AdministrativeArea", "name": "Central Texas"}, {"@type": "AdministrativeArea", "name": "Texas Hill Country"},
                           {"@type": "AdministrativeArea", "name": "Comal County, TX"}] + [{"@type": "City", "name": t[1] + ", TX"} for t in TOWNS],
            "knowsAbout": ["Forestry mulching", "Land clearing", "Cedar removal", "Rock crushing", "Road building", "Survey line clearing",
                           "Right-of-way clearing", "Site work", "Grounds maintenance"],
            "sameAs": ["https://www.facebook.com/9.arrowtx", "https://www.instagram.com/9.arrow/", "https://www.linkedin.com/company/9-arrow/"]}

def canon(slug):
    return SITE + ("/" if slug in ("", "index") else "/" + slug)

def schema(slug, title, desc, crumb_items, extra=()):
    bc = {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": canon(s if s is not None else slug)} for i, (s, n) in enumerate(crumb_items)]}
    page = {"@type": "WebPage", "@id": canon(slug) + "#webpage", "url": canon(slug), "name": title, "description": desc,
            "isPartOf": {"@id": SITE + "/#website"}, "about": {"@id": ORG_ID}, "inLanguage": "en-US", "dateModified": TODAY}
    graph = [org(), {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": "9 Arrow Land Service", "publisher": {"@id": ORG_ID}}, page, bc] + list(extra)
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False).replace("</", "<\\/") + "</script>"

def faq_schema(slug, faqs):
    return {"@type": "FAQPage", "@id": canon(slug) + "#faq", "mainEntity": [
        {"@type": "Question", "name": f["q"], "acceptedAnswer": {"@type": "Answer", "text": LINK.sub(r"\1", f["a"])}} for f in faqs]}

# ---------------------------------------------------------------- document
def doc(slug, title, desc, body, sch, og=None, hero_preload=None, noindex=False):
    og = og or f"assets/og/{slug or 'index'}.jpg"
    pre = f'<link rel="preload" as="image" href="{hero_preload}">' if hero_preload else ""
    robots = "noindex,follow" if noindex else "index,follow,max-image-preview:large"
    head = f"""<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canon(slug)}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#0C1906">
<meta property="og:type" content="website"><meta property="og:site_name" content="9 Arrow Land Service">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canon(slug)}"><meta property="og:image" content="{SITE}/{og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="US-TX"><meta name="geo.placename" content="Spring Branch">
<link rel="icon" href="assets/logo/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="assets/css/site.css">
{pre}
{sch}"""
    page = f"""{SPRITE}
<a class="skip" href="#main">Skip to content</a>
{header(slug)}
<main id="main">
{body}
</main>
{footer()}
{mbar(slug)}
<script src="assets/js/site.js" defer></script>"""
    if MODE == "preview" and slug in ("", "index"):
        head = head.replace(f"<title>{esc(title)}</title>", "<title>9 Arrow Website</title>", 1)
        return head + "\n" + page  # the preview host wraps the main page itself
    return f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n{head}\n</head>\n<body>\n{page}\n</body>\n</html>\n'

# ---------------------------------------------------------------- shared blocks
def phero(slug, p, crumb_items, img_key, h1=None, lede=None, cta=True, checks=True):
    hl = "".join(f"<li>{rich(h)}</li>" for h in (p.get("highlights") or [])[:4]) if checks else ""
    btns = (f'<div class="btn-row"><a class="btn btn-main" href="{est_url(slug)}">Get an estimate</a>'
            f'<a class="btn btn-line" href="tel:{TEL}">{I["phone"]} {PHONE}</a></div>') if cta else ""
    return f"""<section class="phero topo"><div class="wrap phero-in">
<div class="phero-copy">{crumbs(crumb_items)}
<h1>{esc(h1 or p['h1'])}</h1>
<p class="lede">{rich(lede or p['lede'])}</p>
{btns}
{f'<ul class="checks">{hl}</ul>' if hl else ''}
</div>
<figure class="ringpic">{img(img_key, "(max-width: 900px) 78vw, 500px", eager=True, alt=p.get('hero_alt') if img_key in ('owners', 'john') else None)}<span class="seal">{glyph()}</span></figure>
</div></section>"""

def answer(p):
    a = p.get("answer")
    if not a: return ""
    return f"""<div class="wrap answer-wrap"><section class="answer" aria-labelledby="ans-h">{emblem()}<div><h2 id="ans-h">{esc(a['q'])}</h2><p>{rich(a['a'])}</p></div></section></div>"""

def sections(p, used):
    out, flip = [], False
    for s in p.get("sections", []):
        paras = "".join(f"<p>{rich(x)}</p>" for x in s.get("paras", []))
        bl = s.get("bullets") or []
        bul = f'<ul class="bul">{"".join(f"<li>{rich(b)}</li>" for b in bl)}</ul>' if bl else ""
        pk = PHOTO.get(s.get("photo") or "")
        if pk and pk in used:
            pk = next((k for k in FALLBACK if k not in used), None)
        if pk:
            used.add(pk)
            out.append(f'<div class="block has-pic{" flip" if flip else ""}"><div class="copy"><h2>{esc(s["h2"])}</h2>{paras}{bul}</div>'
                       f'<figure class="pic">{img(pk)}</figure></div>')
            flip = not flip
        else:
            out.append(f'<div class="block"><div class="copy"><h2>{esc(s["h2"])}</h2>{paras}{bul}</div></div>')
    return out

def process(p, title="How the work runs"):
    st = p.get("process") or []
    if not st: return ""
    li = "".join(f'<li><b>{esc(x["step"])}</b><span>{rich(x["detail"])}</span></li>' for x in st)
    return f'<section class="sec alt topo"><div class="wrap"><h2 class="h-lg">{esc(title)}</h2><ol class="steps" style="--n:{len(st)}">{li}</ol></div></section>'

def faq_block(p, slug, title="Common questions", lede=None):
    fq = p.get("faqs") or []
    if not fq: return ""
    items = "".join(f'<details class="faq-item"{" open" if i == 0 else ""}><summary><h3 class="faq-q">{esc(f["q"])}</h3></summary><p class="faq-a">{rich(f["a"])}</p></details>' for i, f in enumerate(fq))
    l = f'<p class="lede mt-s">{esc(lede)}</p>' if lede else ""
    return f'<section class="sec alt" id="faq"><div class="wrap faq-grid"><div><h2 class="h-lg">{esc(title)}</h2>{l}<p class="mt-m"><a class="arrow-link" href="{url("faq")}">More answers in our FAQ</a></p></div><div class="faq-list">{items}</div></div></section>'

REVIEWS = {
    "zachc": ("We exclusively use 9 Arrow for all land clearings, lot lines, and site prep scopes for our Texas projects. They are exceptional, keep up with our overwhelming volume, and deliver a level of quality and responsiveness we haven't seen anyone else rival.", "Zach C., developer"),
    "zachp": ("John is one of the best in the business. 9 Arrow has cleared over a dozen properties for me, and every project has been handled with exceptional attention to detail.", "Zach P."),
    "kenny": ("I have had 9 Arrow do multiple jobs for me and they come through every time. This business operates with all the values you'd expect from a Central Texas, Family run company.", "Kenny Henninger"),
    "ashley": ("They cleared our 20 acres in Bulverde where Bulverde Market Day is held and did a great job! A year and a half later the land looks incredible. They are so easy to work with and have great communication (which is hard to find!)!", "Ashley Cooke, Bulverde"),
    "travis": ("9 Arrow is an amazing company mostly because they are amazing people! Diligence, honesty, integrity through and through! Talented operators that listen and communicate well.", "Travis Roberson"),
}
def review_for(slug, p):
    if "bulverde" in slug or slug.startswith("forestry-mulching"): k = "ashley"
    elif slug in ("land-developers", "precision-line-survey-clearing", "site-prep", "land-clearing", "commercial-real-estate", "solar") or "san-antonio" in slug or "new-braunfels" in slug: k = "zachc"
    elif slug in ("ranchers", "ranch-pasture-clearing", "cedar-removal", "brush-removal") or "cedar" in slug or "blanco" in slug or "kerrville" in slug: k = "travis"
    elif slug in ("grounds-maintenance", "site-work-light-utility-installation", "roads-and-access-preparation", "rock-crushing", "energy-utilities", "right-of-way-clearing"): k = "kenny"
    else: k = "zachp"
    text = json.dumps(p)
    if REVIEWS[k][0][:40] in text:
        k = next(x for x in ("zachp", "kenny", "travis", "zachc", "ashley") if REVIEWS[x][0][:40] not in text)
    q, by = REVIEWS[k]
    return f'<section class="sec"><div class="wrap"><figure class="review lead" style="max-width:900px">{STARS}<blockquote><q>{esc(q)}</q></blockquote><figcaption class="by">{esc(by)}. 5-star Google review</figcaption></figure></div></section>'

def related(p, slug):
    out = []
    rs = [s for s in (p.get("related_services") or []) if s in PAGES and s != slug][:4]
    if rs:
        cards = "".join(f'<a class="card" href="{url(s)}"><figure class="pic">{img(hero_key(s, PAGES[s]), "(max-width: 600px) 100vw, 300px")}</figure>'
                        f'<div class="card-b"><h3>{esc(SVC_NAME.get(s, PAGES[s]["nav_label"]))}</h3><p>{esc(SVC_BLURB.get(s, PAGES[s]["lede"][:110] + "..."))}</p><span class="arrow-link">Learn more</span></div></a>' for s in rs)
        out.append(f'<div><div class="sec-head"><h2 class="h-md">Related services</h2></div><div class="cards">{cards}</div></div>')
    ra = [s for s in (p.get("related_areas") or []) if s in PAGES and s != slug][:8]
    if ra:
        chips = "".join(f'<a class="chip-link" href="{url(s)}">{I["pin"]}{esc(area_label(s))}</a>' for s in ra)
        out.append(f'<div><div class="sec-head"><h2 class="h-md">Nearby service areas</h2><a class="arrow-link" href="{url("service-areas")}">All service areas</a></div><div class="chips">{chips}</div></div>')
    rp = [s for s in (p.get("related_posts") or []) if s in POSTS][:3]
    if rp:
        cards = "".join(post_card(s) for s in rp)
        out.append(f'<div><div class="sec-head"><h2 class="h-md">From the blog</h2><a class="arrow-link" href="{url("blog")}">All guides</a></div><div class="cards">{cards}</div></div>')
    if not out: return ""
    return f'<section class="sec"><div class="wrap stack">{"".join(out)}</div></section>'

def post_card(s):
    m = POSTS[s]
    return (f'<a class="card" href="{url(s)}"><figure class="pic">{img(PHOTO.get(m.get("hero_photo"), "g02"), "(max-width: 600px) 100vw, 380px")}</figure>'
            f'<div class="card-b"><h3>{esc(m["h1"])}</h3><p>{esc(m["excerpt"])}</p><span class="arrow-link">Read the guide</span></div></a>')

def cta_band(slug="", head="Ready to see what your land can become?", text=None):
    text = text or "Book a discovery call. We'll talk through the property and your goals, walk it with you, and price the work by the acre or by the day."
    return f"""<section class="dark cta-band"><div class="bg">{img("g19", "100vw", alt="")}</div><div class="wrap cta-in">
<div><h2>{esc(head)}</h2><p>{esc(text)}</p></div>
<div class="cta-side"><a class="btn btn-main" href="{est_url(slug)}">Get an estimate</a><a class="cta-phone" href="tel:{TEL}">{PHONE}</a></div>
</div></section>"""

# ---------------------------------------------------------------- map
def map_svg(highlight=None, title="Map of 9 Arrow service areas around Spring Branch, Texas"):
    lng0, lat0, k = -99.25, 30.36, 8.57
    def P(lat, lng): return ((lng - lng0) * 59.98 * k, (lat0 - lat) * 69.0 * k)
    sbx, sby = P(29.887, -98.414)
    rings = "".join(f'<circle class="rng" cx="{sbx:.1f}" cy="{sby:.1f}" r="{m * k:.1f}"/><text class="rng-l" x="{sbx + m * k * .707 + 4:.1f}" y="{sby - m * k * .707:.1f}">{m} mi</text>' for m in (15, 30, 45))
    towns = []
    for suf, name, lat, lng, dx, dy, anc in TOWNS:
        x, y = P(lat, lng); slug = "land-clearing-" + suf
        home = suf == "spring-branch-tx"; hi = slug == highlight
        r = 9 if home else (8 if hi else 6)
        fillst = ' style="fill:#17320B"' if hi else ""
        boldst = ' style="font-weight:700"' if (hi or home) else ""
        circ = (f'<circle class="halo" cx="{x:.1f}" cy="{y:.1f}" r="16"/><circle class="core" cx="{x:.1f}" cy="{y:.1f}" r="{r}"/>' if home
                else f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}"{fillst}/>')
        lab = name + (" (home base)" if home else "")
        towns.append(f'<g class="town{" home" if home else ""}"><a href="{url(slug)}" aria-label="Land clearing in {esc(name)}">{circ}'
                     f'<text x="{x + dx:.1f}" y="{y + dy:.1f}" text-anchor="{anc}"{boldst}>{esc(lab)}</text></a></g>')
    return (f'<svg viewBox="0 0 720 600" role="img" aria-labelledby="map-t"><title id="map-t">{esc(title)}</title>'
            f'<rect width="720" height="600" fill="#F6F7F4"/><image href="assets/img/topo.svg" x="-200" y="-100" width="1400" height="875" opacity=".9"/>'
            f'{rings}{"".join(towns)}<text class="note" x="16" y="588">Rings show straight-line distance from Spring Branch. Call to confirm your property.</text></svg>')

# ---------------------------------------------------------------- estimate form
TOWN_LIST = ["Spring Branch", "Bulverde", "Canyon Lake", "New Braunfels", "Boerne", "Blanco", "Wimberley", "Kerrville",
             "San Antonio", "Comal County", "Kendall County", "Hays County", "Fredericksburg", "San Marcos", "Bandera"]
def form(variant="page"):
    tiles = "".join(f'<label class="tile"><input type="checkbox" data-need="{k}" value="{esc(v)}"><span class="tile-in">'
                    f'<svg viewBox="0 0 28 28" aria-hidden="true">{TILE_ICONS[k]}</svg><span class="tile-t">{esc(v)}</span><span class="tick" aria-hidden="true"></span></span></label>' for k, v in NEEDS)
    acre = "".join(f'<label class="opt"><input type="radio" name="acreage" value="{esc(v)}"><span>{esc(v)}</span></label>'
                   for v in ("Under 5 acres", "5 to 20 acres", "20 to 100 acres", "100+ acres", "Linear work: lines, ROW or roads", "Not sure"))
    tl = "".join(f'<label class="seg"><input type="radio" name="timeline" value="{esc(v)}"><span>{esc(v)}</span></label>'
                 for v in ("As soon as possible", "1 to 3 months", "3 to 6 months", "Just planning"))
    cp = "".join(f'<label class="seg"><input type="radio" name="contact_preference" value="{v}"{" checked" if v == "Call" else ""}><span>{v}</span></label>' for v in ("Call", "Text", "Email"))
    dl = "".join(f'<option value="{t}">' for t in TOWN_LIST)
    hid = "".join(f'<input type="hidden" name="{n}">' for n in ("services", "landing_page", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"))
    arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h14M12 6l7 6-7 6" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>'
    return f"""<form class="est-form" id="estimate-form" name="estimate-request" method="POST" action="/thanks" data-netlify="true" netlify-honeypot="bot-field" novalidate>
<input type="hidden" name="form-name" value="estimate-request"><input type="hidden" name="page_variant" value="{variant}">{hid}
<p class="hp" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
<div class="fwrap">
<div class="fprog" aria-live="polite"><div class="fprog-top"><span class="fprog-n">Step 1 of 4</span><span class="fprog-name">The work</span></div>
<div class="fprog-track"><span class="fprog-fill"></span><span class="fprog-mark">{arrow}</span></div></div>
<fieldset class="fs is-active" data-step="need" data-name="The work"><legend class="fs-q">What does the land need?</legend><p class="fs-hint">Pick everything that applies.</p>
<div class="tiles">{tiles}</div><p class="ferr" role="alert" hidden></p>
<div class="fnav"><button type="button" class="btn btn-main" data-next>Continue</button></div></fieldset>
<fieldset class="fs" data-step="land" data-name="The land"><legend class="fs-q">About how much land are we talking about?</legend><p class="fs-hint">A rough guess is fine. We confirm it on the call.</p>
<div class="opts">{acre}</div><p class="ferr" role="alert" hidden></p>
<div class="fnav"><button type="button" class="btn btn-line" data-back>Back</button><button type="button" class="btn btn-main" data-next>Continue</button></div></fieldset>
<fieldset class="fs" data-step="where" data-name="Location and timing"><legend class="fs-q">Where is the property, and when do you need it?</legend>
<div class="field"><label for="f-location">Town or county</label><input id="f-location" name="property_location" list="f-towns" autocomplete="address-level2" placeholder="e.g. Bulverde or Comal County"><datalist id="f-towns">{dl}</datalist></div>
<div class="field"><span class="flabel" id="tl-l">Timeline</span><div class="segs" role="radiogroup" aria-labelledby="tl-l">{tl}</div></div>
<div class="field"><label for="f-client">I'm a <span class="opt-t">(optional)</span></label><select id="f-client" name="client_type"><option value="">Choose one</option>
<option>Landowner or rancher</option><option>Land developer</option><option>Builder or commercial real estate</option><option>Energy or utility provider</option><option>Solar developer</option><option>Other</option></select></div>
<p class="ferr" role="alert" hidden></p>
<div class="fnav"><button type="button" class="btn btn-line" data-back>Back</button><button type="button" class="btn btn-main" data-next>Continue</button></div></fieldset>
<fieldset class="fs" data-step="you" data-name="Your details"><legend class="fs-q">Who should we call?</legend>
<div class="fgrid"><div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name"></div>
<div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></div>
<div class="field fwide"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" inputmode="email"></div></div>
<div class="field"><span class="flabel" id="cp-l">Best way to reach you</span><div class="segs" role="radiogroup" aria-labelledby="cp-l">{cp}</div></div>
<details class="fmore"><summary>Add notes for the crew <span class="opt-t">(optional)</span></summary><textarea id="f-notes" name="notes" rows="3" placeholder="Gate access, tree types, what you plan to build"></textarea></details>
<p class="ferr" role="alert" hidden></p>
<div class="fnav"><button type="button" class="btn btn-line" data-back>Back</button><button type="submit" class="btn btn-main">Request my estimate</button></div>
<p class="ffine">Your details go straight to the 9 Arrow team. We never sell or share them.</p></fieldset>
</div>
<div class="fdone" hidden tabindex="-1">{emblem("fdone-mark")}<p class="fdone-h">Request received.</p>
<p>The 9 Arrow team will reach out to set up your discovery call. Need us sooner? Call <a href="tel:{TEL}">{PHONE}</a>.</p><dl class="fdone-sum"></dl></div>
</form>"""

def estimate_section(slug="index", head="Tell us about your land.", text=None, dark=True):
    text = text or "Four quick steps. We'll call to set up a discovery call, walk the property with you, and price the work by the acre or by the day."
    return f"""<section class="sec est-sec{' dark topo' if dark else ''}" id="estimate"><div class="wrap est-grid">
<div class="est-copy"><h2 class="h-lg">{esc(head)}</h2><p class="lede mt-s">{esc(text)}</p>
<ol class="est-path"><li><b>Discovery call</b><span>Your land, your goal, your timeline.</span></li><li><b>Site walk</b><span>Density, tree size, terrain, access and soil.</span></li>
<li><b>Estimate</b><span>By the acre or by the day.</span></li><li><b>The work</b><span>Not finished until we're proud of it.</span></li></ol>
<p class="est-call">Rather talk now? <a href="tel:{TEL}">{PHONE}</a></p></div>
<div class="est-card">{form(slug)}</div></div></section>"""

# ---------------------------------------------------------------- page renderers
TYPE_CRUMB = {"service": ("services", "Services"), "audience": (None, "Who we serve"), "city": ("service-areas", "Service areas"),
              "hub": None, "company": None}

def crumb_items(slug, p):
    t = p["type"]
    if t == "service": return [("", "Home"), ("services", "Services"), (None, p["nav_label"])]
    if t == "city": return [("", "Home"), ("service-areas", "Service areas"), (None, p["nav_label"])]
    return [("", "Home"), (None, p["nav_label"])]

def service_node(slug, p):
    node = {"@type": "Service", "@id": canon(slug) + "#service", "name": p["h1"], "serviceType": p.get("primary_keyword", p["nav_label"]),
            "description": LINK.sub(r"\1", p["answer"]["a"]) if p.get("answer") else p["meta_description"],
            "provider": {"@id": ORG_ID}, "url": canon(slug), "image": SITE + "/" + img_src(hero_key(slug, p), 1600)}
    if p["type"] == "city" and p.get("city"):
        c = p["city"]
        place = {"@type": "City" if "County" not in c["name"] and "Hill Country" not in c["name"] else "AdministrativeArea", "name": c["name"] + (", TX" if "Hill Country" not in c["name"] else "")}
        if c.get("lat"): place["geo"] = {"@type": "GeoCoordinates", "latitude": c["lat"], "longitude": c["lng"]}
        if c.get("county") and "region" not in c["county"] and c["county"] != c["name"]: place["containedInPlace"] = {"@type": "AdministrativeArea", "name": c["county"] + ", TX"}
        node["areaServed"] = place
    else:
        node["areaServed"] = [{"@type": "AdministrativeArea", "name": "Central Texas"}, {"@type": "AdministrativeArea", "name": "Texas Hill Country"}]
    return node

def local_panel(slug, p):
    c = p.get("city") or {}
    near = [s for s in (c.get("nearby") or []) if s in PAGES and s != slug]
    near_html = "".join(f'<li><a href="{url(s)}">{esc(area_label(s))}</a></li>' for s in near[:6])
    hl = slug if slug.startswith("land-clearing-") else ("land-clearing-" + slug.split("-", 2)[-1] if slug.count("-") >= 2 else None)
    hl = hl if hl in PAGES else None
    county = c.get("county", "")
    return f"""<section class="sec alt"><div class="wrap map-wrap"><div class="map">{map_svg(hl, f"Map of 9 Arrow service areas with {c.get('name', '')} highlighted")}</div>
<div><h2 class="h-lg">Serving {esc(c.get('name', ''))} from Spring Branch</h2>
<p class="lede mt-s">{esc(c.get('name', ''))}{f" is in {esc(county)}." if county and county != c.get('name') and 'region' not in county else "."} Our crew is based in Spring Branch and works across Central Texas and the Hill Country.</p>
{f'<p class="kicker mt-m">Nearby areas we serve</p><ul class="area-list mt-s">{near_html}</ul>' if near_html else ''}
<p class="mt-m"><a class="arrow-link" href="{url('service-areas')}">See every service area</a></p></div></div></section>"""

def render_standard(slug):
    p = PAGES[slug]
    used = {hero_key(slug, p)}
    ci = crumb_items(slug, p)
    blocks = sections(p, used)
    body = [phero(slug, p, ci, hero_key(slug, p)), answer(p)]
    first, rest = blocks[:1], blocks[1:]
    body.append(f'<section class="sec"><div class="wrap stack">{"".join(first)}</div></section>')
    pr = process(p, "How the work runs" if p["type"] != "city" else "How a job runs")
    if pr: body.append(pr)
    if rest: body.append(f'<section class="sec{" sec-tight" if pr else ""}"><div class="wrap stack">{"".join(rest)}</div></section>')
    if p["type"] == "city": body.append(local_panel(slug, p))
    body.append(review_for(slug, p))
    body.append(faq_block(p, slug, "Common questions" if p["type"] != "city" else f"Questions from {p.get('city', {}).get('name', 'local')} landowners"))
    body.append(related(p, slug))
    head = {"service": f"Talk to us about {SVC_NAME.get(slug, p['nav_label']).lower()}.", "city": f"Have land in {p.get('city', {}).get('name', 'the Hill Country')}?"}.get(p["type"], "Ready to see what your land can become?")
    body.append(cta_band(slug, head))
    extra = [service_node(slug, p)] if p["type"] in ("service", "city") else []
    if p.get("faqs"): extra.append(faq_schema(slug, p["faqs"]))
    sch = schema(slug, p["title_tag"], p["meta_description"], [(s if s is not None else slug, n) for s, n in ci], extra)
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(b for b in body if b), sch, hero_preload=img_src(hero_key(slug, p), 960))

def render_services_hub():
    slug = "services"; p = PAGES[slug]
    groups = [("Clearing", ["forestry-mulching-and-land-clearing", "land-clearing", "cedar-removal", "brush-removal", "ranch-pasture-clearing", "site-prep"]),
              ("Rock, roads and site work", ["rock-crushing", "roads-and-access-preparation", "site-work-light-utility-installation"]),
              ("Lines, corridors and upkeep", ["precision-line-survey-clearing", "right-of-way-clearing", "grounds-maintenance"])]
    g = ""
    for name, slugs in groups:
        cards = "".join(f'<a class="card" href="{url(s)}"><figure class="pic">{img(hero_key(s, PAGES[s]), "(max-width: 600px) 100vw, 380px")}</figure>'
                        f'<div class="card-b"><h3>{esc(SVC_NAME[s])}</h3><p>{esc(SVC_BLURB[s])}.</p><span class="arrow-link">Learn more</span></div></a>' for s in slugs)
        g += f'<div><h2 class="h-md" style="margin-bottom:18px">{esc(name)}</h2><div class="cards">{cards}</div></div>'
    aud = "".join(f'<a class="chip-link" href="{url(s)}">{esc(n)}</a>' for s, n in AUDIENCES)
    used = {"g00"}
    blocks = sections(p, used)
    ci = [("", "Home"), (None, "Services")]
    body = [phero(slug, p, ci, "g00"), answer(p),
            f'<section class="sec"><div class="wrap stack">{g}<div><h2 class="h-md" style="margin-bottom:14px">Who we work for</h2><div class="chips">{aud}</div></div></div></section>',
            f'<section class="sec alt"><div class="wrap stack">{"".join(blocks)}</div></section>' if blocks else "",
            faq_block(p, slug), cta_band(slug)]
    sch = schema(slug, p["title_tag"], p["meta_description"], [("", "Home"), (slug, "Services")], [faq_schema(slug, p["faqs"])] if p.get("faqs") else [])
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(b for b in body if b), sch, hero_preload=img_src("g00", 960))

def render_areas_hub():
    slug = "service-areas"; p = PAGES[slug]
    groups = [("Land clearing", [s for s in PAGES if s.startswith("land-clearing-")]),
              ("Forestry mulching", [s for s in PAGES if s.startswith("forestry-mulching-") and s != "forestry-mulching-and-land-clearing"]),
              ("Cedar removal", [s for s in PAGES if s.startswith("cedar-removal-")])]
    def area_li(s):
        c = PAGES[s].get("city", {}); county = c.get("county", "")
        county = "" if "region" in county else county
        return f'<li><a href="{url(s)}">{esc(c.get("name", PAGES[s]["nav_label"]))}<span>{esc(county)}</span></a></li>'
    lists = "".join(f'<div><h3 class="h-sm" style="margin-bottom:8px">{esc(n)}</h3><ul class="area-list">{"".join(area_li(s) for s in sorted(ss))}</ul></div>' for n, ss in groups)
    used = {"g28"}
    blocks = sections(p, used)
    ci = [("", "Home"), (None, "Service areas")]
    body = [phero(slug, p, ci, "g28"), answer(p),
            f'<section class="sec"><div class="wrap map-wrap"><div class="map">{map_svg()}</div><div class="stack" style="gap:28px">{lists}</div></div></section>',
            f'<section class="sec alt"><div class="wrap stack">{"".join(blocks)}</div></section>' if blocks else "",
            faq_block(p, slug), cta_band(slug, "Not sure if you're in range?", "Call us. We work across Central Texas and the Hill Country, and we'll tell you straight if your property is a fit.")]
    sch = schema(slug, p["title_tag"], p["meta_description"], [("", "Home"), (slug, "Service areas")], [faq_schema(slug, p["faqs"])] if p.get("faqs") else [])
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(b for b in body if b), sch, hero_preload=img_src("g28", 960))

VALUES = [("Honor", "Respect for our crew and every client."), ("Stewardship", "Care for the land we're trusted with."),
          ("Integrity", "Doing what's right when no one is watching."), ("Honesty", "Clear talk from estimate to finish."),
          ("Trust", "We treat your property like our own."), ("Gratitude", "Thankful for the work and the people."),
          ("Service", "Your goals come first on every job."), ("Excellence", "A finish we're proud to put our name on."),
          ("Diligence", "Steady work until the job is right.")]

def render_about():
    slug = "about-us"; p = dict(PAGES[slug])
    p["sections"] = [x for x in p["sections"] if "value" not in x["h2"].lower()]
    used = {"owners"}
    blocks = sections(p, used)
    vals = "".join(f'<li>{emblem("vmk")}<b>{esc(n)}</b><span>{esc(t)}</span></li>' for n, t in VALUES)
    revs = "".join(f'<figure class="review">{STARS}<blockquote><q>{esc(q)}</q></blockquote><figcaption class="by">{esc(b)}</figcaption></figure>' for q, b in (REVIEWS["kenny"], REVIEWS["travis"], REVIEWS["zachp"]))
    ci = [("", "Home"), (None, "About")]
    body = [phero(slug, p, ci, "owners"), answer(p),
            f'<section class="sec"><div class="wrap stack">{"".join(blocks[:2])}</div></section>',
            f'<section class="sec alt topo"><div class="wrap"><div class="sec-head"><div><h2 class="h-lg">Nine children. Nine values.</h2><p class="lede">The name comes from Psalm 127:4: "As arrows are in the hand of a mighty man; so are children of the youth." The values are how we run every job.</p></div></div><ul class="values">{vals}</ul></div></section>',
            f'<section class="sec"><div class="wrap stack">{"".join(blocks[2:])}</div></section>' if blocks[2:] else "",
            f'<section class="sec alt"><div class="wrap"><h2 class="h-lg" style="margin-bottom:24px">What people say about working with the family</h2><div class="reviews">{revs}</div></div></section>',
            faq_block(p, slug), cta_band(slug)]
    extra = [{"@type": "AboutPage", "@id": canon(slug) + "#about", "url": canon(slug), "mainEntity": {"@id": ORG_ID}}]
    if p.get("faqs"): extra.append(faq_schema(slug, p["faqs"]))
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(b for b in body if b), schema(slug, p["title_tag"], p["meta_description"], [("", "Home"), (slug, "About")], extra), hero_preload=img_src("owners", 960))

def render_faq():
    slug = "faq"; p = PAGES[slug]
    topics = {}
    for f in p["faqs"]: topics.setdefault(f.get("topic", "General"), []).append(f)
    toc = "".join(f'<a class="chip-link" href="#t-{re.sub(r"[^a-z]+", "-", t.lower()).strip("-")}">{esc(t)}</a>' for t in topics)
    groups = ""
    for t, fs in topics.items():
        tid = re.sub(r"[^a-z]+", "-", t.lower()).strip("-")
        items = "".join(f'<details class="faq-item"><summary><h3 class="faq-q">{esc(f["q"])}</h3></summary><p class="faq-a">{rich(f["a"])}</p></details>' for f in fs)
        groups += f'<h2 class="faq-topic" id="t-{tid}">{esc(t)}</h2><div class="faq-list">{items}</div>'
    ci = [("", "Home"), (None, "FAQ")]
    body = [phero(slug, p, ci, "g13"), answer(p),
            f'<section class="sec"><div class="wrap faq-grid"><div><div class="sticky-col"><h2 class="h-md">Jump to a topic</h2><div class="chips mt-s">{toc}</div><p class="mt-m">Still have a question? Call <a href="tel:{TEL}">{PHONE}</a>.</p></div></div><div>{groups}</div></div></section>',
            cta_band(slug)]
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(body), schema(slug, p["title_tag"], p["meta_description"], [("", "Home"), (slug, "FAQ")], [faq_schema(slug, p["faqs"])]), hero_preload=img_src("g13", 960))

def render_estimate():
    slug = "get-an-estimate"; p = PAGES[slug]
    ci = [("", "Home"), (None, "Get an estimate")]
    side = "".join(f'<div class="block"><div class="copy"><h2 class="h-sm">{esc(s["h2"])}</h2>{"".join(f"<p>{rich(x)}</p>" for x in s.get("paras", []))}</div></div>' for s in p.get("sections", []))
    body = [f"""<section class="phero topo est-hero"><div class="wrap">{crumbs(ci)}<h1 class="mt-s">{esc(p['h1'])}</h1><p class="lede mt-s">{rich(p['lede'])}</p></div></section>""",
            f"""<section class="sec est-page"><div class="wrap est-grid est-grid-page"><div class="est-card">{form("estimate-page")}</div>
<aside class="est-side"><div class="aside-card"><h2 class="h-sm">{esc(p['answer']['q'])}</h2><p>{rich(p['answer']['a'])}</p></div>
<div class="aside-card"><h2 class="h-sm">Rather talk to someone?</h2><p><a class="cta-phone dark-ink" href="tel:{TEL}">{PHONE}</a></p><p class="small">{EMAIL}</p></div>{side}</aside></div></section>""",
            faq_block(p, slug)]
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(b for b in body if b), schema(slug, p["title_tag"], p["meta_description"], [("", "Home"), (slug, "Get an estimate")], [faq_schema(slug, p["faqs"])] if p.get("faqs") else []))

def render_contact():
    slug = "contact"; p = PAGES[slug]
    ci = [("", "Home"), (None, "Contact")]
    blocks = sections(p, {"g19"})
    cards = f"""<div class="contact-cards"><a class="ccard" href="tel:{TEL}">{I['phone']}<span>Call or text</span><b>{PHONE}</b></a>
<a class="ccard" href="mailto:{EMAIL}">{I['mail']}<span>Email</span><b>{EMAIL}</b></a><div class="ccard">{I['pin']}<span>Based in</span><b>Spring Branch, TX</b></div></div>"""
    body = [phero(slug, p, ci, "g19", cta=False), f'<div class="wrap answer-wrap">{cards}</div>',
            f'<section class="sec"><div class="wrap stack">{"".join(blocks)}</div></section>' if blocks else "",
            estimate_section(slug, "Or send us the details.", dark=False),
            f'<section class="sec alt"><div class="wrap map-wrap"><div class="map">{map_svg()}</div><div><h2 class="h-lg">Where we work</h2><p class="lede mt-s">Spring Branch is home base. We clear land across Central Texas and the Hill Country.</p><p class="mt-m"><a class="arrow-link" href="{url("service-areas")}">All service areas</a></p></div></div></section>',
            faq_block(p, slug)]
    extra = [{"@type": "ContactPage", "@id": canon(slug) + "#contact", "url": canon(slug), "mainEntity": {"@id": ORG_ID}}]
    if p.get("faqs"): extra.append(faq_schema(slug, p["faqs"]))
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(b for b in body if b), schema(slug, p["title_tag"], p["meta_description"], [("", "Home"), (slug, "Contact")], extra), hero_preload=img_src("g19", 960))

def lens(pairs, static=False, head="Look through the ring.", text="Scroll to walk the ring across the job. Inside it you see the same ground after we're done.", dark=True):
    b0 = pairs[0]
    btns = "".join(f'<button type="button" class="pair-btn" data-pair aria-pressed="{"true" if i == 0 else "false"}" data-before="{img_src(b, 1600)}" data-after="{img_src(a, 1600)}" '
                   f'data-before-alt="{esc(IMGS[b]["alt"])}" data-after-alt="{esc(IMGS[a]["alt"])}" data-cap-b="{esc(cb)}" data-cap-a="{esc(ca)}">{esc(label)}</button>'
                   for i, (label, b, a, cb, ca) in enumerate(pairs))
    return f"""<section class="lens{' lens-static' if static else ''}{' dark' if dark else ''}" data-lens aria-labelledby="lens-h"><div class="lens-pin"><div class="wrap lens-in">
<div class="lens-head"><div><h2 class="h-lg" id="lens-h">{esc(head)}</h2><p class="lede mt-s">{esc(text)}</p></div><div class="pair-btns" role="group" aria-label="Choose a job">{btns}</div></div>
<div class="lens-stage" tabindex="0" role="img" aria-label="Before and after comparison of a real 9 Arrow job. Use arrow keys to move the ring.">
<img class="lens-before" src="{img_src(b0[1], 1600)}" alt="{esc(IMGS[b0[1]]['alt'])}" loading="lazy">
<img class="lens-after" src="{img_src(b0[2], 1600)}" alt="{esc(IMGS[b0[2]]['alt'])}" loading="lazy">
<span class="lens-ring" aria-hidden="true">{glyph('#fff', 'lens-glyph')}</span>
<span class="lens-tag b">Before</span><span class="lens-tag a">After</span></div>
<p class="lens-foot"><span class="lens-cap" data-before="{esc(b0[3])}" data-after="{esc(b0[4])}">{esc(b0[3])}</span><span>Real 9 Arrow job photos</span></p>
</div></div></section>"""

LENS_PAIRS = [("Brush to trail", "trail-before", "trail-after", "A brushy trail, before mulching", "The same trail after forestry mulching"),
              ("Rock to road", "rock-before", "rock-after", "Loose surface rock", "Road base crushed from that rock")]

def render_our_work():
    slug = "our-work"; p = PAGES[slug]
    ci = [("", "Home"), (None, "Our work")]
    gal = ["w-mulcher-dust", "w-fleet", "w-mulcher-head", "w-line", "w-sunrays", "w-red", "w-trail", "w-hillside", "w-oaks", "w-road", "w-trench", "w-mulch", "w-mow", "w-sharpen", "w-row", "john"]
    tiles = "".join(f'<figure class="g-item">{img(k, "(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw")}<figcaption>{esc(IMGS[k]["alt"])}</figcaption></figure>' for k in gal)
    blocks = sections(p, set(gal) | {"trail-after", "w-fleet"})
    body = [phero(slug, p, ci, "w-fleet"), answer(p), lens(LENS_PAIRS, static=True, head="Before and after, through the ring.", text="Move the ring across the photo, or switch jobs. Inside the ring is the same ground after we finished.", dark=False),
            f'<section class="sec alt"><div class="wrap"><div class="sec-head"><div><h2 class="h-lg">Photos from our job sites</h2><p class="lede">Every photo on this page is from a real 9 Arrow job in Central Texas.</p></div><a class="arrow-link" href="https://www.instagram.com/9.arrow/" rel="noopener">More on Instagram</a></div><div class="gallery">{tiles}</div></div></section>',
            f'<section class="sec"><div class="wrap stack">{"".join(blocks)}</div></section>' if blocks else "",
            faq_block(p, slug), cta_band(slug)]
    extra = [faq_schema(slug, p["faqs"])] if p.get("faqs") else []
    return doc(slug, p["title_tag"], p["meta_description"], "\n".join(b for b in body if b), schema(slug, p["title_tag"], p["meta_description"], [("", "Home"), (slug, "Our work")], extra), hero_preload=img_src("w-fleet", 960))

# ---------------------------------------------------------------- blog
def md(text):
    h = markdown.markdown(text, extensions=["tables", "sane_lists"])
    def rep(m):
        t = m.group(1)
        k = t.strip("/").replace(".html", "")
        if k in ALL: return f'href="{url(k)}"'
        if t.startswith("http"): return f'href="{t}" rel="noopener"'
        return f'href="{t}"'
    h = re.sub(r'href="([^"]+)"', rep, h)
    h = h.replace("<table>", '<div class="tbl"><table>').replace("</table>", "</table></div>")
    return h

def render_post(slug):
    m = POSTS[slug]
    hk = PHOTO.get(m.get("hero_photo"), "g02")
    words = len(re.findall(r"\w+", m["body"]))
    mins = max(3, round(words / 230))
    ci = [("", "Home"), ("blog", "Blog"), (None, m["h1"])]
    faqs = m.get("faqs") or []
    faq_html = faq_block({"faqs": faqs}, slug, "Questions about this topic") if faqs else ""
    rs = [s for s in (m.get("related_services") or []) if s in PAGES][:3]
    svc_links = "".join(f'<li><a href="{url(s)}">{esc(SVC_NAME.get(s, PAGES[s]["nav_label"]))}</a></li>' for s in rs)
    from datetime import date
    fmt = lambda s: date.fromisoformat(s).strftime("%B %-d, %Y")
    body = f"""<article>
<header class="post-head topo"><div class="wrap">{crumbs(ci)}<h1 class="h-xl mt-s" style="max-width:22ch">{esc(m['h1'])}</h1>
<p class="lede mt-s">{esc(m['excerpt'])}</p>
<p class="post-meta mt-s"><span>By the 9 Arrow team</span><span>Published {fmt(m['date'])}</span><span>Updated {fmt(m.get('updated', m['date']))}</span><span>{mins} min read</span></p></div></header>
<div class="wrap"><figure class="post-hero">{img(hk, "(max-width: 1200px) 100vw, 1200px", eager=True, alt=m.get('hero_alt') if hk in ('owners', 'john') else None)}</figure></div>
<section class="sec" style="padding-top:clamp(28px,4vw,48px)"><div class="wrap post-grid"><div>
<section class="answer" aria-labelledby="ans-h">{emblem()}<div><h2 id="ans-h">{esc(m['answer_q'])}</h2><p>{rich(m['answer_a'])}</p></div></section>
<div class="prose mt-l">{md(m['body'])}</div></div>
<aside class="post-aside"><div class="aside-card"><h3>Get a real number for your land</h3><p class="small">We price by the acre or by the day after a discovery call and a look at the property.</p><a class="btn btn-main" href="{est_url(rs[0] if rs else '')}">Get an estimate</a><a href="tel:{TEL}" class="small">{PHONE}</a></div>
{f'<div class="aside-card"><h3>Related services</h3><ul class="bul">{svc_links}</ul></div>' if svc_links else ''}</aside></div></section>
</article>
{faq_html}
{related({"related_posts": m.get("related_posts") or []}, slug)}
{cta_band(rs[0] if rs else "")}"""
    post = {"@type": "BlogPosting", "@id": canon(slug) + "#post", "headline": m["h1"], "description": m["meta_description"],
            "datePublished": m["date"], "dateModified": m.get("updated", m["date"]), "author": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID},
            "image": SITE + "/" + img_src(hk, 1600), "mainEntityOfPage": canon(slug), "keywords": m.get("primary_keyword", "")}
    extra = [post] + ([faq_schema(slug, faqs)] if faqs else [])
    return doc(slug, m["title_tag"], m["meta_description"], body, schema(slug, m["title_tag"], m["meta_description"], [("", "Home"), ("blog", "Blog"), (slug, m["h1"])], extra), hero_preload=img_src(hk, 1600))

def render_blog_index():
    b = BLOG_INDEX; slugs = sorted(POSTS, key=lambda s: POSTS[s]["date"], reverse=True)
    lead = slugs[0]; m = POSTS[lead]
    feat = (f'<a class="feature" href="{url(lead)}"><figure class="pic">{img(PHOTO.get(m.get("hero_photo"), "g02"), "(max-width: 900px) 100vw, 60vw", eager=True)}</figure>'
            f'<div class="feature-b"><p class="kicker">Latest guide</p><h2 class="h-lg">{esc(m["h1"])}</h2><p>{esc(m["excerpt"])}</p><span class="arrow-link">Read the guide</span></div></a>')
    cards = "".join(post_card(s) for s in slugs[1:])
    body = f"""<section class="phero topo est-hero"><div class="wrap">{crumbs([("", "Home"), (None, "Blog")])}<h1 class="mt-s">{esc(b['h1'])}</h1><p class="lede mt-s">{esc(b['lede'])}</p></div></section>
<section class="sec"><div class="wrap stack">{feat}<div class="cards">{cards}</div></div></section>{cta_band("blog")}"""
    blog = {"@type": "Blog", "@id": canon("blog") + "#blog", "url": canon("blog"), "name": b["h1"], "publisher": {"@id": ORG_ID},
            "blogPost": [{"@id": canon(s) + "#post"} for s in slugs]}
    return doc("blog", b["title_tag"], b["meta_description"], body, schema("blog", b["title_tag"], b["meta_description"], [("", "Home"), ("blog", "Blog")], [blog]))

# ---------------------------------------------------------------- legal + utility pages
def legal(slug, title):
    from bs4 import BeautifulSoup
    s = BeautifulSoup(open(os.path.join(ROOT, f"content/legal/{slug}.source.html")), "html.parser")
    h1 = s.find("h1"); parts = []
    for el in h1.find_all_next(["h2", "h3", "p", "ul"]):
        if el.find_parent("footer") or el.find_parent("header"): break
        if el.name == "ul" and el.find_parent("nav"): continue
        t = el.decode_contents() if el.name != "ul" else str(el)
        if el.name in ("p",) and el.find_parent("ul"): continue
        parts.append(f"<{el.name}>{t}</{el.name}>" if el.name != "ul" else t)
    content = "".join(parts)
    body = f'<section class="phero topo est-hero"><div class="wrap">{crumbs([("", "Home"), (None, title)])}<h1 class="mt-s">{esc(title)}</h1></div></section><section class="sec"><div class="wrap"><div class="prose">{content}</div></div></section>'
    return doc(slug, f"{title} | 9 Arrow Land Service", f"{title} for 9arrow.com, the website of 9 Arrow Land Service in Spring Branch, Texas.", body, schema(slug, title, title, [("", "Home"), (slug, title)]))

def render_thanks():
    body = f'<section class="sec topo" style="min-height:60vh;display:grid;place-items:center"><div class="wrap center" style="display:grid;gap:18px;justify-items:center">{emblem("mk big-mk")}<h1 class="h-lg">Request received.</h1><p class="lede">The 9 Arrow team will reach out to set up your discovery call. Need us sooner? Call <a href="tel:{TEL}">{PHONE}</a>.</p><a class="btn btn-line" href="{url("")}">Back to the homepage</a></div></section>'
    return doc("thanks", "Request received | 9 Arrow Land Service", "Thanks for reaching out to 9 Arrow Land Service.", body, "", noindex=True)

def render_404():
    body = f'<section class="sec topo" style="min-height:60vh;display:grid;place-items:center"><div class="wrap center" style="display:grid;gap:18px;justify-items:center">{emblem("mk big-mk")}<h1 class="h-lg">That page missed the mark.</h1><p class="lede">The page you were looking for moved or never existed. Try one of these instead.</p><div class="btn-row" style="justify-content:center"><a class="btn btn-main" href="{url("services")}">Our services</a><a class="btn btn-line" href="{url("service-areas")}">Service areas</a><a class="btn btn-line" href="{url("")}">Home</a></div></div></section>'
    return doc("404", "Page not found | 9 Arrow Land Service", "This page could not be found.", body, "", noindex=True)

# ---------------------------------------------------------------- home
HOME_TITLE = "Land Clearing & Forestry Mulching in Central Texas | 9 Arrow"
HOME_DESC = "Forestry mulching, land clearing, rock crushing and survey line clearing across Central Texas. Family-owned in Spring Branch, TX. Get an estimate."
HOME_TRACK = ["forestry-mulching-and-land-clearing", "rock-crushing", "land-clearing", "cedar-removal", "roads-and-access-preparation",
              "precision-line-survey-clearing", "right-of-way-clearing", "site-work-light-utility-installation", "grounds-maintenance"]
HOME_FAQ_Q = ["How much does land clearing cost", "How many acres", "Can you crush rock", "What does the land look like", "Are there trees too big", "How long does it take for grass"]

def render_home():
    slug = "index"
    allf = PAGES["faq"]["faqs"]
    hf = []
    for key in HOME_FAQ_Q:
        f = next((f for f in allf if key.lower() in f["q"].lower()), None)
        if f and f not in hf: hf.append(f)
    hf = hf[:5] if len(hf) >= 4 else allf[:5]
    ring = f'<circle r="{RING_R:.1f}" fill="none" stroke="#E8EBE7" stroke-width="{RING_W:.1f}"/>'
    portal = f"""<section class="portal dark" id="portal" aria-labelledby="h1"><div class="portal-in">
<div class="pv" id="pv"><video id="hero-video" muted loop playsinline autoplay preload="metadata" poster="{img_src('g00', 1600)}" aria-hidden="true">
<source src="assets/video/hero-960.mp4" type="video/mp4" media="(max-width: 900px)"><source src="assets/video/hero-1600.mp4" type="video/mp4"></video></div>
<div class="pm-wrap" id="pm-wrap" aria-hidden="true"><svg class="pm" id="pm" viewBox="-160 -160 320 320">{ring}<use href="#g9" x="-160" y="-160" width="320" height="320" fill="#E8EBE7"/></svg></div>
<div class="hero-top" id="hero-top"><p class="where">Family-owned in Spring Branch, Texas</p><h1 id="h1">Land clearing, forestry mulching and rock crushing across Central Texas</h1></div>
<div class="hero-bot" id="hero-bot"><p class="tag">It does not get better.</p>
<div class="btn-row"><a class="btn btn-main" href="{url('get-an-estimate')}">Get an estimate</a><a class="btn btn-line" href="tel:{TEL}">{I['phone']} {PHONE}</a></div>
<p class="cue" aria-hidden="true">Scroll through the 9</p></div>
<div class="stage" id="stage"><div class="wrap stage-in"><p class="stage-h">We don't just clear land. We stage it.</p>
<p>Overgrown, locked-up acreage turned into open, usable ground that buyers, builders and cattle can use.</p>
<div class="btn-row"><a class="btn btn-main" href="#services">See what we do</a></div></div></div>
</div></section>"""
    intro = f"""<section class="sec intro"><div class="wrap grid-2">
<div class="copy stack" style="gap:18px"><h2 class="h-lg">Central Texas land, cleared right the first time.</h2>
<p class="lede">{esc(ENTITY)}</p>
<p><a class="arrow-link" href="{url('about-us')}">Meet the family behind 9 Arrow</a></p></div>
<ul class="stats" aria-label="By the numbers">
<li><b>1&ndash;3</b><span>acres a day on our high-horsepower mulchers, in reasonable density</span></li>
<li><b>15 min</b><span>for a big tree that takes a smaller machine an hour</span></li>
<li><b>No limit</b><span>on tree size. Bigger trees just take longer.</span></li>
<li><b>0</b><span>burn piles. Brush and old dozer piles become mulch on site.</span></li></ul>
</div></section>"""
    cards = "".join(f'<a class="tcard" href="{url(s)}"><figure>{img(hero_key(s, PAGES[s]), "(max-width: 960px) 82vw, 420px")}</figure><div class="tcard-b"><h3>{esc(SVC_NAME[s])}</h3><p>{esc(SVC_BLURB[s])}.</p><span class="arrow-link">Learn more</span></div></a>' for s in HOME_TRACK)
    track = f"""<section class="trk topo" id="services" aria-labelledby="svc-h"><div class="trk-sec" id="svc-track-sec"><div class="trk-in">
<div class="wrap trk-head"><div><h2 class="h-lg" id="svc-h">Everything the land needs before you build on it.</h2><p class="lede mt-s">From the first cut to finished access, one family crew handles the whole scope.</p></div>
<a class="btn btn-line" href="{url('services')}">All services</a></div>
<div class="trk-view"><div class="trk-row" id="track">{cards}</div></div>
<div class="wrap"><div class="trk-rail" aria-hidden="true"><i id="rail-done"></i><svg id="rail-arrow" viewBox="0 0 64 20"><path d="M0 4l8 6-8 6h5l8-6-8-6zM9 4l8 6-8 6h5l8-6-8-6z"/><rect x="20" y="8.5" width="32" height="3"/><path d="M50 2l14 8-14 8z"/></svg></div></div>
</div></div></section>"""
    rock = f"""<section class="sec"><div class="wrap grid-2">
<div class="copy stack" style="gap:18px"><p class="kicker">Rock crushing</p><h2 class="h-lg">Your rock is your road base.</h2>
<p class="lede">Hill Country ground is limestone. Instead of hauling it off and trucking base back in, we crush the surface rock already on your property into a fine, compactible road base, then grade the road with proper crown and drainage.</p>
<ul class="bul"><li>No imported material to buy or haul</li><li>Lower overall project cost</li><li>Faster completion</li><li>A stronger road for trucks and heavy equipment</li></ul>
<div class="btn-row"><a class="btn btn-main" href="{url('rock-crushing')}">How rock crushing works</a><a class="btn btn-line" href="{url('roads-and-access-preparation')}">Roads &amp; access</a></div></div>
<figure class="iris" data-iris>{img("g10", "(max-width: 900px) 90vw, 560px")}<span class="iris-ring" aria-hidden="true"></span></figure>
</div></section>"""
    aud_img = {"land-developers": "g15", "commercial-real-estate": "g21", "energy-utilities": "g17", "solar": "g16", "ranchers": "g05"}
    aud = "".join(f'<a class="atile" href="{url(s)}">{img(aud_img[s], "(max-width: 700px) 100vw, 33vw")}<span class="atile-b"><b>{esc(n)}</b><span class="arrow-link">See how we help</span></span></a>' for s, n in AUDIENCES)
    serve = f"""<section class="sec"><div class="wrap"><div class="sec-head"><div><h2 class="h-lg">Who we clear for</h2><p class="lede">Developers, utilities and solar crews need volume and precision. Ranchers and landowners need someone who treats the land like their own. We do both.</p></div></div>
<div class="atiles">{aud}</div></div></section>"""
    areas = f"""<section class="sec alt"><div class="wrap map-wrap"><div class="map">{map_svg()}</div>
<div><h2 class="h-lg">Based in Spring Branch. Working across the Hill Country.</h2><p class="lede mt-s">We clear land from San Antonio to Kerrville, Blanco to New Braunfels. Pick your area for local details.</p>
<ul class="area-list mt-m">{"".join(f'<li><a href="{url(s)}">{esc(n)}<span>{esc(PAGES[s].get("city", {}).get("county", ""))}</span></a></li>' for s, n in AREA_PAGES)}</ul>
<p class="mt-m"><a class="arrow-link" href="{url('service-areas')}">All service areas</a></p></div></div></section>"""
    fam = f"""<section class="sec"><div class="wrap grid-2 fam">
<figure class="ringpic">{img("owners", "(max-width: 900px) 78vw, 480px")}<span class="seal">{glyph()}</span></figure>
<div class="copy stack" style="gap:18px"><p class="kicker">The family behind the name</p><h2 class="h-lg">Nine children. Nine values. One name.</h2>
<blockquote class="psalm">"As arrows are in the hand of a mighty man; so are children of the youth." <cite>Psalm 127:4</cite></blockquote>
<p>John and Camille Wheelock started 9 Arrow from Texas ranch roots and years of building custom homes. In 2014 a project with a developer and a surveyor put a forestry mulcher in John's hands, and it became the heart of the business. We treat every property like our own, and a job isn't finished until we're proud of it.</p>
<p><a class="arrow-link" href="{url('about-us')}">Our story and values</a></p></div></div></section>"""
    revs = (f'<figure class="review lead">{STARS}<blockquote><q>{esc(REVIEWS["zachc"][0])}</q></blockquote><figcaption class="by">{esc(REVIEWS["zachc"][1])}. Google review</figcaption></figure>'
            + "".join(f'<figure class="review">{STARS}<blockquote><q>{esc(REVIEWS[k][0])}</q></blockquote><figcaption class="by">{esc(REVIEWS[k][1])}</figcaption></figure>' for k in ("ashley", "travis", "zachp", "kenny")))
    reviews = f'<section class="sec alt"><div class="wrap"><div class="sec-head"><h2 class="h-lg">Five stars from the people we clear for.</h2></div><div class="reviews">{revs}</div></div></section>'
    faq = faq_block({"faqs": hf}, slug, "Straight answers", "What landowners and developers ask us most.")
    body = "\n".join([portal, intro, track, rock, lens(LENS_PAIRS), serve, areas, fam, reviews, faq.replace('class="sec alt"', 'class="sec"'), estimate_section("index")])
    return doc("", HOME_TITLE, HOME_DESC, body, schema("", HOME_TITLE, HOME_DESC, [("", "Home")], [faq_schema("", hf)]), og="assets/og/index.jpg", hero_preload=img_src("g00", 1600))

# ---------------------------------------------------------------- write everything
def main():
    if os.path.exists(OUT): shutil.rmtree(OUT)
    os.makedirs(OUT)
    A = os.path.join(OUT, "assets")
    if os.path.exists(os.path.join(ROOT, "build-assets/img")):
        shutil.copytree(os.path.join(ROOT, "build-assets/img"), os.path.join(A, "img"))
    shutil.copytree(os.path.join(ROOT, "build-assets/logo"), os.path.join(A, "logo"))
    if os.path.exists(os.path.join(ROOT, "build-assets/video")):
        shutil.copytree(os.path.join(ROOT, "build-assets/video"), os.path.join(A, "video"))
    if os.path.exists(os.path.join(ROOT, "build-assets/og")): shutil.copytree(os.path.join(ROOT, "build-assets/og"), os.path.join(A, "og"))
    os.makedirs(os.path.join(A, "css")); os.makedirs(os.path.join(A, "js"))
    shutil.copy(os.path.join(ROOT, "src/static/site.css"), os.path.join(A, "css/site.css"))
    shutil.copy(os.path.join(ROOT, "src/static/site.js"), os.path.join(A, "js/site.js"))
    pages = {"index": render_home(), "services": render_services_hub(), "service-areas": render_areas_hub(), "about-us": render_about(),
             "faq": render_faq(), "get-an-estimate": render_estimate(), "contact": render_contact(), "our-work": render_our_work(),
             "blog": render_blog_index(), "privacy-policy": legal("privacy-policy", "Privacy Policy"),
             "terms-and-conditions": legal("terms-and-conditions", "Terms & Conditions"), "thanks": render_thanks(), "404": render_404()}
    for s in PAGES:
        if s not in pages: pages[s] = render_standard(s)
    for s in POSTS: pages[s] = render_post(s)
    for s, h in pages.items():
        open(os.path.join(OUT, s + ".html"), "w").write(h)
    urls = [s for s in pages if s not in ("thanks", "404")]
    sm = "".join(f"<url><loc>{canon(s if s != 'index' else '')}</loc><lastmod>{TODAY}</lastmod></url>" for s in sorted(urls, key=lambda x: (x != "index", x)))
    open(os.path.join(OUT, "sitemap.xml"), "w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sm}</urlset>\n')
    open(os.path.join(OUT, "robots.txt"), "w").write(
        "# Search engines and AI answer engines are welcome.\nUser-agent: *\nAllow: /\nDisallow: /thanks\n\n"
        "User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\n"
        "User-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nSitemap: https://www.9arrow.com/sitemap.xml\n")
    llm = ["# 9 Arrow Land Service", "", "> " + ENTITY, "", f"Phone: {PHONE}. Email: {EMAIL}. Based in Spring Branch, TX.", "", "## Services"]
    llm += [f"- [{n}]({canon(s)}): {b}." for s, n, b in SERVICES]
    llm += ["", "## Service areas"] + [f"- [{area_label(s)}]({canon(s)})" for s in sorted(p for p in PAGES if PAGES[p]["type"] == "city")]
    llm += ["", "## Guides"] + [f"- [{POSTS[s]['h1']}]({canon(s)})" for s in POSTS]
    llm += ["", "## Company", f"- [About the family]({canon('about-us')})", f"- [FAQ]({canon('faq')})", f"- [Get an estimate]({canon('get-an-estimate')})"]
    open(os.path.join(OUT, "llms.txt"), "w").write("\n".join(llm) + "\n")
    if MODE == "prod":
        shutil.copy(os.path.join(ROOT, "deploy/netlify.toml"), os.path.join(OUT, "netlify.toml"))
        shutil.copytree(os.path.join(ROOT, "deploy/netlify"), os.path.join(OUT, "netlify"))
    print(f"{MODE}: {len(pages)} pages -> {OUT}")

if __name__ == "__main__":
    main()
