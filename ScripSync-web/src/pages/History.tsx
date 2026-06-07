import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  GitBranch,
  History as HistoryIcon,
  Layers3,
  Loader2,
  Search,
  Wand2,
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import MonacoEditor from '../components/MonacoEditor';
import ScriptPreview from '../components/ScriptPreview';
import HistoryCard from '../components/HistoryCard';
import BranchSwitcher from '../components/BranchSwitcher';
import { formatYaml, validateYaml } from '../lib/scriptApi';
import type { Branch, Project, ScriptDocument, VersionSnapshot } from '../types';
import { ApiError } from '../lib/api';
import { formatApiErrorDetails } from '../lib/errorUtils';

function History() {
  const navigate = useNavigate();
  const {
    projects,
    branches,
    versions,
    activeProjectId,
    activeBranchId,
    activeVersionId,
    switchActiveVersion,
    migrateLegacyHistoryIfNeeded,
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editedYAML, setEditedYAML] = useState('');
  const [previewScript, setPreviewScript] = useState<ScriptDocument | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAutoValidating, setIsAutoValidating] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const validationRequestIdRef = useRef(0);

  useEffect(() => {
    migrateLegacyHistoryIfNeeded();
  }, [migrateLegacyHistoryIfNeeded]);

  const projectCards = useMemo(() => {
    return projects
      .filter((project) => !searchQuery.trim() || project.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((project) => {
        const projectBranches = branches.filter((branch) => branch.projectId === project.id);
        const latestVersion = versions
          .filter((version) => version.projectId === project.id)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] || null;
        return { project, branches: projectBranches, latestVersion };
      });
  }, [branches, projects, searchQuery, versions]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const selectedProjectBranches = useMemo(
    () => branches.filter((branch) => branch.projectId === selectedProjectId),
    [branches, selectedProjectId]
  );

  const selectedBranch = useMemo(
    () =>
      selectedProjectBranches.find((branch) => branch.id === activeBranchId)
      || selectedProjectBranches[0]
      || null,
    [activeBranchId, selectedProjectBranches]
  );

  const branchVersions = useMemo(() => {
    if (!selectedBranch) return [];
    return versions
      .filter((version) => version.branchId === selectedBranch.id)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }, [selectedBranch, versions]);

  const selectedVersion = useMemo(
    () => branchVersions.find((version) => version.id === activeVersionId) || branchVersions[0] || null,
    [activeVersionId, branchVersions]
  );

  function setApiErrorState(error: unknown, fallbackMessage: string) {
    if (error instanceof ApiError) {
      setErrorMessage(error.message);
      setErrorDetails(formatApiErrorDetails(error.details));
      return;
    }
    setErrorMessage(fallbackMessage);
    setErrorDetails([]);
  }

  async function runValidation(yamlText: string, mode: 'manual' | 'auto' = 'manual') {
    if (!yamlText.trim()) {
      setMessage('当前没有可校验的 YAML 内容');
      return;
    }
    const requestId = ++validationRequestIdRef.current;
    if (mode === 'manual') setIsValidating(true);
    else {
      setIsAutoValidating(true);
      setMessage('正在自动校验 YAML...');
    }
    setErrorMessage('');
    setErrorDetails([]);
    try {
      const result = await validateYaml(yamlText);
      if (requestId !== validationRequestIdRef.current) return;
      setPreviewScript(result.normalized);
      setMessage(result.valid ? 'YAML 校验通过，预览已同步后端结构' : 'YAML 校验未通过');
    } catch (error) {
      if (requestId !== validationRequestIdRef.current) return;
      setPreviewScript(null);
      setApiErrorState(error, mode === 'manual' ? 'YAML 校验失败，请稍后重试' : '自动校验失败，请检查 YAML 内容');
    } finally {
      if (requestId === validationRequestIdRef.current) {
        if (mode === 'manual') setIsValidating(false);
        else setIsAutoValidating(false);
      }
    }
  }

  useEffect(() => {
    if (!selectedVersion || !editedYAML.trim() || isFormatting) return;
    const currentYaml = editedYAML;
    const timer = window.setTimeout(() => { void runValidation(currentYaml, 'auto'); }, 700);
    return () => window.clearTimeout(timer);
  }, [editedYAML, isFormatting, selectedVersion]);

  useEffect(() => {
    if (!selectedVersion) return;
    setEditedYAML(selectedVersion.scriptYaml);
    setPreviewScript(selectedVersion.script);
    setMessage('');
    setErrorMessage('');
    setErrorDetails([]);
  }, [selectedVersion]);

  function openProject(projectId: string) {
    setSelectedProjectId(projectId);
  }

  function switchBranch(branchId: string) {
    const firstVersion = versions
      .filter((version) => version.branchId === branchId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
    if (firstVersion) {
      switchActiveVersion(firstVersion.id);
    }
  }

  function switchVersion(versionId: string) {
    switchActiveVersion(versionId);
  }

  async function handleValidate() {
    await runValidation(editedYAML, 'manual');
  }

  async function handleFormat() {
    if (!editedYAML.trim()) {
      setMessage('当前没有可格式化的 YAML 内容');
      return;
    }
    setIsFormatting(true);
    setErrorMessage('');
    setErrorDetails([]);
    try {
      const result = await formatYaml(editedYAML);
      setEditedYAML(result.formatted_yaml);
      setMessage('YAML 已按后端标准格式化');
      await runValidation(result.formatted_yaml, 'manual');
    } catch (error) {
      setApiErrorState(error, 'YAML 格式化失败，请稍后重试');
    } finally {
      setIsFormatting(false);
    }
  }

  function handleDownload() {
    if (!editedYAML) return;
    const blob = new Blob([editedYAML], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'script.yaml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <HistoryIcon className="h-10 w-10 text-slate-300 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">暂无历史记录</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">开始转换第一部作品后，这里会自动保存项目、分支和版本。</p>
          <button onClick={() => navigate('/convert')} className="btn-primary">
            <Wand2 className="h-5 w-5" />开始转换
          </button>
        </div>
      </div>
    );
  }

  if (selectedProject && selectedVersion) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-fade-in transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedProjectId(null)} className="btn-ghost text-sm">
                <ChevronRight className="h-4 w-4 rotate-180" />返回项目列表
              </button>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{selectedProject.title}</h1>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />{selectedVersion.createdAt.slice(0, 10)}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleValidate} disabled={isValidating} className="btn-ghost text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10">
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}校验
              </button>
              <button onClick={handleFormat} disabled={isFormatting} className="btn-ghost text-sm text-emerald-600 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10">
                {isFormatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}格式化
              </button>
              <button onClick={handleDownload} className="btn-primary text-sm py-2">
                <Download className="h-4 w-4" />导出 YAML
              </button>
            </div>
          </div>

          <div className="grid xl:grid-cols-[280px_minmax(0,1fr)] gap-4 mb-4">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">项目概览</h3>
                  <p className="mt-1 text-xs text-slate-500">按项目、分支、版本浏览当前的剧本演化历史。</p>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><GitBranch className="h-4 w-4" />分支数</span>
                    <span>{selectedProjectBranches.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Layers3 className="h-4 w-4" />版本数</span>
                    <span>{selectedProjectBranches.reduce((count, branch) => count + branch.versionIds.length, 0)}</span>
                  </div>
                </div>
              </div>

              <BranchSwitcher
                branches={selectedProjectBranches}
                activeBranchId={selectedBranch?.id || activeBranchId || null}
                onSwitch={switchBranch}
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">版本列表</h3>
                  <p className="mt-1 text-xs text-slate-500">点击版本可恢复对应的 YAML 和预览内容。</p>
                </div>
                <div className="space-y-2">
                  {branchVersions.map((version) => {
                    const active = version.id === selectedVersion.id;
                    return (
                      <button
                        type="button"
                        key={version.id}
                        onClick={() => switchVersion(version.id)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                          active
                            ? 'border-amber-300 bg-amber-50'
                            : 'border-slate-200 hover:border-amber-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-slate-900">{version.title}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{version.source}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{version.createdAt.replace('T', ' ').slice(0, 16)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {(errorMessage || message) && (
                <div className="space-y-2">
                  {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-start gap-3 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{errorMessage}</p>
                        {errorDetails.length > 0 && <ul className="mt-1 list-disc pl-5 space-y-0.5">{errorDetails.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}</ul>}
                      </div>
                    </div>
                  )}
                  {message && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm flex items-center gap-2 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      {message}
                      {isAutoValidating && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                    </div>
                  )}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-260px)]">
                <div className="card flex flex-col overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">YAML 编辑器</h2>
                  </div>
                  <div className="flex-1 p-3">
                    <MonacoEditor value={editedYAML} onChange={(value) => setEditedYAML(value || '')} height="100%" />
                  </div>
                </div>
                <div className="card flex flex-col overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">剧本预览</h2>
                  </div>
                  <div className="flex-1 p-3">
                    <div className="h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <ScriptPreview script={previewScript} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">项目历史</h1>
          <p className="text-slate-500 dark:text-slate-400">{projects.length} 个项目</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索项目标题..."
            className="input-field pl-10 py-2.5 text-sm w-56"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectCards.map(({ project, branches: projectBranches, latestVersion }) => (
          <HistoryCard
            key={project.id}
            project={project}
            branches={projectBranches}
            latestVersion={latestVersion}
            onView={openProject}
          />
        ))}
      </div>

      {projectCards.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">没有找到匹配 “{searchQuery}” 的项目</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm">清除搜索</button>
        </div>
      )}
    </div>
  );
}

export default History;
