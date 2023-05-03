const { lastValueFrom, forkJoin } = require("rxjs");
const { getArtistTopTracks } = require("../spotify/spotify-api");
const logger = require('../logger/logger');

async function getTracksByArtists(artistNames, accessToken) {
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

async function getTracksForPlaylist(artistNames, accessToken) {
    const topTracks = await getTracksByArtists(artistNames, accessToken);

    logger.debug(`About to randomize ${topTracks.length} tracks`)
    logger.debug(`Tracks ${topTracks}`);

    logger.info(`Total hearted tracks from given artists ${topTracks.length}`);

    return getRandomTracks(topTracks, 10 * artistNames.length);
}

module.exports = {
    getTracksForPlaylist
};
