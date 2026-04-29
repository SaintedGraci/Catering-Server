// Central config export
const { sequelize, connectDB } = require('./database');
const dbConstants = require('./db.constants');

module.exports = {
  sequelize,
  connectDB,
  dbConstants
};
