import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryItem, NotificationItem, ScriptDocument } from '../types';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'welcome',
    title: '欢迎使用消息中心',
    content: '您可以在这里查看系统提醒、转换结果提示与 YAML 校验动态。',
    created_at: '2026-06-06',
    read: false,
    type: 'system',
  },
  {
    id: 'conversion-tips',
    title: '开始一次新的剧本转换',
    content: '导入小说内容后，系统会自动为您识别标题、题材与结构信息。',
    created_at: '2026-06-06',
    read: false,
    type: 'conversion',
  },
  {
    id: 'validation-tips',
    title: 'YAML 校验已就绪',
    content: '转换完成后可使用校验与格式化能力，确保预览结果与后端结构一致。',
    created_at: '2026-06-06',
    read: true,
    type: 'validation',
  },
];

interface AppState {
  history: HistoryItem[];
  currentScript: ScriptDocument | null;
  notifications: NotificationItem[];
  addHistory: (item: HistoryItem) => void;
  removeHistory: (id: string) => void;
  setCurrentScript: (script: ScriptDocument | null) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      history: [],
      currentScript: null,
      notifications: DEFAULT_NOTIFICATIONS,
      addHistory: (item) =>
        set((state) => ({ history: [item, ...state.history] })),
      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      setCurrentScript: (script) => set({ currentScript: script }),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, read: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'script-sync-storage',
    }
  )
);
