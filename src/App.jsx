import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import BusinessProfile from './pages/BusinessProfile';
import Calculator from './pages/Calculator';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public calculator route */}
          <Route path="/calculator" element={<Calculator />} />
          
          {/* Admin routes */}
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="services" element={<Services />} />
            <Route path="profile" element={<BusinessProfile />} />
          </Route>

          <Route path="/" element={<Navigate to="/calculator" replace />} />
          <Route path="*" element={<Navigate to="/calculator" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
