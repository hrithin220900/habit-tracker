# Habit Tracker - Production Web App

A full-stack habit tracking application built with Next.js, Node.js, MongoDB, and Socket.io.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Zustand, Recharts
- **Backend**: Node.js, Express, TypeScript, MongoDB, Socket.io
- **Auth**: JWT (Access + Refresh Tokens)
- **API**: REST + GraphQL
- **DevOps**: Docker, Docker Compose, GitHub Actions, GCP

## Project Structure

```bash
habit-tracker/
├── backend/ # Express API server
├── frontend/ # Next.js application
└── .github/ # CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 7+ (or Docker)
- npm or yarn

### Development

1. Clone the repository
2. Install dependencies:
   cd backend && npm install
   cd ../frontend && npm install
3. Set up environment variables (copy `.env.example` to `.env`)
4. Start MongoDB (or use Docker Compose)
5. Run development servers:

```bash
# Backend
cd backend && npm run dev
# Frontend (new terminal)
cd frontend && npm run dev
### Docker
docker-compose up
```

## Verify setup

Backend:

```bash
cd backend
npm install
npm run type-check
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

## License

ISC
