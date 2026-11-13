import app from './app.js';
import { ENV } from './configs/env.config.js';
import { connectDB } from './configs/db.config.js';
import { expireOverdueBankTransfers } from './features/orders/order.service.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const expirePayments = () => expireOverdueBankTransfers()
    .then((result) => {
      if (result.modifiedCount > 0) console.log(`[Orders] Expired ${result.modifiedCount} overdue bank transfer(s)`);
    })
    .catch((error) => console.error(`[Orders] Could not expire overdue bank transfers: ${error.message}`));
  await expirePayments();
  const expirationTimer = setInterval(expirePayments, 60_000);
  expirationTimer.unref?.();

  // Listen on configured PORT
  app.listen(ENV.PORT, () => {
    console.log(`[AquaCraft Server] Running on http://localhost:${ENV.PORT} (${ENV.NODE_ENV})`);
  });
};

startServer();
