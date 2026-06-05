import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generateSampleYAML } from '../utils/yamlParser';

function Schema() {
  const [copied, setCopied] = useState(false);
  const exampleYAML = generateSampleYAML();

  function handleCopy() {
    navigator.clipboard.writeText(exampleYAML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">YAML Schema 文档</h1>
          <p className="text-slate-600">以后端 API 的真实剧本结构为准</p>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            概述
          </h2>
          <p className="text-slate-700 leading-relaxed">
            本规范对应后端 `ScripSync-server` 的真实 YAML 结构。前端的预览、校验与格式化都应基于该结构，不再使用旧版 mock 字段。
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">根级字段</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">version</code>
              <p className="text-slate-600 mt-1">字符串，剧本版本号</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">title</code>
              <p className="text-slate-600 mt-1">字符串，剧本标题</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">genre</code>
              <p className="text-slate-600 mt-1">字符串，题材</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">premise</code>
              <p className="text-slate-600 mt-1">字符串，剧情前提/简介</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">characters</code>
              <p className="text-slate-600 mt-1">数组，角色列表，字段包含 name / role / summary</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">scenes</code>
              <p className="text-slate-600 mt-1">数组，场景列表，字段包含 scene_id / title / location / time / summary / dialogues</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">对白结构</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">speaker</code>
              <p className="text-slate-600 mt-1">字符串，说话人</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">content</code>
              <p className="text-slate-600 mt-1">字符串，台词内容</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <code className="text-pink-600 font-semibold">emotion</code>
              <p className="text-slate-600 mt-1">字符串，情绪标签</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">示例</h2>
            <button onClick={handleCopy} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制代码
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{exampleYAML}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}

export default Schema;
