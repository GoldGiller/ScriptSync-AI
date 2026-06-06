from fastapi import APIRouter, File, UploadFile

from schemas.import_schema import ImportDocumentResponse
from services.import_service import import_service

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/parse", response_model=ImportDocumentResponse)
async def parse_document(file: UploadFile = File(...)) -> ImportDocumentResponse:
    return await import_service.parse_document(file)
