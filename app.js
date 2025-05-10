"use strict";
const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const transactionList = document.getElementById('transactionList');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let editingId = null;
let currentPage = 1;
const itemsPerPage = 5;
form.addEventListener('submit', (e) => {
    e.preventDefault();
    editingId ? updateTransaction() : addTransaction();
});
searchInput.addEventListener('input', () => renderTransactions());
filterSelect.addEventListener('change', () => renderTransactions());
function addTransaction() {
    const transaction = {
        id: Date.now(),
        name: nameInput.value,
        amount: +amountInput.value
    };
    transactions.push(transaction);
    saveTransactions();
    resetForm();
    renderTransactions();
}
function updateTransaction() {
    const t = transactions.find(t => t.id === editingId);
    if (t) {
        t.name = nameInput.value;
        t.amount = +amountInput.value;
    }
    editingId = null;
    saveTransactions();
    resetForm();
    renderTransactions();
}
function editTransaction(id) {
    const t = transactions.find(t => t.id === id);
    if (t) {
        nameInput.value = t.name;
        amountInput.value = t.amount.toString();
        editingId = id;
    }
}
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderTransactions();
}
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}
function resetForm() {
    nameInput.value = '';
    amountInput.value = '';
}
function renderTransactions() {
    let filtered = [...transactions];
    const keyword = searchInput.value.toLowerCase();
    if (keyword) {
        filtered = filtered.filter(t => t.name.toLowerCase().includes(keyword));
    }
    const filter = filterSelect.value;
    if (filter === 'income') {
        filtered = filtered.filter(t => t.amount > 0);
    }
    else if (filter === 'expense') {
        filtered = filtered.filter(t => t.amount < 0);
    }
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    transactionList.innerHTML = '';
    paginated.forEach(t => {
        const li = document.createElement('li');
        li.className = `flex justify-between items-center p-2 border rounded ${t.amount < 0 ? 'bg-red-100' : 'bg-green-100'}`;
        li.innerHTML = `
            <span>${t.name}: ฿${t.amount}</span>
            <div>
                <button class="text-blue-500 mr-2" onclick="editTransaction(${t.id})">แก้ไข</button>
                <button class="text-red-500" onclick="removeTransaction(${t.id})">ลบ</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
    renderBalance();
    renderPagination(filtered.length);
}
function renderBalance() {
    const amounts = transactions.map(t => t.amount);
    const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
    const expense = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0);
    const balance = income + expense;
    balanceEl.textContent = `฿${balance}`;
    incomeEl.textContent = `฿${income}`;
    expenseEl.textContent = `฿${Math.abs(expense)}`;
}
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationEl = document.getElementById('pagination');
    paginationEl.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()" class="px-2 py-1 bg-gray-200 rounded">ย้อนกลับ</button>
        <span> หน้า ${currentPage} จาก ${totalPages || 1} </span>
        <button ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="nextPage()" class="px-2 py-1 bg-gray-200 rounded">ถัดไป</button>
    `;
}
function prevPage() {
    if (currentPage > 1)
        currentPage--;
    renderTransactions();
}
function nextPage() {
    const keyword = searchInput.value.toLowerCase();
    let filtered = transactions;
    if (keyword) {
        filtered = filtered.filter(t => t.name.toLowerCase().includes(keyword));
    }
    const filter = filterSelect.value;
    if (filter === 'income') {
        filtered = filtered.filter(t => t.amount > 0);
    }
    else if (filter === 'expense') {
        filtered = filtered.filter(t => t.amount < 0);
    }
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage < totalPages)
        currentPage++;
    renderTransactions();
}
window.editTransaction = editTransaction;
window.removeTransaction = removeTransaction;
window.prevPage = prevPage;
window.nextPage = nextPage;
renderTransactions();
