'use strict';

/**
 * @class sails.hooks.utils.request
 *
 * URL request methods.
 */

var Promise = require('bluebird');

module.exports = {

    /**
     * Return JSON from the specified URL
     *
     * @param {String} url The URL to call
     * @param {Number} port The port
     * @param {Number} [timeout] The timeout to set
     * @return {Object} Promise The content returned from the URL.
     *
     */
    getURL: function(url, port, timeout) {
        return new Promise(function(resolve, fail) {
            if (!port) {
                port = sails.config.port;
            }

            var request = require('request-promise'),
                options = {
                    uri: url,
                    method: 'GET',
                    port: port,
                    timeout: timeout || 0 // unlimited
                };

            sails.hooks.log.verbose('getURL', 'Calling ' + url);
            request(options)
                .then(function(response) {
                    resolve(response);
                })
                .catch(function(err) {
                    if (err.error && err.error !== undefined && err.error.length > 0) {
                        sails.hooks.log.error('getURL - ' + url, err.error, err);
                    } else {
                        sails.hooks.log.error('getURL - ' + url, 'Unknown Error', err);
                    }
                    fail(err);
                });
        });
    },

    /**
     * Post to the specified URL
     *
     * @param {String} url The URL to call
     * @param {Object} data The data to post
     * @param {Number} port The port number
     * @param {Number} [timeout] The timeout to set
     *
     * @return {Object} Promise The content returned from the URL.
     *
     */
    postURL: function(url, data, port, timeout) {
        return new Promise(function(resolve, fail) {

            if (!port) {
                port = sails.config.port;
            }

            var request = require('request-promise'),
                options = {
                    uri: url,
                    method: 'POST',
                    body: JSON.stringify(data),
                    port: port,
                    timeout: timeout || 0 // unlimited
                };

            sails.hooks.log.info('postURL', 'Calling ' + url);
            request(options)
                .then(function(response) {
                    resolve(response);
                })
                .catch(function(err) {
                    sails.hooks.log.error('postURL', 'failed calling ' + url, err);
                    resolve();
                });
        });
    },

    /**
     * Send POST requests to the passed endpoint at the configured concurrency level
     * Takes an array of POST bodies or any number of POST bodies as second param i.e.
     *
     *     sendConcurrentPosts('/api/test', [{name: Tom}, {name: Dick}, {name: Harry}]);
     *
     * is equivalent to
     *
     *     sendConcurrentPosts('/api/test', {name: Tom}, {name: Dick}, {name: Harry});
     *
     * @param {string} endpoint the api endpoint to call, appended to the configure baseURL
     * @param {array/object} bodies an array/list of POST bodies to pass
     *
     * @return {Object} Promise Resolves promise if all requests successful, fails with error message if any requests fail.
     *
     */
    sendConcurrentPosts: function(endpoint) {
        var params = Array.prototype.slice.call(arguments, 1),
            promise;

        promise = new Promise(function(resolve, fail) {

            var url;

            if (!endpoint) {
                fail('Missing argument 1: Endpoint not specified');
            }

            if (typeof endpoint !== 'string') {
                fail('TypeError - Argument 1: Endpoint not string');
            }

            if (params[0] instanceof Array) {
                params = params[0];
            }

            url = sails.config.appUrl + endpoint;

            Promise.each(params, function(item) {
                return sails.hooks.utils.request.postURL(url, item);
            }).then(function() {
                sails.hooks.log.info('sendConcurrentPosts', 'Successfully called ' + url);
                resolve();
            }).catch(function(err) {
                sails.hooks.log.error('sendConcurrentPosts', 'failed calling ' + url, err);
                fail(err);
            });
        });

        return promise;
    }
};