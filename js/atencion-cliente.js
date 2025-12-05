// Cart functionality (same as other pages)
let carrito = [];
const cartBadge = document.querySelector("#cart-badge");
const cartSidebar = document.querySelector("#cart-sidebar");
const cartOverlay = document.querySelector("#cart-overlay");
const openCartBtn = document.querySelector("#open-cart");
const closeCartBtn = document.querySelector("#close-cart");
const cartItemsContainer = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const subtotalAmount = document.querySelector("#subtotal-amount");
const btnCheckout = document.querySelector("#btn-checkout");
const btnClearCart = document.querySelector("#btn-clear-cart");

// Initialize AOS
AOS.init({
    duration: 800,
    offset: 100,
    once: true,
    easing: 'ease-in-out'
});

// Contact form validation and submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!contactForm.checkValidity()) {
            e.stopPropagation();
            contactForm.classList.add('was-validated');
            return;
        }

        // Get form values
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;

        // Show success message
        Toastify({
            text: "¡Mensaje enviado exitosamente! Te responderemos pronto.",
            duration: 4000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(135deg, #43ed00 0%, #06c000 100%)",
                borderRadius: "15px",
                padding: "1rem 1.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            }
        }).showToast();

        // Reset form
        contactForm.reset();
        contactForm.classList.remove('was-validated');
    });
}

// Mobile sidebar
const btnHamburger = document.getElementById('btn-hamburger');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');
const mobileSidebar = document.getElementById('mobile-sidebar');
const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');

if (btnHamburger) {
    btnHamburger.addEventListener('click', () => {
        mobileSidebar.classList.add('active');
        mobileSidebarOverlay.classList.add('active');
    });
}

if (btnCloseSidebar) {
    btnCloseSidebar.addEventListener('click', () => {
        mobileSidebar.classList.remove('active');
        mobileSidebarOverlay.classList.remove('active');
    });
}

if (mobileSidebarOverlay) {
    mobileSidebarOverlay.addEventListener('click', () => {
        mobileSidebar.classList.remove('active');
        mobileSidebarOverlay.classList.remove('active');
    });
}

// Search autocomplete functionality
let allProducts = [];
let currentSuggestionIndex = -1;
let debounceTimer;

fetch('productos.json')
    .then(res => res.json())
    .then(data => {
        allProducts = data;
    })
    .catch(err => console.error('Error loading products:', err));

const searchInput = document.getElementById('search-input');
const searchIcon = document.querySelector('.search-icon');
const suggestionsContainer = document.getElementById('search-suggestions');

const handleSearch = () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        window.location.href = `productos.html?search=${encodeURIComponent(searchTerm)}`;
    }
};

const showSuggestions = (suggestions) => {
    if (suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<div class="search-no-results">No se encontraron resultados</div>';
        suggestionsContainer.classList.add('active');
        return;
    }

    const html = suggestions.map((product, index) => `
        <div class="search-suggestion-item" data-index="${index}" data-id="${product.id}">
            <img src="${product.thumbnailUrl}" alt="${product.title}" class="search-suggestion-img">
            <div class="search-suggestion-info">
                <p class="search-suggestion-title">${product.title}</p>
                <p class="search-suggestion-price">$${product.precio}</p>
            </div>
        </div>
    `).join('');

    suggestionsContainer.innerHTML = html;
    suggestionsContainer.classList.add('active');
    currentSuggestionIndex = -1;

    document.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const productId = item.dataset.id;
            window.location.href = `producto.html?id=${productId}`;
        });
    });
};

const hideSuggestions = () => {
    suggestionsContainer.classList.remove('active');
    currentSuggestionIndex = -1;
};

const searchProducts = (term) => {
    if (!term || term.length < 2) {
        hideSuggestions();
        return;
    }

    const results = allProducts.filter(product =>
        product.title.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 8);

    showSuggestions(results);
};

const highlightSuggestion = (index) => {
    const items = document.querySelectorAll('.search-suggestion-item');
    items.forEach(item => item.classList.remove('highlighted'));

    if (index >= 0 && index < items.length) {
        items[index].classList.add('highlighted');
        items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
};

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchProducts(e.target.value.trim());
        }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = document.querySelectorAll('.search-suggestion-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, items.length - 1);
            highlightSuggestion(currentSuggestionIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
            highlightSuggestion(currentSuggestionIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSuggestionIndex >= 0 && items[currentSuggestionIndex]) {
                const productId = items[currentSuggestionIndex].dataset.id;
                window.location.href = `producto.html?id=${productId}`;
            } else {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
            searchInput.blur();
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
            searchProducts(searchInput.value.trim());
        }
    });
}

if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', handleSearch);
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        hideSuggestions();
    }
});

// Cart functions
const openCartSidebar = () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    renderCartSidebar();
};

const closeCartSidebar = () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
};

const renderCartSidebar = () => {
    cartItemsContainer.innerHTML = '';
    if (carrito.length === 0) {
        cartEmpty.style.display = 'block';
        subtotalAmount.textContent = '$0';
        return;
    }
    cartEmpty.style.display = 'none';
    const template = document.querySelector("#template-cart-item");
    const fragment = document.createDocumentFragment();
    carrito.forEach(item => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.cart-item-img').setAttribute('src', item.thumbnailUrl);
        clone.querySelector('.cart-item-title').textContent = item.title;
        clone.querySelector('.item-price').textContent = item.precio;
        clone.querySelector('.cart-item-quantity').textContent = item.cantidad;
        clone.querySelector('.item-total').textContent = item.precioTotal;
        clone.querySelector('.btn-cart-increase').setAttribute('data-id', item.id);
        clone.querySelector('.btn-cart-decrease').setAttribute('data-id', item.id);
        clone.querySelector('.btn-cart-remove').setAttribute('data-id', item.id);
        fragment.appendChild(clone);
    });
    cartItemsContainer.appendChild(fragment);
    const subtotal = carrito.reduce((total, item) => total + item.precioTotal, 0);
    subtotalAmount.textContent = `$${subtotal}`;
    attachCartButtonListeners();
};

const attachCartButtonListeners = () => {
    document.querySelectorAll('.btn-cart-increase').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = carrito.find(item => item.id === id);
            if (item) {
                item.cantidad++;
                item.precioTotal = item.cantidad * item.precio;
                renderCartSidebar();
                guardarCarrito();
                actualizarContadorCarrito();
            }
        });
    });
    document.querySelectorAll('.btn-cart-decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = carrito.find(item => item.id === id);
            if (item) {
                if (item.cantidad > 1) {
                    item.cantidad--;
                    item.precioTotal = item.cantidad * item.precio;
                } else {
                    carrito = carrito.filter(item => item.id !== id);
                }
                renderCartSidebar();
                guardarCarrito();
                actualizarContadorCarrito();
            }
        });
    });
    document.querySelectorAll('.btn-cart-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            carrito = carrito.filter(item => item.id !== id);
            renderCartSidebar();
            guardarCarrito();
            actualizarContadorCarrito();
        });
    });
};

const guardarCarrito = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

const actualizarContadorCarrito = () => {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    cartBadge.textContent = totalItems;
};

// Cart event listeners
openCartBtn.addEventListener('click', openCartSidebar);
closeCartBtn.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

btnCheckout.addEventListener('click', () => {
    if (carrito.length === 0) {
        Toastify({
            text: "Tu carrito está vacío",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
            }
        }).showToast();
        return;
    }
    window.location.href = 'checkout.html';
});

btnClearCart.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        carrito = [];
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();
        renderCartSidebar();
    }
});

// Load cart from localStorage after all functions are defined
if (localStorage.getItem('carrito')) {
    carrito = JSON.parse(localStorage.getItem('carrito'));
    actualizarContadorCarrito();
}
