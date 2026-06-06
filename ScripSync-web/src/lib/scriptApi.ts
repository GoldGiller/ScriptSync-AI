import { postFormData, postJson } from './api';
import type {
  ImportDocumentResponseData,
  ProcessStep,
  ScriptDocument,
  ScriptGenerateRequest,
  ScriptGenerateResponseData,
  ScriptRefineRequest,
  YamlFormatResponseData,
  YamlValidateResponseData,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function buildGenerateProcessSteps(payload: ScriptGenerateRequest): ProcessStep[] {
  return [
    { key: 'read-input', label: '读取输入内容', status: 'completed', detail: '已读取标题、题材、正文与目标场景数。' },
    { key: 'analyze-story', label: '分析人物关系', status: 'active', detail: '正在分析人物关系、冲突焦点与情绪走向。' },
    { key: 'infer-genre', label: '推断题材与节奏', status: 'pending', detail: `准备结合题材“${payload.genre || '未指定'}”推断表达风格与节奏。` },
    { key: 'generate-yaml', label: '生成剧本 YAML', status: 'pending', detail: '等待 AI 产出结构化剧本 YAML。' },
    { key: 'validate-structure', label: '校验剧本结构', status: 'pending', detail: '将对角色、场景与对白结构进行合法性检查。' },
    { key: 'compose-result', label: '整理最终结果', status: 'pending', detail: '将输出可编辑 YAML 与剧本预览结构。' },
  ];
}

export function buildRefineProcessSteps(refinePrompt: string): ProcessStep[] {
  return [
    { key: 'load-current', label: '读取当前结果', status: 'completed', detail: '已读取当前 YAML 与已有剧本结构。' },
    { key: 'analyze-intent', label: '分析微调目标', status: 'active', detail: `正在理解微调要求：${refinePrompt}` },
    { key: 'plan-rewrite', label: '规划调整方案', status: 'pending', detail: '准备推断需要强化的情绪、冲突与节奏。' },
    { key: 'call-ai', label: '执行 AI 微调', status: 'pending', detail: '等待 AI 生成新的剧本 YAML。' },
    { key: 'review-structure', label: '检查结构完整性', status: 'pending', detail: '将检查角色、场景与对白结构是否完整。' },
    { key: 'validate-yaml', label: '校验 YAML 结果', status: 'pending', detail: '将执行 Schema 校验，确保结果可预览可编辑。' },
    { key: 'finish-refine', label: '输出微调结果', status: 'pending', detail: '将返回新的剧本 YAML 与预览结构。' },
  ];
}

export async function generateScript(payload: ScriptGenerateRequest): Promise<ScriptGenerateResponseData> {
  const response = await postJson<ApiResponse<ScriptGenerateResponseData>>('/api/script/generate', payload);
  return response.data;
}

export async function refineScript(payload: ScriptRefineRequest): Promise<ScriptGenerateResponseData> {
  const response = await postJson<ApiResponse<ScriptGenerateResponseData>>('/api/script/refine', payload);
  return response.data;
}

export async function importDocument(file: File): Promise<ImportDocumentResponseData> {
  const payload = new FormData();
  payload.append('file', file);
  const response = await postFormData<ApiResponse<ImportDocumentResponseData>>('/api/import/parse', payload);
  return response.data;
}

export async function validateYaml(yaml_text: string): Promise<YamlValidateResponseData> {
  const response = await postJson<ApiResponse<YamlValidateResponseData>>('/api/yaml/validate', { yaml_text });
  return response.data;
}

export async function formatYaml(yaml_text: string): Promise<YamlFormatResponseData> {
  const response = await postJson<ApiResponse<YamlFormatResponseData>>('/api/yaml/format', { yaml_text });
  return response.data;
}

export function buildExampleScript(): ScriptDocument {
  return {
    version: '1.0',
    title: '示例剧本',
    genre: '都市',
    premise: '一段用于演示前后端联调的剧本简介。',
    characters: [
      { name: '林夏', role: '主角', summary: '追查匿名来信背后真相的年轻女性。' },
      { name: '旁白', role: '叙事者', summary: '负责补充环境与心理活动。' },
    ],
    scenes: [
      {
        scene_id: 'S01',
        title: '雨夜来信',
        location: '旧城区公寓',
        time: '夜',
        summary: '林夏在雨夜收到匿名来信，决定动身前往旧戏院。',
        dialogues: [
          { speaker: '旁白', content: '雨点砸在窗沿，信封上的字迹被路灯照得发白。', emotion: '紧张' },
          { speaker: '林夏', content: '如果这真和姐姐有关，我必须去。', emotion: '坚定' },
        ],
      },
    ],
  };
}
