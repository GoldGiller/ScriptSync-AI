import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, History, PenTool } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <PenTool className="h-8 w-8 text-amber-400" />
              <span className="text-xl font-bold text-white">ScriptSync</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (isActive('/') ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white')
              }
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">首页</span>
              </div>
            </Link>
            <Link
              to="/convert"
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (isActive('/convert') ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white')
              }
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">转换</span>
              </div>
            </Link>
            <Link
              to="/history"
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (isActive('/history') ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white')
              }
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">历史</span>
              </div>
            </Link>
            <Link
              to="/schema"
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (isActive('/schema') ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white')
              }
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">文档</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
