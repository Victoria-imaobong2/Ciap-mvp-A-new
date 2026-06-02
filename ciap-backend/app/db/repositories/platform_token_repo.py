from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.platform_token import PlatformToken
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class IPlatformTokenRepository(IRepository[PlatformToken]):
    async def list_for_user(self, user_id: UUID) -> list[PlatformToken]:
        raise NotImplementedError


class SQLAlchemyPlatformTokenRepository(SQLAlchemyRepository[PlatformToken], IPlatformTokenRepository):
    model = PlatformToken

    async def list_for_user(self, user_id: UUID) -> list[PlatformToken]:
        statement = (
            select(PlatformToken)
            .where(PlatformToken.user_id == str(user_id))
            .order_by(PlatformToken.platform_name, PlatformToken.id)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())