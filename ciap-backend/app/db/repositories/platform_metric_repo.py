from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import select

from app.db.models.platform_metric import PlatformMetric
from app.db.repositories.base import IRepository, SQLAlchemyRepository


class IPlatformMetricRepository(IRepository[PlatformMetric]):
    async def list_for_user(self, user_id: UUID, limit: int = 20, offset: int = 0) -> list[PlatformMetric]:
        raise NotImplementedError

    async def latest_for_user(self, user_id: UUID) -> PlatformMetric | None:
        raise NotImplementedError


class SQLAlchemyPlatformMetricRepository(SQLAlchemyRepository[PlatformMetric], IPlatformMetricRepository):
    model = PlatformMetric

    async def list_for_user(self, user_id: UUID, limit: int = 20, offset: int = 0) -> list[PlatformMetric]:
        statement = (
            select(PlatformMetric)
            .where(PlatformMetric.user_id == str(user_id))
            .order_by(PlatformMetric.captured_at.desc(), PlatformMetric.id.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def list_in_range(self, user_id: UUID, start_date: datetime, end_date: datetime) -> list[PlatformMetric]:
        statement = (
            select(PlatformMetric)
            .where(
                PlatformMetric.user_id == str(user_id),
                PlatformMetric.captured_at >= start_date,
                PlatformMetric.captured_at <= end_date
            )
            .order_by(PlatformMetric.captured_at.asc())
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def latest_for_user(self, user_id: UUID) -> PlatformMetric | None:
        statement = (
            select(PlatformMetric)
            .where(PlatformMetric.user_id == str(user_id))
            .order_by(PlatformMetric.captured_at.desc(), PlatformMetric.id.desc())
            .limit(1)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()