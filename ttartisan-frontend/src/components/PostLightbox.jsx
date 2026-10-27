import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ExternalLink, Trash2, Calendar, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PostLightbox({ post, onClose, onToggleLike, onDelete }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const isAuthor = user && (post.user?._id === user.id || post.user?.id === user.id);
  const hasLiked = user && post.likes?.some((id) => id === user.id || id?._id === user.id);

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (onToggleLike) onToggleLike(post._id);
  };

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl bg-[#101624] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Full resolution image display */}
        <div className="flex-1 bg-black/70 flex items-center justify-center p-4 min-h-[300px] lg:min-h-[500px] max-h-[60vh] lg:max-h-[85vh] overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right Side: Creator info, description, actions */}
        <div className="w-full lg:w-96 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 bg-[#121929] overflow-y-auto">
          <div className="space-y-5">
            {/* Creator Header */}
            <div className="flex items-center justify-between gap-3">
              <Link
                to={`/profile/${post.user?.username}`}
                onClick={onClose}
                className="flex items-center gap-3 group"
              >
                <img
                  src={
                    post.user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={post.user?.username}
                  className="w-10 h-10 rounded-full object-cover border border-violet-400/40 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                    @{post.user?.username || 'artisan'}
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </p>
                </div>
              </Link>

              {post.aspectRatio && post.aspectRatio !== 'auto' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-950/60 text-violet-300 border border-violet-500/30">
                  {post.aspectRatio}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                {post.title}
              </h3>
              {post.description ? (
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
                  {post.description}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">No description provided.</p>
              )}
            </div>

            {/* Author Bio Snippet */}
            {post.user?.bio && (
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20">
                <p className="text-[11px] text-violet-300 font-medium line-clamp-2">
                  ✨ {post.user.bio}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              {/* Like Button */}
              <button
                onClick={handleLikeClick}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-600/20 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-900/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{post.likes?.length || 0} Likes</span>
              </button>

              {/* View Full Original */}
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Open original resolution in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Delete Button (Owner Only) */}
              {isAuthor && (
                <button
                  onClick={() => onDelete && onDelete(post._id)}
                  className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                  title="Delete this artwork"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
