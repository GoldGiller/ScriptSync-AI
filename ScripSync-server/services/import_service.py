from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path

from fastapi import UploadFile

from core.exception_handler import BusinessException, ConfigurationException
from schemas.import_schema import ImportDocumentData, ImportDocumentResponse

try:
    from docx import Document
except ImportError:  # pragma: no cover
    Document = None

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None


SUPPORTED_EXTENSIONS = {".docx", ".pdf"}
GENRE_KEYWORDS = {
    "悬疑": ("悬疑", "推理", "疑案", "谜案", "真相"),
    "都市": ("都市", "职场", "总裁", "白领", "现代城市"),
    "古风": ("古风", "王朝", "江湖", "宫廷", "将军"),
    "言情": ("言情", "恋爱", "暗恋", "告白", "婚约"),
    "科幻": ("科幻", "星际", "机甲", "未来", "人工智能"),
    "校园": ("校园", "高中", "大学", "社团", "同桌"),
    "奇幻": ("奇幻", "魔法", "精灵", "异界", "神殿"),
}
MAX_FILE_SIZE = 10 * 1024 * 1024


class ImportService:
    async def parse_document(self, file: UploadFile) -> ImportDocumentResponse:
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in SUPPORTED_EXTENSIONS:
            raise BusinessException("仅支持导入 .docx 或 .pdf 文件。")

        content = await file.read()
        if not content:
            raise BusinessException("上传文件为空，请重新选择文档。")

        if len(content) > MAX_FILE_SIZE:
            raise BusinessException("上传文件过大，请控制在 10MB 以内。")

        text = self._extract_text(content, suffix)
        cleaned_text = self._clean_text(text)
        if len(cleaned_text) < 20:
            raise BusinessException("文档中可提取的正文不足 20 个字符，请检查文件内容。")

        title = self._detect_title(cleaned_text)
        genre = self._detect_genre(cleaned_text, title)
        warnings = self._build_warnings(title=title, genre=genre, source_text=cleaned_text)

        return ImportDocumentResponse(
            message="文档解析成功",
            data=ImportDocumentData(
                file_name=file.filename or "未命名文件",
                title=title,
                genre=genre,
                source_text=cleaned_text,
                warnings=warnings,
            ),
        )

    def _extract_text(self, content: bytes, suffix: str) -> str:
        if suffix == ".docx":
            return self._extract_docx_text(content)
        if suffix == ".pdf":
            return self._extract_pdf_text(content)
        raise BusinessException("暂不支持该文件格式。")

    def _extract_docx_text(self, content: bytes) -> str:
        if Document is None:
            raise ConfigurationException("缺少 python-docx 依赖，暂时无法解析 Word 文档。")

        document = Document(BytesIO(content))
        paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
        return "\n".join(paragraphs)

    def _extract_pdf_text(self, content: bytes) -> str:
        if PdfReader is None:
            raise ConfigurationException("缺少 pypdf 依赖，暂时无法解析 PDF 文档。")

        reader = PdfReader(BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(page.strip() for page in pages if page and page.strip())
        if not text.strip():
            raise BusinessException("PDF 中未提取到有效文本，可能是扫描版文档。")
        return text

    def _clean_text(self, text: str) -> str:
        normalized = text.replace("\r\n", "\n").replace("\r", "\n")
        lines = [self._normalize_line(line) for line in normalized.split("\n")]
        filtered_lines = [line for line in lines if line]
        return "\n".join(filtered_lines).strip()

    def _normalize_line(self, line: str) -> str:
        compact = re.sub(r"\s+", " ", line).strip()
        if not compact:
            return ""
        if re.fullmatch(r"第?\s*\d+\s*页", compact):
            return ""
        return compact

    def _detect_title(self, source_text: str) -> str:
        lines = [line.strip() for line in source_text.splitlines() if line.strip()]
        for line in lines[:5]:
            if self._looks_like_title(line):
                return line[:60]
        return source_text[:20].strip()

    def _looks_like_title(self, line: str) -> bool:
        if len(line) > 30:
            return False
        if line.endswith(("。", "！", "？", ".", "!", "?")):
            return False
        if len(line.split()) > 8:
            return False
        return True

    def _detect_genre(self, source_text: str, title: str) -> str:
        sample = f"{title}\n{source_text[:800]}"
        for genre, keywords in GENRE_KEYWORDS.items():
            if any(keyword in sample for keyword in keywords):
                return genre
        return ""

    def _build_warnings(self, title: str, genre: str, source_text: str) -> list[str]:
        warnings: list[str] = []
        if not title:
            warnings.append("未识别到明确标题，已按正文前 20 个字兜底。")
        if not genre:
            warnings.append("未可靠识别题材，请手动检查或补充。")
        if len(source_text) < 50:
            warnings.append("提取到的正文较短，请确认文档内容是否完整。")
        return warnings


import_service = ImportService()
