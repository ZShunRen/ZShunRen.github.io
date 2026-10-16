# Alpine portfolio inspiration

Research note for the existing illustrated SVG portfolio. Reviewed 2026-10-16. I found no exact match for a continuous, hand-drawn winter mountain-to-forest-to-alpine-town portfolio with straightforward résumé content. These four first-party references offer useful pieces of the direction. They are interaction and craft references; no external artwork is planned for reuse.

## References

### Bruno Simon — driveable 3D world

- Live site: [bruno-simon.com](https://bruno-simon.com/)
- Source: [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025)
- Observed: The site asks visitors to drive around a world to learn about Bruno and discover details. It documents keyboard, touch, and gamepad controls, map access, interactions, and recovery controls. The repository lays out environmental systems for weather, foliage, grass, leaves, rain, snow, lanterns, and benches.
- Adapt: Use a small number of visible landmarks to make the journey feel explorable. Keep any interaction optional and leave the standard section links easy to reach.
- Avoid: The full driving simulation makes the portfolio harder to scan and uses a detailed 3D world unlike the site’s vector artwork.
- License: The repository lists MIT. No asset reuse is planned.

### Chris Simmons / Endigo Design — hand-drawn game portfolio, prior iteration

- Project page: [Portfolio Game](https://endigodesign.com/works/gaming/portfolio)
- Live archived experience: [launch link](https://d2zwgjl5tcwau5.cloudfront.net/)
- Source: [endigo9740/endigo-design](https://github.com/endigo9740/endigo-design)
- Observed: Simmons’s first-party project page says this was a prior version of his portfolio. It describes an overworld inspired by *Hyper Light Drifter*, sprites drawn in Aseprite, a map made in Tiled, and interactive canvas/WebGL powered by PixiJS. Project details opened in modal overlays. The linked repository is his current general portfolio source, so it should not be treated as the source for every feature of the old game.
- Adapt: The authored sprites and tile map show how consistent, deliberately drawn shapes can make a personal site feel like a game world. Project details can open in a familiar content panel.
- Avoid: The dark action-game mood differs from the warm alpine direction. No repo or asset license was verified; do not copy its art.

### Henry Heffernan — 3D desk portfolio

- Live site: [henryheffernan.com](https://henryheffernan.com/)
- Source: [henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website) and companion [portfolio-inner-site](https://github.com/henryjeff/portfolio-inner-site)
- Observed: The source README ties the 3D workspace portfolio to Henry’s domain; GitHub lists the main repository under MIT. Visitors inspect a desk-like scene to find portfolio content, with a separate desktop-style interface displayed within it. The live scene is JavaScript-rendered, so text extraction is limited.
- Adapt: Give a few scene details clear purposes and let them open ordinary, readable project or background content. A separate information layer makes it possible to keep the scene playful and the content legible.
- Avoid: A simulated room or OS creates extra navigation work and does not support the landscape art direction. Keep résumé access immediate.

### Maxime Heckel — authored atmospheric rendering and technical storytelling

- Live personal blog: [blog.maximeheckel.com](https://blog.maximeheckel.com/)
- Source: [MaximeHeckel/blog.maximeheckel.com](https://github.com/MaximeHeckel/blog.maximeheckel.com)
- First-party studies: [Real-time dreamy cloudscapes](https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/) and [On shaping light](https://blog.maximeheckel.com/posts/shaping-light-volumetric-lighting-with-post-processing-and-raymarching/)
- Observed: The live blog combines readable technical articles with interactive visual studies. The linked repository identifies itself as the blog’s codebase; it licenses source under MIT and article/image content separately under CC BY-NC 4.0. Its cloud and lighting studies are authored procedural graphics, not portfolio scenery.
- Adapt: Use the studies as references for how cloud shape, light falloff, and atmospheric depth can be explained and tuned. For this site, translate those principles into simple SVG shapes and restrained glows, without importing a WebGL renderer.
- Avoid: The shader effects are more technical and dimensional than the existing illustration. Do not reuse article images or code as artwork; the content license is non-commercial and separate from the source license.

## Reference note: wooainsley.com

[wooainsley.com](https://wooainsley.com/) currently identifies Ainsley Woo and presents AI/security services and research. Its current published site does not show the game-world aesthetic described in the request, so it is not a verified visual reference for the current version. This is not the similarly named Ainsley Chang site.

## Concrete refinements for the current SVG site

The existing site already has vector summit, forest, town, and garden scenes, an SVG route connected to section geometry, scroll-driven parallax, variable snow by region, flexible tree motion, chimney smoke, and warm town window lights. Three refinements build on those systems:

1. **Give the route a tiny traveler and clear wayfinding.** Add a small SVG hiker or sled that follows the existing `.journey-route` stroke as page scroll advances, with reduced-motion and static fallbacks. Place a few named, keyboard-focusable markers beside the route at the existing `About`, `Projects`, and `Contact` anchors. This borrows the discovery cue from game portfolios while preserving normal page navigation.
2. **Tie the weather to one shared gust.** `scripts/site.js` already calculates a gust for snow and bends foliage, and `css/styles.css` animates chimney smoke on an independent timer. Drive smoke drift and foliage sway from that same gust value so they lean together. Keep the current intensity change from exposed summit to sheltered town, with shorter, slower flakes near the cabins.
3. **Add a few drifting clouds to bridge scenes.** Draw two or three simple SVG cloud groups at different depths and let them move slowly across the sky as the reader scrolls. Keep their opacity low and edges geometric, in the same hand-authored style as the existing mountains. This adds a quiet sense of scale without adding photographic or generated scenery.

## Sources checked

The linked first-party pages and GitHub repositories/README/license sections support the reference notes. Current implementation details were checked in [`index.html`](../../index.html), [`scripts/site.js`](../../scripts/site.js), and [`css/styles.css`](../../css/styles.css).
