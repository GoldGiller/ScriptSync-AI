from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None


class Settings(BaseModel):
    app_name: str = "ScriptSync-AI Backend"
    app_version: str = "0.1.0"
    env: str = "development"
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])
    ai_base_url: str = "https://api.deepseek.com"
    ai_api_key: str = ""
    ai_model: str = "deepseek-v4-pro"
    ai_timeout: float = 90.0
    workspace_dir: Path = Field(default_factory=lambda: Path("workspace").resolve())


def _parse_cors_origins(raw_value: str | None) -> list[str]:
    if not raw_value:
        return ["*"]
    return [item.strip() for item in raw_value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    if load_dotenv is not None:
        load_dotenv()

    return Settings(
        app_name=os.getenv("APP_NAME", "ScriptSync-AI Backend"),
        app_version=os.getenv("APP_VERSION", "0.1.0"),
        env=os.getenv("APP_ENV", "development"),
        cors_origins=_parse_cors_origins(os.getenv("CORS_ORIGINS")),
        ai_base_url=os.getenv("AI_BASE_URL", "https://api.deepseek.com"),
        ai_api_key=os.getenv("AI_API_KEY", ""),
        ai_model=os.getenv("AI_MODEL", "deepseek-v4-pro"),
        ai_timeout=float(os.getenv("AI_TIMEOUT", "90")),
        workspace_dir=Path(os.getenv("WORKSPACE_DIR", "workspace")).resolve(),
    )
