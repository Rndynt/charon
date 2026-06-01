import { setDefaultResultOrder } from 'node:dns';
import { APP_NAME, SIGNAL_SERVER_URL, SIGNAL_POLL_MS, GRADUATED_POLL_MS, TRENDING_POLL_MS, POSITION_CHECK_MS, validateConfig } from './config.js';
import { initDb, db } from './db/connection.js';
import { initLiveExecution } from './liveExecutor.js';
import { setupTelegram } from './telegram/commands.js';
import { monitorPositions } from './execution/positions.js';
import { processCandidateFromSignals, maybeProcessDegenCandidate } from './pipeline/orchestrator.js';
import { sendTelegram } from './telegram/send.js';
import { makeFailureTracker } from './utils.js';

setDefaultResultOrder('ipv4first');
validateConfig();

const intervals = [];
let wsInstance = null;

export function registerInterval(id) {
  intervals.push(id);
}

export function registerWebsocket(ws) {
  wsInstance = ws;
}

function shutdown(signal) {
  console.log(`[bot] ${signal} received, shutting down...`);
  for (const id of intervals) clearInterval(id);
  if (wsInstance) {
    try { wsInstance.close(); } catch {}
  }
  try { db.pragma('wal_checkpoint(TRUNCATE)'); } catch {}
  try { db.close(); } catch {}
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function probeStartupHealth() {
  const checks = [];
  const { ENABLE_LLM, LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, SIGNAL_SERVER_URL, SIGNAL_SERVER_KEY, JUPITER_API_KEY } = await import('./config.js');

  // LLM probe
  if (ENABLE_LLM && LLM_API_KEY) {
    checks.push(
      import('axios').then(({ default: axios }) =>
        axios.get(`${LLM_BASE_URL.replace(/\/$/, '')}/models`, {
          timeout: 8000,
          headers: { authorization: `Bearer ${LLM_API_KEY}` },
        }).then(() => console.log('[startup] LLM: reachable'))
          .catch(err => console.log(`[startup] LLM: ${err.response?.status || err.message}`))
      )
    );
  } else {
    console.log(`[startup] LLM: ${ENABLE_LLM ? 'no API key' : 'disabled'}`);
  }

  // Jupiter API key
  console.log(`[startup] Jupiter API key: ${JUPITER_API_KEY ? 'present' : 'missing (live trades will fail)'}`);

  // Signal server probe
  if (SIGNAL_SERVER_URL) {
    checks.push(
      import('axios').then(({ default: axios }) =>
        axios.get(`${SIGNAL_SERVER_URL.replace(/\/$/, '')}/signals?limit=1`, {
          timeout: 8000,
          headers: SIGNAL_SERVER_KEY ? { 'x-api-key': SIGNAL_SERVER_KEY } : {},
        }).then(() => console.log('[startup] Signal server: reachable'))
          .catch(err => console.log(`[startup] Signal server: ${err.response?.status || err.message}`))
      )
    );
  } else {
    console.log('[startup] Signal server: not configured (standalone mode)');
  }

  // Fire-and-forget — don't block startup
  Promise.allSettled(checks).catch(() => {});
}

export async function startCharon() {
  initDb();
  initLiveExecution();
  setupTelegram();
  probeStartupHealth();

  if (SIGNAL_SERVER_URL) {
    // ── Server mode: fetch signals from signal server ──────────────────────
    const { fetchServerSignals, setCandidateHandler, setDegenHandler } = await import('./signals/serverClient.js');

    setCandidateHandler(processCandidateFromSignals);
    setDegenHandler(maybeProcessDegenCandidate);

    const alert = (msg) => sendTelegram(msg);
    const trackServer = makeFailureTracker('server signals', alert);
    const trackDip = makeFailureTracker('dip monitor', alert);

    await fetchServerSignals().catch(error => console.log(`[server] initial fetch failed: ${error.message}`));
    registerInterval(setInterval(() => trackServer(() => fetchServerSignals()), SIGNAL_POLL_MS));

    // Price monitor for dip buy strategy
    const { monitorPriceAlerts, cleanupAlerts, setCandidateHandler: setAlertHandler } = await import('./signals/priceMonitor.js');
    setAlertHandler(processCandidateFromSignals);
    registerInterval(setInterval(() => trackDip(() => monitorPriceAlerts()), 10_000));
    registerInterval(setInterval(() => cleanupAlerts(), 60 * 60 * 1000));

    console.log(`[bot] ${APP_NAME} started (server mode: ${SIGNAL_SERVER_URL})`);
  } else {
    // ── Standalone mode: direct polling (legacy) ───────────────────────────
    const { fetchGraduatedCoins } = await import('./signals/graduated.js');
    const { fetchGmgnTrending, setDegenHandler } = await import('./signals/trending.js');
    const { startWebsocket, setCandidateHandler } = await import('./signals/feeClaim.js');

    setDegenHandler(maybeProcessDegenCandidate);
    setCandidateHandler(processCandidateFromSignals);

    await fetchGraduatedCoins().catch(error => console.log(`[graduated] initial fetch failed: ${error.message}`));
    await fetchGmgnTrending().catch(error => console.log(`[trending] initial fetch failed: ${error.message}`));

    registerInterval(setInterval(() => fetchGraduatedCoins().catch(error => console.log(`[graduated] ${error.message}`)), GRADUATED_POLL_MS));
    registerInterval(setInterval(() => fetchGmgnTrending().catch(error => console.log(`[trending] ${error.message}`)), TRENDING_POLL_MS));
    const wsHandle = startWebsocket();
    if (wsHandle) registerWebsocket(wsHandle.getWs());

    console.log(`[bot] ${APP_NAME} started (standalone mode)`);
  }

  // Position monitoring runs in both modes
  const trackPositions = makeFailureTracker('position monitor', (msg) => sendTelegram(msg));
  registerInterval(setInterval(() => trackPositions(() => monitorPositions()), POSITION_CHECK_MS));
}
