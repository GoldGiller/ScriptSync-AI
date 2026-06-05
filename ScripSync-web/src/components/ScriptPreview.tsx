import type { ScriptDocument } from '../types';

interface ScriptPreviewProps {
  script: ScriptDocument | null;
}

function ScriptPreview({ script }: ScriptPreviewProps) {
  if (!script) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>暂无预览内容</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {script.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {script.genre} · {script.version}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            前言
          </h2>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {script.premise || '暂无前言'}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            角色
          </h2>
          <div className="grid gap-3">
            {script.characters.map((char, idx) => (
              <div
                key={idx}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  {char.name}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  {char.role || '待设定'}
                </p>
                {char.summary && (
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    {char.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            场景
          </h2>
          <div className="space-y-6">
            {script.scenes.map((scene) => (
              <div
                key={scene.scene_id}
                className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {scene.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {scene.location} · {scene.time} · {scene.scene_id}
                  </p>
                  <p className="mt-2 text-slate-700 dark:text-slate-300">
                    {scene.summary}
                  </p>
                </div>

                <div className="space-y-4">
                  {scene.dialogues.map((dialogue, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-32 flex-shrink-0">
                        <p className="font-semibold text-indigo-700 dark:text-indigo-400">
                          {dialogue.speaker}
                        </p>
                        {dialogue.emotion && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {dialogue.emotion}
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 dark:text-slate-200">
                          {dialogue.content}
                        </p>
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

export default ScriptPreview;
