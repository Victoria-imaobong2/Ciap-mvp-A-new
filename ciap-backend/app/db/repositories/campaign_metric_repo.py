from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.campaign_metric import CampaignMetric
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class ICampaignMetricRepository(IRepository[CampaignMetric]):
    async def list_for_campaign(self, campaign_id: UUID, limit: int = 20, offset: int = 0) -> list[CampaignMetric]:
        raise NotImplementedError

    async def latest_for_campaign(self, campaign_id: UUID) -> CampaignMetric | None:
        raise NotImplementedError


class SQLAlchemyCampaignMetricRepository(SQLAlchemyRepository[CampaignMetric], ICampaignMetricRepository):
    model = CampaignMetric

    async def list_for_campaign(self, campaign_id: UUID, limit: int = 20, offset: int = 0) -> list[CampaignMetric]:
        statement = (
            select(CampaignMetric)
            .where(CampaignMetric.campaign_id == str(campaign_id))
            .order_by(CampaignMetric.captured_at.desc(), CampaignMetric.id.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def latest_for_campaign(self, campaign_id: UUID) -> CampaignMetric | None:
        statement = (
            select(CampaignMetric)
            .where(CampaignMetric.campaign_id == str(campaign_id))
            .order_by(CampaignMetric.captured_at.desc(), CampaignMetric.id.desc())
            .limit(1)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()