import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import HomeFeed from './pages/HomeFeed';
import ProfilePage from './pages/ProfilePage';
import { Sparkles, Heart } from 'lucide-react';

function AppContent() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newPostSignal, setNewPostSignal] = useState(0);

  const handlePostCreated = (newPost) => {
    setNewPostSignal((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      {/* Sticky Top Navbar */}
      <Navbar onOpenUpload={() => setUploadModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomeFeed
                onOpenUpload={() => setUploadModalOpen(true)}
                newPostSignal={newPostSignal}
              />
            }
          />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal />

      {/* Upload & Crop Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Tasteful Footer */}
      <footer className="border-t border-white/5 bg-[#080B11] py-8 px-4 sm:px-6 lg:px-8 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white tracking-tight">TTArtisan</span>
            <span>— The Modern Social Canvas for Visual Creators</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-500">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for digital artists
            </span>
            <span className="text-slate-600">© 2026 TTArtisan. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}