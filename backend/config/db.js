// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Kết nối tới MongoDB bằng đường link trong file .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🚀 MongoDB đã kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1); // Dừng server nếu kết nối DB thất bại
  }
};

module.exports = connectDB;