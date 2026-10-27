import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Grid,
  Heart,
  Palette,
  Edit2,
  Check,
  X,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { userAPI, postAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProfileCanvas from '../components/ProfileCanvas';
import PostCard from '../components/PostCard';
import PostLightbox from '../components/PostLightbox';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const { success, error, info } = useToast();

  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' or 'artworks'
  const [activeLightboxPost, setActiveLightboxPost] = useState(null);

  // Bio & Avatar editing state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const isOwner = currentUser && (currentUser.username?.toLowerCase() === username?.toLowerCase());

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile(username);
      setProfileData(response.data.user);
      setPosts(response.data.posts || []);
      setBioText(response.data.user.bio || '');
      setAvatarUrl(response.data.user.avatar || '');
    } catch (err) {
      console.error('Fetch Profile Error:', err);
      error(err.message || 'User profile not found');
    } finally {
      setLoading(false);
    }
  }, [username, error]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const response = await userAPI.updateProfile({
        bio: bioText,
        avatar: avatarUrl
      });
      setProfileData((prev) => ({
        ...prev,
        bio: bioText,
        avatar: avatarUrl
      }));
      updateUser({ bio: bioText, avatar: avatarUrl });
      setIsEditingBio(false);
      success('Profile details updated!');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSavingBio(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const response = await postAPI.toggleLike(postId);
      const updatedPost = response.data.post;

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: updatedPost.likes } : p))
      );

      if (activeLightboxPost && activeLightboxPost._id === postId) {
        setActiveLightboxPost((prev) => ({ ...prev, likes: updatedPost.likes }));
      }
    } catch (err) {
      error(err.message || 'Failed to update like');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this artwork?')) return;
    try {
      await postAPI.deletePost(postId);
      success('Artwork deleted');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setActiveLightboxPost(null);
    } catch (err) {
      error(err.message || 'Failed to delete artwork');
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    info('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading creator profile & canvas...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Artist not found</h2>
        <p className="text-xs text-slate-400">The requested profile @{username} does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Feed</span>
        </Link>
      </div>
    );
  }

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const formattedDate = profileData.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-[#101625] border border-white/10 shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* User info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={profileData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={profileData.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-violet-500/40 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-violet-600 text-white shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  @{profileData.username}
                </h1>
                {isOwner && (
                  <button
                    onClick={() => setIsEditingBio(!isEditingBio)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit profile & bio"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!isEditingBio ? (
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {profileData.bio || 'Visual creator exploring color, composition, and digital imagination.'}
                </p>
              ) : (
                <div className="space-y-2 max-w-md pt-2">
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    rows={2}
                    placeholder="Enter short bio..."
                    className="w-full p-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                  />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Avatar image URL..."
                    className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveBio}
                      disabled={savingBio}
                      className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold"
                    >
                      {savingBio ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-violet-400" />
                  <span>Joined {formattedDate}</span>
                </span>
                <span>•</span>
                <span className="text-slate-300">
                  <strong className="text-white font-semibold">{posts.length}</strong> Artworks
                </span>
                <span>•</span>
                <span className="text-slate-300">
                  <strong className="text-white font-semibold">{totalLikes}</strong> Appreciations
                </span>
              </div>
            </div>
          </div>

          {/* Share Action */}
          <button
            onClick={handleShareProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Profile</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Interactive Canvas vs Artworks Gallery */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'canvas'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Interactive Canvas Decorator</span>
          </button>

          <button
            onClick={() => setActiveTab('artworks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'artworks'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Artworks Gallery ({posts.length})</span>
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'canvas' ? (
        <ProfileCanvas
          initialLayout={profileData.profileLayout || []}
          isOwner={isOwner}
          username={profileData.username}
          onLayoutSaved={(newLayout) => {
            setProfileData((prev) => ({ ...prev, profileLayout: newLayout }));
          }}
        />
      ) : (
        <div className="space-y-6">
          {posts.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onSelect={(p) => setActiveLightboxPost(p)}
                  onToggleLike={handleToggleLike}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-slate-900/30 rounded-3xl border border-white/5">
              <p className="text-sm font-semibold text-white">No artworks published yet</p>
              <p className="text-xs text-slate-400 mt-1">
                {isOwner
                  ? 'Click "Create Artwork" in the top bar to share your first piece!'
                  : `@${username} has not posted any artworks yet.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Post Lightbox Modal */}
      <PostLightbox
        post={activeLightboxPost}
        onClose={() => setActiveLightboxPost(null)}
        onToggleLike={handleToggleLike}
        onDelete={handleDeletePost}
      />
    </div>
  );
}
