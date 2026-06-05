from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    success: bool = True
    message: str = Field(default="ok")
