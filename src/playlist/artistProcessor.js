const { from, lastValueFrom, forkJoin } = require("rxjs");
const { getArtistTopTracks } = require("./spotify");
const logger = require('../logger/logger');

async function processArtists(artistNames, accessToken) {
    const artistsTopTracks$ = artistNames.map(async (artistName) => {
        logger.debug(`Fetching top tracks for ${artistName}:`);
        const topTracks = await getArtistTopTracks(artistName, accessToken);
        return topTracks;
    });

    const allTopTracks = await lastValueFrom(forkJoin(artistsTopTracks$));
    return allTopTracks.flat();
}


const getRandomTracks = (tracks, limit = 10) => {
    const shuffledTracks = tracks.sort(() => 0.5 - Math.random());
    return shuffledTracks.slice(0, limit);
}

module.exports = {
    processArtists,
    getRandomTracks
};
