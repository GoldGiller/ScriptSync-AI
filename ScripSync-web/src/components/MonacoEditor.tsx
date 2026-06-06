import { Suspense, lazy, memo } from 'react';

const MonacoEditorCore = lazy(() => import('@monaco-editor/react'));

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
}

function MonacoLoading({ height }: { height: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950/90 px-6 py-8"
      style={{ height }}
    >
      <div className="w-full max-w-3xl space-y-3">
        <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-full rounded bg-slate-800/80 animate-pulse" />
        <div className="h-3 w-11/12 rounded bg-slate-800/70 animate-pulse" />
        <div className="h-3 w-10/12 rounded bg-slate-800/60 animate-pulse" />
        <p className="pt-2 text-xs text-slate-400">YAML 编辑器加载中...</p>
      </div>
    </div>
  );
}

function MonacoEditor({ value, onChange, height = '720px' }: MonacoEditorProps) {
  return (
    <div
      className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950"
      style={{ height, minHeight: '720px' }}
    >
      <Suspense fallback={<MonacoLoading height={height} />}>
        <MonacoEditorCore
          height={height}
          defaultLanguage="yaml"
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            lineHeight: 22,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </Suspense>
    </div>
  );
}

export default memo(MonacoEditor);
