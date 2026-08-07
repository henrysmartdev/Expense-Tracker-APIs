# Expense Tracker API

Node.js + Express + PostgreSQL (Sequelize), built with ES Modules.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Postgres database:
   ```
   createdb expense_tracker
   ```

3. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```

4. Start the server (auto-creates tables via `sequelize.sync`):
   ```
   npm run dev
   ```

Server runs on `http://localhost:5000` by default. Check `GET /health` to confirm it's up.

## Project structure

```
src/
  config/database.js       Sequelize connection setup
  models/                  User, Expense (+ associations in index.js)
  middleware/               auth.js (JWT check), errorHandler.js
  services/                 business logic - authService, expenseService
  controllers/               HTTP layer - reads req, calls service, sends res
  routes/                   route definitions
  utils/                    AppError, catchAsync
  app.js                    Express app (middleware + routes)
  server.js                 entry point (DB connect + listen)
```

Flow for every request: **route → middleware (auth) → controller → service → model → DB**.

## API reference

All `/expenses` routes require `Authorization: Bearer <token>` from login/signup.

### Auth
| Method | Route | Body |
|---|---|---|
| POST | `/auth/signup` | `{ name, email, password }` |
| POST | `/auth/login` | `{ email, password }` |

### Expenses (CRUD)
| Method | Route | Notes |
|---|---|---|
| POST | `/expenses` | `{ amount, category, date, description }` |
| GET | `/expenses` | supports query params below |
| GET | `/expenses/:id` | |
| PUT | `/expenses/:id` | partial update |
| DELETE | `/expenses/:id` | soft delete |

### Filtering & search
Add as query params to `GET /expenses`:
- `?category=food`
- `?from=2026-01-01&to=2026-01-31`
- `?search=coffee` (matches description)
- `?page=1&limit=20`

Example: `GET /expenses?category=food&from=2026-01-01&to=2026-01-31&search=lunch`

### Summaries & reports
| Method | Route | Returns |
|---|---|---|
| GET | `/expenses/summary` | total, per-category totals, monthly/weekly breakdown, highest category |
| GET | `/expenses/summary?groupBy=week` | breakdown bucketed by week instead of month |
| GET | `/expenses/summary?from=&to=` | scoped to a date range |
| POST |	/budgets	{ category, limitAmount, period, alertThreshold } — creates or updates
| GET |	/budgets	list all budgets for the user
| GET |	/budgets/:category/status	current spend vs. limit, on demand
| DELETE |	/budgets/:id	remove a budget

## Notes on design decisions

- **UUIDs** for primary keys instead of auto-increment ints (harder to enumerate, safer to expose in URLs).
- **Soft delete** (`paranoid: true`) on Expense - `DELETE` doesn't actually remove the row, just sets `deletedAt`.
- **Passwords** hashed with bcrypt via a Sequelize `beforeSave` hook - never stored plaintext, never returned in API responses.
- **AppError + catchAsync** pattern keeps controllers free of try/catch boilerplate - any thrown error automatically becomes a proper JSON error response.
