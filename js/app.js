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
});

const fetchData = async () => {
    try {
        const res = await fetch("productos.json");
        const data = await res.json();
        todosLosProductos = data;
        productosFiltrados = data;
        const categorias = extraerCategorias(data);
        pintarFiltros(categorias);
        pintarProductos(data);
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
};

searchInput.addEventListener('input', (e) => {
    busquedaActual = e.target.value.toLowerCase();
    aplicarFiltros();
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
    data.forEach((producto) => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("img").setAttribute("src", producto.thumbnailUrl);
        clone.querySelector("h5").textContent = producto.title;
        clone.querySelector(".card-text span").textContent = producto.precio;
        clone.querySelector("button").setAttribute("data-id", producto.id);
        fragment.appendChild(clone);
    });

    listaProductos.appendChild(fragment);
};

const eventoBotones = (data) => {
    const btnAgregar = document.querySelectorAll(".btn-dark");
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
            mostrarNotificacion(`${producto.title} agregado al carrito`, "success");
            openCartSidebar();
        });
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
    const nProductos = carrito.reduce((total, item) => total + item.cantidad, 0);
    const nPrecio = carrito.reduce((total, item) => total + item.precioTotal, 0);
    const resumenCompra = document.querySelector('#resumen-compra');
    resumenCompra.innerHTML = `
        <p><strong>Total de productos:</strong> ${nProductos}</p>
        <p><strong>Total a pagar:</strong> $${nPrecio}</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById('modal-compra'));
    modal.show();
    const btnConfirmar = document.querySelector('#confirmar-compra');
    btnConfirmar.onclick = () => {
        carrito = [];
        renderCartSidebar();
        guardarCarrito();
        actualizarContadorCarrito();
        modal.hide();
        mostrarNotificacion("¡Compra realizada con éxito!", "success");
    };
};

const mostrarNotificacion = (mensaje, tipo = "success") => {
    const colores = {
        success: "linear-gradient(to right, #00b09b, #96c93d)",
        error: "linear-gradient(to right, #ff5f6d, #ffc371)",
        info: "linear-gradient(to right, #4facfe, #00f2fe)"
    };
    Toastify({
        text: mensaje,
        duration: 2500,
        position: "right",
        style: { background: colores[tipo] || colores.success },
    }).showToast();
};