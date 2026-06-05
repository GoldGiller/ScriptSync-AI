from pydantic import BaseModel, Field

from schemas.common import BaseResponse
from schemas.script_schema import ScriptDocument


class YamlValidateRequest(BaseModel):
    yaml_text: str = Field(..., min_length=5, description="待校验 YAML")


class YamlValidateData(BaseModel):
    valid: bool
    normalized: ScriptDocument | None = None


class YamlValidateResponse(BaseResponse):
    data: YamlValidateData


class YamlFormatRequest(BaseModel):
    yaml_text: str = Field(..., min_length=5, description="待格式化 YAML")


class YamlFormatData(BaseModel):
    formatted_yaml: str


class YamlFormatResponse(BaseResponse):
    data: YamlFormatData
