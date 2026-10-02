// StudySaathi AI - Shared API Client, Voice, Concentration & Mermaid Helpers

const API_BASE = ""; 

async function fetchAPI(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {}
  };

  if (body && !(body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    showToast(err.message || "Request failed", "error");
    throw err;
  }
}

function showToast(message, type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.borderColor = type === "error" ? "var(--danger)" : (type === "success" ? "var(--success)" : "var(--primary)");
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

async function checkSystemStatus() {
  try {
    const data = await fetchAPI("/api/status");
    const dot = document.getElementById("ai-status-dot");
    const text = document.getElementById("ai-status-text");

    if (dot && text) {
      if (data.ai && data.ai.online) {
        dot.className = "status-dot";
        text.textContent = `Ollama (${data.ai.active_model})`;
      } else {
        dot.className = "status-dot offline";
        text.textContent = "Fast Local Engine";
      }
    }
  } catch (e) {
    const dot = document.getElementById("ai-status-dot");
    const text = document.getElementById("ai-status-text");
    if (dot) dot.className = "status-dot offline";
    if (text) text.textContent = "Offline Mode";
  }
}

// ==========================================
// 🎙️ VOICE SPEECH-TO-TEXT & TEXT-TO-SPEECH
// ==========================================

function initVoiceRecognition(lang = "en", onResult, onEnd, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Voice input supported in Google Chrome & MS Edge.", "info");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  const langCodes = {
    "en": "en-US",
    "te": "te-IN",
    "hi": "hi-IN"
  };
  recognition.lang = langCodes[lang] || "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.debug("Speech error:", event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}

function speakText(text, lang = "en") {
  if (!('speechSynthesis' in window)) {
    showToast("Text-to-speech not supported in browser", "info");
    return;
  }

  window.speechSynthesis.cancel();

  // Strip markdown symbols and mermaid code
  const cleanText = text
    .replace(/```mermaid[\s\S]*?```/g, 'Visual flowchart diagram shown on screen.')
    .replace(/[#*`_]/g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const langCodes = {
    "en": "en-US",
    "te": "te-IN",
    "hi": "hi-IN"
  };
  utterance.lang = langCodes[lang] || "en-US";
  utterance.rate = 1.0;

  window.speechSynthesis.speak(utterance);
}

// ==========================================
// 📊 MERMAID & MARKDOWN RENDERER (100% SYNTAX SAFE)
// ==========================================

function renderEnhancedContent(md) {
  if (!md) return "";

  const placeholders = [];
  
  // 1. Isolate Mermaid diagrams first so markdown <br> never breaks diagram syntax!
  let parsed = md.replace(/```mermaid([\s\S]*?)```/g, (match, code) => {
    const idx = placeholders.length;
    placeholders.push(code.trim());
    return `%%%MERMAID_DIAGRAM_${idx}%%%`;
  });

  // 2. Format standard markdown
  parsed = parsed
    .replace(/^#### (.*$)/gim, '<h4 style="color:#67e8f9; margin:10px 0 4px 0;">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 style="color:#c7d2fe; margin:14px 0 6px 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#fff; margin:16px 0 8px 0;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:#fff; margin:18px 0 10px 0;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/gim, '<pre style="background:rgba(0,0,0,0.5); padding:12px; border-radius:6px; overflow-x:auto;"><code>$1</code></pre>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  parsed = parsed.replace(/(<li>.*<\/li>)/gims, '<ul style="margin-left:20px; line-height:1.7;">$1</ul>');
  parsed = parsed.replace(/\n\n/g, '<p style="margin-bottom:10px;"></p>').replace(/\n/g, '<br>');

  // 3. Re-inject clean, untouched Mermaid syntax inside <pre class="mermaid">
  placeholders.forEach((cleanCode, idx) => {
    const safeCode = cleanCode.replace(/<br\s*\/?>/gi, '\n');
    const safeId = `mermaid-diag-${Date.now()}-${idx}`;
    parsed = parsed.replace(`%%%MERMAID_DIAGRAM_${idx}%%%`, 
      `<div class="mermaid-diagram-box"><pre class="mermaid" id="${safeId}">${safeCode}</pre></div>`);
  });

  // 4. Run Mermaid parser safely
  setTimeout(() => {
    if (window.mermaid) {
      try {
        window.mermaid.run({ querySelector: '.mermaid' });
      } catch (e) {
        console.debug("Mermaid parser note:", e);
      }
    }
  }, 80);

  return parsed;
}

// ==========================================
// 🧘 CONCENTRATION MODE & CALM AUDIO SYNTHESIZER
// ==========================================

let audioContext = null;
let ambientGainNode = null;
let isAmbientPlaying = false;

function toggleConcentrationMode() {
  document.body.classList.toggle("focus-mode");
  const isFocus = document.body.classList.contains("focus-mode");
  showToast(isFocus ? "🎯 Deep Focus Concentration Mode Activated!" : "Standard Theme Restored", "info");
}

function toggleAmbientFocusAudio() {
  if (isAmbientPlaying) {
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    isAmbientPlaying = false;
    showToast("Concentration sound stopped ⏸️", "info");
    return false;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();

    // Create soothing pink/brown noise for deep studying
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    ambientGainNode = audioContext.createGain();
    ambientGainNode.gain.setValueAtTime(0.08, audioContext.currentTime);

    // Gentle low-pass filter
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, audioContext.currentTime);

    whiteNoise.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(audioContext.destination);

    whiteNoise.start(0);
    isAmbientPlaying = true;
    showToast("🌧️ Soft Ambient Study Noise Playing (Binaural Focus)", "success");
    return true;
  } catch (e) {
    showToast("Audio synthesizer not available", "info");
    return false;
  }
}

// ==========================================
// 🎮 BRAIN REFRESH PLAY SESSION (WHEN BORED!)
// ==========================================

const brainPuzzles = [
  {
    q: "🧩 Quick Brain Riddle: I have branches, but no fruit, trunk, or leaves. What am I in Computer Science?",
    a: "A Git Branch (or Decision Tree / Bank branch)!"
  },
  {
    q: "⚡ Speed Math: If you study 45 mins today and double it each day for 3 days, how many minutes will you study on Day 3?",
    a: "180 minutes (3 Hours)! Consistency creates exponential results."
  },
  {
    q: "🍃 Biology Fun: Why are most plant leaves green?",
    a: "Because chlorophyll absorbs blue and red wavelengths of light, reflecting green back to our eyes!"
  }
];

function openBrainPlaySession() {
  let modal = document.getElementById("brain-play-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "brain-play-modal";
    modal.className = "game-modal";
    document.body.appendChild(modal);
  }

  const randomPuzzle = brainPuzzles[Math.floor(Math.random() * brainPuzzles.length)];

  modal.innerHTML = `
    <div class="game-card">
      <div style="font-size:2.8rem; margin-bottom:8px;">🎮</div>
      <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:6px; color:#c7d2fe;">
        Brain Refresh Play Session
      </h2>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px;">
        Whenever you feel tired or bored, take 60 seconds to reset your focus!
      </p>

      <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-highlight); border-radius:12px; padding:20px; text-align:left; margin-bottom:20px;">
        <h4 style="font-size:1rem; margin-bottom:12px; color:#fff;">${randomPuzzle.q}</h4>
        <div id="puzzle-answer" style="display:none; color:#34d399; font-weight:600; font-size:0.95rem; margin-top:10px;">
          💡 Answer: ${randomPuzzle.a}
        </div>
        <button class="btn btn-secondary" id="reveal-ans-btn" style="margin-top:10px; font-size:0.8rem;" onclick="document.getElementById('puzzle-answer').style.display='block'; this.style.display='none';">
          Reveal Answer 🔍
        </button>
      </div>

      <div style="display:flex; justify-content:center; gap:12px;">
        <button class="btn btn-secondary" onclick="openBrainPlaySession()">
          Another Riddle 🔄
        </button>
        <button class="btn btn-primary" onclick="closeBrainPlaySession()">
          I'm Energized! Back to Study 🚀
        </button>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function closeBrainPlaySession() {
  const modal = document.getElementById("brain-play-modal");
  if (modal) modal.style.display = "none";
  showToast("Welcome back! Your mind is refreshed and ready 🎯", "success");
}

document.addEventListener("DOMContentLoaded", checkSystemStatus);
