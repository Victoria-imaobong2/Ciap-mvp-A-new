from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_creator_service
from app.dependencies import get_current_user
from app.services.creator_service import CreatorService

router = APIRouter(prefix="/creator", tags=["creator"])


@router.get("/dashboard")
async def dashboard(
    current_user: dict[str, str] = Depends(get_current_user),
    creator_service: CreatorService = Depends(get_creator_service),
    creator_id: UUID | None = Query(default=None),
    range_str: str = Query(default="Last 30 Days"),
) -> dict[str, object]:
    return await creator_service.get_dashboard(creator_id or UUID(current_user["id"]), range_str=range_str)


@router.get("/content")
async def content(
    current_user: dict[str, str] = Depends(get_current_user),
    creator_service: CreatorService = Depends(get_creator_service),
    creator_id: UUID | None = Query(default=None),
    range_str: str = Query(default="Last 30 Days"),
) -> dict[str, object]:
    return await creator_service.list_content(creator_id or UUID(current_user["id"]), range_str=range_str)


@router.get("/audience")
async def audience(
    current_user: dict[str, str] = Depends(get_current_user),
    creator_service: CreatorService = Depends(get_creator_service),
    creator_id: UUID | None = Query(default=None),
) -> dict[str, object]:
    return await creator_service.get_audience(creator_id or UUID(current_user["id"]))


@router.get("/platforms")
async def platforms(
    current_user: dict[str, str] = Depends(get_current_user),
    creator_service: CreatorService = Depends(get_creator_service),
    creator_id: UUID | None = Query(default=None),
) -> dict[str, object]:
    return await creator_service.list_platforms(creator_id or UUID(current_user["id"]))


@router.post("/platforms/sync")
async def sync_platforms(
    platforms: list[str] | None = Query(default=None),
    current_user: dict[str, str] = Depends(get_current_user),
    creator_service: CreatorService = Depends(get_creator_service),
) -> dict[str, object]:
    return await creator_service.queue_platform_sync(platforms, user_id=UUID(current_user["id"]))


@router.get("/profile/public/{creator_id}")
async def public_profile(creator_id: UUID, creator_service: CreatorService = Depends(get_creator_service)) -> dict[str, object]:
    return await creator_service.get_public_profile(creator_id)
