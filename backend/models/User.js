const mongoose = require('mongoose');

const profileItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['sticker', 'image', 'text', 'badge'], 
      default: 'text' 
    },
    content: { type: String, default: '' },
    url: { type: String, default: '' },
    x: { type: Number, default: 40 },
    y: { type: Number, default: 40 },
    width: { type: Number, default: 160 },
    height: { type: Number, default: 80 },
    zIndex: { type: Number, default: 1 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: 'Visual creator & digital artist on TTArtisan ✨'
    },
    profileLayout: {
      type: [profileItemSchema],
      default: () => [
        {
          id: 'welcome-badge',
          type: 'badge',
          content: '🎨 TTArtisan Creator',
          url: '',
          x: 40,
          y: 40,
          width: 200,
          height: 48,
          zIndex: 10
        },
        {
          id: 'welcome-bio',
          type: 'text',
          content: 'Welcome to my visual canvas! Click "Decorate Profile" to customize this space.',
          url: '',
          x: 40,
          y: 110,
          width: 280,
          height: 90,
          zIndex: 5
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);