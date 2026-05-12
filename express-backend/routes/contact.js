const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
        });
        res.status(201).json(contact);
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
