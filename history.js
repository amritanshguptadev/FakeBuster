// ============================================================
// HISTORY MODULE — localStorage, last 20 checks
// ============================================================

const HISTORY_KEY = 'fakebuster_history';
const MAX_HISTORY = 20;

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    claim: entry.claim,
    verdict: entry.verdict,
    confidence: entry.confidence,
    timestamp: new Date().toISOString(),
  });
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistoryPanel();
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistoryPanel();
}

function renderHistoryPanel() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const history = getHistory();
  if (!history.length) {
    list.innerHTML = '<p class="panel-empty">No claims checked yet.</p>';
    return;
  }
  list.innerHTML = history.map(entry => {
    const d = new Date(entry.timestamp);
    const timeStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const verdictClass = getVerdictClass(entry.verdict);
    const truncated = entry.claim.length > 80 ? entry.claim.slice(0, 80) + '…' : entry.claim;
    return `
      <div class="history-item" data-id="${entry.id}" onclick="loadHistoryItem(${entry.id})">
        <div class="history-verdict ${verdictClass}">${getVerdictIcon(entry.verdict)} ${entry.verdict}</div>
        <p class="history-claim">${escapeHtml(truncated)}</p>
        <div class="history-meta">
          <span class="history-confidence">${entry.confidence}% confident</span>
          <span class="history-time">${timeStr}</span>
        </div>
      </div>
    `;
  }).join('');
}

function loadHistoryItem(id) {
  const history = getHistory();
  const entry = history.find(h => h.id === id);
  if (!entry) return;
  document.getElementById('claimInput').value = entry.claim;
  document.getElementById('charCount').textContent = entry.claim.length;
  closePanel('historyPanel');
  // Switch to text mode
  switchMode('text');
}

function getVerdictClass(verdict) {
  const map = { 'REAL': 'verdict-real', 'FAKE': 'verdict-fake', 'MISLEADING': 'verdict-misleading', 'UNVERIFIED': 'verdict-unverified' };
  return map[verdict] || 'verdict-unverified';
}

function getVerdictIcon(verdict) {
  const map = { 'REAL': '✓', 'FAKE': '✗', 'MISLEADING': '⚠', 'UNVERIFIED': '?' };
  return map[verdict] || '?';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderHistoryPanel();
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    if (confirm('Clear all history?')) clearHistory();
  });
});
