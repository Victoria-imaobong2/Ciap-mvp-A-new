from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audience_snapshot import AudienceSnapshot
from app.db.models.content_item import ContentItem
from app.db.models.platform_metric import PlatformMetric
from app.db.models.platform_token import PlatformToken
from app.db.repositories.audience_snapshot_repo import SQLAlchemyAudienceSnapshotRepository
from app.db.repositories.content_repo import SQLAlchemyContentRepository
from app.db.repositories.platform_token_repo import SQLAlchemyPlatformTokenRepository
from app.ingestion.connectors.youtube import YouTubeConnector
from app.ingestion.normalizer import normalize_content_item
from app.utils.date_utils import utcnow


async def sync_platform_for_user(
    session: AsyncSession,
    user_id: str,
    platforms: list[str] | None = None,
) -> dict[str, Any]:
    token_repo = SQLAlchemyPlatformTokenRepository(session)
    content_repo = SQLAlchemyContentRepository(session)

    tokens = await token_repo.list_for_user(UUID(user_id))
    if platforms:
        tokens = [t for t in tokens if t.platform_name in platforms]

    synced: list[str] = []
    for token in tokens:
        if token.platform_name == "youtube":
            content_count = await _sync_youtube(session, content_repo, token, user_id)
            await _sync_youtube_audience(session, token, user_id)
            synced.append(f"youtube({content_count} items)")

    return {"success": True, "message": f"Synced platforms: {', '.join(synced)}"}


async def _refresh_token(session: AsyncSession, token: PlatformToken) -> None:
    from datetime import datetime, timedelta, timezone

    if token.token_expires_at and token.token_expires_at > datetime.now(timezone.utc):
        return
    if not token.refresh_token:
        return

    from app.config import settings

    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": token.refresh_token,
                "grant_type": "refresh_token",
            },
        )
        if resp.status_code == 200:
            data = resp.json()
            token.access_token = data["access_token"]
            token.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600))
        else:
            token.is_active = False
        await session.commit()


async def _sync_youtube(
    session: AsyncSession,
    content_repo: SQLAlchemyContentRepository,
    token: PlatformToken,
    user_id: str,
) -> int:
    from datetime import datetime

    await _refresh_token(session, token)

    connector = YouTubeConnector(
        access_token=token.access_token,
        refresh_token=token.refresh_token,
    )

    items = await connector.fetch_content(limit=20)
    if not items:
        return 0

    existing_ids: set[str] = set()
    stmt = select(ContentItem.external_id).where(
        ContentItem.creator_id == str(user_id),
        ContentItem.platform == "YOUTUBE",
    )
    result = await session.execute(stmt)
    existing_ids = {row[0] for row in result.fetchall()}

    added = 0
    for item in items:
        ext_id = item.get("external_id", "")
        if ext_id in existing_ids:
            continue

        normalized = normalize_content_item("youtube", item)
        posted = None
        if normalized.posted_at:
            posted = datetime.fromisoformat(normalized.posted_at.replace("Z", "+00:00"))
        content_item = ContentItem(
            creator_id=str(user_id),
            platform=normalized.platform,
            external_id=ext_id,
            media_type=normalized.media_type or "video",
            caption=normalized.caption,
            title=item.get("title"),
            thumbnail_url=item.get("thumbnail_url"),
            permalink=normalized.permalink,
            posted_at=posted,
            synced_at=utcnow(),
        )
        await content_repo.add(content_item)
        added += 1

    profile = await connector.fetch_profile("")
    total_likes = sum(int(item.get("likes", 0) or 0) for item in items)
    total_comments = sum(int(item.get("comments", 0) or 0) for item in items)

    metric_record = PlatformMetric(
        user_id=str(user_id),
        platform_name="YOUTUBE",
        captured_at=utcnow(),
        metrics={
            "views": int(profile.get("total_views", 0)),
            "followers": int(profile.get("subscribers", 0)),
            "likes": total_likes,
            "comments": total_comments,
            "content_count": len(items),
        },
    )
    session.add(metric_record)

    token.platform_user_id = items[0].get("channel_id") or token.platform_user_id
    token.last_synced_at = utcnow()
    await session.commit()
    return added


async def _sync_youtube_audience(
    session: AsyncSession,
    token: PlatformToken,
    user_id: str,
) -> None:
    await _refresh_token(session, token)

    connector = YouTubeConnector(
        access_token=token.access_token,
        refresh_token=token.refresh_token,
    )

    profile = await connector.fetch_profile("")
    audience = await connector.fetch_audience()

    audience_repo = SQLAlchemyAudienceSnapshotRepository(session)

    snapshot = AudienceSnapshot(
        creator_id=str(user_id),
        captured_at=utcnow(),
        age_distribution=audience.get("age_distribution"),
        gender_distribution=audience.get("gender_distribution"),
        location_distribution=audience.get("location_distribution"),
        interest_tags=audience.get("interest_tags"),
        subscriber_count=profile.get("subscribers"),
    )
    await audience_repo.add(snapshot)
    await session.commit()
