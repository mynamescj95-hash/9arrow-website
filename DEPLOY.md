# Publishing the 9 Arrow site on GitHub Pages

The site is a plain static site (HTML/CSS/JS, no build step) and is already a git
repository with full history. Every link is relative, so it works at a root domain
or under a project path. Pick one path below.

## Easiest path — GitHub Desktop (no command line)
1. Make a free account at https://github.com if you don't have one.
2. Download GitHub Desktop: https://desktop.github.com
3. File -> Add Local Repository, choose the unzipped `9arrow-website` folder
   (it's already a git repo, so it'll be recognized).
4. Click "Publish repository". Name it `9arrow-website`, keep it Public, publish.
   This creates the new GitHub project and uploads everything.
5. On github.com open the repo -> Settings -> Pages:
   - Source: Deploy from a branch
   - Branch: main / (root) -> Save
6. Wait ~1 minute. Your live URL appears at the top, e.g.
   https://YOUR-USERNAME.github.io/9arrow-website/

## Command-line path (if you use git)
    cd 9arrow-website
    # create an EMPTY repo named 9arrow-website on github.com first, then:
    git remote add origin https://github.com/YOUR-USERNAME/9arrow-website.git
    git push -u origin main
Then: Settings -> Pages -> Deploy from a branch -> main / root -> Save.

## Using the real domain (www.9arrow.com)
1. Settings -> Pages -> Custom domain -> enter www.9arrow.com -> Save.
2. At your DNS, add a CNAME record: www -> YOUR-USERNAME.github.io
3. Tick "Enforce HTTPS" once the certificate issues.

URL note: GitHub Pages serves pages with a .html extension (/land-clearing.html),
while your HubSpot URLs are extensionless (/land-clearing). The site works perfectly
as-is. To make live URLs match HubSpot exactly (no .html, zero redirects), ask me to
"restructure to clean URLs" and I'll convert each page to a folder (/land-clearing/)
with root-absolute asset paths before you flip the domain.

## What's in here
- 52 pages, assets/ (css/js/images + 3 gated PDF guides in assets/downloads/)
- .nojekyll (serve files as-is), 404.html (auto error page), sitemap.xml, README.md
- Lead capture: add HubSpot Portal ID + Form GUID in assets/js/main.js (see README)
- Analytics: paste HubSpot/GA4 tracking code before </body>
