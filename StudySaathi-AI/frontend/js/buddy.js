// StudySaathi AI - Study Buddy Controller (Multilingual, Voice & Zoom Mode)

let currentMode = "explain";
let chatLanguage = localStorage.getItem("studysaathi_lang") || "en";
let isRecording = false;
let voiceRecognition = null;
let isZoomed = false;

document.addEventListener("DOMContentLoaded", () => {
  setChatLanguage(chatLanguage);

  // Mode switcher listeners
  const modePills = document.querySelectorAll(".mode-pill");
  modePills.forEach(pill => {
    pill.addEventListener("click", () => {
      modePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentMode = pill.getAttribute("data-mode");
      showToast(`Mode: ${pill.textContent.trim()}`, "info");
    });
  });

  // Chat form submit
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = chatInput.value.trim();
    if (!prompt) return;

    chatInput.value = "";
    await sendMessage(prompt);
  });

  // Clear chat
  document.getElementById("clear-chat-btn").addEventListener("click", () => {
    const messages = document.getElementById("chat-messages");
    messages.innerHTML = `
      <div class="message-bubble ai">
        <strong>StudySaathi AI:</strong><br>
        Chat cleared. Ready for your next study topic! 🚀
      </div>
    `;
  });

  // Check URL parameters (e.g. ?topic=Neural%20Networks&mode=explain)
  const urlParams = new URLSearchParams(window.location.search);
  const topicParam = urlParams.get("topic");
  const modeParam = urlParams.get("mode");

  if (modeParam) {
    const matchingPill = document.querySelector(`.mode-pill[data-mode="${modeParam}"]`);
    if (matchingPill) matchingPill.click();
  }

  if (topicParam) {
    sendMessage(`Explain the core fundamentals and exam points for ${topicParam}`);
  }
});

function setChatLanguage(lang) {
  chatLanguage = lang;
  localStorage.setItem("studysaathi_lang", lang);
  document.querySelectorAll(".lang-selector .lang-pill").forEach(p => p.classList.remove("active"));
  const btn = document.getElementById(`chat-lang-${lang}`);
  if (btn) btn.classList.add("active");
  showToast(`Study Buddy Language: ${lang === 'te' ? 'తెలుగు' : (lang === 'hi' ? 'हिंदी' : 'English')}`, "info");
}

function toggleZoomMode() {
  const container = document.getElementById("chat-container-box");
  const icon = document.getElementById("zoom-icon");
  const text = document.getElementById("zoom-text");

  isZoomed = !isZoomed;
  if (isZoomed) {
    container.classList.add("zoomed");
    icon.textContent = "✕";
    text.textContent = "Exit Zoom";
    showToast("Panoramic Fullscreen Mode Activated ⛶", "info");
  } else {
    container.classList.remove("zoomed");
    icon.textContent = "⛶";
    text.textContent = "Zoom Panoramic";
  }
}

function quickAsk(topic) {
  sendMessage(`Teach me about ${topic}`);
}

// ==========================================
// 🎙️ VOICE INPUT CONTROLLER
// ==========================================
function toggleVoiceInput() {
  const micBtn = document.getElementById("mic-btn");
  const chatInput = document.getElementById("chat-input");

  if (isRecording) {
    if (voiceRecognition) voiceRecognition.stop();
    isRecording = false;
    micBtn.classList.remove("recording");
    showToast("Microphone stopped", "info");
  } else {
    voiceRecognition = initVoiceRecognition(
      chatLanguage,
      (transcript) => {
        chatInput.value = transcript;
        showToast("Voice recognized! Sending...", "success");
        setTimeout(() => sendMessage(transcript), 400);
      },
      () => {
        isRecording = false;
        micBtn.classList.remove("recording");
      },
      (err) => {
        isRecording = false;
        micBtn.classList.remove("recording");
      }
    );

    if (voiceRecognition) {
      voiceRecognition.start();
      isRecording = true;
      micBtn.classList.add("recording");
      showToast(`Listening in ${chatLanguage.toUpperCase()}... Speak now 🎙️`, "info");
    }
  }
}

async function sendMessage(prompt) {
  const messagesContainer = document.getElementById("chat-messages");
  const sendBtn = document.getElementById("send-btn");

  // Append user bubble
  const userBubble = document.createElement("div");
  userBubble.className = "message-bubble user";
  userBubble.textContent = prompt;
  messagesContainer.appendChild(userBubble);

  // Append loading bubble
  const loadingBubble = document.createElement("div");
  loadingBubble.className = "message-bubble ai";
  loadingBubble.id = "loading-bubble";
  loadingBubble.innerHTML = `<em>Generating explanation & visual diagram (${currentMode} mode)... ⏳</em>`;
  messagesContainer.appendChild(loadingBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  sendBtn.disabled = true;

  try {
    const res = await fetchAPI("/api/buddy/chat", "POST", {
      prompt: prompt,
      mode: currentMode,
      language: chatLanguage
    });

    loadingBubble.remove();

    const aiBubble = document.createElement("div");
    aiBubble.className = "message-bubble ai";

    const cleanRawResponse = res.response;
    const safeEscaped = cleanRawResponse.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    aiBubble.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">
          ${res.mode} • ${res.language ? res.language.toUpperCase() : 'EN'} • ${res.source === 'local_llm' ? '🟢 Local Ollama' : '⚡ Fast Local AI'}
        </span>
        <button class="btn btn-secondary" style="font-size:0.72rem; padding:3px 8px;" onclick="speakText('${safeEscaped}', '${chatLanguage}')">
          🔊 Listen
        </button>
      </div>
      <div>${renderEnhancedContent(res.response)}</div>
    `;
    messagesContainer.appendChild(aiBubble);

  } catch (err) {
    loadingBubble.remove();
    const errorBubble = document.createElement("div");
    errorBubble.className = "message-bubble ai";
    errorBubble.style.borderColor = "var(--danger)";
    errorBubble.textContent = "Apologies, I encountered an issue. Please try again.";
    messagesContainer.appendChild(errorBubble);
  } finally {
    sendBtn.disabled = false;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}
