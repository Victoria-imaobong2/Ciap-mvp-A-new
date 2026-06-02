from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.utils.date_utils import utcnow


class AudienceSnapshot(Base):
    __tablename__ = "audience_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    creator_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    age_distribution: Mapped[dict[str, float] | None] = mapped_column(JSON, nullable=True)
    gender_distribution: Mapped[dict[str, float] | None] = mapped_column(JSON, nullable=True)
    location_distribution: Mapped[dict[str, float] | None] = mapped_column(JSON, nullable=True)
    interest_tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    subscriber_count: Mapped[int | None] = mapped_column(nullable=True)
