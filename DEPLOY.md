# Deploying kalpikolabs.com

This is a pure static site (HTML/CSS/vanilla JS, no build step). GitHub Pages
serves the repository root as-is.

Host account/org: **kalpikolabs** → Pages origin `kalpikolabs.github.io`.

---

## 1. Push to GitHub

From the project root:

```bash
git init                       # if not already a repo
git add .
git commit -m "Launch kalpikolabs.com static site"
git branch -M main
git remote add origin https://github.com/kalpikolabs/kalpikolabs.github.io.git
git push -u origin main
```

> The repo can be named anything, but `kalpikolabs.github.io` is convenient.
> The `CNAME` file (containing `kalpikolabs.com`) is already committed — keep it
> at the repo root; GitHub Pages reads it to bind the custom domain.

## 2. Enable Pages

GitHub → repo → **Settings → Pages**:

- **Source:** *Deploy from a branch*
- **Branch:** `main` · **Folder:** `/ (root)`
- Save. The first build publishes in ~1 minute at
  `https://kalpikolabs.github.io/`.

## 3. Custom domain

Still in **Settings → Pages → Custom domain**:

- Enter `kalpikolabs.com` and Save. (This re-writes the `CNAME` file — it already
  matches, so nothing changes.)
- GitHub will show "DNS check in progress" until the records below resolve.

## 4. DNS records at GoDaddy

GoDaddy → **My Products → Domain → DNS → Manage Zones** for `kalpikolabs.com`.

Add the **apex (root) A records** pointing at GitHub Pages' four IPs:

| Type | Name | Value           | TTL  |
|------|------|-----------------|------|
| A    | @    | 185.199.108.153 | 600  |
| A    | @    | 185.199.109.153 | 600  |
| A    | @    | 185.199.110.153 | 600  |
| A    | @    | 185.199.111.153 | 600  |

Add the **www subdomain** as a CNAME to the Pages origin:

| Type  | Name | Value                      | TTL  |
|-------|------|----------------------------|------|
| CNAME | www  | kalpikolabs.github.io      | 600  |

Notes:
- Delete any pre-existing parked/forwarding A or CNAME records on `@`/`www`
  (GoDaddy adds these by default) or they will conflict.
- Do **not** add a trailing dot in GoDaddy's value field; it appends the domain
  automatically.
- (Optional, recommended) Add the IPv6 AAAA records too for completeness:
  `2606:50c0:8000::153`, `…8001::153`, `…8002::153`, `…8003::153` on `@`.

DNS can take from a few minutes up to ~1 hour to propagate. Check with:

```bash
dig +short kalpikolabs.com
dig +short www.kalpikolabs.com
```

You should see the four GitHub IPs for the apex and `kalpikolabs.github.io` for www.

## 5. Enforce HTTPS

Once GitHub finishes provisioning the TLS certificate (Settings → Pages shows a
green check, usually within an hour of DNS resolving):

- Tick **Enforce HTTPS**.

This redirects all `http://` traffic to `https://` and makes `www` →apex (or
apex→www, per your chosen primary) canonical.

---

## Post-deploy checklist

- [ ] `https://kalpikolabs.com/` loads with the hero orbit animating once.
- [ ] `https://kalpikolabs.com/support/` shows the support email above the fold
      (this URL goes in App Store Connect → Support URL).
- [ ] Each app's `/privacy/` and `/terms/` URLs resolve over HTTPS
      (these go in App Store Connect, Play Data Safety, and the in-app paywall).
- [ ] A random bad path (e.g. `/nope`) serves the branded 404.
- [ ] `https://kalpikolabs.com/sitemap.xml` and `/robots.txt` load.
- [ ] **Enforce HTTPS** is enabled.

## Before this is production-real (placeholders to replace)

- Brand assets: real `mark-on-light.svg`, `lockup-transparent-dark.svg`,
  `favicon-{16,32,180,192,512}.png`, `og-lockup.png`, app icon.
- Real app screenshots (replace the placeholder SVGs) **and** a raster
  `og:image` (SVG OG images don't unfurl on most platforms).
- Official Apple/Google store badges + real store URLs (uncomment the badge row
  on the product page).
- Real footer social URLs (GitHub/X/Instagram `href="#"` placeholders).
- **Terms §3 subscription copy** must match the RevenueCat paywall word-for-word
  (plan names, prices, trial) before the paywall links to it.
- Confirm the privacy policy matches the actual App Store privacy labels and
  Google Play Data Safety declarations.
