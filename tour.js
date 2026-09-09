/* ==========================================================================
   MOTOR DEL TOUR INTERACTIVO (ONBOARDING) - KREA'BYTS
   ========================================================================== */

class InteractiveTour {
    constructor(steps) {
        this.steps = steps;
        this.currentStepIndex = 0;
        this.overlay = null;
        this.tooltip = null;
        this.isActive = false;
        
        // Mantener referencia al original z-index y positions
        this.originalStyles = new Map();
    }

    start() {
        if (this.isActive || this.steps.length === 0) return;
        this.isActive = true;
        this.currentStepIndex = 0;

        // Crear overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        // Evitar scroll de fondo
        document.body.style.overflow = 'hidden';
        document.body.appendChild(this.overlay);

        // Crear tooltip container
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tour-tooltip';
        document.body.appendChild(this.tooltip);

        this.showStep();
    }

    end() {
        this.isActive = false;
        this.clearHighlight();
        
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        document.body.style.overflow = '';
        
        // Cierra el carrito si el tour lo dejó abierto
        const cartDrawer = document.getElementById('cartDrawer');
        if (cartDrawer && !cartDrawer.classList.contains('translate-x-full')) {
            if (typeof toggleCart === 'function') toggleCart();
        }
        
        // Marcar como visto
        localStorage.setItem('kreabyts_visited_v2', 'true');
    }

    next() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.showStep();
        } else {
            this.end();
        }
    }

    showStep() {
        this.clearHighlight();
        this.tooltip.classList.remove('active');

        const step = this.steps[this.currentStepIndex];
        
        if (step.onEnter) {
            step.onEnter();
        }
        
        setTimeout(() => {
            let target = null;
            if (step.selector) {
                target = document.querySelector(step.selector);
            }

            if (target) {
                // Hacer scroll al elemento (con offset)
                const y = target.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                setTimeout(() => {
                    this.highlightElement(target, step.transparent);
                    this.positionTooltip(target, step);
                    this.renderTooltipContent(step);
                }, 400); // Esperar scroll
            } else {
                // Modal centrado sin objetivo específico
                this.positionTooltipCenter();
                this.renderTooltipContent(step);
            }
        }, 50);
    }

    highlightElement(el, transparent = false) {
        this.originalStyles.set(el, {
            position: el.style.position,
            zIndex: el.style.zIndex
        });
        
        if (transparent) {
            el.classList.add('tour-highlight-transparent');
        } else {
            el.classList.add('tour-highlight');
        }

        // Arreglar problemas de z-index (Stacking Contexts)
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent);
            if (style.position !== 'static' || style.zIndex !== 'auto') {
                if (!this.originalStyles.has(parent)) {
                    this.originalStyles.set(parent, {
                        position: parent.style.position,
                        zIndex: parent.style.zIndex
                    });
                }
                parent.style.zIndex = '9999';
            }
            parent = parent.parentElement;
        }
    }

    clearHighlight() {
        this.originalStyles.forEach((styles, el) => {
            el.classList.remove('tour-highlight', 'tour-highlight-transparent');
            el.style.position = styles.position;
            el.style.zIndex = styles.zIndex;
        });
        this.originalStyles.clear();
    }

    positionTooltip(target, step) {
        const rect = target.getBoundingClientRect();
        
        // Por defecto, debajo del elemento
        let top = rect.bottom + 16;
        let left = rect.left + (rect.width / 2) - 170; // 170 = mitad del ancho máximo
        
        // Si no cabe abajo, poner arriba
        if (top + 200 > window.innerHeight) {
            top = rect.top - 200 - 16;
        }
        
        // Ajustar límites horizontales
        if (left < 16) left = 16;
        if (left + 340 > window.innerWidth) left = window.innerWidth - 356;

        // Reset transform para evitar conflictos con left/top
        this.tooltip.style.transform = 'none';
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.bottom = 'auto';
    }

    positionTooltipCenter() {
        this.tooltip.style.top = '50%';
        this.tooltip.style.left = '50%';
        this.tooltip.style.transform = 'translate(-50%, -50%)';
        this.tooltip.style.bottom = 'auto';
    }

    renderTooltipContent(step) {
        const isLast = this.currentStepIndex === this.steps.length - 1;
        
        this.tooltip.innerHTML = `
            <div class="flex items-start gap-3 mb-3">
                ${step.icon ? `<div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg flex-shrink-0">${step.icon}</div>` : ''}
                <div>
                    <h3 class="font-black text-slate-800 text-lg leading-tight">${step.title}</h3>
                </div>
            </div>
            <p class="text-sm text-slate-600 mb-5 leading-relaxed">${step.text}</p>
            
            <div class="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                <span class="text-xs font-bold text-slate-400">${this.currentStepIndex + 1} de ${this.steps.length}</span>
                <div class="flex gap-2">
                    ${!isLast ? `<button onclick="appTour.end()" class="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Saltar</button>` : ''}
                    <button onclick="appTour.next()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95">
                        ${isLast ? '¡Comenzar!' : 'Siguiente <i class="fa-solid fa-arrow-right ml-1"></i>'}
                    </button>
                </div>
            </div>
        `;
        
        // Forzar reflow y animar entrada
        setTimeout(() => {
            this.tooltip.classList.add('active');
        }, 10);
    }
}

// Configuración de los pasos
const tourSteps = [
    {
        title: "¡Bienvenido a Krea'byts!",
        text: "Queremos enseñarte rápidamente cómo usar nuestro nuevo catálogo de pedidos. Es muy fácil y rápido.",
        icon: '<i class="fa-solid fa-hand-sparkles"></i>'
    },
    {
        selector: ".bg-white.px-3.py-3.sm\\:px-5", // Envoltura de búsqueda para evitar conflictos de z-index de la section principal
        transparent: false,
        title: "Encuentra lo que buscas",
        text: "Usa nuestra barra de búsqueda o los botones de categorías para encontrar rápidamente lo que necesitas.",
        icon: '<i class="fa-solid fa-magnifying-glass"></i>'
    },
    {
        selector: "#productsGrid > div:first-child", // Primer producto
        transparent: false,
        title: "¡Descuento Automático!",
        text: "Agrega <strong>10 litros o más</strong> de un mismo producto y el sistema te aplicará un <strong>15% de descuento al mayor</strong> de inmediato.",
        icon: '<i class="fa-solid fa-tag"></i>'
    },
    {
        selector: "header", // Header completo
        transparent: false,
        title: "Abre tu pedido",
        text: "Cuando estés listo, haz clic en <strong>Ver Pedido</strong> para revisar lo que has agregado.",
        icon: '<i class="fa-solid fa-basket-shopping"></i>'
    },
    {
        onEnter: () => {
            const cartDrawer = document.getElementById('cartDrawer');
            if (cartDrawer && cartDrawer.classList.contains('translate-x-full')) {
                if (typeof toggleCart === 'function') toggleCart();
            }
        },
        selector: "#deliveryFeeCheck", 
        transparent: false,
        title: "Solicita tu Delivery",
        text: "Aquí puedes solicitar el <strong>Delivery</strong>. Tiene un recargo base de Bs. 200, pero <strong>será gratis hasta cierto punto acordado</strong> por WhatsApp.",
        icon: '<i class="fa-solid fa-motorcycle"></i>'
    }
];

let appTour = null;

function startAppTour() {
    // Solo iniciar si hay productos cargados en la grilla para que funcione el paso 3
    setTimeout(() => {
        appTour = new InteractiveTour(tourSteps);
        appTour.start();
    }, 500);
}
