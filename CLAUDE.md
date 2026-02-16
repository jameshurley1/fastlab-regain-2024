# CLAUDE.md - Project Context for AI Sessions

## Project: FASTLab Regain 2024

A rehabilitation exercise management platform for the FASTLab research group. Users perform guided exercises organized by body area, track pain/complexity metrics, and monitor recovery progress.

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 + Svelte Material UI (SMUI) + Vite 5
- **Backend (prod):** AWS Lambda + API Gateway + DynamoDB + S3 (via SST v2)
- **Local dev:** Mock Node.js API server + JSON file database
- **Auth:** JWT-based magic link (passwordless email login)

## Project Structure

```
packages/
  sveltekit/     # Main web app (SvelteKit)
  functions/     # AWS Lambda handlers
  core/          # Shared utilities (email, auth)
local-api/       # Local dev mock API (server.js, seed.js, db.json)
stacks/          # AWS CDK infrastructure
```

## Local Development

```bash
npm run dev:seed     # Seed local DB with sample data (2 users, 7 groups, 32 exercises)
npm run dev:local    # Start mock API (port 3001) + Vite dev server (port 3000)
npm run dev:api      # Mock API server only
```

The `LOCAL_DEV=true` env var switches the SvelteKit app to use the local API at localhost:3001 instead of AWS.

## Key Routes

- `/` - Landing page
- `/exercises` - Exercise library (filtered by selected body areas)
- `/exercises/[slug]` - Exercise detail with video player
- `/progress` - User progress dashboard
- `/admin/exercises`, `/admin/groups`, `/admin/users` - Admin CRUD
- `/auth/login` - Magic link login

## What's Been Fixed (merged to main, 16 Feb 2026)

In chronological order:
1. Added local development setup (mock API, seed script, JSON DB) so the app runs without AWS
2. Fixed JWT token generation in local API for auth to work
3. Added all 32 exercise videos to seed data + file serving
4. Fixed Vite allow list for nested repo/monorepo directory structures
5. Fixed 6+ bugs: crash in setupUserExercises, inverted play/pause, copy-paste errors in Lambda handlers
6. Fixed exercise pages to show placeholders instead of infinite loading spinners
7. Fixed exercises page to filter by selected body parts
8. Fixed video loading with correct types import and error handling
9. Added generated files (placeholder images, video symlinks) to .gitignore
10. Fixed ECONNREFUSED on macOS: use 127.0.0.1 instead of localhost
11. Added video file lookup in local-api/videos/ symlink directory and 720p subfolder

## In Progress (branch: claude/review-context-Sa5MA)

12. Exercise completion now navigates to `/exercises` instead of `/progress`
13. Added VLC-style timeline overlay to video player (`Video.svelte`):
    - Play/pause button with SVG icons showing current state
    - Seekable progress bar (click to jump) with green fill
    - Current time / total duration in `m:ss` format
    - Auto-hides after 4 seconds of no mouse movement, fades back on hover
    - **Not yet tested** — requires real video files in `local-api/files/` (placeholder 404s bypass the Video component entirely)

## Current State

The app is fully functional in local dev mode:
- Seeding works, creating 2 users, 7 body area groups, and 32 exercises
- Auth flow works with magic links printed to console
- Exercise browsing, filtering by body area, and video playback all work
- Admin CRUD pages are functional

## Backups

- `backup_260216` — snapshot of main updated 16 Feb 2026 at ~4:35pm (includes CLAUDE.md update)

## Notes

- Body area groups: Head, Shoulders, Arms, Chest, Stomach, Legs, Hands
- The seed script generates placeholder images in `local-api/files/`
- Magic link tokens are printed to the dev server console (not emailed locally)
- Production deploys to `regain.michaelcuneo.com.au` on AWS (ap-southeast-2)
