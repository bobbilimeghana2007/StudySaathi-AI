// StudySaathi AI - Brain Break Games Controller

const conceptPairs = [
  { term: "MYCIN", def: "Stanford Backward-Chaining Medical Expert System (1970s)" },
  { term: "RuBisCO", def: "Primary enzyme for plant Carbon Fixation in Stroma" },
  { term: "Newton's 2nd Law", def: "F = m * a (Force equals mass times acceleration)" },
  { term: "Entropy (ID3)", def: "Measure of impurity or disorder in data subsets" }
];

let selectedTermCard = null;
let selectedDefCard = null;
let matchedCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  resetMatcherGame();
  startBreathingTextCycle();
});

function switchGameTab(tabName) {
  document.querySelectorAll(".game-tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${tabName}`).classList.add("active");

  const matcherView = document.getElementById("game-matcher-view");
  const zenView = document.getElementById("game-zen-view");

  if (tabName === "matcher") {
    matcherView.style.display = "block";
    zenView.style.display = "none";
  } else {
    matcherView.style.display = "none";
    zenView.style.display = "block";
  }
}

function resetMatcherGame() {
  matchedCount = 0;
  selectedTermCard = null;
  selectedDefCard = null;
  document.getElementById("matcher-score").textContent = `Score: 0 / ${conceptPairs.length}`;
  document.getElementById("matcher-congrats").style.display = "none";

  const grid = document.getElementById("matcher-grid");
  grid.innerHTML = "";

  // Shuffle terms and definitions separately
  const terms = conceptPairs.map((p, idx) => ({ id: idx, text: p.term })).sort(() => Math.random() - 0.5);
  const defs = conceptPairs.map((p, idx) => ({ id: idx, text: p.def })).sort(() => Math.random() - 0.5);

  // Left column: Terms
  const termsCol = document.createElement("div");
  termsCol.style.cssText = "display: flex; flex-direction: column; gap: 12px;";
  terms.forEach(t => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.dataset.id = t.id;
    card.dataset.type = "term";
    card.textContent = t.text;
    card.onclick = () => selectCard(card);
    termsCol.appendChild(card);
  });

  // Right column: Definitions
  const defsCol = document.createElement("div");
  defsCol.style.cssText = "display: flex; flex-direction: column; gap: 12px;";
  defs.forEach(d => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.dataset.id = d.id;
    card.dataset.type = "def";
    card.textContent = d.text;
    card.onclick = () => selectCard(card);
    defsCol.appendChild(card);
  });

  grid.appendChild(termsCol);
  grid.appendChild(defsCol);
}

function selectCard(card) {
  if (card.classList.contains("matched")) return;

  const type = card.dataset.type;

  if (type === "term") {
    if (selectedTermCard) selectedTermCard.classList.remove("selected");
    selectedTermCard = card;
    card.classList.add("selected");
  } else {
    if (selectedDefCard) selectedDefCard.classList.remove("selected");
    selectedDefCard = card;
    card.classList.add("selected");
  }

  // Check match if both selected
  if (selectedTermCard && selectedDefCard) {
    if (selectedTermCard.dataset.id === selectedDefCard.dataset.id) {
      // Match!
      selectedTermCard.classList.remove("selected");
      selectedDefCard.classList.remove("selected");
      selectedTermCard.classList.add("matched");
      selectedDefCard.classList.add("matched");
      matchedCount++;
      document.getElementById("matcher-score").textContent = `Score: ${matchedCount} / ${conceptPairs.length}`;
      showToast("Correct Match! 🎯", "success");

      selectedTermCard = null;
      selectedDefCard = null;

      if (matchedCount === conceptPairs.length) {
        document.getElementById("matcher-congrats").style.display = "block";
      }
    } else {
      // Mismatch
      const t = selectedTermCard;
      const d = selectedDefCard;
      showToast("Not quite right, try again!", "error");
      setTimeout(() => {
        t.classList.remove("selected");
        d.classList.remove("selected");
      }, 500);
      selectedTermCard = null;
      selectedDefCard = null;
    }
  }
}

function startBreathingTextCycle() {
  const el = document.getElementById("breath-text");
  if (!el) return;

  setInterval(() => {
    el.textContent = "Breathe In... 🌬️";
    setTimeout(() => {
      el.textContent = "Hold... ✨";
      setTimeout(() => {
        el.textContent = "Breathe Out... 🍃";
      }, 2000);
    }, 3000);
  }, 8000);
}
