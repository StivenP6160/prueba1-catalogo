require('dotenv').config({ path: '.env.test', quiet: true });
const { resetDatabase } = require('./helpers/database');

module.exports = async () => {
  await resetDatabase();
};