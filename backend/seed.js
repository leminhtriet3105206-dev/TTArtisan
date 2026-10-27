require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Checking existing data...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database already has ${userCount} users. Checking posts...`);
      const postCount = await Post.countDocuments();
      if (postCount > 0) {
        console.log(`Database already has ${postCount} posts. Seeding skipped.`);
        process.exit(0);
      }
    }

    console.log('Seeding initial community artists and artwork...');

    // Clear existing if any
    await User.deleteMany({});
    await Post.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('artisan123', salt);

    // Create 3 artists
    const artist1 = await User.create({
      username: 'aurora_dreamer',
      email: 'aurora@ttartisan.art',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Digital surrealism & neon fantasy concept artist. Exploring ethereal dimensions through digital brushstrokes.',
      profileLayout: [
        {
          id: 'badge-1',
          type: 'badge',
          content: '✨ Featured Surrealist',
          url: '',
          x: 30,
          y: 30,
          width: 220,
          height: 44,
          zIndex: 10
        },
        {
          id: 'text-1',
          type: 'text',
          content: '“Art is not what you see, but what you make others see.” — Welcome to my dreamscape studio!',
          url: '',
          x: 30,
          y: 90,
          width: 320,
          height: 80,
          zIndex: 5
        },
        {
          id: 'sticker-1',
          type: 'sticker',
          content: '🔮 Cyber Dream',
          url: '',
          x: 380,
          y: 35,
          width: 170,
          height: 50,
          zIndex: 8
        }
      ]
    });

    const artist2 = await User.create({
      username: 'neon_samurai',
      email: 'samurai@ttartisan.art',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Cyberpunk architect & 3D character sculptor. Tokyo night vibes & future grit.',
      profileLayout: [
        {
          id: 'badge-2',
          type: 'badge',
          content: '⚡ Cyberpunk 2099',
          url: '',
          x: 40,
          y: 40,
          width: 200,
          height: 44,
          zIndex: 10
        },
        {
          id: 'text-2',
          type: 'text',
          content: 'Rendering the mechanical soul of mega-cities.',
          url: '',
          x: 40,
          y: 100,
          width: 290,
          height: 60,
          zIndex: 4
        }
      ]
    });

    const artist3 = await User.create({
      username: 'celestial_muse',
      email: 'celestial@ttartisan.art',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'Botanical anime illustrations & atmospheric color theory. Soft light enthusiast.',
      profileLayout: [
        {
          id: 'badge-3',
          type: 'badge',
          content: '🌸 Botanical Whisper',
          url: '',
          x: 40,
          y: 30,
          width: 210,
          height: 44,
          zIndex: 10
        },
        {
          id: 'text-3',
          type: 'text',
          content: 'Lost among stars, petals, and twilight memories.',
          url: '',
          x: 40,
          y: 90,
          width: 300,
          height: 60,
          zIndex: 4
        }
      ]
    });

    // Sample Artworks
    const artworks = [
      {
        user: artist1._id,
        imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
        title: 'Echoes of the Celestial Bloom',
        description: 'An exploration of chromatic resonance and botanical rebirth within a gravity-less chamber.',
        aspectRatio: '4:3',
        likes: [artist2._id, artist3._id]
      },
      {
        user: artist2._id,
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
        title: 'Neo-Shinjuku Midnight Protocol',
        description: 'Atmospheric neon downpour over alleyway fiber networks and autonomous couriers.',
        aspectRatio: '16:9',
        likes: [artist1._id]
      },
      {
        user: artist3._id,
        imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
        title: 'Prismatic Solitude',
        description: 'Vibrant fluid dynamics simulating emotional dispersion across holographic canvas.',
        aspectRatio: '1:1',
        likes: [artist1._id, artist2._id]
      },
      {
        user: artist1._id,
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
        title: 'Whispering Constellations',
        description: 'Deep cosmic mist swirling through forgotten planetary observatories.',
        aspectRatio: '3:4',
        likes: [artist3._id]
      },
      {
        user: artist2._id,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        title: 'Synthetic Aurora Waveform',
        description: 'Parametric ribbons rendered with sub-surface scattering and iridescent film reflection.',
        aspectRatio: '16:9',
        likes: [artist1._id, artist3._id]
      },
      {
        user: artist3._id,
        imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80',
        title: 'Serenade of the Obsidian Garden',
        description: 'Traditional oil texture blended with generative light particles and lunar luminescence.',
        aspectRatio: '4:3',
        likes: [artist2._id]
      }
    ];

    await Post.insertMany(artworks);
    console.log(`✅ Successfully seeded 3 artists and ${artworks.length} artworks!`);
    console.log('Login credentials for demo:');
    console.log('Username: aurora_dreamer (or neon_samurai / celestial_muse)');
    console.log('Password: artisan123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
