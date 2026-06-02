from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.v1.schemas import ForecastRequest
from app.dependencies import get_current_user
from app.dependencies import get_forecast_service
from app.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.post("/campaign")
async def forecast_campaign(
    payload: ForecastRequest,
    current_user: dict[str, str] = Depends(get_current_user),
    forecast_service: ForecastService = Depends(get_forecast_service),
) -> dict[str, object]:
    return await forecast_service.forecast_campaign(payload)
