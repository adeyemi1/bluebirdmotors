'use strict';

/**
 * @class sails.hooks.utils.template
 *
 * Templating utility methods.
 */


const handlebars = require('handlebars');

module.exports = {

    /**
     * Function that compiles and evaluates a string using handlebars, taking values from the data passed in.
     *
     * @param {String} string The string to evaluate
     * @param {Object} data The data to pull references from
     *
     * @return {String} The compiled string
     */
    evalString: function(string, data) {
        return handlebars.compile(string)(data);
    }
};