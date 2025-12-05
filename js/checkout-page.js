let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        renderOrderSummary();
    } else {
        window.location.href = 'index.html';
    }

    setupFormValidation();
});
// Renderizar resumen del pedido
const renderOrderSummary = () => {
    const orderItems = document.getElementById('order-items');
    const totalAmount = document.getElementById('total-amount');
    if (carrito.length === 0) {
        orderItems.innerHTML = '<p class="text-center text-muted">No hay productos en el carrito</p>';
        totalAmount.textContent = '$0';
        return;
    }
    let html = '';
    let total = 0;
    carrito.forEach(item => {
        html += `
            <div class="summary-item">
                <div>
                    <strong>${item.title}</strong>
                    <br>
                    <small class="text-muted">Cantidad: ${item.cantidad}</small>
                </div>
                <div class="text-end">
                    <strong style="color: #43ed00;">$${item.precioTotal}</strong>
                </div>
            </div>
        `;
        total += item.precioTotal;
    });
    orderItems.innerHTML = html;
    totalAmount.textContent = `$${total}`;
};
// Validación del formulario
const setupFormValidation = () => {
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Validar método de pago
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        const paymentError = document.getElementById('payment-error');
        if (!paymentSelected) {
            paymentError.style.display = 'block';
            return;
        } else {
            paymentError.style.display = 'none';
        }
        // Validar formulario
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        procesarPedido();
    });
};
// Procesar pedido
const procesarPedido = () => {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const total = carrito.reduce((sum, item) => sum + item.precioTotal, 0);
    // Simular procesamiento
    alert(`¡Pedido confirmado!\n\nGracias ${nombre}!\nTotal: $${total}\n\nRecibirás un email de confirmación en ${email}`);
    localStorage.removeItem('carrito');
    window.location.href = 'index.html';
};
