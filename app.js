/************************
  LOAD AUTH USER
*************************/

const currentUserEmail = localStorage.getItem("currentUser");
const users = JSON.parse(localStorage.getItem("users")) || {};

let user =
  currentUserEmail && users[currentUserEmail]
    ? users[currentUserEmail]
    : null;

const appReady = !!user;

/************************
  NORMALIZE USER
*************************/

function normalizeUser() {
  if (!user) return;

  user.salary =
    typeof user.salary === "number" && user.salary > 0
      ? user.salary
      : null;

  // savings CAN be 0
  user.savingsTarget =
    typeof user.savingsTarget === "number"
      ? user.savingsTarget
      : null;

  user.expenses = Array.isArray(user.expenses)
    ? user.expenses
    : [];

  user.payments = Array.isArray(user.payments)
    ? user.payments
    : [];
}

normalizeUser();

/************************
  STORAGE
*************************/

function saveUser() {
  if (!appReady) return;
  users[currentUserEmail] = user;
  localStorage.setItem("users", JSON.stringify(users));
}

function syncUserFromStorage() {
  if (!currentUserEmail) return;

  const latestUsers =
    JSON.parse(localStorage.getItem("users")) || {};

  if (!latestUsers[currentUserEmail]) return;

  user = latestUsers[currentUserEmail];
  normalizeUser();
}

/************************
  ZERO STATE
*************************/

function hasUserData() {
  if (!appReady) return false;

  return (
    user.salary !== null ||
    user.savingsTarget !== null ||
    user.expenses.length > 0
  );
}

/************************
  CALCULATIONS
*************************/

function getMonthlyBudget() {
  if (!user || user.salary === null) return 0;
  const savings = user.savingsTarget ?? 0;
  return Math.max(user.salary - savings, 0);
}

function getTotalSpent() {
  return user.expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
}

function getRemainingBalance() {
  return Math.max(
    getMonthlyBudget() - getTotalSpent(),
    0
  );
}

function getSpentPercentage() {
  const budget = getMonthlyBudget();
  if (!budget) return 0;

  return Math.min(
    Math.round((getTotalSpent() / budget) * 100),
    100
  );
}

function getTopCategory() {
  if (!user.expenses.length) return null;

  const totals = {};
  user.expenses.forEach(e => {
    totals[e.category] =
      (totals[e.category] || 0) + e.amount;
  });

  return Object.keys(totals).reduce((a, b) =>
    totals[a] > totals[b] ? a : b
  );
}
