"""
CIAP Seed Script
================
Populates the local database with realistic test data for the live app layer.

What it seeds:
    - Users, creator profiles, and SME profiles
    - Platform tokens for each connected social account
    - Content items for each creator
    - Platform metric snapshots for dashboards and score calculations
    - Audience snapshots for creator discovery
    - Influence scores for ranking and score views
    - A starter campaign for each SME

Passwords in the JSON files are PLAINTEXT.
This script hashes them with bcrypt before inserting — the DB never stores plaintext.

Usage:
    # From the project root (ciap-mvp-a/)
    python seeds/seed.py

    # To wipe and re-seed (drops seeded rows first):
    python seeds/seed.py --reset
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import uuid
from datetime import UTC, date, datetime, timedelta

# Make sure the project root is importable.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from passlib.context import CryptContext
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AudienceSnapshot,
    Campaign,
    CampaignCollaboration,
    CampaignMetric,
    ContentItem,
    CreatorProfile,
    InfluenceScore,
    PlatformMetric,
    PlatformToken,
    SmeProfile,
    SentimentResult,
    AuditLog,
    User,
)
from app.db.session import SessionLocal
from app.ml.influence_scorer import InfluenceScorer
from app.utils.date_utils import utcnow
from app.utils.encryption import encrypt_string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SEEDS_DIR = os.path.dirname(__file__)


def load_json(filename: str) -> list[dict[str, object]]:
    path = os.path.join(SEEDS_DIR, filename)
    with open(path, "r", encoding="utf-8") as file_handle:
        return json.load(file_handle)


def fake_encrypted_token(platform_user_id: str) -> str:
    raw_token = f"fake_access_token_for_{platform_user_id}_{uuid.uuid4().hex}"
    return encrypt_string(raw_token)


def _creator_location(profile_data: dict[str, object]) -> str | None:
    city = profile_data.get("location_city")
    country = profile_data.get("location_country")
    if city and country:
        return f"{city}, {country}"
    if city:
        return str(city)
    if country:
        return str(country)
    return None


def _audience_snapshot_payload(profile_data: dict[str, object]) -> dict[str, object]:
    location_country = str(profile_data.get("location_country") or "NG")
    return {
        "age_distribution": {"13-17": 5.0, "18-24": 38.0, "25-34": 35.0, "35-44": 14.0, "45+": 8.0},
        "location_distribution": {
            location_country: 72.0,
            "GH": 8.0,
            "US": 6.0,
            "GB": 4.0,
            "ZA": 3.0,
        },
        "interest_tags": [
            str(profile_data.get("category") or "general").lower(),
            *[str(value).lower() for value in profile_data.get("secondary_categories", [])][:2],
        ],
    }


def _metric_payload(followers: int, content_index: int, capture_index: int) -> dict[str, object]:
    views = int(followers * 0.12 * content_index * (1 + (capture_index * 0.08)))
    likes = int(views * 0.07)
    comments = int(views * 0.009)
    shares = int(views * 0.004)
    saves = int(views * 0.003)
    reach = int(views * 1.3)
    return {
        "views": views,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "saves": saves,
        "impressions": int(reach * 1.5),
        "reach": reach,
        "watch_time_seconds": int(views * 90),
        "average_view_duration_seconds": 90,
        "content_count": content_index,
        "followers": followers,
        "engagement_rate": round(((likes + comments + shares + saves) / reach * 100), 4) if reach else 0.0,
    }


async def reset_db(db: AsyncSession) -> None:
    print("\nResetting seeded data...")
    for model in (
        CampaignCollaboration,
        CampaignMetric,
        Campaign,
        InfluenceScore,
        PlatformMetric,
        ContentItem,
        AudienceSnapshot,
        PlatformToken,
        CreatorProfile,
        SmeProfile,
        SentimentResult,
        AuditLog,
        User,
    ):
        await db.execute(delete(model))
    await db.commit()
    print("All seeded data cleared.")


async def seed_creators(db: AsyncSession) -> None:
    creators = load_json("creators.json")
    print(f"\nSeeding {len(creators)} creators...")

    scorer = InfluenceScorer()

    for data in creators:
        email = str(data["email"])
        existing_user = await db.scalar(select(User).where(User.email == email))
        if existing_user is not None:
            print(f"  [SKIPPED] {email} — already exists")
            continue

        profile_data = dict(data["profile"])
        platform_connections = list(data.get("platform_connections", []))

        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=pwd_context.hash(str(data["password"])),
            role=str(data["role"]),
            full_name=str(data["full_name"]),
            language_preference=str(data.get("language_preference", "en")),
        )
        db.add(user)
        await db.flush()

        creator_profile = CreatorProfile(
            id=str(uuid.uuid4()),
            user_id=user.id,
            category=str(profile_data.get("category") or "Other"),
            location=_creator_location(profile_data),
            followers=int(profile_data.get("total_followers") or 0),
            top_platform=str(platform_connections[0]["platform_name"]) if platform_connections else None,
            bio=str(profile_data.get("bio") or ""),
            social_links=dict(profile_data.get("social_handles", {})),
            influence_score=float(profile_data.get("influence_score") or 0.0),
            is_public=bool(profile_data.get("is_public", True)),
        )
        db.add(creator_profile)
        await db.flush()

        created_tokens: list[PlatformToken] = []
        for connection_data in platform_connections:
            token = PlatformToken(
                id=str(uuid.uuid4()),
                user_id=user.id,
                platform_name=str(connection_data["platform_name"]),
                access_token=fake_encrypted_token(str(connection_data["platform_user_id"])),
                refresh_token=fake_encrypted_token(f"{connection_data['platform_user_id']}_refresh"),
                token_expires_at=utcnow() + timedelta(hours=1),
                platform_user_id=str(connection_data["platform_user_id"]),
                is_active=bool(connection_data.get("is_active", True)),
                last_synced_at=utcnow(),
            )
            db.add(token)
            await db.flush()
            created_tokens.append(token)

        primary_platform = created_tokens[0].platform_name if created_tokens else "YOUTUBE"
        followers = int(profile_data.get("total_followers") or 0)

        latest_metric_values: dict[str, object] = {}
        for content_index in range(1, 3):
            content = ContentItem(
                id=str(uuid.uuid4()),
                creator_id=user.id,
                platform=primary_platform,
                external_id=f"seed_{user.id.replace('-', '')[:8]}_content_{content_index}",
                media_type="VIDEO",
                caption=(
                    f"Seeded mock content item #{content_index} for {data['full_name']}. "
                    f"#ciap #test"
                ),
                permalink=f"https://{primary_platform.lower()}.com/watch?v=seed_{content_index}",
                posted_at=utcnow() - timedelta(days=content_index * 7),
                synced_at=utcnow(),
            )
            db.add(content)
            await db.flush()

            latest_metric_values = _metric_payload(followers, content_index, 0)
            previous_metric_values = _metric_payload(followers, content_index, 1)

            db.add(
                PlatformMetric(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    platform_name=primary_platform,
                    captured_at=utcnow() - timedelta(days=7 * content_index + 1),
                    metrics=previous_metric_values,
                )
            )
            db.add(
                PlatformMetric(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    platform_name=primary_platform,
                    captured_at=utcnow() - timedelta(days=7 * content_index),
                    metrics=latest_metric_values,
                )
            )

        audience_payload = _audience_snapshot_payload(profile_data)
        db.add(
            AudienceSnapshot(
                id=str(uuid.uuid4()),
                creator_id=user.id,
                captured_at=utcnow(),
                age_distribution=audience_payload["age_distribution"],
                location_distribution=audience_payload["location_distribution"],
                interest_tags=audience_payload["interest_tags"],
            )
        )

        score_result = scorer.score(
            {
                **latest_metric_values,
                "followers": followers,
                "content_count": 2,
            },
            audience_payload,
        )
        seeded_score = float(profile_data.get("influence_score") or score_result.score)
        db.add(
            InfluenceScore(
                id=str(uuid.uuid4()),
                creator_id=user.id,
                score=seeded_score,
                components=score_result.components,
                model_version=score_result.model_version,
                computed_at=utcnow(),
            )
        )

        print(f"  [DONE] {data['full_name']} ({email}) — seeded")

    await db.commit()
    print("Creators seeded successfully.")


async def seed_smes(db: AsyncSession) -> None:
    smes = load_json("smes.json")
    print(f"\nSeeding {len(smes)} SME users...")

    for data in smes:
        email = str(data["email"])
        existing_user = await db.scalar(select(User).where(User.email == email))
        if existing_user is not None:
            print(f"  [SKIPPED] {email} — already exists")
            continue

        profile_data = dict(data["profile"])
        monthly_budget = float(profile_data.get("monthly_budget_ngn") or 0)
        campaign_budget = int(monthly_budget) if monthly_budget > 0 else 1000000

        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=pwd_context.hash(str(data["password"])),
            role=str(data["role"]),
            full_name=str(data["full_name"]),
            language_preference=str(data.get("language_preference", "en")),
        )
        db.add(user)
        await db.flush()

        sme_profile = SmeProfile(
            id=str(uuid.uuid4()),
            user_id=user.id,
            company_name=str(profile_data.get("company_name") or data["full_name"]),
            industry=str(profile_data.get("industry") or "General"),
            billing_info={"monthly_budget_ngn": monthly_budget},
        )
        db.add(sme_profile)
        await db.flush()

        campaign = Campaign(
            id=str(uuid.uuid4()),
            sme_id=user.id,
            name=f"{sme_profile.company_name} Starter Campaign",
            goal="brand awareness",
            budget=campaign_budget,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="DRAFT",
        )
        db.add(campaign)

        print(f"  [DONE] {data['full_name']} @ {sme_profile.company_name} ({email}) — seeded")

    await db.commit()
    print("SMEs seeded successfully.")


async def main_async(reset: bool) -> None:
    async with SessionLocal() as db:
        try:
            if reset:
                await reset_db(db)
            await seed_creators(db)
            await seed_smes(db)

            print("\nDatabase seeding complete!\n")
            print("Seeded accounts (use these to log in):")
            print("─" * 55)
            print("CREATORS:")
            for creator in load_json("creators.json"):
                print(f"  {creator['full_name']:30} {creator['email']}  /  pw: {creator['password']}")

            print("\nSMEs:")
            for sme in load_json("smes.json"):
                print(f"  {sme['full_name']:30} {sme['email']}  /  pw: {sme['password']}")
            print("─" * 55)
        except Exception:
            await db.rollback()
            raise


def main() -> None:
    parser = argparse.ArgumentParser(description="CIAP seed script")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Wipe all seeded data before re-seeding",
    )
    args = parser.parse_args()
    asyncio.run(main_async(args.reset))


if __name__ == "__main__":
    main()
