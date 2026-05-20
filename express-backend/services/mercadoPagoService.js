const axios = require('axios');

const MERCADO_PAGO_API = 'https://api.mercadopago.com';

const getAccessToken = () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
    }
    return accessToken;
};

const mercadoPagoRequest = async (config) => {
    try {
        const response = await axios({
            ...config,
            baseURL: MERCADO_PAGO_API,
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
                ...(config.headers || {}),
            },
        });
        return response.data;
    } catch (error) {
        const mercadoPagoError = error.response?.data;
        const message = mercadoPagoError?.message || error.message;
        const wrappedError = new Error(`Mercado Pago error: ${message}`);
        wrappedError.httpStatus = error.response?.status || 502;
        wrappedError.provider = 'mercado_pago';
        wrappedError.providerError = mercadoPagoError;
        throw wrappedError;
    }
};

const isHttpUrl = (value) => {
    try {
        const url = new URL(String(value || '').trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const sanitizeUnitPrice = (value) => {
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) {
        throw new Error('Product price must be a positive number');
    }
    return Number(price.toFixed(2));
};

const sanitizeQuantity = (value) => {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Product quantity must be a positive integer');
    }
    return quantity;
};

const buildReturnUrl = (path, orderId, paymentResult) => {
    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:8000';
    const url = new URL(path, frontendUrl);
    url.searchParams.set('orderId', orderId);
    url.searchParams.set('paymentResult', paymentResult);
    return url.toString();
};

const createPreference = async ({ order, items, totals, payer }) => {
    const successUrl = buildReturnUrl('/order-confirmation/', order.id, 'success');
    const pendingUrl = buildReturnUrl('/order-confirmation/', order.id, 'pending');
    const failureUrl = buildReturnUrl('/order-confirmation/', order.id, 'failure');

    const preferenceItems = items.map((item) => {
        const preferenceItem = {
            id: String(item.productId),
            title: String(item.name || 'Producto').slice(0, 250),
            quantity: sanitizeQuantity(item.quantity),
            unit_price: sanitizeUnitPrice(item.price),
            currency_id: process.env.MERCADOPAGO_CURRENCY || 'MXN',
        };

        if (isHttpUrl(item.imageUrl)) {
            preferenceItem.picture_url = String(item.imageUrl).trim();
        }

        return preferenceItem;
    });

    if (totals.shipping > 0) {
        preferenceItems.push({
            id: 'shipping',
            title: 'Envio',
            quantity: 1,
            unit_price: Number(totals.shipping.toFixed(2)),
            currency_id: process.env.MERCADOPAGO_CURRENCY || 'MXN',
        });
    }

    if (totals.tax > 0) {
        preferenceItems.push({
            id: 'tax',
            title: 'Impuestos',
            quantity: 1,
            unit_price: Number(totals.tax.toFixed(2)),
            currency_id: process.env.MERCADOPAGO_CURRENCY || 'MXN',
        });
    }

    const body = {
        items: preferenceItems,
        payer: {
            name: payer.name,
            email: payer.email,
            phone: {
                number: payer.phone,
            },
            address: {
                street_name: payer.address,
                zip_code: payer.postal_code,
            },
        },
        external_reference: String(order.id),
        metadata: {
            order_id: order.id,
        },
        back_urls: {
            success: successUrl,
            pending: pendingUrl,
            failure: failureUrl,
        },
        payment_methods: {
            excluded_payment_types: [
                { id: 'ticket' },
                { id: 'atm' },
            ],
            installments: Number(process.env.MERCADOPAGO_MAX_INSTALLMENTS || 12),
        },
        statement_descriptor: process.env.MERCADOPAGO_STATEMENT_DESCRIPTOR || 'FLORERIA',
    };

    if (process.env.MERCADOPAGO_NOTIFICATION_URL) {
        body.notification_url = process.env.MERCADOPAGO_NOTIFICATION_URL;
    }

    if (successUrl.startsWith('https://') && process.env.MERCADOPAGO_AUTO_RETURN !== 'false') {
        body.auto_return = 'approved';
    }

    const preference = await mercadoPagoRequest({
        method: 'POST',
        url: '/checkout/preferences',
        data: body,
    });

    return {
        id: preference.id,
        initPoint: process.env.MERCADOPAGO_USE_SANDBOX === 'true'
            ? preference.sandbox_init_point
            : preference.init_point,
        raw: preference,
    };
};

const getPayment = async (paymentId) => {
    return mercadoPagoRequest({
        method: 'GET',
        url: `/v1/payments/${paymentId}`,
    });
};

module.exports = {
    createPreference,
    getPayment,
};
