# Habit Tracker – Full‑Stack Web App

Habit Tracker is a full‑stack, production‑ready web application for tracking daily habits, streaks, and analytics.  
It includes authentication, real‑time updates, dashboards with charts, and an admin panel.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, Recharts, Apollo Client
- **Backend**: Node.js 20, Express 5, TypeScript, MongoDB (Mongoose), Socket.io, Apollo Server
- **Auth**: JWT (Access + Refresh Tokens)
- **API**: REST + GraphQL (for analytics)
- **DevOps (planned)**: Docker, Docker Compose, GitHub Actions CI/CD, GCP (Cloud Run/GKE)

---

## Project Structure

```bash
habit-tracker/
├── backend/                # Express API server (TypeScript)
│   └── src/
│       ├── core/           # Config, DB, middlewares, utils, GraphQL, socket
│       ├── modules/        # Feature modules
│       │   ├── auth/       # Auth (JWT, login/register, refresh)
│       │   ├── users/      # User model
│       │   ├── habits/     # Habits + completions + events
│       │   ├── analytics/  # Analytics (REST + GraphQL)
│       │   └── admin/      # Admin APIs
│       └── server.ts       # Express + Socket.io + Apollo bootstrapping
│
├── frontend/               # Next.js app (App Router, TypeScript)
│   └── src/
│       ├── app/            # Routes: auth, dashboard, habits, admin
│       ├── features/       # Feature logic (auth, habits, dashboard, admin)
│       ├── components/     # Reusable UI + charts + shared
│       ├── state/          # Zustand stores
│       ├── api/            # REST + GraphQL clients
│       └── lib/            # Config, socket, helpers
│
├── docker-compose.yml      # Local Docker orchestration (Mongo + backend + frontend)
└── README.md
```

---

## Running the App Locally

This section assumes you’re a third‑party developer who just cloned the repo.

### Prerequisites

- **Node.js**: v20+
- **npm**: v10+
- **MongoDB**: v7+ (local instance or Docker)
- **Git**: for cloning the repo

Optional:

- **Docker & Docker Compose**: for containerized local dev

---

## 1. Clone and Install Dependencies

```bash
git clone <your-repo-url> habit-tracker
cd habit-tracker

# Backend deps
cd backend
npm install

# Frontend deps
cd ../frontend
npm install
```

---

## 2. Environment Configuration

### Backend (`backend/.env`)

Copy the example file and adjust values as needed:

```bash
cd backend
cp .env.example .env
```

Important variables in `.env`:

- `NODE_ENV=development`
- `PORT=5000`
- `API_PREFIX=/api`
- `MONGODB_URI=mongodb://localhost:27017/habit-tracker`
- `JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars`
- `JWT_ACCESS_EXPIRY=15m`
- `JWT_REFRESH_EXPIRY=7d`
- `FRONTEND_URL=http://localhost:3000`
- `SOCKET_CORS_ORIGIN=http://localhost:3000`

> Ensure `JWT_SECRET` is at least 32 characters or backend startup will fail.

### Frontend (`frontend/.env.local`)

```bash
cd ../frontend
cp .env.local.example .env.local
```

Typical values:

- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5000/graphql`
- `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

---

## 3. Start MongoDB

You can either run MongoDB natively or via Docker.

### Option A: Native MongoDB

Make sure MongoDB is running on `mongodb://localhost:27017`:

```bash
mongod --dbpath <your-db-path>
```

### Option B: Docker (MongoDB only)

```bash
docker run -d \
  --name habit-tracker-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=habit-tracker \
  mongo:7
```

---

## 4. Run Backend (Dev)

From the `backend` directory:

```bash
cd backend
npm run dev
```

This will:

- Start Express on `http://localhost:5000`
- Expose REST API under `http://localhost:5000/api`
- Expose GraphQL under `http://localhost:5000/graphql`
- Start Socket.io on `http://localhost:5000` (default `/socket.io` path)

Health check:

```bash
curl http://localhost:5000/health
```

You should see a JSON object with `status: "ok"`.

---

## 5. Run Frontend (Dev)

From the `frontend` directory:

```bash
cd frontend
npm run dev
```

This will start Next.js on `http://localhost:3000`.

Key routes:

- `http://localhost:3000/` – Redirects to `/login` or `/dashboard` based on auth
- `http://localhost:3000/login` – Login
- `http://localhost:3000/register` – Register
- `http://localhost:3000/dashboard` – Authenticated dashboard + charts
- `http://localhost:3000/habits` – Habit list / CRUD
- `http://localhost:3000/habits/[id]` – Habit detail view
- `http://localhost:3000/admin` – Admin panel (requires admin role)

---

## 6. Auth & Admin Access

### User Authentication

- Register via `POST /api/auth/register` or the `/register` page.
- Login via `POST /api/auth/login` or the `/login` page.
- The frontend stores access and refresh tokens in `localStorage` and uses them for:
  - REST calls via Axios
  - GraphQL via Apollo Client
  - Socket.io via auth token

### Creating an Admin User

There is no built‑in seeder yet. To promote a user to admin:

1. Find the user in MongoDB (`users` collection).
2. Update the `role` field to `"admin"`:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } });
```

3. After that, logging in as that user will unlock the `/admin` panel.

---

## 7. Using the App

### Habits

- Create/edit/delete habits from `/habits`.
- Each habit has: name, description, frequency, color, icon, optional public link.
- Mark habits as completed for today; streaks and completion counts are tracked.
- Real‑time updates are pushed via Socket.io to all of a user’s open sessions.

### Dashboard & Analytics

- `/dashboard` uses GraphQL (`GET_DASHBOARD`) for aggregated stats:
  - Total habits
  - Active streaks
  - Completion rate
  - Weekly completion trend (Recharts line chart)
  - Top habits by completions (Recharts bar chart)

### Admin Panel

- `/admin` (admin users only):
  - **Users**: list, paginate, search, change roles, delete users.
  - **Habits**: view habits across all users with pagination and search.
  - **Metrics**: system‑wide stats (users, habits, completions, longest streak).

---

## 8. Running via Docker Compose (Optional)

A basic `docker-compose.yml` is provided for local dev:

```bash
docker-compose up --build
```

Services:

- `mongodb`: MongoDB 7 on `localhost:27017`
- `backend`: Express API on `localhost:5000`
- `frontend`: Next.js app on `localhost:3000`

> Note: The Docker setup is oriented to development, not yet fully optimized for production.

---

## 9. Useful Scripts

### Backend (`backend/package.json`)

- `npm run dev` – Start dev server with `tsx` (watch mode)
- `npm run build` – Compile TypeScript to `dist`
- `npm run start` – Run compiled server from `dist`
- `npm run type-check` – TypeScript type checking
- `npm run test` – Jest tests (skeleton)

### Frontend (`frontend/package.json`)

- `npm run dev` – Next.js dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – ESLint
- `npm run type-check` – TypeScript type checking

---

## 10. Testing & Quality

- **TypeScript**: strict mode is enabled in both backend and frontend.
- **Validation**: All external inputs are validated on backend using Zod + custom middlewares.
- **Error Handling**: Centralized error middleware and structured logging via Pino.
- **Auth**: Access tokens (short‑lived) and refresh tokens (stored in DB) with rotation.

You can run quick sanity checks with:

```bash
# Backend
cd backend
npm run type-check

# Frontend
cd ../frontend
npm run type-check
```

---

## 11. Production, CI/CD & GCP (Planned)

The repo is structured to support:

- Multi‑stage Dockerfiles for backend and frontend
- GitHub Actions workflows for test → build → push → deploy
- GCP deployment (e.g., Cloud Run) using the built images

These are not fully wired yet, but the codebase and config layout are prepared with this in mind.

---

## 12. License

MIT / ISC (verify and adjust as needed for your project).
