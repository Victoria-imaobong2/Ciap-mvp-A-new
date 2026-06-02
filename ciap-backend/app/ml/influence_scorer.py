from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping

from app.ml.feature_engineering import extract_numeric_features
from app.utils.date_utils import isoformat, utcnow


@dataclass(slots=True)
class InfluenceScoreResult:
    score: float
    model_version: str
    computed_at: str
    components: dict[str, float]


@dataclass(slots=True)
class InfluenceScorer:
    model_version: str = "weekly_weighted_v1"
    weights: dict[str, float] = field(
        default_factory=lambda: {
            "engagement": 0.35,
            "growth": 0.25,
            "consistency": 0.2,
            "audience_quality": 0.2,
        }
    )

    def score(self, metrics: Mapping[str, Any], audience: Mapping[str, Any] | None = None) -> InfluenceScoreResult:
        feature_map = extract_numeric_features(metrics)
        audience_map = extract_numeric_features(audience or {})

        engagement_component = min(
            (feature_map.get("engagement_rate", 0.0) * 50.0)
            + (feature_map.get("likes", 0.0) / 1000.0)
            + (feature_map.get("comments", 0.0) / 2000.0),
            35.0,
        )
        growth_component = min(
            (feature_map.get("growth_rate", 0.0) * 60.0)
            + (feature_map.get("follower_growth", 0.0) * 60.0),
            25.0,
        )
        consistency_component = min(
            (feature_map.get("content_count", 0.0) / 30.0) * 20.0,
            20.0,
        )
        audience_quality_component = min(
            (audience_map.get("quality", 0.0) * 20.0)
            + (audience_map.get("interest_tags.count", 0.0) * 1.5),
            20.0,
        )

        score = round(
            (engagement_component * self.weights["engagement"])
            + (growth_component * self.weights["growth"])
            + (consistency_component * self.weights["consistency"])
            + (audience_quality_component * self.weights["audience_quality"]),
            2,
        )
        return InfluenceScoreResult(
            score=min(score, 100.0),
            model_version=self.model_version,
            computed_at=isoformat(utcnow()),
            components={
                "engagement_component": round(engagement_component, 2),
                "growth_component": round(growth_component, 2),
                "consistency_component": round(consistency_component, 2),
                "audience_quality_component": round(audience_quality_component, 2),
            },
        )
