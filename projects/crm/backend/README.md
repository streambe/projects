# CRM Ciudad Moto — Backend

Backend API for CRM Ciudad Moto. Built with Fastify v4, Prisma v5, PostgreSQL, and TypeScript.

---

## Requirements

- Node.js >= 20.0.0
- PostgreSQL >= 14
- Redis >= 7 (used by BullMQ for background job queues)

---

## Local Setup

### 1. Clone and install dependencies

```bash
cd crm/backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens (generate with `openssl rand -hex 64`) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (different from JWT_SECRET) |
| `ENCRYPTION_KEY` | AES-256-GCM key for encrypting OAuth tokens (generate with `openssl rand -hex 32`) |
| `REDIS_URL` | Redis connection string for BullMQ |
| `CORS_ORIGIN` | Frontend origin (default: `http://localhost:5173`) |

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

This creates all tables in your PostgreSQL database.

### 5. Seed initial data (optional)

Creates a default admin user (`admin@ciudadmoto.com` / `Admin1234!`).

```bash
npm run prisma:seed
```

**Change the default password before deploying to production.**

### 6. Start development server

```bash
npm run dev
```

The server starts on `http://localhost:3000` by default.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Start compiled server from `dist/` |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate` | Create and run new migration |
| `npm run prisma:migrate:deploy` | Apply pending migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Seed initial data |
| `npm run typecheck` | Check TypeScript types without emitting |

---

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/             # Login, JWT, user management
│   │   ├── clients/          # Client CRUD, duplicate detection
│   │   ├── opportunities/    # Pipeline, stage changes, history
│   │   ├── activities/       # Calls, meetings, tasks
│   │   ├── communications/   # Gmail + WhatsApp unified inbox
│   │   └── reports/          # Aggregate reports
│   ├── shared/
│   │   ├── middleware/       # Auth middleware
│   │   ├── plugins/          # Fastify plugins (Prisma, JWT)
│   │   └── utils/            # Errors, pagination, encryption
│   ├── prisma/
│   │   └── client.ts         # Prisma singleton client
│   ├── types/
│   │   └── fastify.d.ts      # Fastify type augmentations
│   ├── app.ts                # Fastify app factory
│   └── server.ts             # Entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Initial seed data
├── .env.example              # Environment variable template
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Health

```
GET /health
```

Returns server status. No authentication required.

### Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/login` | Obtain access + refresh tokens | No |
| POST | `/api/v1/auth/refresh` | Refresh access token using cookie | Cookie |
| POST | `/api/v1/auth/logout` | Clear refresh token cookie | Bearer |
| POST | `/api/v1/auth/register` | Create new user | No |
| GET | `/api/v1/auth/me` | Get current user profile | Bearer |

### Documentation

OpenAPI/Swagger UI available in development at: `http://localhost:3000/docs`

---

## Authentication Flow

1. Client sends `POST /api/v1/auth/login` with `{ email, password }`
2. Server responds with:
   - `accessToken` in the JSON body (short-lived, 1h)
   - `refreshToken` in an HttpOnly cookie (7 days)
3. Client includes access token in every request: `Authorization: Bearer <accessToken>`
4. When the access token expires, call `POST /api/v1/auth/refresh` (cookie is sent automatically)
5. To logout, call `POST /api/v1/auth/logout` — this clears the refresh token cookie

---

## Database Schema

The schema is defined in `prisma/schema.prisma`. Main tables:

| Table | Description |
|-------|-------------|
| `users` | System users (vendedores, dueños) |
| `clients` | Customers and prospects |
| `opportunities` | Sales pipeline opportunities |
| `opportunity_history` | Stage change audit trail |
| `activities` | Calls, meetings, tasks |
| `messages` | Unified Gmail + WhatsApp history |
| `gmail_credentials` | OAuth tokens for linked Gmail accounts |
| `whatsapp_config` | WhatsApp Business API configuration |

---

## Security Notes

- OAuth tokens for Gmail and WhatsApp are **encrypted at rest** using AES-256-GCM before storing in the database
- The `ENCRYPTION_KEY` environment variable must be exactly 32 bytes (64 hex characters)
- Passwords are hashed with bcrypt (cost factor 12)
- Refresh tokens are stored in HttpOnly cookies to prevent XSS access
- All routes under `/api/v1/` (except auth endpoints) require a valid JWT access token

---

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production`
2. Generate strong secrets for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `ENCRYPTION_KEY`
3. Set `DATABASE_URL` with `?sslmode=require` for encrypted DB connections
4. Run `npx prisma migrate deploy` instead of `migrate dev`
5. Run `npm run build` and start with `npm start`
6. Change the default seeded admin password immediately
