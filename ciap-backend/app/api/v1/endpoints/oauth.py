from fastapi import APIRouter, Depends, Query, Request

from app.dependencies import get_oauth_service, get_current_user
from app.services.oauth_service import OAuthService

router = APIRouter(prefix="/oauth", tags=["oauth"])


@router.get("/{platform}/connect")
async def connect(platform: str, oauth_service: OAuthService = Depends(get_oauth_service)) -> dict[str, object]:
    return await oauth_service.connect(platform)


@router.get("/{platform}/callback")
async def callback(
    platform: str, 
    request: Request,
    current_user: dict[str, str] = Depends(get_current_user),
    oauth_service: OAuthService = Depends(get_oauth_service)
) -> dict[str, object]:
    return await oauth_service.callback(platform, request, current_user["id"])
