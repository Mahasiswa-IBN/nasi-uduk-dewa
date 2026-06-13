// Products Logic

const gridContainer = document.getElementById('products-grid');
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');
const categorySelect = document.getElementById('product-category');

let isEditing = false;

// Format Currency
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function initProducts() {
    // Populate categories
    categories.forEach(cat => {
        if (cat.id !== 'all') {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            categorySelect.appendChild(opt);
        }
    });

    renderTable();
    
    form.addEventListener('submit', handleFormSubmit);
}

function renderTable() {
    gridContainer.innerHTML = '';
    
    if (menuItems.length === 0) {
        gridContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); grid-column: 1/-1; padding: 40px;">Belum ada produk.</p>';
        return;
    }

    menuItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card-admin';
        
        let imageHtml = `<div class="product-card-img"><i class='bx bx-bowl-hot'></i></div>`;
        if (item.image && item.image.trim() !== '') {
            imageHtml = `<div class="product-card-img"><img src="${item.image}" alt="${item.name}"></div>`;
        }

        const catName = categories.find(c => c.id === item.category)?.name || item.category;

        card.innerHTML = `
            ${imageHtml}
            <div class="product-card-cat">${catName}</div>
            <div class="product-card-body">
                <h3>${item.name}</h3>
                <div class="price">${formatRupiah(item.price)}</div>
                <div class="product-actions">
                    <button class="btn-action-outline btn-edit-admin" onclick="editProduct(${item.id})">
                        <i class='bx bx-edit-alt'></i> Edit
                    </button>
                    <button class="btn-action-outline btn-delete-admin" onclick="deleteProduct(${item.id})">
                        <i class='bx bx-trash'></i> Hapus
                    </button>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

function openModal() {
    isEditing = false;
    document.getElementById('modal-title').textContent = 'Tambah Menu Baru';
    form.reset();
    document.getElementById('product-id').value = '';
    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
}

function editProduct(id) {
    isEditing = true;
    const item = menuItems.find(p => p.id === id);
    if (!item) return;

    document.getElementById('modal-title').textContent = 'Edit Menu';
    document.getElementById('product-id').value = item.id;
    document.getElementById('product-name').value = item.name;
    document.getElementById('product-category').value = item.category;
    document.getElementById('product-price').value = item.price;
    document.getElementById('product-image').value = item.image || '';
    
    modal.classList.add('show');
}

function deleteProduct(id) {
    if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
        menuItems = menuItems.filter(p => p.id !== id);
        saveToLocalStorage();
        renderTable();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const idField = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;

    if (isEditing) {
        const index = menuItems.findIndex(p => p.id === parseInt(idField));
        if (index > -1) {
            menuItems[index] = { id: parseInt(idField), name, category, price, image };
        }
    } else {
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(p => p.id)) + 1 : 1;
        menuItems.push({ id: newId, name, category, price, image });
    }

    saveToLocalStorage();
    closeModal();
    renderTable();
}

function saveToLocalStorage() {
    localStorage.setItem('nasi_uduk_products', JSON.stringify(menuItems));
}

document.addEventListener('DOMContentLoaded', initProducts);
