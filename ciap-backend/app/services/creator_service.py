from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.db.models.influence_score import InfluenceScore
from app.db.repositories import (
    SQLAlchemyAudienceSnapshotRepository,
    SQLAlchemyContentRepository,
    SQLAlchemyCreatorProfileRepository,
    SQLAlchemyInfluenceScoreRepository,
    SQLAlchemyPlatformMetricRepository,
    SQLAlchemyPlatformTokenRepository,
    SQLAlchemyUserRepository,
)
from app.ml.audience_segmenter import AudienceSegmenter
from app.ml.influence_scorer import InfluenceScorer
from app.utils.date_utils import utcnow
from app.utils.pagination import paginate_items
from app.utils.date_utils import isoformat
from app.utils.serialization import model_to_dict, models_to_dicts


@dataclass(slots=True)
class CreatorService:
    session: AsyncSession

    async def get_dashboard(self, creator_id: UUID | None = None, range_str: str = "Last 30 Days") -> dict[str, Any]:
        from datetime import timedelta
        from app.utils.date_utils import utcnow

        if creator_id is None:
            return {
                "success": True,
                "message": "Creator dashboard retrieved",
                "data": {
                    "creator": None,
                    "summary": {"followers": 0, "total_views": 0, "engagement_rate": 0.0, "growth_rate": 0.0, "influence_score": 0.0},
                    "platform_breakdown": [],
                    "top_content": [],
                    "trend": [],
                    "score": {"score": 0.0, "model_version": "weekly_weighted_v1", "computed_at": None, "components": {}},
                },
            }

        user_repo = SQLAlchemyUserRepository(self.session)
        profile_repo = SQLAlchemyCreatorProfileRepository(self.session)
        content_repo = SQLAlchemyContentRepository(self.session)
        audience_repo = SQLAlchemyAudienceSnapshotRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)
        metric_repo = SQLAlchemyPlatformMetricRepository(self.session)
        token_repo = SQLAlchemyPlatformTokenRepository(self.session)

        user = await user_repo.get_by_id(creator_id)
        if user is None:
            raise NotFoundError("Creator not found")

        profile = await profile_repo.get_by_user_id(creator_id)
        content_items = await content_repo.get_by_creator(creator_id, limit=10, offset=0)
        audience_snapshot = await audience_repo.latest_for_creator(creator_id)
        latest_score = await score_repo.latest_for_creator(creator_id)
        platforms = await token_repo.list_for_user(creator_id)

        # --- DYNAMIC DATE CALCULATIONS ---
        end_date = utcnow()
        days_map = {
            "Last 7 Days": 7,
            "Last 30 Days": 30,
            "This Month": 30, # Simplified for now
            "This Year": 365
        }
        num_days = days_map.get(range_str, 30)
        start_date = end_date - timedelta(days=num_days)
        prev_start_date = start_date - timedelta(days=num_days)

        # Fetch metrics for the current and previous periods
        current_metrics = await metric_repo.list_in_range(creator_id, start_date, end_date)
        prev_metrics = await metric_repo.list_in_range(creator_id, prev_start_date, start_date)

        def calculate_aggregate(metric_list):
            if not metric_list:
                return {"views_delta": 0, "followers_delta": 0, "total_likes": 0, "total_views": 0}
            
            first = model_to_dict(metric_list[0]).get("metrics", {}) or {}
            last = model_to_dict(metric_list[-1]).get("metrics", {}) or {}
            
            # For views and followers, we want the difference (delta) over the period
            # Or if the metrics are total accumulative, we take the delta
            v_start = int(first.get("views", 0) or 0)
            v_end = int(last.get("views", 0) or 0)
            f_start = int(first.get("followers", 0) or 0)
            f_end = int(last.get("followers", 0) or 0)
            
            return {
                "views_delta": max(0, v_end - v_start),
                "followers_delta": f_end - f_start,
                "total_likes": sum(int((model_to_dict(m).get("metrics", {}) or {}).get("likes", 0) or 0) for m in metric_list),
                "total_views": v_end # Cumulative current views
            }

        curr_agg = calculate_aggregate(current_metrics)
        prev_agg = calculate_aggregate(prev_metrics)

        # Growth Percentage Calculations
        def get_delta_pct(curr, prev):
            if prev <= 0: return 0.0
            return round(((curr - prev) / prev) * 100, 1)

        views_growth_pct = get_delta_pct(curr_agg["views_delta"], prev_agg["views_delta"])
        followers_growth_pct = get_delta_pct(curr_agg["followers_delta"], prev_agg["followers_delta"])

        # Influence Score Logic
        if latest_score is not None:
            score_payload = model_to_dict(latest_score)
        else:
            # Fallback scoring logic
            score_result = InfluenceScorer().score(
                {"views": curr_agg["total_views"], "likes": curr_agg["total_likes"]}, 
                model_to_dict(audience_snapshot) if audience_snapshot else {}
            )
            score_payload = {
                "score": score_result.score,
                "components": score_result.components,
                "computed_at": isoformat(utcnow())
            }

        top_content = models_to_dicts(content_items[:3])
        trend = []
        for metric in current_metrics:
            m = (model_to_dict(metric).get("metrics", {}) or {})
            trend.append({
                "date": isoformat(metric.captured_at),
                "value": int(m.get("views", 0)),
                "views": int(m.get("views", 0)),
                "likes": int(m.get("likes", 0)),
                "followers": int(m.get("followers", 0)),
                "comments": int(m.get("comments", 0)),
            })

        return {
            "success": True,
            "message": "Creator dashboard retrieved",
            "data": {
                "creator": {
                    "id": user.id,
                    "full_name": user.full_name or user.email,
                    "category": profile.category if profile is not None else None,
                    "influence_score": score_payload.get("score", 0.0),
                },
                "summary": {
                    "total_views": curr_agg["total_views"],
                    "views_delta": curr_agg["views_delta"],
                    "views_growth_pct": views_growth_pct,
                    "engagement_rate": round(curr_agg["total_likes"] / max(curr_agg["total_views"], 1), 4),
                    "followers_delta": curr_agg["followers_delta"],
                    "followers_growth_pct": followers_growth_pct,
                    "influence_score": score_payload.get("score", 0.0),
                },
                "platform_breakdown": [
                    {
                        "platform": token.platform_name,
                        "platform_user_id": token.platform_user_id,
                        "is_active": token.is_active,
                        "last_synced_at": token.last_synced_at,
                    }
                    for token in platforms
                ],
                "top_content": top_content,
                "trend": trend,
                "score": score_payload,
            },
        }

    async def list_content(self, creator_id: UUID | None = None, range_str: str = "Last 30 Days") -> dict[str, Any]:
        from datetime import timedelta
        from app.utils.date_utils import utcnow

        if creator_id is None:
            return {"success": True, "data": {"items": []}}

        content_repo = SQLAlchemyContentRepository(self.session)
        
        # --- DYNAMIC DATE CALCULATIONS ---
        end_date = utcnow()
        days_map = {
            "Last 7 Days": 7,
            "Last 30 Days": 30,
            "This Month": 30,
            "This Year": 365
        }
        num_days = days_map.get(range_str, 30)
        start_date = end_date - timedelta(days=num_days)

        # Fetch and format content
        content_items = await content_repo.get_by_creator(creator_id, limit=20, offset=0)
        
        items = []
        for item in content_items:
            data = model_to_dict(item)
            items.append({
                "id": data.get("id"),
                "title": data.get("title") or data.get("caption", "")[:80] if data.get("caption") else "Untitled",
                "description": data.get("caption", ""),
                "views": 0,
                "engagement": 0.05,
                "platform": data.get("platform", "YouTube"),
                "thumbnail_url": data.get("thumbnail_url") or "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
                "published_at": data.get("posted_at"),
            })

        # Sort by views desc
        items.sort(key=lambda x: x.get("views", 0) or 0, reverse=True)

        return {
            "success": True,
            "message": "Creator content retrieved",
            "data": {
                "creator_id": str(creator_id) if creator_id is not None else None,
                "items": items,
            },
        }

    async def get_audience(self, creator_id: UUID | None = None) -> dict[str, Any]:
        if creator_id is None:
            audience_snapshot_data: dict[str, Any] = {}
            segments: list[dict[str, Any]] = []
            growth_data: list[dict[str, Any]] = []
        else:
            audience_snapshot = await SQLAlchemyAudienceSnapshotRepository(self.session).latest_for_creator(creator_id)
            audience_snapshot_data = model_to_dict(audience_snapshot) if audience_snapshot is not None else {}

            from datetime import timedelta
            end_date = utcnow()
            start_date = end_date - timedelta(days=30)
            metric_repo = SQLAlchemyPlatformMetricRepository(self.session)
            metrics = await metric_repo.list_in_range(creator_id, start_date, end_date)
            growth_data = [
                {"day": str(i + 1), "current": int((model_to_dict(m).get("metrics", {}) or {}).get("followers", 0)), "previous": 0}
                for i, m in enumerate(metrics)
            ]

            segments = [asdict(segment) for segment in AudienceSegmenter().segment(audience_snapshot_data)] if audience_snapshot_data else []

        return {
            "success": True,
            "message": "Creator audience retrieved",
            "data": {
                "creator_id": str(creator_id) if creator_id is not None else None,
                "audience": audience_snapshot_data,
                "growth_data": growth_data,
                "segments": segments,
            },
        }

    async def list_platforms(self, creator_id: UUID | None = None) -> dict[str, Any]:
        platforms = [] if creator_id is None else await SQLAlchemyPlatformTokenRepository(self.session).list_for_user(creator_id)

        return {
            "success": True,
            "message": "Creator platforms retrieved",
            "data": {
                "creator_id": str(creator_id) if creator_id is not None else None,
                "items": [
                    {
                        "platform": platform.platform_name,
                        "platform_user_id": platform.platform_user_id,
                        "is_active": platform.is_active,
                        "last_synced_at": platform.last_synced_at,
                    }
                    for platform in platforms
                ],
            },
        }

    async def queue_platform_sync(self, platforms: list[str] | None = None, user_id: UUID | None = None) -> dict[str, Any]:
        resolved_platforms = platforms or []
        if not resolved_platforms and user_id is not None:
            resolved_platforms = [token.platform_name for token in await SQLAlchemyPlatformTokenRepository(self.session).list_for_user(user_id)]

        from app.services.sync_service import sync_platform_for_user

        return await sync_platform_for_user(self.session, str(user_id), resolved_platforms)

    async def get_public_profile(self, creator_id: UUID) -> dict[str, Any]:
        user_repo = SQLAlchemyUserRepository(self.session)
        profile_repo = SQLAlchemyCreatorProfileRepository(self.session)
        content_repo = SQLAlchemyContentRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)
        token_repo = SQLAlchemyPlatformTokenRepository(self.session)

        user = await user_repo.get_by_id(creator_id)
        profile = await profile_repo.get_by_user_id(creator_id)
        if user is None or profile is None:
            raise NotFoundError("Creator profile not found")

        latest_score = await score_repo.latest_for_creator(creator_id)
        if latest_score is None:
            score_result = InfluenceScorer().score({"followers": profile.followers or 0, "content_count": 0}, {})
            score_payload: dict[str, Any] = asdict(score_result)
        else:
            score_payload = model_to_dict(latest_score)

        content_highlights = models_to_dicts(await content_repo.get_by_creator(creator_id, limit=3, offset=0))
        platforms = await token_repo.list_for_user(creator_id)

        return {
            "success": True,
            "message": "Public creator profile retrieved",
            "data": {
                "id": str(creator_id),
                "full_name": user.full_name or user.email,
                "social_links": profile.social_links or {},
                "location": profile.location,
                "bio": profile.bio,
                "category": profile.category,
                "followers": profile.followers or 0,
                "top_platform": profile.top_platform,
                "influence_score": score_payload.get("score", 0.0),
                "is_public": profile.is_public,
                "platforms": [token.platform_name for token in platforms],
                "highlights": content_highlights,
            },
        }
