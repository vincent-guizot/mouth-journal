# 🔍 MouthJournal — Initial Repository Audit Report (Prompt 02)

> **Auditor:** Senior React Native Architect & Application Security Engineer  
> **Tanggal Audit:** 26 Oktober 2026  
> **Target Baseline:** Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6.0 Strict  

---

## 1. Executive Summary

Audit ini mengevaluasi codebase **MouthJournal** yang ada untuk mengidentifikasi fungsionalitas yang sudah bekerja, kelemahan arsitektur, risiko keamanan, kepemilikan data, dan ketidaksesuaian terhadap blueprint produk (Prompt 01).

Hasil audit mengonfirmasi bahwa aset visual, desain UI, dan alur layar yang dibangun telah memiliki fidelitas estetika yang sangat tinggi. Namun, lapisan arsitektur data, keamanan Firebase, dan isolasi sesi pengguna memerlukan refaktorisasi mendalam agar memenuhi standar produksi privat yang aman (*owner-only*).

---

## 2. Inventaris Fungsionalitas yang Sudah Bekerja (Verified Working)

| Modul / Layar | Status | Verifikasi & Catatan |
|---|---|---|
| **Design System & Theme** | ✅ Bekerja | Palet warna *Coffee Brown* (`#4E2E21`), *Terracotta* (`#D04A1E`), *Cream* (`#FAF5EE`) dan tipografi serif/handwriting terdefinisi di `src/config/theme.ts`. |
| **Aset Desain & Ilustrasi** | ✅ Bekerja | 37 aset dekoratif dan 19 ilustrasi amplop dipecah transparan di `assets/`. Aset maskot `aiChefRobot` transparan tersedia di `assets/illustrations/`. |
| **Diary Feed Screen** | ✅ Bekerja | Tampilan entri catatan kuliner, filter kategori, kartu ringkasan, breakdown rating. |
| **Explore & Interactive Map** | ✅ Bekerja | Peta interaktif Leaflet OpenStreetMap via `react-native-webview` dengan custom pin SVG (*cafe, bakery, resto*). |
| **Journal Editor (Add & Edit)** | ✅ Bekerja | 2-step editing flow (info dasar, foto, menu yang dicoba dengan harga, rating kriteria, tag). |
| **Wishlist Screen** | ✅ Bekerja | Daftar tempat yang ingin dikunjungi dengan indikator jarak GPS. |
| **Profile & Edit Profile** | ✅ Bekerja | Profil banner + avatar overlapping, seleksi preset foto, formulir kontak, dan preferensi kuliner 2 langkah. |
| **Photo Viewer / Fullscreen Gallery** | ✅ Bekerja | 4 state foto viewer (clean view, navigasi chevron, bottom sheet ulasan detail, dan action sheet opsi foto). |
| **Settings Screen** | ✅ Bekerja | 5 kategori pengaturan sesuai blueprint produk. |
| **AI Recommendations Screen** | ✅ Bekerja | 4 tab filter (*Untuk Kamu, Tempat, Menu, Itinerary*) + modal AI Insights pasca simpan jurnal. |
| **Autentikasi (10 Layar)** | ✅ Bekerja | Splash screen, Onboarding fanned collage, Login, Register, Forgot Password, Verification Code, Reset Password, Feedback status. |

---

## 3. Kelemahan Arsitektur yang Ditemukan (Architectural Weaknesses)

1. **Monolithic State di `App.tsx`**:
   - `App.tsx` berukuran >500 baris kode yang mengontrol hampir seluruh navigasi antar-layar menggunakan state lokal (`activeTab`) dan belasan `<Modal>` berlapis.
   - Tidak adanya router deklaratif menyebabkan *state cluttering* dan menyulitkan *deep-linking* atau navigasi berbasis URL.
2. **Ketiadaan Repositori Abstraksi**:
   - UI langsung memanggil service class statis (`DiaryService.getMyDiaries()`).
   - Tidak ada antarmuka (`interface`) repositori yang memisahkan antara sumber data cloud (Firestore), cache lokal (AsyncStorage), dan memory cache.
3. **Penyimpanan Lokal Campur Aduk**:
   - Saat Firestore gagal atau belum terkonfigurasi, aplikasi secara diam-diam (*silent fallback*) mengisi `AsyncStorage` dengan `INITIAL_DIARY_ENTRIES` tiruan. Ini melanggar prinsip kepemilikan data yang transparan.
4. **Dependensi Antar-Layar Menggunakan Relatif Path Dangkal**:
   - Layar mengimpor langsung dari `../screens/` lain tanpa batas modul domain (*feature boundaries*).

---

## 4. Temuan Risiko Keamanan Kritis (Security Risks)

> [!CAUTION]
> Temuan berikut wajib diperbaiki sebelum aplikasi digunakan oleh pengguna nyata:

1. **Penyusupan Kunci Demo Tanpa Validasi Nyata**:
   - `src/config/firebase.ts` menggunakan kunci *dummy* `"AIzaSy_DEMO_KEY_MOUTH_JOURNAL"` yang menganggap konfigurasi aktif jika string tersebut tidak ada, tanpa validasi format atau ketersediaan environment yang ketat.
2. **Kebocoran Data Antar-Pengguna (Cross-User Data Leakage)**:
   - Kunci AsyncStorage berstatus global: `@mouthjournal_diaries` dan `@mouthjournal_wishlist`.
   - Jika Pengguna A *sign out* dan Pengguna B *sign in* di perangkat yang sama, Pengguna B dapat membaca catatan pribadi Pengguna A dari cache lokal.
3. **Ketiadaan Firebase Security Rules**:
   - Proyek belum memiliki file `firestore.rules` dan `storage.rules`. Seluruh penulisan database berisiko terbuka jika dihubungkan ke Firebase produksi.
4. **Koleksi Firestore Datar (`diaries/{id}`)**:
   - Struktur saat ini menaruh jurnal di root collection `diaries` dengan filter `where('userId', '==', userId)`.
   - Sesuai standar privasi Blueprint Prompt 01, seluruh data jurnal wajib berada di bawah sub-koleksi privat:
     `/users/{userId}/journals/{journalId}`
     `/users/{userId}/wishlist/{itemId}`
     `/users/{userId}/preferences/{docId}`
5. **Fitur "Feed Publik" yang Melanggar Visi Non-Sosial**:
   - Terdapat sisa kode `getPublicFeed()` dan tab *Public Feed* di `DiaryService.ts` dan `DiaryScreen.tsx`. Padahal Blueprint Prompt 01 secara eksplisit menetapkan bahwa **MouthJournal adalah jurnal kuliner 100% personal dan BUKAN aplikasi media sosial**.

---

## 5. Inkonsistensi Data & Validasi Input (Missing Validation)

1. **Manipulasi Data Tanpa Validasi Runtime**:
   - Model hanya didefinisikan sebagai antarmuka TypeScript (`interface`) tanpa validasi runtime (misal: Zod). Data yang rusak dari jaringan atau cache lokal dapat menyebabkan aplikasi *crash*.
2. **Data Tempat Fabrikasi (Invented Data)**:
   - Pada `src/services/places/placesService.ts`, jika data OSM tidak memiliki rating, sistem menghasilkan angka acak buatan:
     `ratingAverage: 4.6 + Math.round((Math.random() * 0.3) * 10) / 10`
     `userVisitedCount: Math.floor(Math.random() * 80) + 15`
   - Ini melanggar aturan Prompt 02: *"Never invent place information when provider results are missing."*

---

## 6. Dependensi & Build Tooling

1. **`node_modules` Lokal Awalnya Belum Terinstal**:
   - Berkas `package.json` dan `package-lock.json` sudah ada, namun `node_modules` belum diunduh di direktori lokal.
   - Telah diverifikasi dan diatasi: `npm install` berhasil dijalankan (555 paket terpasang).
2. **Expo Router**:
   - Belum terpasang di awal.
   - Telah diverifikasi dan diinstal: `expo-router@~58.0.26`, `expo-linking`, `expo-constants`.
3. **Runtime Validator**:
   - `zod` telah berhasil dipasang untuk validasi domain model yang ketat.

---

## 7. Rencana Prioritas Refaktorisasi (Phased Refactoring Priorities)

| Prioritas | Fase | Tindakan Utama |
|---|---|---|
| **P0 (Kritis)** | **Fase B** | Buat Domain Models & Schema Validasi Runtime (Zod) untuk `UserProfile`, `Journal`, `WishlistItem`, `Place`, `Preferences`. Buat `.env.example` & validasi ketat Firebase config. |
| **P0 (Kritis)** | **Fase C** | Buat `IJournalRepository`, `IWishlistRepository`, `IUserPreferencesRepository` dengan *user-scoped storage* (`@mouthjournal_{userId}_...`) dan path hierarkis `/users/{userId}/...`. |
| **P0 (Kritis)** | **Fase D** | Refaktorisasi `OpenStreetMapPlacesAdapter`: Hapus pembuatan data rating acak, implementasikan timeout `AbortController`, dan sanitasi respon. |
| **P0 (Kritis)** | **Fase E** | Buat `firebase/firestore.rules` dan `firebase/storage.rules` dengan aturan ketat *owner-only* (`request.auth.uid == userId`) + unit test keamanan. |
| **P1 (Struktur)**| **Fase F** | Tata struktur target `src/features/` dan susun rute deklaratif `app/` (Expo Router). |
| **P1 (Kualitas)**| **Fase G** | Jalankan pengujian tipe TypeScript (`npx tsc --noEmit`), buat unit test repositori dan adapter. |
