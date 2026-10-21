import test from 'node:test';
import assert from 'node:assert/strict';
import { getPosts, getCategories } from './api.js';

test('getPosts returns published mock posts when Supabase unconfigured', async () => {
  const result = await getPosts({ page: 1, limit: 10, status: 'published' });
  assert.ok(result);
  console.log('Result total posts:', result.total);
  assert.ok(result.posts.length > 0, 'Posts should contain items');
  assert.equal(result.posts[0].status, 'published');
});

test('getCategories returns category items', async () => {
  const cats = await getCategories();
  assert.ok(Array.isArray(cats));
  assert.ok(cats.length >= 6);
});
