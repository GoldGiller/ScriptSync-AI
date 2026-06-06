from pydantic import BaseModel, Field

from schemas.common import BaseResponse


class ImportDocumentData(BaseModel):
    file_name: str = Field(..., description="导入文件名")
    title: str = Field(default="", description="自动识别的作品标题")
    genre: str = Field(default="", description="自动识别的题材")
    source_text: str = Field(..., description="提取并清洗后的正文")
    warnings: list[str] = Field(default_factory=list, description="解析与识别提示")


class ImportDocumentResponse(BaseResponse):
    data: ImportDocumentData
