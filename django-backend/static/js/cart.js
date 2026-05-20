// Cart Management - Gestión del carrito

const CART_STORAGE_KEY = 'floreria_cart';
const CART_API = `${EXPRESS_API_URL}/cart`;
const CART_IMAGE_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect width="120" height="120" fill="%23f4ece7"/%3E%3Cpath d="M60 83c17-12 28-25 28-39 0-9-7-16-16-16-5 0-10 3-12 7-2-4-7-7-12-7-9 0-16 7-16 16 0 14 11 27 28 39Z" fill="%23bd3f5e"/%3E%3Ccircle cx="60" cy="54" r="12" fill="%23f2c866"/%3E%3C/svg%3E';

class Cart {
    constructor() {
        this.items = this.loadFromStorage();
        this.normalizeItems();
        this.updateCartCount();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            const items = stored ? JSON.parse(stored) : [];
            return Array.isArray(items) ? items : [];
        } catch (error) {
            console.warn('No se pudo leer el carrito guardado:', error);
            return [];
        }
    }

    saveToStorage() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    }

    normalizeItems() {
        const normalized = [];
        let changed = false;

        this.items.forEach((item) => {
            const productId = Number(item.productId);
            const price = Number(item.price);
            const quantity = Number.parseInt(item.quantity, 10);

            if (
                !Number.isFinite(productId)
                || !Number.isFinite(price)
                || price <= 0
                || !Number.isInteger(quantity)
                || quantity < 1
            ) {
                changed = true;
                return;
            }

            const imageUrl = item.imageUrl || item.display_image || item.image || '';
            const existingItem = normalized.find(currentItem => currentItem.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
                if (imageUrl) {
                    existingItem.imageUrl = imageUrl;
                }
                changed = true;
                return;
            }

            normalized.push({
                productId,
                name: item.name || 'Producto',
                price,
                quantity,
                imageUrl,
            });
        });

        changed = changed || JSON.stringify(normalized) !== JSON.stringify(this.items);

        if (changed) {
            this.items = normalized;
            this.saveToStorage();
        }

        return changed;
    }

    addItem(productId, name, price, quantity = 1, imageUrl = '') {
        const normalizedProductId = Number(productId);
        const normalizedPrice = Number(price);
        const normalizedQuantity = Number.parseInt(quantity, 10);

        if (
            !Number.isFinite(normalizedProductId)
            || !Number.isFinite(normalizedPrice)
            || normalizedPrice <= 0
            || !Number.isInteger(normalizedQuantity)
            || normalizedQuantity < 1
        ) {
            showToast('No se pudo agregar el producto al carrito', 'error');
            return false;
        }

        const existingItem = this.items.find(item => item.productId === normalizedProductId);
        
        if (existingItem) {
            existingItem.quantity += normalizedQuantity;
            if (imageUrl) {
                existingItem.imageUrl = imageUrl;
            }
        } else {
            this.items.push({
                productId: normalizedProductId,
                name,
                price: normalizedPrice,
                quantity: normalizedQuantity,
                imageUrl,
            });
        }
        
        this.saveToStorage();
        this.updateCartCount();
        this.syncWithServer();
        return true;
    }

    removeItem(productId) {
        const normalizedProductId = Number(productId);
        this.items = this.items.filter(item => item.productId !== normalizedProductId);
        this.saveToStorage();
        this.updateCartCount();
    }

    updateQuantity(productId, quantity) {
        const normalizedProductId = Number(productId);
        const normalizedQuantity = Number.parseInt(quantity, 10);
        if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
            return false;
        }

        const item = this.items.find(item => item.productId === normalizedProductId);
        if (item) {
            item.quantity = normalizedQuantity;
            this.saveToStorage();
            this.updateCartCount();
            return true;
        }

        return false;
    }

    getCheckoutItems() {
        this.normalizeItems();
        return this.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
        }));
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const shipping = this.items.length > 0 ? 10 : 0; // $10 shipping
        const tax = subtotal * 0.21; // 21% IVA
        return subtotal + shipping + tax;
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = count;
        }
    }

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartCount();
    }

    async syncWithServer() {
        try {
            // Sync cart with Express backend
            if (this.items.length > 0) {
                // This would be implemented when Express backend is ready
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        }
    }
}

// Global cart instance
const cart = new Cart();

const DEFAULT_DELIVERY_CENTER = { lat: 17.0732, lng: -96.7266 };
let deliveryMap;
let deliveryMarker;
let deliveryGeocoder;
let deliveryAutocomplete;
let deliveryMapReady = false;
let deliveryMapInitialized = false;

window.gm_authFailure = function gmAuthFailure() {
    setDeliveryLocationStatus('No se pudo validar la API key de Google Maps.', 'error');
};

window.initCheckoutMap = function initCheckoutMap() {
    deliveryMapReady = true;
    ensureDeliveryMap();
};

function getDeliveryFields() {
    return {
        address: document.querySelector('input[name="address"]'),
        city: document.querySelector('input[name="city"]'),
        postalCode: document.querySelector('input[name="postal_code"]'),
        latitude: document.querySelector('input[name="delivery_latitude"]'),
        longitude: document.querySelector('input[name="delivery_longitude"]'),
        search: document.getElementById('delivery-location-search'),
        status: document.getElementById('delivery-location-status'),
    };
}

function setDeliveryLocationStatus(message, type = 'info') {
    const status = document.getElementById('delivery-location-status');
    if (!status) return;

    status.textContent = message;
    status.className = `delivery-location-status ${type}`;
}

function getAddressComponent(components, type, useShortName = false) {
    const component = components.find(item => item.types.includes(type));
    if (!component) return '';
    return useShortName ? component.short_name : component.long_name;
}

function parseGoogleAddress(addressComponents = []) {
    const streetNumber = getAddressComponent(addressComponents, 'street_number');
    const route = getAddressComponent(addressComponents, 'route');
    const neighborhood = getAddressComponent(addressComponents, 'neighborhood')
        || getAddressComponent(addressComponents, 'sublocality_level_1')
        || getAddressComponent(addressComponents, 'sublocality');
    const city = getAddressComponent(addressComponents, 'locality')
        || getAddressComponent(addressComponents, 'administrative_area_level_2')
        || getAddressComponent(addressComponents, 'administrative_area_level_1');
    const postalCode = getAddressComponent(addressComponents, 'postal_code');
    const street = [route, streetNumber].filter(Boolean).join(' ');

    return {
        address: [street, neighborhood].filter(Boolean).join(', '),
        city,
        postalCode,
    };
}

function fillDeliveryAddressFromResult(result) {
    const fields = getDeliveryFields();
    const parsed = parseGoogleAddress(result.address_components || []);
    const fallbackAddress = result.formatted_address || '';

    if (fields.address) {
        fields.address.value = parsed.address || fallbackAddress;
    }

    if (fields.city && parsed.city) {
        fields.city.value = parsed.city;
    }

    if (fields.postalCode && parsed.postalCode) {
        fields.postalCode.value = parsed.postalCode;
    }

    if (fields.search && fallbackAddress) {
        fields.search.value = fallbackAddress;
    }
}

function setDeliveryCoordinates(latLng) {
    const fields = getDeliveryFields();
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;

    if (fields.latitude) fields.latitude.value = lat.toFixed(7);
    if (fields.longitude) fields.longitude.value = lng.toFixed(7);
}

async function reverseGeocodeDeliveryLocation(latLng) {
    if (!deliveryGeocoder) return;

    setDeliveryLocationStatus('Buscando direccion...', 'info');

    try {
        const response = await deliveryGeocoder.geocode({
            location: latLng,
            region: 'mx',
        });
        const result = response.results?.[0];
        if (!result) {
            setDeliveryLocationStatus('No encontramos una direccion para este punto.', 'warning');
            return;
        }

        fillDeliveryAddressFromResult(result);
        setDeliveryLocationStatus('Direccion agregada al pedido.', 'success');
    } catch (error) {
        console.error('Google Maps geocoding error:', error);
        setDeliveryLocationStatus('No se pudo obtener la direccion. Puedes escribirla manualmente.', 'error');
    }
}

function selectDeliveryLocation(latLng, geocodeResult = null) {
    if (!deliveryMap || !deliveryMarker) return;

    deliveryMarker.setPosition(latLng);
    deliveryMap.panTo(latLng);
    setDeliveryCoordinates(latLng);

    if (geocodeResult) {
        fillDeliveryAddressFromResult(geocodeResult);
        setDeliveryLocationStatus('Direccion agregada al pedido.', 'success');
        return;
    }

    reverseGeocodeDeliveryLocation(latLng);
}

function ensureDeliveryMap() {
    const mapEl = document.getElementById('delivery-map');
    if (!mapEl) return false;

    if (window.GOOGLE_MAPS_DISABLED) {
        setDeliveryLocationStatus('Google Maps no tiene API key configurada.', 'error');
        return false;
    }

    if (!deliveryMapReady || !window.google?.maps) {
        setDeliveryLocationStatus('Cargando Google Maps...', 'info');
        return false;
    }

    if (deliveryMapInitialized) {
        google.maps.event.trigger(deliveryMap, 'resize');
        deliveryMap.setCenter(deliveryMarker.getPosition() || DEFAULT_DELIVERY_CENTER);
        return true;
    }

    deliveryGeocoder = new google.maps.Geocoder();
    deliveryMap = new google.maps.Map(mapEl, {
        center: DEFAULT_DELIVERY_CENTER,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });
    deliveryMarker = new google.maps.Marker({
        position: DEFAULT_DELIVERY_CENTER,
        map: deliveryMap,
        draggable: true,
        title: 'Ubicacion de entrega',
    });

    deliveryMap.addListener('click', (event) => {
        selectDeliveryLocation(event.latLng);
    });

    deliveryMarker.addListener('dragend', (event) => {
        selectDeliveryLocation(event.latLng);
    });

    const fields = getDeliveryFields();
    if (fields.search && google.maps.places?.Autocomplete) {
        deliveryAutocomplete = new google.maps.places.Autocomplete(fields.search, {
            componentRestrictions: { country: 'mx' },
            fields: ['address_components', 'formatted_address', 'geometry'],
        });
        deliveryAutocomplete.bindTo('bounds', deliveryMap);
        deliveryAutocomplete.addListener('place_changed', () => {
            const place = deliveryAutocomplete.getPlace();
            if (!place.geometry?.location) {
                setDeliveryLocationStatus('Selecciona una direccion de la lista.', 'warning');
                return;
            }

            if (place.geometry.viewport) {
                deliveryMap.fitBounds(place.geometry.viewport);
            } else {
                deliveryMap.setZoom(16);
            }

            selectDeliveryLocation(place.geometry.location, place);
        });
    }

    const currentLocationButton = document.getElementById('use-current-location');
    if (currentLocationButton) {
        currentLocationButton.addEventListener('click', () => {
            if (!navigator.geolocation) {
                setDeliveryLocationStatus('Tu navegador no permite obtener ubicacion.', 'error');
                return;
            }

            currentLocationButton.disabled = true;
            setDeliveryLocationStatus('Obteniendo ubicacion...', 'info');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latLng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    deliveryMap.setZoom(17);
                    selectDeliveryLocation(latLng);
                    currentLocationButton.disabled = false;
                },
                () => {
                    setDeliveryLocationStatus('No se pudo usar la ubicacion actual.', 'error');
                    currentLocationButton.disabled = false;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000,
                },
            );
        });
    }

    deliveryMapInitialized = true;
    setDeliveryCoordinates(DEFAULT_DELIVERY_CENTER);
    setDeliveryLocationStatus('Selecciona un punto en el mapa.', 'info');
    return true;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[character]));
}

function getCartItemImage(item) {
    return item.imageUrl || item.display_image || item.image || CART_IMAGE_FALLBACK;
}

async function hydrateCartImages() {
    const itemsWithoutImages = cart.items.filter(item => !item.imageUrl);
    if (itemsWithoutImages.length === 0 || typeof getProduct !== 'function') {
        return false;
    }

    let updated = false;
    await Promise.all(itemsWithoutImages.map(async (item) => {
        try {
            const product = await getProduct(item.productId);
            const imageUrl = product.display_image || product.image_url || product.image || '';
            if (imageUrl) {
                item.imageUrl = imageUrl;
                updated = true;
            }
        } catch (error) {
            console.warn(`No se pudo cargar la imagen del producto ${item.productId}:`, error);
        }
    }));

    if (updated) {
        cart.saveToStorage();
    }

    return updated;
}

// Add to cart function
function addToCart(productId, productName, price, quantity = 1, imageUrl = '') {
    if (cart.addItem(productId, productName, price, quantity, imageUrl)) {
        showToast(`${productName} agregado al carrito`, 'success');
    }
}

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cart.normalizeItems();
    
    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        updateCartSummary();
        return;
    }

    let html = '';
    cart.items.forEach(item => {
        const itemName = escapeHtml(item.name);
        const imageUrl = escapeHtml(getCartItemImage(item));
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imageUrl}" alt="${itemName}" onerror="this.onerror=null; this.src='${CART_IMAGE_FALLBACK}'">
                </div>
                <div class="cart-item-details">
                    <h3>${itemName}</h3>
                    <p>Precio: $${item.price.toFixed(2)}</p>
                    <div class="cart-item-qty">
                        <button onclick="updateCartQty(${item.productId}, ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateCartQty(${item.productId}, this.value)">
                        <button onclick="updateCartQty(${item.productId}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.productId})">Eliminar</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    updateCartSummary();

    hydrateCartImages().then((updated) => {
        if (updated) {
            displayCartItems();
        }
    });
}

function updateCartQty(productId, quantity) {
    quantity = Number.parseInt(quantity, 10);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        removeFromCart(productId);
    } else {
        cart.updateQuantity(productId, quantity);
        displayCartItems();
    }
}

function removeFromCart(productId) {
    cart.removeItem(productId);
    displayCartItems();
    showToast('Producto eliminado del carrito', 'info');
}

function updateCartSummary() {
    const subtotal = cart.getSubtotal();
    const shipping = cart.items.length > 0 ? 10 : 0;
    const tax = subtotal * 0.21;
    const total = cart.getTotal();

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxesEl = document.getElementById('taxes');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
    if (taxesEl) taxesEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Checkout functions
function proceedToCheckout() {
    cart.normalizeItems();
    displayCartItems();

    if (cart.items.length === 0) {
        showToast('Tu carrito está vacío', 'error');
        return;
    }
    document.getElementById('checkout-modal').style.display = 'flex';
    ensureDeliveryMap();
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

async function submitCheckout(event) {
    event.preventDefault();
    const checkoutItems = cart.getCheckoutItems();

    if (checkoutItems.length === 0) {
        displayCartItems();
        showToast('Tu carrito esta vacio', 'error');
        return;
    }

    const formData = {
        name: document.querySelector('input[name="name"]').value,
        email: document.querySelector('input[name="email"]').value,
        phone: document.querySelector('input[name="phone"]').value,
        address: document.querySelector('input[name="address"]').value,
        city: document.querySelector('input[name="city"]').value,
        postal_code: document.querySelector('input[name="postal_code"]').value,
        delivery_latitude: document.querySelector('input[name="delivery_latitude"]')?.value || null,
        delivery_longitude: document.querySelector('input[name="delivery_longitude"]')?.value || null,
        payment_method: document.querySelector('input[name="payment_method"]:checked').value,
        items: checkoutItems,
        total: cart.getTotal(),
    };

    try {
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Procesando...';
        }

        const response = await expressCall('/orders', {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        if (response.checkout_url) {
            showToast('Redirigiendo a Mercado Pago...', 'info');
            window.location.href = response.checkout_url;
            return;
        }

        if (response.id) {
            cart.clear();
            closeCheckoutModal();
            showToast('¡Pedido creado exitosamente!', 'success');
            // Redirect to confirmation page after 2 seconds
            setTimeout(() => {
                redirectTo(`/order-confirmation/?orderId=${response.id}`);
            }, 2000);
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showToast(error.message || 'Error al crear el pedido', 'error');
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirmar Pedido';
        }
    }
}

// Initialize cart display on cart page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/cart/')) {
        displayCartItems();
    }
});
