# QuickNotes

QuickNotes is a React + TypeScript single page application for managing personal notes with tag based filtering. The current repository snapshot delivers the full frontend experience and the build tooling for containerized delivery, while the backing API and infrastructure pieces are outlined but not yet implemented.

## Highlights
- Client side auth flow with registration, login, logout, and cookie based token persistence.
- Notes dashboard with create, edit, delete, filtering by tags, and optimistic UI updates.
- Axios API client with automatic auth header injection and 401 interception.
- CRA toolchain with React Router 7, Testing Library, and TypeScript 4.9 configuration ready to use.
- Docker multi stage build that outputs a static bundle served by Nginx.

## Getting Started

### Prerequisites
- Node.js 20.x (matches the Docker build stage image).
- npm 10.x (bundled with Node 20).

### Install dependencies
```bash
npm install
```

### Configure environment variables
Create a `.env` file with the API base URL that the frontend should call. Only variables prefixed with `REACT_APP_` are exposed to the client.
```bash
echo "REACT_APP_API_BASE_URL=http://localhost:8080" > .env
```
Restart the dev server after changing any `REACT_APP_` variables so they are picked up by CRA.

### Start the development server
```bash
npm start
```
The app is served on <http://localhost:3000>. Adjust `REACT_APP_API_BASE_URL` to point at your backend (expected to expose routes under `/api`).

### Run the test suite
```bash
npm test
```
Runs Jest in watch mode with React Testing Library helpers.

### Create a production build
```bash
npm run build
```
Outputs an optimized bundle to the `build/` directory.

## Docker
A multi stage Dockerfile builds the React app and serves it through Nginx.
```bash
docker build -t quick-notes-frontend \
  --build-arg REACT_APP_API_BASE_URL=http://localhost:8080 .
docker run --rm -p 8080:80 quick-notes-frontend
```
The container exposes port 80 (mapped to 8080 in the example). Pass the correct API base URL at build time.

> Note: `docker-compose.yml` is a placeholder; it currently points the `frontend` build context to `./src` and does not orchestrate the planned backend services. Replace it with a full stack compose file once the API is implemented.

## Architecture Overview

### Frontend (implemented)
- React 19 + TypeScript SPA bootstrapped with Create React App.
- Routing handled by `react-router-dom` with guarded routes via `ProtectedRoute`.
- Auth state stored in a context provider that persists JWT tokens inside a cookie (`quicknotes_auth`).
- Notes workflow powered by a `useNotes` hook that coordinates CRUD operations against the API and keeps local state in sync.
- Styling delivered through plain CSS modules scoped per feature (see `src/features/notes/notes.css`).

### Backend & Ops (planned)
The README documents the expected services even though they are absent in this repo snapshot:
- **api**: Express + TypeScript service exposing auth and notes endpoints with JWT authentication.
- **postgres**: primary data store for users and notes.
- **redis**: cache layer keyed by user and tag filters for faster list queries.
- **gateway**: Nginx or HAProxy load balancer in front of multiple API instances.
- **metrics**: `/metrics` endpoint exporting Prometheus counters (requests, cache hit rate, etc.).
- **Makefile**: developer ergonomics for build, lint, test, and compose targets.

## API Contract (expected)
The frontend expects the backend to expose the following JSON endpoints under `${REACT_APP_API_BASE_URL}/api`:
- `POST /auth/register` → `{ token, user }`
- `POST /auth/login` → `{ token, user }`
- `POST /notes` → returns the created note.
- `GET /notes?tags=tag1,tag2` → `{ notes: Note[] }` with optional pagination metadata.
- `GET /notes/:id` → returns a single note.
- `PUT /notes/:id` → returns the updated note.
- `DELETE /notes/:id`
- Supporting routes: `GET /health` for liveness checks and `GET /metrics` for Prometheus scraping.

### Note shape
```ts
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

## Project Structure
```
├── public/                 static assets served by CRA
├── src/
│   ├── components/         shared UI elements (e.g., ProtectedRoute)
│   ├── features/
│   │   ├── auth/           login and register pages with shared layout
│   │   └── notes/          dashboard, list, editor, and styling
│   ├── hooks/              reusable domain hooks (auth, notes)
│   ├── providers/          React context providers (AuthProvider)
│   ├── services/           axios client and API abstractions
│   ├── types/              TypeScript models for auth and notes
│   └── utils/              helpers for errors and tag parsing
├── Dockerfile              multi stage build (Node 20 → Nginx)
├── docker-compose.yml      placeholder compose file for future stack
├── package.json            dependencies and npm scripts
└── tsconfig.json           TypeScript compiler options
```

## Development Notes
- `ProtectedRoute` currently renders children even when unauthenticated to keep the UI testable without a backend. Enable the redirect logic once the API is live.
- `apiClient` throws during module load if `REACT_APP_API_BASE_URL` is missing, ensuring misconfiguration fails fast.
- `useNotes` surfaces request errors with human friendly messages via `extractErrorMessage`.
- Tag filtering is handled client side by `parseTags` and included as a comma separated query string when fetching notes.

## Roadmap
1. Scaffold the Express API with JWT auth, PostgreSQL integration, and Redis caching.
2. Add load balancing (Nginx or HAProxy) and duplicate API instances in Docker Compose.
3. Expose `/metrics` and wire Prometheus scraping for request counters and cache stats.
4. Implement end to end compose stack (frontend, api x2, postgres, redis, gateway) plus Makefile targets.
5. Expand automated tests (unit coverage for hooks and integration tests for API once available).

---
This project is provided for assessment purposes. No production license is granted.
