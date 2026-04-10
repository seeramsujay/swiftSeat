# Project Roadmap: SwiftSeat (The "Dijkstra" Architecture)

## Phase 1: Research & Discovery (Completed)
- [x] Identify core pain points in large-scale sporting events.
- [x] Analyze existing technology solutions.
- [x] Define optimal system architecture (Zero-Friction NFC, Edge Compute, HTTP/3, Time-Dependent Graphs).

## Phase 2: Design & Prototyping (Current)
- [ ] Define MVP feature set (Zero-download PWA, Predictive AI push, Dynamic flow routing).
- [ ] Design Firestore data schema for Time-Dependent Graphs (Nodes and Edges with density weights).
- [ ] Prototype UI/UX for NFC "Instant App" popups (Apple App Clips / Android Instant Apps).
- [ ] Set up initial project scaffolding for a lightweight PWA/Next.js frontend.

## Phase 3: Infrastructure & Backend Development
- [ ] Provision Google Cloud APIs (Vertex AI TiDE, Pub/Sub, Dataflow).
- [ ] Establish simulated Edge Compute backend (mocking low-latency local processing).
- [ ] Implement mock telemetry generator (Python) pushing UDP/HTTP/3 mocked payloads.
- [ ] Build stream processing pipeline (Dataflow) to aggregate zone density into live graph weights.

## Phase 4: Core Engine Development (The Flow & AI)
- [ ] Build the Time-Dependent Routing Engine (Dijkstra/A* with dynamic edge weights).
- [ ] Implement Anticipatory AI (Vertex AI) to generate push triggers before halftime.
- [ ] Develop the NFC-to-Order pipeline (Seat QR/NFC -> PWA -> Google/Apple Pay).

## Phase 5: Testing & Optimization
- [ ] Test HTTP/3 / WebRTC data channel degradation under simulated packet loss.
- [ ] Conduct accessibility audit (WCAG 2.1 AA, high contrast).
- [ ] Perform stress testing for predictive flow accuracy.

## Phase 6: Submission & Demo
- [ ] Finalize documentation and README.
- [ ] Record end-to-end "Zero Friction" demo video.
- [ ] Prepare final pitch emphasizing the mathematical superiority of the architecture.
