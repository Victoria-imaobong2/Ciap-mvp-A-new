from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.influence_score import InfluenceScore
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class IInfluenceScoreRepository(IRepository[InfluenceScore]):
    async def list_for_creator(self, creator_id: UUID, limit: int = 20, offset: int = 0) -> list[InfluenceScore]:
        raise NotImplementedError

    async def latest_for_creator(self, creator_id: UUID) -> InfluenceScore | None:
        raise NotImplementedError


class SQLAlchemyInfluenceScoreRepository(SQLAlchemyRepository[InfluenceScore], IInfluenceScoreRepository):
    model = InfluenceScore

    async def list_for_creator(self, creator_id: UUID, limit: int = 20, offset: int = 0) -> list[InfluenceScore]:
        statement = (
            select(InfluenceScore)
            .where(InfluenceScore.creator_id == str(creator_id))
            .order_by(InfluenceScore.computed_at.desc(), InfluenceScore.id.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def latest_for_creator(self, creator_id: UUID) -> InfluenceScore | None:
        statement = (
            select(InfluenceScore)
            .where(InfluenceScore.creator_id == str(creator_id))
            .order_by(InfluenceScore.computed_at.desc(), InfluenceScore.id.desc())
            .limit(1)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()