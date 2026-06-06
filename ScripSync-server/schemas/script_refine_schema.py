from __future__ import annotations

from pydantic import BaseModel, Field

from schemas.common import BaseResponse
from schemas.script_schema import ScriptGenerateData


class ScriptRefineRequest(BaseModel):
    title: str = Field(..., description="作品标题")
    source_text: str = Field(..., min_length=20, description="小说原文或摘要")
    genre: str = Field(default="", description="题材")
    current_yaml: str = Field(..., min_length=10, description="当前 YAML 结果")
    refine_prompt: str = Field(..., min_length=2, description="用户微调要求")


class ScriptRefineResponse(BaseResponse):
    data: ScriptGenerateData
