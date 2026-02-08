import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors relative overflow-hidden">
      {/* 다크모드 토글 - 고정 위치 우측 상단 */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-14 h-7 rounded-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:ring-offset-2 shadow-lg"
        aria-label="테마 전환"
      >
        <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-slate-800 dark:to-slate-900 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}>
          {isDark ? (
            <span className="text-sm">🌙</span>
          ) : (
            <span className="text-sm">☀️</span>
          )}
        </div>
      </button>

      {/* 인스타그램 스타일 배경 그라데이션 */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-200/30 via-pink-200/30 to-orange-200/30 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md">
        {/* 로고 섹션 - 인스타 스타일 */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* 그라데이션 링 */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl p-1 shadow-2xl">
              <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[22px] flex items-center justify-center">
                <span className="text-5xl">🚌</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent mb-2 tracking-tight">
            셔틀버스 안전
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">실시간 위치 추적으로 우리 아이를 안전하게</p>
        </div>

        {/* 로그인 카드 - 인스타 스타일 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-pink-400/20 outline-none transition-all font-medium text-sm"
                placeholder="이메일"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
            <div>
              <input
                type="password"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-pink-400/20 outline-none transition-all font-medium text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>
        </div>

        {/* 회원가입 링크 - 인스타 스타일 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 dark:border-slate-700/50 p-5 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            계정이 없으신가요?{' '}
            <Link 
              to="/register" 
              className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text font-bold hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-300 dark:hover:to-pink-300 transition-all"
            >
              회원가입
            </Link>
          </p>
        </div>

        {/* 푸터 텍스트 */}
        <div className="text-center mt-8">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            © 2024 셔틀버스 안전. 우리 아이의 안전한 등하원을 위해
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
