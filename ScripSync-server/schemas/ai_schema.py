from pydantic import BaseModel, Field

from schemas.common import BaseResponse


class AiDocGenerateRequest(BaseModel):
    title: str = Field(..., description="文档标题")
    script_text: str = Field(..., min_length=10, description="剧本文本")
    doc_type: str = Field(default="analysis", description="文档类型")
    extra_requirements: str = Field(default="", description="额外要求")


class AiDocData(BaseModel):
    title: str
    doc_type: str
    content: str


class AiDocGenerateResponse(BaseResponse):
    data: AiDocData
