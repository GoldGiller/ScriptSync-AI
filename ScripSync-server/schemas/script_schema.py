from __future__ import annotations

from pydantic import BaseModel, Field

from schemas.common import BaseResponse


class CharacterProfile(BaseModel):
    name: str = Field(..., description="角色名")
    role: str = Field(default="", description="角色定位")
    summary: str = Field(default="", description="角色简介")


class DialogueLine(BaseModel):
    speaker: str = Field(..., description="说话人")
    content: str = Field(..., description="台词内容")
    emotion: str = Field(default="", description="情绪标签")


class SceneBlock(BaseModel):
    scene_id: str = Field(..., description="场景编号")
    title: str = Field(..., description="场景标题")
    location: str = Field(default="", description="地点")
    time: str = Field(default="", description="时间")
    summary: str = Field(..., description="场景摘要")
    dialogues: list[DialogueLine] = Field(default_factory=list, description="对白列表")


class ScriptDocument(BaseModel):
    version: str = Field(default="1.0")
    title: str
    genre: str = Field(default="")
    premise: str = Field(default="")
    characters: list[CharacterProfile] = Field(default_factory=list)
    scenes: list[SceneBlock] = Field(default_factory=list)


class ProcessStep(BaseModel):
    key: str = Field(..., description="步骤标识")
    label: str = Field(..., description="步骤名称")
    status: str = Field(..., description="步骤状态")
    detail: str = Field(default="", description="步骤说明")


class ScriptGenerateRequest(BaseModel):
    title: str = Field(..., description="作品标题")
    source_text: str = Field(..., min_length=20, description="小说原文或摘要")
    genre: str = Field(default="", description="题材")
    target_scene_count: int = Field(default=3, ge=1, le=20, description="目标场景数量")


class ScriptGenerateData(BaseModel):
    script: ScriptDocument
    yaml_text: str
    process_steps: list[ProcessStep] = Field(default_factory=list)


class ScriptGenerateResponse(BaseResponse):
    data: ScriptGenerateData
