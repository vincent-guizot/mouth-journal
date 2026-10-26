import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Data Portability & User JSON Export Suite', () => {
  const buildUserExportArchive = (
    user: { uid: string; displayName?: string; email?: string },
    journals: any[],
    wishlist: any[]
  ) => {
    // Strict assertion: ensure no cross-user data can be injected
    const sanitizedJournals = journals.filter((j) => j.userId === user.uid);
    const sanitizedWishlist = wishlist.filter((w) => w.userId === user.uid);

    const totalSpent = sanitizedJournals.reduce((sum, j) => sum + (j.totalSpent || 0), 0);

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: {
        uid: user.uid,
        displayName: user.displayName || 'Pengguna',
        email: user.email || 'unknown@example.com',
      },
      stats: {
        totalJournals: sanitizedJournals.length,
        totalWishlistItems: sanitizedWishlist.length,
        totalSpent,
      },
      journals: sanitizedJournals,
      wishlist: sanitizedWishlist,
    };
  };

  test('Export payload contains all user records and statistics accurately', () => {
    const user = { uid: 'u_alice_01', displayName: 'Alice', email: 'alice@example.com' };
    const journals = [
      { id: 'j1', userId: 'u_alice_01', placeName: 'Cafe A', totalSpent: 45000 },
      { id: 'j2', userId: 'u_alice_01', placeName: 'Resto B', totalSpent: 120000 },
    ];
    const wishlist = [
      { id: 'w1', userId: 'u_alice_01', placeName: 'Bakery C' },
    ];

    const archive = buildUserExportArchive(user, journals, wishlist);

    assert.equal(archive.user.uid, 'u_alice_01');
    assert.equal(archive.stats.totalJournals, 2);
    assert.equal(archive.stats.totalWishlistItems, 1);
    assert.equal(archive.stats.totalSpent, 165000);
    assert.equal(archive.journals.length, 2);
    assert.equal(archive.wishlist.length, 1);
  });

  test('Export sanitizer strictly rejects and excludes records from other users', () => {
    const user = { uid: 'u_alice_01', displayName: 'Alice' };
    const mixedJournals = [
      { id: 'j1', userId: 'u_alice_01', placeName: 'Alice Coffee', totalSpent: 50000 },
      { id: 'j_stolen', userId: 'u_bob_99', placeName: 'Bob Steak', totalSpent: 300000 }, // User B record
    ];
    const mixedWishlist = [
      { id: 'w1', userId: 'u_alice_01', placeName: 'Alice Target' },
      { id: 'w_stolen', userId: 'u_bob_99', placeName: 'Bob Target' }, // User B record
    ];

    const archive = buildUserExportArchive(user, mixedJournals, mixedWishlist);

    // Only Alice's records should be present
    assert.equal(archive.journals.length, 1);
    assert.equal(archive.journals[0].id, 'j1');
    assert.equal(archive.wishlist.length, 1);
    assert.equal(archive.wishlist[0].id, 'w1');
    assert.equal(archive.stats.totalSpent, 50000); // Bob's 300k is excluded
  });
});
