from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies import get_admin_service
from app.dependencies import get_current_user
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
async def dashboard(
    current_user: dict[str, str] = Depends(get_current_user),
    admin_service: AdminService = Depends(get_admin_service),
) -> dict[str, object]:
    return await admin_service.get_dashboard()


@router.get("/users")
async def users(
    current_user: dict[str, str] = Depends(get_current_user),
    admin_service: AdminService = Depends(get_admin_service),
) -> dict[str, object]:
    return await admin_service.list_users()


@router.get("/platform-health")
async def platform_health(
    current_user: dict[str, str] = Depends(get_current_user),
    admin_service: AdminService = Depends(get_admin_service),
) -> dict[str, object]:
    return await admin_service.get_platform_health()
