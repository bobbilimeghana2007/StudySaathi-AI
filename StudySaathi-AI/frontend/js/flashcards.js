// StudySaathi AI - Flashcards Controller

let flashcards = [];
let currentIndex = 0;
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", async () => {
  await loadCards();
});

async function loadCards() {
  try {
    flashcards = await fetchAPI(`/api/flashcards?category=${currentCategory}`);
    currentIndex = 0;
    renderCurrentCard();
  } catch (err) {
    console.error("Failed to load flashcards:", err);
  }
}

function filterCards(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll("#btn-all, #btn-college, #btn-school").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadCards();
}

function renderCurrentCard() {
  const cardEl = document.getElementById("flashcard-card");
  cardEl.classList.remove("flipped");

  if (!flashcards || flashcards.length === 0) {
    document.getElementById("card-front-text").textContent = "No flashcards found for this category.";
    document.getElementById("card-back-text").textContent = "";
    document.getElementById("card-counter").textContent = "0 of 0";
    return;
  }

  const card = flashcards[currentIndex];
  document.getElementById("card-counter").textContent = `Card ${currentIndex + 1} of ${flashcards.length}`;
  document.getElementById("card-topic-badge").textContent = card.topic_name;
  document.getElementById("card-front-text").textContent = card.front_question;
  document.getElementById("card-back-text").textContent = card.back_answer;
  document.getElementById("card-hint-text").textContent = card.hint ? `Hint: ${card.hint}` : "";
}

function flipCurrentCard() {
  document.getElementById("flashcard-card").classList.toggle("flipped");
}

function nextCard() {
  if (currentIndex + 1 < flashcards.length) {
    currentIndex++;
    renderCurrentCard();
  } else {
    currentIndex = 0;
    renderCurrentCard();
    showToast("Completed the deck! Cycling to beginning.", "info");
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentCard();
  }
}

function markMastery(isMastered) {
  showToast(isMastered ? "Marked as Mastered! 🎉" : "Saved for review ⚠️", isMastered ? "success" : "info");
  nextCard();
}

function readFlashcardAloud() {
  if (flashcards.length > 0 && flashcards[currentIndex]) {
    const card = flashcards[currentIndex];
    speakText(`Question: ${card.front_question}`, localStorage.getItem("studysaathi_lang") || "en");
  }
}

// Keyboard shortcuts (Space = flip, ArrowRight = next, ArrowLeft = prev)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flipCurrentCard();
  } else if (e.code === "ArrowRight") {
    nextCard();
  } else if (e.code === "ArrowLeft") {
    prevCard();
  }
});
