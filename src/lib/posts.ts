import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export interface CtfEvent {
  label: string;
  slug: string;
  posts: Post[];
  date: Date;
}

export type BlogEntry =
  | { kind: "post"; post: Post }
  | { kind: "event"; event: CtfEvent };

export function ctfSlug(name: string): string {
  const normalized = name.trim().normalize("NFKC").toLowerCase();
  const base = normalized.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `ctf-${Array.from(normalized, (char) => char.codePointAt(0)!.toString(16)).join("-")}`;
}

export function getCtfEvents(posts: Post[]): CtfEvent[] {
  const groups = new Map<string, CtfEvent>();
  for (const post of posts) {
    const name = post.data.category === "ctf" ? post.data.ctfName?.trim() : undefined;
    if (!name) continue;
    const key = name.normalize("NFKC").toLowerCase();
    const event = groups.get(key) ?? { label: name, slug: ctfSlug(name), posts: [], date: post.data.date };
    event.posts.push(post);
    groups.set(key, event);
  }

  const routes = new Map<string, string>([["tags", "tag archives"], ["index", "blog index"]]);
  for (const post of posts) {
    const slug = postSlug(post);
    if (slug.split("/")[0] === "tags" || slug === "index") {
      throw new Error(`Post "${post.id}" conflicts with a reserved blog route. Rename its file.`);
    }
    routes.set(slug, `post "${post.id}"`);
  }
  for (const event of groups.values()) {
    const conflict = routes.get(event.slug);
    if (conflict) {
      throw new Error(`CTF "${event.label}" at /blog/${event.slug}/ conflicts with ${conflict}. Rename the CTF or the conflicting post.`);
    }
    routes.set(event.slug, `CTF "${event.label}"`);
    event.posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
    event.date = event.posts[0].data.date;
  }
  return [...groups.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getBlogEntries(posts: Post[]): BlogEntry[] {
  const events = getCtfEvents(posts).filter((event) => event.posts.length > 1);
  const grouped = new Set(events.flatMap((event) => event.posts.map((post) => post.id)));
  return [
    ...events.map((event): BlogEntry => ({ kind: "event", event })),
    ...posts.filter((post) => !grouped.has(post.id)).map((post): BlogEntry => ({ kind: "post", post })),
  ].sort((a, b) => {
    const date = (entry: BlogEntry) => entry.kind === "event" ? entry.event.date : entry.post.data.date;
    return date(b).getTime() - date(a).getTime();
  });
}

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
