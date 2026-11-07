import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

test('Backend Express application is properly initialized', () => {
  assert.ok(app, 'Express app should be defined');
  assert.strictEqual(typeof app.listen, 'function', 'App should have listen method');
});

test('Health check endpoint GET /api/health returns 200 and OK status', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'OK');
    assert.ok(data.message.includes('AquaCraft API'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
