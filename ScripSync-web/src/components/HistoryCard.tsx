import { Calendar, Eye, GitBranch, Layers3 } from 'lucide-react';
import type { Branch, Project, VersionSnapshot } from '../types';

interface HistoryCardProps {
  project: Project;
  branches: Branch[];
  latestVersion: VersionSnapshot | null;
  onView: (projectId: string) => void;
}

function HistoryCard({ project, branches, latestVersion, onView }: HistoryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {latestVersion ? latestVersion.createdAt.slice(0, 10) : project.updatedAt.slice(0, 10)}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              {branches.length} 个分支
            </span>
            <span className="flex items-center gap-1">
              <Layers3 className="h-4 w-4" />
              {branches.reduce((count, branch) => count + branch.versionIds.length, 0)} 个版本
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
          {latestVersion?.originalText.slice(0, 200) || '暂无原文摘要'}
          {(latestVersion?.originalText.length || 0) > 200 && '...'}
        </p>
      </div>

      <button
        onClick={() => onView(project.id)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        <Eye className="h-4 w-4" />
        <span>查看项目</span>
      </button>
    </div>
  );
}

export default HistoryCard;
