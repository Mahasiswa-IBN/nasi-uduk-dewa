// DOM Elements
const reportsBody = document.getElementById('reports-body');
const yearFilter = document.getElementById('year-filter');
const totalGrossEl = document.getElementById('total-gross');
const totalTaxCollectedEl = document.getElementById('total-tax-collected');
const totalFinalTaxEl = document.getElementById('total-final-tax');
const reportModal = document.getElementById('report-modal');
const reportPreviewBox = document.getElementById('report-preview-box');
const btnPrintReport = document.getElementById('btn-print-report');

const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Format Currency
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format Date
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Load Report Data
function loadReportData() {
    const transactions = JSON.parse(localStorage.getItem('nasi_uduk_transactions')) || [];
    const selectedYear = parseInt(yearFilter.value);
    
    // Initialize monthly data object
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        monthIndex: i,
        monthName: monthNames[i],
        transactionsCount: 0,
        grossTurnover: 0, // Total kotor (total paid)
        dpp: 0, // DPP (subtotal)
        taxResto: 0, // Pajak Restoran (tax 10%)
        taxUmkm: 0 // Pajak UMKM 0.5%
    }));

    let yearlyGross = 0;
    let yearlyTaxCollected = 0;
    let yearlyFinalTax = 0;

    // Filter and aggregate transactions
    transactions.forEach(trx => {
        const trxDate = new Date(trx.date);
        if (trxDate.getFullYear() === selectedYear) {
            const monthIndex = trxDate.getMonth();
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyData[monthIndex].transactionsCount += 1;
                monthlyData[monthIndex].grossTurnover += trx.total;
                monthlyData[monthIndex].dpp += trx.subtotal;
                monthlyData[monthIndex].taxResto += trx.tax;
                // UMKM tax = 0.5% of Gross Turnover
                monthlyData[monthIndex].taxUmkm += trx.total * 0.005;

                yearlyGross += trx.total;
                yearlyTaxCollected += trx.tax;
                yearlyFinalTax += trx.total * 0.005;
            }
        }
    });

    // Update stats cards
    totalGrossEl.textContent = formatRupiah(yearlyGross);
    totalTaxCollectedEl.textContent = formatRupiah(yearlyTaxCollected);
    totalFinalTaxEl.textContent = formatRupiah(yearlyFinalTax);

    // Render Table Rows
    reportsBody.innerHTML = '';
    monthlyData.forEach(data => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td style="font-weight:600;">${data.monthName} ${selectedYear}</td>
            <td style="color:var(--text-secondary);">${data.transactionsCount}</td>
            <td style="font-weight:600; color:var(--text-primary);">${formatRupiah(data.grossTurnover)}</td>
            <td style="color:var(--text-secondary);">${formatRupiah(data.dpp)}</td>
            <td style="font-weight:600; color:var(--success);">${formatRupiah(data.taxResto)}</td>
            <td style="font-weight:600; color:#3b82f6;">${formatRupiah(data.taxUmkm)}</td>
            <td>
                <button class="btn-action-view" onclick="openMonthlyDetailModal(${data.monthIndex})">
                    <i class='bx bx-search-alt'></i> Detail
                </button>
            </td>
        `;
        reportsBody.appendChild(tr);
    });

    // Save monthly data to window object for modal referencing
    window.currentMonthlyData = monthlyData;
}

function openMonthlyDetailModal(monthIndex) {
    if (!window.currentMonthlyData) return;
    const data = window.currentMonthlyData[monthIndex];
    const year = parseInt(yearFilter.value);
    
    const previewHtml = `
        <div style="text-align: center; margin-bottom: 20px; font-family: 'Outfit', sans-serif;">
            <h4 style="font-size: 16px; margin: 0; font-weight: 800; color: var(--text-primary);">LAPORAN REKAPITULASI PAJAK BULANAN</h4>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-secondary);">NASI UDUK DEWA - TAHUN PAJAK ${year}</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: var(--accent-primary); font-weight: 700;">Periode: ${data.monthName.toUpperCase()} ${year}</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: var(--text-primary);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-secondary);">Total Transaksi</span>
                <span style="font-weight: 600;">${data.transactionsCount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-secondary);">Penerimaan Bruto (Omset Kotor)</span>
                <span style="font-weight: 600;">${formatRupiah(data.grossTurnover)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-secondary);">Dasar Pengenaan Pajak (DPP)</span>
                <span style="font-weight: 600;">${formatRupiah(data.dpp)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-secondary);">Pajak Restoran Terkumpul (10%)</span>
                <span style="font-weight: 600; color: var(--success);">${formatRupiah(data.taxResto)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 8px; background-color: rgba(59, 130, 246, 0.05); padding: 8px; border-radius: var(--radius-sm);">
                <span style="color: #3b82f6; font-weight: 600;">Pajak UMKM Terutang (PPh Final 0.5%)</span>
                <span style="font-weight: 700; color: #3b82f6;">${formatRupiah(data.taxUmkm)}</span>
            </div>
        </div>
        <div style="margin-top: 16px; font-size: 11px; color: var(--text-muted); line-height: 1.5;">
            * PPh Final 0.5% disetorkan ke Kas Negara berdasarkan PP 23 Tahun 2018 paling lambat tanggal 15 bulan berikutnya.
        </div>
    `;

    reportPreviewBox.innerHTML = previewHtml;

    // Bind Print Button
    btnPrintReport.onclick = () => printMonthlyReport(data, year);

    // Show modal
    reportModal.classList.add('show');
}

function closeReportModal() {
    reportModal.classList.remove('show');
}

function printMonthlyReport(data, year) {
    const printHtml = `
        <div id="print-area">
            <div class="receipt-header">
                <h2>NASI UDUK DEWA</h2>
                <p>Jl. Makanan Enak No. 99, Jakarta</p>
                <p>Telp: 0812-3456-7890</p>
                <p>--------------------------------</p>
                <h3>LAPORAN PAJAK BULANAN</h3>
                <p>Tahun Pajak: ${year}</p>
                <p>Periode: ${data.monthName} ${year}</p>
                <p>--------------------------------</p>
            </div>
            <div class="receipt-info" style="font-size: 12px; line-height: 1.6;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Total Transaksi:</span>
                    <span><strong>${data.transactionsCount}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Penerimaan Bruto:</span>
                    <span><strong>${formatRupiah(data.grossTurnover)}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Dasar Pengenaan (DPP):</span>
                    <span><strong>${formatRupiah(data.dpp)}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Pajak Restoran (10%):</span>
                    <span><strong>${formatRupiah(data.taxResto)}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px dashed #000; padding-top: 4px;">
                    <span><strong>PPh Final UMKM (0.5%):</strong></span>
                    <span><strong>${formatRupiah(data.taxUmkm)}</strong></span>
                </div>
            </div>
            <div class="receipt-footer" style="margin-top: 20px; font-size: 11px;">
                <p>--------------------------------</p>
                <p>Disiapkan Oleh POS Nasi Uduk Dewa</p>
                <p>Dicetak pada: ${formatDate(new Date())}</p>
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

// Bind Listeners
yearFilter.addEventListener('change', loadReportData);

// Initialize
document.addEventListener('DOMContentLoaded', loadReportData);
