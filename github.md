repo: razihecker-lbc-hub/website
branch: main
path: (repo root)

## Deploy
Netlify project `league-bound` (site id `1b813fc1-4ec0-4b51-9607-1c8feed54bb2`)
builds this repo on every push to `main`. No build command; publish directory is
the repo root. Root URL rewrites to `League Bound Site.dc.html` via `_redirects`.

## Last sync
date: 2026-08-06
commit: initial import

### Updated in this sync
- Initial import of the League Bound marketing site
- Almaya Admissions page bundled as `Almaya Admissions.html`, served at `/almaya`
- `_redirects` rewrites `/` to the site page and returns real 404s for missing
  assets instead of masking them with the HTML page
- `netlify.toml` caches `assets/`, `mlp/` and `_ds/` immutably, HTML revalidates
- `uploads/` gitignored and 26 unreferenced images dropped (281MB to 203MB)
- `README.md` added documenting the edit-and-commit workflow

## Screen map
| Screen | Built from |
| --- | --- |
| Home, Services, Results, Resources, Team, Grad | League Bound Site.dc.html |
| Almaya Admissions | Almaya Admissions.html |
| Design tokens & components | _ds/league-bound-consulting-design-system-a808bf68-.../ |
| Photography | assets/ |
| School logos, team, testimonial video | mlp/ |
