from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.db.repositories import (
    SQLAlchemyAudienceSnapshotRepository,
    SQLAlchemyContentRepository,
    SQLAlchemyCreatorProfileRepository,
    SQLAlchemyInfluenceScoreRepository,
    SQLAlchemyPlatformTokenRepository,
    SQLAlchemyUserRepository,
)
from app.ml.audience_segmenter import AudienceSegmenter
from app.ml.influence_scorer import InfluenceScorer
from app.utils.pagination import paginate_items
from app.utils.date_utils import isoformat
from app.utils.serialization import model_to_dict, models_to_dicts


@dataclass(slots=True)
class DiscoverService:
    session: AsyncSession

    async def _catalog(self) -> list[dict[str, Any]]:
        creator_repo = SQLAlchemyCreatorProfileRepository(self.session)
        user_repo = SQLAlchemyUserRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)
        token_repo = SQLAlchemyPlatformTokenRepository(self.session)

        profiles = await creator_repo.list_public(limit=1000, offset=0)
        catalog: list[dict[str, Any]] = []
        for profile in profiles:
            user = await user_repo.get_by_id(UUID(profile.user_id))
            score = await score_repo.latest_for_creator(UUID(profile.user_id))
            tokens = await token_repo.list_for_user(UUID(profile.user_id))
            if user is None:
                continue

            platform_name = profile.top_platform or (tokens[0].platform_name if tokens else None)
            catalog.append(
                {
                    "id": user.id,
                    "full_name": user.full_name or user.email,
                    "category": profile.category,
                    "location": profile.location,
                    "language_preference": user.language_preference,
                    "followers": profile.followers or 0,
                    "influence_score": score.score if score is not None else (profile.influence_score or 0.0),
                    "is_public": profile.is_public,
                    "top_platform": platform_name.upper() if platform_name is not None else None,
                    "platform": platform_name.lower() if platform_name is not None else None,
                    "social_links": profile.social_links or {},
                }
            )

        return catalog

    async def list_creators(
        self,
        query: str | None = None,
        niche: str | None = None,
        location: str | None = None,
        platform: str | None = None,
        min_followers: int | None = None,
        max_followers: int | None = None,
        min_score: float | None = None,
        max_score: float | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> dict[str, Any]:
        creators = await self._catalog()
        if query is not None:
            lowered = query.lower()
            creators = [item for item in creators if lowered in item["full_name"].lower() or lowered in item["category"].lower()]
        if niche is not None:
            creators = [item for item in creators if item["category"].lower() == niche.lower()]
        if location is not None:
            creators = [item for item in creators if item["location"].lower() == location.lower()]
        if platform is not None:
            creators = [item for item in creators if item["platform"].lower() == platform.lower()]
        if min_followers is not None:
            creators = [item for item in creators if item["followers"] >= min_followers]
        if max_followers is not None:
            creators = [item for item in creators if item["followers"] <= max_followers]
        if min_score is not None:
            creators = [item for item in creators if item["influence_score"] >= min_score]
        if max_score is not None:
            creators = [item for item in creators if item["influence_score"] <= max_score]

        page_result = paginate_items(creators, page=page, limit=limit)
        return {
            "success": True,
            "message": "Creators discovered",
            "data": {"items": page_result.items, "meta": asdict(page_result.meta)},
        }

    async def get_creator_detail(self, creator_id: UUID) -> dict[str, Any]:
        user_repo = SQLAlchemyUserRepository(self.session)
        profile_repo = SQLAlchemyCreatorProfileRepository(self.session)
        score_repo = SQLAlchemyInfluenceScoreRepository(self.session)
        audience_repo = SQLAlchemyAudienceSnapshotRepository(self.session)
        content_repo = SQLAlchemyContentRepository(self.session)
        token_repo = SQLAlchemyPlatformTokenRepository(self.session)

        user = await user_repo.get_by_id(creator_id)
        profile = await profile_repo.get_by_user_id(creator_id)
        if user is None or profile is None:
            raise NotFoundError("Creator not found")

        audience_snapshot = await audience_repo.latest_for_creator(creator_id)
        audience_payload = model_to_dict(audience_snapshot) if audience_snapshot is not None else {}
        latest_score = await score_repo.latest_for_creator(creator_id)
        if latest_score is None:
            score_result = InfluenceScorer().score({"followers": profile.followers or 0, "content_count": 0, "influence_score": profile.influence_score or 0.0}, audience_payload)
            score_payload: dict[str, Any] = asdict(score_result)
        else:
            score_payload = model_to_dict(latest_score)
        segments = [asdict(segment) for segment in AudienceSegmenter().segment(audience_payload)] if audience_payload else []
        content_highlights = models_to_dicts(await content_repo.get_by_creator(creator_id, limit=3, offset=0))
        platforms = await token_repo.list_for_user(creator_id)
        return {
            "success": True,
            "message": "Creator detail retrieved",
            "data": {
                "id": str(creator_id),
                "full_name": user.full_name or user.email,
                "category": profile.category,
                "location": profile.location,
                "followers": profile.followers or 0,
                "social_links": profile.social_links or {},
                "bio": profile.bio,
                "platforms": [token.platform_name for token in platforms],
                "score": {"current": score_payload.get("score", 0.0), "model_version": score_payload.get("model_version")},
                "audience": audience_payload,
                "content_highlights": content_highlights,
                "segments": segments,
            },
        }

    async def compare_creators(self) -> dict[str, Any]:
        catalog = await self._catalog()
        ranked_catalog = sorted(catalog, key=lambda item: (item["influence_score"], item["followers"]), reverse=True)
        return {
            "success": True,
            "message": "Creator comparison generated",
            "data": {
                "items": [
                    {
                        "creator_id": creator["id"],
                        "full_name": creator["full_name"],
                        "influence_score": creator["influence_score"],
                        "engagement_rate": round((creator["followers"] or 0) / max(creator["followers"] or 1, 1) * 0.05, 4),
                        "audience_fit": round(min((creator["followers"] or 0) / 100000.0, 1.0), 2),
                        "social_links": creator["social_links"],
                    }
                    for creator in ranked_catalog[:2]
                ]
            },
        }
