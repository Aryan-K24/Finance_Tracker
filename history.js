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
      <a href="index.html">Go to Login</a>
    </div>
  `;
  throw new Error("Not authenticated");
}

/************************
 INIT
*************************/
document.addEventListener("DOMContentLoaded", () => {
  syncUserFromStorage();
  renderHistory();

  document
    .getElementById("monthFilter")
    ?.addEventListener("change", renderHistory);

  document
    .getElementById("categoryFilter")
    ?.addEventListener("change", renderHistory);
});

/************************
 RENDER HISTORY
*************************/
function renderHistory() {
  syncUserFromStorage();
  if (!user) return;

  const list = document.getElementById("historyList");
  const summary = document.getElementById("monthlyReview");
  const month = document.getElementById("monthFilter")?.value;
  const category = document.getElementById("categoryFilter")?.value;

  let expenses = [...user.expenses];

  // --- FILTER BY MONTH ---
  if (month) {
    expenses = expenses.filter(e =>
      typeof e.date === "string" && e.date.startsWith(month)
    );
  }

  // --- FILTER BY CATEGORY ---
  if (category && category !== "all") {
    expenses = expenses.filter(e => e.category === category);
  }

  list.innerHTML = "";
  summary.classList.add("hidden");

  if (!expenses.length) {
    list.innerHTML = `<p class="empty">No expenses found.</p>`;
    return;
  }

  // --- RENDER LIST ---
  expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(e => {
      list.innerHTML += `
        <div class="history-item">
          <div class="left">
            <p class="category">${e.category}</p>
            <p class="date">${formatDate(e.date)}</p>
          </div>
          <p class="amount">₹${e.amount}</p>
        </div>
      `;
    });

  // --- MONTHLY SUMMARY LOGIC ---
  maybeRenderMonthlySummary(expenses, summary, month);
}

/************************
 MONTHLY SUMMARY (1st DAY ONLY)
*************************/
function maybeRenderMonthlySummary(expenses, box, selectedMonth) {
  const today = new Date();
  const isFirstDay = today.getDate() === 1;

  const currentMonth = today.toISOString().slice(0, 7);

  // Show ONLY on 1st day AND current month
  if (!isFirstDay || selectedMonth !== currentMonth) {
    box.classList.add("hidden");
    return;
  }

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  const topCategory = Object.keys(categoryTotals).length
    ? Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b
      )
    : "—";

  const budget = getMonthlyBudget();
  const saved = Math.max(budget - totalSpent, 0);
  const diff = saved - (user.savingsTarget ?? 0);

  box.innerHTML = `
    <strong>Monthly Overview</strong><br><br>
    Salary: ₹${user.salary ?? "—"}<br>
    Savings Target: ₹${user.savingsTarget ?? "—"}<br>
    Total Spent: ₹${totalSpent}<br>
    Highest Spending: ${topCategory}<br>
    Savings vs Target: 
      <strong style="color:${diff >= 0 ? "#16a34a" : "#dc2626"}">
        ${diff >= 0 ? "+" : "−"}₹${Math.abs(diff)}
      </strong>
  `;

  box.classList.remove("hidden");
}

/************************
 UTIL
*************************/
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

