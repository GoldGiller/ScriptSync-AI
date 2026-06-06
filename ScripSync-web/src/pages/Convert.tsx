import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Download, Sparkles, Loader2, AlertCircle, Wand2, CheckCircle2, Upload,
  BrainCircuit, FilePenLine, PanelLeftClose, PanelLeft, Search, Maximize2,
  Hash, BookOpen
} from 'lucide-react';
import MonacoEditor from '../components/MonacoEditor';
import ScriptPreview from '../components/ScriptPreview';
import AiReasoningPanel from '../components/AiReasoningPanel';
import AiThinkingOverlay from '../components/AiThinkingOverlay';
import { useAppStore } from '../hooks/useAppStore';
import {
  buildGenerateProcessSteps,
  buildRefineProcessSteps,
  formatYaml,
  generateScript,
  importDocument,
  refineScript,
  validateYaml,
} from '../lib/scriptApi';
import type { ProcessStep, ScriptDocument } from '../types';
import { ApiError } from '../lib/api';
import { formatApiErrorDetails } from '../lib/errorUtils';

type LeftPanelTab = 'reasoning' | 'input' | 'refine';

const GENRE_OPTIONS = ['', '悬疑', '都市', '古风', '科幻', '奇幻', '爱情', '历史', '武侠', '校园', '职场'];

function Convert() {
  const { addHistory } = useAppStore();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [targetSceneCount, setTargetSceneCount] = useState(3);
  const [inputText, setInputText] = useState('');
  const [outputYAML, setOutputYAML] = useState('');
  const [previewScript, setPreviewScript] = useState<ScriptDocument | null>(null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [processTitle, setProcessTitle] = useState('AI 推理过程');
  const [processSubtitle, setProcessSubtitle] = useState('展示当前任务的可解释过程摘要与阶段状态。');
  const [isConverting, setIsConverting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isThinkingOverlayVisible, setIsThinkingOverlayVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAutoValidating, setIsAutoValidating] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showRefinePanel, setShowRefinePanel] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('reasoning');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPreviewStale, setIsPreviewStale] = useState(false);
  const validationRequestIdRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const derivedTitle = useMemo(() => {
    if (title.trim()) return title.trim();
    return inputText.trim().slice(0, 20) || '未命名作品';
  }, [inputText, title]);

  // ── all logic functions unchanged ──
  function setApiErrorState(error: unknown, fallbackMessage: string) {
    if (error instanceof ApiError) {
      setErrorMessage(error.message);
      setErrorDetails(formatApiErrorDetails(error.details));
      return;
    }
    setErrorMessage(fallbackMessage);
    setErrorDetails([]);
  }

  const runValidation = useCallback(async (yamlText: string, mode: 'manual' | 'auto' = 'manual') => {
    if (!yamlText.trim()) {
      setValidationMessage('当前没有可校验的 YAML 内容');
      return;
    }
    const requestId = ++validationRequestIdRef.current;
    if (mode === 'manual') setIsValidating(true);
    else setIsAutoValidating(true);
    setErrorMessage('');
    setErrorDetails([]);
    try {
      const result = await validateYaml(yamlText);
      if (requestId !== validationRequestIdRef.current) return;
      setPreviewScript(result.normalized);
      setIsPreviewStale(false);
      setValidationMessage(result.valid ? 'YAML 校验通过，预览已同步后端结构' : 'YAML 校验未通过');
    } catch (error) {
      if (requestId !== validationRequestIdRef.current) return;
      setPreviewScript(null);
      setApiErrorState(error, mode === 'manual' ? 'YAML 校验失败，请检查内容后重试' : '自动校验失败，请检查 YAML 内容');
    } finally {
      if (requestId === validationRequestIdRef.current) {
        if (mode === 'manual') setIsValidating(false);
        else setIsAutoValidating(false);
      }
    }
  }, []);

  function handleYamlChange(value: string | undefined) {
    setOutputYAML(value || '');
    setIsPreviewStale(true);
    setValidationMessage('YAML 已修改，预览待同步，请点击“校验”更新右侧内容');
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsImporting(true);
    setErrorMessage('');
    setErrorDetails([]);
    setImportWarnings([]);
    try {
      const result = await importDocument(file);
      setTitle(result.title);
      setGenre(result.genre);
      setInputText(result.source_text);
      setImportWarnings(result.warnings);
      setValidationMessage(`已导入 ${result.file_name}，并自动识别标题、题材和正文`);
    } catch (error) {
      setApiErrorState(error, '文档导入失败，请稍后重试');
    } finally { setIsImporting(false); }
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragOver(true); }
  function handleDragLeave() { setIsDragOver(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleImportFile({ target: { files: dt.files, value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  }

  async function handleConvert() {
    if (!inputText.trim()) { setErrorMessage('请输入小说文本'); setErrorDetails([]); return; }
    if (inputText.trim().length < 20) { setErrorMessage('小说文本至少需要 20 个字符，才能调用后端生成剧本'); setErrorDetails([]); return; }
    const pendingSteps = buildGenerateProcessSteps({ title: derivedTitle, source_text: inputText, genre: genre.trim(), target_scene_count: targetSceneCount });
    setLeftPanelTab('reasoning');
    setProcessTitle('AI 剧本生成过程');
    setProcessSubtitle('正在根据原始输入分析人物关系、推断题材并组织剧本结构。');
    setProcessSteps(pendingSteps);
    setErrorMessage('');
    setErrorDetails([]);
    setValidationMessage('');
    setIsThinkingOverlayVisible(true);
    setIsConverting(true);
    try {
      const result = await generateScript({ title: derivedTitle, source_text: inputText, genre: genre.trim(), target_scene_count: targetSceneCount });
      setOutputYAML(result.yaml_text);
      setPreviewScript(result.script);
      setIsPreviewStale(false);
      setProcessSteps(result.process_steps);
      setShowResult(true);
      setShowRefinePanel(true);
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
      setProcessSteps((steps) => steps.map((step, index) =>
        index === steps.findIndex((item) => item.status === 'active')
          ? { ...step, status: 'failed', detail: '该阶段执行失败，请检查错误信息后重试。' } : step));
      setApiErrorState(error, '调用后端生成剧本失败，请稍后重试');
    } finally { setIsConverting(false); setIsThinkingOverlayVisible(false); }
  }

  async function handleRefineWithAi() {
    if (!outputYAML.trim()) { setErrorMessage('当前没有可微调的 YAML 结果'); setErrorDetails([]); return; }
    if (!refinePrompt.trim()) { setErrorMessage('请输入 AI 微调要求'); setErrorDetails([]); return; }
    const prompt = refinePrompt.trim();
    setLeftPanelTab('reasoning');
    setProcessTitle('AI 微调过程');
    setProcessSubtitle('正在基于当前 YAML 与微调要求重新规划剧本结构与表达重点。');
    setProcessSteps(buildRefineProcessSteps(prompt));
    setIsRefining(true);
    setErrorMessage('');
    setErrorDetails([]);
    setValidationMessage('');
    try {
      const result = await refineScript({ title: derivedTitle, source_text: inputText, genre: genre.trim(), current_yaml: outputYAML, refine_prompt: prompt });
      setOutputYAML(result.yaml_text);
      setPreviewScript(result.script);
      setIsPreviewStale(false);
      setProcessSteps(result.process_steps);
      setValidationMessage('AI 已根据微调要求更新剧本结果');
      setRefinePrompt('');
      addHistory({ id: Date.now().toString(), title: derivedTitle, original_text: inputText, script_yaml: result.yaml_text, created_at: new Date().toISOString().split('T')[0], script: result.script });
    } catch (error) {
      setProcessSteps((steps) => steps.map((step, index) =>
        index === steps.findIndex((item) => item.status === 'active')
          ? { ...step, status: 'failed', detail: '该阶段执行失败，请检查错误信息后重试。' } : step));
      setApiErrorState(error, 'AI 微调失败，请调整要求后重试');
    } finally { setIsRefining(false); }
  }

  async function handleValidate() { await runValidation(outputYAML, 'manual'); }
  async function handleFormat() {
    if (!outputYAML.trim()) { setValidationMessage('当前没有可格式化的 YAML 内容'); return; }
    setIsFormatting(true);
    setErrorMessage('');
    setErrorDetails([]);
    try {
      const result = await formatYaml(outputYAML);
      setOutputYAML(result.formatted_yaml);
      setValidationMessage('YAML 已按后端标准格式化');
      await runValidation(result.formatted_yaml, 'manual');
    } catch (error) { setApiErrorState(error, 'YAML 格式化失败，请稍后重试'); }
    finally { setIsFormatting(false); }
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

  // ═══════════════════ INPUT STATE ═══════════════════
  if (!showResult) {
    return (
      <>
        <AiThinkingOverlay title={processTitle} subtitle={processSubtitle} steps={processSteps} visible={isThinkingOverlayVisible} />
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                剧本生成
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3">小说转剧本</h1>
              <p className="text-slate-500 text-lg">填写下方信息，AI 将自动分析并生成结构化剧本 YAML</p>
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-[1fr_340px] gap-8">
              {/* Left: Form */}
              <div className="space-y-6">
                {/* File Upload Zone */}
                <div
                  className={`drag-zone ${isDragOver ? 'drag-zone-active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  {isImporting ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                      <p className="text-slate-600 font-medium">正在解析文档...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <Upload className="h-7 w-7 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-medium">拖拽文件到此处，或<span className="text-amber-600"> 点击选择文件</span></p>
                        <p className="text-slate-400 text-sm mt-1">支持 .docx / .pdf 格式，导入后自动识别标题与题材</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Import warnings */}
                {importWarnings.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 text-sm">
                    <p className="font-medium mb-1">文档已导入，请检查以下识别提示：</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {importWarnings.map((w, i) => <li key={`${w}-${i}`}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {/* Metadata row */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">作品标题</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="自动识别或手动填写"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">题材</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="input-field appearance-none bg-no-repeat"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                    >
                      {GENRE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt || '自动识别'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">目标场景数</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={targetSceneCount}
                      onChange={(e) => setTargetSceneCount(Number(e.target.value) || 1)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Text area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-700">小说文本</label>
                    <span className="text-xs text-slate-400">{inputText.trim().length} 字</span>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="直接粘贴小说文本，或通过上方区域导入 Word / PDF 文档（至少 20 个字符）..."
                    className="w-full h-96 p-5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all resize-none text-sm leading-relaxed placeholder:text-slate-400"
                  />
                </div>

                {/* Error / Validation messages */}
                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{errorMessage}</p>
                      {errorDetails.length > 0 && (
                        <ul className="mt-1 list-disc pl-5 space-y-0.5 text-sm">{errorDetails.map((d, i) => <li key={`${d}-${i}`}>{d}</li>)}</ul>
                      )}
                    </div>
                  </div>
                )}

                {validationMessage && !errorMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    {validationMessage}
                  </div>
                )}

                {/* Submit button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleConvert}
                    disabled={isConverting || isImporting}
                    className="btn-primary text-lg px-10 py-4 rounded-2xl"
                  >
                    {isConverting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" />生成中...</>
                    ) : (
                      <><Sparkles className="h-5 w-5" />调用后端生成剧本</>
                    )}
                  </button>
                </div>
              </div>

              {/* Right: Tips panel */}
              <div className="space-y-6">
                <div className="card p-6 sticky top-24">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    写作建议
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✦</span>
                      文本越长，AI 对人物关系和情节的理解越准确
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✦</span>
                      明确指定题材帮助 AI 确定表达风格和节奏
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✦</span>
                      场景数建议 3-8 个，过多可能导致单场景内容不足
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✦</span>
                      导入 Word/PDF 可自动提取标题和正文
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✦</span>
                      对话丰富的文本转换效果更好
                    </li>
                  </ul>
                </div>

                {/* Text stats */}
                <div className="card p-6 sticky top-[380px]">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Hash className="h-4 w-4 text-indigo-500" />
                    文本统计
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">总字符数</span>
                      <span className="font-semibold text-slate-900">{inputText.length.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">有效字符（去空格）</span>
                      <span className="font-semibold text-slate-900">{inputText.trim().length.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">预估场景</span>
                      <span className="font-semibold text-slate-900">{targetSceneCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">预估角色</span>
                      <span className="font-semibold text-slate-900">—</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ═══════════════════ RESULT STATE ═══════════════════
  const tabConfig: { key: LeftPanelTab; icon: typeof BrainCircuit; label: string }[] = [
    { key: 'reasoning', icon: BrainCircuit, label: '推理过程' },
    { key: 'input', icon: FilePenLine, label: '原始输入' },
    { key: 'refine', icon: Wand2, label: 'AI 微调' },
  ];

  return (
    <>
      <AiThinkingOverlay title={processTitle} subtitle={processSubtitle} steps={processSteps} visible={isThinkingOverlayVisible} />
      <div className="min-h-screen bg-slate-50 animate-fade-in">
        {/* Compact header toolbar */}
        <div className="glass border-b border-slate-200/60 sticky top-14 z-30">
          <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
                title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
              >
                {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="badge-amber"><Sparkles className="h-3 w-3" />AI 工作台</span>
                  <span className="text-sm text-slate-400 hidden sm:inline">·</span>
                  <span className="text-sm text-slate-600 truncate hidden sm:inline">{derivedTitle}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => { setShowResult(false); setOutputYAML(''); setPreviewScript(null); setProcessSteps([]); setErrorMessage(''); setErrorDetails([]); setValidationMessage(''); setImportWarnings([]); setRefinePrompt(''); setLeftPanelTab('reasoning'); setSidebarCollapsed(false); setIsPreviewStale(false); }} className="btn-ghost text-sm">
                <FilePenLine className="h-4 w-4" />重新转换
              </button>
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
        </div>

        {/* Messages */}
        {(errorMessage || validationMessage) && (
          <div className="max-w-[1600px] mx-auto px-4 pt-3 space-y-2">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{errorMessage}</p>
                  {errorDetails.length > 0 && <ul className="mt-1 list-disc pl-5 space-y-0.5">{errorDetails.map((d, i) => <li key={`${d}-${i}`}>{d}</li>)}</ul>}
                </div>
              </div>
            )}
            {validationMessage && (
              <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
                isPreviewStale
                  ? 'border border-amber-200 bg-amber-50 text-amber-700'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}>
                {isPreviewStale ? <AlertCircle className="h-4 w-4 flex-shrink-0" /> : <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
                {validationMessage}
                {(isAutoValidating || isRefining || isConverting) && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
              </div>
            )}
          </div>
        )}

        {/* Main workspace */}
        <div className={`max-w-[1600px] mx-auto px-4 py-4 grid gap-4 items-start transition-all duration-300 ${
          sidebarCollapsed
            ? 'xl:grid-cols-[minmax(420px,1fr)_minmax(380px,1fr)]'
            : 'xl:grid-cols-[360px_minmax(420px,1fr)_minmax(380px,1fr)]'
        }`}>
          {/* Sidebar - collapsible */}
          {!sidebarCollapsed && (
            <div className="space-y-4 animate-slide-in-left">
              {/* Tabs */}
              <div className="card overflow-hidden">
                <div className="flex bg-slate-50 p-1.5 gap-1 rounded-t-2xl">
                  {tabConfig.map((tab) => {
                    const Icon = tab.icon;
                    const active = leftPanelTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setLeftPanelTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-all ${
                          active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden xl:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="p-3">
                  {leftPanelTab === 'reasoning' && (
                    <AiReasoningPanel title={processTitle} subtitle={processSubtitle} steps={processSteps} isRunning={isConverting || isRefining} />
                  )}
                  {leftPanelTab === 'input' && showRefinePanel && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-slate-700">修改输入参数</div>
                      <div className="space-y-3">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" className="input-field py-2 text-sm" />
                        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="input-field py-2 text-sm">
                          {GENRE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt || '自动识别题材'}</option>)}
                        </select>
                        <input type="number" min={1} max={20} value={targetSceneCount} onChange={(e) => setTargetSceneCount(Number(e.target.value) || 1)} className="input-field py-2 text-sm" />
                        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="h-40 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all" />
                        <button onClick={handleConvert} disabled={isConverting || isRefining} className="btn-primary w-full justify-center text-sm py-2.5">
                          {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}重新生成
                        </button>
                      </div>
                    </div>
                  )}
                  {leftPanelTab === 'refine' && showRefinePanel && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-slate-700">AI 指令微调</div>
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-700">
                        试试：<span className="font-medium">"更悬疑一点"</span>、<span className="font-medium">"增强人物冲突"</span>、<span className="font-medium">"对白更口语化"</span>
                      </div>
                      <textarea
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        placeholder="例如：保留当前剧情走向，但增加主角与反派的对白冲突..."
                        className="h-40 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all"
                      />
                      <button onClick={handleRefineWithAi} disabled={isRefining || isConverting} className="btn-accent w-full justify-center text-sm py-2.5">
                        {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}AI 微调结果
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* YAML Editor */}
          <div className="card flex flex-col min-h-[760px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FilePenLine className="h-4 w-4 text-amber-500" />
                  YAML 编辑器
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => {/* search */}} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="搜索">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-3">
              <MonacoEditor value={outputYAML} onChange={handleYamlChange} height="720px" />
            </div>
          </div>

          {/* Script Preview */}
          <div className="card flex flex-col min-h-[760px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  剧本预览
                </h2>
                {isPreviewStale && (
                  <p className="mt-1 text-xs text-amber-600">当前预览未同步最新 YAML，请点击“校验”后更新。</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="全屏">
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-3">
              <div className="h-full overflow-hidden rounded-xl border border-slate-200">
                <ScriptPreview script={previewScript} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Convert;
