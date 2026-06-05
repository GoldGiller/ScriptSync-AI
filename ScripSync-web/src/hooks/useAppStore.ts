import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryItem, ScriptDocument } from '../types';

interface AppState {
  history: HistoryItem[];
  currentScript: ScriptDocument | null;
  addHistory: (item: HistoryItem) => void;
  removeHistory: (id: string) => void;
  setCurrentScript: (script: ScriptDocument | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      history: [],
      currentScript: null,
      addHistory: (item) =>
        set((state) => ({ history: [item, ...state.history] })),
      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      setCurrentScript: (script) => set({ currentScript: script }),
    }),
    {
      name: 'script-sync-storage',
    }
  )
);
