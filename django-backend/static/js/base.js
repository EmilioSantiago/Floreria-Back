// Base JavaScript - Scripts globales

document.addEventListener('DOMContentLoaded', () => {
    // Update cart count on page load
    const cart = JSON.parse(localStorage.getItem('floreria_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
    }
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('checkout-modal');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
});
