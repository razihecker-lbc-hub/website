repo: razihecker-lbc-hub/website
branch: main

## Last sync
date: 2026-09-15T22:30:00Z
note: local-only changes since last sync. Site Footer.dc.html was DELETED and merged into League Bound Site.dc.html; do not re-upload it. International Students.dc.html was RENAMED to International College.dc.html; delete the old one on upload.

### Updated in this project
- Mobile (<=640px) fixes on the International page: hero photo scrims lightened, route reads "Shanghai -> Cambridge", stat card in the "best year" section no longer forces horizontal scroll; section title is now "How we help you stand out"
- International page split out as its own entry file, International College.dc.html, served at /international/college. It carries its own SEO head block. The <base href="/"> is now injected by a tiny inline script only when location.pathname starts with /international, so the file also previews locally
- /international and /international-students now 301 to /international/college
- International page hides the site nav; the logo links to / instead of switching views
- Footer merged into the main file. Its styles are scoped under [data-site-footer] and live in the main helmet; Site Footer.dc.html no longer exists
- New ad landing pages behind LANDINGS: /law-school-essays, /international-students, /john-locke-essay, /transfer-essays, /summer-programs, /mba-admissions
- Law page fronts Mia G (mlp/videos/mia-law.mp4) with Maayan and Razi as consultants, plus an annotated "Essays that worked" card
- International page fronts Johnny and Kian videos, Amitai and Razi as consultants, and a two-tab essay card (Keith Y / NYU, K. Y. / Northwestern)

## Known gaps
- Law hero still uses assets/hero-princeton-library.jpg as a placeholder. Razi is supplying a Mia photo to replace it.
- No NYU logo in mlp/schools; the NYU essay card uses a purple wordmark instead.
- `Elmayat.html` (Almaya page) exists only in the repo. The main file iframes `src="Elmayat.html"`; never export a placeholder over it.
- `support.js` points at unpkg on export; the repo keeps the /vendor repoint (lbc-website skill step 2 re-applies it).
- The head SEO block lives in the main file's static <head>; a full regenerate would drop it.

## Screen map
| Screen | Built from |
| --- | --- |
| Home, Services, Results, Resources, Team, Grad, Footer | League Bound Site.dc.html |
| Law / John Locke / Transfer / Summer / MBA landings | League Bound Site.dc.html (LANDINGS const) |
| International Students (/international/college) | International College.dc.html (entry) + League Bound Site.dc.html (LANDINGS.international) |
| Almaya Admissions | Elmayat.html (repo only, served at /almaya) |
| Design tokens & components | _ds/league-bound-consulting-design-system-a808bf68-.../ |
| Photography, book covers, logos | assets/ |
| School logos, team photos, testimonial video | mlp/ |
