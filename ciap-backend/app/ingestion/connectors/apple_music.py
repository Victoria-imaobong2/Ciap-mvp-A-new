from __future__ import annotations

from app.ingestion.base_connector import BaseConnector


class AppleMusicConnector(BaseConnector):
    @property
    def platform_name(self) -> str:
        return "apple_music"
