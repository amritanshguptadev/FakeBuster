// ============================================================
// VOICE INPUT MODULE — Web Speech API
// ============================================================

let isListening = false;
let recognition = null;

function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }
  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  // Will be set dynamically based on detected language
  rec.lang = 'en-IN';
  return rec;
}

function startListening() {
  const micBtn = document.getElementById('micBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  const voiceTranscript = document.getElementById('voiceTranscript');

  if (!recognition) recognition = initVoice();

  if (!recognition) {
    voiceStatus.textContent = '⚠ Voice input not supported in this browser. Try Chrome.';
    return;
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  isListening = true;
  micBtn.classList.add('listening');
  voiceStatus.textContent = 'Listening… Speak your claim';
  voiceTranscript.textContent = '';

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }
    voiceTranscript.textContent = final || interim;

    if (final) {
      const textarea = document.getElementById('claimInput');
      textarea.value = final;
      document.getElementById('charCount').textContent = final.length;
      detectLanguage(final);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    voiceStatus.textContent = `⚠ Error: ${event.error}. Try again.`;
    stopListening();
  };

  recognition.onend = () => {
    stopListening();
    const transcript = document.getElementById('voiceTranscript').textContent;
    if (transcript) {
      voiceStatus.textContent = '✓ Got it! You can now check this claim.';
    } else {
      voiceStatus.textContent = 'Click to start speaking';
    }
  };

  recognition.start();
}

function stopListening() {
  isListening = false;
  const micBtn = document.getElementById('micBtn');
  micBtn?.classList.remove('listening');
}

document.addEventListener('DOMContentLoaded', () => {
  const micBtn = document.getElementById('micBtn');
  if (!micBtn) return;

  // Check support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('voiceStatus').textContent = '⚠ Voice input not supported. Use Chrome or Edge.';
    micBtn.disabled = true;
    micBtn.style.opacity = '0.4';
  }

  micBtn.addEventListener('click', startListening);
});
