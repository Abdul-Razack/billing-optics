/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { apiClient } from '../../../core/api/client';

export default function LoginView(): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@opticspos.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('access_token', response.data.token);
      navigate('/pos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="bg-white/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-white/80 mt-2">Sign in to access your dashboard</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-white text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-white/90 cursor-pointer">
            <input type="checkbox" className="mr-2 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500/50" />
            Remember me
          </label>
          <a href="#" className="text-white hover:underline transition-all">Forgot Password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-indigo-600 font-semibold rounded-xl px-4 py-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
}
