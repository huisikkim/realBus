import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
            <span className="text-5xl">🚌</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy mb-2">셔틀버스 안전</h1>
          <p className="text-slate-500 font-medium">실시간 위치 추적 서비스</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-navy mb-6">로그인</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">이메일</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none transition-all font-medium"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">비밀번호</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none transition-all font-medium"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-action-red px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-navy hover:bg-navy-dark text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md shadow-navy/10 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-6 text-sm">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-navy font-bold hover:underline">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
