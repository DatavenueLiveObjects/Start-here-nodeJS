/**
 * File utilities for reading and loading resources
 */
/*jshint esversion: 11 */

const fs = require('fs');

/**
 * Read a file synchronously
 * @param {string} filePath - Path to the file (relative or absolute)
 * @returns {string} The file content as string
 */
const readFileSync = (filePath) => {
    const finalPath = filePath.startsWith('./') ?
        __dirname + '/../' + filePath.substring(2) :
        filePath;
    return fs.readFileSync(finalPath, 'utf8');
};

/**
 * Load and parse a JSON file
 * @param {string} jsonFilePath - Path to the JSON file
 * @returns {object} The parsed JSON object
 */
const loadJsonFile = (jsonFilePath) => {
    const fileContent = readFileSync(jsonFilePath);
    return JSON.parse(fileContent);
};

// Exports
module.exports = {
    readFileSync,
    loadJsonFile
};
