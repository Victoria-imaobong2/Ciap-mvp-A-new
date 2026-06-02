from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas import (
    AuthLoginRequest, 
    AuthRegisterRequest, 
    AuthRefreshRequest,
    AuthVerifyEmailRequest,
    AuthForgotPasswordRequest,
    AuthResetPasswordRequest
)
from app.core.exceptions import ConflictError, UnauthorizedError, NotFoundError
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password, decode_token
from app.config import settings
from app.db.models.user import User
from app.db.repositories.user_repo import SQLAlchemyUserRepository

@dataclass(slots=True)
class AuthService:
    session: AsyncSession

    async def register(self, payload: AuthRegisterRequest) -> dict[str, Any]:
        repository = SQLAlchemyUserRepository(self.session)
        existing_user = await repository.get_by_email(payload.email)
        if existing_user is not None:
            raise ConflictError("A user with this email already exists")

        user = User(
            email=payload.email,
            hashed_password=hash_password(payload.password),
            role=payload.role,
            full_name=payload.full_name,
            language_preference=payload.language_preference,
        )
        await repository.add(user)
        await self.session.commit()

        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "role": user.role,
                "is_onboarded": user.is_onboarded,
                "full_name": user.full_name,
                "language_preference": user.language_preference,
                "access_token": create_access_token(user.id, extra_claims={"email": user.email, "role": user.role, "is_onboarded": user.is_onboarded}),
                "refresh_token": create_refresh_token(user.id, extra_claims={"email": user.email, "role": user.role, "is_onboarded": user.is_onboarded}),
                "token_type": "bearer",
                "expires_in": settings.access_token_expire_minutes * 60,
            },
        }

    async def login(self, payload: AuthLoginRequest) -> dict[str, Any]:
        repository = SQLAlchemyUserRepository(self.session)
        user = await repository.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")

        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "role": user.role,
                "is_onboarded": user.is_onboarded,
                "full_name": user.full_name,
                "language_preference": user.language_preference,
                "access_token": create_access_token(user.id, extra_claims={"email": user.email, "role": user.role, "is_onboarded": user.is_onboarded}),
                "refresh_token": create_refresh_token(user.id, extra_claims={"email": user.email, "role": user.role, "is_onboarded": user.is_onboarded}),
                "token_type": "bearer",
                "expires_in": settings.access_token_expire_minutes * 60,
            },
        }

    async def refresh(self, payload: AuthRefreshRequest) -> dict[str, Any]:
        repository = SQLAlchemyUserRepository(self.session)
        try:
            token_payload = decode_token(payload.refresh_token)
            if token_payload.get("token_type") != "refresh":
                raise UnauthorizedError("Invalid token type")
            user_id = UUID(str(token_payload.get("sub")))
        except (TypeError, ValueError, KeyError):
            raise UnauthorizedError("Invalid or expired refresh token")

        user = await repository.get_by_id(user_id)
        if user is None:
            raise UnauthorizedError("User not found")

        return {
            "success": True,
            "message": "Token refreshed successfully",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "role": user.role,
                "is_onboarded": user.is_onboarded,
                "access_token": create_access_token(user.id, extra_claims={"email": user.email, "role": user.role, "is_onboarded": user.is_onboarded}),
                "refresh_token": create_refresh_token(user.id, extra_claims={"email": user.email, "role": user.role, "is_onboarded": user.is_onboarded}),
                "token_type": "bearer",
                "expires_in": settings.access_token_expire_minutes * 60,
            },
        }

    async def verify_email(self, payload: AuthVerifyEmailRequest) -> dict[str, Any]:
        # For MVP, we use a static OTP '1234' as per frontend design
        # In production, this would check against a Redis/DB stored OTP
        if payload.otp != "1234":
            raise UnauthorizedError("Invalid verification code")
        
        return {
            "success": True,
            "message": "Email verified successfully",
        }

    async def forgot_password(self, payload: AuthForgotPasswordRequest) -> dict[str, Any]:
        repository = SQLAlchemyUserRepository(self.session)
        user = await repository.get_by_email(payload.email)
        if user is None:
            # We return success anyway to prevent email enumeration
            return {
                "success": True,
                "message": "If an account exists, a reset link has been sent",
            }
        
        # Here we would generate a token and send an email
        # For now, we just return success
        return {
            "success": True,
            "message": "Reset link sent successfully",
        }

    async def reset_password(self, payload: AuthResetPasswordRequest) -> dict[str, Any]:
        try:
            token_payload = decode_token(payload.token)
            user_id = UUID(str(token_payload.get("sub")))
        except Exception:
            raise UnauthorizedError("Invalid or expired reset token")
            
        repository = SQLAlchemyUserRepository(self.session)
        user = await repository.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")
            
        user.hashed_password = hash_password(payload.new_password)
        await repository.update(user)
        await self.session.commit()
        
        return {
            "success": True,
            "message": "Password reset successfully",
        }
