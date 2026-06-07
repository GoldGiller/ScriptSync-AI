import { Suspense, lazy, memo, useEffect, useRef } from 'react';
import type { editor } from 'monaco-editor';
import type { YamlLineRange } from '../types';

const MonacoEditorCore = lazy(() => import('@monaco-editor/react'));

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
  jumpToRange?: YamlLineRange | null;
  highlightRange?: YamlLineRange | null;
  onCursorPathChange?: (lineNumber: number) => void;
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
        <p className="pt-2 text-xs text-slate-400">YAML 缂栬緫鍣ㄥ姞杞戒腑...</p>
      </div>
    </div>
  );
}

function MonacoEditor({
  value,
  onChange,
  height = '720px',
  jumpToRange,
  highlightRange,
  onCursorPathChange,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const lastJumpRef = useRef<string | null>(null);

  useEffect(() => {
    const currentEditor = editorRef.current;
    const monaco = monacoRef.current;
    if (!currentEditor || !monaco) return;

    const range = highlightRange || jumpToRange;
    decorationIdsRef.current = currentEditor.deltaDecorations(
      decorationIdsRef.current,
      range
        ? [
            {
              range: new monaco.Range(range.startLine, 1, range.endLine, 1),
              options: {
                isWholeLine: true,
                className: 'monaco-yaml-highlight',
                linesDecorationsClassName: 'monaco-yaml-highlight-gutter',
              },
            },
          ]
        : []
    );
  }, [highlightRange, jumpToRange]);

  useEffect(() => {
    const currentEditor = editorRef.current;
    const monaco = monacoRef.current;
    if (!currentEditor || !monaco || !jumpToRange) return;

    const jumpKey = `${jumpToRange.startLine}-${jumpToRange.endLine}`;
    if (lastJumpRef.current === jumpKey) return;
    lastJumpRef.current = jumpKey;

    currentEditor.revealLineInCenter(jumpToRange.startLine);
    currentEditor.setSelection(
      new monaco.Range(jumpToRange.startLine, 1, jumpToRange.endLine, 1)
    );
    currentEditor.focus();
  }, [jumpToRange]);

  return (
    <div
      className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950"
      style={{ height, minHeight: '720px' }}
    >
      <style>
        {`
          .monaco-yaml-highlight {
            background: rgba(245, 158, 11, 0.14);
          }
          .monaco-yaml-highlight-gutter {
            border-left: 3px solid rgba(245, 158, 11, 0.85);
            margin-left: 2px;
          }
        `}
      </style>
      <Suspense fallback={<MonacoLoading height={height} />}>
        <MonacoEditorCore
          height={height}
          defaultLanguage="yaml"
          value={value}
          onChange={onChange}
          theme="vs-dark"
          onMount={(editorInstance, monaco) => {
            editorRef.current = editorInstance;
            monacoRef.current = monaco;
            editorInstance.onDidChangeCursorPosition((event) => {
              onCursorPathChange?.(event.position.lineNumber);
            });
          }}
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
