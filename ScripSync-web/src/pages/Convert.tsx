import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Sparkles, Loader2, AlertCircle, Wand2, CheckCircle2 } from 'lucide-react';
import MonacoEditor from '../components/MonacoEditor';
import ScriptPreview from '../components/ScriptPreview';
import { useAppStore } from '../hooks/useAppStore';
import { formatYaml, generateScript, validateYaml } from '../lib/scriptApi';
import type { ScriptDocument } from '../types';
import { ApiError } from '../lib/api';
import { formatApiErrorDetails } from '../lib/errorUtils';

function Convert() {
  const { addHistory } = useAppStore();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [targetSceneCount, setTargetSceneCount] = useState(3);
  const [useAi, setUseAi] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputYAML, setOutputYAML] = useState('');
  const [previewScript, setPreviewScript] = useState<ScriptDocument | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAutoValidating, setIsAutoValidating] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState('');
  const validationRequestIdRef = useRef(0);

  const derivedTitle = useMemo(() => {
    if (title.trim()) {
      return title.trim();
    }

    return inputText.trim().slice(0, 20) || '未命名作品';
  }, [inputText, title]);

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
      setValidationMessage('当前没有可校验的 YAML 内容');
      return;
    }

    const requestId = ++validationRequestIdRef.current;

    if (mode === 'manual') {
      setIsValidating(true);
    } else {
      setIsAutoValidating(true);
      setValidationMessage('正在自动校验 YAML...');
    }

    setErrorMessage('');
    setErrorDetails([]);

    try {
      const result = await validateYaml(yamlText);
      if (requestId !== validationRequestIdRef.current) {
        return;
      }

      setPreviewScript(result.normalized);
      setValidationMessage(result.valid ? 'YAML 校验通过，预览已同步后端结构' : 'YAML 校验未通过');
    } catch (error) {
      if (requestId !== validationRequestIdRef.current) {
        return;
      }

      setPreviewScript(null);
      setApiErrorState(error, mode === 'manual' ? 'YAML 校验失败，请检查内容后重试' : '自动校验失败，请检查 YAML 内容');
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
    if (!showResult || !outputYAML.trim() || isFormatting || isConverting) {
      return;
    }

    const currentYaml = outputYAML;
    const timer = window.setTimeout(() => {
      void runValidation(currentYaml, 'auto');
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [outputYAML, showResult, isFormatting, isConverting]);

  async function handleConvert() {
    if (!inputText.trim()) {
      setErrorMessage('请输入小说文本');
      setErrorDetails([]);
      return;
    }

    if (inputText.trim().length < 20) {
      setErrorMessage('小说文本至少需要 20 个字符，才能调用后端生成剧本');
      setErrorDetails([]);
      return;
    }

    setErrorMessage('');
    setErrorDetails([]);
    setValidationMessage('');
    setIsConverting(true);

    try {
      const result = await generateScript({
        title: derivedTitle,
        source_text: inputText,
        genre: genre.trim(),
        target_scene_count: targetSceneCount,
        use_ai: useAi,
      });

      setOutputYAML(result.yaml_text);
      setPreviewScript(result.script);
      setShowResult(true);
      setValidationMessage('已根据后端返回结果生成剧本');

      addHistory({
        id: Date.now().toString(),
        title: derivedTitle,
        original_text: inputText,
        script_yaml: result.yaml_text,
        created_at: new Date().toISOString().split('T')[0],
        script: result.script,
      });
    } catch (error) {
      setApiErrorState(error, '调用后端生成剧本失败，请稍后重试');
    } finally {
      setIsConverting(false);
    }
  }

  async function handleValidate() {
    await runValidation(outputYAML, 'manual');
  }

  async function handleFormat() {
    if (!outputYAML.trim()) {
      setValidationMessage('当前没有可格式化的 YAML 内容');
      return;
    }

    setIsFormatting(true);
    setErrorMessage('');
    setErrorDetails([]);

    try {
      const result = await formatYaml(outputYAML);
      setOutputYAML(result.formatted_yaml);
      setValidationMessage('YAML 已按后端标准格式化');

      await runValidation(result.formatted_yaml, 'manual');
    } catch (error) {
      setApiErrorState(error, 'YAML 格式化失败，请稍后重试');
    } finally {
      setIsFormatting(false);
    }
  }

  function handleDownload() {
    const blob = new Blob([outputYAML], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!showResult) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">小说转剧本</h1>
            <p className="text-slate-600">以后端 API 为准生成结构化剧本，并返回标准 YAML</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">作品标题</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="可选，不填则自动截取正文前 20 个字"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">题材</label>
                <input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="如：悬疑、都市、古风"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">目标场景数</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={targetSceneCount}
                  onChange={(e) => setTargetSceneCount(Number(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <label className="inline-flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                优先使用 AI 生成（后端需已配置 AI_API_KEY）
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">小说文本</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此粘贴小说文本，至少 20 个字符..."
                className="w-full h-96 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">当前长度：{inputText.trim().length} 字符</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
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

          <div className="flex justify-center">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-lg font-semibold rounded-xl shadow-lg transition-all"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  调用后端生成剧本
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">转换结果</h1>
            <p className="text-slate-600">左侧编辑 YAML，右侧预览基于后端校验后的结构</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowResult(false);
                setOutputYAML('');
                setPreviewScript(null);
                setErrorMessage('');
                setErrorDetails([]);
                setValidationMessage('');
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              重新转换
            </button>
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

        {validationMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            <div className="flex items-center justify-between gap-3">
              <span>{validationMessage}</span>
              {isAutoValidating && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 h-[700px]">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">YAML 编辑器</h2>
            <div className="flex-1">
              <MonacoEditor value={outputYAML} onChange={(val) => setOutputYAML(val || '')} />
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

export default Convert;
