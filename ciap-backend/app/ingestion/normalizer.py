from __future__ import annotations

from collections.abc import Mapping
from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class NormalizedContentItem:
    platform: str
    external_id: str | None = None
    media_type: str | None = None
    caption: str | None = None
    permalink: str | None = None
    posted_at: str | None = None
    synced_at: str | None = None


@dataclass(slots=True)
class NormalizedMetricSnapshot:
    platform: str
    views: float | None = None
    likes: float | None = None
    comments: float | None = None
    shares: float | None = None
    saves: float | None = None
    watch_time_seconds: float | None = None
    extra: dict[str, Any] = field(default_factory=dict)


def _first_value(payload: Mapping[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in payload and payload[key] is not None:
            return payload[key]
    return None


def _as_float(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return float(int(value))
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def normalize_content_item(platform: str, raw_payload: Mapping[str, Any]) -> NormalizedContentItem:
    return NormalizedContentItem(
        platform=platform.upper(),
        external_id=str(_first_value(raw_payload, "external_id", "id", "content_id")) if _first_value(raw_payload, "external_id", "id", "content_id") is not None else None,
        media_type=str(_first_value(raw_payload, "media_type", "type", "kind")) if _first_value(raw_payload, "media_type", "type", "kind") is not None else None,
        caption=_first_value(raw_payload, "caption", "description", "text"),
        permalink=_first_value(raw_payload, "permalink", "url", "link"),
        posted_at=_first_value(raw_payload, "posted_at", "published_at", "created_at"),
        synced_at=_first_value(raw_payload, "synced_at", "updated_at"),
    )


def normalize_metric_snapshot(platform: str, raw_payload: Mapping[str, Any]) -> NormalizedMetricSnapshot:
    known_keys = {"views", "likes", "comments", "shares", "saves", "watch_time_seconds"}
    extra = {key: value for key, value in raw_payload.items() if key not in known_keys}
    return NormalizedMetricSnapshot(
        platform=platform.upper(),
        views=_as_float(_first_value(raw_payload, "views", "view_count", "play_count")),
        likes=_as_float(_first_value(raw_payload, "likes", "like_count")),
        comments=_as_float(_first_value(raw_payload, "comments", "comment_count")),
        shares=_as_float(_first_value(raw_payload, "shares", "share_count", "reposts")),
        saves=_as_float(_first_value(raw_payload, "saves", "save_count", "bookmarks")),
        watch_time_seconds=_as_float(_first_value(raw_payload, "watch_time_seconds", "watch_time")),
        extra=extra,
    )


def normalize_platform_payload(platform: str, raw_payload: Mapping[str, Any]) -> dict[str, Any]:
    content = normalize_content_item(platform, raw_payload)
    metrics = normalize_metric_snapshot(platform, raw_payload)
    return {"platform": platform.upper(), "content": asdict(content), "metrics": asdict(metrics)}
