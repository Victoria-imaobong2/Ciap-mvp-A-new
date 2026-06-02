# Data Engineering Directory Structure & Contract

**Author:** Okafor Johnpaul (Data Engineer, Team A)  
**Date:** Wed, 8 April 2026  
**Purpose:** This document explains the `DATA/` folder organization and how it enables parallel development for the CIAP MVP.

---

## 1. Overview

The `DATA/` directory is the **single source of truth** for all data shapes in our application. It contains:

- **Pydantic Schemas** – Define exactly what data looks like in the database and over the wire.
- **Repository Interfaces (ABCs)** – Define what database operations are available (without implementation).
- **External API Client Interfaces** – Define how we fetch data from YouTube, Instagram, etc.

**Rule of Thumb:** If you need to change a database column or an API response field, you **MUST** update the corresponding file in `DATA/models/` first. Everything else flows from there.

---

## 2. Directory Tree

```
DATA/
├── __init__.py                     # Package marker
├── models/                         # Pydantic schemas
│   ├── entities/                   # Mirror PostgreSQL tables
│   │   ├── user.py                 # User, CreatorProfile, SMEProfile
│   │   ├── content.py              # ContentItem, ContentMetricSnapshot
│   │   ├── campaign.py             # Campaign, CampaignCollaboration
│   │   └── audit.py                # AuditLog
│   ├── requests/                   # Incoming API validation
│   │   ├── dashboard_filters.py    # Date range & pagination
│   │   └── search_filters.py       # Creator discovery filters
│   └── responses/                  # Outgoing JSON shapes
│       ├── dashboard_data.py       # Creator dashboard payload
│       ├── creator_profile.py      # Public profile for SMEs
│       └── comparison.py           # Side-by-side comparison data
└── data_connections/               # Abstract interfaces
    ├── repositories/               # Database access contracts
    │   ├── base.py                 # Generic IRepository[T]
    │   ├── user_repo.py            # IUserRepository
    │   ├── content_repo.py         # IContentRepository
    │   └── campaign_repo.py        # ICampaignRepository
    └── external_apis/              # Platform API contracts
        ├── base_client.py          # BaseAPIClient ABC
        └── youtube_client.py       # IYouTubeClient (Ish lol)
```

---

## 3. For Backend Developers (Samuel & Victoria)

### 3.1 You DO NOT Write Raw SQL

Instead, you **implement the Repository Interfaces** provided in `DATA/data_connections/repositories/` using SQLAlchemy ORM.

**Example: Implementing `IContentRepository`**

```python
# backend/repositories/sqlalchemy_content_repo.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from DATA.data_connections.repositories.content_repo import IContentRepository
from DATA.models.entities.content import ContentItem, ContentMetricSnapshot

class SQLAlchemyContentRepository(IContentRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_creator(self, creator_id: UUID, limit: int = 20, offset: int = 0) -> List[ContentItem]:
        stmt = select(ContentItem).where(
            ContentItem.creator_id == creator_id
        ).order_by(ContentItem.posted_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_metrics_history(self, content_id: UUID, days: int = 30) -> List[ContentMetricSnapshot]:
        # ... implementation using SQLAlchemy func ...
        pass
```

### 3.2 Import Pydantic Models Directly

Use the schemas defined in `DATA/models/entities/` as your SQLAlchemy model base (with `from_attributes=True`).

```python
from DATA.models.entities.user import User
from DATA.models.responses.dashboard_data import CreatorDashboardResponse

@router.get("/dashboard")
async def get_dashboard(user: User = Depends(get_current_user)) -> CreatorDashboardResponse:
    # ... business logic ...
    return CreatorDashboardResponse(**data)
```

### 3.3 Database Migrations (Alembic)

When you need to add a new column or table:

1. Update the corresponding Pydantic model in `DATA/models/entities/`.
2. Run `alembic revision --autogenerate -m "Add new field"`.
3. Apply migration.

I will provide the initial Alembic configuration (`alembic.ini`, `env.py`).

---

## 4. For Frontend Developers (Marcel & Clement)

### 4.1 Mock Data Shapes

The `DATA/models/responses/` folder defines the **exact JSON structure** of every API endpoint. You can start building UI **immediately** by creating mock JSON files that match these shapes.

**Example: `CreatorDashboardResponse`**

```python
# DATA/models/responses/dashboard_data.py
class MetricSummary(BaseModel):
    total_views: int
    total_likes: int
    engagement_rate: float
    follower_count: int

class CreatorDashboardResponse(BaseModel):
    period: str  # "Last 30 Days"
    metrics: MetricSummary
    top_content: List[TopContentItem]
    growth_trend: List[GrowthDataPoint]
```

Your mock JSON should look like:

```json
{
    "period": "Last 30 Days",
    "metrics": {
        "total_views": 2450000,
        "total_likes": 187000,
        "engagement_rate": 4.8,
        "follower_count": 52000
    },
    "top_content": [ ... ],
    "growth_trend": [ ... ]
}
```

### 4.2 TypeScript Integration (Optional)

Once the Backend generates an OpenAPI schema from these Pydantic models, you can use `openapi-typescript` to generate TypeScript types automatically, eliminating guesswork.

---

## 5. Benefits of This Approach

| Benefit                   | Description                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Parallel Development**  | Frontend mocks from `responses/`. Backend implements `repositories/`. Data Engineer(I) builds ingestion clients. No one is blocked. |
| **Zero Raw SQL**          | Backend uses SQLAlchemy ORM with pre-defined entity models. Faster development, fewer errors.                                       |
| **Clear Contracts**       | If a response shape changes, it breaks at the Pydantic model level (compile-time), not at runtime.                                  |
| **Testability**           | Repository interfaces can be mocked easily for unit testing services.                                                               |
| **Documentation as Code** | The Pydantic models serve as living documentation of the API.                                                                       |
