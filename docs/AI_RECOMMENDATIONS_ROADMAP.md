# 🧠 MouthJournal AI Recommendations Engine — Roadmap & Architecture

> **Dokumen Catatan & Spesifikasi Teknis Masa Depan**  
> Terakhir diperbarui: 26 Oktober 2026

---

## 1. Visi Produk
MouthJournal berevolusi dari sekadar aplikasi pencatatan makanan menjadi **Personal AI Food Sommelier**. Dengan memanfaatkan data catatan jurnal pengguna (foto, rating multi-kriteria, menu yang dipesan, harga, tag suasana, lokasi), sistem dapat merekomendasikan tempat dan menu baru yang sesuai dengan selera unik (*Taste DNA*) masing-masing pengguna.

---

## 2. Fitur Utama AI Recommendations (Berdasarkan Desain UI)

### A. Dedicated "AI Recommendations" Screen
- **Filter Tabs**:
  - `✨ Untuk Kamu`: Rekomendasi terpadu tempat & menu berdasarkan riwayat jurnal.
  - `🏪 Tempat`: Kurasi kafe & restoran dengan rating kecocokan tertinggi.
  - `🍴 Menu`: Menu makanan/minuman spesifik yang sesuai preferensi rasa.
  - `🗺️ Itinerary`: Paket rute kuliner terstruktur (misal: Jelajah 1 hari di suatu kawasan).
- **Mascot AI Chef Robot**: Memberikan sambutan personal dan konteks rekomendasi.
- **Kartu Rekomendasi Interaktif**:
  - Foto resolusi tinggi, rating, alamat kawasan, tag suasana, dan tombol simpan wishlist.
- **Taste DNA & Statistik Kuliner**:
  - Persentase kategori favorit (Kopi 62%, Dessert 24%, Makanan Berat 14%).
  - Rata-rata penilaian rating (4.6/5.0).
  - Kawasan kuliner paling sering dikunjungi (Senopati, Jakarta Selatan).

### B. AI Recommendations di Detail Tempat (BETA)
- **Menu Terkurasi**: Menu yang paling cocok dicoba oleh pengguna saat berkunjung ke tempat tersebut.
- **Explainable AI ("Kenapa direkomendasikan?")**:
  - Menjelaskan alasan logis di balik rekomendasi:
    - *Kamu sering mencatat tempat dengan suasana cozy.*
    - *Kamu menyukai menu kopi dan pastry.*
    - *Pengguna lain dengan preferensi serupa memberi rating tinggi.*
- **Tempat Serupa yang Mungkin Kamu Suka**: Kafe dengan vibe atau spesialisasi yang sebanding.

### C. Post-Journal AI Insights Screen
- Muncul secara elegan setelah pengguna selesai membuat atau memperbarui catatan jurnal.
- **Hero Banner Robot Chef**: Memberikan ucapan apresiasi atas jurnal baru.
- **Ringkasan Pengalaman**: Menyorot poin positif dan pola rasa kunjungan tersebut.
- **Rekomendasi Berikutnya**: 3 tempat terdekat yang bisa dieksplorasi selanjutnya.
- **Menu yang Mungkin Kamu Suka**: Menu rekomendasi untuk kunjungan berikutnya.

---

## 3. Rencana Arsitektur & Teknologi (Tech Stack)

```
┌────────────────────────────────────────────────────────┐
│                   MouthJournal App                     │
│    (React Native + Expo + AsyncStorage Offline First)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Hybrid AI Recommendation Engine          │
├───────────────────────────┬────────────────────────────┤
│   1. Local Heuristic      │    2. Cloud LLM & Vector   │
│      - Rule-based Scoring │       - Google Gemini 1.5  │
│      - Tag & Category Map │       - Firestore Vector   │
│      - GPS Distance Decay │       - Taste Clustering   │
└───────────────────────────┴────────────────────────────┘
```

1. **Phase 1 (Current Sprint - UI & Mock Engine)**:
   - Halaman `AIRecommendationsScreen.tsx` dengan fidelitas tinggi sesuai desain.
   - Komponen `AIInsightsModal` untuk pengalaman pasca simpan jurnal.
   - Sesi rekomendasi di `DetailPlaceScreen.tsx` dan `DiaryScreen.tsx`.
   - Asset ilustrasi `aiChefRobot` transparan.

2. **Phase 2 (On-Device Heuristic Engine)**:
   - Kalkulasi kecocokan lokal menggunakan riwayat `DiaryEntry[]`:
     - Menghitung bobot tag (`#Cozy`, `#SpecialtyCoffee`, dll).
     - Menghitung rentang harga belanja rata-rata (*budget per visit*).
     - Memfilter tempat terdekat dari OpenStreetMap yang memiliki tag relevan.

3. **Phase 3 (Cloud LLM with Google Gemini)**:
   - Integrasi Firebase Cloud Functions + **Gemini 1.5 Flash**:
     - *Prompt Engineering* untuk menganalisis cerita ulasan dan menghasilkan *Post-Journal AI Insights* yang unik dan personal.
     - *Multi-Modal Analysis*: Membaca foto makanan untuk otomatis merekomendasikan nama menu dan perkiraan kalori/tipe rasa.
     - *Autonomous Day Itinerary Planner*: Menyusun rencana rute wisata kuliner 1 hari berdasarkan waktu buka kafe dan kemacetan jalan.

---

## 4. Struktur Data Rujukan (TypeScript)

```typescript
export interface AIRecommendationItem {
  id: string;
  type: 'place' | 'menu' | 'itinerary';
  title: string;
  subtitle: string;
  photoUrl: string;
  rating?: number;
  price?: number;
  matchScore: number; // 0 - 100%
  reasons: string[];
  tags: string[];
  location?: string;
}

export interface CulinaryItinerary {
  id: string;
  title: string;
  duration: string;
  area: string;
  spotsCount: number;
  previewPhotos: string[];
  description: string;
  stops: {
    order: number;
    placeName: string;
    recommendedTime: string;
    activity: string;
    mustTryMenu: string;
  }[];
}
```
