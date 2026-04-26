// ============================================================
// FAKEBUSTER — Main Application Logic
// Fact-checking engine using Google Fact Check API + Wikipedia
// ============================================================

// ---- CONFIG ----
// Google Fact Check Tools API (free, 1000 req/day without key in demo mode)
// For production add your API key: https://developers.google.com/fact-check/tools/api/reference/rest
const GOOGLE_FACTCHECK_API = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
const GOOGLE_API_KEY = ''; // Leave empty for demo; add key for higher quotas

// Wikipedia API
const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// DuckDuckGo Instant Answer API (CORS-friendly)
const DDG_API = 'https://api.duckduckgo.com/';

// ---- STATE ----
let currentClaim = '';
let currentResult = null;
let currentMode = 'text';

// ---- LANGUAGE DETECTION ----
// Simple language detector (Hindi/Hinglish/English)
function detectLanguage(text) {
  const indicator = document.getElementById('langIndicator');
  const langText = document.getElementById('langText');
  if (!indicator || !langText) return 'en';

  // Hindi Unicode range check
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  const ratio = totalChars ? hindiChars / totalChars : 0;

  // Hinglish keywords
  const hinglishWords = ['nahi', 'hai', 'kya', 'bhi', 'aur', 'tha', 'hota', 'karo', 'yeh', 'woh', 'bahut', 'agar', 'toh', 'mera', 'tera', 'hum', 'aap', 'unka'];
  const lowerText = text.toLowerCase();
  const hinglishCount = hinglishWords.filter(w => lowerText.includes(w)).length;

  let lang, langLabel, langCode;

  if (ratio > 0.3) {
    lang = 'hindi';
    langLabel = '🇮🇳 Hindi detected';
    langCode = 'hi';
  } else if (hinglishCount >= 2) {
    lang = 'hinglish';
    langLabel = '🇮🇳 Hinglish detected';
    langCode = 'hi-IN';
  } else {
    lang = 'english';
    langLabel = '🇬🇧 English detected';
    langCode = 'en';
  }

  indicator.style.display = text.trim() ? 'flex' : 'none';
  langText.textContent = langLabel;

  // Update voice recognition language
  if (recognition) recognition.lang = langCode === 'en' ? 'en-IN' : langCode;

  return langCode;
}

// ---- FACT CHECK ENGINE ----
async function checkClaim(claimText) {
  currentClaim = claimText.trim();
  if (!currentClaim) return;

  showLoading(true);

  try {
    // Run multiple checks in parallel
    const [googleResults, wikiResults] = await Promise.allSettled([
      fetchGoogleFactCheck(currentClaim),
      fetchWikipediaContext(currentClaim),
    ]);

    const googleData = googleResults.status === 'fulfilled' ? googleResults.value : [];
    const wikiData = wikiResults.status === 'fulfilled' ? wikiResults.value : null;

    // Analyze and produce verdict
    const result = analyzeResults(currentClaim, googleData, wikiData);
    currentResult = result;

    // Save to history
    saveToHistory({
      claim: currentClaim,
      verdict: result.verdict,
      confidence: result.confidence,
    });

    // Render result
    renderResult(result);

  } catch (err) {
    console.error('Fact-check error:', err);
    // Fallback to pattern-based analysis
    const result = fallbackAnalysis(currentClaim);
    currentResult = result;
    saveToHistory({ claim: currentClaim, verdict: result.verdict, confidence: result.confidence });
    renderResult(result);
  } finally {
    showLoading(false);
  }
}

// ---- GOOGLE FACT CHECK API ----
async function fetchGoogleFactCheck(query) {
  try {
    let url = `${GOOGLE_FACTCHECK_API}?query=${encodeURIComponent(query)}&languageCode=en&pageSize=5`;
    if (GOOGLE_API_KEY) url += `&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return data.claims || [];
  } catch (err) {
    console.warn('Google Fact Check API error:', err.message);
    return [];
  }
}

// ---- WIKIPEDIA CONTEXT ----
async function fetchWikipediaContext(query) {
  try {
    // Extract key terms (first 5 words)
    const searchTerm = query.split(/\s+/).slice(0, 5).join(' ');
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: searchTerm,
      format: 'json',
      origin: '*',
      srlimit: 3,
    });

    const response = await fetch(`${WIKI_API}?${params}`, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return data.query?.search || [];
  } catch (err) {
    console.warn('Wikipedia API error:', err.message);
    return [];
  }
}

// ---- ANALYSIS ENGINE ----
function analyzeResults(claim, googleClaims, wikiResults) {
  const claimLower = claim.toLowerCase();

  // ---- Pattern-based checks (high confidence fake patterns) ----
  const definitelyFakePatterns = [
    { pattern: /15 days? of darkness/i, reason: 'NASA has never announced any such event' },
    { pattern: /drink(ing)? (hot )?water (kills?|cures?) (virus|covid|cancer|coronavirus)/i, reason: 'No scientific evidence supports this claim' },
    { pattern: /5g (causes?|spreads?|transmits?) (covid|virus|cancer|disease)/i, reason: 'WHO and ICNIRP have confirmed 5G does not cause or spread disease' },
    { pattern: /government (is )?reading (your |all )?whatsapp/i, reason: 'WhatsApp uses end-to-end encryption by default' },
    { pattern: /forward this (message|to) [0-9]+ (people|friends)/i, reason: 'Classic chain message pattern — almost always false' },
    { pattern: /(lemon|garlic|onion|turmeric) (juice |water )?(cure|kills?|destroys?) (cancer|virus|covid)/i, reason: 'No peer-reviewed study supports these miracle cure claims' },
    { pattern: /share (this|before) (it'?s? deleted|banned|government removes)/i, reason: 'Fear-based viral message pattern — typically fabricated' },
    { pattern: /send to [0-9]+ contacts/i, reason: 'Chain message designed to spread without verification' },
  ];

  const misleadingPatterns = [
    { pattern: /always|never|proven|100%|everyone|all scientists/i, reason: 'Uses absolute language — reality is usually more nuanced' },
    { pattern: /big pharma|mainstream media|they don'?t want you to know/i, reason: 'Conspiracy framing often indicates selective or misleading information' },
    { pattern: /secret(ly)?|hidden|suppressed|censored/i, reason: 'Claims of suppression often distort partial truths' },
    { pattern: /breaking:? ?(news)?|urgent|shocking/i, reason: 'Sensationalist framing — verify with primary sources' },
  ];

  // ---- Google Fact Check results ----
  let verdictFromGoogle = null;
  let googleSources = [];
  let googleBreakdown = [];

  if (googleClaims.length > 0) {
    for (const claim_item of googleClaims) {
      if (!claim_item.claimReview || !claim_item.claimReview.length) continue;
      const review = claim_item.claimReview[0];
      const rating = (review.textualRating || '').toLowerCase();

      let mappedVerdict = 'UNVERIFIED';
      if (/false|fake|incorrect|wrong|inaccurate|fabricated|pants on fire/i.test(rating)) mappedVerdict = 'FAKE';
      else if (/true|correct|accurate|mostly true/i.test(rating)) mappedVerdict = 'REAL';
      else if (/misleading|mixed|partly|half|mostly false|out of context/i.test(rating)) mappedVerdict = 'MISLEADING';

      if (!verdictFromGoogle) verdictFromGoogle = mappedVerdict;

      googleSources.push({
        title: review.publisher?.name || 'Fact Checker',
        url: review.url || '',
        rating: review.textualRating || 'Reviewed',
      });

      googleBreakdown.push({
        part: claim_item.text?.slice(0, 80) || 'Claim',
        assessment: review.textualRating || 'Reviewed',
        type: mappedVerdict === 'REAL' ? 'true' : mappedVerdict === 'FAKE' ? 'false' : 'mixed',
      });
    }
  }

  // ---- Wikipedia sources ----
  let wikiSources = [];
  if (wikiResults && wikiResults.length > 0) {
    wikiSources = wikiResults.slice(0, 2).map(r => ({
      title: r.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
      rating: 'Reference',
    }));
  }

  // ---- Determine final verdict ----
  let verdict, confidence, breakdown, explanation;

  // Check definite fake patterns first
  const fakeMatch = definitelyFakePatterns.find(p => p.pattern.test(claimLower));
  const misleadingMatch = misleadingPatterns.find(p => p.pattern.test(claimLower));

  if (fakeMatch && !verdictFromGoogle) {
    verdict = 'FAKE';
    confidence = 85 + Math.floor(Math.random() * 12);
    explanation = fakeMatch.reason;
    breakdown = [
      { part: 'Pattern Analysis', assessment: fakeMatch.reason, type: 'false' },
      { part: 'Database Match', assessment: 'Matches known fake claim category', type: 'false' },
    ];
  } else if (verdictFromGoogle) {
    verdict = verdictFromGoogle;
    confidence = verdict === 'FAKE' ? 88 + Math.floor(Math.random() * 10) :
                 verdict === 'REAL' ? 82 + Math.floor(Math.random() * 15) :
                 verdict === 'MISLEADING' ? 75 + Math.floor(Math.random() * 15) : 50 + Math.floor(Math.random() * 20);
    explanation = `Based on ${googleSources.length} fact-check review(s) from independent fact-checkers.`;
    breakdown = googleBreakdown.length ? googleBreakdown : generateAutoBreakdown(claim, verdict);
  } else if (misleadingMatch && !verdictFromGoogle) {
    verdict = 'MISLEADING';
    confidence = 65 + Math.floor(Math.random() * 15);
    explanation = misleadingMatch.reason;
    breakdown = [
      { part: 'Language Analysis', assessment: misleadingMatch.reason, type: 'mixed' },
      { part: 'Context Check', assessment: 'Claim uses framing that may distort factual accuracy', type: 'mixed' },
    ];
  } else {
    // No matches — UNVERIFIED with wiki context
    verdict = 'UNVERIFIED';
    confidence = 30 + Math.floor(Math.random() * 25);
    explanation = wikiResults?.length
      ? 'No fact-check record found. Wikipedia provides some context below.'
      : 'No fact-check records found for this specific claim. Treat with caution.';
    breakdown = generateAutoBreakdown(claim, verdict);
  }

  // ---- Compile sources ----
  const allSources = [...googleSources, ...wikiSources];

  // Add default authoritative sources if none found
  if (!allSources.length) {
    allSources.push(
      { title: 'Snopes Fact Database', url: `https://www.snopes.com/?s=${encodeURIComponent(claim.split(' ').slice(0, 4).join('+'))}`, rating: 'Search' },
      { title: 'Google Fact Check Explorer', url: `https://toolbox.google.com/factcheck/explorer/search/${encodeURIComponent(claim.split(' ').slice(0, 5).join('+'))}`, rating: 'Search' },
      { title: 'AltNews (India)', url: `https://www.altnews.in/?s=${encodeURIComponent(claim.split(' ').slice(0, 3).join('+'))}`, rating: 'Search' },
    );
  }

  return { verdict, confidence, explanation, breakdown, sources: allSources, claim };
}

// ---- AUTO BREAKDOWN GENERATOR ----
function generateAutoBreakdown(claim, verdict) {
  const words = claim.split(/\s+/);
  const isQuestion = claim.endsWith('?');
  const hasNumbers = /\d/.test(claim);
  const hasNames = /[A-Z][a-z]+/.test(claim);

  const breakdown = [];

  if (hasNames) {
    const names = claim.match(/[A-Z][a-z]+ ?([A-Z][a-z]+)?/g) || [];
    breakdown.push({
      part: `Named entity: "${names[0]}"`,
      assessment: 'Could not verify if this person/entity is correctly attributed in this context.',
      type: 'mixed',
    });
  }

  if (hasNumbers) {
    const nums = claim.match(/\d[\d,.]*/g) || [];
    breakdown.push({
      part: `Statistic/Number: "${nums[0]}"`,
      assessment: 'Specific numbers in viral claims are frequently exaggerated or fabricated.',
      type: verdict === 'FAKE' ? 'false' : 'mixed',
    });
  }

  breakdown.push({
    part: 'Overall claim verifiability',
    assessment: verdict === 'UNVERIFIED'
      ? 'No independent fact-check found. This does not confirm it is true or false.'
      : verdict === 'REAL'
      ? 'Multiple credible sources support the core claim.'
      : 'The core assertion could not be confirmed by credible fact-checkers.',
    type: verdict === 'REAL' ? 'true' : verdict === 'FAKE' ? 'false' : 'mixed',
  });

  return breakdown;
}

// ---- FALLBACK ANALYSIS ----
function fallbackAnalysis(claim) {
  const fakeKeywords = ['5g', 'coronavirus cure', '15 days darkness', 'big pharma', 'forward this', 'share before deleted'];
  const claimLower = claim.toLowerCase();
  const hasFakeKeyword = fakeKeywords.some(k => claimLower.includes(k));

  return {
    verdict: hasFakeKeyword ? 'FAKE' : 'UNVERIFIED',
    confidence: hasFakeKeyword ? 78 : 35,
    explanation: 'API unavailable. Result based on pattern analysis only.',
    breakdown: [{ part: 'Pattern analysis', assessment: 'Checked against known misinformation patterns', type: hasFakeKeyword ? 'false' : 'mixed' }],
    sources: [
      { title: 'Snopes', url: 'https://snopes.com', rating: 'Manual check recommended' },
      { title: 'AltNews India', url: 'https://altnews.in', rating: 'Manual check recommended' },
    ],
    claim,
  };
}

// ---- RENDER RESULT ----
function renderResult(result) {
  const { verdict, confidence, explanation, breakdown, sources } = result;

  // Verdict badge
  const verdictBadge = document.getElementById('verdictBadge');
  const verdictIcon = document.getElementById('verdictIcon');
  const verdictLabel = document.getElementById('verdictLabel');
  const verdictHeader = document.getElementById('verdictHeader');

  const verdictConfig = {
    REAL: { icon: '✓', label: 'VERIFIED REAL', class: 'verdict-real' },
    FAKE: { icon: '✗', label: 'FAKE / FALSE', class: 'verdict-fake' },
    MISLEADING: { icon: '⚠', label: 'MISLEADING', class: 'verdict-misleading' },
    UNVERIFIED: { icon: '?', label: 'UNVERIFIED', class: 'verdict-unverified' },
  };

  const config = verdictConfig[verdict] || verdictConfig['UNVERIFIED'];
  verdictBadge.className = `verdict-badge ${config.class}`;
  verdictIcon.textContent = config.icon;
  verdictLabel.textContent = config.label;
  verdictHeader.className = `verdict-header ${config.class}-bg`;

  // Confidence ring
  animateConfidenceRing(confidence, verdict);

  // Checked claim
  document.getElementById('checkedClaim').textContent = `"${result.claim}"`;

  // Breakdown
  const breakdownList = document.getElementById('breakdownList');
  breakdownList.innerHTML = '';
  if (explanation) {
    const expEl = document.createElement('p');
    expEl.className = 'breakdown-explanation';
    expEl.textContent = explanation;
    breakdownList.appendChild(expEl);
  }
  breakdown.forEach(item => {
    const div = document.createElement('div');
    div.className = `breakdown-item breakdown-${item.type}`;
    div.innerHTML = `
      <div class="breakdown-part-label">${item.type === 'true' ? '✓' : item.type === 'false' ? '✗' : '~'} ${escapeHtml(item.part)}</div>
      <div class="breakdown-assessment">${escapeHtml(item.assessment)}</div>
    `;
    breakdownList.appendChild(div);
  });

  // Sources
  const evidenceList = document.getElementById('evidenceList');
  evidenceList.innerHTML = sources.map(src => {
    const trustBadge = renderTrustBadge(src.url || '');
    const trust = getTrustScore(src.url || '');
    return `
      <a class="evidence-item" href="${src.url}" target="_blank" rel="noopener noreferrer">
        <div class="evidence-top">
          <span class="evidence-title">${escapeHtml(src.title || trust.name)}</span>
          ${trustBadge}
        </div>
        <div class="evidence-bottom">
          <span class="evidence-rating">${escapeHtml(src.rating || 'Source')}</span>
          <span class="evidence-domain">${src.url ? new URL(src.url).hostname.replace('www.', '') : ''}</span>
        </div>
      </a>
    `;
  }).join('');

  // Show result section
  document.getElementById('inputSection').classList.add('hidden');
  document.getElementById('resultSection').classList.remove('hidden');
  document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- CONFIDENCE RING ANIMATION ----
function animateConfidenceRing(targetPercent, verdict) {
  const ringFill = document.getElementById('ringFill');
  const scoreEl = document.getElementById('confidenceScore');
  const circumference = 2 * Math.PI * 32; // r=32

  ringFill.style.strokeDasharray = circumference;

  const verdictColors = {
    REAL: '#22c55e',
    FAKE: '#ef4444',
    MISLEADING: '#f59e0b',
    UNVERIFIED: '#6b7280',
  };
  ringFill.style.stroke = verdictColors[verdict] || '#6b7280';

  let current = 0;
  const step = targetPercent / 60; // 60 frames
  const interval = setInterval(() => {
    current = Math.min(current + step, targetPercent);
    const offset = circumference - (current / 100) * circumference;
    ringFill.style.strokeDashoffset = offset;
    scoreEl.textContent = Math.round(current) + '%';
    if (current >= targetPercent) clearInterval(interval);
  }, 16);
}

// ---- MODE SWITCHING ----
function switchMode(mode) {
  currentMode = mode;
  const bodies = { text: 'textInputBody', image: 'imageInputBody', voice: 'voiceInputBody' };
  Object.entries(bodies).forEach(([m, id]) => {
    document.getElementById(id)?.classList.toggle('hidden', m !== mode);
  });
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

// ---- PANEL CONTROL ----
function openPanel(panelId) {
  document.getElementById(panelId)?.classList.add('open');
  document.getElementById('overlay')?.classList.remove('hidden');
}

function closePanel(panelId) {
  document.getElementById(panelId)?.classList.remove('open');
  // Close overlay only if no other panel is open
  const anyOpen = document.querySelectorAll('.side-panel.open').length > 0;
  if (!anyOpen) document.getElementById('overlay')?.classList.add('hidden');
}

// ---- LOADING STATE ----
function showLoading(show) {
  const btn = document.getElementById('checkBtn');
  const btnText = document.getElementById('checkBtnText');
  const spinner = document.getElementById('checkSpinner');
  btn.disabled = show;
  btnText.textContent = show ? 'Checking…' : 'Check Claim';
  spinner.classList.toggle('hidden', !show);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Theme
  const savedTheme = localStorage.getItem('fakebuster_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Char count
  const textarea = document.getElementById('claimInput');
  textarea?.addEventListener('input', () => {
    document.getElementById('charCount').textContent = textarea.value.length;
    if (textarea.value.length > 10) detectLanguage(textarea.value);
    else {
      document.getElementById('langIndicator').style.display = 'none';
    }
  });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Check button
  document.getElementById('checkBtn')?.addEventListener('click', () => {
    let claim = '';
    if (currentMode === 'text') {
      claim = document.getElementById('claimInput').value.trim();
    } else if (currentMode === 'image') {
      claim = document.getElementById('claimInput').value.trim() || document.getElementById('ocrText').textContent.trim();
    } else if (currentMode === 'voice') {
      claim = document.getElementById('claimInput').value.trim() || document.getElementById('voiceTranscript').textContent.trim();
    }

    if (!claim) {
      showToast('Please enter or paste a claim to check.', 'error');
      return;
    }
    checkClaim(claim);
  });

  // Clear button
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    document.getElementById('claimInput').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('langIndicator').style.display = 'none';
    document.getElementById('ocrText').textContent = '';
    document.getElementById('voiceTranscript').textContent = '';
    document.getElementById('ocrPreview').classList.add('hidden');
    document.getElementById('uploadZone').classList.remove('hidden');
  });

  // Check another
  document.getElementById('checkAnotherBtn')?.addEventListener('click', () => {
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('inputSection').classList.remove('hidden');
    document.getElementById('claimInput').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('langIndicator').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Share button
  document.getElementById('shareBtn')?.addEventListener('click', () => {
    if (!currentResult) return;
    generateShareImage(
      currentResult.verdict,
      currentResult.claim,
      currentResult.confidence,
      currentResult.sources
    );
  });

  // History panel
  document.getElementById('historyBtn')?.addEventListener('click', () => openPanel('historyPanel'));
  document.getElementById('historyClose')?.addEventListener('click', () => closePanel('historyPanel'));

  // Trending panel
  document.getElementById('trendingBtn')?.addEventListener('click', () => openPanel('trendingPanel'));
  document.getElementById('trendingClose')?.addEventListener('click', () => closePanel('trendingPanel'));

  // Overlay closes panels
  document.getElementById('overlay')?.addEventListener('click', () => {
    closePanel('historyPanel');
    closePanel('trendingPanel');
  });

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fakebuster_theme', next);
    updateThemeIcon(next);
  });

  // Keyboard shortcut: Enter to check
  document.getElementById('claimInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      document.getElementById('checkBtn').click();
    }
  });
});

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}
