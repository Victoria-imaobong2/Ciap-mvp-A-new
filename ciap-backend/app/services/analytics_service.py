from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.db.repositories import (
    SQLAlchemyAudienceSnapshotRepository,
    SQLAlchemyContentRepository,
    SQLAlchemyCreatorProfileRepository,
    SQLAlchemyInfluenceScoreRepository,
    SQLAlchemyPlatformMetricRepository,
    SQLAlchemyUserRepository,
)
from app.ml.influence_scorer import InfluenceScorer
from app.utils.date_utils import isoformat
from app.utils.serialization import model_to_dict, models_to_dicts


@dataclass(slots=True)
class AnalyticsService:
    session: AsyncSession

    async def summary(self, creator_id: UUID | None = None) -> dict[str, Any]:
        if creator_id is None:
            return {
                "success": True,
                "message": "Analytics summary retrieved",
                "data": {"followers": 0, "views": 0, "engagement_rate": 0.0, "growth_rate": 0.0, "content_count": 0, "influence_score": 0.0},
            }

        user_repo = SQLAlchemyUserRepository(self.session)
        profile_repo = SQLAlchemyCreatorProfileRepository(self.session)
        content_repo = SQLAlchemyContentRepository(self.session)
        metric_repo = SQLAlchemyPlatformMetricRepository(self.session)
        audience_repo = SQLAlchemyAudienceSnapshotRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)

        user = await user_repo.get_by_id(creator_id)
        profile = await profile_repo.get_by_user_id(creator_id)
        if user is None:
            raise NotFoundError("Creator not found")

        latest_metrics = await metric_repo.latest_for_user(creator_id)
        recent_metrics = await metric_repo.list_for_user(creator_id, limit=4, offset=0)
        latest_audience = await audience_repo.latest_for_creator(creator_id)
        latest_score = await score_repo.latest_for_creator(creator_id)

        metric_values = model_to_dict(latest_metrics).get("metrics", {}) if latest_metrics is not None else {}
        audience_values = model_to_dict(latest_audience) if latest_audience is not None else {}
        computed_score = InfluenceScorer().score(metric_values or {}, audience_values) if latest_score is None else None
        content_count = len(await content_repo.get_by_creator(creator_id, limit=1000, offset=0))

        if len(recent_metrics) > 1:
            newest = model_to_dict(recent_metrics[0]).get("metrics", {}) if isinstance(model_to_dict(recent_metrics[0]).get("metrics"), dict) else {}
            oldest = model_to_dict(recent_metrics[-1]).get("metrics", {}) if isinstance(model_to_dict(recent_metrics[-1]).get("metrics"), dict) else {}
            growth_rate = round(((newest.get("views", 0) or 0) - (oldest.get("views", 0) or 0)) / max(oldest.get("views", 1) or 1, 1), 4)
        else:
            growth_rate = 0.0

        return {
            "success": True,
            "message": "Analytics summary retrieved",
            "data": {
                "creator_id": user.id,
                "full_name": user.full_name or user.email,
                "followers": profile.followers if profile is not None and profile.followers is not None else 0,
                "views": int((metric_values or {}).get("views", 0) or 0),
                "engagement_rate": round(((metric_values or {}).get("likes", 0) or 0) / max((metric_values or {}).get("views", 1) or 1, 1), 4),
                "growth_rate": growth_rate,
                "content_count": content_count,
                "influence_score": latest_score.score if latest_score is not None else (computed_score.score if computed_score is not None else 0.0),
            },
        }

    async def trends(self, creator_id: UUID | None = None) -> dict[str, Any]:
        if creator_id is None:
            series: list[dict[str, Any]] = []
        else:
            metrics = await SQLAlchemyPlatformMetricRepository(self.session).list_for_user(creator_id, limit=8, offset=0)
            series = [
                {
                    "date": isoformat(metric.captured_at),
                    "value": int((model_to_dict(metric).get("metrics", {}) or {}).get("views", 0)),
                }
                for metric in reversed(metrics)
            ]
        return {
            "success": True,
            "message": "Analytics trends retrieved",
            "data": {"metric": "views", "interval": "weekly", "series": series},
        }

    async def content_detail(self, content_id: UUID) -> dict[str, Any]:
        content_repo = SQLAlchemyContentRepository(self.session)
        content = await content_repo.get_by_id(content_id)
        if content is None:
            raise NotFoundError("Content not found")

        latest_metrics = await SQLAlchemyPlatformMetricRepository(self.session).latest_for_user(UUID(content.creator_id))
        metrics_payload = model_to_dict(latest_metrics).get("metrics", {}) if latest_metrics is not None else {}
        content_payload = model_to_dict(content)
        return {
            "success": True,
            "message": "Content detail retrieved",
            "data": {
                "id": content_payload["id"],
                "platform": content_payload["platform"],
                "creator_id": content_payload["creator_id"],
                "external_id": content_payload["external_id"],
                "media_type": content_payload["media_type"],
                "title": content_payload.get("caption"),
                "caption": content_payload.get("caption"),
                "permalink": content_payload.get("permalink"),
                "posted_at": isoformat(content_payload["posted_at"]) if content_payload.get("posted_at") is not None else None,
                "synced_at": isoformat(content_payload["synced_at"]) if content_payload.get("synced_at") is not None else None,
                "metrics": {"captured_at": isoformat(latest_metrics.captured_at) if latest_metrics is not None else None, **metrics_payload} if latest_metrics is not None else {},
            },
        }
