from __future__ import annotations

from core.exception_handler import BusinessException
from schemas.ai_schema import AiDocGenerateRequest
from schemas.script_refine_schema import ScriptRefineRequest, ScriptRefineResponse
from schemas.script_schema import ProcessStep, ScriptGenerateData
from services.ai_service import ai_service
from services.yaml_service import yaml_service


class ScriptRefineService:
    async def refine(self, payload: ScriptRefineRequest) -> ScriptRefineResponse:
        process_steps = self._build_initial_steps(payload.refine_prompt)
        process_steps[0].status = "completed"
        process_steps[1].status = "completed"
        process_steps[2].status = "completed"
        request = self._build_ai_request(payload)
        response = await ai_service.generate_doc(request)

        if not response.data.content.strip():
            process_steps[3].status = "failed"
            process_steps[3].detail = "AI 没有返回可用的 YAML 内容。"
            raise BusinessException("AI 微调失败：模型未返回可用的 YAML 内容，请调整微调要求后重试。")

        process_steps[3].status = "completed"
        process_steps[4].status = "completed"

        try:
            script = yaml_service.load_script(response.data.content)
        except BusinessException as exc:
            process_steps[5].status = "failed"
            process_steps[5].detail = "生成结果未通过 YAML Schema 校验。"
            raise BusinessException(f"AI 微调失败：返回结果不是合法剧本 YAML。{exc.message}") from exc

        process_steps[5].status = "completed"
        process_steps[6].status = "completed"
        yaml_text = yaml_service.dump_script(script)
        return ScriptRefineResponse(
            message="剧本微调成功",
            data=ScriptGenerateData(script=script, yaml_text=yaml_text, process_steps=process_steps),
        )

    def _build_ai_request(self, payload: ScriptRefineRequest) -> AiDocGenerateRequest:
        return AiDocGenerateRequest(
            title=payload.title,
            script_text=(
                "请基于以下原始信息和当前剧本 YAML 进行微调，并直接输出符合 Schema 的 YAML，不要添加 Markdown 代码块。\n"
                f"标题：{payload.title}\n"
                f"题材：{payload.genre or '未指定'}\n"
                f"原文：{payload.source_text}\n"
                f"当前 YAML：\n{payload.current_yaml}\n"
                f"微调要求：{payload.refine_prompt}"
            ),
            doc_type="yaml-script",
            extra_requirements="输出字段包含 version、title、genre、premise、characters、scenes，并保留结构合法性。",
        )

    def _build_initial_steps(self, refine_prompt: str) -> list[ProcessStep]:
        return [
            ProcessStep(key="load-current", label="读取当前结果", status="pending", detail="正在读取当前 YAML 与已有剧本内容。"),
            ProcessStep(key="analyze-intent", label="分析微调目标", status="pending", detail=f"正在理解微调要求：{refine_prompt}"),
            ProcessStep(key="plan-rewrite", label="规划调整方案", status="pending", detail="正在推断需要强化的情绪、冲突与节奏。"),
            ProcessStep(key="call-ai", label="执行 AI 微调", status="pending", detail="正在根据当前结果与要求生成新版 YAML。"),
            ProcessStep(key="review-structure", label="检查结构完整性", status="pending", detail="正在检查角色、场景与对白结构是否完整。"),
            ProcessStep(key="validate-yaml", label="校验 YAML 结果", status="pending", detail="正在执行 Schema 校验，确保结果可预览可编辑。"),
            ProcessStep(key="finish-refine", label="输出微调结果", status="pending", detail="已完成微调，正在返回新的剧本 YAML 与预览结构。"),
        ]


script_refine_service = ScriptRefineService()
