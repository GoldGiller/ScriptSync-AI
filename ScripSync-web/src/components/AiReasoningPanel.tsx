import { BrainCircuit, CheckCircle2, CircleDashed, Loader2, AlertTriangle, Sparkles, Bot } from 'lucide-react';
import type { ProcessStep } from '../types';

interface AiReasoningPanelProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStep[];
  isRunning: boolean;
}

function statusIcon(status: ProcessStep['status']) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }

  if (status === 'active') {
    return <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />;
  }

  if (status === 'failed') {
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  }

  return <CircleDashed className="h-4 w-4 text-slate-400" />;
}

function statusClasses(status: ProcessStep['status']) {
  if (status === 'completed') {
    return 'border-emerald-200 bg-emerald-50/90';
  }

  if (status === 'active') {
    return 'border-indigo-200 bg-indigo-50 shadow-md shadow-indigo-100 ring-2 ring-indigo-100';
  }

  if (status === 'failed') {
    return 'border-red-200 bg-red-50/90';
  }

  return 'border-slate-200 bg-slate-50/90';
}

function statusLabel(status: ProcessStep['status']) {
  if (status === 'completed') return '已完成';
  if (status === 'active') return '思考中';
  if (status === 'failed') return '失败';
  return '等待中';
}

function bubbleTone(status: ProcessStep['status']) {
  if (status === 'completed') {
    return 'bg-white text-slate-700';
  }

  if (status === 'active') {
    return 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white';
  }

  if (status === 'failed') {
    return 'bg-white text-red-700';
  }

  return 'bg-white text-slate-500';
}

function AiReasoningPanel({
  title = 'AI 推理过程',
  subtitle = '展示当前任务的可解释过程摘要与阶段状态。',
  steps,
  isRunning,
}: AiReasoningPanelProps) {
  const activeStep = steps.find((step) => step.status === 'active');

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-slate-50 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700 shadow-sm">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              {isRunning && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI 正在思考
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <Bot className="h-3.5 w-3.5" />
          Thought Stream
        </div>

        {activeStep && (
          <div className="mb-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-4 text-sm text-indigo-900 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
              </span>
              当前思考焦点：{activeStep.label}
            </div>
            {activeStep.detail && <p className="mt-2 leading-6 text-indigo-800/90">{activeStep.detail}</p>}
          </div>
        )}

        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              发起生成或 AI 微调后，这里会显示 AI 的过程时间线、思考气泡与状态变化。
            </div>
          ) : (
            steps.map((step, index) => (
              <div
                key={step.key}
                className={`group relative transition-all duration-500 ${
                  step.status === 'active' ? 'translate-y-0 scale-[1.01]' : 'translate-y-0'
                }`}
              >
                {index < steps.length - 1 && <div className="absolute left-[18px] top-10 bottom-[-14px] w-px bg-slate-200" />}
                <div className={`relative rounded-2xl border px-4 py-3 transition-all duration-500 ${statusClasses(step.status)}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 ${
                        step.status === 'active' ? 'animate-pulse shadow-indigo-200' : ''
                      }`}
                    >
                      {statusIcon(step.status)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">{step.label}</p>
                        <span className="whitespace-nowrap rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                          {statusLabel(step.status)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-start gap-2">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-slate-300" />
                        <div
                          className={`relative max-w-full rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm transition-all duration-500 ${bubbleTone(step.status)} ${
                            step.status === 'active' ? 'animate-pulse' : ''
                          }`}
                        >
                          <span className="absolute -left-1 top-4 h-3 w-3 rotate-45 rounded-sm bg-inherit" />
                          {step.detail || '正在等待进入该步骤。'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isRunning && (
          <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700 transition-all duration-300">
            AI 正在处理中，思考流会持续高亮当前阶段；完成后会展示本次生成/微调的全过程摘要。
          </div>
        )}
      </div>
    </div>
  );
}

export default AiReasoningPanel;
