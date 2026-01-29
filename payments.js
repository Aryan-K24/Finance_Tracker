/************************
 AUTH GUARD
*************************/
if (!isAuthenticated()) {
  document.body.innerHTML = `<a href="index.html">Login</a>`;
  throw new Error("Not authenticated");
}

/************************
 STATE
*************************/
let editingPaymentId = null;

/************************
 INIT
*************************/
document.addEventListener("DOMContentLoaded", () => {
  syncUserFromStorage();
  renderPayments();

  openModal.onclick = () => openAddModal();
  closeModal.onclick = closePaymentModal;

  paymentForm.onsubmit = savePayment;
});

/************************
 MODAL CONTROL
*************************/
function openAddModal() {
  editingPaymentId = null;
  paymentForm.reset();
  document.querySelector(".modal-content h3").innerText = "Add Payment";
  paymentModal.style.display = "flex";
}

function openEditModal(payment) {
  editingPaymentId = payment.id;

  paymentTitle.value = payment.title;
  paymentAmount.value = payment.amount;
  paymentDueDate.value = payment.dueDate;
  paymentRecurring.value = payment.recurring;

  document.querySelector(".modal-content h3").innerText = "Edit Payment";
  paymentModal.style.display = "flex";
}

function closePaymentModal() {
  paymentModal.style.display = "none";
  editingPaymentId = null;
}

/************************
 SAVE (ADD / EDIT)
*************************/
function savePayment(e) {
  e.preventDefault();

  const data = {
    id: editingPaymentId || Date.now().toString(),
    title: paymentTitle.value.trim(),
    amount: Number(paymentAmount.value),
    dueDate: paymentDueDate.value,
    recurring: paymentRecurring.value
  };

  if (!data.title || !data.amount || !data.dueDate) return;

  if (editingPaymentId) {
    user.payments = user.payments.map(p =>
      p.id === editingPaymentId ? data : p
    );
  } else {
    user.payments.push(data);
  }

  saveUser();
  syncUserFromStorage();
  renderPayments();
  closePaymentModal();
}

/************************
 RENDER
*************************/
function renderPayments() {
  const list = paymentsList;
  list.innerHTML = "";

  if (!user.payments.length) {
    list.innerHTML = `<p class="empty">No upcoming payments.</p>`;
    return;
  }

  user.payments.forEach(p => {
    const days = Math.ceil(
      (new Date(p.dueDate) - new Date()) / 86400000
    );

    let urgency = "safe";
    if (days <= 3) urgency = "danger";
    else if (days <= 7) urgency = "warning";

    list.innerHTML += `
      <div class="payment-card ${urgency}" data-id="${p.id}">
        <div>
          <p class="title">${p.title}</p>
          <p class="meta">₹${p.amount} · ${days} days left</p>
        </div>
        <div class="actions">
          <button class="done">✔</button>
          <button class="edit">✏️</button>
          <button class="delete">🗑️</button>
        </div>
      </div>
    `;
  });

  list.onclick = handlePaymentActions;
}

/************************
 ACTIONS
*************************/
function handlePaymentActions(e) {
  const card = e.target.closest(".payment-card");
  if (!card) return;

  const id = card.dataset.id;
  const payment = user.payments.find(p => p.id === id);

  if (e.target.classList.contains("delete")) {
    if (!confirm("Delete this payment?")) return;
    user.payments = user.payments.filter(p => p.id !== id);
  }

  if (e.target.classList.contains("done")) {
    if (payment.recurring === "monthly") {
      const d = new Date(payment.dueDate);
      d.setMonth(d.getMonth() + 1);
      payment.dueDate = d.toISOString().split("T")[0];
    } else {
      user.payments = user.payments.filter(p => p.id !== id);
    }
  }

  if (e.target.classList.contains("edit")) {
    openEditModal(payment);
    return;
  }

  saveUser();
  syncUserFromStorage();
  renderPayments();
}
