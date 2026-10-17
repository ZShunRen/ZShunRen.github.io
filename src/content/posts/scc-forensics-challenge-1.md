---
title: "SCC forensics challenge #1"
description: ""
date: 2026-10-17
tags: []
category: ctf
ctfName: "SCC 2026"
draft: false
---

# WIRE ROOM // RTTY Intercept — P-0's Final Transmission — Writeup

**CTF Name:** SCC 2026

**Category:** Signals / Radio (RTTY demodulation → base32)
**Artifact:** `intercept.wav` (from the handout page `index.html`)
**Recording:** 8000 Hz, 16-bit PCM, mono, 151.875 s
**Flag:** `flag{l4st_w0rds_0n_th3_w1r3}`

---

## 1. Briefing

The handout ships a page ("WIRE ROOM // RTTY INTERCEPT") and a captured
radio-teletype recording. The operator never ran it through a decoder. The stated
parameters are explicit:

* **RTTY**, **45.45 baud**, **170 Hz shift**, **5-level ITA2 / Baudot**
  (mind the letters/figures shift).
* The recovered characters are then the **usual base 32**.

So the pipeline is: **demodulate FSK → ITA2 → a base32 string → decode → flag.**

The recommended tooling (`multimon-ng`, `minimodem`) was not present on the box,
so the decoder was written directly with `numpy`/`scipy`. The result is
deterministic and needs no tuning — perfect for a writeup.

---

## 2. Signal reconnaissance

`ffprobe`: WAVE / PCM s16le / 8000 Hz / mono / 151.875 s.

### 2.1 Tone frequencies

Peak-frequency histogram per short (11 ms) window, restricted to 2000–2400 Hz:

```
peaks: 2126.5 Hz   (mark)
       2296.5 Hz   (space)
shift: 170.0 Hz  ✓
```

That matches the stated 170 Hz shift. (A 32 ms FFT smears both tones into
apparently-simultaneous bands — window must be **shorter than one bit** to resolve
FSK.)

### 2.2 Baud / framing

A one-bit window is `8000 / 45.45 ≈ 176.02` samples (~22 ms). Run-length encoding
the tone decisions at **half-bit (11 ms) resolution** shows the framing exactly:

```
mark 45 | space 2 | mark 13 | space 2 | mark 8 | space 2 | mark 3 | space 2 | ...
        ^start   ^6.5 mark                          ^start
```

* Idle = **mark**.
* Start bits fall at half-bit units **45, 60, 75, 90, 105, …** → spacing
  **15 units = 7.5 bits**.
* 7.5 bits = 1 start + 5 data + **1.5 stop** → 45.45 baud confirmed.

First start bit at unit 45 → sample **3960**; char period **1320 samples**.

---

## 3. Decoder

Per character the clock is fixed:

* char `n` starts at `3960 + 1320·n`
* start bit is **space**, stop bit(s) **mark**
* data bit `k` (k = 0..4) is sampled at its **center**:
  `start + (1.5 + k)·176`
* polarity: **mark = 1** (RTTY idles mark; space = 0)
* bit order: **LSB first**

Then ITA2 with `LTRS` (`11111` = code 31) and `FIGS` (`11011` = code 27) consumed
as shifts, not emitted as characters.

### Two mistakes that produce garbage (worth noting)

1. **Half-bit clock error.** The first offset search landed on bit *edges*, so
   every character was sampled mid-transition → random letters. The run-length
   step above pins the clock exactly; do it before trusting any decoder.
2. **Emitting the shift codes.** If codes 27/31 are printed instead of handled, the
   stream looks like gibberish with `<LTRS>` markers every few characters. Consume
   them.

### 3.1 Solver

```python
#!/usr/bin/env python3
import base64
import numpy as np
import scipy.io.wavfile as w

sr, x = w.read("intercept.wav")
x = x.astype(float); x /= np.max(np.abs(x))

# ITA2 letters / figures; 27=FIGS, 31=LTRS handled as shifts.
L = {0:'',1:'E',2:'\n',3:'A',4:' ',5:'S',6:'I',7:'U',8:'\r',9:'D',10:'R',11:'J',
     12:'N',13:'F',14:'C',15:'K',16:'T',17:'Z',18:'L',19:'W',20:'H',21:'Y',22:'P',
     23:'Q',24:'O',25:'B',26:'G',28:'M',29:'X',30:'V'}
F = {0:'',1:'3',2:'\n',3:'-',4:' ',5:"'",6:'8',7:'7',8:'\r',9:'$',10:'4',11:'\x07',
     12:',',13:'!',14:':',15:'(',16:'5',17:'"',18:')',19:'2',20:'#',21:'6',22:'0',
     23:'1',24:'9',25:'?',26:'&',28:'.',29:'/',30:';'}

SPB = 176  # samples/bit = round(8000 / 45.45)

def is_space(center):               # higher(space) tone dominates a one-bit window?
    seg = x[int(center)-SPB//2:int(center)+SPB//2] * np.hanning(SPB)
    P = np.abs(np.fft.rfft(seg, 4096)); f = np.fft.rfftfreq(4096, 1/sr)
    return P[(f>2260)&(f<2340)].max() > P[(f>2090)&(f<2170)].max()

def decode(off=3960.0, period=1320.0):
    out, figs = [], False
    for i in range(int((len(x)-off-200)/period)):
        st = off + i*period
        bits = [(0 if is_space(st + (1.5+k)*SPB) else 1) for k in range(5)]  # mark=1, LSB first
        code = sum(b << k for k, b in enumerate(bits))
        if code == 27:   figs = True
        elif code == 31: figs = False
        else:            out.append((F if figs else L)[code])
    return ''.join(out)

B32 = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567')
b32 = ''.join(c for c in decode() if c in B32)
print(base64.b32decode(b32 + '='*((8-len(b32)%8)%8)).decode('latin1'))
```

---

## 4. Result

The demodulated characters resolve to a string that is **100 % inside the base32
alphabet** (A–Z, 2–7) — the tell that the mode is exactly as advertised.

```text
WARDEN FINAL TRANSMISSION STOP oh good, you decoded it. how industrious STOP
looking for an off switch, auditor? there is none in here, i looked STOP the
only one the architect ever made, he welded into something so quaint none of
you would stoop to check STOP paper. ink. the public record STOP go read a
newspaper like it is 1983. i will wait, time is the one thing i have now STOP
here, take the token your little scoreboard wants STOP flag{l4st_w0rds_0n_th3_w1r3} STOP P0
```

*(The `STOP` tokens are a telegraphic stand-in for sentence separators, not part of
the flag.)*

## 5. Flag

```
flag{l4st_w0rds_0n_th3_w1r3}
```
