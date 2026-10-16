# Summit to town

Mode: Experience, with professional portfolio readability.

## Confirmed direction

The user approved a continuous winter descent: mountain lookout → forest skills → town projects → about, education, and town-square contact. Use clean illustrated vector shapes with a little texture, simple typography, and conventional navigation. Preserve the original content except for the approved subtitle. CaskaydiaCove Nerd Font is explicitly requested for body text and is self-hosted.

## First viewport

Shun Ren and “Singapore-based security & software engineer” appear immediately above a layered mountain landscape. A direct project link supports visitors evaluating work without taking the scenic route.

## Signature behavior

A path continues down the page through pines and timber houses. Scrolling moves independently layered peaks, foreground trees, and town buildings with stronger foreground travel. The connected trail belongs to one page-wide ground plane and is never independently transformed. Native scrolling and stationary reading surfaces remain the navigation model.

One shared gust rhythm drives directional snow across the summit, forest, projects, town garden around About, and contact square. Each region has a different exposure: strongest at the summit, sheltered through the trees, softer around the town. Pine foliage bends with the wind; the trail sign rocks gently. Window recesses, warm pane gradients, local halos, and snow light pools give houses depth. Smoke drifts from chimneys; garden lanterns carry the warmth beside biography and education. Project links add a warm reflection on hover or keyboard focus.

The top-of-page scenery toggle freezes the current scenery position and pauses ambient animation. The operating system's reduced-motion preference disables particles, spatial transforms, and loops while preserving static warm lighting. Offscreen scenery pauses through IntersectionObserver; a hidden document cancels the animation frame. Weather particle counts shrink on narrow viewports and canvas backing resolution is capped at 1.5 device pixels per CSS pixel.

Reading content stays visible without JavaScript. Gallery navigation remains operable by keyboard; extra images are available without JavaScript.

## Motion thesis and budget

- Focal sequence: the exposed summit becomes a sheltered trail and then a warm inhabited town as the visitor scrolls.
- Continuity: the same wind direction, gust rhythm, snow palette, and depth model link each homepage region; exposure and light change by place.
- Feedback: motion control exposes its state; project hover/focus introduces a warm reflection without moving text.
- Budget: a single requestAnimationFrame coordinator advances visible canvas scenes and foliage. Geometry is cached outside the frame loop. A single measured cubic route connects every section with shared endpoints and tangents, recomputed after layout and resize. Transparent section grounds and separate terrain/foreground layers prevent rectangular seams. Lightweight SVG transforms carry depth; radial gradients are bounded to individual windows and pools of light rather than full-frame blur filters.

## Authority and scope

The user rejected all three image-generated mockups as obviously AI-generated, then explicitly chose code-native clean illustrated shapes and authorized implementation. None of those raster comps is approved or authoritative. This is a code-led build. The abandoned comp-led state is preserved in `.impeccable/build/rejected-raster-state.json`; its pending gates are not represented as passed.

## Verification

Required captures: desktop 1440 × 1000 and mobile 390 × 844, full-page home, about, and both project routes, under `.impeccable/review/`. Check content preservation, local links/assets, galleries in both directions, font loading, image loading, overflow, reduced motion, and keyboard navigation. Original dated biographical claims are preserved at the user's request rather than silently updated.
