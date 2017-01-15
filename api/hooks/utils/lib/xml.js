'use strict';

/**
 * @class sails.hooks.utils.xml
 *
 * Object utility methods.
 */
var parser = require('xml2js-promise');

module.exports = {
    /*
     *	Takes valid xml and returns a json object
     *	@param xml 	The xml to convert
     */
    xmlToJson: function(xml) {
        return parser(xml)
            .catch(function() {
                sails.hooks.log.warn('UtilsXMLService xmlToJson error, could not convert xml to json');
            });
    }
};