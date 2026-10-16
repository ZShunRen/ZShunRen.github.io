import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export function postSlug(post: Post): string {
  return post.id.replace(/\.(md|mdx)$/i, "");
}

export function tagSlug(tag: string): string {
  const normalized = tag.trim().normalize("NFKC").toLowerCase();
  const base = normalized
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let hash = 2166136261;
  for (const character of normalized) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return `${base || "tag"}-${(hash >>> 0).toString(36)}`;
}

export async function getPublishedPosts(): Promise<Post[]> {
  const now = new Date();
  const posts = await getCollection(
    "posts",
    ({ data }) => !data.draft && data.date.getTime() <= now.getTime(),
  );

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
