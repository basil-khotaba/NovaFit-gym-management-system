# NovaFit — Gym Management System

Full-stack gym management app: browse classes, book sessions, manage
membership plans, and (for admins) manage classes/trainers/plans.

**Stack:** React (Vite) + Redux Toolkit + Context API on the frontend;
Node.js/Express + MongoDB/Mongoose + JWT auth on the backend.

## Project structure

```
client/   React SPA (Vite)
server/   Express REST API
```

## Data model

MongoDB collections (via Mongoose) and how they relate:

| Collection | Key fields | References |
|---|---|---|
| `User` | `name`, `email`, `password` (hashed), `role` (`member`/`admin`) | `membership` → `Membership` |
| `Trainer` | `name`, `bio`, `specialties[]`, `rating` | virtual `classes` ← `Class.trainer` |
| `Class` | `name`, `category`, `durationMinutes`, `schedule`, `capacity` | `trainer` → `Trainer` (required) |
| `Plan` | `name` (unique), `price`, `features[]`, `classLimit` | catalogue only, no direct refs |
| `Membership` | `startDate`, `endDate`, `isActive` | `user` → `User`, `plan` → `Plan` |
| `Booking` | `status` (`pending`/`confirmed`/`cancelled`), `bookedAt` | `user` → `User`, `class` → `Class`; unique compound index on `(user, class)` prevents double-booking |
| `Review` | `rating` (1–5), `comment` | `user` → `User`, `trainer` → `Trainer`; unique compound index on `(user, trainer)` — one review per trainer per member |

Relationship shape: `Plan` is the catalogue of membership tiers; `Membership`
is the join between a `User` and a `Plan` for a given period. `Trainer` owns
many `Class`es (stored as a foreign key on `Class`, exposed back on `Trainer`
via a virtual populate). `Booking` and `Review` are join collections linking
`User` to `Class` and `Trainer` respectively, each with a uniqueness
constraint enforced at the database level.

## Local setup

### Server

```bash
cd server
npm install
cp .env.example .env   # then fill in real values
npm run dev             # http://localhost:5000
```

Required env vars (see `server/.env.example`):

| Variable | Meaning |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `PORT` | Port the API listens on |
| `CLIENT_URL` | The deployed client origin, used for CORS in production |

### Client

```bash
cd client
npm install
cp .env.example .env   # then fill in real values
npm run dev             # http://localhost:5173
```

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:5000/api` |

## Running tests

Backend tests use Jest + Supertest against an in-memory MongoDB
(`mongodb-memory-server`) — they never touch a real database.

```bash
cd server
npm test
```

## Deployment

### Backend → Render

1. Create a MongoDB Atlas free cluster and grab its connection string
   (Render's filesystem is ephemeral, so the database has to live
   elsewhere anyway).
2. In Render: New → Web Service → connect this repo, root directory
   `server/`, build command `npm install`, start command `node server.js`
   (the included `Procfile` documents the same start command).
3. Set environment variables to match `server/.env.example`: `MONGO_URI`,
   `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `CLIENT_URL`
   (the deployed Vercel URL, set after the step below).
4. Deploy, then confirm it's alive: `GET https://your-service.onrender.com/api/health`.
5. To create the admin account once, temporarily set the start command
   to `node scripts/makeAdmin.js`, add `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   / `ADMIN_NAME` env vars, deploy once, then change the start command
   back to `node server.js`.

> **Known limitation:** uploaded images (Multer → `server/uploads/`) are
> written to local disk. Render's free-tier filesystem is ephemeral —
> uploaded files are wiped on every restart/redeploy. Fine for a class
> demo; for real persistence, swap the Multer storage engine for a
> cloud provider (e.g. Cloudinary or S3) before relying on it long-term.

### Frontend → Vercel

1. Import the repo in Vercel, set the project root to `client/`.
2. Framework preset: Vite (build command `npm run build`, output `dist`).
3. Set the environment variable `VITE_API_URL` to your deployed API's
   `/api` URL (e.g. `https://your-service.onrender.com/api`).
4. `client/vercel.json` is already included so client-side routes
   (`/classes/:id`, etc.) fall back to `index.html` on refresh instead
   of 404ing.
5. Once deployed, update the backend's `CLIENT_URL` env var on Render to
   the Vercel URL so CORS allows it, then redeploy the backend.

After both are live, put the two URLs here for submission:

- Client: https://nova-fit-gym-management-system-novafit.vercel.app
- Server: https://novafit-gym-management-system.onrender.com
