document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // ── Tab switching ────────────────────────────────────
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  function switchTab(tabId) {
    tabBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tabId));
    tabPanels.forEach(panel => panel.classList.toggle("active", panel.id === `tab-${tabId}`));
  }

  tabBtns.forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

  // ── Sport icons ──────────────────────────────────────
  const sportIcons = {
    "Alpine Skiing":  "⛷️",
    "Figure Skating": "⛸️",
    "Ice Hockey":     "🏒",
    "Biathlon":       "🎯",
    "Curling":        "🥌",
    "Ski Jumping":    "🎿",
    "Bobsled":        "🛷",
    "Speed Skating":  "💨",
    "Luge":           "🛷",
    "Snowboard":      "🏂",
  };

  // ── Fetch & render activities ────────────────────────
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="" disabled selected></option>';

      Object.entries(activities).forEach(([name, details]) => {
        const spotsLeft = details.max_participants - details.participants.length;
        const icon = sportIcons[name] || "🏅";
        const full = spotsLeft <= 0;

        const card = document.createElement("div");
        card.className = "activity-card" + (full ? " full" : "");
        card.innerHTML = `
          <div class="sport-icon">${icon}</div>
          <div class="sport-info">
            <h4>${name}</h4>
            <p>${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <span class="spot-badge">${full ? "Full" : `${spotsLeft} spots left`}</span>
          </div>
          ${full ? "" : `<button class="card-signup-btn" data-sport="${name}">Sign Up →</button>`}
        `;
        activitiesList.appendChild(card);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (full) option.disabled = true;
        activitySelect.appendChild(option);
      });

      // Wire card sign-up shortcuts
      activitiesList.querySelectorAll(".card-signup-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          activitySelect.value = btn.dataset.sport;
          activitySelect.classList.add("has-value");
          switchTab("signup");
          document.getElementById("email").focus();
        });
      });

      // Track select value changes for floating label
      activitySelect.addEventListener("change", () => {
        activitySelect.classList.toggle("has-value", activitySelect.value !== "");
      });
    } catch (error) {
      activitiesList.innerHTML = '<p class="loading">Failed to load activities. Please try again later.</p>';
      console.error("Error fetching activities:", error);
    }
  }

  // ── Form submission ──────────────────────────────────
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        activitySelect.classList.remove("has-value");
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  fetchActivities();
});
