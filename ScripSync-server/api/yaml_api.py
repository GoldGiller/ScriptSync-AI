from fastapi import APIRouter

from schemas.yaml_schema import (
    YamlFormatRequest,
    YamlFormatResponse,
    YamlValidateRequest,
    YamlValidateResponse,
)
from services.yaml_service import yaml_service

router = APIRouter(prefix="/yaml", tags=["yaml"])


@router.post("/validate", response_model=YamlValidateResponse)
async def validate_yaml(payload: YamlValidateRequest) -> YamlValidateResponse:
    return yaml_service.validate(payload)


@router.post("/format", response_model=YamlFormatResponse)
async def format_yaml(payload: YamlFormatRequest) -> YamlFormatResponse:
    return yaml_service.format(payload)
