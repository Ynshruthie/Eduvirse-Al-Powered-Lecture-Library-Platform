# Eduvirse

Eduvirse is a workspace-based full-stack project with:

- `apps/web/web`: React + Vite frontend
- `apps/api`: Express backend
- local file storage for development, or Supabase for persistent data

## Setup

1. Install the root, API, and frontend dependencies:

```bash
npm install
npm --prefix apps/api install
npm --prefix apps/web/web install
```

2. Create backend env file:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Create frontend env file:

```bash
cp apps/web/web/.env.example apps/web/web/.env
```

4. If you are using Supabase, run the schema in:

```text
apps/api/supabase/schema.sql
```

## Development

Run the frontend and backend in separate terminals:

```bash
npm run dev
npm --prefix apps/api run dev
```

- Frontend dev server: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Frontend `/api` calls are proxied to the backend

## Production-style Local Start

Build the frontend, then have the backend serve it on a single port:

```bash
npm run build
npm --prefix apps/api run start
```

This builds the frontend and serves both the UI and API from:

```text
http://localhost:4000
```

## Quality Checks

```bash
npm run lint
npm run build
```

## Backend Storage

The backend supports two modes:

- Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- local file fallback using `apps/api/src/storage/users.json`

## Before Deploying

- Set a strong, unique `TOKEN_SECRET` and configure an explicit `CORS_ORIGIN`.
- Never commit real `.env` files, local storage, uploads, or generated build output.
- Use Supabase (or another managed database/object store) in production; local storage is intended only for development.

## Current Scope

Authentication is wired to the backend.
Some course and catalog pages still use local mock data for demo content until those modules are moved to real backend APIs.
