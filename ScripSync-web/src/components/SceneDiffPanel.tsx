import type { SceneBlock } from '../types';

interface SceneDiffPanelProps {
  scenes: SceneBlock[];
  activeSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
}

function SceneDiffPanel({ scenes, activeSceneId, onSelectScene }: SceneDiffPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">场景对比</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">按场景切换，查看当前版本和上一版润色结果在单场戏上的差异。</p>
      </div>
      <div className="space-y-2">
        {scenes.map((scene) => {
          const active = scene.scene_id === activeSceneId;
          return (
            <button
              type="button"
              key={scene.scene_id}
              onClick={() => onSelectScene(scene.scene_id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                active
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10'
                  : 'border-slate-200 hover:border-amber-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-amber-500/40 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{scene.scene_id}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{scene.title}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{scene.summary || '暂无摘要'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SceneDiffPanel;
