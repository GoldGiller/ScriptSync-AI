import type { SceneBlock } from '../types';

interface VersionComparePanelProps {
  title: string;
  badge: string;
  scene: SceneBlock | null;
  emptyText: string;
}

function VersionComparePanel({ title, badge, scene, emptyText }: VersionComparePanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 h-full dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">聚焦单个场景，更适合演示 AI 润色前后在结构和对白上的变化。</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{badge}</span>
      </div>

      {!scene ? (
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300 dark:shadow-none">{scene.scene_id}</span>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{scene.title}</h4>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{scene.location || '未填写地点'}</span>
              <span>{scene.time || '未填写时间'}</span>
              <span>{scene.dialogues.length} 段对白</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{scene.summary || '暂无摘要'}</p>
          </div>

          <div className="space-y-3">
            {scene.dialogues.map((dialogue, index) => (
              <div key={`${scene.scene_id}-${index}`} className="rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-indigo-700">{dialogue.speaker}</p>
                  {dialogue.emotion && <span className="text-xs text-slate-400 dark:text-slate-500">{dialogue.emotion}</span>}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{dialogue.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VersionComparePanel;
