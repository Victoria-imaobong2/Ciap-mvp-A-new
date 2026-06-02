from fastapi import APIRouter

from app.api.v1.endpoints import (
	admin,
	analytics,
	auth,
	campaigns,
	creator,
	discover,
	forecast,
	oauth,
	platforms,
	reports,
	score,
	sme,
)

router = APIRouter()

router.include_router(auth.router)
router.include_router(oauth.router)
router.include_router(creator.router)
router.include_router(platforms.router)
router.include_router(analytics.router)
router.include_router(score.router)
router.include_router(sme.router)
router.include_router(discover.router)
router.include_router(campaigns.router)
router.include_router(forecast.router)
router.include_router(reports.router)
router.include_router(admin.router)
