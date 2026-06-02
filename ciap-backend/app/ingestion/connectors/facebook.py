from __future__ import annotations

from app.ingestion.base_connector import BaseConnector


class FacebookConnector(BaseConnector):
    @property
    def platform_name(self) -> str:
        return "facebook"
