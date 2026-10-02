// StudySaathi AI - Study Planner Controller

document.addEventListener("DOMContentLoaded", async () => {
  await loadCurrentPlan();

  // Load college sample
  const collegeBtn = document.getElementById("load-college-btn");
  if (collegeBtn) {
    collegeBtn.addEventListener("click", () => {
      document.getElementById("subject-name").value = "Artificial Intelligence";
      document.getElementById("topics-input").value = "history of ai, dart application, mycin expert system";
      document.getElementById("days-input").value = 5;
      document.getElementById("hours-input").value = 2.5;
      showToast("Loaded AI & Expert Systems syllabus! 🏛️", "info");
    });
  }

  // Load school sample
  const schoolBtn = document.getElementById("load-school-btn");
  if (schoolBtn) {
    schoolBtn.addEventListener("click", () => {
      document.getElementById("subject-name").value = "Science & Mathematics (Class 10th)";
      document.getElementById("topics-input").value = "Newton's Three Laws of Motion, Photosynthesis, Quadratic Equations";
      document.getElementById("days-input").value = 5;
      document.getElementById("hours-input").value = 2.0;
      showToast("Loaded High School Science syllabus! 🎒", "info");
    });
  }

  // Generate Plan Form
  const planForm = document.getElementById("plan-form");
  if (planForm) {
    planForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("generate-plan-btn");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Structuring Schedule... ⏳</span>`;
      }

      const subject = document.getElementById("subject-name").value.trim();
      const topicsRaw = document.getElementById("topics-input").value.trim();
      const days = parseInt(document.getElementById("days-input").value) || 5;
      const hours = parseFloat(document.getElementById("hours-input").value) || 2.5;

      // Robust splitting by BOTH newlines and commas
      const topics = topicsRaw
        .replace(/\n/g, ',')
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      try {
        await fetchAPI("/api/plan/generate", "POST", {
          subject: subject,
          topics: topics,
          days: days,
          daily_hours: hours
        });

        showToast(`Created ${days}-day study plan! 🚀`, "success");
        await loadCurrentPlan();
      } catch (err) {
        showToast("Error generating plan", "error");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>✨ Generate Study Plan</span>`;
        }
      }
    });
  }
});

async function loadCurrentPlan() {
  try {
    const data = await fetchAPI("/api/plan");
    const timeline = document.getElementById("plan-timeline");
    if (!timeline) return;
    timeline.innerHTML = "";

    if (!data.days || data.days.length === 0) {
      timeline.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No active study plan found. Fill out the form on the left to generate one!
        </div>
      `;
      return;
    }

    const plan = data.plan_info;
    if (plan) {
      const titleEl = document.getElementById("plan-title");
      const subEl = document.getElementById("plan-subtitle");
      if (titleEl) titleEl.textContent = `${plan.subject_name} Master Schedule`;
      if (subEl) subEl.textContent = `${plan.total_days} Days Total • ${plan.daily_hours} Hours Allocated Daily`;
    }

    const completedCount = data.days.filter(d => d.is_completed).length;
    const progressPill = document.getElementById("plan-progress-pill");
    if (progressPill) {
      progressPill.textContent = `${completedCount} / ${data.days.length} Days Completed`;
    }

    data.days.forEach(day => {
      const card = document.createElement("div");
      card.className = "glass-card";
      card.style.cssText = `
        padding: 16px 20px;
        opacity: ${day.is_completed ? '0.65' : '1'};
        border-color: ${day.is_completed ? 'var(--border-glass)' : 'var(--border-highlight)'};
      `;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <input type="checkbox" ${day.is_completed ? 'checked' : ''} 
              style="width: 20px; height: 20px; cursor: pointer; margin-top: 4px; accent-color: var(--primary);" 
              onchange="toggleDayStatus(${day.id})">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background: var(--primary); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">
                  DAY ${day.day_number}
                </span>
                <h4 style="font-size: 1.02rem; font-weight: 600; text-decoration: ${day.is_completed ? 'line-through' : 'none'};">
                  ${day.topic_name}
                </h4>
              </div>

              <!-- TIME BLOCKS -->
              <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                <span style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #c7d2fe; padding: 3px 8px; border-radius: 6px; font-size: 0.76rem;">
                  📖 Learn: ${day.learn_minutes}m
                </span>
                <span style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #67e8f9; padding: 3px 8px; border-radius: 6px; font-size: 0.76rem;">
                  ✍️ Practice: ${day.practice_minutes}m
                </span>
                <span style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fde047; padding: 3px 8px; border-radius: 6px; font-size: 0.76rem;">
                  🧪 Quiz: ${day.quiz_minutes}m
                </span>
                <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #86efac; padding: 3px 8px; border-radius: 6px; font-size: 0.76rem;">
                  🔄 Revise: ${day.revision_minutes}m
                </span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 6px;">
            <a href="/buddy?topic=${encodeURIComponent(day.topic_name)}" class="btn btn-secondary" style="font-size: 0.76rem; padding: 5px 10px;">
              Buddy 🤖
            </a>
            <a href="/quiz?topic=${encodeURIComponent(day.topic_name)}" class="btn btn-primary" style="font-size: 0.76rem; padding: 5px 10px;">
              Quiz 🧪
            </a>
          </div>
        </div>
      `;

      timeline.appendChild(card);
    });

  } catch (err) {
    console.error("Error loading plan:", err);
  }
}

async function toggleDayStatus(dayId) {
  try {
    const res = await fetchAPI(`/api/plan/day/${dayId}/toggle`, "POST");
    showToast(res.is_completed ? "Day completed! 🎉" : "Day unmarked", "info");
    await loadCurrentPlan();
  } catch (err) {
    showToast("Failed to toggle status", "error");
  }
}
