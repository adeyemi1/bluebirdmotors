'use strict';

const Postcode = require('postcode');

module.exports = {
    normalise
};

/**
 * Normalise the postcode where the postcode is valid
 *
 * @param {String} postcode The postcode to normalise
 *
 * @return {String} The normalised postcode (ec1v9lb -> EC1V 9LB)
 */
function normalise(postcode) {
    return new Postcode(postcode).normalise() || postcode;
}