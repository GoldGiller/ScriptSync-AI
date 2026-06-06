import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Download, CheckCircle2, Loader2, AlertCircle, Wand2, Search, Trash2, Eye, Calendar, ChevronRight } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import MonacoEditor from '../components/MonacoEditor';
import ScriptPreview from '../components/ScriptPreview';
import { formatYaml, validateYaml } from '../lib/scriptApi';
import type { HistoryItem, ScriptDocument } from '../types';
import { ApiError } from '../lib/api';
import { formatApiErrorDetails } from '../lib/errorUtils';

function History() {
  const navigate = useNavigate();
  const { history, removeHistory } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
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

  const filteredHistory = history.filter((item) =>
    !searchQuery.trim() || item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function setApiErrorState(error: unknown, fallbackMessage: string) {
    if (error instanceof ApiError) { setErrorMessage(error.message); setErrorDetails(formatApiErrorDetails(error.details)); return; }
    setErrorMessage(fallbackMessage); setErrorDetails([]);
  }

  async function runValidation(yamlText: string, mode: 'manual' | 'auto' = 'manual') {
    if (!yamlText.trim()) { setMessage('当前没有可校验的 YAML 内容'); return; }
    const requestId = ++validationRequestIdRef.current;
    if (mode === 'manual') setIsValidating(true);
    else { setIsAutoValidating(true); setMessage('正在自动校验 YAML...'); }
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
    if (!selectedItem || !editedYAML.trim() || isFormatting) return;
    const currentYaml = editedYAML;
    const timer = window.setTimeout(() => { void runValidation(currentYaml, 'auto'); }, 700);
    return () => { window.clearTimeout(timer); };
  }, [editedYAML, selectedItem, isFormatting]);

  function handleSelectItem(item: HistoryItem) {
    setSelectedItem(item);
    setEditedYAML(item.script_yaml);
    setPreviewScript(item.script);
    setMessage('');
    setErrorMessage('');
    setErrorDetails([]);
  }

  async function handleValidate() { await runValidation(editedYAML, 'manual'); }

  async function handleFormat() {
    if (!editedYAML.trim()) { setMessage('当前没有可格式化的 YAML 内容'); return; }
    setIsFormatting(true);
    setErrorMessage('');
    setErrorDetails([]);
    try {
      const result = await formatYaml(editedYAML);
      setEditedYAML(result.formatted_yaml);
      setMessage('YAML 已按后端标准格式化');
      await runValidation(result.formatted_yaml, 'manual');
    } catch (error) { setApiErrorState(error, 'YAML 格式化失败，请稍后重试'); }
    finally { setIsFormatting(false); }
  }

  function handleDownload() {
    if (!editedYAML) return;
    const blob = new Blob([editedYAML], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleDeleteItem(id: string) {
    if (selectedItem?.id === id) {
      setSelectedItem(null);
      setEditedYAML('');
      setPreviewScript(null);
      setMessage('');
      setErrorMessage('');
      setErrorDetails([]);
    }
    removeHistory(id);
  }

  // ── Empty state ──
  if (history.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <HistoryIcon className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">暂无历史记录</h2>
          <p className="text-slate-500 mb-8">开始转换您的第一部小说，转换记录将自动保存在这里。</p>
          <button onClick={() => navigate('/convert')} className="btn-primary">
            <Wand2 className="h-5 w-5" />开始转换
          </button>
        </div>
      </div>
    );
  }

  // ── Detail view ──
  if (selectedItem) {
    return (
      <div className="min-h-screen bg-slate-50 animate-fade-in">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedItem(null)} className="btn-ghost text-sm">
                <ChevronRight className="h-4 w-4 rotate-180" />返回列表
              </button>
              <h1 className="text-xl font-bold text-slate-900 truncate">{selectedItem.title}</h1>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />{selectedItem.created_at}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleValidate} disabled={isValidating} className="btn-ghost text-sm text-indigo-600 hover:bg-indigo-50">
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}校验
              </button>
              <button onClick={handleFormat} disabled={isFormatting} className="btn-ghost text-sm text-emerald-600 hover:bg-emerald-50">
                {isFormatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}格式化
              </button>
              <button onClick={handleDownload} className="btn-primary text-sm py-2">
                <Download className="h-4 w-4" />导出 YAML
              </button>
            </div>
          </div>

          {/* Messages */}
          {(errorMessage || message) && (
            <div className="mb-4 space-y-2">
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{errorMessage}</p>
                    {errorDetails.length > 0 && <ul className="mt-1 list-disc pl-5 space-y-0.5">{errorDetails.map((d, i) => <li key={`${d}-${i}`}>{d}</li>)}</ul>}
                  </div>
                </div>
              )}
              {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />{message}
                  {isAutoValidating && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                </div>
              )}
            </div>
          )}

          {/* Editor + Preview */}
          <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-240px)]">
            <div className="card flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-slate-900">YAML 编辑器</h2>
              </div>
              <div className="flex-1 p-3">
                <MonacoEditor value={editedYAML} onChange={(val: string | undefined) => setEditedYAML(val || '')} height="100%" />
              </div>
            </div>
            <div className="card flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-slate-900">剧本预览</h2>
              </div>
              <div className="flex-1 p-3">
                <div className="h-full overflow-hidden rounded-xl border border-slate-200">
                  <ScriptPreview script={previewScript} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">历史记录</h1>
          <p className="text-slate-500">{history.length} 条转换记录</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索标题..."
            className="input-field pl-10 py-2.5 text-sm w-56"
          />
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="card p-5 group cursor-pointer hover:shadow-lg transition-all"
            onClick={() => handleSelectItem(item)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">{item.title}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{item.created_at}</span>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              {item.original_text.slice(0, 120)}{item.original_text.length > 120 ? '...' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleSelectItem(item); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />查看
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">没有找到匹配 "{searchQuery}" 的记录</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 text-amber-600 hover:text-amber-700 font-medium text-sm">清除搜索</button>
        </div>
      )}
    </div>
  );
}

export default History;
