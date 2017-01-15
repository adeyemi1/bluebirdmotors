'use strict';

/**
 * @class sails.hooks.utils.timing
 *
 * Methods for timing code sections for performance debugging.
 */

var startTimes = [];

module.exports = {

    /**
     * Start / reset the timer for the specified key
     *
     * @param {string} key The reference to the individual timer
     *
     */
    start: function(key) {
        startTimes[key] = new Date();
    },

    /**
     * Log out message with the elapsed time for the specified key
     *
     * @param {string} key The reference to the individual timer
     * @param {string} [legend] Text to output along with message
     *
     */
    elapsed: function(key, legend) {
        sails.hooks.log.info(key + ' - ' + legend || '', 'Timing: ' + this.getElapsed(key) + 'ms');
    },

    /**
     * get the elapsed time for the specified key
     *
     * @param {string} key The reference to the individual timer
     *
     */
    getElapsed: function(key) {
        return sails.hooks.utils.datetime.msBetween(startTimes[key], new Date());
    }
};