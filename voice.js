// ============================================================
// VOICE INPUT MODULE — Web Speech API
// ============================================================

// Expose as globals so app.js can reference them
window.recognition = null;
let isListening = false;

function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  rec.lang = 'en-IN';
  return rec;
}

function startListening() {
  const micBtn = document.getElementById('micBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  const voiceTranscript = document.getElementById('voiceTranscript');

  if (!window.recognition) window.recognition = initVoice();

  if (!window.recognition) {
    if (voiceStatus) voiceStatus.textContent = '⚠ Voice input not supported in this browser. Try Chrome.';
    return;
  }

  if (isListening) {
    window.recognition.stop();
    return;
  }

  isListening = true;
  if (micBtn) micBtn.classList.add('listening');
  if (voiceStatus) voiceStatus.textContent = 'Listening… Speak your claim';
  if (voiceTranscript) voiceTranscript.textContent = '';

  window.recognition.onresult = (event) => {
    let interim = '', final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += transcript;
      else interim += transcript;
    }
    if (voiceTranscript) voiceTranscript.textContent = final || interim;

    if (final) {
      const textarea = document.getElementById('claimInput');
      if (textarea) textarea.value = final;
      const charCount = document.getElementById('charCount');
      if (charCount) charCount.textContent = final.length;
      if (typeof detectLanguage === 'function') detectLanguage(final);
    }
  };

  window.recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (voiceStatus) voiceStatus.textContent = `⚠ Error: ${event.error}. Try again.`;
    stopListening();
  };

  window.recognition.onend = () => {
    stopListening();
    const transcript = document.getElementById('voiceTranscript')?.textContent;
    const voiceStatus = document.getElementById('voiceStatus');
    if (voiceStatus) {
      voiceStatus.textContent = transcript
        ? '✓ Got it! You can now check this claim.'
        : 'Click to start speaking';
    }
  };

  try {
    window.recognition.start();
  } catch (err) {
    console.error('Recognition start error:', err);
    stopListening();
    if (voiceStatus) voiceStatus.textContent = '⚠ Could not start microphone. Try again.';
  }
}

function stopListening() {
  isListening = false;
  document.getElementById('micBtn')?.classList.remove('listening');
}

document.addEventListener('DOMContentLoaded', () => {
  const micBtn = document.getElementById('micBtn');
  if (!micBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const voiceStatus = document.getElementById('voiceStatus');
    if (voiceStatus) voiceStatus.textContent = '⚠ Voice input not supported. Use Chrome or Edge.';
    micBtn.disabled = true;
    micBtn.style.opacity = '0.4';
    return;
  }

  micBtn.addEventListener('click', startListening);
});
