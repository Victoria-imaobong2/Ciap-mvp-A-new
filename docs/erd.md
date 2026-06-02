# CIAP — Database ERD & Schema Reference

**Last Updated:** April 2026  
**Database:** PostgreSQL 15+  
**ORM:** SQLAlchemy 2.0  
**Migrations:** Alembic

---

## ERD Diagram

![Database ERD](diagrams/schema_erd.png)

The full Mermaid source is in [`docs/diagrams/schema_erd.mmd`](diagrams/schema_erd.mmd). Render it at [mermaid.live](https://mermaid.live) or with the VS Code Mermaid extension.

---

## Schema Overview

The database is organized into four logical domains with 14 tables total.

```
USER DOMAIN
├── users                      — Core user accounts (creator, SME, agency, admin)
├── creator_profiles           — Creator-specific metadata (category, bio, score)
├── sme_profiles               — SME/brand metadata (company, industry, budget)
└── platform_connections       — OAuth tokens for each connected platform

CONTENT DOMAIN
├── content_items              — Individual pieces of content (videos, posts, tracks)
├── content_metric_snapshots   — Time-series metrics per content item (views, likes, etc.)
└── audience_snapshots         — Time-series audience demographics per platform connection

CAMPAIGN DOMAIN
├── campaigns                  — SME campaign records
├── campaign_collaborations    — Creator ↔ campaign link (status tracking, tracking codes)
├── campaign_creator_briefs    — Brief/deliverables attached to a collaboration
└── conversion_events          — Tracked conversion actions from campaign links

SYSTEM DOMAIN
├── influence_scores           — Versioned composite influence score records
├── notifications              — In-app notifications for all user types
└── audit_logs                 — Append-only log of all write operations
```

---

## Table Reference

### `users`

Core user account. Shared by all roles (creator, SME, agency, admin).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `email` | String UNIQUE | Login email |
| `hashed_password` | String NULL | NULL for OAuth-only signups |
| `role` | Enum | `CREATOR \| SME \| AGENCY \| ADMIN` |
| `full_name` | String | |
| `avatar_url` | String NULL | CDN URL |
| `language_preference` | Enum | `en \| ha \| yo \| ig \| pcm` |
| `status` | Enum | `ACTIVE \| SUSPENDED \| PENDING_VERIFICATION \| DEACTIVATED` |
| `subscription_plan` | Enum | `FREE \| CREATOR_PRO \| SME_STARTER \| ...` |
| `is_email_verified` | Boolean | |
| `last_login_at` | Timestamp NULL | |
| `created_at` / `updated_at` | Timestamp | Auto-managed |

---

### `creator_profiles`

One-to-one with `users` for creators. Stores public-facing and analytics metadata.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK UNIQUE | → `users.id` |
| `category` | Enum | `Music \| Comedy \| Tech \| Fashion \| ...` |
| `secondary_categories` | JSONB NULL | Up to 2 additional niches |
| `bio` | Text NULL | Max 500 chars |
| `location_country` | String(2) | ISO 3166-1 alpha-2 |
| `location_city` | String | |
| `social_handles` | JSONB | Display handles per platform |
| `influence_score` | Float NULL | Denormalized ML score 0–100, updated weekly |
| `total_followers` | Integer NULL | Aggregated across platforms (denormalized) |
| `avg_engagement_rate` | Float NULL | Aggregated % across platforms (denormalized) |
| `is_public` | Boolean | Whether SMEs can discover this creator |
| `is_verified` | Boolean | Admin-granted verification badge |

---

### `sme_profiles`

One-to-one with `users` for SME/brand accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK UNIQUE | → `users.id` |
| `company_name` | String | |
| `industry` | String | e.g. FMCG, Fintech, Fashion |
| `website_url` | String NULL | |
| `logo_url` | String NULL | CDN URL |
| `description` | Text NULL | Max 500 chars |
| `payment_gateway_customer_id` | String NULL | Paystack / Flutterwave customer ID |
| `monthly_budget_ngn` | Float NULL | Self-declared campaign budget |

---

### `platform_connections`

OAuth connection record for each external platform a creator has connected.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | → `users.id` |
| `platform_name` | Enum | `YOUTUBE \| INSTAGRAM \| TIKTOK \| TWITTER \| FACEBOOK \| SPOTIFY \| AUDIOMACK \| SNAPCHAT` |
| `access_token` | Text | **Fernet-encrypted at rest** |
| `refresh_token` | Text NULL | **Fernet-encrypted at rest** |
| `token_expires_at` | Timestamp NULL | NULL = non-expiring |
| `platform_user_id` | String | Creator's ID on the external platform |
| `platform_username` | String NULL | Display handle |
| `scopes_granted` | JSONB | OAuth scopes the user approved |
| `is_active` | Boolean | False when token revoked or expired |
| `last_synced_at` | Timestamp NULL | Last successful ingestion run |
| `sync_error_message` | String NULL | Last error message from ingestion |

---

### `content_items`

Individual pieces of content fetched from platform APIs and normalized to a unified schema.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `creator_id` | UUID FK | → `creator_profiles.id` |
| `platform_connection_id` | UUID FK | → `platform_connections.id` |
| `external_id` | String | Platform-assigned content ID (used for upsert) |
| `platform_name` | Enum | Source platform |
| `media_type` | Enum | `VIDEO \| SHORT \| REEL \| POST \| STORY \| TRACK \| PODCAST` |
| `title` | String NULL | |
| `description` | Text NULL | |
| `thumbnail_url` | String NULL | |
| `content_url` | String NULL | URL on the platform |
| `posted_at` | Timestamp | When the content was published |
| `is_deleted` | Boolean | Soft delete flag |

---

### `content_metric_snapshots`

Append-only time-series metrics for each content item. A new row is inserted each ingestion run.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `content_id` | UUID FK | → `content_items.id` |
| `views` | BigInt | |
| `likes` | Integer | |
| `comments` | Integer | |
| `shares` | Integer NULL | |
| `saves` | Integer NULL | |
| `watch_time_minutes` | Float NULL | YouTube-specific |
| `reach` | Integer NULL | |
| `engagement_rate` | Float NULL | Computed by `BaseAPIClient.calculate_engagement_rate()` |
| `captured_at` | Timestamp | When this snapshot was recorded |

---

### `audience_snapshots`

Periodic demographic snapshot per platform connection. Append-only.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `creator_id` | UUID FK | → `creator_profiles.id` |
| `platform_connection_id` | UUID FK | → `platform_connections.id` |
| `follower_count` | Integer | |
| `age_distribution` | JSONB | Age buckets as percentage |
| `gender_distribution` | JSONB | `{male: %, female: %, other: %}` |
| `top_countries` | JSONB | Top 5 countries by % |
| `top_cities` | JSONB | Top 5 cities by % |
| `captured_at` | Timestamp | |

---

### `influence_scores`

Versioned, append-only influence score records. Old scores are never deleted.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `creator_id` | UUID FK | → `creator_profiles.id` |
| `score` | Float | Final composite score 0–100 |
| `breakdown` | JSONB | `ScoreBreakdown` sub-scores (audience_loyalty, engagement_quality, etc.) |
| `model_version` | String | e.g. `v1.2.0` — for reproducibility |
| `data_window_days` | Integer | How many days of data the score was computed over |
| `platforms_included` | JSONB | Which platforms contributed to this score |
| `scored_at` | Timestamp | |

**Access pattern:** `creator_id + scored_at DESC` (latest score per creator), `scored_at DESC` (system-wide leaderboard).

---

## Key Relationships

```
users ──1:1── creator_profiles ──1:N── platform_connections
                              ──1:N── content_items ──1:N── content_metric_snapshots
                              ──1:N── audience_snapshots
                              ──1:N── influence_scores

users ──1:1── sme_profiles ──1:N── campaigns ──1:N── campaign_collaborations
                                                     ──1:N── campaign_creator_briefs
                                                     ──1:N── conversion_events

users ──1:N── notifications
users ──1:N── audit_logs
```
