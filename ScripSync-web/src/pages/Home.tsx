import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Zap, PenTool, Code, BookOpen, Upload, Wand2, Download, ArrowRight, Star } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, title: 'AI 智能转换', description: '将小说文本自动转换为结构化剧本，智能识别角色、场景和对话', color: 'amber' },
    { icon: FileText, title: 'YAML 标准格式', description: '使用标准化 YAML 格式存储剧本，便于编辑、校验和版本控制', color: 'indigo' },
    { icon: Zap, title: '实时预览', description: '左侧编辑 YAML，右侧实时预览剧本效果，所见即所得', color: 'emerald' },
    { icon: PenTool, title: 'Monaco 编辑器', description: '内置专业代码编辑器，支持语法高亮、自动缩进和快捷键', color: 'violet' },
    { icon: Download, title: '一键导出', description: '导出标准 YAML 文件，方便后续处理和跨平台使用', color: 'rose' },
    { icon: BookOpen, title: '历史管理', description: '自动保存转换历史，随时查看和重新编辑过往作品', color: 'cyan' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200 hover:border-amber-400', shadow: 'shadow-amber-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200 hover:border-indigo-400', shadow: 'shadow-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200 hover:border-emerald-400', shadow: 'shadow-emerald-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200 hover:border-violet-400', shadow: 'shadow-violet-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200 hover:border-rose-400', shadow: 'shadow-rose-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200 hover:border-cyan-400', shadow: 'shadow-cyan-100' },
  };

  const stats = [
    { value: '3 步', label: '完成转换', icon: Zap },
    { value: 'YAML', label: '标准格式', icon: FileText },
    { value: 'AI', label: '智能识别', icon: Sparkles },
    { value: '实时', label: '预览同步', icon: Star },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-amber-50/30 to-slate-50">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="animate-slide-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 text-amber-700 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                AI 驱动的剧本创作工具
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight text-balance">
                将小说转换为
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600"> 专业剧本</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
                使用 AI 技术，轻松将您的小说作品转换为专业、结构化的剧本格式。
                智能识别角色关系、场景氛围与对白情感，降低改编门槛，提升创作效率。
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/convert')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  <Wand2 className="h-5 w-5" />
                  开始转换
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/schema')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  <BookOpen className="h-5 w-5" />
                  查看文档
                </button>
              </div>
            </div>

            {/* Right: Decorative illustration */}
            <div className="hidden lg:flex justify-center animate-slide-in-right">
              <div className="relative">
                {/* Floating cards */}
                <div className="w-80 h-80 bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl shadow-2xl shadow-amber-500/30 flex items-center justify-center animate-float">
                  <div className="text-white text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-80" />
                    <p className="text-2xl font-bold">📜 → 🎬</p>
                    <p className="text-sm mt-2 opacity-80">Novel → Script</p>
                  </div>
                </div>
                {/* Decorative mini cards */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                  <Sparkles className="h-8 w-8 text-amber-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-500 rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center">三步完成转换</h2>
          <p className="section-subtitle text-center">从文本到剧本，简单高效</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Upload, title: '导入或输入文本', description: '手动粘贴小说文本，或直接上传 Word/PDF 文档，系统自动识别标题与题材', color: 'from-amber-500 to-orange-500' },
              { step: '02', icon: Sparkles, title: 'AI 智能转换', description: 'AI 自动分析角色关系、场景结构和情感走向，生成标准化剧本 YAML', color: 'from-indigo-500 to-violet-500' },
              { step: '03', icon: Download, title: '编辑并导出', description: '在 Monaco 编辑器中微调，实时预览效果，一键导出标准 YAML 文件', color: 'from-emerald-500 to-teal-500' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative text-center group">
                  {/* Connector line */}
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent" />
                  )}
                  <div className="relative">
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <span className="absolute top-0 right-1/4 text-6xl font-black text-slate-100 -z-10">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center">强大功能</h2>
          <p className="section-subtitle text-center">为创作者量身打造的专业工具</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              const colors = colorMap[feature.color];
              return (
                <div
                  key={idx}
                  className={`card p-6 ${colors.border} hover:shadow-lg ${colors.shadow} group cursor-default animate-slide-up`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <IconComponent className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-12 md:p-16 text-center shadow-2xl">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                准备好开始创作了吗？
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                立即体验 AI 驱动的剧本创作，让您的故事以专业格式呈现。
                无需复杂操作，三步即可完成。
              </p>
              <button
                onClick={() => navigate('/convert')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 text-lg font-bold rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:shadow-2xl hover:shadow-amber-500/40 active:scale-[0.98]"
              >
                <Wand2 className="h-6 w-6" />
                立即开始转换
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
