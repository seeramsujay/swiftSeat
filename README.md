# SwiftSeat — Smart Venue Experience Assistant 🏟️

A dynamic, intelligent system designed to revolutionize the attendee experience at large-scale sporting events using the **PALO Algorithm** and **Gemini AI**.

## 🚀 Overview
This project addresses the critical logistical challenges of modern stadiums — crowd congestion, concession wait times, and emergency response. By integrating Google Services and a predictive routing algorithm, we provide fans with a seamless, frictionless journey from entry to exit.

## 🏆 Hackathon Vertical
**Persona & Logic:** Smart Venue Assistant for High-Density Environments.

## 🧠 Core Innovation: The PALO Algorithm
**Predictive Arrival-time, Load-balanced Optimization** — our routing engine doesn't just find the *currently* fastest concession stand. It predicts what the wait will be **when you arrive**, factors in how many other users are being routed there (avoiding the herd effect), and respects accessibility needs.

```
score = walk_time + predicted_wait_at_arrival + load_balancing_penalty
```

See `Archives/algorithm_design.md` for the full specification with worked examples.

## 🛠️ Key Features (MVP)
1. **Gemini AI Stadium Concierge**: A multimodal conversational agent — say "I want a burger" and the AI orchestrates routing, ordering, and payment via function calling.
2. **Smart Concession Routing (PALO)**: Recommends the fastest stand factoring walk time, predicted wait-at-arrival, and load balancing across all users.
3. **Real-Time Crowd Density Heatmap**: Live SVG-based concourse visualization powered by Firestore real-time listeners.
4. **Google Wallet Integration**: Auto-linked digital tickets and concession vouchers pushed on entry.
5. **Dynamic Density Alerting**: Firebase Cloud Messaging alerts when crowd density breaches safety thresholds, with escape routing.

## 📐 Architecture
- **Frontend**: Vanilla HTML/CSS/JS Progressive Web App (offline-first, < 100KB).
- **Backend**: Google Cloud Functions (serverless).
- **Database**: Cloud Firestore (real-time sync, denormalized schema).
- **AI**: Gemini 2.0 Flash with function calling (the central orchestrator).
- **Maps**: Google Maps JS API + Compute Route Matrix.
- **Payments**: Google Wallet API.
- **Alerts**: Firebase Cloud Messaging.

## 📂 Repository Structure
- `Research/` — Detailed problem analysis and technology landscape report.
- `Archives/` — Roadmap, algorithm design, and development logs.
  - `algorithm_design.md` — Full PALO algorithm specification.
  - `roadmap.md` — Phase-by-phase development checklist.
- `project_guidelines.md` — Submission rules and requirements.

## 🚀 How to Run Locally

You will need three terminal windows to run the complete simulation environment: the stadium mock data generator, the Gemini AI proxy, and the frontend app.

### 1. Setup the Python Environment
Open a terminal and install the required dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Gemini API
1. Get a Gemini API key from Google AI Studio.
2. Inside the `/backend` folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Paste your API key into the `.env` file (`GEMINI_API_KEY="..."`).

*(Note: If you skip this, the proxy will run in Mock Mode).*

### 3. Run the Services (3 Terminals)

**Terminal 1: Start the Stadium Telemetry Generator**
Simulates 50,000+ users generating live density and concession wait-time spikes.
```bash
cd backend
python mock_generator.py
```

**Terminal 2: Start the Gemini AI Proxy**
Bootstraps the Flask server that handles Function Calling.
```bash
cd backend
python server.py
```

**Terminal 3: Start the Frontend PWA**
Run a simple HTTP server to serve the HTML/JS application securely.
```bash
cd public
python -m http.server 8000
```
Open your browser and navigate to `http://localhost:8000`.

## 📜 Accessibility & Inclusion
Built with **WCAG 2.1 AA** compliance:
- High-contrast "Calm UI" for high-glare stadium environments.
- Step-free route filtering for mobility-impaired attendees.
- TTS-narrated directions for visually impaired fans.
- Emergency mode: strips all commercial UI, shows singular escape vector.

## 🔒 Privacy
- Anonymous density tracking via geohash aggregation (no PII transmitted).
- k-anonymity and spatial cloaking on-device.
- Compliant with India's DPDP Act 2023.

---
*Created as part of the Prompt Wars challenge.*
