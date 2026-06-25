# 9 Arrow — Campaign Tracking Links (UTMs)

Put UTMs ONLY on links that point to the site from somewhere else (social bios, ads, email,
print/QR codes). Never add UTMs to the site's own internal navigation — it resets analytics sessions.

Base site: https://www.9arrow.com/

## Homepage, by channel
| Channel | Link |
|---|---|
| Instagram bio | https://www.9arrow.com/?utm_source=instagram&utm_medium=social&utm_campaign=profile |
| Facebook | https://www.9arrow.com/?utm_source=facebook&utm_medium=social&utm_campaign=profile |
| LinkedIn | https://www.9arrow.com/?utm_source=linkedin&utm_medium=social&utm_campaign=profile |
| Google Business Profile | https://www.9arrow.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp |
| Email signature | https://www.9arrow.com/?utm_source=email&utm_medium=signature&utm_campaign=outreach |
| Truck / yard-sign QR | https://www.9arrow.com/?utm_source=qr&utm_medium=print&utm_campaign=truck-decal |

## Straight to the estimate form (best for ads & "link in bio")
| Source | Link |
|---|---|
| Instagram → estimate | https://www.9arrow.com/get-an-estimate?utm_source=instagram&utm_medium=social&utm_campaign=estimate |
| Facebook/IG Ads → estimate | https://www.9arrow.com/get-an-estimate?utm_source=facebook&utm_medium=paid_social&utm_campaign=estimate |
| Google Ads → estimate | https://www.9arrow.com/get-an-estimate?utm_source=google&utm_medium=cpc&utm_campaign=estimate |

## What the parameters mean
- **utm_source** — where it came from (instagram, google, email)
- **utm_medium** — the type (social, cpc, paid_social, email, print, organic)
- **utm_campaign** — the initiative (profile, estimate, launch, spring-promo)

These appear in **GA4 → Acquisition → Traffic acquisition** and in **HubSpot → Sources** and on each
contact record. Build more with Google's Campaign URL Builder (ga-dev-tools.google/campaign-url-builder).
