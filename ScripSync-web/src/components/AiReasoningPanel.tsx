import { BrainCircuit, CheckCircle2, CircleDashed, Loader2, AlertTriangle, Sparkles, Bot } from 'lucide-react';
import type { ProcessStep } from '../types';

interface AiReasoningPanelProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStep[];
  isRunning: boolean;
}

function statusIcon(status: ProcessStep['status']) {
  if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === 'active') return <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />;
  if (status === 'failed') return <AlertTriangle className="h-4 w-4 text-red-600" />;
  return <CircleDashed className="h-4 w-4 text-slate-400" />;
}

function statusBg(status: ProcessStep['status']) {
  if (status === 'completed') return 'bg-emerald-50 border-emerald-200';
  if (status === 'active') return 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-100';
  if (status === 'failed') return 'bg-red-50 border-red-200';
  return 'bg-slate-50 border-slate-200';
}

function statusLabel(status: ProcessStep['status']) {
  if (status === 'completed') return '已完成';
  if (status === 'active') return '思考中';
  if (status === 'failed') return '失败';
  return '等待中';
}

function AiReasoningPanel({
  title = 'AI 推理过程',
  subtitle = '展示当前任务的可解释过程摘要与阶段状态。',
  steps,
  isRunning,
}: AiReasoningPanelProps) {
  const activeStep = steps.find((step) => step.status === 'active');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <BrainCircuit className="h-5 w-5 text-violet-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {isRunning && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                <Sparkles className="h-3 w-3" />思考中
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Current focus */}
      {activeStep && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-indigo-800 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            当前：{activeStep.label}
          </div>
          {activeStep.detail && <p className="text-indigo-700/80 leading-relaxed">{activeStep.detail}</p>}
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-1.5">
        {steps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-xs text-slate-500 text-center">
            发起生成或 AI 微调后，这里会显示 AI 的过程时间线。
          </div>
        ) : (
          steps.map((step, index) => (
            <div
              key={step.key}
              className={`relative rounded-xl border px-3 py-2.5 transition-all ${statusBg(step.status)} ${
                step.status === 'active' ? 'scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex-shrink-0 ${step.status === 'active' ? 'animate-pulse' : ''}`}>
                  {statusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${step.status === 'active' ? 'font-medium text-indigo-800' : 'text-slate-700'}`}>
                    {step.label}
                  </span>
                  <span className={`text-[10px] font-medium flex-shrink-0 ${
                    step.status === 'completed' ? 'text-emerald-600' :
                    step.status === 'active' ? 'text-indigo-600' :
                    step.status === 'failed' ? 'text-red-600' : 'text-slate-400'
                  }`}>
                    {statusLabel(step.status)}
                  </span>
                </div>
              </div>
              {step.detail && (
                <p className={`mt-2 text-xs leading-relaxed pl-7 ${
                  step.status === 'active' ? 'text-indigo-700/80' :
                  step.status === 'completed' ? 'text-slate-600' :
                  step.status === 'failed' ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {step.detail}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AiReasoningPanel;
