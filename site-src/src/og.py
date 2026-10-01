"""Render a 1200x630 share image for every page (assets/og/<slug>.jpg)."""
import os, sys, base64, subprocess, time, re, html
sys.argv = [sys.argv[0], "prod"]
sys.path.insert(0, os.path.dirname(__file__))
import build as B
from playwright.sync_api import sync_playwright
ROOT = B.ROOT; OUT = os.path.join(ROOT, "build-assets/og"); os.makedirs(OUT, exist_ok=True)
FONTCSS = "/tmp/claude-0/-home-claude/873aca4c-6f3a-5026-a05e-472473fd9e5b/scratchpad/fonts/local.css"
def b64(p): return base64.b64encode(open(p, "rb").read()).decode()
fonts = ""
for fam, w, f in [("Zilla Slab", 700, "zilla-slab/files/zilla-slab-latin-700-normal.woff2"), ("Libre Franklin", 500, "libre-franklin/files/libre-franklin-latin-500-normal.woff2")]:
    fonts += f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{b64('/tmp/claude-0/-home-claude/873aca4c-6f3a-5026-a05e-472473fd9e5b/scratchpad/fonts/node_modules/@fontsource/' + f)})}}"
lock = b64(os.path.join(ROOT, "build-assets/logo/lockup-light.svg"))
topo = b64(os.path.join(ROOT, "build-assets/img/topo-dark.svg"))
jobs = {"index": ("Land clearing, forestry mulching &amp; rock crushing in Central Texas", "g00")}
for s, p in B.PAGES.items():
    t = p["type"]
    if t == "service": title = B.SVC_NAME.get(s, p["nav_label"]) + " in Central Texas"
    elif t == "city": title = B.area_label(s) + ("" if "Hill Country" in B.area_label(s) else ", TX")
    elif s == "about-us": title = "A family-owned land clearing company from Spring Branch"
    else: title = p["h1"]
    jobs[s] = (html.escape(title), B.hero_key(s, p))
for s, m in B.POSTS.items(): jobs[s] = (html.escape(m["h1"]), B.PHOTO.get(m.get("hero_photo"), "g02"))
jobs["blog"] = ("Land clearing guides for Central Texas", "g02")
for s in ("privacy-policy", "terms-and-conditions"): jobs[s] = ("9 Arrow Land Service", "g19")
def page(title, key):
    img = b64(os.path.join(ROOT, f"build-assets/img/{key}-960.webp"))
    size = 60 if len(title) < 40 else 50 if len(title) < 70 else 42
    return f"""<html><head><style>{fonts}*{{margin:0;box-sizing:border-box}}body{{width:1200px;height:630px;background:#0C1906;position:relative;overflow:hidden;font-family:'Libre Franklin'}}
.topo{{position:absolute;inset:0;background:url(data:image/svg+xml;base64,{topo}) center/1400px}}
.l{{position:absolute;left:64px;top:58px;width:560px;height:514px;display:flex;flex-direction:column;justify-content:space-between}}
.l img{{width:230px}} h1{{font:700 {size}px/1.08 'Zilla Slab';color:#fff;letter-spacing:-.5px}} p{{color:#A2AD9D;font-size:22px}}
.ring{{position:absolute;left:676px;top:52px;width:526px;height:526px;border-radius:50%;border:4px solid #E8EBE7;padding:14px}}
.ring div{{width:100%;height:100%;border-radius:50%;background:url(data:image/webp;base64,{img}) center/cover}}</style></head>
<body><div class="topo"></div><div class="l"><img src="data:image/svg+xml;base64,{lock}"><h1>{title}</h1><p>(210) 247-8410 &nbsp;&nbsp; 9arrow.com</p></div><div class="ring"><div></div></div></body></html>"""
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1200, "height": 630})
    for s, (t, k) in jobs.items():
        pg.set_content(page(t, k)); pg.wait_for_timeout(120)
        pg.screenshot(path=os.path.join(OUT, f"{s}.jpg"), type="jpeg", quality=82)
    b.close()
print(len(jobs), "share images")
