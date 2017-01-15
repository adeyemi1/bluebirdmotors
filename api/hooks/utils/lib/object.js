'use strict';

/**
 * @class sails.hooks.utils.object
 *
 * Object utility methods.
 */
module.exports = {

    /**
     * Checks if a JavaScript object is empty
     *
     * @param {object} obj
     * @return {Boolean} True if the object isn't empty or False if it is
     */
    isEmptyObject: function(obj) {
        if (obj === null) return true;

        if (obj.length > 0) return false;
        if (obj.length === 0) return true;

        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    },

    /**
     * Check if an object contains valid JSON
     *
     * @param {object} obj The object
     * @return {Boolean} True if the object is a valid JSON or False if it isn't
     */
    isValidJSON: function(obj) {
        try {
            var json = JSON.stringify(obj);
        } catch (ex) {
            return false;
        }
        return true;
    },

    /**
     * Return an objects keys
     *
     * @param {object} obj The object
     * @return {array} The keys of the object
     */
    getKeys: function(obj) {
        return Object.keys(obj);
    },

    /**
     * Apply the values from one object to another
     *
     * @param {object} fromObject The object to apply values from.
     * @param {object} fromObject The object to apply values to.
     * @return {object} The updated object.
     *
     */
    applyValues: function(fromObject, toObject) {
        for (var value in fromObject) {
            toObject[value] = fromObject[value];
        }

        return toObject;
    },

    /**
     * Check if the object has any child objects (not arrays)
     *
     * @param {object} obj The object to check.
     *
     * @return {boolean} True if the object has child objects.
     *
     */
    getHasChildObject: function(obj) {
        for (var i in obj) {
            if (typeof obj[i] == 'object' && !(obj[i] instanceof Array) && obj[i] !== null) {
                return true;
            }
        }
        return false;
    },

    /**
     * Return different attributes when comparing 2 objects
     *
     * @param {object} obj The object to check.
     * @param {object} obj The object to compare with.
     *
     * @return {object} Differing attributes.
     *
     */
    deepDiff: function(obj, objCompare) {
        var diff = require('deep-diff').diff;

        return diff(obj, objCompare);
    },

    /**
     * Order the objects in an array by key value
     *
     * @param {array} array The array containing objects to sort.
     * @param {string} key The key to sort on.
     *
     * @return {array} The sorted array.
     *
     */
    sortObjectsByKey: function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key],
                y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    },

    /**
     * Order the objects in an array in reverse order by key value
     *
     * @param {array} array The array containing objects to sort.
     * @param {string} key The key to sort on.
     *
     * @return {array} The sorted array.
     *
     */
    sortObjectsReverseByKey: function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key],
                y = b[key];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    },

    /**
     * Remove property where property matches regular expression
     * @param  {Object} obj    
     * @param  {String} prop   
     * @param  {String} regExp 
     * @return {Object}        
     */
    removePropertyWhereRegExp: function(obj, prop, regExp) {
        // Remove string ids that contain letters
        if (_.isObject(obj) && _.isString(obj[prop]) && obj[prop].match(regExp)) {
            delete obj[prop];
        }

        return obj;
    },

    /**
     * Converts object to a query string i.e. {a:1, b:1} ==> a=1&b=1
     * @param {Object} obj object of params
     * @return {String} query string
     */
    toQueryString: function(obj) {
        var parts = [],
            i;
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    },

    /**
     * Create 'or' attribute to from array of values to query model
     * @param  {Array} values values
     * @param  {String} key    key to create or
     * @param  {Boolean} parseValue    do values need json parsing
     * @return {Object} or     or attribute to query model
     */
    createOrQuery: function(values, key, parseValue) {
        var mapFn = function(value) {
            var obj = {};

            obj[key] = value;

            return obj;
        };

        if (parseValue) {
            values = sails.hooks.utils.json.parseJSON(values);
        }

        return {
            or: _.map(values, mapFn)
        };
    },

    /**
     * Compact method for an object, removes all falsy values, including zeroes if removeFalsy is true
     * 
     * @param  {Object}  obj             The object to change
     * @param  {Boolean} [removeFalsy]   Whether to remove all falsy properties (including zeroes)
     * @param  {Boolean} [removeEmpty]   Whether to remove empty object/arrays
     * 
     * @return {Object} The object without falsy values
     */
    compact: function(obj, removeFalsy, removeEmpty) {
        var newObj = _.clone(obj);

        _.each(newObj, function(value, key) {
            if (!value && (removeFalsy || !(value === 0 || value === false))) {
                delete newObj[key];
            }

            if (removeEmpty && _.isObject(value) && _.isEmpty(value)) {
                delete newObj[key];
            }
        });

        return newObj;
    },

    /**
     * Removes null attributes from the passed in object
     * 
     * @param  {Object} object the initial object
     * @return {Object} object object without null attributes
     */
    removeNullAttributes: function(object) {
        for (let key in object) {
            if (object[key] === null) {
                delete object[key];
            }
        }

        return object;
    },

    /**
     * Does the object have any of the passed in properties
     *
     * @param {Object} object The object to check
     * @param {String[]} properties The properties
     *
     * @return {Boolean} Does the object have any of these properties
     */
    hasAny: function(object, properties) {
        for (let property of properties) {
            if (_.has(object, property)) {
                return true;
            }
        }
        return false;
    },

    /**
     * Does the object have all of these properties
     *
     * @param {Object} object The object to check
     * @param {String[]} properties An array of properties to check
     * 
     * @return {Boolean} Does the object have all of these properties
     */
    hasAll: function(object, properties) {
        for (let property of properties) {
            if (!_.has(object, property)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Convert a keyed object to an array of values that are in the order of the keys (keys must be numbers)
     *
     * @param {Object} keyedObject The keyed object, must have properties that are numbers
     *
     * @return {Array} An array of values in the keyed object, will be sorted by the key
     */
    convertKeyedObjectToArray: function(keyedObject) {
        return _.chain(_.keys(keyedObject))
            .map(key => parseInt(key, 10))
            .filter(key => !isNaN(key))
            .sortBy(key => key)
            .map(key => keyedObject[key.toString()])
            .value();
    },

    /**
     * Map properties on an object, will change the name of the property to what is returned from the iterator, iterator will be passed key, value and the object
     *
     * @param {Object} object The object to map the properties on
     * @param {Function} iterator The map function, the current property will change to what is returned from this function
     * @param {Object} [scope=this] The scope in which to call the iterator
     *
     * @return {Object} The object with the mapped properties
     */
    mapProperty: function(object, iterator, scope) {
        const workObject = _.cloneDeep(object);
        scope = scope || this;

        _.forIn(workObject, (value, key) => {
            const newKey = iterator.apply(scope, [key, value, workObject]);
            workObject[newKey] = value;
            if (key !== newKey) {
                delete workObject[key];
            }
        });

        return workObject;
    },

    /**
     * gets a value from an object at a specified path
     *
     * @param {Object} object object to get value from
     * @param {String} path where to get value
     * 
     * @return {Boolean} value from object at specifed path
     */
    getValueAt: function(object, path) {
        const properties = path.split('.');
        let currentValue = _.clone(object);

        _.each(properties, (property) => {
            if (currentValue.hasOwnProperty(property)) {
                currentValue = currentValue[property];
            } else {
                currentValue = null;
                return false;
            }
        });

        return currentValue;
    },

    /**
     * Omit the specified keys from the object
     *
     * @param {Object} object Object to remove attributes from 
     * @param {Array} keys Keys to remove
     * 
     * @return {Object} Object with keys removed
     */
    omitDeep: function(object, keys) {
        var _this = this;

        function omitDeepOnOwnProps(obj) {
            if ((!_.isArray(obj) && !_.isObject(obj)) || (obj instanceof Date)) {
                return obj;
            }

            if (_.isArray(obj)) {
                return _this.omitDeep(obj, keys);
            }

            const o = {};
            _.forOwn(obj, (value, key) => {
                o[key] = _this.omitDeep(value, keys);
            });

            return _.omit(o, keys);
        }

        if (typeof object === "undefined") {
            return {};
        }

        if (_.isArray(object)) {
            return object.map(omitDeepOnOwnProps);
        }

        return omitDeepOnOwnProps(object);
    },

    /**
     * Pick only the specified keys from an object
     *
     * @param {Object|Array} object Object to include attributes from, can also be an array, in which case it is applied to each item in the array
     * @param {Array} keys Keys to include
     * 
     * @return {Object} Object with specified keys included
     */
    pickDeep: function(object, keys) {
        var _this = this;

        function includeDeepOnOwnProps(obj) {
            if ((!_.isArray(obj) && !_.isObject(obj)) || (obj instanceof Date)) {
                return obj;
            }

            if (_.isArray(obj)) {
                return _this.pickDeep(obj, keys);
            }

            const o = {};
            _.forOwn(obj, (value, key) => {
                o[key] = _this.pickDeep(value, keys);
            });

            return _.pick(o, keys);
        }

        if (typeof object === "undefined") {
            return {};
        }

        if (_.isArray(object)) {
            return object.map(includeDeepOnOwnProps);
        }

        return includeDeepOnOwnProps(object);
    }

};