/**
 * Data utilities for device telemetry simulation
 * - Generate realistic sensor values with deterministic and random variations
 */
/*jshint esversion: 11 */

/**
 * Generate a random unique identifier
 * @returns {number} A random unique ID
 * @todo Use UUID library instead of Math.random()
 */
const randomUniqueId = () => Math.ceil(Math.random() * 100000000000);

/**
 * Generate a deterministic base value for a sensor based on the device ID.
 * This ensures that each device has consistent but unique baseline values.
 * 
 * @param {string} deviceId - The unique device identifier
 * @param {number} variationRange - The range of variation (+/- from 0)
 * @returns {number} A deterministic offset value for this device
 */
const getDeterministicDeviceOffset = (deviceId, variationRange = 15) => {
    let hash = 0;
    for (let i = 0; i < deviceId.length; i++) {
        hash = (hash << 5) - hash + deviceId.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }
    return (Math.abs(hash) % (variationRange * 2 * 100 + 1)) / 100 - variationRange;
};

/**
 * Generate a random variation to simulate sensor noise or fluctuations.
 * This adds realistic randomness to sensor readings.
 * 
 * @param {number} maxVariation - The maximum variation (+/- from 0)
 * @returns {number} A random variation value
 */
const getRandomVariation = (maxVariation = 2) => {
    return Math.round((Math.random() * 2 - 1) * maxVariation * 100) / 100;
};

/**
 * Generate a simulated temperature value for a device.
 * Combines a device-specific baseline with random fluctuations.
 * 
 * @param {string} deviceId - The unique device identifier
 * @param {number} baseTemperature - The base temperature value (default: 12.75°C)
 * @param {number} deviceVariation - Range of device-specific offset (default: ±15°C)
 * @param {number} randomFluctuation - Range of random noise (default: ±1°C)
 * @returns {number} The simulated temperature value
 */
const generateTemperature = (deviceId, baseTemperature = 12.75, deviceVariation = 15, randomFluctuation = 1) => {
    const deviceOffset = getDeterministicDeviceOffset(deviceId, deviceVariation);
    const randomNoise = getRandomVariation(randomFluctuation);
    return baseTemperature + deviceOffset + randomNoise;
};

/**
 * Generate a simulated humidity value for a device.
 * Combines a device-specific baseline with random fluctuations.
 * 
 * @param {string} deviceId - The unique device identifier
 * @param {number} baseHumidity - The base humidity value (default: 62.1%)
 * @param {number} deviceVariation - Range of device-specific offset (default: ±15%)
 * @param {number} randomFluctuation - Range of random noise (default: ±1%)
 * @returns {number} The simulated humidity value
 */
const generateHumidity = (deviceId, baseHumidity = 62.1, deviceVariation = 15, randomFluctuation = 1) => {
    const deviceOffset = getDeterministicDeviceOffset(deviceId, deviceVariation);
    const randomNoise = getRandomVariation(randomFluctuation);
    return baseHumidity + deviceOffset + randomNoise;
};

// Exports
module.exports = {
    randomUniqueId,
    getDeterministicDeviceOffset,
    getRandomVariation,
    generateTemperature,
    generateHumidity
};
