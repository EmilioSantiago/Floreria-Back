// API Client - Manejo de peticiones HTTP
const API_BASE_URL = window.location.origin + '/api';
const EXPRESS_API_URL = 'http://localhost:3001';

async function apiCall(endpoint, options = {}) {
    const defaults = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaults, ...options };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function expressCall(endpoint, options = {}) {
    const defaults = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaults, ...options };
    
    try {
        const response = await fetch(`${EXPRESS_API_URL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Express API Error:', error);
        throw error;
    }
}

// Obtener productos desde Django
async function getProducts() {
    return await apiCall('/products/');
}

async function getProduct(id) {
    return await apiCall(`/products/${id}/`);
}

async function getCategories() {
    return await apiCall('/categories/');
}

async function checkStock(productId, quantity) {
    return await apiCall('/check-stock/', {
        method: 'POST',
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity,
        }),
    });
}
