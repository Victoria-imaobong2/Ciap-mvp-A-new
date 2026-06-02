from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.models.content_item import ContentItem
from app.db.repositories.base import IRepository
from app.db.repositories.base import SQLAlchemyRepository


class IContentRepository(IRepository[ContentItem]):
    async def get_by_creator(self, creator_id: UUID, limit: int = 20, offset: int = 0) -> list[ContentItem]:
        raise NotImplementedError


class SQLAlchemyContentRepository(SQLAlchemyRepository[ContentItem], IContentRepository):
    model = ContentItem

    async def get_by_creator(self, creator_id: UUID, limit: int = 20, offset: int = 0) -> list[ContentItem]:
        statement = (
            select(ContentItem)
            .where(ContentItem.creator_id == str(creator_id))
            .order_by(ContentItem.posted_at.desc().nullslast(), ContentItem.id)
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
