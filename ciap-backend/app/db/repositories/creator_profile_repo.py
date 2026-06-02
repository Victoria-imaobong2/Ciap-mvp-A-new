from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.creator_profile import CreatorProfile
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class ICreatorProfileRepository(IRepository[CreatorProfile]):
    async def get_by_user_id(self, user_id: UUID) -> CreatorProfile | None:
        raise NotImplementedError

    async def list_public(self, limit: int = 100, offset: int = 0) -> list[CreatorProfile]:
        raise NotImplementedError


class SQLAlchemyCreatorProfileRepository(SQLAlchemyRepository[CreatorProfile], ICreatorProfileRepository):
    model = CreatorProfile

    async def get_by_user_id(self, user_id: UUID) -> CreatorProfile | None:
        statement = select(CreatorProfile).where(CreatorProfile.user_id == str(user_id))
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_public(self, limit: int = 100, offset: int = 0) -> list[CreatorProfile]:
        statement = (
            select(CreatorProfile)
            .where(CreatorProfile.is_public.is_(True))
            .order_by(CreatorProfile.influence_score.desc().nullslast(), CreatorProfile.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())