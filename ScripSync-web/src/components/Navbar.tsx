import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, History, PenTool, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  function isActive(path: string) {
    return location.pathname === path;
  }

  const links = [
    { to: '/', icon: BookOpen, label: '首页' },
    { to: '/convert', icon: FileText, label: '转换' },
    { to: '/history', icon: History, label: '历史' },
    { to: '/schema', icon: FileText, label: '文档' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm shadow-amber-500/30 transition-transform group-hover:scale-105">
              <PenTool className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Script<span className="text-amber-500">Sync</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-amber-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </div>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Notification bell - placeholder */}
            <button
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="通知"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
