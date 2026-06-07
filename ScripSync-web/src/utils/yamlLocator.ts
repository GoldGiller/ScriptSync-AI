import type { PreviewNodeRef, SceneBlock, ScriptDocument, YamlLineRange, YamlLocationMap } from '../types';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findLineIndex(lines: string[], pattern: RegExp, startAt = 0) {
  for (let index = startAt; index < lines.length; index += 1) {
    if (pattern.test(lines[index])) {
      return index;
    }
  }
  return -1;
}

function toLineRange(startIndex: number, endIndex: number): YamlLineRange {
  return {
    startLine: startIndex + 1,
    endLine: endIndex + 1,
  };
}

function findIndentedBlockEnd(lines: string[], startIndex: number, baseIndent: number) {
  let endIndex = startIndex;
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      endIndex = index;
      continue;
    }

    const indent = line.length - line.trimStart().length;
    if (indent <= baseIndent && !trimmed.startsWith('- ')) {
      break;
    }
    endIndex = index;
  }
  return endIndex;
}

function scenePath(sceneId: string) {
  return `scenes[${sceneId}]`;
}

function dialoguePath(sceneId: string, dialogueIndex: number) {
  return `${scenePath(sceneId)}.dialogues[${dialogueIndex}]`;
}

export function buildYamlLocationMap(yamlText: string, script: ScriptDocument | null): YamlLocationMap {
  if (!yamlText.trim() || !script) {
    return {};
  }

  const lines = yamlText.split(/\r?\n/);
  const locationMap: YamlLocationMap = {};

  const titleLine = findLineIndex(lines, /^\s*title:/);
  if (titleLine >= 0) {
    locationMap.title = toLineRange(titleLine, titleLine);
  }

  const premiseLine = findLineIndex(lines, /^\s*premise:/);
  if (premiseLine >= 0) {
    const endLine = findIndentedBlockEnd(lines, premiseLine, 0);
    locationMap.premise = toLineRange(premiseLine, endLine);
  }

  let characterSearchIndex = findLineIndex(lines, /^\s*characters:\s*$/);
  script.characters.forEach((character) => {
    const name = character.character_name || character.name;
    const matchIndex = findLineIndex(
      lines,
      new RegExp(`^\\s*-\\s+name:\\s*${escapeRegExp(name)}\\s*$`),
      Math.max(characterSearchIndex, 0)
    );
    if (matchIndex >= 0) {
      const endLine = findIndentedBlockEnd(lines, matchIndex, 2);
      locationMap[`characters[${name}]`] = toLineRange(matchIndex, endLine);
      characterSearchIndex = matchIndex + 1;
    }
  });

  let sceneSearchIndex = findLineIndex(lines, /^\s*scenes:\s*$/);
  script.scenes.forEach((scene) => {
    const idIndex = findLineIndex(
      lines,
      new RegExp(`^\\s*-\\s+scene_id:\\s*${escapeRegExp(scene.scene_id)}\\s*$`),
      Math.max(sceneSearchIndex, 0)
    );
    if (idIndex < 0) return;

    const sceneEnd = findIndentedBlockEnd(lines, idIndex, 2);
    const basePath = scenePath(scene.scene_id);
    locationMap[basePath] = toLineRange(idIndex, sceneEnd);

    const summaryIndex = findLineIndex(
      lines,
      /^\s+summary:/,
      idIndex
    );
    if (summaryIndex >= 0 && summaryIndex <= sceneEnd) {
      locationMap[`${basePath}.summary`] = toLineRange(
        summaryIndex,
        findIndentedBlockEnd(lines, summaryIndex, 4)
      );
    }

    let dialogueSearchIndex = findLineIndex(lines, /^\s+dialogues:\s*$/, idIndex);
    if (dialogueSearchIndex >= 0 && dialogueSearchIndex <= sceneEnd) {
      scene.dialogues.forEach((dialogue, dialogueIndex) => {
        const speakerIndex = findLineIndex(
          lines,
          new RegExp(`^\\s+-\\s+speaker:\\s*${escapeRegExp(dialogue.speaker)}\\s*$`),
          dialogueSearchIndex
        );
        if (speakerIndex >= 0 && speakerIndex <= sceneEnd) {
          const endLine = findIndentedBlockEnd(lines, speakerIndex, 6);
          locationMap[dialoguePath(scene.scene_id, dialogue.dialogue_index ?? dialogueIndex)] = toLineRange(
            speakerIndex,
            endLine
          );
          dialogueSearchIndex = speakerIndex + 1;
        }
      });
    }

    sceneSearchIndex = idIndex + 1;
  });

  return locationMap;
}

export function getYamlPathForLine(lineNumber: number, locationMap: YamlLocationMap): string | null {
  const entries = Object.entries(locationMap)
    .filter(([, range]) => lineNumber >= range.startLine && lineNumber <= range.endLine)
    .sort((a, b) => {
      const aSize = a[1].endLine - a[1].startLine;
      const bSize = b[1].endLine - b[1].startLine;
      return aSize - bSize;
    });

  return entries[0]?.[0] || null;
}

export function isPreviewNodeActive(activePath: string | null, nodePath: string) {
  if (!activePath) return false;
  return activePath === nodePath || activePath.startsWith(`${nodePath}.`) || activePath.startsWith(`${nodePath}[`);
}

export function buildSceneExcerptMap(inputText: string, scenes: SceneBlock[]) {
  const normalizedInput = inputText.trim();
  if (!normalizedInput || scenes.length === 0) {
    return {} as Record<string, string>;
  }

  const paragraphs = normalizedInput
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return {} as Record<string, string>;
  }

  const chunkSize = Math.max(1, Math.ceil(paragraphs.length / scenes.length));
  return scenes.reduce<Record<string, string>>((result, scene, index) => {
    const start = index * chunkSize;
    result[scene.scene_id] = paragraphs.slice(start, start + chunkSize).join('\n\n');
    return result;
  }, {});
}

export function createPreviewNodeRef(path: string, partial: Omit<PreviewNodeRef, 'path'>): PreviewNodeRef {
  return { path, ...partial };
}
