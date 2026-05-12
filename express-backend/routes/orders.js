const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const sequelize = require('../config/db');

router.post('/', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            name, email, phone, address, city, postal_code, 
            payment_method, items, total 
        } = req.body;

        const order = await Order.create({
            customer_name: name,
            email,
            phone,
            address,
            city,
            postal_code,
            payment_method,
            total,
        }, { transaction: t });

        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
        }));

        await OrderItem.bulkCreate(orderItems, { transaction: t });

        await t.commit();
        res.status(201).json(order);
    } catch (error) {
        await t.rollback();
        console.error('Order creation error:', error);
        res.status(500).json({ error: error.message });
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
