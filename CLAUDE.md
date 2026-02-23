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

## Branch Instructions
Always work on the `main` branch. At the start of every session:
1. Run `git checkout main`
2. Run `git pull origin main`
Never create or push to a `claude/...` branch unless explicitly asked.

## Merging claude/ Branches into main

**Preferred method — manual merge (safest, avoids GitHub PR pitfalls):**

```bash
git checkout main
git pull origin main
git merge claude/<branch-name>
git push origin main
```

**If creating a GitHub Pull Request instead:**

> **WARNING: GitHub defaults the base repository to `michaelcuneo/fastlab-regain-2024` (the upstream original) when opening a PR from this fork. You MUST manually change the base repository to `jameshurley1/fastlab-regain-2024` every time before submitting. Failing to do so will open a PR against the upstream repo, not this fork.**

Steps:
1. Go to `https://github.com/jameshurley1/fastlab-regain-2024/compare`
2. Set **base repository** to `jameshurley1/fastlab-regain-2024` (change it — GitHub will pre-fill the upstream)
3. Set **base branch** to `main`
4. Set **compare branch** to the `claude/...` branch
5. Open the PR and merge

The manual merge method above is preferred to avoid this confusion entirely.

## Session Startup
At the start of every session, before doing anything else, automatically run:
git checkout main
git pull origin main
