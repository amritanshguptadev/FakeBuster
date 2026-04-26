// ============================================================
// OCR MODULE — Tesseract.js browser-based image text extraction
// ============================================================

let ocrWorker = null;

async function initOCR() {
  if (ocrWorker) return ocrWorker;
  ocrWorker = await Tesseract.createWorker('eng+hin', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        const pct = Math.round(m.progress * 100);
        const statusEl = document.getElementById('ocrStatus');
        if (statusEl) statusEl.textContent = `Reading text… ${pct}%`;
      }
    }
  });
  return ocrWorker;
}

async function runOCR(imageFile) {
  const ocrPreview = document.getElementById('ocrPreview');
  const previewImg = document.getElementById('previewImg');
  const ocrTextEl = document.getElementById('ocrText');
  const ocrStatus = document.getElementById('ocrStatus');
  const ocrSpinner = document.getElementById('ocrSpinner');
  const uploadZone = document.getElementById('uploadZone');

  // Show preview
  const objectUrl = URL.createObjectURL(imageFile);
  previewImg.src = objectUrl;
  ocrPreview.classList.remove('hidden');
  uploadZone.classList.add('hidden');

  ocrStatus.textContent = 'Initializing OCR engine…';
  ocrSpinner.style.display = 'inline-block';
  ocrTextEl.textContent = '';

  try {
    const worker = await initOCR();
    const { data } = await worker.recognize(imageFile);
    const text = data.text.trim();

    if (!text) {
      ocrStatus.textContent = '⚠ No text found in image. Try a clearer screenshot.';
      ocrSpinner.style.display = 'none';
      return null;
    }

    ocrStatus.textContent = '✓ Text extracted successfully';
    ocrSpinner.style.display = 'none';
    ocrTextEl.textContent = text;

    // Auto-populate main textarea
    const textarea = document.getElementById('claimInput');
    textarea.value = text;
    document.getElementById('charCount').textContent = text.length;
    detectLanguage(text);

    return text;
  } catch (err) {
    console.error('OCR error:', err);
    ocrStatus.textContent = '✗ OCR failed. Please try again with a clearer image.';
    ocrSpinner.style.display = 'none';
    return null;
  }
}

// Upload zone drag & drop + file input
document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');

  if (!uploadZone || !fileInput) return;

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      runOCR(file);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) runOCR(file);
  });

  // Click on upload zone opens file picker
  uploadZone.addEventListener('click', (e) => {
    if (e.target !== fileInput && !e.target.classList.contains('upload-link')) {
      fileInput.click();
    }
  });
});
