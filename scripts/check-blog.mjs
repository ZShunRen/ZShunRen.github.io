import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Exercise the actual content loader and routes, then restore a clean build.
const root = resolve(import.meta.dirname, "..");
const fixtureDir = resolve(root, "src/content/posts/integration-check");
const output = resolve(root, "dist");
assert(!existsSync(fixtureDir), "Reserved integration fixture directory already exists");
const build = () => {
  const result = spawnSync(process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], {
    cwd: root,
    stdio: "inherit",
  });
  assert.equal(result.status, 0, "Astro build failed");
};
const read = (path) => readFile(resolve(output, path), "utf8");
const post = (title, date, draft, tags = "[integration, 'C++', 'C#', 安全]") => `---
title: "${title}"
description: "Temporary publishing integration check."
date: ${date}
tags: ${tags}
category: ctf
draft: ${draft}
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
  await writeFile(resolve(fixtureDir, "published.md"), post("Publishing check", "2000-01-01", false));
  await writeFile(resolve(fixtureDir, "draft.md"), post("Hidden draft check", "2000-01-01", true, "[hidden-draft-only]"));
  await writeFile(resolve(fixtureDir, "future.md"), post("Hidden future check", "2999-01-01", false, "[hidden-future-only]"));
  build();
  const index = await read("blog/index.html");
  const match = index.match(/href="([^"]*integration-check\/published\/?)"/);
  assert(match, "Published nested Markdown post is missing from blog index");
  const articlePath = decodeURIComponent(match[1]).replace(/^\//, "").replace(/\/$/, "") + "/index.html";
  const article = await read(articlePath);
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
    read("sitemap-0.xml"), read("blog/index.html"),
    read(tagPath),
  ]);
  for (const surface of publicSurfaces) {
    assert(surface.includes("integration-check/published"), "Published post missing from a public surface");
    assert(!surface.includes("integration-check/draft"), "Draft leaked into public output");
    assert(!surface.includes("integration-check/future"), "Future post leaked into public output");
    assert(!surface.includes("hidden-draft-only"), "Draft-only tag leaked into public output");
    assert(!surface.includes("hidden-future-only"), "Future-only tag leaked into public output");
  }
  assert(!existsSync(resolve(output, "blog/integration-check/draft/index.html")), "Draft route was generated");
  assert(!existsSync(resolve(output, "blog/integration-check/future/index.html")), "Future route was generated");
  // Optional isolated output for visual review; the real dist is restored below.
  if (process.env.BLOG_REVIEW_DIR) {
    await cp(output, resolve(process.env.BLOG_REVIEW_DIR), { recursive: true });
  }
  assert(!existsSync(resolve(output, "rss.xml")), "RSS should remain disabled");
  console.log("Blog checks passed: Markdown, code, images, nested URLs, tags, sitemap, draft/future exclusion; RSS disabled.");
} catch (error) {
  failure = error;
} finally {
  await rm(fixtureDir, { recursive: true, force: true });
  build();
}
if (failure) throw failure;
