'use strict';

/**
 * @class sails.hooks.utils.json
 *
 * Json utility methods.
 */
module.exports = {

    /**
     * Parse value if value was stringified on client, ie.e for GET request
     * @param  {String} value value
     * @return {Array|Object} value
     */
    parseJSON: function(value) {

        if (_.isString(value)) {
            try {
                value = JSON.parse(value);
            } catch (e) {
                sails.hooks.log.error('json', 'Error parsing json', e);
                throw new sails.hooks.errors.SkError('API_NOT_PARSABLE');
            }
        }

        return value;
    },

    /**
     * Parse json to csv and return a promise
     * @param  {Object[]} values values
     * @param  {string[]} fields all fields in values
     * @return {Object}        promise that resolves to csv
     */
    json2csv: function(values, fields) {
        const json2Csv = require('json2csv');

        return new sails.Promise(function(resolve, reject) {
            json2Csv({
                data: !_.isEmpty(values) ? values : [],
                fields: fields || []
            }, function(err, csv) {
                if (err) {
                    return reject();
                }

                resolve(csv);

            });
        });
    }
};