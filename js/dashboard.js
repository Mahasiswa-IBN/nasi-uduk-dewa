// Dashboard Logic

// Format Currency
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function loadDashboardData() {
    const transactions = JSON.parse(localStorage.getItem('nasi_uduk_transactions')) || [];
    
    // Calculate Stats
    let totalRevenue = 0;
    let totalItems = 0;
    
    transactions.forEach(trx => {
        totalRevenue += trx.total;
        trx.items.forEach(item => {
            totalItems += item.qty;
        });
    });
    
    // Update DOM Stats
    document.getElementById('total-revenue').textContent = formatRupiah(totalRevenue);
    document.getElementById('total-orders').textContent = transactions.length;
    document.getElementById('total-items').textContent = totalItems;

    renderDailySales(transactions);
    
    // Render Transactions Table
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 30px;">Belum ada riwayat transaksi.</td></tr>';
        return;
    }
    
    // Sort transactions by date descending (newest first)
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTransactions.forEach(trx => {
        const tr = document.createElement('tr');
        
        // Detailed items list
        let itemsHtml = '<ul style="list-style: none; padding: 0; margin: 0; font-size: 13px;">';
        trx.items.forEach(item => {
            itemsHtml += `<li style="margin-bottom: 4px;">• ${item.qty}x ${item.name} <span style="color:var(--text-secondary)">(@${formatRupiah(item.price)})</span></li>`;
        });
        itemsHtml += '</ul>';
        
        tr.innerHTML = `
            <td style="font-weight:600;">${trx.id}</td>
            <td style="color:var(--text-secondary);">${formatDate(trx.date)}</td>
            <td style="font-weight:600; color:var(--accent-primary);">${trx.customer || 'Pelanggan Umum'}</td>
            <td>${itemsHtml}</td>
            <td style="font-weight:600; color:var(--text-primary);">${formatRupiah(trx.total)}</td>
            <td><span class="status completed">Selesai</span></td>
        `;
        tbody.appendChild(tr);
    });
}


function renderDailySales(transactions) {
    const dailySales = {};
    const today = new Date();
    const daysToShow = 7;

    // Initialize last 7 days
    for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().slice(0, 10);
        dailySales[key] = { orders: 0, items: 0, revenue: 0 };
    }

    transactions.forEach(trx => {
        const dateKey = new Date(trx.date).toISOString().slice(0, 10);
        if (dailySales[dateKey]) {
            dailySales[dateKey].orders += 1;
            dailySales[dateKey].revenue += trx.total;
            trx.items.forEach(item => {
                dailySales[dateKey].items += item.qty;
            });
        }
    });

    const body = document.getElementById('daily-sales-body');
    body.innerHTML = '';
    Object.keys(dailySales).forEach(dateKey => {
        const day = new Date(dateKey).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day}</td>
            <td>${dailySales[dateKey].orders}</td>
            <td>${dailySales[dateKey].items}</td>
            <td>${formatRupiah(dailySales[dateKey].revenue)}</td>
        `;
        body.appendChild(row);
    });
}

function clearTransactions() {
    if(confirm("Apakah Anda yakin ingin menghapus semua riwayat transaksi? Tindakan ini tidak dapat dibatalkan.")) {
        localStorage.removeItem('nasi_uduk_transactions');
        loadDashboardData();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadDashboardData);
