const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const sequelize = require('../config/db');
const { createPreference, getPayment } = require('../services/mercadoPagoService');
const { sendOrderConfirmation } = require('../services/emailService');

const ONLINE_PAYMENT_METHODS = new Set(['credit_card', 'mercado_pago']);

const sanitizeOrderItems = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
        const error = new Error('Order must include at least one item');
        error.statusCode = 400;
        throw error;
    }

    return items.map((item, index) => {
        const productId = Number(item.productId);
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (!Number.isInteger(productId) || productId <= 0) {
            const error = new Error(`Invalid product id at item ${index + 1}`);
            error.statusCode = 400;
            throw error;
        }

        if (!Number.isFinite(price) || price <= 0) {
            const error = new Error(`Invalid product price at item ${index + 1}`);
            error.statusCode = 400;
            throw error;
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            const error = new Error(`Invalid product quantity at item ${index + 1}`);
            error.statusCode = 400;
            throw error;
        }

        return {
            productId,
            name: String(item.name || 'Producto').slice(0, 200),
            price: Number(price.toFixed(2)),
            quantity,
            imageUrl: item.imageUrl,
        };
    });
};

const calculateTotals = (items = []) => {
    const subtotal = items.reduce((sum, item) => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        return sum + (price * quantity);
    }, 0);
    const shipping = items.length > 0 ? 10 : 0;
    const tax = subtotal * 0.21;
    const total = subtotal + shipping + tax;

    return {
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
    };
};

const createOrderWithItems = async (payload, status, transaction) => {
    const {
        name, email, phone, address, city, postal_code,
        payment_method, items,
    } = payload;
    const totals = calculateTotals(items);

    const order = await Order.create({
        customer_name: name,
        email,
        phone,
        address,
        city,
        postal_code,
        payment_method,
        total: totals.total,
        status,
    }, { transaction });

    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    return { order, totals };
};

const mapMercadoPagoStatus = (paymentStatus) => {
    switch (paymentStatus) {
        case 'approved':
            return 'paid';
        case 'pending':
        case 'in_process':
        case 'authorized':
            return 'pending_payment';
        case 'rejected':
        case 'cancelled':
        case 'refunded':
        case 'charged_back':
            return 'payment_failed';
        default:
            return 'pending_payment';
    }
};

const sendOrderConfirmationSafely = async (order, items, paymentStatus) => {
    try {
        await sendOrderConfirmation({ order, items, paymentStatus });
    } catch (error) {
        console.error('Order confirmation email error:', error.response?.body || error.message);
    }
};

const getOrderItemsForEmail = async (orderId) => {
    const rows = await OrderItem.findAll({ where: { order_id: orderId } });
    return rows.map(row => ({
        name: row.product_name,
        quantity: row.quantity,
        price: row.price,
    }));
};

router.post('/', async (req, res) => {
    let t;
    try {
        const { payment_method, items = [] } = req.body;
        const sanitizedItems = sanitizeOrderItems(items);
        const orderPayload = { ...req.body, items: sanitizedItems };

        t = await sequelize.transaction();
        const initialStatus = ONLINE_PAYMENT_METHODS.has(payment_method) ? 'pending_payment' : 'pending';
        const { order, totals } = await createOrderWithItems(orderPayload, initialStatus, t);

        await t.commit();
        t = null;

        if (ONLINE_PAYMENT_METHODS.has(payment_method)) {
            const preference = await createPreference({
                order,
                items: sanitizedItems,
                totals,
                payer: orderPayload,
            });

            return res.status(201).json({
                id: order.id,
                status: order.status,
                total: order.total,
                payment_provider: 'mercado_pago',
                preference_id: preference.id,
                checkout_url: preference.initPoint,
            });
        }

        sendOrderConfirmationSafely(order, sanitizedItems, order.status);
        return res.status(201).json(order);
    } catch (error) {
        if (t) {
            await t.rollback();
        }
        console.error('Order creation error:', error);
        res.status(error.statusCode || error.httpStatus || 500).json({
            error: error.message,
            provider: error.provider,
            details: error.providerError,
        });
    }
});

router.post('/mercado-pago/webhook', async (req, res) => {
    try {
        const eventType = req.query.type || req.body.type;
        const paymentId = req.query['data.id'] || req.body?.data?.id;

        if (eventType === 'payment' && paymentId) {
            const payment = await getPayment(paymentId);
            const orderId = payment.external_reference || payment.metadata?.order_id;
            if (orderId) {
                const order = await Order.findByPk(orderId);
                if (order) {
                    const previousStatus = order.status;
                    const nextStatus = mapMercadoPagoStatus(payment.status);
                    await order.update({ status: nextStatus });

                    if (nextStatus === 'paid' && previousStatus !== 'paid') {
                        const items = await getOrderItemsForEmail(order.id);
                        sendOrderConfirmationSafely(order, items, nextStatus);
                    }
                }
            }
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error('Mercado Pago webhook error:', error);
        return res.sendStatus(500);
    }
});

router.post('/:id/mercado-pago/confirm', async (req, res) => {
    try {
        const { payment_id } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (!payment_id) {
            return res.status(400).json({ error: 'payment_id is required' });
        }

        const payment = await getPayment(payment_id);
        const paymentOrderId = String(payment.external_reference || payment.metadata?.order_id || '');

        if (paymentOrderId !== String(order.id)) {
            return res.status(409).json({ error: 'Payment does not belong to this order' });
        }

        const status = mapMercadoPagoStatus(payment.status);
        const previousStatus = order.status;
        await order.update({ status });

        if (status === 'paid' && previousStatus !== 'paid') {
            const items = await getOrderItemsForEmail(order.id);
            sendOrderConfirmationSafely(order, items, status);
        }

        return res.json({
            id: order.id,
            status,
            mercado_pago_status: payment.status,
            payment_id,
        });
    } catch (error) {
        console.error('Mercado Pago confirmation error:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
