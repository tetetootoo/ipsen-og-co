# Ipsen & Co

A React website for the café Ipsen & Co on Gammel Kongevej, Frederiksberg. Built from the owner's [original Framer design](https://memorable-concept-809938.framer.app/), with subsequent layout and animation refinements.

## Features

- One-page layout with a consistent header and fixed footer; only the main content frame scrolls.
- Home screen with a green-and-beige striped awning, warm hanging bulbs, and dishes wandering across the full viewport width.
- Menu, about, gallery, events, and jobs sections, with direct hash links and browser back/forward navigation.
- Section transitions fade and slide downward out, then upward in. Reduced-motion preferences are respected.
- A 600px beige menu card with right-aligned prices, smaller descriptions, and content-fitting height.
- Other sections share the 600px frame width, with white text on the green background.
- Responsive layouts and local copies of the original logo and photography.
- Footer order: events, jobs, Smiley report, email, Instagram.
- Functional Google Maps, email, [Instagram](https://www.instagram.com/ipsenogco/), and [Smiley report](https://www.findsmiley.dk/app/552825) links.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Vite prints the local preview URL. For a production build and local preview:

```sh
npm run build
npm run preview
```

The production build is generated in `dist/`. The preview command is for local verification.

## Project structure

- `src/main.jsx`: shared layout, navigation, section transitions, and illustrated awning.
- `src/content.js`: Danish menu and section content.
- `src/WanderingElements.jsx`: supplied Framer animation adapted for React.
- `src/style.css`: visual styling and responsive layouts.
- `public/assets/`: original logo, pastry cutouts, and gallery photographs.

## Deploy on Vercel

Import this GitHub repository as a separate Vercel project using:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm ci` |

No environment variables or backend service are required. The hash-based navigation does not require route rewrites.

The intended portfolio is [haldoff.com](https://haldoff.com). After deployment, link to the live demo from a portfolio project card. An optional custom subdomain is `ipsen.haldoff.com`; configure it in Vercel and the domain's DNS before using it. Deployment and the portfolio link have not yet been configured by this project.

The project currently uses root-relative asset paths. Hosting beneath a path such as `/ipsen/` requires updating Vite's base and the asset URLs; a separate deployment or subdomain works with the current configuration.

## Design notes

Arial is used in place of the original Framer site's trial font. The awning is drawn in CSS and SVG. Framer editor controls and branding are omitted. The alternate café-front home screen was discarded; the awning and wandering dishes are the retained design.

## Ownership and license

Copyright (c) 2026 Ipsen & Co. All rights reserved.

This project is proprietary. No reuse rights are granted; see [LICENSE](LICENSE). Third-party dependencies retain their respective licenses.
