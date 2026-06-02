from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories import (
    SQLAlchemyCampaignRepository,
    SQLAlchemyCreatorProfileRepository,
    SQLAlchemyPlatformTokenRepository,
    SQLAlchemyScoreRepository,
    SQLAlchemyUserRepository,
)
from app.utils.serialization import models_to_dicts


@dataclass(slots=True)
class AdminService:
    session: AsyncSession

    async def get_dashboard(self) -> dict[str, Any]:
        user_repo = SQLAlchemyUserRepository(self.session)
        creator_repo = SQLAlchemyCreatorProfileRepository(self.session)
        campaign_repo = SQLAlchemyCampaignRepository(self.session)
        platform_repo = SQLAlchemyPlatformTokenRepository(self.session)
        score_repo = SQLAlchemyScoreRepository(self.session)

        users_total = await user_repo.count()
        creators_total = await creator_repo.count()
        campaigns_total = await campaign_repo.count()
        platform_tokens_total = await platform_repo.count()
        scores_total = await score_repo.count()

        return {
            "success": True,
            "message": "Admin dashboard retrieved",
            "data": {
                "summary": {
                    "users_total": users_total,
                    "creators_total": creators_total,
                    "campaigns_total": campaigns_total,
                    "platform_tokens_total": platform_tokens_total,
                    "scores_total": scores_total,
                }
            },
        }

    async def list_users(self) -> dict[str, Any]:
        users = await SQLAlchemyUserRepository(self.session).list(limit=100, offset=0)
        return {"success": True, "message": "Users retrieved", "data": {"items": models_to_dicts(users)}}

    async def get_platform_health(self) -> dict[str, Any]:
        platforms = await SQLAlchemyPlatformTokenRepository(self.session).list(limit=100, offset=0)
        connected = [platform for platform in platforms if platform.is_active]
        by_platform: dict[str, int] = {}
        for platform in platforms:
            by_platform[platform.platform_name] = by_platform.get(platform.platform_name, 0) + 1

        return {
            "success": True,
            "message": "Platform health retrieved",
            "data": {
                "connected_accounts": len(connected),
                "inactive_accounts": len(platforms) - len(connected),
                "by_platform": by_platform,
            },
        }
