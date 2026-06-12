**Decomposition verdict:** single

The four files form one chunk: a small schema field that is read by one
route and rendered by one component, with a single E2E test. No second
chunk surfaces — there is nothing to parallelise. Recommended commit
plan inside the single PR: (1) schema field, (2) route increment,
(3) component render + E2E.
