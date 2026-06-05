import { postJson } from './api';
import type {
  ScriptDocument,
  ScriptGenerateRequest,
  ScriptGenerateResponseData,
  YamlFormatResponseData,
  YamlValidateResponseData,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function generateScript(payload: ScriptGenerateRequest): Promise<ScriptGenerateResponseData> {
  const response = await postJson<ApiResponse<ScriptGenerateResponseData>>('/api/script/generate', payload);
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
