// SwiftSeat App Logic

// Example configuration - replace with your Firebase project config when ready
const firebaseConfig = {
  // apiKey: "YOUR_API_KEY",
  // authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_PROJECT_ID.appspot.com",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId: "YOUR_APP_ID"
};

// Initialize Firebase only if config is provided
let db = null;
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("Firebase initialized.");
  setupRealtimeListeners();
} else {
  console.warn("Firebase config missing. Running in mock offline mode.");
  simulateRealtimeUpdates(); // Setup fake data generation for the demo scaffold
}

// -----------------------------------------------------
// 1. Core Logic: PALO Routing Engine Implementation
// -----------------------------------------------------
function paloOptimize(userLocation, foodType, accessible, concessions, routeMatrix, routingLog) {
  const ALPHA = 30; // seconds penalty per active routing
  
  let candidates = concessions;
  if (foodType) {
    candidates = candidates.filter(c => c.menuCategories.includes(foodType));
  }
  if (accessible) {
    // In a real implementation this would check stepFreeAccess capability
    candidates = candidates.filter(c => c.stepFreeAccess === true);
  }
  
  const scored = candidates.map(stand => {
    const walkSeconds = routeMatrix[stand.id] ? routeMatrix[stand.id].durationSeconds : 120; // Default 2 mins if unspecified
    
    // Predict wait at arrival
    const waitNow = stand.estimatedWaitTime; 
    const waitTrend = stand.waitTrend || 0;  // seconds per minute change
    const walkMinutes = walkSeconds / 60;
    
    // Ensure wait time isn't predicted as below zero
    const predictedWait = Math.max(0, waitNow + (waitTrend * walkMinutes));
    
    // Load balancing penalty
    const activeRoutings = routingLog.filter(
      log => log.stand_id === stand.id && log.expires_at > Date.now()
    ).length;
    const loadPenalty = ALPHA * activeRoutings;
    
    const score = walkSeconds + predictedWait + loadPenalty;
    
    return {
      ...stand,
      walkSeconds,
      predictedWait: Math.round(predictedWait),
      activeRoutings,
      loadPenalty,
      score: Math.round(score)
    };
  });
  
  // Rank by lowest PALO score
  scored.sort((a, b) => a.score - b.score);
  return scored;
}

// -----------------------------------------------------
// 2. Heatmap UI logic 
// -----------------------------------------------------
function updateZoneColor(zoneId, density, status) {
  const svgObj = document.getElementById("stadium-svg");
  if (!svgObj || !svgObj.contentDocument) return;
  
  const svgDoc = svgObj.contentDocument;
  const zoneEl = svgDoc.getElementById(zoneId);
  if (!zoneEl) return;
  
  // Clear existing status classes
  zoneEl.classList.remove('zone-safe', 'zone-warning', 'zone-critical');
  
  if (status === 'CRITICAL') {
    zoneEl.classList.add('zone-critical');
    checkEmergencyThreshold(zoneId);
  } else if (status === 'WARNING') {
    zoneEl.classList.add('zone-warning');
  } else {
    zoneEl.classList.add('zone-safe');
  }
}

function checkEmergencyThreshold(zoneId) {
  // If the user's current assumed zone is critical, show emergency mode
  // Example hardcoded trigger logic for demonstration:
  document.getElementById('emergency-mode').classList.remove('hidden');
}


// -----------------------------------------------------
// 3. UI Interactions & Chat
// -----------------------------------------------------
document.getElementById('toggle-contrast').addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
});

// Trigger hidden file input
document.getElementById('btn-camera').addEventListener('click', () => {
  document.getElementById('camera-input').click();
});

let currentImageB64 = null;

// Handle file selection
document.getElementById('camera-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    currentImageB64 = event.target.result;
    addChatMessage("📷 [Image attached for analysis]", "user");
  };
  reader.readAsDataURL(file);
});

document.getElementById('btn-send').addEventListener('click', async () => {
  const input = document.getElementById('chat-input').value;
  if (!input && !currentImageB64) return;
  
  if (input) {
    addChatMessage(input, 'user');
    document.getElementById('chat-input').value = '';
  }
  
  const payload = { message: input };
  if (currentImageB64) {
    payload.image = currentImageB64;
    currentImageB64 = null; // Clear after sending
  }

  try {
    addChatMessage("Analyzing context...", "system");
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.type === "text") {
      addChatMessage(data.reply, 'system');
    } else if (data.type === "function_call") {
      addChatMessage(data.reply, 'system');
      
      if (data.function === "get_optimal_route") {
        // Trigger PALO Simulation in UI
        setTimeout(() => {
          document.getElementById('routing-section').classList.remove('hidden');
          document.getElementById('route-details').innerHTML = `
            <p><strong>PALO Option 1 (Fastest Arrival):</strong> South Kiosk</p>
            <p>Walk: 4 mins | Predicted Wait: 2 mins | Score: 360</p>
            <button onclick="alert('Wallet pass pushed!')">Place Order via Wallet</button>
          `;
        }, 1000);
      } else if (data.function === "place_order") {
        addChatMessage("Successfully placed order and generated your Google Wallet pass!", "system");
      }
    }
  } catch (err) {
    console.error(err);
    addChatMessage("Error connecting to Gemini proxy. Is the python server running?", "system");
  }
});

function addChatMessage(text, sender) {
  const hist = document.getElementById('chat-history');
  const div = document.createElement('div');
  div.className = 'message ' + sender;
  div.innerText = text;
  hist.appendChild(div);
  hist.scrollTop = hist.scrollHeight;
}

// -----------------------------------------------------
// Support logic for Offline Mock Demo
// -----------------------------------------------------
function simulateRealtimeUpdates() {
  setInterval(() => {
    const statuses = ['SAFE', 'WARNING', 'CRITICAL'];
    const r1 = statuses[Math.floor(Math.random() * statuses.length)];
    const r2 = statuses[Math.floor(Math.random() * statuses.length)];
    
    updateZoneColor('zone_north_1', Math.random() * 5, r1);
    updateZoneColor('zone_south_1', Math.random() * 5, r2);
  }, 3000);
}

// -----------------------------------------------------
// Service Worker Registration
// -----------------------------------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
