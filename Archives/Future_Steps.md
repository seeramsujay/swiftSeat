# Future Steps: Gemini-First Architecture

## Immediate Actions
- [x] Efficiency audit completed — pivoted from "Dijkstra Architecture" to "Gemini-First Architecture".
- [x] Designed PALO algorithm (Predictive Arrival-time, Load-balanced Optimization) as the core routing engine.
- [ ] Setup GCP + Firebase project. Enable all required APIs (Maps, Gemini, Firestore, Functions, FCM, Wallet, Translate).
- [ ] Provision API keys. Store securely (never in repo — use Cloud Function environment variables).
- [ ] Scaffold vanilla PWA: `index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`.

## Development Milestones
1. **Mock Telemetry Stream**: Python script writing simulated crowd density + concession wait times to Firestore. Must include time-series trend data (rate of change) for PALO predictions.
2. **Live Heatmap**: Firestore real-time listeners → SVG stadium overlay with color-coded density zones.
3. **PALO Routing Engine**: The core algorithm — predict wait-at-arrival, apply load-balancing, rank by composite score. Runs client-side in `app.js`.
4. **Gemini Concierge**: Central AI agent using function calling to orchestrate routing, ordering, and alerts. THE hero feature.
5. **Wallet + Safety**: Google Wallet pass push on entry. FCM alerts for dangerous density zones.
6. **Offline-First**: Service worker caches map, ticket, and queues orders for sync when connectivity returns.

## Algorithm: PALO (Predictive Arrival-time, Load-balanced Optimization)
See `Archives/algorithm_design.md` for full specification.

**One-liner**: Don't recommend the best stand *right now* — recommend the best stand *when you get there*, accounting for everyone else being routed there too.
