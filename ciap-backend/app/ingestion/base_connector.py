from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Mapping

from app.ingestion.normalizer import normalize_platform_payload


class BaseConnector(ABC):
    @property
    @abstractmethod
    def platform_name(self) -> str:
        raise NotImplementedError

    def __init__(self, access_token: str | None = None, refresh_token: str | None = None) -> None:
        self.access_token = access_token
        self.refresh_token = refresh_token

    async def connect(self) -> dict[str, Any]:
        return {"platform": self.platform_name, "connected": True}

    async def fetch_profile(self, external_user_id: str) -> dict[str, Any]:
        return {"platform": self.platform_name, "external_user_id": external_user_id}

    async def fetch_content(self, limit: int = 20) -> list[dict[str, Any]]:
        return []

    async def fetch_audience(self) -> dict[str, Any]:
        return {}

    async def fetch_metrics(self) -> dict[str, Any]:
        return {}

    def normalize(self, raw_payload: Mapping[str, Any] | None) -> dict[str, Any]:
        return normalize_platform_payload(self.platform_name, raw_payload or {})
