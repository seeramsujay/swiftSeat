import time
import random
import json
import os

# Try to import firebase_admin, but gracefully handle missing package for immediate hackathon execution
try:
    import firebase_admin
    from firebase_admin import credentials
    from firebase_admin import firestore
    FIREBASE_ENABLED = True
except ImportError:
    FIREBASE_ENABLED = False
    print("WARNING: firebase_admin not installed or no keys. Running in local dry-run mode.")

class MockGenerator:
    def __init__(self, event_id="event_123"):
        self.event_id = event_id
        self.db = None
        if FIREBASE_ENABLED:
            try:
                # Load from default credentials if set in environment, or use specific service account path inside `keys/`
                cred = credentials.Certificate('keys/serviceAccountKey.json') if os.path.exists('keys/serviceAccountKey.json') else credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                print("Connected to Firestore.")
            except Exception as e:
                print(f"Failed to connect to Firestore: {e}")
                self.db = None

        # Base wait times to simulate trend changes
        self.concessions = {
            "vendor_north_7": {"name": "North Grill", "wait": 180, "trend": 0},
            "vendor_south_3": {"name": "South Kiosk", "wait": 60, "trend": 0}
        }

    def generate_zone_density(self, zone_id, base_density):
        # Fluctuate density by up to +/- 1.0 p/m^2
        noise = random.uniform(-0.5, 1.0)
        density = max(0.0, base_density + noise)
        
        status = "SAFE"
        if density >= 4.0:
            status = "CRITICAL"
        elif density >= 2.5:
            status = "WARNING"
            
        data = {
            "currentDensity": round(density, 2),
            "status": status,
            "trend": round(noise, 2),
            "timestamp": time.time()
        }
        return data

    def generate_concession_wait(self, vendor_id, time_step):
        # Simulate halftime rush approaching (e.g., at time_step 10, queue explodes)
        stand = self.concessions[vendor_id]
        
        # Artificial trend injection to simulate halftime
        if time_step > 5 and vendor_id == "vendor_north_7":
            stand['trend'] = random.uniform(2.0, 5.0) # wait increasing rapidly
        elif time_step > 5 and vendor_id == "vendor_south_3":
            stand['trend'] = random.uniform(-1.0, 1.0) # stable or dropping

        stand['wait'] += int(stand['trend'] * 15) # update wait time based on trend
        stand['wait'] = max(0, stand['wait']) # Clamp above 0
        
        data = {
            "estimatedWaitTime": stand['wait'],
            "waitTrend": round(stand['trend'], 2),
            "lastUpdated": time.time()
        }
        return data

    def publish(self):
        print("Starting mock telemetry stream. Press Ctrl+C to stop.")
        step = 0
        try:
            while True:
                step += 1
                
                z_n1 = self.generate_zone_density("zone_north_1", 2.0)
                z_s1 = self.generate_zone_density("zone_south_1", 1.0)
                
                c_n7 = self.generate_concession_wait("vendor_north_7", step)
                c_s3 = self.generate_concession_wait("vendor_south_3", step)
                
                if self.db:
                    # Write to Firestore
                    batch = self.db.batch()
                    events_ref = self.db.collection('Events').document(self.event_id)
                    
                    batch.set(events_ref.collection('Zones').document('zone_north_1'), z_n1)
                    batch.set(events_ref.collection('Zones').document('zone_south_1'), z_s1)
                    
                    batch.set(events_ref.collection('Concessions').document('vendor_north_7'), c_n7)
                    batch.set(events_ref.collection('Concessions').document('vendor_south_3'), c_s3)
                    
                    batch.commit()
                    print(f"[{step}] Published to Firestore.")
                else:
                    # Dry Run Mode output
                    print(f"\n--- STEP {step} ---")
                    print(f"Zones: N1={z_n1['status']} ({z_n1['currentDensity']}), S1={z_s1['status']} ({z_s1['currentDensity']})")
                    print(f"Concessions: N7={c_n7['estimatedWaitTime']}s (Trend {c_n7['waitTrend']}), S3={c_s3['estimatedWaitTime']}s (Trend {c_s3['waitTrend']})")
                
                time.sleep(3) # Wait 3 seconds before next telemetry ping
                
        except KeyboardInterrupt:
            print("\nStopped mock generator.")

if __name__ == "__main__":
    generator = MockGenerator()
    generator.publish()
