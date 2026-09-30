# Stylework Lead Intake Service

A production-ready full-stack application that receives leads from Meta Ads webhooks, stores them in PostgreSQL with a full audit trail, and presents them through a modern React dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐   ┌──────────────┐  │
│  │   Frontend   │────▶│   Backend    │──▶│  PostgreSQL  │  │
│  │  React/Vite  │     │  Express/TS  │   │  (Prisma)    │  │
│  │  nginx:80    │     │  :4000       │   │  :5432       │  │
│  └──────────────┘     └──────────────┘   └──────────────┘  │
│   host: :5173          host: :4000        host: :5432       │
└─────────────────────────────────────────────────────────────┘
```

### Backend Layers

```
HTTP Request
    │
    ▼
Router (Express)
    │
    ▼
Controller   ← Validates request via Zod schema
    │
    ▼
Service      ← Business logic, state machine enforcement
    │
    ▼
Repository   ← Prisma ORM, atomic transactions
    │
    ▼
PostgreSQL
```

### Frontend Architecture

```
React (Vite) + TypeScript
├── lib/api.ts           — Axios client (base URL, error interceptor)
├── hooks/useLeads.ts    — React Query hooks (cache, mutations)
├── types/lead.ts        — Shared domain types
├── pages/LeadsPage.tsx  — Main dashboard page
└── components/
    ├── LeadCard.tsx     — Card with inline status transitions
    ├── LeadDrawer.tsx   — Slide-in detail + activity timeline
    ├── CreateLeadModal.tsx — New lead form
    └── StatusBadge.tsx  — Colour-coded status pill
```

---

## Setup Instructions

### Prerequisites

- **Docker Desktop** (recommended) — or Node.js 20+ and PostgreSQL 14+
- Git

### 1. Clone and configure

```bash
git clone <repo-url>
cd stylework
cp .env.example .env
```

The `.env` defaults work out of the box for Docker.

### 2. Start with Docker (recommended)

```bash
docker compose up -d
```

This starts all three services (postgres, backend, frontend) with health checks and dependency ordering.

### 3. Run database migrations & seed

```bash
cd backend
npm run db:migrate     # applies Prisma migrations
npm run db:seed        # seeds 5 sample leads
```

### 4. Open the app

| Service | URL |
|---|---|
| Frontend Dashboard | http://localhost:5173 |
| Backend API | http://localhost:4000/api/leads |
| Health Check | http://localhost:4000/health |

---

## Local Development (without Docker)

```bash
# Start PostgreSQL locally first, then:

# Backend
cd backend
cp .env.example .env   # set DATABASE_URL
npm install
npm run db:migrate
npm run db:seed
npm run dev            # starts on :4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # starts on :5173 with proxy to :4000
```

---

## Deployment Steps

### Production Docker

```bash
# Build and start all services
docker compose up -d --build

# Verify all containers are healthy
docker compose ps
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://stylework:stylework@postgres:5432/stylework_db` | PostgreSQL connection string |
| `PORT` | `4000` | Backend server port |
| `NODE_ENV` | `production` | Environment |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `LOG_LEVEL` | `info` | Winston log level |
| `REQUEST_LIMIT` | `1mb` | Express body size limit |

---

## API Reference

### Webhook

| Method | Path | Description |
|---|---|---|
| `POST` | `/webhook/meta-lead` | Ingest a Meta Ads lead webhook (idempotent) |

### Leads

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/leads` | List leads (paginated, filterable, sortable) |
| `GET` | `/api/leads/:id` | Get lead with full activity timeline |
| `POST` | `/api/leads` | Manually create a lead |
| `PATCH` | `/api/leads/:id` | Update lead fields |
| `PATCH` | `/api/leads/:id/status` | Transition status via state machine |
| `DELETE` | `/api/leads/:id` | Delete a lead |
| `POST` | `/api/leads/:id/activities` | Log a custom activity |

### Query Parameters for `GET /api/leads`

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Results per page (max 100) |
| `search` | string | — | Searches name, email, phone |
| `status` | enum | — | `NEW\|CONTACTED\|QUALIFIED\|CONVERTED\|LOST` |
| `source` | string | — | Filter by lead source |
| `sortBy` | string | `createdAt` | `createdAt\|firstName\|lastName\|status\|updatedAt` |
| `sortOrder` | enum | `desc` | `asc\|desc` |

### Status State Machine

```
        ┌──────────┐
   ┌───▶│ CONTACTED│───┐
   │    └──────────┘   │
   │                   ▼
NEW │             QUALIFIED
   │                   │
   │    ┌─────────┐    ▼
   └───▶│  LOST   │  CONVERTED (terminal)
        └─────────┘
              ▲
              │ (re-open)
              │
```

Attempting an invalid transition returns `422 INVALID_STATUS_TRANSITION`.

### Webhook Payload Format (Meta Ads)

```json
{
  "leadgen_id": "unique-meta-lead-id",
  "created_time": "2026-09-30T10:00:00Z",
  "campaign_id": "camp-001",
  "ad_id": "ad-001",
  "field_data": [
    { "name": "first_name", "values": ["Jane"] },
    { "name": "last_name",  "values": ["Doe"] },
    { "name": "email",      "values": ["jane@example.com"] },
    { "name": "phone_number", "values": ["+91-9876543210"] }
  ]
}
```

The webhook endpoint is **idempotent** — replaying the same `leadgen_id` returns the existing lead with `200` instead of `201`.

---

## Audit Trail

Every significant action creates an `Activity` record linked to the lead:

| Action | Trigger |
|---|---|
| `Lead Created` | New lead via webhook or manual entry |
| `Status Changed` | Any status transition (stores `previousValue` + `newValue`) |
| `Note Added` | Note submitted via manual entry or activity log |
| `Call Logged` | Custom activity via `POST /api/leads/:id/activities` |

All activities are displayed in the Lead Detail Drawer in reverse-chronological order with timestamps.

---

## Database Schema

```prisma
model Lead {
  id             String     @id @default(cuid())
  externalLeadId String     @unique     // Meta leadgen_id
  firstName      String
  lastName       String
  email          String
  phone          String?
  source         String     @default("META_ADS")
  campaignId     String?
  adId           String?
  status         LeadStatus @default(NEW)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  activities     Activity[]
}

model Activity {
  id            String   @id @default(cuid())
  leadId        String
  action        String
  previousValue Json?
  newValue      Json?
  metadata      Json?
  createdAt     DateTime @default(now())
  lead          Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
}
```

---

## Testing

```bash
# Backend (Jest + Supertest)
cd backend
npm test

# Frontend (Vitest + React Testing Library)
cd frontend
npm run test:run
```

**Test summary:** 43 tests across 6 suites:
- Unit tests: Webhook validator, Lead schema validator, Workflow state machine (18 tests)
- Integration tests: Full HTTP stack via Supertest with mocked Prisma (20 tests)
- Frontend component tests: StatusBadge (5 tests)

---

## Trade-offs

| Decision | Trade-off |
|---|---|
| **Prisma ORM** | Excellent DX and type safety; slightly heavier than raw SQL for high-throughput bulk operations |
| **CUID for IDs** | Collision-resistant and URL-safe without a UUID dependency; slightly longer than auto-increment |
| **Status state machine in service layer** | Clear boundary, easily testable; would move to DB-level check (Postgres trigger) for multi-instance consistency |
| **In-process audit writes** | Simple and transactional; at scale would use an event queue (Kafka/SQS) to decouple audit writes |
| **React Query for data fetching** | Zero-boilerplate caching and optimistic updates; adds bundle weight vs. plain fetch |
| **Mocked Prisma in tests** | Fast, zero-infrastructure tests; trade-off is reduced confidence vs. real integration tests |

---

## Scaling Considerations

1. **Webhook ingestion at scale**: Move from synchronous DB write to an async queue (BullMQ/SQS). The webhook handler enqueues the event and returns `202 Accepted` immediately.

2. **Database**: Add read replicas for the `GET /leads` list endpoint; partition the `activities` table by `created_at` as volume grows.

3. **Idempotency**: The current `externalLeadId` unique constraint handles replay at the DB level. At scale, add a Redis distributed lock to prevent the thundering herd on simultaneous replays.

4. **Horizontal backend scaling**: The service is stateless. Add a load balancer (nginx/ALB) in front of multiple backend instances. Prisma connection pool (`connection_limit`) should be tuned per instance.

5. **Rate limiting**: Add `express-rate-limit` on `/webhook/meta-lead` to guard against abuse.

---

## Future Improvements

- [ ] Meta webhook HMAC signature verification (`X-Hub-Signature-256`)
- [ ] Authentication & role-based access control (JWT + RBAC)
- [ ] Real-time dashboard updates via WebSockets / SSE
- [ ] Lead assignment to sales rep users
- [ ] Bulk CSV export
- [ ] Email/SMS notification on new lead via Resend/Twilio
- [ ] Grafana + Prometheus metrics dashboard
- [ ] CI/CD pipeline (GitHub Actions → deploy to Railway/Fly.io)
- [ ] E2E tests with Playwright
