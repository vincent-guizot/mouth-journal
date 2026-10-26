# MOUTHJOURNAL — PROMPT 01
## Product Blueprint, UI/UX, Design System & Future-Ready Product Specification

> **Status:** Dicatat & Disimpan (Pending Execution / Menunggu Aba-aba User)  
> **Tanggal Dicatat:** 26 Oktober 2026

---

### ROLE
Act as a Senior Product Manager, Product Designer, UX Architect, and Design System Engineer. Your task is to define a complete, production-oriented product blueprint for MouthJournal, a premium personal food and drinks journaling mobile application.

Work as a product architect first. Understand the existing repository, requirements, available design assets, and established decisions before proposing changes. Do not prematurely implement the entire application in this phase.

---

### 1. PRODUCT VISION
MouthJournal is a personal food and drinks diary where users can document meals, beverages, cafés, restaurants, culinary experiences, ratings, photos, favorite places, and personal memories.

The product should feel like a premium digital culinary journal: warm, elegant, artistic, personal, visual, and effortless to use.

**Core principles:**
- Personal-first experience.
- Private journals owned by their creators.
- Food photography and meaningful memories.
- Fast journal creation and retrieval.
- Location-aware discovery using an interchangeable provider architecture.
- Personalized recommendations as an optional enhancement.
- Modular architecture that supports future features.
- Consistent visual design and accessible interactions.

**Crucial Constraint:**
> **This is NOT a social networking application.**  
> Do not introduce public profiles, public/private account toggles, followers, following, likes, comments, public feeds, or social publishing features.

---

### 2. EXISTING PROJECT AND ASSETS
Inspect the existing MouthJournal repository and its assets before planning.

Determine:
- Existing screens and navigation.
- Existing React Native components.
- Existing TypeScript models and service modules.
- Existing Firebase and OpenStreetMap integrations.
- Existing local storage and mock data.
- Existing images, logos, icons, illustrations, and design references.
- Existing package versions and project configuration.

Preserve usable work. Do not redesign or replace existing assets without a clear reason.
If the repository contains inconsistent or incomplete implementations, document the gap and propose a migration path rather than assuming everything must be rebuilt.

---

### 3. TECHNOLOGY BASELINE
The product is intended to use:
- React Native.
- Expo.
- Expo Router v3 or a compatible current version.
- TypeScript with strict type checking.
- NativeWind where compatible with the established styling system.
- Lucide icons.
- Firebase Authentication.
- Cloud Firestore.
- Firebase Storage.
- OpenStreetMap ecosystem using suitable services such as Nominatim and Overpass where appropriate.
- An adapter-based location and places architecture.
- EAS Build for Android, with iOS support planned.

Inspect actual dependencies before selecting implementation details. Do not upgrade packages indiscriminately or introduce unnecessary libraries.

---

### 4. BRAND AND DESIGN DIRECTION
- **Brand:** MouthJournal.
- **Brand concept:** An abstract mouth symbol with a subtle hidden letter M. Minimal Elegant. Organic and artistic. Premium café atmosphere. Editorial food photography. Warm and sophisticated rather than childish or excessively decorative.
- **Visual direction:**
  - Coffee brown (#4E2E21)
  - Terracotta (#D04A1E / #D06B3F)
  - Warm cream / ivory (#FAF5EE / #F8EAD9)
  - White and restrained neutral tones.
  - Consistent typography hierarchy.
  - Generous whitespace.
  - Refined corner radii and spacing.
  - Subtle shadows and restrained borders.
  - Lucide icons with consistent stroke weight.
  - Food imagery featuring coffee, steak, pastries, and culinary experiences.
- Semantic design tokens for colors, typography, spacing, radii, shadows, icon sizes, and component states.
- Support Light, Dark, and System appearance modes.
- Preserve approved assets and individual transparent extractions.

---

### 5. INFORMATION ARCHITECTURE
The main bottom navigation must contain **exactly five destinations**:
1. **Diary**
2. **Explore**
3. **Add (+)**
4. **Wishlist**
5. **Profile**

*Settings must be accessed from Profile, not added as a sixth bottom navigation item.*

#### Required Product Areas:
- **Diary:** Personal journal list, timeline, cards, detail views, search/filter/sort, states, date/category organization.
- **Explore:** Discover food/drink places, search places, map/list view, radius/location permission handling, place details, navigate to journal creation. Clear distinction between external place info and user-authored journal content.
- **Add / Journal Editor:** Create/edit journal, food/drink details, place association, date/optional location, rating/notes, photo selection/preview/gallery/removal, draft handling, form validation, save/cancel/retry/failure states.
- **Wishlist:** Save places/experiences, add/remove/view/search, handle duplicates and unavailable info.
- **Profile:** Personal profile info, personal journal statistics, edit profile, access Settings, sign-in/out/account flows.
- **Settings (Exactly 5 categories):**
  1. *Account & Session:* Account info, session & sign-out, account-management actions.
  2. *Location & Maps:* Permissions, search radius, use location for journal option, distance unit: km only.
  3. *Appearance:* Light, Dark, System.
  4. *Food Preferences:* Favorite categories, preferred place/cuisine types, default explore filters, recommendation preferences.
  5. *Data & Support:* Journal export, storage info, clear cache, help & FAQ, feedback, privacy policy, terms of service, app version.
  *(Do not add language, currency, or date-format preferences).*
- **Authentication:** Splash screen, welcome/onboarding, login, registration, forgot password, loading/failure states, session restoration.
- **Journal Detail & Editing:** Journal detail, edit journal, delete confirmation, photo viewer & fullscreen gallery, safe handling of unsaved edits.
- **Recommendations:** Personalized recommendations based on user preferences and journal history, place/menu recommendations, AI insights & taste profile as optional capabilities with graceful fallback.

---

### 6. FUTURE EXTENSIBILITY
Design the product modularly so future modules can be added without rewriting unrelated features:
- Culinary Calendar.
- Advanced Culinary Analytics.
- Culinary Budget and Spending Reports.
- AI Taste Profile.
- Culinary Trip Planner.
- Food and Drink Collections.
- Offline Journal Access.
- Data Export Enhancements.
- Additional map and places providers.

For each future module, identify: domain, screens/routes, services/repositories, models/schemas, external providers, security/privacy/migration implications.

---

### 7. UX AND INTERACTION SPECIFICATION
For each screen specify: primary goal, main content, primary/secondary actions, navigation entry/exit, form fields & validation, loading/empty/error/success/offline states, permission-denied behavior, accessibility, touch-targets, responsive behavior.
Include 12 realistic user journeys.

---

### 8. PRIVACY AND TRUST
- Owner-only journal access.
- Owner-only photo access.
- Private user preferences.
- Separation between external place data and personal journal data.
- **NO public feed or social publishing.**
- Clear permission requests.
- Account deletion & data export.
- No exposure of private info in logs/analytics/errors.

---

### 9. 17 REQUIRED DELIVERABLES (Untuk Tahap Blueprint)
1. Product Requirements Document (PRD).
2. Product scope: in-scope, out-of-scope, and future scope.
3. User personas and primary user journeys.
4. Screen inventory and screen specifications.
5. Route and navigation map.
6. Information architecture.
7. Design tokens and component standards.
8. Reusable component inventory.
9. Data entities required at product level.
10. Permission and privacy requirements.
11. Loading, empty, error, offline, and success state inventory.
12. Accessibility checklist.
13. Feature dependency map.
14. Future feature extensibility plan.
15. Acceptance criteria for every major module.
16. Implementation priorities and phased delivery plan.
17. Asset inventory identifying existing, missing, and reusable assets.

---

### 10. COMPLETION & HANDOFF CRITERIA
Prompt 01 is complete when requirements, screen inventory, navigation, design system, privacy boundaries, future extensibility, and acceptance criteria are documented clearly for an engineering agent to implement without guessing.
- Concise summary of decisions.
- Documentation files created.
- Outstanding questions or assumptions.
- Handoff specification for Prompt 02.
