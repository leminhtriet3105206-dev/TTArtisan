import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onSelect, onToggleLike }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const hasLiked = user && post.likes?.some((id) => id === user.id || id?._id === user.id);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (onToggleLike) {
      onToggleLike(post._id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative mb-5 break-inside-avoid rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10 hover:border-violet-500/40 shadow-lg hover:shadow-violet-600/10 transition-all cursor-pointer"
      onClick={() => onSelect && onSelect(post)}
    >
      {/* Artwork Image */}
      <div className="relative overflow-hidden w-full">
        <img
          src={post.imageUrl}
          alt={post.title}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Aspect Ratio Badge */}
        {post.aspectRatio && post.aspectRatio !== 'auto' && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white/80 border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {post.aspectRatio}
          </span>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          {/* Top Row: Maximize Icon */}
          <div className="flex justify-end">
            <div className="p-2 rounded-xl bg-black/50 backdrop-blur-md text-white/80 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom Row: Title, Author, Like */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 drop-shadow-md">
              {post.title}
            </h3>

            <div className="flex items-center justify-between gap-2 pt-1">
              {/* Creator link */}
              <Link
                to={`/profile/${post.user?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 group/author"
              >
                <img
                  src={
                    post.user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={post.user?.username}
                  className="w-6 h-6 rounded-full object-cover border border-violet-400/40"
                />
                <span className="text-xs font-medium text-slate-200 group-hover/author:text-violet-300 transition-colors">
                  @{post.user?.username || 'artisan'}
                </span>
              </Link>

              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70 border border-white/10'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                />
                <span>{post.likes?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile visible footer fallback (when not hovering) */}
      <div className="p-3 sm:hidden flex items-center justify-between border-t border-white/5 bg-[#101625]">
        <span className="text-xs font-semibold text-white line-clamp-1 flex-1 pr-2">
          {post.title}
        </span>
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-xs text-slate-300"
        >
          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{post.likes?.length || 0}</span>
        </button>
      </div>
    </motion.div>
  );
}
