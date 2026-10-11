# Personal & Creative Portfolio

Vite + React portfolio for **Achilles Vonn D. Rabina**, deployed to GitHub Pages.

**Live URL:** https://achllzvr.github.io/Personal-and-Creative-Portfolio/

## Stack

- Vite + React (JSX)
- Tailwind CSS v4
- Static data from `src/data/portfolio.json`
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
- Personal / Creative mode switcher (Creative placeholder until that section ships)
- Bento grid: profile, about, experience, projects, certifications, recommendations, gallery
- Contact modal with social links + Formspree submit

## Notes

- Gallery images currently use Facebook CDN URLs in `portfolio.json`; those signed URLs can expire. Prefer local files under `public/assets/images/gallery/` when possible.
- Theme transition GIF (`public/assets/images/chi_loop.gif`) is large by design and is preloaded on app boot so toggles play without delay.
