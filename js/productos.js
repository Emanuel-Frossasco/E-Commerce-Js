// productos.js - Página de catálogo completo
let productos = [];
let productosFiltrados = [];
let categoriaActual = 'todos';
let ordenActual = 'default';

// Cargar productos
const cargarProductos = async () => {
    try {
        const response = await fetch('./productos.json');
        productos = await response.json();
        productosFiltrados = [...productos];

        // Generar botones de categoría
        generarBotonesCategorias();

        // Renderizar productos
        renderizarProductos();

        // Inicializar AOS
        AOS.init();
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
};

// Generar botones de categorías dinámicamente
const generarBotonesCategorias = () => {
    const categorias = ['todos', ...new Set(productos.map(p => p.title.split(' ')[0]))];
    const contenedorFiltros = document.getElementById('filtros-botones');
    const contenedorFiltrosMobile = document.getElementById('mobile-filtros-botones');

    contenedorFiltros.innerHTML = '';
    contenedorFiltrosMobile.innerHTML = '';

    categorias.forEach(categoria => {
        // Desktop
        const boton = document.createElement('button');
        boton.className = `category-btn ${categoria === 'todos' ? 'active' : ''}`;
        boton.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
        boton.dataset.categoria = categoria;
        boton.addEventListener('click', () => filtrarPorCategoria(categoria));
        contenedorFiltros.appendChild(boton);

        // Mobile
        const botonMobile = boton.cloneNode(true);
        botonMobile.addEventListener('click', () => {
            filtrarPorCategoria(categoria);
            cerrarSidebarMobile();
        });
        contenedorFiltrosMobile.appendChild(botonMobile);
    });
};

// Filtrar por categoría
const filtrarPorCategoria = (categoria) => {
    categoriaActual = categoria;

    // Actualizar botones activos
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.categoria === categoria) {
            btn.classList.add('active');
        }
    });

    aplicarFiltros();
};

// Aplicar todos los filtros
const aplicarFiltros = () => {
    let resultados = [...productos];

    // Filtrar por categoría
    if (categoriaActual !== 'todos') {
        resultados = resultados.filter(p => p.title.startsWith(categoriaActual.toUpperCase()));
    }

    // Filtrar por búsqueda
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    if (searchTerm) {
        resultados = resultados.filter(p =>
            p.title.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }

    productosFiltrados = resultados;
    ordenarProductos();
};

// Ordenar productos
const ordenarProductos = () => {
    switch (ordenActual) {
        case 'price-asc':
            productosFiltrados.sort((a, b) => a.precio - b.precio);
            break;
        case 'price-desc':
            productosFiltrados.sort((a, b) => b.precio - a.precio);
            break;
        case 'popularity':
            productosFiltrados.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            break;
        case 'release-date':
            productosFiltrados.sort((a, b) => {
                const dateA = new Date(a.releaseDate || '2000-01-01');
                const dateB = new Date(b.releaseDate || '2000-01-01');
                return dateB - dateA;
            });
            break;
        default:
            // Orden por defecto (por ID)
            productosFiltrados.sort((a, b) => a.id - b.id);
    }

    renderizarProductos();
};

// Renderizar productos
const renderizarProductos = () => {
    const contenedor = document.getElementById('lista-productos');
    const noResults = document.getElementById('no-results');
    const template = document.getElementById('template-producto');

    contenedor.innerHTML = '';

    if (productosFiltrados.length === 0) {
        noResults.style.display = 'flex';
        return;
    }

    noResults.style.display = 'none';

    productosFiltrados.forEach(producto => {
        const clone = template.content.cloneNode(true);

        // Imagen
        const img = clone.querySelector('.card-img-top');
        img.src = producto.thumbnailUrl;
        img.alt = producto.title;
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            window.location.href = `producto.html?id=${producto.id}`;
        });

        // Título
        const title = clone.querySelector('.card-title');
        title.textContent = producto.title;
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            window.location.href = `producto.html?id=${producto.id}`;
        });

        // Badges
        const badgeNew = clone.querySelector('.badge-new');
        const badgeDiscount = clone.querySelector('.badge-discount');

        if (producto.esNovedad) {
            badgeNew.style.display = 'block';
        }

        if (producto.enOferta && producto.discount) {
            badgeDiscount.textContent = `-${producto.discount}%`;
            badgeDiscount.style.display = 'block';
        }

        // Precios
        const originalPriceContainer = clone.querySelector('.original-price');
        const originalPriceValue = clone.querySelector('.original-price-value');
        const currentPriceValue = clone.querySelector('.current-price-value');

        if (producto.enOferta && producto.precioOriginal) {
            originalPriceContainer.style.display = 'block';
            originalPriceValue.textContent = producto.precioOriginal;
        }

        currentPriceValue.textContent = producto.precio;

        // Botón agregar al carrito
        const btnAdd = clone.querySelector('.btn-add-cart');
        btnAdd.addEventListener('click', () => agregarAlCarrito(producto));

        // Botón vista rápida - navigate to product detail page
        const btnQuickView = clone.querySelector('.btn-quick-view');
        btnQuickView.addEventListener('click', () => {
            window.location.href = `producto.html?id=${producto.id}`;
        });

        contenedor.appendChild(clone);
    });
};

// Agregar al carrito
const agregarAlCarrito = (producto) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const existe = carrito.find(item => item.id === producto.id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            title: producto.title,
            precio: producto.precio,
            thumbnailUrl: producto.thumbnailUrl,
            cantidad: 1
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();

    Toastify({
        text: `${producto.title} agregado al carrito`,
        duration: 2000,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(135deg, #43ed00 0%, #36b800 100%)",
        }
    }).showToast();
};

// Actualizar badge del carrito
const actualizarBadgeCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarBadgeCarrito();

    // Búsqueda
    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');

    searchInput.addEventListener('input', aplicarFiltros);
    mobileSearchInput.addEventListener('input', (e) => {
        searchInput.value = e.target.value;
        aplicarFiltros();
    });

    // Ordenamiento
    const sortSelect = document.getElementById('sort-select');
    const mobileSortSelect = document.getElementById('mobile-sort-select');

    sortSelect.addEventListener('change', (e) => {
        ordenActual = e.target.value;
        mobileSortSelect.value = e.target.value;
        ordenarProductos();
    });

    mobileSortSelect.addEventListener('change', (e) => {
        ordenActual = e.target.value;
        sortSelect.value = e.target.value;
        ordenarProductos();
    });

    // Mobile sidebar
    const btnHamburger = document.getElementById('btn-hamburger');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');

    btnHamburger.addEventListener('click', () => {
        mobileSidebar.classList.add('active');
        mobileSidebarOverlay.classList.add('active');
    });

    const cerrarSidebarMobile = () => {
        mobileSidebar.classList.remove('active');
        mobileSidebarOverlay.classList.remove('active');
    };

    btnCloseSidebar.addEventListener('click', cerrarSidebarMobile);
    mobileSidebarOverlay.addEventListener('click', cerrarSidebarMobile);

    // Cart sidebar
    const openCart = document.getElementById('open-cart');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');

    openCart.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        renderizarCarrito();
    });

    const cerrarCarrito = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    closeCart.addEventListener('click', cerrarCarrito);
    cartOverlay.addEventListener('click', cerrarCarrito);

    // Checkout
    const btnCheckout = document.getElementById('btn-checkout');
    btnCheckout.addEventListener('click', () => {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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

        cerrarCarrito();
        const modalCheckout = new bootstrap.Modal(document.getElementById('modal-checkout'));
        modalCheckout.show();
    });

    // Clear cart
    const btnClearCart = document.getElementById('btn-clear-cart');
    btnClearCart.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            localStorage.removeItem('carrito');
            actualizarBadgeCarrito();
            renderizarCarrito();
        }
    });
});

// Renderizar carrito
const renderizarCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const subtotalAmount = document.getElementById('subtotal-amount');
    const template = document.getElementById('template-cart-item');

    cartItems.innerHTML = '';

    if (carrito.length === 0) {
        cartEmpty.style.display = 'flex';
        subtotalAmount.textContent = '$0';
        return;
    }

    cartEmpty.style.display = 'none';

    let subtotal = 0;

    carrito.forEach(item => {
        const clone = template.content.cloneNode(true);

        clone.querySelector('.cart-item-img').src = item.thumbnailUrl;
        clone.querySelector('.cart-item-title').textContent = item.title;
        clone.querySelector('.item-price').textContent = item.precio;
        clone.querySelector('.cart-item-quantity').textContent = item.cantidad;

        const itemTotal = item.precio * item.cantidad;
        clone.querySelector('.item-total').textContent = itemTotal;
        subtotal += itemTotal;

        // Botones
        clone.querySelector('.btn-cart-increase').addEventListener('click', () => {
            item.cantidad++;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarBadgeCarrito();
            renderizarCarrito();
        });

        clone.querySelector('.btn-cart-decrease').addEventListener('click', () => {
            if (item.cantidad > 1) {
                item.cantidad--;
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarBadgeCarrito();
                renderizarCarrito();
            }
        });

        clone.querySelector('.btn-cart-remove').addEventListener('click', () => {
            const index = carrito.findIndex(i => i.id === item.id);
            carrito.splice(index, 1);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarBadgeCarrito();
            renderizarCarrito();
        });

        cartItems.appendChild(clone);
    });

    subtotalAmount.textContent = `$${subtotal}`;
};
