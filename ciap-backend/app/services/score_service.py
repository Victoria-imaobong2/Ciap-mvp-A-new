from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.influence_score import InfluenceScore
from app.db.repositories import (
    SQLAlchemyAudienceSnapshotRepository,
    SQLAlchemyInfluenceScoreRepository,
    SQLAlchemyPlatformMetricRepository,
)
from app.ml.influence_scorer import InfluenceScorer
from app.utils.date_utils import utcnow
from app.utils.serialization import model_to_dict, models_to_dicts


@dataclass(slots=True)
class ScoreService:
    session: AsyncSession

    async def _build_score_snapshot(self, creator_id: UUID) -> dict[str, Any]:
        metric_repo = SQLAlchemyPlatformMetricRepository(self.session)
        audience_repo = SQLAlchemyAudienceSnapshotRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)

        latest_metrics = await metric_repo.latest_for_user(creator_id)
        latest_audience = await audience_repo.latest_for_creator(creator_id)
        metric_values = model_to_dict(latest_metrics).get("metrics", {}) if latest_metrics is not None else {}
        audience_values = model_to_dict(latest_audience) if latest_audience is not None else {}

        latest_score = await score_repo.latest_for_creator(creator_id)
        if latest_score is not None:
            return model_to_dict(latest_score)

        result = InfluenceScorer().score(metric_values or {}, audience_values)
        score = InfluenceScore(
            creator_id=str(creator_id),
            score=result.score,
            model_version=result.model_version,
            computed_at=utcnow(),
            components=result.components,
        )
        created_score = await score_repo.add(score)
        return model_to_dict(created_score)

    async def get_current_score(self, creator_id: UUID) -> dict[str, Any]:
        score_snapshot = await self._build_score_snapshot(creator_id)
        return {
            "success": True,
            "message": "Influence score retrieved",
            "data": {
                "creator_id": str(creator_id),
                **score_snapshot,
            },
        }

    async def get_score_history(self, creator_id: UUID) -> dict[str, Any]:
        history = await SQLAlchemyInfluenceScoreRepository(self.session).list_for_creator(creator_id, limit=20, offset=0)
        return {
            "success": True,
            "message": "Score history retrieved",
            "data": {
                "creator_id": str(creator_id),
                "series": [
                    {"computed_at": row["computed_at"].isoformat() if row.get("computed_at") is not None else None, "score": row["score"]}
                    for row in reversed(models_to_dicts(history))
                ],
            },
        }

    async def compute_score(self, creator_id: UUID, force: bool = False) -> dict[str, Any]:
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)
        latest_score = await score_repo.latest_for_creator(creator_id)
        if latest_score is not None and not force:
            score_snapshot = model_to_dict(latest_score)
        else:
            score_snapshot = await self._build_score_snapshot(creator_id)
        return {
            "success": True,
            "message": "Score recomputed successfully",
            "data": {
                "creator_id": str(creator_id),
                "force": force,
                "score": score_snapshot,
            },
        }
