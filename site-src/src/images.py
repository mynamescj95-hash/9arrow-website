"""Image pipeline: every image the site uses becomes responsive WebP (480 / 960 / 1600 wide).

Generated scenes live in gen/gNN.webp (2048px masters from Higgsfield). Until a master exists the
pipeline falls back to the closest repo photo so pages can be built and checked.
Real photos kept on purpose: John & Camille, plus genuine job photos used only where the page says
"real job photos" (before/after lens and the Our Work gallery).
"""
import json, os, sys
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.join(ROOT, "real", "legacy") + "/"
GEN = os.path.join(ROOT, "gen")
OUT = os.path.join(ROOT, "build-assets", "img")
os.makedirs(OUT, exist_ok=True)

# key: (gen file or None, repo fallback, alt text)
GENERATED = {
    "g00": ("Tracked forestry mulcher clearing cedar and live oak in the Texas Hill Country", "vista.jpg"),
    "g01": ("Forestry mulcher drum grinding a cedar tree at its base", "forestry-mulching-canyon-lake-tx.jpg"),
    "g02": ("Cleared Hill Country acreage with a fine mulch finish under live oaks", "land-developers-hero.jpg"),
    "g03": ("Dense Ashe juniper cedar brake on a limestone hillside with a mulcher at the edge", "forestry-mulching-texas-hill-country.jpg"),
    "g04": ("Overgrown brushy lot with mesquite and cedar being cleared by a track loader mulcher", "brush-removal-hero.jpg"),
    "g05": ("Reclaimed ranch pasture with live oaks and a cleared fence line", "cedar-gallery-2.jpg"),
    "g06": ("Cleared hilltop home site with a crushed limestone building pad and survey stakes", "grounds-maintenance-g3.jpg"),
    "g07": ("Aerial view of a straight survey line cleared through cedar and oak woodland", "land-clearing-spring-branch-tx.jpg"),
    "g08": ("Aerial view of a cleared power line right-of-way through Hill Country woodland", "svc-row.jpg"),
    "g09": ("Freshly graded crushed limestone ranch road with crown and drainage ditches", "roads-after.jpg"),
    "g10": ("Track loader with a rock crusher attachment turning surface limestone into road base", "roads-before.jpg"),
    "g11": ("Excavator trenching rocky soil with waterline pipe laid beside the trench", "svc-sitework.jpg"),
    "g12": ("Tractor with a batwing shredder mowing a Central Texas pasture", "svc-grounds.jpg"),
    "g13": ("Fine toothpick-size mulch finish on cleared ground", "home-svc-roads.jpg"),
    "g14": ("Articulated wheeled forestry mulcher working across open mesquite pasture", "home-svc-cedar.jpg"),
    "g15": ("Aerial view of Hill Country land with cleared street corridors and lot lines for a subdivision", "commercial-real-estate-hero.jpg"),
    "g16": ("Large cleared and mowed site prepared for a solar farm", "solar-gallery-1.jpg"),
    "g17": ("Cleared pipeline right-of-way corridor through mesquite and brush country", "ranchers-hero.jpg"),
    "g18": ("Hill Country river lined with bald cypress and limestone banks", "mulch-after.jpg"),
    "g19": ("Rolling Texas Hill Country at sunset with cedar, oak and a ranch fence", "land-clearing-wimberley-tx.jpg"),
    "g20": ("Hill Country lake surrounded by steep cedar-covered limestone hills", "grounds-maintenance-g3.jpg"),
    "g21": ("Brushy acreage at the edge of a growing South Texas city", "blog-1.jpg"),
    "g22": ("Crew member sharpening the carbide teeth of a forestry mulcher drum", "energy-gallery-1.jpg"),
    "g23": ("Bulldozer pushing out a cedar root ball on a building site", "solar-hero.jpg"),
    "g24": ("Hill Country creek with limestone ledges and cypress trees", "mulch-after.jpg"),
    "g25": ("Hill Country river valley ranch land with live oaks", "blog-3.jpg"),
    "g26": ("Hill Country ranch pasture with a windmill and stock tank", "ranch-pasture-clearing-hero.jpg"),
    "g27": ("Rural acreage home site under live oaks with the understory opened up", "cedar-removal-spring-branch-tx.jpg"),
    "g28": ("Aerial view of Hill Country woodland, pasture and a winding river", "work-17.jpg"),
    "g29": ("Track loader mulcher grinding an old brush pile of dead cedar", "ba-before.jpg"),
    "g30": ("Hill Country hillside after selective cedar removal with live oaks kept", "land-after.jpg"),
    "g31": ("Crushing head grinding surface limestone into road base on a Hill Country road", "roads-before.jpg"),
    "g32": ("Graded road with a crowned surface and a drainage ditch along the edge", "roads-after.jpg"),
}
RD = os.path.join(ROOT, "real") + "/"
REAL = {
    # real 9 Arrow photography (pro shoot + client photos)
    "r-hero": ("9 Arrow forestry mulcher working toward the camera through dust and morning light", "SAG18919.jpg"),
    "r-haze": ("9 Arrow mulcher working in hazy light under the trees", "SAG18923.jpg"),
    "r-trail-cat": ("9 Arrow track loader cutting a clean lane through Central Texas woods", "SAG18937.jpg"),
    "r-blue": ("9 Arrow forestry mulcher working through dense woodland", "SAG18957.jpg"),
    "r-head": ("9 Arrow mulcher head grinding brush and small trees in place", "SAG19048.jpg"),
    "r-tire": ("Close view of a 9 Arrow articulated mulcher and its mulching head in the brush", "SAG19049.jpg"),
    "r-head-tall": ("9 Arrow mulcher head working into brush", "SAG19052.jpg"),
    "r-mulch": ("Fine mulch finish left by 9 Arrow forestry mulching", "SAG19103.jpg"),
    "r-trail": ("Mulched lane through the woods after 9 Arrow land clearing", "SAG19107.jpg"),
    "r-fleet": ("9 Arrow forestry mulchers and crew trucks lined up on a job site", "SAG19110.jpg"),
    "r-red-truck": ("9 Arrow articulated forestry mulcher and crew truck", "SAG19116.jpg"),
    "r-sharpen": ("9 Arrow crew member sharpening the teeth on a mulcher head", "IMG_5363.jpg"),
    "r-john-machine": ("John Wheelock with one of the 9 Arrow forestry mulchers", "IMG_9264.jpg"),
    "r-utv": ("9 Arrow crew driving a UTV across a job site", "IMG_0139.jpg"),
    "r-yellow": ("Large yellow articulated forestry mulcher clearing brush on a 9 Arrow job", "land-dev-1.png"),
    "r-yellow-2": ("9 Arrow articulated mulcher grinding brush on a Central Texas property", "ref-E377.jpg"),
    "r-yellow-3": ("9 Arrow articulated mulcher clearing a wooded lot", "ref-3929.jpg"),
    "r-yellow-head": ("Mulching head on a 9 Arrow articulated machine", "ref-55A9.jpg"),
    "r-operator": ("9 Arrow operator with a yellow forestry mulcher", "ref-1E57.jpg"),
    "r-owners": ("John and Camille Wheelock, founders of 9 Arrow Land Service", "owners-png.png"),
    "r-owners-gold": ("John and Camille Wheelock at sunset", "owners-png2.png"),
    "r-oaks": ("Cleared woodland under live oaks with green grass coming back", "bulverde-png.png"),
    "r-bw": ("9 Arrow crew member working on a mulching head", "land-service-webp.webp"),
    # real before/after pairs from the old site library
    "trail-before": ("Brushy trail before 9 Arrow forestry mulching", "R:ba-home-before.jpg"),
    "trail-after": ("The same trail after 9 Arrow forestry mulching", "R:ba-home-after.jpg"),
    "rock-before": ("Loose limestone surface rock before on-site rock crushing", "R:roads-before.jpg"),
    "rock-after": ("Road surface built from rock crushed on site by 9 Arrow", "R:roads-after.jpg"),
}
WIDTHS = (480, 960, 1600, 2400)  # 2400 only for masters wider than 1600 (Retina laptops, phone heroes)


def source(key):
    if key in GENERATED:
        p = os.path.join(GEN, key + ".webp")
        if os.path.exists(p):
            return p, True
        return REPO + GENERATED[key][1], False
    f = REAL[key][1]
    return (REPO + f[2:] if f.startswith("R:") else RD + f), False


def grade(im, generated):
    # One light, consistent finish so every picture sits in the same family:
    # a touch less saturation, a little contrast. Generated masters are already graded softly.
    if generated:
        return ImageEnhance.Color(im).enhance(0.94)
    im = ImageEnhance.Color(im).enhance(0.9)
    return ImageEnhance.Contrast(im).enhance(1.04)


def build(force=False):
    manifest = {}
    for key, meta in list(GENERATED.items()) + list(REAL.items()):
        src, gen = source(key)
        alt = meta[0]
        stamp = os.path.getmtime(src)
        im = Image.open(src).convert("RGB")
        im = grade(im, gen)
        W, H = im.size
        sizes = []
        for w in WIDTHS:
            ww = min(w, W)
            out = os.path.join(OUT, f"{key}-{w}.webp")
            if force or not os.path.exists(out) or os.path.getmtime(out) < stamp:
                im.resize((ww, round(H * ww / W)), Image.LANCZOS).save(out, "WEBP", quality=76, method=6)
            sizes.append(w)
            if w >= W:
                break
        manifest[key] = {"w": W, "h": H, "sizes": sizes, "alt": alt, "generated": gen}
    json.dump(manifest, open(os.path.join(ROOT, "build-assets", "images.json"), "w"), indent=1)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"{len(manifest)} images, {sum(1 for m in manifest.values() if m['generated'])} generated masters, {total//1024} KB total")


if __name__ == "__main__":
    build(force="--force" in sys.argv)
