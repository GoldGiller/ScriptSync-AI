from __future__ import annotations

from schemas.script_schema import (
    CharacterProfile,
    DialogueLine,
    SceneBlock,
    ScriptDocument,
    ScriptGenerateData,
    ScriptGenerateRequest,
    ScriptGenerateResponse,
)
from services.ai_service import ai_service
from services.yaml_service import yaml_service


class ScriptService:
    async def generate(self, payload: ScriptGenerateRequest) -> ScriptGenerateResponse:
        script = await self._build_script(payload)
        yaml_text = yaml_service.dump_script(script)

        return ScriptGenerateResponse(
            message="剧本生成成功",
            data=ScriptGenerateData(script=script, yaml_text=yaml_text),
        )

    async def _build_script(self, payload: ScriptGenerateRequest) -> ScriptDocument:
        if payload.use_ai:
            script = await self._build_script_with_ai(payload)
            if script is not None:
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

        characters = self._extract_characters(payload.source_text)
        return ScriptDocument(
            title=payload.title,
            genre=payload.genre,
            premise=payload.source_text[:180],
            characters=characters,
            scenes=scenes,
        )

    async def _build_script_with_ai(self, payload: ScriptGenerateRequest) -> ScriptDocument | None:
        request = self._build_ai_request(payload)
        response = await ai_service.generate_doc(request)

        try:
            return yaml_service.load_script(response.data.content)
        except Exception:
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


script_service = ScriptService()
