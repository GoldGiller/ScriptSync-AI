import { Bell, CheckCheck, Inbox, Trash2 } from 'lucide-react';
import type { NotificationItem } from '../types';

interface MessageCenterProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const TYPE_STYLES: Record<NotificationItem['type'], string> = {
  system: 'badge-indigo',
  conversion: 'badge-amber',
  validation: 'badge-emerald',
};

const TYPE_LABELS: Record<NotificationItem['type'], string> = {
  system: '系统',
  conversion: '转换',
  validation: '校验',
};

function MessageCenter({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
  onRemove,
}: MessageCenterProps) {
  return (
    <div className="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">消息中心</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount > 0 ? `${unreadCount} 条未读消息` : '暂无未读消息'}</p>
        </div>
        <button
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-amber-500/10"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          全部已读
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Inbox className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">暂无消息</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">新的系统提醒会显示在这里。</p>
        </div>
      ) : (
        <div className="max-h-[24rem] overflow-y-auto p-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`group rounded-xl border px-3 py-3 transition-colors ${
                item.read
                  ? 'border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  : 'border-amber-200 bg-amber-50/70 hover:bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/15'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onMarkAsRead(item.id)}
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm transition-colors hover:bg-amber-100 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
                  title={item.read ? '已读消息' : '标记为已读'}
                >
                  <Bell className="h-4 w-4" />
                </button>
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => onMarkAsRead(item.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`badge ${TYPE_STYLES[item.type]}`}>{TYPE_LABELS[item.type]}</span>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.content}</p>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{item.created_at}</p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="opacity-0 transition-opacity text-slate-400 hover:text-rose-500 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-rose-400"
                  title="删除消息"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageCenter;
