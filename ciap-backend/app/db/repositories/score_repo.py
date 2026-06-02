from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.influence_score import InfluenceScore
from app.db.repositories.base import IRepository
from app.db.repositories.base import SQLAlchemyRepository


class IScoreRepository(IRepository[InfluenceScore]):
    async def get_latest_for_creator(self, creator_id: UUID) -> InfluenceScore | None:
        raise NotImplementedError


class SQLAlchemyScoreRepository(SQLAlchemyRepository[InfluenceScore], IScoreRepository):
    model = InfluenceScore

    async def get_latest_for_creator(self, creator_id: UUID) -> InfluenceScore | None:
        statement = (
            select(InfluenceScore)
            .where(InfluenceScore.creator_id == str(creator_id))
            .order_by(InfluenceScore.computed_at.desc(), InfluenceScore.id.desc())
            .limit(1)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
