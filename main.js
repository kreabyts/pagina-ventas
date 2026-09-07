/* ==========================================================================
   INICIALIZACIÓN PRINCIPAL DE LA APLICACIÓN
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Establecer año actual en el footer
    const yearSpan = document.getElementById('yearSpan');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Inicializar productos y carrito
    if (typeof loadProducts === 'function') loadProducts();
    if (typeof loadCart === 'function') loadCart();
    if (typeof renderCategoryChips === 'function') renderCategoryChips();
    if (typeof applyFilters === 'function') applyFilters();
});
