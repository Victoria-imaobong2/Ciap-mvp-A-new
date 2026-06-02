from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas import ForecastRequest
from app.db.repositories import (
    SQLAlchemyCreatorProfileRepository,
    SQLAlchemyInfluenceScoreRepository,
    SQLAlchemyPlatformMetricRepository,
)
from app.ml.campaign_forecaster import CampaignForecaster
from app.utils.serialization import model_to_dict


@dataclass(slots=True)
class ForecastService:
    session: AsyncSession

    async def forecast_campaign(self, payload: ForecastRequest) -> dict[str, Any]:
        metric_repo = SQLAlchemyPlatformMetricRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)
        profile_repo = SQLAlchemyCreatorProfileRepository(self.session)

        latest_metric = await metric_repo.latest_for_user(payload.creator_id)
        latest_score = await score_repo.latest_for_creator(payload.creator_id)
        profile = await profile_repo.get_by_user_id(payload.creator_id)

        metrics = model_to_dict(latest_metric).get("metrics", {}) if latest_metric is not None else {}
        metrics["followers"] = profile.followers if profile is not None and profile.followers is not None else metrics.get("followers", 0)
        metrics["influence_score"] = latest_score.score if latest_score is not None else (profile.influence_score if profile is not None and profile.influence_score is not None else 0.0)

        result = CampaignForecaster().forecast(metrics, budget=payload.budget, duration_days=payload.duration_days, goal=payload.goal)
        return {"success": True, "message": "Forecast generated successfully", "data": {"creator_id": str(payload.creator_id), **asdict(result)}}
