'use strict';

const geolib = require('geolib');

/**
 * @class sails.hooks.utils.geo
 *
 * Geo utility methods.
 */
module.exports = {

    /**
     * Get distance in miles between 2 locations
     * @param  {Object} location1 Location with latitude and longitude
     * @param  {Object} location2 Location with latitude and longitude
     * @return {Number} distance in miles
     */
    milesBetween: function(location1, location2) {
        return this.metresToMiles(geolib.getDistance(location1, location2));
    },

    /**
     * Convert metres to miles
     * @param  {Number} metres
     * @return {Number} miles
     */
    metresToMiles: function(metres) {
        return metres * 0.000621371;
    }
};