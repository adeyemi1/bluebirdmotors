'use strict';

/**
 * @class sails.hooks.utils.number
 *
 * Number utility methods.
 */

module.exports = function() {
    const accounting = require('accounting'),

        /**
         * Calculate the percentage
         *
         * @param {Number} percent The percentage to use, e.g 5000 for 50%
         * @param {Number} percentOf The number to apply the percentage to so if it were 50, 10% of it would be 5
         *
         * @return {Number} The calculated percentage
         */
        calculatePercentage = function(percent, percentOf) {
            return (percent / 10000) * percentOf;
        },

        /**
         * Calculate a percentage increase or decrease
         *
         * @param {Number} percent The percentage to use, e.g 5000 for 50%
         * @param {Number} percentOf The number to apply the percentage to so if it were 50, 10% of it would be 5
         * @param {Boolean} increase specify without to do a percentage increase or decrease
         *
         * @return {Number} The calculated percentage change
         */
        calculatePercentageChange = function(percent, percentOf, increase) {
            return increase ? percentOf + this.calculatePercentage(percent, percentOf) : percentOf - this.calculatePercentage(percent, percentOf);
        },

        /**
         * Always return a number - 0 if not a number
         *
         * @param {Number} value The value to check
         *
         * @return {Number} The value or 0
         */
        alwaysNumber = function(value) {
            return +value || 0;
        },

        /**
         * Returns the negative value of a number
         * 
         * @param  {Number} value the value
         * 
         * @return {Number}       the negative value
         */
        reverseNumber = function(value) {
            return (-1) * value;
        },

        /**
         * Function converting a number to a money format for displaying 
         * purposes. 
         *          
         * @param  {Number} value                       The number to convert to money format
         * @param  {String} [symbol='']                 The currency symbol to append to the value
         * @param  {Number} [decimalDigits=2]           The decimal digits to show
         * @param  {String} [separator=',']             The value separator
         * @param  {String} [decimalSeparator='.']      The decimal separator
         * @return {String} The value formatted to a money string format
         */
        numberToMoneyFormat = function(value, symbol, decimalDigits, separator, decimalSeparator) {
            symbol = symbol || '';
            decimalDigits = decimalDigits || 2;
            separator = separator || ',';
            decimalSeparator = decimalSeparator || '.';
            return accounting.formatMoney(value, symbol, decimalDigits, ',', '.');
        },

        /**
         * Function that calculates the difference between two values as a percentage of the base value
         *
         * @param {Number} baseValue    The number the resulting percentage is of
         * @param {Number} newValue     The number the difference is calculated from
         *
         * @return {Number} Percentage difference between the two (*100 as convention, e.g 5000 for 50%)
         */
        calculatePercentageDifference = function(baseValue, newValue) {
            return ((newValue - baseValue) / baseValue) * 10000;
        };

    return {
        calculatePercentage,
        calculatePercentageChange,
        alwaysNumber,
        reverseNumber,
        numberToMoneyFormat,
        calculatePercentageDifference
    };
}();