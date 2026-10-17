# Publishing the Astro site

The site stores posts as Markdown in `src/content/posts` and deploys the generated static site through GitHub Pages. Pages CMS is a browser editor for those repository files; it does not host the public site or provide a separate content database.

## One-time setup

These account and repository settings require the repository owner and have not been performed automatically:

1. Merge the Astro rewrite, including `.pages.yml`, `.github/workflows/deploy.yml`, and the npm lockfile, into `main`.
2. Open the repository on GitHub, then go to **Settings → Pages → Build and deployment** and choose **GitHub Actions** as the source.
3. Visit [app.pagescms.org](https://app.pagescms.org), sign in with GitHub, and install the Pages CMS GitHub App for the account that owns `ZShunRen/ZShunRen.github.io`. Grant it access to this repository.
4. Open `ZShunRen/ZShunRen.github.io` and the `main` branch in Pages CMS. It will read the committed `.pages.yml`; there is no credential to add to this repository.
5. Confirm that **Posts**, **Profile**, **CTF Rankings**, and **Archived projects** appear. Create a draft test post, save it, and check that the resulting commit starts the **Deploy to GitHub Pages** workflow.

The workflow uses Node 24, installs locked dependencies with `npm ci`, checks templates and types, builds Astro, and uploads `dist` using the official GitHub Pages actions. Its `GITHUB_TOKEN` receives only repository-content read access plus the Pages and OpenID permissions required for deployment, scoped to the relevant jobs. The repository is a root user site, so its expected address is `https://zshunren.github.io/` and it does not need an Astro `base` path. No `CNAME` file was present when this setup was written; add `public/CNAME` and update Astro's `site` setting only if a custom domain is introduced later.

## Writing in Pages CMS

Choose **Posts**, then create a new entry. The filename shown during creation is the permanent post ID and URL slug. Use lowercase words separated by hyphens, such as `memory-forensics-notes`. Pages CMS hides that filename field after creation so changing the title does not silently change the URL.

Fill in the title, description, date, tags, category, and body. New entries default to `draft: true`. The category must be `work` or `ctf`. The source-mode switch in the body editor is useful for technical Markdown that the visual editor cannot express precisely.

Use fenced code blocks with a language name:

````markdown
```bash
nmap -sV 192.0.2.10
```
````

Upload screenshots through the editor or media browser. Pages CMS saves them under `public/uploads` and writes public paths beginning with `/uploads`, for example:

```markdown
![Packet capture showing the DNS response](/uploads/dns-response.png)
```

Write useful alt text for every informative image. If a post has a cover image, fill in **Cover image alt text** too. Avoid embedding secrets, live challenge credentials, or private evidence in posts or uploads.

Saving in Pages CMS creates a Git commit. A commit to `main` triggers a build and deployment; there is no separate CMS publish button. A saved draft remains in the repository but must be excluded by the site from production post pages, archives, tag pages and sitemaps. On a public repository, draft Markdown and uploaded media are still publicly readable in GitHub.

Changing `draft` to `false` and saving makes the post eligible for the next production build. A future `date` must also be excluded everywhere production content is queried. GitHub Pages does not schedule builds, so a future-dated post becomes visible only after a build runs on or after that date, such as a later content commit or a manual workflow run.

The **Profile** editor changes only the name, subtitle, description, contact links, About paragraphs, and the site theme story stored in `src/data/profile.json`. Those values feed the homepage, including its About section. There is no separate About page. The **CTF Rankings** editor manages the ordered rankings in `src/data/ctf-rankings.json`, including event and year, optional category, and placement. The list follows the order saved in the editor. The **Archived projects** editor changes the title, description, repository link, and detail paragraphs stored in `src/data/projects.json` for the two existing projects. Layout, styling, navigation, media galleries, and components remain code changes.

## Writing locally

Once dependencies are installed, use the repository scripts:

```bash
npm run dev
npm run check
npm run build
npm run preview
```

Create a draft scaffold without Pages CMS with:

```bash
node scripts/new-post.mjs "Post title" optional-slug
```

The command refuses to overwrite an existing post. Review its description, category, tags, and body before committing it. Keep the generated slug once links to the post may exist.

For a CTF writeup, supply the event name (including the year to distinguish editions):

```bash
npm run new-post -- "The Public Counter" example-ctf-2026-public-counter --ctf "Example CTF 2026"
```

This creates a draft with `category: ctf` and `ctfName: "Example CTF 2026"`. For existing writeups, add `ctfName` to the frontmatter, or fill in **CTF Name** in Pages CMS. The blog matches CTF names ignoring case and surrounding whitespace. Events with two or more published writeups appear as one entry showing the event name, writeup count, and latest publication date. Single writeups, unnamed CTF posts, and work posts link directly to their articles. All entries are ordered newest first.

Every named CTF also gets an event page, such as `/blog/example-ctf-2026/`, using the same blog layout and listing its writeups newest first. Article CTF names link back to this page. Event pages exist even with one published writeup, so the event URL stays available as more are added. Drafts and future posts do not count toward grouping or appear on event pages. Individual post URLs stay based on their filenames; tag archives continue listing individual articles.

Event URLs are generated from lowercase, hyphenated CTF names. Include the year to distinguish editions, and keep the event name consistent once linked publicly. Names without ASCII letters or numbers use a deterministic encoded fallback. A build fails with an explanatory error if event names produce the same URL or collide with an article or reserved route (`tags` or `index`); rename the conflicting event or post to resolve it.

Before pushing, run `npm run check` and `npm run build`. Use `npm run preview` to inspect the production output, including draft and future-date filtering. Commit the generated `package-lock.json`; the deployment action uses the lockfile to select npm and install the exact dependency tree.

The development site also hides drafts and future-dated posts. To inspect a complete article locally, temporarily set its `draft` field to `false` and its date to today or earlier. These local edits do not publish anything until pushed. Restore the draft flag before committing if the post is not ready. The hosted CMS editor preview is separate from a preview of the full website; automatic draft preview deployments are not configured.

## Troubleshooting

- If Pages CMS cannot see the repository, review the GitHub App installation and repository access at GitHub rather than adding a token to the codebase.
- If a save does not deploy, verify the commit reached `main` and inspect the repository's **Actions** tab.
- If deployment says Pages is not configured, select **GitHub Actions** under **Settings → Pages**.
- If an image is broken, confirm the file exists below `public/uploads` and the Markdown path begins with `/uploads/`.
- If a draft appears publicly, treat it as a query-filtering defect and check every route, list, tag archive, and sitemap that reads the post collection.

Configuration details follow the [Pages CMS quick start](https://pagescms.org/docs/quick-start/), [Pages CMS configuration reference](https://pagescms.org/docs/configuration/), and [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/).
