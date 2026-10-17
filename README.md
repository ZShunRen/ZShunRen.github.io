# Shun Ren’s personal site

An Astro portfolio and Markdown blog with React + Motion scenery, hosted on GitHub Pages. The illustrated winter trail and self-hosted CaskaydiaCove font carry through the portfolio; articles use a quieter reading layout.

## Local development

Use Node 24 LTS (minimum 22.22).

```bash
npm ci
npm run dev
```

Open the local address printed by Astro. To check the production site:

```bash
npm run check
npm run build
npm run preview
```

`npm run test:blog` exercises published, draft, and future-dated Markdown against the actual build, then removes its temporary fixtures and restores the production output.

## Write and update content

- **Browser:** Pages CMS provides Posts, Profile, CTF Rankings, and Archived projects editors, with screenshot uploads. See [publishing and account setup](docs/publishing.md).
- **Locally:** run `npm run new-post -- "Post title" optional-slug`, then edit the generated Markdown draft in `src/content/posts`.
- **Images:** put uploads in `public/uploads` and reference `/uploads/filename.png` in Markdown.

Posts default to drafts. A post becomes public on the next build once `draft` is `false` and its publication date has arrived. Future dates do not schedule a deployment automatically.

## Source map

| Location | Responsibility |
| --- | --- |
| `src/pages` | Portfolio routes, blog, tags, and 404 |
| `src/layouts`, `src/components` | Shared shell and portfolio sections |
| `src/components/SceneryMotion.tsx` | React lifecycle, Motion scrolling, pause and preferences |
| `src/lib/scenery` | Connected trail geometry and canvas weather |
| `src/content/posts` | Markdown articles |
| `src/data` | CMS-editable profile, CTF rankings, and archived project text |
| `src/styles/global.css` | Alpine design system and article typography |
| `public` | Fonts, illustrations, photographs, screenshots, uploads |
| `.pages.yml` | Browser editor fields and media mapping |
| `.github/workflows/deploy.yml` | Locked install, checks, build, Pages deployment |

The rewrite preserves the original `/webpages/*.html` public URLs. `dist` is generated output and should not be edited or committed.

The previous implementation is preserved under `.impeccable/migration/legacy` as a migration reference. Edit `src` and `public` for the active site; use Astro's development server instead of serving the repository root directly.

See [the rewrite plan and validation record](docs/rewrite-plan.md) for the delegation boundaries and integration status.
