import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { setToken } from './lib/api';
import { useAuth } from './context/AuthContext';
import { useToast } from './components/Toast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import ApiMarketplace from './pages/ApiMarketplace';
import ApiDocs from './pages/ApiDocs';
import ApiPlayground from './pages/ApiPlayground';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import StatusPage from './pages/StatusPage';
import NotFound from './pages/NotFound';

function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const toast = useToast();
  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setToken(token);
      refreshUser().then(() => {
        toast.success('Logged in with Google 🎉');
        navigate('/dashboard');
      });
    } else {
      navigate('/login');
    }
  }, []);
  return <div className="py-24 text-center text-slate-300">Signing you in...</div>;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/marketplace" element={<ApiMarketplace />} />
          <Route path="/docs" element={<ApiDocs />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
          <Route path="/playground" element={<ProtectedRoute><ApiPlayground /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
