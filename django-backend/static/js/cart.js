// Cart Management - Gestión del carrito

const CART_STORAGE_KEY = 'floreria_cart';
const CART_API = `${EXPRESS_API_URL}/cart`;

class Cart {
    constructor() {
        this.items = this.loadFromStorage();
        this.updateCartCount();
    }

    loadFromStorage() {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    saveToStorage() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    }

    addItem(productId, name, price, quantity = 1) {
        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId,
                name,
                price: parseFloat(price),
                quantity,
            });
        }
        
        this.saveToStorage();
        this.updateCartCount();
        this.syncWithServer();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveToStorage();
        this.updateCartCount();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveToStorage();
            this.updateCartCount();
        }
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

// Add to cart function
function addToCart(productId, productName, price, quantity = 1) {
    cart.addItem(productId, productName, price, quantity);
    showToast(`${productName} agregado al carrito`, 'success');
}

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        updateCartSummary();
        return;
    }

    let html = '';
    cart.items.forEach(item => {
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="https://via.placeholder.com/100" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
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
}

function updateCartQty(productId, quantity) {
    quantity = parseInt(quantity);
    if (quantity <= 0) {
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

    const formData = {
        name: document.querySelector('input[name="name"]').value,
        email: document.querySelector('input[name="email"]').value,
        phone: document.querySelector('input[name="phone"]').value,
        address: document.querySelector('input[name="address"]').value,
        city: document.querySelector('input[name="city"]').value,
        postal_code: document.querySelector('input[name="postal_code"]').value,
        payment_method: document.querySelector('input[name="payment_method"]:checked').value,
        items: cart.items,
        total: cart.getTotal(),
    };

    try {
        const response = await expressCall('/orders', {
            method: 'POST',
            body: JSON.stringify(formData),
        });

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
        showToast('Error al crear el pedido', 'error');
    }
}

// Initialize cart display on cart page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/cart/')) {
        displayCartItems();
    }
});
