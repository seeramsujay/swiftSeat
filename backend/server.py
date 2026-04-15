"""
SwiftSeat Backend — v3
Flask API serving:
  - /api/chat          (Gemini AI Concierge)
  - /api/zones         (Live crowd density — React Native app)
  - /api/concessions   (All stands + PALO data — React Native app)
  - /api/route         (PALO optimal route — React Native app)
  - /api/admin/nodes   (All IoT nodes + thermal/camera status — Admin Dashboard)
  - /api/admin/stats   (System-wide vitals — Admin Dashboard)
  - /api/vendor/<id>   (Queue + order data — Vendor Dashboard)
  - /api/vendor/<id>/orders  (Accept / complete orders — Vendor Dashboard)
"""

import os
import time
import math
import random
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow all origins — tighten in production

# ─────────────────────────────────────────────
# FIREBASE INIT
# ─────────────────────────────────────────────
FIREBASE_ENABLED = False
db = None

try:
    import firebase_admin
    from firebase_admin import credentials, firestore as fs
    _key_path = 'keys/serviceAccountKey.json'
    cred = credentials.Certificate(_key_path) if os.path.exists(_key_path) else credentials.ApplicationDefault()
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = fs.client()
    FIREBASE_ENABLED = True
    print("[Firebase] Connected to Firestore ✓")
except Exception as e:
    print(f"[Firebase] Not initialized — running in MOCK mode. ({e})")

# ─────────────────────────────────────────────
# MOCK DATA  (used when Firebase is offline)
# ─────────────────────────────────────────────
MOCK_ZONES = [
    {"id": "zone_north_1", "name": "North Concourse",   "currentDensity": 3.2, "status": "WARNING",  "trend": 0.4},
    {"id": "zone_south_1", "name": "South Concourse",   "currentDensity": 1.4, "status": "SAFE",     "trend": -0.1},
    {"id": "zone_east_1",  "name": "East Concourse",    "currentDensity": 4.8, "status": "CRITICAL", "trend": 0.9},
    {"id": "zone_west_1",  "name": "West Concourse",    "currentDensity": 2.1, "status": "SAFE",     "trend": 0.2},
    {"id": "zone_nw_corner","name": "NW Corner",        "currentDensity": 1.0, "status": "SAFE",     "trend": 0.0},
    {"id": "zone_ne_corner","name": "NE Corner",        "currentDensity": 2.7, "status": "WARNING",  "trend": 0.3},
]

MOCK_CONCESSIONS = [
    {
        "id": "vendor_north_7",
        "name": "North Grill",
        "emoji": "🍔",
        "location": {"lat": 12.9721, "lng": 77.5947},
        "menuCategories": ["burgers", "drinks"],
        "stepFreeAccess": False,
        "estimatedWaitTime": 480,
        "waitTrend": 4.0,
        "queueLength": 22,
        "isOpen": True,
    },
    {
        "id": "vendor_south_3",
        "name": "South Kiosk",
        "emoji": "🥤",
        "location": {"lat": 12.9715, "lng": 77.5940},
        "menuCategories": ["burgers", "snacks", "drinks"],
        "stepFreeAccess": True,
        "estimatedWaitTime": 90,
        "waitTrend": -0.5,
        "queueLength": 4,
        "isOpen": True,
    },
    {
        "id": "vendor_east_2",
        "name": "East Café",
        "emoji": "🍿",
        "location": {"lat": 12.9718, "lng": 77.5955},
        "menuCategories": ["snacks", "drinks"],
        "stepFreeAccess": True,
        "estimatedWaitTime": 240,
        "waitTrend": 1.0,
        "queueLength": 11,
        "isOpen": True,
    },
]

MOCK_NODES = [
    {
        "id": "zone_north_1", "zone": "North Concourse", "type": "zone",
        "status": "online", "lastSeen": time.time() - 3, "sensorType": "thermal",
        "cameraStatus": "online",  "cameraStreamUrl": "http://192.168.1.101:8080/stream",
        "thermalGrid": [round(22.0 + (random.random() * 15 if i % 9 == 0 else random.random() * 3), 1) for i in range(64)],
        "averageTemp": 24.1, "hotSpots": 7,
    },
    {
        "id": "zone_south_1", "zone": "South Concourse", "type": "zone",
        "status": "online", "lastSeen": time.time() - 8, "sensorType": "thermal",
        "cameraStatus": "online",  "cameraStreamUrl": "http://192.168.1.102:8080/stream",
        "thermalGrid": [round(22.0 + random.random() * 2, 1) for _ in range(64)],
        "averageTemp": 23.0, "hotSpots": 2,
    },
    {
        "id": "zone_east_1", "zone": "East Concourse", "type": "zone",
        "status": "online", "lastSeen": time.time() - 1, "sensorType": "thermal",
        "cameraStatus": "offline", "cameraStreamUrl": None,
        "thermalGrid": [round(28.0 + (random.random() * 12 if i % 5 == 0 else random.random() * 4), 1) for i in range(64)],
        "averageTemp": 31.4, "hotSpots": 12,
    },
    {
        "id": "vendor_south_3", "zone": "South Kiosk", "type": "vendor",
        "status": "online", "lastSeen": time.time() - 5, "sensorType": "wait_time",
        "cameraStatus": "online",  "cameraStreamUrl": "http://192.168.1.110:8080/stream",
        "queueLength": 4, "estimatedWaitTime": 90, "waitTrend": -0.5,
    },
    {
        "id": "vendor_north_7", "zone": "North Grill", "type": "vendor",
        "status": "online", "lastSeen": time.time() - 2, "sensorType": "wait_time",
        "cameraStatus": "online",  "cameraStreamUrl": "http://192.168.1.111:8080/stream",
        "queueLength": 22, "estimatedWaitTime": 480, "waitTrend": 4.0,
    },
    {
        "id": "zone_west_1", "zone": "West Concourse", "type": "zone",
        "status": "offline", "lastSeen": time.time() - 320, "sensorType": "thermal",
        "cameraStatus": "offline", "cameraStreamUrl": None,
        "thermalGrid": [], "averageTemp": None, "hotSpots": 0,
    },
]

# In-memory orders store (replace with Firestore in production)
_orders_store = {
    "vendor_south_3": [
        {"id": "ORD-001", "item": "Burger Combo", "user": "Seat 215", "status": "pending",  "timestamp": time.time() - 120},
        {"id": "ORD-002", "item": "Diet Coke",    "user": "Seat 308", "status": "pending",  "timestamp": time.time() - 45},
    ],
    "vendor_north_7": [
        {"id": "ORD-003", "item": "Double Patty", "user": "Seat 102", "status": "pending",  "timestamp": time.time() - 80},
    ],
}

# ─────────────────────────────────────────────
# PALO ENGINE
# ─────────────────────────────────────────────
ROUTE_MATRIX = {
    "vendor_north_7": {"durationSeconds": 120},
    "vendor_south_3": {"durationSeconds": 240},
    "vendor_east_2":  {"durationSeconds": 180},
}

def palo_optimize(food_type=None, accessible=False, concessions=None, routing_log=None):
    """Pure Python PALO scoring — mirrors the frontend JS implementation."""
    ALPHA = 30
    candidates = list(concessions or MOCK_CONCESSIONS)

    if food_type:
        candidates = [c for c in candidates if food_type in c.get("menuCategories", [])]
    if accessible:
        candidates = [c for c in candidates if c.get("stepFreeAccess")]

    now = time.time() * 1000  # ms
    scored = []
    for stand in candidates:
        walk_sec      = ROUTE_MATRIX.get(stand["id"], {}).get("durationSeconds", 180)
        wait_now      = stand.get("estimatedWaitTime", 180)
        wait_trend    = stand.get("waitTrend", 0)
        walk_mins     = walk_sec / 60
        predicted     = max(0, wait_now + wait_trend * walk_mins)
        active_routes = len([l for l in (routing_log or []) if l.get("stand_id") == stand["id"] and l.get("expires_at", 0) > now])
        load_penalty  = ALPHA * active_routes
        score         = walk_sec + predicted + load_penalty

        scored.append({
            **stand,
            "walkSeconds":       walk_sec,
            "walkMins":          round(walk_sec / 60),
            "predictedWait":     round(predicted),
            "predictedWaitMins": round(predicted / 60),
            "loadPenalty":       round(load_penalty),
            "score":             round(score),
            "totalMins":         round(score / 60),
        })

    scored.sort(key=lambda x: x["score"])
    return scored

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def get_mock_zones():
    """Return zones with slight random drift for demo."""
    for z in MOCK_ZONES:
        z["currentDensity"] = round(max(0, min(5, z["currentDensity"] + random.uniform(-0.3, 0.4))), 1)
        z["status"] = "CRITICAL" if z["currentDensity"] >= 4 else "WARNING" if z["currentDensity"] >= 2.5 else "SAFE"
    return MOCK_ZONES

def get_live_zones():
    if not FIREBASE_ENABLED:
        return get_mock_zones()
    try:
        zones = []
        docs = db.collection("Events").document("event_123").collection("Zones").stream()
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            zones.append(data)
        return zones
    except Exception:
        return get_mock_zones()

def get_live_concessions():
    if not FIREBASE_ENABLED:
        return MOCK_CONCESSIONS
    try:
        stands = []
        docs = db.collection("Events").document("event_123").collection("Concessions").stream()
        for doc in docs:
            # merge Firestore overrides into the mock base
            data = doc.to_dict()
            data["id"] = doc.id
            base = next((c for c in MOCK_CONCESSIONS if c["id"] == doc.id), {})
            stands.append({**base, **data})
        return stands or MOCK_CONCESSIONS
    except Exception:
        return MOCK_CONCESSIONS

def get_live_nodes():
    if not FIREBASE_ENABLED:
        return MOCK_NODES
    try:
        nodes = []
        docs = db.collection("Admin").document("Hardware").collection("Nodes").stream()
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            nodes.append(data)
        return nodes or MOCK_NODES
    except Exception:
        return MOCK_NODES

# ─────────────────────────────────────────────
# ── REACT NATIVE APP ENDPOINTS ──
# ─────────────────────────────────────────────

@app.route('/api/zones', methods=['GET'])
def get_zones():
    """
    Live crowd density for all concourse zones.
    Used by the React Native app heatmap screen.
    """
    return jsonify({"zones": get_live_zones(), "timestamp": time.time()})


@app.route('/api/concessions', methods=['GET'])
def get_concessions():
    """
    All concession stands with live wait times.
    Optional query param: ?food=burgers&accessible=true
    Used by the React Native app explore/menu screen.
    """
    food_filter  = request.args.get("food", "")
    accessible   = request.args.get("accessible", "false").lower() == "true"
    stands       = get_live_concessions()

    if food_filter:
        stands = [s for s in stands if food_filter in s.get("menuCategories", [])]
    if accessible:
        stands = [s for s in stands if s.get("stepFreeAccess")]

    return jsonify({"concessions": stands, "timestamp": time.time()})


@app.route('/api/route', methods=['GET'])
def get_route():
    """
    PALO optimal routing result.
    Query params: ?food=burgers&accessible=false
    Returns top 3 ranked stands with full scoring breakdown.
    Used by the React Native app after AI concierge triggers routing.
    """
    food_type  = request.args.get("food", None)
    accessible = request.args.get("accessible", "false").lower() == "true"
    concessions = get_live_concessions()
    results     = palo_optimize(food_type=food_type, accessible=accessible, concessions=concessions)

    return jsonify({
        "results":   results[:3],
        "algorithm": "PALO v1",
        "timestamp": time.time()
    })


@app.route('/api/order', methods=['POST'])
def place_order_api():
    """
    Place an order from the React Native app.
    Body: { "vendor_id": "vendor_south_3", "item": "Burger", "user_seat": "215" }
    """
    data      = request.json or {}
    vendor_id = data.get("vendor_id")
    item      = data.get("item", "Unknown item")
    user_seat = data.get("user_seat", "Unknown")

    if not vendor_id:
        return jsonify({"error": "vendor_id is required"}), 400

    order_id  = f"ORD-{int(time.time() * 1000) % 100000}"
    new_order = {
        "id":        order_id,
        "item":      item,
        "user":      f"Seat {user_seat}",
        "status":    "pending",
        "timestamp": time.time(),
    }

    # Write to in-memory store (Firestore in production)
    if vendor_id not in _orders_store:
        _orders_store[vendor_id] = []
    _orders_store[vendor_id].append(new_order)

    if FIREBASE_ENABLED:
        try:
            db.collection("Events").document("event_123").collection("Orders").document(order_id).set(new_order)
        except Exception as ex:
            print(f"[Order] Firestore write failed: {ex}")

    return jsonify({"success": True, "order_id": order_id, "message": f"Order placed at {vendor_id}!"})


# ─────────────────────────────────────────────
# ── GEMINI CONCIERGE ──
# ─────────────────────────────────────────────
import google.generativeai as genai
from PIL import Image

GENAI_API_KEY = os.getenv("GEMINI_API_KEY", "")
chat_session  = None

if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            tools=[get_optimal_route := lambda food_category: f"Triggered routing for {food_category}",
                   place_order_tool := lambda stand_id, item: f"Triggered order for {item} at {stand_id}"],
            system_instruction=(
                "You are the SwiftSeat Stadium Concierge. Be concise and friendly. "
                "Use get_optimal_route for food requests, place_order to confirm orders."
            )
        )
        chat_session = model.start_chat()
        print("[Gemini] Model initialized ✓")
    except Exception as e:
        print(f"[Gemini] Failed to init model: {e}")
else:
    print("[Gemini] No API key — mock mode active.")


@app.route('/api/chat', methods=['POST'])
def chat():
    data          = request.json or {}
    user_message  = data.get("message", "")
    image_b64     = data.get("image", None)

    if not user_message and not image_b64:
        return jsonify({"error": "Empty message"}), 400

    if not chat_session:
        return _mock_chat(user_message, image_b64)

    try:
        payload = []
        if user_message:
            payload.append(user_message)
        if image_b64:
            img_data = image_b64.split(",")[1] if "," in image_b64 else image_b64
            img      = Image.open(BytesIO(base64.b64decode(img_data)))
            payload.append(img)

        response = chat_session.send_message(payload)

        if hasattr(response, "function_call") and response.function_call:
            fn   = response.function_call
            args = {k: v for k, v in fn.args.items()}
            return jsonify({"type": "function_call", "function": fn.name, "arguments": args,
                            "reply": "Checking live routes for you right now…"})
        return jsonify({"type": "text", "reply": response.text})

    except Exception as e:
        print("[Gemini] Error:", e)
        return jsonify({"error": str(e)}), 500


def _mock_chat(msg, img=None):
    lower = (msg or "").lower()
    if img:
        return jsonify({"type": "function_call", "function": "get_optimal_route",
                        "arguments": {"food_category": "food"},
                        "reply": "(Mock Vision) Photo analyzed — routing you from your detected location."})
    if any(w in lower for w in ["hungry", "burger", "food", "eat", "snack", "drink"]):
        food = ("burgers" if "burger" in lower else
                "snacks"  if "snack"  in lower else
                "drinks"  if "drink"  in lower else None)
        return jsonify({"type": "function_call", "function": "get_optimal_route",
                        "arguments": {"food_category": food or "food"},
                        "reply": "(Mock) Calculating the fastest stand using PALO…"})
    if "order" in lower or "confirm" in lower:
        return jsonify({"type": "function_call", "function": "place_order",
                        "arguments": {"stand_id": "vendor_south_3", "item": "your item"},
                        "reply": "(Mock) Placing your order and generating a Google Wallet pass!"})
    return jsonify({"type": "text",
                    "reply": "(Mock) Hi! Tell me what food you want and I'll find the fastest stand for you."})


# ─────────────────────────────────────────────
# ── ADMIN DASHBOARD ENDPOINTS ──
# ─────────────────────────────────────────────

@app.route('/api/admin/nodes', methods=['GET'])
def get_admin_nodes():
    """
    Returns all hardware IoT nodes with full telemetry:
    - Zone nodes: thermal grid, average temp, hot spot count, camera status
    - Vendor nodes: queue length, wait time, trend, camera status
    """
    nodes = get_live_nodes()
    return jsonify({"nodes": nodes, "timestamp": time.time()})


@app.route('/api/admin/nodes/<node_id>', methods=['GET'])
def get_admin_node_detail(node_id):
    """Detailed snapshot for a single node."""
    nodes = get_live_nodes()
    node  = next((n for n in nodes if n["id"] == node_id), None)
    if not node:
        return jsonify({"error": "Node not found"}), 404
    return jsonify(node)


@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    """
    System-wide vitals for the Admin Dashboard header bar.
    """
    nodes  = get_live_nodes()
    zones  = get_live_zones()
    stands = get_live_concessions()

    online_nodes  = sum(1 for n in nodes  if n.get("status") == "online")
    cameras_ok    = sum(1 for n in nodes  if n.get("cameraStatus") == "online")
    critical_zones = sum(1 for z in zones  if z.get("status") == "CRITICAL")
    avg_density   = round(sum(z.get("currentDensity", 0) for z in zones) / max(len(zones), 1), 2)
    best_wait     = min((s.get("estimatedWaitTime", 9999) for s in stands), default=0)

    return jsonify({
        "totalNodes":    len(nodes),
        "onlineNodes":   online_nodes,
        "offlineNodes":  len(nodes) - online_nodes,
        "camerasOnline": cameras_ok,
        "criticalZones": critical_zones,
        "avgDensity":    avg_density,
        "bestWaitSecs":  best_wait,
        "timestamp":     time.time(),
    })


@app.route('/api/admin/nodes/<node_id>/config', methods=['POST'])
def update_node_config(node_id):
    """
    Update a node's configuration (e.g., density threshold).
    Body: { "densityThreshold": 3.5, "alertEnabled": true }
    """
    data = request.json or {}
    if FIREBASE_ENABLED:
        try:
            db.collection("Admin").document("Hardware").collection("Nodes").document(node_id).set(
                {"config": data}, merge=True
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"success": True, "node_id": node_id, "config": data})


# ─────────────────────────────────────────────
# ── VENDOR DASHBOARD ENDPOINTS ──
# ─────────────────────────────────────────────

@app.route('/api/vendor/<vendor_id>', methods=['GET'])
def get_vendor_stats(vendor_id):
    """
    Returns a vendor's live stats: queue length, wait time, trend, today's order count.
    """
    stands  = get_live_concessions()
    stand   = next((s for s in stands if s["id"] == vendor_id), None)

    if not stand:
        return jsonify({"error": "Vendor not found"}), 404

    pending_orders = [o for o in _orders_store.get(vendor_id, []) if o.get("status") == "pending"]

    return jsonify({
        **stand,
        "pendingOrderCount": len(pending_orders),
        "timestamp":         time.time(),
    })


@app.route('/api/vendor/<vendor_id>/orders', methods=['GET'])
def get_vendor_orders(vendor_id):
    """
    Returns all pending orders for a vendor (shown on the Vendor Dashboard tablet).
    """
    orders = _orders_store.get(vendor_id, [])
    return jsonify({"vendor_id": vendor_id, "orders": orders, "timestamp": time.time()})


@app.route('/api/vendor/<vendor_id>/orders/<order_id>/complete', methods=['POST'])
def complete_order(vendor_id, order_id):
    """
    Mark an order as completed (vendor taps 'Done' on their tablet).
    """
    orders = _orders_store.get(vendor_id, [])
    for order in orders:
        if order["id"] == order_id:
            order["status"]      = "completed"
            order["completedAt"] = time.time()

            if FIREBASE_ENABLED:
                try:
                    db.collection("Events").document("event_123").collection("Orders").document(order_id).update(
                        {"status": "completed", "completedAt": time.time()}
                    )
                except Exception:
                    pass

            return jsonify({"success": True, "order_id": order_id})

    return jsonify({"error": "Order not found"}), 404


@app.route('/api/vendor/<vendor_id>/wait-time', methods=['POST'])
def override_wait_time(vendor_id):
    """
    Vendor manually overrides the estimated wait time (useful when sensor is off).
    Body: { "waitTime": 120 }  (seconds)
    """
    data     = request.json or {}
    new_wait = data.get("waitTime")

    if new_wait is None:
        return jsonify({"error": "waitTime is required"}), 400

    stand = next((s for s in MOCK_CONCESSIONS if s["id"] == vendor_id), None)
    if stand:
        stand["estimatedWaitTime"] = int(new_wait)

    if FIREBASE_ENABLED:
        try:
            db.collection("Events").document("event_123").collection("Concessions").document(vendor_id).set(
                {"estimatedWaitTime": int(new_wait), "source": "manual_override"}, merge=True
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"success": True, "vendor_id": vendor_id, "newWaitTime": new_wait})


# ─────────────────────────────────────────────
# ENTRYPOINT
# ─────────────────────────────────────────────
if __name__ == '__main__':
    print("\n SwiftSeat Backend v3")
    print(" ─────────────────────────────────")
    print("  Chat API:       POST /api/chat")
    print("  Zones:          GET  /api/zones")
    print("  Concessions:    GET  /api/concessions")
    print("  PALO Route:     GET  /api/route")
    print("  Place Order:    POST /api/order")
    print("  Admin Nodes:    GET  /api/admin/nodes")
    print("  Admin Stats:    GET  /api/admin/stats")
    print("  Vendor Stats:   GET  /api/vendor/<id>")
    print("  Vendor Orders:  GET  /api/vendor/<id>/orders")
    print(" ─────────────────────────────────\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
