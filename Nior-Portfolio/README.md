# Nior Portfolio — Vercel edition

Start with **[SETUP-TH.md](SETUP-TH.md)** for the complete Thai setup guide.

Next.js App Router + Supabase Auth, PostgreSQL and Storage. Owner studio includes profile editing, project CRUD and direct image uploads. Original portfolio visuals, intro and scroll interactions are retained.

Configure the two variables in `.env.example`, run `supabase/schema.sql`, create an Auth user and register it with `supabase/add-owner.sql`. No credentials are included.

Commands: `npm ci`, `npm run dev`, `npm run build`, `npm start`.

`npm test` checks the shipping PostgreSQL policies in PGlite with mock Supabase-owned auth/storage schemas, plus input validation. This is not a live Supabase integration test. `npm run typecheck` checks TypeScript.

The ZIP does not contain the old hosted database or uploaded media. Removed/replaced images remain in Storage for manual cleanup.
