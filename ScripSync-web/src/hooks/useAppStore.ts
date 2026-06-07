import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Branch,
  HistoryItem,
  NotificationItem,
  Project,
  ScriptDocument,
  VersionSnapshot,
  VersionSource,
} from '../types';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'welcome',
    title: '娆㈣繋浣跨敤娑堟伅涓績',
    content: '鎮ㄥ彲浠ュ湪杩欓噷鏌ョ湅绯荤粺鎻愰啋銆佽浆鎹㈢粨鏋滄彁绀轰笌 YAML 鏍￠獙鍔ㄦ€併€?',
    created_at: '2026-06-06',
    read: false,
    type: 'system',
  },
  {
    id: 'conversion-tips',
    title: '寮€濮嬩竴娆℃柊鐨勫墽鏈浆鎹?',
    content: '瀵煎叆灏忚鍐呭鍚庯紝绯荤粺浼氳嚜鍔ㄤ负鎮ㄨ瘑鍒爣棰樸€侀鏉愪笌缁撴瀯淇℃伅銆?',
    created_at: '2026-06-06',
    read: false,
    type: 'conversion',
  },
  {
    id: 'validation-tips',
    title: 'YAML 鏍￠獙宸插氨缁?',
    content: '杞崲瀹屾垚鍚庡彲浣跨敤鏍￠獙涓庢牸寮忓寲鑳藉姏锛岀‘淇濋瑙堢粨鏋滀笌鍚庣缁撴瀯涓€鑷淬€?',
    created_at: '2026-06-06',
    read: true,
    type: 'validation',
  },
];

const STORE_SCHEMA_VERSION = 2;
const DEFAULT_BRANCH_NAME = 'main';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureScriptShape(script: ScriptDocument | null): ScriptDocument | null {
  if (!script) return null;
  return {
    ...script,
    characters: script.characters.map((character) => ({
      ...character,
      character_name: character.character_name || character.name,
    })),
    scenes: script.scenes.map((scene) => ({
      ...scene,
      dialogues: scene.dialogues.map((dialogue, dialogueIndex) => ({
        ...dialogue,
        dialogue_index: dialogue.dialogue_index ?? dialogueIndex,
      })),
    })),
  };
}

function buildSnapshot(params: {
  projectId: string;
  branchId: string;
  title: string;
  originalText: string;
  scriptYaml: string;
  script: ScriptDocument | null;
  createdAt?: string;
  source: VersionSource;
  sourcePrompt?: string;
}): VersionSnapshot {
  return {
    id: createId('version'),
    projectId: params.projectId,
    branchId: params.branchId,
    title: params.title,
    originalText: params.originalText,
    scriptYaml: params.scriptYaml,
    script: ensureScriptShape(params.script),
    createdAt: params.createdAt || new Date().toISOString(),
    source: params.source,
    sourcePrompt: params.sourcePrompt,
  };
}

interface EnsureProjectParams {
  title: string;
  genre?: string;
}

interface SaveVersionParams {
  projectId?: string | null;
  branchId?: string | null;
  title: string;
  originalText: string;
  scriptYaml: string;
  script: ScriptDocument | null;
  source: VersionSource;
  sourcePrompt?: string;
}

interface CreateBranchParams {
  projectId: string;
  fromVersionId: string;
  name?: string;
}

interface AppState {
  schemaVersion: number;
  legacyHistoryMigrated: boolean;
  history: HistoryItem[];
  projects: Project[];
  branches: Branch[];
  versions: VersionSnapshot[];
  currentScript: ScriptDocument | null;
  notifications: NotificationItem[];
  activeProjectId: string | null;
  activeBranchId: string | null;
  activeVersionId: string | null;
  compareBaseVersionId: string | null;
  ensureProjectForScript: (params: EnsureProjectParams) => { projectId: string; branchId: string };
  saveVersionSnapshot: (params: SaveVersionParams) => VersionSnapshot;
  createBranchFromVersion: (params: CreateBranchParams) => { branch: Branch; version: VersionSnapshot };
  switchActiveVersion: (versionId: string) => void;
  setCompareBaseVersionId: (versionId: string | null) => void;
  removeVersionSnapshot: (versionId: string) => void;
  setCurrentScript: (script: ScriptDocument | null) => void;
  addHistory: (item: HistoryItem) => void;
  removeHistory: (id: string) => void;
  migrateLegacyHistoryIfNeeded: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      schemaVersion: STORE_SCHEMA_VERSION,
      legacyHistoryMigrated: false,
      history: [],
      projects: [],
      branches: [],
      versions: [],
      currentScript: null,
      notifications: DEFAULT_NOTIFICATIONS,
      activeProjectId: null,
      activeBranchId: null,
      activeVersionId: null,
      compareBaseVersionId: null,

      ensureProjectForScript: ({ title, genre }) => {
        const state = get();
        const activeProject = state.projects.find((project) => project.id === state.activeProjectId);
        const activeBranch = state.branches.find((branch) => branch.id === state.activeBranchId);

        if (activeProject && activeBranch) {
          if (!genre || activeProject.genre === genre) {
            return { projectId: activeProject.id, branchId: activeBranch.id };
          }
        }

        const projectId = createId('project');
        const branchId = createId('branch');
        const now = new Date().toISOString();
        const project: Project = {
          id: projectId,
          title,
          genre,
          branchIds: [branchId],
          createdAt: now,
          updatedAt: now,
        };
        const branch: Branch = {
          id: branchId,
          projectId,
          name: DEFAULT_BRANCH_NAME,
          baseVersionId: null,
          versionIds: [],
          createdAt: now,
        };

        set((currentState) => ({
          projects: [project, ...currentState.projects],
          branches: [branch, ...currentState.branches],
          activeProjectId: projectId,
          activeBranchId: branchId,
          activeVersionId: null,
          compareBaseVersionId: null,
        }));

        return { projectId, branchId };
      },

      saveVersionSnapshot: (params) => {
        let projectId = params.projectId ?? get().activeProjectId;
        let branchId = params.branchId ?? get().activeBranchId;

        if (!projectId || !branchId) {
          const created = get().ensureProjectForScript({ title: params.title });
          projectId = created.projectId;
          branchId = created.branchId;
        }

        const previousActiveVersionId = get().activeVersionId;
        const snapshot = buildSnapshot({
          projectId,
          branchId,
          title: params.title,
          originalText: params.originalText,
          scriptYaml: params.scriptYaml,
          script: params.script,
          source: params.source,
          sourcePrompt: params.sourcePrompt,
        });

        set((state) => ({
          versions: [snapshot, ...state.versions],
          branches: state.branches.map((branch) =>
            branch.id === branchId
              ? { ...branch, versionIds: [...branch.versionIds, snapshot.id] }
              : branch
          ),
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, title: params.title, updatedAt: snapshot.createdAt }
              : project
          ),
          currentScript: snapshot.script,
          activeProjectId: projectId,
          activeBranchId: branchId,
          activeVersionId: snapshot.id,
          compareBaseVersionId:
            params.source === 'refine' && previousActiveVersionId
              ? previousActiveVersionId
              : state.compareBaseVersionId,
        }));

        return snapshot;
      },

      createBranchFromVersion: ({ projectId, fromVersionId, name }) => {
        const state = get();
        const baseVersion = state.versions.find((version) => version.id === fromVersionId);
        if (!baseVersion) {
          throw new Error(`Version ${fromVersionId} not found`);
        }

        const branchId = createId('branch');
        const now = new Date().toISOString();
        const branch: Branch = {
          id: branchId,
          projectId,
          name: name || `branch-${state.branches.filter((item) => item.projectId === projectId).length + 1}`,
          baseVersionId: fromVersionId,
          versionIds: [],
          createdAt: now,
        };

        const version = buildSnapshot({
          projectId,
          branchId,
          title: baseVersion.title,
          originalText: baseVersion.originalText,
          scriptYaml: baseVersion.scriptYaml,
          script: baseVersion.script,
          createdAt: now,
          source: 'manual-edit',
          sourcePrompt: `Forked from ${fromVersionId}`,
        });

        const nextBranch: Branch = {
          ...branch,
          versionIds: [version.id],
        };

        set((currentState) => ({
          branches: [nextBranch, ...currentState.branches],
          versions: [version, ...currentState.versions],
          projects: currentState.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  branchIds: [...project.branchIds, branchId],
                  updatedAt: now,
                }
              : project
          ),
          activeProjectId: projectId,
          activeBranchId: branchId,
          activeVersionId: version.id,
          compareBaseVersionId: fromVersionId,
        }));

        return { branch: nextBranch, version };
      },

      switchActiveVersion: (versionId) => {
        const state = get();
        const version = state.versions.find((item) => item.id === versionId);
        if (!version) return;
        set({
          activeProjectId: version.projectId,
          activeBranchId: version.branchId,
          activeVersionId: version.id,
          currentScript: version.script,
        });
      },

      setCompareBaseVersionId: (versionId) => set({ compareBaseVersionId: versionId }),

      removeVersionSnapshot: (versionId) =>
        set((state) => {
          const version = state.versions.find((item) => item.id === versionId);
          if (!version) return state;

          const nextVersions = state.versions.filter((item) => item.id !== versionId);
          const nextBranches = state.branches.map((branch) =>
            branch.id === version.branchId
              ? { ...branch, versionIds: branch.versionIds.filter((id) => id !== versionId) }
              : branch
          );
          const fallbackVersion = nextVersions.find((item) => item.branchId === version.branchId)
            || nextVersions[0]
            || null;

          return {
            versions: nextVersions,
            branches: nextBranches,
            activeProjectId: fallbackVersion?.projectId || null,
            activeBranchId: fallbackVersion?.branchId || null,
            activeVersionId: fallbackVersion?.id || null,
            currentScript: fallbackVersion?.script || null,
            compareBaseVersionId:
              state.compareBaseVersionId === versionId ? null : state.compareBaseVersionId,
          };
        }),

      setCurrentScript: (script) => set({ currentScript: ensureScriptShape(script) }),

      addHistory: (item) =>
        set((state) => ({ history: [item, ...state.history] })),

      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      migrateLegacyHistoryIfNeeded: () => {
        const state = get();
        if (state.legacyHistoryMigrated || state.history.length === 0) {
          if (!state.legacyHistoryMigrated) {
            set({ legacyHistoryMigrated: true, schemaVersion: STORE_SCHEMA_VERSION });
          }
          return;
        }

        const migratedProjects: Project[] = [];
        const migratedBranches: Branch[] = [];
        const migratedVersions: VersionSnapshot[] = [];

        state.history.forEach((item) => {
          const projectId = createId('project');
          const branchId = createId('branch');
          const createdAt = item.created_at.includes('T')
            ? item.created_at
            : `${item.created_at}T00:00:00.000Z`;

          migratedProjects.push({
            id: projectId,
            title: item.title,
            branchIds: [branchId],
            createdAt,
            updatedAt: createdAt,
          });

          migratedBranches.push({
            id: branchId,
            projectId,
            name: DEFAULT_BRANCH_NAME,
            baseVersionId: null,
            versionIds: [],
            createdAt,
          });

          const version = buildSnapshot({
            projectId,
            branchId,
            title: item.title,
            originalText: item.original_text,
            scriptYaml: item.script_yaml,
            script: item.script,
            createdAt,
            source: 'generate',
          });

          migratedVersions.push(version);
          migratedBranches[migratedBranches.length - 1].versionIds.push(version.id);
        });

        const latestVersion = migratedVersions[0] || null;

        set((currentState) => ({
          projects: currentState.projects.length > 0 ? currentState.projects : migratedProjects,
          branches: currentState.branches.length > 0 ? currentState.branches : migratedBranches,
          versions: currentState.versions.length > 0 ? currentState.versions : migratedVersions,
          activeProjectId: currentState.activeProjectId || latestVersion?.projectId || null,
          activeBranchId: currentState.activeBranchId || latestVersion?.branchId || null,
          activeVersionId: currentState.activeVersionId || latestVersion?.id || null,
          currentScript: currentState.currentScript || latestVersion?.script || null,
          legacyHistoryMigrated: true,
          schemaVersion: STORE_SCHEMA_VERSION,
        }));
      },

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
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        legacyHistoryMigrated: state.legacyHistoryMigrated,
        history: state.history,
        projects: state.projects,
        branches: state.branches,
        versions: state.versions,
        currentScript: state.currentScript,
        notifications: state.notifications,
        activeProjectId: state.activeProjectId,
        activeBranchId: state.activeBranchId,
        activeVersionId: state.activeVersionId,
        compareBaseVersionId: state.compareBaseVersionId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.migrateLegacyHistoryIfNeeded();
      },
    }
  )
);
