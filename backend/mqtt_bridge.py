import time
import json
import os
import paho.mqtt.client as mqtt

# Try to import firebase_admin for database logging
try:
    import firebase_admin
    from firebase_admin import credentials
    from firebase_admin import firestore
    FIREBASE_ENABLED = True
except ImportError:
    FIREBASE_ENABLED = False
    print("WARNING: firebase_admin not installed. Running in dry-run mode (no database writes).")

# --- Configuration ---
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")  # Use a public one like 'broker.hivemq.com' if testing
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = "swiftseat/nodes/+/telemetry"
EVENT_ID = "event_123"

class SwiftSeatMQTTBridge:
    def __init__(self):
        self.db = None
        if FIREBASE_ENABLED:
            try:
                cred = credentials.Certificate('keys/serviceAccountKey.json') if os.path.exists('keys/serviceAccountKey.json') else credentials.ApplicationDefault()
                if not firebase_admin._apps:
                    firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                print("Connected to Firestore.")
            except Exception as e:
                print(f"Failed to connect to Firestore: {e}")
                self.db = None
        
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"Connected to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}!")
            # Subscribe to the hardware node telemetry topic wildcard
            self.client.subscribe(MQTT_TOPIC)
            print(f"Subscribed to topic: {MQTT_TOPIC}")
        else:
            print(f"Failed to connect to MQTT broker, return code {rc}")

    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            topic = msg.topic
            print(f"[{topic}] Received Data: {payload}")
            
            # Expected Topic Format: swiftseat/nodes/zone_north_1/telemetry
            parts = topic.split('/')
            if len(parts) >= 3:
                node_id = parts[2]
                self.process_and_store(node_id, payload)
        except json.JSONDecodeError:
            print(f"[{topic}] Received invalid JSON payload: {msg.payload}")
        except Exception as e:
            print(f"Error processing message: {e}")

    def process_and_store(self, node_id, payload):
        """
        Process the raw sensor payload and map it to our Firestore schema.
        We expect hardware to send: {"type": "density", "count": 14} or {"type": "wait_time", "time_sec": 120}
        """
        if not self.db:
            print(f"(Dry Run) Processed {node_id} payload: {payload}")
            return

        sensor_type = payload.get("type", "unknown")
        
        try:
            events_ref = self.db.collection('Events').document(EVENT_ID)
            
            # Write node-specific telemetry to Admin bucket
            admin_node_ref = self.db.collection('Admin').document('Hardware').collection('Nodes').document(node_id)
            admin_node_ref.set({
                "lastSeen": time.time(),
                "status": "online",
                "cameraStatus": payload.get("camera_status", "offline"),
                "sensorType": sensor_type,
                "latestPayload": payload
            }, merge=True)
            
            if sensor_type == "thermal":
                # Using 8x8 AMG8833 Thermal Array or a dummy array of temperatures
                thermal_grid = payload.get("grid", [])
                
                # Derive density from heat signatures (>30C)
                hot_spots = sum(1 for temp in thermal_grid if temp > 30.0)
                # mock formula: each distinct hotspot equates to approx 2 people
                density = min(5.0, max(0.0, hot_spots * 0.4))
                
                status = "SAFE"
                if density >= 4.0:
                    status = "CRITICAL"
                elif density >= 2.5:
                    status = "WARNING"
                
                doc_ref = events_ref.collection('Zones').document(node_id)
                doc_ref.set({
                    "currentDensity": round(density, 2),
                    "status": status,
                    "lastUpdated": time.time(),
                    "source": "mqtt_thermal"
                }, merge=True)
                print(f" -> Thermal processed for Zone {node_id}. Hotspots: {hot_spots}, Calc Density: {round(density, 2)}")
                
            elif sensor_type == "wait_time":
                wait_sec = payload.get("time_sec", 0)
                doc_ref = events_ref.collection('Concessions').document(node_id)
                doc_ref.set({
                    "estimatedWaitTime": wait_sec,
                    "lastUpdated": time.time(),
                    "queueLength": payload.get("queue_length", 0),
                    "source": "mqtt_hardware"
                }, merge=True)
                print(f" -> Updated Concession {node_id} to wait time {wait_sec}s")
            
        except Exception as e:
            print(f"Firestore update failed: {e}")

    def start(self):
        try:
            print(f"Connecting to MQTT broker at {MQTT_BROKER}...")
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_forever()
        except KeyboardInterrupt:
            print("\nShutting down bridge...")
            self.client.disconnect()
        except Exception as e:
            print(f"MQTT Error: {e}")

if __name__ == "__main__":
    bridge = SwiftSeatMQTTBridge()
    bridge.start()
