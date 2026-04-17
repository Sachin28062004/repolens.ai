# RepoLens AI Backend

## Run locally

1. Create `backend/.env` from `.env.example` and fill in:
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - Optional `GITHUB_API_TOKEN`
2. Start PostgreSQL:
   - `docker compose -f backend/docker-compose.yml up -d db`
3. Run the backend:
   - `cd backend`
   - `gradle bootRun`
4. Open the API:
   - `http://localhost:8080/actuator/health`

## Run with Docker

1. Fill `backend/.env`
2. Start both services:
   - `docker compose -f backend/docker-compose.yml up --build`

## Main endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/github/branches?repoUrl=...`
- `POST /api/github/analyze`
- `POST /api/reviews/code`
- `POST /api/uploads`

