from fastapi import APIRouter

from schemas.ai_schema import AiDocGenerateRequest, AiDocGenerateResponse
from services.ai_service import ai_service

router = APIRouter(prefix="/ai/doc", tags=["ai-doc"])


@router.post("/generate", response_model=AiDocGenerateResponse)
async def generate_ai_doc(payload: AiDocGenerateRequest) -> AiDocGenerateResponse:
    return await ai_service.generate_doc(payload)
