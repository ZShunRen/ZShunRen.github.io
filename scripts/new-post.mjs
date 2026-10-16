import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [, , titleArg, slugArg] = process.argv;

if (!titleArg) {
  console.error('Usage: node scripts/new-post.mjs "Post title" [slug]');
  process.exitCode = 1;
} else {
  const slug = (slugArg ?? titleArg)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    console.error("The title or supplied slug must contain letters or numbers.");
    process.exitCode = 1;
  } else {
    const now = new Date();
    const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
      .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
      .join("-");
    const yamlTitle = JSON.stringify(titleArg);
    const post = `---
title: ${yamlTitle}
description: ""
date: ${date}
tags: []
category: work
draft: true
---

Start writing here.
`;
    const postsDirectory = resolve("src/content/posts");
    const postPath = resolve(postsDirectory, `${slug}.md`);

    await mkdir(postsDirectory, { recursive: true });
    try {
      await writeFile(postPath, post, { flag: "wx" });
      console.log(`Created ${postPath}`);
    } catch (error) {
      if (error && error.code === "EEXIST") {
        console.error(`A post already exists at ${postPath}`);
        process.exitCode = 1;
      } else {
        throw error;
      }
    }
  }
}
