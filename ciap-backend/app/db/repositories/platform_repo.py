from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.platform_token import PlatformToken
from app.db.repositories.base import IRepository
from app.db.repositories.base import SQLAlchemyRepository


class IPlatformRepository(IRepository[PlatformToken]):
    async def list_for_user(self, user_id: UUID) -> list[PlatformToken]:
        raise NotImplementedError


class SQLAlchemyPlatformRepository(SQLAlchemyRepository[PlatformToken], IPlatformRepository):
    model = PlatformToken

    async def list_for_user(self, user_id: UUID) -> list[PlatformToken]:
        statement = (
            select(PlatformToken)
            .where(PlatformToken.user_id == str(user_id))
            .order_by(PlatformToken.platform_name, PlatformToken.id)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
