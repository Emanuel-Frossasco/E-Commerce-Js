// Cart and state
let carrito = [];
let checkoutMode = 'guest'; // 'guest' or 'register'
let appliedCoupon = null;
let shippingCost = 0;

// Postal codes database for Argentina (sample - can be expanded)
const postalCodes = {
    // CABA
    '1000': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1001': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1002': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1003': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1004': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1005': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1006': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1007': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1008': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1009': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1010': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1011': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1012': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1013': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1014': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1015': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1020': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1025': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1028': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1029': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1030': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1406': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1407': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1408': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1409': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1414': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1416': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1417': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1419': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1425': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1426': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1427': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1428': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },
    '1429': { ciudad: 'Buenos Aires', provincia: 'CABA', zona: 'CABA' },

    // GBA - Buenos Aires
    '1602': { ciudad: 'Florida', provincia: 'Buenos Aires', zona: 'GBA' },
    '1603': { ciudad: 'Villa Martelli', provincia: 'Buenos Aires', zona: 'GBA' },
    '1605': { ciudad: 'Munro', provincia: 'Buenos Aires', zona: 'GBA' },
    '1606': { ciudad: 'Carapachay', provincia: 'Buenos Aires', zona: 'GBA' },
    '1607': { ciudad: 'Villa Adelina', provincia: 'Buenos Aires', zona: 'GBA' },
    '1636': { ciudad: 'Olivos', provincia: 'Buenos Aires', zona: 'GBA' },
    '1638': { ciudad: 'Vicente López', provincia: 'Buenos Aires', zona: 'GBA' },
    '1640': { ciudad: 'Martínez', provincia: 'Buenos Aires', zona: 'GBA' },
    '1642': { ciudad: 'San Isidro', provincia: 'Buenos Aires', zona: 'GBA' },
    '1644': { ciudad: 'Victoria', provincia: 'Buenos Aires', zona: 'GBA' },
    '1646': { ciudad: 'San Fernando', provincia: 'Buenos Aires', zona: 'GBA' },
    '1648': { ciudad: 'Tigre', provincia: 'Buenos Aires', zona: 'GBA' },
    '1650': { ciudad: 'San Martín', provincia: 'Buenos Aires', zona: 'GBA' },
    '1663': { ciudad: 'San Miguel', provincia: 'Buenos Aires', zona: 'GBA' },
    '1704': { ciudad: 'Ramos Mejía', provincia: 'Buenos Aires', zona: 'GBA' },
    '1706': { ciudad: 'Haedo', provincia: 'Buenos Aires', zona: 'GBA' },
    '1708': { ciudad: 'Morón', provincia: 'Buenos Aires', zona: 'GBA' },
    '1712': { ciudad: 'Castelar', provincia: 'Buenos Aires', zona: 'GBA' },
    '1714': { ciudad: 'Ituzaingó', provincia: 'Buenos Aires', zona: 'GBA' },
    '1722': { ciudad: 'Merlo', provincia: 'Buenos Aires', zona: 'GBA' },
    '1744': { ciudad: 'Moreno', provincia: 'Buenos Aires', zona: 'GBA' },
    '1754': { ciudad: 'San Justo', provincia: 'Buenos Aires', zona: 'GBA' },
    '1757': { ciudad: 'Gregorio de Laferrere', provincia: 'Buenos Aires', zona: 'GBA' },
    '1759': { ciudad: 'González Catán', provincia: 'Buenos Aires', zona: 'GBA' },
    '1763': { ciudad: 'Isidro Casanova', provincia: 'Buenos Aires', zona: 'GBA' },
    '1804': { ciudad: 'Ezeiza', provincia: 'Buenos Aires', zona: 'GBA' },
    '1812': { ciudad: 'Canning', provincia: 'Buenos Aires', zona: 'GBA' },
    '1814': { ciudad: 'Tristán Suárez', provincia: 'Buenos Aires', zona: 'GBA' },
    '1822': { ciudad: 'Ezpeleta', provincia: 'Buenos Aires', zona: 'GBA' },
    '1824': { ciudad: 'Lanús', provincia: 'Buenos Aires', zona: 'GBA' },
    '1826': { ciudad: 'Remedios de Escalada', provincia: 'Buenos Aires', zona: 'GBA' },
    '1828': { ciudad: 'Banfield', provincia: 'Buenos Aires', zona: 'GBA' },
    '1832': { ciudad: 'Lomas de Zamora', provincia: 'Buenos Aires', zona: 'GBA' },
    '1834': { ciudad: 'Temperley', provincia: 'Buenos Aires', zona: 'GBA' },
    '1836': { ciudad: 'Llavallol', provincia: 'Buenos Aires', zona: 'GBA' },
    '1838': { ciudad: 'Turdera', provincia: 'Buenos Aires', zona: 'GBA' },
    '1842': { ciudad: 'Monte Grande', provincia: 'Buenos Aires', zona: 'GBA' },
    '1846': { ciudad: 'Adrogué', provincia: 'Buenos Aires', zona: 'GBA' },
    '1852': { ciudad: 'Burzaco', provincia: 'Buenos Aires', zona: 'GBA' },
    '1854': { ciudad: 'Longchamps', provincia: 'Buenos Aires', zona: 'GBA' },
    '1870': { ciudad: 'Avellaneda', provincia: 'Buenos Aires', zona: 'GBA' },
    '1872': { ciudad: 'Sarandí', provincia: 'Buenos Aires', zona: 'GBA' },
    '1874': { ciudad: 'Villa Dominico', provincia: 'Buenos Aires', zona: 'GBA' },
    '1876': { ciudad: 'Bernal', provincia: 'Buenos Aires', zona: 'GBA' },
    '1878': { ciudad: 'Quilmes', provincia: 'Buenos Aires', zona: 'GBA' },
    '1880': { ciudad: 'Berazategui', provincia: 'Buenos Aires', zona: 'GBA' },
    '1882': { ciudad: 'Florencio Varela', provincia: 'Buenos Aires', zona: 'GBA' },
    '1884': { ciudad: 'Bosques', provincia: 'Buenos Aires', zona: 'GBA' },
    '1886': { ciudad: 'Ranelagh', provincia: 'Buenos Aires', zona: 'GBA' },
    '1888': { ciudad: 'Sourigues', provincia: 'Buenos Aires', zona: 'GBA' },

    // Córdoba
    '5000': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5001': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5002': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5003': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5004': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5005': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5006': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5007': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5008': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5009': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5010': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5011': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5012': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5013': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5014': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5016': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5017': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5018': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5019': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5020': { ciudad: 'Córdoba', provincia: 'Córdoba', zona: 'Interior' },
    '5101': { ciudad: 'Malagueño', provincia: 'Córdoba', zona: 'Interior' },
    '5103': { ciudad: 'Despeñaderos', provincia: 'Córdoba', zona: 'Interior' },
    '5105': { ciudad: 'Alta Gracia', provincia: 'Córdoba', zona: 'Interior' },
    '5107': { ciudad: 'Anisacate', provincia: 'Córdoba', zona: 'Interior' },
    '5109': { ciudad: 'La Falda', provincia: 'Córdoba', zona: 'Interior' },
    '5111': { ciudad: 'Huerta Grande', provincia: 'Córdoba', zona: 'Interior' },
    '5152': { ciudad: 'Villa Carlos Paz', provincia: 'Córdoba', zona: 'Interior' },
    '5153': { ciudad: 'Tanti', provincia: 'Córdoba', zona: 'Interior' },
    '5155': { ciudad: 'Cosquín', provincia: 'Córdoba', zona: 'Interior' },
    '5158': { ciudad: 'Valle Hermoso', provincia: 'Córdoba', zona: 'Interior' },
    '5168': { ciudad: 'Villa General Belgrano', provincia: 'Córdoba', zona: 'Interior' },
    '5172': { ciudad: 'Santa Rosa de Calamuchita', provincia: 'Córdoba', zona: 'Interior' },
    '5174': { ciudad: 'Embalse', provincia: 'Córdoba', zona: 'Interior' },
    '5176': { ciudad: 'Villa Rumipal', provincia: 'Córdoba', zona: 'Interior' },
    '5178': { ciudad: 'Santa Rosa de Río Primero', provincia: 'Córdoba', zona: 'Interior' },
    '5189': { ciudad: 'Jesús María', provincia: 'Córdoba', zona: 'Interior' },
    '5194': { ciudad: 'Colonia Caroya', provincia: 'Córdoba', zona: 'Interior' },
    '5200': { ciudad: 'Villa María', provincia: 'Córdoba', zona: 'Interior' },
    '5220': { ciudad: 'Bell Ville', provincia: 'Córdoba', zona: 'Interior' },
    '5282': { ciudad: 'Río Cuarto', provincia: 'Córdoba', zona: 'Interior' },

    // Santa Fe
    '2000': { ciudad: 'Rosario', provincia: 'Santa Fe', zona: 'Interior' },
    '2001': { ciudad: 'Rosario', provincia: 'Santa Fe', zona: 'Interior' },
    '2002': { ciudad: 'Rosario', provincia: 'Santa Fe', zona: 'Interior' },
    '2003': { ciudad: 'Rosario', provincia: 'Santa Fe', zona: 'Interior' },
    '2004': { ciudad: 'Rosario', provincia: 'Santa Fe', zona: 'Interior' },
    '2124': { ciudad: 'Villa Gobernador Gálvez', provincia: 'Santa Fe', zona: 'Interior' },
    '2126': { ciudad: 'Pérez', provincia: 'Santa Fe', zona: 'Interior' },
    '2128': { ciudad: 'Soldini', provincia: 'Santa Fe', zona: 'Interior' },
    '2132': { ciudad: 'Funes', provincia: 'Santa Fe', zona: 'Interior' },
    '2134': { ciudad: 'Roldán', provincia: 'Santa Fe', zona: 'Interior' },
    '2136': { ciudad: 'Fray Luis Beltrán', provincia: 'Santa Fe', zona: 'Interior' },
    '2138': { ciudad: 'Capitán Bermúdez', provincia: 'Santa Fe', zona: 'Interior' },
    '2142': { ciudad: 'Granadero Baigorria', provincia: 'Santa Fe', zona: 'Interior' },
    '2144': { ciudad: 'San Lorenzo', provincia: 'Santa Fe', zona: 'Interior' },
    '2146': { ciudad: 'Puerto General San Martín', provincia: 'Santa Fe', zona: 'Interior' },
    '2200': { ciudad: 'San Lorenzo', provincia: 'Santa Fe', zona: 'Interior' },
    '2300': { ciudad: 'Rafaela', provincia: 'Santa Fe', zona: 'Interior' },
    '2400': { ciudad: 'San Francisco', provincia: 'Santa Fe', zona: 'Interior' },
    '3000': { ciudad: 'Santa Fe', provincia: 'Santa Fe', zona: 'Interior' },
    '3001': { ciudad: 'Santa Fe', provincia: 'Santa Fe', zona: 'Interior' },
    '3002': { ciudad: 'Santa Fe', provincia: 'Santa Fe', zona: 'Interior' },
    '3003': { ciudad: 'Santa Fe', provincia: 'Santa Fe', zona: 'Interior' },
    '3004': { ciudad: 'Santa Fe', provincia: 'Santa Fe', zona: 'Interior' },
    '3005': { ciudad: 'Santa Fe', provincia: 'Santa Fe', zona: 'Interior' },
    '3006': { ciudad: 'Santa Fe', provincia: 'Santa Fe', zona: 'Interior' },

    // Mendoza
    '5500': { ciudad: 'Mendoza', provincia: 'Mendoza', zona: 'Interior' },
    '5501': { ciudad: 'Mendoza', provincia: 'Mendoza', zona: 'Interior' },
    '5502': { ciudad: 'Mendoza', provincia: 'Mendoza', zona: 'Interior' },
    '5503': { ciudad: 'Mendoza', provincia: 'Mendoza', zona: 'Interior' },
    '5504': { ciudad: 'Mendoza', provincia: 'Mendoza', zona: 'Interior' },
    '5505': { ciudad: 'Mendoza', provincia: 'Mendoza', zona: 'Interior' },
    '5507': { ciudad: 'Luján de Cuyo', provincia: 'Mendoza', zona: 'Interior' },
    '5509': { ciudad: 'Maipú', provincia: 'Mendoza', zona: 'Interior' },
    '5511': { ciudad: 'Guaymallén', provincia: 'Mendoza', zona: 'Interior' },
    '5513': { ciudad: 'Godoy Cruz', provincia: 'Mendoza', zona: 'Interior' },
    '5515': { ciudad: 'Las Heras', provincia: 'Mendoza', zona: 'Interior' },
    '5517': { ciudad: 'San Martín', provincia: 'Mendoza', zona: 'Interior' },
    '5519': { ciudad: 'Rivadavia', provincia: 'Mendoza', zona: 'Interior' },
    '5521': { ciudad: 'Junín', provincia: 'Mendoza', zona: 'Interior' },
    '5549': { ciudad: 'San Rafael', provincia: 'Mendoza', zona: 'Interior' },
    '5600': { ciudad: 'San Rafael', provincia: 'Mendoza', zona: 'Interior' },

    // Tucumán
    '4000': { ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán', zona: 'Interior' },
    '4001': { ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán', zona: 'Interior' },
    '4002': { ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán', zona: 'Interior' },
    '4003': { ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán', zona: 'Interior' },
    '4101': { ciudad: 'Yerba Buena', provincia: 'Tucumán', zona: 'Interior' },
    '4103': { ciudad: 'Tafí Viejo', provincia: 'Tucumán', zona: 'Interior' },
    '4105': { ciudad: 'Banda del Río Salí', provincia: 'Tucumán', zona: 'Interior' },
    '4107': { ciudad: 'Alderetes', provincia: 'Tucumán', zona: 'Interior' },
    '4109': { ciudad: 'Las Talitas', provincia: 'Tucumán', zona: 'Interior' },
    '4111': { ciudad: 'Famaillá', provincia: 'Tucumán', zona: 'Interior' },
    '4113': { ciudad: 'Monteros', provincia: 'Tucumán', zona: 'Interior' },
    '4115': { ciudad: 'Concepción', provincia: 'Tucumán', zona: 'Interior' },
    '4117': { ciudad: 'Aguilares', provincia: 'Tucumán', zona: 'Interior' },

    // Entre Ríos
    '3100': { ciudad: 'Paraná', provincia: 'Entre Ríos', zona: 'Interior' },
    '3101': { ciudad: 'Paraná', provincia: 'Entre Ríos', zona: 'Interior' },
    '3102': { ciudad: 'Paraná', provincia: 'Entre Ríos', zona: 'Interior' },
    '3103': { ciudad: 'Paraná', provincia: 'Entre Ríos', zona: 'Interior' },
    '3200': { ciudad: 'Concordia', provincia: 'Entre Ríos', zona: 'Interior' },
    '3260': { ciudad: 'Concepción del Uruguay', provincia: 'Entre Ríos', zona: 'Interior' },
    '3280': { ciudad: 'Colón', provincia: 'Entre Ríos', zona: 'Interior' },
    '3300': { ciudad: 'Gualeguaychú', provincia: 'Entre Ríos', zona: 'Interior' },

    // Salta
    '4400': { ciudad: 'Salta', provincia: 'Salta', zona: 'Interior' },
    '4401': { ciudad: 'Salta', provincia: 'Salta', zona: 'Interior' },
    '4402': { ciudad: 'Salta', provincia: 'Salta', zona: 'Interior' },
    '4403': { ciudad: 'Salta', provincia: 'Salta', zona: 'Interior' },
    '4405': { ciudad: 'Cerrillos', provincia: 'Salta', zona: 'Interior' },
    '4407': { ciudad: 'La Caldera', provincia: 'Salta', zona: 'Interior' },

    // Neuquén
    '8300': { ciudad: 'Neuquén', provincia: 'Neuquén', zona: 'Interior' },
    '8301': { ciudad: 'Neuquén', provincia: 'Neuquén', zona: 'Interior' },
    '8302': { ciudad: 'Neuquén', provincia: 'Neuquén', zona: 'Interior' },
    '8303': { ciudad: 'Neuquén', provincia: 'Neuquén', zona: 'Interior' },
    '8324': { ciudad: 'Centenario', provincia: 'Neuquén', zona: 'Interior' },
    '8326': { ciudad: 'Plottier', provincia: 'Neuquén', zona: 'Interior' },

    // Chubut
    '9000': { ciudad: 'Comodoro Rivadavia', provincia: 'Chubut', zona: 'Interior' },
    '9100': { ciudad: 'Trelew', provincia: 'Chubut', zona: 'Interior' },
    '9103': { ciudad: 'Rawson', provincia: 'Chubut', zona: 'Interior' },
    '9120': { ciudad: 'Puerto Madryn', provincia: 'Chubut', zona: 'Interior' },

    // Misiones
    '3300': { ciudad: 'Posadas', provincia: 'Misiones', zona: 'Interior' },
    '3301': { ciudad: 'Posadas', provincia: 'Misiones', zona: 'Interior' },
    '3302': { ciudad: 'Posadas', provincia: 'Misiones', zona: 'Interior' },
    '3370': { ciudad: 'Puerto Iguazú', provincia: 'Misiones', zona: 'Interior' },
    '3380': { ciudad: 'Eldorado', provincia: 'Misiones', zona: 'Interior' },

    // La Pampa
    '6300': { ciudad: 'Santa Rosa', provincia: 'La Pampa', zona: 'Interior' },
    '6301': { ciudad: 'Santa Rosa', provincia: 'La Pampa', zona: 'Interior' },
    '6302': { ciudad: 'Santa Rosa', provincia: 'La Pampa', zona: 'Interior' },
    '6360': { ciudad: 'General Pico', provincia: 'La Pampa', zona: 'Interior' }
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
