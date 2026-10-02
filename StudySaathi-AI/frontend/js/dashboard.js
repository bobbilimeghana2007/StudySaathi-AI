// StudySaathi AI - Dashboard Controller (Theme Switcher & Clean Layout)

let currentCategory = "all";
let pomodoroSeconds = 25 * 60;
let pomodoroInterval = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Restore saved theme
  const savedTheme = localStorage.getItem("studysaathi_theme") || "nebula";
  setAppTheme(savedTheme, false);

  await loadDashboardData();
  await loadStudyPlan();
});

// ==========================================
// 🎨 4 COLORFUL THEMES SWITCHER
// ==========================================
function setAppTheme(themeName, showNotification = true) {
  document.body.classList.remove("theme-nebula", "theme-sunset", "theme-emerald", "theme-light");
  
  if (themeName !== "nebula") {
    document.body.classList.add(`theme-${themeName}`);
  }

  // Update button active state
  document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById(`btn-theme-${themeName}`);
  if (activeBtn) activeBtn.classList.add("active");

  localStorage.setItem("studysaathi_theme", themeName);

  if (showNotification) {
    const themeNames = {
      nebula: "🌌 Cosmic Nebula Theme",
      sunset: "🌅 Cyberpunk Sunset Theme",
      emerald: "🌿 Zen Emerald Focus Theme",
      light: "☀️ Clean Daylight Theme"
    };
    showToast(`Switched to ${themeNames[themeName] || themeName}!`, "success");
  }
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll("#filter-all, #filter-college, #filter-school").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadDashboardData();
}

async function loadDashboardData() {
  try {
    const data = await fetchAPI(`/api/dashboard?category=${currentCategory}`);
    const summary = data.summary;
    const priority = data.priority;

    // Student Greeting & Profile
    if (summary.student) {
      document.getElementById("greeting-title").textContent = `Good morning, ${summary.student.name || 'Friend'}! 👋`;
      document.getElementById("greeting-sub").textContent = 
        `${summary.student.institution || 'Curriculum'} • ${summary.student.grade_or_year || ''} • Target: ${summary.student.target_percentage}%`;

      const badge = document.getElementById("student-badge");
      if (summary.student.category === "school") {
        badge.textContent = "🎒 School Student";
      } else if (summary.student.category === "intermediate") {
        badge.textContent = "🔬 Intermediate / +2";
      } else {
        badge.textContent = "🏛️ College (B.Tech)";
      }
    }

    // Metric Cards
    document.getElementById("val-streak").textContent = `${summary.streak} Days`;
    document.getElementById("streak-text").textContent = `${summary.streak} Day Streak`;
    document.getElementById("val-topics").textContent = `${summary.completed_topics} / ${summary.total_topics}`;
    document.getElementById("val-mastery").textContent = `${summary.avg_mastery}%`;
    document.getElementById("val-quizzes").textContent = `${summary.total_quizzes} Tests`;

    // Today's Priority Banner
    if (priority && priority.length > 0) {
      const topPrio = priority[0];
      document.getElementById("priority-title").textContent = topPrio.title;
      document.getElementById("priority-desc").textContent = topPrio.detail;
      document.getElementById("priority-badge").textContent = topPrio.badge;

      const cleanTopic = topPrio.title.replace(/.*Priority Review: /i, '').replace(/.*Goal: /i, '').trim();
      document.getElementById("priority-btn").href = `/buddy?topic=${encodeURIComponent(cleanTopic)}`;
    }

    // Weak Topics Rendering
    const weakList = document.getElementById("weak-topics-list");
    weakList.innerHTML = "";

    if (!summary.weak_topics || summary.weak_topics.length === 0) {
      weakList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.9rem;">
          🎉 No critical weak spots detected in this curriculum view!
        </div>
      `;
    } else {
      summary.weak_topics.forEach(t => {
        const row = document.createElement("div");
        row.className = "weak-topic-row";
        const catBadge = t.category === "school" ? "🎒 School" : "🏛️ College";

        row.innerHTML = `
          <div class="topic-meta">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="topic-name">${t.name} <span style="font-size:0.7rem; color:var(--text-dim);">[${catBadge}]</span></span>
              <span class="score-badge ${t.mastery_score < 50 ? 'danger' : 'warning'}">${t.mastery_score}% Mastery</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-fill weak" style="width: ${Math.max(8, t.mastery_score)}%;"></div>
            </div>
          </div>
          <div style="margin-left: 14px; display:flex; gap:6px;">
            <a href="/quiz?topic=${encodeURIComponent(t.name)}" class="btn btn-secondary" style="font-size: 0.76rem; padding: 5px 8px;">
              Quiz 🧪
            </a>
            <a href="/buddy?topic=${encodeURIComponent(t.name)}&mode=explain" class="btn btn-primary" style="font-size: 0.76rem; padding: 5px 8px;">
              Revise 💡
            </a>
          </div>
        `;
        weakList.appendChild(row);
      });
    }

    // Strong Topics Rendering
    const strongList = document.getElementById("strong-topics-list");
    strongList.innerHTML = "";
    if (summary.strong_topics && summary.strong_topics.length > 0) {
      summary.strong_topics.forEach(t => {
        const item = document.createElement("div");
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.85rem;";
        item.innerHTML = `
          <span style="color: var(--text-main);">✓ ${t.name}</span>
          <span class="score-badge success">${t.mastery_score}%</span>
        `;
        strongList.appendChild(item);
      });
    } else {
      strongList.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-dim);">Take quizzes with score ≥ 75% to master topics.</span>`;
    }

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

async function loadStudyPlan() {
  try {
    const data = await fetchAPI("/api/plan");
    const daysList = document.getElementById("plan-days-list");
    daysList.innerHTML = "";

    if (!data.days || data.days.length === 0) {
      daysList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.9rem;">
          No active plan generated yet. <a href="/planner" style="color: var(--primary);">Create one now →</a>
        </div>
      `;
      return;
    }

    if (data.plan_info) {
      document.getElementById("plan-subject-sub").textContent = 
        `${data.plan_info.subject_name} • ${data.plan_info.total_days}-Day Strategy (${data.plan_info.daily_hours} hrs/day)`;
    }

    data.days.forEach(day => {
      const card = document.createElement("div");
      card.style.cssText = `
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        opacity: ${day.is_completed ? '0.6' : '1'};
        transition: all 0.2s ease;
      `;

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="checkbox" ${day.is_completed ? 'checked' : ''} 
            style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);" 
            onchange="toggleDayStatus(${day.id})">
          <div>
            <div style="font-size: 0.9rem; font-weight: 600; text-decoration: ${day.is_completed ? 'line-through' : 'none'};">
              Day ${day.day_number}: ${day.topic_name}
            </div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">
              📖 ${day.learn_minutes}m Learn • ✍️ ${day.practice_minutes}m Practice • 🧪 ${day.quiz_minutes}m Quiz • 🔄 ${day.revision_minutes}m Revise
            </div>
          </div>
        </div>
        <a href="/quiz?topic=${encodeURIComponent(day.topic_name)}" class="btn btn-secondary" style="font-size: 0.72rem; padding: 4px 8px;">
          Quiz 🧪
        </a>
      `;
      daysList.appendChild(card);
    });

  } catch (err) {
    console.error("Plan load error:", err);
  }
}

async function toggleDayStatus(dayId) {
  try {
    const res = await fetchAPI(`/api/plan/day/${dayId}/toggle`, "POST");
    showToast(res.is_completed ? "Day completed! 🎉" : "Day unmarked", "info");
    await loadDashboardData();
    await loadStudyPlan();
  } catch (err) {
    showToast("Failed to toggle status", "error");
  }
}

// ==========================================
// ⏱️ POMODORO TIMER
// ==========================================
function togglePomodoroTimer() {
  const btn = document.getElementById("pomo-toggle-btn");
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    btn.textContent = "▶️";
    showToast("Focus timer paused", "info");
  } else {
    btn.textContent = "⏸️";
    showToast("Focus session started: 25 minutes! 🎯", "success");
    pomodoroInterval = setInterval(() => {
      pomodoroSeconds--;
      if (pomodoroSeconds <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        pomodoroSeconds = 25 * 60;
        btn.textContent = "▶️";
        showToast("🔔 25-Minute Focus session complete! Take a break.", "success");
      }
      updatePomodoroDisplay();
    }, 1000);
  }
}

function updatePomodoroDisplay() {
  const mins = Math.floor(pomodoroSeconds / 60);
  const secs = pomodoroSeconds % 60;
  document.getElementById("timer-display").textContent = 
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
