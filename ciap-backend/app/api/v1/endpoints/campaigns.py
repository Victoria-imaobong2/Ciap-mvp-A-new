from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.v1.schemas import CampaignCreateRequest, CampaignUpdateRequest
from app.dependencies import get_campaign_service
from app.dependencies import get_current_user
from app.services.campaign_service import CampaignService

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("")
async def list_campaigns(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    status: str | None = Query(default=None),
    current_user: dict[str, str] = Depends(get_current_user),
    campaign_service: CampaignService = Depends(get_campaign_service),
) -> dict[str, object]:
    return await campaign_service.list_campaigns(owner_id=UUID(current_user["id"]), page=page, limit=limit, status=status)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_campaign(
    payload: CampaignCreateRequest,
    current_user: dict[str, str] = Depends(get_current_user),
    campaign_service: CampaignService = Depends(get_campaign_service),
) -> dict[str, object]:
    return await campaign_service.create_campaign(UUID(current_user["id"]), payload)


@router.get("/{campaign_id}")
async def campaign_detail(
    campaign_id: UUID,
    current_user: dict[str, str] = Depends(get_current_user),
    campaign_service: CampaignService = Depends(get_campaign_service),
) -> dict[str, object]:
    return await campaign_service.get_campaign(campaign_id)


@router.put("/{campaign_id}")
async def update_campaign(
    campaign_id: UUID,
    payload: CampaignUpdateRequest,
    current_user: dict[str, str] = Depends(get_current_user),
    campaign_service: CampaignService = Depends(get_campaign_service),
) -> dict[str, object]:
    return await campaign_service.update_campaign(campaign_id, payload)


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: UUID,
    current_user: dict[str, str] = Depends(get_current_user),
    campaign_service: CampaignService = Depends(get_campaign_service),
) -> dict[str, object]:
    return await campaign_service.delete_campaign(campaign_id)
