/* ==========================================================================
   COMPONENTES DE UI, NOTIFICACIONES Y MAPA INTERACTIVO DE UBICACIÓN
   ========================================================================== */

let leafletMap = null;
let mapMarker = null;
let selectedCoords = { lat: 10.0678, lng: -69.3470 }; // Barquisimeto, Estado Lara

// Abrir / cerrar drawer del carrito
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('overlay');
    if (!drawer || !overlay) return;

    const isOpen = !drawer.classList.contains('translate-x-full');

    if (isOpen) {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    } else {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    }
}

// Modal de Confirmación
function showConfirm(title, message, onOk) {
    const modal = document.getElementById('confirmModal');
    const titleElem = document.getElementById('confirmTitle');
    const msgElem = document.getElementById('confirmMessage');
    const btnOk = document.getElementById('btnConfirmOk');
    const btnCancel = document.getElementById('btnConfirmCancel');

    if (!modal || !titleElem || !msgElem || !btnOk || !btnCancel) return;

    titleElem.textContent = title;
    msgElem.textContent = message;

    modal.classList.remove('hidden');

    btnOk.onclick = function() {
        modal.classList.add('hidden');
        if (typeof onOk === 'function') onOk();
    };

    btnCancel.onclick = function() {
        modal.classList.add('hidden');
    };
}

// Toasts flotantes
function showToast(message, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');

    let bg = "bg-slate-900 text-white";
    let icon = "fa-circle-info";

    if (type === "success") {
        bg = "bg-emerald-600 text-white";
        icon = "fa-circle-check";
    } else if (type === "error") {
        bg = "bg-rose-600 text-white";
        icon = "fa-circle-exclamation";
    }

    toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-bold text-xs ${bg} transition duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================================================
// MAPA INTERACTIVO (LEAFLET + GOOGLE MAPS)
// ==========================================================================

function openMapModal() {
    const modal = document.getElementById('mapModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    // Inicializar mapa solo la primera vez que se abre
    setTimeout(() => {
        if (!leafletMap && typeof L !== 'undefined') {
            leafletMap = L.map('mapContainer').setView([selectedCoords.lat, selectedCoords.lng], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap & Krea\'byts'
            }).addTo(leafletMap);

            // Marcador arrastrable
            mapMarker = L.marker([selectedCoords.lat, selectedCoords.lng], { draggable: true }).addTo(leafletMap);

            mapMarker.on('dragend', function(e) {
                const position = mapMarker.getLatLng();
                selectedCoords.lat = position.lat;
                selectedCoords.lng = position.lng;
                updateMapCoordDisplay();
            });

            leafletMap.on('click', function(e) {
                selectedCoords.lat = e.latlng.lat;
                selectedCoords.lng = e.latlng.lng;
                mapMarker.setLatLng(e.latlng);
                updateMapCoordDisplay();
            });

            // Solicitar geolocalización GPS del teléfono si el usuario la permite
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    selectedCoords.lat = pos.coords.latitude;
                    selectedCoords.lng = pos.coords.longitude;
                    leafletMap.setView([selectedCoords.lat, selectedCoords.lng], 16);
                    mapMarker.setLatLng([selectedCoords.lat, selectedCoords.lng]);
                    updateMapCoordDisplay();
                }, function(err) {
                    console.log("GPS no otorgado, usando centro de Barquisimeto.");
                });
            }
        } else if (leafletMap) {
            leafletMap.invalidateSize();
        }
        updateMapCoordDisplay();
    }, 100);
}

function closeMapModal() {
    const modal = document.getElementById('mapModal');
    if (modal) modal.classList.add('hidden');
}

function updateMapCoordDisplay() {
    const display = document.getElementById('mapCoordText');
    if (display) {
        display.innerHTML = `📍 Coordenadas: <strong>${selectedCoords.lat.toFixed(5)}, ${selectedCoords.lng.toFixed(5)}</strong>`;
    }
}

// Confirmar ubicación del mapa y cargar enlace directo a Google Maps
function confirmMapLocation() {
    const addressInput = document.getElementById('customerAddress');
    const gmapsUrl = `https://maps.google.com/?q=${selectedCoords.lat.toFixed(6)},${selectedCoords.lng.toFixed(6)}`;
    
    if (addressInput) {
        const prevText = addressInput.value.replace(/📍 Google Maps: https:\/\/maps\.google\.com\/\?q=[^\s]+/g, '').trim();
        if (prevText) {
            addressInput.value = `${prevText} (📍 Google Maps: ${gmapsUrl})`;
        } else {
            addressInput.value = `📍 Google Maps: ${gmapsUrl}`;
        }
    }

    closeMapModal();
    showToast("Ubicación exacta de Google Maps guardada", "success");
}
