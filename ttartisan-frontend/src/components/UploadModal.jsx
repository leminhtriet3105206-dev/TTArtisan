import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { motion } from 'framer-motion';
import { X, UploadCloud, Crop, Sparkles, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { postAPI } from '../api';
import { useToast } from '../context/ToastContext';

// Helper to calculate a centered crop based on aspect ratio
function getCenterAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function UploadModal({ isOpen, onClose, onPostCreated }) {
  const { success, error } = useToast();

  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('auto'); // '1:1', '4:3', '16:9', 'auto'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      error('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
    });
    reader.readAsDataURL(file);
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Image load callback to set initial crop
  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (aspectRatio !== 'auto') {
      const numAspect = parseAspect(aspectRatio);
      setCrop(getCenterAspectCrop(naturalWidth, naturalHeight, numAspect));
    }
  };

  const parseAspect = (ratioStr) => {
    if (ratioStr === '1:1') return 1;
    if (ratioStr === '4:3') return 4 / 3;
    if (ratioStr === '16:9') return 16 / 9;
    return undefined;
  };

  const handleAspectChange = (ratio) => {
    setAspectRatio(ratio);
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const numAspect = parseAspect(ratio);
      if (numAspect) {
        setCrop(getCenterAspectCrop(naturalWidth, naturalHeight, numAspect));
      } else {
        setCrop(undefined);
      }
    }
  };

  // Generate cropped image canvas base64
  const getCroppedImgBase64 = () => {
    const image = imgRef.current;
    if (!image || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      // Return original image if not cropped
      return imgSrc;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return imgSrc;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imgSrc) {
      error('Please select an artwork to upload');
      return;
    }

    setUploading(true);
    try {
      const finalImageBase64 = getCroppedImgBase64();

      const response = await postAPI.createPost({
        imageBase64: finalImageBase64,
        title: title.trim() || 'Untitled Artwork',
        description: description.trim(),
        aspectRatio: aspectRatio
      });

      success('Artwork uploaded to Cloudinary & published successfully! 🎉');
      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
      onClose();
      // Reset state
      setImgSrc('');
      setTitle('');
      setDescription('');
      setCrop(undefined);
    } catch (err) {
      console.error('Upload Error:', err);
      error(err.message || 'Failed to upload artwork');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-[#111726]/95 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={uploading}
          className="absolute top-5 right-5 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Create New Artwork</h2>
            <p className="text-xs text-slate-400">Crop, refine aspect ratio, and publish to TTArtisan.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dropzone / Cropper Area */}
          {!imgSrc ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-violet-500 bg-violet-600/10 scale-[1.01]'
                  : 'border-white/15 hover:border-violet-500/50 hover:bg-slate-900/40 bg-slate-900/20'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Drop your artwork here, or <span className="text-violet-400 underline underline-offset-2">browse files</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP, GIF up to 15MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Aspect Ratio Selector Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-2 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pl-2">
                  <Crop className="w-4 h-4 text-violet-400" />
                  <span>Crop Ratio:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Original', value: 'auto' },
                    { label: '1:1 Square', value: '1:1' },
                    { label: '4:3 Classic', value: '4:3' },
                    { label: '16:9 Cinema', value: '16:9' }
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => handleAspectChange(ratio.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        aspectRatio === ratio.value
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setImgSrc('');
                      setCrop(undefined);
                      setCompletedCrop(null);
                    }}
                    className="ml-2 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              </div>

              {/* Crop Canvas Display */}
              <div className="max-h-[380px] overflow-auto flex items-center justify-center bg-black/60 rounded-xl border border-white/10 p-2">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={parseAspect(aspectRatio)}
                  className="max-h-[360px]"
                >
                  <img
                    ref={imgRef}
                    alt="Upload Crop Preview"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[360px] object-contain rounded-lg"
                  />
                </ReactCrop>
              </div>
            </div>
          )}

          {/* Metadata Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Artwork Title
              </label>
              <input
                type="text"
                placeholder="e.g. Celestial Nebula Bloom"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Description & Technique
              </label>
              <textarea
                placeholder="Share the medium, inspiration, software used, or story behind this piece..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={800}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !imgSrc}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 disabled:opacity-50 transition-all cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish to Community</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
