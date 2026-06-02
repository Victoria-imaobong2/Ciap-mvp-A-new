from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.audience_snapshot import AudienceSnapshot
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class IAudienceSnapshotRepository(IRepository[AudienceSnapshot]):
    async def list_for_creator(self, creator_id: UUID, limit: int = 20, offset: int = 0) -> list[AudienceSnapshot]:
        raise NotImplementedError

    async def latest_for_creator(self, creator_id: UUID) -> AudienceSnapshot | None:
        raise NotImplementedError


class SQLAlchemyAudienceSnapshotRepository(SQLAlchemyRepository[AudienceSnapshot], IAudienceSnapshotRepository):
    model = AudienceSnapshot

    async def list_for_creator(self, creator_id: UUID, limit: int = 20, offset: int = 0) -> list[AudienceSnapshot]:
        statement = (
            select(AudienceSnapshot)
            .where(AudienceSnapshot.creator_id == str(creator_id))
            .order_by(AudienceSnapshot.captured_at.desc(), AudienceSnapshot.id.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def latest_for_creator(self, creator_id: UUID) -> AudienceSnapshot | None:
        statement = (
            select(AudienceSnapshot)
            .where(AudienceSnapshot.creator_id == str(creator_id))
            .order_by(AudienceSnapshot.captured_at.desc(), AudienceSnapshot.id.desc())
            .limit(1)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()