import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Compass, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar({ onOpenUpload }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      info('Please sign in first to publish an artwork');
      openAuthModal('login');
      return;
    }
    if (onOpenUpload) {
      onOpenUpload();
    }
  };

  const handleLogout = () => {
    logout();
    info('You have logged out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B0F17]/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
              TTArtisan
            </span>
            <span className="text-[10px] text-violet-400 font-medium tracking-widest uppercase -mt-1">
              Visual Canvas
            </span>
          </div>
        </Link>

        {/* Center / Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-white/5">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              location.pathname === '/'
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Feed</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Create Artwork Button */}
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Artwork</span>
            <span className="sm:hidden">Create</span>
          </button>

          {/* User Status */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 hover:border-violet-500/40 transition-all group"
                title="View your Canvas Profile"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-violet-400/40"
                />
                <span className="hidden md:inline text-xs font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                  @{user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs sm:text-sm font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/40 border border-violet-500/30 rounded-xl transition-all cursor-pointer"
              >
                Join
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
