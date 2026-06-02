from __future__ import annotations

from uuid import UUID

from sqlalchemy import and_, select

from app.db.models.saved_creator import SavedCreator
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class ISavedCreatorRepository(IRepository[SavedCreator]):
    async def find(self, user_id: UUID, creator_id: UUID) -> SavedCreator | None:
        raise NotImplementedError

    async def list_by_user(self, user_id: UUID) -> list[SavedCreator]:
        raise NotImplementedError


class SQLAlchemySavedCreatorRepository(SQLAlchemyRepository[SavedCreator], ISavedCreatorRepository):
    model = SavedCreator

    async def find(self, user_id: UUID, creator_id: UUID) -> SavedCreator | None:
        statement = select(SavedCreator).where(
            and_(SavedCreator.user_id == str(user_id), SavedCreator.creator_id == str(creator_id))
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: UUID) -> list[SavedCreator]:
        statement = (
            select(SavedCreator)
            .where(SavedCreator.user_id == str(user_id))
            .order_by(SavedCreator.created_at.desc())
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
