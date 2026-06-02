from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.dependencies import get_sme_service, get_discover_service
from app.dependencies import get_current_user
from app.services.discover_service import DiscoverService
from app.services.sme_service import SmeService

router = APIRouter(prefix="/sme", tags=["sme"])


@router.get("/dashboard")
async def dashboard(
    current_user: dict[str, str] = Depends(get_current_user),
    sme_service: SmeService = Depends(get_sme_service),
) -> dict[str, object]:
    return await sme_service.get_dashboard(UUID(current_user["id"]))


@router.post("/saved-creators/{creator_id}")
async def save_creator(
    creator_id: UUID,
    current_user: dict[str, str] = Depends(get_current_user),
    sme_service: SmeService = Depends(get_sme_service),
) -> dict[str, object]:
    return await sme_service.save_creator(UUID(current_user["id"]), creator_id)


@router.delete("/saved-creators/{creator_id}")
async def unsave_creator(
    creator_id: UUID,
    current_user: dict[str, str] = Depends(get_current_user),
    sme_service: SmeService = Depends(get_sme_service),
) -> dict[str, object]:
    return await sme_service.unsave_creator(UUID(current_user["id"]), creator_id)


@router.get("/saved-creators")
async def list_saved_creators(
    current_user: dict[str, str] = Depends(get_current_user),
    sme_service: SmeService = Depends(get_sme_service),
) -> dict[str, object]:
    return await sme_service.list_saved_creators(UUID(current_user["id"]))
