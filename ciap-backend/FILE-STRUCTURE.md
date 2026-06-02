# CIAP Backend File Structure

This document defines the backend layout for the CIAP MVP FastAPI service.

The main design rule is simple: `DATA/` is the source of truth for request, response, and entity schemas. The `app/` package contains runtime code that consumes those contracts and implements the API, service, persistence, ingestion, ML, and background-job layers around them.

## 1. Architecture Rules

- `DATA/schemas/entities/` defines the canonical entity shapes for users, creators, SMEs, content, campaigns, scores, and audit records.
- `DATA/schemas/requests/` defines every incoming request body and filter model used by the API.
- `DATA/schemas/responses/` defines every outgoing JSON payload returned by the API.
- `DATA/models/` contains core Pydantic models for the system.
- `DATA/data_connections/repositories/` defines repository interfaces only. Backend implementations must satisfy these interfaces using SQLAlchemy ORM.
- `DATA/data_connections/external_apis/` defines external platform client contracts for YouTube, Instagram, TikTok, Facebook, Twitter/X, Spotify, and Apple Music.
- `app/` contains FastAPI routes, business services, Redis and security helpers, database session wiring, ORM persistence code, ingestion adapters, ML orchestration, Celery tasks, and shared utilities.
- Do not use raw SQL in endpoints or services. Persist and query through repository abstractions and ORM sessions.
- All API shapes should come from `DATA/schemas/`.
- Use the standardized response envelope for success and error responses.

## 2. Target Backend Tree

```text
ciap-backend/
├── DATA
│   ├── __init__.py
│   ├── alembic.ini
│   ├── core
│   │   ├── __init__.py
│   │   └── database.py
│   ├── data_connections
│   │   ├── __init__.py
│   │   ├── external_apis
│   │   │   ├── __init__.py
│   │   │   └── base_client.py
│   │   └── repositories
│   │       ├── __init__.py
│   │       ├── base.py
│   │       ├── campaign_repo.py
│   │       ├── content_repo.py
│   │       └── user_repo.py
│   ├── migrations
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── campaigns.py
│   │   ├── content.py
│   │   ├── scoring.py
│   │   └── users.py
│   └── schemas
│       ├── __init__.py
│       ├── entities
│       │   ├── __init__.py
│       │   ├── audit.py
│       │   ├── campaign.py
│       │   ├── content.py
│       │   ├── scoring.py
│       │   └── user.py
│       ├── requests
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── campaign.py
│       │   ├── dashboard_filters.py
│       │   └── search_filters.py
│       └── responses
│           ├── __init__.py
│           ├── auth.py
│           ├── campaign.py
│           ├── comparison.py
│           ├── creator_profile.py
│           ├── dashboard_data.py
│           ├── notifications.py
│           └── scoring.py
├── FILE-STRUCTURE.md
├── README.md
├── alembic
│   ├── env.py
│   ├── script.py.mako
│   └── versions
│       ├── 20260412_initial_schema.py
│       ├── 20260530_create_saved_creators.py
│       └── e200f87befef_add_is_onboarded_to_user.py
├── alembic.ini
├── app
│   ├── __init__.py
│   ├── api
│   │   ├── __init__.py
│   │   └── v1
│   │       ├── __init__.py
│   │       ├── endpoints
│   │       │   ├── __init__.py
│   │       │   ├── admin.py
│   │       │   ├── analytics.py
│   │       │   ├── auth.py
│   │       │   ├── campaigns.py
│   │       │   ├── creator.py
│   │       │   ├── discover.py
│   │       │   ├── forecast.py
│   │       │   ├── oauth.py
│   │       │   ├── platforms.py
│   │       │   ├── reports.py
│   │       │   ├── score.py
│   │       │   └── sme.py
│   │       ├── router.py
│   │       └── schemas.py
│   ├── config.py
│   ├── core
│   │   ├── __init__.py
│   │   ├── cache.py
│   │   ├── exceptions.py
│   │   ├── rate_limiter.py
│   │   ├── redis_client.py
│   │   └── security.py
│   ├── db
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   ├── audience_snapshot.py
│   │   │   ├── audit_log.py
│   │   │   ├── campaign.py
│   │   │   ├── campaign_collaboration.py
│   │   │   ├── campaign_metric.py
│   │   │   ├── content_item.py
│   │   │   ├── creator_profile.py
│   │   │   ├── influence_score.py
│   │   │   ├── platform_metric.py
│   │   │   ├── platform_token.py
│   │   │   ├── saved_creator.py
│   │   │   ├── sentiment_result.py
│   │   │   ├── sme_profile.py
│   │   │   └── user.py
│   │   ├── repositories
│   │   │   ├── __init__.py
│   │   │   ├── audience_snapshot_repo.py
│   │   │   ├── base.py
│   │   │   ├── campaign_metric_repo.py
│   │   │   ├── campaign_repo.py
│   │   │   ├── content_repo.py
│   │   │   ├── creator_profile_repo.py
│   │   │   ├── influence_score_repo.py
│   │   │   ├── platform_metric_repo.py
│   │   │   ├── platform_repo.py
│   │   │   ├── platform_token_repo.py
│   │   │   ├── saved_creator_repo.py
│   │   │   ├── score_repo.py
│   │   │   ├── sme_profile_repo.py
│   │   │   └── user_repo.py
│   │   └── session.py
│   ├── dependencies.py
│   ├── ingestion
│   │   ├── __init__.py
│   │   ├── base_connector.py
│   │   ├── connectors
│   │   │   ├── __init__.py
│   │   │   ├── apple_music.py
│   │   │   ├── facebook.py
│   │   │   ├── instagram.py
│   │   │   ├── spotify.py
│   │   │   ├── tiktok.py
│   │   │   ├── twitter.py
│   │   │   └── youtube.py
│   │   └── normalizer.py
│   ├── main.py
│   ├── ml
│   │   ├── __init__.py
│   │   ├── artifacts
│   │   ├── audience_segmenter.py
│   │   ├── campaign_forecaster.py
│   │   ├── feature_engineering.py
│   │   ├── influence_scorer.py
│   │   ├── model_registry.py
│   │   └── sentiment_analyzer.py
│   ├── services
│   │   ├── __init__.py
│   │   ├── admin_service.py
│   │   ├── analytics_service.py
│   │   ├── auth_service.py
│   │   ├── campaign_service.py
│   │   ├── creator_service.py
│   │   ├── discover_service.py
│   │   ├── forecast_service.py
│   │   ├── oauth_service.py
│   │   ├── platform_service.py
│   │   ├── report_service.py
│   │   ├── score_service.py
│   │   ├── sme_service.py
│   │   └── sync_service.py
│   ├── tasks
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── report_tasks.py
│   │   ├── scoring_tasks.py
│   │   ├── sentiment_tasks.py
│   │   └── sync_tasks.py
│   └── utils
│       ├── __init__.py
│       ├── date_utils.py
│       ├── encryption.py
│       ├── pagination.py
│       ├── response.py
│       └── serialization.py
├── pyproject.toml
├── seeds
│   ├── creators.json
│   ├── seed.py
│   └── smes.json
├── test_score.py
├── tests
│   ├── conftest.py
│   └── unit
│       ├── test_api_smoke.py
│       └── test_health.py
└── uv.lock
```

## 3. How the Layers Fit Together

| Layer | Responsibility |
|---|---|
| `DATA/schemas/entities/` | Canonical entity and domain shapes used by the backend and shared with the data engineer workflow. |
| `DATA/schemas/requests/` | Request validation models for auth, discovery, campaigns, forecasting, scoring, and platform actions. |
| `DATA/schemas/responses/` | API response shapes that map directly to the payloads documented in the API reference. |
| `DATA/data_connections/repositories/` | Interface layer for persistence operations. |
| `app/db/models/` | SQLAlchemy ORM implementations mapped to the entity shapes. |
| `app/db/repositories/` | SQLAlchemy implementations of the repository interfaces. |
| `app/api/v1/endpoints/` | HTTP route handlers that validate input, call services, and return response models. |
| `app/services/` | Business logic and orchestration across repositories, ingestion, caching, scoring, and forecasting. |
| `app/ingestion/` | Normalization and platform synchronization adapters for all supported social and music APIs. |
| `app/ml/` | Influence score, sentiment, audience segmentation, and forecasting logic. |
| `app/tasks/` | Celery jobs for sync, scoring, sentiment, and reporting. |

## 4. API-to-Module Mapping

- `auth.py` covers `POST /auth/register`, `POST /auth/login`, and `POST /auth/refresh`.
- `oauth.py` covers `GET /oauth/{platform}/connect` and `GET /oauth/{platform}/callback`.
- `creator.py` covers creator dashboard, content, audience, platform, and public profile endpoints.
- `platforms.py` handles platform listing, sync triggers, and related status actions.
- `analytics.py` covers summaries, trends, and content detail.
- `score.py` covers current influence score, score history, and score recomputation.
- `sme.py` covers SME dashboard experiences.
- `discover.py` covers creator search, detail, and comparison.
- `campaigns.py` covers campaign CRUD and collaboration data.
- `forecast.py` covers campaign forecasting.
- `reports.py` covers campaign report export.
- `admin.py` covers restricted internal and support endpoints.

## 5. Implementation Notes

- Keep the request and response schemas in `DATA/` synchronized with the API reference first, then implement the service and route layers around those models.
- If a response shape changes, update the corresponding file in `DATA/schemas/responses/` before changing the endpoint implementation.
- If a new table or field is needed, update the relevant entity schema in `DATA/schemas/entities/`, then add the ORM mapping in `app/db/models/` and migration in `alembic/versions/`.
- For list endpoints, return an `items` array plus a `meta` block with pagination details.
- For async work such as platform sync, score recomputation, sentiment processing, and report generation, return a queued response with a job identifier rather than blocking the request.
- Use Redis for rate limiting and cache-backed analytics where freshness allows.

## 6. What This Structure Optimizes For

- Parallel work between backend, frontend, and data engineering.
- Stable API contracts driven by Pydantic models rather than ad hoc endpoint payloads.
- Repository-based persistence that keeps SQLAlchemy implementation details out of route handlers.
- Clear separation between ingestion, scoring, forecasting, and API delivery.
