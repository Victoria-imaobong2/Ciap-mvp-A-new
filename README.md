<h1 align="center">
  <br/>
  CIAP — Creative Influence & Analytics Platform
  <br/>
</h1>

<p align="center">
  <b>A full-stack creator analytics and influence scoring platform for the African creator economy.</b>
  <br/>
  Aggregates cross-platform data across YouTube, Instagram, TikTok, Spotify, and more — powering intelligent influence scoring, creator discovery, and campaign analytics.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-MVP%20Complete-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Data Pipeline](#data-pipeline)
- [Core Features](#core-features)
- [Influence Scoring Methodology](#influence-scoring-methodology)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Development Roadmap](#development-roadmap)
- [Team Roles](#team-roles)
- [Contribution Guidelines](#contribution-guidelines)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

CIAP (Creative Influence & Analytics Platform) is a creator-first analytics platform built for the African digital economy. It aggregates a creator's data from YouTube, Instagram, TikTok, Spotify, and other platforms into a single unified dashboard — giving creators clarity on their performance and giving SMEs (Small & Medium Enterprises) a data-driven way to discover, evaluate, and collaborate with the right creators for their campaigns.

The platform computes a proprietary **Influence Score (0–100)** using a multi-dimensional model that weighs engagement quality, audience loyalty, content consistency, cross-platform growth, conversion probability, and fraud risk. Creators, agencies, and brands all interact with the same underlying data through role-based views.

---

## Problem Statement

The African creator economy is growing rapidly, yet both creators and brands face significant friction:

- **Creators** lack consolidated analytics tools. They juggle multiple platform dashboards, have no visibility into their composite influence or how they rank against peers, and cannot easily quantify their value to potential brand partners.
- **SMEs and brands** have no reliable way to discover and compare African creators. Decisions are made on vanity metrics (follower counts) rather than genuine engagement quality or audience demographics.
- **Data fragmentation** across YouTube, Instagram, TikTok, and Spotify makes cross-platform comparison nearly impossible without expensive enterprise tooling.

CIAP solves all three problems in a single, localized, African-first platform.

---

## Solution

CIAP provides:

1. **Unified Creator Dashboard** — one view aggregating metrics from all connected platforms.
2. **Influence Score Engine** — a transparent, explainable scoring model that ranks creators by real-world impact, not just follower count.
3. **SME Discovery Portal** — a searchable index of public creator profiles, filterable by niche, location, platform, audience size, and influence score.
4. **Campaign Management** — SMEs can create campaigns, invite creators, and track live ROI.
5. **Localization** — full i18n support for English, Pidgin, Yoruba, Igbo, and Hausa.

---

## System Architecture

The platform is structured as three loosely-coupled domains with a shared data contract:

```
External Platforms (YouTube / Instagram / TikTok / Spotify / Facebook / X)
        │
        ▼
┌─────────────────────────────────────────────┐
│            DATA Layer  (DATA/)              │
│  Ingestion → Normalization → PostgreSQL DB  │
│  Repository Interfaces (Abstract Contracts) │
└─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│          Backend Layer  (backend/)          │
│  FastAPI REST API · JWT Auth · OAuth 2.0    │
│  SQLAlchemy ORM · Influence Scoring Engine  │
└─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│         Frontend Layer  (frontend/)         │
│   React Web App · Mobile Responsive         │
│   Creator Dashboard · SME Discovery         │
└─────────────────────────────────────────────┘
```

Full diagram:

![System Architecture](docs/diagrams/system_arch.png)

> See [`docs/architecture.md`](docs/architecture.md) for a detailed breakdown of each layer, service boundaries, and data flow.

---

## Project Structure

```
ciap-mvp-a/
│
├── ciap-frontend/
├── ciap-backend/
ciap-backend/
  ├── DATA/                             #MOstly same as the one in the root
  ├── FILE-STRUCTURE.md
  ├── README.md
  ├── alembic
  ├── app/
├── DATA/                              # Data engineering layer
│   ├── core/
│   │   └── database.py               # SQLAlchemy engine, session factory
│   ├── models/                        # SQLAlchemy ORM models (DB tables)
│   │   ├── users.py                  # User, CreatorProfile, SMEProfile, PlatformConnection
│   │   ├── content.py                # ContentItem, ContentMetricSnapshot, AudienceSnapshot
│   │   ├── campaigns.py              # Campaign, CampaignCollaboration
│   │   └── scoring.py                # InfluenceScore
│   ├── schemas/                       # Pydantic validation & serialization schemas
│   │   ├── entities/                 # Mirror of DB tables as Pydantic models
│   │   ├── requests/                 # Incoming API request validation
│   │   └── responses/                # Outgoing API response shapes
│   ├── data_connections/
│   │   ├── repositories/             # Abstract repository interfaces (CRUD contracts)
│   │   └── external_apis/            # BaseAPIClient + MockAPIClient for platform ingestion
│   └── migrations/                   # Alembic migration scripts
│
├── seeds/                             # Database seed scripts and fixture data
│   ├── seed.py                       # Seed runner (supports --reset flag)
│   ├── creators.json                 # 6 Nigerian creator fixtures
│   └── smes.json                     # 2 SME/brand fixtures
│
├── docs/                              # Project documentation
│   ├── architecture.md               # Detailed system architecture
│   ├── erd.md                        # Database ERD & schema explanation
│   ├── workflow.md                   # Development workflow & branching strategy
│   ├── diagrams/                     # Mermaid source (.mmd) and rendered PNGs
│   │   ├── system_arch.mmd / .png
│   │   ├── schema_erd.mmd / .png
│   │   ├── use_cases.mmd / .png
│   │   ├── user_flow_creator.mmd / .png
│   │   └── user_flow_sme.mmd / .png
│   ├── images/                       # Screenshots and visual assets
│   └── weekly-reports/               # Sprint progress reports
│
├── requirements.txt                  # Python dependencies
├── .env.example                      # Environment variable template
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer           | Technology                | Purpose                                                      |
| --------------- | ------------------------- | ------------------------------------------------------------ |
| **Backend API** | FastAPI 0.111+            | RESTful JSON API, async support, auto-generated Swagger docs |
| **ASGI Server** | Uvicorn                   | Production-ready ASGI server for FastAPI                     |
| **ORM**         | SQLAlchemy 2.0            | Database abstraction and query building                      |
| **Migrations**  | Alembic                   | Schema version control and automated migrations              |
| **Database**    | PostgreSQL 15+            | Primary relational data store                                |
| **Validation**  | Pydantic v2               | Request/response schema validation and serialization         |
| **Auth**        | python-jose + passlib     | JWT token generation; bcrypt password hashing                |
| **Encryption**  | cryptography (Fernet)     | OAuth token encryption at rest                               |
| **HTTP Client** | aiohttp                   | Async HTTP calls to external platform APIs                   |
| **Scheduling**  | APScheduler               | Periodic data ingestion jobs (every 6 hours)                 |
| **Frontend**    | React (Mobile Responsive) | Creator dashboard & SME discovery portal                     |
| **i18n**        | i18n Layer                | English, Pidgin, Yoruba, Igbo, Hausa support                 |

---

## Data Pipeline

The ingestion pipeline runs on a configurable schedule (default: every 6 hours) and follows a three-stage process:

```
1. FETCH
   PlatformConnection (OAuth token) → BaseAPIClient.fetch_creator_data()
   └── Returns raw JSON from YouTube / Instagram / TikTok / Spotify APIs

2. NORMALIZE
   BaseAPIClient.normalize_response()
   └── Maps platform-specific fields → unified ContentItem + ContentMetricSnapshot
   └── BaseAPIClient.fetch_audience_data() → AudienceSnapshot
   └── calculate_engagement_rate(likes, comments, shares, saves, reach)

3. PERSIST
   Normalized data → PostgreSQL via SQLAlchemy ORM
   └── Upsert content by external_id (no duplicates)
   └── Append-only metric snapshots (enables trend history)
   └── Trigger influence score recalculation
```

**Mock API Client** — A fully-implemented `MockAPIClient` ships with the repository for development and testing. It returns deterministic Nigerian fixture data (Lagos-heavy demographic distribution, realistic engagement rates) without requiring real OAuth tokens. Any platform without a live client implementation falls back to `MockAPIClient`.

---

## Core Features

### Creator-Facing

- **Unified Dashboard** — Aggregated views, likes, followers, and engagement rate across all connected platforms in one screen.
- **Content Performance** — Top-performing content ranked by engagement, with drill-down metrics (watch time, shares, saves, comments).
- **Audience Insights** — Demographic breakdown: age, gender, location (country/city), and platform-level audience snapshots.
- **Platform Connections** — OAuth-based connection for YouTube, Instagram, TikTok, Spotify, and more. Tokens encrypted at rest.
- **Influence Score** — Explainable composite score (0–100) with sub-score breakdown visible to the creator.
- **Language Toggle** — Switch between English, Pidgin, Yoruba, Igbo, and Hausa.
- **Profile Visibility** — Creators control whether their profile is discoverable by SMEs.

### SME-Facing

- **Creator Discovery** — Search and filter creators by niche/category, location, platform, follower range, influence score, and engagement rate.
- **Public Creator Profiles** — View a creator's public metrics, audience demographics, and influence score.
- **Creator Comparison** — Side-by-side comparison of up to 3 creators.
- **Campaign Management** — Create campaigns, attach creator briefs, track collaboration status.
- **Live ROI Tracking** — Monitor campaign performance in real time via conversion events.

### System / Automated

- **Token Refresh** — Scheduled OAuth token refresh before expiry.
- **Data Ingestion** — Scheduled background jobs fetch and normalize platform data every 6 hours.
- **Influence Score Recalculation** — Weekly automated scoring for all active creators.
- **Audit Logging** — All write operations logged with user ID, IP, entity type, and metadata.
- **Notifications** — In-app notification system for campaign updates, score changes, and connection alerts.

---

## Influence Scoring Methodology

The Influence Score is a composite metric (0–100) computed from six weighted dimensions. The model version is stored with every score record for reproducibility and trend tracking.

| Dimension                  | Description                                                             | Weight   |
| -------------------------- | ----------------------------------------------------------------------- | -------- |
| **Audience Loyalty**       | Repeat engagement rate from the same audience over a 30-day window      | High     |
| **Engagement Quality**     | Weighted engagement: comments > shares > likes > views                  | High     |
| **Content Consistency**    | Posting frequency and schedule regularity                               | Medium   |
| **Cross-Platform Growth**  | Follower growth rate aggregated across all connected platforms          | Medium   |
| **Conversion Probability** | Likelihood of driving real actions (clicks, purchases) — Phase 2        | Low      |
| **Fraud Risk**             | Estimated probability of inflated or purchased metrics (lower = better) | Modifier |

**Score Versioning:** Every score computation appends a new row to `influence_scores` — old scores are never overwritten. This enables trend tracking ("Your score grew 12% this month") and model comparison across versions.

**Explainability:** The `breakdown` field (stored as JSONB) is surfaced to creators on their dashboard so they understand exactly which dimensions are driving or limiting their score.

---

## Getting Started

### Prerequisites

- Python 3.11 or higher — verify with `python --version`
- PostgreSQL 15+ — must be installed and running locally
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/30Cycleltd/ciap-mvp-a
cd ciap-mvp-a
```

### 2. Create a Virtual Environment

```bash
python -m venv venv

# Activate — macOS/Linux
source venv/bin/activate

# Activate — Windows
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values. At minimum, `DATABASE_URL` is required to run locally. See [Environment Variables](#environment-variables) for the full reference.

### 5. Create the Local PostgreSQL Database

Open pgAdmin or run:

```sql
CREATE DATABASE ciap_db;
```

### 6. Run Database Migrations

```bash
cd DATA/
python -m alembic upgrade head
cd ..
```

This creates all 14 tables in `ciap_db`. Verify with `\dt` in psql or via pgAdmin.

### 7. Verify the Database Connection

```bash
python -c "from DATA.core.database import engine; print('DB connection OK:', engine.url)"
```

### 8. Seed the Database with Test Data

```bash
# Seed with 6 Nigerian creators + 2 SME users
python seeds/seed.py

# Wipe and re-seed (drops all existing data first)
python seeds/seed.py --reset
```

### 9. Start the Backend Server

```bash
uvicorn backend.main:app --reload --port 8000
```

Open `http://ciap-mvp-backend.onrender.com/docs/docs` to access the interactive Swagger UI.

### 10. Start the Frontend

```bash
cd frontend/
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

---

## Environment Variables

Copy `.env.example` to `.env` and populate the values. **Never commit your `.env` file.**

| Variable                      | Required | Description                                                                           |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL`                | ✅       | PostgreSQL connection string. Format: `postgresql://USER:PASSWORD@HOST:PORT/DB_NAME`  |
| `SUPABASE_URL`                | Optional | Supabase project URL (cloud DB alternative to local PostgreSQL)                       |
| `SUPABASE_KEY`                | Optional | Supabase service role key                                                             |
| `JWT_SECRET`                  | ✅       | Secret key used to sign and verify JWT tokens. Use a long random string.              |
| `JWT_ALGORITHM`               | Optional | JWT signing algorithm. Default: `HS256`                                               |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional | JWT access token TTL in minutes. Default: `60`                                        |
| `ENCRYPTION_KEY`              | ✅       | Fernet key for encrypting OAuth tokens at rest. Generate with `Fernet.generate_key()` |
| `PORT`                        | Optional | Port for the FastAPI server. Default: `8000`                                          |
| `YOUTUBE_CLIENT_ID`           | Optional | Google OAuth client ID for YouTube API                                                |
| `YOUTUBE_CLIENT_SECRET`       | Optional | Google OAuth client secret                                                            |
| `INSTAGRAM_CLIENT_ID`         | Optional | Meta developer app client ID                                                          |
| `INSTAGRAM_CLIENT_SECRET`     | Optional | Meta developer app client secret                                                      |

---

## Database Setup

CIAP uses **PostgreSQL 15+** as its primary data store, managed through SQLAlchemy ORM and Alembic migrations. The schema covers 14 tables across four domains:

| Domain       | Tables                                                                                 |
| ------------ | -------------------------------------------------------------------------------------- |
| **User**     | `users`, `creator_profiles`, `sme_profiles`, `platform_connections`                    |
| **Content**  | `content_items`, `content_metric_snapshots`, `audience_snapshots`                      |
| **Campaign** | `campaigns`, `campaign_collaborations`, `campaign_creator_briefs`, `conversion_events` |
| **System**   | `influence_scores`, `notifications`, `audit_logs`                                      |

Full ERD:

![Database ERD](docs/diagrams/schema_erd.png)

> See [`docs/erd.md`](docs/erd.md) for a detailed table-by-table schema reference.

**Alembic Workflow:**

```bash
# Generate a migration after changing a model
cd DATA/
python -m alembic revision --autogenerate -m "Describe the change"

# Apply pending migrations
python -m alembic upgrade head

# Roll back one migration
python -m alembic downgrade -1
```

---

## API Documentation

The full API reference is available in [`API-REFERENCE.md`](API-REFERENCE.md).

When the server is running, interactive docs are available at:

- **Swagger UI:** `http://ciap-mvp-backend.onrender.com/docs/docs`
- **ReDoc:** `http://ciap-mvp-backend.onrender.com/docs/redoc`

### Key Endpoint Groups

| Group         | Base Path               | Description                                       |
| ------------- | ----------------------- | ------------------------------------------------- |
| Auth          | `/api/v1/auth`          | Register, login, logout, token refresh            |
| Creator       | `/api/v1/creators`      | Dashboard, profile, platform connections, content |
| Analytics     | `/api/v1/analytics`     | Metrics history, audience insights, exports       |
| Scoring       | `/api/v1/scores`        | Influence score, leaderboard, breakdown           |
| SME           | `/api/v1/sme`           | Creator discovery, comparison, profile views      |
| Campaigns     | `/api/v1/campaigns`     | Create, manage, track campaign ROI                |
| Notifications | `/api/v1/notifications` | In-app notification management                    |

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {}
}
```

Authentication uses `Bearer` tokens in the `Authorization` header.

---

## Development Roadmap

The CIAP MVP was delivered across a 6-week development cycle:

| Week       | Milestone                                                                                                                                       | Status      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **Week 1** | System Architecture & Database Schema — defined 14-table PostgreSQL schema, Mermaid ERD, system architecture diagram, team data contracts       | ✅ Complete |
| **Week 2** | Backend Development & API Integration — FastAPI project scaffolding, JWT auth, SQLAlchemy ORM models, Alembic migrations, repository interfaces | ✅ Complete |
| **Week 3** | Creator Dashboard & Data Visualization — React frontend, unified dashboard UI, platform connection OAuth flow, content performance charts       | ✅ Complete |
| **Week 4** | Influence Scoring & Ranking System — 6-dimension composite scoring model, score versioning, leaderboard API, score breakdown explainability     | ✅ Complete |
| **Week 5** | Analytics Refinement & Feature Expansion — audience demographics, creator comparison tool, campaign management, SME discovery portal            | ✅ Complete |
| **Week 6** | Testing, Optimization & MVP Finalization — seed data, MockAPIClient, integration testing, documentation polish, repository presentation cleanup | ✅ Complete |

---

## Team Roles

| Name                               | Role                    | Domain                                                                                                               |
| ---------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Ugwumba Akachukwu Mac-Anointed** | Project Manager         | Sprint planning, team coordination, milestone tracking, stakeholder communication, and MVP delivery oversight        |
| **Okafor Kosisochukwu**            | Data Engineer & Backend | `DATA/` `ciap-backend/`                                                                                              |
| **Samuel**                         | Backend Developer       | `ciap-backend/`                                                                                                      |
| **Imaobong Victoria**              | Frontend Developer      | `ciap-frontend/`                                                                                                     |
| **Okereke Clement Kalu**           | Frontend Developer      | `ciap-frontend/`                                                                                                     |
| **Ifeanyichukwu Chukwudubem**      | UI/UX Designer          | User interface design, wireframing, prototyping, design system, and user experience across creator and SME workflows |

---

## Contribution Guidelines

See [`docs/workflow.md`](docs/workflow.md) for the full branching strategy, PR workflow, and commit conventions.

### Quick Reference

**Branch naming:**

```
feature/short-description       # New feature
fix/short-description           # Bug fix
docs/short-description          # Documentation only
refactor/short-description      # Code refactor without behavior change
```

**Pull Request workflow:**

1. Branch off `main` → work on your feature branch
2. Open a PR with a clear title and description referencing the relevant week/milestone
3. At least one team member must review and approve before merge
4. Squash and merge into `main`
5. Delete the feature branch after merge

---

## Future Improvements

- **Real platform API clients** — Replace `MockAPIClient` with live YouTube, Instagram, TikTok, and Spotify API clients using OAuth 2.0 token exchange. -Youtube is live and working tho.
- **ML scoring pipeline** — Migrate the influence scoring engine from the rule-based v1 model to a trained ML model with continuous retraining.
- **Paystack/Flutterwave integration** — Enable subscription billing for Creator Pro and SME Starter plans.
- **PDF report export** — Allow creators to export their analytics dashboard as a branded PDF.
- **Push notifications** — Add mobile push notifications via Firebase for campaign updates and score changes.
- **TypeScript type generation** — Use `openapi-typescript` to auto-generate TypeScript types from the FastAPI OpenAPI schema.
- **Creator earnings dashboard** — Track campaign payments, invoices, and income history.
- **Admin portal** — Internal dashboard for user management, score auditing, and platform health monitoring.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">Built by Team A · 30Cycle Ltd · 2026</p>
