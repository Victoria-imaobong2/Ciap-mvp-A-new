from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ConflictError
from app.db.repositories import (
    SQLAlchemyCampaignRepository,
    SQLAlchemyCampaignMetricRepository,
    SQLAlchemyCreatorProfileRepository,
    SQLAlchemySavedCreatorRepository,
    SQLAlchemySmeProfileRepository,
    SQLAlchemyUserRepository,
)
from app.services.discover_service import DiscoverService
from app.db.models.saved_creator import SavedCreator
from app.utils.serialization import model_to_dict, models_to_dicts


@dataclass(slots=True)
class SmeService:
    session: AsyncSession

    async def save_creator(self, user_id: UUID, creator_id: UUID) -> dict[str, Any]:
        saved_repo = SQLAlchemySavedCreatorRepository(self.session)
        existing = await saved_repo.find(user_id, creator_id)
        if existing is not None:
            raise ConflictError("Creator already saved")

        saved = SavedCreator(
            user_id=str(user_id),
            creator_id=str(creator_id),
        )
        await saved_repo.add(saved)
        return {"success": True, "message": "Creator saved", "data": {"id": saved.id}}

    async def unsave_creator(self, user_id: UUID, creator_id: UUID) -> dict[str, Any]:
        saved_repo = SQLAlchemySavedCreatorRepository(self.session)
        existing = await saved_repo.find(user_id, creator_id)
        if existing is None:
            raise NotFoundError("Saved creator not found")

        await saved_repo.delete(UUID(existing.id))
        return {"success": True, "message": "Creator unsaved"}

    async def list_saved_creators(self, user_id: UUID) -> dict[str, Any]:
        saved_repo = SQLAlchemySavedCreatorRepository(self.session)
        saved_entries = await saved_repo.list_by_user(user_id)

        creator_ids = [UUID(entry.creator_id) for entry in saved_entries]
        if not creator_ids:
            return {"success": True, "message": "Saved creators", "data": []}

        creator_repo = SQLAlchemyCreatorProfileRepository(self.session)
        user_repo = SQLAlchemyUserRepository(self.session)

        items: list[dict[str, Any]] = []
        for creator_id in creator_ids:
            profile = await creator_repo.get_by_user_id(creator_id)
            user = await user_repo.get_by_id(creator_id)
            if user is None:
                continue
            items.append({
                "id": str(creator_id),
                "full_name": user.full_name or user.email,
                "category": profile.category if profile else None,
                "location": profile.location if profile else None,
                "followers": profile.followers or 0 if profile else 0,
                "influence_score": profile.influence_score or 0.0 if profile else 0.0,
                "platform": profile.top_platform if profile else None,
            })

        return {"success": True, "message": "Saved creators", "data": items}

    async def get_dashboard(self, owner_id: UUID | None = None) -> dict[str, Any]:
        if owner_id is None:
            return {
                "success": True,
                "message": "SME dashboard retrieved",
                "data": {"summary": {"active_campaigns": 0, "available_creators": 0, "recommended_budget": 0}, "recommended_creators": []},
            }

        user_repo = SQLAlchemyUserRepository(self.session)
        profile_repo = SQLAlchemySmeProfileRepository(self.session)
        campaign_repo = SQLAlchemyCampaignRepository(self.session)

        user = await user_repo.get_by_id(owner_id)
        profile = await profile_repo.get_by_user_id(owner_id)
        if user is None:
            raise NotFoundError("SME user not found")

        campaigns = await campaign_repo.get_by_owner(owner_id, limit=1000, offset=0)
        discover_service = DiscoverService(session=self.session)
        creators = await discover_service.list_creators(limit=3)
        active_campaigns = [campaign for campaign in campaigns if str(campaign.status).upper() in {"DRAFT", "ACTIVE", "PAUSED"}]

        total_spend = sum(c.budget or 0 for c in campaigns)
        total_reach = 0
        total_engagement = 0
        for c in campaigns:
            latest = await SQLAlchemyCampaignMetricRepository(self.session).latest_for_campaign(UUID(c.id))
            if latest is not None:
                m = model_to_dict(latest).get("metrics", {}) or {}
                total_reach += int(m.get("reach", 0) or 0)
                total_engagement += int(m.get("engagement", 0) or 0)
        roi = round(total_reach / max(total_spend, 1), 1)

        return {
            "success": True,
            "message": "SME dashboard retrieved",
            "data": {
                "company": {
                    "user_id": user.id,
                    "company_name": profile.company_name if profile is not None else None,
                    "industry": profile.industry if profile is not None else None,
                },
                "summary": {
                    "active_campaigns": len(active_campaigns),
                    "available_creators": creators["data"]["meta"]["total_items"],
                    "recommended_budget": 2000000 if profile is None or profile.industry is not None else 1500000,
                    "total_spend": total_spend,
                    "total_reach": total_reach,
                    "total_engagement": total_engagement,
                    "roi": roi,
                },
                "campaigns": models_to_dicts(campaigns),
                "recommended_creators": creators["data"]["items"],
            },
        }
