import yaml from 'js-yaml';
import type { ScriptDocument } from '../types';
import { buildExampleScript } from '../lib/scriptApi';

export function parseYAML(yamlStr: string): ScriptDocument | null {
  try {
    const data = yaml.load(yamlStr);
    return data as ScriptDocument;
  } catch (e) {
    console.error('YAML 解析错误:', e);
    return null;
  }
}

export function dumpYAML(script: ScriptDocument) {
  return yaml.dump(script, { indent: 2, lineWidth: -1, sortKeys: false });
}

export function generateSampleYAML() {
  return dumpYAML(buildExampleScript());
}
