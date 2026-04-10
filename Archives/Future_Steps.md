# Future Steps: Optimal Architecture Implementation

## Immediate Actions
- [x] Shift architectural paradigm from "Reactive App" to "Predictive Zero-Friction Edge App".
- [x] Define technical stack: Next.js PWA (NFC triggered), Google Cloud distributed edge simulation, HTTP/3 (QUIC) protocols, Time-Dependent Graph structures.
- [ ] Setup unified GCP + Firebase Project, ensuring HTTP/3 (QUIC) is supported on the load balancer or hosting.
- [ ] Provision API Keys for Vertex AI (for TiDE forecasting module).
- [ ] Create UI wireframes for the "No-App" seat-scan experience (1-tap ordering).

## Development Milestones
1. **The Telemetry Stream**: Implement a Python mock generator that simulates 50k users, but specifically models *pedestrian fluid dynamics* (crowding in specific bottlenecks over time).
2. **Dynamic Graph Engine**: Build the backend matrix where nodes (stands) and edges (corridors) have dynamic weights (travel time) that actively change based on the telemetry stream. 
3. **NFC / Instant App Entry**: Scaffold the Next.js frontend to act as a PWA/Instant app, aggressively minimizing bundle size so it loads under 1 second on bad networks.
4. **Anticipatory AI Push**: Create a Cloud Function that monitors the game clock and user history, and uses Vertex AI to *push* a custom concession order to the user's phone 3 minutes before the halftime whistle.
5. **UDP/QUIC Integration**: Ensure client-server communication tests bypass standard TCP limitations to simulate stadium-grade resilience.
