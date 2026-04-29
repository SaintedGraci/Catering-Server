require('dotenv').config();
const { Sequelize } = require('sequelize');
const { DB_POOL, DB_TIMEZONE } = require('./db.constants');

// Debug: Log environment variables (Railway should inject these)
console.log('Environment check:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DB_HOST exists:', !!process.env.DB_HOST);
console.log('NODE_ENV:', process.env.NODE_ENV);

let sequelize;

// Check if DATABASE_URL is provided (Railway with database reference)
if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for connection');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    pool: DB_POOL,
    timezone: DB_TIMEZONE,
    dialectOptions: {
      ssl: false // Railway internal network doesn't need SSL
    }
  });
} else {
  // Use individual variables (local development)
  console.log('Using individual DB variables for connection');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
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
}

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
