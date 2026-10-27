# TTArtisan — Social Platform & Interactive Canvas for Visual Creators

TTArtisan is a full-stack web application designed for digital artists, concept illustrators, and visual creators. It combines a Pinterest-style masonry artwork showcase with an interactive drag-and-drop profile canvas decorator.

---

## 🚀 Key Features

### 1. Home Feed & Masonry Showcase
- **Pinterest-Style Masonry Grid**: Responsive masonry layout (`columns-1 sm:columns-2 md:columns-3 lg:columns-4`) displaying artworks.
- **Search & Filter**: Live keyword search across titles and descriptions, ratio filter (`ALL`, `1:1`, `4:3`, `16:9`), and popular/latest sorting.
- **Interactive Lightbox**: Click any artwork to open a modal with full-resolution display, artist bio, like counts, and author delete actions.

### 2. Image Upload & In-Browser Crop
- **Aspect Ratio Switcher**: Crop to `1:1 Square`, `4:3 Classic`, `16:9 Cinema`, or keep `Original` unconstrained using `react-image-crop`.
- **Drag & Drop Upload**: Drag image files directly into the browser with live preview.
- **Cloudinary Integration**: Direct image upload to Cloudinary with automatic optimizations.

### 3. Interactive Profile Canvas Decorator (`/profile/:username`)
- **Interactive Workspace**: Drag, resize, layer (`zIndex`), and rotate elements freely using `react-rnd`.
- **Customizable Elements**:
  - 🎨 **Stickers**: Emojis and visual iconography (💎, 🚀, 🌸, ⚡, 🔮, 💫).
  - 🏷️ **Badges**: Glowing community pills ("✦ TTArtisan Creator", "⚡ Digital Cyberpunk", etc.).
  - 📝 **Notes**: Customizable artist statements and sticky thoughts.
  - 🖼️ **Image Stamps**: Custom image URLs positioned anywhere on the canvas.
- **Persistence**: Save layout directly to MongoDB via `PUT /api/users/profile/decor`.
- **View vs Edit Mode**: Public visitors view a clean, responsive layout; profile owners can toggle between view and decoration mode.

### 4. Authentication & Community
- **JWT Auth**: Secure registration, login, token refresh, and password hashing with `bcryptjs`.
- **1-Click Demo Accounts**: Instant demo login as `@aurora_dreamer` or `@neon_samurai` (password: `artisan123`).

---

## 🛠️ Tech Stack

- **Backend** (`backend`):
  - Node.js & Express.js
  - MongoDB & Mongoose
  - JWT (`jsonwebtoken`) & `bcryptjs`
  - Multer & Cloudinary SDK (`cloudinary`, `multer-storage-cloudinary`)
  - CORS middleware
- **Frontend** (`ttartisan-frontend`):
  - React 19 & Vite 8
  - Tailwind CSS v4 & `@tailwindcss/vite`
  - React Router DOM v7
  - `framer-motion`
  - `react-rnd` (interactive drag, resize & positioning)
  - `react-image-crop` (aspect ratio cropping)
  - `lucide-react` icons
  - `axios` with interceptors

---

## 🏃 Running Locally

### Backend Setup
```bash
cd backend
npm install
node seed.js        # Seed initial community artists and artworks (optional)
npm start           # Starts backend on http://localhost:5000
```

### Frontend Setup
```bash
cd ttartisan-frontend
npm install
npm run dev         # Starts Vite dev server on http://127.0.0.1:5173
```

---

## 🔑 Demo Artist Accounts
- **Account 1**: `@aurora_dreamer` (Password: `artisan123`)
- **Account 2**: `@neon_samurai` (Password: `artisan123`)
- **Account 3**: `@celestial_muse` (Password: `artisan123`)
# TTArtisan
