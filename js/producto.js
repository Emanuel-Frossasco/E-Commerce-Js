let carrito = [];
let currentProduct = null;
let currentQuantity = 1;
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

document.addEventListener("DOMContentLoaded", () => {
    // Load cart from localStorage
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        renderCartSidebar();
        actualizarContadorCarrito();
    }
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    // Load product data
    loadProductData(productId);
    // Setup event listeners
    setupCartListeners();
    setupQuantityControls();
    setupMobileSidebar();
});

const loadProductData = async (productId) => {
    try {
        const res = await fetch("productos.json");
        const data = await res.json();
        const product = data.find(p => p.id === productId);
        if (!product) {
            mostrarNotificacion("Producto no encontrado", "error");
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        currentProduct = product;
        displayProductDetails(product, data);
    } catch (error) {
        console.error(error);
        mostrarNotificacion("Error al cargar el producto", "error");
    }
};

const displayProductDetails = (product, allProducts) => {
    // Update page title and meta tags
    document.title = `${product.title} - Manga Store`;
    updateMetaTags(product);
    document.getElementById('breadcrumb-product').textContent = product.title;
    const mainImage = document.getElementById('main-product-image');
    const images = product.images || [product.thumbnailUrl];
    mainImage.src = images[0];
    mainImage.alt = product.title;
    displayBadges(product);
    displayThumbnailGallery(images);
    document.getElementById('product-title').textContent = product.title;
    const currentPriceValue = document.getElementById('current-price-value-detail');
    currentPriceValue.textContent = product.precio;
    if (product.discount && product.originalPrice) {
        const originalPriceEl = document.getElementById('original-price-detail');
        const originalPriceValue = document.getElementById('original-price-value-detail');
        originalPriceEl.style.display = 'block';
        originalPriceValue.textContent = product.originalPrice;
    }
    displayStockStatus(product);
    const description = product.extendedDescription || product.description || 'Descripción no disponible';
    document.getElementById('product-description').textContent = description;
    displaySpecifications(product);
    setupActionButtons(product);
    setupSocialSharing(product);
    loadRelatedProducts(product, allProducts);
};

const displayBadges = (product) => {
    const badgesContainer = document.getElementById('product-badges-detail');
    badgesContainer.innerHTML = '';
    if (product.isNew) {
        const badgeNew = document.createElement('span');
        badgeNew.className = 'badge-new';
        badgeNew.textContent = 'NUEVO';
        badgesContainer.appendChild(badgeNew);
    }
    if (product.discount) {
        const badgeDiscount = document.createElement('span');
        badgeDiscount.className = 'badge-discount';
        badgeDiscount.textContent = `-${product.discount}%`;
        badgesContainer.appendChild(badgeDiscount);
    }
};

const displayThumbnailGallery = (images) => {
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    thumbnailGallery.innerHTML = '';

    images.forEach((imgUrl, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imgUrl;
        thumbnail.alt = `Imagen ${index + 1}`;
        thumbnail.className = 'thumbnail-image' + (index === 0 ? ' active' : '');
        thumbnail.addEventListener('click', () => {
            document.getElementById('main-product-image').src = imgUrl;
            document.querySelectorAll('.thumbnail-image').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
        thumbnailGallery.appendChild(thumbnail);
    });
};

const displayStockStatus = (product) => {
    const stockStatus = document.getElementById('stock-status');
    const stock = product.stock !== undefined ? product.stock : 10;
    if (stock > 5) {
        stockStatus.innerHTML = '<i class="bx bx-check-circle"></i><span>En stock</span>';
        stockStatus.className = 'stock-status in-stock';
    } else if (stock > 0) {
        stockStatus.innerHTML = `<i class="bx bx-error"></i><span>Solo quedan ${stock} unidades</span>`;
        stockStatus.className = 'stock-status low-stock';
    } else {
        stockStatus.innerHTML = '<i class="bx bx-x-circle"></i><span>Agotado</span>';
        stockStatus.className = 'stock-status out-of-stock';
    }
};

const displaySpecifications = (product) => {
    const specsTbody = document.getElementById('specs-tbody');
    specsTbody.innerHTML = '';
    const specs = product.specifications || {};
    const defaultSpecs = {
        'Editorial': specs.publisher || 'Ivrea',
        'Autor': specs.author || 'N/A',
        'Páginas': specs.pages || '192',
        'Idioma': specs.language || 'Español',
        'ISBN': specs.isbn || 'N/A',
        'Dimensiones': specs.dimensions || '13 x 18 cm'
    };
    Object.entries(defaultSpecs).forEach(([key, value]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="spec-label">${key}</td>
            <td class="spec-value">${value}</td>
        `;
        specsTbody.appendChild(row);
    });
};

const setupQuantityControls = () => {
    const quantityInput = document.getElementById('quantity');
    const btnDecrease = document.getElementById('btn-decrease-quantity');
    const btnIncrease = document.getElementById('btn-increase-quantity');
    btnDecrease.addEventListener('click', () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            quantityInput.value = currentQuantity;
        }
    });
    btnIncrease.addEventListener('click', () => {
        const maxStock = currentProduct?.stock || 10;
        if (currentQuantity < maxStock && currentQuantity < 10) {
            currentQuantity++;
            quantityInput.value = currentQuantity;
        }
    });
};

const setupActionButtons = (product) => {
    const btnAddToCart = document.getElementById('btn-add-to-cart-detail');
    btnAddToCart.addEventListener('click', () => {
        const productoCarrito = {
            id: product.id,
            title: product.title,
            precio: product.precio,
            thumbnailUrl: product.thumbnailUrl,
            cantidad: currentQuantity,
            precioTotal: product.precio * currentQuantity,
        };
        const index = carrito.findIndex((item) => item.id === productoCarrito.id);
        if (index === -1) {
            carrito.push(productoCarrito);
        } else {
            carrito[index].cantidad += currentQuantity;
            carrito[index].precioTotal = carrito[index].cantidad * carrito[index].precio;
        }
        renderCartSidebar();
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarNotificacion(`${currentQuantity} x ${product.title} agregado al carrito`, "success", product.thumbnailUrl);
        // Reset quantity
        currentQuantity = 1;
        document.getElementById('quantity').value = 1;
    });
};

const setupSocialSharing = (product) => {
    const currentUrl = window.location.href;
    const productTitle = encodeURIComponent(product.title);
    const productDescription = encodeURIComponent(product.description || '');
    document.getElementById('share-facebook').addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, '_blank');
    });
    document.getElementById('share-twitter').addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?url=${currentUrl}&text=${productTitle}`, '_blank');
    });
    document.getElementById('share-whatsapp').addEventListener('click', () => {
        window.open(`https://wa.me/?text=${productTitle}%20${currentUrl}`, '_blank');
    });
    document.getElementById('share-link').addEventListener('click', () => {
        navigator.clipboard.writeText(currentUrl).then(() => {
            mostrarNotificacion('Enlace copiado al portapapeles', 'success');
        });
    });
};

const loadRelatedProducts = (product, allProducts) => {
    const relatedContainer = document.getElementById('related-products');
    relatedContainer.innerHTML = '';
    const match = product.title.match(/^(.+?)\s*#\d+/);
    const category = match ? match[1].trim() : null;
    let relatedProducts = [];
    if (product.relatedProducts && product.relatedProducts.length > 0) {
        relatedProducts = allProducts.filter(p => product.relatedProducts.includes(p.id));
    } else if (category) {
        relatedProducts = allProducts.filter(p => {
            const pMatch = p.title.match(/^(.+?)\s*#\d+/);
            const pCategory = pMatch ? pMatch[1].trim() : null;
            return pCategory === category && p.id !== product.id;
        }).slice(0, 4);
    }
    if (relatedProducts.length === 0) {
        relatedProducts = allProducts
            .filter(p => p.id !== product.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
    }
    relatedProducts.forEach(relatedProduct => {
        const productCard = createRelatedProductCard(relatedProduct);
        relatedContainer.appendChild(productCard);
    });
};

const createRelatedProductCard = (product) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-3';
    col.innerHTML = `
        <div class="card">
            <div class="product-badges">
                ${product.isNew ? '<span class="badge-new">NUEVO</span>' : ''}
                ${product.discount ? `<span class="badge-discount">-${product.discount}%</span>` : ''}
            </div>
            <img src="${product.thumbnailUrl}" alt="${product.title}" class="card-img-top" />
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <div class="price-container">
                    ${product.discount && product.originalPrice ?
            `<p class="original-price">$<span class="original-price-value">${product.originalPrice}</span></p>` : ''}
                    <p class="card-text current-price">$ <span class="current-price-value">${product.precio}</span></p>
                </div>
                <div class="card-buttons">
                    <button class="btn btn-dark btn-add-cart" data-id="${product.id}" title="Agregar al carrito">
                        <i class='bx bx-cart-add'></i>
                    </button>
                    <button class="btn btn-view-detail" data-id="${product.id}" title="Ver detalle">
                        <i class='bx bx-show'></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    const btnAddCart = col.querySelector('.btn-add-cart');
    btnAddCart.addEventListener('click', () => {
        const productoCarrito = {
            id: product.id,
            title: product.title,
            precio: product.precio,
            thumbnailUrl: product.thumbnailUrl,
            cantidad: 1,
            precioTotal: product.precio,
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
        mostrarNotificacion(`${product.title} agregado al carrito`, "success", product.thumbnailUrl);
    });
    const btnViewDetail = col.querySelector('.btn-view-detail');
    btnViewDetail.addEventListener('click', () => {
        window.location.href = `producto.html?id=${product.id}`;
    });
    return col;
};

const updateMetaTags = (product) => {
    const description = product.description || 'Compra manga online';
    const imageUrl = product.thumbnailUrl;
    const currentUrl = window.location.href;
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    document.querySelector('meta[property="og:url"]').setAttribute('content', currentUrl);
    document.querySelector('meta[property="og:title"]').setAttribute('content', product.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);
    document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);
    document.querySelector('meta[property="twitter:url"]').setAttribute('content', currentUrl);
    document.querySelector('meta[property="twitter:title"]').setAttribute('content', product.title);
    document.querySelector('meta[property="twitter:description"]').setAttribute('content', description);
    document.querySelector('meta[property="twitter:image"]').setAttribute('content', imageUrl);
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
        window.location.href = 'checkout.html';
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

const setupMobileSidebar = () => {
    const btnHamburger = document.getElementById('btn-hamburger');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileOverlay = document.getElementById('mobile-sidebar-overlay');
    if (!btnHamburger || !mobileSidebar) return;
    btnHamburger.addEventListener('click', () => {
        mobileSidebar.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    btnCloseSidebar.addEventListener('click', closeMobileSidebar);
    mobileOverlay.addEventListener('click', closeMobileSidebar);
};

const closeMobileSidebar = () => {
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileOverlay = document.getElementById('mobile-sidebar-overlay');
    if (mobileSidebar) mobileSidebar.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
};
