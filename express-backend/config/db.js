const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const dbConfig = {
    database: process.env.DB_NAME || 'floreria_db',
    username: process.env.DB_USER || 'floreria_user',
    password: process.env.DB_PASSWORD || '090774',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
};

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    console.warn(
        'Database environment variables are incomplete. Using local development defaults from .env.example.'
    );
}

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        logging: false,
    }
);

module.exports = sequelize;
