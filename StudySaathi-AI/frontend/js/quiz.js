// StudySaathi AI - Adaptive Quiz Arena Controller (Real-Time Zero Lag)

let currentTopic = "";
let questionsList = [];
let currentIndex = 0;
let correctCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const topicParam = urlParams.get("topic");

  if (topicParam) {
    startQuizForTopic(topicParam);
  }
});

function startCustomQuiz() {
  const customTopic = document.getElementById("custom-topic-input").value.trim();
  if (!customTopic) {
    showToast("Please enter a topic name", "error");
    return;
  }
  startQuizForTopic(customTopic);
}

async function startQuizForTopic(topic) {
  currentTopic = topic;
  const setupStage = document.getElementById("quiz-setup-stage");
  const activeStage = document.getElementById("quiz-active-stage");
  const resultStage = document.getElementById("quiz-result-stage");

  setupStage.style.display = "none";
  resultStage.style.display = "none";
  activeStage.style.display = "block";

  document.getElementById("quiz-topic-title").textContent = topic;
  document.getElementById("question-text").textContent = "Loading question...";
  document.getElementById("options-container").innerHTML = "";
  document.getElementById("quiz-feedback-box").style.display = "none";
  document.getElementById("next-question-btn").style.display = "none";

  try {
    const res = await fetchAPI("/api/quiz/generate", "POST", { topic: topic });
    questionsList = res.mcqs || [];
    
    if (questionsList.length === 0) {
      throw new Error("No questions returned");
    }

    currentIndex = 0;
    correctCount = 0;
    renderQuestion(currentIndex);
  } catch (err) {
    showToast("Error loading questions. Using emergency fallback test.", "info");
    // Guarantee test never fails
    questionsList = [
      {
        question: `What is the core working principle of ${topic}?`,
        options: [
          "A) Mathematical optimization of loss or natural laws",
          "B) Random non-evaluated assignment",
          "C) Manual constant hardcoding only",
          "D) Memory scan without logic"
        ],
        answer: "A",
        explanation: `${topic} functions by systematically balancing inputs against objective criteria or natural conservation laws.`
      }
    ];
    currentIndex = 0;
    correctCount = 0;
    renderQuestion(currentIndex);
  }
}

function renderQuestion(index) {
  const q = questionsList[index];
  document.getElementById("question-progress-badge").textContent = `Q ${index + 1} / ${questionsList.length}`;
  document.getElementById("question-text").textContent = `Q${index + 1}. ${q.question}`;

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";
  document.getElementById("quiz-feedback-box").style.display = "none";
  document.getElementById("next-question-btn").style.display = "none";

  q.options.forEach(opt => {
    const optBtn = document.createElement("button");
    optBtn.className = "quiz-option";
    optBtn.textContent = opt;
    optBtn.onclick = () => handleAnswerSelect(optBtn, opt[0], q.answer, q.explanation);
    optionsContainer.appendChild(optBtn);
  });
}

function readCurrentQuestionAloud() {
  if (questionsList.length > 0 && questionsList[currentIndex]) {
    const q = questionsList[currentIndex];
    const textToSpeak = `${q.question}. Options are: ${q.options.join(', ')}`;
    speakText(textToSpeak, localStorage.getItem("studysaathi_lang") || "en");
  }
}

function handleAnswerSelect(selectedBtn, selectedLetter, correctLetter, explanation) {
  const allOptions = document.querySelectorAll(".quiz-option");
  allOptions.forEach(btn => btn.onclick = null);

  const isCorrect = selectedLetter.toUpperCase() === correctLetter.toUpperCase();

  if (isCorrect) {
    selectedBtn.classList.add("correct");
    correctCount++;
  } else {
    selectedBtn.classList.add("incorrect");
    allOptions.forEach(btn => {
      if (btn.textContent.trim().startsWith(correctLetter)) {
        btn.classList.add("correct");
      }
    });
  }

  // Diagram logic based on topic
  let diagramHtml = "";
  const tLower = currentTopic.toLowerCase();
  if (tLower.includes("photo")) {
    diagramHtml = `<div class="mermaid-diagram-box"><div class="mermaid">graph LR; Light[Sunlight] + Water[H2O] --> Thylakoid[Thylakoid Membrane] --> O2[Oxygen Released] + ATP[ATP/NADPH];</div></div>`;
  } else if (tLower.includes("newton")) {
    diagramHtml = `<div class="mermaid-diagram-box"><div class="mermaid">graph LR; F[Force F] --> Mult[m x a]; Mult --> Change[Accelerates Object];</div></div>`;
  } else if (tLower.includes("tree")) {
    diagramHtml = `<div class="mermaid-diagram-box"><div class="mermaid">graph TD; Node[Feature Split] -->|Entropy Reduced| Leaf1[Pure Class A]; Node -->|Remaining Impurity| Leaf2[Sub-branch];</div></div>`;
  } else if (tLower.includes("neural")) {
    diagramHtml = `<div class="mermaid-diagram-box"><div class="mermaid">graph LR; In[Input X] --> Dense[Weights W] --> NonLinear[Activation ReLU/Sigmoid] --> Out[Prediction];</div></div>`;
  }

  // Show explanation + diagram
  const feedback = document.getElementById("quiz-feedback-box");
  feedback.innerHTML = `
    <div style="font-size:0.95rem; margin-bottom:8px;">
      <strong>${isCorrect ? '✅ Correct Answer!' : '❌ Incorrect.'}</strong>
    </div>
    <div style="line-height:1.6; color:var(--text-main);">${explanation}</div>
    ${diagramHtml}
  `;
  feedback.style.display = "block";

  // Re-run mermaid parser for diagram
  if (window.mermaid) {
    setTimeout(() => {
      try { window.mermaid.run(); } catch(e) {}
    }, 50);
  }

  // Next Question Button
  const nextBtn = document.getElementById("next-question-btn");
  nextBtn.textContent = (currentIndex + 1 < questionsList.length) ? "Next Question →" : "Submit & Finish Test 🎯";
  nextBtn.style.display = "block";
}

async function goToNextQuestion() {
  if (currentIndex + 1 < questionsList.length) {
    currentIndex++;
    renderQuestion(currentIndex);
  } else {
    await finishQuiz();
  }
}

async function finishQuiz() {
  const activeStage = document.getElementById("quiz-active-stage");
  const resultStage = document.getElementById("quiz-result-stage");

  activeStage.style.display = "none";
  resultStage.style.display = "block";

  const scorePct = Math.round((correctCount / questionsList.length) * 100);
  document.getElementById("result-score-text").textContent = `Score: ${scorePct}% (${correctCount}/${questionsList.length})`;

  const emoji = scorePct >= 80 ? "🏆" : (scorePct >= 60 ? "👍" : "⚠️");
  document.getElementById("result-emoji").textContent = emoji;

  let msg = "";
  if (scorePct >= 80) {
    msg = `Outstanding performance on ${currentTopic}! Your mastery is logged and status updated to Mastered.`;
  } else if (scorePct >= 60) {
    msg = `Good effort on ${currentTopic}. A 15-minute quick revision session in Study Buddy will get you into the top tier!`;
  } else {
    msg = `Conceptual gaps identified in ${currentTopic}. Added to Today's Priority Study Plan for active recall.`;
  }
  document.getElementById("result-detail").textContent = msg;

  // Submit to backend
  try {
    await fetchAPI("/api/quiz/submit", "POST", {
      topic: currentTopic,
      score_pct: scorePct
    });
    showToast("Mastery score updated in database! 🎉", "success");
  } catch (err) {
    console.error("Failed to submit score:", err);
  }
}

function resetQuiz() {
  document.getElementById("quiz-result-stage").style.display = "none";
  document.getElementById("quiz-setup-stage").style.display = "block";
}
