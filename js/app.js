// DOM Elements
const categoryList = document.getElementById('category-list');
const menuGrid = document.getElementById('menu-grid');
const currentCategoryTitle = document.getElementById('current-category-title');
const searchInput = document.getElementById('search-input');
const cartItemsContainer = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const btnCheckout = document.getElementById('btn-checkout');
const paymentMethods = document.querySelectorAll('.method-btn');
const customerNameInput = document.getElementById('customer-name');

// Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnPrint = document.getElementById('btn-print');
const modalTotalPaid = document.getElementById('modal-total-paid');

// State
let cart = [];
let currentCategory = 'all';
let searchQuery = '';
let lastTransaction = null;

// Initialize
function init() {
    renderCategories();
    renderMenu();
    updateCart();
    
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderMenu();
    });

    paymentMethods.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentMethods.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    btnCheckout.addEventListener('click', handleCheckout);
    btnCloseModal.addEventListener('click', closeModal);
    btnPrint.addEventListener('click', printReceipt);

    // Mobile cart drawer toggle
    const btnToggleCart = document.getElementById('btn-toggle-cart');
    const btnCloseCart = document.getElementById('btn-close-cart');
    const cartSidebar = document.querySelector('.cart-sidebar');

    if (btnToggleCart && cartSidebar) {
        btnToggleCart.addEventListener('click', () => {
            cartSidebar.classList.toggle('show');
        });
    }

    if (btnCloseCart && cartSidebar) {
        btnCloseCart.addEventListener('click', () => {
            cartSidebar.classList.remove('show');
        });
    }
}

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

// Render Categories
function renderCategories() {
    if (categoryList) {
        categoryList.innerHTML = '';
        categories.forEach(cat => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = `category-btn ${cat.id === currentCategory ? 'active' : ''}`;
            btn.textContent = cat.name;
            btn.onclick = () => {
                currentCategory = cat.id;
                currentCategoryTitle.textContent = cat.name;
                renderCategories();
                renderMenu();
            };
            li.appendChild(btn);
            categoryList.appendChild(li);
        });
    }

    const mobileCategoryList = document.getElementById('mobile-category-list');
    if (mobileCategoryList) {
        mobileCategoryList.innerHTML = '';
        categories.forEach(cat => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = `mobile-category-btn ${cat.id === currentCategory ? 'active' : ''}`;
            btn.textContent = cat.name;
            btn.onclick = () => {
                currentCategory = cat.id;
                currentCategoryTitle.textContent = cat.name;
                renderCategories();
                renderMenu();
            };
            li.appendChild(btn);
            mobileCategoryList.appendChild(li);
        });
    }
}

// Render Menu Items
function renderMenu() {
    menuGrid.innerHTML = '';
    menuItems = getMenuItems(); // Refresh data just in case
    
    let filteredMenu = menuItems;
    
    if (currentCategory !== 'all') {
        filteredMenu = filteredMenu.filter(item => item.category === currentCategory);
    }
    
    if (searchQuery) {
        filteredMenu = filteredMenu.filter(item => item.name.toLowerCase().includes(searchQuery));
    }
    
    if (filteredMenu.length === 0) {
        menuGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">Tidak ada menu ditemukan.</p>`;
        return;
    }
    
    filteredMenu.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.onclick = () => addToCart(item);
        
        let imageHtml = `<div class="menu-image"><i class='bx bx-bowl-hot'></i></div>`;
        if (item.image && item.image.trim() !== '') {
            imageHtml = `<div class="menu-image"><img src="${item.image}" alt="${item.name}"></div>`;
        }
        
        card.innerHTML = `
            ${imageHtml}
            <div class="menu-info">
                <h3>${item.name}</h3>
                <div class="menu-price">${formatRupiah(item.price)}</div>
            </div>
            <button class="add-btn"><i class='bx bx-plus'></i></button>
        `;
        menuGrid.appendChild(card);
    });
}

// Cart Functions
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCart();
}

function updateQty(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
        updateCart();
    }
}

function updateCart() {
    cartItemsContainer.innerHTML = '';
    
    // Update mobile badge
    let totalItemsInCart = 0;
    cart.forEach(item => {
        totalItemsInCart += item.qty;
    });
    const mobileCartBadge = document.getElementById('mobile-cart-badge');
    if (mobileCartBadge) {
        mobileCartBadge.textContent = totalItemsInCart;
        if (totalItemsInCart > 0) {
            mobileCartBadge.style.display = 'flex';
        } else {
            mobileCartBadge.style.display = 'none';
        }
    }
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Keranjang kosong</div>';
        btnCheckout.disabled = true;
        subtotalEl.textContent = 'Rp 0';
        taxEl.textContent = 'Rp 0';
        totalEl.textContent = 'Rp 0';
        return;
    }
    
    btnCheckout.disabled = false;
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.qty;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        
        let imageHtml = `<div class="cart-item-img"><i class='bx bx-food-menu' style="font-size:24px; color:var(--accent-primary)"></i></div>`;
        if (item.image && item.image.trim() !== '') {
            imageHtml = `<div class="cart-item-img"><img src="${item.image}" alt="${item.name}"></div>`;
        }

        cartItemEl.innerHTML = `
            ${imageHtml}
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${formatRupiah(item.price)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                <span class="cart-item-qty">${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });
    
    const tax = subtotal * 0.1; 
    const total = subtotal + tax;
    
    subtotalEl.textContent = formatRupiah(subtotal);
    taxEl.textContent = formatRupiah(tax);
    totalEl.textContent = formatRupiah(total);
    btnCheckout.dataset.total = total;
    btnCheckout.dataset.subtotal = subtotal;
    btnCheckout.dataset.tax = tax;
}

function handleCheckout() {
    const total = parseFloat(btnCheckout.dataset.total);
    const subtotal = parseFloat(btnCheckout.dataset.subtotal);
    const tax = parseFloat(btnCheckout.dataset.tax);
    const activeMethod = document.querySelector('.method-btn.active').textContent;
    
    const customerName = customerNameInput.value.trim();

    if (!customerName) {
        alert("Mohon masukkan Nama Pelanggan sebelum melakukan konfirmasi pembayaran!");
        customerNameInput.focus();
        return;
    }

    lastTransaction = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString(),
        customer: customerName,
        items: [...cart],
        subtotal: subtotal,
        tax: tax,
        total: total,
        method: activeMethod
    };

    saveTransaction(lastTransaction);
    
    // Generate HTML for receipt preview in the checkout success modal
    let itemsHtml = '';
    lastTransaction.items.forEach(item => {
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
            <p style="margin: 2px 0;">No: ${lastTransaction.id}</p>
            <p style="margin: 2px 0;">Tanggal: ${formatDate(lastTransaction.date)}</p>
            <p style="margin: 2px 0;">Pelanggan: <strong>${lastTransaction.customer}</strong></p>
            <p style="margin: 2px 0;">Metode: ${lastTransaction.method}</p>
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
                <span>${formatRupiah(lastTransaction.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>Pajak (10%)</span>
                <span>${formatRupiah(lastTransaction.tax)}</span>
            </div>
            <p style="margin: 6px 0; color: #000;">--------------------------------</p>
            <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold; font-size: 14px;">
                <span>TOTAL</span>
                <span>${formatRupiah(lastTransaction.total)}</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #000;">
            <p style="margin: 6px 0; color: #000;">--------------------------------</p>
            <p style="margin: 2px 0;">Terima Kasih</p>
            <p style="margin: 2px 0;">Silakan Datang Kembali!</p>
        </div>
    `;

    document.getElementById('checkout-receipt-preview').innerHTML = receiptHtml;
    
    modalTotalPaid.textContent = formatRupiah(total);
    checkoutModal.classList.add('show');
    
    cart = [];
    customerNameInput.value = '';
    updateCart();
}

function closeModal() {
    checkoutModal.classList.remove('show');
}

function saveTransaction(transaction) {
    let transactions = JSON.parse(localStorage.getItem('nasi_uduk_transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('nasi_uduk_transactions', JSON.stringify(transactions));
}

function printReceipt() {
    if (!lastTransaction) return;

    let itemsHtml = '';
    lastTransaction.items.forEach(item => {
        itemsHtml += `
            <div class="receipt-item">
                <span class="receipt-item-name">${item.name} x${item.qty}</span>
                <span class="receipt-item-price">${formatRupiah(item.price * item.qty)}</span>
            </div>
        `;
    });

    const receiptHtml = `
        <div id="print-area">
            <div class="receipt-header">
                <h2>NASI UDUK DEWA</h2>
                <p>Jl. Makanan Enak No. 99, Jakarta</p>
                <p>Telp: 0812-3456-7890</p>
                <p>--------------------------------</p>
            </div>
            <div class="receipt-info">
                <p>No: ${lastTransaction.id}</p>
                <p>Tanggal: ${formatDate(lastTransaction.date)}</p>
                <p>Pelanggan: <strong>${lastTransaction.customer}</strong></p>
                <p>Metode: ${lastTransaction.method}</p>
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
                    <span>${formatRupiah(lastTransaction.subtotal)}</span>
                </div>
                <div class="receipt-item">
                    <span>Pajak (10%)</span>
                    <span>${formatRupiah(lastTransaction.tax)}</span>
                </div>
                <p>--------------------------------</p>
                <div class="receipt-item" style="font-weight: bold; font-size: 16px;">
                    <span>TOTAL</span>
                    <span>${formatRupiah(lastTransaction.total)}</span>
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
    printContainer.innerHTML = receiptHtml;
    document.body.appendChild(printContainer);

    window.print();

    // Remove the temporary element after printing
    document.body.removeChild(printContainer);
}

// Run init
init();
