# MouthJournal — Future Feature Extensions Guide

This specification defines the architectural roadmap, integration blueprints, data requirements, and extension boundaries for future capability additions to MouthJournal.

---

## 1. Culinary Calendar & Meal Timeline

### Overview
A monthly and weekly visual calendar mapping every breakfast, coffee stop, lunch, and dinner to specific days and timestamps.

- **Existing Modules Reused**:
  - `journalRepository.getJournals(userId)` (filtered by date range)
  - `Journal` domain model (`visitedAt: ISO 8601`)
  - `DiaryCard` component for entry preview
- **New Routes & Components**:
  - Route: `app/calendar/index.tsx`
  - Component: `src/components/calendar/MonthGrid.tsx`, `DayJournalFeed.tsx`
- **Data Model Changes**: None required (`visitedAt` timestamp already exists in `JournalSchema`).
- **Dependencies**: None. Pure React Native date calculation or `date-fns` light utility.
- **Security & Privacy**: Strict owner-only querying (`/users/{userId}/journals`). No cross-user access.
- **Testing Requirements**: Date boundary transitions, leap years, time zone handling (UTC to local).

---

## 2. Advanced Culinary Analytics & Taste DNA

### Overview
In-depth dimensional analysis of flavor preferences, roaster selections, sweetness inclinations, and ambiance scores.

- **Existing Modules Reused**:
  - `Journal.criteriaRating` (`taste`, `ambiance`, `service`, `price`)
  - `Journal.tags`
  - `Journal.mainCategory` and `subCategory`
- **New Routes & Components**:
  - Route: `app/analytics/index.tsx`
  - Components: `src/components/charts/TasteRadarChart.tsx`, `CategoryPieChart.tsx`
- **Data Model Changes**: None for input. Optional calculated document: `/users/{userId}/analytics/summary`.
- **Dependencies**: `react-native-svg` (already installed and compatible).
- **Security & Privacy**: Client-side calculation or server-side Cloud Function aggregate. Zero third-party tracker leakage.
- **Testing Requirements**: Mathematical assertion of weighted averages and zero-division guard when journal collection is empty.

---

## 3. Culinary Budget & Spending Reports

### Overview
Financial tracking of coffee and dining expenditures, average ticket size per visit, and monthly budget limits.

- **Existing Modules Reused**:
  - `Journal.totalSpent`
  - `Journal.menuItems[].price`
  - `AppSettings.foodPreferences.budgetPerVisit`
- **New Routes & Components**:
  - Route: `app/budget/index.tsx`
  - Components: `src/components/budget/MonthlySpendCard.tsx`, `CategoryBreakdownList.tsx`
- **Data Model Changes**: Add optional `monthlyBudgetLimit?: number` in `AppSettings`.
- **Dependencies**: None.
- **Security & Privacy**: Highly sensitive financial data. Stored strictly in user subcollection; never shared or analyzed by third-party ad networks.
- **Testing Requirements**: Currency formatting (IDR / Rupiah), aggregation precision, budget alert thresholds (80%, 100%).

---

## 4. AI Taste Profile & Semantic Recommendation Engine

### Overview
Evolution from rule-based category matching heuristics to vector-embedded similarity searches and multi-criteria neural recommendations.

- **Existing Modules Reused**:
  - `src/features/recommendations/`
  - `AIRecommendationsScreen`
  - `userPreferencesRepository`
  - `OpenStreetMapPlacesAdapter`
- **New Routes & Components**:
  - Component: `src/components/ai/RecommendationExplanationModal.tsx`, `TasteSimilarityBadge.tsx`
- **Data Model Changes**: Add optional `embedding?: number[]` to place and journal metadata in Firestore.
- **Dependencies**: Server-side Google Gemini 1.5 Flash API via Firebase Cloud Functions.
- **Security & Privacy**:
  - **Zero client-side secrets**: All LLM API keys reside strictly in secure backend Cloud Functions.
  - User journals are anonymized prior to vector embedding calculation.
  - Transparent opt-in: User can disable AI recommendations in **Settings > Food Preferences**.
- **Testing Requirements**: Cold-start fallback verification, API timeout fallback, zero-leak credential audit.

---

## 5. Culinary Trip Planner & One-Day Food Itineraries

### Overview
Curated morning-to-night food exploration routes organized by neighborhood clusters (e.g. "Morning Espresso at Senopati ➡️ Artisan Lunch at Blok M ➡️ Sunset Gelato at Kemang").

- **Existing Modules Reused**:
  - `Place` model
  - `calculateDistance` (`src/utils/geo.ts`)
  - `wishlistRepository`
- **New Routes & Components**:
  - Route: `app/trips/index.tsx`, `app/trips/[tripId].tsx`
  - Component: `src/components/trips/TripTimeline.tsx`, `AddStopModal.tsx`
- **Data Model Changes**: New subcollection `/users/{userId}/trips/{tripId}` with ordered stop references.
- **Dependencies**: Optional polyline routing service (OSRM / Open Source Routing Machine).
- **Security & Privacy**: Private to creator.
- **Testing Requirements**: Route order validation, distance accumulation, missing place fallback.

---

## 6. Offline Full-Text Journal Search & SQLite Caching

### Overview
High-performance local full-text search across thousands of journals, even in airplane mode or remote basement dining rooms.

- **Existing Modules Reused**:
  - `IJournalRepository` contract
  - `Journal` models
- **New Routes & Components**:
  - `src/repositories/journals/SQLiteJournalRepository.ts`
- **Data Model Changes**: Relational local schema mirror.
- **Dependencies**: `expo-sqlite` (if chosen to supplement `AsyncStorage`).
- **Security & Privacy**: Encrypted database on device using hardware-backed keystore.
- **Testing Requirements**: Offline-online synchronization reconciliation, conflict resolution (last-write-wins with timestamp).

---

## 7. Multi-Provider Map Adapter Ecosystem

### Overview
Seamless toggling between OpenStreetMap, Google Maps, Mapbox, and Apple Maps without altering screen code.

- **Existing Modules Reused**:
  - `IPlacesProvider` interface
  - `placesService`
- **New Routes & Components**:
  - `src/services/places/GooglePlacesAdapter.ts`
  - `src/services/places/MapboxPlacesAdapter.ts`
- **Data Model Changes**: None (`Place` model is provider-agnostic with `providerId` discriminator).
- **Dependencies**: Provider SDKs.
- **Security & Privacy**: Rate-limit throttling and API key obfuscation.
- **Testing Requirements**: Provider response normalization tests matching `placesAdapter.test.ts`.

---

## 8. Custom Food & Drink Collections (Curated Lists)

### Overview
Thematic personal collections such as "Best Almond Croissants in Jakarta", "Cozy Coffee Spots for Reading", or "Date Night Steaks".

- **Existing Modules Reused**:
  - `Journal` and `WishlistItem`
  - `IJournalRepository`
- **New Routes & Components**:
  - Route: `app/collections/index.tsx`, `app/collections/[collectionId].tsx`
- **Data Model Changes**: New subcollection `/users/{userId}/collections/{collectionId}` containing journal and place ID lists.
- **Dependencies**: None.
- **Security & Privacy**: Strictly private to the owning user.
- **Testing Requirements**: Collection creation, reordering, duplicate insertion prevention.
