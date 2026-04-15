#include <WiFi.h>
#include <PubSubClient.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com"; // Change to your local broker IP if using Mosquitto
const int mqtt_port = 1883;

// --- Node Identification ---
// Change this ID for each deployed node (e.g., zone_north_1, zone_south_2, vendor_north_7)
const char* node_id = "zone_north_1"; 
const char* node_type = "thermal"; // Or "wait_time" for concession stands

// --- Topics ---
// Pattern: swiftseat/nodes/{node_id}/telemetry
char publish_topic[100];

// --- Sensor Pins (Simulation) ---
const int PIR_PIN = 14; 
int current_count = 0;

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "SwiftSeat-Node-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  
  // Format the topic string
  sprintf(publish_topic, "swiftseat/nodes/%s/telemetry", node_id);
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // --- Simulate Sensor Logic ---
  // In a real scenario, this would trigger on PIR interrupts or camera outputs
  bool motion_detected = digitalRead(PIR_PIN);
  
  // For demo, we just randomly fluctuate the density count every 5 seconds
  long r = random(-2, 3); 
  current_count = constrain(current_count + r, 0, 25);
  
  // Create JSON Payload
  // Example for density: {"type": "density", "count": 14}
  // Example for wait time: {"type": "wait_time", "time_sec": 120}
  
  char payload[512];
  if (strcmp(node_type, "thermal") == 0) {
    // Generate a mock 8x8 thermal grid
    String grid = "[";
    for(int i=0; i<64; i++) {
        // base temp 22.0, hot spots 32.0+
        float temp = 22.0 + (random(0, 100) > 80 ? random(10, 15) : random(0, 3));
        grid += String(temp, 1);
        if(i < 63) grid += ",";
    }
    grid += "]";
    // camera status simulates checking TP-Link VIGI api
    sprintf(payload, "{\"type\": \"thermal\", \"camera_status\": \"online\", \"grid\": %s}", grid.c_str());
  } else {
    // wait time
    int queue_len = current_count;
    sprintf(payload, "{\"type\": \"wait_time\", \"camera_status\": \"online\", \"queue_length\": %d, \"time_sec\": %d}", queue_len, current_count * 10);
  }
  
  Serial.print("Publishing to ");
  Serial.print(publish_topic);
  Serial.print(": ");
  Serial.println(payload);
  
  client.publish(publish_topic, payload);
  
  // Heartbeat / publish interval
  delay(5000); 
}
