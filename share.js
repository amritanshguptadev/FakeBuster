// ============================================================
// SHARE AS IMAGE — html2canvas share card generator
// ============================================================

async function generateShareImage(verdict, claim, confidence, sources) {
  const shareVerdict = document.getElementById('shareVerdict');
  const shareClaimText = document.getElementById('shareClaimText');
  const shareConfidenceEl = document.getElementById('shareConfidence');
  const shareSourcesEl = document.getElementById('shareSources');
  const shareCardInner = document.getElementById('shareCardInner');
  const shareCardTemplate = document.getElementById('shareCardTemplate');

  // Populate share card
  const verdictEmoji = { REAL: '✓ VERIFIED', FAKE: '✗ FAKE', MISLEADING: '⚠ MISLEADING', UNVERIFIED: '? UNVERIFIED' };
  shareVerdict.textContent = verdictEmoji[verdict] || verdict;
  shareVerdict.className = `share-verdict share-verdict-${verdict.toLowerCase()}`;

  const truncatedClaim = claim.length > 120 ? claim.slice(0, 120) + '…' : claim;
  shareClaimText.textContent = `"${truncatedClaim}"`;
  shareConfidenceEl.textContent = `Confidence: ${confidence}%`;

  const topSources = sources.slice(0, 2).map(s => {
    const trust = getTrustScore(s.url || s.link || '');
    return `${trust.icon} ${s.title || trust.name}`;
  }).join(' • ');
  shareSourcesEl.textContent = topSources || 'No sources found';

  // Show share card
  shareCardTemplate.classList.remove('hidden');
  shareCardTemplate.style.position = 'fixed';
  shareCardTemplate.style.left = '-9999px';
  shareCardTemplate.style.top = '0';

  try {
    const canvas = await html2canvas(shareCardInner, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Download image
    const link = document.createElement('a');
    link.download = `fakebuster-${verdict.toLowerCase()}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Share image downloaded! 📸');
  } catch (err) {
    console.error('Share image error:', err);
    showToast('Could not generate image. Try again.', 'error');
  } finally {
    shareCardTemplate.classList.add('hidden');
    shareCardTemplate.style.position = '';
    shareCardTemplate.style.left = '';
    shareCardTemplate.style.top = '';
  }
}

function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
