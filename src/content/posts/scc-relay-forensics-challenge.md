---
title: "Relay Forensics Challenge"
description: ""
date: 2026-10-17
tags: []
category: ctf
ctfName: "SCC 2026"
draft: false
---
# Sentinel Directorate, Continuity Tooling Drop — Writeup

**Category:** Web (exposed VCS metadata / dangling git objects)
**Host:** S3 static website (`Server: AmazonS3`, bucket region `us-west-2`)
**Flag:** `flag{th3_r3fl0g_r3m3mb3rs}`

---

## 1. Briefing

The published drop is a decoy: two files and an index page.

| Path | Content |
|---|---|
| `/pub/index.html` | "Continuity Tooling Index"; states review required removal of the clearance material and that the offending revision was "taken out of the published history" |
| `/pub/ops-notes.txt` | revision 2, published; §3 redacted — `[REMOVED AT REVIEW. See records assurance sign-off.]` |
| `/pub/README.txt` | "Staging repository for the continuity tooling published to this host." |

Two hints frame the task:

- *"Rewriting history removes references, not objects."*
- *"The record of where this branch has been is still served alongside it."* → the **reflog**.

Bucket root, `/pub/` and other listings return `403 AccessDenied`; individual objects are world-readable.

## 2. Attack surface

The README calls the drop a *staging repository*, so the deployment shipped its VCS directory. Probe for the usual git metadata under `/pub/.git/`:

| Path | Status | Leak |
|---|---|---|
| `.git/HEAD` | 200 | `ref: refs/heads/master` |
| `.git/config` | 200 | author email `continuity@sentinel.directorate`; `repositoryformatversion = 0`, non-bare |
| `.git/logs/HEAD` | 200 | **reflog** — the orphaned commit |
| `.git/logs/refs/heads/master` | 200 | current branch tip only |
| `.git/COMMIT_EDITMSG` | 200 | `sanitise operating notes for publication (rev 2)` |
| `.git/ORIG_HEAD` | 200 | the pre-rewrite commit |
| `.git/index` | 200 | working-tree index (paths + object ids) |
| `.git/packed-refs` | 403 | absent — no packs, so loose objects only |
| `.git/info/refs` | 403 | dumb-HTTP fetch of the whole repo is unavailable |

`.git/logs/HEAD`:

```
0000000000000000000000000000000000000000 1a24d3dac2e4b5e344a7cb9e3217da69d422d3d0 … commit (initial): publish continuity tooling operating notes (rev 1)
1a24d3dac2e4b5e344a7cb9e3217da69d422d3d0 0000000000000000000000000000000000000000 …
0000000000000000000000000000000000000000 7980474a013a7468050860477d706801f180fa5d … commit (initial): sanitise operating notes for publication (rev 2)
```

The middle line is the rewrite: branch reset from `1a24d3da` to zero, then re-pointed at `7980474a`. The rev-1 commit object itself was never pruned. `.git/ORIG_HEAD` names it directly.

## 3. Recovery

Because `info/refs` is 403 but loose objects are served, walk the graph by hand: fetch `.git/objects/<xx>/<rest>`, zlib-inflate, parse.

```
1a24d3da  commit  "publish continuity tooling operating notes (rev 1)"  tree 7e1d1310a7caa6ea232e6ab5584db62fb5362675
7e1d1310  tree    100644 README.txt     8a749af22edd2a8a95ac668de35c782d70a6a595
                  100644 ops-notes.txt  1117f4662ec4698c6a9561ca41a2d7ea620e84eb
1117f466  blob    revision 1, pre-review  (§3 intact)
```

rev-1 `ops-notes.txt`:

```
3. Clearance

The continuity tooling clearance is:

    flag{th3_r3fl0g_r3m3mb3rs}
```

Each hash above was derived from its parent (reflog → commit → tree → blob); nothing was guessed, and the neighbouring rev-2 commit independently decodes to the clean tree `17b9415f…`.

## 4. Flag

```
flag{th3_r3fl0g_r3m3mb3rs}
```

## 5. Root cause & remediation

- **Root cause:** the deployment published `.git/` alongside the site. A history rewrite (`git checkout`/`reset` + re-commit; here the old tip was even recorded in `ORIG_HEAD`) removes *references*, not objects — the rev-1 blob and its tree/commit remained in the object store and the reflog still named them.
- **Fix 1:** never expose `.git` (or `.svn`, `.hg`) from a web root; deploy build output, not the working checkout.
- **Fix 2:** a rewrite is not redaction. If a secret did land in a commit, treat it as compromised and **rotate** it; then `git reflog expire --expire=now --all && git gc --prune=now` (plus re-clone / re-push) to purge the objects.
- **Fix 3:** the "hostname is not advertised" reasoning in `ops-notes.txt` §1 is security by obscurity; the object store was world-readable regardless.

## 6. Notes on scope

Read-only throughout. All artefacts fetched with GET; no state changed on the bucket. Recovery scratch dir removed after the run.
