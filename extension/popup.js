// FakeBuster Extension — Popup Script

const GOOGLE_FACTCHECK_API = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';

document.addEventListener('DOMContentLoaded', async () => {
  const claimBox = document.getElementById('claimBox');
  const checkBtn = document.getElementById('checkBtn');
  const result = document.getElementById('result');
  const verdictEl = document.getElementById('verdictEl');
  const confidenceEl = document.getElementById('confidenceEl');

  // Load pending claim from context menu
  const { pendingClaim } = await chrome.storage.session.get('pendingClaim');
  if (pendingClaim) {
    claimBox.textContent = pendingClaim;
    chrome.storage.session.remove('pendingClaim');
  }

  checkBtn.addEventListener('click', async () => {
    const claim = claimBox.textContent.trim();
    if (!claim || claim.includes('Highlight text')) return;

    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking…';
    result.classList.add('hidden');

    const verdict = await quickCheck(claim);

    const labels = { REAL: '✓ VERIFIED REAL', FAKE: '✗ FAKE / FALSE', MISLEADING: '⚠ MISLEADING', UNVERIFIED: '? UNVERIFIED' };
    verdictEl.textContent = labels[verdict.verdict] || verdict.verdict;
    verdictEl.className = `verdict verdict-${verdict.verdict.toLowerCase()}`;
    confidenceEl.textContent = `Confidence: ${verdict.confidence}%`;
    result.classList.remove('hidden');

    checkBtn.disabled = false;
    checkBtn.textContent = 'Check Claim';
  });

  document.getElementById('openFull').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://fakebuster.app' });
  });
});

async function quickCheck(claim) {
  try {
    const url = `${GOOGLE_FACTCHECK_API}?query=${encodeURIComponent(claim)}&languageCode=en&pageSize=3`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    const claims = data.claims || [];

    if (!claims.length) return { verdict: 'UNVERIFIED', confidence: 35 };

    const review = claims[0]?.claimReview?.[0];
    const rating = (review?.textualRating || '').toLowerCase();

    if (/false|fake|incorrect|fabricated/.test(rating)) return { verdict: 'FAKE', confidence: 88 };
    if (/true|correct|accurate/.test(rating)) return { verdict: 'REAL', confidence: 85 };
    if (/misleading|mixed|partly/.test(rating)) return { verdict: 'MISLEADING', confidence: 75 };
    return { verdict: 'UNVERIFIED', confidence: 40 };
  } catch {
    return { verdict: 'UNVERIFIED', confidence: 30 };
  }
}
