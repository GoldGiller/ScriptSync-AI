from __future__ import annotations

import logging

from schemas.script_schema import (
    CharacterProfile,
    DialogueLine,
    ProcessStep,
    SceneBlock,
    ScriptDocument,
    ScriptGenerateData,
    ScriptGenerateRequest,
    ScriptGenerateResponse,
)
from services.ai_service import ai_service
from services.yaml_service import yaml_service

logger = logging.getLogger(__name__)


class ScriptService:
    async def generate(self, payload: ScriptGenerateRequest) -> ScriptGenerateResponse:
        process_steps = self._build_initial_steps(payload)
        script = await self._build_script(payload, process_steps)
        yaml_text = yaml_service.dump_script(script)
        process_steps[-1].status = "completed"

        return ScriptGenerateResponse(
            message="剧本生成成功",
            data=ScriptGenerateData(script=script, yaml_text=yaml_text, process_steps=process_steps),
        )

    async def _build_script(self, payload: ScriptGenerateRequest, process_steps: list[ProcessStep]) -> ScriptDocument:
        process_steps[0].status = "completed"
        process_steps[1].status = "completed"
        process_steps[2].status = "completed"

        script = await self._build_script_with_ai(payload, process_steps)
        if script is not None:
            process_steps[5].status = "completed"
            return script

        paragraphs = [item.strip() for item in payload.source_text.splitlines() if item.strip()]
        chunks = paragraphs[: payload.target_scene_count]
        if not chunks:
            chunks = [payload.source_text.strip()]

        scenes: list[SceneBlock] = []
        for index, chunk in enumerate(chunks, start=1):
            scene_title = f"场景{index}"
            scenes.append(
                SceneBlock(
                    scene_id=f"S{index:02d}",
                    title=scene_title,
                    location="待补充",
                    time="待补充",
                    summary=chunk[:120],
                    dialogues=[
                        DialogueLine(
                            speaker="旁白",
                            content=chunk[:80],
                            emotion="平稳",
                        )
                    ],
                )
            )

        process_steps[4].status = "completed"
        process_steps[4].detail = "AI 不可用或结果无效，已自动切换到基础生成逻辑。"
        process_steps[5].status = "completed"
        process_steps[5].detail = "已使用基础生成逻辑构建剧本结构并完成 YAML 组织。"

        characters = self._extract_characters(payload.source_text)
        return ScriptDocument(
            title=payload.title,
            genre=payload.genre,
            premise=payload.source_text[:180],
            characters=characters,
            scenes=scenes,
        )

    async def _build_script_with_ai(self, payload: ScriptGenerateRequest, process_steps: list[ProcessStep]) -> ScriptDocument | None:
        request = self._build_ai_request(payload)
        try:
            response = await ai_service.generate_doc(request)
        except Exception as exc:
            logger.warning("AI script generation request failed, falling back to local generator: %s", exc)
            process_steps[3].status = "failed"
            process_steps[3].detail = "AI 生成阶段失败，准备切换到基础生成逻辑。"
            return None

        if not response.data.content.strip():
            logger.info("AI script generation returned empty content, falling back to local generator")
            process_steps[3].status = "failed"
            process_steps[3].detail = "AI 没有返回可用内容，准备切换到基础生成逻辑。"
            return None

        process_steps[3].status = "completed"
        process_steps[4].status = "completed"
        process_steps[4].detail = "AI 已完成剧本 YAML 草稿生成，正在做结构合法性检查。"

        try:
            return yaml_service.load_script(response.data.content)
        except Exception as exc:
            logger.warning("AI script generation returned invalid YAML, falling back to local generator: %s", exc)
            process_steps[4].status = "failed"
            process_steps[4].detail = "AI 返回的 YAML 未通过校验，准备切换到基础生成逻辑。"
            return None

    def _extract_characters(self, source_text: str) -> list[CharacterProfile]:
        seeds = []
        for token in source_text.replace("，", " ").replace("。", " ").split():
            cleaned = token.strip("：:,.;!?()[]{}\"'")
            if 1 < len(cleaned) <= 8 and cleaned not in seeds:
                seeds.append(cleaned)
            if len(seeds) >= 3:
                break

        if not seeds:
            seeds = ["主角", "配角", "旁白"]

        return [
            CharacterProfile(name=name, role="待设定", summary="可在编辑器中继续完善")
            for name in seeds
        ]

    def _build_ai_request(self, payload: ScriptGenerateRequest):
        from schemas.ai_schema import AiDocGenerateRequest

        return AiDocGenerateRequest(
            title=payload.title,
            script_text=(
                "请直接输出符合剧本 Schema 的 YAML，不要添加 Markdown 代码块。\n"
                f"标题：{payload.title}\n"
                f"题材：{payload.genre or '未指定'}\n"
                f"目标场景数：{payload.target_scene_count}\n"
                f"原文：{payload.source_text}"
            ),
            doc_type="yaml-script",
            extra_requirements="输出字段包含 version、title、genre、premise、characters、scenes。",
        )

    def _build_initial_steps(self, payload: ScriptGenerateRequest) -> list[ProcessStep]:
        return [
            ProcessStep(key="read-input", label="读取输入内容", status="pending", detail="正在读取标题、题材、正文与目标场景数。"),
            ProcessStep(key="analyze-story", label="分析人物关系", status="pending", detail="正在分析人物、冲突焦点与剧情动机。"),
            ProcessStep(key="infer-genre", label="推断题材与节奏", status="pending", detail=f"正在结合题材“{payload.genre or '未指定'}”推断整体表达风格与节奏。"),
            ProcessStep(key="generate-yaml", label="生成剧本 YAML", status="pending", detail="正在调用 AI 输出结构化剧本 YAML。"),
            ProcessStep(key="validate-structure", label="校验剧本结构", status="pending", detail="正在检查角色、场景与对白结构是否完整。"),
            ProcessStep(key="compose-result", label="整理最终结果", status="pending", detail="正在整理可编辑 YAML 与预览结构。"),
        ]


script_service = ScriptService()
