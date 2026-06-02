from app.ingestion.connectors.apple_music import AppleMusicConnector
from app.ingestion.connectors.facebook import FacebookConnector
from app.ingestion.connectors.instagram import InstagramConnector
from app.ingestion.connectors.spotify import SpotifyConnector
from app.ingestion.connectors.tiktok import TikTokConnector
from app.ingestion.connectors.twitter import TwitterConnector
from app.ingestion.connectors.youtube import YouTubeConnector
from app.ingestion.base_connector import BaseConnector

CONNECTOR_REGISTRY: dict[str, type[BaseConnector]] = {
    "apple_music": AppleMusicConnector,
    "facebook": FacebookConnector,
    "instagram": InstagramConnector,
    "spotify": SpotifyConnector,
    "tiktok": TikTokConnector,
    "twitter": TwitterConnector,
    "youtube": YouTubeConnector,
}


def get_connector(
    platform: str,
    access_token: str | None = None,
    refresh_token: str | None = None,
) -> BaseConnector:
    connector_class = CONNECTOR_REGISTRY.get(platform.lower())
    if connector_class is None:
        raise ValueError(f"Unsupported platform: {platform}")
    return connector_class(access_token=access_token, refresh_token=refresh_token)
