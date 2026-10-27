import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal() {
  const { authModalOpen, authModalTab, setAuthModalTab, closeAuthModal, login, register } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (authModalTab === 'login') {
        const user = await login(formData.email, formData.password);
        success(`Welcome back, ${user.username}!`);
      } else {
        if (!formData.username.trim()) {
          error('Please provide a unique username');
          setSubmitting(false);
          return;
        }
        const user = await register(formData.username, formData.email, formData.password);
        success(`Account created! Welcome to TTArtisan, ${user.username}!`);
      }
    } catch (err) {
      error(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoUsername) => {
    setSubmitting(true);
    try {
      const user = await login(demoUsername, 'artisan123');
      success(`Logged in as demo artist: @${user.username}!`);
    } catch (err) {
      error(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[#111726]/95 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white mb-3 shadow-lg shadow-violet-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {authModalTab === 'login' ? 'Welcome Back' : 'Join TTArtisan'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {authModalTab === 'login'
              ? 'Sign in to publish artworks and customize your visual canvas.'
              : 'Join a vibrant collective of visual creators & digital artists.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-900/80 border border-white/5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setAuthModalTab('login')}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalTab('register')}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. cyber_painter"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {authModalTab === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={authModalTab === 'login' ? 'text' : 'email'}
                name="email"
                required
                placeholder={authModalTab === 'login' ? 'Enter email or username' : 'artist@ttartisan.art'}
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{authModalTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-xs text-slate-400 text-center mb-2.5">
            Quick 1-Click Demo Login:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('aurora_dreamer')}
              disabled={submitting}
              className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all text-center"
            >
              @aurora_dreamer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('neon_samurai')}
              disabled={submitting}
              className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all text-center"
            >
              @neon_samurai
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
