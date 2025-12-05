let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];
let categoriaActual = 'Todos';
let busquedaActual = '';
const listaProductos = document.querySelector("#lista-productos");
const cartBadge = document.querySelector("#cart-badge");
const searchInput = document.querySelector("#search-input");
const filtrosBotones = document.querySelector("#filtros-botones");
const noResults = document.querySelector("#no-results");
const cartSidebar = document.querySelector("#cart-sidebar");
const cartOverlay = document.querySelector("#cart-overlay");
const openCartBtn = document.querySelector("#open-cart");
const closeCartBtn = document.querySelector("#close-cart");
const cartItemsContainer = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const subtotalAmount = document.querySelector("#subtotal-amount");
const btnCheckout = document.querySelector("#btn-checkout");
const btnClearCart = document.querySelector("#btn-clear-cart");

document.addEventListener("DOMContentLoaded", (e) => {
    fetchData();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        renderCartSidebar();
        actualizarContadorCarrito();
    }
    setupCartListeners();
    setupSortListener();
    setupMobileSidebar();
    initCarousel();
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            offset: 100,
            once: true,
            easing: 'ease-in-out'
        });
    }
});

const fetchData = async () => {
    try {
        const res = await fetch("productos.json");
        const data = await res.json();
        todosLosProductos = data;
        const novedades = data.filter(p => p.esNovedad === true);
        const ofertas = data.filter(p => p.enOferta === true);
        const productosDestacados = [...novedades, ...ofertas].filter((producto, index, self) =>
            index === self.findIndex(p => p.id === producto.id)
        );
        productosFiltrados = productosDestacados;
        const categorias = extraerCategorias(data);
        pintarFiltros(categorias);
        pintarProductos(productosDestacados);
        eventoBotones(data);
    } catch (error) {
        console.log(error);
        mostrarNotificacion("Error al cargar los productos", "error");
    }
};

const extraerCategorias = (data) => {
    const categorias = new Set();
    data.forEach(producto => {
        const match = producto.title.match(/^(.+?)\s*#\d+/);
        if (match) {
            const categoria = match[1].trim();
            categorias.add(categoria);
        }
    });
    return Array.from(categorias).sort();
};

const pintarFiltros = (categorias) => {
    if (!filtrosBotones) {
        return;
    }
    const fragment = document.createDocumentFragment();
    const btnTodos = document.createElement('button');
    btnTodos.className = 'btn-filtro active';
    btnTodos.textContent = 'Todos';
    btnTodos.addEventListener('click', () => {
        categoriaActual = 'Todos';
        document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
        btnTodos.classList.add('active');
        aplicarFiltros();
    });
    fragment.appendChild(btnTodos);
    categorias.forEach(categoria => {
        const btn = document.createElement('button');
        btn.className = 'btn-filtro';
        btn.textContent = categoria;
        btn.addEventListener('click', () => {
            categoriaActual = categoria;
            document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active');
            aplicarFiltros();
        });
        fragment.appendChild(btn);
    });
    filtrosBotones.appendChild(fragment);
    const mobileFiltrosBotones = document.getElementById('mobile-filtros-botones');
    if (mobileFiltrosBotones) {
        const mobileFragment = new DocumentFragment();
        const mobileBtnTodos = document.createElement('button');
        mobileBtnTodos.className = 'btn-filtro active';
        mobileBtnTodos.textContent = 'Todos';
        mobileBtnTodos.addEventListener('click', () => {
            categoriaActual = 'Todos';
            document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
            mobileBtnTodos.classList.add('active');
            btnTodos.classList.add('active');
            aplicarFiltros();
            closeMobileSidebar();
        });
        mobileFragment.appendChild(mobileBtnTodos);
        categorias.forEach(categoria => {
            const mobileBtn = document.createElement('button');
            mobileBtn.className = 'btn-filtro';
            mobileBtn.textContent = categoria;
            mobileBtn.addEventListener('click', () => {
                categoriaActual = categoria;
                document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
                mobileBtn.classList.add('active');
                const desktopBtn = Array.from(filtrosBotones.querySelectorAll('.btn-filtro')).find(b => b.textContent === categoria);
                if (desktopBtn) desktopBtn.classList.add('active');
                aplicarFiltros();
                closeMobileSidebar();
            });
            mobileFragment.appendChild(mobileBtn);
        });
        mobileFiltrosBotones.appendChild(mobileFragment);
    }
};

// Autocomplete variables
let currentSuggestionIndex = -1;
let debounceTimer;
const suggestionsContainer = document.getElementById('search-suggestions');

const showSuggestions = (suggestions) => {
    if (!suggestionsContainer) return;

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

    // Add click listeners
    document.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const productId = item.dataset.id;
            window.location.href = `producto.html?id=${productId}`;
        });
    });
};

const hideSuggestions = () => {
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('active');
    }
    currentSuggestionIndex = -1;
};

const searchProductsAutocomplete = (term) => {
    if (!term || term.length < 2) {
        hideSuggestions();
        return;
    }

    const results = todosLosProductos.filter(product =>
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

searchInput.addEventListener('input', (e) => {
    busquedaActual = e.target.value.toLowerCase();
    aplicarFiltros();

    // Autocomplete
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchProductsAutocomplete(e.target.value.trim());
    }, 300);
});

// Keyboard navigation for autocomplete
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
    } else if (e.key === 'Enter' && currentSuggestionIndex >= 0 && items[currentSuggestionIndex]) {
        e.preventDefault();
        const productId = items[currentSuggestionIndex].dataset.id;
        window.location.href = `producto.html?id=${productId}`;
    } else if (e.key === 'Escape') {
        hideSuggestions();
        searchInput.blur();
    }
});

// Focus event for autocomplete
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) {
        searchProductsAutocomplete(searchInput.value.trim());
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        hideSuggestions();
    }
});

const aplicarFiltros = () => {
    let resultados = todosLosProductos;
    if (categoriaActual !== 'Todos') {
        resultados = resultados.filter(producto => {
            const match = producto.title.match(/^(.+?)\s*#\d+/);
            if (match) {
                const categoriaProducto = match[1].trim();
                return categoriaProducto === categoriaActual;
            }
            return false;
        });
    }
    if (busquedaActual) {
        resultados = resultados.filter(producto => {
            return producto.title.toLowerCase().includes(busquedaActual);
        });
    }
    productosFiltrados = resultados;
    listaProductos.innerHTML = '';
    if (resultados.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        pintarProductos(resultados);
        eventoBotones(todosLosProductos);
    }
};

const pintarProductos = (data) => {
    const template = document.querySelector("#template-producto");
    if (!template) {
        console.error('ERROR: Template no encontrado!');
        return;
    }
    const fragment = new DocumentFragment();
    data.forEach((producto, index) => {
        const clone = template.content.cloneNode(true);
        // Add AOS animation to the product card
        const cardCol = clone.querySelector('.col-12');
        if (cardCol) {
            cardCol.setAttribute('data-aos', 'fade-up');
            cardCol.setAttribute('data-aos-duration', '600');
            cardCol.setAttribute('data-aos-delay', `${index * 50}`);
        }
        clone.querySelector("img").setAttribute("src", producto.thumbnailUrl);
        clone.querySelector("h5").textContent = producto.title;
        const badgeNew = clone.querySelector(".badge-new");
        const badgeDiscount = clone.querySelector(".badge-discount");

        if (producto.isNew) {
            badgeNew.style.display = "block";
        }
        if (producto.discount) {
            badgeDiscount.textContent = `-${producto.discount}%`;
            badgeDiscount.style.display = "block";
        }
        const originalPriceEl = clone.querySelector(".original-price");
        const originalPriceValue = clone.querySelector(".original-price-value");
        const currentPriceValue = clone.querySelector(".current-price-value");
        if (producto.discount && producto.originalPrice) {
            originalPriceEl.style.display = "block";
            originalPriceValue.textContent = producto.originalPrice;
        }
        currentPriceValue.textContent = producto.precio;
        const btnAddCart = clone.querySelector(".btn-add-cart");
        const btnQuickView = clone.querySelector(".btn-quick-view");
        btnAddCart.setAttribute("data-id", producto.id);
        btnQuickView.setAttribute("data-id", producto.id);

        fragment.appendChild(clone);
    });
    listaProductos.appendChild(fragment);
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
};

const eventoBotones = (data) => {
    // Add to Cart buttons
    const btnAgregar = document.querySelectorAll(".btn-add-cart");
    btnAgregar.forEach((btn) => {
        btn.addEventListener("click", () => {
            const [producto] = data.filter(
                (item) => item.id === parseInt(btn.dataset.id)
            );
            const productoCarrito = {
                id: producto.id,
                title: producto.title,
                precio: producto.precio,
                thumbnailUrl: producto.thumbnailUrl,
                cantidad: 1,
                precioTotal: producto.precio,
            };
            const index = carrito.findIndex((item) => item.id === productoCarrito.id);
            if (index === -1) {
                carrito.push(productoCarrito);
            } else {
                carrito[index].cantidad++;
                carrito[index].precioTotal = carrito[index].cantidad * carrito[index].precio;
            }
            renderCartSidebar();
            guardarCarrito();
            actualizarContadorCarrito();
            mostrarNotificacion(`${producto.title} agregado al carrito`, "success", producto.thumbnailUrl);
        });
    });

    // Quick View buttons - now navigate to product detail page
    const btnQuickView = document.querySelectorAll(".btn-quick-view");
    btnQuickView.forEach((btn) => {
        btn.addEventListener("click", () => {
            const productId = parseInt(btn.dataset.id);
            window.location.href = `producto.html?id=${productId}`;
        });
    });

    // Make product images and titles clickable to go to detail page
    const productCards = document.querySelectorAll(".card");
    productCards.forEach((card) => {
        const img = card.querySelector(".card-img-top");
        const title = card.querySelector(".card-title");

        if (img) {
            img.style.cursor = "pointer";
            img.addEventListener("click", () => {
                const addCartBtn = card.querySelector(".btn-add-cart");
                if (addCartBtn) {
                    const productId = parseInt(addCartBtn.dataset.id);
                    window.location.href = `producto.html?id=${productId}`;
                }
            });
        }
        if (title) {
            title.style.cursor = "pointer";
            title.addEventListener("click", () => {
                const addCartBtn = card.querySelector(".btn-add-cart");
                if (addCartBtn) {
                    const productId = parseInt(addCartBtn.dataset.id);
                    window.location.href = `producto.html?id=${productId}`;
                }
            });
        }
    });
};

const setupCartListeners = () => {
    openCartBtn.addEventListener('click', openCartSidebar);
    closeCartBtn.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);
    btnCheckout.addEventListener('click', () => {
        if (carrito.length === 0) {
            mostrarNotificacion("Tu carrito está vacío", "error");
            return;
        }
        closeCartSidebar();
        mostrarModalCompra();
    });
    btnClearCart.addEventListener('click', () => {
        if (carrito.length === 0) return;
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            carrito = [];
            renderCartSidebar();
            guardarCarrito();
            actualizarContadorCarrito();
            mostrarNotificacion("Carrito vaciado", "info");
        }
    });
};

const openCartSidebar = () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const closeCartSidebar = () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
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
                    mostrarNotificacion(`${item.title} eliminado del carrito`, "info");
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
            const item = carrito.find(item => item.id === id);
            if (item) {
                carrito = carrito.filter(item => item.id !== id);
                renderCartSidebar();
                guardarCarrito();
                actualizarContadorCarrito();
                mostrarNotificacion(`${item.title} eliminado del carrito`, "info");
            }
        });
    });
};

const guardarCarrito = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

const actualizarContadorCarrito = () => {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    cartBadge.textContent = totalItems;
    if (totalItems > 0) {
        cartBadge.classList.add('pulse');
        setTimeout(() => cartBadge.classList.remove('pulse'), 300);
    }
};

const mostrarModalCompra = () => {
    window.location.href = 'checkout.html';
};

const mostrarNotificacion = (mensaje, tipo = "success", productoImg = null) => {
    const colores = {
        success: "linear-gradient(135deg, #43ed00 0%, #06c000 100%)",
        error: "linear-gradient(135deg, #ff4757 0%, #ff6348 100%)",
        info: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    };
    const iconos = {
        success: "✓",
        error: "✕",
        info: "ℹ"
    };
    let notificationHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            ${productoImg ? `<img src="${productoImg}" style="width: 50px; height: 70px; object-fit: cover; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">` : ''}
            <div style="flex: 1;">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${iconos[tipo] || iconos.success}</div>
                <div style="font-weight: 600;">${mensaje}</div>
            </div>
        </div>
    `;
    Toastify({
        text: mensaje,
        duration: 3500,
        position: "right",
        gravity: "top",
        stopOnFocus: true,
        escapeMarkup: false,
        node: productoImg ? createNotificationNode(mensaje, tipo, productoImg) : undefined,
        style: {
            background: colores[tipo] || colores.success,
            borderRadius: "15px",
            padding: "1rem 1.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            minWidth: "300px"
        },
        offset: {
            x: 20,
            y: 20
        }
    }).showToast();
};

const createNotificationNode = (mensaje, tipo, productoImg) => {
    const iconos = {
        success: "✓",
        error: "✕",
        info: "ℹ"
    };
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; align-items: center; gap: 1rem;';
    if (productoImg) {
        const img = document.createElement('img');
        img.src = productoImg;
        img.style.cssText = 'width: 50px; height: 70px; object-fit: cover; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
        div.appendChild(img);
    }
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'flex: 1;';
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 1.5rem; margin-bottom: 0.25rem;';
    icon.textContent = iconos[tipo] || iconos.success;
    const text = document.createElement('div');
    text.style.cssText = 'font-weight: 600;';
    text.textContent = mensaje;
    contentDiv.appendChild(icon);
    contentDiv.appendChild(text);
    div.appendChild(contentDiv);
    return div;
};

const setupSortListener = () => {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            sortProducts(sortValue);
        });
    }
};

const sortProducts = (sortType) => {
    let sortedData = [...productosFiltrados];
    switch (sortType) {
        case 'price-asc':
            sortedData.sort((a, b) => a.precio - b.precio);
            break;
        case 'price-desc':
            sortedData.sort((a, b) => b.precio - a.precio);
            break;
        case 'popularity':
            sortedData.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            break;
        case 'release-date':
            sortedData.sort((a, b) => {
                const dateA = new Date(a.releaseDate || '2000-01-01');
                const dateB = new Date(b.releaseDate || '2000-01-01');
                return dateB - dateA;
            });
            break;
        case 'default':
        default:
            sortedData = [...productosFiltrados];
            break;
    }
    listaProductos.innerHTML = '';
    pintarProductos(sortedData);
    eventoBotones(sortedData);
};

let currentSlide = 0;
let carouselInterval;

const initCarousel = () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('#carousel-prev');
    const nextBtn = document.querySelector('#carousel-next');
    if (!slides.length) return;
    const startAutoSlide = () => {
        carouselInterval = setInterval(() => {
            nextSlide();
        }, 8000);
    };
    const stopAutoSlide = () => {
        clearInterval(carouselInterval);
    };
    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    };
    const nextSlide = () => {
        showSlide(currentSlide + 1);
    };
    const prevSlide = () => {
        showSlide(currentSlide - 1);
    };
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    });
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
    startAutoSlide();
};

const setupMobileSidebar = () => {
    const btnHamburger = document.getElementById('btn-hamburger');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileOverlay = document.getElementById('mobile-sidebar-overlay');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileSortSelect = document.getElementById('mobile-sort-select');
    if (!btnHamburger || !mobileSidebar) return;
    btnHamburger.addEventListener('click', () => {
        mobileSidebar.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    btnCloseSidebar.addEventListener('click', closeMobileSidebar);
    mobileOverlay.addEventListener('click', closeMobileSidebar);
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const desktopSearchInput = document.getElementById('search-input');
            if (desktopSearchInput) {
                desktopSearchInput.value = e.target.value;
                desktopSearchInput.dispatchEvent(new Event('input'));
            }
        });
    }
    if (mobileSortSelect) {
        mobileSortSelect.addEventListener('change', (e) => {
            const desktopSortSelect = document.getElementById('sort-select');
            if (desktopSortSelect) {
                desktopSortSelect.value = e.target.value;
                sortProducts(e.target.value);
            }
            closeMobileSidebar();
        });
    }
};

const closeMobileSidebar = () => {
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileOverlay = document.getElementById('mobile-sidebar-overlay');

    if (mobileSidebar) mobileSidebar.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
};