# TPML Seat Tracker Frontend

React + TypeScript single-page app that visualizes Taipei Public Library seat usage on an interactive Mapbox map. The frontend can run either against the real backend APIs or by using self-contained mock data for demos.

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

By default the provided `.env.example` enables the mock API so the app works without the backend. When you have the backend running, set `VITE_USE_MOCK_DATA=false` and update `VITE_API_BASE_URL`.

## Environment Variables

| Name | Default | Description |
|------|---------|-------------|
| `VITE_MAPBOX_TOKEN` | _(required)_ | Mapbox access token for rendering the basemap |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Backend API root when mock mode is disabled |
| `VITE_USE_MOCK_DATA` | `true` | Toggle self-contained mock responses for libraries, realtime seats, and predictions |

## Mock Data Mode

When `VITE_USE_MOCK_DATA=true` the frontend returns curated responses from `src/mocks/mockApi.ts` instead of issuing HTTP requests. The mock dataset includes:

- 6 Taipei library branches with coordinates, seat counts, and operating hours
- Realtime seat snapshots that match the library list
- Prediction values for the 30-min and 60-min horizons, including fallback cases

This mode keeps every existing UI flow intact (React Query, adapters, map markers, details panel) while avoiding backend dependencies.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check and bundle production assets |
| `npm run preview` | Preview the built `dist/` output locally |
| `npm run test -- --run` | Run all Vitest suites once |
| `npm run lint` | Lint the project with ESLint |

## Deployment

The `Dockerfile` in this folder builds the production bundle and serves it through Nginx:

```bash
docker build -t tpml-seat-tracker-frontend .
docker run -p 8080:80 tpml-seat-tracker-frontend
```

Set the environment variables (Mapbox token, API base URL, mock flag) at build or runtime via Vite conventions.
