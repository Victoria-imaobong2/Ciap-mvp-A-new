from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.sme_profile import SmeProfile
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class ISmeProfileRepository(IRepository[SmeProfile]):
    async def get_by_user_id(self, user_id: UUID) -> SmeProfile | None:
        raise NotImplementedError


class SQLAlchemySmeProfileRepository(SQLAlchemyRepository[SmeProfile], ISmeProfileRepository):
    model = SmeProfile

    async def get_by_user_id(self, user_id: UUID) -> SmeProfile | None:
        statement = select(SmeProfile).where(SmeProfile.user_id == str(user_id))
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()