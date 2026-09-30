## Database Setup

### Prerequisites
- Docker Desktop installed and running
- OR PostgreSQL 14+ installed locally

### Option 1 — Docker (Recommended)

Start the database:
```bash
docker compose up -d postgres
```

Run migrations:
```bash
cd backend
npm run db:migrate
# When prompted for migration name: initial_schema
```

Seed the database:
```bash
npm run db:seed
```

### Option 2 — Local PostgreSQL

Create the database and user:
```sql
CREATE USER stylework WITH PASSWORD 'stylework';
CREATE DATABASE stylework_db OWNER stylework;
```

Then run migrations from the backend directory:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### Verify the database:
```bash
npx ts-node src/lib/verify-db.ts
```

### Reset the database (development only):
```bash
npm run db:reset
```
