const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:8000',
    'https://floreria-back-production-0c99.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });


const PORT = process.env.PORT || 3001;
const sequelize = require('./config/db');
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8000,http://127.0.0.1:8000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.locals.databaseReady = false;
app.locals.databaseError = null;

// Models (to ensure they are registered for sync)
require('./models/Cart');
require('./models/Contact');
require('./models/Order');
require('./models/OrderItem');

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:8000',
    'https://floreria-back-production-0c99.up.railway.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: app.locals.databaseReady ? 'OK' : 'DEGRADED',
        database: {
            connected: app.locals.databaseReady,
            error: app.locals.databaseError,
        },
        timestamp: new Date(),
    });
});

const requireDatabase = (req, res, next) => {
    if (!app.locals.databaseReady) {
        return res.status(503).json({
            error: 'Database unavailable',
            detail: app.locals.databaseError || 'Configure MySQL credentials in express-backend/.env',
        });
    }
    next();
};

// Routes
app.use('/cart', require('./routes/cart'));
app.use('/orders', requireDatabase, require('./routes/orders'));
app.use('/contact', requireDatabase, require('./routes/contact'));

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

const startServer = async () => {
    try {
        await sequelize.sync();
        app.locals.databaseReady = true;
        console.log('Database connected and synchronized.');
    } catch (err) {
        app.locals.databaseError = err.message;
        console.error('Database unavailable. Express will start in degraded mode.');
        console.error(err.message);
        console.error('Check express-backend/.env and confirm MySQL is running.');
    }

    const server = app.listen(PORT, () => {
        console.log(`Express server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use.`);
            console.error('Close the existing Express process or change PORT in express-backend/.env.');
            process.exit(1);
        }

        throw err;
    });
};

startServer();

module.exports = app;
