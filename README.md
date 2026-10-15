# Pulse Board v4.0.0 — GitHub + Vercel deployment package

This repository is prepared for a browser-only workflow: upload the project to GitHub, import it into Vercel, attach managed PostgreSQL and Vercel Blob, and manage Pulse Board through the hosted admin website. You do not need to run the app on your own computer.

## What's different from v3

- Vercel-compatible Express entry point (`index.js`).
- Static React/Vite build is written to the root `public/` folder for Vercel CDN hosting.
- Persistent data stored in a PostgreSQL JSONB row using the Neon serverless driver; it is not stored in a temporary function filesystem.
- Initial cloud database seed creates only the Administrator account configured by environment variables. Demo passwords are not created in production.
- Passwords for cloud-created users are stored using Node's scrypt password hashing; legacy local demo logins continue to work locally.
- Image and large video uploads go directly from the browser to Vercel Blob using short-lived authenticated upload tokens, avoiding the 4.5 MB Vercel Function body limit.
- A version check protects cloud updates from silently overwriting simultaneous changes. If two admins change records at the same time, the conflicting request asks them to refresh and retry.
- Local development still uses the original Express API and local `uploads/` folder.

## Required managed services

After the repository has been imported and the Vercel project exists, attach these managed services to that project:

1. A PostgreSQL database integration (Neon is an easy option). Ensure the project has `DATABASE_URL` or `POSTGRES_URL` set to the pooled/serverless connection string.
2. A **public** Vercel Blob store for display media. Vercel adds `BLOB_READ_WRITE_TOKEN` to the project when the store is connected. Public access is used because Raspberry Pi screens need to load media without an admin session; do not upload private documents to this store.

## Exact browser-only deployment steps

### 1. Create the GitHub repository

1. Sign in to GitHub and create a new empty repository named `pulse-board` (or another name of your choice).
2. Download this ZIP from ChatGPT and extract it on your computer.
3. Open the new GitHub repository, choose **Add file → Upload files**, and upload the **contents** of the extracted `Pulse_Board_GitHub_Vercel_v4.0.0` folder. Upload `package.json`, `index.js`, `server/`, `client/`, `docs/`, `deploy/`, `vercel.json`, `.gitignore`, `.env.example`, and `README.md`. Do not upload `node_modules`, `.env` files with real secrets, `server/data.json`, or real uploads.
4. Commit the files to the `main` branch.

### 2. Import the GitHub repository into Vercel

1. In Vercel, choose **Add New → Project → Import Git Repository**.
2. Select the `pulse-board` GitHub repository.
3. Keep the root directory at `./` (repository root), and deploy once to create the project. The API will not work until the cloud services and environment variables are configured in the next steps.

### 3. Create managed services

1. In Vercel, open **Storage / Marketplace** and install a PostgreSQL provider such as Neon for this project.
2. Confirm Vercel has `DATABASE_URL` or `POSTGRES_URL` in the project's Environment Variables. Prefer the provider's pooled/serverless connection string.
3. Create a Vercel Blob store and connect it to this Vercel project. Confirm `BLOB_READ_WRITE_TOKEN` is present.

### 4. Set required environment variables

In Vercel: **Project → Settings → Environment Variables**, add these variables for **Production, Preview, and Development** as appropriate:

| Variable | Value |
|---|---|
| `PULSE_SECRET` | A long random secret, at least 32 characters; do not reuse a sample from this repository. |
| `PULSE_ADMIN_USERNAME` | The initial admin username, commonly `admin`. |
| `PULSE_ADMIN_PASSWORD` | A unique password of at least 12 characters. This is used only when the database is first initialized. |
| `DATABASE_URL` | Set by the PostgreSQL integration, or add the provider's pooled/serverless URL. |
| `BLOB_READ_WRITE_TOKEN` | Set by the Vercel Blob integration. |

**Important:** Add all variables before the first successful deployment/first API request. The initial cloud database contains only the administrator account; create the Warden, Editor, Scoreboard Updater and Viewer accounts from **Users & Roles** after login. Changing `PULSE_ADMIN_PASSWORD` after the database is initialized does not reset the existing admin password; use the app's user-management flow for future password changes.

### 5. Redeploy and verify

After the database, Blob store and environment variables are configured, open **Deployments** and redeploy the latest commit. Keep the project root at `./` (repository root); do not select `client/` as the root directory. `vercel.json` uses `npm run build`, and the project requires Node.js 20 or newer.

### 6. Sign in and verify

Open the Vercel deployment URL and sign in using `PULSE_ADMIN_USERNAME` and `PULSE_ADMIN_PASSWORD` from the environment variables. Then verify:

- `/api/health` returns an `ok: true` JSON response.
- Add a small image and a short MP4/WebM test video under **Content**.
- Publish a test match from **Live Scoreboard** and assign the target board.
- Open `/display/board-1` in another browser tab and check media/score rotation.
- Create operator accounts using **Users & Roles**.

Board screen URL example: `https://YOUR-VERCEL-DOMAIN/display/board-1`.

## Storage and operations notes

- PostgreSQL is the source of truth for settings, users, schedules, boards, news, scores and audit history. The JSONB document is suited to a small pilot; for a large multi-hostel roll-out, migrate each entity to normalized tables and add background job/locking infrastructure.
- Media files are uploaded directly to Vercel Blob. Blob objects are not stored in GitHub or the function filesystem. The current version retains uploaded Blob objects if content entries are deleted, avoiding accidental removal of media URLs that may be shared by duplicated content; prune unused blobs from the Blob dashboard when needed.
- Daily News CRUD works without an external news API. The “Refresh” control refreshes the app's built-in digest placeholders; connect a real licensed news provider if automatic live headlines are required.
- Raspberry Pi clients need internet/network access to the Vercel URL. For a campus with unreliable internet, use the separate self-hosted deployment notes in `deploy/` rather than relying only on a cloud deployment.
- Vercel Functions have a 4.5 MB request/response body limit. This package uses Vercel Blob client uploads to transfer media directly rather than sending large files through the API.

## Local development (optional)

Local execution remains available, but is not required for the GitHub + Vercel workflow:

```bash
npm install
npm run dev
```

Local demo accounts exist only in local mode: `admin / admin2026`, `warden / pulse2026`, `editor / editor2026`, `score / score2026`, `viewer / viewer2026`. Do not use these defaults on a publicly deployed service.

## Project map

- `client/` — React/Vite admin console and kiosk display.
- `server/index.js` — Express API and development server.
- `index.js` — Vercel Express entry point.
- `vercel.json` — Vercel deployment and SPA-route settings.
- `.env.example` — variable names only; never store real secrets here.
- `docs/` — feature, architecture and control documentation.
- `deploy/raspberrypi/` — optional kiosk/watchdog helper scripts.
