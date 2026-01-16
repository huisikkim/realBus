import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'parent'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="text-center" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>🚌</h1>
        <h2>회원가입</h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            className="input"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            className="input"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            className="input"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            className="input"
            placeholder="전화번호"
            value={form.phone}
            onChange={handleChange}
          />
          <select
            name="role"
            className="input"
            value={form.role}
            onChange={handleChange}
          >
            <option value="parent">학부모</option>
            <option value="driver">버스 기사</option>
          </select>

          {error && (
            <p style={{ color: '#EF4444', fontSize: '14px', marginBottom: '12px' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center mt-16">
          이미 계정이 있으신가요? <Link to="/login" className="link">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
