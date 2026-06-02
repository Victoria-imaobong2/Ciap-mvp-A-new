# CIAP — System Architecture

**Last Updated:** April 2026  
**Version:** MVP 1.0

---

## Overview

CIAP is built as three loosely-coupled domains sharing a strict data contract. Each domain has a clearly defined owner, a well-understood responsibility, and an explicit interface to the other domains. No domain accesses another's internals — communication happens through the shared `DATA/` package and REST API only.

```
┌─────────────────────────────────────────────────────────────────┐
│                    External Data Sources                        │
│   YouTube API · Instagram Graph API · TikTok API · Spotify API  │
│   Twitter/X API · Facebook API · Audiomack API                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ OAuth 2.0 + API Calls
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA Layer  (DATA/)                       │
│                                                                 │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐ │
│  │  Ingestion   │→ │  Normalizer    │→ │  PostgreSQL DB      │ │
│  │  Service     │  │  Unified Schema│  │  14 Tables          │ │
│  │  (Async BG)  │  │                │  │  SQLAlchemy ORM     │ │
│  └──────────────┘  └────────────────┘  └─────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Repository Interfaces (Abstract Contracts)                │ │
│  │  IUserRepository · IContentRepository · ICampaignRepo ...  │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │ SQLAlchemy ORM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Layer  (backend/)                    │
│                                                                 │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │  FastAPI     │  │  Auth Service   │  │  Scoring Engine  │  │
│  │  REST API    │  │  JWT + OAuth2   │  │  6-Dimension     │  │
│  │  /api/v1     │  │                 │  │  Influence Score │  │
│  └──────────────┘  └─────────────────┘  └──────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Repository Implementations (SQLAlchemy ORM)               │ │
│  │  SQLUserRepository · SQLContentRepository · ...            │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / REST JSON
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend Layer  (frontend/)                   │
│                                                                 │
│  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │  Creator Dashboard       │  │  SME Discovery Portal      │  │
│  │  Analytics · Score View  │  │  Campaign Management       │  │
│  └──────────────────────────┘  └────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  i18n Layer: English · Pidgin · Yoruba · Igbo · Hausa      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                         ┌──────┴──────┐
                         │    Users    │
                     ┌───┴───┐    ┌───┴───┐
                     │Creator│    │  SME  │
                     └───────┘    └───────┘
```

---

## Domain Responsibilities

### DATA Layer (`DATA/`)

**Owner:** Data Engineering team  
**Single responsibility:** Be the only source of truth for all data shapes in the system.

| Component | Description |
|---|---|
| `DATA/models/` | SQLAlchemy ORM models. These map directly to PostgreSQL tables. When a DB schema change is needed, it starts here. |
| `DATA/schemas/entities/` | Pydantic v2 models mirroring the ORM models. Used for serialization and response validation. |
| `DATA/schemas/requests/` | Pydantic models for incoming API request bodies. FastAPI validates these automatically. |
| `DATA/schemas/responses/` | Pydantic models defining the exact JSON shape of every API response. Doubles as frontend mock contracts. |
| `DATA/data_connections/repositories/` | Abstract repository interfaces (Python ABCs). Define CRUD method signatures without implementation. The backend implements these against SQLAlchemy. |
| `DATA/data_connections/external_apis/` | `BaseAPIClient` abstract class that every platform API client must inherit. `MockAPIClient` is a complete working implementation for development. |
| `DATA/migrations/` | Alembic migration scripts. Auto-generated from ORM model changes. |
| `DATA/core/database.py` | SQLAlchemy engine and session factory. Imported by both the backend and migration scripts. |

**Rule of thumb:** If you need to change a database column or an API response field, you must update `DATA/models/` first. Everything else flows from there.

### Backend Layer (`backend/`)

**Owner:** Backend development team  
**Single responsibility:** Expose the data layer as a secure, authenticated REST API.

| Component | Description |
|---|---|
| FastAPI application | RESTful API at `/api/v1`. Auto-generates Swagger and ReDoc documentation. |
| Auth service | JWT access + refresh token management. OAuth 2.0 flow for connecting creator platform accounts. |
| Repository implementations | Concrete SQLAlchemy implementations of the `DATA/` repository interfaces. |
| Influence scoring engine | Computes the 6-dimension composite influence score. Appends versioned score records to `influence_scores`. |
| Background scheduler | APScheduler jobs for periodic token refresh and platform data ingestion. |

### Frontend Layer (`frontend/`)

**Owner:** Frontend development team  
**Single responsibility:** Present analytics data to creators and enable SME workflows.

| Component | Description |
|---|---|
| Creator Dashboard | Unified platform metrics, top content, audience breakdown, influence score with explainability. |
| SME Discovery Portal | Searchable, filterable creator index. Side-by-side creator comparison. |
| Campaign Management | Create campaigns, attach creator briefs, track live ROI. |
| i18n Layer | Language toggle supporting English, Pidgin, Yoruba, Igbo, and Hausa. |

---

## Data Flow: Creator Onboarding

```
1. Creator signs up → POST /api/v1/auth/register
2. JWT access + refresh tokens issued
3. Creator connects YouTube → GET /api/v1/auth/oauth/youtube
4. Google OAuth consent screen
5. Token returned → stored encrypted (Fernet) in platform_connections
6. Background job triggered → BaseAPIClient.fetch_creator_data()
7. Raw API response → BaseAPIClient.normalize_response()
8. ContentItem + ContentMetricSnapshot upserted to DB
9. AudienceSnapshot inserted
10. InfluenceScore calculated and appended
11. Creator dashboard populated via GET /api/v1/creators/dashboard
```

---

## Security Architecture

- **Passwords:** bcrypt hashed via passlib. Plaintext never stored or logged.
- **OAuth tokens:** Fernet-encrypted at rest. Decrypted only in memory during API calls.
- **JWT:** Short-lived access tokens (60 min) + long-lived refresh tokens (7 days). `JWT_SECRET` must be a strong random secret in production.
- **RBAC:** Role-based access control enforced at the API layer. `CREATOR` and `SME` roles have distinct endpoint access.
- **Audit logging:** All write operations append to `audit_logs` with user ID, IP address, entity type, and action metadata.

---

## Diagram

![System Architecture Diagram](diagrams/system_arch.png)

See also:
- [Use Cases](diagrams/use_cases.png) — Who can do what
- [Creator User Flow](diagrams/user_flow_creator.png) — Creator onboarding journey
- [SME User Flow](diagrams/user_flow_sme.png) — SME discovery journey
