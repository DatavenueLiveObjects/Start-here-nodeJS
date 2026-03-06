/**
 * Utility functions for device simulation
 */
/*jshint esversion: 11 */

/**
 * Sleep for a specified duration
 * @param {number} ms - milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = ms => new Promise((resolve) => setTimeout(resolve, ms));

// Exports
module.exports = {
    sleep
};
