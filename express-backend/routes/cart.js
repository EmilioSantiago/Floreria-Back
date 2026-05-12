const express = require('express');
const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        res.json({ message: 'Cart route - to be implemented' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        res.json({ message: 'Get cart - to be implemented' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
