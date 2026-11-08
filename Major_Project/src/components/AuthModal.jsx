import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, mode = 'login', onClose }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsLogin(mode === 'login');
    setError('');
    setSuccessMessage('');
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Save session to localStorage on success
    localStorage.setItem('pranaai_user_email', email);
    localStorage.setItem('pranaai_is_logged_in', 'true');

    if (isLogin) {
      setSuccessMessage('Successfully logged in! Redirecting...');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } else {
      setSuccessMessage('Account created successfully! Welcome to PranaAI.');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel rounded-3xl p-8 max-w-md w-full relative space-y-6 border border-white/15 shadow-2xl">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {isLogin ? <LogIn className="w-6 h-6 text-purple-400" /> : <UserPlus className="w-6 h-6 text-pink-400" />}
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin 
              ? 'Enter your credentials to access your wellness dashboard.' 
              : 'Join PranaAI to unlock interactive wellness games and progress tracking.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white bg-slate-900/60 border border-slate-700 focus:border-purple-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white bg-slate-900/60 border border-slate-700 focus:border-purple-400 outline-none transition-all"
            />
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white bg-slate-900/60 border border-slate-700 focus:border-purple-400 outline-none transition-all"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-purple-500/25 transition-all text-sm mt-2"
          >
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMessage('');
            }}
            className="text-xs text-slate-400 hover:text-purple-300 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}