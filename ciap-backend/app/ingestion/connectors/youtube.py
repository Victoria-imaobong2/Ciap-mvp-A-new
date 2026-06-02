from __future__ import annotations

from typing import Any

import httpx

from app.ingestion.base_connector import BaseConnector


class YouTubeConnector(BaseConnector):
    @property
    def platform_name(self) -> str:
        return "youtube"

    async def fetch_content(self, limit: int = 20) -> list[dict[str, Any]]:
        if not self.access_token:
            return []

        headers = {"Authorization": f"Bearer {self.access_token}"}

        async with httpx.AsyncClient() as client:
            channel_resp = await client.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={"part": "contentDetails", "mine": "true"},
                headers=headers,
            )
            if channel_resp.status_code != 200:
                return []

            channel_data = channel_resp.json()
            items = channel_data.get("items", [])
            if not items:
                return []

            uploads_playlist_id = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

            playlist_resp = await client.get(
                "https://www.googleapis.com/youtube/v3/playlistItems",
                params={
                    "part": "snippet",
                    "playlistId": uploads_playlist_id,
                    "maxResults": limit,
                },
                headers=headers,
            )
            if playlist_resp.status_code != 200:
                return []

            video_ids: list[str] = []
            playlist_items = playlist_resp.json().get("items", [])
            for item in playlist_items:
                video_id = item["snippet"]["resourceId"]["videoId"]
                video_ids.append(video_id)

            if not video_ids:
                return []

            stats_resp = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={
                    "part": "statistics,snippet",
                    "id": ",".join(video_ids),
                },
                headers=headers,
            )
            if stats_resp.status_code != 200:
                return []

            videos_data = stats_resp.json().get("items", [])
            channel_id = channel_data["items"][0].get("id")

            results: list[dict[str, Any]] = []
            for video in videos_data:
                snippet = video.get("snippet", {})
                statistics = video.get("statistics", {})
                thumbnails = snippet.get("thumbnails", {}) or {}
                thumbnail_url = (
                    thumbnails.get("high", {}).get("url")
                    or thumbnails.get("medium", {}).get("url")
                    or thumbnails.get("default", {}).get("url")
                )
                results.append(
                    {
                        "external_id": video["id"],
                        "media_type": "video",
                        "caption": snippet.get("description"),
                        "permalink": f"https://www.youtube.com/watch?v={video['id']}",
                        "posted_at": snippet.get("publishedAt"),
                        "title": snippet.get("title"),
                        "thumbnail_url": thumbnail_url,
                        "views": int(statistics.get("viewCount", 0)),
                        "likes": int(statistics.get("likeCount", 0)),
                        "comments": int(statistics.get("commentCount", 0)),
                        "channel_id": channel_id,
                    }
                )

            return results

    async def fetch_profile(self, external_user_id: str) -> dict[str, Any]:
        headers = {"Authorization": f"Bearer {self.access_token}"}
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={"part": "snippet,statistics", "mine": "true"},
                headers=headers,
            )
            if resp.status_code != 200:
                return {"platform": "youtube", "external_user_id": external_user_id}

            channel_data = resp.json()
            items = channel_data.get("items", [])
            if not items:
                return {"platform": "youtube", "external_user_id": external_user_id}

            snippet = items[0].get("snippet", {})
            statistics = items[0].get("statistics", {})

            return {
                "platform": "youtube",
                "external_user_id": items[0]["id"],
                "name": snippet.get("title"),
                "handle": external_user_id,
                "description": snippet.get("description"),
                "thumbnail_url": (snippet.get("thumbnails", {}) or {}).get("high", {}).get("url"),
                "subscribers": int(statistics.get("subscriberCount", 0)),
                "total_views": int(statistics.get("viewCount", 0)),
                "video_count": int(statistics.get("videoCount", 0)),
            }

    async def fetch_audience(self) -> dict[str, Any]:
        headers = {"Authorization": f"Bearer {self.access_token}"}
        results: dict[str, Any] = {
            "age_distribution": {},
            "gender_distribution": {},
            "location_distribution": {},
        }

        async with httpx.AsyncClient() as client:
            demog_resp = await client.get(
                "https://youtubeanalytics.googleapis.com/v2/reports",
                params={
                    "ids": "channel==MINE",
                    "dimensions": "ageGroup,gender",
                    "metrics": "viewerPercentage",
                    "startDate": "2010-01-01",
                    "endDate": "2099-12-31",
                    "maxResults": 20,
                },
                headers=headers,
            )

            if demog_resp.status_code == 200:
                demog_data = demog_resp.json()
                rows = demog_data.get("rows", [])
                age_map: dict[str, float] = {}
                gender_map: dict[str, float] = {}
                for row in rows:
                    if len(row) >= 3:
                        age_group = row[0]
                        gender = row[1]
                        pct = float(row[2])
                        age_map[age_group] = age_map.get(age_group, 0.0) + pct
                        gender_map[gender] = gender_map.get(gender, 0.0) + pct
                results["age_distribution"] = age_map
                results["gender_distribution"] = gender_map

            geo_resp = await client.get(
                "https://youtubeanalytics.googleapis.com/v2/reports",
                params={
                    "ids": "channel==MINE",
                    "dimensions": "country",
                    "metrics": "views,estimatedMinutesWatched",
                    "sort": "-views",
                    "startDate": "2010-01-01",
                    "endDate": "2099-12-31",
                    "maxResults": 10,
                },
                headers=headers,
            )

            if geo_resp.status_code == 200:
                geo_data = geo_resp.json()
                geo_rows = geo_data.get("rows", [])
                total_views = sum(row[1] for row in geo_rows if len(row) >= 2)
                geo_map: dict[str, float] = {}
                for row in geo_rows:
                    if len(row) >= 2:
                        country = row[0]
                        views = float(row[1])
                        geo_map[country] = round((views / total_views) * 100, 1) if total_views > 0 else 0.0
                results["location_distribution"] = geo_map

        return results
