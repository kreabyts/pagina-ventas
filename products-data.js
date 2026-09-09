/* ==========================================================================
   CONFIGURACIÓN DE PRODUCTOS, PRECIOS Y PROMOCIÓN AL MAYOR - KREA'BYTS
   ==========================================================================
   ¡AQUÍ PUEDES ACTUALIZAR O AGREGAR PRODUCTOS FÁCILMENTE!
   
   - Descuento por Defecto al Mayor: 15% (Se aplica automáticamente a partir de 10 litros/unidades).
   - Cantidad Mínima para Al Mayor: 10 unidades/litros.
   - Ejemplo: Si compras 10 unidades de Bs. 600.00, cada una queda en Bs. 510.00 (15% menos).
   ========================================================================== */

// Porcentaje de descuento para Promoción al Mayor (15%)
const WHOLESALE_DISCOUNT_PERCENT = 15;

// Cantidad mínima de litros/unidades en total para activar automáticamente el precio al mayor
const WHOLESALE_MIN_QTY = 10;

// Función para calcular el precio al mayor (15% de descuento)
function getWholesalePrice(product) {
    if (product.wholesalePrice && !isNaN(product.wholesalePrice)) {
        return Number(product.wholesalePrice);
    }
    const discount = (product.price * WHOLESALE_DISCOUNT_PERCENT) / 100;
    return product.price - discount;
}

const defaultProducts = [
    {
        id: 1,
        name: "Jabón Ariel",
        desc: "Remoción profunda de manchas y aroma duradero.",
        price: 600,
        category: "Jabones y Detergentes",
        icon: "fa-soap",
        image: ""   // 👉 Pega aquí la URL de la imagen del producto
    },
    {
        id: 2,
        name: "Brisol",
        desc: "Limpieza profunda y brillo radiante en una sola pasada.",
        price: 600,
        category: "Especiales",
        icon: "fa-spray-can-sparkles",
        image: ""   // 👉 Pega aquí la URL de la imagen del producto
    },

    {
        id: 4,
        name: "Desengrasante",
        desc: "Fórmula concentrada para remover grasa difícil rápidamente.",
        price: 600,
        category: "Desengrasantes",
        icon: "fa-pump-soap",
        image: ""   // 👉 Pega aquí la URL de la imagen del producto
    },
    {
        id: 5,
        name: "Cera",
        desc: "Protección y brillo supremo de larga duración para pisos.",
        price: 750,
        category: "Ceras y Brillo",
        icon: "fa-wand-magic-sparkles",
        image: ""   // 👉 Pega aquí la URL de la imagen del producto
    },
    {
        id: 6,
        name: "Cloro Concentrado",
        desc: "Máximo poder blanqueador y desinfección total.",
        price: 330,
        category: "Desinfectantes",
        icon: "fa-bottle-droplet",
        image: ""   // 👉 Pega aquí la URL de la imagen del producto
    },
    {
        id: 3,
        name: "Desinfectante cherry",
        desc: "Elimina el 99.9% de gérmenes con fragancia fresca.",
        price: 450,
        category: "Desinfectantes",
        icon: "fa-shield-virus",
        image: ""   // 👉 Pega aquí la URL de la imagen del producto
    }
];
