/**
 * Controllers barrel file - exports all controllers
 */

const authController = require('./authController');
const healthController = require('./healthController');

module.exports = {
  authController,
  healthController
};
