# AI-Powered Road & Transit Infrastructure Resilience Platform — Phases 1–4

**Phase 1 — Foundation + Asset Management & GIS**
- JWT auth (access + rotating refresh tokens), email verification, forgot/reset password, Google OAuth login, RBAC (ADMIN, PLANNER, ENGINEER, RESEARCHER, CITIZEN)
- Road / Bridge / Transit / generic Infra Asset CRUD with full validation, audit logging, condition tracking
- GIS: Leaflet map, GeoJSON layer upload, spatial bounding-box search, buffer analysis, point-to-point distance, nearby-asset radius search (via Turf.js)
- Real dashboard KPIs computed from live Postgres data (no mock numbers)
- Production security: Helmet, rate limiting, CORS, Zod validation everywhere, bcrypt password hashing, httpOnly refresh cookies
- Dockerized Postgres + backend + frontend, CI pipeline, seed data, automated tests

**Phase 2 — Citizen Portal + Maintenance**
- **Citizen Portal**: report an issue (pothole, streetlight, drainage, signage, signal) with browser GPS geolocation, up to 5 photos, and category — plus a "My Reports" tracker showing live status and staff resolution notes
- **Complaint management (staff)**: filterable queue across all citizen reports, status workflow (Submitted → Acknowledged → In Progress → Resolved/Rejected) with resolution notes visible back to the citizen
- **Inspections**: field inspection logging (condition found, notes, photos) for roads and bridges — each inspection automatically syncs the parent asset's live condition score and `lastInspected` date
- **Maintenance**: schedule work orders against any road/bridge/transit asset, cost estimate vs. actual tracking, status lifecycle (Planned → In Progress → Completed/Cancelled), aggregate cost-summary endpoint
- Photo uploads are stored on local disk via Multer and served at `/uploads/*` (swap for Cloudinary later — the storage logic is isolated in `backend/src/utils/upload.ts`)

**Phase 3 — Analytics**
- Real KPI summary, road-quality trend from inspection history, maintenance cost trend — all computed from live Postgres data via `date_trunc` aggregation, no fabricated numbers.

**Phase 4 — AI Prediction Engine**
- Standalone Python FastAPI microservice (`ai-service/`) with two RandomForest models (scikit-learn): road deterioration forecasting (12-month condition score) and bridge failure probability, each trained at startup on domain-informed synthetic data (the schema has no historical time-series yet to train on real data — called out honestly rather than faked).
- Every prediction returns a risk level, a confidence score, and a feature-importance breakdown for explainability.
- Node backend proxies `/api/ai/roads/:id/predict-deterioration` and `/api/ai/bridges/:id/predict-failure`, pulling live asset fields from Postgres and persisting each result to a new `AIPrediction` table (`GET /api/ai/history/:assetType/:assetId`).
- Frontend `/predictions` page: pick a road or bridge, run inference, see risk badge + confidence + explainability chart.
- Flood risk, congestion, and budget-optimization models were intentionally **not** built — there's no weather/traffic/budget data in the schema to ground them in yet.

## Stack
Frontend: Next.js 14 (App Router) + TypeScript + Tailwind + React Query + React Hook Form + Zod + Leaflet + Recharts
Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL + JWT + Zod + Turf.js
Infra: Docker Compose (local), GitHub Actions CI, Dockerfiles ready for Render/Vercel/Neon deployment

## Quick start (Docker — recommended)

```bash
docker compose up --build
```

This starts Postgres, runs migrations + seed automatically, and boots the backend (port 4000) and frontend (port 3000).

Open http://localhost:3000

Seeded accounts (password for all: `Passw0rd!123`):
- admin@infra-platform.local (ADMIN)
- planner@infra-platform.local (PLANNER)
- citizen@infra-platform.local (CITIZEN)

## Manual setup (without Docker)

### 1. Database
Provision a Postgres instance (local or [Neon](https://neon.tech)) and note the connection string.

### 2. Backend
```bash
cd backend
cp .env.example .env      # edit DATABASE_URL and JWT secrets
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev                 # http://localhost:3000
```

## Running tests
```bash
cd backend
npm test
```

## API overview
All endpoints are prefixed with `/api`. Interactive exploration: import the routes into Postman or hit them directly.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email`, `/google`, `GET /auth/me` |
| Roads | `GET/POST /roads`, `GET/PATCH/DELETE /roads/:id` |
| Bridges | `GET/POST /bridges`, `GET/PATCH/DELETE /bridges/:id` |
| Transit | `GET/POST /transit`, `GET/PATCH/DELETE /transit/:id` |
| Assets | `GET/POST /assets`, `GET/PATCH/DELETE /assets/:id` |
| GIS | `GET /gis/layers`, `POST /gis/layers/upload`, `DELETE /gis/layers/:id`, `POST /gis/buffer`, `POST /gis/distance`, `GET /gis/search`, `GET /gis/nearby` |
| Dashboard | `GET /dashboard/stats` |
| Complaints | `GET/POST /complaints` (multipart, `photos` field, up to 5), `GET /complaints/:id`, `PATCH /complaints/:id/status`, `GET /complaints/stats` |
| Inspections | `GET/POST /inspections` (multipart, `photos` field, up to 5) |
| Maintenance | `GET/POST /maintenance`, `GET/PATCH/DELETE /maintenance/:id`, `GET /maintenance/cost-summary` |

Write operations (create/update) require role ADMIN, PLANNER or ENGINEER, except: any authenticated user (including CITIZEN) may submit a complaint, and users may only list/view their own complaints unless they hold a staff/researcher role. Delete requires ADMIN. Complaint status updates require ADMIN, PLANNER or ENGINEER. Read endpoints otherwise require any authenticated user.

Uploaded photos are written to `backend/uploads/` and served statically at `http://localhost:4000/uploads/<filename>` — persisted via the `backend_uploads` Docker volume in `docker-compose.yml`.

## Deployment
- **Frontend → Vercel**: set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend → Render**: use `backend/Dockerfile`, set all vars from `.env.example`, run `npx prisma migrate deploy` as a release command.
- **Database → Neon**: paste the pooled connection string into `DATABASE_URL`.

## Roadmap
This covers Phases 1–2 of an 8-phase build (see project plan). Remaining phases add: real analytics dashboards built on this data (Phase 3), the AI Prediction Engine — FastAPI/ML for deterioration, flood risk, congestion, bridge failure (Phase 4), Resilience & Social Sustainability scoring (Phase 5), the 3D Digital Twin (Phase 6), a RAG-based AI chat assistant over infrastructure documents (Phase 7), and Admin/Notifications/security hardening (Phase 8).

<!-- update sync 5 -->
