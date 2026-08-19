# CareerForge API

FastAPI backend for the CareerForge frontend. Structured into separate
modules rather than one giant `main.py`:

```
app/
  main.py            # wiring only — creates the app, mounts routers, CORS
  database.py         # SQLAlchemy engine/session, Base, get_db dependency
  core/
    config.py          # settings loaded from environment variables
    security.py        # password hashing + JWT create/decode
    deps.py             # get_current_user / require_admin dependencies
  models/               # SQLAlchemy ORM tables (one file per table)
    user.py
    application.py
    contact.py
    partner.py
  schemas/              # Pydantic request/response shapes (one file per resource)
    user.py
    application.py
    contact.py
    partner.py
  routers/               # one file per route group, included from main.py
    auth.py               # POST /api/auth/register, /api/auth/login
    apply.py               # POST /api/apply (multipart — handles CV upload)
    contact.py              # POST /api/contact
    partner.py                # POST /api/partner
    admin.py                   # GET /api/admin/stats, /api/admin/applicants (admin-only)
  bot/
    chat.py                     # STUB — reserved space for your chatbot, see below
  uploads/
    resumes/                      # uploaded CV files land here on the server
```

## Running locally

```bash
cd careerforge-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env as needed
uvicorn app.main:app --reload --port 8000
```

The API will be at `http://localhost:8000`. SQLite is used by default —
a `careerforge.db` file appears in this folder, no database setup needed
for local dev.

## Deploying (e.g. Render)

1. Set the environment variables from `.env.example` in your Render
   service settings — especially `DATABASE_URL` (point it at your
   Postgres instance) and `JWT_SECRET`.
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Make sure `ALLOWED_ORIGINS` includes your actual deployed frontend URL,
   or the browser will block requests with a CORS error.

**Uploaded résumés are stored on disk** in `app/uploads/resumes/`. On most
hosts (including Render's free tier) this disk is **not persistent** —
it's wiped on redeploy/restart. For anything beyond a demo, swap the
file-saving code in `app/routers/apply.py` for a call to S3, Cloudinary,
or another persistent object store, and store the returned URL in
`Application.cv_path` instead of a local path.

## Endpoints implemented

| Method | Path                  | Auth required | Notes |
|--------|-----------------------|----------------|-------|
| POST   | `/api/auth/register`  | no             | Creates a user, returns `{user, token}` |
| POST   | `/api/auth/login`     | no             | Returns `{user, token}` |
| POST   | `/api/apply`          | no             | multipart/form-data — `cv` file required when `applicationType=Internship` |
| POST   | `/api/contact`        | no             | |
| POST   | `/api/partner`        | no             | |
| GET    | `/api/admin/stats`    | yes (admin)    | Bearer token in `Authorization` header |
| GET    | `/api/admin/applicants` | yes (admin)  | Bearer token in `Authorization` header |

These match what the frontend's `AuthContext.jsx` and `Apply.jsx` already
call. The frontend currently runs in a `MOCK_AUTH` mode that bypasses this
API entirely for login — flip `MOCK_AUTH` to `false` in
`src/context/AuthContext.jsx` once this backend is deployed and reachable,
and login/register will start hitting these real endpoints.

## The bot

`app/bot/chat.py` is a stub, not a working chatbot — it's there so you
have a router file and a marked spot in `app/main.py` (search for "BOT
INTEGRATION") to wire your own bot into. Build your bot logic in that
file, uncomment the two lines in `main.py`, and it'll be live at
`POST /api/bot/chat`.

## Creating your first admin user

There's no admin signup UI on purpose. Register a normal account through
`/api/auth/register`, then manually flip that user's `role` to `"admin"`
in the database (SQLite: open `careerforge.db` with any SQLite browser;
Postgres: `UPDATE users SET role = 'admin' WHERE email = '...';`).
