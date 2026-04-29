require('dotenv').config();
const { Sequelize } = require('sequelize');
const { DB_POOL, DB_TIMEZONE } = require('./db.constants');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: DB_POOL,
    timezone: DB_TIMEZONE,
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('railway') 
        ? {
            require: true,
            rejectUnauthorized: false
          }
        : undefined
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync all models with database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
