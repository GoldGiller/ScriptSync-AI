import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, History, PenTool, Sun, Moon, Bell, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../hooks/useAppStore';
import MessageCenter from './MessageCenter';

function Navbar() {
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAppStore((state) => state.markAllNotificationsAsRead);
  const removeNotification = useAppStore((state) => state.removeNotification);
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false);
  const messageCenterRef = useRef<HTMLDivElement | null>(null);

  function isActive(path: string) {
    return location.pathname === path;
  }

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!messageCenterRef.current?.contains(event.target as Node)) {
        setIsMessageCenterOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMessageCenterOpen(false);
      }
    }

    if (isMessageCenterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMessageCenterOpen]);

  const links = [
    { to: '/', icon: BookOpen, label: '首页' },
    { to: '/convert', icon: FileText, label: '转换' },
    { to: '/history', icon: History, label: '历史' },
    { to: '/schema', icon: FileText, label: '文档' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link to="/" className="group flex flex-shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm shadow-amber-500/30 transition-transform group-hover:scale-105">
              <PenTool className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Script<span className="text-amber-500">Sync</span>
            </span>
          </Link>

          <div className="scrollbar-none flex items-center gap-0.5 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </div>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-amber-500" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="relative" ref={messageCenterRef}>
              <button
                onClick={() => setIsMessageCenterOpen((prev) => !prev)}
                className={`relative rounded-lg p-2 transition-colors ${
                  isMessageCenterOpen
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
                title="消息中心"
                aria-label="消息中心"
              >
                {isMessageCenterOpen ? <X className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm shadow-rose-500/40">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isMessageCenterOpen && (
                <div className="animate-scale-in absolute right-0 top-full z-50 mt-3 origin-top-right">
                  <MessageCenter
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAllAsRead={markAllNotificationsAsRead}
                    onMarkAsRead={markNotificationAsRead}
                    onRemove={removeNotification}
                  />
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
              aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
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
