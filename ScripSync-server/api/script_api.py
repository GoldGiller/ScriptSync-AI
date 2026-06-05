from fastapi import APIRouter

from schemas.script_schema import ScriptGenerateRequest, ScriptGenerateResponse
from services.script_service import script_service

router = APIRouter(prefix="/script", tags=["script"])


@router.post("/generate", response_model=ScriptGenerateResponse)
async def generate_script(payload: ScriptGenerateRequest) -> ScriptGenerateResponse:
    return await script_service.generate(payload)
