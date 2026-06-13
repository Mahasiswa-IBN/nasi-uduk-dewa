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
    
    // Render Transactions Table
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 30px;">Belum ada riwayat transaksi.</td></tr>';
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
            <td>
                <button class="btn-action-view" onclick="showReceiptDetail('${trx.id}')">
                    <i class='bx bx-receipt'></i> Lihat
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showReceiptDetail(trxId) {
    const transactions = JSON.parse(localStorage.getItem('nasi_uduk_transactions')) || [];
    const trx = transactions.find(t => t.id === trxId);
    if (!trx) return;

    // Generate HTML for receipt inside the preview box
    let itemsHtml = '';
    trx.items.forEach(item => {
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span style="text-align: left; max-width: 180px;">${item.name} x${item.qty}</span>
                <span>${formatRupiah(item.price * item.qty)}</span>
            </div>
        `;
    });

    const receiptHtml = `
        <div style="text-align: center; margin-bottom: 12px;">
            <h2 style="font-size: 16px; margin: 0 0 4px 0; font-family: 'Outfit', sans-serif; font-weight: 800; color: #000;">NASI UDUK DEWA</h2>
            <p style="margin: 2px 0; font-size: 11px; color: #333;">Jl. Makanan Enak No. 99, Jakarta</p>
            <p style="margin: 2px 0; font-size: 11px; color: #333;">Telp: 0812-3456-7890</p>
            <p style="margin: 6px 0; color: #000;">--------------------------------</p>
        </div>
        <div style="margin-bottom: 12px; font-size: 12px; color: #000;">
            <p style="margin: 2px 0;">No: ${trx.id}</p>
            <p style="margin: 2px 0;">Tanggal: ${formatDate(trx.date)}</p>
            <p style="margin: 2px 0;">Pelanggan: <strong>${trx.customer || 'Pelanggan Umum'}</strong></p>
            <p style="margin: 2px 0;">Metode: ${trx.method || 'Tunai'}</p>
            <p style="margin: 2px 0;">Kasir: Kasir 1</p>
            <p style="margin: 6px 0; color: #000;">--------------------------------</p>
        </div>
        <div style="font-size: 12px; color: #000;">
            ${itemsHtml}
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: #000;">
            <p style="margin: 6px 0; color: #000;">--------------------------------</p>
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>Subtotal</span>
                <span>${formatRupiah(trx.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>Pajak (10%)</span>
                <span>${formatRupiah(trx.tax)}</span>
            </div>
            <p style="margin: 6px 0; color: #000;">--------------------------------</p>
            <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold; font-size: 14px;">
                <span>TOTAL</span>
                <span>${formatRupiah(trx.total)}</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #000;">
            <p style="margin: 6px 0; color: #000;">--------------------------------</p>
            <p style="margin: 2px 0;">Terima Kasih</p>
            <p style="margin: 2px 0;">Silakan Datang Kembali!</p>
        </div>
    `;

    document.getElementById('receipt-preview-box').innerHTML = receiptHtml;

    // Bind print button action
    const printBtn = document.getElementById('btn-print-receipt');
    printBtn.onclick = () => printReceiptFromDashboard(trx);

    // Show modal
    document.getElementById('receipt-modal').classList.add('show');
}

function closeReceiptModal() {
    document.getElementById('receipt-modal').classList.remove('show');
}

function printReceiptFromDashboard(trx) {
    let itemsHtml = '';
    trx.items.forEach(item => {
        itemsHtml += `
            <div class="receipt-item">
                <span class="receipt-item-name">${item.name} x${item.qty}</span>
                <span class="receipt-item-price">${formatRupiah(item.price * item.qty)}</span>
            </div>
        `;
    });

    const printHtml = `
        <div id="print-area">
            <div class="receipt-header">
                <h2>NASI UDUK DEWA</h2>
                <p>Jl. Makanan Enak No. 99, Jakarta</p>
                <p>Telp: 0812-3456-7890</p>
                <p>--------------------------------</p>
            </div>
            <div class="receipt-info">
                <p>No: ${trx.id}</p>
                <p>Tanggal: ${formatDate(trx.date)}</p>
                <p>Pelanggan: <strong>${trx.customer || 'Pelanggan Umum'}</strong></p>
                <p>Metode: ${trx.method || 'Tunai'}</p>
                <p>Kasir: Kasir 1</p>
                <p>--------------------------------</p>
            </div>
            <div class="receipt-items">
                ${itemsHtml}
            </div>
            <div class="receipt-totals">
                <p>--------------------------------</p>
                <div class="receipt-item">
                    <span>Subtotal</span>
                    <span>${formatRupiah(trx.subtotal)}</span>
                </div>
                <div class="receipt-item">
                    <span>Pajak (10%)</span>
                    <span>${formatRupiah(trx.tax)}</span>
                </div>
                <p>--------------------------------</p>
                <div class="receipt-item" style="font-weight: bold; font-size: 16px;">
                    <span>TOTAL</span>
                    <span>${formatRupiah(trx.total)}</span>
                </div>
            </div>
            <div class="receipt-footer">
                <p>--------------------------------</p>
                <p>Terima Kasih</p>
                <p>Silakan Datang Kembali!</p>
            </div>
        </div>
    `;

    // Create a temporary element for printing
    const printContainer = document.createElement('div');
    printContainer.id = 'receipt-print-container';
    printContainer.innerHTML = printHtml;
    document.body.appendChild(printContainer);

    window.print();

    // Remove the temporary element after printing
    document.body.removeChild(printContainer);
}

function clearTransactions() {
    if(confirm("Apakah Anda yakin ingin menghapus semua riwayat transaksi? Tindakan ini tidak dapat dibatalkan.")) {
        localStorage.removeItem('nasi_uduk_transactions');
        loadDashboardData();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadDashboardData);
