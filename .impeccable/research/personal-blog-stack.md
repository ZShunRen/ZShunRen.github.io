# Personal blog stack decision

Researched 2026-10-16 against official documentation. Discussion only; no application changes made.

## Recommendation

**Start the discussion with Astro + Markdown content collections + hosted Pages CMS, retaining React for interactive components.** This is my judgment for a personal portfolio becoming a work/CTF blog: it supplies the publishing structure while keeping the existing visual design and portable content. React experience remains useful through Astro's React integration and client hydration directives. The final stack choice remains open. [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/)

The local repository is currently HTML/CSS/browser JavaScript, with inline scenery SVGs, `scripts/site.js`, and local CaskaydiaCove WOFF files. Its remote is `https://github.com/ZShunRen/ZShunRen.github.io.git`. That suggests GitHub Pages but does **not** establish active deployment settings.

## What each option actually buys

| Option | Writing and publishing | Main tradeoff |
| --- | --- | --- |
| **Astro + Pages CMS** | Browser form/Markdown editor → upload screenshots → save repository files → configured CI builds static pages | Best fit here; full-site preview and draft publication rules still need deliberate setup |
| **React + Vite + CMS/content pipeline** | Can use the same CMS, but must supply rendering, metadata, routing and publishing conventions | Familiar React development, more blog plumbing |
| **Next.js + Sanity** | Browser Studio → drafts/media → publish to API; frontend rebuilds or updates through server integration | Richer editing/preview, more services and integration |

Vite describes itself as a development server and production build tool. A React/Vite starter does not itself provide a blog's post schema, Markdown compiler, post pages, tags, RSS, sitemap, or CMS. Those can be added, but this is engineering work; changing from Vite to another frontend alone does not create a publishing dashboard. [Vite overview](https://vite.dev/guide/)

## Astro: technical posts with a browser editor

Use a content collection for title, date, description, tags, category (`work`/`ctf`), cover image, and draft status. Astro supports local Markdown/MDX and typed collection schemas; it provides queries and rendering, while the site defines post routes and archive layouts. Production builds can filter drafts, and development can include them. Filter drafts consistently in routes, lists, feeds and search. [Content collections](https://docs.astro.build/en/guides/content-collections/)

For CTF writeups, plain Markdown is a good default: fenced `bash`, `python`, and other language blocks keep commands readable; Astro provides Shiki highlighting. Add MDX only for posts requiring interactive React demos or custom components. MDX rendering support is not a guarantee that a CMS rich-text editor will round-trip arbitrary JSX/imports; verify a sample post or use raw editing. [Syntax highlighting](https://docs.astro.build/en/guides/syntax-highlighting/), [Markdown and MDX](https://docs.astro.build/en/guides/markdown-content/), [Pages CMS editors](https://pagescms.org/docs/configuration/content/editors/)

Math can use the Unified processor with `remark-math` and `rehype-katex`, plus KaTeX styling. Match configuration to the Astro version selected: current Astro docs distinguish its default processor from the optional Unified pipeline. Do not copy older plugin configuration blindly. [Astro processors](https://docs.astro.build/en/guides/markdown-content/#markdown-processors), [remark-math project](https://github.com/remarkjs/remark-math)

### Pages CMS workflow

One-time setup: define `.pages.yml`, sign in to the hosted application with GitHub, install its GitHub App for the account/organization and repository, then expose post and page fields. Subsequent work happens in the browser. Content remains in GitHub files, rather than a separate CMS content database. [Quick start](https://pagescms.org/docs/quick-start/), [Architecture](https://pagescms.org/docs/)

Uploads are saved into a configured repository directory, with a separate public URL mapping; for example `public/uploads` → `/uploads`. Images, file attachments and rich-text image uploads use this media configuration. Screenshots fit this model; large videos and bulky challenge archives would be better evaluated for external storage rather than continually growing Git history. [Media configuration](https://pagescms.org/docs/configuration/media/)

Eligibility is **GitHub repository access**, not a requirement to host the public site on GitHub Pages. The hosted quick start does not state a public-repository-only restriction; the auth documentation checks user-token access or a repository-scoped collaborator/App path and denies access otherwise. I found no current primary-doc guarantee explicitly spelling out all hosted public/private repository cases, so confirm the actual repository appears after installing the App before committing to it. Keep this separate from GitHub Pages' own private-repository hosting eligibility. [CMS authentication](https://pagescms.org/docs/development/authentication/), [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

A CMS save still creates a Git change, but **you do not manually push code for each post**. Configure a push-triggered build/deploy workflow once. Astro documents GitHub Pages deployment through GitHub Actions. The CMS editor is a separate hosted application; GitHub Pages serves static output and does not execute CMS authentication endpoints. [Astro Pages deployment](https://docs.astro.build/en/guides/deploy/github/), [GitHub Pages architecture](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

For a lightweight workflow, expose a draft checkbox and explicitly exclude drafts from production. A rich-text editing view is not automatically an exact preview of the rendered website. A complete browser-only preview workflow needs a separate preview build/deployment. Also, a draft flag on a public repository does not make its source private.

### When Decap is preferable

Decap offers an editorial workflow where unpublished content is represented by Git branches/pull requests, and supports deployment preview links when the deployment platform supplies them. Choose it if those review states matter enough to justify more configuration. Its in-editor custom preview also requires implementation. [Editorial workflows](https://decapcms.org/docs/editorial-workflows/), [Custom previews](https://decapcms.org/docs/customization/)

The documented **GitHub backend requires push access and a server-side authentication provider**: use a configured OAuth service/server or hosted Decap Turbo. Static `/admin` files alone are insufficient. Decap documents client-only `auth_type: pkce` for **GitLab**; do not present that as the documented solution for its GitHub backend. [GitHub backend](https://decapcms.org/docs/github-backend/), [GitLab PKCE](https://decapcms.org/docs/gitlab-backend/#client-side-pkce-authorization)

## Next.js + Sanity: richer editorial experience

Sanity stores structured documents through its content API and hosts uploaded image/file assets on its CDN. Editors upload from Studio. The frontend must define how content blocks, code and math render; Markdown/MDX is not automatically the stored body format. This gives better media handling for larger publishing needs, while introducing a separate content service and schemas. [Sanity assets](https://www.sanity.io/docs/content-lake/assets), [Portable Text](https://www.sanity.io/docs/developer-guides/beginners-guide-to-portable-text)

There are two materially different hosting choices:

- **Static export:** `output: 'export'` produces static HTML suitable for GitHub Pages. Posts must be enumerable at build time. New content requires a rebuild; Next's Draft Mode, request-dependent handlers, ISR and default image optimizer are unavailable. Sanity publication can send a webhook, but a build service/receiver must translate that into a deployment; GitHub Pages does not receive arbitrary CMS webhooks as an application backend. [Next static export](https://nextjs.org/docs/app/guides/static-exports), [Sanity webhooks](https://www.sanity.io/docs/content-lake/webhooks)
- **Managed Next runtime:** deploy somewhere supporting Next's server features. Sanity's official Next integration can provide authenticated Draft Mode, live preview and click-to-edit through its Presentation Tool. That is a stronger fit when an exact browser preview is a priority; it also requires preview routes, tokens, origin configuration and frontend integration. [Sanity Next visual editing](https://www.sanity.io/docs/nextjs/visual-editing-with-next-js-app-router)

Sanity is not tied to Next.js: Astro can also fetch CMS content. The meaningful decision is repository-backed Markdown versus API-backed structured content, then static builds versus a runtime preview/update path. No vendor pricing assumptions are needed to make that decision.

## Preserving the current site

Migration does not require discarding the SVG scenery, scroll behavior, reduced-motion controls, or local font. My proposed approach is to preserve these as shared layout/assets and browser scripts, then add a readable article layout and archives. Astro's HTML-oriented components are particularly close to the current markup; React islands are optional. In React/Next, inline SVG markup and DOM scripts need adaptation to JSX/component lifecycles. Preserve existing public URLs or plan redirects/static redirect pages supported by the chosen host. This is a migration assessment based on local files, not an implemented change.

CMS page edits cover the fields we expose—About text, profile links, project summaries, navigation—rather than arbitrary visual layout changes. Design and component changes remain development work.

## Three decisions worth discussing

1. **Writing format:** Markdown with occasional MDX for technical demos, or a visual structured editor as the main authoring surface?
2. **Preview requirement:** Is saving a draft and waiting for a preview build acceptable, or should the real page update live while editing? The latter strengthens the case for a managed runtime + Sanity.
3. **Hosting/content ownership:** Keep GitHub Pages and repository-backed content, or accept another hosting/CMS service for richer publishing? Also establish whether unpublished writeups must remain private at source level.
