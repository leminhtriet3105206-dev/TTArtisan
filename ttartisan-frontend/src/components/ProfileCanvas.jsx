import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Layers,
  Smile,
  Type,
  Tag,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Eye,
  Edit3
} from 'lucide-react';
import { userAPI } from '../api';
import { useToast } from '../context/ToastContext';

// Preset Stickers
const STICKER_PRESETS = [
  { emoji: '🎨', label: 'Palette' },
  { emoji: '⚡', label: 'Bolt' },
  { emoji: '🌸', label: 'Sakura' },
  { emoji: '🔮', label: 'Crystal' },
  { emoji: '💫', label: 'Dizzy' },
  { emoji: '🪐', label: 'Saturn' },
  { emoji: '🎭', label: 'Theater' },
  { emoji: '💎', label: 'Diamond' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '👾', label: 'Alien' },
  { emoji: '🌈', label: 'Rainbow' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '🗡️', label: 'Sword' },
  { emoji: '📸', label: 'Camera' },
  { emoji: '✨', label: 'Sparkles' }
];

// Preset Badges
const BADGE_PRESETS = [
  '✦ TTArtisan Creator',
  '⚡ Digital Cyberpunk',
  '🌸 Botanical Illustrator',
  '🔮 Concept Worldbuilder',
  '💼 Open for Commissions',
  '🌙 Midnight Sketcher'
];

export default function ProfileCanvas({
  initialLayout = [],
  isOwner = false,
  username = '',
  onLayoutSaved
}) {
  const { success, error } = useToast();

  const [elements, setElements] = useState(() => (initialLayout && initialLayout.length > 0 ? initialLayout : []));
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const [showBadgeDrawer, setShowBadgeDrawer] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const containerRef = useRef(null);

  // Add a new element to canvas
  const addElement = (type, content = '', url = '', customProps = {}) => {
    const id = `elem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const highestZ = elements.reduce((max, el) => Math.max(max, el.zIndex || 1), 1);

    const newElement = {
      id,
      type,
      content,
      url,
      x: 40 + (elements.length % 5) * 20,
      y: 40 + (elements.length % 5) * 20,
      width: type === 'sticker' ? 100 : type === 'badge' ? 210 : type === 'image' ? 180 : 220,
      height: type === 'sticker' ? 70 : type === 'badge' ? 44 : type === 'image' ? 180 : 90,
      zIndex: highestZ + 1,
      ...customProps
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedId(id);
  };

  // Update element coordinates / dimensions
  const updateElementTransform = (id, data) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...data } : el))
    );
  };

  // Update element content (e.g. text change)
  const updateElementContent = (id, newContent) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content: newContent } : el))
    );
  };

  // Bring forward / Send backward
  const changeZIndex = (id, delta) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, zIndex: Math.max(1, (el.zIndex || 1) + delta) } : el
      )
    );
  };

  // Delete element
  const deleteElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Save layout to MongoDB
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await userAPI.updateDecor(elements);
      success('Canvas decor saved to your profile! ✨');
      if (onLayoutSaved) {
        onLayoutSaved(response.data.profileLayout);
      }
      setIsEditMode(false);
      setSelectedId(null);
    } catch (err) {
      error(err.message || 'Failed to save canvas layout');
    } finally {
      setSaving(false);
    }
  };

  // Reset to initial
  const handleReset = () => {
    if (window.confirm('Reset canvas to last saved layout?')) {
      setElements(initialLayout || []);
      setSelectedId(null);
    }
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    addElement('image', '', customImageUrl.trim());
    setCustomImageUrl('');
    setShowImagePrompt(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isOwner ? 'Your Personal Canvas Decorator' : `@${username}'s Canvas`}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-500/20">
                {isEditMode ? 'Editing Mode' : 'View Mode'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isEditMode
                ? 'Drag, resize, and layer stickers, badges, and notes anywhere on the canvas.'
                : 'A curated visual moodboard personalized by the artist.'}
            </p>
          </div>
        </div>

        {/* Action Controls for Profile Owner */}
        {isOwner && (
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Decorate Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Reset Changes"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setSelectedId(null);
                  }}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Layout'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editing Toolbar Palette (Only when in Edit Mode) */}
      {isOwner && isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#111728] p-3 rounded-2xl border border-violet-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3"
        >
          {/* Add Item Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Add to Canvas:</span>

            {/* Sticker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowStickerDrawer(!showStickerDrawer);
                  setShowBadgeDrawer(false);
                  setShowImagePrompt(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-violet-900/40 border border-white/10 hover:border-violet-500/40 rounded-xl text-xs font-medium text-slate-200 transition-all cursor-pointer"
              >
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>Sticker</span>
              </button>

              {/* Sticker Drawer Dropdown */}
              {showStickerDrawer && (
                <div className="absolute left-0 top-10 z-50 p-3 bg-slate-900 border border-violet-500/40 rounded-2xl shadow-2xl grid grid-cols-5 gap-2 w-64 backdrop-blur-xl">
                  {STICKER_PRESETS.map((stk) => (
                    <button
                      key={stk.emoji}
                      type="button"
                      onClick={() => {
                        addElement('sticker', stk.emoji);
                        setShowStickerDrawer(false);
                      }}
                      className="p-2 text-2xl hover:scale-125 hover:bg-white/10 rounded-xl transition-transform"
                      title={stk.label}
                    >
                      {stk.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Badge Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowBadgeDrawer(!showBadgeDrawer);
                  setShowStickerDrawer(false);
                  setShowImagePrompt(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-violet-900/40 border border-white/10 hover:border-violet-500/40 rounded-xl text-xs font-medium text-slate-200 transition-all cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Badge</span>
              </button>

              {/* Badge Drawer Dropdown */}
              {showBadgeDrawer && (
                <div className="absolute left-0 top-10 z-50 p-2.5 bg-slate-900 border border-violet-500/40 rounded-2xl shadow-2xl flex flex-col gap-1.5 w-60 backdrop-blur-xl">
                  {BADGE_PRESETS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        addElement('badge', bg);
                        setShowBadgeDrawer(false);
                      }}
                      className="px-3 py-1.5 text-left text-xs font-medium bg-slate-800 hover:bg-violet-600/30 hover:text-white rounded-lg transition-colors text-slate-300"
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Note/Text Button */}
            <button
              type="button"
              onClick={() => addElement('text', 'Write a thought or artistic statement...')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-violet-900/40 border border-white/10 hover:border-violet-500/40 rounded-xl text-xs font-medium text-slate-200 transition-all cursor-pointer"
            >
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>Text Note</span>
            </button>

            {/* Image Stamp Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowImagePrompt(!showImagePrompt);
                  setShowStickerDrawer(false);
                  setShowBadgeDrawer(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-violet-900/40 border border-white/10 hover:border-violet-500/40 rounded-xl text-xs font-medium text-slate-200 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Image Stamp</span>
              </button>

              {/* Image URL Prompt */}
              {showImagePrompt && (
                <form
                  onSubmit={handleAddImage}
                  className="absolute left-0 top-10 z-50 p-3 bg-slate-900 border border-violet-500/40 rounded-2xl shadow-2xl flex gap-2 w-72 backdrop-blur-xl"
                >
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    required
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Controls for currently selected element */}
          {selectedId && (
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400">Selected Item:</span>
              <button
                type="button"
                onClick={() => changeZIndex(selectedId, 1)}
                className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                title="Bring Forward"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => deleteElement(selectedId)}
                className="p-1 hover:bg-rose-500/20 rounded text-rose-400 hover:text-rose-300"
                title="Delete Element"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Interactive Canvas Workspace */}
      <div
        ref={containerRef}
        onClick={() => setSelectedId(null)}
        className={`relative w-full h-[450px] sm:h-[520px] rounded-2xl border transition-all overflow-hidden canvas-grid-bg ${
          isEditMode
            ? 'border-violet-500/40 shadow-inner'
            : 'border-white/10 shadow-xl'
        }`}
      >
        {/* Empty Canvas Placeholder */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">This profile canvas is waiting for art</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {isOwner
                ? 'Click "Decorate Profile" to add stickers, badges, and thoughts to your space.'
                : 'The artist has not added any decor to this canvas yet.'}
            </p>
          </div>
        )}

        {/* Render Canvas Elements */}
        {elements.map((el) => {
          const isSelected = selectedId === el.id;

          if (!isEditMode) {
            // Read-Only View Mode (Smooth, non-draggable or view rendering)
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  zIndex: el.zIndex || 1
                }}
                className="transition-transform duration-200 select-none"
              >
                {renderElementContent(el, false)}
              </div>
            );
          }

          // Edit Mode: react-rnd drag & resize enabled
          return (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => {
                updateElementTransform(el.id, { x: d.x, y: d.y });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateElementTransform(el.id, {
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  ...position
                });
              }}
              bounds="parent"
              style={{ zIndex: el.zIndex || 1 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedId(el.id);
              }}
              className={`cursor-move transition-shadow ${
                isSelected
                  ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-black/50 shadow-2xl'
                  : 'hover:ring-1 hover:ring-white/30'
              }`}
            >
              <div className="w-full h-full relative group">
                {renderElementContent(el, true, (newContent) =>
                  updateElementContent(el.id, newContent)
                )}

                {/* Edit Mode Helper: Quick Delete Icon on Element Hover */}
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                    className="absolute -top-2.5 -right-2.5 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg z-50 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
}

// Helper to render element internal visual based on type
function renderElementContent(el, isEditing, onContentChange) {
  switch (el.type) {
    case 'sticker':
      return (
        <div className="w-full h-full flex items-center justify-center p-2 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/10 hover:scale-105 transition-transform">
          <span className="text-4xl sm:text-5xl drop-shadow-lg filter select-none">
            {el.content}
          </span>
        </div>
      );

    case 'badge':
      return (
        <div className="w-full h-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-violet-900/60 via-purple-900/50 to-fuchsia-900/60 backdrop-blur-md rounded-full border border-violet-500/40 shadow-lg text-violet-200 text-xs sm:text-sm font-bold tracking-wide select-none">
          {isEditing ? (
            <input
              type="text"
              value={el.content}
              onChange={(e) => onContentChange && onContentChange(e.target.value)}
              className="bg-transparent text-center text-xs sm:text-sm font-bold text-violet-100 focus:outline-none w-full"
            />
          ) : (
            <span>{el.content}</span>
          )}
        </div>
      );

    case 'image':
      return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/60">
          <img
            src={el.url}
            alt="Stamp"
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80';
            }}
          />
        </div>
      );

    case 'text':
    default:
      return (
        <div className="w-full h-full p-3.5 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between overflow-hidden">
          {isEditing ? (
            <textarea
              value={el.content}
              onChange={(e) => onContentChange && onContentChange(e.target.value)}
              className="w-full h-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
              placeholder="Your note..."
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-none">
              {el.content}
            </p>
          )}
        </div>
      );
  }
}
