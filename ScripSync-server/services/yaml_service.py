from __future__ import annotations

from io import StringIO

from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError

from core.exception_handler import BusinessException, ConfigurationException
from schemas.script_schema import ScriptDocument
from schemas.yaml_schema import (
    YamlFormatData,
    YamlFormatRequest,
    YamlFormatResponse,
    YamlValidateData,
    YamlValidateRequest,
    YamlValidateResponse,
)

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None

try:
    from ruamel.yaml import YAML
except ImportError:  # pragma: no cover
    YAML = None


class YamlService:
    def validate(self, payload: YamlValidateRequest) -> YamlValidateResponse:
        document = self.load_script(payload.yaml_text)
        return YamlValidateResponse(
            message="YAML 校验通过",
            data=YamlValidateData(valid=True, normalized=document),
        )

    def format(self, payload: YamlFormatRequest) -> YamlFormatResponse:
        document = self.load_script(payload.yaml_text)
        return YamlFormatResponse(
            message="YAML 格式化成功",
            data=YamlFormatData(formatted_yaml=self.dump_script(document)),
        )

    def load_script(self, yaml_text: str) -> ScriptDocument:
        raw = self._safe_load(yaml_text)
        try:
            return ScriptDocument.model_validate(raw)
        except ValidationError as exc:
            raise BusinessException(f"YAML 结构不符合剧本 Schema: {exc}") from exc

    def dump_script(self, script: ScriptDocument) -> str:
        payload = jsonable_encoder(script)

        if YAML is not None:
            ruamel_yaml = YAML()
            ruamel_yaml.default_flow_style = False
            stream = StringIO()
            ruamel_yaml.dump(payload, stream)
            return stream.getvalue()

        if yaml is not None:
            return yaml.safe_dump(payload, allow_unicode=True, sort_keys=False)

        raise ConfigurationException(
            "缺少 YAML 依赖，请安装 PyYAML 或 ruamel.yaml 后再使用 YAML 功能。"
        )

    def _safe_load(self, yaml_text: str):
        if yaml is not None:
            try:
                return yaml.safe_load(yaml_text)
            except Exception as exc:
                raise BusinessException(f"YAML 解析失败: {exc}") from exc

        if YAML is not None:
            ruamel_yaml = YAML(typ="safe")
            try:
                return ruamel_yaml.load(yaml_text)
            except Exception as exc:
                raise BusinessException(f"YAML 解析失败: {exc}") from exc

        raise ConfigurationException(
            "缺少 YAML 依赖，请安装 PyYAML 或 ruamel.yaml 后再使用 YAML 功能。"
        )


yaml_service = YamlService()
