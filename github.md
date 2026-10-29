repo: razihecker-lbc-hub/website
branch: main

## Last sync
date: 2026-10-29T00:00:00Z
note: upload-thankyou/ holds the thank-you page release. Do not upload support.js or International College.dc.html from this project (the repo copies are newer).

### Updated in this project
- New post-booking page at /thank-you-league-bound-consulting/ (Thank You.dc.html + LANDINGS.thanks)
- Calendly event details (name, time, host) shown on the thank-you page
- Danya's law school label corrected to "Law School Applicant"
- Kian videos removed; Jo-An renamed Ju-Li-A

## Known gaps
- assets/shanghai-skyline.jpg (9 MB) and assets/international-flags.jpg (6.7 MB) are heavy; compress before or after pushing.
- mlp/videos/*.mp4 are referenced but binaries can't be verified from here; confirm they exist in the repo.
- Almaya removed from the site (Oct 2026). Delete `Elmayat.html` from the repo; /almaya and /elmayat 301 to the homepage.
- `support.js` keeps the /vendor repoint in the repo.

## Screen map
| Screen | Built from |
| --- | --- |
| Home, Services, Results, Resources, Team, Grad, Footer | League Bound Site.dc.html |
| Law / John Locke / Transfer / Summer / MBA / Founding Strategy / College Essays landings | League Bound Site.dc.html (LANDINGS const) |
| International Students (/international/college) | International College.dc.html (entry) + League Bound Site.dc.html (LANDINGS.international) |
| Thank You (/thank-you-league-bound-consulting/) | Thank You.dc.html (entry) + League Bound Site.dc.html (LANDINGS.thanks) |
| Photography, book covers, logos | assets/ |
| School logos, team photos, testimonial video | mlp/ |
