import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ParentDashboard from './pages/ParentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  const getDashboard = () => {
    switch (user?.role) {
      case 'admin': return <AdminDashboard />;
      case 'driver': return <DriverDashboard />;
      default: return <ParentDashboard />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/" element={getDashboard()} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
