# Astro rewrite plan

## Goal

Rewrite the current static portfolio as an Astro site that preserves its visual identity and existing public content while adding a repository-backed work and CTF blog. GitHub Pages remains the host. Markdown content remains portable, and Pages CMS supplies an optional browser editor.

## Content contract

Posts live in `src/content/posts/*.md`. The Astro content collection and `.pages.yml` must describe the same fields:

| Field | Stored value | Rule |
| --- | --- | --- |
| `title` | string | Required |
| `description` | string | Required summary for lists and metadata |
| `date` | date | Required publication date |
| `tags` | string array | May be empty |
| `category` | `work` or `ctf` | Required |
| `draft` | boolean | Defaults to `true` |
| `cover` | string | Optional public image path |
| `coverAlt` | string | Optional; required by editorial practice whenever `cover` is set |

The Markdown below frontmatter is the `body`. The post filename is its stable slug and route identifier. Titles can change without renaming the file.

Profile copy lives in `src/data/profile.json` with exactly `name`, `subtitle`, `description`, `email`, `github`, `linkedin`, `about.paragraphs`, `theme.title`, and `theme.paragraphs`. Components should import this file rather than duplicate those values. Pages CMS exposes only these data fields and does not imply visual layout editing.

Existing project copy lives in `src/data/projects.json`. Its `spaceInvaders` and `spotifyTimeMachine` objects each contain exactly `title`, `description`, `repository`, and `paragraphs`. The homepage cards and corresponding detail routes should import these values rather than maintain separate copies. Gallery images, implementation metadata, and layout remain component-owned because they are outside the editable content contract.

## Implementation boundaries

The implementation was delegated to three GPT-5.6 Sol agents with medium reasoning effort, using separate file ownership:

| Workstream | Deliverable |
| --- | --- |
| Astro foundation | Shared layouts, portfolio migration, Markdown blog, tags, and sitemap |
| React motion | Motion subscriptions, connected trail geometry, weather, and lifecycle controls |
| CMS publishing | Editor configuration, profile/project data, uploads, CI, and author instructions |
| Root integration | Dependency compatibility, source consolidation, RSS removal, live reduced-motion correction, production/content/browser checks, and handoff |

An independent finish reviewer returned **ship** for the integrated code and browser evidence; the report is `.impeccable/review/astro-rewrite-finish.md`.

- **Foundation and content layer:** own Astro/package configuration, the typed post collection schema, shared content queries, draft/date eligibility rules, metadata, sitemap behavior, and validation. This layer must provide one reusable production eligibility rule so routes and archives cannot drift.
- **Interface layer:** own Astro layouts, components, routes, styles, responsive behavior, accessible navigation, and adaptation of the existing SVG scenery and browser interactions. It consumes the shared content queries and profile data rather than defining publishing policy again.
- **Publishing layer:** own `.pages.yml`, the GitHub Pages workflow, profile data extraction, the local post scaffold, and author documentation. It must stay aligned with the foundation schema and must not promise CMS control over component layout.
- **Repository owner:** installs or authorizes the Pages CMS GitHub App, selects GitHub Actions as the Pages source, reviews the first deployment, and controls any future custom domain. No implementation task should invent credentials or perform those account actions implicitly.

The previous HTML/CSS/JS is preserved under `.impeccable/migration/legacy`. Active components live in `src`; verified copies of all fonts and images now live under `public`. The migration preserves original copy and retains old detail URLs as static redirects.

## Delivery sequence

1. Establish Astro, npm scripts, the lockfile, TypeScript checks, site URL, and typed content collection.
2. Port the shared shell, profile copy, fonts, imagery, and core interactions. Keep the root-site URL structure compatible where practical.
3. Add post index, post routes, tags, article typography, syntax highlighting, metadata and sitemap integration.
4. Apply the shared visibility rule everywhere: both development and production exclude drafts and posts dated after the build date from pages, lists, tags, and sitemap entries.
5. Validate CMS-created Markdown, uploaded images, alt text, fenced code, and the profile editor against the built site.
6. Run checks and a production build, inspect representative desktop/mobile pages and reduced-motion behavior, then merge to `main`.
7. Complete the repository-owner setup in `docs/publishing.md` and inspect the first GitHub Pages deployment before treating the rewrite as live.

## Current status

The three implementation workstreams are integrated locally:

- Pages CMS defines the post collection, media mapping, create-only filename, draft default, and profile editor.
- The GitHub Pages workflow targets `main`, installs the lockfile with `npm ci`, checks types/templates, builds Astro, and deploys the static artifact using official GitHub Pages actions.
- Existing profile and project values have been extracted into structured JSON.
- The local scaffold creates a non-overwriting Markdown draft with no invented project or achievement content.
- Author and account-setup instructions are documented.

- Astro pages, shared layouts, Markdown rendering, tag archives, sitemap, and the CMS data sources are connected. Legacy detail URLs redirect to the new routes.
- React + Motion supplies the scroll subscriptions and shared weather clock; trail geometry and canvas weather are separate modules. Live system reduced-motion changes use a reactive media-query subscription.
- RSS was removed at the user's request, including its endpoint, links, and package.
- No user post has been invented or published. The example is a draft; verification fixtures are removed after testing.

Integrated validation passed:

- `npm ci --offline`: clean lockfile install; zero reported vulnerabilities.
- `npm run check`: zero errors, warnings, or hints.
- `npm run test:blog`: nested Markdown, language-highlighted code, images, punctuation/Unicode tag URLs, sitemap eligibility, draft/future exclusion, and RSS absence. The test restores the real production build after removing its fixtures.
- Original portfolio paragraph comparison: all 29 paragraphs present across homepage, About, and project detail sources (count includes repeated About paragraphs between pages).
- Browser checks at 320, 390, 768, and 1440px: no horizontal page overflow, broken images, or JavaScript errors; continuous route; traveler/scroll; pause/resume; live reduced-motion changes; old URL redirects; gallery stepping; article layout; no-JavaScript content and gallery fallback.
- Post scaffold: quoted titles, draft default, and refusal to overwrite existing content.

The article and populated blog screenshots use a clearly labelled temporary integration fixture served from an isolated test build, not a published post. Browser evidence is in `.impeccable/review/rewrite-browser-checks.json`.

External GitHub Pages and Pages CMS account setup, the first hosted CMS save, and the first live deployment remain unverified until the repository owner performs the steps in `docs/publishing.md`.

## Acceptance checks

- `npm run check` succeeds.
- `npm run build` succeeds from a clean install using the committed lockfile.
- Production output contains no draft or future-dated post in any page, archive, tag archive or sitemap.
- A published Markdown fixture renders headings, links, fenced code, and an uploaded image with alt text.
- Editing profile or project fields changes all rendered consumers without editing a component.
- Existing navigation destinations and important public URLs either continue to work or have an explicit redirect.
- The deployment workflow uploads and deploys the Astro artifact in the `github-pages` environment.
- The first CMS save produces an understandable Git commit and starts the deployment workflow when it targets `main`.

## Homepage content refresh

The owner removed the homepage skills and project cards, initially requested work experience, and then replaced the work entries with CTF rankings. `src/data/ctf-rankings.json` stores the three supplied results and Pages CMS exposes their order, event, category, and placement. `CtfRankings.astro` retains the town scenery, and `Forest.astro` contains only a short trail transition. Current links use `#ctf-rankings`; former section anchors and historical project detail routes remain compatible.
