import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, disableNetwork, doc, enableNetwork, getDocFromServer, getDocs } from 'firebase/firestore';
import { getBytes, listAll, ref } from 'firebase/storage';
import { AuthError, AuthService, PendingChangesError, SessionUser } from '../../src/services/auth/AuthService';
import { createRepositoryBundle } from '../../src/repositories/createRepositories';
import { createMemoryKeyValueStore, userKeyPrefix } from '../../src/storage/keyValueStore';
import { ImageUploadError, MAX_IMAGE_BYTES, uploadImage } from '../../src/services/images/imageUpload';
import { ClientHandle, FIRESTORE_HOST, PROJECT_ID, STORAGE_HOST, createClient, getOobCodes, placeInput, uniqueEmail, validJournalDraft } from './helpers';

const root = path.resolve(__dirname, '../..');
let admin: RulesTestEnvironment;

before(async () => {
  const [fh, fp] = FIRESTORE_HOST.split(':');
  const [sh, sp] = STORAGE_HOST.split(':');
  admin = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: fh, port: Number(fp), rules: readFileSync(path.join(root, 'firebase/firestore.rules'), 'utf8') },
    storage: { host: sh, port: Number(sp), rules: readFileSync(path.join(root, 'firebase/storage.rules'), 'utf8') },
  });
});
after(async () => admin?.cleanup());

const PASSWORD = 'Passw0rd123';

const setup = () => {
  const client = createClient();
  const kv = createMemoryKeyValueStore();
  const repositories = createRepositoryBundle({ mode: 'firebase', db: client.db, kv, remoteTimeoutMs: 3000 });
  const service = new AuthService({ mode: 'firebase', auth: client.auth, db: client.db, storage: client.storage, kv, repositories });
  return { client, kv, repositories, service };
};

/** Server-side view that bypasses rules (verification only). */
// withSecurityRulesDisabled resolves to void, so results are captured by closure.
const adminDocs = async (uid: string) => {
  const out: Record<string, number> = {};
  await admin.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const sub of ['journals', 'wishlist', 'preferences']) out[sub] = (await getDocs(collection(db, 'users', uid, sub))).size;
    out.profile = (await getDocFromServer(doc(db, 'users', uid))).exists() ? 1 : 0;
  });
  return out;
};
const adminFiles = async (uid: string) => {
  let count = 0;
  await admin.withSecurityRulesDisabled(async (ctx) => {
    const res = await listAll(ref(ctx.storage(`gs://${PROJECT_ID}.appspot.com`), `users/${uid}`));
    count = res.items.length;
    for (const p of res.prefixes) count += (await listAll(p)).items.length;
  });
  return count;
};

const pngBlob = (size = 64) => ({ bytes: new Uint8Array(size), size, type: 'image/png' });

describe('AuthService with Firebase Auth emulator', () => {
  let ctx: ReturnType<typeof setup>;
  let email: string;
  let session: SessionUser;

  before(() => {
    ctx = setup();
    email = uniqueEmail('auth');
  });
  after(async () => ctx.client.dispose());

  test('register validates input before calling Firebase', async () => {
    await assert.rejects(ctx.service.register('not-an-email', PASSWORD, 'A'), (e: AuthError) => e.code === 'auth/invalid-email');
    await assert.rejects(ctx.service.register(email, 'short', 'A'), (e: AuthError) => e.code === 'auth/weak-password');
    await assert.rejects(ctx.service.register(email, PASSWORD, '  '), (e: AuthError) => e.code === 'app/invalid-name');
  });

  test('register creates the Auth user, sets displayName and creates /users/{uid}', async () => {
    session = await ctx.service.register(email, PASSWORD, 'Rina');
    assert.equal(session.email, email);
    assert.equal(ctx.client.auth.currentUser?.displayName, 'Rina');
    const snap = await getDocFromServer(doc(ctx.client.db, 'users', session.uid));
    assert.equal(snap.data()?.displayName, 'Rina');
    assert.equal(snap.data()?.email, email);
  });

  test('registering the same email again fails with a real error', async () => {
    const other = setup();
    try {
      await assert.rejects(other.service.register(email, PASSWORD, 'Dup'), (e: AuthError) => e.code === 'auth/email-already-in-use');
    } finally {
      await other.client.dispose();
    }
  });

  test('subscribe reflects Firebase auth state (no stale local session)', async () => {
    const events: (string | null)[] = [];
    const unsub = ctx.service.subscribe((u) => events.push(u?.uid ?? null));
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(events.at(-1), session.uid);
    await ctx.service.logout();
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(events.at(-1), null);
    unsub();
  });

  test('login with a wrong password fails, with the right one succeeds', async () => {
    await assert.rejects(ctx.service.login(email, 'WrongPass999'), (e: AuthError) => e instanceof AuthError && e.message === 'Email atau password salah.');
    assert.equal(ctx.client.auth.currentUser, null);
    const s = await ctx.service.login(email, PASSWORD);
    assert.equal(s.uid, session.uid);
  });

  test('sendPasswordReset sends a real reset email (emulator OOB code), resend works', async () => {
    const before = (await getOobCodes()).filter((c) => c.email === email && c.requestType === 'PASSWORD_RESET').length;
    await ctx.service.sendPasswordReset(email);
    await ctx.service.sendPasswordReset(email);
    const afterCount = (await getOobCodes()).filter((c) => c.email === email && c.requestType === 'PASSWORD_RESET').length;
    assert.equal(afterCount - before, 2);
    await assert.rejects(ctx.service.sendPasswordReset('bad'), (e: AuthError) => e.code === 'auth/invalid-email');
  });

  test('updateAccountProfile syncs displayName to Auth + Firestore; email change needs verification', async () => {
    const { profile, emailVerificationSentTo } = await ctx.service.updateAccountProfile(session.uid, {
      displayName: 'Rina Baru',
      email: uniqueEmail('new'),
    });
    assert.equal(profile.displayName, 'Rina Baru');
    assert.equal(profile.email, email, 'Firestore email unchanged until verified');
    assert.ok(emailVerificationSentTo);
    assert.equal(ctx.client.auth.currentUser?.displayName, 'Rina Baru');
    const codes = await getOobCodes();
    assert.ok(codes.some((c) => c.requestType === 'VERIFY_AND_CHANGE_EMAIL'));
    assert.equal((await getDocFromServer(doc(ctx.client.db, 'users', session.uid))).data()?.displayName, 'Rina Baru');
  });

  test('logout refuses to drop unsynced changes, unless explicitly discarded; clears user cache', async () => {
    await ctx.repositories.journalRepository.getJournals(session.uid); // populate cache
    await disableNetwork(ctx.client.db);
    const r = await ctx.repositories.journalRepository.createJournal(session.uid, validJournalDraft());
    assert.equal(r.sync, 'pending');
    try {
      await assert.rejects(ctx.service.logout(), PendingChangesError);
      assert.ok(ctx.client.auth.currentUser, 'still signed in');
      await ctx.service.logout({ discardPending: true });
    } finally {
      await enableNetwork(ctx.client.db);
    }
    assert.equal(ctx.client.auth.currentUser, null);
    const leftover = Object.keys(ctx.kv.dump()).filter((k) => k.startsWith(userKeyPrefix(session.uid)));
    assert.deepEqual(leftover, []);
  });
});

describe('Account deletion (Auth + Firestore + Storage)', () => {
  test('wrong password: nothing is deleted; right password: everything is deleted', async () => {
    const ctx = setup();
    try {
      const email = uniqueEmail('del');
      const s = await ctx.service.register(email, PASSWORD, 'Hapus Saya');
      const { journalRepository, wishlistRepository, userPreferencesRepository } = ctx.repositories;
      await journalRepository.createJournal(s.uid, validJournalDraft());
      await journalRepository.createJournal(s.uid, validJournalDraft({ placeName: 'Kedua' }));
      await wishlistRepository.addToWishlist(s.uid, placeInput('osm-node-1'));
      await userPreferencesRepository.updatePreferences(s.uid, { searchRadiusKm: 3 });
      const deps = { mode: 'firebase' as const, storage: ctx.client.storage, loadImage: async () => pngBlob() };
      await uploadImage(deps, { uri: 'file:///a.png', userId: s.uid, folder: 'journals' });
      await uploadImage(deps, { uri: 'file:///b.png', userId: s.uid, folder: 'avatars' });

      assert.deepEqual(await adminDocs(s.uid), { journals: 2, wishlist: 1, preferences: 1, profile: 1 });
      assert.equal(await adminFiles(s.uid), 2);

      await assert.rejects(ctx.service.deleteAccount('WrongPass999'), AuthError);
      assert.deepEqual(await adminDocs(s.uid), { journals: 2, wishlist: 1, preferences: 1, profile: 1 }, 'nothing deleted on failed re-auth');
      assert.ok(ctx.client.auth.currentUser);

      const report = await ctx.service.deleteAccount(PASSWORD);
      assert.equal(report.firestoreDocumentsDeleted, 5);
      assert.equal(report.storageFilesDeleted, 2);
      assert.deepEqual(await adminDocs(s.uid), { journals: 0, wishlist: 0, preferences: 0, profile: 0 });
      assert.equal(await adminFiles(s.uid), 0);
      assert.equal(ctx.client.auth.currentUser, null);
      assert.deepEqual(Object.keys(ctx.kv.dump()).filter((k) => k.startsWith(userKeyPrefix(s.uid))), []);
      await assert.rejects(ctx.service.login(email, PASSWORD), AuthError, 'Auth user no longer exists');
    } finally {
      await ctx.client.dispose();
    }
  });
});

describe('Image upload against Storage emulator', () => {
  let ctx: ReturnType<typeof setup>;
  let uid: string;
  before(async () => {
    ctx = setup();
    uid = (await ctx.service.register(uniqueEmail('img'), PASSWORD, 'Img')).uid;
  });
  after(async () => ctx.client.dispose());

  test('uploads with the real content type and returns a download URL', async () => {
    const res = await uploadImage(
      { mode: 'firebase', storage: ctx.client.storage, loadImage: async () => pngBlob(128) },
      { uri: 'file:///x.png', userId: uid, folder: 'journals' }
    );
    assert.equal(res.kind, 'cloud');
    assert.equal(res.contentType, 'image/png');
    assert.ok(res.storagePath?.endsWith('.png'));
    const bytes = await getBytes(ref(ctx.client.storage, res.storagePath!));
    assert.equal(bytes.byteLength, 128);
  });

  test('declared image/jpg is normalised to image/jpeg', async () => {
    const res = await uploadImage(
      { mode: 'firebase', storage: ctx.client.storage, loadImage: async () => ({ bytes: new Uint8Array(10), size: 10 }) },
      { uri: 'file:///x.jpg', mimeType: 'image/jpg', userId: uid, folder: 'menus' }
    );
    assert.equal(res.contentType, 'image/jpeg');
  });

  test('files over 10 MB and non-image types fail loudly; nothing is uploaded', async () => {
    const before = await adminFiles(uid);
    await assert.rejects(
      uploadImage(
        { mode: 'firebase', storage: ctx.client.storage, loadImage: async () => ({ bytes: new Uint8Array(MAX_IMAGE_BYTES + 1), size: MAX_IMAGE_BYTES + 1, type: 'image/jpeg' }) },
        { uri: 'file:///big.jpg', userId: uid, folder: 'journals' }
      ),
      (e: ImageUploadError) => e.code === 'too-large'
    );
    await assert.rejects(
      uploadImage(
        { mode: 'firebase', storage: ctx.client.storage, loadImage: async () => ({ bytes: new TextEncoder().encode('hello'), size: 5, type: 'text/plain' }) },
        { uri: 'file:///a.txt', userId: uid, folder: 'journals' }
      ),
      (e: ImageUploadError) => e.code === 'unsupported-type'
    );
    assert.equal(await adminFiles(uid), before);
  });

  test("uploading into another user's folder is rejected by rules and reported", async () => {
    await assert.rejects(
      uploadImage(
        { mode: 'firebase', storage: ctx.client.storage, loadImage: async () => pngBlob() },
        { uri: 'file:///x.png', userId: 'someone-else', folder: 'journals' }
      ),
      (e: ImageUploadError) => e.code === 'upload-failed'
    );
  });
});
