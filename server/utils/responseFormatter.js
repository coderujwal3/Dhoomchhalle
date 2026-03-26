/**
 * Standardized response formatter for all API responses
 * @param {Boolean} success - Whether the request was successful
 * @param {String} message - Response message
 * @param {*} data - Response data (can be null)
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} Formatted response object
 */
function responseFormatter(success, message, data = null, statusCode = 200) {
    return {
        success,
        message,
        data,
        statusCode,
        timestamp: new Date().toISOString(),
    };
}

module.exports = {
    responseFormatter,
};
