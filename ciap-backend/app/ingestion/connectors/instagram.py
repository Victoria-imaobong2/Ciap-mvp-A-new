from __future__ import annotations

from app.ingestion.base_connector import BaseConnector


class InstagramConnector(BaseConnector):
    @property
    def platform_name(self) -> str:
        return "instagram"
