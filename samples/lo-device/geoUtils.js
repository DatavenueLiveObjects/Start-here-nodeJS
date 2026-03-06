/**
 * Geographic utilities for device geolocation
 * - Region definitions for Europe, France, Île-de-France, and Lyon
 * - Validation functions for region definitions
 * - Random geolocation generation within region bounds
 */
/*jshint esversion: 6 */

// Region definitions
const regionEurope = {
    name: 'Europe',
    geoBounds: [
        [50.513427, -3.691406],
        [41.508577, 27.597656],
    ]
};

const regionFrance = {
    name: 'France',
    geoBounds: [
        [49.296472, -1.911621],
        [43.452919, 7.44873],
    ]
};

const regionIdf = {
    name: 'Idf',
    geoBounds: [
        [48.945955, 2.146454],
        [48.665571, 2.528229],
    ]
};

const regionLyon = {
    name: 'Lyon',
    geoBounds: [
        [45.794818, 4.774228],
        [45.673563, 4.950331],
    ]
};

/**
 * Validate a region definition
 * @param {{name: string, geoBounds: number[][]}} region - geolocation definition with name and geoBounds
 * @returns {{name: string, geoBounds: number[][]}} the validated region
 */
const validRegion = region => {
    const {'name': regionName, geoBounds } = region;
    if (
        geoBounds.length !== 2 ||
        geoBounds[0].length !== 2 ||
        geoBounds[1].length !== 2 ||
        'number' !== typeof geoBounds[0][0] ||
        'number' !== typeof geoBounds[0][1] ||
        'number' !== typeof geoBounds[1][0] ||
        'number' !== typeof geoBounds[1][1]
    ) {
        throw new Error(
            'region.geoBounds input must be a square of locations in which the device will be localized'
        );
    }
    if (!regionName) {
        throw new Error(
            'region.name input must be a human friendly name of the region'
        );
    }
    return region;
};

/**
 * Generate a random location within the specified region bounds
 * @param {{name: string, geoBounds: number[][]}} region - region definition with geoBounds (see validRegion)
 * @returns {number[]} [latitude, longitude] coordinates within the region
 */
const randomLocationIn = region => {
    const { geoBounds } = validRegion(region);
    return [
        geoBounds[1][0] + (geoBounds[0][0] - geoBounds[1][0]) * Math.random(),
        geoBounds[0][1] + (geoBounds[1][1] - geoBounds[0][1]) * Math.random(),
    ];
};

// Exports
module.exports = {
    regionEurope,
    regionFrance,
    regionIdf,
    regionLyon,
    validRegion,
    randomLocationIn
};
