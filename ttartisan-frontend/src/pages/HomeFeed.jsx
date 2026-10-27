import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Filter, RefreshCw, Flame, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { postAPI } from '../api';
import PostCard from '../components/PostCard';
import PostLightbox from '../components/PostLightbox';
import { useToast } from '../context/ToastContext';

export default function HomeFeed({ onOpenUpload, newPostSignal }) {
  const { error, success } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('ALL');
  const [activePost, setActivePost] = useState(null);
  const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'popular'

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await postAPI.getFeed(params);
      let fetchedPosts = response.data.posts || [];

      // Ratio filter
      if (selectedRatio !== 'ALL') {
        fetchedPosts = fetchedPosts.filter((p) => p.aspectRatio === selectedRatio);
      }

      // Sort
      if (sortBy === 'popular') {
        fetchedPosts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      }

      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Fetch Feed Error:', err);
      error(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRatio, sortBy, error]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, newPostSignal]);

  const handleToggleLike = async (postId) => {
    try {
      const response = await postAPI.toggleLike(postId);
      const updatedPost = response.data.post;

      // Update in posts list
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: updatedPost.likes } : p))
      );

      // Update in lightbox if currently viewing
      if (activePost && activePost._id === postId) {
        setActivePost((prev) => ({ ...prev, likes: updatedPost.likes }));
      }
    } catch (err) {
      error(err.message || 'Failed to update like');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;
    try {
      await postAPI.deletePost(postId);
      success('Artwork deleted successfully');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setActivePost(null);
    } catch (err) {
      error(err.message || 'Failed to delete post');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-br from-[#131b2e] via-[#0e1422] to-[#1a1528] border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Digital Canvas Playground</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Discover & Curate <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
              Extraordinary Visuals.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome to TTArtisan — where artists share cropped masterworks, curate interactive decorator profiles, and connect with fellow creators.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
            >
              Share Your Artwork
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1523]/80 border border-white/10 backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search artworks by title, description, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
          />
        </div>

        {/* Ratio & Sorting Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Ratio Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
            {['ALL', '1:1', '4:3', '16:9'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => setSelectedRatio(ratio)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedRatio === ratio
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Sort Popular / Latest */}
          <button
            onClick={() => setSortBy((prev) => (prev === 'latest' ? 'popular' : 'latest'))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              sortBy === 'popular'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{sortBy === 'popular' ? 'Popular First' : 'Latest'}</span>
          </button>

          <button
            onClick={fetchFeed}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Masonry Artwork Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 sm:h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onSelect={(p) => setActivePost(p)}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-900/30 rounded-3xl border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No artworks match your search</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Try adjusting your search keywords or filter settings, or be the first to publish a new piece!
          </p>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 cursor-pointer"
          >
            Upload an Artwork
          </button>
        </div>
      )}

      {/* Post Lightbox Modal */}
      <PostLightbox
        post={activePost}
        onClose={() => setActivePost(null)}
        onToggleLike={handleToggleLike}
        onDelete={handleDeletePost}
      />
    </div>
  );
}
