from core.ai_client import create_chat_completion
from core.exception_handler import ConfigurationException
from schemas.ai_schema import AiDocData, AiDocGenerateRequest, AiDocGenerateResponse


class AiService:
    async def generate_doc(self, payload: AiDocGenerateRequest) -> AiDocGenerateResponse:
        prompt = self._build_prompt(payload)

        try:
            content = await create_chat_completion(
                [
                    {
                        "role": "system",
                        "content": "你是一名剧本策划助理，输出结构清晰、可执行的文档。",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
        except ConfigurationException:
            content = self._build_fallback_doc(payload)

        return AiDocGenerateResponse(
            message="文档生成成功",
            data=AiDocData(
                title=payload.title,
                doc_type=payload.doc_type,
                content=content,
            ),
        )

    def _build_prompt(self, payload: AiDocGenerateRequest) -> str:
        return (
            f"请根据以下剧本内容生成一份{payload.doc_type}文档。\n"
            f"标题：{payload.title}\n"
            f"额外要求：{payload.extra_requirements or '无'}\n"
            f"剧本文本：\n{payload.script_text}"
        )

    def _build_fallback_doc(self, payload: AiDocGenerateRequest) -> str:
        return (
            f"# {payload.title}\n\n"
            f"## 文档类型\n{payload.doc_type}\n\n"
            "## 内容概览\n"
            f"{payload.script_text[:300]}\n\n"
            "## 建议\n"
            "1. 先确认角色目标与冲突是否清晰。\n"
            "2. 逐场景补充动作描述与对白节奏。\n"
            "3. 交给前端编辑器后可继续进行 YAML 结构化调整。"
        )


ai_service = AiService()
