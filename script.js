document.addEventListener('DOMContentLoaded', () => {
  const transactionForm = document.getElementById('transactionForm');
  const itemNameInput = document.getElementById('itemName');
  const amountInput = document.getElementById('amount');
  const categoryInput = document.getElementById('category');
  const transactionList = document.getElementById('transactionList');
  const totalBalance = document.getElementById('totalBalance');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const sortSelect = document.getElementById('sortSelect');
  const iconMoon = document.getElementById('icon-moon');
  const iconSun = document.getElementById('icon-sun');

  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let spendingChart;

  // ── Kategori badge mapping ──
  const badgeClass = {
    Food: 'badge badge-food',
    Transport: 'badge badge-transport',
    Fun: 'badge badge-fun'
  };

  // ── Format Rupiah konsisten ──
  const rupiahFormat = new Intl.NumberFormat('id-ID');
  function formatRupiah(value) {
    return `Rp ${rupiahFormat.format(value)}`;
  }

  function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  function renderBalance() {
    const total = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
    totalBalance.textContent = formatRupiah(total);
  }

  function renderList() {
    transactionList.innerHTML = '';
    let sortedTransactions = [...transactions];

    if (sortSelect.value === 'amount-high') {
      sortedTransactions.sort((a, b) => b.amount - a.amount);
    } else if (sortSelect.value === 'amount-low') {
      sortedTransactions.sort((a, b) => a.amount - b.amount);
    } else {
      sortedTransactions.reverse();
    }

    sortedTransactions.forEach(transaction => {
      const li = document.createElement('li');
      li.className = 'transaction-item card';

      const cls = badgeClass[transaction.category] || 'badge';

      li.innerHTML = `
        <div>
          <strong>${transaction.name}</strong>
          <span>
            <span class="${cls}">${transaction.category}</span>
            ${formatRupiah(Number(transaction.amount))}
          </span>
        </div>
        <button class="delete-btn" data-id="${transaction.id}">Hapus</button>
      `;
      transactionList.appendChild(li);
    });
  }

  function renderChart() {
    const categories = ['Food', 'Transport', 'Fun'];
    const data = categories.map(cat =>
      transactions
        .filter(t => t.category === cat)
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
    );

    const ctx = document.getElementById('spendingChart').getContext('2d');

    if (spendingChart) {
      spendingChart.destroy();
    }

    spendingChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: data,
          backgroundColor: ['#34d399', '#60a5fa', '#fb923c'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 12 }
            }
          }
        }
      }
    });
  }

  function updateUI() {
    renderBalance();
    renderList();
    renderChart();
  }

  // ── Toggle ikon bulan / matahari ──
  function syncThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    iconMoon.style.display = isDark ? 'none' : 'block';
    iconSun.style.display = isDark ? 'block' : 'none';
    themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    syncThemeIcon();
  });

  // Inisialisasi ikon sesuai status awal
  syncThemeIcon();

  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTransaction = {
      id: Date.now(),
      name: itemNameInput.value,
      amount: parseInt(amountInput.value, 10),
      category: categoryInput.value
    };

    transactions.push(newTransaction);
    updateLocalStorage();
    updateUI();
    transactionForm.reset();
  });

  transactionList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = parseInt(e.target.dataset.id);
      transactions = transactions.filter(t => t.id !== id);
      updateLocalStorage();
      updateUI();
    }
  });

  sortSelect.addEventListener('change', () => {
    renderList();
  });

  updateUI();
});
