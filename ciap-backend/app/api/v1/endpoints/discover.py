from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_discover_service
from app.services.discover_service import DiscoverService

router = APIRouter(prefix="/discover", tags=["discover"])


@router.get("/creators")
async def list_creators(
    query: str | None = Query(default=None),
    niche: str | None = Query(default=None),
    location: str | None = Query(default=None),
    platform: str | None = Query(default=None),
    min_followers: int | None = Query(default=None, ge=0),
    max_followers: int | None = Query(default=None, ge=0),
    min_score: float | None = Query(default=None, ge=0),
    max_score: float | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    discover_service: DiscoverService = Depends(get_discover_service),
) -> dict[str, object]:
    return await discover_service.list_creators(
        query=query,
        niche=niche,
        location=location,
        platform=platform,
        min_followers=min_followers,
        max_followers=max_followers,
        min_score=min_score,
        max_score=max_score,
        page=page,
        limit=limit,
    )


@router.get("/creators/{creator_id}")
async def creator_detail(creator_id: UUID, discover_service: DiscoverService = Depends(get_discover_service)) -> dict[str, object]:
    return await discover_service.get_creator_detail(creator_id)


@router.post("/compare")
async def compare_creators(discover_service: DiscoverService = Depends(get_discover_service)) -> dict[str, object]:
    return await discover_service.compare_creators()
