import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import BusinessProfile from './pages/BusinessProfile';
import Calculator from './pages/Calculator';

function LoadingScreen() {
  return (
    <div className="min-h-screen">
      <div className="arc-bg" />
      <div className="content-wrapper min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[var(--arc)] flex items-center justify-center"
               style={{ boxShadow: '0 0 30px var(--arc-glow)' }}>
            <div className="w-6 h-6 rounded-full bg-[var(--arc)] animate-pulse" />
          </div>
          <p className="text-muted">Loading ARC Labs...</p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/services" element={
        <ProtectedRoute><Services /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><BusinessProfile /></ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
