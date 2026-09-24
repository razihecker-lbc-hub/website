repo: razihecker-lbc-hub/website
branch: main

## Last sync
date: 2026-09-24T19:36:00Z
note: push/ holds only what changed since the 2026-09-15 sync. Do not upload support.js or International College.dc.html from this project (the repo copies are newer).

### Updated in this project
- Mobile heroes reworked on Summer Programs, Founding Strategy and College Essays
- Brand tokens and fonts inlined in the main file (no longer depends on colors_and_type.css loading)
- Duplicate landing blocks (items, booking, books) merged into one copy each, positioned with CSS order
- 16 new images under assets/ (MIT dome, Memorial Hall, v2 service photos, UC booklet, etc.)

## Known gaps
- assets/shanghai-skyline.jpg (9 MB) and assets/international-flags.jpg (6.7 MB) are heavy; compress before or after pushing.
- mlp/videos/*.mp4 are referenced but binaries can't be verified from here; confirm they exist in the repo.
- `Elmayat.html` exists only in the repo. Never export a placeholder over it.
- `support.js` keeps the /vendor repoint in the repo.

## Screen map
| Screen | Built from |
| --- | --- |
| Home, Services, Results, Resources, Team, Grad, Footer | League Bound Site.dc.html |
| Law / John Locke / Transfer / Summer / MBA / Founding Strategy / College Essays landings | League Bound Site.dc.html (LANDINGS const) |
| International Students (/international/college) | International College.dc.html (entry) + League Bound Site.dc.html (LANDINGS.international) |
| Almaya Admissions | Elmayat.html (repo only, served at /almaya) |
| Photography, book covers, logos | assets/ |
| School logos, team photos, testimonial video | mlp/ |
