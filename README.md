# League Bound Consulting — website

The marketing site for League Bound Consulting. It is a static site: no build
step, no framework, no dependencies. Netlify serves these files exactly as they
sit in this repo.

## How to change something

The entire visible site is one file: `League Bound Site.dc.html`. Editing it and
committing is the whole workflow.

The fastest path, with no local clone and nothing installed:

1. Open the repo on github.com and click `League Bound Site.dc.html`.
2. Click the pencil icon, make the edit, and click **Commit changes**.
3. Netlify sees the commit and redeploys. It takes roughly twenty seconds.

If you have regenerated the page from the design tool and want to replace it
wholesale, use **Add file → Upload files** on github.com instead, drop the new
`League Bound Site.dc.html` on top of the old one, and commit. Same result.

Nothing needs to be zipped, and the Netlify dashboard does not need to be
touched again.

## What lives where

| Path | What it is |
| --- | --- |
| `League Bound Site.dc.html` | The site. Home, Services, Results, Resources, Team and Grad are all sections of this one page. |
| `Almaya Admissions.html` | The Almaya Admissions page, served at `/almaya`. |
| `assets/` | Photography and book covers used across the page. |
| `mlp/` | School logos, team headshots and testimonial videos. |
| `_ds/` | Design-system tokens and component CSS exported from Claude Design. |
| `support.js` | Support widget script. |
| `_redirects` | Routing rules — see below. |
| `netlify.toml` | Cache headers. |

## Routing

`_redirects` maps `/` to `League Bound Site.dc.html`, so the filename never
appears in the address bar, and maps `/almaya` to the Almaya page. Any unknown
path falls back to the main page, since the site is a single page with anchor
navigation. Requests under `assets/`, `mlp/` and `_ds/` deliberately return a
real 404 when a file is missing, rather than quietly serving the HTML page,
which makes a broken image obvious instead of mysterious.

## Caching

`netlify.toml` tells browsers to cache everything in `assets/`, `mlp/` and
`_ds/` for a year, because those files effectively never change. HTML is set to
revalidate on every request, so an edit is visible the moment the deploy
finishes rather than after a cache expires.

## What was left out

Two things in the original export folder are not in this repo.

`uploads/` held the raw source material handed to the design tool: the original
multi-megabyte Depositphotos files, screenshots, scratch renders and video
takes. None of it is served, so it is gitignored.

Twenty-six images in `assets/` and `mlp/bg/` were also dropped because no markup
anywhere references them. They are superseded PNG versions of images that now
ship as JPEGs, unused hero shots, and the earlier `team-*` headshots that were
replaced by the ones in `mlp/team/`. Together those two exclusions took the repo
from 281MB to 203MB. Every one of those files still exists in the original
`League Bound landing page redesign (3)` folder, so any of them can be restored
if a picture turns out to be missing.
