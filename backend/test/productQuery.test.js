import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { buildProductQuery, buildSortOption } from '../src/features/products/product.service.js';

test('buildProductQuery defaults to active products and supports categories list', () => {
  const defaultQuery = buildProductQuery({});
  assert.strictEqual(defaultQuery.isActive, true);

  const suppliesQuery = buildProductQuery({ categories: 'food,accessory,tank' });
  assert.deepStrictEqual(suppliesQuery.category, { $in: ['food', 'accessory', 'tank'] });

  const adminAllQuery = buildProductQuery({ all: 'true', isActive: 'false' });
  assert.strictEqual(adminAllQuery.isActive, false);
});

test('buildProductQuery escapes regex in search and supports non-accented slug matching without touching description', () => {
  const query = buildProductQuery({ search: 'Cá Dĩa, (neon)' });
  assert.ok(Array.isArray(query.$and));
  const searchOr = query.$and[0].$or;
  assert.ok(searchOr.some((cond) => cond.name instanceof RegExp && cond.name.test('Cá Dĩa')));
  assert.ok(searchOr.some((cond) => cond.slug instanceof RegExp && cond.slug.test('ca-dia-do')));
  assert.ok(searchOr.some((cond) => cond.name instanceof RegExp && cond.name.test('(neon)')));
  assert.ok(searchOr.every((cond) => !('description' in cond)));
});

test('buildProductQuery combines collection, sale, fish filter, and search safely in $and', () => {
  const query = buildProductQuery({
    collection: 'ca-chuot',
    sale: 'true',
    search: 'panda',
    maxStock: '5',
  });
  assert.strictEqual(query.$and.length, 3);
  assert.deepStrictEqual(query.stock, { $lte: 5 });
});

test('buildSortOption maps supported sort modes', () => {
  assert.deepStrictEqual(buildSortOption('name-asc'), { name: 1, _id: 1 });
  assert.deepStrictEqual(buildSortOption('name-desc'), { name: -1, _id: 1 });
  assert.deepStrictEqual(buildSortOption('price-asc'), { price: 1, createdAt: -1 });
  assert.deepStrictEqual(buildSortOption('price-desc'), { price: -1, createdAt: -1 });
  assert.deepStrictEqual(buildSortOption('stock-asc'), { stock: 1, createdAt: -1 });
  assert.deepStrictEqual(buildSortOption('newest'), { createdAt: -1, _id: 1 });
});

test('GET /api/products/stats is matched before /:id and protected by auth', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const res = await fetch(`http://localhost:${port}/api/products/stats`);
    assert.strictEqual(res.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
