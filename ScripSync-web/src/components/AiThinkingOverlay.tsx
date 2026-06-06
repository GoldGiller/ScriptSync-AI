import { BrainCircuit, Loader2, Sparkles, X } from 'lucide-react';
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
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsFadingOut(true);
      const fadeTimer = window.setTimeout(() => {
        setActiveIndex(0);
        setTypedLength(0);
        setIsFadingOut(false);
      }, 300);
      return () => window.clearTimeout(fadeTimer);
    }
    setActiveIndex(0);
    setTypedLength(0);
    setIsFadingOut(false);
  }, [visible, steps]);

  useEffect(() => {
    if (!visible || steps.length === 0) return;
    const stepTimer = window.setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, steps.length - 1));
      setTypedLength(0);
    }, 1400);
    return () => window.clearInterval(stepTimer);
  }, [visible, steps.length]);

  useEffect(() => {
    if (!visible || steps.length === 0) return;
    const detail = steps[activeIndex]?.detail || '';
    const typingTimer = window.setInterval(() => {
      setTypedLength((current) => {
        if (current >= detail.length) return current;
        return current + 1;
      });
    }, 24);
    return () => window.clearInterval(typingTimer);
  }, [visible, steps, activeIndex]);

  const renderedSteps = useMemo(() => {
    return steps.map((step, index) => {
      if (index < activeIndex) return { ...step, status: 'completed' as const };
      if (index === activeIndex) return { ...step, status: 'active' as const };
      return { ...step, status: 'pending' as const };
    });
  }, [steps, activeIndex]);

  const activeStep = renderedSteps[activeIndex];
  const typedDetail = activeStep?.detail?.slice(0, typedLength) || '';
  const completedCount = renderedSteps.filter((s) => s.status === 'completed').length;

  if (!visible && !isFadingOut) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-4 transition-all duration-300 ${
        visible && !isFadingOut ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  AI 正在思考
                </span>
              </div>
              <h2 className="mt-1.5 text-lg font-semibold truncate">{title}</h2>
            </div>
            <div className="text-white/60 text-sm font-mono">
              {completedCount}/{steps.length}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Progress bar */}
          <div className="mb-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${steps.length > 0 ? ((activeIndex + 1) / steps.length) * 100 : 0}%` }}
            />
          </div>

          {/* Current thought bubble */}
          {activeStep && (
            <div className="mb-5 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
                <span className="text-sm font-semibold text-indigo-700">{activeStep.label}</span>
              </div>
              <p className="text-sm text-indigo-800/80 leading-relaxed min-h-[40px]">
                {typedDetail}
                <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
              </p>
            </div>
          )}

          {/* Step list */}
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
            {renderedSteps.map((step, index) => (
              <div
                key={step.key}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  step.status === 'active'
                    ? 'bg-indigo-50 text-indigo-700'
                    : step.status === 'completed'
                      ? 'text-slate-600'
                      : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${
                    step.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-600'
                      : step.status === 'active'
                        ? 'bg-indigo-200 text-indigo-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.status === 'active' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : step.status === 'completed' ? (
                    '✓'
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={step.status === 'active' ? 'font-medium' : ''}>{step.label}</span>
                {step.status === 'completed' && (
                  <span className="ml-auto text-xs text-emerald-500">完成</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <p className="mt-4 text-xs text-slate-400 text-center">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default AiThinkingOverlay;
