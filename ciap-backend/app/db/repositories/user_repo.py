from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.user import User
from app.db.repositories.base import IRepository
from app.db.repositories.base import SQLAlchemyRepository


class IUserRepository(IRepository[User]):
    async def get_by_email(self, email: str) -> User | None:
        raise NotImplementedError


class SQLAlchemyUserRepository(SQLAlchemyRepository[User], IUserRepository):
    model = User

    async def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_id(self, entity_id: UUID) -> User | None:
        return await super().get_by_id(entity_id)
