import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import Product from '../src/features/products/product.model.js';
import Order from '../src/features/orders/order.model.js';
import Review from '../src/features/reviews/review.model.js';
import User from '../src/features/users/user.model.js';

test('Product, Order, and Review schemas define indexes for paginated queries', () => {
  const productIndexes = Product.schema.indexes().map(([spec]) => spec);
  assert.ok(
    productIndexes.some((spec) => spec.isActive === 1 && spec.createdAt === -1),
    'Product should index { isActive: 1, createdAt: -1 }'
  );
  assert.ok(
    productIndexes.some((spec) => spec.isActive === 1 && spec.category === 1 && spec.createdAt === -1),
    'Product should index { isActive: 1, category: 1, createdAt: -1 }'
  );
  assert.ok(
    productIndexes.some((spec) => spec.category === 1 && spec.createdAt === -1),
    'Product should index { category: 1, createdAt: -1 }'
  );
  assert.ok(
    productIndexes.some((spec) => spec.stock === 1 && spec.createdAt === -1),
    'Product should index { stock: 1, createdAt: -1 }'
  );
  assert.ok(
    productIndexes.some((spec) => spec.category === 1 && spec.waterType === 1 && spec.stock === 1 && spec.price === 1),
    'Product should index { category: 1, waterType: 1, stock: 1, price: 1 }'
  );
  assert.ok(
    productIndexes.some((spec) => spec.isActive === 1 && spec.subCategory === 1 && spec.createdAt === -1),
    'Product should index { isActive: 1, subCategory: 1, createdAt: -1 }'
  );

  assert.ok(
    productIndexes.some((spec) => spec.name === 'text' && spec.categoryName === 'text'),
    'Product should define lightweight text index on name/categoryName/origin'
  );

  const orderIndexes = Order.schema.indexes().map(([spec]) => spec);
  assert.ok(
    orderIndexes.some((spec) => spec.createdAt === -1 && spec._id === -1),
    'Order should index { createdAt: -1, _id: -1 }'
  );
  assert.ok(
    orderIndexes.some((spec) => spec.status === 1 && spec.totalAmount === 1 && spec.createdAt === 1),
    'Order should define covering index for stats aggregation'
  );
  assert.ok(
    orderIndexes.some((spec) => spec.user === 1 && spec.createdAt === -1),
    'Order should index { user: 1, createdAt: -1 }'
  );

  const userIndexes = User.schema.indexes().map(([spec]) => spec);
  assert.ok(
    userIndexes.some((spec) => spec.createdAt === -1),
    'User should index { createdAt: -1 }'
  );

  const reviewIndexes = Review.schema.indexes().map(([spec]) => spec);
  assert.ok(
    reviewIndexes.some((spec) => spec.product === 1 && spec.createdAt === -1),
    'Review should index { product: 1, createdAt: -1 }'
  );
});

test('GET /api/orders/admin requires authentication', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const res = await fetch(`http://localhost:${port}/api/orders/admin?page=1&limit=10`);
    assert.strictEqual(res.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Protected auth, upload, order stats, and paginated users routes enforce auth/validation', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const [changeRes, uploadRes, orderStatsRes, usersRes, forgotRes] = await Promise.all([
      fetch(`http://localhost:${port}/api/auth/change-password`, { method: 'PUT' }),
      fetch(`http://localhost:${port}/api/products/upload`, { method: 'POST' }),
      fetch(`http://localhost:${port}/api/orders/stats`),
      fetch(`http://localhost:${port}/api/users?page=1&limit=10`),
      fetch(`http://localhost:${port}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', newPassword: '123' }),
      }),
    ]);

    assert.strictEqual(changeRes.status, 401);
    assert.strictEqual(uploadRes.status, 401);
    assert.strictEqual(orderStatsRes.status, 401);
    assert.strictEqual(usersRes.status, 401);
    assert.strictEqual(forgotRes.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Member 4: Dashboard & Review eligibility endpoints enforce authentication and protection', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const [dashStatsRes, recentOrdersRes, topProductsRes, reviewEligRes] = await Promise.all([
      fetch(`http://localhost:${port}/api/admin/dashboard/stats`),
      fetch(`http://localhost:${port}/api/admin/dashboard/recent-orders`),
      fetch(`http://localhost:${port}/api/admin/dashboard/top-products`),
      fetch(`http://localhost:${port}/api/reviews/product/64f1a2b3c4d5e6f7a8b9c0d1/eligibility`),
    ]);

    assert.strictEqual(dashStatsRes.status, 401, 'Dashboard stats must be protected');
    assert.strictEqual(recentOrdersRes.status, 401, 'Recent orders must be protected');
    assert.strictEqual(topProductsRes.status, 401, 'Top products must be protected');
    assert.strictEqual(reviewEligRes.status, 401, 'Review eligibility must require login');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});


