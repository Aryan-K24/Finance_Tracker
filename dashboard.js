/************************
  AUTH GUARD
*************************/
if (!isAuthenticated()) {
  document.body.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:Segoe UI,sans-serif;
    ">
      <div style="text-align:center">
        <h2>Please log in</h2>
        <p>You must be logged in to access this page.</p>
        <a href="index.html" style="
          display:inline-block;
          margin-top:1rem;
          padding:.6rem 1.2rem;
          background:#2563eb;
          color:#fff;
          border-radius:8px;
          text-decoration:none;
        ">
          Go to Login
        </a>
      </div>
    </div>
  `;
  throw new Error("Not authenticated");
}

/************************
  INIT
*************************/
document.addEventListener("DOMContentLoaded", () => {
  syncUserFromStorage();
  updateDashboardUI();
  renderUpcomingPayments();
});

/* Re-sync when returning to tab */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    syncUserFromStorage();
    updateDashboardUI();
    renderUpcomingPayments();
  }
});
function getMonthlyAdvice(category) {
  const advice = {
    Food:
    "Consider cooking at home more often or setting a weekly food budget to reduce expenses.",
    Shopping:
    "Try tracking impulse purchases and setting a fixed monthly shopping limit.",
    Transport:
    "Planning trips in advance and comparing transport options can help lower travel costs.",
    Entertainment:
    "Review subscriptions and look for free or low-cost entertainment alternatives.",
    Rent:
    "Rent is a major fixed cost. Aim to keep it within a healthy portion of your income.",
  };

  return (
    advice[category] ||
    "Review this category closely and consider setting a spending limit for next month."
  );
}


/************************
  DASHBOARD UI
*************************/
function updateDashboardUI() {
  if (!user) return;

  const cards = document.querySelectorAll(".card .amount");
  const balanceEl = cards[0];
  const spentEl = document.querySelector(".amount.expense");
  const topCategoryEl = cards[2];

  const savingsGoalEl = document.querySelector(".savings-goal");
  const budgetAmountEl = document.querySelector(".budget-amount");
  const percentEl = document.querySelector(".budget-text");
  const progressEl = document.querySelector(".progress-fill");
  const summaryEl = document.querySelector(".monthly-summary-text");

  if (!balanceEl || !spentEl || !summaryEl) return;

  /* ZERO STATE */
  if (!hasUserData()) {
    balanceEl.innerText = "—";
    spentEl.innerText = "—";
    topCategoryEl.innerText = "—";
    savingsGoalEl.innerText = "Add salary & savings";
    budgetAmountEl.innerText = "";
    percentEl.innerText = "";
    progressEl.style.width = "0%";
    progressEl.style.background = "#e5e7eb";
    summaryEl.innerText =
      "Add your salary and start tracking expenses.";
    return;
  }

  const budget = getMonthlyBudget();
  const spent = getTotalSpent();
  const remaining = getRemainingBalance();
  const percent = getSpentPercentage();
  const topCategory = getTopCategory();

  /* BALANCE */
  balanceEl.innerText = `₹${remaining}`;

  /* SAVINGS */
  savingsGoalEl.innerText =
    user.savingsTarget !== null
      ? `Savings Goal: ₹${user.savingsTarget}`
      : "Savings goal not set";

  /* SPENT */
  spentEl.innerText = `₹${spent}`;
  budgetAmountEl.innerText = `Monthly Budget: ₹${budget}`;
  percentEl.innerText = `${percent}% of monthly budget used`;

  progressEl.style.width = `${percent}%`;
  progressEl.style.background =
    percent < 60
      ? "#22c55e"
      : percent < 85
      ? "#f59e0b"
      : "#ef4444";

  /* TOP CATEGORY */
  topCategoryEl.innerText = topCategory || "—";

  /* SUMMARY */
  if (topCategory) {
  const advice = getMonthlyAdvice(topCategory);

  summaryEl.innerHTML = `
    💡 This month, your highest spending was on 
    <strong>${topCategory}</strong>.<br><br>
    ${advice}
  `;
} else {
  summaryEl.innerText =
    "💡 Add expenses to see your monthly spending insights.";
}

}

/************************
  UPCOMING PAYMENTS (≤ 10 DAYS)
*************************/
function renderUpcomingPayments() {
  const container = document.getElementById("upcomingPayments");
  if (!container || !user) return;

  container.innerHTML = "";

  if (!user.payments.length) {
    container.innerHTML =
      `<p class="empty">No upcoming payments.</p>`;
    return;
  }

  const today = new Date();

  const upcoming = user.payments.filter(p => {
    const diff =
      (new Date(p.dueDate) - today) / (1000 * 60 * 60 * 24);
    return diff <= 10;
  });

  if (!upcoming.length) {
    container.innerHTML =
      `<p class="empty">No upcoming payments.</p>`;
    return;
  }

  upcoming
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .forEach(p => {
      const due = new Date(p.dueDate);
      const diffDays = Math.ceil(
        (due - today) / (1000 * 60 * 60 * 24)
      );

      let status = "safe";
      let label = `${diffDays} days left`;

      if (diffDays <= 0) {
        status = "urgent";
        label = "Due today";
      } else if (diffDays <= 3) {
        status = "urgent";
      } else if (diffDays <= 7) {
        status = "warning";
      }

      const div = document.createElement("div");
      div.className = `payment ${status}`;

      div.innerHTML = `
        <span>${p.title}</span>
        <span class="due ${status}">
          ₹${p.amount} · ${label}
        </span>
      `;

      container.appendChild(div);
    });
}
