import { FileText, Copy, Check, Hash, MessageSquare, Code2, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { generateSampleYAML } from '../utils/yamlParser';

const SECTIONS = [
  { id: 'overview', icon: BookOpen, label: '概述' },
  { id: 'root-fields', icon: Hash, label: '根级字段' },
  { id: 'dialogues', icon: MessageSquare, label: '对白结构' },
  { id: 'example', icon: Code2, label: '示例' },
];

const ROOT_FIELDS = [
  { name: 'version', type: '字符串', desc: '剧本版本号', required: true },
  { name: 'title', type: '字符串', desc: '剧本标题', required: true },
  { name: 'genre', type: '字符串', desc: '题材（如：悬疑、都市、古风）', required: true },
  { name: 'premise', type: '字符串', desc: '剧情前提 / 简介', required: false },
  { name: 'characters', type: '数组', desc: '角色列表，每个元素包含 name / role / summary', required: true },
  { name: 'scenes', type: '数组', desc: '场景列表，每个元素包含 scene_id / title / location / time / summary / dialogues', required: true },
];

const DIALOGUE_FIELDS = [
  { name: 'speaker', type: '字符串', desc: '说话人名称' },
  { name: 'content', type: '字符串', desc: '台词内容' },
  { name: 'emotion', type: '字符串', desc: '情绪标签（如：坚定、紧张、悲伤）' },
];

const CHARACTER_FIELDS = [
  { name: 'name', type: '字符串', desc: '角色名称' },
  { name: 'role', type: '字符串', desc: '角色定位（如：主角、反派、叙事者）' },
  { name: 'summary', type: '字符串', desc: '角色简介' },
];

const SCENE_FIELDS = [
  { name: 'scene_id', type: '字符串', desc: '场景唯一 ID（如 S01、S02）' },
  { name: 'title', type: '字符串', desc: '场景标题' },
  { name: 'location', type: '字符串', desc: '场景地点' },
  { name: 'time', type: '字符串', desc: '时间（如：夜、晨、午后）' },
  { name: 'summary', type: '字符串', desc: '场景概要' },
  { name: 'dialogues', type: '数组', desc: '该场景的对白列表' },
];

function FieldCard({ name, type, desc, required }: { name: string; type: string; desc: string; required?: boolean }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <code className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-mono font-semibold">
          {name}
        </code>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md font-mono">{type}</span>
          {required && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-md font-medium">必填</span>}
        </div>
        <p className="text-sm text-slate-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function Schema() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const exampleYAML = generateSampleYAML();

  function handleCopy() {
    navigator.clipboard.writeText(exampleYAML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
          <FileText className="h-3.5 w-3.5" />
          开发文档
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3">YAML Schema 文档</h1>
        <p className="text-slate-500 text-lg">以后端 API 的真实剧本结构为准，前端校验与格式化均遵循此规范</p>
      </div>

      {/* Layout: sidebar + content */}
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-10">
        {/* Sidebar navigation */}
        <nav className="hidden lg:block">
          <div className="sticky top-28 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">导航</p>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-amber-50 text-amber-700 border-l-2 border-amber-500'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {section.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="space-y-8">
          {/* Overview */}
          <section id="overview" className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              概述
            </h2>
            <p className="text-slate-600 leading-relaxed">
              本规范对应后端 <code className="px-2 py-0.5 bg-slate-100 text-amber-600 rounded-md text-sm font-mono">ScripSync-server</code> 的
              真实 YAML 结构。前端的预览、校验与格式化都基于该结构，确保与后端完全兼容。
            </p>
          </section>

          {/* Root Fields */}
          <section id="root-fields" className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Hash className="h-5 w-5 text-amber-600" />
              </div>
              根级字段
            </h2>
            <div className="space-y-2">
              {ROOT_FIELDS.map((field) => (
                <FieldCard key={field.name} {...field} />
              ))}
            </div>
          </section>

          {/* Nested: Characters */}
          <section className="card p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-400 rounded-full" />
              characters 子字段
            </h3>
            <div className="space-y-2">
              {CHARACTER_FIELDS.map((field) => (
                <FieldCard key={field.name} {...field} />
              ))}
            </div>
          </section>

          {/* Nested: Scenes */}
          <section className="card p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-400 rounded-full" />
              scenes 子字段
            </h3>
            <div className="space-y-2">
              {SCENE_FIELDS.map((field) => (
                <FieldCard key={field.name} {...field} />
              ))}
            </div>
          </section>

          {/* Dialogues */}
          <section id="dialogues" className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              对白结构
            </h2>
            <p className="text-slate-600 mb-4 text-sm">
              对白（dialogues）是场景内的核心数组，每条对白包含以下字段：
            </p>
            <div className="space-y-2">
              {DIALOGUE_FIELDS.map((field) => (
                <FieldCard key={field.name} {...field} />
              ))}
            </div>
          </section>

          {/* Example */}
          <section id="example" className="card p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-amber-400" />
                </div>
                完整示例
              </h2>
              <button
                onClick={handleCopy}
                className={`btn-ghost text-sm ${copied ? 'text-emerald-600' : 'text-slate-600'}`}
              >
                {copied ? <><Check className="h-4 w-4" />已复制</> : <><Copy className="h-4 w-4" />复制代码</>}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed font-mono">
              <code>{exampleYAML}</code>
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Schema;
