import app from './app.js';
import { ENV } from './configs/env.config.js';
import { connectDB } from './configs/db.config.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Listen on configured PORT
  app.listen(ENV.PORT, () => {
    console.log(`[AquaCraft Server] Running on http://localhost:${ENV.PORT} (${ENV.NODE_ENV})`);
  });
};

startServer();
