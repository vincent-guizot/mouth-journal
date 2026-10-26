import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Firebase Security Rules & Cloud Firestore Integrity Suite', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const firestoreRulesPath = path.join(rootDir, 'firebase/firestore.rules');
  const storageRulesPath = path.join(rootDir, 'firebase/storage.rules');

  const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf8');
  const storageRules = fs.readFileSync(storageRulesPath, 'utf8');

  test('firestore.rules enforces default-deny for all unauthorized root queries', () => {
    assert.ok(
      firestoreRules.includes('match /{document=**} {') &&
      firestoreRules.includes('allow read, write: if false;'),
      'Root collections must be denied by default'
    );
  });

  test('firestore.rules mandates request.auth.uid == userId across all subcollections', () => {
    // Assert helper function isOwner is defined
    assert.ok(
      firestoreRules.includes('function isOwner(userId) {') &&
      firestoreRules.includes('request.auth.uid == userId;'),
      'Rule must contain an isOwner verification helper'
    );

    // Verify subcollections: journals, wishlist, preferences
    assert.ok(firestoreRules.includes('match /journals/{journalId}'));
    assert.ok(firestoreRules.includes('match /wishlist/{itemId}'));
    assert.ok(firestoreRules.includes('match /preferences/{docId}'));

    // Assert that no wildcard public read permission exists
    assert.ok(!firestoreRules.includes('allow read: if true;'), 'Public reads are strictly forbidden');
    assert.ok(!firestoreRules.includes('allow write: if true;'), 'Public writes are strictly forbidden');
  });

  test('storage.rules restricts file uploads to owner user path only', () => {
    assert.ok(
      storageRules.includes('match /users/{userId}/{allPaths=**}'),
      'Storage must scope paths under /users/{userId}/'
    );

    assert.ok(
      storageRules.includes('isOwner(userId)'),
      'Storage read/write must require authenticated owner uid match'
    );
  });

  test('storage.rules enforces 10MB file size limit and image/* MIME constraint', () => {
    assert.ok(
      storageRules.includes("request.resource.contentType.matches('image/.*')"),
      'Uploads must be restricted to image MIME types'
    );

    assert.ok(
      storageRules.includes('10 * 1024 * 1024'),
      'Uploads must strictly enforce 10MB limit'
    );
  });
});
