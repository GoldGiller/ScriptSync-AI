import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Sparkles, Loader2, AlertCircle, Wand2, CheckCircle2, Upload, BrainCircuit, FilePenLine } from 'lucide-react';
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
  const validationRequestIdRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (!showResult || !outputYAML.trim() || isFormatting || isConverting || isRefining) {
      return;
    }

    const currentYaml = outputYAML;
    const timer = window.setTimeout(() => {
      void runValidation(currentYaml, 'auto');
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [outputYAML, showResult, isFormatting, isConverting, isRefining]);

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

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
    } finally {
      setIsImporting(false);
    }
  }

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

    const pendingSteps = buildGenerateProcessSteps({
      title: derivedTitle,
      source_text: inputText,
      genre: genre.trim(),
      target_scene_count: targetSceneCount,
    });

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
      const result = await generateScript({
        title: derivedTitle,
        source_text: inputText,
        genre: genre.trim(),
        target_scene_count: targetSceneCount,
      });

      setOutputYAML(result.yaml_text);
      setPreviewScript(result.script);
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
      setProcessSteps((steps) =>
        steps.map((step, index) =>
          index === steps.findIndex((item) => item.status === 'active')
            ? { ...step, status: 'failed', detail: '该阶段执行失败，请检查错误信息后重试。' }
            : step
        )
      );
      setApiErrorState(error, '调用后端生成剧本失败，请稍后重试');
    } finally {
      setIsConverting(false);
      setIsThinkingOverlayVisible(false);
    }
  }

  async function handleRefineWithAi() {
    if (!outputYAML.trim()) {
      setErrorMessage('当前没有可微调的 YAML 结果');
      setErrorDetails([]);
      return;
    }

    if (!refinePrompt.trim()) {
      setErrorMessage('请输入 AI 微调要求');
      setErrorDetails([]);
      return;
    }

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
      const result = await refineScript({
        title: derivedTitle,
        source_text: inputText,
        genre: genre.trim(),
        current_yaml: outputYAML,
        refine_prompt: prompt,
      });

      setOutputYAML(result.yaml_text);
      setPreviewScript(result.script);
      setProcessSteps(result.process_steps);
      setValidationMessage('AI 已根据微调要求更新剧本结果');
      setRefinePrompt('');

      addHistory({
        id: Date.now().toString(),
        title: derivedTitle,
        original_text: inputText,
        script_yaml: result.yaml_text,
        created_at: new Date().toISOString().split('T')[0],
        script: result.script,
      });
    } catch (error) {
      setProcessSteps((steps) =>
        steps.map((step, index) =>
          index === steps.findIndex((item) => item.status === 'active')
            ? { ...step, status: 'failed', detail: '该阶段执行失败，请检查错误信息后重试。' }
            : step
        )
      );
      setApiErrorState(error, 'AI 微调失败，请调整要求后重试');
    } finally {
      setIsRefining(false);
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
      <>
        <AiThinkingOverlay
          title={processTitle}
          subtitle={processSubtitle}
          steps={processSteps}
          visible={isThinkingOverlayVisible}
        />
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">小说转剧本</h1>
              <p className="text-slate-600">以后端 API 为准生成结构化剧本，并返回标准 YAML</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-5">
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">导入 Word / PDF 文档</p>
                    <p className="mt-1 text-xs text-slate-600">支持 .docx / .pdf，导入后会自动识别作品标题、题材和小说文本，你仍可继续手动修改。</p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isImporting ? '导入中...' : '选择文档'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">作品标题</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="可手动填写，或导入后自动识别；未识别时默认取正文前 20 个字"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">题材</label>
                  <input
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="可自动识别，也可手动修改，如：悬疑、都市、古风"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
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
                <p className="mt-2 text-xs text-slate-500">系统会默认先尝试 AI 生成；如果 AI 暂时不可用或返回结果无效，后端会自动回退到基础生成逻辑。</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">小说文本</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="可直接粘贴小说文本，也可通过 Word/PDF 导入，至少 20 个字符..."
                  className="w-full h-96 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="mt-2 text-xs text-slate-500">当前长度：{inputText.trim().length} 字符</p>
              </div>
            </div>

            {importWarnings.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                <p className="font-medium">文档已导入，请检查以下识别提示：</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                  {importWarnings.map((warning, index) => (
                    <li key={`${warning}-${index}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

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

            {validationMessage && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                <div className="flex items-center justify-between gap-3">
                  <span>{validationMessage}</span>
                  {isImporting && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={isConverting || isImporting}
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
      </>
    );
  }

  return (
    <>
      <AiThinkingOverlay
        title={processTitle}
        subtitle={processSubtitle}
        steps={processSteps}
        visible={isThinkingOverlayVisible}
      />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-4 py-8">
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-6 text-white">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI 剧本工作台
                  </div>
                  <h1 className="mt-4 text-3xl font-bold">转换结果</h1>
                  <p className="mt-2 max-w-3xl text-sm text-slate-200/90">
                    左侧通过标签页查看 AI 推理过程与微调区，中间编辑 YAML，右侧实时预览剧本结构，让生成、修改与验证集中在同一工作区完成。
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 xl:justify-end">
                  <button
                    onClick={() => setShowRefinePanel((prev) => !prev)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                  >
                    {showRefinePanel ? '收起编辑微调' : '继续编辑微调'}
                  </button>
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setOutputYAML('');
                      setPreviewScript(null);
                      setProcessSteps([]);
                      setErrorMessage('');
                      setErrorDetails([]);
                      setValidationMessage('');
                      setImportWarnings([]);
                      setRefinePrompt('');
                      setLeftPanelTab('reasoning');
                    }}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    重新转换
                  </button>
                  <button
                    onClick={handleValidate}
                    disabled={isValidating}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    校验 YAML
                  </button>
                  <button
                    onClick={handleFormat}
                    disabled={isFormatting}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {isFormatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    格式化 YAML
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-amber-300"
                  >
                    <Download className="h-4 w-4" />
                    导出 YAML
                  </button>
                </div>
              </div>
            </div>

            {(errorMessage || validationMessage) && (
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
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
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                    <div className="flex items-center justify-between gap-3">
                      <span>{validationMessage}</span>
                      {(isAutoValidating || isRefining || isConverting) && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_minmax(420px,1fr)_minmax(380px,1fr)] items-start">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
                  <button
                    onClick={() => setLeftPanelTab('reasoning')}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      leftPanelTab === 'reasoning' ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/70'
                    }`}
                  >
                    <BrainCircuit className="h-4 w-4" />
                    推理过程
                  </button>
                  <button
                    onClick={() => setLeftPanelTab('input')}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      leftPanelTab === 'input' ? 'bg-white text-amber-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/70'
                    }`}
                  >
                    <FilePenLine className="h-4 w-4" />
                    原始输入
                  </button>
                  <button
                    onClick={() => setLeftPanelTab('refine')}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      leftPanelTab === 'refine' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/70'
                    }`}
                  >
                    <Wand2 className="h-4 w-4" />
                    AI 微调
                  </button>
                </div>

                <div className="p-4">
                  {leftPanelTab === 'reasoning' && (
                    <AiReasoningPanel
                      title={processTitle}
                      subtitle={processSubtitle}
                      steps={processSteps}
                      isRunning={isConverting || isRefining}
                    />
                  )}

                  {leftPanelTab === 'input' && showRefinePanel && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">基于原始输入继续微调</h2>
                        <p className="mt-1 text-sm text-slate-600">直接修改标题、题材、场景数与正文，再让 AI 重新生成完整剧本。</p>
                      </div>
                      <div className="space-y-4 px-5 py-5">
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">作品标题</label>
                            <input
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">题材</label>
                            <input
                              value={genre}
                              onChange={(e) => setGenre(e.target.value)}
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">目标场景数</label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={targetSceneCount}
                            onChange={(e) => setTargetSceneCount(Number(e.target.value) || 1)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">小说文本</label>
                          <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="h-56 w-full resize-none rounded-xl border border-slate-300 p-4 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={handleConvert}
                            disabled={isConverting || isRefining}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                          >
                            {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            重新生成剧本
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {leftPanelTab === 'refine' && showRefinePanel && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">AI 指令微调</h2>
                        <p className="mt-1 text-sm text-slate-600">像和编剧助理对话一样，告诉 AI 你想强化的氛围、冲突、对白或节奏。</p>
                      </div>
                      <div className="space-y-4 px-5 py-5">
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-800">
                          你可以尝试：<span className="font-medium">“更悬疑一点”</span>、<span className="font-medium">“增强人物冲突”</span>、<span className="font-medium">“对白更口语化”</span>
                        </div>
                        <textarea
                          value={refinePrompt}
                          onChange={(e) => setRefinePrompt(e.target.value)}
                          placeholder="例如：保留当前剧情走向，但增加主角与反派的对白冲突，并让整体氛围更悬疑。"
                          className="h-64 w-full resize-none rounded-xl border border-slate-300 p-4 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleRefineWithAi}
                            disabled={isRefining || isConverting}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            AI 微调结果
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[760px] flex flex-col">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">YAML 编辑器</h2>
                <p className="mt-1 text-sm text-slate-600">这里适合做结构级微调，例如场景、对白、角色字段的直接修改。</p>
              </div>
              <div className="flex-1 min-h-[680px] p-5">
                <MonacoEditor value={outputYAML} onChange={(val) => setOutputYAML(val || '')} height="100%" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[760px] flex flex-col">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">剧本预览</h2>
                <p className="mt-1 text-sm text-slate-600">预览当前 YAML 经后端校验后的结构效果，便于边看边改。</p>
              </div>
              <div className="flex-1 p-5">
                <div className="h-full min-h-[680px] overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <ScriptPreview script={previewScript} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Convert;
