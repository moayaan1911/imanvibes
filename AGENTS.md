# AGENTS.md — ImanVibes

## Project Overview

ImanVibes is a **mobile-first Progressive Web App (PWA)** that provides Quran verses by mood, along with Hadith and the 99 Names of Allah.

This is a Phase 1 MVP:

- text-first
- no auth
- no backend
- no external APIs
- fully installable (Add to Home Screen)

---

## Core Principles

### 1. Mobile-First (CRITICAL)

- Design for mobile screens first
- Single column layout
- Thumb-friendly interactions
- Bottom navigation only
- Fast, app-like experience

### 2. PWA (REQUIRED)

- Must support “Add to Home Screen”
- Must behave like a native app
- Include:
  - manifest.json
  - service worker
  - icons

### 3. Content Integrity (CRITICAL)

- NEVER modify Quran or Hadith text
- NEVER paraphrase or reword
- Render content exactly as stored

### 4. Simplicity

- No unnecessary features
- No over-engineering
- Clean UI

### 5. Performance

- Fast load
- Static rendering
- Minimal JS

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- next-pwa (or equivalent)
- react-icons
- html-to-image
- node-edge-tts
- Static JSON data

---

## Project Structure

/app
/page.tsx
/quran/page.tsx
/quran/[mood]/page.tsx
/hadith/page.tsx
/names/page.tsx
/layout.tsx
/globals.css
/favicon.ico

/components
BottomNav.tsx
MoodGrid.tsx
ContentCard.tsx
AudioPlayer.tsx
ShareButton.tsx
Footer.tsx
ThemeToggle.tsx

/lib
content.ts

/app/api/tts
route.ts

/data source (current)
imanvibes_dataset.json

/public
icon2Circular.png
icon2Original.png

---

## Current Status

### Implemented

- Next.js app initialized with App Router, TypeScript, Tailwind, and local JSON content
- Homepage/landing page built with current tagline:
  - "Quranic comfort for every mood"
- Mobile-first routes implemented:
  - `/`
  - `/quran`
  - `/quran/[mood]`
  - `/hadith`
  - `/names`
  - `/duas`
  - `/duas/[occasion]`
- Shared bottom navigation implemented
- Persistent light/dark theme toggle implemented
- Footer implemented:
  - `© <year> ♦moayaan.eth♦`
  - `moayaan.eth` links to `https://moayaan.com`
- App deployed on Vercel:
  - `https://imanvibes.vercel.app/`
- Website MVP completed and publicly live
- Launch sharing completed on social platforms
- Vercel Analytics integrated
- PWA groundwork implemented:
  - `app/manifest.ts`
  - `public/sw.js`
  - install icons at `public/icon-192x192.png` and `public/icon-512x512.png`
  - homepage `Add to Home` button with iOS manual-install fallback
- Local PWA / device QA pass completed:
  - service worker registration moved to app-wide layout so deep links also register offline support
  - manifest upgraded with shortcuts, display override, categories, and narrow screenshots
  - manifest screenshots captured for home light, Quran light, and Quran dark states
  - Chrome mobile-viewport QA completed for manifest, service worker readiness, and cached offline reload on a Quran item route
  - Safari/WebKit install fallback text verified:
    - desktop Safari shows `File -> Add to Dock`
  - Add to Home fallback messaging refined for:
    - iPhone / iPad
    - Safari desktop
    - Arc desktop
- `icon2Circular` selected and applied as favicon/app icon source
- Arabic TTS audio playback implemented for Quran, Hadith, and Names:
  - API route `/api/tts` uses `node-edge-tts` with Microsoft Edge Neural TTS (`ar-SA-HamedNeural`)
  - Voice rate set to `-30%` for clearer Quranic Arabic pronunciation
  - Audio is synthesized on-demand (lazy, only when user clicks play)
  - CDN cache set to 30 days (`max-age=2592000`) so repeated plays are instant
  - Subtitle timing data used to trim trailing silence from TTS output
  - Web Speech API fallback if Edge TTS fails
  - `AudioPlayer` component with play/pause, progress bar, time display
  - Available on all content types (Quran, Hadith, Names) wherever Arabic text exists
- Per-item deep links implemented via query param:
  - `?item=<id>`
- Current card actions implemented:
  - Listen (Arabic TTS audio playback)
  - Next
  - Copy link
  - WhatsApp share
  - X share
  - Telegram share
  - Share image
  - Download image
- Share image generates a branded screenshot card
- WhatsApp/X share text uses the current site origin automatically:
  - localhost in dev
  - deployed domain after production launch
- Dynamic OG image generation implemented:
  - landing page OG
  - Quran quote OG
  - Hadith quote OG
  - 99 Names quote OG
  - Duas quote OG
- Temporary OG preview route implemented:
  - `/temp`
- SEO / GEO groundwork implemented:
  - `metadataBase`
  - canonical metadata
  - Open Graph metadata
  - Twitter card metadata
  - route-aware item metadata for `?item=<id>` URLs
  - `robots.txt`
  - `sitemap.xml`
  - `llms.txt`
  - JSON-LD structured data for organization, website, pages, breadcrumbs, Quran/Hadith/Duas quotes, and the 99 Names
  - crawler hygiene using `data-nosnippet` on UI chrome like nav, footer, theme toggle, and action areas
  - keep core discoverability phrases naturally present across metadata / GEO / OG / structured data where relevant:
    - `Quran by Mood`
    - `Quranic comfort for every mood`
    - `ImanVibes`
- Duas section implemented:
  - 45 duas from DeepSeek with specific hadith/surah source references
  - Data stored in `imanvibes_dataset.json` under `"duas"` key
  - Grouped by occasion (Before eating, Before sleep, Before travel, Morning and evening, etc.)
  - 30 unique occasions, sorted by dua count descending
  - `/duas` — occasion grid page
  - `/duas/[occasion]` — dua items with ContentCard (arabic + transliteration + translation + source)
  - Transliteration uses italic style (different from 99 Names uppercase style)
  - Next button disabled when only 1 dua in an occasion
  - Full SEO/GEO/OG/JSON-LD coverage matching other content types
  - Duas section link added to homepage
  - Duas tab added to bottom navigation (5 tabs total)
- Daily Verse implemented on homepage:
  - Deterministic verse selection using day-of-year
  - Local date displayed in DD/MM/YYYY format
  - Share image and download image actions (no TTS)
  - Branded share card for image generation
- Search implemented on `/quran` and `/duas` parent pages:
  - Client-side search via `SearchableGrid` component
  - Filters categories by name (moods/occasions)
  - Searches all items by translation and source (e.g., "Surah 20", "Bukhari")
  - Shows matching categories + matching items with direct deep links
  - Results capped at 10 with overflow indicator
- Dua categories sorted by count (most duas first)
- Homepage top actions updated:
  - settings icon is the only top-bar action
  - app share moved into the settings sheet
  - theme toggle moved into the settings sheet
  - new settings icon added in the top bar
  - old direct globe / personal-site shortcut removed from the top bar
- Settings sheet implemented from the homepage top bar:
  - notification permission control
  - default daily reflection notifications remain enabled when notification permission is granted
  - user-selectable Salah reminder preferences for:
    - Fajr
    - Dhuhr
    - Asr
    - Maghrib
    - Isha
  - location permission / settings control
  - About section with app version
  - Check updates button that opens the Play Store package page
  - app share action now includes:
    - Play Store package URL
    - `https://imanvibes.vercel.app`
  - quick links for:
    - ImanVibes website
    - GitHub repo
    - `moayaan.com`
- Android app-open permission bootstrap updated:
  - requests notification permission
  - requests location permission if no saved location exists
  - schedules default daily reflection notifications
  - syncs selected Salah reminders when possible
- Location persistence implemented:
  - fetched location is stored locally
  - homepage prayer card uses stored location instead of London default
  - `/prayer` page uses stored location instead of London default
  - new location fetch updates both home and prayer flows
- Home prayer card fixes:
  - larger location tap target
  - dark-mode contrast fixed by using stable readable text colors over the light prayer background
- Salah notification scheduling implemented:
  - stores user-selected prayer notification preferences
  - stores fetched prayer timings cache locally
  - schedules selected Salah notifications from saved location
  - schedules the next 7 days so daily prayer timing changes are covered when the app has recently opened
- Android-native settings bridge implemented for:
  - app settings
  - notification settings
  - location settings
  - Play Store page open
- Prayer page tracker and schedule are now linked:
  - tracker completion updates the schedule row status
  - schedule statuses are:
    - `Now`
    - `Completed`
    - `Qaza`
    - `Completed in Qaza`
    - `Missed`
  - prayer-specific sun/moon icons remain on the left; status appears on the right
  - Fajr Qaza uses sunrise internally without showing a sunrise row in the schedule
  - Maghrib Qaza uses Isha start time internally
  - completion timestamps are stored locally so on-time vs Qaza completion can be distinguished
  - daily tracker/schedule state resets by local date key and refreshes prayer timings for the new day
- Tasbih page polish:
  - removed the share icon/action from `/prayer/tasbih`
  - counter, presets, local persistence, and completion animation remain unchanged
- Qibla is currently disabled in the Prayer quick-access card with a `Coming Soon` overlay, and the dedicated route also stays in a `Coming Soon` state while the native compass implementation is kept in the codebase for future work
- Preserved Qibla compass prototype details:
  - Qibla bearing calculation remains location-based
  - Qibla marker remains relative to the phone view
  - compass direction labels (`N`, `E`, `S`, `W`) now rotate in real time with the phone heading
  - direction labels stay readable while the compass dial rotates
- App version updated to:
  - `0.0.12`
- Latest release APK built with versioned filename:
  - `release/imanvibes-0.0.12.apk`
  - latest local size observed: `9.8M`
  - `npm run build` passed before release build
  - `npm run android:apk:release` passed
  - APK was opened in Finder for manual device testing
  - latest release build testing completed locally
  - Google Play publish is planned later after buying the Google Play Developer account

### Android Branch Status

- Android packaging work lives on a separate long-lived `android` branch
- `main` remains the website source of truth
- Default sync direction should be:
  - `main -> android`
- Do not merge `android` back into `main` by default
- Capacitor Android setup is now bootstrapped on the `android` branch:
  - `@capacitor/core`
  - `@capacitor/cli`
  - `@capacitor/android`
  - `capacitor.config.ts`
  - generated `android/` project
- Android bundle build path is configured around static export:
  - `CAPACITOR_EXPORT=1`
  - `build:capacitor`
  - `android:sync`
  - `android:apk:debug`
  - `android:apk:release`
- Native-app branch behavior currently disables website-only pieces during Capacitor export:
  - Vercel Analytics
  - service worker registration
  - homepage Add to Home button
- Capacitor Android icons/splash assets have been generated from `icon2Circular`
- A local debug APK has been built successfully on the `android` branch
- Android Arabic audio playback works in the APK via remote MP3 streaming from the live `/api/tts` endpoint:
  - `@xeyqe/capacitor-tts` native playback path was attempted first but proved unreliable in the Android app
  - final fix was to make `components/AudioPlayer.tsx` use `absoluteUrl("/api/tts?..." )` on Android so the app streams audio from the deployed site instead of relying on the native TTS plugin
  - this avoids the exported-app limitation where local Next.js API routes do not exist inside the APK bundle
  - this means Android audio playback requires internet access to reach the deployed `node-edge-tts` endpoint
- APK files must stay out of git history
- Public distribution should use an external asset host such as GitHub Releases, then link that APK from the website on `main`
- Current Android versioning / release notes:
  - Android `versionName` is `0.0.10`
  - Android `versionCode` is `4`
  - release build output is copied to `release/imanvibes-<version>.apk`

### Branding / Naming Convention (Locked)

- Web app / website title format:
  - `ImanVibes | Quran by Mood`
- Android Play Store listing name:
  - `ImanVibes - Quran by Mood`
- Android launcher label / installed app name:
  - `ImanVibes`
- Android package / application ID:
  - `com.moayaan.imanvibes`
- Unless explicitly changed later, future Android release / publish work should keep the above naming exactly
- SEO / GEO / metadata / app-store-copy guidance:
  - keep `ImanVibes` as the primary brand
  - keep `Quran by Mood` as the main descriptive phrase
  - keep `Quranic comfort for every mood` as the core tagline
  - include these phrases naturally in titles, descriptions, metadata, OG copy, and structured data where relevant without keyword stuffing

### Next Android Update (Planned)

The following web features are now implemented and have been ported or prepared for the Android release on the `android` branch:

- Audio playback (Arabic TTS) ✅ on web
- Daily Verse (homepage daily verse with date) ✅ on web
- Duas page (grouped by occasion) ✅ on web
- Search functionality (filter categories and items) ✅ on web
- Qibla Direction (native compass-based) ⏳ temporarily disabled in the UI and preserved in code for future re-enable
- Tasbih Counter ✅ on Android

### Remaining

- Quran and Hadith entries currently only have `arabic`, `translation`, and `source`. Transliteration will be added later for both web and Android.
- Real-device production PWA smoke testing is still recommended:
  - Android Chrome install prompt behavior on the live deployed site
  - iPhone / iPad Add to Home Screen flow on the live deployed site
  - native share-sheet behavior on real mobile browsers
  - favicon / app icon behavior after install on physical devices
- Optional PWA polish still available later:
  - broader offline caching beyond the current route-and-asset strategy
  - optional additional splash/install screenshots in the manifest
- Custom production domain / final URL strategy is still pending if moving beyond `vercel.app`
- Data is intentionally kept in a single root file for now:
  - `imanvibes_dataset.json`
- Arabic TTS audio is generated on-demand via Edge Neural TTS, not stored locally (no audio files in the repo)
  - Audio is cached at CDN level for 30 days
  - Web Speech API acts as fallback for browsers/devices where Edge TTS fails

### Next Priority

1. Verify share links/images and metadata previews on the live deployed domain
2. Do a quick physical-device smoke test for install/share behavior on Android Chrome and iPhone Safari
3. Add testing coverage for main flows
4. Keep security hardening and broader visual QA as explicitly opt-in follow-up work
5. Keep accessibility polish as a future suggestion unless explicitly prioritized later

---

## Engineering Review Notes

### Current Scan Result

- `npm run lint` passes
- `npm run build` passes
- `npm audit --omit=dev` reports 0 vulnerabilities
- No critical security issue was found in the current MVP scan
- Local browser automation QA completed for PWA behavior in Chrome and WebKit

### Pending Improvements

#### Performance / Optimization

- Lazy-load `html-to-image` so normal reading routes do not pay screenshot-generation cost upfront
- Consider replacing query-param item deep links with route segments or server-aware item resolution so shared item links render the correct item on first HTML response, not only after hydration
- Replace `Suspense fallback={null}` with a lightweight loading/skeleton state
- Remove unused default starter assets from `/public`

#### Security / Hardening

- Add response security headers:
  - Content-Security-Policy
  - Referrer-Policy
  - X-Content-Type-Options
  - Frame-Options / equivalent
- Add build-time schema validation for `imanvibes_dataset.json`
- Enforce unique IDs and unique mood slugs during validation
- Add defensive fallbacks for older browsers around clipboard, native share, and image sharing support

#### Reliability / Maintainability

- Add `not-found.tsx` and `error.tsx` pages for cleaner failure handling
- Consider extracting repeated page-shell styling into shared layout primitives/components
- Add stronger dataset typing/validation instead of relying only on TypeScript casts
- Consider adding stable internal share-card templates per content type if the screenshot design keeps evolving

#### SEO / Metadata / Deployment

- Verify social preview behavior on the live deployed domain after the new OG routes are crawled
- Keep `SITE_URL` / `NEXT_PUBLIC_SITE_URL` ready if moving to a custom production domain later
- Consider adding search-engine verification tokens later:
  - Google Search Console
  - Bing Webmaster Tools
- Consider page-type-specific metadata refinements if new routes are added later

#### Testing

- Add unit tests for:
  - slug generation
  - mood lookup
  - per-item link generation
- Add interaction tests for:
  - copy link
  - item switching
  - mood navigation
  - share image / download image actions
- Add e2e coverage for the main mobile flows after deployment or local browser automation setup

---

## Data Rules

- Local JSON only
- Read-only
- No API calls
- No mutations
- Current implementation reads from `imanvibes_dataset.json` via `lib/content.ts`

---

## Feature Scope (Phase 1)

### Homepage

- Title: ImanVibes
- Tagline: "Quranic comfort for every mood"
- Web title pattern: `ImanVibes | Quran by Mood`
- Mood grid

---

### Quran by Mood

Route: /quran/[mood]

Each card:

- Arabic
- Translation
- Source

Actions:

- Listen (Arabic TTS audio playback)
- Next
- Copy link
- WhatsApp share
- X share
- Share image
- Download image

---

### Hadith

Route: /hadith

Each card:

- Arabic
- Translation
- Source

Actions:

- Listen (Arabic TTS audio playback)
- Next
- Copy link
- WhatsApp share
- X share
- Share image
- Download image

---

### Names of Allah

Route: /names

Each card:

- Arabic
- Transliteration
- Meaning

Actions:

- Listen (Arabic TTS audio playback)
- Next
- Copy link
- WhatsApp share
- X share
- Share image
- Download image

---

### Share Feature (REQUIRED)

Each card must include:

- Listen (Arabic TTS audio playback)
- Copy link
- WhatsApp share
- X share
- Share image
- Download image

Current behavior:

- Copy copies the item-specific link, not the verse text
- Item URLs use `?item=<id>`
- WhatsApp and X use promotional share text plus the item URL
- Share image creates a branded screenshot-style card
- Image footer should show homepage domain only, not the full deep link

---

## PWA Requirements (MANDATORY)

- Add manifest.json:
  - name: ImanVibes
  - display: standalone
  - start_url: /
  - theme_color

- Add icons (192px, 512px)

- Configure service worker (next-pwa)

- Enable install prompt (browser default is fine)

---

## UI Guidelines

- Minimal
- Clean spacing
- Mobile-first
- Soft colors
- When using external design references, mockups, Claude/Gemini/Stitch outputs, or screenshots:
  - do **not** copy the full design 1:1 by default
  - treat them as inspiration / direction only
  - only replicate the specific section, interaction, or visual treatment explicitly requested by the user
  - keep the rest of the UI original and adapted to ImanVibes

Typography:

- Arabic: large
- Translation: medium
- Source: small

---

## Navigation

Bottom navigation:

- Home
- Quran
- Hadith
- Names

---

## Constraints (STRICT)

DO NOT implement:

- authentication
- backend database
- AI
- images (except icons)
- animations

Note: `/api/tts` route uses Microsoft Edge Neural TTS as an external synthesis service. This is a lightweight serverless function, not a traditional backend.

---

## Future Updates (DO NOT BUILD NOW)

### Android Packaging Workflow

- `android` branch is reserved for Capacitor / Android app packaging work
- Do **not** merge the `android` branch back into `main` by default
- `main` remains the source of truth for the website
- Sync changes from `main` into `android` when needed, not the other way around unless explicitly decided later
- Shared UI refinements developed on `android` may later be ported to `main`, but this should be done selectively:
  - do **not** assume the whole `android` branch should be merged into `main`
  - treat Android UI work as a source of reusable design decisions, not an automatic merge candidate
  - document major reusable UI decisions in `AGENTS.md` so they can be reapplied intentionally on `main`
  - standardize the web UI to match the Android UI direction where appropriate, but keep Prayer-related UI/features out of the web app
- For Android UI work based on externally generated concepts:
  - do **not** reproduce the concept screens exactly unless the user explicitly asks for an exact section to be matched
  - default behavior is selective inspiration, not wholesale visual copying
  - if the user later names a specific part to copy, only that named part should be matched
- Keep Android-specific changes isolated as much as possible
- Do **not** commit generated APK files into git history
- Preferred Android distribution flow:
  - upload APK externally
  - place the download link on the website in `main`
  - keep the APK binary out of the repository

### Browser Extension

- Extension lives in the `extension/` folder (manifest v3)
- Acts as an ImanVibes Prayer companion for web users, not a duplicate of the website
- Core extension features:
  - location-based prayer timings
  - next Salah countdown
  - browser popup notifications / reminders for Salah
  - prayer tracker / check-off flow inspired by the Android Prayer page
  - optional Jummah reminder
  - button to open the ImanVibes website
- Extension version: `1.0.0`
- Extension share/copy button copies promotional text with emojis (website link + extension link)
- Do not duplicate Quran by Mood, Hadith, Names, or Duas inside the extension because those remain website/app content
- Keep extension-specific code isolated from `main` and `android`; shared data/UI decisions should be ported selectively

### Features

- Capacitor build for Android / iOS app packaging
- AI chatbot
- Save/bookmarks
- Wallpapers
- Swipe gestures
- Daily feed
- Prayer times, Qibla, Hijri
- Qibla compass re-enable after native sensor reliability pass
- Prayer calculation method selector in Settings:
  - expose all 15 supported AlAdhan calculation methods
  - let the user pick their own preferred method (for example Karachi, ISNA, MWL, Umm al-Qura, Egypt, Tehran/Jafari, etc.)
  - persist the selected method locally and use it for prayer times and Salah reminder scheduling
- Notifications
- PWA enhancements
- Accessibility polish:
  - focus-visible states
  - color-contrast audit
  - broader keyboard/accessibility review
  - extended Arabic small-screen readability checks

---

### Monetization (Future)

- Donations
- Premium personalization
- Premium themes
- Wallpapers
- Mobile app
- AI premium

---

## Final Goal

Build a **mobile-first Islamic PWA** that feels:

- fast
- calm
- simple
- app-like

NEVER RUN GIT COMMANDS YOURSELF
 AFTER EVERY CODE IMPLEMENTATION run npm run build and make sure its building fine
 IF I AM ONLY CHANGING AGENTS.md, DO NOT RUN npm run build
NEVER RUN npm run dev OR npm run start
USE playwright-cli where needed to fetch screenshots of features
