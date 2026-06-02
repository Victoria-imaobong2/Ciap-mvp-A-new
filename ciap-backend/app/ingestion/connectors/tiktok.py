from __future__ import annotations

from app.ingestion.base_connector import BaseConnector


class TikTokConnector(BaseConnector):
    @property
    def platform_name(self) -> str:
        return "tiktok"
