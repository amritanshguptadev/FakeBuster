// ============================================================
// TRUST SCORE DATABASE
// ============================================================

const TRUST_DB = {
  'reuters.com': { score: 9.8, name: 'Reuters', bias: 'Center', icon: '🔵' },
  'apnews.com': { score: 9.7, name: 'AP News', bias: 'Center', icon: '🔵' },
  'bbc.com': { score: 9.2, name: 'BBC News', bias: 'Center-Left', icon: '🔵' },
  'bbc.co.uk': { score: 9.2, name: 'BBC News', bias: 'Center-Left', icon: '🔵' },
  'theguardian.com': { score: 8.7, name: 'The Guardian', bias: 'Center-Left', icon: '🔵' },
  'nytimes.com': { score: 8.5, name: 'New York Times', bias: 'Center-Left', icon: '🔵' },
  'washingtonpost.com': { score: 8.3, name: 'Washington Post', bias: 'Center-Left', icon: '🔵' },
  'economist.com': { score: 9.0, name: 'The Economist', bias: 'Center', icon: '🔵' },
  'nature.com': { score: 9.9, name: 'Nature', bias: 'Scientific', icon: '🟢' },
  'who.int': { score: 9.5, name: 'WHO', bias: 'Official', icon: '🟢' },
  'cdc.gov': { score: 9.4, name: 'CDC', bias: 'Official', icon: '🟢' },
  'nasa.gov': { score: 9.7, name: 'NASA', bias: 'Scientific', icon: '🟢' },
  'snopes.com': { score: 9.3, name: 'Snopes', bias: 'Fact-Check', icon: '✅' },
  'factcheck.org': { score: 9.5, name: 'FactCheck.org', bias: 'Fact-Check', icon: '✅' },
  'politifact.com': { score: 9.0, name: 'PolitiFact', bias: 'Fact-Check', icon: '✅' },
  'fullfact.org': { score: 9.2, name: 'Full Fact', bias: 'Fact-Check', icon: '✅' },
  'boomlive.in': { score: 8.8, name: 'Boom Live', bias: 'Fact-Check (India)', icon: '✅' },
  'altnews.in': { score: 8.9, name: 'Alt News', bias: 'Fact-Check (India)', icon: '✅' },
  'factly.in': { score: 8.7, name: 'Factly', bias: 'Fact-Check (India)', icon: '✅' },
  'vishvasnews.com': { score: 8.5, name: 'Vishvas News', bias: 'Fact-Check (India)', icon: '✅' },
  'en.wikipedia.org': { score: 7.5, name: 'Wikipedia', bias: 'Neutral Reference', icon: '📖' },
  'wikipedia.org': { score: 7.5, name: 'Wikipedia', bias: 'Neutral Reference', icon: '📖' },
  'cnn.com': { score: 7.2, name: 'CNN', bias: 'Center-Left', icon: '🟡' },
  'foxnews.com': { score: 6.1, name: 'Fox News', bias: 'Right', icon: '🟡' },
  'ndtv.com': { score: 7.8, name: 'NDTV', bias: 'Center (India)', icon: '🟡' },
  'thehindu.com': { score: 8.1, name: 'The Hindu', bias: 'Center-Left (India)', icon: '🔵' },
  'indianexpress.com': { score: 8.0, name: 'Indian Express', bias: 'Center (India)', icon: '🔵' },
  'hindustantimes.com': { score: 7.5, name: 'Hindustan Times', bias: 'Center (India)', icon: '🟡' },
  'timesofindia.com': { score: 7.3, name: 'Times of India', bias: 'Center (India)', icon: '🟡' },
  'scroll.in': { score: 7.9, name: 'Scroll.in', bias: 'Center-Left (India)', icon: '🔵' },
  'ft.com': { score: 8.8, name: 'Financial Times', bias: 'Center', icon: '🔵' },
  'bloomberg.com': { score: 8.6, name: 'Bloomberg', bias: 'Center', icon: '🔵' },
  'aljazeera.com': { score: 7.8, name: 'Al Jazeera', bias: 'Center-Left', icon: '🟡' },
  'npr.org': { score: 8.3, name: 'NPR', bias: 'Center-Left', icon: '🔵' },
  'breitbart.com': { score: 2.1, name: 'Breitbart', bias: 'Extreme Right', icon: '🔴' },
  'infowars.com': { score: 1.0, name: 'InfoWars', bias: 'Conspiracy', icon: '🔴' },
  'naturalnews.com': { score: 1.2, name: 'Natural News', bias: 'Conspiracy', icon: '🔴' },
};

function getTrustScore(url) {
  try {
    let hostname = url;
    if (url.startsWith('http')) {
      hostname = new URL(url).hostname.replace('www.', '');
    }
    if (TRUST_DB[hostname]) return TRUST_DB[hostname];
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const parent = parts.slice(-2).join('.');
      if (TRUST_DB[parent]) return TRUST_DB[parent];
    }
    return { score: 5.0, name: hostname, bias: 'Unknown', icon: '⚪' };
  } catch {
    return { score: 5.0, name: url, bias: 'Unknown', icon: '⚪' };
  }
}

function renderTrustBadge(url) {
  const trust = getTrustScore(url);
  const colorClass = trust.score >= 8 ? 'trust-high' : trust.score >= 6 ? 'trust-mid' : 'trust-low';
  return `<span class="trust-badge ${colorClass}">${trust.icon} ${trust.score.toFixed(1)}/10</span>`;
}
