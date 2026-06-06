from fastapi import APIRouter

from schemas.script_refine_schema import ScriptRefineRequest, ScriptRefineResponse
from services.script_refine_service import script_refine_service

router = APIRouter(prefix="/script", tags=["script"])


@router.post("/refine", response_model=ScriptRefineResponse)
async def refine_script(payload: ScriptRefineRequest) -> ScriptRefineResponse:
    return await script_refine_service.refine(payload)
