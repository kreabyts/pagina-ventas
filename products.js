/* ==========================================================================
   LÓGICA DEL CATÁLOGO, FILTROS Y RENDIMIENTO RESPONSIVO
   ========================================================================== */

let products = [];
let activeCategory = "Todas";

// Carga de productos y sincronización de datos
function loadProducts() {
    const stored = localStorage.getItem('kreabyts_products_v2');
    if (stored) {
        try {
            products = JSON.parse(stored);
            if (typeof defaultProducts !== 'undefined') {
                defaultProducts.forEach(defItem => {
                    const existingIndex = products.findIndex(p => p.id === defItem.id);
                    if (existingIndex === -1) {
                        products.push(defItem);
                    } else {
                        products[existingIndex].price = defItem.price;
                        products[existingIndex].name = defItem.name;
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
    localStorage.setItem('kreabyts_products_v2', JSON.stringify(products));
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
        const matchesQuery = p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
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
            <div class="bg-white rounded-xl p-3 sm:p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition duration-300 flex flex-col justify-between group relative overflow-hidden">
                <!-- Banner Promoción al Mayor -->
                <div class="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                    <i class="fa-solid fa-tag hidden sm:inline"></i> 15% OFF (6+)
                </div>

                <div>
                    <!-- Header de Tarjeta e Icono -->
                    <div class="flex items-start justify-between mb-2 mt-1">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg sm:text-xl group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                            <i class="fa-solid ${p.icon || 'fa-bottle-droplet'}"></i>
                        </div>
                        <span class="text-[8px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            ${p.category || 'General'}
                        </span>
                    </div>

                    <h3 class="text-sm sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1 leading-tight">${p.name}</h3>
                    <p class="text-[10px] sm:text-xs text-slate-500 leading-snug mb-3 sm:mb-4 line-clamp-2">${p.desc}</p>
                </div>

                <!-- Bloque de Precios: Detal vs Al Mayor -->
                <div class="pt-2 sm:pt-3 border-t border-slate-100 space-y-2 flex-grow flex flex-col justify-end">
                    <div class="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
                        <div>
                            <span class="text-[8px] sm:text-[10px] font-bold text-slate-400 block uppercase">Detal</span>
                            <span class="text-xs sm:text-base font-extrabold text-slate-700">Bs. ${Number(p.price).toFixed(2)}</span>
                        </div>
                        <div class="text-left sm:text-right w-full sm:w-auto">
                            <span class="text-[8px] sm:text-[10px] font-black text-emerald-600 block uppercase flex items-center justify-start sm:justify-end gap-1">
                                <i class="fa-solid fa-sparkles"></i> Mayor
                            </span>
                            <span class="text-sm sm:text-lg font-black text-emerald-700">Bs. ${wholesalePrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-end pt-1">
                        <button onclick="addToCart(${p.id})" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 sm:py-2.5 px-2 sm:px-3.5 rounded-xl text-[11px] sm:text-sm font-bold shadow-md shadow-indigo-100 transition active:scale-95 flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-plus"></i>
                            <span class="hidden sm:inline">Agregar al Pedido</span>
                            <span class="sm:hidden">Agregar</span>
                            ${qtyInCart > 0 ? `<span class="bg-indigo-900 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">${qtyInCart}</span>` : ''}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
