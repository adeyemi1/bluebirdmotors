/**
 * @class sails.hooks.utils.policy
 *
 * Utility class for helper functions for policies
 */


module.exports = {
    matchesApiKey
};

/**
 * Policy that check if the api key in the request matches the api key passed in as the first argument
 *
 * @param {String|String[]} apiKeys The api key we are checking the request api key against, if many specified next will be called if one of the api keys match
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The callback function to call if the api keys match
 */
function matchesApiKey(apiKeys, req, res, next) {
    try {

        apiKeys = sails.hooks.utils.array.toArray(apiKeys);

        if (sails.hooks.utils.environment.isTestEnvironment() || _.includes(apiKeys, req.get('apikey'))) {
            return next();
        }

        throw new sails.hooks.errors.SkError('API_UNAUTHORISED');

    } catch (err) {
        res.negotiate(err);
    }
}