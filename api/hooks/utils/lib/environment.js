'use strict';

/**
 * @class sails.hooks.utils.environment
 *
 * Helper functions for the current sails environment
 */

module.exports = {
    getEnvironment,
    isTestEnvironment
};

/**
 * Get the current sails environment
 *
 * @return {String} The current sails environment
 */
function getEnvironment() {
    return sails.config.environment;
}

/**
 * Is the current environment the test environment
 *
 * @return {Boolean} true says we are in a test environment
 */
function isTestEnvironment() {
    return getEnvironment() === 'test';
}