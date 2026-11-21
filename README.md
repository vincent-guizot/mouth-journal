# 🍽️ MouthJournal — Premium Personal Food & Drinks Journal

**MouthJournal** adalah aplikasi buku harian kuliner pribadi (*personal-first culinary diary*) berbasis **React Native 0.88.1 (React 19.3)** dan **Expo SDK 58 (Expo Router v4)** yang memungkinkan Anda mendokumentasikan setiap pengalaman bersantap, mencatat cicipan kopi spesialti, menyimpan galeri foto makanan, memberikan penilaian multi-kriteria mendalam, dan menemukan tempat makan di sekitar secara nyata menggunakan **OpenStreetMap (Overpass & Nominatim API)**.

MouthJournal dirancang dengan prinsip **100% Personal & Privat**: jurnal kuliner Anda sepenuhnya milik Anda, tanpa feed publik, followers, komentar, atau data tiruan.

---

## 🚀 Perintah Cepat (Quick Start)

### Menjalankan Aplikasi
```bash
# Instal dependensi
npm install

# Jalankan Expo dev server
npm start
```
Buka aplikasi **Expo Go** atau development build di perangkat Anda dan pindai QR code yang muncul.

### Verifikasi Kualitas & Rangkaian Pengujian
```bash
# 1. Type check TypeScript (strict mode, 0 error)
npm run type-check

# 2. Linter Expo / ESLint (0 error, 0 warning)
npx expo lint

# 3. Unit tests (100 tests passing across 20 suites)
npm test

# 4. Firebase Emulator Integration Tests (69 tests passing across 11 suites)
# Membutuhkan Java 21 dan firebase-tools
npm run test:emulator

# 5. Jalankan seluruh pengujian sekaligus (unit + emulator)
npm run test:all

# 6. Verifikasi export bundling native (Android & iOS)
npx expo export --platform android
npx expo export --platform ios
npx expo-doctor
```

---

## 🏗️ Arsitektur Inti Aplikasi

### 1. Single Entry Point
Aplikasi menggunakan entry tunggal resmi Expo Router: `"main": "expo-router/entry"` di `package.json`. Tidak ada lagi file legacy `App.tsx` atau `index.ts`.

### 2. Tiga Mode Aplikasi yang Tegas (`AppMode`)
- **`firebase`**: Mode produksi default. Memerlukan konfigurasi lengkap `EXPO_PUBLIC_FIREBASE_*`. Operasi sinkron ke Firebase Auth, Cloud Firestore, dan Firebase Storage dengan antrian offline lokal.
- **`demo`**: Hanya aktif bila `EXPO_PUBLIC_DEMO_MODE=true` disetel secara eksplisit. Menggunakan UID stabil `local-demo-user`, data tersimpan di cache lokal perangkat tanpa Firebase. Fitur cloud (reset password, social login) dinonaktifkan secara jujur.
- **`unconfigured`**: Jika kredensial Firebase tidak lengkap dan `EXPO_PUBLIC_DEMO_MODE` bukan `true`, aplikasi menolak beroperasi secara diam-diam dan melempar `BackendNotConfiguredError` secara eksplisit alih-alih menampilkan data palsu.

### 3. Offline-First Repository & Persistent Photo Queue
- **Alur Mutasi Data**: Validasi skema Zod → Tulis ke cache lokal optimistik → Antrikan operasi persisten (`keyValueStore`) → Kirim ke Firestore dengan batas timeout.
- **Penanganan Offline**: Snapshot `fromCache: true` diperlakukan sebagai offline dan tidak dianggap sudah tersinkron ke cloud.
- **Antrian Foto Offline (`PhotoUploadQueue`)**:
  - Saat offline atau upload gagal, jurnal tetap tersimpan lokal dengan array `pendingPhotoUris` (berisi URI file perangkat).
  - Field `pendingPhotoUris` secara otomatis disaring dan **tidak pernah dikirim ke Firestore**.
  - Saat perangkat kembali online (`syncPending`), antrian foto memproses upload ke Firebase Storage secara otomatis, menggantikan URI lokal dengan URL `https://...`, lalu menyinkronkan dokumen jurnal ke Firestore.

### 4. Skema Zod sebagai Single Source of Truth
- Seluruh tipe model di `src/models/` diturunkan langsung dari skema Zod di `src/schemas/`.
- Tidak ada type casting `as any`.
- Rating kriteria adalah integer 1–5; `overallRating` dihitung melalui `computeOverallRating(criteria)`.
- Seluruh URL foto cloud wajib berawalan `https://`.
- ID wishlist wajib sama dengan `placeId`.

### 5. OpenStreetMap (OSM) Adapter Nyata
- Pencarian tempat terdekat menggunakan Overpass API (`searchNearby`) dan reverse geocoding via Nominatim API.
- Hasil pencarian divalidasi dengan skema Zod bertipe `PlacesProviderError` (menangani HTTP 429 rate limit, 504 timeout, format JSON tidak valid, dan koordinat tidak valid).
- Bebas dari mock rating atau ulasan palsu; tempat yang belum diulas pengguna ditampilkan tanpa rating buatan.

### 6. Sistem Feedback Lintas Platform (`FeedbackProvider`)
- Menggantikan `Alert.alert` (yang merupakan no-op di `react-native-web`) dengan komponen dialog modal dan toast floating yang konsisten di iOS, Android, dan Web.
- Dapat diakses melalui hook `useFeedback()` maupun helper universal `feedback.showAlert()`, `feedback.showConfirm()`, dan `feedback.showToast()`.

---

## 🔒 Keamanan & Firebase Security Rules

Aturan keamanan multi-tenant yang ketat diuji langsung di Firebase Emulator (`tests/emulator/rules.test.ts`):
- **Cloud Firestore Rules (`firebase/firestore.rules`)**:
  - Seluruh subkoleksi (`journals`, `wishlist`, `preferences`) diisolasi di bawah `/users/{userId}/` dan wajib memenuhi `request.auth.uid == userId`.
  - Validasi field nyata: foto https (`validPhotoUrls`), item menu berharga non-negatif (`validMenuItems`), tag teks 1–40 karakter (`validTags`).
  - Ketentuan immutability `createdAt` dan `userId` pada operasi update dokumen.
  - Akses koleksi lain atau tanpa autentikasi ditolak (`allow read, write: if false;`).
- **Firebase Storage Rules (`firebase/storage.rules`)**:
  - File dibatasi di folder `/users/{userId}/{folder}/{file}` (folder yang diizinkan: `journals`, `menus`, `avatars`, `banners`).
  - Wajib memenuhi kepemilikan user token, tipe MIME gambar yang didukung (`image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`), dan batas ukuran maksimal 10 MB.

---

## ⚙️ Konfigurasi Variabel Lingkungan (`.env`)

Salin berkas `.env.example` ke `.env`:
```env
# --- 1. Firebase Client Configuration (Wajib untuk Mode Firebase) ---
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# --- 2. Environment Mode ---
EXPO_PUBLIC_APP_ENV=development

# --- 3. Mode Demo Lokal (eksplisit) ---
# Setel 'true' untuk menjalankan demo tanpa Firebase (UID: local-demo-user)
EXPO_PUBLIC_DEMO_MODE=false

# --- 4. OpenStreetMap / Overpass Endpoint ---
EXPO_PUBLIC_OSM_OVERPASS_URL=https://overpass-api.de/api/interpreter
EXPO_PUBLIC_OSM_NOMINATIM_URL=https://nominatim.openstreetmap.org
EXPO_PUBLIC_OSM_USER_AGENT=MouthJournal/1.0.0 (Expo app)
```

---

## 🧪 Rangkaian Pengujian Otomatis

Proyek memiliki total **169 tes otomatis** yang terbagi dalam dua kelompok:
1. **Unit Tests (`npm test`)** — 100 tes:
   - Kontrak draft form jurnal (`buildJournalDraft`)
   - Resolusi mode aplikasi (Firebase, Demo, Unconfigured)
   - Sanitasi dan validasi cache offline
   - Adapter OpenStreetMap (Overpass & Nominatim) dengan error handling
   - Antrian foto offline (`PhotoUploadQueue`)
   - Resolusi tema dinamis (`theme.test.ts`)
   - Agregasi data riil profil pengguna (`profileAggregation.test.ts`)
   - Skema Zod (Journal, MenuItem, Wishlist, Preferences, Profile)
   - Kalkulasi statistik murni (tanpa angka placeholder)
   - Ekspor data JSON terisolasi
2. **Integration Tests di Firebase Emulator (`npm run test:emulator`)** — 69 tes:
   - Autentikasi Firebase Auth nyata (register, login, reset password, update email/displayName, logout aman terhadap pending changes)
   - Penghapusan akun secara menyeluruh (re-auth password → hapus Firestore + Storage → hapus user Auth → bersihkan cache lokal)
   - Upload foto Storage (MIME type check, batas 10 MB, normalisasi JPG ke JPEG, isolasi user)
   - Operasi CRUD Firestore online
   - Sinkronisasi offline-first saat koneksi terputus dan terhubung kembali
   - Pengujian antrian foto offline (`pendingPhotoUris` tidak terkirim ke Firestore, terunggah saat online)
   - Validasi aturan Firestore & Storage rules terhadap berbagai payload invalid
