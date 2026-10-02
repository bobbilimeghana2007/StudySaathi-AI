// StudySaathi AI - Notes to Questions Controller

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-input");
  const notesForm = document.getElementById("notes-text-form");
  const sampleBtn = document.getElementById("load-sample-notes-btn");

  // Sample notes loader - automatically fills & generates questions immediately!
  if (sampleBtn) {
    sampleBtn.addEventListener("click", async () => {
      document.getElementById("topic-title").value = "Decision Trees & Random Forests";
      const sampleText = 
`A Decision Tree splits data recursively into pure subsets.
ID3 uses Entropy and Information Gain. Entropy measures randomness: -sum(p * log2(p)).
CART uses Gini Impurity: 1 - sum(p^2), computationally faster because no logarithms.
Overfitting occurs when trees are too deep. Solved by:
1. Pre-pruning (max_depth, min_samples_leaf).
2. Post-pruning (Cost Complexity Pruning).
Random Forests combine multiple decorrelated trees using bootstrap aggregating (bagging) and random feature subsets to reduce variance.`;

      document.getElementById("notes-content").value = sampleText;
      showToast("Loaded sample notes! Synthesizing questions... 🎯", "info");
      
      // Auto-generate immediately so student gets instant output!
      await generateQuestions("Decision Trees & Random Forests");
    });
  }

  // File upload handler
  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

      showToast(`Uploading & reading ${file.name}... 📂`, "info");

      try {
        const res = await fetchAPI("/api/notes/upload", "POST", formData);
        showToast("Document parsed successfully! 📄", "success");

        const cleanTopic = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        document.getElementById("topic-title").value = cleanTopic;
        document.getElementById("notes-content").value = res.note.extracted_text || res.note.summary;
        
        // Auto-trigger question generation immediately
        await generateQuestions(cleanTopic, res.note.id);
      } catch (err) {
        showToast("Error reading file. You can paste the text directly below!", "error");
      }
    });
  }

  // Form submit handler
  if (notesForm) {
    notesForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const topic = document.getElementById("topic-title").value.trim();
      await generateQuestions(topic);
    });
  }
});

async function generateQuestions(topic, noteId = null) {
  const btn = document.getElementById("generate-btn");
  const contentArea = document.getElementById("questions-content");
  const notesText = document.getElementById("notes-content").value.trim();

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Synthesizing Questions with Local AI... ⏳</span>`;
  }

  contentArea.innerHTML = `
    <div style="text-align:center; padding: 40px;">
      <div style="font-size: 2.2rem; margin-bottom: 10px;">🤖</div>
      <p style="color: var(--text-muted); font-size:0.95rem;">Reading notes content and synthesizing MCQs, 2-mark & 10-mark questions...</p>
    </div>
  `;

  try {
    const res = await fetchAPI("/api/quiz/generate", "POST", {
      topic: topic,
      note_id: noteId,
      text_content: notesText
    });

    renderQuestionsOutput(topic, res);
    showToast("Questions synthesized successfully! 🎯", "success");
  } catch (err) {
    contentArea.innerHTML = `<div style="color: var(--danger); padding: 20px;">Failed to generate questions. Please try again.</div>`;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>⚡ Synthesize Exam Questions</span>`;
    }
  }
}

function renderQuestionsOutput(topic, data) {
  const contentArea = document.getElementById("questions-content");
  contentArea.innerHTML = "";

  // 1. MCQS SECTION
  const mcqHeader = document.createElement("div");
  mcqHeader.innerHTML = `
    <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; color: #c7d2fe;">
      1. Multiple Choice Questions (Interactive Assessment)
    </h4>
  `;
  contentArea.appendChild(mcqHeader);

  if (data.mcqs && data.mcqs.length > 0) {
    data.mcqs.forEach((mcq, idx) => {
      const qBlock = document.createElement("div");
      qBlock.className = "question-block";
      qBlock.innerHTML = `
        <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 10px;">
          Q${idx + 1}. ${mcq.question}
        </div>
        <div class="mcq-options-container" id="mcq-opts-${idx}">
          ${mcq.options.map(opt => `
            <button class="mcq-option-btn" onclick="checkNoteMCQ(this, '${opt[0]}', '${mcq.answer}', 'exp-${idx}')">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="exp-${idx}" style="display: none; margin-top: 10px; padding: 10px 14px; border-radius: 6px; background: rgba(0,0,0,0.3); font-size: 0.85rem; border-left: 3px solid var(--primary);">
          <strong>Explanation:</strong> ${mcq.explanation}
        </div>
      `;
      contentArea.appendChild(qBlock);
    });
  }

  // 2. SHORT QUESTIONS
  if (data.short_questions && data.short_questions.length > 0) {
    const shortBlock = document.createElement("div");
    shortBlock.className = "question-block";
    shortBlock.style.marginTop = "20px";
    shortBlock.innerHTML = `
      <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; color: #67e8f9;">
        2. Short Conceptual Questions (2-3 Marks)
      </h4>
      <ul style="margin-left: 20px; line-height: 1.8; font-size: 0.92rem;">
        ${data.short_questions.map(q => `<li>${q}</li>`).join('')}
      </ul>
    `;
    contentArea.appendChild(shortBlock);
  }

  // 3. LONG QUESTION
  if (data.long_question) {
    const longBlock = document.createElement("div");
    longBlock.className = "question-block";
    longBlock.style.marginTop = "14px";
    longBlock.innerHTML = `
      <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; color: #fde047;">
        3. Comprehensive Exam Question (10 Marks)
      </h4>
      <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-main);">${data.long_question}</p>
      <div style="margin-top: 12px;">
        <a href="/buddy?topic=${encodeURIComponent(topic)}&mode=exam" class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;">
          View Model 10-Mark Answer in Study Buddy 📝
        </a>
      </div>
    `;
    contentArea.appendChild(longBlock);
  }
}

function checkNoteMCQ(button, selectedLetter, correctLetter, expId) {
  const parent = button.parentElement;
  const buttons = parent.querySelectorAll(".mcq-option-btn");
  buttons.forEach(btn => btn.disabled = true);

  if (selectedLetter.toUpperCase() === correctLetter.toUpperCase()) {
    button.style.background = "rgba(16, 185, 129, 0.25)";
    button.style.borderColor = "var(--success)";
    button.style.color = "#34d399";
  } else {
    button.style.background = "rgba(239, 68, 68, 0.25)";
    button.style.borderColor = "var(--danger)";
    button.style.color = "#f87171";

    buttons.forEach(btn => {
      if (btn.textContent.trim().startsWith(correctLetter)) {
        btn.style.borderColor = "var(--success)";
        btn.style.color = "#34d399";
      }
    });
  }

  const exp = document.getElementById(expId);
  if (exp) exp.style.display = "block";
}
