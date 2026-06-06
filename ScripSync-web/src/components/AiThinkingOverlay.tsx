import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ProcessStep } from '../types';

interface AiThinkingOverlayProps {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
  visible: boolean;
}

function AiThinkingOverlay({ title, subtitle, steps, visible }: AiThinkingOverlayProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsFadingOut(true);
      const fadeTimer = window.setTimeout(() => {
        setActiveIndex(0);
        setTypedLength(0);
        setLogEntries([]);
        setIsFadingOut(false);
      }, 420);

      return () => window.clearTimeout(fadeTimer);
    }

    setActiveIndex(0);
    setTypedLength(0);
    setLogEntries([]);
    setIsFadingOut(false);
  }, [visible, steps]);

  useEffect(() => {
    if (!visible || steps.length === 0) {
      return;
    }

    const stepTimer = window.setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, steps.length - 1));
      setTypedLength(0);
    }, 1400);

    return () => window.clearInterval(stepTimer);
  }, [visible, steps.length]);

  useEffect(() => {
    if (!visible || steps.length === 0) {
      return;
    }

    const detail = steps[activeIndex]?.detail || '';
    const typingTimer = window.setInterval(() => {
      setTypedLength((current) => {
        if (current >= detail.length) {
          return current;
        }
        return current + 1;
      });
    }, 24);

    return () => window.clearInterval(typingTimer);
  }, [visible, steps, activeIndex]);

  useEffect(() => {
    if (!visible || steps.length === 0) {
      return;
    }

    const currentStep = steps[activeIndex];
    if (!currentStep) {
      return;
    }

    setLogEntries((entries) => {
      const nextEntry = `${currentStep.label}：${currentStep.detail || '正在处理...'}`;
      if (entries.includes(nextEntry)) {
        return entries;
      }
      return [...entries, nextEntry];
    });
  }, [visible, steps, activeIndex]);

  const renderedSteps = useMemo(() => {
    return steps.map((step, index) => {
      if (index < activeIndex) {
        return { ...step, status: 'completed' as const };
      }
      if (index === activeIndex) {
        return { ...step, status: 'active' as const };
      }
      return { ...step, status: 'pending' as const };
    });
  }, [steps, activeIndex]);

  const activeStep = renderedSteps[activeIndex];
  const typedDetail = activeStep?.detail?.slice(0, typedLength) || '';

  if (!visible && !isFadingOut) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md transition-all duration-500 ${
        visible && !isFadingOut ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.02]'
      }`}
    >
      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1020] text-white shadow-2xl transition-all duration-500">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_36%)] px-8 py-7">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3 text-violet-200 ring-1 ring-white/10">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-100">
                <Sparkles className="h-3.5 w-3.5" />
                AI 正在思考
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="border-r border-white/10 bg-white/[0.02] px-6 py-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking Timeline
            </div>
            <div className="space-y-3">
              {renderedSteps.map((step, index) => (
                <div key={step.key} className="relative pl-9">
                  {index < renderedSteps.length - 1 && <div className="absolute left-[14px] top-8 h-[calc(100%+10px)] w-px bg-white/10" />}
                  <div
                    className={`absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-white/10 ${
                      step.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : step.status === 'active'
                          ? 'bg-violet-500/20 text-violet-200'
                          : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {step.status === 'active' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="text-[11px]">{index + 1}</span>}
                  </div>
                  <div
                    className={`rounded-2xl border px-4 py-3 transition-all duration-300 ${
                      step.status === 'completed'
                        ? 'border-emerald-400/20 bg-emerald-500/10'
                        : step.status === 'active'
                          ? 'border-violet-400/30 bg-violet-500/10 shadow-lg shadow-violet-950/30'
                          : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{step.label}</p>
                      <span className="text-[11px] text-slate-400">
                        {step.status === 'completed' ? '完成' : step.status === 'active' ? '思考中' : '等待'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(99,102,241,0.16),_transparent_30%),radial-gradient(circle_at_80%_0%,_rgba(168,85,247,0.14),_transparent_30%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  Deep thinking mode
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/20">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 p-3 text-violet-100 ring-1 ring-white/10">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-violet-200">AI 内部工作流</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{activeStep?.label || '准备开始思考'}</h3>
                      <div className="mt-4 rounded-2xl bg-[#11182d] px-5 py-4 text-sm leading-7 text-slate-200 ring-1 ring-white/10 min-h-[170px]">
                        <span>{typedDetail}</span>
                        <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-violet-300 align-middle" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">当前阶段</p>
                    <p className="mt-2 text-lg font-semibold text-white">{activeStep?.label || '等待中'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">已完成步骤</p>
                    <p className="mt-2 text-lg font-semibold text-white">{Math.max(0, activeIndex)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">状态</p>
                    <p className="mt-2 text-lg font-semibold text-violet-200">生成中…</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-slate-950/20">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-violet-200">思考日志流</p>
                    <p className="mt-1 text-xs text-slate-400">像 DeepSeek 一样持续追加当前思考过程。</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    streaming
                  </div>
                </div>
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {logEntries.map((entry, index) => (
                    <div key={`${entry}-${index}`} className="rounded-2xl border border-white/10 bg-[#11182d] px-4 py-3 text-sm leading-6 text-slate-200">
                      <span className="text-violet-300">AI</span>
                      <span className="mx-2 text-slate-500">·</span>
                      <span>{entry}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiThinkingOverlay;
