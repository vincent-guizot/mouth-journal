# 🍽️ MouthJournal — Premium Personal Food & Drinks Journal

**MouthJournal** adalah aplikasi buku harian kuliner pribadi (*personal-first culinary diary*) berbasis **React Native** dan **Expo Router** yang memungkinkan Anda mendokumentasikan setiap pengalaman bersantap, mencatat cicipan kopi spesialti, menyimpan galeri foto makanan beresolusi tinggi, memberikan penilaian multi-kriteria yang mendalam, dan menemukan kafe di sekitar menggunakan **OpenStreetMap**.

MouthJournal dirancang dengan prinsip **100% Personal & Privat**: jurnal kuliner Anda sepenuhnya milik Anda, tanpa feed publik, followers, komentar, atau interaksi sosial publik.

---

## 🚀 Perintah Cepat (Quick Start)

### Menjalankan Aplikasi
```bash
# Instal dependensi
npm install

# Jalankan Expo dev server
npm start
```
Buka aplikasi **Expo Go** di ponsel Anda dan pindai QR code yang muncul di terminal.

### Menjalankan Type Checking & Pengujian Otomatis
```bash
# Type check TypeScript (strict mode, 0 errors)
npm run type-check

# Jalankan seluruh rangkaian tes otomatis (27/27 tests passing across 8 suites)
npm test

# Verifikasi integritas SDK & dependensi Expo (20/20 checks passed)
npx expo-doctor
```

### Membuat File APK Mandiri (Android)
Aplikasi sudah dilengkapi konfigurasi `eas.json` dengan profil `preview`:
```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```

---

## 🌟 Fitur Utama Aplikasi

1. **📖 Diary / Timeline Jurnal Pribadi (`app/(tabs)/diary.tsx`)**:
   - Tampilan timeline kronologis personal dan filter catatan favorit (*Rating ≥ 4.5*).
   - Pencarian instan berdasarkan nama tempat, menu, atau catatan rasa.
   - Filter kategori cepat: *Semua*, *Kopi*, *Restoran*, *Street Food*, *Dessert*.
   - Rincian biaya santap, foto kenangan, dan breakdown kriteria rating.

2. **🗺️ Explore Map & Sekitar (`app/(tabs)/explore.tsx`)**:
   - Menampilkan lokasi pengguna secara presisi melalui GPS perangkat.
   - Deteksi kafe dan kuliner terdekat menggunakan arsitektur modular **OpenStreetMap (Overpass & Nominatim API)** tanpa biaya API key.
   - Peta interaktif Leaflet dengan marker bertema warna dan visual pin kuliner.
   - Aksi instan: *Tulis Jurnal* atau *Simpan ke Wishlist*.

3. **➕ Tulis Jurnal Baru (`app/journals/create.tsx`)**:
   - Pemilihan foto makanan dari Kamera atau Galeri ponsel.
   - Deteksi otomatis nama dan alamat tempat dari GPS/peta.
   - Penilaian multi-kriteria: **Rasa**, **Suasana**, **Pelayanan**, dan **Harga/Nilai**.
   - Input item menu yang dipesan beserta harga dan kalkulator otomatis total pengeluaran.
   - Tag pengalaman (#SpecialtyCoffee, #Cozy, #WorkFromCafe, dll).

4. **🔖 Wishlist Pribadi (`app/(tabs)/wishlist.tsx`)**:
   - Daftar tempat dan menu impian yang ingin dikunjungi.
   - Perhitungan jarak real-time dari posisi pengguna saat ini.
   - Transisi satu ketukan: *"Sudah Mampir? Tulis Jurnal"*.

5. **👤 Profil & Kenangan Kuliner (`app/(tabs)/profile.tsx`)**:
   - Statistik kunjungan kuliner, preferensi rasa, dan galeri kenangan makanan.
   - Edit profil pribadi (`app/profile/edit.tsx`).
   - Akses eksklusif ke Pengaturan 5 Kategori (`app/settings/index.tsx`).

6. **⚙️ Pengaturan 5 Kategori (`app/settings/`)**:
   - **Account & Session**: Informasi akun, ganti kata sandi, logout, dan hapus akun.
   - **Location & Maps**: Izin lokasi GPS, pemilihan radius pencarian (1 km, 3 km, 5 km, 10 km).
   - **Appearance**: Tema Light (Warm Café), Dark (Espresso Night), dan System.
   - **Food Preferences**: Personalisasi kategori favorit dan preferensi menu.
   - **Data & Support**: Pembersihan cache lokal, ekspor cadangan data JSON, dan info aplikasi.

7. **✨ AI Recommendations & Culinary Insights (`app/recommendations/index.tsx`)**:
   - Rekomendasi kuliner cerdas yang dipersonalisasi berdasarkan DNA rasa pengguna.
   - Rencana rute jelajah kuliner 1 hari (*Smart Culinary Itinerary*).

---

## 🔒 Keamanan & Isolasi Data Multi-Tenant

- **Cloud Firestore Rules (`firebase/firestore.rules`)**:
  - Seluruh data disimpan dalam subkoleksi berhierarki di `/users/{userId}/...`.
  - Akses ditolak secara default (`match /{document=**} { allow read, write: if false; }`).
  - Setiap operasi dokumen wajib memenuhi `request.auth.uid == userId`.
- **Firebase Storage Rules (`firebase/storage.rules`)**:
  - Foto dibatasi di `/users/{userId}/photos/**`.
  - Wajib memenuhi `request.auth.uid == userId`, tipe MIME `image/*`, dan ukuran maksimal 10 MB.
- **Cache Terisolasi**:
  - Kunci penyimpanan offline berakar per user: `@mouthjournal_cache_{userId}_*`.
  - Pembersihan cache saat logout menghapus seluruh data user aktif tanpa mencemari user lain.

---

## 🗂️ Struktur Direktori Proyek

```text
mouth-journal/
├── app/                                 # Rute navigasi Expo Router
│   ├── _layout.tsx                      # Root layout, load font & AuthProvider
│   ├── index.tsx                        # Gatekeeper pembuka & splash
│   ├── (auth)/                          # Grup autentikasi
│   │   ├── welcome.tsx                  # Onboarding
│   │   ├── login.tsx                    # Masuk akun
│   │   ├── register.tsx                 # Pendaftaran akun
│   │   └── forgot-password.tsx          # Pemulihan sandi
│   ├── (tabs)/                          # 5 Tab Navigasi Utama
│   │   ├── _layout.tsx                  # Tab bar kustom & Header
│   │   ├── diary.tsx                    # Tab 1: Timeline Jurnal
│   │   ├── explore.tsx                  # Tab 2: Peta & Jelajah Sekitar
│   │   ├── add.tsx                      # Tab 3: Shortcut Tambah Jurnal
│   │   ├── wishlist.tsx                 # Tab 4: Wishlist Kuliner
│   │   └── profile.tsx                  # Tab 5: Profil & Statistik
│   ├── journals/
│   │   ├── [journalId].tsx              # Detail jurnal kuliner
│   │   ├── create.tsx                   # Form pembuatan jurnal
│   │   └── [journalId]/edit.tsx         # Edit jurnal kuliner
│   ├── places/
│   │   ├── search.tsx                   # Pencarian tempat
│   │   └── [placeId].tsx                # Detail tempat kuliner
│   ├── wishlist/
│   │   └── [itemId].tsx                 # Detail item wishlist
│   ├── settings/
│   │   ├── index.tsx                    # Menu utama pengaturan
│   │   ├── account.tsx                  # Kategori 1: Account & Session
│   │   ├── location.tsx                 # Kategori 2: Location & Maps (km)
│   │   ├── appearance.tsx               # Kategori 3: Appearance
│   │   ├── food-preferences.tsx         # Kategori 4: Food Preferences
│   │   └── data-support.tsx             # Kategori 5: Data & Support
│   ├── profile/
│   │   └── edit.tsx                     # Form edit profil
│   ├── photo-gallery/
│   │   └── index.tsx                    # Fullscreen photo viewer route
│   └── recommendations/
│       └── index.tsx                    # Rekomendasi AI & Itinerary
├── src/
│   ├── components/                      # Komponen atomik (ui/, feedback/, forms/)
│   ├── config/                          # Konfigurasi Firebase, tema & aset
│   ├── context/                         # AuthContext & sesi pengguna
│   ├── features/                        # Modul fitur terenkapsulasi (hooks, helpers, components)
│   ├── mocks/                           # Data tiruan terisolasi & Mock Repositories
│   ├── models/                          # Domain models (User, Journal, Place, dll)
│   ├── repositories/                    # Repositori data (Firestore & Mock Bundle)
│   ├── schemas/                         # Zod validation schemas
│   ├── screens/                         # Layar tampilan UI modular (~150 baris per file)
│   ├── services/                        # Layanan Firebase & OpenStreetMap
│   └── utils/                           # Utilitas geo & rumus Haversine
├── firebase/
│   ├── firestore.rules                  # Aturan keamanan Cloud Firestore
│   ├── storage.rules                    # Aturan keamanan Firebase Storage
│   └── firestore.indexes.json           # Indeks query komposit Firestore
├── tests/                               # Rangkaian pengujian otomatis (27 tests passing)
│   ├── places/placesAdapter.test.ts     # Tes adapter OSM & kalkulasi jarak
│   ├── schemas/journalValidation.test.ts# Tes validasi skema Zod
│   ├── security/rulesValidation.test.ts # Tes struktural aturan Firebase
│   ├── security/userIsolation.test.ts   # Tes isolasi multi-tenant & cache
│   ├── repositories/journalCrud.test.ts # Tes operasi CRUD jurnal
│   ├── mocks/mockRepositories.test.ts   # Tes repositori mock & offline cache
│   ├── export/dataExport.test.ts        # Tes ekspor data & sanitasi
│   └── recommendations/recommendationEngine.test.ts # Tes engine rekomendasi
└── docs/
    ├── AUDIT_REPORT.md                  # Laporan audit awal repositori
    └── ARCHITECTURE_BLUEPRINT.md        # Spesifikasi cetak biru arsitektur
```

---

## ⚙️ Variabel Lingkungan (.env)
Salin berkas `.env.example` ke `.env`:
```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_OSM_OVERPASS_URL=https://overpass-api.de/api/interpreter
EXPO_PUBLIC_OSM_NOMINATIM_URL=https://nominatim.openstreetmap.org
```
Jika variabel Firebase tidak diisi, aplikasi secara cerdas menggunakan **mode pengembangan lokal / offline** dengan penyimpanan lokal terisolasi tanpa crash.
