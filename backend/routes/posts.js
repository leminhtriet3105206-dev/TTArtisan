const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { upload, uploadBufferToCloudinary, cloudinary } = require('../config/cloudinary');

// [POST] /api/posts - Create new post with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, aspectRatio, imageBase64 } = req.body;
    let imageUrl = '';

    // 1. Check if image came through Multer (Cloudinary storage sets file.path)
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || req.file.url;
    } else if (imageBase64) {
      // 2. Direct base64 string upload fallback from cropped image
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const uploadResult = await uploadBufferToCloudinary(buffer);
        imageUrl = uploadResult.secure_url;
      } else {
        const uploadResult = await cloudinary.uploader.upload(imageBase64, {
          folder: 'ttartisan_posts'
        });
        imageUrl = uploadResult.secure_url;
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Artwork image is required.' });
    }

    const newPost = new Post({
      user: req.user._id,
      imageUrl,
      title: title?.trim() || 'Untitled Artwork',
      description: description?.trim() || '',
      aspectRatio: aspectRatio || 'auto',
      likes: []
    });

    await newPost.save();

    // Populate user details for immediate client display
    await newPost.populate('user', 'username avatar bio');

    return res.status(201).json({
      message: 'Artwork published successfully!',
      post: newPost
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create post.' });
  }
});

// [GET] /api/posts - Public feed with pagination and optional user filter
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.user) {
      filter.user = req.query.user;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('user', 'username avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('Get Posts Error:', error);
    return res.status(500).json({ message: 'Failed to fetch artwork feed.' });
  }
});

// [GET] /api/posts/:id - Single post details
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username avatar bio');
    if (!post) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }
    return res.status(200).json({ post });
  } catch (error) {
    console.error('Get Post By ID Error:', error);
    return res.status(500).json({ message: 'Failed to fetch artwork.' });
  }
});

// [DELETE] /api/posts/:id - Authenticated, owner only
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Artwork deleted successfully.' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    return res.status(500).json({ message: 'Failed to delete post.' });
  }
});

// [PUT] /api/posts/:id/like - Authenticated like/unlike toggle
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }

    const userId = req.user._id;
    const hasLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (hasLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('user', 'username avatar bio');

    return res.status(200).json({
      message: hasLiked ? 'Artwork unliked' : 'Artwork liked',
      post,
      hasLiked: !hasLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Like Post Error:', error);
    return res.status(500).json({ message: 'Failed to update like status.' });
  }
});

module.exports = router;
