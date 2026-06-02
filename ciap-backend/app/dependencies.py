from __future__ import annotations

from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, settings
from app.core.exceptions import UnauthorizedError
from app.core.security import decode_token
from app.db.repositories.user_repo import SQLAlchemyUserRepository
from app.db.session import get_db
from app.services import (
    AdminService,
    AnalyticsService,
    AuthService,
    CampaignService,
    CreatorService,
    DiscoverService,
    ForecastService,
    OAuthService,
    PlatformService,
    ReportService,
    ScoreService,
    SmeService,
)


bearer_scheme = HTTPBearer(auto_error=False)


def get_settings() -> Settings:
    return settings


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise UnauthorizedError("Missing or invalid authorization header")

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("token_type") != "access":
            raise UnauthorizedError("Invalid token type")
        user_id = UUID(str(payload.get("sub")))
    except (JWTError, TypeError, ValueError):
        raise UnauthorizedError("Invalid or expired token")

    user = await SQLAlchemyUserRepository(session).get_by_id(user_id)
    if user is None:
        raise UnauthorizedError("User not found")

    return {"id": user.id, "email": user.email, "role": user.role}


def get_auth_service(session: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(session=session)


def get_creator_service(session: AsyncSession = Depends(get_db)) -> CreatorService:
    return CreatorService(session=session)


def get_platform_service(session: AsyncSession = Depends(get_db)) -> PlatformService:
    return PlatformService(session=session)


def get_analytics_service(session: AsyncSession = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(session=session)


def get_score_service(session: AsyncSession = Depends(get_db)) -> ScoreService:
    return ScoreService(session=session)


def get_sme_service(session: AsyncSession = Depends(get_db)) -> SmeService:
    return SmeService(session=session)


def get_discover_service(session: AsyncSession = Depends(get_db)) -> DiscoverService:
    return DiscoverService(session=session)


def get_campaign_service(session: AsyncSession = Depends(get_db)) -> CampaignService:
    return CampaignService(session=session)


def get_forecast_service(session: AsyncSession = Depends(get_db)) -> ForecastService:
    return ForecastService(session=session)


def get_report_service(session: AsyncSession = Depends(get_db)) -> ReportService:
    return ReportService(session=session)


def get_admin_service(session: AsyncSession = Depends(get_db)) -> AdminService:
    return AdminService(session=session)


def get_oauth_service(session: AsyncSession = Depends(get_db)) -> OAuthService:
    return OAuthService(session=session)
