# ScriptSync-AI

ScriptSync-AI 是一个面向剧情创作、剧本整理与结构化表达的 AI 辅助工具。它可以将小说片段、剧情素材或文档内容转换为标准化剧本数据，并提供 YAML 校验、格式化、可视化预览、历史记录管理和 AI 文档生成能力。

项目适合以下场景：

- 小说改编为剧本
- 剧情内容结构化整理
- 剧本数据生产与复用
- AI 内容创作辅助

## 演示视频
- 百度网盘：


## 项目亮点

- 支持导入原始小说文本，也支持解析 `.docx` 和 `.pdf` 文件
- 支持通过 AI 生成结构化剧本，并在失败时自动回退到本地规则生成
- 支持 YAML 校验、格式化与预览联动
- 支持历史记录管理，方便回看、继续编辑和导出
- 提供剧本 Schema 说明页，便于评审、协作和二次开发

## 项目结构

项目采用前后端分离架构：

- `ScripSync-web`：React + Vite 前端，负责文本输入、YAML 编辑、结果预览、历史记录与 Schema 展示
- `ScripSync-server`：FastAPI 后端，负责文档解析、剧本生成、YAML 处理和 AI 文档生成

```text
ScriptSync-AI/
├── README.md
├── pyproject.toml
├── uv.lock
├── ScripSync-server/
│   ├── api/
│   ├── core/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── main.py
│   ├── pyproject.toml
│   ├── uv.lock
│   └── test_main.http
└── ScripSync-web/
    ├── public/
    ├── src/
    ├── package.json
    ├── package-lock.json
    └── vite.config.ts
```

## 核心功能

### 1. 小说转结构化剧本

- 输入作品标题、题材、目标场景数和原始文本
- 支持上传 `.docx` / `.pdf` 文档，并自动识别标题、题材和正文内容
- 支持 AI 生成剧本结构，也支持本地规则回退
- 生成后可继续通过修改原始内容、追加 AI 微调指令或直接编辑 YAML 进行二次调整

### 2. YAML 校验与格式化

- 校验 YAML 是否可解析、字段是否符合剧本结构要求
- 返回标准化后的结构数据，供前端预览使用
- 支持一键格式化，便于保存、比对和版本管理

### 3. 剧本可视化预览

- 左侧编辑 YAML，右侧实时预览剧本结构
- 支持校验结果联动，减少手动排错成本

### 4. 历史记录管理

- 保存剧本生成与调整过程中的历史版本
- 支持重新查看、继续编辑、校验和导出

### 5. AI 文档生成

- 可基于剧本结果生成角色分析、剧情说明等辅助文档
- 便于展示、答辩、协作和后续扩展

## 技术栈

### 前端

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Zustand
- React Router

### 后端

- Python 3.14+
- FastAPI
- Pydantic v2
- Uvicorn
- httpx
- PyYAML
- ruamel.yaml
- python-dotenv
- python-docx
- pypdf

## 页面与接口

### 前端页面

- `/`：首页
- `/convert`：小说转剧本与 YAML 编辑页
- `/history`：历史记录页
- `/schema`：YAML Schema 说明页

### 后端接口

- `POST /api/import/parse`：解析 `.docx` / `.pdf`，提取标题、题材和正文
- `POST /api/script/generate`：生成结构化剧本 YAML
- `POST /api/script/refine`：基于当前结果和 AI 指令重新微调剧本
- `POST /api/yaml/validate`：校验 YAML
- `POST /api/yaml/format`：格式化 YAML
- `POST /api/ai/doc/generate`：生成角色分析、剧情说明等 AI 文档
- `GET /`：服务健康检查

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm 9+
- Python 3.14+
- 推荐使用 `uv` 管理 Python 依赖

### 2. 启动后端

在 `ScripSync-server` 目录下执行：

```bash
uv sync
uv run uvicorn main:app --reload
```

默认地址：

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 3. 启动前端

在 `ScripSync-web` 目录下执行：

```bash
npm install
npm run dev
```

默认地址：

- Web: `http://127.0.0.1:5173`

说明：

- 开发环境下，前端已通过 `vite.config.ts` 将 `/api` 代理到 `http://127.0.0.1:8000`
- 如果前后端分离部署，可通过 `VITE_API_BASE_URL` 指向目标后端地址

## 环境变量说明

后端可在 `ScripSync-server/.env` 中配置运行参数：

```env
APP_NAME=ScriptSync-AI Backend
APP_VERSION=0.1.0
APP_ENV=development
CORS_ORIGINS=*

AI_BASE_URL=https://api.deepseek.com
AI_API_KEY=sk-your-api-key
AI_MODEL=deepseek-v4-pro
AI_TIMEOUT=90

WORKSPACE_DIR=workspace
```

说明：

- 当配置了 `AI_API_KEY` 时，系统会优先调用外部 AI 服务生成剧本
- 当 `AI_API_KEY` 为空、AI 服务不可用，或 AI 返回结果无法解析为合法 YAML 时，后端会自动回退到本地基础生成逻辑
- 当前默认配置兼容 OpenAI 风格的 Chat Completions 接口
- 默认模型来源为 DeepSeek，默认接口地址为 `https://api.deepseek.com`
- 默认使用模型为 `deepseek-v4-pro`，可通过 `AI_MODEL` 环境变量调整

## 使用流程建议

1. 启动后端与前端服务
2. 进入 `/convert` 页面
3. 粘贴小说文本，或上传 `.docx` / `.pdf`
4. 检查自动识别出的标题、题材和正文内容
5. 执行剧本生成
6. 在结果页继续进行 YAML 校验、格式化、预览和微调
7. 在 `/history` 页面查看和复用历史结果

## 测试与验证

### 基础验证

可以按照以下方式进行功能验证：

1. 启动前后端服务
2. 在 `/convert` 页面输入文本或上传文档
3. 确认系统能够识别基础信息并生成结构化结果
4. 验证 YAML 校验、格式化和预览联动是否正常
5. 在 `/history` 页面确认历史记录可重新查看与编辑

### 接口调试

- 可使用 [test_main.http](/D:/agentyaml/ScriptSync-AI/ScripSync-server/test_main.http) 进行接口调试
- 也可以通过 Swagger 页面直接测试接口

### 建议重点验证

- 已配置 `AI_API_KEY` 时，剧本是否优先通过 AI 生成
- 未配置 `AI_API_KEY` 或 AI 调用失败时，是否能自动回退并输出可用结果
- 非法 YAML 是否能返回明确错误信息
- 格式化后的 YAML 是否仍可通过校验

## 第三方依赖用途说明

### 前端依赖

- `react` / `react-dom`：构建前端页面
- `react-router-dom`：前端路由
- `@monaco-editor/react`：YAML 编辑器
- `zustand`：本地状态管理
- `js-yaml`：YAML 解析与处理
- `lucide-react`：图标组件
- `tailwindcss` / `postcss` / `autoprefixer`：样式系统

### 后端依赖

- `fastapi`：Web API 服务
- `pydantic`：数据建模与参数校验
- `uvicorn`：ASGI 服务运行
- `httpx`：调用外部 AI 接口
- `pyyaml` / `ruamel.yaml`：YAML 解析与格式化
- `python-dotenv`：环境变量加载
- `python-docx`：Word 文档解析
- `pypdf`：PDF 文档解析

## 适合展示的内容

如果需要用于比赛答辩、项目汇报或 Demo 展示，建议重点覆盖：

- 项目背景与目标
- 前后端整体架构
- 小说转剧本演示
- YAML 校验与格式化演示
- 历史记录与预览演示
- AI 文档生成演示

