/**
 * @class sails.hooks.utils.fn
 *
 * Utility functions for functions
 */

module.exports = (function() {
    'use strict';

    /**
     * Force the length of the arguments that a function can be called under, returns a new function with the 
     * forced argument length rule applied. If the function gets called with less than the required arguments,
     * the unspecified arguments will be set to 'undefined'. If more arguments are used than allowed the extra
     * arguments will be ignored
     *
     * @param {Function} fn The function to forceArgLength on
     * @param {Number} forcedArgsLength The number of arguments that the returning function will be forced to accept
     * @param {Object} [scope] The scope that the returning function will be executed under
     *
     * @return {Function} The function with the forced argument length applied
     */
    const forceArgLength = function(fn, forcedArgsLength, scope) {
            scope = scope || this;
            return function() {
                let argsArray = Array.prototype.slice.call(arguments);

                if (_.isNumber(forcedArgsLength)) {
                    if (forcedArgsLength > argsArray.length) {

                        // Append undefined for each argument that is missing
                        argsArray = argsArray.concat(_.fill(new Array(forcedArgsLength - argsArray.length), undefined));

                    } else if (forcedArgsLength < argsArray.length) {

                        // Only take the arguments within the forcedArgsLength
                        argsArray = _.take(argsArray, forcedArgsLength);

                    }
                }
                return fn.apply(scope, argsArray);
            };
        },

        /**
         * Extended partial that can take both left and right arguments, 
         * also has the option of forcing the amount of arguments that the returned
         * partial function can take, so if you call it with less it adds the necessary undefined args in,
         * and if you call it with more arguments it only call it with the arguments within the forcedArgsLength count
         *
         * @param {Function} fn The function to make a partial of
         * @param {Array} leftArgs The arguments to use on the left side of the function
         * @param {Array} [rightArgs] The arguments to use on the right side of the function
         * @param {Number} [forcedArgsLength] Do we want to force the number of arguments that can call the returned function. How many arguments to force
         * @param {Object} [scope] The scope in which the resulting function will be run under
         *
         * @return {Function} The created partial function with the left and right arguments preset and optionally a forced argument length
         */
        partial = function(fn, leftArgs, rightArgs, forcedArgsLength, scope) {
            scope = scope || this;

            // Apply the left and right arguments to the partial function
            if (!_.isEmpty(leftArgs)) {
                fn = _.partial.apply(this, [fn].concat(leftArgs));
            }
            if (!_.isEmpty(rightArgs)) {
                fn = _.partialRight.apply(this, [fn].concat(rightArgs));
            }

            return forceArgLength(fn, forcedArgsLength, scope);
        },

        /**
         * Convert the passed in arguments object to array
         *
         * @param {Object} args An array-like arguments arrray
         *
         * @return {Array} The arguments as an array
         */
        convertArgumentObjectToArray = function(args) {
            return Array.from(args);
        },

        /**
         * Merge the passed in arguments, as many arguments (as object or array) as needed can be passed in,
         * returns a single merged arguments set, arguments on the right take precedence
         *
         * @param {Object|Array} args1 The arguments to merge 
         * @param {Object|Array} args2 The arguments to merge 
         * @param {Object|Array} args3 The arguments to merge (and so on...)
         *
         * @return {Array} The arguments merged as an array
         */
        mergeArguments = function() {
            let argArray = convertArgumentObjectToArray(arguments);

            argArray = _.map(argArray, (arg) => {
                if (!_.isArray(arg)) {
                    return convertArgumentObjectToArray(arg);
                }
                return arg;
            });

            return sails.hooks.utils.array.merge.apply(this, argArray);
        };


    // Public functions
    return {
        partial,
        forceArgLength,
        convertArgumentObjectToArray,
        mergeArguments
    };

})();