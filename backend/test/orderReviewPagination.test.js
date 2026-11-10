import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import Product from '../src/features/products/product.model.js';
import Order from '../src/features/orders/order.model.js';
import Review from '../src/features/reviews/review.model.js';

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

  const orderIndexes = Order.schema.indexes().map(([spec]) => spec);
  assert.ok(
    orderIndexes.some((spec) => spec.createdAt === -1 && spec._id === -1),
    'Order should index { createdAt: -1, _id: -1 }'
  );
  assert.ok(
    orderIndexes.some((spec) => spec.user === 1 && spec.createdAt === -1),
    'Order should index { user: 1, createdAt: -1 }'
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

