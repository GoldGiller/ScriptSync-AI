export interface CharacterProfile {
  name: string;
  role: string;
  summary: string;
}

export interface DialogueLine {
  speaker: string;
  content: string;
  emotion: string;
}

export interface SceneBlock {
  scene_id: string;
  title: string;
  location: string;
  time: string;
  summary: string;
  dialogues: DialogueLine[];
}

export interface ScriptDocument {
  version: string;
  title: string;
  genre: string;
  premise: string;
  characters: CharacterProfile[];
  scenes: SceneBlock[];
}

export interface ScriptGenerateRequest {
  title: string;
  source_text: string;
  genre: string;
  target_scene_count: number;
  use_ai: boolean;
}

export interface ScriptGenerateResponseData {
  script: ScriptDocument;
  yaml_text: string;
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
