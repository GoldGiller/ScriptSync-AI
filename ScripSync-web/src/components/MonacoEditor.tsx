import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  value: string;
  onChange: any;
  height?: string;
}

function MonacoEditor({ value, onChange, height = "600px" }: MonacoEditorProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <Editor
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
        }}
      />
    </div>
  );
}

export default MonacoEditor;
