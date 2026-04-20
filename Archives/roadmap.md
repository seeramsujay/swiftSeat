# Project Roadmap: SwiftSeat (The "Gemini-First" Architecture)

## Phase 1: Research & Discovery (Completed)
- [x] Identify core pain points in large-scale sporting events.
- [x] Analyze existing technology solutions.
- [x] Define optimal system architecture (Zero-Friction NFC, Edge Compute, HTTP/3, Time-Dependent Graphs).
- [x] Efficiency audit: Pivot from "Dijkstra Architecture" to "Gemini-First Architecture" for hackathon alignment.
- [x] Design PALO scoring algorithm (Predictive Arrival-time, Load-balanced Optimization).

## Phase 2: Foundation & Setup (Completed)
- [x] Unified React Platform: Scaffolding with Vite, TypeScript, and CSS tokens.
- [x] Design System: implemented "Gemini-First" glassmorphism and "No-Line" rule.
- [x] Core Hooks: `useSwiftSeat` (API) and `usePALO` (Algorithm) ported and functional.
- [x] Role-Based Shell: Admin, User, and Vendor components integrated.
- [x] Mobile Native Transition: Expo (React Native) scaffolded with "Velocity Slate" DS.
- [ ] Create GCP project. Enable: Maps JS API, Compute Route Matrix, Gemini API, Firestore, Cloud Functions, FCM.
- [ ] Create Firebase project linked to GCP.
- [ ] Design Firestore schema: `/Events/{eventId}/Zones`, `/Concessions`, `/Orders`, `/RoutingLog`.
- [ ] Create stadium SVG overlay with mapped zone IDs.

## Phase 3: Mock Data & Heatmap
- [ ] Write Python mock data generator (`mock_generator.py`) — writes density + wait time data to Firestore with time-series trend.
- [ ] Implement real-time heatmap rendering (Firestore snapshot listeners → SVG zone color updates).
- [ ] Validate heatmap updates live with mock data running.

## Phase 4: PALO Algorithm & Smart Routing
- [ ] Implement PALO scoring engine in `app.js`:
  - Fetch walk times via Google Maps Compute Route Matrix.
  - Fetch current wait times + trend from Firestore.
  - Predict wait-at-arrival using linear trend extrapolation.
  - Apply load-balancing penalty from `/RoutingLog`.
  - Rank concession stands by composite PALO score.
- [ ] Integrate routing results with Google Maps visual directions on the stadium overlay.
- [ ] Log each routing recommendation to Firestore `/RoutingLog` for load-balancing feedback.

## Phase 5: Gemini AI Concierge
- [ ] Deploy Gemini proxy Cloud Function (keeps API key server-side).
- [ ] Define function declarations for Gemini tool use:
  - `get_nearby_concessions(user_location, food_type)`
  - `get_optimal_route(user_location, destination)` — uses PALO internally
  - `place_order(vendor_id, items, user_id)`
  - `get_zone_density(zone_id)`
- [ ] Build conversational chat UI (text + image input).
- [ ] Demonstrate end-to-end agentic flow: "I'm hungry" → PALO routing → order placement → wallet voucher.

## Phase 6: Wallet, Safety & Offline
- [ ] Implement Google Wallet pass creation via Cloud Function (EventTicketObject + concession voucher).
- [ ] Implement FCM density alerting pipeline (Cloud Function monitors Firestore zones, pushes alert if density > threshold).
- [ ] Build emergency UI mode (strip all commercial UI, show high-contrast escape route).
- [ ] Implement service worker for offline-first caching (map, ticket, queued orders).

## Phase 7: Polish & Submit
- [ ] Accessibility pass: WCAG 2.1 AA, high-contrast toggle, ARIA labels, TTS route narration.
- [ ] Google Translate API integration for multilingual Gemini responses.
- [ ] Final README with architecture diagram and PALO algorithm explanation.
- [ ] Record end-to-end demo video.
- [ ] Verify repo size < 1MB. Submit.
## Phase 8: Mobile Native Polish (In Progress)
- [x] Scaffold Expo app with "Kinetic Oasis" design system components.
- [x] Implement UI for Concierge, Live Map, Orders, and Profile.
- [ ] Port PALO logic from Vite app to React Native `usePALO` hook.
- [ ] Implement Firebase Auth and Firestore listeners in Native app.
- [ ] Configure CI/CD (GitHub Actions) for Android APK builds.
