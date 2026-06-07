import type { Branch } from '../types';

interface BranchSwitcherProps {
  branches: Branch[];
  activeBranchId: string | null;
  onSwitch: (branchId: string) => void;
}

function BranchSwitcher({ branches, activeBranchId, onSwitch }: BranchSwitcherProps) {
  if (branches.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">分支切换</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">同一作品下可以保留多个 AI 润色方向，便于比较不同版本分支。</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {branches.map((branch) => {
          const active = branch.id === activeBranchId;
          return (
            <button
              type="button"
              key={branch.id}
              onClick={() => onSwitch(branch.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {branch.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BranchSwitcher;
