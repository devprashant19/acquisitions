# Docker and Neon Database Setup

This document explains how to run the application using Docker, both for local development with Neon Local, and for production connecting to the Neon Cloud Database.

## 1. Local Development Setup (with Neon Local)

In development, we use `docker-compose.dev.yml` to spin up both the Node.js application and a local Neon Postgres proxy (`neon-local`). This allows you to develop offline or without hitting your cloud database limits.

**Neon Local Features:**
- Runs a local Postgres instance compatible with Neon's architecture.
- You can manage ephemeral branches via Neon Local's HTTP API (exposed on port `5433`).
- The application automatically connects to this proxy using credentials defined in `.env.development`.

### Steps to Run Locally
1. Ensure Docker and Docker Compose are installed.
2. Run the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```
3. The app will be available at `http://localhost:8080`.
4. Hot-reloading is enabled because the local code directory is mounted into the container (`volumes: - .:/app`).
5. (Optional) You can run Drizzle migrations locally inside the container:
   ```bash
   docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
   ```

## 2. Production Setup (with Neon Cloud)

In production, the application runs on its own and connects directly to the Neon Cloud Database. We do not spin up `neon-local` in production. 

**Production Features:**
- The Docker container is completely immutable (no local file mounting).
- Uses `.env.production` to inject the real `DATABASE_URL` for the Neon Cloud Postgres.

### Steps to Deploy to Production
1. Open `.env.production` and replace the `DATABASE_URL` with your actual Neon Cloud connection string.
2. Run the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
3. The application will start using `node src/index.js` without hot-reloading overhead.

## How Environment Variables Switch
The switching is handled via the `env_file` directive in the docker-compose configurations:
- **`docker-compose.dev.yml`**: Explicitly loads `.env.development` where `DATABASE_URL` is hardcoded to `postgres://postgres:postgres@neon-local:5432/postgres`.
- **`docker-compose.prod.yml`**: Explicitly loads `.env.production` where `DATABASE_URL` points to your Neon Serverless DB URL. No `neon-local` service is started.
