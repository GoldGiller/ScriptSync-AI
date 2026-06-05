import { Calendar, Trash2, Eye } from 'lucide-react';
import type { HistoryItem } from '../types';

interface HistoryCardProps {
  item: HistoryItem;
  onView: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

function HistoryCard({ item, onView, onDelete }: HistoryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {item.title}
          </h3>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{item.created_at}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
          {item.original_text.slice(0, 200)}
          {item.original_text.length > 200 && '...'}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(item)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>查看</span>
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default HistoryCard;
