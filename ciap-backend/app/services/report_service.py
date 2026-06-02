from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(slots=True)
class ReportService:
    session: AsyncSession

    async def export_campaign_report(self, campaign_id: UUID, export_format: str = "pdf") -> dict[str, Any]:
        from app.tasks.report_tasks import generate_campaign_report

        task_result = generate_campaign_report.delay(str(campaign_id), export_format)
        return {
            "success": True,
            "message": "Report export queued",
            "data": {
                "campaign_id": str(campaign_id),
                "format": export_format,
                "status": "queued",
                "task": generate_campaign_report.name,
                "task_id": task_result.id,
            },
        }
