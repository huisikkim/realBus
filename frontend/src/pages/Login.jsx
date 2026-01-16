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
    setError('');
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
    <div className="container" style={{ paddingTop: '60px' }}>
      <div className="text-center" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>🚌</h1>
        <h2>셔틀버스 안전 서비스</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>실시간 위치 추적</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="input"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p style={{ color: '#EF4444', fontSize: '14px', marginBottom: '12px' }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center mt-16">
          계정이 없으신가요? <Link to="/register" className="link">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
