const defaultMenuItems = [
    { id: 1, name: "Nasi Uduk Biasa", category: "nasi_uduk", price: 15000, image: "images/nasi_uduk.png" },
    { id: 2, name: "Nasi Uduk Spesial Dewa", category: "nasi_uduk", price: 25000, image: "images/nasi_uduk.png" },
    { id: 3, name: "Nasi Uduk Sultan", category: "nasi_uduk", price: 35000, image: "images/nasi_uduk.png" },
    { id: 4, name: "Nasi Goreng Spesial", category: "nasi_goreng", price: 20000, image: "images/nasi_goreng.png" },
    { id: 5, name: "Nasi Goreng Seafood", category: "nasi_goreng", price: 28000, image: "images/nasi_goreng.png" },
    { id: 6, name: "Kwetiau Goreng", category: "kwetiau", price: 22000, image: "https://images.unsplash.com/photo-1612929633738-8fe01f7c8166?auto=format&fit=crop&w=400&q=80" },
    { id: 7, name: "Kwetiau Siram Spesial", category: "kwetiau", price: 25000, image: "https://images.unsplash.com/photo-1612929633738-8fe01f7c8166?auto=format&fit=crop&w=400&q=80" },
    { id: 8, name: "Mie Goreng Spesial", category: "mie", price: 20000, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80" },
    { id: 9, name: "Mie Goreng Jawa", category: "mie", price: 18000, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80" },
    { id: 10, name: "Pangsit Goreng", category: "pangsit", price: 15000, image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80" },
    { id: 11, name: "Pangsit Kuah", category: "pangsit", price: 15000, image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80" },
    { id: 12, name: "Jus Alpukat", category: "jus", price: 12000, image: "images/jus_alpukat.png" },
    { id: 13, name: "Jus Mangga", category: "jus", price: 12000, image: "images/jus_mangga.png" },
    { id: 14, name: "Jus Jeruk", category: "jus", price: 10000, image: "images/jus_jeruk.png" },
    { id: 15, name: "Jus Melon", category: "jus", price: 10000, image: "images/jus_melon.png" },
    { id: 16, name: "Jus Strawberry", category: "jus", price: 12000, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80" },
    { id: 17, name: "Es Teh Kampul", category: "minuman", price: 8000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80" },
    { id: 18, name: "Jeruk Kelapa", category: "minuman", price: 15000, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80" },
];

const categories = [
    { id: "all", name: "Semua Menu" },
    { id: "nasi_uduk", name: "Nasi Uduk Dewa" },
    { id: "nasi_goreng", name: "Nasi Goreng" },
    { id: "kwetiau", name: "Kwetiau" },
    { id: "mie", name: "Mie Goreng" },
    { id: "pangsit", name: "Pangsit" },
    { id: "jus", name: "Jus Buah" },
    { id: "minuman", name: "Minuman Lain" },
];

// Load from Local Storage, if not exists or if we need to force reload defaults, use default.
function getMenuItems() {
    // Forcing reload to apply new images to existing localstorage (in case user already saved old data)
    let saved = localStorage.getItem('nasi_uduk_products');
    let needsUpdate = false;
    
    if (saved) {
        let parsed = JSON.parse(saved);
        // Check if old data has missing images for Jus Mangga
        let mangga = parsed.find(i => i.name === "Jus Mangga");
        if (mangga && mangga.image === "images/jus_alpukat.png") {
            needsUpdate = true;
        }
        if (!needsUpdate) {
            return parsed;
        }
    }
    
    localStorage.setItem('nasi_uduk_products', JSON.stringify(defaultMenuItems));
    return defaultMenuItems;
}

let menuItems = getMenuItems();
