import { memo } from 'react';
import type { ScriptDocument } from '../types';

interface ScriptPreviewProps {
  script: ScriptDocument | null;
}

function ScriptPreview({ script }: ScriptPreviewProps) {
  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm">暂无预览内容</p>
        <p className="text-xs text-slate-400">校验 YAML 后将在此显示剧本结构</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Title area */}
        <div className="text-center mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{script.title}</h1>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <span>{script.genre}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{script.version}</span>
          </div>
        </div>

        {/* Premise */}
        {script.premise && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">前言</h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{script.premise}</p>
            </div>
          </div>
        )}

        {/* Characters */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">角色</h2>
          <div className="grid gap-2">
            {script.characters.map((char, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold text-sm">{char.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-amber-800 text-sm">{char.name}</p>
                  <p className="text-xs text-amber-600">{char.role || '待设定'}{char.summary ? ` · ${char.summary}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenes */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">场景</h2>
          <div className="space-y-4">
            {script.scenes.map((scene) => (
              <div key={scene.scene_id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">{scene.scene_id}</span>
                    <h3 className="text-lg font-bold text-slate-900">{scene.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{scene.location}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{scene.time}</span>
                  </div>
                  {scene.summary && (
                    <p className="mt-2 text-sm text-slate-600">{scene.summary}</p>
                  )}
                </div>

                <div className="space-y-3">
                  {scene.dialogues.map((dialogue, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-24 flex-shrink-0 text-right">
                        <p className="font-semibold text-indigo-700 text-sm">{dialogue.speaker}</p>
                        {dialogue.emotion && (
                          <p className="text-xs text-slate-400 mt-0.5">{dialogue.emotion}</p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 text-sm leading-relaxed">{dialogue.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ScriptPreview);
