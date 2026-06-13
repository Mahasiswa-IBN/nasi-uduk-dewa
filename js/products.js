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
    document.getElementById('product-image-file').addEventListener('change', handleImageUpload);
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
    document.getElementById('product-image-file').value = '';
    updateImagePreview();
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
    document.getElementById('product-image-file').value = '';
    updateImagePreview();
    
    modal.classList.add('show');
}

function handleImageUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    // Pastikan file adalah gambar
    if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar yang valid.');
        fileInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400; // Ukuran max lebar untuk efisiensi penyimpanan
            const MAX_HEIGHT = 400; // Ukuran max tinggi
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Kompresi ke JPEG dengan kualitas 70% (ukuran file berkurang drastis, kualitas tetap baik)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            const imageField = document.getElementById('product-image');
            imageField.value = compressedBase64;
            updateImagePreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateImagePreview() {
    const preview = document.getElementById('image-preview');
    const url = document.getElementById('product-image').value.trim();
    preview.innerHTML = '';

    if (!url) {
        preview.innerHTML = "<i class='bx bx-image'></i>";
        return;
    }

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Preview gambar menu';
    img.onerror = () => {
        preview.innerHTML = "<i class='bx bx-image'></i>";
    };

    preview.appendChild(img);
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
