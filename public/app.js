/* =========================================================
   SwiftSeat — App Logic v2
   PALO Engine · Gemini Concierge · Heatmap · UI Framework
   ========================================================= */

'use strict';

// =========================================================
// 0. CONFIG
// =========================================================

const BACKEND_URL = 'http://localhost:5000';

/**
 * Firebase config — fill in your project details here.
 * If left empty, the app enters offline simulation mode.
 */
const firebaseConfig = {
  // apiKey:            "YOUR_API_KEY",
  // authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  // projectId:         "YOUR_PROJECT_ID",
  // storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId:             "YOUR_APP_ID"
};

// =========================================================
// 1. FIREBASE INIT
// =========================================================

let db = null;

try {
  if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    setConnectionStatus(true);
    setupRealtimeListeners();
  } else {
    setConnectionStatus(false);
    simulateRealtimeUpdates();
  }
} catch (e) {
  console.warn('[Firebase] Init failed:', e);
  setConnectionStatus(false);
  simulateRealtimeUpdates();
}

// =========================================================
// 2. MOCK DATA
// =========================================================

const MOCK_CONCESSIONS = [
  {
    id: 'vendor_north_7',
    name: 'North Grill',
    menuCategories: ['burgers', 'drinks'],
    stepFreeAccess: false,
    estimatedWaitTime: 480,
    waitTrend: 4.0,
    icon: '🍔',
  },
  {
    id: 'vendor_south_3',
    name: 'South Kiosk',
    menuCategories: ['burgers', 'snacks', 'drinks'],
    stepFreeAccess: true,
    estimatedWaitTime: 90,
    waitTrend: -0.5,
    icon: '🥤',
  },
  {
    id: 'vendor_east_2',
    name: 'East Café',
    menuCategories: ['snacks', 'drinks'],
    stepFreeAccess: true,
    estimatedWaitTime: 240,
    waitTrend: 1.0,
    icon: '🍿',
  },
];

const MOCK_ROUTE_MATRIX = {
  vendor_north_7: { durationSeconds: 120 },
  vendor_south_3: { durationSeconds: 240 },
  vendor_east_2:  { durationSeconds: 180 },
};

// In-memory routing log for load-balancing (mimics Firestore RoutingLog)
const localRoutingLog = [];

// =========================================================
// 3. PALO SCORING ENGINE
// =========================================================

/**
 * PALO: Predictive Arrival-time, Load-balanced Optimization
 *
 * @param {string|null} foodType  - food category filter, or null for all
 * @param {boolean}      accessible - whether to filter for step-free routes
 * @param {Array}        concessions - array of concession stand documents
 * @param {Object}       routeMatrix - map of stand_id → { durationSeconds }
 * @param {Array}        routingLog  - recent routing log entries
 * @returns {Array} ranked stands with scoring breakdown
 */
function paloOptimize(foodType, accessible, concessions, routeMatrix, routingLog) {
  const ALPHA = 30; // seconds penalty per active routing

  // Step 4: Pre-filter
  let candidates = [...concessions];
  if (foodType && foodType !== '') {
    candidates = candidates.filter(c => c.menuCategories?.includes(foodType));
  }
  if (accessible) {
    candidates = candidates.filter(c => c.stepFreeAccess === true);
  }

  const now = Date.now();

  // Step 1-3: Score each candidate
  const scored = candidates.map(stand => {
    const walkSeconds    = routeMatrix[stand.id]?.durationSeconds ?? 180;
    const waitNow        = stand.estimatedWaitTime ?? 180;
    const waitTrend      = stand.waitTrend ?? 0;
    const walkMins       = walkSeconds / 60;

    // Predicted wait when user arrives
    const predictedWait = Math.max(0, waitNow + waitTrend * walkMins);

    // Load-balancing penalty (active routings to this stand in last 10 min)
    const activeRoutings = routingLog.filter(
      l => l.stand_id === stand.id && l.expires_at > now
    ).length;
    const loadPenalty = ALPHA * activeRoutings;

    // Composite PALO score (lower = better)
    const score = walkSeconds + predictedWait + loadPenalty;

    return {
      ...stand,
      walkSeconds,
      walkMins: Math.round(walkSeconds / 60),
      predictedWait: Math.round(predictedWait),
      predictedWaitMins: Math.round(predictedWait / 60),
      activeRoutings,
      loadPenalty: Math.round(loadPenalty),
      score: Math.round(score),
      totalMins: Math.round(score / 60),
    };
  });

  // Step 5: Rank (lower score = better)
  scored.sort((a, b) => a.score - b.score);
  return scored;
}

// =========================================================
// 4. PANEL / NAVIGATION
// =========================================================

const allPanels = document.querySelectorAll('.panel');
const sidebarNavItems = document.querySelectorAll('.nav-item');
const mobileNavItems  = document.querySelectorAll('.mnav-item');

function switchPanel(panelId) {
  allPanels.forEach(p => p.classList.remove('active'));
  const target = document.getElementById(panelId);
  if (target) target.classList.add('active');

  // Update sidebar active state
  sidebarNavItems.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === panelId);
    btn.setAttribute('aria-current', btn.dataset.panel === panelId ? 'page' : 'false');
  });
  // Update mobile nav active state
  mobileNavItems.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === panelId);
  });
}

// Sidebar nav
sidebarNavItems.forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

// Mobile nav
mobileNavItems.forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

// =========================================================
// 5. CHAT PANEL — GEMINI CONCIERGE
// =========================================================

let currentImageB64 = null;
let thinkingCounter = 0;

// Quick-pick chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const prompt = chip.dataset.prompt;
    if (!prompt) return;
    document.getElementById('chat-input').value = prompt;
    document.getElementById('btn-send').click();
  });
});

// Camera button
document.getElementById('btn-camera').addEventListener('click', () => {
  document.getElementById('camera-input').click();
});

// File selected
document.getElementById('camera-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    currentImageB64 = ev.target.result;
    document.getElementById('image-preview-thumb').src = currentImageB64;
    document.getElementById('image-preview-bar').classList.remove('hidden');
    showToast('📷 Image attached — hit Send');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

// Clear image
document.getElementById('btn-clear-image').addEventListener('click', () => {
  currentImageB64 = null;
  document.getElementById('image-preview-bar').classList.add('hidden');
  document.getElementById('image-preview-thumb').src = '';
});

// Enter key submits
document.getElementById('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('btn-send').click();
  }
});

// Route card close button
document.getElementById('route-close').addEventListener('click', () => {
  document.getElementById('route-card').classList.add('hidden');
});

// ── Send message ──
document.getElementById('btn-send').addEventListener('click', async () => {
  const inputEl = document.getElementById('chat-input');
  const text    = inputEl.value.trim();
  if (!text && !currentImageB64) return;

  if (text) {
    addMessage(text, 'user');
    inputEl.value = '';
  }
  if (currentImageB64) {
    addMessage('📷 Photo sent for visual analysis', 'user');
    document.getElementById('image-preview-bar').classList.add('hidden');
  }

  const payload = { message: text };
  if (currentImageB64) {
    payload.image = currentImageB64;
    currentImageB64 = null;
  }

  const thinkingId = addThinking();
  setGeminiStatus('Analyzing…');
  document.getElementById('btn-send').disabled = true;

  try {
    const res  = await fetch(`${BACKEND_URL}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    removeThinking(thinkingId);

    if (data.type === 'text') {
      addMessage(data.reply, 'ai');
    } else if (data.type === 'function_call') {
      addMessage(data.reply, 'ai');
      if (data.function === 'get_optimal_route') {
        const foodCat = data.arguments?.food_category ?? null;
        const results = paloOptimize(foodCat, false, MOCK_CONCESSIONS, MOCK_ROUTE_MATRIX, localRoutingLog);
        renderRouteCard(results);
        logRouting(results[0]?.id);
      } else if (data.function === 'place_order') {
        const standName = data.arguments?.stand_id ?? 'the stand';
        addMessage(`✅ Order placed at <strong>${standName}</strong>! Your Google Wallet pass is being generated. Head over now — the queue is short! 🎉`, 'ai');
        showToast('🎟 Wallet pass generated!');
        document.getElementById('route-card').classList.add('hidden');
      }
    }
  } catch (err) {
    removeThinking(thinkingId);
    addMessage(
      '⚡ <strong>Proxy offline.</strong> Make sure <code>python server.py</code> is running on port 5000. Falling back to mock mode…',
      'ai'
    );
    // Fallback: try mock logic locally
    handleOfflineFallback(text, payload.image);
  } finally {
    setGeminiStatus('Ready to help');
    document.getElementById('btn-send').disabled = false;
    document.getElementById('chat-input').focus();
  }
});

/** Offline fallback — mimic the mock chat server locally */
function handleOfflineFallback(msg, img) {
  const lower = (msg || '').toLowerCase();
  if (img) {
    addMessage('(Mock Vision) Analyzing your photo… routing you from your detected position.', 'ai');
    const results = paloOptimize('food', false, MOCK_CONCESSIONS, MOCK_ROUTE_MATRIX, localRoutingLog);
    renderRouteCard(results);
  } else if (/hungry|burger|food|snack|drink/.test(lower)) {
    const food = lower.includes('burger') ? 'burgers'
               : lower.includes('snack')  ? 'snacks'
               : lower.includes('drink')  ? 'drinks' : null;
    addMessage(`(Mock) Calculating the fastest ${food || 'food'} stand for you using PALO…`, 'ai');
    const results = paloOptimize(food, false, MOCK_CONCESSIONS, MOCK_ROUTE_MATRIX, localRoutingLog);
    renderRouteCard(results);
    logRouting(results[0]?.id);
  } else if (/order|confirm|yes/.test(lower)) {
    addMessage('(Mock) ✅ Order placed! Google Wallet pass incoming. 🎟', 'ai');
    showToast('🎟 Mock wallet pass generated!');
  } else {
    addMessage('(Mock) Hi! Tell me what food you want — like <em>"I want a burger"</em> — and I\'ll route you to the fastest stand.', 'ai');
  }
}

// ── Message DOM helpers ──
function addMessage(html, sender = 'ai') {
  const hist = document.getElementById('chat-history');

  const row = document.createElement('div');
  row.className = `msg-row ${sender}`;
  row.setAttribute('role', 'listitem');

  if (sender === 'ai') {
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar ai-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'G';
    row.appendChild(avatar);
  } else {
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar user-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = '👤';
    row.appendChild(avatar);
  }

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${sender === 'ai' ? 'ai-bubble' : 'user-bubble'}`;
  bubble.innerHTML = `<p>${html}</p>`;
  content.appendChild(bubble);
  row.appendChild(content);

  hist.appendChild(row);
  hist.scrollTop = hist.scrollHeight;
  return row;
}

function addThinking() {
  const id   = ++thinkingCounter;
  const hist = document.getElementById('chat-history');

  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.dataset.thinkingId = id;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar ai-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = 'G';
  row.appendChild(avatar);

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble ai-bubble thinking-dots';
  bubble.setAttribute('aria-label', 'Gemini is thinking…');
  bubble.innerHTML = '<span></span><span></span><span></span>';
  content.appendChild(bubble);
  row.appendChild(content);

  hist.appendChild(row);
  hist.scrollTop = hist.scrollHeight;
  return id;
}

function removeThinking(id) {
  const el = document.querySelector(`[data-thinking-id="${id}"]`);
  if (el) el.remove();
}

// =========================================================
// 6. ROUTE CARD (Chat panel)
// =========================================================

function renderRouteCard(results) {
  const card       = document.getElementById('route-card');
  const details    = document.getElementById('route-details');
  const scoreLabel = document.getElementById('route-score-label');

  if (!results || results.length === 0) {
    card.classList.add('hidden');
    addMessage('No concession stands found matching your criteria. Try a different food type.', 'ai');
    return;
  }

  const best = results[0];
  const alts = results.slice(1, 3);

  scoreLabel.textContent = `Best: ${best.totalMins} min total`;

  let html = '';
  [best, ...alts].forEach((stand, i) => {
    const rankClass  = i === 0 ? 'best' : 'alt';
    const scoreClass = i === 0 ? 'best' : 'alt';
    const trendIcon  = stand.waitTrend > 0 ? '📈' : stand.waitTrend < 0 ? '📉' : '➡️';
    html += `
      <div class="route-option">
        <div>
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
            <span class="route-option-rank ${rankClass}">${i === 0 ? '✓' : i + 1}</span>
            <span class="route-option-name">${stand.icon ?? '🍽️'} ${stand.name}</span>
            ${stand.stepFreeAccess ? '<span style="font-size:11px;color:var(--text-2)">♿</span>' : ''}
          </div>
          <div class="route-option-meta">
            <span class="route-meta-badge">🚶 ${stand.walkMins}m walk</span>
            <span class="route-meta-badge">⏱ ~${stand.predictedWaitMins}m wait</span>
            <span class="route-meta-badge">${trendIcon} ${stand.waitTrend > 0 ? 'Rising' : stand.waitTrend < 0 ? 'Dropping' : 'Stable'}</span>
          </div>
        </div>
        <span class="route-score-chip ${scoreClass}">${stand.totalMins} min</span>
      </div>`;
  });

  html += `
    <button class="btn-order" id="btn-confirm-order"
      data-stand="${best.id}" data-stand-name="${best.name}">
      🛒 Order from ${best.name} · via Google Wallet
    </button>`;

  details.innerHTML = html;
  card.classList.remove('hidden');

  document.getElementById('btn-confirm-order')?.addEventListener('click', handleOrderConfirm);

  // Sync best wait to stats panel
  const waitEl = document.querySelector('#stat-wait .stat-val');
  if (waitEl) waitEl.textContent = `${best.totalMins}`;
}

function handleOrderConfirm(e) {
  const standName = e.currentTarget.dataset.standName;
  addMessage(`✅ Order placed at <strong>${standName}</strong>! Your Google Wallet pass is ready. Head over now — queue is short! 🎉`, 'ai');
  showToast('🎟 Wallet pass generated!');
  document.getElementById('route-card').classList.add('hidden');
  logRouting(e.currentTarget.dataset.stand);
}

function logRouting(standId) {
  if (!standId) return;
  localRoutingLog.push({
    stand_id:   standId,
    timestamp:  Date.now(),
    expires_at: Date.now() + 10 * 60 * 1000, // 10 minutes TTL
  });
}

// =========================================================
// 7. ROUTING PANEL
// =========================================================

let selectedFood = '';
let accessibleOnly = false;

// Filter chip clicks
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedFood = chip.dataset.food;
    runRoutingPanel();
  });
});

// Accessible toggle
document.getElementById('accessible-toggle').addEventListener('change', e => {
  accessibleOnly = e.target.checked;
  runRoutingPanel();
});

// "Calculate Best Routes" button
document.getElementById('btn-run-palo').addEventListener('click', () => {
  runRoutingPanel();
});

function runRoutingPanel() {
  const results = paloOptimize(selectedFood, accessibleOnly, MOCK_CONCESSIONS, MOCK_ROUTE_MATRIX, localRoutingLog);
  renderRoutingResults(results);
}

function renderRoutingResults(results) {
  const container = document.getElementById('routing-results');
  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="routing-placeholder">
        <div class="placeholder-icon">🔍</div>
        <p>No stands found for your current filters. Try removing accessibility or food type filters.</p>
      </div>`;
    return;
  }

  const rankClasses = ['r1', 'r2', 'r3'];
  const rankLabels  = ['#1', '#2', '#3'];

  container.innerHTML = results.slice(0, 3).map((stand, i) => {
    const trendIcon  = stand.waitTrend > 0 ? '📈' : stand.waitTrend < 0 ? '📉' : '➡️';
    const trendLabel = stand.waitTrend > 0 ? 'Queue growing' : stand.waitTrend < 0 ? 'Queue dropping' : 'Stable queue';
    const isFirst    = i === 0;
    return `
      <div class="result-card ${isFirst ? 'best-card' : ''}" role="article">
        <div class="result-card-rank ${rankClasses[i] ?? 'r3'}">${rankLabels[i] ?? `#${i+1}`}</div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="result-card-name">${stand.icon ?? '🍽️'} ${stand.name}</span>
            ${isFirst ? '<span class="best-badge">Best Pick</span>' : ''}
            ${stand.stepFreeAccess ? '<span style="font-size:11px;color:var(--text-2);font-weight:500">♿ Accessible</span>' : ''}
          </div>
          <div class="result-card-meta">
            <span class="result-meta-item">🚶 ${stand.walkMins}m walk</span>
            <span class="result-meta-item">⏱ ~${stand.predictedWaitMins}m wait on arrival</span>
            <span class="result-meta-item">${trendIcon} ${trendLabel}</span>
            ${stand.activeRoutings > 0 ? `<span class="result-meta-item">⚖️ ${stand.activeRoutings} routed recently</span>` : ''}
          </div>
        </div>
        <div class="result-card-score">
          <div class="score-number">${stand.totalMins}</div>
          <div class="score-unit">min total</div>
          ${isFirst ? `<div style="font-size:10px;color:var(--safe);margin-top:4px;font-weight:600">PALO ✓</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

// =========================================================
// 8. HEATMAP & LIVE STATS
// =========================================================

const zoneState = {};
let alertShown  = false;

function updateZoneColor(zoneId, density, status) {
  zoneState[zoneId] = { density, status };

  const svgEl = document.getElementById('stadium-svg');
  if (!svgEl) return;
  const svgDoc = svgEl.contentDocument;
  if (!svgDoc) return;

  const zone = svgDoc.getElementById(zoneId);
  if (!zone) return;

  zone.classList.remove('zone-safe', 'zone-warning', 'zone-critical');
  const cls = status === 'CRITICAL' ? 'zone-critical'
            : status === 'WARNING'  ? 'zone-warning'
            : 'zone-safe';
  zone.classList.add(cls);

  if (status === 'CRITICAL') triggerZoneAlert(zoneId);
  updateStats();
}

function updateStats() {
  const densities   = Object.values(zoneState).map(z => z.density);
  if (densities.length === 0) return;

  const avg       = (densities.reduce((a, b) => a + b, 0) / densities.length).toFixed(1);
  const hasCrit   = Object.values(zoneState).some(z => z.status === 'CRITICAL');
  const capLabel  = hasCrit ? 'HIGH' : parseFloat(avg) > 2.5 ? 'MED' : 'LOW';

  document.querySelector('#stat-density .stat-val').textContent = avg;
  document.querySelector('#stat-capacity .stat-val').textContent = capLabel;

  const alertTile = document.getElementById('stat-alert');
  if (hasCrit) alertTile.classList.remove('hidden');
  else         alertTile.classList.add('hidden');

  // Color density stat
  const densityEl = document.getElementById('stat-density');
  densityEl.style.borderTop = hasCrit
    ? '2px solid var(--danger)'
    : parseFloat(avg) > 2.5
    ? '2px solid var(--warn)'
    : '2px solid transparent';
}

function triggerZoneAlert(zoneId) {
  if (alertShown) return;
  alertShown = true;
  const friendlyName = zoneId.replace(/_/g, ' ').toUpperCase();
  addMessage(`⚠️ High crowd density detected near <strong>${friendlyName}</strong>. I'm finding a safer route for you.`, 'ai');
  showToast(`⚠️ ${friendlyName} is crowded — rerouting…`);
  setTimeout(() => { alertShown = false; }, 20000);
}

// ── Firestore real-time listeners ──
function setupRealtimeListeners() {
  const eventRef = db.collection('Events').doc('event_123');

  eventRef.collection('Zones').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const d = doc.data();
      updateZoneColor(doc.id, d.currentDensity, d.status);
    });
    document.getElementById('map-update-label').textContent = `Last update: ${new Date().toLocaleTimeString()}`;
  });

  eventRef.collection('Concessions').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const stand = MOCK_CONCESSIONS.find(c => c.id === doc.id);
      if (stand) {
        stand.estimatedWaitTime = doc.data().estimatedWaitTime ?? stand.estimatedWaitTime;
        stand.waitTrend         = doc.data().waitTrend ?? stand.waitTrend;
      }
    });
  });

  setConnectionStatus(true);
}

// ── Offline simulation ──
function simulateRealtimeUpdates() {
  const zones = ['zone_north_1', 'zone_south_1', 'zone_east_1', 'zone_west_1'];

  const tick = () => {
    zones.forEach(z => {
      const density = parseFloat((Math.random() * 6).toFixed(1));
      const status  = density > 4.5 ? 'CRITICAL' : density > 2.8 ? 'WARNING' : 'SAFE';
      updateZoneColor(z, density, status);
    });

    // Also shimmy wait times so routing feels live
    MOCK_CONCESSIONS.forEach(s => {
      s.estimatedWaitTime = Math.max(30, s.estimatedWaitTime + Math.floor((Math.random() - 0.4) * 30));
    });

    document.getElementById('map-update-label').textContent = `Last update: ${new Date().toLocaleTimeString()}`;
  };

  const svgEl = document.getElementById('stadium-svg');
  if (svgEl) {
    svgEl.addEventListener('load', () => {
      tick();
      setInterval(tick, 4000);
    });
  } else {
    setInterval(tick, 4000);
  }
}

// =========================================================
// 9. UI UTILITIES
// =========================================================

// High contrast toggle
document.getElementById('toggle-contrast').addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
  showToast(document.body.classList.contains('high-contrast')
    ? '🌓 High contrast on'
    : '🌑 High contrast off');
});

// Emergency dismiss
document.getElementById('emergency-dismiss')?.addEventListener('click', () => {
  document.getElementById('emergency-mode').classList.add('hidden');
  alertShown = false;
});

function setConnectionStatus(online) {
  const pill      = document.getElementById('conn-pill');
  const dot       = document.getElementById('conn-dot');
  const label     = document.getElementById('conn-label');
  const mobileDot = document.getElementById('mobile-conn-dot');

  if (!pill) return;
  pill.classList.toggle('online', online);
  pill.classList.toggle('offline', !online);
  if (label) label.textContent = online ? 'Live' : 'Offline';
  if (mobileDot) {
    mobileDot.style.background = online ? 'var(--safe)' : 'var(--text-3)';
    mobileDot.style.boxShadow  = online ? '0 0 5px var(--safe)' : 'none';
  }
  dot.setAttribute('aria-label', `Connection: ${online ? 'online' : 'offline simulation mode'}`);
}

function setGeminiStatus(text) {
  const el = document.getElementById('gemini-status');
  if (el) el.textContent = text;
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.getBoundingClientRect(); // force reflow
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, 3000);
}

// =========================================================
// 10. SERVICE WORKER
// =========================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(r => console.log('[SW] Registered:', r.scope))
      .catch(e => console.warn('[SW] Failed to register:', e));
  });
}

// =========================================================
// 11. NFC / DEEP LINK HANDLING
// =========================================================

window.addEventListener('DOMContentLoaded', () => {
  const params  = new URLSearchParams(window.location.search);
  const nfcZone = params.get('nfc_zone');
  if (nfcZone) {
    const formatted = nfcZone.replace(/_/g, ' ').toUpperCase();
    setTimeout(() => {
      addMessage(
        `📲 <strong>NFC Tap Detected!</strong> You are at <strong>${formatted}</strong>. I've oriented the map for you. What can I help you with?`,
        'ai'
      );
      showToast('📍 Location acquired via NFC');
    }, 800);
  }
});
