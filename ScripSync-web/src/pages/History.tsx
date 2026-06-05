import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, X, Download, CheckCircle2, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import HistoryCard from '../components/HistoryCard';
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
  const validationRequestIdRef = useRef(0);

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

    if (mode === 'manual') {
      setIsValidating(true);
    } else {
      setIsAutoValidating(true);
      setMessage('正在自动校验 YAML...');
    }

    setErrorMessage('');
    setErrorDetails([]);

    try {
      const result = await validateYaml(yamlText);
      if (requestId !== validationRequestIdRef.current) {
        return;
      }

      setPreviewScript(result.normalized);
      setMessage(result.valid ? 'YAML 校验通过，预览已同步后端结构' : 'YAML 校验未通过');
    } catch (error) {
      if (requestId !== validationRequestIdRef.current) {
        return;
      }

      setPreviewScript(null);
      setApiErrorState(error, mode === 'manual' ? 'YAML 校验失败，请稍后重试' : '自动校验失败，请检查 YAML 内容');
    } finally {
      if (requestId === validationRequestIdRef.current) {
        if (mode === 'manual') {
          setIsValidating(false);
        } else {
          setIsAutoValidating(false);
        }
      }
    }
  }

  useEffect(() => {
    if (!selectedItem || !editedYAML.trim() || isFormatting) {
      return;
    }

    const currentYaml = editedYAML;
    const timer = window.setTimeout(() => {
      void runValidation(currentYaml, 'auto');
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [editedYAML, selectedItem, isFormatting]);

  function handleView(item: HistoryItem) {
    setSelectedItem(item);
    setEditedYAML(item.script_yaml);
    setPreviewScript(item.script);
    setMessage('');
    setErrorMessage('');
    setErrorDetails([]);
  }

  function handleClose() {
    setSelectedItem(null);
    setEditedYAML('');
    setPreviewScript(null);
    setMessage('');
    setErrorMessage('');
    setErrorDetails([]);
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
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={handleClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">{selectedItem.title}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                校验 YAML
              </button>
              <button
                onClick={handleFormat}
                disabled={isFormatting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isFormatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                格式化 YAML
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                导出 YAML
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{errorMessage}</p>
                  {errorDetails.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                      {errorDetails.map((detail, index) => (
                        <li key={`${detail}-${index}`}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              <div className="flex items-center justify-between gap-3">
                <span>{message}</span>
                {isAutoValidating && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 h-[700px]">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">YAML 编辑器</h2>
              <div className="flex-1">
                <MonacoEditor value={editedYAML} onChange={(val) => setEditedYAML(val || '')} />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">预览</h2>
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <ScriptPreview script={previewScript} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">历史记录</h1>
          <p className="text-slate-600">查看和管理您的转换历史</p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <HistoryIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">暂无历史记录</h2>
            <p className="text-slate-500 mb-6">开始转换您的第一部小说吧！</p>
            <button
              onClick={() => navigate('/convert')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              开始转换
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {history.map((item) => (
              <HistoryCard key={item.id} item={item} onView={handleView} onDelete={removeHistory} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
