const axios = require('axios');

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api';

const getDjangoProduct = async (productId) => {
    try {
        const response = await axios.get(`${DJANGO_API_URL}/products/${productId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product from Django:', error.message);
        throw error;
    }
};

const checkStock = async (productId, quantity) => {
    try {
        const response = await axios.post(`${DJANGO_API_URL}/check-stock/`, {
            product_id: productId,
            quantity: quantity,
        });
        return response.data;
    } catch (error) {
        console.error('Error checking stock:', error.message);
        throw error;
    }
};

module.exports = {
    getDjangoProduct,
    checkStock,
};
