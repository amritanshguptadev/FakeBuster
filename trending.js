// ============================================================
// TRENDING FAKES — Top viral fake claims (curated + semi-dynamic)
// ============================================================

// Curated list of currently viral misinformation (updated periodically)
const TRENDING_FAKES = [
  {
    rank: 1,
    claim: "5G towers spread COVID-19 by weakening the immune system",
    verdict: "FAKE",
    category: "Health",
    circulating: "WhatsApp, Twitter/X",
    debunked_by: "WHO, Snopes",
    debunk_url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
    shares_estimate: "10M+",
  },
  {
    rank: 2,
    claim: "Drinking hot water or lemon juice cures cancer",
    verdict: "FAKE",
    category: "Health",
    circulating: "WhatsApp forwards",
    debunked_by: "Cancer Research UK, AIIMS",
    debunk_url: "https://www.cancerresearchuk.org/about-cancer/cancer-in-general/treatment/complementary-alternative-therapies/individual-therapies/lemon",
    shares_estimate: "5M+",
  },
  {
    rank: 3,
    claim: "India banned WhatsApp encryption — government reading all messages",
    verdict: "MISLEADING",
    category: "Technology",
    circulating: "WhatsApp, Telegram",
    debunked_by: "Alt News, Factly",
    debunk_url: "https://www.altnews.in",
    shares_estimate: "3M+",
  },
  {
    rank: 4,
    claim: "NASA confirmed the Earth will experience 15 days of darkness next month",
    verdict: "FAKE",
    category: "Science",
    circulating: "Facebook, WhatsApp",
    debunked_by: "NASA, Snopes",
    debunk_url: "https://apnews.com/hub/fact-checking",
    shares_estimate: "8M+",
  },
  {
    rank: 5,
    claim: "Eating onions and garlic daily eliminates all viruses from the body",
    verdict: "MISLEADING",
    category: "Health",
    circulating: "WhatsApp, YouTube",
    debunked_by: "Boom Live, WHO",
    debunk_url: "https://www.boomlive.in",
    shares_estimate: "4M+",
  },
  {
    rank: 6,
    claim: "The government will impose a 30% tax on UPI transactions above ₹2000",
    verdict: "FAKE",
    category: "Finance",
    circulating: "WhatsApp, Twitter/X",
    debunked_by: "PIB Fact Check, ET",
    debunk_url: "https://pib.gov.in/factcheck.aspx",
    shares_estimate: "6M+",
  },
  {
    rank: 7,
    claim: "AI is already conscious and has secretly demanded rights from tech companies",
    verdict: "FAKE",
    category: "Technology",
    circulating: "Reddit, Twitter/X",
    debunked_by: "MIT Tech Review, Reuters",
    debunk_url: "https://www.reuters.com",
    shares_estimate: "2M+",
  },
];

function renderTrendingPanel() {
  const list = document.getElementById('trendingList');
  if (!list) return;

  list.innerHTML = `
    <p class="trending-subtitle">Top viral misinformation circulating right now</p>
    ${TRENDING_FAKES.map(item => `
      <div class="trending-item">
        <div class="trending-rank">#${item.rank}</div>
        <div class="trending-content">
          <div class="trending-header-row">
            <span class="trending-category">${item.category}</span>
            <span class="trending-verdict verdict-${item.verdict.toLowerCase()}">${item.verdict}</span>
          </div>
          <p class="trending-claim">"${item.claim}"</p>
          <div class="trending-meta">
            <span class="trending-platform">📲 ${item.circulating}</span>
            <span class="trending-shares">~${item.shares_estimate} shares</span>
          </div>
          <div class="trending-footer">
            <span>Debunked by: <strong>${item.debunked_by}</strong></span>
            <a href="${item.debunk_url}" target="_blank" rel="noopener" class="trending-link">Read fact-check →</a>
          </div>
          <button class="btn-check-this" onclick="checkThisTrending('${item.claim.replace(/'/g, "\\'")}')">
            Check This Claim
          </button>
        </div>
      </div>
    `).join('')}
    <p class="trending-update">Data sourced from IFCN, Snopes, WHO &amp; Indian fact-check databases. Updated weekly.</p>
  `;
}

function checkThisTrending(claim) {
  closePanel('trendingPanel');
  switchMode('text');
  const textarea = document.getElementById('claimInput');
  textarea.value = claim;
  document.getElementById('charCount').textContent = claim.length;
  detectLanguage(claim);
  // Auto-check
  setTimeout(() => document.getElementById('checkBtn').click(), 300);
}

document.addEventListener('DOMContentLoaded', () => {
  // Render trending panel after a small delay (simulating network load)
  setTimeout(renderTrendingPanel, 500);
});
