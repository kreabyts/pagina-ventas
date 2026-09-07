/* ==========================================================================
   LÓGICA DEL CARRITO DE COMPRAS - DESCUENTO AL MAYOR POR PRODUCTO (6+ LITROS)
   ========================================================================== */

let cart = [];
let manualWholesaleOverride = false;

// Carga de estado desde localStorage
function loadCart() {
    const stored = localStorage.getItem('kreabyts_cart_v2');
    if (stored) {
        try {
            cart = JSON.parse(stored);
        } catch(e) {
            cart = [];
        }
    }
    const storedOverride = localStorage.getItem('kreabyts_manual_wholesale');
    if (storedOverride !== null) {
        manualWholesaleOverride = JSON.parse(storedOverride);
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('kreabyts_cart_v2', JSON.stringify(cart));
    localStorage.setItem('kreabyts_manual_wholesale', JSON.stringify(manualWholesaleOverride));
}

// Determinar el precio unitario de un item (15% OFF si la cantidad de ESTE producto es 6+ o por override manual)
function getItemUnitPrice(item) {
    const minQty = (typeof WHOLESALE_MIN_QTY !== 'undefined') ? WHOLESALE_MIN_QTY : 6;
    const itemQualifies = item.qty >= minQty || manualWholesaleOverride;
    
    if (itemQualifies) {
        return (typeof getWholesalePrice === 'function') ? getWholesalePrice(item) : (item.price * 0.85);
    }
    return item.price;
}

// Verificar si un item específico califica para precio al mayor
function isItemWholesale(item) {
    const minQty = (typeof WHOLESALE_MIN_QTY !== 'undefined') ? WHOLESALE_MIN_QTY : 6;
    return item.qty >= minQty || manualWholesaleOverride;
}

// Alternar override manual opcional
function setOrderType(wholesaleMode) {
    manualWholesaleOverride = wholesaleMode;
    saveCart();
    updateCartUI();
    if (typeof applyFilters === 'function') applyFilters();
    
    if (typeof showToast === 'function') {
        if (wholesaleMode) {
            showToast("Modo 'Al Mayor (-15%)' forzado para todo el pedido", "success");
        } else {
            showToast("Modo 'Al Mayor Automático por Producto (6+ litros)' activado", "info");
        }
    }
}

// Agregar producto al carrito
function addToCart(id) {
    if (typeof products === 'undefined') return;
    const product = products.find(p => p.id === id);
    if (!product) return;

    let existing = cart.find(c => c.id === id);
    const minQty = (typeof WHOLESALE_MIN_QTY !== 'undefined') ? WHOLESALE_MIN_QTY : 6;
    const prevItemQty = existing ? existing.qty : 0;

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
        existing = cart.find(c => c.id === id);
    }

    const newItemQty = existing ? existing.qty : 1;

    saveCart();
    updateCartUI();
    if (typeof applyFilters === 'function') applyFilters();

    // Notificación cuando este producto específico alcanza los 6 litros
    if (prevItemQty < minQty && newItemQty >= minQty) {
        if (typeof showToast === 'function') {
            showToast(`🎉 ¡Alcanzaste ${minQty} litros de "${product.name}"! Se aplicó el 15% de descuento a este producto.`, "success");
        }
    } else {
        if (typeof showToast === 'function') showToast(`"${product.name}" agregado al pedido`, "success");
    }
}

// Modificar cantidad
function changeQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(c => c.id !== id);
    }

    saveCart();
    updateCartUI();
    if (typeof applyFilters === 'function') applyFilters();
}

// Eliminar producto
function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    saveCart();
    updateCartUI();
    if (typeof applyFilters === 'function') applyFilters();
    if (typeof showToast === 'function') showToast("Producto eliminado del pedido", "info");
}

// Vaciar carrito
function clearCart() {
    if (cart.length === 0) return;
    
    const confirmAction = () => {
        cart = [];
        manualWholesaleOverride = false;
        saveCart();
        updateCartUI();
        if (typeof applyFilters === 'function') applyFilters();
        if (typeof showToast === 'function') showToast("Carrito vaciado correctamente", "info");
    };

    if (typeof showConfirm === 'function') {
        showConfirm("Vaciar Carrito", "¿Deseas eliminar todos los productos seleccionados?", confirmAction);
    } else {
        if (confirm("¿Deseas vaciar el carrito?")) confirmAction();
    }
}

// Actualizar Interfaz del Carrito y desglose individual por producto
function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const minQty = (typeof WHOLESALE_MIN_QTY !== 'undefined') ? WHOLESALE_MIN_QTY : 6;

    // Totales calculados por item
    const totalRetail = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalCurrent = cart.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.qty), 0);
    const totalSavings = totalRetail - totalCurrent;

    const wholesaleItemsCount = cart.filter(item => isItemWholesale(item)).length;

    const countElem = document.getElementById('cart-count');
    const totalElem = document.getElementById('cartTotal');
    const savingsElem = document.getElementById('cartSavings');
    const promoBanner = document.getElementById('wholesalePromoBanner');
    const container = document.getElementById('cartItems');

    if (countElem) countElem.textContent = totalQty;
    if (totalElem) totalElem.textContent = `Bs. ${totalCurrent.toFixed(2)}`;

    // Radio buttons
    const radioDetal = document.getElementById('radioDetal');
    const radioWholesale = document.getElementById('radioWholesale');
    if (radioDetal) radioDetal.checked = !manualWholesaleOverride;
    if (radioWholesale) radioWholesale.checked = manualWholesaleOverride;

    // Banner dinámico sobre la regla de 6 litros POR PRODUCTO
    if (promoBanner) {
        if (totalQty === 0) {
            promoBanner.className = "p-3 bg-indigo-50 border-b border-indigo-100 text-xs font-medium text-slate-600 text-center";
            promoBanner.innerHTML = `💡 <strong>Promoción al Mayor:</strong> 15% de descuento al llevar <strong>6 o más litros del mismo producto</strong>.`;
        } else if (wholesaleItemsCount > 0) {
            promoBanner.className = "p-3 bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-between shadow-inner";
            promoBanner.innerHTML = `
                <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-circle-check text-amber-300 text-sm"></i>
                    ¡15% desc. aplicado en ${wholesaleItemsCount} ${wholesaleItemsCount === 1 ? 'producto' : 'productos'} (6+ litros)!
                </span>
                <span class="bg-emerald-800 text-white text-[10px] px-2 py-0.5 rounded-full uppercase border border-emerald-400 font-black">-15% OFF</span>
            `;
        } else {
            promoBanner.className = "p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-bold text-center";
            promoBanner.innerHTML = `⚡ Lleva <strong>6 litros o más de un mismo producto</strong> para obtener 15% de descuento al mayor.`;
        }
    }

    if (savingsElem) {
        if (totalSavings > 0) {
            savingsElem.innerHTML = `🔥 Ahorro Total al Mayor: <strong>Bs. ${totalSavings.toFixed(2)}</strong>`;
            savingsElem.classList.remove('hidden');
        } else {
            savingsElem.classList.add('hidden');
        }
    }

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center space-y-3">
                <i class="fa-solid fa-basket-shopping text-4xl text-slate-300"></i>
                <p class="text-sm font-semibold text-slate-500">Tu carrito está vacío</p>
                <p class="text-xs text-slate-400">Agrega 6 o más litros de un producto para obtener 15% de descuento automático en ese item.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = cart.map(item => {
        const isWholesale = isItemWholesale(item);
        const unitPrice = getItemUnitPrice(item);
        const itemTotal = unitPrice * item.qty;
        const neededForDiscount = minQty - item.qty;

        return `
            <div class="flex flex-col gap-1 pt-3 first:pt-0">
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <div class="flex items-center gap-1.5">
                            <h4 class="font-bold text-sm text-slate-800">${item.name}</h4>
                            ${isWholesale 
                                ? `<span class="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded border border-emerald-300">-15% AL MAYOR</span>` 
                                : `<span class="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">Detal</span>`
                            }
                        </div>
                        <p class="text-xs text-slate-500 font-semibold">
                            Bs. ${unitPrice.toFixed(2)} x ${item.qty} = 
                            <strong class="${isWholesale ? 'text-emerald-700 font-black' : 'text-indigo-600'}">Bs. ${itemTotal.toFixed(2)}</strong>
                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <div class="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                            <button onclick="changeQty(${item.id}, -1)" class="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs">-</button>
                            <span class="px-2 text-xs font-bold text-slate-800">${item.qty}</span>
                            <button onclick="changeQty(${item.id}, 1)" class="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs">+</button>
                        </div>
                        <button onclick="removeFromCart(${item.id})" class="text-slate-400 hover:text-rose-600 p-1 transition" title="Eliminar">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </div>

                <!-- Mensaje orientativo de litros faltantes por producto -->
                ${!isWholesale && neededForDiscount > 0 ? `
                    <div class="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                        <i class="fa-solid fa-circle-info text-amber-500"></i>
                        Lleva ${neededForDiscount} ${neededForDiscount === 1 ? 'litro más' : 'litros más'} de ${item.name} para 15% desc.
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Envío a WhatsApp con desglose claro por producto y mensaje directo
function checkoutWhatsApp() {
    if (cart.length === 0) {
        if (typeof showToast === 'function') showToast("El carrito está vacío. Agrega productos.", "error");
        return;
    }
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.classList.remove('hidden');
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.classList.add('hidden');
}

function finalizeWhatsAppCheckout(paymentMethod) {
    closePaymentModal();

    const addressElem = document.getElementById('customerAddress');
    const address = addressElem ? addressElem.value.trim() : '';

    const totalRetail = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalCurrent = cart.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.qty), 0);
    const totalSavings = totalRetail - totalCurrent;

    let message = `🛒 *NUEVO PEDIDO - KREA'BYTS*\n`;
    message += `-----------------------------------\n`;
    
    cart.forEach(item => {
        const uPrice = getItemUnitPrice(item);
        const subtotal = uPrice * item.qty;
        const isWholesale = isItemWholesale(item);
        const tag = isWholesale ? `🏷️ (15% Desc. Al Mayor)` : `(Detal)`;
        message += `• *${item.name}* x${item.qty} -> Bs. ${subtotal.toFixed(2)} ${tag}\n`;
    });
    
    message += `-----------------------------------\n`;
    message += `💰 *TOTAL A PAGAR:* Bs. ${totalCurrent.toFixed(2)}\n`;
    
    if (totalSavings > 0) {
        message += `🎉 *AHORRO TOTAL EN PRODUCTOS AL MAYOR:* Bs. ${totalSavings.toFixed(2)}\n`;
    }
    
    message += `💳 *MÉTODO DE PAGO:* ${paymentMethod}\n`;
    
    if (address) {
        message += `📍 *Ubicación / Entrega:* ${address}\n`;
    } else {
        message += `📍 *Ubicación:* Barquisimeto (Coordinar en chat)\n`;
    }

    message += `\nHola Krea'byts, quedo atento para coordinar la entrega. ¡Muchas gracias!`;

    const phone = "584121665971";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
