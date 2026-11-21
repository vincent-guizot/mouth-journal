import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PhotoUploadQueue } from '../../src/services/images/PhotoUploadQueue';
import { createMemoryKeyValueStore } from '../../src/storage/keyValueStore';

describe('PhotoUploadQueue (Offline Photo Uploads)', () => {
  test('enqueue stores tasks and getQueue retrieves them', async () => {
    const kv = createMemoryKeyValueStore();
    const queue = new PhotoUploadQueue(kv);

    await queue.enqueue({
      journalId: 'j-1',
      userId: 'user-1',
      localUris: ['file:///cache/photo1.jpg', 'file:///cache/photo2.jpg'],
    });

    const tasks = await queue.getQueue('user-1');
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].journalId, 'j-1');
    assert.deepEqual(tasks[0].localUris, ['file:///cache/photo1.jpg', 'file:///cache/photo2.jpg']);
    assert.equal(tasks[0].attempts, 0);
  });

  test('processQueue fails gracefully when offline and preserves task', async () => {
    const kv = createMemoryKeyValueStore();
    const queue = new PhotoUploadQueue(kv);

    await queue.enqueue({
      journalId: 'j-1',
      userId: 'user-1',
      localUris: ['file:///cache/photo1.jpg'],
    });

    let uploaded = false;
    const res = await queue.processQueue('user-1', {
      uploadPhoto: async () => {
        throw new Error('Network request failed (offline)');
      },
      onJournalPhotosUploaded: async () => {
        uploaded = true;
      },
    });

    assert.equal(res.processed, 0);
    assert.equal(res.failed, 1);
    assert.equal(uploaded, false);

    const remaining = await queue.getQueue('user-1');
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].attempts, 1);
    assert.match(remaining[0].lastError ?? '', /offline/);
  });

  test('processQueue uploads all photos, triggers update callback, and clears task when online', async () => {
    const kv = createMemoryKeyValueStore();
    const queue = new PhotoUploadQueue(kv);

    await queue.enqueue({
      journalId: 'j-1',
      userId: 'user-1',
      localUris: ['file:///cache/photo1.jpg', 'file:///cache/photo2.jpg'],
    });

    let updatedJournalId = '';
    let updatedUrls: string[] = [];

    const res = await queue.processQueue('user-1', {
      uploadPhoto: async (uri) => ({
        url: uri.replace('file:///cache/', 'https://storage.googleapis.com/test-bucket/'),
      }),
      onJournalPhotosUploaded: async (journalId, cloudUrls) => {
        updatedJournalId = journalId;
        updatedUrls = cloudUrls;
      },
    });

    assert.equal(res.processed, 1);
    assert.equal(res.failed, 0);
    assert.equal(updatedJournalId, 'j-1');
    assert.deepEqual(updatedUrls, [
      'https://storage.googleapis.com/test-bucket/photo1.jpg',
      'https://storage.googleapis.com/test-bucket/photo2.jpg',
    ]);

    const remaining = await queue.getQueue('user-1');
    assert.equal(remaining.length, 0);
  });

  test('user isolation: clearing user-1 queue does not affect user-2 queue', async () => {
    const kv = createMemoryKeyValueStore();
    const queue = new PhotoUploadQueue(kv);

    await queue.enqueue({
      journalId: 'j-1',
      userId: 'user-1',
      localUris: ['file:///cache/p1.jpg'],
    });
    await queue.enqueue({
      journalId: 'j-2',
      userId: 'user-2',
      localUris: ['file:///cache/p2.jpg'],
    });

    await queue.clear('user-1');

    assert.equal((await queue.getQueue('user-1')).length, 0);
    assert.equal((await queue.getQueue('user-2')).length, 1);
  });
});
