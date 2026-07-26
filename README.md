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

### Backend → Heroku

1. `heroku create your-app-name` (from inside `server/`, or use `git subtree`/a
   monorepo buildpack if deploying from the repo root).
2. Set config vars to match `server/.env.example`:
   ```bash
   heroku config:set MONGO_URI=... JWT_SECRET=... JWT_EXPIRES_IN=7d CLIENT_URL=https://your-client.vercel.app
   ```
3. Push to Heroku (`git push heroku main`). The included `Procfile`
   (`web: node server.js`) tells Heroku how to start the app.
4. Confirm it's alive: `GET https://your-app-name.herokuapp.com/api/health`.

> **Known limitation:** uploaded images (Multer → `server/uploads/`) are
> written to local disk. Heroku's filesystem is ephemeral — uploaded
> files are wiped on every dyno restart/redeploy. Fine for a class demo;
> for real persistence, swap the Multer storage engine for a cloud
> provider (e.g. Cloudinary or S3) before relying on it long-term.

### Frontend → Vercel

1. Import the repo in Vercel, set the project root to `client/`.
2. Framework preset: Vite (build command `npm run build`, output `dist`).
3. Set the environment variable `VITE_API_URL` to your deployed API's
   `/api` URL (e.g. `https://your-app-name.herokuapp.com/api`).
4. `client/vercel.json` is already included so client-side routes
   (`/classes/:id`, etc.) fall back to `index.html` on refresh instead
   of 404ing.
5. Once deployed, update the backend's `CLIENT_URL` config var to the
   Vercel URL so CORS allows it, then redeploy the backend.

After both are live, put the two URLs here for submission:

- Client: `TODO — paste your Vercel URL`
- Server: `TODO — paste your Heroku URL`
