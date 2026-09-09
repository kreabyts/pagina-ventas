/* ==========================================================================
   LÓGICA DEL CATÁLOGO, FILTROS Y RENDIMIENTO RESPONSIVO
   ========================================================================== */

let products = [];
let activeCategory = "Todas";

// Carga de productos y sincronización de datos
function loadProducts() {
    const stored = localStorage.getItem('kreabyts_products_v4');
    if (stored) {
        try {
            products = JSON.parse(stored);
            if (typeof defaultProducts !== 'undefined') {
                defaultProducts.forEach(defItem => {
                    const existingIndex = products.findIndex(p => p.id === defItem.id);
                    if (existingIndex === -1) {
                        products.push(defItem);
                    } else {
                        Object.assign(products[existingIndex], defItem);
                    }
                });
            }
        } catch(e) {
            products = (typeof defaultProducts !== 'undefined') ? [...defaultProducts] : [];
        }
    } else {
        products = (typeof defaultProducts !== 'undefined') ? [...defaultProducts] : [];
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('kreabyts_products_v4', JSON.stringify(products));
}

// Renderizado de Chips de Categorías
function renderCategoryChips() {
    const categories = ["Todas", ...new Set(products.map(p => p.category || "General"))];
    const container = document.getElementById('categoryChips');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => {
        const isActive = cat === activeCategory;
        return `
            <button onclick="setCategory('${cat}')" class="px-3.5 py-1.5 rounded-full transition whitespace-nowrap font-bold text-xs ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }">
                ${cat}
            </button>
        `;
    }).join('');
}

function setCategory(cat) {
    activeCategory = cat;
    renderCategoryChips();
    applyFilters();
}

// Búsqueda y Filtrado directo (Sin selector de orden por defecto)
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    let filtered = products.filter(p => {
        const matchesQuery = (p.name || '').toLowerCase().includes(query) || (p.desc || '').toLowerCase().includes(query);
        const matchesCat = activeCategory === "Todas" || p.category === activeCategory;
        return matchesQuery && matchesCat;
    });

    renderProducts(filtered);
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = "";
    activeCategory = "Todas";
    renderCategoryChips();
    applyFilters();
}

// Renderizado del Grid Optimizado para cualquier pantalla (Móvil, Tablet, Desktop)
function renderProducts(items) {
    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('emptyCatalog');
    const countSpan = document.getElementById('resultsCount');

    if (!grid || !empty || !countSpan) return;

    countSpan.textContent = `${items.length} ${items.length === 1 ? 'producto' : 'productos'}`;

    if (items.length === 0) {
        grid.innerHTML = "";
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = items.map(p => {
        const cartItem = (typeof cart !== 'undefined') ? cart.find(c => c.id === p.id) : null;
        const qtyInCart = cartItem ? cartItem.qty : 0;
        
        // Precio al mayor (15% menos)
        const wholesalePrice = (typeof getWholesalePrice === 'function') 
            ? getWholesalePrice(p) 
            : (p.price * 0.85);
        return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition duration-300 flex flex-col justify-between group relative overflow-hidden">
                <!-- Banner Promoción al Mayor -->
                <div class="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-bl-xl shadow-sm flex items-center gap-1 z-10">
                    <i class="fa-solid fa-tag hidden sm:inline"></i> 15% OFF (10+)
                </div>

                <!-- Imagen del producto (grande arriba) o ícono automático por nombre si no se especifica URL -->
                <div class="w-full h-32 sm:h-40 overflow-hidden bg-slate-100">
                    <img src="${p.image || `img/${p.name}.jpg`}" alt="${p.name}" class="w-full h-full object-cover" onerror="this.parentElement.outerHTML='<div class=\\'w-full h-20 sm:h-24 bg-indigo-50 flex items-center justify-center text-indigo-400 text-4xl sm:text-5xl group-hover:bg-indigo-600 group-hover:text-white transition duration-300\\'><i class=\\'fa-solid ${p.icon || 'fa-bottle-droplet'}\\'></i></div>'">
                </div>

                <div class="p-3 sm:p-4 flex flex-col flex-grow">
                    <!-- Categoría + Nombre -->
                    <span class="text-[8px] sm:text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">${p.category || 'General'}</span>
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1 leading-tight">${p.name}</h3>
                    <p class="text-[10px] sm:text-xs text-slate-500 leading-snug mb-3 line-clamp-2 flex-grow">${p.desc}</p>


                <!-- Bloque de Precios: Detal vs Al Mayor -->
                <!-- Bloque de Precios: Detal vs Al Mayor -->
                <div class="pt-2 sm:pt-3 border-t border-slate-100 space-y-2">
                    <div class="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-1">
                        <div>
                            <span class="text-[8px] font-bold text-slate-400 block uppercase">Detal</span>
                            <span class="text-xs sm:text-sm font-extrabold text-slate-700">Bs. ${Number(p.price).toFixed(2)}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[8px] font-black text-emerald-600 block uppercase flex items-center justify-end gap-1">
                                <i class="fa-solid fa-sparkles"></i> Mayor
                            </span>
                            <span class="text-xs sm:text-sm font-black text-emerald-700">Bs. ${wholesalePrice.toFixed(2)}</span>
                        </div>
                    </div>

                    ${qtyInCart > 0 
                        ? `<div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl overflow-hidden h-[36px] sm:h-[44px]">
                               <button onclick="changeQty(${p.id}, -1)" class="w-1/3 h-full flex items-center justify-center text-indigo-700 hover:bg-indigo-100 transition font-bold text-lg">-</button>
                               <div class="w-1/3 h-full flex items-center justify-center bg-white font-black text-indigo-900 text-xs sm:text-sm border-x border-indigo-100">${qtyInCart}</div>
                               <button onclick="changeQty(${p.id}, 1)" class="w-1/3 h-full flex items-center justify-center text-indigo-700 hover:bg-indigo-100 transition font-bold text-lg">+</button>
                           </div>`
                        : `<button onclick="addToCart(${p.id})" class="w-full h-[36px] sm:h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 rounded-xl text-[11px] sm:text-sm font-bold shadow-md shadow-indigo-100 transition active:scale-95 flex items-center justify-center gap-1.5">
                               <i class="fa-solid fa-plus"></i>
                               <span class="hidden sm:inline">Agregar al Pedido</span>
                               <span class="sm:hidden">Agregar</span>
                           </button>`
                    }
                </div>
            </div>
        </div>
        `;
    }).join('');
}
