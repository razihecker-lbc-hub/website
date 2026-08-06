repo: razihecker-lbc-hub/website
branch: main
path: (repo root)

## Deploy
Netlify project `league-bound` (site id `1b813fc1-4ec0-4b51-9607-1c8feed54bb2`) builds
this repo on every push to `main`. No build command; publish directory is the repo root.
Live at https://leagueboundconsulting.com. A commit is live in about twenty seconds.
Root URL rewrites to `League Bound Site.dc.html` via `_redirects`.

## Last sync
date: 2026-08-06
commit: white link-preview card

### Updated in this sync
- Link preview card on white (`assets/og-card-white.jpg`), replacing the navy version
- Testimonial video re-encoded again: 30.4MB to 15.6MB (720p max, CRF 32, mono audio)
- `/almaya` now points at `Elmayat.html` rather than the pre-rename filename
- Custom domain live with HTTPS; apex and www both on Netlify

## IMPORTANT — this repo is not a raw export
Four changes are applied on top of what the design system emits. A fresh export overwrites
three of them, so they have to be re-applied every time. The `lbc-website` Cowork skill
automates all four.

1. `Almaya Admissions.html` is renamed to **`Elmayat.html`**, because the main page
   iframes `src="Elmayat.html"`. Without the rename that section renders blank.
2. `support.js` is repointed from unpkg.com to **`/vendor/`** for react, react-dom and
   @babel/standalone. Loading the site's entire runtime from a third-party CDN means an
   unpkg outage shows visitors a blank page. The vendored files are byte-identical, so the
   existing SRI hashes still validate.
3. The `<head>` carries a hand-added **SEO and social block** (title, description,
   canonical, favicon, OpenGraph, Twitter) plus `lang="en"`. The export emits none of it.
   It is marked with a comment so it is obvious what will be lost.
4. **Media is compressed for the web.** Exports ship print-resolution sources; this repo
   carries JPEGs at 2000px/q82, opaque PNGs converted to JPEG, and video at 720p CRF 32.
   206MB of export becomes about 36MB.

`uploads/` is gitignored — it holds the design tool's raw source material and is never
served.

## Screen map
| Screen | Built from |
| --- | --- |
| Home, Services, Results, Resources, Team, Grad | League Bound Site.dc.html |
| Almaya Admissions | Elmayat.html (served at /almaya) |
| Design tokens & components | _ds/league-bound-consulting-design-system-a808bf68-.../ |
| Photography, book covers, logos | assets/ |
| School logos, team photos, testimonial video | mlp/ |
| React / Babel runtime | vendor/ |
