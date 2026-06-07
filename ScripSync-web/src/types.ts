export interface CharacterProfile {
  name: string;
  role: string;
  summary: string;
  character_name?: string;
}

export interface DialogueLine {
  speaker: string;
  content: string;
  emotion: string;
  dialogue_index?: number;
}

export interface SceneBlock {
  scene_id: string;
  title: string;
  location: string;
  time: string;
  summary: string;
  dialogues: DialogueLine[];
  source_excerpt?: string;
}

export interface ScriptDocument {
  version: string;
  title: string;
  genre: string;
  premise: string;
  characters: CharacterProfile[];
  scenes: SceneBlock[];
}

export interface ProcessStep {
  key: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  detail: string;
}

export interface ScriptGenerateRequest {
  title: string;
  source_text: string;
  genre: string;
  target_scene_count: number;
}

export interface ScriptRefineRequest {
  title: string;
  source_text: string;
  genre: string;
  current_yaml: string;
  refine_prompt: string;
}

export interface ScriptGenerateResponseData {
  script: ScriptDocument;
  yaml_text: string;
  process_steps: ProcessStep[];
}

export interface ImportDocumentResponseData {
  file_name: string;
  title: string;
  genre: string;
  source_text: string;
  warnings: string[];
}

export interface YamlValidateResponseData {
  valid: boolean;
  normalized: ScriptDocument | null;
}

export interface YamlFormatResponseData {
  formatted_yaml: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  original_text: string;
  script_yaml: string;
  created_at: string;
  script: ScriptDocument | null;
}

export type NotificationType = 'system' | 'conversion' | 'validation';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  type: NotificationType;
}

export type VersionSource = 'generate' | 'refine' | 'manual-edit';

export interface VersionSnapshot {
  id: string;
  projectId: string;
  branchId: string;
  title: string;
  originalText: string;
  scriptYaml: string;
  script: ScriptDocument | null;
  createdAt: string;
  source: VersionSource;
  sourcePrompt?: string;
}

export interface Branch {
  id: string;
  projectId: string;
  name: string;
  baseVersionId: string | null;
  versionIds: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  genre?: string;
  branchIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PreviewNodeRef {
  path: string;
  kind: 'title' | 'premise' | 'character' | 'scene' | 'scene-summary' | 'dialogue';
  sceneId?: string;
  dialogueIndex?: number;
  characterName?: string;
}

export interface YamlLineRange {
  startLine: number;
  endLine: number;
}

export type YamlLocationMap = Record<string, YamlLineRange>;

export interface CharacterRelationNode {
  id: string;
  label: string;
  role?: string;
  appearance_count?: number;
}

export interface CharacterRelationEdge {
  source: string;
  target: string;
  weight: number;
  relation_hint?: string;
}

export interface SceneAnalysis {
  scene_id: string;
  conflict_score?: number;
  emotion_score?: number;
  info_density_score?: number;
  twist_score?: number;
  summary?: string;
}

export interface AnalysisReport {
  characterRelations?: {
    nodes: CharacterRelationNode[];
    edges: CharacterRelationEdge[];
  };
  pacing?: SceneAnalysis[];
}
