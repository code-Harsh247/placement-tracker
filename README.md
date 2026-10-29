# Placement Tracker

A personal tracker for placement applications: companies, roles, CTC and base pay, location, a tag for how I feel about each one (Lock In / Low Key Chill / In my Dilemma Era), and whether the test is done.

## Plan

Hosting on Cloudflare's free tier:

- **Pages** serves the tracker page
- **Pages Functions** provide a small `/api` for reading and writing applications
- **D1** (SQLite) stores the data
- **Cloudflare Access** restricts the site to my email (one-time code sign-in)

## Status

Single-file offline version (`placement-tracker.html`, data in the browser's localStorage). Moving to the Cloudflare setup next.
