import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'driver': return 'Driver On Duty';
      case 'admin': return 'Administrator';
      default: return 'Parent';
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-slate-100 p-2 rounded-lg">
            <span className="text-xl md:text-2xl">🚌</span>
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-extrabold text-navy tracking-tight">셔틀버스 안전</h1>
            <p className="text-[10px] text-slate-500 font-medium hidden md:block">Safe Transportation Monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-navy">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{getRoleLabel()}</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400">person</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-slate-500 hover:text-navy text-xs md:text-sm font-bold transition-colors border border-slate-200 px-3 md:px-4 py-2 rounded-full hover:bg-slate-50"
          >
            로그아웃
          </button>
        </div>
      </nav>
      
      <main>{children}</main>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default Layout;
