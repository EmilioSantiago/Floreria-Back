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
