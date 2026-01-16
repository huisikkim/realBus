import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="header">
        <h1>🚌 셔틀버스 안전</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px' }}>{user?.name}</span>
          <button onClick={logout}>로그아웃</button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
