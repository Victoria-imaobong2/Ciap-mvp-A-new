from __future__ import annotations

from uuid import uuid4

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CampaignCollaboration(Base):
    __tablename__ = "campaign_collaborations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    campaign_id: Mapped[str] = mapped_column(String(36), ForeignKey("campaigns.id"), nullable=False)
    creator_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    content_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("content_items.id"), nullable=True)
    negotiated_fee: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tracking_link: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    conversions: Mapped[int | None] = mapped_column(Integer, nullable=True)
