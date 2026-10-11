# Personal & Creative Portfolio

Vite + React portfolio for **Achilles Vonn D. Rabina**, deployed to GitHub Pages.

**Live URL:** https://achllzvr.github.io/Personal-and-Creative-Portfolio/

## Stack

- Vite + React (JSX)
- Tailwind CSS v4
- Static data from `src/data/portfolio.json` (Personal) and `src/data/creative.json` (Creative)
- Contact form via [Formspree](https://formspree.io)

## Local development

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_FORMSPREE_ENDPOINT
npm run dev
```

Open the URL Vite prints (includes the `/Personal-and-Creative-Portfolio/` base path).

```bash
npm run build
npm run preview
```

## GitHub Pages setup (one-time)

1. Repo **Settings → Pages → Build and deployment → Source**: **GitHub Actions**
2. Optional: add a repository secret `VITE_FORMSPREE_ENDPOINT` with your Formspree URL so the contact form works in production
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys `dist/`

## Features

- Dark / light theme with preloaded GIF transition
- Personal / Creative mode switcher
- Creative dock: hover (desktop) or tap (mobile) the intro to reveal a bottom dock; selecting an app opens an in-page case study (icon flies up with a motion trail; short copy uses rolling letters, longer copy uses text emerge)
- Bento grid: profile, about, experience, projects, certifications, recommendations, gallery
- Contact modal with social links + Formspree submit

## Creative portfolio assets

Edit works in [`src/data/creative.json`](src/data/creative.json). Each entry needs `id`, `name`, `verb` (`developed` / `created` / `contributed`), copy fields, `links`, `tech`, plus asset paths:

```
public/assets/creative/
  icons/{id}.png   # or .svg — dock + case-study icon
  images/{id}/01.jpg …
```

Paths in JSON are relative to `public/` (e.g. `assets/creative/icons/sight.svg`). Replace the placeholder SVGs with real icons and screenshots when ready; keep the same filenames or update the JSON paths.

## Notes

- Gallery images currently use Facebook CDN URLs in `portfolio.json`; those signed URLs can expire. Prefer local files under `public/assets/images/gallery/` when possible.
- Theme transition GIF (`public/assets/images/chi_loop.gif`) is large by design and is preloaded on app boot so toggles play without delay.
