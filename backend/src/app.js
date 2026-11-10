import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './configs/env.config.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { uploadsDir } from './middlewares/upload.middleware.js';

// Feature Routes
import authRoutes from './features/auth/auth.routes.js';
import userRoutes from './features/users/user.routes.js';
import productRoutes from './features/products/product.routes.js';
import cartRoutes from './features/cart/cart.routes.js';
import orderRoutes from './features/orders/order.routes.js';
import reviewRoutes from './features/reviews/review.routes.js';

const app = express();

// Middlewares
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid blocking
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AquaCraft API is running smoothly' });
});

// Feature Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;

