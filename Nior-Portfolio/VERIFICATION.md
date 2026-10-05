# Verification

Completed locally on the Vercel migration:

- Production `npm run build` succeeds (Next.js 16.3.8, Webpack), including TypeScript validation and route generation.
- `npm run lint`: zero errors; six existing/raw image optimization warnings.
- Security tests pass: unsafe URLs/path traversal, missing/cross-origin requests, reverse-proxy host handling.
- Shipping SQL runs twice successfully in PGlite. Public reads work; owner profile/project CRUD and image insert work; non-owner inserts/updates/deletes and owner self-enrollment are denied; image paths outside the owner folder and SVG paths are rejected.
- Built HTTP routes `/`, `/login`, `/api/profile`, `/api/projects` return 200 without credentials in setup mode.
- `/studio` redirects to `/login`; cross-origin write returns 403; writes without configured backend return 503.

Not completed:

- Browser visual verification: browser download failed certificate validation; a separate browser-install method was rejected by automatic approval review because its tool path was disallowed for escalated execution. No visual pass is claimed.
- Live Supabase auth, Storage and persistence verification requires your own configured project. PGlite tests use mock Supabase-owned auth/storage schemas and do not test the hosted services.
- No Vercel deployment, GitHub push, account provisioning or old database migration has been performed.

Follow the post-deployment checklist in SETUP-TH.md after connecting your project.
