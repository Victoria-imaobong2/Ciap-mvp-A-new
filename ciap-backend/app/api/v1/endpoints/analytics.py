from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.dependencies import get_analytics_service
from app.dependencies import get_current_user
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def summary(
    current_user: dict[str, str] = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> dict[str, object]:
    return await analytics_service.summary(UUID(current_user["id"]))


@router.get("/trends")
async def trends(
    current_user: dict[str, str] = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> dict[str, object]:
    return await analytics_service.trends(UUID(current_user["id"]))


@router.get("/content/{content_id}")
async def content_detail(
    content_id: UUID,
    current_user: dict[str, str] = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> dict[str, object]:
    return await analytics_service.content_detail(content_id)
