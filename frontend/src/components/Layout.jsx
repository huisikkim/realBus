import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'driver': return 'Driver On Duty';
      case 'admin': return 'Administrator';
      default: return 'Parent';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
              <span className="text-xl md:text-2xl">🚌</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-md">
              <span className="text-white text-[10px] font-black">K</span>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-base md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight whitespace-nowrap">셔틀버스 안전</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">Kids Safe Transportation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-8 flex-shrink-0">
          {/* 알림 벨 (부모만) */}
          {user?.role === 'parent' && <NotificationBell />}
          
          {/* 다크모드 토글 */}
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-blue-400 focus:ring-offset-2"
            aria-label="테마 전환"
          >
            <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
              isDark ? 'translate-x-7' : 'translate-x-0'
            }`}>
              {isDark ? (
                <span className="material-symbols-outlined text-sm text-yellow-400">dark_mode</span>
              ) : (
                <span className="material-symbols-outlined text-sm text-slate-600">light_mode</span>
              )}
            </div>
          </button>
          
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-navy dark:text-blue-400">{user?.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{getRoleLabel()}</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">person</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-blue-400 text-xs md:text-sm font-bold transition-colors border border-slate-200 dark:border-slate-600 px-2 md:px-4 py-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            로그아웃
          </button>
        </div>
      </nav>
      
      <main>{children}</main>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-slate-200/50 dark:bg-slate-700/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-slate-200/40 dark:bg-slate-700/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default Layout;
