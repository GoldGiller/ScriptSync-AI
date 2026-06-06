# ScriptSync-AI

## 项目简介
ScriptSync-AI 是一个面向剧情创作与剧本结构化整理的 AI 辅助工具。项目支持将小说片段转换为结构化剧本数据，并以 YAML 格式进行校验、格式化、预览和导出，适用于 AI 创作、剧本改编、内容生产等场景。

本仓库采用前后端一体化管理：
- `ScripSync-web`：React + Vite 前端，提供文本输入、YAML 编辑、实时预览、历史记录和 Schema 文档页面。
- `ScripSync-server`：FastAPI 后端，提供剧本生成、YAML 校验、YAML 格式化和 AI 文档生成接口。

## 议题匹配说明
本项目聚焦 AI 辅助内容创作与结构化表达，核心目标是把自然语言故事文本转换为可编辑、可校验、可复用的剧本数据结构，符合“智能创作工具 / 内容生产效率提升 / AI 应用开发”方向。

## 核心功能
### 1. 小说转结构化剧本
- 输入作品标题、题材、目标场景数和原始小说文本。
- 支持导入 Word / PDF 文档，并自动识别作品标题、题材和正文文本。
- 支持规则生成，也支持启用 AI 辅助生成。
- 转换结果后可继续进行三类微调：修改原始输入后重新生成、输入 AI 微调指令后重新生成、直接编辑 YAML。
- 结果页提供 AI 推理过程界面，展示生成/微调阶段的可解释过程摘要与状态时间线。
- 输出统一的剧本对象和 YAML 文本。

### 2. YAML 校验与格式化
- 校验 YAML 是否可解析、是否符合剧本数据结构。
- 返回标准化后的剧本对象，供前端预览使用。
- 支持一键格式化，便于保存、比对和版本管理。

### 3. 剧本可视化预览
- 左侧编辑 YAML，右侧实时预览剧本结构。
- 支持自动校验，减少手动排错成本。

### 4. 历史记录管理
- 保存历史转换结果。
- 支持重新查看、编辑、校验和导出历史 YAML。

### 5. Schema 文档展示
- 提供剧本 YAML 结构说明与示例。
- 方便评委、队友和后续开发者快速理解数据格式。

## 仓库结构
```text
ScriptSync-AI/
├─ README.md
├─ pyproject.toml
├─ uv.lock
├─ ScripSync-server/
│  ├─ api/
│  ├─ core/
│  ├─ schemas/
│  ├─ services/
│  ├─ utils/
│  ├─ main.py
│  ├─ pyproject.toml
│  ├─ uv.lock
│  └─ test_main.http
└─ ScripSync-web/
   ├─ public/
   ├─ src/
   ├─ package.json
   ├─ package-lock.json
   └─ vite.config.ts
```

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

## 功能页面与接口对应
### 前端页面
- `/`：项目首页
- `/convert`：小说转剧本与 YAML 编辑页
- `/history`：历史记录页
- `/schema`：YAML Schema 文档页

### 后端接口
- `POST /api/import/parse`：上传 `.docx` / `.pdf` 并自动识别标题、题材、正文
- `POST /api/script/generate`：生成结构化剧本与 YAML
- `POST /api/script/refine`：基于当前结果和 AI 指令微调剧本并返回新版 YAML
- `POST /api/yaml/validate`：校验 YAML
- `POST /api/yaml/format`：格式化 YAML
- `POST /api/ai/doc/generate`：生成角色分析、剧情说明等 AI 文档
- `GET /`：服务健康检查

## 快速开始
### 1. 环境要求
- Node.js 18+
- npm 9+
- Python 3.14+
- 推荐使用 `uv`

### 2. 启动后端
在 `ScripSync-server` 目录下安装依赖并启动：

```bash
uv sync
uv run uvicorn main:app --reload
```

默认地址：
- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 3. 启动前端
在 `ScripSync-web` 目录下安装依赖并启动：

```bash
npm install
npm run dev
```

默认前端开发地址：
- Web: `http://127.0.0.1:5173`

说明：
- 前端开发环境已通过 `vite.config.ts` 代理 `/api` 到 `http://127.0.0.1:8000`
- 如果部署到其他环境，可通过 `VITE_API_BASE_URL` 指向后端服务地址

## 环境变量说明
后端可在 `ScripSync-server` 目录下通过 `.env` 配置运行参数：

```env
APP_NAME=ScriptSync-AI Backend
APP_VERSION=0.1.0
APP_ENV=development
CORS_ORIGINS=*

AI_BASE_URL=https://api.deepseek.com
AI_API_KEY=sk-your-deepseek-api-key
AI_MODEL=deepseek-chat
AI_TIMEOUT=90

WORKSPACE_DIR=workspace
```

说明：
- `/convert` 页面会默认先尝试 AI 生成剧本，不再提供用户侧 AI 开关。
- 当 `AI_API_KEY` 为空、AI 服务不可用，或 AI 返回内容无法解析为合法 YAML 时，后端会自动回退到本地基础生成逻辑。
- 默认兼容 OpenAI 风格的 Chat Completions 接口，当前默认配置为 DeepSeek。

## 测试与验证方式
### 基础验证
1. 启动后端服务。
2. 启动前端页面。
3. 在 `/convert` 页面粘贴小说文本，或导入 `.docx` / `.pdf` 文档。
4. 确认系统会自动识别并回填作品标题、题材、小说文本，必要时可手动修改。
5. 执行生成，并在结果页继续验证：
   - AI 推理过程面板是否显示阶段日志与状态；
   - 修改标题 / 题材 / 小说文本 / 场景数后重新生成；
   - 输入 AI 微调指令后重新生成；
   - 对结果执行 YAML 校验、格式化和导出。
6. 在 `/history` 页面查看历史结果是否可重新编辑和预览。

### 接口验证
- 可使用 [test_main.http](/D:/agentyaml/ScriptSync-AI/ScripSync-server/test_main.http) 进行接口调试。
- 也可通过 Swagger 页面直接测试接口。

### 建议重点验证
- 在已配置 `AI_API_KEY` 时，`/convert` 页面是否会直接走 AI 生成并返回结构化 YAML。
- 在未配置 `AI_API_KEY`、AI 服务失败，或 AI 返回非法 YAML 时，后端是否会自动回退并仍然生成可用剧本。
- YAML 非法时，接口是否正确返回错误信息。
- 格式化后的 YAML 是否仍能通过校验。

## Demo 视频
- Demo 视频链接：`待补充`

建议视频内容覆盖：
- 项目背景与目标
- 前后端整体结构
- 小说转剧本演示
- YAML 校验与格式化演示
- 历史记录与预览演示
- AI 文档生成演示

## 团队信息
请在提交前补充完整：

| 成员 | 负责内容 | Git 账号 |
| --- | --- | --- |
| 待补充 | 前端页面、交互与联调 | 待补充 |
| 待补充 | 后端接口、数据结构与 AI 接入 | 待补充 |
| 待补充 | 测试、文档、演示视频 | 待补充 |

多人协作说明：
- 每位成员使用自己的 Git 账号提交 commit。
- PR 描述中明确标注本次负责内容。
- 所有模块统一维护在同一仓库内，便于部署、联调与评审。

## 第三方依赖与用途说明
### 前端依赖
- `react` / `react-dom`：构建前端页面
- `react-router-dom`：前端路由
- `@monaco-editor/react`：YAML 编辑器
- `zustand`：本地状态管理
- `js-yaml`：YAML 处理
- `lucide-react`：图标组件
- `tailwindcss` / `postcss` / `autoprefixer`：样式系统

### 后端依赖
- `fastapi`：Web API 服务
- `pydantic`：数据模型与参数校验
- `uvicorn`：ASGI 服务运行
- `httpx`：请求外部 AI 接口
- `pyyaml` / `ruamel.yaml`：YAML 解析与格式化
- `python-dotenv`：环境变量加载

## 原创功能说明
本项目的原创实现部分主要包括：
- 面向剧本场景的结构化 YAML Schema 设计
- 小说文本到剧本对象的服务封装与转换流程
- YAML 校验、格式化、预览联动机制
- 历史记录与剧本编辑工作流
- AI 剧本分析/文档生成与本地回退策略

如有复用历史代码、参考开源项目、接入第三方模型或引用外部资料，请务必在 README 和对应 PR 描述中补充：
- 来源链接
- 复用范围
- 修改内容
- 本项目原创部分说明

## 比赛提交合规说明
为避免作品被判定无效，仓库提交阶段请重点遵守以下规范：

### 1. 仓库与提交记录
- 仓库需在开题后创建。
- 所有 commit 时间戳必须位于所选批次开始与截止时间之间。
- 开发周期内保持持续提交，不要在最后一天一次性导入全部代码。

### 2. PR 要求
- 基于 PR 提交新功能。
- 每个 PR 只做一件事，尽量小步提交。
- PR 标题、描述、实现思路和测试方式必须完整。
- PR 描述不得空白，且必须与实际代码变更一致。

### 3. README 要求
- 明确写出第三方依赖及用途。
- 明确写出原创功能部分。
- 补充项目启动、运行、验证和演示说明。
- 放入可访问的 Demo 视频链接。

### 4. 多人协作要求
- 队员分别使用各自账号提交 commit。
- 在 PR 中写明分工。

## 推荐 PR 模板
为方便后续提交，你们可以按下面格式写 PR：

```text
标题：新增 YAML 自动校验功能

功能描述：
实现编辑器内容变更后的自动校验，并同步预览结果。

实现思路：
前端增加防抖触发逻辑，调用 /api/yaml/validate 接口，使用后端标准化结果驱动预览区域更新。

测试方式：
1. 启动前后端服务
2. 在 /convert 页面编辑 YAML
3. 观察 700ms 后是否自动触发校验
4. 输入非法 YAML，确认报错信息是否正确显示
```
## 结语
感谢评委和队友的支持与配合！我们将持续完善项目功能和文档，为比赛提交提供更好的支持。如有任何问题或建议，欢迎随时联系我！
