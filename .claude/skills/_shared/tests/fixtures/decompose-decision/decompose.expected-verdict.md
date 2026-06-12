**Decomposition verdict:** decompose

Two chunks surface from sections 4 and 5: (A) dashboard Aurora restyle,
(B) worker telemetry. They pass all four isolation tests — different
files, no runtime contract between them, either ships independently,
tests are unrelated. Splitting unblocks parallel agents.

```chunks
- Aurora dashboard restyle: replace hex literals with Aurora tokens across the dashboard surface.
- Worker telemetry: emit per-job telemetry to tmp/db/telemetry.json with operator triage docs.
```
