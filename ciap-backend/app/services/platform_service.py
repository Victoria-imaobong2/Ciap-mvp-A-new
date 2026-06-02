from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas import PlatformSyncRequest
from app.db.repositories import SQLAlchemyPlatformTokenRepository


@dataclass(slots=True)
class PlatformService:
    session: AsyncSession

    async def list_platforms(self, user_id: UUID | None = None) -> dict[str, Any]:
        connected_platforms = [] if user_id is None else await SQLAlchemyPlatformTokenRepository(self.session).list_for_user(user_id)
        return {
            "success": True,
            "message": "Platforms retrieved",
            "data": {
                "items": [
                    {
                        "platform": platform.platform_name,
                        "platform_user_id": platform.platform_user_id,
                        "is_active": platform.is_active,
                        "last_synced_at": platform.last_synced_at,
                    }
                    for platform in connected_platforms
                ],
            },
        }

    async def sync_platforms(self, payload: PlatformSyncRequest | None = None, user_id: UUID | None = None) -> dict[str, Any]:
        connected_platforms = [] if user_id is None else await SQLAlchemyPlatformTokenRepository(self.session).list_for_user(user_id)
        resolved_platforms = payload.platforms if payload is not None and payload.platforms is not None else [platform.platform_name for platform in connected_platforms]
        from app.services.sync_service import sync_platform_for_user

        return await sync_platform_for_user(self.session, str(user_id), resolved_platforms)
