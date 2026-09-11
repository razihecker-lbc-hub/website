repo: razihecker-lbc-hub/website
branch: main
path: (repo root)

## Deploy
Netlify project `league-bound` (site id `1b813fc1-4ec0-4b51-9607-1c8feed54bb2`) builds
this repo on every push to `main`. No build command; publish directory is the repo root.
Live at https://leagueboundconsulting.com. A commit is live in about twenty seconds.
Root URL rewrites to `League Bound Site.dc.html` via `_redirects`.

## Last sync
date: 2026-09-11
commit: international landing page split into its own entry file

### Updated in this sync
- New file **`International College.dc.html`**, served at `/international/college`. It has
  its own `<head>` (title, description, canonical, OG/Twitter tags) and no site nav — the
  logo links back to `/`. It carries `<base href="/">`, required because the Netlify 200
  rewrite serves it from a nested path; without it every `assets/`/`mlp/` reference
  resolves under `/international/` and 404s. The page body still renders from
  `League Bound Site.dc.html` via its `LANDINGS.international` entry, so both files are
  needed.
- Deleted **`International Students.dc.html`** — renamed upstream to
  `International College.dc.html`; the old file would otherwise linger and serve a stale
  duplicate.
- `_redirects` gained standalone rules for the international page: `/international/college`
  (200, serves the new entry file), and `/international` and `/international-students`
  (301, both to `/international/college`). They sit above the catch-all.
- Main file content: hero photo composition/scrims on the international page, scroll-reveal
  animation on its four service cards, testimonial captions now read
  "Johnny · Columbia Class of '29" and "Kian · Northwestern Class of '30", and two
  side-by-side quotes replacing one.
- Testimonial videos re-encoded again (CRF 32, 720p max): `kian.mp4` 13.2MB → 2.45MB,
  plus charvi/johnny/mia/moshe-urology/sam/shivank/tanya.
- Dropped three orphaned images no longer referenced by the main file:
  `assets/books/successful-essays-cornell.png`, `assets/books/successful-essays-stanford-yale.png`,
  `assets/footer-desk.jpg`.

## IMPORTANT — this repo is not a raw export
Four changes are applied on top of what the design system emits. A fresh export overwrites
some of them, so they have to be re-applied every time. The `lbc-website` Cowork skill
automates all four.

1. `Almaya Admissions.html` is renamed to **`Elmayat.html`**, because the main page
   iframes `src="Elmayat.html"`. Without the rename that section renders blank. (Not every
   export ships an Almaya file — when one isn't present, this repo's existing `Elmayat.html`
   is left alone.)
2. `support.js` is repointed from unpkg.com to **`/vendor/`** for react, react-dom and
   @babel/standalone. Loading the site's entire runtime from a third-party CDN means an
   unpkg outage shows visitors a blank page. The vendored files are byte-identical, so the
   existing SRI hashes still validate.
3. The `<head>` carries a hand-added **SEO and social block** (title, description,
   canonical, favicon, OpenGraph, Twitter) plus `lang="en"`. Recent exports have started
   emitting this themselves (Razi pushed the fix upstream into the Claude Design project),
   but re-check it after every export in case a regenerate drops it. `International
   College.dc.html` carries its own equivalent block plus the `<base href="/">` tag — same
   convention, same care needed.
4. **Media is compressed for the web.** Exports ship print-resolution sources; this repo
   carries JPEGs at 2000px/q82, opaque PNGs converted to JPEG (PNGs with real transparency,
   like the book covers, are left alone), and video at 720p CRF 32.

`uploads/` is gitignored — it holds the design tool's raw source material and is never
served. `screenshots/`, `.thumbnail`, and the design system's non-served files (`README.md`,
`_adherence.oxlintrc.json`, `_ds_manifest.json`, `slides/slides.css` under `_ds/`) are
dropped the same way.

## Screen map
| Screen | Built from |
| --- | --- |
| Home, Services, Results, Resources, Team, Grad | League Bound Site.dc.html |
| International Students (/international/college) | International College.dc.html (entry) + League Bound Site.dc.html (LANDINGS.international) |
| Almaya Admissions | Elmayat.html (served at /almaya) |
| Design tokens & components | _ds/league-bound-consulting-design-system-a808bf68-.../ |
| Photography, book covers, logos | assets/ |
| School logos, team photos, testimonial video | mlp/ |
| React / Babel runtime | vendor/ |

## Known gaps (carried from the design project)
- Law page hero still uses `assets/hero-princeton-library.jpg` as a placeholder.
- No NYU logo in `mlp/schools`; NYU-related essay cards use a purple wordmark instead.
- Other ad landing pages (`law-school-essays`, `john-locke-essay`, `transfer-essays`,
  `summer-programs`, `mba-admissions`) exist as views inside `League Bound Site.dc.html`'s
  `LANDINGS` const and render through the existing catch-all `_redirects` rule — they don't
  have their own entry file or SEO head yet, unlike the international page. The design
  project also exports thin per-screen preview wrappers for these (e.g.
  `Law School Essays.dc.html`) that are Claude Design artboards, not served pages — they
  are intentionally not part of this repo, same as `uploads/`.
