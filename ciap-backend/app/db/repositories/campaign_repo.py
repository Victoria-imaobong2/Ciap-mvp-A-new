from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.campaign import Campaign
from app.db.repositories.base import IRepository
from app.db.repositories.base import SQLAlchemyRepository


class ICampaignRepository(IRepository[Campaign]):
    async def get_by_owner(self, sme_id: UUID, limit: int = 20, offset: int = 0) -> list[Campaign]:
        raise NotImplementedError


class SQLAlchemyCampaignRepository(SQLAlchemyRepository[Campaign], ICampaignRepository):
    model = Campaign

    async def get_by_owner(self, sme_id: UUID, limit: int = 20, offset: int = 0) -> list[Campaign]:
        statement = (
            select(Campaign)
            .where(Campaign.sme_id == str(sme_id))
            .order_by(Campaign.created_at.desc(), Campaign.id)
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
