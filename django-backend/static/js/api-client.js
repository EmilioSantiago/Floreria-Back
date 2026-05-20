// API Client - Manejo de peticiones HTTP
const API_BASE_URL = window.location.origin + '/api';
const EXPRESS_API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

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
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.error || errorMessage;
                if (errorBody.details?.message) {
                    errorMessage += ` (${errorBody.details.message})`;
                }
            } catch (parseError) {
                // Keep the generic HTTP error if the response is not JSON.
            }
            throw new Error(errorMessage);
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
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.error || errorMessage;
                if (errorBody.details?.message) {
                    errorMessage += ` (${errorBody.details.message})`;
                }
            } catch (parseError) {
                // Keep the generic HTTP error if the response is not JSON.
            }
            throw new Error(errorMessage);
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
