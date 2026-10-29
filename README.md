# Placement Tracker

A personal tracker for placement applications: companies, roles, CTC and base pay, location, a tag for how I feel about each one (Lock In / Low Key Chill / In my Dilemma Era), and whether the test is done.

Live at https://placement-tracker.pages.dev (sign-in required).

## How it's built

Everything runs on Cloudflare's free tier:

- **Pages** serves the tracker page (`public/index.html`)
- **Pages Functions** provide the API (`functions/api/`)
  - `GET /api/applications`, `POST /api/applications`
  - `PATCH /api/applications/:id`, `DELETE /api/applications/:id`
  - `POST /api/import` replaces all applications in one transaction (Restore and sample data)
- **D1** (SQLite) stores the data; the schema is in `migrations/`
- **Cloudflare Access** puts an email one-time-code sign-in in front of the whole site. `functions/api/_middleware.js` also verifies the Access token on every API call and refuses requests when it's missing or invalid.

## Local development

```bash
npm install
npm run db:migrate:local
npm run dev
```

Create a `.dev.vars` file containing `DEV_BYPASS_AUTH=1` to skip the Access check on localhost. The file is gitignored and never deployed.

## Deploying

```bash
npm run db:migrate:remote   # only when migrations/ changed
npm run deploy -- --branch main
```

## Backups

Use **Backup** in the app to download a JSON copy of your applications, and **Restore** to load one back. D1 also keeps 30 days of point-in-time recovery (`wrangler d1 time-travel`).
