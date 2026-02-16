# Tejas Bachhav – Portfolio (Astro)

Personal portfolio site built with **Astro** and **Tailwind CSS**. Content is sourced from data modules for easy updates.

## Setup

```bash
npm install
```

## Commands

| Command         | Action                                      |
| :-------------- | :------------------------------------------ |
| `npm run dev`   | Start dev server at `http://localhost:4321` |
| `npm run build` | Build static site to `./dist/`             |
| `npm run preview` | Preview the production build locally     |

## Structure

- **`src/pages/`** – Routes: Home (`/`), Resume (`/resume`), Projects (`/projects`), Contact (`/contact`)
- **`src/layouts/Layout.astro`** – Shared shell, nav, footer
- **`src/components/`** – Nav, Footer, ResumeTimeline, ProjectCard, ContactForm
- **`src/data/`** – Profile, resume, projects, contact (edit here to change content)
- **`public/images/`** – Images (copied from the original portfolio)
- **`public/files/`** – Optional: add `Tejas_Bachhav_Resume.pdf` for the Download Resume link

## GitHub activity

The home page shows a **GitHub profile stats** section and a **contribution heatmap** (last year).

**Heatmap data** is parsed from GitHub's contributions page at build time. This gives a full year of accurate data (including private contributions if the user has that setting enabled). If the contributions page is unavailable, it falls back to the Events API (~90 days of public activity).

**Client-side refresh** — a `<script>` at the bottom of the home page runs automatically in the visitor's browser:

- **On page load**, it fires 1 API request to GitHub to fetch the latest profile stats.
- **Updates the stats** (repos, followers, following, gists) with fresh data, silently replacing the build-time values.
- **Caches results** in `sessionStorage` for 5 minutes, so navigating away and back (or View Transitions) doesn't re-fetch.
- **Fails gracefully** — if the API is down or rate-limited, the build-time data stays as-is. No spinners, no flicker.
- **Rate limits are not a concern** because each visitor has their own 60 requests/hour budget (GitHub rate-limits by the caller's IP). The site uses 1 request per visit.

## Contact form

The contact page uses [Formspree](https://formspree.io) with the endpoint from the original site. To use your own, update `formspreeEndpoint` in `src/data/contact.ts`.

## Deploy

Build output is in `dist/`. Deploy that folder to any static host (Vercel, Netlify, GitHub Pages, etc.).
