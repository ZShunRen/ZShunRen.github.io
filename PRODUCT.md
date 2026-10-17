# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Shun Ren's personal portfolio and blog present his background, CTF rankings, contact links, and field notes about work and CTF practice. Site text and project records can be maintained through browser-managed content files, and blog posts can include uploaded images.

## Positioning

Singapore-based security & software engineer.

## Capabilities and Constraints

- The production implementation is a statically generated Astro site. Canonical routes are `/`, `/projects/space-invaders/`, `/projects/spotify-time-machine/`, `/blog/`, `/blog/[...slug]/`, `/blog/tags/[tag]/`, and the custom 404 page. About me is the homepage section at `/#about`; the former `/about` route is removed.
- Preserve navigation, contact pathways, blog discovery, article pages, and tag archives. The homepage presents CTF rankings instead of the former skills and two project cards; older project detail URLs remain available for existing links.
- Legacy `/webpages/*.html` URLs remain exact static redirect documents to their canonical routes. The superseded HTML/CSS/JavaScript source is retained only as migration evidence under `.impeccable/migration/legacy/`.
- The site is a personal portfolio first and should also support professional evaluation as a resume. Keep navigation, text, and layout straightforward and easy to scan.
- The blog accepts Markdown posts in the `work` and `ctf` categories. Draft posts and posts dated in the future are excluded from every generated listing and route.
- Profile, CTF rankings, and archived project copy are maintained in `src/data/profile.json`, `src/data/ctf-rankings.json`, and `src/data/projects.json`; posts are maintained in `src/content/posts/`. Pages CMS manages these files and uploads images from `public/uploads` to `/uploads`.
- Blog pages continue through a winter mountain and forest landscape with small mountains at the sides; unlike the homepage, the blog has no town or house backdrop. Keep the footer at the document bottom even on short pages.
- RSS was explicitly removed. Do not restore an endpoint, package, navigation link, or feed metadata unless the user requests it again.
- Changes to dated biographical information remain undecided. Do not infer current age, education, employment, or credentials from historical copy.

## Brand Commitments

- Name: Shun Ren.
- The user requests optimistic cyberpunk aesthetics: positive, bustling lights with an uncluttered, calm reading experience.
- User-provided city reference: `/tmp/codex-clipboard-9uaFPg.png`. It establishes luminous blue-hour atmosphere with warm lights and neon accents; the intended design is much less cluttered.
- Gothic and Warhammer 40k influences were explicitly withdrawn.
- Atmosphere must not distract from the portfolio content.
- Confirmed direction: a believable near-future alpine small town in winter, inspired by Zakopane. Snow, mountain scenery, pine trees, and warm town lights lead; futuristic details remain subtle.
- Additional winter reference: `/tmp/codex-clipboard-UyZD9o.png`.
- Avoid fancy typography and elaborate layouts. Personal identity, project evidence, and resume readability take priority over scenery.
- Superseding visual commitment: a continuous summit-to-town journey in clean illustrated vector shapes with subtle texture. The user rejected the image-generated photorealistic proposals; those images must not be used as website assets or design authority.
- Body font: CaskaydiaCove Nerd Font, explicitly requested by the user.
- Personal meaning: the winter setting preserves the owner’s positive memories of traveling and hiking around Zakopane in winter while on exchange, and the peace and quiet that is hard to come by in Singapore.

## Evidence on Hand

- Current pages and layouts: `src/pages/`, `src/layouts/BaseLayout.astro`, and reusable components in `src/components/`.
- Homepage journey sections: `src/components/home/*.astro`; motion runtime: `src/components/SceneryMotion.tsx` and `src/lib/scenery/`.
- Current global styles: `src/styles/global.css`; self-hosted fonts and image evidence: `public/fonts/` and `public/images/`.
- Editable profile and project content: `src/data/profile.json` and `src/data/projects.json`; blog content and schema: `src/content/posts/` and `src/content.config.ts`.
- Browser CMS configuration: `.pages.yml`, including media mapping from `public/uploads` to `/uploads`.
- Archived pre-Astro source: `.impeccable/migration/legacy/`.
- Do not invent professional claims, projects, metrics, testimonials, or credentials.

## Product Principles

- Keep personal identity and real work easy to understand.
- Preserve factual content and working exploration paths.
- Let the owner publish work and CTF writing without editing page templates.
- Use optimistic atmosphere to support attention to the work.

## CTF rankings content

The homepage replaces the former work experience entries with the owner's supplied CTF results: SCC 2026, Student category, 5th place; SANS Spark 2026, 3rd place; HTB University CTF 2024, 3rd place. `src/data/ctf-rankings.json` stores the ordered events, optional categories, and placements. Pages CMS exposes these fields. Do not invent team details, competition links, or expand event names without an owner-provided source. The owner's current LinkedIn URL is `https://www.linkedin.com/in/zheng-shun-ren/`.
