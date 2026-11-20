# SwiftSeat: Architectural Review & Venue Intelligence Roadmap (future.md)

---

## 1. Architectural Code Review & Current State Analysis

SwiftSeat is an intelligent stadium logistics platform engineered to eliminate crowd bottlenecks, concession lines, and egress delays at large-scale arenas. By combining the **PALO Algorithm (Predictive Arrival-time, Load-balanced Optimization)** with **Gemini AI**, SwiftSeat predicts venue wait times at the attendee's calculated arrival timestamp rather than displaying static, outdated queue lengths.

### Architectural Strengths
- **Predictive Arrival Extrapolation (PALO):** Dynamically adjusts recommended concession stands and restrooms based on the user's physical walking distance, preventing stampedes to momentarily empty counters.
- **Cross-Platform Experience:** Dual-target architecture featuring a high-performance **React Native (Expo)** mobile application utilizing the "Kinetic Oasis" design system, a **Vite / React** management console, and hardware BLE gateway telemetry simulation.
- **Accessibility-First Routing:** Built-in step-free routing paths, high-glare contrast themes, and screen-reader accessibility for mobility-impaired attendees.

### Identified Bottlenecks & Code Smells
1. **GPS Concourse Degradation:** Standard GPS accuracy drops dramatically ($>25\text{m}$ drift) inside concrete stadium tunnels and lower concourses without indoor micro-location support.
2. **Synchronous Gemini Chat Latency:** Querying Gemini AI synchronously on every navigation repath adds 1.2–2.0 seconds of latency under congested stadium 5G networks.
3. **Absence of Point-of-Sale (POS) Integration:** Wait-time estimates currently rely on simulated telemetry rather than direct transaction-throughput metrics from concession POS terminals.

---

## 2. Strategic Engineering Roadmap

```mermaid
flowchart TD
    subgraph Phase 1: High-Precision Sub-Meter Indoor Positioning
        P1A[BLE Beacon & Wi-Fi RTT Trilateration] --> P1B[Dead-Reckoning IMU Step Tracking]
        P1B --> P1C[Sub-1m Concourse Wayfinding Precision]
    end

    subgraph Phase 2: Live Concession POS & Smart Mobile Ordering
        P2A[Square / Toast POS Throughput Stream] --> P2B[Predictive Queue Departure Models]
        P2B --> P2C[In-Seat Mobile Pre-Order & Express Pickup]
    end

    subgraph Phase 3: Augmented Reality (AR) Stadium Navigation
        P3A[ARCore / ARKit Visual Inertial Odometry] --> P3B[Floating Directional HUD Arrows]
        P3B --> P3C[Step-Free Ramp & Elevator Highlight Mode]
    end

    subgraph Phase 4: Emergency Egress & Crowd Evacuation
        P4A[Real-Time Concourse Density Heatmaps] --> P4B[Multi-Agent Dynamic Evacuation Router]
        P4B --> P4C[Automated Push Alerts & Safety Gates]
    end

    Phase 1 --> Phase 2
    Phase 2 --> Phase 3
    Phase 3 --> Phase 4
```

---

## 3. Detailed Milestone Execution Plan

### Milestone 1: Sub-Meter Indoor Navigation via BLE & Wi-Fi RTT
- [ ] **Bluetooth Low Energy (BLE) Mesh:** Deploy iBeacon / Eddystone signal trilateration to pinpoint user location within $<1.5\text{m}$ across indoor corridors.
- [ ] **Pedestrian Dead Reckoning (PDR):** Integrate device accelerometer and gyroscope fusion to maintain accurate positioning through radio dead zones.

### Milestone 2: Live Point-of-Sale Integration & Express Pickup
- [ ] **Real-Time POS Ingestion:** Ingest transactions-per-minute telemetry from stadium concessions to dynamically calculate exact item preparation delays.
- [ ] **Stripe Express Pre-Order:** Enable fans to order concessions directly within the app, timing the "Order Ready" notification to their arrival at the express pickup window.

### Milestone 3: Augmented Reality (AR) Wayfinding
- [ ] **In-Stadium AR Guidance:** Overlay 3D holographic directional arrows onto the user's camera feed, pointing directly toward their assigned section, row, and seat number.
- [ ] **Accessibility Landmark Highlighting:** Visually tag wheelchair ramps, elevators, sensory-friendly quiet rooms, and first aid stations.

### Milestone 4: Autonomous Stadium Egress & Safety Management
- [ ] **Post-Game Dynamic Egress:** Dynamically distribute exit flows across stadium gates to eliminate post-event parking bottlenecks.
- [ ] **Emergency Evacuation Mode:** In the event of a fire or security incident, immediately override route logic to guide attendees through uncrowded, clear exit paths.
