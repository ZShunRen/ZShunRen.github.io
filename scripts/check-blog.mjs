import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Exercise the actual content loader and routes, then restore a clean build.
const root = resolve(import.meta.dirname, "..");
const fixtureDir = resolve(root, "src/content/posts/integration-check");
const output = resolve(root, "dist");
const collisionPost = resolve(root, "src/content/posts/integration-ctf-2000.md");
assert(!existsSync(collisionPost), "Reserved collision fixture already exists");
assert(!existsSync(fixtureDir), "Reserved integration fixture directory already exists");
const build = () => {
  const result = spawnSync(process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], {
    cwd: root,
    stdio: "inherit",
  });
  assert.equal(result.status, 0, "Astro build failed");
};
const read = (path) => readFile(resolve(output, path), "utf8");
const post = (title, date, draft, tags = "[integration, 'C++', 'C#', 安全]", ctfName) => `---
title: "${title}"
description: "Temporary publishing integration check."
date: ${date}
tags: ${tags}
category: ctf
${ctfName ? `ctfName: ${JSON.stringify(ctfName)}\n` : ""}draft: ${draft}
---

## Proof

A paragraph with a [reference](https://example.com).

\`\`\`python
print("integration check")
payload = "${'a'.repeat(160)}"
\`\`\`

![Portrait used to check image rendering](/images/me.jpg)

### Explanation

Technical notes should remain readable beside the winter scenery.

## Takeaways

| Check | Expected result |
| --- | --- |
| Published content | Visible after a build |
| Draft content | Excluded from public routes |
`;

let failure;
try {
  await mkdir(fixtureDir, { recursive: true });
  await writeFile(resolve(fixtureDir, "published.md"), post("Publishing check", "2000-01-02", false, undefined, "Integration CTF 2000"));
  await writeFile(resolve(fixtureDir, "same-event.md"), post("Same event check", "2000-01-01", false, undefined, " integration ctf 2000 "));
  await writeFile(resolve(fixtureDir, "other-event.md"), post("Other event check", "1999-01-01", false, undefined, "Other Integration CTF"));
  await writeFile(resolve(fixtureDir, "unnamed.md"), post("Unnamed event check", "1998-01-01", false));
  await writeFile(resolve(fixtureDir, "draft.md"), post("Hidden draft check", "2000-01-01", true, "[hidden-draft-only]", "Hidden Draft Event"));
  await writeFile(resolve(fixtureDir, "future.md"), post("Hidden future check", "2999-01-01", false, "[hidden-future-only]", "Hidden Future Event"));
  await writeFile(resolve(fixtureDir, "same-event-draft.md"), post("Hidden grouped draft", "2000-01-03", true, "[hidden-draft-only]", "Integration CTF 2000"));
  await writeFile(resolve(fixtureDir, "single-event-future.md"), post("Hidden single future", "2999-01-01", false, "[hidden-future-only]", "Other Integration CTF"));
  await writeFile(resolve(fixtureDir, "work.md"), post("Work check", "2001-01-01", false).replace("category: ctf", "category: work"));
  build();
  const index = await read("blog/index.html");
  assert(index.includes('href="/blog/integration-ctf-2000/"'), "Multi-writeup event must link to its archive");
  assert(index.includes("integration-check/work"), "Work post must remain an individual entry");
  assert(index.indexOf("integration-check/work") < index.indexOf("/blog/integration-ctf-2000/"), "Work and event entries must share date ordering");
  assert(index.includes("2 writeups"), "Event count must include only published writeups");
  assert(!index.includes("integration-check/published"), "Grouped article must be collapsed on the index");
  assert(!index.includes("integration-check/same-event"), "Second grouped article must be collapsed");
  assert(index.includes("integration-check/other-event"), "Single writeup must link directly to article");
  assert(index.includes("integration-check/unnamed"), "Unnamed writeup must stay individual");
  assert(index.indexOf('/blog/integration-ctf-2000/') < index.indexOf('integration-check/other-event'), "Entries must sort by latest publication");
  const eventGroup = await read("blog/integration-ctf-2000/index.html");
  assert(eventGroup.includes("integration-check/published"), "First writeup missing from event page");
  assert(eventGroup.includes("integration-check/same-event"), "CTF names must ignore case and whitespace");
  assert(!eventGroup.includes("integration-check/other-event"), "Different events must remain separate");
  assert(eventGroup.indexOf("integration-check/published") < eventGroup.indexOf("integration-check/same-event"), "Event writeups must remain newest first");
  assert((await read("blog/other-integration-ctf/index.html")).includes("1 writeup"), "Single-writeup event needs a stable archive");
  assert(!index.includes("Hidden Draft Event"), "Draft-only CTF group leaked");
  assert(!index.includes("Hidden Future Event"), "Future-only CTF group leaked");
  assert(!existsSync(resolve(output, "blog/hidden-draft-event/index.html")), "Draft-only event route leaked");
  assert(!existsSync(resolve(output, "blog/hidden-future-event/index.html")), "Future-only event route leaked");
  const article = await read("blog/integration-check/published/index.html");
  assert(article.includes('href="/blog/integration-ctf-2000/"'), "Article must link to its CTF page");
  assert.match(article, /id="proof"/, "Markdown headings must have anchors");
  assert.match(article, /data-language="python"/, "Fenced code must retain language metadata");
  assert.match(article, /<img[^>]+src="\/images\/me.jpg"/, "Markdown images must render");
  const tagMatch = article.match(/href="(\/blog\/tags\/[^\"]+\/?)"/);
  assert(tagMatch, "Article must link to its tag archive");
  const tagPath = tagMatch[1].replace(/^\//, "").replace(/\/$/, "") + "/index.html";
  assert(existsSync(resolve(output, tagPath)), "Tag archive missing");
  const tagLinks = [...article.matchAll(/href="(\/blog\/tags\/[^\"]+\/?)"/g)].map((match) => match[1]);
  assert.equal(new Set(tagLinks).size, 4, "Punctuation and Unicode tags need distinct valid URLs");
  const publicSurfaces = await Promise.all([
    read("sitemap-0.xml"), eventGroup,
    read(tagPath),
  ]);
  for (const surface of [index, ...publicSurfaces]) {
    assert(!surface.includes("integration-check/same-event-draft"), "Grouped draft leaked");
    assert(!surface.includes("integration-check/single-event-future"), "Future post in a single-writeup event leaked");
  }
  for (const surface of publicSurfaces) {
    assert(surface.includes("integration-check/published"), "Published post missing from a public surface");
    assert(!surface.includes("integration-check/draft"), "Draft leaked into public output");
    assert(!surface.includes("integration-check/future"), "Future post leaked into public output");
    assert(!surface.includes("hidden-draft-only"), "Draft-only tag leaked into public output");
    assert(!surface.includes("hidden-future-only"), "Future-only tag leaked into public output");
  }
  assert(!existsSync(resolve(output, "blog/integration-check/draft/index.html")), "Draft route was generated");
  assert(!existsSync(resolve(output, "blog/integration-check/future/index.html")), "Future route was generated");
  const sitemap = await read("sitemap-0.xml");
  assert(sitemap.includes("/blog/integration-ctf-2000/"), "Event page missing from sitemap");
  // Optional isolated output for visual review; the real dist is restored below.
  if (process.env.BLOG_REVIEW_DIR) {
    await cp(output, resolve(process.env.BLOG_REVIEW_DIR), { recursive: true });
  }
  for (const name of ["Integration CTF 2000!", "tags", "index"]) {
    const collisionFile = resolve(fixtureDir, "collision.md");
    await writeFile(collisionFile, post("Collision check", "2000-01-01", false, undefined, name));
    const result = spawnSync(process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], { cwd: root, encoding: "utf8" });
    assert.ifError(result.error);
    assert.notEqual(result.status, 0, "Conflicting event routes must fail the build");
    assert((result.stdout + result.stderr).includes("conflicts with"), "Collision error must explain the conflict");
    await rm(collisionFile);
  }
  await writeFile(collisionPost, post("Article URL collision", "2000-01-01", false));
  const collision = spawnSync(process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], { cwd: root, encoding: "utf8" });
  assert.ifError(collision.error);
  assert.notEqual(collision.status, 0, "Event and article URL collisions must fail the build");
  assert((collision.stdout + collision.stderr).includes('conflicts with post "integration-ctf-2000"'), "Error must identify conflicting article");
  await rm(collisionPost);
  assert(!existsSync(resolve(output, "rss.xml")), "RSS should remain disabled");
  console.log("Blog checks passed: event pages, grouping, ordering, route collisions, Markdown, tags, sitemap, draft/future exclusion; RSS disabled.");
} catch (error) {
  failure = error;
} finally {
  await rm(fixtureDir, { recursive: true, force: true });
  await rm(collisionPost, { force: true });
  build();
}
if (failure) throw failure;
