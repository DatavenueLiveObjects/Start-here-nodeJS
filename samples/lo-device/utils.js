/**
 * Utility functions for device simulation
 */
/*jshint esversion: 6 */

/**
 * Sleep for a specified duration
 * @param {number} ms - milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = ms => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a random unique identifier
 * @returns {number} A random unique ID
 * @todo Use UUID library instead of Math.random()
 */
const randomUniqueId = () => Math.ceil(Math.random() * 100000000000);

// Exports
module.exports = {
    sleep,
    randomUniqueId
};
