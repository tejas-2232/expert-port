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

## Contact form

The contact page uses [Formspree](https://formspree.io) with the endpoint from the original site. To use your own, update `formspreeEndpoint` in `src/data/contact.ts`.

## Deploy

Build output is in `dist/`. Deploy that folder to any static host (Vercel, Netlify, GitHub Pages, etc.).
