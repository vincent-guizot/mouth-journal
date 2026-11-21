# MouthJournal — Current Architecture & Technical Specification

> Dokumen ini adalah acuan arsitektur definitif MouthJournal (Expo SDK 58, React Native 0.88.1, React 19.3).

---

## 1. Entry Point & Routing
- Entry Point: `expo-router/entry`
- Router: Expo Router v4 (file-based routing under `app/`)
- Root Layout (`app/_layout.tsx`):
  - Inisialisasi Google Fonts (Caveat, Manrope)
  - `SafeAreaProvider`
  - `AuthProvider`
  - `FeedbackProvider` (dialog modal & toast floating lintas platform)

---

## 2. Mode Aplikasi (`AppMode`)
Aplikasi mendukung 3 mode yang divalidasi saat startup (`src/config/env.ts`):
1. **`firebase`** (Default produksi):
   - Wajib memiliki konfigurasi `EXPO_PUBLIC_FIREBASE_*`.
   - Menggunakan Firebase Auth, Firestore, dan Firebase Storage sesungguhnya.
   - Sesi native dipertahankan via `getReactNativePersistence(AsyncStorage)`.
2. **`demo`** (Eksplisit):
   - Hanya aktif jika `EXPO_PUBLIC_DEMO_MODE=true`.
   - UID konstan: `local-demo-user`.
   - Seluruh mutasi hanya disimpan di local key-value store (AsyncStorage di native / memory di test).
   - Fitur cloud (reset password, social login) dinonaktifkan secara jujur.
3. **`unconfigured`**:
   - Jika konfigurasi Firebase belum diisi dan `EXPO_PUBLIC_DEMO_MODE` bukan `true`.
   - Menolak menampilkan data palsu atau login palsu; melempar `BackendNotConfiguredError` secara eksplisit pada setiap panggilan data.

---

## 3. Data Flow & Offline-First Repository
- **Single Source of Truth**: Skema Zod di `src/schemas/`. Tipe domain di `src/models/` diturunkan via `z.infer`.
- **Repository Interface**: `IJournalRepository`, `IWishlistRepository`, `IUserProfileRepository`, `IUserPreferencesRepository`.
- **Offline Engine (`OfflineCollection<T>`)**:
  1. Validasi input via Zod schema.
  2. Tulis optimistik ke cache lokal (`@mouthjournal_cache_{userId}_{collection}`).
  3. Antrikan operasi mutasi ke antrian persisten (`@mouthjournal_queue_{userId}_{collection}`).
  4. Kirim ke Firestore dengan batas timeout (`withTimeout`).
  5. Jika gagal karena jaringan (`isTransientRemoteError`), status mutasi menjadi `pending` dan antrian menunggu flush berikutnya.
  6. Jika gagal karena penolakan permanen (misal: aturan Firestore melarang), cache optimistik dibatalkan (rollback) dan error dilempar.

---

## 4. Antrian Foto Offline (`PhotoUploadQueue`)
- Pada kondisi offline atau upload terhambat:
  - Form jurnal menyimpan URI lokal perangkat di `pendingPhotoUris`.
  - Field `pendingPhotoUris` disaring di level `OfflineCollection.remoteWrite` sehingga **tidak pernah terkirim ke Firestore**.
  - Tugas antrian disimpan di `@mouthjournal_queue_{userId}_pending_photos_queue`.
- Saat koneksi online kembali (`syncPending`):
  - `PhotoUploadQueue.processQueue` mengunggah setiap file ke Firebase Storage (`/users/{userId}/journals/...`).
  - URL unduhan `https://...` ditambahkan ke `photoUrls`.
  - Dokumen jurnal diperbarui dan disinkronkan ke Firestore.

---

## 5. Security Rules
- **Firestore Rules (`firebase/firestore.rules`)**:
  - Isolasi data per pengguna (`isOwner(userId)`).
  - Validasi foto berawalan `https://`.
  - Validasi item menu (harga non-negatif, rating 1-5, foto https opsional).
  - Validasi tag teks 1-40 karakter.
  - Immutabilitas `createdAt` dan `userId`.
- **Storage Rules (`firebase/storage.rules`)**:
  - Jalur folder terbatas: `journals`, `menus`, `avatars`, `banners`.
  - Tipe MIME gambar yang diizinkan (JPEG, PNG, WebP, HEIC/HEIF).
  - Ukuran file maksimal 10 MB.

---

## 6. Feedback Lintas Platform (`FeedbackProvider`)
- Menggantikan keterbatasan `Alert.alert` di Web.
- Menyediakan:
  - `showAlert(title, message, onOk)`
  - `showConfirm({ title, message, confirmText, cancelText, destructive, onConfirm, onCancel })`
  - `showToast(message, type, durationMs)`
- Tersedia sebagai hook `useFeedback()` dan singleton `feedback.*`.

---

## 7. Rangkaian Pengujian
- **Unit Tests**: `npm test` (93 pengujian lolos).
- **Emulator Tests**: `npm run test:emulator` (69 pengujian lolos terhadap emulator Auth, Firestore, dan Storage).
