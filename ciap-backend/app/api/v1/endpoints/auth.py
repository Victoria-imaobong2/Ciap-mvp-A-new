from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.v1.schemas import (
    AuthLoginRequest, 
    AuthRefreshRequest, 
    AuthRegisterRequest,
    AuthVerifyEmailRequest,
    AuthForgotPasswordRequest,
    AuthResetPasswordRequest
)
from app.dependencies import get_auth_service
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: AuthRegisterRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict[str, object]:
    return await auth_service.register(payload)


@router.post("/login")
async def login(payload: AuthLoginRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict[str, object]:
    return await auth_service.login(payload)


@router.post("/refresh")
async def refresh(payload: AuthRefreshRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict[str, object]:
    return await auth_service.refresh(payload)


@router.post("/verify-email")
async def verify_email(payload: AuthVerifyEmailRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict[str, object]:
    return await auth_service.verify_email(payload)


@router.post("/forgot-password")
async def forgot_password(payload: AuthForgotPasswordRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict[str, object]:
    return await auth_service.forgot_password(payload)


@router.post("/reset-password")
async def reset_password(payload: AuthResetPasswordRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict[str, object]:
    return await auth_service.reset_password(payload)
