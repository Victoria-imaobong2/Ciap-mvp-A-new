from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas import CampaignCreateRequest, CampaignUpdateRequest
from app.core.exceptions import NotFoundError
from app.db.models.campaign import Campaign
from app.db.repositories import (
    SQLAlchemyCampaignRepository,
    SQLAlchemyInfluenceScoreRepository,
    SQLAlchemyPlatformMetricRepository,
)
from app.ml.campaign_forecaster import CampaignForecaster
from app.utils.pagination import paginate_items
from app.utils.serialization import model_to_dict, models_to_dicts


@dataclass(slots=True)
class CampaignService:
    session: AsyncSession

    async def list_campaigns(self, owner_id: UUID | None = None, page: int = 1, limit: int = 20, status: str | None = None) -> dict[str, Any]:
        repository = SQLAlchemyCampaignRepository(self.session)
        if owner_id is None:
            campaigns = await repository.list(limit=1000, offset=0)
        else:
            campaigns = await repository.get_by_owner(owner_id, limit=1000, offset=0)

        items = models_to_dicts(campaigns)
        if status is not None:
            normalized_status = status.lower()
            items = [item for item in items if str(item["status"]).lower() == normalized_status]
        page_result = paginate_items(items, page=page, limit=limit)
        return {"success": True, "message": "Campaigns retrieved", "data": {"items": page_result.items, "meta": asdict(page_result.meta)}}

    async def create_campaign(self, owner_id: UUID | None, payload: CampaignCreateRequest) -> dict[str, Any]:
        if owner_id is None:
            raise NotFoundError("Campaign owner not provided")

        metric_repo = SQLAlchemyPlatformMetricRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)
        latest_metric = await metric_repo.latest_for_user(owner_id)
        latest_score = await score_repo.latest_for_creator(owner_id)
        metric_values = model_to_dict(latest_metric).get("metrics", {}) if latest_metric is not None else {}
        if latest_score is not None:
            metric_values = {**metric_values, "influence_score": latest_score.score}

        duration_days = 14
        if payload.start_date is not None and payload.end_date is not None:
            duration_days = max(1, (payload.end_date - payload.start_date).days + 1)
        forecast = CampaignForecaster().forecast(
            metric_values,
            budget=float(payload.budget or 2000000),
            duration_days=duration_days,
            goal=payload.goal or "awareness",
        )
        campaign = Campaign(
            sme_id=str(owner_id),
            name=payload.name,
            goal=payload.goal,
            budget=payload.budget,
            start_date=payload.start_date,
            end_date=payload.end_date,
            status="DRAFT",
        )
        created_campaign = await SQLAlchemyCampaignRepository(self.session).add(campaign)
        return {
            "success": True,
            "message": "Campaign created successfully",
            "data": {
                **model_to_dict(created_campaign),
                "forecast": asdict(forecast),
                "creator_score": latest_score.score if latest_score is not None else 0.0,
            },
        }

    async def get_campaign(self, campaign_id: UUID) -> dict[str, Any]:
        campaign = await SQLAlchemyCampaignRepository(self.session).get_by_id(campaign_id)
        if campaign is None:
            raise NotFoundError("Campaign not found")
        return {
            "success": True,
            "message": "Campaign detail retrieved",
            "data": {
                **model_to_dict(campaign),
                "collaborations": [],
            },
        }

    async def update_campaign(self, campaign_id: UUID, payload: CampaignUpdateRequest) -> dict[str, Any]:
        repository = SQLAlchemyCampaignRepository(self.session)
        campaign = await repository.get_by_id(campaign_id)
        if campaign is None:
            raise NotFoundError("Campaign not found")

        if payload.name is not None:
            campaign.name = payload.name
        if payload.goal is not None:
            campaign.goal = payload.goal
        if payload.budget is not None:
            campaign.budget = payload.budget
        if payload.start_date is not None:
            campaign.start_date = payload.start_date
        if payload.end_date is not None:
            campaign.end_date = payload.end_date
        if payload.status is not None:
            campaign.status = payload.status

        await self.session.flush()
        return {
            "success": True,
            "message": "Campaign updated successfully",
            "data": {
                **model_to_dict(campaign),
            },
        }

    async def delete_campaign(self, campaign_id: UUID) -> dict[str, Any]:
        repository = SQLAlchemyCampaignRepository(self.session)
        campaign = await repository.get_by_id(campaign_id)
        if campaign is None:
            raise NotFoundError("Campaign not found")
        await repository.delete(campaign_id)
        return {"success": True, "message": "Campaign deleted successfully", "data": {"id": str(campaign_id)}}
