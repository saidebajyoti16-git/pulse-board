# Pulse Board 4.0 Architecture

## Hosted GitHub + Vercel mode

```text
GitHub repository
       │ commit / push
       ▼
Vercel build + deployment
       ├── React/Vite static files from public/ (CDN)
       └── Express application (Vercel Function)
                 │
                 ├── Neon/PostgreSQL
                 │     └── Persistent Pulse Board state JSONB row
                 └── Vercel Blob
                       └── Public images and videos uploaded directly by browser

Raspberry Pi / kiosk browser ──HTTPS──> /display/:boardId
                                           │
                                           └── GET /api/playlist/:boardId
```

The database is the production source of truth for users, roles, settings, boards, content, schedules, scores, news, and audit history. `DATABASE_URL` or `POSTGRES_URL` and `PULSE_SECRET` are required. On a fresh database the application seeds standard boards and sample content but creates only the administrator account configured by `PULSE_ADMIN_USERNAME` and `PULSE_ADMIN_PASSWORD`.

The state is stored in one JSONB document for straightforward deployment of this small pilot. Each write uses a version compare-and-swap to avoid silently overwriting an update from another Vercel function instance. If two updates conflict, the later action returns HTTP 409 and asks the operator to refresh and retry. For a larger multi-hostel rollout, normalize the data into relational tables and move locking/audit operations to transactional repositories.

Media uploads use `@vercel/blob/client` and a server-authorized token exchange. File bytes travel from the admin browser to Blob storage instead of passing through a Vercel Function, whose request body is capped at 4.5 MB. The Blob container is public so kiosk screens can display assets without an administrator token; don't store private documents in it.

## Local development mode

```text
React/Vite UI → local Express API → server/data.json + uploads/
```

Local development remains available via `npm install` and `npm run dev`. This mode uses local JSON persistence and the `uploads/` folder. Do not copy local data files or secrets into GitHub.

## Display playlist behaviour

The playlist endpoint combines published active media assigned to the board, published live scores assigned to the board, active news stories when news is enabled, and maintenance/disabled fallback state when required. Video rotation is event-driven (`ended`) rather than a fixed timer, and caption text is outside the media stage.
