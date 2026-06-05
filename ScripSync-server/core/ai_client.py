from __future__ import annotations

from typing import Any

try:
    import httpx
except ImportError:  # pragma: no cover
    httpx = None

from core.config import get_settings
from core.exception_handler import ConfigurationException, IntegrationException

_client: "httpx.AsyncClient | None" = None


def _get_httpx_module():
    if httpx is None:
        raise ConfigurationException(
            "缺少 httpx 依赖，请先安装项目依赖后再使用 AI 能力。"
        )
    return httpx


def get_ai_client():
    global _client

    httpx_module = _get_httpx_module()
    if _client is None:
        settings = get_settings()
        _client = httpx_module.AsyncClient(
            base_url=settings.ai_base_url.rstrip("/"),
            timeout=settings.ai_timeout,
            headers={"Authorization": f"Bearer {settings.ai_api_key}"},
        )
    return _client


async def close_ai_client():
    global _client

    if _client is not None:
        await _client.aclose()
        _client = None


async def create_chat_completion(messages: list[dict[str, str]], temperature: float = 0.4) -> str:
    settings = get_settings()
    if not settings.ai_api_key:
        raise ConfigurationException("未配置 AI_API_KEY，暂时无法调用 AI 服务。")

    client = get_ai_client()

    try:
        response = await client.post(
            "/chat/completions",
            json={
                "model": settings.ai_model,
                "messages": messages,
                "temperature": temperature,
            },
        )
        response.raise_for_status()
    except Exception as exc:  # pragma: no cover
        raise IntegrationException(f"AI 服务调用失败: {exc}") from exc

    data: dict[str, Any] = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise IntegrationException("AI 服务返回为空。")

    message = choices[0].get("message") or {}
    content = message.get("content")
    if not content:
        raise IntegrationException("AI 服务未返回有效内容。")
    return str(content)
