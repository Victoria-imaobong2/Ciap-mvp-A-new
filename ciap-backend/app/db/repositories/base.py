from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Sequence
from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class IRepository(ABC, Generic[T]):
    @abstractmethod
    async def get_by_id(self, entity_id: UUID) -> T | None:
        raise NotImplementedError

    @abstractmethod
    async def list(self, *, limit: int = 20, offset: int = 0) -> Sequence[T]:
        raise NotImplementedError

    @abstractmethod
    async def add(self, entity: T) -> T:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, entity_id: UUID) -> None:
        raise NotImplementedError


class SQLAlchemyRepository(Generic[T]):
    model: type[T]
    id_attribute = "id"

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _primary_key_column(self) -> Any:
        return getattr(self.model, self.id_attribute)

    async def get_by_id(self, entity_id: UUID) -> T | None:
        statement = select(self.model).where(self._primary_key_column() == str(entity_id))
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list(self, *, limit: int = 20, offset: int = 0) -> Sequence[T]:
        statement = select(self.model).order_by(self._primary_key_column()).offset(offset).limit(limit)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def add(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def delete(self, entity_id: UUID) -> None:
        entity = await self.get_by_id(entity_id)
        if entity is None:
            return

        await self.session.delete(entity)
        await self.session.flush()

    async def count(self) -> int:
        statement = select(func.count()).select_from(self.model)
        result = await self.session.execute(statement)
        return int(result.scalar_one())
