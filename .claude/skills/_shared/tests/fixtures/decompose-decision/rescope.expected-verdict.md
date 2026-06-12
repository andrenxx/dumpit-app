**Decomposition verdict:** rescope

The chunks here (schema, storage, auth, realtime, edge worker) are not
independent — every one depends on schema being in place, and every
runtime path crosses three or four of them. Decomposing would create
broken half-states (auth without RLS, realtime without schema). But
ten commits in one PR is unreviewable as one job. The honest answer is
to rescope: the discovery should be split into separate features
(schema-first migration, then auth, then realtime, then edge worker),
each its own discovery → spec → PR. Rerun `/discover` with narrower
framing.
