'use strict';

/**
 * @class sails.hooks.utils.array
 *
 * Array utility methods.
 */

module.exports = (function() {

    /**
     * Returns a unique value array
     *
     * @param {Array} pArray Array in
     *
     * @return {Array} Unique array out
     */
    const unique = function(pArray) {
            return _.unique(pArray);
        },

        /**
         * Returns the first section of an array
         *
         * @param {Array} pArray Array in
         * @param {Number} pLength Number of array elements to return
         *
         * @return {Array} Array out
         */
        first = function(pArray, pLength) {
            return _.first(pArray, pLength);
        },


        /**
         * Returns the array of objects back with fields removed
         *
         * @param {Array} pArray Array in
         * @param {Array} fields on top level to remove
         * @param {String} association
         * @param {Array} fields on association to remove
         *
         * @return {Array} Array out
         */
        stripUnwantedObjectFields = function(pArray, fields, association, associationFields) {
            var i;

            _(pArray).forEach(function(value) {
                for (i = 0; i < fields.length; i++) {
                    if (value[fields[i]] !== undefined) {
                        delete value[fields[i]];
                    }
                }

                if (association && associationFields.length > 0) {
                    for (i = 0; i < associationFields.length; i++) {
                        if (value[association] !== undefined) {
                            if (value[association][associationFields[i]] !== undefined) {
                                delete value[association][associationFields[i]];
                            }
                        }
                    }
                }
            });

            return pArray;
        },

        /**
         * Sorts by key in ascending order
         *
         * @private
         *
         * @param {Array} pArray Array in
         * @param {Array} pArray Array in
         * @param {String} association if any
         * @param {String} key to sort by
         *
         * @return {Number} The result of the sort
         */
        sort = function(association, key, a, b) {
            if (association && key) {
                return 2 * (a[association][key] > b[association][key]) - 1;
            } else {
                return 2 * (a[key] > b[key]) - 1;
            }
        },

        /**
         * Sorts by key in ascending order
         * 
         * @param {Array}       pArray        Array in
         * @param {String}      association   if any
         * @param {String}      key           to sort by
         *
         * @return {Array} Array out
         */
        sortByField = function(pArray, association, key) {
            pArray.sort(sort.bind(undefined, association, key));
            return pArray;
        },

        /**
         * Check to see if there is an existing record in array
         * @param  {Array}  Array of objects
         * @param {Object}  Object to match on
         * @param  {String} property to match on
         * @return {Object} existing record
         */
        getFirstExistingRecord = function(array, obj, objProp) {
            return _.find(array, function(property) {
                var x = objProp ? property[objProp] : property,
                    y = objProp ? obj[objProp] : obj;

                return _.isEqual(x, y);
            });
        },

        /**
         * Apply map to array and filter out all null or undefined values from said array
         *
         * @param {Object[]} arr The array to map
         * @param {Function} mapFn The map function to use
         * @param {Object} [scope]
         *
         * @return {Array} The resulting array with null and undefined removed
         */
        compactMap = function(arr, mapFn, scope) {
            if (_.isEmpty(arr)) {
                return [];
            }

            const returnResult = [];

            _.each(arr, (value, index, collection) => {
                const mapResult = mapFn.call(scope || this, value, index, collection);
                if (sails.hooks.utils.value.hasValue(mapResult)) {
                    returnResult.push(mapResult);
                }
            });

            return returnResult;
        },

        /**
         * Should perform a pluck but only return the values that exist
         * 
         * @param {Array} arr The array to perform the cleanPluck
         * @param {String|String[]} propName The name of the property to pluck, or an array of properties if there is more than one
         * @param {Boolean} [includeFalsy=true] Should we include falsy values if the property exists in the object
         * 
         * @return {Array} array of the plucked values with falsey values removed
         */
        compactPluck = function(arr, propertyNames, includeFalsy) {
            const ret = [];

            propertyNames = toArray(propertyNames);

            _.each(arr, function(value) {

                _.each(propertyNames, (propName) => {

                    if (!value || !value.hasOwnProperty(propName)) {
                        return;
                    }

                    const currentVal = value[propName];

                    if (includeFalsy === false && !currentVal) {
                        return;
                    }

                    ret.push(currentVal);
                });
            });

            return ret;
        },

        /**
         * Check to see if all items in the second array appear in the first array 
         * @param  {Array}  array1 first array
         * @param {Array}  array2 second array
         * @return {Boolean} does contain all items
         */
        containsAll = function(array1, array2) {
            for (let val of array2) {
                if (!_.includes(array1, val)) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Check to see if any items in the first array appear in the second array
         * @param  {Array}  array1 first array
         * @param {Array}  array2 second array
         * @return {Boolean} does contain any items
         */
        containsAny = function(array1, array2) {
            for (let val of array2) {
                if (_.includes(array1, val)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Deep contains, check if value is contained within the array, when comparing objects
         * or arrays it looks at the value contained within them to determine if they are equal
         *
         * @param {Array} array The array containing values
         * @param {*} val The value to look for in the array
         *
         * @return {Boolean} Is the val contained within the array
         */
        deepContains = function(array, val) {
            return !!_.find(array, arrVal => _.isEqual(arrVal, val));
        },

        /**
         * Convert an array to an index keyed object
         *
         * @param {Array} arr The array to convert to an object
         *
         * @return {Object} The arr as an object where the index is the property name
         */
        toObject = function(arr) {
            return _.extend({}, arr);
        },

        /**
         * Merge arrays, can pass in as many arrays as required
         *
         * @param {Array} arr1 The first array to merge
         * @param {Array} [arr2] The second array to merge
         * @param {Array} [arr3] The third array to merge (and so on...)
         *
         * @return {Array} The merged array
         */
        merge = function() {
            // Convert the arrays passed in through the arguments to objects
            const toMerge = compactMap(sails.hooks.utils.fn.convertArgumentObjectToArray(arguments), (value) => {
                if (_.isArray(value)) {
                    return sails.hooks.utils.array.toObject(value);
                }
            });

            const merged = _.assign.apply(this, [{}].concat(toMerge));
            return sails.hooks.utils.object.convertKeyedObjectToArray(merged);
        },


        /**
         * From an include list and an exclude list deterimine if a value is a allowed,
         * checks to see if the value is in the include list if yes returns true, if the value
         * is in the excludeList returns false. If it's in both or is in neither it returns the neitherOrBoth value
         *
         * @param {Array} includeList The list of values that are allowed
         * @param {Array} excludeList The list values that are not allowed
         * @param {*}  value The value to check to see if it is allowed
         * @param {Boolean} [neitherOrBoth=true] The boolean value to return when the value is in neither list or both
         *
         * @return {Boolean} Is the value allowed
         */
        allow = function(includeList, excludeList, value, neitherOrBoth) {
            neitherOrBoth = neitherOrBoth === false ? neitherOrBoth : true;

            const includeEmpty = _.isEmpty(includeList),
                excludeEmpty = _.isEmpty(excludeList),
                includeValue = deepContains(includeList, value),
                excludeValue = deepContains(excludeList, value);

            if (includeEmpty && excludeEmpty) {
                return neitherOrBoth;
            }

            if (!includeEmpty && !excludeEmpty) {
                if (includeValue === excludeValue) {
                    return neitherOrBoth;
                }
                if (includeValue) {
                    return true;
                }
                if (excludeValue) {
                    return false;
                }
            }

            if (!includeEmpty) {
                return includeValue;
            }

            if (!excludeEmpty) {
                return !excludeValue;
            }

            return neitherOrBoth;
        },

        /**
         * Sum an array
         *
         * @param {Array} The array to sum
         * @param {Function|String} [iteratee] The iteratee invoked per element, the returned value is summed, called with (element, index, array). Or the name of property to sum by
         *
         * @return {Number} The sum
         */
        sumBy = function(array, iteratee) {
            let arrayToSum = _.clone(array);
            if (_.isFunction(iteratee)) {
                arrayToSum = _.map(arrayToSum, iteratee);
            } else if (_.isString(iteratee)) {
                arrayToSum = _.pluck(array, iteratee);
            }
            return _.sum(arrayToSum);
        },

        /**
         * Convert the passed value into an array
         *
         * @param {*} value
         *
         * @return {Array} The resulting array
         */
        toArray = function(value) {
            if (_.isArray(value)) {
                return value;
            }
            if (sails.hooks.utils.value.hasValue(value)) {
                return [value];
            }
            return [];
        },

        /**
         * Wrapper around lodash reduce to include functionality for Object[]
         * 
         * @param  {Object[] || Number[]}  array       the collection to iterate over
         * @param  {Function}              itFn        the function invoked per iteration
         * @param  {Object || Number}      accumulator the initial value
         * 
         * @return {Object || Number}      the accumulated value
         */
        reduce = function(array, itFn, accumulator) {
            if (_.isArray(array) && !_.isEmpty(array) && _.isObject(array[0])) {
                _.each(array, item => {
                    accumulator = itFn(accumulator, item);
                });

                return accumulator;
            } else {
                return _.reduce(array, itFn, accumulator);
            }
        },

        /**
         * Should perform a pluck, pulling out a value from a specified path
         * 
         * @param {Array} arr The array to perform the cleanPluck
         * @param {String} path path of property to pluck
         * 
         * @return {Array} array of the plucked values
         */
        pluckDeep = function(array, path) {
            return _.map(array, item => sails.hooks.utils.object.getValueAt(item, path));
        },

        /**
         * Groups the passed in array of objects by the passed in array of attributes
         * 
         * @param  {Object[]}    array              array of objects
         * @param  {String[]}    groupingAttributes array of strings
         * 
         * @return {Object[]}    returns an array of grouped arrays
         */
        groupBy = function(array, groupingAttributes) {
            const groupedArrayInObject = _.groupBy(array, (item) => {
                    return _.reduce(groupingAttributes, (result, string) => {
                        return result + '_' + item[string];
                    }, '');
                }),
                returnArray = [];

            _.forEach(groupedArrayInObject, (value) => {
                returnArray.push(value);
            });

            return returnArray;
        },

        /**
         * Pluck unique values from an array at the passed pluck path
         *
         * @param {Array} array The array to pluck from
         * @param {String|String[]} pluckPropertyPath The path to pluck from, can go down many levels, can also 
         *
         * @return {Array} An array of unique values at the pluck path
         */
        uniqPluck = function(array, pluckPropertyPath) {
            return _.uniq(multiPluck(array, pluckPropertyPath));
        },

        /**
         * Pluck multiple values from the passed array, the result is a single array
         * containing all the values for the passed properties
         *
         * @param {Array} array The array to pluck from
         * @param {String|String[]} pluckProperties An array of properties to pluck from
         *
         * @return {Array} An array of plucked values 
         */
        multiPluck = function(array, pluckProperties) {
            let result = [];

            // Force pluck properties in to an array
            pluckProperties = toArray(pluckProperties);

            _.each(pluckProperties, (pluckProperty) => {
                result = result.concat(pluckDeep(array, pluckProperty));
            });
            return result;
        },

        /**
         * Get uniq values in an array using the uniqueByProperty to determine 
         * if the item is unique
         *
         * @param {Array} array The array to filter to the unique values
         * @param {String} uniqueByProperty The name of the property on each array item to use to identify that item, can also be a path to a property many levels down
         *
         * @return {Array} The unique array
         */
        uniqueBy = function(array, uniqueByProperty) {
            const uniqueValuesFound = [];

            return _.filter(array, function(item) {
                const valueOfUniqueProperty = sails.hooks.utils.object.getValueAt(item, uniqueByProperty);

                if (!sails.hooks.utils.value.hasValue(valueOfUniqueProperty) || _.includes(uniqueValuesFound, valueOfUniqueProperty)) {
                    return false;
                }

                uniqueValuesFound.push(valueOfUniqueProperty);
                return true;
            });
        };

    // Public functions
    return {
        unique,
        first,
        stripUnwantedObjectFields,
        sortByField,
        getFirstExistingRecord,
        compactMap,
        compactPluck,
        containsAll,
        containsAny,
        deepContains,
        toObject,
        merge,
        allow,
        sumBy,
        toArray,
        reduce,
        pluckDeep,
        groupBy,
        uniqPluck,
        multiPluck,
        uniqueBy
    };

}());