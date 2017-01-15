'use strict';

const moment = require('moment');
/**
 * @class sails.hooks.utils.value
 *
 * Value utility methods.
 */

module.exports = {

    /**
     * Function that checks if that passed in value has a value
     * 
     * @param  {*}  value  the passed in value to be checked
     * 
     * @return {Boolean}  returns true if the value has value
     */
    hasValue: function(value) {
        if (_.isObject(value)) {
            return _.isDate(value) ? sails.hooks.utils.datetime.isValidDate(value) : !_.isEmpty(value);
        }

        if (value === 0 || value === false) {
            return true;
        }

        return !!value;
    }

};