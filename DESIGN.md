---
name: Shun Ren — Summit to town
description: A calm illustrated winter portfolio and blog with straightforward monospace reading surfaces.
colors:
  snow: "#eff3e9"
  paper: "#f9faf2"
  ink: "#243f42"
  muted: "#486561"
  pine: "#365e54"
  line: "#c5d3c7"
  amber: "#edcd93"
  sky: "#d9e7e5"
typography:
  display:
    fontFamily: 'CaskaydiaCove, "Cascadia Code", monospace'
    fontSize: "clamp(2.6rem, 6vw, 4.8rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  headline:
    fontFamily: 'CaskaydiaCove, "Cascadia Code", monospace'
    fontSize: "clamp(1.6rem, 3vw, 2.15rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  title:
    fontFamily: 'CaskaydiaCove, "Cascadia Code", monospace'
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: 'CaskaydiaCove, "Cascadia Code", monospace'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: 'CaskaydiaCove, "Cascadia Code", monospace'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.8
rounded:
  surface: "8px"
  control: "4px"
  focus: "3px"
spacing:
  sm: "12px"
  md: "24px"
  lg: "48px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  text-link:
    textColor: "{colors.pine}"
    padding: "6px 0"
  navigation:
    textColor: "{colors.pine}"
    padding: "27px 40px"
  reading-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "52px 64px"
  skill-row:
    padding: "32px 0"
  project-row:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.surface}"
    padding: "30px"
  gallery-control:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
    width: "44px"
  motion-toggle:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pine}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  page-heading:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "24px"
---

# Design System: Shun Ren — Summit to town

## Overview

**Creative North Star: "Summit to town"**

A quiet winter descent frames a personal portfolio and blog: layered mountain silhouettes, snow-covered pines, timber houses, and warm windows suggest a small town inspired by Zakopane. The near-future premise stays understated; the implemented scenery is clean SVG illustration with sparse texture, rather than a dense technological spectacle.

Straightforward monospace typography and opaque paper reading surfaces keep the person, project evidence, and resume content easy to scan. The landscape supplies atmosphere around conventional navigation and content layouts. The rejected image-generated raster proposals are not design authority; the implemented SVG assets and CSS define this world.

**Key Characteristics:**

- Clean illustrated winter silhouettes with subtle texture.
- Dark evergreen text on pale snow and paper surfaces.
- CaskaydiaCove Nerd Font throughout, with simple hierarchy.
- Flat reading panels and conventional portfolio layouts.
- Blog indexes, tag archives, and articles reuse the same paper surfaces and monospace hierarchy.
- One continuous road and snow plane across transparent scenic sections.
- Shared winter weather and scroll-driven scenery around stationary reading surfaces, with pause and reduced-motion support.

## Colors

Cool pale grounds and evergreen text carry the interface; warm details stay in the scenery and text selection. The frontmatter records the eight shared root color tokens from `src/styles/global.css`; asset-local illustration colors remain in their SVG files under `public/images/alpine/`.

### Primary

- **Pine:** Links and the main contact action; its hover state deepens to ink.

### Secondary

- **Warm amber:** Selection highlight. Related warm window and lamp colors live locally in the town illustration; amber is not a large interface background.

### Neutral

- **Snow:** Main page ground and the lower mountain transition.
- **Paper:** Opaque reading surfaces, project rows, contact copy, galleries, and detail heading backplates.
- **Ink:** Body text, headings, wordmark, and primary action hover.
- **Muted evergreen:** Secondary text, dates, quotation, and self-rating dots.
- **Soft line:** Skill and education dividers and gallery control borders.
- **Winter sky:** Summit background behind the layered mountain artwork.

Repeated town ground and footer shades are literal CSS values, not additional root tokens. Do not promote every tree, roof, and window fill into a UI token.

**The Paper Rule.** Put dense reading content and detail-page headings on opaque paper surfaces so illustration never compromises contrast.

## Typography

**Display and Body Font:** CaskaydiaCove Nerd Font, registered as `CaskaydiaCove`, with Cascadia Code and monospace fallbacks. Regular and bold WOFF files are self-hosted in `public/fonts/`; retain their license.

The single monospace family is an explicit user choice. Bold weight and restrained size changes establish hierarchy without adding decorative typefaces. The frontmatter captures desktop defaults; component and responsive exceptions follow the CSS.

- **Display:** Name heading; on small screens it becomes a fixed size (2.8rem). Detail-page headings use a smaller fluid range (2rem–3rem), becoming smaller again on mobile (1.7rem).
- **Headline:** Main section headings. Contact, education, and project-information headings have smaller local sizes.
- **Title:** Content subheadings; project-row titles are slightly larger (1.2rem desktop, 1rem mobile).
- **Body:** Comfortable leading; the global size falls to 14px at the mobile breakpoint. Many supporting paragraphs already use 14px on desktop. Project detail prose is capped at 72ch; quotations at 65ch.
- **Label:** Navigation and supporting text generally use 12–13px. Text action links use bold weight rather than the regular label default. Keep normal sentence case.

**The One Family Rule.** Use the chosen CaskaydiaCove stack throughout; preserve plain portfolio typography instead of introducing a fancy display pairing.

## Layout

Use a full-width illustrated environment around centered content. The navigation is capped at 1280px, the intro and detail banner at 1100px, general reading surfaces at 1020px, and projects/about content at 960px. The forest reading surface is narrower (900px) and shifted toward the right on wide screens; it recenters below 900px.

The named spacing primitives are small (12px), medium (24px), and large (48px); the implementation also uses component-specific values. Do not imply that every existing dimension is a multiple of this scale. Desktop reading surfaces have generous padding (52px 64px), reducing to 40px at 900px and 30px 24px at 600px.

Skill rows use a label column (175px) and a flexible description. Project rows pair screenshot and text in two columns (1.1fr / 1fr). Biography content pairs portrait and prose. These become single columns at 600px. Navigation remains a compact visible link row; the footer wraps. Long contact values wrap within their columns.

The home surface expresses the continuous summit → forest → town descent. Preserve that sequence when changing this page; inner pages reuse a compact mountain banner and paper content rather than reproducing the whole journey. Mobile forest and town artwork use dedicated SVG compositions. At 1600px and above, the summit height settles at 900px. Print styles remove scenic layers and simplify the reading layout.

The homepage uses one shared snow ground beneath transparent sections. Sections do not create separate isolation planes or rectangular scenic backgrounds; local terrain uses shaped snowbank lenses. Town scenery continues the descent without restarting a mountain backdrop, and buildings can overlap section boundaries without being clipped there. The main container still clips the outer page boundary.

One page-spanning decorative SVG route in `src/components/home/JourneyGround.astro` connects the summit, forest, projects, garden, and contact square. Its bank, edge, and road core share the same path. The geometry helpers in `src/lib/scenery/geometry.ts` measure section and reading-panel bounds, place the route beside the content, and join cubic bends with shared endpoints and aligned vertical tangent directions. The route is recalculated on resize, observed layout changes, and font readiness; it stays fixed in document coordinates during scrolling, pause, and reduced motion. The initial SVG path provides a static fallback before measurement. Retired local road fragments must not be restored.

## Elevation & Depth

The system uses no box shadows. Tonal mountain layers, overlapping snow, tree scale, and the town path create scenic depth; opaque paper surfaces create reading separation without simulated elevation. A fixed, pointer-transparent paper SVG overlay at opacity 0.3 adds sparse texture without blocking interaction.

Native scrolling moves distant summit peaks at different depths. Trees and houses remain stationary in document coordinates throughout the summit, forest, town, garden, and contact square; they neither translate, scale, nor bend with wind. This keeps their authored placement stable relative to the connected snowbanks, shared route, and reading surfaces. Only `.terrain-layer` elements participate in scroll-depth transforms.

One shared gust clock connects the section-specific wind-and-snow canvases and chimney drift. Trees do not sway; the gust still drives horizontal smoke displacement. Weather is strongest at the summit, sheltered in the forest, and quieter around the town and garden. Exposed summit and forest snow uses directional strokes, with longer tails in stronger gusts; sheltered town and garden snow uses small round flakes. Powder sweeps appear in the exposed summit and forest. Particle counts are lower on small screens, and canvas backing resolution is capped at 1.5 device pixel ratio. The decorative canvases do not receive pointer input.

Warm house windows combine recessed frames, radial light, soft halos, and light spilling onto snow. Town arrival increases their light from 0.65 to 1 as section progress advances. Hearth light varies gently over 8s; garden lamps use an 11s cycle. Chimney wisps drift over 6s with staggered delays; their horizontal drift follows the shared gust rather than a fixed endpoint. The forest trail sign sways over 7s while its environment is visible. Project screenshot frames gain a warm, low-opacity light wash on row hover or keyboard focus, fading over 250ms.

The top-of-page motion toggle pauses weather and scenic animation while preserving the current scroll-depth and traveler placement; scrolling remains native. `src/components/SceneryMotion.tsx` uses Motion's `useScroll` and `useAnimationFrame`, while `useSyncExternalStore` reacts to live reduced-motion media-query changes. Reduced motion clears scenic transforms, places the traveler at the trail start with no stride, hides the weather canvases, disables smooth scrolling and cloud/smoke animation, and disables the toggle with the label “Motion reduced.” Without JavaScript, content and static scenery remain available and the toggle stays hidden. An intersection observer limits weather drawing and scenic updates to visible environments; CSS cloud, smoke, and light effects pause offscreen. Hiding the document cancels the animation frame loop, and returning resumes it when motion is enabled.

**The Quiet Motion Rule.** Move scenery around stationary reading surfaces with native scrolling; provide a pause control, honor reduced motion, and suspend effects outside the visible scene.

The homepage depth order belongs to the shared main stacking context: terrain backdrops at -2, the continuous route at -1, foreground tree and building SVGs at 0, weather at 1, and reading surfaces at 2. Preserve these relationships across section boundaries so local scenery does not paint over or hide the road.

**The Connected Ground Rule.** Keep the route and connected snowbanks outside parallax transforms; share road geometry across sections and keep foreground trees and houses stationary around it.

Three low-opacity geometric SVG cloud groups drift across the summit terrain at staggered durations (62s, 73s, and 84s), moving between -25px and 55px horizontally with alternate linear loops. They share the existing visibility, pause, and reduced-motion controls; they do not move reading surfaces or the connected ground.

## Shapes

Use gently rounded rectangular paper surfaces with the shared surface radius (8px). Buttons, screenshot frames, portraits, and detail heading backplates use tighter corners (4px); focus outlines and the wooden trail sign use 3px. Self-rating dots are small circles (6px). Thin straight dividers organize skills and education.

Illustration uses angular peaks, stepped pine silhouettes, pitched roofs, and soft snow contours. Mountain and arrow marks are inline stroke SVGs. Keep scenery in SVG; preserve real portraits and project screenshots as evidence assets.

## Components

### Buttons

The contact action is a compact pine rectangle with paper text, tight corners, and an inline arrow. Hover changes the background to ink over 0.2s ease. Interactive links and buttons receive a visible focus outline (3px solid `#397d88`, offset 6px). Disabled buttons are half-opacity with the default cursor.

### Text links

Standalone actions use bold small text, a bottom border, and an inline SVG arrow. Hover shifts that arrow right (4px over 0.2s ease). Ordinary inline links remain underlined, with a thicker underline on hover. Reduced motion removes transitions.

### Navigation

All pages render the same `src/components/Header.astro` through `BaseLayout.astro`, with Home, About me, CTF Rankings, and Blog in one shared link list. The header uses normal document flow and the winter-sky surface on both home and inner pages. Below 700px the wordmark and social buttons share the first row, and all four navigation links share a second row; the wordmark stays on one line. The scenery toggle belongs inside the summit below the navbar. Trail measurements cache the main content’s document offset so the traveler stays aligned after the shared header.

A small mountain wordmark faces a simple visible link row for Home, About me, CTF Rankings, and Blog. The current item and hovered links gain an underline; there is no invented selected pill or mobile drawer. A skip link becomes visible on keyboard focus. Retain semantic links and `aria-current`.

### Reading surfaces and project rows

Paper panels are flat and opaque. Reading surfaces hold extended copy; project rows hold an actual screenshot and a short text area. Screenshot frames use a 16:10 ratio and `object-fit: contain`; hovering the image link gives a small image scale change (1.025 over 0.3s ease). Preserve the screenshot rather than cropping away project evidence.

### Blog index and article surfaces

The blog reuses the same page-heading backplate and flat paper vocabulary. Index and tag pages present divided post rows with date, category, description, and underlined text tags. Articles use a paper reading surface capped at 72ch, an optional sticky table of contents on wide screens, and code blocks in ink with paper text. Covers use a 16:9 frame with `object-fit: contain`; narrow layouts collapse to one column and keep code horizontally scrollable. Blog routes do not introduce a second visual world or typography system.

### Skill and education rows

Thin line dividers separate records. Skills pair a heading and five small self-rating dots with prose; the dots have an accessible self-rating label. Education rows pair an existing crest with headings, dates, and text. These are content records, not interactive cards or filter chips.

### Gallery controls

Previous/next buttons are square (44px), lightly bordered, and paper-backed, with a pale hover fill and a small image count. JavaScript reveals controls for multi-image galleries and wraps navigation in both directions. Keep native buttons, keyboard focus, descriptive image alternatives, and non-JavaScript image access.

### Detail heading backplate

The detail banner reuses the mountain illustration. Its title and introductory links sit inside an opaque paper backplate with tight corners and medium padding. Preserve this surface at mobile widths; text must not fall directly onto mountain shapes.

### Continuous ground route

Three round-capped, round-joined strokes share one measured path: a broad snow bank, a narrow contrasting edge, and a pale road core. Their widths are 110 / 34 / 25 on desktop and 42 / 18 / 12 at 600px and below. These are scene-local styles, not new palette tokens. Keep the route decorative and pointer-transparent. Every bend must meet the next with the same endpoint and vertical tangent direction; do not apply a scroll-depth transform to any of its strokes.

### Trail traveler

A tiny geometric SVG hiker follows the existing shared route as the page scrolls. Layout measurement caches 513 evenly spaced samples from the route core; runtime positioning searches and interpolates those samples without per-frame SVG geometry reads. Its target tracks a point 72% down the viewport. Small alternating leg offsets depend on scroll position, so the traveler never walks in place while idle. Pause freezes its current position; reduced motion places it at the route start and clears stride. The traveler remains decorative and pointer-transparent, leaving the route geometry unchanged.

### Scenery motion toggle

A paper-backed, lightly bordered button near the top of the page controls scenery animation. It uses a small inline pause icon, a 12px label, tight corners, and a minimum height of 44px. Hover changes paper to snow. Preserve the shared visible keyboard focus. Its accessible name is “Scenery animation”; `aria-pressed` and the visible label reflect “Motion on” or “Motion off.” Reduced motion disables it and shows “Motion reduced.” This control is revealed only when the homepage runtime initializes; pausing retains the current scenery placement.

### Trail sign

A small, slightly rotated timber sign beside the forest is a keyboard-focusable link to projects. Its brown board, short post, and townward arrow provide wayfinding within the scene while conventional navigation remains available. Hover darkens the board; preserve the shared visible focus outline and native anchor behavior. The linked board sways gently only while its forest scene and motion are active; reduced motion disables its sway.

No form fields, chips, or dialogs currently exist; do not infer their design from generic panel examples.

## Do's and Don'ts

### Do:

- **Do** use the actual SVG winter assets and subtle texture as the visual authority.
- **Do** keep resume content and project evidence legible on opaque paper surfaces.
- **Do** preserve CaskaydiaCove, straightforward navigation, and simple layouts.
- **Do** retain visible keyboard focus and reduced-motion behavior.
- **Do** keep real portraits and project screenshots alongside illustrated scenery.
- **Do** preserve the shared route geometry and depth order across section boundaries.
- **Do** use the established paper, type, divider, and focus treatments for blog posts and tag archives.

### Don't:

- **Don't** use the rejected image-generated raster proposals as assets or design authority.
- **Don't** add fancy typography or elaborate layouts that compete with the portfolio.
- **Don't** replace the quiet winter town with dense neon or gothic imagery.
- **Don't** move reading surfaces with the scenery, hijack native scrolling, or run scenic effects while motion is paused or reduced.
- **Don't** treat self-rating dots as independent interactive controls.
- **Don't** split the road into local scene paths or apply parallax to connected ground.


## Blog landscape and page height

Blog index, tag archives, and articles share `src/layouts/BlogLayout.astro` and `src/components/BlogLandscape.astro`. Their landscape spans the full main content width and height rather than a boxed banner: `public/images/alpine/blog-peaks.svg` begins the descent, while `blog-forest.svg` repeats down the margins with pines and small snow-covered mountains. The forest margins use curved snow contours and transparent inner/top edges; the route is one stretched SVG path, never separate road tiles. Blog scenery contains no houses or town and follows native document scrolling without an autonomous animation loop. Opaque paper surfaces keep writing legible.

The document body is a flex column with a minimum height of `100svh`; the main content grows to use remaining space, and header/footer retain their natural sizes. This keeps the footer at the end of the document on empty, short, tall-viewport, and long-article pages. Print removes the decorative landscape and restores block flow.


## Personal links and theme story

The shared navbar places LinkedIn, GitHub, and Email immediately to the right of the name, aligned on the same center line with a 12px gap. `SocialLinks.astro` uses profile destinations, accessible labels and titles, and prominent 22px stroke icons in 44px circular paper-backed buttons with a subtle border. Hover or keyboard focus enlarges only the icon to 1.15 over 160ms; reduced motion removes the transform and transition while retaining focus outlines. The footer contains only the Back to top link, aligned to the right.

`ThemeNote.astro` adds a small “A memory of Zakopane” section beneath education in the homepage About section. A simple divider and existing typography keep it part of the reading surface. Its heading and paragraphs live in `profile.theme` and are editable in Pages CMS under Site theme story. The text records the owner's supplied memory of winter hiking during exchange and the wish to revisit that peaceful feeling from Singapore.


## Homepage CTF rankings

The homepage sequence is summit → short forest trail → CTF rankings in the town → About/garden → contact square. The forest remains a 360px scenic transition (300px on mobile), with its former My Skills content removed. `CtfRankings.astro` shows three ordered results in one paper reading surface with simple dividers. Event and optional category appear beside the placement. The title includes the Lucide flag icon; its source asset and license are in `public/icons`.

The section heading is “My past CTF rankings,” with a “CTF writeups & blog” link to `/blog/` below the results. The current anchor is `#ctf-rankings`; `#project_header` and `#work-experience` remain compatibility targets. Navbar, forest sign, and blog empty-state links point to the rankings anchor. The summit has one quick link, “About me,” pointing to `#about`. Trail geometry uses the rankings section ID and continues uninterrupted through the shorter forest transition. `src/data/ctf-rankings.json` owns the content and Pages CMS exposes its ordered rankings. Older project detail URLs remain available.


## Site icon

The shared layout uses miniature versions of the owner-supplied red-hooded pixel-art portrait as the browser icon. PNGs at 16px and 32px and a 180px Apple touch icon live in `public/icons`; `public/favicon.ico` includes 16px, 32px, and 48px variants. These are direct resizes of the supplied artwork. The mountain wordmark in the navbar remains the site identity within the alpine interface.


## Clear trail and homepage About

`keepTrailClear` runs after the continuous route is measured, on initial layout, font readiness, and resize. It compares complete tree and chalet bounds with the route and reserves the outer road edge plus a quiet margin. Objects that intrude are hidden as whole groups, including their light and smoke; no mask slices silhouettes or paints a road across a house. This placement pass does not run on scroll. Visibility preserves geometry so objects can return when a different viewport provides enough room. Snow, smoke, windows, distant peaks, and the traveler keep their existing motion.

About me lives only at `/#about` on the homepage. Shared navigation and the summit quick link scroll there. The `/about` route is removed entirely. The older `/webpages/about_me.html` compatibility link points directly to the homepage section.
