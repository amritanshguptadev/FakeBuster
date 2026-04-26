<div align="center">

<img src="https://img.shields.io/badge/FakeBuster-AI%20Fact%20Checker-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white" alt="FakeBuster" />

# 🔍 FakeBuster — AI-Powered Fact Checker

**Bust fake news before it spreads.**  
Paste any claim, headline, or WhatsApp forward and get an instant verdict with evidence, confidence score, and shareable proof.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fakebuster.app-6366f1?style=flat-square)](https://fakebuster.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Made with](https://img.shields.io/badge/Made%20with-HTML%20%2B%20Vanilla%20JS-orange?style=flat-square)](.)
[![Built by](https://img.shields.io/badge/Built%20by-Amritansh%20Gupta-blue?style=flat-square)](https://github.com/AmritanshGupta)

</div>

---

## ✨ Features

### Core
| Feature | Description |
|---|---|
| 🔍 **Claim Checker** | Paste any text → get Real / Fake / Misleading / Unverified verdict |
| 📊 **Confidence Score** | Animated ring showing 0–100% confidence in the verdict |
| 🔗 **Proof Links** | Verified source links with trust ratings |
| 🧩 **Claim Breakdown** | Shows exactly which part is true, false, or mixed |

### Extra Features
| Feature | Description |
|---|---|
| 📸 **Screenshot OCR** | Upload a WhatsApp/tweet screenshot → auto-reads text via Tesseract.js |
| 🎙️ **Voice Input** | Speak your claim → Web Speech API transcribes it |
| 🖼️ **Share as Image** | Download a shareable FAKE ✗ / VERIFIED ✓ card via html2canvas |
| 📜 **History Log** | Last 20 checks saved locally in your browser |
| 🔥 **Trending Fakes** | Top 7 viral misinformation claims circulating right now |
| ⭐ **Trust Scores** | Every source rated 1–10 (based on MBFC + NewsGuard data) |
| 🌐 **Language Support** | Hindi, Hinglish, and English auto-detected |
| 🌙 **Dark / Light Mode** | System-respecting theme toggle, saved to localStorage |
| 🧩 **Browser Extension** | Right-click any selected text → "Check with FakeBuster" |

---

## 🛠️ How It Works

```
User Input (text / screenshot / voice)
        ↓
Language Detection (Hindi / Hinglish / English)
        ↓
┌───────────────────────────────┐
│  Google Fact Check Tools API  │  → official fact-check records
│  Wikipedia API                │  → context & reference
│  Pattern Analysis Engine      │  → known fake patterns
└───────────────────────────────┘
        ↓
Verdict: REAL / FAKE / MISLEADING / UNVERIFIED
Confidence Score (0–100%)
Claim Breakdown (which part is true/false)
Evidence Links + Trust Scores
```

---

## 🚀 Quick Start

No installation needed. Just open `index.html` in any modern browser.

```bash
git clone https://github.com/AmritanshGupta/FakeBuster.git
cd FakeBuster
# Open index.html in Chrome/Edge/Firefox
start index.html   # Windows
open index.html    # macOS
```

> **Tip:** For full OCR support, use Chrome or Edge (Chromium-based browsers).

---

## 🧩 Browser Extension

The `/extension` folder contains a Chrome extension (Manifest V3).

**Install steps:**
1. Open `chrome://extensions/`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `/extension` folder

Then highlight any text on any webpage → right-click → **"Check with FakeBuster"**

---

## 📁 Project Structure

```
FakeBuster/
├── index.html        # Main app (single page)
├── style.css         # Full design system + dark/light mode
├── app.js            # Core fact-check engine + UI logic
├── trust.js          # Source trust score database (50+ outlets)
├── history.js        # localStorage history (last 20 checks)
├── trending.js       # Trending fakes panel
├── share.js          # html2canvas share-as-image
├── ocr.js            # Tesseract.js OCR integration
├── voice.js          # Web Speech API voice input
├── extension/
│   ├── manifest.json # Chrome extension Manifest V3
│   ├── background.js # Context menu service worker
│   ├── popup.html    # Extension popup UI
│   └── popup.js      # Extension popup logic
├── .gitignore
└── README.md
```

---

## 🌐 APIs Used

| API | Purpose | Cost |
|---|---|---|
| [Google Fact Check Tools](https://developers.google.com/fact-check/tools/api) | Official fact-check records | Free (1000 req/day) |
| [Wikipedia API](https://en.wikipedia.org/w/api.php) | Context & reference | Free |
| [Tesseract.js](https://tesseract.projectnaptha.com/) | Browser-based OCR | Free (CDN) |
| [html2canvas](https://html2canvas.hertzen.com/) | Share card generation | Free (CDN) |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Voice input | Free (browser built-in) |

---

## 📰 Supported Languages

- 🇬🇧 **English**
- 🇮🇳 **Hindi** (Devanagari script)
- 🇮🇳 **Hinglish** (Hindi words in Roman script)

---

## 🏆 Trusted Sources Database

FakeBuster rates 50+ news outlets using data from:
- [Media Bias/Fact Check (MBFC)](https://mediabiasfactcheck.com/)
- [NewsGuard](https://www.newsguardtech.com/)
- [IFCN — International Fact-Checking Network](https://ifcncodeofprinciples.poynter.org/)

Top rated: Reuters (9.8), AP News (9.7), FactCheck.org (9.5), Snopes (9.3), Alt News India (8.9)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 👨‍💻 Author

**Amritansh Gupta**  
[![GitHub](https://img.shields.io/badge/GitHub-AmritanshGupta-181717?style=flat-square&logo=github)](https://github.com/AmritanshGupta)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
<sub>Built with ❤️ to fight misinformation. Share facts, not fakes.</sub>
</div>
