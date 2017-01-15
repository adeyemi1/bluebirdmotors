'use strict';

/**
 * @class sails.hooks.utils.errorHandler
 *
 * Error service to handle system wide errors. Both Sails errors
 * and custom api errors
 */

const SystemError = require('../../errors/SystemError'),
    SkError = require('../../errors/SkError');

module.exports = function() {

    /**
     * @method sendErrorFromCode
     *
     *   Example Usage:
     *
     *     sails.hooks.utils.errorHandler.sendErrorFromCode(req, res, err);
     *
     * @param {Object} req request object
     * @param {Object} res response object
     * @param {Error} err The API error
     */
    const sendErrorFromCode = function(req, res, err) {
            err = localiseError(req, err);
            sendError(res, err);
        },

        /**
         * Localise error if it is an SKError
         *
         * @private
         *
         * @param {Object} req The request object
         * @param {Error} code API error code, or an error
         *
         * @throws Rethrows the passed in error, localised if system error
         *
         */
        localiseError = function(req, err) {
            if (isLocalisableError(err)) {
                err.localise(req);
            }
            return err;
        },

        /**
         * Sends error through to the response
         *
         * @private
         *
         * @param {Object} res response object
         * @param {Error} err error object
         */
        sendError = function(res, err) {
            const status = applyErrorStatusToResponse(res, err);

            if (isLocalisableError(err)) {
                res.json(err.toOutput());
            } else {
                sendErrorFromStatusCode(res, err, status);
            }
        },

        /**
         * Send error in the response, method used is determined by the status code
         *
         * @param {Object} res The response
         */
        sendErrorFromStatusCode = function(res, err, status) {
            switch (status) {
                case 403:
                    res.forbidden(err);
                    break;
                case 404:
                    res.notFound(err);
                    break;
                default:
                    if (status >= 400 && status < 500) {
                        res.badRequest(err);
                    } else {
                        res.serverError(err);
                    }
                    break;
            }
        },

        /**
         * Get the error status code and apply it to the
         * response. If there error has no status then 500 is used as a default
         *
         * @param {Object} res The response
         * @param {Error} err The error
         */
        applyErrorStatusToResponse = function(res, err) {
            const status = err.status || 500;
            res.status(status);
            return res;
        },

        /**
         * Is the error a localisable error
         *
         * @param {Error} err The error
         *
         * @return {Boolean} Is the error a system error (an error that we can localise)
         */
        isLocalisableError = function(err) {
            return (err instanceof SystemError || err instanceof SkError);
        },

        /**
         * Get a single parameter function for throwing errors from the the req and res
         *
         * @param {Object} req The request object
         * @param {Object} res The response object
         *
         * @return {Function} Error handling function that takes an error as its only parameter
         */
        getErrorHandlerFn = function(req, res) {
            return _.partial(sendErrorFromCode, req, res);
        };

    return {
        /**
         * @method sendErrorFromCode
         *
         *   Example Usage:
         *
         *     sails.hooks.utils.errorHandler.sendErrorFromCode(req, res, error);
         *
         * @param {Object} req request object
         * @param {Object} res response object
         * @param {Error} error API error code
         */
        sendErrorFromCode: sendErrorFromCode,

        /**
         * Get a single parameter function for throwing errors from the the req and res
         *
         * @param {Object} req The request object
         * @param {Object} res The response object
         *
         * @return {Function} Error handling function that takes an error as its only parameter
         */
        getErrorHandlerFn: getErrorHandlerFn
    };
}();