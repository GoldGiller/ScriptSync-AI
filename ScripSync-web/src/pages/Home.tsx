import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Zap, PenTool, Code, BookOpen } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, title: 'AI 智能转换', description: '将小说文本自动转换为结构化剧本，智能识别角色、场景和对话' },
    { icon: FileText, title: 'YAML 格式', description: '使用标准化的 YAML 格式存储剧本，便于编辑和版本控制' },
    { icon: Zap, title: '实时预览', description: '左侧编辑 YAML，右侧实时预览剧本效果，所见即所得' },
    { icon: PenTool, title: '灵活编辑', description: '内置 Monaco 编辑器，支持语法高亮、自动缩进等专业功能' },
    { icon: Code, title: '导出便捷', description: '一键导出 YAML 文件，方便后续处理和分享' },
    { icon: BookOpen, title: '历史记录', description: '自动保存转换历史，随时查看和重新编辑过往作品' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI 驱动的剧本创作工具
            </span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            将小说转换为剧本
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            使用 AI 技术，轻松将您的小说作品转换为专业、结构化的剧本格式。降低改编门槛，提升创作效率。
          </p>
          <button onClick={() => navigate('/convert')} className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg transition-all">
            <PenTool className="h-6 w-6" />
            开始转换
          </button>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">强大功能</h2>
          <p className="text-center text-slate-600 mb-12">为创作者量身打造的专业工具</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-300 transition-all">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">准备好开始创作了吗？</h2>
          <p className="text-slate-300 mb-8">立即体验，让 AI 助力您的剧本创作</p>
          <button onClick={() => navigate('/convert')} className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors">
            立即开始
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
