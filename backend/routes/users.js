const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// [GET] /api/users/profile/:username - Public profile fetch with layout & posts
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Fetch user's artworks
    const posts = await Post.find({ user: user._id })
      .populate('user', 'username avatar bio')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        profileLayout: user.profileLayout || [],
        createdAt: user.createdAt
      },
      posts,
      totalPosts: posts.length
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

// [PUT] /api/users/profile/decor - Authenticated. Save/update user's canvas profileLayout array
router.put('/profile/decor', auth, async (req, res) => {
  try {
    const { profileLayout } = req.body;

    if (!Array.isArray(profileLayout)) {
      return res.status(400).json({ message: 'profileLayout must be an array of layout elements.' });
    }

    // Sanitize and validate elements
    const sanitizedLayout = profileLayout.map((item, index) => ({
      id: item.id || `element-${Date.now()}-${index}`,
      type: ['sticker', 'image', 'text', 'badge'].includes(item.type) ? item.type : 'text',
      content: typeof item.content === 'string' ? item.content : '',
      url: typeof item.url === 'string' ? item.url : '',
      x: typeof item.x === 'number' ? item.x : 0,
      y: typeof item.y === 'number' ? item.y : 0,
      width: typeof item.width === 'number' ? item.width : 160,
      height: typeof item.height === 'number' ? item.height : 80,
      zIndex: typeof item.zIndex === 'number' ? item.zIndex : 1
    }));

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileLayout: sanitizedLayout },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      message: 'Profile layout saved successfully!',
      profileLayout: updatedUser.profileLayout
    });
  } catch (error) {
    console.error('Update Profile Decor Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to save profile decoration.' });
  }
});

// [PUT] /api/users/profile - Authenticated. Update user bio & avatar
router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const updates = {};

    if (typeof bio === 'string') updates.bio = bio.trim();
    if (typeof avatar === 'string' && avatar.trim()) updates.avatar = avatar.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        profileLayout: updatedUser.profileLayout
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

module.exports = router;
