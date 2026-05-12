const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const sequelize = require('./config/db');

// Models (to ensure they are registered for sync)
require('./models/Cart');
require('./models/Contact');
require('./models/Order');
require('./models/OrderItem');

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Routes (will be added as we build)
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));
app.use('/contact', require('./routes/contact'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

// Database sync and server start
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`🌸 Express server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

module.exports = app;
