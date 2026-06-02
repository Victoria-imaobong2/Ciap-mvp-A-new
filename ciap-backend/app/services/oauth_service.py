from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession


from app.db.models.platform_token import PlatformToken
from app.db.repositories.platform_token_repo import SQLAlchemyPlatformTokenRepository
from app.utils.date_utils import utcnow
import uuid

from datetime import timedelta
from authlib.integrations.httpx_client import AsyncOAuth2Client
from app.config import settings

@dataclass(slots=True)
class OAuthService:
    session: AsyncSession

    async def connect(self, platform: str) -> dict[str, Any]:
        if platform.lower() == "youtube":
            client = AsyncOAuth2Client(
                client_id=settings.google_client_id,
                client_secret=settings.google_client_secret,
                scope="https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/userinfo.email",
                redirect_uri=settings.google_redirect_uri,
            )
            uri, state = client.create_authorization_url("https://accounts.google.com/o/oauth2/v2/auth")
            # In a real app, we'd store 'state' in Redis/Session to verify on callback
            return {
                "success": True,
                "message": "YouTube connect flow started",
                "data": {"auth_url": uri, "state": state}
            }

        # Mocking OAuth URL generation for other platforms
        mock_urls = {
            "instagram": "https://api.instagram.com/oauth/authorize?client_id=mock&redirect_uri=http://localhost:3000/oauth/callback/instagram&response_type=code&scope=user_profile,user_media",
            "tiktok": "https://www.tiktok.com/auth/authorize?client_key=mock&redirect_uri=http://localhost:3000/oauth/callback/tiktok&response_type=code&scope=user.info.basic,video.list"
        }
        
        return {
            "success": True, 
            "message": f"Connect flow started for {platform}", 
            "data": {
                "auth_url": mock_urls.get(platform.lower(), "http://localhost:3000/oauth/callback/mock")
            }
        }

    async def callback(self, platform: str, request: Any, user_id: str) -> dict[str, Any]:
        from app.db.models.platform_token import PlatformToken
        from app.db.repositories.platform_token_repo import SQLAlchemyPlatformTokenRepository
        from app.db.repositories.user_repo import SQLAlchemyUserRepository
        from app.utils.date_utils import utcnow
        from datetime import timedelta
        import uuid

        token_repo = SQLAlchemyPlatformTokenRepository(self.session)
        
        if platform == "youtube":
            try:
                # Get the code from the request query parameters
                code = request.query_params.get("code")
                if not code:
                    from app.core.exceptions import CIAPException
                    raise CIAPException("Missing OAuth code")

                # Use AsyncOAuth2Client directly for a stateless handshake
                client = AsyncOAuth2Client(
                    client_id=settings.google_client_id,
                    client_secret=settings.google_client_secret,
                )
                
                token_data = await client.fetch_token(
                    "https://oauth2.googleapis.com/token",
                    code=code,
                    grant_type="authorization_code",
                    redirect_uri=settings.google_redirect_uri,
                )
                
                # In a real app, we'd also call userinfo to get the platform_user_id (channel ID)
                platform_user_id = token_data.get("user_id") or f"yt_{uuid.uuid4().hex[:8]}"
                
                token_record = PlatformToken(
                    user_id=str(user_id),
                    platform_name="youtube",
                    platform_user_id=platform_user_id,
                    access_token=token_data.get("access_token"),
                    refresh_token=token_data.get("refresh_token"),
                    token_expires_at=utcnow() + timedelta(seconds=token_data.get("expires_in", 3600)),
                    is_active=True,
                    last_synced_at=utcnow()
                )
                await token_repo.add(token_record)
                
                # Mark user as onboarded
                user = await SQLAlchemyUserRepository(self.session).get_by_id(uuid.UUID(str(user_id)))
                if user:
                    user.is_onboarded = True
                
                await self.session.commit()

                try:
                    from app.services.sync_service import sync_platform_for_user
                    await sync_platform_for_user(self.session, str(user_id), ["youtube"])
                except Exception:
                    import traceback
                    traceback.print_exc()
                
                return {
                    "success": True,
                    "message": "YouTube connected successfully",
                    "data": {"platform": "youtube", "platform_user_id": platform_user_id}
                }
            except Exception as e:
                import traceback
                traceback.print_exc()
                from app.core.exceptions import UnauthorizedError
                raise UnauthorizedError(f"YouTube OAuth failed: {str(e)}")

        # Mocking OAuth callback handling for other platforms
        token = PlatformToken(
            user_id=uuid.UUID(str(user_id)),
            platform_name=platform.lower(),
            platform_user_id=f"mock_{platform}_{uuid.uuid4().hex[:8]}",
            access_token=f"mock_access_{uuid.uuid4().hex}",
            refresh_token=f"mock_refresh_{uuid.uuid4().hex}",
            expires_at=None,
            is_active=True,
            last_synced_at=utcnow()
        )
        
        await token_repo.add(token)
        await self.session.commit()
        
        return {
            "success": True, 
            "message": f"Successfully connected {platform}", 
            "data": {
                "platform": platform,
                "platform_user_id": token.platform_user_id
            }
        }
