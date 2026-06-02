from __future__ import annotations

from uuid import uuid4

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SentimentResult(Base):
    __tablename__ = "sentiment_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    content_id: Mapped[str] = mapped_column(String(36), ForeignKey("content_items.id"), nullable=False)
    positive_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    negative_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    neutral_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    dominant_sentiment: Mapped[str | None] = mapped_column(String(50), nullable=True)
