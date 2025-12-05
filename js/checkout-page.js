// Cart and state
let carrito = [];
let checkoutMode = 'guest'; // 'guest' or 'register'
let appliedCoupon = null;
let shippingCost = 0;

// Postal codes database for Argentina (sample - can be expanded)
const postalCodes = {
    '1000': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1001': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1002': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1425': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1636': { ciudad: 'Olivos', provincia: 'Buenos Aires', zona: 'GBA' },
    '1832': { ciudad: 'Lomas de Zamora', provincia: 'Buenos Aires', zona: 'GBA' },
    '5000': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '2000': { ciudad: 'Rosario', provincia: 'Santa Fe', zona: 'Interior' },
    '4000': { ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán', zona: 'Interior' },
    '3100': { ciudad: 'Paraná', provincia: 'Entre Ríos', zona: 'Interior' }
};

// Shipping costs by zone
const shippingRates = {
    'CABA': 800,
    'GBA': 1200,
    'Interior': 1500
};

// Available coupons
const coupons = {
    'MANGA10': { type: 'percentage', value: 10, description: '10% de descuento' },
    'MANGA20': { type: 'percentage', value: 20, description: '20% de descuento' },
    'PRIMERACOMPRA': { type: 'percentage', value: 15, description: '15% descuento primera compra' },
    'ENVIOGRATIS': { type: 'shipping', value: 0, description: 'Envío gratis' },
    'DESCUENTO500': { type: 'fixed', value: 500, description: '$500 de descuento' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load cart
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        renderOrderSummary();
    } else {
        window.location.href = 'index.html';
    }

    setupModeToggle();
    setupFormValidation();
    setupPostalCodeAutocomplete();
    setupPaymentMethods();
    setupCouponSystem();
    setupRealTimeValidation();
});

// Mode Toggle (Guest vs Register)
const setupModeToggle = () => {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeText = document.getElementById('mode-text');
    const registerFields = document.querySelectorAll('.register-only');
    const passwordField = document.getElementById('password');
    const passwordConfirmField = document.getElementById('password-confirm');

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            checkoutMode = mode;

            // Update active state
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update description
            if (mode === 'guest') {
                modeText.textContent = 'Compra rápida sin necesidad de crear una cuenta';
                registerFields.forEach(field => {
                    field.style.display = 'none';
                    passwordField.removeAttribute('required');
                    passwordConfirmField.removeAttribute('required');
                });
            } else {
                modeText.textContent = 'Crea una cuenta para guardar tus datos y hacer seguimiento de tus pedidos';
                registerFields.forEach(field => {
                    field.style.display = 'block';
                    passwordField.setAttribute('required', 'required');
                    passwordConfirmField.setAttribute('required', 'required');
                });
            }
        });
    });
};

// Postal Code Autocomplete
const setupPostalCodeAutocomplete = () => {
    const cpInput = document.getElementById('cp');
    const provinciaInput = document.getElementById('provincia');
    const ciudadInput = document.getElementById('ciudad');

    cpInput.addEventListener('input', (e) => {
        const cp = e.target.value.trim();

        if (postalCodes[cp]) {
            const location = postalCodes[cp];
            provinciaInput.value = location.provincia;
            ciudadInput.value = location.ciudad;

            // Calculate shipping
            shippingCost = shippingRates[location.zona];
            updateTotals();

            // Show success feedback
            cpInput.classList.add('is-valid');
            cpInput.classList.remove('is-invalid');
        } else if (cp.length >= 4) {
            provinciaInput.value = '';
            ciudadInput.value = '';
            cpInput.classList.add('is-invalid');
            cpInput.classList.remove('is-valid');
        } else {
            provinciaInput.value = '';
            ciudadInput.value = '';
            cpInput.classList.remove('is-valid', 'is-invalid');
        }
    });
};

// Payment Methods
const setupPaymentMethods = () => {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const cardForm = document.getElementById('card-form');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');

    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;

            // Show/hide card form
            if (radio.value === 'tarjeta') {
                cardForm.style.display = 'block';
                cardNumberInput.setAttribute('required', 'required');
                document.getElementById('card-name').setAttribute('required', 'required');
                cardExpiryInput.setAttribute('required', 'required');
                cardCvvInput.setAttribute('required', 'required');
            } else {
                cardForm.style.display = 'none';
                cardNumberInput.removeAttribute('required');
                document.getElementById('card-name').removeAttribute('required');
                cardExpiryInput.removeAttribute('required');
                cardCvvInput.removeAttribute('required');
            }
        });
    });

    // Card number formatting and validation
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;

            // Detect card type
            const visaIcon = document.getElementById('visa-icon');
            const mastercardIcon = document.getElementById('mastercard-icon');

            if (value.startsWith('4')) {
                visaIcon.classList.add('active');
                mastercardIcon.classList.remove('active');
            } else if (value.startsWith('5')) {
                mastercardIcon.classList.add('active');
                visaIcon.classList.remove('active');
            } else {
                visaIcon.classList.remove('active');
                mastercardIcon.classList.remove('active');
            }

            // Validate
            if (value.length === 16) {
                e.target.classList.add('is-valid');
                e.target.classList.remove('is-invalid');
            } else if (value.length > 0) {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
            }
        });
    }

    // Card expiry formatting
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;

            // Validate
            if (value.length === 5) {
                const [month, year] = value.split('/');
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;

                if (parseInt(month) >= 1 && parseInt(month) <= 12 &&
                    (parseInt(year) > currentYear ||
                        (parseInt(year) === currentYear && parseInt(month) >= currentMonth))) {
                    e.target.classList.add('is-valid');
                    e.target.classList.remove('is-invalid');
                } else {
                    e.target.classList.add('is-invalid');
                    e.target.classList.remove('is-valid');
                }
            }
        });
    }

    // CVV validation
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = value;

            if (value.length === 3 || value.length === 4) {
                e.target.classList.add('is-valid');
                e.target.classList.remove('is-invalid');
            } else if (value.length > 0) {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
            }
        });
    }
};

// Coupon System
const setupCouponSystem = () => {
    const applyCouponBtn = document.getElementById('apply-coupon');
    const couponInput = document.getElementById('coupon-code');
    const couponMessage = document.getElementById('coupon-message');

    applyCouponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();

        if (!code) {
            showCouponMessage('Por favor ingresa un código de cupón', 'error');
            return;
        }

        if (coupons[code]) {
            appliedCoupon = { code, ...coupons[code] };
            showCouponMessage(`✓ Cupón aplicado: ${coupons[code].description}`, 'success');
            couponInput.value = '';
            couponInput.disabled = true;
            applyCouponBtn.textContent = 'Aplicado';
            applyCouponBtn.disabled = true;
            updateTotals();
        } else {
            showCouponMessage('Cupón inválido o expirado', 'error');
        }
    });
};

const showCouponMessage = (message, type) => {
    const couponMessage = document.getElementById('coupon-message');
    couponMessage.textContent = message;
    couponMessage.className = `coupon-message ${type}`;
};

// Real-time Validation
const setupRealTimeValidation = () => {
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    const dniInput = document.getElementById('dni');
    const nombreInput = document.getElementById('nombre');

    // Email validation
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInput.value)) {
                emailInput.classList.add('is-valid');
                emailInput.classList.remove('is-invalid');
            } else if (emailInput.value) {
                emailInput.classList.add('is-invalid');
                emailInput.classList.remove('is-valid');
            }
        });
    }

    // Phone validation
    if (telefonoInput) {
        telefonoInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = value;

            if (value.length === 10) {
                e.target.classList.add('is-valid');
                e.target.classList.remove('is-invalid');
            } else if (value.length > 0) {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
            }
        });
    }

    // DNI validation
    if (dniInput) {
        dniInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = value;

            if (value.length >= 7 && value.length <= 8) {
                e.target.classList.add('is-valid');
                e.target.classList.remove('is-invalid');
            } else if (value.length > 0) {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
            }
        });
    }

    // Name validation
    if (nombreInput) {
        nombreInput.addEventListener('blur', () => {
            if (nombreInput.value.trim().length >= 3) {
                nombreInput.classList.add('is-valid');
                nombreInput.classList.remove('is-invalid');
            } else if (nombreInput.value) {
                nombreInput.classList.add('is-invalid');
                nombreInput.classList.remove('is-valid');
            }
        });
    }
};

// Render Order Summary
const renderOrderSummary = () => {
    const orderItems = document.getElementById('order-items');

    if (carrito.length === 0) {
        orderItems.innerHTML = '<p class="text-center text-muted">No hay productos en el carrito</p>';
        return;
    }

    let html = '';
    carrito.forEach(item => {
        html += `
            <div class="order-item">
                <img src="${item.thumbnailUrl}" alt="${item.title}" class="order-item-img">
                <div class="order-item-info">
                    <div class="order-item-title">${item.title}</div>
                    <div class="order-item-quantity">Cantidad: ${item.cantidad}</div>
                    <div class="order-item-price">$${item.precioTotal}</div>
                </div>
            </div>
        `;
    });

    orderItems.innerHTML = html;
    updateTotals();
};

// Update Totals
const updateTotals = () => {
    const subtotal = carrito.reduce((sum, item) => sum + item.precioTotal, 0);
    const subtotalElement = document.getElementById('subtotal-amount');
    const shippingElement = document.getElementById('shipping-amount');
    const discountElement = document.getElementById('discount-amount');
    const discountRow = document.getElementById('discount-row');
    const totalElement = document.getElementById('total-amount');

    subtotalElement.textContent = `$${subtotal}`;

    // Shipping
    if (shippingCost > 0) {
        shippingElement.textContent = `$${shippingCost}`;
    } else {
        shippingElement.textContent = 'Ingresa tu código postal';
    }

    // Discount
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discount = Math.round(subtotal * appliedCoupon.value / 100);
        } else if (appliedCoupon.type === 'fixed') {
            discount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'shipping') {
            shippingCost = 0;
            shippingElement.textContent = 'GRATIS';
        }

        if (discount > 0) {
            discountElement.textContent = `-$${discount}`;
            discountRow.style.display = 'flex';
        }
    } else {
        discountRow.style.display = 'none';
    }

    // Total
    const total = subtotal + shippingCost - discount;
    totalElement.textContent = `$${total}`;
};

// Form Validation and Submission
const setupFormValidation = () => {
    const form = document.getElementById('checkout-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate payment method
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        const paymentError = document.getElementById('payment-error');

        if (!paymentSelected) {
            paymentError.style.display = 'block';
            paymentError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            paymentError.style.display = 'none';
        }

        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');

            // Find first invalid field and scroll to it
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
            return;
        }

        procesarPedido();
    });
};

// Process Order
const procesarPedido = () => {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    const subtotal = carrito.reduce((sum, item) => sum + item.precioTotal, 0);
    const discount = appliedCoupon ? (appliedCoupon.type === 'percentage' ? Math.round(subtotal * appliedCoupon.value / 100) : appliedCoupon.value) : 0;
    const total = subtotal + shippingCost - discount;

    // Show success message
    Toastify({
        text: `¡Pedido confirmado exitosamente!`,
        duration: 3000,
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

    // Simulate processing delay
    setTimeout(() => {
        alert(`¡Gracias por tu compra, ${nombre}!\n\nResumen del pedido:\nTotal: $${total}\nMétodo de pago: ${getPaymentMethodName(paymentMethod)}\n\nRecibirás un email de confirmación en ${email}`);

        // Clear cart and redirect
        localStorage.removeItem('carrito');
        window.location.href = 'index.html';
    }, 1500);
};

const getPaymentMethodName = (method) => {
    const names = {
        'mercadopago': 'MercadoPago',
        'paypal': 'PayPal',
        'tarjeta': 'Tarjeta de Crédito/Débito',
        'transferencia': 'Transferencia Bancaria',
        'efectivo': 'Efectivo contra entrega'
    };
    return names[method] || method;
};
