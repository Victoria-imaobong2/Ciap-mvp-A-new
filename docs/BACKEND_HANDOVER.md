# CIAP Data Layer — What I Built & How to Use It

**From:** Kosisochukwu (Data Engineer)  
**To:** Backend Developer  
**What this is:** A walkthrough of the `DATA/` package — what everything does and how to plug into it from your `backend/` folder.

Feel free to structure your backend however you want. This is just explaining my stuff so you're not guessing.

---

## Getting Started on Your Machine

Before anything else, here's how to get this running locally from scratch.

### Prerequisites

- **Python 3.11 or higher** — check with `python --version`
- **PostgreSQL 15+** — must be installed and running locally. Download from [postgresql.org](https://www.postgresql.org/download/) if you don't have it.
- **Git** — to clone the repo

### Step 1 — Clone and install dependencies

```bash
git clone https://github.com/30Cycleltd/ciap-mvp-a
cd ciap-mvp-a

# Install all Python packages (covers both DATA/ and backend/)
pip install -r requirements.txt
```

### Step 2 — Create your local PostgreSQL database

Open pgadmin (or psql) and run:

```sql
CREATE DATABASE ciap_db;
```

That's the only thing you need to do manually. The tables are created automatically in the next step.

### Step 3 — Create your `.env` file

In the project root (same level as `requirements.txt`), create a file called `.env`:

```env
# Your local PostgreSQL connection — change the password to yours
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/ciap_db

And whatever else ya wanna add
```

> The `DATABASE_URL` format is: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`  
> If your Postgres username isn't `postgres` or your port isn't `5432`, adjust accordingly.  
> This file is in `.gitignore`.

### Step 4 — Run the Alembic migrations (creates all database tables)

```bash
cd DATA/
python -m alembic upgrade head
cd ..
```

This reads the SQLAlchemy models in `DATA/models/` and automatically creates all 14 tables in your `ciap_db`. You should see output like:

```
INFO  [alembic.runtime.migration] Running upgrade  -> a1b2c3d4, Initial schema
```

Open pgAdmin or run `\dt` in psql to verify the tables are there.

### Step 5 — Verify everything is wired up

```bash
python -c "from DATA.core.database import engine; print('DB connection OK:', engine.url)"
```

If that prints without error, the database connection is working and you're good to go.

### Step 6 — Run the backend server

```bash
# From the project root
uvicorn backend.main:app --reload --port 8000
```

Go to `http://localhost:8000/docs` — you should see the FastAPI Swagger UI.

---

> **If you get `password authentication failed for user "postgres"`**  
> Your `.env` password is wrong. Open pgAdmin → right-click your server → Properties → check the username and password.
>
> **If you get `ModuleNotFoundError: No module named 'DATA'`**  
> Make sure you're running commands from the project root (`ciap-mvp-a/`), not from inside a subfolder.

---

### Step 5.5 — Seed the database with test data

There's a seed script that populates the database with 10 realistic Nigerian creators and 4 SME accounts so you have actual data to work with immediately. The JSON files are at `seeds/creators.json` and `seeds/smes.json` — passwords are stored plaintext in those files and hashed automatically at runtime using `bcrypt` (via the `passlib` package, which is in `requirements.txt`). This ensures the DB only ever sees secure hashes.

```bash
# From the project root
python seeds/seed.py
```

It will print a table of all the accounts that were created including their emails and passwords so you can log in straight away:

```
CREATORS:
  Anita Asuoha (Taaooma)          taaooma@creator.ciap.dev       pw: Taaooma@Ciap2026
  Fisayo Fosudo                   fisayo@creator.ciap.dev        pw: Fisayo@Ciap2026
  Bukunmi Adeaga-Ilori (KieKie)   kiekie@creator.ciap.dev        pw: KieKie@Ciap2026
  Chibuike Adindu (Aproko Doctor) aprokodoctor@creator.ciap.dev  pw: Aproko@Ciap2026
  Toke Makinwa                    toke@creator.ciap.dev          pw: Toke@Ciap2026
  Daniel Regha                    danielregha@creator.ciap.dev   pw: Daniel@Ciap2026

SMEs:
  Chidi Okeke (Dangote)           chidi.okeke@dangote.ciap.dev   pw: Dangote@Ciap2026
  Aisha Bello (PiggyVest)         aisha.bello@piggyvest.ciap.dev pw: PiggyVest@Ciap2026
```

Each creator also gets 2 mock content items with metric snapshots (views, likes, comments, etc.) proportional to their follower count — so your `/dashboard` and `/content` endpoints have real numbers to return immediately.

If you want to wipe everything and start fresh:
```bash
python seeds/seed.py --reset
```

---

## What's in DATA/

```
DATA/
├── core/database.py               ← PostgreSQL connection + session factory
├── models/                        ← SQLAlchemy ORM models (the actual database tables)
├── schemas/                       ← Pydantic models (for validating and serializing data)
└── data_connections/
    ├── repositories/              ← Abstract CRUD interfaces for every table
    └── external_apis/             ← Base client + mock client for platform APIs
```

Think of `DATA/` as a package you `pip install` except it's local. Your backend just imports from it. The database, the table definitions, the schemas, the repo contracts — all in there.

---

## 1. The Database Connection (`DATA/core/database.py`)

I set up the SQLAlchemy engine and session factory here. The `DATABASE_URL` is read from your environment — set it in a `.env` file:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ciap_db
```

To get a database session in your FastAPI endpoints, import `get_db`:

```python
from DATA.core.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

@router.get("/something")
def my_endpoint(db: Session = Depends(get_db)):
    # db is a live SQLAlchemy session, auto-closed after the request
    ...
```

That's it. `get_db` handles opening and closing the session automatically.

---

## 2. The ORM Models (`DATA/models/`)

These are the actual PostgreSQL table definitions written in SQLAlchemy. Each file maps to a domain:

| File | Tables inside |
|---|---|
| `models/users.py` | `users`, `creator_profiles`, `sme_profiles`, `platform_connections`, `audit_logs`, `notifications` |
| `models/content.py` | `content_items`, `content_metric_snapshots`, `audience_snapshots` |
| `models/campaigns.py` | `campaigns`, `campaign_collaborations`, `campaign_creator_briefs`, `conversion_events` |
| `models/scoring.py` | `influence_scores` |

You can import any of them directly:

```python
from DATA.models import User, ContentItem, Campaign, InfluenceScore
from DATA.models.users import CreatorProfile, PlatformConnection
```

SQLAlchemy relationships are wired up, so things like `user.creator_profile` and `content_item.metric_snapshots` just work once you have a session.

---

## 3. Setting Up the Database (Alembic)

I pre-configured Alembic inside `DATA/`. It already knows the models — you just need to run two commands from inside the `DATA/` folder:

```bash
cd DATA/

# Step 1: auto-generate the migration script from the models
python -m alembic revision --autogenerate -m "Initial schema"

# Step 2: apply the migration — this creates all 14 tables in PostgreSQL
python -m alembic upgrade head
```

After that your database has all the tables. If I ever change a model and tell you, just run both commands again — Alembic figures out what changed and only alters the necessary columns. You don't lose data.

---

## 4. The Pydantic Schemas (`DATA/schemas/`)

These are separate from the ORM models. Pydantic schemas handle validation (incoming requests) and serialization (outgoing responses). They don't talk to the database — they're just data shapes.

Three sub-folders:

### `schemas/entities/` — mirrors of the DB tables as Pydantic models
These are useful as your response models and for converting ORM rows to clean dicts.

```python
from DATA.schemas.entities import (
    User, CreatorProfile, Platform, UserRole,
    ContentItem, MediaType,
    Campaign, CampaignStatus,
    InfluenceScore, ScoreBreakdown,
)
```

All enums are in here too, so you don't have to redefine `Platform.YOUTUBE`, `UserRole.CREATOR`, etc.

### `schemas/requests/` — input validation for API endpoints
```python
from DATA.schemas.requests.auth import LoginRequest, RegisterRequest
from DATA.schemas.requests.campaign import CreateCampaignRequest
from DATA.schemas.requests.dashboard_filters import DashboardQueryParams
from DATA.schemas.requests.search_filters import CreatorSearchFilters
```

You can use these directly as FastAPI request body types:
```python
from DATA.schemas.requests.auth import RegisterRequest

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # body.email, body.password, body.full_name, body.role — all validated
    ...
```

### `schemas/responses/` — output shapes for your API responses
```python
from DATA.schemas.responses.dashboard_data import CreatorDashboardResponse
from DATA.schemas.responses.auth import TokenResponse
from DATA.schemas.responses.creator_profile import PublicCreatorProfile
from DATA.schemas.responses.campaign import CampaignDetailResponse
```

These work nicely as FastAPI `response_model`:
```python
@router.get("/dashboard", response_model=CreatorDashboardResponse)
def get_dashboard(...):
    ...
```

To convert a SQLAlchemy ORM object into a Pydantic schema, use `model_validate`:
```python
from DATA.schemas.entities import User as UserSchema
from DATA.models.users import User as UserORM

orm_user = db.query(UserORM).first()
pydantic_user = UserSchema.model_validate(orm_user)
```

This works because all entity schemas have `model_config = ConfigDict(from_attributes=True)`.

---

## 5. Repository Interfaces (`DATA/data_connections/repositories/`)

I wrote abstract interfaces (using Python's `ABC`) for every table. These define the CRUD method signatures — what each operation should return, what parameters it should accept, and what it does.

You don't have to use them if you don't want to. But if you do, it means your service layer is decoupled from SQLAlchemy — you could swap the DB implementation without touching your services.

Here's a quick look at what's available:

```python
from DATA.data_connections.repositories import (
    IUserRepository,               # get_by_email, verify_email, update_subscription, ...
    ICreatorProfileRepository,     # get_by_user_id, list_public_creators, update_influence_score, ...
    ISMEProfileRepository,         # get_by_user_id, get_by_industry, ...
    IPlatformConnectionRepository, # get_by_user_and_platform, get_all_expiring_soon, update_tokens, ...
    IContentRepository,            # get_by_creator, get_by_external_id, upsert, soft_delete, ...
    IContentMetricRepository,      # get_latest_for_content, get_history_for_content, insert_snapshot, ...
    IAudienceSnapshotRepository,   # get_latest_for_creator, get_history_for_creator, insert_snapshot, ...
    ICampaignRepository,           # get_by_sme, search, update_status, ...
    ICollaborationRepository,      # get_by_campaign, get_by_creator, get_by_tracking_code, ...
    IInfluenceScoreRepository,     # get_latest_for_creator, get_top_creators, insert_score, ...
    INotificationRepository,       # get_for_user, mark_read, get_unread_count, ...
    IAuditLogRepository,           # insert_log, get_by_user, get_by_entity, ...
)
```

Every method has a full docstring in the interface file explaining what it does, when to call it, and what SQL pattern to use. Read them — I was thorough.

To implement one, just inherit and fill in the SQLAlchemy queries. `SQLUserRepository` in `user_repo.py` is a complete worked example you can copy:

```python
from DATA.data_connections.repositories.user_repo import IUserRepository
from DATA.models.users import User

class SQLUserRepository(IUserRepository):
    def get_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()
    # ... implement the rest
```

The base class `__init__` already accepts and stores `db: Session` — so just pass it at creation:
```python
repo = SQLUserRepository(db)
user = repo.get_by_email("test@example.com")
```

---

## 6. External API Clients (`DATA/data_connections/external_apis/`)

### `BaseAPIClient`
This is an abstract class every platform API client should inherit from. It defines:
- `fetch_creator_data(connection, since)` → raw content + metrics from the platform
- `normalize_response(raw_content, raw_metrics, connection)` → maps to `ContentItem` + `ContentMetricSnapshot`
- `fetch_audience_data(connection)` → maps to `AudienceSnapshot`
- `refresh_token(connection)` → returns new tokens after OAuth refresh
- `revoke_token(connection)` → disconnects a platform

It also has shared helpers:
- `calculate_engagement_rate(likes, comments, shares, saves, reach)` — standard formula used across all platforms
- `safe_int(value)` / `safe_float(value)` — platform APIs return counts as strings sometimes, these handle that

The docstrings in `normalize_response` have the field mapping tables for YouTube, Instagram, TikTok, and Spotify — showing exactly which API response field maps to which schema field.

### `MockAPIClient`
Fully implemented mock that returns deterministic Nigerian fixture data. Returns two content items with realistic views/likes/engagement data and an audience snapshot with realistic Nigerian demographic distribution (Lagos-heavy, 72% NG, etc.).

Use it for any platform you haven't built the real client for yet:

```python
from DATA.data_connections.external_apis import MockAPIClient, BaseAPIClient

# Swap in the real client once it's built
PLATFORM_CLIENTS: dict[str, type[BaseAPIClient]] = {
    "YOUTUBE":   YouTubeClient,    # build this
    "INSTAGRAM": MockAPIClient,    # mock for now
    "TIKTOK":    MockAPIClient,
    "SPOTIFY":   MockAPIClient,
}

client = PLATFORM_CLIENTS[connection.platform_name](db_session=db)
raw_content, raw_metrics = await client.fetch_creator_data(connection)
```

---

## 7. The ERD

The full database schema is in `docs/diagrams/schema_erd.mmd`. You can render it in VS Code with the Mermaid extension, or paste it into [mermaid.live](https://mermaid.live). Every relationship, every field, every index hint is in there.

The `system_arch.mmd` diagram shows where `DATA/` sits in the overall system flow — worth a look so you have the full picture of how everything connects from the external APIs down to the frontend.

---

## Quick Import Cheatsheet

```python
# Database session
from DATA.core.database import get_db, engine

# ORM models (for SQLAlchemy queries)
from DATA.models import User, CreatorProfile, ContentItem, ContentMetricSnapshot
from DATA.models import Campaign, CampaignCollaboration, InfluenceScore

# Pydantic schemas (for request/response validation)
from DATA.schemas.entities import UserRole, Platform, MediaType, CampaignStatus
from DATA.schemas.requests.auth import LoginRequest, RegisterRequest
from DATA.schemas.responses.dashboard_data import CreatorDashboardResponse
from DATA.schemas.responses.auth import TokenResponse

# Repository interfaces
from DATA.data_connections.repositories import (
    IUserRepository, ICreatorProfileRepository,
    IContentRepository, IContentMetricRepository,
    ICampaignRepository,
)

# API clients
from DATA.data_connections.external_apis import BaseAPIClient, MockAPIClient
```
