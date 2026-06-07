import { memo } from 'react';
import type { PreviewNodeRef, SceneBlock, ScriptDocument } from '../types';
import { createPreviewNodeRef, isPreviewNodeActive } from '../utils/yamlLocator';

interface ScriptPreviewProps {
  script: ScriptDocument | null;
  activeNodePath?: string | null;
  onNodeSelect?: (node: PreviewNodeRef) => void;
  sceneFilterId?: string | null;
}

function getInteractiveClass(active: boolean) {
  return active
    ? 'ring-2 ring-amber-400 border-amber-300 bg-amber-50/80 dark:border-amber-500/50 dark:bg-amber-500/10'
    : 'hover:border-amber-200 hover:bg-amber-50/40 dark:hover:border-amber-500/30 dark:hover:bg-slate-800';
}

function ScenePreviewCard({
  scene,
  activeNodePath,
  onNodeSelect,
}: {
  scene: SceneBlock;
  activeNodePath: string | null;
  onNodeSelect?: (node: PreviewNodeRef) => void;
}) {
  const scenePath = `scenes[${scene.scene_id}]`;
  const sceneActive = isPreviewNodeActive(activeNodePath, scenePath);

  return (
    <div
      className={`p-5 rounded-xl border shadow-sm transition-all cursor-pointer ${getInteractiveClass(sceneActive)} bg-white dark:bg-slate-900 dark:border-slate-700 dark:shadow-none`}
      onClick={() => onNodeSelect?.(createPreviewNodeRef(scenePath, { kind: 'scene', sceneId: scene.scene_id }))}
    >
      <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md dark:bg-indigo-500/15 dark:text-indigo-300">{scene.scene_id}</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{scene.title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{scene.location}</span>
          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          <span>{scene.time}</span>
        </div>
        {scene.summary && (
          <button
            type="button"
            className={`mt-3 block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition-all border ${
              isPreviewNodeActive(activeNodePath, `${scenePath}.summary`)
                ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
                : 'border-transparent hover:border-amber-200 hover:bg-amber-50/60 dark:hover:border-amber-500/30 dark:hover:bg-slate-800'
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onNodeSelect?.(createPreviewNodeRef(`${scenePath}.summary`, { kind: 'scene-summary', sceneId: scene.scene_id }));
            }}
          >
            {scene.summary}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {scene.dialogues.map((dialogue, index) => {
          const dialogueIndex = dialogue.dialogue_index ?? index;
          const dialoguePath = `${scenePath}.dialogues[${dialogueIndex}]`;
          const dialogueActive = isPreviewNodeActive(activeNodePath, dialoguePath);

          return (
            <button
              type="button"
              key={`${scene.scene_id}-${dialogueIndex}`}
              className={`flex w-full gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                dialogueActive
                  ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10'
                  : 'border-transparent hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:border-indigo-500/30 dark:hover:bg-slate-800'
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onNodeSelect?.(
                  createPreviewNodeRef(dialoguePath, {
                    kind: 'dialogue',
                    sceneId: scene.scene_id,
                    dialogueIndex,
                  })
                );
              }}
            >
              <div className="w-24 flex-shrink-0 text-right">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">{dialogue.speaker}</p>
                {dialogue.emotion && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{dialogue.emotion}</p>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{dialogue.content}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScriptPreview({ script, activeNodePath = null, onNodeSelect, sceneFilterId = null }: ScriptPreviewProps) {
  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-3">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
          <svg className="h-8 w-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm">暂无预览内容</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">校验 YAML 后，这里会显示剧本结构。</p>
      </div>
    );
  }

  const visibleScenes = sceneFilterId
    ? script.scenes.filter((scene) => scene.scene_id === sceneFilterId)
    : script.scenes;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          className={`text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-700 w-full transition-all rounded-xl ${
            isPreviewNodeActive(activeNodePath, 'title') || isPreviewNodeActive(activeNodePath, 'premise')
              ? 'bg-amber-50 dark:bg-amber-500/10'
              : ''
          }`}
          onClick={() => onNodeSelect?.(createPreviewNodeRef('title', { kind: 'title' }))}
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{script.title}</h1>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{script.genre}</span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
            <span>{script.version}</span>
          </div>
        </button>

        {script.premise && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">前言</h2>
            <button
              type="button"
              className={`w-full p-4 rounded-xl border text-left transition-all ${getInteractiveClass(isPreviewNodeActive(activeNodePath, 'premise'))}`}
              onClick={() => onNodeSelect?.(createPreviewNodeRef('premise', { kind: 'premise' }))}
            >
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">{script.premise}</p>
            </button>
          </div>
        )}

        {!sceneFilterId && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">角色</h2>
            <div className="grid gap-2">
              {script.characters.map((character, index) => {
                const name = character.character_name || character.name;
                const path = `characters[${name}]`;
                const active = isPreviewNodeActive(activeNodePath, path);
                return (
                  <button
                    type="button"
                    key={`${name}-${index}`}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${getInteractiveClass(active)}`}
                    onClick={() => onNodeSelect?.(createPreviewNodeRef(path, { kind: 'character', characterName: name }))}
                  >
                    <div className="w-10 h-10 bg-amber-200 dark:bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 dark:text-amber-300 font-bold text-sm">{character.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">{character.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">{character.role || '待设定'}{character.summary ? ` · ${character.summary}` : ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">场景</h2>
          <div className="space-y-4">
            {visibleScenes.map((scene) => (
              <ScenePreviewCard
                key={scene.scene_id}
                scene={scene}
                activeNodePath={activeNodePath}
                onNodeSelect={onNodeSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ScriptPreview);
