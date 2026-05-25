# Education Portal System

An education portal platform with a Vue 3 + Element Plus frontend, Spring Boot + MyBatis Plus backend, MySQL persistence, Redis cache/session support, CAS login integration, and course-platform data synchronization.

## Modules

- `frontend/` - portal frontend and CMS admin UI.
- `backend/` - RESTful Spring Boot API.
- `database/` - MySQL schema and seed data.
- `integration/` - CAS and course-platform mock/integration contracts.
- `docs/` - architecture, API, integration, and test documentation.
- `qa/` - test cases and verification assets.

## Quick Start

1. Start infrastructure:

   ```bash
   docker compose up -d mysql redis
   ```

2. Import database scripts from `database/schema.sql` and `database/seed.sql`.

3. Start backend:

   ```bash
   cd backend
   export DB_PASSWORD=edu123456
   export PORTAL_CAS_LOGIN_URL=https://cas.example.edu/cas/login
   export PORTAL_LMS_LAUNCH_BASE_URL=https://lms.example.edu/course-platform
   mvn spring-boot:run
   ```

   On Windows PowerShell, use `$env:DB_PASSWORD='edu123456'` style environment
   variables before running Maven. CAS and LMS URLs must be configured for
   those integration paths; the backend no longer falls back to localhost
   external-service URLs.

4. Start frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Optional mock integrations:

   ```bash
   cd integration/mock-server
   npm install
   npm start
   ```

Default API base path: `http://localhost:8080/api`.
