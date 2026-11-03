# First Pioneer Properties — portfolio site

Static site (no build step) with an interactive 3D building tour per property.
First property: **120 E 56th Street, New York**.

## Run locally

Browsers block ES modules from `file://`, so serve the folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 and click the property, or go straight to
http://localhost:8080/property.html#120-e-56th (or `#10-e-38th`).

## Deploy on Vercel

It's a static site: no build step, no framework. In Vercel choose **Add New → Project**,
import this GitHub repo, set **Framework Preset: Other**, leave the build command and
output directory empty, and deploy. `vercel.json` only adds cache headers.

## What's inside

| Path | Purpose |
| --- | --- |
| `index.html` / `js/app.js` | Home page: hero + tenant logo strip |
| `portfolio.html` / `js/app.js` | Portfolio grid with use filters |
| `property.html` / `js/property.js` | Property page: 3D viewer HUD, availability table, photos, contact |
| `js/data/properties.js` | **The catalogue.** Add a property object here to list a new building |
| `js/viewer/viewer.js` | Three.js scene, guided 360° tour, hotspots, floor highlight |
| `js/viewer/kit.js` | Shared building kit: brick materials, walls with openings, recessed windows |
| `js/viewer/building.js` | `prewarBrick` generator (120 E 56th St) |
| `js/viewer/loft.js` | `buffLoft` generator (10 E 38th St), incl. roof terrace |
| `js/viewer/classic.js` | `classicOffice` generator (115 E 23rd St) |
| `js/viewer/mile.js` | `ladiesMile` generator (133 W 21st St) |
| `js/viewer/narrow.js` | `narrowLoft` generator (102 W 38th St) |
| `js/viewer/bay.js` | `stoneBay` generator (8 W 36th St) |
| `js/viewer/arch.js` | `archLoft` generator (12 E 44th St) |
| `js/viewer/walkup.js` | `walkup` generator (370 W 51st St, corner) |
| `js/viewer/industrial.js` | `industrial` generator (34-09 Queens Blvd, block-long + rear warehouse) |
| `js/viewer/context.js` | Street, avenue (Park / Fifth) and real neighbours per `site.id` |
| `js/viewer/textures.js` | Canvas-generated brick/stone/signage textures (no image downloads) |
| `vendor/three/` | Three.js r170 (MIT) + the addons we use |
| `assets/properties/<id>/` | Listing photos |

## The 3D tour

- Plays automatically: street level → front → east corner → east side → rear corner →
  rear → west side → roof → crown detail, then loops.
- Any drag / scroll pauses it ("Free look"); **Play tour** resumes. Arrow keys and the
  chapter buttons jump between stops; space toggles play.
- Blue markers are hotspots; click one and the camera flies in with a caption.
- Clicking a row in **Availability** highlights that floor on the model and flies to it.

## Swapping in a real AI-generated / scanned model

The viewer first tries `model.glb` in `properties.js`. Drop a `.glb` (photogrammetry,
Gaussian-splat export, image-to-3D output, or a hand-modelled file) at
`assets/properties/<id>/model.glb`, set the path, and it is loaded in place of the
procedural model; tours, hotspots and floor highlighting keep working off its bounding box.
Model the building with +Z as the street-facing side and metres as units.

## Before going live

Figures marked `SAMPLE` in `js/data/properties.js` (rents, sizes, year built, contact
details) are placeholders — replace them with verified numbers.
