import mongoose from 'mongoose';
import { ENV } from './env.config.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Non-blocking in dev mode, or process.exit(1) if mandatory
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

